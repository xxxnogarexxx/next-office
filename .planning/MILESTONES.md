# Milestones

## v1.0 Launch Readiness (Shipped: 2026-02-26)

**Phases completed:** 6 phases, 17 plans
**Timeline:** 16 days (2026-02-10 → 2026-02-26)
**Files modified:** 213 | **LOC:** 13,700 TypeScript

**Key accomplishments:**
1. Closed critical attack surface — parameterized Overpass proxy, XSS-safe transit popups, HTML-escaped email templates, per-IP rate limiting
2. Infrastructure foundations — env validation, Sentry monitoring, CI/CD pipeline, security headers, health endpoint
3. Hardened lead pipeline — CSRF protection, RFC email validation, scoped Supabase (RLS), dedup detection, non-blocking email
4. Performance architecture — 45% smaller client payload, server components, static generation, lazy-loaded Mapbox + carousel
5. UX and reliability — branded 404/error pages, city slug validation, ARIA accessibility, focus traps, loading states
6. SEO and analytics — GA4 tracking, Organization + BreadcrumbList schema, OG tags, robots.txt, sitemap, font fixes

### Known Gaps
- **SEC-12**: Mapbox access token not yet URL-restricted in dashboard (code complete, external config task)
- **DEV-03**: Sentry DSN and auth token not yet configured (code fully wired, needs Sentry project setup + 5 env vars)

---


## v1.1 Ad Tracking & Offline Conversion Pipeline (Shipped: 2026-02-27)

**Phases completed:** 7 phases (7-13), 17 plans
**Timeline:** ~13 hours (2026-02-26 → 2026-02-27)
**Files modified:** 211 | **LOC:** 14,834 TypeScript

**Key accomplishments:**
1. Database foundation — 4 new tables (visitors, conversions, conversion_queue, tracking_events) with RLS deny-all + leads extended with visitor FK, UTMs, email_hash, consent, conversion_status
2. Visitor & UTM capture — Persistent visitor_id + 5 UTM cookies via middleware, first-touch attribution model, visit upsert to Supabase on every page load
3. Enhanced Conversions — SHA-256 email hashing + gtag user_data for cross-device attribution, shared transaction_id between client and server for dedup
4. Offline conversion pipeline — CRM webhook → lead matching → idempotent conversion → Google Ads API upload via Supabase Edge Function with exponential backoff retry
5. Server-side event proxy — /api/track/event → GA4 Measurement Protocol for ad blocker resilience, dual-fire with shared event_id dedup
6. Monitoring & observability — Health endpoint for pipeline status, SQL view for gclid capture rate and upload success metrics

### Known Gaps
- **Main-site SSP dedup**: Event name mismatch (generate_lead vs lp_form_submit) prevents GA4 dedup for main-site form (LP form correct)
- **pg_cron manual**: Queue processor cron schedule requires manual SQL post-deploy
- **Placeholder conversion ID**: AW-XXXXXXXXXX in LP form — needs real Google Ads Conversion ID/Label
- **8 GOOGLE_ADS_* env vars**: Not yet configured for production
- **Migration 007**: conversion_metrics view requires `supabase db push`

---

