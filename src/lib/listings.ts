import type { Listing, City } from "./types";
import listingsData from "@/data/listings.json";
import citiesData from "@/data/cities.json";

export type { Listing, City };

export const listings: Listing[] = listingsData as Listing[];
export const cities: City[] = citiesData as City[];

export function getListingsByCity(citySlug: string): Listing[] {
  return listings.filter((l) => l.citySlug === citySlug);
}

export function getListingBySlug(slug: string): Listing | undefined {
  return listings.find((l) => l.slug === slug);
}

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
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
