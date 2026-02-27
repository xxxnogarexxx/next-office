/**
 * Lead pipeline orchestrator.
 *
 * handleLeadSubmission() is the single entry point for both lead API routes:
 *   - /api/leads  (source: 'main')
 *   - /api/lp-leads (source: 'lp')
 *
 * Pipeline:
 *   1. Rate limiting (10 req/min/IP, in-memory Map)
 *   2. JSON body parse
 *   3. CSRF verification (x-csrf-token header + _no_csrf cookie)
 *   4. Payload validation (validateLeadPayload)
 *   5. Tracking cookie resolution (body first, server cookies as fallback, then validateCookieValue)
 *   5b. Resolve visitor_id cookie to UUID primary key in visitors table (CAP-04)
 *   5c. Merge UTM values from cookies as authoritative source (CAP-05)
 *   6. Duplicate detection (phone + city, 24h window)
 *   7. Supabase insert (with visitorUuid and UTMs)
 *   8. Email notification (fire-and-forget)
 *   9. Return { success: true }
 *
 * handleCsrfToken() is a GET handler for the /api/csrf endpoint.
 * It generates a CSRF token pair, sets the cookie, and returns the token.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateLeadPayload, validateCookieValue } from "./validation";
import { generateCsrfToken, verifyCsrfToken, CSRF_COOKIE_NAME } from "./csrf";
import { checkDuplicate, insertLead, resolveVisitorUuid } from "./supabase";
import { sendLeadNotification } from "./email";
import { hashEmail } from "@/lib/tracking/hash";
import { sendGA4Event } from "@/lib/tracking/ga4-mp";

// ---------------------------------------------------------------------------
// Rate limiter — module-level singleton (same pattern as existing route files)
// 10 requests per minute per IP, in-memory Map, no persistence across restarts
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// handleLeadSubmission — main pipeline entry point
// ---------------------------------------------------------------------------

export async function handleLeadSubmission(
  request: Request,
  source: "main" | "lp"
): Promise<NextResponse> {
  // Step 1: Rate limiting
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

  // Step 2: Parse JSON body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungültige Anfrage." },
      { status: 400 }
    );
  }

  // Step 3: CSRF verification
  const csrfToken = request.headers.get("x-csrf-token");
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME)?.value ?? null;

  if (!verifyCsrfToken(csrfToken, csrfCookie)) {
    return NextResponse.json(
      { error: "Ungültige Anfrage." },
      { status: 403 }
    );
  }

  // Extract transaction_id from raw body before validation (for server-side GA4 failsafe).
  // validateLeadPayload does not pass transaction_id through to validated data,
  // so we extract it here from the raw parsed body.
  const bodyObj = body as Record<string, unknown>;
  const transactionId = typeof bodyObj.transaction_id === "string" ? bodyObj.transaction_id : null;

  // Step 4: Validate payload
  const validation = validateLeadPayload(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }
  const data = validation.data;

  // Step 5: Resolve tracking cookie values
  // Body values (already validated by validateLeadPayload) take precedence.
  // Fall back to server-set tracking cookies from middleware.
  const gclid =
    data.gclid ??
    validateCookieValue(cookieStore.get("_no_gclid")?.value ?? null);
  const gbraid =
    data.gbraid ??
    validateCookieValue(cookieStore.get("_no_gbraid")?.value ?? null);
  const wbraid =
    data.wbraid ??
    validateCookieValue(cookieStore.get("_no_wbraid")?.value ?? null);
  const landing_page =
    data.landing_page ??
    (cookieStore.get("_no_lp")?.value || null);
  const referrer =
    data.referrer ??
    (cookieStore.get("_no_ref")?.value || null);

  // Step 5b: Resolve visitor_id cookie to UUID primary key in visitors table.
  // The _no_vid cookie holds the TEXT visitor_id value. We need the UUID `id`
  // column from the visitors table row to use as FK in leads.
  // Non-fatal: if resolution fails, lead is inserted without visitor FK.
  const visitorIdText = cookieStore.get("_no_vid")?.value ?? null;
  const visitorUuid = await resolveVisitorUuid(visitorIdText);

  // Step 5c: Merge UTM values from cookies as authoritative source.
  // Cookies (set by middleware on landing) are preferred over body values
  // because the client may not always send UTMs in the body (e.g., return visits).
  const utm_source =
    cookieStore.get("_no_utm_source")?.value || data.utm_source || null;
  const utm_medium =
    cookieStore.get("_no_utm_medium")?.value || data.utm_medium || null;
  const utm_campaign =
    cookieStore.get("_no_utm_campaign")?.value || data.utm_campaign || null;
  const utm_term =
    cookieStore.get("_no_utm_term")?.value || data.utm_term || null;
  const utm_content =
    cookieStore.get("_no_utm_content")?.value || data.utm_content || null;

  // Merge resolved cookie values back into data
  const resolvedData = {
    ...data,
    gclid,
    gbraid,
    wbraid,
    landing_page,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
  };

  // Step 5d: Compute SHA-256 email hash for Enhanced Conversions (EC-03).
  // Google Ads uses this for cross-device attribution and offline conversion matching.
  const emailHash = hashEmail(data.email);

  // Step 6: Duplicate detection (only when both phone and city are present)
  if (resolvedData.phone && resolvedData.city) {
    const isDuplicate = await checkDuplicate(
      resolvedData.phone,
      resolvedData.city
    );
    if (isDuplicate) {
      // Idempotent response — not an error, just silently deduplicate
      return NextResponse.json({ success: true, deduplicated: true });
    }
  }

  // Step 7: Insert lead into Supabase
  const insertResult = await insertLead(resolvedData, visitorUuid, emailHash);
  if (!insertResult.success) {
    return NextResponse.json(
      { error: "Fehler beim Speichern." },
      { status: 500 }
    );
  }

  // Step 7b: Fire server-side GA4 event as failsafe (SSP-02).
  // This ensures the conversion reaches GA4 even if all client-side JS failed
  // (not just gtag blocked, but the whole page JS crashed).
  // Uses transaction_id as event_id for deduplication with client-side events.
  // Fire-and-forget — must not delay the API response.
  if (transactionId) {
    sendGA4Event({
      event_name: "lp_form_submit",
      params: {
        event_category: "conversion",
        event_label: "server_failsafe",
        event_id: transactionId,
        transaction_id: transactionId,
        source,
      },
    }).catch((err) => {
      console.error("[leads] server-side GA4 event failed:", err);
    });
  }

  // Step 8: Send notification email (fire-and-forget — does not block response)
  sendLeadNotification(resolvedData, source);

  // Step 9: Success
  return NextResponse.json({ success: true });
}

// ---------------------------------------------------------------------------
// handleCsrfToken — GET handler for /api/csrf
// Generates a CSRF token pair, sets the HttpOnly cookie, returns the token.
// ---------------------------------------------------------------------------

export async function handleCsrfToken(
  _: Request
): Promise<NextResponse> {
  const { token, cookieValue } = generateCsrfToken();

  const response = NextResponse.json({ csrfToken: token });

  response.cookies.set(CSRF_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  return response;
}
