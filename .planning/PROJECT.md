# next-office.io

## What This Is

B2B coworking brokerage platform for the German market. Connects businesses looking for office space with coworking providers. Users browse listings by city, view details on a map, and submit lead forms. Brokers receive notifications and follow up. The platform is launch-ready and now has automated Google Ads conversion attribution — from anonymous visitor tracking through Enhanced Conversions to offline conversion uploads via CRM webhook.

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
- ✓ Visitor tracking tables with RLS (visitors, conversions, conversion_queue, tracking_events) — v1.1
- ✓ Leads extended with visitor_id FK, UTMs, email_hash, consent, conversion_status — v1.1
- ✓ Persistent visitor_id + UTM cookies via middleware (first-touch attribution) — v1.1
- ✓ Visit recording endpoint with visitor upsert on every page load — v1.1
- ✓ Lead form links visitor_id FK + UTM cookies to lead record — v1.1
- ✓ Enhanced Conversions: SHA-256 email hashing + gtag user_data for cross-device attribution — v1.1
- ✓ Shared transaction_id between client gtag and server API for dedup — v1.1
- ✓ CRM webhook → lead matching → idempotent conversion creation → queue entry — v1.1
- ✓ Google Ads API offline conversion upload via Supabase Edge Function — v1.1
- ✓ Exponential backoff retry (15min → 1h → 4h → 16h → dead letter) — v1.1
- ✓ Server-side event proxy (/api/track/event → GA4 Measurement Protocol) — v1.1
- ✓ Dual-fire gtag + server proxy with shared event_id for dedup — v1.1
- ✓ Health endpoint for conversion pipeline status — v1.1
- ✓ SQL view for gclid capture rate and upload success metrics — v1.1

### Active

(None — next milestone not yet defined. Run `/gsd:new-milestone` to start.)

### Out of Scope

- Cookie consent banner (TTDSG) — legal review needed, defer to dedicated effort
- Meta/Facebook ads integration — Google Ads is the only active ad channel
- Consent Mode v2 — requires cookie consent banner first
- Real-time conversion notifications — queue-based (15 min) sufficient for B2B volume
- Lead analytics dashboard — Supabase data available for ad-hoc reporting
- Listing matching in thank-you emails — feature work, not launch readiness
- Mobile app — web-first platform
- Test coverage — no greenfield test suite in v1.0/v1.1
- Real-time chat — not core to brokerage model
- OAuth / user accounts — public site, no auth needed
- Database migration away from JSON — sufficient at current scale

## Context

- **v1.0 shipped**: 2026-02-26 — 6 phases, 17 plans, 213 files modified (security, performance, UX, infra, SEO hardening)
- **v1.1 shipped**: 2026-02-27 — 7 phases, 17 plans, 211 files modified (ad tracking, offline conversions, visitor attribution)
- **Codebase**: ~14,800 LOC TypeScript across ~50 source files in src/
- **Tech stack**: Next.js 16, React 19, Tailwind CSS 4, Supabase, Mapbox GL, Resend, Sentry, GA4
- **Deployment**: Vercel (Next.js native)
- **Data source**: Static JSON files (listings.json, listings-card.json, cities.json) from Contentful
- **German market**: All user-facing content in German, DSGVO compliance ongoing
- **Conversion pipeline**: CRM webhook (NetHunt) → lead matching → idempotent conversion → Google Ads API upload via Supabase Edge Function (every 15 min)
- **Google Ads API**: Developer token approved; Customer ID: 215-246-8876; Manager: 670-646-4060
- **Tracking**: Middleware captures gclid/gbraid/wbraid + visitor_id + 5 UTM params → HTTP-only cookies; Enhanced Conversions (email hash + user_data); server-side GA4 proxy for ad blocker resilience
- **Post-v1.1 ops tasks**: 8 GOOGLE_ADS_* env vars, pg_cron registration, supabase db push for migrations, placeholder conversion ID replacement, Sentry credentials, Mapbox token restriction

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
| Direct CRM webhook (cut n8n) | Simpler pipeline, one less moving part, NetHunt supports webhooks natively | ✓ Good — fewer dependencies |
| Queue + cron over immediate upload | Retry logic, resilience when Google API is down | ✓ Good — exponential backoff with dead letter |
| Skip Meta CAPI for v1.1 | Google Ads only active channel, reduce scope | ✓ Good — focused delivery |
| Skip cookie consent for v1.1 | Defer legal complexity, tracking works but not fully GDPR-complete | ⚠️ Revisit — needed for compliance |
| Google Ads REST API v18 over npm client library | Native fetch sufficient for single-conversion uploads | ✓ Good — no new deps |
| First-touch UTM attribution model | Existing UTM cookies not overwritten on subsequent visits | ✓ Good — canonical attribution |
| Denormalized attribution in conversions | Avoid JOINs in async queue processing | ✓ Good — queue processor stays simple |
| Text CHECK constraints over Postgres enums | Simpler ALTER TABLE for future expansion | ✓ Good — easy to extend |

---
*Last updated: 2026-02-27 after v1.1 milestone*
