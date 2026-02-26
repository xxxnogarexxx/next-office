"use client";

import dynamic from "next/dynamic";
import type { ListingCard } from "@/lib/types";

interface SearchMapProps {
  listings: ListingCard[];
  hoveredId: string | null;
  center?: { lat: number; lng: number };
}

const SearchMapInner = dynamic(() => import("./search-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="relative flex h-full w-full items-center justify-center bg-slate-100">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="z-10 flex flex-col items-center gap-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        <p className="text-sm text-muted-text">Karte wird geladen…</p>
      </div>
    </div>
  ),
});

export function SearchMap(props: SearchMapProps) {
  return <SearchMapInner {...props} />;
}
