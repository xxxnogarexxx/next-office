/**
 * Email hashing for Google Ads Enhanced Conversions.
 *
 * Normalizes (trim + lowercase) and SHA-256 hashes the email address.
 * The result is a 64-character lowercase hex string — the format required
 * by Google Ads Enhanced Conversions for Leads (EC-03).
 *
 * Used server-side only (Node.js crypto). NOT safe for Edge Runtime.
 */

import { createHash } from "crypto";

/**
 * Compute SHA-256 hex hash of a normalized email address.
 *
 * Normalization: trim whitespace, convert to lowercase.
 * Returns a 64-character lowercase hex string.
 *
 * @param email - Raw email address (e.g., " User@Example.COM ")
 * @returns SHA-256 hex digest (e.g., "b4c9a289323b...")
 */
export function hashEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  return createHash("sha256").update(normalized).digest("hex");
}
