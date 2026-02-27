---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Ad Tracking & Offline Conversion Pipeline
status: unknown
last_updated: "2026-02-27T01:21:33Z"
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 11
  completed_plans: 9
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-26)

**Core value:** Lead capture must be secure, reliable, and observable — every submission persists and notifies the team.
**Current focus:** Phase 10 — Offline Conversion Pipeline

## Current Position

Phase: 10 of 12 (Offline Conversion Pipeline) — COMPLETE
Plan: 3 of 3 in current phase — complete
Status: Phase 10 complete — Conversion queue processor Edge Function deployed
Last activity: 2026-02-27 — Phase 10 Plan 03 complete (OFL-05/07: Deno Edge Function, exponential backoff 15min→1h→4h→16h, dead letter after 5 failures)

Progress: [█████████░] 82%

## Performance Metrics

**Velocity:**
- Total plans completed: 9 (v1.1)
- Average duration: 2.0 min
- Total execution time: ~15 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 07-database-foundation | 2 | 4 min | 2 min |
| 08-visitor-utm-capture | 3 | 7 min | 2.3 min |
| 09-enhanced-conversions | 3/3 | 4 min | 1.3 min |
| 10-offline-conversion-pipeline | 3/3 | 6 min | 2 min |

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
- resolveVisitorUuid uses service role client inline (not shared factory) — visitors table has no anon SELECT RLS policy
- Cookie values preferred over body values for UTMs at lead submission time (first-touch attribution set on landing, cookies are canonical)
- visitorUuid passed as second param to insertLead() — ValidatedLeadData stays focused on form payload, not server-resolved values
- LPTrackingProvider fires visit tracking on mount (fire-and-forget) so visitor row exists before user submits form
- allow_enhanced_conversions applied only to Google Ads gtag config — not GA4 (per Google spec)
- hashEmail normalizes before hashing: trim + lowercase (Google Enhanced Conversions requirement)
- emailHash param is optional in insertLead — backward-compatible with existing callers
- No migration needed for email_hash — column already exists from migration 005_leads_extension.sql
- [Phase 09-enhanced-conversions]: transaction_id stored as TEXT (max 36 chars) and written to leads table via ValidatedLeadData — no insertLead signature change
- [Phase 09-enhanced-conversions]: Email passed raw (trimmed+lowercased) to gtag user_data — Google hashes internally per Enhanced Conversions spec
- [Phase 09-enhanced-conversions]: transaction_id stored in existing _no_lp_tracking sessionStorage blob — avoids proliferating keys, keeps tracking data co-located
- [Phase 10-01 CRM webhook]: Route placed under (main)/api/ route group — no bare src/app/api/ directory exists in this project
- [Phase 10-01 CRM webhook]: Idempotency via 23505 Postgres error code detection + existing row lookup — prevents duplicate conversions on CRM webhook retries
- [Phase 10-01 CRM webhook]: matchLeadByEmail uses .single() — PGRST116 on unknown email treated as lead_not_found (200 response)
- [Phase 10-offline-conversion-pipeline]: Google Ads REST API v18 over npm client library — native fetch sufficient for single-conversion uploads, no new dependencies
- [Phase 10-offline-conversion-pipeline]: In-memory OAuth2 token cache with 5-min expiry buffer — acceptable for Vercel serverless, token refresh is cheap
- [Phase 10-offline-conversion-pipeline]: gclid at clickConversion top level (not in userIdentifiers) — matches Google API schema; userIdentifiers is for Enhanced Conversions email/phone hashes only
- [Phase 10-offline-conversion-pipeline]: Consent signals hardcoded as GRANTED — consent captured at lead form submission time (opt-in)
- [Phase 10-03 queue processor]: Sequential queue processing (not parallel) — avoids Google Ads API rate limits at B2B volume
- [Phase 10-03 queue processor]: Upload logic duplicated from google-ads.ts for Deno Edge Function — cannot import from Next.js app, two modules must stay in sync
- [Phase 10-03 queue processor]: Missing conversion record → immediate dead_letter (unrecoverable, no data to upload)

### Pending Todos

- SEC-12 (post-launch config): Mapbox token URL restriction in dashboard
- DEV-03 (post-launch config): Sentry DSN + auth token setup (5 env vars)
- Run migrations against Supabase project (supabase db push) before Phases 8-12

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-27
Stopped at: Completed 10-03-PLAN.md — Deno Edge Function process-conversion-queue with exponential backoff retry (15min→1h→4h→16h) and dead letter handling after 5 failures.
Resume file: None
