---
name: autonomous-dev
description: >-
  Orchestrates the 17-step autonomous development, testing, and validation workflow for shri-gurudev-ashram-app.
  Use when implementing any feature, bug fix, or refactoring in this repository to automatically plan, code,
  typecheck, test, probe the backend, export Android bundles, and verify changes without human prompting.
---

# Autonomous Development & Validation Skill

This skill operationalizes the autonomous engineering process for `shri-gurudev-ashram-app`. It ensures that every code change undergoes end-to-end static, unit, runtime, and build validation without requiring human intervention or manual testing steps.

---

## 1. Quick Verification Pipeline

To run the complete automated test and build pipeline in a single step:

```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/autonomous-dev/scripts/validate-all.ps1
```

This runs:
1. Frontend Typecheck (`npm run typecheck`)
2. Backend Typecheck (`npx --prefix backend tsc --noEmit`)
3. Frontend Linter (`npm run lint`)
4. Frontend Unit Tests (`npm run test`)
5. Backend Unit Tests (`Push-Location backend; node --env-file=.env ../node_modules/jest/bin/jest.js; Pop-Location`)
6. Metro Android Bundle Export (`npx expo export --platform android --no-bytecode`)

---

## 2. Autonomous Execution Procedure

When given a task or feature request:

### Step 1: Code Discovery & Inspection
- Locate all relevant files using `find_by_name` and `grep_search`.
- Read and understand existing implementation patterns, stores, routes, or backend controllers.
- Check database models (Supabase tables / Mongoose schemas).

### Step 2: Implementation Planning
- If non-trivial, define the component breakdown, API endpoints, schema adjustments, and test assertions before editing code.
- Confirm that proposed changes do not weaken payment security or expose secrets.

### Step 3: Implement Code
- Apply edits using `replace_file_content` or `write_to_file`.
- Follow NativeWind styling, Expo Router conventions, React Hook Form validation, and Express 5 error handling.

### Step 4: Validate Static Types & Lint
- Execute `npm run typecheck`.
- Execute `npx --prefix backend tsc --noEmit`.
- Execute `npm run lint`.
- If any type or lint error occurs, fix it immediately without asking the user.

### Step 5: Execute Automated Test Suites
- Run unit test suites for frontend: `npm run test`.
- Run backend test suites: `Push-Location backend; node --env-file=.env ../node_modules/jest/bin/jest.js; Pop-Location`.
- If tests fail, inspect stack traces, fix code or test expectations, and re-run.

### Step 6: Backend Runtime Exercising (When Backend Changed)
- Refer to the `backend-testing` skill.
- Launch the backend in background (`npx --prefix backend tsx --env-file=.env ./src/server.ts`).
- Query `http://localhost:3000/health` to confirm database connectivity.
- Exercise affected routes with test requests and verify JSON output.
- Terminate backend task upon test completion.

### Step 7: Android Compilation & Device Verification (When Mobile Changed)
- Refer to the `android-testing` skill.
- Run `npx expo export --platform android --no-bytecode` to verify bundle compilation.
- Inspect `adb devices` and `emulator -list-avds`.
- If a device/emulator is running, launch and inspect logcat for runtime crashes.
- If no device is running, clearly note this constraint in the completion report.

### Step 8: Git Diff & Secret Audit
- Run `git status` and `git diff`.
- Ensure no unintended files, `.env` entries, API credentials, or debug logs were left behind.

### Step 9: Final Report
- Report files changed, validation command results, and completion confirmation.
