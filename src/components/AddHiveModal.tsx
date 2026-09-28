import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  X,
  Layers,
  MapPin,
  Crown,
  Radio,
  FileText,
  ScanLine,
  QrCode,
  Camera,
  Check,
  ShieldCheck,
  Sparkles,
  Info,
  ChevronRight,
  RefreshCw,
  Cpu,
  Scale,
  Activity,
  CalendarDays,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDeviceId } from "@/hooks/use-device-id";
import { beeyieldService } from "@/services/beeyieldService";
import { CANONICAL_TIMOTHY_APIARY } from "@/lib/user-hives";
import { normalizeApiaryName, CANONICAL_APIARY_NAME } from "@/lib/apiary-normalization";

// International Queen Marking Color Codes
export function getQueenYearColor(year: number) {
  const lastDigit = Math.abs(year) % 10;
  if (lastDigit === 1 || lastDigit === 6) {
    return {
      name: "White",
      code: "White (Years ending in 1, 6)",
      dot: "bg-white border border-stone-400 shadow-sm",
      border: "border-stone-300",
      bg: "bg-stone-50 text-stone-900",
    };
  } else if (lastDigit === 2 || lastDigit === 7) {
    return {
      name: "Yellow",
      code: "Yellow (Years ending in 2, 7)",
      dot: "bg-[#FFB800] shadow-sm",
      border: "border-amber-400",
      bg: "bg-amber-500/10 text-amber-900 dark:text-amber-300",
    };
  } else if (lastDigit === 3 || lastDigit === 8) {
    return {
      name: "Red",
      code: "Red (Years ending in 3, 8)",
      dot: "bg-red-500 shadow-sm",
      border: "border-red-400",
      bg: "bg-red-500/10 text-red-900 dark:text-red-300",
    };
  } else if (lastDigit === 4 || lastDigit === 9) {
    return {
      name: "Green",
      code: "Green (Years ending in 4, 9)",
      dot: "bg-emerald-500 shadow-sm",
      border: "border-emerald-400",
      bg: "bg-emerald-500/10 text-emerald-900 dark:text-emerald-300",
    };
  } else {
    return {
      name: "Blue",
      code: "Blue (Years ending in 0, 5)",
      dot: "bg-blue-500 shadow-sm",
      border: "border-blue-400",
      bg: "bg-blue-500/10 text-blue-900 dark:text-blue-300",
    };
  }
}

export interface AddHiveSubmitData {
  id: string;
  code: string;
  name: string;
  apiaryId?: string;
  apiaryName?: string;
  hiveType: string;
  maxBroodFrames: number;
  broodFrames: number;
  honeyFrames?: number;
  colonyStrength?: string;
  colonyAvailability?: string;
  hasHygienicBottomBoard: boolean;
  queenPresent: boolean;
  queenBreedingYear: number;
  queenStatus: string;
  queenOrigin: string;
  queenInsemination: "Natural" | "Artificial" | "Unknown";
  queenNote?: string;
  has_sensors: boolean;
  sensorCategory: "none" | "vitalsensor" | "scale" | "acoustic_varroa";
  sensorSerial?: string;
  deviceType?: string;
  deviceCategory?: "in_hive" | "disease_devices" | "apiary_scale";
  batches?: any[];
}

export interface AddHiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiary?: { id: string; name: string };
  apiaries?: Array<{ id: string; name: string }>;
  suggestedCode?: string;
  onAddHive?: (newHive: any, initialBatch?: any) => void | Promise<void>;
  onSuccess?: (newHive: AddHiveSubmitData) => void;
  onOpenScanner?: () => void;
  scannedSerial?: string;
  onSwitchToApiary?: () => void;
}

export function AddHiveModal({
  isOpen,
  onClose,
  apiary,
  apiaries = [],
  suggestedCode = "",
  onAddHive,
  onSuccess,
  onOpenScanner,
  scannedSerial,
  onSwitchToApiary,
}: AddHiveModalProps) {
  const { user } = useAuth();
  const deviceId = useDeviceId();
  const userKey = user?.id || deviceId || "default";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Available Apiaries loaded from Backend
  const [loadedApiaries, setLoadedApiaries] =
    useState<Array<{ id: string; name: string }>>(apiaries);

  // Step 1: Hive Details
  const defaultNum = suggestedCode.replace(/^KIB-|^beeyield\s*/i, "");
  const [code, setCode] = useState(defaultNum || "");
  const [hiveType, setHiveType] = useState<string>("Langstroth 10-Frame");
  const [maxBroodFrames, setMaxBroodFrames] = useState<string>("10");
  const [hasHygienicBottomBoard, setHasHygienicBottomBoard] = useState(true);
  const [selectedApiaryId, setSelectedApiaryId] = useState<string>(
    apiary?.id || apiaries[0]?.id || "apiary-kibwezi",
  );

  // Step 2: Queen Bee Information
  const [queenPresent, setQueenPresent] = useState<boolean>(true);
  const [queenBreedingYear, setQueenBreedingYear] = useState<number>(new Date().getFullYear());
  const [queenOrigin, setQueenOrigin] = useState<string>("Own breeding (Selected Line)");
  const [queenInsemination, setQueenInsemination] = useState<"Natural" | "Artificial" | "Unknown">(
    "Natural",
  );
  const [queenNote, setQueenNote] = useState<string>("");

  // Step 3: Device / Sensor Setup
  const [pairingMode, setPairingMode] = useState<"without_device" | "with_device">(
    "without_device",
  );
  const [sensorCategory, setSensorCategory] = useState<"vitalsensor" | "scale" | "acoustic_varroa">(
    "vitalsensor",
  );
  const [sensorSerial, setSensorSerial] = useState(scannedSerial || "");
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerContainerId = "add-hive-qr-camera-scanner-inspections";

  // Load backend apiaries
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchApiaries = async () => {
      try {
        let list: Array<{ id: string; name: string }> = [];

        // 1. Supabase query
        if (supabase) {
          let q = (supabase as any).from("apiaries").select("id, name");
          if (user?.id) q = q.eq("user_id", user.id);
          const res = await q.order("name", { ascending: true });
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            list = res.data.map((a: any) => ({
              id: a.id,
              name: normalizeApiaryName(a.name),
            }));
          }
        }

        // 2. Local storage cache
        if (list.length === 0) {
          const cached = localStorage.getItem(`beeyield_user_apiaries_${userKey}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              list = parsed.map((a: any) => ({
                id: a.id,
                name: normalizeApiaryName(a.name),
              }));
            }
          }
        }

        // 3. Fallback to passed props or Canonical Timothy
        if (list.length === 0 && apiaries.length > 0) {
          list = apiaries;
        } else if (list.length === 0) {
          list = [{ id: CANONICAL_TIMOTHY_APIARY.id, name: CANONICAL_APIARY_NAME }];
        }

        if (isMounted) {
          setLoadedApiaries(list);
          if (apiary?.id) {
            setSelectedApiaryId(apiary.id);
          } else if (!selectedApiaryId && list.length > 0) {
            setSelectedApiaryId(list[0].id);
          }
        }
      } catch {
        if (isMounted && apiaries.length > 0) {
          setLoadedApiaries(apiaries);
        }
      }
    };

    void fetchApiaries();
    return () => {
      isMounted = false;
    };
  }, [isOpen, apiary, apiaries, userKey, user?.id]);

  // Sync scannedSerial if passed from parent
  useEffect(() => {
    if (scannedSerial) {
      setSensorSerial(scannedSerial);
      setPairingMode("with_device");
    }
  }, [scannedSerial]);

  // Reset or initialize state when opening
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setShowScanner(false);
      if (suggestedCode) {
        const clean = suggestedCode.replace(/^KIB-|^beeyield\s*/i, "");
        setCode(clean);
      }
      if (apiary?.id) {
        setSelectedApiaryId(apiary.id);
      }
      if (scannedSerial) {
        setSensorSerial(scannedSerial);
        setPairingMode("with_device");
      }
    }
  }, [isOpen, suggestedCode, apiary, scannedSerial]);

  // Escape key close handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showScanner) {
          setShowScanner(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showScanner, onClose]);

  // QR Camera Scanner initialization
  useEffect(() => {
    if (!showScanner) return;
    let html5QrCode: Html5Qrcode | null = null;
    let isMounted = true;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(scannerContainerId);
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            if (isMounted) {
              void html5QrCode?.stop().catch(() => undefined);
              toast.success(`Scanned hardware code: ${decodedText.trim()}`);
              setSensorSerial(decodedText.trim());
              setShowScanner(false);
            }
          },
          () => undefined,
        );
      } catch (err: any) {
        if (isMounted) {
          setScannerError(err?.message || "Failed to access device camera.");
          toast.error("Camera access error. You can still type the serial code manually.");
        }
      }
    };

    const timer = setTimeout(() => {
      void startScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCode) {
        try {
          html5QrCode.stop().catch(() => undefined);
        } catch {
          // ignore
        }
      }
    };
  }, [showScanner]);

  if (!isOpen) return null;

  const currentYearColor = getQueenYearColor(queenBreedingYear);

  const formattedHiveCode = code.trim().toUpperCase().startsWith("KIB-")
    ? code.trim().toUpperCase()
    : !isNaN(Number(code.trim()))
      ? `KIB-${code.trim().padStart(3, "0")}`
      : `KIB-${code.trim().toUpperCase()}`;

  const selectedApiaryObj = loadedApiaries.find((a) => a.id === selectedApiaryId);
  const targetApiaryName = selectedApiaryObj?.name || apiary?.name || CANONICAL_APIARY_NAME;

  // Submit Handler: Saves to Backend API, Supabase, LocalStorage, and Dispatches Event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter a hive number/code (e.g. 185)");
      return;
    }

    setIsSaving(true);
    const parsedMaxBrood =
      maxBroodFrames !== "" && !isNaN(Number(maxBroodFrames)) ? Number(maxBroodFrames) : 10;
    const hasDevice = pairingMode === "with_device" && !!sensorSerial.trim();
    const hiveId = `hive-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newHiveItem: AddHiveSubmitData = {
      id: hiveId,
      code: formattedHiveCode,
      name: formattedHiveCode,
      apiaryId: selectedApiaryId,
      apiaryName: targetApiaryName,
      hiveType,
      maxBroodFrames: parsedMaxBrood,
      broodFrames: parsedMaxBrood,
      honeyFrames: 4,
      colonyStrength: "Strong (8–10 Frames Brood & Bees)",
      colonyAvailability: "Dedicated Honey Production",
      hasHygienicBottomBoard,
      queenPresent,
      queenBreedingYear,
      queenStatus: queenPresent
        ? `Active Laying Queen (${currentYearColor.name})`
        : "Standby Box (No Queen)",
      queenOrigin,
      queenInsemination,
      queenNote: queenNote.trim() || undefined,
      has_sensors: hasDevice,
      sensorCategory: hasDevice ? sensorCategory : "none",
      sensorSerial: hasDevice ? sensorSerial.trim() : undefined,
      deviceType: hasDevice
        ? sensorCategory === "scale"
          ? "HoneyScale Load Cell"
          : sensorCategory === "acoustic_varroa"
            ? "Apisense Varroa Detector"
            : "VitalSensor Pro"
        : undefined,
      batches: [],
      deviceCategory: hasDevice
        ? sensorCategory === "scale"
          ? "apiary_scale"
          : sensorCategory === "acoustic_varroa"
            ? "disease_devices"
            : "in_hive"
        : undefined,
    };

    // 1. Backend REST API Call via beeyieldService / fetch
    try {
      await fetch("/api/v1/hives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: hiveId,
          user_id: user?.id || null,
          device_id: deviceId,
          apiary_id: selectedApiaryId,
          hive_code: formattedHiveCode,
          name: formattedHiveCode,
          hive_type: hiveType,
          frame_count: parsedMaxBrood,
          brood_frames: parsedMaxBrood,
          max_brood_frames: parsedMaxBrood,
          has_sensors: hasDevice,
          sensor_serial: hasDevice ? sensorSerial.trim() : null,
          hygienic_bottom_board: hasHygienicBottomBoard,
          queen_breeding_year: queenBreedingYear,
          queen_origin: queenOrigin,
          queen_insemination: queenInsemination,
          notes: queenNote.trim() || null,
          status: queenPresent ? "Active" : "Standby",
        }),
      }).catch(() => undefined);
    } catch {
      // Non-blocking
    }

    // 2. Supabase Integration
    try {
      if (user && supabase) {
        await (supabase as any).from("hives").insert({
          id: hiveId,
          user_id: user.id,
          apiary_id: selectedApiaryId,
          name: formattedHiveCode,
          max_brood_frames: parsedMaxBrood,
          hygienic_bottom_board: hasHygienicBottomBoard,
          queen_breeding_year: queenBreedingYear,
          queen_origin: queenOrigin,
          queen_insemination: queenInsemination,
          notes: queenNote.trim() || null,
        });

        // If sensor paired, save to devices table
        if (hasDevice) {
          await (supabase as any)
            .from("devices")
            .insert({
              user_id: user.id,
              hive_id: hiveId,
              apiary_id: selectedApiaryId,
              device_kind: sensorCategory,
              serial: sensorSerial.trim(),
              label: `${newHiveItem.deviceType} (${formattedHiveCode})`,
              status: "online",
            })
            .catch(() => undefined);
        }
      }
    } catch (e) {
      console.warn("Supabase hive insert fallback:", e);
    }

    // 3. User-Scoped LocalStorage Persistence
    try {
      const cacheKey = `beeyield_cached_hives_${userKey}`;
      const existing = localStorage.getItem(cacheKey);
      const list = existing ? JSON.parse(existing) : [];
      const updated = [
        newHiveItem,
        ...list.filter((h: any) => h.id !== hiveId && h.code !== formattedHiveCode),
      ];
      localStorage.setItem(cacheKey, JSON.stringify(updated));

      const legacyKey = user?.id ? `beeyield_local_hives_v1_${user.id}` : `beeyield_local_hives_v1`;
      localStorage.setItem(legacyKey, JSON.stringify(updated));

      // Apiary-scoped caches
      if (selectedApiaryId) {
        const apKeys = [
          `beeyield_hives_${userKey}_${selectedApiaryId}`,
          `beeyield_hives_${selectedApiaryId}`,
        ];
        apKeys.forEach((k) => {
          try {
            const raw = localStorage.getItem(k);
            const cur = raw ? JSON.parse(raw) : [];
            const up = [
              newHiveItem,
              ...cur.filter((h: any) => h.id !== hiveId && h.code !== formattedHiveCode),
            ];
            localStorage.setItem(k, JSON.stringify(up));
          } catch {}
        });
      }
    } catch {
      // Non-blocking
    }

    // 4. Real-time Cross-Page Event Dispatching
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("beeyield_hive_created", {
          detail: { newHive: newHiveItem },
        }),
      );
      window.dispatchEvent(
        new CustomEvent("beeyield_data_updated", {
          detail: { type: "hive", hive: newHiveItem },
        }),
      );
    }

    // 5. Parent Callbacks
    if (onAddHive) {
      await onAddHive(newHiveItem);
    }
    if (onSuccess) {
      onSuccess(newHiveItem);
    }

    setIsSaving(false);
    toast.success(`Hive ${formattedHiveCode} registered successfully to ${targetApiaryName}`);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={() => onClose()}
    >
      <div
        className="w-full max-w-2xl bg-card text-foreground rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-border relative my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar matching InspectionsPage aesthetic */}
        <div className="bg-emerald-600 px-5 py-4 flex items-center justify-between text-white shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Layers className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-base sm:text-lg font-bold text-white tracking-wide">
                  Add Hive Colony
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                  Step {step} of 3
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <span>Colony registration, queen genetics & sensor telemetry</span>
                <span className="font-mono text-emerald-200">· {targetApiaryName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Switcher Tab Header if onSwitchToApiary provided */}
            {onSwitchToApiary && (
              <div className="flex items-center gap-1 bg-emerald-700/70 p-1 rounded-xl border border-emerald-400/40 text-xs shadow-inner shrink-0">
                <button
                  type="button"
                  onClick={onSwitchToApiary}
                  className="px-2 sm:px-2.5 py-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-600/70 transition-colors font-semibold text-[10px] sm:text-[11px] cursor-pointer select-none touch-manipulation"
                >
                  📍 Add Apiary
                </button>
                <button
                  type="button"
                  className="px-2 sm:px-2.5 py-1 rounded-lg bg-white text-emerald-950 font-bold text-[10px] sm:text-[11px] shadow-xs cursor-default select-none touch-manipulation"
                >
                  🐝 Add Hive
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-colors"
              aria-label="Close form"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar (matching InspectionsPage tabs / filters) */}
        <div className="bg-muted/40 border-b border-border px-5 py-2.5 flex items-center justify-between gap-2 overflow-x-auto text-xs shrink-0">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition-all ${
              step === 1
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Architecture & Apiary</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

          <button
            type="button"
            onClick={() => {
              if (!code.trim()) {
                toast.error("Please enter a hive number first");
                return;
              }
              setStep(2);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition-all ${
              step === 2
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Queen Genetics</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

          <button
            type="button"
            onClick={() => {
              if (!code.trim()) {
                toast.error("Please enter a hive number first");
                return;
              }
              setStep(3);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition-all ${
              step === 3
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Sensor Telemetry</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
        >
          {/* STEP 1: Hive Architecture & Target Apiary */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Card 1: Target Apiary Selection */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Target Apiary Site
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Selected:{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {targetApiaryName}
                    </strong>
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-500" /> Apiary Deployment Station{" "}
                    <span className="text-amber-500">*</span>
                  </label>
                  <select
                    value={selectedApiaryId}
                    onChange={(e) => setSelectedApiaryId(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 font-semibold text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {loadedApiaries.map((ap) => (
                      <option key={ap.id} value={ap.id}>
                        {ap.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Card 2: Hive Identification & Architecture */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-honey" /> Hive Code & Frame Architecture
                  </span>
                  <span className="text-[11px] font-mono font-bold text-honey">
                    {formattedHiveCode || "KIB-..."}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <Layers className="w-3 h-3 text-honey" /> Hive Stand Code / Number{" "}
                      <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. 185 or KIB-185"
                      autoFocus
                      required
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Standardized to KIB- prefix format across audits
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> Hive Construction
                      Standard
                    </label>
                    <select
                      value={hiveType}
                      onChange={(e) => setHiveType(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="Langstroth 10-Frame">Langstroth 10-Frame Standard</option>
                      <option value="Langstroth 8-Frame">Langstroth 8-Frame Medium</option>
                      <option value="Commercial Deep 12-Frame">Commercial Deep 12-Frame</option>
                      <option value="Kenya Top Bar Hive (KTBH)">Kenya Top Bar Hive (KTBH)</option>
                      <option value="Warré Ecological Box">Warré Ecological Box</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <Layers className="w-3 h-3 text-blue-500" /> Max Brood Chamber Frames{" "}
                      <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={maxBroodFrames}
                      onChange={(e) => setMaxBroodFrames(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Card 3: Hygienic Bottom Board Toggle */}
                  <div
                    onClick={() => setHasHygienicBottomBoard(!hasHygienicBottomBoard)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      hasHygienicBottomBoard
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
                        : "border-border bg-card text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold flex items-center gap-1.5">
                        <ShieldCheck
                          className={`w-3.5 h-3.5 ${hasHygienicBottomBoard ? "text-emerald-500" : "text-muted-foreground"}`}
                        />
                        Hygienic Bottom Board
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Mesh screened floor for natural Varroa debris drop
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        hasHygienicBottomBoard
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-muted-foreground/40 bg-background"
                      }`}
                    >
                      {hasHygienicBottomBoard && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Queen Bee Genetics & Marking Year */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Queen Presence Toggle */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500" /> Queen Bee Colony Status
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      queenPresent
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/15 text-red-500"
                    }`}
                  >
                    {queenPresent ? "Queen Present" : "Queenless / Standby"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setQueenPresent(true)}
                    className={`p-3 rounded-xl border text-left font-medium text-xs transition-all flex items-center gap-2.5 ${
                      queenPresent
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500/30 font-bold"
                        : "border-border bg-card text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="font-bold text-xs">Active Laying Queen</p>
                      <p className="text-[10px] text-muted-foreground">Brood producing colony</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQueenPresent(false)}
                    className={`p-3 rounded-xl border text-left font-medium text-xs transition-all flex items-center gap-2.5 ${
                      !queenPresent
                        ? "border-red-500 bg-red-500/10 text-red-950 dark:text-red-200 ring-1 ring-red-500/30 font-bold"
                        : "border-border bg-card text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <Info className="w-4 h-4 text-red-500 shrink-0" />
                    <div>
                      <p className="font-bold text-xs">No Queen (Standby)</p>
                      <p className="text-[10px] text-muted-foreground">
                        Empty stand awaiting swarm
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* International Queen Marking Color Codes */}
              {queenPresent && (
                <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-honey" /> International Queen
                      Marking Year & Color
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <span className={`w-3 h-3 rounded-full ${currentYearColor.dot}`} />
                      <span>
                        {currentYearColor.name} ({queenBreedingYear})
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        <CalendarDays className="w-3 h-3 text-honey" /> Queen Breeding Year
                      </label>
                      <select
                        value={queenBreedingYear}
                        onChange={(e) => setQueenBreedingYear(Number(e.target.value))}
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((yr) => {
                          const col = getQueenYearColor(yr);
                          return (
                            <option key={yr} value={yr}>
                              {yr} • {col.name} ({col.code})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" /> Genetic Lineage &
                        Origin
                      </label>
                      <select
                        value={queenOrigin}
                        onChange={(e) => setQueenOrigin(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="Own breeding (Selected Line)">
                          Own Breeding (Selected African Line)
                        </option>
                        <option value="Wild Swarm Trapping (Kibwezi Bush)">
                          Wild Swarm Trapping (Kibwezi Bush)
                        </option>
                        <option value="Certified Kenyan Breeder (ICIPE Stock)">
                          Certified Breeder (ICIPE Stock)
                        </option>
                        <option value="Splitting Strong Maternal Colony">
                          Splitting Strong Maternal Colony
                        </option>
                        <option value="Emergency Queen Cell Rearing">
                          Emergency Queen Cell Rearing
                        </option>
                      </select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Insemination Method
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["Natural", "Artificial", "Unknown"] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setQueenInsemination(method)}
                            className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                              queenInsemination === method
                                ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold"
                                : "border-border bg-card text-muted-foreground hover:border-border/80"
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-muted-foreground font-semibold">
                        Queen Evaluation & Biological Notes
                      </label>
                      <input
                        type="text"
                        value={queenNote}
                        onChange={(e) => setQueenNote(e.target.value)}
                        placeholder="e.g. Robust laying pattern, calm worker temperament on comb, hygienic brood cappings..."
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Sensor Telemetry & Hardware Pairing */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Card 1: Mode Selection matching Inspections / Apiaries page */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-500" /> IoT Hardware Telemetry
                    Integration
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      pairingMode === "with_device"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-stone-500/15 text-stone-500"
                    }`}
                  >
                    {pairingMode === "with_device" ? "Live Telemetry" : "Digital Journal"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPairingMode("with_device")}
                    className={`p-3.5 rounded-xl border text-left font-medium text-xs transition-all flex items-start gap-3 ${
                      pairingMode === "with_device"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/30 font-bold shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${pairingMode === "with_device" ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-foreground">With IoT Telemetry</p>
                      <p className="text-[11px] text-muted-foreground font-normal mt-0.5">
                        Link VitalSensor Pro, load cell scale, or acoustic varroa detector.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPairingMode("without_device");
                      setShowScanner(false);
                    }}
                    className={`p-3.5 rounded-xl border text-left font-medium text-xs transition-all flex items-start gap-3 ${
                      pairingMode === "without_device"
                        ? "border-border bg-muted/60 text-foreground ring-1 ring-border font-bold shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${pairingMode === "without_device" ? "bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900" : "bg-muted text-muted-foreground"}`}
                    >
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-foreground">
                        Without Hardware (Ledger Mode)
                      </p>
                      <p className="text-[11px] text-muted-foreground font-normal mt-0.5">
                        Log inspections and harvests manually without live hardware sensors.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Hardware Pairing Details */}
              {pairingMode === "with_device" && (
                <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                    <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-500" /> Sensor Category & Hardware
                      Serial Code
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      Camera QR Scanner Ready
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-foreground font-semibold flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-emerald-600" /> Sensor Hardware Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            id: "vitalsensor",
                            name: "VitalSensor Pro",
                            icon: Activity,
                            desc: "Acoustics & Temp",
                          },
                          {
                            id: "scale",
                            name: "HoneyScale Cell",
                            icon: Scale,
                            desc: "Weight & Honey Flow",
                          },
                          {
                            id: "acoustic_varroa",
                            name: "Varroa Detector",
                            icon: Radio,
                            desc: "Pest Frequency",
                          },
                        ].map((dev) => (
                          <button
                            key={dev.id}
                            type="button"
                            onClick={() => setSensorCategory(dev.id as any)}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              sensorCategory === dev.id
                                ? "border-emerald-600 bg-emerald-600 text-white font-bold shadow-sm"
                                : "border-border bg-card text-muted-foreground hover:border-emerald-500/40"
                            }`}
                          >
                            <dev.icon className="w-4 h-4 mx-auto mb-1" />
                            <p className="text-xs font-bold leading-tight">{dev.name}</p>
                            <p
                              className={`text-[9px] mt-0.5 ${sensorCategory === dev.id ? "text-emerald-100" : "text-muted-foreground"}`}
                            >
                              {dev.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-foreground font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-emerald-600" /> Hardware Serial Number /
                          Barcode <span className="text-amber-500">*</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowScanner(!showScanner)}
                          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-3 h-3" />
                          {showScanner ? "Close Scanner" : "Scan via Camera"}
                        </button>
                      </label>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={sensorSerial}
                          onChange={(e) => setSensorSerial(e.target.value)}
                          placeholder="e.g. VS-PRO-84920 or scan barcode..."
                          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowScanner(!showScanner)}
                          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shrink-0"
                          title="Open live camera QR scanner"
                        >
                          <ScanLine className="w-4 h-4" />
                          <span className="hidden sm:inline">Scan QR</span>
                        </button>
                      </div>
                    </div>

                    {/* QR Camera Scanner Viewfinder */}
                    {showScanner && (
                      <div className="p-4 rounded-xl bg-card border border-emerald-500/50 shadow-inner space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold flex items-center gap-1.5 text-foreground">
                            <Camera className="w-4 h-4 text-emerald-500 animate-pulse" /> Point
                            camera at device QR or Barcode
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowScanner(false)}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div
                          id={scannerContainerId}
                          className="w-full h-56 bg-black rounded-lg overflow-hidden flex items-center justify-center relative border border-emerald-500/40"
                        />
                        {scannerError && (
                          <p className="text-[11px] text-red-500 font-medium">{scannerError}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions Bar matching InspectionsPage form */}
          <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1.5 hover:bg-card transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              ) : (
                <span className="text-[11px] text-muted-foreground">
                  Ready to register hive stand in {targetApiaryName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-card transition-colors font-semibold"
              >
                Cancel
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!code.trim()) {
                      toast.error("Please enter a hive number/code first");
                      return;
                    }
                    setStep((step + 1) as 1 | 2 | 3);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all border border-emerald-500/40"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all border border-emerald-500/40 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to Cloud...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      Save Hive Colony
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default AddHiveModal;
