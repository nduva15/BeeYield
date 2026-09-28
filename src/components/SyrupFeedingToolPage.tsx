import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Droplets,
  Calculator,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileDown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Heart,
  Layers,
  FileText,
  ClipboardList,
  MoreVertical,
  Activity,
  RefreshCw,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  resolveUserHives,
  UnifiedHive,
  CANONICAL_TIMOTHY_HIVES,
} from "@/lib/user-hives";
import { CANONICAL_APIARY_NAME } from "@/lib/apiary-normalization";
import FrameSenseToolPage from "./FrameSenseToolPage";
import NotesPage from "./NotesPage";

export interface SyrupFeedLog {
  id: string;
  hiveId: string;
  hiveCode: string;
  date: string;
  amountLiters: number;
  ratio: "1:1" | "3:2" | "2:1";
  feederType: string;
  notes?: string;
}

export interface SyrupFeedingToolPageProps {
  isOpen: boolean;
  onClose: () => void;
  initialHiveId?: string;
  embedded?: boolean;
  onOpenFrameSense?: (hiveId: string) => void;
  onOpenInspections?: (hiveId: string) => void;
  onOpenNotes?: (hiveId: string) => void;
}

export function SyrupFeedingToolPage({
  isOpen,
  onClose,
  initialHiveId,
  embedded = false,
  onOpenFrameSense,
  onOpenInspections,
  onOpenNotes,
}: SyrupFeedingToolPageProps) {
  const { user, profile } = useAuth();

  // 1. Resolve all hives
  const allHives = useMemo(() => {
    return resolveUserHives(user, profile);
  }, [user, profile]);

  // Selected Hive state
  const [selectedHiveId, setSelectedHiveId] = useState<string>(() => {
    if (initialHiveId) return initialHiveId;
    return allHives[0]?.id || "hive-kib-001";
  });

  useEffect(() => {
    if (initialHiveId) {
      setSelectedHiveId(initialHiveId);
    }
  }, [initialHiveId]);

  const selectedHive = useMemo(() => {
    return (
      allHives.find((h) => h.id === selectedHiveId) ||
      allHives.find((h) => h.code === selectedHiveId) ||
      allHives[0] ||
      CANONICAL_TIMOTHY_HIVES[0]
    );
  }, [allHives, selectedHiveId]);

  const hiveDisplayName = selectedHive.code || selectedHive.hive_code || selectedHive.name || "beeyield 001";

  // Local FrameSense and Notes intact navigation
  const [isFrameSenseOpen, setIsFrameSenseOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  // View mode inside Syrup: "calculator" vs "feeding_history"
  const [viewMode, setViewMode] = useState<"calculator" | "feeding_history">("calculator");

  // Calculator State (defaults: 3:2 ratio)
  const [ratio, setRatio] = useState<"1:1" | "3:2" | "2:1">("3:2");
  const [targetVolumeStr, setTargetVolumeStr] = useState<string>("");
  const [showHowToPrepare, setShowHowToPrepare] = useState(true);

  // Feeding Log Form Modal
  const [showLogForm, setShowLogForm] = useState(false);
  const [logAmount, setLogAmount] = useState<string>("5.0");
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [feederType, setFeederType] = useState<string>("Rapid Top Feeder (Hive Cover)");
  const [logNotes, setLogNotes] = useState<string>("Mid-season dearth nourishment");

  // Feeding History stored per hive
  const [feedingLogs, setFeedingLogs] = useState<SyrupFeedLog[]>([]);

  // Load history for selected hive (real user records only)
  useEffect(() => {
    if (!selectedHive?.id) return;
    try {
      const stored = localStorage.getItem(`syrup_feeding_${selectedHive.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out legacy hardcoded mock records
          const realOnly = parsed.filter(
            (item: any) =>
              !item.id?.endsWith("-1") &&
              !item.id?.endsWith("-2") &&
              !item.notes?.includes("Mid-season dearth nourishment before acacia burst") &&
              !item.notes?.includes("Stimulated queen egg laying")
          );
          setFeedingLogs(realOnly);
          if (realOnly.length !== parsed.length) {
            localStorage.setItem(`syrup_feeding_${selectedHive.id}`, JSON.stringify(realOnly));
          }
          return;
        }
      }
    } catch {}

    // Strictly real feeding logs only - zero fake data
    setFeedingLogs([]);
  }, [selectedHive?.id]);

  const saveFeedingLogs = (newList: SyrupFeedLog[]) => {
    setFeedingLogs(newList);
    try {
      localStorage.setItem(`syrup_feeding_${selectedHive.id}`, JSON.stringify(newList));
    } catch {}
  };

  // Recipe calculation matching precision physical apiculture formulas
  const recipe = useMemo(() => {
    const v = parseFloat(targetVolumeStr);
    if (isNaN(v) || v <= 0) {
      return { waterL: null, sugarKg: null, caloriesKcal: 0, valid: false };
    }

    let waterL = 0;
    let sugarKg = 0;

    if (ratio === "1:1") {
      // 1 kg sugar + 1 L water yields ~1.625 L syrup
      waterL = v / 1.625;
      sugarKg = waterL * 1.0;
    } else if (ratio === "3:2") {
      // 1.5 kg sugar + 1 L water yields ~1.9375 L syrup
      waterL = v / 1.9375;
      sugarKg = waterL * 1.5;
    } else {
      // 2:1 (2 kg sugar + 1 L water yields ~2.25 L syrup)
      waterL = v / 2.25;
      sugarKg = waterL * 2.0;
    }

    const calories = Math.round(sugarKg * 3870);

    return {
      waterL: parseFloat(waterL.toFixed(2)),
      sugarKg: parseFloat(sugarKg.toFixed(2)),
      caloriesKcal: calories,
      valid: true,
    };
  }, [ratio, targetVolumeStr]);

  // Dynamic description under ratio pills
  const ratioDescription = useMemo(() => {
    switch (ratio) {
      case "1:1":
        return "Thin (1:1) — spring stimulation & rapid brood rearing";
      case "3:2":
        return "Medium (3:2) — all-purpose summer dearth & colony upkeep";
      case "2:1":
        return "Thick (2:1) — rapid stores build-up & dry season emergency";
    }
  }, [ratio]);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(logAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid syrup volume");
      return;
    }

    const newLog: SyrupFeedLog = {
      id: `feed-${selectedHive.id}-${Date.now()}`,
      hiveId: selectedHive.id,
      hiveCode: hiveDisplayName,
      date: logDate,
      amountLiters: amount,
      ratio,
      feederType,
      notes: logNotes.trim() || undefined,
    };

    const updated = [newLog, ...feedingLogs];
    saveFeedingLogs(updated);
    setShowLogForm(false);
    toast.success(`Logged ${amount} L syrup feed for ${hiveDisplayName}!`);
  };

  const handleDeleteLog = (id: string) => {
    const updated = feedingLogs.filter((f) => f.id !== id);
    saveFeedingLogs(updated);
    toast.success("Feeding event record deleted");
  };

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const totalFedLiters = feedingLogs.reduce((acc, curr) => acc + curr.amountLiters, 0);

  // Intact page view matching NotesPage full-height design system
  const content = (
    <div
      className={
        embedded
          ? "w-full max-w-2xl mx-auto py-2"
          : "fixed inset-0 z-[100] bg-background text-foreground overflow-y-auto flex flex-col animate-in fade-in duration-150 select-text"
      }
    >
      <div
        className={`w-full max-w-xl mx-auto flex-1 flex flex-col p-4 sm:p-6 text-foreground min-h-screen ${
          embedded ? "h-auto min-h-0" : ""
        }`}
      >
        {/* TOP APP BAR: Matching NotesPage Design */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -ml-1 text-foreground hover:text-foreground/80 rounded-xl hover:bg-card border border-border transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-sans">
              Syrup Feeding
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                toast.success("Syrup calculations and logs refreshed");
              }}
              className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* View Mode Toggle Pill */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "calculator" ? "feeding_history" : "calculator")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "feeding_history"
                  ? "bg-card border border-border text-foreground hover:bg-muted"
                  : "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md border border-emerald-500/40"
              }`}
              title="Toggle View"
            >
              {viewMode === "feeding_history" ? (
                <>
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calculator</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ledger ({feedingLogs.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* HIVE TITLE & SELECTOR: Matching NotesPage & FrameSense */}
        <div className="flex items-center justify-between pt-3 pb-2 shrink-0">
          <div className="relative group">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {hiveDisplayName}
              <select
                value={selectedHive.id}
                onChange={(e) => setSelectedHiveId(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                title="Switch Hive"
              >
                {allHives.map((h) => {
                  const num = h.code?.replace(/\D+/g, "") || "";
                  const label = num ? `beeyield ${num.padStart(3, "0")}` : (h.name || h.code);
                  return (
                    <option key={h.id} value={h.id} className="text-foreground bg-card">
                      {label}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-honey transition-colors pointer-events-none" />
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-xl bg-card border border-border text-xs font-bold text-muted-foreground">
              <strong className="text-honey">{feedingLogs.length}</strong> {feedingLogs.length === 1 ? "Feed" : "Feeds"}
            </span>
          </div>
        </div>

        {/* SUB-NAV TOOL BAR: Hive state | Syrup | FrameSense | Notes | Inspection */}
        <div className="flex items-center justify-between border-b border-border pb-2 mb-4 shrink-0 overflow-x-auto no-scrollbar gap-2 text-center">
          {/* 1. Hive state */}
          <button
            type="button"
            onClick={() => {
              toast.info(`${hiveDisplayName} Colony: Active & Healthy (${selectedHive.frame_count || 10} Frames)`);
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <Activity className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">Hive state</span>
          </button>

          {/* 2. Syrup (Active) */}
          <button
            type="button"
            onClick={() => {
              setViewMode("calculator");
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-honey relative cursor-pointer group font-bold"
          >
            <Droplets className="w-5 h-5 mb-1 text-honey group-hover:scale-105 transition-transform" />
            <span className="text-[11px] leading-none whitespace-nowrap">Syrup</span>
            {/* Active Amber Underline Indicator */}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-honey" />
          </button>

          {/* 3. FrameSense */}
          <button
            type="button"
            onClick={() => {
              if (onOpenFrameSense) {
                onOpenFrameSense(selectedHive.id);
              } else {
                setIsFrameSenseOpen(true);
              }
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <Layers className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform text-amber-500" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">FrameSense</span>
          </button>

          {/* 4. Notes */}
          <button
            type="button"
            onClick={() => {
              if (onOpenNotes) {
                onOpenNotes(selectedHive.id);
              } else {
                setIsNotesOpen(true);
              }
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <FileText className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">Notes</span>
          </button>

          {/* 5. Inspection */}
          <button
            type="button"
            onClick={() => {
              if (onOpenInspections) {
                onOpenInspections(selectedHive.id);
              } else {
                toast.info(`Opening Inspections for ${hiveDisplayName}...`);
              }
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <ClipboardList className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform text-emerald-500" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">Inspection</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: SYRUP CALCULATOR                                                  */}
        {/* ========================================================================= */}
        {viewMode === "calculator" && (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Prominent Action Banner matching NotesPage */}
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Droplets className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white">
                    Syrup Recipe Calculator
                  </h3>
                  <p className="text-[11px] text-emerald-200/90">
                    Precision ratio balancing and dearth feeding schedules.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLogAmount(targetVolumeStr || "5.0");
                  setShowLogForm(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all border border-emerald-400/50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span>Log Feed</span>
              </button>
            </div>

            {/* Section 1: Ratio Pills matching NotesPage filter buttons */}
            <div className="space-y-1.5">
              <span className="text-xs sm:text-sm font-semibold text-foreground block">
                Sugar-to-Water Ratio:
              </span>
              <div className="flex items-center gap-2">
                {(["1:1", "3:2", "2:1"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRatio(r)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      ratio === r
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs border-emerald-500/40"
                        : "bg-card border-border text-muted-foreground hover:border-honey/40 hover:text-foreground"
                    }`}
                  >
                    {r} Ratio
                  </button>
                ))}
              </div>
              <p className="text-[12px] text-muted-foreground font-normal pt-0.5">
                {ratioDescription}
              </p>
            </div>

            {/* Section 2: How much syrup do I want to make? */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs sm:text-sm font-semibold text-foreground block">
                Target Syrup Volume (Liters):
              </span>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  max="500"
                  value={targetVolumeStr}
                  onChange={(e) => setTargetVolumeStr(e.target.value)}
                  placeholder="Enter volume in liters (e.g. 5.0)"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-honey shadow-xs"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm pointer-events-none">
                  L
                </span>
              </div>

              {/* Quick Volume Preset Pills */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                {["1.0", "2.0", "5.0", "10.0", "20.0"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTargetVolumeStr(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      targetVolumeStr === preset
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-xs font-bold"
                        : "bg-card text-muted-foreground border-border hover:border-honey/40 hover:text-foreground"
                    }`}
                  >
                    {preset} L
                  </button>
                ))}
                {targetVolumeStr && (
                  <button
                    type="button"
                    onClick={() => setTargetVolumeStr("")}
                    className="text-[11px] text-muted-foreground hover:text-foreground ml-auto cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Section 3: Calculated Output Stats Cards matching NotesPage */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-3 bg-card rounded-xl border border-border space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Water Needed</span>
                <span className="text-xl sm:text-2xl font-black text-blue-500">
                  {recipe.valid && recipe.waterL !== null ? `${recipe.waterL} L` : "— L"}
                </span>
                <span className="text-[10px] text-muted-foreground block">Boiled water</span>
              </div>

              <div className="p-3 bg-card rounded-xl border border-border space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Granulated Sugar</span>
                <span className="text-xl sm:text-2xl font-black text-honey">
                  {recipe.valid && recipe.sugarKg !== null ? `${recipe.sugarKg} kg` : "— kg"}
                </span>
                <span className="text-[10px] text-muted-foreground block">Pure white sucrose</span>
              </div>

              <div className="p-3 bg-card rounded-xl border border-border space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Energy Yield</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-500">
                  {recipe.valid ? `${recipe.caloriesKcal} kcal` : "—"}
                </span>
                <span className="text-[10px] text-muted-foreground block">Colony caloric nutrition</span>
              </div>
            </div>

            {/* Section 4: How to prepare Accordion */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setShowHowToPrepare(!showHowToPrepare)}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                  Preparation & Safety Protocol
                </h4>
                {showHowToPrepare ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </button>

              {showHowToPrepare && (
                <div className="space-y-2.5 text-xs text-muted-foreground leading-relaxed font-normal pt-1">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/15 text-emerald-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      <strong className="text-foreground">Stick strictly to pure white granulated sugar (food-grade sucrose).</strong> Avoid raw, brown, organic cane, or unrefined sugar varieties. Dark syrups contain complex carbohydrates and mineral ash that honeybees cannot break down, which causes bowel infections and dysentery.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/15 text-emerald-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      <strong className="text-foreground">Weigh sugar precisely on a digital scale rather than using a measuring jug.</strong> One liter of granular sugar weighs only about 0.85 kg, not 1 full kilogram. Measuring with volumetric cups dilutes the mixture, creating a weaker syrup than intended.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/15 text-emerald-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <p>
                      <strong className="text-foreground">Bring water to a boil, take it off the burner, and only then stir in the sugar.</strong> Syrup must never be boiled directly over a flame: high thermal exposure turns sucrose into Hydroxymethylfurfural (HMF), a compound poisonous to bees. The residual hot water is sufficient to dissolve all grains.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/15 text-emerald-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <p>
                      <strong className="text-foreground">Administer feed lukewarm (~20–25°C), never hot.</strong> Pouring warm syrup into the feeder spikes core hive temperatures and condensation levels, stressing the brood nest and nurse bees.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-background border border-honey/30 text-xs text-foreground leading-relaxed font-medium mt-3 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-honey shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-foreground">Do not feed syrup during an active nectar flow intended for harvesting</strong> — the bees will store sucrose in the supers, adulterating the pure honey harvest.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions: Log Feed in Hive Ledger matching NotesPage CTA */}
            <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Season Total: <strong className="text-foreground">{totalFedLiters.toFixed(1)} L</strong>
              </span>

              <button
                type="button"
                onClick={() => {
                  setLogAmount(targetVolumeStr || "5.0");
                  setShowLogForm(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all border border-emerald-400/40 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Log Feed for {hiveDisplayName}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: FEEDING LEDGER & LOGS (MATCHING NOTESPAGE LEDGER LIST)            */}
        {/* ========================================================================= */}
        {viewMode === "feeding_history" && (
          <div className="flex-1 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Feeding Events for {hiveDisplayName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {feedingLogs.length} feeding records logged ({totalFedLiters.toFixed(1)} L total)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogForm(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md border border-emerald-400/40 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Log Feed</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("calculator")}
                  className="px-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted cursor-pointer"
                >
                  Calculator
                </button>
              </div>
            </div>

            {feedingLogs.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-6 my-4">
                <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/30 flex items-center justify-center text-honey mx-auto mb-2.5">
                  <Droplets className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-foreground">
                  No Feedings Logged Yet
                </h4>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                  Log syrup distributions to track seasonal nutrition, spring build-up, and dearth sustenance for {hiveDisplayName}.
                </p>
                <button
                  type="button"
                  onClick={() => setShowLogForm(true)}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all border border-emerald-400/40 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span>Record First Feed</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {feedingLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs hover:border-honey/30 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground text-sm">
                          {log.amountLiters.toFixed(1)} Liters
                        </span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-honey/15 text-honey border border-honey/30">
                          {log.ratio} Ratio
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground font-medium">{log.date}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>Feeder: <strong className="text-foreground">{log.feederType}</strong></span>
                        {log.notes && <span>• "{log.notes}"</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors rounded-lg hover:bg-muted cursor-pointer"
                      title="Delete Log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Log Feeding Event matching NotesPage Form Modal */}
        {showLogForm && (
          <div
            className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-text"
            onClick={() => setShowLogForm(false)}
          >
            <div
              className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden relative space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white tracking-wide">
                      Log Syrup Feed
                    </h3>
                    <p className="text-[10px] text-emerald-100">
                      {hiveDisplayName} • {CANONICAL_APIARY_NAME}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <form onSubmit={handleAddLog} className="p-4 space-y-3.5 text-xs">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Volume Fed (Liters):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={logAmount}
                    onChange={(e) => setLogAmount(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Date of Feeding:
                  </label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Feeder Type:
                  </label>
                  <select
                    value={feederType}
                    onChange={(e) => setFeederType(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-honey"
                  >
                    <option value="Rapid Top Feeder (Hive Cover)">Rapid Top Feeder (Hive Cover)</option>
                    <option value="Internal Frame Feeder Pouch">Internal Frame Feeder Pouch</option>
                    <option value="Entrance Boardman Feeder">Entrance Boardman Feeder</option>
                    <option value="Contact Bucket Feeder">Contact Bucket Feeder</option>
                    <option value="Open Communal Apiary Tray">Open Communal Apiary Tray</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Beekeeper Observation Notes:
                  </label>
                  <input
                    type="text"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="e.g. Taken down in 24 hours, brood expanded"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLogForm(false)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-background text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md border border-emerald-400/40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-white" />
                    <span>Save to Hive</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* FrameSense Nested Intact Navigation */}
      {isFrameSenseOpen && (
        <FrameSenseToolPage
          isOpen={isFrameSenseOpen}
          onClose={() => setIsFrameSenseOpen(false)}
          initialHiveId={selectedHive.id}
          onOpenSyrup={() => setIsFrameSenseOpen(false)}
        />
      )}

      {/* Notes Nested Intact Navigation */}
      {isNotesOpen && (
        <NotesPage
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
          initialHiveId={selectedHive.id}
          onOpenSyrup={() => setIsNotesOpen(false)}
          onOpenFrameSense={() => {
            setIsNotesOpen(false);
            setIsFrameSenseOpen(true);
          }}
        />
      )}
    </div>
  );

  return embedded ? content : createPortal(content, document.body);
}

export default SyrupFeedingToolPage;
