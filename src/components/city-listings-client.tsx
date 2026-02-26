"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { SearchMap } from "@/components/search-map";
import { LeadDialog } from "@/components/lead-dialog";
import { Map, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ListingCard as ListingCardData } from "@/lib/types";

interface CityListingsClientProps {
  listings: ListingCardData[];
  cityName: string;
  citySlug: string;
  center?: { lat: number; lng: number };
}

const CTA_POSITION = 4; // Insert CTA after 4th listing

export function CityListingsClient({
  listings: displayListings,
  cityName,
  citySlug,
  center,
}: CityListingsClientProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const isDesktop = useRef(false);

  useEffect(() => {
    isDesktop.current = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop.current) {
      const id = requestIdleCallback(() => setMapReady(true));
      return () => cancelIdleCallback(id);
    }
  }, []);

  const firstBatch = displayListings.slice(0, CTA_POSITION);
  const restBatch = displayListings.slice(CTA_POSITION);

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col">
      <div className="relative flex flex-1 overflow-hidden">
        {/* Listing cards */}
        <div
          className={`flex-1 overflow-y-auto scrollbar-hide p-4 ${
            showMap ? "hidden lg:block" : ""
          }`}
        >
          {/* City header */}
          <div className="mb-4">
            <h1 className="text-xl font-bold">
              Büro mieten in {cityName}
            </h1>
            <p className="text-sm text-body">
              {displayListings.length} Büros in {cityName} verfügbar
            </p>
          </div>

          {displayListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Noch keine Büros in {cityName}
              </h2>
              <p className="mt-2 max-w-sm text-sm text-body">
                Wir erweitern unser Angebot stetig. Kontaktieren Sie uns und wir finden Ihr Büro.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3">
                <Link
                  href="/contact"
                  className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-white hover:bg-foreground/90"
                >
                  Kontakt aufnehmen
                </Link>
                <Link
                  href="/search"
                  className="text-sm text-body underline underline-offset-4 hover:text-foreground"
                >
                  Alle Büros durchsuchen
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {firstBatch.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onHover={setHoveredId}
                  />
                ))}
              </div>

              {/* Inline CTA banner */}
              {displayListings.length > CTA_POSITION && (
                <div className="my-4">
                  <button
                    onClick={() => setFormOpen(true)}
                    className="group w-full rounded-xl bg-foreground p-5 text-left shadow-md transition-all hover:bg-foreground/90 hover:shadow-lg sm:p-6"
                  >
                    <div className="flex items-start gap-4 sm:items-center sm:gap-5">
                      <Image
                        src="/team-benjamin.jpg"
                        alt="Benjamin Plass"
                        width={56}
                        height={56}
                        className="mt-0.5 h-10 w-10 shrink-0 rounded-full border-2 border-gray-700 object-cover sm:mt-0 sm:h-14 sm:w-14"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white sm:text-xl">
                          Ihr Büro in {cityName} — in 2 Minuten.
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Wir vergleichen alle Anbieter und senden Ihnen bis zu 6 passende Angebote. 100% kostenlos und unverbindlich.
                        </p>
                      </div>
                      <div className="hidden shrink-0 items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors group-hover:bg-gray-100 sm:flex">
                        Jetzt anfragen
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                    {/* Mobile CTA */}
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 sm:hidden">
                      Jetzt anfragen
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </button>
                </div>
              )}

              {restBatch.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {restBatch.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onHover={setHoveredId}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Map */}
        <div
          className={`${
            showMap ? "flex" : "hidden lg:flex"
          } h-full w-full flex-1 lg:w-1/2 lg:max-w-[50%]`}
        >
          {mapReady ? (
            <SearchMap
              listings={displayListings}
              hoveredId={hoveredId}
              center={center}
            />
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

      {/* Lead form dialog */}
      <LeadDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Kostenloses Angebot erhalten"
        subtitle={`Büro in ${cityName}`}
        citySlug={citySlug}
      />
    </div>
  );
}
