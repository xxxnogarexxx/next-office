---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in-progress
last_updated: "2026-02-26T02:46:00Z"
progress:
  total_phases: 6
  completed_phases: 3
  total_plans: 9
  completed_plans: 9
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Lead capture must be secure, reliable, and observable — every submission persists and notifies the team.
**Current focus:** Phase 4 — Performance Architecture

## Current Position

Phase: 4 of 6 (Performance Architecture)
Plan: 1 of 2 in current phase (complete)
Status: Phase 4 In Progress
Last activity: 2026-02-26 — Completed Phase 4 Plan 01: Cities module extraction, listings-card.json payload split, transit API hardening (PERF-01, PERF-06, PERF-07, PERF-08)

Progress: [██████░░░░] ~50%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: ~1.7min
- Total execution time: ~12min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-security-hardening | 2 | ~5min | ~2.5min |
| 02-infrastructure-foundations | 3 | ~3min | ~1min |

**Recent Trend:**
- Last 5 plans: 01-01 (2min), 01-02 (3min), 02-01 (1min), 02-02 (1min), 02-04 (1min)
- Trend: Stable

*Updated after each plan completion*
| Phase 02-infrastructure-foundations P01 | 2 | 2 tasks | 5 files |
| Phase 03-lead-pipeline-hardening P01 | 4min | 2 tasks | 7 files |
| Phase 03-lead-pipeline-hardening P02 | 2min | 2 tasks | 6 files |
| Phase 04-performance-architecture P01 | 5min | 2 tasks | 9 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Phases 2 and 3 both depend on Phase 1 and are independent of each other — they can be parallelized once Phase 1 is complete
- [Roadmap]: SEC-12 (Mapbox token restriction) placed in Phase 5 — it is a dashboard action, not a code change, and has no dependency on earlier phases
- [Roadmap]: REL-04, REL-05, REL-06 placed in Phase 3 (lead pipeline) alongside lead security — they all touch the same API route files
- [01-01]: Error responses for security violations use generic "Ungultige Eingabe" — avoid leaking validation details
- [01-01]: parseCoord() duplicated per-file (3 Overpass routes) — no shared module, keeps files self-contained
- [01-01]: Hex-only colour validation for transit popups — simpler regex, covers all real OSM colour values
- [01-02]: All user-submitted fields HTML-escaped in broker emails — no exceptions, including href values (encodeURIComponent) and display text (escapeHtml)
- [01-02]: Rate limit 10 req/min/IP, in-memory Map, no persistence across restarts — sufficient for abuse protection
- [01-02]: escapeHtml duplicated per route file — consolidation deferred to Phase 3 REL-04
- [02-02]: CSP includes unsafe-inline and unsafe-eval for script-src — required by Next.js hydration and dev hot reload
- [02-02]: CORS allowlist is explicit (next-office.io + www subdomain + localhost in dev) — no wildcard * allowed
- [02-02]: OPTIONS preflight returns 204 with Access-Control-Max-Age 86400 to cache preflight 1 day
- [02-02]: Middleware matcher broadened to include /api/ routes — isApiRoute check routes CORS vs tracking cookie logic
- [02-04]: Single job CI (not parallel) — small codebase, runner overhead outweighs parallelization
- [02-04]: Placeholder env vars for NEXT_PUBLIC_* in CI — Next.js bakes them at build time, placeholders allow CI build to succeed without secrets
- [Phase 02-01]: env.ts uses zero external dependencies — plain TypeScript only, no zod/joi
- [Phase 02-01]: Health check always returns HTTP 200 (ok or degraded) — avoids false load balancer failures
- [Phase 02-01]: Google Ads placeholder validation is console.warn only — vars are optional, app runs without them
- [02-03]: Sentry disabled in dev (enabled: NODE_ENV === 'production') — no DSN needed for local development
- [02-03]: tunnelRoute: '/monitoring' proxies Sentry events through app domain — no extra CSP change needed
- [02-03]: sourcemaps.deleteSourcemapsAfterUpload used instead of wiping.enabled — API changed in @sentry/nextjs@10
- [02-03]: global-error.tsx uses inline styles (not Tailwind) — renders outside layout tree where CSS may not be loaded
- [Phase 03-01]: CSRF secret derived from SUPABASE_SERVICE_ROLE_KEY — avoids new required env var, documented in csrf.ts
- [Phase 03-01]: Scoped Supabase access uses anon key + RLS (not service role) for lead inserts — principle of least privilege
- [Phase 03-01]: Duplicate lead detection returns idempotent 200 { success: true, deduplicated: true } — not a 409
- [Phase 03-01]: escapeHtml defined once in email.ts — single source of truth, all other files import from there
- [Phase 03-02]: handleCsrfToken returns { csrfToken: token } — forms read data.csrfToken not data.token
- [Phase 03-02]: Route files reduced from 167/233 lines to 5 lines — zero business logic in route handlers, thin delegation to shared service
- [Phase 04-01]: listings-card.json contains photos field (required by carousel) — actual disk reduction 45% not 80%; Contentful CDN URLs in photos account for 61% of card payload size
- [Phase 04-01]: ListingCard type in types.ts has 14 fields — listing-card.tsx accepts ListingCard not Listing (safe narrowing)
- [Phase 04-01]: sitemap.ts intentionally kept importing from @/lib/listings — needs both cities and full listings, runs server-side only
- [Phase 04-01]: Transit API retry only on 5xx/network errors — 4xx (Overpass client errors) not retried

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-26
Stopped at: Completed Phase 4 Plan 01 (04-01). Cities module extraction + listings-card.json split + transit API hardening complete. Phase 4 in progress (plan 2 of 2 remaining).
Resume file: None
