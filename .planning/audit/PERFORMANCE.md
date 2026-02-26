# Performance Audit -- next-office.io

**Audit Date:** 2026-02-25
**Auditor:** Performance engineering review (automated)
**Scope:** Main platform (`src/`), excluding `LP/` subfolder

---

## Executive Summary

The most critical performance problem is the 588KB `listings.json` file shipped in its entirety to every client as part of the JavaScript bundle on the search page and city pages (both are `"use client"` components that statically import the full dataset). After gzip this is ~148KB of JavaScript payload, which alone exceeds Google's recommended <150KB JS budget for interactive pages. The second major concern is the Mapbox GL JS library (~1.6MB unminified, ~230KB gzipped after tree-shaking) which is properly lazy-loaded but duplicated across two separate dynamic import paths. Combined, these two issues account for the bulk of avoidable transfer weight and block Time to Interactive (TTI) on the two highest-traffic page types.

---

## P0 -- Must Fix Before Launch

### P0-1: Full 588KB listings.json shipped to client on every search/city page

**Affected files:**
- `src/app/(main)/search/page.tsx` (line 1: `"use client"`, line 4: `import { listings }`)
- `src/app/(main)/[city]/page.tsx` (line 1: `"use client"`, line 6: `import { ... listings as allListings }`)
- `src/lib/listings.ts` (line 2: `import listingsData from "@/data/listings.json"`)
- `src/data/listings.json` (588,355 bytes raw / 148,414 bytes gzipped)

**Description:**
Both the search page (`/search`) and every city page (`/berlin`, `/muenchen`, etc.) are declared as `"use client"` components and import `listings` from `@/lib/listings`, which statically imports the entire `listings.json` file. Next.js bundles this JSON into the page's JavaScript chunk. Every visitor downloads ~148KB gzipped of listing data even if they never scroll past the first 10 results.

The JSON contains 264 listings with 28 fields each, including full description text (132KB total), all photo URLs (187KB in URL strings), amenities arrays, notice periods, pricing tiers, and Contentful IDs -- most of which are never displayed on the search page.

**Estimated impact:**
- **+148KB gzipped** to JS bundle on search and city pages (the two highest-traffic page types)
- **+200-400ms** parse/compile time on mid-range mobile devices
- Likely pushes Largest Contentful Paint (LCP) past the 2.5s "good" threshold on 3G
- All data is inlined into JS (not fetched as a separate cacheable resource)

**Recommended fix:**
1. Convert search/city pages to server components. Pass only the minimal listing data needed for cards as props (id, name, slug, citySlug, city, address, latitude, longitude, capacityMin, capacityMax, priceFrom, coverPhoto, providerName, first photo). This reduces the payload from 588KB to ~160KB raw / ~34KB gzipped.
2. Extract interactive parts (hover state, map toggle) into a thin client wrapper that receives serialized props from the server component.
3. Long-term: Move listings to a paginated API endpoint (`/api/listings?city=berlin&page=1&limit=20`) backed by Supabase. Return only the current page of results.

---

### P0-2: Search and city pages are fully client-rendered ("use client" at page level)

**Affected files:**
- `src/app/(main)/search/page.tsx` (line 1: `"use client"`)
- `src/app/(main)/[city]/page.tsx` (line 1: `"use client"`)

**Description:**
Both pages are declared as client components, meaning the entire page -- including the listing cards grid, header text, and all supporting logic -- is rendered exclusively in the browser. This means:
1. No server-side HTML is generated for listing content; the initial HTML payload is an empty shell
2. Search engine crawlers (Googlebot, Bingbot) must execute JavaScript to index listing content
3. The full React runtime + page code + listings JSON must download, parse, and execute before anything renders
4. No static generation or ISR is possible for these pages

The city pages especially are strong candidates for static generation or server rendering since the data is known at build time and changes infrequently (Contentful imports).

**Estimated impact:**
- **First Contentful Paint (FCP):** Delayed by 500-1000ms compared to server-rendered equivalent
- **SEO risk:** City pages (`/berlin`, `/muenchen`) are high-value SEO pages. Client-only rendering may hurt crawl efficiency.
- **Time to Interactive (TTI):** Entire page is blocked on JS download + execution
- **No streaming/progressive rendering:** User sees spinner or blank page until all JS executes

**Recommended fix:**
1. Convert to server components. Render the listings grid server-side.
2. Keep only the interactive parts (hover state for map, map toggle button) as small client component islands.
3. Add `generateStaticParams` for city pages to enable static generation at build time.
4. Consider ISR (`revalidate: 3600`) so pages update when listings change without a full rebuild.

---

### P0-3: No `generateStaticParams` for city pages or listing detail pages

**Affected files:**
- `src/app/(main)/[city]/page.tsx` -- no `generateStaticParams`
- `src/app/(main)/[city]/[listing]/page.tsx` -- no `generateStaticParams`
- `src/app/(main)/[city]/layout.tsx` -- no `generateStaticParams`

**Description:**
The blog post detail page correctly exports `generateStaticParams` (line 14 of `blog/[slug]/page.tsx`), but neither the city pages nor the listing detail pages do. This means:
- City pages and listing detail pages are dynamically rendered on every request
- 264 listing detail pages and 6 city pages that could be pre-rendered at build time are computed at runtime instead
- This increases server load and response latency (especially for the listing detail page which calls `getListingBySlug` + `getListingsByCity` + sorts similar listings)

Note: The listing detail page IS a server component (no `"use client"`), so it renders on the server -- but without `generateStaticParams`, it cannot be statically generated.

**Estimated impact:**
- **+50-150ms** per request for listing detail pages (JSON parsing + filtering + sorting)
- **270 pages** that could be served as static HTML from CDN edge instead of computed per-request
- Missed opportunity for sub-100ms TTFB from CDN

**Recommended fix:**
```ts
// src/app/(main)/[city]/page.tsx
export async function generateStaticParams() {
  return cities.map((city) => ({ city: city.slug }));
}

// src/app/(main)/[city]/[listing]/page.tsx
export async function generateStaticParams() {
  return listings.map((l) => ({ city: l.citySlug, listing: l.slug }));
}
```

---

## P1 -- Should Fix Before Launch

### P1-1: Mapbox GL JS (~230KB gzipped) loaded on search and listing pages via two separate chunks

**Affected files:**
- `src/components/search-map.tsx` (line 12: `dynamic(() => import("./search-map-inner"))`)
- `src/components/listing-map.tsx` (line 12: `dynamic(() => import("./listing-map-inner"))`)
- `src/components/search-map-inner.tsx` (lines 4-6: imports mapbox-gl, react-map-gl, mapbox CSS)
- `src/components/listing-map-inner.tsx` (lines 4-6: same imports)

**Description:**
Both map components are correctly lazy-loaded via `next/dynamic` with `ssr: false`. However, they are separate dynamic imports that both pull in `mapbox-gl` (~1.6MB raw JS) and `react-map-gl`. Next.js should deduplicate these into a shared chunk, but the two different entry points create two import trees that may not be optimally code-split.

Additionally, the listing detail page loads the map immediately on page load (no user interaction required), which means the ~230KB gzipped Mapbox bundle is fetched as soon as the detail page renders.

**Estimated impact:**
- **~230KB gzipped** JavaScript for Mapbox GL on any page with a map
- On listing detail pages, this blocks TTI since the map renders immediately
- On search/city pages, the map is visible on desktop by default (right panel), so the dynamic import fires immediately too

**Recommended fix:**
1. On listing detail pages, lazy-load the map below the fold. Render a static map image placeholder (Mapbox Static Images API) for initial render, then hydrate to interactive map on scroll/click.
2. Use `IntersectionObserver` to defer map load until the map container scrolls into view.
3. Consider extracting mapbox-gl into an explicit shared chunk in next.config.ts via `webpack.optimization.splitChunks`.

---

### P1-2: ListingCard renders all carousel photos eagerly with `priority` on first image

**Affected files:**
- `src/components/listing-card.tsx` (lines 62-74)

**Description:**
The `ImageCarousel` inside each `ListingCard` renders ALL photos in the listing simultaneously as stacked `<Image>` elements (only one is visible via `opacity`). On the search page, which shows all 264 listings, this means:
- All ~1,350 photo URLs are rendered as `<Image>` elements in the DOM
- The first photo of each card has `priority={i === 0}` (line 72), which requests eager loading
- For 264 listings visible on the search page, this creates 264 priority image requests plus ~1,086 lazy-loaded images in the DOM

Each invisible carousel image still occupies a DOM element with a `src` attribute that the browser may prefetch or at minimum allocate memory for.

**Estimated impact:**
- **DOM bloat:** 1,350+ image elements on the search page
- **Memory usage:** Each decoded image consumes 1-5MB of GPU memory even if not visible
- **Network contention:** Even with lazy loading, the browser may queue hundreds of image requests
- **Mobile performance:** Excessive DOM size causes jank during scrolling

**Recommended fix:**
1. Only render the currently visible carousel image. Load adjacent images (prev/next) on demand when the user interacts with the carousel.
2. Virtualize the listing grid using a library like `react-window` or `@tanstack/virtual` to render only visible cards in the viewport.
3. Remove `priority` from carousel images in cards below the fold.

---

### P1-3: Transit API (`/api/transit`) has aggressive 12s timeout with no retry

**Affected files:**
- `src/app/(main)/api/transit/route.ts` (line 10: `setTimeout(() => controller.abort(), 12000)`)
- `src/components/listing-map-inner.tsx` (lines 75-81: Overpass query via `/api/transit`)

**Description:**
The transit API proxies requests to the public Overpass API (overpass-api.de), which is a free community service with highly variable response times (5-45 seconds typical). The timeout is set to 12 seconds, which is too short for complex queries during peak hours. There is no retry logic at the API route level.

The listing map inner component does implement a single retry with 2s delay (lines 231-241), but only for the POI endpoint, not for the transit-lines endpoint used by the search map.

The transit-lines API route (`/api/transit-lines`) has NO timeout at all (line 15: bare `fetch` without AbortController), meaning it can hang indefinitely.

**Estimated impact:**
- **User-visible failure:** Transit overlays fail silently 10-20% of the time during European business hours
- **Hanging requests:** `/api/transit-lines` can hold server connections open indefinitely
- **No cache headers on `/api/transit` responses** -- only `/api/transit-lines` and `/api/districts` set Cache-Control headers

**Recommended fix:**
1. Add AbortController with 30s timeout to `/api/transit-lines/route.ts`
2. Increase `/api/transit/route.ts` timeout from 12s to 25s (matching the Overpass `[timeout:15]` query parameter)
3. Add Cache-Control headers to `/api/transit` responses: `public, max-age=86400, stale-while-revalidate=604800`
4. Add retry with exponential backoff (1 retry, 3s delay) at the API route level

---

### P1-4: No HTTP caching on `/api/leads` and `/api/transit` responses

**Affected files:**
- `src/app/(main)/api/transit/route.ts` -- no Cache-Control header on response (line 30: bare `NextResponse.json(data)`)
- `src/app/(main)/api/leads/route.ts` -- no Cache-Control header (POST, expected)

**Description:**
Only two of the four API routes set Cache-Control headers:
- `/api/transit-lines` -- `public, max-age=86400, stale-while-revalidate=604800` (correct)
- `/api/districts` -- `public, max-age=86400, stale-while-revalidate=604800` (correct)
- `/api/transit` -- **no caching** (the Overpass POI proxy used on listing detail pages)
- `/api/leads` -- no caching (POST endpoint, N/A)

The `/api/transit` route returns Overpass POI data that changes very rarely. Without Cache-Control, Vercel's CDN cannot cache responses, and identical requests from different users for the same coordinates hit the Overpass API every time.

**Estimated impact:**
- **Redundant API calls:** Every listing page visit triggers a fresh Overpass request for transit POIs
- **Overpass API quota:** Could hit rate limits with moderate traffic (Overpass enforces per-IP rate limiting)
- **+2-15 seconds** per listing page load for transit data

**Recommended fix:**
Add to `/api/transit/route.ts`:
```ts
return NextResponse.json(data, {
  headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" }
});
```

---

### P1-5: `LeadForm` imports full `listings` module (including 588KB JSON) for city dropdown

**Affected files:**
- `src/components/lead-form.tsx` (line 16: `import { cities } from "@/lib/listings"`)
- `src/components/search-bar.tsx` (line 7: `import { cities } from "@/lib/listings"`)
- `src/lib/listings.ts` (line 2-3: imports both `listings.json` and `cities.json`)

**Description:**
`LeadForm` and `SearchBar` only need the `cities` array (1.3KB) for the city dropdown/autocomplete. But because `src/lib/listings.ts` re-exports both `listings` and `cities` from the same module, importing `{ cities }` may pull in the full `listings.json` as a side effect, depending on how Next.js/webpack tree-shakes the module.

Since `listings.ts` has a top-level `import listingsData from "@/data/listings.json"` on line 2, the JSON file is evaluated at module load time regardless of which named exports are consumed. Tree-shaking cannot eliminate the import because it has a side effect (assigning to module-scoped `const listings`).

This means the `LeadForm` component -- which appears on the home page, contact page, listing detail pages, and provider page -- potentially drags the full 588KB listings JSON into those page bundles too.

**Estimated impact:**
- **Potentially +148KB gzipped** to every page that renders a LeadForm or SearchBar
- Home page, contact page, listing detail pages, and "fuer-anbieter" page all use LeadForm
- The home page (server component) may be spared if Next.js tree-shakes server-side, but client components (LeadForm) will include it

**Recommended fix:**
1. Split `src/lib/listings.ts` into two separate modules:
   - `src/lib/cities.ts` -- imports only `cities.json`, exports cities and city helpers
   - `src/lib/listings.ts` -- imports `listings.json`, exports listings and listing helpers
2. Update all imports: `LeadForm` and `SearchBar` import from `@/lib/cities`, search/city pages import from `@/lib/listings`
3. This ensures the 588KB JSON is only bundled on pages that actually need listing data

---

### P1-6: Popup image in SearchMapInner uses raw `<img>` bypassing Next.js Image optimization

**Affected files:**
- `src/components/search-map-inner.tsx` (lines 371-381)

**Description:**
The map popup for a selected listing renders a raw HTML `<img>` tag instead of Next.js `<Image>`. This bypasses automatic WebP/AVIF conversion, responsive sizing, and lazy loading. The image URL points to Contentful (`images.ctfassets.net`), which is already configured as an allowed remote pattern.

However, this is inside a Mapbox Popup which uses `setHTML()` for transit line tooltips (line 148), making it difficult to use React components. The listing popup does use JSX (lines 367-409 inside a `<Popup>` component from react-map-gl), so Next.js `<Image>` could be used here.

**Estimated impact:**
- **No WebP/AVIF conversion** for popup images -- users download JPEG/PNG at original quality
- **No responsive sizing** -- 90x90px image may be downloaded at full resolution
- **Minor** -- only triggered when user clicks a map pin

**Recommended fix:**
Replace the `<img>` tag with Next.js `<Image>` component with explicit `width={90}` and `height={90}`.

---

## P2 -- Post-Launch Optimization

### P2-1: `react-markdown` (17KB gzipped) loaded for blog pages only but not code-split

**Affected files:**
- `src/components/markdown-content.tsx` (line 1: `import ReactMarkdown from "react-markdown"`)
- `src/app/(main)/blog/[slug]/page.tsx` (line 8: `import { MarkdownContent }`)

**Description:**
`react-markdown` is a ~17KB gzipped dependency used only on blog post detail pages. It is imported statically, which means it is bundled into any chunk that imports `MarkdownContent`. Since blog pages are server components, this may only affect server-side bundle size, not client. However, if any client component in the blog post tree causes re-rendering, the markdown renderer may end up in the client bundle.

**Estimated impact:**
- **Minor** -- `react-markdown` is only ~17KB gzipped
- Server component rendering should keep this server-side only
- Blog pages are low-traffic compared to search/listing pages

**Recommended fix:**
Low priority. If needed, use `next/dynamic` to lazy-load `MarkdownContent`.

---

### P2-2: `gray-matter` (5KB) used at request time instead of build time

**Affected files:**
- `src/lib/blog.ts` (line 3: `import matter from "gray-matter"`, line 19: `getAllPosts()`)
- `src/app/(main)/blog/page.tsx` (line 24: `const posts = getAllPosts()`)
- `src/app/(main)/blog/[slug]/page.tsx` (line 50: `const post = getPostBySlug(slug)`)

**Description:**
`getAllPosts()` reads all markdown files from disk and parses them with `gray-matter` on every request. Blog post detail pages have `generateStaticParams`, so they are statically generated. But the blog index page (`/blog`) does NOT export `generateStaticParams` or set `revalidate`, so it re-reads and re-parses all markdown files on every page request.

**Estimated impact:**
- **~5-20ms** per request for filesystem reads + frontmatter parsing
- Negligible for low traffic but wasteful

**Recommended fix:**
Add `export const revalidate = 3600;` to blog index page, or implement `generateStaticParams` if the blog has a finite number of posts.

---

### P2-3: Public images served as JPEG/PNG instead of WebP/AVIF

**Affected files:**
- `public/hero-office.jpg` (~393KB)
- `public/about-office.jpg` (~354KB)
- `public/office-thomas.webp`, `office-melissa.webp`, `office-heublein.webp` (already WebP -- good)
- `public/city-hamburg.jpg` (~127KB), `public/city-koeln.jpg` (~73KB), `public/city-duesseldorf.jpg` (~98KB)
- `public/team-benjamin.jpg` (~48KB)
- `public/logo-mediapool.png` (~12KB), `public/logo-kumavision.png` (~5KB)

**Description:**
Some public images are served as JPEG while others are already WebP. The `hero-office.jpg` (393KB) is the LCP element on the home page and is served as JPEG. Next.js `<Image>` will convert it to WebP/AVIF on the fly, but the source file size still matters for build performance and initial server-side processing.

Two company logos are PNG files that could be SVG (they are simple logos).

**Estimated impact:**
- **Hero image:** Already optimized by Next.js Image at serving time; source format is cosmetic
- **Logo PNGs:** ~17KB total, minor but could be SVG for perfect scaling

**Recommended fix:**
Convert `logo-mediapool.png` and `logo-kumavision.png` to SVG. Convert remaining JPEGs to WebP source files for faster build-time optimization.

---

### P2-4: ListingCard `priority` prop set on ALL listing cards' first photo

**Affected files:**
- `src/components/listing-card.tsx` (line 72: `priority={i === 0}`)

**Description:**
Every `ListingCard` marks its first carousel image with `priority={true}`, which tells the browser to preload it. On the search page with 264 listings, this creates 264 priority image preload requests. The browser can only handle ~6 concurrent requests, so the remaining 258 are queued, creating resource contention that delays the truly important above-the-fold images.

**Estimated impact:**
- **Resource contention:** 264 priority images compete for bandwidth
- **LCP regression:** The actual above-the-fold images (first 4-6 cards) load slower because they compete with below-the-fold priority images
- **Preload warnings in Chrome DevTools:** Too many preloaded resources

**Recommended fix:**
1. Remove `priority` from `ListingCard` entirely
2. Pass a `priority` prop from the parent page only for the first 4-6 visible cards
3. Or use `loading="eager"` only for above-the-fold cards and `loading="lazy"` (default) for the rest

---

### P2-5: No Suspense boundaries for progressive rendering

**Affected files:**
- All page-level components in `src/app/(main)/`

**Description:**
No React `<Suspense>` boundaries are used anywhere in the main app. This means:
- No streaming SSR -- the entire page must render before any HTML is sent
- No progressive loading UI -- users see nothing or a full page at once
- Slow server-side data operations (e.g., listing detail page computing similar listings) block the entire response

**Estimated impact:**
- **TTFB:** Server must complete all rendering before sending any bytes
- On listing detail pages (server component with data processing + map + similar listings), this could add 100-300ms to TTFB

**Recommended fix:**
Wrap slow sections (map, similar listings, blog content) in `<Suspense>` with skeleton fallbacks. This enables Next.js streaming SSR to send the above-the-fold content first.

---

### P2-6: Middleware runs on all page requests (tracking cookie check)

**Affected files:**
- `src/middleware.ts` (line 63-65: matcher excludes only `_next/static`, `_next/image`, `favicon.ico`, `api/`)

**Description:**
The middleware runs on every page navigation to check for Google Ads click ID parameters. For 99%+ of requests, no gclid/gbraid/wbraid is present, and the middleware does nothing except parse URL params and return `NextResponse.next()`.

**Estimated impact:**
- **~1-3ms** per request for middleware execution
- Negligible individually but adds up at scale
- Middleware runs on the edge, so latency is minimal

**Recommended fix:**
Low priority. The middleware is already lightweight. Could further optimize by checking `request.nextUrl.search.includes('gclid')` before parsing all params.

---

### P2-7: `lucide-react` icons imported individually (correct) but used across many components

**Affected files:**
- Multiple components import 2-10 icons each from `lucide-react`

**Description:**
Lucide icons are imported correctly as named imports (`import { MapPin, Users } from "lucide-react"`), which supports tree-shaking. The library uses ESM exports, so only used icons are bundled. No issue with the import pattern.

**Estimated impact:**
- **No action needed** -- tree-shaking works correctly for lucide-react
- Each icon is ~1-2KB of SVG path data

**Recommended fix:**
None needed. Current import pattern is optimal.

---

## Summary of Estimated Bundle Impact

| Item | Raw Size | Gzipped | Pages Affected |
|------|----------|---------|----------------|
| listings.json in client bundle | 588KB | 148KB | /search, /[city], possibly /contact, /, /fuer-anbieter via LeadForm |
| Mapbox GL JS | 1.6MB | ~230KB | /search, /[city], /[city]/[listing] (lazy-loaded) |
| Mapbox GL CSS | 39KB | ~8KB | Same as above (lazy-loaded) |
| react-map-gl | ~50KB | ~15KB | Same as above (lazy-loaded) |
| react-markdown | ~45KB | ~17KB | /blog/[slug] only |
| Radix UI primitives | ~30KB | ~10KB | All pages (Dialog, Select, Sheet) |
| @supabase/supabase-js | ~50KB | ~15KB | Server-only (API routes) |
| Resend SDK | ~10KB | ~3KB | Server-only (API routes) |

**Total avoidable client-side weight:** ~148KB gzipped (listings.json alone). If LeadForm truly pulls in the full module, this could double on pages like home, contact, and listing detail.

---

## Caching Strategy Assessment

| Endpoint | Cache-Control | Client Cache | Assessment |
|----------|--------------|--------------|------------|
| `/api/transit-lines` | 24h + 7d SWR | localStorage 24h | Good |
| `/api/districts` | 24h + 7d SWR | None | OK -- CDN handles it |
| `/api/transit` | **None** | localStorage 24h | Missing server cache |
| `/api/leads` | None (POST) | None | N/A (mutation) |
| Static pages | Next.js default | Next.js default | Should add ISR/static generation |
| Listing detail pages | Dynamic | None | Should be statically generated |

---

## Rendering Strategy Assessment

| Page | Current Strategy | Recommended | Priority |
|------|-----------------|-------------|----------|
| `/` (home) | Server component | Server component (correct) | -- |
| `/search` | Client component | Server component + client islands | P0 |
| `/[city]` | Client component | Static generation + client islands | P0 |
| `/[city]/[listing]` | Server component (dynamic) | Static generation (`generateStaticParams`) | P0 |
| `/blog` | Server component (dynamic) | Static or ISR | P2 |
| `/blog/[slug]` | Static generation | Static generation (correct) | -- |
| `/contact` | Server component | Server component (correct) | -- |
| `/fuer-anbieter` | Server component | Server component (correct) | -- |
| `/ueber-uns` | Server component | Server component (correct) | -- |

---

## Positive Findings

1. **Maps are correctly lazy-loaded** via `next/dynamic` with `ssr: false` and loading skeletons
2. **Mapbox CSS is imported inside dynamic components**, not globally -- it only loads when maps render
3. **No raw `<img>` tags** found outside of map popups -- consistent use of Next.js `<Image>`
4. **All images have `sizes` prop** set appropriately for responsive loading
5. **Hero image has `priority`** set correctly for LCP optimization
6. **DNS prefetch and preconnect** for Mapbox domains in root layout `<head>`
7. **Google font (Inter) loaded via `next/font`** -- self-hosted, no render-blocking external request
8. **No third-party analytics scripts in main app** -- TrackingProvider is lightweight in-memory only
9. **Transit line data cached in localStorage** with 24h TTL for repeat visits
10. **Blog posts use `generateStaticParams`** for static generation

---

*Performance audit completed: 2026-02-25*
