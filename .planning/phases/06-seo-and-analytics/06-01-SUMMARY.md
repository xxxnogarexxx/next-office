---
phase: 06-seo-and-analytics
plan: 01
subsystem: ui
tags: [ga4, gtag, analytics, seo, fonts, next.js]

# Dependency graph
requires:
  - phase: 05-ux-and-reliability
    provides: lead-form with working CSRF-protected submission
provides:
  - GA4 page_view tracking on all main site pages via GTMScript
  - generate_lead conversion event on lead form submission
  - Inter font with latin-ext subset for German character support
  - Semantic h1 heading on search page for SEO crawlers
affects: [06-seo-and-analytics, launch]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - GTMScript server component reused from LP layout in main site layout
    - window.gtag typeof guard pattern for graceful degradation without GA4
    - Global Window interface extension for gtag type declaration

key-files:
  created: []
  modified:
    - src/app/(main)/layout.tsx
    - src/app/layout.tsx
    - src/components/lead-form.tsx
    - src/components/search-listings-client.tsx

key-decisions:
  - "GTMScript placed outside TrackingProvider as sibling — server component, not affected by client context"
  - "window.gtag typeof guard enables graceful degradation — form still submits without GA4 loaded"
  - "h1 text is 'Büros finden' — generic enough for all search contexts (city-filtered and unfiltered)"

patterns-established:
  - "GTMScript reuse: LP layout GTMScript can be imported directly into any layout for GA4 coverage"
  - "gtag event pattern: typeof window + typeof window.gtag guard before any gtag call"

requirements-completed: [SEO-01, SEO-07, SEO-10, SEO-11]

# Metrics
duration: 4min
completed: 2026-02-26
---

# Phase 06 Plan 01: GA4 Analytics and SEO Fixes Summary

**GA4 page_view fires on all main site pages via reused GTMScript, generate_lead fires on lead form submission, Inter font gains latin-ext for German characters, search page gains semantic h1**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-26T05:45:58Z
- **Completed:** 2026-02-26T05:49:58Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Reused existing LP `GTMScript` component in `(main)/layout.tsx` — GA4 now fires on all main site pages with zero new code
- Added `generate_lead` GA4 event after successful lead form submission with typeof guard for graceful degradation
- Added `latin-ext` to Inter font subsets — German umlauts and eszett now render correctly
- Added semantic `<h1>Büros finden</h1>` to search page — visible to crawlers, provides document heading hierarchy

## Task Commits

Each task was committed atomically:

1. **Task 1: Add GA4 tracking to main site and fix font subset** - `429451b` (feat)
2. **Task 2: Fire generate_lead event on form submit, add h1 to search page** - `3b6891e` (feat)

## Files Created/Modified
- `src/app/(main)/layout.tsx` - Added GTMScript import and render (GA4 on all main pages)
- `src/app/layout.tsx` - Added "latin-ext" to Inter font subsets
- `src/components/lead-form.tsx` - Added window.gtag type declaration + generate_lead event after successful submit
- `src/components/search-listings-client.tsx` - Added semantic h1 "Büros finden" above listings

## Decisions Made
- GTMScript placed as sibling to TrackingProvider (not inside it) — it is a server component that injects scripts, TrackingProvider is a client boundary
- window.gtag typeof guard: `typeof window !== "undefined" && typeof window.gtag === "function"` — ensures graceful degradation in dev and when GA4 env var is absent
- h1 text "Büros finden" is intentionally generic — search page does not always filter by city so a city-specific h1 would be misleading

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. GA4 tracking activates automatically when `NEXT_PUBLIC_GA4_ID` env var is set in production.

## Next Phase Readiness

- GA4 analytics foundation complete for main site — page views and conversions will be tracked in production
- SEO-01, SEO-07, SEO-10, SEO-11 satisfied
- Ready for remaining Phase 6 SEO plans (structured data, meta tags, sitemap, etc.)

---
*Phase: 06-seo-and-analytics*
*Completed: 2026-02-26*

## Self-Check: PASSED

All files confirmed present. All task commits verified in git log.
