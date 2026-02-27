---
phase: 08-visitor-utm-capture
verified: 2026-02-26T12:30:00Z
status: passed
score: 12/12 must-haves verified
re_verification: false
---

# Phase 08: Visitor UTM Capture — Verification Report

**Phase Goal:** Every site visitor receives a persistent visitor_id, UTM parameters are captured into cookies, visit data is recorded in Supabase, and lead submissions carry the visitor's attribution forward
**Verified:** 2026-02-26T12:30:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

All must-haves are drawn directly from the three PLAN frontmatter `truths` blocks (plans 08-01, 08-02, 08-03).

#### Plan 08-01 Truths (CAP-01, CAP-02)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A first-time visitor receives an HTTP-only visitor_id cookie (`_no_vid`, UUID) on every non-API, non-static request | VERIFIED | `middleware.ts` lines 110-119: checks `request.cookies.get(VISITOR_COOKIE_NAME)?.value`, sets `httpOnly: true, secure: true, sameSite: "lax", maxAge: VISITOR_COOKIE_MAX_AGE` when absent |
| 2 | A return visitor keeps the same visitor_id — middleware does NOT overwrite an existing cookie | VERIFIED | `middleware.ts` line 111: `if (!existingVisitorId)` guard prevents overwrite |
| 3 | Visiting with `?utm_source=google&utm_campaign=munich` sets HTTP-only UTM cookies (`_no_utm_source`, `_no_utm_campaign`) with 30-day maxAge | VERIFIED | `middleware.ts` lines 126-137: iterates `UTM_KEYS` (short keys), reads `utm_${key}` from query string, sets `${UTM_COOKIE_PREFIX}${key}` with `maxAge: UTM_COOKIE_MAX_AGE` (30 days) |
| 4 | UTM cookies are only written when the corresponding query parameter is present — no blank cookies | VERIFIED | `middleware.ts` line 128: `if (value)` guard wraps each cookie set call |
| 5 | Existing gclid/gbraid/wbraid cookie logic is preserved unchanged | VERIFIED | `middleware.ts` lines 71-83: `TRACKING_KEYS` loop and 90-day `MAX_AGE` unchanged; new logic added after it |

#### Plan 08-02 Truths (CAP-03)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 6 | `POST /api/track/visit` returns 200 with `{ success: true }` when called with a valid visitor_id cookie | VERIFIED | `route.ts` line 76: `return NextResponse.json({ success: true })` after successful upsertVisitor() call |
| 7 | A Supabase `visitors` row is created on first call with visitor_id, UTMs, gclid, ip_hash, user_agent, landing_page, referrer, first_seen_at, last_seen_at | VERIFIED | `visit.ts` lines 85-98: INSERT inserts all these columns; `001_visitors.sql` confirms all columns exist in table |
| 8 | A second POST with the same visitor_id updates `last_seen_at` without creating a duplicate row | VERIFIED | `visit.ts` lines 110-113: two-step pattern — INSERT silently fails on conflict (visitor_id UNIQUE), then UPDATE runs on `last_seen_at` |
| 9 | `POST /api/track/visit` without a `_no_vid` cookie returns 400 | VERIFIED | `route.ts` lines 34-37: `if (!visitorId) return NextResponse.json({ error: "No visitor ID" }, { status: 400 })` |
| 10 | Supabase client used by the visit endpoint uses service role key (not anon key) | VERIFIED | `visit.ts` lines 24-35: `createServiceClient()` uses `process.env.SUPABASE_SERVICE_ROLE_KEY`; anon key never referenced in this module |

#### Plan 08-03 Truths (CAP-04, CAP-05)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 11 | `insertLead()` writes visitor_id UUID FK and all 5 UTM columns to the leads table | VERIFIED | `supabase.ts` lines 143-150: `visitor_id: visitorUuid ?? null`, plus all 5 UTM column writes |
| 12 | Lead submissions read `_no_vid` cookie, resolve to UUID via visitors table SELECT, pass UTMs from `_no_utm_*` cookies as authoritative source | VERIFIED | `service.ts` lines 147-162: reads `_no_vid`, calls `resolveVisitorUuid()`, reads 5 `_no_utm_*` cookies with body fallback; `insertLead(resolvedData, visitorUuid)` called at line 192 |

**Score: 12/12 truths verified**

---

## Required Artifacts

| Artifact | Provides | Status | Details |
|----------|----------|--------|---------|
| `src/lib/tracking/visitor.ts` | Constants: VISITOR_COOKIE_NAME, VISITOR_COOKIE_MAX_AGE, UTM_COOKIE_PREFIX, UTM_COOKIE_MAX_AGE, UTM_KEYS (short), UTMKey type; `generateVisitorId()` | VERIFIED | 30 lines, all exports present, commit 5cfacaa |
| `src/middleware.ts` | Extended middleware: visitor_id UUID cookie generation (CAP-01) + UTM parameter capture (CAP-02) | VERIFIED | Imports from `@/lib/tracking/visitor`, implements both CAP-01 and CAP-02 blocks, commits 46d1fea + 0999769 |
| `src/lib/tracking/visit.ts` | `upsertVisitor()` — service-role Supabase call with two-step INSERT+UPDATE, SHA-256 IP hashing | VERIFIED | 122 lines, service role client factory, `hashIp()`, two-step upsert, commits 0999769 + 6bf4fdd |
| `src/app/(main)/api/track/visit/route.ts` | `POST /api/track/visit` — reads cookies, calls upsertVisitor, returns 400/200 | VERIFIED | 77 lines, full implementation, commit 6bf4fdd |
| `src/lib/leads/supabase.ts` | `resolveVisitorUuid()` + extended `insertLead()` with visitor_id FK and UTM columns | VERIFIED | `resolveVisitorUuid` at line 84, `insertLead` extended at line 121, commit f17c2e1 |
| `src/lib/leads/service.ts` | `handleLeadSubmission()` extended with Steps 5b and 5c: visitor UUID resolution and UTM cookie merge | VERIFIED | Steps 5b at line 143, 5c at line 150, `insertLead(resolvedData, visitorUuid)` at line 192, commit 42e71f2 |
| `src/components/lp/tracking/lp-tracking-provider.tsx` | Client-side provider that fires `POST /api/track/visit` on page load (mount effect) | VERIFIED | Lines 68-76: `useEffect(() => fetch("/api/track/visit", ...).catch(...), [])`, commit ea00d5c |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/middleware.ts` | `src/lib/tracking/visitor.ts` | imports `VISITOR_COOKIE_NAME, VISITOR_COOKIE_MAX_AGE, UTM_COOKIE_PREFIX, UTM_COOKIE_MAX_AGE, UTM_KEYS, generateVisitorId` | WIRED | Lines 3-10: named import confirmed |
| `src/app/(main)/api/track/visit/route.ts` | `src/lib/tracking/visit.ts` | imports `upsertVisitor` | WIRED | Line 26: `import { upsertVisitor } from "@/lib/tracking/visit"` and called at line 56 |
| `src/app/(main)/api/track/visit/route.ts` | `src/lib/tracking/visitor.ts` | imports `VISITOR_COOKIE_NAME` | WIRED | Line 27: `import { VISITOR_COOKIE_NAME } from "@/lib/tracking/visitor"` used at line 34 |
| `src/lib/tracking/visit.ts` | `supabase/migrations/001_visitors.sql` | upserts into `visitors` table; column names match | WIRED | `visit.ts` inserts `visitor_id, gclid, utm_source...utm_content, ip_hash, user_agent, landing_page, referrer`; `001_visitors.sql` line 16 confirms `visitor_id TEXT NOT NULL UNIQUE`, all UTM columns at lines 22-26 |
| `src/lib/leads/service.ts` | `src/lib/leads/supabase.ts` | imports `resolveVisitorUuid`, calls with `_no_vid` cookie value, passes result to `insertLead` | WIRED | Line 29: `import { checkDuplicate, insertLead, resolveVisitorUuid } from "./supabase"`; called at line 148, result at line 192 |
| `src/lib/leads/supabase.ts` | `supabase/migrations/005_leads_extension.sql` | writes `visitor_id` UUID FK and UTM columns added by migration | WIRED | `005_leads_extension.sql` adds `visitor_id UUID REFERENCES visitors(id)` and 5 UTM columns; `supabase.ts` insertLead writes all of them |
| `src/components/lp/tracking/lp-tracking-provider.tsx` | `/api/track/visit` | `fetch("/api/track/visit", { method: "POST", credentials: "same-origin" })` on mount | WIRED | Lines 70-75: confirmed; provider mounted in `src/app/(lp)/layout.tsx` line 38 |
| `src/app/(lp)/layout.tsx` | `src/components/lp/tracking/lp-tracking-provider.tsx` | imports and renders `LPTrackingProvider` wrapping all LP content | WIRED | Line 4: `import { LPTrackingProvider }...`; line 38: `<LPTrackingProvider>` |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| CAP-01 | 08-01 | Middleware generates visitor_id (UUID) in HTTP-only cookie on first visit, preserves on return | SATISFIED | `middleware.ts` lines 107-119: return-visit guard + cookie set with httpOnly/secure/sameSite/maxAge |
| CAP-02 | 08-01 | Middleware captures UTM parameters into HTTP-only cookies | SATISFIED | `middleware.ts` lines 121-137: 5 UTM params captured from `utm_${key}` query string into `_no_utm_*` cookies |
| CAP-03 | 08-02 | `/api/track/visit` creates or upserts visitor record in Supabase | SATISFIED | `route.ts` + `visit.ts`: service role client, INSERT+UPDATE pattern, 400 on missing cookie |
| CAP-04 | 08-03 | Lead form submission links visitor_id cookie to lead record in Supabase | SATISFIED | `service.ts` Step 5b resolves `_no_vid` to UUID PK; `supabase.ts` writes `visitor_id` FK column |
| CAP-05 | 08-03 | Lead API stores UTM parameters from cookies alongside the lead | SATISFIED | `service.ts` Step 5c reads `_no_utm_*` cookies as authoritative source; `supabase.ts` writes all 5 UTM columns |

**All 5 phase requirements fully satisfied. No orphaned requirements (REQUIREMENTS.md traceability table confirms CAP-01 through CAP-05 mapped exclusively to Phase 8).**

---

## Anti-Patterns Found

None. Scan of all 7 modified/created files found:
- No TODO / FIXME / XXX / HACK comments
- No placeholder or "coming soon" text
- No empty return stubs (`return null`, `return {}`, `return []`)
- No unimplemented handlers

---

## Notable Implementation Decisions (Verified Correct)

| Decision | Verified In | Notes |
|----------|-------------|-------|
| UTM_KEYS uses short keys (`source`, `medium`, ...) not `utm_source` | `visitor.ts` line 15, `middleware.ts` line 127 | Prevents `_no_utm_utm_source` redundancy; query param read as `utm_${key}` |
| Two-step INSERT+UPDATE instead of `.upsert()` | `visit.ts` lines 82-113 | Correctly preserves first-touch UTMs on conflict; Supabase JS v2 `.upsert()` overwrites all columns |
| SHA-256 IP hashing before storage | `visit.ts` lines 42-44, 80 | `createHash("sha256").update(ip).digest("hex")`; raw IP never written |
| Tracking failures return 200, not 500 | `route.ts` lines 70-73 | `{ success: false }` with status 200 so tracking never blocks UX |
| `resolveVisitorUuid` uses service role client | `supabase.ts` lines 89-95 | visitors table has no anon SELECT RLS policy (DB-05) |
| visitorUuid passed as separate second param to `insertLead` | `supabase.ts` line 123 | Keeps `ValidatedLeadData` focused on form payload; UUID resolved server-side |

---

## Human Verification Required

The following items cannot be verified programmatically and require manual testing:

### 1. End-to-end cookie round-trip

**Test:** Open an LP page (e.g., `/lp/muenchen`) in a fresh browser profile (no cookies) with `?utm_source=google&utm_campaign=test`. Inspect browser cookies.
**Expected:** `_no_vid` (HTTP-only, 30-day), `_no_utm_source=google` (HTTP-only, 30-day), `_no_utm_campaign=test` (HTTP-only, 30-day) all appear.
**Why human:** Cookie inspection cannot be done via static code analysis; requires a live browser or curl session.

### 2. Return-visit cookie preservation

**Test:** Reload the LP page (same browser session, without clearing cookies). Inspect `_no_vid` value.
**Expected:** Same UUID as the first visit — cookie not regenerated.
**Why human:** Requires stateful browser session.

### 3. Supabase `visitors` table row creation

**Test:** After step 1 above (LP page load), check Supabase dashboard `visitors` table.
**Expected:** One row with correct visitor_id, utm_source=google, utm_campaign=test, ip_hash (64-char hex), landing_page URL, last_seen_at timestamp.
**Why human:** Requires Supabase dashboard access; depends on `SUPABASE_SERVICE_ROLE_KEY` env var being set in the running environment.

### 4. Lead form submission with visitor attribution

**Test:** Submit the LP lead form after loading the page with UTM params (steps 1-3). Check Supabase `leads` table.
**Expected:** Lead row contains non-null `visitor_id` UUID FK pointing to the visitors row, plus `utm_source=google`, `utm_campaign=test`.
**Why human:** Requires live form submission and Supabase dashboard access.

### 5. `POST /api/track/visit` without cookies returns 400

**Test:** Send `curl -X POST https://next-office.io/api/track/visit` without any cookies.
**Expected:** HTTP 400 response with `{ "error": "No visitor ID" }`.
**Why human:** Can confirm from code analysis (already done — VERIFIED), but runtime test validates Next.js cookie middleware integration.

---

## Gaps Summary

No gaps. All 12 observable truths are verified against actual codebase content. All 7 artifacts pass all three verification levels (exists, substantive, wired). All 5 key links are confirmed. All 5 requirements (CAP-01 through CAP-05) are satisfied with concrete implementation evidence.

The phase goal — "every site visitor receives a persistent visitor_id, UTM parameters are captured into cookies, visit data is recorded in Supabase, and lead submissions carry the visitor's attribution forward" — is fully achieved in the codebase as committed.

---

_Verified: 2026-02-26T12:30:00Z_
_Verifier: Claude (gsd-verifier)_
