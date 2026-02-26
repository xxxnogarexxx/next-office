---
phase: 04-performance-architecture
plan: 02
subsystem: ui
tags: [nextjs, react, server-components, ssr, ssg, typescript]

# Dependency graph
requires:
  - phase: 04-01
    provides: ListingCard type, cardListings export, getCardListingsByCity, listings-card.json split
provides:
  - Server component city page passing card listings as serialized props to CityListingsClient
  - Server component search page passing card listings as serialized props to SearchListingsClient
  - CityListingsClient island — hover, map toggle, lead dialog interactivity
  - SearchListingsClient island — hover and map toggle interactivity
  - generateStaticParams on city page for SSG across all city slugs
  - generateStaticParams on listing detail page for SSG across all listing slugs
affects: [05-seo-content]

# Tech tracking
tech-stack:
  added: []
  patterns: [server-component-with-client-island, generateStaticParams-for-ssg]

key-files:
  created:
    - src/components/city-listings-client.tsx
    - src/components/search-listings-client.tsx
  modified:
    - src/app/(main)/[city]/page.tsx
    - src/app/(main)/search/page.tsx
    - src/app/(main)/[city]/[listing]/page.tsx
    - src/components/search-map.tsx
    - src/components/search-map-inner.tsx

key-decisions:
  - "SearchMap and SearchMapInner updated to accept ListingCard[] instead of Listing[] — all fields used by map popup (id, name, slug, citySlug, address, city, coverPhoto, photos, latitude, longitude, capacityMin, capacityMax, priceFrom) are present in ListingCard"
  - "City page falls back to cardListings when no city-specific listings found — preserves existing behavior for unknown slugs"
  - "generateStaticParams added to both city page and listing detail page — both sets of dynamic routes now SSG"

patterns-established:
  - "Server component wraps client island: server fetches/passes data, client handles interactivity only"
  - "ListingCard type as the serialization boundary between server and client — lightweight, no full Listing payload in browser"

requirements-completed: [PERF-02, PERF-03]

# Metrics
duration: 3min
completed: 2026-02-26
---

# Phase 4 Plan 02: Server Components + SSG Summary

**City and search pages converted from fully client-rendered to server components with client islands, using ListingCard[] as the serialization boundary, plus generateStaticParams for SSG on city and listing detail routes**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-26T02:46:53Z
- **Completed:** 2026-02-26T02:50:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- City page is now a server component — HTML pre-rendered with listing content, no `"use client"`, listings data never sent in client bundle
- Search page is now a server component — passes cardListings as props to SearchListingsClient
- CityListingsClient and SearchListingsClient are client islands handling all interactive state (hover, map toggle, lead dialog)
- generateStaticParams on city page generates static pages for all city slugs at build time
- generateStaticParams on listing detail page generates static pages for all city+listing slug combinations
- SearchMap and SearchMapInner updated to accept ListingCard[] — removes dependency on full Listing type in client-side map

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor city and search pages to server components with client islands** - `919369d` (feat)
2. **Task 2: Add generateStaticParams to listing detail page** - `c0fd5e2` (feat)

## Files Created/Modified
- `src/components/city-listings-client.tsx` — Client island for city page: hover, map toggle, lead dialog state
- `src/components/search-listings-client.tsx` — Client island for search page: hover and map toggle state
- `src/app/(main)/[city]/page.tsx` — Server component with generateStaticParams; passes card listings to CityListingsClient
- `src/app/(main)/search/page.tsx` — Server component; passes cardListings to SearchListingsClient
- `src/app/(main)/[city]/[listing]/page.tsx` — Added generateStaticParams for all listing routes
- `src/components/search-map.tsx` — Updated interface from Listing[] to ListingCard[]
- `src/components/search-map-inner.tsx` — Updated interface from Listing[] to ListingCard[]

## Decisions Made
- SearchMap/SearchMapInner updated to accept ListingCard[] because all fields needed for map popup rendering are already in ListingCard — clean type narrowing without losing functionality
- City page falls back to cardListings (all listings) when no city-specific listings found, matching pre-refactor behavior
- generateStaticParams placed on both city and listing pages — both dynamic segments now SSG

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated SearchMap and SearchMapInner to accept ListingCard[] instead of Listing[]**
- **Found during:** Task 1 (creating CityListingsClient/SearchListingsClient)
- **Issue:** SearchMap/SearchMapInner interfaces required Listing[] but client islands receive ListingCard[] — TypeScript would fail to compile
- **Fix:** Updated import and interface in both search-map.tsx and search-map-inner.tsx to use ListingCard
- **Files modified:** src/components/search-map.tsx, src/components/search-map-inner.tsx
- **Verification:** npx tsc --noEmit passes with zero errors
- **Committed in:** 919369d (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - type correction required for compilation)
**Impact on plan:** Required fix — without it, TypeScript would reject the ListingCard[] prop. Plan noted this possibility under "IMPORTANT for SearchMap compatibility". All fields used by SearchMapInner are present in ListingCard.

## Issues Encountered
None — TypeScript check passed with zero errors after updating SearchMap interfaces.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- City and search pages now SSG-ready with server-rendered HTML containing listing content
- Client islands preserve all interactivity (hover, map toggle, lead dialog)
- Full listings.json payload no longer sent to browser on city/search page visits
- Phase 5 (SEO/Content) can rely on server-rendered HTML for meta tags and structured data

---
*Phase: 04-performance-architecture*
*Completed: 2026-02-26*
