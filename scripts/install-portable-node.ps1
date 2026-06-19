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

if (Test-Path $nodeExe) {
  Write-Host "Node already installed: $nodeExe"
  & $nodeExe --version
  exit 0
}

New-Item -ItemType Directory -Path $InstallRoot -Force | Out-Null

$zipName = "node-v$Version-win-$arch.zip"
$zipPath = Join-Path $InstallRoot $zipName
$url = "https://nodejs.org/dist/v$Version/$zipName"

Write-Host "Downloading $url"
Invoke-WebRequest -Uri $url -OutFile $zipPath

Write-Host "Extracting $zipPath"
Expand-Archive -Path $zipPath -DestinationPath $InstallRoot -Force

Remove-Item -Path $zipPath -Force

Write-Host "Installed portable Node:"
& $nodeExe --version
& (Join-Path $nodeDir "npm.cmd") --version
Write-Host ""
Write-Host "Use it in this project with:"
Write-Host ".\scripts\use-portable-node.ps1"
