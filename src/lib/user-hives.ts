import { CANONICAL_APIARY_NAME, CANONICAL_APIARY_LOCATION, normalizeApiaryName } from "./apiary-normalization";

export interface UserLike {
  id?: string | null;
  email?: string | null;
  user_metadata?: Record<string, any> | null;
}

export interface ProfileLike {
  id?: string | null;
  email?: string | null;
  full_name?: string | null;
}

export interface UnifiedHive {
  id: string;
  name: string;
  hive_code?: string;
  code?: string;
  status?: string;
  hasColony?: boolean;
  apiary_id?: string;
  apiary_name?: string;
  apiary?: string;
  hasSensor?: boolean;
  sensorSerial?: string;
  colonyStrength?: string;
  colonyAvailability?: string;
  queenBreedingYear?: number;
  queenStatus?: string;
  max_brood_frames?: number;
  frame_count?: number;
}

export interface UnifiedApiary {
  id: string;
  name: string;
  location?: string;
  location_name?: string;
  region?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  active_hives?: number;
  total_hives?: number;
  acres?: number;
}

/**
 * Identifies whether the current user is Timothy (Apiary Owner / Founder)
 */
export function isTimothyUser(user?: UserLike | null, profile?: ProfileLike | null): boolean {
  if (!user && !profile) return false;
  const uid = (user?.id || "").toLowerCase();
  const email = (user?.email || profile?.email || "").toLowerCase();
  const name = (profile?.full_name || user?.user_metadata?.full_name || "").toLowerCase();

  return (
    uid === "usr_kibwezi_owner_01" ||
    email.includes("timothy") ||
    email.includes("tnduva") ||
    email.includes("nduva") ||
    name.includes("timothy") ||
    name.includes("nduva")
  );
}

// Timothy Nduva operates 184 managed Langstroth hive stands in Kibwezi with zero hardware IoT sensors connected so far
const KIBWEZI_DEVICE_MAP: Record<string, { serial: string; hasSensor: boolean }> = {};

/**
 * Timothy Nduva's 184 Managed Langstroth Hives in Kibwezi, Makueni County
 * Note: Based on verified production records, 150 stands have active producing colonies,
 * and 34 stands (KIB-151 to KIB-184) are standby boxes / awaiting swarms.
 */
export const CANONICAL_TIMOTHY_HIVES: UnifiedHive[] = Array.from({ length: 184 }, (_, i) => {
  const code = `KIB-${String(i + 1).padStart(3, "0")}`;
  const hasColony = i < 150;
  const breedingYear = hasColony ? (i % 6 === 0 ? 2024 : i % 11 === 0 ? 2023 : 2025) : undefined;
  const isSpecial = hasColony && (i % 12 === 0);
  const dev = KIBWEZI_DEVICE_MAP[code];

  return {
    id: `hive-kib-${String(i + 1).padStart(3, "0")}`,
    code,
    hive_code: code,
    name: `${code} (Langstroth 10)`,
    status: hasColony ? "ACTIVE" : "STANDBY",
    hasColony,
    apiary_id: "apiary-kibwezi",
    apiary_name: CANONICAL_APIARY_NAME,
    apiary: CANONICAL_APIARY_NAME,
    hasSensor: Boolean(dev?.hasSensor),
    sensorSerial: dev?.serial,
    colonyStrength: hasColony
      ? (i < 30
          ? "Strong (8–10 Frames Brood & Bees)"
          : i % 4 === 0
          ? "Strong (8–10 Frames Brood & Bees)"
          : i % 7 === 0
          ? "Moderate (5–7 Frames)"
          : "Strong (8–10 Frames Brood & Bees)")
      : "Empty Stand (Awaiting Swarm / Colonization)",
    colonyAvailability: hasColony
      ? (i < 30
          ? "Active Early Spring Production & Pollination"
          : i % 5 === 0
          ? "Available for Pollination Contracts"
          : "Dedicated Honey Production")
      : "Standby Stand (Unoccupied)",
    queenBreedingYear: breedingYear,
    queenStatus: hasColony
      ? (isSpecial ? "Active Laying Queen (Young, Marked)" : "Active Laying Queen (Marked)")
      : "No Queen (Standby Box)",
    max_brood_frames: hasColony ? 10 : 0,
    frame_count: 10,
  };
});

/**
 * Timothy Nduva's Canonical Apiary in Kibwezi:
 * 150 Active Producing Colonies across 184 Managed Langstroth Hive Stands
 */
export const CANONICAL_TIMOTHY_APIARY: UnifiedApiary = {
  id: "apiary-kibwezi",
  name: CANONICAL_APIARY_NAME,
  location: CANONICAL_APIARY_LOCATION,
  location_name: CANONICAL_APIARY_LOCATION,
  region: "Makueni",
  county: "Kibwezi",
  latitude: -2.409,
  longitude: 37.967,
  active_hives: 150,
  total_hives: 184,
  acres: 5,
};

/**
 * Resolve hives for a user.
 * - If user is Timothy (or guest): returns Timothy's 184 Kibwezi hives merged with any user-saved hives.
 * - If non-Timothy logged in user: returns only that user's specific hives.
 */
export function resolveUserHives(
  user?: UserLike | null,
  profile?: ProfileLike | null,
  remoteOrCustomHives: UnifiedHive[] = []
): UnifiedHive[] {
  const isTimothy = isTimothyUser(user, profile);
  const isGuest = !user?.id;

  if (isTimothy || isGuest) {
    // Start with Timothy's 184 hives
    const baseMap = new Map<string, UnifiedHive>();
    CANONICAL_TIMOTHY_HIVES.forEach((h) => baseMap.set(h.code || h.name, h));

    // Overlay any custom/remote modifications
    remoteOrCustomHives.forEach((ch) => {
      const key = ch.hive_code || ch.code || ch.name;
      if (key) {
        baseMap.set(key, { ...baseMap.get(key), ...ch });
      } else {
        baseMap.set(ch.id, ch);
      }
    });

    return Array.from(baseMap.values());
  }

  // Non-Timothy user: strictly their own hives only
  return remoteOrCustomHives;
}

export interface HiveHealthRecordSeed {
  id: string;
  hive_name: string;
  record_type: "inspection" | "acoustic" | "varroa" | "asian_hornet";
  recorded_at: string;
  health_index?: number;
  varroa_count?: number;
  asian_hornet_count?: number;
  temperature_c?: number;
  humidity_pct?: number;
  weight_kg?: number;
  notes?: string;
  colony_strength?: string;
  colony_availability?: string;
  inspector?: string;
  sensor_serial?: string;
}

export const TIMOTHY_DEFAULT_HEALTH_RECORDS: HiveHealthRecordSeed[] = [
  {
    id: "rec_kib_001_01",
    hive_name: "KIB-001 (Langstroth 10)",
    record_type: "inspection",
    recorded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    health_index: 94,
    varroa_count: 1,
    colony_strength: "Strong (8–10 Frames Brood & Bees)",
    colony_availability: "Dedicated Honey Production",
    notes: "Vigorous queen laying pattern observed. 8 solid brood frames, capped honey supers optimal. Physical apiary inspection verified.",
    inspector: "Timothy Nduva",
  },
  {
    id: "rec_kib_002_01",
    hive_name: "KIB-002 (Langstroth 10)",
    record_type: "inspection",
    recorded_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    health_index: 91,
    varroa_count: 2,
    colony_strength: "Strong (8–10 Frames Brood & Bees)",
    colony_availability: "Dedicated Honey Production",
    notes: "Solid honey storage. Calm temperament, hygienic bottom board inspected clean. Manual physical check.",
    inspector: "Timothy Nduva",
  },
  {
    id: "rec_kib_003_01",
    hive_name: "KIB-003 (Langstroth 10)",
    record_type: "inspection",
    recorded_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    health_index: 88,
    varroa_count: 3,
    colony_strength: "Moderate (5–7 Frames)",
    colony_availability: "Dedicated Honey Production",
    notes: "Steady foraging observed. 10-frame physical inspection confirms healthy worker brood and comb extension.",
    inspector: "Timothy Nduva",
  },
  {
    id: "rec_kib_004_01",
    hive_name: "KIB-004 (Langstroth 10)",
    record_type: "inspection",
    recorded_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    health_index: 96,
    varroa_count: 0,
    colony_strength: "Very Strong / Swarm-Prone (>10 Frames)",
    colony_availability: "Available for Pollination Contracts",
    notes: "Prime commercial pollination condition. Drone cells controlled, swarm management completed.",
    inspector: "Timothy Nduva",
  },
  {
    id: "rec_kib_005_01",
    hive_name: "KIB-005 (Langstroth 10)",
    record_type: "acoustic",
    recorded_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    health_index: 92,
    notes: "Mobile audio audit: 245 Hz fundamental queen piping and cluster harmony recorded via smartphone microphone.",
    inspector: "Timothy Nduva",
  },
];

/**
 * Resolve apiaries for a user.
 * - If Timothy or guest: returns Timothy's Kibwezi apiary + custom apiaries.
 * - If non-Timothy: returns strictly that user's apiaries.
 */
export function resolveUserApiaries(
  user?: UserLike | null,
  profile?: ProfileLike | null,
  remoteOrCustomApiaries: UnifiedApiary[] = []
): UnifiedApiary[] {
  const isTimothy = isTimothyUser(user, profile);
  const isGuest = !user?.id;

  if (isTimothy || isGuest) {
    const list = [CANONICAL_TIMOTHY_APIARY, ...remoteOrCustomApiaries];
    const seen = new Set<string>();
    return list.filter((a) => {
      const norm = normalizeApiaryName(a.name).toLowerCase();
      if (seen.has(norm)) return false;
      seen.add(norm);
      return true;
    });
  }

  return remoteOrCustomApiaries;
}

