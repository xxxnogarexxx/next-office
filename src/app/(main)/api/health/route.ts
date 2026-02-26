import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring and deployment verification.
 * Returns environment readiness as boolean presence checks — never
 * exposes actual env var values.
 *
 * Always returns HTTP 200 so load balancers / uptime monitors do not
 * fail on partially-configured environments:
 * - status "ok"       → all required env vars are set
 * - status "degraded" → one or more required env vars are missing
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const environment = {
    supabase: !!(supabaseUrl && supabaseUrl.trim() !== "") && !!(serviceRoleKey && serviceRoleKey.trim() !== ""),
    resend: !!(resendKey && resendKey.trim() !== ""),
    mapbox: !!(mapboxToken && mapboxToken.trim() !== ""),
    notification_email: !!(notificationEmail && notificationEmail.trim() !== ""),
  };

  const allReady = Object.values(environment).every(Boolean);

  return NextResponse.json(
    {
      status: allReady ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      environment,
    },
    { status: 200 }
  );
}
