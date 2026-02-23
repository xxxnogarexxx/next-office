"use client"

import type { LPVariantProps } from "@/lib/lp/types"
import { HeroSection } from "@/components/lp/sections/hero-section"
import { SocialProofBar } from "@/components/lp/sections/social-proof-bar"
import { CityIntroSection } from "@/components/lp/sections/city-intro-section"
import { SpacesMapSection } from "@/components/lp/sections/spaces-map-section"
import { ListingClosingCTA } from "@/components/lp/sections/listing-cta-section"
import { HowItWorksSection } from "@/components/lp/sections/how-it-works-section"
import { FAQSection } from "@/components/lp/sections/faq-section"
import { LeadFormSection } from "@/components/lp/sections/lead-form-section"
import { TrustSection } from "@/components/lp/sections/trust-section"
import { StickyCTA } from "@/components/lp/sections/sticky-cta"
import { useScrollTracking } from "@/components/lp/tracking/use-scroll-tracking"
import { getFeaturedSpaces } from "@/lib/lp/spaces-data"

/**
 * Improved Listing LP variant — Airbnb-style listing-focused landing page.
 *
 * Assembles a curated marketplace experience with a city intro, split-view
 * space cards + Mapbox map, inline CTAs woven throughout, and trust/FAQ
 * sections below the listings.
 *
 * Section order (per 03-CONTEXT.md):
 *   Hero → Social Proof → City Intro → Spaces+Map → Closing CTA →
 *   How It Works → FAQ → Lead Form → Trust → Sticky CTA
 *
 * Sections SKIPPED vs default variant:
 * - BenefitsSection (covered by hero + social proof credibility)
 * - PainPointSection (listing-centric page — closing CTA fills the urgency role)
 * - TestimonialsSection (social proof bar already provides credibility; keeps page lean)
 * - CityStatsSection (CityIntroSection provides city context instead)
 *
 * "use client" — required because:
 *   - useScrollTracking is a React hook
 *   - SpacesMapSection contains Mapbox + client interaction state
 *   - FAQSection and LeadFormSection contain client-side state
 *   - StickyCTA uses IntersectionObserver
 */
export default function ImprovedListingVariant({ city, searchParams }: LPVariantProps) {
  // Activate scroll milestone (25/50/75/100%) and time-on-page tracking
  useScrollTracking()

  // Get space count for closing CTA copy ("Sie haben X Spaces gesehen")
  const spaceCount = getFeaturedSpaces(city.slug).length

  return (
    <>
      {/* 1. Hero — above the fold, keyword mirroring, primary CTA */}
      <HeroSection city={city} searchParams={searchParams} />

      {/* 2. Social Proof Bar — trust metrics + client logos immediately after hero */}
      <SocialProofBar />

      {/* 3. City Intro — district highlights + avg price context for this city */}
      <CityIntroSection city={city} />

      {/* 4. Spaces + Map — Airbnb-style split view: scrollable cards + sticky Mapbox map */}
      <SpacesMapSection city={city} searchParams={searchParams} />

      {/* 5. Listing Closing CTA — escalated conversion after all spaces */}
      {spaceCount > 0 && <ListingClosingCTA spaceCount={spaceCount} />}

      {/* 6. How It Works — 3-step broker process (below listings for context) */}
      <HowItWorksSection />

      {/* 7. FAQ — objection handling */}
      <FAQSection />

      {/* 8. Lead Form — primary lead capture (section variant, id="anfrage") */}
      <LeadFormSection city={city} searchParams={searchParams} variant="section" />

      {/* 9. Trust — final credibility reinforcement before footer */}
      <TrustSection />

      {/* 10. Sticky CTA — floating bar visible when hero scrolls out of view */}
      <StickyCTA />
    </>
  )
}
