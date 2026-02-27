---
phase: 04-performance-architecture
plan: "03"
subsystem: ui
tags: [next.js, react, mapbox, intersection-observer, carousel, lazy-loading, performance]

# Dependency graph
requires:
  - phase: 04-01
    provides: ListingCard component with photos field, listing-map.tsx wrapper pattern
provides:
  - IntersectionObserver-gated ListingMap wrapper that defers Mapbox GL bundle load until scroll
  - ImageCarousel with on-demand photo rendering — only visited photos get <Image> elements
affects: [05-seo-cleanup, 06-launch]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - IntersectionObserver viewport gate — defer heavy dynamic imports until element approaches viewport
    - Loaded-set pattern — track visited carousel indices, render only those, never re-unrender

key-files:
  created: []
  modified:
    - src/components/listing-map.tsx
    - src/components/listing-card.tsx

key-decisions:
  - "rootMargin: 200px on IntersectionObserver — starts loading Mapbox 200px before viewport to allow time for ~200KB bundle download"
  - "minHeight: 560 on map container — prevents layout shift during lazy load transition"
  - "Loaded Set initialized with [0] — first photo always renders, subsequent photos mount on first navigation"
  - "Previously-visited photos stay rendered (not removed) — enables smooth opacity transitions on back-navigation"

patterns-established:
  - "IntersectionObserver gate pattern: containerRef + inView state + useEffect observer — reusable for any heavy below-fold component"
  - "Loaded-set pattern: Set<number> tracking visited indices, goTo() updates both current + loaded atomically"

requirements-completed: [PERF-04, PERF-05]

# Metrics
duration: 1min
completed: 2026-02-26
---

# Phase 4 Plan 03: Viewport-gated Mapbox lazy load and on-demand carousel photo rendering

**IntersectionObserver gate defers Mapbox GL (~200KB) until map section scrolls into view; carousel renders only visited photos via a loaded-index Set — eliminating all-photos-on-mount network requests.**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-26T02:46:38Z
- **Completed:** 2026-02-26T02:47:42Z
- **Tasks:** 2 completed
- **Files modified:** 2

## Accomplishments

- Mapbox GL JS bundle (~200KB gzipped) no longer loads on listing detail page initial render — deferred until map section enters viewport (with 200px lead margin)
- ListingCard carousel now renders only 1 image on initial page load instead of all photos — each additional photo is only mounted when navigated to
- Both optimizations preserve full visual fidelity: map loads seamlessly on scroll, carousel back-navigation shows smooth opacity transitions because previously-visited photos remain mounted

## Task Commits

Each task was committed atomically:

1. **Task 1: Lazy-load Mapbox GL via IntersectionObserver** - `3f9a166` (feat)
2. **Task 2: Optimize ListingCard carousel to render only visible photo** - `5fd170b` (feat)

**Plan metadata:** (docs commit after summary)

## Files Created/Modified

- `src/components/listing-map.tsx` — Added IntersectionObserver wrapper; defers ListingMapInner dynamic import until 200px from viewport; shows static placeholder before map loads
- `src/components/listing-card.tsx` — Added `loaded` Set state and `goTo()` helper; photos render only when navigated to; first photo always pre-rendered

## Decisions Made

- `rootMargin: "200px"` on IntersectionObserver gives Mapbox bundle time to download before user reaches the map section — balances lazy loading benefit with perceived performance
- `minHeight: 560` on the container div prevents cumulative layout shift (CLS) when Mapbox loads and expands
- Loaded Set initialized with `new Set([0])` — index 0 always present so the first photo renders on mount without any navigation needed
- Previously-visited photos stay mounted (not removed from DOM) — ensures opacity transition is smooth when the user navigates back to a previously-viewed photo

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Mapbox lazy loading and carousel optimization complete — PERF-04 and PERF-05 satisfied
- Phase 4 all plans now complete; ready for Phase 5 (SEO cleanup) or Phase 6 (launch)
- No blockers

---
*Phase: 04-performance-architecture*
*Completed: 2026-02-26*
