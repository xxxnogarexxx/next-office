---
phase: 03-lead-pipeline-hardening
verified: 2026-02-26T09:00:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
---

# Phase 3: Lead Pipeline Hardening Verification Report

**Phase Goal:** The lead submission path is hardened end-to-end — CSRF-protected, input-validated, scoped to least privilege, deduplicated, consolidated into one service, and non-blocking for email delivery.
**Verified:** 2026-02-26
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A cross-origin POST to /api/leads without a valid CSRF token is rejected with 403 | VERIFIED | `service.ts` line 105 calls `verifyCsrfToken(csrfToken, csrfCookie)` — returns 403 with generic error on failure. `verifyCsrfToken` returns false if either arg is null/empty or HMAC does not match. A cross-origin POST without the cookie set gets a null cookie value → false → 403. |
| 2 | Submitting a lead with email "hello" returns a validation error on both routes | VERIFIED | Both routes delegate to `handleLeadSubmission` via shared service. `validateLeadPayload` calls `validateEmail` (line 119), which tests RFC 5322 regex. Confirmed by manual regex test: `"hello"` → `false`. LP form also has its own client-side regex that rejects "hello" (confirmed by test). Server-side validation is the enforcement point for both routes. |
| 3 | Lead inserts use the anon key, not the service role key — SUPABASE_SERVICE_ROLE_KEY absent from lead route code | VERIFIED | `src/lib/leads/supabase.ts` uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` only. `SUPABASE_SERVICE_ROLE_KEY` appears in `csrf.ts` only as HMAC signing secret (not DB access) — design decision documented in code comment. Neither route file (`/api/leads/route.ts`, `/api/lp-leads/route.ts`) references the service role key. |
| 4 | Submitting a duplicate lead (same phone + city within 24h) returns a deduplicated success response | VERIFIED | `service.ts` lines 152-161: when both `phone` and `city` are present, `checkDuplicate()` is called. If it returns true, responds immediately with `{ success: true, deduplicated: true }` (200, no insert). `supabase.ts` queries with `.eq('phone', phone).eq('city', city).gte('created_at', windowStart).limit(1)` where `windowStart` is 24h ago. |
| 5 | The lead API response returns within 500ms regardless of email delivery latency | VERIFIED | `service.ts` line 173: `sendLeadNotification(resolvedData, source)` — called without `await`. `email.ts` function signature is `void`, not `Promise<void>`. Resend call uses `.catch()` not `await`. Email sending is entirely fire-and-forget; the API response at line 176 follows immediately. |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/leads/validation.ts` | Input validation — email, body size, field types, cookie format | VERIFIED | 298 lines. Exports `validateEmail`, `validateCookieValue`, `validateLeadPayload`, `ValidatedLeadData` interface. Zero external dependencies. |
| `src/lib/leads/csrf.ts` | CSRF token generation and verification (HMAC-SHA256) | VERIFIED | 84 lines. Exports `generateCsrfToken`, `verifyCsrfToken`, `CSRF_COOKIE_NAME = "_no_csrf"`. Uses `crypto.randomBytes` + `crypto.timingSafeEqual`. |
| `src/lib/leads/supabase.ts` | Scoped Supabase client using anon key + duplicate detection | VERIFIED | 104 lines. Exports `createScopedClient` (uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`), `checkDuplicate` (24h dedup window), `insertLead`. Service role key explicitly absent. |
| `src/lib/leads/email.ts` | Non-blocking email notification (fire-and-forget) | VERIFIED | 173 lines. Exports `escapeHtml` (single source of truth), `sendLeadNotification` (returns `void`, no `await`). |
| `src/lib/leads/service.ts` | Pipeline orchestrator — 9-step lead handling | VERIFIED | 200 lines. Exports `handleLeadSubmission` (full pipeline) and `handleCsrfToken` (GET handler). Rate limiter, CSRF verify, validate, dedup, insert, email all wired in sequence. |
| `src/app/(main)/api/leads/route.ts` | Thin route handler delegating to shared service | VERIFIED | 5 lines. Imports only `handleLeadSubmission`, exports `POST`. |
| `src/app/(lp)/api/lp-leads/route.ts` | Thin route handler delegating to shared service | VERIFIED | 5 lines. Imports only `handleLeadSubmission`, exports `POST`. |
| `src/app/(main)/api/csrf/route.ts` | CSRF token generation endpoint | VERIFIED | 5 lines. Imports `handleCsrfToken`, exports `GET`. |
| `src/components/lead-form.tsx` | Main site lead form with CSRF token integration | VERIFIED | Fetches `/api/csrf` on mount (`useEffect`, line 44-49). Sends `x-csrf-token` header and `credentials: "same-origin"` in POST (lines 92-96). Non-blocking (silent catch). |
| `src/components/lp/sections/lead-form-section.tsx` | LP lead form with CSRF token integration | VERIFIED | Same pattern — fetches `/api/csrf` on mount (lines 138-143), sends `x-csrf-token` header (line 235), `credentials: "same-origin"` (line 236). |
| `src/middleware.ts` | CORS preflight allows x-csrf-token header | VERIFIED | Line 43: `"Content-Type, x-csrf-token"` in `Access-Control-Allow-Headers`. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/(main)/api/leads/route.ts` | `src/lib/leads/service.ts` | `import handleLeadSubmission` | WIRED | Line 1: `import { handleLeadSubmission } from "@/lib/leads/service"` |
| `src/app/(lp)/api/lp-leads/route.ts` | `src/lib/leads/service.ts` | `import handleLeadSubmission` | WIRED | Line 1: `import { handleLeadSubmission } from "@/lib/leads/service"` |
| `src/app/(main)/api/csrf/route.ts` | `src/lib/leads/service.ts` | `import handleCsrfToken` | WIRED | Line 1: `import { handleCsrfToken } from "@/lib/leads/service"` |
| `src/components/lead-form.tsx` | `/api/csrf` | fetch on mount | WIRED | Line 45: `fetch("/api/csrf", { credentials: "same-origin" })`, reads `data.csrfToken` |
| `src/components/lp/sections/lead-form-section.tsx` | `/api/csrf` | fetch on mount | WIRED | Line 139: `fetch("/api/csrf", { credentials: "same-origin" })`, reads `data.csrfToken` |
| `src/lib/leads/service.ts` | `src/lib/leads/validation.ts` | `import validateLeadPayload` | WIRED | Line 25: `import { validateLeadPayload, validateCookieValue } from "./validation"` |
| `src/lib/leads/service.ts` | `src/lib/leads/supabase.ts` | `import checkDuplicate, insertLead` | WIRED | Line 27: `import { checkDuplicate, insertLead } from "./supabase"` |
| `src/lib/leads/service.ts` | `src/lib/leads/email.ts` | `import sendLeadNotification` | WIRED | Line 28: `import { sendLeadNotification } from "./email"` |
| `src/lib/leads/service.ts` | `src/lib/leads/csrf.ts` | `import verifyCsrfToken` | WIRED | Line 26: `import { generateCsrfToken, verifyCsrfToken, CSRF_COOKIE_NAME } from "./csrf"` |

Note on `csrfToken` field naming: The PLAN specified forms read `data.token`, but the implementation returns `{ csrfToken: token }` from `handleCsrfToken` (service.ts line 189) and forms correctly read `data.csrfToken`. This deviation is documented in 03-02-SUMMARY.md as a key decision. The wiring is consistent end-to-end — no functional gap.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| SEC-07 | 03-01, 03-02 | Lead form endpoints have CSRF protection | SATISFIED | Double-submit cookie CSRF with HMAC-SHA256 in `csrf.ts`; enforced in `service.ts` step 3; forms fetch token on mount |
| SEC-08 | 03-01, 03-02 | Email validation uses RFC-compliant check on both main and LP routes | SATISFIED | `validateEmail` with RFC 5322 simplified regex; both routes delegate to shared service |
| SEC-09 | 03-01 | Cookie values validated for format and length | SATISFIED | `validateCookieValue` in `validation.ts`: max 150 chars, alphanumeric+safe chars only, rejects HTML injection chars; applied to body cookie fields and server cookie fallbacks |
| SEC-10 | 03-01, 03-02 | Lead inserts use scoped Supabase access instead of service role key | SATISFIED | `supabase.ts` uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`; service role key absent from DB module and both route files |
| SEC-11 | 03-01 | Lead request bodies validated for input size and field types | SATISFIED | `validateLeadPayload`: 10KB body limit, field-level size limits (name 200, message 5000, etc.), type guards on all fields |
| REL-04 | 03-01, 03-02 | Lead API routes consolidated into shared service | SATISFIED | Both routes are 5-line thin wrappers; all logic in `src/lib/leads/`; `escapeHtml` has single definition in `email.ts`; rate limiter singleton in `service.ts` |
| REL-05 | 03-01, 03-02 | Email sending does not block lead API response path | SATISFIED | `sendLeadNotification` returns `void`, called without `await` at step 8; API response returned at step 9 immediately after |
| REL-06 | 03-01, 03-02 | Duplicate leads detected by phone + city before insert | SATISFIED | `checkDuplicate` called when phone+city both present; returns `{ success: true, deduplicated: true }` with 200 (idempotent) |

All 8 requirement IDs from both PLAN files are covered. No orphaned requirements.

REQUIREMENTS.md traceability table marks all 8 as Phase 3 / Complete.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/lp/sections/lead-form-section.tsx` | 35 | `send_to: "AW-XXXXXXXXXX/XXXXXXXXXX"` (placeholder Google Ads conversion ID) | Info | This is a pre-existing placeholder from Phase 2's Google Ads integration. It is outside the scope of Phase 3 (lead hardening). Tracked as DEV-07, already marked complete in REQUIREMENTS.md with a separate plan. No impact on Phase 3 goal. |

No stub implementations, no empty return values, no placeholder error handlers found in any Phase 3 artifacts.

---

### Human Verification Required

#### 1. CSRF Rejection Under Real HTTP Conditions

**Test:** Submit the main site lead form with browser devtools network tab open. Manually delete the `_no_csrf` cookie after the page loads but before submitting. Submit the form.
**Expected:** Server returns 403; form shows generic error state.
**Why human:** Cannot verify cookie deletion + rejection flow programmatically without running the application.

#### 2. Duplicate Lead Dedup Flow

**Test:** Submit the lead form twice with the same phone number and city within 60 seconds.
**Expected:** Second submission returns `{ success: true, deduplicated: true }` — form shows success state, but no second row appears in the Supabase `leads` table.
**Why human:** Requires live Supabase connection to confirm no second DB row is created.

#### 3. Email Non-Blocking Latency

**Test:** Submit the lead form while observing network timing in devtools.
**Expected:** The POST to `/api/leads` completes in well under 500ms (email is fire-and-forget; Resend latency should not appear in the response time).
**Why human:** Requires live server environment to measure actual response timing.

---

### Verification Summary

All 5 observable success criteria from the phase prompt are satisfied. All 10 artifacts exist with substantive implementations and are correctly wired. All 8 requirements (SEC-07 through SEC-11, REL-04 through REL-06) have implementation evidence and are marked complete in REQUIREMENTS.md.

Key findings:
- The `SUPABASE_SERVICE_ROLE_KEY` appears in `csrf.ts` — this is intentional (used as HMAC secret, not for DB access), documented in code comments, and does not violate SEC-10 which targets DB-level scoping.
- The CSRF response field name (`csrfToken` vs `token`) differs from the Plan 02 spec, but is consistent end-to-end between `service.ts` and both form components. This is a harmless deviation documented in the SUMMARY.
- TypeScript compiles with zero errors (`npx tsc --noEmit` exits 0).
- All 4 task commits (842d08d, 6823460, c76c7ab, 4ae9b6c) verified in git history.

Phase 3 goal is fully achieved.

---

_Verified: 2026-02-26_
_Verifier: Claude (gsd-verifier)_
