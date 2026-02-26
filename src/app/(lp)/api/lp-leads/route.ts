import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * LP-specific lead submission endpoint.
 *
 * Accepts structured inquiry data from the LP lead capture form,
 * validates required fields, persists to Supabase leads table,
 * and fires a Resend email notification to the broker team.
 *
 * Google Ads tracking: reads gclid/gbraid/wbraid from the request body first,
 * falls back to server-side cookies set by middleware (for users who navigated
 * to other pages before submitting).
 *
 * UTM and company data are stored in the message field as structured prefix
 * to maintain compatibility with the existing leads table schema.
 */

// HTML escape utility — prevents XSS in broker notification emails
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Simple in-memory rate limiter
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { limited: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false };
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { limited: true, retryAfter };
  }

  return { limited: false };
}

// Periodic cleanup of stale entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now >= entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

export async function POST(request: Request) {
  // Rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const rateCheck = checkRateLimit(ip);
  if (rateCheck.limited) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfter) },
      }
    );
  }

  try {
    const body = await request.json();

    // Server-side validation of required fields
    const requiredFields: Array<[string, string]> = [
      ["name", "Name"],
      ["email", "E-Mail"],
      ["phone", "Telefon"],
      ["team_size", "Teamgröße"],
      ["start_date", "Einzugsdatum"],
      ["city", "Stadt"],
    ];

    for (const [field, label] of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${label} ist erforderlich.` },
          { status: 400 }
        );
      }
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Ungültige E-Mail-Adresse." },
        { status: 400 }
      );
    }

    // Server-side context
    const userAgent = request.headers.get("user-agent") || null;

    // Google Ads tracking: client body first, server-side cookies as fallback
    const cookieStore = await cookies();
    const gclid = body.gclid || cookieStore.get("_no_gclid")?.value || null;
    const gbraid = body.gbraid || cookieStore.get("_no_gbraid")?.value || null;
    const wbraid = body.wbraid || cookieStore.get("_no_wbraid")?.value || null;
    const landingPage = body.landing_page || cookieStore.get("_no_lp")?.value || null;
    const referrer = body.referrer || cookieStore.get("_no_ref")?.value || null;

    // Build structured message prefix for UTM + company data
    // Stored inline with message to maintain existing table schema compatibility
    const metaParts: string[] = [];
    if (body.company) metaParts.push(`[Firma: ${body.company}]`);
    if (body.utm_source || body.utm_medium || body.utm_campaign) {
      const utmParts = [body.utm_source, body.utm_medium, body.utm_campaign]
        .filter(Boolean)
        .join("/");
      metaParts.push(`[UTM: ${utmParts}]`);
    }
    if (body.utm_term) metaParts.push(`[Keyword: ${body.utm_term}]`);

    const metaPrefix = metaParts.length > 0 ? metaParts.join(" ") + "\n\n" : "";
    const fullMessage = body.message
      ? `${metaPrefix}${body.message}`
      : metaPrefix.trim() || null;

    // Save to Supabase
    const { error: dbError } = await supabase.from("leads").insert({
      name: body.name,
      email: body.email,
      phone: body.phone,
      team_size: Number(body.team_size),
      start_date: body.start_date,
      city: body.city,
      message: fullMessage,
      listing_id: null,
      listing_name: null,
      gclid,
      gbraid,
      wbraid,
      landing_page: landingPage,
      referrer,
      user_agent: userAgent,
    });

    if (dbError) {
      console.error("Supabase insert error (lp-leads):", dbError);
      return NextResponse.json(
        { error: "Fehler beim Speichern." },
        { status: 500 }
      );
    }

    // Extract company name from body or email domain for email subject
    const freeProviders = new Set([
      "gmail", "googlemail", "yahoo", "hotmail", "outlook", "live",
      "icloud", "me", "mac", "aol", "web", "gmx", "mail", "posteo",
      "proton", "protonmail", "t-online", "freenet", "arcor", "online",
    ]);

    let companyDisplay = body.company || "";
    if (!companyDisplay && body.email?.includes("@")) {
      const domain = body.email.split("@")[1].split(".")[0].toLowerCase();
      if (!freeProviders.has(domain)) {
        companyDisplay = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    }

    // UTM info row for email (broker context) — all user fields escaped
    const utmRow =
      body.utm_source || body.utm_term
        ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Quelle</td><td style="padding:4px 0">${[body.utm_source, body.utm_medium, body.utm_term].filter(Boolean).map((s) => escapeHtml(s)).join(" / ")}</td></tr>`
        : "";

    // Send email notification (fire-and-forget — don't block response)
    resend.emails
      .send({
        from: "NextOffice <noreply@next-office.io>",
        to: process.env.NOTIFICATION_EMAIL!,
        subject: `[LP] ${body.team_size ? `${escapeHtml(String(body.team_size))} AP` : "? AP"} – ${
          body.start_date
            ? new Date(body.start_date).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })
            : "?"
        } – ${escapeHtml(body.city || "?")}${companyDisplay ? ` – ${escapeHtml(companyDisplay)}` : ""}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px">
            <h2 style="margin:0 0 16px">Neue LP-Anfrage</h2>
            <table style="border-collapse:collapse;font-size:14px;width:100%">
              <tr><td style="padding:4px 12px 4px 0;color:#64748b">Name</td><td style="padding:4px 0;font-weight:600">${escapeHtml(body.name || "")}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#64748b">E-Mail</td><td style="padding:4px 0"><a href="mailto:${encodeURIComponent(body.email)}">${escapeHtml(body.email || "")}</a></td></tr>
              ${companyDisplay ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Firma</td><td style="padding:4px 0;font-weight:600">${escapeHtml(companyDisplay)}</td></tr>` : ""}
              <tr><td style="padding:4px 12px 4px 0;color:#64748b">Telefon</td><td style="padding:4px 0"><a href="tel:${encodeURIComponent(body.phone)}">${escapeHtml(body.phone || "")}</a></td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#64748b">Teamgröße</td><td style="padding:4px 0">${escapeHtml(String(body.team_size))} Personen</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#64748b">Einzugsdatum</td><td style="padding:4px 0">${new Date(body.start_date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#64748b">Stadt</td><td style="padding:4px 0">${escapeHtml(body.city || "")}</td></tr>
              ${utmRow}
            </table>
            ${body.message ? `<p style="margin:16px 0 0;padding:12px;background:#f8fafc;border-radius:8px;font-size:14px">${escapeHtml(body.message)}</p>` : ""}
            <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">LP via next-office.io</p>
          </div>
        `,
      })
      .catch((err) => console.error("Resend error (lp-leads):", err));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Ungültige Anfrage." },
      { status: 400 }
    );
  }
}
