import type { City } from "./types";
import citiesData from "@/data/cities.json";

export type { City };
export const cities: City[] = citiesData as City[];

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}
