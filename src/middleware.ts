import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(request: NextRequest) {
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

  return response;
}

// Only run on page requests, not on static assets or API routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
