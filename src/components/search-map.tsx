"use client";

import dynamic from "next/dynamic";
import type { Listing } from "@/lib/mock-data";

interface SearchMapProps {
  listings: Listing[];
  hoveredId: string | null;
  center?: { lat: number; lng: number };
}

const SearchMapInner = dynamic(() => import("./search-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <p className="text-sm text-muted-text">Karte wird geladen…</p>
    </div>
  ),
});

export function SearchMap(props: SearchMapProps) {
  return <SearchMapInner {...props} />;
}
