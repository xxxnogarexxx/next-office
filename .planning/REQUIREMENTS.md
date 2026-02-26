# Requirements: next-office.io

**Defined:** 2026-02-26
**Core Value:** Lead capture must be secure, reliable, and observable — every submission persists and notifies the team.

## v1.1 Requirements

Requirements for Ad Tracking & Offline Conversion Pipeline milestone.

### Database & Schema

- [x] **DB-01**: Visitors table stores anonymous visitor data (visitor_id, click IDs, UTMs, IP hash, user agent, timestamps)
- [x] **DB-02**: Leads table extended with visitor_id FK, UTM columns, email_hash, consent fields, and conversion_status
- [x] **DB-03**: Conversions table stores business events with denormalized attribution data and idempotency key
- [x] **DB-04**: Conversion queue table tracks per-platform upload status with retry count, backoff timing, and dead letter state
- [x] **DB-05**: RLS policies deny anon access on all new tables (visitors, conversions, conversion_queue, tracking_events)

### Capture & Middleware

- [x] **CAP-01**: Middleware generates a visitor_id (UUID) in an HTTP-only cookie on first visit and preserves it on return visits
- [x] **CAP-02**: Middleware captures UTM parameters (source, medium, campaign, term, content) into HTTP-only cookies
- [x] **CAP-03**: Visit recording endpoint (`/api/track/visit`) creates or upserts visitor record in Supabase with all tracking data
- [ ] **CAP-04**: Lead form submission links visitor_id cookie to the lead record in Supabase
- [ ] **CAP-05**: Lead API stores UTM parameters from cookies alongside the lead in Supabase

### Enhanced Conversions

- [ ] **EC-01**: gtag config includes `allow_enhanced_conversions: true`
- [ ] **EC-02**: User email is set via `gtag('set', 'user_data', { email })` before the conversion event fires on form submission
- [ ] **EC-03**: SHA-256 hashed email (normalized, lowercased) stored in Supabase leads table at form submission
- [ ] **EC-04**: Transaction ID generated at form submission and shared between the online gtag event and the lead API submission for deduplication

### Offline Conversion Pipeline

- [ ] **OFL-01**: CRM webhook endpoint (`/api/webhooks/crm-conversion`) validates request authenticity and determines conversion type (qualified/closed) and value
- [ ] **OFL-02**: Webhook matches incoming deal to Supabase lead by email and retrieves stored gclid automatically
- [ ] **OFL-03**: Conversion record created with idempotency key (`{crm_deal_id}:{conversion_type}`) to prevent duplicate uploads
- [ ] **OFL-04**: Queue entry created for Google Ads platform when a conversion has attribution data (gclid or email_hash)
- [ ] **OFL-05**: Queue processor runs every 15 minutes via Supabase cron/Edge Function, picks up pending and retry-ready items
- [ ] **OFL-06**: Processor uploads conversions to Google Ads API via REST with OAuth2 token refresh
- [ ] **OFL-07**: Failed uploads retry with exponential backoff (15min → 1h → 4h → 16h → dead_letter after 5 attempts)
- [ ] **OFL-08**: Upload payload includes both gclid and hashed email as userIdentifiers for maximum match rate
- [ ] **OFL-09**: Upload includes consent signals (`ad_user_data: GRANTED`, `ad_personalization: GRANTED`) as required for EEA users

### Server-Side Event Proxy

- [ ] **SSP-01**: `/api/track/event` endpoint accepts event data from client (event name, params, user data)
- [ ] **SSP-02**: Endpoint forwards events to GA4 Measurement Protocol server-side
- [ ] **SSP-03**: Client fires events both via gtag (may be blocked by ad blockers) and via server proxy with shared event_id for deduplication

### Monitoring

- [ ] **MON-01**: Health check endpoint (`/api/health/tracking`) reports conversion pipeline status (pending, uploaded, failed, dead letter counts)
- [ ] **MON-02**: Supabase view or query available for gclid capture rate and upload success rate metrics

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Meta Ads

- **META-01**: FBCLID capture in middleware with _fbc/_fbp cookie generation
- **META-02**: Meta Pixel integration with PageView and Lead events
- **META-03**: Meta Conversions API (CAPI) server-side event forwarding
- **META-04**: Offline conversion upload to Meta via CAPI (action_source: system_generated)
- **META-05**: Dual-fire Pixel + CAPI with event_id deduplication

### Compliance

- **COMP-01**: Cookie consent banner (TDDDG/DSGVO compliant, German language)
- **COMP-02**: Google Consent Mode v2 integration (defaults denied, update on consent)
- **COMP-03**: Consent-gated tracking — no click ID capture before marketing consent
- **COMP-04**: Consent records table with audit trail

### Analytics

- **ANAL-01**: Conversion analytics dashboard for internal use
- **ANAL-02**: Automated alerting on pipeline failures (Slack webhook)
- **ANAL-03**: GCLID expiration warnings for leads approaching 90-day window

## Out of Scope

| Feature | Reason |
|---------|--------|
| Meta/Facebook ads integration | Google Ads is the only active ad channel |
| Cookie consent banner | Deferred — legal complexity, separate effort |
| Consent Mode v2 | Requires cookie consent banner first |
| Real-time conversion notifications | Queue-based (15 min) sufficient for B2B volume |
| Google Ads campaign management API | Only using offline conversion upload endpoint |
| n8n for conversion flow | Replaced by direct NetHunt → Next.js webhook |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DB-01 | Phase 7 | Complete |
| DB-02 | Phase 7 | Complete |
| DB-03 | Phase 7 | Complete |
| DB-04 | Phase 7 | Complete |
| DB-05 | Phase 7 | Complete |
| CAP-01 | Phase 8 | Complete |
| CAP-02 | Phase 8 | Complete |
| CAP-03 | Phase 8 | Complete |
| CAP-04 | Phase 8 | Pending |
| CAP-05 | Phase 8 | Pending |
| EC-01 | Phase 9 | Pending |
| EC-02 | Phase 9 | Pending |
| EC-03 | Phase 9 | Pending |
| EC-04 | Phase 9 | Pending |
| OFL-01 | Phase 10 | Pending |
| OFL-02 | Phase 10 | Pending |
| OFL-03 | Phase 10 | Pending |
| OFL-04 | Phase 10 | Pending |
| OFL-05 | Phase 10 | Pending |
| OFL-06 | Phase 10 | Pending |
| OFL-07 | Phase 10 | Pending |
| OFL-08 | Phase 10 | Pending |
| OFL-09 | Phase 10 | Pending |
| SSP-01 | Phase 11 | Pending |
| SSP-02 | Phase 11 | Pending |
| SSP-03 | Phase 11 | Pending |
| MON-01 | Phase 12 | Pending |
| MON-02 | Phase 12 | Pending |

**Coverage:**
- v1.1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-26*
*Last updated: 2026-02-26 — traceability complete after roadmap creation*
