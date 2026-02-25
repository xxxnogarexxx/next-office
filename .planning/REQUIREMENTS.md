# Requirements: next-office.io Launch Readiness

**Defined:** 2026-02-25
**Core Value:** Lead capture must be secure, reliable, and observable — every submission persists and notifies the team.

## v1 Requirements

Requirements for launch readiness. Each maps to roadmap phases.

### Security

- [ ] **SEC-01**: Overpass API proxy is parameterized — no arbitrary user-controlled queries forwarded (S1)
- [ ] **SEC-02**: lat/lng params validated as numbers before Overpass QL interpolation (S2)
- [ ] **SEC-03**: Transit popup HTML-escapes all OpenStreetMap tag values before rendering (S3)
- [ ] **SEC-04**: Notification email templates HTML-escape all user-provided fields (S4)
- [ ] **SEC-05**: Lead endpoints enforce per-IP rate limiting (S5)
- [ ] **SEC-06**: Security headers configured (CSP, X-Frame-Options, HSTS, Referrer-Policy) (S6)
- [ ] **SEC-07**: Lead form endpoints have CSRF protection (S7)
- [ ] **SEC-08**: Email validation uses RFC-compliant check on both main and LP routes (S8)
- [ ] **SEC-09**: Cookie values (gclid/gbraid/wbraid) validated for format and length (S9)
- [ ] **SEC-10**: Lead inserts use scoped Supabase access instead of service role key (S10)
- [ ] **SEC-11**: Lead request bodies validated for input size and field types (S11)
- [ ] **SEC-12**: Mapbox token restricted to allowed URLs in dashboard (S12)

### Performance

- [ ] **PERF-01**: Client JS payload reduced — listings data split so search/city pages receive only needed fields (P1)
- [ ] **PERF-02**: Search and city pages render as server components with client islands for interactivity (P2)
- [ ] **PERF-03**: City and listing pages use generateStaticParams for static generation (P3)
- [ ] **PERF-04**: Mapbox GL lazy-loaded on listing detail pages (triggered by viewport) (P4)
- [ ] **PERF-05**: ListingCard carousel renders only visible photos, remaining lazy-loaded (P5)
- [ ] **PERF-06**: Transit API has appropriate timeout (30s), retry with backoff, and error handling (P6)
- [ ] **PERF-07**: /api/transit responses include Cache-Control headers (P7)
- [ ] **PERF-08**: LeadForm does not import full listings.json — cities extracted to separate module (P8)

### UX / Frontend

- [ ] **UX-01**: Custom branded 404 page exists with navigation back to site (U1)
- [ ] **UX-02**: Error boundaries exist for main layout and key pages (U1)
- [ ] **UX-03**: Invalid city slugs return 404 instead of showing all listings (U2)
- [ ] **UX-04**: Email input uses type="email" and server validates email format (U3)
- [ ] **UX-05**: Datenschutz page correctly references Mapbox instead of OpenStreetMap (U4)
- [ ] **UX-06**: Footer year rendering does not cause hydration mismatch (U5)
- [ ] **UX-07**: Search bar dropdown has proper ARIA attributes (role="listbox", aria-activedescendant) (U6)
- [ ] **UX-08**: Lead form hydration skeleton shows loading indicator with aria-busy (U7)
- [ ] **UX-09**: Photo gallery fullscreen has focus trap, body scroll lock, and role="dialog" (U8)
- [ ] **UX-10**: Zero-result searches show empty state with helpful CTA (U9)
- [ ] **UX-11**: Lead form submit button shows spinner during loading (U10)
- [ ] **UX-12**: Decorative icons have aria-hidden="true" across main site (U11)

### DevOps / Infrastructure

- [ ] **DEV-01**: Runtime env var validation fails fast on startup with clear error messages (D1)
- [ ] **DEV-02**: .env.example documents all required environment variables (D2)
- [ ] **DEV-03**: Sentry error monitoring captures client and server errors with source maps (D3)
- [ ] **DEV-04**: CI/CD pipeline runs lint + build on push (D4)
- [ ] **DEV-05**: Health check endpoint at /api/health returns 200 with basic diagnostics (D5)
- [ ] **DEV-06**: CORS policy restricts API routes to allowed origins (D6)
- [ ] **DEV-07**: Placeholder Google Ads conversion values replaced or validated against env vars (D7)

### SEO / Analytics

- [ ] **SEO-01**: GA4/GTM tracking active on all main site pages (A1)
- [ ] **SEO-02**: Default OG image exists and is set in root metadata (A2)
- [ ] **SEO-03**: Homepage has explicit page-level metadata export (A3)
- [ ] **SEO-04**: Homepage includes Organization structured data (A4)
- [ ] **SEO-05**: Listing and blog pages include BreadcrumbList structured data (A5)
- [ ] **SEO-06**: /contact page included in sitemap (A6)
- [ ] **SEO-07**: Main site lead form fires conversion tracking event on submission (A7)
- [ ] **SEO-08**: ueber-uns and fuer-anbieter pages have specific OG tags (A8)
- [ ] **SEO-09**: robots.txt blocks /api/ and /lp/ routes from crawlers (A9)
- [ ] **SEO-10**: Search page has semantic h1 heading (A10)
- [ ] **SEO-11**: Font includes latin-ext subset for German characters (A11)

### Reliability

- [ ] **REL-01**: Listings without coordinates handled gracefully on map (visible indicator or excluded with logging)
- [ ] **REL-02**: Rapid city page navigation does not cause hydration mismatch in lead form
- [ ] **REL-03**: localStorage exceptions caught gracefully — transit cache degrades to fetch without error
- [ ] **REL-04**: Lead API routes consolidated into shared service (single source of truth)
- [ ] **REL-05**: Email sending does not block lead API response path
- [ ] **REL-06**: Duplicate leads detected by phone + city before insert

### Quick Wins

- [ ] **QW-01**: X-Powered-By header removed (P2-19)
- [ ] **QW-02**: JSON-LD escapes </script> in listing data (P2-2)
- [ ] **QW-03**: Blog Article schema includes dateModified (P2-22)
- [ ] **QW-04**: Legal pages have canonical URLs (P2-25)

## v2 Requirements

Deferred to post-launch. Tracked but not in current roadmap.

### Legal / Compliance

- **LEGAL-01**: Cookie consent banner (TTDSG compliant)
- **LEGAL-02**: Full DSGVO audit of all third-party data flows

### Lead Management

- **LEAD-01**: Lead follow-up reminder cron job (alert if lead >15min old and not contacted)
- **LEAD-02**: Lead analytics dashboard (conversions by campaign/source)
- **LEAD-03**: Listing matching in thank-you email (top 3 matches by city + capacity)

### Performance

- **PERF-V2-01**: Suspense boundaries for streaming SSR
- **PERF-V2-02**: Code-split react-markdown (blog only)
- **PERF-V2-03**: Static map previews for city overview pages
- **PERF-V2-04**: Build-time gray-matter parsing instead of request-time

### UX

- **UX-V2-01**: Interactive carousel dots
- **UX-V2-02**: Mobile swipe indicators for carousel
- **UX-V2-03**: Listing detail sidebar visible on mobile
- **UX-V2-04**: UTM parameter capture on main site

## Out of Scope

| Feature | Reason |
|---------|--------|
| LP subfolder changes | Separate project with own git repo |
| New test suite | Fixes only — no greenfield test infrastructure |
| Contentful import script optimization | scripts/ not in launch path |
| Mobile app | Web-first platform |
| OAuth / user accounts | Public site, no auth needed |
| Real-time chat | Not core to brokerage model |
| Database migration (away from JSON) | Future milestone — JSON sufficient at current scale |
| Pre-commit hooks | P2 item, defer to post-launch |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | — | Pending |
| SEC-02 | — | Pending |
| SEC-03 | — | Pending |
| SEC-04 | — | Pending |
| SEC-05 | — | Pending |
| SEC-06 | — | Pending |
| SEC-07 | — | Pending |
| SEC-08 | — | Pending |
| SEC-09 | — | Pending |
| SEC-10 | — | Pending |
| SEC-11 | — | Pending |
| SEC-12 | — | Pending |
| PERF-01 | — | Pending |
| PERF-02 | — | Pending |
| PERF-03 | — | Pending |
| PERF-04 | — | Pending |
| PERF-05 | — | Pending |
| PERF-06 | — | Pending |
| PERF-07 | — | Pending |
| PERF-08 | — | Pending |
| UX-01 | — | Pending |
| UX-02 | — | Pending |
| UX-03 | — | Pending |
| UX-04 | — | Pending |
| UX-05 | — | Pending |
| UX-06 | — | Pending |
| UX-07 | — | Pending |
| UX-08 | — | Pending |
| UX-09 | — | Pending |
| UX-10 | — | Pending |
| UX-11 | — | Pending |
| UX-12 | — | Pending |
| DEV-01 | — | Pending |
| DEV-02 | — | Pending |
| DEV-03 | — | Pending |
| DEV-04 | — | Pending |
| DEV-05 | — | Pending |
| DEV-06 | — | Pending |
| DEV-07 | — | Pending |
| SEO-01 | — | Pending |
| SEO-02 | — | Pending |
| SEO-03 | — | Pending |
| SEO-04 | — | Pending |
| SEO-05 | — | Pending |
| SEO-06 | — | Pending |
| SEO-07 | — | Pending |
| SEO-08 | — | Pending |
| SEO-09 | — | Pending |
| SEO-10 | — | Pending |
| SEO-11 | — | Pending |
| REL-01 | — | Pending |
| REL-02 | — | Pending |
| REL-03 | — | Pending |
| REL-04 | — | Pending |
| REL-05 | — | Pending |
| REL-06 | — | Pending |
| QW-01 | — | Pending |
| QW-02 | — | Pending |
| QW-03 | — | Pending |
| QW-04 | — | Pending |

**Coverage:**
- v1 requirements: 57 total
- Mapped to phases: 0
- Unmapped: 57 (pending roadmap creation)

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 after initial definition*
