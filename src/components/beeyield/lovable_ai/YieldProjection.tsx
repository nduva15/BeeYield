import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  X,
  TrendingUp,
  Save,
  Trash2,
  Calendar,
  Cpu,
  Thermometer,
  Droplets,
  Gauge,
  Scale,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Clock,
  Info,
  AlertCircle,
  MapPin,
  Boxes,
  Wifi,
  WifiOff,
  BatteryCharging,
  Battery,
  Search,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Package,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { useAuth } from "@/hooks/use-auth";
import { normalizeApiaryName, CANONICAL_APIARY_NAME } from "@/lib/apiary-normalization";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

type Run = {
  id: string;
  label: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  created_at: string;
};

interface HiveOption {
  id: string;
  name?: string;
  hive_code?: string;
  max_brood_frames?: number;
  apiary_name?: string;
}

interface DeviceOption {
  id: string;
  label?: string | null;
  serial?: string;
  hive_id?: string | null;
  status?: string;
}

interface MeasurementItem {
  id: string;
  temperature_c?: number | null;
  humidity_pct?: number | null;
  pressure_hpa?: number | null;
  weight_kg?: number | null;
  battery_pct?: number | null;
  recorded_at: string;
  source?: string;
}

interface HarvestSummaryItem {
  totalKg: number;
  harvestCount: number;
  lastHarvestedOn?: string;
  lastBatch?: string;
  avgMoisture?: number;
}

interface HiveHistoryItem {
  id: string;
  apiary_id: string;
  apiary_name: string;
  name: string;
  hive_code?: string;
  max_brood_frames: number;
  notes?: string | null;
  queen_breeding_year?: number | null;
  queen_origin?: string | null;
  device?:
    | (DeviceOption & {
        device_kind?: string;
        link_type?: string;
        battery_pct?: number | null;
        last_seen_at?: string | null;
      })
    | null;
  latestMeasurement?: MeasurementItem | null;
  measurementsHistory: MeasurementItem[];
  harvestSummary?: HarvestSummaryItem | null;
}

interface ApiaryHistoryItem {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  hives: HiveHistoryItem[];
}

interface YieldProjectionProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

// User-Logged Data Cache Accessors
function getCachedUserApiaries(): any[] {
  const keys = [
    "beeyield_apiaries_cache_v1",
    "beeyield_local_apiaries_v1",
    "beeyield_cached_apiaries",
    "beeyield_apiaries",
  ];
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return [];
}

function getCachedUserHives(): any[] {
  const keys = [
    "beeyield_hives_cache_v1",
    "beeyield_local_hives_v1",
    "beeyield_cached_hives",
    "beeyield_sensor_health_hives",
  ];
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return [];
}

function getCachedUserHarvests(): any[] {
  const keys = [
    "beeyield_user_custom_harvests_v1",
    "beeyield_local_harvests_v1",
    "beeyield_harvests",
  ];
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return [];
}

function formatTimestamp(isoStr?: string | null): string {
  if (!isoStr) return "Never";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const now = Date.now();
    const diffMin = Math.round((now - d.getTime()) / (1000 * 60));
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

export default function YieldProjection({
  isOpen,
  onClose,
  embedded = false,
}: YieldProjectionProps) {
  const { user } = useAuth();
  const deviceId = useDeviceId();
  const calculatorRef = useRef<HTMLDivElement>(null);

  // --- Real Hives & Hardware Sync State ---
  const [hivesList, setHivesList] = useState<HiveOption[]>([]);
  const [devicesList, setDevicesList] = useState<DeviceOption[]>([]);
  const [selectedHiveId, setSelectedHiveId] = useState<string>("all");
  const [linkedDevice, setLinkedDevice] = useState<DeviceOption | null>(null);
  const [isDeviceSynced, setIsDeviceSynced] = useState<boolean>(false);
  const [isLoadingHives, setIsLoadingHives] = useState<boolean>(false);

  // --- Apiary & Device-Linked Hives History State ---
  const [apiaryHistoryList, setApiaryHistoryList] = useState<ApiaryHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [historyTab, setHistoryTab] = useState<"apiaries" | "projections">("apiaries");
  const [historyApiaryFilter, setHistoryApiaryFilter] = useState<string>("all");
  const [historyDeviceFilter, setHistoryDeviceFilter] = useState<"all" | "linked" | "unsynced">(
    "all",
  );
  const [historySearchQuery, setHistorySearchQuery] = useState<string>("");
  const [expandedHiveHistoryId, setExpandedHiveHistoryId] = useState<string | null>(null);

  // --- Core Parameters ---
  const [hivesCount, setHivesCount] = useState<number>(15);

  // --- Colony Availability Dates ---
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const defaultHarvestStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  }, []);

  const [colonyAvailableDate, setColonyAvailableDate] = useState<string>(todayStr);
  const [targetHarvestDate, setTargetHarvestDate] = useState<string>(defaultHarvestStr);
  const [bloomDays, setBloomDays] = useState<number>(30);

  // --- Colony Strength ---
  // Strength index (0-100%), driven by brood frames and worker population
  const [colonyStrength, setColonyStrength] = useState<number>(85);
  const [broodFrames, setBroodFrames] = useState<number>(8); // 0-12 frames
  const [nectarScore, setNectarScore] = useState<number>(7.5); // 0-10 florage score

  // --- Environmental & Device Vitals ---
  const [tempC, setTempC] = useState<number>(24.5);
  const [humidityPct, setHumidityPct] = useState<number>(58);
  const [pressureHpa, setPressureHpa] = useState<number>(1013); // Atmospheric / barometric pressure
  const [scaleWeightKg, setScaleWeightKg] = useState<number>(44.0); // Baseline colony scale mass
  const [windKmh, setWindKmh] = useState<number>(12);
  const [precipMm, setPrecipMm] = useState<number>(1.5);
  const [pricePerKg, setPricePerKg] = useState<number>(1200); // KES per kg of premium honey

  const [runs, setRuns] = useState<Run[]>([]);

  // 1. Load Real Apiaries, Hives, Devices, Measurements & Harvests from User Data
  const loadApiaryDeviceHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setIsLoadingHives(true);
    try {
      // 1. Query Supabase for User's actual records
      let apiariesRes: any = { data: [] };
      let hivesRes: any = { data: [] };
      let devicesRes: any = { data: [] };
      let measurementsRes: any = { data: [] };
      let harvestsRes: any = { data: [] };

      if (user?.id) {
        [apiariesRes, hivesRes, devicesRes, measurementsRes, harvestsRes] = await Promise.all([
          (supabase as any)
            .from("apiaries")
            .select(
              "id, name, location_name, county, region, latitude, longitude, notes, created_at",
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          (supabase as any)
            .from("hives")
            .select(
              "id, name, hive_code, nickname, apiary_id, max_brood_frames, notes, queen_origin, queen_breeding_year, created_at, apiaries(id, name, latitude, longitude, notes)",
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          (supabase as any)
            .from("devices")
            .select(
              "id, label, serial, device_kind, link_type, hive_id, apiary_id, status, battery_pct, last_seen_at, created_at",
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          (supabase as any)
            .from("device_measurements")
            .select(
              "id, device_id, hive_id, temperature_c, humidity_pct, weight_kg, battery_pct, raw, source, recorded_at",
            )
            .order("recorded_at", { ascending: false })
            .limit(200),
          (supabase as any)
            .from("harvests")
            .select(
              "id, hive_id, hive_label, batch, quantity_kg, harvested_on, moisture_pct, quality_grade",
            )
            .eq("user_id", user.id)
            .order("harvested_on", { ascending: false })
            .limit(200),
        ]);
      }

      // If user query returned nothing or user is not logged in, attempt general read
      if (
        (!hivesRes.data || hivesRes.data.length === 0) &&
        (!apiariesRes.data || apiariesRes.data.length === 0)
      ) {
        const [genApiaries, genHives, genDevices, genMeasurements, genHarvests] = await Promise.all(
          [
            (supabase as any)
              .from("apiaries")
              .select(
                "id, name, location_name, county, region, latitude, longitude, notes, created_at",
              )
              .order("created_at", { ascending: false }),
            (supabase as any)
              .from("hives")
              .select(
                "id, name, hive_code, nickname, apiary_id, max_brood_frames, notes, queen_origin, queen_breeding_year, created_at, apiaries(id, name, latitude, longitude, notes)",
              )
              .order("created_at", { ascending: false }),
            (supabase as any)
              .from("devices")
              .select(
                "id, label, serial, device_kind, link_type, hive_id, apiary_id, status, battery_pct, last_seen_at, created_at",
              )
              .order("created_at", { ascending: false }),
            (supabase as any)
              .from("device_measurements")
              .select(
                "id, device_id, hive_id, temperature_c, humidity_pct, weight_kg, battery_pct, raw, source, recorded_at",
              )
              .order("recorded_at", { ascending: false })
              .limit(200),
            (supabase as any)
              .from("harvests")
              .select(
                "id, hive_id, hive_label, batch, quantity_kg, harvested_on, moisture_pct, quality_grade",
              )
              .order("harvested_on", { ascending: false })
              .limit(200),
          ],
        );
        if (genApiaries.data && genApiaries.data.length > 0) apiariesRes = genApiaries;
        if (genHives.data && genHives.data.length > 0) hivesRes = genHives;
        if (genDevices.data && genDevices.data.length > 0) devicesRes = genDevices;
        if (genMeasurements.data && genMeasurements.data.length > 0)
          measurementsRes = genMeasurements;
        if (genHarvests.data && genHarvests.data.length > 0) harvestsRes = genHarvests;
      }

      // 2. Merge with locally cached user data from browser storage
      const cachedApiaries = getCachedUserApiaries();
      const cachedHives = getCachedUserHives();
      const cachedHarvests = getCachedUserHarvests();

      const rawApiaries: any[] = [...(apiariesRes.data || [])];
      cachedApiaries.forEach((ca: any) => {
        if (
          ca &&
          ca.id &&
          !rawApiaries.some(
            (a) =>
              a.id === ca.id ||
              (a.name && ca.name && a.name.toLowerCase() === ca.name.toLowerCase()),
          )
        ) {
          rawApiaries.push(ca);
        }
      });

      const rawHives: any[] = [...(hivesRes.data || [])];
      cachedHives.forEach((ch: any) => {
        if (
          ch &&
          ch.id &&
          !rawHives.some(
            (h) => h.id === ch.id || (h.hive_code && ch.hive_code && h.hive_code === ch.hive_code),
          )
        ) {
          rawHives.push(ch);
        }
      });

      const rawDevices: any[] = devicesRes.data || [];
      const rawMeasurements: any[] = measurementsRes.data || [];
      const rawHarvests: any[] = [...(harvestsRes.data || []), ...cachedHarvests];

      // 3. If user has real logged records, compile their actual data
      if (rawHives.length > 0 || rawApiaries.length > 0) {
        const apiaryMap = new Map<string, ApiaryHistoryItem>();

        // Seed with registered apiaries
        rawApiaries.forEach((a: any) => {
          apiaryMap.set(a.id, {
            id: a.id,
            name: a.name || a.location_name || "User Apiary",
            latitude: a.latitude ?? null,
            longitude: a.longitude ?? null,
            notes: a.notes ?? null,
            hives: [],
          });
        });

        // Map devices by hive_id
        const deviceByHive = new Map<string, any>();
        rawDevices.forEach((d: any) => {
          if (d.hive_id) {
            deviceByHive.set(d.hive_id, d);
          }
        });

        // Group measurements by hive_id
        const measurementsByHive = new Map<string, MeasurementItem[]>();
        rawMeasurements.forEach((m: any) => {
          if (!m.hive_id) return;
          const list = measurementsByHive.get(m.hive_id) || [];
          let pressure: number | null = null;
          if (m.raw && typeof m.raw === "object") {
            pressure = m.raw.pressure || m.raw.pressure_hpa || m.raw.barometer || null;
          }
          list.push({
            id: m.id,
            temperature_c:
              m.temperature_c !== null && m.temperature_c !== undefined
                ? Number(m.temperature_c)
                : null,
            humidity_pct:
              m.humidity_pct !== null && m.humidity_pct !== undefined
                ? Number(m.humidity_pct)
                : null,
            pressure_hpa: pressure ? Number(pressure) : null,
            weight_kg:
              m.weight_kg !== null && m.weight_kg !== undefined ? Number(m.weight_kg) : null,
            battery_pct:
              m.battery_pct !== null && m.battery_pct !== undefined ? Number(m.battery_pct) : null,
            recorded_at: m.recorded_at,
            source: m.source || "iot",
          });
          measurementsByHive.set(m.hive_id, list);
        });

        // Group harvests by hive_id or hive_label
        const harvestsByHive = new Map<string, HarvestSummaryItem>();
        rawHarvests.forEach((h: any) => {
          const key = h.hive_id || h.hive_label;
          if (!key) return;
          const existing = harvestsByHive.get(key) || {
            totalKg: 0,
            harvestCount: 0,
            lastHarvestedOn: h.harvested_on || h.harvest_date,
            lastBatch: h.batch || h.batch_code,
            avgMoisture: h.moisture_pct,
          };
          existing.totalKg += Number(h.quantity_kg || 0);
          existing.harvestCount += 1;
          harvestsByHive.set(key, existing);
        });

        // Map each hive into its parent apiary
        rawHives.forEach((h: any) => {
          const apiaryId = h.apiary_id || "unassigned-apiary";
          if (!apiaryMap.has(apiaryId)) {
            apiaryMap.set(apiaryId, {
              id: apiaryId,
              name: normalizeApiaryName(h.apiaries?.name || h.apiary_name || CANONICAL_APIARY_NAME),
              latitude: h.apiaries?.latitude ?? null,
              longitude: h.apiaries?.longitude ?? null,
              notes: h.apiaries?.notes ?? null,
              hives: [],
            });
          }

          const dev = deviceByHive.get(h.id) || null;
          const measurements = measurementsByHive.get(h.id) || [];
          const harvestSum =
            harvestsByHive.get(h.id) ||
            harvestsByHive.get(h.name) ||
            harvestsByHive.get(h.hive_code) ||
            null;

          const hiveItem: HiveHistoryItem = {
            id: h.id,
            apiary_id: apiaryId,
            apiary_name: normalizeApiaryName(apiaryMap.get(apiaryId)?.name || CANONICAL_APIARY_NAME),
            name: h.name || h.nickname || h.hive_code || `Hive #${h.id.slice(0, 6)}`,
            hive_code: h.hive_code || undefined,
            max_brood_frames: Number(h.max_brood_frames || h.frame_count || 10),
            notes: h.notes || null,
            queen_breeding_year: h.queen_breeding_year || null,
            queen_origin: h.queen_origin || null,
            device: dev
              ? {
                  id: dev.id,
                  label: dev.label,
                  serial: dev.serial,
                  hive_id: dev.hive_id,
                  device_kind: dev.device_kind,
                  link_type: dev.link_type,
                  status: dev.status,
                  battery_pct: dev.battery_pct,
                  last_seen_at: dev.last_seen_at,
                }
              : null,
            latestMeasurement: measurements.length > 0 ? measurements[0] : null,
            measurementsHistory: measurements,
            harvestSummary: harvestSum,
          };

          apiaryMap.get(apiaryId)!.hives.push(hiveItem);
        });

        const compiledApiaries = Array.from(apiaryMap.values()).filter(
          (a) => a.hives.length > 0 || rawApiaries.some((ra) => ra.id === a.id),
        );
        setApiaryHistoryList(compiledApiaries);

        // Update flattened hives list for Target Colony dropdown
        const flattenedHives: HiveOption[] = rawHives.map((h: any) => ({
          id: h.id,
          name: h.name || h.nickname || h.hive_code || `Hive #${h.id.slice(0, 6)}`,
          hive_code: h.hive_code,
          max_brood_frames: Number(h.max_brood_frames || h.frame_count || 10),
          apiary_name: normalizeApiaryName(
            apiaryMap.get(h.apiary_id)?.name || h.apiaries?.name || h.apiary_name || CANONICAL_APIARY_NAME
          ),
        }));
        setHivesList(flattenedHives);

        const flattenedDevices: DeviceOption[] = rawDevices.map((d: any) => ({
          id: d.id,
          label: d.label,
          serial: d.serial,
          hive_id: d.hive_id,
          status: d.status,
        }));
        setDevicesList(flattenedDevices);

        if (flattenedHives.length > 0 && selectedHiveId === "all") {
          setHivesCount(flattenedHives.length);
        }
      } else {
        // DO NOT GUESS! If user has no logged records, leave empty with clean manual defaults
        setApiaryHistoryList([]);
        setHivesList([]);
        setDevicesList([]);
        setSelectedHiveId("all");
        setLinkedDevice(null);
        setIsDeviceSynced(false);
      }
    } catch (err) {
      console.warn("Failed to load user apiaries and hives:", err);
      // Do not guess or populate fake records on error
      setApiaryHistoryList([]);
      setHivesList([]);
      setDevicesList([]);
    } finally {
      setIsLoadingHistory(false);
      setIsLoadingHives(false);
    }
  }, [user?.id, selectedHiveId]);

  useEffect(() => {
    if (isOpen || embedded) {
      void loadApiaryDeviceHistory();
    }
  }, [isOpen, embedded, loadApiaryDeviceHistory]);

  // 2. Check Device Synced Telemetry when Hive is Selected
  const syncHiveDeviceReadings = useCallback(
    async (hiveId: string) => {
      if (hiveId === "all") {
        setLinkedDevice(null);
        setIsDeviceSynced(false);
        return;
      }

      // Check in compiled history list first
      let matchedHive: HiveHistoryItem | undefined;
      for (const a of apiaryHistoryList) {
        const found = a.hives.find((h) => h.id === hiveId);
        if (found) {
          matchedHive = found;
          break;
        }
      }

      if (matchedHive) {
        if (matchedHive.device) {
          setLinkedDevice(matchedHive.device);
          setIsDeviceSynced(true);
          if (matchedHive.latestMeasurement) {
            const m = matchedHive.latestMeasurement;
            if (m.temperature_c !== null && m.temperature_c !== undefined)
              setTempC(m.temperature_c);
            if (m.humidity_pct !== null && m.humidity_pct !== undefined)
              setHumidityPct(m.humidity_pct);
            if (m.pressure_hpa !== null && m.pressure_hpa !== undefined)
              setPressureHpa(m.pressure_hpa);
            if (m.weight_kg !== null && m.weight_kg !== undefined) setScaleWeightKg(m.weight_kg);
          }
          toast.success(
            `Hardware synced: ${matchedHive.device.label || matchedHive.device.serial}`,
          );
        } else {
          // Timothy / User has no device synced on this hive
          setLinkedDevice(null);
          setIsDeviceSynced(false);
        }
        return;
      }

      // Fallback check against devices table
      const dev = devicesList.find((d) => d.hive_id === hiveId);
      setLinkedDevice(dev || null);

      try {
        const { data: measurements } = await (supabase as any)
          .from("device_measurements")
          .select("*")
          .eq("hive_id", hiveId)
          .order("recorded_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const m = measurements as any;
        if (m && (m.temperature_c !== null || m.weight_kg !== null)) {
          setIsDeviceSynced(true);
          if (m.temperature_c !== null && m.temperature_c !== undefined) {
            setTempC(Number(m.temperature_c));
          }
          if (m.humidity_pct !== null && m.humidity_pct !== undefined) {
            setHumidityPct(Number(m.humidity_pct));
          }
          if (m.weight_kg !== null && m.weight_kg !== undefined) {
            setScaleWeightKg(Number(m.weight_kg));
          }
          if (m.raw && typeof m.raw === "object") {
            const rawObj = m.raw as any;
            if (rawObj.pressure || rawObj.barometer || rawObj.pressure_hpa) {
              setPressureHpa(Number(rawObj.pressure || rawObj.barometer || rawObj.pressure_hpa));
            }
          }
          toast.success("Device readings synchronized from database");
        } else {
          setIsDeviceSynced(false);
        }
      } catch {
        setIsDeviceSynced(false);
      }
    },
    [apiaryHistoryList, devicesList],
  );

  // Trigger sync check on hive change
  const handleHiveChange = (hiveId: string) => {
    setSelectedHiveId(hiveId);
    if (hiveId !== "all") {
      setHivesCount(1);
      const h = hivesList.find((item) => item.id === hiveId);
      if (h?.max_brood_frames) {
        const frames = Math.min(12, Math.max(4, h.max_brood_frames));
        setBroodFrames(frames);
        const calculatedStrength = Math.round(Math.min(120, Math.max(10, (frames / 10) * 100)));
        setColonyStrength(calculatedStrength);
      }
      void syncHiveDeviceReadings(hiveId);
    } else {
      setHivesCount(hivesList.length > 0 ? hivesList.length : 15);
      setLinkedDevice(null);
      setIsDeviceSynced(false);
    }
  };

  // Sync brood frames to colony strength
  const handleBroodChange = (frames: number) => {
    setBroodFrames(frames);
    const calculatedStrength = Math.round(Math.min(120, Math.max(10, (frames / 10) * 100)));
    setColonyStrength(calculatedStrength);
  };

  // Select Hive from History Table directly into Projection Engine
  const handleProjectFromHistoryHive = (hive: HiveHistoryItem) => {
    setSelectedHiveId(hive.id);
    setHivesCount(1);
    if (hive.max_brood_frames) {
      const frames = Math.min(12, Math.max(4, hive.max_brood_frames));
      setBroodFrames(frames);
      const calculatedStrength = Math.round(Math.min(120, Math.max(10, (frames / 10) * 100)));
      setColonyStrength(calculatedStrength);
    }

    if (hive.device) {
      setLinkedDevice(hive.device);
      setIsDeviceSynced(true);
      if (hive.latestMeasurement) {
        if (
          hive.latestMeasurement.temperature_c !== null &&
          hive.latestMeasurement.temperature_c !== undefined
        ) {
          setTempC(hive.latestMeasurement.temperature_c);
        }
        if (
          hive.latestMeasurement.humidity_pct !== null &&
          hive.latestMeasurement.humidity_pct !== undefined
        ) {
          setHumidityPct(hive.latestMeasurement.humidity_pct);
        }
        if (
          hive.latestMeasurement.pressure_hpa !== null &&
          hive.latestMeasurement.pressure_hpa !== undefined
        ) {
          setPressureHpa(hive.latestMeasurement.pressure_hpa);
        }
        if (
          hive.latestMeasurement.weight_kg !== null &&
          hive.latestMeasurement.weight_kg !== undefined
        ) {
          setScaleWeightKg(hive.latestMeasurement.weight_kg);
        }
      }
      toast.success(`Loaded ${hive.name} with device ${hive.device.serial} into Yield Projection`);
    } else {
      setLinkedDevice(null);
      setIsDeviceSynced(false);
      toast.info(`Loaded ${hive.name} (No device synced · manual telemetry mode)`);
    }

    // Scroll up smoothly to calculator
    calculatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // --- Mathematical Yield Projection Engine ---
  const calc = useMemo(() => {
    // 1. Colony Availability Calculation
    const availDate = new Date(colonyAvailableDate);
    const harvestDate = new Date(targetHarvestDate);
    const diffMs = harvestDate.getTime() - availDate.getTime();
    const daysAvailable = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    // Effective foraging flow days within the bloom cycle
    const effectiveFlowDays = Math.min(bloomDays, daysAvailable);
    const availabilityFactor = bloomDays > 0 ? effectiveFlowDays / bloomDays : 0;

    // 2. Colony Strength Multiplier (Biological non-linear Farrar's Rule)
    const strengthMultiplier = colonyStrength < 25 ? 0.05 : Math.pow(colonyStrength / 100, 1.45);

    // 3. Environmental & Sensor Telemetry Modifiers
    let tempF: number;
    if (tempC < 13) {
      tempF = 0.08;
    } else if (tempC < 18) {
      tempF = 0.45 + ((tempC - 13) / 5) * 0.45;
    } else if (tempC <= 28) {
      tempF = 1.0;
    } else if (tempC <= 35) {
      tempF = 1.0 - ((tempC - 28) / 7) * 0.2;
    } else {
      tempF = Math.max(0.15, 0.8 - ((tempC - 35) / 5) * 0.6);
    }

    let humidF: number;
    if (humidityPct >= 50 && humidityPct <= 65) {
      humidF = 1.0;
    } else if (humidityPct > 65) {
      humidF = Math.max(0.4, 1.0 - ((humidityPct - 65) / 35) * 0.55);
    } else {
      humidF = Math.max(0.5, 1.0 - ((50 - humidityPct) / 30) * 0.45);
    }

    let pressureF: number;
    if (pressureHpa >= 1012) {
      pressureF = 1.05;
    } else if (pressureHpa >= 1007) {
      pressureF = 1.0;
    } else {
      pressureF = Math.max(0.45, 0.75 + ((pressureHpa - 990) / 17) * 0.25);
    }

    const weightF = scaleWeightKg >= 42 ? 1.08 : scaleWeightKg >= 32 ? 0.95 : 0.78;
    const windF = windKmh > 32 ? 0.25 : Math.max(0.3, 1 - windKmh / 50);
    const precipF = precipMm > 8 ? 0.2 : Math.max(0.25, 1 - precipMm / 20);

    const weatherFactor = Math.max(
      0.08,
      (tempF * 0.25 + humidF * 0.2 + pressureF * 0.15 + windF * 0.2 + precipF * 0.2) * weightF,
    );

    const baseDailySurplus = 1.4;
    const nectarFactor = nectarScore / 10;
    const dailyKg = Math.max(
      0,
      baseDailySurplus * strengthMultiplier * nectarFactor * weatherFactor,
    );

    const seasonKg = dailyKg * effectiveFlowDays;
    const totalKg = seasonKg * hivesCount;
    const revenue = totalKg * pricePerKg;

    return {
      daysAvailable,
      effectiveFlowDays,
      availabilityFactor,
      strengthMultiplier,
      tempF,
      humidF,
      pressureF,
      weightF,
      windF,
      precipF,
      weatherFactor,
      dailyKg,
      seasonKg,
      totalKg,
      revenue,
    };
  }, [
    colonyAvailableDate,
    targetHarvestDate,
    bloomDays,
    colonyStrength,
    nectarScore,
    tempC,
    humidityPct,
    pressureHpa,
    scaleWeightKg,
    windKmh,
    precipMm,
    pricePerKg,
    hivesCount,
  ]);

  // Daily Harvest Flow Curve
  const dailyCurve = useMemo(() => {
    const days = Math.max(1, calc.effectiveFlowDays);
    return Array.from({ length: days }, (_, i) => {
      const x = i / days;
      const bell = x < 0.25 ? x / 0.25 : x < 0.65 ? 1.0 : Math.max(0, (1 - x) / 0.35);
      return {
        day: `D${i + 1}`,
        kg: +(calc.dailyKg * bell).toFixed(2),
        cum: 0,
      };
    }).map((d, i, arr) => {
      d.cum = +arr
        .slice(0, i + 1)
        .reduce((sum, item) => sum + item.kg, 0)
        .toFixed(1);
      return d;
    });
  }, [calc.dailyKg, calc.effectiveFlowDays]);

  // Limiting Factors Radar
  const radarData = [
    { k: "Strength", v: Math.round(calc.strengthMultiplier * 100) },
    { k: "Availability", v: Math.round(calc.availabilityFactor * 100) },
    { k: "Nectar", v: Math.round((nectarScore / 10) * 100) },
    { k: "Temp °C", v: Math.round(calc.tempF * 100) },
    { k: "Humidity", v: Math.round(calc.humidF * 100) },
    { k: "Barometer", v: Math.round(calc.pressureF * 100) },
  ];

  // Load Saved Projections History
  const loadHistory = useCallback(async () => {
    if (!deviceId) return;
    try {
      const { data } = await (supabase as any)
        .from("yield_projections")
        .select("*")
        .eq("device_id", deviceId)
        .order("created_at", { ascending: false })
        .limit(20);
      setRuns((data ?? []) as Run[]);
    } catch (e) {
      console.warn("History fetch error:", e);
    }
  }, [deviceId]);

  useEffect(() => {
    if ((isOpen || embedded) && deviceId) {
      void loadHistory();
    }
  }, [isOpen, embedded, deviceId, loadHistory]);

  const handleSave = async () => {
    const selectedHiveObj = hivesList.find((h) => h.id === selectedHiveId);
    const hiveLabel = selectedHiveObj
      ? selectedHiveObj.name || selectedHiveObj.hive_code
      : "All Apiaries";

    const inputs = {
      hivesCount,
      selectedHiveId,
      colonyAvailableDate,
      targetHarvestDate,
      effectiveFlowDays: calc.effectiveFlowDays,
      colonyStrength,
      broodFrames,
      nectarScore,
      bloomDays,
      tempC,
      humidityPct,
      pressureHpa,
      scaleWeightKg,
      windKmh,
      precipMm,
      pricePerKg,
      isDeviceSynced,
      linkedDeviceSerial: linkedDevice?.serial || null,
    };

    const outputs = {
      seasonKg: +calc.seasonKg.toFixed(1),
      totalKg: +calc.totalKg.toFixed(1),
      dailyKg: +calc.dailyKg.toFixed(2),
      revenue: Math.round(calc.revenue),
      weatherFactor: +calc.weatherFactor.toFixed(2),
      strengthMultiplier: +calc.strengthMultiplier.toFixed(2),
    };

    try {
      const { error } = await (supabase as any).from("yield_projections").insert({
        device_id: deviceId || "anonymous",
        label: `${hiveLabel} (${colonyAvailableDate} → ${targetHarvestDate})`,
        inputs,
        outputs,
      });

      if (error) throw error;
      toast.success("Yield Projection saved to database");
      void loadHistory();
    } catch {
      // Local fallback
      const mockRun: Run = {
        id: crypto.randomUUID(),
        label: `${hiveLabel} (${colonyAvailableDate} → ${targetHarvestDate})`,
        inputs,
        outputs,
        created_at: new Date().toISOString(),
      };
      setRuns((prev) => [mockRun, ...prev]);
      toast.success("Saved to local projection scenario log");
    }
  };

  const handleDeleteRun = async (id: string) => {
    setRuns((prev) => prev.filter((r) => r.id !== id));
    await (supabase as any).from("yield_projections").delete().eq("id", id);
    void loadHistory();
  };

  // Filtered Apiaries and Hives for the History Section
  const filteredApiaries = useMemo(() => {
    const query = historySearchQuery.trim().toLowerCase();

    return apiaryHistoryList
      .filter((apiary) => {
        if (historyApiaryFilter !== "all" && apiary.id !== historyApiaryFilter) {
          return false;
        }
        return true;
      })
      .map((apiary) => {
        const matchingHives = apiary.hives.filter((hive) => {
          // Device filter
          if (historyDeviceFilter === "linked" && !hive.device) return false;
          if (historyDeviceFilter === "unsynced" && !!hive.device) return false;

          // Text search filter
          if (query) {
            const inApiary = apiary.name.toLowerCase().includes(query);
            const inHive =
              hive.name.toLowerCase().includes(query) ||
              (hive.hive_code && hive.hive_code.toLowerCase().includes(query));
            const inSerial =
              hive.device?.serial && hive.device.serial.toLowerCase().includes(query);
            const inModel = hive.device?.label && hive.device.label.toLowerCase().includes(query);
            return inApiary || inHive || inSerial || inModel;
          }
          return true;
        });

        return {
          ...apiary,
          hives: matchingHives,
        };
      })
      .filter((apiary) => apiary.hives.length > 0 || !query);
  }, [apiaryHistoryList, historyApiaryFilter, historyDeviceFilter, historySearchQuery]);

  const totalLinkedHivesCount = useMemo(() => {
    return apiaryHistoryList.reduce((sum, a) => sum + a.hives.filter((h) => !!h.device).length, 0);
  }, [apiaryHistoryList]);

  if (!isOpen && !embedded) return null;

  const content = (
    <div className="w-full max-w-full space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center text-honey flex-shrink-0 shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Honey Yield <span className="text-honey">Projection</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Calculated from Colony Availability Date × Colony Strength × Bioclimatic Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all border border-emerald-500/40"
          >
            <Save className="w-4 h-4 text-white" />{" "}
            <span className="text-white">Save Projection</span>
          </button>
          {!embedded && onClose && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hive & IoT Hardware Device Sync Banner */}
      <div
        ref={calculatorRef}
        className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 shadow-sm space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-honey" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Hive & IoT Device Telemetry
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {isDeviceSynced ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Hardware Synced ({linkedDevice?.label || linkedDevice?.serial || "Active Node"})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                No Hardware Synced (Manual Telemetry Mode)
              </span>
            )}

            <button
              type="button"
              onClick={loadApiaryDeviceHistory}
              disabled={isLoadingHives}
              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
              title="Refresh Hives and Devices"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoadingHives ? "animate-spin text-honey" : ""}`}
              />
            </button>
          </div>
        </div>

        {hivesList.length === 0 && !isLoadingHives && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">No registered hives logged in your account yet.</span>{" "}
              Operating in manual estimation mode. Go to the{" "}
              <span
                className="font-semibold underline cursor-pointer hover:text-amber-800 dark:hover:text-amber-100"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("beeyield-navigate-tab", { detail: "hives" }),
                  );
                  onClose();
                }}
              >
                Apiaries & Hives manager
              </span>{" "}
              to log your colonies and sync telemetry hardware.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Target Colony / Hive</label>
            <select
              value={selectedHiveId}
              onChange={(e) => handleHiveChange(e.target.value)}
              className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-honey/30"
            >
              {hivesList.length > 0 ? (
                <>
                  <option value="all">All Logged Hives ({hivesList.length} Total Colonies)</option>
                  {hivesList.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name || h.hive_code} {h.apiary_name ? `(${h.apiary_name})` : ""}
                    </option>
                  ))}
                </>
              ) : (
                <>
                  <option value="all">Manual Simulation Mode (No Logged Hives)</option>
                  <option value="none" disabled>
                    No hives logged yet — Add in Apiaries & Hives
                  </option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Hives Included in Flow
            </label>
            <input
              type="number"
              min={1}
              max={1000}
              value={hivesCount}
              disabled={selectedHiveId !== "all"}
              onChange={(e) => setHivesCount(Math.max(1, Number(e.target.value) || 1))}
              className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Hardware Link Status</label>
            <div className="h-9 px-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate">
                {selectedHiveId === "all"
                  ? hivesList.length > 0
                    ? `Aggregated Fleet (${hivesList.length} Colonies)`
                    : "Manual Telemetry Mode"
                  : linkedDevice
                    ? `${linkedDevice.serial || linkedDevice.label || "Hardware Connected"}`
                    : "No device synced on this hive"}
              </span>
              {isDeviceSynced && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  ONLINE
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Main Interactive Parameter Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Dates, Flow Window & Farrar's Colony Strength */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 shadow-sm space-y-4">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-honey" /> Availability & Colony Strength
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Direct mathematical correlation to forager population and available bloom days.
            </p>
          </div>

          {/* Colony Available Date Picker */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1 flex items-center justify-between">
              <span>Colony Available Date</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Date colonies enter site
              </span>
            </label>
            <input
              type="date"
              value={colonyAvailableDate}
              onChange={(e) => setColonyAvailableDate(e.target.value)}
              className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-honey/30"
            />
          </div>

          {/* Target Honey Extraction Date */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1 flex items-center justify-between">
              <span>Target Harvest / Pull Date</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Super pulling window
              </span>
            </label>
            <input
              type="date"
              value={targetHarvestDate}
              onChange={(e) => setTargetHarvestDate(e.target.value)}
              className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-honey/30"
            />
          </div>

          {/* Nectar Flow Cycle Days */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-muted-foreground">Bloom Flow Cycle Duration</span>
              <span className="font-bold text-foreground font-mono">{bloomDays} days</span>
            </div>
            <input
              type="range"
              min={5}
              max={90}
              value={bloomDays}
              onChange={(e) => setBloomDays(Number(e.target.value))}
              className="w-full accent-honey"
            />
          </div>

          {/* Dynamic Available Flow Banner */}
          <div className="p-3 rounded-xl border border-honey/30 bg-honey/5 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground">Effective Foraging Days:</span>
              <span className="font-bold text-honey text-sm font-mono">
                {calc.effectiveFlowDays} days
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Colonies on-site for {calc.daysAvailable} days during a {bloomDays}-day bloom window.
              Flow capture index: <strong>{(calc.availabilityFactor * 100).toFixed(0)}%</strong>.
            </p>
          </div>

          {/* Brood Frames & Farrar's Colony Strength */}
          <div className="pt-2 border-t border-border/50 space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-muted-foreground">Brood Chamber Frames</span>
                <span className="font-bold text-foreground font-mono">
                  {broodFrames} / 12 Frames
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={12}
                value={broodFrames}
                onChange={(e) => handleBroodChange(Number(e.target.value))}
                className="w-full accent-honey"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-muted-foreground">Colony Population Strength</span>
                <span className="font-bold text-honey font-mono">{colonyStrength}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={120}
                value={colonyStrength}
                onChange={(e) => setColonyStrength(Number(e.target.value))}
                className="w-full accent-honey"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>Weak (20%)</span>
                <span>Standard (80%)</span>
                <span>Hyper-Colony (120%)</span>
              </div>
            </div>

            {/* Farrar's Biological Multiplier Display */}
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/70 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-foreground block">Farrar's Biomass Rule:</span>
                <span className="text-[10px] text-muted-foreground">
                  Non-linear surplus coefficient
                </span>
              </div>
              <span className="font-mono font-bold text-honey text-sm">
                {calc.strengthMultiplier.toFixed(2)}× Multiplier
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: IoT Device Telemetry & Bioclimatic Modifiers */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 shadow-sm space-y-4">
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-honey" /> Bioclimatic Telemetry Modifiers
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Dynamic flight threshold and scale weight intake constraints.
            </p>
          </div>

          {/* Temperature Input */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Hive Internal / Ambient Temp
              </span>
              <span className="font-bold text-foreground font-mono">{tempC.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min={10}
              max={42}
              step={0.5}
              value={tempC}
              onChange={(e) => setTempC(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Too Cold (10°C)</span>
              <span className="text-emerald-600 font-semibold">Optimal Brood (34.5°C)</span>
              <span>Heat Stress (40°C)</span>
            </div>
          </div>

          {/* Humidity Input */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" /> Relative Humidity
              </span>
              <span className="font-bold text-foreground font-mono">{humidityPct}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={95}
              value={humidityPct}
              onChange={(e) => setHumidityPct(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Arid (20%)</span>
              <span className="text-emerald-600 font-semibold">Optimal Ripening (55-65%)</span>
              <span>Humid (95%)</span>
            </div>
          </div>

          {/* Barometric Pressure & Continuous Scale Weight */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block flex items-center gap-1">
                <Gauge className="w-3 h-3 text-honey" /> Barometer (hPa)
              </label>
              <input
                type="number"
                value={pressureHpa}
                onChange={(e) => setPressureHpa(Number(e.target.value))}
                className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-mono font-semibold text-foreground"
              />
              <span className="text-[9px] text-muted-foreground mt-0.5 block">
                {pressureHpa >= 1012
                  ? "High (Clear)"
                  : pressureHpa >= 1007
                    ? "Normal"
                    : "Low (Storm Risk)"}
              </span>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block flex items-center gap-1">
                <Scale className="w-3 h-3 text-emerald-600" /> Scale Weight (kg)
              </label>
              <input
                type="number"
                step={0.5}
                value={scaleWeightKg}
                onChange={(e) => setScaleWeightKg(Number(e.target.value))}
                className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-mono font-semibold text-foreground"
              />
              <span className="text-[9px] text-muted-foreground mt-0.5 block">
                {scaleWeightKg >= 42 ? "Strong Comb" : "Buildup Stage"}
              </span>
            </div>
          </div>

          {/* Florage Nectar Rating */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-muted-foreground">Florage & Nectar Flow Score</span>
              <span className="font-bold text-foreground font-mono">{nectarScore} / 10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={nectarScore}
              onChange={(e) => setNectarScore(Number(e.target.value))}
              className="w-full accent-honey"
            />
          </div>

          {/* Secondary Weather (Wind & Rain) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">
                Wind Velocity (km/h)
              </label>
              <input
                type="number"
                value={windKmh}
                onChange={(e) => setWindKmh(Number(e.target.value))}
                className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">
                Precipitation (mm/d)
              </label>
              <input
                type="number"
                value={precipMm}
                onChange={(e) => setPrecipMm(Number(e.target.value))}
                className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground"
              />
            </div>
          </div>

          {/* Honey Market Value */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Bulk Honey Price / kg (KES)
            </label>
            <input
              type="number"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(Number(e.target.value))}
              className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground"
            />
          </div>

          {/* Radar Bottleneck Analysis */}
          <div className="pt-2 border-t border-border/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Bioclimatic Limiting Factors
            </h4>
            <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="k" stroke="hsl(var(--muted-foreground))" fontSize={9} />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={8}
                  />
                  <Radar
                    name="Factor %"
                    dataKey="v"
                    stroke="#D97706"
                    fill="#F59E0B"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Column 3: Outcomes, Flow Curve & Math Verification */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
              <h3 className="text-sm font-display font-bold text-honey flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Projected Crop Outcomes
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground">
                {hivesCount} {hivesCount === 1 ? "Colony" : "Colonies"}
              </span>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="p-3.5 rounded-xl border border-border bg-background/90 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Harvest per Hive
                </span>
                <span className="text-2xl font-display font-bold text-emerald-600 block my-0.5">
                  {calc.seasonKg.toFixed(1)} <span className="text-xs font-bold">kg</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Over {calc.effectiveFlowDays} active days
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/90 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Total Apiary Crop
                </span>
                <span className="text-2xl font-display font-bold text-honey block my-0.5">
                  {Math.round(calc.totalKg).toLocaleString()}{" "}
                  <span className="text-xs font-bold">kg</span>
                </span>
                <span className="text-[10px] text-muted-foreground">{hivesCount} hives total</span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/90 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Daily Intake Rate
                </span>
                <span className="text-xl font-display font-bold text-foreground block my-0.5">
                  {calc.dailyKg.toFixed(2)} <span className="text-xs font-bold">kg/d</span>
                </span>
                <span className="text-[10px] text-muted-foreground">Peak flow surplus</span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/90 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Gross Revenue
                </span>
                <span className="text-xl font-display font-bold text-emerald-600 block my-0.5">
                  KES {Math.round(calc.revenue).toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">@ KES {pricePerKg}/kg</span>
              </div>
            </div>

            {/* Daily Cumulative Extraction Curve */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">
                  Cumulative Harvest Accumulation (kg)
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  D1 → D{calc.effectiveFlowDays}
                </span>
              </div>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyCurve} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="honeyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={9} />
                    <YAxis tickLine={false} axisLine={false} fontSize={9} />
                    <Tooltip
                      contentStyle={{ background: "white", borderRadius: "10px", fontSize: "11px" }}
                      formatter={(val: any, name: string) => [
                        `${val} kg`,
                        name === "cum" ? "Total Accumulated" : "Daily Inflow",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="cum"
                      stroke="#D97706"
                      strokeWidth={2.5}
                      fill="url(#honeyGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Mathematical Formula Transparency Panel */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/70 text-[11px] text-muted-foreground space-y-1.5">
            <span className="font-bold text-foreground text-xs block flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-honey" /> Mathematical Relationship Verified
            </span>
            <p className="leading-relaxed">
              <strong>Yield (kg)</strong> = 1.40 kg/d × <strong>Strength</strong> (
              {calc.strengthMultiplier.toFixed(2)}×) × <strong>Availability</strong> (
              {calc.effectiveFlowDays}d / {(calc.availabilityFactor * 100).toFixed(0)}%) ×{" "}
              <strong>Bioclimatic Factor</strong> ({calc.weatherFactor.toFixed(2)}) ×{" "}
              <strong>{hivesCount} Hives</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* --- ENHANCED HISTORY SECTION: USER APIARIES & DEVICE-LINKED HIVES --- */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 shadow-sm space-y-4">
        {/* History Header & Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h3 className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <History className="w-5 h-5 text-honey" />
              Apiary & Hive Hardware History
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              History of user apiaries, connected IoT devices, real-time sensor vitals, and past
              harvest yields.
            </p>
          </div>

          {/* History Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setHistoryTab("apiaries")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                historyTab === "apiaries"
                  ? "bg-background text-foreground shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-honey" />
              Apiaries & Device-Linked Hives
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-honey/15 text-honey font-bold">
                {apiaryHistoryList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryTab("projections")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                historyTab === "projections"
                  ? "bg-background text-foreground shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              Saved Projection Scenarios
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">
                {runs.length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: APIARIES & DEVICE-LINKED HIVES */}
        {historyTab === "apiaries" && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-background/70 border border-border/60">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Filter by apiary, hive name, or device serial..."
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-honey/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={historyApiaryFilter}
                  onChange={(e) => setHistoryApiaryFilter(e.target.value)}
                  className="h-8 px-2.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none"
                >
                  <option value="all">All Apiaries ({apiaryHistoryList.length})</option>
                  {apiaryHistoryList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center border border-border rounded-lg p-0.5 bg-background">
                  <button
                    type="button"
                    onClick={() => setHistoryDeviceFilter("all")}
                    className={`px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                      historyDeviceFilter === "all"
                        ? "bg-muted font-bold text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Hives
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryDeviceFilter("linked")}
                    className={`px-2 py-1 text-[11px] rounded font-medium flex items-center gap-1 transition-colors ${
                      historyDeviceFilter === "linked"
                        ? "bg-emerald-500/15 text-emerald-600 font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Device-Linked ({totalLinkedHivesCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryDeviceFilter("unsynced")}
                    className={`px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                      historyDeviceFilter === "unsynced"
                        ? "bg-muted font-bold text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Unsynced
                  </button>
                </div>

                <button
                  type="button"
                  onClick={loadApiaryDeviceHistory}
                  disabled={isLoadingHistory}
                  className="h-8 w-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center text-muted-foreground"
                  title="Refresh Apiary & Device Telemetry"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoadingHistory ? "animate-spin text-honey" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Apiaries List */}
            <div className="space-y-4">
              {filteredApiaries.map((apiary) => {
                const linkedHives = apiary.hives.filter((h) => !!h.device);
                const totalHarvestKg = apiary.hives.reduce(
                  (sum, h) => sum + (h.harvestSummary?.totalKg || 0),
                  0,
                );

                return (
                  <div
                    key={apiary.id}
                    className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-background/80 shadow-sm space-y-3"
                  >
                    {/* Apiary Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-honey/10 border border-honey/30 flex items-center justify-center text-honey flex-shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-display font-bold text-foreground">
                            {apiary.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            {apiary.latitude !== null && apiary.longitude !== null && (
                              <span>
                                Lat {apiary.latitude.toFixed(4)}, Lng {apiary.longitude.toFixed(4)}
                              </span>
                            )}
                            {apiary.notes && <span>· {apiary.notes}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="px-2.5 py-0.5 rounded-full bg-muted font-medium text-foreground">
                          {apiary.hives.length} {apiary.hives.length === 1 ? "Hive" : "Hives"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {linkedHives.length} Device Synced
                        </span>
                        {totalHarvestKg > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-honey/10 text-honey border border-honey/20 font-medium">
                            {totalHarvestKg.toFixed(1)} kg Recorded Crop
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hives Grid inside this Apiary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
                      {apiary.hives.map((hive) => {
                        const isExpanded = expandedHiveHistoryId === hive.id;
                        const hasDevice = !!hive.device;

                        return (
                          <div
                            key={hive.id}
                            className={`p-3.5 rounded-xl border transition-all ${
                              hasDevice
                                ? "border-honey/30 bg-card/80 hover:border-honey/60"
                                : "border-border/60 bg-muted/20"
                            }`}
                          >
                            {/* Hive Title & Metadata */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                  {hive.name}
                                  {hive.hive_code && (
                                    <span className="font-mono text-[10px] text-muted-foreground font-normal">
                                      [{hive.hive_code}]
                                    </span>
                                  )}
                                </h5>
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                                  <span>{hive.max_brood_frames} Brood Frames</span>
                                  {hive.queen_breeding_year && (
                                    <span>· {hive.queen_breeding_year} Queen</span>
                                  )}
                                  {hive.queen_origin && <span>({hive.queen_origin})</span>}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleProjectFromHistoryHive(hive)}
                                className="px-2.5 py-1 rounded-lg bg-honey/10 hover:bg-honey/20 text-honey border border-honey/30 text-[11px] font-semibold flex items-center gap-1 transition-all shadow-xs"
                                title="Load this hive's vitals into the yield projection calculator"
                              >
                                <TrendingUp className="w-3 h-3" />
                                Project From Hive
                              </button>
                            </div>

                            {/* Linked Hardware Device Information */}
                            <div className="mb-2.5">
                              {hasDevice ? (
                                <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] space-y-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                                      <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="truncate">
                                        {hive.device?.label || "Connected Hardware"}
                                      </span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      ONLINE
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                                    <span className="font-mono">S/N: {hive.device?.serial}</span>
                                    <span className="capitalize">
                                      {hive.device?.link_type || "IoT Bus"}
                                    </span>
                                    {hive.device?.battery_pct !== null &&
                                      hive.device?.battery_pct !== undefined && (
                                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                          <Battery className="w-3 h-3" /> {hive.device.battery_pct}%
                                        </span>
                                      )}
                                    <span>Seen: {formatTimestamp(hive.device?.last_seen_at)}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2 rounded-lg bg-muted/40 border border-border/60 text-[11px] flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>No hardware device synced</span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">
                                    Manual Telemetry
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Live/Latest Telemetry Readings Snapshot */}
                            {hive.latestMeasurement && (
                              <div className="mb-2.5">
                                <div className="grid grid-cols-4 gap-1.5 text-center">
                                  <div className="p-1.5 rounded-lg bg-background border border-border/70">
                                    <span className="text-[9px] text-muted-foreground block">
                                      Temp
                                    </span>
                                    <span className="text-xs font-mono font-bold text-foreground">
                                      {typeof hive.latestMeasurement.temperature_c === "number"
                                        ? `${hive.latestMeasurement.temperature_c.toFixed(1)}°`
                                        : "—"}
                                    </span>
                                  </div>

                                  <div className="p-1.5 rounded-lg bg-background border border-border/70">
                                    <span className="text-[9px] text-muted-foreground block">
                                      Humidity
                                    </span>
                                    <span className="text-xs font-mono font-bold text-foreground">
                                      {typeof hive.latestMeasurement.humidity_pct === "number"
                                        ? `${hive.latestMeasurement.humidity_pct}%`
                                        : "—"}
                                    </span>
                                  </div>

                                  <div className="p-1.5 rounded-lg bg-background border border-border/70">
                                    <span className="text-[9px] text-muted-foreground block">
                                      Pressure
                                    </span>
                                    <span className="text-xs font-mono font-bold text-foreground">
                                      {typeof hive.latestMeasurement.pressure_hpa === "number"
                                        ? `${hive.latestMeasurement.pressure_hpa}`
                                        : "1013"}
                                    </span>
                                  </div>

                                  <div className="p-1.5 rounded-lg bg-background border border-border/70">
                                    <span className="text-[9px] text-muted-foreground block">
                                      Scale Wt
                                    </span>
                                    <span className="text-xs font-mono font-bold text-emerald-600">
                                      {typeof hive.latestMeasurement.weight_kg === "number"
                                        ? `${hive.latestMeasurement.weight_kg.toFixed(1)}kg`
                                        : "—"}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[9px] text-muted-foreground block mt-1 text-right">
                                  Telemetry recorded:{" "}
                                  {formatTimestamp(hive.latestMeasurement.recorded_at)}
                                </span>
                              </div>
                            )}

                            {/* Past Extraction & Harvest History */}
                            {hive.harvestSummary && hive.harvestSummary.totalKg > 0 && (
                              <div className="p-2 rounded-lg bg-honey/5 border border-honey/20 text-[10px] flex items-center justify-between text-muted-foreground mb-2">
                                <span className="flex items-center gap-1 font-semibold text-honey">
                                  <Package className="w-3 h-3" /> Past Extractions:
                                </span>
                                <span>
                                  <strong>{hive.harvestSummary.totalKg.toFixed(1)} kg</strong>{" "}
                                  across {hive.harvestSummary.harvestCount} batches
                                  {hive.harvestSummary.avgMoisture
                                    ? ` · ${hive.harvestSummary.avgMoisture}% moist.`
                                    : ""}
                                </span>
                              </div>
                            )}

                            {/* Expandable Measurement Log */}
                            {hive.measurementsHistory.length > 1 && (
                              <div className="pt-1 border-t border-border/40">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedHiveHistoryId(isExpanded ? null : hive.id)
                                  }
                                  className="w-full text-[10px] text-muted-foreground hover:text-foreground flex items-center justify-between py-0.5"
                                >
                                  <span>
                                    {isExpanded
                                      ? "Hide Telemetry Timeline"
                                      : "View Recent Sensor Logs"}{" "}
                                    ({hive.measurementsHistory.length} logs)
                                  </span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </button>

                                {isExpanded && (
                                  <div className="mt-2 space-y-1 max-h-36 overflow-y-auto pr-1">
                                    <table className="w-full text-[10px]">
                                      <thead className="text-muted-foreground border-b border-border/40">
                                        <tr>
                                          <th className="text-left py-1">Time</th>
                                          <th className="text-right py-1">Temp</th>
                                          <th className="text-right py-1">Hum</th>
                                          <th className="text-right py-1">Weight</th>
                                          <th className="text-right py-1">Source</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {hive.measurementsHistory.map((m) => (
                                          <tr
                                            key={m.id}
                                            className="border-b border-border/30 hover:bg-muted/30"
                                          >
                                            <td className="py-1 text-muted-foreground">
                                              {formatTimestamp(m.recorded_at)}
                                            </td>
                                            <td className="text-right font-mono font-medium text-foreground">
                                              {m.temperature_c ?? "—"}°C
                                            </td>
                                            <td className="text-right font-mono font-medium text-foreground">
                                              {m.humidity_pct ?? "—"}%
                                            </td>
                                            <td className="text-right font-mono font-bold text-emerald-600">
                                              {m.weight_kg ?? "—"}kg
                                            </td>
                                            <td className="text-right text-muted-foreground capitalize">
                                              {m.source || "iot"}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredApiaries.length === 0 && (
                <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/20 text-xs text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">No user apiaries or hives found.</p>
                  <p>
                    Log your colonies in the Apiaries & Hives section to track real-time telemetry,
                    IoT sensors, and historical harvest yields.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SAVED PROJECTION SCENARIOS */}
        {historyTab === "projections" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-2">Scenario / Hive</th>
                  <th className="text-right py-2">Flow Days</th>
                  <th className="text-right py-2">kg / Hive</th>
                  <th className="text-right py-2">Total Crop</th>
                  <th className="text-right py-2">Est. Revenue</th>
                  <th className="text-right py-2">Calculated On</th>
                  <th className="text-right py-2"></th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-t border-border/60 hover:bg-muted/20">
                    <td className="py-2 font-medium text-foreground">{r.label}</td>
                    <td className="text-right py-2 text-muted-foreground font-mono">
                      {r.inputs?.effectiveFlowDays ?? "—"}d
                    </td>
                    <td className="text-right py-2 text-foreground font-mono font-bold">
                      {r.outputs?.seasonKg ?? "—"} kg
                    </td>
                    <td className="text-right py-2 text-honey font-mono font-bold">
                      {Number(r.outputs?.totalKg ?? 0).toLocaleString()} kg
                    </td>
                    <td className="text-right py-2 text-emerald-600 font-mono font-bold">
                      KES {Number(r.outputs?.revenue ?? 0).toLocaleString()}
                    </td>
                    <td className="text-right py-2 text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-right py-2">
                      <button
                        onClick={() => handleDeleteRun(r.id)}
                        className="text-destructive hover:opacity-80 p-1"
                        title="Delete Scenario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {runs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No projection scenarios saved yet. Configure a projection above and click
                      "Save Projection".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-6xl shadow-2xl p-4 sm:p-6 overflow-y-auto max-h-[92vh] my-auto">
        {content}
      </div>
    </div>
  );
}
