/**
 * Lead payload validation.
 *
 * Validates all fields in an incoming lead request body:
 * - Email format (RFC 5322 simplified)
 * - Cookie values (format and size limits for gclid/gbraid/wbraid)
 * - Full payload type safety and field-level size limits
 *
 * Zero external dependencies — plain TypeScript only (same pattern as env.ts).
 * All validation is synchronous and pure (no I/O).
 */

// ---------------------------------------------------------------------------
// Email validation — RFC 5322 simplified
// Accepts: user@example.com, user.name+tag@sub.example.co.uk
// Rejects: "hello", "@.@", "a@b", "a@.b", "@foo.bar", "a@b."
// ---------------------------------------------------------------------------

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

// ---------------------------------------------------------------------------
// Cookie value validation — gclid/gbraid/wbraid are base64-ish strings.
// Accepts alphanumeric, hyphens, underscores, dots. Max 150 chars.
// Rejects HTML-injection characters and non-printable characters.
// ---------------------------------------------------------------------------

const COOKIE_SAFE_REGEX = /^[a-zA-Z0-9\-_.]+$/;
const COOKIE_MAX_LENGTH = 150;

export function validateCookieValue(
  value: string | null | undefined
): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return null;
  if (value.length > COOKIE_MAX_LENGTH) return null;

  // Reject HTML-injection and non-printable characters explicitly
  if (/<|>|"|'/.test(value)) return null;
  if (/[\x00-\x1f\x7f]/.test(value)) return null;

  // Must match safe cookie value pattern
  if (!COOKIE_SAFE_REGEX.test(value)) return null;

  return value;
}

// ---------------------------------------------------------------------------
// ValidatedLeadData — all fields typed, no any
// ---------------------------------------------------------------------------

export interface ValidatedLeadData {
  name: string;
  email: string;
  phone: string | null;
  team_size: number | null;
  start_date: string | null;
  city: string | null;
  message: string | null;
  listing_id: string | null;
  listing_name: string | null;
  company: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  landing_page: string | null;
  referrer: string | null;
}

// ---------------------------------------------------------------------------
// Field size constants
// ---------------------------------------------------------------------------

const MAX_BODY_BYTES = 10_240; // 10 KB

// ---------------------------------------------------------------------------
// validateLeadPayload — full type guard for request body
// ---------------------------------------------------------------------------

export function validateLeadPayload(
  body: unknown
): { valid: true; data: ValidatedLeadData } | { valid: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, error: "Ungültige Anfrage." };
  }

  // Body size check — rough estimate using JSON serialization
  const bodyJson = JSON.stringify(body);
  if (bodyJson.length > MAX_BODY_BYTES) {
    return { valid: false, error: "Anfrage zu groß." };
  }

  const b = body as Record<string, unknown>;

  // --- name: required, 1–200 chars ---
  if (!b.name || typeof b.name !== "string" || b.name.trim().length === 0) {
    return { valid: false, error: "Name ist erforderlich." };
  }
  if (b.name.trim().length > 200) {
    return { valid: false, error: "Name zu lang." };
  }
  const name = b.name.trim();

  // --- email: required, RFC-compliant ---
  if (!b.email || typeof b.email !== "string") {
    return { valid: false, error: "E-Mail ist erforderlich." };
  }
  if (!validateEmail(b.email)) {
    return { valid: false, error: "Ungültige E-Mail-Adresse." };
  }
  const email = b.email.trim();

  // --- phone: optional, max 50 chars ---
  let phone: string | null = null;
  if (b.phone !== undefined && b.phone !== null && b.phone !== "") {
    if (typeof b.phone !== "string") {
      return { valid: false, error: "Ungültige Telefonnummer." };
    }
    if (b.phone.trim().length > 50) {
      return { valid: false, error: "Telefonnummer zu lang." };
    }
    phone = b.phone.trim();
  }

  // --- team_size: optional, positive integer 1–10000 ---
  let team_size: number | null = null;
  if (b.team_size !== undefined && b.team_size !== null && b.team_size !== "") {
    const ts =
      typeof b.team_size === "string"
        ? parseInt(b.team_size, 10)
        : Number(b.team_size);
    if (!Number.isInteger(ts) || ts < 1 || ts > 10_000) {
      return { valid: false, error: "Ungültige Teamgröße." };
    }
    team_size = ts;
  }

  // --- start_date: optional, ISO date if present ---
  let start_date: string | null = null;
  if (
    b.start_date !== undefined &&
    b.start_date !== null &&
    b.start_date !== ""
  ) {
    if (typeof b.start_date !== "string") {
      return { valid: false, error: "Ungültiges Datum." };
    }
    // ISO date: YYYY-MM-DD or full ISO datetime
    if (!/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(b.start_date)) {
      return { valid: false, error: "Ungültiges Datumsformat." };
    }
    start_date = b.start_date;
  }

  // --- city: optional, max 100 chars ---
  let city: string | null = null;
  if (b.city !== undefined && b.city !== null && b.city !== "") {
    if (typeof b.city !== "string" || b.city.trim().length > 100) {
      return { valid: false, error: "Stadt ungültig oder zu lang." };
    }
    city = b.city.trim();
  }

  // --- message: optional, max 5000 chars ---
  let message: string | null = null;
  if (b.message !== undefined && b.message !== null && b.message !== "") {
    if (typeof b.message !== "string" || b.message.length > 5_000) {
      return { valid: false, error: "Nachricht zu lang." };
    }
    message = b.message;
  }

  // --- listing_id: optional, max 100 chars ---
  let listing_id: string | null = null;
  if (
    b.listing_id !== undefined &&
    b.listing_id !== null &&
    b.listing_id !== ""
  ) {
    if (typeof b.listing_id !== "string" || b.listing_id.length > 100) {
      return { valid: false, error: "Listing-ID ungültig." };
    }
    listing_id = b.listing_id;
  }

  // --- listing_name: optional, max 200 chars ---
  let listing_name: string | null = null;
  if (
    b.listing_name !== undefined &&
    b.listing_name !== null &&
    b.listing_name !== ""
  ) {
    if (typeof b.listing_name !== "string" || b.listing_name.length > 200) {
      return { valid: false, error: "Listing-Name zu lang." };
    }
    listing_name = b.listing_name;
  }

  // --- company: optional, max 200 chars ---
  let company: string | null = null;
  if (b.company !== undefined && b.company !== null && b.company !== "") {
    if (typeof b.company !== "string" || b.company.trim().length > 200) {
      return { valid: false, error: "Firmenname zu lang." };
    }
    company = b.company.trim();
  }

  // --- UTM fields: optional, max 200 chars each ---
  const utmFields = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ] as const;
  const utmValues: Record<string, string | null> = {};
  for (const field of utmFields) {
    const val = b[field];
    if (val !== undefined && val !== null && val !== "") {
      if (typeof val !== "string" || val.length > 200) {
        return { valid: false, error: `Ungültiger UTM-Parameter: ${field}` };
      }
      utmValues[field] = val;
    } else {
      utmValues[field] = null;
    }
  }

  // --- Tracking cookie fields: validated via validateCookieValue ---
  const gclid = validateCookieValue(
    typeof b.gclid === "string" ? b.gclid : null
  );
  const gbraid = validateCookieValue(
    typeof b.gbraid === "string" ? b.gbraid : null
  );
  const wbraid = validateCookieValue(
    typeof b.wbraid === "string" ? b.wbraid : null
  );

  // --- landing_page: optional, max 2000 chars ---
  let landing_page: string | null = null;
  if (
    b.landing_page !== undefined &&
    b.landing_page !== null &&
    b.landing_page !== ""
  ) {
    if (typeof b.landing_page !== "string" || b.landing_page.length > 2_000) {
      return { valid: false, error: "Landing-Page-URL zu lang." };
    }
    landing_page = b.landing_page;
  }

  // --- referrer: optional, max 2000 chars ---
  let referrer: string | null = null;
  if (b.referrer !== undefined && b.referrer !== null && b.referrer !== "") {
    if (typeof b.referrer !== "string" || b.referrer.length > 2_000) {
      return { valid: false, error: "Referrer-URL zu lang." };
    }
    referrer = b.referrer;
  }

  return {
    valid: true,
    data: {
      name,
      email,
      phone,
      team_size,
      start_date,
      city,
      message,
      listing_id,
      listing_name,
      company,
      utm_source: utmValues.utm_source,
      utm_medium: utmValues.utm_medium,
      utm_campaign: utmValues.utm_campaign,
      utm_term: utmValues.utm_term,
      utm_content: utmValues.utm_content,
      gclid,
      gbraid,
      wbraid,
      landing_page,
      referrer,
    },
  };
}
