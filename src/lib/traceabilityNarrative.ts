import { TraceResponse } from "@/services/traceabilityService";

export const TRACEABILITY_MISSING = "Missing backend data";

export const BEEYIELD_TRACEABILITY_STORY = {
  founder: "Timothy Nduva",
  foundingYear: 2020,
  foundingHives: 4,
  currentHives: 284,
  apiaryFootprint: "5-acre apiary",
  treesPlanted: "2,500+",
  conservationFocus:
    "BeeYield pairs ethical harvesting with biodiversity restoration, tree planting, and monitored hive care so every harvest protects the colony and the landscape around it.",
  fiftyFifty:
    "We follow a 50/50 harvest journey: a documented portion is harvested for people and an equal reserve is left in the hive to sustain the bees through the season.",
  esgCommitment:
    "Our ESG commitment centers on traceability, pollinator health, ecosystem restoration, and accountable field operations backed by verifiable records.",
};

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
      : `${BEEYIELD_TRACEABILITY_STORY.founder} started BeeYield in ${BEEYIELD_TRACEABILITY_STORY.foundingYear} with ${BEEYIELD_TRACEABILITY_STORY.foundingHives} hives and a mission to build a transparent, conservation-led honey business in Kibwezi.`;

  const growthStory = `From ${BEEYIELD_TRACEABILITY_STORY.foundingHives} hives, BeeYield has grown to ${BEEYIELD_TRACEABILITY_STORY.currentHives} hives across a ${BEEYIELD_TRACEABILITY_STORY.apiaryFootprint}, while maintaining an ethical harvest model and investing in long-term pollinator resilience.`;

  const conservationStory = `${BEEYIELD_TRACEABILITY_STORY.conservationFocus} We have planted ${BEEYIELD_TRACEABILITY_STORY.treesPlanted} trees and continue to link traceability with restoration work on the ground.`;

  const esgStory = `${BEEYIELD_TRACEABILITY_STORY.fiftyFifty} ${BEEYIELD_TRACEABILITY_STORY.esgCommitment}`;

  return [farmerStory, growthStory, conservationStory, esgStory];
};

export const buildHarvestFacts = (traceData: TraceResponse | null) => [
  { label: "Batch", value: formatTraceText(traceData?.batch_code) },
  { label: "Harvest date", value: formatTraceDate(traceData?.harvest_date || traceData?.timeline?.find((item) => item.title === "Harvest Day")?.date) },
  { label: "Apiary", value: formatTraceText(traceData?.apiary?.name) },
  { label: "Hive", value: formatTraceText(traceData?.hive?.hive_code) },
  { label: "Farmer", value: formatTraceText(traceData?.farmer?.name) },
  { label: "Florage", value: traceData?.apiary?.flora_types?.length ? traceData?.apiary?.flora_types?.join(", ") ?? formatTraceText(traceData?.florage_type) : formatTraceText(traceData?.florage_type) },
];

export const buildConservationFacts = (traceData: TraceResponse | null) => [
  {
    label: "50/50 reserve left for bees",
    value: typeof traceData?.extra_metadata?.quantity_left_for_bees_kg === "number"
      ? `${traceData?.extra_metadata?.quantity_left_for_bees_kg}kg`
      : formatTraceText(traceData?.extra_metadata?.quantity_left_for_bees_kg),
  },
  {
    label: "Harvested volume",
    value: typeof traceData?.impact_stats?.total_honey_kg === "number"
      ? `${traceData?.impact_stats?.total_honey_kg}kg`
      : formatTraceText(traceData?.impact_stats?.total_honey_kg),
  },
  { label: "50/50 rule status", value: formatTraceText(traceData?.sustainability?.status) },
  {
    label: "Trees planted",
    value: formatTraceText(traceData?.impact_stats?.trees_planted || traceData?.impact_stats?.tree_count, BEEYIELD_TRACEABILITY_STORY.treesPlanted),
  },
  {
    label: "Hive growth story",
    value: `${BEEYIELD_TRACEABILITY_STORY.foundingHives} to ${BEEYIELD_TRACEABILITY_STORY.currentHives} hives`,
  },
  {
    label: "ESG focus",
    value: "Traceability, pollinator health, conservation, accountability",
  },
];

export const buildSensorFacts = (traceData: TraceResponse | null) => [
  { label: "Temperature", value: formatTraceNumber(traceData?.sensor_snapshot?.avg_temp, " C", 1) },
  { label: "Humidity", value: formatTraceNumber(traceData?.sensor_snapshot?.avg_humidity, "%", 1) },
  { label: "Hive weight", value: formatTraceNumber(traceData?.sensor_snapshot?.weight_kg, "kg", 1) },
  { label: "Last sensor sync", value: formatTraceDate(traceData?.sensor_snapshot?.sync_time) },
];

export const buildWeatherFacts = (
  traceData: TraceResponse | null,
  weather?: {
    current?: {
      condition?: unknown;
      temperature_c?: unknown;
      humidity_pct?: unknown;
      wind_speed_kmh?: unknown;
      wind_speed_kph?: unknown;
      last_observed_at?: unknown;
    };
  } | null,
) => [
  { label: "Recorded harvest weather", value: formatTraceText(traceData?.extra_metadata?.weather_conditions) },
  { label: "Current apiary condition", value: formatTraceText(weather?.current?.condition) },
  { label: "Current temperature", value: formatTraceNumber(weather?.current?.temperature_c as number, " C", 1) },
  { label: "Current humidity", value: formatTraceNumber(weather?.current?.humidity_pct as number, "%", 1) },
  { label: "Wind speed", value: formatTraceNumber((weather?.current?.wind_speed_kmh ?? weather?.current?.wind_speed_kph) as number, " km/h", 1) },
  { label: "Observed at", value: formatTraceDate(weather?.current?.last_observed_at) },
];
