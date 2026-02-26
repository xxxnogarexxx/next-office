/**
 * Runtime environment variable validation.
 *
 * This module validates all required env vars at import time.
 * If any required var is missing, an Error is thrown with a clear message
 * naming every missing variable — the app fails fast instead of silently
 * producing broken behavior.
 *
 * Usage:
 *   import { env } from "@/lib/env";
 *   env.NEXT_PUBLIC_SUPABASE_URL // typed, validated
 *
 * Zero external dependencies — plain TypeScript only.
 */

// ---------------------------------------------------------------------------
// Required server-side vars (app will not start without these)
// ---------------------------------------------------------------------------
const REQUIRED_SERVER = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "NOTIFICATION_EMAIL",
  "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN",
] as const;

// ---------------------------------------------------------------------------
// Optional public vars (features degrade gracefully without these)
// ---------------------------------------------------------------------------
const OPTIONAL_PUBLIC = [
  "NEXT_PUBLIC_GA4_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL",
] as const;

type RequiredKey = (typeof REQUIRED_SERVER)[number];
type OptionalKey = (typeof OPTIONAL_PUBLIC)[number];

export type ValidatedEnv = {
  [K in RequiredKey]: string;
} & {
  [K in OptionalKey]: string | undefined;
};

// ---------------------------------------------------------------------------
// validateEnv — throws on any missing required var
// ---------------------------------------------------------------------------
export function validateEnv(): ValidatedEnv {
  const missing: string[] = [];

  for (const key of REQUIRED_SERVER) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `- ${k}`).join("\n")}\nSee .env.example for documentation.`
    );
  }

  const validated: Record<string, string | undefined> = {};

  for (const key of REQUIRED_SERVER) {
    validated[key] = process.env[key] as string;
  }

  for (const key of OPTIONAL_PUBLIC) {
    validated[key] = process.env[key];
  }

  return validated as ValidatedEnv;
}

// ---------------------------------------------------------------------------
// validateGoogleAdsEnv — warns if Google Ads vars look like placeholders
// ---------------------------------------------------------------------------
const PLACEHOLDER_PATTERN =
  /^[X]+$|^AW-X+$|XXXXXXXXXX|example|placeholder|test/i;

export function validateGoogleAdsEnv(): void {
  const googleAdsVars: OptionalKey[] = [
    "NEXT_PUBLIC_GOOGLE_ADS_ID",
    "NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID",
    "NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL",
  ];

  for (const varName of googleAdsVars) {
    const value = process.env[varName];
    if (value && PLACEHOLDER_PATTERN.test(value)) {
      console.warn(
        `[env] ${varName} appears to be a placeholder value: "${value}". Set real values or remove.`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Module-level validation — importing this module triggers validation
// ---------------------------------------------------------------------------
export const env = validateEnv();

validateGoogleAdsEnv();
