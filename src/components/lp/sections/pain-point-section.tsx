import { ArrowRight } from "lucide-react"

import { Section } from "@/components/lp/ui/section"
import { LPButton } from "@/components/lp/ui/lp-button"
import { painPointContent } from "@/lib/lp/content-data"

/**
 * PainPointSection — Problem statement and solution positioning.
 *
 * A visually distinct, punchy section on a dark background that directly
 * names the pain of searching for office space alone — then pivots to
 * NextOffice as the solution.
 *
 * Compact by design: high-impact copy, no filler.
 * Server component — no "use client".
 */
export function PainPointSection() {
  return (
    <Section background="dark" className="py-14 sm:py-16 lg:py-20">
      <div className="max-w-3xl mx-auto text-center">
        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
          {painPointContent.headline}
        </h2>

        {/* Body */}
        <p className="mt-5 text-base sm:text-lg text-white/75 leading-relaxed">
          {painPointContent.body}
        </p>

        {/* CTA */}
        <div className="mt-8">
          <LPButton variant="cta" size="lg" asChild>
            <a href="#anfrage">
              {painPointContent.ctaText}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </LPButton>
        </div>
      </div>
    </Section>
  )
}
