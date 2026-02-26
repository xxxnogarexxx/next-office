---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Ad Tracking & Offline Conversion Pipeline
status: defining_requirements
last_updated: "2026-02-26T15:00:00.000Z"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-26)

**Core value:** Lead capture must be secure, reliable, and observable — every submission persists and notifies the team.
**Current focus:** v1.1 Ad Tracking & Offline Conversion Pipeline

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-02-26 — Milestone v1.1 started

## Accumulated Context

### Decisions

- Direct CRM webhook from NetHunt (cutting out n8n for conversion flow)
- Queue + cron processing (Supabase Edge Function, every 15 min) over immediate upload
- Google Ads only for v1.1 (Meta CAPI deferred)
- Cookie consent banner deferred
- All 5 tracking layers in scope: offline pipeline, Enhanced Conversions, UTM capture, visitor tracking, server-side proxy

### Pending Todos

- SEC-12 (post-launch config): Mapbox token URL restriction in dashboard
- DEV-03 (post-launch config): Sentry DSN + auth token setup (5 env vars)

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-26
Stopped at: Defining v1.1 requirements
Resume file: None
