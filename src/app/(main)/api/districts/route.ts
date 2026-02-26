import { NextRequest, NextResponse } from "next/server";

interface OverpassElement {
  tags: Record<string, string>;
  members?: { type: string; role: string; geometry?: { lat: number; lon: number }[] }[];
}

type Coord = [number, number];

function roundCoord(lon: number, lat: number): Coord {
  return [Math.round(lon * 100000) / 100000, Math.round(lat * 100000) / 100000];
}

function coordsEqual(a: Coord, b: Coord): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

// Chain outer way segments by matching endpoints to form proper closed rings
function chainWays(segments: Coord[][]): Coord[][] {
  if (segments.length === 0) return [];
  const remaining = segments.map((s) => [...s]); // copy
  const rings: Coord[][] = [];

  while (remaining.length > 0) {
    const ring: Coord[] = remaining.shift()!;

    let changed = true;
    while (changed) {
      changed = false;
      const ringEnd = ring[ring.length - 1];
      const ringStart = ring[0];

      // Check if ring is already closed
      if (ring.length > 3 && coordsEqual(ringEnd, ringStart)) break;

      for (let i = 0; i < remaining.length; i++) {
        const seg = remaining[i];
        const segStart = seg[0];
        const segEnd = seg[seg.length - 1];

        if (coordsEqual(ringEnd, segStart)) {
          // Append segment (skip first point, it's the same as ring end)
          ring.push(...seg.slice(1));
          remaining.splice(i, 1);
          changed = true;
          break;
        } else if (coordsEqual(ringEnd, segEnd)) {
          // Reverse segment, then append
          ring.push(...seg.reverse().slice(1));
          remaining.splice(i, 1);
          changed = true;
          break;
        } else if (coordsEqual(ringStart, segEnd)) {
          // Prepend segment
          ring.unshift(...seg.slice(0, -1));
          remaining.splice(i, 1);
          changed = true;
          break;
        } else if (coordsEqual(ringStart, segStart)) {
          // Reverse segment, then prepend
          ring.unshift(...seg.reverse().slice(0, -1));
          remaining.splice(i, 1);
          changed = true;
          break;
        }
      }
    }

    // Close the ring
    if (ring.length > 2 && !coordsEqual(ring[0], ring[ring.length - 1])) {
      ring.push([...ring[0]] as Coord);
    }

    if (ring.length > 3) {
      rings.push(ring);
    }
  }

  return rings;
}

function parseCoord(value: string | null): number | null {
  if (!value) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
}

export async function GET(request: NextRequest) {
  const latParam = request.nextUrl.searchParams.get("lat");
  const lngParam = request.nextUrl.searchParams.get("lng");

  const lat = parseCoord(latParam);
  const lng = parseCoord(lngParam);

  if (lat === null || lng === null) {
    return NextResponse.json({ error: "Ungultige Eingabe" }, { status: 400 });
  }

  const query = `[out:json][timeout:25];relation["admin_level"="9"]["boundary"="administrative"](around:15000,${lat},${lng});out geom;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const data = await res.json();

  const features = (data.elements || []).map((el: OverpassElement) => {
    // Collect outer way segments
    const segments: Coord[][] = [];
    for (const m of el.members || []) {
      if (m.role === "outer" && m.type === "way" && m.geometry && m.geometry.length > 1) {
        segments.push(m.geometry.map((p) => roundCoord(p.lon, p.lat)));
      }
    }

    // Chain segments into proper closed rings
    const rings = chainWays(segments);

    if (rings.length === 0) return null;

    return {
      type: "Feature" as const,
      properties: { name: el.tags?.name || "" },
      geometry: {
        type: "Polygon" as const,
        coordinates: rings, // first ring = outer, rest = holes
      },
    };
  }).filter(Boolean);

  return NextResponse.json(
    { type: "FeatureCollection", features },
    { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } }
  );
}
