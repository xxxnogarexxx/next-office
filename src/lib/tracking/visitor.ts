/**
 * Visitor tracking constants and helpers.
 *
 * Extracted from middleware.ts for testability.
 * Server-safe: no browser APIs, no React.
 */

export const VISITOR_COOKIE_NAME = "_no_vid";
export const VISITOR_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export const UTM_COOKIE_PREFIX = "_no_utm_";
export const UTM_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export const UTM_KEYS = [
  "source",
  "medium",
  "campaign",
  "term",
  "content",
] as const;

export type UTMKey = (typeof UTM_KEYS)[number];

/**
 * Generates a new visitor UUID.
 * Uses crypto.randomUUID() — available in Next.js Edge Runtime.
 */
export function generateVisitorId(): string {
  return crypto.randomUUID();
}
