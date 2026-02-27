/**
 * Conversion Queue Processor — Supabase Edge Function
 *
 * Runs every 15 minutes via pg_cron. Picks up pending and retry-ready
 * queue items, uploads them to Google Ads API, and manages retry lifecycle
 * with exponential backoff.
 *
 * Lifecycle: pending → uploaded (success) or failed (retry) → dead_letter (after 5 failures)
 *
 * Backoff schedule (OFL-07):
 *   Attempt 1: 15 minutes
 *   Attempt 2: 1 hour
 *   Attempt 3: 4 hours
 *   Attempt 4: 16 hours
 *   Attempt 5+: dead_letter (stop retrying)
 *
 * Triggered by: pg_cron → pg_net HTTP POST to this function's URL
 * Deploy: supabase functions deploy process-conversion-queue
 * Schedule: SELECT cron.schedule('process-conversions', '*/15 * * * *',
 *   $$
 *   SELECT net.http_post(
 *     url := 'https://<project-ref>.supabase.co/functions/v1/process-conversion-queue',
 *     headers := jsonb_build_object(
 *       'Authorization', 'Bearer ' || current_setting('supabase.service_role_key'),
 *       'Content-Type', 'application/json'
 *     ),
 *     body := '{}'::jsonb
 *   );
 *   $$
 * );
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- Configuration ---

const GOOGLE_ADS_API_VERSION = "v18";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const BATCH_SIZE = 50; // Process up to 50 items per invocation

// Exponential backoff intervals in milliseconds (OFL-07)
const BACKOFF_INTERVALS_MS = [
  15 * 60 * 1000,       // Retry 1: 15 minutes
  60 * 60 * 1000,       // Retry 2: 1 hour
  4 * 60 * 60 * 1000,   // Retry 3: 4 hours
  16 * 60 * 60 * 1000,  // Retry 4: 16 hours
];

// --- Types ---

interface QueueItem {
  id: string;
  conversion_id: string;
  platform: string;
  status: string;
  retry_count: number;
  max_retries: number;
}

interface ConversionRow {
  id: string;
  gclid: string | null;
  email_hash: string | null;
  conversion_type: string;
  conversion_value: number | null;
  conversion_currency: string;
  created_at: string;
}

// --- Supabase Client ---

function getSupabaseClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
  }
  return createClient(url, serviceRoleKey);
}

// --- OAuth2 Token Management ---

let cachedToken: { access_token: string; expires_at: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && cachedToken.expires_at > now + 5 * 60 * 1000) {
    return cachedToken.access_token;
  }

  const clientId = Deno.env.get("GOOGLE_ADS_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_ADS_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_ADS_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google Ads OAuth2 credentials not configured");
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OAuth2 token refresh failed (${response.status}): ${errorBody}`);
  }

  const tokenData = await response.json();
  cachedToken = {
    access_token: tokenData.access_token,
    expires_at: now + tokenData.expires_in * 1000,
  };

  return cachedToken.access_token;
}

// --- Google Ads Upload ---

/**
 * Upload a single conversion to Google Ads API (OFL-06, OFL-08, OFL-09).
 *
 * Duplicates the upload logic from src/lib/conversions/google-ads.ts
 * adapted for Deno runtime (Deno.env instead of process.env).
 */
async function uploadToGoogleAds(
  conversion: ConversionRow
): Promise<{ success: boolean; error?: string }> {
  const customerId = Deno.env.get("GOOGLE_ADS_CUSTOMER_ID");
  const loginCustomerId = Deno.env.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID");
  const developerToken = Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN");

  if (!customerId || !loginCustomerId || !developerToken) {
    return { success: false, error: "Google Ads API credentials not configured" };
  }

  if (!conversion.gclid && !conversion.email_hash) {
    return { success: false, error: "No attribution data" };
  }

  // Determine conversion action from env vars
  const actionEnvKey = conversion.conversion_type === "qualified"
    ? "GOOGLE_ADS_CONVERSION_ACTION_QUALIFIED"
    : "GOOGLE_ADS_CONVERSION_ACTION_CLOSED";
  const actionId = Deno.env.get(actionEnvKey);
  if (!actionId) {
    return { success: false, error: `${actionEnvKey} not configured` };
  }

  const conversionAction = `customers/${customerId}/conversionActions/${actionId}`;

  // Build userIdentifiers (OFL-08)
  const userIdentifiers: Array<Record<string, unknown>> = [];
  if (conversion.email_hash) {
    userIdentifiers.push({ hashedEmail: conversion.email_hash });
  }

  // Build click conversion object
  const clickConversion: Record<string, unknown> = {
    conversionAction,
    conversionDateTime: conversion.created_at,
    // OFL-09: Consent signals for EEA compliance
    consent: {
      adUserData: "GRANTED",
      adPersonalization: "GRANTED",
    },
  };

  if (conversion.gclid) {
    clickConversion.gclid = conversion.gclid;
  }
  if (userIdentifiers.length > 0) {
    clickConversion.userIdentifiers = userIdentifiers;
  }
  if (conversion.conversion_value !== null) {
    clickConversion.conversionValue = conversion.conversion_value;
    clickConversion.currencyCode = conversion.conversion_currency;
  }

  const payload = {
    conversions: [clickConversion],
    partialFailure: true,
  };

  try {
    const accessToken = await getAccessToken();
    const endpoint = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customerId}:uploadClickConversions`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "developer-token": developerToken,
        "login-customer-id": loginCustomerId,
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      const errorMsg = responseBody?.error?.message ?? JSON.stringify(responseBody);
      return { success: false, error: `API error (${response.status}): ${errorMsg}` };
    }

    // Check partial failure
    if (responseBody?.partialFailureError?.message) {
      return { success: false, error: `Partial failure: ${responseBody.partialFailureError.message}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// --- Backoff Calculation ---

/**
 * Calculate next_retry_at timestamp using exponential backoff (OFL-07).
 *
 * Schedule: 15min → 1h → 4h → 16h
 * After max_retries exceeded → return null (transition to dead_letter).
 */
function calculateNextRetryAt(retryCount: number, maxRetries: number): string | null {
  if (retryCount >= maxRetries) {
    return null; // Signal to transition to dead_letter
  }

  const intervalIndex = Math.min(retryCount, BACKOFF_INTERVALS_MS.length - 1);
  const delayMs = BACKOFF_INTERVALS_MS[intervalIndex];
  const nextRetry = new Date(Date.now() + delayMs);

  return nextRetry.toISOString();
}

// --- Queue Processing ---

/**
 * Process a single queue item: upload to Google Ads, update status.
 */
async function processQueueItem(
  supabase: ReturnType<typeof getSupabaseClient>,
  item: QueueItem,
  conversion: ConversionRow
): Promise<void> {
  const result = await uploadToGoogleAds(conversion);

  if (result.success) {
    // Mark as uploaded
    await supabase
      .from("conversion_queue")
      .update({
        status: "uploaded",
        uploaded_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", item.id);

    console.log(`[queue] Uploaded conversion ${item.conversion_id} to ${item.platform}`);
  } else {
    // Increment retry count
    const newRetryCount = item.retry_count + 1;
    const nextRetryAt = calculateNextRetryAt(newRetryCount, item.max_retries);

    if (nextRetryAt === null) {
      // OFL-07: Max retries exceeded → dead_letter
      await supabase
        .from("conversion_queue")
        .update({
          status: "dead_letter",
          retry_count: newRetryCount,
          last_error: result.error ?? "Unknown error",
          next_retry_at: null,
        })
        .eq("id", item.id);

      console.error(
        `[queue] Dead letter: conversion ${item.conversion_id} after ${newRetryCount} attempts. Last error: ${result.error}`
      );
    } else {
      // OFL-07: Schedule retry with backoff
      await supabase
        .from("conversion_queue")
        .update({
          status: "failed",
          retry_count: newRetryCount,
          last_error: result.error ?? "Unknown error",
          next_retry_at: nextRetryAt,
        })
        .eq("id", item.id);

      console.warn(
        `[queue] Retry ${newRetryCount}/${item.max_retries} for conversion ${item.conversion_id}. Next retry: ${nextRetryAt}. Error: ${result.error}`
      );
    }
  }
}

/**
 * Main queue processor (OFL-05).
 *
 * Fetches pending and retry-ready items, processes each sequentially,
 * returns summary of results.
 */
async function processQueue(): Promise<{
  processed: number;
  uploaded: number;
  failed: number;
  dead_letter: number;
}> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  // Fetch queue items: pending (immediate) + failed with next_retry_at <= now
  const { data: items, error: fetchError } = await supabase
    .from("conversion_queue")
    .select("id, conversion_id, platform, status, retry_count, max_retries")
    .or(`status.eq.pending,and(status.eq.failed,next_retry_at.lte.${now})`)
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error("[queue] Failed to fetch queue items:", fetchError.message);
    return { processed: 0, uploaded: 0, failed: 0, dead_letter: 0 };
  }

  if (!items || items.length === 0) {
    console.log("[queue] No items to process");
    return { processed: 0, uploaded: 0, failed: 0, dead_letter: 0 };
  }

  console.log(`[queue] Processing ${items.length} items`);

  let uploaded = 0;
  let failed = 0;
  let deadLetter = 0;

  for (const item of items) {
    // Fetch the conversion data for this queue item
    const { data: conversion, error: convError } = await supabase
      .from("conversions")
      .select("id, gclid, email_hash, conversion_type, conversion_value, conversion_currency, created_at")
      .eq("id", item.conversion_id)
      .single();

    if (convError || !conversion) {
      console.error(`[queue] Conversion ${item.conversion_id} not found, skipping`);
      // Mark as dead_letter — conversion data missing, unrecoverable
      await supabase
        .from("conversion_queue")
        .update({
          status: "dead_letter",
          last_error: "Conversion record not found",
        })
        .eq("id", item.id);
      deadLetter++;
      continue;
    }

    await processQueueItem(supabase, item as QueueItem, conversion as ConversionRow);

    // Check result by re-reading the item status
    const { data: updated } = await supabase
      .from("conversion_queue")
      .select("status")
      .eq("id", item.id)
      .single();

    if (updated?.status === "uploaded") uploaded++;
    else if (updated?.status === "dead_letter") deadLetter++;
    else failed++;
  }

  return { processed: items.length, uploaded, failed, dead_letter: deadLetter };
}

// --- Deno Serve ---

Deno.serve(async (req) => {
  // Only accept POST (from pg_cron via pg_net)
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify the request comes from Supabase (service role auth)
  const authHeader = req.headers.get("authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authHeader || !serviceRoleKey || authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await processQueue();

    console.log(
      `[queue] Complete: ${result.processed} processed, ${result.uploaded} uploaded, ${result.failed} failed, ${result.dead_letter} dead letter`
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[queue] Fatal error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
