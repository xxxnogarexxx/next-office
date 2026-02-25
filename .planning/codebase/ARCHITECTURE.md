# Architecture

**Analysis Date:** 2026-02-25

## Pattern Overview

**Overall:** Next.js 16 App Router with route groups separating two distinct user journeys: main site (B2B search/discovery) and landing pages (LP high-conversion acquisition).

**Key Characteristics:**
- Route-group isolation: `(main)` and `(lp)` use different headers, layouts, tracking, and styling
- Static-first: Listings and cities loaded from JSON files, not databases (speed, zero latency)
- Lead capture as primary backend function: forms submit to `/api/leads` which persists to Supabase and notifies via Resend email
- Mapbox GL for location visualization (search map, listing detail map)
- Server-side cookie middleware for Google Ads attribution (gclid/gbraid/wbraid), with client-side React context as primary fallback
- Mixed server/client architecture: Pages render as server components with "use client" children for interactivity

## Layers

**Presentation (UI Components):**
- Purpose: Render interactive interfaces and forms
- Location: `src/components/`
- Contains: React components (buttons, forms, maps, cards, galleries, dialogs)
- Depends on: `src/lib/listings`, `src/lib/utils`, Mapbox GL, Lucide icons, shadcn/ui, Tailwind CSS
- Used by: All pages and layouts

**Page/Route Layer:**
- Purpose: Define URL routes, SEO metadata, and server-side page logic
- Location: `src/app/` (organized by route group: `(main)`, `(lp)`)
- Contains: Next.js page.tsx files, layout.tsx files, API routes
- Depends on: Presentation components, lib utilities, external APIs (Supabase, Resend, Overpass)
- Used by: Next.js router directly

**Business Logic / Data Layer:**
- Purpose: Provide data access, domain logic, and utility functions
- Location: `src/lib/`
- Contains: TypeScript utilities (listings.ts, types.ts, blog.ts, map-config.ts)
- Depends on: Static data files (`src/data/listings.json`, `src/data/cities.json`)
- Used by: Page components, presentation components

**Data Storage:**
- Purpose: Provide structured data for the application
- Location: `src/data/` (static JSON files)
- Contains: `listings.json` (630KB, all office listings), `cities.json` (cities metadata)
- Depends on: Nothing
- Used by: `src/lib/listings.ts`

**API Routes / Backend:**
- Purpose: Server-side operations: lead capture, Mapbox queries, Overpass transit data
- Location: `src/app/(main)/api/` and `src/app/(lp)/api/`
- Contains: Next.js route handlers (POST/GET)
- Depends on: Supabase client, Resend, Overpass API, middleware
- Used by: Client-side fetch calls from components

**Middleware:**
- Purpose: Server-side request preprocessing for attribute tracking
- Location: `src/middleware.ts`
- Contains: Cookie-setting logic for Google Ads click IDs (gclid, gbraid, wbraid)
- Depends on: Next.js request/response objects
- Used by: Next.js request pipeline (all routes except static assets)

## Data Flow

**Listing Discovery Flow:**

1. User lands on homepage (`/`) → server renders `src/app/(main)/page.tsx`
2. Page reads `cities` from `src/lib/listings.ts` (which imports `src/data/cities.json`)
3. Cities rendered as clickable cards, each linking to `/{city}` route
4. User navigates to `/{city}` → `src/app/(main)/[city]/page.tsx` renders
5. Page reads city listings from `src/lib/listings.getListingsByCity()`
6. Listings displayed as `ListingCard` components with hover-to-map interaction
7. User clicks a listing → navigates to `/{city}/{listing}`
8. Detail page (`src/app/(main)/[city]/[listing]/page.tsx`) renders with full metadata, photos, map, amenities

**Lead Capture Flow:**

1. User fills form (one of several variants: LeadForm, LeadDialog, embedded on pages)
2. `src/components/lead-form.tsx` collects: name, email, phone, teamSize, startDate, city, message, listingId
3. Reads `useTracking()` context (Google Ads params from URL)
4. Form submits POST to `/api/leads` with JSON body
5. `src/app/(main)/api/leads/route.ts` receives request:
   - Reads tracking params from body, falls back to cookies from middleware
   - Validates name + email required
   - Inserts into Supabase `leads` table
   - Extracts company name from email domain
   - Sends email notification via Resend (async, non-blocking)
6. Returns success/error response
7. LeadForm shows success state to user

**Search/Map Flow:**

1. User navigates to `/search` → `src/app/(main)/search/page.tsx` (client component)
2. Loads all listings and initializes map via `SearchMap` component
3. List view shows `ListingCard` grid; map view toggles on mobile
4. User hovers listing → `hoveredId` state updates, map highlights pin
5. Map renders via `src/components/search-map-inner.tsx` (Mapbox GL)
6. Similar flow for city-specific search at `/{city}` with filtered listings

**Landing Page Flow (separate from main site):**

1. User lands on `/lp/[city]` or `/lp/[city]/danke` → `src/app/(lp)/layout.tsx` renders
2. LP layout is intentionally minimal: no main Header, just GTM script + tracking provider + footer
3. `LPTrackingProvider` captures UTM params, click IDs from URL and stores in sessionStorage
4. Lead form on LP page submits to `src/app/(lp)/api/lp-leads/route.ts`
5. After submission, user redirected to `/lp/[city]/danke` thank-you page
6. Thank-you page includes `ConversionTracker` component that fires GA4 conversion event
7. LPTrackingProvider persists tracking data across navigation

**Transit/Geo Query Flow:**

1. Map components may query `/api/transit` with Overpass Query Language
2. API proxies to Overpass API (OpenStreetMap data)
3. Returns transit/POI data to render on map

## Key Abstractions

**Listing:**
- Purpose: Represents an office space listing
- Examples: `src/lib/types.ts` (interface definition), `src/data/listings.json` (data), `src/components/listing-card.tsx` (display)
- Pattern: TypeScript interface enforced, immutable JSON source, utility functions (`getListingBySlug`, `displayPrice`, `displayCapacity`)

**City:**
- Purpose: Geographic grouping and homepage city cards
- Examples: `src/lib/types.ts`, `src/data/cities.json`
- Pattern: Minimal metadata (name, slug, coordinates, listing count, image)

**Tracking:**
- Purpose: Capture Google Ads and referrer data across navigation
- Examples: `src/middleware.ts` (server-side cookies), `src/components/tracking-provider.tsx` (client context), `src/components/lp/tracking/lp-tracking-provider.tsx` (LP variant)
- Pattern: Two-layer (middleware + React context) ensures data survives page refresh and full navigation

**Form Variants:**
- Purpose: Reusable lead capture forms for different contexts
- Examples: `src/components/lead-form.tsx` (base), `src/components/lead-dialog.tsx` (dialog wrapper)
- Pattern: Single component accepts `variant` prop (sidebar, inline, contact, dialog) + optional listingId/citySlug to pre-fill

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every request (Next.js root)
- Responsibilities: Global HTML shell, fonts, DNS/preconnect hints for Mapbox, metadata base URL, lang=de

**Main Site Layout:**
- Location: `src/app/(main)/layout.tsx`
- Triggers: All `(main)` group routes
- Responsibilities: Wraps content with `Header`, `Footer`, `TrackingProvider` (Google Ads tracking)

**LP Layout:**
- Location: `src/app/(lp)/layout.tsx`
- Triggers: All `(lp)` group routes
- Responsibilities: Wraps content with GTM script, LPTrackingProvider, LPFooter (legal only)

**Homepage:**
- Location: `src/app/(main)/page.tsx`
- Triggers: GET `/`
- Responsibilities: Renders hero, cities grid, value props, testimonials, contact CTA

**City Search Page:**
- Location: `src/app/(main)/[city]/page.tsx`
- Triggers: GET `/{city}`
- Responsibilities: Renders listings grid + map, CTAs, city header with count

**Listing Detail Page:**
- Location: `src/app/(main)/[city]/[listing]/page.tsx`
- Triggers: GET `/{city}/{listing}`
- Responsibilities: Full listing info (photos, amenities, map, offers), similar listings, structured data (JSON-LD)

**Lead API:**
- Location: `src/app/(main)/api/leads/route.ts`
- Triggers: POST `/api/leads`
- Responsibilities: Persist lead to Supabase, send email notification, extract company from email domain

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: All non-static routes (configured via matcher)
- Responsibilities: Set HTTP-only cookies for Google Ads tracking params

## Error Handling

**Strategy:** Graceful degradation with user-friendly fallbacks.

**Patterns:**
- Lead form submission: Client-side error state shows message "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut." API errors (validation, Supabase) return 400/500 with error JSON
- Map rendering: Fallback to placeholder image if Mapbox fails to load
- Image optimization: All images use Next.js Image component with fallback `sizes` attributes
- Listing not found: Listing detail page calls `notFound()` which triggers 404 page
- Transit API timeout: 12 second timeout on Overpass calls, returns empty array on failure

## Cross-Cutting Concerns

**Logging:** Console.log for errors (Supabase insert, Resend send failures) and API failures. No external logging service.

**Validation:**
- Client-side: HTML5 form validation (required, type, inputMode)
- Server-side: Basic checks (name, email required) before Supabase insert

**Authentication:** None. Site is public. Supabase uses service role key in server-side API routes (no RLS needed).

**Performance:**
- Static data: Listings and cities loaded from JSON at build time, zero runtime latency
- Image optimization: Next.js Image component with responsive sizes
- Code splitting: Route-based via Next.js App Router
- Caching: Middleware runs on all requests; images cached via CDN
