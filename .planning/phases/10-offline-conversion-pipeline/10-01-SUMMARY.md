---
phase: 10-offline-conversion-pipeline
plan: "01"
subsystem: offline-conversion-pipeline
tags:
  - webhooks
  - crm
  - google-ads
  - conversion-tracking
  - idempotency
  - hmac
dependency_graph:
  requires:
    - supabase/migrations/002_conversions.sql
    - supabase/migrations/003_conversion_queue.sql
    - supabase/migrations/005_leads_extension.sql
    - src/lib/leads/supabase.ts
  provides:
    - src/lib/conversions/webhook.ts
    - src/lib/conversions/queue.ts
    - src/app/(main)/api/webhooks/crm-conversion/route.ts
  affects:
    - leads table (conversion_status updates)
    - conversions table (new rows)
    - conversion_queue table (new queue entries)
tech_stack:
  added:
    - CRM_WEBHOOK_SECRET env var (HMAC signing secret)
  patterns:
    - HMAC-SHA256 with timingSafeEqual (same pattern as csrf.ts)
    - Idempotent insert via Postgres 23505 conflict detection
    - Thin route file delegating to service module (Phase 3 pattern)
    - Service role client inline for admin DB access (Phase 8 pattern)
    - Business logic failures return 200 to prevent webhook retries
key_files:
  created:
    - src/lib/conversions/webhook.ts
    - src/lib/conversions/queue.ts
    - src/app/(main)/api/webhooks/crm-conversion/route.ts
  modified: []
decisions:
  - "Route placed under (main)/api/ route group — project has no bare src/app/api/ directory"
  - "idempotency via 23505 error code detection rather than ON CONFLICT clause — Supabase JS client does not expose upsert ignore for this pattern directly"
  - "matchLeadByEmail uses .single() which returns PGRST116 on no rows — treated as lead_not_found (200 response)"
metrics:
  duration: "2 min"
  completed_date: "2026-02-27"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
---

# Phase 10 Plan 01: CRM Webhook — Receive, Validate, Match, Queue Summary

**One-liner:** HMAC-SHA256 authenticated CRM webhook that matches NetHunt deals to Supabase leads by email_hash and creates idempotent conversion + queue records for Google Ads upload.

## What Was Built

The entry point of the offline conversion pipeline. Three new files:

1. **`src/lib/conversions/queue.ts`** — `createQueueEntry()` helper that inserts into `conversion_queue` for the `google_ads` platform. Skips queue creation when neither `gclid` nor `email_hash` is present (no attribution data to upload).

2. **`src/lib/conversions/webhook.ts`** — Full pipeline orchestration:
   - `verifyWebhookSignature()`: HMAC-SHA256 with `timingSafeEqual` (mirrors `csrf.ts` pattern)
   - `parsePayload()`: Validates required fields and `conversion_type` enum
   - `matchLeadByEmail()`: Hashes incoming email (SHA-256), queries `leads` table by `email_hash` with visitor JOIN to retrieve `gclid`
   - `createConversion()`: Idempotent insert — detects Postgres `23505` unique constraint violation and retrieves existing row
   - `updateLeadStatus()`: Updates `leads.conversion_status` to match conversion type
   - `handleCrmWebhook()`: Main orchestrator returning `{ status, body }` — 401 for bad signature, 200 for all other outcomes

3. **`src/app/(main)/api/webhooks/crm-conversion/route.ts`** — Thin POST handler reading raw body via `request.text()` for HMAC integrity, delegating to `handleCrmWebhook()`.

## Requirements Satisfied

| Req | Description | Status |
|-----|-------------|--------|
| OFL-01 | HMAC-SHA256 webhook signature validation | Done |
| OFL-02 | Lead matching by email_hash with gclid retrieval via visitor JOIN | Done |
| OFL-03 | Idempotent conversion creation (idempotency_key = crm_deal_id:conversion_type) | Done |
| OFL-04 | Queue entry only created when gclid or email_hash attribution data present | Done |

## Decisions Made

- Route placed under `(main)/api/` route group — project has no bare `src/app/api/` directory; all API routes live under route groups.
- `matchLeadByEmail` uses `.single()` — returns `PGRST116` ("no rows") on unknown email, treated as `lead_not_found` (200 response, no error).
- Idempotency handled by catching `23505` Postgres error code and fetching the existing row — prevents duplicate conversions on CRM webhook retries.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Route path corrected to match project structure**
- **Found during:** Task 2
- **Issue:** Plan specified `src/app/api/webhooks/crm-conversion/route.ts` but the project has no bare `src/app/api/` directory — all routes are under `(lp)/api/` or `(main)/api/` route groups
- **Fix:** Created route at `src/app/(main)/api/webhooks/crm-conversion/route.ts` which resolves to the same URL path `/api/webhooks/crm-conversion`
- **Files modified:** `src/app/(main)/api/webhooks/crm-conversion/route.ts`
- **Commit:** 97330b7

## Commits

| Task | Commit | Files |
|------|--------|-------|
| Task 1: Webhook business logic + queue helper | 1592fbb | src/lib/conversions/webhook.ts, src/lib/conversions/queue.ts |
| Task 2: API route handler | 97330b7 | src/app/(main)/api/webhooks/crm-conversion/route.ts |

## Environment Variables Required

- `CRM_WEBHOOK_SECRET` — shared HMAC signing secret between NetHunt CRM and this endpoint (new, must be configured in NetHunt webhook settings and Vercel environment)

## Self-Check: PASSED

Files confirmed present:
- FOUND: src/lib/conversions/webhook.ts
- FOUND: src/lib/conversions/queue.ts
- FOUND: src/app/(main)/api/webhooks/crm-conversion/route.ts

Commits confirmed present:
- FOUND: 1592fbb
- FOUND: 97330b7
