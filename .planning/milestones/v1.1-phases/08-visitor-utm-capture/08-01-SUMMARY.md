---
phase: 08-visitor-utm-capture
plan: "01"
subsystem: infra
tags: [middleware, cookies, utm, visitor-tracking, next.js, edge-runtime]

# Dependency graph
requires: []
provides:
  - "_no_vid HTTP-only cookie: persistent visitor UUID generated on first visit, preserved on return visits (CAP-01)"
  - "_no_utm_* HTTP-only cookies: 5 UTM parameters captured from query string, 30-day maxAge (CAP-02)"
  - "src/lib/tracking/visitor.ts: shared constants + generateVisitorId() helper for testability"
affects:
  - 08-visitor-utm-capture
  - 09-enhanced-conversions
  - 10-lead-capture-api

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Cookie prefix _no_ used for all next-office tracking cookies"
    - "30-day maxAge for visitor/UTM cookies vs 90-day for gclid attribution cookies"
    - "First-touch attribution: UTM cookies not overwritten on subsequent visits"
    - "Return-visit guard: check existing cookie before generating new UUID"

key-files:
  created:
    - src/lib/tracking/visitor.ts
  modified:
    - src/middleware.ts

key-decisions:
  - "visitor_id uses 30-day maxAge (not 90) — visitor sessions are tracking windows, not ad attribution windows"
  - "generateVisitorId() extracted to visitor.ts for testability — crypto.randomUUID() available in Edge Runtime"
  - "UTM cookies follow first-touch attribution model: existing cookies not overwritten by new visits"
  - "visitor_id cookie only generated for non-API routes (same guard as existing gclid tracking)"

patterns-established:
  - "Tracking helpers extracted to src/lib/tracking/ for testability and separation of concerns"
  - "Conditional cookie writes: only set when value present, check existing before generating"

requirements-completed: [CAP-01, CAP-02]

# Metrics
duration: 2min
completed: "2026-02-26"
---

# Phase 08 Plan 01: Visitor ID and UTM Cookie Capture Summary

**HTTP-only _no_vid UUID cookie on first visit + _no_utm_* cookies for all 5 UTM params via Next.js Edge Middleware**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-26T11:34:10Z
- **Completed:** 2026-02-26T11:35:42Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created `src/lib/tracking/visitor.ts` with VISITOR_COOKIE_NAME, VISITOR_COOKIE_MAX_AGE, UTM_COOKIE_PREFIX, UTM_COOKIE_MAX_AGE, UTM_KEYS, UTMKey type, and `generateVisitorId()` — all server-safe, Edge Runtime compatible
- Extended `src/middleware.ts` to generate `_no_vid` UUID cookie on first visit and preserve it on return visits (return-visit guard via `existingVisitorId` check)
- Added UTM capture for all 5 parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content) into `_no_utm_*` HTTP-only cookies — only set when param is present (no blank cookies)
- All existing middleware behavior preserved: CORS, gclid/gbraid/wbraid 90-day cookies, lp/ref cookies on click IDs

## Task Commits

Each task was committed atomically:

1. **Task 1: Create src/lib/tracking/visitor.ts helper module** - `5cfacaa` (feat)
2. **Task 2: Extend middleware.ts with visitor_id and UTM cookie logic** - `46d1fea` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/lib/tracking/visitor.ts` - Visitor tracking constants (VISITOR_COOKIE_NAME, UTM_KEYS, etc.) and generateVisitorId() helper
- `src/middleware.ts` - Extended with visitor_id generation (CAP-01) and UTM parameter capture (CAP-02)

## Decisions Made
- visitor_id uses 30-day maxAge (not 90) — visitor sessions are tracking windows, not ad attribution windows (90-day is correct for gclid Google Ads conversion window)
- generateVisitorId() extracted to src/lib/tracking/visitor.ts for testability — crypto.randomUUID() is available in Next.js Edge Runtime
- UTM cookies follow first-touch attribution model: existing _no_utm_* cookies not overwritten on subsequent visits
- No blank UTM cookies: only set when the corresponding query parameter is actually present in the URL

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — TypeScript passed clean with no errors on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Visitor ID and UTM cookies are now set on every non-API page visit
- Phase 08-02 and 08-03 can read _no_vid and _no_utm_* cookies from the request
- Phase 09 (Enhanced Conversions) and Phase 10 (Lead Capture API) both depend on these cookies being available
- No blockers

---
*Phase: 08-visitor-utm-capture*
*Completed: 2026-02-26*

## Self-Check: PASSED

- FOUND: src/lib/tracking/visitor.ts
- FOUND: src/middleware.ts
- FOUND: .planning/phases/08-visitor-utm-capture/08-01-SUMMARY.md
- FOUND commit: 5cfacaa (feat(08-01): create visitor tracking helper module)
- FOUND commit: 46d1fea (feat(08-01): extend middleware with visitor_id and UTM cookie capture)
