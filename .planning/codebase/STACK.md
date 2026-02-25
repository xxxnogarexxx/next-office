# Technology Stack

**Analysis Date:** 2026-02-25

## Languages

**Primary:**
- TypeScript 5 - All source code, configurations, and type definitions
- JavaScript (JSX/TSX) - React components and Next.js pages

**Secondary:**
- JSON - Data fixtures (cities, listings), configuration

## Runtime

**Environment:**
- Node.js (version specified in `.nvmrc` or inferred from Next.js 16 requirements, typically 18.17+)

**Package Manager:**
- npm (inferred from monorepo structure)
- Lockfile: `package-lock.json` (assumed, follows npm convention)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router, SSR, API routes
- React 19.2.3 - UI library
- React DOM 19.2.3 - React rendering for web

**UI & Styling:**
- Tailwind CSS 4 - Utility-first CSS framework (via `@tailwindcss/postcss`)
- PostCSS 4 - CSS transformations (configured in `postcss.config.mjs`)
- Tailwind Merge 3.4.0 - Utility class conflict resolution
- Tailwind Typography 0.5.19 - Markdown/prose styling
- Class Variance Authority 0.7.1 - Component variant generation

**Component Libraries:**
- Radix UI 1.4.3 - Headless UI primitives
- Lucide React 0.563.0 - Icon library
- shadcn 3.8.4 - CLI for component generation (dev dependency)

**Mapping:**
- Mapbox GL 3.18.1 - Map rendering engine and vector tiles
- react-map-gl 8.1.0 - React wrapper for Mapbox GL

**Content & Rendering:**
- react-markdown 10.1.0 - Markdown-to-React parser (blog posts)
- gray-matter 4.0.3 - YAML frontmatter parser (blog metadata extraction)

**Utilities:**
- clsx 2.1.1 - Conditional class name concatenation

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.95.3 - Database client and BaaS (leads table, critical for lead capture)
- resend 6.9.2 - Email service provider (lead notification emails to brokers)
- mapbox-gl 3.18.1 - Map rendering (property search/browsing experience)

**Infrastructure:**
- next 16.1.6 - Framework (handles routing, API routes, middleware, image optimization)

## Configuration

**Environment:**
- Next.js `.env.local` file (note: existence confirmed, contents not examined per security policy)
- Environment variables injected at build time for:
  - Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
  - Resend API key (`RESEND_API_KEY`)
  - Mapbox token (`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`)
  - Google Ads/GA4 tracking IDs (see INTEGRATIONS.md)
  - Notification email address (`NOTIFICATION_EMAIL`)

**Build:**
- `next.config.ts` - Next.js build configuration (remote image patterns for Unsplash, Contentful)
- `tsconfig.json` - TypeScript compiler options (strict mode, path aliases `@/*` → `./src/*`)
- `eslint.config.mjs` - ESLint configuration (Next.js core web vitals, TypeScript support)
- `postcss.config.mjs` - PostCSS configuration (Tailwind CSS plugin)

## Platform Requirements

**Development:**
- Node.js 18.17+ or 20+ (inferred from Next.js 16 compatibility)
- npm 9+ or yarn 3+
- No external build tools required (Next.js handles compilation)

**Production:**
- Node.js 18.17+ or 20+
- Deployment targets: Vercel (native), or any Node.js-compatible host (Docker, self-hosted)
- No SSR-incompatible code detected; full static export possible for pure marketing pages

---

*Stack analysis: 2026-02-25*
