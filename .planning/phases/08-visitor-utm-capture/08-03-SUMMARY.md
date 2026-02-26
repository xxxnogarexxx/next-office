---
phase: 08-visitor-utm-capture
plan: "03"
subsystem: api
tags: [leads, visitor-tracking, utm, supabase, service-role, cookies, next.js]

# Dependency graph
requires:
  - "08-01: _no_vid and _no_utm_* cookies written by middleware"
  - "08-02: /api/track/visit endpoint and upsertVisitor() (CAP-03)"
  - "07: leads table with visitor_id FK and UTM columns (migration 005)"
provides:
  - "insertLead() writes visitor_id UUID FK and all 5 UTM columns to leads table (CAP-04, CAP-05)"
  - "resolveVisitorUuid(): TEXT visitor_id cookie → UUID PK from visitors table (service role)"
  - "handleLeadSubmission() reads _no_vid cookie and resolves to visitors UUID PK"
  - "handleLeadSubmission() reads _no_utm_* cookies as authoritative UTM source"
  - "LPTrackingProvider fires POST /api/track/visit on page load (ensures visitor row exists)"
affects:
  - 09-enhanced-conversions
  - 10-lead-capture-api

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two-parameter insertLead(data, visitorUuid) — visitorUuid resolved server-side before insert"
    - "Cookie values take priority over body values for UTMs (same pattern as gclid)"
    - "resolveVisitorUuid() uses service role client (visitors has no anon SELECT RLS policy)"
    - "Non-fatal visitor resolution: null visitorUuid means lead inserted without visitor FK"
    - "Fire-and-forget visit tracking in LP provider: fetch() with .catch() swallowing errors"

key-files:
  created: []
  modified:
    - src/lib/leads/supabase.ts
    - src/lib/leads/service.ts
    - src/components/lp/tracking/lp-tracking-provider.tsx

key-decisions:
  - "resolveVisitorUuid uses service role client inline (not imported module) — visitors table has no anon SELECT policy"
  - "Cookie values preferred over body values for UTMs (first-touch attribution is set on landing, not at form submit)"
  - "visitorUuid passed as separate second param to insertLead (not merged into ValidatedLeadData) — keeps ValidatedLeadData focused on form payload"
  - "LPTrackingProvider fires visit tracking on mount so visitor row exists before form submission"

requirements-completed: [CAP-04, CAP-05]

# Metrics
duration: 3min
completed: "2026-02-26"
---

# Phase 08 Plan 03: Visitor ID and UTM Attribution in Lead Pipeline Summary

**Wires visitor_id UUID FK and 5 UTM columns from _no_vid/_no_utm_* cookies into Supabase leads table on form submission**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-26T11:38:33Z
- **Completed:** 2026-02-26T11:41:48Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Added `resolveVisitorUuid(visitorIdText)` to `src/lib/leads/supabase.ts`: does a SELECT on visitors WHERE visitor_id = text, returns the UUID id column. Uses service role client (visitors has no anon SELECT RLS policy). Non-fatal: returns null on any failure; lead insert proceeds without visitor FK.
- Extended `insertLead()` to accept optional `visitorUuid?: string | null` as second parameter and write `visitor_id` UUID FK plus all 5 UTM columns (utm_source, utm_medium, utm_campaign, utm_term, utm_content) to the leads table.
- Extended `handleLeadSubmission()` in `src/lib/leads/service.ts`:
  - Step 5b: reads `_no_vid` cookie, calls `resolveVisitorUuid()` to get UUID
  - Step 5c: reads `_no_utm_*` cookies as authoritative UTM source (falls back to body values if no cookie)
  - Step 7: calls `insertLead(resolvedData, visitorUuid)` with resolved visitor UUID
- Added fire-and-forget `POST /api/track/visit` call to `LPTrackingProvider` useEffect on mount — ensures visitor row exists in Supabase before user submits the lead form.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend insertLead() with visitor_id UUID FK and UTM columns** - `f17c2e1` (feat)
2. **Task 2: Extend handleLeadSubmission() to resolve visitor_id and pass UTMs from cookies** - `42e71f2` (feat)
3. **Task 3: Add visit tracking call to LP tracking provider** - `ea00d5c` (feat)

## Files Created/Modified

- `src/lib/leads/supabase.ts` - Added `resolveVisitorUuid()` helper + extended `insertLead()` with visitor_id FK and 5 UTM columns
- `src/lib/leads/service.ts` - Extended pipeline with Step 5b (visitor UUID resolution) and Step 5c (UTM cookie merge), updated insertLead call
- `src/components/lp/tracking/lp-tracking-provider.tsx` - Added useEffect to fire POST /api/track/visit on mount

## Decisions Made

- `resolveVisitorUuid()` uses service role client created inline (not via shared factory) — visitors table has no anon SELECT RLS policy and the function needs its own isolated client
- Cookie values take priority over body values for UTMs — cookies are set by middleware at the moment of landing, which is the canonical first-touch attribution event; body values are a fallback for non-LP form paths
- `visitorUuid` passed as second parameter to `insertLead()` rather than merged into `ValidatedLeadData` — keeps the validated payload type focused on form input fields
- LPTrackingProvider fires visit tracking on mount so the visitor row in Supabase exists before the user submits the form (handles the race condition where a visitor submits the form very quickly)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

A pre-existing TypeScript error in `src/lib/tracking/visit.ts` was discovered during verification: `.catch()` called on `.throwOnError()` result which doesn't expose `.catch()` in its type. On inspection, the file on disk had already been fixed (using try/catch pattern instead) — the error was only visible in a stash test. TypeScript passed clean throughout execution.

## User Setup Required

None - no external service configuration required. Migrations (005_leads_extension.sql) must be applied to Supabase before this code has effect (prerequisite from Phase 7 plan list).

## Next Phase Readiness

- Lead form submissions now write visitor_id FK and all 5 UTM columns to the leads table
- Visitor row is created before form submission via LPTrackingProvider visit tracking
- Phase 09 (Enhanced Conversions) can now JOIN leads → visitors to get gclid for Google Ads conversion upload
- No blockers

---
*Phase: 08-visitor-utm-capture*
*Completed: 2026-02-26*

## Self-Check: PASSED

- FOUND: src/lib/leads/supabase.ts
- FOUND: src/lib/leads/service.ts
- FOUND: src/components/lp/tracking/lp-tracking-provider.tsx
- FOUND: .planning/phases/08-visitor-utm-capture/08-03-SUMMARY.md
- FOUND commit: f17c2e1 (feat(08-03): extend insertLead() with visitor_id UUID FK and UTM columns)
- FOUND commit: 42e71f2 (feat(08-03): extend handleLeadSubmission() to resolve visitor_id and pass UTMs from cookies)
- FOUND commit: ea00d5c (feat(08-03): add visit tracking call to LP tracking provider on mount)
