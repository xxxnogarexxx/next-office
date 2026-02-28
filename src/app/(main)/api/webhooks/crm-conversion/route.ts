/**
 * CRM Conversion Webhook Endpoint
 *
 * POST /api/webhooks/crm-conversion
 *
 * Receives conversion notifications from NetHunt CRM when a deal
 * reaches a conversion stage (Brokered, Tour, Closed).
 *
 * Supports two payload modes:
 *   1. JSON body: {"crm_deal_id":"...","email":"...","conversion_type":"brokered",...}
 *   2. URL query params: ?email=...&crm_deal_id=...&conversion_type=brokered&...
 *      (NetHunt macros don't work inside JSON fields, so query params are preferred)
 *
 * Authentication: Bearer token in Authorization header (CRM_WEBHOOK_SECRET).
 *
 * Always returns 200 on valid auth (even if lead not found or
 * duplicate) to prevent CRM webhook retries. Returns 401 only on
 * auth failure.
 */

import { handleCrmWebhook } from "@/lib/conversions/webhook";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;

  // Prefer query params (NetHunt macros work in URL), fall back to JSON body
  let rawBody: string;
  if (params.get("email") && params.get("conversion_type")) {
    rawBody = JSON.stringify({
      crm_deal_id: params.get("crm_deal_id") ?? "",
      email: params.get("email"),
      conversion_type: params.get("conversion_type"),
      conversion_value: params.has("conversion_value")
        ? Number(params.get("conversion_value"))
        : undefined,
      conversion_currency: params.get("conversion_currency") ?? undefined,
    });
  } else {
    rawBody = await request.text();
  }

  const authHeader = request.headers.get("authorization");
  const result = await handleCrmWebhook(rawBody, authHeader);

  // Temporary debug: include request details on failure to diagnose NetHunt integration
  if (!result.body.success) {
    return Response.json({
      ...result.body,
      _debug: {
        query: Object.fromEntries(params.entries()),
        body_preview: rawBody.slice(0, 500),
        url: url.pathname + url.search,
      },
    }, { status: result.status });
  }

  return Response.json(result.body, { status: result.status });
}
