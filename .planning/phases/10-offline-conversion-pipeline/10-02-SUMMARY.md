---
phase: 10-offline-conversion-pipeline
plan: "02"
subsystem: api
tags: [google-ads, oauth2, offline-conversions, enhanced-conversions, typescript]

# Dependency graph
requires:
  - phase: 10-offline-conversion-pipeline-01
    provides: webhook endpoint that enqueues conversion data consumed by Plan 03 queue processor
provides:
  - uploadConversion() function for Google Ads REST API v18 uploadClickConversions
  - OAuth2 refresh token flow with in-memory token caching
  - Payload builder with gclid + hashedEmail userIdentifiers (OFL-08)
  - EEA consent signals (adUserData/adPersonalization GRANTED) (OFL-09)
  - Structured UploadResult return type for queue processor error handling
affects:
  - 10-offline-conversion-pipeline-03 (queue processor consumes uploadConversion())

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "OAuth2 refresh token caching: in-memory cachedToken with 5-min expiry buffer, reset per Vercel function instance"
    - "Google Ads REST over client library: native fetch, no extra dependencies"
    - "Conversion action IDs from env vars: GOOGLE_ADS_CONVERSION_ACTION_QUALIFIED / CLOSED"
    - "partialFailure: true for per-conversion error reporting in batch uploads"

key-files:
  created:
    - src/lib/conversions/google-ads.ts
  modified: []

key-decisions:
  - "Google Ads REST API v18 over npm client library — avoids dependency, native fetch is sufficient for single-conversion uploads"
  - "In-memory OAuth2 token cache with 5-min buffer — token refresh is cheap, serverless instances are short-lived"
  - "gclid at clickConversion top level, email in userIdentifiers array — matches Google API schema for maximum match rate"
  - "Consent signals always GRANTED — consent captured at lead submission time (form opt-in)"
  - "Conversion action IDs from env vars (not hardcoded) — different IDs for qualified vs closed conversion types"

patterns-established:
  - "uploadConversion() returns UploadResult { success, error?, partial_failure_error? } — queue processor uses this to decide retry vs permanent failure"

requirements-completed:
  - OFL-06
  - OFL-08
  - OFL-09

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 10 Plan 02: Google Ads API Upload Module Summary

**Google Ads REST API v18 offline conversion upload with OAuth2 refresh token caching, gclid + SHA-256 email userIdentifiers, and EEA consent signals**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-27T01:15:22Z
- **Completed:** 2026-02-27T01:17:38Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created self-contained Google Ads upload module (`src/lib/conversions/google-ads.ts`) with no new npm dependencies
- OAuth2 refresh token flow with in-memory caching (5-min expiry buffer) to minimize token refresh calls
- Payload builder includes gclid at top level and hashedEmail in userIdentifiers array for dual-identifier attribution (OFL-08)
- EEA consent signals (adUserData: GRANTED, adPersonalization: GRANTED) included in every upload payload (OFL-09)
- Structured UploadResult return type enables queue processor to distinguish success, partial failure, and hard failure

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Google Ads upload module with OAuth2 and conversion formatting** - `402b000` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `src/lib/conversions/google-ads.ts` - Google Ads REST API v18 upload module: uploadConversion(), getAccessToken() with caching, buildUploadPayload() with consent signals and userIdentifiers

## Decisions Made

- Used Google Ads REST API v18 directly over the `google-ads-api` npm package — native `fetch` is sufficient for single-conversion uploads and avoids an extra dependency
- In-memory OAuth2 token caching with 5-minute expiry buffer — acceptable for Vercel serverless (instances are short-lived, token refresh is cheap at ~100ms)
- gclid placed at `clickConversion` top level (not inside `userIdentifiers`) — this matches the Google Ads API schema; `userIdentifiers` is for Enhanced Conversions email/phone hashes only
- Consent signals hardcoded as GRANTED — consent is captured at lead form submission time; all leads in the pipeline have opted in
- Conversion action IDs sourced from env vars (`GOOGLE_ADS_CONVERSION_ACTION_QUALIFIED` / `GOOGLE_ADS_CONVERSION_ACTION_CLOSED`) — allows different action IDs per conversion stage without code changes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. The `grep -c "uploadConversion"` check in the plan expects count 2 (export + function), but the implementation uses `export async function uploadConversion` as a single combined declaration on one line, yielding count 1. This is functionally identical to a separate export statement — the export and function are co-located per idiomatic TypeScript. All other verification checks passed with expected counts.

## User Setup Required

**External services require manual configuration.** The following environment variables must be added to Vercel before the queue processor (Plan 03) can call `uploadConversion()`:

| Env Var | Source |
|---------|--------|
| `GOOGLE_ADS_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID |
| `GOOGLE_ADS_CLIENT_SECRET` | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client Secret |
| `GOOGLE_ADS_REFRESH_TOKEN` | Generated via OAuth2 consent flow (one-time) with scope: `https://www.googleapis.com/auth/adwords` |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Google Ads API Center (already approved) |
| `GOOGLE_ADS_CUSTOMER_ID` | Google Ads dashboard — 2152468876 (no dashes) |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Manager account — 6706464060 (no dashes) |
| `GOOGLE_ADS_CONVERSION_ACTION_QUALIFIED` | Google Ads dashboard → Goals → Conversions → action ID for qualified leads |
| `GOOGLE_ADS_CONVERSION_ACTION_CLOSED` | Google Ads dashboard → Goals → Conversions → action ID for signed leases |

## Next Phase Readiness

- `uploadConversion()` is exported and ready to be consumed by the queue processor (Plan 03)
- Module is self-contained — no imports from Phase 01 webhook or Supabase
- Queue processor will call `uploadConversion(conversionData)` and interpret the `UploadResult` to update queue item status (success → done, failure → retry or dead letter)

---
*Phase: 10-offline-conversion-pipeline*
*Completed: 2026-02-27*
