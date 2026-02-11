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
import type { Listing } from "@/lib/mock-data";
import type { OfficeOffer } from "@/components/available-offers";

interface ListingSidebarProps {
  listing: Listing;
  offers: OfficeOffer[];
}

export function ListingSidebar({ listing, offers }: ListingSidebarProps) {
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

  return (
    <>
      <div className="rounded-lg border bg-white p-6">
        {/* Provider info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-sm font-bold text-foreground">
            {listing.providerName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{listing.providerName}</p>
            <p className="text-xs text-muted-text">Vermieter</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-body">
          Treten Sie in Kontakt mit dem Vermieter und erhalten Sie die
          Kontaktadressen direkt via E-Mail zugesandt.
        </p>

        {/* Offer selection */}
        {offers.length > 0 && (
          <div className="mt-4">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Angebot auswählen" />
              </SelectTrigger>
              <SelectContent>
                {offers.map((offer, i) => (
                  <SelectItem key={i} value={`offer-${i}`}>
                    {offer.label} ({offer.capacityMin}–{offer.capacityMax} Pers.)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* CTA buttons */}
        <div className="mt-4 flex flex-col gap-2">
          <Button onClick={openContact} className="w-full">
            Vermieter kontaktieren
          </Button>
          <Button variant="outline" onClick={openTour} className="w-full">
            Besuch planen
          </Button>
        </div>
      </div>

      {/* Full form popup */}
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
