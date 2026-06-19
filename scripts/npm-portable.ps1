$ErrorActionPreference = "Stop"

$Version = "22.12.0"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$InstallRoot = Join-Path $RepoRoot ".tools"
$NpmArgs = $args

$arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
$nodeDir = Join-Path $InstallRoot "node-v$Version-win-$arch"
$nodeExe = Join-Path $nodeDir "node.exe"
$npmCmd = Join-Path $nodeDir "npm.cmd"

if (-not (Test-Path $nodeExe)) {
  Write-Error "Portable Node was not found at $nodeExe. Run .\scripts\install-portable-node.ps1 first."
}

$resolvedNodeDir = (Resolve-Path $nodeDir).Path
$env:PATH = "$resolvedNodeDir;$env:PATH"

& $npmCmd @NpmArgs
exit $LASTEXITCODE
