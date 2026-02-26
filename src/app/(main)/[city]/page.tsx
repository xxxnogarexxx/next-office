import { getCityBySlug, getCardListingsByCity } from "@/lib/listings";
import { cities } from "@/lib/cities";
import { CityListingsClient } from "@/components/city-listings-client";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ city: string }>;
}

export function generateStaticParams() {
  return cities.map((city) => ({ city: city.slug }));
}

export default async function CitySearchPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) notFound();

  const displayListings = getCardListingsByCity(citySlug);

  return (
    <CityListingsClient
      listings={displayListings}
      cityName={city.name}
      citySlug={citySlug}
      center={{ lat: city.latitude, lng: city.longitude }}
    />
  );
}
