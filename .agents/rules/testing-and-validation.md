# Testing and Validation Standards

This rule defines the mandatory validation commands, test coverage scopes, environment probes, and automated verification protocols for `shri-gurudev-ashram-app`.

---

## 1. What MUST Be Tested Automatically

Never ask the user to test manually or verify features if they can be validated programmatically.

| Scope | Automated Testing Requirements |
| :--- | :--- |
| **Frontend UI / Screens** | Typecheck (`tsc --noEmit`), Lint (`eslint .`), Jest component/unit tests, Metro Android export (`npx expo export --platform android --no-bytecode`). |
| **Frontend Utilities & Stores** | Unit tests for Zod schemas, date/phone/Aadhaar formatters, receipt download/share, and Zustand stores (`useAuthStore`, `useBookingDraftStore`, `useSevaStore`). |
| **Backend API Endpoints** | Express routes must be exercised with automated HTTP requests (`Invoke-RestMethod`), validating status codes, JSON response shapes, error contracts, and database side effects. |
| **Authentication & Authorization** | Middleware logic (`authenticateUser`, `authenticateDonationUser`, `authenticateCollector`, `requireRole`) must be verified with valid, expired, and forged tokens. |
| **Financial / Donation Flows** | Razorpay order creation, payment signature verification HMAC SHA256, receipt generation (PDFKit), tokenized receipt links, and cash collection ledger entries. |
| **Database Schemas & Models** | Mongoose schema validation, required fields, enum enforcement (`Donation`, `Collector`, `AnnadanBooking`, `DonationHead`), and Supabase query mocks. |
| **Mobile Compilation & Runtime** | Expo export bundle creation; if Android emulator or device is attached, install/launch and verify no fatal crashes appear in logcat. |

---

## 2. Command Reference Matrix

### Frontend Validation Commands
```powershell
# 1. Typecheck (Root / React Native)
npm run typecheck

# 2. Lint Check (Root)
npm run lint

# 3. Unit & Integration Tests (Root Jest)
npm run test

# 4. Target Specific Test File
npx jest src/__tests__/apiErrors.test.ts --passWithNoTests

# 5. Metro Android Bundle Export Check
npx expo export --platform android --no-bytecode
```

### Backend Validation Commands
```powershell
# 1. Backend Typecheck
npx --prefix backend tsc --noEmit

# 2. Backend Unit & Integration Tests
Push-Location backend; node --env-file=.env ../node_modules/jest/bin/jest.js; Pop-Location

# 3. Start Backend in Background (Task Runner)
npx --prefix backend tsx --env-file=.env ./src/server.ts

# 4. Probe Backend Health
Invoke-RestMethod -Uri http://localhost:3000/health -Method GET

# 5. Exercise Specific Endpoint with Auth Token
$headers = @{ "Authorization" = "Bearer $testToken"; "Content-Type" = "application/json" }
Invoke-RestMethod -Uri http://localhost:3000/api/donations -Headers $headers -Method GET
```

---

## 3. Backend Lifecycle & Health Checking Protocol

When a feature touches backend code (`backend/src/**`):
1. **Check for Running Instances:** Before starting a server, check if port 3000 is in use:
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
   ```
2. **Start Backend Asynchronously:** Launch using `run_command` with `IsDaemon: true` or async task runner:
   ```powershell
   npx --prefix backend tsx --env-file=.env ./src/server.ts
   ```
3. **Poll Health Endpoint:**
   ```powershell
   $healthy = $false
   for ($i = 0; $i -lt 15; $i++) {
     try {
       $res = Invoke-RestMethod -Uri http://localhost:3000/health -Method GET -TimeoutSec 2
       if ($res.status -eq "healthy" -or $res.status -eq "ok") {
         $healthy = $true
         break
       }
     } catch {
       Start-Sleep -Seconds 1
     }
   }
   if (-not $healthy) {
     throw "Backend failed to start or report healthy status."
   }
   ```
4. **Exercise Endpoints:** Dispatch automated test requests.
5. **Teardown:** Terminate the background server task via `manage_task` (action: `kill`) to free up the port when finished.

---

## 4. Android Tooling & Autonomous Runtime UI Testing Protocol

Mobile validation must not stop at static bundle export. When modifying mobile screens, navigation, or styles, genuine runtime execution is mandatory.

### Quick Runtime UI Test Command
```powershell
npm run test:android:runtime
```

### Autonomous Execution Protocol
1. **Device & AVD Detection:**
   - Detects `adb.exe` and `emulator.exe`.
   - If no device is attached, but `Pixel_8` AVD exists, automatically launches `emulator -avd Pixel_8 -no-audio -no-boot-anim` and polls `sys.boot_completed` until booted.
   - If no emulator or device is available, cleanly reports `[SKIP]` without breaking the pipeline.
2. **Architecture-Aware Standalone Packaging:**
   - Detects the target device ABI (e.g. `x86_64` on emulator).
   - Verifies whether matching native libraries are packaged in `android/app/build/outputs/apk/release/app-release.apk`.
   - If missing, assembles standalone release APK via `cd android && .\gradlew assembleRelease -PreactNativeArchitectures=<deviceAbi>`.
   - Installs APK via `adb install -r`.
3. **Screen Rendering & Flow Assertions:**
   - **Home Screen:** Dumps `uiautomator` hierarchy and asserts presence of Ashram header, quick action cards, and bottom navigation tab bar.
   - **Donation Screen:** Navigates via deep link `shri-gurudev-ashram-app://donation`, verifies progress bar and headers, taps `Continue` without input, verifies that the live validation alert dialog ("Validation Error: Please select a donation cause.") renders, and dismisses it via OK tap.
   - **Donation History:** Navigates via deep link `shri-gurudev-ashram-app://donation-history`, verifies "Total Contributions" and empty state rendering.
   - **Auth Guard / Protected Routes:** Navigates via deep link `shri-gurudev-ashram-app://collector-apply`, verifies that the auth guard renders the Phone Authentication screen with "Send OTP".
4. **Logcat Exception & Crash Auditing:**
   - Queries logcat for `AndroidRuntime:E`, `ReactNative:E`, and unhandled JS exceptions across all flows.

---

## 5. Automated Verification Gates Checklist

Before declaring any feature complete, verify every gate:

- [ ] `npm run typecheck` passes (0 TypeScript errors)
- [ ] `npm run backend:typecheck` passes (0 TypeScript errors)
- [ ] `npm run lint` passes (0 ESLint errors)
- [ ] `npm run test` passes (all frontend suites green)
- [ ] `npm run backend:test` passes (all backend suites green)
- [ ] Backend live health probe succeeds (if backend modified)
- [ ] Affected API endpoints exercised with assertions (if backend modified)
- [ ] `npm run export:android` passes (Metro bundle export green)
- [ ] `npm run test:android:runtime` passes (all 4 UI flows verified on device, or cleanly SKIPPED if no device)
- [ ] `git diff` reviewed for clean diffs and zero exposed credentials
