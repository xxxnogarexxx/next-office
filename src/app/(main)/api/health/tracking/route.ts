import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * GET /api/health/tracking
 *
 * Reports conversion pipeline health by querying conversion_queue status distribution.
 *
 * Returns:
 * - status: "healthy" (no failed/dead_letter), "degraded" (failed > 0), "critical" (dead_letter > 0)
 * - counts: { pending, uploaded, failed, dead_letter }
 * - timestamp: ISO 8601
 *
 * Always returns HTTP 200 — the JSON status field indicates pipeline health.
 * Uses service role client — conversion_queue has no anon SELECT RLS policy.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return NextResponse.json(
      {
        status: "error",
        message: "Supabase credentials not configured",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Query all queue items and count by status.
  // The conversion_queue table is small (B2B volume) so a full scan is fine.
  // Four separate count queries are cleaner than a GROUP BY that requires
  // post-processing to fill in missing statuses.
  const [pending, uploaded, failed, deadLetter] = await Promise.all([
    supabase
      .from("conversion_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("conversion_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "uploaded"),
    supabase
      .from("conversion_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed"),
    supabase
      .from("conversion_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "dead_letter"),
  ]);

  // Check for query errors -- if any count query fails, report degraded
  const queryError =
    pending.error || uploaded.error || failed.error || deadLetter.error;

  if (queryError) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to query conversion queue",
        error: queryError.message,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  const counts = {
    pending: pending.count ?? 0,
    uploaded: uploaded.count ?? 0,
    failed: failed.count ?? 0,
    dead_letter: deadLetter.count ?? 0,
  };

  // Derive pipeline health status:
  // - critical: any dead_letter items (unrecoverable failures)
  // - degraded: any failed items (retrying, may recover)
  // - healthy: only pending and uploaded (normal operation)
  let pipelineStatus: "healthy" | "degraded" | "critical" = "healthy";
  if (counts.dead_letter > 0) {
    pipelineStatus = "critical";
  } else if (counts.failed > 0) {
    pipelineStatus = "degraded";
  }

  return NextResponse.json(
    {
      status: pipelineStatus,
      counts,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
