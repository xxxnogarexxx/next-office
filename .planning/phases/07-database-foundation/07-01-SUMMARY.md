---
phase: 07-database-foundation
plan: 01
subsystem: database
tags: [supabase, postgres, sql, rls, migrations, google-ads, attribution]

# Dependency graph
requires: []
provides:
  - visitors table with visitor_id, gclid, 5 UTM columns, ip_hash, user_agent, landing/referrer, timestamps
  - conversions table with idempotency_key, denormalized attribution, conversion_type CHECK constraint
  - conversion_queue table with platform, status lifecycle, retry mechanics, dead_letter support
  - tracking_events table with event_name, params JSONB, visitor_id FK, timestamps
  - RLS enabled on all 4 tables with no anon-permissive policies
affects:
  - 08-visitor-tracking (writes to visitors, tracking_events)
  - 09-enhanced-conversions (writes to conversions, conversion_queue)
  - 10-crm-webhook (writes to conversions)
  - 11-server-side-proxy (writes to tracking_events)
  - 12-cron-uploader (reads conversion_queue)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "RLS deny-all pattern: enable RLS with no permissive policies (service role bypasses for API routes)"
    - "Partial index pattern: idx_visitors_gclid WHERE gclid IS NOT NULL — only index rows relevant to lookup"
    - "Composite partial index: idx_queue_status_next_retry WHERE status IN ('pending','failed') for cron efficiency"
    - "Denormalized attribution: gclid/email_hash/UTMs copied to conversions to avoid JOINs at upload time"
    - "Idempotency key format: {crm_deal_id}:{conversion_type} as UNIQUE TEXT constraint"

key-files:
  created:
    - supabase/migrations/001_visitors.sql
    - supabase/migrations/002_conversions.sql
    - supabase/migrations/003_conversion_queue.sql
    - supabase/migrations/004_tracking_events.sql
  modified: []

key-decisions:
  - "Text CHECK constraints chosen over Postgres enums for status/type fields (easier ALTER TABLE for v2 expansion)"
  - "visitor_id FK in tracking_events is nullable with ON DELETE SET NULL — events survive visitor cleanup cycles"
  - "Denormalized attribution in conversions (gclid, email_hash, UTMs) avoids runtime JOINs during async queue processing"
  - "ip_hash uses SHA-256 (documented in column comment) — raw IP never stored"

patterns-established:
  - "Migration naming: NNN_table_name.sql with dependency order (001 before 004 that references it)"
  - "Every new table: CREATE TABLE + indexes + RLS enable, no permissive policies"
  - "Partial indexes for high-cardinality columns that are nullable (gclid) or filtered by status (queue)"

requirements-completed: [DB-01, DB-03, DB-04, DB-05]

# Metrics
duration: 1min
completed: 2026-02-26
---

# Phase 7 Plan 01: Database Foundation Summary

**4 Supabase tracking tables (visitors, conversions, conversion_queue, tracking_events) with RLS deny-all, FK chain, CHECK constraints, and partial indexes for cron-optimized queue processing**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-26T10:57:09Z
- **Completed:** 2026-02-26T10:58:49Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `visitors` table: visitor_id UNIQUE TEXT, gclid (only click ID for v1.1), 5 UTM columns, ip_hash (SHA-256), user_agent, landing_page, referrer, timestamps; partial index on gclid WHERE NOT NULL
- Created `conversions` table: lead_id FK (CASCADE), conversion_type CHECK ('qualified'|'closed'), idempotency_key UNIQUE, denormalized gclid/email_hash/UTMs for upload-time JOIN avoidance
- Created `conversion_queue` table: platform column, status CHECK (4 values), retry_count/max_retries=5, next_retry_at for backoff, composite partial index for cron processor efficiency
- Created `tracking_events` table: event_name, event_id (dedup), params JSONB, nullable visitor_id FK (ON DELETE SET NULL), page_url
- RLS enabled on all 4 tables with zero permissive policies — anon access denied by Supabase default

## Task Commits

Each task was committed atomically:

1. **Task 1: Create visitors and tracking_events tables with RLS** - `c98adee` (feat)
2. **Task 2: Create conversions and conversion_queue tables with RLS** - `6a5464f` (feat)

**Plan metadata:** (docs commit pending)

## Files Created/Modified

- `supabase/migrations/001_visitors.sql` - visitors table with attribution columns, partial gclid index, RLS
- `supabase/migrations/002_conversions.sql` - conversions table with idempotency, denormalized attribution, RLS
- `supabase/migrations/003_conversion_queue.sql` - conversion_queue with retry mechanics, composite partial index, RLS
- `supabase/migrations/004_tracking_events.sql` - tracking_events with JSONB params, nullable visitor FK, RLS

## Decisions Made

- **Text CHECK vs Postgres enums:** Used text + CHECK constraints instead of Postgres enum types. Rationale: ALTER TABLE to add values to a CHECK is simpler than `ALTER TYPE` for enums, supporting v2 platform expansion without migration complexity.
- **Nullable visitor_id FK in tracking_events:** Made FK nullable with ON DELETE SET NULL. Rationale: event analytics data should survive visitor record pruning/cleanup without orphan protection errors.
- **Denormalized attribution in conversions:** Copied gclid, email_hash, utm_source/medium/campaign directly into conversions row. Rationale: async queue processor runs independently and should not need to JOIN visitors → leads → conversions chain at upload time.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

The 4 SQL migration files must be run against the Supabase project before any application code in Phases 8-12 can write to these tables. Run migrations via Supabase CLI:

```bash
supabase db push
```

Or apply manually in Supabase SQL Editor in numbered order (001 → 002 → 003 → 004).

Note: 002_conversions.sql references `leads(id)` — the leads table must exist (created before this milestone).

## Next Phase Readiness

- All 4 tracking tables are ready for application code
- Phase 8 (Visitor Tracking) can write to `visitors` and `tracking_events`
- Phase 9 (Enhanced Conversions) can write to `conversions` and `conversion_queue` — depends on Phase 7 only, can run parallel to Phase 8
- Phase 11 (Server-Side Event Proxy) can write to `tracking_events`
- Phase 12 (Cron Uploader) can process `conversion_queue` via `idx_queue_status_next_retry` composite partial index

---
*Phase: 07-database-foundation*
*Completed: 2026-02-26*
