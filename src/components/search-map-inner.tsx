"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Listing } from "@/lib/mock-data";

interface SearchMapInnerProps {
  listings: Listing[];
  hoveredId: string | null;
  center?: { lat: number; lng: number };
}

// Default center: Germany
const GERMANY_CENTER: [number, number] = [51.1657, 10.4515];
const DEFAULT_ZOOM = 6;
const CITY_ZOOM = 12;

const BLUE = "#2563EB";
const BLUE_ACTIVE = "#1E40AF";

function createPinIcon(isActive: boolean) {
  const color = isActive ? BLUE_ACTIVE : BLUE;
  const size = isActive ? 38 : 32;
  return L.divIcon({
    className: "",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: translate(-50%, -100%) rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: background 0.15s;
    "></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function FlyToCenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [map, center[0], center[1], zoom]);
  return null;
}

function FitBounds({ listings }: { listings: Listing[] }) {
  const map = useMap();
  const didFit = useRef(false);

  useEffect(() => {
    if (listings.length > 0 && !didFit.current) {
      const bounds = L.latLngBounds(
        listings.map((l) => [l.latitude, l.longitude])
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      didFit.current = true;
    }
  }, [map, listings]);

  return null;
}

export default function SearchMapInner({
  listings,
  hoveredId,
  center,
}: SearchMapInnerProps) {
  const mapCenter: [number, number] = center
    ? [center.lat, center.lng]
    : GERMANY_CENTER;
  const zoom = center ? CITY_ZOOM : DEFAULT_ZOOM;
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {center && <FlyToCenter center={mapCenter} zoom={zoom} />}
      {!center && <FitBounds listings={listings} />}

      {listings.map((listing) => {
        const isActive = activeId === listing.id || hoveredId === listing.id;
        return (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={createPinIcon(isActive)}
            eventHandlers={{
              click: () => setActiveId(listing.id),
              popupclose: () => setActiveId(null),
            }}
          >
            <Popup>
              <a
                href={`/${listing.citySlug}/${listing.slug}`}
                style={{ textDecoration: "none", color: "inherit", display: "block", minWidth: 180 }}
              >
                <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: "#0f172a" }}>
                  {listing.name}
                </p>
                <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
                  {listing.address}, {listing.city}
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, margin: "6px 0 0", color: "#2563EB" }}>
                  ab {listing.priceFrom} €/Monat →
                </p>
              </a>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
