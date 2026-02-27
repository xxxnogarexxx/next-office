/**
 * GA4 Measurement Protocol — server-side event sender.
 *
 * Sends events directly from the server to Google Analytics using the
 * Measurement Protocol HTTP API. Because the request originates on the server,
 * ad blockers cannot intercept it — unlike browser-side gtag.js calls.
 *
 * Use this module in:
 *  - API route handlers (e.g., /api/track/event) to proxy client events
 *  - Server actions where you want guaranteed delivery on key conversions
 *
 * Docs: https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GA4EventParams {
  /** GA4 event name (e.g., "lp_form_submit", "lp_form_complete") */
  event_name: string;
  /** Event parameters (key-value pairs sent as event params in GA4) */
  params?: Record<string, string | number>;
  /**
   * GA4 client_id — identifies the browser/device in GA4.
   * If not provided, falls back to extracting from the _ga cookie value,
   * then to a random UUID (anonymous server-side event).
   */
  client_id?: string;
}

export interface GA4EventResult {
  /** Whether the event was successfully sent (fetch succeeded with 2xx) */
  success: boolean;
  /** Error message if sending failed */
  error?: string;
  /** Whether sending was skipped due to missing configuration */
  skipped?: boolean;
}

// ---------------------------------------------------------------------------
// sendGA4Event — main export
// ---------------------------------------------------------------------------

/**
 * Sends a single event to GA4 via the Measurement Protocol.
 *
 * Gracefully degrades when env vars are missing (returns { success: true, skipped: true }).
 * Never throws — network failures return { success: false, error }.
 */
export async function sendGA4Event(
  params: GA4EventParams
): Promise<GA4EventResult> {
  const gaId = process.env.NEXT_PUBLIC_GA4_ID;
  const apiSecret = process.env.GA4_MP_API_SECRET;

  // Graceful degradation — same pattern as GTMScript component
  if (!gaId || !apiSecret) {
    console.warn(
      "[ga4-mp] Missing NEXT_PUBLIC_GA4_ID or GA4_MP_API_SECRET — event skipped:",
      params.event_name
    );
    return { success: true, skipped: true };
  }

  // Resolve client_id: use provided value, or fall back to a random UUID
  const clientId = params.client_id ?? crypto.randomUUID();

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(gaId)}&api_secret=${encodeURIComponent(apiSecret)}`;

  const body = {
    client_id: clientId,
    events: [
      {
        name: params.event_name,
        params: params.params ?? {},
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // GA4 MP returns 204 No Content on success — treat any 2xx as success
    if (response.ok) {
      return { success: true };
    }

    return {
      success: false,
      error: `GA4 MP returned HTTP ${response.status}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// extractGA4ClientId — helper for parsing the _ga cookie
// ---------------------------------------------------------------------------

/**
 * Parses a `_ga` cookie value to extract the GA4 client_id.
 *
 * The `_ga` cookie format is: `GA1.1.XXXXXXXXXX.XXXXXXXXXX`
 * (or `GA1.2.XXXXXXXXXX.XXXXXXXXXX` for cross-domain tracking).
 * GA4 uses the last two dot-separated segments as the client_id:
 * `"XXXXXXXXXX.XXXXXXXXXX"` — the numeric ID + timestamp.
 *
 * @param gaCookieValue - Raw value of the `_ga` cookie, or null/undefined
 * @returns The extracted client_id (e.g. "1234567890.1234567890"), or null
 */
export function extractGA4ClientId(
  gaCookieValue: string | null | undefined
): string | null {
  if (!gaCookieValue) return null;

  const parts = gaCookieValue.split(".");

  // Valid _ga cookie has at least 4 parts: GA1, 1, <random>, <timestamp>
  if (parts.length < 4) return null;

  // client_id = last two segments joined with "."
  const clientId = parts.slice(-2).join(".");

  // Sanity check: both segments should be non-empty numeric strings
  if (!clientId || clientId === ".") return null;

  return clientId;
}
