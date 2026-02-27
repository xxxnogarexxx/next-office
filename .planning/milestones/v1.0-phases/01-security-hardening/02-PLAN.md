---
phase: 01-security-hardening
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/(main)/api/leads/route.ts
  - src/app/(lp)/api/lp-leads/route.ts
autonomous: true
requirements: [SEC-04, SEC-05]

must_haves:
  truths:
    - "All user-provided fields in broker notification emails are HTML-escaped — submitting <script>alert(1)</script> as a name renders as plain text in the email"
    - "Submitting more than 10 lead requests per minute from the same IP returns 429 — the lead endpoint is not open to unlimited abuse"
    - "Rate limiting applies to both /api/leads and /api/lp-leads endpoints"
  artifacts:
    - path: "src/app/(main)/api/leads/route.ts"
      provides: "HTML-escaped email template + rate limiting"
      contains: "escapeHtml"
    - path: "src/app/(lp)/api/lp-leads/route.ts"
      provides: "HTML-escaped email template + rate limiting"
      contains: "escapeHtml"
  key_links:
    - from: "src/app/(main)/api/leads/route.ts"
      to: "resend.emails.send"
      via: "All user fields escaped before HTML template interpolation"
      pattern: "escapeHtml\\(body\\."
    - from: "src/app/(lp)/api/lp-leads/route.ts"
      to: "resend.emails.send"
      via: "All user fields escaped before HTML template interpolation"
      pattern: "escapeHtml\\(body\\."
---

<objective>
Escape user data in broker notification emails and enforce per-IP rate limiting on lead endpoints.

Purpose: Both lead API routes (`/api/leads` and `/api/lp-leads`) interpolate user-submitted fields (name, email, phone, company, message, city, listing_name, UTM data) directly into HTML email templates sent to the broker team. A malicious submission could inject HTML/JavaScript into the broker's email client. Additionally, neither endpoint has rate limiting, so an attacker could flood the system with unlimited lead submissions.

Output: HTML-escaped email templates in both routes and a shared in-memory rate limiter enforcing 10 requests/min/IP.
</objective>

<execution_context>
@/Users/szymonwilkosz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/szymonwilkosz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-security-hardening/01-CONTEXT.md

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from codebase. -->

From src/app/(main)/api/leads/route.ts (CURRENT — email template with unescaped fields):
```typescript
// Line 6-9: Uses service role key (out of scope for this plan — Phase 3 SEC-10)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Line 13: POST handler — no rate limiting
export async function POST(request: Request) {

// Lines 76-101: Email template — all body.* fields interpolated raw into HTML
// body.name, body.email, body.phone, body.team_size, body.start_date,
// body.city, body.listing_name, body.message, company (derived from email)
// Also: email subject line includes body.team_size, body.start_date, body.city, company
```

From src/app/(lp)/api/lp-leads/route.ts (CURRENT — email template with unescaped fields):
```typescript
// Same pattern: body.name, body.email, body.phone, body.team_size,
// body.start_date, body.city, body.message, body.company,
// body.utm_source, body.utm_medium, body.utm_term, companyDisplay
// Lines 148-165: HTML email template with raw interpolation
// Also: email subject line includes body.team_size, body.start_date, body.city, companyDisplay
```

From next.config.ts or middleware — request.headers:
```typescript
// Rate limiting needs IP extraction
// In Next.js: request.headers.get("x-forwarded-for") || request.ip
// For Vercel: request.headers.get("x-forwarded-for") gives real IP
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: HTML-escape all user fields in email templates and add rate limiting to both lead routes</name>
  <files>
    src/app/(main)/api/leads/route.ts
    src/app/(lp)/api/lp-leads/route.ts
  </files>
  <action>
**SEC-04: HTML-escape all user-provided fields in email templates**

Add the same HTML escape utility to both route files (duplicated — no shared file to keep routes self-contained, and this will be consolidated in Phase 3 REL-04):

```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
```

Per user decision: ALL user-submitted fields are HTML-escaped before inclusion in emails — name, email, phone, company, message, city, listing_name, UTM fields. No exceptions.

**In `src/app/(main)/api/leads/route.ts`:**

Escape every user-supplied field used in the email template (lines 76-101) AND the email subject (line 83):

Fields to escape in the HTML body:
- `body.name` (line 88)
- `body.email` (line 89, both in href and text)
- `company` (line 90) — derived from email, still user-influenced
- `body.phone` (line 91, both in href and text)
- `body.team_size` (line 92)
- `body.start_date` (via toLocaleDateString — already safe, but escape for consistency)
- `body.city` (line 94)
- `body.listing_name` (line 76-77)
- `body.message` (line 97)

Fields to escape in the subject line (line 83):
- `body.city`
- `company`
- `body.team_size` (number, but escape for defense-in-depth)

The pattern for each interpolation:
```typescript
// BEFORE:
${body.name}
// AFTER:
${escapeHtml(body.name || "")}
```

For the `mailto:` and `tel:` href attributes, use `encodeURIComponent` for the href value and `escapeHtml` for the displayed text:
```typescript
// BEFORE:
<a href="mailto:${body.email}">${body.email}</a>
// AFTER:
<a href="mailto:${encodeURIComponent(body.email)}">${escapeHtml(body.email)}</a>
```

**In `src/app/(lp)/api/lp-leads/route.ts`:**

Same treatment. Escape every user-supplied field in the email template (lines 148-165) AND the subject (lines 139-147):

Fields to escape in the HTML body:
- `body.name` (line 152)
- `body.email` (line 153)
- `companyDisplay` (line 154)
- `body.phone` (line 155)
- `body.team_size` (line 156)
- `body.start_date` (via toLocaleDateString)
- `body.city` (line 158)
- UTM row: `body.utm_source`, `body.utm_medium`, `body.utm_term` (line 131)
- `body.message` (line 161)

Fields to escape in the subject line:
- `body.city`
- `companyDisplay`
- `body.team_size`

**SEC-05: Per-IP rate limiting on lead endpoints**

Per user decisions:
- 10 requests per minute per IP
- Lead endpoints only (both /api/leads and /api/lp-leads)
- In-memory Map-based store
- Rate limit state does not need to persist across restarts

Create the rate limiter as a module-level singleton at the top of each route file. Since Next.js API routes share the same Node.js process, a module-level Map works. Duplicate in both files to keep them self-contained (Phase 3 will consolidate).

```typescript
// Simple in-memory rate limiter
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { limited: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false };
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { limited: true, retryAfter };
  }

  return { limited: false };
}

// Periodic cleanup of stale entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now >= entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);
```

At the start of the POST handler in both routes, extract the IP and check the rate limit:

```typescript
export async function POST(request: Request) {
  // Rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const rateCheck = checkRateLimit(ip);
  if (rateCheck.limited) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfter) },
      }
    );
  }

  // ... rest of handler
```

Per user decision:
- 429 body: friendly German message
- Retry-After header included
- Standard error shape: `{ error: string }`

**Important:** Do NOT change anything related to Supabase client creation, cookie handling, or the DB insert logic. This plan only touches email escaping and rate limiting.
  </action>
  <verify>
    <automated>cd "/Users/szymonwilkosz/Library/Mobile Documents/com~apple~CloudDocs/claude-config/projects/next-office" && npx tsc --noEmit 2>&1 | head -30</automated>
    Verify that:
    1. TypeScript compiles without errors
    2. `grep -c "escapeHtml" src/app/\(main\)/api/leads/route.ts` shows multiple uses (function definition + each field)
    3. `grep -c "escapeHtml" src/app/\(lp\)/api/lp-leads/route.ts` shows multiple uses
    4. `grep -n "checkRateLimit\|RATE_LIMIT" src/app/\(main\)/api/leads/route.ts` shows rate limiter
    5. `grep -n "checkRateLimit\|RATE_LIMIT" src/app/\(lp\)/api/lp-leads/route.ts` shows rate limiter
    6. `grep -n "429\|Retry-After" src/app/\(main\)/api/leads/route.ts src/app/\(lp\)/api/lp-leads/route.ts` shows 429 responses in both files
    7. No raw `${body.name}` or `${body.email}` etc. appear in the HTML email template sections — all should be wrapped in `escapeHtml()`
  </verify>
  <done>
    - All user-provided fields (name, email, phone, company, message, city, listing_name, UTM data) are HTML-escaped in both /api/leads and /api/lp-leads email templates
    - Email subjects also escape user-provided fields
    - mailto: and tel: href values use encodeURIComponent
    - Both routes enforce 10 req/min/IP rate limiting with in-memory Map store
    - Rate-limited requests receive 429 with Retry-After header and friendly German error message
    - Error responses use standard shape: { error: string }
  </done>
</task>

</tasks>

<verification>
After task completes:
1. `npx tsc --noEmit` passes with no errors
2. Both lead routes HTML-escape every user field before email interpolation
3. Both lead routes enforce per-IP rate limiting (10/min)
4. Rate-limited responses return 429 with Retry-After header
5. No raw user data appears in HTML email templates
</verification>

<success_criteria>
- Submitting `<script>alert(1)</script>` as a name field results in the escaped string `&lt;script&gt;alert(1)&lt;/script&gt;` appearing in the broker email — not executable HTML
- All user fields in both email templates (main leads + LP leads) are escaped — grep confirms no raw body.* interpolation in the HTML sections
- Submitting 11 requests in under 1 minute from the same IP results in a 429 response on the 11th request
- The 429 response includes a Retry-After header and a friendly German error message
- After the rate limit window expires (~60s), requests from the same IP succeed again
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-hardening/01-02-SUMMARY.md`
</output>
