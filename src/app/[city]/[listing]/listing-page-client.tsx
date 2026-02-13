"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LeadForm } from "@/components/lead-form";
import { AvailableOffers } from "@/components/available-offers";
import { Shield, CheckCircle, Users } from "lucide-react";
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
        <div className="rounded-xl border bg-white p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
          {/* Price anchor */}
          <p className="text-2xl font-bold">
            {listing.priceFrom !== null ? (
              <>ab {listing.priceFrom} €<span className="text-base font-normal text-body"> /Monat</span></>
            ) : (
              "Preis auf Anfrage"
            )}
          </p>

          {/* Capacity info */}
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
            Angebot erhalten
          </Button>

          {/* Trust signals */}
          <div className="mt-5 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5 text-sm text-body">
              <Shield className="h-4 w-4 shrink-0 text-muted-text" />
              <span>100% kostenlos</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-body">
              <CheckCircle className="h-4 w-4 shrink-0 text-muted-text" />
              <span>Keine versteckten Kosten</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-body">
              <Users className="h-4 w-4 shrink-0 text-muted-text" />
              <span>Über 2.000 Unternehmen vertrauen uns</span>
            </div>
          </div>
        </div>

        {/* Urgency badge — separate box */}
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
          <span className="text-lg">⚡</span>
          <span className="text-sm font-semibold">Antwort in 30 Minuten</span>
        </div>

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogTitle>Angebot erhalten</DialogTitle>
            <LeadForm
              variant="sidebar"
              listingId={listing.id}
              listingName={listing.name}
              citySlug={listing.citySlug}
            />
          </DialogContent>
        </Dialog>
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

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogTitle>Angebot erhalten</DialogTitle>
            <LeadForm
              variant="sidebar"
              listingId={listing.id}
              listingName={listing.name}
              citySlug={listing.citySlug}
            />
          </DialogContent>
        </Dialog>

        {/* Spacer */}
        <div className="h-16 lg:hidden" />
      </>
    );
  }

  // Available offers section (inline in main content)
  return (
    <AvailableOffers
      offers={offers}
      onSelectOffer={openContact}
    />
  );
}
