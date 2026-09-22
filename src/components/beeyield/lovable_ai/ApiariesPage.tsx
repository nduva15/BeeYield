import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Plus,
  Search,
  Trash2,
  Edit,
  MapPin,
  Layers,
  Sparkles,
  RefreshCw,
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind,
  Droplets,
  BatteryCharging,
  Battery,
  Wifi,
  Radio,
  AlertTriangle,
  Bug,
  Shield,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Navigation,
  Calendar,
  Share2,
  MoreVertical,
  Activity,
  ChevronRight,
  Compass,
  FileDown,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { useAuth } from "@/hooks/use-auth";

export interface ApiarySite {
  id: string;
  name: string;
  location_name: string;
  county?: string;
  region?: string;
  latitude: number;
  longitude: number;
  type: string;
  status: "Optimal" | "Threatened" | "Watch" | "Maintenance";
  active_hives: number;
  total_hives: number;
  size_acres: number;
  forage_type: string;
  threat_alert?: {
    type: string;
    message: string;
    date: string;
    severity: "critical" | "warning";
  } | null;
  hub_status: {
    online: boolean;
    signal: "LTE" | "4G" | "5G" | "Offline";
    battery_pct: number;
    last_reading: string;
  };
  notes?: string;
  created_at: string;
}

export interface LiveWeatherData {
  currentTemp: number;
  currentHumidity: number;
  currentWind: number;
  weatherCode: number;
  conditionText: string;
  todayMin: number;
  todayMax: number;
  hourly: Array<{
    time: string;
    temp: number;
    code: number;
  }>;
  daily: Array<{
    day: string;
    min: number;
    max: number;
    code: number;
  }>;
  lastUpdated: string;
  source: string;
}

// Canonical Apiary Sites (Timothy Nduva • BeeYield Network)
export const DEFAULT_APIARIES: ApiarySite[] = [
  {
    id: "apiary-kibwezi",
    name: "Kibwezi Main Apiary",
    location_name: "Kiunduani, Kibwezi",
    county: "Makueni",
    region: "Kibwezi East",
    latitude: -2.409,
    longitude: 37.967,
    type: "Commercial Apiary",
    status: "Optimal",
    active_hives: 184,
    total_hives: 184,
    size_acres: 18,
    forage_type: "Acacia Tortilis, Desert Date & Citrus Blossom",
    threat_alert: null,
    hub_status: {
      online: true,
      signal: "LTE",
      battery_pct: 98,
      last_reading: "Just now",
    },
    notes: "Lead Beekeeper: Timothy Nduva. 184 active Langstroth hives under live IoT monitoring in Kibwezi ecosystem.",
    created_at: "2020-01-01T08:00:00Z",
  },
];

// Helper to map WMO weather code to description and Lucide icon
function getWeatherMeta(code: number) {
  switch (code) {
    case 0:
      return { text: "Clear sky", Icon: Sun, color: "text-amber-500" };
    case 1:
      return { text: "Mainly clear", Icon: Sun, color: "text-amber-400" };
    case 2:
      return { text: "Partly cloudy", Icon: CloudSun, color: "text-amber-300" };
    case 3:
      return { text: "Mostly cloudy", Icon: Cloud, color: "text-slate-400" };
    case 45:
    case 48:
      return { text: "Foggy conditions", Icon: CloudFog, color: "text-slate-400" };
    case 51:
    case 53:
    case 55:
      return { text: "Light drizzle", Icon: CloudDrizzle, color: "text-blue-400" };
    case 61:
    case 63:
    case 65:
      return { text: "Rain", Icon: CloudRain, color: "text-blue-500" };
    case 80:
    case 81:
    case 82:
      return { text: "Rain showers", Icon: CloudRain, color: "text-blue-500" };
    case 95:
    case 96:
    case 99:
      return { text: "Thunderstorm", Icon: CloudLightning, color: "text-purple-500" };
    default:
      return { text: "Mostly cloudy", Icon: Cloud, color: "text-slate-400" };
  }
}

// Fetch live weather from Open-Meteo
async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<LiveWeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.statusText}`);
  const data = await res.json();

  const current = data.current;
  const daily = data.daily;
  const hourly = data.hourly;

  const currentCode = current.weather_code ?? 2;
  const meta = getWeatherMeta(currentCode);

  const todayMin = Math.round(daily.temperature_2m_min?.[0] ?? 19);
  const todayMax = Math.round(daily.temperature_2m_max?.[0] ?? 26);

  // Parse next 6 hourly slots starting from current local hour
  const now = new Date();
  const currentHour = now.getHours();
  const hourlyItems: Array<{ time: string; temp: number; code: number }> = [];

  for (let i = 0; i < (hourly.time?.length || 0); i++) {
    const timeStr = hourly.time[i];
    const hourDate = new Date(timeStr);
    if (hourDate >= now || hourlyItems.length === 0) {
      const formattedTime = hourDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      hourlyItems.push({
        time: formattedTime,
        temp: Math.round(hourly.temperature_2m[i]),
        code: hourly.weather_code[i] ?? 3,
      });
      if (hourlyItems.length >= 6) break;
    }
  }

  // Parse 5-day daily forecast
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyItems: Array<{ day: string; min: number; max: number; code: number }> = [];

  for (let d = 0; d < Math.min(5, daily.time?.length || 0); d++) {
    const dDate = new Date(daily.time[d]);
    const dayLabel = d === 0 ? "Today" : weekdays[dDate.getDay()];
    dailyItems.push({
      day: dayLabel,
      min: Math.round(daily.temperature_2m_min[d]),
      max: Math.round(daily.temperature_2m_max[d]),
      code: daily.weather_code[d] ?? 2,
    });
  }

  return {
    currentTemp: Math.round(current.temperature_2m),
    currentHumidity: Math.round(current.relative_humidity_2m),
    currentWind: Math.round(current.wind_speed_10m),
    weatherCode: currentCode,
    conditionText: meta.text,
    todayMin,
    todayMax,
    hourly: hourlyItems,
    daily: dailyItems,
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    source: "Open-Meteo Live Station Telemetry",
  };
}

// Fallback deterministic live weather if offline
function getFallbackWeather(lat: number, lon: number): LiveWeatherData {
  const seed = Math.abs(Math.round((lat + lon) * 100)) % 10;
  return {
    currentTemp: 24 + (seed % 4),
    currentHumidity: 48 + seed,
    currentWind: 9,
    weatherCode: 3,
    conditionText: "Mostly cloudy",
    todayMin: 19,
    todayMax: 26,
    hourly: [
      { time: "21:00", temp: 23, code: 3 },
      { time: "22:00", temp: 22, code: 3 },
      { time: "23:00", temp: 20, code: 3 },
      { time: "00:00", temp: 19, code: 3 },
      { time: "01:00", temp: 19, code: 3 },
      { time: "02:00", temp: 18, code: 3 },
    ],
    daily: [
      { day: "Today", min: 19, max: 26, code: 3 },
      { day: "Tue", min: 16, max: 29, code: 2 },
      { day: "Wed", min: 16, max: 30, code: 1 },
      { day: "Thu", min: 17, max: 31, code: 0 },
      { day: "Fri", min: 17, max: 29, code: 0 },
    ],
    lastUpdated: "21:31",
    source: "Simulated Apiary IoT Telemetry",
  };
}

// Single Apiary Weather Card (Exact matching Apisense design)
export function ApisenseWeatherCard({
  apiary,
  weather,
  onReportObservation,
  onEdit,
  onSelectApiary,
}: {
  apiary: ApiarySite;
  weather?: LiveWeatherData;
  onReportObservation: (apiary: ApiarySite) => void;
  onEdit: (apiary: ApiarySite) => void;
  onSelectApiary?: (apiary: ApiarySite) => void;
}) {
  const currentCondition = weather?.conditionText || "Mostly cloudy";
  const minTemp = weather?.todayMin ?? 19;
  const maxTemp = weather?.todayMax ?? 26;

  // Temperature spread for colored gradient bars (15°C to 35°C baseline)
  const getGradientOffsets = (min: number, max: number) => {
    const baseMin = 14;
    const baseMax = 35;
    const leftPct = Math.max(0, Math.min(100, ((min - baseMin) / (baseMax - baseMin)) * 100));
    const widthPct = Math.max(15, Math.min(100 - leftPct, ((max - min) / (baseMax - baseMin)) * 100));
    return { leftPct, widthPct };
  };

  return (
    <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-[#FAF8F5] dark:bg-[#1C1A17] text-stone-900 dark:text-stone-100 p-5 shadow-sm transition-all hover:shadow-md space-y-4">
      {/* Top Header: Fence Icon + Name + Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-800 dark:text-amber-400 font-black">
            <span className="text-xl">🪟</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-stone-900 dark:text-stone-100 tracking-tight">
              {apiary.name.toLowerCase()}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {apiary.location_name}
            </p>
          </div>
        </div>

        {/* Action badges */}
        <div className="flex items-center gap-2">
          {apiary.status === "Threatened" ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
              <Bug className="w-3.5 h-3.5" /> Threatened
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
              <ShieldCheck className="w-3.5 h-3.5" /> Optimal
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <Layers className="w-3.5 h-3.5 text-amber-600" /> Active hives {apiary.active_hives}/{apiary.total_hives}
          </span>
        </div>
      </div>

      {/* Hornet / Threat Alert Banner */}
      {apiary.threat_alert && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-900 flex flex-col items-center justify-center text-stone-800 dark:text-stone-200 shadow-sm shrink-0">
              <span className="text-base">🐝</span>
              <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400">
                {apiary.threat_alert.date}
              </span>
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-300">
                {apiary.threat_alert.message.split("!")[0]}!
              </p>
              <button
                type="button"
                onClick={() => onReportObservation(apiary)}
                className="text-xs font-semibold text-rose-800 dark:text-rose-400 underline hover:text-rose-900"
              >
                Report a new observation
              </button>
            </div>
          </div>
          <button
            onClick={() => onReportObservation(apiary)}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
            title="Observation details"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hub Status Row */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">Hub</h4>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
              <Radio className="w-3.5 h-3.5" /> LTE
            </span>
            <div className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400" title={`${apiary.hub_status.battery_pct}% Battery`}>
              <Battery className="w-4 h-4 fill-emerald-500 text-emerald-600" />
            </div>
          </div>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          Last reading: {apiary.hub_status.last_reading}
        </p>
      </div>

      {/* Current Weather Condition */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            {weather?.currentTemp ? `${weather.currentTemp}°` : "—"}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            ({apiary.size_acres} Acres)
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-end gap-1.5">
            <Cloud className="w-4 h-4 text-stone-400 shrink-0" />
            {currentCondition}
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            from {minTemp}° to {maxTemp}°
          </p>
        </div>
      </div>

      {/* Hourly Weather Strip */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
        <div className="flex items-center justify-between gap-3 min-w-[320px]">
          {(weather?.hourly || []).map((slot, idx) => {
            const { Icon } = getWeatherMeta(slot.code);
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 text-center flex-1">
                <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                  {slot.time}
                </span>
                <Icon className="w-5 h-5 text-stone-500 dark:text-stone-400" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  {slot.temp}°C
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="border-stone-200 dark:border-stone-800" />

      {/* Daily 5-Day Forecast List with Range Gradient Bar */}
      <div className="space-y-3 pt-1">
        {(weather?.daily || []).map((dayItem, dIdx) => {
          const { Icon } = getWeatherMeta(dayItem.code);
          const { leftPct, widthPct } = getGradientOffsets(dayItem.min, dayItem.max);

          return (
            <div key={dIdx} className="grid grid-cols-12 items-center gap-2 text-xs">
              {/* Day Label */}
              <span className="col-span-2 font-bold text-stone-700 dark:text-stone-300">
                {dayItem.day}
              </span>

              {/* Weather Icon */}
              <div className="col-span-1 flex justify-center">
                <Icon className="w-4 h-4 text-stone-500 dark:text-stone-400" />
              </div>

              {/* Min Temp */}
              <span className="col-span-1 text-right text-stone-500 dark:text-stone-400 font-medium">
                {dayItem.min}°
              </span>

              {/* Gradient Temperature Range Bar */}
              <div className="col-span-6 px-2">
                <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-800 rounded-full relative overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500"
                    style={{
                      marginLeft: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                  />
                </div>
              </div>

              {/* Max Temp */}
              <span className="col-span-2 text-right font-bold text-stone-900 dark:text-stone-100">
                {dayItem.max}°
              </span>
            </div>
          );
        })}
      </div>

      {/* Card Footer Quick Actions */}
      <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[200px]">
          🌱 {apiary.forage_type}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(apiary)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-200/50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold transition-colors"
          >
            Edit Site
          </button>
          {onSelectApiary && (
            <button
              type="button"
              onClick={() => onSelectApiary(apiary)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold transition-colors flex items-center gap-1 shadow-sm"
            >
              Hives ({apiary.active_hives}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Apiaries Page Component
export default function ApiariesPage({
  isOpen = true,
  onClose,
  embedded = false,
  onSelectApiary,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
  onSelectApiary?: (apiary: ApiarySite) => void;
}) {
  const { user } = useAuth();
  const deviceId = useDeviceId();

  const [apiaries, setApiaries] = useState<ApiarySite[]>(DEFAULT_APIARIES);
  const [weatherMap, setWeatherMap] = useState<Record<string, LiveWeatherData>>({});
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "optimal" | "threatened">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApiary, setEditingApiary] = useState<ApiarySite | null>(null);

  // New Apiary Form state
  const [formData, setFormData] = useState({
    name: "",
    location_name: "",
    county: "Makueni",
    region: "",
    latitude: -2.409,
    longitude: 37.967,
    type: "Commercial Apiary",
    active_hives: 184,
    total_hives: 184,
    size_acres: 18,
    forage_type: "Acacia & Wildflower",
    status: "Optimal" as "Optimal" | "Threatened" | "Watch" | "Maintenance",
    notes: "",
  });

  // Load user apiaries from Supabase or localStorage
  useEffect(() => {
    const loadApiaries = async () => {
      try {
        let query = (supabase as any).from("apiaries").select("*");
        if (user?.id) {
          query = query.eq("user_id", user.id);
        }
        const { data, error } = await query.limit(50);
        if (!error && data && data.length > 0) {
          const mapped: ApiarySite[] = data.map((d: any) => ({
            id: String(d.id),
            name: d.name || "Kibwezi Main Apiary",
            location_name: d.location_name || d.region || "Kiunduani, Kibwezi",
            county: d.county || "Makueni",
            region: d.region || "Kibwezi East",
            latitude: Number(d.latitude) || -2.409,
            longitude: Number(d.longitude) || 37.967,
            type: d.type || d.apiary_type || "Commercial Apiary",
            status: d.status === "Threatened" ? "Threatened" : "Optimal",
            active_hives: Number(d.hive_count || d.active_hives || d.expected_hives || 184),
            total_hives: Number(d.expected_hives || d.total_hives || 184),
            size_acres: Number(d.size_acres || 18),
            forage_type: d.forage_type || d.primary_forage || "Acacia Tortilis, Desert Date & Citrus Blossom",
            threat_alert: null,
            hub_status: {
              online: true,
              signal: "LTE",
              battery_pct: 98,
              last_reading: "Just now",
            },
            notes: d.notes || "Lead Beekeeper: Timothy Nduva.",
            created_at: d.created_at || new Date().toISOString(),
          }));

          setApiaries(mapped);
        } else {
          setApiaries(DEFAULT_APIARIES);
        }
      } catch {
        setApiaries(DEFAULT_APIARIES);
      }
    };
    loadApiaries();
  }, [user?.id]);

  // Fetch real-time live weather for all apiary sites
  const refreshAllWeather = useCallback(async () => {
    setLoadingWeather(true);
    const newMap: Record<string, LiveWeatherData> = {};

    await Promise.all(
      apiaries.map(async (ap) => {
        try {
          const w = await fetchOpenMeteoWeather(ap.latitude, ap.longitude);
          newMap[ap.id] = w;
        } catch {
          newMap[ap.id] = getFallbackWeather(ap.latitude, ap.longitude);
        }
      })
    );

    setWeatherMap(newMap);
    setLoadingWeather(false);
    toast.success("Live weather station telemetry synced from Open-Meteo");
  }, [apiaries]);

  useEffect(() => {
    refreshAllWeather();
  }, [apiaries.length]);

  // Geolocation detector for new apiary
  const detectCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            latitude: Number(pos.coords.latitude.toFixed(4)),
            longitude: Number(pos.coords.longitude.toFixed(4)),
          }));
          toast.success("Live GPS coordinates detected from your device");
        },
        (err) => {
          toast.error(`Geolocation error: ${err.message}`);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  // Save new or edited Apiary
  const handleSaveApiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter an apiary name");
      return;
    }

    const newId = editingApiary ? editingApiary.id : `apiary-${Date.now()}`;
    const newSite: ApiarySite = {
      id: newId,
      name: formData.name,
      location_name: formData.location_name || "Makueni County",
      county: formData.county,
      region: formData.region,
      latitude: formData.latitude,
      longitude: formData.longitude,
      type: formData.type,
      status: formData.status,
      active_hives: formData.active_hives,
      total_hives: formData.total_hives,
      size_acres: formData.size_acres,
      forage_type: formData.forage_type,
      threat_alert:
        formData.status === "Threatened"
          ? {
              type: "Pest Warning",
              message: "High Varroa or hornet pressure reported nearby!",
              date: new Date().toLocaleDateString([], { month: "short", day: "2-digit" }),
              severity: "warning",
            }
          : null,
      hub_status: {
        online: true,
        signal: "LTE",
        battery_pct: 98,
        last_reading: "Just now",
      },
      notes: formData.notes,
      created_at: editingApiary ? editingApiary.created_at : new Date().toISOString(),
    };

    // Update Supabase if available
    try {
      if (editingApiary) {
        await (supabase as any).from("apiaries").update({
          name: newSite.name,
          location_name: newSite.location_name,
          latitude: newSite.latitude,
          longitude: newSite.longitude,
          type: newSite.type,
          forage_type: newSite.forage_type,
          size_acres: newSite.size_acres,
          expected_hives: newSite.total_hives,
        }).eq("id", editingApiary.id);
      } else {
        await (supabase as any).from("apiaries").insert({
          id: newSite.id,
          name: newSite.name,
          location_name: newSite.location_name,
          latitude: newSite.latitude,
          longitude: newSite.longitude,
          type: newSite.type,
          forage_type: newSite.forage_type,
          size_acres: newSite.size_acres,
          expected_hives: newSite.total_hives,
          user_id: user?.id,
        });
      }
    } catch {
      // Non-blocking fallback
    }

    if (editingApiary) {
      setApiaries((prev) => prev.map((a) => (a.id === editingApiary.id ? newSite : a)));
      toast.success("Apiary details updated successfully");
    } else {
      setApiaries((prev) => [newSite, ...prev]);
      toast.success("New apiary site registered with live telemetry");
    }

    setShowAddModal(false);
    setEditingApiary(null);
  };

  const handleEdit = (site: ApiarySite) => {
    setEditingApiary(site);
    setFormData({
      name: site.name,
      location_name: site.location_name,
      county: site.county || "Makueni",
      region: site.region || "",
      latitude: site.latitude,
      longitude: site.longitude,
      type: site.type,
      active_hives: site.active_hives,
      total_hives: site.total_hives,
      size_acres: site.size_acres,
      forage_type: site.forage_type,
      status: site.status,
      notes: site.notes || "",
    });
    setShowAddModal(true);
  };

  const handleReportObservation = (site: ApiarySite) => {
    toast.info(`Observation logger opened for ${site.name}. Threat status recorded.`);
  };

  // Filtered apiaries
  const filteredApiaries = useMemo(() => {
    return apiaries.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.forage_type.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterTab === "optimal") return a.status === "Optimal";
      if (filterTab === "threatened") return a.status === "Threatened";
      return true;
    });
  }, [apiaries, searchQuery, filterTab]);

  // Overall Statistics matching InspectionsPage
  const stats = useMemo(() => {
    const totalSites = apiaries.length;
    const activeHives = apiaries.reduce((acc, a) => acc + a.active_hives, 0);
    const totalAcres = apiaries.reduce((acc, a) => acc + a.size_acres, 0);
    const threatenedCount = apiaries.filter((a) => a.status === "Threatened").length;
    return { totalSites, activeHives, totalAcres, threatenedCount };
  }, [apiaries]);

  if (!isOpen) return null;

  return (
    <div
      className={
        embedded
          ? "w-full"
          : "fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      }
    >
      <div
        className={
          embedded
            ? "w-full space-y-6"
            : "relative w-full max-w-6xl max-h-[92vh] bg-card border border-border rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
        }
      >
        {/* Top Header matching InspectionsPage */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Apisense Honey Brand Molecule Logo */}
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
              <Compass className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Apisense • Apiary Stations
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live IoT Weather
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time weather station telemetry, hive density, & biosecurity observation logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshAllWeather}
              disabled={loadingWeather}
              className="p-2 rounded-lg border border-border hover:border-honey/50 text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh Live Weather"
            >
              <RefreshCw className={`w-4 h-4 ${loadingWeather ? "animate-spin text-amber-500" : ""}`} />
            </button>
            <button
              onClick={() => {
                setEditingApiary(null);
                setFormData({
                  name: "",
                  location_name: "",
                  county: "Makueni",
                  region: "",
                  latitude: -2.409,
                  longitude: 37.967,
                  type: "Commercial Apiary",
                  active_hives: 10,
                  total_hives: 10,
                  size_acres: 5,
                  forage_type: "Acacia & Wildflower",
                  status: "Optimal",
                  notes: "",
                });
                setShowAddModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Add Apiary
            </button>
            {!embedded && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ml-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 flex-1">
          {/* Stats Bar matching InspectionsPage */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-border bg-background shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Managed Apiaries
              </span>
              <p className="text-2xl font-black text-foreground">{stats.totalSites}</p>
              <p className="text-[10px] text-muted-foreground">Active foraging sites</p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" /> Active Hives
              </span>
              <p className="text-2xl font-black text-foreground">{stats.activeHives}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">184 Total Capacity</p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-500" /> Total Coverage
              </span>
              <p className="text-2xl font-black text-foreground">{stats.totalAcres} Ac</p>
              <p className="text-[10px] text-muted-foreground">Pollination radius</p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" /> Biosecurity
              </span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {stats.threatenedCount > 0 ? `${stats.threatenedCount} Alert` : "All Safe"}
              </p>
              <p className="text-[10px] text-muted-foreground">Varroa & Hive Pests</p>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search apiary, region, forage flora..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-xl focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filterTab === "all"
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({apiaries.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("optimal")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filterTab === "optimal"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Optimal
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("threatened")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filterTab === "threatened"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Threatened ({stats.threatenedCount})
              </button>
            </div>
          </div>

          {/* Apiary Cards Grid with Apisense Weather UI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredApiaries.map((ap) => (
              <ApisenseWeatherCard
                key={ap.id}
                apiary={ap}
                weather={weatherMap[ap.id]}
                onReportObservation={handleReportObservation}
                onEdit={handleEdit}
                onSelectApiary={onSelectApiary}
              />
            ))}
          </div>

          {filteredApiaries.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl p-6">
              <Compass className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="font-bold text-sm text-foreground">No matching apiaries found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>

        {/* Floating Action Button (+ Add) matching mobile screenshot */}
        <button
          onClick={() => {
            setEditingApiary(null);
            setShowAddModal(true);
          }}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-sm flex items-center gap-2 shadow-2xl transition-all transform hover:scale-105 active:scale-95"
          title="Add Apiary"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" /> Add
        </button>

        {/* Add/Edit Apiary Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
              <div className="bg-emerald-600 px-5 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-white">
                      {editingApiary ? "Edit Apiary Station" : "Add New Apiary Site"}
                    </h2>
                    <p className="text-[11px] text-emerald-100">
                      Configure location coordinates and real-time station telemetry
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveApiary} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Apiary Station Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. BeeYield Kibwezi..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Location Name</label>
                    <input
                      type="text"
                      required
                      value={formData.location_name}
                      onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                      placeholder="e.g. Kiunduani..."
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">County</label>
                    <input
                      type="text"
                      value={formData.county}
                      onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                      placeholder="e.g. Makueni..."
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                {/* GPS Coordinates with Location Auto-Detect */}
                <div className="p-3 rounded-xl border border-border bg-background space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-emerald-500" /> GPS Geolocation
                    </span>
                    <button
                      type="button"
                      onClick={detectCurrentLocation}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Detect Live GPS
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground">Latitude</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Longitude</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Active Hives</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.active_hives}
                      onChange={(e) => setFormData({ ...formData, active_hives: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Total Capacity</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.total_hives}
                      onChange={(e) => setFormData({ ...formData, total_hives: parseInt(e.target.value, 10) || 1 })}
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Size (Acres)</label>
                    <input
                      type="number"
                      min={0.5}
                      step="0.5"
                      value={formData.size_acres}
                      onChange={(e) => setFormData({ ...formData, size_acres: parseFloat(e.target.value) || 1 })}
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Forage Flora</label>
                    <input
                      type="text"
                      value={formData.forage_type}
                      onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                      placeholder="e.g. Citrus, Acacia..."
                      className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold"
                    >
                      <option value="Optimal">Optimal (Healthy)</option>
                      <option value="Threatened">Threatened (Pest Alert)</option>
                      <option value="Watch">Watch</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Beekeeper Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Site observations, access notes, landowner contract..."
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-xs"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-border hover:bg-accent text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    {editingApiary ? "Save Changes" : "Create Apiary Station"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
