/**
 * CRM Conversion Webhook Endpoint
 *
 * POST /api/webhooks/crm-conversion
 *
 * Receives conversion notifications from NetHunt CRM when a deal
 * reaches qualified or closed status. Validates bearer token,
 * matches to lead, creates conversion, and queues for Google Ads upload.
 *
 * Authentication: Bearer token in Authorization header (CRM_WEBHOOK_SECRET).
 *
 * Always returns 200 on valid auth (even if lead not found or
 * duplicate) to prevent CRM webhook retries. Returns 401 only on
 * auth failure.
 */

import { handleCrmWebhook } from "@/lib/conversions/webhook";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const authHeader = request.headers.get("authorization");

  const result = await handleCrmWebhook(rawBody, authHeader);

  return Response.json(result.body, { status: result.status });
}
