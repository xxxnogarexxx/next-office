---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Ad Tracking & Offline Conversion Pipeline
status: unknown
last_updated: "2026-02-26T11:41:20Z"
progress:
  total_phases: 1
  completed_phases: 1
  total_plans: 3
  completed_plans: 3
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-26)

**Core value:** Lead capture must be secure, reliable, and observable — every submission persists and notifies the team.
**Current focus:** Phase 8 — Visitor & UTM Capture

## Current Position

Phase: 8 of 12 (Visitor & UTM Capture)
Plan: 2 of 3 in current phase — complete
Status: In progress
Last activity: 2026-02-26 — Phase 8 Plan 02 complete (POST /api/track/visit endpoint + upsertVisitor() with service role Supabase, CAP-03)

Progress: [███░░░░░░░] 22%

## Performance Metrics

**Velocity:**
- Total plans completed: 3 (v1.1)
- Average duration: 2 min
- Total execution time: 6 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 07-database-foundation | 2 | 4 min | 2 min |
| 08-visitor-utm-capture | 2 | 4 min | 2 min |

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
- visitor_id uses 30-day maxAge (not 90) — visitor sessions are tracking windows, not ad attribution windows
- generateVisitorId() extracted to src/lib/tracking/visitor.ts for testability (crypto.randomUUID(), Edge Runtime safe)
- UTM cookies follow first-touch attribution model: existing _no_utm_* cookies not overwritten on subsequent visits
- Two-step INSERT+UPDATE for visitor upsert — preserves first-touch UTMs (INSERT ignores conflict, UPDATE always sets last_seen_at)
- UTM cookie names are _no_utm_source (not _no_utm_utm_source) — UTM_KEYS uses short form, middleware reads utm_${key} from query string
- Tracking failures return HTTP 200 with { success: false } — tracking errors must not degrade user experience

### Pending Todos

- SEC-12 (post-launch config): Mapbox token URL restriction in dashboard
- DEV-03 (post-launch config): Sentry DSN + auth token setup (5 env vars)
- Run migrations against Supabase project (supabase db push) before Phases 8-12

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-26
Stopped at: Completed 08-02-PLAN.md — POST /api/track/visit endpoint with service role Supabase upsert (CAP-03)
Resume file: None
