"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import MapGL, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
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

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCached(key: string): Record<string, POI[]> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key: string, data: Record<string, POI[]>) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

// Single Overpass call fetches all transit at once, then categorizes by tags
async function fetchAllTransitPOIs(
  lng: number,
  lat: number
): Promise<Record<string, POI[]>> {
  const res = await fetch(`/api/transit?type=listing-pois&lat=${lat}&lng=${lng}`);

  if (!res.ok) {
    throw new Error(`Transit API returned ${res.status}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  const buckets: Record<string, Map<string, POI>> = {
    ubahn: new Map(),
    sbahn: new Map(),
    bus: new Map(),
  };

  for (const el of data.elements || []) {
    const tags = el.tags || {};
    let category: PoiCategory;
    if (tags.station === "subway") category = "ubahn";
    else if (tags.station === "light_rail") category = "sbahn";
    else if (tags.highway === "bus_stop") category = "bus";
    else continue;

    const name: string = tags.name || category;
    const distance = haversineDistance(lat, lng, el.lat, el.lon);
    const existing = buckets[category].get(name);
    if (!existing || distance < existing.distance) {
      buckets[category].set(name, {
        id: `${category}-${el.id}`,
        name,
        category,
        latitude: el.lat,
        longitude: el.lon,
        distance: Math.round(distance),
      });
    }
  }

  const result: Record<string, POI[]> = {};
  for (const [cat, seen] of Object.entries(buckets)) {
    result[cat] = [...seen.values()]
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  }
  return result;
}

async function fetchMapboxPOIs(
  lng: number,
  lat: number,
  category: PoiCategory
): Promise<POI[]> {
  const categoryMap: Record<string, string> = {
    restaurant: "restaurant",
    cafe: "cafe",
    parking: "parking",
  };

  const mbCategory = categoryMap[category];
  const url = `https://api.mapbox.com/search/searchbox/v1/category/${mbCategory}?proximity=${lng},${lat}&limit=10&language=de&access_token=${MAPBOX_TOKEN}`;

  const res = await fetch(url);
  const data = await res.json();

  return (data.features || []).map(
    (f: Record<string, unknown>, i: number) => {
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
    }
  );
}


function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// All state in one object to avoid stale closure issues
interface MapState {
  active: Set<PoiCategory>;
  pois: Record<string, POI[]>;
  loading: Set<PoiCategory>;
}

export default function ListingMapInner({
  latitude,
  longitude,
  name,
  address,
}: ListingMapInnerProps) {
  const mapRef = useRef<MapRef>(null);
  const [state, setState] = useState<MapState>({
    active: new Set<PoiCategory>(["ubahn", "sbahn", "bus"]),
    pois: {},
    loading: new Set(),
  });
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Prefetch all POI data on mount so checkboxes toggle instantly
  useEffect(() => {
    let cancelled = false;
    const allCategories: PoiCategory[] = POI_CATEGORIES.map((c) => c.id);
    const mapboxCategories = ["restaurant", "cafe", "parking"] as const;
    const cacheKey = `poi-${latitude.toFixed(4)}-${longitude.toFixed(4)}`;

    // Check localStorage cache first — skip if transit data is all empty (likely a poisoned cache)
    const cached = getCached(cacheKey);
    const hasTransitData = cached &&
      ((cached.ubahn?.length ?? 0) + (cached.sbahn?.length ?? 0) + (cached.bus?.length ?? 0) > 0);
    if (cached && hasTransitData) {
      setState((prev) => ({
        ...prev,
        pois: cached,
        loading: new Set(),
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: new Set(allCategories),
    }));

    // Collect all results to cache when done — only cache if transit succeeded
    const allPois: Record<string, POI[]> = {};
    let pending = 4; // 1 transit + 3 mapbox
    let transitFailed = false;
    const maybeCache = () => {
      pending--;
      if (pending === 0 && !cancelled && !transitFailed) {
        setCache(cacheKey, allPois);
      }
    };

    // Single Overpass call for all transit — retry once on failure
    const fetchTransitWithRetry = async (attempt: number): Promise<Record<string, POI[]>> => {
      try {
        return await fetchAllTransitPOIs(longitude, latitude);
      } catch {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 2000));
          return fetchTransitWithRetry(attempt + 1);
        }
        throw new Error("Transit fetch failed after retry");
      }
    };

    fetchTransitWithRetry(1)
      .then((transitPois) => {
        if (cancelled) return;
        Object.assign(allPois, transitPois);
        maybeCache();
        setState((prev) => {
          const nextLoading = new Set(prev.loading);
          nextLoading.delete("ubahn");
          nextLoading.delete("sbahn");
          nextLoading.delete("bus");
          return {
            ...prev,
            pois: { ...prev.pois, ...transitPois },
            loading: nextLoading,
          };
        });
      })
      .catch(() => {
        if (cancelled) return;
        transitFailed = true;
        maybeCache(); // won't cache because transitFailed=true
        setState((prev) => {
          const nextLoading = new Set(prev.loading);
          nextLoading.delete("ubahn");
          nextLoading.delete("sbahn");
          nextLoading.delete("bus");
          return {
            ...prev,
            pois: { ...prev.pois, ubahn: [], sbahn: [], bus: [] },
            loading: nextLoading,
          };
        });
      });

    // Mapbox calls for restaurants/cafés/parking (parallel)
    for (const cat of mapboxCategories) {
      fetchMapboxPOIs(longitude, latitude, cat)
        .then((results) => {
          if (cancelled) return;
          allPois[cat] = results;
          maybeCache();
          setState((prev) => {
            const nextLoading = new Set(prev.loading);
            nextLoading.delete(cat);
            return {
              ...prev,
              pois: { ...prev.pois, [cat]: results },
              loading: nextLoading,
            };
          });
        })
        .catch(() => {
          if (cancelled) return;
          allPois[cat] = [];
          maybeCache();
          setState((prev) => {
            const nextLoading = new Set(prev.loading);
            nextLoading.delete(cat);
            return { ...prev, pois: { ...prev.pois, [cat]: [] }, loading: nextLoading };
          });
        });
    }

    return () => { cancelled = true; };
  }, [latitude, longitude]);

  const toggleCategory = useCallback(
    (cat: PoiCategory) => {
      setState((prev) => {
        const nextActive = new Set(prev.active);
        if (nextActive.has(cat)) {
          nextActive.delete(cat);
        } else {
          nextActive.add(cat);
        }
        return { ...prev, active: nextActive };
      });

      // Zoom to fit POIs
      const catPois = state.pois[cat];
      if (catPois && catPois.length > 0 && !state.active.has(cat) && mapRef.current) {
        const allLngs = [longitude, ...catPois.map((p) => p.longitude)];
        const allLats = [latitude, ...catPois.map((p) => p.latitude)];
        mapRef.current.fitBounds(
          [
            [Math.min(...allLngs), Math.min(...allLats)],
            [Math.max(...allLngs), Math.max(...allLats)],
          ],
          { padding: 60, maxZoom: 15, pitch: 45, duration: 600 }
        );
      }
    },
    [state.active, state.pois, latitude, longitude]
  );

  // 3D buildings on load
  const handleLoad = useCallback(() => {
    setMapLoaded(true);
    const map = mapRef.current?.getMap();
    if (!map) return;

    const layers = map.getStyle().layers;
    const labelLayerId = layers?.find(
      (layer) =>
        layer.type === "symbol" &&
        (layer.layout as Record<string, unknown>)?.["text-field"]
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

  // Compute visible POIs from state
  const visiblePois: POI[] = [];
  for (const cat of state.active) {
    const catPois = state.pois[cat];
    if (catPois) visiblePois.push(...catPois);
  }

  // Native mapbox-gl markers for POIs (bypasses react-map-gl overlay issues)
  const poiMarkersRef = useRef<mapboxgl.Marker[]>([]);
  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    const markers: mapboxgl.Marker[] = [];

    for (const catId of state.active) {
      const catPois = state.pois[catId];
      if (!catPois) continue;
      const catConfig = POI_CATEGORIES.find((c) => c.id === catId)!;

      catPois.forEach((poi) => {
        const el = document.createElement("div");
        el.style.cssText = `
          width: 30px; height: 30px;
          background: ${catConfig.color};
          border: 2.5px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; cursor: pointer; line-height: 1;
          z-index: 1;
        `;
        el.textContent = catConfig.icon;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedPoi(poi);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([poi.longitude, poi.latitude])
          .addTo(map);
        markers.push(marker);
      });
    }

    poiMarkersRef.current = markers;
    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [state.active, state.pois, mapLoaded]);

  const transportCategories = ["ubahn", "sbahn", "bus"] as const;
  const otherCategories = ["restaurant", "cafe", "parking"] as const;

  const categoryRow = (catId: PoiCategory) => {
    const cat = POI_CATEGORIES.find((c) => c.id === catId)!;
    const isActive = state.active.has(catId);
    const count = state.pois[catId]?.length;
    const isLoading = state.loading.has(catId);
    return (
      <label
        key={catId}
        className="mb-1 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
      >
        <input
          type="checkbox"
          checked={isActive}
          onChange={() => toggleCategory(catId)}
          className="h-4 w-4 rounded border-slate-300 accent-blue-600"
        />
        <span style={{ fontSize: 15 }}>{cat.icon}</span>
        <span className="flex-1">{cat.label}</span>
        <span className="min-w-[20px] text-right text-xs text-muted-text">
          {isLoading ? "…" : count !== undefined ? count : ""}
        </span>
      </label>
    );
  };

  return (
    <div className="flex flex-col rounded-lg border lg:flex-row lg:h-[560px]">
      {/* Sidebar — horizontal scroll on mobile, vertical on desktop */}
      <div className="flex shrink-0 flex-col border-b bg-white lg:w-[260px] lg:border-b-0 lg:border-r">
        <div className="p-4 lg:flex-1 lg:overflow-y-auto lg:p-5">
          {/* Name + address — desktop only */}
          <div className="hidden lg:block">
            <p className="text-sm font-semibold">{name}</p>
            <p className="mt-0.5 text-xs text-muted-text">{address}</p>
          </div>

          {/* Mobile: compact grid layout */}
          <div className="lg:hidden">
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-text">
                  Transport
                </p>
                {transportCategories.map(categoryRow)}
              </div>
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-text">
                  In der Nähe
                </p>
                {otherCategories.map(categoryRow)}
              </div>
            </div>
            {visiblePois.length > 0 && (
              <p className="mt-2 text-[11px] text-muted-text">
                {visiblePois.length} Ergebnisse auf der Karte
              </p>
            )}
          </div>

          {/* Desktop: vertical lists */}
          <div className="hidden lg:block">
            <p className="mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-text">
              Transport
            </p>
            {transportCategories.map(categoryRow)}

            <p className="mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-text">
              In der Nähe
            </p>
            {otherCategories.map(categoryRow)}

            {visiblePois.length > 0 && (
              <p className="mt-4 text-[11px] text-muted-text">
                {visiblePois.length} Ergebnisse auf der Karte
              </p>
            )}
          </div>
        </div>

        <div className="hidden border-t px-5 py-4 lg:block">
          <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
            <span className="mt-px shrink-0">&#9432;</span>
            <span>Klicke auf die Markierungen, um Details zu sehen</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[400px] shrink-0 lg:h-auto lg:flex-1" style={{ overflow: "visible" }}>
        <MapGL
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

          {/* Main listing pin — always on top of POI markers */}
          <Marker
            latitude={latitude}
            longitude={longitude}
            anchor="bottom"
            style={{ zIndex: 10 }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: PIN_COLOR,
                border: `3.5px solid ${PIN_BORDER_COLOR}`,
                borderRadius: "50% 50% 50% 0",
                transform: "rotate(-45deg)",
                boxShadow: "0 3px 10px rgba(0,0,0,0.4)",
              }}
            />
          </Marker>

          {/* POI popup */}
          {selectedPoi && (
            <Popup
              latitude={selectedPoi.latitude}
              longitude={selectedPoi.longitude}
              onClose={() => setSelectedPoi(null)}
              closeOnClick={false}
              offset={[0, -18]}
              maxWidth="220px"
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
        </MapGL>
      </div>
    </div>
  );
}
