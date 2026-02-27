/**
 * CRM webhook handler for offline conversion pipeline.
 *
 * Receives webhook from NetHunt CRM when a deal status changes to
 * qualified or closed. Validates bearer token, matches lead by email,
 * creates idempotent conversion record, and queues for Google Ads upload.
 *
 * Flow: NetHunt webhook -> validate bearer token -> match lead by email -> insert conversion
 *       -> queue for upload -> return result
 */

import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { createQueueEntry } from "./queue";

// --- Types ---

interface WebhookPayload {
  crm_deal_id: string;
  email: string;
  conversion_type: "qualified" | "closed";
  conversion_value?: number;
  conversion_currency?: string;
}

interface WebhookResult {
  success: boolean;
  reason?: string;
  conversion_id?: string;
  queued?: boolean;
}

// --- Helpers ---

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Verify bearer token from Authorization header (OFL-01).
 *
 * Expects: Authorization: Bearer <CRM_WEBHOOK_SECRET>
 */
export function verifyBearerToken(
  authHeader: string | null,
  secret: string
): boolean {
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, "");
  return token === secret;
}

/**
 * Parse and validate webhook payload.
 *
 * Validates required fields and conversion_type enum.
 * Returns parsed payload or null if invalid.
 */
function parsePayload(body: unknown): WebhookPayload | null {
  if (!body || typeof body !== "object") return null;

  const b = body as Record<string, unknown>;

  if (typeof b.crm_deal_id !== "string" || !b.crm_deal_id) return null;
  if (typeof b.email !== "string" || !b.email) return null;
  if (b.conversion_type !== "qualified" && b.conversion_type !== "closed") return null;

  return {
    crm_deal_id: b.crm_deal_id,
    email: b.email.trim().toLowerCase(),
    conversion_type: b.conversion_type,
    conversion_value: typeof b.conversion_value === "number" ? b.conversion_value : undefined,
    conversion_currency: typeof b.conversion_currency === "string" ? b.conversion_currency : undefined,
  };
}

/**
 * Match incoming deal email to a Supabase lead (OFL-02).
 *
 * Looks up the lead by email_hash (SHA-256 of normalized email).
 * If found, retrieves the lead's gclid via the visitor FK join,
 * plus email_hash and UTM columns directly from the lead row.
 *
 * Returns the most recent lead matching the email hash (ORDER BY created_at DESC).
 */
async function matchLeadByEmail(email: string) {
  const supabase = createServiceClient();

  // Hash the email to match against leads.email_hash (set by Phase 9 EC-03)
  const emailHash = createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");

  // Query lead with visitor join to get gclid
  const { data, error } = await supabase
    .from("leads")
    .select(`
      id,
      email_hash,
      utm_source,
      utm_medium,
      utm_campaign,
      visitor_id,
      visitors!leads_visitor_id_fkey (
        gclid
      )
    `)
    .eq("email_hash", emailHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  // Extract gclid from joined visitor row (Supabase returns object for FK join)
  const visitor = data.visitors as unknown as { gclid: string | null } | null;
  const gclid = visitor?.gclid ?? null;

  return {
    lead_id: data.id as string,
    gclid,
    email_hash: data.email_hash as string | null,
    utm_source: data.utm_source as string | null,
    utm_medium: data.utm_medium as string | null,
    utm_campaign: data.utm_campaign as string | null,
  };
}

/**
 * Create conversion record with idempotency key (OFL-03).
 *
 * Uses INSERT ... ON CONFLICT (idempotency_key) DO NOTHING to prevent duplicates.
 * Returns the conversion id (existing or new).
 */
async function createConversion(
  payload: WebhookPayload,
  lead: NonNullable<Awaited<ReturnType<typeof matchLeadByEmail>>>
): Promise<{ id: string; is_duplicate: boolean } | null> {
  const supabase = createServiceClient();
  const idempotencyKey = `${payload.crm_deal_id}:${payload.conversion_type}`;

  // Try to insert -- ON CONFLICT does nothing if key exists
  const { data: inserted, error: insertError } = await supabase
    .from("conversions")
    .insert({
      lead_id: lead.lead_id,
      conversion_type: payload.conversion_type,
      conversion_value: payload.conversion_value ?? null,
      conversion_currency: payload.conversion_currency ?? "EUR",
      idempotency_key: idempotencyKey,
      crm_deal_id: payload.crm_deal_id,
      // Denormalized attribution (avoids JOINs in queue processor)
      gclid: lead.gclid,
      email_hash: lead.email_hash,
      utm_source: lead.utm_source,
      utm_medium: lead.utm_medium,
      utm_campaign: lead.utm_campaign,
    })
    .select("id")
    .single();

  // If insert succeeded, return new conversion
  if (!insertError && inserted) {
    return { id: inserted.id, is_duplicate: false };
  }

  // If unique constraint violation (23505), look up existing
  if (insertError?.code === "23505") {
    const { data: existing } = await supabase
      .from("conversions")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .single();

    if (existing) {
      return { id: existing.id, is_duplicate: true };
    }
  }

  console.error("[webhook] Failed to create conversion:", insertError?.message);
  return null;
}

/**
 * Update the lead's conversion_status to match the incoming conversion type (OFL-02).
 *
 * Maps: qualified -> 'qualified', closed -> 'closed'
 */
async function updateLeadStatus(leadId: string, conversionType: "qualified" | "closed") {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("leads")
    .update({ conversion_status: conversionType })
    .eq("id", leadId);

  if (error) {
    console.error("[webhook] Failed to update lead status:", error.message);
  }
}

/**
 * Main webhook handler (OFL-01, OFL-02, OFL-03, OFL-04).
 *
 * Orchestrates the full flow: validate -> parse -> match -> insert -> queue.
 * Always returns 200 to prevent webhook retries on business logic failures.
 */
export async function handleCrmWebhook(
  rawBody: string,
  authHeader: string | null
): Promise<{ status: number; body: WebhookResult }> {
  // Step 1: Validate bearer token (OFL-01)
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] CRM_WEBHOOK_SECRET not configured");
    return { status: 500, body: { success: false, reason: "server_config_error" } };
  }

  if (!verifyBearerToken(authHeader, secret)) {
    return { status: 401, body: { success: false, reason: "invalid_token" } };
  }

  // Step 2: Parse payload
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { status: 200, body: { success: false, reason: "invalid_json" } };
  }

  const payload = parsePayload(parsed);
  if (!payload) {
    return { status: 200, body: { success: false, reason: "invalid_payload" } };
  }

  // Step 3: Match lead by email (OFL-02)
  const lead = await matchLeadByEmail(payload.email);
  if (!lead) {
    return { status: 200, body: { success: false, reason: "lead_not_found" } };
  }

  // Step 4: Create conversion record (OFL-03)
  const conversion = await createConversion(payload, lead);
  if (!conversion) {
    return { status: 200, body: { success: false, reason: "conversion_create_failed" } };
  }

  // Step 5: Update lead conversion_status
  await updateLeadStatus(lead.lead_id, payload.conversion_type);

  // Step 6: Queue for Google Ads upload if not duplicate (OFL-04)
  let queued = false;
  if (!conversion.is_duplicate) {
    const queueResult = await createQueueEntry(
      conversion.id,
      lead.gclid,
      lead.email_hash
    );
    queued = queueResult.created;
  }

  return {
    status: 200,
    body: {
      success: true,
      conversion_id: conversion.id,
      queued,
    },
  };
}
