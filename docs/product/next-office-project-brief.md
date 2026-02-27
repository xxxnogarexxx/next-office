# next-office.io — Project Brief

## 1. Project Overview

| Field | Detail |
|-------|--------|
| **Name** | next-office.io |
| **Type** | Lead-generation marketplace for office spaces |
| **Geography** | DACH (Germany, Austria, Switzerland) |
| **Language** | German + English (multilingual, DE primary) |
| **Target audience** | B2B — companies searching for office space |
| **Revenue model** | Lead gen / provider commissions (free for searchers) |
| **Main competitor** | [coworkingguide.de](https://coworkingguide.de) |
| **Differentiator** | Broader scope (offices, not just coworking), modern Airbnb-style UX, interactive map, superior search/filters, targeting companies not freelancers |

---

## 2. What We're Building

A modern office-space finder for the DACH region. Companies visit the site, search by city/map, filter by their needs, browse listings, and submit a contact form. next-office.io earns commissions from office providers for qualified leads.

Think **Airbnb meets commercial real estate**: map-based browsing, card-style listings, clean filters, fast and beautiful.

---

## 3. Space Types

| Type | Priority | Description |
|------|----------|-------------|
| **Private offices** | Primary | Enclosed offices for teams (2–50+ people) |
| **Coworking spaces** | Secondary | Hot desks, dedicated desks in shared spaces (high volume of listings) |

> Note: The primary focus and value prop is private offices for companies. Coworking spaces provide listing volume and SEO traffic.

---

## 4. Core Features

### 4.1 MVP (Launch — Weeks 1–4)

- [ ] **Homepage** — Hero with search bar, featured cities, value proposition, testimonials, partner logos, lead form
- [ ] **Search page** (`/search` or `/[city]`) — Single page combining city directory + interactive map. Airbnb-style split-screen: two columns of listing cards on the left, interactive map with pins on the right. Filter bar at top. Clicking a city from homepage lands here filtered to that city.
- [ ] **Listing cards** — Photo, name, location, price range, capacity, key amenities
- [ ] **Listing detail page** — Modeled after [coworkingguide.de listing pages](https://coworkingguide.de/listing/haus-am-domplatz-hamburg-office-group): photo gallery (grid), key facts panel, amenities grid, pricing tiers, detailed description, location section, similar listings carousel. **Sticky lead sidebar** on the right that stays visible as user scrolls (desktop). Mobile: sticky bottom CTA bar.
- [ ] **Search & filters** — Filter by: location/city/radius, price range, team size/capacity, amenities
- [ ] **Context-aware lead form** — Fields: name*, email*, phone, start date*, team size (exact number input)*, message. When opened from a listing: listing is pre-filled (no city needed). When opened from homepage or general pages: city/area field is added. Form appears as sidebar on listing pages, as modal/inline on homepage.
- [ ] **Blog / content section** — Markdown-based articles for SEO (guides, city comparisons, office tips)
- [ ] **Multi-language** — Full DE/EN support with language switcher
- [ ] **Responsive design** — Mobile-first, works perfectly on all devices
- [ ] **SEO optimized** — Meta tags, structured data, sitemap, fast loading
- [ ] **Performance** — Page must load fast. Target: <1s LCP, 100 Lighthouse performance score. Use SSG where possible, optimize images, lazy-load map.

### 4.2 Post-MVP (Months 2–3)

- [ ] Provider self-signup (if needed)
- [ ] Advanced filters (lease term, furnished/unfurnished, pet-friendly, etc.)
- [ ] Comparison feature (compare 2–3 offices side by side)
- [ ] Saved searches / favorites (requires user accounts)
- [ ] Email notifications for new listings matching criteria
- [ ] Analytics dashboard (internal — track leads, conversions)
- [ ] Reviews / ratings

---

## 5. Pages & Sitemap

```
next-office.io/
├── / (Homepage — hero, search bar, featured cities, value prop, lead form)
├── /[city]/ (Search page — Airbnb split-screen: listing cards left + map right, filtered to city)
│   └── /[city]/[listing-slug] (Listing detail — gallery, facts, amenities, sticky lead sidebar)
├── /search (Search page — same layout as /[city]/ but unfiltered or custom filters)
├── /blog/ (Blog index)
│   └── /blog/[article-slug] (Individual article)
├── /about (About next-office.io)
├── /contact (General contact page)
├── /for-providers (Info page for office providers — "list your space")
├── /privacy (Datenschutz)
├── /imprint (Impressum)
└── /terms (AGB)
```

> **Note on city pages**: `/berlin`, `/muenchen`, `/hamburg`, `/frankfurt` are the search page pre-filtered to that city. They serve as both functional search pages AND SEO landing pages for "Büro [Stadt]" keywords. Same component, different data.

All pages available in `/de/` and `/en/` variants.

---

## 6. Design Direction

### Style
- **Reference**: Airbnb — map + cards layout, filter bar, clean listing pages
- **Vibe**: Modern, clean, trustworthy, professional
- **NOT**: Corporate/boring (like coworkingguide.de's dark blue corporate style)

### Key Design Patterns

**Search page (Airbnb-style):**
- Sticky filter bar at top of search results
- Split-screen: **two columns of listing cards on left**, interactive map on right (desktop)
- Card-based listings with large photos
- Map pins correspond to listings; hovering a card highlights its pin
- Smooth transitions and micro-interactions
- Clean typography, lots of white space
- Mobile: full-screen map toggle, stacked cards

**Listing detail page (coworkingguide.de-style):**
- Photo gallery grid at top (main image large, 3–4 thumbnails, "show all" button)
- Key facts panel below gallery (address, transit, size, floors, cancellation terms)
- Amenities icon grid
- Pricing tiers with CTAs
- Long-form description sections with headings
- Location section with map
- Similar listings carousel at bottom
- **Sticky lead sidebar** on the right — stays visible as user scrolls through content (desktop)
- Mobile: sticky bottom CTA bar ("Jetzt anfragen")

### Color Palette — Monochrome Minimal

Almost entirely black, white, and gray. One subtle accent color used sparingly for interactive elements only. Think Apple, Notion, Stripe.

```
BACKGROUNDS
  White           #FFFFFF     — main page background
  Surface         #F8FAFC     — card backgrounds, alternate sections
  Muted           #F1F5F9     — filter bar, input fields

BORDERS & DIVIDERS
  Border          #E2E8F0     — card borders, dividers, input borders
  Border hover    #CBD5E1     — hover state on inputs/cards

TEXT
  Primary         #09090B     — headings, important text (near-black)
  Body            #334155     — paragraph text, descriptions
  Muted           #94A3B8     — labels, placeholders, secondary info

INTERACTIVE (used sparingly)
  Accent          #2563EB     — links, selected filters, active states, map pins
  Accent hover    #1D4ED8     — link/button hover

BUTTONS
  Primary CTA     #09090B     — "Anfrage senden" / "Get in touch" (near-black, white text)
  Primary hover   #18181B     — CTA hover (slightly lighter)
  Secondary       #FFFFFF     — outline buttons (white bg, #09090B border)

STATUS
  Success         #16A34A     — form success, available
  Error           #DC2626     — form errors, validation
```

> **Principle**: Color is almost absent. The site feels like a premium magazine — lots of white, crisp black text, subtle gray cards. The blue accent (#2563EB) appears only on links, active filter chips, and map pins. CTAs are bold near-black buttons. This creates maximum contrast and lets listing photos be the color on the page.

### Typography

```
Font family:    Inter (Google Fonts, free, widely used)
                Fallback: system-ui, -apple-system, sans-serif

SCALE
  Hero heading:     48px / bold (700)    — homepage H1
  Page heading:     36px / bold (700)    — "Büros in Berlin"
  Section heading:  24px / semibold (600) — listing detail sections
  Card title:       18px / semibold (600) — listing card name
  Body:             16px / regular (400)  — paragraphs, descriptions
  Small:            14px / regular (400)  — labels, meta info, filters
  Caption:          12px / medium (500)   — badges, tags, footnotes

LINE HEIGHT
  Headings: 1.2
  Body:     1.6

LETTER SPACING
  Headings: -0.02em (slightly tight — modern feel)
  Body:     0 (default)
```

### Logo — NextOffice

Simple text wordmark. No icon/symbol needed.

```
NextOffice

  Font:     Inter
  Weight:   "Next" in regular (400), "Office" in bold (700)
  Color:    #09090B (near-black)
  Size:     ~24px in header

  On dark backgrounds: #FFFFFF (white)
```

> **Why no icon**: The name is short, recognizable, and reads well as pure text. An icon adds complexity for no gain at this stage. Can always add a mark later when the brand matures. Companies like Stripe, Linear, Notion all started with wordmarks.

---

## 7. Tech Stack

### Frontend
| Tool | Purpose | Why |
|------|---------|-----|
| **Next.js 14+** (App Router) | Framework | Best for SEO, fast, React-based, Vercel-native |
| **TypeScript** | Language | Type safety, better DX |
| **Tailwind CSS** | Styling | Rapid development, consistent design |
| **shadcn/ui** | UI components | Beautiful, accessible, customizable components |
| **Mapbox GL JS** or **Google Maps** | Interactive map | Airbnb uses Mapbox; both work well |
| **next-intl** | Internationalization | DE/EN language support |
| **MDX** | Blog content | Markdown + React components for articles |

### Backend / Data
| Tool | Purpose | Why |
|------|---------|-----|
| **Supabase** (PostgreSQL) | Database | Free tier, real-time, auth if needed later, PostGIS for geo queries |
| **Supabase Storage** or **Cloudinary** | Image hosting | Listing photos, optimized delivery |

### Hosting / Infrastructure
| Tool | Purpose | Cost |
|------|---------|------|
| **Vercel** | Hosting & deployment | Free tier → ~$20/mo at scale |
| **Supabase** | Database | Free tier → ~$25/mo at scale |
| **Mapbox** | Maps | Free up to 50k loads/mo |
| **GitHub** | Code repository (private) | Free |
| **next-office.io** | Domain | ~€15–30/year |

### Estimated Monthly Cost
- **At launch**: ~€0–20/mo (free tiers)
- **At scale**: ~€50–150/mo

---

## 8. Data & Listings

### Data Model — Office Listing

```
Listing {
  id
  name
  slug
  description (DE + EN)
  type: "private_office" | "coworking"

  // Location
  city
  country
  address
  postal_code
  latitude
  longitude

  // Details
  capacity_min
  capacity_max
  price_from (EUR/month)
  price_to (EUR/month)
  area_sqm

  // Amenities (boolean flags)
  wifi
  parking
  kitchen
  meeting_rooms
  twenty_four_seven_access
  reception
  furnished
  accessible
  bike_storage
  shower
  phone_booths
  event_space

  // Media
  photos[] (URLs)
  cover_photo

  // Provider
  provider_name
  provider_website
  provider_email
  provider_phone

  // Meta
  status: "active" | "draft" | "archived"
  created_at
  updated_at
  featured: boolean
}
```

### Data Sources (phased)
1. **Phase 1**: Manual entry — add 50–100 listings in key cities to launch
2. **Phase 2**: Scrape/import — enrich with data from existing directories
3. **Phase 3**: Provider outreach — office providers submit listings via contact

### Key Launch Cities

**MVP launch (4 cities only):**

| Country | Cities |
|---------|--------|
| Germany | Berlin, Munich, Hamburg, Frankfurt |

**Post-launch expansion** (add as listings grow):
- Germany: Cologne, Düsseldorf, Stuttgart, Leipzig, Hannover, Nuremberg
- Austria: Vienna, Graz, Salzburg
- Switzerland: Zurich, Geneva, Basel, Bern

---

## 9. Lead Capture & Business Logic

### Lead Form Fields

**Always shown:**
- Name *
- Email *
- Phone
- Start date / Move-in date *
- Team size (exact number — free input field, not dropdown) *
- Message (free text)

**Context-dependent:**
- City / desired area * — **only shown when the click path doesn't already provide this info** (e.g., form on homepage, /contact page). Not shown when form is on a listing detail page or city-filtered search page.

> **Design note:** On listing pages, the form is a **sticky sidebar** (right side, scrolls with user). It knows which listing the user is viewing. On the homepage, the form is inline or triggered by CTA. Keep fields minimal to maximize conversion.

### Lead Flow
1. **From listing page** (primary source — most leads): User browses listing → fills sticky sidebar form → lead is tagged with listing ID + city
2. **From homepage / general**: User fills form with city field → lead is unmatched, admin handles manually
3. Lead submitted → stored in database + instant email notification to admin
4. Admin reviews lead → matches with suitable providers
5. Provider receives lead → provider pays commission on successful deal

### Lead Notifications
- Email to admin on every new lead (via Supabase webhook + n8n or Resend)
- Weekly summary email with lead stats

---

## 10. SEO Strategy

### Technical SEO
- Server-side rendering (Next.js SSR/SSG)
- Clean URLs (`/berlin/office-name-slug`)
- Structured data (LocalBusiness, Product schema)
- XML sitemap (auto-generated)
- Meta titles/descriptions per page
- Image optimization (next/image)
- Core Web Vitals optimized

### Content SEO
- City landing pages targeting "[city] + Büro mieten" / "office rental [city]"
- Blog articles targeting informational queries
- Example topics:
  - "Die besten Büros in Berlin 2026"
  - "Coworking vs. eigenes Büro — Was lohnt sich?"
  - "Büro mieten in München: Der ultimative Guide"
  - "Flexible Office Trends in der DACH-Region"

### Target Keywords (DE)

**Primary focus — "Büro" keywords (main SEO priority):**
- Büro [Stadt] (e.g., "Büro Berlin", "Büro München")
- Büro mieten [Stadt]
- Büro mieten
- Büros [Stadt]

**Secondary keywords:**
- Office Space [Stadt]
- Flexible Büros [Stadt]
- Bürogemeinschaft [Stadt]

**Tertiary (for coworking listing volume / traffic):**
- Coworking Space [Stadt]
- Shared Office [Stadt]

> **Strategy**: The main keyword focus is **"Büro"** — not coworking or shared office. City landing pages target "Büro [Stadt]" as H1 and primary meta. Coworking-related keywords are captured through individual listing pages and blog content.

---

## 11. Timeline & Milestones

### Week 1: Foundation
- [ ] Buy domain next-office.io
- [ ] Create GitHub account + private repo
- [ ] Set up Next.js project with TypeScript + Tailwind
- [ ] Set up Supabase database with listing schema
- [ ] Design system: colors, typography, components
- [ ] Homepage layout

### Week 2: Core Features
- [ ] Search/listing page with filters
- [ ] Interactive map integration
- [ ] Listing detail page
- [ ] Contact/lead form (functional, stores in DB)
- [ ] Responsive design (mobile)

### Week 3: Content & Data
- [ ] City landing pages (template + 3–5 cities)
- [ ] Blog setup (MDX)
- [ ] Write 2–3 launch articles
- [ ] Add 30–50 initial listings (manual data entry)
- [ ] DE/EN language setup

### Week 4: Polish & Launch
- [ ] SEO setup (meta, sitemap, structured data)
- [ ] Legal pages (Impressum, Datenschutz, AGB)
- [ ] Lead notification emails
- [ ] Performance optimization
- [ ] Deploy to Vercel
- [ ] Launch! 🚀

---

## 12. Setup Checklist (for Szymon)

### Accounts to Create
- [ ] **GitHub** account → github.com (free)
- [ ] **Vercel** account → vercel.com (free, connect with GitHub)
- [ ] **Supabase** account → supabase.com (free tier)
- [ ] **Mapbox** account → mapbox.com (free tier) OR use Google Maps
- [ ] **Domain**: Buy next-office.io (check availability on Namecheap, Cloudflare, or Google Domains)

### Local Development Setup
- [ ] Install **Node.js** (v20+) → nodejs.org
- [ ] Install **VS Code** → code.visualstudio.com (code editor)
- [ ] Install **Git** → comes with macOS, verify with `git --version`
- [ ] Clone repository and run `npm install` + `npm run dev`

### Your Friend's Tips — Explained
| Tip | What it means |
|-----|---------------|
| "Create GitHub account and connect it" | GitHub stores your code in the cloud. Vercel connects to it and auto-deploys when you push changes. |
| "Create repository on private" | A repository = your project's folder on GitHub. "Private" means only you can see the code. |
| "Next.js or React Native" | **Next.js = websites** (what we need). React Native = mobile apps (not needed). |
| "Two folders" | Not needed — we're going with Next.js only since you need a website, not a mobile app. |

---

## 13. Open Decisions

- [x] ~~**Domain availability**~~: next-office.io is available — buy it
- [x] ~~**Color palette**~~: Monochrome minimal — near-black, white, slate grays, blue accent (#2563EB) for links/interactive only
- [x] ~~**Logo**~~: "NextOffice" wordmark — Inter font, "Next" regular + "Office" bold, #09090B
- [ ] **Map provider**: Mapbox (free up to 50k loads, better styling) vs Google Maps (more familiar, costs sooner)
- [ ] **Legal entity**: Who operates the site? (needed for Impressum)
- [ ] **Initial listing data**: Source for first 50–100 listings in Berlin, Munich, Hamburg, Frankfurt

---

## 14. Inspiration & References

- **UX model**: [Airbnb](https://airbnb.com) — map + cards, filter bar, listing pages
- **Business model**: [coworkingguide.de](https://coworkingguide.de) — lead gen, city pages, provider commissions
- **Also worth studying**:
  - [WeWork](https://wework.com) — office listing presentation
  - [Spacious](https://spacious.com) — clean office search UX
  - [Regus/IWG](https://regus.com) — filtering and search patterns
