import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ChevronDown,
  Check,
  ScanLine,
  QrCode,
  X,
  Cpu,
  Scale,
  Activity,
  FileText,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

// International Queen Marking Color Codes
export function getQueenYearColor(year: number) {
  const lastDigit = Math.abs(year) % 10;
  if (lastDigit === 1 || lastDigit === 6) {
    return {
      name: "White",
      code: "White (Years ending in 1, 6)",
      dot: "bg-white border border-stone-400 shadow-sm",
    };
  } else if (lastDigit === 2 || lastDigit === 7) {
    return {
      name: "Yellow",
      code: "Yellow (Years ending in 2, 7)",
      dot: "bg-[#FFB800] shadow-sm",
    };
  } else if (lastDigit === 3 || lastDigit === 8) {
    return {
      name: "Red",
      code: "Red (Years ending in 3, 8)",
      dot: "bg-red-500 shadow-sm",
    };
  } else if (lastDigit === 4 || lastDigit === 9) {
    return {
      name: "Green",
      code: "Green (Years ending in 4, 9)",
      dot: "bg-emerald-500 shadow-sm",
    };
  } else {
    return {
      name: "Blue",
      code: "Blue (Years ending in 0, 5)",
      dot: "bg-blue-500 shadow-sm",
    };
  }
}

export interface AddHiveSubmitData {
  id: string;
  code: string;
  name: string;
  apiaryId?: string;
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
}: AddHiveModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Hive Details (Photo 3)
  const defaultNum = suggestedCode.replace(/^KIB-|^beeyield\s*/i, "");
  const [code, setCode] = useState(defaultNum || "");
  const [maxBroodFrames, setMaxBroodFrames] = useState<string>("10");
  const [hasHygienicBottomBoard, setHasHygienicBottomBoard] = useState(false);
  const [selectedApiaryId, setSelectedApiaryId] = useState<string>(
    apiary?.id || apiaries[0]?.id || "kibwezi-apiary-01"
  );

  // Step 2: Queen Bee Information (Photo 2 & Photo 1)
  const [queenBreedingYear, setQueenBreedingYear] = useState<number>(2022);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [queenOrigin, setQueenOrigin] = useState<string>("Own breeding");
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [queenInsemination, setQueenInsemination] = useState<"Natural" | "Artificial" | "Unknown">("Natural");
  const [queenNote, setQueenNote] = useState<string>("");

  // Step 3: Device / Sensor Setup
  const [pairingMode, setPairingMode] = useState<"without_device" | "with_device">("without_device");
  const [sensorCategory, setSensorCategory] = useState<"vitalsensor" | "scale" | "acoustic_varroa">("vitalsensor");
  const [sensorSerial, setSensorSerial] = useState(scannedSerial || "");
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerContainerId = "add-hive-qr-camera-scanner";

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
      setShowYearDropdown(false);
      setShowOriginDropdown(false);
      setShowScanner(false);
      if (suggestedCode) {
        const clean = suggestedCode.replace(/^KIB-|^beeyield\s*/i, "");
        setCode(clean);
      }
      if (apiary?.id) {
        setSelectedApiaryId(apiary.id);
      } else if (apiaries.length > 0) {
        setSelectedApiaryId(apiaries[0].id);
      }
      if (scannedSerial) {
        setSensorSerial(scannedSerial);
        setPairingMode("with_device");
      }
    }
  }, [isOpen, suggestedCode, apiary, apiaries, scannedSerial]);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showScanner) {
          setShowScanner(false);
        } else if (showYearDropdown) {
          setShowYearDropdown(false);
        } else if (showOriginDropdown) {
          setShowOriginDropdown(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showScanner, showYearDropdown, showOriginDropdown, onClose]);

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
  }, [showScanner]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const queenColor = getQueenYearColor(queenBreedingYear);
  const cleanDisplayNum = code.trim().replace(/^beeyield\s*/i, "").replace(/^kib-/i, "");
  const formattedHiveCode = cleanDisplayNum
    ? cleanDisplayNum.length <= 3 && !isNaN(Number(cleanDisplayNum))
      ? `KIB-${cleanDisplayNum.padStart(3, "0")}`
      : code.trim().toUpperCase()
    : "KIB-NEW";

  const handleFinalSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please enter a hive number/code");
      setStep(1);
      return;
    }

    const parsedMaxBrood =
      maxBroodFrames !== "" && !isNaN(Number(maxBroodFrames)) ? Number(maxBroodFrames) : 10;
    const hasDevice = pairingMode === "with_device" && !!sensorSerial.trim();

    const newHiveItem: AddHiveSubmitData = {
      id: `hive-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: formattedHiveCode,
      name: formattedHiveCode,
      apiaryId: selectedApiaryId,
      hiveType: "Langstroth 10-Frame",
      maxBroodFrames: parsedMaxBrood,
      broodFrames: parsedMaxBrood,
      hasHygienicBottomBoard,
      queenPresent: true,
      queenBreedingYear,
      queenStatus: `Active Laying Queen (${queenColor.name})`,
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
      honeyFrames: 4,
      colonyStrength: "Strong (8–10 Frames Brood & Bees)",
      colonyAvailability: "Dedicated Honey Production",
      batches: [],
      deviceCategory: hasDevice
        ? sensorCategory === "scale"
          ? "apiary_scale"
          : sensorCategory === "acoustic_varroa"
          ? "disease_devices"
          : "in_hive"
        : undefined,
    };

    if (onAddHive) {
      await onAddHive(newHiveItem);
    }
    if (onSuccess) {
      onSuccess(newHiveItem);
    }
    toast.success(`Hive ${formattedHiveCode} registered successfully`);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in transform-gpu will-change-[opacity] select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[430px] bg-[#FAF4EE] min-h-[540px] max-h-[92vh] rounded-[28px] shadow-2xl overflow-y-auto flex flex-col p-6 sm:p-7 text-stone-900 border border-stone-300/40 relative select-none animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header matching mobile reference */}
        <div className="relative flex items-center justify-between pb-6 pt-1">
          <button
            type="button"
            onClick={() => {
              if (step === 1) onClose();
              else setStep((step - 1) as 1 | 2 | 3);
            }}
            className="p-1 -ml-2 text-stone-800 hover:text-stone-950 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2]" />
          </button>
          <h2 className="text-[21px] font-normal text-stone-900 absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-sans">
            Add Hive
          </h2>
          <div className="w-6" />
        </div>

        {/* STEP 1: Hive Details (Photo 3) */}
        {step === 1 && (
          <div className="flex flex-col flex-1">
            <h3 className="text-base font-semibold text-stone-900 pt-1 mb-8 font-sans">
              Hive details
            </h3>

            {/* Field 1: Hive number/code */}
            <div className="space-y-1">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 01"
                autoFocus
                className="w-full bg-transparent border-0 border-b border-stone-800 text-stone-900 pb-2 text-base font-normal placeholder:text-stone-400 focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>

            {/* Field 2: Maximum number of brood chamber frames */}
            <div className="space-y-1 mt-8">
              <input
                type="number"
                min="1"
                max="30"
                value={maxBroodFrames}
                onChange={(e) => setMaxBroodFrames(e.target.value)}
                placeholder="Maximum number of brood chamber frames"
                className="w-full bg-transparent border-0 border-b border-stone-800 text-stone-900 pb-2 text-base font-normal placeholder:text-stone-400 focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>

            {/* Field 3: Hygienic Bottom Board Checkbox (Square checkbox on far right) */}
            <div
              className="mt-9 flex items-center justify-between cursor-pointer select-none py-1"
              onClick={() => setHasHygienicBottomBoard(!hasHygienicBottomBoard)}
            >
              <span className="text-base font-normal text-stone-900 font-sans">
                Hive has hygienic bottom board
              </span>
              <div
                className={`w-[22px] h-[22px] rounded-[3px] border border-stone-800 flex items-center justify-center transition-colors ${
                  hasHygienicBottomBoard ? "bg-stone-900 text-white" : "bg-transparent"
                }`}
              >
                {hasHygienicBottomBoard && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>

            {/* Apiary Assignment if multiple apiaries exist */}
            {apiaries.length > 1 && (
              <div className="mt-8 pt-4 border-t border-stone-300/60">
                <label className="text-xs text-stone-600 block mb-1">Assigned Apiary Site</label>
                <select
                  value={selectedApiaryId}
                  onChange={(e) => setSelectedApiaryId(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-stone-800 text-stone-900 pb-1.5 text-sm font-medium focus:outline-none"
                >
                  {apiaries.map((ap) => (
                    <option key={ap.id} value={ap.id} className="bg-[#FAF4EE] text-stone-900">
                      {ap.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Bottom Actions matching Photo 3 */}
            <div className="mt-auto pt-10 flex items-center justify-end gap-3 pb-1">
              <button
                type="button"
                onClick={onClose}
                className="px-7 py-2.5 rounded-full border border-stone-800 text-stone-900 font-medium text-sm hover:bg-stone-200/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!code.trim()) {
                    toast.error("Please enter a hive number (e.g. 01)");
                    return;
                  }
                  setStep(2);
                }}
                className="px-8 py-2.5 rounded-full bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Queen Bee Information (Photo 2 & Photo 1) */}
        {step === 2 && (
          <div className="flex flex-col flex-1">
            <h3 className="text-base font-semibold text-stone-900 pt-1 mb-5 font-sans">
              Queen bee information
            </h3>

            {/* Queen Breeding Year Dropdown (Photo 2) */}
            <div className="relative pt-1">
              <label className="text-xs text-stone-600 block mb-1">Queen breeding year</label>
              <button
                type="button"
                onClick={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowOriginDropdown(false);
                }}
                className="w-full flex items-center justify-between bg-transparent border-0 border-b border-stone-800 text-stone-900 pb-1.5 text-base font-normal focus:outline-none"
              >
                <span className="flex items-center gap-2">
                  <span>{queenBreedingYear}</span>
                  <span className={`w-3.5 h-3.5 rounded-full inline-block ${queenColor.dot}`} />
                </span>
                <ChevronDown className="w-5 h-5 text-stone-800" />
              </button>

              {/* Year Dropdown Menu */}
              {showYearDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#FAF4EE] border border-stone-300 rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden animate-in fade-in">
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((yr) => {
                    const c = getQueenYearColor(yr);
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => {
                          setQueenBreedingYear(yr);
                          setShowYearDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-[#EFE7DB] transition-colors ${
                          queenBreedingYear === yr ? "bg-[#EFE7DB] font-bold" : ""
                        }`}
                      >
                        <span>{yr}</span>
                        <span className={`w-3.5 h-3.5 rounded-full ${c.dot}`} />
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-stone-600 mt-1.5">
                Year color will be visible in the "hive shortcut" icon
              </p>
            </div>

            {/* Queen Origin Dropdown (Photo 1 & Photo 2) */}
            <div className="relative mt-6">
              <label className="text-xs text-stone-600 block mb-1">Queen origin</label>
              <button
                type="button"
                onClick={() => {
                  setShowOriginDropdown(!showOriginDropdown);
                  setShowYearDropdown(false);
                }}
                className="w-full flex items-center justify-between bg-transparent border-0 border-b border-stone-800 text-stone-900 pb-1.5 text-base font-normal focus:outline-none"
              >
                <span>{queenOrigin || "Select origin"}</span>
                <ChevronDown className="w-5 h-5 text-stone-800" />
              </button>

              {/* Floating Menu matching Photo 1 */}
              {showOriginDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#FAF4EE] border border-stone-300 rounded-2xl shadow-2xl z-30 py-1 overflow-hidden animate-in fade-in">
                  {["Own breeding", "Purchase domestic", "Purchase foreign", "Unknown"].map((origin) => (
                    <button
                      key={origin}
                      type="button"
                      onClick={() => {
                        setQueenOrigin(origin);
                        setShowOriginDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                        queenOrigin === origin
                          ? "bg-[#E4DBD0] font-semibold text-stone-950"
                          : "hover:bg-[#EFE7DB] text-stone-800"
                      }`}
                    >
                      {origin}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Queen Insemination Method Radio Group (Photo 2) */}
            <div className="mt-7">
              <p className="text-xs text-stone-600 mb-2">Queen insemination method</p>
              <div className="space-y-1">
                {(["Natural", "Artificial", "Unknown"] as const).map((method) => (
                  <div
                    key={method}
                    onClick={() => setQueenInsemination(method)}
                    className="flex items-center justify-between py-2 cursor-pointer select-none"
                  >
                    <span className="text-base font-normal text-stone-900">{method}</span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        queenInsemination === method ? "border-stone-900" : "border-stone-400"
                      }`}
                    >
                      {queenInsemination === method && (
                        <div className="w-2.5 h-2.5 rounded-full bg-stone-900" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Beekeeper's Note (Photo 2) */}
            <div className="mt-6">
              <label className="text-xs text-stone-600 block mb-1">Beekeeper's note</label>
              <input
                type="text"
                maxLength={1000}
                value={queenNote}
                onChange={(e) => setQueenNote(e.target.value)}
                placeholder="e.g. gentle, bought locally, marked white"
                className="w-full bg-transparent border-0 border-b border-stone-800 text-stone-900 pb-1 text-sm font-normal placeholder:text-stone-400 focus:outline-none focus:border-amber-600 transition-colors"
              />
              <span className="text-xs text-stone-500 mt-1 block font-mono">
                {queenNote.length}/1000
              </span>
            </div>

            {/* Bottom Actions matching Photo 2 */}
            <div className="mt-auto pt-8 flex items-center justify-end gap-2.5 pb-1">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-stone-800 text-stone-900 font-medium text-sm hover:bg-stone-200/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-full border border-stone-800 text-stone-900 font-medium text-sm hover:bg-stone-200/50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-7 py-2.5 rounded-full bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Pairing with a Device */}
        {step === 3 && (
          <div className="flex flex-col flex-1">
            <h3 className="text-base font-semibold text-stone-900 pt-1 mb-1 font-sans">
              Pair device or sensor
            </h3>
            <p className="text-xs text-stone-600 mb-5">
              Connect 24/7 telemetry monitoring to {formattedHiveCode}, or continue in physical ledger mode.
            </p>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setPairingMode("without_device");
                  setSensorSerial("");
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  pairingMode === "without_device"
                    ? "border-stone-900 bg-[#EFE7DB] text-stone-950 shadow-sm"
                    : "border-stone-300 bg-transparent text-stone-700 hover:border-stone-400"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <FileText className="w-3.5 h-3.5 text-stone-800" />
                  <span>Physical Ledger</span>
                </div>
                <div className="text-[11px] text-stone-600 mt-1 leading-tight">
                  No hardware device. Standby box or manual inspection.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPairingMode("with_device");
                  if (!sensorSerial) {
                    setSensorSerial(`VS-KBZ-${cleanDisplayNum.padStart(3, "0") || "001"}`);
                  }
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  pairingMode === "with_device"
                    ? "border-stone-900 bg-[#EFE7DB] text-stone-950 shadow-sm"
                    : "border-stone-300 bg-transparent text-stone-700 hover:border-stone-400"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Cpu className="w-3.5 h-3.5 text-amber-700" />
                  <span>Pair IoT Device</span>
                </div>
                <div className="text-[11px] text-stone-600 mt-1 leading-tight">
                  Attach telemetry sensor or weight scale.
                </div>
              </button>
            </div>

            {/* Hardware Type Selection if pairingMode === "with_device" */}
            {pairingMode === "with_device" && (
              <div className="space-y-3 mb-4 animate-in fade-in">
                <label className="text-xs font-semibold text-stone-800 block">
                  Select Hardware Type:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSensorCategory("vitalsensor");
                      if (!sensorSerial || sensorSerial.startsWith("SCALE-") || sensorSerial.startsWith("APISENSE-")) {
                        setSensorSerial(`VS-KBZ-${cleanDisplayNum.padStart(3, "0") || "001"}`);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      sensorCategory === "vitalsensor"
                        ? "border-stone-900 bg-[#E8DDD1] font-semibold text-stone-950"
                        : "border-stone-300 bg-transparent text-stone-700 hover:bg-stone-200/30"
                    }`}
                  >
                    <Activity className="w-4 h-4 text-emerald-600 mb-1" />
                    <div className="text-xs">VitalSensor</div>
                    <div className="text-[10px] text-stone-600">Temp / RH</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSensorCategory("scale");
                      if (!sensorSerial || sensorSerial.startsWith("VS-") || sensorSerial.startsWith("APISENSE-")) {
                        setSensorSerial(`SCALE-KBZ-${cleanDisplayNum.padStart(3, "0") || "001"}`);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      sensorCategory === "scale"
                        ? "border-stone-900 bg-[#E8DDD1] font-semibold text-stone-950"
                        : "border-stone-300 bg-transparent text-stone-700 hover:bg-stone-200/30"
                    }`}
                  >
                    <Scale className="w-4 h-4 text-amber-600 mb-1" />
                    <div className="text-xs">HoneyScale</div>
                    <div className="text-[10px] text-stone-600">Weight flow</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSensorCategory("acoustic_varroa");
                      if (!sensorSerial || sensorSerial.startsWith("VS-") || sensorSerial.startsWith("SCALE-")) {
                        setSensorSerial(`APISENSE-KBZ-${cleanDisplayNum.padStart(3, "0") || "001"}`);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      sensorCategory === "acoustic_varroa"
                        ? "border-stone-900 bg-[#E8DDD1] font-semibold text-stone-950"
                        : "border-stone-300 bg-transparent text-stone-700 hover:bg-stone-200/30"
                    }`}
                  >
                    <Cpu className="w-4 h-4 text-blue-600 mb-1" />
                    <div className="text-xs">Apisense</div>
                    <div className="text-[10px] text-stone-600">Acoustic pest</div>
                  </button>
                </div>

                {/* Serial input and QR code scanner button */}
                <div className="p-3 bg-white rounded-2xl border border-stone-300 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <ScanLine className="w-4 h-4 text-amber-600" /> Sensor Serial Code
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenScanner) onOpenScanner();
                        else setShowScanner(true);
                      }}
                      className="text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1 transition-colors active:scale-95"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Scan QR Camera
                    </button>
                  </div>
                  <input
                    type="text"
                    value={sensorSerial}
                    onChange={(e) => setSensorSerial(e.target.value)}
                    placeholder="e.g. VS-KBZ-001"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            )}

            {/* Hive Summary Card */}
            <div className="bg-[#EFE7DB]/80 rounded-2xl p-3.5 text-xs text-stone-800 space-y-1.5 border border-stone-300/50 mt-auto">
              <div className="flex items-center justify-between font-bold text-stone-900 pb-1 border-b border-stone-300/50">
                <span>{formattedHiveCode}</span>
                <span className="flex items-center gap-1 text-[11px] font-medium">
                  <span>Queen {queenBreedingYear}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${queenColor.dot}`} />
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-600 pt-0.5">
                <div>
                  Max Frames: <span className="font-semibold text-stone-900">{maxBroodFrames || 10}</span>
                </div>
                <div>
                  Bottom Board:{" "}
                  <span className="font-semibold text-stone-900">
                    {hasHygienicBottomBoard ? "Hygienic" : "Standard"}
                  </span>
                </div>
                <div>
                  Origin: <span className="font-semibold text-stone-900">{queenOrigin}</span>
                </div>
                <div>
                  Telemetry:{" "}
                  <span className="font-semibold text-stone-900">
                    {pairingMode === "with_device" && sensorSerial.trim()
                      ? sensorCategory
                      : "Physical Ledger"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 flex items-center justify-end gap-2.5 pb-1">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-stone-800 text-stone-900 font-medium text-sm hover:bg-stone-200/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-full border border-stone-800 text-stone-900 font-medium text-sm hover:bg-stone-200/50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-7 py-2.5 rounded-full bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-sm transition-colors"
              >
                Add Hive
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Camera QR Scanner Popup */}
      {showScanner && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in"
          onClick={() => setShowScanner(false)}
        >
          <div
            className="w-full max-w-sm bg-[#FAF4EE] rounded-3xl p-5 border border-stone-300 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-300">
              <span className="font-bold text-sm text-stone-900">Scan Sensor QR Code</span>
              <button
                type="button"
                onClick={() => setShowScanner(false)}
                className="p-1 rounded-full text-stone-600 hover:text-stone-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="my-4">
              <div
                id={scannerContainerId}
                className="w-full h-64 rounded-2xl overflow-hidden bg-black border-2 border-dashed border-amber-500 flex items-center justify-center"
              />
              {scannerError && (
                <p className="text-xs text-red-600 mt-2 text-center">{scannerError}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowScanner(false)}
              className="w-full py-2.5 rounded-full bg-stone-900 text-white text-xs font-bold"
            >
              Close Scanner
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
export default AddHiveModal;
