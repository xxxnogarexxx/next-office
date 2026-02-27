---
phase: 12-monitoring-observability
plan: "02"
subsystem: database
tags: [postgres, supabase, sql, views, metrics, google-ads, gclid]

# Dependency graph
requires:
  - phase: 07-database-foundation
    provides: visitors table (gclid column), leads table
  - phase: 08-visitor-utm-capture
    provides: leads.visitor_id FK linking leads to visitors
  - phase: 09-enhanced-conversions
    provides: leads.gclid column (direct gclid on leads)
  - phase: 10-offline-conversion-pipeline
    provides: conversion_queue table with status values (pending/uploaded/failed/dead_letter)
provides:
  - conversion_metrics SQL view returning gclid_capture_rate and upload_success_rate as decimals
  - Queryable single-row metric snapshot via SELECT * FROM conversion_metrics (no joins needed)
  - Raw counts alongside rates for transparency (leads_with_gclid, total_leads, uploads_successful, total_queued)
  - Queue status breakdown (queue_pending, queue_failed, queue_dead_letter)
affects: [monitoring dashboards, operator queries, future analytics phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "COALESCE(numerator / NULLIF(denominator, 0), 0) for safe decimal rate computation with empty-table guard"
    - "FILTER (WHERE ...) for conditional aggregation in Postgres (cleaner than CASE WHEN)"
    - "CREATE OR REPLACE VIEW for idempotent SQL views (safe to re-run)"
    - "Subquery per table for cross-table aggregates in a single-FROM view (avoids cartesian product)"

key-files:
  created:
    - supabase/migrations/007_conversion_metrics_view.sql
  modified: []

key-decisions:
  - "Regular view (not materialized) — B2B volume means tables are small; real-time accuracy preferred over caching"
  - "Subquery approach for conversion_queue metrics — avoids cartesian product from joining two unrelated aggregate tables"
  - "COALESCE with NULLIF pattern — returns 0 rate (not NULL) when tables are empty, preventing division-by-zero"
  - "LEFT JOIN from leads to visitors — leads without visitor_id still count in total_leads"
  - "Dual gclid source check (leads.gclid OR visitors.gclid) via COALESCE — captures both direct URL param and middleware-set gclid"

patterns-established:
  - "View-based metrics: encapsulate join logic in SQL views so operators can SELECT * without SQL expertise"
  - "Safe rate formula: COALESCE(CAST(numerator FILTER ...) / NULLIF(total, 0), 0)"

requirements-completed: [MON-02]

# Metrics
duration: 1min
completed: "2026-02-27"
---

# Phase 12 Plan 02: Conversion Metrics View Summary

**Postgres view `conversion_metrics` returning gclid capture rate and upload success rate as decimals, queryable via `SELECT * FROM conversion_metrics` with empty-table zero-value guard**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-27T02:23:54Z
- **Completed:** 2026-02-27T02:24:38Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created `supabase/migrations/007_conversion_metrics_view.sql` with `CREATE OR REPLACE VIEW conversion_metrics`
- gclid_capture_rate computed as (leads with non-null gclid from either leads.gclid or visitors.gclid) / total_leads — checks both gclid sources via LEFT JOIN
- upload_success_rate computed as uploaded / total queue items — subquery approach avoids cartesian product
- COALESCE + NULLIF pattern ensures 0.0 returned (not NULL or error) when either table is empty
- Raw counts included alongside rates: leads_with_gclid, total_leads, uploads_successful, total_queued
- Queue status breakdown included: queue_pending, queue_failed, queue_dead_letter, plus computed_at timestamp

## Task Commits

Each task was committed atomically:

1. **Task 1: Create conversion_metrics SQL view migration** - `8dc30fa` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `supabase/migrations/007_conversion_metrics_view.sql` - Postgres view encapsulating gclid capture rate and upload success rate metrics for operator-friendly querying

## Decisions Made
- Regular view (not materialized): B2B volume is small; real-time accuracy preferred over caching. Materialized view adds refresh complexity for no meaningful perf gain.
- Subquery per table for conversion_queue metrics: joining conversion_queue to leads would produce a cartesian product (each lead row multiplied by each queue row). Subqueries keep aggregates cleanly separated.
- LEFT JOIN from leads to visitors: ensures leads without visitor_id (pre-v1.1 leads or no-JS environments) still count toward total_leads and gclid denominator.
- Dual gclid source check (l.gclid IS NOT NULL OR v.gclid IS NOT NULL): leads have a direct gclid column (from URL param capture at form submission) and an indirect path via visitor.gclid (set by middleware). Either source counts as attributed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. The view is applied via `supabase db push` alongside the other migrations (already in pending todos in STATE.md).

## Next Phase Readiness
- conversion_metrics view SQL is complete and ready to apply via supabase db push
- Phase 12 Plan 01 (Sentry) and Plan 02 (this view) can be applied independently
- Operators can query SELECT * FROM conversion_metrics after migrations are applied

---
*Phase: 12-monitoring-observability*
*Completed: 2026-02-27*
