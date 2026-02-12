"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import MapGL, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
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

/* eslint-disable @typescript-eslint/no-explicit-any */

interface GeoJSONFC {
  type: "FeatureCollection";
  features: any[];
}

const OVERLAY_TOGGLES = [
  { id: "ubahn", label: "U-Bahn", icon: "🚇" },
  { id: "sbahn", label: "S-Bahn", icon: "🚈" },
] as const;

function addFeatureIds(geojson: GeoJSONFC): GeoJSONFC {
  return {
    ...geojson,
    features: geojson.features.map((f, i) => ({ ...f, id: i })),
  };
}

function filterByRoute(geojson: GeoJSONFC, routeType: "subway" | "sbahn"): GeoJSONFC {
  return {
    type: "FeatureCollection",
    features: geojson.features.filter((f) =>
      routeType === "subway"
        ? f.properties.route === "subway"
        : f.properties.route !== "subway"
    ),
  };
}

async function fetchCached<T>(cacheKey: string, fetcher: () => Promise<T>): Promise<T> {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts < 24 * 60 * 60 * 1000) return data;
    }
  } catch { /* ignore */ }

  const data = await fetcher();

  try { localStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() })); } catch { /* ignore */ }
  return data;
}

async function fetchTransitLines(lat: number, lng: number): Promise<GeoJSONFC> {
  return fetchCached(`transit-lines-${lat.toFixed(3)}-${lng.toFixed(3)}`, async () => {
    const res = await fetch(`/api/transit-lines?lat=${lat}&lng=${lng}`);
    return res.json();
  });
}

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

// Helper to manage a single transit layer (ubahn or sbahn)
function setupTransitLayer(
  map: mapboxgl.Map,
  id: string,
  data: GeoJSONFC,
  popupRef: React.MutableRefObject<mapboxgl.Popup | null>,
) {
  const sourceId = `transit-${id}-source`;
  const layerId = `transit-${id}-layer`;
  const hoverLayerId = `transit-${id}-hover`;
  const indexed = addFeatureIds(data);

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, { type: "geojson", data: indexed });
  }
  if (!map.getLayer(layerId)) {
    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": ["get", "colour"],
        "line-width": ["case", ["boolean", ["feature-state", "hover"], false], 5, 3],
        "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.7],
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });
  }
  if (!map.getLayer(hoverLayerId)) {
    map.addLayer({
      id: hoverLayerId,
      type: "line",
      source: sourceId,
      paint: { "line-color": "transparent", "line-width": 14 },
    });
  }

  const onMouseMove = (e: any) => {
    if (!e.features?.length) return;
    map.getCanvas().style.cursor = "pointer";
    const feature = e.features[0];
    map.setFeatureState({ source: sourceId, id: feature.id }, { hover: true });
    if (popupRef.current) popupRef.current.remove();
    const colour = feature.properties?.colour || "#888";
    const ref = feature.properties?.ref || "";
    popupRef.current = new mapboxgl.Popup({
      closeButton: false, closeOnClick: false,
      className: "transit-line-tooltip", offset: 12,
    })
      .setLngLat(e.lngLat)
      .setHTML(`<span style="background:${colour};color:white;padding:2px 8px;border-radius:4px;font-weight:600;font-size:13px;">${ref}</span>`)
      .addTo(map);
  };

  const onMouseLeave = () => {
    map.getCanvas().style.cursor = "";
    for (const f of indexed.features) {
      map.setFeatureState({ source: sourceId, id: f.id }, { hover: false });
    }
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
  };

  map.on("mousemove", hoverLayerId, onMouseMove);
  map.on("mouseleave", hoverLayerId, onMouseLeave);

  return () => {
    map.off("mousemove", hoverLayerId, onMouseMove);
    map.off("mouseleave", hoverLayerId, onMouseLeave);
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
  };
}

function removeTransitLayer(map: mapboxgl.Map, id: string) {
  const sourceId = `transit-${id}-source`;
  const layerId = `transit-${id}-layer`;
  const hoverLayerId = `transit-${id}-hover`;
  if (map.getLayer(hoverLayerId)) map.removeLayer(hoverLayerId);
  if (map.getLayer(layerId)) map.removeLayer(layerId);
  if (map.getSource(sourceId)) map.removeSource(sourceId);
}

export default function SearchMapInner({
  listings,
  hoveredId,
  center,
}: SearchMapInnerProps) {
  const mapRef = useRef<MapRef>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const didFit = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [overlayActive, setOverlayActive] = useState<Set<string>>(new Set());
  const [transitLines, setTransitLines] = useState<GeoJSONFC | null>(null);
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const transitPopupRef = useRef<mapboxgl.Popup | null>(null);

  const initialViewState = center
    ? { latitude: center.lat, longitude: center.lng, zoom: CITY_ZOOM }
    : { ...GERMANY_CENTER, zoom: DEFAULT_ZOOM };

  // Prefetch data
  useEffect(() => {
    if (!center) return;
    let cancelled = false;
    fetchTransitLines(center.lat, center.lng).then((d) => { if (!cancelled) setTransitLines(d); }).catch(() => {});
    return () => { cancelled = true; };
  }, [center?.lat, center?.lng]);

  // U-Bahn layer
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current.getMap();
    if (overlayActive.has("ubahn") && transitLines) {
      const data = filterByRoute(transitLines, "subway");
      const cleanup = setupTransitLayer(map, "ubahn", data, transitPopupRef);
      return () => { cleanup(); removeTransitLayer(map, "ubahn"); };
    } else {
      removeTransitLayer(map, "ubahn");
    }
  }, [overlayActive, transitLines, mapLoaded]);

  // S-Bahn layer
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current.getMap();
    if (overlayActive.has("sbahn") && transitLines) {
      const data = filterByRoute(transitLines, "sbahn");
      const cleanup = setupTransitLayer(map, "sbahn", data, transitPopupRef);
      return () => { cleanup(); removeTransitLayer(map, "sbahn"); };
    } else {
      removeTransitLayer(map, "sbahn");
    }
  }, [overlayActive, transitLines, mapLoaded]);

  // Fly to city center
  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.flyTo({ center: [center.lng, center.lat], zoom: CITY_ZOOM, duration: 800 });
    }
  }, [center?.lat, center?.lng]);

  // Fit bounds (search page)
  const handleLoad = useCallback(() => {
    setMapLoaded(true);
    if (!center && listings.length > 0 && mapRef.current && !didFit.current) {
      const lngs = listings.map((l) => l.longitude);
      const lats = listings.map((l) => l.latitude);
      mapRef.current.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 40, maxZoom: 14 },
      );
      didFit.current = true;
    }
  }, [center, listings]);

  const toggleOverlay = async (id: string) => {
    const willBeActive = !overlayActive.has(id);
    if (willBeActive) {
      if ((id === "ubahn" || id === "sbahn") && !transitLines && center) {
        setLoading((p) => new Set(p).add(id));
        try { setTransitLines(await fetchTransitLines(center.lat, center.lng)); } catch { /* ignore */ }
        setLoading((p) => { const n = new Set(p); n.delete(id); return n; });
      }
    }
    setOverlayActive((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeListing = activeId ? listings.find((l) => l.id === activeId) : null;

  const ubahnCount = transitLines ? filterByRoute(transitLines, "subway").features.length : undefined;
  const sbahnCount = transitLines ? filterByRoute(transitLines, "sbahn").features.length : undefined;

  function getCount(id: string) {
    if (id === "ubahn") return ubahnCount;
    return sbahnCount;
  }

  return (
    <div className="relative h-full w-full">
      {center && (
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          {OVERLAY_TOGGLES.map((t) => {
            const isOn = overlayActive.has(t.id);
            const isLoading = loading.has(t.id);
            const count = getCount(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleOverlay(t.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors ${
                  isOn
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {isLoading ? (
                  <span className="text-slate-400">…</span>
                ) : count !== undefined ? (
                  <span className="ml-0.5 rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

    <MapGL
      ref={mapRef}
      initialViewState={initialViewState}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_STYLE}
      mapboxAccessToken={MAPBOX_TOKEN}
      scrollZoom={true}
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
            onClick={(e) => { e.originalEvent.stopPropagation(); setActiveId(listing.id); }}
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
            style={{ textDecoration: "none", color: "inherit", display: "block", minWidth: 180 }}
          >
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: "#0f172a" }}>
              {activeListing.name}
            </p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
              {activeListing.address}, {activeListing.city}
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, margin: "6px 0 0", color: "#2563EB" }}>
              ab {activeListing.priceFrom} €/Monat →
            </p>
          </a>
        </Popup>
      )}
    </MapGL>
    </div>
  );
}
