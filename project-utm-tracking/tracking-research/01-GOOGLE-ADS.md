# Google Ads Conversion Tracking — Production Research

**Domain:** B2B coworking brokerage (next-office.io) with offline conversion attribution
**Researched:** 2026-02-25
**Stack:** Next.js 16 (App Router), React 19, Supabase, Vercel

---

## 1. GCLID Capture & Storage

### 1.1 Current Codebase

Existing **dual-layer capture system**:

**Layer 1 — Server-side middleware** (`src/middleware.ts`): Sets HTTP-only first-party cookies (`_no_gclid`, `_no_gbraid`, `_no_wbraid`) with 90-day expiry when a click ID appears in the URL. Server-set HTTP cookies **survive Safari ITP** (JavaScript-set cookies are capped at 7 days or 24 hours when ITP detects tracking parameters).

**Layer 2 — Client-side React context** (`src/components/lp/tracking/lp-tracking-provider.tsx`): Reads URL params and persists to `sessionStorage` for within-session navigation (LP -> danke page).

**Layer 3 — API route** (`src/app/(main)/api/leads/route.ts`): Reads from request body first, falls back to cookies.

### 1.2 GCLID Expiration Rules

- **Google keeps GCLIDs for 90 days**. Any offline conversion uploaded more than 90 days after the associated ad click will be rejected. Middleware cookie `MAX_AGE = 90 * 24 * 60 * 60` correctly matches this window.
- **GCLID format**: A string like `CjwKCAjw...` — case-sensitive. Store exactly as received.
- **Best practice**: Upload offline conversions **within 72 hours** of the actual conversion event for highest match rate and fastest Smart Bidding impact.

### 1.3 Safari ITP / Link Tracking Protection — Critical Threat

- **Safari ITP (current)**: JavaScript-set cookies with tracking parameters detected are capped to 24 hours. Middleware sets cookies server-side via `Set-Cookie` HTTP headers — correct mitigation.
- **Safari 26 (September 2025)**: Will expand `gclid` stripping from Private Browsing to **all standard browsing sessions**. The `gclid` parameter will be stripped from the URL **before your page loads**. Neither middleware nor client-side code will ever see the GCLID on Safari.
- **Workaround for Safari 26**: Server-set cookies via HTTP headers bypass Safari's JavaScript restrictions. However — server-set cookies can persist 400 days in Safari **only if your server IP matches your website IP**. On Vercel, generally fine since cookies are set by the same origin.

**Critical action**: Safari 26 gclid stripping means you MUST implement **Enhanced Conversions for Leads** as a parallel tracking path. GCLID alone will lose all Safari traffic attribution (~20-30% of desktop and vast majority of iOS).

### 1.4 WBRAID and GBRAID — iOS Alternatives

- **GBRAID**: Present when a user clicks an ad on the web and is directed to your iOS app
- **WBRAID**: Present when a user clicks an ad in an iOS app and is directed to your webpage

Unlike GCLID, these are **coarse-grained and aggregate** — they do not identify individual users. They are privacy-compliant alternatives for iOS 14.5+ environments. Already captured by middleware.

### 1.5 Recommended Supabase Schema Extensions

```sql
-- Expand existing leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_hash TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_hash TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Offline conversion tracking state
ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversion_uploaded_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversion_upload_status TEXT
  CHECK (conversion_upload_status IN ('pending', 'uploaded', 'failed', 'expired', 'matched'))
  DEFAULT 'pending';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversion_upload_error TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversion_value NUMERIC(10,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversion_currency TEXT DEFAULT 'EUR';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contract_signed_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gads_job_id TEXT;

-- Audit trail for upload attempts
CREATE TABLE IF NOT EXISTS conversion_upload_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ DEFAULT now(),
  method TEXT NOT NULL,  -- 'gclid' or 'enhanced_conversions'
  status TEXT NOT NULL,  -- 'success', 'partial_failure', 'error'
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_conversion_pending
  ON leads(conversion_upload_status)
  WHERE conversion_upload_status = 'pending' AND contract_signed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_gclid
  ON leads(gclid) WHERE gclid IS NOT NULL;
```

---

## 2. Online Conversion Tracking (gtag.js in Next.js)

### 2.1 Enhanced Conversions Config

Add to gtag configuration:

```typescript
gtag('config', googleAdsId, {
  allow_enhanced_conversions: true
});
```

### 2.2 Send User Data at Form Submission

```typescript
// src/lib/google-ads.ts
export function sendEnhancedConversionData(userData: {
  email: string;
  phone?: string;
}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const normalizedEmail = userData.email.trim().toLowerCase();
  window.gtag("set", "user_data", {
    email: normalizedEmail,
    ...(userData.phone ? { phone_number: userData.phone } : {}),
  });
}

export function fireLeadConversion(transactionId: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
  const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (!conversionId || !conversionLabel) return;
  window.gtag("event", "conversion", {
    send_to: `${conversionId}/${conversionLabel}`,
    value: 1.0,
    currency: "EUR",
    transaction_id: transactionId,
  });
}
```

**Call order in form submission:**

```typescript
// 1. Set user_data BEFORE firing conversion
sendEnhancedConversionData({ email: formData.email, phone: formData.phone });
// 2. Fire conversion event (includes user_data set above)
const txId = crypto.randomUUID();
fireLeadConversion(txId);
// 3. Submit to API (include txId for dedup with offline upload)
await fetch("/api/leads", {
  method: "POST",
  body: JSON.stringify({ ...formData, transaction_id: txId }),
});
```

### 2.3 Consent Mode v2

Must be **first** gtag call, before 'config':

```typescript
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500
});
```

On consent accepted:

```typescript
window.gtag("consent", "update", {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
});
```

`ad_user_data: 'granted'` is **required** for Enhanced Conversions to work.

### 2.4 Google Tag Manager vs Direct gtag.js

**Stick with direct gtag.js** (current approach). GTM adds complexity, an extra HTTP request, and a layer of indirection. Direct gtag.js gives full TypeScript type safety and testability. One fewer third-party dependency for GDPR.

---

## 3. Offline Conversion Imports (PRIMARY FOCUS)

### 3.1 Architecture Flow

```
User clicks Google Ad
  -> Lands on LP with ?gclid=XXX
  -> Middleware stores gclid in HTTP-only cookie
  -> User submits lead form
  -> API stores lead + gclid + email_hash in Supabase
  -> [Days/weeks pass]
  -> Sales team marks contract as signed
  -> Backend cron uploads offline conversion to Google Ads API
  -> Google Ads attributes the conversion to the original ad click
  -> Smart Bidding optimizes for similar users
```

### 3.2 Google Ads API — UploadClickConversions

**API Endpoint:**
```
POST https://googleads.googleapis.com/v21/customers/{customerId}:uploadClickConversions
```

**Required Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
developer-token: {developer_token}
login-customer-id: {manager_account_id}  // Only if using MCC
```

**Request Body:**
```json
{
  "conversions": [
    {
      "gclid": "CjwKCAjw...",
      "conversionAction": "customers/1234567890/conversionActions/111222333",
      "conversionDateTime": "2026-03-15 14:30:00+01:00",
      "conversionValue": 5000.00,
      "currencyCode": "EUR",
      "consent": {
        "adPersonalization": "GRANTED",
        "adUserData": "GRANTED"
      }
    }
  ],
  "partialFailure": true,
  "jobId": 12345
}
```

**Critical fields:**
- `conversionAction`: Resource name `customers/{customerId}/conversionActions/{actionId}`. Create in Google Ads UI (type: "Import" > "Other data sources" > "Track conversions from clicks").
- `conversionDateTime`: Must be AFTER click time. Format: `yyyy-mm-dd HH:mm:ss+|-HH:mm`. Always include timezone.
- `partialFailure`: **Always set to true** — ensures one failure doesn't kill the batch.
- `consent`: Required for EEA users. Both must be `GRANTED`.

### 3.3 Authentication (OAuth2)

```typescript
// src/lib/google-ads-auth.ts
export async function getGoogleAdsAccessToken(): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error(`OAuth2 refresh failed: ${response.status}`);
  const data = await response.json();
  return data.access_token;
}
```

### 3.4 Upload Implementation (Direct REST — recommended for Vercel)

```typescript
// src/lib/google-ads-conversions.ts
import { getGoogleAdsAccessToken } from "./google-ads-auth";

const API_VERSION = "v21";
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID!;
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
const CONVERSION_ACTION_ID = process.env.GOOGLE_ADS_CONVERSION_ACTION_ID!;

interface OfflineConversion {
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  conversionDateTime: string;
  conversionValue: number;
  currencyCode?: string;
  userIdentifiers?: Array<{
    hashedEmail?: string;
    hashedPhoneNumber?: string;
  }>;
}

export async function uploadOfflineConversions(
  conversions: OfflineConversion[],
  jobId?: number
) {
  const accessToken = await getGoogleAdsAccessToken();
  const conversionAction = `customers/${CUSTOMER_ID}/conversionActions/${CONVERSION_ACTION_ID}`;

  const body = {
    conversions: conversions.map((c) => {
      const conversion: Record<string, unknown> = {
        conversionAction,
        conversionDateTime: c.conversionDateTime,
        conversionValue: c.conversionValue,
        currencyCode: c.currencyCode || "EUR",
        consent: { adPersonalization: "GRANTED", adUserData: "GRANTED" },
      };
      if (c.gclid) conversion.gclid = c.gclid;
      else if (c.gbraid) conversion.gbraid = c.gbraid;
      else if (c.wbraid) conversion.wbraid = c.wbraid;
      if (c.userIdentifiers?.length) {
        conversion.userIdentifiers = c.userIdentifiers.map((ui) => {
          if (ui.hashedEmail) return { userIdentifierSource: "FIRST_PARTY", hashedEmail: ui.hashedEmail };
          if (ui.hashedPhoneNumber) return { userIdentifierSource: "FIRST_PARTY", hashedPhoneNumber: ui.hashedPhoneNumber };
          return ui;
        });
      }
      return conversion;
    }),
    partialFailure: true,
    ...(jobId ? { jobId } : {}),
  };

  const url = `https://googleads.googleapis.com/${API_VERSION}/customers/${CUSTOMER_ID}:uploadClickConversions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "developer-token": DEVELOPER_TOKEN,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Ads API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return {
    success: !result.partialFailureError,
    partialFailureError: result.partialFailureError?.message,
    results: result.results || [],
  };
}
```

Use Direct REST (Option A) over the npm package — avoids gRPC/protobuf dependency issues in serverless.

### 3.5 Time Window Constraints

| Constraint | Value |
|---|---|
| GCLID validity | 90 days from click |
| Recommended upload frequency | Within 72 hours of conversion |
| Maximum upload delay | 90 days after click |
| Conversion must be AFTER click | Always |
| Duplicate prevention | Same GCLID + ConversionAction + DateTime |

### 3.6 Common Error Codes

| Error | Meaning | Action |
|---|---|---|
| `CLICK_NOT_FOUND` | GCLID not recognized | Fall back to Enhanced Conversions |
| `CONVERSION_ACTION_IS_NOT_IMPORT` | Wrong action type | Fix in Google Ads UI |
| `CLICK_TOO_OLD` | GCLID > 90 days | Mark as expired |
| `DUPLICATE_CLICK_CONVERSION_IN_REQUEST` | Duplicate in batch | Deduplicate before sending |
| `CONVERSION_PRECEDES_GCLID` | Conversion before click | Fix timestamp |

### 3.7 Monitoring via Diagnostics API

```
SELECT
  offline_conversion_upload_client_summary.status,
  offline_conversion_upload_client_summary.success_rate,
  offline_conversion_upload_client_summary.successful_event_count,
  offline_conversion_upload_client_summary.total_event_count
FROM offline_conversion_upload_client_summary
```

---

## 4. Enhanced Conversions for Leads

### 4.1 Why This Is Mandatory

1. **Safari 26 will strip GCLIDs** — ECL is the only fallback for Safari attribution
2. **Cross-device tracking**: Mobile click, desktop form — GCLID lost, email matches
3. **10% median conversion lift** (Google's reported figure)
4. **Google recommends** sending GCLID AND user_identifiers together

### 4.2 How It Works

**Phase 1 — Google Tag (website):** `gtag('set', 'user_data', { email })` captures hashed email and links to ad click.

**Phase 2 — Offline Upload (backend):** Upload includes same hashed email as `userIdentifiers`. Google matches Phase 2 email to Phase 1 email, connecting offline conversion to original click.

### 4.3 Hashing Requirements

Before hashing: trim whitespace, lowercase. For gmail.com: remove dots before @. Phone: E.164 format. Algorithm: SHA-256, lowercase hex string (64 chars).

```typescript
export async function hashEmail(email: string): Promise<string> {
  let normalized = email.trim().toLowerCase();
  const [localPart, domain] = normalized.split("@");
  if (domain === "gmail.com" || domain === "googlemail.com") {
    normalized = localPart.replace(/\./g, "") + "@" + domain;
  }
  const data = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}
```

### 4.4 Match Rates

| Method | Match Rate | Safari | Cross-Device |
|---|---|---|---|
| GCLID only | ~100% when available | Breaks Safari 26 | No |
| Enhanced Conversions only | ~70-80% | Yes | Yes |
| **Both (recommended)** | ~95%+ | Yes | Yes |

**Always send both when available.**

---

## 5. Accuracy & Reliability

### 5.1 Common Failure Modes

1. **Lost GCLIDs**: Cookie clearing, private browsing, device switching → Enhanced Conversions
2. **Safari ITP / Safari 26**: Server-set cookies handle ITP; ECL handles Safari 26
3. **GCLID expiration**: B2B cycles >90 days → upload intermediate "qualified lead" conversion
4. **Consent denied**: Consent Mode v2 Advanced mode models conversions from cookieless pings
5. **API auth failure**: Refresh token expiry → alerting on API errors

### 5.2 Maximizing Match Rates

1. Always capture GCLID + GBRAID + WBRAID (already done)
2. Always hash and store email at form submission (add this)
3. Send both GCLID and user_identifiers in every upload (new)
4. Upload within 72 hours of conversion
5. Use `allow_enhanced_conversions: true` in gtag config
6. Set `user_data` via gtag BEFORE firing conversion event
7. Collect phone numbers (secondary match key)

### 5.3 Monitoring Queries

```sql
-- GCLID capture rate (target: 70%+)
SELECT
  COUNT(*) FILTER (WHERE gclid IS NOT NULL) AS with_gclid,
  COUNT(*) AS total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE gclid IS NOT NULL) / COUNT(*), 1) AS gclid_rate
FROM leads WHERE created_at > now() - interval '30 days';

-- Upload success rate (target: 95%+)
SELECT conversion_upload_status, COUNT(*)
FROM leads
WHERE contract_signed_at IS NOT NULL AND created_at > now() - interval '90 days'
GROUP BY conversion_upload_status;

-- Leads approaching GCLID expiration
SELECT id, name, email, created_at, gclid,
  (created_at + interval '90 days') AS gclid_expires_at
FROM leads
WHERE gclid IS NOT NULL AND contract_signed_at IS NULL
  AND conversion_upload_status = 'pending'
  AND created_at < now() - interval '60 days'
ORDER BY created_at ASC;
```

### 5.4 Alerting Thresholds

| Metric | Warning | Critical |
|---|---|---|
| GCLID capture rate (30d) | < 60% | < 40% |
| Upload success rate | < 90% | < 75% |
| Days since last successful upload | > 3 days | > 7 days |
| Leads with GCLID expiring in < 14 days | Any | N/A |

---

## 6. Environment Variables

```env
# Client-side
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=AW-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=XXXXXXXXXXXXXX

# Server-side (offline conversion uploads)
GOOGLE_ADS_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_ADS_REFRESH_TOKEN=1//xxxx
GOOGLE_ADS_DEVELOPER_TOKEN=xxxx
GOOGLE_ADS_CUSTOMER_ID=1234567890
GOOGLE_ADS_CONVERSION_ACTION_ID=111222333
CRON_SECRET=your-random-secret-here
```

---

## Sources

- [Google Ads: Manage Offline Conversions](https://developers.google.com/google-ads/api/docs/conversions/upload-offline)
- [Google Ads: Set Up Offline Conversions Using GCLID](https://support.google.com/google-ads/answer/7012522?hl=en)
- [Google Ads: Guidelines for Importing Offline Conversions](https://support.google.com/google-ads/answer/15081888?hl=en)
- [Google Ads: Enhanced Conversions for Leads](https://support.google.com/google-ads/answer/15713840?hl=en)
- [Google Ads: Configure Google Tag for EC4L](https://support.google.com/google-ads/answer/11021502?hl=en)
- [Google Ads API: UploadClickConversions v21](https://developers.google.com/google-ads/api/reference/rpc/v21/ConversionUploadService/UploadClickConversions)
- [Google Ads API: Monitor Offline Data Diagnostics](https://developers.google.com/google-ads/api/docs/conversions/upload-summaries)
- [Safari GCLID Removal 2025 — Stape](https://stape.io/blog/safari-removes-click-identifiers-solution)
- [Safari GCLID Removal 2025 — Conversios](https://www.conversios.io/blog/how-to-fix-safari-gclid-removal-2025/)
- [EC4L vs GCLID — Freak Marketing](https://freak.marketing/post/google-ads-enhanced-conversions-vs-gclid)
- [Consent Mode v2 — Simo Ahava](https://www.simoahava.com/analytics/consent-mode-v2-google-tags/)
- [Consent Mode v2 for Offline Conversions — CustomerLabs](https://www.customerlabs.com/blog/google-consent-mode-v2-offline-conversions/)
