"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapRef } from "react-map-gl/mapbox";
import type { Listing } from "@/lib/mock-data";
import {
  MAPBOX_TOKEN,
  MAP_STYLE,
  GERMANY_CENTER,
  DEFAULT_ZOOM,
  CITY_ZOOM,
  PIN_COLOR,
  PIN_COLOR_ACTIVE,
  PIN_BORDER_COLOR,
} from "@/lib/map-config";

interface SearchMapInnerProps {
  listings: Listing[];
  hoveredId: string | null;
  center?: { lat: number; lng: number };
}

function PinMarker({ isActive }: { isActive: boolean }) {
  const color = isActive ? PIN_COLOR_ACTIVE : PIN_COLOR;
  const size = isActive ? 38 : 32;
  return (
    <div
      style={{
        width: size,
        height: size,
        background: color,
        border: `3px solid ${PIN_BORDER_COLOR}`,
        borderRadius: "50% 50% 50% 0",
        transform: "rotate(-45deg)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    />
  );
}

export default function SearchMapInner({
  listings,
  hoveredId,
  center,
}: SearchMapInnerProps) {
  const mapRef = useRef<MapRef>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const didFit = useRef(false);

  const initialViewState = center
    ? { latitude: center.lat, longitude: center.lng, zoom: CITY_ZOOM }
    : { ...GERMANY_CENTER, zoom: DEFAULT_ZOOM };

  // Fly to city center when center prop changes
  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.flyTo({
        center: [center.lng, center.lat],
        zoom: CITY_ZOOM,
        duration: 800,
      });
    }
  }, [center?.lat, center?.lng]);

  // Fit bounds to all listings when no center (search page)
  const handleLoad = useCallback(() => {
    if (!center && listings.length > 0 && mapRef.current && !didFit.current) {
      const lngs = listings.map((l) => l.longitude);
      const lats = listings.map((l) => l.latitude);
      mapRef.current.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 40, maxZoom: 14 }
      );
      didFit.current = true;
    }
  }, [center, listings]);

  const activeListing = activeId
    ? listings.find((l) => l.id === activeId)
    : null;

  return (
    <Map
      ref={mapRef}
      initialViewState={initialViewState}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_STYLE}
      mapboxAccessToken={MAPBOX_TOKEN}
      scrollZoom={false}
      onLoad={handleLoad}
    >
      <NavigationControl position="top-right" />

      {listings.map((listing) => {
        const isActive = activeId === listing.id || hoveredId === listing.id;
        return (
          <Marker
            key={listing.id}
            latitude={listing.latitude}
            longitude={listing.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setActiveId(listing.id);
            }}
          >
            <PinMarker isActive={isActive} />
          </Marker>
        );
      })}

      {activeListing && (
        <Popup
          latitude={activeListing.latitude}
          longitude={activeListing.longitude}
          onClose={() => setActiveId(null)}
          closeOnClick={false}
          offset={[0, -36]}
          maxWidth="240px"
        >
          <a
            href={`/${activeListing.citySlug}/${activeListing.slug}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "block",
              minWidth: 180,
            }}
          >
            <p
              style={{
                fontWeight: 600,
                fontSize: 14,
                margin: 0,
                color: "#0f172a",
              }}
            >
              {activeListing.name}
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#64748b",
                margin: "4px 0 0",
              }}
            >
              {activeListing.address}, {activeListing.city}
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                margin: "6px 0 0",
                color: "#2563EB",
              }}
            >
              ab {activeListing.priceFrom} €/Monat →
            </p>
          </a>
        </Popup>
      )}
    </Map>
  );
}
