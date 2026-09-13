---
name: backend-testing
description: >-
  Automated Node/Express backend lifecycle management and API verification for shri-gurudev-ashram-app.
  Use when working on Express routes, controllers, middleware, MongoDB models, or Supabase integrations
  to launch the backend in the background, verify health, test endpoints, and shut down cleanly.
---

# Backend Lifecycle & API Testing Skill

This skill provides procedures for starting, health-checking, exercising, and gracefully shutting down the Node/Express backend during autonomous development.

---

## 1. Starting the Backend in Background

When backend code (`backend/src/**`) is modified, launch the server using `run_command`:

```powershell
# In run_command with IsDaemon: true or WaitMsBeforeAsync: 5000
npx --prefix backend tsx --env-file=.env ./src/server.ts
```

---

## 2. Health Checking

Confirm the server is active and connected to MongoDB & Supabase:

```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/backend-testing/scripts/probe-backend.ps1
```

Or directly via PowerShell:
```powershell
Invoke-RestMethod -Uri http://localhost:3000/health -Method GET
```

Expected response format:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-13T...",
  "uptime": 12.34,
  "database": {
    "mongodb": "connected"
  }
}
```

---

## 3. Exercising Endpoints Programmatically

Use the exercise script to assert status codes and inspect response payloads:

```powershell
# Test public health endpoint
powershell -ExecutionPolicy Bypass -File .agents/skills/backend-testing/scripts/exercise-endpoint.ps1 -Path "/health" -ExpectedStatus 200

# Test unauthenticated access to protected route (should return 401)
powershell -ExecutionPolicy Bypass -File .agents/skills/backend-testing/scripts/exercise-endpoint.ps1 -Path "/api/donations/history" -ExpectedStatus 401

# Test authenticated endpoint with Bearer token
powershell -ExecutionPolicy Bypass -File .agents/skills/backend-testing/scripts/exercise-endpoint.ps1 -Path "/api/donations" -Token "$testToken" -ExpectedStatus 200
```

---

## 4. Teardown and Cleanup

Always clean up running backend tasks when verification is finished:
- Identify the backend task ID from `manage_task` (action: `list`).
- Terminate the task via `manage_task` (action: `kill`, `TaskId`: `<task-id>`).
- Confirm port 3000 is released:
  ```powershell
  Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
  ```
