/**
 * Import real listings from Contentful CMS (coworkingguide.de)
 *
 * Usage:
 *   CONTENTFUL_SPACE_ID=2qmi64lat34l CONTENTFUL_ACCESS_TOKEN=vt67bkakCriPgQtXmlxDlP_7CXN33BJ-w0nbw05IG6M npx tsx scripts/import-contentful.ts
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!SPACE_ID || !ACCESS_TOKEN) {
  console.error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_ACCESS_TOKEN");
  process.exit(1);
}

const BASE_URL = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/master`;

// Target city Contentful entry IDs → our slug mapping
const TARGET_CITIES: Record<string, { name: string; slug: string }> = {
  "3DtM98ikx5FruAjyiWxFaB": { name: "Berlin", slug: "berlin" },
  "14zXiCXGHinezE32lM1xsY": { name: "München", slug: "muenchen" },
  "6CL8j5SVx93ATrJFVwIWQj": { name: "Hamburg", slug: "hamburg" },
  "7nAqjydbBHr1X7bcCgFh5t": { name: "Frankfurt", slug: "frankfurt" },
  "7Ke2pSOE7gXNk35RnrrEZL": { name: "Köln", slug: "koeln" },
  "4OuS6fiZru4cW9R6174Zf1": { name: "Düsseldorf", slug: "duesseldorf" },
};

// Equipment entry IDs → labels (will be populated from resolved includes)
const EQUIPMENT_LABELS: Record<string, string> = {};

interface ContentfulResponse {
  total: number;
  skip: number;
  limit: number;
  items: any[];
  includes?: {
    Entry?: any[];
    Asset?: any[];
  };
}

async function fetchEntries(skip = 0): Promise<ContentfulResponse> {
  const url = `${BASE_URL}/entries?access_token=${ACCESS_TOKEN}&content_type=space&include=2&limit=100&skip=${skip}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Contentful API error: ${res.status} ${await res.text()}`);
  return res.json();
}

// Convert Contentful RichText to plain text
function richTextToPlain(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.nodeType === "text") return node.value || "";
  if (node.content && Array.isArray(node.content)) {
    return node.content
      .map((child: any) => richTextToPlain(child))
      .join(node.nodeType === "paragraph" ? "\n\n" : "");
  }
  return "";
}

// Parse price string like "ab 800 Euro / Monat + MwSt." → 800
function extractPrice(priceStr: string): number | null {
  const match = priceStr.match(/(\d[\d.,]*)\s*(?:Euro|€)/i);
  if (!match) return null;
  return Math.round(parseFloat(match[1].replace(".", "").replace(",", ".")));
}

// Parse hardFacts array
function parseHardFacts(facts: string[]): {
  publicTransport: string | null;
  areaSqm: number | null;
  noticePeriod: string | null;
  capacityMin: number | null;
  capacityMax: number | null;
  openingHours: string | null;
} {
  const result = {
    publicTransport: null as string | null,
    areaSqm: null as number | null,
    noticePeriod: null as string | null,
    capacityMin: null as number | null,
    capacityMax: null as number | null,
    openingHours: null as string | null,
  };

  for (const fact of facts) {
    const parts = fact.split("--");
    if (parts.length < 2) continue;
    const text = parts[0].trim();
    const tag = parts[parts.length - 1].trim().toLowerCase();

    if (tag === "bus") {
      result.publicTransport = text;
    } else if (tag === "size") {
      // Try to extract sqm, e.g. "1.200 qm" or "1200qm"
      const sqmMatch = text.match(/([\d.]+)\s*(?:qm|m²)/i);
      if (sqmMatch) {
        result.areaSqm = Math.round(parseFloat(sqmMatch[1].replace(".", "")));
      }
      // Try to extract capacity, e.g. "1 - 100 Arbeitsplätze" or "50 Büros"
      const capMatch = text.match(/(\d+)\s*[-–]\s*(\d+)/);
      if (capMatch) {
        result.capacityMin = parseInt(capMatch[1]);
        result.capacityMax = parseInt(capMatch[2]);
      } else {
        const singleCap = text.match(/(\d+)\s*(?:Arbeitspl|Büro|Plät|Desk)/i);
        if (singleCap) {
          result.capacityMax = parseInt(singleCap[1]);
        }
      }
    } else if (tag === "price") {
      result.noticePeriod = text;
    } else if (tag === "open") {
      result.openingHours = text;
    }
  }

  return result;
}

// Parse prices array: "Type--Description--Price"
function parsePrices(prices: string[]): {
  flexDeskPrice: number | null;
  fixedDeskPrice: number | null;
  privateOfficePrice: number | null;
  priceFrom: number | null;
} {
  const result = {
    flexDeskPrice: null as number | null,
    fixedDeskPrice: null as number | null,
    privateOfficePrice: null as number | null,
    priceFrom: null as number | null,
  };

  const allPrices: number[] = [];

  for (const price of prices) {
    const parts = price.split("--");
    if (parts.length < 2) continue;
    const type = parts[0].trim().toLowerCase();
    const priceStr = parts[parts.length - 1].trim();
    const amount = extractPrice(priceStr);

    if (amount !== null) {
      allPrices.push(amount);

      if (type.includes("flex") || type.includes("coworking") || type.includes("hot")) {
        result.flexDeskPrice = amount;
      } else if (type.includes("fix") || type.includes("fest")) {
        result.fixedDeskPrice = amount;
      } else if (type.includes("privat") || type.includes("büro") || type.includes("office") || type.includes("team")) {
        result.privateOfficePrice = amount;
      }
    }
  }

  if (allPrices.length > 0) {
    result.priceFrom = Math.min(...allPrices);
  }

  return result;
}

interface Listing {
  contentfulId: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  citySlug: string;
  country: string;
  address: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  capacityMin: number | null;
  capacityMax: number | null;
  priceFrom: number | null;
  priceTo: number | null;
  areaSqm: number | null;
  noticePeriod: string | null;
  amenities: string[];
  photos: string[];
  coverPhoto: string | null;
  providerName: string | null;
  providerWebsite: string | null;
  publicTransport: string | null;
  flexDeskPrice: number | null;
  fixedDeskPrice: number | null;
  privateOfficePrice: number | null;
  featured: boolean;
}

interface CityData {
  name: string;
  slug: string;
  country: string;
  listingCount: number;
  image: string;
  latitude: number;
  longitude: number;
}

// City images (same as before — local assets or Unsplash)
const CITY_IMAGES: Record<string, string> = {
  berlin: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&h=400&fit=crop",
  muenchen: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=600&h=400&fit=crop",
  hamburg: "/city-hamburg.jpg",
  frankfurt: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&h=400&fit=crop",
  koeln: "/city-koeln.jpg",
  duesseldorf: "/city-duesseldorf.jpg",
};

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  berlin: { lat: 52.52, lng: 13.405 },
  muenchen: { lat: 48.1351, lng: 11.582 },
  hamburg: { lat: 53.5511, lng: 9.9937 },
  frankfurt: { lat: 50.1109, lng: 8.6821 },
  koeln: { lat: 50.9375, lng: 6.9603 },
  duesseldorf: { lat: 51.2277, lng: 6.7735 },
};

async function main() {
  console.log("Fetching listings from Contentful...\n");

  // Paginate to get all entries
  let allItems: any[] = [];
  let allIncludedEntries: any[] = [];
  let allIncludedAssets: any[] = [];
  let skip = 0;
  let total = Infinity;

  while (skip < total) {
    const response = await fetchEntries(skip);
    total = response.total;
    allItems.push(...response.items);

    if (response.includes?.Entry) {
      allIncludedEntries.push(...response.includes.Entry);
    }
    if (response.includes?.Asset) {
      allIncludedAssets.push(...response.includes.Asset);
    }

    console.log(`  Fetched ${allItems.length}/${total} entries`);
    skip += response.limit;
  }

  console.log(`\nTotal entries fetched: ${allItems.length}`);

  // Build lookup maps
  const entryMap = new Map<string, any>();
  for (const entry of allIncludedEntries) {
    entryMap.set(entry.sys.id, entry);
  }
  // Also add items themselves to the entry map (they may reference each other)
  for (const item of allItems) {
    entryMap.set(item.sys.id, item);
  }

  const assetMap = new Map<string, any>();
  for (const asset of allIncludedAssets) {
    assetMap.set(asset.sys.id, asset);
  }

  // Build equipment label map
  for (const entry of allIncludedEntries) {
    if (entry.sys.contentType?.sys?.id === "equipment" && entry.fields?.label) {
      EQUIPMENT_LABELS[entry.sys.id] = entry.fields.label;
    }
  }

  // Filter and transform
  const listings: Listing[] = [];
  const slugCounts = new Map<string, number>();
  let skippedNoCity = 0;
  let skippedWrongCity = 0;

  for (const item of allItems) {
    const fields = item.fields;

    // Resolve city link
    const cityLink = fields.city?.sys;
    if (!cityLink) {
      skippedNoCity++;
      continue;
    }

    const cityId = cityLink.id;
    const targetCity = TARGET_CITIES[cityId];
    if (!targetCity) {
      skippedWrongCity++;
      continue;
    }

    // Resolve slug (deduplicate)
    let slug = fields.slug || item.sys.id;
    // Strip city prefix from slug if present (e.g. "coworking-berlin-some-space" → "some-space")
    const cityPrefixes = [
      `coworking-${targetCity.slug}-`,
      `buero-${targetCity.slug}-`,
      `${targetCity.slug}-`,
    ];
    for (const prefix of cityPrefixes) {
      if (slug.startsWith(prefix) && slug.length > prefix.length) {
        slug = slug.substring(prefix.length);
        break;
      }
    }

    // Deduplicate slugs within same city
    const slugKey = `${targetCity.slug}/${slug}`;
    const existingCount = slugCounts.get(slugKey) || 0;
    if (existingCount > 0) {
      slug = `${slug}-${existingCount + 1}`;
    }
    slugCounts.set(slugKey, existingCount + 1);

    // Combine address
    const street = fields.street || "";
    const houseNumber = fields.houseNumber || "";
    const address = `${street} ${houseNumber}`.trim();

    // Resolve position
    const pos = fields.position;
    const latitude = pos?.lat ?? null;
    const longitude = pos?.lon ?? null;

    // Resolve images
    const photos: string[] = [];
    if (fields.images && Array.isArray(fields.images)) {
      for (const imgLink of fields.images) {
        const assetId = imgLink?.sys?.id;
        if (!assetId) continue;
        const asset = assetMap.get(assetId);
        if (asset?.fields?.file?.url) {
          let url = asset.fields.file.url;
          if (url.startsWith("//")) url = `https:${url}`;
          photos.push(url);
        }
      }
    }

    // Resolve equipment/amenities
    const amenities: string[] = [];
    if (fields.equipment && Array.isArray(fields.equipment)) {
      for (const eqLink of fields.equipment) {
        const eqId = eqLink?.sys?.id;
        if (!eqId) continue;
        // Try from our map first
        if (EQUIPMENT_LABELS[eqId]) {
          amenities.push(EQUIPMENT_LABELS[eqId]);
        } else {
          // Try resolving the entry
          const eqEntry = entryMap.get(eqId);
          if (eqEntry?.fields?.label) {
            amenities.push(eqEntry.fields.label);
          }
        }
      }
    }

    // Parse hardFacts
    const hardFacts = parseHardFacts(fields.hardFacts || []);

    // Parse prices
    const prices = parsePrices(fields.prices || []);

    // Description from seoText (RichText)
    let description = richTextToPlain(fields.seoText).trim();
    if (!description) {
      description = `${fields.name || "Büro"} in ${targetCity.name} – flexible Bürolösungen für Ihr Unternehmen.`;
    }
    // Trim to reasonable length
    if (description.length > 500) {
      description = description.substring(0, 497) + "...";
    }

    const listing: Listing = {
      contentfulId: item.sys.id,
      id: item.sys.id,
      name: fields.name || "Unbenanntes Büro",
      slug,
      description,
      city: targetCity.name,
      citySlug: targetCity.slug,
      country: "Deutschland",
      address: address || "Adresse auf Anfrage",
      postalCode: fields.postalCode || "",
      latitude,
      longitude,
      capacityMin: hardFacts.capacityMin,
      capacityMax: hardFacts.capacityMax,
      priceFrom: prices.priceFrom,
      priceTo: null,
      areaSqm: hardFacts.areaSqm,
      noticePeriod: hardFacts.noticePeriod,
      amenities,
      photos,
      coverPhoto: photos[0] || null,
      providerName: fields.spaceNameShort || null,
      providerWebsite: null,
      publicTransport: hardFacts.publicTransport,
      flexDeskPrice: prices.flexDeskPrice,
      fixedDeskPrice: prices.fixedDeskPrice,
      privateOfficePrice: prices.privateOfficePrice,
      featured: false,
    };

    listings.push(listing);
  }

  // Sort: listings with photos first, then by name
  listings.sort((a, b) => {
    if (a.photos.length > 0 && b.photos.length === 0) return -1;
    if (a.photos.length === 0 && b.photos.length > 0) return 1;
    return a.name.localeCompare(b.name, "de");
  });

  // Mark first 2 per city as featured (ones with photos + price)
  const featuredCounts = new Map<string, number>();
  for (const listing of listings) {
    const count = featuredCounts.get(listing.citySlug) || 0;
    if (count < 2 && listing.photos.length > 0 && listing.priceFrom !== null) {
      listing.featured = true;
      featuredCounts.set(listing.citySlug, count + 1);
    }
  }

  // Build cities data
  const citiesData: CityData[] = Object.values(TARGET_CITIES).map((city) => {
    const count = listings.filter((l) => l.citySlug === city.slug).length;
    const coords = CITY_COORDS[city.slug];
    return {
      name: city.name,
      slug: city.slug,
      country: "Deutschland",
      listingCount: count,
      image: CITY_IMAGES[city.slug] || "",
      latitude: coords.lat,
      longitude: coords.lng,
    };
  });

  // Sort cities by listing count (descending)
  citiesData.sort((a, b) => b.listingCount - a.listingCount);

  // Write output files
  const outDir = resolve(__dirname, "../src/data");

  writeFileSync(
    resolve(outDir, "listings.json"),
    JSON.stringify(listings, null, 2),
    "utf-8"
  );
  writeFileSync(
    resolve(outDir, "cities.json"),
    JSON.stringify(citiesData, null, 2),
    "utf-8"
  );

  // Print summary
  console.log("\n=== Import Summary ===\n");
  console.log(`Total Contentful entries: ${allItems.length}`);
  console.log(`Skipped (no city): ${skippedNoCity}`);
  console.log(`Skipped (wrong city): ${skippedWrongCity}`);
  console.log(`Imported listings: ${listings.length}\n`);

  console.log("Listings per city:");
  for (const city of citiesData) {
    const withPhotos = listings.filter((l) => l.citySlug === city.slug && l.photos.length > 0).length;
    const withPrice = listings.filter((l) => l.citySlug === city.slug && l.priceFrom !== null).length;
    console.log(`  ${city.name}: ${city.listingCount} total, ${withPhotos} with photos, ${withPrice} with price`);
  }

  const noCoords = listings.filter((l) => l.latitude === null).length;
  const noPhotos = listings.filter((l) => l.photos.length === 0).length;
  const noPrice = listings.filter((l) => l.priceFrom === null).length;
  const noDescription = listings.filter((l) => l.description.includes("flexible Bürolösungen")).length;

  console.log(`\nData quality:`);
  console.log(`  Missing coordinates: ${noCoords}`);
  console.log(`  Missing photos: ${noPhotos}`);
  console.log(`  Missing price: ${noPrice}`);
  console.log(`  Generated descriptions: ${noDescription}`);

  console.log(`\nOutput written to:`);
  console.log(`  ${resolve(outDir, "listings.json")}`);
  console.log(`  ${resolve(outDir, "cities.json")}`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
