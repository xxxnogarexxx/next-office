# Testing Patterns

**Analysis Date:** 2026-02-25

## Test Framework

**Status:** No testing framework detected or configured

**Not Found:**
- Jest, Vitest, or other test runners not in `package.json`
- No test configuration files (`jest.config.js`, `vitest.config.ts`, etc.)
- No test dependencies (`@testing-library`, `@vitest`, `jest`, etc.)
- No `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files in codebase

**Implications:**
- Zero automated testing infrastructure
- All validation is manual or through staging/production environments
- API route validation happens via form submission testing only
- Component logic tested through visual inspection only

## Coverage

**Requirements:** None enforced

**View Coverage:** Not applicable

---

## Test Types

### Unit Tests
**Not Implemented**
- Utility functions (`cn()`, `getAllPosts()`, `getPostBySlug()`) have no test coverage
- No isolated function tests

### Integration Tests
**Not Implemented**
- API routes (`/api/leads`, `/api/lp-leads`, `/api/transit`, `/api/districts`) untested
- Database operations (Supabase inserts) validated only via live requests
- Email service integration (Resend) validated only via live sends

### E2E Tests
**Not Implemented**
- Form submissions tested only via manual interaction
- Page rendering untested
- No browser automation or headless testing

---

## Validation Patterns

**Server-Side Validation (API Routes):**

All validation happens in request handlers before database writes. Pattern from `src/app/(main)/api/leads/route.ts`:

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic field validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name und E-Mail sind erforderlich." },
        { status: 400 }
      );
    }

    // Email format validation (LP endpoint)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Ungültige E-Mail-Adresse." },
        { status: 400 }
      );
    }

    // Type coercion
    team_size: Number(body.team_size),

    // Fallback/coalescing
    const gclid = body.gclid || cookieStore.get("_no_gclid")?.value || null;

    // Database operation
    const { error: dbError } = await supabase.from("leads").insert({ ... });
    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json({ error: "..." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
}
```

**Client-Side Validation (Forms):**

HTML5 form validation + React state. Pattern from `src/components/lead-form.tsx`:

```typescript
// Required fields via HTML5
<Input
  id="lead_fullname"
  name="lead_fullname"
  placeholder="Max Mustermann"
  required
/>

// State-based error display
const [error, setError] = useState(false);

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setSubmitting(true);
  setError(false);

  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ /* form data */ }),
  });

  setSubmitting(false);

  if (!res.ok) {
    setError(true);
    return;
  }

  setSubmitted(true);
}

// Error UI
{error && (
  <p className="text-center text-sm text-error">
    Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
  </p>
)}
```

---

## Manual Testing Practices

**Form Testing (Lead Capture):**
- Test across both LP (`/api/lp-leads`) and main (`/api/leads`) endpoints
- Verify required fields block submission (browser native validation)
- Verify successful submit shows success state (`setSubmitted(true)`)
- Verify error state on HTTP error response
- Verify Supabase insert and Resend email both fire

**API Route Testing:**
- Use tools like Postman, curl, or browser DevTools
- Test valid payloads → expect 200 with `{ success: true }`
- Test missing required fields → expect 400 with error message
- Test invalid email format → expect 400 (LP only)
- Test Supabase connection failure → expect 500 with generic error
- Test Google Ads tracking fallback (client-side gclid → server-side cookie)

**Component Testing:**
- `PhotoGallery`: Click to open modal, verify Escape key closes, verify all photos render
- `LeadForm`: Verify different variants (sidebar, inline, dialog, contact) render differently
- `ListingPageClient`: Verify price display and CTA button for sidebar-only mode
- Password manager cleanup: Verify no layout shift from extension injections

**Migration/Integration Testing:**
- Verify Contentful import script (`scripts/import-contentful.ts`) produces correct Supabase schema
- Verify listings load correctly from Supabase (map, search, detail pages)
- Verify leads round-trip through Supabase and email notification
- Verify UTM/tracking data persists through form submission

---

## Observability for Testing

**Console Logging (Error Capture):**

All errors logged to server console with context:

```typescript
// Supabase errors
if (error) {
  console.error("Supabase insert error (lp-leads):", dbError);
  return NextResponse.json({ error: "..." }, { status: 500 });
}

// Resend errors (non-blocking)
resend.emails
  .send({ ... })
  .catch((err) => console.error("Resend error (lp-leads):", err));
```

**Browser DevTools:**
- Network tab: inspect request/response for API calls
- Console: check for client-side errors (password manager cleanup, hydration mismatches)
- Form state: inspect React component state via React DevTools extension

**Staging Testing:**
- Deploy to Vercel staging environment
- Test form submissions end-to-end
- Verify email notifications arrive
- Verify Supabase inserts appear in dashboard

---

## Future Testing Roadmap

**Recommended (Priority High):**
1. Unit tests for utility functions (`cn()`, blog parsing, city/listing data)
   - Framework: Vitest (lighter than Jest for Next.js)
   - Patterns: simple function mocking, snapshot tests for data structures

2. Integration tests for API routes
   - Framework: Vitest with `next/testing` or custom test utilities
   - Patterns: mock Supabase/Resend, test request/response cycle
   - Coverage: validation error paths, DB errors, successful inserts

3. Component testing for interactive elements
   - Framework: Vitest + React Testing Library
   - Patterns: render component, userEvent for clicks/input, assertions on DOM
   - Coverage: LeadForm (submit, error states), PhotoGallery (modal open/close), ListingPageClient (variant rendering)

**Recommended (Priority Medium):**
1. E2E tests for critical user journeys
   - Framework: Playwright or Cypress
   - Paths: Lead form → submission → success state, Map search → listing detail → contact form
   - Coverage: multi-step flows, real API calls

2. Visual regression testing
   - Tool: Chromatic or Percy
   - Scope: LeadDialog, ListingPageClient components across viewport sizes
   - Frequency: pre-deployment

**Optional (Priority Low):**
1. Performance testing (lighthouse, WebPageTest)
2. Accessibility testing (axe, manual audits)
3. Load testing for API routes (k6, Artillery)

---

## Notes on Current State

- **No CI/CD test gates:** Push to main without test validation
- **Risk:** Form logic changes untested; API validation bugs discoverable only in production
- **Quality gate:** Manual code review + staging testing only
- **Recommendation:** Add Vitest + basic unit + integration tests before v1.0 release; E2E tests deferred to v1.1

---

*Testing analysis: 2026-02-25*
