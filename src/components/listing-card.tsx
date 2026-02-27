"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Euro, ChevronLeft, ChevronRight } from "lucide-react";
import type { ListingCard as ListingCardData } from "@/lib/types";

interface ListingCardProps {
  listing: ListingCardData;
  onHover?: (id: string | null) => void;
}

function ImageCarousel({ photos, name }: { photos: string[]; name: string }) {
  const [current, setCurrent] = useState(0);
  // Track which photos have been navigated to (for preloading visited ones)
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  const total = photos.length;
  const touchStart = useRef<number | null>(null);
  const touchDelta = useRef(0);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
    setLoaded((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const prev = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goTo(current === 0 ? total - 1 : current - 1);
  }, [current, total, goTo]);

  const next = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goTo(current === total - 1 ? 0 : current + 1);
  }, [current, total, goTo]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    touchDelta.current = 0;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    touchDelta.current = e.touches[0].clientX - touchStart.current;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (Math.abs(touchDelta.current) > 40) {
      e.preventDefault();
      if (touchDelta.current < 0) {
        goTo(current === total - 1 ? current : current + 1);
      } else {
        goTo(current === 0 ? current : current - 1);
      }
    }
    touchStart.current = null;
    touchDelta.current = 0;
  }, [current, total, goTo]);

  return (
    <div
      className="group/carousel relative aspect-[16/10] overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {photos.map((photo, i) => {
        // Only render Image elements for the current photo and previously navigated ones
        const shouldRender = loaded.has(i);
        if (!shouldRender) return null;

        return (
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
        );
      })}

      {/* Arrows — desktop only */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className={`absolute left-2 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm transition-opacity hover:bg-white lg:flex ${
              current === 0 ? "opacity-0" : "opacity-0 group-hover/carousel:opacity-100"
            }`}
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="h-4 w-4 text-slate-700" />
          </button>
          <button
            onClick={next}
            className={`absolute right-2 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm transition-opacity hover:bg-white lg:flex ${
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
  const photos = listing.photos.length > 0
    ? listing.photos
    : listing.coverPhoto
      ? [listing.coverPhoto]
      : ["/placeholder-office.jpg"];

  const capacityText =
    listing.capacityMin !== null && listing.capacityMax !== null
      ? `${listing.capacityMin}–${listing.capacityMax} Personen`
      : listing.capacityMax !== null
        ? `bis ${listing.capacityMax} Personen`
        : listing.capacityMin !== null
          ? "1–50+ Personen"
          : "Auf Anfrage";

  const priceText =
    listing.priceFrom !== null
      ? `ab ${listing.priceFrom} €/Monat`
      : "Preis auf Anfrage";

  return (
    <Link
      href={`/${listing.citySlug}/${listing.slug}`}
      className="group block overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md"
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <ImageCarousel photos={photos} name={listing.name} />

      <div className="p-4">
        {listing.providerName && (
          <p className="text-xs font-medium text-muted-text">
            {listing.providerName}
          </p>
        )}
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
            <span>{capacityText}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-body">
            <Euro className="h-3.5 w-3.5 shrink-0 text-muted-text" />
            <span>{priceText}</span>
          </div>
        </div>

      </div>
    </Link>
  );
}
