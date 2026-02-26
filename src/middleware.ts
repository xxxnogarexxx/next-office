import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  VISITOR_COOKIE_NAME,
  VISITOR_COOKIE_MAX_AGE,
  UTM_COOKIE_PREFIX,
  UTM_COOKIE_MAX_AGE,
  UTM_KEYS,
  generateVisitorId,
} from "@/lib/tracking/visitor";

/**
 * Server-side cookie tracking for Google Ads click IDs.
 *
 * When a user lands with ?gclid=... (or gbraid/wbraid), the middleware sets
 * HTTP-only first-party cookies. These survive page refreshes and return
 * visits within 90 days — unlike in-memory React state which is lost on
 * refresh. The API route reads these cookies as a fallback.
 */

const TRACKING_KEYS = ["gclid", "gbraid", "wbraid"] as const;
const COOKIE_PREFIX = "_no_"; // next-office prefix
const MAX_AGE = 90 * 24 * 60 * 60; // 90 days in seconds

const ALLOWED_ORIGINS = [
  "https://next-office.io",
  "https://www.next-office.io",
];
if (process.env.NODE_ENV === "development") {
  ALLOWED_ORIGINS.push("http://localhost:3000");
}

export function middleware(request: NextRequest) {
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

  if (isApiRoute) {
    const origin = request.headers.get("origin");

    // Handle preflight OPTIONS requests
    if (request.method === "OPTIONS") {
      const preflightResponse = new NextResponse(null, { status: 204 });
      if (origin && ALLOWED_ORIGINS.includes(origin)) {
        preflightResponse.headers.set("Access-Control-Allow-Origin", origin);
      }
      preflightResponse.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
      );
      preflightResponse.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, x-csrf-token"
      );
      preflightResponse.headers.set("Access-Control-Max-Age", "86400");
      return preflightResponse;
    }

    // For actual requests, set CORS header if origin is allowed
    const response = NextResponse.next();
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    return response;
  }

  // Non-API routes: handle tracking cookies
  const response = NextResponse.next();
  const params = request.nextUrl.searchParams;

  let hasClickId = false;

  for (const key of TRACKING_KEYS) {
    const value = params.get(key);
    if (value) {
      hasClickId = true;
      response.cookies.set(`${COOKIE_PREFIX}${key}`, value, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: MAX_AGE,
        path: "/",
      });
    }
  }

  // Store landing page & referrer alongside click IDs
  if (hasClickId) {
    response.cookies.set(`${COOKIE_PREFIX}lp`, request.nextUrl.href, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });

    const referrer = request.headers.get("referer") || "";
    if (referrer) {
      response.cookies.set(`${COOKIE_PREFIX}ref`, referrer, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: MAX_AGE,
        path: "/",
      });
    }
  }

  // --- visitor_id (CAP-01) ---
  // Preserve existing visitor_id on return visits. Generate a new UUID only
  // when no _no_vid cookie is present (first visit).
  const existingVisitorId = request.cookies.get(VISITOR_COOKIE_NAME)?.value;
  if (!existingVisitorId) {
    response.cookies.set(VISITOR_COOKIE_NAME, generateVisitorId(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: VISITOR_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  // --- UTM parameters (CAP-02) ---
  // Set a cookie for each UTM parameter present in the query string.
  // Only sets cookies when the parameter is present — no blank cookies.
  // Does NOT overwrite existing UTM cookies (first-touch attribution model):
  // once a UTM cookie is set, it persists for 30 days unless a new UTM arrives.
  for (const key of UTM_KEYS) {
    const value = params.get(`utm_${key}`);
    if (value) {
      response.cookies.set(`${UTM_COOKIE_PREFIX}${key}`, value, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: UTM_COOKIE_MAX_AGE,
        path: "/",
      });
    }
  }

  return response;
}

// Run on all routes (page + API), excluding static assets
export const config = {
  matcher: [
    // Page routes and API routes (tracking cookies + CORS)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
