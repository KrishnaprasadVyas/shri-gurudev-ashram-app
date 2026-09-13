# Automated Full Validation Suite for Shri Gurudev Ashram App
# Executes all non-interactive validation gates sequentially.

$ErrorActionPreference = "Stop"
$sw = [System.Diagnostics.Stopwatch]::StartNew()

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting Full Autonomous Validation Pipeline" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$results = [ordered]@{}

# 1. Frontend Typecheck
Write-Host "`n[Gate 1/6] Running Frontend Typecheck (tsc --noEmit)..." -ForegroundColor Yellow
try {
    & npm run typecheck
    if ($LASTEXITCODE -ne 0) { throw "Frontend typecheck failed with exit code $LASTEXITCODE" }
    $results["Frontend Typecheck"] = "PASS"
    Write-Host "[OK] Frontend Typecheck Passed" -ForegroundColor Green
} catch {
    $results["Frontend Typecheck"] = "FAIL: $_"
    Write-Host "[FAIL] Frontend Typecheck Failed" -ForegroundColor Red
}

# 2. Backend Typecheck
Write-Host "`n[Gate 2/6] Running Backend Typecheck (tsc --noEmit)..." -ForegroundColor Yellow
try {
    & npx --prefix backend tsc --noEmit
    if ($LASTEXITCODE -ne 0) { throw "Backend typecheck failed with exit code $LASTEXITCODE" }
    $results["Backend Typecheck"] = "PASS"
    Write-Host "[OK] Backend Typecheck Passed" -ForegroundColor Green
} catch {
    $results["Backend Typecheck"] = "FAIL: $_"
    Write-Host "[FAIL] Backend Typecheck Failed" -ForegroundColor Red
}

# 3. Frontend Lint
Write-Host "`n[Gate 3/6] Running Frontend Linter (eslint .)..." -ForegroundColor Yellow
try {
    & npm run lint
    if ($LASTEXITCODE -ne 0) { throw "Frontend lint failed with exit code $LASTEXITCODE" }
    $results["Frontend Lint"] = "PASS"
    Write-Host "[OK] Frontend Lint Passed" -ForegroundColor Green
} catch {
    $results["Frontend Lint"] = "FAIL: $_"
    Write-Host "[FAIL] Frontend Lint Failed" -ForegroundColor Red
}

# 4. Frontend Automated Tests
Write-Host "`n[Gate 4/6] Running Frontend Unit Tests (jest)..." -ForegroundColor Yellow
try {
    & npm run test
    if ($LASTEXITCODE -ne 0) { throw "Frontend tests failed with exit code $LASTEXITCODE" }
    $results["Frontend Tests"] = "PASS"
    Write-Host "[OK] Frontend Unit Tests Passed" -ForegroundColor Green
} catch {
    $results["Frontend Tests"] = "FAIL: $_"
    Write-Host "[FAIL] Frontend Unit Tests Failed" -ForegroundColor Red
}

# 5. Backend Automated Tests
Write-Host "`n[Gate 5/6] Running Backend Unit Tests (jest)..." -ForegroundColor Yellow
try {
    Push-Location backend
    & node --env-file=.env ../node_modules/jest/bin/jest.js
    if ($LASTEXITCODE -ne 0) { throw "Backend tests failed with exit code $LASTEXITCODE" }
    $results["Backend Tests"] = "PASS"
    Write-Host "[OK] Backend Unit Tests Passed" -ForegroundColor Green
} catch {
    $results["Backend Tests"] = "FAIL: $_"
    Write-Host "[FAIL] Backend Unit Tests Failed" -ForegroundColor Red
} finally {
    Pop-Location
}

# 6. Expo Android Metro Export Check
Write-Host "`n[Gate 6/7] Running Metro Android Bundle Export Check..." -ForegroundColor Yellow
try {
    & npx expo export --platform android --no-bytecode
    if ($LASTEXITCODE -ne 0) { throw "Metro export failed with exit code $LASTEXITCODE" }
    $results["Metro Android Export"] = "PASS"
    Write-Host "[OK] Metro Android Bundle Export Passed" -ForegroundColor Green
} catch {
    $results["Metro Android Export"] = "FAIL: $_"
    Write-Host "[FAIL] Metro Android Bundle Export Failed" -ForegroundColor Red
}

# 7. Android Mobile Runtime & UI Verification
Write-Host "`n[Gate 7/7] Running Android Runtime & UI Automation Tests..." -ForegroundColor Yellow
try {
    $runtimeOutput = & powershell -ExecutionPolicy Bypass -File .agents/skills/android-testing/scripts/run-runtime-tests.ps1
    $runtimeExit = $LASTEXITCODE
    Write-Host ($runtimeOutput -join "`n")
    if ($runtimeExit -ne 0) {
        throw "Android runtime tests failed with exit code $runtimeExit"
    }
    if ($runtimeOutput -match "\[SKIP\]") {
        $results["Android Runtime Tests"] = "SKIPPED"
        Write-Host "[SKIP] Android Runtime Tests Skipped (no device/emulator attached)" -ForegroundColor Yellow
    } else {
        $results["Android Runtime Tests"] = "PASS"
        Write-Host "[OK] Android Runtime Tests Passed" -ForegroundColor Green
    }
} catch {
    $results["Android Runtime Tests"] = "FAIL: $_"
    Write-Host "[FAIL] Android Runtime Tests Failed" -ForegroundColor Red
}

# Summary Report
$sw.Stop()
Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "Autonomous Validation Summary (${sw.Elapsed.TotalSeconds.ToString('0.0')}s elapsed)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$allPassed = $true
foreach ($key in $results.Keys) {
    $status = $results[$key]
    if ($status -eq "PASS") {
        Write-Host " [PASS] $key" -ForegroundColor Green
    } elseif ($status -eq "SKIPPED") {
        Write-Host " [SKIPPED] $key" -ForegroundColor Yellow
    } else {
        Write-Host " [FAIL] $key - $status" -ForegroundColor Red
        $allPassed = $false
    }
}

if (-not $allPassed) {
    Write-Host "`nPipeline Status: FAILED. Address errors above before completing task." -ForegroundColor Red
    exit 1
} else {
    Write-Host "`nPipeline Status: ALL GATES PASSED." -ForegroundColor Green
    exit 0
}
