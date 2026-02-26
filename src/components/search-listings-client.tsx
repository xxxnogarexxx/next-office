"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { SearchMap } from "@/components/search-map";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ListingCard as ListingCardData } from "@/lib/types";

interface SearchListingsClientProps {
  listings: ListingCardData[];
}

export function SearchListingsClient({ listings }: SearchListingsClientProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const isDesktop = useRef(false);

  useEffect(() => {
    isDesktop.current = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop.current) {
      let idleId: number;
      const mountMap = () => {
        idleId = requestIdleCallback(() => setMapReady(true));
      };
      if (document.readyState === "complete") {
        mountMap();
      } else {
        window.addEventListener("load", mountMap, { once: true });
      }
      return () => {
        window.removeEventListener("load", mountMap);
        cancelIdleCallback(idleId);
      };
    }
  }, []);

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col">
      <div className="relative flex flex-1 overflow-hidden">
        {/* Listing cards */}
        <div
          className={`flex-1 overflow-y-auto scrollbar-hide p-4 ${
            showMap ? "hidden lg:block" : ""
          }`}
        >
          <h1 className="px-4 pt-4 text-2xl font-bold sm:text-3xl">Büros finden</h1>
          <p className="mb-4 text-sm text-body">
            <span className="font-semibold text-foreground">
              {listings.length} Büros
            </span>{" "}
            gefunden
          </p>

          {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Keine Büros gefunden
              </h2>
              <p className="mt-2 max-w-sm text-sm text-body">
                Versuchen Sie eine andere Stadt oder kontaktieren Sie uns für individuelle Anfragen.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3">
                <Link
                  href="/contact"
                  className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-white hover:bg-foreground/90"
                >
                  Kontakt aufnehmen
                </Link>
                <Link
                  href="/"
                  className="text-sm text-body underline underline-offset-4 hover:text-foreground"
                >
                  Alle Städte anzeigen
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onHover={setHoveredId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div
          className={`${
            showMap ? "flex" : "hidden lg:flex"
          } w-full flex-1 lg:w-1/2 lg:max-w-[50%]`}
        >
          {mapReady ? (
            <SearchMap listings={listings} hoveredId={hoveredId} />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center bg-slate-100">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              <p className="z-10 text-sm text-muted-text">Karte wird geladen…</p>
            </div>
          )}
        </div>

        {/* Mobile map toggle */}
        <div className="fixed bottom-6 left-1/2 z-10 -translate-x-1/2 lg:hidden">
          <Button
            onClick={() => {
              if (!mapReady) setMapReady(true);
              setShowMap(!showMap);
            }}
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
