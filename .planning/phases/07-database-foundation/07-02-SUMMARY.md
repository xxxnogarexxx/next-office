---
phase: 07-database-foundation
plan: 02
subsystem: database
tags: [supabase, postgres, sql, migrations, attribution, gdpr, google-ads, enhanced-conversions]

# Dependency graph
requires:
  - phase: 07-01
    provides: visitors table (referenced by visitor_id FK in leads)
  - phase: leads-table-v1.0
    provides: existing leads table (ALTER TABLE target)
provides:
  - leads.visitor_id UUID FK to visitors(id) — links lead submissions to anonymous visitor sessions
  - leads.utm_source/medium/campaign/term/content — UTM attribution columns (Phase 8 will write)
  - leads.email_hash TEXT — SHA-256 hex string slot for Enhanced Conversions (Phase 9 will compute)
  - leads.consent_marketing/consent_data_processing BOOLEAN + consent_recorded_at — GDPR consent fields
  - leads.conversion_status TEXT CHECK ('new','qualified','closed','lost') — pipeline lifecycle state
  - leads.updated_at TIMESTAMPTZ with auto-update trigger
  - update_updated_at_column() function + triggers on leads, conversions, conversion_queue
  - Partial indexes on visitor_id, email_hash, and conversion_status index on leads
affects:
  - 08-visitor-tracking (writes visitor_id + UTMs into leads at form submission)
  - 09-enhanced-conversions (writes email_hash into leads at form submission)
  - 10-crm-webhook (updates conversion_status via idx_leads_email_hash lookup)
  - 12-cron-uploader (joins leads to conversions via lead_id)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ADD COLUMN IF NOT EXISTS pattern — idempotent ALTER TABLE safe to re-run without error"
    - "DROP TRIGGER IF EXISTS + CREATE TRIGGER — idempotent trigger creation in PostgreSQL"
    - "CREATE OR REPLACE FUNCTION — shared trigger function reused across multiple tables"
    - "Partial index on nullable FK: idx_leads_visitor_id WHERE visitor_id IS NOT NULL"

key-files:
  created:
    - supabase/migrations/005_leads_extension.sql
  modified: []

key-decisions:
  - "triggers apply to leads, conversions, conversion_queue only — visitors has no updated_at (uses last_seen_at), tracking_events is append-only with no updated_at"
  - "DROP TRIGGER IF EXISTS before CREATE TRIGGER for idempotency (PostgreSQL has no CREATE OR REPLACE TRIGGER)"
  - "conversion_status DEFAULT 'new' NOT NULL — all existing rows get 'new' on migration, no NULL values"
  - "consent_recorded_at nullable — distinct from created_at to support future re-consent flows"

patterns-established:
  - "Trigger idempotency: DROP TRIGGER IF EXISTS + CREATE TRIGGER (no CREATE OR REPLACE for triggers in PG)"
  - "Shared trigger function: single update_updated_at_column() function applied to multiple tables"

requirements-completed: [DB-02, DB-05]

# Metrics
duration: 3min
completed: 2026-02-26
---

# Phase 7 Plan 02: Database Foundation — Leads Extension Summary

**ALTER TABLE leads adding visitor_id FK (visitors), 5 UTM columns, email_hash, GDPR consent fields, conversion_status CHECK, updated_at trigger, and partial indexes for CRM webhook matching**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-26T11:02:05Z
- **Completed:** 2026-02-26T11:05:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Extended leads table with visitor_id UUID FK to visitors(id) ON DELETE SET NULL — anonymous visitor sessions linked to submitted leads (Phase 8 will set this)
- Added 5 UTM columns (source, medium, campaign, term, content) — ValidatedLeadData already validates these but insertLead was not writing them to the DB (v1.0 gap); Phase 8 will fix insertLead
- Added email_hash TEXT column for SHA-256 Enhanced Conversions (Phase 9 will compute at form submission)
- Added 3 GDPR consent columns: consent_marketing, consent_data_processing BOOLEAN + consent_recorded_at TIMESTAMPTZ
- Added conversion_status TEXT CHECK ('new','qualified','closed','lost') DEFAULT 'new' — all existing leads get 'new' status automatically
- Added updated_at TIMESTAMPTZ with CREATE OR REPLACE FUNCTION + triggers on leads, conversions, and conversion_queue
- Added 3 indexes: partial idx_leads_visitor_id (WHERE NOT NULL), partial idx_leads_email_hash (WHERE NOT NULL), idx_leads_conversion_status

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend leads table with visitor, attribution, and conversion columns** - `3b9f111` (feat)

**Plan metadata:** _(created in this step)_

## Files Created/Modified

- `supabase/migrations/005_leads_extension.sql` - ALTER TABLE leads with 13 ADD COLUMN IF NOT EXISTS statements, 3 indexes, shared trigger function, and 3 table triggers

## Decisions Made

- **Triggers on 3 tables, not 4:** The plan mentioned applying the updated_at trigger to "visitors, conversions, and conversion_queue" but visitors has `first_seen_at`/`last_seen_at` columns (no `updated_at`), and tracking_events is append-only with no `updated_at`. Applied triggers only to tables with `updated_at`: leads (new), conversions, conversion_queue.
- **DROP TRIGGER IF EXISTS + CREATE TRIGGER for idempotency:** PostgreSQL does not support `CREATE OR REPLACE TRIGGER` (only functions). Used DROP + CREATE pattern to make the migration re-runnable.
- **conversion_status NOT NULL DEFAULT 'new':** Made it NOT NULL so all rows have a defined status. All existing leads get 'new' automatically on migration execution.

## Deviations from Plan

### Auto-noted Differences

**1. [Rule 1 - Scope Clarification] Triggers applied to 3 tables (not 4 as stated in plan text)**
- **Found during:** Task 1 (reading 001_visitors.sql before writing migration)
- **Issue:** Plan says "apply trigger to visitors, conversions, and conversion_queue" but visitors table has no `updated_at` column (it uses `first_seen_at`/`last_seen_at`). tracking_events also has no `updated_at`.
- **Fix:** Applied trigger function to leads (new), conversions, and conversion_queue only — the 3 tables that actually have `updated_at` columns.
- **Files modified:** supabase/migrations/005_leads_extension.sql
- **Verification:** Grep confirms triggers created only for tables with updated_at column.
- **Committed in:** 3b9f111 (Task 1 commit)

---

**Total deviations:** 1 (scope clarification, not a plan error — plan text was ambiguous about which tables actually have updated_at)
**Impact on plan:** Correct behavior. No tables missing triggers; no triggers applied to tables without the column (which would cause SQL error).

## Issues Encountered

None — migration is purely SQL DDL, no runtime dependencies to verify.

## User Setup Required

Migration file `005_leads_extension.sql` must be applied to the Supabase project before Phases 8-10 can write the new columns. Apply after the Phase 7 Plan 01 migrations:

```bash
supabase db push
```

Or apply in Supabase SQL Editor in order: 001 → 002 → 003 → 004 → 005.

Note: 005 depends on 001 (visitors table must exist for visitor_id FK).

## Next Phase Readiness

- Phase 8 (Visitor Tracking): can now write `visitor_id`, `utm_*` columns into leads at form submission; `insertLead` in `src/lib/leads/supabase.ts` needs to be updated to include these columns
- Phase 9 (Enhanced Conversions): `email_hash` column is ready; Phase 9 will compute SHA-256 at form submission time
- Phase 10 (CRM Webhook): `conversion_status` column + `idx_leads_email_hash` index ready for webhook lookups
- No blockers — all DB-02 and DB-05 requirements satisfied

---
*Phase: 07-database-foundation*
*Completed: 2026-02-26*
