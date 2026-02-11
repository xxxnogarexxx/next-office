export interface Listing {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: "private_office" | "coworking";
  city: string;
  citySlug: string;
  country: string;
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  capacityMin: number;
  capacityMax: number;
  priceFrom: number;
  priceTo: number;
  areaSqm: number;
  amenities: string[];
  photos: string[];
  coverPhoto: string;
  providerName: string;
  providerWebsite: string;
  featured: boolean;
}

export interface City {
  name: string;
  slug: string;
  country: string;
  listingCount: number;
  image: string;
  latitude: number;
  longitude: number;
}

export const cities: City[] = [
  {
    name: "Berlin",
    slug: "berlin",
    country: "Deutschland",
    listingCount: 48,
    image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&h=400&fit=crop",
    latitude: 52.52,
    longitude: 13.405,
  },
  {
    name: "München",
    slug: "muenchen",
    country: "Deutschland",
    listingCount: 35,
    image: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=600&h=400&fit=crop",
    latitude: 48.1351,
    longitude: 11.582,
  },
  {
    name: "Hamburg",
    slug: "hamburg",
    country: "Deutschland",
    listingCount: 29,
    image: "https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=600&h=400&fit=crop",
    latitude: 53.5511,
    longitude: 9.9937,
  },
  {
    name: "Frankfurt",
    slug: "frankfurt",
    country: "Deutschland",
    listingCount: 22,
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&h=400&fit=crop",
    latitude: 50.1109,
    longitude: 8.6821,
  },
];

export const listings: Listing[] = [
  {
    id: "1",
    name: "SPACES Potsdamer Platz",
    slug: "spaces-potsdamer-platz",
    description:
      "Moderne Büroflächen direkt am Potsdamer Platz mit Blick über die Berliner Skyline. Voll ausgestattete Private Offices für Teams von 2 bis 50 Personen. Flexible Mietverträge ab 3 Monaten. Inklusive High-Speed-Internet, Meetingräume und Community Events.",
    type: "private_office",
    city: "Berlin",
    citySlug: "berlin",
    country: "Deutschland",
    address: "Potsdamer Platz 1",
    postalCode: "10785",
    latitude: 52.5096,
    longitude: 13.3761,
    capacityMin: 2,
    capacityMax: 50,
    priceFrom: 499,
    priceTo: 4999,
    areaSqm: 1200,
    amenities: [
      "WLAN",
      "Meetingräume",
      "Küche",
      "24/7 Zugang",
      "Empfang",
      "Möbliert",
      "Barrierearm",
      "Fahrradstellplätze",
      "Duschen",
      "Telefonkabinen",
    ],
    photos: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&h=600&fit=crop",
    ],
    coverPhoto:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    providerName: "Spaces",
    providerWebsite: "https://spaces.com",
    featured: true,
  },
  {
    id: "2",
    name: "Design Offices Arnulfpark",
    slug: "design-offices-arnulfpark",
    description:
      "Premium Office Spaces im Herzen von München. Design Offices bietet hochwertige Arbeitsplätze in inspirierender Umgebung. Vom Einzelbüro bis zum Team Office — flexible Lösungen für wachsende Unternehmen.",
    type: "private_office",
    city: "München",
    citySlug: "muenchen",
    country: "Deutschland",
    address: "Arnulfstraße 60",
    postalCode: "80335",
    latitude: 48.1432,
    longitude: 11.5378,
    capacityMin: 1,
    capacityMax: 30,
    priceFrom: 599,
    priceTo: 5499,
    areaSqm: 800,
    amenities: [
      "WLAN",
      "Meetingräume",
      "Küche",
      "Empfang",
      "Möbliert",
      "Parkplätze",
      "Telefonkabinen",
      "Event-Fläche",
    ],
    photos: [
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=600&fit=crop",
    ],
    coverPhoto:
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop",
    providerName: "Design Offices",
    providerWebsite: "https://designoffices.de",
    featured: true,
  },
  {
    id: "3",
    name: "Mindspace Rödingsmarkt",
    slug: "mindspace-roedingsmarkt",
    description:
      "Stilvolle Büroräume im historischen Hamburger Kontorhausviertel. Mindspace verbindet designorientierte Arbeitsflächen mit erstklassigem Service. Ideal für Teams, die Wert auf Ästhetik und Produktivität legen.",
    type: "private_office",
    city: "Hamburg",
    citySlug: "hamburg",
    country: "Deutschland",
    address: "Rödingsmarkt 9",
    postalCode: "20459",
    latitude: 53.5488,
    longitude: 9.9872,
    capacityMin: 3,
    capacityMax: 40,
    priceFrom: 549,
    priceTo: 4199,
    areaSqm: 950,
    amenities: [
      "WLAN",
      "Meetingräume",
      "Küche",
      "24/7 Zugang",
      "Empfang",
      "Möbliert",
      "Duschen",
      "Fahrradstellplätze",
    ],
    photos: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&h=600&fit=crop",
    ],
    coverPhoto:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
    providerName: "Mindspace",
    providerWebsite: "https://mindspace.me",
    featured: false,
  },
  {
    id: "4",
    name: "WeWork Goetheplatz",
    slug: "wework-goetheplatz",
    description:
      "WeWork am Goetheplatz bietet flexible Bürolösungen im Frankfurter Bankenviertel. Perfekt für Unternehmen jeder Größe — von Startups bis Corporates. All-inclusive-Paket mit Community-Manager vor Ort.",
    type: "private_office",
    city: "Frankfurt",
    citySlug: "frankfurt",
    country: "Deutschland",
    address: "Goetheplatz 5",
    postalCode: "60311",
    latitude: 50.1105,
    longitude: 8.6753,
    capacityMin: 1,
    capacityMax: 80,
    priceFrom: 449,
    priceTo: 6999,
    areaSqm: 2000,
    amenities: [
      "WLAN",
      "Meetingräume",
      "Küche",
      "24/7 Zugang",
      "Empfang",
      "Möbliert",
      "Barrierearm",
      "Parkplätze",
      "Duschen",
      "Telefonkabinen",
      "Event-Fläche",
    ],
    photos: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1562664377-709f2c337eb2?w=800&h=600&fit=crop",
    ],
    coverPhoto:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
    providerName: "WeWork",
    providerWebsite: "https://wework.com",
    featured: true,
  },
  {
    id: "5",
    name: "Factory Berlin Görlitzer Park",
    slug: "factory-berlin-goerlitzer-park",
    description:
      "Factory Berlin ist mehr als ein Büro — es ist ein Campus für Innovation. Großzügige Flächen, Tech-Community und regelmäßige Events. Private Offices mit direktem Zugang zum Factory-Netzwerk aus 3.000+ Mitgliedern.",
    type: "private_office",
    city: "Berlin",
    citySlug: "berlin",
    country: "Deutschland",
    address: "Lohmühlenstraße 65",
    postalCode: "12435",
    latitude: 52.4935,
    longitude: 13.4365,
    capacityMin: 5,
    capacityMax: 100,
    priceFrom: 699,
    priceTo: 8999,
    areaSqm: 3000,
    amenities: [
      "WLAN",
      "Meetingräume",
      "Küche",
      "24/7 Zugang",
      "Möbliert",
      "Fahrradstellplätze",
      "Duschen",
      "Event-Fläche",
      "Telefonkabinen",
    ],
    photos: [
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
    ],
    coverPhoto:
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop",
    providerName: "Factory Berlin",
    providerWebsite: "https://factoryberlin.com",
    featured: false,
  },
  {
    id: "6",
    name: "Regus Alte Oper",
    slug: "regus-alte-oper",
    description:
      "Professionelle Büroräume in bester Frankfurter Lage neben der Alten Oper. Regus bietet sofort bezugsfertige Offices mit Full-Service-Ausstattung. Flexible Laufzeiten ab 1 Monat möglich.",
    type: "private_office",
    city: "Frankfurt",
    citySlug: "frankfurt",
    country: "Deutschland",
    address: "Bockenheimer Landstraße 2-4",
    postalCode: "60306",
    latitude: 50.1155,
    longitude: 8.671,
    capacityMin: 1,
    capacityMax: 20,
    priceFrom: 399,
    priceTo: 2999,
    areaSqm: 600,
    amenities: [
      "WLAN",
      "Meetingräume",
      "Küche",
      "Empfang",
      "Möbliert",
      "Barrierearm",
      "Parkplätze",
    ],
    photos: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556761175-5b200aca171c?w=800&h=600&fit=crop",
    ],
    coverPhoto:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
    providerName: "Regus",
    providerWebsite: "https://regus.de",
    featured: false,
  },
];

export function getListingsByCity(citySlug: string): Listing[] {
  return listings.filter((l) => l.citySlug === citySlug);
}

export function getListingBySlug(slug: string): Listing | undefined {
  return listings.find((l) => l.slug === slug);
}

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}
