# Codebase Concerns

**Analysis Date:** 2026-02-25

## Tech Debt

**Large JSON bundle in client code:**
- Issue: `src/data/listings.json` (616 KB uncompressed) is imported as static JSON and shipped to browser for every visitor. Contains full listing data including all photos URLs, amenities, coordinates, etc.
- Files: `src/lib/listings.ts`, `src/data/listings.json`
- Impact: Increases initial bundle size, slows page load. No filtering server-side — all 500+ listings shipped to client even when user only needs 10.
- Fix approach: Move listings to backend/database. Keep only featured listings or city-filtered results in client. Implement paginated API endpoint for search.

**Monolithic lead API routes with duplicated logic:**
- Issue: Two nearly identical lead capture routes with ~90% code duplication (free provider detection, email formatting, Supabase insert, Resend fire-and-forget)
- Files: `src/app/(lp)/api/lp-leads/route.ts`, `src/app/(main)/api/leads/route.ts`
- Impact: Changes must be made in two places. Bug fixes replicate slowly. LP route has stricter validation (all fields required), main route more lenient — inconsistent user experience.
- Fix approach: Extract shared validation, Supabase, and Resend logic into `src/lib/lead-service.ts`. Both routes call single handler with config parameter for differences (email subject format, required fields).

**Fire-and-forget email sending blocks response:**
- Issue: `resend.emails.send().catch()` is called but not awaited. If Resend API is slow (>5s), request hangs because error handler still runs synchronously.
- Files: `src/app/(lp)/api/lp-leads/route.ts` (line 135), `src/app/(main)/api/leads/route.ts` (line 79)
- Impact: Lead submission appears slow to user if Resend has latency. No retry logic if send fails.
- Fix approach: Queue email for background job (Bull, RabbitMQ, or Supabase queues). Return success immediately after DB insert. Handle Resend failures asynchronously with retry/backoff.

**Transit API timeout too aggressive:**
- Issue: Overpass API proxy timeout set to 12 seconds with no retry
- Files: `src/app/(main)/api/transit/route.ts` (line 10)
- Impact: If Overpass API is slow or overloaded, transit line overlays fail silently. User sees "error" in console but no map transit data.
- Fix approach: Increase timeout to 30s. Add exponential backoff retry (max 2). Cache aggressively (already done for 24h in localStorage).

**Hardcoded placeholder credentials exposed in gtm-script:**
- Issue: Google Ads conversion ID/label marked as placeholders ("XXXXXXXXXX") in comments
- Files: `src/components/lp/sections/lead-form-section.tsx` (line 35)
- Impact: Placeholder values may be committed by mistake during LP variant testing. Should have validation that values are not examples.
- Fix approach: Add validation in build step to warn if env vars contain placeholder patterns (all X's, "example", "test").

**Password manager extension interference unhandled:**
- Issue: Form includes MutationObserver to remove password manager UI but relies on fragile selectors (data-np-uid, data-lastpass-icon-root, np- prefix)
- Files: `src/components/lead-form.tsx` (lines 42-68)
- Impact: If password manager vendor changes their attribute names, forms break with layout shifts. May cause failed submissions if observer interferes with form.
- Fix approach: Use passive approach: container overflow-hidden with z-index stacking context. Accept that extensions inject UI — design form padding to accommodate.

## Known Bugs

**Listings without coordinates not displayed on map:**
- Symptoms: Search page map shows fewer pins than listing cards. Some listings load but don't appear on Mapbox.
- Files: `src/components/search-map-inner.tsx` (lines 184-187), filtering silently removes listings where latitude/longitude are null
- Trigger: Any listing from Contentful import without geocoded position
- Workaround: Check `src/data/listings.json` for listings with `latitude: null`. Re-geocode via Contentful or manually assign.
- Impact: Users cannot discover listings on map if coordinates missing. Import script reports this in console but doesn't block.

**Hydration mismatch on rapid navigation:**
- Symptoms: LeadForm shows empty skeleton on first page load, then renders. If user navigates between city pages quickly, form state may desynchronize.
- Files: `src/components/lead-form.tsx` (lines 39-40, useEffect setMounted)
- Trigger: Server-side render without mount state, then client-side hydration. Rapid route changes between different city pages.
- Workaround: Use dynamic import with ssr: false. Already partially implemented in search-map.
- Impact: Form briefly shows wrong UI. Race condition if user submits during hydration.

**localStorage exceptions swallowed silently:**
- Symptoms: No indication if localStorage fails (quota exceeded, private mode). Transit line cache may fail without error.
- Files: `src/components/search-map-inner.tsx` (lines 50-62)
- Trigger: User in private browsing mode, or localStorage quota exceeded
- Workaround: None — silently falls through to fetch
- Impact: Performance optimizations fail silently. Transit data re-fetched every time instead of cached.

## Security Considerations

**Service role key exposed in .env.local:**
- Risk: `SUPABASE_SERVICE_ROLE_KEY` is stored in `.env.local` (git-ignored but high privilege). If dev machine compromised, full database access granted.
- Files: `.env.local` (not read), used in `src/app/(lp)/api/lp-leads/route.ts` and `src/app/(main)/api/leads/route.ts`
- Current mitigation: `.env.local` is .gitignored. CI/CD should inject via secrets management.
- Recommendations: Use Supabase RLS (Row Level Security) to limit scope. Consider per-endpoint limited-scope tokens instead of service role. Rotate key regularly in production.

**Email validation regex too simplistic:**
- Risk: Regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` accepts invalid emails like `@.@`. Attackers may inject unsanitized emails into Supabase.
- Files: `src/app/(lp)/api/lp-leads/route.ts` (line 51)
- Current mitigation: Resend API may reject on their side. No email verification in product flow.
- Recommendations: Use RFC 5322-compliant validation library (email-validator). Send confirmation link with challenge.

**Missing CSRF protection on lead forms:**
- Risk: Cross-origin POST requests to `/api/leads` and `/api/lp-leads` have no CSRF tokens. Attacker can submit forms from external sites.
- Files: `src/app/(lp)/api/lp-leads/route.ts`, `src/app/(main)/api/leads/route.ts`
- Current mitigation: None — requests are public
- Recommendations: Add SameSite=Strict cookies. Implement double-submit CSRF tokens (form token + cookie token). Validate Origin header.

**No rate limiting on lead endpoints:**
- Risk: Attacker can spam lead submissions, flooding Supabase and Resend quota.
- Files: `src/app/(lp)/api/lp-leads/route.ts`, `src/app/(main)/api/leads/route.ts`
- Current mitigation: Vercel may have basic DDoS protection
- Recommendations: Add rate limiting middleware (per IP, per email, per session). Use Upstash Redis or Supabase for distributed rate limit state.

**Google Ads click IDs stored without validation:**
- Risk: gclid/gbraid/wbraid cookie values are user-controlled via URL params. No validation that they're valid GUIDs. Attacker can inject large strings.
- Files: `src/middleware.ts` (lines 23-34)
- Current mitigation: HTTP-only, secure, sameSite=lax
- Recommendations: Validate gclid format (^[^=]+=\d+$ or similar). Truncate to max 100 chars. Log suspicious patterns.

## Performance Bottlenecks

**Client-side filtering of 500+ listings:**
- Problem: All listings loaded into React state and filtered in memory on every search/filter change
- Files: `src/app/(main)/search/page.tsx`, `src/lib/listings.ts`
- Cause: 616 KB JSON file imported directly. No server-side search API.
- Improvement path: Implement `/api/search?city=berlin&priceMax=1000&capacity=5` endpoint. Return only matched results with pagination. Move filtering to SQL.

**Mapbox CSS loaded on every page:**
- Problem: `mapbox-gl/dist/mapbox-gl.css` imported globally via dynamic component, even if map not visible
- Files: `src/components/search-map-inner.tsx` (line 6)
- Cause: CSS imported before component is lazy-loaded
- Improvement path: Import CSS inside SearchMapInner to ensure it only loads when SearchMap renders. Or inline critical styles.

**Transit lines fetched on every city page load:**
- Problem: fetchTransitLines makes HTTP request to `/api/transit` which proxies to Overpass API (10-30s latency)
- Files: `src/components/search-map-inner.tsx` (lines 65-69)
- Cause: No prefetch. Triggered only when user clicks "U-Bahn" overlay button, but each city location triggers refetch.
- Improvement path: Prefetch on page load (non-blocking). Persist cross-session in browser IndexedDB (TTL 30 days, not 24h). Cache by coordinates bucket (round to 0.1 degree).

**Contentful import script unoptimized:**
- Problem: Fetches all 500+ listings with include depth 2, then parses/transforms sequentially
- Files: `scripts/import-contentful.ts`
- Cause: Single batch fetch with pagination=100. No parallelization of asset resolution or price parsing.
- Improvement path: Fetch with pagination in parallel batches (Promise.all). Use bulk asset mapping. Cache previously imported listings to skip unchanged.

## Fragile Areas

**Search page map integration:**
- Files: `src/components/search-map-inner.tsx`, `src/app/(main)/search/page.tsx`
- Why fragile: Complex state management with overlays, transit layers, popup popups, hover state. Manual Mapbox layer management (add/remove). Race conditions if overlayActive state changes during async fetch.
- Safe modification: Extract layer setup logic to custom hook (useMapboxTransitLayer). Test overlay toggle → load → remove flows. Mock localStorage in tests to ensure cache works.
- Test coverage: No unit tests for SearchMapInner. Transit layer add/remove logic untested. Popup lifecycle untested.

**Lead form multi-variant rendering:**
- Files: `src/components/lead-form.tsx`
- Why fragile: 4 different layout variants (sidebar, inline, contact, dialog) determined by prop. Mount detection deferred via useEffect. Password manager interference cleanup runs in observer.
- Safe modification: Extract variant layouts to separate components (LeadFormSidebar, LeadFormInline, etc). Move password manager cleanup to CSS-only solution.
- Test coverage: No tests for form submission. Hydration mismatch not tested. Validation edge cases not covered.

**Middleware cookie setting order:**
- Files: `src/middleware.ts`
- Why fragile: Cookie values read from URL params and immediately set. No validation that they're not empty strings or NaN. If gclid=&gbraid=, still sets cookies.
- Safe modification: Validate value length > 0. Whitelist character set (alphanumeric + hyphen). Log if rejecting suspicious values.
- Test coverage: No tests for middleware. Cookie expiration not verified. Multiple gclid overwrites not tested.

## Scaling Limits

**Listings JSON file scales linearly with DB:**
- Current capacity: 616 KB for ~500 listings. Will become 1.2 MB at 1000 listings, 2.5 MB at 2000.
- Limit: >5 MB breaks slow networks (mobile). Browser parsing time becomes noticeable.
- Scaling path: Move to paginated API. Query `/api/listings?city=berlin&page=1&limit=50`. Implement server-side search indices.

**Single Supabase project for all features:**
- Current capacity: Free tier ~500 requests/sec. LP + main app compete for same rate limit.
- Limit: ~100 concurrent users submitting forms will hit rate limits.
- Scaling path: Separate Supabase projects for LP (leads only) and main (leads + future features). Or implement queue → batch inserts.

**Mapbox tile requests N × listings:**
- Current capacity: Mapbox free tier 50,000 map loads/month. Each city page = 1 map load. Each unique search = 1 map load.
- Limit: >50,000 pages/month across all users hits overage charges.
- Scaling path: Implement static map previews (image fallback). Use Mapbox static API for city overview pages instead of interactive GL.

## Dependencies at Risk

**react-map-gl version 8.1.0 (old):**
- Risk: Current version from Oct 2023. Latest is 8.10+. Breaking changes in Mapbox GL JS v3 coming.
- Impact: May not support future Mapbox GL versions. Library unmaintained if major security in Mapbox.
- Migration plan: Upgrade to latest 8.x (test SearchMapInner thoroughly). Monitor Mapbox GL v3 migration timeline.

**mapbox-gl CSS import side effect:**
- Risk: Direct import of mapbox-gl/dist/mapbox-gl.css loads global styles. No way to scope or customize without CSS-in-JS override.
- Impact: Conflicting styles possible if future Tailwind or UI library updates. Hard to debug.
- Migration plan: Use mapbox-gl with CSS Modules or styled-components. Inline critical styles, lazy-load rest.

**Resend API dependency on single provider:**
- Risk: All emails sent through Resend. If service down, no notifications (leads collected but team not notified).
- Impact: Missed lead follow-ups. No visibility into failures.
- Migration plan: Add fallback SMTP provider (SendGrid, AWS SES). Store unsent emails in Supabase queue. Retry with exponential backoff.

## Missing Critical Features

**No analytics on lead conversion:**
- Problem: Leads submitted but no tracking of which ads/campaigns convert. UTM params stored but not analyzed.
- Blocks: Cannot optimize ad spend. Cannot A/B test landing page variants effectively.
- Solution: Add Supabase reporting views or Metabase dashboard. Query leads by utm_source/utm_campaign/utm_term. Display in admin panel.

**No lead follow-up reminders:**
- Problem: Leads submitted but team manually follows up. If email missed or deleted, lead forgotten.
- Blocks: Cannot guarantee "response in 30 minutes" promise in UI.
- Solution: Add cron job (Vercel Cron, pg_cron) to send internal reminder if lead >15 min old and not marked "contacted".

**No duplicate lead detection:**
- Problem: Same user can submit multiple times (different email variations, incognito mode, etc). Team gets duplicate work.
- Blocks: Cannot measure true lead count accurately.
- Solution: Query Supabase by phone + city before insert. Mark duplicates in DB. Deduplicate in reporting.

**No user/listing matching recommendations:**
- Problem: Lead form collects capacity + city but doesn't suggest matching listings in thank-you email.
- Blocks: Team must manually search listings. Users don't see immediate results.
- Solution: Query listings by city + capacity range in lp-leads route. Attach top 3 matches to Resend email.

## Test Coverage Gaps

**No tests for lead form submission:**
- What's not tested: Form validation (email format, required fields). Submission flow (POST /api/leads). Error state rendering. Success state rendering.
- Files: `src/components/lead-form.tsx`
- Risk: Regression in form breaks silently. Validation bypassed by tampering request body. Error messages show garbage.
- Priority: High

**No tests for API routes:**
- What's not tested: Supabase error handling (network timeout, quota exceeded). Resend fire-and-forget (does it actually send?). Google Ads click ID fallback from cookies.
- Files: `src/app/(lp)/api/lp-leads/route.ts`, `src/app/(main)/api/leads/route.ts`, `src/app/(main)/api/transit/route.ts`
- Risk: API changes not caught until production. Silent failures in email sending.
- Priority: High

**No tests for SearchMapInner:**
- What's not tested: Overlay toggle (ubahn/sbahn). Transit layer rendering. Listing pin click. Hover state. Popup close. Mobile resize observer.
- Files: `src/components/search-map-inner.tsx`
- Risk: Map features break after refactoring. Layers don't render. Popups stuck open.
- Priority: Medium

**No tests for middleware cookie setting:**
- What's not tested: Cookie set when gclid present. Cookie not set when gclid absent. Multiple gclid values. Cookie expiration.
- Files: `src/middleware.ts`
- Risk: Tracking broken silently. Cookies not persisted. Wrong values in analytics.
- Priority: Medium

**No E2E tests for lead submission flow:**
- What's not tested: User lands with ?gclid=123 → submits form → sees success → email sent. Supabase has row with gclid value.
- Files: Full user journey
- Risk: End-to-end flow broken but isolated tests pass. Integrations fail silently.
- Priority: High

---

*Concerns audit: 2026-02-25*
