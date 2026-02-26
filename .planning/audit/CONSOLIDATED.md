# Launch Readiness Audit — Consolidated Findings

**Date:** 2026-02-25
**Auditors:** Security, Performance, UX/Frontend, DevOps/Infrastructure, SEO/Analytics
**Scope:** Main project (`src/`), excluding `LP/` subfolder

---

## P0 — Must Fix Before Launch (Blocks Go-Live)

### Security

| # | Finding | Files | Risk | Est. |
|---|---------|-------|------|------|
| S1 | **Open Overpass API proxy (SSRF)** — `/api/transit` accepts arbitrary user-controlled Overpass QL queries and forwards them to overpass-api.de. Anyone can use your server as a free proxy. | `api/transit/route.ts:3-16` | Server IP ban, memory exhaustion, abuse amplification | 1h |
| S2 | **Overpass QL injection** — `lat`/`lng` params interpolated into query strings without numeric validation. Attacker can inject arbitrary Overpass QL. | `api/transit-lines/route.ts:13`, `api/districts/route.ts:87` | Data exfiltration, expensive queries, IP ban | 30m |
| S3 | **XSS via `.setHTML()`** — Transit popup renders OpenStreetMap tag values (`colour`, `ref`) as raw HTML. OSM is a public wiki; anyone can inject `<img onerror=...>`. | `search-map-inner.tsx:148` | Stored XSS, session hijacking, cached in localStorage for 24h | 30m |
| S4 | **HTML injection in notification emails** — All `body.*` fields (name, email, message, etc.) interpolated into HTML email templates without escaping. | `api/leads/route.ts:76-99`, `api/lp-leads/route.ts:131-163` | XSS delivered to broker team's email client | 30m |
| S5 | **No rate limiting on lead endpoints** — Both POST endpoints accept unlimited requests. No CAPTCHA, no per-IP throttle, no deduplication. | `api/leads/route.ts`, `api/lp-leads/route.ts` | DB spam, Resend quota exhaustion, cost-based DoS | 2h |

### Performance

| # | Finding | Files | Impact | Est. |
|---|---------|-------|--------|------|
| P1 | **588KB listings.json shipped to every client** — Full dataset (264 listings, 28 fields each) bundled into JS. ~148KB gzipped. Includes descriptions, all photo URLs, amenities — most never shown on search pages. | `lib/listings.ts:2`, `data/listings.json`, `search/page.tsx:4`, `[city]/page.tsx:6` | +148KB JS, +200-400ms parse on mobile, LCP past 2.5s on 3G | 4h |
| P2 | **Search + city pages are fully client-rendered** — `"use client"` at page level. Zero server HTML. SEO-critical pages (`/berlin`, `/muenchen`) deliver empty shells to crawlers. | `search/page.tsx:1`, `[city]/page.tsx:1` | FCP delayed 500-1000ms, SEO risk on highest-value pages, no streaming | 4h |
| P3 | **No `generateStaticParams`** — 270 pages (6 city + 264 listing) that could be static HTML from CDN are computed per-request. Blog pages already do this correctly. | `[city]/page.tsx`, `[city]/[listing]/page.tsx` | +50-150ms TTFB per request, missed CDN edge caching | 30m |

### UX / Frontend

| # | Finding | Files | User Impact | Est. |
|---|---------|-------|-------------|------|
| U1 | **No custom 404 page or error boundaries** — Missing `not-found.tsx` and `error.tsx` entirely. Users see generic Next.js pages with no branding or recovery. | Missing: `app/not-found.tsx`, `app/(main)/error.tsx` | Dead-end for typos, expired ads, old bookmarks | 1h |
| U2 | **City page shows all listings on invalid slug** — `/asdfgh` shows ALL listings with heading "Buro mieten in asdfgh". No 404 returned. Garbage pages indexable by search engines. | `[city]/page.tsx:24-26` | Confusing UX, SEO pollution | 15m |
| U3 | **Email input `type="text"`** — Native browser validation bypassed. Main API route has NO email format validation at all (only checks truthy). Users can submit "hello" as email. | `lead-form.tsx:176`, `api/leads/route.ts:18` | Invalid leads, wasted team follow-up, Resend rejects | 15m |
| U4 | **Datenschutz page references OpenStreetMap instead of Mapbox** — Privacy policy discloses wrong third-party service. Site uses Mapbox (api.mapbox.com), not OpenStreetMap. DSGVO non-compliance. | `datenschutz/page.tsx:122-127` | Legal risk — DSGVO complaint vector | 30m |

### DevOps / Infrastructure

| # | Finding | Files | Risk | Est. |
|---|---------|-------|------|------|
| D1 | **No runtime env var validation** — All `process.env` uses `!` non-null assertion. Missing key = silent failure on first request. You won't know leads are lost. | `api/leads/route.ts:7-11`, `api/lp-leads/route.ts:7-11`, `lib/map-config.ts:1` | Silent production failures, lost leads | 1h |
| D2 | **No `.env.example`** — No documentation of required env vars. `.gitignore` excludes `.env*`. Anyone cloning the repo is blind. | Project root (missing file) | Failed deployments, onboarding friction | 15m |
| D3 | **No error monitoring** — Zero observability. Only 4 `console.error` calls. No Sentry, no alerts, no dashboards. Client-side errors completely invisible. | Entire codebase | Can't detect lead failures in production | 2h |

### SEO / Analytics

| # | Finding | Files | Business Impact | Est. |
|---|---------|-------|-----------------|------|
| A1 | **No GA4/GTM on main site** — Analytics scripts only load in LP layout. Every main site page (home, city, listing, search, blog, contact) has zero tracking. | `(main)/layout.tsx`, `tracking-provider.tsx` | Can't measure organic traffic or conversions | 15m |
| A2 | **No Open Graph image** — Root metadata has no `images` property. No `opengraph-image.png` exists. Social shares (LinkedIn, Slack, WhatsApp) show no preview. | `app/layout.tsx:33-41`, most page metadata | 2-5x lower click-through on shared links | 20m |

**P0 Total: 17 unique findings | Estimated effort: ~18 hours**

---

## P1 — Should Fix Before Launch (Degrades Quality)

### Security

| # | Finding | Files | Est. |
|---|---------|-------|------|
| S6 | Missing security headers (CSP, X-Frame-Options, HSTS, Referrer-Policy) | `next.config.ts` (no headers config) | 30m |
| S7 | No CSRF protection on lead form endpoints | `api/leads/route.ts`, `api/lp-leads/route.ts` | 1h |
| S8 | Email validation too weak — main route has none, LP route regex accepts `@.@` | `api/leads/route.ts:18`, `api/lp-leads/route.ts:51` | 30m |
| S9 | Cookie values (gclid/gbraid/wbraid) stored without validation or length limit | `middleware.ts:23-34` | 15m |
| S10 | Service role key used for public lead inserts (violates least privilege) | `api/leads/route.ts:8`, `api/lp-leads/route.ts:8` | 2h |
| S11 | No input size/type validation on lead request bodies | `api/leads/route.ts:15-53`, `api/lp-leads/route.ts:29-103` | 1h |
| S12 | Mapbox token potentially unrestricted — not URL-scoped in dashboard | `lib/map-config.ts:1` | 15m |

### Performance

| # | Finding | Files | Est. |
|---|---------|-------|------|
| P4 | Mapbox GL (~230KB gz) loads immediately on listing detail pages, no lazy trigger | `listing-map.tsx`, `listing-map-inner.tsx` | 2h |
| P5 | ListingCard renders ALL carousel photos eagerly — 1,350+ DOM images on search page | `listing-card.tsx:62-74` | 2h |
| P6 | Transit API: 12s timeout too short, transit-lines has NO timeout, no retry | `api/transit/route.ts:10`, `api/transit-lines/route.ts:15` | 1h |
| P7 | No Cache-Control on `/api/transit` responses (unlike transit-lines/districts) | `api/transit/route.ts:30` | 15m |
| P8 | LeadForm imports `cities` from `@/lib/listings` — may drag 588KB JSON as side effect | `lead-form.tsx:16`, `search-bar.tsx:7` | 1h |

### UX / Frontend

| # | Finding | Files | Est. |
|---|---------|-------|------|
| U5 | Footer `new Date().getFullYear()` in server component — hydration mismatch at year boundary | `footer.tsx:61` | 5m |
| U6 | Search bar dropdown missing ARIA attributes (no `role="listbox"`, no `aria-activedescendant`) | `search-bar.tsx:101-123` | 30m |
| U7 | Lead form hydration skeleton — empty div with no loading indicator or `aria-busy` | `lead-form.tsx:113-126` | 30m |
| U8 | Photo gallery fullscreen lacks focus trap, body scroll lock, `role="dialog"` | `photo-gallery.tsx:75-118` | 1h |
| U9 | No empty state for zero-result searches (empty grid, no CTA) | `search/page.tsx:23-37`, `[city]/page.tsx:40-107` | 30m |
| U10 | Lead form submit button — no spinner during loading state | `lead-form.tsx:254-257` | 15m |
| U11 | Decorative icons missing `aria-hidden="true"` across main site | `listing-card.tsx:159-169`, `[listing]/page.tsx:214-284` | 30m |

### DevOps

| # | Finding | Files | Est. |
|---|---------|-------|------|
| D4 | No CI/CD pipeline — no GitHub Actions, no Vercel config, no Dockerfile | Project root | 2h |
| D5 | No health check endpoint for uptime monitoring | Missing: `api/health/route.ts` | 15m |
| D6 | No CORS policy on API routes | All `api/` routes | 1h |
| D7 | Placeholder `AW-XXXXXXXXXX` Google Ads conversion code will ship to production | `lp/sections/lead-form-section.tsx:35` | 15m |

### SEO / Analytics

| # | Finding | Files | Est. |
|---|---------|-------|------|
| A3 | Homepage has no page-level metadata export (relies on root fallback) | `(main)/page.tsx` | 15m |
| A4 | No Organization schema on homepage | `(main)/page.tsx` | 15m |
| A5 | No BreadcrumbList schema on listing/blog pages | `[listing]/page.tsx`, `blog/[slug]/page.tsx` | 30m |
| A6 | `/contact` page missing from sitemap | `sitemap.ts:10-41` | 2m |
| A7 | No conversion tracking on main site lead form submissions | `lead-form.tsx:74-111` | 20m |
| A8 | `ueber-uns` and `fuer-anbieter` pages inherit generic homepage OG tags | Both page files | 10m |
| A9 | robots.txt doesn't block `/api/` or `/lp/` routes | `robots.ts:1-11` | 5m |
| A10 | Search page has no `<h1>` heading | `search/page.tsx` | 5m |
| A11 | Font missing `latin-ext` subset | `layout.tsx:5-8` | 2m |

**P1 Total: 32 findings | Estimated effort: ~20 hours**

---

## P2 — Can Fix Post-Launch (Improvements)

| # | Area | Finding | Est. |
|---|------|---------|------|
| 1 | Security | localStorage cache poisoning (amplifies XSS if P0-S3 unpatched) | 30m |
| 2 | Security | JSON-LD `</script>` escape risk in listing data | 15m |
| 3 | Security | Blog markdown safe by default but fragile if rehypeRaw added | 5m |
| 4 | Security | Supabase error logs may leak schema details | 15m |
| 5 | Performance | `react-markdown` not code-split (17KB, blog only) | 15m |
| 6 | Performance | `gray-matter` parsing at request time instead of build time | 15m |
| 7 | Performance | ListingCard `priority` set on all 264 cards (resource contention) | 15m |
| 8 | Performance | No Suspense boundaries for streaming SSR | 2h |
| 9 | Performance | Public images mixed JPEG/WebP, logos could be SVG | 30m |
| 10 | UX | Carousel dots non-interactive, only show first 5 | 30m |
| 11 | UX | Carousel arrows hidden on mobile with no swipe indicator | 15m |
| 12 | UX | `suppressHydrationWarning` on `<main>` may mask real issues | 15m |
| 13 | UX | No OG image on most pages (social sharing) | 20m |
| 14 | UX | Listing detail sidebar (trust signals) hidden on mobile | 1h |
| 15 | UX | Password manager cleanup logic duplicated 3x | 30m |
| 16 | UX | No cookie consent banner (TTDSG risk) | 3h |
| 17 | DevOps | `any` type usage in search-map-inner.tsx | 30m |
| 18 | DevOps | No pre-commit hooks | 30m |
| 19 | DevOps | Missing `poweredByHeader: false` in next.config | 5m |
| 20 | DevOps | Unused `SUPABASE_ANON_KEY` in .env.local | 5m |
| 21 | SEO | JSON-LD enhancements (amenities, openingHours) | 30m |
| 22 | SEO | Blog Article schema missing `dateModified` | 5m |
| 23 | SEO | Sitemap `lastModified` always uses `new Date()` | 15m |
| 24 | SEO | UTM parameters not captured on main site | 1h |
| 25 | SEO | Legal pages missing canonical URLs | 10m |

**P2 Total: 25 findings**

---

## Recommended Fix Order (P0)

Grouped by dependency and effort efficiency:

**Wave 1 — Quick security wins (2h)**
1. S4: HTML-escape email templates (30m)
2. S3: Sanitize `.setHTML()` popup values (30m)
3. S2: Validate lat/lng as numbers (30m)
4. U3: Change email input to `type="email"` + add server validation (15m)
5. D2: Create `.env.example` (15m)

**Wave 2 — Infrastructure (3h)**
6. S1: Replace open Overpass proxy with parameterized endpoint (1h)
7. D1: Add env var validation module with zod (1h)
8. A1: Add GTM/gtag to main site layout (15m)
9. A2: Create default OG image, add to root metadata (20m)
10. U4: Fix Datenschutz to reference Mapbox (30m)

**Wave 3 — Rate limiting + error monitoring (4h)**
11. S5: Add rate limiting (Upstash Redis or in-memory) (2h)
12. D3: Add Sentry with Next.js SDK (2h)

**Wave 4 — Architecture refactor (8h)**
13. P2: Refactor search/city pages to server components with client islands (4h)
14. P1: Split listings.ts into separate modules, reduce client payload (2h)
15. P3: Add `generateStaticParams` to city + listing pages (30m)
16. U1: Create custom not-found.tsx + error.tsx (1h)
17. U2: Add `notFound()` check for invalid city slugs (15m)

---

## Individual Audit Reports

- [SECURITY.md](SECURITY.md) — 20 findings (5 P0, 7 P1, 8 P2)
- [PERFORMANCE.md](PERFORMANCE.md) — 16 findings (3 P0, 6 P1, 7 P2)
- [UX-FRONTEND.md](UX-FRONTEND.md) — 25 findings (5 P0, 10 P1, 10 P2)
- [DEVOPS-INFRA.md](DEVOPS-INFRA.md) — 17 findings (5 P0, 6 P1, 6 P2)
- [SEO-ANALYTICS.md](SEO-ANALYTICS.md) — 20 findings (4 P0, 8 P1, 8 P2)

---

*Consolidated audit: 2026-02-25*
