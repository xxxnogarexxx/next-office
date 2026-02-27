-- Migration: 007_conversion_metrics_view
-- Purpose: Create a read-only view that computes key conversion pipeline metrics:
--          1. gclid_capture_rate: fraction of leads that have Google Ads click attribution
--          2. upload_success_rate: fraction of queued conversions successfully uploaded
--
-- These metrics answer:
--   "What % of our leads came from Google Ads clicks?" (gclid capture rate)
--   "What % of our queued conversions made it to Google Ads?" (upload success rate)
--
-- Queryable via: SELECT * FROM conversion_metrics
-- No manual SQL joins required — the view encapsulates all join logic.
--
-- Depends on: 001_visitors.sql, 003_conversion_queue.sql, 005_leads_extension.sql
--
-- Service role bypasses RLS and can query this view. The anon role cannot
-- access the underlying tables (RLS denies), so the view is effectively
-- service-role-only.

-- ---------------------------------------------------------------------------
-- View: conversion_metrics
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW conversion_metrics AS
SELECT
  -- GCLID capture rate: leads with gclid attribution / total leads
  -- A lead has gclid attribution if either:
  --   1. The lead's own gclid column is non-null (captured from URL params at form submission)
  --   2. The lead's linked visitor has a non-null gclid (captured by middleware)
  -- Uses COALESCE to check both sources.
  -- NULLIF prevents division by zero when no leads exist.
  COALESCE(
    CAST(
      COUNT(*) FILTER (
        WHERE l.gclid IS NOT NULL OR v.gclid IS NOT NULL
      ) AS NUMERIC
    ) / NULLIF(COUNT(*)::NUMERIC, 0),
    0
  ) AS gclid_capture_rate,

  -- Raw counts for gclid metric
  COUNT(*) FILTER (
    WHERE l.gclid IS NOT NULL OR v.gclid IS NOT NULL
  ) AS leads_with_gclid,
  COUNT(*) AS total_leads,

  -- Upload success rate: uploaded queue items / total queue items
  -- Computed as a subquery since it's from a different table (conversion_queue).
  -- NULLIF prevents division by zero when queue is empty.
  COALESCE(
    (SELECT CAST(
      COUNT(*) FILTER (WHERE cq.status = 'uploaded') AS NUMERIC
    ) / NULLIF(COUNT(*)::NUMERIC, 0)
    FROM conversion_queue cq),
    0
  ) AS upload_success_rate,

  -- Raw counts for upload metric
  (SELECT COUNT(*) FILTER (WHERE cq.status = 'uploaded') FROM conversion_queue cq) AS uploads_successful,
  (SELECT COUNT(*) FROM conversion_queue cq) AS total_queued,

  -- Queue status breakdown (bonus: useful for dashboard)
  (SELECT COUNT(*) FILTER (WHERE cq.status = 'pending') FROM conversion_queue cq) AS queue_pending,
  (SELECT COUNT(*) FILTER (WHERE cq.status = 'failed') FROM conversion_queue cq) AS queue_failed,
  (SELECT COUNT(*) FILTER (WHERE cq.status = 'dead_letter') FROM conversion_queue cq) AS queue_dead_letter,

  -- Timestamp for when this metric was computed
  now() AS computed_at

FROM leads l
LEFT JOIN visitors v ON v.id = l.visitor_id;
