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

  // NetHunt inserts literal newlines (%0A) in URL fields when text wraps.
  // Normalize param keys/values by stripping whitespace and newlines.
  const cleaned = new Map<string, string>();
  for (const [key, value] of url.searchParams.entries()) {
    const cleanKey = key.replace(/\s+/g, "");
    const cleanVal = value.replace(/\s+/g, "");
    if (cleanKey) cleaned.set(cleanKey, cleanVal);
  }

  // Prefer query params (NetHunt macros work in URL), fall back to JSON body
  let rawBody: string;
  if (cleaned.get("email") && cleaned.get("conversion_type")) {
    rawBody = JSON.stringify({
      crm_deal_id: cleaned.get("crm_deal_id") ?? "",
      email: cleaned.get("email"),
      conversion_type: cleaned.get("conversion_type"),
      conversion_value: cleaned.has("conversion_value")
        ? Number(cleaned.get("conversion_value"))
        : undefined,
      conversion_currency: cleaned.get("conversion_currency") ?? undefined,
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
