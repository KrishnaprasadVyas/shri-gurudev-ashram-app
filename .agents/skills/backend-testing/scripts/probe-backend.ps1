# Probe Backend Server Health and Database Status

param (
    [string]$BaseUrl = "http://localhost:3000",
    [int]$TimeoutSec = 3
)

Write-Host "Probing backend server at $BaseUrl/health..." -ForegroundColor Cyan

$portInUse = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

if (-not $portInUse) {
    Write-Host "Warning: Port 3000 is not currently listening." -ForegroundColor Yellow
}

try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -TimeoutSec $TimeoutSec
    Write-Host "Backend Health Response:" -ForegroundColor Green
    $res | ConvertTo-Json -Depth 5 | Write-Host
    exit 0
} catch {
    Write-Host "Failed to connect to backend: $_" -ForegroundColor Red
    exit 1
}
