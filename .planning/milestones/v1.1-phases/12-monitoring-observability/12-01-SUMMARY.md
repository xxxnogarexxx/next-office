---
phase: 12-monitoring-observability
plan: "01"
subsystem: api
tags: [supabase, next.js, health-check, conversion-queue, service-role]

# Dependency graph
requires:
  - phase: 10-offline-conversion-pipeline
    provides: conversion_queue table with status CHECK ('pending', 'uploaded', 'failed', 'dead_letter')

provides:
  - GET /api/health/tracking endpoint returning conversion pipeline status distribution
  - Pipeline health signal: healthy / degraded (failed items) / critical (dead_letter items)

affects:
  - ops-monitoring
  - 12-02 (any future monitoring plans in this phase)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Service role client created inline for tables with no anon SELECT RLS (consistent with resolveVisitorUuid pattern)
    - force-dynamic export on health endpoints to prevent stale caching
    - Parallel count queries with { count: "exact", head: true } for efficient status distribution
    - HTTP 200 always returned — JSON status field carries health signal (consistent with tracking error pattern)

key-files:
  created:
    - src/app/(main)/api/health/tracking/route.ts
  modified: []

key-decisions:
  - "Four parallel count queries (not GROUP BY) — ensures all four status keys always present in response even when count is 0"
  - "Service role client created inline — no shared factory needed for a single endpoint"
  - "HTTP 200 always returned — the status JSON field carries the health signal (consistent with /api/health pattern)"

patterns-established:
  - "Health endpoint pattern: force-dynamic + HTTP 200 + JSON status field for health signal"

requirements-completed: [MON-01]

# Metrics
duration: 1min
completed: 2026-02-27
---

# Phase 12 Plan 01: Conversion Pipeline Health Endpoint Summary

**GET /api/health/tracking returns conversion_queue status distribution with healthy/degraded/critical pipeline signal using service role client**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-27T02:23:52Z
- **Completed:** 2026-02-27T02:24:43Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created `GET /api/health/tracking` endpoint that queries conversion_queue for status counts
- Pipeline health derived from counts: healthy (no failed/dead_letter), degraded (failed > 0), critical (dead_letter > 0)
- Uses service role client (conversion_queue has no anon SELECT RLS — consistent with resolveVisitorUuid pattern)
- force-dynamic prevents Next.js from caching stale health data

## Task Commits

Each task was committed atomically:

1. **Task 1: Create /api/health/tracking endpoint with queue status counts** - `5f6bd43` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified
- `src/app/(main)/api/health/tracking/route.ts` - GET handler returning conversion pipeline health metrics with status counts for pending/uploaded/failed/dead_letter queue items

## Decisions Made
- Four parallel count queries (not GROUP BY) — ensures all four status keys always present in response even when a status has zero rows, avoiding post-processing to fill missing keys
- Service role client created inline (same pattern as `resolveVisitorUuid` in `src/lib/leads/supabase.ts`) — no shared factory needed for a single endpoint
- HTTP 200 always returned — the `status` JSON field carries the health signal, consistent with the established tracking error pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Health endpoint is ready; operators can poll GET /api/health/tracking to check pipeline status
- Endpoint returns structured JSON suitable for uptime monitoring tools (e.g., UptimeRobot, Betterstack) checking for `status != "critical"`
- No blockers for remaining plans in Phase 12

---
*Phase: 12-monitoring-observability*
*Completed: 2026-02-27*
