---
phase: 10-offline-conversion-pipeline
plan: "03"
subsystem: infra
tags: [supabase, deno, edge-function, google-ads, conversion-queue, exponential-backoff, oauth2, pg-cron]

# Dependency graph
requires:
  - phase: 10-01
    provides: conversion_queue table helper (createQueueEntry) + conversion_queue schema
  - phase: 10-02
    provides: Google Ads upload logic reference (Node.js version for API contract)

provides:
  - Supabase Edge Function process-conversion-queue (Deno runtime)
  - Queue processor with exponential backoff retry (15min → 1h → 4h → 16h)
  - Dead letter handling after 5 failures
  - OAuth2 token refresh with in-memory cache
  - Sequential batch upload (50 items/invocation)

affects:
  - pg_cron schedule setup (post-deploy SQL step)
  - Google Ads API integration (queue side)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Deno Edge Function with Deno.serve() entry point
    - Supabase service role client in Edge Function (esm.sh import)
    - Exponential backoff array index pattern for retry scheduling
    - In-memory OAuth2 token cache with 5-min expiry buffer
    - Dead letter transition on retry_count >= max_retries
    - Status re-read after processQueueItem to count outcomes

key-files:
  created:
    - supabase/functions/process-conversion-queue/index.ts
  modified: []

key-decisions:
  - "Sequential processing (not parallel) of queue items to avoid Google Ads API rate limits"
  - "Duplicate upload logic from google-ads.ts — Edge Function cannot import from Next.js app (different runtime)"
  - "Bearer token auth using SUPABASE_SERVICE_ROLE_KEY — matches pg_cron → pg_net invocation pattern"
  - "Re-read queue item status after processQueueItem to count outcomes accurately (avoids tracking state in processQueueItem)"
  - "Missing conversion record transitions directly to dead_letter (unrecoverable — no conversion data to upload)"

patterns-established:
  - "Edge Function auth: verify Authorization Bearer matches SUPABASE_SERVICE_ROLE_KEY"
  - "Deno runtime: Deno.serve(), Deno.env.get(), esm.sh imports — no Node.js APIs"
  - "Backoff: BACKOFF_INTERVALS_MS array indexed by Math.min(retryCount, length-1)"

requirements-completed: [OFL-05, OFL-07]

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 10 Plan 03: Conversion Queue Processor Summary

**Deno Edge Function running every 15 min via pg_cron: picks up pending/retry-ready queue items, uploads to Google Ads REST API v18, applies exponential backoff (15min → 1h → 4h → 16h) with dead letter after 5 failures**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-27T01:19:58Z
- **Completed:** 2026-02-27T01:21:33Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Supabase Edge Function `process-conversion-queue` created for Deno runtime — uses `Deno.serve()`, `Deno.env.get()`, and ESM imports from esm.sh
- Exponential backoff scheduler: 4-interval array [15min, 1h, 4h, 16h] indexed by retry count; dead letter transition when `retry_count >= max_retries` (default 5)
- Google Ads upload logic duplicated from `google-ads.ts` for Deno compatibility — includes gclid, email userIdentifiers (OFL-08), and EEA consent signals (OFL-09)
- Queue query fetches both `status = 'pending'` and `status = 'failed' AND next_retry_at <= now()` via Supabase `.or()` filter (OFL-05)
- OAuth2 token refresh with in-memory cache (5-min expiry buffer) for Deno invocation lifecycle

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Supabase Edge Function for queue processing** - `22f8336` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `supabase/functions/process-conversion-queue/index.ts` - Deno Edge Function: queue processor with OAuth2, Google Ads upload, exponential backoff retry, dead letter handling

## Decisions Made

- Sequential processing (not parallel) — avoids Google Ads API rate limits at B2B volume (50 items max per invocation)
- Upload logic duplicated from `google-ads.ts` — Edge Function runs in Deno and cannot import from the Next.js app; this is intentional, both modules must be kept in sync if the API changes
- Bearer token verification using `SUPABASE_SERVICE_ROLE_KEY` — standard pattern for pg_cron → pg_net invocations
- Missing conversion record in `conversions` table → immediate dead_letter (data is gone, retry would always fail)
- Status re-read after `processQueueItem()` call to tally outcome counts — avoids coupling return value tracking into the core processing function

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

After deploying the Edge Function (`supabase functions deploy process-conversion-queue`), run the following SQL to schedule the cron job:

```sql
SELECT cron.schedule(
  'process-conversions',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/process-conversion-queue',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Required environment variables in Supabase Edge Function secrets:
- `SUPABASE_URL` — injected automatically
- `SUPABASE_SERVICE_ROLE_KEY` — injected automatically
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET`
- `GOOGLE_ADS_REFRESH_TOKEN`
- `GOOGLE_ADS_CUSTOMER_ID`
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID`
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CONVERSION_ACTION_QUALIFIED`
- `GOOGLE_ADS_CONVERSION_ACTION_CLOSED`

## Next Phase Readiness

Phase 10 (Offline Conversion Pipeline) is complete:
- Plan 01: CRM webhook endpoint + idempotent conversion creation + queue entry helper
- Plan 02: Google Ads upload module (Node.js, for API route direct invocation)
- Plan 03: Queue processor Edge Function (Deno, for async cron-driven batch upload)

Ready for Phase 11 or Phase 12 depending on ROADMAP priority.

## Self-Check: PASSED

- FOUND: `supabase/functions/process-conversion-queue/index.ts`
- FOUND: commit `22f8336` (feat(10-03): add Supabase Edge Function for conversion queue processing)

---
*Phase: 10-offline-conversion-pipeline*
*Completed: 2026-02-27*
