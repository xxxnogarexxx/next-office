export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

export const MAP_STYLE = "mapbox://styles/mapbox/streets-v12";

// Default views
export const GERMANY_CENTER = { latitude: 51.1657, longitude: 10.4515 };
export const DEFAULT_ZOOM = 5.5;
export const CITY_ZOOM = 12;
export const LISTING_ZOOM = 15;

// Pin colors
export const PIN_COLOR = "#2563EB";
export const PIN_COLOR_ACTIVE = "#1E40AF";
export const PIN_BORDER_COLOR = "#FFFFFF";

// POI categories
export const POI_CATEGORIES = [
  { id: "ubahn", label: "U-Bahn", icon: "🚇", color: "#D97706" },
  { id: "sbahn", label: "S-Bahn", icon: "🚈", color: "#16A34A" },
  { id: "bus", label: "Bus", icon: "🚌", color: "#9333EA" },
  { id: "restaurant", label: "Restaurants", icon: "🍽️", color: "#F97316" },
  { id: "cafe", label: "Cafés", icon: "☕", color: "#A855F7" },
  { id: "parking", label: "Parkplätze", icon: "🅿️", color: "#6B7280" },
] as const;

export type PoiCategory = (typeof POI_CATEGORIES)[number]["id"];
