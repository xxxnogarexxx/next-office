-- Migration: 008_add_conversion_stages
-- Purpose: Add 'brokered' and 'tour' as conversion types for Google Ads optimization.
--
-- Strategy: Three offline conversion stages, from highest to lowest volume:
--   "Brokered"    → Lead qualified by broker team (earliest, most volume — primary initially)
--   "Tour"        → Prospect visits a coworking space (mid-funnel)
--   "Closed - Yes" → Signed lease (final conversion — primary once enough data)
--
-- NetHunt CRM stages mapped:
--   "Brokered"    → conversion_type = 'brokered'
--   "Tour"        → conversion_type = 'tour'
--   "Closed - Yes" → conversion_type = 'closed'
--
-- Depends on: 002_conversions.sql, 005_leads_extension.sql

-- ---------------------------------------------------------------------------
-- conversions.conversion_type: add 'brokered' and 'tour' values
-- PostgreSQL does not support ALTER CHECK inline, so we drop and recreate.
-- ---------------------------------------------------------------------------

ALTER TABLE conversions
  DROP CONSTRAINT IF EXISTS conversions_conversion_type_check;

ALTER TABLE conversions
  ADD CONSTRAINT conversions_conversion_type_check
    CHECK (conversion_type IN ('qualified', 'brokered', 'tour', 'closed'));

-- ---------------------------------------------------------------------------
-- leads.conversion_status: add 'brokered' and 'tour' values
-- ---------------------------------------------------------------------------

ALTER TABLE leads
  DROP CONSTRAINT IF EXISTS leads_conversion_status_check;

ALTER TABLE leads
  ADD CONSTRAINT leads_conversion_status_check
    CHECK (conversion_status IN ('new', 'qualified', 'brokered', 'tour', 'closed', 'lost'));
