# UX & Frontend Quality Audit

**Date:** 2026-02-25
**Scope:** Main site only (excluding `LP/` subfolder and `src/components/lp/` landing page components)
**Auditor:** Senior UX/Frontend Engineer

---

## Executive Summary

The next-office.io main site is well-structured with consistent German localization, responsive Tailwind breakpoints, and solid SEO metadata across all pages. However, there are several launch-blocking issues: no custom 404 page, no error boundaries, the search and city pages are fully client-rendered (killing SEO for the most valuable pages), the email input uses `type="text"` instead of `type="email"` (breaking native validation), and the Datenschutz page references OpenStreetMap instead of Mapbox (a legal compliance gap). The site also has moderate accessibility gaps in the main components compared to the more polished LP components, and the footer's dynamic year rendering creates a guaranteed hydration mismatch.

---

## P0 -- Must Fix Before Launch

### P0-1: No custom 404 page or error boundaries

**Files:**
- Missing: `src/app/not-found.tsx`
- Missing: `src/app/error.tsx`
- Missing: `src/app/(main)/error.tsx`

**Description:** There is no custom `not-found.tsx` at any level. When a user hits a non-existent URL (e.g., `/invalid-city` or `/berlin/nonexistent-listing`), they see the default Next.js 404 page with no branding, no navigation, and no way to recover. Similarly, there are no `error.tsx` error boundaries anywhere in the app tree. If Supabase is down, Mapbox fails to load, or the listings JSON is malformed, the user sees a white screen or the Next.js default error page.

**User impact:** Users who land on invalid URLs (typos, expired Google Ads links, old bookmarks) see a dead-end with no brand trust. Runtime errors crash the entire page with no recovery path.

**Recommended fix:**
1. Create `src/app/not-found.tsx` with NextOffice branding, a helpful message in German, search bar, and link to home.
2. Create `src/app/(main)/error.tsx` as a client component error boundary with a "try again" button and contact info.
3. The listing detail page already calls `notFound()` correctly (line 88 of `[listing]/page.tsx`), but the city page does NOT -- it falls back to showing all listings for invalid slugs (line 25 of `[city]/page.tsx`). This should call `notFound()` instead.

---

### P0-2: Search page and city page are fully client-rendered -- no SSR/SEO

**Files:**
- `src/app/(main)/search/page.tsx` (line 1: `"use client"`)
- `src/app/(main)/[city]/page.tsx` (line 1: `"use client"`)

**Description:** Both the search page and all city pages (`/berlin`, `/muenchen`, etc.) are marked `"use client"` at the page level. This means the entire page content is rendered only on the client side. Googlebot will see an empty shell. The city pages are the most SEO-valuable pages on the site (targeting "Buro mieten Berlin" etc.), yet they deliver zero server-rendered content.

The city layout (`[city]/layout.tsx`) correctly generates metadata server-side, but the actual page content (h1, listing cards, listing count) is all client-rendered and invisible to crawlers.

**User impact:** Search engines index empty pages for the highest-value keywords. This directly undermines the entire SEO strategy. City pages targeting "Buro mieten [city]" will not rank.

**Recommended fix:**
1. Refactor `[city]/page.tsx` into a server component that receives params, fetches listings server-side, and passes them to a client component for interactive features (map toggle, hover state). The h1, listing count, and listing cards should render server-side.
2. Similarly, consider making the search page a server component with client islands for interactivity.
3. At minimum, add a server-rendered `<noscript>` section or static fallback content.

---

### P0-3: Email input uses type="text" -- bypasses native browser validation

**Files:**
- `src/components/lead-form.tsx` (line 176: `type="text"`, line 177: `inputMode="email"`)

**Description:** The email field uses `type="text"` with `inputMode="email"`. While `inputMode="email"` shows the right keyboard on mobile, `type="text"` means the browser's built-in email validation is completely bypassed. The `required` attribute only checks for non-empty, not for email format. A user can submit "hello" as their email and it will pass client-side validation.

The API route has a basic server-side regex check, but the LP route (`lp-leads/route.ts` line 51) uses `^[^\s@]+@[^\s@]+\.[^\s@]+$` which accepts invalid patterns like `@.@`. The main lead route (`api/leads/route.ts`) has NO email format validation at all -- it only checks `if (!body.name || !body.email)` (line 18), meaning any non-empty string passes.

**User impact:** Invalid emails are submitted, Resend API may reject them, and the team wastes time on unreachable leads. The form provides no feedback that the email is malformed.

**Recommended fix:**
1. Change to `type="email"` to get native browser validation.
2. Add server-side email format validation in `api/leads/route.ts` matching the LP route's regex (or better, use a validation library).
3. The `autoComplete="one-time-code"` workaround to suppress password managers will still work with `type="email"`.

---

### P0-4: Datenschutz page references OpenStreetMap instead of Mapbox

**Files:**
- `src/app/(main)/datenschutz/page.tsx` (lines 122-127)

**Description:** The Datenschutz (privacy policy) page states: "Unsere Website nutzt Kartenmaterial von OpenStreetMap." However, the site actually uses Mapbox GL JS for all map functionality. Mapbox is a different service with different data processing, different servers (api.mapbox.com, tiles.mapbox.com, events.mapbox.com), and different privacy implications. The root layout even includes `<link rel="dns-prefetch">` and `<link rel="preconnect">` for Mapbox domains.

Under GDPR/DSGVO, the privacy policy must accurately disclose which third-party services process user data and to which servers data is transmitted.

**User impact:** Legal non-compliance. A competitor or privacy-conscious user could file a DSGVO complaint. The privacy policy misrepresents which services are in use.

**Recommended fix:**
1. Replace the OpenStreetMap section with accurate Mapbox disclosure: service name (Mapbox Inc.), data transmitted (IP address, map interactions), server locations (US), and link to Mapbox's privacy policy.
2. Also disclose Supabase (data storage) and Resend (email sending) as data processors, since form data is sent to both.

---

### P0-5: Footer renders dynamic year causing hydration mismatch

**Files:**
- `src/components/footer.tsx` (line 61: `{new Date().getFullYear()}`)

**Description:** The Footer component is a server component (no `"use client"` directive). It renders `new Date().getFullYear()` which executes both on the server and the client. If the server pre-renders at 23:59 UTC on Dec 31 and the client hydrates at 00:01 UTC on Jan 1, the year will differ and cause a React hydration mismatch error.

More practically, this is unlikely to cause issues most days, but it is a known anti-pattern. The `suppressHydrationWarning` on `<main>` in the layout (line 20) may mask this, but that only suppresses one level deep -- it does not propagate to deeply nested components.

**User impact:** Occasional hydration errors in production logs. React may silently fall back to client-side rendering for the footer subtree.

**Recommended fix:**
1. Either make the footer a client component with `useEffect` for the year, or
2. Hard-code the year as a build-time constant, or
3. Add `suppressHydrationWarning` directly to the `<div>` containing the year text.

---

## P1 -- Should Fix Before Launch

### P1-1: City page falls through to all listings on invalid slug instead of 404

**Files:**
- `src/app/(main)/[city]/page.tsx` (lines 24-26)

**Description:** When an invalid city slug is used (e.g., `/invalid-city-name`), the city page does not call `notFound()`. Instead, it falls back: `const displayListings = cityListings.length > 0 ? cityListings : allListings;` and `const cityName = city?.name ?? citySlug;`. This means `/asdfgh` will show ALL listings with the heading "Buro mieten in asdfgh" and the page title generated by the layout will say "Buro asdfgh -- Office Spaces mieten".

**User impact:** Garbage pages are indexable by search engines. Users see confusing content. Invalid URLs do not produce a proper 404.

**Recommended fix:** Add a check at the top of `CitySearchPage`: if `!city`, call `notFound()` (or redirect to `/search`). This requires converting the page to a server component or using `redirect()` from `next/navigation`.

---

### P1-2: Search bar dropdown missing ARIA attributes for keyboard navigation

**Files:**
- `src/components/search-bar.tsx` (lines 101-123)

**Description:** The search bar implements keyboard navigation (ArrowDown/ArrowUp/Enter/Escape) but the dropdown lacks ARIA attributes. The dropdown container has no `role="listbox"`, the items have no `role="option"`, there is no `aria-activedescendant` on the input, and no `aria-expanded` attribute. Screen readers cannot discover or navigate the autocomplete suggestions.

**User impact:** The search bar is inaccessible to screen reader users. Keyboard-only users can navigate but get no announcements of what is selected.

**Recommended fix:**
1. Add `role="combobox"`, `aria-expanded={isOpen}`, `aria-autocomplete="list"`, and `aria-activedescendant` to the input.
2. Add `role="listbox"` to the dropdown container.
3. Add `role="option"` and `id` attributes to each city item.
4. Add `aria-selected` to the currently highlighted item.

---

### P1-3: Lead form hydration skeleton has no semantic content or loading indicator

**Files:**
- `src/components/lead-form.tsx` (lines 113-126)

**Description:** Before the `mounted` state is set (during SSR and initial hydration), the lead form renders an empty `<div>` with a fixed `minHeight: 380` (for non-dialog variants). This empty box has no loading indicator, no skeleton UI, and no `aria-busy` attribute. Users see a blank white rectangle until JavaScript hydrates.

The `useEffect(() => setMounted(true), [])` pattern means the form is completely invisible during SSR. This is the hydration mismatch issue noted in CONCERNS.md.

**User impact:** Form appears as a blank rectangle during page load. On slow connections, this can last several seconds. No visual feedback that content is loading.

**Recommended fix:**
1. Add a skeleton loader (pulsing input outlines) to the pre-mount state.
2. Add `aria-busy="true"` to the skeleton container.
3. Consider using `next/dynamic` with `ssr: false` (like `SearchMap` does) instead of the mount-state pattern, which would at least show a proper loading component.

---

### P1-4: Photo gallery fullscreen overlay lacks focus trap and body scroll lock

**Files:**
- `src/components/photo-gallery.tsx` (lines 75-118)

**Description:** The fullscreen photo gallery overlay renders as a `position: fixed` div covering the entire viewport. It handles `Escape` key to close (line 19), but:
1. There is no focus trap -- tab key can reach elements behind the overlay.
2. There is no body scroll lock -- on mobile, the background page may still scroll.
3. The overlay is not announced to screen readers (`role="dialog"` is missing).
4. The close button has no `aria-label`.

**User impact:** Keyboard and screen reader users cannot properly interact with the gallery. On mobile, background content may scroll under the overlay.

**Recommended fix:**
1. Add `role="dialog"`, `aria-modal="true"`, and `aria-label="Bildergalerie"` to the overlay div.
2. Implement a focus trap (use `@radix-ui/react-focus-scope` or a custom hook).
3. Add `document.body.style.overflow = 'hidden'` when open, restore on close.
4. Add `aria-label="Galerie schliessen"` to both close buttons.

---

### P1-5: Sitemap missing contact, legal, and blog index pages

**Files:**
- `src/app/sitemap.ts` (lines 10-41)

**Description:** The sitemap includes the homepage, search, blog, ueber-uns, and fuer-anbieter pages, plus all city, listing, and blog post pages. However, the following pages are missing:
- `/contact` (the main lead generation page)
- `/datenschutz` (marked `robots: { index: false }` in metadata, but sitemap should still optionally include it)
- `/impressum` (marked `robots: { index: false }`)
- `/agb` (marked `robots: { index: false }`)

The `/contact` page is the most critical omission -- it has `index: true` (default) but is not in the sitemap.

**User impact:** The contact page may not be discovered by search engines as efficiently. Missing from XML sitemap reduces crawl priority.

**Recommended fix:** Add `/contact` to the static pages array in `sitemap.ts`. The legal pages can remain excluded since they are `noindex`.

---

### P1-6: No empty state for search/city pages when no listings match

**Files:**
- `src/app/(main)/search/page.tsx` (lines 23-37)
- `src/app/(main)/[city]/page.tsx` (lines 40-107)

**Description:** Neither the search page nor the city page handles the case where `listings.length === 0` (search) or `displayListings.length === 0` (city). If a city has no listings, the page shows "0 Buros in [city] verfugbar" followed by an empty grid. There is no helpful empty state, no CTA to contact the team, and no suggestion to try a different city.

**User impact:** Users hitting a city with no listings see a confusingly empty page. No guidance on next steps.

**Recommended fix:** Add an empty state component that shows a friendly message ("Wir haben aktuell keine Buros in [city]. Kontaktieren Sie uns...") with a link to the contact page and a form.

---

### P1-7: Lead form submit button lacks loading state visual feedback

**Files:**
- `src/components/lead-form.tsx` (lines 254-257)

**Description:** When the form is submitting, the button text changes to "Wird gesendet..." and the button is `disabled`, but there is no spinner or visual loading indicator. The button's appearance stays the same (same background color, same size), just with changed text.

**User impact:** Users may not notice the submit state change, especially if they are not looking at the button text. They may click repeatedly.

**Recommended fix:** Add a spinner icon (e.g., `Loader2` from lucide with `animate-spin`) next to the text during submission. Consider also hiding the `Send` icon during the loading state.

---

### P1-8: Decorative icons in listing cards and detail pages missing aria-hidden

**Files:**
- `src/components/listing-card.tsx` (lines 159, 165, 169)
- `src/app/(main)/[city]/[listing]/page.tsx` (lines 214-248, 272-284)
- `src/app/(main)/page.tsx` (lines 234-245)

**Description:** The main site components use lucide-react icons (MapPin, Users, Euro, etc.) as decorative elements next to text. These icons are not marked with `aria-hidden="true"`. By contrast, the LP components consistently use `aria-hidden="true"` on decorative icons (visible in the grep results). Without `aria-hidden`, screen readers announce the icon's implicit content or SVG structure, creating noise.

**User impact:** Screen reader users hear unnecessary announcements for purely decorative icons.

**Recommended fix:** Add `aria-hidden="true"` to all decorative lucide-react icons in the main site components. Only icons that serve as the sole interactive element (like the search icon button) should remain visible to screen readers.

---

### P1-9: Map popup uses inline styles and native `<a>` tag instead of Next.js Link

**Files:**
- `src/components/search-map-inner.tsx` (lines 367-408)

**Description:** The listing popup in the search map uses a native `<a>` tag with inline styles instead of Next.js `<Link>`. This means clicking a popup triggers a full page navigation instead of client-side routing. The popup also uses extensive inline `style={{}}` objects instead of Tailwind classes, making it inconsistent with the rest of the codebase.

Additionally, the transit line tooltip (line 148) uses `setHTML()` with string interpolation of the `colour` and `ref` properties. While these come from the Overpass API (not user input), this is technically an XSS vector if the API response is tampered with.

**User impact:** Clicking a map popup causes a full page reload instead of smooth client-side navigation. Inconsistent styling is a maintenance burden.

**Recommended fix:**
1. Replace `<a href=...>` with Next.js `<Link>` (Note: this may require a wrapper since Mapbox popups render outside React).
2. Convert inline styles to Tailwind classes.
3. Sanitize the `colour` and `ref` values before injecting into HTML.

---

### P1-10: Mobile close button in header Sheet has no aria-label

**Files:**
- `src/components/header.tsx` (line 45)

**Description:** The mobile sheet close button (the X icon) is rendered as a plain `<button>` with no `aria-label` and no `sr-only` text. Screen readers will announce it as an unlabeled button.

**User impact:** Screen reader users cannot identify the purpose of the close button in the mobile navigation.

**Recommended fix:** Add `aria-label="Menu schliessen"` to the close button.

---

## P2 -- Post-Launch Improvements

### P2-1: Listing carousel dots are not interactive and only show first 5

**Files:**
- `src/components/listing-card.tsx` (lines 101-112)

**Description:** The image carousel dots at the bottom of listing cards are non-interactive `<span>` elements with no click handler. They only show dots for the first 5 images regardless of how many photos the listing has. Users cannot click dots to jump to a specific image. The dots also have no ARIA attributes -- they are invisible to screen readers.

**User impact:** Users cannot jump to specific images. If a listing has 10+ photos, the dots suggest there are only 5.

**Recommended fix:**
1. Make dots clickable buttons with `aria-label="Foto [n]"`.
2. Show all dots (or a "..." indicator for many photos).
3. Consider adding `aria-live="polite"` region announcing current image.

---

### P2-2: Carousel arrows hidden on mobile with no visible alternative

**Files:**
- `src/components/listing-card.tsx` (lines 77-98)

**Description:** The previous/next carousel buttons use `hidden lg:flex` -- they are completely invisible below the `lg` breakpoint. Touch swipe is implemented (lines 32-53) as the mobile alternative, but there is no visual affordance telling users they can swipe. First-time users may not discover the swipe gesture.

**User impact:** Mobile users may not realize they can swipe through photos. No visual hint for swipe interaction.

**Recommended fix:** Add a subtle swipe indicator (e.g., a small arrow animation on first view, or show arrows briefly on touch).

---

### P2-3: Multiple suppressHydrationWarning usages masking real issues

**Files:**
- `src/app/layout.tsx` (lines 77, 85: `suppressHydrationWarning` on `<html>` and `<body>`)
- `src/app/(main)/layout.tsx` (line 20: `suppressHydrationWarning` on `<main>`)
- `src/components/search-bar.tsx` (lines 144, 177: `suppressHydrationWarning` on inputs)

**Description:** `suppressHydrationWarning` is used in 5 places across the app. On `<html>` and `<body>`, this is a common pattern for theme/extension compatibility. However, the `<main suppressHydrationWarning>` in the layout and the search bar inputs may be masking real hydration issues rather than solving them. The search bar's `suppressHydrationWarning` is likely needed because password manager extensions modify input attributes, but this should be documented.

**User impact:** Real hydration mismatches may go undetected, leading to subtle rendering bugs.

**Recommended fix:** Audit each usage. Remove `suppressHydrationWarning` from `<main>` if there is no specific hydration issue it addresses. Document the reason for each remaining usage in a code comment.

---

### P2-4: OG image missing from root and most page metadata

**Files:**
- `src/app/layout.tsx` (lines 33-41: `openGraph` has no `images` property)
- `src/app/(main)/[city]/layout.tsx` (lines 17-34: no `images` in openGraph)
- `src/app/(main)/search/layout.tsx` (lines 7-13: no `images` in openGraph)
- `src/app/(main)/contact/page.tsx` (lines 14-21: no openGraph at all except alternates)
- `src/app/(main)/ueber-uns/page.tsx` (lines 15-22: no `images` in openGraph)
- `src/app/(main)/fuer-anbieter/page.tsx` (lines 15-22: no `images` in openGraph)

**Description:** The root layout defines `openGraph` metadata but with no `images` property. Most page-level metadata also lacks OG images. Only the listing detail page (line 55) and blog post page (line 34) include OG images. When these pages are shared on social media (LinkedIn, WhatsApp, Slack), they will show no preview image.

**User impact:** Social media shares look generic with no visual preview. Reduced click-through rates on shared links.

**Recommended fix:**
1. Create a default OG image (1200x630px) with NextOffice branding.
2. Add it to the root layout metadata: `images: [{ url: '/og-default.jpg', width: 1200, height: 630 }]`.
3. Override per-page where a more specific image exists (listing pages already do this).

---

### P2-5: Blog page and blog post page have no structured data (JSON-LD)

**Files:**
- `src/app/(main)/blog/page.tsx` (no JSON-LD)
- Comparison: `src/app/(main)/blog/[slug]/page.tsx` (lines 57-73: has Article JSON-LD)
- `src/app/(main)/page.tsx` (no JSON-LD for Organization)

**Description:** The blog index page has no structured data. The homepage also lacks Organization schema. Only the listing detail page (LocalBusiness) and blog post page (Article) have JSON-LD. Adding Organization schema to the homepage and CollectionPage or ItemList schema to the blog index would improve search appearance.

**User impact:** Reduced rich snippet eligibility in Google search results.

**Recommended fix:**
1. Add Organization JSON-LD to the homepage.
2. Add ItemList JSON-LD to the blog index page.
3. Consider adding BreadcrumbList JSON-LD to city and listing pages.

---

### P2-6: Listing detail page sidebar not visible on mobile until scroll to bottom

**Files:**
- `src/app/(main)/[city]/[listing]/page.tsx` (line 290: `hidden lg:block`)
- `src/app/(main)/[city]/[listing]/listing-page-client.tsx` (lines 114-148: mobile sticky bar)

**Description:** The sidebar CTA (price, "Kostenloses Angebot erhalten" button, trust signals) is `hidden lg:block` -- completely invisible on mobile. Instead, there is a minimal sticky bottom bar showing only the price and a small "Angebot erhalten" button. The trust signals (100% kostenlos, keine versteckten Kosten, 1000+ Unternehmen) that are prominent on desktop are entirely missing on mobile.

**User impact:** Mobile users miss important trust signals that drive conversion. The mobile CTA bar is minimal and may not convey enough value.

**Recommended fix:** Add key trust signals to the mobile sticky bar or show a compact version of the sidebar when the user scrolls past the main content area.

---

### P2-7: Password manager cleanup logic duplicated across components

**Files:**
- `src/components/lead-form.tsx` (lines 42-68)
- `src/components/search-bar.tsx` (lines 22-44)
- `src/app/globals.css` (lines 121-154)

**Description:** The password manager extension cleanup logic is implemented three times: once in JavaScript in `lead-form.tsx`, once in JavaScript in `search-bar.tsx`, and once in CSS in `globals.css`. The CSS approach (`globals.css` lines 133-144) already handles the visual hiding. The JavaScript MutationObserver approach removes elements entirely. These three implementations may conflict and are a maintenance burden.

**User impact:** No direct user impact, but increases maintenance cost and risk of regressions.

**Recommended fix:** Choose one approach. The CSS-only approach in `globals.css` is the most robust. Remove the JavaScript MutationObserver from both `lead-form.tsx` and `search-bar.tsx` and rely on CSS `display: none !important` for extension-injected elements.

---

### P2-8: Mapbox CSS loaded globally via dynamic import side effect

**Files:**
- `src/components/search-map-inner.tsx` (line 6: `import "mapbox-gl/dist/mapbox-gl.css"`)
- `src/components/listing-map-inner.tsx` (line 6: `import "mapbox-gl/dist/mapbox-gl.css"`)

**Description:** Both map inner components import `mapbox-gl/dist/mapbox-gl.css` at the top of the file. Even though these components are loaded via `next/dynamic` with `ssr: false`, the CSS import is a side effect that may be hoisted into the main bundle depending on the bundler configuration. This adds ~30KB of CSS that is only needed when a map is visible.

**User impact:** Slight increase in CSS bundle size for all pages, even those without maps (home, contact, about, blog).

**Recommended fix:** This is documented in CONCERNS.md. Consider lazy-loading the CSS only when the map container is about to render, or accept the trade-off given Mapbox CSS is relatively small.

---

### P2-9: Lead form "required" markers (*) missing on Telefon in dialog variant

**Files:**
- `src/components/lead-form.tsx` (lines 187-196)

**Description:** The phone field is marked `required` in the HTML (line 195), and the label shows "Telefon *" (line 187). This is correct for all variants. However, when the form appears inside the `LeadDialog` (variant="dialog"), the compact layout may cause the asterisk to be less visible on small screens where the form is already quite dense.

This is a minor visual concern, not a functional bug. The form validation will still enforce the required field.

**User impact:** Minimal. Users may not notice all fields are required in the compact dialog view.

**Recommended fix:** Consider adding a "* Pflichtfeld" note at the top or bottom of the form, especially for the dialog variant.

---

### P2-10: No cookie consent banner

**Files:**
- `src/middleware.ts` (sets tracking cookies)
- `src/app/layout.tsx` (no cookie consent component)
- `src/app/(main)/datenschutz/page.tsx` (section 4 mentions cookies)

**Description:** The middleware sets first-party cookies (`_no_gclid`, `_no_gbraid`, `_no_wbraid`, `_no_lp`, `_no_ref`) for Google Ads tracking. The Datenschutz page mentions cookies in section 4. However, there is no cookie consent banner or mechanism for users to opt in/out of non-essential cookies.

Under TTDSG (German Telecommunications-Telemedia Data Protection Act), cookies that are not strictly necessary for the service require explicit consent before being set. The Google Ads tracking cookies are arguably not strictly necessary.

**User impact:** Potential TTDSG non-compliance. Risk of legal complaints.

**Recommended fix:**
1. Implement a cookie consent banner that asks for consent before setting tracking cookies.
2. In middleware, check for a consent cookie before setting gclid/gbraid/wbraid cookies.
3. The in-memory `TrackingProvider` approach (which avoids cookies entirely) already exists as a fallback -- this could be used as the default, with cookie-based tracking only enabled after consent.

---

## Verified Concerns from CONCERNS.md

| Concern | Verified | Notes |
|---------|----------|-------|
| Hydration mismatch in lead-form.tsx | Yes | Lines 39-40: `useEffect(() => setMounted(true), [])`. Pre-mount renders an empty div. Rapid navigation may desync. Confirmed. |
| Password manager interference | Yes | Lines 42-68: MutationObserver with fragile selectors. Also duplicated in search-bar.tsx. CSS approach in globals.css may conflict. |
| Lead form has 4 layout variants | Yes | `variant: "sidebar" \| "inline" \| "contact" \| "dialog"` (line 23). Variant rendering via ternaries in className strings (lines 116-122, 131-133, 149-155). |
| No tests for UI components | Yes | No test files found anywhere in the `src/` directory. No `__tests__` directories, no `.test.tsx` or `.spec.tsx` files. |
| Listings without coordinates not on map | Yes | `search-map-inner.tsx` lines 185-188: `allListings.filter(l => l.latitude !== null && l.longitude !== null)`. Silent filtering confirmed. |
| localStorage exceptions swallowed | Yes | `search-map-inner.tsx` lines 50-62: `try { ... } catch { /* ignore */ }`. No logging, no fallback notification. |

---

## Summary of Findings by Category

| Category | P0 | P1 | P2 |
|----------|----|----|-----|
| Responsive Design | 0 | 0 | 2 |
| Hydration Issues | 1 | 1 | 1 |
| Accessibility | 0 | 4 | 1 |
| SEO | 1 | 2 | 2 |
| Error States & Loading | 1 | 2 | 0 |
| Content Quality (Legal) | 1 | 0 | 1 |
| Component Quality | 1 | 1 | 1 |
| **Total** | **5** | **10** | **10** |

---

*Audit completed: 2026-02-25*
