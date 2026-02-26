---
phase: 03-lead-pipeline-hardening
plan: 01
subsystem: api
tags: [validation, csrf, supabase, resend, security, typescript]

# Dependency graph
requires:
  - phase: 01-security-hardening
    provides: escapeHtml pattern, rate limiter pattern, generic German error messages
  - phase: 02-infrastructure-foundations
    provides: env.ts validated environment module
provides:
  - src/lib/leads/validation.ts — RFC 5322 email validation, cookie value sanitisation, full payload type guard
  - src/lib/leads/csrf.ts — double-submit cookie CSRF with HMAC-SHA256, CSRF_COOKIE_NAME constant
  - src/lib/leads/supabase.ts — scoped anon-key Supabase client, duplicate detection, lead insert
  - src/lib/leads/email.ts — single-source escapeHtml, fire-and-forget Resend notification
  - src/lib/leads/service.ts — handleLeadSubmission (full pipeline), handleCsrfToken (GET /api/csrf)
affects:
  - 03-02 — wires /api/leads and /api/lp-leads routes to use handleLeadSubmission
  - Any future plan touching lead API routes

# Tech tracking
tech-stack:
  added: [Node.js crypto (built-in), NEXT_PUBLIC_SUPABASE_ANON_KEY env var]
  patterns:
    - Double-submit cookie CSRF (stateless, no session required)
    - Fire-and-forget email (returns void, .catch for error logging)
    - Scoped Supabase access via anon key + RLS (not service role)
    - Idempotent duplicate response ({ success: true, deduplicated: true })
    - Module-level singleton rate limiter (shared across requests in same process)

key-files:
  created:
    - src/lib/leads/validation.ts
    - src/lib/leads/csrf.ts
    - src/lib/leads/supabase.ts
    - src/lib/leads/email.ts
    - src/lib/leads/service.ts
  modified:
    - src/lib/env.ts (added NEXT_PUBLIC_SUPABASE_ANON_KEY to REQUIRED_SERVER)
    - .env.example (documented NEXT_PUBLIC_SUPABASE_ANON_KEY with RLS note)

key-decisions:
  - "CSRF secret derived from SUPABASE_SERVICE_ROLE_KEY (already server-only) — avoids new required env var, documented in csrf.ts comment"
  - "Scoped Supabase access uses anon key + RLS instead of service role key — principle of least privilege"
  - "Duplicate detection is non-fatal: checkDuplicate error logs and returns false rather than blocking the insert"
  - "Duplicate response is idempotent { success: true, deduplicated: true } — not an error, not a 409"
  - "validateCookieValue added to service.ts cookie fallback path — server cookies from middleware also sanitised"
  - "CSRF_COOKIE_NAME = '_no_csrf' — follows existing _no_ prefix convention from middleware tracking cookies"

patterns-established:
  - "escapeHtml defined once in email.ts — all other files import from there, no duplication"
  - "Rate limiter singleton in service.ts — both routes share one Map, eliminating duplicate setInterval"
  - "ValidatedLeadData interface is the typed contract flowing through all pipeline stages"

requirements-completed: [SEC-07, SEC-08, SEC-09, SEC-10, SEC-11, REL-04, REL-05, REL-06]

# Metrics
duration: 4min
completed: 2026-02-26
---

# Phase 3 Plan 01: Lead Pipeline Hardening — Shared Service Module Summary

**5-file src/lib/leads/ module with CSRF protection (HMAC-SHA256 double-submit), RFC 5322 email validation, scoped Supabase access (anon key + RLS), duplicate detection (24h phone+city dedup window), and fire-and-forget email notification**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-26T01:53:14Z
- **Completed:** 2026-02-26T01:57:09Z
- **Tasks:** 2 of 2
- **Files modified:** 7

## Accomplishments

- Created complete `src/lib/leads/` module with all 5 files providing a single `handleLeadSubmission()` entry point
- Implemented CSRF token mechanism (double-submit cookie, stateless, HMAC-SHA256) — SEC-07
- Added RFC 5322-compliant email validation rejecting edge cases like `@.@`, `a@b`, `hello` — SEC-08
- Validated all cookie values (gclid/gbraid/wbraid) for format and max length — SEC-09
- Migrated Supabase access to anon key (scoped by RLS), removing service role from insert path — SEC-10
- Added full payload type guard with field-level size limits (body 10KB max, message 5000 chars, etc.) — SEC-11
- Eliminated escapeHtml and rate limiter duplication — consolidated into single source of truth — REL-04
- Fire-and-forget email pattern explicitly documented and enforced — REL-05
- Duplicate lead detection (phone + city, 24h window) with idempotent 200 response — REL-06

## Task Commits

Each task was committed atomically:

1. **Task 1: Create lead validation, CSRF, and scoped Supabase modules** - `842d08d` (feat)
2. **Task 2: Create shared email utility and lead service orchestrator** - `6823460` (feat)

**Plan metadata:** (final docs commit — see below)

## Files Created/Modified

- `src/lib/leads/validation.ts` — validateEmail, validateCookieValue, validateLeadPayload, ValidatedLeadData interface
- `src/lib/leads/csrf.ts` — generateCsrfToken, verifyCsrfToken, CSRF_COOKIE_NAME constant
- `src/lib/leads/supabase.ts` — createScopedClient (anon key), checkDuplicate (24h dedup), insertLead
- `src/lib/leads/email.ts` — escapeHtml (single source of truth), sendLeadNotification (fire-and-forget)
- `src/lib/leads/service.ts` — handleLeadSubmission (full 9-step pipeline), handleCsrfToken (GET handler)
- `src/lib/env.ts` — added NEXT_PUBLIC_SUPABASE_ANON_KEY to REQUIRED_SERVER array
- `.env.example` — documented NEXT_PUBLIC_SUPABASE_ANON_KEY with RLS configuration note

## Decisions Made

- **CSRF secret**: Derived from `SUPABASE_SERVICE_ROLE_KEY` rather than adding a new required env var. The key is already server-only and never reaches the client bundle. Documented with a comment in csrf.ts pointing to where to add a dedicated `CSRF_SECRET` if desired.
- **Scoped DB access**: Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` + RLS instead of service role for inserts. RLS note added to .env.example and supabase.ts — dashboard configuration required before Plan 02 wires the routes.
- **Duplicate detection non-fatal**: `checkDuplicate()` errors are logged but don't block the insert. A dedup check failure is less harmful than blocking a legitimate lead.
- **Idempotent duplicate response**: Returns `{ success: true, deduplicated: true }` with 200 — same success shape as normal, not a 409. Prevents client-side error handling for re-submits.
- **Cookie fallback sanitisation**: Server-side tracking cookies from middleware are also passed through `validateCookieValue()` in service.ts — middleware does not validate them at cookie-set time.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**NEXT_PUBLIC_SUPABASE_ANON_KEY** must be added to `.env.local` before the routes are wired in Plan 02. The anon key is available in the Supabase dashboard under Settings > API.

Additionally, RLS policies on the `leads` table must permit anon INSERT before Plan 02 goes live. See the note in `src/lib/leads/supabase.ts` and `.env.example`.

## Next Phase Readiness

- Complete `src/lib/leads/` module ready for Plan 02 to wire both API routes
- `handleLeadSubmission(request, 'main' | 'lp')` — drop-in replacement for both route POST handlers
- `handleCsrfToken(request)` — ready for a new `/api/csrf` GET route
- All 7 requirements (SEC-07 through SEC-11, REL-04 through REL-06) implemented
- TypeScript compiles with zero errors (`npx tsc --noEmit` passes)

---
*Phase: 03-lead-pipeline-hardening*
*Completed: 2026-02-26*

## Self-Check: PASSED

- FOUND: src/lib/leads/validation.ts
- FOUND: src/lib/leads/csrf.ts
- FOUND: src/lib/leads/supabase.ts
- FOUND: src/lib/leads/email.ts
- FOUND: src/lib/leads/service.ts
- FOUND: .planning/phases/03-lead-pipeline-hardening/03-01-SUMMARY.md
- Commit 842d08d verified: feat(03-01): add lead validation, CSRF, and scoped Supabase modules
- Commit 6823460 verified: feat(03-01): add shared email utility and lead service orchestrator
