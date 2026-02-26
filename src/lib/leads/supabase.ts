/**
 * Scoped Supabase client for lead inserts.
 *
 * Uses NEXT_PUBLIC_SUPABASE_ANON_KEY (not the service role key) so that
 * database access is scoped by Row Level Security (RLS) policies.
 *
 * IMPORTANT: RLS must be configured in the Supabase dashboard to allow
 * anon inserts on the leads table. Without an RLS policy that permits
 * anon INSERT, all inserts will be rejected with a 403.
 *
 * The service role key is intentionally not imported here — any code that
 * needs admin-level access must import it explicitly from a separate module.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { ValidatedLeadData } from "./validation";

// ---------------------------------------------------------------------------
// Dedup window
// ---------------------------------------------------------------------------

const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// ---------------------------------------------------------------------------
// Scoped client factory
// Uses anon key — scoped by RLS, not service role.
// ---------------------------------------------------------------------------

export function createScopedClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient(url, anonKey);
}

// ---------------------------------------------------------------------------
// Duplicate detection
// Returns true if a lead with the same phone + city exists within the dedup window.
// ---------------------------------------------------------------------------

export async function checkDuplicate(
  phone: string,
  city: string
): Promise<boolean> {
  const client = createScopedClient();
  const windowStart = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();

  const { data, error } = await client
    .from("leads")
    .select("id")
    .eq("phone", phone)
    .eq("city", city)
    .gte("created_at", windowStart)
    .limit(1);

  if (error) {
    // Log but don't block — duplicate check failure is non-fatal.
    console.error("[leads/supabase] checkDuplicate error:", error);
    return false;
  }

  return Array.isArray(data) && data.length > 0;
}

// ---------------------------------------------------------------------------
// Visitor UUID resolution
// Resolves a visitor_id text value (from cookie) to the UUID primary key
// of the visitors table row.
//
// Returns null if:
// - visitorIdText is null/undefined (no cookie)
// - No visitors row found with that visitor_id (race condition or stale cookie)
// - Supabase query fails (non-fatal — lead is created without visitor FK)
//
// Uses service role client — visitors table has no anon SELECT RLS policy.
// ---------------------------------------------------------------------------

export async function resolveVisitorUuid(
  visitorIdText: string | null
): Promise<string | null> {
  if (!visitorIdText) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  const client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await client
    .from("visitors")
    .select("id")
    .eq("visitor_id", visitorIdText)
    .single();

  if (error || !data?.id) {
    // Non-fatal: log and return null. Lead insert will proceed without visitor FK.
    if (error && error.code !== "PGRST116") {
      // PGRST116 = "no rows found" — not an error, just a new visitor
      console.error("[leads/supabase] resolveVisitorUuid error:", error);
    }
    return null;
  }

  return data.id as string;
}

// ---------------------------------------------------------------------------
// Lead insert
// Maps ValidatedLeadData to the leads table columns.
// Accepts an optional visitorUuid (resolved from _no_vid cookie via visitors table).
// Accepts an optional emailHash (SHA-256 hex of normalized email, for EC-03).
// ---------------------------------------------------------------------------

export async function insertLead(
  data: ValidatedLeadData,
  visitorUuid?: string | null,
  emailHash?: string | null
): Promise<{ success: true } | { success: false; error: string }> {
  const client = createScopedClient(); // anon client is fine for leads INSERT (RLS allows anon insert)

  const { error } = await client.from("leads").insert({
    // existing fields
    name: data.name,
    email: data.email,
    phone: data.phone,
    team_size: data.team_size,
    start_date: data.start_date,
    city: data.city,
    message: data.message,
    listing_id: data.listing_id,
    listing_name: data.listing_name,
    gclid: data.gclid,
    gbraid: data.gbraid,
    wbraid: data.wbraid,
    landing_page: data.landing_page,
    referrer: data.referrer,
    // NEW: visitor attribution (CAP-04)
    visitor_id: visitorUuid ?? null,
    // NEW: UTM columns (CAP-05)
    utm_source: data.utm_source,
    utm_medium: data.utm_medium,
    utm_campaign: data.utm_campaign,
    utm_term: data.utm_term,
    utm_content: data.utm_content,
    // NEW: SHA-256 email hash for Enhanced Conversions (EC-03)
    email_hash: emailHash ?? null,
    // NEW: Shared transaction ID for gtag/offline dedup (EC-04)
    transaction_id: data.transaction_id ?? null,
  });

  if (error) {
    console.error("[leads/supabase] insertLead error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
