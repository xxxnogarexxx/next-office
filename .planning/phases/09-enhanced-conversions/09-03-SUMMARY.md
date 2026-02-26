---
phase: 09-enhanced-conversions
plan: 03
subsystem: tracking
tags: [gtag, google-ads, enhanced-conversions, transaction-id, sessionStorage, react, next.js]

# Dependency graph
requires:
  - phase: 09-enhanced-conversions
    provides: "Plan 02 — transaction_id column in leads table, ValidatedLeadData extended with transaction_id field"

provides:
  - "LP form (lead-form-section.tsx) fires gtag user_data with raw email before conversion event (EC-02)"
  - "Main form (lead-form.tsx) fires gtag user_data with raw email before generate_lead event (EC-02)"
  - "Both forms generate one crypto.randomUUID() per submission shared to both gtag and API POST body (EC-04 client)"
  - "Danke page ConversionTracker reads transaction_id from sessionStorage, falls back to new UUID (EC-04 continuity)"

affects:
  - 09-enhanced-conversions
  - offline-conversion-pipeline
  - google-ads-deduplication

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "EC-02 pattern: gtag('set', 'user_data', { email }) fires BEFORE any conversion event — email trimmed+lowercased, Google hashes internally"
    - "EC-04 pattern: single crypto.randomUUID() generated at form submission, same value sent to gtag AND API body"
    - "sessionStorage relay pattern: LP form stores transaction_id in '_no_lp_tracking' JSON blob, danke page reads it for dedup continuity across page navigation"

key-files:
  created: []
  modified:
    - src/components/lp/sections/lead-form-section.tsx
    - src/components/lead-form.tsx
    - src/app/(lp)/lp/[city]/danke/conversion-tracker.tsx

key-decisions:
  - "Email passed raw (trimmed+lowercased) to gtag user_data — Google hashes internally (per Enhanced Conversions spec)"
  - "transaction_id stored in sessionStorage '_no_lp_tracking' JSON blob (same key as gclid) to avoid proliferating sessionStorage keys"
  - "Danke page uses deduplicationId = transactionId ?? crypto.randomUUID() fallback — conversion fires even when sessionStorage unavailable"
  - "Main form (lead-form.tsx) does not persist transaction_id to sessionStorage — no danke redirect, dedup is within the single function execution"

patterns-established:
  - "Shared UUID pattern: generate UUID once, pass to both analytics and backend — never generate separate IDs for the same event"
  - "user_data-before-event ordering: always set user_data before firing conversion/lead events for Enhanced Conversions compliance"

requirements-completed: [EC-02, EC-04]

# Metrics
duration: 2min
completed: 2026-02-26
---

# Phase 09 Plan 03: Enhanced Conversions Summary

**gtag user_data email (EC-02) and shared transaction_id deduplication (EC-04) wired to both LP form and main form, with danke page reading stored ID from sessionStorage**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-26T16:32:28Z
- **Completed:** 2026-02-26T16:34:49Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Both lead forms now fire `gtag('set', 'user_data', { email })` before conversion/lead events — enabling Enhanced Conversions cross-device attribution (EC-02)
- LP form generates one `crypto.randomUUID()` per submission, sends same value to Google Ads conversion tag AND `/api/lp-leads` POST body — single source of truth for deduplication (EC-04)
- Main form generates shared `transactionId` sent to both `generate_lead` GA4 event and `/api/leads` POST body (EC-04)
- Danke page `ConversionTracker` reads `transaction_id` from `sessionStorage._no_lp_tracking` (stored by LP form after submit) — reuses same ID for Google Ads conversion event and `lp_form_complete` GA4 event, preventing double-counting

## Task Commits

Each task was committed atomically:

1. **Task 1: LP form — fire user_data + shared transaction_id** - `31186ed` (feat)
2. **Task 2: Main form — fire user_data + shared transaction_id** - `3b3a5e5` (feat)
3. **Task 3: Danke page — read stored transaction_id from sessionStorage** - `3c281dd` (feat)

## Files Created/Modified

- `src/components/lp/sections/lead-form-section.tsx` — `fireConversionEvent` now accepts `email` + `transactionId`; UUID generated once and shared to gtag, API body, and sessionStorage
- `src/components/lead-form.tsx` — UUID generated before fetch, shared to API body; user_data + transaction_id added to generate_lead gtag event
- `src/app/(lp)/lp/[city]/danke/conversion-tracker.tsx` — reads `transaction_id` from sessionStorage, uses `deduplicationId = transactionId ?? crypto.randomUUID()` for both conversion events

## Decisions Made

- Email passed raw (trimmed+lowercased) to `gtag user_data` — per Google Enhanced Conversions spec, Google performs normalization and hashing internally. We do NOT hash client-side.
- `transaction_id` stored in the existing `_no_lp_tracking` sessionStorage JSON blob alongside `gclid` — avoids proliferating sessionStorage keys and keeps tracking data co-located.
- Main form does not write to sessionStorage — it shows an inline success state (no page navigation), so the transaction_id is shared within a single function execution only.
- `deduplicationId = transactionId ?? crypto.randomUUID()` fallback on danke page ensures conversion fires even in environments where sessionStorage is blocked (private/incognito modes with strict settings).

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- EC-02 and EC-04 client-side implementation complete
- Phase 09 (Enhanced Conversions) fully complete — all 3 plans done
- Ready for Phase 10 (offline conversion upload pipeline): transaction_id is now present in both gtag events and the leads table, enabling the upload queue to match online events to offline conversions

## Self-Check: PASSED

All created/modified files verified present:
- FOUND: src/components/lp/sections/lead-form-section.tsx
- FOUND: src/components/lead-form.tsx
- FOUND: src/app/(lp)/lp/[city]/danke/conversion-tracker.tsx
- FOUND: .planning/phases/09-enhanced-conversions/09-03-SUMMARY.md

All task commits verified:
- FOUND: 31186ed (feat(09-03): LP form fires user_data + shared transaction_id)
- FOUND: 3b3a5e5 (feat(09-03): main form fires user_data + shared transaction_id)
- FOUND: 3c281dd (feat(09-03): danke page reads shared transaction_id from sessionStorage)

---
*Phase: 09-enhanced-conversions*
*Completed: 2026-02-26*
