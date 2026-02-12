"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapRef } from "react-map-gl/mapbox";
import {
  MAPBOX_TOKEN,
  MAP_STYLE,
  LISTING_ZOOM,
  PIN_COLOR,
  PIN_BORDER_COLOR,
  POI_CATEGORIES,
  type PoiCategory,
} from "@/lib/map-config";

interface ListingMapInnerProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

interface POI {
  id: string;
  name: string;
  category: PoiCategory;
  latitude: number;
  longitude: number;
  distance: number;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchNearbyPOIs(
  lng: number,
  lat: number,
  category: PoiCategory
): Promise<POI[]> {
  const queryMap: Record<PoiCategory, string> = {
    ubahn: "u-bahn station",
    sbahn: "s-bahn station",
    bus: "bushaltestelle bus stop",
    restaurant: "restaurant",
    cafe: "café kaffee coffee",
    parking: "parking parkhaus parkplatz",
  };

  const query = queryMap[category];
  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
  url.searchParams.set("q", query);
  url.searchParams.set("proximity", `${lng},${lat}`);
  url.searchParams.set("limit", "10");
  url.searchParams.set("types", "poi");
  url.searchParams.set("language", "de");
  url.searchParams.set(
    "bbox",
    `${lng - 0.015},${lat - 0.01},${lng + 0.015},${lat + 0.01}`
  );
  url.searchParams.set("access_token", MAPBOX_TOKEN);

  const res = await fetch(url.toString());
  const data = await res.json();

  return (data.features || []).map((f: Record<string, unknown>, i: number) => {
    const geom = f.geometry as { coordinates: [number, number] };
    const props = f.properties as { name?: string; full_address?: string };
    const [poiLng, poiLat] = geom.coordinates;
    const distance = haversineDistance(lat, lng, poiLat, poiLng);
    return {
      id: `${category}-${i}`,
      name: props.name || props.full_address || category,
      category,
      latitude: poiLat,
      longitude: poiLng,
      distance: Math.round(distance),
    };
  });
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function PoiMarker({ category }: { category: PoiCategory }) {
  const cat = POI_CATEGORIES.find((c) => c.id === category)!;
  return (
    <div
      style={{
        width: 28,
        height: 28,
        background: cat.color,
        border: "2px solid white",
        borderRadius: "50%",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {cat.icon}
    </div>
  );
}

export default function ListingMapInner({
  latitude,
  longitude,
  name,
  address,
}: ListingMapInnerProps) {
  const mapRef = useRef<MapRef>(null);
  const [activeCategories, setActiveCategories] = useState<Set<PoiCategory>>(
    new Set()
  );
  const [pois, setPois] = useState<Record<string, POI[]>>({});
  const [loading, setLoading] = useState<Set<PoiCategory>>(new Set());
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);

  const toggleCategory = useCallback(
    async (cat: PoiCategory) => {
      setActiveCategories((prev) => {
        const next = new Set(prev);
        if (next.has(cat)) {
          next.delete(cat);
        } else {
          next.add(cat);
        }
        return next;
      });

      // Fetch if not cached
      if (!pois[cat]) {
        setLoading((prev) => new Set(prev).add(cat));
        const results = await fetchNearbyPOIs(longitude, latitude, cat);
        setPois((prev) => ({ ...prev, [cat]: results }));
        setLoading((prev) => {
          const next = new Set(prev);
          next.delete(cat);
          return next;
        });
      }
    },
    [pois, latitude, longitude]
  );

  // Enable 3D buildings on map load
  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Add 3D building layer
    const layers = map.getStyle().layers;
    const labelLayerId = layers?.find(
      (layer) =>
        layer.type === "symbol" && (layer.layout as Record<string, unknown>)?.["text-field"]
    )?.id;

    if (!map.getLayer("3d-buildings")) {
      map.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 13,
          paint: {
            "fill-extrusion-color": "#d4d4d8",
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              13,
              0,
              15.05,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              13,
              0,
              15.05,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.5,
          },
        },
        labelLayerId
      );
    }
  }, []);

  // Collect all visible POIs
  const visiblePois = Array.from(activeCategories).flatMap(
    (cat) => pois[cat] || []
  );

  // Group POIs by transport vs other for the sidebar
  const transportCategories = ["ubahn", "sbahn", "bus"] as const;
  const otherCategories = ["restaurant", "cafe", "parking"] as const;

  return (
    <div className="flex overflow-hidden rounded-lg border" style={{ height: 420 }}>
      {/* Sidebar */}
      <div className="w-[220px] shrink-0 overflow-y-auto border-r bg-white p-4">
        <p className="mb-1 text-sm font-semibold">{name}</p>
        <p className="mb-4 text-xs text-muted-text">{address}</p>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-text">
          Transport
        </p>
        {transportCategories.map((catId) => {
          const cat = POI_CATEGORIES.find((c) => c.id === catId)!;
          const isActive = activeCategories.has(catId);
          const count = pois[catId]?.length;
          const isLoading = loading.has(catId);
          return (
            <label
              key={catId}
              className="mb-1.5 flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => toggleCategory(catId)}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              <span style={{ fontSize: 14 }}>{cat.icon}</span>
              <span className="flex-1">{cat.label}</span>
              <span className="text-xs text-muted-text">
                {isLoading ? "…" : count !== undefined ? count : ""}
              </span>
            </label>
          );
        })}

        <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-muted-text">
          In der Nähe
        </p>
        {otherCategories.map((catId) => {
          const cat = POI_CATEGORIES.find((c) => c.id === catId)!;
          const isActive = activeCategories.has(catId);
          const count = pois[catId]?.length;
          const isLoading = loading.has(catId);
          return (
            <label
              key={catId}
              className="mb-1.5 flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => toggleCategory(catId)}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              <span style={{ fontSize: 14 }}>{cat.icon}</span>
              <span className="flex-1">{cat.label}</span>
              <span className="text-xs text-muted-text">
                {isLoading ? "…" : count !== undefined ? count : ""}
              </span>
            </label>
          );
        })}

        <p className="mt-4 text-[11px] text-muted-text">
          Klicken Sie auf Markierungen für Details.
        </p>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        <Map
          ref={mapRef}
          initialViewState={{
            latitude,
            longitude,
            zoom: LISTING_ZOOM,
            pitch: 45,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAP_STYLE}
          mapboxAccessToken={MAPBOX_TOKEN}
          scrollZoom={false}
          onLoad={handleLoad}
        >
          <NavigationControl position="top-right" />

          {/* Main listing pin */}
          <Marker
            latitude={latitude}
            longitude={longitude}
            anchor="bottom"
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: PIN_COLOR,
                border: `3px solid ${PIN_BORDER_COLOR}`,
                borderRadius: "50% 50% 50% 0",
                transform: "rotate(-45deg)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
              }}
            />
          </Marker>

          {/* POI markers */}
          {visiblePois.map((poi) => (
            <Marker
              key={poi.id}
              latitude={poi.latitude}
              longitude={poi.longitude}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedPoi(poi);
              }}
            >
              <PoiMarker category={poi.category} />
            </Marker>
          ))}

          {/* POI popup */}
          {selectedPoi && (
            <Popup
              latitude={selectedPoi.latitude}
              longitude={selectedPoi.longitude}
              onClose={() => setSelectedPoi(null)}
              closeOnClick={false}
              offset={[0, -14]}
              maxWidth="200px"
            >
              <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>
                {selectedPoi.name}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  margin: "4px 0 0",
                }}
              >
                {formatDistance(selectedPoi.distance)} entfernt
              </p>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
}
