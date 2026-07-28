export type PromptVariant = "baseline" | "bloom-only" | "flight-only" | "bloom-flight";

export type MoaFilters = {
  crop: string;
  dateFrom: string;
  dateTo: string;
  showCoverage: boolean;
  showBloom: boolean;
  showFlight: boolean;
  showComments: boolean;
};

export type CropProfile = {
  name: string;
  flightRadiusM: number;
  recColoniesPerAcre: number;
  bloomDays: number;
};

export const PROMPT_VARIANTS: Array<{
  id: PromptVariant;
  label: string;
  description: string;
}> = [
  {
    id: "baseline",
    label: "Baseline",
    description: "General BeeYield expert output with standard harvest and pollination reasoning.",
  },
  {
    id: "bloom-only",
    label: "Bloom-only",
    description: "Bias the model toward bloom timing, phenology shifts, and deployment windows.",
  },
  {
    id: "flight-only",
    label: "Flight-only",
    description: "Bias the model toward foraging activity, movement, counter data, and hive behavior.",
  },
  {
    id: "bloom-flight",
    label: "Bloom + Flight",
    description: "Blend bloom timing and flight telemetry into one contract-planning answer.",
  },
];

export const CROP_PROFILES: CropProfile[] = [
  { name: "Almonds", flightRadiusM: 800, recColoniesPerAcre: 2.5, bloomDays: 21 },
  { name: "Almonds (CA)", flightRadiusM: 800, recColoniesPerAcre: 2.5, bloomDays: 21 },
  { name: "Apples", flightRadiusM: 700, recColoniesPerAcre: 1.5, bloomDays: 14 },
  { name: "Blueberries", flightRadiusM: 500, recColoniesPerAcre: 4, bloomDays: 25 },
  { name: "Blueberries (highbush)", flightRadiusM: 500, recColoniesPerAcre: 4, bloomDays: 25 },
  { name: "Cranberries", flightRadiusM: 600, recColoniesPerAcre: 3, bloomDays: 28 },
  { name: "Avocado", flightRadiusM: 600, recColoniesPerAcre: 2, bloomDays: 30 },
  { name: "Avocado (Hass)", flightRadiusM: 600, recColoniesPerAcre: 2, bloomDays: 30 },
  { name: "Sunflower", flightRadiusM: 1200, recColoniesPerAcre: 1.5, bloomDays: 18 },
  { name: "Sunflower (hybrid)", flightRadiusM: 1200, recColoniesPerAcre: 1.5, bloomDays: 18 },
  { name: "Sunflower (hybrid seed)", flightRadiusM: 1200, recColoniesPerAcre: 1.5, bloomDays: 18 },
  { name: "Canola", flightRadiusM: 1500, recColoniesPerAcre: 1, bloomDays: 24 },
  { name: "Canola/Oilseed Rape", flightRadiusM: 1500, recColoniesPerAcre: 1, bloomDays: 24 },
  { name: "Watermelon", flightRadiusM: 700, recColoniesPerAcre: 2, bloomDays: 35 },
  { name: "Cucumber", flightRadiusM: 500, recColoniesPerAcre: 2.5, bloomDays: 40 },
  { name: "Strawberry", flightRadiusM: 400, recColoniesPerAcre: 1.5, bloomDays: 30 },
  { name: "Coffee", flightRadiusM: 800, recColoniesPerAcre: 1, bloomDays: 7 },
  { name: "Coffee (Arabica)", flightRadiusM: 800, recColoniesPerAcre: 1, bloomDays: 7 },
  { name: "Macadamia", flightRadiusM: 600, recColoniesPerAcre: 2.5, bloomDays: 14 },
  { name: "Mango", flightRadiusM: 700, recColoniesPerAcre: 1.5, bloomDays: 21 },
  { name: "Sidr", flightRadiusM: 1000, recColoniesPerAcre: 1, bloomDays: 30 },
  { name: "Mixed wildflower / honey only", flightRadiusM: 900, recColoniesPerAcre: 1.2, bloomDays: 35 },
];

export const CROP_FLIGHT_RADIUS_M: Record<string, number> = Object.fromEntries(
  CROP_PROFILES.map((profile) => [profile.name, profile.flightRadiusM]),
);

export const DEFAULT_MOA_FILTERS = (crop = "Almonds"): MoaFilters => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 30);

  return {
    crop,
    dateFrom: toDateInputValue(start),
    dateTo: toDateInputValue(today),
    showCoverage: true,
    showBloom: true,
    showFlight: true,
    showComments: true,
  };
};

export function normalizeCropLabel(value: string | null | undefined): string {
  if (!value) return "Almonds";
  const trimmed = value.trim();
  const direct = Object.keys(CROP_FLIGHT_RADIUS_M).find(
    (key) => key.toLowerCase() === trimmed.toLowerCase(),
  );
  if (direct) return direct;

  const compact = trimmed.replace(/\([^)]*\)/g, "").trim().toLowerCase();
  const fuzzy = Object.keys(CROP_FLIGHT_RADIUS_M).find((key) =>
    compact.includes(key.replace(/\([^)]*\)/g, "").trim().toLowerCase()),
  );
  return fuzzy || trimmed;
}

export function resolveCropRadius(crop: string | null | undefined): number {
  const normalized = normalizeCropLabel(crop);
  return CROP_FLIGHT_RADIUS_M[normalized] ?? 700;
}

export function resolveCropProfile(crop: string | null | undefined): CropProfile {
  const normalized = normalizeCropLabel(crop);
  return CROP_PROFILES.find((profile) => profile.name === normalized) || CROP_PROFILES[0];
}

export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function coerceMoaFilters(value: unknown, cropFallback: string): MoaFilters {
  const fallback = DEFAULT_MOA_FILTERS(cropFallback);
  if (!value || typeof value !== "object") return fallback;

  const raw = value as Partial<MoaFilters>;
  return {
    crop: typeof raw.crop === "string" && raw.crop.trim() ? raw.crop : fallback.crop,
    dateFrom: typeof raw.dateFrom === "string" && raw.dateFrom ? raw.dateFrom : fallback.dateFrom,
    dateTo: typeof raw.dateTo === "string" && raw.dateTo ? raw.dateTo : fallback.dateTo,
    showCoverage: raw.showCoverage ?? fallback.showCoverage,
    showBloom: raw.showBloom ?? fallback.showBloom,
    showFlight: raw.showFlight ?? fallback.showFlight,
    showComments: raw.showComments ?? fallback.showComments,
  };
}

export function coercePromptVariant(value: unknown): PromptVariant {
  return PROMPT_VARIANTS.some((variant) => variant.id === value)
    ? (value as PromptVariant)
    : "baseline";
}

export function withinDateRange(
  value: string | null | undefined,
  dateFrom: string,
  dateTo: string,
): boolean {
  if (!value) return true;
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return true;
  const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
  const to = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : Number.POSITIVE_INFINITY;
  return ts >= from && ts <= to;
}

export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const c =
    2 *
    Math.atan2(
      Math.sqrt(sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng),
      Math.sqrt(1 - (sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng)),
    );
  return R * c;
}

export function getForagingZone(distanceM: number | null | undefined): string {
  if (distanceM == null || Number.isNaN(distanceM)) return "unknown";
  if (distanceM <= 500) return "primary";
  if (distanceM <= 1500) return "secondary";
  if (distanceM <= 3000) return "tertiary";
  return "stress";
}

export function projectPoint(
  start: { lat: number; lng: number },
  bearingDeg: number,
  distanceM: number,
): { lat: number; lng: number } {
  const R = 6378137;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (start.lat * Math.PI) / 180;
  const lng1 = (start.lng * Math.PI) / 180;
  const angular = distanceM / R;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) +
      Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (lng2 * 180) / Math.PI,
  };
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
