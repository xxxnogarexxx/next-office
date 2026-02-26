---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Ad Tracking & Offline Conversion Pipeline
status: unknown
last_updated: "2026-02-26T11:07:40.965Z"
progress:
  total_phases: 1
  completed_phases: 1
  total_plans: 2
  completed_plans: 2
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-26)

**Core value:** Lead capture must be secure, reliable, and observable — every submission persists and notifies the team.
**Current focus:** Phase 7 — Database Foundation

## Current Position

Phase: 7 of 12 (Database Foundation)
Plan: 2 of 2 in current phase — PHASE COMPLETE
Status: In progress
Last activity: 2026-02-26 — Phase 7 Plan 02 complete (leads table extended with visitor_id FK, UTMs, email_hash, consent, conversion_status)

Progress: [██░░░░░░░░] 17%

## Performance Metrics

**Velocity:**
- Total plans completed: 2 (v1.1)
- Average duration: 2 min
- Total execution time: 4 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 07-database-foundation | 2 | 4 min | 2 min |

*Updated after each plan completion*

## Accumulated Context

### Decisions

- Direct CRM webhook from NetHunt (cutting out n8n for conversion flow)
- Queue + cron processing (Supabase Edge Function, every 15 min) over immediate upload
- Google Ads only for v1.1 (Meta CAPI deferred to v2)
- Cookie consent banner deferred — legal review needed
- Phase 9 (Enhanced Conversions) depends on Phase 7 only — can run parallel to Phase 8
- Text CHECK constraints over Postgres enums for status/type fields (simpler ALTER TABLE for v2 expansion)
- visitor_id FK in tracking_events nullable with ON DELETE SET NULL (events survive visitor cleanup)
- Denormalized attribution in conversions (gclid, email_hash, UTMs) to avoid JOINs in async queue processing
- updated_at trigger applied to leads/conversions/conversion_queue only — visitors uses last_seen_at, tracking_events is append-only (no updated_at column)
- conversion_status NOT NULL DEFAULT 'new' — all existing leads get 'new' status on migration, ensuring no NULL values in pipeline

### Pending Todos

- SEC-12 (post-launch config): Mapbox token URL restriction in dashboard
- DEV-03 (post-launch config): Sentry DSN + auth token setup (5 env vars)
- Run migrations against Supabase project (supabase db push) before Phases 8-12

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-26
Stopped at: Completed 07-02-PLAN.md — leads table extended with visitor_id FK, UTMs, email_hash, consent, conversion_status, updated_at trigger
Resume file: None
