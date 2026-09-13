# Check Android Logcat for Fatal Exceptions and React Native Logs

$devicesOutput = & adb devices
$hasDevice = ($devicesOutput -split "`r?`n" | Where-Object { $_ -match "\tdevice$" })

if (-not $hasDevice) {
    Write-Host "No active Android device found via adb. Skipping logcat inspection." -ForegroundColor Yellow
    exit 0
}

Write-Host "Reading last 60 lines of React Native & Runtime Logcat..." -ForegroundColor Cyan
& adb logcat -d -s ReactNative:V ReactNativeJS:V AndroidRuntime:E | Select-Object -Last 60
