"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getCityBySlug, getListingsByCity, listings as allListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing-card";
import { SearchMap } from "@/components/search-map";
import { LeadForm } from "@/components/lead-form";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Map, ArrowRight, Shield, Zap, BadgeCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA_POSITION = 4; // Insert CTA after 4th listing

export default function CitySearchPage() {
  const params = useParams();
  const citySlug = params.city as string;
  const city = getCityBySlug(citySlug);
  const cityListings = getListingsByCity(citySlug);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // If city not found, show all listings (could be an invalid slug)
  const displayListings = cityListings.length > 0 ? cityListings : allListings;
  const cityName = city?.name ?? citySlug;

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
                className="group w-full rounded-2xl bg-gray-900 p-5 text-left shadow-md transition-all hover:bg-gray-800 hover:shadow-lg sm:p-6"
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
        </div>

        {/* Map */}
        <div
          className={`${
            showMap ? "flex" : "hidden lg:flex"
          } h-full w-full flex-1 lg:w-1/2 lg:max-w-[50%]`}
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

      {/* Lead form dialog — outside layout to prevent reflow */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-md" showCloseButton={false}>
          <div className="px-6 pt-6 pb-0">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl">Kostenloses Angebot erhalten</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-body">
                  Büro in {cityName}
                </DialogDescription>
              </div>
              <button onClick={() => setFormOpen(false)} className="rounded-md p-1.5 hover:bg-gray-100">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> 100% kostenlos</span>
              <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Antwort in 30 Min.</span>
              <span className="flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5" /> Preisgarantie</span>
            </div>
          </div>
          <div className="px-6 pb-6">
            <LeadForm variant="dialog" citySlug={citySlug} />
          </div>
          <div className="px-6 pb-3">
            <div className="flex items-center justify-center gap-6 opacity-40 grayscale">
              <Image src="/logo-zalando.svg" alt="Zalando" width={80} height={20} className="h-4 w-auto" />
              <Image src="/logo-canon.svg" alt="Canon" width={80} height={20} className="h-4 w-auto" />
              <Image src="/logo-fresenius.svg" alt="Fresenius" width={80} height={20} className="h-4 w-auto" />
            </div>
          </div>
          <div className="border-t bg-gray-50 px-6 py-3">
            <div className="flex items-center gap-3">
              <Image src="/team-benjamin.jpg" alt="Benjamin Plass" width={36} height={36} className="rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-xs font-semibold">Benjamin Plass</p>
                <p className="text-[11px] text-muted-text">Ihr persönlicher Berater</p>
              </div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
