# External Integrations

**Analysis Date:** 2026-02-25

## APIs & External Services

**Database & Data:**
- Supabase - PostgreSQL-based BaaS
  - SDK/Client: `@supabase/supabase-js@2.95.3`
  - Auth: `NEXT_PUBLIC_SUPABASE_URL` (public endpoint), `SUPABASE_SERVICE_ROLE_KEY` (server-side write access)
  - Used for: Lead storage (main `leads` table), querying with service role for API routes
  - Scope: Both `/(lp)` and `/(main)` lead capture flows write to shared `leads` table

**Email Delivery:**
- Resend - Email service provider
  - SDK/Client: `resend@6.9.2`
  - Auth: `RESEND_API_KEY` (server-side only)
  - Used for: Lead submission notifications (HTML emails to broker team)
  - Flow: Lead validation → Supabase insert → fire-and-forget Resend email (non-blocking)
  - From address: `NextOffice <noreply@next-office.io>`

**Maps & Geographic Data:**
- Mapbox GL JS - Vector tile mapping and rendering
  - SDK/Client: `mapbox-gl@3.18.1`, `react-map-gl@8.1.0`
  - Auth: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (public token, client-side)
  - Used for: Property listings map, search map with U-Bahn/S-Bahn overlays
  - Features: Markers for listings, popups, navigation controls, style: `mapbox://styles/mapbox/streets-v12`

**Geographic Boundaries & Transit:**
- Overpass API - OpenStreetMap query service
  - Query endpoint: `https://overpass-api.de/api/interpreter`
  - Method: POST with Overpass QL
  - Used for: U-Bahn and S-Bahn lines (`/api/transit-lines`), district boundaries (`/api/districts`)
  - Caching: 24-hour server cache with 7-day stale-while-revalidate
  - No authentication required (public API)

**Image CDN:**
- Unsplash CDN
  - Domain: `images.unsplash.com` (allowed in Next.js image optimization)
  - Used for: Hero images, stock photography on landing pages
  - No authentication required

- Contentful CDN
  - Domain: `images.ctfassets.net` (allowed in Next.js image optimization)
  - Used for: Potential content management (configured but usage not confirmed in source analysis)
  - No authentication required

## Data Storage

**Databases:**
- Supabase PostgreSQL
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` (public read) + `SUPABASE_SERVICE_ROLE_KEY` (server write)
  - Client: `@supabase/supabase-js`
  - Schema: Single `leads` table with fields:
    - User data: `name`, `email`, `phone`, `city`, `team_size`, `start_date`, `company`
    - Listing context: `listing_id`, `listing_name`
    - Message/notes: `message` (stores UTM data, company prefix)
    - Google Ads attribution: `gclid`, `gbraid`, `wbraid`, `landing_page`, `referrer`
    - Analytics: `user_agent`, `created_at` (server timestamp)

**Local Data:**
- JSON fixtures: `src/data/cities.json`, `src/data/listings.json`
  - Loaded at build time via `gray-matter` and direct imports
  - Used for: Property search, city routing, SEO metadata

**File Storage:**
- Local filesystem only - No cloud file storage (photos loaded from URLs in JSON)
- Photos stored as external URLs (Unsplash, Contentful, or broker CDN)

**Caching:**
- Browser localStorage - Transit lines and district GeoJSON (24-hour client cache)
- Next.js HTTP cache headers - Transit/district API responses (`max-age=86400, stale-while-revalidate=604800`)

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based (Supabase)
  - Implementation: Service role key for API routes (server-side only)
  - User authentication: Not implemented in current codebase (leads are anonymous submissions)
  - Session: None (stateless API endpoints)

**Secrets Management:**
- Environment variables (`.env.local`)
  - API keys injected at build/deploy time
  - No explicit secrets manager detected (Vercel secrets or equivalent in deployment)

## Monitoring & Observability

**Error Tracking:**
- None detected - Error logging to console only
  - Supabase errors logged: `console.error("Supabase insert error...")`
  - Resend errors logged: `console.error("Resend error...")`

**Logs:**
- Server-side: Node.js console (stderr/stdout)
  - Transports to deployment platform logs (Vercel, etc.)
- Client-side: Browser console (no external aggregation detected)

**Analytics:**
- Google Analytics 4 (GA4) - Visitor tracking and event funnel
  - Measurement ID: `NEXT_PUBLIC_GA4_ID`
  - Implementation: gtag.js script injection (via `GTMScript` component)

**Conversion Tracking:**
- Google Ads conversion tracking - Lead attribution
  - Conversion ID: `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID`
  - Conversion label: `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`
  - Implementation: `ConversionTracker` component on thank-you page (`/danke`)
  - Firing method: `window.gtag("event", "conversion", {...})` with dedup UUID

**Tag Management:**
- Google Tag Manager (GTM) - Optional, via `NEXT_PUBLIC_GTM_ID`
  - Implementation: gtag.js with GTM configuration (optional if ID not set)

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from Next.js optimizations and deployment patterns)
- Alternative: Any Node.js host (self-hosted, Docker)

**CI Pipeline:**
- Not detected in source (likely handled by Vercel auto-deployment on git push)

## Environment Configuration

**Required env vars (production):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase write access (server-side secret)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox token (public, rate-limited)
- `RESEND_API_KEY` - Resend email API key (server-side secret)
- `NOTIFICATION_EMAIL` - Broker email address for lead notifications
- `NEXT_PUBLIC_GA4_ID` - GA4 measurement ID (optional)
- `NEXT_PUBLIC_GOOGLE_ADS_ID` - Google Ads account ID (optional)
- `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID` - Google Ads conversion tracking ID (optional)
- `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` - Google Ads conversion label (optional)

**Secrets location:**
- `.env.local` (local development)
- `.env.production` (production overrides, if used)
- Deployment platform secrets (Vercel environment variables, etc.)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- Resend email notifications (fire-and-forget, no webhooks)
  - Triggered on: Lead form submission (both LP and main site)
  - Payload: HTML email with lead details, UTM data, company info

## Google Ads Integration

**Click ID Tracking:**
- Server-side middleware intercepts `?gclid`, `?gbraid`, `?wbraid` URL parameters
  - Implementation: `src/middleware.ts`
  - Storage: HTTP-only first-party cookies with 90-day max-age
  - Fallback: Cookie values used if form reloads or user navigates before submission

**Conversion Signals:**
- Double-track on thank-you page (`/danke`):
  1. Google Ads conversion event (primary signal for ROI)
  2. GA4 `lp_form_complete` event (for analytics funnel)
  - Dedup UUID generated per conversion to prevent double-counting

---

*Integration audit: 2026-02-25*
