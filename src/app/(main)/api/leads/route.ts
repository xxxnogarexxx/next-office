import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Basic validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name und E-Mail sind erforderlich." },
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

    // Save to Supabase
    const { error } = await supabase.from("leads").insert({
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      team_size: body.team_size || null,
      start_date: body.start_date || null,
      city: body.city || null,
      message: body.message || null,
      listing_id: body.listing_id || null,
      listing_name: body.listing_name || null,
      // Google Ads tracking (in-memory context + server cookie fallback)
      gclid,
      gbraid,
      wbraid,
      landing_page: landingPage,
      referrer,
      user_agent: userAgent,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Fehler beim Speichern." },
        { status: 500 }
      );
    }

    // Extract company name from email domain
    const freeProviders = new Set(["gmail", "googlemail", "yahoo", "hotmail", "outlook", "live", "icloud", "me", "mac", "aol", "web", "gmx", "mail", "posteo", "proton", "protonmail", "t-online", "freenet", "arcor", "online"]);
    let company = "";
    if (body.email?.includes("@")) {
      const domain = body.email.split("@")[1].split(".")[0].toLowerCase();
      if (!freeProviders.has(domain)) {
        company = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    }

    // Send email notification (don't block the response if it fails)
    const listing = body.listing_name
      ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Büro</td><td style="padding:4px 0;font-weight:600">${escapeHtml(body.listing_name)}</td></tr>`
      : "";

    resend.emails
      .send({
        from: "NextOffice <noreply@next-office.io>",
        to: process.env.NOTIFICATION_EMAIL!,
        subject: `[NextOffice] ${body.team_size ? `${escapeHtml(String(body.team_size))} AP` : "? AP"} – ${body.start_date ? new Date(body.start_date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "?"} – ${escapeHtml(body.city || "?")}${company ? ` – ${escapeHtml(company)}` : ""}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px">
            <h2 style="margin:0 0 16px">Neue Lead-Anfrage</h2>
            <table style="border-collapse:collapse;font-size:14px;width:100%">
              <tr><td style="padding:4px 12px 4px 0;color:#64748b">Name</td><td style="padding:4px 0;font-weight:600">${escapeHtml(body.name || "")}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#64748b">E-Mail</td><td style="padding:4px 0"><a href="mailto:${encodeURIComponent(body.email)}">${escapeHtml(body.email || "")}</a></td></tr>
              ${company ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Firma</td><td style="padding:4px 0;font-weight:600">${escapeHtml(company)}</td></tr>` : ""}
              ${body.phone ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Telefon</td><td style="padding:4px 0"><a href="tel:${encodeURIComponent(body.phone)}">${escapeHtml(body.phone)}</a></td></tr>` : ""}
              ${body.team_size ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Teamgröße</td><td style="padding:4px 0">${escapeHtml(String(body.team_size))} Personen</td></tr>` : ""}
              ${body.start_date ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Einzugsdatum</td><td style="padding:4px 0">${new Date(body.start_date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}</td></tr>` : ""}
              ${body.city ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Stadt</td><td style="padding:4px 0">${escapeHtml(body.city)}</td></tr>` : ""}
              ${listing}
            </table>
            ${body.message ? `<p style="margin:16px 0 0;padding:12px;background:#f8fafc;border-radius:8px;font-size:14px">${escapeHtml(body.message)}</p>` : ""}
            <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">Via next-office.io</p>
          </div>
        `,
      })
      .catch((err) => console.error("Resend error:", err));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Ungültige Anfrage." },
      { status: 400 }
    );
  }
}
