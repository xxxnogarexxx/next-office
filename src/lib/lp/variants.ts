/**
 * Variant component registry and resolver.
 *
 * This module maps VariantId values to their React components.
 * Each variant is dynamically imported so Next.js code-splits them
 * into separate bundles — critical for LP page performance.
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

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { LPVariantProps, VariantId } from "./types";

export const VARIANT_REGISTRY: Record<VariantId, ComponentType<LPVariantProps>> = {
  default: dynamic(
    () => import("@/components/lp/variants/default-variant"),
    { ssr: true }
  ),
};

/**
 * Returns the React component for a given variant ID.
 * Falls back to "default" if the requested ID is not registered.
 */
export function getVariantComponent(id: VariantId): ComponentType<LPVariantProps> {
  return VARIANT_REGISTRY[id] ?? VARIANT_REGISTRY["default"];
}
