/**
 * Social proof and trust content for LP pages.
 *
 * All content is placeholder — realistic, production-ready, and designed
 * to be swapped for real content before launch.
 *
 * Content direction:
 * - Client logos: fictional but realistic German B2B company names
 * - Trust metrics: concrete numbers that demonstrate scale and speed
 * - Testimonials: 3 German-language quotes from distinct company types and cities
 * - Trust badges: DSGVO, SSL, free service, and personal consultation
 *
 * Copy tone: formal German (Sie) with a warm, professional feel.
 * Server-safe: no React, no browser APIs.
 */

/** Text-based logo placeholder for a client company. */
export interface ClientLogo {
  /** Full company name as displayed. */
  name: string;
  /** Short abbreviation or initials for compact badge display. */
  abbr: string;
}

/** A single trust metric (stat counter). */
export interface TrustMetric {
  /** Display value, e.g. "300+" or "< 2 Std." */
  value: string;
  /** Short label describing the stat, e.g. "Büros vermittelt". */
  label: string;
  /** Lucide icon name hint for the rendering component. */
  icon: string;
}

/** A single client testimonial. */
export interface Testimonial {
  /** German-language quote text (2-3 sentences). */
  quote: string;
  /** Person's name (realistic placeholder). */
  name: string;
  /** Job title, e.g. "Head of People". */
  role: string;
  /** Anonymized company category, e.g. "Tech-Startup" or "Beratungsunternehmen". */
  companyType: string;
  /** City where the office was found. */
  city: string;
}

/** A single trust badge with optional description. */
export interface TrustBadge {
  /** Short badge label, e.g. "DSGVO-konform". */
  label: string;
  /** Optional supporting sentence. */
  description?: string;
  /** Lucide icon name hint for the rendering component. */
  icon: string;
}

// ---------------------------------------------------------------------------
// Client logos
// ---------------------------------------------------------------------------

/**
 * Fictional but realistic German B2B company names.
 * Represents "Unsere Kunden vertrauen uns" logo bar.
 * Placeholder — replace with actual client logos before launch.
 */
export const clientLogos: ClientLogo[] = [
  { name: "TechFlow GmbH", abbr: "TF" },
  { name: "ScaleUp AG", abbr: "SU" },
  { name: "DataPulse", abbr: "DP" },
  { name: "Westermann & Partner", abbr: "W&P" },
  { name: "NordBit Solutions", abbr: "NB" },
  { name: "Elbe Ventures", abbr: "EV" },
  { name: "MainConsult", abbr: "MC" },
  { name: "Alpensoft GmbH", abbr: "AS" },
]

// ---------------------------------------------------------------------------
// Trust metrics
// ---------------------------------------------------------------------------

/**
 * Key stats demonstrating scale, speed, and reach.
 * Placeholder — replace with verified real numbers before launch.
 */
export const trustMetrics: TrustMetric[] = [
  {
    value: "300+",
    label: "Büros vermittelt",
    icon: "Building2",
  },
  {
    value: "500+",
    label: "Zufriedene Teams",
    icon: "Users",
  },
  {
    value: "4",
    label: "Städte",
    icon: "MapPin",
  },
  {
    value: "< 2 Std.",
    label: "Antwortzeit",
    icon: "Clock",
  },
]

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

/**
 * Three German-language client testimonials.
 * Covers distinct company types and cities for breadth of social proof.
 * Placeholder — replace with real client quotes before launch.
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "Wir hatten drei Wochen, um ein neues Berliner Büro für unser wachsendes Team zu finden. NextOffice hat uns innerhalb eines Tages vier passende Optionen präsentiert — alle mit den richtigen Flächen und im Budget. Der Umzug lief reibungslos.",
    name: "Lena Hartmann",
    role: "Head of People",
    companyType: "Tech-Startup",
    city: "Berlin",
  },
  {
    quote:
      "Als wir unser Hamburger Büro erweitern mussten, war der Markt sehr eng. Das NextOffice-Team hat Standorte aufgetan, die wir selbst nie gefunden hätten. Die Beratung war direkt, ohne Umwege — genau das, was wir von einem Makler erwarten.",
    name: "Thomas Krüger",
    role: "Office Manager",
    companyType: "Beratungsunternehmen",
    city: "Hamburg",
  },
  {
    quote:
      "Für unsere Frankfurter Niederlassung brauchten wir eine repräsentative Adresse nahe dem Bankenviertel. NextOffice hat unsere Anforderungen verstanden und uns Optionen gezeigt, die zu unserem Image passen. Alles war transparent und kostenlos.",
    name: "Sabine Meier",
    role: "CFO",
    companyType: "Finanzdienstleister",
    city: "Frankfurt",
  },
]

// ---------------------------------------------------------------------------
// Trust badges
// ---------------------------------------------------------------------------

/**
 * Trust and reassurance badges covering DSGVO, SSL, free service, and personal support.
 * Placeholder — verify actual compliance status before launch.
 */
export const trustBadges: TrustBadge[] = [
  {
    label: "Kostenlos & unverbindlich",
    description: "Unser Service ist für Unternehmen vollständig kostenfrei.",
    icon: "Gift",
  },
  {
    label: "DSGVO-konform",
    description: "Ihre Daten werden ausschließlich gemäß DSGVO verarbeitet.",
    icon: "ShieldCheck",
  },
  {
    label: "SSL-verschlüsselt",
    description: "Alle Übertragungen sind durch 256-Bit-Verschlüsselung gesichert.",
    icon: "Lock",
  },
  {
    label: "Persönliche Beratung",
    description: "Ein echter Berater begleitet Sie vom ersten Kontakt bis zum Abschluss.",
    icon: "UserCheck",
  },
]
