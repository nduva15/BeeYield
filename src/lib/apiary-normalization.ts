export const CANONICAL_APIARY_NAME = "BeeYield Apiary in Kibwezi Kenya";
export const CANONICAL_APIARY_LOCATION = "Kibwezi, Makueni, Kenya";
export const CANONICAL_BEEKEEPER = "Timothy Nduva";
export const CANONICAL_APIARY_ACRES = 5;

export function normalizeApiaryName(name?: string | null): string {
  if (!name) return CANONICAL_APIARY_NAME;
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower === "kibwezi main apiary" ||
    lower.includes("kibwezi main") ||
    lower === "kibwezi apiary" ||
    lower === "beeyield apiary" ||
    lower === "beeyield apiary kibwezi" ||
    lower === "beeyield apiary • kibwezi" ||
    lower === "main apiary" ||
    lower === "primary apiary" ||
    lower === "commercial apiary" ||
    lower === "apiary" ||
    lower.includes("kibwezi")
  ) {
    return CANONICAL_APIARY_NAME;
  }
  return trimmed;
}

export function normalizeApiaryLocation(loc?: string | null): string {
  if (!loc) return CANONICAL_APIARY_LOCATION;
  const trimmed = loc.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower === "kiunduani, kibwezi, makueni" ||
    lower === "kibwezi, makueni" ||
    lower === "kibwezi" ||
    lower.includes("kiunduani, kibwezi, makueni") ||
    (lower.includes("kiunduani") && !lower.includes("kenya")) ||
    (lower.includes("kibwezi") && !lower.includes("kenya"))
  ) {
    return CANONICAL_APIARY_LOCATION;
  }
  return trimmed;
}

export function deduplicateApiaries<T extends { id?: string; name: string }>(apiariesList: T[]): T[] {
  const seen = new Set<string>();
  const deduplicated: T[] = [];
  for (const ap of apiariesList) {
    const key = normalizeApiaryName(ap.name).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push({
        ...ap,
        name: normalizeApiaryName(ap.name),
      });
    }
  }
  return deduplicated;
}
