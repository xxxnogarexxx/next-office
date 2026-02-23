/**
 * Static content data for LP content sections.
 *
 * Covers: how-it-works process steps, service benefits, pain point copy,
 * FAQ objection-handling pairs, and city-specific market stats.
 *
 * Content direction:
 * - German, formal (Sie) with a warm, conversational tone
 * - Placeholder — realistic and production-ready, designed to be swapped
 *   for verified real data before final launch
 * - No React — server-safe, pure TypeScript data
 *
 * Exported constants:
 *   howItWorksSteps  — 3-step Anfrage → Angebote → Besichtigung process
 *   benefits         — 4 service advantages over self-search
 *   painPointContent — Single headline + body for the problem section
 *   faqItems         — 8 Q&A pairs addressing key buyer objections
 *   cityStats        — Market stats for Berlin, Hamburg, München, Frankfurt
 */

// ---------------------------------------------------------------------------
// How It Works
// ---------------------------------------------------------------------------

/** A single step in the how-it-works process. */
export interface Step {
  /** 1-based step number. */
  number: number;
  /** Short step title, e.g. "Anfrage stellen". */
  title: string;
  /** 1–2 sentence description of what happens in this step. */
  description: string;
  /** Lucide icon name hint for the rendering component. */
  icon: string;
}

/**
 * 3-step process: Anfrage → Angebote → Besichtigung.
 * Explains the NextOffice broker model in plain terms.
 */
export const howItWorksSteps: Step[] = [
  {
    number: 1,
    title: "Anfrage stellen",
    description:
      "Schildern Sie uns in wenigen Minuten, was Ihr Team braucht: Teamgröße, gewünschter Standort, Budget und Starttermin. Kein Formular-Dschungel — nur die wesentlichen Angaben.",
    icon: "ClipboardList",
  },
  {
    number: 2,
    title: "Angebote erhalten",
    description:
      "Unsere Berater werten Ihre Anfrage aus und schicken Ihnen innerhalb von 2 Stunden passende Angebote — handverlesen, nicht algorithmisch gefiltert.",
    icon: "Inbox",
  },
  {
    number: 3,
    title: "Besichtigen & einziehen",
    description:
      "Wählen Sie Ihre Favoriten aus, vereinbaren Sie Besichtigungstermine und ziehen Sie ein — wir begleiten Sie bis zum Vertragsabschluss.",
    icon: "Building2",
  },
]

// ---------------------------------------------------------------------------
// Benefits
// ---------------------------------------------------------------------------

/** A single service benefit. */
export interface Benefit {
  /** Short benefit title, e.g. "Persönliche Beratung". */
  title: string;
  /** 2–3 sentence explanation of the benefit. */
  description: string;
  /** Lucide icon name hint for the rendering component. */
  icon: string;
}

/**
 * 4 core benefits of using NextOffice vs. searching alone.
 * Positioned around the key B2B objections: trust, cost, time, and value.
 */
export const benefits: Benefit[] = [
  {
    title: "Persönliche Beratung",
    description:
      "Kein Algorithmus, sondern ein echter Berater, der Ihre Anforderungen versteht. Wir kennen den Markt — und finden Büros, die zu Ihrer Unternehmenskultur passen.",
    icon: "UserCheck",
  },
  {
    title: "Komplett kostenlos",
    description:
      "Unser Service ist für Unternehmen vollständig kostenfrei. Die Vergütung erfolgt durch die Anbieter — Sie zahlen keinen Cent mehr als beim Direktkontakt.",
    icon: "BadgeCheck",
  },
  {
    title: "Stunden gespart",
    description:
      "Dutzende Anbieter recherchieren, vergleichen, verhandeln — das übernehmen wir für Sie. Was sonst Tage dauert, erledigen wir in wenigen Stunden.",
    icon: "Clock",
  },
  {
    title: "Beste Konditionen",
    description:
      "Durch unsere Volumina und langjährigen Partnerschaften verhandeln wir Konditionen, die Sie alleine kaum erzielen können. Bessere Preise, mehr Flexibilität.",
    icon: "TrendingDown",
  },
]

// ---------------------------------------------------------------------------
// Pain Point
// ---------------------------------------------------------------------------

/** Copy for the problem/solution contrast section. */
export interface PainPointContent {
  /** Large, punchy headline calling out the core problem. */
  headline: string;
  /** 2–3 sentences elaborating the problem and hinting at the solution. */
  body: string;
  /** CTA button text. */
  ctaText: string;
}

/**
 * Pain point copy — creates urgency by naming the problem directly.
 * Used in the dark-background contrast section.
 */
export const painPointContent: PainPointContent = {
  headline:
    "Stundenlang Listings durchsuchen? Das übernehmen wir für Sie.",
  body:
    "Die meisten Unternehmen verbringen Tage damit, Anbieter zu googeln, Preise zu vergleichen und auf Rückrufe zu warten — nur um am Ende trotzdem unsicher zu sein. Als Ihr Broker übernehmen wir genau diese Arbeit: schneller, günstiger, persönlicher.",
  ctaText: "Lassen Sie uns das für Sie erledigen",
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

/** A single FAQ question-answer pair. */
export interface FAQItem {
  /** German question text. */
  question: string;
  /** German answer (2–4 sentences). */
  answer: string;
}

/**
 * 8 FAQ pairs addressing key B2B buyer objections.
 * Topics: cost, commitment, timeline, process, viewings, cities, budget, team size.
 */
export const faqItems: FAQItem[] = [
  {
    question: "Ist der Service wirklich kostenlos für uns?",
    answer:
      "Ja, vollständig. NextOffice wird von den Büroanbietern vergütet, nicht von Ihnen. Sie zahlen keinen Aufschlag und keine Vermittlungsgebühr — weder für die Beratung noch beim Vertragsabschluss.",
  },
  {
    question: "Bin ich nach der Anfrage zu etwas verpflichtet?",
    answer:
      "Nein. Die Anfrage ist vollständig unverbindlich. Sie entscheiden nach Erhalt der Angebote, ob und wie Sie weiter vorgehen möchten. Kein Vertrag, keine versteckten Bedingungen.",
  },
  {
    question: "Wie schnell bekomme ich Angebote?",
    answer:
      "In der Regel innerhalb von 2 Stunden nach Ihrer Anfrage. Bei komplexeren Anforderungen oder knappem Marktangebot kann es bis zu einem Werktag dauern. Wir informieren Sie, falls es länger dauert.",
  },
  {
    question: "Was passiert nach meiner Anfrage?",
    answer:
      "Unser Team sichtet Ihre Angaben und erstellt eine Auswahl passender Angebote. Sie erhalten die Angebote per E-Mail mit Fotos, Preisen und Eckdaten. Danach besprechen wir gemeinsam, was zu Ihnen passt.",
  },
  {
    question: "Kann ich die Büros auch besichtigen?",
    answer:
      "Selbstverständlich. Wir organisieren Besichtigungstermine für alle Objekte, die Sie interessieren. Sie besuchen nur Büros, die bereits zu Ihren Anforderungen passen — kein Zeitverlust durch unpassende Besichtigungen.",
  },
  {
    question: "In welchen Städten sind Sie aktiv?",
    answer:
      "Aktuell vermitteln wir Büros in Berlin, Hamburg, München und Frankfurt. Weitere Städte sind in Planung — sprechen Sie uns gerne an, wenn Ihre Stadt noch nicht dabei ist.",
  },
  {
    question: "Gibt es ein Mindestbudget oder eine Mindestfläche?",
    answer:
      "Nein, wir haben keine Mindestanforderungen. Egal ob Sie 3 Arbeitsplätze oder 30 suchen — wir helfen Ihnen, das passende Angebot zu finden.",
  },
  {
    question: "Ab welcher Teamgröße lohnt sich NextOffice?",
    answer:
      "Bereits ab 2–3 Personen lohnt sich unsere Beratung. Gerade für kleine und mittlere Teams mit begrenzter Zeit ist der Aufwand der Eigenrecherche besonders hoch — genau da sparen Sie am meisten.",
  },
]

// ---------------------------------------------------------------------------
// City Stats
// ---------------------------------------------------------------------------

/** City-specific market statistics for the CityStats section. */
export interface CityStatsData {
  /** City slug — matches LP city slugs ("berlin", "hamburg", "muenchen", "frankfurt"). */
  slug: string;
  /** Available space count as a display string, e.g. "300+". */
  availableSpaces: string;
  /** Top districts in this city, displayed as badges. */
  popularDistricts: string[];
  /** Price range as display string, e.g. "ab 350 € / Arbeitsplatz". */
  priceRange: string;
  /** One-sentence market summary or USP for this city. */
  marketHighlight: string;
}

/**
 * Static city market stats — placeholder, designed to be replaced with
 * real data before launch.
 */
export const cityStats: CityStatsData[] = [
  {
    slug: "berlin",
    availableSpaces: "300+",
    popularDistricts: ["Mitte", "Kreuzberg", "Charlottenburg", "Friedrichshain"],
    priceRange: "ab 350 € / Arbeitsplatz",
    marketHighlight:
      "Berlins Startup-Szene macht die Stadt zum flexibelsten Büromarkt Deutschlands — mit dem breitesten Angebot von kreativ bis premium.",
  },
  {
    slug: "hamburg",
    availableSpaces: "150+",
    popularDistricts: ["HafenCity", "Altstadt", "St. Pauli", "Eimsbüttel"],
    priceRange: "ab 400 € / Arbeitsplatz",
    marketHighlight:
      "Hamburg bietet erstklassige Office-Lagen zwischen HafenCity und Innenstadt — ideal für Unternehmen mit internationalem Fokus.",
  },
  {
    slug: "muenchen",
    availableSpaces: "200+",
    popularDistricts: ["Schwabing", "Maxvorstadt", "Bogenhausen", "Glockenbachviertel"],
    priceRange: "ab 450 € / Arbeitsplatz",
    marketHighlight:
      "München ist Deutschlands Standort für Tech, Life Sciences und Headquarters — premium Lagen mit repräsentativer Adresse.",
  },
  {
    slug: "frankfurt",
    availableSpaces: "180+",
    popularDistricts: ["Bankenviertel", "Westend", "Sachsenhausen", "Bornheim"],
    priceRange: "ab 380 € / Arbeitsplatz",
    marketHighlight:
      "Frankfurt ist Europas Finanzmetropole — mit erstklassigen Bürolagen für Kanzleien, Finanzdienstleister und internationale Unternehmen.",
  },
]

/**
 * Look up city stats by slug.
 * Returns undefined if the slug has no stats entry.
 */
export function getCityStats(slug: string): CityStatsData | undefined {
  return cityStats.find((c) => c.slug === slug)
}
