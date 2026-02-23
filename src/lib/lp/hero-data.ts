/**
 * Static hero content per LP city.
 *
 * Provides fallback headlines, subheadlines, and CTA text for each city.
 * Used when there is no utm_term to mirror (direct/organic visitors).
 *
 * Copy direction per city:
 * - Berlin:   Startup/tech scene, creative offices (Kreativbüros)
 * - Hamburg:  Maritime business, Handelskammer proximity, international trade
 * - München:  Premium corporate, headquarters, Tech/IT clusters
 * - Frankfurt: Finance/Bankenviertel, international business, financial district
 *
 * All copy uses formal German (Sie) with a warm, professional tone.
 * Content is placeholder — realistic and production-ready, designed to be
 * swapped for verified real data before final launch.
 *
 * Server-safe: no React, no browser APIs.
 */

/**
 * Static hero content for a city's LP page.
 */
export interface HeroContent {
  /** Static fallback H1 headline — benefit-driven, city-specific. */
  headline: string;
  /** Supporting text below H1 — city context + concrete stat placeholder. */
  subheadline: string;
  /** Primary CTA button text — consistent across all cities. */
  ctaText: string;
}

/**
 * City-specific hero content map.
 * Keyed by city slug.
 */
const HERO_CONTENT: Record<string, HeroContent> = {
  berlin: {
    headline: "Flexible Büros in Berlin — für Teams, die wachsen",
    subheadline:
      "Über {listingCount} geprüfte Coworking Spaces und Flex-Offices im Startup-Herz Berlins. Wir finden den richtigen Standort für Ihr Team — kostenlos und unverbindlich.",
    ctaText: "Jetzt kostenlos beraten lassen",
  },

  hamburg: {
    headline: "Büroflächen in Hamburg — nah am Hafen, nah am Geschäft",
    subheadline:
      "Mehr als {listingCount} flexible Office-Lösungen in HafenCity, Innenstadt und City Nord. Ideal für Unternehmen mit internationalen Partnern und Elbblick inklusive.",
    ctaText: "Jetzt kostenlos beraten lassen",
  },

  muenchen: {
    headline: "Premium Büros in München — für anspruchsvolle Teams",
    subheadline:
      "{listingCount} hochwertige Office-Flächen in Maxvorstadt, Schwabing und dem Münchner Innovationsviertel. Repräsentative Adressen für Ihr Unternehmen, zu fairen Konditionen.",
    ctaText: "Jetzt kostenlos beraten lassen",
  },

  frankfurt: {
    headline: "Büroraum in Frankfurt — im Zentrum des europäischen Finanzmarkts",
    subheadline:
      "{listingCount} flexible Büros im Bankenviertel, Westend und Sachsenhausen. Erstklassige Adressen für Finanzdienstleister, Kanzleien und internationale Unternehmen.",
    ctaText: "Jetzt kostenlos beraten lassen",
  },
};

/**
 * Generic fallback for unknown city slugs.
 */
const DEFAULT_HERO_CONTENT: HeroContent = {
  headline: "Flexible Büroflächen — einfach, schnell, kostenlos gefunden",
  subheadline:
    "Wir vergleichen die besten Coworking Spaces und Flex-Offices in Ihrer Stadt. Persönliche Beratung, keine Kosten, schnelle Ergebnisse.",
  ctaText: "Jetzt kostenlos beraten lassen",
};

/**
 * Returns the static hero content for a given city slug.
 *
 * Note on subheadline interpolation: the subheadline contains a
 * `{listingCount}` placeholder. The hero section component is responsible
 * for interpolating this with the actual `city.listingCount` value at render time.
 *
 * @param citySlug - The city slug (e.g., "berlin", "hamburg").
 * @returns HeroContent for the city, or a generic fallback for unknown slugs.
 *
 * @example
 * getHeroContent("berlin").headline
 * // → "Flexible Büros in Berlin — für Teams, die wachsen"
 *
 * @example
 * getHeroContent("berlin").subheadline.replace("{listingCount}", String(city.listingCount))
 * // → "Über 47 geprüfte Coworking Spaces und Flex-Offices..."
 */
export function getHeroContent(citySlug: string): HeroContent {
  return HERO_CONTENT[citySlug] ?? DEFAULT_HERO_CONTENT;
}
