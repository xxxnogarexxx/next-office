"use client";

import dynamic from "next/dynamic";

interface ListingMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

const ListingMapInner = dynamic(() => import("./listing-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="relative flex h-full w-full items-center justify-center rounded-lg bg-slate-100">
      <div className="absolute inset-0 rounded-lg opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="z-10 flex flex-col items-center gap-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        <p className="text-sm text-muted-text">Karte wird geladen…</p>
      </div>
    </div>
  ),
});

export function ListingMap(props: ListingMapProps) {
  return <ListingMapInner {...props} />;
}
