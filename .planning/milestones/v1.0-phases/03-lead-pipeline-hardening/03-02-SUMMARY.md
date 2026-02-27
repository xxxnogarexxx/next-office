---
phase: 03-lead-pipeline-hardening
plan: "02"
subsystem: api
tags: [csrf, security, next.js, lead-capture, supabase]

# Dependency graph
requires:
  - phase: 03-01
    provides: "handleLeadSubmission and handleCsrfToken in src/lib/leads/service.ts"
provides:
  - "Thin route wrappers for /api/leads and /api/lp-leads delegating to shared service"
  - "CSRF token endpoint at /api/csrf"
  - "CSRF token flow in LeadForm and LeadFormSection components"
  - "Updated CORS middleware allowing x-csrf-token header in preflight"
affects:
  - "03-03 (Phase 3 Plan 3)"
  - "Any future form components making POST requests to lead endpoints"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Thin route delegation — route handlers are single-function wrappers, all logic in shared service"
    - "CSRF double-submit cookie — token fetched on mount, sent in x-csrf-token header, verified server-side"
    - "Non-blocking CSRF fetch — form renders immediately, token attached when available"

key-files:
  created:
    - "src/app/(main)/api/csrf/route.ts"
  modified:
    - "src/app/(main)/api/leads/route.ts"
    - "src/app/(lp)/api/lp-leads/route.ts"
    - "src/components/lead-form.tsx"
    - "src/components/lp/sections/lead-form-section.tsx"
    - "src/middleware.ts"

key-decisions:
  - "handleCsrfToken returns { csrfToken: token } — forms read data.csrfToken (not data.token)"
  - "CSRF fetch silent fail (catch: {}) — server validates, form still submittable if endpoint unreachable"
  - "Route files reduced from 167/233 lines to 5 lines each — zero business logic in route handlers"

patterns-established:
  - "Route delegation pattern: route.ts imports only from @/lib/leads/service, exports only the HTTP handler"
  - "CSRF pattern: useEffect on mount fetches /api/csrf, stores token in state, spreads into headers on submit"

requirements-completed: [SEC-07, SEC-08, SEC-09, SEC-10, SEC-11, REL-04, REL-05, REL-06]

# Metrics
duration: 2min
completed: 2026-02-26
---

# Phase 3 Plan 02: Lead Pipeline Wiring Summary

**Thin route wrappers + CSRF token endpoint + form CSRF integration making the shared lead service live end-to-end**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-26T01:59:58Z
- **Completed:** 2026-02-26T02:01:43Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Replaced 400 lines of duplicated route logic with 10 lines of thin delegation to the shared service
- Created /api/csrf GET endpoint that generates CSRF token pairs and sets the _no_csrf cookie
- Added CSRF token fetch on mount and x-csrf-token header to both lead form components
- Updated CORS middleware to allow x-csrf-token in preflight Access-Control-Allow-Headers

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor route files to use shared service and create CSRF endpoint** - `c76c7ab` (feat)
2. **Task 2: Update lead form components with CSRF token flow** - `4ae9b6c` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified
- `src/app/(main)/api/leads/route.ts` - Reduced from 167 lines to 5; delegates to handleLeadSubmission(request, "main")
- `src/app/(lp)/api/lp-leads/route.ts` - Reduced from 233 lines to 5; delegates to handleLeadSubmission(request, "lp")
- `src/app/(main)/api/csrf/route.ts` - New CSRF token endpoint; delegates to handleCsrfToken
- `src/components/lead-form.tsx` - Added csrfToken state, /api/csrf fetch on mount, x-csrf-token header in POST
- `src/components/lp/sections/lead-form-section.tsx` - Same CSRF token pattern as LeadForm
- `src/middleware.ts` - Access-Control-Allow-Headers now includes "x-csrf-token" for preflight

## Decisions Made
- `handleCsrfToken` in service.ts returns `{ csrfToken: token }` (not `{ token }`). Forms read `data.csrfToken` — matched the actual service implementation from Plan 01.
- Silent catch on CSRF fetch in forms — the form is still submittable if /api/csrf is unreachable; the server will reject without a valid token, which is the correct security fallback.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- End-to-end lead pipeline is now fully hardened: rate limiting, CSRF protection, input validation, duplicate detection, scoped DB access, and async email all live
- Phase 3 Plan 03 can proceed with any remaining pipeline tasks

## Self-Check: PASSED

All files verified present on disk. Both task commits verified in git log.

---
*Phase: 03-lead-pipeline-hardening*
*Completed: 2026-02-26*
