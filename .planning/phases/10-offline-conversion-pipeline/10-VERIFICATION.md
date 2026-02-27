---
phase: 10-offline-conversion-pipeline
verified: 2026-02-27T00:00:00Z
status: passed
score: 13/13 must-haves verified
re_verification: false
---

# Phase 10: Offline Conversion Pipeline Verification Report

**Phase Goal:** When NetHunt CRM marks a deal as qualified or closed, the conversion is automatically matched to a Supabase lead, queued, and uploaded to Google Ads API with retry logic — no manual steps
**Verified:** 2026-02-27
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | POST to /api/webhooks/crm-conversion with valid HMAC signature returns 200; invalid/missing signature returns 401 | VERIFIED | `verifyWebhookSignature()` in webhook.ts uses `timingSafeEqual`; route.ts returns `result.status` (401 on bad sig, 200 otherwise) |
| 2  | Webhook payload with known email matches Supabase lead and retrieves gclid and email_hash | VERIFIED | `matchLeadByEmail()` hashes email with SHA-256, queries `leads` by `email_hash` with `visitors!leads_visitor_id_fkey` JOIN |
| 3  | Conversion record created with idempotency_key = {crm_deal_id}:{conversion_type}; second call does not create duplicate | VERIFIED | `createConversion()` inserts with `idempotency_key`, catches Postgres `23505` error and returns existing row |
| 4  | Queue entry created for google_ads platform when lead has gclid or email_hash | VERIFIED | `createQueueEntry()` guards with `if (!gclid && !emailHash) return { created: false }` before inserting |
| 5  | Webhook payload with unknown email returns 200 with `{ success: false, reason: 'lead_not_found' }` | VERIFIED | `handleCrmWebhook()` returns `{ status: 200, body: { success: false, reason: "lead_not_found" } }` when `matchLeadByEmail` returns null |
| 6  | Conversion row contains denormalized gclid, email_hash, and UTM columns from matched lead | VERIFIED | `createConversion()` inserts `gclid`, `email_hash`, `utm_source`, `utm_medium`, `utm_campaign` from the matched lead |
| 7  | `uploadConversion()` sends properly formatted request to Google Ads uploadClickConversions REST endpoint | VERIFIED | `google-ads.ts` POSTs to `googleads.googleapis.com/v18/customers/{id}:uploadClickConversions` |
| 8  | Upload payload includes both gclid and sha256_email_address as userIdentifiers (OFL-08) | VERIFIED | `buildUploadPayload()` sets `clickConversion.gclid` at top level and `userIdentifiers: [{ hashedEmail: email_hash }]` |
| 9  | Upload payload includes consent signals adUserData: GRANTED and adPersonalization: GRANTED (OFL-09) | VERIFIED | `consent: { adUserData: "GRANTED", adPersonalization: "GRANTED" }` present in both `google-ads.ts` and edge function |
| 10 | OAuth2 access token is cached until expiry; new token fetched when cached one expires | VERIFIED | `cachedToken` module-level variable with `expires_at > now + 5 * 60 * 1000` check in both Node.js module and Deno edge function |
| 11 | Edge Function queries conversion_queue for pending or failed items where next_retry_at <= now(), ordered by created_at ASC | VERIFIED | `.or('status.eq.pending,and(status.eq.failed,next_retry_at.lte.${now})')` with `.order("created_at", { ascending: true })` |
| 12 | Failed upload increments retry_count, sets next_retry_at with exponential backoff (15min, 1h, 4h, 16h) | VERIFIED | `BACKOFF_INTERVALS_MS = [15*60*1000, 60*60*1000, 4*60*60*1000, 16*60*60*1000]` with `Math.min(retryCount, length-1)` indexing |
| 13 | After 5 failed attempts (retry_count >= max_retries), item transitions to dead_letter and is never retried | VERIFIED | `calculateNextRetryAt()` returns null when `retryCount >= maxRetries`; `processQueueItem()` sets `status: "dead_letter"` |

**Score:** 13/13 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/conversions/webhook.ts` | Webhook signature validation, payload parsing, lead matching, conversion+queue creation | VERIFIED | 292 lines; exports `verifyWebhookSignature` and `handleCrmWebhook`; imports `createQueueEntry` from queue.ts |
| `src/lib/conversions/queue.ts` | `createQueueEntry()` helper that inserts into conversion_queue for google_ads platform | VERIFIED | 51 lines; exports `createQueueEntry`; guards on attribution data |
| `src/app/(main)/api/webhooks/crm-conversion/route.ts` | POST handler delegating to webhook.ts business logic | VERIFIED | 27 lines; thin wrapper; imports `handleCrmWebhook`; reads raw body via `request.text()` |
| `src/lib/conversions/google-ads.ts` | `uploadConversion()` function, OAuth2 token management, Google Ads REST API integration | VERIFIED | 279 lines; exports `uploadConversion`; full OAuth2 + payload + error handling |
| `supabase/functions/process-conversion-queue/index.ts` | Deno Edge Function: queue processor with exponential backoff and dead letter logic | VERIFIED | 427 lines; `Deno.serve()` entry; `Deno.env.get()` throughout; esm.sh import |

**Note on route path:** PLAN specified `src/app/api/webhooks/crm-conversion/route.ts` but file correctly placed at `src/app/(main)/api/webhooks/crm-conversion/route.ts` — project uses route groups with no bare `src/app/api/` directory. The URL resolves identically to `/api/webhooks/crm-conversion`. This deviation was self-corrected during execution and documented in SUMMARY.

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `route.ts` | `webhook.ts` | imports `handleCrmWebhook` | WIRED | Line 18: import; line 24: called with rawBody + signature |
| `webhook.ts` | `conversions` table | inserts with `idempotency_key` | WIRED | Line 161: `idempotencyKey` formed; line 171: inserted to `conversions` |
| `webhook.ts` | `queue.ts` | calls `createQueueEntry` after conversion insert | WIRED | Line 14: import; line 275: called with conversion.id, lead.gclid, lead.email_hash |
| `google-ads.ts` | Google Ads API v18 | REST POST to `googleads.googleapis.com` | WIRED | Line 22: endpoint URL; line 234: `fetch(endpoint, ...)` with POST |
| `google-ads.ts` | Google OAuth2 | POST to `oauth2.googleapis.com/token` | WIRED | Line 19: `TOKEN_ENDPOINT`; line 77: `fetch(TOKEN_ENDPOINT, ...)` |
| `process-conversion-queue/index.ts` | `conversion_queue` table | reads + updates by status | WIRED | Lines 325, 260, 277, 292, 359: `.from("conversion_queue")` used throughout |
| `process-conversion-queue/index.ts` | `conversions` table | reads conversion rows for upload payload | WIRED | Line 350: `.from("conversions").select(...).eq("id", item.conversion_id)` |
| `process-conversion-queue/index.ts` | Google Ads API v18 | REST POST via `uploadToGoogleAds()` | WIRED | Line 194: `googleads.googleapis.com` endpoint; line 196: `fetch(endpoint, ...)` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| OFL-01 | 10-01 | HMAC-SHA256 webhook signature validation | SATISFIED | `verifyWebhookSignature()` with `createHmac("sha256")` + `timingSafeEqual`; 401 on failure |
| OFL-02 | 10-01 | Webhook matches lead by email and retrieves stored gclid | SATISFIED | `matchLeadByEmail()` hashes email, queries by `email_hash`, JOINs `visitors` for gclid |
| OFL-03 | 10-01 | Conversion record with idempotency key `{crm_deal_id}:{conversion_type}` | SATISFIED | `idempotencyKey = \`${payload.crm_deal_id}:${payload.conversion_type}\``; 23505 conflict detection |
| OFL-04 | 10-01 | Queue entry only created when gclid or email_hash present | SATISFIED | `if (!gclid && !emailHash) return { created: false, reason: "no_attribution_data" }` |
| OFL-05 | 10-03 | Queue processor runs every 15 min, picks up pending and retry-ready items | SATISFIED | Edge function with `Deno.serve()`; `.or()` filter for pending + failed+next_retry_at; pg_cron `*/15 * * * *` schedule documented |
| OFL-06 | 10-02 | Uploads conversions to Google Ads API via REST with OAuth2 | SATISFIED | `uploadConversion()` in google-ads.ts; Deno duplicate in edge function; both call `uploadClickConversions` endpoint |
| OFL-07 | 10-03 | Failed uploads retry with exponential backoff; dead_letter after 5 attempts | SATISFIED | `BACKOFF_INTERVALS_MS [15min, 1h, 4h, 16h]`; `calculateNextRetryAt()` returns null when `retryCount >= maxRetries`; 14 occurrences of `dead_letter` |
| OFL-08 | 10-02 | Upload payload includes both gclid and hashed email as userIdentifiers | SATISFIED | `clickConversion.gclid` at top level; `userIdentifiers: [{ hashedEmail: email_hash }]` in both Node.js and Deno modules |
| OFL-09 | 10-02 | Upload includes consent signals (ad_user_data: GRANTED, ad_personalization: GRANTED) | SATISFIED | `consent: { adUserData: "GRANTED", adPersonalization: "GRANTED" }` in both `google-ads.ts` and edge function |

All 9 requirements (OFL-01 through OFL-09) satisfied. No orphaned requirements.

### Anti-Patterns Found

No anti-patterns found across all 5 phase files.

- No TODO/FIXME/HACK/PLACEHOLDER comments
- All `return null` occurrences are legitimate guard clauses (validation failures, DB not found), not stubs
- No console.log-only implementations
- No empty function bodies

### Human Verification Required

### 1. End-to-end webhook flow with real NetHunt CRM

**Test:** Configure `CRM_WEBHOOK_SECRET` in both NetHunt and Vercel. Mark a test deal as "qualified" in NetHunt CRM. Observe the POST request to `/api/webhooks/crm-conversion`.
**Expected:** Response `{ success: true, conversion_id: "...", queued: true }`, a new row in `conversions` table, and a `pending` row in `conversion_queue`.
**Why human:** Requires live NetHunt CRM account, real webhook delivery, and database access to confirm rows.

### 2. Google Ads OAuth2 token and upload validation

**Test:** Configure all 8 `GOOGLE_ADS_*` env vars. Trigger the queue processor (POST to Edge Function URL with service role Bearer token). Observe Google Ads API response.
**Expected:** The `uploadClickConversions` API returns a 200 response with no `partialFailureError`. Queue item transitions to `uploaded`.
**Why human:** Requires real Google Ads API credentials, valid conversion action IDs, and a real uploaded gclid or email_hash to match.

### 3. pg_cron schedule activation

**Test:** After deploying the Edge Function (`supabase functions deploy process-conversion-queue`), run the documented `SELECT cron.schedule(...)` SQL. Wait 15+ minutes. Check pg_cron logs.
**Expected:** The cron job fires every 15 minutes, calls the Edge Function, and processes any pending queue items.
**Why human:** Requires deployed Supabase project, pg_cron and pg_net extensions enabled, and calendar-time observation.

### 4. Exponential backoff retry cycle observation

**Test:** Inject a queue item with invalid Google Ads credentials to force a failure. Observe `next_retry_at` values after each failure.
**Expected:** `next_retry_at` advances by 15min, then 1h, then 4h, then 16h. After 5th failure, `status = dead_letter` and no further retries.
**Why human:** Requires real Edge Function invocations at scheduled intervals with observed database state changes.

---

## Gaps Summary

No gaps. All automated checks passed.

The pipeline is fully implemented from end to end:
- CRM webhook receives and validates (HMAC-SHA256 + timingSafeEqual), matches leads, creates idempotent conversions, and queues for upload
- Google Ads module sends properly formatted payloads (gclid + hashedEmail + consent signals) with OAuth2 token caching
- Supabase Edge Function processes the queue every 15 minutes with exponential backoff and dead letter handling

The only items requiring human verification are live-service integrations (NetHunt CRM, Google Ads API, pg_cron schedule) that cannot be verified programmatically.

---

_Verified: 2026-02-27_
_Verifier: Claude (gsd-verifier)_
