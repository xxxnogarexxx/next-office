-- Migration: 006_leads_transaction_id
-- Purpose: Add transaction_id column to leads table for deduplication between
--          online gtag conversion events and offline conversion uploads (EC-04).
--
-- The transaction_id is a UUID generated client-side at form submission time.
-- It is sent to both the gtag conversion event and the lead API, enabling
-- Google Ads to deduplicate the online conversion event with the offline upload.
--
-- Depends on: 005_leads_extension.sql
-- Affects:    09-enhanced-conversions (EC-04), 10-offline-conversion (OFL-*)

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS transaction_id TEXT;  -- UUID string, 36 chars

-- Index for offline conversion matching — look up lead by transaction_id.
-- Partial index: only index rows where transaction_id is populated (v1.1+ leads).
CREATE INDEX IF NOT EXISTS idx_leads_transaction_id
  ON leads (transaction_id)
  WHERE transaction_id IS NOT NULL;
