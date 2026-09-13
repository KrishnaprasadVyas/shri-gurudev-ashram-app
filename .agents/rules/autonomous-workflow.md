# Autonomous Development Workflow

This rule defines the mandatory 17-step autonomous engineering lifecycle for `shri-gurudev-ashram-app`. You must execute every change through this disciplined loop with minimal human intervention.

---

## The 17-Step Autonomous Loop

```text
[1. Inspect Code] ──► [2. Plan (if non-trivial)] ──► [3. Implement Changes]
                                                               │
┌──────────────────────────────────────────────────────────────┘
▼
[4. Typecheck (FE & BE)] ──► [5. Lint Check] ──► [6. Automated Unit/Integration Tests]
                                                               │
┌──────────────────────────────────────────────────────────────┘
▼
[7. Start Backend (if affected)] ──► [8. Exercise Live API Endpoints]
                                                    │
┌───────────────────────────────────────────────────┘
▼
[9. Expo Android Bundle Export] ──► [10. Android Emulator/Device Validation]
                                                    │
┌───────────────────────────────────────────────────┘
▼
[11. Inspect Logs & Errors] ──► [12. Auto-Fix Failures] ──► [13. Re-test Affected Flows]
                                                                         │
┌────────────────────────────────────────────────────────────────────────┘
▼
[14. Full Test Suite Regression] ──► [15. Production Export Check] ──► [16. Git Diff Audit]
                                                                               │
                                                                               ▼
                                                                [17. Completion Report]
```

### 1. Inspect Existing Code Before Modifying
- Always locate and inspect affected files before writing new code or editing existing code.
- Trace downstream impacts across frontend components, Zustand stores, backend controllers, middleware, and database models.
- Adhere to existing design patterns: NativeWind CSS classes, Zustand stores, Expo Router file-based screens, Express 5 controllers, and Mongoose schemas.

### 2. Plan Non-Trivial Changes
- For any architectural change, multi-file feature, schema migration, or authentication flow change, produce a structured implementation plan.
- Identify risks, rollback strategies, and automated verification criteria up front.
- If a task is simple, local, or a direct bug fix, proceed directly without blocking.

### 3. Implement the Change
- Make precise, clean code changes.
- Maintain documentation integrity and preserve unrelated existing code and docstrings.
- Never stub critical business or security logic with fake placeholders.

### 4. Run Typecheck (Frontend & Backend)
- **Frontend Typecheck:** `npm run typecheck` (`tsc --noEmit`).
- **Backend Typecheck:** `npm --prefix backend run typecheck` or `npx --prefix backend tsc --noEmit`.
- Both must compile with 0 errors.

### 5. Run Lint
- **Frontend Lint:** `npm run lint` (`eslint .`).
- Must report 0 errors before proceeding.

### 6. Run Automated Unit & Integration Tests
- **Frontend Tests:** `npm run test` (`jest --passWithNoTests`).
- **Backend Tests:** `Push-Location backend; node --env-file=.env ../node_modules/jest/bin/jest.js; Pop-Location`.
- Ensure all targeted suites and existing regression suites pass.

### 7. Start Backend When Required
- When modifying routes, middleware, controllers, database queries, or server-side business logic, spin up the backend in the background using `run_command` with `IsDaemon: true` or async task:
  ```powershell
  npx --prefix backend tsx --env-file=.env ./src/server.ts
  ```
- Probe `http://localhost:3000/health` with `Invoke-RestMethod` to ensure the server is listening and connected to databases.

### 8. Exercise Affected Backend API Endpoints
- Execute automated HTTP requests against the live local backend using PowerShell `Invoke-RestMethod` or `curl`.
- Pass realistic mock payloads and test authentication tokens.
- Validate HTTP response status codes, JSON payload schema, error messages, and database side effects.
- Clean up backend server background tasks via `manage_task` when testing completes.

### 9. Build / Export Android Expo Bundle
- When any React Native, Expo, styling, asset, or navigation code is modified, run:
  ```powershell
  npx expo export --platform android --no-bytecode
  ```
- This validates Metro bundling, JavaScript syntax, Asset resolution, and React 19 / Expo 56 compilation without requiring a full native Android build.

### 10. Autonomous Android Runtime & UI Validation
- When mobile screens, navigation, or native code are touched, execute:
  ```powershell
  npm run test:android:runtime
  ```
- If the `Pixel_8` AVD exists but is offline, the test script automatically starts the emulator and waits for boot completion.
- The script automatically verifies that screens render real text nodes (via `uiautomator dump`), exercises interactive flows (such as form validation alert dialogs), and audits logcat for `AndroidRuntime:E` and `ReactNative:E`.
- **Honesty & Fallback Rule:** If no emulator or device is available, the script cleanly reports `[SKIPPED]` without breaking the pipeline. Never claim UI testing occurred if skipped.

### 11. Inspect Logs, Console Errors, API Responses, & Runtime Errors
- Check stdout/stderr from backend server tasks.
- Check Metro bundler error output.
- Check adb logcat outputs for unhandled JavaScript exceptions or native module crashes.

### 12. Automatically Fix Failures
- If typecheck, lint, unit tests, API tests, or bundle export fails:
  - Do NOT ask the user to debug or fix it.
  - Read the stack trace and exact error message.
  - Inspect the offending code.
  - Implement the fix immediately.

### 13. Re-test Affected Flows
- Re-run the specific failing test or check to ensure the fix resolved the issue without side effects.

### 14. Run Full Test Suite Again
- Run all unit and integration test suites (root client + backend) to guarantee zero regressions.

### 15. Run Production Build / Export Checks
- Re-run `npx expo export --platform android --no-bytecode` to guarantee clean bundle generation for release.

### 16. Inspect Git Diff for Accidental Changes or Secrets
- Run `git status` and `git diff` to review all modified lines.
- Verify:
  - No secret keys, passwords, database credentials, or tokens were added.
  - No temporary debug logging (`console.log(secret)`) was committed.
  - No unintended changes or unwanted scratch files remain.

### 17. Report Completion
- Only report the task as complete once all automated validation gates have passed.
- Present a clear summary of changes made, automated tests executed, verification outputs, and any environment limitations encountered.
