import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Droplets,
  Calculator,
  Plus,
  Trash2,
  ChevronLeft,
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
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  resolveUserHives,
  UnifiedHive,
  CANONICAL_TIMOTHY_HIVES,
} from "@/lib/user-hives";
import { CANONICAL_APIARY_NAME } from "@/lib/apiary-normalization";

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
}

export function SyrupFeedingToolPage({
  isOpen,
  onClose,
  initialHiveId,
  embedded = false,
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

  const hiveDisplayName = selectedHive.code || selectedHive.hive_code || selectedHive.name;

  // Mode: "calculator" vs "feeding_history"
  const [activeTab, setActiveTab] = useState<"calculator" | "feeding_history">("calculator");

  // Calculator State
  const [ratio, setRatio] = useState<"1:1" | "3:2" | "2:1">("1:1");
  const [targetVolumeStr, setTargetVolumeStr] = useState<string>("5.0");
  const [showHowToPrepare, setShowHowToPrepare] = useState(true);

  // Feeding Log Form
  const [showLogForm, setShowLogForm] = useState(false);
  const [logAmount, setLogAmount] = useState<string>("5.0");
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [feederType, setFeederType] = useState<string>("Rapid Top Feeder (Hive Cover)");
  const [logNotes, setLogNotes] = useState<string>("Spring nectar stimulation");

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
          ratio: "1:1",
          feederType: "Rapid Top Feeder (Hive Cover)",
          notes: "Pre-flowering nectar stimulation before acacia burst",
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

  // Recipe calculation
  const recipe = useMemo(() => {
    const v = parseFloat(targetVolumeStr);
    if (isNaN(v) || v <= 0) {
      return { waterL: 0, sugarKg: 0, caloriesKcal: 0, valid: false };
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

    // 1 kg pure sucrose = ~3,870 kcal
    const calories = Math.round(sugarKg * 3870);

    return {
      waterL: parseFloat(waterL.toFixed(2)),
      sugarKg: parseFloat(sugarKg.toFixed(2)),
      caloriesKcal: calories,
      valid: true,
    };
  }, [ratio, targetVolumeStr]);

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

  const content = (
    <div
      className={
        embedded
          ? "w-full max-w-4xl mx-auto space-y-6"
          : "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      }
      onClick={!embedded ? (e) => e.target === e.currentTarget && onClose() : undefined}
    >
      <div
        className={`w-full max-w-3xl bg-[#FAF4EE] min-h-[580px] max-h-[92vh] rounded-[28px] shadow-2xl overflow-y-auto flex flex-col p-6 sm:p-7 text-[#2E2A25] border border-stone-300/60 relative ${
          embedded ? "h-auto" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-300/60 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {!embedded && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -ml-1 text-stone-800 hover:text-stone-950 rounded-xl hover:bg-stone-200/50 transition-colors"
                aria-label="Back"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2]" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500/20 text-amber-800 border border-amber-500/30">
                  <Droplets className="w-4 h-4 text-amber-700" />
                </span>
                <h2 className="text-xl font-bold tracking-tight text-stone-900 font-sans">
                  Syrup Calculator & Nutrition
                </h2>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Precision recipe formulation & hive feeding ledger
              </p>
            </div>
          </div>

          {/* Synced Hive Selector Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#EFE8DE] px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-medium">
              <span className="text-stone-500 text-[11px] font-bold">Hive:</span>
              <select
                value={selectedHive.id}
                onChange={(e) => {
                  setSelectedHiveId(e.target.value);
                }}
                className="bg-transparent font-bold text-stone-900 border-none outline-none text-xs cursor-pointer"
              >
                {allHives.map((h) => {
                  const num = h.code?.replace(/\D+/g, "") || "";
                  const label = num ? `KIB-${num.padStart(3, "0")}` : h.name;
                  const isStandby = (h.status || "").toLowerCase() === "standby" || !h.hasColony;
                  return (
                    <option key={h.id} value={h.id} className="bg-[#FAF4EE] text-stone-900">
                      {label} {isStandby ? "(Standby)" : "(Active Colony)"}
                    </option>
                  );
                })}
              </select>
            </div>

            {!embedded && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Selected Hive Live Banner */}
        <div className="my-3.5 p-3 bg-[#EFE8DE]/70 rounded-2xl border border-stone-300/70 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-stone-900">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>{hiveDisplayName}</span>
            <span className="text-stone-500 font-normal">
              • {CANONICAL_APIARY_NAME} ({selectedHive.frame_count || 10} Frames)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-700 bg-white/70 px-2.5 py-0.5 rounded-md border border-stone-300">
              Season Total: {totalFedLiters.toFixed(1)} L Fed
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-stone-300/50 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "calculator"
                ? "bg-[#FFB800] text-stone-950 shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/40"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Recipe Calculator</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("feeding_history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "feeding_history"
                ? "bg-[#FFB800] text-stone-950 shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/40"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hive Feeding Ledger ({feedingLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: Calculator */}
        {activeTab === "calculator" && (
          <div className="space-y-4 flex-1">
            {/* Ratio Selector Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">Select Feeding Ratio:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRatio("1:1")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    ratio === "1:1"
                      ? "border-stone-900 bg-[#E8DDD1] text-stone-950 shadow-sm font-semibold"
                      : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
                  }`}
                >
                  <div className="text-xs font-extrabold text-stone-900">1:1 Ratio</div>
                  <div className="text-[11px] text-stone-600 mt-0.5">Spring Stimulant</div>
                  <div className="text-[10px] text-amber-700 font-bold mt-1">1 kg sugar : 1 L water</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRatio("3:2")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    ratio === "3:2"
                      ? "border-stone-900 bg-[#E8DDD1] text-stone-950 shadow-sm font-semibold"
                      : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
                  }`}
                >
                  <div className="text-xs font-extrabold text-stone-900">3:2 Ratio</div>
                  <div className="text-[11px] text-stone-600 mt-0.5">Mid-Season Dearth</div>
                  <div className="text-[10px] text-amber-700 font-bold mt-1">1.5 kg sugar : 1 L water</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRatio("2:1")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    ratio === "2:1"
                      ? "border-stone-900 bg-[#E8DDD1] text-stone-950 shadow-sm font-semibold"
                      : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
                  }`}
                >
                  <div className="text-xs font-extrabold text-stone-900">2:1 Ratio</div>
                  <div className="text-[11px] text-stone-600 mt-0.5">Winter / Emergency</div>
                  <div className="text-[10px] text-amber-700 font-bold mt-1">2 kg sugar : 1 L water</div>
                </button>
              </div>
            </div>

            {/* Target Volume Input & Presets */}
            <div className="p-4 bg-white rounded-2xl border border-stone-300/80 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900">
                  Target Syrup Volume:
                </label>
                <span className="text-xs text-stone-500 font-mono">
                  {recipe.valid ? `${targetVolumeStr} Liters Target` : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="500"
                  value={targetVolumeStr}
                  onChange={(e) => setTargetVolumeStr(e.target.value)}
                  placeholder="e.g. 5.0"
                  className="w-32 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                />
                <span className="text-xs text-stone-600 font-bold">Liters (L)</span>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                  {["2.0", "5.0", "10.0", "20.0", "50.0"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetVolumeStr(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        targetVolumeStr === preset
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                      }`}
                    >
                      {preset} L
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Recipe Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3.5 bg-[#FAF4EE] rounded-2xl border border-amber-300/70 shadow-sm">
                <span className="text-[11px] font-bold text-stone-500 block">Pure Cane Sugar</span>
                <span className="text-2xl font-extrabold text-amber-800 font-mono">
                  {recipe.valid ? recipe.sugarKg : "–"}
                </span>
                <span className="text-[11px] text-stone-600 font-semibold block mt-0.5">Kilograms (kg)</span>
              </div>

              <div className="p-3.5 bg-[#FAF4EE] rounded-2xl border border-blue-300/70 shadow-sm">
                <span className="text-[11px] font-bold text-stone-500 block">Warm Filtered Water</span>
                <span className="text-2xl font-extrabold text-blue-800 font-mono">
                  {recipe.valid ? recipe.waterL : "–"}
                </span>
                <span className="text-[11px] text-stone-600 font-semibold block mt-0.5">Liters (L)</span>
              </div>

              <div className="p-3.5 bg-[#FAF4EE] rounded-2xl border border-stone-300 shadow-sm">
                <span className="text-[11px] font-bold text-stone-500 block">Yield Volume</span>
                <span className="text-2xl font-extrabold text-stone-900 font-mono">
                  {recipe.valid ? targetVolumeStr : "–"}
                </span>
                <span className="text-[11px] text-stone-600 font-semibold block mt-0.5">Total Liters (L)</span>
              </div>

              <div className="p-3.5 bg-[#FAF4EE] rounded-2xl border border-emerald-300/70 shadow-sm">
                <span className="text-[11px] font-bold text-stone-500 block">Caloric Energy</span>
                <span className="text-xl font-extrabold text-emerald-800 font-mono">
                  {recipe.valid ? recipe.caloriesKcal.toLocaleString() : "–"}
                </span>
                <span className="text-[11px] text-stone-600 font-semibold block mt-0.5">Total kcal</span>
              </div>
            </div>

            {/* Preparation Accordion / Safety Notes */}
            <div className="p-4 bg-white rounded-2xl border border-stone-300/80 space-y-2 text-xs">
              <div
                className="flex items-center justify-between cursor-pointer font-bold text-stone-900"
                onClick={() => setShowHowToPrepare(!showHowToPrepare)}
              >
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  Preparation Rules & HMF Thermal Safety
                </span>
                <span className="text-stone-400 text-sm">{showHowToPrepare ? "▲" : "▼"}</span>
              </div>

              {showHowToPrepare && (
                <div className="pt-2 border-t border-stone-200 space-y-2 text-stone-700 leading-relaxed">
                  <p>
                    <strong>1. Temperature Limit (&lt; 50°C / 122°F):</strong> Never boil syrup with sugar.
                    Boiling sucrose creates Hydroxymethylfurfural (HMF), a compound toxic to honeybee
                    digestive systems. Heat water gently, turn off flame, and then dissolve sugar.
                  </p>
                  <p>
                    <strong>2. Timing:</strong> Feed exclusively at dusk or late afternoon to prevent scout
                    bees from other apiaries initiating robbing attacks.
                  </p>
                  <p>
                    <strong>3. Feeders:</strong> Use internal rapid top feeders or frame pouches with
                    roughened ladders or bee floats to prevent drowning.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-stone-300/60">
              <span className="text-xs text-stone-500">
                Ready to feed {hiveDisplayName}?
              </span>
              <button
                type="button"
                onClick={() => {
                  setLogAmount(targetVolumeStr);
                  setShowLogForm(true);
                }}
                className="px-6 py-2.5 rounded-full bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Log Feeding Event for {hiveDisplayName}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Hive Feeding Ledger */}
        {activeTab === "feeding_history" && (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-stone-900">
                  Feeding Events for {hiveDisplayName}
                </h3>
                <p className="text-xs text-stone-500">
                  {feedingLogs.length} feeding records logged ({totalFedLiters.toFixed(1)} L total)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogForm(true)}
                className="px-4 py-2 rounded-full bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Feed</span>
              </button>
            </div>

            {feedingLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-stone-300 my-4">
                <Droplets className="w-10 h-10 text-stone-400 mb-2 stroke-[1.5]" />
                <h4 className="font-bold text-sm text-stone-800">No Feedings Logged Yet</h4>
                <p className="text-xs text-stone-500 max-w-sm mt-1">
                  Log syrup distributions to track seasonal nutrition, spring build-up, and dearth sustenance for {hiveDisplayName}.
                </p>
                <button
                  type="button"
                  onClick={() => setShowLogForm(true)}
                  className="mt-4 px-5 py-2 rounded-full bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-xs"
                >
                  Record First Feed
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {feedingLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-white border border-stone-300/80 shadow-sm flex items-center justify-between flex-wrap gap-2 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900 text-sm">
                          {log.amountLiters.toFixed(1)} Liters
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                          {log.ratio} Ratio
                        </span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-600 font-medium">{log.date}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2">
                        <span>Feeder: <strong>{log.feederType}</strong></span>
                        {log.notes && <span>• "{log.notes}"</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors rounded-lg hover:bg-stone-100"
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
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in"
            onClick={() => setShowLogForm(false)}
          >
            <div
              className="w-full max-w-md bg-[#FAF4EE] rounded-3xl p-6 border border-stone-300 shadow-2xl relative space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-300">
                <span className="font-bold text-base text-stone-900">
                  Log Syrup Feed for {hiveDisplayName}
                </span>
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="p-1 rounded-full text-stone-500 hover:text-stone-950"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddLog} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">
                    Volume Fed (Liters):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={logAmount}
                    onChange={(e) => setLogAmount(e.target.value)}
                    required
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">
                    Date of Feeding:
                  </label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    required
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">
                    Feeder Type:
                  </label>
                  <select
                    value={feederType}
                    onChange={(e) => setFeederType(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:border-amber-600"
                  >
                    <option value="Rapid Top Feeder (Hive Cover)">Rapid Top Feeder (Hive Cover)</option>
                    <option value="Internal Frame Feeder Pouch">Internal Frame Feeder Pouch</option>
                    <option value="Entrance Boardman Feeder">Entrance Boardman Feeder</option>
                    <option value="Contact Bucket Feeder">Contact Bucket Feeder</option>
                    <option value="Open Communal Apiary Tray">Open Communal Apiary Tray</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">
                    Beekeeper Observation Notes:
                  </label>
                  <input
                    type="text"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="e.g. Taken down in 24 hours, brood expanded"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLogForm(false)}
                    className="px-4 py-2 rounded-full border border-stone-800 text-stone-900 font-medium text-xs hover:bg-stone-200/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-xs"
                  >
                    Save to Hive
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return embedded ? content : createPortal(content, document.body);
}

export default SyrupFeedingToolPage;
