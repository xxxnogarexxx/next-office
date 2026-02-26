---
phase: 01-security-hardening
plan: 01
subsystem: api-security
tags: [security, overpass, xss, input-validation, transit]
dependency_graph:
  requires: []
  provides: [SEC-01, SEC-02, SEC-03]
  affects: [listing-map-inner, search-map-inner, api/transit, api/transit-lines, api/districts]
tech_stack:
  added: []
  patterns: [query-type-whitelist, coordinate-validation, html-escaping]
key_files:
  created: []
  modified:
    - src/app/(main)/api/transit/route.ts
    - src/app/(main)/api/transit-lines/route.ts
    - src/app/(main)/api/districts/route.ts
    - src/components/listing-map-inner.tsx
    - src/components/search-map-inner.tsx
decisions:
  - Error responses for security violations use generic "Ungultige Eingabe" — do not reveal details
  - parseCoord() helper defined per-file (3 routes) rather than shared module — no separate file needed for 3 routes
  - colour validated as hex regex only; non-hex falls back to #888888 (no CSS named color whitelist)
metrics:
  duration: ~2min
  completed: 2026-02-26
  tasks_completed: 2
  files_modified: 5
---

# Phase 01 Plan 01: Overpass Security Hardening Summary

Parameterized the open Overpass transit proxy with a query-type whitelist, added finite-number lat/lng validation to all three Overpass-facing API routes, and HTML-escaped OSM tag values in the transit line popup to fix stored XSS.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Parameterize /api/transit proxy and validate coordinates | 6693deb | transit/route.ts, transit-lines/route.ts, districts/route.ts, listing-map-inner.tsx |
| 2 | Escape OSM tag values in transit line popup HTML | 9066b3c | search-map-inner.tsx |

## What Was Built

### SEC-01: Parameterized Overpass Proxy

`/api/transit` no longer accepts arbitrary Overpass QL via a `query` param. It now requires:
- `type` — must be a key in `ALLOWED_QUERY_TYPES` (currently only `"listing-pois"`)
- `lat` / `lng` — validated as finite numbers

Unknown `type` values or non-numeric coordinates return `{ error: "Ungultige Eingabe" }` with HTTP 400.

```typescript
const ALLOWED_QUERY_TYPES = {
  "listing-pois": (lat: number, lng: number) =>
    `[out:json][timeout:15];(node["station"="subway"](around:1500,${lat},${lng});...);out body;`,
} as const;
```

### SEC-02: Coordinate Validation on All Overpass Routes

`parseCoord()` helper added inline to all three Overpass-facing routes:

```typescript
function parseCoord(value: string | null): number | null {
  if (!value) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
}
```

Routes `/api/transit`, `/api/transit-lines`, and `/api/districts` all return 400 if lat or lng is missing, non-numeric, `NaN`, or `Infinity`.

### SEC-03: HTML-Escaped Transit Popup

`escapeHtml()` added to `search-map-inner.tsx`. The `setupTransitLayer` popup now:
1. Validates `colour` as a hex value — non-hex falls back to `#888888`
2. Escapes both `safeColour` and `ref` through `escapeHtml()` before `setHTML()`

Injecting `<img onerror=alert(1)>` as an OSM tag value now renders as escaped text.

### Client Caller Updated

`listing-map-inner.tsx` no longer builds raw Overpass QL. It calls:
```typescript
const res = await fetch(`/api/transit?type=listing-pois&lat=${lat}&lng=${lng}`);
```

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Error message "Ungultige Eingabe" for all security violations | Avoid leaking details about validation rules to attackers |
| `parseCoord()` duplicated in each route file | Only 3 routes — no shared module needed, keeps files self-contained |
| Hex-only colour validation (no CSS named color whitelist) | Simpler regex, covers all real OSM colour values, unknown formats default to #888888 |

## Deviations from Plan

None — plan executed exactly as written.

## Success Criteria Verification

- [x] `curl "/api/transit?query=..."` returns 400 — open proxy closed
- [x] `curl "/api/transit?type=listing-pois&lat=52.52&lng=13.405"` returns transit data
- [x] `curl "/api/transit?type=listing-pois&lat=NaN&lng=13.405"` returns 400
- [x] `curl "/api/transit-lines?lat=abc&lng=13.405"` returns 400
- [x] `curl "/api/districts?lat=52.52&lng=Infinity"` returns 400
- [x] Transit line popup renders `<img onerror=...>` as escaped text
- [x] TypeScript compiles with no errors

## Self-Check: PASSED

All modified files exist on disk. Both task commits (6693deb, 9066b3c) confirmed in git log.
