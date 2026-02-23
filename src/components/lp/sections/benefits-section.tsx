import { UserCheck, BadgeCheck, Clock, TrendingDown } from "lucide-react"

import { Section } from "@/components/lp/ui/section"
import { LPCard, LPCardContent } from "@/components/lp/ui/lp-card"
import { benefits } from "@/lib/lp/content-data"

/**
 * Icon map for benefit cards.
 * Keys match the `icon` hint in content-data.ts.
 */
const BENEFIT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCheck,
  BadgeCheck,
  Clock,
  TrendingDown,
}

/**
 * BenefitsSection — "Warum NextOffice?"
 *
 * Displays 4 benefit cards explaining why teams choose NextOffice over
 * searching for office space on their own.
 *
 * Layout: 1-column on mobile, 2-column on tablet, 4-column on desktop.
 * Server component — no "use client".
 */
export function BenefitsSection() {
  return (
    <Section background="surface">
      {/* Section heading */}
      <div className="text-center mb-10 lg:mb-14">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
          Ihre Vorteile
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
          Warum NextOffice?
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Büroflächen finden ist zeitaufwendig. Wir machen es einfach — und besser,
          als Sie es alleine könnten.
        </p>
      </div>

      {/* Benefits grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit) => {
          const Icon = BENEFIT_ICONS[benefit.icon]

          return (
            <LPCard key={benefit.title} variant="elevated">
              <LPCardContent className="flex flex-col items-start gap-4">
                {/* Icon */}
                {Icon && (
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                )}

                {/* Title */}
                <h3 className="text-base font-semibold text-foreground leading-snug">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </LPCardContent>
            </LPCard>
          )
        })}
      </div>
    </Section>
  )
}
