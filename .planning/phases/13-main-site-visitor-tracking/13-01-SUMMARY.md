---
phase: 13-main-site-visitor-tracking
plan: 01
subsystem: tracking
tags: [visit-tracking, supabase, cookies, attribution, gclid]

# Dependency graph
requires:
  - phase: 08-visitor-utm-capture
    provides: POST /api/track/visit endpoint and upsertVisitor() function that creates visitors rows
  - phase: 10-offline-conversion-pipeline
    provides: visitor_id FK on leads table and resolveVisitorUuid() wired in leads service
provides:
  - Main-site visitors now fire POST /api/track/visit on page load, creating a Supabase visitors row
  - visitor_id FK on main-site leads is now non-null when visitor had a prior page load
  - gclid attribution via CRM webhook matchLeadByEmail JOIN now works for main-site leads
affects: [crm-webhook, offline-conversion-pipeline, lead-attribution]

# Tech tracking
tech-stack:
  added: []
  patterns: [fire-and-forget visit tracking via useEffect on mount with credentials same-origin]

key-files:
  created: []
  modified:
    - src/components/tracking-provider.tsx

key-decisions:
  - "Main-site TrackingProvider fires visit tracking identically to LPTrackingProvider — single pattern for both site areas"
  - "useEffect with empty dep array fires once per mount — no sessionStorage, cookies handle persistence"
  - "credentials: same-origin required so HTTP-only cookies (_no_vid, _no_gclid, UTMs) are sent with the request"

patterns-established:
  - "Visit tracking pattern: fire-and-forget POST /api/track/visit useEffect on mount with credentials: same-origin and catch for non-fatal error logging"

requirements-completed:
  - CAP-03
  - CAP-04

# Metrics
duration: 3min
completed: 2026-02-27
---

# Phase 13 Plan 01: Main-Site Visitor Tracking Summary

**useEffect fire-and-forget POST /api/track/visit added to TrackingProvider, fixing null visitor_id FK on main-site leads and enabling gclid attribution via CRM webhook JOIN**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-27T03:20:00Z
- **Completed:** 2026-02-27T03:23:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- TrackingProvider now fires POST /api/track/visit on mount with credentials: same-origin, identical to LPTrackingProvider pattern
- Main-site page loads will create/update a Supabase visitors row via the existing upsertVisitor() endpoint
- resolveVisitorUuid() in leads service will now find a matching row, making visitor_id FK non-null on main-site leads
- gclid attribution via CRM webhook matchLeadByEmail JOIN is now operative for main-site leads

## Task Commits

Each task was committed atomically:

1. **Task 1: Add fire-and-forget visit tracking to main-site TrackingProvider** - `1595085` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified
- `src/components/tracking-provider.tsx` - Added useEffect that fires POST /api/track/visit on mount with credentials: same-origin; existing click ID URL param reading unchanged

## Decisions Made
- No new decisions — plan was self-contained and precise. Followed specification exactly.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript errors in `supabase/functions/process-conversion-queue/index.ts` (Deno Edge Function using Deno-specific syntax) — these are unrelated to this plan and out of scope per deviation rules.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 13 Plan 01 complete — main-site visitors now get Supabase visitors rows
- Ready to proceed to Plan 02 of Phase 13

---
*Phase: 13-main-site-visitor-tracking*
*Completed: 2026-02-27*

## Self-Check: PASSED

- FOUND: src/components/tracking-provider.tsx
- FOUND: commit 1595085 (feat(13-01): add fire-and-forget visit tracking to main-site TrackingProvider)
- FOUND: .planning/phases/13-main-site-visitor-tracking/13-01-SUMMARY.md
