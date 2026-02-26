# next-office.io

## What This Is

B2B coworking brokerage platform for the German market. Connects businesses looking for office space with coworking providers. Users browse listings by city, view details on a map, and submit lead forms. Brokers receive notifications and follow up. The platform is launch-ready — secured, performant, accessible, observable, and SEO-optimized after a comprehensive 6-phase hardening milestone.

## Core Value

Lead capture must be secure, reliable, and observable. Every form submission must persist to Supabase, notify the team, and never be lost silently. If everything else breaks, leads still flow.

## Requirements

### Validated

- ✓ Listing discovery flow (homepage → city → listing detail) — existing
- ✓ Lead capture form with multi-variant rendering (sidebar, inline, contact, dialog) — existing
- ✓ Supabase lead persistence + Resend email notification — existing
- ✓ Mapbox GL map integration with transit overlays — existing
- ✓ Google Ads attribution tracking (middleware cookies + client context) — existing
- ✓ Landing page route group with separate layout and conversion tracking — existing
- ✓ Blog with markdown content and frontmatter — existing
- ✓ City-based search with listing grid + map view — existing
- ✓ Photo gallery with fullscreen view — existing
- ✓ Overpass proxy parameterized with query-type whitelist — v1.0
- ✓ Lat/lng validation, XSS-safe transit popups, HTML-escaped emails — v1.0
- ✓ Per-IP rate limiting on lead endpoints — v1.0
- ✓ Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy) — v1.0
- ✓ CSRF protection on all lead form endpoints — v1.0
- ✓ RFC email validation, cookie validation, input size limits — v1.0
- ✓ Scoped Supabase access (anon key + RLS, no service role) — v1.0
- ✓ 45% smaller client payload via listings-card.json split — v1.0
- ✓ Server components + static generation on city/listing pages — v1.0
- ✓ Lazy-loaded Mapbox GL and carousel photos — v1.0
- ✓ Transit API hardened (timeout, retry/backoff, Cache-Control) — v1.0
- ✓ Branded 404/error pages, city slug 404 routing — v1.0
- ✓ ARIA accessibility (search listbox, photo gallery focus trap, aria-hidden icons) — v1.0
- ✓ Lead form polish (email type, submit spinner, hydration skeleton) — v1.0
- ✓ Env validation, .env.example, health check endpoint — v1.0
- ✓ Sentry error monitoring wired (client + server + edge, source maps) — v1.0
- ✓ CI/CD pipeline (lint + build on push) — v1.0
- ✓ CORS policy, X-Powered-By removal — v1.0
- ✓ GA4 tracking + conversion events on lead form — v1.0
- ✓ Organization + BreadcrumbList structured data — v1.0
- ✓ OG tags, robots.txt, sitemap, canonical URLs — v1.0
- ✓ Duplicate lead detection (phone + city, 24h window) — v1.0
- ✓ Non-blocking email delivery — v1.0
- ✓ Consolidated lead service (single source of truth) — v1.0

### Active

(None — define next milestone requirements with `/gsd:new-milestone`)

### Out of Scope

- Cookie consent banner (TTDSG) — legal review needed, defer to dedicated effort
- Lead follow-up reminders (cron job) — manual process sufficient at current scale
- Lead analytics dashboard — Supabase data available for ad-hoc reporting
- Listing matching in thank-you emails — feature work, not launch readiness
- Mobile app — web-first platform
- LP subfolder changes — separate project with own git
- Test coverage — no greenfield test suite in v1.0
- Real-time chat — not core to brokerage model
- OAuth / user accounts — public site, no auth needed
- Database migration away from JSON — sufficient at current scale

## Context

- **v1.0 shipped**: 2026-02-26 — 6 phases, 17 plans, 213 files modified
- **Codebase**: 13,700 LOC TypeScript across ~50 source files in src/
- **Tech stack**: Next.js 16, React 19, Tailwind CSS 4, Supabase, Mapbox GL, Resend, Sentry, GA4
- **Deployment**: Vercel (Next.js native)
- **Data source**: Static JSON files (listings.json, listings-card.json, cities.json) from Contentful
- **German market**: All user-facing content in German, DSGVO compliance ongoing
- **Post-launch config tasks**: Sentry credentials (5 env vars), Mapbox token URL restriction

## Constraints

- **Tech stack**: Next.js 16, React 19, Tailwind CSS 4, Supabase, Mapbox GL, Resend — no framework changes
- **German language**: All user-facing strings in German
- **No user accounts**: Public site, no auth system needed
- **LP excluded**: LP/ subfolder is a separate project

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| All P0s + all P1s in scope | Quality bar for launch — P1s degrade UX/DX | ✓ Good — 58/60 shipped |
| Skip cookie consent banner | Legal review needed, complex UX | ✓ Good — unblocked launch |
| Include duplicate lead detection | Prevents spam and wasted team effort | ✓ Good — 24h phone+city dedup |
| Quick P2 wins included (4 items) | <30min total, zero risk, measurable improvement | ✓ Good — all shipped |
| Consolidate lead API routes | Both routes touched heavily — prevents regression | ✓ Good — 5-file leads/ module |
| Scoped Supabase (anon key + RLS) | Principle of least privilege for lead inserts | ✓ Good — service role eliminated |
| CSRF via HMAC-SHA256 double-submit | No new env var needed (derived from service role key) | ✓ Good |
| CSP with unsafe-inline/unsafe-eval | Required by Next.js hydration and dev hot reload | ⚠️ Revisit — nonce-based CSP post-launch |
| SEC-12 deferred to post-launch | Dashboard config, not code — user decision | — Pending |
| DEV-03 credentials deferred | Code wired, needs Sentry project setup | — Pending |

---
*Last updated: 2026-02-26 after v1.0 milestone*
