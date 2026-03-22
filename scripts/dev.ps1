# 백엔드·프론트를 각각 새 PowerShell 창에서 실행합니다.
# 사용: 프로젝트 루트에서  .\scripts\dev.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

if (-not (Test-Path (Join-Path $backend "app\main.py"))) {
    Write-Error "backend\app\main.py 를 찾을 수 없습니다. scripts 폴더 기준 상위가 프로젝트 루트인지 확인하세요."
}

Write-Host "Root: $root" -ForegroundColor Cyan
Write-Host "Starting backend (uvicorn) and frontend (Vite) in new windows..." -ForegroundColor Cyan

$cmdBack = "Set-Location '$backend'; Write-Host '=== BACKEND ===' -ForegroundColor Green; python -m uvicorn app.main:app --reload --host 0.0.0.0"
Start-Process powershell -ArgumentList @("-NoExit", "-Command", $cmdBack)

$cmdFront = "Set-Location '$frontend'; Write-Host '=== FRONTEND ===' -ForegroundColor Green; npm run dev"
Start-Process powershell -ArgumentList @("-NoExit", "-Command", $cmdFront)

Write-Host "Done. Close each window to stop the server." -ForegroundColor Yellow
