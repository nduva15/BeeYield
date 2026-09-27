import React, { useState, useEffect } from "react";
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
  RefreshCw,
  Sparkles,
  Mountain,
  Sun,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDeviceId } from "@/hooks/use-device-id";
import { syncApiaryForageToFlorage } from "@/lib/florage-sync";
import { autoSyncRecord } from "@/lib/integration-sync";
import type { ApiarySite as BaseApiarySite } from "@/components/ApiariesPage";

export type ApiarySite = BaseApiarySite & {
  add_mode?: "with_devices" | "without_devices";
};

export interface AddApiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newApiary: ApiarySite) => void;
  onSwitchToHive?: () => void;
  initialMode?: "with_devices" | "without_devices";
  initialApiary?: ApiarySite | null;
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
  "Macadamia",
  "Citrus",
];

const APIARY_TYPES = [
  "Commercial Apiary",
  "Breeding & Queen Rearing",
  "Research & Pollination Sanctuary",
  "Community / Cooperative Apiary",
  "Backyard / Hobbyist Stand",
];

export function AddApiaryModal({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToHive,
  initialMode = "with_devices",
  initialApiary = null,
}: AddApiaryModalProps) {
  const { user } = useAuth();
  const deviceId = useDeviceId();
  const userKey = user?.id || deviceId || "default";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [addMode, setAddMode] = useState<"with_devices" | "without_devices">(
    initialApiary?.add_mode === "without_devices" ? "without_devices" : initialMode
  );
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State initialized from initialApiary or defaults
  const [formData, setFormData] = useState(() => ({
    name: initialApiary?.name || "",
    location_name: initialApiary?.location_name || "Kiunduani, Kibwezi, Makueni, Kenya",
    county: initialApiary?.county || "Makueni",
    region: initialApiary?.region || "Kibwezi East",
    latitude: initialApiary?.latitude ?? -2.409,
    longitude: initialApiary?.longitude ?? 37.967,
    elevation_m: 820,
    size_acres: initialApiary?.size_acres ?? 5.0,
    total_hives: initialApiary?.total_hives ?? 184,
    active_hives: initialApiary?.active_hives ?? 150,
    forage_type:
      initialApiary?.forage_type || "Acacia, Neem, Maize, Mango & Forest Multifloral",
    type: initialApiary?.type || "Commercial Apiary",
    status: initialApiary?.status || "Optimal",
    notes:
      initialApiary?.notes ||
      "Lead Beekeeper: Timothy Nduva. 150 active producing colonies across 184 managed Langstroth hive stands in Kibwezi ecosystem, Kenya (34 standby stands awaiting swarm colonization).",
  }));

  // Re-sync if initialApiary changes
  useEffect(() => {
    if (initialApiary) {
      setFormData({
        name: initialApiary.name || "",
        location_name: initialApiary.location_name || "Kiunduani, Kibwezi, Makueni, Kenya",
        county: initialApiary.county || "Makueni",
        region: initialApiary.region || "Kibwezi East",
        latitude: initialApiary.latitude ?? -2.409,
        longitude: initialApiary.longitude ?? 37.967,
        elevation_m: 820,
        size_acres: initialApiary.size_acres ?? 5.0,
        total_hives: initialApiary.total_hives ?? 184,
        active_hives: initialApiary.active_hives ?? 150,
        forage_type:
          initialApiary.forage_type || "Acacia, Neem, Maize, Mango & Forest Multifloral",
        type: initialApiary.type || "Commercial Apiary",
        status: initialApiary.status || "Optimal",
        notes: initialApiary.notes || "",
      });
      setAddMode(initialApiary.add_mode === "without_devices" ? "without_devices" : "with_devices");
    }
  }, [initialApiary]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Step 2: Live Geolocation detector
  const handleDetectGps = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setIsDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(4));
          const lon = parseFloat(position.coords.longitude.toFixed(4));
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lon,
          }));
          setIsDetectingGps(false);
          toast.success(`GPS Coordinates pinned: ${lat}, ${lon}`);
        },
        (err) => {
          setIsDetectingGps(false);
          toast.error(`Geolocation error: ${err.message}. Retaining current coordinates.`);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  // Full Backend Save (REST API + Supabase + LocalStorage + Offline sync + Global events)
  const handleSaveApiary = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter an apiary station name");
      setStep(1);
      return;
    }

    if (isNaN(formData.latitude) || isNaN(formData.longitude)) {
      toast.error("Please verify latitude and longitude coordinates");
      setStep(2);
      return;
    }

    setIsSaving(true);
    const apiaryId = initialApiary?.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `apiary-${Date.now()}`);

    const newSite: ApiarySite = {
      id: apiaryId,
      name: formData.name.trim(),
      location_name: formData.location_name.trim() || "Kiunduani, Kibwezi, Makueni, Kenya",
      county: formData.county.trim() || "Makueni",
      region: formData.region.trim() || "Kibwezi East",
      latitude: formData.latitude,
      longitude: formData.longitude,
      type: formData.type,
      status: formData.status,
      active_hives: Number(formData.active_hives) || 0,
      total_hives: Number(formData.total_hives) || Number(formData.active_hives) || 1,
      size_acres: Number(formData.size_acres) || 1,
      forage_type: formData.forage_type.trim(),
      notes: formData.notes.trim(),
      created_at: initialApiary?.created_at || new Date().toISOString(),
      add_mode: addMode,
    };

    // 1. Backend REST API Sync
    try {
      await fetch("/api/v1/apiaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newSite.id,
          user_id: user?.id || null,
          device_id: deviceId,
          name: newSite.name,
          location_name: newSite.location_name,
          county: newSite.county,
          region: newSite.region,
          latitude: newSite.latitude,
          longitude: newSite.longitude,
          size_acres: newSite.size_acres,
          total_hives: newSite.total_hives,
          active_hives: newSite.active_hives,
          forage_type: newSite.forage_type,
          notes: newSite.notes,
          type: newSite.type,
          status: newSite.status,
          add_mode: addMode,
        }),
      }).catch(() => undefined);
    } catch {
      // Non-blocking
    }

    // 2. Supabase Integration
    try {
      if (user && supabase) {
        // Serialize extended attributes into notes to guarantee full schema portability
        const structuredNotes = JSON.stringify({
          location_name: newSite.location_name,
          county: newSite.county,
          region: newSite.region,
          size_acres: newSite.size_acres,
          total_hives: newSite.total_hives,
          active_hives: newSite.active_hives,
          forage_type: newSite.forage_type,
          elevation_m: formData.elevation_m,
          notes: newSite.notes,
        });

        // Try insert or update
        if (initialApiary?.id) {
          const res = await (supabase as any)
            .from("apiaries")
            .update({
              name: newSite.name,
              add_mode: addMode,
              latitude: newSite.latitude,
              longitude: newSite.longitude,
              notes: structuredNotes,
            })
            .eq("id", newSite.id);

          if (res.error) {
            // Also try plain notes if JSON rejected
            await (supabase as any)
              .from("apiaries")
              .update({
                name: newSite.name,
                add_mode: addMode,
                latitude: newSite.latitude,
                longitude: newSite.longitude,
                notes: newSite.notes,
              })
              .eq("id", newSite.id)
              .catch(() => undefined);
          }
        } else {
          const res = await (supabase as any).from("apiaries").insert({
            id: newSite.id,
            user_id: user.id,
            name: newSite.name,
            add_mode: addMode,
            latitude: newSite.latitude,
            longitude: newSite.longitude,
            notes: structuredNotes,
          });

          if (res.error) {
            // Fallback without explicit ID if default gen_random_uuid() is mandated
            await (supabase as any).from("apiaries").insert({
              user_id: user.id,
              name: newSite.name,
              add_mode: addMode,
              latitude: newSite.latitude,
              longitude: newSite.longitude,
              notes: newSite.notes,
            }).catch(() => undefined);
          }
        }
      }
    } catch (e) {
      console.warn("Supabase apiary sync fallback:", e);
    }

    // 3. User-Scoped LocalStorage Persistence
    try {
      const storageKey = `beeyield_user_apiaries_${userKey}`;
      const existing = localStorage.getItem(storageKey);
      const list: ApiarySite[] = existing ? JSON.parse(existing) : [];
      let updated: ApiarySite[];

      if (initialApiary?.id) {
        updated = list.map((a) => (a.id === newSite.id ? newSite : a));
        if (!updated.some((a) => a.id === newSite.id)) {
          updated.unshift(newSite);
        }
      } else {
        updated = [newSite, ...list.filter((a) => a.id !== newSite.id && a.name !== newSite.name)];
      }

      localStorage.setItem(storageKey, JSON.stringify(updated));

      // Global fallback key
      localStorage.setItem("beeyield_apiary_locations", JSON.stringify(updated));
    } catch {
      // Non-blocking
    }

    // 4. Sync Florage Ecosystem
    if (newSite.forage_type) {
      try {
        syncApiaryForageToFlorage(newSite.name, newSite.forage_type);
      } catch {
        // Non-blocking
      }
    }

    // 5. Offline Auto-Sync Integration
    void autoSyncRecord({
      deviceId,
      kind: "task",
      recordId: newSite.id,
      hiveLabel: newSite.name,
      title: `Apiary Deployment: ${newSite.name}`,
      summary: `Apiary site registered with ${newSite.total_hives} stands (${newSite.active_hives} active colonies) in ${newSite.location_name}. Forage: ${newSite.forage_type}.`,
      status: newSite.status,
      occurredAt: new Date().toISOString(),
      metrics: {
        totalHives: newSite.total_hives,
        activeHives: newSite.active_hives,
        sizeAcres: newSite.size_acres,
        latitude: newSite.latitude,
        longitude: newSite.longitude,
        addMode: addMode,
      },
    });

    // 6. Real-time Cross-Page Event Dispatching
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("beeyield_apiary_updated", {
          detail: { newApiary: newSite },
        })
      );
      window.dispatchEvent(
        new CustomEvent("beeyield_data_updated", {
          detail: { type: "apiary", apiary: newSite },
        })
      );
    }

    toast.success(
      initialApiary
        ? `Apiary "${newSite.name}" updated successfully`
        : addMode === "with_devices"
        ? `Apiary "${newSite.name}" deployed with 24/7 IoT monitoring`
        : `Apiary "${newSite.name}" deployed in Digital Journal mode`
    );

    setIsSaving(false);
    onSuccess?.(newSite);
    onClose();
  };

  const standbyHivesCount = Math.max(0, (Number(formData.total_hives) || 0) - (Number(formData.active_hives) || 0));

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={() => onClose()}
    >
      <div
        className="w-full max-w-2xl bg-card text-foreground rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border relative my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar matching InspectionsPage aesthetic */}
        <div className="bg-emerald-600 px-5 py-4 flex items-center justify-between text-white shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Compass className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-base sm:text-lg font-bold text-white tracking-wide">
                  {initialApiary ? "Edit Apiary Site" : "Add Apiary Site"}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                  Step {step} of 3
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <span>Deployment station, GPS coordinates & flora ecosystem</span>
                {formData.name && (
                  <span className="font-mono text-emerald-200 truncate max-w-[200px]">· {formData.name}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Switcher Tab Header if onSwitchToHive provided */}
            {onSwitchToHive && (
              <div className="flex items-center gap-1 bg-emerald-700/70 p-1 rounded-xl border border-emerald-400/40 text-xs shadow-inner shrink-0">
                <button
                  type="button"
                  className="px-2 sm:px-2.5 py-1 rounded-lg bg-white text-emerald-950 font-bold text-[10px] sm:text-[11px] shadow-xs cursor-default select-none touch-manipulation"
                >
                  📍 Add Apiary
                </button>
                <button
                  type="button"
                  onClick={onSwitchToHive}
                  className="px-2 sm:px-2.5 py-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-600/70 transition-colors font-semibold text-[10px] sm:text-[11px] cursor-pointer select-none touch-manipulation"
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

        {/* Stepper Progress Bar matching InspectionsPage tabs */}
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
            <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">1</span>
            <span>Station & Mode</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

          <button
            type="button"
            onClick={() => {
              if (!formData.name.trim()) {
                toast.error("Please enter an apiary station name first");
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
            <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">2</span>
            <span>Location & GPS</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

          <button
            type="button"
            onClick={() => {
              if (!formData.name.trim()) {
                toast.error("Please enter an apiary station name first");
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
            <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">3</span>
            <span>Flora & Capacity</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSaveApiary} className="flex flex-col flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* STEP 1: Station Identity & Operational Mode */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Card 1: Station Identifier */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-500" /> Apiary Station Identifier
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Primary Site
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    Station Name <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kibwezi Commercial Apiary Site"
                    autoFocus
                    required
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    The canonical name identifying this apiary across weather hubs, hive registries, and harvest manifests.
                  </p>
                </div>
              </div>

              {/* Card 2: Operational Deployment Mode */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-500" /> Operational Deployment Mode
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                    addMode === "with_devices"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-stone-500/15 text-stone-500"
                  }`}>
                    {addMode === "with_devices" ? "IoT Telemetry" : "Digital Journal"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAddMode("with_devices")}
                    className={`p-3.5 rounded-xl border text-left font-medium text-xs transition-all flex items-start gap-3 ${
                      addMode === "with_devices"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/30 font-bold shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${addMode === "with_devices" ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                      <Radio className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-foreground">With IoT Telemetry</p>
                        {addMode === "with_devices" && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-normal mt-1 leading-relaxed">
                        Continuous telemetry streaming, apiary microclimate hub, VitalSensor acoustics & scale telemetry.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddMode("without_devices")}
                    className={`p-3.5 rounded-xl border text-left font-medium text-xs transition-all flex items-start gap-3 ${
                      addMode === "without_devices"
                        ? "border-border bg-muted/60 text-foreground ring-1 ring-border font-bold shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${addMode === "without_devices" ? "bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900" : "bg-muted text-muted-foreground"}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-foreground">Digital Journal Mode</p>
                        {addMode === "without_devices" && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-stone-700 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-normal mt-1 leading-relaxed">
                        Physical ledger mode for recording manual inspections, queen status, and honey harvests without hardware.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                  <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Hardware sensors can be attached or upgraded at any time from the Devices view.</span>
                </div>
              </div>

              {/* Card 3: Apiary Type & Operational Status */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Facility Type & Health Status
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold">Facility Classification</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      {APIARY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold">Colony Ecosystem Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="Optimal">Optimal (Thriving Forage & High Colony Strength)</option>
                      <option value="Watch">Watch (Seasonal Transition / Inspection Needed)</option>
                      <option value="Threatened">Threatened (Pest Pressure or Dearth Period)</option>
                      <option value="Maintenance">Maintenance (Stand repairs / Cleaning)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Geographic Location & Live GPS */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Card 1: GPS Coordinates with Live Detection */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-500" /> GPS Geolocation Coordinates
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Compass className={`w-3.5 h-3.5 ${isDetectingGps ? "animate-spin text-white" : ""}`} />
                    {isDetectingGps ? "Pinning GPS..." : "Detect Live GPS"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-amber-500" /> Latitude <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 font-mono text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-amber-500" /> Longitude <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 font-mono text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Target Coordinates:
                  </span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    {formData.latitude.toFixed(4)}° N, {formData.longitude.toFixed(4)}° E
                  </span>
                </div>
              </div>

              {/* Card 2: Postal & Regional Address */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Regional Jurisdiction & Elevation
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      Location / Physical Address <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location_name}
                      onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                      placeholder="e.g. Kiunduani, Kibwezi, Makueni, Kenya"
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">County</label>
                      <input
                        type="text"
                        value={formData.county}
                        onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                        placeholder="e.g. Makueni"
                        className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Region / Sub-County</label>
                      <input
                        type="text"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        placeholder="e.g. Kibwezi East"
                        className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        <Mountain className="w-3 h-3 text-emerald-500" /> Altitude (m ASL)
                      </label>
                      <input
                        type="number"
                        value={formData.elevation_m}
                        onChange={(e) => setFormData({ ...formData, elevation_m: parseInt(e.target.value, 10) || 820 })}
                        placeholder="820"
                        className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Flora Ecosystem & Stand Capacity */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Card 1: Acreage & Stand Allocation */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-honey" /> Acreage & Hive Stand Allocation
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {standbyHivesCount} Standby Stand(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-500" /> Acreage (Acres) <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      required
                      value={formData.size_acres}
                      onChange={(e) => setFormData({ ...formData, size_acres: parseFloat(e.target.value) || 1 })}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <Box className="w-3 h-3 text-honey" /> Total Hive Stands <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.total_hives}
                      onChange={(e) => setFormData({ ...formData, total_hives: parseInt(e.target.value, 10) || 1 })}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> Active Producing Hives
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.active_hives}
                      onChange={(e) => setFormData({ ...formData, active_hives: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/50 border border-border/80 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Colony Deployment Breakdown:</span>
                  <span className="font-bold text-foreground">
                    {formData.active_hives} Active Producing • {standbyHivesCount} Standby Stands (Awaiting Swarm)
                  </span>
                </div>
              </div>

              {/* Card 2: Florage Taxonomy & Ecosystem */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-emerald-500" /> Florage Ecosystem & Botanical Taxonomy
                  </span>
                  <span className="text-[11px] text-muted-foreground">Select all dominant nectar sources</span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={formData.forage_type}
                    onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                    placeholder="e.g. Acacia, Neem, Maize, Mango & Forest Multifloral"
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {FLORA_CHIPS.map((chip) => {
                      const isIncluded = formData.forage_type.toLowerCase().includes(chip.toLowerCase());
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
                            const parts = current.split(",").map((s) => s.trim()).filter(Boolean);
                            if (parts.some((p) => p.toLowerCase() === chip.toLowerCase())) {
                              const nextParts = parts.filter((p) => p.toLowerCase() !== chip.toLowerCase());
                              setFormData({ ...formData, forage_type: nextParts.join(", ") });
                            } else {
                              setFormData({ ...formData, forage_type: [...parts, chip].join(", ") });
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                            isIncluded
                              ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-bold"
                              : "bg-card text-muted-foreground border-border hover:border-border/80"
                          }`}
                        >
                          {isIncluded ? "✓ " : "+ "}
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-xs text-muted-foreground font-semibold">Operational Site Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Mature acacia canopy, permanent stream boundary, heavy seasonal bloom from August..."
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
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
                  Ready to deploy new apiary site
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
                    if (!formData.name.trim()) {
                      toast.error("Please enter an apiary station name first");
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
                      {initialApiary ? "Update Apiary Site" : "Save Apiary Site"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default AddApiaryModal;
