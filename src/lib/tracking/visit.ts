/**
 * Visitor upsert — writes anonymous visitor data to Supabase.
 *
 * Uses the service role client because the visitors table has RLS enabled
 * with no anon write policy (Phase 7, DB-05). The service role bypasses RLS.
 *
 * upsertVisitor() is called from /api/track/visit on every page view.
 * It uses a two-step INSERT then UPDATE to handle both first visits (insert)
 * and return visits (update last_seen_at only).
 *
 * First-touch attribution: UTMs, gclid, and landing_page from the original
 * visit are preserved on conflict — only last_seen_at is updated.
 */

import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

// ---------------------------------------------------------------------------
// Service role client factory
// SUPABASE_SERVICE_ROLE_KEY is server-only — never NEXT_PUBLIC_.
// ---------------------------------------------------------------------------

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// hashIp — SHA-256 hex hash of client IP (privacy-safe, not reversible)
// ---------------------------------------------------------------------------

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

// ---------------------------------------------------------------------------
// VisitorData — all fields needed to upsert a visitors row
// ---------------------------------------------------------------------------

export interface VisitorData {
  visitorId: string;        // from _no_vid cookie
  gclid: string | null;     // from _no_gclid cookie
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  ipAddress: string | null; // raw IP from x-forwarded-for (hashed before storing)
  userAgent: string | null;
  landingPage: string | null; // from _no_lp cookie
  referrer: string | null;    // from _no_ref cookie
}

// ---------------------------------------------------------------------------
// upsertVisitor — insert or update visitors row
//
// Two-step strategy for first-touch attribution:
//   Step 1: INSERT (silently ignore conflict on visitor_id — existing row stays)
//   Step 2: Always UPDATE last_seen_at (works for both new and existing visitors)
//
// This preserves original UTMs and gclid from the first visit (first-touch
// attribution model) while still tracking return visit timing.
// ---------------------------------------------------------------------------

export async function upsertVisitor(
  data: VisitorData
): Promise<{ success: true } | { success: false; error: string }> {
  const client = createServiceClient();

  const ipHash = data.ipAddress ? hashIp(data.ipAddress) : null;

  // Step 1: Insert new visitor row. Silently ignore conflict on visitor_id —
  // if the visitor already exists, the existing row (with original UTMs) is preserved.
  await client
    .from("visitors")
    .insert({
      visitor_id: data.visitorId,
      gclid: data.gclid,
      utm_source: data.utmSource,
      utm_medium: data.utmMedium,
      utm_campaign: data.utmCampaign,
      utm_term: data.utmTerm,
      utm_content: data.utmContent,
      ip_hash: ipHash,
      user_agent: data.userAgent,
      landing_page: data.landingPage,
      referrer: data.referrer,
      // first_seen_at and last_seen_at use DB DEFAULT now()
    })
    .throwOnError()
    .catch(() => {
      // Conflict on visitor_id — visitor already exists. Continue to step 2.
    });

  // Step 2: Always update last_seen_at (works for both new and returning visitors).
  const { error } = await client
    .from("visitors")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("visitor_id", data.visitorId);

  if (error) {
    console.error("[tracking/visit] upsertVisitor error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
