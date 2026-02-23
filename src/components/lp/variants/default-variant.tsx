"use client"

import type { LPVariantProps } from "@/lib/lp/types"
import { HeroSection } from "@/components/lp/sections/hero-section"
import { SocialProofBar } from "@/components/lp/sections/social-proof-bar"
import { HowItWorksSection } from "@/components/lp/sections/how-it-works-section"
import { BenefitsSection } from "@/components/lp/sections/benefits-section"
import { PainPointSection } from "@/components/lp/sections/pain-point-section"
import { TestimonialsSection } from "@/components/lp/sections/testimonials-section"
import { CityStatsSection } from "@/components/lp/sections/city-stats-section"
import { LeadFormSection } from "@/components/lp/sections/lead-form-section"
import { FAQSection } from "@/components/lp/sections/faq-section"
import { TrustSection } from "@/components/lp/sections/trust-section"
import { StickyCTA } from "@/components/lp/sections/sticky-cta"
import { useScrollTracking } from "@/components/lp/tracking/use-scroll-tracking"

/**
 * Default LP variant — conversion-optimized single-scroll landing page.
 *
 * Assembles all Phase 2 section components in conversion-optimized order
 * for B2B coworking office space inquiries:
 *   Hero → Social Proof → How It Works → Benefits → Pain Point →
 *   Testimonials → City Stats → Lead Form → FAQ → Trust → Sticky CTA
 *
 * "use client" — required because:
 *   - useScrollTracking is a React hook
 *   - FAQSection and LeadFormSection contain client-side state
 *   - StickyCTA uses IntersectionObserver
 */
export default function DefaultVariant({ city, searchParams }: LPVariantProps) {
  // Activate scroll milestone (25/50/75/100%) and time-on-page tracking
  useScrollTracking()

  return (
    <>
      {/* 1. Hero — above the fold, keyword mirroring, primary CTA */}
      <HeroSection city={city} searchParams={searchParams} />

      {/* 2. Social Proof Bar — trust metrics + client logos immediately after hero */}
      <SocialProofBar />

      {/* 3. How It Works — explain the 3-step broker process */}
      <HowItWorksSection />

      {/* 4. Benefits — why NextOffice over searching alone */}
      <BenefitsSection />

      {/* 5. Pain Point — agitate the problem, CTA links to #anfrage */}
      <PainPointSection />

      {/* 6. Testimonials — deepen social proof with client quotes */}
      <TestimonialsSection />

      {/* 7. City Stats — city-specific office market data */}
      <CityStatsSection city={city} />

      {/* 8. Lead Form — primary lead capture (section variant, id="anfrage") */}
      <LeadFormSection city={city} searchParams={searchParams} variant="section" />

      {/* 9. FAQ — objection handling near the form */}
      <FAQSection />

      {/* 10. Trust — final credibility reinforcement before footer */}
      <TrustSection />

      {/* 11. Sticky CTA — floating bar visible when hero scrolls out of view */}
      <StickyCTA />
    </>
  )
}
