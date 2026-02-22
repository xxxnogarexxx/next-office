import type { LPVariantProps } from "@/lib/lp/types";

/**
 * Default LP variant — placeholder component.
 *
 * This is a server component used to verify the routing and variant slot
 * pattern works end-to-end. It will be replaced by a real implementation
 * in Phases 3-6.
 */
export default function DefaultVariant({ city }: LPVariantProps) {
  return (
    <div className="px-4 py-16 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        Büro mieten in {city.name}
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        {city.listingCount} Büros verfügbar
      </p>
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center text-gray-400">
        LP variant content will be rendered here
      </div>
    </div>
  );
}
