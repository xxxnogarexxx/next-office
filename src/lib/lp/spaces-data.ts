/**
 * Featured coworking spaces data and city intro content for LP pages.
 *
 * Provides curated space listings (6-9 per city) and warm city intro copy
 * for the Improved Listing variant. Designed to give the page a "curated
 * marketplace" feel — broker as expert curator, not exhaustive directory.
 *
 * Content direction:
 * - German, formal (Sie) with a warm, professional tone
 * - Placeholder — realistic and production-ready, designed to be swapped
 *   for real partner space data before launch
 * - Photos use placeholder paths — real images required before launch
 *
 * Coordinates: real lat/lng within each city's center area for Mapbox pins.
 *
 * Server-safe: no React, no browser APIs.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A single featured coworking space for the improved listing variant.
 */
export interface FeaturedSpace {
  /** Unique ID, e.g. "berlin-space-01". */
  id: string;
  /** Space name — realistic German coworking brand. */
  name: string;
  /** City district, e.g. "Kreuzberg". */
  district: string;
  /** City slug matching LPCity.slug. */
  city: string;
  /** Team capacity range, e.g. "2–15 Personen". */
  capacity: string;
  /** Monthly price range, e.g. "ab 350 €/Monat". */
  priceRange: string;
  /** Short price label for map pin, e.g. "ab 350 €". */
  priceLabel: string;
  /** Top 2–3 amenities, e.g. ["WLAN", "Meetingräume", "Küche"]. */
  amenities: string[];
  /**
   * 2–3 placeholder photo paths.
   * NOTE: replace with real partner images before launch.
   */
  photos: string[];
  /** [lng, lat] — real coordinates within the city district for Mapbox. */
  coordinates: [number, number];
  /** When true, renders a "Top-Empfehlung" badge on the card. */
  highlighted?: boolean;
}

/**
 * City-level intro copy shown above the space listings.
 */
export interface CityIntroContent {
  /** City slug — matches LP city slugs. */
  slug: string;
  /** Section headline, e.g. "Coworking & Büros in Berlin". */
  headline: string;
  /** 2–3 sentences about the city's coworking landscape, Sie-formal. */
  description: string;
  /** 3–4 district highlights displayed as pills. */
  highlights: string[];
  /** Average monthly price range, e.g. "300 € – 1.200 €/Monat". */
  avgPriceRange: string;
}

// ---------------------------------------------------------------------------
// Featured Spaces
// ---------------------------------------------------------------------------

/**
 * Curated featured spaces keyed by city slug.
 * 6–9 spaces per city with realistic names, districts, pricing, and
 * Mapbox-compatible coordinates.
 *
 * Placeholder — photos use `/images/spaces/placeholder-0X.jpg` paths
 * that need real images before launch.
 */
const featuredSpaces: Record<string, FeaturedSpace[]> = {
  berlin: [
    {
      id: "berlin-space-01",
      name: "Kreuzbase Offices",
      district: "Kreuzberg",
      city: "berlin",
      capacity: "2–20 Personen",
      priceRange: "ab 380 €/Monat",
      priceLabel: "ab 380 €",
      amenities: ["WLAN", "Meetingräume", "Dachterrasse"],
      photos: [
        "/images/spaces/placeholder-01.jpg",
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [13.4088, 52.4993],
      highlighted: true,
    },
    {
      id: "berlin-space-02",
      name: "Mitte Works",
      district: "Mitte",
      city: "berlin",
      capacity: "5–50 Personen",
      priceRange: "ab 550 €/Monat",
      priceLabel: "ab 550 €",
      amenities: ["WLAN", "Rezeption", "Parkplätze"],
      photos: [
        "/images/spaces/placeholder-01.jpg",
        "/images/spaces/placeholder-02.jpg",
      ],
      coordinates: [13.3924, 52.5231],
    },
    {
      id: "berlin-space-03",
      name: "Friedrichshain Hub",
      district: "Friedrichshain",
      city: "berlin",
      capacity: "2–15 Personen",
      priceRange: "ab 320 €/Monat",
      priceLabel: "ab 320 €",
      amenities: ["WLAN", "Küche", "Lounge"],
      photos: [
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [13.4542, 52.5118],
    },
    {
      id: "berlin-space-04",
      name: "Prenzl Berg Studio",
      district: "Prenzlauer Berg",
      city: "berlin",
      capacity: "2–10 Personen",
      priceRange: "ab 350 €/Monat",
      priceLabel: "ab 350 €",
      amenities: ["WLAN", "Meetingräume", "Fahrradkeller"],
      photos: [
        "/images/spaces/placeholder-01.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [13.4205, 52.5376],
      highlighted: true,
    },
    {
      id: "berlin-space-05",
      name: "Charlottenburg Business Center",
      district: "Charlottenburg",
      city: "berlin",
      capacity: "5–40 Personen",
      priceRange: "ab 650 €/Monat",
      priceLabel: "ab 650 €",
      amenities: ["WLAN", "Rezeption", "Konferenzräume"],
      photos: [
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-01.jpg",
      ],
      coordinates: [13.3133, 52.5063],
    },
    {
      id: "berlin-space-06",
      name: "XBERG Cowork",
      district: "Kreuzberg",
      city: "berlin",
      capacity: "1–8 Personen",
      priceRange: "ab 300 €/Monat",
      priceLabel: "ab 300 €",
      amenities: ["WLAN", "Küche", "Drucker"],
      photos: [
        "/images/spaces/placeholder-03.jpg",
        "/images/spaces/placeholder-01.jpg",
      ],
      coordinates: [13.4034, 52.4949],
    },
    {
      id: "berlin-space-07",
      name: "Mitte Premium Suites",
      district: "Mitte",
      city: "berlin",
      capacity: "10–80 Personen",
      priceRange: "ab 900 €/Monat",
      priceLabel: "ab 900 €",
      amenities: ["WLAN", "Empfang", "Catering-Service"],
      photos: [
        "/images/spaces/placeholder-01.jpg",
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [13.3786, 52.5244],
    },
    {
      id: "berlin-space-08",
      name: "Neukölln Kreativ",
      district: "Neukölln",
      city: "berlin",
      capacity: "2–12 Personen",
      priceRange: "ab 280 €/Monat",
      priceLabel: "ab 280 €",
      amenities: ["WLAN", "Küche", "Eventspace"],
      photos: [
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [13.4378, 52.4769],
    },
  ],

  hamburg: [
    {
      id: "hamburg-space-01",
      name: "Schanze Office Collective",
      district: "Schanzenviertel",
      city: "hamburg",
      capacity: "2–20 Personen",
      priceRange: "ab 420 €/Monat",
      priceLabel: "ab 420 €",
      amenities: ["WLAN", "Meetingräume", "Dachterrasse"],
      photos: [
        "/images/spaces/placeholder-01.jpg",
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [9.9656, 53.5632],
      highlighted: true,
    },
    {
      id: "hamburg-space-02",
      name: "HafenCity Works",
      district: "HafenCity",
      city: "hamburg",
      capacity: "5–60 Personen",
      priceRange: "ab 700 €/Monat",
      priceLabel: "ab 700 €",
      amenities: ["WLAN", "Elbblick", "Rezeption"],
      photos: [
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-01.jpg",
      ],
      coordinates: [10.0011, 53.5413],
      highlighted: true,
    },
    {
      id: "hamburg-space-03",
      name: "Altona Studio",
      district: "Altona",
      city: "hamburg",
      capacity: "2–15 Personen",
      priceRange: "ab 380 €/Monat",
      priceLabel: "ab 380 €",
      amenities: ["WLAN", "Küche", "Fahrradstellplätze"],
      photos: [
        "/images/spaces/placeholder-03.jpg",
        "/images/spaces/placeholder-02.jpg",
      ],
      coordinates: [9.9341, 53.5499],
    },
    {
      id: "hamburg-space-04",
      name: "St. Pauli Flex",
      district: "St. Pauli",
      city: "hamburg",
      capacity: "1–10 Personen",
      priceRange: "ab 350 €/Monat",
      priceLabel: "ab 350 €",
      amenities: ["WLAN", "Lounge", "Drucker"],
      photos: [
        "/images/spaces/placeholder-01.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [9.9609, 53.5540],
    },
    {
      id: "hamburg-space-05",
      name: "Eimsbüttel Office Park",
      district: "Eimsbüttel",
      city: "hamburg",
      capacity: "5–35 Personen",
      priceRange: "ab 500 €/Monat",
      priceLabel: "ab 500 €",
      amenities: ["WLAN", "Meetingräume", "Parkplätze"],
      photos: [
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-01.jpg",
      ],
      coordinates: [9.9539, 53.5761],
    },
    {
      id: "hamburg-space-06",
      name: "Hamburger Berg Cowork",
      district: "Schanzenviertel",
      city: "hamburg",
      capacity: "2–8 Personen",
      priceRange: "ab 360 €/Monat",
      priceLabel: "ab 360 €",
      amenities: ["WLAN", "Küche", "Community Events"],
      photos: [
        "/images/spaces/placeholder-03.jpg",
        "/images/spaces/placeholder-01.jpg",
      ],
      coordinates: [9.9573, 53.5571],
    },
    {
      id: "hamburg-space-07",
      name: "Speicherstadt Business Hub",
      district: "HafenCity",
      city: "hamburg",
      capacity: "10–100 Personen",
      priceRange: "ab 850 €/Monat",
      priceLabel: "ab 850 €",
      amenities: ["WLAN", "Konferenzräume", "Catering"],
      photos: [
        "/images/spaces/placeholder-01.jpg",
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [9.9939, 53.5441],
    },
  ],

  muenchen: [
    {
      id: "muenchen-space-01",
      name: "Maxvorstadt Loft Offices",
      district: "Maxvorstadt",
      city: "muenchen",
      capacity: "2–25 Personen",
      priceRange: "ab 500 €/Monat",
      priceLabel: "ab 500 €",
      amenities: ["WLAN", "Meetingräume", "Tiefgarage"],
      photos: [
        "/images/spaces/placeholder-01.jpg",
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [11.5685, 48.1491],
      highlighted: true,
    },
    {
      id: "muenchen-space-02",
      name: "Schwabing Premium Center",
      district: "Schwabing",
      city: "muenchen",
      capacity: "10–80 Personen",
      priceRange: "ab 850 €/Monat",
      priceLabel: "ab 850 €",
      amenities: ["WLAN", "Empfang", "Kantine"],
      photos: [
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-01.jpg",
      ],
      coordinates: [11.5763, 48.1611],
      highlighted: true,
    },
    {
      id: "muenchen-space-03",
      name: "Glockenbachviertel Studio",
      district: "Glockenbachviertel",
      city: "muenchen",
      capacity: "2–12 Personen",
      priceRange: "ab 450 €/Monat",
      priceLabel: "ab 450 €",
      amenities: ["WLAN", "Küche", "Dachterrasse"],
      photos: [
        "/images/spaces/placeholder-03.jpg",
        "/images/spaces/placeholder-02.jpg",
      ],
      coordinates: [11.5612, 48.1294],
    },
    {
      id: "muenchen-space-04",
      name: "Au-Haidhausen Works",
      district: "Au-Haidhausen",
      city: "muenchen",
      capacity: "3–20 Personen",
      priceRange: "ab 480 €/Monat",
      priceLabel: "ab 480 €",
      amenities: ["WLAN", "Meetingräume", "Lounge"],
      photos: [
        "/images/spaces/placeholder-01.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [11.5895, 48.1305],
    },
    {
      id: "muenchen-space-05",
      name: "Werksviertel Innovation Hub",
      district: "Werksviertel",
      city: "muenchen",
      capacity: "5–60 Personen",
      priceRange: "ab 600 €/Monat",
      priceLabel: "ab 600 €",
      amenities: ["WLAN", "Events", "Dachgarten"],
      photos: [
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-01.jpg",
      ],
      coordinates: [11.6063, 48.1244],
    },
    {
      id: "muenchen-space-06",
      name: "Isarvorstadt Office Space",
      district: "Isarvorstadt",
      city: "muenchen",
      capacity: "2–15 Personen",
      priceRange: "ab 420 €/Monat",
      priceLabel: "ab 420 €",
      amenities: ["WLAN", "Küche", "Fahrradstellplätze"],
      photos: [
        "/images/spaces/placeholder-03.jpg",
        "/images/spaces/placeholder-01.jpg",
      ],
      coordinates: [11.5701, 48.1305],
    },
    {
      id: "muenchen-space-07",
      name: "Maxvorstadt Executive Suites",
      district: "Maxvorstadt",
      city: "muenchen",
      capacity: "15–120 Personen",
      priceRange: "ab 1.200 €/Monat",
      priceLabel: "ab 1.200 €",
      amenities: ["WLAN", "Konferenzräume", "Concierge"],
      photos: [
        "/images/spaces/placeholder-01.jpg",
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [11.5715, 48.1519],
    },
  ],

  frankfurt: [
    {
      id: "frankfurt-space-01",
      name: "Bahnhofsviertel Flex Hub",
      district: "Bahnhofsviertel",
      city: "frankfurt",
      capacity: "2–30 Personen",
      priceRange: "ab 400 €/Monat",
      priceLabel: "ab 400 €",
      amenities: ["WLAN", "Meetingräume", "24h-Zugang"],
      photos: [
        "/images/spaces/placeholder-01.jpg",
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [8.6691, 50.1093],
      highlighted: true,
    },
    {
      id: "frankfurt-space-02",
      name: "Nordend Business Center",
      district: "Nordend",
      city: "frankfurt",
      capacity: "5–40 Personen",
      priceRange: "ab 550 €/Monat",
      priceLabel: "ab 550 €",
      amenities: ["WLAN", "Rezeption", "Tiefgarage"],
      photos: [
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-01.jpg",
      ],
      coordinates: [8.6879, 50.1271],
      highlighted: true,
    },
    {
      id: "frankfurt-space-03",
      name: "Sachsenhausen Office Collective",
      district: "Sachsenhausen",
      city: "frankfurt",
      capacity: "2–15 Personen",
      priceRange: "ab 380 €/Monat",
      priceLabel: "ab 380 €",
      amenities: ["WLAN", "Küche", "Balkon"],
      photos: [
        "/images/spaces/placeholder-03.jpg",
        "/images/spaces/placeholder-02.jpg",
      ],
      coordinates: [8.6841, 50.0991],
    },
    {
      id: "frankfurt-space-04",
      name: "Westend Premium Tower",
      district: "Westend",
      city: "frankfurt",
      capacity: "10–100 Personen",
      priceRange: "ab 950 €/Monat",
      priceLabel: "ab 950 €",
      amenities: ["WLAN", "Skyline-Blick", "Concierge"],
      photos: [
        "/images/spaces/placeholder-01.jpg",
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [8.6643, 50.1194],
    },
    {
      id: "frankfurt-space-05",
      name: "Ostend Creative Studios",
      district: "Ostend",
      city: "frankfurt",
      capacity: "2–20 Personen",
      priceRange: "ab 350 €/Monat",
      priceLabel: "ab 350 €",
      amenities: ["WLAN", "Eventspace", "Lounge"],
      photos: [
        "/images/spaces/placeholder-02.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [8.7083, 50.1121],
    },
    {
      id: "frankfurt-space-06",
      name: "Innenstadt City Office",
      district: "Innenstadt",
      city: "frankfurt",
      capacity: "5–50 Personen",
      priceRange: "ab 700 €/Monat",
      priceLabel: "ab 700 €",
      amenities: ["WLAN", "Konferenzräume", "Empfang"],
      photos: [
        "/images/spaces/placeholder-01.jpg",
        "/images/spaces/placeholder-03.jpg",
      ],
      coordinates: [8.6821, 50.1109],
    },
  ],
}

// ---------------------------------------------------------------------------
// City Intros
// ---------------------------------------------------------------------------

/**
 * City intro copy keyed by city slug.
 * Warm, expert-curator tone — broker as trusted guide, not hard sell.
 */
const cityIntros: Record<string, CityIntroContent> = {
  berlin: {
    slug: "berlin",
    headline: "Coworking & Büros in Berlin",
    description:
      "Berlin bietet Deutschlands lebendigsten Coworking-Markt — von kreativen Lofts in Kreuzberg bis zu professionellen Business Centern in Mitte und Charlottenburg. Als Ihre Bürobroker kennen wir die besten Standorte persönlich und finden das passende Umfeld für Ihr Team. Die meisten unserer Kunden sind in 2–3 Werktagen eingezogen.",
    highlights: [
      "Kreuzberg",
      "Mitte",
      "Friedrichshain",
      "Prenzlauer Berg",
      "Charlottenburg",
    ],
    avgPriceRange: "300 € – 1.000 €/Monat",
  },
  hamburg: {
    slug: "hamburg",
    headline: "Coworking & Büros in Hamburg",
    description:
      "Hamburg vereint hanseatische Tradition mit modernem Arbeiten: von kreativen Spaces im Schanzenviertel bis zu repräsentativen Büros in der HafenCity mit Elbblick. Unsere Berater kennen den Hamburger Markt im Detail und vermitteln Ihnen den passenden Standort — kostenlos und unverbindlich.",
    highlights: [
      "Schanzenviertel",
      "HafenCity",
      "Altona",
      "St. Pauli",
      "Eimsbüttel",
    ],
    avgPriceRange: "350 € – 900 €/Monat",
  },
  muenchen: {
    slug: "muenchen",
    headline: "Coworking & Büros in München",
    description:
      "München ist Deutschlands Premiumstandort für Unternehmen — mit erstklassigen Bürolagen in Maxvorstadt, Schwabing und dem wachsenden Werksviertel. Ob junges Team oder etabliertes Unternehmen: Wir finden die repräsentative Adresse, die zu Ihrem Image und Budget passt.",
    highlights: [
      "Maxvorstadt",
      "Schwabing",
      "Glockenbachviertel",
      "Au-Haidhausen",
      "Werksviertel",
    ],
    avgPriceRange: "400 € – 1.200 €/Monat",
  },
  frankfurt: {
    slug: "frankfurt",
    headline: "Coworking & Büros in Frankfurt",
    description:
      "Frankfurt ist das Tor zur europäischen Finanzwelt — mit erstklassigen Büroflächen im Bahnhofsviertel, Westend und Nordend. Von flexiblen Coworking Desks bis zu repräsentativen Suiten im Bankenviertel: Wir vermitteln Ihnen den Standort, der zu Ihrem Unternehmen passt.",
    highlights: [
      "Bahnhofsviertel",
      "Westend",
      "Nordend",
      "Sachsenhausen",
      "Ostend",
    ],
    avgPriceRange: "350 € – 1.000 €/Monat",
  },
}

// ---------------------------------------------------------------------------
// Lookup functions
// ---------------------------------------------------------------------------

/**
 * Returns the featured spaces for a given city slug.
 * Returns an empty array if the slug is unknown.
 *
 * @param citySlug - The LP city slug (e.g., "berlin").
 * @returns Array of FeaturedSpace objects for the city.
 *
 * @example
 * getFeaturedSpaces("berlin").length // → 8
 * getFeaturedSpaces("unknown") // → []
 */
export function getFeaturedSpaces(citySlug: string): FeaturedSpace[] {
  return featuredSpaces[citySlug] ?? []
}

/**
 * Returns the city intro content for a given city slug.
 * Returns undefined if the slug is unknown.
 *
 * @param citySlug - The LP city slug (e.g., "berlin").
 * @returns CityIntroContent or undefined.
 *
 * @example
 * getCityIntro("berlin")?.headline // → "Coworking & Büros in Berlin"
 * getCityIntro("unknown") // → undefined
 */
export function getCityIntro(citySlug: string): CityIntroContent | undefined {
  return cityIntros[citySlug]
}
