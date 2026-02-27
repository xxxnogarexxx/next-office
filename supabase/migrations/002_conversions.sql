-- Migration: 002_conversions
-- Purpose: Create conversions table to record qualified and closed conversion events.
--          Each row maps a CRM deal stage change to a Google Ads conversion.
--          Attribution data is denormalized to avoid JOINs at upload time.
--          Idempotency key prevents duplicate uploads for the same deal+type pair.
--
-- Depends on: leads table (must exist — created before this milestone)
--
-- Service role bypasses RLS. API routes use service role for all writes.

-- ---------------------------------------------------------------------------
-- Table: conversions
-- ---------------------------------------------------------------------------

CREATE TABLE conversions (
  id                  UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Lead linkage: every conversion traces back to a lead submission
  lead_id             UUID         NOT NULL REFERENCES leads (id) ON DELETE CASCADE,

  -- Conversion classification (values per CONTEXT decision: OFL-01)
  conversion_type     TEXT         NOT NULL CHECK (conversion_type IN ('qualified', 'closed')),

  -- Monetary value for Google Ads value-based bidding (nullable — not always known)
  conversion_value    NUMERIC(10, 2),
  conversion_currency TEXT         NOT NULL DEFAULT 'EUR',  -- ISO 4217 code

  -- Idempotency: prevents duplicate uploads for the same deal + conversion type.
  -- Format: {crm_deal_id}:{conversion_type} (per CONTEXT decision: OFL-03)
  idempotency_key     TEXT         NOT NULL UNIQUE,
  crm_deal_id         TEXT,        -- Raw CRM deal identifier for traceability

  -- Denormalized attribution: copied from lead's visitor at conversion creation time.
  -- Avoids JOIN against visitors table during async upload processing.
  gclid               TEXT,        -- Google Ads click ID for conversion matching
  email_hash          TEXT,        -- SHA-256 hashed email for Enhanced Conversions upload
  utm_source          TEXT,
  utm_medium          TEXT,
  utm_campaign        TEXT,

  -- Timestamps
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- Lookup by lead for "show all conversions for this lead" queries
CREATE INDEX idx_conversions_lead_id
  ON conversions (lead_id);

-- idempotency_key is already covered by the UNIQUE constraint; listed explicitly
-- here so the intent is documented in code.
CREATE INDEX idx_conversions_idempotency_key
  ON conversions (idempotency_key);

-- Time-range reporting queries
CREATE INDEX idx_conversions_created_at
  ON conversions (created_at);

-- Filter by conversion type (e.g. "count closed conversions this month")
CREATE INDEX idx_conversions_type
  ON conversions (conversion_type);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

-- No permissive policies are created.
-- With RLS enabled and no policies, the Supabase default is DENY ALL for the
-- anon role. Service role bypasses RLS and is used exclusively by API routes.
