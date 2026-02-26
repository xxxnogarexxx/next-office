---
phase: 01-security-hardening
verified: 2026-02-26T00:00:00Z
status: passed
score: 6/6 must-haves verified
re_verification: false
---

# Phase 01: Security Hardening Verification Report

**Phase Goal:** The most dangerous attack vectors are eliminated — the Overpass proxy cannot be abused, XSS is impossible in transit popups, email templates cannot inject HTML to broker inboxes, and lead endpoints enforce rate limits.
**Verified:** 2026-02-26
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `/api/transit` only accepts predefined query types — arbitrary Overpass QL rejected with 400 | VERIFIED | `ALLOWED_QUERY_TYPES` whitelist in `transit/route.ts` line 3; handler checks `!(type in ALLOWED_QUERY_TYPES)` at line 20 and returns 400 |
| 2 | lat/lng params on all three Overpass routes validated as finite numbers — non-numeric returns 400 | VERIFIED | `parseCoord()` with `Number.isFinite()` present in `transit/route.ts` (line 8), `transit-lines/route.ts` (line 8), and `districts/route.ts` (line 82); each returns 400 if null |
| 3 | Transit popup HTML escapes all OSM tag values — injecting `<img onerror=...>` does not execute | VERIFIED | `escapeHtml()` defined at line 98 of `search-map-inner.tsx`; `safeColour` validated as hex regex at line 152; `setHTML()` at line 158 wraps both `safeColour` and `ref` in `escapeHtml()` |
| 4 | All user-provided fields in broker notification emails are HTML-escaped — submitting `<script>alert(1)</script>` renders as plain text | VERIFIED | `escapeHtml()` present in both `leads/route.ts` (10 usages) and `lp-leads/route.ts` (11 usages); every user field in email templates wrapped with `escapeHtml()`; href values use `encodeURIComponent` |
| 5 | Submitting more than 10 lead requests per minute from the same IP returns 429 | VERIFIED | `checkRateLimit()` function with `RATE_LIMIT_MAX = 10` present in both lead routes; 429 response with `Retry-After` header returned at lines 61-67 (leads) and 76-82 (lp-leads) |
| 6 | Rate limiting applies to both `/api/leads` and `/api/lp-leads` | VERIFIED | Identical rate-limiting implementation confirmed in both `src/app/(main)/api/leads/route.ts` and `src/app/(lp)/api/lp-leads/route.ts` |

**Score:** 6/6 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/(main)/api/transit/route.ts` | Parameterized Overpass proxy with query type whitelist | VERIFIED | `ALLOWED_QUERY_TYPES` const defined lines 3-6; `parseCoord()` at line 8; type check at line 20; coord check at lines 24-29 |
| `src/app/(main)/api/transit-lines/route.ts` | lat/lng validation before Overpass query interpolation | VERIFIED | `parseCoord()` at line 8; applied at lines 19-20; 400 returned at line 23 |
| `src/app/(main)/api/districts/route.ts` | lat/lng validation before Overpass query interpolation | VERIFIED | `parseCoord()` at line 82; applied at lines 93-94; 400 returned at line 97 |
| `src/components/search-map-inner.tsx` | HTML-escaped transit line popup content | VERIFIED | `escapeHtml()` at line 98; `safeColour` hex validation at line 152; `setHTML()` uses both at line 158 |
| `src/app/(main)/api/leads/route.ts` | HTML-escaped email template + rate limiting | VERIFIED | `escapeHtml()` at line 14; `checkRateLimit()` at line 29; rate limiter called at lines 57-67; 10 escapeHtml usages in file |
| `src/app/(lp)/api/lp-leads/route.ts` | HTML-escaped email template + rate limiting | VERIFIED | `escapeHtml()` at line 29; `checkRateLimit()` at line 44; rate limiter called at lines 72-82; 11 escapeHtml usages in file |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `listing-map-inner.tsx` | `/api/transit` | `?type=listing-pois&lat=X&lng=Y` param | VERIFIED | Line 79: `fetch('/api/transit?type=listing-pois&lat=${lat}&lng=${lng}')` — raw `?query=` param removed entirely |
| `leads/route.ts` | `resend.emails.send` | All user fields escaped before HTML interpolation | VERIFIED | `escapeHtml(body.name)`, `escapeHtml(body.email)`, `escapeHtml(body.city)`, `escapeHtml(body.message)`, etc. confirmed at lines 132-153 |
| `lp-leads/route.ts` | `resend.emails.send` | All user fields escaped before HTML interpolation | VERIFIED | `escapeHtml(body.name)`, `escapeHtml(body.email)`, `escapeHtml(body.city)`, `escapeHtml(body.message)` etc. confirmed at lines 188-218; UTM fields also escaped via `.map((s) => escapeHtml(s))` at line 188 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SEC-01 | 01-PLAN.md | Overpass API proxy parameterized — no arbitrary user-controlled queries | SATISFIED | `ALLOWED_QUERY_TYPES` whitelist in `transit/route.ts`; unknown `type` returns 400 |
| SEC-02 | 01-PLAN.md | lat/lng params validated as numbers before Overpass QL interpolation | SATISFIED | `parseCoord()` with `Number.isFinite()` in all three Overpass routes |
| SEC-03 | 01-PLAN.md | Transit popup HTML-escapes all OSM tag values | SATISFIED | `escapeHtml()` applied to `ref` and `safeColour` in `setHTML()` call; hex validation prevents CSS injection |
| SEC-04 | 02-PLAN.md | Notification email templates HTML-escape all user-provided fields | SATISFIED | `escapeHtml()` wraps every user field in both email templates; `encodeURIComponent` used for href values |
| SEC-05 | 02-PLAN.md | Lead endpoints enforce per-IP rate limiting | SATISFIED | In-memory Map rate limiter (10 req/min/IP) with 429 + Retry-After in both `/api/leads` and `/api/lp-leads` |

No orphaned requirements. REQUIREMENTS.md traceability table assigns SEC-01 through SEC-05 exclusively to Phase 1 — all five are confirmed complete. No Phase 1 requirement IDs appear in REQUIREMENTS.md that are not covered by the two plans.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | — | — | — | — |

No TODO, FIXME, placeholder comments, empty implementations, or stub returns found in any of the five modified files. TypeScript compilation passes with zero errors (`npx tsc --noEmit`).

---

## Human Verification Required

### 1. Rate Limit Enforcement in Production

**Test:** Submit 11 POST requests to `/api/leads` from the same IP within 60 seconds.
**Expected:** First 10 succeed (200), 11th returns 429 with `Retry-After` header and body `{ "error": "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }`.
**Why human:** In-memory Map-based rate limiter; cannot verify behaviour across cold starts or multiple workers in Vercel's serverless environment without live deployment.

### 2. XSS Popup in Browser

**Test:** Temporarily inject a line with `ref = "<img onerror=alert(1)>"` into the OSM data pipeline and trigger a transit line hover.
**Expected:** The literal string `<img onerror=alert(1)>` appears as text inside the tooltip span — no alert fires.
**Why human:** setHTML() + escapeHtml() path only provable in a real browser with live Mapbox GL rendering; grep confirms the escape is wired but execution cannot be verified statically.

---

## Commit Verification

Both commits referenced in SUMMARY.md exist in git history and match described changes:

- `6693deb` — "fix(01-01): parameterize Overpass transit proxy and validate coordinates" — modifies `transit/route.ts`, `transit-lines/route.ts`, `districts/route.ts`, `listing-map-inner.tsx`
- `9066b3c` — "fix(01-01): escape OSM tag values in transit line popup HTML" — also bundles `leads/route.ts` and `lp-leads/route.ts` changes

Note: SUMMARY 01-02 acknowledges the email/rate-limit changes were committed in the same batch as 9066b3c (commit message references 01-01 but the diff includes both plans' changes). This is a documentation anomaly, not a missing-code issue — all code is present and correct.

---

## Summary

All six observable truths are verified with direct code evidence. The five security requirements (SEC-01 through SEC-05) are fully implemented and wired. No stubs, placeholders, or anti-patterns found. TypeScript compiles cleanly. Two items flagged for human verification are behavioural tests that cannot be proven statically.

**Phase 01 goal is achieved.**

---

_Verified: 2026-02-26_
_Verifier: Claude (gsd-verifier)_
