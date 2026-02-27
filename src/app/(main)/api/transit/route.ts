import { NextRequest, NextResponse } from "next/server";

const ALLOWED_QUERY_TYPES = {
  "listing-pois": (lat: number, lng: number) =>
    `[out:json][timeout:15];(node["station"="subway"](around:1500,${lat},${lng});node["railway"="station"]["station"="light_rail"](around:2000,${lat},${lng});node["highway"="bus_stop"](around:800,${lat},${lng}););out body;`,
} as const;

function parseCoord(value: string | null): number | null {
  if (!value) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 1,
  backoffMs = 2000
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok || res.status < 500) return res; // Don't retry client errors
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }
      return res; // Return last failed response
    } catch (err) {
      clearTimeout(timeout);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unreachable");
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const latParam = request.nextUrl.searchParams.get("lat");
  const lngParam = request.nextUrl.searchParams.get("lng");

  if (!type || !(type in ALLOWED_QUERY_TYPES)) {
    return NextResponse.json({ error: "Ungultige Eingabe" }, { status: 400 });
  }

  const lat = parseCoord(latParam);
  const lng = parseCoord(lngParam);

  if (lat === null || lng === null) {
    return NextResponse.json({ error: "Ungultige Eingabe" }, { status: 400 });
  }

  const queryFn = ALLOWED_QUERY_TYPES[type as keyof typeof ALLOWED_QUERY_TYPES];
  const query = queryFn(lat, lng);

  try {
    const res = await fetchWithRetry(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { elements: [], error: `Overpass returned ${res.status}` },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { elements: [], error: message },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
