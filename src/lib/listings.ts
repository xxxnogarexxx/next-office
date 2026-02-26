import type { Listing, ListingCard as ListingCardType, City } from "./types";
import listingsData from "@/data/listings.json";
import cardListingsData from "@/data/listings-card.json";
import { cities, getCityBySlug } from "./cities";

export type { Listing, ListingCardType as ListingCard, City };
export { cities, getCityBySlug };

// Full listings — only used by detail page and sitemap (server-side only)
export const listings: Listing[] = listingsData as Listing[];

// Card listings — lightweight, used by search/city pages
export const cardListings: ListingCardType[] = cardListingsData as ListingCardType[];

export function getListingsByCity(citySlug: string): Listing[] {
  return listings.filter((l) => l.citySlug === citySlug);
}

export function getCardListingsByCity(citySlug: string): ListingCardType[] {
  return cardListings.filter((l) => l.citySlug === citySlug);
}

export function getListingBySlug(slug: string): Listing | undefined {
  return listings.find((l) => l.slug === slug);
}

export function displayPrice(price: number | null): string {
  if (price === null) return "Auf Anfrage";
  return `ab ${price} €/Monat`;
}

export function displayCapacity(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${min}–${max} Personen`;
  if (max !== null) return `bis ${max} Personen`;
  if (min !== null) return `ab ${min} Personen`;
  return "Auf Anfrage";
}
