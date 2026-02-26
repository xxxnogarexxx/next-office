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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 6 | 17 | Audit-first approach, yolo mode, parallel execution |

### Top Lessons (Verified Across Milestones)

1. Comprehensive audit before any code changes ensures nothing is missed
2. External config tasks need distinct tracking from code requirements
