---
phase: 06-seo-and-analytics
plan: 03
subsystem: seo
tags: [json-ld, structured-data, breadcrumbs, schema-org, xss, seo]

# Dependency graph
requires:
  - phase: 06-01
    provides: GA4 tracking and initial JSON-LD on listing pages
  - phase: 06-02
    provides: Organization JSON-LD on homepage
provides:
  - BreadcrumbList JSON-LD on listing detail pages (3-level: Home > City > Listing)
  - BreadcrumbList JSON-LD on blog post pages (3-level: Home > Ratgeber > Post)
  - XSS-safe JSON-LD output on both page types via </script> escaping
  - dateModified field in Article schema on blog post pages
  - dateModified field in BlogPost interface and getAllPosts() output
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [json-ld-xss-escape, breadcrumb-schema, dateModified-frontmatter-fallback]

key-files:
  created: []
  modified:
    - src/app/(main)/[city]/[listing]/page.tsx
    - src/app/(main)/blog/[slug]/page.tsx
    - src/lib/blog.ts

key-decisions:
  - "BreadcrumbList JSON-LD added as separate <script> tag after existing schema — keeps schemas composable and independently valid"
  - "XSS escape uses .replace(/</g, '\\u003c') — Unicode escape valid in JSON, browsers parse correctly, prevents </script> injection"
  - "dateModified falls back to date when frontmatter field absent — no breaking change for existing blog posts"

patterns-established:
  - "JSON-LD XSS safety: always call .replace(/</g, '\\u003c') on JSON.stringify output in dangerouslySetInnerHTML"
  - "BreadcrumbList as separate script tag from primary entity schema"

requirements-completed: [SEO-05, QW-02, QW-03]

# Metrics
duration: 3min
completed: 2026-02-26
---

# Phase 06 Plan 03: BreadcrumbList and Safe JSON-LD Summary

**BreadcrumbList schema on listing and blog pages with XSS-safe JSON-LD escaping and dateModified in Article schema**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-26T06:06:05Z
- **Completed:** 2026-02-26T06:09:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added BreadcrumbList JSON-LD to listing detail pages (Home > City > Listing) with XSS-safe output
- Added BreadcrumbList JSON-LD to blog post pages (Home > Ratgeber > Post) with XSS-safe output
- Added `dateModified` to Article schema (from frontmatter or fallback to `date`) and BlogPost interface
- Escaped `</script>` sequences in all JSON-LD blocks via `.replace(/</g, "\\u003c")`

## Task Commits

Each task was committed atomically:

1. **Task 1: BreadcrumbList and safe JSON-LD on listing detail pages** - `429451b` (feat — included in 06-01 commit)
2. **Task 2: BreadcrumbList, dateModified, and safe JSON-LD on blog pages** - `dfc1140` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `src/app/(main)/[city]/[listing]/page.tsx` - Added BreadcrumbList JSON-LD (3-level) after LocalBusiness schema; escaped `</script>` in both JSON-LD blocks
- `src/app/(main)/blog/[slug]/page.tsx` - Added `dateModified` to Article schema; escaped `</script>` in Article JSON-LD; added BreadcrumbList JSON-LD (3-level) after Article schema
- `src/lib/blog.ts` - Added optional `dateModified` field to BlogPost interface; reads from frontmatter or falls back to `date` in `getAllPosts()`

## Decisions Made

- BreadcrumbList JSON-LD added as a separate `<script>` tag (not merged into LocalBusiness/Article) — keeps schemas independently valid and simpler to maintain
- XSS escape uses `.replace(/</g, "\\u003c")` — Unicode escape is valid JSON, browsers parse `\u003c` as `<` correctly in JSON-LD context
- `dateModified` falls back to `date` when frontmatter field is absent — no breaking change for existing blog posts without the field
- Blog breadcrumb level 2 named "Ratgeber" (matching the `/blog` page heading) not "Blog"

## Deviations from Plan

None — plan executed exactly as written. Task 1 changes were already present in HEAD (committed under 06-01 commit `429451b`); verified content matches plan spec exactly before proceeding to Task 2.

## Issues Encountered

None. TypeScript compiled cleanly after all changes.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All BreadcrumbList and JSON-LD safety requirements met (SEO-05, QW-02, QW-03)
- Phase 06 SEO & Analytics complete: GA4, Organization schema, listing/blog BreadcrumbList, safe JSON-LD
- Ready for launch or next milestone planning

---
*Phase: 06-seo-and-analytics*
*Completed: 2026-02-26*
