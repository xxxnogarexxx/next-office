# Google Ads Automation Tool — GSD Input Brief

> Input document for GSD **new-project** planning. Captures business context, requirements, and technical decisions from discovery discussion (2026-02-26).

## What This Is

A custom Google Ads automation tool for next-office.io — a B2B coworking brokerage for the German market. **Standalone project** with its own repo and `.planning/` structure. Connects to the shared Supabase instance (same as next-office.io and the upcoming CRM). No external SaaS. The tool automates campaign management, reporting, and optimization with LLM-powered intelligence, while keeping the human in the loop for budget decisions.

## Project Setup

- **Location:** `projects/next-office/project-gads-tool/` (own `.planning/`, subproject of next-office)
- **Shared infra:** Supabase (same instance as next-office.io and future CRM)
- **Related projects:** next-office.io (landing pages, lead capture), CRM (lead stages, offline conversions)
- **GSD command:** `/gsd:new-project`

## Core Value

**See what works, stop what doesn't, scale what converts — automatically.** The tool must answer: which combination of city × office type × keyword × ad copy produces signed leases at an acceptable cost? And then act on that knowledge.

## Business Context

### The Business
- B2B coworking brokerage — connects businesses with office space providers in Germany
- Free service for customers, commission from providers
- Two domains: coworking-guide.de (existing, narrower) and next-office.io (new, broader positioning)
- This tool is for next-office.io

### Lead Funnel
```
Google Ad Click
  → Landing page (next-office.io/lp/[city])
    → User fills out form (name, email, phone, team size, start date, city)
      → Email notification to broker team
        → Manual CRM entry (will be automated — new CRM in development)
          → Qualification call/email (is this a real inquiry?)
            → Source offers from partner spaces
              → Send offers to customer
                → Organize tour/inspection
                  → Customer signs lease
```

**Key conversion events:**
1. Form submission (Google sees this today)
2. Qualified lead (confirmed real inquiry)
3. Offers sent
4. Tour booked
5. Lease signed (~10%+ of qualified leads)

**Timeline:** Highly variable — 2 days to 12 months depending on urgency.

### Current Google Ads Setup
- **Experience:** Has run campaigns on coworking-guide.de as tests, €1,000-2,000/month
- **Structure:** 1 campaign per city, 1 ad group per office type (coworking, private office, team office)
- **Keywords:** Exact match only. Generic ("coworking München"), specific ("team büro mieten München"), some neighborhood-level
- **Cities:** Munich, Frankfurt, Hamburg, Berlin primarily. Cologne, Düsseldorf, Stuttgart secondary. Focus on big cities where large providers operate
- **CPC:** €4-6 per click (capped)
- **Problem:** Conversion tracking was broken — no reliable performance data from previous campaigns
- **Budget philosophy:** Performance-driven — spend scales with profitability, no fixed ceiling

### Current Pain Points
- Everything is manual: ad copy writing, keyword selection, campaign setup, reporting
- Uses AI as an aid for copy but enters everything by hand
- Cannot see what works — which ad/keyword/city combinations produce actual business
- Conversion tracking not functional — spending blind
- No automated reporting or performance visibility

### What the Founder Wants
1. **Automated system** that runs campaigns without manual intervention
2. **Clear visibility** into what works (which combinations of ads, settings, keywords produce results)
3. **Clean reporting/dashboard** — the #1 frustration with Google Ads is not being able to see what's happening
4. **Ability to intervene** — autopilot with a steering wheel
5. **Budget recommendations with one-click approval** — system recommends, human confirms

## Requirements

### Must Have (MVP)

**Tracking & Attribution**
- Fix conversion tracking end-to-end (form submission → Google Ads)
- Store gclid with every lead in Supabase (already partially done)
- Offline conversion pipeline: when lead status changes in CRM → upload conversion to Google Ads with original gclid
- Multi-stage conversion tracking: form submit, qualified, offer sent, tour booked, signed

**Reporting Dashboard**
- Performance overview: spend, clicks, impressions, conversions by campaign/city
- Keyword performance: which keywords convert, which waste money
- Ad copy performance: which headlines/descriptions perform best
- Cost per lead and cost per qualified lead by city
- Trend visualization: daily/weekly/monthly performance over time
- Search term report: what people actually searched for

**Campaign Automation**
- Auto-create campaigns for new cities (city × office type matrix)
- LLM-generated ad copy (RSA headlines and descriptions) per city × office type
- Keyword management: add, pause, adjust match types
- Search term mining: auto-classify search terms → add negatives, promote good terms to keywords
- Auto-pause keywords with high spend and zero conversions

**Budget & Bid Management**
- Budget pacing alerts (over/under-spending)
- Budget reallocation recommendations (shift money to what converts)
- One-click approval UI for budget changes
- Auto-pause campaigns burning money with no results (after approval)

### Should Have (Post-MVP)

- Neighborhood-level keyword expansion (tool identifies opportunities, dev team builds matching landing pages)
- Ad copy A/B testing framework with statistical significance tracking
- Competitor keyword monitoring
- Quality Score tracking over time
- Seasonal pattern detection and preemptive budget adjustment
- Daily email digest with LLM-generated performance summary
- Automated landing page matching (route keywords to best-matching LP)

### Won't Have (Out of Scope)

- Multi-platform (Meta, Bing) — Google Ads only for now
- Display/Video campaigns — Search only
- Google Shopping / Performance Max
- Multi-account management (only next-office.io)
- White-label / reselling the tool

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Build vs Buy | Build own tool | Single account, technical founder, full control, LLM integration |
| API client | `google-ads-api` (npm, Opteo) | Node.js, fits Next.js stack, actively maintained |
| LLM provider | Claude or GPT-4o-mini | Cost-effective for classification/copy tasks |
| Data storage | Supabase | Same DB as leads — can join ad data with lead outcomes |
| Scheduling | Vercel Cron + Google Ads Scripts | Scripts for simple rules, Cron for complex LLM-powered jobs |
| Dashboard | Built into Next.js admin | No separate tool, integrated experience |
| Budget changes | Recommend + one-click approve | Human-in-the-loop for spend decisions |
| Starting match type | Exact match | Controlled spend while learning, expand later |
| Campaign structure | City × office type | Matches existing approach, automatable matrix |

## Architecture Overview

```
next-office.io (Next.js)
├── /app/admin/ads/              # Dashboard UI
│   ├── dashboard/               # Performance overview
│   ├── campaigns/               # Campaign management
│   ├── keywords/                # Keyword management + search terms
│   ├── ads/                     # Ad copy management + generator
│   ├── conversions/             # Funnel stage tracking
│   └── recommendations/         # Budget/optimization suggestions (approve/reject)
├── /app/api/ads/                # API routes
│   ├── report/                  # Pull performance data via Google Ads API
│   ├── campaigns/               # CRUD campaigns
│   ├── keywords/                # CRUD keywords
│   ├── ads/                     # CRUD ad copy
│   ├── search-terms/            # Search term analysis
│   ├── conversions/upload/      # Offline conversion upload
│   └── recommendations/         # Generate + execute recommendations
├── /lib/google-ads/             # Google Ads API client layer
│   ├── client.ts                # Authenticated client singleton
│   ├── reports.ts               # GAQL query builders
│   ├── mutations.ts             # Campaign/keyword/ad mutations
│   └── types.ts                 # TypeScript types
├── /lib/ads-ai/                 # LLM-powered intelligence
│   ├── copy-generator.ts        # Ad copy generation (city × office type)
│   ├── search-term-classifier.ts # Classify search terms (negative/promote/monitor)
│   ├── performance-analyzer.ts  # Weekly analysis + recommendations
│   └── keyword-researcher.ts    # Keyword expansion suggestions
└── /cron/                       # Scheduled automation jobs
    ├── daily-sync.ts            # Pull latest performance data → Supabase
    ├── search-term-mining.ts    # Weekly search term classification
    ├── conversion-upload.ts     # Upload offline conversions from CRM
    └── performance-digest.ts    # Weekly email summary
```

## Technical Foundation (Already in Place)

These components exist in the next-office.io codebase and will be built upon:

- gclid/gbraid/wbraid cookie tracking via middleware (`src/middleware.ts`)
- UTM parameter capture in LP tracking provider (`src/components/lp/tracking/lp-tracking-provider.tsx`)
- GA4 + Google Ads gtag.js injection (`src/components/lp/tracking/gtm-script.tsx`)
- Conversion tracking on thank-you page (`src/app/(lp)/lp/[city]/danke/conversion-tracker.tsx`)
- Scroll/time engagement tracking (`src/components/lp/tracking/use-scroll-tracking.ts`)
- Lead capture → Supabase with attribution fields (gclid, gbraid, wbraid, landing_page, referrer)
- Env var validation with placeholder detection (`src/lib/env.ts`)
- Dual lead API routes: main site + LP (consolidation planned)

## Prerequisites (Before Build)

- [ ] Google Cloud project with Google Ads API enabled
- [ ] OAuth 2.0 credentials (Web application type)
- [ ] Google Ads developer token (Google Ads → Tools → API Center)
- [ ] Generate refresh token via OAuth flow
- [ ] Set real GOOGLE_ADS_CONVERSION_ID and CONVERSION_LABEL in production env
- [ ] Fix existing conversion tracking (currently broken)
- [ ] New CRM with gclid storage and lead stage tracking (parallel project)

## Dependencies

- **CRM project**: Offline conversion upload requires the new CRM to track lead stages and store gclid. The ads tool can be built without it, but the highest-ROI feature (offline conversions) depends on it.
- **Landing pages**: The tool can identify keyword opportunities that need new landing pages. Dev team builds them separately.
- **Launch readiness milestone**: The current v1.0 milestone fixes security, performance, and tracking issues. Some of these (especially conversion tracking fixes) are prerequisites.

## Success Criteria

1. **Can answer "what works?"** — Dashboard shows conversion data by city × keyword × ad copy
2. **Campaigns run without manual work** — New city = auto-generated campaigns, keywords, ads
3. **Money isn't wasted** — Search terms are automatically mined, negatives added, bad keywords paused
4. **Offline conversions flow back** — Google knows which clicks became signed leases
5. **Budget decisions are informed** — System recommends reallocation, founder approves with one click
6. **Reporting is clean** — Weekly performance visible at a glance, no digging through Google Ads UI

---
*Created: 2026-02-26*
*Status: Ready for GSD milestone planning*
