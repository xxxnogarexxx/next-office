"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadForm } from "@/components/lead-form";
import { AvailableOffers } from "@/components/available-offers";
import { Send } from "lucide-react";
import type { Listing } from "@/lib/mock-data";
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
  const [formType, setFormType] = useState<"contact" | "tour">("contact");

  function openContact() {
    setFormType("contact");
    setFormOpen(true);
  }

  function openTour() {
    setFormType("tour");
    setFormOpen(true);
  }

  // Sidebar CTA card (desktop)
  if (sidebarOnly) {
    return (
      <>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-sm font-bold text-foreground">
              {listing.providerName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-sm">{listing.providerName}</p>
              <p className="text-xs text-muted-text">Vermieter</p>
            </div>
          </div>

          <p className="mt-3 text-sm text-body">
            Treten Sie in Kontakt mit dem Vermieter und erhalten Sie die
            Kontaktadressen direkt via E-Mail zugesandt.
          </p>

          {offers.length > 0 && (
            <div className="mt-4">
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Angebot auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {offers.map((offer, i) => (
                    <SelectItem key={i} value={`offer-${i}`}>
                      {offer.label} ({offer.capacityMin}–{offer.capacityMax}{" "}
                      Pers.)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <Button onClick={openContact} className="w-full h-12 text-base">
              Vermieter kontaktieren
            </Button>
            <Button variant="outline" onClick={openTour} className="w-full h-12 text-base">
              Besuch planen
            </Button>
          </div>
        </div>

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogTitle>
              {formType === "contact"
                ? "Vermieter kontaktieren"
                : "Besuch planen"}
            </DialogTitle>
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
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-bold">
                ab {listing.priceFrom} €
                <span className="text-sm font-normal text-body">/Monat</span>
              </p>
            </div>
            <Button size="sm" onClick={openContact} className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Anfragen
            </Button>
          </div>
        </div>

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogTitle>Vermieter kontaktieren</DialogTitle>
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
      onRequestQuote={openContact}
    />
  );
}
