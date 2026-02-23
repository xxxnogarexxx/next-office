import { Building2, Clock, MapPin, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Section } from "@/components/lp/ui"
import { clientLogos, trustMetrics } from "@/lib/lp/social-proof-data"

/**
 * Maps icon name hints from trustMetrics to Lucide components.
 * Keeps social-proof-data.ts free of React dependencies.
 */
const METRIC_ICONS: Record<string, React.ReactNode> = {
  Building2: <Building2 className="size-5 text-primary" aria-hidden="true" />,
  Users: <Users className="size-5 text-primary" aria-hidden="true" />,
  MapPin: <MapPin className="size-5 text-primary" aria-hidden="true" />,
  Clock: <Clock className="size-5 text-primary" aria-hidden="true" />,
}

export interface SocialProofBarProps {
  className?: string
}

/**
 * Compact social proof strip — trust metrics grid + client logo bar.
 *
 * Placed immediately below the hero section to reinforce credibility before
 * the visitor scrolls. Combines rational proof (stat numbers) with social
 * proof (company names) in a minimal footprint.
 *
 * Two visual blocks:
 * 1. Trust metrics row: 4 key stats (offices placed, happy teams, cities, response time)
 * 2. Logo bar: "Vertrauen uns bereits:" followed by company name pills
 *
 * Server component — no "use client".
 *
 * @example
 * <SocialProofBar />
 */
export function SocialProofBar({ className }: SocialProofBarProps) {
  return (
    <Section
      background="surface"
      className={cn("py-8 sm:py-10 lg:py-12", className)}
    >
      {/* Trust metrics grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 sm:gap-x-8">
        {trustMetrics.map((metric) => (
          <div
            key={metric.label}
            className="flex flex-col items-center gap-1 text-center"
          >
            <div className="mb-1">{METRIC_ICONS[metric.icon]}</div>
            <span className="text-2xl font-bold text-foreground leading-tight">
              {metric.value}
            </span>
            <span className="text-xs text-muted-foreground leading-snug">
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        className="my-6 border-t border-border sm:my-8"
        aria-hidden="true"
      />

      {/* Logo bar */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-3">
        <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Vertrauen uns bereits:
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {clientLogos.map((logo) => (
            <span
              key={logo.name}
              className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              title={logo.name}
            >
              <span className="mr-1.5 font-semibold text-foreground/60 text-xs">
                {logo.abbr}
              </span>
              {logo.name}
            </span>
          ))}
        </div>
      </div>
    </Section>
  )
}
