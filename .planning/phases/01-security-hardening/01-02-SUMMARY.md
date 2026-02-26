---
phase: 01-security-hardening
plan: 02
subsystem: api
tags: [resend, email, xss, rate-limiting, security, next.js]

# Dependency graph
requires: []
provides:
  - HTML-escaped broker notification emails in both lead routes
  - Per-IP in-memory rate limiting (10 req/min) on both lead endpoints
  - Shared escapeHtml() utility duplicated in both route files
  - Friendly German 429 response with Retry-After header
affects: [03-lead-pipeline, phase-3-consolidation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "escapeHtml() utility function duplicated per route file (consolidated in Phase 3 REL-04)"
    - "Module-level in-memory Map rate limiter with setInterval cleanup"
    - "IP extraction via x-forwarded-for header (Vercel-compatible)"

key-files:
  created: []
  modified:
    - src/app/(main)/api/leads/route.ts
    - src/app/(lp)/api/lp-leads/route.ts

key-decisions:
  - "All user-submitted fields HTML-escaped — no exceptions, including email/phone in href attributes (encodeURIComponent for href value, escapeHtml for display text)"
  - "Rate limit: 10 req/min/IP, in-memory Map, does not persist across server restarts"
  - "429 body uses friendly German message: Zu viele Anfragen. Bitte versuchen Sie es später erneut."
  - "escapeHtml duplicated in both route files — consolidation deferred to Phase 3 REL-04"

patterns-established:
  - "escapeHtml pattern: all user fields wrapped in escapeHtml() before HTML interpolation"
  - "href pattern: encodeURIComponent for URL values, escapeHtml for visible text"
  - "Rate limiter pattern: module-level singleton Map, checkRateLimit() at top of handler before body parse"

requirements-completed: [SEC-04, SEC-05]

# Metrics
duration: 3min
completed: 2026-02-26
---

# Phase 01 Plan 02: Email XSS Prevention and Rate Limiting Summary

**HTML-escaped broker email templates and in-memory per-IP rate limiting (10 req/min) added to both /api/leads and /api/lp-leads routes**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-26T00:50:31Z
- **Completed:** 2026-02-26T00:53:24Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Added `escapeHtml()` utility to both `/api/leads` and `/api/lp-leads` routes — all user-provided fields (name, email, phone, company, message, city, listing_name, UTM data) are escaped before HTML email template interpolation
- Email subjects also escape all user-provided fields
- `mailto:` and `tel:` href values use `encodeURIComponent`, displayed text uses `escapeHtml`
- In-memory rate limiter (Map-based) enforces 10 req/min/IP on both routes with automatic 5-minute stale-entry cleanup
- Rate-limited requests receive 429 with `Retry-After` header and friendly German error message

## Task Commits

Each task was committed atomically:

1. **Task 1: HTML-escape email templates and add rate limiting to both lead routes** - `9066b3c` (fix — committed as part of 01-01 execution)

**Plan metadata:** (see final commit below)

## Files Created/Modified
- `src/app/(main)/api/leads/route.ts` - Added `escapeHtml()`, rate limiter, escaped all email template fields
- `src/app/(lp)/api/lp-leads/route.ts` - Added `escapeHtml()`, rate limiter, escaped all email template fields

## Decisions Made
- All user-submitted fields HTML-escaped — no exceptions per user decision in plan
- Rate limit: 10 req/min/IP using module-level in-memory Map (does not persist across restarts)
- 429 body uses friendly German message with `Retry-After` header
- `escapeHtml` function duplicated in each route file to keep routes self-contained; consolidation planned for Phase 3 REL-04

## Deviations from Plan

None — plan executed exactly as written. Changes were already present in HEAD from previous plan (01-01) execution which included these files in the same commit batch.

## Issues Encountered

None. TypeScript compilation passed cleanly (`npx tsc --noEmit`). All verification checks confirmed expected content in both route files.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- SEC-04 and SEC-05 requirements satisfied
- Both lead routes are now protected against HTML injection in broker emails and brute-force submission
- Phase 3 (lead pipeline) can consolidate `escapeHtml` utility into a shared lib file (REL-04)

---
*Phase: 01-security-hardening*
*Completed: 2026-02-26*
