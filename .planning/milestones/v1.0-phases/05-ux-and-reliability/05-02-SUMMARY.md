---
phase: 05-ux-and-reliability
plan: 02
subsystem: ui
tags: [react, nextjs, accessibility, hydration, lucide-react, aria]

# Dependency graph
requires:
  - phase: 04-performance-architecture
    provides: City slug routing and client island patterns used by lead form
provides:
  - Lead form with type=email input, aria-busy skeleton, and animated submit spinner
  - Footer with suppressHydrationWarning preventing year mismatch
  - City navigation state reset via citySlug useEffect
affects: [testing, seo-content]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - suppressHydrationWarning on server component date-dependent content
    - aria-busy + role=status on client skeleton divs for screen readers
    - Loader2 animate-spin pattern for submit button spinner (lucide-react)
    - useEffect citySlug reset to clear stale form state on navigation

key-files:
  created: []
  modified:
    - src/components/lead-form.tsx
    - src/components/footer.tsx

key-decisions:
  - "Email input uses type=email (not type=text + inputMode=email) — native validation and mobile keyboard @ key"
  - "suppressHydrationWarning used on footer year div — standard Next.js pattern, simpler than hard-coding year"
  - "City slug useEffect resets form state without full remount — avoids flicker while preventing stale state"

patterns-established:
  - "Pattern: sr-only span inside aria-busy skeleton for screen reader announcements"
  - "Pattern: conditional icon render in button (Loader2 vs Send) rather than text-only loading state"

requirements-completed: [UX-04, UX-06, UX-08, UX-11, REL-02]

# Metrics
duration: 1min
completed: 2026-02-26
---

# Phase 5 Plan 02: UX and Reliability — Lead Form Polish and Footer Hydration Fix

**Email input type=email, aria-busy skeleton, Loader2 spinner, suppressHydrationWarning footer, and citySlug state reset in 2 component files**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-26T04:41:58Z
- **Completed:** 2026-02-26T04:43:07Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Lead form email input changed from type=text to type=email — mobile keyboards now show the @ key and browsers validate format natively
- Lead form skeleton div upgraded with aria-busy="true", role="status", and sr-only text — screen readers announce loading state
- Submit button shows animated Loader2 spinner (animate-spin) during submission instead of text-only change
- City slug useEffect added — navigating between cities resets submitted/error/submitting state, preventing stale form state
- Footer year div gets suppressHydrationWarning — eliminates React hydration mismatch if server/client render times differ

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix email input type, add aria-busy skeleton, and add submit spinner** - `5ee0f16` (feat)
2. **Task 2: Fix footer year hydration mismatch** - `5838f1b` (fix)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/components/lead-form.tsx` - Email type=email, aria-busy skeleton, Loader2 spinner import and usage, citySlug state reset effect
- `src/components/footer.tsx` - suppressHydrationWarning on copyright year div

## Decisions Made

- suppressHydrationWarning chosen over hard-coded year — maintainable (auto-updates) and is the standard Next.js pattern already used on html/body tags in root layout
- City slug state reset uses useEffect (not key prop remount) — avoids form flicker while still clearing stale state on city navigation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Lead form and footer UX polish complete
- Form accessibility (aria-busy skeleton, spinner) ready for review
- All 5 requirements satisfied: UX-04, UX-06, UX-08, UX-11, REL-02
- Phase 5 plan 03 can proceed

---
*Phase: 05-ux-and-reliability*
*Completed: 2026-02-26*
