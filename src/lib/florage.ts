import { nanoid } from "nanoid";
import * as XLSX from "xlsx";
import { z } from "zod";

const FLORAGE_STORAGE_KEY = "beeyield.florage.v2";
const FLORAGE_EVENT = "beeyield:florage:changed";

const numberField = (label: string, min: number, max: number) =>
  z.preprocess((value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return Number.NaN;
      return Number(trimmed);
    }
    return value;
  }, z.number().finite(`${label} is required`).min(min, `${label} must be at least ${min}`).max(max, `${label} must be at most ${max}`));

export const floragePlantInputSchema = z.object({
  name: z.string().trim().min(2, "Plant name is required"),
  latin: z.string().trim().min(2, "Latin name is required"),
  bloom: z.string().trim().min(2, "Bloom window is required"),
  nectar: numberField("Nectar score", 0, 10),
  pollen: numberField("Pollen score", 0, 10),
  radius: numberField("Flight radius", 50, 5000),
  notes: z.string().trim().max(240, "Notes are too long").optional().default(""),
  source: z.string().trim().max(80, "Source is too long").optional().default("manual"),
  region: z.string().trim().max(80, "Region is too long").optional().default(""),
  tags: z.string().trim().max(120, "Tags are too long").optional().default(""),
});

export const floragePlantSchema = floragePlantInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type FloragePlantInput = z.infer<typeof floragePlantInputSchema>;
export type FloragePlant = z.infer<typeof floragePlantSchema>;

export type FlorageCsvValidationError = {
  rowNumber: number;
  message: string;
};

export type FlorageImportPreview = {
  plants: FloragePlantInput[];
  errors: FlorageCsvValidationError[];
  columns: string[];
};

const DEFAULT_FLORAGE_INPUTS: FloragePlantInput[] = [
  { name: "Black Locust", latin: "Robinia pseudoacacia", bloom: "May-Jun", nectar: 10, pollen: 4, radius: 1500, notes: "Premium acacia honey with a short bloom window.", source: "seed", region: "Temperate", tags: "tree,nectar" },
  { name: "Manuka", latin: "Leptospermum scoparium", bloom: "Nov-Feb", nectar: 9, pollen: 5, radius: 1200, notes: "MGO-rich premium honey source.", source: "seed", region: "NZ/Australia", tags: "shrub,medicinal" },
  { name: "Sidr", latin: "Ziziphus spina-christi", bloom: "Oct-Dec", nectar: 10, pollen: 6, radius: 1500, notes: "High-value arid-zone honey plant.", source: "seed", region: "East Africa", tags: "tree,arid" },
  { name: "Sunflower", latin: "Helianthus annuus", bloom: "Jul-Aug", nectar: 7, pollen: 9, radius: 1200, notes: "Heavy pollen source with fast-crystallizing honey.", source: "seed", region: "Global", tags: "field,pollen" },
  { name: "Almond", latin: "Prunus dulcis", bloom: "Feb", nectar: 5, pollen: 10, radius: 800, notes: "First-season pollen pulse for orchard pollination.", source: "seed", region: "California", tags: "orchard,pollen" },
  { name: "Apple", latin: "Malus domestica", bloom: "Apr-May", nectar: 6, pollen: 8, radius: 600, notes: "Critical orchard bloom for fruit set.", source: "seed", region: "Temperate", tags: "orchard" },
  { name: "Canola", latin: "Brassica napus", bloom: "Apr-May", nectar: 9, pollen: 9, radius: 1500, notes: "Major early-season flow and strong pollen source.", source: "seed", region: "Global", tags: "field,nectar,pollen" },
  { name: "Linden", latin: "Tilia spp.", bloom: "Jun-Jul", nectar: 10, pollen: 5, radius: 1200, notes: "Excellent nectar flow for premium honey.", source: "seed", region: "Temperate", tags: "tree,nectar" },
  { name: "Eucalyptus", latin: "Eucalyptus spp.", bloom: "Year-round", nectar: 9, pollen: 7, radius: 2000, notes: "Reliable forage in dry climates.", source: "seed", region: "Drylands", tags: "tree,arid" },
  { name: "White Clover", latin: "Trifolium repens", bloom: "May-Sep", nectar: 9, pollen: 7, radius: 800, notes: "Pasture workhorse for nectar and pollen.", source: "seed", region: "Temperate", tags: "pasture" },
  { name: "Borage", latin: "Borago officinalis", bloom: "Jun-Sep", nectar: 10, pollen: 7, radius: 800, notes: "Strong supplemental nectar planting.", source: "seed", region: "Global", tags: "cover-crop,nectar" },
  { name: "Phacelia", latin: "Phacelia tanacetifolia", bloom: "Jun-Sep", nectar: 9, pollen: 9, radius: 800, notes: "Top cover crop for bee forage diversity.", source: "seed", region: "Global", tags: "cover-crop,pollen" },
  { name: "Coffee", latin: "Coffea arabica", bloom: "Sep-Oct", nectar: 7, pollen: 6, radius: 600, notes: "Mass bloom after rain trigger.", source: "seed", region: "East Africa", tags: "orchard,tropical" },
  { name: "Mango", latin: "Mangifera indica", bloom: "Mar-Aug", nectar: 6, pollen: 7, radius: 700, notes: "Heat suppresses midday activity.", source: "seed", region: "Tropical", tags: "orchard" },
  { name: "Macadamia", latin: "Macadamia integrifolia", bloom: "Aug-Sep", nectar: 7, pollen: 7, radius: 800, notes: "Long racemes respond to strong coverage.", source: "seed", region: "Tropical", tags: "orchard" },
  { name: "Citrus", latin: "Citrus sinensis", bloom: "Mar-May", nectar: 9, pollen: 7, radius: 1000, notes: "Premium orange-blossom honey source.", source: "seed", region: "Subtropical", tags: "orchard,nectar" },
  { name: "Lavender", latin: "Lavandula angustifolia", bloom: "Jun-Aug", nectar: 8, pollen: 5, radius: 600, notes: "Aromatic honey with reliable summer bloom.", source: "seed", region: "Mediterranean", tags: "herb,nectar" },
  { name: "Goldenrod", latin: "Solidago spp.", bloom: "Aug-Oct", nectar: 8, pollen: 7, radius: 1000, notes: "Critical late-season forage.", source: "seed", region: "Temperate", tags: "late-season" },
  { name: "Willow", latin: "Salix caprea", bloom: "Mar-Apr", nectar: 7, pollen: 10, radius: 800, notes: "Earliest strong pollen source.", source: "seed", region: "Temperate", tags: "tree,pollen" },
  { name: "Raspberry", latin: "Rubus idaeus", bloom: "May-Jul", nectar: 8, pollen: 7, radius: 600, notes: "Long bloom with high-grade honey.", source: "seed", region: "Temperate", tags: "berry" },
];

const MONTH_ALIASES: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

const CSV_ALIASES = {
  name: ["name", "plant", "common_name", "common name"],
  latin: ["latin", "latin_name", "latin name", "scientific_name", "scientific name"],
  bloom: ["bloom", "bloom_window", "bloom window", "bloom_period", "bloom period"],
  nectar: ["nectar", "nectar_score", "nectar score"],
  pollen: ["pollen", "pollen_score", "pollen score"],
  radius: ["radius", "flight_radius", "flight radius", "radius_m", "radius (m)"],
  notes: ["notes", "note", "comment", "comments"],
  source: ["source", "origin"],
  region: ["region", "zone", "country"],
  tags: ["tags", "tag", "category"],
} satisfies Record<keyof FloragePlantInput, string[]>;

function normalizeSeedPlant(input: FloragePlantInput): FloragePlant {
  const now = new Date().toISOString();
  return {
    ...floragePlantInputSchema.parse(input),
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
  };
}

const DEFAULT_FLORAGE_LIBRARY = DEFAULT_FLORAGE_INPUTS.map(normalizeSeedPlant);

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function emitFlorageChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FLORAGE_EVENT));
}

export function getDefaultFlorageLibrary(): FloragePlant[] {
  return DEFAULT_FLORAGE_LIBRARY.map((plant) => ({ ...plant }));
}

export function loadFlorageLibrary(): FloragePlant[] {
  const storage = getStorage();
  if (!storage) return getDefaultFlorageLibrary();

  const raw = storage.getItem(FLORAGE_STORAGE_KEY);
  if (!raw) {
    const seeded = getDefaultFlorageLibrary();
    storage.setItem(FLORAGE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw);
    const result = z.array(floragePlantSchema).safeParse(parsed);
    if (result.success && result.data.length > 0) return result.data;
  } catch {
    // fall through to reset defaults
  }

  const seeded = getDefaultFlorageLibrary();
  storage.setItem(FLORAGE_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

export function saveFlorageLibrary(plants: FloragePlant[]) {
  const storage = getStorage();
  const normalized = plants
    .map((plant) => floragePlantSchema.parse(plant))
    .sort((left, right) => left.name.localeCompare(right.name));

  if (storage) {
    storage.setItem(FLORAGE_STORAGE_KEY, JSON.stringify(normalized));
  }
  emitFlorageChange();
  return normalized;
}

export function createFloragePlant(input: FloragePlantInput): FloragePlant {
  const normalized = floragePlantInputSchema.parse(input);
  const now = new Date().toISOString();
  return {
    ...normalized,
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateFloragePlant(existing: FloragePlant, input: FloragePlantInput): FloragePlant {
  const normalized = floragePlantInputSchema.parse(input);
  return {
    ...existing,
    ...normalized,
    updatedAt: new Date().toISOString(),
  };
}

export function subscribeToFlorageLibrary(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === FLORAGE_STORAGE_KEY) callback();
  };
  const handleCustom = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(FLORAGE_EVENT, handleCustom);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(FLORAGE_EVENT, handleCustom);
  };
}

function getCsvCell(row: Record<string, unknown>, aliases: string[]) {
  const pairs = Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), value] as const);
  const match = aliases.find((alias) => pairs.some(([key]) => key === alias));
  if (!match) return undefined;
  return pairs.find(([key]) => key === match)?.[1];
}

function mapCsvRow(row: Record<string, unknown>): FloragePlantInput {
  return {
    name: String(getCsvCell(row, CSV_ALIASES.name) ?? "").trim(),
    latin: String(getCsvCell(row, CSV_ALIASES.latin) ?? "").trim(),
    bloom: String(getCsvCell(row, CSV_ALIASES.bloom) ?? "").trim(),
    nectar: getCsvCell(row, CSV_ALIASES.nectar) as string | number,
    pollen: getCsvCell(row, CSV_ALIASES.pollen) as string | number,
    radius: getCsvCell(row, CSV_ALIASES.radius) as string | number,
    notes: String(getCsvCell(row, CSV_ALIASES.notes) ?? "").trim(),
    source: String(getCsvCell(row, CSV_ALIASES.source) ?? "csv-import").trim(),
    region: String(getCsvCell(row, CSV_ALIASES.region) ?? "").trim(),
    tags: String(getCsvCell(row, CSV_ALIASES.tags) ?? "").trim(),
  };
}

export async function buildFlorageImportPreview(file: File): Promise<FlorageImportPreview> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
    raw: false,
  });

  const columns = rawRows.length ? Object.keys(rawRows[0]) : [];
  const plants: FloragePlantInput[] = [];
  const errors: FlorageCsvValidationError[] = [];

  rawRows.forEach((row, index) => {
    const mapped = mapCsvRow(row);
    const parsed = floragePlantInputSchema.safeParse(mapped);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        errors.push({
          rowNumber: index + 2,
          message: issue.message,
        });
      });
      return;
    }
    plants.push(parsed.data);
  });

  if (rawRows.length === 0) {
    errors.push({ rowNumber: 1, message: "CSV is empty." });
  }

  return { plants, errors, columns };
}

function extractMonths(bloom: string): number[] {
  const matches = bloom
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .split(" ")
    .map((token) => MONTH_ALIASES[token])
    .filter((value): value is number => Boolean(value));

  if (matches.length === 0) return [];
  if (matches.length === 1) return matches;

  const start = matches[0];
  const end = matches[matches.length - 1];
  if (end >= start) {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  return [...Array.from({ length: 12 - start + 1 }, (_, index) => start + index), ...Array.from({ length: end }, (_, index) => index + 1)];
}

export function getMonthsFromDateRange(dateFrom?: string | null, dateTo?: string | null): number[] {
  const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
  const to = dateTo ? new Date(`${dateTo}T00:00:00`) : null;

  if (!from || Number.isNaN(from.getTime()) || !to || Number.isNaN(to.getTime())) {
    return [];
  }

  const months: number[] = [];
  const cursor = new Date(from);
  cursor.setDate(1);
  const target = new Date(to);
  target.setDate(1);

  while (cursor <= target) {
    months.push(cursor.getMonth() + 1);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return Array.from(new Set(months));
}

export function filterPlantsByBloomWindow(plants: FloragePlant[], dateFrom?: string | null, dateTo?: string | null) {
  const months = getMonthsFromDateRange(dateFrom, dateTo);
  if (months.length === 0) return plants;
  return plants.filter((plant) => {
    const bloomMonths = extractMonths(plant.bloom);
    if (bloomMonths.length === 0) return true;
    return bloomMonths.some((month) => months.includes(month));
  });
}

export type FloragePlanSummary = {
  activePlants: FloragePlant[];
  weightedScore: number;
  nectarAverage: number;
  pollenAverage: number;
  radiusAverage: number;
  diversityScore: number;
  dominantPlants: FloragePlant[];
  actions: string[];
};

export function buildFloragePlanSummary(params: {
  plants: FloragePlant[];
  dateFrom?: string | null;
  dateTo?: string | null;
  coveragePct?: number;
  hives?: number;
}) : FloragePlanSummary {
  const activePlants = filterPlantsByBloomWindow(params.plants, params.dateFrom, params.dateTo);
  const source = activePlants.length > 0 ? activePlants : params.plants;

  if (source.length === 0) {
    return {
      activePlants: [],
      weightedScore: 0,
      nectarAverage: 0,
      pollenAverage: 0,
      radiusAverage: 0,
      diversityScore: 0,
      dominantPlants: [],
      actions: [
        "Load or import florage rows before using the weighted planning tools.",
      ],
    };
  }

  const nectarAverage = source.reduce((sum, plant) => sum + plant.nectar, 0) / source.length;
  const pollenAverage = source.reduce((sum, plant) => sum + plant.pollen, 0) / source.length;
  const radiusAverage = source.reduce((sum, plant) => sum + plant.radius, 0) / source.length;
  const diversityScore = Math.min(100, source.length * 10);
  const radiusFactor = Math.min(1, radiusAverage / 1500);
  const coverageFactor = Math.max(0.55, Math.min(1.1, (params.coveragePct ?? 70) / 100));
  const hiveFactor = Math.max(0.7, Math.min(1.15, (params.hives ?? 12) / 20));
  const weightedScore = Math.round(((nectarAverage * 0.5 + pollenAverage * 0.35 + radiusFactor * 10 * 0.15) / 10) * diversityScore * coverageFactor * hiveFactor);

  const dominantPlants = [...source]
    .sort((left, right) => (right.nectar + right.pollen) - (left.nectar + left.pollen))
    .slice(0, 3);

  const actions: string[] = [];
  if (diversityScore < 45) actions.push("Increase bloom diversity with at least three staggered forage species.");
  if (nectarAverage < 7) actions.push("Bias the planting plan toward higher-nectar species to stabilize inflow.");
  if (pollenAverage < 7) actions.push("Add stronger pollen sources to protect brood rearing during weak bloom weeks.");
  if ((params.coveragePct ?? 0) < 70) actions.push("Improve hive coverage before relying on florage gains.");
  if (actions.length === 0) actions.push("Current florage mix supports a balanced pollination and feeding plan.");

  return {
    activePlants: source,
    weightedScore,
    nectarAverage: Number(nectarAverage.toFixed(1)),
    pollenAverage: Number(pollenAverage.toFixed(1)),
    radiusAverage: Math.round(radiusAverage),
    diversityScore,
    dominantPlants,
    actions,
  };
}
