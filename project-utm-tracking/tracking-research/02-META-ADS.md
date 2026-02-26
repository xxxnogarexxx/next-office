# Meta/Facebook Ads Tracking — Production Research

**Domain:** B2B coworking brokerage (next-office.io) with offline conversion attribution
**Researched:** 2026-02-25
**Stack:** Next.js 16 (App Router), React 19, Supabase, Vercel

---

## 1. System Architecture Overview

```
                          USER JOURNEY
    ┌──────────────────────────────────────────────────────┐
    │  Facebook/Instagram Ad Click                          │
    │  URL: next-office.io/berlin?fbclid=ABC123             │
    └────────────────────┬─────────────────────────────────┘
                         │
    ┌────────────────────▼─────────────────────────────────┐
    │  NEXT.JS MIDDLEWARE (Edge)                             │
    │  1. Extract fbclid from URL params                     │
    │  2. Generate _fbc cookie (fb.1.{timestamp}.{fbclid})   │
    │  3. Read or generate _fbp cookie                       │
    │  4. Store fbclid + gclid in first-party cookies        │
    └────────────────────┬─────────────────────────────────┘
                         │
    ┌────────────────────▼─────────────────────────────────┐
    │  LANDING PAGE (Client)                                 │
    │  ├── Meta Pixel fires PageView (with event_id)         │
    │  ├── User submits lead form → fires Lead event         │
    └────────────┬───────────────────────┬─────────────────┘
                 │                       │
    ┌────────────▼────────┐  ┌───────────▼─────────────────┐
    │  META PIXEL          │  │  CAPI (Server-Side)          │
    │  (Browser → Meta)    │  │  Next.js Route Handler       │
    │  (ad-blocker-prone)  │  │  (ad-blocker-resilient)      │
    └──────────┬───────────┘  └───────────┬─────────────────┘
               │    DEDUPLICATION          │
               └──────────┬───────────────┘
                          ▼
              META EVENTS MANAGER

              ... DAYS / WEEKS LATER ...

    ┌─────────────────────────────────────────────────────────┐
    │  OFFLINE CONVERSION (Contract Signing)                    │
    │  Admin marks lead as "contract_signed"                    │
    │  ├── Cron job fires                                       │
    │  ├── Sends event via CAPI: action_source: system_generated│
    │  ├── Matches via: fbc, email, phone, external_id          │
    │  └── Event name: "Purchase"                               │
    └─────────────────────────────────────────────────────────┘
```

### Three-Layer Redundancy

| Layer | What | Resilience |
|-------|------|-----------|
| **Meta Pixel** (browser) | Standard events client-side | Blocked by ad blockers |
| **Conversions API** (server) | Mirrors Pixel events server-side | Bypasses ad blockers |
| **Offline Conversions** (server) | Reports contract signings | Fully server-side |

---

## 2. FBCLID Capture & Storage

### 2.1 Cookie Formats

**_fbc (Facebook Click ID Cookie)**
- Format: `fb.{subdomainIndex}.{creationTime}.{fbclid}`
- Example: `fb.1.1708876800000.IwAR3X8Kj2mNpQ7xYz`
- Expiration: **90 days**
- Generated when: fbclid is present in URL params

**_fbp (Facebook Browser ID Cookie)**
- Format: `fb.{subdomainIndex}.{creationTime}.{randomNumber}`
- Example: `fb.1.1596403881668.1116446470`
- Expiration: **90 days** (refreshed by Pixel on each visit)
- Generated when: Meta Pixel loads on any page
- Purpose: Ties server events to correct browser session

### 2.2 Middleware Implementation

```typescript
const fbclid = url.searchParams.get('fbclid');
if (fbclid) {
  const fbc = `fb.1.${Date.now()}.${fbclid}`;
  response.cookies.set('_fbc', fbc, {
    maxAge: 90 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
    secure: true,
    httpOnly: false, // Must be readable by Meta Pixel JS
  });
  response.cookies.set('fbclid', fbclid, {
    maxAge: 90 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
    secure: true,
    httpOnly: true,
  });
}
```

### 2.3 Time Windows

| Aspect | Window |
|--------|--------|
| _fbc cookie lifetime | 90 days |
| _fbp cookie lifetime | 90 days (refreshed) |
| CAPI event_time acceptance (website) | Up to **7 days** old |
| Offline event upload deadline | Up to **62 days** after event |
| Offline attribution lookback | **90 days** from click/view |
| Deduplication window (Pixel vs CAPI) | **48 hours** same event_id + event_name |
| Optimal upload latency | Within **48 hours** |

---

## 3. Meta Pixel Implementation

### 3.1 Next.js App Router Setup

```typescript
// src/components/analytics/MetaPixel.tsx
'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, Suspense } from 'react';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID!;

function MetaPixelPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (typeof window.fbq === 'function') window.fbq('track', 'PageView');
  }, [pathname, searchParams]);
  return null;
}

export function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: `
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
          n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
          s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${META_PIXEL_ID}');fbq('track','PageView');
        ` }} />
      <Suspense fallback={null}><MetaPixelPageTracker /></Suspense>
    </>
  );
}
```

### 3.2 Standard Events for Lead Funnel

| Stage | Event | When |
|-------|-------|------|
| Page load | `PageView` | Every page/SPA navigation |
| City page view | `ViewContent` | User views city listing |
| Lead form open | Custom: `InitiateContact` | User opens form |
| Lead form submit | `Lead` | User submits form |
| Contract signed | `Purchase` (offline) | Admin marks contract |

### 3.3 Dual-Fire with Deduplication

```typescript
export async function trackMetaEvent(options: { eventName: string; customData?: Record<string, unknown>; userData?: { email?: string; phone?: string } }): Promise<string> {
  const eventId = crypto.randomUUID();
  const eventTime = Math.floor(Date.now() / 1000);

  // 1. Client-side Pixel (may be blocked)
  if (typeof window.fbq === 'function') {
    window.fbq('track', options.eventName, options.customData ?? {}, { eventID: eventId });
  }

  // 2. Server-side CAPI (ad-blocker resilient)
  await fetch('/api/meta/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name: options.eventName,
      event_id: eventId,
      event_time: eventTime,
      event_source_url: window.location.href,
      custom_data: options.customData,
      user_data: options.userData,
    }),
  }).catch(console.error);

  return eventId;
}
```

---

## 4. Conversions API (CAPI)

### 4.1 Endpoint

```
POST https://graph.facebook.com/v21.0/{PIXEL_ID}/events?access_token={ACCESS_TOKEN}
```

Pin the Graph API version (v21.0). Do not use "latest".

### 4.2 user_data Parameters

**Hashed (SHA-256, normalized):**

| Key | Field | Normalization |
|-----|-------|--------------|
| `em` | Email | Lowercase, trim |
| `ph` | Phone | Digits only with country code (E.164) |
| `fn` | First name | Lowercase, trim, remove non-letter chars |
| `ln` | Last name | Lowercase, trim, remove non-letter chars |
| `external_id` | Internal ID | Hashing recommended |

**NOT hashed (raw):**

| Key | Field |
|-----|-------|
| `client_ip_address` | Raw IP |
| `client_user_agent` | Raw UA |
| `fbc` | Click ID cookie value |
| `fbp` | Browser ID cookie value |

**CRITICAL: fbc and fbp are NEVER hashed.**

### 4.3 Server Route Handler

```typescript
// src/app/api/meta/event/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const fbc = request.cookies.get('_fbc')?.value ?? null;
  const fbp = request.cookies.get('_fbp')?.value ?? null;
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  const userAgent = request.headers.get('user-agent') ?? '';

  const userData: Record<string, unknown> = {
    client_ip_address: clientIp,
    client_user_agent: userAgent,
  };
  if (fbc) userData.fbc = fbc;
  if (fbp) userData.fbp = fbp;
  if (body.user_data?.email) userData.em = [hashForMeta(body.user_data.email, 'email')];
  if (body.user_data?.phone) userData.ph = [hashForMeta(body.user_data.phone, 'phone')];

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: body.event_name,
          event_time: body.event_time,
          event_id: body.event_id,
          action_source: 'website',
          event_source_url: body.event_source_url,
          user_data: userData,
          ...(body.custom_data && { custom_data: body.custom_data }),
        }],
      }),
    }
  );
  const result = await response.json();
  return NextResponse.json({ success: response.ok, events_received: result.events_received });
}
```

### 4.4 Authentication

1. Meta Business Settings > System Users > Create System User
2. Assign `ads_management` and `business_management` permissions
3. Assign System User access to your Pixel (Dataset)
4. Events Manager > Settings > Conversions API > Generate Access Token
5. Store as `META_CAPI_ACCESS_TOKEN` — tokens do not expire unless revoked

---

## 5. Offline Conversions (PRIMARY FOCUS)

### 5.1 Legacy API Is Dead

**The standalone Offline Conversions API (with separate Offline Event Sets) was permanently deprecated on May 14, 2025.** Starting with Graph API v17, all offline events flow through the **standard Conversions API** endpoint.

- No more separate Offline Event Set creation
- No more `/offline_events` endpoint
- Everything goes through `POST /{PIXEL_ID}/events`
- Use `action_source: "system_generated"` to mark offline/CRM events

### 5.2 Sending Offline Conversion Events

```typescript
export async function sendOfflineConversion(data: {
  leadId: string; email: string; phone?: string; firstName?: string; lastName?: string;
  fbc?: string | null; fbp?: string | null; clientIp?: string; userAgent?: string;
  contractValue: number; currency: string; contractSignedAt: Date;
}) {
  const userData: Record<string, unknown> = {};
  if (data.email) userData.em = [hashForMeta(data.email, 'email')];
  if (data.phone) userData.ph = [hashForMeta(data.phone, 'phone')];
  if (data.firstName) userData.fn = [hashForMeta(data.firstName, 'name')];
  if (data.lastName) userData.ln = [hashForMeta(data.lastName, 'name')];
  userData.external_id = [hashForMeta(data.leadId, 'external_id')];
  if (data.fbc) userData.fbc = data.fbc;
  if (data.fbp) userData.fbp = data.fbp;
  if (data.clientIp) userData.client_ip_address = data.clientIp;
  if (data.userAgent) userData.client_user_agent = data.userAgent;

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: 'Purchase',
          event_time: Math.floor(data.contractSignedAt.getTime() / 1000),
          event_id: `contract_${data.leadId}_${Date.now()}`,
          action_source: 'system_generated',
          user_data: userData,
          custom_data: {
            value: data.contractValue,
            currency: data.currency,
            content_name: 'office_contract',
            order_id: data.leadId,
          },
        }],
      }),
    }
  );
  return await response.json();
}
```

### 5.3 Batch Upload (Max 1,000 events per request)

Rate limit between batches: 1 second. Practical rate: ~2,000 events/minute.

### 5.4 Matching Keys Priority

1. **fbc** (Facebook Click ID) — direct link. Always store this.
2. **email** — users often use same email on Facebook.
3. **phone** — very strong. Must include country code.
4. **fbp** (Browser ID) — ties events to browser sessions.
5. **external_id** — your lead ID. Useful for custom audience matching.
6. **fn + ln + ct + zp + country** — demographic matching. Weakest.

---

## 6. Hashing & Normalization

```typescript
// src/lib/analytics/meta-hash.ts
import { createHash } from 'crypto';

type HashFieldType = 'email' | 'phone' | 'name' | 'city' | 'state' | 'zip' | 'country' | 'external_id';

export function hashForMeta(value: string, fieldType: HashFieldType): string {
  const normalized = normalizeForMeta(value, fieldType);
  return createHash('sha256').update(normalized).digest('hex');
}

function normalizeForMeta(value: string, fieldType: HashFieldType): string {
  let v = value.trim();
  switch (fieldType) {
    case 'email': return v.toLowerCase();
    case 'phone': return v.replace(/\D/g, ''); // digits only
    case 'name': return v.toLowerCase().replace(/[^a-z\u00C0-\u024F]/g, '');
    case 'city': return v.toLowerCase().replace(/[^a-z\u00C0-\u024F\s]/g, '');
    case 'country': return v.toLowerCase().substring(0, 2);
    case 'external_id': return v.toLowerCase();
    default: return v.toLowerCase();
  }
}
```

**Common mistakes:** Hashing before normalizing, hashing fbc/fbp (must be raw), double hashing, phone without country code.

---

## 7. Event Match Quality (EMQ)

EMQ score 0-10 measuring how well user_data matches Meta profiles.

| Score | Rating | Impact |
|-------|--------|--------|
| 0-3 | Poor | Severe under-attribution |
| 4-5 | OK | Basic matching |
| 6-7 | Good | Strong matching |
| 8-10 | Great | Maximum attribution |

**Target: 8+.** One study: improving EMQ from 8.6 to 9.3 reduced CPA by 18% and lifted ROAS by 22%.

With email + phone + fn + ln + fbc + fbp + IP + UA + external_id, you should consistently hit **EMQ 8+**.

---

## 8. Event Deduplication

- Matching: Same `event_name` + same `event_id` + same Pixel ID
- Window: **48 hours**
- Pixel uses `eventID` (camelCase); CAPI uses `event_id` (snake_case) — values must match
- For offline events (no Pixel counterpart), use deterministic IDs like `contract_{lead_id}`

---

## 9. Ad Blocker & iOS Resilience

| Threat | Pixel Only | Pixel + CAPI |
|--------|-----------|--------------|
| uBlock Origin | Blocked | CAPI delivers |
| Brave browser | Blocked | CAPI delivers |
| Safari ITP | _fbp may expire | Server stores fbc/fbp |
| Corporate firewalls | May block | CAPI bypasses |
| iOS ATT | Limited | CAPI bypasses (server-to-server) |

B2B users often browse on desktop — ATT impact is lower than B2C mobile.

---

## 10. Testing

- **Test Events Tool**: Events Manager > Test Events > copy Test Event Code
- Add `test_event_code: 'TEST12345'` at top level of CAPI payload (not inside data[])
- **Remove before production**
- Use Meta Events Manager to verify deduplication and EMQ scores

---

## 11. Environment Variables

```bash
# Client-side
NEXT_PUBLIC_META_PIXEL_ID=123456789012345

# Server-side only
META_PIXEL_ID=123456789012345
META_CAPI_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxx
META_TEST_EVENT_CODE=TEST12345  # dev only
META_GRAPH_API_VERSION=v21.0
```

---

## Key Decisions

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Event name for contract | `Purchase` (standard) | Meta optimizes delivery for standard events |
| action_source for offline | `system_generated` | Correct for CRM/backend events |
| Upload frequency | Hourly cron job | Near-real-time > weekly for match quality |
| Pixel library | Inline script | Fewer dependencies |
| Cookie storage | Middleware (server-set) + Supabase | Server-set survives Safari ITP |
| Phone format | Collect with country code | E.164 required for hashing |
| Graph API version | v21.0 (pinned) | Do not use "latest" |

---

## Sources

- [Facebook CAPI 2026 — Triple Whale](https://www.triplewhale.com/blog/facebook-capi)
- [Meta CAPI Complete Guide — Watsspace](https://watsspace.com/blog/meta-conversions-api-the-complete-guide/)
- [Meta CAPI fbc/fbp — Watsspace](https://watsspace.com/blog/meta-conversions-api-fbc-and-fbp-parameters/)
- [Facebook Offline Conversions API — CustomerLabs](https://www.customerlabs.com/blog/facebook-offline-conversions-api-the-complete-guide/)
- [CAPI Offline Setup — Five Nine Strategy](https://fiveninestrategy.com/facebook-offline-conversion-tracking-guide/)
- [Meta Offline API Deprecation — Adsmurai](https://www.adsmurai.com/en/articles/offline-conversion-meta-api)
- [EMQ Optimization — Madgicx](https://madgicx.com/blog/event-match-quality)
- [Facebook CAPI Next.js — GitHub](https://github.com/RivercodeAB/facebook-conversion-api-nextjs)
- [Meta Pixel in NextJS App Directory — DEV](https://dev.to/dankedev/add-facebook-pixel-event-tracking-in-nextjs-app-directory-3ipc)
- [What is fbclid — Northbeam](https://www.northbeam.io/blog/what-is-fbclid-guide-to-facebook-click-identifiers)
- [Meta Offline API Deprecated May 2025 — Seresa](https://seresa.io/blog/facebook-meta-capi/meta-offline-conversions-api-dies-may-14-2025-is-your-woocommerce-store-ready)
