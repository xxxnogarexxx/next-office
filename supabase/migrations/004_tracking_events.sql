-- Migration: 004_tracking_events
-- Purpose: Create tracking_events table for server-side event capture.
--          Phase 11 (Server-Side Event Proxy) writes to this table.
--          Stores page views, form interactions, and custom events with
--          flexible JSONB params. References visitors for attribution.
--
-- Depends on: 001_visitors.sql (visitors table must exist first)
--
-- Service role bypasses RLS. API routes use service role for all writes.

-- ---------------------------------------------------------------------------
-- Table: tracking_events
-- ---------------------------------------------------------------------------

CREATE TABLE tracking_events (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Attribution: nullable FK so events survive visitor cleanup cycles.
  -- ON DELETE SET NULL preserves event data even if the visitor row is pruned.
  visitor_id  UUID        REFERENCES visitors (id) ON DELETE SET NULL,

  -- Event identity
  event_name  TEXT        NOT NULL,  -- e.g. 'page_view', 'generate_lead', 'form_start'
  event_id    TEXT,                  -- Deduplication key for GA4 (Phase 11 SSP-03)

  -- Flexible event payload — avoids schema migrations for new event types
  params      JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- Page context
  page_url    TEXT,

  -- Timestamps
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- JOIN performance: visitor attribution lookups
CREATE INDEX idx_tracking_events_visitor_id
  ON tracking_events (visitor_id);

-- Filtering by event type (e.g. "show me all generate_lead events")
CREATE INDEX idx_tracking_events_event_name
  ON tracking_events (event_name);

-- Time-range queries and event stream analytics
CREATE INDEX idx_tracking_events_created_at
  ON tracking_events (created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- No permissive policies are created.
-- With RLS enabled and no policies, the Supabase default is DENY ALL for the
-- anon role. Service role bypasses RLS and is used exclusively by API routes.
