/**
 * LP-specific type definitions.
 *
 * These are lean types focused on what LP pages need.
 * They are intentionally separate from the main app types
 * to avoid coupling LP pages to the broader City/Listing interfaces.
 */

/** Stripped-down city type for LP pages. */
export interface LPCity {
  name: string;
  slug: string;
  listingCount: number;
  latitude: number;
  longitude: number;
}

/**
 * Props every LP variant component receives.
 * `searchParams` carries UTM params and other query string values
 * for keyword mirroring and tracking (Phase 2+).
 */
export interface LPVariantProps {
  city: LPCity;
  searchParams: Record<string, string | undefined>;
}

/**
 * Union of all supported variant IDs.
 * Expand this type as new variants are built in Phases 3-6.
 */
export type VariantId = "default" | "improved-listing";
