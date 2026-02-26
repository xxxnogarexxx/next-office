# Ad Tracking & Offline Conversion Architecture

**Domain:** next-office.io — B2B coworking brokerage
**Researched:** 2026-02-25
**Stack:** Next.js 16, React 19, Supabase, Vercel

---

## 1. System Overview

### What Already Exists

- **Middleware** (`src/middleware.ts`): Captures `gclid`, `gbraid`, `wbraid` into HTTP-only cookies with 90-day expiry and `_no_` prefix. Stores landing page + referrer.
- **TrackingProvider** (`src/components/tracking-provider.tsx`): In-memory React context reading click IDs from URL params.
- **LPTrackingProvider** (`src/components/lp/tracking/lp-tracking-provider.tsx`): Extended LP provider with UTM params and sessionStorage persistence.
- **Lead API routes** (`/api/leads` + `/api/lp-leads`): Read cookies as fallback. Store gclid/gbraid/wbraid in `leads` table.
- **ConversionTracker** (`danke/conversion-tracker.tsx`): Client-side gtag conversion on thank-you page.
- **n8n workflow**: NetHunt CRM stage change → Google Sheets → Google Ads auto-import.
- **Google Ads API design doc** (`docs/google-ads-api-design-document.md`): Developer token application drafted.

### What Needs Building

1. FBCLID/Meta tracking capture (not yet in middleware)
2. Visitor table for anonymous pre-lead tracking
3. Conversion queue with retry/status tracking (replace Google Sheets)
4. Direct Google Ads API integration
5. Meta Conversions API integration
6. Server-side event proxy for ad blocker resilience
7. Consent tracking for GDPR
8. Monitoring and health checks

### Architecture Diagram

```
+-------------------------------------------------------------------+
|                         USER BROWSER                               |
|  Google/Meta Ad Click → next-office.io/?gclid=xxx&fbclid=yyy     |
+----------|--------------------------------------------------------+
           |
           v
+-------------------------------------------------------------------+
|                    VERCEL EDGE (Middleware)                        |
|  1. Extract gclid, gbraid, wbraid, fbclid from URL               |
|  2. Generate visitor_id (UUID), _fbc, _fbp                       |
|  3. Set first-party HTTP-only cookies (90 days)                   |
+----------|--------------------------------------------------------+
           |
           v
+-------------------------------------------------------------------+
|                    NEXT.JS API ROUTES                              |
|  POST /api/track/visit    → Record visitor in Supabase           |
|  POST /api/leads          → Create lead, link to visitor         |
|  POST /api/track/event    → Server-side event proxy              |
|  POST /api/webhooks/crm   → Create conversion + enqueue         |
|  GET  /api/health/tracking → Pipeline health check               |
+----------|--------------------------------------------------------+
           |
           v
+-------------------------------------------------------------------+
|                       SUPABASE (Frankfurt)                        |
|  Tables: visitors, leads, conversions, conversion_queue,          |
|          tracking_events, consent_records                         |
|  Edge Functions: process-conversion-queue                         |
|  Cron: every 15 min → process queue                              |
|        daily 3 AM → cleanup stale visitors                       |
+----------|--------------------------------------------------------+
           |
           v
+-------------------------------------------------------------------+
|                 EXTERNAL APIs                                      |
|  Google Ads API (v22): uploadClickConversions + EC4L              |
|  Meta CAPI (v22.0): events endpoint, action_source=system_gen    |
+-------------------------------------------------------------------+
```

---

## 2. Click ID Capture Architecture

### 2.1 Enhanced Middleware Design

| Decision | Choice | Rationale |
|---|---|---|
| Cookie type | HTTP-only, server-set | Survives Safari ITP (7+ days vs 24h JS cookies). Safari 26 Edge intercept before URL stripping. |
| Cookie prefix | `_no_` | First-party, not in ad-blocker filter lists |
| Cookie expiry | 90 days | Matches Google Ads max click-to-conversion window |
| Visitor ID | UUID v4 in cookie | Links anonymous browsing to eventual lead |
| _fbc generation | Server-side from FBCLID | Meta requires format: `fb.1.{timestamp_ms}.{fbclid}` |
| _fbp generation | Server-side fallback | Pixel gets blocked — server ensures Meta has browser ID |

### 2.2 Complete Cookie Inventory

| Cookie | Value | HttpOnly | MaxAge | Purpose |
|---|---|---|---|---|
| `_no_vid` | UUID v4 | Yes | 90d | Anonymous visitor ID |
| `_no_gclid` | Google Click ID | Yes | 90d | Google Ads attribution |
| `_no_gbraid` | Google App Click | Yes | 90d | iOS app attribution |
| `_no_wbraid` | Google Web Click | Yes | 90d | iOS web attribution |
| `_no_fbclid` | Raw FBCLID | Yes | 90d | Meta attribution (raw) |
| `_no_fbc` | `fb.1.{ts}.{fbclid}` | Yes | 90d | Meta _fbc parameter |
| `_no_fbp` | `fb.1.{ts}.{random}` | Yes | 90d | Meta browser ID |
| `_no_utm_*` | UTM values | Yes | 90d | Campaign parameters |
| `_no_lp` | Landing URL | Yes | 90d | First touch URL |
| `_no_ref` | Referrer URL | Yes | 90d | Traffic source |

### 2.3 Returning Visitor Handling

- First visit: Generate new visitor_id, set all tracking cookies, create visitor record
- Return visit: Read existing visitor_id (don't overwrite). If new click IDs present (re-clicked ad), overwrite click IDs. Upsert visitor record.
- Session merge: visitor_id is the anchor. Most recent click IDs used for attribution.

---

## 3. Supabase Schema Design

### 3.1 New Tables

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Anonymous visitor tracking from ad clicks
CREATE TABLE visitors (
  id              UUID PRIMARY KEY,  -- From middleware _no_vid cookie
  gclid           TEXT,
  gbraid          TEXT,
  wbraid          TEXT,
  fbclid          TEXT,
  fbc             TEXT,       -- fb.1.{ts}.{fbclid}
  fbp             TEXT,       -- fb.1.{ts}.{random}
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_term        TEXT,
  utm_content     TEXT,
  landing_page    TEXT,
  referrer        TEXT,
  user_agent      TEXT,
  ip_hash         TEXT,       -- SHA-256 hashed IP
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visit_count     INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_visitors_gclid ON visitors (gclid) WHERE gclid IS NOT NULL;
CREATE INDEX idx_visitors_fbclid ON visitors (fbclid) WHERE fbclid IS NOT NULL;
```

### 3.2 Leads Table Extensions

```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS visitor_id UUID REFERENCES visitors(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fbclid TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fbc TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fbp TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ip_hash TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_ad_user_data BOOLEAN;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_ad_personalization BOOLEAN;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversion_status TEXT DEFAULT 'new'
  CHECK (conversion_status IN ('new','qualified','converted','lost','uploaded'));

CREATE INDEX IF NOT EXISTS idx_leads_visitor_id ON leads (visitor_id) WHERE visitor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_conversion_status ON leads (conversion_status);
```

### 3.3 Conversions + Queue

```sql
-- Conversion records (business events)
CREATE TABLE conversions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id           UUID REFERENCES leads(id),
  conversion_type   TEXT NOT NULL CHECK (conversion_type IN ('qualified_lead', 'closed_deal')),
  conversion_value  DECIMAL(12,2),
  currency_code     TEXT NOT NULL DEFAULT 'EUR',
  -- Denormalized attribution for upload speed
  gclid             TEXT,
  gbraid            TEXT,
  wbraid            TEXT,
  fbc               TEXT,
  fbp               TEXT,
  email_hash        TEXT,
  phone_hash        TEXT,
  crm_deal_id       TEXT,
  conversion_time   TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  idempotency_key   TEXT UNIQUE NOT NULL  -- "{crm_deal_id}:{conversion_type}"
);

-- Upload queue: each conversion → 2 entries (Google + Meta)
CREATE TABLE conversion_queue (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversion_id     UUID NOT NULL REFERENCES conversions(id),
  platform          TEXT NOT NULL CHECK (platform IN ('google_ads', 'meta')),
  status            TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','uploaded','confirmed','failed','dead_letter')),
  attempt_count     INTEGER NOT NULL DEFAULT 0,
  max_attempts      INTEGER NOT NULL DEFAULT 5,
  next_retry_at     TIMESTAMPTZ,
  last_error        TEXT,
  last_error_code   TEXT,
  platform_response JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at      TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  idempotency_key   TEXT UNIQUE NOT NULL  -- "{conversion_id}:{platform}"
);

CREATE INDEX idx_queue_pending ON conversion_queue (status) WHERE status IN ('pending', 'failed');
CREATE INDEX idx_queue_retry ON conversion_queue (next_retry_at) WHERE status = 'failed';
```

### 3.4 Audit & Consent Tables

```sql
-- Tracking events audit log (append-only)
CREATE TABLE tracking_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type      TEXT NOT NULL,
  visitor_id      UUID,
  lead_id         UUID,
  conversion_id   UUID,
  queue_id        UUID,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GDPR consent audit trail
CREATE TABLE consent_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id      UUID REFERENCES visitors(id),
  lead_id         UUID REFERENCES leads(id),
  consent_type    TEXT NOT NULL CHECK (consent_type IN (
    'ad_user_data', 'ad_personalization', 'analytics', 'marketing'
  )),
  granted         BOOLEAN NOT NULL,
  ip_hash         TEXT,
  user_agent      TEXT,
  consent_source  TEXT,  -- 'cookie_banner', 'form_checkbox'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.5 Row Level Security

```sql
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- Deny anon access (all access via service_role key)
CREATE POLICY "deny_anon" ON visitors FOR ALL USING (false);
CREATE POLICY "deny_anon" ON conversions FOR ALL USING (false);
CREATE POLICY "deny_anon" ON conversion_queue FOR ALL USING (false);
CREATE POLICY "deny_anon" ON tracking_events FOR ALL USING (false);
CREATE POLICY "deny_anon" ON consent_records FOR ALL USING (false);
```

### 3.6 Entity Relationships

```
visitors 1──< leads 1──< conversions 1──< conversion_queue
    │                                         (google_ads)
    │                                         (meta)
    └──< consent_records
```

**Why denormalize attribution into `conversions`?** Upload happens async, days later. Single table read for the Edge Function — no joins, no stale data risk.

**Why separate `conversion_queue`?** One conversion → two queue entries (Google + Meta). Independent status/retry per platform.

---

## 4. Offline Conversion Pipeline

### 4.1 Queue State Machine

```
pending → processing → uploaded → confirmed
              |
              +→ failed → (backoff) → processing (retry)
                   |
                   +→ dead_letter (after 5 attempts)

Backoff: 15min → 1h → 4h → 16h → dead_letter
```

### 4.2 CRM Webhook Handler

```typescript
// POST /api/webhooks/crm-conversion
// Triggered by n8n when deal stage changes in NetHunt CRM

// 1. Validate webhook secret
// 2. Determine conversion_type + value from deal stage
// 3. Hash email (SHA-256, normalized) + phone (E.164)
// 4. Find matching lead by email or gclid
// 5. Upsert conversion (idempotency_key prevents duplicates)
// 6. Enqueue for Google Ads (if gclid/gbraid/wbraid/email_hash exists)
// 7. Enqueue for Meta (if fbc/fbp/email_hash exists)
// 8. Update lead status
```

### 4.3 Queue Processor (Edge Function, every 15 min)

```typescript
// 1. Select pending + failed-but-ready-to-retry items
// 2. Mark as 'processing'
// 3. For google_ads: POST to uploadClickConversions (REST API)
// 4. For meta: POST to graph.facebook.com/{pixel_id}/events
// 5. On success: mark 'uploaded'
// 6. On failure: increment attempt, calculate backoff, mark 'failed'
// 7. On max attempts: mark 'dead_letter'
```

### 4.4 Google Ads Upload

```typescript
// REST endpoint (no npm package needed — avoids gRPC issues on serverless)
POST https://googleads.googleapis.com/v22/customers/{id}:uploadClickConversions

// Key fields:
{
  conversions: [{
    gclid: "...",
    conversionAction: "customers/{id}/conversionActions/{id}",
    conversionDateTime: "2026-02-25 10:00:00+01:00",
    conversionValue: 6000,
    currencyCode: "EUR",
    userIdentifiers: [{ hashedEmail: "sha256..." }],
    consent: { adUserData: "GRANTED", adPersonalization: "GRANTED" }
  }],
  partialFailure: true
}
```

### 4.5 Meta CAPI Upload

```typescript
POST https://graph.facebook.com/v22.0/{pixel_id}/events

{
  data: [{
    event_name: "Purchase",
    event_time: 1708876800,
    event_id: "contract_{lead_id}",
    action_source: "system_generated",  // offline
    user_data: { fbc: "...", fbp: "...", em: "sha256...", ph: "sha256..." },
    custom_data: { currency: "EUR", value: 6000 }
  }],
  access_token: "..."
}
```

---

## 5. Ad Blocker Resilience

### 5.1 What Gets Blocked vs Survives

| Method | Ad Blockers | Safari ITP | Our Mitigation |
|---|---|---|---|
| Client gtag.js | BLOCKED | Partially | Server proxy |
| Client Meta Pixel | BLOCKED | Partially | Server proxy + server _fbp |
| JS-set cookies | Not directly | 24h cap | Server-set HTTP cookies |
| Server HTTP-only cookies | NO | 7+ days | Already in middleware |
| `/api/track/event` calls | NO (same-origin) | NO | This IS the mitigation |
| Server conversion upload | NO | NO | Queue processor |

### 5.2 Server-Side Event Proxy

```typescript
// POST /api/track/event
// Client calls this same-origin route (invisible to ad blockers)
// Server forwards to GA4 Measurement Protocol + Meta CAPI

// GA4: fire and forget
fetch(`https://www.google-analytics.com/mp/collect?...`, { method: "POST", body: ga4Payload });

// Meta CAPI: fire and forget
fetch(`https://graph.facebook.com/v22.0/${PIXEL_ID}/events`, { method: "POST", body: metaPayload });
```

### 5.3 Dual-Fire Pattern

Every lead event fires **both** client-side (gtag/Pixel, may be blocked) and server-side (proxy, always works) with shared `event_id` for deduplication.

---

## 6. Server-Side GTM vs Direct API

### Recommendation: Direct API

| Factor | Server-Side GTM | Direct API |
|---|---|---|
| Monthly cost | $120-150 (Cloud Run) | $0 |
| Annual cost | $1,440-1,800 | $0 |
| Platforms | 2 | 2 |
| Volume | 20-50 conv/month | 20-50 conv/month |
| Debugging | 2 systems | 1 codebase |
| Control | Limited by tag templates | Full control |

Direct API is the right choice for: exactly 2 platforms, low volume, everything in one codebase, developer resources available, cost matters.

---

## 7. Testing & Validation

### 7.1 End-to-End Test Flow

1. **Click capture**: Visit `/?gclid=TEST&fbclid=FBTEST`, verify 14 cookies in DevTools
2. **Visitor record**: Check Supabase `visitors` table
3. **Lead attribution**: Submit form, verify leads row has all tracking fields
4. **Server proxy**: Check Network tab for `/api/track/event` POST (200)
5. **Conversion creation**: POST to webhook, verify conversions + queue rows
6. **Google upload**: Run processor with `validateOnly: true`
7. **Meta upload**: Include `test_event_code` from Events Manager

### 7.2 Health Check

```sql
CREATE OR REPLACE VIEW conversion_pipeline_health AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'uploaded') AS uploaded_count,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
  COUNT(*) FILTER (WHERE status = 'dead_letter') AS dead_letter_count,
  EXTRACT(EPOCH FROM NOW() -
    MIN(created_at) FILTER (WHERE status = 'pending')
  ) / 60 AS oldest_pending_minutes,
  COUNT(*) FILTER (
    WHERE status = 'processing' AND processed_at < NOW() - INTERVAL '10 minutes'
  ) AS stuck_processing_count
FROM conversion_queue;
```

---

## 8. Reliability — 5-Layer Graceful Degradation

```
Layer 1: Server middleware (Vercel Edge)
  HTTP-only cookies on every page load. No JS needed.
  Survives: ad blockers, JS disabled, Safari ITP

Layer 2: Client TrackingProvider (React state)
  URL params in memory. Sends IDs in form body.
  Survives: nothing blocked, same session

Layer 3: Server cookie fallback (API routes)
  Reads _no_gclid etc. from request cookies.
  Survives: ad blockers killing client JS

Layer 4: Server event proxy (/api/track/event)
  GA4 MP + Meta CAPI from server. Same-origin.
  Survives: all client-side blocking

Layer 5: Enhanced Conversions (email matching)
  SHA-256 hashed email as fallback signal.
  Survives: total GCLID loss (Safari stripping, etc.)
```

---

## 9. GDPR Consent Integration

- Middleware checks consent cookie before setting tracking cookies
- `_no_vid` (visitor ID) can be set without consent (functional)
- Click ID cookies ONLY with marketing consent
- Lead form sends consent state → stored in leads table
- Conversion upload checks `consent_ad_user_data` before uploading
- Google API: `consent: { adUserData: "GRANTED" }`
- Meta CAPI: `data_processing_options: []` (no restrictions when consented)

---

## 10. Implementation Roadmap

| Phase | Week | Deliverables |
|---|---|---|
| 1. Foundation | 1 | SQL migration, enhanced middleware, /api/track/visit |
| 2. Lead Attribution | 1-2 | Update /api/leads with new fields, consent in forms |
| 3. Server Proxy | 2 | /api/track/event, GA4 MP, Meta CAPI real-time |
| 4. Offline Pipeline | 2-3 | CRM webhook, Edge Function, pg_cron, API creds, test mode |
| 5. Monitoring | 3-4 | Health endpoint, alerts, admin retry, retire Sheets import |

### Environment Variables

```env
# Tracking
IP_HASH_SALT=
CRM_WEBHOOK_SECRET=
HEALTH_CHECK_API_KEY=

# Google Ads API
GOOGLE_ADS_CUSTOMER_ID=2152468876
GOOGLE_ADS_MANAGER_ID=6706464060
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_CONVERSION_ACTION_QUALIFIED=7402407550
GOOGLE_ADS_CONVERSION_ACTION_CLOSED=7498026671

# Meta CAPI
META_PIXEL_ID=
META_ACCESS_TOKEN=

# GA4 Measurement Protocol
GA4_MEASUREMENT_ID=
GA4_API_SECRET=

# Alerts
SLACK_WEBHOOK_URL=
```

### Key Constraints

| Constraint | Value |
|---|---|
| GCLID max age | 90 days |
| Google Ads batch limit | 2,000 conversions/request |
| Meta CAPI batch limit | 1,000 events/request |
| Safari ITP JS cookie lifetime | 24 hours (with URL decorators) |
| Safari 26 GCLID stripping | All standard browsing (Sept 2025) |
| Supabase Edge Function timeout | 150 seconds |

---

## Sources

- [Google Ads: Manage Offline Conversions](https://developers.google.com/google-ads/api/docs/conversions/upload-offline)
- [Google Ads: Enhanced Conversions for Leads](https://developers.google.com/google-ads/api/samples/upload-enhanced-conversions-for-leads)
- [Google Ads API v22: ConversionUploadService](https://developers.google.com/google-ads/api/reference/rpc/v22/ConversionUploadService)
- [Meta CAPI 2026 Guide](https://www.dinmo.com/third-party-cookies/solutions/conversions-api/meta-ads/)
- [Meta Offline API Sunset May 2025](https://seresa.io/blog/facebook-meta-capi/meta-offline-conversions-api-dies-may-14-2025-is-your-woocommerce-store-ready)
- [Meta _fbc/_fbp Parameters](https://watsspace.com/blog/meta-conversions-api-fbc-and-fbp-parameters/)
- [Safari GCLID Removal 2025 — Stape](https://stape.io/blog/safari-removes-click-identifiers-solution)
- [Safari ITP Server-Side Tracking](https://stape.io/blog/safari-itp)
- [Supabase: Scheduling Edge Functions](https://supabase.com/docs/guides/functions/schedule-functions)
- [Supabase: Processing Jobs with Queues](https://supabase.com/blog/processing-large-jobs-with-edge-functions)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Server-Side GTM vs Client-Side — Stape](https://stape.io/blog/server-side-tagging-versus-client-side-tagging)
- [Server-Side Tracking Costs — TAGGRS](https://taggrs.io/server-side-tracking/costs/)
