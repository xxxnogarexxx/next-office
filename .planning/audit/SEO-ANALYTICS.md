# SEO & Analytics Audit — next-office.io (Main Site)

**Date:** 2026-02-25
**Scope:** `src/app/(main)/` and shared root files. LP (`src/app/(lp)/`) excluded.

## Executive Summary

The site has a solid metadata foundation — every page exports metadata or generateMetadata with unique titles and descriptions, the sitemap covers all dynamic routes, and JSON-LD is present on listing detail and blog post pages. However, there are several high-impact gaps: no global Open Graph image (social shares show no image for most pages), no `not-found.tsx` custom 404 page, missing GA4/GTM integration on main site pages (only LP pages have it), and no Organization schema on the homepage. The font configuration also omits the `latin-ext` subset needed for full German character rendering.

---

## P0 — Must Fix Before Launch

### P0-1: No GA4 or Google Ads tracking on main site pages

**Affected files:**
- `src/app/(main)/layout.tsx` (lines 1-25)
- `src/components/tracking-provider.tsx` (lines 1-60)

**Description:**
The `(main)/layout.tsx` wraps pages with `<TrackingProvider>`, which only captures Google Ads click IDs (gclid/gbraid/wbraid) in React state. There is no `<GTMScript />` or gtag.js loading anywhere in the main site layout. The GTM/GA4 script injection (`src/components/lp/tracking/gtm-script.tsx`) is only included in the LP layout (`src/app/(lp)/layout.tsx`, line 37). This means every page under the `(main)` route group — homepage, city pages, listing detail, search, blog, about, contact, for-providers — has zero Google Analytics or Google Ads pageview tracking.

**SEO/Business impact:** Critical. You cannot measure organic traffic, user behavior, or attribute conversions on the main site. Google Ads conversions from main site forms are invisible to Google Ads (the leads API route at `src/app/(main)/api/leads/route.ts` stores gclid in Supabase via cookie fallback, but no Google Ads conversion tag fires client-side).

**Recommended fix:**
Add a `<GTMScript />` component (or equivalent gtag.js loading) to `src/app/(main)/layout.tsx`. Either reuse the LP's `GTMScript` component or create a main-site equivalent that loads GA4 and Google Ads scripts with `strategy="afterInteractive"`.

---

### P0-2: No Open Graph image for most pages

**Affected files:**
- `src/app/layout.tsx` (lines 33-41) — root OG config has no `images` property
- `src/app/(main)/page.tsx` — homepage, no metadata export at all
- `src/app/(main)/[city]/layout.tsx` (lines 17-35) — city metadata, no OG image
- `src/app/(main)/search/layout.tsx` (lines 3-17) — search metadata, no OG image
- `src/app/(main)/blog/page.tsx` (lines 8-22) — blog index, no OG image
- `src/app/(main)/ueber-uns/page.tsx` (lines 15-22) — no OG image
- `src/app/(main)/fuer-anbieter/page.tsx` (lines 15-22) — no OG image
- `src/app/(main)/contact/page.tsx` (lines 14-21) — no OG image

**Description:**
The root metadata in `src/app/layout.tsx` defines `openGraph` with title, description, locale, and siteName, but no `images` property. There is no `opengraph-image.png` (or `.jpg`) in `src/app/` or `public/` directory. Only two page types have OG images: listing detail pages (line 55 of `[listing]/page.tsx`, using `listing.coverPhoto`) and blog posts (line 34 of `blog/[slug]/page.tsx`, using `post.coverImage`). All other pages — including the homepage — will render without a preview image when shared on LinkedIn, Twitter/X, Slack, WhatsApp, etc.

**SEO/Business impact:** High. B2B decision-makers frequently share links via LinkedIn and Slack. Links without preview images get significantly lower click-through rates (estimates range from 2-5x lower engagement). The homepage and city pages are the most commonly shared URLs.

**Recommended fix:**
1. Create a default OG image (1200x630px) with NextOffice branding and place it as `src/app/opengraph-image.png` (Next.js convention) or add `images: [{ url: '/og-default.png', width: 1200, height: 630 }]` to the root metadata in `src/app/layout.tsx`.
2. For city pages, consider generating city-specific OG images (e.g., using `generateMetadata` to return a city photo as the OG image).

---

### P0-3: No custom 404 page (`not-found.tsx`)

**Affected files:**
- Missing: `src/app/not-found.tsx` or `src/app/(main)/not-found.tsx`

**Description:**
There is no `not-found.tsx` file anywhere in the `src/app/` directory. The `notFound()` function is correctly called in listing detail (`[listing]/page.tsx`, line 88) and blog post (`blog/[slug]/page.tsx`, line 54) when content is not found, but without a custom `not-found.tsx`, users see the generic Next.js 404 page. The city page (`[city]/page.tsx`) is a `"use client"` component that does NOT call `notFound()` for invalid city slugs — it silently falls through to showing all listings (line 25: `const displayListings = cityListings.length > 0 ? cityListings : allListings`).

**SEO/Business impact:** Medium-high. Invalid city slugs (e.g., `/asdf`) show content instead of a 404, which can cause Google to index garbage URLs. The generic 404 page for valid `notFound()` calls lacks branding and provides no useful navigation or lead capture opportunity.

**Recommended fix:**
1. Create `src/app/not-found.tsx` with branded 404 content, German copy, and links to homepage/search/contact.
2. In `src/app/(main)/[city]/page.tsx`, add a check: if `cityListings.length === 0 && !city`, call `notFound()` (requires converting to server component or adding a redirect mechanism).

---

### P0-4: Font subset missing `latin-ext` for German characters

**Affected files:**
- `src/app/layout.tsx` (lines 5-8)

**Description:**
The Inter font is loaded with `subsets: ["latin"]` only. The `latin-ext` subset is required for some German-specific typographic characters. While basic umlauts (a, o, u) are in the base Latin subset, the `latin-ext` subset provides additional characters that may be needed for proper German typography. More importantly, some browsers may show font loading flashes (FOIT) if the subset doesn't cover all required glyphs.

**SEO/Business impact:** Low-medium. Could cause subtle rendering issues or font flash on some characters.

**Recommended fix:**
Change to `subsets: ["latin", "latin-ext"]`.

---

## P1 — Should Fix Before Launch

### P1-1: Homepage has no page-level metadata export

**Affected files:**
- `src/app/(main)/page.tsx` (lines 1-381)

**Description:**
The homepage component at `src/app/(main)/page.tsx` exports only a default function `HomePage()` with no `metadata` or `generateMetadata` export. It relies entirely on the root layout's metadata from `src/app/layout.tsx`. While the root metadata is reasonable, this means:
- The homepage canonical URL is set to `https://next-office.io` (from root), which is correct.
- But there is no way to differentiate homepage-specific OG tags, Twitter card, or add homepage-specific structured data without a page-level export.

**SEO/Business impact:** Low-medium. The root metadata serves as an acceptable fallback, but best practice is explicit homepage metadata for maximum control.

**Recommended fix:**
Add a `metadata` export to `src/app/(main)/page.tsx` with homepage-specific title, description, and (once created) OG image.

---

### P1-2: No Organization schema on homepage

**Affected files:**
- `src/app/(main)/page.tsx` — no JSON-LD script present

**Description:**
The homepage has no structured data markup. An `Organization` schema with company name, URL, logo, contact information, and `sameAs` links would help Google's Knowledge Panel and enhance brand presence in search results. The only JSON-LD in the main site is `LocalBusiness` on listing detail pages (`[listing]/page.tsx`, lines 91-115) and `Article` on blog posts (`blog/[slug]/page.tsx`, lines 57-73).

**SEO/Business impact:** Medium. Organization schema is a strong signal for branded searches ("NextOffice") and can populate the Knowledge Graph panel in Google search results.

**Recommended fix:**
Add a `<script type="application/ld+json">` block to the homepage with:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "NextOffice",
  "url": "https://next-office.io",
  "logo": "https://next-office.io/logo.png",
  "description": "Deutschlands Plattform fur flexible Buros und Office Spaces",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Schopenstehl 13",
    "addressLocality": "Hamburg",
    "postalCode": "20095",
    "addressCountry": "DE"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+49-30-200042000",
    "contactType": "customer service",
    "availableLanguage": "German"
  }
}
```

---

### P1-3: No BreadcrumbList schema on listing detail or blog post pages

**Affected files:**
- `src/app/(main)/[city]/[listing]/page.tsx` — has LocalBusiness JSON-LD but no Breadcrumbs
- `src/app/(main)/blog/[slug]/page.tsx` — has Article JSON-LD but no Breadcrumbs

**Description:**
Listing detail pages have a visual "back" link (`Zuruck zu Buros in {city}`, line 182) and blog posts have a back link (`Alle Artikel`, line 85), but neither has `BreadcrumbList` structured data. Breadcrumb schema enables Google to show breadcrumb navigation in search results (e.g., "NextOffice > Berlin > Listing Name"), which improves CTR and helps users understand site hierarchy.

**SEO/Business impact:** Medium. Breadcrumbs in search results improve CTR and are especially valuable for listing-type sites with deep URL hierarchies.

**Recommended fix:**
Add `BreadcrumbList` JSON-LD to listing detail pages:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://next-office.io" },
    { "@type": "ListItem", "position": 2, "name": "Berlin", "item": "https://next-office.io/berlin" },
    { "@type": "ListItem", "position": 3, "name": "Listing Name" }
  ]
}
```
Similarly for blog posts: Home > Ratgeber > Post Title.

---

### P1-4: Sitemap missing static pages (contact, impressum, datenschutz, agb)

**Affected files:**
- `src/app/sitemap.ts` (lines 10-41)

**Description:**
The sitemap includes: homepage, `/search`, `/blog`, `/ueber-uns`, `/fuer-anbieter`, plus all dynamic city pages, listing pages, and blog posts. Missing from the sitemap:
- `/contact` (the main lead generation page)
- `/impressum` (intentionally noindex, so acceptable to omit)
- `/datenschutz` (intentionally noindex, so acceptable to omit)
- `/agb` (intentionally noindex, so acceptable to omit)

The `/contact` page IS indexable (no `robots: { index: false }` in its metadata) and is a high-value page that should be in the sitemap.

**SEO/Business impact:** Medium. The contact page is the primary conversion entry point from organic search. Missing it from the sitemap doesn't prevent indexing but delays discovery.

**Recommended fix:**
Add `/contact` to the `staticPages` array in `src/app/sitemap.ts`:
```ts
{ url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
```

---

### P1-5: No conversion tracking on main site lead form submission

**Affected files:**
- `src/components/lead-form.tsx` (lines 74-111, `handleSubmit` function)
- `src/app/(main)/layout.tsx` — no gtag loaded

**Description:**
When a user submits the lead form on main site pages (homepage, contact, listing detail, about, for-providers), the `handleSubmit` function sends data to the API, then sets `submitted = true` to show a success message. There is no Google Ads conversion tag fired, no GA4 event emitted, and no redirect to a thank-you page. The LP flow has proper conversion tracking: it redirects to `/lp/[city]/danke` which fires `ConversionTracker` (conversion-tracker.tsx). The main site flow has none of this.

Even if gtag were loaded (see P0-1), there's no `window.gtag("event", "conversion", ...)` call in the lead form's success handler.

**SEO/Business impact:** High. Main site leads are invisible to Google Ads and GA4. Cannot optimize ad spend or measure organic conversion rate without this data.

**Recommended fix:**
1. First, resolve P0-1 (load gtag on main site).
2. Add conversion tracking in `lead-form.tsx` after successful submission:
```ts
if (typeof window !== "undefined" && typeof window.gtag === "function") {
  window.gtag("event", "conversion", {
    send_to: `${conversionId}/${conversionLabel}`,
    value: 1.0,
    currency: "EUR",
    transaction_id: crypto.randomUUID(),
  });
  window.gtag("event", "lead_form_submit", { event_category: "conversion" });
}
```

---

### P1-6: `ueber-uns` and `fuer-anbieter` pages missing OG title/description

**Affected files:**
- `src/app/(main)/ueber-uns/page.tsx` (lines 15-22)
- `src/app/(main)/fuer-anbieter/page.tsx` (lines 15-22)

**Description:**
Both pages export metadata with `title`, `description`, and `alternates.canonical`, but no `openGraph` block. They will inherit the root layout's OG title/description ("Buro mieten -- Flexible Office Spaces in Deutschland"), which is the homepage's generic copy and not relevant to these pages.

**SEO/Business impact:** Low-medium. When shared on social media, these pages will show the generic homepage description instead of their page-specific description.

**Recommended fix:**
Add `openGraph: { title, description, type: "website", url: "https://next-office.io/ueber-uns" }` to both pages' metadata exports.

---

### P1-7: robots.txt does not block private/internal routes

**Affected files:**
- `src/app/robots.ts` (lines 1-11)

**Description:**
The robots.txt configuration is minimal — it allows all crawlers on all paths and points to the sitemap. It does not block:
- `/api/*` routes (leads, districts, transit, transit-lines)
- `/lp/*` landing page routes (these are ad-specific and likely shouldn't be crawled by organic bots, as they could be seen as duplicate content of city pages)

**SEO/Business impact:** Low-medium. API routes returning JSON are unlikely to be indexed, but explicitly blocking them is best practice. LP pages could cause thin content/duplicate content issues if indexed alongside main city pages.

**Recommended fix:**
```ts
rules: [
  { userAgent: "*", allow: "/", disallow: ["/api/", "/lp/"] },
],
```

---

### P1-8: Search page has no `<h1>` heading

**Affected files:**
- `src/app/(main)/search/page.tsx` (lines 10-62)

**Description:**
The search page is a `"use client"` component that renders only a paragraph with listing count (`<p>` tag, line 24) and listing cards. There is no `<h1>` element. Every page should have exactly one `<h1>` for proper heading hierarchy and SEO.

**SEO/Business impact:** Medium. Missing H1 weakens the page's topical relevance signal. The search page's metadata title is "Buros finden -- Alle Office Spaces in Deutschland" but that copy doesn't appear on-page.

**Recommended fix:**
Add an `<h1>` at the top of the listing area:
```tsx
<h1 className="mb-2 text-xl font-bold">Alle Buros in Deutschland</h1>
```

---

## P2 — Post-Launch / Nice to Have

### P2-1: City page is entirely client-rendered (`"use client"`)

**Affected files:**
- `src/app/(main)/[city]/page.tsx` (line 1: `"use client"`)

**Description:**
The city page is a `"use client"` component. This means its content (H1 with city name, listing cards) is not in the initial HTML response — it's rendered client-side after JavaScript loads. The metadata is correctly set in the layout (`[city]/layout.tsx` is a server component with `generateMetadata`), so the `<title>` and meta tags are server-rendered. But the visible page content including the `<h1>` tag is client-rendered.

**SEO/Business impact:** Medium. Google can render JavaScript, but there's a delay (2nd wave of indexing). The H1 content is the same as the metadata title, so the SEO signal is partially covered by meta tags. However, server-rendered content is always preferred for critical SEO pages.

**Recommended fix:**
Consider refactoring the city page to be a server component with client islands for interactive parts (map toggle, hover state). The listing data is already static JSON, so server rendering is straightforward.

---

### P2-2: Listing detail JSON-LD could be more complete

**Affected files:**
- `src/app/(main)/[city]/[listing]/page.tsx` (lines 91-115)

**Description:**
The `LocalBusiness` JSON-LD is present and structurally valid with name, description, image, address, geo, and priceRange. Missing optional but valuable properties:
- `openingHours` (if applicable)
- `telephone` (the platform's contact number)
- `amenityFeature` (listing amenities mapped to schema.org's `LocationFeatureSpecification`)
- `aggregateRating` (if reviews exist in the future)

The `@type` is `LocalBusiness`, which is acceptable but `CoworkingSpace` or `OfficeEquipmentStore` might be more specific (though `LocalBusiness` is the safest choice for Google).

**SEO/Business impact:** Low. The existing JSON-LD is sufficient for rich results. Additional properties would enhance snippet quality marginally.

**Recommended fix:**
Consider adding `telephone`, `openingHoursSpecification`, and mapping amenities to `amenityFeature` in the JSON-LD.

---

### P2-3: Blog Article JSON-LD missing `dateModified`

**Affected files:**
- `src/app/(main)/blog/[slug]/page.tsx` (lines 57-73)

**Description:**
The Article JSON-LD has `datePublished` but no `dateModified`. Google recommends both for Article schema. The blog post data model (`src/lib/blog.ts`) only has a `date` field, so there's no separate modification date available.

**SEO/Business impact:** Low. Google may use `dateModified` for freshness signals in search results.

**Recommended fix:**
Set `dateModified: post.date` (same as published) as a baseline, or add a `lastModified` field to blog post frontmatter.

---

### P2-4: `lastModified` in sitemap always uses `new Date()`

**Affected files:**
- `src/app/sitemap.ts` (lines 8, 16, 21, 26, 33, 38, 48, 54)

**Description:**
All static and dynamic pages (except blog posts) use `lastModified: now` which means the sitemap reports every page as modified right now on every build/request. Blog posts correctly use `new Date(post.date)`. For city and listing pages, the actual data doesn't change unless listings are updated, but the sitemap claims they all changed.

**SEO/Business impact:** Low. Google mostly ignores `lastModified` in sitemaps due to widespread misuse, but accurate values don't hurt and may help with crawl prioritization.

**Recommended fix:**
For static pages, use a fixed date or the build timestamp. For listing pages, if the data source has an `updatedAt` field, use that.

---

### P2-5: No `generateStaticParams` for city or listing pages

**Affected files:**
- `src/app/(main)/[city]/page.tsx` — no `generateStaticParams`
- `src/app/(main)/[city]/[listing]/page.tsx` — no `generateStaticParams`

**Description:**
Blog posts have `generateStaticParams` (line 14 of `blog/[slug]/page.tsx`), but city pages and listing detail pages do not. Since the data is from static JSON files (`src/data/listings.json`, `src/data/cities.json`), these pages could be pre-rendered at build time for better initial load performance and guaranteed SSR HTML for crawlers.

Note: The city page is `"use client"` so this currently can't apply (see P2-1). The listing detail page is a server component and could benefit from this.

**SEO/Business impact:** Low. Without `generateStaticParams`, these pages are dynamically rendered on each request, which is fine for SEO but slightly slower.

**Recommended fix:**
Add `generateStaticParams` to listing detail page:
```ts
export async function generateStaticParams() {
  return listings.map((l) => ({ city: l.citySlug, listing: l.slug }));
}
```

---

### P2-6: `impressum`, `datenschutz`, and `agb` pages missing canonical URLs

**Affected files:**
- `src/app/(main)/impressum/page.tsx` (lines 3-6) — no `alternates.canonical`
- `src/app/(main)/datenschutz/page.tsx` (lines 3-6) — no `alternates.canonical`
- `src/app/(main)/agb/page.tsx` (lines 3-6) — no `alternates.canonical`

**Description:**
These pages have `robots: { index: false, follow: true }` which is correct, but they lack explicit canonical URLs. While noindexed pages don't strictly need canonicals, setting them is a completeness best practice.

**SEO/Business impact:** Negligible. These pages are noindexed.

**Recommended fix:**
Add `alternates: { canonical: "https://next-office.io/impressum" }` etc. to each page's metadata.

---

### P2-7: UTM parameter capture incomplete on main site

**Affected files:**
- `src/components/tracking-provider.tsx` (lines 38-53)
- `src/middleware.ts` (lines 13, 23-35)

**Description:**
The main site's `TrackingProvider` captures only Google Ads click IDs (gclid, gbraid, wbraid). The middleware also only stores these three values plus landing page and referrer. UTM parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content) are NOT captured on the main site. The LP's `LPTrackingProvider` (`src/components/lp/tracking/lp-tracking-provider.tsx`) correctly captures all UTM params.

This means if a user arrives at the main site via a UTM-tagged link (e.g., from an email newsletter or partner referral), the attribution data is lost when they submit a lead form.

**SEO/Business impact:** Medium for marketing attribution. Doesn't affect SEO directly but limits ability to measure marketing channel effectiveness.

**Recommended fix:**
Add UTM param capture to both `TrackingProvider` and `middleware.ts`.

---

### P2-8: English terms used in user-facing content

**Affected files:**
- `src/app/(main)/[city]/[listing]/page.tsx` (lines 132, 141, 149, 165) — "Private Office", "Suite", "Enterprise Suite"
- Various pages — "Office Space", "Office Spaces"

**Description:**
Several user-facing labels use English terms: "Private Office", "Enterprise Suite", "Office Space(s)". While these are industry-standard terms commonly used in the German coworking market (B2B users understand them), it's worth noting for consistency. The overall site content is well-written, natural German with no placeholder text found.

**SEO/Business impact:** Negligible to positive. These English terms are actually search-relevant keywords in the German market ("Private Office mieten" is a common search query).

**Recommended fix:**
No change needed. These are intentional industry terms.

---

## Summary Counts

| Severity | Count | Key themes |
|----------|-------|------------|
| P0       | 4     | No analytics on main site, no OG image, no 404, font subset |
| P1       | 8     | No conversion tracking, missing sitemap pages, missing OG data, no Organization schema, no breadcrumbs, robots.txt gaps, missing H1 |
| P2       | 8     | Client-rendered city page, JSON-LD enhancements, UTM capture, static generation |

**Most impactful quick wins (effort vs. impact):**
1. Add GTM/gtag to main site layout (P0-1) — ~15 min, unlocks all analytics
2. Add default OG image (P0-2) — ~20 min, transforms social sharing
3. Add custom not-found.tsx (P0-3) — ~15 min, captures lost visitors
4. Add conversion tracking to lead form (P1-5) — ~20 min, unlocks ROI measurement
5. Add /contact to sitemap (P1-4) — ~2 min, improves discovery of conversion page
