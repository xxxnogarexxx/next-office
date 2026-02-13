"use client";

import { useState } from "react";
import { listings } from "@/lib/listings";
import { ListingCard } from "@/components/listing-card";
import { SearchMap } from "@/components/search-map";
import { SearchFilters } from "@/components/search-filters";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col">
      <SearchFilters />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Listing cards */}
        <div
          className={`flex-1 overflow-y-auto scrollbar-hide p-4 ${
            showMap ? "hidden lg:block" : ""
          }`}
        >
          <p className="mb-4 text-sm text-body">
            <span className="font-semibold text-foreground">
              {listings.length} Büros
            </span>{" "}
            gefunden
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {listings.map((listing) => (
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
          <SearchMap listings={listings} hoveredId={hoveredId} />
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
