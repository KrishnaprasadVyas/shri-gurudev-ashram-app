---
name: android-testing
description: >-
  Automated Android mobile testing and build verification for shri-gurudev-ashram-app.
  Use when working on React Native screens, Expo Router navigation, native modules, assets,
  or mobile UI to verify Metro bundle exports, detect Android emulators or connected devices
  via adb, launch app flows, and inspect logcat for runtime crashes.
---

# Android Mobile Testing & Runtime UI Skill

This skill provides step-by-step procedures to detect, build, install, launch, and test the React Native application on Android emulators and physical devices without manual user interaction.

---

## 1. Quick Runtime UI Verification Command

Run the full automated on-device test suite:

```powershell
npm run test:android:runtime
```
*(Or execute directly: `powershell -ExecutionPolicy Bypass -File .agents/skills/android-testing/scripts/run-runtime-tests.ps1`)*

### What this script executes automatically:
1. **Tooling & Device Detection:**
   - Detects `adb.exe` and `emulator.exe`.
   - If no device is attached, but `Pixel_8` AVD exists, automatically launches `emulator -avd Pixel_8 -no-audio -no-boot-anim` and polls `sys.boot_completed` until ready.
   - If no emulator or device can be started, cleanly exits with `[SKIP]` without breaking CI/validation pipelines.
2. **Architecture Matching & APK Packaging:**
   - Detects the target device ABI (e.g. `x86_64` for emulators, `arm64-v8a` for physical hardware).
   - Verifies whether a matching standalone release APK exists at `android/app/build/outputs/apk/release/app-release.apk`.
   - If missing or outdated, automatically runs:
     ```powershell
     cd android && .\gradlew assembleRelease -PreactNativeArchitectures=<deviceAbi>
     ```
3. **Automated Installation & Launch:**
   - Installs APK via `adb install -r`.
   - Clears logcat buffers (`adb logcat -c`).
   - Launches `com.shrigurudevashram.app/.MainActivity`.
4. **Autonomous Screen Flow Exercising:**
   - **Home Screen:** Asserts presence of Ashram header, navigation cards, and bottom tab bar (`Home`, `Yatra`, `Alerts`, `Profile`).
   - **Donation Screen:** Navigates via deep link `shri-gurudev-ashram-app://donation`, verifies progress bar and headers, exercises live form validation by tapping `Continue`, confirms validation alert dialog appears ("Please select a donation cause."), and dismisses it via OK tap.
   - **Donation History Screen:** Navigates via deep link `shri-gurudev-ashram-app://donation-history`, verifies "Total Contributions" and empty state rendering.
   - **Protected Route Gate:** Navigates to `shri-gurudev-ashram-app://collector-apply`, verifies the auth guard displays the Phone Authentication screen with "Send OTP".
5. **Logcat Crash & Red-Screen Audit:**
   - Queries logcat for `AndroidRuntime:E`, `ReactNative:E`, and unhandled JS exceptions after every step.
   - Throws clear actionable errors if any fatal crash or red-screen is encountered.

---

## 2. Low-Level Diagnostics & Automation Recipes

### A. Environment Inspection
```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/android-testing/scripts/check-android-env.ps1
```

### B. Static Bundle Export Check
```powershell
npm run export:android
# Or: npx expo export --platform android --no-bytecode
```

### C. Dumping Rendered Screen Hierarchy
To inspect what is currently visible on the device screen:
```powershell
adb shell "uiautomator dump /data/local/tmp/uidump.xml >/dev/null 2>&1"
adb shell cat /data/local/tmp/uidump.xml
```

To extract all visible text nodes:
```powershell
adb shell cat /data/local/tmp/uidump.xml | Select-String -Pattern 'text="([^"]+)"' -AllMatches | ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value } | Where-Object { $_ -ne "" }
```

### D. Simulating User Inputs
```powershell
# Tap at specific coordinates (e.g. Continue button)
adb shell input tap 540 1909

# Back button / dismiss alert
adb shell input keyevent 4

# Type text into focused input
adb shell input text "9876543210"
```

### E. Capturing Screen Evidence
```powershell
adb shell screencap -p /data/local/tmp/screen.png
adb pull /data/local/tmp/screen.png artifacts/runtime_screen.png
```

### F. Checking for Runtime Crashes in Logcat
```powershell
adb logcat -d -s ReactNative:E ReactNativeJS:E AndroidRuntime:E
```

---

## 3. Failure Recovery Protocol

When an Android runtime test fails:
1. **DSO / Native Library Errors (`SoLoaderDSONotFoundError`):**
   - Verify the APK was built with the device's exact ABI (`ro.product.cpu.abi`).
   - If target is x86_64 emulator, build with `-PreactNativeArchitectures=x86_64`.
2. **Red-Screen / Unhandled JS Exception:**
   - Locate the exact stack trace in logcat under `ReactNativeJS:E`.
   - Identify the offending component or hook.
   - Edit the source code, run `npm run typecheck`, re-export or reinstall, and rerun `npm run test:android:runtime`.
3. **UI Element Missing from Screen:**
   - Check `uiautomator dump` XML to see if the screen is stuck in a loading state, network timeout, or error boundary.
   - Verify that any backend dependencies or mocks are active.
