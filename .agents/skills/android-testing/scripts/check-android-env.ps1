# Android Environment and Device Detection Script

$androidHome = $env:ANDROID_HOME
$adbCmd = Get-Command adb -ErrorAction SilentlyContinue
$emulatorCmd = Get-Command emulator -ErrorAction SilentlyContinue

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Android Tooling Environment Check" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "ANDROID_HOME: $androidHome"
if ($null -ne $adbCmd) {
    Write-Host "ADB Binary:   $($adbCmd.Path)" -ForegroundColor Green
} else {
    Write-Host "ADB Binary:   NOT FOUND" -ForegroundColor Red
}

if ($null -ne $emulatorCmd) {
    Write-Host "Emulator:     $($emulatorCmd.Path)" -ForegroundColor Green
} else {
    Write-Host "Emulator:     NOT FOUND" -ForegroundColor Red
}

# Check Connected Devices
Write-Host "`n--- Attached Devices (adb devices) ---" -ForegroundColor Yellow
$devicesOutput = & adb devices
Write-Host $devicesOutput

$attachedDevices = ($devicesOutput -split "`r?`n" | Where-Object { $_ -match "\tdevice$" })
$deviceCount = ($attachedDevices | Measure-Object).Count
if ($deviceCount -gt 0) {
    Write-Host "Online Devices Count: $deviceCount" -ForegroundColor Green
} else {
    Write-Host "Online Devices Count: $deviceCount" -ForegroundColor Yellow
}

# Check Available AVDs
Write-Host "`n--- Available Virtual Devices (emulator -list-avds) ---" -ForegroundColor Yellow
$avds = & emulator -list-avds 2>$null
if ($avds) {
    Write-Host ($avds -join "`n") -ForegroundColor Green
} else {
    Write-Host "No AVDs configured or emulator command not accessible." -ForegroundColor Yellow
}

Write-Host "=========================================" -ForegroundColor Cyan
if ($deviceCount -gt 0) {
    Write-Host "STATUS: Active Android device/emulator ready for runtime testing." -ForegroundColor Green
} elseif ($avds) {
    Write-Host "STATUS: AVD available ($($avds -join ', ')), but not currently running." -ForegroundColor Yellow
} else {
    Write-Host "STATUS: No Android device or AVD detected. Mobile validation limited to static Metro bundle export." -ForegroundColor Yellow
}
