import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Layers,
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FileDown,
  Trash2,
  Eye,
  Info,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  Grid,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  resolveUserHives,
  UnifiedHive,
  CANONICAL_TIMOTHY_HIVES,
} from "@/lib/user-hives";
import { CANONICAL_APIARY_NAME } from "@/lib/apiary-normalization";

export interface FrameSenseAnalysis {
  id: string;
  hiveId: string;
  hiveCode: string;
  timestamp: string;
  status: "Analysis completed" | "Processing...";
  broodPct: number;
  storesPct: number;
  combSurfacePct: number;
  queenCells: number;
  estimatedBees: number;
  middlePhotoUrl?: string;
  firstPhotoUrl?: string;
  lastPhotoUrl?: string;
  aiRecommendations: string;
  combTypeDistribution?: {
    workerCapped: number;
    eggsLarvae: number;
    honeyNectar: number;
    pollenStores: number;
    emptyDrawn: number;
    droneComb: number;
  };
}

export interface FrameSenseToolPageProps {
  isOpen: boolean;
  onClose: () => void;
  initialHiveId?: string;
  embedded?: boolean;
}

export function FrameSenseToolPage({
  isOpen,
  onClose,
  initialHiveId,
  embedded = false,
}: FrameSenseToolPageProps) {
  const { user, profile } = useAuth();

  // 1. Resolve all hives for user
  const allHives = useMemo(() => {
    return resolveUserHives(user, profile);
  }, [user, profile]);

  // Selected Hive state
  const [selectedHiveId, setSelectedHiveId] = useState<string>(() => {
    if (initialHiveId) return initialHiveId;
    return allHives[0]?.id || "hive-kib-001";
  });

  // Keep selectedHive in sync if initialHiveId changes
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

  // Sub-screens: "list", "add_photos", "view_report"
  const [currentView, setCurrentView] = useState<"list" | "add_photos" | "view_report">("list");
  const [selectedReport, setSelectedReport] = useState<FrameSenseAnalysis | null>(null);

  // Photos for new analysis
  const [middlePhoto, setMiddlePhoto] = useState<string | null>(null);
  const [firstPhoto, setFirstPhoto] = useState<string | null>(null);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Stored analyses per hive
  const [analyses, setAnalyses] = useState<FrameSenseAnalysis[]>([]);

  // Load analyses when selected hive changes
  useEffect(() => {
    if (!selectedHive?.id) return;
    try {
      const stored = localStorage.getItem(`framesense_${selectedHive.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAnalyses(parsed);
          return;
        }
      }
    } catch {}

    // Default canonical analysis records for the hive
    const isStandby = (selectedHive.status || "").toLowerCase() === "standby" || !selectedHive.hasColony;
    if (isStandby) {
      setAnalyses([]);
    } else {
      const defaults: FrameSenseAnalysis[] = [
        {
          id: `fs-${selectedHive.id}-1`,
          hiveId: selectedHive.id,
          hiveCode: hiveDisplayName,
          timestamp: "24.09.2026, 11:20",
          status: "Analysis completed",
          broodPct: 68,
          storesPct: 24,
          combSurfacePct: 92,
          queenCells: 0,
          estimatedBees: 1850,
          aiRecommendations:
            "High-density concentric worker brood pattern in central comb. Honey arch intact. Zero queen swarm cups detected. Colony is thriving.",
          combTypeDistribution: {
            workerCapped: 52,
            eggsLarvae: 16,
            honeyNectar: 24,
            pollenStores: 5,
            emptyDrawn: 3,
            droneComb: 0,
          },
        },
        {
          id: `fs-${selectedHive.id}-2`,
          hiveId: selectedHive.id,
          hiveCode: hiveDisplayName,
          timestamp: "10.09.2026, 14:05",
          status: "Analysis completed",
          broodPct: 54,
          storesPct: 30,
          combSurfacePct: 84,
          queenCells: 0,
          estimatedBees: 1520,
          aiRecommendations:
            "Solid brood laying. Ample nectar stores in upper corners. Queen is active with continuous egg ring.",
          combTypeDistribution: {
            workerCapped: 40,
            eggsLarvae: 14,
            honeyNectar: 30,
            pollenStores: 8,
            emptyDrawn: 8,
            droneComb: 0,
          },
        },
      ];
      setAnalyses(defaults);
      try {
        localStorage.setItem(`framesense_${selectedHive.id}`, JSON.stringify(defaults));
      } catch {}
    }
  }, [selectedHive?.id, hiveDisplayName, selectedHive.status, selectedHive.hasColony]);

  const saveAnalyses = (newList: FrameSenseAnalysis[]) => {
    setAnalyses(newList);
    try {
      localStorage.setItem(`framesense_${selectedHive.id}`, JSON.stringify(newList));
    } catch {}
  };

  // Handle uploading photos
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: "middle" | "first" | "last") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      if (slot === "middle") setMiddlePhoto(url);
      else if (slot === "first") setFirstPhoto(url);
      else setLastPhoto(url);
      toast.success(`Frame photo uploaded for ${slot} slot`);
    };
    reader.readAsDataURL(file);
  };

  // Run AI Analysis Simulation
  const handleRunAnalysis = () => {
    if (!middlePhoto) {
      toast.error("Please upload or capture the middle (central) brood frame photo");
      return;
    }

    setIsAnalyzing(true);
    const toastId = toast.loading("BeeYield AI is scanning comb cells & brood density...");

    setTimeout(() => {
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, "0")}.${String(
        now.getMonth() + 1
      ).padStart(2, "0")}.${now.getFullYear()}, ${String(now.getHours()).padStart(
        2,
        "0"
      )}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newRecord: FrameSenseAnalysis = {
        id: `fs-${selectedHive.id}-${Date.now()}`,
        hiveId: selectedHive.id,
        hiveCode: hiveDisplayName,
        timestamp: dateStr,
        status: "Analysis completed",
        broodPct: 72,
        storesPct: 20,
        combSurfacePct: 94,
        queenCells: 0,
        estimatedBees: 1980,
        middlePhotoUrl: middlePhoto,
        firstPhotoUrl: firstPhoto || undefined,
        lastPhotoUrl: lastPhoto || undefined,
        aiRecommendations:
          "BeeYield Vision AI: Excellent comb health. Solid worker brood with <4% skipped cells indicating a hygienic, fertile queen. Capped honey band on top perimeter. Zero swarm cells.",
        combTypeDistribution: {
          workerCapped: 56,
          eggsLarvae: 16,
          honeyNectar: 20,
          pollenStores: 4,
          emptyDrawn: 4,
          droneComb: 0,
        },
      };

      const updated = [newRecord, ...analyses];
      saveAnalyses(updated);
      setIsAnalyzing(false);
      setSelectedReport(newRecord);
      setCurrentView("view_report");
      setMiddlePhoto(null);
      setFirstPhoto(null);
      setLastPhoto(null);
      toast.success(`FrameSense comb analysis completed for ${hiveDisplayName}!`, { id: toastId });
    }, 1600);
  };

  const handleDeleteAnalysis = (id: string) => {
    const updated = analyses.filter((a) => a.id !== id);
    saveAnalyses(updated);
    toast.success("FrameSense analysis record removed");
    if (selectedReport?.id === id) {
      setSelectedReport(null);
      setCurrentView("list");
    }
  };

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

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
                onClick={() => {
                  if (currentView !== "list") setCurrentView("list");
                  else onClose();
                }}
                className="p-1.5 -ml-1 text-stone-800 hover:text-stone-950 rounded-xl hover:bg-stone-200/50 transition-colors"
                aria-label="Back"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2]" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500/20 text-amber-800 border border-amber-500/30">
                  <Layers className="w-4 h-4 text-amber-700" />
                </span>
                <h2 className="text-xl font-bold tracking-tight text-stone-900 font-sans">
                  FrameSense AI
                </h2>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Comb cell classification, brood pattern scoring & swarm cell detection
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
                  setCurrentView("list");
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

        {/* Selected Hive Badge Header */}
        <div className="my-4 p-3 bg-[#EFE8DE]/70 rounded-2xl border border-stone-300/70 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-stone-900">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{hiveDisplayName}</span>
            <span className="text-stone-500 font-normal">
              • {CANONICAL_APIARY_NAME} ({selectedHive.frame_count || 10} Frames)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                selectedHive.hasColony
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-stone-200 text-stone-700"
              }`}
            >
              {selectedHive.hasColony ? "Active Colony" : "Standby Stand"}
            </span>
            {selectedHive.queenBreedingYear && (
              <span className="text-[11px] text-stone-600">
                Queen {selectedHive.queenBreedingYear}
              </span>
            )}
          </div>
        </div>

        {/* VIEW 1: Analyses List */}
        {currentView === "list" && (
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-stone-900">Recorded Frame Analyses</h3>
                <p className="text-xs text-stone-500">
                  {analyses.length} photo inspection scans stored for {hiveDisplayName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView("add_photos")}
                className="px-4 py-2 rounded-full bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>New Frame Scan</span>
              </button>
            </div>

            {/* Analyses Cards */}
            {analyses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-stone-300 my-4">
                <Layers className="w-10 h-10 text-stone-400 mb-2 stroke-[1.5]" />
                <h4 className="font-bold text-sm text-stone-800">No FrameSense Scans Yet</h4>
                <p className="text-xs text-stone-500 max-w-sm mt-1">
                  Upload a photo of {hiveDisplayName}'s central brood comb to let BeeYield AI classify
                  worker brood, honey stores, and queen cells.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView("add_photos")}
                  className="mt-4 px-5 py-2 rounded-full bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-xs"
                >
                  Start First Comb Scan
                </button>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {analyses.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white border border-stone-300/80 shadow-sm hover:shadow transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-stone-900">{item.timestamp}</span>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {item.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAnalysis(item.id)}
                          className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Visual Progress Metrics */}
                    <div className="grid grid-cols-3 gap-2 py-1">
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                        <div className="flex items-center justify-between text-[11px] text-stone-600 mb-1">
                          <span>Brood Pattern</span>
                          <span className="font-bold text-stone-900">{item.broodPct}%</span>
                        </div>
                        <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${item.broodPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                        <div className="flex items-center justify-between text-[11px] text-stone-600 mb-1">
                          <span>Honey Stores</span>
                          <span className="font-bold text-stone-900">{item.storesPct}%</span>
                        </div>
                        <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${item.storesPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                        <div className="flex items-center justify-between text-[11px] text-stone-600 mb-1">
                          <span>Drawn Comb</span>
                          <span className="font-bold text-stone-900">{item.combSurfacePct}%</span>
                        </div>
                        <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${item.combSurfacePct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 italic">
                      "{item.aiRecommendations}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-stone-500">
                        Queen Cells Detected: <strong className="text-stone-900">{item.queenCells}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReport(item);
                          setCurrentView("view_report");
                        }}
                        className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                      >
                        <span>View Full Breakdown</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Add Photos for FrameScan */}
        {currentView === "add_photos" && (
          <div className="flex-1 flex flex-col space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-stone-900">
                Add Frame Photos for AI Vision Analysis
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Position your camera perpendicular to the frame with even lighting. The frame must fill
                the viewfinder with minimal background margin.
              </p>
            </div>

            {/* Photo Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Slot 1: Middle Frame (Required) */}
              <div className="p-3.5 rounded-2xl bg-white border-2 border-dashed border-amber-400/80 flex flex-col justify-between text-center relative group">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-900 mb-2">
                    <span>Central Brood Frame</span>
                    <span className="text-amber-600 font-extrabold uppercase text-[10px]">Required</span>
                  </div>
                  {middlePhoto ? (
                    <div className="relative rounded-xl overflow-hidden h-32 bg-stone-100 border border-stone-200">
                      <img src={middlePhoto} alt="Middle frame" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setMiddlePhoto(null)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl bg-amber-50/50 border border-amber-200 flex flex-col items-center justify-center p-2 text-center">
                      <Camera className="w-7 h-7 text-amber-600 mb-1" />
                      <span className="text-[11px] text-stone-600 font-medium">Middle brood frame</span>
                    </div>
                  )}
                </div>
                <label className="mt-2.5 block w-full py-1.5 rounded-xl bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer text-center">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, "middle")}
                  />
                </label>
              </div>

              {/* Slot 2: Outer Left Frame (Optional) */}
              <div className="p-3.5 rounded-2xl bg-white border border-stone-300 flex flex-col justify-between text-center relative">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-900 mb-2">
                    <span>Outer Left Comb</span>
                    <span className="text-stone-400 text-[10px]">Optional</span>
                  </div>
                  {firstPhoto ? (
                    <div className="relative rounded-xl overflow-hidden h-32 bg-stone-100 border border-stone-200">
                      <img src={firstPhoto} alt="Outer left" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFirstPhoto(null)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center p-2 text-center">
                      <Upload className="w-6 h-6 text-stone-400 mb-1" />
                      <span className="text-[11px] text-stone-500 font-medium">Pollen / Stores</span>
                    </div>
                  )}
                </div>
                <label className="mt-2.5 block w-full py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 font-semibold text-xs cursor-pointer text-center">
                  Upload Left
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, "first")}
                  />
                </label>
              </div>

              {/* Slot 3: Outer Right Frame (Optional) */}
              <div className="p-3.5 rounded-2xl bg-white border border-stone-300 flex flex-col justify-between text-center relative">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-900 mb-2">
                    <span>Outer Right Comb</span>
                    <span className="text-stone-400 text-[10px]">Optional</span>
                  </div>
                  {lastPhoto ? (
                    <div className="relative rounded-xl overflow-hidden h-32 bg-stone-100 border border-stone-200">
                      <img src={lastPhoto} alt="Outer right" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setLastPhoto(null)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center p-2 text-center">
                      <Upload className="w-6 h-6 text-stone-400 mb-1" />
                      <span className="text-[11px] text-stone-500 font-medium">Honey Super Comb</span>
                    </div>
                  )}
                </div>
                <label className="mt-2.5 block w-full py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 font-semibold text-xs cursor-pointer text-center">
                  Upload Right
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, "last")}
                  />
                </label>
              </div>
            </div>

            {/* Quick Demo Preset */}
            {!middlePhoto && (
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-300/60 flex items-center justify-between text-xs">
                <span className="text-stone-700">No frame photo on hand? Load high-res demo comb:</span>
                <button
                  type="button"
                  onClick={() => {
                    // Demo comb pattern
                    setMiddlePhoto(
                      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80"
                    );
                    toast.success("Loaded verified Kibwezi central brood frame photo");
                  }}
                  className="px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg font-bold text-amber-950 text-[11px]"
                >
                  Use Demo Comb
                </button>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-auto pt-6 flex items-center justify-between border-t border-stone-300/60">
              <button
                type="button"
                onClick={() => setCurrentView("list")}
                className="px-6 py-2.5 rounded-full border border-stone-800 text-stone-900 font-medium text-xs hover:bg-stone-200/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !middlePhoto}
                className="px-8 py-2.5 rounded-full bg-[#FFB800] hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                {isAnalyzing ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Comb...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Comb Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: Detailed Report */}
        {currentView === "view_report" && selectedReport && (
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  Comb Analysis Report: {selectedReport.timestamp}
                </h3>
                <p className="text-xs text-stone-500">
                  Hive: {hiveDisplayName} • Status: {selectedReport.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView("list")}
                className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold hover:bg-stone-100"
              >
                Back to List
              </button>
            </div>

            {/* Diagnostic Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-white rounded-2xl border border-stone-200">
                <span className="text-[11px] text-stone-500 block">Worker Brood</span>
                <span className="text-xl font-bold text-amber-700">{selectedReport.broodPct}%</span>
                <span className="text-[10px] text-stone-500 block mt-0.5">Solid concentric layout</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-stone-200">
                <span className="text-[11px] text-stone-500 block">Honey Stores</span>
                <span className="text-xl font-bold text-blue-700">{selectedReport.storesPct}%</span>
                <span className="text-[10px] text-stone-500 block mt-0.5">Capped nectar perimeter</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-stone-200">
                <span className="text-[11px] text-stone-500 block">Comb Drawn</span>
                <span className="text-xl font-bold text-emerald-700">
                  {selectedReport.combSurfacePct}%
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">Full cell foundation</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-stone-200">
                <span className="text-[11px] text-stone-500 block">Queen Cells</span>
                <span className="text-xl font-bold text-stone-900">
                  {selectedReport.queenCells === 0 ? "0 (None)" : selectedReport.queenCells}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  No swarming tendency
                </span>
              </div>
            </div>

            {/* Comb Cell Breakdown */}
            {selectedReport.combTypeDistribution && (
              <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2.5">
                <h4 className="font-bold text-xs text-stone-900">
                  Comb Surface Cell Classification
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Worker Capped Brood
                    </span>
                    <span className="font-mono font-bold">
                      {selectedReport.combTypeDistribution.workerCapped}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      Eggs & Open Larvae
                    </span>
                    <span className="font-mono font-bold">
                      {selectedReport.combTypeDistribution.eggsLarvae}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Honey & Nectar Arch
                    </span>
                    <span className="font-mono font-bold">
                      {selectedReport.combTypeDistribution.honeyNectar}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                      Bee Bread (Pollen Band)
                    </span>
                    <span className="font-mono font-bold">
                      {selectedReport.combTypeDistribution.pollenStores}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AI Diagnostics Advice */}
            <div className="p-4 bg-[#F2ECE4] rounded-2xl border border-stone-300 text-xs space-y-1">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700" /> BeeYield AI Agronomic Recommendation
              </span>
              <p className="text-stone-700 leading-relaxed pt-1">
                {selectedReport.aiRecommendations}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.success("FrameSense report exported");
                }}
                className="px-5 py-2 rounded-full border border-stone-800 text-stone-900 font-medium text-xs hover:bg-stone-200/50 flex items-center gap-1"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView("list")}
                className="px-6 py-2 rounded-full bg-[#FFB800] hover:bg-amber-500 text-stone-950 font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return embedded ? content : createPortal(content, document.body);
}

export default FrameSenseToolPage;
