# DevOps & Infrastructure Audit — next-office.io

**Auditor:** Claude Opus 4.6 (Senior DevOps/Infrastructure Engineer)
**Date:** 2026-02-25
**Scope:** Main project only (LP/ subfolder excluded from scope; LP code _within_ `src/` is included since it ships in the same build)
**Limitations:** `npm run build`, `npx tsc --noEmit`, and `npm audit` could not be executed due to sandbox restrictions. Findings below are based on thorough static analysis of all source files and configuration.

---

## Executive Summary

The next-office.io codebase is architecturally sound with good TypeScript strictness, clean API routes, and proper SEO setup. However, it has critical gaps in **production operations**: there is no error monitoring service, no environment variable validation at startup, no CI/CD pipeline, no deployment configuration, and no `.env.example` to guide deployers. The `.env.local` file containing live Supabase service-role keys and Resend API keys is present in the working directory and must be confirmed excluded from any deployment artifacts. The API routes that handle lead submissions lack rate limiting and input sanitization for the HTML email body, creating both abuse and XSS risk vectors.

---

## P0 — Must Fix Before Launch

### P0-1: No Runtime Environment Variable Validation

**Affected files:**
- `src/app/(main)/api/leads/route.ts` (lines 7-11)
- `src/app/(lp)/api/lp-leads/route.ts` (lines 7-11)
- `src/lib/map-config.ts` (line 1)

**Description:** All `process.env` references use the non-null assertion operator (`!`) with zero runtime validation. If `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` is missing at deploy time, the Supabase client and Resend client are initialized at module scope with `undefined`, causing cryptic runtime errors on the first request — not at startup.

**Risk:** Lead submissions silently fail in production with no clear error message. You would not know leads are being lost until a customer complains.

**Recommended fix:** Create a `src/lib/env.ts` module that validates all required env vars at import time and throws a clear error during build/startup:
```ts
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  SUPABASE_URL: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  RESEND_API_KEY: requireEnv("RESEND_API_KEY"),
  NOTIFICATION_EMAIL: requireEnv("NOTIFICATION_EMAIL"),
  // Optional
  MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "",
};
```

**Complete list of environment variables discovered in the codebase:**

| Variable | Scope | Required | File(s) |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Yes | `api/leads/route.ts`, `api/lp-leads/route.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Yes | `api/leads/route.ts`, `api/lp-leads/route.ts` |
| `RESEND_API_KEY` | Server | Yes | `api/leads/route.ts`, `api/lp-leads/route.ts` |
| `NOTIFICATION_EMAIL` | Server | Yes | `api/leads/route.ts`, `api/lp-leads/route.ts` |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Public | Yes | `lib/map-config.ts`, `lp/sections/spaces-map-section.tsx` |
| `NEXT_PUBLIC_GA4_ID` | Public | No (LP tracking) | `lp/tracking/gtm-script.tsx` |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Public | No (LP tracking) | `lp/tracking/gtm-script.tsx` |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID` | Public | No (LP tracking) | `lp/[city]/danke/conversion-tracker.tsx` |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Public | No (LP tracking) | `lp/[city]/danke/conversion-tracker.tsx` |
| `SUPABASE_DB_PASSWORD` | N/A | Unused in code | `.env.local` only (not referenced anywhere in `src/`) |

---

### P0-2: No `.env.example` or Environment Documentation

**Affected files:** Project root (missing file)

**Description:** There is no `.env.example`, `.env.template`, or documented list of required environment variables anywhere in the project. The `.gitignore` correctly excludes `.env*` files, meaning anyone cloning this repo has no idea what variables are needed. The `.env.local` file in the working directory contains live production secrets.

**Risk:** Any new developer, CI system, or deployment platform (Vercel, etc.) will have no guidance on what to configure. Deployments will fail silently (see P0-1).

**Recommended fix:** Create `.env.example` at project root:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend (email notifications)
RESEND_API_KEY=
NOTIFICATION_EMAIL=

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=

# Google Ads / GA4 (optional — LP tracking)
# NEXT_PUBLIC_GA4_ID=
# NEXT_PUBLIC_GOOGLE_ADS_ID=
# NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=
# NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=
```

---

### P0-3: No Error Monitoring Service

**Affected files:** Entire codebase (no Sentry, LogRocket, Datadog, or equivalent)

**Description:** The application has zero error monitoring infrastructure. API route errors are logged to `console.error` only (4 locations across both lead routes). There is no alerting, no error aggregation, and no way to detect failures in production.

Specific blind spots:
- If the Supabase insert fails (`api/leads/route.ts:57`, `api/lp-leads/route.ts:106`), the error is logged to server stdout only — no notification is sent anywhere.
- If the Resend email notification fails (`api/leads/route.ts:102`, `api/lp-leads/route.ts:166`), the error is caught and logged but the lead is already saved. You would never know emails are not being delivered.
- Client-side JavaScript errors (React rendering failures, Mapbox init errors) are completely invisible.

**Risk:** You have no way to know if lead submissions are failing in production. For a B2B lead-gen platform, this is a business-critical gap. Lost leads = lost revenue.

**Recommended fix:** Add Sentry (free tier: 5,000 events/mo) with Next.js SDK. This gives you server-side error tracking, client-side error boundaries, and Slack/email alerts.

---

### P0-4: No Rate Limiting on Lead Submission Endpoints

**Affected files:**
- `src/app/(main)/api/leads/route.ts`
- `src/app/(lp)/api/lp-leads/route.ts`

**Description:** Both POST endpoints accept unlimited requests with no rate limiting, CAPTCHA, or anti-bot protection. An attacker can submit thousands of fake leads per minute, filling your Supabase table with junk and burning through Resend email quota.

**Risk:** Spam abuse, Supabase storage costs, Resend rate limit exhaustion (which blocks real notification emails), and degraded data quality.

**Recommended fix:** Add rate limiting via:
1. Vercel's built-in rate limiting (if deploying to Vercel)
2. An in-memory rate limiter in middleware (IP-based, 5 req/min per IP)
3. A honeypot field in the form (already using `autoComplete="one-time-code"` which helps, but is not sufficient)

---

### P0-5: XSS Risk in Email Notification HTML

**Affected files:**
- `src/app/(main)/api/leads/route.ts` (lines 84-100)
- `src/app/(lp)/api/lp-leads/route.ts` (lines 148-164)

**Description:** User-submitted form data (`body.name`, `body.email`, `body.phone`, `body.message`, `body.city`, `body.listing_name`) is interpolated directly into HTML email templates using template literals with zero escaping:

```ts
<td style="...">${body.name}</td>
```

If an attacker submits `<script>alert(1)</script>` as their name, the raw HTML is sent via Resend to the `NOTIFICATION_EMAIL` address. While most modern email clients strip `<script>` tags, other payloads (e.g., `<img onerror>`, CSS injection) may execute depending on the email client.

**Risk:** Stored XSS delivered via email to the broker team. Low likelihood of exploitation in Gmail, higher risk in Outlook/webmail clients.

**Recommended fix:** Create a simple HTML escape utility and apply it to all user inputs before interpolation:
```ts
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
```

---

## P1 — Should Fix Before Launch

### P1-1: No CI/CD Pipeline

**Affected files:** Project root (no `.github/` directory, no `vercel.json`, no `Dockerfile`)

**Description:** There is no continuous integration or continuous deployment configuration. No GitHub Actions, no Vercel config, no Docker setup. This means:
- No automated type checking on pull requests
- No automated linting on pull requests
- No automated build verification
- No automated deployment

**Risk:** Broken code can be deployed to production without any gate. TypeScript errors, ESLint violations, and build failures are only caught by manual local testing.

**Recommended fix:** At minimum, create `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm run build
```

---

### P1-2: No Health Check Endpoint

**Affected files:** None (missing)

**Description:** There is no `/api/health` or equivalent endpoint. Uptime monitoring services (UptimeRobot, Better Uptime, etc.) need a lightweight endpoint that confirms the application is running and can reach its dependencies (Supabase, Resend).

**Risk:** If the application goes down, you have no automated way to detect it.

**Recommended fix:** Create `src/app/(main)/api/health/route.ts`:
```ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

---

### P1-3: Open Overpass API Proxy

**Affected files:**
- `src/app/(main)/api/transit/route.ts` (lines 3-39)

**Description:** The `/api/transit` endpoint accepts an arbitrary Overpass API query string from the client (`request.nextUrl.searchParams.get("query")`) and forwards it directly to `overpass-api.de`. This is an open proxy — anyone can use your server to relay arbitrary queries to the Overpass API.

The `/api/districts` and `/api/transit-lines` endpoints are safer — they construct the Overpass query server-side from validated `lat`/`lng` parameters.

**Risk:** Abuse of your server as a proxy to hammer the Overpass API, which could get your server IP blocked by Overpass and break the transit/district features for legitimate users.

**Recommended fix:** Either remove the generic `/api/transit` endpoint and move all query construction server-side, or validate/whitelist the incoming query patterns.

---

### P1-4: Placeholder Google Ads Conversion Code in Production Build

**Affected files:**
- `src/components/lp/sections/lead-form-section.tsx` (line 35)

**Description:** The lead form section contains a hardcoded placeholder conversion tag:
```ts
send_to: "AW-XXXXXXXXXX/XXXXXXXXXX", // placeholder — replace with real AW-CONVERSION_ID/LABEL
```

This fires on every LP form submission but sends to an invalid conversion ID. The thank-you page conversion tracker (`conversion-tracker.tsx`) correctly uses env vars, but this inline one does not.

**Risk:** LP form submit conversions will never be tracked in Google Ads, breaking conversion attribution for ad spend optimization.

**Recommended fix:** Replace the hardcoded placeholder with env var references (matching the pattern in `conversion-tracker.tsx`) or remove the inline conversion tag entirely if the thank-you page tag is sufficient.

---

### P1-5: Missing Security Headers

**Affected files:**
- `next.config.ts` (no headers configuration)
- `src/middleware.ts` (no security headers set)

**Description:** No security headers are configured anywhere in the application:
- No `Content-Security-Policy`
- No `X-Frame-Options` (site can be embedded in iframes)
- No `X-Content-Type-Options`
- No `Strict-Transport-Security`
- No `Referrer-Policy`
- No `Permissions-Policy`

**Risk:** Clickjacking attacks (iframe embedding), MIME sniffing, and missing HSTS.

**Recommended fix:** Add a `headers()` function to `next.config.ts`:
```ts
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    ],
  }];
}
```

---

### P1-6: No CORS Configuration on API Routes

**Affected files:**
- `src/app/(main)/api/leads/route.ts`
- `src/app/(lp)/api/lp-leads/route.ts`
- `src/app/(main)/api/transit/route.ts`
- `src/app/(main)/api/districts/route.ts`
- `src/app/(main)/api/transit-lines/route.ts`

**Description:** None of the API routes set CORS headers or validate the `Origin` header. By default, Next.js API routes are accessible from any origin. While the lead routes use POST with `Content-Type: application/json` (which triggers CORS preflight), there is no explicit CORS policy.

**Risk:** Third-party sites could submit leads to your API or use your Overpass proxy. The cookie-based tracking in middleware compounds this — cross-origin requests could set tracking cookies.

**Recommended fix:** Add `Access-Control-Allow-Origin` headers restricting to `https://next-office.io` in production.

---

## P2 — Post-Launch / Nice to Have

### P2-1: `any` Type Usage

**Affected files:**
- `src/components/search-map-inner.tsx` (lines 20, 24, 135) — `eslint-disable @typescript-eslint/no-explicit-any` file-wide disable, `features: any[]`, `e: any`
- `src/scripts/import-contentful.ts` (lines 38-39, 53, 59, 232-233, 257, 266) — multiple `any` usages (acceptable in a one-off import script)

**Description:** The `search-map-inner.tsx` component disables the `no-explicit-any` rule at the file level and uses `any` for GeoJSON features and Mapbox event handlers. The Mapbox GL typings are complex, but `any` suppresses type safety.

**Risk:** Low — Mapbox events are well-understood. But `features: any[]` could mask data shape issues.

**Recommended fix:** Type the GeoJSON features properly using `GeoJSON.Feature[]` from the `@types/geojson` package (already a transitive dependency of `react-map-gl`). Use `MapLayerMouseEvent` for the event handler.

---

### P2-2: `console.log` in Import Script

**Affected files:**
- `src/scripts/generate-csv.ts` (line 59)
- `src/scripts/import-contentful.ts` (lines 229-255, 468-494)

**Description:** The import scripts use `console.log` for output. These are CLI tools, not production code, so this is acceptable. No `console.log` statements were found in production source files (`src/app/`, `src/components/`, `src/lib/`). The only `console.error` usages are in API route catch blocks, which is appropriate.

**Risk:** None. This is a non-issue — noted for completeness.

---

### P2-3: No Pre-Commit Hooks

**Affected files:** Project root (no `.husky/`, no `lint-staged` config)

**Description:** There are no pre-commit hooks to enforce linting or type checking before commits. Combined with the lack of CI (P1-1), there is no automated quality gate at any point in the development workflow.

**Risk:** Bad commits can be pushed without any automated check.

**Recommended fix:** Add Husky + lint-staged:
```bash
npx husky init
npx husky add .husky/pre-commit "npx lint-staged"
```

---

### P2-4: Missing `next.config.ts` Production Settings

**Affected files:**
- `next.config.ts`

**Description:** The Next.js config is minimal — it only defines `images.remotePatterns`. Consider adding:
- `output: "standalone"` if deploying to Docker/self-hosted (reduces image size)
- `poweredByHeader: false` (removes `X-Powered-By: Next.js` header)
- Security headers (see P1-5)

**Risk:** Low. The `X-Powered-By` header discloses the framework, which is minor information leakage.

---

### P2-5: `NEXT_PUBLIC_SUPABASE_ANON_KEY` Present in `.env.local` But Unused in Code

**Affected files:**
- `.env.local` (line 3)

**Description:** The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is defined in `.env.local` but is never referenced anywhere in the source code. Both API routes use `SUPABASE_SERVICE_ROLE_KEY` for server-side operations. The anon key may have been intended for client-side Supabase access that was never implemented.

**Risk:** None currently. If client-side Supabase access is planned, the anon key is ready. Otherwise, it is dead configuration.

---

### P2-6: `suppressHydrationWarning` Usage

**Affected files:**
- `src/app/layout.tsx` (lines 77, 85) — on `<html>` and `<body>`
- `src/app/(main)/layout.tsx` (line 20) — on `<main>`
- `src/components/search-bar.tsx` (lines 144, 177) — on search inputs

**Description:** `suppressHydrationWarning` is used on the root `<html>` and `<body>` elements (common pattern for theme/extension compatibility) and on the search bar inputs (likely to handle browser autofill differences). The `<main>` usage in the main layout is less justified.

**Risk:** Low. This can mask legitimate hydration bugs. Consider removing it from `<main>` and monitoring for actual hydration issues.

---

## Appendix: What Looks Good

The following areas are well-implemented and need no changes:

- **TypeScript strictness:** `"strict": true` is enabled in `tsconfig.json`. No `@ts-ignore` or `@ts-nocheck` found anywhere.
- **SEO setup:** `robots.ts`, `sitemap.ts`, JSON-LD structured data on listings and blog posts, proper metadata on all routes, canonical URLs.
- **`.gitignore`:** Correctly excludes `.env*`, `node_modules/`, `.next/`, `*.tsbuildinfo`, `.vercel/`.
- **No secrets in `NEXT_PUBLIC_` vars:** All `NEXT_PUBLIC_` prefixed vars are genuinely public (Supabase URL, anon key, Mapbox token, GA4 IDs). Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) correctly have no `NEXT_PUBLIC_` prefix.
- **Cookie security:** Tracking cookies in middleware are set with `httpOnly: true`, `secure: true`, `sameSite: "lax"`.
- **Error handling in API routes:** Both lead routes have try/catch blocks, return proper HTTP status codes (400, 500), and log errors.
- **Email notifications are fire-and-forget:** The Resend `.send()` call uses `.catch()` so email failures don't block the API response. The lead is saved first.
- **Input validation:** The LP leads endpoint validates all required fields and email format. The main leads endpoint validates name and email.
- **No development-only code paths:** No `process.env.NODE_ENV === 'development'` checks found in production code.
- **`dangerouslySetInnerHTML` usage is safe:** All 4 occurrences are for JSON-LD structured data (`JSON.stringify` of server-controlled data) and GTM script initialization (env var values only). None interpolate user input.
- **Dependency choices are modern and appropriate:** Next.js 16, React 19, Tailwind CSS 4, Supabase, Mapbox GL, Resend, Radix UI — all current, well-maintained libraries.

---

## Summary Table

| ID | Severity | Finding | Effort |
|----|----------|---------|--------|
| P0-1 | P0 | No env var validation — silent failures | 1h |
| P0-2 | P0 | No `.env.example` | 15min |
| P0-3 | P0 | No error monitoring (Sentry) | 2h |
| P0-4 | P0 | No rate limiting on lead endpoints | 2h |
| P0-5 | P0 | XSS in email HTML templates | 30min |
| P1-1 | P1 | No CI/CD pipeline | 2h |
| P1-2 | P1 | No health check endpoint | 15min |
| P1-3 | P1 | Open Overpass API proxy | 1h |
| P1-4 | P1 | Placeholder Google Ads conversion code | 15min |
| P1-5 | P1 | Missing security headers | 30min |
| P1-6 | P1 | No CORS policy on API routes | 1h |
| P2-1 | P2 | `any` type in search-map-inner | 30min |
| P2-2 | P2 | console.log in scripts (acceptable) | N/A |
| P2-3 | P2 | No pre-commit hooks | 30min |
| P2-4 | P2 | Missing next.config.ts settings | 15min |
| P2-5 | P2 | Unused SUPABASE_ANON_KEY in env | N/A |
| P2-6 | P2 | Broad suppressHydrationWarning | 15min |

**Total estimated effort for P0 items: ~6 hours**
**Total estimated effort for P1 items: ~5 hours**
