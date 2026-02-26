export interface Listing {
  contentfulId: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  citySlug: string;
  country: string;
  address: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  capacityMin: number | null;
  capacityMax: number | null;
  priceFrom: number | null;
  priceTo: number | null;
  areaSqm: number | null;
  noticePeriod: string | null;
  amenities: string[];
  photos: string[];
  coverPhoto: string | null;
  providerName: string | null;
  providerWebsite: string | null;
  publicTransport: string | null;
  flexDeskPrice: number | null;
  fixedDeskPrice: number | null;
  privateOfficePrice: number | null;
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

export interface ListingCard {
  id: string;
  name: string;
  slug: string;
  city: string;
  citySlug: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  capacityMin: number | null;
  capacityMax: number | null;
  priceFrom: number | null;
  photos: string[];
  coverPhoto: string | null;
  providerName: string | null;
}
