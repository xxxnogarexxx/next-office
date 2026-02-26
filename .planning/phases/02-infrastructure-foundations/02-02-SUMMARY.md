---
phase: 02-infrastructure-foundations
plan: 02
subsystem: infra
tags: [security-headers, csp, cors, hsts, x-frame-options, middleware, next.js]

# Dependency graph
requires:
  - phase: 01-security-hardening
    provides: Input validation and rate limiting on API routes
provides:
  - CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy, X-Content-Type-Options headers on all responses
  - X-Powered-By header removal
  - CORS enforcement on /api/ routes with explicit origin allowlist
affects: [all-phases, api-routes, lead-capture]

# Tech tracking
tech-stack:
  added: []
  patterns: [security-headers-in-next-config, cors-in-middleware]

key-files:
  created: []
  modified:
    - next.config.ts
    - src/middleware.ts

key-decisions:
  - "CSP includes unsafe-inline and unsafe-eval for script-src — required by Next.js hydration and dev hot reload"
  - "CORS allowlist is explicit (next-office.io + www subdomain + localhost in dev) — no wildcard * allowed"
  - "OPTIONS preflight returns 204 with Access-Control-Max-Age 86400 to cache preflight 1 day"
  - "Middleware matcher broadened from excluding /api/ to including /api/ — CORS logic handles API routes, existing tracking cookie logic handles page routes"

patterns-established:
  - "Security headers pattern: all headers declared in next.config.ts headers() function, applied globally via source: /(.*)"
  - "CORS pattern: isApiRoute check at top of middleware, early return for API paths, tracking cookie logic flows to else branch"

requirements-completed: [SEC-06, QW-01, DEV-06]

# Metrics
duration: 1min
completed: 2026-02-26
---

# Phase 02 Plan 02: Security Headers and CORS Summary

**CSP, X-Frame-Options, HSTS, Referrer-Policy, and Permissions-Policy headers added to all Next.js responses, X-Powered-By removed, and CORS enforced on /api/ routes via explicit origin allowlist**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-26T01:14:38Z
- **Completed:** 2026-02-26T01:16:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Security headers (CSP, X-Frame-Options, HSTS, Referrer-Policy, X-Content-Type-Options, Permissions-Policy) applied to all HTTP responses via next.config.ts
- X-Powered-By header removed globally via poweredByHeader: false
- CORS enforcement on /api/ routes with explicit allowlist (next-office.io origins + localhost in dev)
- OPTIONS preflight handling with 204 response and 86400s cache
- TypeScript compiles with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Add security headers and remove X-Powered-By** - `9769f10` (feat)
2. **Task 2: Add CORS enforcement on API routes** - `e95ceee` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified
- `next.config.ts` - Added poweredByHeader: false, headers() async function with CSP, X-Frame-Options, HSTS, Referrer-Policy, X-Content-Type-Options, Permissions-Policy applied to all routes
- `src/middleware.ts` - Added ALLOWED_ORIGINS module-level constant, CORS handling block for /api/ routes, broadened matcher to include API routes; existing tracking cookie logic preserved for page routes

## Decisions Made
- CSP includes `'unsafe-inline'` and `'unsafe-eval'` for `script-src` — unavoidable due to Next.js inline hydration scripts and dev hot reload
- CORS allowlist is explicit: no wildcard `*`, only `https://next-office.io`, `https://www.next-office.io`, and `http://localhost:3000` in dev
- OPTIONS preflight returns 204 (no body) with `Access-Control-Max-Age: 86400` to cache preflight for 1 day
- Middleware matcher changed from `/((?!_next/static|_next/image|favicon.ico|api/).*)` to `/((?!_next/static|_next/image|favicon.ico).*)` to include API routes for CORS handling

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Security headers and CORS baseline complete
- All API routes now protected by CORS allowlist
- Ready for remaining Phase 02 plans (environment variables, observability, etc.)

---
*Phase: 02-infrastructure-foundations*
*Completed: 2026-02-26*
