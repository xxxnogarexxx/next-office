"use client"

import { Section } from "@/components/lp/ui/section"
import { LPButton } from "@/components/lp/ui/lp-button"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// ListingCTABanner
// ---------------------------------------------------------------------------

interface ListingCTABannerProps {
  className?: string
}

/**
 * ListingCTABanner — subtle inline CTA inserted after every 3 space cards.
 *
 * Soft background with a short helpful message and a secondary-style CTA
 * linking to the #anfrage lead form. Designed to feel like a helpful aside
 * rather than a hard sales push.
 */
export function ListingCTABanner({ className }: ListingCTABannerProps) {
  function handleClick() {
    const form = document.getElementById("anfrage")
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div
      className={cn(
        "bg-primary/5 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between",
        className
      )}
      role="complementary"
      aria-label="Beratungshinweis"
    >
      <div>
        <p className="text-sm font-semibold text-foreground">
          Nicht das Richtige dabei?
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          Unsere Experten kennen 50+ weitere Spaces — kostenlose Beratung.
        </p>
      </div>
      <LPButton
        variant="secondary"
        size="sm"
        onClick={handleClick}
        className="shrink-0"
        aria-label="Jetzt beraten lassen — kostenlos und unverbindlich"
      >
        Jetzt beraten lassen
      </LPButton>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ListingClosingCTA
// ---------------------------------------------------------------------------

interface ListingClosingCTAProps {
  /** Number of spaces shown above — used in the headline copy. */
  spaceCount: number
  className?: string
}

/**
 * ListingClosingCTA — stronger closing CTA after all space listings.
 *
 * Contrasted dark background with an escalated copy angle: acknowledges
 * the visitor has seen all spaces and offers broker-guided next steps.
 * Links to the #anfrage lead form.
 */
export function ListingClosingCTA({ spaceCount, className }: ListingClosingCTAProps) {
  function handleClick() {
    const form = document.getElementById("anfrage")
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <Section background="dark" className={className}>
      <div className="text-center max-w-2xl mx-auto">
        {/* Headline acknowledges what visitor has seen */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">
          Sie haben {spaceCount} Spaces gesehen — wir kennen 50+ weitere.
        </h2>

        {/* Supporting copy */}
        <p className="text-base opacity-80 mb-8">
          Lassen Sie sich von unseren Experten die perfekte Lösung für Ihr Team
          empfehlen. Kostenlos, unverbindlich, innerhalb von 24 Stunden.
        </p>

        {/* Primary CTA */}
        <LPButton
          variant="cta"
          size="lg"
          onClick={handleClick}
          aria-label="Jetzt kostenlos beraten lassen"
        >
          Jetzt kostenlos beraten lassen
        </LPButton>
      </div>
    </Section>
  )
}
