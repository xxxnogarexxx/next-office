/**
 * POST /api/track/visit
 *
 * Records or updates an anonymous visitor session in Supabase.
 * Called client-side on every page load (fire-and-forget from the browser).
 *
 * Reads all tracking data from HTTP-only cookies set by middleware:
 * - _no_vid (visitor_id) — required; returns 400 if absent
 * - _no_utm_source, _no_utm_medium, _no_utm_campaign, _no_utm_term, _no_utm_content
 * - _no_gclid (Google Ads click ID)
 * - _no_lp (landing page URL)
 * - _no_ref (HTTP referrer)
 *
 * Uses service role Supabase client — the visitors table has RLS with no
 * anon write policy (Phase 7, DB-05). Service role bypasses RLS.
 *
 * Idempotent: calling this endpoint multiple times for the same visitor
 * only updates last_seen_at; original UTMs and gclid are preserved.
 *
 * No CSRF protection needed — this endpoint carries no user-provided data
 * and is idempotent. All data is read from server-set HTTP-only cookies.
 */

import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { upsertVisitor } from "@/lib/tracking/visit";
import { VISITOR_COOKIE_NAME } from "@/lib/tracking/visitor";

export async function POST() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // visitor_id is required — without it we have no tracking subject
  const visitorId = cookieStore.get(VISITOR_COOKIE_NAME)?.value;
  if (!visitorId) {
    return NextResponse.json({ error: "No visitor ID" }, { status: 400 });
  }

  // Read UTM cookies set by middleware (cookie names: _no_utm_source, etc.)
  const utmSource = cookieStore.get("_no_utm_source")?.value ?? null;
  const utmMedium = cookieStore.get("_no_utm_medium")?.value ?? null;
  const utmCampaign = cookieStore.get("_no_utm_campaign")?.value ?? null;
  const utmTerm = cookieStore.get("_no_utm_term")?.value ?? null;
  const utmContent = cookieStore.get("_no_utm_content")?.value ?? null;

  // Read click ID and page context cookies
  const gclid = cookieStore.get("_no_gclid")?.value ?? null;
  const landingPage = cookieStore.get("_no_lp")?.value ?? null;
  const referrer = cookieStore.get("_no_ref")?.value ?? null;

  // Extract client IP and user-agent from headers
  const forwarded = headerStore.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : null;
  const userAgent = headerStore.get("user-agent") ?? null;

  const result = await upsertVisitor({
    visitorId,
    gclid,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    ipAddress,
    userAgent,
    landingPage,
    referrer,
  });

  if (!result.success) {
    // Log but return 200 — tracking failures must not block the user experience
    console.error("[api/track/visit] upsertVisitor failed:", result.error);
    return NextResponse.json({ success: false }, { status: 200 });
  }

  return NextResponse.json({ success: true });
}
