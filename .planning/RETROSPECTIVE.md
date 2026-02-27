# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Launch Readiness

**Shipped:** 2026-02-26
**Phases:** 6 | **Plans:** 17

### What Was Built
- Full security hardening: parameterized Overpass proxy, XSS prevention, HTML-escaped emails, CSRF, rate limiting, scoped Supabase access
- Infrastructure: env validation, Sentry monitoring (wired), CI/CD, security headers, health check, CORS
- Lead pipeline: consolidated 5-file service module, RFC email validation, dedup detection, non-blocking email
- Performance: 45% smaller client payload, server components, static generation, lazy-loaded Mapbox + carousel
- UX: branded 404/error pages, city slug validation, ARIA accessibility, focus traps, loading states
- SEO: GA4 tracking, Organization + BreadcrumbList schema, OG tags, robots.txt, sitemap, font fixes

### What Worked
- Yolo mode with parallelization enabled rapid execution — 17 plans across 6 phases in a single day
- Atomic commits per task made it easy to track changes and revert if needed
- 5-domain audit upfront (security, performance, UX, devops, SEO) gave complete picture before any code changes
- Codebase mapping documents provided sufficient context for every phase without re-reading source files

### What Was Inefficient
- Phase plan file references in ROADMAP.md were not always accurate (some said TBD even after plans were created)
- Traceability table in REQUIREMENTS.md had SEC-12 and DEV-03 marked "Pending" despite work being done — external config tasks need a distinct status
- Performance metrics in STATE.md only tracked first few phases accurately, later entries were appended in inconsistent format

### Patterns Established
- Lead service module pattern: thin route handlers (5 lines) delegating to shared service library
- CSRF via HMAC-SHA256 double-submit cookie derived from existing secret (no new env var)
- JSON-LD XSS prevention: `.replace(/</g, '\\u003c')` on all `dangerouslySetInnerHTML` output
- `IntersectionObserver` with `rootMargin: 200px` for viewport-gated lazy loading
- `suppressHydrationWarning` for dynamic date rendering in SSR

### Key Lessons
1. External config tasks (dashboard settings, credential setup) should be tracked separately from code requirements — they're deployment checklist items, not development gaps
2. Consolidating duplicated service logic early (Phase 3) simplified all subsequent phases that touched the same routes
3. CSP with `unsafe-inline`/`unsafe-eval` is a known Next.js limitation — plan nonce-based CSP as a future improvement
4. Static JSON data files work fine at launch scale but will need database migration as listings grow

### Cost Observations
- Model mix: ~80% sonnet (execution), ~20% opus (planning, reviews)
- Notable: All 17 plans executed in approximately 40 minutes total wall time

---

## Milestone: v1.1 — Ad Tracking & Offline Conversion Pipeline

**Shipped:** 2026-02-27
**Phases:** 7 | **Plans:** 17

### What Was Built
- Database foundation: 4 new tables (visitors, conversions, conversion_queue, tracking_events) with RLS deny-all; leads extended with visitor FK, UTMs, email_hash, consent, conversion_status
- Visitor & UTM capture: persistent visitor_id + 5 UTM cookies via middleware, first-touch attribution, visit upsert on every page load (both LP and main site)
- Enhanced Conversions: SHA-256 email hashing + gtag user_data for cross-device Google Ads attribution, shared transaction_id between client and server
- Offline conversion pipeline: CRM webhook (NetHunt) → email-based lead matching → idempotent conversion → Google Ads API v18 upload via Supabase Edge Function with exponential backoff retry
- Server-side event proxy: /api/track/event → GA4 Measurement Protocol for ad blocker resilience, dual-fire with shared event_id dedup
- Monitoring: health endpoint for pipeline status, SQL view for gclid capture rate and upload success metrics

### What Worked
- Milestone audit → gap closure loop: first audit found 5 gaps, spawned Phases 11 + 13 to close them, re-audit confirmed all 28 requirements satisfied
- Yolo mode again: 17 plans across 7 phases executed in ~15 min wall time (even faster than v1.0)
- Retroactive verification pattern (Phase 11): some requirements were already satisfied by earlier phases but not formally tracked — a verification-only phase closed them cleanly without writing code
- Direct CRM webhook (cutting n8n) simplified the pipeline — fewer moving parts, easier to debug

### What Was Inefficient
- ROADMAP plan checkboxes not always updated during execution — Phase 8/9/10/11/13 plan checkboxes left unchecked in ROADMAP even after SUMMARY files existed
- STATE.md performance metrics table format drifted in later phases (inconsistent column alignment)
- SUMMARY frontmatter inconsistencies (missing requirements-completed field) caught only by audit — should be caught during plan execution
- Phase 12 "Plans: TBD" left in ROADMAP even after plans were created and executed

### Patterns Established
- First-touch UTM attribution via HTTP-only cookies (existing cookies not overwritten on return visits)
- Two-step INSERT+UPDATE for visitor upsert (preserves first-touch UTMs while updating last_seen_at)
- Fire-and-forget visit tracking pattern: useEffect → fetch POST with credentials:same-origin, catch for non-fatal
- Service role client created inline for tables with no anon RLS policy (consistent across resolveVisitorUuid, health endpoint)
- Dual-fire tracking: gtag client + /api/track/event server proxy with shared event_id for GA4 dedup
- REFERENCE IMPLEMENTATION annotation for files kept as canonical reference but not imported at runtime

### Key Lessons
1. Milestone audit → gap closure → re-audit is a reliable pattern — caught 5 real issues that would have shipped as silent bugs
2. SUMMARY frontmatter must include requirements-completed field at execution time, not retroactively — automate this in plan template
3. ROADMAP plan checkboxes should be updated atomically with SUMMARY creation — stale checkboxes create confusion during audits
4. Deno Edge Function + Next.js Node code duplication is a known cost of Supabase cron — both modules must be manually kept in sync

### Cost Observations
- Model mix: ~85% sonnet (execution), ~15% opus (audit, planning)
- Notable: 17 plans in ~15 min wall time — 2x faster than v1.0 (familiarity with codebase + patterns)

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 6 | 17 | Audit-first approach, yolo mode, parallel execution |
| v1.1 | 7 | 17 | Audit → gap closure → re-audit loop, retroactive verification pattern |

### Top Lessons (Verified Across Milestones)

1. Comprehensive audit before any code changes ensures nothing is missed (v1.0: 5-domain audit; v1.1: milestone audit caught 5 gaps)
2. External config tasks need distinct tracking from code requirements (v1.0 SEC-12/DEV-03; v1.1 GOOGLE_ADS_* env vars, pg_cron)
3. ROADMAP plan checkboxes drift from reality during fast execution — consider automating updates alongside SUMMARY creation
4. Yolo mode with atomic commits enables reliable high-velocity execution (v1.0: 40min; v1.1: 15min)
