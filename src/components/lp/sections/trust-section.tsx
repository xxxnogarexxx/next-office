import { Gift, Lock, ShieldCheck, UserCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { Section } from "@/components/lp/ui"
import { trustBadges } from "@/lib/lp/social-proof-data"

/**
 * Maps icon name hints from trustBadges to Lucide components.
 * Keeps social-proof-data.ts free of React/Lucide dependencies.
 */
const BADGE_ICONS: Record<string, React.ReactNode> = {
  Gift: <Gift className="size-6 text-primary" aria-hidden="true" />,
  ShieldCheck: <ShieldCheck className="size-6 text-primary" aria-hidden="true" />,
  Lock: <Lock className="size-6 text-primary" aria-hidden="true" />,
  UserCheck: <UserCheck className="size-6 text-primary" aria-hidden="true" />,
}

export interface TrustSectionProps {
  className?: string
}

/**
 * Trust badges and credibility reinforcement section.
 *
 * Two visual blocks:
 * 1. Trust badges row: 4 icons + labels covering DSGVO, SSL, free service, and
 *    personal consultation — addressing the main B2B risk objections.
 * 2. Credibility block: brief success story snippet (2-3 sentences) demonstrating
 *    real-world impact without the weight of a full case study.
 *
 * Server component — no "use client".
 *
 * @example
 * <TrustSection />
 */
export function TrustSection({ className }: TrustSectionProps) {
  return (
    <Section background="surface" className={className}>
      {/* Trust badges grid */}
      <div
        className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8"
        aria-label="Vertrauensmerkmale"
      >
        {trustBadges.map((badge) => (
          <div
            key={badge.label}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border border-border bg-background p-4 text-center",
              "shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5"
            )}
          >
            {/* Icon */}
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/5">
              {BADGE_ICONS[badge.icon]}
            </div>

            {/* Label */}
            <p className="text-sm font-semibold text-foreground leading-snug">
              {badge.label}
            </p>

            {/* Optional description */}
            {badge.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {badge.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Credibility reinforcement block */}
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-background p-6 text-center sm:mt-12 sm:p-8">
        {/* Eyebrow */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
          Erfolgsgeschichte
        </p>

        {/* Mini case study */}
        <p className="text-base leading-relaxed text-foreground">
          Ein 40-köpfiges Münchner Fintech-Team benötigte kurzfristig 600 m²
          Bürofläche im Innovations­viertel — mit Einzugs­termin innerhalb von
          sechs Wochen. NextOffice präsentierte innerhalb von 24 Stunden drei
          geprüfte Optionen. Das Team unterschrieb den Mietvertrag nach der
          ersten Besichtigung.
        </p>

        {/* Experience anchor */}
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Über 7 Jahre Erfahrung in der Bürovermittlung — mehr als 300 Teams
          erfolgreich in ihre neuen Büros begleitet.
        </p>
      </div>
    </Section>
  )
}
