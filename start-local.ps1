# ==============================================================================
# start-local.ps1 - DuoMath local (localhost) launcher
#
# Boots both halves of the stack for local development:
#   * Backend  : FastAPI  (duosteam/backend/main.py)  -> http://localhost:8000
#   * Frontend : Next.js  (duosteam/frontend)         -> http://localhost:3000
#
# The frontend reads NEXT_PUBLIC_API_URL / NEXT_PUBLIC_BACKEND_URL from
# duosteam/frontend/.env.local, which must point at the backend above.
#
# Usage (from anywhere):
#   powershell -ExecutionPolicy Bypass -File "duosteam\start-local.ps1"
#   powershell -ExecutionPolicy Bypass -File "duosteam\start-local.ps1" -BackendPort 8001
# ==============================================================================

[CmdletBinding()]
param(
    [int]$BackendPort  = 8000,
    [int]$FrontendPort = 3000,
    [switch]$SkipBackend,
    [switch]$SkipFrontend
)

$ErrorActionPreference = "Stop"

$RepoRoot    = $PSScriptRoot
$BackendDir  = Join-Path $RepoRoot "backend"
$FrontendDir = Join-Path $RepoRoot "frontend"
$VenvPython  = Join-Path (Split-Path $RepoRoot -Parent) ".venv\Scripts\python.exe"
$LogDir      = Join-Path $env:TEMP "duomath-logs"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Test-PortInUse([int]$Port) {
    return [bool](Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue)
}

function Start-LoggedProcess {
    param([string]$Name, [string]$FilePath, [string[]]$Arguments, [string]$WorkingDirectory)

    $out = Join-Path $LogDir "$Name.out.log"
    $err = Join-Path $LogDir "$Name.err.log"
    Remove-Item $out, $err -ErrorAction SilentlyContinue

    $proc = Start-Process -FilePath $FilePath `
                          -ArgumentList $Arguments `
                          -WorkingDirectory $WorkingDirectory `
                          -RedirectStandardOutput $out `
                          -RedirectStandardError $err `
                          -PassThru -WindowStyle Hidden

    Write-Host "  $Name started (PID $($proc.Id))" -ForegroundColor DarkGray
    Write-Host "    stdout -> $out" -ForegroundColor DarkGray
    Write-Host "    stderr -> $err" -ForegroundColor DarkGray
    return $proc
}

Write-Host ""
Write-Host "DuoMath - starting local stack" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# -- Backend -------------------------------------------------------------------
if (-not $SkipBackend) {
    if (Test-PortInUse $BackendPort) {
        Write-Host "[backend]  port $BackendPort already in use - skipping start." -ForegroundColor Yellow
    }
    if (-not (Test-PortInUse $BackendPort) -and -not (Test-Path (Join-Path $BackendDir "main.py"))) {
        Write-Host "[backend]  main.py not found at $BackendDir - skipping." -ForegroundColor Yellow
    }
    if (-not (Test-PortInUse $BackendPort) -and (Test-Path (Join-Path $BackendDir "main.py"))) {
        $python = if (Test-Path $VenvPython) { $VenvPython } else { "python" }
        Write-Host "[backend]  launching uvicorn ($python) on port $BackendPort ..."
        Start-LoggedProcess -Name "duomath-backend" -FilePath $python `
            -Arguments @("-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "$BackendPort", "--reload") `
            -WorkingDirectory $BackendDir | Out-Null
    }
}

# -- Frontend ------------------------------------------------------------------
if (-not $SkipFrontend) {
    if (Test-PortInUse $FrontendPort) {
        Write-Host "[frontend] port $FrontendPort already in use - skipping start." -ForegroundColor Yellow
    }
    if (-not (Test-PortInUse $FrontendPort) -and -not (Test-Path (Join-Path $FrontendDir "package.json"))) {
        Write-Host "[frontend] package.json not found at $FrontendDir - skipping." -ForegroundColor Yellow
    }
    if (-not (Test-PortInUse $FrontendPort) -and (Test-Path (Join-Path $FrontendDir "package.json"))) {
        if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
            Write-Host "[frontend] node_modules missing - running 'npm install' first ..." -ForegroundColor Yellow
            Push-Location $FrontendDir; npm install; Pop-Location
        }
        Write-Host "[frontend] launching 'npm run dev' on port $FrontendPort ..."
        Start-LoggedProcess -Name "duomath-frontend" -FilePath "npm.cmd" `
            -Arguments @("run", "dev", "--", "-p", "$FrontendPort") `
            -WorkingDirectory $FrontendDir | Out-Null
    }
}

# -- Wait for health checks ----------------------------------------------------
Write-Host ""
Write-Host "Waiting for services to become reachable ..." -ForegroundColor Cyan

function Wait-ForUrl {
    param([string]$Url, [int]$TimeoutSeconds = 150, [int]$ResponseTimeoutSeconds = 30)
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $r = Invoke-WebRequest -Uri $Url -TimeoutSec $ResponseTimeoutSeconds -UseBasicParsing
            if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { return $true }
        } catch {
            if ($_.Exception.Response) { return $true }
        }
        Start-Sleep -Seconds 2
    }
    return $false
}

$backendOk  = $SkipBackend   -or (Wait-ForUrl "http://localhost:$BackendPort/api/health")
$frontendOk = $SkipFrontend  -or (Wait-ForUrl "http://localhost:$FrontendPort/")

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
if (-not $SkipBackend) {
    $tag = if ($backendOk) { "READY  " } else { "TIMEOUT" }
    $col = if ($backendOk) { "Green" } else { "Red" }
    Write-Host "[backend]  $tag http://localhost:$BackendPort/api/health  (docs: /docs)" -ForegroundColor $col
}
if (-not $SkipFrontend) {
    $tag = if ($frontendOk) { "READY  " } else { "TIMEOUT" }
    $col = if ($frontendOk) { "Green" } else { "Red" }
    Write-Host "[frontend] $tag http://localhost:$FrontendPort" -ForegroundColor $col
}
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open http://localhost:$FrontendPort in your browser." -ForegroundColor White
Write-Host ""
Write-Host "Logs:       $LogDir" -ForegroundColor DarkGray
Write-Host "Stop both:  Get-Process duomath-backend,duomath-frontend -ErrorAction SilentlyContinue | Stop-Process" -ForegroundColor DarkGray
Write-Host "Note:       if you change ports, update duosteam\frontend\.env.local" -ForegroundColor DarkGray
Write-Host "            (NEXT_PUBLIC_API_URL / NEXT_PUBLIC_BACKEND_URL) and restart the frontend." -ForegroundColor DarkGray