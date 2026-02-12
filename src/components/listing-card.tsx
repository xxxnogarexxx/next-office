"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Euro, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/lib/mock-data";

interface ListingCardProps {
  listing: Listing;
  onHover?: (id: string | null) => void;
}

function ImageCarousel({ photos, name }: { photos: string[]; name: string }) {
  const [current, setCurrent] = useState(0);
  const total = photos.length;

  const prev = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((c) => (c === 0 ? total - 1 : c - 1));
  }, [total]);

  const next = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((c) => (c === total - 1 ? 0 : c + 1));
  }, [total]);

  return (
    <div className="group/carousel relative aspect-[16/10] overflow-hidden">
      {photos.map((photo, i) => (
        <Image
          key={photo}
          src={photo}
          alt={`${name} ${i + 1}`}
          fill
          className={`object-cover transition-opacity duration-300 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={i === 0}
        />
      ))}

      {/* Arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className={`absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm transition-opacity hover:bg-white ${
              current === 0 ? "opacity-0" : "opacity-0 group-hover/carousel:opacity-100"
            }`}
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="h-4 w-4 text-slate-700" />
          </button>
          <button
            onClick={next}
            className={`absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm transition-opacity hover:bg-white ${
              current === total - 1 ? "opacity-0" : "opacity-0 group-hover/carousel:opacity-100"
            }`}
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="h-4 w-4 text-slate-700" />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
          {photos.slice(0, 5).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === current ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ListingCard({ listing, onHover }: ListingCardProps) {
  const photos = listing.photos.length > 0 ? listing.photos : [listing.coverPhoto];

  return (
    <Link
      href={`/${listing.citySlug}/${listing.slug}`}
      className="group block overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md"
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <ImageCarousel photos={photos} name={listing.name} />

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
