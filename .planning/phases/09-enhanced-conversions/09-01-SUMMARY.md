---
phase: 09-enhanced-conversions
plan: "01"
subsystem: tracking
tags: [enhanced-conversions, google-ads, gtag, sha256, email-hash, lead-pipeline]
dependency_graph:
  requires: [07-database-foundation]
  provides: [EC-01, EC-03]
  affects: [src/components/lp/tracking/gtm-script.tsx, src/lib/leads/service.ts, src/lib/leads/supabase.ts]
tech_stack:
  added: []
  patterns: [Node.js crypto createHash, SHA-256 hex normalization, gtag Enhanced Conversions config]
key_files:
  created:
    - src/lib/tracking/hash.ts
  modified:
    - src/components/lp/tracking/gtm-script.tsx
    - src/lib/leads/service.ts
    - src/lib/leads/supabase.ts
decisions:
  - allow_enhanced_conversions applied only to Google Ads gtag config — not GA4 (per Google spec)
  - hashEmail normalizes before hashing: trim + lowercase (Google Enhanced Conversions requirement)
  - emailHash param is optional in insertLead — backward-compatible with any callers that omit it
  - No migration needed — email_hash column already exists from migration 005_leads_extension.sql
metrics:
  duration: "1 min"
  completed_date: "2026-02-26"
  tasks_completed: 3
  files_changed: 4
requirements:
  - EC-01
  - EC-03
---

# Phase 09 Plan 01: Enhanced Conversions — gtag Flag + Email Hash Pipeline Summary

**One-liner:** Google Ads Enhanced Conversions enabled via gtag flag (EC-01) and SHA-256 email hash stored in leads table on every submission (EC-03).

## What Was Built

EC-01 — Added `allow_enhanced_conversions: true` to the Google Ads gtag config call in `GTMScript`. The GA4 config line is unchanged; the flag is Google Ads-specific and must appear only in that config call.

EC-03 — Created a `hashEmail()` utility at `src/lib/tracking/hash.ts` that normalizes email (trim + lowercase) and computes a 64-character lowercase SHA-256 hex digest, matching the Google Ads Enhanced Conversions specification. The utility is imported into `handleLeadSubmission` in `service.ts` as Step 5d — it runs after payload validation on the validated `data.email`, producing `emailHash`. This hash is passed as the third argument to `insertLead()` in `supabase.ts`, which writes it to the existing `email_hash` column in the leads table (no new migration required — the column was added in migration 005).

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Add allow_enhanced_conversions to Google Ads gtag config | 3e6d947 |
| 2 | Create hashEmail utility at src/lib/tracking/hash.ts | eaa887e |
| 3 | Wire email hash into service.ts and insertLead in supabase.ts | 1d879cd |

## Verification Results

- EC-01: `allow_enhanced_conversions: true` confirmed in Google Ads config line (line 51 of gtm-script.tsx). GA4 config line (line 50) does not contain the flag.
- EC-03: `hashEmail()` exported from hash.ts. `service.ts` imports and calls it with `data.email`. `supabase.ts` `insertLead` accepts `emailHash?: string | null` and writes `email_hash: emailHash ?? null`.
- Regression: All existing insert fields preserved. `insertLead` signature is backward-compatible (emailHash optional, defaults to null).
- No new migration files created — email_hash column exists from migration 005.

## Decisions Made

- **allow_enhanced_conversions placement:** Applied to the Google Ads gtag config call only, not GA4. This is per the Google Ads Enhanced Conversions specification.
- **Email normalization:** trim + lowercase before SHA-256 (Google requirement for cross-device matching accuracy).
- **insertLead signature:** emailHash is `string | null | undefined` (optional param) to maintain backward compatibility.
- **No migration:** email_hash TEXT column already created in migration 005_leads_extension.sql with idx_leads_email_hash partial index.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files exist:
- FOUND: src/components/lp/tracking/gtm-script.tsx
- FOUND: src/lib/tracking/hash.ts
- FOUND: src/lib/leads/service.ts
- FOUND: src/lib/leads/supabase.ts

Commits exist:
- FOUND: 3e6d947 (EC-01 gtag flag)
- FOUND: eaa887e (hashEmail utility)
- FOUND: 1d879cd (email hash pipeline)
