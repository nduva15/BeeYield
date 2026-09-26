import { supabase } from "@/integrations/supabase/client";

export interface FlorageRecord {
  id: string;
  name: string;
  latin: string;
  bloom: string;
  nectar: number;
  pollen: number;
  radius: number;
  notes: string | null;
  is_default: boolean;
  device_id?: string | null;
  apiary_source?: string | null;
}

export const KNOWN_BOTANICAL_PROFILES: Record<
  string,
  { latin: string; bloom: string; nectar: number; pollen: number; radius: number; notes: string }
> = {
  acacia: {
    latin: "Acacia tortilis / Acacia senegal",
    bloom: "Nov–Feb & Jul–Aug",
    nectar: 10,
    pollen: 8,
    radius: 2500,
    notes: "Premier dryland African acacia; water-white to extra light amber single-source export honey",
  },
  neem: {
    latin: "Azadirachta indica",
    bloom: "Mar–May & Sep–Nov",
    nectar: 9,
    pollen: 7,
    radius: 1500,
    notes: "Antimicrobial medicinal honey; consistent heavy nectar and pollen pulses in warm ecosystems",
  },
  maize: {
    latin: "Zea mays",
    bloom: "Jun–Aug & Dec–Jan",
    nectar: 4,
    pollen: 10,
    radius: 1200,
    notes: "Massive seasonal protein pollen pulse for rapid colony buildup, wax building and brood rearing",
  },
  mango: {
    latin: "Mangifera indica",
    bloom: "Jul–Sep (Eastern Kenya)",
    nectar: 8,
    pollen: 8,
    radius: 1000,
    notes: "Fragrant tropical blossom nectar; high pollinator density driver in dryland agroforestry",
  },
  "forest multifloral": {
    latin: "Acacia + Combretum + Terminalia",
    bloom: "Year-round post-rains",
    nectar: 9,
    pollen: 9,
    radius: 3000,
    notes: "Complex dryland bush multifloral blend; rich antioxidant profile and dark amber hue",
  },
  sunflower: {
    latin: "Helianthus annuus",
    bloom: "Jul–Aug",
    nectar: 7,
    pollen: 9,
    radius: 1200,
    notes: "Fast crystallisation; exceptionally rich pollen load for hive population boom",
  },
  lavender: {
    latin: "Lavandula angustifolia",
    bloom: "Jun–Aug",
    nectar: 8,
    pollen: 5,
    radius: 600,
    notes: "Highly aromatic premium honey with calming essential terpenes and steady nectar flow",
  },
  macadamia: {
    latin: "Macadamia integrifolia",
    bloom: "Aug–Sep",
    nectar: 7,
    pollen: 7,
    radius: 800,
    notes: "Long raceme floral clusters with strong pollinator dependency and nut orchard honey",
  },
  coffee: {
    latin: "Coffea arabica",
    bloom: "Sep–Oct (E. Africa)",
    nectar: 7,
    pollen: 6,
    radius: 600,
    notes: "Intense 7-day mass bloom triggered by seasonal showers; delicate light citrus honey",
  },
  eucalyptus: {
    latin: "Eucalyptus spp.",
    bloom: "Year-round (varies)",
    nectar: 9,
    pollen: 7,
    radius: 2000,
    notes: "Dependable dryland nectar flow with bold caramel-menthol undertones",
  },
  citrus: {
    latin: "Citrus sinensis",
    bloom: "Mar–May",
    nectar: 9,
    pollen: 7,
    radius: 1000,
    notes: "Celebrated orange-blossom bouquet; crystal clear light honey with citrus finish",
  },
  avocado: {
    latin: "Persea americana",
    bloom: "Mar–May",
    nectar: 7,
    pollen: 6,
    radius: 700,
    notes: "Dark molasses-style honey rich in minerals, potassium, and antioxidants",
  },
  baobab: {
    latin: "Adansonia digitata",
    bloom: "May–Jul",
    nectar: 8,
    pollen: 8,
    radius: 2000,
    notes: "Nocturnal dryland blossom visited at dawn by African honeybees; high vitamin C honey",
  },
  croton: {
    latin: "Croton megalocarpus",
    bloom: "Mar–May",
    nectar: 8,
    pollen: 7,
    radius: 1800,
    notes: "Indigenous highland canopy tree; dark robust honey with medicinal properties",
  },
  moringa: {
    latin: "Moringa oleifera",
    bloom: "Year-round (intermittent)",
    nectar: 8,
    pollen: 8,
    radius: 1000,
    notes: "Superfood blossom forage; continuous blooms under irrigation or tropical warmth",
  },
  clover: {
    latin: "Trifolium repens",
    bloom: "May–Sep",
    nectar: 9,
    pollen: 7,
    radius: 800,
    notes: "Classic sweet mild pasture honey with high sucrose-to-glucose balance",
  },
  borage: {
    latin: "Borago officinalis",
    bloom: "Jun–Sep",
    nectar: 10,
    pollen: 7,
    radius: 800,
    notes: "Nectaries replenish every few minutes; one of the highest volume nectar plants known",
  },
};

/**
 * Parses raw user-entered forage string into distinct plant names
 */
export function parseForageNames(rawForage?: string | null): string[] {
  if (!rawForage) return [];
  return rawForage
    .split(/[,;&•+/\n]|(?:\s+and\s+)/i)
    .map((s) => s.trim().replace(/^[-*•\s]+/, ""))
    .filter((s) => s.length > 1 && s.toLowerCase() !== "and" && s.toLowerCase() !== "&");
}

/**
 * Resolves botanical profile for any given plant name
 */
export function resolveBotanicalProfile(
  plantName: string,
  apiaryName?: string,
  locationName?: string
) {
  const clean = plantName.trim();
  const lower = clean.toLowerCase();

  // Find known match
  let matchedKey = Object.keys(KNOWN_BOTANICAL_PROFILES).find(
    (k) => lower.includes(k) || k.includes(lower)
  );

  const matched = matchedKey ? KNOWN_BOTANICAL_PROFILES[matchedKey] : null;

  const notesSource = apiaryName
    ? `Linked to Apiary: ${apiaryName}${locationName ? ` (${locationName})` : ""}`
    : "Sourced from Apiary Botanical Ledger";

  if (matched) {
    return {
      name: clean,
      latin: matched.latin,
      bloom: matched.bloom,
      nectar: matched.nectar,
      pollen: matched.pollen,
      radius: matched.radius,
      notes: `${matched.notes} • ${notesSource}`,
    };
  }

  // Generative profile for custom user-added plants
  return {
    name: clean,
    latin: `${clean} spp. (Apis Mellifera Forage)`,
    bloom: "Seasonal Bloom / Active Apiary Forage",
    nectar: 8,
    pollen: 7,
    radius: 1200,
    notes: `Apiary Forage Species • ${notesSource}`,
  };
}

/**
 * Synchronizes forage types entered for an apiary directly into the Florage Database
 */
export async function syncApiaryForageToFlorage(
  apiaryName: string,
  locationName: string,
  forageType?: string | null,
  deviceId?: string | null
): Promise<FlorageRecord[]> {
  const plantNames = parseForageNames(forageType);
  if (plantNames.length === 0) return [];

  const effectiveDeviceId = deviceId || "beeyield-global-device";
  const syncedRecords: FlorageRecord[] = [];

  // Read local cache first
  const cacheKey = "florage_plants_cache";
  let cached: FlorageRecord[] = [];
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) cached = JSON.parse(raw);
  } catch {}

  for (const name of plantNames) {
    const profile = resolveBotanicalProfile(name, apiaryName, locationName);
    const existingIndex = cached.findIndex(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );

    const record: FlorageRecord = {
      id: existingIndex >= 0 ? cached[existingIndex].id : `florage-${name.toLowerCase().replace(/\W+/g, "-")}-${Date.now().toString().slice(-4)}`,
      name: profile.name,
      latin: profile.latin,
      bloom: profile.bloom,
      nectar: profile.nectar,
      pollen: profile.pollen,
      radius: profile.radius,
      notes: profile.notes,
      is_default: false,
      device_id: effectiveDeviceId,
      apiary_source: `${apiaryName} (${locationName})`,
    };

    if (existingIndex >= 0) {
      cached[existingIndex] = { ...cached[existingIndex], ...record };
    } else {
      cached.unshift(record);
    }
    syncedRecords.push(record);

    // Sync to Supabase in background
    try {
      await (supabase as any).from("florage_plants").upsert(
        {
          id: record.id,
          name: record.name,
          latin: record.latin,
          bloom: record.bloom,
          nectar: record.nectar,
          pollen: record.pollen,
          radius: record.radius,
          notes: record.notes,
          device_id: effectiveDeviceId,
          is_default: false,
        },
        { onConflict: "id" }
      );
    } catch {
      // Non-blocking fallback to local storage
    }
  }

  // Update local storage
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cached));
    localStorage.setItem("beeyield.florage.v2", JSON.stringify(cached));
  } catch {}

  // Dispatch live change notification so UI immediately refreshes
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("beeyield:florage:changed", { detail: syncedRecords }));
  }

  return syncedRecords;
}

/**
 * Scans all user apiaries and ensures all forage plants are registered in Florage Database
 */
export async function syncAllApiariesToFlorage(
  userKey?: string,
  deviceId?: string | null
): Promise<FlorageRecord[]> {
  const effectiveUserKey = userKey || "default_user";
  let apiariesList: any[] = [];

  try {
    const stored = localStorage.getItem(`beeyield_user_apiaries_${effectiveUserKey}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) apiariesList = parsed;
    }
  } catch {}

  // Fallback canonical Kibwezi Apiary if no local apiaries exist
  if (apiariesList.length === 0) {
    apiariesList = [
      {
        name: "BeeYield Apiary in Kibwezi Kenya",
        location_name: "Kibwezi, Makueni County, Kenya",
        forage_type: "Acacia, Neem, Maize, Mango & Forest Multifloral",
      },
    ];
  }

  const allSynced: FlorageRecord[] = [];
  for (const ap of apiariesList) {
    if (ap.forage_type) {
      const synced = await syncApiaryForageToFlorage(
        ap.name || "BeeYield Apiary",
        ap.location_name || "Kibwezi, Kenya",
        ap.forage_type,
        deviceId
      );
      allSynced.push(...synced);
    }
  }

  return allSynced;
}
