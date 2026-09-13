# Security and Financial Integrity Rules

This rule enforces strict security protocols, financial transaction integrity, secret safeguarding, and exact human-approval boundaries for `shri-gurudev-ashram-app`.

---

## 1. Financial & Donation Integrity Standards

This application manages religious donations, seva bookings, Annadan funding, and physical cash collection. Financial correctness and security are non-negotiable.

### Payment Gateway Security (Razorpay)
- **Signature Verification:** Always compute and compare HMAC SHA256 signatures for Razorpay payments:
  ```typescript
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  ```
- **No Test Bypasses:** Never commit code that bypasses or disables signature verification. Unit tests must mock the verification function or use controlled test signatures.
- **Idempotency:** Payment webhooks and verification endpoints must be idempotent. Prevent double-recording of donations by verifying `orderId` and `paymentId` uniqueness in MongoDB/Supabase before writing.

### Cash Collection & Collector Management
- **Audit Trails:** Every cash collection transaction must record the `collectorId`, donor details, receipt number, GPS location (if provided), and timestamp.
- **Immediate Revocation Enforcement:** When a collector is suspended or deleted, active JWTs must be invalidated immediately. Backend middleware must check the database status (`status === 'active'`) rather than relying solely on unexpired JWT payloads.
- **Receipt Protection:** Receipt endpoints must be tokenized or protected by authentication. Never expose raw, unauthenticated public directories of donor receipts.

---

## 2. Secrets & Credential Management

- **Zero Credential Exposure:**
  - Never print `.env` files or secret values to logs or console output.
  - Never commit `.env`, `serviceAccountKey.json`, keystores, or private certificates to git.
  - Verify that all `.env*` files remain in `.gitignore`.
- **Sanitized Logging:** Never log sensitive donor information, Aadhaar numbers, PAN numbers, credit card data, or authentication tokens in plain text.
- **Safe Test Fixtures:** When writing tests, use clearly synthetic mock values (e.g. `"test_dummy_token_123"`, `"rzp_test_mockkey"`) and never copy real production credentials into test files.

---

## 3. Database Safety & Integrity

- **Dual-Database Architecture:**
  - **Supabase (PostgreSQL):** Used for user profiles, bookings, travel, seva schedules, and push tokens.
  - **MongoDB (Mongoose):**
    - `mainDb`: Donations, collectors, Annadan bookings, audit logs.
    - `sharedDb`: Donation categories and donation heads.
- **Schema Validation:** Always enforce Mongoose schema validations (types, enums, required fields) and Zod schema validation on input before writing to databases.
- **No Destructive Database Operations:** Never execute commands that drop tables, drop collections, or truncate database records without explicit user approval.

---

## 4. Human Approval Criteria vs Autonomous Execution

### You MUST Proceed Autonomously For:
- Implementing user-requested features and bug fixes across frontend and backend.
- Refactoring, modularizing, or optimizing existing code.
- Adding unit, integration, and end-to-end tests.
- Running typechecks, linter checks, and automated test suites.
- Launching local dev backend instances and probing local health endpoints.
- Exporting Android Metro bundles and diagnosing compilation errors.
- Inspecting and using local Android emulators (e.g. `Pixel_8`) via `adb`.
- Self-correcting build, typecheck, lint, or test failures.
- Auditing `git status` and `git diff`.

### You MUST Obtain Human Approval BEFORE:
1. **Destructive Database Changes:** Running `DROP TABLE`, `collection.drop()`, wiping database collections, or running non-reversible migrations.
2. **Production Deployment:** Triggering production builds (`eas build --platform android`), submitting to Google Play Store / Apple App Store, or deploying backend services to production infrastructure.
3. **Modifying Live Secrets:** Changing live production API keys, production database connection strings, or production merchant payment credentials.
4. **Altering Financial Payout Routing:** Modifying bank accounts, payout endpoints, or live merchant account credentials.
5. **Irreversible Ambiguity:** Facing conflicting or mutually incompatible business logic choices where the correct domain behavior is unclear.
