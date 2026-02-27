# Roadmap: next-office.io

## Milestones

- ✅ **v1.0 Launch Readiness** — Phases 1-6 (shipped 2026-02-26)
- 🚧 **v1.1 Ad Tracking & Offline Conversion Pipeline** — Phases 7-12 (in progress)

## Phases

<details>
<summary>✅ v1.0 Launch Readiness (Phases 1-6) — SHIPPED 2026-02-26</summary>

- [x] Phase 1: Security Hardening (2/2 plans) — completed 2026-02-26
- [x] Phase 2: Infrastructure Foundations (4/4 plans) — completed 2026-02-26
- [x] Phase 3: Lead Pipeline Hardening (2/2 plans) — completed 2026-02-26
- [x] Phase 4: Performance Architecture (3/3 plans) — completed 2026-02-26
- [x] Phase 5: UX and Reliability (3/3 plans) — completed 2026-02-26
- [x] Phase 6: SEO and Analytics (3/3 plans) — completed 2026-02-26

Full archive: `milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v1.1 Ad Tracking & Offline Conversion Pipeline (In Progress)

**Milestone Goal:** Automate Google Ads offline conversion attribution, add Enhanced Conversions for cross-device resilience, capture UTM parameters, track anonymous visitors, and proxy events server-side for ad blocker resilience.

- [x] **Phase 7: Database Foundation** - Supabase schema for all tracking tables with RLS (completed 2026-02-26)
- [x] **Phase 8: Visitor & UTM Capture** - Middleware generates visitor_id, captures UTMs, links visitors to leads (completed 2026-02-26)
- [x] **Phase 9: Enhanced Conversions** - SHA-256 email hashing and gtag user_data for cross-device attribution (1/3 plans complete) (completed 2026-02-26)
- [x] **Phase 10: Offline Conversion Pipeline** - CRM webhook to Google Ads API upload with queue and retry (completed 2026-02-27)
- [ ] **Phase 11: Server-Side Event Proxy** - Retroactive verification of existing SSP implementation + documentation cleanup (gap closure)
- [x] **Phase 12: Monitoring & Observability** - Health endpoint and conversion metrics for pipeline visibility (completed 2026-02-27)
- [ ] **Phase 13: Main-Site Visitor Tracking** - Extend visit tracking to main-site pages so all leads carry visitor attribution (gap closure)

## Phase Details

### Phase 7: Database Foundation
**Goal**: All tracking tables exist in Supabase with correct schema, indexes, FK relationships, and RLS policies that block anonymous access
**Depends on**: Phase 6 (v1.0 complete)
**Requirements**: DB-01, DB-02, DB-03, DB-04, DB-05
**Success Criteria** (what must be TRUE):
  1. A visitors row can be inserted with visitor_id, click IDs, UTMs, IP hash, user agent, and timestamps without error
  2. A leads row can be linked to a visitor via FK, and contains UTM columns, email_hash, and conversion_status
  3. A conversions row can be created with idempotency key and denormalized attribution data
  4. A conversion_queue row tracks platform, retry count, backoff timing, and dead_letter state
  5. Anonymous (anon) Supabase client cannot read or write to visitors, conversions, conversion_queue, or tracking_events tables
**Plans**: 2 plans
Plans:
- [x] 07-01-PLAN.md -- New tables (visitors, conversions, conversion_queue, tracking_events) with indexes and RLS
- [x] 07-02-PLAN.md -- Extend leads table with visitor_id FK, UTMs, email_hash, consent, conversion_status

### Phase 8: Visitor & UTM Capture
**Goal**: Every site visitor receives a persistent visitor_id, UTM parameters are captured into cookies, visit data is recorded in Supabase, and lead submissions carry the visitor's attribution forward
**Depends on**: Phase 7
**Requirements**: CAP-01, CAP-02, CAP-03, CAP-04, CAP-05
**Success Criteria** (what must be TRUE):
  1. A first-time visitor receives an HTTP-only visitor_id cookie; a return visitor keeps the same cookie value across sessions
  2. Visiting with `?utm_source=google&utm_campaign=munich` sets HTTP-only UTM cookies visible in browser DevTools
  3. A Supabase visitors row is created or updated when `/api/track/visit` is called with all tracking fields populated
  4. Submitting the lead form creates a lead row in Supabase with the visitor_id FK pointing to the visitor record
  5. The lead row contains utm_source, utm_medium, utm_campaign, utm_term, and utm_content from the visitor's cookies
**Plans**: 3 plans
Plans:
- [ ] 08-01-PLAN.md -- Extend middleware: visitor_id UUID cookie (CAP-01) + UTM cookies (CAP-02)
- [ ] 08-02-PLAN.md -- Create /api/track/visit endpoint: upsert visitors row in Supabase (CAP-03)
- [ ] 08-03-PLAN.md -- Wire visitor_id FK + UTM columns into lead insertion pipeline (CAP-04, CAP-05)

### Phase 9: Enhanced Conversions
**Goal**: Lead form submissions pass hashed user email to Google Ads via gtag for cross-device and Safari-compatible conversion attribution
**Depends on**: Phase 7
**Requirements**: EC-01, EC-02, EC-03, EC-04
**Success Criteria** (what must be TRUE):
  1. Viewing page source or gtag network calls shows `allow_enhanced_conversions: true` in the gtag config call
  2. On form submission, a `gtag('set', 'user_data', { email })` call fires before the conversion event in the network log
  3. The Supabase leads row for a submitted form contains a SHA-256 hashed email value (hex string, lowercased)
  4. The gtag conversion event and the lead API submission carry the same transaction_id value, visible in network requests
**Plans**: 3 plans
Plans:
- [x] 09-01-PLAN.md -- Enhanced Conversions gtag config + server-side SHA-256 email hashing (EC-01, EC-03)
- [ ] 09-02-PLAN.md -- Server-side transaction_id: migration, validation, supabase wiring (EC-04)
- [ ] 09-03-PLAN.md -- Client-side user_data email + shared transaction_id for both forms + danke page (EC-02, EC-04)

### Phase 10: Offline Conversion Pipeline
**Goal**: When NetHunt CRM marks a deal as qualified or closed, the conversion is automatically matched to a Supabase lead, queued, and uploaded to Google Ads API with retry logic — no manual steps
**Depends on**: Phase 8, Phase 9
**Requirements**: OFL-01, OFL-02, OFL-03, OFL-04, OFL-05, OFL-06, OFL-07, OFL-08, OFL-09
**Success Criteria** (what must be TRUE):
  1. A POST to `/api/webhooks/crm-conversion` with a valid signature is accepted; an invalid signature returns 401
  2. A webhook payload with a known email results in a conversions row linked to the matching lead with its stored gclid
  3. Two webhook calls with the same `{crm_deal_id}:{conversion_type}` key produce only one conversions row and one queue entry
  4. The conversion_queue shows a new Google Ads entry within seconds of a valid webhook; the Supabase cron function runs every 15 minutes and picks up pending items
  5. A successfully uploaded conversion shows status `uploaded` in the queue; a failed upload shows incremented retry count and next_retry_at timestamp
  6. After 5 failed attempts a queue entry transitions to `dead_letter` state and stops retrying
**Plans**: 3 plans
Plans:
- [ ] 10-01-PLAN.md -- CRM webhook endpoint: signature validation, lead matching by email, idempotent conversion creation, queue entry (OFL-01, OFL-02, OFL-03, OFL-04)
- [ ] 10-02-PLAN.md -- Google Ads API upload module: OAuth2 token management, conversion payload with gclid + email userIdentifiers and consent signals (OFL-06, OFL-08, OFL-09)
- [ ] 10-03-PLAN.md -- Queue processor Edge Function: Supabase cron, batch processing, exponential backoff retry, dead letter transition (OFL-05, OFL-07)

### Phase 11: Server-Side Event Proxy (Retroactive Verification)
**Goal**: Formally verify the SSP implementation that was built during Phases 8-10, update REQUIREMENTS.md, and clean up documentation gaps across the milestone
**Depends on**: Phase 8, Phase 9, Phase 10
**Requirements**: SSP-01, SSP-02, SSP-03
**Gap Closure**: Closes SSP-01/02/03 (implemented-but-unverified) + tech debt (SUMMARY frontmatter gaps, documentation errors)
**Success Criteria** (what must be TRUE):
  1. SSP-01/02/03 are formally verified with evidence pointing to existing code artifacts
  2. REQUIREMENTS.md checkboxes for SSP-01/02/03 are checked
  3. SUMMARY frontmatter gaps in 09-01, 09-02, 10-01 are fixed
  4. Documentation errors in 12-02-SUMMARY.md are corrected
**Plans**: 2 plans
Plans:
- [x] 11-01-PLAN.md -- Retroactive SSP verification: verify /api/track/event, ga4-mp.ts, dual-fire implementation (SSP-01, SSP-02, SSP-03)
- [ ] 11-02-PLAN.md -- Documentation cleanup: fix SUMMARY frontmatter in 09-01, 09-02, 10-01; fix 12-02-SUMMARY.md attribution error

### Phase 13: Main-Site Visitor Tracking
**Goal**: Main-site visitors (not just LP visitors) trigger `/api/track/visit` so all leads carry visitor_id FK and gclid attribution
**Depends on**: Phase 8
**Requirements**: CAP-03 (extended), CAP-04 (extended)
**Gap Closure**: Closes CAP-03/04 partial gap, main-site integration gap, and main-site visitor journey flow gap from v1.1 audit
**Success Criteria** (what must be TRUE):
  1. A main-site page load fires `POST /api/track/visit` and creates a visitors row in Supabase
  2. A lead submitted via the main-site form (`/api/leads`) has a non-null `visitor_id` FK pointing to the visitors row
  3. The CRM webhook's `matchLeadByEmail()` JOIN retrieves gclid for main-site leads (when visitor had gclid)
**Plans**: 2 plans
Plans:
- [ ] 13-01-PLAN.md -- Add visit tracking to main-site: create tracking provider or extend existing TrackingProvider to fire /api/track/visit on mount (CAP-03, CAP-04)
- [ ] 13-02-PLAN.md -- Remove dead code: delete or document google-ads.ts uploadConversion() (tech debt cleanup)

### Phase 12: Monitoring & Observability
**Goal**: The health of the offline conversion pipeline is visible at a glance via a health endpoint and queryable conversion metrics in Supabase
**Depends on**: Phase 10
**Requirements**: MON-01, MON-02
**Success Criteria** (what must be TRUE):
  1. GET `/api/health/tracking` returns a JSON response with counts for pending, uploaded, failed, and dead_letter queue items
  2. A Supabase query or view returns gclid capture rate (leads with gclid / total leads) and upload success rate (uploaded / total queued) without requiring manual SQL joins
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Security Hardening | v1.0 | 2/2 | Complete | 2026-02-26 |
| 2. Infrastructure Foundations | v1.0 | 4/4 | Complete | 2026-02-26 |
| 3. Lead Pipeline Hardening | v1.0 | 2/2 | Complete | 2026-02-26 |
| 4. Performance Architecture | v1.0 | 3/3 | Complete | 2026-02-26 |
| 5. UX and Reliability | v1.0 | 3/3 | Complete | 2026-02-26 |
| 6. SEO and Analytics | v1.0 | 3/3 | Complete | 2026-02-26 |
| 7. Database Foundation | v1.1 | 2/2 | Complete | 2026-02-26 |
| 8. Visitor & UTM Capture | v1.1 | 3/3 | Complete | 2026-02-26 |
| 9. Enhanced Conversions | 2/3 | Complete    | 2026-02-26 | - |
| 10. Offline Conversion Pipeline | 3/3 | Complete    | 2026-02-27 | - |
| 11. Server-Side Event Proxy | 1/2 | In Progress|  | - |
| 12. Monitoring & Observability | v1.1 | 2/2 | Complete | 2026-02-27 |
| 13. Main-Site Visitor Tracking | v1.1 | 0/2 | Gap closure | - |
