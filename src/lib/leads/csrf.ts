/**
 * CSRF protection using the double-submit cookie pattern (stateless).
 *
 * How it works:
 *   1. Server generates a random token + an HMAC-SHA256 signature of that token.
 *   2. Token is returned to the client (in response body or header).
 *   3. HMAC is set as an HttpOnly cookie (_no_csrf) on the browser.
 *   4. On form submission, the client sends the token in the x-csrf-token header.
 *   5. Server recomputes HMAC of the incoming token and compares to the cookie value
 *      using timing-safe comparison — valid only if they match.
 *
 * Secret note:
 *   Ideally we would have a dedicated CSRF_SECRET env var. To avoid adding a new
 *   required env var, we derive the secret from SUPABASE_SERVICE_ROLE_KEY, which
 *   is already server-only and never exposed to the client. If you add a dedicated
 *   CSRF_SECRET env var in the future, update the getSecret() function below.
 */

import crypto from "crypto";

// Cookie name used by both the server (set) and service (read).
export const CSRF_COOKIE_NAME = "_no_csrf";

// Derive the HMAC secret from an existing server-only env var.
// IMPORTANT: SUPABASE_SERVICE_ROLE_KEY must never reach the client bundle.
function getSecret(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error(
      "CSRF secret unavailable: SUPABASE_SERVICE_ROLE_KEY is not set."
    );
  }
  return secret;
}

/**
 * Generate a CSRF token pair.
 *
 * @returns token — embed in form or return as response header to the client.
 *          cookieValue — set as an HttpOnly cookie on the response.
 */
export function generateCsrfToken(): { token: string; cookieValue: string } {
  const token = crypto.randomBytes(32).toString("hex");
  const cookieValue = computeHmac(token);
  return { token, cookieValue };
}

/**
 * Verify that the token sent by the client matches the cookie value.
 *
 * @param token - value from the x-csrf-token request header
 * @param cookieValue - value from the _no_csrf cookie
 * @returns true if both are present and the HMAC matches
 */
export function verifyCsrfToken(
  token: string | null,
  cookieValue: string | null
): boolean {
  if (!token || !cookieValue) return false;

  const expected = computeHmac(token);

  // Use timing-safe comparison to prevent timing attacks
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(cookieValue, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function computeHmac(token: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(token)
    .digest("hex");
}
