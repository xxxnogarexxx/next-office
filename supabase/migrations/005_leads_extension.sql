-- Migration: 005_leads_extension
-- Purpose: Extend the existing leads table with visitor attribution, UTM tracking,
--          email hashing (Enhanced Conversions), GDPR consent tracking, and
--          conversion lifecycle status. Bridges the v1.0 lead capture system with
--          the new tracking infrastructure created in Phase 7 Plan 01.
--
-- This migration uses ADD COLUMN IF NOT EXISTS for idempotency — safe to re-run.
--
-- Depends on: 001_visitors.sql (visitors table must exist for visitor_id FK)
-- Affects:    08-visitor-tracking, 09-enhanced-conversions, 10-crm-webhook
--
-- Note: RLS is already enabled on the leads table with anon INSERT policy (v1.0).
--       New columns do not require additional RLS changes — existing policies
--       automatically cover all columns added to the table.
--       RLS status: ENABLED (anon INSERT allowed, anon SELECT denied).

-- ---------------------------------------------------------------------------
-- Visitor linkage: link a lead to the anonymous visitor session that submitted it.
-- Nullable — leads created before v1.1 (and leads from non-JS environments) will
-- have NULL visitor_id. ON DELETE SET NULL ensures lead survives visitor cleanup.
-- ---------------------------------------------------------------------------

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS visitor_id UUID REFERENCES visitors (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- UTM attribution columns.
-- ValidatedLeadData already contains these fields but insertLead does not write
-- them to the database (v1.0 gap). Phase 8 will update insertLead to write them.
-- ---------------------------------------------------------------------------

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_term     TEXT,
  ADD COLUMN IF NOT EXISTS utm_content  TEXT;

-- ---------------------------------------------------------------------------
-- Enhanced Conversions: SHA-256 hex hash of normalized lowercase email.
-- Computed at form submission time (Phase 9). Never stores raw email twice —
-- the email column retains the original; email_hash is for Google Ads upload.
-- ---------------------------------------------------------------------------

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS email_hash TEXT;  -- SHA-256 hex string, 64 chars

-- ---------------------------------------------------------------------------
-- GDPR consent tracking.
-- consent_recorded_at captures when consent was given (may differ from created_at
-- if a consent re-capture flow is added in a future phase).
-- ---------------------------------------------------------------------------

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS consent_marketing       BOOLEAN    DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_data_processing BOOLEAN    DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_recorded_at     TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- Conversion lifecycle: tracks where this lead is in the sales pipeline.
-- Updated by the CRM webhook (Phase 10, OFL-02) when deal stage changes.
-- Values: 'new' (just submitted), 'qualified' (sales team confirmed fit),
--         'closed' (signed lease), 'lost' (dropped out of pipeline).
-- Text CHECK preferred over enum — ALTER TABLE is simpler than ALTER TYPE for
-- adding values in v2 (per CONTEXT decision, consistent with 002_conversions.sql).
-- ---------------------------------------------------------------------------

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS conversion_status TEXT NOT NULL DEFAULT 'new'
    CHECK (conversion_status IN ('new', 'qualified', 'closed', 'lost'));

-- ---------------------------------------------------------------------------
-- updated_at: tracks last modification time for the lead row.
-- The leads table has created_at (Supabase default) but no updated_at.
-- Auto-updated via trigger below.
-- ---------------------------------------------------------------------------

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- Visitor-to-lead lookups: "which leads came from this visitor session?"
-- Partial index — only index rows where visitor_id is populated (v1.1+ leads).
CREATE INDEX IF NOT EXISTS idx_leads_visitor_id
  ON leads (visitor_id)
  WHERE visitor_id IS NOT NULL;

-- CRM webhook matching (Phase 10, OFL-02): look up lead by hashed email.
-- Partial index — only index rows where email_hash is populated.
CREATE INDEX IF NOT EXISTS idx_leads_email_hash
  ON leads (email_hash)
  WHERE email_hash IS NOT NULL;

-- Pipeline status queries: "show me all new leads", "count qualified leads"
CREATE INDEX IF NOT EXISTS idx_leads_conversion_status
  ON leads (conversion_status);

-- ---------------------------------------------------------------------------
-- updated_at auto-update function and triggers
--
-- Applies to: leads, conversions, conversion_queue
-- Note: visitors uses first_seen_at / last_seen_at (not updated_at) and
--       tracking_events is append-only (no updated_at column).
--       Triggers are applied only to tables that have an updated_at column.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: leads
-- DROP + CREATE pattern used because CREATE OR REPLACE is not available for
-- triggers in PostgreSQL (only for the function). Idempotent via DROP IF EXISTS.
DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: conversions (002_conversions.sql created the table with updated_at)
DROP TRIGGER IF EXISTS conversions_updated_at ON conversions;
CREATE TRIGGER conversions_updated_at
  BEFORE UPDATE ON conversions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: conversion_queue (003_conversion_queue.sql created the table with updated_at)
DROP TRIGGER IF EXISTS conversion_queue_updated_at ON conversion_queue;
CREATE TRIGGER conversion_queue_updated_at
  BEFORE UPDATE ON conversion_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
