import { writeFileSync } from "fs";
import { resolve } from "path";
import listings from "../src/data/listings.json";

interface L {
  slug: string;
  name: string;
  city: string;
  providerName: string | null;
  capacityMin: number | null;
  capacityMax: number | null;
  noticePeriod: string | null;
}

const data = listings as L[];

const header = [
  "slug",
  "name",
  "city",
  "providerName",
  "capacityMin_CURRENT",
  "capacityMax_CURRENT",
  "noticePeriod_CURRENT",
  "capacityMin_NEW",
  "capacityMax_NEW",
  "noticePeriod_NEW",
];

// Sort by city then name
const sorted = [...data].sort(
  (a, b) => a.city.localeCompare(b.city, "de") || a.name.localeCompare(b.name, "de")
);

function esc(v: string | number | null): string {
  const s = v === null ? "" : String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const rows = sorted.map((l) => [
  l.slug,
  l.name,
  l.city,
  l.providerName,
  l.capacityMin,
  l.capacityMax,
  l.noticePeriod,
  "", // capacityMin_NEW
  "", // capacityMax_NEW
  "", // noticePeriod_NEW
]);

const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
const outPath = resolve(__dirname, "../spaces-to-fill.csv");
writeFileSync(outPath, csv, "utf-8");
console.log(`Written ${rows.length} rows to ${outPath}`);
