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

  // Sub-nav tab: "syrup" (active), "hive_state", "framesense", "notes", "inspection"
  const [activeSubTab, setActiveSubTab] = useState<"syrup" | "hive_state" | "framesense" | "notes" | "inspection">("syrup");

  // Local FrameSense and Notes intact navigation
  const [isFrameSenseOpen, setIsFrameSenseOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  // View mode inside Syrup: "calculator" vs "feeding_history"
  const [viewMode, setViewMode] = useState<"calculator" | "feeding_history">("calculator");

  // Calculator State (defaults matching screenshot: 3:2 ratio)
  const [ratio, setRatio] = useState<"1:1" | "3:2" | "2:1">("3:2");
  const [targetVolumeStr, setTargetVolumeStr] = useState<string>("");
  const [showHowToPrepare, setShowHowToPrepare] = useState(true);

  // Feeding Log Form
  const [showLogForm, setShowLogForm] = useState(false);
  const [logAmount, setLogAmount] = useState<string>("5.0");
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [feederType, setFeederType] = useState<string>("Rapid Top Feeder (Hive Cover)");
  const [logNotes, setLogNotes] = useState<string>("Mid-season dearth nourishment");

  // Feeding History stored per hive
  const [feedingLogs, setFeedingLogs] = useState<SyrupFeedLog[]>([]);

  // Load history for selected hive
  useEffect(() => {
    if (!selectedHive?.id) return;
    try {
      const stored = localStorage.getItem(`syrup_feeding_${selectedHive.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFeedingLogs(parsed);
          return;
        }
      }
    } catch {}

    // Default canonical records for active producing hives
    const isStandby = (selectedHive.status || "").toLowerCase() === "standby" || !selectedHive.hasColony;
    if (isStandby) {
      setFeedingLogs([]);
    } else {
      const defaults: SyrupFeedLog[] = [
        {
          id: `feed-${selectedHive.id}-1`,
          hiveId: selectedHive.id,
          hiveCode: hiveDisplayName,
          date: "2026-09-18",
          amountLiters: 5.0,
          ratio: "3:2",
          feederType: "Rapid Top Feeder (Hive Cover)",
          notes: "Mid-season dearth nourishment before acacia burst",
        },
        {
          id: `feed-${selectedHive.id}-2`,
          hiveId: selectedHive.id,
          hiveCode: hiveDisplayName,
          date: "2026-09-02",
          amountLiters: 4.0,
          ratio: "1:1",
          feederType: "Rapid Top Feeder (Hive Cover)",
          notes: "Stimulated queen egg laying",
        },
      ];
      setFeedingLogs(defaults);
      try {
        localStorage.setItem(`syrup_feeding_${selectedHive.id}`, JSON.stringify(defaults));
      } catch {}
    }
  }, [selectedHive?.id, hiveDisplayName, selectedHive.status, selectedHive.hasColony]);

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
        return "Thin — spring stimulation, brood rearing";
      case "3:2":
        return "Medium — all-purpose, summer and autumn";
      case "2:1":
        return "Thick — winter feed, rapid stores build-up";
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

  // Intact page view: NOT a popup card, but an intact full-height view that fills the viewport edge-to-edge
  const content = (
    <div
      className={
        embedded
          ? "w-full max-w-xl mx-auto py-2"
          : "fixed inset-0 z-[100] bg-[#FAF5EE] dark:bg-stone-950 overflow-y-auto flex flex-col animate-in fade-in duration-150 select-text"
      }
    >
      <div
        className={`w-full max-w-lg mx-auto flex-1 flex flex-col p-4 sm:p-6 text-[#2E2A25] dark:text-stone-100 min-h-screen ${
          embedded ? "h-auto min-h-0" : ""
        }`}
      >
        {/* TOP BAR: Back Arrow and Menu */}
        <div className="flex items-center justify-between pb-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -ml-1 text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                toast.info(`${hiveDisplayName} • ${CANONICAL_APIARY_NAME} (${selectedHive.frame_count || 10} Frames)`);
              }}
              className="p-1.5 rounded-full text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HIVE TITLE: beeyield 001 with selector dropdown */}
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div className="relative group">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
              {hiveDisplayName}
              <select
                value={selectedHive.id}
                onChange={(e) => setSelectedHiveId(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                title="Switch Hive"
              >
                {allHives.map((h) => {
                  const num = h.code?.replace(/\D+/g, "") || "";
                  const label = num ? `beeyield ${num.padStart(3, "0")}` : h.name;
                  return (
                    <option key={h.id} value={h.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-5 h-5 text-stone-400 group-hover:text-amber-600 transition-colors pointer-events-none" />
            </h1>
          </div>

          {/* Quick Feeding Ledger Switcher */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "calculator" ? "feeding_history" : "calculator")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "feeding_history"
                ? "bg-amber-500 text-stone-950 shadow-xs"
                : "bg-[#EFE8DC] dark:bg-stone-800 hover:bg-[#EAE0D0] text-stone-700 dark:text-stone-300"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Ledger</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px]">
              {feedingLogs.length}
            </span>
          </button>
        </div>

        {/* SUB-NAV TOOL BAR: Hive state | Syrup | FrameSense | Notes | Inspection */}
        <div className="flex items-center justify-between border-b border-stone-200/90 dark:border-stone-800 pb-2 mb-4 shrink-0 overflow-x-auto no-scrollbar gap-2 text-center">
          {/* 1. Hive state */}
          <button
            type="button"
            onClick={() => {
              toast.info(`${hiveDisplayName} Colony: Active & Healthy (${selectedHive.frame_count || 10} Frames)`);
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 transition-colors cursor-pointer group"
          >
            <Activity className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">Hive state</span>
          </button>

          {/* 2. Syrup (Active) */}
          <button
            type="button"
            onClick={() => {
              setViewMode("calculator");
              setActiveSubTab("syrup");
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-amber-700 dark:text-amber-400 relative cursor-pointer group font-bold"
          >
            <Droplets className="w-5 h-5 mb-1 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] leading-none whitespace-nowrap">Syrup</span>
            {/* Active Amber Underline Indicator */}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-amber-600 dark:bg-amber-400" />
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
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer group"
          >
            <Layers className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform text-stone-600 dark:text-stone-400" />
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
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer group"
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
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer group"
          >
            <ClipboardList className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">Inspection</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: SYRUP CALCULATOR (EXACT SCREENSHOT IMPLEMENTATION) */}
        {/* ========================================================================= */}
        {viewMode === "calculator" && (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Title: Syrup calculator */}
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              Syrup calculator
            </h2>

            {/* Section 1: Ratio */}
            <div className="space-y-1.5">
              <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 block">
                Ratio:
              </span>
              <div className="flex items-center gap-2">
                {(["1:1", "3:2", "2:1"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRatio(r)}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      ratio === r
                        ? "bg-[#F9E2B3] dark:bg-amber-500/25 border border-amber-300 dark:border-amber-600/40 text-stone-900 dark:text-amber-200 shadow-xs"
                        : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-[12px] sm:text-[13px] text-stone-600 dark:text-stone-400 font-normal pt-0.5">
                {ratioDescription}
              </p>
            </div>

            {/* Section 2: How much syrup do I want to make? */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 block">
                How much syrup do I want to make?
              </span>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  max="500"
                  value={targetVolumeStr}
                  onChange={(e) => setTargetVolumeStr(e.target.value)}
                  placeholder="Enter a value"
                  className="w-full bg-[#F5EDE3] dark:bg-stone-900/90 border border-[#E8DEC9] dark:border-stone-800 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-semibold text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-sm pointer-events-none">
                  l
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
                        ? "bg-amber-500 text-stone-950 border-amber-500 shadow-xs font-bold"
                        : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-amber-400"
                    }`}
                  >
                    {preset} L
                  </button>
                ))}
                {targetVolumeStr && (
                  <button
                    type="button"
                    onClick={() => setTargetVolumeStr("")}
                    className="text-[11px] text-stone-400 hover:text-stone-600 ml-auto cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Section 3: Calculated Water & Sugar Output Card */}
            <div className="bg-[#F5EDE3] dark:bg-stone-900/90 rounded-2xl border border-[#E8DEC9] dark:border-stone-800 p-4 sm:p-5 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400 block">
                  Water
                </span>
                <span className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                  {recipe.valid && recipe.waterL !== null ? `${recipe.waterL} l` : "— l"}
                </span>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400 block">
                  Sugar
                </span>
                <span className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                  {recipe.valid && recipe.sugarKg !== null ? `${recipe.sugarKg} kg` : "— kg"}
                </span>
              </div>
            </div>

            {/* Section 4: How to prepare Accordion */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setShowHowToPrepare(!showHowToPrepare)}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                  How to prepare
                </h3>
                {showHowToPrepare ? (
                  <ChevronUp className="w-4 h-4 text-stone-500 group-hover:text-stone-900 dark:group-hover:text-stone-200 transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-500 group-hover:text-stone-900 dark:group-hover:text-stone-200 transition-colors" />
                )}
              </button>

              {showHowToPrepare && (
                <div className="space-y-3 text-xs sm:text-[12.5px] text-stone-700 dark:text-stone-300 leading-relaxed font-normal pt-1">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      <strong className="text-stone-900 dark:text-white">Stick strictly to pure white granulated sugar (food-grade sucrose).</strong> Avoid raw, brown, organic cane, or unrefined sugar varieties. Dark syrups contain complex carbohydrates and mineral ash that honeybees cannot break down, which quickly causes fatal bowel infections and dysentery.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      <strong className="text-stone-900 dark:text-white">Weigh sugar precisely on a digital scale rather than using a measuring jug.</strong> One liter of granular sugar weighs only about 0.85 kg, not 1 full kilogram. Measuring with volumetric cups dilutes the mixture, creating a weaker syrup than intended.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <p>
                      <strong className="text-stone-900 dark:text-white">Bring water to a boil, take it off the burner, and only then stir in the sugar.</strong> Syrup must never be boiled directly over a flame: high thermal exposure turns sucrose into Hydroxymethylfurfural (HMF), a compound poisonous to bees. The residual hot water is entirely sufficient to dissolve all grains.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <p>
                      <strong className="text-stone-900 dark:text-white">Pour sugar in gradual portions and stir until the solution turns clear.</strong> Granules left at the bottom of the feeder will be ignored by bees and accelerate crystallization throughout the feeder. Thick 2:1 winter feed sits right at maximum physical solubility, requiring very hot water and steady stirring.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      5
                    </span>
                    <p>
                      <strong className="text-stone-900 dark:text-white">Administer feed lukewarm (~20–25°C), never hot.</strong> Pouring warm syrup into the feeder spikes core hive temperatures and condensation levels, stressing the brood nest and nurse bees.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      6
                    </span>
                    <p>
                      <strong className="text-stone-900 dark:text-white">Mix only the volume your colony will finish within 48 to 72 hours.</strong> Syrup sitting stagnant inside the hive or bucket rapidly attracts wild yeasts and ferments. Feeding fermented syrup ruins gut health and causes severe winter dysentery.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      7
                    </span>
                    <p>
                      <strong className="text-stone-900 dark:text-white">Prevent spills around the hive stand and keep all feeding vessels sealed.</strong> The exposed scent of sugar syrup during a nectar dearth incites frantic robbing frenzies, causing neighboring foragers and wasps to invade and destroy weaker colonies. Rinse accidental drops immediately with water.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      8
                    </span>
                    <p>
                      <strong className="text-stone-900 dark:text-white">Inspect feeder uptake within 2 to 4 days of application.</strong> Verify that the colony is actively consuming the feed. If syrup sits untouched, inspect immediately for queenlessness, disease, feeder obstruction, or an early natural honey flow.
                    </p>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#F5EDE3] dark:bg-amber-950/20 border border-[#E8DEC9] dark:border-amber-900/30 text-xs sm:text-[12.5px] text-stone-800 dark:text-amber-200/90 leading-relaxed font-medium mt-3 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-stone-900 dark:text-white">Do not feed syrup during an active nectar flow intended for harvesting</strong> — the bees will store sucrose in the supers, adulterating the pure honey harvest.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions: Log Feed in Hive Ledger */}
            <div className="mt-auto pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Season Total: <strong>{totalFedLiters.toFixed(1)} L</strong>
              </span>

              <button
                type="button"
                onClick={() => {
                  setLogAmount(targetVolumeStr || "5.0");
                  setShowLogForm(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-[0.98] text-stone-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Log Feed for {hiveDisplayName}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: FEEDING LEDGER & LOGS */}
        {/* ========================================================================= */}
        {viewMode === "feeding_history" && (
          <div className="flex-1 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                  Feeding Events for {hiveDisplayName}
                </h3>
                <p className="text-xs text-stone-500">
                  {feedingLogs.length} feeding records logged ({totalFedLiters.toFixed(1)} L total)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogForm(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Feed</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("calculator")}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Calculator
                </button>
              </div>
            </div>

            {feedingLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 my-4 space-y-2">
                <Droplets className="w-10 h-10 text-stone-400 mb-1 stroke-[1.5]" />
                <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">
                  No Feedings Logged Yet
                </h4>
                <p className="text-xs text-stone-500 max-w-sm">
                  Log syrup distributions to track seasonal nutrition, spring build-up, and dearth sustenance for {hiveDisplayName}.
                </p>
                <button
                  type="button"
                  onClick={() => setShowLogForm(true)}
                  className="mt-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer"
                >
                  Record First Feed
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {feedingLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm">
                          {log.amountLiters.toFixed(1)} Liters
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold text-[10px]">
                          {log.ratio} Ratio
                        </span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-600 dark:text-stone-400 font-medium">{log.date}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2">
                        <span>Feeder: <strong>{log.feederType}</strong></span>
                        {log.notes && <span>• "{log.notes}"</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
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

        {/* Modal: Log Feeding Event */}
        {showLogForm && (
          <div
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in select-text"
            onClick={() => setShowLogForm(false)}
          >
            <div
              className="w-full max-w-md bg-[#FAF4EE] dark:bg-stone-900 rounded-3xl p-6 border border-stone-300 dark:border-stone-800 shadow-2xl relative space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-300 dark:border-stone-800">
                <span className="font-bold text-base text-stone-900 dark:text-white">
                  Log Syrup Feed for {hiveDisplayName}
                </span>
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="p-1 rounded-full text-stone-500 hover:text-stone-950 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddLog} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 block mb-1">
                    Volume Fed (Liters):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={logAmount}
                    onChange={(e) => setLogAmount(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-stone-900 dark:text-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 block mb-1">
                    Date of Feeding:
                  </label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 dark:text-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 block mb-1">
                    Feeder Type:
                  </label>
                  <select
                    value={feederType}
                    onChange={(e) => setFeederType(e.target.value)}
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 dark:text-white focus:outline-none focus:border-amber-600"
                  >
                    <option value="Rapid Top Feeder (Hive Cover)">Rapid Top Feeder (Hive Cover)</option>
                    <option value="Internal Frame Feeder Pouch">Internal Frame Feeder Pouch</option>
                    <option value="Entrance Boardman Feeder">Entrance Boardman Feeder</option>
                    <option value="Contact Bucket Feeder">Contact Bucket Feeder</option>
                    <option value="Open Communal Apiary Tray">Open Communal Apiary Tray</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 block mb-1">
                    Beekeeper Observation Notes:
                  </label>
                  <input
                    type="text"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="e.g. Taken down in 24 hours, brood expanded"
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLogForm(false)}
                    className="px-4 py-2 rounded-full border border-stone-800 text-stone-900 dark:text-stone-100 font-medium text-xs hover:bg-stone-200/50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Save to Hive
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
