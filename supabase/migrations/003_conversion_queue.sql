-- Migration: 003_conversion_queue
-- Purpose: Create conversion_queue table to manage async upload of conversions
--          to advertising platforms (Google Ads for v1.1; platform column supports
--          future multi-platform expansion). Tracks retry state and backoff timing
--          for reliable delivery with dead-letter handling.
--
-- Retry backoff schedule (from OFL-07): 15min, 1h, 4h, 16h → dead_letter
-- Max retries: 5 (retry_count reaches max_retries → status = dead_letter)
--
-- Depends on: 002_conversions.sql (conversions table must exist first)
--
-- Service role bypasses RLS. API routes use service role for all writes.

-- ---------------------------------------------------------------------------
-- Table: conversion_queue
-- ---------------------------------------------------------------------------

CREATE TABLE conversion_queue (
  id              UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Conversion being uploaded (CASCADE delete keeps queue clean when conversion removed)
  conversion_id   UUID        NOT NULL REFERENCES conversions (id) ON DELETE CASCADE,

  -- Target platform (v1.1: always 'google_ads'; column supports future Meta CAPI etc.)
  platform        TEXT        NOT NULL DEFAULT 'google_ads',

  -- Upload lifecycle status (values per CONTEXT decision)
  status          TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'uploaded', 'failed', 'dead_letter')),

  -- Retry mechanics (from OFL-07: max 5 attempts with exponential backoff)
  retry_count     INTEGER     NOT NULL DEFAULT 0,
  max_retries     INTEGER     NOT NULL DEFAULT 5,

  -- Backoff scheduling: NULL on first attempt (process immediately),
  -- set to future timestamp after each failure.
  -- Backoff schedule: 15min → 1h → 4h → 16h → dead_letter
  next_retry_at   TIMESTAMPTZ,

  -- Diagnostic fields
  last_error      TEXT,        -- Most recent error message or API response for debugging
  uploaded_at     TIMESTAMPTZ, -- Set when status transitions to 'uploaded'

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- PRIMARY QUERY: cron processor selects items to process.
-- Composite partial index: "give me pending items (next_retry_at IS NULL) and
-- failed items where next_retry_at <= now()". Covering only active statuses
-- avoids scanning uploaded/dead_letter rows on every cron tick.
CREATE INDEX idx_queue_status_next_retry
  ON conversion_queue (status, next_retry_at)
  WHERE status IN ('pending', 'failed');

-- Lookup all queue entries for a given conversion (e.g. admin view)
CREATE INDEX idx_queue_conversion_id
  ON conversion_queue (conversion_id);

-- Filter by platform for future multi-platform reporting/processing
CREATE INDEX idx_queue_platform
  ON conversion_queue (platform);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE conversion_queue ENABLE ROW LEVEL SECURITY;

-- No permissive policies are created.
-- With RLS enabled and no policies, the Supabase default is DENY ALL for the
-- anon role. Service role bypasses RLS and is used exclusively by API routes.
