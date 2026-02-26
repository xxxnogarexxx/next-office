---
phase: 01-security-hardening
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/(main)/api/transit/route.ts
  - src/app/(main)/api/transit-lines/route.ts
  - src/app/(main)/api/districts/route.ts
  - src/components/listing-map-inner.tsx
  - src/components/search-map-inner.tsx
autonomous: true
requirements: [SEC-01, SEC-02, SEC-03]

must_haves:
  truths:
    - "The /api/transit endpoint only accepts predefined parameterized query types — an arbitrary Overpass QL string is rejected with 400"
    - "lat/lng params on /api/transit, /api/transit-lines, and /api/districts are validated as finite numbers — non-numeric values return 400"
    - "Transit popup HTML in search-map-inner.tsx escapes all OSM tag values — injecting <img onerror=...> in a ref or colour tag does not execute JavaScript"
  artifacts:
    - path: "src/app/(main)/api/transit/route.ts"
      provides: "Parameterized Overpass proxy with query type whitelist"
      contains: "ALLOWED_QUERY_TYPES"
    - path: "src/app/(main)/api/transit-lines/route.ts"
      provides: "lat/lng validation before Overpass query interpolation"
      contains: "isFinite"
    - path: "src/app/(main)/api/districts/route.ts"
      provides: "lat/lng validation before Overpass query interpolation"
      contains: "isFinite"
    - path: "src/components/search-map-inner.tsx"
      provides: "HTML-escaped transit line popup content"
      contains: "escapeHtml"
  key_links:
    - from: "src/components/listing-map-inner.tsx"
      to: "src/app/(main)/api/transit/route.ts"
      via: "fetch /api/transit with query type param instead of raw Overpass QL"
      pattern: "query_type="
---

<objective>
Lock down the Overpass transit proxy and fix XSS in transit popups.

Purpose: The /api/transit endpoint currently accepts arbitrary user-controlled Overpass QL queries. An attacker can use it to query any Overpass data, abuse rate limits on the Overpass public API, or craft injection payloads. The transit-lines and districts endpoints interpolate unvalidated lat/lng values into Overpass QL strings. The search-map transit line popup renders OSM tag values as raw HTML via mapbox-gl's setHTML.

Output: Parameterized transit API, validated coordinates on all Overpass-facing routes, and escaped transit popup HTML.
</objective>

<execution_context>
@/Users/szymonwilkosz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/szymonwilkosz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-security-hardening/01-CONTEXT.md

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from codebase. -->

From src/app/(main)/api/transit/route.ts (CURRENT — to be replaced):
```typescript
// Currently accepts arbitrary `query` param and forwards to Overpass
export async function GET(request: NextRequest)
// request.nextUrl.searchParams.get("query") → forwarded raw to Overpass
```

From src/components/listing-map-inner.tsx (CLIENT — must update fetch call):
```typescript
// Line 79: Currently builds raw Overpass QL and sends as query param
const overpassQuery = `[out:json][timeout:15];(node["station"="subway"](around:1500,${lat},${lng});node["railway"="station"]["station"="light_rail"](around:2000,${lat},${lng});node["highway"="bus_stop"](around:800,${lat},${lng}););out body;`;
const res = await fetch(`/api/transit?query=${encodeURIComponent(overpassQuery)}`);
```

From src/components/search-map-inner.tsx (XSS — line 148):
```typescript
// Raw HTML injection — colour and ref come from OSM tags, unescaped
.setHTML(`<span style="background:${colour};color:white;padding:2px 8px;border-radius:4px;font-weight:600;font-size:13px;">${ref}</span>`)
```

From src/app/(main)/api/transit-lines/route.ts (lat/lng unvalidated):
```typescript
// Line 13: lat/lng interpolated without validation
const query = `[out:json][timeout:25];(relation["type"="route"]["route"="subway"](around:10000,${lat},${lng});...`;
```

From src/app/(main)/api/districts/route.ts (lat/lng unvalidated):
```typescript
// Line 87: lat/lng interpolated without validation
const query = `[out:json][timeout:25];relation["admin_level"="9"]["boundary"="administrative"](around:15000,${lat},${lng});out geom;`;
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Parameterize the /api/transit proxy and validate coordinates on all Overpass routes</name>
  <files>
    src/app/(main)/api/transit/route.ts
    src/app/(main)/api/transit-lines/route.ts
    src/app/(main)/api/districts/route.ts
    src/components/listing-map-inner.tsx
  </files>
  <action>
**SEC-01: Parameterize the transit proxy**

Replace the open Overpass proxy in `src/app/(main)/api/transit/route.ts`. Instead of accepting a raw `query` param and forwarding it, accept structured params: `type` (required), `lat` (required), `lng` (required).

Define a strict whitelist of allowed query types based on the one actual usage in the codebase:

```typescript
const ALLOWED_QUERY_TYPES = {
  "listing-pois": (lat: number, lng: number) =>
    `[out:json][timeout:15];(node["station"="subway"](around:1500,${lat},${lng});node["railway"="station"]["station"="light_rail"](around:2000,${lat},${lng});node["highway"="bus_stop"](around:800,${lat},${lng}););out body;`,
} as const;
```

The handler should:
1. Read `type`, `lat`, `lng` from searchParams
2. Validate `type` is a key in ALLOWED_QUERY_TYPES — if not, return `{ error: "Ungultige Eingabe" }` with 400
3. Validate lat/lng (see SEC-02 below)
4. Build the query from the whitelist function
5. Forward to Overpass as before (keep existing timeout, abort controller, error handling)

**SEC-02: Validate lat/lng as finite numbers**

Create a shared validation helper at the top of the transit route file (or inline — no separate file needed since there are only 3 routes):

```typescript
function parseCoord(value: string | null, name: string): number | null {
  if (!value) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
}
```

Apply this validation in ALL three Overpass-facing routes:
- `src/app/(main)/api/transit/route.ts` — validate lat/lng from params before query generation
- `src/app/(main)/api/transit-lines/route.ts` — validate lat/lng before line 13 query interpolation. Return `{ error: "Ungultige Eingabe" }` with 400 if invalid.
- `src/app/(main)/api/districts/route.ts` — validate lat/lng before line 87 query interpolation. Return `{ error: "Ungultige Eingabe" }` with 400 if invalid.

Per user decision: error responses should use the standard shape `{ error: string }`. Security violations return generic "Ungultige Eingabe" — do not reveal details.

**Update the client caller:**

In `src/components/listing-map-inner.tsx`, update the `fetchAllTransitPOIs` function (around line 78-81). Replace the raw Overpass QL query construction with a parameterized API call:

```typescript
// BEFORE:
const overpassQuery = `[out:json][timeout:15];(node["station"="subway"](around:1500,${lat},${lng});...`;
const res = await fetch(`/api/transit?query=${encodeURIComponent(overpassQuery)}`);

// AFTER:
const res = await fetch(`/api/transit?type=listing-pois&lat=${lat}&lng=${lng}`);
```

Remove the `overpassQuery` variable entirely. The rest of the function (parsing `data.elements`, categorizing into buckets) remains unchanged.
  </action>
  <verify>
    <automated>cd "/Users/szymonwilkosz/Library/Mobile Documents/com~apple~CloudDocs/claude-config/projects/next-office" && npx tsc --noEmit 2>&1 | head -30</automated>
    Verify that:
    1. TypeScript compiles without errors
    2. `grep -n "ALLOWED_QUERY_TYPES" src/app/\(main\)/api/transit/route.ts` shows the whitelist
    3. `grep -n "isFinite\|Number.isFinite\|parseCoord" src/app/\(main\)/api/transit/route.ts src/app/\(main\)/api/transit-lines/route.ts src/app/\(main\)/api/districts/route.ts` shows validation in all three routes
    4. `grep -n "query=" src/components/listing-map-inner.tsx` returns NO results (raw query param removed)
    5. `grep -n "type=listing-pois" src/components/listing-map-inner.tsx` confirms parameterized call
  </verify>
  <done>
    - /api/transit rejects any request without a valid `type` param from ALLOWED_QUERY_TYPES
    - /api/transit, /api/transit-lines, and /api/districts all validate lat/lng as finite numbers before Overpass interpolation
    - listing-map-inner.tsx sends `type=listing-pois&lat=X&lng=Y` instead of raw Overpass QL
    - Invalid type or non-numeric coordinates return 400 with `{ error: "Ungultige Eingabe" }`
  </done>
</task>

<task type="auto">
  <name>Task 2: Escape OSM tag values in transit line popup HTML</name>
  <files>
    src/components/search-map-inner.tsx
  </files>
  <action>
**SEC-03: HTML-escape transit popup content**

In `src/components/search-map-inner.tsx`, the `setupTransitLayer` function (around line 148) uses mapbox-gl's `.setHTML()` to render transit line tooltips. The `ref` and `colour` values come from OpenStreetMap relation properties and are injected directly into HTML. An attacker who edits OSM data could inject `<img onerror=alert(1)>` as a ref value.

Add a simple HTML escape utility at the top of the file (above `setupTransitLayer`):

```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
```

Update line 148 in the `setupTransitLayer` function to escape both `colour` and `ref`:

```typescript
// BEFORE:
.setHTML(`<span style="background:${colour};color:white;padding:2px 8px;border-radius:4px;font-weight:600;font-size:13px;">${ref}</span>`)

// AFTER:
.setHTML(`<span style="background:${escapeHtml(colour)};color:white;padding:2px 8px;border-radius:4px;font-weight:600;font-size:13px;">${escapeHtml(ref)}</span>`)
```

Also validate `colour` as a hex color or known CSS color name. If it doesn't match `/^#[0-9a-fA-F]{3,8}$/` and isn't one of the basic CSS color names, default to `#888888`. This prevents CSS injection via the `style` attribute (e.g., `background:url(javascript:...)`). A simple check:

```typescript
const safeColour = /^#[0-9a-fA-F]{3,8}$/.test(colour) ? colour : "#888888";
```

Apply this before the escapeHtml call on colour.

Note: The listing-map POI popups in `listing-map-inner.tsx` use React's `<Popup>` component with JSX `{selectedPoi.name}`, which auto-escapes — no fix needed there.
  </action>
  <verify>
    <automated>cd "/Users/szymonwilkosz/Library/Mobile Documents/com~apple~CloudDocs/claude-config/projects/next-office" && npx tsc --noEmit 2>&1 | head -30</automated>
    Verify that:
    1. TypeScript compiles without errors
    2. `grep -n "escapeHtml" src/components/search-map-inner.tsx` shows the escape function and its usage
    3. `grep -n "setHTML" src/components/search-map-inner.tsx` shows that all setHTML calls use escapeHtml
    4. `grep -n "safeColour\|#888888" src/components/search-map-inner.tsx` shows colour validation
  </verify>
  <done>
    - Transit line tooltip HTML-escapes both `ref` and `colour` values from OSM data
    - `colour` is validated as hex format — non-hex values fall back to #888888
    - Injecting `<img onerror=alert(1)>` as an OSM tag value renders as escaped text, not executable HTML
  </done>
</task>

</tasks>

<verification>
After both tasks complete:
1. `npx tsc --noEmit` passes with no errors
2. The /api/transit route has a ALLOWED_QUERY_TYPES whitelist and rejects arbitrary queries
3. All three Overpass routes (/api/transit, /api/transit-lines, /api/districts) validate lat/lng as finite numbers
4. Transit popup in search-map-inner.tsx escapes all HTML in OSM tag values
5. listing-map-inner.tsx uses parameterized API call instead of raw Overpass QL
</verification>

<success_criteria>
- Sending `curl "/api/transit?query=..."` (arbitrary QL) returns 400 — the open proxy is closed
- Sending `curl "/api/transit?type=listing-pois&lat=52.52&lng=13.405"` returns transit data — the parameterized API works
- Sending `curl "/api/transit?type=listing-pois&lat=NaN&lng=13.405"` returns 400 — non-numeric lat rejected
- Sending `curl "/api/transit-lines?lat=abc&lng=13.405"` returns 400
- Sending `curl "/api/districts?lat=52.52&lng=Infinity"` returns 400
- Transit line popup renders `<img onerror=...>` as escaped text, not executable
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-hardening/01-01-SUMMARY.md`
</output>
