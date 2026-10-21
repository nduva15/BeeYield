/**
 * Ceba AI Apicultural Intelligence & Real-Time Telemetry Context Engine
 * 
 * Strict User Isolation & Domain Synthesis:
 * 1. User-Aware Context Resolution:
 *    - If Timothy Nduva: Full canonical portfolio (184 Managed Langstroth Hives in Kibwezi,
 *      184 active producing colonies, exactly 843.0 kg KEBS export certified
 *      raw honey across 423 batches 2020–2026, IoT Apisense nodes).
 *    - If a New User / Other User: Strictly loads and displays THEIR OWN records (their apiaries,
 *      their hives, their harvest batches, their sensor nodes). NEVER leaks Timothy's data
 *      or dummy Kibwezi records.
 *    - If a New User has 0 records: Acknowledges fresh workspace and provides onboarding guidance.
 * 2. Live Telemetry Synthesis:
 *    - Hives Activity & Colony Diagnostics
 *    - Certified Honey Batches & Extraction Logs
 *    - Outside Weather for Apiary Locations
 *    - Synced IoT Sensor Nodes & Telemetry
 */

import { beeyieldService, Hive, Apiary, Harvest, BatchView, SensorReading } from "@/services/beeyieldService";
import { fetchLiveWeather, LiveWeatherData } from "@/services/weatherService";
import { apisenseSyncManager } from "@/services/ApisenseSyncManager";
import { getPublicTraceabilityBatches, PublicTraceabilityBatch } from "@/services/traceabilityService";
import { offlineTelemetry } from "@/services/offlineTelemetryCache";
import {
  isTimothyUser,
  getAuthenticatedUserName,
  UserLike,
  ProfileLike,
  CANONICAL_TIMOTHY_HIVES,
  CANONICAL_TIMOTHY_APIARY,
} from "@/lib/user-hives";
import { CANONICAL_TIMOTHY_HARVESTS } from "@/data/canonicalHarvests";
import { supabaseBeeYield, supabaseCEBA, supabaseShop } from "@/lib/supabase";

export interface HiveWeatherSummary {
  apiaryId: string;
  apiaryName: string;
  latitude: number;
  longitude: number;
  outsideTemp: number;
  outsideHumidity: number;
  outsideWind: number;
  conditionText: string;
  todayMin: number;
  todayMax: number;
  flightViability: "optimal" | "moderate" | "restricted" | "grounded";
  flightViabilityReason: string;
}

export interface SyncedDeviceMetric {
  serial: string;
  name: string;
  hiveId?: string;
  hiveCode?: string;
  syncStatus: string;
  connectionType: string;
  /** Telemetry values are null when the device has not reported them (never placeholder numbers). */
  batteryPct: number | null;
  rssiDbm: number | null;
  broodTempC: number | null;
  internalHumidityPct: number | null;
  hiveWeightKg: number | null;
  acousticHz: number | null;
  pressureHpa?: number;
  acousticVerdict: string | null;
  lastReport: string | null;
}

export interface CebaUserInfo {
  id?: string;
  email?: string;
  name: string;
  isTimothy: boolean;
  isGuest: boolean;
  totalHives: number;
  activeHives: number;
  totalYieldKg: number;
  totalBatches: number;
}

export interface CebaTelemetryContext {
  hives: Hive[];
  apiaries: Apiary[];
  harvests: Harvest[];
  batches: (BatchView | PublicTraceabilityBatch)[];
  weatherByApiary: Record<string, HiveWeatherSummary>;
  syncedDevices: SyncedDeviceMetric[];
  latestReadings: SensorReading[];
  timestamp: string;
  user: CebaUserInfo;
}

// In-memory weather cache to prevent rate-limiting Open-Meteo
const weatherCache = new Map<string, { data: HiveWeatherSummary; cachedAt: number }>();
const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Formats an optional sensor value; absent readings render as N/A instead of an invented number. */
const nz = (v: number | null | undefined, unit = ""): string => (v === null || v === undefined ? "N/A" : `${v}${unit}`);

/**
 * Automatically detects the currently active user session across Supabase and local storage
 */
async function resolveActiveUser(
  explicitUser?: UserLike | null,
  explicitProfile?: ProfileLike | null
): Promise<{ user: UserLike | null; profile: ProfileLike | null }> {
  if (explicitUser || explicitProfile) {
    return { user: explicitUser || null, profile: explicitProfile || null };
  }

  // 1. Check window.localStorage for stored user
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("beeyield_local_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user || parsed?.profile) {
          return { user: parsed.user || null, profile: parsed.profile || null };
        }
      }
    } catch {}

    // 2. Check supabase auth tokens in localStorage
    try {
      const extraKeys = ["beeyield_user", "beeyield_auth_user", "supabase.auth.token"];
      for (const ek of extraKeys) {
        const raw = localStorage.getItem(ek);
        if (raw) {
          const parsed = JSON.parse(raw);
          const u = parsed?.user || parsed?.currentSession?.user || parsed;
          if (u?.id || u?.email) {
            return { user: u, profile: parsed?.profile || null };
          }
        }
      }

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("sb-") && k.endsWith("-auth-token"))) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            const user = parsed?.user || parsed?.currentSession?.user;
            if (user) {
              return { user, profile: null };
            }
          }
        }
      }
    } catch {}
  }

  // 3. Check Supabase clients directly
  try {
    const { data } = await supabaseBeeYield.auth.getUser();
    if (data?.user) return { user: data.user, profile: null };
  } catch {}

  try {
    const { data } = await supabaseCEBA.auth.getUser();
    if (data?.user) return { user: data.user, profile: null };
  } catch {}

  try {
    const { data } = await supabaseShop.auth.getUser();
    if (data?.user) return { user: data.user, profile: null };
  } catch {}

  return { user: null, profile: null };
}

/**
 * Gathers and synthesizes live apicultural telemetry with strict user isolation:
 * - Timothy Nduva: Full 184 Langstroth hives in Kibwezi, exactly 843.0 kg harvests (423 batches 2020-2026)
 * - New User / Other User: Strictly their own records (never shows another user's data)
 */
export async function getCebaTelemetryContext(
  explicitUser?: UserLike | null,
  explicitProfile?: ProfileLike | null
): Promise<CebaTelemetryContext> {
  const nowIso = new Date().toISOString();

  // 1. Resolve user identity and authorization scope
  const { user: activeUser, profile: activeProfile } = await resolveActiveUser(explicitUser, explicitProfile);
  const isTimothy = isTimothyUser(activeUser, activeProfile);
  const isGuest = !isTimothy && !activeUser?.id;

  // 2. Fetch remote records from BeeYield service
  const [
    apiariesRes,
    hivesRes,
    harvestsRes,
    batchesRes,
    devicesRes,
    readingsRes,
  ] = await Promise.all([
    beeyieldService.getApiaries().catch(() => []),
    beeyieldService.getHives().catch(() => []),
    beeyieldService.getHarvests().catch(() => []),
    beeyieldService.getBatches().catch(() => []),
    beeyieldService.getDevices().catch(() => []),
    beeyieldService.getSensorReadings(undefined, 20).catch(() => []),
  ]);

  let apiaries: Apiary[] = [];
  let hives: Hive[] = [];
  let harvests: Harvest[] = [];
  let batches: (BatchView | PublicTraceabilityBatch)[] = [];

  if (isTimothy) {
    // -------------------------------------------------------------
    // TIMOTHY NDUVA PORTFOLIO (184 Managed Langstroth Hives & 843.0 kg)
    // -------------------------------------------------------------
    const canonicalApiary: Apiary = {
      id: CANONICAL_TIMOTHY_APIARY.id,
      name: CANONICAL_TIMOTHY_APIARY.name,
      location_name: CANONICAL_TIMOTHY_APIARY.location || "Kibwezi, Makueni County, Kenya",
      county: CANONICAL_TIMOTHY_APIARY.county || "Makueni",
      region: CANONICAL_TIMOTHY_APIARY.region || "Eastern Kenya",
      latitude: CANONICAL_TIMOTHY_APIARY.latitude || -2.409,
      longitude: CANONICAL_TIMOTHY_APIARY.longitude || 37.967,
      hive_count: CANONICAL_TIMOTHY_HIVES.length,
      status: "active",
      forage_type: CANONICAL_TIMOTHY_APIARY.forage_type || "Acacia, Neem, Maize, Mango & Forest Multifloral",
    };

    // Combine any user-created remote apiaries with canonical Kibwezi Apiary
    const remoteApiaries = Array.isArray(apiariesRes) ? apiariesRes : [];
    const apiaryMap = new Map<string, Apiary>();
    apiaryMap.set(canonicalApiary.id, canonicalApiary);
    remoteApiaries.forEach((a) => {
      if (a && a.id) apiaryMap.set(a.id, a);
    });
    apiaries = Array.from(apiaryMap.values());

    // Timothy's registered stand ledger. Only registry facts are seeded here; no temperature,
    // humidity, weight or brood figures are invented — those come from real sensor readings only.
    const canonicalHives: Hive[] = CANONICAL_TIMOTHY_HIVES.map((uh, idx) => ({
      id: uh.id,
      hive_code: uh.code || uh.hive_code || `KIB-${String(idx + 1).padStart(3, "0")}`,
      nickname: uh.name,
      apiary_id: canonicalApiary.id,
      apiary_name: canonicalApiary.name,
      hive_type: "Langstroth 10-Frame",
      bee_type: "Apis mellifera scutellata",
      frame_count: uh.frame_count || 10,
      status: uh.status || (uh.hasColony ? "ACTIVE" : "STANDBY"),
      health_status: uh.hasColony ? "Not assessed" : "Standby (Empty)",
      has_sensors: Boolean(uh.hasSensor),
      notes: uh.hasColony
        ? "Registered active colony (no inspection data attached)."
        : "Standby stand ready for swarm capture or colony split.",
    }));

    // Overlay any custom/remote modifications
    const remoteHives = Array.isArray(hivesRes) ? hivesRes : [];
    const hiveMap = new Map<string, Hive>();
    canonicalHives.forEach((h) => hiveMap.set(h.hive_code, h));
    remoteHives.forEach((rh) => {
      if (rh && rh.hive_code) {
        hiveMap.set(rh.hive_code, { ...hiveMap.get(rh.hive_code), ...rh });
      }
    });
    hives = Array.from(hiveMap.values());

    // Harvests: Guarantee Timothy's full 843.0 kg across 423 batches (2020–2026)
    const remoteHarvests = Array.isArray(harvestsRes) ? harvestsRes : [];
    const harvestMap = new Map<string, Harvest>();
    // Seed canonical 843kg batches
    CANONICAL_TIMOTHY_HARVESTS.forEach((ch) => {
      const rawBatch = typeof ch.batch === "object" && ch.batch !== null ? (ch.batch as any).batch_code : ch.batch;
      const key = String(ch.batch_code || rawBatch || ch.id);
      harvestMap.set(key, ch);
    });
    // Overlay remote records
    remoteHarvests.forEach((rh) => {
      const key = rh.batch_code || rh.id;
      if (key) harvestMap.set(key, { ...harvestMap.get(key), ...rh });
    });
    harvests = Array.from(harvestMap.values()).sort(
      (a, b) => (b.harvest_date || "").localeCompare(a.harvest_date || "")
    );

    // Batches
    batches = Array.isArray(batchesRes) && batchesRes.length > 0
      ? batchesRes
      : harvests.map((h) => ({
          id: h.batch_code || h.id,
          batch_code: h.batch_code || h.id,
          honey_type: h.honey_type,
          total_quantity_kg: Number(h.quantity_kg) || 0,
          verified: Boolean(h.is_verified),
          harvest_date: h.harvest_date,
          moisture: h.moisture_content_percent,
          floral_source: h.nectar_source,
          region: "Kibwezi, Makueni",
          status: h.is_verified ? "verified" : "pending",
          blockchain_verified: Boolean(h.is_verified),
        } as any));
  } else if (!isGuest) {
    // -------------------------------------------------------------
    // NEW USER / OTHER REGISTERED USER: STRICT ISOLATION
    // ONLY load their own records. Never inject Timothy's data!
    // -------------------------------------------------------------
    apiaries = Array.isArray(apiariesRes) ? apiariesRes : [];
    hives = Array.isArray(hivesRes) ? hivesRes : [];
    harvests = Array.isArray(harvestsRes) ? harvestsRes : [];
    batches = Array.isArray(batchesRes) ? batchesRes : [];
  } else {
    // -------------------------------------------------------------
    // GUEST / UNAUTHENTICATED
    // -------------------------------------------------------------
    apiaries = [];
    hives = [];
    harvests = [];
    batches = [];
  }

  // 3. User metadata & summary calculations
  const totalYieldKg = harvests.reduce((acc, h) => acc + (Number(h.quantity_kg) || 0), 0);
  const activeHivesCount = hives.filter((h) => h.status !== "inactive" && h.status !== "dormant" && h.status !== "STANDBY").length;

  const resolvedName = isTimothy
    ? "Timothy Nduva"
    : (getAuthenticatedUserName(activeUser, activeProfile) || activeUser?.email?.split("@")[0] || (isGuest ? "Guest Beekeeper" : "Beekeeper"));

  const userInfo: CebaUserInfo = {
    id: activeUser?.id ?? undefined,
    email: activeUser?.email || (isTimothy ? "info@beeyield.com" : undefined),
    name: resolvedName,
    isTimothy,
    isGuest,
    totalHives: hives.length,
    activeHives: activeHivesCount,
    totalYieldKg: Number(totalYieldKg.toFixed(2)),
    totalBatches: batches.length || harvests.length,
  };

  // 4. Resolve outside weather for each apiary that has real coordinates.
  //    If a live lookup fails the apiary is omitted — no placeholder weather is invented.
  const weatherByApiary: Record<string, HiveWeatherSummary> = {};
  for (const apiary of apiaries) {
    const lat = apiary.latitude;
    const lon = apiary.longitude;
    if (typeof lat !== "number" || typeof lon !== "number") continue;
    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.cachedAt < WEATHER_CACHE_TTL_MS) {
      weatherByApiary[apiary.id] = cached.data;
      continue;
    }

    try {
      const live = await fetchLiveWeather(lat, lon);
      const summary = evaluateFlightWeather(apiary.id, apiary.name, lat, lon, live);
      weatherCache.set(cacheKey, { data: summary, cachedAt: Date.now() });
      weatherByApiary[apiary.id] = summary;
    } catch {
      // Live weather unavailable for this apiary right now.
    }
  }

  // 5. IoT Sensor Telemetry & Hardware Nodes — real readings only; missing values stay null.
  const syncedDevices: SyncedDeviceMetric[] = [];
  if (!isGuest) {
    const userHiveIds = new Set(hives.map((h) => h.id));
    const userHiveCodes = new Set(hives.map((h) => (h.hive_code || "").toLowerCase()));

    // 1. Paired Apisense hardware from apisenseSyncManager
    try {
      const pairedApisense = apisenseSyncManager.getAllDevices();
      if (Array.isArray(pairedApisense)) {
        pairedApisense.forEach((d: any) => {
          const dHiveId = d.hiveId || d.hive_id;
          const dHiveCode = d.hiveCode || d.hive_code;
          const dSerial = d.serial || d.serial_number;
          // Known demo/test unit that is not part of the founder's fleet.
          if (isTimothy && String(dSerial || "") === "H26110038001") return;
          const isLinkedToUser =
            !dHiveId ||
            userHiveIds.has(dHiveId) ||
            userHiveCodes.has((dHiveCode || "").toLowerCase()) ||
            hives.length === 0;

          if (isLinkedToUser && !syncedDevices.some((s) => s.serial === dSerial)) {
            syncedDevices.push({
              serial: dSerial,
              name: d.name || d.device_name || `Apisense Node ${dSerial}`,
              hiveId: dHiveId,
              hiveCode: dHiveCode || hives.find((h) => h.id === dHiveId)?.hive_code || "Assigned",
              syncStatus: d.syncStatus || d.sync_status || "unknown",
              connectionType: d.connectionType || d.connection_type || "unknown",
              batteryPct: d.batteryPct ?? d.battery_percentage ?? null,
              rssiDbm: d.rssiDbm ?? d.rssi_dbm ?? null,
              broodTempC: d.telemetry?.broodTemperatureC ?? d.raw_telemetry?.broodTemperatureC ?? null,
              internalHumidityPct: d.telemetry?.internalHumidityPct ?? d.raw_telemetry?.internalHumidityPct ?? null,
              hiveWeightKg: d.telemetry?.hiveWeightKg ?? d.raw_telemetry?.hiveWeightKg ?? null,
              acousticHz: d.telemetry?.dominantAcousticHz ?? d.raw_telemetry?.dominantAcousticHz ?? null,
              acousticVerdict: d.telemetry?.acousticDiagnosticVerdict || d.raw_telemetry?.acousticDiagnosticVerdict || null,
              lastReport: d.lastSyncTime || d.last_report || d.last_measurement || null,
            });
          }
        });
      }
    } catch {}

    // 2. Database IoT devices from /iot/devices
    if (Array.isArray(devicesRes) && devicesRes.length > 0) {
      devicesRes.forEach((d: any) => {
        const serial = d.device_code || d.serial_number || d.serial || d.id;
        if (!syncedDevices.some((s) => s.serial === serial)) {
          const matchingReading = (Array.isArray(readingsRes) ? readingsRes : []).find(
            (r: any) => r.hive_id === d.hive_id || r.device_id === d.id
          );
          syncedDevices.push({
            serial,
            name: d.device_name || d.name || `Apisense Node ${serial}`,
            hiveId: d.hive_id,
            hiveCode: d.hive_code || hives.find((h) => h.id === d.hive_id)?.hive_code || "Assigned",
            syncStatus: d.status || "unknown",
            connectionType: d.connection_type || "unknown",
            batteryPct: d.battery_level ?? null,
            rssiDbm: d.rssi ?? null,
            broodTempC: matchingReading?.temperature ?? d.temp_c ?? null,
            internalHumidityPct: matchingReading?.humidity ?? d.humidity_pct ?? null,
            hiveWeightKg: matchingReading?.weight ?? d.weight_kg ?? null,
            acousticHz: (matchingReading as any)?.acoustics?.frequency ?? (matchingReading?.readings as any)?.dominant_frequency_hz ?? null,
            acousticVerdict: (matchingReading as any)?.acoustics?.status || (matchingReading?.readings as any)?.acoustic_verdict || null,
            lastReport: (matchingReading as any)?.recorded_at || matchingReading?.timestamp || d.last_ping || d.last_seen || null,
          });
        }
      });
    }

    // 3. Hives flagged as sensor-equipped but without a paired device record: list them with
    //    whatever the hive record itself carries; unknown values stay null.
    hives.forEach((h) => {
      if (h.has_sensors && !syncedDevices.some((s) => s.hiveId === h.id || s.hiveCode === h.hive_code)) {
        syncedDevices.push({
          serial: `SEN-${h.hive_code || h.id.slice(0, 6)}`,
          name: `Sentinel Sensor (${h.hive_code})`,
          hiveId: h.id,
          hiveCode: h.hive_code,
          syncStatus: "unknown",
          connectionType: "unknown",
          batteryPct: null,
          rssiDbm: null,
          broodTempC: h.latest_temp ?? null,
          internalHumidityPct: h.latest_humidity ?? null,
          hiveWeightKg: h.latest_weight ?? null,
          acousticHz: null,
          acousticVerdict: null,
          lastReport: null,
        });
      }
    });
  }

  // 6. Sensor reading snapshots
  let latestReadings: SensorReading[] = Array.isArray(readingsRes) ? readingsRes : [];
  if (!latestReadings.length && isTimothy) {
    const cachedSnap = offlineTelemetry.getSnapshot<SensorReading[]>("sensor_readings_all_50_anon");
    if (cachedSnap.isAvailable && cachedSnap.data) {
      latestReadings = cachedSnap.data;
    }
  }

  return {
    hives,
    apiaries,
    harvests,
    batches,
    weatherByApiary,
    syncedDevices,
    latestReadings,
    timestamp: nowIso,
    user: userInfo,
  };
}

/**
 * Assesses weather conditions for honeybee foraging viability
 */
function evaluateFlightWeather(
  apiaryId: string,
  apiaryName: string,
  lat: number,
  lon: number,
  live: LiveWeatherData
): HiveWeatherSummary {
  const temp = live.currentTemp;
  const wind = live.currentWind;
  const humidity = live.currentHumidity;
  const condition = live.conditionText;

  let viability: "optimal" | "moderate" | "restricted" | "grounded" = "optimal";
  let reason = "Ideal flight temperature (>18°C) and calm wind (<15 km/h).";

  if (temp < 10 || wind > 35 || condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("thunder")) {
    viability = "grounded";
    reason = `Adverse flight weather: ${condition} with ${temp}°C and ${wind} km/h wind limits bees to inside hive cluster.`;
  } else if (temp < 15 || wind > 25) {
    viability = "restricted";
    reason = `Chilly/gusty conditions (${temp}°C, ${wind} km/h wind). Foraging restricted to <400m perimeter.`;
  } else if (temp > 38 || humidity < 20 || wind > 18) {
    viability = "moderate";
    reason = `Moderate thermal stress (${temp}°C) or wind (${wind} km/h). Increased water-forager activity expected.`;
  }

  return {
    apiaryId,
    apiaryName,
    latitude: lat,
    longitude: lon,
    outsideTemp: temp,
    outsideHumidity: humidity,
    outsideWind: wind,
    conditionText: condition,
    todayMin: live.todayMin,
    todayMax: live.todayMax,
    flightViability: viability,
    flightViabilityReason: reason,
  };
}

/**
 * Builds the comprehensive prompt context string to prepend to user queries,
 * enforcing strict user data isolation and personalization.
 */
export function buildCebaContextPrompt(ctx: CebaTelemetryContext): string {
  const { user } = ctx;

  // -------------------------------------------------------------
  // PROMPT FOR NEW USER / OTHER USER: STRICT DATA ISOLATION
  // -------------------------------------------------------------
  if (!user.isGuest) {
    const userHives = ctx.hives.map((h) => {
      const apiaryName = ctx.apiaries.find((a) => a.id === h.apiary_id)?.name || h.apiary_name || "Primary Apiary";
      return `• **${h.hive_code}** (${apiaryName}): Architecture: ${h.hive_type || "Langstroth"} | Status: ${h.status || "active"} | Frames: ${h.frame_count || 10} (${h.brood_frames || 0} brood) | Sensors: ${h.has_sensors ? "Installed" : "None"} | Internal Temp: ${h.latest_temp ?? "N/A"}°C | Weight: ${h.latest_weight ?? "N/A"} kg`;
    }).join("\n");

    const userHarvests = ctx.harvests.map((hr) => {
      return `• **Batch ${hr.batch_code || hr.id}**: Date: ${hr.harvest_date} | Net Yield: ${hr.quantity_kg} kg | Moisture: ${hr.moisture_content_percent || "N/A"}% | Forage: ${hr.nectar_source || "Unspecified"} | Type: ${hr.honey_type || "Raw Honey"}`;
    }).join("\n");

    const userWeather = Object.values(ctx.weatherByApiary).map((w) => {
      return `• **${w.apiaryName}** (Lat: ${w.latitude}, Lon: ${w.longitude}): Outside Temp: ${w.outsideTemp}°C (${w.todayMin}°C–${w.todayMax}°C) | Humidity: ${w.outsideHumidity}% | Wind: ${w.outsideWind} km/h | Sky: ${w.conditionText} | Viability: ${w.flightViability.toUpperCase()}`;
    }).join("\n");

    const userSensors = ctx.syncedDevices.map((d) => {
      return `• **Device ${d.serial}** [${d.name}] -> Assigned to ${d.hiveCode || "Hive"}: Status: ${d.syncStatus} | Battery: ${nz(d.batteryPct, "%")} | Brood Temp: ${nz(d.broodTempC, "°C")} | Weight: ${nz(d.hiveWeightKg, " kg")}`;
    }).join("\n");

    return `
[CURRENT CEBA AI LIVE APICULTURAL CONTEXT]:
AUTHENTICATED USER: ${user.name} (${user.email || "Registered Beekeeper"})
USER DATA PRIVACY & ISOLATION MANDATE:
You are exclusively advising ${user.name}. You MUST strictly reference ONLY this user's personal apiaries, hives, harvests, and sensor telemetry.
${user.isTimothy ? "" : "CRITICAL: NEVER mention Timothy Nduva, Kibwezi 184 hives, or 843kg data unless the user specifically asks general historical questions about BeeYield's founding."}
PORTFOLIO SUMMARY:
- Registered Apiaries: ${ctx.apiaries.length} sites
- Total Hives: ${user.totalHives} hives (${user.activeHives} active colonies)
- Total Honey Yield: ${user.totalYieldKg} kg across ${user.totalBatches} batches
${user.totalHives === 0 ? "NOTE: This user has not registered any hives yet. Acknowledge their fresh workspace and guide them on adding their first apiary and registering hives." : ""}

### 🐝 1. ACTIVE HIVES & COLONY STATUS
${userHives || "No hives registered yet for this account."}

### 🍯 2. HARVEST RECORDS & CERTIFIED BATCHES
${userHarvests || "No harvest or batch records logged yet for this account."}

### 🌦️ 3. OUTSIDE WEATHER FOR HIVE LOCATIONS
${userWeather || (ctx.apiaries.length === 0 ? "No apiary location configured yet. Weather monitoring will activate once an apiary is added." : "Weather telemetry pending.")}

### 📡 4. IOT SENSOR DATA & SYNCED HARDWARE
${userSensors || "No IoT sensors currently paired to this account."}
`.trim();
  }

  // -------------------------------------------------------------
  // PROMPT FOR GUEST / UNAUTHENTICATED
  // -------------------------------------------------------------
  return `
[CURRENT CEBA AI LIVE APICULTURAL CONTEXT]:
SESSION STATUS: Unauthenticated / Guest Preview
NOTE: No private user data is loaded. Advise the user to sign in or register to access their personalized apiaries, hives, harvest records, and live IoT sensor telemetry.
`.trim();
}

/**
 * Classifies query intent
 */
export function matchCebaQueryDomain(
  query: string
): "overview" | "hives" | "harvests" | "weather" | "sensors" | "general" {
  const q = (query || "").toLowerCase();

  const isSensor =
    q.includes("sensor") ||
    q.includes("iot") ||
    q.includes("apisense") ||
    q.includes("telemetry") ||
    q.includes("device") ||
    q.includes("h261") ||
    q.includes("weight") ||
    (q.includes("temperature") && q.includes("inside")) ||
    q.includes("brood temp") ||
    q.includes("acoustic") ||
    q.includes("frequency") ||
    q.includes("hz") ||
    q.includes("battery") ||
    q.includes("reading") ||
    q.includes("readings") ||
    q.includes("sync");

  const isWeather =
    q.includes("weather") ||
    q.includes("outside") ||
    q.includes("forecast") ||
    q.includes("rain") ||
    q.includes("wind") ||
    q.includes("ambient") ||
    q.includes("climate") ||
    q.includes("flight viability") ||
    q.includes("can bees fly");

  const isHarvest =
    q.includes("harvest") ||
    q.includes("batch") ||
    q.includes("btch") ||
    q.includes("honey yield") ||
    q.includes("total yield") ||
    q.includes("kg") ||
    q.includes("moisture") ||
    q.includes("extraction") ||
    q.includes("traceability") ||
    q.includes("floral source") ||
    q.includes("843") ||
    q.includes("certified yield");

  const isHive =
    q.includes("hive") ||
    q.includes("colony") ||
    q.includes("colonies") ||
    q.includes("queen") ||
    q.includes("frame") ||
    q.includes("frames") ||
    q.includes("activity") ||
    q.includes("inspection") ||
    q.includes("brood") ||
    q.includes("apiary") ||
    q.includes("apiaries") ||
    q.includes("h-00") ||
    q.includes("vitality") ||
    q.includes("stands") ||
    q.includes("184");

  const matchCount = [isSensor, isWeather, isHarvest, isHive].filter(Boolean).length;

  const isOverview =
    matchCount >= 2 ||
    q.includes("condition") ||
    q.includes("conditions") ||
    q.includes("overview") ||
    q.includes("summary") ||
    q.includes("status") ||
    q.includes("dashboard") ||
    q.includes("all my") ||
    q.includes("how are my");

  if (isOverview && matchCount >= 1) return "overview";
  if (isSensor) return "sensors";
  if (isWeather) return "weather";
  if (isHarvest) return "harvests";
  if (isHive) return "hives";
  if (isOverview) return "overview";

  return "general";
}

/**
 * Generates an authoritative, factual, Markdown-formatted Ceba AI response for telemetry questions
 * tailored strictly to the authenticated user's records.
 */
export function synthesizeCebaAnswer(query: string, ctx: CebaTelemetryContext): string {
  const domain = matchCebaQueryDomain(query);
  const { user } = ctx;

  // ---------------------------------------------------------------
  // 0. COMPREHENSIVE OVERVIEW (Apiary Conditions, Hives, Batches, Weather, IoT Sensors)
  // ---------------------------------------------------------------
  if (domain === "overview") {

    if (!user.isGuest && user.totalHives === 0) {
      return `### 🐝 Ceba AI Apiary Workspace — Welcome ${user.name}

**Account**: ${user.name} (${user.email || "Registered"})  
**Apiary Portfolio**: **0 Hives Configured** | **0 Batches Logged** | **0 IoT Sensors Paired**  

Welcome to your personalized BeeYield operating system. Ceba AI is ready to monitor your colony conditions, frame inspections, certified honey extractions, and sensor telemetry as soon as you deploy your first stands.

---

#### 🚀 3 Quick Steps to Activate Your Apiary
1. **Register Your Apiary:** Open **Apiaries** in the dashboard and add your site coordinates. This enables automated local weather forecasting and flight viability calculation.
2. **Add Your Hives:** Register your hive codes (e.g. Langstroth or Top-Bar) with frame capacity and queen records.
3. **Pair Apisense Hardware:** Attach an Apisense Brood Sentinel node to stream core temperature, weight changes, and swarming acoustics directly into Ceba AI.`;
    }

    if (!user.isGuest) {
      const hiveRows = ctx.hives.slice(0, 12).map((h) => {
        const apiary = ctx.apiaries.find((a) => a.id === h.apiary_id)?.name || h.apiary_name || "Primary Apiary";
        return `| **${h.hive_code}** | ${apiary} | ${h.hive_type || "Langstroth"} | ${h.status || "Active"} | ${h.frame_count || 10} (${h.brood_frames || 0} brood) | ${h.has_sensors ? "✅ Synced" : "Manual"} | ${h.latest_temp ? `${h.latest_temp}°C` : "N/A"} | ${h.latest_weight ? `${h.latest_weight} kg` : "N/A"} |`;
      }).join("\n");

      const harvestRows = ctx.harvests.slice(0, 6).map((h) => {
        return `| **${h.batch_code || h.id}** | ${h.harvest_date} | **${h.quantity_kg} kg** | ${h.moisture_content_percent ? `${h.moisture_content_percent}%` : "N/A"} | ${h.nectar_source || "Wildflower"} | ${h.honey_type || "Raw Honey"} |`;
      }).join("\n");

      const weatherRows = Object.values(ctx.weatherByApiary).map((w) => {
        return `| **${w.apiaryName}** | **${w.outsideTemp}°C** (${w.todayMin}°C–${w.todayMax}°C) | **${w.outsideHumidity}%** | **${w.outsideWind} km/h** | ${w.conditionText} | **${w.flightViability.toUpperCase()}** |`;
      }).join("\n");

      const sensorRows = ctx.syncedDevices.map((d) => {
        return `| **${d.serial}** | ${d.hiveCode || "Assigned"} | **${d.syncStatus.toUpperCase()}** | ${nz(d.batteryPct, "%")} | **${nz(d.broodTempC, "°C")}** | ${nz(d.internalHumidityPct, "%")} | **${nz(d.hiveWeightKg, " kg")}** | ${nz(d.acousticHz, " Hz")} |`;
      }).join("\n");

      return `### 🐝 Ceba AI Apiary Conditions & Colony Intelligence — ${user.name}

**Beekeeper**: ${user.name} (${user.email || "Beekeeper"})  
**Registered Apiaries**: **${ctx.apiaries.length} Sites**  
**Managed Fleet**: **${user.totalHives} Hives** (${user.activeHives} Active Colonies)  
**Recorded Harvests**: **${user.totalYieldKg.toFixed(1)} kg** across **${user.totalBatches} Batches**  
**IoT Hardware**: **${ctx.syncedDevices.length} Synced Sensor Nodes**  

---

#### 1. Apiary & Hives Fleet Status
| Hive Code | Apiary | Architecture | Status | Frames (Brood) | Sensor Telemetry | Brood Temp | Scale Weight |
|:---|:---|:---|:---|:---|:---|:---|:---|
${hiveRows || "| — | No hives registered yet | — | — | — | — | — | — |"}

---

#### 2. Certified Batches & Harvest Extraction Logs
${harvestRows ? `| Batch Code | Harvest Date | Net Yield | Moisture Index | Floral Source | Honey Profile |\n|:---|:---|:---|:---|:---|:---|\n${harvestRows}` : "No harvest records logged yet for this account."}

---

#### 3. Outside Weather for Apiary Locations
${weatherRows ? `| Apiary Site | Ambient Temp | Relative Humidity | Wind Velocity | Sky Condition | Flight Viability |\n|:---|:---|:---|:---|:---|:---|\n${weatherRows}` : "No apiary locations configured yet. Add your apiary coordinates to view microclimate weather."}

---

#### 4. IoT Sensor Telemetry & Synced Hardware
${sensorRows ? `| Device Serial | Linked Stand | Status | Battery | Brood Temp | Core Humidity | Hive Weight | Acoustic Frequency |\n|:---|:---|:---|:---|:---|:---|:---|:---|\n${sensorRows}` : "No active Apisense hardware sensors paired. Pair devices in the Devices menu to stream real-time telemetry."}

---

#### 5. Apiary Management Directives
1. **Colony Inspections:** Maintain routine frame checks during active forage flows.
2. **Telemetry Synchronization:** Keep Apisense Sentinel nodes charged for continuous temperature and acoustic diagnostics.`;
    }

    return `### 🐝 Ceba AI Apiary Intelligence (Guest Preview)

You are currently in guest preview mode. Sign in to your BeeYield account to view your personalized apiary fleet, hive health diagnostics, harvest batches, and live IoT sensor telemetry.`;
  }

  // ---------------------------------------------------------------
  // 1. HIVES DOMAIN
  // ---------------------------------------------------------------
  if (domain === "hives") {

    if (!user.isGuest && user.totalHives === 0) {
      return `### 🐝 Ceba AI Hive Diagnostic — Welcome ${user.name}

**Account Status**: Active Beekeeper Workspace (${user.email || "Registered"})  
**Managed Stands**: **0 Hives Configured**  

You currently do not have any hives registered under your account. Ceba AI is ready to monitor your colony metrics, frame inspections, and sensor telemetry as soon as you deploy your first stands.

---

#### 🚀 3 Steps to Deploy Your Apiary in BeeYield
1. **Add Your First Apiary:** Navigate to **Apiaries** in the dashboard and register your site location to enable localized microclimate and floral bloom tracking.
2. **Register Hive Stands:** Add your hive codes (e.g. Langstroth 10-Frame or Top-Bar) and designate colony health and frame capacity.
3. **Connect IoT Hardware:** Attach Apisense Brood Sentinels to your active colonies for automated temperature, acoustic swarming alerts, and scale monitoring.`;
    }

    if (!user.isGuest && user.totalHives > 0) {
      const rows = ctx.hives.slice(0, 15).map((h) => {
        const apiary = ctx.apiaries.find((a) => a.id === h.apiary_id)?.name || h.apiary_name || "Primary Apiary";
        return `| **${h.hive_code}** | ${apiary} | ${h.hive_type || "Langstroth"} | ${h.status || "Active"} | ${h.frame_count || 10} (${h.brood_frames || 0} brood) | ${h.has_sensors ? "✅ Synced" : "Manual"} | ${h.latest_temp ? `${h.latest_temp}°C` : "N/A"} | ${h.latest_weight ? `${h.latest_weight} kg` : "N/A"} |`;
      }).join("\n");

      return `### 🐝 Ceba AI Hive Diagnostic — ${user.name}

**Account**: ${user.name} (${user.email || "Beekeeper"})  
**Managed Stands**: **${user.totalHives} Hives Configured** (${user.activeHives} Active Colonies)  
**Registered Apiaries**: ${ctx.apiaries.length} Sites  

---

#### 1. Hive Fleet Overview & Activity Matrix
| Hive Code | Apiary | Architecture | Status | Frames (Brood) | Sensor Telemetry | Brood Temp | Scale Weight |
|:---|:---|:---|:---|:---|:---|:---|:---|
${rows}

---

#### 2. Apiary Management Directives
1. **Inspection Cadence:** Maintain biweekly frame inspections during nectar flows to assess brood pattern solidity and super space.
2. **Pest Monitoring:** Inspect bottom boards for Varroa mite counts and small hive beetles.`;
    }

    return `### 🐝 Ceba AI Hive Intelligence (Guest Preview)

You are currently in guest preview mode. Sign in to your BeeYield account to view your personalized apiary fleet, hive health diagnostics, and sensor telemetry.`;
  }

  // ---------------------------------------------------------------
  // 2. HARVESTS DOMAIN
  // ---------------------------------------------------------------
  if (domain === "harvests") {

    if (!user.isGuest && user.totalYieldKg === 0) {
      return `### 🍯 Ceba AI Harvest Records — ${user.name}

**Account**: ${user.name} (${user.email || "Registered"})  
**Cumulative Output**: **0.0 kg** (No honey harvest records logged yet)  

You do not have any honey extraction or certified batch records recorded yet under this account.

---

#### 📝 How to Log Your First Extraction
1. **Harvest Ripe Comb:** Ensure frames are at least 75% capped with ripe honey before uncapping.
2. **Record Extraction:** Go to **Harvests** in the dashboard and enter batch date, net weight in kilograms, moisture content %, and floral nectar source.
3. **Issue Traceability QR:** BeeYield will issue a verified cryptographic batch code for your retail jars.`;
    }

    if (!user.isGuest && user.totalYieldKg > 0) {
      const rows = ctx.harvests.slice(0, 10).map((h) => {
        return `| **${h.batch_code || h.id}** | ${h.harvest_date} | **${h.quantity_kg} kg** | ${h.moisture_content_percent ? `${h.moisture_content_percent}%` : "N/A"} | ${h.nectar_source || "Wildflower"} | ${h.honey_type || "Raw Honey"} | ${h.is_verified ? "✅ Verified" : "Pending"} |`;
      }).join("\n");

      return `### 🍯 Ceba AI Harvest Records — ${user.name}

**Account**: ${user.name} (${user.email || "Beekeeper"})  
**Cumulative Output**: **${user.totalYieldKg.toFixed(1)} kg Certified Yield** across **${user.totalBatches} batches**  

---

#### 1. Certified Honey Batches & Extraction Log
| Batch Code | Harvest Date | Net Yield | Moisture Index | Floral Source | Honey Profile | Verification |
|:---|:---|:---|:---|:---|:---|:---|
${rows}

---

#### 2. Annual Production
${(() => {
  const byYear = new Map<string, { kg: number; batches: number }>();
  ctx.harvests.forEach((h) => {
    const y = String(h.harvest_date || "").slice(0, 4) || "Unknown";
    const cur = byYear.get(y) || { kg: 0, batches: 0 };
    cur.kg += Number(h.quantity_kg) || 0;
    cur.batches += 1;
    byYear.set(y, cur);
  });
  const lines = Array.from(byYear.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([y, v]) => `| **${y}** | ${v.kg.toFixed(1)} kg | ${v.batches} |`);
  return `| Year | Recorded Yield | Batches |\n|:---|:---|:---|\n${lines.join("\n")}`;
})()}

---

#### 3. Quality Audit
* Figures above are computed from the logged batch records; moisture shows N/A where none was recorded.`;
    }

    return `### 🍯 Ceba AI Harvest Intelligence (Guest Preview)

Sign in to your BeeYield account to view your registered honey harvests, certified batch codes, and moisture analysis.`;
  }

  // ---------------------------------------------------------------
  // 3. WEATHER DOMAIN
  // ---------------------------------------------------------------
  if (domain === "weather") {
    const weatherList = Object.values(ctx.weatherByApiary);
    if (weatherList.length > 0) {
      const rows = weatherList.map((w) => {
        return `| **${w.apiaryName}** | Lat: ${w.latitude.toFixed(2)}, Lon: ${w.longitude.toFixed(2)} | **${w.outsideTemp}°C** (${w.todayMin}°C – ${w.todayMax}°C) | **${w.outsideHumidity}%** | **${w.outsideWind} km/h** | ${w.conditionText} | **${w.flightViability.toUpperCase()}** |`;
      }).join("\n");

      const primary = weatherList[0];
      return `### 🌦️ Ceba AI Outside Weather & Foraging Viability

**Apiary Microclimate Grid**: Live Open-Meteo Telemetry  
**Primary Apiary**: **${primary.apiaryName}** (${primary.outsideTemp}°C, Wind: ${primary.outsideWind} km/h, ${primary.conditionText})  

---

#### 1. Outside Weather by Apiary Location
| Apiary Site | Coordinates | Ambient Temp | Relative Humidity | Wind Velocity | Sky Condition | Foraging Flight Viability |
|:---|:---|:---|:---|:---|:---|:---|
${rows}

---

#### 2. Foraging Flight Viability Analysis
* **Status:** **${primary.flightViability.toUpperCase()}** — ${primary.flightViabilityReason}
* **Nectar Secretion**: Temperature and solar conditions support peak worker flight trajectories without thermal exhaustion.`;
    }

    return `### 🌦️ Ceba AI Outside Weather & Foraging Viability

**Status**: No Apiary Location Configured  

To receive live microclimate telemetry, ambient temperature ranges, and foraging flight viability assessments, please configure your apiary coordinates in the **Apiaries** dashboard.`;
  }

  // ---------------------------------------------------------------
  // 4. SENSORS DOMAIN
  // ---------------------------------------------------------------
  if (domain === "sensors") {

    if (!user.isGuest && ctx.syncedDevices.length === 0) {
      return `### 📡 Ceba AI IoT Sensor Telemetry — ${user.name}

**Status**: No Synced IoT Devices Found  

Your account currently has no active Apisense Brood Sentinels or scale telemetry hardware paired.

---

#### 🔌 Pairing an Apisense Sentinel Node
1. Power on your Apisense Brood Sentinel near your hive stand.
2. In the BeeYield dashboard, navigate to **Devices** and click **Scan for Sensors**.
3. Select your device via Bluetooth LE or LoRaWAN to begin streaming core temperature, weight, and acoustic diagnostics.`;
    }

    if (!user.isGuest && ctx.syncedDevices.length > 0) {
      const rows = ctx.syncedDevices.map((d) => {
        return `| **${d.serial}** | ${d.hiveCode || "Assigned"} | **${d.syncStatus.toUpperCase()}** | ${nz(d.batteryPct, "%")} | **${nz(d.broodTempC, "°C")}** | ${nz(d.internalHumidityPct, "%")} | **${nz(d.hiveWeightKg, " kg")}** | ${nz(d.acousticHz, " Hz")} |`;
      }).join("\n");

      return `### 📡 Ceba AI IoT Sensor Telemetry — ${user.name}

**Active Synced Nodes**: **${ctx.syncedDevices.length} Hardware Devices Synchronized**  

---

#### 1. Live Synced Device Fleet Telemetry
| Device Serial | Linked Stand | Status | Battery | Brood Temp | Core Humidity | Hive Weight | Acoustic Frequency |
|:---|:---|:---|:---|:---|:---|:---|:---|
${rows}`;
    }

    return `### 📡 Ceba AI IoT Sensor Telemetry (Guest Preview)

Sign in to your account to view live telemetry from your paired Apisense hardware nodes.`;
  }

  // ---------------------------------------------------------------
  // 5. GENERAL DOMAIN
  // ---------------------------------------------------------------

  if (!user.isGuest) {
    return `### 🐝 Ceba AI Apicultural Intelligence — ${user.name}

Welcome, ${user.name}. Ceba AI is personalized to your apiary workspace:
* **Hives Registered:** ${user.totalHives} Managed Hives (${user.activeHives} active colonies) across ${ctx.apiaries.length} apiaries.
* **Harvest Output:** ${user.totalYieldKg} kg recorded across ${user.totalBatches} batches.
* **IoT Hardware:** ${ctx.syncedDevices.length} synced sensor nodes.

${user.totalHives === 0 ? "You can register your first apiary and hives in the dashboard to start automated monitoring." : "Ask me for colony health diagnostics, harvest records, local foraging weather, or sensor telemetry!"}`;
  }

  return `### 🐝 Ceba AI Apicultural Intelligence

Welcome to Ceba AI. Sign in to your BeeYield account to access personalized colony diagnostics, harvest records, and live sensor telemetry for your apiaries.`;
}

/**
 * PRD v2.4 JSON Context Schema
 */
export interface CebaScopedContextPayload {
  account_context: {
    user_id: string;
    tenant_id: string;
    user_name: string;
    role: string;
  };
  active_apiaries: Array<{
    apiary_id: string;
    apiary_name: string;
    hive_count: number;
    /** null when no live weather node/reading exists for this apiary. */
    inland_weather_node: {
      node_id: string;
      temp_c: number;
      humidity_pct: number;
      barometric_press_hpa: number | null;
      bloom_status: string | null;
    } | null;
  }>;
  queried_hives_telemetry: Array<{
    hive_id: string;
    hive_name: string;
    colony_vigour_score: number | null;
    /** Values are null when no sensor reading exists — never placeholder numbers. */
    in_hive_metrics: {
      brood_temp_c: number | null;
      humidity_pct: number | null;
      weight_kg: number | null;
      daily_weight_delta_kg: number | null;
      acoustic_frequency_hz: number | null;
      pest_flag: string;
    };
  }>;
  active_harvest_batches: Array<{
    batch_id: string;
    crop_type: string;
    target_harvest_date: string;
    compliance_passport_status: string;
  }>;
}

/**
 * Builds the structured JSON payload strictly matching PRD Section 5 schema.
 * Every value is derived from the user's own records; unknowns are null.
 */
export function buildCebaScopedContextPayload(ctx: CebaTelemetryContext): CebaScopedContextPayload {
  const isTimothy = ctx.user.isTimothy;
  const tenantId = isTimothy ? "tnt_kibwezi_farm" : (ctx.user.id ? `tnt_${ctx.user.id}` : "tnt_guest");

  const activeApiaries = ctx.apiaries.map((ap) => {
    const weather = ctx.weatherByApiary[ap.id];
    return {
      apiary_id: ap.id,
      apiary_name: ap.name,
      hive_count: ap.hive_count ?? ctx.hives.filter((h) => h.apiary_id === ap.id).length,
      inland_weather_node: weather
        ? {
            node_id: `node_w_${ap.id.slice(0, 4)}`,
            temp_c: weather.outsideTemp,
            humidity_pct: weather.outsideHumidity,
            barometric_press_hpa: null,
            bloom_status: null,
          }
        : null,
    };
  });

  const queriedHivesTelemetry = ctx.hives.map((h, idx) => {
    const matchedDev = ctx.syncedDevices.find((d) => d.hiveId === h.id || d.hiveCode === h.hive_code);
    return {
      hive_id: h.id || `hv_${idx + 1}`,
      hive_name: (h as any).hive_name || (h as any).nickname || (h as any).name || h.hive_code || `Hive #${idx + 1}`,
      colony_vigour_score: null,
      in_hive_metrics: {
        brood_temp_c: matchedDev?.broodTempC ?? h.latest_temp ?? null,
        humidity_pct: matchedDev?.internalHumidityPct ?? h.latest_humidity ?? null,
        weight_kg: matchedDev?.hiveWeightKg ?? h.latest_weight ?? null,
        daily_weight_delta_kg: null,
        acoustic_frequency_hz: matchedDev?.acousticHz ?? null,
        pest_flag: "No pest data recorded",
      },
    };
  });

  const activeHarvestBatches = ctx.batches.slice(0, 3).map((b: any) => ({
    batch_id: b.batch_code || b.id || "",
    crop_type: b.honey_type || "Honey",
    target_harvest_date: b.harvest_date || "",
    compliance_passport_status: (b.verified ?? b.is_verified ?? b.blockchain_verified) ? "Verified" : "Pending",
  }));

  return {
    account_context: {
      user_id: ctx.user.id || "usr_anon",
      tenant_id: tenantId,
      user_name: ctx.user.name,
      role: isTimothy ? "Owner" : "Commercial Farmer",
    },
    active_apiaries: activeApiaries,
    queried_hives_telemetry: queriedHivesTelemetry,
    active_harvest_batches: activeHarvestBatches,
  };
}

export interface StandardizedDiagnosticResponse {
  alert_level: "INFO" | "WARNING" | "CRITICAL";
  primary_issue: string;
  formatted_rationale: string;
  action_plan: string[];
  telemetry_snapshot: Record<string, string | number>;
}

export interface CebaChatResponse {
  response: string;
  context_payload: CebaScopedContextPayload;
  latency_ms: number;
  model: string;
  audit_logged?: boolean;
  target_decision?: "STUDENT" | "TEACHER";
  routing_reason?: string;
  standardized_response?: StandardizedDiagnosticResponse;
}

/**
 * Executes a scoped CEBA AI query against the backend /api/v1/ceba/chat endpoint
 */
export async function executeCebaScopedChat(
  query: string,
  token?: string
): Promise<CebaChatResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch("/api/v1/ceba/chat", {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`CEBA AI Chat failed with status ${res.status}`);
  }

  return await res.json();
}


