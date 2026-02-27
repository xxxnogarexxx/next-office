/**
 * Server-side GA4 event proxy.
 *
 * Receives event data from the client and forwards it to Google Analytics
 * via the GA4 Measurement Protocol. Because the outbound request originates
 * on the server, ad blockers cannot intercept it — unlike direct browser-side
 * gtag.js calls which are silently dropped when tracking scripts are blocked.
 *
 * POST /api/track/event
 * Body: { event_name: string; params?: Record<string, string | number>; client_id?: string }
 *
 * Security note: No CSRF token required — this is a fire-and-forget analytics
 * endpoint, not a data mutation. GA4_MP_API_SECRET stays server-side only.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendGA4Event, extractGA4ClientId } from "@/lib/tracking/ga4-mp";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TrackEventBody {
  event_name: unknown;
  params?: unknown;
  client_id?: unknown;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
  // Step 1: Parse JSON body
  let body: TrackEventBody;
  try {
    body = (await request.json()) as TrackEventBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Step 2: Validate event_name — required, non-empty string
  if (
    typeof body.event_name !== "string" ||
    body.event_name.trim().length === 0
  ) {
    return NextResponse.json(
      { success: false, error: "event_name is required and must be a non-empty string" },
      { status: 400 }
    );
  }

  // Step 3: Validate event_name length (GA4 limit: 40 characters)
  if (body.event_name.length > 40) {
    return NextResponse.json(
      { success: false, error: "event_name must be 40 characters or fewer" },
      { status: 400 }
    );
  }

  const event_name = body.event_name;

  // Step 4: Validate params if present
  let params: Record<string, string | number> | undefined;
  if (body.params !== undefined) {
    if (
      typeof body.params !== "object" ||
      body.params === null ||
      Array.isArray(body.params)
    ) {
      return NextResponse.json(
        { success: false, error: "params must be a plain object" },
        { status: 400 }
      );
    }

    const rawParams = body.params as Record<string, unknown>;
    const validatedParams: Record<string, string | number> = {};

    for (const [key, value] of Object.entries(rawParams)) {
      if (typeof key !== "string") {
        return NextResponse.json(
          { success: false, error: "params keys must be strings" },
          { status: 400 }
        );
      }
      if (typeof value !== "string" && typeof value !== "number") {
        return NextResponse.json(
          {
            success: false,
            error: `params value for key "${key}" must be a string or number`,
          },
          { status: 400 }
        );
      }
      validatedParams[key] = value;
    }

    params = validatedParams;
  }

  // Step 5: Resolve client_id
  // Priority: body.client_id → _ga cookie → crypto.randomUUID() (handled in sendGA4Event)
  let client_id: string | undefined;

  if (typeof body.client_id === "string" && body.client_id.trim().length > 0) {
    client_id = body.client_id;
  } else {
    // Try to extract from _ga cookie
    const cookieStore = await cookies();
    const gaCookieValue = cookieStore.get("_ga")?.value ?? null;
    const extracted = extractGA4ClientId(gaCookieValue);
    if (extracted) {
      client_id = extracted;
    }
    // If still undefined, sendGA4Event will fall back to crypto.randomUUID()
  }

  // Step 6: Forward event to GA4 Measurement Protocol
  const result = await sendGA4Event({ event_name, params, client_id });

  // Step 7: Return response
  if (result.skipped) {
    // GA4 config missing — graceful degradation (not an error)
    return NextResponse.json({ success: true, skipped: true });
  }

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error ?? "Failed to send event to GA4" },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
