/**
 * Email notification for lead submissions.
 *
 * This module is the single source of truth for:
 *   - escapeHtml() — used to prevent XSS in all broker notification emails
 *   - sendLeadNotification() — async email sender
 *
 * The function awaits the Resend API call and catches errors internally.
 * Callers run it inside next/server `after()` so it completes after the
 * response is sent without being killed by serverless container shutdown.
 *
 * Both /api/leads (source: 'main') and /api/lp-leads (source: 'lp') use this
 * module. The source param controls subject prefix and heading text.
 */

import { Resend } from "resend";
import type { ValidatedLeadData } from "./validation";

// ---------------------------------------------------------------------------
// HTML escaping — prevents XSS in broker notification emails.
// All user-provided fields must pass through this before rendering in HTML.
// ---------------------------------------------------------------------------

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// Free email providers — domain extraction skips these for company name
// ---------------------------------------------------------------------------

const FREE_PROVIDERS = new Set([
  "gmail",
  "googlemail",
  "yahoo",
  "hotmail",
  "outlook",
  "live",
  "icloud",
  "me",
  "mac",
  "aol",
  "web",
  "gmx",
  "mail",
  "posteo",
  "proton",
  "protonmail",
  "t-online",
  "freenet",
  "arcor",
  "online",
]);

function extractCompanyFromEmail(email: string): string {
  if (!email.includes("@")) return "";
  const domain = email.split("@")[1].split(".")[0].toLowerCase();
  if (FREE_PROVIDERS.has(domain)) return "";
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

// ---------------------------------------------------------------------------
// sendLeadNotification — async email sender
//
// Returns a Promise that resolves when the Resend API call completes.
// Errors are logged to console.error (non-fatal) and never re-thrown.
// Callers should use next/server `after()` to run this without blocking
// the API response in serverless environments.
// ---------------------------------------------------------------------------

export async function sendLeadNotification(
  data: ValidatedLeadData,
  source: "main" | "lp"
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.NOTIFICATION_EMAIL;

  if (!resendKey || !notificationEmail) {
    console.error(
      "[leads/email] RESEND_API_KEY or NOTIFICATION_EMAIL not set — email skipped."
    );
    return;
  }

  const resend = new Resend(resendKey);

  // Determine company display name
  let companyDisplay = "";
  if (source === "lp" && data.company) {
    companyDisplay = data.company;
  } else {
    companyDisplay = extractCompanyFromEmail(data.email);
  }

  // Subject line
  const teamSizePart = data.team_size
    ? `${escapeHtml(String(data.team_size))} AP`
    : "? AP";
  const datePart = data.start_date
    ? new Date(data.start_date).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    : "?";
  const cityPart = escapeHtml(data.city || "?");
  const companyPart = companyDisplay
    ? ` – ${escapeHtml(companyDisplay)}`
    : "";

  const subjectPrefix = source === "main" ? "[NextOffice]" : "[LP]";
  const subject = `${subjectPrefix} ${teamSizePart} – ${datePart} – ${cityPart}${companyPart}`;

  // Email heading
  const heading =
    source === "main" ? "Neue Lead-Anfrage" : "Neue LP-Anfrage";

  // Optional listing row (main source only)
  const listingRow =
    source === "main" && data.listing_name
      ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Büro</td><td style="padding:4px 0;font-weight:600">${escapeHtml(data.listing_name)}</td></tr>`
      : "";

  const footerLabel =
    source === "main" ? "Via next-office.io" : "LP via next-office.io";

  // Attribution section — landing page, gclid, campaign
  const hasAttribution = data.landing_page || data.gclid || data.utm_campaign;

  // Extract readable path from landing page URL
  let landingPageDisplay = "";
  if (data.landing_page) {
    try {
      const url = new URL(data.landing_page);
      landingPageDisplay = url.pathname + url.search;
    } catch {
      landingPageDisplay = data.landing_page;
    }
  }

  const attributionHtml = hasAttribution
    ? `
      <div style="margin:16px 0 0;padding:12px;background:#f0f9ff;border-radius:8px;border-left:3px solid #3b82f6">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#1e40af;text-transform:uppercase;letter-spacing:0.5px">Attribution</p>
        <table style="border-collapse:collapse;font-size:13px;width:100%">
          ${data.landing_page ? `<tr><td style="padding:2px 10px 2px 0;color:#64748b;white-space:nowrap">Landing Page</td><td style="padding:2px 0"><a href="${escapeHtml(data.landing_page)}" style="color:#2563eb;text-decoration:none">${escapeHtml(landingPageDisplay)}</a></td></tr>` : ""}
          ${data.gclid ? `<tr><td style="padding:2px 10px 2px 0;color:#64748b;white-space:nowrap">GCLID</td><td style="padding:2px 0;font-family:monospace;font-size:12px">${escapeHtml(data.gclid)}</td></tr>` : ""}
          ${data.utm_campaign ? `<tr><td style="padding:2px 10px 2px 0;color:#64748b;white-space:nowrap">Kampagne</td><td style="padding:2px 0">${escapeHtml(data.utm_campaign)}</td></tr>` : ""}
          ${data.utm_source || data.utm_medium ? `<tr><td style="padding:2px 10px 2px 0;color:#64748b;white-space:nowrap">Quelle</td><td style="padding:2px 0">${[data.utm_source, data.utm_medium].filter(Boolean).map((s) => escapeHtml(s as string)).join(" / ")}</td></tr>` : ""}
        </table>
      </div>`
    : "";

  const html = `
    <div style="font-family:sans-serif;max-width:500px">
      <h2 style="margin:0 0 16px">${heading}</h2>
      <table style="border-collapse:collapse;font-size:14px;width:100%">
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Name</td><td style="padding:4px 0;font-weight:600">${escapeHtml(data.name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">E-Mail</td><td style="padding:4px 0"><a href="mailto:${encodeURIComponent(data.email)}">${escapeHtml(data.email)}</a></td></tr>
        ${companyDisplay ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Firma</td><td style="padding:4px 0;font-weight:600">${escapeHtml(companyDisplay)}</td></tr>` : ""}
        ${data.phone ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Telefon</td><td style="padding:4px 0"><a href="tel:${encodeURIComponent(data.phone)}">${escapeHtml(data.phone)}</a></td></tr>` : ""}
        ${data.team_size ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Teamgröße</td><td style="padding:4px 0">${escapeHtml(String(data.team_size))} Personen</td></tr>` : ""}
        ${data.start_date ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Einzugsdatum</td><td style="padding:4px 0">${new Date(data.start_date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}</td></tr>` : ""}
        ${data.city ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Stadt</td><td style="padding:4px 0">${escapeHtml(data.city)}</td></tr>` : ""}
        ${listingRow}
      </table>
      ${data.message ? `<p style="margin:16px 0 0;padding:12px;background:#f8fafc;border-radius:8px;font-size:14px">${escapeHtml(data.message)}</p>` : ""}
      ${attributionHtml}
      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">${footerLabel}</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "NextOffice <noreply@next-office.io>",
      to: notificationEmail,
      subject,
      html,
    });
  } catch (err) {
    console.error(`[leads/email] Resend error (source: ${source}):`, err);
  }
}
