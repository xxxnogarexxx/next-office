/**
 * LP city data adapter.
 *
 * Reads from the shared `src/data/cities.json` (single source of truth)
 * and exposes a focused interface for LP pages.
 *
 * To add a new LP city: add its slug to LP_CITY_SLUGS and ensure
 * the city exists in cities.json.
 */

import type { City } from "@/lib/types";
import citiesData from "@/data/cities.json";
import type { LPCity } from "./types";

const cities: City[] = citiesData as City[];

/** The 4 launch cities for LP pages. */
export const LP_CITY_SLUGS = ["berlin", "hamburg", "muenchen", "frankfurt"] as const;

export type LPCitySlug = (typeof LP_CITY_SLUGS)[number];

/** Maps a full City record to the leaner LPCity type. */
function toLPCity(city: City): LPCity {
  return {
    name: city.name,
    slug: city.slug,
    listingCount: city.listingCount,
    latitude: city.latitude,
    longitude: city.longitude,
  };
}

/**
 * Look up a city by slug. Returns undefined if the slug is not in
 * the LP city list or does not exist in the shared data source.
 */
export function getLPCity(slug: string): LPCity | undefined {
  if (!isValidLPCity(slug)) return undefined;
  const city = cities.find((c) => c.slug === slug);
  if (!city) return undefined;
  return toLPCity(city);
}

/** Returns all 4 LP cities in the order defined by LP_CITY_SLUGS. */
export function getLPCities(): LPCity[] {
  return LP_CITY_SLUGS.reduce<LPCity[]>((acc, slug) => {
    const city = cities.find((c) => c.slug === slug);
    if (city) acc.push(toLPCity(city));
    return acc;
  }, []);
}

/** Type guard — returns true only for valid LP city slugs. */
export function isValidLPCity(slug: string): slug is LPCitySlug {
  return (LP_CITY_SLUGS as readonly string[]).includes(slug);
}
