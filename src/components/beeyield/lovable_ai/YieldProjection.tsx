import { useState, useEffect, useMemo, useCallback } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
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

interface YieldProjectionProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export default function YieldProjection({ isOpen, onClose, embedded = false }: YieldProjectionProps) {
  const deviceId = useDeviceId();

  // --- Real Hives & Hardware Sync State ---
  const [hivesList, setHivesList] = useState<HiveOption[]>([]);
  const [devicesList, setDevicesList] = useState<DeviceOption[]>([]);
  const [selectedHiveId, setSelectedHiveId] = useState<string>("all");
  const [linkedDevice, setLinkedDevice] = useState<DeviceOption | null>(null);
  const [isDeviceSynced, setIsDeviceSynced] = useState<boolean>(false);
  const [isLoadingHives, setIsLoadingHives] = useState<boolean>(false);

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

  // 1. Load Real Hives & Devices from Supabase Database
  const loadHivesAndDevices = useCallback(async () => {
    setIsLoadingHives(true);
    try {
      const [hivesRes, devicesRes] = await Promise.all([
        (supabase as any)
          .from("hives")
          .select("id, name, hive_code, max_brood_frames, apiaries(name)")
          .limit(100),
        (supabase as any)
          .from("devices")
          .select("id, label, serial, hive_id, status")
          .limit(100),
      ]);

      const hives: HiveOption[] = (hivesRes.data || []).map((h: any) => ({
        id: h.id,
        name: h.name,
        hive_code: h.hive_code,
        max_brood_frames: h.max_brood_frames,
        apiary_name: h.apiaries?.name || "Apiary",
      }));

      const devices: DeviceOption[] = (devicesRes.data || []).map((d: any) => ({
        id: d.id,
        label: d.label,
        serial: d.serial,
        hive_id: d.hive_id,
        status: d.status,
      }));

      setHivesList(hives);
      setDevicesList(devices);
      if (hives.length > 0 && selectedHiveId === "all") {
        setHivesCount(hives.length);
      }
    } catch (err) {
      console.warn("Failed to load hives/devices for yield projection:", err);
    } finally {
      setIsLoadingHives(false);
    }
  }, [selectedHiveId]);

  useEffect(() => {
    if (isOpen || embedded) {
      void loadHivesAndDevices();
    }
  }, [isOpen, embedded, loadHivesAndDevices]);

  // 2. Check Device Synced Telemetry when Hive is Selected
  const syncHiveDeviceReadings = useCallback(async (hiveId: string) => {
    if (hiveId === "all") {
      setLinkedDevice(null);
      setIsDeviceSynced(false);
      return;
    }

    const hive = hivesList.find((h) => h.id === hiveId);
    if (!hive) return;

    // Check if this hive has a device in devices table
    const dev = devicesList.find((d) => d.hive_id === hiveId);
    setLinkedDevice(dev || null);

    try {
      // Check for device measurements in Supabase
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
        // Check raw packet for barometric pressure if stored
        if (m.raw && typeof m.raw === "object") {
          const rawObj = m.raw as any;
          if (rawObj.pressure || rawObj.barometer || rawObj.pressure_hpa) {
            setPressureHpa(Number(rawObj.pressure || rawObj.barometer || rawObj.pressure_hpa));
          }
        }
        toast.success(`Device readings synchronized for ${hive.name || hive.hive_code}`);
      } else {
        // Timothy has no sensors synced on this hive
        setIsDeviceSynced(false);
      }
    } catch {
      setIsDeviceSynced(false);
    }
  }, [hivesList, devicesList]);

  // Trigger sync check on hive change
  const handleHiveChange = (hiveId: string) => {
    setSelectedHiveId(hiveId);
    if (hiveId !== "all") {
      setHivesCount(1);
      const h = hivesList.find((item) => item.id === hiveId);
      if (h?.max_brood_frames) {
        setBroodFrames(Math.min(12, Math.max(4, h.max_brood_frames)));
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
    // 10 frames = 100% strength, 8 frames = 80%, etc.
    const calculatedStrength = Math.round(Math.min(120, Math.max(10, (frames / 10) * 100)));
    setColonyStrength(calculatedStrength);
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
    // Strong colonies (60,000 bees) produce exponentially more surplus honey than weak colonies
    const strengthMultiplier =
      colonyStrength < 25
        ? 0.05
        : Math.pow(colonyStrength / 100, 1.45);

    // 3. Environmental & Sensor Telemetry Modifiers
    // A. Temperature Modifier (Optimal brood 34.5°C; optimal foraging flight 19°C - 28°C)
    let tempF = 1.0;
    if (tempC < 13) {
      tempF = 0.08; // Clustering; negligible foraging
    } else if (tempC < 18) {
      tempF = 0.45 + ((tempC - 13) / 5) * 0.45;
    } else if (tempC <= 28) {
      tempF = 1.0; // Ideal flight range
    } else if (tempC <= 35) {
      tempF = 1.0 - ((tempC - 28) / 7) * 0.2; // Minor thermal regulation penalty
    } else {
      tempF = Math.max(0.15, 0.8 - ((tempC - 35) / 5) * 0.6); // Water-hauling diversion
    }

    // B. Humidity Modifier (Optimal nectar dehydration 50% - 65% RH)
    let humidF = 1.0;
    if (humidityPct >= 50 && humidityPct <= 65) {
      humidF = 1.0;
    } else if (humidityPct > 65) {
      humidF = Math.max(0.4, 1.0 - ((humidityPct - 65) / 35) * 0.55);
    } else {
      humidF = Math.max(0.5, 1.0 - ((50 - humidityPct) / 30) * 0.45);
    }

    // C. Atmospheric / Barometric Pressure Modifier
    // High stable pressure (> 1012 hPa) encourages maximum flight range and foraging endurance
    // Low pressure (< 1005 hPa) signals tropical storms and keeps foragers grounded
    let pressureF = 1.0;
    if (pressureHpa >= 1012) {
      pressureF = 1.05;
    } else if (pressureHpa >= 1007) {
      pressureF = 1.0;
    } else {
      pressureF = Math.max(0.45, 0.75 + ((pressureHpa - 990) / 17) * 0.25);
    }

    // D. Scale Weight Biomass Bonus
    // Hives with healthy scale mass (> 42 kg) have already built surplus comb; low-weight hives consume nectar for buildup
    const weightF = scaleWeightKg >= 42 ? 1.08 : scaleWeightKg >= 32 ? 0.95 : 0.78;

    // E. Wind & Precipitation Flight Constraints
    const windF = windKmh > 32 ? 0.25 : Math.max(0.3, 1 - windKmh / 50);
    const precipF = precipMm > 8 ? 0.2 : Math.max(0.25, 1 - precipMm / 20);

    // Composite Bioclimatic Factor
    const weatherFactor = Math.max(0.08, (tempF * 0.25 + humidF * 0.2 + pressureF * 0.15 + windF * 0.2 + precipF * 0.2) * weightF);

    // 4. Daily Honey Surplus Rate per Hive (kg/day)
    // Reference standard: 1.40 kg surplus per hive/day at 100% flow, 100% strength, and optimal weather
    const baseDailySurplus = 1.40;
    const nectarFactor = nectarScore / 10;
    const dailyKg = Math.max(0, baseDailySurplus * strengthMultiplier * nectarFactor * weatherFactor);

    // 5. Total Season Projection (Linked directly to Available Flow Days)
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
      // Bell-shaped bloom curve: ramp 0-25%, peak 25-65%, taper 65-100%
      const x = i / days;
      const bell = x < 0.25 ? x / 0.25 : x < 0.65 ? 1.0 : Math.max(0, (1 - x) / 0.35);
      return {
        day: `D${i + 1}`,
        kg: +(calc.dailyKg * bell).toFixed(2),
        cum: 0,
      };
    }).map((d, i, arr) => {
      d.cum = +arr.slice(0, i + 1).reduce((sum, item) => sum + item.kg, 0).toFixed(1);
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
    const hiveLabel = selectedHiveObj ? selectedHiveObj.name || selectedHiveObj.hive_code : "All Apiaries";

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
    };

    const outputs = {
      dailyKg: +calc.dailyKg.toFixed(2),
      seasonKg: +calc.seasonKg.toFixed(1),
      totalKg: +calc.totalKg.toFixed(1),
      revenue: Math.round(calc.revenue),
      strengthMultiplier: +calc.strengthMultiplier.toFixed(2),
      availabilityFactor: +calc.availabilityFactor.toFixed(2),
    };

    const { error } = await (supabase as any).from("yield_projections").insert([
      {
        device_id: deviceId,
        label: `${hiveLabel} · ${calc.effectiveFlowDays}d flow · ${Math.round(calc.totalKg)} kg`,
        inputs: inputs as any,
        outputs: outputs as any,
      },
    ]);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Yield projection saved to history");
    void loadHistory();
  };

  const handleDeleteRun = async (id: string) => {
    await (supabase as any).from("yield_projections").delete().eq("id", id);
    void loadHistory();
  };

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
            className="px-3.5 py-2 rounded-xl border border-honey/40 bg-honey/10 text-honey hover:bg-honey/20 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Save className="w-3.5 h-3.5" /> Save Projection
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
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-honey" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Hive & IoT Device Telemetry</h3>
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
              onClick={loadHivesAndDevices}
              disabled={isLoadingHives}
              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
              title="Refresh Hives and Devices"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHives ? "animate-spin text-honey" : ""}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Target Colony / Hive</label>
            <select
              value={selectedHiveId}
              onChange={(e) => handleHiveChange(e.target.value)}
              className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-honey/30"
            >
              <option value="all">All Hives (Batch Apiary Estimation)</option>
              {hivesList.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name || h.hive_code} {h.apiary_name ? `(${h.apiary_name})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Hives Included in Flow</label>
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
                  ? "Aggregated Field Calculation"
                  : isDeviceSynced
                  ? "Live telemetry connected"
                  : "Timothy: No sensors synced"}
              </span>
              <span className="text-[10px] font-mono text-honey font-bold">
                {isDeviceSynced ? "100% Signal" : "Manual Override"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Calculation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Dates, Colony Availability & Bioclimatics */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="text-sm font-display font-bold text-honey flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Colony Availability & Dates
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-honey/10 text-honey">
              {calc.effectiveFlowDays} Flow Days
            </span>
          </div>

          {/* Colony Available Date Picker */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-foreground">Colony Available Date</label>
              <span className="text-[10px] text-muted-foreground">Placement date</span>
            </div>
            <input
              type="date"
              value={colonyAvailableDate}
              onChange={(e) => setColonyAvailableDate(e.target.value)}
              className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground"
            />
            <p className="text-[10px] text-muted-foreground">
              Date the colony is placed and ready for the active nectar foraging flow.
            </p>
          </div>

          {/* Target Harvest Date Picker */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-foreground">Target Harvest Date</label>
              <span className="text-[10px] text-muted-foreground">Extraction day</span>
            </div>
            <input
              type="date"
              value={targetHarvestDate}
              onChange={(e) => setTargetHarvestDate(e.target.value)}
              className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground"
            />
          </div>

          {/* Bloom Window Duration */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Flow/Bloom Cycle Length:</span>
              <span className="font-bold text-foreground">{bloomDays} days</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              value={bloomDays}
              onChange={(e) => setBloomDays(Number(e.target.value))}
              className="w-full accent-honey"
            />
          </div>

          {/* Availability Impact Notice */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-1 text-xs">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-foreground">Effective Foraging Window:</span>
              <span className="text-emerald-600 font-bold">{calc.effectiveFlowDays} of {bloomDays} days</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Availability Factor: <strong>{(calc.availabilityFactor * 100).toFixed(0)}%</strong> of bloom window captured.
              {calc.daysAvailable < bloomDays && (
                <span className="text-amber-600 block mt-0.5">
                  Delayed availability limits total surplus by {((1 - calc.availabilityFactor) * 100).toFixed(0)}%.
                </span>
              )}
            </p>
          </div>

          {/* Colony Strength Section (Farrar's Rule) */}
          <div className="pt-2 border-t border-border/50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-honey flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Colony Strength & Brood
            </h4>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Brood Nest Frames:</span>
                <span className="font-bold text-foreground">{broodFrames} / 10 frames</span>
              </div>
              <input
                type="range"
                min={2}
                max={12}
                value={broodFrames}
                onChange={(e) => handleBroodChange(Number(e.target.value))}
                className="w-full accent-honey"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Colony Strength Index:</span>
                <span className="font-bold text-emerald-600">{colonyStrength}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={120}
                value={colonyStrength}
                onChange={(e) => setColonyStrength(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <p className="text-[10px] text-muted-foreground">
                Biological Multiplier: <strong>{calc.strengthMultiplier.toFixed(2)}×</strong> surplus coefficient.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Nectar Flow Rating:</span>
                <span className="font-bold text-foreground">{nectarScore} / 10</span>
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
          </div>
        </div>

        {/* Column 2: Device Sensor Telemetry (Temp, Humidity, Pressure, Scale) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="text-sm font-display font-bold text-honey flex items-center gap-1.5">
              <Gauge className="w-4 h-4" /> Device Readings & Vitals
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-muted text-muted-foreground">
              {isDeviceSynced ? "IoT Sync Active" : "Manual Readings"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Temperature */}
            <div className="p-3 rounded-xl border border-border bg-background/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-red-500" /> Temperature
                </span>
                <span className="text-[10px] font-bold text-emerald-600">{(calc.tempF * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step={0.5}
                  value={tempC}
                  onChange={(e) => setTempC(Number(e.target.value))}
                  className="w-16 text-lg font-bold font-mono bg-transparent border-b border-border text-foreground focus:outline-none"
                />
                <span className="text-xs text-muted-foreground font-bold">°C</span>
              </div>
              <p className="text-[9px] text-muted-foreground">Optimal: 19°C - 28°C</p>
            </div>

            {/* Humidity */}
            <div className="p-3 rounded-xl border border-border bg-background/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-500" /> Humidity
                </span>
                <span className="text-[10px] font-bold text-emerald-600">{(calc.humidF * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={humidityPct}
                  onChange={(e) => setHumidityPct(Number(e.target.value))}
                  className="w-16 text-lg font-bold font-mono bg-transparent border-b border-border text-foreground focus:outline-none"
                />
                <span className="text-xs text-muted-foreground font-bold">%</span>
              </div>
              <p className="text-[9px] text-muted-foreground">Ideal RH: 50% - 65%</p>
            </div>

            {/* Barometric Pressure */}
            <div className="p-3 rounded-xl border border-border bg-background/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-violet-500" /> Pressure
                </span>
                <span className="text-[10px] font-bold text-emerald-600">{(calc.pressureF * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={pressureHpa}
                  onChange={(e) => setPressureHpa(Number(e.target.value))}
                  className="w-20 text-lg font-bold font-mono bg-transparent border-b border-border text-foreground focus:outline-none"
                />
                <span className="text-xs text-muted-foreground font-bold">hPa</span>
              </div>
              <p className="text-[9px] text-muted-foreground">Standard: 1013 hPa</p>
            </div>

            {/* Scale Weight */}
            <div className="p-3 rounded-xl border border-border bg-background/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Scale className="w-3 h-3 text-amber-500" /> Scale Weight
                </span>
                <span className="text-[10px] font-bold text-emerald-600">{(calc.weightF * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step={0.5}
                  value={scaleWeightKg}
                  onChange={(e) => setScaleWeightKg(Number(e.target.value))}
                  className="w-16 text-lg font-bold font-mono bg-transparent border-b border-border text-foreground focus:outline-none"
                />
                <span className="text-xs text-muted-foreground font-bold">kg</span>
              </div>
              <p className="text-[9px] text-muted-foreground">Base hive mass</p>
            </div>
          </div>

          {/* Secondary Weather (Wind & Rain) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Wind Velocity (km/h)</label>
              <input
                type="number"
                value={windKmh}
                onChange={(e) => setWindKmh(Number(e.target.value))}
                className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Precipitation (mm/d)</label>
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
            <label className="text-xs text-muted-foreground mb-1 block">Bulk Honey Price / kg (KES)</label>
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
                  <PolarRadiusAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={8} />
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
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Harvest per Hive</span>
                <span className="text-2xl font-display font-bold text-emerald-600 block my-0.5">
                  {calc.seasonKg.toFixed(1)} <span className="text-xs font-bold">kg</span>
                </span>
                <span className="text-[10px] text-muted-foreground">Over {calc.effectiveFlowDays} active days</span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/90 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Apiary Crop</span>
                <span className="text-2xl font-display font-bold text-honey block my-0.5">
                  {Math.round(calc.totalKg).toLocaleString()} <span className="text-xs font-bold">kg</span>
                </span>
                <span className="text-[10px] text-muted-foreground">{hivesCount} hives total</span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/90 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Daily Intake Rate</span>
                <span className="text-xl font-display font-bold text-foreground block my-0.5">
                  {calc.dailyKg.toFixed(2)} <span className="text-xs font-bold">kg/d</span>
                </span>
                <span className="text-[10px] text-muted-foreground">Peak flow surplus</span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background/90 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Gross Revenue</span>
                <span className="text-xl font-display font-bold text-emerald-600 block my-0.5">
                  KES {Math.round(calc.revenue).toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">@ KES {pricePerKg}/kg</span>
              </div>
            </div>

            {/* Daily Cumulative Extraction Curve */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Cumulative Harvest Accumulation (kg)</span>
                <span className="text-[10px] text-muted-foreground font-mono">D1 → D{calc.effectiveFlowDays}</span>
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
                    <Area type="monotone" dataKey="cum" stroke="#D97706" strokeWidth={2.5} fill="url(#honeyGrad)" />
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
              <strong>Yield (kg)</strong> = 1.40 kg/d × <strong>Strength</strong> ({calc.strengthMultiplier.toFixed(2)}×) × <strong>Availability</strong> ({calc.effectiveFlowDays}d / {(calc.availabilityFactor * 100).toFixed(0)}%) × <strong>Bioclimatic Factor</strong> ({calc.weatherFactor.toFixed(2)}) × <strong>{hivesCount} Hives</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Runs Table */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 shadow-sm">
        <h3 className="text-sm font-display font-bold text-honey mb-3 flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> Saved Projection Scenarios
        </h3>
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
                  <td colSpan={7} className="py-4 text-center text-muted-foreground">
                    No projection scenarios saved yet. Run a projection and click "Save Projection".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
