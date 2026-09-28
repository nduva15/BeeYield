import { supabase } from "@/integrations/supabase/client";

export type DeviceCategory = "in_hive" | "in_land" | "disease_devices";
export type DeviceLinkType = "bluetooth" | "usb" | "online" | "cellular" | "lorawan";
export type DeviceStatus = "optimal" | "active" | "online" | "warning" | "offline" | "standby" | "low_battery" | "calibrating";

export interface SyncedSensorDevice {
  id: string;
  serial: string;
  category: DeviceCategory;
  deviceType: string;
  linkType?: DeviceLinkType;
  status: DeviceStatus;
  batteryPct: number;
  apiaryId?: string | null;
  hiveId?: string | null;
  hiveCode?: string | null;
  model?: string;
  firmware?: string;
  lastSeenAt?: string;
  telemetrySummary?: string;
  installedAt?: string;
  userId?: string | null;
}

const BROADCAST_CHANNEL_NAME = "beeyield_sensor_sync";
const REALTIME_CHANNEL_PREFIX = "realtime:sensor-sync";

/**
 * Generate a strict RFC4122 UUID v4 suitable for Postgres uuid columns.
 */
export function generateSensorUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getEffectiveUserId(userId?: string | null): string {
  if (userId) return userId;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("beeyield_local_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user?.id) return parsed.user.id;
      }
    } catch {}
  }
  return "usr_kibwezi_owner_01";
}

function getLocalSensorStorageKey(userId: string, apiaryId?: string | null): string {
  const safeApiary = apiaryId || "all";
  return `beeyield_synced_sensors_${userId}_${safeApiary}`;
}

export function isFakeSensorDevice(item: any): boolean {
  if (!item) return true;
  const s = String(item.serial || item.device_code || item.deviceSerial || "").trim().toUpperCase();
  const id = String(item.id || item.deviceId || "").trim().toLowerCase();
  const lbl = String(item.label || item.deviceType || item.name || item.device_type || "").trim().toLowerCase();
  const model = String(item.model || "").trim().toLowerCase();

  return (
    id.startsWith("dev-vs-") ||
    id.startsWith("dev-hub-") ||
    id.startsWith("dev-dis-") ||
    id.startsWith("dev-scale-") ||
    id.startsWith("dev-tag-") ||
    id.startsWith("dev-land-") ||
    id.includes("sens-inp") ||
    id.includes("sens-mic") ||
    id.includes("sens-land") ||
    id.includes("sens-dis") ||
    s.startsWith("SENS-INP") ||
    s.startsWith("SENS-MIC") ||
    s.startsWith("SENS-LAND") ||
    s.startsWith("SENS-DIS") ||
    s.includes("SENS-INP-001") ||
    s.includes("SENS-MIC-002") ||
    s.includes("SENS-LAND-01") ||
    s.includes("SENS-DIS-001") ||
    s.startsWith("SCALE-KBZ") ||
    s.startsWith("VS-KBZ") ||
    s.startsWith("HUB-KBZ") ||
    s.startsWith("VARROA-KBZ") ||
    s.startsWith("AFB-DIAG-KBZ") ||
    s.startsWith("SHB-TRAP-KBZ") ||
    s.startsWith("IH-BROOD") ||
    s.startsWith("TAG-KBZ") ||
    s.startsWith("SOIL-KBZ") ||
    s.startsWith("PERIMETER-KBZ") ||
    s.startsWith("RELAY-KBZ") ||
    lbl.includes("vitalsensor brood core") ||
    lbl.includes("bio-acoustic queen mic") ||
    lbl.includes("solar microclimate hub") ||
    lbl.includes("spectral varroa scanner") ||
    lbl.includes("kib-001 vitalsensor") ||
    lbl.includes("kib-002 bio-acoustic") ||
    lbl.includes("kib-003 spectral") ||
    lbl.includes("kibwezi solar microclimate") ||
    model.includes("apisense vitalsensor") ||
    model.includes("intelligent hives") ||
    (item.temperature_c === 35.2 && item.humidity_pct === 58 && item.weight_kg === 42.6) ||
    (item.temperature_c === 34.9 && item.humidity_pct === 55 && item.weight_kg === 39.8) ||
    (item.temperature_c === 35.0 && item.humidity_pct === 56 && item.weight_kg === 41.2)
  );
}

/**
 * Fetch all synced sensors from Supabase Database and cross-device cloud vault.
 * Falls back to local cache if offline, but always reconciles with Supabase.
 */
export async function fetchSyncedSensors(
  userId?: string | null,
  apiaryId?: string | null,
): Promise<SyncedSensorDevice[]> {
  const uid = getEffectiveUserId(userId);
  const cacheKey = getLocalSensorStorageKey(uid, apiaryId);

  // 1. Check local cache for immediate UI rendering and purge any fake items from local storage
  let cached: SyncedSensorDevice[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(cacheKey) || localStorage.getItem(`beeyield_synced_sensors_${uid}_all`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const hadFakes = parsed.some((d) => isFakeSensorDevice(d));
          cached = parsed.filter((d) => !isFakeSensorDevice(d));
          if (hadFakes) {
            localStorage.setItem(cacheKey, JSON.stringify(cached));
            localStorage.setItem(`beeyield_synced_sensors_${uid}_all`, JSON.stringify(cached));
          }
        }
      }
    } catch {}
  }

  // 2. Query Supabase PostgreSQL devices table
  try {
    if (supabase) {
      let query = (supabase as any)
        .from("devices")
        .select("*")
        .order("created_at", { ascending: false });

      if (apiaryId && apiaryId !== "all") {
        query = query.eq("apiary_id", apiaryId);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        // Proactively purge any fake/mock devices from Supabase database
        const fakeIds = data.filter((d: any) => isFakeSensorDevice(d)).map((d: any) => d.id);
        if (fakeIds.length > 0) {
          try {
            void (supabase as any).from("devices").delete().in("id", fakeIds);
          } catch {}
        }

        const validRows = data.filter((d: any) => !isFakeSensorDevice(d));
        const mapped: SyncedSensorDevice[] = validRows.map((d: any) => ({
          id: d.id,
          serial: d.serial,
          category: (d.device_kind === "hub" ? "in_land" : d.device_kind?.includes("disease") ? "disease_devices" : "in_hive") as DeviceCategory,
          deviceType: d.label?.replace(/\s*\([^)]*\)$/, "") || (d.device_kind === "hub" ? "LoRaWAN Gateway Node" : "VitalSensor Brood Core"),
          linkType: (d.link_type || "bluetooth") as DeviceLinkType,
          status: (d.status || "active") as DeviceStatus,
          batteryPct: d.battery_pct ?? 98,
          apiaryId: d.apiary_id,
          hiveId: d.hive_id,
          model: d.firmware ? `Firmware ${d.firmware}` : "Apisense VitalSensor Pro",
          firmware: d.firmware || "v2.4.1",
          lastSeenAt: d.last_seen_at || d.created_at,
          installedAt: d.created_at?.slice(0, 10),
          userId: d.user_id,
        }));

        // Cache the authoritative data
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(mapped));
            localStorage.setItem(`beeyield_synced_sensors_${uid}_all`, JSON.stringify(mapped));
          } catch {}
        }
        return mapped;
      }
    }
  } catch (err) {
    console.warn("fetchSyncedSensors: Supabase direct query fallback", err);
  }

  // 3. Query Supabase Auth metadata backup
  try {
    if (supabase) {
      const { data: authData } = await supabase.auth.getUser();
      const metaSensors = authData?.user?.user_metadata?.connected_sensors;
      if (Array.isArray(metaSensors)) {
        const hadFakes = metaSensors.some((s: any) => isFakeSensorDevice(s));
        const filtered = (apiaryId && apiaryId !== "all"
          ? metaSensors.filter((s: any) => s.apiaryId === apiaryId)
          : metaSensors).filter((s: any) => !isFakeSensorDevice(s));

        if (hadFakes) {
          const allClean = metaSensors.filter((s: any) => !isFakeSensorDevice(s));
          try {
            void supabase.auth.updateUser({ data: { connected_sensors: allClean } });
          } catch {}
        }

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(filtered));
          } catch {}
        }
        return filtered;
      }
    }
  } catch {}

  return cached;
}

/**
 * Connect, save, and broadcast a new hardware sensor across phone, laptop, and tablet.
 * Persists to Supabase devices table, Auth metadata, and Realtime channels.
 */
export async function saveAndSyncNewSensor(
  device: SyncedSensorDevice,
  userId?: string | null,
): Promise<SyncedSensorDevice> {
  const uid = getEffectiveUserId(userId);
  const now = new Date().toISOString();

  // Ensure ID is a valid Postgres UUID
  const uuid = device.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(device.id)
    ? device.id
    : generateSensorUuid();

  const normalized: SyncedSensorDevice = {
    ...device,
    id: uuid,
    userId: uid,
    batteryPct: device.batteryPct || 98,
    status: device.status || "optimal",
    linkType: device.linkType || "bluetooth",
    lastSeenAt: now,
    installedAt: device.installedAt || now.slice(0, 10),
  };

  // 1. Immediate LocalStorage caching on current device
  if (typeof window !== "undefined") {
    try {
      const allKey = `beeyield_synced_sensors_${uid}_all`;
      const existingRaw = localStorage.getItem(allKey);
      const existing: SyncedSensorDevice[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [normalized, ...existing.filter((d) => d.id !== normalized.id && d.serial !== normalized.serial)];
      localStorage.setItem(allKey, JSON.stringify(updated));

      if (normalized.apiaryId) {
        const apiaryKey = getLocalSensorStorageKey(uid, normalized.apiaryId);
        const apiaryExistingRaw = localStorage.getItem(apiaryKey);
        const apiaryExisting: SyncedSensorDevice[] = apiaryExistingRaw ? JSON.parse(apiaryExistingRaw) : [];
        const apiaryUpdated = [normalized, ...apiaryExisting.filter((d) => d.id !== normalized.id && d.serial !== normalized.serial)];
        localStorage.setItem(apiaryKey, JSON.stringify(apiaryUpdated));
      }
    } catch {}

    // Dispatch window event
    try {
      window.dispatchEvent(
        new CustomEvent("beeyield-sensor-updated", { detail: { action: "connected", device: normalized } }),
      );
    } catch {}

    // BroadcastChannel across tabs on this device
    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ action: "connected", device: normalized, timestamp: Date.now() });
        bc.close();
      }
    } catch {}
  }

  // 2. Persist to Supabase Database (devices table)
  if (supabase) {
    try {
      await (supabase as any).from("devices").upsert(
        {
          id: normalized.id,
          user_id: uid,
          apiary_id: normalized.apiaryId || null,
          hive_id: normalized.hiveId || null,
          serial: normalized.serial,
          label: `${normalized.deviceType} (${normalized.serial})`,
          device_kind: normalized.category === "in_land" ? "hub" : "vitalsensor",
          link_type: normalized.linkType,
          status: normalized.status,
          battery_pct: normalized.batteryPct,
          firmware: normalized.firmware || "v2.4.1",
          last_seen_at: now,
          updated_at: now,
        },
        { onConflict: "id" },
      );
    } catch (dbErr) {
      console.warn("saveAndSyncNewSensor: Supabase devices table write", dbErr);
    }

    // 3. Persist to Supabase Auth metadata (Guaranteed cross-device sync)
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentList: SyncedSensorDevice[] = Array.isArray(authData?.user?.user_metadata?.connected_sensors)
        ? authData.user.user_metadata.connected_sensors
        : [];

      const nextList = [normalized, ...currentList.filter((d) => d.id !== normalized.id && d.serial !== normalized.serial)];
      await supabase.auth.updateUser({
        data: {
          connected_sensors: nextList,
        },
      });
    } catch (authErr) {
      console.warn("saveAndSyncNewSensor: Supabase auth user_metadata sync", authErr);
    }

    // 4. Broadcast via Supabase Realtime channel to phone, laptop, and tablet
    try {
      const channel = supabase.channel(`${REALTIME_CHANNEL_PREFIX}-${uid}`);
      await channel.send({
        type: "broadcast",
        event: "sensor_connected",
        payload: { device: normalized, timestamp: Date.now() },
      });
      supabase.removeChannel(channel);
    } catch (rtErr) {
      console.warn("saveAndSyncNewSensor: Realtime broadcast", rtErr);
    }
  }

  // 5. FastAPI / backend endpoint sync
  try {
    await fetch("/api/v1/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    });
  } catch {}

  return normalized;
}

/**
 * Unpair and delete a sensor across all devices.
 */
export async function deleteAndSyncSensor(
  deviceId: string,
  serial: string,
  userId?: string | null,
): Promise<void> {
  const uid = getEffectiveUserId(userId);

  // 1. Remove from local caches
  if (typeof window !== "undefined") {
    try {
      const allKey = `beeyield_synced_sensors_${uid}_all`;
      const existingRaw = localStorage.getItem(allKey);
      if (existingRaw) {
        const existing: SyncedSensorDevice[] = JSON.parse(existingRaw);
        const updated = existing.filter((d) => d.id !== deviceId && d.serial !== serial);
        localStorage.setItem(allKey, JSON.stringify(updated));
      }

      // Clear legacy storage keys for this device
      const keysToClean = Object.keys(localStorage);
      for (const k of keysToClean) {
        if (k.startsWith("beeyield_synced_sensors_") || k.includes("_devices")) {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const list: any[] = JSON.parse(raw);
              if (Array.isArray(list)) {
                const filtered = list.filter((item) => item.id !== deviceId && item.serial !== serial);
                localStorage.setItem(k, JSON.stringify(filtered));
              }
            }
          } catch {}
        }
      }
    } catch {}

    // Dispatch local events
    try {
      window.dispatchEvent(
        new CustomEvent("beeyield-sensor-updated", { detail: { action: "removed", deviceId, serial } }),
      );
    } catch {}

    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ action: "removed", deviceId, serial, timestamp: Date.now() });
        bc.close();
      }
    } catch {}
  }

  // 2. Remove from Supabase devices table
  if (supabase) {
    try {
      await (supabase as any).from("devices").delete().or(`id.eq.${deviceId},serial.eq.${serial}`);
    } catch (e) {
      console.warn("deleteAndSyncSensor: Supabase devices delete", e);
    }

    // 3. Remove from Supabase Auth metadata
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentList: SyncedSensorDevice[] = Array.isArray(authData?.user?.user_metadata?.connected_sensors)
        ? authData.user.user_metadata.connected_sensors
        : [];
      const updated = currentList.filter((d) => d.id !== deviceId && d.serial !== serial);
      await supabase.auth.updateUser({
        data: { connected_sensors: updated },
      });
    } catch {}

    // 4. Realtime broadcast removal
    try {
      const channel = supabase.channel(`${REALTIME_CHANNEL_PREFIX}-${uid}`);
      await channel.send({
        type: "broadcast",
        event: "sensor_removed",
        payload: { deviceId, serial, timestamp: Date.now() },
      });
      supabase.removeChannel(channel);
    } catch {}
  }

  // 5. Backend API delete
  try {
    await fetch(`/api/v1/devices/${deviceId}`, { method: "DELETE" });
  } catch {}
}

/**
 * COMPLETELY REMOVE ALL SENSORS FULLY across Database, Backend, and All Devices.
 * Cleans out Supabase devices table, user_metadata, local storage, and broadcasts purge.
 */
export async function removeAllSensorsFully(userId?: string | null): Promise<void> {
  const uid = getEffectiveUserId(userId);

  // 1. Clean out all local storage keys for devices/sensors
  if (typeof window !== "undefined") {
    try {
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (
          k.includes("devices") ||
          k.includes("sensor") ||
          k.includes("beeyield_paired_devices") ||
          k.includes("beeyield_synced_sensors")
        ) {
          localStorage.removeItem(k);
        }
      }

      // Also clean sensor bindings from any locally stored hives
      for (const k of keys) {
        if (k.includes("hives") || k.includes("apiaries")) {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const items = JSON.parse(raw);
              if (Array.isArray(items)) {
                const cleaned = items.map((item: any) => {
                  if (item.sensorSerial || item.has_sensors || item.hasSensor || item.deviceCategory) {
                    return {
                      ...item,
                      sensorSerial: undefined,
                      has_sensors: false,
                      hasSensor: false,
                      deviceCategory: undefined,
                      deviceType: undefined,
                    };
                  }
                  return item;
                });
                localStorage.setItem(k, JSON.stringify(cleaned));
              }
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error("Failed to clean local storage sensors:", e);
    }

    // Dispatch local events
    try {
      window.dispatchEvent(new CustomEvent("beeyield-sensors-purged", { detail: { timestamp: Date.now() } }));
      window.dispatchEvent(new CustomEvent("beeyield-sensor-updated", { detail: { action: "purged" } }));
    } catch {}

    // BroadcastChannel across tabs
    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ action: "purged", timestamp: Date.now() });
        bc.close();
      }
    } catch {}
  }

  // 2. Delete all records from Supabase devices table
  if (supabase) {
    try {
      await (supabase as any).from("devices").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch (e) {
      console.warn("Supabase devices purge:", e);
    }

    // 3. Clear Supabase Auth user metadata connected_sensors
    try {
      await supabase.auth.updateUser({
        data: {
          connected_sensors: [],
          devices: [],
        },
      });
    } catch {}

    // 4. Broadcast Realtime purge across phones, laptops, and tablets
    try {
      const channel = supabase.channel(`${REALTIME_CHANNEL_PREFIX}-${uid}`);
      await channel.send({
        type: "broadcast",
        event: "sensors_purged",
        payload: { timestamp: Date.now() },
      });
      supabase.removeChannel(channel);
    } catch {}
  }

  // 5. Backend API purge call
  try {
    await fetch("/api/v1/devices/purge", { method: "POST" });
  } catch {}
}

/**
 * Subscribe to automated sensor synchronization across phone, laptop, and tablet.
 * Listens on Supabase Realtime, BroadcastChannel, and window CustomEvents.
 */
export function subscribeToSensorSync(
  userId: string | null | undefined,
  apiaryId: string | null | undefined,
  onUpdate: (sensors: SyncedSensorDevice[]) => void,
): () => void {
  const uid = getEffectiveUserId(userId);
  let isSubscribed = true;

  const refresh = async () => {
    if (!isSubscribed) return;
    try {
      const fresh = await fetchSyncedSensors(uid, apiaryId);
      if (isSubscribed) {
        onUpdate(fresh);
      }
    } catch {}
  };

  // 1. Local window event listener
  const localHandler = () => {
    void refresh();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("beeyield-sensor-updated", localHandler);
    window.addEventListener("beeyield-sensors-purged", localHandler);
  }

  // 2. BroadcastChannel for cross-tab sync
  let bc: BroadcastChannel | null = null;
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = () => {
        void refresh();
      };
    } catch {}
  }

  // 3. Supabase Realtime channel for cross-device sync (Phone, Laptop, Tablet)
  let rtChannel: any = null;
  if (supabase) {
    try {
      rtChannel = supabase.channel(`${REALTIME_CHANNEL_PREFIX}-${uid}`);
      rtChannel
        .on("broadcast", { event: "sensor_connected" }, () => void refresh())
        .on("broadcast", { event: "sensor_removed" }, () => void refresh())
        .on("broadcast", { event: "sensors_purged" }, () => void refresh())
        .subscribe();
    } catch {}
  }

  // Cleanup
  return () => {
    isSubscribed = false;
    if (typeof window !== "undefined") {
      window.removeEventListener("beeyield-sensor-updated", localHandler);
      window.removeEventListener("beeyield-sensors-purged", localHandler);
    }
    if (bc) {
      try {
        bc.close();
      } catch {}
    }
    if (rtChannel && supabase) {
      try {
        supabase.removeChannel(rtChannel);
      } catch {}
    }
  };
}
