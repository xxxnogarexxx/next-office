# Phase 7: Database Foundation - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Create all tracking tables in Supabase (visitors, leads extension, conversions, conversion_queue, tracking_events) with correct schema, indexes, FK relationships, and RLS policies that block anonymous access. No application code, no API routes, no middleware — schema only.

</domain>

<decisions>
## Implementation Decisions

### Platform scope
- Google Ads only for v1.1 — Meta/Facebook explicitly out of scope
- Store gclid as the only click ID column in visitors table
- No fbclid/msclkid columns — those belong to v2 (META-01)

### Tracking events table
- Create tracking_events table in this phase alongside other tables
- Phase 11 (Server-Side Event Proxy) will write to it, but schema lives here
- RLS policies for tracking_events included per DB-05

### Conversion lifecycle
- conversion_type values: qualified, closed (from OFL-01)
- conversion_queue statuses: pending, uploaded, failed, dead_letter (from success criteria)
- Idempotency key format: {crm_deal_id}:{conversion_type} (from OFL-03)

### Retry mechanics (schema support)
- retry_count column, max 5 attempts (from OFL-07)
- next_retry_at timestamp for backoff scheduling
- Backoff schedule: 15min, 1h, 4h, 16h, then dead_letter (from OFL-07)
- Platform column in queue for future multi-platform support

### Leads table extension
- Existing leads table gets new columns: visitor_id FK, UTM columns (source, medium, campaign, term, content), email_hash, consent fields, conversion_status
- Standard ALTER TABLE migration — site just launched, minimal existing data

### RLS policies
- All new tables (visitors, conversions, conversion_queue, tracking_events) deny anon access
- Service role used by API routes for all writes

### Claude's Discretion
- Index selection (which columns, partial indexes, composite indexes)
- IP hash algorithm choice
- Exact consent field names and types in leads table
- tracking_events table column design (event_name, params, visitor_id FK, timestamps)
- Whether to use Supabase enums vs text check constraints for status fields

</decisions>

<specifics>
## Specific Ideas

No specific requirements beyond what's in DB-01 through DB-05 and the downstream requirements that define the data model. The requirements and success criteria are detailed enough to drive schema design directly.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. Meta/Facebook columns are already tracked in v2 requirements (META-01).

</deferred>

---

*Phase: 07-database-foundation*
*Context gathered: 2026-02-26*
