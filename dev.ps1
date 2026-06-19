$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
Push-Location $repoRoot
try {
  & (Join-Path $repoRoot "scripts\npm-portable.ps1") run dev
  exit $LASTEXITCODE
}
finally {
  Pop-Location
}
