import { notFound } from "next/navigation";
import { getLPCity, getLPCities } from "@/lib/lp/cities";
import { getVariantComponent } from "@/lib/lp/variants";

interface PageProps {
  params: Promise<{ city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * City LP page — variant slot renderer.
 *
 * Looks up the city, resolves the variant component, and renders it
 * with city data + search params (UTM/keyword params for Phase 2+).
 *
 * The variant is hardcoded to "default" for Phase 1. Phase 3+ will
 * introduce variant selection logic here.
 */
export default async function CityLPPage({ params, searchParams }: PageProps) {
  const { city: citySlug } = await params;
  const rawSearchParams = await searchParams;

  const city = getLPCity(citySlug);
  if (!city) notFound();

  // Flatten multi-value search params to single strings (take first value)
  const flatSearchParams: Record<string, string | undefined> = Object.fromEntries(
    Object.entries(rawSearchParams).map(([k, v]) => [
      k,
      Array.isArray(v) ? v[0] : v,
    ])
  );

  const Variant = getVariantComponent("default");
  // Assign to a local constant so React sees a stable component reference.
  // eslint-disable-next-line react-hooks/static-components
  return <Variant city={city} searchParams={flatSearchParams} />;
}

/** Pre-render all 4 LP city pages at build time. */
export async function generateStaticParams() {
  const cities = getLPCities();
  return cities.map((city) => ({ city: city.slug }));
}
