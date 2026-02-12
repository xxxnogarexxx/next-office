"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { getCityBySlug, getListingsByCity, listings as allListings } from "@/lib/mock-data";
import { ListingCard } from "@/components/listing-card";
import { SearchMap } from "@/components/search-map";
import { SearchFilters } from "@/components/search-filters";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CitySearchPage() {
  const params = useParams();
  const citySlug = params.city as string;
  const city = getCityBySlug(citySlug);
  const cityListings = getListingsByCity(citySlug);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  // If city not found, show all listings (could be an invalid slug)
  const displayListings = cityListings.length > 0 ? cityListings : allListings;
  const cityName = city?.name ?? citySlug;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* City header */}
      <div className="border-b bg-white px-4 py-3">
        <h1 className="text-xl font-bold">
          Büro {cityName}
        </h1>
        <p className="text-sm text-body">
          {displayListings.length} Büros in {cityName} verfügbar
        </p>
      </div>

      <SearchFilters />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Listing cards */}
        <div
          className={`flex-1 overflow-y-auto scrollbar-hide p-4 ${
            showMap ? "hidden lg:block" : ""
          }`}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {displayListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onHover={setHoveredId}
              />
            ))}
          </div>
        </div>

        {/* Map */}
        <div
          className={`${
            showMap ? "flex" : "hidden lg:flex"
          } w-full flex-1 lg:w-1/2 lg:max-w-[50%]`}
        >
          <SearchMap
            listings={displayListings}
            hoveredId={hoveredId}
            center={city ? { lat: city.latitude, lng: city.longitude } : undefined}
          />
        </div>

        {/* Mobile map toggle */}
        <div className="fixed bottom-6 left-1/2 z-10 -translate-x-1/2 lg:hidden">
          <Button
            onClick={() => setShowMap(!showMap)}
            className="gap-2 rounded-full shadow-lg"
          >
            <Map className="h-4 w-4" />
            {showMap ? "Liste anzeigen" : "Karte anzeigen"}
          </Button>
        </div>
      </div>
    </div>
  );
}
