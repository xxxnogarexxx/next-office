/**
 * Google Ads API Offline Conversion Upload — REFERENCE IMPLEMENTATION
 *
 * WARNING: THIS MODULE IS NOT IMPORTED BY ANY RUNTIME CODE.
 *
 * The actual upload runs in a Supabase Edge Function (Deno) that duplicates
 * this logic. The two modules must stay in sync. See:
 * - Queue processor: supabase/functions/process-conversion-queue/index.ts
 * - Decision: "Upload logic duplicated from google-ads.ts for Deno Edge Function
 *   — cannot import from Next.js app, two modules must stay in sync"
 *   (Phase 10-03, STATE.md)
 *
 * This file is kept as the canonical reference for:
 * - OAuth2 token refresh flow
 * - uploadClickConversions payload structure (gclid, userIdentifiers, consent)
 * - Conversion action resource name mapping
 *
 * If updating upload logic, update BOTH this file and the Edge Function.
 */

// --- Configuration ---

const GOOGLE_ADS_API_VERSION = "v18";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

function getGoogleAdsEndpoint(customerId: string): string {
  return `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customerId}:uploadClickConversions`;
}

// --- Types ---

interface ConversionData {
  /** Google click ID from the original ad click */
  gclid: string | null;
  /** SHA-256 hex hash of the normalized email (lowercase, trimmed) */
  email_hash: string | null;
  /** Type of conversion: qualified or closed */
  conversion_type: "qualified" | "closed";
  /** Monetary value of the conversion (nullable) */
  conversion_value: number | null;
  /** Currency code (defaults to EUR) */
  conversion_currency: string;
  /** When the conversion occurred (ISO 8601 timestamp) */
  conversion_time: string;
}

interface UploadResult {
  success: boolean;
  /** Error message if upload failed */
  error?: string;
  /** Partial failure details from Google Ads API */
  partial_failure_error?: string;
}

// --- OAuth2 Token Management ---

let cachedToken: { access_token: string; expires_at: number } | null = null;

/**
 * Get a valid OAuth2 access token, refreshing if necessary.
 *
 * Caches the token in-memory with a 5-minute buffer before expiry.
 * On Vercel serverless, cache lives per function instance (acceptable
 * since token refresh is cheap and instances are short-lived).
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expires_at > now + 5 * 60 * 1000) {
    return cachedToken.access_token;
  }

  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google Ads OAuth2 credentials not configured");
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OAuth2 token refresh failed (${response.status}): ${errorBody}`);
  }

  const tokenData = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    access_token: tokenData.access_token,
    expires_at: now + tokenData.expires_in * 1000,
  };

  return cachedToken.access_token;
}

// --- Conversion Action Mapping ---

/**
 * Get the full resource name for a conversion action.
 *
 * Maps conversion_type to the corresponding Google Ads conversion action ID.
 * Conversion actions must be created in the Google Ads dashboard first,
 * then their IDs configured in env vars.
 *
 * Format: customers/{customer_id}/conversionActions/{action_id}
 */
function getConversionActionName(
  customerId: string,
  conversionType: "qualified" | "closed"
): string {
  const envKey =
    conversionType === "qualified"
      ? "GOOGLE_ADS_CONVERSION_ACTION_QUALIFIED"
      : "GOOGLE_ADS_CONVERSION_ACTION_CLOSED";

  const actionId = process.env[envKey];
  if (!actionId) {
    throw new Error(`${envKey} not configured`);
  }

  return `customers/${customerId}/conversionActions/${actionId}`;
}

// --- Payload Builder ---

/**
 * Build the Google Ads uploadClickConversions request body.
 *
 * Includes:
 * - gclid for click attribution (when available)
 * - sha256_email_address as userIdentifier for Enhanced Conversions (OFL-08)
 * - Consent signals for EEA compliance (OFL-09)
 * - Conversion value and currency
 */
function buildUploadPayload(
  customerId: string,
  conversion: ConversionData
): Record<string, unknown> {
  const conversionAction = getConversionActionName(
    customerId,
    conversion.conversion_type
  );

  // Build userIdentifiers array (OFL-08)
  const userIdentifiers: Array<Record<string, unknown>> = [];

  if (conversion.email_hash) {
    userIdentifiers.push({
      hashedEmail: conversion.email_hash,
    });
  }

  // Build the click conversion object
  const clickConversion: Record<string, unknown> = {
    conversionAction,
    conversionDateTime: conversion.conversion_time,
    // OFL-09: Consent signals required for EEA users
    consent: {
      adUserData: "GRANTED",
      adPersonalization: "GRANTED",
    },
  };

  // Add gclid if available (primary attribution)
  if (conversion.gclid) {
    clickConversion.gclid = conversion.gclid;
  }

  // Add user identifiers for Enhanced Conversions (OFL-08)
  if (userIdentifiers.length > 0) {
    clickConversion.userIdentifiers = userIdentifiers;
  }

  // Add conversion value if present
  if (conversion.conversion_value !== null) {
    clickConversion.conversionValue = conversion.conversion_value;
    clickConversion.currencyCode = conversion.conversion_currency;
  }

  return {
    conversions: [clickConversion],
    // Enable partial failure reporting (returns per-conversion errors)
    partialFailure: true,
  };
}

// --- Upload Function ---

/**
 * Upload a single offline conversion to Google Ads API (OFL-06).
 *
 * Handles OAuth2 token refresh, payload formatting, and error parsing.
 * Returns a structured result indicating success or failure.
 *
 * Called by the queue processor (Plan 03) for each pending/retry-ready item.
 */
export async function uploadConversion(
  conversion: ConversionData
): Promise<UploadResult> {
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

  if (!customerId || !loginCustomerId || !developerToken) {
    return {
      success: false,
      error: "Google Ads API credentials not configured",
    };
  }

  // Validate we have at least one identifier
  if (!conversion.gclid && !conversion.email_hash) {
    return {
      success: false,
      error: "No attribution data (gclid or email_hash)",
    };
  }

  try {
    const accessToken = await getAccessToken();
    const endpoint = getGoogleAdsEndpoint(customerId);
    const payload = buildUploadPayload(customerId, conversion);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "developer-token": developerToken,
        "login-customer-id": loginCustomerId,
      },
      body: JSON.stringify(payload),
    });

    const responseBody = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      // API-level error (auth failure, invalid request, rate limit)
      const errorDetails =
        typeof responseBody.error === "object" && responseBody.error
          ? (responseBody.error as { message?: string }).message
          : JSON.stringify(responseBody);

      return {
        success: false,
        error: `Google Ads API error (${response.status}): ${errorDetails}`,
      };
    }

    // Check for partial failure (individual conversion errors within a successful request)
    const partialFailureError = responseBody.partialFailureError as
      | { message?: string }
      | undefined;

    if (partialFailureError?.message) {
      return {
        success: false,
        error: "Partial failure",
        partial_failure_error: partialFailureError.message,
      };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
