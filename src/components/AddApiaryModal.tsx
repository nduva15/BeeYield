import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  X,
  Radio,
  FileText,
  Info,
  ChevronRight,
  MapPin,
  Navigation,
  Compass,
  Layers,
  Box,
  ShieldCheck,
  Sprout,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDeviceId } from "@/hooks/use-device-id";
import { syncApiaryForageToFlorage } from "@/lib/florage-sync";
import type { ApiarySite } from "@/components/ApiariesPage";

export interface AddApiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newApiary: ApiarySite) => void;
  onSwitchToHive?: () => void;
  initialMode?: "with_devices" | "without_devices";
}

const FLORA_CHIPS = [
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
];

export function AddApiaryModal({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToHive,
  initialMode = "with_devices",
}: AddApiaryModalProps) {
  const { user } = useAuth();
  const deviceId = useDeviceId();
  const userKey = user?.id || deviceId || "default";

  const [step, setStep] = useState<1 | 2>(1);
  const [addMode, setAddMode] = useState<"with_devices" | "without_devices">(initialMode);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location_name: "Kiunduani, Kibwezi, Makueni, Kenya",
    county: "Makueni",
    region: "Kibwezi East",
    latitude: -2.409,
    longitude: 37.967,
    size_acres: 5.0,
    total_hives: 184,
    active_hives: 150,
    forage_type: "Acacia, Neem, Maize, Mango & Forest Multifloral",
    notes: "",
  });

  if (!isOpen) return null;

  const handleDetectGps = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setIsDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: parseFloat(position.coords.latitude.toFixed(4)),
            longitude: parseFloat(position.coords.longitude.toFixed(4)),
          }));
          setIsDetectingGps(false);
          toast.success(
            `GPS Coordinates pinned: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          );
        },
        (err) => {
          setIsDetectingGps(false);
          toast.error(`Geolocation error: ${err.message}`);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleSaveApiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter an apiary name first");
      return;
    }

    setIsSaving(true);
    const newId = `apiary-${Date.now()}`;
    const newSite: ApiarySite = {
      id: newId,
      name: formData.name.trim(),
      location_name: formData.location_name || "Kiunduani, Kibwezi, Makueni, Kenya",
      county: formData.county || "Makueni",
      region: formData.region || "Kibwezi East",
      latitude: formData.latitude,
      longitude: formData.longitude,
      type: "Commercial Apiary",
      status: "Optimal",
      active_hives: formData.active_hives,
      total_hives: formData.total_hives,
      size_acres: formData.size_acres,
      forage_type: formData.forage_type,
      notes: formData.notes,
      created_at: new Date().toISOString(),
    };

    // 1. Supabase sync if user available
    try {
      if (user) {
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
          user_id: user.id,
        });
      }
    } catch {
      // Non-blocking fallback
    }

    // 2. Local storage persistence
    try {
      const existing = localStorage.getItem(`beeyield_user_apiaries_${userKey}`);
      const list: ApiarySite[] = existing ? JSON.parse(existing) : [];
      const updated = [newSite, ...list];
      localStorage.setItem(`beeyield_user_apiaries_${userKey}`, JSON.stringify(updated));
    } catch {
      // Non-blocking
    }

    // 3. Sync florage
    if (newSite.forage_type) {
      try {
        syncApiaryForageToFlorage(newSite.name, newSite.forage_type);
      } catch {
        // Non-blocking
      }
    }

    // 4. Dispatch global event so open pages refresh
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("beeyield_apiary_updated", {
          detail: { newApiary: newSite },
        })
      );
    }

    toast.success(
      addMode === "with_devices"
        ? `Apiary "${newSite.name}" registered with 24/7 device monitoring`
        : `Apiary "${newSite.name}" registered in Digital Journal mode`
    );

    setIsSaving(false);
    onSuccess?.(newSite);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={() => onClose()}
    >
      <div
        className="w-full sm:max-w-xl bg-[#FAF4EE] text-stone-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-300 relative my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Switcher Tab Header if onSwitchToHive provided */}
        {onSwitchToHive && (
          <div className="bg-stone-200/60 border-b border-stone-300/80 px-6 pt-3 pb-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
              New Record Asset
            </span>
            <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-xl border border-stone-300 shadow-2xs">
              <button
                type="button"
                className="px-3 py-1 rounded-lg text-xs font-bold bg-[#FFB800] text-stone-950 shadow-xs"
              >
                📍 Add Apiary
              </button>
              <button
                type="button"
                onClick={onSwitchToHive}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                🐝 Add Hive
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Name and Mode Selection (With / Without Devices) */}
        {step === 1 && (
          <div className="flex flex-col flex-1 p-6 sm:p-7 overflow-y-auto">
            {/* Top Bar */}
            <div className="relative flex items-center justify-between pb-5 border-b border-stone-300/60">
              <button
                type="button"
                onClick={onClose}
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
                onClick={onClose}
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
                onClick={() => setAddMode("with_devices")}
                className={`w-full p-4 rounded-2xl border text-left font-medium text-sm transition-all flex items-start gap-3.5 ${
                  addMode === "with_devices"
                    ? "border-amber-600 bg-amber-500/10 text-stone-950 ring-2 ring-amber-600/30 shadow-sm"
                    : "border-stone-300/80 bg-white/70 text-stone-800 hover:border-stone-400"
                }`}
              >
                <div
                  className={`p-2 rounded-xl mt-0.5 ${
                    addMode === "with_devices"
                      ? "bg-amber-500 text-stone-950"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  <Radio className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-950">With devices</span>
                    {addMode === "with_devices" && (
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
                onClick={() => setAddMode("without_devices")}
                className={`w-full p-4 rounded-2xl border text-left font-medium text-sm transition-all flex items-start gap-3.5 ${
                  addMode === "without_devices"
                    ? "border-stone-900 bg-stone-900/5 text-stone-950 ring-2 ring-stone-900/20 shadow-sm"
                    : "border-stone-300/80 bg-white/70 text-stone-800 hover:border-stone-400"
                }`}
              >
                <div
                  className={`p-2 rounded-xl mt-0.5 ${
                    addMode === "without_devices"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-950">Without devices</span>
                    {addMode === "without_devices" && (
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
                onClick={onClose}
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
                  setStep(2);
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

        {/* STEP 2: Location, Coordinates, Acres, Hives Total, Florage, Notes */}
        {step === 2 && (
          <div className="flex flex-col flex-1 p-6 sm:p-7 overflow-y-auto">
            {/* Top Bar */}
            <div className="relative flex items-center justify-between pb-4 border-b border-stone-300/60">
              <button
                type="button"
                onClick={() => setStep(1)}
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
                onClick={onClose}
                className="p-1.5 -mr-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Apiary Summary Pill */}
            <div className="mt-4 p-3 bg-[#EFE7DB] rounded-2xl border border-stone-300 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                  Apiary Name
                </span>
                <span className="font-bold text-sm text-stone-900 truncate block">
                  {formData.name}
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-900 whitespace-nowrap border border-amber-500/30">
                {addMode === "with_devices" ? "With Devices" : "Without Devices"}
              </span>
            </div>

            <form onSubmit={handleSaveApiary} className="pt-4 space-y-4">
              {/* 1. LOCATION */}
              <div className="space-y-2 bg-white/70 p-3.5 rounded-2xl border border-stone-300/70">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>
                    Location <span className="text-amber-600">*</span>
                  </span>
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
                    <span>
                      Coordinates (GPS) <span className="text-amber-600">*</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                    className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-600/30 text-amber-900 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    <Compass
                      className={`w-3.5 h-3.5 ${isDetectingGps ? "animate-spin text-amber-700" : ""}`}
                    />
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
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                      }
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
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="37.9670"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* 3. ACRES & HIVES TOTAL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white/70 p-3.5 rounded-2xl border border-stone-300/70">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      Acres <span className="text-amber-600">*</span>
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    required
                    value={formData.size_acres}
                    onChange={(e) =>
                      setFormData({ ...formData, size_acres: parseFloat(e.target.value) || 1 })
                    }
                    placeholder="5.0"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                    <Box className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      Hives Total <span className="text-amber-600">*</span>
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.total_hives}
                    onChange={(e) =>
                      setFormData({ ...formData, total_hives: parseInt(e.target.value, 10) || 1 })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, active_hives: parseInt(e.target.value, 10) || 0 })
                    }
                    placeholder="150"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* 4. FLORAGE */}
              <div className="space-y-2 bg-white/70 p-3.5 rounded-2xl border border-stone-300/70">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>
                    Florage / Forage Ecosystem <span className="text-amber-600">*</span>
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.forage_type}
                  onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                  placeholder="e.g. Acacia, Neem, Maize, Mango & Forest Multifloral"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
                {/* Suggestion Chips */}
                <div className="pt-1">
                  <span className="text-[10px] text-stone-500 font-semibold block mb-1">
                    Click to add/remove flora tags:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {FLORA_CHIPS.map((chip) => {
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

              {/* 5. OPERATIONAL NOTES */}
              <div className="space-y-1 bg-white/70 p-3.5 rounded-2xl border border-stone-300/70">
                <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                  Operational Notes & Site Observations
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Good shade under mature acacia canopy, close proximity to Kiunduani permanent stream, seasonal mango flowering from August."
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-stone-300/60">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-bold text-xs"
                >
                  Back to Step 1
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-full border border-stone-400 text-stone-700 font-bold text-xs hover:bg-stone-200/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-7 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Apiary"}
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
export default AddApiaryModal;
