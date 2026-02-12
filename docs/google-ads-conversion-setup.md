# Google Ads Offline Conversion Upload — Setup Guide

## Overview

NextOffice uses a 3-layer system to track Google Ads conversions:

1. **In-Memory Context** — Captures gclid from URL within the session
2. **Server Cookie** — 90-day HTTP-only cookie survives across sessions
3. **NetHunt CRM → n8n → Google Sheets → Google Ads** — Appends conversions to a Google Sheet that Google Ads auto-imports

Layers 1+2 are built in Next.js. Layer 3 is an n8n workflow triggered by NetHunt CRM.

---

## n8n Workflow

| Workflow | ID | Purpose |
|---|---|---|
| NetHunt → Google Sheets Conversion Upload | `ZEAW72k0ijKJa83k` | Webhook receives stage changes from NetHunt, appends row to Google Sheet |

**Two conversion signals:**
- **Qualified** — Lead qualified in CRM (lighter signal for Smart Bidding)
- **Closed - Yes** — Lead signed a contract (high-value conversion)

**Why Google Sheets?** No Google Ads API developer token approval needed. Google Ads imports conversions directly from the sheet on a schedule. Simpler setup, same result.

---

## Prerequisites

### 1. Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Enable the **Google Sheets API**:
   - Navigate to APIs & Services > Library
   - Search for "Google Sheets API"
   - Click Enable

### 2. OAuth2 Credentials

1. In Google Cloud Console, go to APIs & Services > Credentials
2. Use your existing OAuth 2.0 Client ID (or create one)
3. Application type: **Web application**
4. Authorized redirect URI must include: `https://primary-production-069b5.up.railway.app/rest/oauth2-credential/callback`
5. Note the **Client ID** and **Client Secret**

### 3. Google Sheet for Conversions

Create a Google Sheet with these exact column headers in row 1:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Google Click ID | Conversion Name | Conversion Time | Conversion Value | Conversion Currency | Email |

Name the sheet something like "NextOffice Conversions".

### 4. Two Conversion Actions in Google Ads

Both conversion actions should already exist:

| Conversion Action | Name (exact) | ID |
|---|---|---|
| Qualified Lead | NextOffice Qualified Lead | `7402407550` |
| Closed Deal | NextOffice Closed Deal | `7498026671` |

**Connect both to the Google Sheet:**
1. In Google Ads, go to Goals > Conversions > each conversion action
2. Edit the data source → select Google Sheets
3. Point it to the same Google Sheet you created above
4. Google Ads will auto-import new rows on a schedule

---

## n8n Configuration

### Step 1: Add Google Sheets OAuth2 Credentials

1. Open n8n at https://primary-production-069b5.up.railway.app
2. Go to Credentials > Add Credential > **Google Sheets OAuth2 API**
3. Fill in:
   - **Client ID**: `655957101240-1b84tn331hoik8dsdqilmgq8je880eku.apps.googleusercontent.com`
   - **Client Secret**: Your OAuth2 client secret
4. Click **Sign in with Google** and authorize with your Google account
5. Save and test

### Step 2: Add Supabase Credentials

1. Go to Credentials > Add Credential > Supabase
2. Enter your Supabase project URL and service role key
3. Save and test

### Step 3: Configure the Workflow

1. Open "NetHunt → Google Sheets Conversion Upload" workflow
2. In the **"Append to Conversion Sheet"** Google Sheets node:
   - Select your Google Sheets OAuth2 credential
   - Set the **Document ID** to your Google Sheet ID (from the URL: `docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`)
   - Set the **Sheet Name** to match your sheet tab name (default: "Sheet1")
3. In the **"Mark Uploaded in Supabase"** node:
   - Select your Supabase credentials

### Step 4: Configure NetHunt Workflow

In NetHunt CRM, create a Workflow automation:

1. Go to NetHunt > Workflows > Create New
2. **Trigger:** "When a record is updated" in CG folder
3. **Condition:** Stage field changed to "Qualified" OR "Closed - Yes"
4. **Action:** Send HTTP request (webhook)
   - Method: POST
   - URL: `https://primary-production-069b5.up.railway.app/webhook/nethunt-conversion`
   - Body: Send the full record data (including all fields)
5. Save and activate

### Step 5: Test & Activate

1. Activate the n8n workflow
2. In NetHunt, change a test lead's stage to "Qualified"
3. Check the n8n execution log — the workflow should fire
4. Check the Google Sheet — a new row should appear
5. Google Ads will pick up the row on its next import cycle

---

## How It Works

### Data Flow

```
Lead fills form on next-office.io
  → gclid captured (URL → cookie → Supabase)
  → Lead row created in Supabase

You qualify the lead in NetHunt (paste gclid from email)
  → NetHunt Workflow fires, POSTs to n8n webhook
  → n8n appends row to Google Sheet:
    Google Click ID | NextOffice Qualified Lead | 2026-02-12 10:00:00+01:00 | 500 | EUR | sha256hash
  → Supabase updated: conversion_status = 'qualified'

Lead signs contract, you set Stage = "Closed - Yes"
  → NetHunt Workflow fires again
  → n8n appends row: "NextOffice Closed Deal" with monthly rent × 12 as value
  → Supabase updated: conversion_status = 'converted'

Google Ads auto-imports from sheet (hourly/daily)
  → Attributes conversions to original ad clicks
  → Smart Bidding optimizes for qualified leads AND closed deals
```

### Conversion Value Logic

| Stage | Value | Source |
|---|---|---|
| Qualified | Monthly rent (or default €500) | Potential deal value |
| Closed - Yes | Monthly rent × 12 | Annual contract value |
| Closed - Yes (no rent) | Value field | Fallback |

### Matching Strategy

- **Google Click ID**: Direct click matching via gclid (~100% match rate)
- **Email column**: SHA256-hashed email for Enhanced Conversions for Leads (EC4L)
- Both are sent when gclid + email are available

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Webhook not firing | Check NetHunt Workflow is active, URL is correct |
| Google Sheets "unauthorized" | Re-authorize Google Sheets OAuth2 credential in n8n |
| Row not appearing in sheet | Check Document ID and Sheet Name in the node |
| Google Ads not importing | Check conversion action is linked to the sheet, wait for import cycle |
| EC4L not matching | Email must be SHA256-hashed, lowercase, trimmed (Code node handles this) |
| Supabase update fails | Lead may not exist in Supabase (only website form leads are there) |
| Wrong conversion values | Check Monthly rent and Value fields in NetHunt record |
