---
phase: 08-visitor-utm-capture
plan: "02"
subsystem: api
tags: [supabase, service-role, tracking, cookies, visitors, utm, next.js]

# Dependency graph
requires:
  - phase: 08-01
    provides: "_no_vid visitor UUID cookie and _no_utm_* UTM cookies set by middleware"
  - phase: 07-database-foundation
    provides: "visitors table with RLS enabled (no anon write policy), DB-05"
provides:
  - "POST /api/track/visit: upserts anonymous visitor record in Supabase on each page view (CAP-03)"
  - "src/lib/tracking/visit.ts: upsertVisitor() using service role client with SHA-256 IP hashing"
  - "First-touch attribution: two-step INSERT+UPDATE preserves original UTMs on return visits"
affects:
  - 09-enhanced-conversions
  - 10-lead-capture-api
  - 12-offline-conversion-upload

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Service role Supabase client in server-only modules (SUPABASE_SERVICE_ROLE_KEY, auth.persistSession=false)"
    - "Two-step INSERT+UPDATE for first-touch attribution: INSERT ignores conflict, UPDATE always runs"
    - "SHA-256 IP hashing before storage — raw IP never written to DB"
    - "Tracking failures return 200 (not 500) — tracking must not block user experience"
    - "Fire-and-forget tracking endpoint: no CSRF needed (no user-provided data, reads server-set cookies)"

key-files:
  created:
    - src/lib/tracking/visit.ts
    - src/app/(main)/api/track/visit/route.ts
  modified:
    - src/lib/tracking/visitor.ts
    - src/middleware.ts

key-decisions:
  - "Two-step INSERT+UPDATE pattern instead of Supabase .upsert() — preserves original UTMs on conflict (first-touch attribution)"
  - "UTM cookie names shortened to _no_utm_source (not _no_utm_utm_source) — UTM_KEYS changed to short keys, middleware updated to read utm_${key} from query string"
  - "Tracking failures return HTTP 200 (not 500) with { success: false } body — tracking errors must not degrade user experience"

patterns-established:
  - "Tracking lib modules in src/lib/tracking/ — separate from business logic in src/lib/leads/"
  - "Service role client factory pattern: createServiceClient() inline in server-only modules"

requirements-completed: [CAP-03]

# Metrics
duration: 2min
completed: "2026-02-26"
---

# Phase 08 Plan 02: Visit Tracking Endpoint Summary

**POST /api/track/visit with service role Supabase upsert, SHA-256 IP hashing, and two-step first-touch attribution INSERT+UPDATE**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-26T11:38:34Z
- **Completed:** 2026-02-26T11:40:55Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created `src/lib/tracking/visit.ts` with `upsertVisitor()` using service role Supabase client (bypasses RLS on visitors table)
- Created `src/app/(main)/api/track/visit/route.ts` — POST endpoint reading all tracking cookies and headers, returning 400 on missing visitor_id, 200 on success/failure
- Two-step INSERT (silent on conflict) + UPDATE last_seen_at pattern correctly implements first-touch attribution without a Postgres RPC function
- Fixed UTM cookie naming inconsistency: UTM_KEYS changed to short keys (`source`, `medium`, ...) so cookie names are `_no_utm_source` (not `_no_utm_utm_source`), middleware updated to read `utm_${key}` query params

## Task Commits

Each task was committed atomically:

1. **Task 1: Create src/lib/tracking/visit.ts with upsertVisitor()** - `0999769` (feat)
2. **Task 2: Create /api/track/visit route handler** - `6bf4fdd` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/lib/tracking/visit.ts` - upsertVisitor() with service role client, SHA-256 IP hashing, two-step upsert
- `src/app/(main)/api/track/visit/route.ts` - POST /api/track/visit handler
- `src/lib/tracking/visitor.ts` - Updated UTM_KEYS to short form (`source`, `medium`, `campaign`, `term`, `content`)
- `src/middleware.ts` - Updated UTM loop to read `utm_${key}` from query string (was reading `key` directly)

## Decisions Made
- Two-step INSERT+UPDATE instead of `.upsert()`: Supabase JS v2 `.upsert()` with `onConflict` updates ALL columns on conflict, overwriting original UTMs. The two-step pattern (insert-ignore, always update last_seen_at) correctly implements first-touch attribution without a Postgres RPC function.
- UTM cookie names: plan identified `_no_utm_utm_source` was redundant; corrected to `_no_utm_source` by shortening UTM_KEYS and updating middleware query param lookup.
- Tracking failures return 200: tracking errors must not degrade the user experience (fire-and-forget semantics).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed .throwOnError().catch() — invalid on Supabase builder type**
- **Found during:** Task 2 (TypeScript check)
- **Issue:** Plan suggested `.throwOnError().catch(() => {})` pattern, but `PostgrestFilterBuilder` doesn't have a `.catch()` method — TypeScript error TS2551
- **Fix:** Replaced with `try/catch` block around the insert call; error handling preserved with additional logging for non-conflict errors
- **Files modified:** `src/lib/tracking/visit.ts`
- **Verification:** `npx tsc --noEmit` passes clean
- **Committed in:** `6bf4fdd` (Task 2 commit)

**2. [Rule 1 - Bug] Fixed UTM cookie name inconsistency (visitor.ts + middleware.ts)**
- **Found during:** Task 2 (analyzing cookie name construction)
- **Issue:** UTM_KEYS contained `["utm_source", ...]` producing cookie names `_no_utm_utm_source` — redundant and inconsistent with plan's intended `_no_utm_source`
- **Fix:** Changed UTM_KEYS to `["source", "medium", "campaign", "term", "content"]`; updated middleware to read `utm_${key}` from query string instead of `key`
- **Files modified:** `src/lib/tracking/visitor.ts`, `src/middleware.ts`
- **Verification:** Cookie names are now `_no_utm_source`, `_no_utm_medium`, etc. Route.ts reads the same names explicitly.
- **Committed in:** `0999769` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs)
**Impact on plan:** Both fixes necessary for correctness. The UTM naming fix ensures cookie write and read are consistent. The `.catch()` fix ensures TypeScript compilation succeeds. No scope creep.

## Issues Encountered

None beyond the two auto-fixed deviations above.

## User Setup Required

None - no external service configuration required for this plan. The `SUPABASE_SERVICE_ROLE_KEY` env var was already in `src/lib/env.ts` as a required server-side variable.

## Next Phase Readiness
- POST /api/track/visit is ready to be called client-side on page load (fire-and-forget)
- upsertVisitor() creates visitors rows in Supabase — Phase 08-03 (client-side tracking trigger) can wire up the fetch() call
- Phase 09 (Enhanced Conversions) and Phase 10 (Lead Capture API) depend on the visitors table — no blockers
- UTM cookie naming is now consistent across middleware (write) and route (read)

---
*Phase: 08-visitor-utm-capture*
*Completed: 2026-02-26*

## Self-Check: PASSED

- FOUND: src/lib/tracking/visit.ts
- FOUND: src/app/(main)/api/track/visit/route.ts
- FOUND: src/lib/tracking/visitor.ts (updated)
- FOUND: src/middleware.ts (updated)
- FOUND commit: 0999769 (feat(08-02): create upsertVisitor() service role Supabase write)
- FOUND commit: 6bf4fdd (feat(08-02): implement POST /api/track/visit endpoint (CAP-03))
