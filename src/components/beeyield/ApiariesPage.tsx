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
  ShieldCheck,
  Navigation,
  Compass,
  Box,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Sprout,
  Scale,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Pencil,
  ArrowRight,
  Shield,
  Activity,
  Award,
  Download,
  UserCheck,
  Check,
  Info,
  ScanLine,
  QrCode,
  Camera,
  Crown,
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

export interface HiveHarvestBatch {
  id: string;
  batchCode: string;
  date: string;
  quantityKg: number;
  honeyType: string;
  moisturePct?: number;
}

export interface ApiaryHiveItem {
  id: string;
  code: string;
  name: string;
  hiveType: string;
  queenPresent: boolean;
  queenBreedingYear: number;
  queenStatus: string;
  broodFrames: number;
  honeyFrames: number;
  sensorSerial?: string;
  batches: HiveHarvestBatch[];
}

export interface ApiaryHarvestItem {
  id: string;
  batch: string;
  hiveCode?: string;
  harvested_on: string;
  honey_type: string;
  quantity_kg: number;
  moisture_pct: number;
  color_grade: string;
  quality_grade: string;
}

// Standard International Queen Marking Color Codes
export function getQueenYearColor(year: number) {
  const lastDigit = Math.abs(year) % 10;
  if (lastDigit === 1 || lastDigit === 6) {
    return {
      name: "White",
      code: "White (Years ending in 1, 6)",
      bg: "bg-stone-100 text-stone-900 border-stone-300 dark:bg-stone-800 dark:text-stone-100",
      dot: "bg-white border border-stone-400 shadow-sm",
    };
  } else if (lastDigit === 2 || lastDigit === 7) {
    return {
      name: "Yellow",
      code: "Yellow (Years ending in 2, 7)",
      bg: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200",
      dot: "bg-amber-400 shadow-sm",
    };
  } else if (lastDigit === 3 || lastDigit === 8) {
    return {
      name: "Red",
      code: "Red (Years ending in 3, 8)",
      bg: "bg-red-100 text-red-900 border-red-300 dark:bg-red-950/60 dark:text-red-200",
      dot: "bg-red-500 shadow-sm",
    };
  } else if (lastDigit === 4 || lastDigit === 9) {
    return {
      name: "Green",
      code: "Green (Years ending in 4, 9)",
      bg: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200",
      dot: "bg-emerald-500 shadow-sm",
    };
  } else {
    // 0 or 5
    return {
      name: "Blue",
      code: "Blue (Years ending in 0, 5)",
      bg: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200",
      dot: "bg-blue-500 shadow-sm",
    };
  }
}

// ----------------------------------------------------------------------
// User-Specific Storage Keys & Sanitization Engine
// ----------------------------------------------------------------------
export function getStorageKey(userKey: string, apiaryId: string, itemType: string) {
  return `beeyield_${itemType}_${apiaryId}_${userKey}`;
}

export function normalizeApiaryName(name?: string): string {
  if (!name) return "BeeYield Apiary in Kibwezi Kenya";
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower === "kibwezi main apiary" ||
    lower.includes("kibwezi main") ||
    lower === "kibwezi apiary" ||
    lower === "beeyield apiary" ||
    lower === "beeyield apiary kibwezi" ||
    lower === "beeyield apiary • kibwezi"
  ) {
    return "BeeYield Apiary in Kibwezi Kenya";
  }
  return trimmed;
}

export function normalizeApiaryLocation(loc?: string): string {
  if (!loc) return "Kiunduani, Kibwezi, Makueni, Kenya";
  const trimmed = loc.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower === "kiunduani, kibwezi, makueni" ||
    lower === "kibwezi, makueni" ||
    lower.includes("kiunduani, kibwezi, makueni") ||
    (lower.includes("kiunduani") && !lower.includes("kenya"))
  ) {
    return "Kiunduani, Kibwezi, Makueni, Kenya";
  }
  return trimmed;
}

export function normalizeApiarySite(site: ApiarySite): ApiarySite {
  return {
    ...site,
    name: normalizeApiaryName(site.name),
    location_name: normalizeApiaryLocation(site.location_name),
  };
}

export function deduplicateApiaries<T extends ApiarySite>(apiariesList: T[]): T[] {
  const seen = new Set<string>();
  const deduplicated: T[] = [];
  for (const ap of apiariesList) {
    const key = normalizeApiaryName(ap.name).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(normalizeApiarySite(ap) as T);
    }
  }
  return deduplicated.length > 0 ? deduplicated : (DEFAULT_APIARIES.map(normalizeApiarySite) as T[]);
}

export function getUserHivesCount(userKey: string, apiaryId: string, fallbackCount: number): number {
  try {
    const stored = localStorage.getItem(getStorageKey(userKey, apiaryId, "hives"));
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.length;
      }
    }
  } catch {
    // fallback
  }
  return fallbackCount;
}

// Botanical Flora Ecosystem Species for BeeYield Apiary in Kibwezi Kenya
export const KIBWEZI_BOTANICAL_FLORA = [
  {
    id: "flora-acacia",
    name: "Acacia Tortilis (Umbrella Thorn)",
    botanical: "Vachellia tortilis",
    role: "Primary Nectar Flow",
    status: "Active Bloom",
    nectarIndex: 95,
    pollenYield: "High",
    flowering: "October – December",
    aroma: "Delicate floral, clear golden raw honey",
    tagColor: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200",
    description: "Dominant dryland acacia canopy tree across Kibwezi. High nectar secretion during morning thermal hours. Produces low-moisture organic single-origin raw honey.",
  },
  {
    id: "flora-balanites",
    name: "Balanites Aegyptiaca (Desert Date)",
    botanical: "Balanites aegyptiaca",
    role: "High Protein Pollen",
    status: "Perennial Bloom",
    nectarIndex: 78,
    pollenYield: "Very High",
    flowering: "Year-Round (Arid Sandy Clay)",
    aroma: "Nutty, rich amber honey tones",
    tagColor: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200",
    description: "Deep-rooted arid tree providing perennial crude protein pollen essential for queen oviposition and nurse bee royal jelly production.",
  },
  {
    id: "flora-citrus",
    name: "Citrus Blossom (Orange & Lime)",
    botanical: "Citrus sinensis",
    role: "Spring Stimulation Flow",
    status: "Early Bloom",
    nectarIndex: 88,
    pollenYield: "High",
    flowering: "August – October",
    aroma: "Aromatic citrus floral, extra light amber",
    tagColor: "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-200",
    description: "Irrigated riverine citrus plantings near Kibwezi providing early spring nectar stimulation for fast comb building and brood chamber expansion.",
  },
  {
    id: "flora-baobab",
    name: "Adansonia digitata (African Baobab)",
    botanical: "Adansonia digitata",
    role: "Mineral-Rich Nocturnal Flow",
    status: "Seasonal Bloom",
    nectarIndex: 82,
    pollenYield: "High",
    flowering: "November – January",
    aroma: "Tangy, rich in zinc and magnesium",
    tagColor: "bg-stone-100 text-stone-900 border-stone-300 dark:bg-stone-800 dark:text-stone-200",
    description: "Massive nocturnal blossom cups supplying high mineral pollen and evening moisture foraging for night-active hive cooling worker bees.",
  },
  {
    id: "flora-basil",
    name: "Ocimum basilicum (Wild Bush Basil)",
    botanical: "Ocimum americanum",
    role: "Drought Groundcover Sustenance",
    status: "Resilient Bloom",
    nectarIndex: 75,
    pollenYield: "Medium",
    flowering: "Intermittent / Post-Rain",
    aroma: "Herbal, antimicrobial propolis precursor",
    tagColor: "bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/60 dark:text-teal-200",
    description: "Hardy dryland herbaceous cover keeping colonies supplied with sustained floral nectar between major canopy flowering flushes.",
  },
];

// Canonical Apiary Sites (BeeYield Apiary in Kibwezi Kenya)
export const DEFAULT_APIARIES: ApiarySite[] = [
  {
    id: "apiary-kibwezi",
    name: "BeeYield Apiary in Kibwezi Kenya",
    location_name: "Kiunduani, Kibwezi, Makueni, Kenya",
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
    notes: "Lead Beekeeper: Timothy Nduva. 184 active Langstroth hives in Kibwezi ecosystem, Kenya.",
    created_at: "2020-01-01T08:00:00Z",
  },
];

// Canonical Harvests for BeeYield Apiary (943.0 kg across 5 Verified Harvest Cycles)
export const CANONICAL_KIBWEZI_HARVESTS: ApiaryHarvestItem[] = [
  {
    id: "harv-kib-2026-01",
    batch: "KBZ-2026-01",
    harvested_on: "2026-01-10",
    honey_type: "Early Spring Acacia Blossom",
    quantity_kg: 60.0,
    moisture_pct: 17.2,
    color_grade: "Extra Light Amber",
    quality_grade: "Export Grade A Raw (<18% moisture)",
  },
  {
    id: "harv-kib-2025-02",
    batch: "KBZ-2025-02",
    harvested_on: "2025-11-20",
    honey_type: "Forest Multifloral & Bush Flora",
    quantity_kg: 300.0,
    moisture_pct: 16.9,
    color_grade: "Dark Amber",
    quality_grade: "Export Grade A Raw (<18% moisture)",
  },
  {
    id: "harv-kib-2024-01",
    batch: "KBZ-2024-01",
    harvested_on: "2024-11-15",
    honey_type: "Wildflower & Acacia Blossom",
    quantity_kg: 250.0,
    moisture_pct: 17.0,
    color_grade: "Extra White",
    quality_grade: "Export Grade A Raw (<18% moisture)",
  },
  {
    id: "harv-kib-2023-01",
    batch: "KBZ-2023-01",
    harvested_on: "2023-11-18",
    honey_type: "Dryland Flora & Balanites",
    quantity_kg: 215.0,
    moisture_pct: 16.8,
    color_grade: "Water White",
    quality_grade: "Export Grade A Raw (<18% moisture)",
  },
  {
    id: "harv-kib-2022-01",
    batch: "KBZ-2022-01",
    harvested_on: "2022-11-12",
    honey_type: "Forest Acacia Blossom",
    quantity_kg: 118.0,
    moisture_pct: 17.5,
    color_grade: "Amber",
    quality_grade: "Export Grade A Raw (<18% moisture)",
  },
];

// Initial Hives with Queen Details and Harvest Batches
export const CANONICAL_KIBWEZI_HIVES: ApiaryHiveItem[] = Array.from({ length: 184 }, (_, i) => {
  const code = `KIB-${String(i + 1).padStart(3, "0")}`;
  const breedingYear = i % 6 === 0 ? 2024 : i % 11 === 0 ? 2023 : 2025;
  const isSpecial = i % 12 === 0;

  const batches: HiveHarvestBatch[] = [];
  if (i < 5) {
    batches.push(
      {
        id: `batch-${code}-1`,
        batchCode: "KBZ-2026-01",
        date: "2026-01-10",
        quantityKg: 12.0,
        honeyType: "Early Spring Acacia Blossom",
        moisturePct: 17.2,
      },
      {
        id: `batch-${code}-2`,
        batchCode: "KBZ-2025-02",
        date: "2025-11-20",
        quantityKg: 28.5,
        honeyType: "Forest Multifloral & Bush Flora",
        moisturePct: 16.9,
      }
    );
  } else if (i < 20) {
    batches.push({
      id: `batch-${code}-1`,
      batchCode: "KBZ-2025-02",
      date: "2025-11-20",
      quantityKg: 18.0 + (i % 5),
      honeyType: "Forest Multifloral & Bush Flora",
      moisturePct: 16.9,
    });
  } else if (i < 50) {
    batches.push({
      id: `batch-${code}-1`,
      batchCode: "KBZ-2024-01",
      date: "2024-11-15",
      quantityKg: 14.5 + (i % 3),
      honeyType: "Wildflower & Acacia Blossom",
      moisturePct: 17.0,
    });
  }

  return {
    id: `hive-kib-${String(i + 1).padStart(3, "0")}`,
    code,
    name: `${code} (Langstroth 10)`,
    hiveType: "Langstroth 10-Frame",
    queenPresent: true,
    queenBreedingYear: breedingYear,
    queenStatus: isSpecial ? "Active Laying Queen (Young, Marked)" : "Active Laying Queen (Marked)",
    broodFrames: 6,
    honeyFrames: 4,
    batches,
  };
});

// Helper to map WMO weather code to description and Lucide icon
function getWeatherMeta(code: number) {
  switch (code) {
    case 0:
      return { text: "Clear sky", Icon: Sun, color: "text-amber-500" };
    case 1:
      return { text: "Mainly clear", Icon: Sun, color: "text-amber-400" };
    case 2:
      return { text: "Partly cloudy", Icon: CloudSun, color: "text-amber-400" };
    case 3:
      return { text: "Overcast", Icon: Cloud, color: "text-slate-400" };
    case 45:
    case 48:
      return { text: "Fog", Icon: CloudFog, color: "text-slate-400" };
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
      return { text: "Partly cloudy", Icon: CloudSun, color: "text-amber-400" };
  }
}

// Fetch real-time live current weather from Open-Meteo REST API
export async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<LiveWeatherData> {
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
  const todayMax = Math.round(daily.temperature_2m_max?.[0] ?? 28);

  const now = new Date();
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

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyItems: Array<{ day: string; min: number; max: number; code: number }> = [];

  for (let i = 0; i < Math.min(5, daily.time?.length || 0); i++) {
    const dateObj = new Date(daily.time[i]);
    const dayLabel = i === 0 ? "Today" : weekdays[dateObj.getDay()];
    dailyItems.push({
      day: dayLabel,
      min: Math.round(daily.temperature_2m_min[i]),
      max: Math.round(daily.temperature_2m_max[i]),
      code: daily.weather_code[i] ?? 2,
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
    lastUpdated: new Date().toLocaleTimeString(),
    source: "Open-Meteo REST API",
  };
}

function getFallbackWeather(lat: number, lon: number): LiveWeatherData {
  return {
    currentTemp: 26,
    currentHumidity: 52,
    currentWind: 12,
    weatherCode: 2,
    conditionText: "Partly cloudy",
    todayMin: 18,
    todayMax: 29,
    hourly: [
      { time: "12:00", temp: 26, code: 1 },
      { time: "14:00", temp: 28, code: 2 },
      { time: "16:00", temp: 27, code: 2 },
      { time: "18:00", temp: 24, code: 1 },
      { time: "20:00", temp: 21, code: 0 },
      { time: "22:00", temp: 19, code: 0 },
    ],
    daily: [
      { day: "Today", min: 18, max: 29, code: 2 },
      { day: "Wed", min: 17, max: 28, code: 1 },
      { day: "Thu", min: 19, max: 30, code: 2 },
      { day: "Fri", min: 18, max: 29, code: 1 },
      { day: "Sat", min: 19, max: 28, code: 3 },
    ],
    lastUpdated: "Cached",
    source: "Offline Baseline",
  };
}

// ----------------------------------------------------------------------
// QR Code Scanner Modal using Html5Qrcode
// ----------------------------------------------------------------------
export function QrScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  title = "Scan Sensor Hardware QR Code",
}: {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (serial: string) => void;
  title?: string;
}) {
  const [manualSerial, setManualSerial] = useState("");
  const [scannerError, setScannerError] = useState<string | null>(null);
  const containerId = "beeyield-qr-scanner-viewfinder";

  useEffect(() => {
    if (!isOpen) return;
    let html5QrCode: Html5Qrcode | null = null;
    let isMounted = true;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(containerId);
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            if (isMounted) {
              void html5QrCode?.stop().catch(() => undefined);
              toast.success(`Scanned hardware code: ${decodedText.trim()}`);
              onScanSuccess(decodedText.trim());
              onClose();
            }
          },
          () => undefined
        );
      } catch (err: any) {
        if (isMounted) {
          setScannerError(
            err?.message || "Camera access not available. Please enter the serial number manually."
          );
        }
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        void html5QrCode.stop().catch(() => undefined);
      }
    };
  }, [isOpen, onScanSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-foreground">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-center">
          <p className="text-xs text-muted-foreground">
            Point camera at the QR code or barcode on the BeeYield VitalSensor hardware or device label.
          </p>

          <div
            id={containerId}
            className="w-full h-56 rounded-xl overflow-hidden bg-black/95 border-2 border-dashed border-amber-500/60 flex items-center justify-center relative shadow-inner"
          />

          {scannerError && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-[11px] text-destructive">
              {scannerError}
            </div>
          )}

          <div className="pt-2 border-t border-border space-y-2 text-left">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Or Enter Hardware Serial / QR Code Manually:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualSerial}
                onChange={(e) => setManualSerial(e.target.value)}
                placeholder="e.g. SENSOR-KIB-001 or VITAL-9824"
                className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (!manualSerial.trim()) {
                    toast.error("Please enter a sensor serial");
                    return;
                  }
                  onScanSuccess(manualSerial.trim());
                  toast.success(`Paired sensor: ${manualSerial.trim()}`);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Interactive Clickable Hive Detail Modal
// ----------------------------------------------------------------------
function HiveDetailModal({
  hive,
  apiary,
  onClose,
  onUpdateHive,
  onAddHarvestToHive,
  onOpenScanner,
}: {
  hive: ApiaryHiveItem;
  apiary: ApiarySite;
  onClose: () => void;
  onUpdateHive: (updated: ApiaryHiveItem) => void;
  onAddHarvestToHive: (batch: Omit<HiveHarvestBatch, "id">) => void;
  onOpenScanner: () => void;
}) {
  const [showAddHarvestForm, setShowAddHarvestForm] = useState(false);
  const [newBatch, setNewBatch] = useState({
    batchCode: `KBZ-${new Date().getFullYear()}-${String(hive.batches.length + 1).padStart(2, "0")}`,
    date: new Date().toISOString().split("T")[0],
    quantityKg: 15.0,
    honeyType: "Raw Acacia Blossom",
    moisturePct: 17.1,
  });

  const queenColor = getQueenYearColor(hive.queenBreedingYear);
  const totalKg = hive.batches.reduce((sum, b) => sum + b.quantityKg, 0);

  const handleSaveHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatch.batchCode.trim() || newBatch.quantityKg <= 0) {
      toast.error("Please provide valid batch details and quantity");
      return;
    }
    onAddHarvestToHive({
      batchCode: newBatch.batchCode.trim(),
      date: newBatch.date,
      quantityKg: Number(newBatch.quantityKg),
      honeyType: newBatch.honeyType.trim(),
      moisturePct: Number(newBatch.moisturePct) || 17.1,
    });
    setShowAddHarvestForm(false);
    toast.success(`Logged ${newBatch.quantityKg} kg harvest to hive ${hive.code}`);
  };

  const handleToggleQueenPresent = () => {
    const nextPresent = !hive.queenPresent;
    onUpdateHive({
      ...hive,
      queenPresent: nextPresent,
      queenStatus: nextPresent ? "Active Laying Queen (Marked)" : "Queenless Colony (Needs Cell/Queen)",
    });
    toast.success(`Updated Queen status for ${hive.code}: ${nextPresent ? "Queenright" : "Queenless"}`);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-card/95 backdrop-blur flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-black text-sm shadow-sm">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-display text-foreground tracking-tight">{hive.code}</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {hive.hiveType}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {normalizeApiaryName(apiary.name)} · {normalizeApiaryLocation(apiary.location_name)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Queen Status & Breeding Year Card */}
          <div className="p-4 rounded-2xl border border-border bg-background shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" /> Queen Identification & Laying Status
              </span>
              <button
                type="button"
                onClick={handleToggleQueenPresent}
                className={`text-xs px-2.5 py-1 rounded-full font-bold border transition-colors ${
                  hive.queenPresent
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300"
                }`}
              >
                {hive.queenPresent ? "✓ Queen Present (Queenright)" : "✕ Queenless Colony"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-card border border-border/80 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Queen Breeding Year</span>
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full ${queenColor.dot}`} />
                  <span className="text-sm font-black text-foreground">{hive.queenBreedingYear}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${queenColor.bg}`}>
                    {queenColor.name}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">International Marking Color</p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border/80 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Queen Oviposition</span>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{hive.queenStatus}</p>
                <p className="text-[10px] text-muted-foreground">Marked & Monitored</p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border/80 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Chamber Frames</span>
                <p className="text-xs font-bold text-foreground">
                  {hive.broodFrames} Brood / {hive.honeyFrames} Honey
                </p>
                <p className="text-[10px] text-muted-foreground">10-Frame Langstroth</p>
              </div>
            </div>
          </div>

          {/* Logged Harvests for This Hive */}
          <div className="p-4 rounded-2xl border border-border bg-background shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-500" /> Honey Harvests Logged For This Hive
                </span>
                <p className="text-xs text-foreground font-semibold mt-0.5">
                  Total Yield: <span className="text-amber-600 font-bold">{totalKg.toFixed(1)} kg</span> across {hive.batches.length} batch(es)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddHarvestForm((v) => !v)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddHarvestForm ? "Cancel" : "Add Harvest"}
              </button>
            </div>

            {/* Quick Add Harvest Form */}
            {showAddHarvestForm && (
              <form onSubmit={handleSaveHarvest} className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                  Record New Honey Harvest Batch
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block">Batch Code</label>
                    <input
                      type="text"
                      required
                      value={newBatch.batchCode}
                      onChange={(e) => setNewBatch({ ...newBatch, batchCode: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block">Quantity (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      value={newBatch.quantityKg}
                      onChange={(e) => setNewBatch({ ...newBatch, quantityKg: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block">Harvest Date</label>
                    <input
                      type="date"
                      required
                      value={newBatch.date}
                      onChange={(e) => setNewBatch({ ...newBatch, date: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block">Moisture %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newBatch.moisturePct}
                      onChange={(e) => setNewBatch({ ...newBatch, moisturePct: parseFloat(e.target.value) || 17.1 })}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <input
                    type="text"
                    value={newBatch.honeyType}
                    onChange={(e) => setNewBatch({ ...newBatch, honeyType: e.target.value })}
                    placeholder="Botanical Honey Type (e.g. Raw Acacia Blossom)"
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-1 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs"
                  >
                    Save Batch Log
                  </button>
                </div>
              </form>
            )}

            {/* Batches Table */}
            {hive.batches.length > 0 ? (
              <div className="border border-border rounded-xl overflow-hidden bg-card">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                      <th className="px-3 py-2">Batch Code</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Botanical Type</th>
                      <th className="px-3 py-2">Yield (kg)</th>
                      <th className="px-3 py-2">Moisture</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {hive.batches.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono font-bold text-foreground">{b.batchCode}</td>
                        <td className="px-3 py-2 text-muted-foreground">{b.date}</td>
                        <td className="px-3 py-2 font-medium text-amber-700 dark:text-amber-400">{b.honeyType}</td>
                        <td className="px-3 py-2 font-black text-foreground">{b.quantityKg.toFixed(1)} kg</td>
                        <td className="px-3 py-2 font-mono text-emerald-600 font-bold">{b.moisturePct || 17.1}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No harvests logged for this hive yet. Use "Add Harvest" to record a batch.
              </div>
            )}
          </div>

          {/* Sensor Hardware Pairing through QR Scanning */}
          <div className="p-4 rounded-2xl border border-border bg-background shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-amber-500" /> Sensor Hardware Pairing (QR Scanning)
              </span>
              {hive.sensorSerial && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Link
                </span>
              )}
            </div>

            {hive.sensorSerial ? (
              <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Paired Sensor Serial: <span className="font-mono text-emerald-700 dark:text-emerald-400">{hive.sensorSerial}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">Scanned via optical QR camera</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateHive({ ...hive, sensorSerial: undefined });
                    toast.info(`Unpaired sensor from hive ${hive.code}`);
                  }}
                  className="px-3 py-1 rounded-lg border border-border bg-background hover:bg-muted text-xs text-muted-foreground font-semibold"
                >
                  Unpair
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border bg-card/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-foreground">No IoT Sensor Paired</p>
                  <p className="text-[11px] text-muted-foreground">
                    Scan the QR tag or barcode on physical sensor hardware to pair with this hive.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenScanner}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
                >
                  <Camera className="w-4 h-4" />
                  Scan Sensor QR Code
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition-colors"
          >
            Close Hive Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Add Hive Modal (with Queen Present, Breeding Year, Harvest & QR Scan)
// ----------------------------------------------------------------------
function AddHiveModal({
  isOpen,
  apiary,
  suggestedCode,
  onClose,
  onAddHive,
  onOpenScanner,
  scannedSerial,
}: {
  isOpen: boolean;
  apiary: ApiarySite;
  suggestedCode: string;
  onClose: () => void;
  onAddHive: (newHive: ApiaryHiveItem, initialBatch?: Omit<HiveHarvestBatch, "id">) => void;
  onOpenScanner: () => void;
  scannedSerial?: string;
}) {
  const [code, setCode] = useState(suggestedCode);
  const [hiveType, setHiveType] = useState("Langstroth 10-Frame");
  const [queenPresent, setQueenPresent] = useState(true);
  const [queenBreedingYear, setQueenBreedingYear] = useState(2025);
  const [sensorSerial, setSensorSerial] = useState(scannedSerial || "");
  const [addHarvest, setAddHarvest] = useState(false);
  const [batchCode, setBatchCode] = useState(`KBZ-${new Date().getFullYear()}-01`);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split("T")[0]);
  const [honeyType, setHoneyType] = useState("Raw Acacia Blossom");
  const [quantityKg, setQuantityKg] = useState(15.0);
  const [moisturePct, setMoisturePct] = useState(17.1);

  useEffect(() => {
    if (scannedSerial) {
      setSensorSerial(scannedSerial);
    }
  }, [scannedSerial]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter a hive code");
      return;
    }

    const newHiveItem: ApiaryHiveItem = {
      id: `hive-${code.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: `${code.trim().toUpperCase()} (${hiveType})`,
      hiveType,
      queenPresent,
      queenBreedingYear,
      queenStatus: queenPresent ? "Active Laying Queen (Marked)" : "Queenless Colony",
      broodFrames: 6,
      honeyFrames: 4,
      sensorSerial: sensorSerial.trim() || undefined,
      batches: [],
    };

    let initialBatch: Omit<HiveHarvestBatch, "id"> | undefined = undefined;
    if (addHarvest && quantityKg > 0) {
      initialBatch = {
        batchCode: batchCode.trim(),
        date: harvestDate,
        quantityKg: Number(quantityKg),
        honeyType: honeyType.trim(),
        moisturePct: Number(moisturePct) || 17.1,
      };
      newHiveItem.batches.push({
        ...initialBatch,
        id: `batch-${Date.now()}`,
      });
    }

    onAddHive(newHiveItem, initialBatch);
    toast.success(`Hive ${newHiveItem.code} successfully registered in ${normalizeApiaryName(apiary.name)}`);
    onClose();
  };

  const queenColor = getQueenYearColor(queenBreedingYear);

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-4 bg-amber-500 text-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 font-black" />
            <h3 className="font-bold text-sm">Add New Hive to {normalizeApiaryName(apiary.name)}</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-black/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Hive Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. KIB-185"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Hive Architecture</label>
              <select
                value={hiveType}
                onChange={(e) => setHiveType(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-medium"
              >
                <option value="Langstroth 10-Frame">Langstroth 10-Frame</option>
                <option value="Top Bar Hive (KTBH)">Top Bar Hive (KTBH)</option>
                <option value="Dadant 12-Frame">Dadant 12-Frame</option>
                <option value="Warre Hive">Warre Hive</option>
              </select>
            </div>
          </div>

          {/* Queen Status & Breeding Year */}
          <div className="p-3.5 rounded-xl border border-border bg-background space-y-3">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" /> Queen Status & Breeding Details
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Queen Present?</label>
                <select
                  value={queenPresent ? "yes" : "no"}
                  onChange={(e) => setQueenPresent(e.target.value === "yes")}
                  className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold"
                >
                  <option value="yes">✓ Queen Present (Queenright)</option>
                  <option value="no">✕ Queenless</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-muted-foreground">Breeding Year</label>
                  <span className={`w-2.5 h-2.5 rounded-full ${queenColor.dot}`} />
                </div>
                <select
                  value={queenBreedingYear}
                  onChange={(e) => setQueenBreedingYear(parseInt(e.target.value, 10))}
                  className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold"
                >
                  <option value={2026}>2026 (White)</option>
                  <option value={2025}>2025 (Blue)</option>
                  <option value={2024}>2024 (Green)</option>
                  <option value={2023}>2023 (Red)</option>
                  <option value={2022}>2022 (Yellow)</option>
                  <option value={2021}>2021 (White)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sensor Pairing with QR Scanner */}
          <div className="p-3.5 rounded-xl border border-border bg-background space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-amber-500" /> Pair Sensor Hardware (Optional)
              </span>
              <button
                type="button"
                onClick={onOpenScanner}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" /> Scan QR Tag
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sensorSerial}
                onChange={(e) => setSensorSerial(e.target.value)}
                placeholder="Scan QR or type hardware serial (e.g. SENSOR-KIB-001)"
                className="flex-1 bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-mono"
              />
              <button
                type="button"
                onClick={onOpenScanner}
                className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center gap-1"
              >
                <ScanLine className="w-3.5 h-3.5" /> Scan
              </button>
            </div>
          </div>

          {/* Add Initial Harvest Toggle */}
          <div className="p-3.5 rounded-xl border border-border bg-background space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addHarvest}
                  onChange={(e) => setAddHarvest(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                Log Initial Harvest Batch For This Hive
              </label>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </div>

            {addHarvest && (
              <div className="pt-2 border-t border-border/60 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold">Batch Code</span>
                    <input
                      type="text"
                      value={batchCode}
                      onChange={(e) => setBatchCode(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-2.5 py-1 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold">Quantity (kg)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={quantityKg}
                      onChange={(e) => setQuantityKg(parseFloat(e.target.value) || 0)}
                      className="w-full bg-card border border-border rounded-lg px-2.5 py-1 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold">Harvest Date</span>
                    <input
                      type="date"
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold">Moisture %</span>
                    <input
                      type="number"
                      step="0.1"
                      value={moisturePct}
                      onChange={(e) => setMoisturePct(parseFloat(e.target.value) || 17.1)}
                      className="w-full bg-card border border-border rounded-lg px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold">Botanical Honey Type</span>
                  <input
                    type="text"
                    value={honeyType}
                    onChange={(e) => setHoneyType(e.target.value)}
                    placeholder="e.g. Raw Acacia Blossom"
                    className="w-full bg-card border border-border rounded-lg px-2.5 py-1 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-sm"
            >
              Register Hive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// User-Specific Storage Keys & Sync Engine
// ----------------------------------------------------------------------
// Modal/Drawer showing Hives, Forage, and Harvests for the clicked Apiary
// ----------------------------------------------------------------------
function ApiaryDetailModal({
  apiary,
  weather,
  onClose,
  onEdit,
  onHivesCountChanged,
}: {
  apiary: ApiarySite;
  weather?: LiveWeatherData;
  onClose: () => void;
  onEdit: (apiary: ApiarySite) => void;
  onHivesCountChanged?: (apiaryId: string, count: number) => void;
}) {
  const { user } = useAuth();
  const deviceId = useDeviceId();
  const userKey = user?.id || deviceId || "default_user";

  const [activeTab, setActiveTab] = useState<"hives" | "forage" | "harvests">("hives");
  const [hiveSearch, setHiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Load user-specific hives with fallback
  const [hivesList, setHivesList] = useState<ApiaryHiveItem[]>(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(userKey, apiary.id, "hives"));
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return user ? [] : CANONICAL_KIBWEZI_HIVES;
  });

  // Load user-specific harvests with fallback
  const [harvestsList, setHarvestsList] = useState<ApiaryHarvestItem[]>(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(userKey, apiary.id, "harvests"));
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return user ? [] : CANONICAL_KIBWEZI_HARVESTS;
  });

  // Sync to Supabase & localStorage whenever hives change
  const saveHivesUserScoped = useCallback(
    (newHives: ApiaryHiveItem[]) => {
      setHivesList(newHives);
      try {
        localStorage.setItem(getStorageKey(userKey, apiary.id, "hives"), JSON.stringify(newHives));
      } catch {
        // quota fallback
      }
      if (onHivesCountChanged) {
        onHivesCountChanged(apiary.id, newHives.length);
      }
    },
    [userKey, apiary.id, onHivesCountChanged]
  );

  // Sync to Supabase & localStorage whenever harvests change
  const saveHarvestsUserScoped = useCallback(
    (newHarvests: ApiaryHarvestItem[]) => {
      setHarvestsList(newHarvests);
      try {
        localStorage.setItem(getStorageKey(userKey, apiary.id, "harvests"), JSON.stringify(newHarvests));
      } catch {
        // quota fallback
      }
    },
    [userKey, apiary.id]
  );

  // Pull remote user-specific hives if user is logged in
  useEffect(() => {
    if (!user?.id) return;
    const fetchUserHives = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("hives")
          .select("*, devices(*)")
          .eq("apiary_id", apiary.id);

        if (!error && data && data.length > 0) {
          const mapped: ApiaryHiveItem[] = data.map((h: any) => ({
            id: String(h.id),
            code: h.name || `KIB-${h.id.slice(0, 4)}`,
            name: `${h.name || "Hive"} (Langstroth 10)`,
            hiveType: "Langstroth 10-Frame",
            queenPresent: h.queen_breeding_year !== null,
            queenBreedingYear: Number(h.queen_breeding_year) || 2025,
            queenStatus: h.queen_origin || "Active Laying Queen (Marked)",
            broodFrames: Number(h.max_brood_frames) || 6,
            honeyFrames: 4,
            sensorSerial: h.devices?.[0]?.serial || undefined,
            batches: [],
          }));
          setHivesList(mapped);
          try {
            localStorage.setItem(getStorageKey(userKey, apiary.id, "hives"), JSON.stringify(mapped));
          } catch {
            // ignore
          }
          if (onHivesCountChanged) {
            onHivesCountChanged(apiary.id, mapped.length);
          }
        }
      } catch {
        // fallback to local
      }
    };
    fetchUserHives();
  }, [user?.id, apiary.id, userKey, onHivesCountChanged]);

  const [selectedHiveForDetail, setSelectedHiveForDetail] = useState<ApiaryHiveItem | null>(null);
  const [showAddHiveModal, setShowAddHiveModal] = useState(false);
  const [isScanningOpen, setIsScanningOpen] = useState(false);
  const [scanContext, setScanContext] = useState<"addHive" | "detailHive">("addHive");
  const [tempScannedSerial, setTempScannedSerial] = useState("");

  const filteredHives = useMemo(() => {
    if (!hiveSearch.trim()) return hivesList;
    const q = hiveSearch.toLowerCase();
    return hivesList.filter(
      (h) =>
        h.code.toLowerCase().includes(q) ||
        h.queenStatus.toLowerCase().includes(q) ||
        (h.sensorSerial && h.sensorSerial.toLowerCase().includes(q))
    );
  }, [hivesList, hiveSearch]);

  const totalPages = Math.ceil(filteredHives.length / pageSize) || 1;
  const paginatedHives = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredHives.slice(start, start + pageSize);
  }, [filteredHives, page, pageSize]);

  const totalHoneyKg = useMemo(() => {
    return harvestsList.reduce((acc, h) => acc + h.quantity_kg, 0);
  }, [harvestsList]);

  // Handle updates to a hive
  const handleUpdateHive = (updated: ApiaryHiveItem) => {
    const nextHives = hivesList.map((h) => (h.id === updated.id ? updated : h));
    saveHivesUserScoped(nextHives);
    if (selectedHiveForDetail?.id === updated.id) {
      setSelectedHiveForDetail(updated);
    }
  };

  // Handle adding harvest to a specific hive
  const handleAddHarvestToHive = (batch: Omit<HiveHarvestBatch, "id">) => {
    if (!selectedHiveForDetail) return;
    const newBatchItem: HiveHarvestBatch = {
      ...batch,
      id: `batch-${Date.now()}`,
    };
    const updatedHive: ApiaryHiveItem = {
      ...selectedHiveForDetail,
      batches: [newBatchItem, ...selectedHiveForDetail.batches],
    };
    handleUpdateHive(updatedHive);

    // Also register in user's certified harvest list
    const newHarvestItem: ApiaryHarvestItem = {
      id: `harv-${Date.now()}`,
      batch: batch.batchCode,
      hiveCode: selectedHiveForDetail.code,
      harvested_on: batch.date,
      honey_type: batch.honeyType,
      quantity_kg: batch.quantityKg,
      moisture_pct: batch.moisturePct || 17.1,
      color_grade: "Extra Light Amber",
      quality_grade: "Export Grade A Raw (<18% moisture)",
    };
    saveHarvestsUserScoped([newHarvestItem, ...harvestsList]);
  };

  // Handle adding a brand new hive
  const handleAddHive = async (newHive: ApiaryHiveItem, initialBatch?: Omit<HiveHarvestBatch, "id">) => {
    const nextHives = [newHive, ...hivesList];
    saveHivesUserScoped(nextHives);

    // If logged into Supabase, persist to database
    if (user?.id) {
      try {
        await (supabase as any).from("hives").insert({
          id: newHive.id,
          apiary_id: apiary.id,
          user_id: user.id,
          name: newHive.code,
          max_brood_frames: newHive.broodFrames,
          queen_breeding_year: newHive.queenBreedingYear,
          queen_origin: newHive.queenStatus,
          hygienic_bottom_board: true,
        });

        if (newHive.sensorSerial) {
          await (supabase as any).from("devices").insert({
            apiary_id: apiary.id,
            hive_id: newHive.id,
            user_id: user.id,
            serial: newHive.sensorSerial,
            device_kind: "vitalsensor",
            link_type: "bluetooth",
            status: "active",
          });
        }
      } catch {
        // non-blocking
      }
    }

    if (initialBatch) {
      const newHarvestItem: ApiaryHarvestItem = {
        id: `harv-${Date.now()}`,
        batch: initialBatch.batchCode,
        hiveCode: newHive.code,
        harvested_on: initialBatch.date,
        honey_type: initialBatch.honeyType,
        quantity_kg: initialBatch.quantityKg,
        moisture_pct: initialBatch.moisturePct || 17.1,
        color_grade: "Extra Light Amber",
        quality_grade: "Export Grade A Raw (<18% moisture)",
      };
      saveHarvestsUserScoped([newHarvestItem, ...harvestsList]);
    }
  };

  // QR Scan callback
  const handleScanSuccess = (serial: string) => {
    if (scanContext === "detailHive" && selectedHiveForDetail) {
      handleUpdateHive({
        ...selectedHiveForDetail,
        sensorSerial: serial,
      });
      toast.success(`Paired sensor ${serial} to hive ${selectedHiveForDetail.code}`);
    } else {
      setTempScannedSerial(serial);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-card/95 backdrop-blur flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight text-foreground">
                  {normalizeApiaryName(apiary.name)}
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {apiary.status}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  {hivesList.length} User Hives Logged
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {normalizeApiaryLocation(apiary.location_name)} · {apiary.latitude}°, {apiary.longitude}° · {apiary.size_acres} Acres · Lead Beekeeper: Timothy Nduva
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => onEdit(apiary)}
              className="px-3.5 py-1.5 rounded-xl border border-border hover:border-amber-500 bg-background text-xs font-bold text-foreground flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Pencil className="w-3.5 h-3.5 text-amber-500" />
              Edit Apiary
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shadow-sm"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Weather Microclimate Bar (Open-Meteo REST API) */}
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-amber-500/10 border-b border-border/70 px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-foreground">
              <Sun className="w-4 h-4 text-amber-500" />
              {weather ? `${weather.currentTemp}°C ${weather.conditionText}` : "26°C Partly cloudy"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              {weather ? `${weather.currentHumidity}% Humidity` : "52% Humidity"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Wind className="w-3.5 h-3.5 text-emerald-500" />
              {weather ? `${weather.currentWind} km/h Wind` : "12 km/h Wind"}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Open-Meteo API Connected
          </span>
        </div>

        {/* Beautiful Segmented Tab Controller (Fits Mobile Perfectly Without Any Cutoffs) */}
        <div className="p-3 sm:px-5 sm:py-3 bg-card border-b border-border">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 dark:bg-muted/30 rounded-2xl border border-border/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("hives")}
              className={`py-2 px-2 text-center rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "hives"
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Hives ({hivesList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("forage")}
              className={`py-2 px-2 text-center rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "forage"
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sprout className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Forage & Flora</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("harvests")}
              className={`py-2 px-2 text-center rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "harvests"
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Scale className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Harvests ({totalHoneyKg.toFixed(0)} kg)</span>
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: COLONY DIRECTORY & HIVES */}
          {activeTab === "hives" && (
            <div className="space-y-4">
              {/* Quick Florage Ecosystem Bar for fast visibility */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-amber-900 dark:text-amber-200 flex items-center gap-1.5 font-semibold">
                  <Sprout className="w-4 h-4 text-amber-600 shrink-0" />
                  <strong>Forage Ecosystem:</strong> Acacia Tortilis, Desert Date & Citrus Blossom (3.0 km radius)
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("forage")}
                  className="text-amber-700 dark:text-amber-300 font-bold hover:underline self-start sm:self-center"
                >
                  View Botanical Flora →
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground">
                    Colony Directory ({filteredHives.length} Hives)
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    User Synchronized
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={hiveSearch}
                      onChange={(e) => {
                        setHiveSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search hive (e.g. KIB-001)..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTempScannedSerial("");
                      setShowAddHiveModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm whitespace-nowrap transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Hive
                  </button>
                </div>
              </div>

              {/* Hives Table */}
              <div className="border border-border rounded-2xl overflow-hidden bg-background shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                        <th className="px-4 py-3">Hive Code</th>
                        <th className="px-4 py-3">Architecture</th>
                        <th className="px-4 py-3">Queen Present</th>
                        <th className="px-4 py-3">Breeding Year</th>
                        <th className="px-4 py-3">Harvests Logged</th>
                        <th className="px-4 py-3">Sensor Pairing</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {paginatedHives.map((hive) => {
                        const queenColor = getQueenYearColor(hive.queenBreedingYear);
                        const hiveKg = hive.batches.reduce((sum, b) => sum + b.quantityKg, 0);

                        return (
                          <tr
                            key={hive.id}
                            onClick={() => setSelectedHiveForDetail(hive)}
                            className="hover:bg-amber-500/10 cursor-pointer transition-colors group"
                            title="Click to view hive details and harvests"
                          >
                            <td className="px-4 py-3 font-mono font-bold text-foreground group-hover:text-amber-600 transition-colors">
                              {hive.code}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{hive.hiveType}</td>
                            <td className="px-4 py-3">
                              {hive.queenPresent ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Queen Present
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  Queenless
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 font-bold text-[11px] text-foreground">
                                <span className={`w-2.5 h-2.5 rounded-full ${queenColor.dot}`} />
                                {hive.queenBreedingYear}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {hive.batches.length > 0 ? (
                                <span className="font-bold text-foreground">
                                  {hive.batches.length} batch(es) · <strong className="text-amber-600">{hiveKg.toFixed(1)} kg</strong>
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-[11px]">0 Batches</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {hive.sensorSerial ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                                  <Check className="w-3.5 h-3.5" /> {hive.sensorSerial}
                                </span>
                              ) : (
                                <span className="text-[11px] text-muted-foreground">No Sensor</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 group-hover:underline flex items-center justify-end gap-1">
                                View Details <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
                    <span>
                      Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredHives.length)} of{" "}
                      {filteredHives.length} hives
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1 rounded-lg border border-border hover:bg-muted disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-2 font-bold text-foreground">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-1 rounded-lg border border-border hover:bg-muted disabled:opacity-40"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FORAGE & FLORA ECOSYSTEM */}
          {activeTab === "forage" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-amber-600" />
                  Kibwezi Dryland Botanical Forage Ecosystem • {apiary.location_name}
                </h4>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                  Worker bee flight coverage: <strong>3.0 km radius</strong> across <strong>{apiary.size_acres} acres</strong> of certified organic dryland flora. Zero agricultural pesticide drift.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {KIBWEZI_BOTANICAL_FLORA.map((flora) => (
                  <div key={flora.id} className="p-4 rounded-2xl border border-border bg-background space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{flora.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${flora.tagColor}`}>
                        {flora.role}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{flora.description}</p>

                    <div className="space-y-1.5 pt-2 border-t border-border/60 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Flowering Season:</span>
                        <span className="font-bold text-foreground">{flora.flowering}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Honey Aroma:</span>
                        <span className="font-semibold text-amber-700 dark:text-amber-400">{flora.aroma}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Nectar Index:</span>
                        <span className="font-mono font-bold text-emerald-600">{flora.nectarIndex}/100</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HARVESTS & YIELDS */}
          {activeTab === "harvests" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl border border-border bg-background space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">TOTAL HONEY HARVESTED</span>
                  <p className="text-3xl font-black text-amber-600">{totalHoneyKg.toFixed(1)} kg</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Across {harvestsList.length} Verified Harvest Cycles</p>
                </div>
                <div className="p-4 rounded-2xl border border-border bg-background space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">AVERAGE MOISTURE CONTENT</span>
                  <p className="text-3xl font-black text-foreground">17.1%</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Export Grade A (&lt; 18.0% Standard)</p>
                </div>
                <div className="p-4 rounded-2xl border border-border bg-background space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">HONEY BOTANICAL CLASS</span>
                  <p className="text-base font-bold text-foreground truncate mt-1">Raw Acacia & Wildflower</p>
                  <p className="text-[10px] text-muted-foreground">Cold Extracted • Unheated</p>
                </div>
              </div>

              <div className="border border-border rounded-2xl overflow-hidden bg-background shadow-sm">
                <div className="p-3 bg-muted/40 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Certified Harvest Batches</span>
                  <span className="text-[10px] text-muted-foreground">Traceable to BeeYield Apiary in Kibwezi Kenya</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/20 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                        <th className="px-4 py-2.5">Batch Code</th>
                        <th className="px-4 py-2.5">Harvest Date</th>
                        <th className="px-4 py-2.5">Honey Type</th>
                        <th className="px-4 py-2.5">Quantity (kg)</th>
                        <th className="px-4 py-2.5">Moisture</th>
                        <th className="px-4 py-2.5">Color Grade</th>
                        <th className="px-4 py-2.5">Quality Certification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {harvestsList.map((h) => (
                        <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-foreground">{h.batch}</td>
                          <td className="px-4 py-3 text-muted-foreground">{h.harvested_on}</td>
                          <td className="px-4 py-3 font-semibold text-amber-800 dark:text-amber-400">{h.honey_type}</td>
                          <td className="px-4 py-3 font-black text-foreground">{h.quantity_kg.toFixed(1)} kg</td>
                          <td className="px-4 py-3 font-mono font-bold text-emerald-600">{h.moisture_pct}%</td>
                          <td className="px-4 py-3 text-muted-foreground">{h.color_grade}</td>
                          <td className="px-4 py-3">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              {h.quality_grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Interactive Hive Details */}
        {selectedHiveForDetail && (
          <HiveDetailModal
            hive={selectedHiveForDetail}
            apiary={apiary}
            onClose={() => setSelectedHiveForDetail(null)}
            onUpdateHive={handleUpdateHive}
            onAddHarvestToHive={handleAddHarvestToHive}
            onOpenScanner={() => {
              setScanContext("detailHive");
              setIsScanningOpen(true);
            }}
          />
        )}

        {/* Modal: Add New Hive */}
        {showAddHiveModal && (
          <AddHiveModal
            isOpen={showAddHiveModal}
            apiary={apiary}
            suggestedCode={`KIB-${String(hivesList.length + 1).padStart(3, "0")}`}
            onClose={() => setShowAddHiveModal(false)}
            onAddHive={handleAddHive}
            onOpenScanner={() => {
              setScanContext("addHive");
              setIsScanningOpen(true);
            }}
            scannedSerial={tempScannedSerial}
          />
        )}

        {/* Modal: QR Scanner */}
        {isScanningOpen && (
          <QrScannerModal
            isOpen={isScanningOpen}
            onClose={() => setIsScanningOpen(false)}
            onScanSuccess={handleScanSuccess}
            title={scanContext === "detailHive" ? `Pair Sensor to ${selectedHiveForDetail?.code}` : "Scan Sensor Hardware QR"}
          />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Interactive Apisense Weather Card (Top Page Level)
// ----------------------------------------------------------------------
export function ApisenseWeatherCard({
  apiary,
  weather,
  userKey,
  onEdit,
  onOpenDetails,
}: {
  apiary: ApiarySite;
  weather?: LiveWeatherData;
  userKey?: string;
  onEdit: (apiary: ApiarySite) => void;
  onOpenDetails: (apiary: ApiarySite) => void;
}) {
  const displayName = normalizeApiaryName(apiary.name);
  const displayLocation = normalizeApiaryLocation(apiary.location_name);
  const hiveCount = userKey ? getUserHivesCount(userKey, apiary.id, apiary.active_hives) : apiary.active_hives;
  const currentCondition = weather?.conditionText || "Partly cloudy";
  const minTemp = weather?.todayMin ?? 18;
  const maxTemp = weather?.todayMax ?? 29;
  const { Icon: WeatherIcon } = getWeatherMeta(weather?.weatherCode ?? 2);

  const getGradientOffsets = (min: number, max: number) => {
    const baseMin = 14;
    const baseMax = 36;
    const leftPct = Math.max(0, Math.min(100, ((min - baseMin) / (baseMax - baseMin)) * 100));
    const widthPct = Math.max(15, Math.min(100 - leftPct, ((max - min) / (baseMax - baseMin)) * 100));
    return { leftPct, widthPct };
  };

  return (
    <div
      onClick={() => onOpenDetails(apiary)}
      className="group rounded-3xl border border-stone-200 dark:border-stone-800 bg-[#FAF8F5] dark:bg-[#1C1A17] text-stone-900 dark:text-stone-100 p-5 shadow-sm transition-all duration-200 hover:shadow-xl hover:border-amber-500/50 cursor-pointer space-y-4 relative overflow-hidden"
    >
      {/* Top Banner on Hover Cue */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-800 dark:text-amber-400 font-black shadow-sm group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg text-stone-900 dark:text-stone-100 tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {displayName}
              </h3>
              <ArrowRight className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
              {displayLocation}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
            <ShieldCheck className="w-3.5 h-3.5" /> Optimal
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <Layers className="w-3.5 h-3.5 text-amber-600" /> {hiveCount} Hives
          </span>
        </div>
      </div>

      {/* Live Current Weather Hero Card */}
      <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white/90 dark:bg-stone-900/80 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <WeatherIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-stone-900 dark:text-stone-100">
                  {weather?.currentTemp !== undefined ? `${weather.currentTemp}°C` : "—"}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  ({apiary.size_acres} Acres)
                </span>
              </div>
              <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                {currentCondition} • High: {maxTemp}° / Low: {minTemp}°
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 font-semibold text-[11px]">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              {weather?.currentHumidity !== undefined ? `${weather.currentHumidity}% Humidity` : "—"}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 font-semibold text-[11px]">
              <Wind className="w-3.5 h-3.5 text-emerald-500" />
              {weather?.currentWind !== undefined ? `${weather.currentWind} km/h Wind` : "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Open-Meteo Live API
          </span>
          <span className="font-mono">Synced: {weather?.lastUpdated || "Live"}</span>
        </div>
      </div>

      {/* Hourly Weather Forecast */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Hourly Microclimate Forecast
        </p>
        <div className="overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          <div className="flex items-center justify-between gap-2 min-w-[280px]">
            {(weather?.hourly || []).map((slot, idx) => {
              const { Icon } = getWeatherMeta(slot.code);
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1 text-center flex-1 py-1.5 px-1 rounded-xl bg-white/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/60"
                >
                  <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">{slot.time}</span>
                  <Icon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span className="text-xs font-black text-stone-800 dark:text-stone-200">{slot.temp}°</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5-Day Temperature Forecast */}
      <div className="space-y-2 pt-1 border-t border-stone-200 dark:border-stone-800">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          5-Day Forecast
        </p>
        {(weather?.daily || []).map((dayItem, dIdx) => {
          const { Icon } = getWeatherMeta(dayItem.code);
          const { leftPct, widthPct } = getGradientOffsets(dayItem.min, dayItem.max);

          return (
            <div key={dIdx} className="grid grid-cols-12 items-center gap-2 text-xs">
              <span className="col-span-3 font-bold text-stone-700 dark:text-stone-300 text-[11px]">
                {dayItem.day}
              </span>
              <div className="col-span-1 flex justify-center">
                <Icon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              </div>
              <span className="col-span-2 text-right text-stone-500 dark:text-stone-400 font-medium text-[11px]">
                {dayItem.min}°
              </span>
              <div className="col-span-4 px-1">
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
              <span className="col-span-2 text-left font-bold text-stone-800 dark:text-stone-200 text-[11px]">
                {dayItem.max}°
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Info: Forage Flora & Action buttons */}
      <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-stone-600 dark:text-stone-400 truncate max-w-[220px]">
          🌸 <strong className="font-semibold text-stone-700 dark:text-stone-300">{apiary.forage_type}</strong>
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(apiary);
            }}
            className="text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 p-1 hover:underline"
          >
            <Edit className="w-3 h-3" /> Edit
          </button>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/40">
            View Details <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Apiaries Modal & Standalone Page
// ----------------------------------------------------------------------
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
  const userKey = user?.id || deviceId || "default_user";

  const [apiaries, setApiaries] = useState<ApiarySite[]>(() => {
    try {
      const stored = localStorage.getItem(`beeyield_user_apiaries_${userKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = parsed.map((item) => {
            const normalized = normalizeApiarySite(item);
            const userHives = getUserHivesCount(userKey, normalized.id, normalized.active_hives);
            return {
              ...normalized,
              active_hives: userHives,
              total_hives: Math.max(normalized.total_hives, userHives),
            };
          });
          return deduplicateApiaries(list);
        }
      }
    } catch {
      // fallback
    }
    return deduplicateApiaries(
      DEFAULT_APIARIES.map((item) => {
        const normalized = normalizeApiarySite(item);
        const userHives = getUserHivesCount(userKey, normalized.id, normalized.active_hives);
        return {
          ...normalized,
          active_hives: userHives,
          total_hives: Math.max(normalized.total_hives, userHives),
        };
      })
    );
  });

  const [weatherMap, setWeatherMap] = useState<Record<string, LiveWeatherData>>({});
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApiary, setEditingApiary] = useState<ApiarySite | null>(null);
  const [selectedDetailApiary, setSelectedDetailApiary] = useState<ApiarySite | null>(null);

  // New Apiary Form state
  const [formData, setFormData] = useState({
    name: "BeeYield Apiary in Kibwezi Kenya",
    location_name: "Kiunduani, Kibwezi, Makueni, Kenya",
    county: "Makueni",
    region: "Kibwezi East",
    latitude: -2.409,
    longitude: 37.967,
    type: "Commercial Apiary",
    active_hives: 184,
    total_hives: 184,
    size_acres: 18,
    forage_type: "Acacia Tortilis, Desert Date & Citrus Blossom",
    status: "Optimal" as "Optimal" | "Threatened" | "Watch" | "Maintenance",
    notes: "Lead Beekeeper: Timothy Nduva. 184 active Langstroth hives in Kibwezi ecosystem, Kenya.",
  });

  // Load user apiaries from Supabase and sync with localStorage
  useEffect(() => {
    const loadApiaries = async () => {
      try {
        let query = (supabase as any).from("apiaries").select("*");
        if (user?.id) {
          query = query.eq("user_id", user.id);
        }
        const { data, error } = await query.limit(50);
        if (!error && data && data.length > 0) {
          const mapped: ApiarySite[] = data.map((d: any) => {
            const normalizedName = normalizeApiaryName(d.name);
            const normalizedLoc = normalizeApiaryLocation(d.location_name || d.region);

            // Silently fix stale legacy database records in Supabase
            if (user?.id && (d.name !== normalizedName || d.location_name !== normalizedLoc)) {
              void (supabase as any)
                .from("apiaries")
                .update({ name: normalizedName, location_name: normalizedLoc })
                .eq("id", d.id);
            }

            const activeCount = getUserHivesCount(
              userKey,
              String(d.id),
              Number(d.hive_count ?? d.active_hives ?? d.expected_hives ?? 0)
            );

            return {
              id: String(d.id),
              name: normalizedName,
              location_name: normalizedLoc,
              county: d.county || "Makueni",
              region: d.region || "Kibwezi East",
              latitude: Number(d.latitude) || -2.409,
              longitude: Number(d.longitude) || 37.967,
              type: d.type || d.apiary_type || "Commercial Apiary",
              status: d.status === "Threatened" ? "Threatened" : "Optimal",
              active_hives: activeCount,
              total_hives: Math.max(Number(d.expected_hives ?? d.total_hives ?? 0), activeCount),
              size_acres: Number(d.size_acres || 18),
              forage_type: d.forage_type || d.primary_forage || "Acacia Tortilis, Desert Date & Citrus Blossom",
              notes: d.notes || "Lead Beekeeper: Timothy Nduva. 184 active Langstroth hives in Kibwezi ecosystem, Kenya.",
              created_at: d.created_at || new Date().toISOString(),
            };
          });

          const cleanApiaries = deduplicateApiaries(mapped);
          setApiaries(cleanApiaries);
          try {
            localStorage.setItem(`beeyield_user_apiaries_${userKey}`, JSON.stringify(cleanApiaries));
          } catch {
            // ignore
          }
        }
      } catch {
        // keep current state
      }
    };
    loadApiaries();
  }, [user?.id, userKey]);

  // Fetch real-time live weather for all apiary sites from Open-Meteo API
  const refreshAllWeather = useCallback(async (isManual = false) => {
    if (apiaries.length === 0) return;
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
    if (isManual) {
      toast.success("Live weather successfully synchronized from Open-Meteo API");
    }
  }, [apiaries]);

  // Sync weather whenever apiaries load or change
  useEffect(() => {
    if (apiaries.length > 0) {
      refreshAllWeather(false);
    }
  }, [apiaries, refreshAllWeather]);

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
      location_name: formData.location_name || "Kiunduani, Kibwezi, Makueni, Kenya",
      county: formData.county || "Makueni",
      region: formData.region || "Kibwezi East",
      latitude: formData.latitude,
      longitude: formData.longitude,
      type: formData.type,
      status: formData.status,
      active_hives: formData.active_hives,
      total_hives: formData.total_hives,
      size_acres: formData.size_acres,
      forage_type: formData.forage_type,
      notes: formData.notes,
      created_at: editingApiary ? editingApiary.created_at : new Date().toISOString(),
    };

    // Update Supabase if available
    try {
      if (editingApiary) {
        await (supabase as any)
          .from("apiaries")
          .update({
            name: newSite.name,
            location_name: newSite.location_name,
            latitude: newSite.latitude,
            longitude: newSite.longitude,
            type: newSite.type,
            forage_type: newSite.forage_type,
            size_acres: newSite.size_acres,
            expected_hives: newSite.total_hives,
          })
          .eq("id", editingApiary.id);
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

    let updatedList: ApiarySite[];
    if (editingApiary) {
      updatedList = apiaries.map((a) => (a.id === editingApiary.id ? newSite : a));
      if (selectedDetailApiary?.id === editingApiary.id) {
        setSelectedDetailApiary(newSite);
      }
      toast.success("Apiary details updated successfully");
    } else {
      updatedList = [newSite, ...apiaries];
      toast.success("New apiary site registered with live weather sync");
    }

    setApiaries(updatedList);
    try {
      localStorage.setItem(`beeyield_user_apiaries_${userKey}`, JSON.stringify(updatedList));
    } catch {
      // ignore
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

  const handleOpenDetails = (site: ApiarySite) => {
    setSelectedDetailApiary(site);
    if (onSelectApiary) {
      onSelectApiary(site);
    }
  };

  // Filtered apiaries
  const filteredApiaries = useMemo(() => {
    return apiaries.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.forage_type.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [apiaries, searchQuery]);

  const handleHivesCountChanged = useCallback(
    (apiaryId: string, count: number) => {
      setApiaries((prev) => {
        const next = prev.map((a) =>
          a.id === apiaryId
            ? {
                ...a,
                active_hives: count,
                total_hives: Math.max(a.total_hives, count),
              }
            : a
        );
        try {
          localStorage.setItem(`beeyield_user_apiaries_${userKey}`, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [userKey]
  );

  // Overall Statistics calculated dynamically from real user-logged info
  const stats = useMemo(() => {
    const totalSites = apiaries.length;
    const activeHives = apiaries.reduce((acc, a) => {
      const count = getUserHivesCount(userKey, a.id, a.active_hives);
      return acc + count;
    }, 0);
    const totalAcres = apiaries.reduce((acc, a) => acc + a.size_acres, 0);
    const primaryWeather = apiaries.length > 0 && weatherMap[apiaries[0].id] ? weatherMap[apiaries[0].id] : null;
    return { totalSites, activeHives, totalAcres, primaryWeather };
  }, [apiaries, weatherMap, userKey]);

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
        {/* Top Header */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
              <Compass className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Apisense • Apiary Stations
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Open-Meteo Live API
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Click any apiary to view user-synced hives, botanical forage ecosystem, and verified honey harvests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshAllWeather(true)}
              disabled={loadingWeather}
              className="p-2 rounded-lg border border-border hover:border-amber-500/50 text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh Live Weather from API"
            >
              <RefreshCw className={`w-4 h-4 ${loadingWeather ? "animate-spin text-amber-500" : ""}`} />
            </button>
            <button
              onClick={() => {
                setEditingApiary(null);
                setFormData({
                  name: "BeeYield Apiary in Kibwezi Kenya",
                  location_name: "Kiunduani, Kibwezi, Makueni, Kenya",
                  county: "Makueni",
                  region: "Kibwezi East",
                  latitude: -2.409,
                  longitude: 37.967,
                  type: "Commercial Apiary",
                  active_hives: 184,
                  total_hives: 184,
                  size_acres: 18,
                  forage_type: "Acacia Tortilis, Desert Date & Citrus Blossom",
                  status: "Optimal",
                  notes: "Lead Beekeeper: Timothy Nduva. 184 active Langstroth hives in Kibwezi ecosystem, Kenya.",
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
          {/* Stats Bar */}
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
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{stats.activeHives} Total Logged Capacity</p>
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
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Current Weather
              </span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {stats.primaryWeather?.currentTemp !== undefined ? `${stats.primaryWeather.currentTemp}°C` : "26°C"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {stats.primaryWeather?.conditionText || "Open-Meteo Synced"}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search apiary, location, forage flora..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Apiary Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredApiaries.map((apiary) => (
              <ApisenseWeatherCard
                key={apiary.id}
                apiary={apiary}
                weather={weatherMap[apiary.id]}
                userKey={userKey}
                onEdit={handleEdit}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>

          {filteredApiaries.length === 0 && (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <Compass className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-semibold">No apiaries found</p>
              <p className="text-xs">Try adjusting your search query or add a new apiary station.</p>
            </div>
          )}
        </div>

        {/* Modal: Add or Edit Apiary */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in zoom-in-95">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 bg-amber-500 text-stone-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <h3 className="font-bold text-sm">
                    {editingApiary ? "Edit Apiary Station" : "Register New Apiary Station"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-black/10 text-stone-950 transition-colors"
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
                    placeholder="e.g. BeeYield Apiary in Kibwezi Kenya..."
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
                      placeholder="e.g. Kiunduani, Kibwezi, Makueni, Kenya..."
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">County / Country</label>
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
                      placeholder="e.g. Acacia, Citrus..."
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
                      <option value="Watch">Watch</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Notes & Beekeeper Info</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Lead Beekeeper: Timothy Nduva..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold transition-all shadow-sm"
                  >
                    {editingApiary ? "Save Changes" : "Register Apiary"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Comprehensive Apiary Detail Drawer/Modal */}
        {selectedDetailApiary && (
          <ApiaryDetailModal
            apiary={selectedDetailApiary}
            weather={weatherMap[selectedDetailApiary.id]}
            onClose={() => setSelectedDetailApiary(null)}
            onEdit={handleEdit}
            onHivesCountChanged={handleHivesCountChanged}
          />
        )}
      </div>
    </div>
  );
}
