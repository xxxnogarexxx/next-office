# Coding Conventions

**Analysis Date:** 2026-02-25

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension (e.g., `PhotoGallery.tsx`, `LeadDialog.tsx`)
- Pages: lowercase with hyphens (e.g., `page.tsx` in route directories per Next.js convention)
- API routes: `route.ts` in `[path]/api/` directories (Next.js App Router)
- Utilities: lowercase with hyphens (e.g., `blog.ts`, `map-config.ts`)
- UI components: lowercase with hyphens in `src/components/ui/` (e.g., `button.tsx`, `input.tsx`)
- Type definitions: `types.ts` at module level (e.g., `src/lib/types.ts`, `src/lib/lp/types.ts`)

**Functions:**
- Exported components: PascalCase (e.g., `function PhotoGallery()`, `export function LeadDialog()`)
- Utility functions: camelCase (e.g., `getAllPosts()`, `getPostBySlug()`, `cn()`)
- Event handlers in components: `handle` prefix + action name (e.g., `handleSubmit()`, `openContact()`)
- Async operations: camelCase with optional `Async` suffix (e.g., `handleSubmit` calls async endpoint)

**Variables:**
- Constants: UPPER_SNAKE_CASE for module-level constants (e.g., `TRACKING_KEYS`, `BLOG_DIR`, `MAX_AGE`)
- Regular variables: camelCase (e.g., `isOpen`, `mounted`, `formRef`)
- React state: camelCase from `useState` (e.g., `const [submitted, setSubmitted]`)
- Props interfaces: PascalCase with `Props` suffix (e.g., `ListingPageClientProps`, `PhotoGalleryProps`)

**Types:**
- Interfaces: PascalCase without suffix (e.g., `interface Listing`, `interface City`, `interface BlogPost`)
- Type aliases: PascalCase (e.g., `type OfficeOffer`)
- Union types: PascalCase (e.g., `"sidebar" | "inline" | "contact" | "dialog"`)

## Code Style

**Formatting:**
- ESLint configured in `eslint.config.mjs` with Next.js core web vitals + TypeScript support
- No Prettier config detected; ESLint is primary linter
- Line length: unbounded in codebase (HTML templates and long strings observed)
- Indentation: 2 spaces (inferred from existing code)
- String quotes: double quotes preferred (observed in all source files)
- Trailing semicolons: present in all statements (semi-standard TypeScript style)

**Linting:**
- ESLint 9 with flat config format (`eslint.config.mjs`)
- Extends: `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts` (see `eslint.config.mjs`)
- No pre-commit hooks observed; linting is manual (`npm run lint`)

## Import Organization

**Order:**
1. React/Next.js built-ins (`import { useState } from "react"`, `import Image from "next/image"`)
2. Third-party libraries (`import matter from "gray-matter"`, `import { Button } from "@/components/ui/button"`)
3. Project-relative imports (`import type { Listing } from "@/lib/types"`)
4. No blank line separators observed; imports grouped by category without explicit lines

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- All relative imports use `@/` instead of `../` (observed in all components and pages)
- Example: `import { LeadForm } from "@/components/lead-form"`

## Error Handling

**Patterns:**
- API routes: try-catch wrapping entire handler, return `NextResponse.json()` with error message + HTTP status
- Example from `src/app/(main)/api/leads/route.ts`:
  ```typescript
  try {
    // validation logic
    if (!body.name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    // database operations
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  ```
- Client components: try-catch with state flag (e.g., `const [error, setError] = useState(false)`)
- Fire-and-forget promises: `.catch()` with console.error (email notifications, tracking)
- No custom error classes; generic Error objects used

## Logging

**Framework:** `console` (no logging library detected)

**Patterns:**
- Server-side: `console.error()` only, no info/warn/debug observed
- Scope: prefixed error logs with operation context (e.g., `"Supabase insert error:"`, `"Resend error (lp-leads):"`)
- Client-side: no console logging observed in components
- Example from `src/app/(lp)/api/lp-leads/route.ts`:
  ```typescript
  if (dbError) {
    console.error("Supabase insert error (lp-leads):", dbError);
    return NextResponse.json({ error: "Fehler beim Speichern." }, { status: 500 });
  }
  resend.emails.send(...).catch((err) => console.error("Resend error (lp-leads):", err));
  ```

## Comments

**When to Comment:**
- Function/component JSDoc blocks for complex logic or API contracts
- Inline comments for non-obvious business logic (e.g., tracking ID fallback patterns, extension cleanup)
- Section headers as comment blocks (e.g., `/* Header */`, `/* Fullscreen gallery overlay */`)

**JSDoc/TSDoc:**
- Used selectively for API route handlers
- Example from `src/app/(lp)/api/lp-leads/route.ts`:
  ```typescript
  /**
   * LP-specific lead submission endpoint.
   *
   * Accepts structured inquiry data...
   * Google Ads tracking: reads gclid/gbraid/wbraid from request body...
   */
  export async function POST(request: Request) { ... }
  ```
- Components: no JSDoc observed; interfaces document expected props

## Function Design

**Size:**
- Small functions preferred (50-100 lines typical)
- Larger components factored by rendering logic (e.g., `PhotoGallery` has conditional return branches for different modes)
- Server-side handlers: 100-175 lines acceptable for validation + DB + email logic

**Parameters:**
- Components destructure props inline (e.g., `function Button({ className, variant, size, asChild, ...props })`)
- Utility functions: single parameter or explicit destructuring (e.g., `getAllPosts()` returns all, `getPostBySlug(slug)` filters)
- Handler functions: event object + form data extraction pattern

**Return Values:**
- React components: JSX (always)
- Utility functions: explicit return type or inferred (e.g., `BlogPost[]`, `BlogPost | undefined`)
- API routes: `NextResponse.json()` with `{ success: true }` or `{ error: string }` and HTTP status

## Module Design

**Exports:**
- Named exports for components (e.g., `export function PhotoGallery() {}`)
- Named exports for utilities (e.g., `export function getAllPosts()`, `export function cn()`)
- Type exports (e.g., `export interface Listing`, `export type OfficeOffer`)
- Default exports: not observed in codebase

**Barrel Files:**
- Not extensively used; direct path imports preferred
- Example: `import { Button } from "@/components/ui/button"` instead of `import { Button } from "@/components/ui"`

## Conditional Rendering

**Patterns:**
- Ternary operators for boolean conditions (e.g., `{isOpen ? <FullscreenGallery /> : null}`)
- Guard clauses: `if (condition) return null;` early in components
- Inline conditionals: `{condition && <Component />}`
- Short-circuit: common for optional text (e.g., `{listingName && <p>{listingName}</p>}`)

## Client/Server Separation

**Use Client:**
- `"use client"` at top of interactive components (e.g., `PhotoGallery`, `LeadForm`, `ListingPageClient`)
- Components with hooks (`useState`, `useEffect`, `useRef`)
- Event handlers and form submissions

**Server Components:**
- Page components (in `app/` directories) default to server
- Layout components
- Data fetching for pages
- API routes (always server-side)

## Class Naming (CSS)

**Style Classes:**
- Tailwind utility classes throughout (e.g., `className="flex items-center gap-3"`)
- Custom CSS: minimal; no SCSS/SASS observed
- Variants via CVA (Class Variance Authority) in component libraries (see `src/components/ui/button.tsx`)
- Pattern: `cn()` utility merges Tailwind classes (handles conflicts with `tailwind-merge`)

---

*Convention analysis: 2026-02-25*
