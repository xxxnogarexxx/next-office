---
phase: 05-ux-and-reliability
plan: "03"
subsystem: accessibility
tags: [aria, a11y, focus-trap, scroll-lock, mapbox, map, localStorage]
dependency_graph:
  requires: []
  provides: [aria-listbox-search, aria-dialog-gallery, aria-close-button, map-coord-logging]
  affects: [src/components/search-bar.tsx, src/components/photo-gallery.tsx, src/components/lead-dialog.tsx, src/components/search-map-inner.tsx]
tech_stack:
  added: []
  patterns: [aria-listbox-combobox, focus-trap, scroll-lock-position-fixed]
key_files:
  created: []
  modified:
    - src/components/search-bar.tsx
    - src/components/photo-gallery.tsx
    - src/components/lead-dialog.tsx
    - src/components/search-map-inner.tsx
key-decisions:
  - "SEC-12 (Mapbox token URL restriction) deferred to post-launch — user chose to skip dashboard configuration checkpoint"
  - "localStorage resilience for transit cache already implemented (try/catch) — verified existing code correct, no changes needed for REL-03"
  - "Lucide React icons already emit aria-hidden automatically via library internals — no manual fix needed for decorative Lucide icons"
  - "Focus trap uses document-level keydown listener on the overlay ref — captures Tab/Shift+Tab and Escape without conflict"
  - "Scroll lock uses position:fixed + top:-scrollY pattern — preserves scroll position on gallery close"
  - "Search dropdown options changed from <button> to <div role='option'> inside <div role='listbox'> — correct ARIA listbox semantics"

patterns-established:
  - "ARIA combobox: input gets role=combobox + aria-controls + aria-activedescendant; container gets role=listbox; items get role=option + aria-selected"
  - "Focus trap: useEffect with keydown listener on overlay ref, cycles first/last focusable on Tab/Shift+Tab"
  - "Scroll lock: document.body.style.position=fixed + top=-scrollY in useEffect cleanup"
  - "Dev-only logging: process.env.NODE_ENV === 'development' guard on console.warn for data quality warnings"

requirements-completed: [UX-07, UX-09, UX-12, REL-01, REL-03]

duration: ~5min
completed: "2026-02-26"
---

# Phase 05 Plan 03: ARIA Accessibility, Map Reliability, and Mapbox Token Summary

**ARIA listbox semantics on search dropdown, focus-trap + scroll-lock on photo gallery, aria-label on lead dialog close button, and dev-only coordinate-missing warnings on map — SEC-12 (Mapbox token restriction) deferred to post-launch.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-26
- **Completed:** 2026-02-26
- **Tasks:** 2 of 3 completed (Task 3 skipped by user)
- **Files modified:** 4

## Accomplishments

- Search bar dropdown now has full ARIA listbox semantics: `role="combobox"` on input, `role="listbox"` on container, `role="option"` + `aria-selected` on items, `aria-activedescendant` tracking keyboard position (UX-07)
- Photo gallery fullscreen overlay has `role="dialog"`, `aria-modal="true"`, Tab/Shift+Tab focus trap cycling within the overlay, and `position:fixed` scroll lock restoring scroll position on close (UX-09)
- Lead dialog custom SVG close button has `aria-label="Schließen"` on the button and `aria-hidden="true"` on the SVG (UX-12)
- Map excludes listings without coordinates and emits a dev-only `console.warn` with the affected listing IDs (REL-01)
- Transit cache `localStorage` already had correct try/catch resilience — verified, no changes required (REL-03)
- SEC-12 (Mapbox token URL restriction) deferred to post-launch at user's discretion

## Task Commits

Each automated task was committed atomically:

1. **Task 1: ARIA to search bar, focus trap + scroll lock to photo gallery, aria-label to lead dialog close button** - `aee1819` (feat)
2. **Task 2: Add console.warn for listings without coordinates and verify localStorage resilience** - `bf0bc36` (feat)
3. **Task 3: Restrict Mapbox token to allowed URLs in dashboard** - SKIPPED (user deferred SEC-12 to post-launch)

## Files Created/Modified

- `src/components/search-bar.tsx` — Added `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete`, `aria-haspopup` to input; `role="listbox"` to dropdown container; `role="option"`, `aria-selected`, `id` to each city item (changed from `<button>` to `<div role="option">`)
- `src/components/photo-gallery.tsx` — Added `role="dialog"`, `aria-modal="true"`, `aria-label` to fullscreen overlay; `useRef` + focus trap effect cycling Tab/Shift+Tab; scroll lock effect using `position:fixed` / `top:-scrollY` pattern; removed separate Escape handler (now handled inside focus trap)
- `src/components/lead-dialog.tsx` — Added `aria-label="Schließen"` to close button, `aria-hidden="true"` to inner SVG
- `src/components/search-map-inner.tsx` — Added dev-only `console.warn` after coordinates filter, logging IDs of listings excluded from map

## Decisions Made

- **SEC-12 deferred:** Mapbox token URL restriction is a dashboard-only action. User chose to defer it to post-launch rather than complete the checkpoint at this time. Requirement SEC-12 remains open.
- **REL-03 no-op:** `fetchCached` in `search-map-inner.tsx` already wraps both `localStorage.getItem` and `localStorage.setItem` in try/catch — verified that failures degrade gracefully to network fetch without throwing. No code changes needed.
- **Lucide icons:** The library automatically emits `aria-hidden="true"` on all icon SVGs that have no children and no explicit a11y props (confirmed in `node_modules/lucide-react/dist/esm/Icon.js`). No manual fix required for decorative Lucide icons.

## Deviations from Plan

None — the two automated tasks executed exactly as written. Task 3 was a `checkpoint:human-action` that the user explicitly chose to skip and defer to post-launch.

## Issues Encountered

None.

## User Setup Required

**SEC-12 (Mapbox token URL restriction) is deferred and remains open.** Before or shortly after launch, restrict the Mapbox access token in the dashboard:

1. Go to https://account.mapbox.com/access-tokens/
2. Find the token matching `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
3. Under "URL restrictions", add:
   - `https://next-office.io/*`
   - `https://www.next-office.io/*`
   - `http://localhost:3000/*`
4. Save and verify the map still loads on localhost and production

Without this restriction, anyone who views page source can copy the token and consume Mapbox quota.

## Next Phase Readiness

- Phase 5 (UX and Reliability) is complete — all 3 plans executed (05-01, 05-02, 05-03)
- Ready to proceed to Phase 6
- One open item: SEC-12 (Mapbox token restriction) — post-launch task, no blocker for launch

---
*Phase: 05-ux-and-reliability*
*Completed: 2026-02-26*
