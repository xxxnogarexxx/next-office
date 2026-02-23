/**
 * UTM parameter parsing and keyword mirroring for LP pages.
 *
 * Key use case: Google Ads visitors arrive with utm_term set to their
 * search query (e.g., "coworking+hamburg"). This module extracts that
 * term, cleans it for display, and produces a dynamic H1 that mirrors
 * the visitor's exact search intent — improving ad-to-page relevance
 * and Google Ads Quality Score.
 *
 * Server-safe: no React, no browser APIs.
 */

import { getHeroContent } from "./hero-data";

/**
 * All 5 standard UTM parameters.
 * utm_term is the most important for keyword mirroring.
 */
export interface UTMParams {
  utm_source: string | undefined;
  utm_medium: string | undefined;
  utm_campaign: string | undefined;
  /** The search keyword — key for keyword mirroring. */
  utm_term: string | undefined;
  utm_content: string | undefined;
}

/**
 * Cleaned keyword context derived from utm_term.
 * Provides a display-ready version of the search term.
 */
export interface KeywordContext {
  /** Raw utm_term value as received from URL (may contain + or %20). */
  raw: string | undefined;
  /** Cleaned and title-cased search term for display (e.g., "Coworking Hamburg"). */
  searchTerm: string | undefined;
  /** True when utm_term is present and non-empty. */
  hasKeyword: boolean;
}

/**
 * Extracts all 5 UTM parameters from a flat searchParams record.
 *
 * @param searchParams - Flat key/value map (from Next.js page searchParams).
 * @returns UTMParams with undefined for any missing values.
 */
export function parseUTMParams(
  searchParams: Record<string, string | undefined>
): UTMParams {
  return {
    utm_source: searchParams["utm_source"],
    utm_medium: searchParams["utm_medium"],
    utm_campaign: searchParams["utm_campaign"],
    utm_term: searchParams["utm_term"],
    utm_content: searchParams["utm_content"],
  };
}

/**
 * Converts a title-cased word string.
 * "coworking hamburg" → "Coworking Hamburg"
 */
function toTitleCase(str: string): string {
  return str
    .split(" ")
    .map((word) =>
      word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ""
    )
    .join(" ");
}

/**
 * Derives cleaned keyword context from utm_term.
 *
 * Cleans the raw utm_term:
 * - Replaces "+" with spaces (Google Ads encodes spaces as +)
 * - Trims surrounding whitespace
 * - Title-cases for display (e.g., "coworking+hamburg" → "Coworking Hamburg")
 *
 * @param searchParams - Flat key/value map from Next.js page searchParams.
 * @returns KeywordContext with cleaned display term and quick boolean flag.
 */
export function getKeywordContext(
  searchParams: Record<string, string | undefined>
): KeywordContext {
  const raw = searchParams["utm_term"];

  if (!raw || raw.trim() === "") {
    return { raw: undefined, searchTerm: undefined, hasKeyword: false };
  }

  // Decode: replace + with space (URL encoding from Google Ads)
  const decoded = raw.replace(/\+/g, " ").trim();

  if (decoded === "") {
    return { raw, searchTerm: undefined, hasKeyword: false };
  }

  return {
    raw,
    searchTerm: toTitleCase(decoded),
    hasKeyword: true,
  };
}

/**
 * Produces the dynamic H1 headline for the hero section.
 *
 * When utm_term is present (Google Ads visitor), mirrors the search term
 * in the headline to reinforce ad-to-page relevance.
 * When no utm_term (direct/organic visitor), returns the city-specific
 * static fallback from hero-data.ts.
 *
 * @param citySlug - The city slug (e.g., "berlin") used for static fallback lookup.
 * @param searchParams - Flat key/value map from Next.js page searchParams.
 * @returns Display-ready H1 string.
 *
 * @example
 * // Google Ads visitor searching "coworking hamburg"
 * getHeroHeadline("hamburg", { utm_term: "coworking+hamburg" })
 * // → "Die besten Coworking Hamburg Angebote"
 *
 * @example
 * // Direct visitor to Berlin LP
 * getHeroHeadline("berlin", {})
 * // → "Flexible Büros in Berlin — für Teams, die wachsen"
 */
export function getHeroHeadline(
  citySlug: string,
  searchParams: Record<string, string | undefined>
): string {
  const { searchTerm, hasKeyword } = getKeywordContext(searchParams);

  if (hasKeyword && searchTerm) {
    return `Die besten ${searchTerm} Angebote`;
  }

  return getHeroContent(citySlug).headline;
}
