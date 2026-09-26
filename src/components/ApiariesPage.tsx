import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
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
  ClipboardCheck,
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
import { isTimothyUser } from "@/lib/user-hives";
import { downloadReportPdf, safeName } from "@/lib/report-pdf";
import { AddHiveModal as PopoutAddHiveModal } from "./AddHiveModal";
import { FrameSenseToolPage } from "./FrameSenseToolPage";
import { SyrupFeedingToolPage } from "./SyrupFeedingToolPage";
import { syncApiaryForageToFlorage, syncAllApiariesToFlorage } from "@/lib/florage-sync";

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
  name?: string;
  category: DeviceCategory;
  deviceType: string;
  serial: string;
  hiveCode?: string;
  status: "active" | "online" | "optimal" | "low_battery" | "calibrating";
  lastSync?: string;
  telemetrySummary?: string;
  model?: string;
  installedAt?: string;
  batteryPct?: number;
  signalStrength?: string;
  lastPing?: string;
  firmwareVersion?: string;
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
    active_hives: 150,
    total_hives: 184,
    size_acres: 5,
    forage_type: "Acacia, Neem, Maize, Mango & Forest Multifloral",
    notes: "Lead Beekeeper: Timothy Nduva. 150 active producing colonies across 184 managed Langstroth hive stands on 5 acres in Kibwezi ecosystem, Kenya (34 standby stands awaiting swarm colonization).",
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

// Canonical Harvests for BeeYield Apiary (843.0 kg across 7 Verified Harvest Cycles, matching 423 batches)
export const CANONICAL_KIBWEZI_HARVESTS: ApiaryHarvestItem[] = [
  {
    id: "harv-kib-2026-01",
    batch: "BEE-20260103",
    harvested_on: "2026-01-03",
    honey_type: "Early Spring Acacia Blossom (Acacia, Neem, Maize, Mango & Forest Multifloral)",
    quantity_kg: 60.0,
    moisture_pct: 16.8,
    color_grade: "Extra Light Amber",
    quality_grade: "Export Grade A Raw (<18% moisture)",
  },
  {
    id: "harv-kib-2025-02",
    batch: "BEE-20250615",
    harvested_on: "2025-06-15",
    honey_type: "Forest Multifloral (Acacia, Neem, Maize, Mango & Forest Multifloral)",
    quantity_kg: 300.0,
    moisture_pct: 16.9,
    color_grade: "Dark Amber",
    quality_grade: "Export Grade A Raw (<18% moisture)",
  },
  {
    id: "harv-kib-2024-01",
    batch: "BEE-20240615",
    harvested_on: "2024-06-15",
    honey_type: "Wildflower & Acacia (Acacia, Neem, Maize, Mango & Forest Multifloral)",
    quantity_kg: 250.0,
    moisture_pct: 17.0,
    color_grade: "Extra White",
    quality_grade: "Export Grade A Raw (<18% moisture)",
  },
  {
    id: "harv-kib-2023-01",
    batch: "BEE-20230615",
    harvested_on: "2023-06-15",
    honey_type: "Wildflower (Acacia, Neem, Maize, Mango & Forest Multifloral)",
    quantity_kg: 105.0,
    moisture_pct: 16.8,
    color_grade: "Water White",
    quality_grade: "Export Grade A Raw (<18% moisture)",
  },
  {
    id: "harv-kib-2022-01",
    batch: "BEE-20220615",
    harvested_on: "2022-06-15",
    honey_type: "Forest Acacia (Acacia, Neem, Maize, Mango & Forest Multifloral)",
    quantity_kg: 55.0,
    moisture_pct: 17.5,
    color_grade: "Amber",
    quality_grade: "Export Grade A Raw (<18% moisture)",
  },
  {
    id: "harv-kib-2021-01",
    batch: "BEE-20210615",
    harvested_on: "2021-06-15",
    honey_type: "Wildflower (Acacia, Neem, Maize, Mango & Forest Multifloral)",
    quantity_kg: 60.0,
    moisture_pct: 17.1,
    color_grade: "Light Amber",
    quality_grade: "Export Grade A Raw (<18% moisture)",
  },
  {
    id: "harv-kib-2020-01",
    batch: "BEE-20200615",
    harvested_on: "2020-06-15",
    honey_type: "Wildflower Pioneer (Acacia, Neem, Maize, Mango & Forest Multifloral)",
    quantity_kg: 13.0,
    moisture_pct: 17.4,
    color_grade: "Amber",
    quality_grade: "Export Grade A Raw (<18% moisture)",
  },
];


// Helper to generate verified harvest batches matching Timothy Nduva's 423 ledger batches
function getCanonicalBatchesForHive(hiveIndex: number): HiveHarvestBatch[] {
  const result: HiveHarvestBatch[] = [];
  const pad = String(hiveIndex + 1).padStart(3, "0");
  const code = `KIB-${pad}`;

  // 2026: 30 batches (hives 1..30)
  if (hiveIndex < 30) {
    result.push({
      id: `batch-${code}-2026`,
      batchCode: `BEE-20260103-${pad}`,
      date: "2026-01-03",
      quantityKg: 2.0,
      honeyType: "Early Spring Acacia Blossom",
      moisturePct: 16.8,
    });
  }

  // 2025: 150 batches (hives 1..150)
  if (hiveIndex < 150) {
    result.push({
      id: `batch-${code}-2025`,
      batchCode: `BEE-20250615-${pad}`,
      date: "2025-06-15",
      quantityKg: 2.0,
      honeyType: "Forest Multifloral",
      moisturePct: 16.9,
    });
  }

  // 2024: 125 batches (hives 1..125)
  if (hiveIndex < 125) {
    result.push({
      id: `batch-${code}-2024`,
      batchCode: `BEE-20240615-${pad}`,
      date: "2024-06-15",
      quantityKg: 2.0,
      honeyType: "Wildflower & Acacia",
      moisturePct: 17.0,
    });
  }

  // 2023: 53 batches (hives 1..53)
  if (hiveIndex < 53) {
    result.push({
      id: `batch-${code}-2023`,
      batchCode: `BEE-20230615-${pad}`,
      date: "2023-06-15",
      quantityKg: hiveIndex === 52 ? 1.0 : 2.0,
      honeyType: "Wildflower",
      moisturePct: 16.8,
    });
  }

  // 2022: 28 batches (hives 1..28)
  if (hiveIndex < 28) {
    result.push({
      id: `batch-${code}-2022`,
      batchCode: `BEE-20220615-${pad}`,
      date: "2022-06-15",
      quantityKg: hiveIndex === 27 ? 1.0 : 2.0,
      honeyType: "Forest Acacia",
      moisturePct: 17.5,
    });
  }

  // 2021: 30 batches (hives 1..30)
  if (hiveIndex < 30) {
    result.push({
      id: `batch-${code}-2021`,
      batchCode: `BEE-20210615-${pad}`,
      date: "2021-06-15",
      quantityKg: 2.0,
      honeyType: "Wildflower",
      moisturePct: 17.1,
    });
  }

  // 2020: 7 batches (hives 1..7)
  if (hiveIndex < 7) {
    result.push({
      id: `batch-${code}-2020`,
      batchCode: `BEE-20200615-${pad}`,
      date: "2020-06-15",
      quantityKg: hiveIndex === 6 ? 1.0 : 2.0,
      honeyType: "Wildflower Pioneer",
      moisturePct: 17.4,
    });
  }

  return result;
}

// Initial Hives with Queen Details and Harvest Batches
// Differentiates 150 active producing colonies from 34 standby/empty stands (KIB-151..184)
export const CANONICAL_KIBWEZI_HIVES: ApiaryHiveItem[] = Array.from({ length: 184 }, (_, i) => {
  const code = `KIB-${String(i + 1).padStart(3, "0")}`;
  const hasColony = i < 150;
  const breedingYear = hasColony ? (i % 6 === 0 ? 2024 : i % 11 === 0 ? 2023 : 2025) : 0;
  const isSpecial = hasColony && (i % 12 === 0);
  const batches = getCanonicalBatchesForHive(i);

  return {
    id: `hive-kib-${String(i + 1).padStart(3, "0")}`,
    code,
    name: `${code} (Langstroth 10)`,
    hiveType: "Langstroth 10-Frame",
    queenPresent: hasColony,
    queenBreedingYear: breedingYear,
    queenStatus: hasColony
      ? (isSpecial ? "Active Laying Queen (Young, Marked)" : "Active Laying Queen (Marked)")
      : "No Queen (Standby Box)",
    broodFrames: hasColony ? 6 : 0,
    honeyFrames: hasColony ? 4 : 0,
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

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
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
    </div>,
    document.body
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
      { label: "Fair Trade Beekeeper Value", value: `KES ${(batch.quantityKg * 1000).toLocaleString()}` },
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
  const moisture = harvest.moisture_pct;
  const isExport = moisture <= 18.0;
  void downloadReportPdf({
    filename: `Certified-Harvest-${safeName(harvest.batch)}.pdf`,
    title: `Certified Honey Harvest Batch • ${harvest.batch}`,
    subtitle: `${harvest.honey_type} • ${harvest.quality_grade}`,
    meta: [
      { label: "Producer / Beekeeper", value: "Timothy Nduva (Lead Apiarist)" },
      { label: "Date of Extraction", value: harvest.harvested_on },
      { label: "Hive Identifier", value: harvest.hiveCode || "Colony Lot" },
      { label: "Batch Lot Number", value: harvest.batch },
      { label: "Florage & Nectar Source", value: "Acacia, Neem, Maize, Mango & Forest Multifloral" },
      { label: "Apiary Site", value: normalizeApiaryName(apiaryName) },
      { label: "Location", value: normalizeApiaryLocation(locationName) },
      { label: "Net Volume Extracted", value: `${harvest.quantity_kg.toFixed(1)} kg` },
      { label: "Refractometer Moisture", value: `${harvest.moisture_pct}%` },
      { label: "Color Classification", value: harvest.color_grade },
      { label: "Official Quality Standard", value: harvest.quality_grade },
      { label: "Fair Trade Beekeeper Value", value: `KES ${(harvest.quantity_kg * 1000).toLocaleString()}` },
      { label: "Cumulative Certified Yield", value: "843.0 kg KEBS Certified" },
    ],
    sections: [
      {
        type: "kv",
        heading: "Commercial Compliance & Quality Standards",
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


// ----------------------------------------------------------------------
// Companion Mobile Style Helper Icons (Matching User Screenshots)
// ----------------------------------------------------------------------
export function HiveLayersIcon({ className = "w-5 h-5 text-amber-500" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="3.5" width="14" height="4" rx="1.5" />
      <rect x="4" y="9" width="16" height="5" rx="1.5" />
      <rect x="5" y="15.5" width="14" height="4.5" rx="1.5" />
      <line x1="10" y1="11.5" x2="14" y2="11.5" />
      <line x1="3" y1="21.5" x2="21" y2="21.5" />
    </svg>
  );
}

export function BatteryIndicatorIcon({ className = "w-5 h-5 text-amber-500" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="7" width="16" height="10" rx="2" />
      <line x1="20" y1="10" x2="20" y2="14" />
      <rect x="4" y="9" width="10" height="6" fill="currentColor" rx="1" />
    </svg>
  );
}

export function BluetoothWaveIcon({ className = "w-5 h-5 text-emerald-600" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 12l5 5V7l-5 5h10" />
      <path d="M18 8a5 5 0 0 1 0 8" />
      <path d="M21 5a9 9 0 0 1 0 14" />
    </svg>
  );
}

export function BeeSilhouetteIcon({ className = "w-5 h-5 text-amber-600" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="13" rx="4.5" ry="6.5" />
      <circle cx="12" cy="5" r="2.5" />
      <path d="M9 12h6" />
      <path d="M9 15h6" />
      <path d="M7.5 10c-3-1-4.5-3.5-3-5.5s4.5.5 4 4" />
      <path d="M16.5 10c3-1 4.5-3.5 3-5.5s-4.5.5-4 4" />
      <path d="M12 19.5v2" />
    </svg>
  );
}


export function CameraPlusIcon({ className = "w-12 h-12 text-[#9A9187] dark:text-stone-500" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

export function ShieldHeartIcon({ className = "w-5 h-5 text-amber-600" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8c-1.5-1.5-4 0-2.5 2.5L12 13l2.5-2.5C16 8 13.5 6.5 12 8z" />
    </svg>
  );
}


// ----------------------------------------------------------------------
// Interactive Companion Sensor Telemetry Chart Component (Matching Screenshots)
// ----------------------------------------------------------------------
interface CompanionSensorChartProps {
  type: "inside_temp" | "humidity" | "pressure" | "outside_temp" | "weight" | "honey_gain";
  title: string;
  currentValue: string;
  icon: React.ReactNode;
  infoTooltip?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  externalTemp?: number;
  externalHumidity?: number;
}

export function CompanionSensorChart({
  type,
  title,
  currentValue,
  icon,
  infoTooltip,
  isExpanded,
  onToggleExpand,
  externalTemp,
  externalHumidity,
}: CompanionSensorChartProps) {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "1mo" | "3mo" | "6mo">("24h");
  const [showTrend, setShowTrend] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Timeframe-specific data
  const chartData = useMemo(() => {
    if (type === "inside_temp") {
      const minVal = timeframe === "24h" ? 20.5 : timeframe === "7d" ? 19.8 : 18.5;
      const maxVal = timeframe === "24h" ? 35.5 : timeframe === "7d" ? 36.2 : 37.0;
      const points = [
        { x: 75, y: 133, val: 24.0 },
        { x: 105, y: 143, val: 22.5 },
        { x: 135, y: 149, val: 21.5 },
        { x: 165, y: 149, val: 21.5 },
        { x: 195, y: 152, val: 21.0 },
        { x: 215, y: 156, val: minVal, isMin: true },
        { x: 245, y: 105, val: 28.0 },
        { x: 275, y: 77, val: 32.0 },
        { x: 305, y: 52, val: maxVal, isMax: true },
        { x: 325, y: 60, val: 34.5 },
        { x: 345, y: 63, val: 34.0 },
        { x: 365, y: 74, val: 32.5 },
        { x: 385, y: 99, val: 29.0 },
      ];
      return {
        unit: "°C",
        minText: `${minVal} °C`,
        maxText: `${maxVal} °C`,
        yTicks: ["40.0 °C", "35.0 °C", "30.0 °C", "25.0 °C", "20.0 °C"],
        yTickPos: [20, 55, 90, 125, 160],
        points,
        minPoint: points.find((p) => p.isMin)!,
        maxPoint: points.find((p) => p.isMax)!,
      };
    } else if (type === "humidity") {
      const minVal = timeframe === "24h" ? 56 : timeframe === "7d" ? 52 : 48;
      const maxVal = timeframe === "24h" ? 59 : timeframe === "7d" ? 68 : 74;
      const points = [
        { x: 75, y: 103, val: 58 },
        { x: 105, y: 103, val: 58 },
        { x: 135, y: 103, val: 58 },
        { x: 165, y: 103, val: 58 },
        { x: 195, y: 100, val: maxVal, isMax: true },
        { x: 225, y: 101, val: 58 },
        { x: 255, y: 106, val: 57 },
        { x: 285, y: 102, val: 58 },
        { x: 315, y: 104, val: 58 },
        { x: 335, y: 102, val: 58 },
        { x: 355, y: 106, val: 57 },
        { x: 375, y: 107, val: 57 },
        { x: 385, y: 110, val: minVal, isMin: true },
      ];
      return {
        unit: "%",
        minText: `${minVal} %`,
        maxText: `${maxVal} %`,
        yTicks: ["80 %", "70 %", "60 %", "50 %", "40 %"],
        yTickPos: [20, 55, 90, 125, 160],
        points,
        minPoint: points.find((p) => p.isMin)!,
        maxPoint: points.find((p) => p.isMax)!,
      };
    } else if (type === "pressure") {
      const minVal = timeframe === "24h" ? 904 : timeframe === "7d" ? 901 : 898;
      const maxVal = timeframe === "24h" ? 910 : timeframe === "7d" ? 913 : 915;
      const points = [
        { x: 75, y: 70, val: 908 },
        { x: 105, y: 47, val: 909 },
        { x: 135, y: 70, val: 908 },
        { x: 165, y: 92, val: 907 },
        { x: 195, y: 92, val: 907 },
        { x: 235, y: 70, val: 908 },
        { x: 275, y: 47, val: 909 },
        { x: 305, y: 25, val: maxVal, isMax: true },
        { x: 325, y: 70, val: 908 },
        { x: 345, y: 92, val: 907 },
        { x: 360, y: 160, val: minVal, isMin: true },
        { x: 375, y: 138, val: 905 },
        { x: 385, y: 115, val: 906 },
      ];
      return {
        unit: "hPa",
        minText: `${minVal} hPa`,
        maxText: `${maxVal} hPa`,
        yTicks: ["910 hPa", "908 hPa", "906 hPa", "904 hPa"],
        yTickPos: [25, 70, 115, 160],
        points,
        minPoint: points.find((p) => p.isMin)!,
        maxPoint: points.find((p) => p.isMax)!,
      };
    } else if (type === "outside_temp") {
      const cur = externalTemp || 28;
      const minVal = (cur - 8.5).toFixed(1);
      const maxVal = (cur + 5.5).toFixed(1);
      const points = [
        { x: 75, y: 130, val: cur - 5 },
        { x: 125, y: 145, val: cur - 7 },
        { x: 175, y: 155, val: minVal, isMin: true },
        { x: 235, y: 95, val: cur + 1 },
        { x: 295, y: 50, val: maxVal, isMax: true },
        { x: 345, y: 75, val: cur + 3 },
        { x: 385, y: 100, val: cur },
      ];
      return {
        unit: "°C",
        minText: `${minVal} °C`,
        maxText: `${maxVal} °C`,
        yTicks: ["40.0 °C", "35.0 °C", "30.0 °C", "25.0 °C", "20.0 °C"],
        yTickPos: [20, 55, 90, 125, 160],
        points,
        minPoint: points.find((p) => p.isMin)!,
        maxPoint: points.find((p) => p.isMax)!,
      };
    } else {
      // Weight / Honey Gain
      const points = [
        { x: 75, y: 140, val: 42.1, isMin: true },
        { x: 125, y: 135, val: 42.3 },
        { x: 175, y: 125, val: 42.7 },
        { x: 235, y: 110, val: 43.1 },
        { x: 295, y: 85, val: 43.6 },
        { x: 345, y: 65, val: 43.9, isMax: true },
        { x: 385, y: 70, val: 43.8 },
      ];
      return {
        unit: "kg",
        minText: "42.1 kg",
        maxText: "43.9 kg",
        yTicks: ["45.0 kg", "44.0 kg", "43.0 kg", "42.0 kg", "41.0 kg"],
        yTickPos: [20, 55, 90, 125, 160],
        points,
        minPoint: points.find((p) => p.isMin)!,
        maxPoint: points.find((p) => p.isMax)!,
      };
    }
  }, [type, timeframe, externalTemp]);

  // Construct SVG paths
  const areaPath = useMemo(() => {
    if (!chartData.points.length) return "";
    const pts = chartData.points;
    const baseLine = 160;
    const lineParts = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    return `${lineParts} L ${pts[pts.length - 1].x} ${baseLine} L ${pts[0].x} ${baseLine} Z`;
  }, [chartData]);

  const linePath = useMemo(() => {
    if (!chartData.points.length) return "";
    return chartData.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [chartData]);

  return (
    <div className={`transition-all rounded-2xl ${isExpanded ? "bg-[#FAF4EE] dark:bg-[#1E1B18] border border-[#EFE8DE] dark:border-stone-800 p-4 sm:p-5 shadow-sm space-y-4" : "py-1.5"}`}>
      {/* Header Row */}
      <div
        onClick={onToggleExpand}
        className="flex items-center justify-between cursor-pointer select-none group"
      >
        <div className="flex items-center gap-3">
          <div className="text-[#8C6D46] dark:text-amber-400">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[#2E2A25] dark:text-stone-200">
                {title}
              </span>
              {infoTooltip && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info(infoTooltip);
                  }}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {isExpanded && (
              <span className="text-xl font-bold font-mono text-[#2E2A25] dark:text-stone-100 block mt-0.5">
                {currentValue}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
          {!isExpanded && (
            <span className="text-sm font-semibold text-[#2E2A25] dark:text-stone-200">
              {currentValue}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-[#2E2A25] dark:text-stone-200 transition-transform" />
          ) : (
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors" />
          )}
        </div>
      </div>

      {/* Expanded Chart View */}
      {isExpanded && (
        <div className="space-y-4 pt-1 border-t border-[#EAE3DA] dark:border-stone-800/80">
          {/* Timeframe Pills */}
          <div className="grid grid-cols-5 gap-1.5 p-1 bg-[#F2ECE4] dark:bg-stone-900/60 rounded-2xl text-xs font-semibold">
            {(["24h", "7d", "1mo", "3mo", "6mo"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`py-1.5 text-center rounded-xl transition-all ${
                  timeframe === tf
                    ? "bg-[#FFB800] text-stone-950 font-bold shadow-sm"
                    : "text-[#4A4315] dark:text-stone-300 hover:bg-[#E5EBB2]/50"
                }`}
              >
                {tf === "7d" ? "7 d" : tf === "1mo" ? "1 mo." : tf === "3mo" ? "3 mo." : tf === "6mo" ? "6 mo." : tf}
              </button>
            ))}
          </div>

          {/* Min & Max Indicators + Fullscreen Icon */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-bold text-[#2E2A25] dark:text-stone-200">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm" />
                Min {chartData.minText}
              </span>
              <span className="flex items-center gap-1.5 font-bold text-[#2E2A25] dark:text-stone-200">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-sm" />
                Max {chartData.maxText}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFullscreen(!isFullscreen);
                toast.info(`Expanded ${title} high-resolution telemetric graph`);
              }}
              className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              title="Toggle fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#4A601E] dark:text-emerald-400">
            <span className="w-4 h-0.5 bg-[#4A601E] dark:bg-emerald-400 rounded-full inline-block" />
            <span>Measurement</span>
          </div>

          {/* Interactive SVG Chart */}
          <div className="w-full overflow-hidden bg-[#FAF4EE] dark:bg-[#1A1815] rounded-2xl p-2 border border-[#EAE3DA] dark:border-stone-800">
            <svg
              viewBox="0 0 400 190"
              className="w-full h-auto select-none"
              style={{ overflow: "visible" }}
            >
              {/* Humidity Colored Threshold Bands */}
              {type === "humidity" && (
                <g>
                  {/* Top Critical Zone (>80%) */}
                  <rect x="65" y="5" width="325" height="25" fill="#FDE8E8" opacity="0.75" />
                  <line x1="65" y1="30" x2="390" y2="30" stroke="#F59E0B" strokeDasharray="3 3" strokeWidth="1.2" />

                  {/* High Warning Zone (70% - 80%) */}
                  <rect x="65" y="30" width="325" height="35" fill="#FEF3C7" opacity="0.6" />

                  {/* Optimal Zone (55% - 70%) */}
                  <rect x="65" y="65" width="325" height="52" fill="#EAF5E1" opacity="0.8" />
                  <line x1="65" y1="65" x2="390" y2="65" stroke="#10B981" strokeDasharray="3 3" strokeWidth="1.2" />

                  {/* Low Warning Zone (45% - 55%) */}
                  <rect x="65" y="117" width="325" height="30" fill="#FEF3C7" opacity="0.6" />
                  <line x1="65" y1="117" x2="390" y2="117" stroke="#F59E0B" strokeDasharray="3 3" strokeWidth="1.2" />

                  {/* Bottom Critical Zone (<45%) */}
                  <rect x="65" y="147" width="325" height="25" fill="#FDE8E8" opacity="0.75" />
                  <line x1="65" y1="147" x2="390" y2="147" stroke="#DC2626" strokeDasharray="3 3" strokeWidth="1.2" />
                </g>
              )}

              {/* Horizontal Grid Lines & Y-Axis Labels */}
              {chartData.yTicks.map((label, i) => {
                const yPos = chartData.yTickPos[i];
                return (
                  <g key={i}>
                    <text
                      x="60"
                      y={yPos + 4}
                      textAnchor="end"
                      className="fill-stone-600 dark:fill-stone-400 text-[10px] font-mono font-medium"
                    >
                      {label}
                    </text>
                    {type !== "humidity" && (
                      <line
                        x1="65"
                        y1={yPos}
                        x2="390"
                        y2={yPos}
                        stroke="currentColor"
                        className="text-[#DCD5CB] dark:text-stone-800"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                    )}
                  </g>
                );
              })}

              {/* Area Fill for Temp and Pressure */}
              {type !== "humidity" && areaPath && (
                <path
                  d={areaPath}
                  fill="url(#greenGradientArea)"
                  opacity="0.9"
                />
              )}

              {/* Linear Gradient for Area Fill */}
              <defs>
                <linearGradient id="greenGradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D5E6B5" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#EAF2DA" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Optional Trend Trajectory Line */}
              {showTrend && chartData.points.length > 1 && (
                <line
                  x1={chartData.points[0].x}
                  y1={chartData.points[0].y}
                  x2={chartData.points[chartData.points.length - 1].x}
                  y2={chartData.points[chartData.points.length - 1].y}
                  stroke="#A16207"
                  strokeDasharray="4 4"
                  strokeWidth="2"
                />
              )}

              {/* Main Measurement Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#4A601E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points */}
              {chartData.points.map((pt, idx) => {
                if (pt.isMin) {
                  return (
                    <g key={idx}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="6"
                        fill="#3B82F6"
                        opacity="0.3"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4"
                        fill="#3B82F6"
                        stroke="#FAF4EE"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                }
                if (pt.isMax) {
                  return (
                    <g key={idx}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="6"
                        fill="#EF4444"
                        opacity="0.3"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4"
                        fill="#EF4444"
                        stroke="#FAF4EE"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                }
                return (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r="2.5"
                    fill="#4A601E"
                    stroke="#FAF4EE"
                    strokeWidth="0.8"
                  />
                );
              })}

              {/* X-Axis Time Labels */}
              <text x="75" y="178" textAnchor="middle" className="fill-stone-600 dark:fill-stone-400 text-[10px] font-medium">
                21:00
              </text>

              <g>
                <text x="165" y="174" textAnchor="middle" className="fill-stone-700 dark:fill-stone-300 text-[10px] font-bold">
                  03:00
                </text>
                <text x="165" y="185" textAnchor="middle" className="fill-stone-500 dark:fill-stone-400 text-[9px]">
                  24 Sep
                </text>
              </g>

              <text x="265" y="178" textAnchor="middle" className="fill-stone-600 dark:fill-stone-400 text-[10px] font-medium">
                09:00
              </text>

              <text x="355" y="178" textAnchor="middle" className="fill-stone-600 dark:fill-stone-400 text-[10px] font-medium">
                15:00
              </text>
            </svg>
          </div>

          {/* Show Trend Toggle Switch */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="font-semibold text-[#2E2A25] dark:text-stone-200">
              Show trend
            </span>
            <button
              type="button"
              onClick={() => setShowTrend(!showTrend)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                showTrend
                  ? "bg-[#FFB800]"
                  : "bg-[#DCD5CB] dark:bg-stone-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-stone-200 shadow-md transition-transform ${
                  showTrend ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Dedicated Pair VitalSensor Hardware Modal (Full Pop-Out Dialog)
// ----------------------------------------------------------------------
function PairVitalSensorModal({
  isOpen,
  hiveCode,
  hiveName,
  currentSerial,
  onClose,
  onPair,
}: {
  isOpen: boolean;
  hiveCode: string;
  hiveName: string;
  currentSerial?: string;
  onClose: () => void;
  onPair: (serial: string, deviceType: string) => void;
}) {
  const [deviceType, setDeviceType] = useState<string>("Apisense VitalSensor v2.4 (Brood Cluster Temp & Acoustics)");
  const [serial, setSerial] = useState(currentSerial || "");
  const [showCamera, setShowCamera] = useState(false);
  const containerId = "pair-vitalsensor-qr-scanner-portal";

  useEffect(() => {
    if (currentSerial) setSerial(currentSerial);
  }, [currentSerial]);

  // Escape key dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Live QR Camera Scanner logic
  useEffect(() => {
    if (!isOpen || !showCamera) return;
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
              const cleaned = decodedText.trim().toUpperCase();
              setSerial(cleaned);
              setShowCamera(false);
              toast.success(`Scanned hardware code: ${cleaned}`);
              void html5QrCode?.stop().catch(() => undefined);
            }
          },
          () => {}
        );
      } catch (err) {
        toast.error("Camera scanner unavailable. Please enter code manually.");
        setShowCamera(false);
      }
    };

    void startScanner();

    return () => {
      isMounted = false;
      if (html5QrCode && html5QrCode.isScanning) {
        void html5QrCode.stop().catch(() => undefined);
      }
    };
  }, [isOpen, showCamera]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const final = serial.trim().toUpperCase();
    if (!final) {
      toast.error("Please enter or scan a sensor serial");
      return;
    }
    onPair(final, deviceType);
    onClose();
  };

  const cleanNum = hiveCode.replace(/^KIB-?/i, "").padStart(3, "0") || "001";
  const quickSerials = [`VS-KBZ-${cleanNum}`, `VS-KBZ-042`, `SCALE-KBZ-150`];

  return createPortal(
    <div
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#FBF8F4] dark:bg-[#181614] border border-[#EFE8DE] dark:border-stone-800 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 my-auto animate-in zoom-in-95 duration-200 text-[#2E2A25] dark:text-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#EAE3DA] dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold shrink-0">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground leading-tight">
                Pair VitalSensor Hardware
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Mount hardware node to <strong className="text-amber-700 dark:text-amber-400">{hiveName}</strong> ({hiveCode})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showCamera ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              Align VitalSensor QR code within camera viewfinder:
            </p>
            <div
              id={containerId}
              className="w-full h-56 rounded-2xl overflow-hidden bg-black/95 border-2 border-dashed border-amber-500/60 flex items-center justify-center relative shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowCamera(false)}
              className="w-full py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
            >
              Cancel Camera Scan (Enter Manually)
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Hardware Device Model
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Apisense VitalSensor v2.4 (Brood Cluster Temp & Acoustics)">
                  Apisense VitalSensor v2.4 (Cluster Temp & Acoustics)
                </option>
                <option value="Apisense Pro Scale 150kg (Continuous Honey Yield Telemetry)">
                  Apisense Pro Scale 150kg (Telemetry Load Cell)
                </option>
                <option value="ApiSense VarroaSense Acoustic AI (Pathogen & Swarm Detection)">
                  ApiSense VarroaSense Acoustic AI (Optical/Acoustic)
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-foreground">
                  VitalSensor Serial / QR Code *
                </label>
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center gap-1 hover:underline"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan with Camera</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={serial}
                  onChange={(e) => setSerial(e.target.value.toUpperCase())}
                  placeholder="e.g. VS-KBZ-002 or SENSOR-9824"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 font-mono text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-amber-500 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-amber-600 transition-colors"
                  title="Scan with Camera"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Found on the waterproof casing label or QR barcode sticker.
              </p>
            </div>

            {/* Quick serial chips */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-muted-foreground font-semibold block">
                Quick sample codes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickSerials.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSerial(s)}
                    className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-amber-100 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-300 border border-border text-[10px] font-mono font-bold transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE3DA] dark:border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!serial.trim()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Confirm & Pair Sensor
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

// ----------------------------------------------------------------------
// Interactive Clickable Hive Detail Modal
// ----------------------------------------------------------------------
function HiveDetailModal({
  hive: initialHive,
  apiary,
  weather,
  initialTab = "hive_state",
  allHives,
  allInspections = [],
  onInspectionLogged,
  onClose,
  onUpdateHive,
  onAddHarvestToHive,
  onOpenScanner,
  onEditHive,
  onDeleteHive,
  onDeleteBatch,
  onEditBatch,
}: {
  hive: ApiaryHiveItem;
  apiary: ApiarySite;
  weather?: LiveWeatherData;
  initialTab?: "hive_state" | "syrup" | "framesense" | "notes" | "inspections";
  allHives?: ApiaryHiveItem[];
  allInspections?: any[];
  onInspectionLogged?: () => void;
  onClose: () => void;
  onUpdateHive: (updated: ApiaryHiveItem) => void;
  onAddHarvestToHive: (batch: Omit<HiveHarvestBatch, "id">) => void;
  onOpenScanner: () => void;
  onEditHive?: (hive: ApiaryHiveItem) => void;
  onDeleteHive?: (hiveId: string, hiveCode: string) => void;
  onDeleteBatch?: (batchId: string) => void;
  onEditBatch?: (batch: HiveHarvestBatch) => void;
}) {
  const [activeHive, setActiveHive] = useState<ApiaryHiveItem>(initialHive);
  const { user } = useAuth();
  const hive = activeHive;
  const [activeTab, setActiveTab] = useState<"hive_state" | "syrup" | "framesense" | "notes" | "inspections">(initialTab);
  const [activeSubScreen, setActiveSubScreen] = useState<"main" | "colony_strength">("main");

  // Sync state if initialHive or initialTab change
  useEffect(() => {
    setActiveHive(initialHive);
  }, [initialHive]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Keyboard navigation & Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeSubScreen !== "main") {
          setActiveSubScreen("main");
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSubScreen, onClose]);

  // Hive paging in modal
  const currentIndex = allHives ? allHives.findIndex((h) => h.id === hive.id || h.code === hive.code) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && allHives && currentIndex < allHives.length - 1;
  const handlePrevHive = () => {
    if (hasPrev && allHives) {
      setActiveHive(allHives[currentIndex - 1]);
    }
  };
  const handleNextHive = () => {
    if (hasNext && allHives) {
      setActiveHive(allHives[currentIndex + 1]);
    }
  };
  
  // Find latest physical inspection for this hive
  const cleanCodeNum = hive.code.replace(/^KIB-?/i, "").replace(/^0+/, "");
  const hiveInspection = allInspections.find((insp: any) => {
    const lbl = (insp.hive_label || insp.hive_code || "").toLowerCase();
    const cleanLbl = lbl.replace(/^kib-?/i, "").replace(/^beeyield\s*/i, "").replace(/^0+/, "").trim();
    return lbl.includes(hive.code.toLowerCase()) || (cleanCodeNum && cleanLbl === cleanCodeNum);
  });

  const [showAddInspectionForm, setShowAddInspectionForm] = useState(false);
  const [newInspection, setNewInspection] = useState({
    colonyHealth: "Healthy",
    temperament: "Calm",
    broodFrames: hive.broodFrames || 6,
    honeyFrames: hive.honeyFrames || 4,
    queenSeen: true,
    varroaCount: 0,
    notes: "",
  });
  const [editingBroodFrames, setEditingBroodFrames] = useState(false);
  const [tempBroodFrames, setTempBroodFrames] = useState(hive.broodFrames !== undefined ? String(hive.broodFrames) : "");
  const [editingNote, setEditingNote] = useState(false);
  const [beekeeperNote, setBeekeeperNote] = useState(hive.queenStatus || "");
  const [showMenu, setShowMenu] = useState(false);
  const [showPairVitalSensorModal, setShowPairVitalSensorModal] = useState(false);
  const [showAddHarvestForm, setShowAddHarvestForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<HiveHarvestBatch | null>(null);
  const [expandedMetric, setExpandedMetric] = useState<
    "inside_temp" | "humidity" | "pressure" | "outside_temp" | "weight" | "honey_gain" | null
  >("outside_temp");

  // FrameSense Tool State (Matching Screenshots 1, 2, 3)
  const [frameSenseSubScreen, setFrameSenseSubScreen] = useState<"list" | "add_photos" | "view_report">("list");
  const [selectedReport, setSelectedReport] = useState<FrameSenseAnalysis | null>(null);
  const [middlePhoto, setMiddlePhoto] = useState<string | null>(null);
  const [firstPhoto, setFirstPhoto] = useState<string | null>(null);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [isAnalyzingFrames, setIsAnalyzingFrames] = useState(false);

  const [frameSenseList, setFrameSenseList] = useState<FrameSenseAnalysis[]>(() => {
    try {
      const stored = localStorage.getItem(`framesense_${hive.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: `fs-${hive.id}-1`,
        timestamp: "14.07.2026, 07:35",
        status: "Analysis completed",
        broodPct: 0,
        storesPct: 0,
        combSurfacePct: 0,
        queenCells: 0,
        aiRecommendations: "No brood detected in selected frame. Comb foundation freshly introduced. Monitor for egg laying in next 3 days.",
      },
      {
        id: `fs-${hive.id}-2`,
        timestamp: "13.07.2026, 22:47",
        status: "Analysis completed",
        broodPct: 0,
        storesPct: 0,
        combSurfacePct: 59,
        queenCells: 0,
        aiRecommendations: "Comb surface 59% drawn with worker cells. Stores starting to accumulate in upper arch. Queen presence verified active.",
      },
    ];
  });

  const saveFrameSenseList = (newList: FrameSenseAnalysis[]) => {
    setFrameSenseList(newList);
    try {
      localStorage.setItem(`framesense_${hive.id}`, JSON.stringify(newList));
    } catch {}
  };

  const handleSendForAnalysis = () => {
    setIsAnalyzingFrames(true);
    setTimeout(() => {
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()}, ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      const newReport: FrameSenseAnalysis = {
        id: `fs-${hive.id}-${Date.now()}`,
        timestamp: dateStr,
        status: "Analysis completed",
        broodPct: 48,
        storesPct: 32,
        combSurfacePct: 85,
        queenCells: 0,
        middlePhotoUrl: middlePhoto || undefined,
        firstPhotoUrl: firstPhoto || undefined,
        lastPhotoUrl: lastPhoto || undefined,
        aiRecommendations: "BeeYield AI Diagnostics: High-density solid worker brood pattern in central frame. Honey stores cap 32% of perimeter. Zero swarm or emergency queen cells detected.",
      };

      const updated = [newReport, ...frameSenseList];
      saveFrameSenseList(updated);
      setIsAnalyzingFrames(false);
      setFrameSenseSubScreen("list");
      setMiddlePhoto(null);
      setFirstPhoto(null);
      setLastPhoto(null);
      toast.success(`BeeYield AI completed FrameSense analysis for ${displayName}!`);
    }, 1200);
  };

  // Syrup Calculator State (Matching Screenshot)
  const [calcRatio, setCalcRatio] = useState<"1:1" | "3:2" | "2:1">("3:2");
  const [calcTargetVolume, setCalcTargetVolume] = useState<string>("");
  const [showHowToPrepare, setShowHowToPrepare] = useState(true);

  // Syrup Calculation Logic
  const syrupCalculation = useMemo(() => {
    const v = parseFloat(calcTargetVolume);
    if (isNaN(v) || v <= 0) {
      return { water: "–", sugar: "–", valid: false };
    }
    let waterL = 0;
    let sugarKg = 0;
    if (calcRatio === "1:1") {
      waterL = v / 1.625;
      sugarKg = waterL * 1.0;
    } else if (calcRatio === "3:2") {
      waterL = v / 1.9375;
      sugarKg = waterL * 1.5;
    } else {
      // 2:1
      waterL = v / 2.25;
      sugarKg = waterL * 2.0;
    }
    return {
      water: waterL.toFixed(2),
      sugar: sugarKg.toFixed(2),
      valid: true,
    };
  }, [calcRatio, calcTargetVolume]);

  // Syrup Feeding Form State
  const [showAddSyrupForm, setShowAddSyrupForm] = useState(false);
  const [syrupLiters, setSyrupLiters] = useState(5.0);
  const [syrupRatio, setSyrupRatio] = useState("1:1 Spring Nectar Stimulant");
  const [syrupHistory, setSyrupHistory] = useState([
    { date: "2026-09-20", amount: "5.0 L", type: "1:1 Sugar Syrup", notes: "Pre-flowering stimulation" },
  ]);

  const [newBatch, setNewBatch] = useState({
    batchCode: `KBZ-${new Date().getFullYear()}-${String(hive.batches.length + 1).padStart(2, "0")}`,
    date: new Date().toISOString().split("T")[0],
    quantityKg: 15.0,
    honeyType: "Raw Acacia Blossom",
    moisturePct: 17.1,
  });

  const queenColor = getQueenYearColor(hive.queenBreedingYear);
  const displayName = hive.code.startsWith("KIB-") ? `beeyield ${hive.code.replace("KIB-", "")}` : hive.code;

  const handleDeleteBatch = async (batchId: string) => {
    const confirmed = await confirmAsync("Are you sure you want to delete this harvest batch?");
    if (!confirmed) return;
    if (onDeleteBatch) {
      onDeleteBatch(batchId);
    } else {
      const updatedBatches = hive.batches.filter((b) => b.id !== batchId);
      onUpdateHive({ ...hive, batches: updatedBatches });
      toast.success("Harvest batch deleted");
    }
  };

  const handleSaveBatch = (updated: HiveHarvestBatch) => {
    if (onEditBatch) {
      onEditBatch(updated);
    } else {
      const updatedBatches = hive.batches.map((b) => (b.id === updated.id ? updated : b));
      onUpdateHive({ ...hive, batches: updatedBatches });
      toast.success("Harvest batch updated");
    }
    setEditingBatch(null);
  };

  const handleSaveHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    onAddHarvestToHive({
      batchCode: newBatch.batchCode,
      date: newBatch.date,
      quantityKg: newBatch.quantityKg,
      honeyType: newBatch.honeyType,
      moisturePct: newBatch.moisturePct,
    });
    setShowAddHarvestForm(false);
    setNewBatch({
      batchCode: `KBZ-${new Date().getFullYear()}-${String(hive.batches.length + 2).padStart(2, "0")}`,
      date: new Date().toISOString().split("T")[0],
      quantityKg: 15.0,
      honeyType: "Raw Acacia Blossom",
      moisturePct: 17.1,
    });
    toast.success(`Logged ${newBatch.quantityKg} kg honey harvest batch`);
  };

  const handleSaveBroodFrames = () => {
    const val = parseInt(tempBroodFrames, 10);
    if (!isNaN(val) && val >= 0) {
      onUpdateHive({ ...hive, broodFrames: val });
      toast.success(`Colony strength updated: ${val} frames`);
    }
    setEditingBroodFrames(false);
  };

  const handleSaveNote = () => {
    onUpdateHive({ ...hive, queenStatus: beekeeperNote });
    setEditingNote(false);
    toast.success("Beekeeper note saved");
  };

  const handleAddSyrupLog = (e: React.FormEvent) => {
    e.preventDefault();
    setSyrupHistory([
      {
        date: new Date().toISOString().split("T")[0],
        amount: `${syrupLiters.toFixed(1)} L`,
        type: syrupRatio,
        notes: "Routine nutritional supplement",
      },
      ...syrupHistory,
    ]);
    setShowAddSyrupForm(false);
    toast.success(`Recorded ${syrupLiters} L syrup feed`);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FBF8F4] dark:bg-[#181614] border border-[#EFE8DE] dark:border-stone-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200 text-[#2E2A25] dark:text-stone-200"
        onClick={(e) => e.stopPropagation()}
      >

        {/* SCREEN 2: COLONY STRENGTH SUB-SCREEN (Screenshot 5) */}
        {activeSubScreen === "colony_strength" ? (
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Sub-screen Header */}
            <div className="p-4 sm:px-6 flex items-center justify-between border-b border-[#EFE8DE] dark:border-stone-800 bg-[#FAF4EE] dark:bg-[#1C1917]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubScreen("main")}
                  className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Back to hive state"
                  title="Back to hive overview"
                >
                  <ChevronLeft className="w-6 h-6 text-[#2E2A25] dark:text-stone-100" />
                </button>
                <div>
                  <span className="text-[11px] text-[#8E8880] font-semibold block leading-none">
                    {displayName}
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-[#2E2A25] dark:text-stone-100 mt-0.5">
                    Colony strength
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#2E2A25] dark:text-stone-100"
                aria-label="Close"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-header with Hive Name */}
            <div className="px-5 py-3 bg-[#F2ECE4] dark:bg-[#25221F] border-b border-[#EAE3DA] dark:border-stone-800 flex items-center gap-2.5">
              <HiveLayersIcon className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span className="font-semibold text-sm text-[#2E2A25] dark:text-stone-200">
                {displayName}
              </span>
            </div>

            {/* Colony Strength Main Display */}
            <div className="p-6 space-y-6 flex-1">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF4EE] dark:bg-[#211E1B] border border-[#EAE3DA] dark:border-stone-800">
                <ShieldHeartIcon className="w-8 h-8 text-[#8C6D46] dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-mono">
                      {hive.broodFrames !== undefined ? `${hive.broodFrames} Frames` : "-"}
                    </span>
                    <button
                      type="button"
                      onClick={() => toast.info("Colony strength is calculated by frames of covered brood & adult bee density.")}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingBroodFrames(true)}
                      className="p-1 text-stone-500 hover:text-amber-600 transition-colors ml-auto"
                      title="Edit strength"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#8E8880] mt-1">
                    {hive.broodFrames !== undefined
                      ? `${hive.broodFrames} covered brood comb frames verified`
                      : "No colony strength data"}
                  </p>

                  {editingBroodFrames && (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={tempBroodFrames}
                        onChange={(e) => setTempBroodFrames(e.target.value)}
                        placeholder="e.g. 8"
                        className="w-24 px-3 py-1.5 rounded-xl border border-amber-500/50 bg-white dark:bg-stone-900 text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleSaveBroodFrames}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingBroodFrames(false)}
                        className="px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* History Section */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[#2E2A25] dark:text-stone-100">
                  History
                </h3>
                <div className="p-4 rounded-2xl bg-[#FAF4EE] dark:bg-[#211E1B] border border-[#EAE3DA] dark:border-stone-800 text-sm text-[#8E8880]">
                  {hive.broodFrames !== undefined ? (
                    <div className="flex items-center justify-between text-xs text-[#2E2A25] dark:text-stone-200">
                      <span>Inspection logged: {hive.broodFrames} brood frames</span>
                      <span className="text-[#8E8880]">2026-09-24</span>
                    </div>
                  ) : (
                    "No colony strength data"
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SCREEN 1: MAIN HIVE VIEW (Screenshots 2, 3, 4) */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top Bar with Back Arrow, Title, Navigation Pager, More Menu & Close Button */}
            <div className="p-4 sm:px-6 flex items-center justify-between border-b border-[#EFE8DE] dark:border-stone-800 bg-[#FAF4EE] dark:bg-[#1C1917]">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
                  aria-label="Back to apiary"
                  title="Back to apiary"
                >
                  <ChevronLeft className="w-6 h-6 text-[#2E2A25] dark:text-stone-100" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-[#8E8880] font-semibold leading-none truncate">
                    <span>{apiary.name.toLowerCase() === "beeyield main apiary" ? "beeyield apiary" : apiary.name}</span>
                    <span>•</span>
                    <span className="capitalize">{hive.hiveType || "Langstroth"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2E2A25] dark:text-stone-100">
                      {displayName}
                    </h1>
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300/40 px-2 py-0.5 rounded-full shrink-0">
                      {hive.queenPresent ? "Queenright" : "Standby"}
                    </span>
                    {allHives && allHives.length > 1 && currentIndex !== -1 && (
                      <div className="flex items-center gap-0.5 bg-black/5 dark:bg-white/5 rounded-xl p-0.5 border border-stone-200/50 dark:border-stone-800 shrink-0">
                        <button
                          type="button"
                          disabled={!hasPrev}
                          onClick={handlePrevHive}
                          className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                          title="Previous hive"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-mono font-bold px-1 text-muted-foreground">
                          {currentIndex + 1}/{allHives.length}
                        </span>
                        <button
                          type="button"
                          disabled={!hasNext}
                          onClick={handleNextHive}
                          className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                          title="Next hive"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMenu((v) => !v)}
                    className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    aria-label="More options"
                    title="Hive actions"
                  >
                    <MoreVertical className="w-5 h-5 text-[#2E2A25] dark:text-stone-100" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-stone-900 border border-border rounded-2xl shadow-xl py-2 z-50 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          if (onEditHive) onEditHive(hive);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 font-medium"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit Hive Info
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onOpenScanner();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 font-medium"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-500" /> Scan / Pair Sensor
                      </button>
                      {onDeleteHive && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            onDeleteHive(hive.id, hive.code);
                            onClose();
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 flex items-center gap-2 font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Hive
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#2E2A25] dark:text-stone-100"
                  aria-label="Close hive details"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 5 Horizontal Navigation Tabs */}
            <div className="px-3 border-b border-[#EFE8DE] dark:border-stone-800 bg-[#FAF4EE] dark:bg-[#1C1917] flex items-center justify-around overflow-x-auto text-xs font-semibold scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("hive_state")}
                className={`py-3 px-2 flex flex-col items-center gap-1 relative border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "hive_state"
                    ? "border-amber-600 text-amber-700 dark:text-amber-400 font-bold"
                    : "border-transparent text-[#8E8880] hover:text-foreground"
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Hive state</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("syrup")}
                className={`py-3 px-2 flex flex-col items-center gap-1 relative border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "syrup"
                    ? "border-amber-600 text-amber-700 dark:text-amber-400 font-bold"
                    : "border-transparent text-[#8E8880] hover:text-foreground"
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span>Syrup</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("framesense")}
                className={`py-3 px-2 flex flex-col items-center gap-1 relative border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "framesense"
                    ? "border-amber-600 text-amber-700 dark:text-amber-400 font-bold"
                    : "border-transparent text-[#8E8880] hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>FrameSense</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`py-3 px-2 flex flex-col items-center gap-1 relative border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "notes"
                    ? "border-amber-600 text-amber-700 dark:text-amber-400 font-bold"
                    : "border-transparent text-[#8E8880] hover:text-foreground"
                }`}
              >
                <Pencil className="w-4 h-4" />
                <span>Notes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("inspections")}
                className={`py-3 px-2 flex flex-col items-center gap-1 relative border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "inspections"
                    ? "border-amber-600 text-amber-700 dark:text-amber-400 font-bold"
                    : "border-transparent text-[#8E8880] hover:text-foreground"
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Inspections</span>
              </button>
            </div>

            {/* Scrollable Main Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">

              {/* TAB 1: HIVE STATE (Screenshots 2, 3, 4) */}
              {activeTab === "hive_state" && (
                <div className="space-y-4">
                  {/* CARD 1: HEALTH */}
                  <div className="bg-[#FAF4EE] dark:bg-[#1E1B18] rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] dark:border-stone-800 space-y-3 shadow-sm">
                    <h3 className="text-base font-bold text-[#2E2A25] dark:text-stone-100">
                      Health
                    </h3>

                    {/* Colony Strength Row */}
                    <div
                      onClick={() => setActiveSubScreen("colony_strength")}
                      className="flex items-center justify-between py-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-xl px-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldHeartIcon className="w-5 h-5 text-[#8C6D46] dark:text-amber-400" />
                        <span className="text-sm font-medium text-[#2E2A25] dark:text-stone-200">
                          Colony strength
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                        <span className="text-sm font-bold font-mono">
                          {hive.broodFrames !== undefined ? `${hive.broodFrames} frames` : "-"}
                        </span>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </div>
                    </div>

                    {/* Clinical Inspection Status Banner */}
                    {hiveInspection?.issues && hiveInspection.issues.length > 0 ? (
                      <div className="bg-[#FFEDEC] dark:bg-rose-950/30 border border-[#FCDAD7] dark:border-rose-900/50 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            <span className="text-xs font-bold">Inspection Findings • Issues Flagged</span>
                          </div>
                          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400">
                            {hiveInspection.inspected_on}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hiveInspection.issues.map((iss: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 text-[10px] font-bold">
                              {iss}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#EAF5E1] dark:bg-emerald-950/30 border border-[#9DC384]/60 dark:border-emerald-900/50 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#36681E] dark:text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold">Physical Inspection Diagnostic: Healthy</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            {hiveInspection?.inspected_on || "Standard Cycle"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#36681E]/80 dark:text-emerald-300/80">
                          Zero diseases or pest infestations detected. Queen sighted, brood pattern uniform, hygienic bottom board clean.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CARD 2: HARVEST YIELD & EXTRACTION AUDIT */}
                  <div className="bg-[#FAF4EE] dark:bg-[#1E1B18] rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] dark:border-stone-800 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[#2E2A25] dark:text-stone-100">
                        Harvest Yield & Extraction Logs
                      </h3>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300/40">
                        Physical Audit
                      </span>
                    </div>

                    <CompanionSensorChart
                      type="weight"
                      title="Cumulative extracted harvest"
                      currentValue={
                        hive.batches.length > 0
                          ? `${hive.batches.reduce((sum, b) => sum + b.quantityKg, 0).toFixed(1)} kg`
                          : "0.0 kg"
                      }
                      icon={<Scale className="w-5 h-5 text-[#8C6D46] dark:text-amber-400" />}
                      infoTooltip="Certified honey harvest yield logged across all extraction batches"
                      isExpanded={expandedMetric === "weight"}
                      onToggleExpand={() =>
                        setExpandedMetric(expandedMetric === "weight" ? null : "weight")
                      }
                    />
                  </div>

                  {/* CARD 3: CONDITIONS (Apiary Outside Weather & Microclimate) */}
                  <div className="bg-[#FAF4EE] dark:bg-[#1E1B18] rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] dark:border-stone-800 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[#2E2A25] dark:text-stone-100">
                        Outside Weather & Microclimate
                      </h3>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 px-2 py-0.5 rounded-full">
                        Open-Meteo Live API
                      </span>
                    </div>

                    {/* Outside Temperature */}
                    <CompanionSensorChart
                      type="outside_temp"
                      title="Outside temperature"
                      currentValue={weather?.currentTemp ? `${Math.round(weather.currentTemp)}°C` : "26°C"}
                      icon={<Sun className="w-5 h-5 text-amber-500" />}
                      isExpanded={expandedMetric === "outside_temp"}
                      onToggleExpand={() =>
                        setExpandedMetric(expandedMetric === "outside_temp" ? null : "outside_temp")
                      }
                      externalTemp={weather?.currentTemp}
                    />

                    {/* Outside Relative Humidity */}
                    <CompanionSensorChart
                      type="humidity"
                      title="Outside relative humidity"
                      currentValue={weather?.currentHumidity ? `${weather.currentHumidity}%` : "55%"}
                      icon={<Droplets className="w-5 h-5 text-blue-500" />}
                      isExpanded={expandedMetric === "humidity"}
                      onToggleExpand={() =>
                        setExpandedMetric(expandedMetric === "humidity" ? null : "humidity")
                      }
                      externalHumidity={weather?.currentHumidity}
                    />

                    <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                      Apiary ambient meteorological data. No intrusive electronic sensors installed in hive interior.
                    </p>
                  </div>

                  {/* CARD 4: QUEEN */}
                  <div className="bg-[#FAF4EE] dark:bg-[#1E1B18] rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] dark:border-stone-800 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[#2E2A25] dark:text-stone-100">
                        Queen
                      </h3>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>

                    {/* Breeding Year */}
                    <div className="flex items-center gap-3 py-1.5">
                      <Calendar className="w-5 h-5 text-[#8C6D46] dark:text-amber-400" />
                      <div>
                        <span className="text-xs text-[#8E8880] block">Breeding year</span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2E2A25] dark:text-stone-200">
                          <span className={`w-2.5 h-2.5 rounded-full ${queenColor.dot}`} />
                          {hive.queenBreedingYear || 2026}
                        </span>
                      </div>
                    </div>

                    {/* Origin */}
                    <div className="flex items-center gap-3 py-1.5">
                      <Shield className="w-5 h-5 text-[#8C6D46] dark:text-amber-400" />
                      <div>
                        <span className="text-xs text-[#8E8880] block">Origin</span>
                        <span className="text-sm font-medium text-[#2E2A25] dark:text-stone-200">
                          Own breeding
                        </span>
                      </div>
                    </div>

                    {/* Queen Insemination Method */}
                    <div className="flex items-center gap-3 py-1.5">
                      <Shield className="w-5 h-5 text-[#8C6D46] dark:text-amber-400" />
                      <div>
                        <span className="text-xs text-[#8E8880] block">Queen insemination method</span>
                        <span className="text-sm font-medium text-[#2E2A25] dark:text-stone-200">
                          Natural
                        </span>
                      </div>
                    </div>

                    {/* Beekeeper's Note */}
                    <div className="pt-2 border-t border-[#EFE8DE] dark:border-stone-800">
                      <span className="text-xs text-[#8E8880] block">Beekeeper's note</span>
                      {editingNote ? (
                        <div className="mt-1 space-y-2">
                          <input
                            type="text"
                            value={beekeeperNote}
                            onChange={(e) => setBeekeeperNote(e.target.value)}
                            placeholder="Add observation..."
                            className="w-full text-xs px-3 py-1.5 rounded-xl border border-amber-500 bg-white dark:bg-stone-900"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleSaveNote}
                              className="px-3 py-1 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingNote(false)}
                              className="px-2 py-1 rounded-lg border text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingNote(true)}
                          className="text-sm font-semibold underline text-[#2E2A25] dark:text-stone-200 hover:text-amber-600 transition-colors"
                        >
                          {beekeeperNote ? beekeeperNote : "Fill in"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SYRUP (Feeding Management) */}
              {activeTab === "syrup" && (
                <div className="space-y-5">
                  <div className="bg-[#FAF4EE] dark:bg-[#1E1B18] rounded-3xl p-5 sm:p-6 border border-[#EFE8DE] dark:border-stone-800 space-y-5 text-[#2E2A25] dark:text-stone-200 shadow-sm">
                    {/* Header Title from Screenshot */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h2 className="text-2xl font-bold tracking-tight text-[#2E2A25] dark:text-stone-100">
                        Syrup calculator
                      </h2>
                      {allHives && allHives.length > 1 && (
                        <div className="flex items-center gap-1.5 bg-[#F3ECE3] dark:bg-[#25221F] px-3 py-1 rounded-xl text-xs">
                          <span className="text-[#8E8880] text-[11px] font-semibold">Linked to:</span>
                          <select
                            value={hive.id}
                            onChange={(e) => {
                              const found = allHives.find((h) => h.id === e.target.value);
                              if (found) setActiveHive(found);
                            }}
                            className="bg-transparent font-bold text-[#2E2A25] dark:text-stone-100 border-none outline-none text-xs cursor-pointer"
                          >
                            {allHives.map((h) => (
                              <option key={h.id} value={h.id}>
                                {h.code.startsWith("KIB-") ? `beeyield ${h.code.replace("KIB-", "")}` : h.code}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Ratio Section */}
                    <div className="space-y-2">
                      <span className="text-sm font-bold text-[#2E2A25] dark:text-stone-200 block">
                        Ratio:
                      </span>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setCalcRatio("1:1")}
                          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                            calcRatio === "1:1"
                              ? "bg-[#FCD99F] dark:bg-amber-500/40 text-stone-950 dark:text-stone-100 shadow-sm"
                              : "border border-[#DCD5CB] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#5C5349] dark:text-stone-300 hover:bg-[#F3ECE3]"
                          }`}
                        >
                          1:1
                        </button>
                        <button
                          type="button"
                          onClick={() => setCalcRatio("3:2")}
                          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                            calcRatio === "3:2"
                              ? "bg-[#FCD99F] dark:bg-amber-500/40 text-stone-950 dark:text-stone-100 shadow-sm"
                              : "border border-[#DCD5CB] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#5C5349] dark:text-stone-300 hover:bg-[#F3ECE3]"
                          }`}
                        >
                          3:2
                        </button>
                        <button
                          type="button"
                          onClick={() => setCalcRatio("2:1")}
                          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                            calcRatio === "2:1"
                              ? "bg-[#FCD99F] dark:bg-amber-500/40 text-stone-950 dark:text-stone-100 shadow-sm"
                              : "border border-[#DCD5CB] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#5C5349] dark:text-stone-300 hover:bg-[#F3ECE3]"
                          }`}
                        >
                          2:1
                        </button>
                      </div>

                      {/* Ratio Description */}
                      <p className="text-xs text-[#7A6E68] dark:text-stone-400 pt-1">
                        {calcRatio === "3:2" && "Medium — all-purpose, summer and autumn"}
                        {calcRatio === "1:1" && "Thin — spring stimulation, brood rearing & wax building"}
                        {calcRatio === "2:1" && "Heavy — autumn and winter storage feed, late reserves"}
                      </p>
                    </div>

                    {/* How Much Syrup Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#2E2A25] dark:text-stone-200 block">
                        How much syrup do I want to make?
                      </label>
                      <div className="bg-[#F3ECE3] dark:bg-[#25221F] rounded-2xl px-4 py-3.5 flex items-center justify-between border border-transparent focus-within:border-amber-500/50 transition-colors">
                        <input
                          type="number"
                          step="0.5"
                          min="0.1"
                          value={calcTargetVolume}
                          onChange={(e) => setCalcTargetVolume(e.target.value)}
                          placeholder="Enter a value"
                          className="w-full bg-transparent border-none outline-none text-sm font-semibold text-[#2E2A25] dark:text-stone-100 placeholder:text-[#9A9187]"
                        />
                        <span className="text-sm font-semibold text-[#5C5349] dark:text-stone-400 pl-2">
                          l
                        </span>
                      </div>
                    </div>

                    {/* Calculated Results Box */}
                    <div className="bg-[#F3ECE3] dark:bg-[#25221F] rounded-2xl p-4 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-[#8E8880] block">
                          Water
                        </span>
                        <span className="text-base font-semibold text-[#2E2A25] dark:text-stone-100 mt-0.5 block">
                          {syrupCalculation.water} l
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-[#8E8880] block">
                          Sugar
                        </span>
                        <span className="text-base font-semibold text-[#2E2A25] dark:text-stone-100 mt-0.5 block">
                          {syrupCalculation.sugar} kg
                        </span>
                      </div>
                    </div>

                    {/* Quick Button to Log Feeding if Valid */}
                    {syrupCalculation.valid && (
                      <button
                        type="button"
                        onClick={() => {
                          const v = parseFloat(calcTargetVolume) || 0;
                          const newLog = {
                            date: new Date().toISOString().split("T")[0],
                            amount: `${v.toFixed(1)} L`,
                            type: `${calcRatio} Sugar Syrup`,
                            notes: `Mixed with ${syrupCalculation.water} L water & ${syrupCalculation.sugar} kg white sucrose`,
                          };
                          setSyrupHistory([newLog, ...syrupHistory]);
                          toast.success(`Logged ${v.toFixed(1)} L (${calcRatio}) syrup feed for ${displayName}`);
                        }}
                        className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Coffee className="w-4 h-4" />
                        Log {calcTargetVolume} L ({calcRatio}) feeding to {displayName}
                      </button>
                    )}

                    {/* How to Prepare Accordion Section (Screenshots 1 & 2) */}
                    <div className="pt-2 border-t border-[#EAE3DA] dark:border-stone-800">
                      <div
                        onClick={() => setShowHowToPrepare(!showHowToPrepare)}
                        className="flex items-center justify-between cursor-pointer select-none py-1"
                      >
                        <h3 className="text-sm font-bold text-[#2E2A25] dark:text-stone-200">
                          How to prepare
                        </h3>
                        {showHowToPrepare ? (
                          <ChevronUp className="w-5 h-5 text-[#2E2A25] dark:text-stone-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#2E2A25] dark:text-stone-300" />
                        )}
                      </div>

                      {showHowToPrepare && (
                        <div className="pt-3 space-y-4 text-xs text-[#5C5349] dark:text-stone-300 leading-relaxed">
                          <div className="flex items-start gap-2.5">
                            <span className="font-bold text-[#2E2A25] dark:text-stone-100 shrink-0">1.</span>
                            <p>
                              <strong className="text-[#2E2A25] dark:text-stone-100 font-bold">Use white sugar, pure sucrose.</strong> Not brown, not cane, not unrefined. Dark sugars carry residues bees cannot digest — in winter feed that is a straight road to dysentery in the colony.
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <span className="font-bold text-[#2E2A25] dark:text-stone-100 shrink-0">2.</span>
                            <p>
                              <strong className="text-[#2E2A25] dark:text-stone-100 font-bold">Weigh the sugar on a scale, do not measure it by volume.</strong> A litre of granulated sugar weighs about 0.85 kg, not a kilogram. Measured with a cup it gives a syrup of a different strength than the one you asked for.
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <span className="font-bold text-[#2E2A25] dark:text-stone-100 shrink-0">3.</span>
                            <p>
                              <strong className="text-[#2E2A25] dark:text-stone-100 font-bold">Boil the water and take the pot off the heat — only then pour in the sugar.</strong> Syrup is not boiled: prolonged heating turns sucrose into HMF, which is harmful to bees. Hot water is enough, the flame is no longer needed.
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <span className="font-bold text-[#2E2A25] dark:text-stone-100 shrink-0">4.</span>
                            <p>
                              <strong className="text-[#2E2A25] dark:text-stone-100 font-bold">Add it in batches and stir until the last crystal is gone.</strong> Undissolved sugar settles at the bottom of the feeder — the bees will not take it, and the rest of the syrup crystallises sooner. At 2:1 you need really hot water, because it is a solution at the edge of solubility.
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <span className="font-bold text-[#2E2A25] dark:text-stone-100 shrink-0">5.</span>
                            <p>
                              <strong className="text-[#2E2A25] dark:text-stone-100 font-bold">Serve it lukewarm, not hot.</strong> Hot syrup raises the temperature and humidity inside the nest.
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <span className="font-bold text-[#2E2A25] dark:text-stone-100 shrink-0">6.</span>
                            <p>
                              <strong className="text-[#2E2A25] dark:text-stone-100 font-bold">Make only as much as the colony takes within a few days.</strong> Syrup standing longer in the feeder or in a bucket ferments, and fermented feed causes dysentery in winter.
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <span className="font-bold text-[#2E2A25] dark:text-stone-100 shrink-0">7.</span>
                            <p>
                              <strong className="text-[#2E2A25] dark:text-stone-100 font-bold">Do not spill syrup around the hive and do not leave open containers.</strong> The smell of sugar in a dearth triggers robbing — foreign bees then attack weaker colonies.
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <span className="font-bold text-[#2E2A25] dark:text-stone-100 shrink-0">8.</span>
                            <p>
                              <strong className="text-[#2E2A25] dark:text-stone-100 font-bold">Check the feeder after 2–4 days and see whether the colony is taking the feed.</strong>
                            </p>
                          </div>

                          {/* Caution Notice Box (Screenshot 2) */}
                          <div className="bg-[#F2ECE4] dark:bg-[#25221F] rounded-2xl p-4 text-xs font-medium text-[#5C5349] dark:text-stone-300 text-center leading-relaxed border border-[#EAE3DA] dark:border-stone-800 mt-2">
                            Do not feed during a flow you want to harvest honey from — the sugar would end up in the honey.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recent Feeding Sessions */}
                    {syrupHistory.length > 0 && (
                      <div className="pt-3 border-t border-[#EAE3DA] dark:border-stone-800 space-y-2">
                        <span className="text-xs font-bold text-[#8E8880] block">
                          Recent Feeding History ({displayName})
                        </span>
                        {syrupHistory.map((s, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-[#EAE3DA] dark:border-stone-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-foreground block">{s.type}</span>
                              <span className="text-[#8E8880] text-[10px]">
                                {s.date} · {s.notes}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                              {s.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FRAMESENSE (Frame Visualizer) */}
              {activeTab === "framesense" && (
                <div className="space-y-4">
                  {/* SCREEN A: ADD FRAME PHOTOS FOR AI ANALYSIS (Screenshots 1 & 3) */}
                  {frameSenseSubScreen === "add_photos" ? (
                    <div className="space-y-4 text-[#2E2A25] dark:text-stone-200">
                      {/* Top Bar inside sub-screen */}
                      <div className="flex items-center gap-3 pb-3 border-b border-[#EAE3DA] dark:border-stone-800">
                        <button
                          type="button"
                          onClick={() => setFrameSenseSubScreen("list")}
                          className="p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6 text-[#2E2A25] dark:text-stone-100" />
                        </button>
                        <h2 className="text-xl font-bold tracking-tight text-[#2E2A25] dark:text-stone-100">
                          FrameSense
                        </h2>
                      </div>

                      {/* Subheader Banner with Hive Code */}
                      <div className="px-4 py-2.5 bg-[#F2ECE4] dark:bg-[#25221F] rounded-2xl flex items-center gap-2.5">
                        <HiveLayersIcon className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                        <span className="font-semibold text-sm text-[#2E2A25] dark:text-stone-200">
                          {displayName}
                        </span>
                      </div>

                      {/* AI Description text from Screenshot 1 */}
                      <p className="text-xs text-[#5C5349] dark:text-stone-300 leading-relaxed">
                        AI-based analysis of frame photos — classifies comb cells, detects queen cells, determines coverage and estimates the number of bees, and provides recommendations.
                      </p>

                      {/* Add Frame Photos Section Header & Guidance */}
                      <div className="space-y-1.5 pt-1">
                        <h3 className="text-sm font-bold text-[#2E2A25] dark:text-stone-100">
                          Add frame photos for analysis
                        </h3>
                        <p className="text-xs text-[#7A6E68] dark:text-stone-400 leading-relaxed">
                          The frame should be fully visible in the photo (no cropped corners or edges) and fill almost the entire frame, leaving only a small margin. When possible, take the photo against a uniform background to ensure the highest quality AI analysis.
                        </p>
                      </div>

                      {/* SLOT 1: Middle (central) frame (Required) */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#2E2A25] dark:text-stone-200">
                            Middle (central) frame
                          </span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            Required
                          </span>
                        </div>

                        <label className="block cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                setMiddlePhoto(url);
                              }
                            }}
                          />
                          <div className="w-full h-44 rounded-3xl bg-[#F4EDE4] dark:bg-[#25221F] border border-[#EAE3DA] dark:border-stone-800 flex flex-col items-center justify-center p-4 hover:border-amber-500/50 transition-all overflow-hidden relative">
                            {middlePhoto ? (
                              <div className="w-full h-full relative">
                                <img
                                  src={middlePhoto}
                                  alt="Middle frame"
                                  className="w-full h-full object-cover rounded-2xl"
                                />
                                <button
                                  type="button"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    ev.stopPropagation();
                                    setMiddlePhoto(null);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <CameraPlusIcon className="w-12 h-12 text-[#9A9187] dark:text-stone-500" />
                                <span className="text-[11px] font-semibold text-[#8E8880]">
                                  Tap to capture or upload central frame
                                </span>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* SLOT 2: First frame in the hive (Optional) */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#2E2A25] dark:text-stone-200">
                            First frame in the hive
                          </span>
                          <span className="text-[#8E8880]">Optional</span>
                        </div>

                        <label className="block cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setFirstPhoto(URL.createObjectURL(file));
                            }}
                          />
                          <div className="w-full h-36 rounded-3xl bg-[#F4EDE4] dark:bg-[#25221F] border border-[#EAE3DA] dark:border-stone-800 flex flex-col items-center justify-center p-4 hover:border-amber-500/50 transition-all overflow-hidden relative">
                            {firstPhoto ? (
                              <div className="w-full h-full relative">
                                <img
                                  src={firstPhoto}
                                  alt="First frame"
                                  className="w-full h-full object-cover rounded-2xl"
                                />
                                <button
                                  type="button"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    ev.stopPropagation();
                                    setFirstPhoto(null);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <CameraPlusIcon className="w-10 h-10 text-[#9A9187] dark:text-stone-500" />
                            )}
                          </div>
                        </label>
                      </div>

                      {/* SLOT 3: Last frame in the hive (Optional) */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#2E2A25] dark:text-stone-200">
                            Last frame in the hive
                          </span>
                          <span className="text-[#8E8880]">Optional</span>
                        </div>

                        <label className="block cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setLastPhoto(URL.createObjectURL(file));
                            }}
                          />
                          <div className="w-full h-36 rounded-3xl bg-[#F4EDE4] dark:bg-[#25221F] border border-[#EAE3DA] dark:border-stone-800 flex flex-col items-center justify-center p-4 hover:border-amber-500/50 transition-all overflow-hidden relative">
                            {lastPhoto ? (
                              <div className="w-full h-full relative">
                                <img
                                  src={lastPhoto}
                                  alt="Last frame"
                                  className="w-full h-full object-cover rounded-2xl"
                                />
                                <button
                                  type="button"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    ev.stopPropagation();
                                    setLastPhoto(null);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <CameraPlusIcon className="w-10 h-10 text-[#9A9187] dark:text-stone-500" />
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Action Button: Send for analysis */}
                      <div className="pt-2 pb-4">
                        <button
                          type="button"
                          disabled={isAnalyzingFrames}
                          onClick={handleSendForAnalysis}
                          className="w-full py-3.5 rounded-2xl bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {isAnalyzingFrames ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                              <span>BeeYield AI analyzing frame cells...</span>
                            </>
                          ) : (
                            <span>Send for analysis</span>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : selectedReport ? (
                    /* SCREEN C: VIEW SPECIFIC REPORT */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#EAE3DA] dark:border-stone-800">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReport(null)}
                            className="p-1 rounded-xl hover:bg-black/5"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <div>
                            <span className="text-[11px] text-[#8E8880] block">AI Comb Diagnostics</span>
                            <h3 className="text-base font-bold">{selectedReport.timestamp}</h3>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {selectedReport.status}
                        </span>
                      </div>

                      {/* Metric Breakdown Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-[#FAF4EE] dark:bg-[#25221F] border border-[#EAE3DA] dark:border-stone-800">
                          <span className="text-xs text-[#8E8880] block">Brood Area</span>
                          <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
                            {selectedReport.broodPct}%
                          </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#FAF4EE] dark:bg-[#25221F] border border-[#EAE3DA] dark:border-stone-800">
                          <span className="text-xs text-[#8E8880] block">Stores (Honey/Pollen)</span>
                          <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
                            {selectedReport.storesPct}%
                          </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#FAF4EE] dark:bg-[#25221F] border border-[#EAE3DA] dark:border-stone-800">
                          <span className="text-xs text-[#8E8880] block">Comb Surface Drawn</span>
                          <span className="text-2xl font-bold font-mono text-[#2E2A25] dark:text-stone-100">
                            {selectedReport.combSurfacePct}%
                          </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#FAF4EE] dark:bg-[#25221F] border border-[#EAE3DA] dark:border-stone-800">
                          <span className="text-xs text-[#8E8880] block">Queen Cells Detected</span>
                          <span className="text-2xl font-bold font-mono text-emerald-600">
                            {selectedReport.queenCells}
                          </span>
                        </div>
                      </div>

                      {/* AI Recommendations */}
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600" /> BeeYield AI Analysis Summary
                        </span>
                        <p className="text-xs text-[#5C5349] dark:text-stone-300 leading-relaxed">
                          {selectedReport.aiRecommendations}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedReport(null)}
                        className="w-full py-2.5 rounded-xl border border-border text-xs font-semibold"
                      >
                        Back to Analysis List
                      </button>
                    </div>
                  ) : (
                    /* SCREEN B: FRAMESENSE ANALYSES LIST (Screenshot 2) */
                    <div className="space-y-4 relative pb-20">
                      {/* List of completed analyses */}
                      {frameSenseList.length > 0 ? (
                        <div className="space-y-3">
                          {frameSenseList.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedReport(item)}
                              className="p-4 rounded-2xl bg-[#FAF4EE] dark:bg-[#1E1B18] border border-[#EFE8DE] dark:border-stone-800 shadow-sm hover:border-amber-400/50 cursor-pointer transition-all space-y-3"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-[#EAE3DA] dark:border-stone-800 text-[#8C6D46] dark:text-amber-400">
                                    <LayoutGrid className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-[#2E2A25] dark:text-stone-100">
                                      {item.timestamp}
                                    </h4>
                                    <span className="text-xs text-[#8E8880]">
                                      {item.status}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updated = frameSenseList.filter((f) => f.id !== item.id);
                                      saveFrameSenseList(updated);
                                      toast.success("FrameSense analysis record removed");
                                    }}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                                    title="Delete record"
                                  >
                                    <Trash2 className="w-4 h-4 text-rose-600" />
                                  </button>
                                  <ChevronRight className="w-4 h-4 text-stone-400" />
                                </div>
                              </div>

                              {/* Metric Stats Row from Screenshot 2 */}
                              <div className="flex items-center gap-4 text-xs font-medium text-[#2E2A25] dark:text-stone-200 pt-1 border-t border-[#EAE3DA]/80 dark:border-stone-800/80 flex-wrap">
                                <span>
                                  <strong className="font-bold">{item.broodPct}%</strong> Brood
                                </span>
                                <span>
                                  <strong className="font-bold">{item.storesPct}%</strong> Stores
                                </span>
                                <span>
                                  <strong className="font-bold">{item.combSurfacePct}%</strong> Comb surface
                                </span>
                                <span>
                                  <strong className="font-bold">{item.queenCells}</strong> Queen cells
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center border border-dashed border-[#EAE3DA] dark:border-stone-800 rounded-3xl space-y-2">
                          <LayoutGrid className="w-8 h-8 text-stone-400 mx-auto" />
                          <p className="text-xs text-[#8E8880]">No FrameSense photo analyses for this hive yet.</p>
                          <p className="text-[11px] text-[#8E8880]">Tap "+ Add" to take photos and run BeeYield AI comb analysis.</p>
                        </div>
                      )}


                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: NOTES */}
              {activeTab === "notes" && (
                <div className="space-y-4">
                  <div className="bg-[#FAF4EE] dark:bg-[#1E1B18] rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] dark:border-stone-800 space-y-3">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-amber-600" /> Apiary Field Notes
                    </h3>
                    <textarea
                      rows={4}
                      value={beekeeperNote}
                      onChange={(e) => setBeekeeperNote(e.target.value)}
                      placeholder="Type beekeeping inspection notes, flora blooming notes, queen demeanor..."
                      className="w-full text-xs p-3 rounded-xl border border-border bg-white dark:bg-stone-900"
                    />
                    <button
                      type="button"
                      onClick={handleSaveNote}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
                    >
                      Save Observation
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: INSPECTIONS & HARVESTS */}
              {activeTab === "inspections" && (
                <div className="space-y-4">
                  {/* Physical Inspection Records */}
                  <div className="bg-[#FAF4EE] dark:bg-[#1E1B18] rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] dark:border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                        <ClipboardCheck className="w-4 h-4 text-emerald-600" /> Physical Inspection Log
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddInspectionForm((v) => !v)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{showAddInspectionForm ? "Cancel" : "Log Inspection"}</span>
                      </button>
                    </div>

                    {showAddInspectionForm && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const today = new Date().toISOString().slice(0, 10);
                          const userLsKey = user?.id ? `beeyield_local_inspections_v1_${user.id}` : `beeyield_local_inspections_v1`;
                          const currentList = JSON.parse(localStorage.getItem(userLsKey) || localStorage.getItem("beeyield_local_inspections_v1") || "[]");
                          const record = {
                            id: `insp-manual-${Date.now()}`,
                            inspected_on: today,
                            location: apiary.name,
                            hive_label: hive.code,
                            batch: "",
                            colony_health: newInspection.colonyHealth,
                            temperament: newInspection.temperament,
                            queen_seen: newInspection.queenSeen,
                            queen_cells: 0,
                            total_frames: 10,
                            brood_frames: Number(newInspection.broodFrames) || 6,
                            honey_frames: Number(newInspection.honeyFrames) || 4,
                            varroa_count: Number(newInspection.varroaCount) || 0,
                            issues: newInspection.colonyHealth === "Healthy" ? [] : ["Requires follow-up check"],
                            actions: ["Routine physical inspection performed"],
                            weather: weather ? `${Math.round(weather.currentTemp)}°C, ${weather.conditionText || "Clear"}` : "26°C Ambient",
                            notes: newInspection.notes || "Recorded via Hive Companion audit",
                            created_at: new Date().toISOString(),
                          };
                          const updated = [record, ...currentList];
                          localStorage.setItem(userLsKey, JSON.stringify(updated));
                          localStorage.setItem("beeyield_local_inspections_v1", JSON.stringify(updated));
                          setShowAddInspectionForm(false);
                          if (onInspectionLogged) onInspectionLogged();
                          toast.success(`Inspection recorded for ${hive.code}`);
                        }}
                        className="p-3.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-stone-900 space-y-3"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block">Colony Health</label>
                            <select
                              value={newInspection.colonyHealth}
                              onChange={(e) => setNewInspection({ ...newInspection, colonyHealth: e.target.value })}
                              className="w-full px-2 py-1 rounded-lg border border-border bg-background font-bold text-xs"
                            >
                              <option value="Healthy">Healthy</option>
                              <option value="Watch">Watch</option>
                              <option value="At risk">At risk</option>
                              <option value="Critical">Critical</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block">Temperament</label>
                            <select
                              value={newInspection.temperament}
                              onChange={(e) => setNewInspection({ ...newInspection, temperament: e.target.value })}
                              className="w-full px-2 py-1 rounded-lg border border-border bg-background text-xs"
                            >
                              <option value="Calm">Calm</option>
                              <option value="Nervous">Nervous</option>
                              <option value="Defensive">Defensive</option>
                              <option value="Aggressive">Aggressive</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block">Brood Frames</label>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={newInspection.broodFrames}
                              onChange={(e) => setNewInspection({ ...newInspection, broodFrames: parseInt(e.target.value) || 0 })}
                              className="w-full px-2 py-1 rounded-lg border border-border bg-background text-xs font-bold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block">Inspection Notes</label>
                          <input
                            type="text"
                            value={newInspection.notes}
                            onChange={(e) => setNewInspection({ ...newInspection, notes: e.target.value })}
                            placeholder="Queen sighted, healthy brood pattern, pollen stores full..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                          />
                        </div>
                        <button type="submit" className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors">
                          Save Physical Inspection
                        </button>
                      </form>
                    )}

                    {hiveInspection ? (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-[#EAE3DA] dark:border-stone-800 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Inspection Date: {hiveInspection.inspected_on}
                          </span>
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {hiveInspection.colony_health || "Healthy"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                          <span>Brood: <strong>{hiveInspection.brood_frames || 6} frames</strong></span>
                          <span>Honey Stores: <strong>{hiveInspection.honey_frames || 4} frames</strong></span>
                          <span>Queen: <strong>{hiveInspection.queen_seen !== false ? "Sighted Active" : "Not Sighted"}</strong></span>
                          <span>Temperament: <strong>{hiveInspection.temperament || "Calm"}</strong></span>
                        </div>
                        {hiveInspection.notes && (
                          <p className="text-[11px] text-foreground/80 italic pt-1 border-t border-border/40">
                            "{hiveInspection.notes}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-border/60 text-xs text-muted-foreground flex items-center justify-between">
                        <span>No physical inspection recorded for {hive.code} yet.</span>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Regular Cycle</span>
                      </div>
                    )}
                  </div>

                  {/* Harvest Batches */}
                  <div className="bg-[#FAF4EE] dark:bg-[#1E1B18] rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] dark:border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-amber-600" /> Honey Harvest Batches
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddHarvestForm((v) => !v)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs"
                      >
                        {showAddHarvestForm ? "Cancel" : "+ Add Harvest"}
                      </button>
                    </div>

                    {showAddHarvestForm && (
                      <form onSubmit={handleSaveHarvest} className="p-3.5 rounded-xl border border-amber-500/30 bg-white dark:bg-stone-900 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block">Batch Code</label>
                            <input
                              type="text"
                              required
                              value={newBatch.batchCode}
                              onChange={(e) => setNewBatch({ ...newBatch, batchCode: e.target.value })}
                              className="w-full px-2.5 py-1 rounded-lg border border-border bg-background font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block">Quantity (kg)</label>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              required
                              value={newBatch.quantityKg}
                              onChange={(e) => setNewBatch({ ...newBatch, quantityKg: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1 rounded-lg border border-border bg-background font-bold"
                            />
                          </div>
                        </div>
                        <button type="submit" className="w-full py-1.5 rounded-lg bg-amber-500 font-bold text-stone-950 text-xs">
                          Save Batch Log
                        </button>
                      </form>
                    )}

                    {hive.batches.length > 0 ? (
                      <div className="space-y-2">
                        {hive.batches.map((b) => (
                          <div key={b.id} className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-[#EAE3DA] dark:border-stone-800 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-mono font-bold text-foreground block">{b.batchCode}</span>
                              <span className="text-[#8E8880] text-[10px]">{b.date} · {b.honeyType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-600">{b.quantityKg.toFixed(1)} kg</span>
                              <button
                                type="button"
                                onClick={() => downloadBatchCert(b, hive.code, apiary.name, apiary.location_name)}
                                className="p-1 rounded-lg border border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                                title="Download Certificate"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8E8880] text-center py-3">No harvests logged yet.</p>
                    )}
                  </div>

                  {/* Sensor Pairing */}
                  <div className="bg-[#FAF4EE] dark:bg-[#1E1B18] rounded-2xl p-4 border border-[#EFE8DE] dark:border-stone-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8E8880] flex items-center gap-1.5">
                        <ScanLine className="w-4 h-4 text-amber-500" /> Sensor Pairing
                      </span>
                      {hive.sensorSerial ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          VitalSensor Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-border">
                          Unpaired
                        </span>
                      )}
                    </div>
                    {hive.sensorSerial ? (
                      <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 block">
                            {hive.sensorSerial}
                          </span>
                          <span className="text-[10px] text-muted-foreground">Paired VitalSensor Hardware</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowPairVitalSensorModal(true)}
                            className="px-2.5 py-1 rounded-lg border border-amber-400/50 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-500 hover:text-stone-950 transition-colors"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateHive({ ...hive, sensorSerial: undefined });
                              setActiveHive((prev) => ({ ...prev, sensorSerial: undefined }));
                              toast.success(`Unpaired sensor from ${displayName}`);
                            }}
                            className="px-2 py-1 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-[11px] hover:text-rose-600 transition-colors"
                          >
                            Unpair
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowPairVitalSensorModal(true)}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>+ Pair VitalSensor Hardware</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>


          </div>
        )}

        {editingBatch && (
          <EditBatchModal
            isOpen={true}
            batch={editingBatch}
            onClose={() => setEditingBatch(null)}
            onSave={handleSaveBatch}
          />
        )}

        {showPairVitalSensorModal && (
          <PairVitalSensorModal
            isOpen={showPairVitalSensorModal}
            hiveCode={hive.code}
            hiveName={displayName}
            currentSerial={hive.sensorSerial}
            onClose={() => setShowPairVitalSensorModal(false)}
            onPair={(serial, dType) => {
              const updated = { ...hive, sensorSerial: serial };
              onUpdateHive(updated);
              setActiveHive(updated);
              toast.success(`VitalSensor ${serial} paired to ${displayName}`);
            }}
          />
        )}
      </div>
    </div>,
    document.body
  );
}

// ----------------------------------------------------------------------
// Add / Scan Device Modal (Choose In Land, In Hive, Disease Devices + Scan or Enter Code)
// ----------------------------------------------------------------------
function AddDeviceModal({
  isOpen,
  apiary,
  hives,
  preselectedCategory = "in_hive",
  preselectedHiveCode,
  onClose,
  onAddDevice,
  onOpenScanner,
  scannedCode,
}: {
  isOpen: boolean;
  apiary: ApiarySite;
  hives: ApiaryHiveItem[];
  preselectedCategory?: DeviceCategory;
  preselectedHiveCode?: string;
  onClose: () => void;
  onAddDevice: (device: ApiaryDeviceItem) => void;
  onOpenScanner: () => void;
  scannedCode?: string;
}) {
  const [category, setCategory] = useState<DeviceCategory>(preselectedCategory);
  const [deviceType, setDeviceType] = useState<string>("Hive Weight Scale (Telemetry Load Cell)");
  const [deviceCode, setDeviceCode] = useState(scannedCode || "");
  const [targetHive, setTargetHive] = useState(preselectedHiveCode || (hives[0]?.code ?? ""));
  const [model, setModel] = useState("Apisense Pro Scale 150kg");

  useEffect(() => {
    if (scannedCode) {
      setDeviceCode(scannedCode);
    }
  }, [scannedCode]);

  useEffect(() => {
    if (isOpen) {
      setCategory(preselectedCategory);
      if (preselectedHiveCode) {
        setTargetHive(preselectedHiveCode);
      }
    }
  }, [isOpen, preselectedCategory, preselectedHiveCode]);

  useEffect(() => {
    if (category === "in_hive") {
      setDeviceType("Hive Weight Scale (Telemetry Load Cell)");
      setModel("Apisense Pro Scale 150kg");
    } else if (category === "in_land") {
      setDeviceType("Microclimate Weather Station (Open-Meteo Gateway)");
      setModel("Apisense Solar LoRa Gateway v3");
    } else if (category === "disease_devices") {
      setDeviceType("ApiSense Early Varroa Optical & Acoustic Detector");
      setModel("ApiSense VarroaSense Acoustic AI");
    }
  }, [category]);

  if (!isOpen) return null;

  const activeCategoryMeta = DEVICE_CATEGORIES.find((c) => c.id === category) || DEVICE_CATEGORIES[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = deviceCode.trim();
    if (!finalCode) {
      toast.error("Please enter or scan a device code / serial");
      return;
    }

    const newDevice: ApiaryDeviceItem = {
      id: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      category,
      deviceType,
      serial: finalCode.toUpperCase(),
      hiveCode: category === "in_land" ? undefined : (targetHive || undefined),
      status: "optimal",
      lastSync: "Just registered",
      telemetrySummary:
        category === "in_hive" && deviceType.toLowerCase().includes("scale")
          ? "Weight Scale Online · Calibrated (Tare 0.0 kg)"
          : category === "disease_devices"
          ? "Biohazard & Varroa AI Diagnostic Armed · Clean"
          : category === "in_land"
          ? "Ambient Environmental Telemetry Active"
          : "Colony Vital Telemetry Active · Normal",
      model: model || "Apisense IoT Hardware",
      installedAt: new Date().toISOString().split("T")[0],
    };

    onAddDevice(newDevice);
    toast.success(`Successfully registered ${newDevice.serial} (${newDevice.deviceType})`);
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-amber-500 text-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 font-black" />
            <h3 className="font-bold text-sm">Register & Pair IoT Device — {normalizeApiaryName(apiary.name)}</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-black/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* STEP 1: Choose Device Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>1. Choose Device Category *</span>
              <span className="text-[10px] text-amber-600 font-semibold">Select deployment context</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DEVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    category === cat.id
                      ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-sm"
                      : "border-border hover:border-amber-500/50 bg-background"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-xs font-bold text-foreground leading-tight">{cat.label}</span>
                  <span className="text-[9px] text-muted-foreground line-clamp-2 leading-tight">
                    {cat.id === "in_land" ? "Weather & Soil" : cat.id === "in_hive" ? "Scales & Vitals" : "Varroa & Disease"}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground pt-1">{activeCategoryMeta.description}</p>
          </div>

          {/* STEP 2: Device Specific Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">2. Device Model / Hardware Type *</label>
            <select
              value={deviceType}
              onChange={(e) => {
                setDeviceType(e.target.value);
                if (e.target.value.toLowerCase().includes("scale")) {
                  setModel("Apisense Pro Scale 150kg");
                } else if (e.target.value.toLowerCase().includes("vital")) {
                  setModel("Apisense VitalSensor v2.4");
                } else if (e.target.value.toLowerCase().includes("varroa")) {
                  setModel("ApiSense VarroaSense Acoustic AI");
                } else if (e.target.value.toLowerCase().includes("weather")) {
                  setModel("Apisense Solar LoRa Gateway v3");
                }
              }}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold"
            >
              {activeCategoryMeta.defaultTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* If In-Hive or Disease, Select Paired Hive */}
          {category !== "in_land" && hives.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Assign To Hive</span>
                <span className="text-[10px] text-muted-foreground">Target Colony</span>
              </label>
              <select
                value={targetHive}
                onChange={(e) => setTargetHive(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold"
              >
                <option value="">-- Unassigned (Station Standby) --</option>
                {hives.map((h) => (
                  <option key={h.id} value={h.code}>
                    {h.code} — {h.name} {h.sensorSerial ? `(Currently: ${h.sensorSerial})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* STEP 3: Scan Sensor or Enter Code (Weight Scales, VitalSensors, etc.) */}
          <div className="p-3.5 rounded-2xl border border-border bg-background space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-amber-500" /> 3. Scan QR Tag or Enter Hardware Code *
              </span>
              <button
                type="button"
                onClick={onOpenScanner}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
              >
                <Camera className="w-3.5 h-3.5" /> Scan Sensor (Camera)
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Scan barcode/QR on the enclosure or enter code manually for weight scales, telemetry nodes, and pathogen traps.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={deviceCode}
                onChange={(e) => setDeviceCode(e.target.value)}
                placeholder={
                  category === "in_hive" && deviceType.toLowerCase().includes("scale")
                    ? "e.g. SCALE-KBZ-005"
                    : category === "disease_devices"
                    ? "e.g. VARROA-KBZ-005"
                    : "e.g. HUB-KBZ-LAND-02"
                }
                className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider"
              />
              <button
                type="button"
                onClick={onOpenScanner}
                className="px-3 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                <ScanLine className="w-3.5 h-3.5 text-amber-500" />
                Scan
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <Check className="w-4 h-4 font-black" />
              Register Device
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
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
  return (
    <PopoutAddHiveModal
      isOpen={isOpen}
      onClose={onClose}
      apiary={apiary}
      suggestedCode={suggestedCode}
      onAddHive={(hiveData) => {
        const item: ApiaryHiveItem = {
          id: hiveData.id,
          code: hiveData.code,
          name: hiveData.name,
          hiveType: hiveData.hiveType,
          queenPresent: hiveData.queenPresent,
          queenBreedingYear: hiveData.queenBreedingYear,
          queenStatus: hiveData.queenStatus,
          broodFrames: hiveData.broodFrames,
          maxBroodFrames: hiveData.maxBroodFrames,
          hasHygienicBottomBoard: hiveData.hasHygienicBottomBoard,
          queenOrigin: hiveData.queenOrigin,
          queenInsemination: hiveData.queenInsemination,
          queenNote: hiveData.queenNote,
          honeyFrames: hiveData.honeyFrames || 4,
          colonyStrength: hiveData.colonyStrength || "Strong (8–10 Frames Brood & Bees)",
          colonyAvailability: hiveData.colonyAvailability || "Dedicated Honey Production",
          sensorSerial: hiveData.sensorSerial,
          deviceCategory: hiveData.deviceCategory as any,
          deviceType: hiveData.deviceType,
          batches: hiveData.batches || [],
        };
        onAddHive(item);
      }}
      onOpenScanner={onOpenScanner}
      scannedSerial={scannedSerial}
    />
  );
}

// ----------------------------------------------------------------------
// Edit Hive Modal (Allows Owner to edit details, Brood frames, and sensor)
// ----------------------------------------------------------------------
function EditHiveModal({
  isOpen,
  hive,
  apiary,
  onClose,
  onSaveHive,
  onOpenScanner,
  scannedSerial,
}: {
  isOpen: boolean;
  hive: ApiaryHiveItem;
  apiary: ApiarySite;
  onClose: () => void;
  onSaveHive: (updated: ApiaryHiveItem) => void;
  onOpenScanner: () => void;
  scannedSerial?: string;
}) {
  const [code, setCode] = useState(hive.code);
  const [hiveType, setHiveType] = useState(hive.hiveType);
  const [queenPresent, setQueenPresent] = useState(hive.queenPresent);
  const [queenBreedingYear, setQueenBreedingYear] = useState(hive.queenBreedingYear);
  const [colonyStrength, setColonyStrength] = useState(hive.colonyStrength || "Strong (8–10 Frames Brood & Bees)");
  const [colonyAvailability, setColonyAvailability] = useState(hive.colonyAvailability || "Dedicated Honey Production");
  const [broodFrames, setBroodFrames] = useState<number | "">(typeof hive.broodFrames === "number" ? hive.broodFrames : "");
  const [honeyFrames, setHoneyFrames] = useState<number | "">(typeof hive.honeyFrames === "number" ? hive.honeyFrames : "");
  const [sensorSerial, setSensorSerial] = useState(scannedSerial || hive.sensorSerial || "");
  const [prevScannedSerial, setPrevScannedSerial] = useState(scannedSerial);
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>(hive.deviceCategory || "in_hive");
  const [deviceType, setDeviceType] = useState<string>(hive.deviceType || "Hive Weight Scale (Telemetry Load Cell)");

  if (scannedSerial !== prevScannedSerial) {
    setPrevScannedSerial(scannedSerial);
    if (scannedSerial) {
      setSensorSerial(scannedSerial);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter a hive code");
      return;
    }

    const parsedBrood = broodFrames !== "" && !isNaN(Number(broodFrames)) ? Number(broodFrames) : undefined;
    const parsedHoney = honeyFrames !== "" && !isNaN(Number(honeyFrames)) ? Number(honeyFrames) : undefined;

    const updatedHive: ApiaryHiveItem = {
      ...hive,
      code: code.trim().toUpperCase(),
      name: `${code.trim().toUpperCase()} (${hiveType})`,
      hiveType,
      queenPresent,
      queenBreedingYear,
      queenStatus: queenPresent ? "Active Laying Queen (Marked)" : "Queenless Colony",
      broodFrames: parsedBrood,
      honeyFrames: parsedHoney,
      colonyStrength,
      colonyAvailability,
      sensorSerial: sensorSerial.trim() || undefined,
      deviceCategory: sensorSerial.trim() ? deviceCategory : undefined,
      deviceType: sensorSerial.trim() ? deviceType : undefined,
    };

    onSaveHive(updatedHive);
    toast.success(`Hive ${updatedHive.code} updated successfully`);
    onClose();
  };

  const queenColor = getQueenYearColor(queenBreedingYear);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-amber-500 text-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 font-black" />
            <h3 className="font-bold text-sm">Edit Hive {hive.code}</h3>
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

          {/* Brood Frames & Food Stores (Owner Configured - No Guessing) */}
          <div className="p-3.5 rounded-xl border border-border bg-background space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-500" /> Brood Chamber Frames (Owner Count)
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">Optional</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Brood Frames</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={broodFrames}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBroodFrames(val === "" ? "" : Math.max(0, parseInt(val, 10) || 0));
                  }}
                  placeholder="e.g. 6 (or leave blank)"
                  className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Honey / Food Frames</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={honeyFrames}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHoneyFrames(val === "" ? "" : Math.max(0, parseInt(val, 10) || 0));
                  }}
                  placeholder="e.g. 4 (optional)"
                  className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Enter the audited brood frames if known. If you haven't counted or added this yet, leave blank and it will not be shown.
            </p>
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

          {/* Colony Strength & Availability */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Colony Strength & Operational Availability
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-amber-900">Colony Strength</label>
                <select
                  value={colonyStrength}
                  onChange={(e) => setColonyStrength(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-950"
                >
                  <option value="Strong (8–10 Frames Brood & Bees)">Strong (8–10 Frames)</option>
                  <option value="Moderate (5–7 Frames)">Moderate (5–7 Frames)</option>
                  <option value="Weak / Nucleus (<5 Frames)">Weak / Nucleus (&lt;5 Frames)</option>
                  <option value="Very Strong / Swarm-Prone (>10 Frames)">Very Strong (&gt;10 Frames)</option>
                  <option value="Critical / Queenless (<3 Frames)">Critical (&lt;3 Frames)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-amber-900">Colony Availability</label>
                <select
                  value={colonyAvailability}
                  onChange={(e) => setColonyAvailability(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-950"
                >
                  <option value="Dedicated Honey Production">Dedicated Honey Production</option>
                  <option value="Available for Pollination Contracts">Pollination Contracts</option>
                  <option value="Queen Rearing & Breeding">Queen Rearing & Breeding</option>
                  <option value="Splits & Nucleus Production">Splits & Nucleus Production</option>
                  <option value="Under Quarantine / Medical Observation">Under Quarantine</option>
                  <option value="Wintering / Seasonal Rest">Wintering / Seasonal Rest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sensor Pairing with QR Scanner & Category Selection */}
          <div className="p-3.5 rounded-2xl border border-border bg-background space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-amber-500" /> Pair IoT Device / Sensor (Optional)
              </span>
              <button
                type="button"
                onClick={onOpenScanner}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
              >
                <Camera className="w-3.5 h-3.5" /> Scan Sensor (Camera)
              </button>
            </div>

            {/* Choose Device Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Select Device Category:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {DEVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      React.startTransition(() => {
                        setDeviceCategory(cat.id);
                        setDeviceType(cat.defaultTypes[0]);
                      });
                    }}
                    className={`py-1.5 px-2 rounded-xl border text-center transition-all flex items-center justify-center gap-1 text-[11px] font-bold ${
                      deviceCategory === cat.id
                        ? "border-amber-500 bg-amber-500/15 text-foreground ring-1 ring-amber-500/30"
                        : "border-border hover:border-amber-500/40 text-muted-foreground"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate pointer-events-none select-none">{cat.label.replace(" Devices", "")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Device Hardware Model */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Device Hardware Type:</label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold"
              >
                {(DEVICE_CATEGORIES.find((c) => c.id === deviceCategory) || DEVICE_CATEGORIES[1]).defaultTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Scan or Enter Code */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Scan QR or Enter Code (Weight Scales, VitalSensors, etc.):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={sensorSerial}
                  onChange={(e) => setSensorSerial(e.target.value)}
                  placeholder={
                    deviceCategory === "in_hive" && deviceType.toLowerCase().includes("scale")
                      ? "e.g. SCALE-KBZ-001"
                      : "Scan QR or type code (e.g. VS-KBZ-001)"
                  }
                  className="flex-1 bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider"
                />
                <button
                  type="button"
                  onClick={onOpenScanner}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  <ScanLine className="w-3.5 h-3.5" /> Scan
                </button>
              </div>
            </div>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ----------------------------------------------------------------------
// Edit Hive Harvest Batch Modal
// ----------------------------------------------------------------------
function EditBatchModal({
  isOpen,
  batch,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  batch: HiveHarvestBatch;
  onClose: () => void;
  onSave: (updated: HiveHarvestBatch) => void;
}) {
  const [batchCode, setBatchCode] = useState(batch.batchCode);
  const [date, setDate] = useState(batch.date);
  const [quantityKg, setQuantityKg] = useState(batch.quantityKg);
  const [honeyType, setHoneyType] = useState(batch.honeyType);
  const [moisturePct, setMoisturePct] = useState(batch.moisturePct || 17.1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCode.trim()) {
      toast.error("Please enter a batch code");
      return;
    }
    onSave({
      ...batch,
      batchCode: batchCode.trim().toUpperCase(),
      date,
      quantityKg: Number(quantityKg) || 0,
      honeyType: honeyType.trim() || "Raw Acacia Blossom",
      moisturePct: Number(moisturePct) || 17.1,
    });
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Edit Harvest Batch</h3>
              <p className="text-[11px] text-muted-foreground font-mono">{batch.batchCode}</p>
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Batch Code</label>
            <input
              type="text"
              required
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Yield (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={quantityKg}
                onChange={(e) => setQuantityKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Harvest Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Botanical Honey Type</label>
              <input
                type="text"
                required
                value={honeyType}
                onChange={(e) => setHoneyType(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Moisture %</label>
              <input
                type="number"
                step="0.1"
                min="10"
                max="25"
                required
                value={moisturePct}
                onChange={(e) => setMoisturePct(parseFloat(e.target.value) || 17.1)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ----------------------------------------------------------------------
// Edit Certified Apiary Harvest Modal
// ----------------------------------------------------------------------
function EditHarvestModal({
  isOpen,
  harvest,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  harvest: ApiaryHarvestItem;
  onClose: () => void;
  onSave: (updated: ApiaryHarvestItem) => void;
}) {
  const [batch, setBatch] = useState(harvest.batch);
  const [harvestedOn, setHarvestedOn] = useState(harvest.harvested_on);
  const [honeyType, setHoneyType] = useState(harvest.honey_type);
  const [quantityKg, setQuantityKg] = useState(harvest.quantity_kg);
  const [moisturePct, setMoisturePct] = useState(harvest.moisture_pct);
  const [colorGrade, setColorGrade] = useState(harvest.color_grade);
  const [qualityGrade, setQualityGrade] = useState(harvest.quality_grade);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch.trim()) {
      toast.error("Please enter a batch code");
      return;
    }
    onSave({
      ...harvest,
      batch: batch.trim().toUpperCase(),
      harvested_on: harvestedOn,
      honey_type: honeyType.trim() || "Raw Acacia Blossom",
      quantity_kg: Number(quantityKg) || 0,
      moisture_pct: Number(moisturePct) || 17.1,
      color_grade: colorGrade,
      quality_grade: qualityGrade,
    });
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-4 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Edit Certified Harvest Batch</h3>
              <p className="text-[11px] text-muted-foreground font-mono">{harvest.batch}</p>
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Batch Code</label>
              <input
                type="text"
                required
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Harvest Date</label>
              <input
                type="date"
                required
                value={harvestedOn}
                onChange={(e) => setHarvestedOn(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Honey Type</label>
              <input
                type="text"
                required
                value={honeyType}
                onChange={(e) => setHoneyType(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Yield Quantity (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={quantityKg}
                onChange={(e) => setQuantityKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Moisture %</label>
              <input
                type="number"
                step="0.1"
                min="10"
                max="25"
                required
                value={moisturePct}
                onChange={(e) => setMoisturePct(parseFloat(e.target.value) || 17.1)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Color Grade</label>
              <select
                value={colorGrade}
                onChange={(e) => setColorGrade(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Water White">Water White</option>
                <option value="Extra White">Extra White</option>
                <option value="White">White</option>
                <option value="Extra Light Amber">Extra Light Amber</option>
                <option value="Light Amber">Light Amber</option>
                <option value="Amber">Amber</option>
                <option value="Dark Amber">Dark Amber</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Quality Standard</label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Export Grade A Raw (<18% moisture)">Export Grade A Raw (&lt;18%)</option>
                <option value="Standard Grade A Raw (18-20% moisture)">Standard Grade A Raw (18-20%)</option>
                <option value="Grade B Industrial (>20% moisture)">Grade B Industrial (&gt;20%)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
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
  onDelete,
  onHivesCountChanged,
}: {
  apiary: ApiarySite;
  weather?: LiveWeatherData;
  onClose: () => void;
  onEdit: (apiary: ApiarySite) => void;
  onDelete?: (apiaryId: string, apiaryName: string) => void;
  onHivesCountChanged?: (apiaryId: string, count: number) => void;
}) {
  const { user, profile } = useAuth();
  const deviceId = useDeviceId();
  const userKey = user?.id || deviceId || "default_user";

  const [activeTab, setActiveTab] = useState<"hives" | "devices" | "forage" | "harvests">("hives");
  const [devicesList, setDevicesList] = useState<ApiaryDeviceItem[]>(() => {
    try {
      const raw = localStorage.getItem(getStorageKey(userKey, apiary.id, "devices"));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // If Timothy has no sensors connected so far, filter out the mock demo devices
          const userOnly = parsed.filter(
            (d: any) =>
              !CANONICAL_KIBWEZI_DEVICES.some((cd) => cd.id === d.id || cd.serial === d.serial) &&
              !d.serial?.includes("-KBZ-")
          );
          if (userOnly.length > 0) return userOnly;
        }
      }
    } catch {}
    // Timothy operates 184 hives with 0 sensors connected so far
    return [];
  });

  const saveDevicesUserScoped = (nextDevices: ApiaryDeviceItem[]) => {
    setDevicesList(nextDevices);
    try {
      localStorage.setItem(getStorageKey(userKey, apiary.id, "devices"), JSON.stringify(nextDevices));
    } catch (e) {
      console.error("Failed to save devices locally", e);
    }
  };

  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [deviceFilterCategory, setDeviceFilterCategory] = useState<"all" | DeviceCategory>("all");
  const [deviceSearchQuery, setDeviceSearchQuery] = useState("");
  const [preselectedCategoryForDevice, setPreselectedCategoryForDevice] = useState<DeviceCategory>("in_hive");
  const [preselectedHiveForDevice, setPreselectedHiveForDevice] = useState<string>("");
  const [tempScannedDeviceCode, setTempScannedDeviceCode] = useState<string>("");

  const handleAddDevice = (newDevice: ApiaryDeviceItem) => {
    const nextDevices = [newDevice, ...devicesList.filter((d) => d.id !== newDevice.id)];
    saveDevicesUserScoped(nextDevices);

    if (newDevice.hiveCode) {
      const target = hivesList.find((h) => h.code === newDevice.hiveCode);
      if (target) {
        handleUpdateHive({
          ...target,
          sensorSerial: newDevice.serial,
          deviceCategory: newDevice.category,
          deviceType: newDevice.deviceType,
        });
      }
    }

    if (user?.id) {
      try {
        (supabase as any).from("devices").insert({
          id: newDevice.id,
          apiary_id: apiary.id,
          user_id: user.id,
          serial: newDevice.serial,
          device_kind: newDevice.category === "in_land" ? "hub" : "vitalsensor",
          label: `${newDevice.deviceType} (${newDevice.serial})`,
          status: "active",
        });
      } catch {}
    }
  };

  const handleDeleteDevice = async (deviceId: string, serial: string) => {
    const confirmed = await confirmAsync(`Are you sure you want to unpair and remove device "${serial}"?`);
    if (!confirmed) return;
    const nextDevices = devicesList.filter((d) => d.id !== deviceId);
    saveDevicesUserScoped(nextDevices);

    const nextHives = hivesList.map((h) => {
      if (h.sensorSerial?.toUpperCase() === serial.toUpperCase()) {
        return { ...h, sensorSerial: undefined, deviceCategory: undefined, deviceType: undefined };
      }
      return h;
    });
    saveHivesUserScoped(nextHives);

    if (user?.id) {
      try {
        (supabase as any).from("devices").delete().eq("serial", serial);
      } catch {}
    }
    toast.success(`Device ${serial} removed`);
  };
  const [hiveSearch, setHiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Load user-specific physical inspections
  const [allInspections, setAllInspections] = useState<any[]>(() => {
    try {
      const userLsKey = user?.id ? `beeyield_local_inspections_v1_${user.id}` : `beeyield_local_inspections_v1`;
      const raw = localStorage.getItem(userLsKey) || localStorage.getItem("beeyield_local_inspections_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const reloadInspections = useCallback(() => {
    try {
      const userLsKey = user?.id ? `beeyield_local_inspections_v1_${user.id}` : `beeyield_local_inspections_v1`;
      const raw = localStorage.getItem(userLsKey) || localStorage.getItem("beeyield_local_inspections_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setAllInspections(parsed);
      }
    } catch {}
  }, [user?.id]);

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
    return (isTimothyUser(user, profile) || !user) ? CANONICAL_KIBWEZI_HIVES : [];
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
    return (isTimothyUser(user, profile) || !user) ? CANONICAL_KIBWEZI_HARVESTS : [];
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
            broodFrames: typeof h.max_brood_frames === "number" && h.max_brood_frames > 0 ? h.max_brood_frames : undefined,
            honeyFrames: undefined,
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

  const [editingHive, setEditingHive] = useState<ApiaryHiveItem | null>(null);
  const [hiveViewMode, setHiveViewMode] = useState<"companion" | "table">("companion");
  const [hivesSubTab, setHivesSubTab] = useState<"list" | "tasks">("list");
  const [modalWeather, setModalWeather] = useState<LiveWeatherData | null>(weather || null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);

  const loadWeatherForApiary = useCallback(async () => {
    if (typeof apiary.latitude !== "number" || typeof apiary.longitude !== "number") return;
    setLoadingWeather(true);
    try {
      const live = await fetchOpenMeteoWeather(apiary.latitude, apiary.longitude);
      setModalWeather(live);
    } catch {
      setModalWeather(getFallbackWeather(apiary.latitude, apiary.longitude));
    } finally {
      setLoadingWeather(false);
    }
  }, [apiary.latitude, apiary.longitude]);

  useEffect(() => {
    loadWeatherForApiary();
  }, [loadWeatherForApiary]);

  const [selectedHiveForDetail, setSelectedHiveForDetail] = useState<ApiaryHiveItem | null>(null);
  const [selectedHiveForSyrup, setSelectedHiveForSyrup] = useState<ApiaryHiveItem | null>(null);
  const [selectedHiveForFrameSense, setSelectedHiveForFrameSense] = useState<ApiaryHiveItem | null>(null);
  const [showAddHiveModal, setShowAddHiveModal] = useState(false);
  const [isScanningOpen, setIsScanningOpen] = useState(false);
  const [scanContext, setScanContext] = useState<"addHive" | "detailHive" | "editHive" | "addDevice">("addHive");
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
  const handleUpdateHive = async (updated: ApiaryHiveItem) => {
    const nextHives = hivesList.map((h) => (h.id === updated.id ? updated : h));
    saveHivesUserScoped(nextHives);
    if (selectedHiveForDetail?.id === updated.id) {
      setSelectedHiveForDetail(updated);
    }

    if (user?.id) {
      try {
        await (supabase as any)
          .from("hives")
          .update({
            name: updated.code,
            max_brood_frames: typeof updated.broodFrames === "number" ? updated.broodFrames : null,
            queen_breeding_year: updated.queenBreedingYear,
            queen_origin: updated.queenStatus,
          })
          .eq("id", updated.id);

        if (updated.sensorSerial) {
          const { data: existingDevice } = await (supabase as any)
            .from("devices")
            .select("id")
            .eq("hive_id", updated.id)
            .maybeSingle();

          if (existingDevice) {
            await (supabase as any)
              .from("devices")
              .update({ serial: updated.sensorSerial })
              .eq("id", existingDevice.id);
          } else {
            await (supabase as any)
              .from("devices")
              .insert({
                apiary_id: apiary.id,
                hive_id: updated.id,
                user_id: user.id,
                serial: updated.sensorSerial,
                device_kind: "vitalsensor",
                link_type: "bluetooth",
                status: "active",
              });
          }
        }
      } catch (err) {
        console.error("Failed to sync hive update to Supabase:", err);
      }
    }
  };

  const handleDeleteHive = async (hiveId: string, hiveCode: string) => {
    const confirmed = await confirmAsync(`Are you sure you want to delete hive "${hiveCode}"? This will permanently remove its records.`);
    if (!confirmed) {
      return;
    }
    const nextHives = hivesList.filter((h) => h.id !== hiveId);
    saveHivesUserScoped(nextHives);

    if (user?.id) {
      try {
        await (supabase as any).from("hives").delete().eq("id", hiveId);
        await (supabase as any).from("devices").delete().eq("hive_id", hiveId);
      } catch (err) {
        console.error("Failed to delete hive from database:", err);
      }
    }

    if (selectedHiveForDetail?.id === hiveId) {
      setSelectedHiveForDetail(null);
    }
    if (editingHive?.id === hiveId) {
      setEditingHive(null);
    }
    toast.success(`Hive ${hiveCode} successfully deleted`);
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

  // Editing and deleting harvests in Apiary TAB 3
  const [editingHarvest, setEditingHarvest] = useState<ApiaryHarvestItem | null>(null);

  const handleDeleteHarvest = async (harvestId: string) => {
    const confirmed = await confirmAsync("Are you sure you want to delete this harvest record?");
    if (!confirmed) return;
    const target = harvestsList.find((h) => h.id === harvestId);
    const updatedHarvests = harvestsList.filter((h) => h.id !== harvestId);
    saveHarvestsUserScoped(updatedHarvests);

    // If this harvest corresponds to a batch in any hive, remove it from that hive's batches too
    if (target) {
      let hiveModified = false;
      const nextHives = hivesList.map((hive) => {
        const remainingBatches = hive.batches.filter((b) => b.batchCode !== target.batch);
        if (remainingBatches.length !== hive.batches.length) {
          hiveModified = true;
          return { ...hive, batches: remainingBatches };
        }
        return hive;
      });
      if (hiveModified) {
        saveHivesUserScoped(nextHives);
      }
    }

    toast.success("Harvest record deleted");
  };

  const handleSaveHarvestEdit = (updatedHarvest: ApiaryHarvestItem) => {
    const updatedHarvests = harvestsList.map((h) => (h.id === updatedHarvest.id ? updatedHarvest : h));
    saveHarvestsUserScoped(updatedHarvests);

    // Also sync to matching batch in hive if exists
    let hiveModified = false;
    const nextHives = hivesList.map((hive) => {
      const nextBatches = hive.batches.map((b) => {
        if (b.batchCode === updatedHarvest.batch) {
          hiveModified = true;
          return {
            ...b,
            quantityKg: updatedHarvest.quantity_kg,
            honeyType: updatedHarvest.honey_type,
            moisturePct: updatedHarvest.moisture_pct,
            date: updatedHarvest.harvested_on,
          };
        }
        return b;
      });
      return hiveModified ? { ...hive, batches: nextBatches } : hive;
    });
    if (hiveModified) {
      saveHivesUserScoped(nextHives);
    }

    setEditingHarvest(null);
    toast.success("Harvest record updated");
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
          max_brood_frames: typeof newHive.broodFrames === "number" ? newHive.broodFrames : null,
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
    } else if (scanContext === "editHive") {
      setTempScannedSerial(serial);
    } else if (scanContext === "addDevice") {
      setTempScannedDeviceCode(serial);
      toast.success(`Scanned device hardware code: ${serial}`);
    } else {
      setTempScannedSerial(serial);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[94vh] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
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
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(apiary.id, normalizeApiaryName(apiary.name))}
                className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 shadow-sm transition-all"
                title="Delete this apiary station"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Apiary
              </button>
            )}
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
            {loadingWeather ? (
              <span className="flex items-center gap-1.5 text-muted-foreground animate-pulse font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                Fetching live climate for {normalizeApiaryLocation(apiary.location_name)}...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Sun className="w-4 h-4 text-amber-500" />
                {modalWeather ? `${modalWeather.currentTemp}°C ${modalWeather.conditionText}` : "Live Weather Synced"}
              </span>
            )}
            <span className="flex items-center gap-1 text-muted-foreground">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              {modalWeather ? `${modalWeather.currentHumidity}% Humidity` : "—"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Wind className="w-3.5 h-3.5 text-emerald-500" />
              {modalWeather ? `${modalWeather.currentWind} km/h Wind` : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadWeatherForApiary}
              disabled={loadingWeather}
              className="p-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh live weather for this location"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingWeather ? "animate-spin text-amber-500" : ""}`} />
            </button>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Open-Meteo ({apiary.latitude.toFixed(2)}°, {apiary.longitude.toFixed(2)}°)
            </span>
          </div>
        </div>

        {/* Beautiful Segmented Tab Controller (Fits Mobile Perfectly Without Any Cutoffs) */}
        <div className="p-3 sm:px-5 sm:py-3 bg-card border-b border-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-muted/60 dark:bg-muted/30 rounded-2xl border border-border/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => { if (typeof window !== "undefined" && "requestAnimationFrame" in window) { window.requestAnimationFrame(() => React.startTransition(() => setActiveTab("hives"))); } else { React.startTransition(() => setActiveTab("hives")); } }}
              className={`py-2 px-2 text-center rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "hives"
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate pointer-events-none select-none">Hives ({hivesList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => { if (typeof window !== "undefined" && "requestAnimationFrame" in window) { window.requestAnimationFrame(() => React.startTransition(() => setActiveTab("devices"))); } else { React.startTransition(() => setActiveTab("devices")); } }}
              className={`py-2 px-2 text-center rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "devices"
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Radio className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate pointer-events-none select-none">IoT Devices ({devicesList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => { if (typeof window !== "undefined" && "requestAnimationFrame" in window) { window.requestAnimationFrame(() => React.startTransition(() => setActiveTab("forage"))); } else { React.startTransition(() => setActiveTab("forage")); } }}
              className={`py-2 px-2 text-center rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "forage"
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sprout className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate pointer-events-none select-none">Forage & Flora</span>
            </button>
            <button
              type="button"
              onClick={() => { if (typeof window !== "undefined" && "requestAnimationFrame" in window) { window.requestAnimationFrame(() => React.startTransition(() => setActiveTab("harvests"))); } else { React.startTransition(() => setActiveTab("harvests")); } }}
              className={`py-2 px-2 text-center rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "harvests"
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Scale className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate pointer-events-none select-none">Harvests ({totalHoneyKg.toFixed(0)} kg)</span>
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: COLONY DIRECTORY & HIVES (Screenshot 1 Companion Cards & Table Toggle) */}
          {activeTab === "hives" && (
            <div className="space-y-4">
              {/* Top Subheader with Back, Apiary Title, Share & More Menu (Screenshot 1 Header) */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[#FAF4EE] dark:bg-[#1C1917] border border-[#EFE8DE] dark:border-stone-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      title="Back to apiaries"
                    >
                      <ChevronLeft className="w-6 h-6 text-[#2E2A25] dark:text-stone-100" />
                    </button>
                    <div>
                      <span className="text-[11px] text-[#8E8880] font-semibold block leading-none">
                        Apiary
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2E2A25] dark:text-stone-100">
                        {apiary.name.toLowerCase() === "beeyield main apiary" ? "beeyield" : apiary.name}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#2E2A25] dark:text-stone-200">
                    <button
                      type="button"
                      onClick={() => toast.info(`Sharing apiary link for ${apiary.name}`)}
                      className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      title="Share apiary"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(apiary)}
                      className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      title="Apiary settings"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Sub-tabs: List & Tasks (Screenshot 1) */}
                <div className="flex items-center gap-6 border-b border-[#EAE3DA] dark:border-stone-800 text-sm font-semibold pt-1">
                  <button
                    type="button"
                    onClick={() => setHivesSubTab("list")}
                    className={`pb-2.5 relative transition-colors ${
                      hivesSubTab === "list"
                        ? "text-[#8C6D46] dark:text-amber-400 font-bold"
                        : "text-[#8E8880] hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <LayoutGrid className="w-4 h-4" />
                      <span>List</span>
                    </div>
                    {hivesSubTab === "list" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C6D46] dark:bg-amber-400 rounded-full" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setHivesSubTab("tasks")}
                    className={`pb-2.5 relative transition-colors ${
                      hivesSubTab === "tasks"
                        ? "text-[#8C6D46] dark:text-amber-400 font-bold"
                        : "text-[#8E8880] hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>Tasks</span>
                    </div>
                    {hivesSubTab === "tasks" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C6D46] dark:bg-amber-400 rounded-full" />
                    )}
                  </button>

                  {/* Action & View Controls */}
                  <div className="ml-auto pb-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTempScannedSerial("");
                        setShowAddHiveModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add Hive</span>
                    </button>
                    <div className="flex items-center gap-1 bg-[#F2ECE4] dark:bg-stone-800 p-1 rounded-xl text-xs">
                      <button
                        type="button"
                        onClick={() => setHiveViewMode("companion")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          hiveViewMode === "companion"
                            ? "bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-100 shadow-sm"
                            : "text-stone-500 hover:text-foreground"
                        }`}
                      >
                        Cards
                      </button>
                      <button
                        type="button"
                        onClick={() => setHiveViewMode("table")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          hiveViewMode === "table"
                            ? "bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-100 shadow-sm"
                            : "text-stone-500 hover:text-foreground"
                        }`}
                      >
                        Table
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks Sub-tab */}
              {hivesSubTab === "tasks" && (
                <div className="p-5 rounded-2xl bg-[#FAF4EE] dark:bg-[#1E1B18] border border-[#EFE8DE] dark:border-stone-800 space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" /> Scheduled Apiary Tasks & Inspections
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-[#EAE3DA] dark:border-stone-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-foreground block">Varroa Mite Treatment Check</span>
                        <span className="text-[#8E8880]">beeyield 001 · Thymol screening</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[10px]">
                        Due Today
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-[#EAE3DA] dark:border-stone-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-foreground block">Super Honey Box Addition</span>
                        <span className="text-[#8E8880]">beeyield 003 · Acacia blooming flow</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">
                        In 2 Days
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* List Sub-tab */}
              {hivesSubTab === "list" && (
                <div className="space-y-4">
                  {/* Search and Quick Filters */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 sm:max-w-xs">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8880]" />
                      <input
                        type="text"
                        value={hiveSearch}
                        onChange={(e) => {
                          setHiveSearch(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Search hive (e.g. beeyield 003)..."
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-2xl border border-[#EAE3DA] dark:border-stone-800 bg-[#FAF4EE] dark:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8E8880] font-semibold">
                        {filteredHives.length} Hives Total
                      </span>
                    </div>
                  </div>

                  {/* VIEW MODE 1: COMPANION CARDS (Clean UI/UX Matched with Physical Inspections) */}
                  {hiveViewMode === "companion" ? (
                    <div className="relative pb-16">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedHives.map((hive, idx) => {
                          const hiveNumber = hive.code.replace(/^KIB-?/i, "");
                          const hiveTitle = `beeyield ${hiveNumber || String(idx + 1).padStart(3, "0")}`;

                          // Match with physical inspections
                          const cleanCodeNum = hive.code.replace(/^KIB-?/i, "").replace(/^0+/, "");
                          const hiveInspection = allInspections.find((insp: any) => {
                            const lbl = (insp.hive_label || insp.hive_code || "").toLowerCase();
                            const cleanLbl = lbl.replace(/^kib-?/i, "").replace(/^beeyield\s*/i, "").replace(/^0+/, "").trim();
                            return lbl.includes(hive.code.toLowerCase()) || (cleanCodeNum && cleanLbl === cleanCodeNum);
                          });

                          const healthStatus = hiveInspection?.colony_health || (hive.queenPresent ? "Healthy" : "Standby");
                          const isHealthy = healthStatus === "Healthy";
                          const isWatch = healthStatus === "Watch";

                          // Live outside ambient temperature from Open-Meteo
                          const outsideTemp = modalWeather?.currentTemp ? Math.round(modalWeather.currentTemp) : weather?.currentTemp ? Math.round(weather.currentTemp) : 26;

                          return (
                            <div
                              key={hive.id}
                              onClick={() => setSelectedHiveForDetail(hive)}
                              className="bg-[#FAF4EE] dark:bg-[#1E1B18] border border-[#EFE8DE] dark:border-stone-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-amber-400/50 transition-all cursor-pointer space-y-3.5 text-[#2E2A25] dark:text-stone-200"
                            >
                              {/* Header: Hive Name & Certified Physical Inspection Badge */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <HiveLayersIcon className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                                  <span className="text-base font-bold tracking-tight text-[#2E2A25] dark:text-stone-100">
                                    {hiveTitle}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <ClipboardCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  Physical Inspection
                                </span>
                              </div>

                              {/* Inspection status & Queen details */}
                              <div className="flex items-center justify-between text-xs pt-0.5">
                                <span className="text-[#8E8880] text-[11px] flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-stone-400" />
                                  {hiveInspection?.inspected_on ? `Last inspected: ${hiveInspection.inspected_on}` : "Hands-on audit • Verified Queenright"}
                                </span>
                                <span className="text-[10px] font-semibold text-[#8E8880]">
                                  {hive.queenPresent ? `Queen marked · ${hive.queenBreedingYear || 2025}` : "Standby stand"}
                                </span>
                              </div>

                              {/* Action Shortcuts: Inspect, Syrup, FrameSense */}
                              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EAE3DA]/80 dark:border-stone-800/80">
                                <span className="text-[11px] text-[#8E8880]">Actions</span>
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedHiveForDetail(hive)}
                                    className="px-2 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-500 hover:text-white transition-all shadow-xs"
                                    title="View or log physical inspections for this hive"
                                  >
                                    <ClipboardCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>Inspect</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedHiveForSyrup(hive)}
                                    className="px-2 py-0.5 rounded-full border border-amber-400/40 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1 hover:bg-amber-500 hover:text-stone-950 transition-all shadow-xs"
                                    title="Syrup Calculator for this hive"
                                  >
                                    <Coffee className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                    <span>Syrup</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedHiveForFrameSense(hive)}
                                    className="px-2 py-0.5 rounded-full border border-amber-400/40 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1 hover:bg-amber-500 hover:text-stone-950 transition-all shadow-xs"
                                    title="FrameSense AI comb analysis for this hive"
                                  >
                                    <LayoutGrid className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                    <span>FrameSense</span>
                                  </button>
                                </div>
                              </div>

                              {/* 3 Standard Rows: Strength, Health State, Outside Temp */}
                              <div className="space-y-2 pt-1 border-t border-[#EAE3DA]/80 dark:border-stone-800/80">
                                {/* Row 1: Colony strength */}
                                <div className="flex items-center justify-between py-1">
                                  <div className="flex items-center gap-2.5">
                                    <ShieldHeartIcon className="w-5 h-5 text-[#8C6D46] dark:text-amber-400" />
                                    <span className="text-sm font-medium">Colony strength</span>
                                  </div>
                                  <div className="px-3 py-1 rounded-xl border border-[#DCD5CB] dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono font-bold">
                                    {hiveInspection?.brood_frames
                                      ? `${hiveInspection.brood_frames} Brood Frames`
                                      : hive.broodFrames !== undefined && hive.broodFrames > 0
                                      ? `${hive.broodFrames} Brood Frames`
                                      : hive.queenPresent
                                      ? "6 Brood Frames"
                                      : "Empty Stand"}
                                  </div>
                                </div>

                                {/* Row 2: Colony state */}
                                <div className="flex items-center justify-between py-1">
                                  <div className="flex items-center gap-2.5">
                                    <BeeSilhouetteIcon className="w-5 h-5 text-[#8C6D46] dark:text-amber-400" />
                                    <span className="text-sm font-medium">Colony state</span>
                                  </div>
                                  {isHealthy ? (
                                    <div className="px-3 py-1 rounded-full border border-[#9DC384] bg-[#EAF5E1] dark:bg-emerald-950/40 text-[#36681E] dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#36681E] dark:text-emerald-400" />
                                      <span>Healthy</span>
                                    </div>
                                  ) : isWatch ? (
                                    <div className="px-3 py-1 rounded-full border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5">
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Watch</span>
                                    </div>
                                  ) : (
                                    <div className="px-3 py-1 rounded-full border border-rose-300 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5">
                                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                      <span>{hive.queenPresent ? healthStatus : "Queenless"}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Row 3: Outside temperature - NO FAKE IN-HIVE DATA */}
                                <div className="flex items-center justify-between py-1">
                                  <div className="flex items-center gap-2.5">
                                    <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                    <span className="text-sm font-medium">Outside temperature</span>
                                  </div>
                                  <div className="px-3 py-1 rounded-xl border border-[#DCD5CB] dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-bold font-mono">
                                    {outsideTemp}°C
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>



                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 text-xs">
                          <span className="text-[#8E8880]">
                            Showing {paginatedHives.length} of {filteredHives.length} hives
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={page === 1}
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              className="px-3 py-1.5 rounded-xl border border-[#EAE3DA] dark:border-stone-800 disabled:opacity-50 text-xs font-semibold"
                            >
                              Previous
                            </button>
                            <span className="font-bold text-xs">
                              {page} / {totalPages}
                            </span>
                            <button
                              type="button"
                              disabled={page === totalPages}
                              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                              className="px-3 py-1.5 rounded-xl border border-[#EAE3DA] dark:border-stone-800 disabled:opacity-50 text-xs font-semibold"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* VIEW MODE 2: TABLE VIEW */
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
                              <th className="px-4 py-3">Inspection Status</th>
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
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300/40">
                                      <ClipboardCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                      Physical Inspection
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div
                                      className="flex items-center justify-end gap-1.5"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => setSelectedHiveForDetail(hive)}
                                        className="px-2 py-1 rounded-lg border border-border hover:bg-muted text-foreground text-[11px] font-bold flex items-center gap-1 transition-colors"
                                        title="View details"
                                      >
                                        <Eye className="w-3 h-3 text-amber-500" /> View
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingHive(hive)}
                                        className="px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                        title="Edit hive"
                                      >
                                        <Pencil className="w-3 h-3" /> Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteHive(hive.id, hive.code)}
                                        className="p-1 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[11px] font-bold flex items-center transition-colors"
                                        title="Delete hive"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}


            </div>
          )}

          {/* TAB 2: IOT DEVICES & TELEMETRY */}
          {activeTab === "devices" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF4EE] dark:bg-[#1C1917] border border-[#EFE8DE] dark:border-stone-800 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-base font-bold text-foreground">
                      IoT Hardware Devices & Telemetry Gateways
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {devicesList.length === 0
                      ? "0 connected devices · Operating under certified physical apiary inspection"
                      : `${devicesList.length} connected hardware nodes in ${apiary.name}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTempScannedDeviceCode("");
                    setShowAddDeviceModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Pair Hardware Device</span>
                </button>
              </div>

              {devicesList.length === 0 ? (
                <div className="p-8 rounded-3xl border border-dashed border-border bg-background/60 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                    <Radio className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h4 className="text-base font-bold text-foreground">
                      No Sensors Connected So Far
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Timothy operates 184 managed Langstroth hives in the Kibwezi ecosystem. All hives are currently monitored via certified hands-on physical inspections. No telemetry hardware nodes or scales have been mounted yet.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTempScannedDeviceCode("");
                        setPreselectedCategoryForDevice("in_hive");
                        setShowAddDeviceModal(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Pair VitalSensor or Scale</span>
                    </button>
                  </div>
                  <div className="pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto">
                    <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                      <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Physical Audits
                      </span>
                      <p className="text-[10px] text-muted-foreground">Brood frames & queen health manually verified.</p>
                    </div>
                    <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                      <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Acoustic Audits
                      </span>
                      <p className="text-[10px] text-muted-foreground">Smartphone mic sound analysis supported without hardware.</p>
                    </div>
                    <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                      <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Zero Ghost Data
                      </span>
                      <p className="text-[10px] text-muted-foreground">No simulated or false hardware telemetry displayed.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {devicesList.map((dev) => (
                    <div
                      key={dev.id}
                      className="p-4 rounded-2xl border border-border bg-background space-y-3 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-emerald-600" />
                          <span className="font-mono font-bold text-xs text-foreground">{dev.serial}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {dev.status}
                        </span>
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-foreground truncate">{dev.deviceType}</p>
                        <p className="text-muted-foreground text-[11px]">Mounted to: {dev.hiveCode || "Unassigned"}</p>
                        {dev.telemetrySummary && (
                          <p className="text-amber-700 dark:text-amber-400 font-mono text-[11px] bg-amber-500/10 px-2 py-1 rounded-lg">
                            {dev.telemetrySummary}
                          </p>
                        )}
                      </div>
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Sync: {dev.lastSync}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteDevice(dev.id, dev.serial)}
                          className="text-rose-600 hover:text-rose-700 font-bold"
                        >
                          Unpair
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FORAGE & FLORA ECOSYSTEM */}
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
                        <th className="px-4 py-2.5 text-right">Actions</th>
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
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingHarvest(h)}
                                className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-foreground/80 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/40 flex items-center gap-1 transition-colors bg-background/50 shadow-sm"
                                title="Edit Harvest Record"
                              >
                                <Pencil className="w-3 h-3" />
                                <span className="font-medium text-xs">Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadHarvestCert(h, apiary.name, apiary.location_name)}
                                className="px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 flex items-center gap-1 transition-colors font-bold shadow-sm"
                                title="Download Certificate"
                              >
                                <Download className="w-3 h-3" />
                                <span className="text-xs">Cert</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteHarvest(h.id)}
                                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-colors bg-background/50 shadow-sm"
                                title="Delete Harvest Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

        {/* Modal: FrameSense Tool Linked to Selected Hive */}
        {selectedHiveForFrameSense && (
          <FrameSenseToolPage
            isOpen={!!selectedHiveForFrameSense}
            initialHiveId={selectedHiveForFrameSense.id}
            onClose={() => setSelectedHiveForFrameSense(null)}
          />
        )}

        {/* Modal: Syrup Tool Linked to Selected Hive */}
        {selectedHiveForSyrup && (
          <SyrupFeedingToolPage
            isOpen={!!selectedHiveForSyrup}
            initialHiveId={selectedHiveForSyrup.id}
            onClose={() => setSelectedHiveForSyrup(null)}
          />
        )}

        {/* Modal: Interactive Hive Details */}
        {selectedHiveForDetail && (
          <HiveDetailModal
            hive={selectedHiveForDetail}
            apiary={apiary}
            weather={modalWeather || weather}
            allHives={hivesList}
            allInspections={allInspections}
            onInspectionLogged={reloadInspections}
            onClose={() => setSelectedHiveForDetail(null)}
            onUpdateHive={handleUpdateHive}
            onAddHarvestToHive={handleAddHarvestToHive}
            onDeleteBatch={(batchId) => {
              const targetBatch = selectedHiveForDetail.batches.find((b) => b.id === batchId);
              const updatedBatches = selectedHiveForDetail.batches.filter((b) => b.id !== batchId);
              const updatedHive = { ...selectedHiveForDetail, batches: updatedBatches };
              handleUpdateHive(updatedHive);

              if (targetBatch) {
                const nextHarvests = harvestsList.filter((h) => h.batch !== targetBatch.batchCode);
                if (nextHarvests.length !== harvestsList.length) {
                  saveHarvestsUserScoped(nextHarvests);
                }
              }
              toast.success("Harvest batch deleted");
            }}
            onEditBatch={(updatedBatch) => {
              const updatedBatches = selectedHiveForDetail.batches.map((b) => (b.id === updatedBatch.id ? updatedBatch : b));
              const updatedHive = { ...selectedHiveForDetail, batches: updatedBatches };
              handleUpdateHive(updatedHive);

              const nextHarvests = harvestsList.map((h) => {
                if (h.batch === updatedBatch.batchCode) {
                  return {
                    ...h,
                    quantity_kg: updatedBatch.quantityKg,
                    honey_type: updatedBatch.honeyType,
                    moisture_pct: updatedBatch.moisturePct || 17.1,
                    harvested_on: updatedBatch.date,
                  };
                }
                return h;
              });
              saveHarvestsUserScoped(nextHarvests);
              toast.success("Harvest batch updated");
            }}
            onOpenScanner={() => {
              setScanContext("detailHive");
              setIsScanningOpen(true);
            }}
            onEditHive={(h) => setEditingHive(h)}
            onDeleteHive={handleDeleteHive}
          />
        )}

        {/* Modal: Edit Existing Hive */}
        {editingHive && (
          <EditHiveModal
            isOpen={!!editingHive}
            hive={editingHive}
            apiary={apiary}
            onClose={() => setEditingHive(null)}
            onSaveHive={handleUpdateHive}
            onOpenScanner={() => {
              setScanContext("editHive");
              setIsScanningOpen(true);
            }}
            scannedSerial={scanContext === "editHive" ? tempScannedSerial : undefined}
          />
        )}

        {/* Modal: Edit Certified Harvest */}
        {editingHarvest && (
          <EditHarvestModal
            isOpen={true}
            harvest={editingHarvest}
            onClose={() => setEditingHarvest(null)}
            onSave={handleSaveHarvestEdit}
          />
        )}

        {/* Modal: Register / Scan IoT Device */}
        {showAddDeviceModal && (
          <AddDeviceModal
            isOpen={showAddDeviceModal}
            apiary={apiary}
            hives={hivesList}
            preselectedCategory={preselectedCategoryForDevice}
            preselectedHiveCode={preselectedHiveForDevice}
            onClose={() => setShowAddDeviceModal(false)}
            onAddDevice={handleAddDevice}
            onOpenScanner={() => {
              setScanContext("addDevice");
              setIsScanningOpen(true);
            }}
            scannedCode={scanContext === "addDevice" ? tempScannedDeviceCode : undefined}
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
    </div>,
    document.body
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
  onDelete,
  onOpenDetails,
}: {
  apiary: ApiarySite;
  weather?: LiveWeatherData;
  userKey?: string;
  onEdit: (apiary: ApiarySite) => void;
  onDelete?: (apiaryId: string, apiaryName: string) => void;
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
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(apiary.id, displayName);
              }}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 p-1 hover:underline"
              title="Delete apiary"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          )}
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

const confirmAsync = (msg: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(typeof window !== "undefined" ? window.confirm(msg) : true);
    }, 25);
  });
};

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
  const { user, profile } = useAuth();
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
    return (isTimothyUser(user, profile) || !user?.id)
      ? deduplicateApiaries(
          DEFAULT_APIARIES.map((item) => {
            const normalized = normalizeApiarySite(item);
            const userHives = getUserHivesCount(userKey, normalized.id, normalized.active_hives);
            return {
              ...normalized,
              active_hives: userHives,
              total_hives: Math.max(normalized.total_hives, userHives),
            };
          })
        )
      : [];
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
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Live GPS Coordinates detector
  const handleDetectGps = () => {
    setIsDetectingGps(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            latitude: Number(pos.coords.latitude.toFixed(4)),
            longitude: Number(pos.coords.longitude.toFixed(4)),
          }));
          setIsDetectingGps(false);
          toast.success(`GPS detected: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          setIsDetectingGps(false);
          toast.info("Could not fetch GPS. Retaining current coordinates.");
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setIsDetectingGps(false);
      toast.error("Geolocation is not supported by your browser");
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    if (!showAddModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddModal(false);
        setEditingApiary(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddModal]);

  // New Apiary Form state
  const [formData, setFormData] = useState({
    name: "BeeYield Apiary in Kibwezi Kenya",
    location_name: "Kibwezi, Makueni, Kenya",
    county: "Makueni",
    region: "Kibwezi East",
    latitude: -2.409,
    longitude: 37.967,
    type: "Commercial Apiary",
    active_hives: 150,
    total_hives: 184,
    size_acres: 5,
    forage_type: "Acacia, Neem, Maize, Mango & Forest Multifloral",
    status: "Optimal" as "Optimal" | "Threatened" | "Watch" | "Maintenance",
    notes: "Lead Beekeeper: Timothy Nduva. 150 active producing colonies across 184 managed Langstroth hive stands in Kibwezi ecosystem, Kenya (34 standby stands awaiting swarm colonization).",
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
              forage_type: d.forage_type || d.primary_forage || "Acacia, Neem, Maize, Mango & Forest Multifloral",
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
          // Synchronize all apiary forage species to Florage Database
          void syncAllApiariesToFlorage(userKey, deviceId);
        }
      } catch {
        // keep current state
      }
    };
    loadApiaries();
  }, [user?.id, userKey, deviceId]);

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

    // Sync apiary forage flora to Florage Database
    if (newSite.forage_type) {
      void syncApiaryForageToFlorage(
        newSite.name,
        newSite.location_name,
        newSite.forage_type,
        userKey
      );
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
    const confirmed = await confirmAsync(`Are you sure you want to remove apiary "${apiaryName}"?`);
    if (!confirmed) {
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
                  active_hives: 150,
                  total_hives: 184,
                  size_acres: 5,
                  forage_type: "Acacia, Neem, Maize, Mango & Forest Multifloral",
                  status: "Optimal",
                  notes: "Lead Beekeeper: Timothy Nduva. 150 active producing colonies across 184 managed Langstroth hive stands in Kibwezi ecosystem, Kenya (34 standby stands awaiting swarm colonization).",
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
        {showAddModal && typeof document !== "undefined" && createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
            onClick={() => {
              setShowAddModal(false);
              setEditingApiary(null);
            }}
          >
            <div
              className="w-full sm:max-w-xl bg-[#FAF4EE] text-stone-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-300 relative my-auto max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Step 1: Name and Mode Selection (With / Without Devices) */}
              {!editingApiary && addApiaryStep === 1 && (
                <div className="flex flex-col flex-1 p-6 sm:p-7 overflow-y-auto">
                  {/* Top Bar */}
                  <div className="relative flex items-center justify-between pb-5 border-b border-stone-300/60">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="p-1.5 -ml-1.5 text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 rounded-xl transition-colors"
                      aria-label="Back"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                      <h2 className="text-lg sm:text-xl font-bold text-stone-900">Add Apiary</h2>
                      <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                        Step 1 of 2 • Basic Setup
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="p-1.5 -mr-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Name field */}
                  <div className="space-y-1.5 pt-5">
                    <label className="text-xs font-bold text-stone-700 block uppercase tracking-wider">
                      Apiary Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kibwezi Commercial Apiary Site"
                      autoFocus
                      className="w-full bg-white border border-stone-300 focus:border-amber-600 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-900 shadow-sm focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="pt-6 pb-2">
                    <label className="text-xs font-bold text-stone-800 block uppercase tracking-wider">
                      How do you want to add the apiary?
                    </label>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Choose whether this apiary station is integrated with live IoT hardware telemetry or registered as a digital journal.
                    </p>
                  </div>

                  {/* Option 1: With devices */}
                  <div className="space-y-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setAddApiaryMode("with_devices")}
                      className={`w-full p-4 rounded-2xl border text-left font-medium text-sm transition-all flex items-start gap-3.5 ${
                        addApiaryMode === "with_devices"
                          ? "border-amber-600 bg-amber-500/10 text-stone-950 ring-2 ring-amber-600/30 shadow-sm"
                          : "border-stone-300/80 bg-white/70 text-stone-800 hover:border-stone-400"
                      }`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${
                        addApiaryMode === "with_devices" ? "bg-amber-500 text-stone-950" : "bg-stone-200 text-stone-600"
                      }`}>
                        <Radio className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-stone-950">With devices</span>
                          {addApiaryMode === "with_devices" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed font-normal mt-1">
                          A digital beekeeper's journal (notes, inspections and more), 24/7 monitoring, parameter charts and disease detection — an apiary with a Hub, hives with VitalSensor and Scale.
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Option 2: Without devices */}
                  <div className="space-y-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setAddApiaryMode("without_devices")}
                      className={`w-full p-4 rounded-2xl border text-left font-medium text-sm transition-all flex items-start gap-3.5 ${
                        addApiaryMode === "without_devices"
                          ? "border-stone-900 bg-stone-900/5 text-stone-950 ring-2 ring-stone-900/20 shadow-sm"
                          : "border-stone-300/80 bg-white/70 text-stone-800 hover:border-stone-400"
                      }`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${
                        addApiaryMode === "without_devices" ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-600"
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-stone-950">Without devices</span>
                          {addApiaryMode === "without_devices" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-white">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed font-normal mt-1">
                          A digital beekeeper's journal (notes, inspections and more), without measurements or disease detection — an apiary without a Hub, hives without VitalSensor or Scale.
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Hint */}
                  <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-stone-600">
                    <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>You can always link or pair IoT devices to this apiary later.</span>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="mt-8 pt-5 flex items-center justify-end gap-3 border-t border-stone-300/60">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-6 py-2.5 rounded-full border border-stone-400 text-stone-700 font-bold text-xs hover:bg-stone-200/50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.name.trim()) {
                          toast.error("Please enter an apiary name first");
                          return;
                        }
                        setAddApiaryStep(2);
                      }}
                      className={`px-7 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                        formData.name.trim()
                          ? "bg-amber-500 hover:bg-amber-600 text-stone-950"
                          : "bg-stone-300 text-stone-500 cursor-not-allowed"
                      }`}
                    >
                      Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Location, Coordinates, Acres, Hives Total, Florage, Notes (+ Devices if enabled) */}
              {!editingApiary && addApiaryStep === 2 && (
                <div className="flex flex-col flex-1 p-6 sm:p-7 overflow-y-auto">
                  {/* Top Bar */}
                  <div className="relative flex items-center justify-between pb-4 border-b border-stone-300/60">
                    <button
                      type="button"
                      onClick={() => setAddApiaryStep(1)}
                      className="p-1.5 -ml-1.5 text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 rounded-xl transition-colors"
                      aria-label="Back"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                      <h2 className="text-lg sm:text-xl font-bold text-stone-900">Apiary Parameters</h2>
                      <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                        Step 2 of 2 • Site Details
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="p-1.5 -mr-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Apiary Summary Pill */}
                  <div className="mt-4 p-3 bg-[#EFE7DB] rounded-2xl border border-stone-300 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Apiary Name</span>
                      <span className="font-bold text-sm text-stone-900 truncate block">{formData.name}</span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-900 whitespace-nowrap border border-amber-500/30">
                      {addApiaryMode === "with_devices" ? "With Devices" : "Without Devices"}
                    </span>
                  </div>

                  <form onSubmit={handleSaveApiary} className="pt-4 space-y-4">
                    {/* 1. LOCATION */}
                    <div className="space-y-2 bg-white/70 p-3.5 rounded-2xl border border-stone-300/70">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                        <MapPin className="w-4 h-4 text-amber-600" />
                        <span>Location <span className="text-amber-600">*</span></span>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.location_name}
                        onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                        placeholder="e.g. Kibwezi, Makueni, Kenya"
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-600"
                      />
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                            County
                          </label>
                          <input
                            type="text"
                            value={formData.county}
                            onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                            placeholder="e.g. Makueni"
                            className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                            Region / Sub-County
                          </label>
                          <input
                            type="text"
                            value={formData.region}
                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                            placeholder="e.g. Kibwezi East"
                            className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. COORDINATES */}
                    <div className="space-y-2 bg-white/70 p-3.5 rounded-2xl border border-stone-300/70">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                          <Navigation className="w-4 h-4 text-amber-600" />
                          <span>Coordinates (GPS) <span className="text-amber-600">*</span></span>
                        </div>
                        <button
                          type="button"
                          onClick={handleDetectGps}
                          disabled={isDetectingGps}
                          className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-600/30 text-amber-900 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
                        >
                          <Compass className={`w-3.5 h-3.5 ${isDetectingGps ? "animate-spin text-amber-700" : ""}`} />
                          {isDetectingGps ? "Detecting GPS..." : "Detect Live GPS"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                            Latitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                            placeholder="-2.4090"
                            className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-600"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                            Longitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                            placeholder="37.9670"
                            className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. ACRES & 4. HIVES TOTAL */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white/70 p-3.5 rounded-2xl border border-stone-300/70">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                          <Layers className="w-3.5 h-3.5 text-amber-600" />
                          <span>Acres <span className="text-amber-600">*</span></span>
                        </div>
                        <input
                          type="number"
                          step="0.5"
                          min="0.1"
                          required
                          value={formData.size_acres}
                          onChange={(e) => setFormData({ ...formData, size_acres: parseFloat(e.target.value) || 1 })}
                          placeholder="5.0"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                          <Box className="w-3.5 h-3.5 text-amber-600" />
                          <span>Hives Total <span className="text-amber-600">*</span></span>
                        </div>
                        <input
                          type="number"
                          min="1"
                          required
                          value={formData.total_hives}
                          onChange={(e) => setFormData({ ...formData, total_hives: parseInt(e.target.value, 10) || 1 })}
                          placeholder="184"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active Colonized</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={formData.active_hives}
                          onChange={(e) => setFormData({ ...formData, active_hives: parseInt(e.target.value, 10) || 0 })}
                          placeholder="150"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    {/* 5. FLORAGE */}
                    <div className="space-y-2 bg-white/70 p-3.5 rounded-2xl border border-stone-300/70">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                        <Sprout className="w-4 h-4 text-emerald-600" />
                        <span>Florage / Forage Ecosystem <span className="text-amber-600">*</span></span>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.forage_type}
                        onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                        placeholder="e.g. Acacia, Neem, Maize, Mango & Forest Multifloral"
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                      />
                      {/* Flora Quick-Add Suggestion Chips */}
                      <div className="pt-1">
                        <span className="text-[10px] text-stone-500 font-semibold block mb-1">
                          Click to add/remove flora tags:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Acacia",
                            "Neem",
                            "Balanites (Desert Date)",
                            "Wildflowers",
                            "Sunflower",
                            "Mango",
                            "Eucalyptus",
                            "Multifloral",
                            "Coffee",
                            "Baobab",
                          ].map((chip) => {
                            const isIncluded = formData.forage_type
                              .toLowerCase()
                              .includes(chip.toLowerCase());
                            return (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => {
                                  const current = formData.forage_type.trim();
                                  if (!current) {
                                    setFormData({ ...formData, forage_type: chip });
                                    return;
                                  }
                                  const parts = current
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  if (parts.some((p) => p.toLowerCase() === chip.toLowerCase())) {
                                    const nextParts = parts.filter(
                                      (p) => p.toLowerCase() !== chip.toLowerCase()
                                    );
                                    setFormData({ ...formData, forage_type: nextParts.join(", ") });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      forage_type: [...parts, chip].join(", "),
                                    });
                                  }
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all border ${
                                  isIncluded
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
                                    : "bg-stone-100 text-stone-600 border-stone-200 hover:border-stone-400"
                                }`}
                              >
                                {isIncluded ? "✓ " : "+ "}
                                {chip}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 6. NOTES */}
                    <div className="space-y-1.5 bg-white/70 p-3.5 rounded-2xl border border-stone-300/70">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span>Notes & Beekeeper Info</span>
                      </div>
                      <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Lead Beekeeper details, terrain traits, stand positions, queen lineage, water access..."
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600 leading-relaxed"
                      />
                    </div>

                    {/* WITH DEVICES: IoT Hardware Pairing Section */}
                    {addApiaryMode === "with_devices" && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                            Attach IoT Hardware Devices
                          </label>
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            {attachedDevices.length} attached
                          </span>
                        </div>
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
                            In land (Hub)
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
                            In hive (Sensor)
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
                            Disease (Apisense)
                          </button>
                        </div>

                        {/* Scanner / Manual Code Entry */}
                        <div className="p-3 bg-white rounded-2xl border border-stone-300 space-y-2.5 shadow-sm">
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
                              className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 transition-colors flex items-center gap-1"
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
                              className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-600"
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
                              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
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
                            className="w-full py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Preload Full Kibwezi IoT Pack (5 Devices)
                          </button>
                        </div>

                        {/* Attached Devices Preview */}
                        {attachedDevices.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-stone-700">
                              Attached Devices ({attachedDevices.length}):
                            </span>
                            <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                              {attachedDevices.map((d) => (
                                <div
                                  key={d.id}
                                  className="flex items-center justify-between p-2 bg-[#EFE7DB]/70 rounded-xl text-xs text-stone-800 border border-stone-300"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                    <span className="font-semibold truncate pointer-events-none select-none">{d.name}</span>
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
                      <div className="bg-[#EFE7DB]/60 rounded-2xl p-4 text-xs text-stone-700 leading-relaxed space-y-2 border border-stone-300">
                        <p className="font-bold text-stone-900 flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" /> Digital Beekeeper's Journal Mode
                        </p>
                        <p>
                          This apiary site will be registered in digital journal mode. You can track inspections, calculate honey harvests, monitor weather, and log hive notes. Physical sensors (Hub, VitalSensor, Scales) can be paired at any point later.
                        </p>
                      </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="pt-5 flex items-center justify-between gap-3 border-t border-stone-300/60">
                      <button
                        type="button"
                        onClick={() => setAddApiaryStep(1)}
                        className="px-6 py-2.5 rounded-full border border-stone-400 text-stone-700 font-bold text-xs hover:bg-stone-200/50 transition-colors"
                      >
                        Back
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-600 font-semibold text-xs hover:bg-stone-200/50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-7 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors shadow-sm"
                        >
                          {addApiaryMode === "with_devices" ? "Register & Sync Devices" : "Register Apiary"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit Apiary Mode */}
              {editingApiary && (
                <div className="flex flex-col flex-1 p-6 sm:p-7 overflow-y-auto">
                  <div className="relative flex items-center justify-between pb-4 border-b border-stone-300/60">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingApiary(null);
                      }}
                      className="p-1.5 -ml-1.5 text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 rounded-xl transition-colors"
                      aria-label="Back"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                      <h2 className="text-lg sm:text-xl font-bold text-stone-900">Edit Apiary Station</h2>
                      <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                        Update Site Parameters
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingApiary(null);
                      }}
                      className="p-1.5 -mr-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveApiary} className="pt-4 space-y-3.5 flex-1">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                        Apiary Station Name <span className="text-amber-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                          Location Name <span className="text-amber-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.location_name}
                          onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider">County</label>
                        <input
                          type="text"
                          value={formData.county}
                          onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider">Region</label>
                        <input
                          type="text"
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 p-3 bg-white/70 rounded-2xl border border-stone-300/70">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-amber-600" /> Coordinates (GPS)
                        </span>
                        <button
                          type="button"
                          onClick={handleDetectGps}
                          disabled={isDetectingGps}
                          className="px-2 py-0.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-600/30 text-amber-900 rounded text-[10px] font-bold transition-all flex items-center gap-1"
                        >
                          <Compass className={`w-3 h-3 ${isDetectingGps ? "animate-spin" : ""}`} />
                          {isDetectingGps ? "Detecting..." : "Detect Live GPS"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="any"
                          value={formData.latitude}
                          onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                          placeholder="Latitude"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                        <input
                          type="number"
                          step="any"
                          value={formData.longitude}
                          onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                          placeholder="Longitude"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider">Active Hives</label>
                        <input
                          type="number"
                          min={0}
                          value={formData.active_hives}
                          onChange={(e) => setFormData({ ...formData, active_hives: parseInt(e.target.value, 10) || 0 })}
                          className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider">Total Capacity</label>
                        <input
                          type="number"
                          min={1}
                          value={formData.total_hives}
                          onChange={(e) => setFormData({ ...formData, total_hives: parseInt(e.target.value, 10) || 1 })}
                          className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider">Size (Acres)</label>
                        <input
                          type="number"
                          min={0.1}
                          step="0.5"
                          value={formData.size_acres}
                          onChange={(e) => setFormData({ ...formData, size_acres: parseFloat(e.target.value) || 1 })}
                          className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">Forage Flora</label>
                      <input
                        type="text"
                        value={formData.forage_type}
                        onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                      />
                      <div className="flex flex-wrap gap-1">
                        {["Acacia", "Neem", "Wildflowers", "Sunflower", "Mango", "Eucalyptus", "Multifloral", "Coffee"].map(
                          (chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => {
                                const current = formData.forage_type.trim();
                                if (!current) {
                                  setFormData({ ...formData, forage_type: chip });
                                  return;
                                }
                                const parts = current.split(",").map((s) => s.trim()).filter(Boolean);
                                if (!parts.some((p) => p.toLowerCase() === chip.toLowerCase())) {
                                  setFormData({ ...formData, forage_type: [...parts, chip].join(", ") });
                                }
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                            >
                              + {chip}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">Notes & Beekeeper Info</label>
                      <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="mt-auto pt-5 flex items-center justify-end gap-3 border-t border-stone-300/50">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          setEditingApiary(null);
                        }}
                        className="px-6 py-2.5 rounded-full border border-stone-400 text-stone-700 font-bold text-xs hover:bg-stone-200/50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-7 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors shadow-sm"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>,
          document.body
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
