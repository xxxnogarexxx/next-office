import { Building2, MapPin, Tag, TrendingUp } from "lucide-react"

import { Section } from "@/components/lp/ui/section"
import { LPBadge } from "@/components/lp/ui/badge"
import { getCityStats } from "@/lib/lp/content-data"
import type { LPCity } from "@/lib/lp/types"

/**
 * Props for CityStatsSection.
 */
interface CityStatsSectionProps {
  city: LPCity
  className?: string
}

/**
 * A single stat display card within the city stats grid.
 */
function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 p-4 rounded-xl bg-background border border-border">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <span className="text-xl sm:text-2xl font-bold text-foreground leading-none">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

/**
 * CityStatsSection — "{city.name} in Zahlen"
 *
 * Displays city-specific office market stats: available spaces, price range,
 * popular districts (as badges), and a one-sentence market highlight.
 *
 * Looks up stats from content-data.ts by city slug.
 * If no stats exist for the slug, returns null (renders nothing).
 *
 * Server component — no "use client".
 */
export function CityStatsSection({ city, className }: CityStatsSectionProps) {
  const stats = getCityStats(city.slug)

  // Don't render if no stats for this city
  if (!stats) return null

  return (
    <Section background="surface" className={className}>
      {/* Section heading */}
      <div className="text-center mb-10 lg:mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
          Marktüberblick
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
          Büromarkt {city.name}
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          {stats.marketHighlight}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Building2}
          label="Verfügbare Spaces"
          value={stats.availableSpaces}
        />
        <StatCard
          icon={Tag}
          label="Einstiegspreis"
          value={stats.priceRange}
        />
        <StatCard
          icon={TrendingUp}
          label="Antwortzeit"
          value="< 2 Std."
        />
        <StatCard
          icon={Building2}
          label="Erfolgreiche Vermittlungen"
          value="500+"
        />
      </div>

      {/* Popular districts */}
      <div className="text-center">
        <p className="text-sm font-medium text-foreground mb-3 flex items-center justify-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
          Beliebte Stadtteile
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {stats.popularDistricts.map((district) => (
            <LPBadge key={district} variant="highlight">
              {district}
            </LPBadge>
          ))}
        </div>
      </div>
    </Section>
  )
}
