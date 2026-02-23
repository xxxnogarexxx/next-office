import { ClipboardList, Inbox, Building2 } from "lucide-react"

import { Section } from "@/components/lp/ui/section"
import { howItWorksSteps } from "@/lib/lp/content-data"

/**
 * Icon map for how-it-works steps.
 * Keys match the `icon` hint in content-data.ts.
 */
const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardList,
  Inbox,
  Building2,
}

/**
 * HowItWorksSection — "In 3 Schritten zum perfekten Büro"
 *
 * Explains the NextOffice broker process in three clear steps:
 * Anfrage → Angebote → Besichtigung.
 *
 * Layout: stacked on mobile, 3-column grid on desktop with visual connectors.
 * Server component — no "use client".
 */
export function HowItWorksSection() {
  return (
    <Section background="white" id="so-gehts">
      {/* Section heading */}
      <div className="text-center mb-12 lg:mb-16">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
          So einfach geht&apos;s
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
          In 3 Schritten zum perfekten Büro
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Kein Vergleichsportal, kein Spam — ein persönlicher Berater, der Ihnen die
          Arbeit abnimmt.
        </p>
      </div>

      {/* Steps grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
        {howItWorksSteps.map((step, index) => {
          const Icon = STEP_ICONS[step.icon]
          const isLast = index === howItWorksSteps.length - 1

          return (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Connector line between steps (desktop only) */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className="hidden md:block absolute top-9 left-[calc(50%+3.5rem)] right-[calc(-50%+3.5rem)] h-px bg-border"
                />
              )}

              {/* Step number circle with icon */}
              <div className="relative flex items-center justify-center w-18 h-18 mb-5">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 bg-primary/5" />
                {/* Step number badge */}
                <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                  {step.number}
                </span>
                {/* Icon */}
                {Icon && (
                  <Icon className="relative w-8 h-8 text-primary" />
                )}
              </div>

              {/* Step title */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>

              {/* Step description */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Time callout */}
      <p className="mt-10 text-center text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Angebote innerhalb von 2 Stunden</span>
        {" "}— an Werktagen, kostenlos und unverbindlich.
      </p>
    </Section>
  )
}
