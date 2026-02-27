---
phase: 09-enhanced-conversions
plan: "02"
subsystem: leads
tags: [enhanced-conversions, transaction-id, database, validation, supabase]
dependency_graph:
  requires: [09-01-PLAN.md, 005_leads_extension.sql]
  provides: [transaction_id column in leads table, validated transaction_id in ValidatedLeadData, transaction_id written to DB]
  affects: [09-03-PLAN.md (client-side form wiring), 10-offline-conversion (OFL-* offline upload dedup)]
tech_stack:
  added: []
  patterns: [ADD COLUMN IF NOT EXISTS idempotent migration, optional field validation with max-length guard]
key_files:
  created:
    - supabase/migrations/006_leads_transaction_id.sql
  modified:
    - src/lib/leads/validation.ts
    - src/lib/leads/supabase.ts
decisions:
  - "transaction_id stored as TEXT (UUID string, 36 chars) rather than UUID type — consistency with client-generated values, no cast overhead"
  - "Partial index on transaction_id (WHERE NOT NULL) — matches same pattern as email_hash and visitor_id indexes from migration 005"
  - "No service.ts change needed — resolvedData spreads ValidatedLeadData automatically, transaction_id flows through to insertLead"
  - "insertLead signature unchanged (no new parameter) — transaction_id is carried in ValidatedLeadData (data param) like all other form fields"
metrics:
  duration: "~1 min"
  completed: "2026-02-26"
  tasks_completed: 3
  files_modified: 3
requirements-completed: [EC-04]
---

# Phase 9 Plan 02: transaction_id server-side support Summary

Server-side transaction_id support: new migration column, validation, and Supabase write for Google Ads online/offline conversion deduplication (EC-04 server half).

## What Was Built

Added end-to-end transaction_id support on the server side:

1. **Migration 006** (`supabase/migrations/006_leads_transaction_id.sql`) — adds `transaction_id TEXT` column to `leads` table with a partial index for fast offline conversion matching.

2. **Validation** (`src/lib/leads/validation.ts`) — `ValidatedLeadData` interface extended with `transaction_id: string | null`. `validateLeadPayload` accepts and validates the field (optional, string, max 36 chars).

3. **Supabase write** (`src/lib/leads/supabase.ts`) — `insertLead` writes `data.transaction_id ?? null` to the new column. No signature change — backward-compatible.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Add transaction_id column to leads table (migration 006) | d81af79 |
| 2 | Extend ValidatedLeadData and validation to accept transaction_id | e032aab |
| 3 | Write transaction_id to leads table in insertLead | afba455 |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- Migration 006 creates `transaction_id TEXT` column with partial index — confirmed
- `ValidatedLeadData` has `transaction_id: string | null` at line 78 — confirmed
- `validateLeadPayload` validates transaction_id (max 36 chars, string type) at line 273-284 — confirmed
- `transaction_id` in return data object at line 309 — confirmed
- `insertLead` insert object includes `transaction_id: data.transaction_id ?? null` at line 156 — confirmed
- `insertLead` signature unchanged (still: data, visitorUuid?, emailHash?) — confirmed
- `service.ts` has no transaction_id changes (0 occurrences) — confirmed

## Self-Check: PASSED

Files created/modified:
- FOUND: supabase/migrations/006_leads_transaction_id.sql
- FOUND: src/lib/leads/validation.ts (transaction_id at lines 78, 273-284, 309)
- FOUND: src/lib/leads/supabase.ts (transaction_id at line 156)

Commits:
- FOUND: d81af79 — feat(09-02): add transaction_id column migration
- FOUND: e032aab — feat(09-02): extend ValidatedLeadData and validation to accept transaction_id
- FOUND: afba455 — feat(09-02): write transaction_id to leads table in insertLead
