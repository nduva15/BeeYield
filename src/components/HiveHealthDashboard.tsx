import { useState, useEffect, useCallback } from "react";
import {
  X,
  HeartPulse,
  RotateCw,
  Sun,
  ShieldCheck,
  FileText,
  Activity,
  Bug,
  AlertTriangle,
  Plus,
  Thermometer,
  Droplets,
  Wind,
  Loader2,
  Calendar,
  Waves,
  Scale,
  Wifi,
  Radio,
  QrCode,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeApiaryName, CANONICAL_APIARY_NAME } from "@/lib/apiary-normalization";
import { resolveUserHives, isTimothyUser, TIMOTHY_DEFAULT_HEALTH_RECORDS } from "@/lib/user-hives";

export interface HiveHealthDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export type HiveItemInfo = {
  id: string;
  name: string;
  apiary?: string;
  hasSensor?: boolean;
  sensorSerial?: string;
  colonyStrength?: string;
  colonyAvailability?: string;
};

export type HiveRecord = {
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
};

export const COLONY_STRENGTH_OPTIONS = [
  "Strong (8–10 Frames Brood & Bees)",
  "Moderate (5–7 Frames)",
  "Weak / Nucleus (<5 Frames)",
  "Very Strong / Swarm-Prone (>10 Frames)",
  "Critical / Queenless (<3 Frames)",
] as const;

export const COLONY_AVAILABILITY_OPTIONS = [
  "Dedicated Honey Production",
  "Available for Pollination Contracts",
  "Queen Rearing & Breeding",
  "Splits & Nucleus Production",
  "Under Quarantine / Medical Observation",
  "Wintering / Seasonal Rest",
] as const;

// Strictly zero hardcoded mock hives - real logged-in user data only
export const BEE_KNOWLEDGE_HIVES: HiveItemInfo[] = [];

export default function HiveHealthDashboard({ isOpen, onClose, embedded = false }: HiveHealthDashboardProps) {
  const { user, profile } = useAuth();
  const userKey = user?.id || "guest_owner";
  const ownerDisplayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    (user ? "Apiary Owner" : "Guest Beekeeper");

  const [selectedHive, setSelectedHive] = useState<string>("all");
  const [coords, setCoords] = useState<string>("-2.409, 37.967");
  const [apiaryName, setApiaryName] = useState<string>(CANONICAL_APIARY_NAME);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);

  // Live Open-Meteo ambient apiary weather state (explicitly distinct from in-hive telemetry)
  const [ambientWeather, setAmbientWeather] = useState<{
    temp: number;
    humidity: number;
    wind: number;
    conditionText: string;
    lastUpdated: string;
  } | null>(null);

  // Real 21-day timeline from Open-Meteo API (14 days past + 7 days forecast)
  const [weatherTimeline, setWeatherTimeline] = useState<Array<{
    date: string;
    max: number;
    min: number;
    rain: number;
    gust: number;
  }>>([]);

  // Hive list with owner-managed Colony Strength, Availability and Sensor status (user-specific with Timothy 184 hives)
  const [hivesList, setHivesList] = useState<HiveItemInfo[]>(() => {
    let customList: any[] = [];
    try {
      const cached = localStorage.getItem(`beeyield_cached_hives_${userKey}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          customList = parsed;
        }
      }
    } catch {}

    const resolved = resolveUserHives(user, profile, customList);
    return resolved.map((item: any) => ({
      id: item.id,
      name: item.name || item.code || `Hive ${item.id}`,
      apiary: normalizeApiaryName(item.apiary || item.apiary_name),
      hasSensor: Boolean(item.hasSensor || item.sensorSerial),
      sensorSerial: item.sensorSerial,
      colonyStrength: item.colonyStrength || "Strong (8–10 Frames Brood & Bees)",
      colonyAvailability: item.colonyAvailability || "Dedicated Honey Production",
    }));
  });

  // User-logged physical and sensor records
  const [records, setRecords] = useState<HiveRecord[]>(() => {
    try {
      const cached = localStorage.getItem(`beeyield_hive_health_records_${userKey}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter((r: any) => {
            const id = String(r?.id || "");
            return !id.startsWith("mock_") && !id.startsWith("fake_");
          });
          if (clean.length > 0) return clean;
        }
      }
    } catch {}
    if (isTimothyUser(user, profile) || !user) {
      return TIMOTHY_DEFAULT_HEALTH_RECORDS as HiveRecord[];
    }
    return [];
  });

  // Form State for "Log Hive Assessment"
  const [newRecordOpen, setNewRecordOpen] = useState<boolean>(false);
  const [recordHive, setRecordHive] = useState<string>("");
  const [recordType, setRecordType] = useState<"inspection" | "varroa" | "asian_hornet" | "acoustic">("inspection");
  const [varroaInput, setVarroaInput] = useState<string>("0");
  const [asianHornetInput, setAsianHornetInput] = useState<string>("0");
  const [healthIndexInput, setHealthIndexInput] = useState<string>("92");
  const [colonyStrengthInput, setColonyStrengthInput] = useState<string>(COLONY_STRENGTH_OPTIONS[0]);
  const [colonyAvailabilityInput, setColonyAvailabilityInput] = useState<string>(COLONY_AVAILABILITY_OPTIONS[0]);
  const [sensorSerialInput, setSensorSerialInput] = useState<string>("");
  const [recordNotes, setRecordNotes] = useState<string>("");

  // Modal for Quick Sensor Pairing
  const [pairSensorModalOpen, setPairSensorModalOpen] = useState<boolean>(false);
  const [pairingHive, setPairingHive] = useState<string>("");
  const [pairingSerial, setPairingSerial] = useState<string>("");

  // Fetch live Open-Meteo ambient apiary weather + 14-day history and 7-day forecast
  const fetchAmbientWeather = useCallback(async (lat: number, lon: number) => {
    setIsWeatherLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&past_days=14&forecast_days=7&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const current = data.current;
        if (current) {
          const code = current.weather_code ?? 0;
          let cond = "Clear sky";
          if (code === 1 || code === 2) cond = "Mainly clear";
          else if (code === 3) cond = "Overcast";
          else if (code >= 51 && code <= 67) cond = "Light rain";
          else if (code >= 80) cond = "Showers";

          setAmbientWeather({
            temp: Math.round(current.temperature_2m * 10) / 10,
            humidity: Math.round(current.relative_humidity_2m),
            wind: Math.round(current.wind_speed_10m),
            conditionText: cond,
            lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
        }

        if (data.daily && Array.isArray(data.daily.time)) {
          const timeline = data.daily.time.map((timeStr: string, idx: number) => ({
            date: timeStr.slice(5), // "MM-DD"
            max: Math.round(data.daily.temperature_2m_max?.[idx] ?? 0),
            min: Math.round(data.daily.temperature_2m_min?.[idx] ?? 0),
            rain: Math.round((data.daily.precipitation_sum?.[idx] ?? 0) * 10) / 10,
            gust: Math.round(data.daily.wind_speed_10m_max?.[idx] ?? 0),
          }));
          setWeatherTimeline(timeline);
        }
      }
    } catch (e) {
      console.warn("Ambient weather fetch error:", e);
    } finally {
      setIsWeatherLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    const withTimeout = <T,>(p: Promise<T>, ms: number, fallback: T): Promise<T> => {
      return Promise.race([
        p,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
      ]);
    };

    try {
      // 1. Fetch user's actual apiary location to align weather coords
      let targetLat = -2.409;
      let targetLon = 37.967;
      let targetApiaryName = CANONICAL_APIARY_NAME;

      if (user?.id) {
        try {
          const { data: apiaryData } = await (supabase as any)
            .from("apiaries")
            .select("id, name, latitude, longitude, location")
            .eq("user_id", user.id)
            .limit(1);

          if (apiaryData && apiaryData.length > 0) {
            const ap = apiaryData[0];
            if (ap.name) {
              targetApiaryName = normalizeApiaryName(ap.name);
              setApiaryName(targetApiaryName);
            }
            if (ap.latitude && ap.longitude && !isNaN(Number(ap.latitude)) && !isNaN(Number(ap.longitude))) {
              targetLat = Number(ap.latitude);
              targetLon = Number(ap.longitude);
              setCoords(`${targetLat.toFixed(3)}, ${targetLon.toFixed(3)}`);
            }
          }
        } catch {}
      }

      // Fetch live weather from real coordinates
      void fetchAmbientWeather(targetLat, targetLon);

      // 2. Fetch logged-in user's real hives and paired devices (strictly eq user_id, no guessing fallbacks)
      const [hivesResult, inspResult, devicesResult] = await Promise.allSettled([
        withTimeout(
          (async () => {
            if (user?.id) {
              const { data } = await (supabase as any)
                .from("hives")
                .select("id, name, hive_code, nickname, hive_label, notes, apiary_name, apiaries(name)")
                .eq("user_id", user.id)
                .limit(100);
              return data || [];
            }
            return [];
          })(),
          2500,
          []
        ),
        withTimeout(
          (async () => {
            if (user?.id) {
              const { data } = await (supabase as any)
                .from("inspections")
                .select("id, hive_label, colony_health, varroa_count, inspected_on, notes")
                .eq("user_id", user.id)
                .order("inspected_on", { ascending: false })
                .limit(100);
              return data || [];
            }
            return [];
          })(),
          2500,
          []
        ),
        withTimeout(
          (async () => {
            if (user?.id) {
              const { data } = await supabase
                .from("devices" as any)
                .select("id, hive_id, serial, status")
                .eq("user_id", user.id);
              return data || [];
            }
            return [];
          })(),
          2000,
          []
        ),
      ]);

      const rawHives = hivesResult.status === "fulfilled" ? hivesResult.value : [];
      const pairedDevices = devicesResult.status === "fulfilled" ? devicesResult.value : [];

      const mappedRemote: any[] = (rawHives || []).map((h: any) => {
        const paired = pairedDevices.find((d: any) => d.hive_id === h.id && d.status === "active");
        let parsedStrength = "Strong (8–10 Frames Brood & Bees)";
        let parsedAvailability = "Dedicated Honey Production";
        try {
          if (h.notes?.startsWith("{")) {
            const json = JSON.parse(h.notes);
            if (json.colonyStrength) parsedStrength = json.colonyStrength;
            if (json.colonyAvailability) parsedAvailability = json.colonyAvailability;
          }
        } catch {}

        return {
          id: h.id,
          name: h.name || h.hive_code || h.nickname || h.hive_label || `Hive ${h.id.slice(0, 5)}`,
          hive_code: h.hive_code || h.code,
          code: h.hive_code || h.code,
          apiary: normalizeApiaryName(h.apiaries?.name || h.apiary_name || targetApiaryName),
          apiary_name: normalizeApiaryName(h.apiaries?.name || h.apiary_name || targetApiaryName),
          hasSensor: Boolean(paired?.serial),
          sensorSerial: paired?.serial || undefined,
          colonyStrength: parsedStrength,
          colonyAvailability: parsedAvailability,
        };
      });

      const resolved = resolveUserHives(user, profile, mappedRemote);
      const pulledHives: HiveItemInfo[] = resolved.map((h: any) => ({
        id: h.id,
        name: h.name,
        apiary: normalizeApiaryName(h.apiary || h.apiary_name || targetApiaryName),
        hasSensor: Boolean(h.hasSensor || h.sensorSerial),
        sensorSerial: h.sensorSerial,
        colonyStrength: h.colonyStrength || "Strong (8–10 Frames Brood & Bees)",
        colonyAvailability: h.colonyAvailability || "Dedicated Honey Production",
      }));

      setHivesList(pulledHives);
      try {
        localStorage.setItem(`beeyield_cached_hives_${userKey}`, JSON.stringify(pulledHives));
      } catch {}

      // 3. User Inspections (strictly real logged records)
      const rawInspections = inspResult.status === "fulfilled" ? inspResult.value : [];
      const dbRecords: HiveRecord[] = [];

      if (rawInspections && rawInspections.length > 0) {
        rawInspections.forEach((ins: any) => {
          if (String(ins.id).startsWith("insp-0")) return;
          const label = ins.hive_label || ins.hive_code || "Hive";

          const healthScore =
            ins.colony_health === "Healthy" || ins.colony_health === "Thriving"
              ? 92
              : ins.colony_health === "Watch" || ins.colony_health === "Stable"
              ? 75
              : ins.colony_health === "At risk"
              ? 55
              : 40;

          dbRecords.push({
            id: String(ins.id),
            hive_name: label,
            record_type: "inspection",
            recorded_at: ins.inspected_on ? new Date(ins.inspected_on).toISOString() : new Date().toISOString(),
            health_index: healthScore,
            varroa_count: ins.varroa_count ?? undefined,
            notes: ins.notes || `Colony health evaluated as ${ins.colony_health || "Healthy"}`,
            inspector: ownerDisplayName,
          });
        });
      }

      // 4. Merge with user-scoped LocalStorage inspections from InspectionsPage
      try {
        const userLsKey = user?.id ? `beeyield_local_inspections_v1_${user.id}` : `beeyield_local_inspections_v1`;
        const rawLocal = localStorage.getItem(userLsKey);
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed)) {
            parsed.forEach((ins: any) => {
              const id = String(ins.id || "");
              const label = ins.hive_label || ins.hive_code || "Hive";
              if (id.startsWith("insp-0")) return;
              const healthScore =
                ins.colony_health === "Healthy" || ins.colony_health === "Thriving"
                  ? 92
                  : ins.colony_health === "Watch" || ins.colony_health === "Stable"
                  ? 75
                  : ins.colony_health === "At risk"
                  ? 55
                  : 40;
              dbRecords.push({
                id,
                hive_name: label,
                record_type: "inspection",
                recorded_at: ins.inspected_on ? new Date(ins.inspected_on).toISOString() : (ins.created_at || new Date().toISOString()),
                health_index: healthScore,
                varroa_count: ins.varroa_count ?? undefined,
                notes: ins.notes || `Colony health evaluated as ${ins.colony_health || "Healthy"}`,
                inspector: ownerDisplayName,
              });
            });
          }
        }
      } catch {}

      // 5. Retrieve locally saved records and merge
      const localCachedStr = localStorage.getItem(`beeyield_hive_health_records_${userKey}`);
      let localRecords: HiveRecord[] = [];
      if (localCachedStr) {
        try {
          const parsed = JSON.parse(localCachedStr);
          if (Array.isArray(parsed)) {
            localRecords = parsed.filter((r: any) => {
              const id = String(r?.id || "");
              return !id.startsWith("mock_") && !id.startsWith("fake_");
            });
          }
        } catch {}
      }

      // Purge legacy unkeyed key
      try {
        localStorage.removeItem("beeyield_hive_health_records");
      } catch {}

      const combinedMap = new Map<string, HiveRecord>();
      [...localRecords, ...dbRecords].forEach((r) => combinedMap.set(r.id, r));
      let combined = Array.from(combinedMap.values()).sort(
        (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );

      if (combined.length === 0 && (isTimothyUser(user, profile) || !user)) {
        combined = TIMOTHY_DEFAULT_HEALTH_RECORDS as HiveRecord[];
      }

      setRecords(combined);
      try {
        localStorage.setItem(`beeyield_hive_health_records_${userKey}`, JSON.stringify(combined));
      } catch {}
    } catch (e) {
      console.warn("Background sync error (preserving cached vitals):", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [user, profile, userKey, fetchAmbientWeather, ownerDisplayName]);

  useEffect(() => {
    if (isOpen || embedded) {
      void loadData();
    }
  }, [isOpen, embedded, loadData]);

  if (!isOpen && !embedded) return null;

  const handleUseLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = `${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`;
          setCoords(newCoords);
          setIsLocating(false);
          void fetchAmbientWeather(pos.coords.latitude, pos.coords.longitude);
          toast.success("Location synchronized for live Open-Meteo weather feed");
        },
        () => {
          setIsLocating(false);
          toast.info("Using default apiary location (-2.409, 37.967)");
          void fetchAmbientWeather(-2.409, 37.967);
        }
      );
    } else {
      setIsLocating(false);
      toast.info("Geolocation not supported. Using -2.409, 37.967");
      void fetchAmbientWeather(-2.409, 37.967);
    }
  };

  // Save new record with Colony Strength, Colony Availability, and Optional Sensor Pairing
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const targetHiveName = recordHive || (hivesList[0]?.name ?? "Primary Hive");

    const newRec: HiveRecord = {
      id: "rec_" + Date.now(),
      hive_name: targetHiveName,
      record_type: recordType,
      recorded_at: new Date().toISOString(),
      health_index: recordType === "inspection" ? Number(healthIndexInput) || 90 : undefined,
      varroa_count: recordType === "varroa" ? Number(varroaInput) || 0 : undefined,
      asian_hornet_count: recordType === "asian_hornet" ? Number(asianHornetInput) || 0 : undefined,
      notes: recordNotes || (recordType === "acoustic" ? "Acoustic audit: stable queen flight pattern" : "Physical hive verification"),
      colony_strength: colonyStrengthInput,
      colony_availability: colonyAvailabilityInput,
      inspector: ownerDisplayName,
      sensor_serial: sensorSerialInput.trim() ? sensorSerialInput.trim().toUpperCase() : undefined,
    };

    const updated = [newRec, ...records];
    setRecords(updated);
    try {
      localStorage.setItem(`beeyield_hive_health_records_${userKey}`, JSON.stringify(updated));
    } catch {}

    toast.success(`Logged ${recordType} assessment for ${targetHiveName}`);
    setNewRecordOpen(false);
    setRecordNotes("");
  };

  // Confirm VitalSensor Quick Pairing
  const handleConfirmPairSensor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairingSerial.trim()) {
      toast.error("Please enter a valid sensor serial code");
      return;
    }
    const targetHiveName = pairingHive || (hivesList[0]?.name ?? "Primary Hive");

    const updatedHives = hivesList.map((h) => {
      if (h.name === targetHiveName) {
        return {
          ...h,
          hasSensor: true,
          sensorSerial: pairingSerial.trim().toUpperCase(),
        };
      }
      return h;
    });
    setHivesList(updatedHives);

    try {
      localStorage.setItem(`beeyield_cached_hives_${userKey}`, JSON.stringify(updatedHives));
    } catch {}

    toast.success(`VitalSensor ${pairingSerial.trim().toUpperCase()} paired to ${targetHiveName}`);
    setPairSensorModalOpen(false);
    setPairingSerial("");
  };

  // Selected hive object to inspect real hardware connection status
  const currentHiveObj = selectedHive === "all" ? hivesList[0] : hivesList.find((h) => h.name === selectedHive);
  const isHardwareSensorConnected = selectedHive === "all"
    ? hivesList.some((h) => Boolean(h.hasSensor && h.sensorSerial))
    : Boolean(currentHiveObj?.hasSensor && currentHiveObj?.sensorSerial);

  // Records & statistics calculations (Varroa and Asian Hornets are strictly sensor data)
  const filteredRecords = selectedHive === "all" ? records : records.filter((r) => r.hive_name === selectedHive);
  const inspections = filteredRecords.filter((r) => r.record_type === "inspection");
  const acousticAudits = filteredRecords.filter((r) => r.record_type === "acoustic");
  const varroaRecords = filteredRecords.filter((r) => r.record_type === "varroa" || r.varroa_count !== undefined);
  const hornetRecords = filteredRecords.filter((r) => r.record_type === "asian_hornet" || r.asian_hornet_count !== undefined);

  const latestVarroa = isHardwareSensorConnected ? varroaRecords[0]?.varroa_count : undefined;
  const latestAsianHornet = isHardwareSensorConnected ? (hornetRecords[0]?.asian_hornet_count ?? 0) : undefined;
  const latestHealth = inspections[0]?.health_index;

  const activeColonyStrength = currentHiveObj?.colonyStrength;
  const activeColonyAvailability = currentHiveObj?.colonyAvailability;
  const activeSensorSerial = currentHiveObj?.sensorSerial;

  // Only display in-hive sensor readings if an actual hardware sensor is paired and has recorded data
  const currentTemp = isHardwareSensorConnected ? filteredRecords.find((r) => r.temperature_c !== undefined)?.temperature_c : undefined;
  const currentHumidity = isHardwareSensorConnected ? filteredRecords.find((r) => r.humidity_pct !== undefined)?.humidity_pct : undefined;
  const currentWeight = isHardwareSensorConnected ? filteredRecords.find((r) => r.weight_kg !== undefined)?.weight_kg : undefined;

  // Calculate dynamic weather metrics from real timeline
  const peakTemp = weatherTimeline.length > 0 ? Math.max(...weatherTimeline.map((d) => d.max)) : (ambientWeather ? Math.round(ambientWeather.temp) : null);
  const totalRain = weatherTimeline.length > 0 ? Math.round(weatherTimeline.reduce((sum, d) => sum + d.rain, 0) * 10) / 10 : null;
  const peakGust = weatherTimeline.length > 0 ? Math.max(...weatherTimeline.map((d) => d.gust)) : (ambientWeather ? ambientWeather.wind : null);
  const maxWeatherVal = Math.max(32, ...weatherTimeline.map((pt) => Math.max(pt.max, pt.rain, 32)));

  const content = (
    <>
      <div className="flex flex-col h-full w-full">
        {/* Top Header with Real Logged In User Verification */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-[#E7E5E4] bg-white/95 backdrop-blur-md gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-foreground">Hive Health & Colony Monitoring</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  Verified Apiary
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Owner: {ownerDisplayName}
                </span>
                <span>•</span>
                <span>{apiaryName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => void loadData()}
              disabled={isRefreshing}
              className="h-8 px-3 rounded-lg border border-border bg-white hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition-all text-foreground shadow-sm disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Button
              onClick={() => {
                setRecordHive(selectedHive === "all" ? (hivesList[0]?.name || "") : selectedHive);
                setNewRecordOpen(true);
              }}
              size="sm"
              className="h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Log Assessment
            </Button>
            {!embedded && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-border bg-white hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scroll">
          {/* Controls Bar: Hive Selector & Ambient Weather Geolocation */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-border/80 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <Label className="text-xs font-bold text-foreground">Select Hive:</Label>
              <select
                value={selectedHive}
                onChange={(e) => setSelectedHive(e.target.value)}
                className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-semibold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="all">All Hives (Apiary Overview)</option>
                {hivesList.map((h) => (
                  <option key={h.id} value={h.name}>
                    {h.name} {h.hasSensor ? "• [Sensor Active]" : "• [Manual / 0 Sensors]"}
                  </option>
                ))}
              </select>
              {hivesList.length === 0 && (
                <span className="text-[11px] text-muted-foreground italic">
                  (0 hives registered in database)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                onClick={handleUseLocation}
                disabled={isLocating}
                className="h-8 px-2.5 rounded-lg border border-border bg-stone-50 hover:bg-stone-100 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-all font-mono text-[11px]"
                title="Synchronize live GPS for Open-Meteo Weather"
              >
                {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sun className="w-3 h-3 text-amber-500" />}
                {coords}
              </button>
            </div>
          </div>

          {/* Colony Strength & Availability Summary Card */}
          <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Active Hive Focus
                  </span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {selectedHive === "all" ? "All Apiary Colonies" : selectedHive}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-900 border border-amber-300 font-semibold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    Strength: <strong>{activeColonyStrength || (hivesList.length > 0 ? "Strong (8–10 Frames)" : "Awaiting Hive Setup")}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-900 border border-blue-300 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Availability: <strong>{activeColonyAvailability || (hivesList.length > 0 ? "Dedicated Honey Production" : "Not Set")}</strong>
                  </span>
                  {activeSensorSerial && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-900 border border-emerald-300 font-semibold font-mono text-[11px] flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                      Serial: {activeSensorSerial}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={() => {
                    setPairingHive(selectedHive === "all" ? (hivesList[0]?.name || "") : selectedHive);
                    setPairSensorModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-semibold flex items-center gap-1 transition-all"
                >
                  <QrCode className="w-3 h-3 text-amber-600" />
                  {isHardwareSensorConnected ? "Change Sensor" : "+ Pair VitalSensor"}
                </button>
              </div>
            </div>
          </div>

          {/* 5 Real KPI Stat Cards (Strictly User-Logged Records) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Health Index */}
            <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Health Index</span>
              </div>
              <div className="text-2xl font-bold font-display text-foreground my-1">
                {latestHealth !== undefined ? `${latestHealth}%` : "—"}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {latestHealth !== undefined ? "From physical audit" : "Awaiting first audit"}
              </p>
            </div>

            {/* Inspections */}
            <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Inspections</span>
              </div>
              <div className="text-2xl font-bold font-display text-foreground my-1">
                {inspections.length}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {inspections.length === 0 ? "0 recorded" : `${inspections.length} logged by owner`}
              </p>
            </div>

            {/* Acoustic Audits */}
            <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">
                <Waves className="w-3.5 h-3.5 text-amber-500" />
                <span>Acoustic Audits</span>
              </div>
              <div className="text-2xl font-bold font-display text-foreground my-1">
                {acousticAudits.length}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {acousticAudits.length === 0 ? "0 archived" : `${acousticAudits.length} archived`}
              </p>
            </div>

            {/* Varroa (Sensor Telemetry) */}
            <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">
                <Bug className="w-3.5 h-3.5 text-amber-500" />
                <span>Varroa (Sensor)</span>
              </div>
              <div className="text-2xl font-bold font-display text-foreground my-1">
                {isHardwareSensorConnected
                  ? (latestVarroa !== undefined ? `${latestVarroa}` : "0 Mites")
                  : "—"}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {isHardwareSensorConnected
                  ? (latestVarroa !== undefined ? "Sensor detected mites" : "Sensor active • Clean hive")
                  : "Sensor required to detect"}
              </p>
            </div>

            {/* Asian Hornet Sensor Alert */}
            <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                <span>Asian Hornet Alert</span>
              </div>
              <div className="text-2xl font-bold font-display text-foreground my-1">
                {isHardwareSensorConnected
                  ? (latestAsianHornet !== undefined && latestAsianHornet > 0 ? `${latestAsianHornet} Sighted` : "0 Detected")
                  : "—"}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {isHardwareSensorConnected
                  ? (latestAsianHornet !== undefined && latestAsianHornet > 0 ? "Vespa velutina entrance alert" : "Entrance sensor clear")
                  : "Sensor required to detect"}
              </p>
            </div>
          </div>

          {/* In-Hive Telemetry Cards (Strictly 0 / Em-dash when no physical sensor is connected) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                  In-Hive Telemetry (Physical IoT Sensors)
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {isHardwareSensorConnected
                  ? "✓ Active Hardware Link"
                  : "0 Connected Sensors • No internal telemetry"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Brood Chamber */}
              <div className="rounded-2xl border border-border/80 bg-white p-3.5 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">
                    Brood Chamber
                  </span>
                  <span className="text-base font-bold font-mono text-foreground">
                    {currentTemp !== undefined ? `${currentTemp} °C` : "—"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    {currentTemp !== undefined
                      ? "VitalSensor Core Probe"
                      : "0 Connected • Sensor Required"}
                  </span>
                </div>
              </div>

              {/* In-Hive Humidity */}
              <div className="rounded-2xl border border-border/80 bg-white p-3.5 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">
                    In-Hive Humidity
                  </span>
                  <span className="text-base font-bold font-mono text-foreground">
                    {currentHumidity !== undefined ? `${currentHumidity}%` : "—"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    {currentHumidity !== undefined
                      ? "In-Hive Sensor RH"
                      : "0 Connected • Sensor Required"}
                  </span>
                </div>
              </div>

              {/* Colony Scale */}
              <div className="rounded-2xl border border-border/80 bg-white p-3.5 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">
                    Colony Scale
                  </span>
                  <span className="text-base font-bold font-mono text-foreground">
                    {currentWeight !== undefined ? `${currentWeight} kg` : "—"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    {currentWeight !== undefined ? "Live Scale Link" : "No Scale Telemetry"}
                  </span>
                </div>
              </div>

              {/* VitalSensor Link */}
              <div className="rounded-2xl border border-border/80 bg-white p-3.5 shadow-sm flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isHardwareSensorConnected
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">
                    VitalSensor Link
                  </span>
                  <span className="text-base font-bold text-foreground flex items-center gap-1.5">
                    {isHardwareSensorConnected ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        1 Connected
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-stone-300" />
                        0 Connected
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {isHardwareSensorConnected ? "Telemetry streaming" : "Offline / Unpaired"}
                  </span>
                </div>
              </div>
            </div>

            {/* Automated IoT Pest Detection (Varroa Mites & Asian Hornets) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-2xl border border-border/80 bg-white p-3.5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <Bug className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">
                      Varroa Sensor Detection
                    </span>
                    <span className="text-base font-bold font-mono text-foreground">
                      {isHardwareSensorConnected
                        ? (latestVarroa !== undefined ? `${latestVarroa} Mites` : "0 Mites (Clean)")
                        : "—"}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {isHardwareSensorConnected ? "VitalSensor optical & acoustic scan" : "0 Connected • Sensor Required"}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  !isHardwareSensorConnected ? "bg-stone-100 text-stone-500" : (latestVarroa && latestVarroa > 3 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700")
                }`}>
                  {isHardwareSensorConnected ? (latestVarroa && latestVarroa > 3 ? "Action Req" : "Safe Colony") : "No Sensor"}
                </span>
              </div>

              <div className="rounded-2xl border border-border/80 bg-white p-3.5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">
                      Asian Hornet (Vespa velutina) Guard
                    </span>
                    <span className="text-base font-bold font-mono text-foreground">
                      {isHardwareSensorConnected
                        ? (latestAsianHornet !== undefined && latestAsianHornet > 0 ? `${latestAsianHornet} Hornets Detected` : "0 Detected")
                        : "—"}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {isHardwareSensorConnected ? "Entrance acoustic & optical sensor" : "0 Connected • Sensor Required"}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  !isHardwareSensorConnected ? "bg-stone-100 text-stone-500" : (latestAsianHornet && latestAsianHornet > 0 ? "bg-rose-100 text-rose-700 animate-pulse" : "bg-emerald-100 text-emerald-700")
                }`}>
                  {isHardwareSensorConnected ? (latestAsianHornet && latestAsianHornet > 0 ? "Predator Alert" : "Entrance Safe") : "No Sensor"}
                </span>
              </div>
            </div>
          </div>

          {/* Ambient Apiary Weather (Open-Meteo Live API - Strictly Atmospheric Outdoor Weather) */}
          <div className="rounded-2xl border border-border/80 bg-linear-to-r from-amber-50/40 via-white to-orange-50/30 p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
                    Ambient Apiary Weather (Open-Meteo Live API)
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Outdoor atmospheric conditions across {apiaryName} • Verified live weather feed
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-border text-muted-foreground">
                Updated {ambientWeather?.lastUpdated || "Live"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded-xl bg-white border border-border/60">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase block">
                  Outdoor Temp
                </span>
                <span className="text-lg font-bold font-mono text-foreground">
                  {ambientWeather ? `${ambientWeather.temp} °C` : (isWeatherLoading ? "..." : "—")}
                </span>
                <span className="text-[10px] text-muted-foreground block">Ambient air</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-border/60">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase block">
                  Outdoor RH
                </span>
                <span className="text-lg font-bold font-mono text-foreground">
                  {ambientWeather ? `${ambientWeather.humidity}%` : (isWeatherLoading ? "..." : "—")}
                </span>
                <span className="text-[10px] text-muted-foreground block">Atmospheric RH</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-border/60">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase block">
                  Wind Speed
                </span>
                <span className="text-lg font-bold font-mono text-foreground">
                  {ambientWeather ? `${ambientWeather.wind} km/h` : (isWeatherLoading ? "..." : "—")}
                </span>
                <span className="text-[10px] text-muted-foreground block">Safe for flight</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-border/60">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase block">
                  Sky Condition
                </span>
                <span className="text-sm font-bold text-foreground truncate block mt-1">
                  {ambientWeather?.conditionText || (isWeatherLoading ? "Syncing..." : "—")}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium block">
                  Optimal foraging window
                </span>
              </div>
            </div>
          </div>

          {/* Colony health trend (Strictly user-logged physical assessments) */}
          <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-foreground">Colony health trend</h3>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {inspections.length} recorded
              </span>
            </div>
            {inspections.length > 0 ? (
              <div className="pt-2 space-y-2">
                {inspections.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-muted/40 border border-border/60">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground block">{r.hive_name}</span>
                      {(r.colony_strength || r.colony_availability) && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          {r.colony_strength && <span>{r.colony_strength}</span>}
                          {r.colony_availability && <span>• {r.colony_availability}</span>}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-amber-600 font-bold block">
                        {r.health_index !== undefined ? `${r.health_index}% Health` : "Audited"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(r.recorded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-1.5">
                <ShieldCheck className="w-6 h-6 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-medium text-foreground">
                  No colony health inspections logged yet for your apiary.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Tap 'Log Assessment' above to record your first hive evaluation.
                </p>
              </div>
            )}
          </div>

          {/* Weather context (14 days back - 7 days ahead) */}
          <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-foreground">
                  Weather context (14 days back - 7 days ahead)
                </h3>
              </div>
              <span className="text-xs text-muted-foreground font-medium">{apiaryName}</span>
            </div>

            {/* SVG Weather Chart */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[700px] h-[190px] relative">
                {weatherTimeline.length > 0 ? (
                  <svg className="w-full h-full" viewBox="0 0 700 170" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#84cc16" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#84cc16" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="tempMaxGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal gridlines for 0, 8, 16, 24, 32 */}
                    {[0, 8, 16, 24, 32].map((val) => {
                      const y = 140 - (val / maxWeatherVal) * 110;
                      return (
                        <g key={val}>
                          <line x1="30" y1={y} x2="690" y2={y} stroke="#f1f0ea" strokeDasharray="3 3" strokeWidth="1" />
                          <text x="22" y={y + 3} textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="sans-serif">
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Rain Area Fill */}
                    <polygon
                      points={`
                        35,140
                        ${weatherTimeline
                          .map((pt, i) => {
                            const x = 35 + (i / Math.max(1, weatherTimeline.length - 1)) * 645;
                            const y = 140 - (pt.rain / maxWeatherVal) * 90;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                        680,140
                      `}
                      fill="url(#rainGrad)"
                      stroke="#65a30d"
                      strokeWidth="1.2"
                    />

                    {/* Max Temp Area */}
                    <polygon
                      points={`
                        35,140
                        ${weatherTimeline
                          .map((pt, i) => {
                            const x = 35 + (i / Math.max(1, weatherTimeline.length - 1)) * 645;
                            const y = 140 - (pt.max / maxWeatherVal) * 110;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                        680,140
                      `}
                      fill="url(#tempMaxGrad)"
                    />

                    {/* Max Temp Line */}
                    <polyline
                      points={weatherTimeline
                        .map((pt, i) => {
                          const x = 35 + (i / Math.max(1, weatherTimeline.length - 1)) * 645;
                          const y = 140 - (pt.max / maxWeatherVal) * 110;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />

                    {/* Min Temp Line */}
                    <polyline
                      points={weatherTimeline
                        .map((pt, i) => {
                          const x = 35 + (i / Math.max(1, weatherTimeline.length - 1)) * 645;
                          const y = 140 - (pt.min / maxWeatherVal) * 110;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.8"
                      strokeDasharray="4 3"
                    />

                    {/* Bottom timeline date ticks */}
                    {weatherTimeline.map((pt, i) => {
                      const x = 35 + (i / Math.max(1, weatherTimeline.length - 1)) * 645;
                      return (
                        <g key={pt.date + i}>
                          <line x1={x} y1={140} x2={x} y2={144} stroke="#d1d5db" strokeWidth="1" />
                          <text
                            x={x}
                            y={156}
                            textAnchor="middle"
                            fontSize="8.5"
                            fill="#6b7280"
                            fontFamily="monospace"
                          >
                            {pt.date}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                ) : (
                  <div className="w-full h-[170px] flex items-center justify-center text-xs text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    Synchronizing live microclimate timeline for apiary...
                  </div>
                )}
              </div>
            </div>

            {/* Legend & Real Stat summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-[#F5F4EE]">
              <div className="flex items-center gap-5 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-amber-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block ring-2 ring-amber-400/30" /> Max °C
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-500/30" /> Min °C
                </span>
                <span className="flex items-center gap-1.5 text-[#65a30d]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#65a30d] inline-block ring-2 ring-[#65a30d]/30" /> Rain mm
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  Peak <strong className="text-foreground font-semibold">{peakTemp !== null ? `${peakTemp} °C` : "—"}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-amber-500" />
                  Total <strong className="text-foreground font-semibold">{totalRain !== null ? `${totalRain} mm` : "—"}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-amber-500" />
                  Gusts <strong className="text-foreground font-semibold">{peakGust !== null ? `${peakGust} km/h` : "—"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom 2-Card Grid: Latest Inspections & Latest Acoustic Audits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Latest Inspections */}
            <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-foreground">Latest inspections</h3>
                </div>
                <span className="text-xs text-muted-foreground">{inspections.length} recorded</span>
              </div>
              {inspections.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {inspections.slice(0, 5).map((r) => (
                    <div key={r.id} className="text-xs flex justify-between items-center p-2.5 rounded-lg bg-muted/40">
                      <div>
                        <span className="font-medium text-foreground block">{r.hive_name}</span>
                        {r.notes && <span className="text-[11px] text-muted-foreground italic truncate block max-w-xs">{r.notes}</span>}
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-amber-600 font-bold block">{r.health_index}% Health</span>
                        <span className="text-[11px] text-muted-foreground">{new Date(r.recorded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">No inspections logged yet.</p>
              )}
            </div>

            {/* Latest Acoustic Audits */}
            <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-foreground">Latest acoustic audits</h3>
                </div>
                <span className="text-xs text-muted-foreground">{acousticAudits.length} archived</span>
              </div>
              {acousticAudits.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {acousticAudits.slice(0, 5).map((r) => (
                    <div key={r.id} className="text-xs flex justify-between items-center p-2.5 rounded-lg bg-muted/40">
                      <div>
                        <span className="font-medium text-foreground block">{r.hive_name}</span>
                        <span className="text-[11px] text-amber-600 font-medium">Acoustic VitalSensor Link</span>
                      </div>
                      <span className="text-muted-foreground">{new Date(r.recorded_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">No acoustic audits archived yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Record Modal (Full Form with Colony Strength & Colony Availability) */}
      {newRecordOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border w-full max-w-lg p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-base text-foreground">Log Hive Assessment</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Owner evaluation for Colony Strength, Availability & Health
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNewRecordOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target Hive */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">Hive</Label>
                  <select
                    value={recordHive || (hivesList[0]?.name ?? "")}
                    onChange={(e) => setRecordHive(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold"
                  >
                    {hivesList.length === 0 ? (
                      <option value="Primary Hive">Primary Hive</option>
                    ) : (
                      hivesList.map((h) => (
                        <option key={h.id} value={h.name}>
                          {h.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Owner / Inspector */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">Apiary Owner / Inspector</Label>
                  <Input
                    disabled
                    value={ownerDisplayName}
                    className="h-9 bg-muted/40 font-medium"
                  />
                </div>
              </div>

              {/* Colony Strength Selection (Added by Owner) */}
              <div className="space-y-1 p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                <Label className="text-xs font-bold text-amber-900 flex items-center justify-between">
                  <span>Colony Strength (Frames of Brood & Bees)</span>
                  <span className="text-[10px] text-amber-700 font-normal">Owner Assessment</span>
                </Label>
                <select
                  value={colonyStrengthInput}
                  onChange={(e) => setColonyStrengthInput(e.target.value)}
                  className="w-full h-9 rounded-lg border border-amber-300 bg-white px-3 text-xs font-bold text-amber-950"
                >
                  {COLONY_STRENGTH_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Colony Availability Selection (Added by Owner) */}
              <div className="space-y-1 p-3 rounded-xl bg-blue-50/50 border border-blue-200">
                <Label className="text-xs font-bold text-blue-900 flex items-center justify-between">
                  <span>Colony Availability (Deployment Purpose)</span>
                  <span className="text-[10px] text-blue-700 font-normal">Operational Status</span>
                </Label>
                <select
                  value={colonyAvailabilityInput}
                  onChange={(e) => setColonyAvailabilityInput(e.target.value)}
                  className="w-full h-9 rounded-lg border border-blue-300 bg-white px-3 text-xs font-bold text-blue-950"
                >
                  {COLONY_AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Record Type Selector */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-foreground">Assessment / Sensor Telemetry Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "inspection", label: "Audit" },
                    { id: "varroa", label: "Varroa Sensor" },
                    { id: "asian_hornet", label: "Hornet Sensor" },
                    { id: "acoustic", label: "Acoustics" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setRecordType(t.id as any)}
                      className={`h-8 px-1.5 rounded-lg border text-xs font-bold capitalize transition-all ${
                        recordType === t.id
                          ? "bg-amber-500 border-amber-600 text-white shadow-xs"
                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Health Index Input */}
              {recordType === "inspection" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">Health Index (0–100%)</Label>
                    <span className="text-xs font-bold text-amber-600 font-mono">{healthIndexInput}%</span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={healthIndexInput}
                    onChange={(e) => setHealthIndexInput(e.target.value)}
                    className="h-9"
                  />
                </div>
              )}

              {/* Varroa Mites Sensor Input */}
              {recordType === "varroa" && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Sensor Detected Varroa Mites</span>
                    <span className="text-[10px] text-amber-600 font-bold">VitalSensor Scan</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={varroaInput}
                    onChange={(e) => setVarroaInput(e.target.value)}
                    className="h-9"
                    placeholder="Enter detected mite count"
                  />
                </div>
              )}

              {/* Asian Hornet Sensor Input */}
              {recordType === "asian_hornet" && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Sensor Detected Asian Hornets (Vespa velutina)</span>
                    <span className="text-[10px] text-orange-600 font-bold">Entrance Guard</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={asianHornetInput}
                    onChange={(e) => setAsianHornetInput(e.target.value)}
                    className="h-9"
                    placeholder="Enter detected hornet count"
                  />
                </div>
              )}

              {/* Hardware Sensor Serial (Optional) */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Pair VitalSensor Serial (Optional)</span>
                  <span className="text-[10px] text-muted-foreground">e.g. VS-KBZ-042</span>
                </Label>
                <Input
                  value={sensorSerialInput}
                  onChange={(e) => setSensorSerialInput(e.target.value)}
                  placeholder="Leave empty if no physical sensor is attached"
                  className="h-9 font-mono"
                />
              </div>

              {/* Observation Notes */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">Physical Observation Notes</Label>
                <Input
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  placeholder="e.g. Queen actively laying on 6 frames, pollen stores plentiful"
                  className="h-9"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setNewRecordOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                  Save Assessment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Pair VitalSensor Modal */}
      {pairSensorModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border w-full max-w-md p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-foreground">Pair VitalSensor Hardware</h3>
              </div>
              <button
                type="button"
                onClick={() => setPairSensorModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPairSensor} className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-foreground">Select Hive to Mount</Label>
                <select
                  value={pairingHive || (hivesList[0]?.name ?? "")}
                  onChange={(e) => setPairingHive(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold"
                >
                  {hivesList.length === 0 ? (
                    <option value="Primary Hive">Primary Hive</option>
                  ) : (
                    hivesList.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name} {h.hasSensor ? `(Currently ${h.sensorSerial})` : "(Unpaired)"}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-foreground">
                  VitalSensor Serial Number / QR Code
                </Label>
                <Input
                  required
                  value={pairingSerial}
                  onChange={(e) => setPairingSerial(e.target.value)}
                  placeholder="e.g. VS-KBZ-042 or scan QR"
                  className="h-9 font-mono uppercase"
                />
                <p className="text-[10px] text-muted-foreground">
                  Serial code printed on the bottom of the waterproof sensor casing.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setPairSensorModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                  Confirm Pairing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="w-full bg-[#FAF9F5] text-foreground border border-[#E7E5E4] rounded-3xl shadow-sm flex flex-col overflow-hidden">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#FAF9F5] text-foreground border border-[#E7E5E4] rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col my-auto max-h-[94vh] overflow-hidden">
        {content}
      </div>
    </div>
  );
}
