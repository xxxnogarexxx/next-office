---
phase: 13-main-site-visitor-tracking
plan: 02
subsystem: infra
tags: [google-ads, offline-conversions, documentation, dead-code]

# Dependency graph
requires:
  - phase: 10-offline-conversion-pipeline
    provides: "google-ads.ts original upload implementation; decision to duplicate logic for Deno Edge Function"
provides:
  - "google-ads.ts clearly annotated as reference-only, not runtime code"
affects: [future maintainers editing upload logic, process-conversion-queue Edge Function sync]

# Tech tracking
tech-stack:
  added: []
  patterns: [reference-implementation annotation pattern for files duplicated into Edge Functions]

key-files:
  created: []
  modified:
    - src/lib/conversions/google-ads.ts

key-decisions:
  - "google-ads.ts kept (not deleted) — serves as canonical reference for OAuth2 flow, uploadClickConversions payload structure, and conversion action mapping"
  - "JSDoc banner replaces generic module comment — warns no runtime code imports this file and cross-references the Deno Edge Function that duplicates the logic"

patterns-established:
  - "Reference-only files: use REFERENCE IMPLEMENTATION banner in JSDoc with explicit warning, cross-reference to runtime code location, and sync instruction"

requirements-completed:
  - CAP-03
  - CAP-04

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 13 Plan 02: Dead Code Documentation Summary

**google-ads.ts annotated as REFERENCE IMPLEMENTATION — explicit banner warns no runtime code imports this file and cross-references the Deno Edge Function queue processor**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-27T04:55:00Z
- **Completed:** 2026-02-27T04:57:58Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Replaced the generic Google Ads module comment with a prominent REFERENCE IMPLEMENTATION banner
- Banner warns that the file is not imported by any runtime code
- Cross-references `supabase/functions/process-conversion-queue/index.ts` as the actual runtime path
- Instructs maintainers to update both files when changing upload logic

## Task Commits

Each task was committed atomically:

1. **Task 1: Annotate google-ads.ts as reference implementation** - `d79ba7d` (docs)

**Plan metadata:** (final commit — docs + state update)

## Files Created/Modified

- `src/lib/conversions/google-ads.ts` - Replaced module JSDoc with REFERENCE IMPLEMENTATION banner; no code changes

## Decisions Made

- Keep the file rather than delete it — it contains the only documented source of the OAuth2 token refresh flow and uploadClickConversions payload structure in the main codebase. Deleting it would remove context needed when updating the Deno Edge Function.
- No code changes — only the top-level module comment was modified, preserving all implementation details as reference.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- Pre-existing TypeScript errors in `supabase/functions/process-conversion-queue/index.ts` appeared in `npx tsc --noEmit` output — these are Deno-specific syntax errors from before this plan and are out of scope. Confirmed zero errors in `src/` files.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 13-02 is complete — dead code is documented with clear annotation
- No blockers for remaining Phase 13 plans

---
*Phase: 13-main-site-visitor-tracking*
*Completed: 2026-02-27*

## Self-Check: PASSED

- FOUND: src/lib/conversions/google-ads.ts
- FOUND: d79ba7d (docs(13-02): annotate google-ads.ts as reference implementation)
