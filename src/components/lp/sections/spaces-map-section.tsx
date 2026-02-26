"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MapPin } from "lucide-react"
import MapGL, { NavigationControl } from "react-map-gl/mapbox"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { MapRef } from "react-map-gl/mapbox"

import { Section } from "@/components/lp/ui/section"
import { LPButton } from "@/components/lp/ui/lp-button"
import { SpaceCard } from "@/components/lp/sections/space-card"
import { ListingCTABanner } from "@/components/lp/sections/listing-cta-section"
import { getFeaturedSpaces } from "@/lib/lp/spaces-data"
import type { FeaturedSpace } from "@/lib/lp/spaces-data"
import type { LPCity } from "@/lib/lp/types"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SpacesMapSectionProps {
  city: LPCity
  searchParams: Record<string, string | string[] | undefined>
}

// ---------------------------------------------------------------------------
// Map with price-label pins (internal)
// ---------------------------------------------------------------------------

interface SpacePinMapProps {
  spaces: FeaturedSpace[]
  hoveredSpaceId: string | null
  onPinClick: (spaceId: string) => void
}

function SpacePinMap({ spaces, hoveredSpaceId, onPinClick }: SpacePinMapProps) {
  const mapRef = useRef<MapRef>(null)
  const markersRef = useRef<Map<string, { marker: mapboxgl.Marker; el: HTMLElement }>>(new Map())
  const [mapLoaded, setMapLoaded] = useState(false)

  // Calculate center from first space or fallback to Berlin
  const centerLng = spaces[0]?.coordinates[0] ?? 13.405
  const centerLat = spaces[0]?.coordinates[1] ?? 52.52

  const handleLoad = useCallback(() => {
    setMapLoaded(true)
  }, [])

  // Add/update price-label markers once map is loaded
  useEffect(() => {
    if (!mapLoaded) return
    const map = mapRef.current?.getMap()
    if (!map) return

    // Remove old markers
    markersRef.current.forEach(({ marker }) => marker.remove())
    markersRef.current.clear()

    // Create markers for each space
    spaces.forEach((space) => {
      const el = document.createElement("div")
      el.className =
        "space-pin bg-white text-foreground border border-border shadow-sm px-2 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-150 hover:bg-primary hover:text-primary-foreground select-none whitespace-nowrap"
      el.textContent = space.priceLabel
      el.setAttribute("data-space-id", space.id)
      el.setAttribute("role", "button")
      el.setAttribute("aria-label", `${space.name}: ${space.priceLabel}`)
      el.setAttribute("tabindex", "0")

      el.addEventListener("click", (e) => {
        e.stopPropagation()
        onPinClick(space.id)
      })
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          e.stopPropagation()
          onPinClick(space.id)
        }
      })

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat(space.coordinates)
        .addTo(map)

      markersRef.current.set(space.id, { marker, el })
    })

    // Fit bounds to all markers with padding
    if (spaces.length > 1) {
      const bounds = new mapboxgl.LngLatBounds()
      spaces.forEach((space) => bounds.extend(space.coordinates))
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 400 })
    }

    const currentMarkers = markersRef.current
    return () => {
      currentMarkers.forEach(({ marker }) => marker.remove())
      currentMarkers.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, spaces])

  // Update highlight state when hoveredSpaceId changes
  useEffect(() => {
    markersRef.current.forEach(({ el }, spaceId) => {
      if (spaceId === hoveredSpaceId) {
        el.classList.add("bg-primary", "text-primary-foreground")
        el.classList.remove("bg-white", "text-foreground")
      } else {
        el.classList.remove("bg-primary", "text-primary-foreground")
        el.classList.add("bg-white", "text-foreground")
      }
    })
  }, [hoveredSpaceId])

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        latitude: centerLat,
        longitude: centerLng,
        zoom: 12,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      scrollZoom={false}
      onLoad={handleLoad}
      aria-label={`Karte mit Büroflächen und Coworking Spaces`}
    >
      <NavigationControl position="top-right" />
    </MapGL>
  )
}

// ---------------------------------------------------------------------------
// SpacesMapSection
// ---------------------------------------------------------------------------

/**
 * SpacesMapSection — Airbnb-style split-view listing section for the Improved Listing variant.
 *
 * Desktop: 60% left scrollable cards grid (2-col) + 40% right sticky Mapbox map.
 * Mobile: 1-column cards + collapsible map toggle below.
 *
 * Features:
 * - Price-label pins on map (matching Airbnb/ImmobilienScout style)
 * - Bi-directional: card hover highlights pin; pin click scrolls to card
 * - ListingCTABanner inserted after every 3rd card
 * - Returns null if no spaces found for this city
 *
 * "use client" — requires useState/useEffect for interaction state.
 *
 * @example
 * <SpacesMapSection city={city} searchParams={searchParams} />
 */
export function SpacesMapSection({ city }: SpacesMapSectionProps) {
  const spaces = getFeaturedSpaces(city.slug)

  const [hoveredSpaceId, setHoveredSpaceId] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)

  // Ref map for card scrollIntoView on pin click
  const cardRefsMap = useRef<Map<string, HTMLDivElement>>(new Map())

  // Don't render if no spaces for this city
  if (spaces.length === 0) return null

  function handlePinClick(spaceId: string) {
    const cardEl = cardRefsMap.current.get(spaceId)
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }

  function handleCardHover(spaceId: string | null) {
    setHoveredSpaceId(spaceId)
  }

  // Build the interleaved cards + CTA list
  const cardItems: React.ReactNode[] = []
  spaces.forEach((space, index) => {
    cardItems.push(
      <div
        key={space.id}
        id={space.id}
        ref={(el) => {
          if (el) {
            cardRefsMap.current.set(space.id, el)
          } else {
            cardRefsMap.current.delete(space.id)
          }
        }}
      >
        <SpaceCard
          space={space}
          onHover={handleCardHover}
        />
      </div>
    )

    // Insert CTA banner after every 3rd card (0-indexed: after index 2, 5, 8…)
    if ((index + 1) % 3 === 0 && index + 1 < spaces.length) {
      cardItems.push(
        <div key={`cta-${index}`} className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2">
          <ListingCTABanner />
        </div>
      )
    }
  })

  return (
    <Section id="spaces" background="surface">
      {/* Section headline */}
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Unsere Top-Empfehlungen für {city.name}
      </h2>

      {/* --- Desktop split layout (md+) --- */}
      <div className="hidden md:flex gap-6 items-start">
        {/* Left: Scrollable cards column (~60%) */}
        <div
          className="flex-[3] min-w-0 overflow-y-auto pr-2"
          style={{ maxHeight: "calc(100vh - 200px)" }}
          aria-label="Büroraum-Karten"
        >
          <div className="grid grid-cols-2 gap-4">
            {cardItems}
          </div>
        </div>

        {/* Right: Sticky map column (~40%) */}
        <div
          className="flex-[2] sticky top-4 rounded-xl overflow-hidden border border-border shadow-sm"
          style={{ height: "calc(100vh - 200px)" }}
          aria-label="Kartenansicht"
        >
          <SpacePinMap
            spaces={spaces}
            hoveredSpaceId={hoveredSpaceId}
            onPinClick={handlePinClick}
          />
        </div>
      </div>

      {/* --- Mobile layout (< md) --- */}
      <div className="md:hidden">
        {/* Single-column cards */}
        <div className="flex flex-col gap-4">
          {spaces.map((space, index) => (
            <div key={space.id} id={space.id}>
              <SpaceCard
                space={space}
                onHover={handleCardHover}
              />
              {/* Insert CTA banner after every 3rd card on mobile */}
              {(index + 1) % 3 === 0 && index + 1 < spaces.length && (
                <div className="mt-4">
                  <ListingCTABanner />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile map toggle */}
        <div className="mt-6">
          <LPButton
            variant="ghost"
            size="default"
            onClick={() => setShowMap((v) => !v)}
            className="w-full border border-border"
            aria-expanded={showMap}
            aria-controls="mobile-map"
          >
            <MapPin className="size-4" aria-hidden="true" />
            {showMap ? "Karte ausblenden" : "Karte anzeigen"}
          </LPButton>

          {showMap && (
            <div
              id="mobile-map"
              className={cn(
                "mt-3 w-full rounded-xl overflow-hidden border border-border shadow-sm",
                "transition-all duration-300"
              )}
              style={{ height: 360 }}
              aria-label="Mobile Kartenansicht"
            >
              <SpacePinMap
                spaces={spaces}
                hoveredSpaceId={hoveredSpaceId}
                onPinClick={handlePinClick}
              />
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
