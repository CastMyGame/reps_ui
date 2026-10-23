import { get } from "./api";
import {
  renewSession,
  checkSessionExpiration,
  rejectAuthenticationFailure,
} from "./session";
jest.mock("../jsonData", () => ({ baseUrl: "http://127.0.0.1:1" }));
const originalLocation = window.location;
const oldFetch = global.fetch;
const fetchMock = jest.fn() as jest.Mock<any>;
const jwt = (expires: number) =>
  `synthetic.${btoa(JSON.stringify({ exp: expires }))}.signature`;
beforeEach(() => {
  sessionStorage.clear();
  jest.clearAllMocks();
  global.fetch = fetchMock as any;
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { href: "" },
  });
  sessionStorage.setItem("Authorization", "synthetic-old");
  sessionStorage.setItem("email", "teacher@example.test");
});
afterEach(() => {
  global.fetch = oldFetch;
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
});
test("GET 403 is an authorization error without refresh, logout or replay", async () => {
  fetchMock.mockResolvedValue({ status: 403, ok: false });
  await expect(get("protected")).rejects.toMatchObject({
    response: { status: 403 },
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(sessionStorage.getItem("Authorization")).toBe("synthetic-old");
  expect(window.location.href).toBe("");
});
test("GET 401 requires login without attempting to renew a rejected token", async () => {
  fetchMock.mockResolvedValue({ status: 401, ok: false });
  await expect(get("protected")).rejects.toMatchObject({
    response: { status: 401 },
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(sessionStorage.getItem("Authorization")).toBeNull();
  expect(window.location.href).toBe("/login");
});
test.each([403, 503])(
  "renewal HTTP %s preserves the session",
  async (status) => {
    fetchMock.mockResolvedValue({ status, ok: false });
    await expect(renewSession()).rejects.toMatchObject({
      response: { status },
    });
    expect(sessionStorage.getItem("Authorization")).toBe("synthetic-old");
    expect(window.location.href).toBe("");
  },
);
test("renewal 401 expires the session", async () => {
  fetchMock.mockResolvedValue({ status: 401, ok: false });
  await expect(renewSession()).rejects.toBeDefined();
  expect(sessionStorage.getItem("Authorization")).toBeNull();
});
test("concurrent renewal is single flight", async () => {
  let finish!: (value: any) => void;
  fetchMock.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const first = renewSession(),
    second = renewSession();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  finish({ ok: true, json: async () => ({ newToken: "synthetic-new" }) });
  expect(await first).toBe("synthetic-new");
  expect(await second).toBe("synthetic-new");
});
test("late renewal cannot restore a logged-out session", async () => {
  let finish!: (value: any) => void;
  fetchMock.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const pending = renewSession();
  sessionStorage.clear();
  finish({ ok: true, json: async () => ({ newToken: "synthetic-new" }) });
  await expect(pending).rejects.toBeDefined();
  expect(sessionStorage.getItem("Authorization")).toBeNull();
});
test("late GET 401 for a replaced token retries only the safe read", async () => {
  fetchMock
    .mockImplementationOnce(async () => {
      sessionStorage.setItem("Authorization", "synthetic-new");
      return { status: 401, ok: false };
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ saved: true }) });
  expect(await get("protected")).toEqual({ saved: true });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(window.location.href).toBe("");
});
test("expired token is not sent for renewal", async () => {
  sessionStorage.setItem(
    "Authorization",
    jwt(Math.floor(Date.now() / 1000) - 10),
  );
  await expect(checkSessionExpiration()).rejects.toBeDefined();
  expect(fetchMock).not.toHaveBeenCalled();
  expect(window.location.href).toBe("/login");
});
test("active near-expiry token renews before expiration", async () => {
  sessionStorage.setItem(
    "Authorization",
    jwt(Math.floor(Date.now() / 1000) + 90),
  );
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ newToken: "synthetic-new" }),
  });
  await checkSessionExpiration();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(sessionStorage.getItem("Authorization")).toBe("synthetic-new");
});
test("network failure during renewal does not clear authentication", async () => {
  fetchMock.mockRejectedValue(new Error("synthetic network failure"));
  await expect(renewSession()).rejects.toBeDefined();
  expect(sessionStorage.getItem("Authorization")).toBe("synthetic-old");
});
test.each([401, 403])("Axios HTTP %s never replays writes", async (status) => {
  const failure = {
    response: { status },
    config: {
      method: "post",
      headers: { Authorization: "Bearer synthetic-old" },
    },
  };
  await expect(rejectAuthenticationFailure(failure)).rejects.toBe(failure);
  expect(fetchMock).not.toHaveBeenCalled();
  expect(sessionStorage.getItem("Authorization")).toBe(
    status === 401 ? null : "synthetic-old",
  );
});
test("Axios stale-token 401 does not invalidate a replacement session", async () => {
  sessionStorage.setItem("Authorization", "synthetic-new");
  await expect(
    rejectAuthenticationFailure({
      response: { status: 401 },
      config: { headers: { Authorization: "Bearer synthetic-old" } },
    }),
  ).rejects.toBeDefined();
  expect(sessionStorage.getItem("Authorization")).toBe("synthetic-new");
});

test("GET 401 waits for a pending renewal before deciding whether to expire", async () => {
  let finish!: (value: any) => void;
  fetchMock
    .mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    )
    .mockResolvedValueOnce({ ok: false, status: 401 })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ saved: true }) });
  const renewal = renewSession();
  const read = get("protected");
  finish({ ok: true, json: async () => ({ newToken: "synthetic-new" }) });
  await renewal;
  expect(await read).toEqual({ saved: true });
  expect(sessionStorage.getItem("Authorization")).toBe("synthetic-new");
  expect(window.location.href).toBe("");
});
