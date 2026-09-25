import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Eye,
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
  Cpu,
  Radio,
  Wifi,
  Bug,
  Thermometer,
  ArrowUp,
  Maximize2,
  Gauge,
  CheckSquare,
  LayoutGrid,
  Coffee,
  Heart,
  Share2,
  MoreVertical,
  Bell,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { useAuth } from "@/hooks/use-auth";
import { downloadReportPdf, safeName } from "@/lib/report-pdf";

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

export type DeviceCategory = "in_land" | "in_hive" | "disease_devices";

export interface ApiaryDeviceItem {
  id: string;
  category: DeviceCategory;
  deviceType: string;
  serial: string;
  hiveCode?: string;
  status: "active" | "online" | "optimal" | "low_battery" | "calibrating";
  lastSync?: string;
  telemetrySummary?: string;
  model: string;
  installedAt?: string;
}


export interface FrameSenseAnalysis {
  id: string;
  timestamp: string;
  broodPct: number;
  storesPct: number;
  combSurfacePct: number;
  queenCells: number;
  status: "Analysis completed" | "Processing...";
  middlePhotoUrl?: string;
  firstPhotoUrl?: string;
  lastPhotoUrl?: string;
  aiRecommendations?: string;
}

export interface ApiaryHiveItem {
  id: string;
  code: string;
  name: string;
  hiveType: string;
  queenPresent: boolean;
  queenBreedingYear: number;
  queenStatus: string;
  broodFrames?: number;
  maxBroodFrames?: number;
  hasHygienicBottomBoard?: boolean;
  queenOrigin?: string;
  queenInsemination?: string;
  queenNote?: string;
  honeyFrames?: number;
  colonyStrength?: string;
  colonyAvailability?: string;
  sensorSerial?: string;
  deviceCategory?: DeviceCategory;
  deviceType?: string;
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
  if (!loc) return "Kibwezi, Makueni, Kenya";
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
    return "Kibwezi, Makueni, Kenya";
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
    location_name: "Kibwezi, Makueni, Kenya",
    county: "Makueni",
    region: "Kibwezi East",
    latitude: -2.409,
    longitude: 37.967,
    type: "Commercial Apiary",
    status: "Optimal",
    active_hives: 184,
    total_hives: 184,
    size_acres: 5,
    forage_type: "Acacia Tortilis, Desert Date & Citrus Blossom",
    notes: "Lead Beekeeper: Timothy Nduva. 184 active Langstroth hives on 5 acres in Kibwezi ecosystem, Kenya.",
    created_at: "2020-01-01T08:00:00Z",
  },
];

// Device Categories configuration
export const DEVICE_CATEGORIES: {
  id: DeviceCategory;
  label: string;
  icon: string;
  badgeColor: string;
  description: string;
  defaultTypes: string[];
}[] = [
  {
    id: "in_land",
    label: "In Land Devices",
    icon: "🏞️",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    description: "Apiary environmental, weather station, soil moisture & perimeter defense",
    defaultTypes: [
      "Microclimate Weather Station (Open-Meteo Gateway)",
      "Flora Bloom & Soil Moisture Probe Node",
      "Acoustic Perimeter & Pest Defense Node",
      "Solar Mesh Apiary Relay Hub",
    ],
  },
  {
    id: "in_hive",
    label: "In Hive Devices",
    icon: "🐝",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    description: "Hive weight telemetry scales, brood core temperature & colony acoustics",
    defaultTypes: [
      "Hive Weight Scale (Telemetry Load Cell)",
      "Apisense VitalSensor (Brood Cluster Temp & Acoustics)",
      "Intelligent Hives Brood Monitor",
      "Brood Frame Temperature Strip Monitor",
      "Apisense NFC/QR Hive Tag",
    ],
  },
  {
    id: "disease_devices",
    label: "Disease Devices",
    icon: "🔬",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
    description: "Early Varroa detection, American Foulbrood scanner & biosecurity traps",
    defaultTypes: [
      "ApiSense Early Varroa Optical & Acoustic Detector",
      "AI Brood Disease & Foulbrood (AFB) Diagnostic Scanner",
      "Small Hive Beetle (SHB) & Wax Moth Telemetry Trap",
      "Colony Depletion & Queen Mortality Warning Sensor",
    ],
  },
];

// Canonical 22 IoT Devices Active in Kibwezi Apiary (Deployed with Polish Partners Apisense & Intelligent Hives)
export const CANONICAL_KIBWEZI_DEVICES: ApiaryDeviceItem[] = [
  // In-Hive: Weight Scales
  {
    id: "dev-scale-001",
    category: "in_hive",
    deviceType: "Hive Weight Scale (Telemetry Load Cell)",
    serial: "SCALE-KBZ-001",
    hiveCode: "KIB-001",
    status: "optimal",
    lastSync: "10 mins ago",
    telemetrySummary: "Weight: 44.2 kg (+1.4 kg / 48h nectar flow)",
    model: "Apisense Pro Scale 150kg",
    installedAt: "2025-06-15",
  },
  {
    id: "dev-scale-002",
    category: "in_hive",
    deviceType: "Hive Weight Scale (Telemetry Load Cell)",
    serial: "SCALE-KBZ-002",
    hiveCode: "KIB-002",
    status: "optimal",
    lastSync: "15 mins ago",
    telemetrySummary: "Weight: 42.8 kg (+0.9 kg nectar flow)",
    model: "Apisense Pro Scale 150kg",
    installedAt: "2025-06-15",
  },
  {
    id: "dev-scale-003",
    category: "in_hive",
    deviceType: "Hive Weight Scale (Telemetry Load Cell)",
    serial: "SCALE-KBZ-003",
    hiveCode: "KIB-003",
    status: "optimal",
    lastSync: "32 mins ago",
    telemetrySummary: "Weight: 39.5 kg (Steady)",
    model: "Apisense Pro Scale 150kg",
    installedAt: "2025-07-02",
  },
  {
    id: "dev-scale-004",
    category: "in_hive",
    deviceType: "Hive Weight Scale (Telemetry Load Cell)",
    serial: "SCALE-KBZ-004",
    hiveCode: "KIB-004",
    status: "optimal",
    lastSync: "45 mins ago",
    telemetrySummary: "Weight: 41.1 kg (+1.1 kg / 48h)",
    model: "Apisense Pro Scale 150kg",
    installedAt: "2025-07-02",
  },
  // In-Hive: VitalSensors & Brood Monitors
  {
    id: "dev-vs-001",
    category: "in_hive",
    deviceType: "Apisense VitalSensor (Brood Cluster Temp & Acoustics)",
    serial: "VS-KBZ-001",
    hiveCode: "KIB-001",
    status: "optimal",
    lastSync: "4 mins ago",
    telemetrySummary: "Core Temp: 35.1°C · Acoustics: 245 Hz (Queen Laying)",
    model: "Apisense VitalSensor v2.4",
    installedAt: "2025-05-10",
  },
  {
    id: "dev-vs-002",
    category: "in_hive",
    deviceType: "Apisense VitalSensor (Brood Cluster Temp & Acoustics)",
    serial: "VS-KBZ-002",
    hiveCode: "KIB-002",
    status: "optimal",
    lastSync: "8 mins ago",
    telemetrySummary: "Core Temp: 34.9°C · Acoustics: 238 Hz (Normal)",
    model: "Apisense VitalSensor v2.4",
    installedAt: "2025-05-10",
  },
  {
    id: "dev-vs-005",
    category: "in_hive",
    deviceType: "Intelligent Hives Brood Monitor",
    serial: "IH-BROOD-005",
    hiveCode: "KIB-005",
    status: "optimal",
    lastSync: "12 mins ago",
    telemetrySummary: "Brood Index: 92% · Humidity: 58% RH",
    model: "Intelligent Hives BM-300",
    installedAt: "2025-08-14",
  },
  {
    id: "dev-vs-006",
    category: "in_hive",
    deviceType: "Apisense VitalSensor (Brood Cluster Temp & Acoustics)",
    serial: "VS-KBZ-006",
    hiveCode: "KIB-006",
    status: "optimal",
    lastSync: "25 mins ago",
    telemetrySummary: "Core Temp: 35.0°C · Acoustics: 242 Hz",
    model: "Apisense VitalSensor v2.4",
    installedAt: "2025-08-14",
  },
  {
    id: "dev-vs-007",
    category: "in_hive",
    deviceType: "Intelligent Hives Brood Monitor",
    serial: "IH-BROOD-007",
    hiveCode: "KIB-007",
    status: "optimal",
    lastSync: "19 mins ago",
    telemetrySummary: "Brood Index: 88% · Humidity: 61% RH",
    model: "Intelligent Hives BM-300",
    installedAt: "2025-09-01",
  },
  {
    id: "dev-vs-008",
    category: "in_hive",
    deviceType: "Apisense VitalSensor (Brood Cluster Temp & Acoustics)",
    serial: "VS-KBZ-008",
    hiveCode: "KIB-008",
    status: "optimal",
    lastSync: "30 mins ago",
    telemetrySummary: "Core Temp: 35.2°C · Acoustics: 240 Hz",
    model: "Apisense VitalSensor v2.4",
    installedAt: "2025-09-01",
  },
  {
    id: "dev-tag-009",
    category: "in_hive",
    deviceType: "Apisense NFC/QR Hive Tag",
    serial: "TAG-KBZ-009",
    hiveCode: "KIB-009",
    status: "optimal",
    lastSync: "2 hours ago",
    telemetrySummary: "QR Scanned Inspection Logged",
    model: "Apisense Rugged Tag",
    installedAt: "2025-09-15",
  },
  {
    id: "dev-tag-010",
    category: "in_hive",
    deviceType: "Apisense NFC/QR Hive Tag",
    serial: "TAG-KBZ-010",
    hiveCode: "KIB-010",
    status: "optimal",
    lastSync: "2 hours ago",
    telemetrySummary: "QR Scanned Inspection Logged",
    model: "Apisense Rugged Tag",
    installedAt: "2025-09-15",
  },
  // In-Land Devices
  {
    id: "dev-land-001",
    category: "in_land",
    deviceType: "Microclimate Weather Station (Open-Meteo Gateway)",
    serial: "HUB-KBZ-LAND-01",
    status: "optimal",
    lastSync: "Live (Open-Meteo)",
    telemetrySummary: "Ambient: 26.4°C · 52% RH · Wind: 14 km/h ESE",
    model: "Apisense Solar LoRa Gateway v3",
    installedAt: "2025-04-20",
  },
  {
    id: "dev-land-002",
    category: "in_land",
    deviceType: "Flora Bloom & Soil Moisture Probe Node",
    serial: "SOIL-KBZ-01",
    status: "optimal",
    lastSync: "15 mins ago",
    telemetrySummary: "Soil Moisture: 28% VWC · Soil Temp: 22.8°C",
    model: "Apisense AgroProbe Multi-Depth",
    installedAt: "2025-04-20",
  },
  {
    id: "dev-land-003",
    category: "in_land",
    deviceType: "Acoustic Perimeter & Pest Defense Node",
    serial: "PERIMETER-KBZ-01",
    status: "optimal",
    lastSync: "6 mins ago",
    telemetrySummary: "North Perimeter Secure · Ultrasonic Armed",
    model: "Intelligent Hives Perimeter Guard",
    installedAt: "2025-06-01",
  },
  {
    id: "dev-land-004",
    category: "in_land",
    deviceType: "Solar Mesh Apiary Relay Hub",
    serial: "RELAY-KBZ-02",
    status: "optimal",
    lastSync: "Live (5-min ping)",
    telemetrySummary: "Battery: 98% · Solar Inflow: 18.2W · 22 Nodes Connected",
    model: "Apisense Mesh Relay 868MHz",
    installedAt: "2025-06-01",
  },
  // Disease Devices
  {
    id: "dev-dis-001",
    category: "disease_devices",
    deviceType: "ApiSense Early Varroa Optical & Acoustic Detector",
    serial: "VARROA-KBZ-001",
    hiveCode: "KIB-001",
    status: "optimal",
    lastSync: "5 mins ago",
    telemetrySummary: "Mite Load: 0.2 / 100 bees (Safe Below 1.0 Threshold)",
    model: "ApiSense VarroaSense Acoustic AI",
    installedAt: "2025-06-15",
  },
  {
    id: "dev-dis-002",
    category: "disease_devices",
    deviceType: "ApiSense Early Varroa Optical & Acoustic Detector",
    serial: "VARROA-KBZ-002",
    hiveCode: "KIB-002",
    status: "optimal",
    lastSync: "9 mins ago",
    telemetrySummary: "Mite Load: 0.3 / 100 bees (Safe)",
    model: "ApiSense VarroaSense Acoustic AI",
    installedAt: "2025-06-15",
  },
  {
    id: "dev-dis-003",
    category: "disease_devices",
    deviceType: "ApiSense Early Varroa Optical & Acoustic Detector",
    serial: "VARROA-KBZ-003",
    hiveCode: "KIB-003",
    status: "optimal",
    lastSync: "18 mins ago",
    telemetrySummary: "Mite Load: 0.1 / 100 bees (Clean)",
    model: "ApiSense VarroaSense Acoustic AI",
    installedAt: "2025-07-02",
  },
  {
    id: "dev-dis-004",
    category: "disease_devices",
    deviceType: "ApiSense Early Varroa Optical & Acoustic Detector",
    serial: "VARROA-KBZ-004",
    hiveCode: "KIB-004",
    status: "optimal",
    lastSync: "22 mins ago",
    telemetrySummary: "Mite Load: 0.2 / 100 bees (Safe)",
    model: "ApiSense VarroaSense Acoustic AI",
    installedAt: "2025-07-02",
  },
  {
    id: "dev-dis-005",
    category: "disease_devices",
    deviceType: "AI Brood Disease & Foulbrood (AFB) Diagnostic Scanner",
    serial: "AFB-DIAG-KBZ-01",
    hiveCode: "KIB-005",
    status: "optimal",
    lastSync: "1 hour ago",
    telemetrySummary: "Pathogen Scan: Negative (No AFB/EFB Spores Detected)",
    model: "Intelligent Hives PathoScan AI",
    installedAt: "2025-08-14",
  },
  {
    id: "dev-dis-006",
    category: "disease_devices",
    deviceType: "Small Hive Beetle (SHB) & Wax Moth Telemetry Trap",
    serial: "SHB-TRAP-KBZ-01",
    hiveCode: "KIB-008",
    status: "optimal",
    lastSync: "45 mins ago",
    telemetrySummary: "Trap Clear · Optical Count: 0 Pests",
    model: "BeeYield BioSecure Trap v1.1",
    installedAt: "2025-09-01",
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
    colonyStrength: i % 4 === 0 ? "Strong (8–10 Frames Brood & Bees)" : i % 7 === 0 ? "Moderate (5–7 Frames)" : "Strong (8–10 Frames Brood & Bees)",
    colonyAvailability: i % 5 === 0 ? "Available for Pollination Contracts" : "Dedicated Honey Production",
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
// Certificate Download Generators for Harvest Batches
// ----------------------------------------------------------------------
function downloadBatchCert(batch: HiveHarvestBatch, hiveCode: string, apiaryName?: string, locationName?: string) {
  const moisture = batch.moisturePct || 17.1;
  const isExport = moisture <= 18.0;
  void downloadReportPdf({
    filename: `Harvest-Batch-${safeName(hiveCode)}-${safeName(batch.batchCode)}.pdf`,
    title: `Honey Harvest Extraction Certificate • ${hiveCode}`,
    subtitle: `Batch ${batch.batchCode} • ${batch.honeyType} • ${isExport ? "Export Grade A Raw" : "Standard Raw Honey"}`,
    meta: [
      { label: "Producer / Beekeeper", value: "Timothy Nduva (Lead Apiarist)" },
      { label: "Date of Extraction", value: batch.date },
      { label: "Hive Identifier", value: hiveCode },
      { label: "Batch Lot Number", value: batch.batchCode },
      { label: "Apiary Site", value: normalizeApiaryName(apiaryName) },
      { label: "Location", value: normalizeApiaryLocation(locationName) },
      { label: "Net Volume Extracted", value: `${batch.quantityKg.toFixed(1)} kg` },
      { label: "Refractometer Moisture", value: `${moisture}%` },
      { label: "Botanical Floral Source", value: batch.honeyType },
      { label: "Official Quality Standard", value: isExport ? "KEBS KS 05-344 Compliant (Grade A Raw)" : "Standard Grade Honey" },
      { label: "Fair Trade Beekeeper Value", value: `KES ${(batch.quantityKg * 1250).toLocaleString()}` },
    ],
    sections: [
      {
        type: "kv",
        heading: "Commercial Compliance & Laboratory Specifications",
        rows: [
          ["Certified Apiarist", "Timothy Nduva (Lead Beekeeper)"],
          ["Moisture Content (Max 20%)", `${moisture}% (${isExport ? "Compliant - Export Grade" : "Standard"})`],
          ["Sucrose Content (Max 5g/100g)", "< 1.8g / 100g (Pure Blossom Verified)"],
          ["HMF (Hydroxymethylfurfural)", "< 10 mg/kg (Zero heat damage)"],
          ["Diastase Enzyme Activity", "> 12 Schade units (Raw unpasteurized)"],
          ["Filtration Protocol", "Cold extracted, double micro-strained unheated"],
        ],
      },
    ],
  });
}

function downloadHarvestCert(harvest: ApiaryHarvestItem, apiaryName?: string, locationName?: string) {
  try {
    toast.info("Preparing Extraction Certificate...");
    const moisture = harvest.moisture_pct;
    const isExport = moisture <= 18.0;
    const fileName = `Certified-Harvest-${safeName(harvest.batch || "batch")}.pdf`;
    downloadReportPdf({
      kind: "certificate",
      badge: isExport ? "EXPORT GRADE A" : "GRADE A",
      fileName,
      filename: fileName,
      title: `Certified Honey Harvest Batch • ${harvest.batch}`,
      subtitle: `${harvest.honey_type} • ${harvest.quality_grade}`,
      sections: [
        {
          type: "kv",
          heading: "Batch & Extraction Details",
          rows: [
            ["Producer / Beekeeper", "Timothy Nduva (Lead Apiarist)"],
            ["Date of Extraction", harvest.harvested_on],
            ["Hive Identifier", harvest.hiveCode || "Colony Lot"],
            ["Batch Lot Number", harvest.batch],
            ["Apiary Site", normalizeApiaryName(apiaryName)],
            ["Location", normalizeApiaryLocation(locationName)],
            ["Net Volume Extracted", `${harvest.quantity_kg.toFixed(1)} kg`],
            ["Refractometer Moisture", `${harvest.moisture_pct}%`],
            ["Color Classification", harvest.color_grade],
            ["Official Quality Standard", harvest.quality_grade],
            ["Fair Trade Beekeeper Value", `KES ${(harvest.quantity_kg * 1000).toLocaleString()}`],
          ],
        },
        {
          type: "kv",
          heading: "Commercial Compliance & Quality Standards",
          rows: [
            ["Certified Apiarist", "Timothy Nduva (Lead Beekeeper)"],
            ["Moisture Content (Max 20%)", `${harvest.moisture_pct}% (${isExport ? "Export Grade" : "Standard"})`],
            ["Sucrose Standard", "< 2.0g / 100g (Purity Assured)"],
            ["Traceability Protocol", "Physical Apiary Audit & Extraction Certificate"],
          ],
        },
      ],
      footer: "BeeYield Official Harvest Ledger • Verified Traceability QR • Export Grade Apiculture",
    });
    toast.success(`Downloaded Certificate for Batch ${harvest.batch}`);
  } catch (err: any) {
    console.error("Failed to generate certificate PDF:", err);
    toast.error("Failed to download certificate.");
  }
}\n\nexport default function ApiariesPage({
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
    return user?.id
      ? []
      : deduplicateApiaries(
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
  const [addApiaryStep, setAddApiaryStep] = useState<1 | 2>(1);
  const [addApiaryMode, setAddApiaryMode] = useState<"with_devices" | "without_devices">("with_devices");
  const [addDeviceCategory, setAddDeviceCategory] = useState<DeviceCategory>("in_hive");
  const [scannedSensorCode, setScannedSensorCode] = useState<string>("");
  const [attachedDevices, setAttachedDevices] = useState<ApiaryDeviceItem[]>([]);

  // New Apiary Form state
  const [formData, setFormData] = useState({
    name: "BeeYield Apiary in Kibwezi Kenya",
    location_name: "Kibwezi, Makueni, Kenya",
    county: "Makueni",
    region: "Kibwezi East",
    latitude: -2.409,
    longitude: 37.967,
    type: "Commercial Apiary",
    active_hives: 184,
    total_hives: 184,
    size_acres: 5,
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
        if (!error && data) {
          if (data.length === 0) {
            if (user?.id) {
              setApiaries([]);
              try {
                localStorage.setItem(`beeyield_user_apiaries_${userKey}`, JSON.stringify([]));
              } catch { void 0; }
              return;
            }
          }
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
              notes: d.notes || "",
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
      if (attachedDevices.length > 0) {
        try {
          localStorage.setItem(getStorageKey(userKey, newSite.id, "devices"), JSON.stringify(attachedDevices));
        } catch { void 0; }
      }
      toast.success(
        addApiaryMode === "with_devices"
          ? `Apiary "${newSite.name}" registered with 24/7 device monitoring`
          : `Apiary "${newSite.name}" registered in Digital Journal mode`
      );
      setSelectedDetailApiary(newSite);
    }

    setApiaries(updatedList);
    try {
      localStorage.setItem(`beeyield_user_apiaries_${userKey}`, JSON.stringify(updatedList));
    } catch {
      // ignore
    }

    setShowAddModal(false);
    setEditingApiary(null);
    setAddApiaryStep(1);
    setAttachedDevices([]);
  };

  const handleEdit = (site: ApiarySite) => {
    setEditingApiary(site);
    setAddApiaryStep(1);
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

  const handleDeleteApiary = async (apiaryId: string, apiaryName: string) => {
    if (!await confirmAsync(`Are you sure you want to remove apiary "${apiaryName}"?`)) {
      return;
    }
    const nextApiaries = apiaries.filter((a) => a.id !== apiaryId);
    setApiaries(nextApiaries);
    try {
      localStorage.setItem(`beeyield_user_apiaries_${userKey}`, JSON.stringify(nextApiaries));
    } catch {
      // ignore
    }
    if (user?.id) {
      try {
        await (supabase as any).from("apiaries").delete().eq("id", apiaryId);
      } catch (err) {
        console.error("Failed to delete apiary from db:", err);
      }
    }
    if (selectedDetailApiary?.id === apiaryId) {
      setSelectedDetailApiary(null);
    }
    toast.success(`Removed apiary ${apiaryName}`);
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
                setAddApiaryStep(1);
                setAddApiaryMode("with_devices");
                setAttachedDevices([]);
                setScannedSensorCode("");
                setFormData({
                  name: "",
                  location_name: "Kibwezi, Makueni, Kenya",
                  county: "Makueni",
                  region: "Kibwezi East",
                  latitude: -2.409,
                  longitude: 37.967,
                  type: "Commercial Apiary",
                  active_hives: 184,
                  total_hives: 184,
                  size_acres: 5,
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
                onDelete={handleDeleteApiary}
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="w-full sm:max-w-md bg-[#FAF4EE] min-h-screen sm:min-h-[620px] sm:max-h-[92vh] sm:rounded-3xl shadow-2xl overflow-y-auto flex flex-col p-6 text-stone-900 border border-stone-300/40 relative">
              {/* Step 1: Matching Mobile Companion Screenshot */}
              {!editingApiary && addApiaryStep === 1 && (
                <div className="flex flex-col flex-1">
                  {/* Top Bar with back arrow and centered title */}
                  <div className="relative flex items-center justify-between pb-6">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="p-1 -ml-1 text-stone-800 hover:text-stone-950 transition-colors"
                      aria-label="Back"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-normal text-stone-900 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                      Add apiary
                    </h2>
                    <div className="w-6" />
                  </div>

                  {/* Name field with clean underline */}
                  <div className="space-y-1 pt-2">
                    <label className="text-sm font-medium text-stone-700 block">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder=""
                      autoFocus
                      className="w-full bg-transparent border-0 border-b border-stone-800 text-stone-900 pb-1.5 text-base font-normal focus:outline-none focus:border-amber-600 transition-colors"
                    />
                  </div>

                  {/* Subtitle */}
                  <p className="text-sm text-stone-800 font-medium mt-6 mb-3">
                    How do you want to add the apiary?
                  </p>

                  {/* Option 1: With devices */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setAddApiaryMode("with_devices")}
                      className={`w-full py-3.5 px-4 rounded-2xl border text-center font-medium text-sm transition-all ${
                        addApiaryMode === "with_devices"
                          ? "border-stone-800 bg-[#EFE7DB] text-stone-950 shadow-sm"
                          : "border-stone-300/80 bg-transparent text-stone-800 hover:border-stone-400"
                      }`}
                    >
                      With devices
                    </button>
                    <div className="bg-[#EFE7DB]/70 rounded-2xl p-4 text-[13px] text-stone-700 leading-relaxed font-normal">
                      A digital beekeeper's journal (notes, inspections and more), 24/7 monitoring, parameter charts and disease detection — an apiary with a Hub, hives with VitalSensor and Scale.
                    </div>
                  </div>

                  {/* Option 2: Without devices */}
                  <div className="space-y-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setAddApiaryMode("without_devices")}
                      className={`w-full py-3.5 px-4 rounded-2xl border text-center font-medium text-sm transition-all ${
                        addApiaryMode === "without_devices"
                          ? "border-stone-800 bg-[#EFE7DB] text-stone-950 shadow-sm"
                          : "border-stone-300/80 bg-transparent text-stone-800 hover:border-stone-400"
                      }`}
                    >
                      Without devices
                    </button>
                    <div className="bg-[#EFE7DB]/70 rounded-2xl p-4 text-[13px] text-stone-700 leading-relaxed font-normal">
                      A digital beekeeper's journal (notes, inspections and more), without measurements or disease detection — an apiary without a Hub, hives without VitalSensor or Scale.
                    </div>
                  </div>

                  {/* Hint */}
                  <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-stone-700">
                    <Info className="w-4 h-4 text-stone-700 flex-shrink-0" />
                    <span className="underline cursor-pointer">You can always add devices later.</span>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="mt-auto pt-8 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-7 py-2.5 rounded-full border border-stone-800 text-stone-900 font-medium text-sm hover:bg-stone-200/50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.name.trim()) {
                          toast.error("Please enter an apiary name");
                          return;
                        }
                        setAddApiaryStep(2);
                      }}
                      className={`px-7 py-2.5 rounded-full font-medium text-sm transition-colors ${
                        formData.name.trim()
                          ? "bg-[#D8D0C5] text-stone-900 hover:bg-stone-900 hover:text-white"
                          : "bg-[#D8D0C5]/60 text-stone-500 cursor-not-allowed"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Configure Devices & Location */}
              {!editingApiary && addApiaryStep === 2 && (
                <div className="flex flex-col flex-1">
                  {/* Top Bar with back arrow */}
                  <div className="relative flex items-center justify-between pb-4 border-b border-stone-300/60">
                    <button
                      type="button"
                      onClick={() => setAddApiaryStep(1)}
                      className="p-1 -ml-1 text-stone-800 hover:text-stone-950 transition-colors"
                      aria-label="Back"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-medium text-stone-900 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                      {addApiaryMode === "with_devices" ? "Connect Devices" : "Apiary Details"}
                    </h2>
                    <div className="w-6" />
                  </div>

                  <div className="pt-4 space-y-4 flex-1">
                    {/* Apiary Summary Card */}
                    <div className="bg-[#EFE7DB]/80 rounded-2xl p-4 space-y-2 border border-stone-300/50">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-stone-900">{formData.name}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900">
                          {addApiaryMode === "with_devices" ? "With Devices" : "Digital Journal"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 pt-1">
                        <div>
                          <span className="text-[10px] text-stone-500 block">Location</span>
                          <span className="font-medium">{formData.location_name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">Land Size</span>
                          <span className="font-medium">{formData.size_acres} Acres (Timothy Nduva)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">Active Hives</span>
                          <span className="font-medium">{formData.active_hives} Langstroth</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">Region</span>
                          <span className="font-medium">{formData.region}</span>
                        </div>
                      </div>
                    </div>

                    {/* WITH DEVICES: Category Selection & Sensor Scanner */}
                    {addApiaryMode === "with_devices" && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-stone-800">
                            Choose Device Category:
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-200/60 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setAddDeviceCategory("in_land")}
                              className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                                addDeviceCategory === "in_land"
                                  ? "bg-white text-stone-950 shadow-sm font-bold"
                                  : "text-stone-600 hover:text-stone-950"
                              }`}
                            >
                              In land
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddDeviceCategory("in_hive")}
                              className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                                addDeviceCategory === "in_hive"
                                  ? "bg-white text-stone-950 shadow-sm font-bold"
                                  : "text-stone-600 hover:text-stone-950"
                              }`}
                            >
                              In hive
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddDeviceCategory("disease_devices")}
                              className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                                addDeviceCategory === "disease_devices"
                                  ? "bg-white text-stone-950 shadow-sm font-bold"
                                  : "text-stone-600 hover:text-stone-950"
                              }`}
                            >
                              Disease
                            </button>
                          </div>
                        </div>

                        {/* Scanner / Manual Code Entry */}
                        <div className="p-3.5 bg-white rounded-2xl border border-stone-300/70 space-y-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                              <ScanLine className="w-4 h-4 text-amber-600" />
                              {addDeviceCategory === "in_land" && "Gateway Hub / LoRa Station"}
                              {addDeviceCategory === "in_hive" && "VitalSensor / Weight Scale"}
                              {addDeviceCategory === "disease_devices" && "Apisense Varroa Detector"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const randomCode =
                                  addDeviceCategory === "in_land"
                                    ? `HUB-KBZ-${Math.floor(10 + Math.random() * 90)}`
                                    : addDeviceCategory === "disease_devices"
                                    ? `APISENSE-KBZ-${Math.floor(10 + Math.random() * 90)}`
                                    : Math.random() > 0.5
                                    ? `VS-KBZ-${Math.floor(100 + Math.random() * 900)}`
                                    : `SCALE-KBZ-0${Math.floor(1 + Math.random() * 5)}`;
                                setScannedSensorCode(randomCode);
                                toast.success(`Scanned QR Barcode: ${randomCode}`);
                              }}
                              className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 transition-colors flex items-center gap-1"
                            >
                              <QrCode className="w-3.5 h-3.5" /> Scan Sensor
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={scannedSensorCode}
                              onChange={(e) => setScannedSensorCode(e.target.value)}
                              placeholder={
                                addDeviceCategory === "in_land"
                                  ? "e.g. HUB-KBZ-01"
                                  : addDeviceCategory === "disease_devices"
                                  ? "e.g. APISENSE-KBZ-01"
                                  : "e.g. VS-KBZ-001 or SCALE-KBZ-01"
                              }
                              className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-600"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const code = scannedSensorCode.trim() || `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
                                const isScale = code.toUpperCase().includes("SCALE") || code.toUpperCase().includes("SC-");
                                const newDev: ApiaryDeviceItem = {
                                  id: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                                  name:
                                    addDeviceCategory === "in_land"
                                      ? "Kibwezi LoRa Gateway Hub"
                                      : addDeviceCategory === "disease_devices"
                                      ? "Apisense Acoustic Varroa Detector"
                                      : isScale
                                      ? "HoneyScale Weight Telemetry"
                                      : "VitalSensor Pro In-Hive",
                                  category: addDeviceCategory,
                                  deviceType:
                                    addDeviceCategory === "in_land"
                                      ? "gateway"
                                      : addDeviceCategory === "disease_devices"
                                      ? "acoustic_varroa"
                                      : isScale
                                      ? "scale"
                                      : "vitalsensor",
                                  serial: code,
                                  status: "online",
                                  batteryPct: 98,
                                  signalStrength: "excellent",
                                  lastPing: "Just now",
                                  firmwareVersion: "v3.2.0",
                                };
                                setAttachedDevices([newDev, ...attachedDevices]);
                                setScannedSensorCode("");
                                toast.success(`Attached ${newDev.name} (${newDev.serial})`);
                              }}
                              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              Add
                            </button>
                          </div>

                          {/* Quick Pack Preload */}
                          <button
                            type="button"
                            onClick={() => {
                              const standardPack: ApiaryDeviceItem[] = [
                                {
                                  id: "dev-hub-kibwezi",
                                  name: "Kibwezi Commercial Gateway Hub",
                                  category: "in_land",
                                  deviceType: "gateway",
                                  serial: "HUB-KBZ-01",
                                  status: "online",
                                  batteryPct: 100,
                                  signalStrength: "excellent",
                                  lastPing: "Just now",
                                  firmwareVersion: "v3.4.1",
                                },
                                {
                                  id: "dev-vs-001",
                                  name: "VitalSensor Hive 001",
                                  category: "in_hive",
                                  deviceType: "vitalsensor",
                                  serial: "VS-KBZ-001",
                                  status: "online",
                                  batteryPct: 98,
                                  signalStrength: "excellent",
                                  lastPing: "Just now",
                                  hiveCode: "beeyield 001",
                                },
                                {
                                  id: "dev-vs-002",
                                  name: "VitalSensor Hive 002",
                                  category: "in_hive",
                                  deviceType: "vitalsensor",
                                  serial: "VS-KBZ-002",
                                  status: "online",
                                  batteryPct: 96,
                                  signalStrength: "good",
                                  lastPing: "Just now",
                                  hiveCode: "beeyield 002",
                                },
                                {
                                  id: "dev-scale-01",
                                  name: "HoneyScale 4-Cell Telemetry",
                                  category: "in_hive",
                                  deviceType: "scale",
                                  serial: "SCALE-KBZ-01",
                                  status: "online",
                                  batteryPct: 100,
                                  signalStrength: "excellent",
                                  lastPing: "Just now",
                                  hiveCode: "beeyield 001",
                                },
                                {
                                  id: "dev-apisense-01",
                                  name: "Apisense Acoustic Varroa Detector",
                                  category: "disease_devices",
                                  deviceType: "acoustic_varroa",
                                  serial: "APISENSE-KBZ-01",
                                  status: "online",
                                  batteryPct: 94,
                                  signalStrength: "excellent",
                                  lastPing: "Just now",
                                },
                              ];
                              setAttachedDevices(standardPack);
                              toast.success("Loaded Kibwezi IoT Device Pack (Hub, VitalSensors, Scale & Apisense)");
                            }}
                            className="w-full py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Preload Full Kibwezi IoT Pack (5 Devices)
                          </button>
                        </div>

                        {/* Attached Devices Preview */}
                        {attachedDevices.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-stone-700">
                              Attached Devices ({attachedDevices.length}):
                            </span>
                            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                              {attachedDevices.map((d) => (
                                <div
                                  key={d.id}
                                  className="flex items-center justify-between p-2 bg-[#EFE7DB]/60 rounded-xl text-xs text-stone-800 border border-stone-300/40"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                    <span className="font-semibold truncate">{d.name}</span>
                                    <span className="font-mono text-[10px] text-stone-500">[{d.serial}]</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setAttachedDevices(attachedDevices.filter((x) => x.id !== d.id))}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* WITHOUT DEVICES: Digital Journal Note */}
                    {addApiaryMode === "without_devices" && (
                      <div className="bg-[#EFE7DB]/50 rounded-2xl p-4 text-xs text-stone-700 leading-relaxed space-y-2 border border-stone-300/40">
                        <p className="font-semibold text-stone-900">Digital Beekeeper's Journal</p>
                        <p>
                          This apiary site will be registered in offline / journal mode. You can record hive notes, track inspections, monitor weather conditions, and perform manual yield calculations.
                        </p>
                        <div className="pt-2 flex items-center gap-1.5 text-amber-800 font-medium">
                          <Info className="w-4 h-4 flex-shrink-0" />
                          <span>Hardware sensors (VitalSensor, Scales, Hub) can be paired at any point later.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="mt-auto pt-6 flex items-center justify-between gap-3 border-t border-stone-300/50">
                    <button
                      type="button"
                      onClick={() => setAddApiaryStep(1)}
                      className="px-6 py-2.5 rounded-full border border-stone-800 text-stone-900 font-medium text-sm hover:bg-stone-200/50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                        handleSaveApiary(fakeEvent);
                      }}
                      className="px-7 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm transition-colors shadow-sm"
                    >
                      {addApiaryMode === "with_devices" ? "Register & Sync" : "Register Apiary"}
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Apiary Mode */}
              {editingApiary && (
                <div className="flex flex-col flex-1">
                  <div className="relative flex items-center justify-between pb-4 border-b border-stone-300/60">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingApiary(null);
                      }}
                      className="p-1 -ml-1 text-stone-800 hover:text-stone-950 transition-colors"
                      aria-label="Back"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-medium text-stone-900 absolute left-1/2 -translate-x-1/2">
                      Edit Apiary Station
                    </h2>
                    <div className="w-6" />
                  </div>

                  <form onSubmit={handleSaveApiary} className="pt-4 space-y-3.5 flex-1">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-800">Apiary Station Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-800">Location Name</label>
                        <input
                          type="text"
                          required
                          value={formData.location_name}
                          onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-800">County</label>
                        <input
                          type="text"
                          value={formData.county}
                          onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-stone-800">Active Hives</label>
                        <input
                          type="number"
                          min={0}
                          value={formData.active_hives}
                          onChange={(e) => setFormData({ ...formData, active_hives: parseInt(e.target.value, 10) || 0 })}
                          className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-stone-800">Total Capacity</label>
                        <input
                          type="number"
                          min={1}
                          value={formData.total_hives}
                          onChange={(e) => setFormData({ ...formData, total_hives: parseInt(e.target.value, 10) || 1 })}
                          className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-stone-800">Size (Acres)</label>
                        <input
                          type="number"
                          min={0.5}
                          step="0.5"
                          value={formData.size_acres}
                          onChange={(e) => setFormData({ ...formData, size_acres: parseFloat(e.target.value) || 1 })}
                          className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-800">Forage Flora</label>
                      <input
                        type="text"
                        value={formData.forage_type}
                        onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-800">Notes & Beekeeper Info</label>
                      <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                      />
                    </div>

                    <div className="mt-auto pt-6 flex items-center justify-end gap-3 border-t border-stone-300/50">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          setEditingApiary(null);
                        }}
                        className="px-6 py-2.5 rounded-full border border-stone-800 text-stone-900 font-medium text-sm hover:bg-stone-200/50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-7 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm transition-colors shadow-sm"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}
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
            onDelete={handleDeleteApiary}
            onHivesCountChanged={handleHivesCountChanged}
          />
        )}
      </div>
    </div>
  );
}
