# Privacy Compliance & Consent Management for Ad Tracking

**Domain:** next-office.io — B2B coworking brokerage, German/EU market
**Researched:** 2026-02-25
**Stack:** Next.js 16, React 19, Supabase, Vercel
**Disclaimer:** Legal research for planning purposes, not legal advice.

---

## 1. Legal Framework

### 1.1 Three Overlapping Regimes

**GDPR** (Regulation (EU) 2016/679): Every processing of personal data needs a legal basis (Art. 6), purpose limitation, data minimization, storage limitation, accountability.

**TDDDG** (formerly TTDSG) — Section 25: Germany's implementation of ePrivacy Directive Art. 5(3). Any storage of or access to information on a user's terminal equipment requires **prior consent**, unless strictly necessary for the service requested. Fines up to EUR 300,000.

**German Consent Management Ordinance (EinwV)**: Effective April 1, 2025. Framework for recognized consent management services. Participation is **voluntary** — standard CMP approach remains valid.

### 1.2 B2B Does NOT Reduce Requirements

**Critical finding: B2B context provides NO exemption from tracking consent in Germany.**

- TDDDG applies to **terminal equipment**, not business relationship type
- GDPR protects **natural persons** — business contacts with personal emails are natural persons
- Germany's UWG (Section 7) is especially strict for B2B electronic communications
- **Bottom line**: For tracking cookies, pixels, and ad identifiers, you need consent just as for B2C

---

## 2. Legal Basis for Each Tracking Activity

### 2.1 Storing GCLIDs / FBCLIDs

EDPB Guidelines 2/2023 (Nov 14, 2023) explicitly address URL tracking parameters:

> "URL tags (strings of numbers and letters that are appended to URLs to identify, for example, a click on an ad) are stored on a user's terminal equipment."

**Consequence**: Capturing and storing GCLID/FBCLID from URL for tracking purposes **requires prior consent** under TDDDG Section 25.

| Legal Basis | Viable? | Notes |
|---|---|---|
| Consent (Art. 6(1)(a)) | **Yes** | Recommended and safest |
| Legitimate Interest (Art. 6(1)(f)) | **Unlikely** | German DPAs strict on ad tracking |
| Contract (Art. 6(1)(b)) | **No** | Ad tracking not necessary for contract |

### 2.2 Enhanced Conversions

- **Hashing is NOT anonymization** under GDPR. SHA-256 is pseudonymization — Google can re-identify by matching its own database.
- Enhanced Conversions involve **transferring personal data to Google** (separate controller)
- Requires: legal basis (consent), transparency in privacy policy, DPA with Google
- **Requires consent** (ad_user_data = granted under Consent Mode v2)

### 2.3 Offline Conversion Uploads

1. **Consent at collection time**: When user submits lead form, must consent to data sharing with ad platforms for conversion measurement. Store consent alongside lead record.
2. **Google Ads API v15+**: Consent object must include `ad_user_data: GRANTED` and `ad_personalization: GRANTED`. If missing → data NOT processed for EEA users.
3. **Meta CAPI**: Include consent/data processing flags. Only send for consented users.
4. **No retroactive use**: Cannot upload for users who never consented.

### 2.4 Data Processing Agreements

| Platform | Relationship | How to Set Up |
|---|---|---|
| Google Ads | Independent controllers | Accept Google Ads Data Processing Terms |
| Google Analytics | Processor | Accept GA4 Data Processing Terms |
| Meta Ads | Controller-to-Controller | Accept Meta's Data Processing Terms |
| Supabase | Processor | Accept Supabase DPA in dashboard |
| Vercel | Processor | Accept Vercel DPA |

### 2.5 Data Retention

| Data Type | Retention | Justification |
|---|---|---|
| GCLID / FBCLID (raw) | **90 days** | Google's validity window |
| Consent record | **3 years** min | Proof of consent for regulatory inquiry |
| Lead form data | Duration of relationship + 6 months, or 2 years if no conversion | Service delivery |
| Hashed data (sent to platforms) | Delete after upload confirmation | No need to retain transmitted data |
| Attribution metadata | Same as lead data | Business analytics |
| Analytics/behavioral | 14-26 months | Align with GA4 retention |

---

## 3. Google Consent Mode v2

### 3.1 Mandatory Since March 6, 2024

Non-compliance results in: no conversion tracking, no remarketing, degraded Analytics, no Customer Match for EEA users.

### 3.2 Four Consent Signals

| Signal | Controls | Default (GDPR) |
|---|---|---|
| `ad_storage` | Advertising cookies (_gcl_*) | `denied` |
| `analytics_storage` | Analytics cookies (_ga, _gid) | `denied` |
| `ad_user_data` | User data sent to Google for ads | `denied` |
| `ad_personalization` | Data for remarketing/personalized ads | `denied` |

### 3.3 Basic vs Advanced Mode

**Basic**: Tags don't load until consent. Zero measurement for non-consenting users. 30-60% data loss.

**Advanced (recommended)**: Tags load even when denied. Send **cookieless pings** — no cookies, no PII. Google uses these for **conversion modeling** (estimates ~70% of missing conversions). Requires ~700 ad clicks/7 days per country-domain for modeling activation.

### 3.4 Impact on GCLID When Consent Denied

- `_gcl_*` cookies NOT set
- GCLID in URL but not persisted
- You **cannot** capture GCLID into database without consent
- When later granted: `_gcl_*` set, click IDs recovered if still on landing page

### 3.5 Interaction with Offline Conversions

- Web consent must be captured and stored with lead record
- API upload must include `Consent { ad_user_data: GRANTED, ad_personalization: GRANTED }`
- Without consent signals → Google treats as UNSPECIFIED → data NOT processed for EEA
- Partial consent: `ad_user_data` granted but `ad_personalization` denied → measurement OK but no remarketing

### 3.6 Implementation in Next.js

**Step 1: Consent defaults (BEFORE any Google tags):**

```typescript
// In layout.tsx, strategy="beforeInteractive"
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500,
  'region': ['DE', 'AT', 'CH']
});
```

**Step 2: Update on consent change:**

```typescript
window.gtag?.('consent', 'update', {
  'ad_storage': marketing ? 'granted' : 'denied',
  'ad_user_data': marketing ? 'granted' : 'denied',
  'ad_personalization': marketing ? 'granted' : 'denied',
  'analytics_storage': statistics ? 'granted' : 'denied',
});
```

---

## 4. Cookie Consent Implementation

### 4.1 Requirements for Germany

1. Appear **before** any non-essential tracking
2. Clear, plain-language German text
3. **Granular choices** — accept/reject individual categories
4. Rejection **equally easy** as acceptance — both buttons equally prominent
5. **No pre-checked boxes**
6. Withdrawal via footer link ("Cookie-Einstellungen")
7. **Record consent** — ID, timestamp, version, choices
8. Link to Datenschutzerklaerung

### 4.2 Recommended CMP: Cookiebot

- **Google Gold Tier CMP Partner** — seamless Consent Mode v2 integration
- Automated cookie scanning
- Strong DACH market presence, 60+ languages
- TCF 2.3 support
- Pricing: EUR 15-30/mo per domain (SMB tier)

Alternatives: Usercentrics (EUR 50+/mo), Consentmanager (German, EUR 9+/mo), CookieYes (free tier).

### 4.3 Banner UX Best Practices

**Do:**
- "Alle akzeptieren" and "Alle ablehnen" side by side, **equal visual weight**
- Third option: "Einstellungen" for granular control
- Brief value proposition in German
- Compact banner (bottom bar or centered modal)
- Persistent "Cookie-Einstellungen" in footer

**Do NOT (dark patterns, risk fines):**
- Make "Accept" visually dominant
- Hide reject behind multiple clicks
- Pre-check consent categories
- Cookie walls / repeated banners after rejection

**Expected consent rates** (compliant neutral banner, Germany): Accept 50-65%, Reject 25-40%, Custom 5-15%.

---

## 5. Data Flow Compliance

### 5.1 Before vs After Consent

| Data | Before Consent | After Consent |
|---|---|---|
| Page URL (no tracking params) | Yes | Yes |
| GCLID / FBCLID from URL | **No** | Yes |
| First-party analytics cookies | **No** | Yes |
| IP address (security) | Yes (legitimate interest) | Yes |
| Lead form data | Yes (contract basis, Art. 6(1)(b)) | Yes |
| Consent record | Yes (legitimate interest) | Yes |

**Key insight**: Lead form data has a **separate legal basis** from ad tracking. Form submission for service inquiry = pre-contractual measures (Art. 6(1)(b)). But **linking** form data to a GCLID requires marketing consent.

### 5.2 Server-Side Tracking & Consent

- CAPI is **not** a consent workaround
- Server-side events must only be sent for **consented users**
- Pass consent state from client to server
- For Meta CAPI: pass Limited Data Use flags
- For Google: pass consent signals in API call

### 5.3 Cross-Border Data Transfers

**Supabase**: Host in **Frankfurt (eu-central-1)**. Accept Supabase DPA.

**Google & Meta (US-based)**: Certified under **EU-U.S. Data Privacy Framework** (DPF). DPF **upheld by European General Court on September 3, 2025**. Transfers currently considered adequate. SCCs as fallback.

**Vercel (US-based)**: DPF-certified. Accept DPA. Consider EU edge regions.

### 5.4 Data Subject Access Requests (DSARs)

| Right | Action |
|---|---|
| **Access (Art. 15)** | Provide all data including tracking data, consent records |
| **Erasure (Art. 17)** | Delete lead + GCLIDs + consent records. Also: GA4 User Deletion API, Google Ads Customer Match, Meta Custom Audiences |
| **Portability (Art. 20)** | Export in JSON/CSV |
| **Response time** | 1 calendar month |

Build manual DSAR process (sufficient for low-volume B2B). Verify requester identity before disclosing.

---

## 6. Privacy-Preserving Attribution

### 6.1 Impact of Declined Tracking

With compliant banner, expect **30-50% decline rate** in Germany.

Impact: No GCLID capture, no conversion tracking, no remarketing, no offline conversion reporting for these users.

### 6.2 Mitigations

1. **Google Consent Mode Advanced Modeling**: Cookieless pings → ~70% of missing conversions estimated
2. **Self-reported attribution**: "How did you find us?" on lead form. Collected under contract legal basis. Always available.
3. **UTM parameters**: Campaign-level metadata (not user-level). Less risky than click IDs.
4. **Server-side sessions**: For consented users, server-side session linking click to form.

### 6.3 Consent-Aware Pipeline

```
User clicks ad → CMP banner
        |
   +----+----+
   |         |
 Consents  Declines
   |         |
 Capture   No capture
 cookies   No cookies
 Tags      Cookieless pings
   |         |
 Form       Form
 (with IDs) (no IDs)
   |         |
 Lead+gclid Lead (no gclid)
   |         |
 Upload to  NOT uploaded
 Google/Meta (Google models gap)
```

---

## 7. Pre-Launch Audit Checklist

### Legal Documentation
- [ ] Privacy policy covers all tracking, recipients, transfers, retention, rights
- [ ] Impressum complete
- [ ] Records of Processing Activities (ROPA)
- [ ] DPAs: Google, Meta, Supabase, Vercel
- [ ] Cookie table: names, purposes, lifetimes

### Consent Management
- [ ] CMP installed, configured
- [ ] Banner before any non-essential tracking
- [ ] Accept/Reject equally prominent
- [ ] Granular settings available
- [ ] Withdrawal via footer link
- [ ] Re-consent interval (12 months)
- [ ] Consent records: ID, timestamp, version, choices

### Google Consent Mode v2
- [ ] Defaults set to `denied` for DE/EEA BEFORE tags load
- [ ] Update fires on consent change
- [ ] Advanced mode: cookieless pings verified
- [ ] `ad_user_data` and `ad_personalization` correctly mapped
- [ ] `wait_for_update: 500`

### Tracking
- [ ] No cookies before consent (verify DevTools)
- [ ] GCLID/FBCLID NOT captured before marketing consent
- [ ] Meta Pixel NOT loaded before marketing consent
- [ ] Server events respect consent state

### Data Storage
- [ ] Supabase in Frankfurt
- [ ] Lead records store consent status
- [ ] Tracking data retention: 90 days for GCLIDs
- [ ] Automated deletion jobs

### Offline Conversions
- [ ] Only consented leads in uploads
- [ ] Google API: Consent { GRANTED, GRANTED }
- [ ] Meta CAPI: data_processing_options
- [ ] Unconsented leads excluded from Customer Match

### Cross-Border
- [ ] Google DPF verified
- [ ] Meta DPF verified
- [ ] Supabase EU hosting confirmed
- [ ] Vercel DPA accepted
- [ ] SCCs as fallback

---

## Sources

- [EDPB Guidelines 2/2023 on Art. 5(3) ePrivacy Directive](https://www.edpb.europa.eu/system/files/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf)
- [German TDDDG Guide — Securiti](https://securiti.ai/blog/german-ttdsg-guide/)
- [Cookie Consent Germany — CookieYes](https://www.cookieyes.com/blog/cookie-consent-requirements-germany/)
- [German Consent Ordinance — Didomi](https://www.didomi.io/blog/german-consent-management-ordinance)
- [Legitimate Interest B2B — MarketOne](https://www.marketone.com/articles/legitimate-interest-b2b-marketing)
- [EU-US DPF 2025 — Didomi](https://www.didomi.io/blog/eu-us-data-privacy-framework-dpf-2025)
- [DPF Survives Court Challenge — DLA Piper](https://privacymatters.dlapiper.com/2025/09/eu-u-s-data-privacy-framework-survives-first-challenge/)
- [Google Consent Mode Dev Docs](https://developers.google.com/tag-platform/security/guides/consent)
- [Google Consent Mode v2 — Simo Ahava](https://www.simoahava.com/analytics/consent-mode-v2-google-tags/)
- [Enhanced Conversions GDPR — OptimizeSmart](https://www.optimizesmart.com/gdpr-alert-are-your-enhanced-conversions-legal/)
- [Meta CAPI GDPR — Watsspace](https://watsspace.com/blog/is-meta-conversions-api-gdpr-compliant/)
- [Cookie Banner UX — SecurePrivacy](https://secureprivacy.ai/blog/cookie-banner-ui-ux-best-practices)
- [Dark Patterns — CookieYes](https://www.cookieyes.com/blog/dark-patterns-in-cookie-consent/)
- [Supabase DPA](https://supabase.com/downloads/docs/Supabase+DPA+250314.pdf)
- [Cookiebot Manual Implementation](https://www.cookiebot.com/en/manual-implementation/)
