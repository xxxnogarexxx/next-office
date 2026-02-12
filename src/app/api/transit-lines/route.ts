import { NextRequest, NextResponse } from "next/server";

interface OverpassElement {
  tags: Record<string, string>;
  members?: { type: string; geometry?: { lat: number; lon: number }[] }[];
}

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  if (!lat || !lng) return NextResponse.json({ type: "FeatureCollection", features: [] });

  const query = `[out:json][timeout:25];(relation["type"="route"]["route"="subway"](around:10000,${lat},${lng});relation["type"="route"]["route"~"light_rail|train"]["operator"~"S-Bahn"](around:10000,${lat},${lng}););out geom;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const data = await res.json();

  // Deduplicate: keep one direction per ref
  const seen = new Map<string, OverpassElement>();
  for (const el of data.elements || []) {
    const ref = el.tags?.ref;
    if (ref && !seen.has(ref)) seen.set(ref, el);
  }

  // Convert to GeoJSON MultiLineStrings
  const features = [...seen.values()].map((el) => {
    const coords: number[][][] = [];
    for (const m of el.members || []) {
      if (m.type === "way" && m.geometry && m.geometry.length > 1) {
        coords.push(m.geometry.map((p) => [
          Math.round(p.lon * 100000) / 100000,
          Math.round(p.lat * 100000) / 100000,
        ]));
      }
    }
    return {
      type: "Feature" as const,
      properties: {
        ref: el.tags.ref || "",
        name: el.tags.name || "",
        colour: el.tags.colour || "#888888",
        route: el.tags.route || "",
      },
      geometry: { type: "MultiLineString" as const, coordinates: coords },
    };
  });

  return NextResponse.json(
    { type: "FeatureCollection", features },
    { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } }
  );
}
