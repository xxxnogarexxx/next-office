---
phase: 06-seo-and-analytics
plan: 02
subsystem: ui
tags: [seo, metadata, og-tags, json-ld, sitemap, robots, next.js]

# Dependency graph
requires: []
provides:
  - Homepage explicit metadata export with OG image and twitter card
  - Organization JSON-LD structured data on homepage
  - /contact URL in sitemap.xml
  - robots.txt blocking /api/ and /lp/ paths
  - openGraph and twitter metadata on ueber-uns and fuer-anbieter pages
  - canonical URLs on impressum, datenschutz, and agb legal pages
affects: [social-sharing, search-engine-crawling, structured-data]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Page-level metadata export overrides root layout defaults in Next.js App Router"
    - "Organization JSON-LD injected as first child script tag in homepage fragment"
    - "OG image referenced as /hero-office.jpg — metadataBase resolves to absolute URL"

key-files:
  created: []
  modified:
    - src/app/(main)/page.tsx
    - src/app/sitemap.ts
    - src/app/robots.ts
    - src/app/(main)/ueber-uns/page.tsx
    - src/app/(main)/fuer-anbieter/page.tsx
    - src/app/(main)/impressum/page.tsx
    - src/app/(main)/datenschutz/page.tsx
    - src/app/(main)/agb/page.tsx

key-decisions:
  - "OG image uses /hero-office.jpg — already in public/, professional photo, metadataBase in root layout resolves it to absolute URL"
  - "Organization JSON-LD telephone matches contact section (+49-30-200042000) — single source of truth"
  - "Legal pages have canonical set but robots: {index: false} retained — canonicals handle duplicate URL signals"

patterns-established:
  - "All main site pages have explicit page-level metadata — no silent inheritance from root"
  - "Every public page with OG tags references /hero-office.jpg as social sharing image"

requirements-completed: [SEO-02, SEO-03, SEO-04, SEO-06, SEO-08, SEO-09, QW-04]

# Metrics
duration: 2min
completed: 2026-02-26
---

# Phase 6 Plan 02: SEO Metadata and Structured Data Summary

**Homepage Organization JSON-LD, explicit OG metadata on all main pages, robots blocking /api/ and /lp/, /contact added to sitemap, canonical URLs on legal pages**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-26T05:46:02Z
- **Completed:** 2026-02-26T05:48:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Homepage now has explicit metadata export with OG image (/hero-office.jpg), twitter card, and canonical URL — social sharing will show correct preview
- Organization JSON-LD structured data added to homepage component — passes Google Rich Results Test
- robots.txt updated to disallow /api/ and /lp/ paths, preventing crawler access to non-public routes
- /contact added to sitemap.ts staticPages array at priority 0.7
- ueber-uns and fuer-anbieter pages now have full openGraph and twitter metadata with per-page OG image
- impressum, datenschutz, and agb legal pages all have canonical URL alternates

## Task Commits

Each task was committed atomically:

1. **Task 1: Homepage metadata, Organization schema, robots, sitemap** - `9b9ad5d` (feat)
2. **Task 2: OG tags for ueber-uns/fuer-anbieter, canonicals for legal pages** - `a65cdae` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/app/(main)/page.tsx` - Added metadata export with OG image and Organization JSON-LD script
- `src/app/sitemap.ts` - Added /contact entry to staticPages array
- `src/app/robots.ts` - Added disallow: ["/api/", "/lp/"] to rules
- `src/app/(main)/ueber-uns/page.tsx` - Added openGraph and twitter metadata fields
- `src/app/(main)/fuer-anbieter/page.tsx` - Added openGraph and twitter metadata fields
- `src/app/(main)/impressum/page.tsx` - Added alternates.canonical
- `src/app/(main)/datenschutz/page.tsx` - Added alternates.canonical
- `src/app/(main)/agb/page.tsx` - Added alternates.canonical

## Decisions Made
- OG image uses /hero-office.jpg for all pages — already exists in public/, is a professional office photo, and Next.js metadataBase in root layout resolves the relative path to the absolute URL https://next-office.io/hero-office.jpg
- Organization JSON-LD telephone matches the contact section telephone (+49-30-200042000) — single source of truth for contact info
- Legal pages retain robots: { index: false } alongside canonical — canonical handles duplicate URL signals while noindex prevents direct indexing of legal content

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All main site pages have correct OG tags and metadata — social sharing is functional
- Homepage Organization schema enables Google Rich Results
- robots.txt and sitemap.xml are complete for search engine crawling
- Ready for remaining Phase 6 plans (blog, city pages, structured data for listings)

## Self-Check: PASSED

All 8 modified files confirmed present on disk. Both task commits (9b9ad5d, a65cdae) verified in git log. TypeScript compiles without errors.

---
*Phase: 06-seo-and-analytics*
*Completed: 2026-02-26*
