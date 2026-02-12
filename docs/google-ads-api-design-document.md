# Google Ads API — Tool Design Document

## Company: softurio UG
## Product: next-office.io
## Date: February 2026

---

## 1. Overview

next-office.io is a B2B coworking space marketplace operating in Germany. We use Google Ads to acquire leads who are searching for office space. When a lead fills out a contact form on our website, we capture the Google Click ID (gclid) and store it in our CRM (NetHunt CRM).

We need Google Ads API access to upload offline conversions back to Google Ads, enabling accurate conversion tracking and Smart Bidding optimization.

## 2. API Features Used

We exclusively use the **OfflineConversionUpload** service:

- **Endpoint:** `GoogleAdsService.uploadClickConversions`
- **Purpose:** Upload offline conversion data from our CRM to Google Ads
- **No other API features are used** — we do not read, create, or modify campaigns, ad groups, ads, keywords, or any other Google Ads resources via the API.

## 3. How It Works

### Data Flow

```
1. User clicks Google Ad → lands on next-office.io with gclid parameter
2. Website captures gclid via server-side cookie (90-day expiry)
3. User fills contact form → gclid stored in Supabase database
4. Sales team qualifies lead in NetHunt CRM, pastes gclid from email
5. CRM stage change triggers n8n automation workflow
6. n8n workflow uploads conversion to Google Ads API:
   - "Qualified Lead" conversion when lead is qualified
   - "Converted Lead" conversion when contract is signed
7. Google Ads uses this data for Smart Bidding optimization
```

### Conversion Types

| Conversion Action | Trigger | Value |
|---|---|---|
| Qualified Lead | Lead qualified in CRM | Monthly rent estimate (EUR) |
| Converted Lead | Contract signed (Closed-Yes) | Annual contract value (EUR) |

### Matching Strategy

- **Primary:** gclid-based matching (direct click attribution)
- **Fallback:** Enhanced Conversions for Leads (EC4L) using SHA256-hashed email

## 4. Technical Architecture

- **Automation Platform:** n8n (self-hosted on Railway)
- **Trigger:** Webhook from NetHunt CRM when deal stage changes
- **Authentication:** OAuth2 with Google Ads API scope
- **API Version:** Google Ads API v18
- **Request Format:** REST/JSON via uploadClickConversions endpoint

### Request Example

```json
POST /v18/customers/{customerId}:uploadClickConversions

{
  "conversions": [{
    "gclid": "EAIaIQobChMI...",
    "conversionAction": "customers/XXXXXXXXXX/conversionActions/XXXXXXXXXX",
    "conversionDateTime": "2026-02-12 10:00:00+01:00",
    "conversionValue": 2500,
    "currencyCode": "EUR",
    "userIdentifiers": [{
      "hashedEmail": "sha256hash..."
    }]
  }],
  "partialFailure": true
}
```

## 5. Rate and Volume

- **Estimated volume:** 20-50 conversions per month
- **API call frequency:** Real-time (triggered by CRM stage changes), typically a few calls per day
- **No batch processing or high-volume operations**

## 6. Users

- **Internal use only** — the tool is used exclusively by our sales team
- **No external users or third-party access**
- **Single Google Ads account:** 215-246-8876
- **Manager account:** 670-646-4060

## 7. Data Handling

- gclid values are stored securely in our CRM and database
- Email addresses are SHA256-hashed before being sent to the API
- No personal data is stored beyond what is necessary for conversion attribution
- All data transmission uses HTTPS/TLS encryption
- We comply with GDPR requirements for data processing
