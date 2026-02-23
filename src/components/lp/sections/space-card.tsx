"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { LPBadge } from "@/components/lp/ui/badge"
import type { FeaturedSpace } from "@/lib/lp/spaces-data"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SpaceCardProps {
  /** The featured space data to display. */
  space: FeaturedSpace
  /** Optional callback when the card is clicked. Receives the full space object. */
  onSpaceClick?: (space: FeaturedSpace) => void
  /** Optional hover callback for bi-directional map interaction. */
  onHover?: (spaceId: string | null) => void
  className?: string
}

// ---------------------------------------------------------------------------
// Photo Carousel (internal)
// ---------------------------------------------------------------------------

interface PhotoCarouselProps {
  photos: string[]
  name: string
  highlighted?: boolean
}

function PhotoCarousel({ photos, name, highlighted }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const hasMultiple = photos.length > 1

  function prev(e: React.MouseEvent) {
    e.stopPropagation()
    setCurrentIndex((i) => (i === 0 ? photos.length - 1 : i - 1))
  }

  function next(e: React.MouseEvent) {
    e.stopPropagation()
    setCurrentIndex((i) => (i === photos.length - 1 ? 0 : i + 1))
  }

  return (
    <div className="relative aspect-[3/2] overflow-hidden bg-muted group/carousel">
      {/* Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[currentIndex]}
        alt={`${name} — Foto ${currentIndex + 1}`}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          // Graceful fallback: hide broken image, show muted background
          ;(e.target as HTMLImageElement).style.display = "none"
        }}
      />

      {/* Top-Empfehlung badge */}
      {highlighted && (
        <div className="absolute top-2 left-2 z-10">
          <LPBadge variant="highlight">Top-Empfehlung</LPBadge>
        </div>
      )}

      {/* Navigation arrows — visible on hover (desktop) or always (mobile) */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Vorheriges Foto"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10",
              "size-8 rounded-full bg-white/80 backdrop-blur-sm",
              "flex items-center justify-center",
              "transition-opacity duration-150",
              // Always visible on mobile; hover-only on desktop
              "opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100",
              "hover:bg-white focus-visible:opacity-100"
            )}
          >
            <ChevronLeft className="size-4 text-foreground" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Nächstes Foto"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10",
              "size-8 rounded-full bg-white/80 backdrop-blur-sm",
              "flex items-center justify-center",
              "transition-opacity duration-150",
              "opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100",
              "hover:bg-white focus-visible:opacity-100"
            )}
          >
            <ChevronRight className="size-4 text-foreground" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {hasMultiple && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(i)
              }}
              aria-label={`Foto ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-150",
                i === currentIndex
                  ? "size-2 bg-white"
                  : "size-1.5 bg-white/60 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SpaceCard
// ---------------------------------------------------------------------------

/**
 * SpaceCard — compact card for a single featured coworking space.
 *
 * Renders a photo carousel (2–3 images with arrow navigation and dot indicators)
 * and space details: name, district, capacity, amenities, and price range.
 *
 * On click: scrolls to the #anfrage form and calls onSpaceClick so the parent
 * can pre-fill the inquiry form with this space's name and city.
 *
 * Supports bi-directional map interaction via the onHover callback.
 *
 * "use client" — requires useState for photo carousel state.
 *
 * @example
 * <SpaceCard
 *   space={space}
 *   onSpaceClick={(s) => setSelectedSpace(s)}
 *   onHover={(id) => setHoveredSpaceId(id)}
 * />
 */
export function SpaceCard({ space, onSpaceClick, onHover, className }: SpaceCardProps) {
  function handleClick() {
    // Fire parent callback for form pre-fill
    onSpaceClick?.(space)
    // Scroll to the lead form
    const form = document.getElementById("anfrage")
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick()
        }
      }}
      onMouseEnter={() => onHover?.(space.id)}
      onMouseLeave={() => onHover?.(null)}
      aria-label={`${space.name} in ${space.district} ansehen`}
      className={cn(
        // Card base
        "group rounded-xl overflow-hidden border border-border bg-white",
        "shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer",
        className
      )}
    >
      {/* Photo carousel */}
      <PhotoCarousel
        photos={space.photos}
        name={space.name}
        highlighted={space.highlighted}
      />

      {/* Content area */}
      <div className="p-4">
        {/* Name + district */}
        <div className="mb-2">
          <p className="font-semibold text-base text-foreground leading-tight">
            {space.name}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">{space.district}</p>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <Users className="size-4 shrink-0" aria-hidden="true" />
          <span>{space.capacity}</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {space.amenities.slice(0, 3).map((amenity) => (
            <LPBadge key={amenity} variant="default">
              {amenity}
            </LPBadge>
          ))}
        </div>

        {/* Price */}
        <p className="font-semibold text-sm text-primary">{space.priceRange}</p>
      </div>
    </article>
  )
}
