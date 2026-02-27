/**
 * CRM Conversion Webhook Endpoint
 *
 * POST /api/webhooks/crm-conversion
 *
 * Receives conversion notifications from NetHunt CRM when a deal
 * reaches qualified or closed status. Validates HMAC signature,
 * matches to lead, creates conversion, and queues for Google Ads upload.
 *
 * Authentication: HMAC-SHA256 signature in X-Webhook-Signature header
 * signed with CRM_WEBHOOK_SECRET.
 *
 * Always returns 200 on valid signature (even if lead not found or
 * duplicate) to prevent CRM webhook retries. Returns 401 only on
 * signature failure.
 */

import { handleCrmWebhook } from "@/lib/conversions/webhook";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");

  const result = await handleCrmWebhook(rawBody, signature);

  return Response.json(result.body, { status: result.status });
}
