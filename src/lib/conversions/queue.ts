/**
 * Conversion queue operations for offline conversion pipeline.
 *
 * Creates queue entries that the Supabase Edge Function processor (Phase 10 Plan 03)
 * picks up every 15 minutes and uploads to Google Ads API.
 */

import { createClient } from "@supabase/supabase-js";

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Create a queue entry for a conversion to be uploaded to a given platform.
 *
 * Only creates an entry if the conversion has attribution data (gclid or email_hash).
 * Returns { created: true } if queued, { created: false, reason } if skipped.
 */
export async function createQueueEntry(
  conversionId: string,
  gclid: string | null,
  emailHash: string | null,
  platform: string = "google_ads"
): Promise<{ created: true } | { created: false; reason: string }> {
  // OFL-04: Only queue if we have attribution data
  if (!gclid && !emailHash) {
    return { created: false, reason: "no_attribution_data" };
  }

  const supabase = createServiceClient();

  const { error } = await supabase.from("conversion_queue").insert({
    conversion_id: conversionId,
    platform,
    status: "pending",
    retry_count: 0,
    max_retries: 5,
    next_retry_at: null, // null = immediate pickup on next cron run
  });

  if (error) {
    console.error("[queue] Failed to create queue entry:", error.message);
    return { created: false, reason: error.message };
  }

  return { created: true };
}
