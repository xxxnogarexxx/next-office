import type { LPCity } from "@/lib/lp/types";
import { LPButton } from "@/components/lp/ui/lp-button";
import { LPBadge } from "@/components/lp/ui/badge";
import { getHeroHeadline, getKeywordContext } from "@/lib/lp/utm";
import { getHeroContent } from "@/lib/lp/hero-data";

/**
 * Props for the hero section.
 * Matches LPVariantProps — pass city + searchParams from the variant/page.
 */
export interface HeroSectionProps {
  city: LPCity;
  searchParams: Record<string, string | undefined>;
  /**
   * Override CTA href.
   * Default: "#anfrage" — scrolls to the inquiry form section.
   */
  ctaHref?: string;
}

/**
 * Above-the-fold hero section with keyword mirroring.
 *
 * The H1 headline dynamically reflects the visitor's Google Ads search term
 * when utm_term is present (keyword mirroring for ad-to-page relevance).
 * Direct and organic visitors see a benefit-driven city-specific fallback headline.
 *
 * Visual design:
 * - Gradient background: brand primary tint → white (no city photos, modern SaaS feel)
 * - Generous vertical padding to feel spacious while encouraging scroll
 * - Centered narrow text column for maximum readability
 *
 * Content layout (top to bottom):
 * 1. Trust badge — "Kostenlos & unverbindlich"
 * 2. H1 — Dynamic/keyword-mirrored headline
 * 3. Subheadline — City-specific context with listing count
 * 4. Primary CTA button — links to inquiry form
 * 5. Micro-copy — zero-risk reinforcement
 *
 * Server component — no "use client".
 * All data from props + pure utility functions.
 *
 * @example
 * <HeroSection city={city} searchParams={searchParams} />
 *
 * @example
 * // With custom CTA target
 * <HeroSection city={city} searchParams={searchParams} ctaHref="#kontakt" />
 */
export function HeroSection({
  city,
  searchParams,
  ctaHref = "#anfrage",
}: HeroSectionProps) {
  const headline = getHeroHeadline(city.slug, searchParams);
  const { subheadline, ctaText } = getHeroContent(city.slug);

  // Interpolate {listingCount} placeholder in subheadline
  const subheadlineText = subheadline.replace(
    "{listingCount}",
    String(city.listingCount)
  );

  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/[0.02] to-background py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8"
    >
      {/* Subtle decorative gradient orb — adds depth without imagery */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl text-center flex flex-col items-center gap-8">
        {/* 1. Trust badge */}
        <LPBadge variant="trust">Kostenlos &amp; unverbindlich</LPBadge>

        {/* 2. H1 — keyword mirrored or static city fallback */}
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {headline}
        </h1>

        {/* 3. Subheadline with city stats */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {subheadlineText}
        </p>

        {/* 4. Primary CTA */}
        <div className="flex flex-col items-center gap-3">
          <LPButton asChild variant="cta" size="xl">
            <a href={ctaHref}>{ctaText}</a>
          </LPButton>

          {/* 5. Micro-copy — zero-risk reinforcement */}
          <p className="text-sm text-muted-foreground">
            Unverbindlich &middot; Kostenlos &middot; Antwort in unter 2 Stunden
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Re-export getKeywordContext so LP variant pages can pass keyword
 * context downstream to other sections for copy relevance (HERO-04).
 *
 * @example
 * // In a variant page:
 * import { HeroSection, getKeywordContext } from "@/components/lp/sections/hero-section"
 * const keywordCtx = getKeywordContext(searchParams);
 */
export { getKeywordContext };
