# Roadmap: next-office.io Launch Readiness

## Overview

The codebase is functional but has security vulnerabilities, performance bottlenecks, UX gaps, infrastructure gaps, and SEO/analytics gaps identified in a 5-domain audit. This milestone fixes all P0s, all P1s, selected reliability issues, and quick P2 wins — making the platform safe to launch. Phases are sequenced by what can be safely worked on together: attack surface first, then infrastructure, then the lead pipeline, then performance architecture, then UX/reliability polish, then SEO/analytics.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Security Hardening** - Close the critical attack surface (P0 vulnerabilities in Overpass proxy, XSS, email injection, rate limiting) (completed 2026-02-26)
- [x] **Phase 2: Infrastructure Foundations** - Env validation, observability, CI/CD, security headers, health endpoint (completed 2026-02-26)
- [x] **Phase 3: Lead Pipeline Hardening** - All lead-specific security and reliability (CSRF, input validation, scoped keys, deduplication, consolidation) (completed 2026-02-26)
- [x] **Phase 4: Performance Architecture** - Server components refactor, listings payload split, static generation, lazy loading (completed 2026-02-26)
- [x] **Phase 5: UX and Reliability** - Error pages, map/navigation bugs, accessibility, loading states, hydration fixes (completed 2026-02-26)
- [ ] **Phase 6: SEO and Analytics** - Tracking, metadata, structured data, robots, sitemap, font

## Phase Details

### Phase 1: Security Hardening
**Goal**: The most dangerous attack vectors are eliminated — the Overpass proxy cannot be abused, XSS is impossible in transit popups, email templates cannot inject HTML to broker inboxes, and lead endpoints enforce rate limits.
**Depends on**: Nothing (first phase)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05
**Success Criteria** (what must be TRUE):
  1. The /api/transit endpoint only forwards parameterized, predefined query types — an arbitrary Overpass QL string in the request body is rejected
  2. lat/lng params in Overpass queries are validated as finite numbers before interpolation — non-numeric values return 400
  3. Transit popup HTML is escaped — injecting `<img onerror=...>` in an OSM tag value does not execute JavaScript
  4. Notification emails sent to the broker team escape all user-provided fields — submitting `<script>alert(1)</script>` as a name renders as plain text in email
  5. Submitting more than N lead requests per minute from the same IP returns 429 — the lead endpoint is not open to unlimited abuse
**Plans**: TBD

### Phase 2: Infrastructure Foundations
**Goal**: The application fails fast on misconfiguration, errors are observable in production, the CI pipeline catches regressions before deployment, and security headers and housekeeping items are in place.
**Depends on**: Phase 1
**Requirements**: DEV-01, DEV-02, DEV-03, DEV-04, DEV-05, DEV-06, DEV-07, SEC-06, QW-01
**Success Criteria** (what must be TRUE):
  1. Starting the app with a missing required env var produces a clear error message identifying the missing variable — no silent failure
  2. .env.example exists at project root and documents every required env var with a description
  3. A Sentry error in production (client or server) appears in the Sentry dashboard within 60 seconds
  4. A push to main triggers the CI pipeline — lint and build failures block merge
  5. GET /api/health returns 200 with a JSON body confirming environment readiness
**Plans**: 4 plans
- [x] 02-01-PLAN.md — Env validation, .env.example, health check, Google Ads validation (DEV-01, DEV-02, DEV-05, DEV-07)
- [x] 02-02-PLAN.md — Security headers, CORS, X-Powered-By removal (SEC-06, QW-01, DEV-06)
- [x] 02-03-PLAN.md — Sentry error monitoring with source maps (DEV-03)
- [x] 02-04-PLAN.md — CI/CD pipeline with GitHub Actions (DEV-04)

### Phase 3: Lead Pipeline Hardening
**Goal**: The lead submission path is hardened end-to-end — CSRF-protected, input-validated, scoped to least privilege, deduplicated, consolidated into one service, and non-blocking for email delivery.
**Depends on**: Phase 1
**Requirements**: SEC-07, SEC-08, SEC-09, SEC-10, SEC-11, REL-04, REL-05, REL-06
**Success Criteria** (what must be TRUE):
  1. A cross-origin POST to /api/leads without a valid CSRF token is rejected with 403
  2. Submitting a lead with email "hello" (no @) returns a validation error — both the main and LP routes enforce RFC-compliant email format
  3. Lead inserts use a scoped Supabase role, not the service role key — the service role key is absent from lead API handler code
  4. Submitting a duplicate lead (same phone + city within a configured window) returns a deduplicated response rather than inserting a second DB row
  5. The lead API response returns within 500ms regardless of email delivery latency — email sending is non-blocking
**Plans**: 2 plans
- [ ] 03-01-PLAN.md — Shared lead service library: validation, CSRF, scoped Supabase, email, dedup, orchestrator (SEC-07, SEC-08, SEC-09, SEC-10, SEC-11, REL-04, REL-05, REL-06)
- [ ] 03-02-PLAN.md — Wire routes and forms to shared service: thin route delegation, CSRF endpoint, form token flow (SEC-07, SEC-08, SEC-09, SEC-10, SEC-11, REL-04, REL-05, REL-06)

### Phase 4: Performance Architecture
**Goal**: Search and city pages are server-rendered, the 588KB listings payload is eliminated from the client bundle, static pages are generated at build time, and Mapbox and carousel images are lazy-loaded.
**Depends on**: Phase 3
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PERF-07, PERF-08
**Success Criteria** (what must be TRUE):
  1. The /berlin and /muenchen city pages deliver server-rendered HTML to crawlers — curl on the page URL returns listing content without JavaScript execution
  2. The JS bundle for search/city pages no longer includes the full 588KB listings.json — the client payload is measurably smaller (network tab shows no listings.json transfer)
  3. City and listing pages are statically generated at build time — build output lists them as static (SSG) not server-rendered (SSR)
  4. Mapbox GL does not load on a listing detail page until the map section enters the viewport — network tab shows no mapbox-gl bundle request on initial page load
  5. ListingCard carousel renders only the first photo on initial load — additional photos only load when carousel is navigated
**Plans**: TBD

### Phase 5: UX and Reliability
**Goal**: Users never hit blank or broken pages, map and navigation edge cases are handled gracefully, the lead form and photo gallery are accessible and polished, and hydration errors are eliminated.
**Depends on**: Phase 4
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05, UX-06, UX-07, UX-08, UX-09, UX-10, UX-11, UX-12, REL-01, REL-02, REL-03, SEC-12
**Success Criteria** (what must be TRUE):
  1. Navigating to /nonexistent-page shows the branded 404 page with a link back to the homepage — not a generic Next.js error
  2. Navigating to /asdfgh (invalid city slug) returns a 404 — the page does not show "Buro mieten in asdfgh" with all listings
  3. The Datenschutz page correctly references Mapbox — no mention of OpenStreetMap as the map provider
  4. Listings without coordinates are handled gracefully on the map — no JavaScript error is thrown and other listings remain visible
  5. The photo gallery fullscreen traps focus and locks body scroll — pressing Tab cycles within the dialog and the page does not scroll behind it
  6. The lead form submit button shows a loading spinner during submission — the user has visual feedback that the request is in flight
**Plans**: 3 plans
- [ ] 05-01-PLAN.md — Error pages, city 404 routing, Datenschutz fix, zero-result empty states (UX-01, UX-02, UX-03, UX-05, UX-10)
- [ ] 05-02-PLAN.md — Form UX polish: email type, footer hydration, aria-busy skeleton, submit spinner, lead form reset (UX-04, UX-06, UX-08, UX-11, REL-02)
- [ ] 05-03-PLAN.md — Accessibility + reliability: ARIA search bar, photo gallery focus trap, decorative icon labels, map coord handling, localStorage resilience, Mapbox token restriction (UX-07, UX-09, UX-12, REL-01, REL-03, SEC-12)

### Phase 6: SEO and Analytics
**Goal**: Every main site page has GA4 tracking active, metadata and OG tags are correct on all public pages, structured data meets current schema requirements, and robots/sitemap are accurate.
**Depends on**: Phase 5
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07, SEO-08, SEO-09, SEO-10, SEO-11, QW-02, QW-03, QW-04
**Success Criteria** (what must be TRUE):
  1. GA4 fires a page_view event on homepage, city pages, listing detail pages, search, blog, and contact — verifiable in GA4 DebugView
  2. Sharing the homepage, a listing page, and a blog post on LinkedIn/Slack shows the correct OG image and title — no generic or blank preview
  3. The homepage includes Organization schema and a page-level metadata export — Google Rich Results Test passes for the homepage
  4. Listing and blog pages include BreadcrumbList structured data — Rich Results Test shows breadcrumb for a listing URL
  5. robots.txt blocks /api/ and /lp/ — Googlebot cannot index lead API responses or LP routes
  6. /contact is present in the sitemap — sitemap.xml includes the contact URL
**Plans**: 3 plans
- [ ] 06-01-PLAN.md — GA4 tracking on main site, lead form conversion event, font latin-ext, search page h1 (SEO-01, SEO-07, SEO-10, SEO-11)
- [ ] 06-02-PLAN.md — Homepage metadata + Organization schema, OG tags for ueber-uns/fuer-anbieter, robots.txt disallow, sitemap /contact, legal page canonicals (SEO-02, SEO-03, SEO-04, SEO-06, SEO-08, SEO-09, QW-04)
- [ ] 06-03-PLAN.md — BreadcrumbList on listing and blog pages, JSON-LD script escaping, blog dateModified (SEO-05, QW-02, QW-03)

## Progress

**Execution Order:** 1 → 2 → 3 → 4 → 5 → 6

Note: Phases 2 and 3 both depend on Phase 1 and are independent of each other — they can be planned and partially parallelized.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Security Hardening | 2/2 | Complete   | 2026-02-26 |
| 2. Infrastructure Foundations | 4/4 | Complete   | 2026-02-26 |
| 3. Lead Pipeline Hardening | 2/2 | Complete    | 2026-02-26 |
| 4. Performance Architecture | 3/3 | Complete    | 2026-02-26 |
| 5. UX and Reliability | 3/3 | Complete   | 2026-02-26 |
| 6. SEO and Analytics | 1/3 | In Progress|  |
