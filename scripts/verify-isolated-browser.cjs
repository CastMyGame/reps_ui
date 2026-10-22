// Uses the already-installed Playwright package and installed Chrome; downloads nothing.
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { chromium } = require(process.env.REPS_PLAYWRIGHT_MODULE);
const artifacts = path.resolve(__dirname, '../../verification-frontend/isolated');
const session = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../backend/target/isolated-ui-session.json'), 'utf8'));
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.REPS_TEST_BROWSER_EXECUTABLE || undefined, headless: true,
    args: ['--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-first-run'],
  });
  let checks = 0, mockedGoogle = 0, blockedExternal = 0;
  const context = await browser.newContext({ serviceWorkers: 'block' });
  try {
    const login = await context.request.post('http://127.0.0.1:18089/auth', {
      data: { username: session.email, password: 'Synthetic-password-only' },
    });
    assert(login.ok());
    const authenticated = await login.json();
    assert(authenticated.response && !authenticated.response.startsWith('Error'));
    session.Authorization = authenticated.response; checks++;
    const headers = { Authorization: 'Bearer ' + session.Authorization };
    const status = await (await context.request.get(session.baseUrl + '/auth/gmail/status', { headers })).json();
    if (status.state !== 'CONNECTED') {
      const browserProof = 'b'.repeat(43);
      const pending = await (await context.request.post(session.baseUrl + '/auth/gmail/connect', { headers, data: { browserProof } })).json();
      const state = new URL(pending.authorizationUrl).searchParams.get('state');
      const completed = await context.request.post(session.baseUrl + '/auth/gmail/complete', { headers, data: { browserProof, state, code: 'synthetic-code' } });
      assert(completed.ok(), 'Synthetic setup connection failed');
    }
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.hostname === 'accounts.google.com') {
        mockedGoogle++;
        return route.fulfill({ contentType: 'text/html', body: '<p>Synthetic Google authorization. No provider contacted.</p>' });
      }
      if (!['localhost', '127.0.0.1'].includes(url.hostname) || !['3000', '18089'].includes(url.port)) {
        blockedExternal++;
        return route.abort('blockedbyclient');
      }
      return route.continue();
    });
    await context.addInitScript(value => {
      if (!['localhost', '127.0.0.1'].includes(location.hostname)) return;
      for (const [key, entry] of Object.entries(value)) if (key !== 'baseUrl') sessionStorage.setItem(key, entry);
    }, session);
    const page = await context.newPage();
    await page.goto('http://localhost:3000/account/gmail', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByText('Connected email: teacher@example.test', { exact: true }).waitFor(); checks++;
    await page.getByRole('button', { name: 'Disconnect Gmail', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm disconnect', exact: true }).click();
    await page.getByText('Gmail disconnected. REPS SMTP selected.', { exact: true }).waitFor(); checks++;
    // A fresh settings mount reads durable backend state rather than an optimistic UI cache.
    await page.goto('http://localhost:3000/account/gmail');
    const authorizationRedirect = page.waitForURL('https://accounts.google.com/**');
    await page.getByRole('button', { name: /^(Connect|Reconnect) Gmail$/ }).click();
    await authorizationRedirect;
    const state = new URL(page.url()).searchParams.get('state');
    await page.goto('http://localhost:3000/account/gmail/callback?state=' + encodeURIComponent(state) + '&code=synthetic-code');
    await page.getByText('Connected email: teacher@example.test', { exact: true }).waitFor();
    assert(mockedGoogle > 0); checks++;
    await page.goto('http://localhost:3000/account/notifications');
    await page.getByText('Required email status', { exact: false }).first().waitFor();
    await page.getByText(/Accepted by provider/).first().waitFor();
    await page.getByText(/Retrying is blocked/).first().waitFor(); checks++;
    const actual = await page.evaluate(async backend => {
      const response = await fetch(backend + '/email/v1/notifications', { headers: { Authorization: 'Bearer ' + sessionStorage.getItem('Authorization') } });
      return response.json();
    }, session.baseUrl);
    const states = actual.cases.flatMap(c => c.notifications.map(n => n.state));
    assert(states.includes('ACCEPTED') && states.includes('UNCERTAIN')); checks++;
    await page.screenshot({ path: path.join(artifacts, 'notification-status.png'), fullPage: true });
    const result = { checksPassed: checks, mockedGoogleNavigations: mockedGoogle, externalRequestsBlocked: blockedExternal, realGoogleRequests: 0, backendStates: [...new Set(states)] };
    fs.writeFileSync(path.join(artifacts, 'browser-results.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
  } finally { await context.close(); await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
