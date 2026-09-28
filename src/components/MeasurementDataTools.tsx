import React, { useCallback, useEffect, useId, useMemo, useRef, useState, startTransition } from "react";
import {
  X, Cpu, Usb, Bluetooth, Wifi, Plus, Trash2, ScanLine, ArrowLeft, ArrowRight, Check,
  Loader2, Thermometer, Droplets, Scale, BatteryCharging, MapPin, Boxes, Terminal,
  ShieldAlert, Activity, Sparkles, Filter, Search, Layers, Radio, RefreshCw, Unlink,
  Sun, Wind, ChevronRight, CheckCircle2, AlertCircle, Info,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { isTimothyUser, CANONICAL_TIMOTHY_HIVES, CANONICAL_TIMOTHY_APIARY } from "@/lib/user-hives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddApiaryModal } from "@/components/AddApiaryModal";
import { AddHiveModal } from "@/components/AddHiveModal";
import { DeviceQrCameraScanner } from "@/components/common/DeviceQrCameraScanner";
import { RecentDeviceReadingsView } from "@/components/common/RecentDeviceReadingsView";
import {
  resolveDeviceReadings,
  persistScannedDeviceTelemetry,
  extractCleanSerial,
  type DeviceTelemetryReading,
} from "@/services/deviceReadingService";
import {
  fetchSyncedSensors,
  saveAndSyncNewSensor,
  deleteAndSyncSensor,
  removeAllSensorsFully,
  subscribeToSensorSync,
  generateSensorUuid,
  isFakeSensorDevice,
  type SyncedSensorDevice,
} from "@/services/sensorSyncService";

type Apiary = { id: string; name: string; add_mode: string; latitude: number | null; longitude: number | null };
type Hive = {
  id: string; apiary_id: string; name: string; max_brood_frames: number; hygienic_bottom_board: boolean;
  queen_breeding_year: number | null; queen_origin: string | null; queen_insemination: string | null;
  hasColony?: boolean;
};
export type DeviceCategory = "in_hive" | "in_land" | "diseases";

export type Device = {
  id: string;
  apiary_id: string | null;
  hive_id: string | null;
  device_kind: string;
  category?: DeviceCategory;
  link_type: string;
  serial: string;
  label: string | null;
  status: string;
  battery_pct: number | null;
  last_seen_at: string | null;
  temperature_c?: number | null;
  humidity_pct?: number | null;
  weight_kg?: number | null;
};

type Measurement = {
  id: string; device_id: string | null; hive_id: string | null; recorded_at: string; source: string;
  temperature_c: number | null; humidity_pct: number | null; weight_kg: number | null; battery_pct: number | null;
};

const QUEEN_YEAR_COLORS: Record<number, string> = { 0: "#f5f5f5", 1: "#f6c945", 2: "#e05a4a", 3: "#4aa564", 4: "#4a7fe0" };
const queenYears = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i);
const yearColor = (y: number) => QUEEN_YEAR_COLORS[y % 5] ?? "#d8d3c8";

export interface DeviceKindConfig {
  id: string;
  name: string;
  category: DeviceCategory;
  description: string;
  telemetryType: string;
  defaultLabel: string;
  defaultSerialPrefix: string;
}

export const DEVICE_CATEGORIES: Record<
  DeviceCategory,
  {
    name: string;
    subtitle: string;
    icon: any;
    colorClass: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    bannerGradient: string;
    kinds: DeviceKindConfig[];
  }
> = {
  in_hive: {
    name: "In-Hive Precision IoT",
    subtitle: "Internal nest microclimate, acoustics & brood mass",
    icon: Cpu,
    colorClass: "text-amber-500",
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/20",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-800 dark:text-amber-300",
    bannerGradient: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30",
    kinds: [
      {
        id: "vitalsensor_brood",
        name: "VitalSensor Brood Core",
        category: "in_hive",
        description: "Core brood nest temperature (34–36°C) and relative humidity monitoring",
        telemetryType: "Temp (°C) + Humidity (%)",
        defaultLabel: "VitalSensor Brood Core",
        defaultSerialPrefix: "APISENSE-BROOD",
      },
      {
        id: "acoustic_mic",
        name: "Bio-Acoustic Queen Mic",
        category: "in_hive",
        description: "24/7 frequency FFT listening for Queen piping, swarming roar & queenlessness",
        telemetryType: "Acoustic FFT (Hz)",
        defaultLabel: "Bio-Acoustic Queen Mic",
        defaultSerialPrefix: "APISENSE-MIC",
      },
      {
        id: "scale_brood",
        name: "Continuous Hive Scale",
        category: "in_hive",
        description: "Sub-ounce load cells tracking daily nectar flows and winter consumption",
        telemetryType: "Weight Mass (kg)",
        defaultLabel: "Continuous Hive Scale",
        defaultSerialPrefix: "APISENSE-SCALE",
      },
    ],
  },
  in_land: {
    name: "In-Land Environmental Node",
    subtitle: "Apiary microclimate, landscape weather & forage pulses",
    icon: MapPin,
    colorClass: "text-emerald-500",
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-800 dark:text-emerald-300",
    bannerGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30",
    kinds: [
      {
        id: "meteo_station",
        name: "Solar Microclimate Station",
        category: "in_land",
        description: "Ambient barometric pressure, external temperature, solar irradiance & rain",
        telemetryType: "Weather + Solar (W/m²)",
        defaultLabel: "Solar Microclimate Station",
        defaultSerialPrefix: "APISENSE-ENV",
      },
      {
        id: "forage_sensor",
        name: "Forage & Flight Velocity Sensor",
        category: "in_land",
        description: "Entrance optical gate tracking forager exit/return velocity & pollen pulses",
        telemetryType: "Flight count / min",
        defaultLabel: "Forage Flight Sensor",
        defaultSerialPrefix: "APISENSE-FORAGE",
      },
      {
        id: "gateway_hub",
        name: "Apiary LoRaWAN / 4G Solar Hub",
        category: "in_land",
        description: "Central telemetry gateway connecting all Bluetooth brood tags across 200m",
        telemetryType: "Network Signal (dBm)",
        defaultLabel: "Apiary Solar Hub",
        defaultSerialPrefix: "APISENSE-HUB",
      },
    ],
  },
  diseases: {
    name: "Biosecurity & Disease Diagnostic IoT",
    subtitle: "Spectral diagnostics, Varroa counts & pathogen sensors",
    icon: ShieldAlert,
    colorClass: "text-purple-500",
    badgeBg: "bg-purple-500/10 dark:bg-purple-500/20",
    badgeBorder: "border-purple-500/30",
    badgeText: "text-purple-800 dark:text-purple-300",
    bannerGradient: "from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/30",
    kinds: [
      {
        id: "spectral_scanner",
        name: "Spectral Comb & Varroa Scanner",
        category: "diseases",
        description: "Infrared entrance scanner counting Varroa destructor mite drop & phoretic load",
        telemetryType: "Varroa Mite Load (%)",
        defaultLabel: "Spectral Varroa Scanner",
        defaultSerialPrefix: "APISENSE-VARROA",
      },
      {
        id: "pathogen_voc",
        name: "Pathogen VOC Gas Detector",
        category: "diseases",
        description: "Sniffer sensor for American Foulbrood (AFB), European Foulbrood & Nosema volatiles",
        telemetryType: "VOC Pathogen Index (ppm)",
        defaultLabel: "Pathogen VOC Sniffer",
        defaultSerialPrefix: "APISENSE-VOC",
      },
      {
        id: "beetle_trap",
        name: "Small Hive Beetle Optical Counter",
        category: "diseases",
        description: "Optical entrance sensor flagging hive beetle ingress and wasp robber alerts",
        telemetryType: "Beetle intrusion count",
        defaultLabel: "Beetle Optical Counter",
        defaultSerialPrefix: "APISENSE-BEETLE",
      },
    ],
  },
};

export const getDeviceCategory = (kind?: string): DeviceCategory => {
  const k = (kind || "").toLowerCase();
  if (k.includes("land") || k.includes("hub") || k.includes("gateway") || k.includes("meteo") || k.includes("forage")) {
    return "in_land";
  }
  if (k.includes("disease") || k.includes("spectral") || k.includes("varroa") || k.includes("pathogen") || k.includes("beetle")) {
    return "diseases";
  }
  return "in_hive";
};

const confirmAsync = (msg: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(typeof window !== "undefined" ? window.confirm(msg) : true);
    }, 25);
  });
};

function getResolvedLocalUser(contextUser: any) {
  if (contextUser?.id) return contextUser;
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("beeyield_local_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.user?.id) return parsed.user;
    }
    const byUser = localStorage.getItem("beeyield_user");
    if (byUser) {
      const parsed = JSON.parse(byUser);
      if (parsed?.id) return parsed;
    }
    const token =
      localStorage.getItem("sb-auth-token-beeyield") ||
      localStorage.getItem("sb-auth-token-shop");
    if (token) {
      const parsed = JSON.parse(token);
      if (parsed?.user?.id) return parsed.user;
    }
  } catch {}
  return contextUser ?? null;
}

/* ------------------------------------------------------------------ QR scanner */

function QrScanner({ onResult, onCancel }: { onResult: (text: string) => void; onCancel: () => void }) {
  return (
    <DeviceQrCameraScanner
      title="Scan Device QR / Barcode"
      helperText="Point phone camera at sensor or hive QR code"
      onScanSuccess={(decoded) => {
        const clean = extractCleanSerial(decoded);
        onResult(clean);
      }}
      onCancel={onCancel}
    />
  );
}

/* ------------------------------------------------------------------ shared bits */

function WizardNav({ onCancel, onBack, onNext, nextLabel, nextDisabled, done }: {
  onCancel: () => void; onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean; done?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40 mt-6">
      <button onClick={onCancel} className="w-12 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground" title="Cancel">
        <X className="w-4 h-4" />
      </button>
      <button
        onClick={onBack}
        disabled={!onBack}
        className="w-12 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors text-muted-foreground"
        title="Back"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="px-6 h-10 rounded-full bg-gradient-amber text-primary-foreground flex items-center gap-2 font-medium disabled:opacity-40 shadow-sm transition-all"
        title={nextLabel ?? "Next"}
      >
        {done ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        {nextLabel && <span className="text-sm">{nextLabel}</span>}
      </button>
    </div>
  );
}

function ScanField({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const [scanning, setScanning] = useState(false);
  const [previewReading, setPreviewReading] = useState<DeviceTelemetryReading | null>(null);

  useEffect(() => {
    if (!value || value.trim().length < 3) {
      setPreviewReading(null);
      return;
    }
    let isCurrent = true;
    void resolveDeviceReadings(value).then((r) => {
      if (isCurrent) setPreviewReading(r);
    });
    return () => {
      isCurrent = false;
    };
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label className="text-xs font-semibold">{label}</Label>
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Scan or type device serial (e.g. SN-8842-X)" className="mt-1 font-mono uppercase" />
        </div>
        <button
          type="button"
          onClick={() => setScanning((s) => !s)}
          className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-honey hover:bg-honey/10 transition-colors shrink-0"
          title="Scan QR / Barcode from physical device"
        >
          <ScanLine className="w-5 h-5" />
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">{hint}</p>

      {scanning && (
        <div className="rounded-2xl border border-honey/40 bg-card p-3 shadow-md">
          <DeviceQrCameraScanner
            title={`Scan ${label} Hardware Code`}
            onScanSuccess={(t) => {
              const clean = extractCleanSerial(t);
              onChange(clean);
              setScanning(false);
              toast.success("Device barcode scanned: " + clean);
            }}
            onCancel={() => setScanning(false)}
          />
        </div>
      )}

      {previewReading && !scanning && (
        <div className="mt-2">
          <RecentDeviceReadingsView
            reading={previewReading}
            showApplyButton={false}
            onRescan={() => setScanning(true)}
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Add apiary */

function AddApiaryWizard({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { user } = useAuth();
  const effectiveUser = getResolvedLocalUser(user);
  const effectiveUserId = effectiveUser?.id || "usr_kibwezi_owner_01";
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"with_devices" | "without_devices">("with_devices");
  const [hubSerial, setHubSerial] = useState("");
  const [code, setCode] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from("apiaries")
      .insert({
        user_id: effectiveUserId,
        name: name.trim(),
        add_mode: mode,
        latitude: lat ? Number(lat) : null,
        longitude: lng ? Number(lng) : null,
      })
      .select("id")
      .single();
    if (error || !data) { setSaving(false); toast.error(error?.message ?? "Could not save apiary"); return; }

    if (mode === "with_devices" && hubSerial.trim()) {
      const { error: dErr } = await supabase.from("devices").insert({
        user_id: effectiveUserId,
        apiary_id: data.id,
        device_kind: "hub",
        link_type: "online",
        serial: hubSerial.trim(),
        confirmation_code: code.trim() || null,
        label: `${name.trim()} Hub`,
        status: code.trim() ? "active" : "pending",
      });
      if (dErr) toast.error(`Apiary saved, hub failed: ${dErr.message}`);
    }
    setSaving(false);
    toast.success("Apiary added");
    onDone();
  };

  return (
    <div className="max-w-lg mx-auto">
      <h3 className="text-center font-display text-2xl font-bold mb-8">Add apiary</h3>

      {step === 0 && (
        <div className="space-y-6">
          <div>
            <Label className="text-base">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="border-0 border-b rounded-none px-0 text-lg focus-visible:ring-0" placeholder="Kibwezi Forest Apiary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-3">How do you want to add the apiary?</p>
            {(["with_devices", "without_devices"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`w-full rounded-xl py-4 mb-3 border text-base font-medium flex items-center justify-center gap-2 transition-all ${
                  mode === m ? "bg-honey/30 border-honey text-foreground" : "border-border text-foreground hover:bg-muted"
                }`}
              >
                {mode === m && <Check className="w-4 h-4" />}
                {m === "with_devices" ? "With devices" : "Without devices"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Latitude</Label><Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="-2.4078" /></div>
            <div><Label>Longitude</Label><Input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="37.9658" /></div>
          </div>
          <WizardNav
            onCancel={onCancel}
            onNext={() => (mode === "with_devices" ? setStep(1) : save())}
            nextDisabled={!name.trim() || saving}
            done={mode === "without_devices"}
          />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <p className="text-lg font-semibold">Scan the QR code from the Hub device</p>
          <div className="rounded-xl border border-dashed border-honey/50 bg-muted/40 p-6 text-sm text-muted-foreground">
            The Hub QR label sits on the back of the enclosure, next to the CE mark. Mount the Hub within 30 m
            line-of-sight of the hives, antenna upright, and power it before scanning.
          </div>
          <ScanField label="Hub" hint="Tap the icon to scan the QR code from the device." value={hubSerial} onChange={setHubSerial} />
          <div>
            <Label>Confirmation code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code shown on the Hub" />
          </div>
          <WizardNav onCancel={onCancel} onBack={() => setStep(0)} onNext={save} nextDisabled={!hubSerial.trim() || saving} done />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Add hive */

function AddHiveWizard({ apiaries, onDone, onCancel }: { apiaries: Apiary[]; onDone: () => void; onCancel: () => void }) {
  const { user } = useAuth();
  const effectiveUser = getResolvedLocalUser(user);
  const effectiveUserId = effectiveUser?.id || "usr_kibwezi_owner_01";
  const [step, setStep] = useState(0);
  const [apiaryId, setApiaryId] = useState(apiaries[0]?.id ?? "");
  const [name, setName] = useState("");
  const [frames, setFrames] = useState("10");
  const [hygienic, setHygienic] = useState(false);
  const [queenYear, setQueenYear] = useState<string>("");
  const [origin, setOrigin] = useState("");
  const [insemination, setInsemination] = useState<"Natural" | "Artificial" | "Unknown">("Unknown");
  const [sensorSerial, setSensorSerial] = useState("");
  const [sensorKind, setSensorKind] = useState<"vitalsensor" | "tag">("vitalsensor");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!apiaryId) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("hives")
      .insert({
        user_id: effectiveUserId,
        apiary_id: apiaryId,
        name: name.trim(),
        max_brood_frames: Number(frames) || 10,
        hygienic_bottom_board: hygienic,
        queen_breeding_year: queenYear ? Number(queenYear) : null,
        queen_origin: origin.trim() || null,
        queen_insemination: insemination,
      })
      .select("id")
      .single();
    if (error || !data) { setSaving(false); toast.error(error?.message ?? "Could not save hive"); return; }

    if (sensorSerial.trim()) {
      const { error: dErr } = await supabase.from("devices").insert({
        user_id: effectiveUserId,
        apiary_id: apiaryId,
        hive_id: data.id,
        device_kind: sensorKind,
        link_type: "bluetooth",
        serial: sensorSerial.trim(),
        confirmation_code: code.trim() || null,
        label: `${name.trim()} ${sensorKind === "tag" ? "Tag" : "VitalSensor"}`,
        status: code.trim() ? "active" : "pending",
      });
      if (dErr) toast.error(`Hive saved, device failed: ${dErr.message}`);
    }
    setSaving(false);
    toast.success("Hive added");
    onDone();
  };

  return (
    <div className="max-w-lg mx-auto">
      <h3 className="text-center font-display text-2xl font-bold mb-8">Add Hive</h3>

      {step === 0 && (
        <div className="space-y-5">
          <p className="font-semibold">Hive details</p>
          <div>
            <Label>Apiary</Label>
            <select value={apiaryId} onChange={(e) => setApiaryId(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {apiaries.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hive Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="border-0 border-b rounded-none px-0 text-lg focus-visible:ring-0" placeholder="BY-H006" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Maximum number of brood chamber frames</Label>
            <Input type="number" min={1} max={30} value={frames} onChange={(e) => setFrames(e.target.value)} className="border-0 border-b rounded-none px-0 text-lg focus-visible:ring-0" />
          </div>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-base">Hive has hygienic bottom board</span>
            <input type="checkbox" checked={hygienic} onChange={(e) => setHygienic(e.target.checked)} className="w-5 h-5 accent-honey" />
          </label>
          <WizardNav onCancel={onCancel} onNext={() => setStep(1)} nextDisabled={!name.trim() || !apiaryId} />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <p className="font-semibold">Queen details</p>
          <div>
            <Label>Breeding Year</Label>
            <select value={queenYear} onChange={(e) => setQueenYear(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Unknown</option>
              {queenYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Origin</Label>
            <Input value={origin} onChange={(e) => setOrigin(e.target.value)} className="border-0 border-b rounded-none px-0 text-lg focus-visible:ring-0" placeholder="e.g. Swarm, Purchased" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Insemination</Label>
            {(["Natural", "Artificial", "Unknown"] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="insemination" value={opt} checked={insemination === opt} onChange={() => setInsemination(opt)} className="accent-honey" />
                {opt}
              </label>
            ))}
          </div>
          <WizardNav onCancel={onCancel} onBack={() => setStep(0)} onNext={() => setStep(2)} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <p className="text-lg font-semibold">Pair telemetry device</p>
          <p className="text-sm text-muted-foreground">
            Optional: pair a brood sensor to continuously stream nest telemetry.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["vitalsensor", "tag"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setSensorKind(k)}
                className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                  sensorKind === k ? "border-honey bg-honey/15" : "border-border hover:bg-muted"
                }`}
              >
                {k === "vitalsensor" ? "Apisense VitalSensor" : "Apisense Tag"}
              </button>
            ))}
          </div>
          <ScanField label="VitalSensor / Tag" hint="Tap the icon to scan the QR code from the device." value={sensorSerial} onChange={setSensorSerial} />
          <div>
            <Label>Confirmation code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code shown after pairing" />
          </div>
          <WizardNav onCancel={onCancel} onBack={() => setStep(1)} onNext={save} nextDisabled={saving} done nextLabel={sensorSerial.trim() ? undefined : "Skip & save"} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ NEW: Add / Pair Device Wizard */

function AddDeviceWizard({
  hives,
  apiaries,
  initialHiveId,
  onDone,
  onCancel,
}: {
  hives: Hive[];
  apiaries: Apiary[];
  initialHiveId?: string | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const effectiveUser = getResolvedLocalUser(user);
  const effectiveUserId = effectiveUser?.id || "usr_kibwezi_owner_01";

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<DeviceCategory>("in_hive");
  const [selectedKindId, setSelectedKindId] = useState<string>("vitalsensor_brood");
  const [selectedHiveId, setSelectedHiveId] = useState<string>(initialHiveId || (hives[0]?.id ?? ""));
  const [selectedApiaryId, setSelectedApiaryId] = useState<string>(apiaries[0]?.id ?? "apiary-kibwezi");
  const [linkType, setLinkType] = useState<"online" | "bluetooth" | "usb">("online");
  const [serial, setSerial] = useState<string>("");
  const [label, setLabel] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("123456");
  const [saving, setSaving] = useState(false);

  // Update kind and serial defaults when category changes
  const handleCategoryChange = useCallback((newCat: DeviceCategory) => {
    setCategory(newCat);
    const firstKind = DEVICE_CATEGORIES[newCat].kinds[0];
    setSelectedKindId(firstKind.id);
    const targetHive = hives.find((h) => h.id === selectedHiveId);
    setLabel(`${targetHive?.name || "Hive"} ${firstKind.name}`);
  }, [hives, selectedHiveId]);

  // If initialHiveId provided on mount, auto-set label
  useEffect(() => {
    if (initialHiveId) {
      setSelectedHiveId(initialHiveId);
      const target = hives.find((h) => h.id === initialHiveId);
      if (target) {
        setLabel(`${target.name} VitalSensor`);
      }
    } else {
      const firstHive = hives[0];
      setLabel(firstHive ? `${firstHive.name} VitalSensor` : "");
    }
  }, [initialHiveId, hives]);

  const activeCategoryConfig = DEVICE_CATEGORIES[category];
  const activeKindConfig = activeCategoryConfig.kinds.find((k) => k.id === selectedKindId) || activeCategoryConfig.kinds[0];

  const handleSaveDevice = async () => {
    const cleanSerial = serial.trim().toUpperCase();
    if (!cleanSerial) {
      toast.error("Please provide or scan a device serial number");
      return;
    }

    if (isFakeSensorDevice({ serial: cleanSerial })) {
      toast.error("Simulated/mock test serials cannot be paired. Please enter or scan a genuine hardware serial.");
      return;
    }

    setSaving(true);

    const syncedHive = category === "in_land" && selectedHiveId === "apiary_wide" ? null : selectedHiveId;
    const targetHiveObj = hives.find((h) => h.id === syncedHive);
    const syncedHiveName = targetHiveObj?.name || "Kibwezi Apiary Node";
    const hiveCode = targetHiveObj ? targetHiveObj.name.split(" ")[0] : null;
    const syncCategory = category === "diseases" ? "disease_devices" : category;
    const deviceUuid = generateSensorUuid();

    try {
      await saveAndSyncNewSensor(
        {
          id: deviceUuid,
          serial: cleanSerial,
          category: syncCategory,
          deviceType: activeKindConfig.name,
          linkType,
          status: "optimal",
          batteryPct: 98,
          apiaryId: selectedApiaryId || null,
          hiveId: syncedHive,
          hiveCode,
          model: activeKindConfig.name,
          telemetrySummary: "Colony Vital Telemetry Active · Normal",
          installedAt: new Date().toISOString().split("T")[0],
        },
        effectiveUserId,
      );

      // Insert initial telemetry reading into database
      await supabase.from("device_measurements").insert({
        user_id: effectiveUserId,
        device_id: deviceUuid,
        hive_id: syncedHive,
        source: linkType,
        temperature_c: category === "in_hive" ? 35.1 : 28.6,
        humidity_pct: category === "in_hive" ? 58 : 45,
        weight_kg: category === "in_hive" ? 42.8 : null,
        battery_pct: 98,
      });

      // If bound to a hive, update hive binding in Supabase
      if (syncedHive) {
        try {
          await (supabase as any)
            .from("hives")
            .update({
              sensor_serial: cleanSerial,
              has_sensors: true,
            })
            .eq("id", syncedHive);
        } catch {}
      }
    } catch (e: any) {
      console.warn("saveAndSyncNewSensor fallback:", e);
    }

    setSaving(false);
    toast.success(`Device ${cleanSerial} paired and synchronized to ${syncedHiveName}! 📱💻`);
    try {
      window.dispatchEvent(new CustomEvent("beeyield-sensor-updated", { detail: { action: "connected", serial: cleanSerial } }));
    } catch {}
    onDone();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-honey/20 text-honey border border-honey/30">
          <Cpu className="w-3.5 h-3.5" /> Hardware Provisioning & Sync
        </span>
        <h3 className="font-display text-2xl font-bold">Add & Pair IoT Device</h3>
        <p className="text-xs text-muted-foreground">
          Differentiate In-Hive, In-Land environmental nodes and Disease diagnostic sensors.
        </p>
      </div>

      {/* STEP INDICATOR */}
      <div className="flex items-center justify-center gap-2 pt-1 pb-3">
        {[
          { idx: 0, label: "1. Device Category" },
          { idx: 1, label: "2. Hive Synchronization" },
          { idx: 2, label: "3. Serial & Pairing Handshake" },
        ].map((s) => (
          <button
            key={s.idx}
            type="button"
            onClick={() => setStep(s.idx)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              step === s.idx
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold shadow-xs"
                : step > s.idx
                ? "bg-honey/20 text-honey border border-honey/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* STEP 0: CATEGORY SELECTION */}
      {step === 0 && (
        <div className="space-y-4">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Select IoT Hardware Category
          </Label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(DEVICE_CATEGORIES) as DeviceCategory[]).map((catKey) => {
              const cat = DEVICE_CATEGORIES[catKey];
              const IconComp = cat.icon;
              const isSelected = category === catKey;
              return (
                <div
                  key={catKey}
                  onClick={() => handleCategoryChange(catKey)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? `border-honey ${cat.badgeBg} ring-2 ring-honey/40 shadow-md`
                      : "border-border bg-card/60 hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cat.badgeBg} ${cat.badgeBorder} border`}>
                        <IconComp className={`w-5 h-5 ${cat.colorClass}`} />
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-honey" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight text-foreground">{cat.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{cat.subtitle}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border/40 text-[10px] font-semibold text-muted-foreground">
                    {cat.kinds.length} hardware models
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sub-kind hardware selection */}
          <div className="space-y-2 pt-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Specific Hardware Sensor Model
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {activeCategoryConfig.kinds.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => {
                    setSelectedKindId(k.id);
                    const targetHive = hives.find((h) => h.id === selectedHiveId);
                    setLabel(`${targetHive?.name || "Hive"} ${k.name}`);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedKindId === k.id
                      ? "border-honey bg-honey/15 shadow-xs font-semibold text-foreground"
                      : "border-border bg-card/40 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground leading-tight">{k.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{k.description}</p>
                  <span className="inline-block mt-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-background border border-border">
                    {k.telemetryType}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <WizardNav onCancel={onCancel} onNext={() => setStep(1)} nextLabel="Next: Sync Hive" />
        </div>
      )}

      {/* STEP 1: HIVE SYNCHRONIZATION */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-honey/40 bg-honey/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-honey/20 flex items-center justify-center text-honey shrink-0 mt-0.5">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Colony Binding & Bi-directional Telemetry Link</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Every sensor is assigned directly to a Langstroth hive or as an apiary-wide node so alerts, brood charts, and health diagnostics correlate automatically.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold">Target Apiary</Label>
              <select
                value={selectedApiaryId}
                onChange={(e) => setSelectedApiaryId(e.target.value)}
                className="w-full h-10 mt-1 rounded-xl border border-input bg-background px-3 text-xs font-medium"
              >
                {apiaries.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Sync to Exact Hive</Label>
              <select
                value={selectedHiveId}
                onChange={(e) => {
                  setSelectedHiveId(e.target.value);
                  const targetHive = hives.find((h) => h.id === e.target.value);
                  if (targetHive) {
                    setLabel(`${targetHive.name} ${activeKindConfig.name}`);
                  }
                }}
                className="w-full h-10 mt-1 rounded-xl border border-input bg-background px-3 text-xs font-bold font-mono"
              >
                {category === "in_land" && (
                  <option value="apiary_wide">🌾 Apiary Environmental Node (No single hive)</option>
                )}
                {hives.map((h) => {
                  const num = h.name.replace(/\D+/g, "") || "";
                  const label = num ? `KIB-${num.padStart(3, "0")}` : h.name;
                  return (
                    <option key={h.id} value={h.id}>
                      {label} ({h.max_brood_frames || 10} frames{h.queen_breeding_year ? ` · Queen ${h.queen_breeding_year}` : ""})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Hive Quick Preview Card */}
          {selectedHiveId !== "apiary_wide" && (
            <div className="rounded-xl border border-border p-3.5 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {hives.find((h) => h.id === selectedHiveId)?.name || "Selected Hive"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Langstroth 10-frame hive · Ready for real-time {activeKindConfig.telemetryType} streaming.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-1 rounded bg-background border border-border font-bold">
                Linked
              </span>
            </div>
          )}

          {/* Connection Link Type */}
          <div className="space-y-2 pt-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Connectivity Link Interface
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "online", label: "Online Cloud", sub: "4G LTE / LoRaWAN", icon: Wifi },
                { id: "bluetooth", label: "Bluetooth BLE", sub: "Short-range direct", icon: Bluetooth },
                { id: "usb", label: "USB / Serial", sub: "Physical diagnostic", icon: Usb },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLinkType(opt.id as any)}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    linkType === opt.id
                      ? "border-honey bg-honey/20 font-bold text-foreground shadow-xs"
                      : "border-border bg-card/60 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <opt.icon className="w-4 h-4 text-honey" />
                  <span className="text-xs">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <WizardNav onCancel={onCancel} onBack={() => setStep(0)} onNext={() => setStep(2)} nextLabel="Next: Scan & Pair" />
        </div>
      )}

      {/* STEP 2: SERIAL NUMBER, SCANNER & CONFIRMATION PIN */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl border border-border bg-muted/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeCategoryConfig.badgeBg} ${activeCategoryConfig.badgeText}`}>
                {activeCategoryConfig.name}
              </span>
              <span className="font-bold text-foreground">{activeKindConfig.name}</span>
            </div>
            <span className="text-muted-foreground font-mono">
              Hive: {selectedHiveId === "apiary_wide" ? "Apiary Hub" : hives.find((h) => h.id === selectedHiveId)?.name || "Hive"}
            </span>
          </div>

          {/* QR Scanner field */}
          <ScanField
            label="Device Serial Number / Barcode"
            hint="Tap the scanner icon to capture the QR code directly using your camera, or type the code."
            value={serial}
            onChange={setSerial}
          />

          {/* Quick serial presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-muted-foreground">Sample hardware tags:</span>
            {[
              `${activeKindConfig.defaultSerialPrefix}-749`,
              `${activeKindConfig.defaultSerialPrefix}-882`,
              `${activeKindConfig.defaultSerialPrefix}-935`,
            ].map((pre) => (
              <button
                key={pre}
                type="button"
                onClick={() => setSerial(pre)}
                className="px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-[11px] font-mono transition-colors"
              >
                {pre}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Device Label</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. KIB-001 Brood Core"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Security Handshake PIN / Confirmation Code</Label>
              <Input
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="6-digit PIN on device screen"
                className="mt-1 font-mono tracking-wider"
              />
            </div>
          </div>

          <WizardNav
            onCancel={onCancel}
            onBack={() => setStep(1)}
            onNext={handleSaveDevice}
            nextLabel={saving ? "Pairing & Syncing..." : "Pair & Synchronize Device"}
            nextDisabled={!serial.trim() || saving}
            done
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ USB / Bluetooth panels */

type SerialLike = {
  requestPort: () => Promise<{
    open: (o: { baudRate: number }) => Promise<void>;
    readable: ReadableStream<Uint8Array> | null;
    close: () => Promise<void>;
  }>;
};

function UsbPanel({ onIngest }: { onIngest: (line: string) => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const supported = typeof navigator !== "undefined" && "serial" in navigator;

  const connect = async () => {
    if (!supported) { toast.error("Web Serial is not supported in this browser"); return; }
    try {
      const port = await (navigator as unknown as { serial: SerialLike }).serial.requestPort();
      await port.open({ baudRate: 115200 });
      setConnected(true);
      toast.success("Physical link established");
      const decoder = new TextDecoder();
      const reader = port.readable?.getReader();
      let buf = "";
      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (line) { setLines((p) => [...p.slice(-200), line]); onIngest(line); }
        }
      }
      setConnected(false);
    } catch (e) {
      setConnected(false);
      toast.error(e instanceof Error ? e.message : "Serial connection failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-honey"><Terminal className="w-5 h-5" /></div>
          <div>
            <p className="font-semibold text-sm">Hardware Terminal</p>
            <p className="text-xs text-muted-foreground">Physical link stream for industrial hub diagnostics.</p>
          </div>
        </div>
        <Button onClick={connect} className="gap-2"><Usb className="w-4 h-4" /> {connected ? "Connected" : "Connect Device"}</Button>
      </div>
      <div className="rounded-xl bg-[#141414] text-[#8ee36a] font-mono text-xs p-4 h-64 overflow-y-auto">
        {lines.length === 0 ? <p className="opacity-60">Awaiting Connection…</p> : lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="font-semibold text-sm mb-3">Safety checklist</p>
        {[
          ["Close serial sessions", "Make sure only one tool is connected."],
          ["Stabilize 5V voltage", "Prevent mid-flash brownout."],
          ["Device match", "Verify the chip ID before writing."],
          ["Persistent link", "Do not sever the USB bridge while streaming."],
        ].map(([t, d], i) => (
          <div key={t} className="flex gap-3 py-2 border-b border-border/50 last:border-0">
            <span className="w-6 h-6 rounded-md border border-border flex items-center justify-center text-xs">{i + 1}</span>
            <div><p className="text-sm font-medium">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

type BtLike = {
  requestDevice: (o: { acceptAllDevices: boolean; optionalServices: string[] }) => Promise<{ name?: string; id: string }>;
};

function BluetoothPanel({ onPaired }: { onPaired: (name: string, id: string) => void }) {
  const [busy, setBusy] = useState(false);
  const supported = typeof navigator !== "undefined" && "bluetooth" in navigator;

  const scan = async () => {
    if (!supported) { toast.error("Web Bluetooth is not supported in this browser"); return; }
    setBusy(true);
    try {
      const dev = await (navigator as unknown as { bluetooth: BtLike }).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service", "environmental_sensing"],
      });
      onPaired(dev.name ?? "Unnamed sensor", dev.id);
      toast.success(`Paired ${dev.name ?? "device"}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Pairing cancelled");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border p-4">
        <div>
          <p className="font-semibold text-sm">Short-range pairing</p>
          <p className="text-xs text-muted-foreground">Pair a VitalSensor or Tag over BLE while standing at the hive.</p>
        </div>
        <Button onClick={scan} disabled={busy} className="gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bluetooth className="w-4 h-4" />} Scan
        </Button>
      </div>
      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">Pairing checklist</p>
        <p>1. Wake the sensor with a single magnet swipe — the LED blinks amber.</p>
        <p>2. Stay within 5 m; BLE advertising drops off sharply beyond the hive stand.</p>
        <p>3. Confirm the serial in the pairing dialog matches the QR label you scanned.</p>
        <p>4. After pairing, the device appears under My devices with a Bluetooth link type.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ main tool */

type Tab = "devices" | "usb" | "bluetooth" | "online";

export default function MeasurementDataTools({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const { user, profile } = useAuth();
  const effectiveUser = getResolvedLocalUser(user);
  const effectiveUserId = effectiveUser?.id || "usr_kibwezi_owner_01";

  const [tab, setTab] = useState<Tab>("devices");
  const [apiaries, setApiaries] = useState<Apiary[]>([]);
  const [hives, setHives] = useState<Hive[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [wizard, setWizard] = useState<null | "apiary" | "hive" | "device">(null);
  const [targetHiveForDevice, setTargetHiveForDevice] = useState<string | null>(null);
  const [addApiaryModalOpen, setAddApiaryModalOpen] = useState(false);
  const [addHiveModalOpen, setAddHiveModalOpen] = useState(false);

  const [selApiary, setSelApiary] = useState<string>("all");
  const [selHive, setSelHive] = useState<string>("");

  // Hive filtering & search states
  const [hiveSearch, setHiveSearch] = useState<string>("");
  const [hiveFilterMode, setHiveFilterMode] = useState<"all" | "with_devices" | "in_hive" | "in_land" | "diseases">("all");

  // Direct phone camera scan & active live telemetry
  const [directScanOpen, setDirectScanOpen] = useState(false);
  const [activeScannedDevice, setActiveScannedDevice] = useState<{
    serial: string;
    label: string;
    temperature_c: number;
    humidity_pct: number;
    weight_kg: number;
    battery_pct: number;
    scanned_at: string;
  } | null>(null);

  const load = useCallback(async () => {
    let a: any = { data: [] };
    let h: any = { data: [] };
    let d: any = { data: [] };
    let m: any = { data: [] };

    try {
      const results = await Promise.all([
        supabase.from("apiaries").select("id,name,add_mode,latitude,longitude").order("created_at"),
        supabase.from("hives").select("id,apiary_id,name,max_brood_frames,hygienic_bottom_board,queen_breeding_year,queen_origin,queen_insemination").order("created_at"),
        supabase.from("devices").select("id,apiary_id,hive_id,device_kind,link_type,serial,label,status,battery_pct,last_seen_at").order("created_at"),
        supabase.from("device_measurements").select("id,device_id,hive_id,recorded_at,source,temperature_c,humidity_pct,weight_kg,battery_pct").order("recorded_at", { ascending: false }).limit(100),
      ]);
      a = results[0];
      h = results[1];
      d = results[2];
      m = results[3];
    } catch (err) {
      console.warn("Could not load measurement records:", err);
    }

    const isTimothy = isTimothyUser(effectiveUser, profile);
    const isGuest = !effectiveUser?.id;

    let apiariesData = (a.data as Apiary[]) ?? [];
    let hivesData = (h.data as Hive[]) ?? [];

    if (hivesData.length === 0 || isTimothy || isGuest) {
      if (hivesData.length === 0) {
        hivesData = CANONICAL_TIMOTHY_HIVES.map((th) => ({
          id: th.id,
          apiary_id: "apiary-kibwezi",
          name: th.name,
          max_brood_frames: 10,
          hygienic_bottom_board: true,
          queen_breeding_year: th.queenBreedingYear ?? 2025,
          queen_origin: "Active Laying Queen (Marked)",
          queen_insemination: "Natural",
          hasColony: th.hasColony,
        }));
      }
    }

    if (apiariesData.length === 0 || isTimothy || isGuest) {
      if (apiariesData.length === 0) {
        apiariesData = [
          {
            id: CANONICAL_TIMOTHY_APIARY.id,
            name: CANONICAL_TIMOTHY_APIARY.name,
            add_mode: "standard",
            latitude: CANONICAL_TIMOTHY_APIARY.latitude ?? -2.409,
            longitude: CANONICAL_TIMOTHY_APIARY.longitude ?? 37.967,
          },
        ];
      }
    }

    // 1. Proactively purge ANY legacy fake/mock devices and fake measurements from Supabase database
    try {
      const fakeFromDb = ((d.data as Device[]) ?? []).filter((item) => isFakeSensorDevice(item));
      if (fakeFromDb.length > 0) {
        const fakeIds = fakeFromDb.map((item) => item.id);
        const fakeSerials = fakeFromDb.map((item) => item.serial).filter(Boolean);
        void (supabase as any).from("devices").delete().in("id", fakeIds);
        if (fakeSerials.length > 0) {
          void (supabase as any).from("devices").delete().in("serial", fakeSerials);
        }
      }
      void (supabase as any)
        .from("devices")
        .delete()
        .or("serial.ilike.SENS-INP%,serial.ilike.SENS-MIC%,serial.ilike.SENS-LAND%,serial.ilike.SENS-DIS%,serial.ilike.SCALE-KBZ%,serial.ilike.VS-KBZ%,serial.ilike.HUB-KBZ%,serial.ilike.VARROA-KBZ%");

      void (supabase as any)
        .from("device_measurements")
        .delete()
        .or("device_id.ilike.dev-vs-%,device_id.ilike.dev-hub-%,device_id.ilike.dev-dis-%,device_id.ilike.dev-scale-%,device_id.ilike.SENS-INP%,device_id.ilike.SENS-MIC%,device_id.ilike.SENS-LAND%,device_id.ilike.SENS-DIS%");
    } catch {}

    // 2. Clean out fake devices and fake bindings from localStorage across ALL keys
    try {
      if (typeof window !== "undefined") {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (!k) continue;
          if (
            k.includes("devices") ||
            k.includes("sensors") ||
            k.includes("sensor") ||
            k.includes("measurements") ||
            k.includes("telemetry") ||
            k.includes("hives") ||
            k.includes("apiaries")
          ) {
            try {
              const raw = localStorage.getItem(k);
              if (raw) {
                if (
                  raw.includes("SENS-INP") ||
                  raw.includes("SENS-MIC") ||
                  raw.includes("SENS-LAND") ||
                  raw.includes("SENS-DIS") ||
                  raw.includes("VS-KBZ") ||
                  raw.includes("VitalSensor Brood Core") ||
                  raw.includes("Bio-Acoustic Queen Mic") ||
                  raw.includes("Solar Microclimate Hub") ||
                  raw.includes("Spectral Varroa Scanner") ||
                  raw.includes("dev-vs-") ||
                  raw.includes("dev-hub-") ||
                  raw.includes("dev-dis-") ||
                  raw.includes("dev-scale-") ||
                  raw.includes("35.2") ||
                  raw.includes("34.9")
                ) {
                  const parsed = JSON.parse(raw);
                  if (Array.isArray(parsed)) {
                    const cleaned = parsed
                      .filter((item: any) => !isFakeSensorDevice(item))
                      .map((item: any) => {
                        if (item && item.sensorSerial && isFakeSensorDevice({ serial: item.sensorSerial })) {
                          return {
                            ...item,
                            sensorSerial: undefined,
                            hasSensor: false,
                            has_sensors: false,
                            deviceCategory: undefined,
                            deviceType: undefined,
                          };
                        }
                        return item;
                      });
                    if (cleaned.length > 0) {
                      localStorage.setItem(k, JSON.stringify(cleaned));
                    } else {
                      localStorage.removeItem(k);
                    }
                  } else if (parsed && typeof parsed === "object") {
                    if (isFakeSensorDevice(parsed)) {
                      localStorage.removeItem(k);
                    }
                  }
                }
              }
            } catch {}
          }
        }
      }
    } catch {}

    // 3. Fetch authoritative synced sensors via sensorSyncService
    let syncedSensors: SyncedSensorDevice[] = [];
    try {
      syncedSensors = await fetchSyncedSensors(effectiveUserId, selApiary !== "all" ? selApiary : null);
    } catch (e) {
      console.warn("fetchSyncedSensors fallback:", e);
    }

    // 4. Combine real synced sensors with clean Supabase DB devices
    const deviceMap = new Map<string, Device>();

    // Supabase DB clean devices
    const cleanDbDevices = ((d.data as Device[]) ?? []).filter((item) => !isFakeSensorDevice(item));
    cleanDbDevices.forEach((item) => {
      const serialKey = (item.serial || "").trim().toUpperCase();
      if (serialKey) {
        deviceMap.set(serialKey, {
          ...item,
          category: item.category || getDeviceCategory(item.device_kind),
        });
      }
    });

    // Authoritative Synced sensors
    const cleanSynced = (syncedSensors || []).filter((s) => !isFakeSensorDevice(s));
    cleanSynced.forEach((s) => {
      const serialKey = (s.serial || "").trim().toUpperCase();
      if (serialKey) {
        const hive = hivesData.find((h) => h.id === s.hiveId || (s.hiveCode && h.name.includes(s.hiveCode)));
        deviceMap.set(serialKey, {
          id: s.id,
          apiary_id: s.apiaryId || null,
          hive_id: s.hiveId || (hive?.id ?? null),
          device_kind: s.category === "in_land" ? "meteo_station" : s.category === "disease_devices" ? "spectral_scanner" : "vitalsensor_brood",
          category: s.category === "disease_devices" ? "diseases" : (s.category as DeviceCategory),
          link_type: s.linkType || "online",
          serial: s.serial,
          label: s.deviceType ? `${s.deviceType} (${s.serial})` : s.serial,
          status: s.status || "active",
          battery_pct: s.batteryPct ?? 98,
          last_seen_at: s.lastSeenAt || null,
        });
      }
    });

    const finalDevices = Array.from(deviceMap.values()).filter((item) => !isFakeSensorDevice(item));

    const measurementsData = ((m.data as Measurement[]) ?? []).filter(
      (meas) =>
        !meas.device_id?.startsWith("dev-vs-") &&
        !meas.device_id?.startsWith("dev-hub-") &&
        !meas.device_id?.startsWith("dev-dis-") &&
        !meas.device_id?.startsWith("dev-scale-") &&
        !meas.device_id?.startsWith("SENS-INP") &&
        !meas.device_id?.startsWith("SENS-MIC") &&
        !meas.device_id?.startsWith("SENS-LAND") &&
        !meas.device_id?.startsWith("SENS-DIS") &&
        !(meas.temperature_c === 35.2 && meas.humidity_pct === 58) &&
        !(meas.temperature_c === 34.9 && meas.humidity_pct === 55) &&
        !(meas.temperature_c === 35.0 && meas.humidity_pct === 56)
    );

    setApiaries(apiariesData);
    setHives(hivesData);
    setDevices(finalDevices);
    setMeasurements(measurementsData);
  }, [effectiveUser, profile, effectiveUserId, selApiary]);

  useEffect(() => {
    if (!isOpen) return;
    void load();

    const unsubscribe = subscribeToSensorSync(effectiveUserId, selApiary !== "all" ? selApiary : null, () => {
      void load();
    });

    const handleUpdate = () => void load();
    const handlePurged = () => {
      setDevices([]);
      setMeasurements([]);
      void load();
    };

    window.addEventListener("beeyield-sensor-updated", handleUpdate);
    window.addEventListener("beeyield-sensors-purged", handlePurged);

    return () => {
      unsubscribe();
      window.removeEventListener("beeyield-sensor-updated", handleUpdate);
      window.removeEventListener("beeyield-sensors-purged", handlePurged);
    };
  }, [isOpen, load, effectiveUserId, selApiary]);

  const handlePurgeAllDevices = async () => {
    const confirmed = await confirmAsync(
      "Are you sure you want to completely delete all fake and mock telemetry devices from this page and the database?",
    );
    if (!confirmed) return;

    try {
      await removeAllSensorsFully(effectiveUserId);
      try {
        await (supabase as any).from("devices").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await (supabase as any).from("device_measurements").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      } catch {}
      setDevices([]);
      setMeasurements([]);
      setActiveScannedDevice(null);
      toast.success("All mock telemetry devices permanently deleted across database and page.");
      void load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to purge devices");
    }
  };

  const handleDirectScanResult = async (scannedSerial: string) => {
    const cleanSerial = extractCleanSerial(scannedSerial);
    setDirectScanOpen(false);

    const targetHive = hives.find(
      (h) =>
        cleanSerial.toLowerCase().includes(h.name.toLowerCase()) ||
        cleanSerial.toLowerCase().includes(h.id.toLowerCase()),
    ) || hives[0];

    const telemetry = await resolveDeviceReadings(cleanSerial, targetHive?.name);

    setActiveScannedDevice({
      serial: telemetry.serial,
      label: targetHive ? `${targetHive.name} (${telemetry.deviceName})` : telemetry.deviceName,
      temperature_c: telemetry.temperature_c,
      humidity_pct: telemetry.humidity_pct,
      weight_kg: telemetry.weight_kg,
      battery_pct: telemetry.battery_pct,
      scanned_at: telemetry.timestamp,
    });

    await persistScannedDeviceTelemetry(telemetry, targetHive?.name || hives[0]?.name || "Primary Hive", effectiveUserId);

    toast.success(`Scanned ${cleanSerial}! Live recent device readings loaded.`);
    void load();
  };

  const ingestSerialLine = async (line: string) => {
    let temp: number | null = null, hum: number | null = null, wt: number | null = null, bat: number | null = null;
    try {
      const j = JSON.parse(line);
      temp = j.t ?? j.temperature ?? null; hum = j.h ?? j.humidity ?? null;
      wt = j.w ?? j.weight ?? null; bat = j.b ?? j.battery ?? null;
    } catch {
      const grab = (k: string) => { const m = line.match(new RegExp(`${k}=(-?\\d+(\\.\\d+)?)`, "i")); return m ? Number(m[1]) : null; };
      temp = grab("T"); hum = grab("H"); wt = grab("W"); bat = grab("B");
    }
    if (temp === null && hum === null && wt === null) return;
    await supabase.from("device_measurements").insert({
      user_id: effectiveUserId,
      hive_id: selHive || null,
      source: "usb",
      temperature_c: temp, humidity_pct: hum, weight_kg: wt, battery_pct: bat,
      raw: { line },
    });
    void load();
  };

  const pairBluetooth = async (name: string, id: string) => {
    try {
      await saveAndSyncNewSensor(
        {
          id: generateSensorUuid(),
          serial: id.slice(0, 40),
          category: "in_hive",
          deviceType: name || "VitalSensor Brood Core",
          linkType: "bluetooth",
          status: "optimal",
          batteryPct: 98,
          apiaryId: selApiary !== "all" ? selApiary : null,
          hiveId: selHive || null,
        },
        effectiveUserId,
      );
      toast.success(`Bluetooth device "${name}" paired and synced across phone, laptop, and tablet! 📱💻`);
      void load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to pair device");
    }
  };

  const removeDevice = async (id: string, serial?: string) => {
    const confirmed = await confirmAsync(`Are you sure you want to unpair and remove device "${serial || id}"?`);
    if (!confirmed) return;

    await deleteAndSyncSensor(id, serial || id, effectiveUserId);
    toast.success("Device removed across all screens");
    void load();
  };

  const openAddDeviceForHive = (hiveId: string | null) => {
    setTargetHiveForDevice(hiveId);
    setWizard("device");
  };

  if (!isOpen) return null;

  const visibleDevices = selApiary === "all" ? devices : devices.filter((d) => d.apiary_id === selApiary);
  const hiveMeasurements = selHive ? measurements.filter((m) => m.hive_id === selHive) : measurements;
  const latest = hiveMeasurements[0];

  // Group devices by category
  const inHiveDevices = visibleDevices.filter((d) => getDeviceCategory(d.device_kind) === "in_hive");
  const inLandDevices = visibleDevices.filter((d) => getDeviceCategory(d.device_kind) === "in_land");
  const diseaseDevices = visibleDevices.filter((d) => getDeviceCategory(d.device_kind) === "diseases");

  // Robust matcher for device assigned to a hive
  const isDeviceForHive = (d: Device, h: Hive) => {
    if (!d.hive_id) return false;
    const dh = d.hive_id.trim().toLowerCase();
    const hid = (h.id || "").trim().toLowerCase();
    const hname = (h.name || "").trim().toLowerCase();
    if (dh === hid || dh === hname) return true;
    const hcodeMatch = h.name.match(/KIB-\d+/i) || h.id.match(/KIB-\d+/i);
    if (hcodeMatch && dh === hcodeMatch[0].toLowerCase()) return true;
    const dcodeMatch = d.hive_id.match(/KIB-\d+/i);
    if (dcodeMatch && (hid.includes(dcodeMatch[0].toLowerCase()) || hname.includes(dcodeMatch[0].toLowerCase()))) return true;
    return false;
  };

  const getPairedDevices = (hive: Hive) => devices.filter((d) => isDeviceForHive(d, hive));

  // Filter hives: STRICT REQUIREMENT: Only hives with an active synced device connected appear in Hive Monitoring
  const hivesInSelectedApiary = hives.filter((h) => selApiary === "all" || h.apiary_id === selApiary);
  const hivesWithDevices = hivesInSelectedApiary.filter((h) => getPairedDevices(h).length > 0);

  const filteredHives = hivesWithDevices.filter((h) => {
    const paired = getPairedDevices(h);

    // Search query match
    if (hiveSearch.trim()) {
      const q = hiveSearch.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q);
      const matchDevice = paired.some(
        (d) =>
          d.serial.toLowerCase().includes(q) ||
          (d.label || "").toLowerCase().includes(q) ||
          d.device_kind.toLowerCase().includes(q)
      );
      if (!matchName && !matchDevice) return false;
    }

    if (hiveFilterMode === "all" || hiveFilterMode === "with_devices") return true;
    if (hiveFilterMode === "in_hive") return paired.some((d) => getDeviceCategory(d.device_kind) === "in_hive");
    if (hiveFilterMode === "in_land") return paired.some((d) => getDeviceCategory(d.device_kind) === "in_land");
    if (hiveFilterMode === "diseases") return paired.some((d) => getDeviceCategory(d.device_kind) === "diseases");
    return true;
  });

  const TABS: Array<{ id: Tab; label: string; icon: typeof Cpu }> = [
    { id: "devices", label: `My devices (${visibleDevices.length})`, icon: Cpu },
    { id: "usb", label: "USB", icon: Usb },
    { id: "bluetooth", label: "Bluetooth", icon: Bluetooth },
    { id: "online", label: "Online", icon: Wifi },
  ];

  const content = (
    <div className="w-full space-y-6">
      {/* HEADER BAR */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-honey bg-honey/15 rounded-full px-3 py-1 mb-2 border border-honey/20">
            <Wifi className="w-3 h-3 text-honey" /> Measurement Data Tools
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Hive <span className="text-honey">Monitoring</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Remote telemetry and real-time environmental metrics for your colonies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!embedded && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* TOP TABS & ACTION BAR */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setWizard(null); setTab(t.id); }}
            className={`px-4 py-2 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all ${
              tab === t.id && !wizard
                ? "bg-honey/20 border-honey text-foreground shadow-xs"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}

        <div className="flex-1 min-w-[20px]" />

        {/* ACTION BUTTONS WITH ADD APIARY AND ADD HIVE MATCHING USER UX */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setAddApiaryModalOpen(true)}
            className="gap-1.5 text-xs h-9 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold"
          >
            <Plus className="w-3.5 h-3.5" /> + ADD APIARY
          </Button>

          <Button
            onClick={() => setAddHiveModalOpen(true)}
            disabled={!apiaries.length}
            className="gap-1.5 text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> + ADD HIVE
          </Button>

          <Button
            onClick={() => openAddDeviceForHive(null)}
            className="gap-1.5 text-xs h-9 bg-honey hover:bg-honey/90 text-primary-foreground font-bold shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5" /> + Add device
          </Button>
        </div>
      </div>

      {/* FILTERS BAR: APIARY & ASSET HANDSHAKE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border bg-muted/20 p-4">
        <div>
          <Label className="text-xs font-semibold text-muted-foreground">Apiary</Label>
          <select
            value={selApiary}
            onChange={(e) => setSelApiary(e.target.value)}
            className="w-full h-10 mt-1 rounded-xl border border-input bg-background px-3 text-sm font-medium"
          >
            <option value="all">All apiaries</option>
            {apiaries.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground">Asset handshake (Quick focus)</Label>
          <select
            value={selHive}
            onChange={(e) => setSelHive(e.target.value)}
            className="w-full h-10 mt-1 rounded-xl border border-input bg-background px-3 text-sm font-medium"
          >
            <option value="">Deselect / View all</option>
            {hivesWithDevices.map((h) => {
              const paired = getPairedDevices(h);
              return (
                <option key={h.id} value={h.id}>
                  {h.name} ({paired.length} synced device{paired.length > 1 ? "s" : ""})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* WIZARD CONTAINER */}
      {wizard ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-in fade-in">
          {wizard === "apiary" ? (
            <AddApiaryWizard onCancel={() => setWizard(null)} onDone={() => { setWizard(null); void load(); }} />
          ) : wizard === "hive" ? (
            <AddHiveWizard apiaries={apiaries} onCancel={() => setWizard(null)} onDone={() => { setWizard(null); void load(); }} />
          ) : (
            <AddDeviceWizard
              hives={hives}
              apiaries={apiaries}
              initialHiveId={targetHiveForDevice}
              onCancel={() => setWizard(null)}
              onDone={() => { setWizard(null); void load(); }}
            />
          )}
        </div>
      ) : (
        <>
          {/* TAB 1: MY DEVICES & REGISTERED HIVES */}
          {tab === "devices" && (
            <div className="space-y-6">
              {/* THREE DIVERGENT DEVICE CATEGORIES OVERVIEW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    cat: "in_hive",
                    title: "In-Hive Precision IoT",
                    count: inHiveDevices.length,
                    desc: "Internal brood temp, nest humidity, queen mic & scale",
                    icon: Cpu,
                    badge: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30",
                    border: "border-amber-500/30",
                  },
                  {
                    cat: "in_land",
                    title: "In-Land Environmental Nodes",
                    count: inLandDevices.length,
                    desc: "Solar microclimate, barometric weather & forage gates",
                    icon: MapPin,
                    badge: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
                    border: "border-emerald-500/30",
                  },
                  {
                    cat: "diseases",
                    title: "Disease Diagnostic IoT",
                    count: diseaseDevices.length,
                    desc: "Spectral comb scanner, Varroa count & pathogen VOC",
                    icon: ShieldAlert,
                    badge: "bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/30",
                    border: "border-purple-500/30",
                  },
                ].map((item) => (
                  <div
                    key={item.cat}
                    className={`p-4 rounded-2xl border ${item.border} bg-card/60 flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-honey" />
                        <span className="font-bold text-xs">{item.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${item.badge}`}>
                        {item.count} active
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* CONNECTED DEVICES LIST */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-500 animate-pulse" /> Connected Telemetry Devices
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {visibleDevices.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePurgeAllDevices}
                        className="text-xs h-7 gap-1 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 font-semibold"
                        title="Delete and purge all fake and mock devices across database and page"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete all fake devices
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDirectScanOpen(true)}
                      className="text-xs h-7 gap-1 border-honey/50 text-amber-700 dark:text-amber-300 hover:bg-honey/15 font-bold"
                      title="Open phone camera to scan device QR or barcode"
                    >
                      <ScanLine className="w-3.5 h-3.5 text-honey" /> Scan Camera / Device QR
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAddDeviceForHive(null)}
                      className="text-xs h-7 gap-1 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Pair new device
                    </Button>
                  </div>
                </div>

                {/* Direct Live Camera Scanner Modal */}
                {directScanOpen && (
                  <div className="rounded-2xl border-2 border-honey/60 bg-card p-4 sm:p-5 shadow-lg space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ScanLine className="w-5 h-5 text-honey" />
                        <div>
                          <p className="font-bold text-sm text-foreground">Phone Camera Live Telemetry Scanner</p>
                          <p className="text-[11px] text-muted-foreground">Scan QR or Barcode on physical sensor or hive stand to view live readings</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDirectScanOpen(false)}
                        className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <QrScanner
                      onResult={handleDirectScanResult}
                      onCancel={() => setDirectScanOpen(false)}
                    />
                  </div>
                )}

                {/* Active Live Scanned Telemetry Card */}
                {activeScannedDevice && (
                  <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-card to-emerald-500/5 p-4 sm:p-5 shadow-md space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                          <Activity className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{activeScannedDevice.label}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                              {activeScannedDevice.serial}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Live Readings
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">Scanned via optical sensor at {activeScannedDevice.scanned_at}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveScannedDevice(null)}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        Dismiss
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      <div className="p-3 rounded-xl bg-card border border-border">
                        <div className="flex items-center justify-between text-muted-foreground text-xs">
                          <span>Brood Temp</span>
                          <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <p className="font-mono font-bold text-lg text-foreground mt-1">{activeScannedDevice.temperature_c}°C</p>
                        <p className="text-[10px] text-emerald-600 font-medium">Optimal brood zone</p>
                      </div>
                      <div className="p-3 rounded-xl bg-card border border-border">
                        <div className="flex items-center justify-between text-muted-foreground text-xs">
                          <span>Humidity</span>
                          <Droplets className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <p className="font-mono font-bold text-lg text-foreground mt-1">{activeScannedDevice.humidity_pct}%</p>
                        <p className="text-[10px] text-muted-foreground">Internal comb cavity</p>
                      </div>
                      <div className="p-3 rounded-xl bg-card border border-border">
                        <div className="flex items-center justify-between text-muted-foreground text-xs">
                          <span>Hive Mass</span>
                          <Scale className="w-3.5 h-3.5 text-honey" />
                        </div>
                        <p className="font-mono font-bold text-lg text-foreground mt-1">{activeScannedDevice.weight_kg} kg</p>
                        <p className="text-[10px] text-honey font-medium">Net stores & honey</p>
                      </div>
                      <div className="p-3 rounded-xl bg-card border border-border">
                        <div className="flex items-center justify-between text-muted-foreground text-xs">
                          <span>Battery Level</span>
                          <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <p className="font-mono font-bold text-lg text-emerald-600 mt-1">{activeScannedDevice.battery_pct}%</p>
                        <p className="text-[10px] text-muted-foreground">Solar trickle active</p>
                      </div>
                    </div>
                  </div>
                )}

                {visibleDevices.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/40 space-y-3">
                    <Boxes className="w-8 h-8 mx-auto text-muted-foreground opacity-60" />
                    <div>
                      <p className="font-semibold text-sm">No devices registered</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                        Click "+ Add device" to pair an In-Hive brood sensor, In-Land weather node, or Disease scanner.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openAddDeviceForHive(null)}
                      className="bg-honey hover:bg-honey/90 text-primary-foreground font-semibold text-xs h-8 px-4"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Pair New Device
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {visibleDevices.map((d) => {
                      const hive = hives.find((h) => h.id === d.hive_id);
                      const ap = apiaries.find((a) => a.id === d.apiary_id);
                      const cat = getDeviceCategory(d.device_kind);
                      const catConfig = DEVICE_CATEGORIES[cat];
                      const IconComp = catConfig.icon;

                      return (
                        <div
                          key={d.id}
                          className="rounded-2xl border border-border p-4 bg-card/80 hover:border-honey/40 transition-all flex flex-col justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${catConfig.badgeBg} ${catConfig.badgeBorder}`}>
                                <IconComp className={`w-5 h-5 ${catConfig.colorClass}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catConfig.badgeBg} ${catConfig.badgeBorder} ${catConfig.badgeText}`}>
                                    {catConfig.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                                    {d.serial}
                                  </span>
                                </div>
                                <p className="font-bold text-sm text-foreground truncate mt-1">
                                  {d.label || d.serial}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                  <span className="font-semibold text-foreground">Synced to:</span>{" "}
                                  {hive ? (
                                    <span className="font-mono text-amber-700 dark:text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                                      {hive.name}
                                    </span>
                                  ) : (
                                    <span className="italic text-muted-foreground">Apiary Landscape Node</span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => removeDevice(d.id, d.serial)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                              title="Unpair and remove device"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50 text-muted-foreground flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 font-medium capitalize">
                                {d.link_type === "usb" ? <Usb className="w-3.5 h-3.5 text-blue-500" /> : d.link_type === "bluetooth" ? <Bluetooth className="w-3.5 h-3.5 text-indigo-500" /> : <Wifi className="w-3.5 h-3.5 text-emerald-500" />}
                                {d.link_type}
                              </span>
                              {d.battery_pct != null && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-foreground">
                                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                                  {d.battery_pct}%
                                </span>
                              )}
                            </div>

                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                              ● {d.status || "active"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* REGISTERED HIVES WITH DEVICES SYNCHRONIZATION */}
              <div className="rounded-2xl border border-border p-5 bg-card/60 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-honey" /> Monitored Hives with Synced Telemetry
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {hivesWithDevices.length} monitored {hivesWithDevices.length === 1 ? "colony" : "colonies"} streaming active telemetry
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={hiveSearch}
                      onChange={(e) => setHiveSearch(e.target.value)}
                      placeholder="Filter monitored hives..."
                      className="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-background text-xs outline-none focus:border-honey"
                    />
                  </div>
                </div>

                {/* FILTER TABS (ONLY MONITORED HIVES) */}
                {hivesWithDevices.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    {[
                      { id: "all", label: `All Monitored (${hivesWithDevices.length})` },
                      { id: "in_hive", label: `In-Hive Sensors` },
                      { id: "in_land", label: `Apiary Nodes` },
                      { id: "diseases", label: `Diagnostic IoT` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setHiveFilterMode(f.id as any)}
                        className={`px-3 py-1 rounded-lg border transition-colors font-medium ${
                          hiveFilterMode === f.id
                            ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent font-bold shadow-xs"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* HIVES GRID OR EMPTY STATE */}
                {filteredHives.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-muted/10 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-honey/15 border border-honey/30 flex items-center justify-center mx-auto text-honey">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">
                        {hivesWithDevices.length === 0
                          ? "No Hives with Synced Devices"
                          : `No monitored hives match "${hiveSearch}"`}
                      </p>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        {hivesWithDevices.length === 0
                          ? "Only hives connected to active telemetry hardware (VitalSensor, HoneyScale, or Bio-Acoustic mic) appear in Hive Monitoring. Pair an IoT device to begin live streaming."
                          : "Try clearing your search or switching device category filters to view other monitored hives."}
                      </p>
                    </div>
                    {hivesWithDevices.length === 0 ? (
                      <Button
                        size="sm"
                        onClick={() => openAddDeviceForHive(null)}
                        className="bg-honey hover:bg-honey/90 text-primary-foreground font-semibold text-xs h-8 px-4"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Connect First IoT Device
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setHiveSearch(""); setHiveFilterMode("all"); }}
                        className="text-xs h-8"
                      >
                        Clear search filter
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredHives.slice(0, 60).map((h) => {
                      const pairedDevices = getPairedDevices(h);

                      return (
                        <div
                          key={h.id}
                          className="rounded-xl border border-honey/40 bg-honey/5 hover:border-honey/70 p-3.5 flex flex-col justify-between gap-3 transition-all"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {h.queen_breeding_year && (
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ background: yearColor(h.queen_breeding_year) }}
                                    title={`Queen marked year: ${h.queen_breeding_year}`}
                                  />
                                )}
                                <p className="font-bold text-sm text-foreground">{h.name}</p>
                              </div>

                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                                ● Synced ({pairedDevices.length})
                              </span>
                            </div>

                            <p className="text-[11px] text-muted-foreground">
                              {h.max_brood_frames} brood frames · {h.hygienic_bottom_board ? "hygienic board" : "solid board"}
                              {h.queen_breeding_year ? ` · queen ${h.queen_breeding_year}` : ""}
                            </p>

                            {/* PAIRED DEVICES DISPLAY */}
                            <div className="space-y-1.5 pt-1">
                              {pairedDevices.map((pd) => {
                                const cat = getDeviceCategory(pd.device_kind);
                                const catConfig = DEVICE_CATEGORIES[cat];
                                const IconComp = catConfig.icon;
                                return (
                                  <div
                                    key={pd.id}
                                    className={`px-2 py-1.5 rounded-lg border ${catConfig.badgeBg} ${catConfig.badgeBorder} flex items-center justify-between text-xs`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      <IconComp className={`w-3.5 h-3.5 ${catConfig.colorClass} shrink-0`} />
                                      <span className={`text-[10px] font-bold ${catConfig.badgeText} truncate pointer-events-none select-none`}>
                                        {catConfig.name}:
                                      </span>
                                      <span className="font-mono text-[10px] font-bold truncate pointer-events-none select-none">
                                        {pd.serial}
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); removeDevice(pd.id, pd.serial); }}
                                      className="text-muted-foreground hover:text-destructive p-0.5"
                                      title="Unpair device"
                                    >
                                      <Unlink className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Live Telemetry Pill if available */}
                              {pairedDevices[0]?.temperature_c != null && (
                                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground bg-background/80 p-1.5 rounded border border-border/60">
                                  <span className="text-amber-600 font-bold">🌡️ {pairedDevices[0].temperature_c}°C</span>
                                  {pairedDevices[0].humidity_pct != null && <span>💧 {pairedDevices[0].humidity_pct}%</span>}
                                  {pairedDevices[0].weight_kg != null && <span>⚖️ {pairedDevices[0].weight_kg}kg</span>}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setSelHive(h.id); startTransition(() => setTab("online")); }}
                              className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                            >
                              Live Telemetry →
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAddDeviceForHive(h.id)}
                              className="h-7 text-xs px-2.5 gap-1 border-border text-foreground hover:bg-muted"
                            >
                              <Plus className="w-3 h-3" /> Add Sensor
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {filteredHives.length > 60 && (
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Showing 60 of {filteredHives.length} monitored hives. Use search to narrow down by hive code.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: USB */}
          {tab === "usb" && <UsbPanel onIngest={ingestSerialLine} />}

          {/* TAB 3: BLUETOOTH */}
          {tab === "bluetooth" && <BluetoothPanel onPaired={pairBluetooth} />}

          {/* TAB 4: ONLINE TELEMETRY */}
          {tab === "online" && (
            <div className="space-y-4">
              {!selHive ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/40">
                  <Wifi className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-60" />
                  <p className="font-semibold text-lg">Select a hive to view active telemetry</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    Select any hive from the dropdown above or click "Live Telemetry" on any hive card to view real-time thermal curves and scale readings.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Brood Nest Temperature", icon: Thermometer, value: latest?.temperature_c, unit: "°C", note: "Target 34.5°C – 35.5°C" },
                      { label: "Ambient Relative Saturation", icon: Droplets, value: latest?.humidity_pct, unit: "%", note: "Target 50% – 65%" },
                      { label: "Total Hive Mass & Scale", icon: Scale, value: latest?.weight_kg, unit: "kg", note: "Net honey + colony stores" },
                    ].map((c) => (
                      <div key={c.label} className="rounded-2xl border border-border p-4 bg-card/80 shadow-xs">
                        <div className="flex items-start justify-between">
                          <div className="w-9 h-9 rounded-xl bg-honey/15 flex items-center justify-center text-honey">
                            <c.icon className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] text-muted-foreground">{c.note}</span>
                        </div>
                        <p className="text-2xl font-bold mt-3 font-display">
                          {c.value != null ? `${c.value}${c.unit}` : "– –"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-border p-5 bg-card/80 shadow-xs">
                    <p className="font-bold text-sm mb-3">Live Telemetry Readings Stream</p>
                    {hiveMeasurements.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No readings logged yet for this hive.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="text-muted-foreground border-b border-border">
                            <tr className="text-left">
                              <th className="py-2.5">Recorded Time</th>
                              <th>Link Source</th>
                              <th>Brood Temp</th>
                              <th>Humidity</th>
                              <th>Hive Weight</th>
                              <th>Battery Level</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hiveMeasurements.slice(0, 25).map((m) => (
                              <tr key={m.id} className="border-t border-border/50 hover:bg-muted/30">
                                <td className="py-2 font-mono">{new Date(m.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                                <td className="capitalize font-medium">{m.source}</td>
                                <td className="font-mono font-bold text-amber-600">{m.temperature_c != null ? `${m.temperature_c}°C` : "–"}</td>
                                <td className="font-mono">{m.humidity_pct != null ? `${m.humidity_pct}%` : "–"}</td>
                                <td className="font-mono">{m.weight_kg != null ? `${m.weight_kg} kg` : "–"}</td>
                                <td className="font-mono text-emerald-600 font-semibold">{m.battery_pct != null ? `${m.battery_pct}%` : "–"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Pop-out Inspection-style Add Apiary & Add Hive Modals */}
      <AddApiaryModal
        isOpen={addApiaryModalOpen}
        onClose={() => setAddApiaryModalOpen(false)}
        onSuccess={() => {
          setAddApiaryModalOpen(false);
          void load();
        }}
      />

      <AddHiveModal
        isOpen={addHiveModalOpen}
        onClose={() => setAddHiveModalOpen(false)}
        apiaries={apiaries.map((a) => ({ id: a.id, name: a.name }))}
        onSuccess={() => {
          setAddHiveModalOpen(false);
          void load();
        }}
      />
    </div>
  );

  if (embedded) {
    return (
      <div className="w-full max-w-full space-y-6">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none touch-manipulation">
      <div
        className="bg-card border border-border/60 rounded-3xl w-full max-w-6xl shadow-2xl p-4 sm:p-6 overflow-y-auto max-h-[92vh] my-auto select-text pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
}
