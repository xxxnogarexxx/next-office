/**
 * Variant component registry and resolver.
 *
 * This module maps VariantId values to their React components.
 * Next.js automatically code-splits at the route level — each LP page
 * is a separate bundle, so variant components are never loaded together
 * with main site code.
 *
 * Architecture note: The registry is intentionally a static map.
 * No database lookups, no runtime assignment logic.
 * Default variant assignment: every city page renders "default".
 * AB testing traffic splitting is deferred to v2.
 *
 * Adding a new variant:
 *   1. Create src/components/lp/variants/my-variant.tsx
 *   2. Add "my-variant" to VariantId in types.ts
 *   3. Add an entry here in VARIANT_REGISTRY
 */

import type { ComponentType } from "react";
import type { LPVariantProps, VariantId } from "./types";
import DefaultVariant from "@/components/lp/variants/default-variant";
import ImprovedListingVariant from "@/components/lp/variants/improved-listing-variant";

export const VARIANT_REGISTRY: Record<VariantId, ComponentType<LPVariantProps>> = {
  default: DefaultVariant,
  "improved-listing": ImprovedListingVariant,
};

/**
 * Returns the React component for a given variant ID.
 * Falls back to "default" if the requested ID is not registered.
 */
export function getVariantComponent(id: VariantId): ComponentType<LPVariantProps> {
  return VARIANT_REGISTRY[id] ?? VARIANT_REGISTRY["default"];
}
