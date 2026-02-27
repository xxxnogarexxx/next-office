---
phase: 13-main-site-visitor-tracking
verified: 2026-02-27T05:30:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
---

# Phase 13: Main-Site Visitor Tracking Verification Report

**Phase Goal:** Main-site visitors (not just LP visitors) trigger `/api/track/visit` so all leads carry visitor_id FK and gclid attribution
**Verified:** 2026-02-27T05:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A main-site page load fires `POST /api/track/visit` and creates a visitors row in Supabase | VERIFIED | `tracking-provider.tsx` line 42–49: `useEffect(() => { fetch("/api/track/visit", { method: "POST", credentials: "same-origin" }).catch(...) }, [])` wired into `(main)/layout.tsx` via `<TrackingProvider>` |
| 2 | A lead submitted via the main-site form (`/api/leads`) has a non-null `visitor_id` FK pointing to the visitors row | VERIFIED | `leads/service.ts` line 155–156: `const visitorIdText = cookieStore.get("_no_vid")?.value ?? null; const visitorUuid = await resolveVisitorUuid(visitorIdText);` — passed to `insertLead(resolvedData, visitorUuid, emailHash)` at line 204 |
| 3 | The CRM webhook's `matchLeadByEmail()` JOIN retrieves gclid for main-site leads (when visitor had gclid) | VERIFIED | `webhook.ts` line 114–130: Supabase query does `visitors!leads_visitor_id_fkey ( gclid )` JOIN; line 137–138 extracts `gclid` from joined visitor row |
| 4 | google-ads.ts dead code is documented or removed | VERIFIED | `src/lib/conversions/google-ads.ts` lines 1–19: REFERENCE IMPLEMENTATION banner in place; no runtime imports of this module found |
| 5 | No runtime regressions — no src file imports from google-ads.ts | VERIFIED | `grep -rn "from.*['\"].*google-ads['\"]" src/` returns zero matches |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/tracking-provider.tsx` | Visit tracking fire-and-forget call on mount | VERIFIED | useEffect at line 42–49 fires `POST /api/track/visit` with `credentials: "same-origin"` and `.catch()` — substantive, 75 lines |
| `src/app/(main)/api/track/visit/route.ts` | POST handler calls upsertVisitor() | VERIFIED | 77 lines; calls `upsertVisitor()` at line 56; returns 200 always; wired via TrackingProvider |
| `src/lib/tracking/visit.ts` | upsertVisitor() function | VERIFIED | `upsertVisitor` exported at line 75; called from route handler |
| `src/lib/leads/service.ts` | resolveVisitorUuid() wired into lead pipeline | VERIFIED | Called at line 156; result passed to `insertLead` at line 204 |
| `src/lib/conversions/webhook.ts` | matchLeadByEmail() JOIN on visitors table | VERIFIED | Full JOIN query at lines 114–130; gclid extracted at lines 137–138 |
| `src/lib/conversions/google-ads.ts` | Clean file annotated as reference-only | VERIFIED | REFERENCE IMPLEMENTATION banner at lines 1–19; WARNING in line 4 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/components/tracking-provider.tsx` | `/api/track/visit` | `fetch POST on useEffect mount` | WIRED | Line 43: `fetch("/api/track/visit", { method: "POST", credentials: "same-origin" })` |
| `/api/track/visit` | Supabase visitors table | `upsertVisitor()` in `src/lib/tracking/visit.ts` | WIRED | route.ts line 56 calls `upsertVisitor()`; visit.ts line 75 exports it |
| `src/lib/leads/service.ts` | Supabase visitors table | `resolveVisitorUuid()` | WIRED | Line 156: `resolveVisitorUuid(visitorIdText)`; result used at line 204 in `insertLead()` |
| `src/components/tracking-provider.tsx` | `src/app/(main)/layout.tsx` | Import + JSX wrapping | WIRED | layout.tsx line 3 imports; line 23 wraps all children in `<TrackingProvider>` |
| `src/lib/conversions/webhook.ts matchLeadByEmail()` | Supabase visitors table | FK JOIN in Supabase query | WIRED | Lines 123–125: `visitors!leads_visitor_id_fkey ( gclid )` JOIN |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CAP-03 (extended) | 13-01, 13-02 | Visit recording endpoint creates or upserts visitor record in Supabase with all tracking data — extended to cover main-site visitors (not just LP) | SATISFIED | TrackingProvider fires `POST /api/track/visit` on mount; route calls `upsertVisitor()`; both LP and main-site visitors now covered |
| CAP-04 (extended) | 13-01, 13-02 | Lead form submission links visitor_id cookie to the lead record in Supabase — extended to cover main-site leads | SATISFIED | `leads/service.ts` resolves `_no_vid` cookie via `resolveVisitorUuid()` and passes UUID to `insertLead()`; now works because visitors row exists after 13-01 |

**REQUIREMENTS.md cross-check:** Both CAP-03 and CAP-04 appear in REQUIREMENTS.md at lines 22–23 as `[x]` (satisfied) and in the traceability table at lines 105–106 mapped to Phase 13. No orphaned requirements found.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | — | — | — | — |

No TODOs, FIXMEs, placeholder returns, or stub implementations found in either modified file. The `useEffect` in `tracking-provider.tsx` has a substantive body (not `=> {}` or `console.log` only). The `google-ads.ts` annotation is documentation-only with no code changes.

---

### Human Verification Required

The following behaviors cannot be confirmed programmatically:

#### 1. End-to-End: Main-Site Page Load Creates visitors Row

**Test:** Load any main-site page (e.g., `/`) in a browser with DevTools Network tab open.
**Expected:** A `POST /api/track/visit` request fires on page load with status 200. Checking the Supabase `visitors` table should show a new or updated row with a matching `visitor_id` from the `_no_vid` cookie.
**Why human:** Requires a live browser session and Supabase access to confirm the row is actually created.

#### 2. End-to-End: Main-Site Lead Has Non-Null visitor_id FK

**Test:** Submit the main-site lead form after loading a page (so `_no_vid` cookie and visitors row both exist).
**Expected:** Supabase `leads` table row has a non-null `visitor_id` UUID FK pointing to the visitors row created above.
**Why human:** Requires an actual form submission and Supabase row inspection.

#### 3. End-to-End: CRM Webhook Retrieves gclid for Main-Site Leads

**Test:** Simulate a visitor arriving via a Google Ads click (gclid in URL), then submitting the main-site lead form, then triggering the CRM webhook with that lead's email.
**Expected:** `matchLeadByEmail()` JOIN returns gclid from the visitors row; the conversion record in `conversions` table has the gclid populated.
**Why human:** Requires Google Ads click simulation, form submission, and CRM webhook trigger with Supabase table inspection.

---

### Summary

Phase 13 achieved its goal. The single code change — adding a `useEffect` to `src/components/tracking-provider.tsx` that fires `POST /api/track/visit` on mount — is substantive, correctly wired, and deployed in the component that wraps all main-site routes via `src/app/(main)/layout.tsx`.

The causal chain for the goal is complete:

1. Middleware sets `_no_vid` cookie on first visit (Phase 8, pre-existing)
2. **NEW (13-01):** `TrackingProvider` fires `POST /api/track/visit` on mount — creates/updates the Supabase visitors row
3. Cookie `_no_vid` now resolves to a real UUID via `resolveVisitorUuid()` (was already wired in `leads/service.ts`)
4. Main-site lead insert includes `visitor_id` FK (pre-existing, but was always null before 13-01)
5. CRM webhook `matchLeadByEmail()` JOIN retrieves gclid from the visitors row (pre-existing, now operative)

Plan 02 (google-ads.ts annotation) is a documentation-only cleanup. It satisfies the must-haves in its own plan (no runtime regression, dead code documented) and does not affect the primary phase goal.

Both commits are confirmed in git history:
- `1595085` — feat(13-01): add fire-and-forget visit tracking to main-site TrackingProvider
- `d79ba7d` — docs(13-02): annotate google-ads.ts as reference implementation

CAP-03 and CAP-04 are now fully satisfied per REQUIREMENTS.md.

---

_Verified: 2026-02-27T05:30:00Z_
_Verifier: Claude (gsd-verifier)_
