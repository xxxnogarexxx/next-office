---
phase: 05-ux-and-reliability
plan: "01"
subsystem: ux-error-handling
tags: [404, error-boundary, routing, empty-state, datenschutz]
dependency_graph:
  requires: []
  provides: [branded-404, main-error-boundary, city-notfound, empty-states]
  affects: [src/app/not-found.tsx, src/app/(main)/error.tsx, src/app/(main)/[city]/page.tsx, src/app/(main)/datenschutz/page.tsx, src/components/search-listings-client.tsx, src/components/city-listings-client.tsx]
tech_stack:
  added: []
  patterns: [notFound-guard, error-boundary, empty-state-with-cta]
key_files:
  created:
    - src/app/not-found.tsx
    - src/app/(main)/error.tsx
  modified:
    - src/app/(main)/[city]/page.tsx
    - src/app/(main)/datenschutz/page.tsx
    - src/components/search-listings-client.tsx
    - src/components/city-listings-client.tsx
decisions:
  - "not-found.tsx is a server component (no use client) — renders inside root layout where Tailwind CSS is loaded"
  - "error.tsx uses Tailwind classes (unlike global-error.tsx which uses inline styles) — renders inside main layout"
  - "city page now bails early with notFound() before computing displayListings — no fallback to cardListings for unknown slugs"
  - "empty state replaces the grid entirely when listings.length === 0; map panel still renders (no listings to pin)"
metrics:
  duration: "~2min"
  completed: "2026-02-26"
  tasks_completed: 2
  files_modified: 6
---

# Phase 05 Plan 01: Branded 404, Error Boundary, City Routing Fix, and Empty States Summary

**One-liner:** Branded 404/error pages with Sentry reporting, notFound() guard for invalid city slugs, Datenschutz Mapbox fix, and empty-state UX with CTAs for zero-result searches.

## What Was Built

### Task 1: Branded 404 page and main-layout error boundary

**`src/app/not-found.tsx`** (new) — Next.js App Router not-found handler:
- Renders inside root layout (server component, no "use client")
- NextOffice brand mark, large "404" heading, German copy
- Primary CTA: "Zur Startseite" (/) and secondary link "Alle Büros durchsuchen" (/search)
- Tailwind classes throughout

**`src/app/(main)/error.tsx`** (new) — Main-layout error boundary:
- "use client" as required by Next.js error boundaries
- `Sentry.captureException(error)` in useEffect
- "Erneut versuchen" retry button and "Zur Startseite" link
- Tailwind classes (renders inside main layout where CSS is available)

### Task 2: City routing fix, Datenschutz correction, and empty states

**`src/app/(main)/[city]/page.tsx`** (modified) — Invalid city slugs now 404:
- Added `notFound` import from "next/navigation"
- Guard: `if (!city) notFound();` immediately after `getCityBySlug()`
- Removed fallback to `cardListings` for unknown slugs — invalid routes return proper 404
- Removed null coalescing on `city.name` (safe since we bail early)
- Removed `cardListings` import (no longer needed)

**`src/app/(main)/datenschutz/page.tsx`** (modified) — Section 6 accuracy fix:
- Replaced "OpenStreetMap" with "Mapbox" in all references
- Added correct privacy URL: `https://www.mapbox.com/legal/privacy`

**`src/components/search-listings-client.tsx`** (modified) — Zero-result empty state:
- When `listings.length === 0`: renders centered empty state with "Keine Büros gefunden" heading, descriptive text, "Kontakt aufnehmen" CTA link, and "Alle Städte anzeigen" text link
- When listings exist: renders the existing grid (unchanged behavior)

**`src/components/city-listings-client.tsx`** (modified) — Zero-result empty state:
- When `displayListings.length === 0`: renders "Noch keine Büros in {cityName}" with city-specific messaging, "Kontakt aufnehmen" and "Alle Büros durchsuchen" links
- When listings exist: renders the full grid + CTA banner (unchanged behavior, wrapped in fragment)

## Verification Results

All 7 checks passed:
1. `src/app/not-found.tsx` exists, contains "404" and "Startseite"
2. `src/app/(main)/error.tsx` exists with "use client" and captureException
3. `src/app/(main)/[city]/page.tsx` calls notFound() for invalid slugs
4. `src/app/(main)/datenschutz/page.tsx` references Mapbox, not OpenStreetMap
5. `src/components/search-listings-client.tsx` handles zero results
6. `src/components/city-listings-client.tsx` handles zero results
7. `npx tsc --noEmit` — zero errors

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | ae97c8d | feat(05-01): create branded 404 page and main-layout error boundary |
| 2 | 65b34f4 | feat(05-01): fix city 404 routing, Datenschutz Mapbox reference, and empty state UX |

## Self-Check: PASSED
