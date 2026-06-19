param(
  [string]$Version = "22.12.0",
  [string]$InstallRoot = ".tools"
)

$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if (-not [System.IO.Path]::IsPathRooted($InstallRoot)) {
  $InstallRoot = Join-Path $RepoRoot $InstallRoot
}

$arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
$nodeDir = Join-Path $InstallRoot "node-v$Version-win-$arch"
$nodeExe = Join-Path $nodeDir "node.exe"
$npmCmd = Join-Path $nodeDir "npm.cmd"

if (-not (Test-Path $nodeExe)) {
  Write-Error "Portable Node was not found at $nodeExe. Run .\scripts\install-portable-node.ps1 first."
}

$resolvedNodeDir = (Resolve-Path $nodeDir).Path
$env:PATH = "$resolvedNodeDir;$env:PATH"

Write-Host "Using Node from $resolvedNodeDir"
& $nodeExe --version
& $npmCmd --version
