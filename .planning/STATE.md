---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-02-26T05:49:59.189Z"
progress:
  total_phases: 5
  completed_phases: 5
  total_plans: 14
  completed_plans: 14
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Lead capture must be secure, reliable, and observable — every submission persists and notifies the team.
**Current focus:** Phase 5 — SEO &amp; Content (next)

## Current Position

Phase: 5 of 6 (UX and Reliability — COMPLETE)
Plan: 3 of 3 in current phase (05-03 complete)
Status: Phase 5 Complete — Ready for Phase 6
Last activity: 2026-02-26 — Completed Phase 5 Plan 03: ARIA listbox on search bar, focus trap + scroll lock on photo gallery, aria-label on lead dialog close button, dev-only map coordinate warning (UX-07, UX-09, UX-12, REL-01, REL-03). SEC-12 deferred to post-launch.

Progress: [█████████░] ~90%

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
| Phase 04-performance-architecture P03 | 1min | 2 tasks | 2 files |
| Phase 04-performance-architecture P02 | 3min | 2 tasks | 7 files |
| Phase 05-ux-and-reliability P01 | 2min | 2 tasks | 6 files |
| Phase 05-ux-and-reliability P02 | 1min | 2 tasks | 2 files |
| Phase 05-ux-and-reliability P03 | 5min | 2 tasks | 4 files |

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
- [Phase 04-03]: rootMargin: 200px on IntersectionObserver starts Mapbox load before viewport; minHeight: 560 prevents CLS; loaded Set pattern defers carousel photos to on-navigation rendering
- [Phase 04-02]: SearchMap/SearchMapInner updated to accept ListingCard[] — all map popup fields present in ListingCard, TypeScript passes with zero errors
- [Phase 04-02]: generateStaticParams on both city page and listing detail page — all dynamic route segments now SSG at build time
- [Phase 05-01]: not-found.tsx is a server component (no use client) — renders inside root layout where Tailwind CSS is loaded
- [Phase 05-01]: error.tsx uses Tailwind classes (unlike global-error.tsx which uses inline styles) — renders inside main layout
- [Phase 05-01]: city page bails early with notFound() before computing displayListings — no fallback to cardListings for unknown slugs
- [Phase 05-01]: empty state replaces the grid entirely when listings.length === 0
- [Phase 05-02]: Email input uses type=email (not type=text + inputMode=email) — native validation and mobile keyboard @ key
- [Phase 05-02]: suppressHydrationWarning used on footer year div — standard Next.js pattern, simpler than hard-coding year
- [Phase 05-02]: City slug useEffect resets form state without full remount — avoids flicker while preventing stale state on navigation
- [Phase 05-03]: SEC-12 (Mapbox token URL restriction) deferred to post-launch — user chose to skip dashboard configuration checkpoint
- [Phase 05-03]: localStorage resilience for transit cache already implemented (try/catch) — verified existing code correct, no changes needed for REL-03
- [Phase 05-03]: Lucide React icons already emit aria-hidden automatically via library internals — no manual fix needed for decorative Lucide icons
- [Phase 05-03]: Search dropdown options changed from button to div role=option inside div role=listbox — correct ARIA listbox semantics
- [Phase 05-03]: Focus trap uses position:fixed + top:-scrollY scroll lock pattern — preserves scroll position on gallery close

### Pending Todos

None yet.

### Blockers/Concerns

- **SEC-12 open (post-launch):** Mapbox access token is not yet URL-restricted. User deferred from Phase 5 Plan 03 — must complete before or shortly after launch to prevent token abuse. See 05-03-SUMMARY.md for exact steps.

## Session Continuity

Last session: 2026-02-26
Stopped at: Completed Phase 5 Plan 03 (05-03). ARIA listbox on search bar, focus trap + scroll lock on photo gallery, aria-label on lead dialog close button, dev-only map coordinate warnings. UX-07, UX-09, UX-12, REL-01, REL-03 satisfied. Phase 5 complete. SEC-12 deferred.
Resume file: None
