import { getCityBySlug, getCardListingsByCity, cardListings } from "@/lib/listings";
import { cities } from "@/lib/cities";
import { CityListingsClient } from "@/components/city-listings-client";

interface PageProps {
  params: Promise<{ city: string }>;
}

export function generateStaticParams() {
  return cities.map((city) => ({ city: city.slug }));
}

export default async function CitySearchPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  const cityListings = getCardListingsByCity(citySlug);

  // If city not found or no listings for this slug, show all listings
  const displayListings = cityListings.length > 0 ? cityListings : cardListings;
  const cityName = city?.name ?? citySlug;

  return (
    <CityListingsClient
      listings={displayListings}
      cityName={cityName}
      citySlug={citySlug}
      center={city ? { lat: city.latitude, lng: city.longitude } : undefined}
    />
  );
}
