# Phase 1: Security Hardening - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the critical attack surface: lock down the Overpass transit proxy to predefined query types, prevent XSS in transit popups, escape user data in broker notification emails, and enforce rate limits on the lead endpoint. No new features — purely hardening existing functionality.

</domain>

<decisions>
## Implementation Decisions

### Rate limiting policy
- 10 requests per minute per IP on the lead endpoint
- Lead endpoint only — other API routes are out of scope for this phase
- In-memory store (Map-based) — resets on deploy/restart, acceptable for single-server
- Rate limit state does not need to persist across restarts

### Allowed transit queries
- Claude audits the codebase to identify all current Overpass queries
- Whitelist built from actual usage — only queries the app currently makes are allowed
- New query types require a code change (strict whitelist, not a flexible template system)

### Error responses
- User-facing error messages should be friendly and helpful, in German
- Security violations (XSS attempts, malformed queries) return generic "Ungultige Eingabe" — do not reveal that malicious input was detected
- Standard error shape across all hardened endpoints: `{ error: string, code?: string }`
- Consistent contract so frontend can handle errors predictably

### Email escaping
- All user-submitted fields are HTML-escaped before inclusion in emails (name, email, phone, company, message — no exceptions)
- Broker notification emails keep their current HTML format — escaping is applied within the HTML layout
- Claude audits all email templates in the codebase (not just lead notifications) and applies escaping wherever user data appears

### Claude's Discretion
- Rate limit response behavior (429 body content, Retry-After header)
- Transit proxy error handling when Overpass API is down/slow (graceful vs hard-fail)
- Whether rejected Overpass queries are logged for monitoring
- Transit query whitelist design (exact queries vs parameterized templates) — based on codebase audit
- Exact escaping implementation approach

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for security hardening. The success criteria in ROADMAP.md are very precise and define the exact behaviors expected.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-security-hardening*
*Context gathered: 2026-02-26*
