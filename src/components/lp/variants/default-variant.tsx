"use client"

import type { LPVariantProps } from "@/lib/lp/types"
import {
  LPButton,
  Section,
  LPCard,
  LPCardContent,
  LPBadge,
  FormField,
} from "@/components/lp/ui"

/**
 * Default LP variant — component showcase.
 *
 * Validates that all LP UI primitives render correctly within the
 * routing architecture and provides a visual reference for the design
 * direction. Not a real landing page — a proof-of-concept placeholder.
 *
 * Will be replaced/augmented by real LP variants in Phases 3-6.
 *
 * "use client" — required because FormField uses "use client".
 */
export default function DefaultVariant({ city }: LPVariantProps) {
  return (
    <>
      {/* 1. Hero section */}
      <Section background="white">
        <div className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
          <LPBadge variant="trust">Kostenlos &amp; unverbindlich</LPBadge>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Büro mieten in {city.name}
          </h1>

          <p className="text-lg text-muted-foreground">
            Vergleichen Sie {city.listingCount} flexible Office Spaces.
            Kostenlose Beratung, beste Preise.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <LPButton variant="cta" size="xl">
              Jetzt kostenlos beraten lassen
            </LPButton>
            <LPButton variant="ghost">Mehr erfahren</LPButton>
          </div>
        </div>
      </Section>

      {/* 2. Features section */}
      <Section background="surface">
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold text-center text-foreground">
            Warum NextOffice?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LPCard variant="elevated">
              <LPCardContent>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Persönliche Beratung
                </h3>
                <p className="text-sm text-muted-foreground">
                  Unsere Experten finden das perfekte Büro für Ihr Team.
                </p>
              </LPCardContent>
            </LPCard>

            <LPCard variant="elevated">
              <LPCardContent>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Kostenloser Service
                </h3>
                <p className="text-sm text-muted-foreground">
                  Unser Service ist für Sie komplett kostenlos.
                </p>
              </LPCardContent>
            </LPCard>

            <LPCard variant="elevated">
              <LPCardContent>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Schnelle Ergebnisse
                </h3>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie passende Angebote innerhalb von 24 Stunden.
                </p>
              </LPCardContent>
            </LPCard>
          </div>
        </div>
      </Section>

      {/* 3. Placeholder form section */}
      <Section background="white">
        <div className="max-w-md mx-auto flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-center text-foreground">
            Jetzt Büro anfragen
          </h2>

          <div className="flex flex-col gap-4">
            <FormField
              type="text"
              label="Ihr Name"
              name="name"
              placeholder="Max Mustermann"
            />
            <FormField
              type="email"
              label="E-Mail"
              name="email"
              placeholder="team@firma.de"
            />
          </div>

          <LPButton variant="primary" className="w-full">
            Anfrage senden
          </LPButton>
        </div>
      </Section>
    </>
  )
}
