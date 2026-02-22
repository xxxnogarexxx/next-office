"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AvailableOffers } from "@/components/available-offers";
import { LeadDialog } from "@/components/lead-dialog";
import { Shield, CheckCircle, Users, Zap } from "lucide-react";
import type { Listing } from "@/lib/types";
import type { OfficeOffer } from "@/components/available-offers";

interface ListingPageClientProps {
  listing: Listing;
  offers: OfficeOffer[];
  sidebarOnly?: boolean;
  mobileBarOnly?: boolean;
}

export function ListingPageClient({
  listing,
  offers,
  sidebarOnly,
  mobileBarOnly,
}: ListingPageClientProps) {
  const [formOpen, setFormOpen] = useState(false);

  function openContact() {
    setFormOpen(true);
  }

  // Sidebar CTA card (desktop)
  if (sidebarOnly) {
    return (
      <>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
          <div className="px-6 pt-6 pb-5">
            {/* Price anchor */}
            <p className="text-2xl font-bold">
              {listing.priceFrom !== null ? (
                <>ab {listing.priceFrom} €<span className="text-base font-normal text-body"> /Monat</span></>
              ) : (
                "Preis auf Anfrage"
              )}
            </p>
            <p className="mt-1 text-sm text-body">
              {listing.capacityMin !== null && listing.capacityMax !== null
                ? `${listing.capacityMin}–${listing.capacityMax} Personen`
                : listing.capacityMax !== null
                  ? `bis ${listing.capacityMax} Personen`
                  : "1–50+ Personen"}
              {listing.noticePeriod ? ` · ${listing.noticePeriod}` : ""}
            </p>

            {/* CTA Button */}
            <Button onClick={openContact} className="mt-5 w-full h-12 text-base font-semibold">
              Kostenloses Angebot erhalten
            </Button>

            {/* Urgency badge */}
            <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700">Antwort in unter 30 Min.</span>
            </div>

            {/* Trust signals */}
            <div className="mt-5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-sm text-body">
                <Shield className="h-4 w-4 shrink-0 text-green-500" />
                <span>100% kostenlos & unverbindlich</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-body">
                <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                <span>Keine versteckten Kosten</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-body">
                <Users className="h-4 w-4 shrink-0 text-green-500" />
                <span>Über 1.000 Unternehmen vertrauen uns</span>
              </div>
            </div>
          </div>

          {/* Advisor card */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <Image
                src="/team-benjamin.jpg"
                alt="Benjamin Plass"
                width={44}
                height={44}
                className="rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">Benjamin Plass</p>
                <p className="text-xs text-muted-text">Ihr persönlicher Berater</p>
              </div>
            </div>
          </div>
        </div>

        <LeadDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          title="Kostenloses Angebot erhalten"
          subtitle={listing.name}
          listingId={listing.id}
          listingName={listing.name}
          citySlug={listing.citySlug}
        />
      </>
    );
  }

  // Mobile sticky bottom bar
  if (mobileBarOnly) {
    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-bold">
                {listing.priceFrom !== null ? (
                  <>ab {listing.priceFrom} €<span className="text-sm font-normal text-body"> /Monat</span></>
                ) : (
                  "Preis auf Anfrage"
                )}
              </p>
              <p className="text-xs text-muted-text">Kostenlos & unverbindlich</p>
            </div>
            <Button onClick={openContact} className="h-10 px-5 font-semibold">
              Angebot erhalten
            </Button>
          </div>
        </div>

        <LeadDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          title="Kostenloses Angebot erhalten"
          subtitle={listing.name}
          listingId={listing.id}
          listingName={listing.name}
          citySlug={listing.citySlug}
        />

        {/* Spacer */}
        <div className="h-16 lg:hidden" />
      </>
    );
  }

  // Available offers section (inline in main content)
  return (
    <>
      <AvailableOffers
        offers={offers}
        onSelectOffer={openContact}
      />

      <LeadDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Kostenloses Angebot erhalten"
        subtitle={listing.name}
        listingId={listing.id}
        listingName={listing.name}
        citySlug={listing.citySlug}
      />
    </>
  );
}
