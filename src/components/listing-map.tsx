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
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-100">
      <p className="text-sm text-muted-text">Karte wird geladen…</p>
    </div>
  ),
});

export function ListingMap(props: ListingMapProps) {
  return <ListingMapInner {...props} />;
}
