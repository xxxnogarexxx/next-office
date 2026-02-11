"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Euro } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/lib/mock-data";

interface ListingCardProps {
  listing: Listing;
  onHover?: (id: string | null) => void;
}

export function ListingCard({ listing, onHover }: ListingCardProps) {
  return (
    <Link
      href={`/${listing.citySlug}/${listing.slug}`}
      className="group block overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md"
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={listing.coverPhoto}
          alt={listing.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-4">
        <p className="text-xs font-medium text-muted-text">
          {listing.providerName}
        </p>
        <h3 className="mt-1 text-base font-semibold text-foreground group-hover:text-body transition-colors">
          {listing.name}
        </h3>

        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-sm text-body">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-text" />
            <span>
              {listing.address}, {listing.city}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-body">
            <Users className="h-3.5 w-3.5 shrink-0 text-muted-text" />
            <span>
              {listing.capacityMin}–{listing.capacityMax} Personen
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-body">
            <Euro className="h-3.5 w-3.5 shrink-0 text-muted-text" />
            <span>
              ab {listing.priceFrom} €/Monat
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {listing.amenities.slice(0, 3).map((amenity) => (
            <Badge key={amenity} variant="secondary" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {listing.amenities.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{listing.amenities.length - 3}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
