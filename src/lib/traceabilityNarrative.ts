import { TraceResponse } from "@/services/traceabilityService";

export const TRACEABILITY_MISSING = "Missing backend data";

export const BEEYIELD_TRACEABILITY_STORY = {
  founder: "Timothy Nduva",
  foundingYear: "December 2020",
  iotFoundingDate: "July 2026",
  foundingHives: 4,
  currentHives: 284,
  apiaryFootprint: "5-acre apiary",
  treesPlanted: "2,500+",
  conservationFocus:
    "BeeYield pairs fair harvesting with planting trees and caring for bee health so every harvest protects the colony and the land around it.",
  fiftyFifty:
    "We always leave half: we harvest only surplus honey for people and leave an equal amount in the hive so the bees have plenty of food all year.",
  esgCommitment:
    "We are committed to honest farming, bee protection, tree planting, and clear harvest records you can always check.",
  faoCompliance:
    "Meets international food safety standards with clear tracking from bee hive to packaging.",
  antiAdulterationGuarantee:
    "100% pure raw honey guaranteed: no added sugar, no corn syrup, and no dilution.",
  monofloralStandard:
    "Single-flower honey means bees collected nectar during peak flower season, with exact hive location and flower types recorded on your jar.",
  digitalProductPassportReady:
    "Ready for global retail standards, showing the full journey from Kenyan farms to your kitchen table.",
};

export interface HoneyValueChainStage {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  dataPoints: string[];
  complianceStandard: string;
  description: string;
}

export const HIVE_TO_HONEY_VALUE_CHAIN: HoneyValueChainStage[] = [
  {
    id: "hive-management",
    stepNumber: 1,
    title: "Beekeeping & Hive Care",
    subtitle: "Setting up hives and keeping bees healthy",
    dataPoints: [
      "Exact hive location",
      "Verified local beekeeper",
      "Individual hive number and tag",
      "Colony health and sound check"
    ],
    complianceStandard: "Naturally Grown & Bee-Friendly",
    description:
      "Beekeepers place hives near wild flowering trees, regularly checking queen health and colony strength without using harsh chemicals."
  },
  {
    id: "pollination-bloom",
    stepNumber: 2,
    title: "Flower Blooming Season",
    subtitle: "Bees visiting wild flowers in full bloom",
    dataPoints: [
      "Main flower types (Acacia, Mango, Citrus)",
      "Peak flower blooming dates",
      "Bee flight area",
      "Nectar flow tracking"
    ],
    complianceStandard: "Single-Flower Honey Standard",
    description:
      "Bees collect nectar while wild flowers are in full bloom, making sure each jar has the genuine taste of that specific flower."
  },
  {
    id: "ethical-harvest",
    stepNumber: 3,
    title: "Ethical 50/50 Harvest",
    subtitle: "Harvesting surplus while feeding the bees",
    dataPoints: [
      "Harvest date and weather",
      "Honey harvested for people (kg)",
      "Equal reserve left for the bees (kg)",
      "Clean food-grade stainless buckets"
    ],
    complianceStandard: "BeeYield 50/50 Harvest Promise",
    description:
      "Beekeepers carefully harvest only extra honey, always leaving half in the hive so the colony stays strong and well-fed."
  },
  {
    id: "collection-extraction",
    stepNumber: 4,
    title: "Cold Extraction & Bottling",
    subtitle: "Gently spun without heat to protect raw enzymes",
    dataPoints: [
      "Local collection center record",
      "Gentle cold extraction (under 35°C)",
      "Natural moisture check (under 18%)",
      "Sealed batch tracking"
    ],
    complianceStandard: "Pure Honey Standards",
    description:
      "Honey frames are spun in clean, stainless extractors without cooking or high heat. This keeps all the natural aromas, enzymes, and bee nutrients alive."
  },
  {
    id: "distribution-transparency",
    stepNumber: 5,
    title: "QR Jar Seal & Your Kitchen",
    subtitle: "Scan the lid to see where your honey came from",
    dataPoints: [
      "QR code on jar linking to harvest details",
      "Batch harvest certificate",
      "Tree planting and community impact",
      "Fair pay for the local beekeeper"
    ],
    complianceStandard: "Verified Pure Honey",
    description:
      "Pure honey is poured into glass jars and sealed. You can scan the QR code on the lid to see who harvested it, where the bees lived, and when it was made."
  }
];

export const hasTraceValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
  return true;
};

export const formatTraceDate = (value: unknown): string => {
  if (!hasTraceValue(value)) return TRACEABILITY_MISSING;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTraceNumber = (value: unknown, unit = "", digits?: number): string => {
  if (typeof value !== "number" || Number.isNaN(value)) return TRACEABILITY_MISSING;
  const rendered = typeof digits === "number" ? value.toFixed(digits) : String(value);
  return `${rendered}${unit}`;
};

export const formatTraceText = (value: unknown, fallback = TRACEABILITY_MISSING): string => {
  return hasTraceValue(value) ? String(value) : fallback;
};

export const buildDeepTraceabilityStory = (traceData: TraceResponse | null): string[] => {
  const farmerStory = hasTraceValue(traceData?.story_content)
    ? String(traceData?.story_content)
    : hasTraceValue(traceData?.farmer?.story)
      ? String(traceData?.farmer?.story)
      : `${BEEYIELD_TRACEABILITY_STORY.founder} started BeeYield in ${BEEYIELD_TRACEABILITY_STORY.foundingYear} with ${BEEYIELD_TRACEABILITY_STORY.foundingHives} hives in Kibwezi, and officially founded BeeYield as an IoT precision pollination company in ${BEEYIELD_TRACEABILITY_STORY.iotFoundingDate}.`;

  const growthStory = `From ${BEEYIELD_TRACEABILITY_STORY.foundingHives} hives, BeeYield has grown to ${BEEYIELD_TRACEABILITY_STORY.currentHives} hives across a ${BEEYIELD_TRACEABILITY_STORY.apiaryFootprint}, while maintaining an ethical harvest model and investing in long-term pollinator resilience.`;

  const conservationStory = `${BEEYIELD_TRACEABILITY_STORY.conservationFocus} We have planted ${BEEYIELD_TRACEABILITY_STORY.treesPlanted} trees and continue to link traceability with restoration work on the ground.`;

  const esgStory = `${BEEYIELD_TRACEABILITY_STORY.fiftyFifty} ${BEEYIELD_TRACEABILITY_STORY.esgCommitment}`;

  const traceabilityStory = `Every jar of BeeYield honey can be traced straight back to the hive: the exact farm location, the wild flowers visited, gentle cold extraction, and a permanent record of when and where it was harvested.`;

  return [farmerStory, growthStory, conservationStory, esgStory, traceabilityStory];
};

export const buildHarvestFacts = (traceData: TraceResponse | null) => [
  { label: "Batch", value: formatTraceText(traceData?.batch_code) },
  { label: "Harvest date", value: formatTraceDate(traceData?.harvest_date || traceData?.timeline?.find((item) => item.title === "Harvest Day")?.date) },
  { label: "Apiary", value: formatTraceText(traceData?.apiary?.name) },
  { label: "Hive", value: formatTraceText(traceData?.hive?.hive_code) },
  { label: "Beekeeper", value: formatTraceText(traceData?.farmer?.name, "Timothy Nduva") },
  { label: "Flowers", value: traceData?.apiary?.flora_types?.length ? traceData?.apiary?.flora_types?.join(", ") ?? formatTraceText(traceData?.florage_type) : formatTraceText(traceData?.florage_type) },
  { label: "Quality standard", value: "Verified Pure & Safe" },
  { label: "Extraction", value: "Cold Extracted (Raw & Unheated)" },
];

export const buildPurityAssuranceFacts = (traceData: TraceResponse | null) => [
  { label: "Purity", value: "100% Pure Raw Honey (0% Added Sugar)" },
  { label: "Flower origin", value: formatTraceText(traceData?.florage_type, "Wild Acacia Flowers") },
  { label: "Farm location", value: "Verified Farm Origin" },
  { label: "Natural moisture", value: "Under 18% (Naturally Capped)" },
  { label: "Bee reserve", value: "50% Left for Hive Health" },
  { label: "Harvest record", value: "Fully Verified from Hive to Jar" },
];

const formatKg = (value: number) => `${Number(value.toFixed(2))}kg`;

/** Harvested kg for this batch (people's half); the bees' half is always equal to it (50/50). */
export const getHarvestedKg = (traceData: TraceResponse | null): number | null => {
  const raw = Number(traceData?.impact_stats?.total_honey_kg);
  return Number.isFinite(raw) && raw > 0 ? raw : null;
};

export const buildConservationFacts = (traceData: TraceResponse | null) => [
  {
    label: "50/50 reserve left for bees",
    value: getHarvestedKg(traceData) !== null
      ? formatKg(getHarvestedKg(traceData) as number)
      : TRACEABILITY_MISSING,
  },
  {
    label: "Harvested amount",
    value: getHarvestedKg(traceData) !== null
      ? formatKg(getHarvestedKg(traceData) as number)
      : TRACEABILITY_MISSING,
  },
  { label: "50/50 promise", value: formatTraceText(traceData?.sustainability?.status, "Active (50% Reserved)") },
  {
    label: "Trees planted",
    value: formatTraceText(traceData?.impact_stats?.trees_planted || traceData?.impact_stats?.tree_count, BEEYIELD_TRACEABILITY_STORY.treesPlanted),
  },
  {
    label: "Hive growth",
    value: `${BEEYIELD_TRACEABILITY_STORY.foundingHives} to ${BEEYIELD_TRACEABILITY_STORY.currentHives} hives`,
  },
  {
    label: "Eco commitment",
    value: "Bee-Friendly, Naturally Grown, Fair Trade",
  },
];

export const NO_DEVICE_LABEL = "No device installed yet";

/** Hives have no IoT devices yet, so in-hive readings are not reported. */
export const buildSensorFacts = (_traceData: TraceResponse | null) => [
  { label: "Hive temperature", value: NO_DEVICE_LABEL },
  { label: "Hive humidity", value: NO_DEVICE_LABEL },
  { label: "Hive pressure", value: NO_DEVICE_LABEL },
  { label: "Hive weight", value: NO_DEVICE_LABEL },
];

export const buildWeatherFacts = (
  _traceData: TraceResponse | null,
  weather?: {
    current?: {
      condition?: unknown;
      temperature_c?: unknown;
      humidity_pct?: unknown;
      pressure_hpa?: unknown;
      wind_speed_kmh?: unknown;
      wind_speed_kph?: unknown;
      last_observed_at?: unknown;
    };
  } | null,
) => [
  { label: "Today's weather", value: formatTraceText(weather?.current?.condition) },
  { label: "In-land temperature", value: formatTraceNumber(weather?.current?.temperature_c as number, "°C", 1) },
  { label: "In-land humidity", value: formatTraceNumber(weather?.current?.humidity_pct as number, "%", 0) },
  { label: "In-land pressure", value: formatTraceNumber(weather?.current?.pressure_hpa as number, " hPa", 0) },
  { label: "Wind speed", value: formatTraceNumber((weather?.current?.wind_speed_kmh ?? weather?.current?.wind_speed_kph) as number, " km/h", 1) },
  { label: "Weather checked", value: formatTraceDate(weather?.current?.last_observed_at) },
];
