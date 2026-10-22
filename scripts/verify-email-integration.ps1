[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path -Parent $PSScriptRoot
# Keep generated test data outside this worktree and the shared dependency directory.
$artifactDirectory = Join-Path (Split-Path -Parent $repositoryRoot) 'verification-frontend'
New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
$previousCI = [Environment]::GetEnvironmentVariable('CI', 'Process')
try {
    $env:CI = 'true'
    Push-Location $repositoryRoot
    try {
        # The explicit glob avoids Jest's Windows escaping issue for hidden parent directories.
        & node node_modules/react-scripts/bin/react-scripts.js test --watchAll=false --runInBand `
            --testMatch '**/src/**/*.{spec,test}.{js,jsx,ts,tsx}' --runTestsByPath `
            src/security/RequiredNotifications.test.tsx src/utils/api/http.test.ts `
            src/security/GmailSettings.test.tsx src/App.test.js `
            src/components/globalComponents/EmailCapabilityIndicator.test.tsx `
            --cacheDirectory="$artifactDirectory/jest-cache"
        if ($LASTEXITCODE -ne 0) { throw 'Isolated frontend email tests failed.' }
        & node node_modules/typescript/bin/tsc --noEmit --incremental false
        if ($LASTEXITCODE -ne 0) { throw 'Frontend TypeScript verification failed.' }
    } finally { Pop-Location }
} finally {
    [Environment]::SetEnvironmentVariable('CI', $previousCI, 'Process')
}
