$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $root "apps/web")
& ".\node_modules\.bin\next.CMD" start -p 3000 *> (Join-Path $root "dev-server.log")
