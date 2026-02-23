import { MapPin } from "lucide-react"

import { Section } from "@/components/lp/ui/section"
import { LPBadge } from "@/components/lp/ui/badge"
import { getCityIntro } from "@/lib/lp/spaces-data"
import type { LPCity } from "@/lib/lp/types"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CityIntroSectionProps {
  city: LPCity
  className?: string
}

// ---------------------------------------------------------------------------
// CityIntroSection
// ---------------------------------------------------------------------------

/**
 * CityIntroSection — brief city intro displayed above the space listings.
 *
 * Shows a headline, 2–3 sentence description of the city's coworking landscape,
 * district highlight pills, and the average monthly price range.
 *
 * Looks up content from spaces-data.ts by city slug.
 * Returns null for unknown city slugs (safe forward-compatible pattern).
 *
 * Server component — no "use client".
 *
 * @example
 * <CityIntroSection city={city} />
 */
export function CityIntroSection({ city, className }: CityIntroSectionProps) {
  const cityIntro = getCityIntro(city.slug)

  // Don't render if no intro content for this city
  if (!cityIntro) return null

  return (
    <Section background="white" className={className}>
      {/* Headline */}
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
        {cityIntro.headline}
      </h2>

      {/* Description */}
      <p className="text-base text-muted-foreground max-w-3xl mb-6">
        {cityIntro.description}
      </p>

      {/* District highlight pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <MapPin
          className="w-4 h-4 text-primary shrink-0"
          aria-hidden="true"
        />
        {cityIntro.highlights.map((district) => (
          <LPBadge key={district} variant="highlight">
            {district}
          </LPBadge>
        ))}
      </div>

      {/* Average price range */}
      <p className="text-sm text-muted-foreground">
        Durchschnittliche Mietpreise:{" "}
        <span className="font-medium text-foreground">{cityIntro.avgPriceRange}</span>
      </p>
    </Section>
  )
}
