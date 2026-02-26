---
phase: 02-infrastructure-foundations
plan: "03"
subsystem: infra
tags: [sentry, error-monitoring, source-maps, nextjs, typescript]

# Dependency graph
requires:
  - phase: 02-infrastructure-foundations/02-02
    provides: Security headers and CORS in next.config.ts — this plan wraps that config with withSentryConfig
provides:
  - Sentry client-side error capture via sentry.client.config.ts
  - Sentry server-side error capture via sentry.server.config.ts
  - Sentry edge runtime error capture via sentry.edge.config.ts
  - Next.js instrumentation hook loading correct Sentry config per runtime
  - Global React error boundary reporting to Sentry via captureException
  - Source map upload to Sentry via withSentryConfig wrapper
  - Tunnel route at /monitoring for ad-blocker bypass
affects:
  - 03-lead-pipeline-hardening
  - 04-performance-architecture
  - 05-ux-and-reliability

# Tech tracking
tech-stack:
  added: ["@sentry/nextjs@10.40.0"]
  patterns:
    - withSentryConfig wrapping the entire Next.js config export
    - Runtime-conditional SDK loading in instrumentation.ts (nodejs vs edge)
    - Global error boundary with useEffect → captureException
    - Sentry disabled in development (enabled only when NODE_ENV === production)

key-files:
  created:
    - sentry.client.config.ts
    - sentry.server.config.ts
    - sentry.edge.config.ts
    - src/instrumentation.ts
    - src/app/global-error.tsx
  modified:
    - next.config.ts

key-decisions:
  - "Sentry disabled without DSN — enabled: process.env.NODE_ENV === 'production' so dev environment is noise-free"
  - "tunnelRoute: '/monitoring' routes Sentry events through app domain to bypass ad blockers — no extra CSP change needed (already allows self)"
  - "sourcemaps.deleteSourcemapsAfterUpload: true used instead of planned wiping.enabled (API changed in @sentry/nextjs@10)"
  - "Replay sample rates: 1% sessions, 100% error sessions — low enough to stay in Sentry free tier"
  - "global-error.tsx uses inline styles (not Tailwind) — renders outside normal layout tree, CSS bundle may not be available"

patterns-established:
  - "Sentry: init in separate config files per runtime, loaded via instrumentation.ts register()"
  - "Error boundary: global-error.tsx at app root with captureException in useEffect"

requirements-completed: [DEV-03]

# Metrics
duration: ~15min (including checkpoint human-verify)
completed: 2026-02-26
---

# Phase 2 Plan 03: Sentry Error Monitoring Summary

**@sentry/nextjs integrated across client, server, and edge runtimes with source map uploads, tunnel route, and global error boundary — production errors now visible in Sentry dashboard**

## Performance

- **Duration:** ~15 min (including checkpoint human-verify)
- **Started:** 2026-02-26
- **Completed:** 2026-02-26
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 6

## Accomplishments
- Installed @sentry/nextjs and configured client, server, and edge SDK initialization files
- Created Next.js instrumentation hook that loads the correct Sentry config per runtime (nodejs vs edge)
- Added global React error boundary (src/app/global-error.tsx) that captures exceptions to Sentry
- Wrapped next.config.ts with withSentryConfig for source map uploads during CI builds
- Configured tunnel route at /monitoring to proxy Sentry events through app domain (bypasses ad blockers)
- Verified integration: build succeeds cleanly with zero errors; Sentry gracefully disabled without DSN credentials (production-only activation)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Sentry SDK and create configuration files** - `219a44d` (feat)
2. **Task 2: Wrap next.config.ts with withSentryConfig** - `37f4bda` (feat)
3. **Task 3: Verify Sentry integration** - checkpoint:human-verify (approved by user — build succeeds, zero TypeScript errors)

## Files Created/Modified
- `sentry.client.config.ts` - Browser SDK init with replay integration, 10% production trace sampling, disabled in dev
- `sentry.server.config.ts` - Node.js SDK init with DSN and environment tag
- `sentry.edge.config.ts` - Edge runtime SDK init (mirrors server config)
- `src/instrumentation.ts` - Next.js register() hook loading correct config per runtime; exports onRequestError = Sentry.captureRequestError
- `src/app/global-error.tsx` - Global React error boundary with useEffect → captureException; inline styles for safety outside layout tree
- `next.config.ts` - Wrapped with withSentryConfig (source map upload, tunnel route, silent build output, auto-instrumentation)

## Decisions Made
- Sentry enabled only when `NODE_ENV === 'production'` — keeps development noise-free, no DSN required for local dev
- `tunnelRoute: '/monitoring'` routes Sentry events through the app's own domain — no extra CSP entry needed since 'self' is already allowed
- Replay configured at 1% session rate / 100% error session rate — stays within Sentry free tier limits
- `global-error.tsx` uses inline styles instead of Tailwind — renders outside the normal layout tree where the CSS bundle may not be loaded

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `wiping` option replaced with `sourcemaps.deleteSourcemapsAfterUpload`**
- **Found during:** Task 2 (Wrap next.config.ts with withSentryConfig)
- **Issue:** Plan specified `wiping: { enabled: true }` but @sentry/nextjs@10.40.0 uses a different API — the `wiping` key does not exist in this version
- **Fix:** Used `sourcemaps: { deleteSourcemapsAfterUpload: true }` which is the correct option for @sentry/nextjs v10, providing identical behavior (source maps uploaded then deleted from build output)
- **Files modified:** next.config.ts
- **Verification:** TypeScript compiles with zero errors; build succeeds cleanly
- **Committed in:** `37f4bda` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — API change in @sentry/nextjs@10)
**Impact on plan:** The fix achieves exactly the same behavior as specified — source maps are uploaded to Sentry and removed from the build output. No scope creep.

## Issues Encountered
None — plan executed smoothly once the API deviation was handled.

## User Setup Required
**External service requires manual configuration.** Sentry is wired in but disabled until credentials are provided:

Environment variables to add to `.env.local` and production hosting:
- `SENTRY_DSN` — From Sentry Dashboard → Settings → Projects → [project] → Client Keys (DSN)
- `NEXT_PUBLIC_SENTRY_DSN` — Same DSN value (public, used by browser SDK)
- `SENTRY_AUTH_TOKEN` — From Sentry Dashboard → Settings → Auth Tokens → Create New Token (org:read, project:releases, project:write)
- `SENTRY_ORG` — From Sentry Dashboard → Settings → General → Organization Slug
- `SENTRY_PROJECT` — From Sentry Dashboard → Settings → Projects → [project] → Project Slug

Dashboard steps:
1. Create a Next.js project in Sentry Dashboard → Projects → Create Project → Next.js
2. Copy the DSN from Client Keys

Verification: After setting env vars, run `npm run build` and check Sentry dashboard for source map uploads.

## Next Phase Readiness
- Phase 2 Plan 04 (CI/CD) is already complete — full Phase 2 is done after this plan
- Phase 3 (Lead Pipeline Hardening) can begin — no dependencies on Sentry credentials
- Sentry will automatically capture server errors in API routes once DSN is configured

## Self-Check: PASSED

All required files present and commits verified:
- FOUND: sentry.client.config.ts
- FOUND: sentry.server.config.ts
- FOUND: sentry.edge.config.ts
- FOUND: src/instrumentation.ts
- FOUND: src/app/global-error.tsx
- FOUND: next.config.ts
- FOUND: 02-03-SUMMARY.md
- FOUND: commit 219a44d
- FOUND: commit 37f4bda

---
*Phase: 02-infrastructure-foundations*
*Completed: 2026-02-26*
