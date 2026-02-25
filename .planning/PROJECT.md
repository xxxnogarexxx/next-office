# next-office.io — Launch Readiness

## What This Is

B2B coworking brokerage platform for the German market. Connects businesses looking for office space with coworking providers. Users browse listings by city, view details on a map, and submit lead forms. Brokers receive notifications and follow up. The codebase exists and works — this milestone makes it launch-ready by fixing all security, performance, UX, infrastructure, and SEO issues identified in a comprehensive 5-domain audit.

## Core Value

Lead capture must be secure, reliable, and observable. Every form submission must persist to Supabase, notify the team, and never be lost silently. If everything else breaks, leads still flow.

## Requirements

### Validated

<!-- Existing capabilities confirmed working in codebase audit. -->

- ✓ Listing discovery flow (homepage → city → listing detail) — existing
- ✓ Lead capture form with multi-variant rendering (sidebar, inline, contact, dialog) — existing
- ✓ Supabase lead persistence + Resend email notification — existing
- ✓ Mapbox GL map integration with transit overlays — existing
- ✓ Google Ads attribution tracking (middleware cookies + client context) — existing
- ✓ Landing page route group with separate layout and conversion tracking — existing
- ✓ Blog with markdown content and frontmatter — existing
- ✓ SEO basics: JSON-LD structured data, sitemap, metadata — existing
- ✓ City-based search with listing grid + map view — existing
- ✓ Photo gallery with fullscreen view — existing

### Active

<!-- Launch readiness fixes — all P0s, all P1s, selected CONCERNS.md items, quick P2 wins. -->

**Security (P0)**
- [ ] Close open Overpass API proxy (SSRF) — S1
- [ ] Fix Overpass QL injection via lat/lng interpolation — S2
- [ ] Sanitize XSS via .setHTML() in transit popup — S3
- [ ] HTML-escape notification email templates — S4
- [ ] Add rate limiting on lead endpoints — S5

**Security (P1)**
- [ ] Add security headers (CSP, X-Frame-Options, HSTS, Referrer-Policy) — S6
- [ ] Add CSRF protection on lead form endpoints — S7
- [ ] Fix email validation (main route has none, LP regex accepts @.@) — S8
- [ ] Validate cookie values (gclid/gbraid/wbraid) — S9
- [ ] Replace service role key with scoped access for lead inserts — S10
- [ ] Add input size/type validation on lead request bodies — S11
- [ ] Restrict Mapbox token URL scope — S12

**Performance (P0)**
- [ ] Split 588KB listings.json — reduce client payload — P1
- [ ] Refactor search/city pages to server components with client islands — P2
- [ ] Add generateStaticParams to city + listing pages — P3

**Performance (P1)**
- [ ] Lazy-load Mapbox GL on listing detail pages — P4
- [ ] Fix ListingCard eager rendering of ALL carousel photos — P5
- [ ] Fix transit API timeout + add retry logic — P6
- [ ] Add Cache-Control to /api/transit responses — P7
- [ ] Break LeadForm dependency on full listings import — P8

**UX/Frontend (P0)**
- [ ] Create custom 404 page + error boundaries — U1
- [ ] Return 404 for invalid city slugs — U2
- [ ] Fix email input type + add server validation — U3
- [ ] Fix Datenschutz page (references OpenStreetMap, should be Mapbox) — U4

**UX/Frontend (P1)**
- [ ] Fix footer hydration mismatch at year boundary — U5
- [ ] Add ARIA attributes to search bar dropdown — U6
- [ ] Add loading indicator to lead form hydration skeleton — U7
- [ ] Add focus trap + scroll lock to photo gallery fullscreen — U8
- [ ] Add empty state for zero-result searches — U9
- [ ] Add submit spinner to lead form — U10
- [ ] Add aria-hidden to decorative icons — U11

**DevOps (P0)**
- [ ] Add runtime env var validation — D1
- [ ] Create .env.example — D2
- [ ] Add error monitoring (Sentry) — D3

**DevOps (P1)**
- [ ] Set up CI/CD pipeline — D4
- [ ] Add health check endpoint — D5
- [ ] Add CORS policy on API routes — D6
- [ ] Fix placeholder Google Ads conversion code — D7

**SEO/Analytics (P0)**
- [ ] Add GA4/GTM to main site — A1
- [ ] Create default OG image + add to root metadata — A2

**SEO/Analytics (P1)**
- [ ] Add homepage page-level metadata — A3
- [ ] Add Organization schema to homepage — A4
- [ ] Add BreadcrumbList schema to listing/blog pages — A5
- [ ] Add /contact to sitemap — A6
- [ ] Add conversion tracking on main site lead form — A7
- [ ] Add proper OG tags to ueber-uns and fuer-anbieter — A8
- [ ] Block /api/ and /lp/ in robots.txt — A9
- [ ] Add h1 to search page — A10
- [ ] Add latin-ext font subset — A11

**CONCERNS.md — Known Bugs**
- [ ] Fix listings without coordinates not showing on map
- [ ] Fix hydration mismatch on rapid city page navigation
- [ ] Handle localStorage exceptions gracefully (private browsing)

**CONCERNS.md — Tech Debt**
- [ ] Consolidate duplicated lead API routes into shared service
- [ ] Fix fire-and-forget email blocking response path

**CONCERNS.md — Missing Features**
- [ ] Add duplicate lead detection before DB insert

**Quick P2 Wins**
- [ ] Remove X-Powered-By header — P2-19
- [ ] Escape JSON-LD </script> in listing data — P2-2
- [ ] Add dateModified to blog Article schema — P2-22
- [ ] Add canonical URLs to legal pages — P2-25

### Out of Scope

<!-- Explicit boundaries for this milestone. -->

- Cookie consent banner (TTDSG) — complex UX, legal review needed, defer to post-launch
- Lead follow-up reminders (cron job) — manual process sufficient at launch scale
- Lead analytics dashboard — data exists in Supabase, reporting can be ad-hoc
- Listing matching in thank-you emails — feature work, not launch readiness
- Mobile app — web-first
- LP subfolder changes — separate project with own git
- Test coverage — no new test suite in this milestone (fixes only)
- Contentful import script optimization — scripts/ not in launch path
- Real-time chat — not core to brokerage model
- OAuth login — no user accounts needed

## Context

- **Existing codebase**: ~30 source files in src/, fully functional but with security and performance gaps
- **Audit basis**: 5-domain expert audit (Security, Performance, UX, DevOps, SEO) produced 17 P0s, 32 P1s, 25 P2s
- **Codebase mapping**: 7 documents in .planning/codebase/ covering architecture, stack, conventions, concerns, integrations, structure, test gaps
- **German market**: All user-facing content in German, DSGVO compliance required
- **Deployment target**: Vercel (Next.js native)
- **Data source**: Static JSON files (listings.json, cities.json) imported from Contentful

## Constraints

- **Tech stack**: Next.js 16, React 19, Tailwind CSS 4, Supabase, Mapbox GL, Resend — no framework changes
- **Scope boundary**: src/ only — LP/ subfolder excluded (separate project)
- **No re-audit**: All analysis is complete in .planning/audit/ and .planning/codebase/
- **German language**: All user-facing strings remain in German
- **No user accounts**: Public site, no auth system needed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| All P0s + all P1s in scope | Quality bar for launch — P1s degrade user/developer experience | — Pending |
| Skip cookie consent banner | Legal review needed, complex UX — defer to dedicated effort | — Pending |
| Include duplicate lead detection | Prevents spam and wasted team effort on day 1 | — Pending |
| Quick P2 wins included (4 items) | <30min total, zero risk, measurable improvement | — Pending |
| Consolidate lead API routes | Both routes touched heavily — consolidation prevents regression | — Pending |

---
*Last updated: 2026-02-25 after initialization*
