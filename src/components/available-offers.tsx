"use client";

import { Building2, Users, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface OfficeOffer {
  type: "private_office" | "suite";
  label: string;
  capacityMin: number;
  capacityMax: number;
  areaSqmMin: number;
  areaSqmMax: number;
  price?: number;
}

interface AvailableOffersProps {
  offers: OfficeOffer[];
  onSelectOffer: (offer: OfficeOffer) => void;
}

const typeIcons = {
  private_office: Building2,
  suite: Building2,
};

export function AvailableOffers({
  offers,
  onSelectOffer,
}: AvailableOffersProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold">Verfügbare Angebote</h2>
      <div className="mt-4 flex flex-col gap-3">
        {offers.map((offer, i) => {
          const Icon = typeIcons[offer.type];
          return (
            <div
              key={i}
              className="rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{offer.label}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-sm text-body">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {offer.capacityMin}–{offer.capacityMax} Pers.
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="h-3.5 w-3.5" />
                      {offer.areaSqmMin}–{offer.areaSqmMax} m²
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="hidden shrink-0 border-foreground bg-foreground px-3 text-xs text-white hover:bg-foreground/90 hover:text-white sm:inline-flex"
                  onClick={() => onSelectOffer(offer)}
                >
                  Anfragen
                </Button>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full border-foreground bg-foreground text-white hover:bg-foreground/90 hover:text-white sm:hidden"
                onClick={() => onSelectOffer(offer)}
              >
                Angebot erhalten
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
