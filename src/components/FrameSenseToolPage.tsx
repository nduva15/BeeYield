import React, { useState, useEffect, useMemo, useRef } from "react";
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
  ImagePlus,
  Clock,
  Hexagon,
  RefreshCw,
  Check,
  Activity,
  Droplets,
  FileText,
  ClipboardList,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  resolveUserHives,
  UnifiedHive,
  CANONICAL_TIMOTHY_HIVES,
} from "@/lib/user-hives";
import { CANONICAL_APIARY_NAME } from "@/lib/apiary-normalization";
import SyrupFeedingToolPage from "./SyrupFeedingToolPage";

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
  onOpenSyrup?: (hiveId: string) => void;
  onOpenInspections?: (hiveId: string) => void;
}

export function FrameSenseToolPage({
  isOpen,
  onClose,
  initialHiveId,
  embedded = false,
  onOpenSyrup,
  onOpenInspections,
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

  const hiveDisplayName = selectedHive.code || selectedHive.hive_code || selectedHive.name || "beeyield 001";

  // Sub-screens: "add_photos" (default as per design mockup), "view_report", "list"
  const [currentView, setCurrentView] = useState<"add_photos" | "view_report" | "list">("add_photos");
  const [selectedReport, setSelectedReport] = useState<FrameSenseAnalysis | null>(null);

  // Switch to Syrup intact
  const [isSyrupOpen, setIsSyrupOpen] = useState(false);

  // Photos for new analysis
  const [middlePhoto, setMiddlePhoto] = useState<string | null>(null);
  const [firstPhoto, setFirstPhoto] = useState<string | null>(null);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");

  const middleInputRef = useRef<HTMLInputElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

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
      toast.success(`Frame photo uploaded for ${slot} frame`);
    };
    reader.readAsDataURL(file);
  };

  // Run AI Analysis Simulation with realistic stepped feedback
  const handleRunAnalysis = () => {
    if (!middlePhoto) {
      toast.error("Please add the middle (central) frame photo to proceed");
      middleInputRef.current?.click();
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep("Scanning comb cells & Langstroth frame boundary...");

    setTimeout(() => {
      setAnalysisStep("Classifying capped worker brood, eggs & honey arch...");
    }, 600);

    setTimeout(() => {
      setAnalysisStep("Detecting queen swarm cells & calculating coverage...");
    }, 1200);

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
        broodPct: 74,
        storesPct: 20,
        combSurfacePct: 94,
        queenCells: 0,
        estimatedBees: 1980,
        middlePhotoUrl: middlePhoto,
        firstPhotoUrl: firstPhoto || undefined,
        lastPhotoUrl: lastPhoto || undefined,
        aiRecommendations:
          "BeeYield Vision AI: Optimal comb health. Solid concentric worker brood with <4% skipped cells indicating a vigorous, mated queen. Capped honey band on upper perimeter. Zero queen swarm cells detected.",
        combTypeDistribution: {
          workerCapped: 56,
          eggsLarvae: 18,
          honeyNectar: 20,
          pollenStores: 4,
          emptyDrawn: 2,
          droneComb: 0,
        },
      };

      const updated = [newRecord, ...analyses];
      saveAnalyses(updated);
      setIsAnalyzing(false);
      setAnalysisStep("");
      setSelectedReport(newRecord);
      setCurrentView("view_report");
      toast.success(`FrameSense comb analysis completed for ${hiveDisplayName}!`);
    }, 1800);
  };

  const handleDeleteAnalysis = (id: string) => {
    const updated = analyses.filter((a) => a.id !== id);
    saveAnalyses(updated);
    toast.success("FrameSense analysis record removed");
    if (selectedReport?.id === id) {
      setSelectedReport(null);
      setCurrentView("add_photos");
    }
  };

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  // Intact page view: NOT a popup card, but an intact full-height view that fills the viewport edge-to-edge
  const content = (
    <div
      className={
        embedded
          ? "w-full max-w-2xl mx-auto py-2"
          : "fixed inset-0 z-[100] bg-[#FAF5EF] dark:bg-stone-950 overflow-y-auto flex flex-col animate-in fade-in duration-150 select-text"
      }
    >
      <div
        className={`w-full max-w-xl mx-auto flex-1 flex flex-col p-4 sm:p-6 text-[#2E2A25] dark:text-stone-100 min-h-screen ${
          embedded ? "h-auto min-h-0" : ""
        }`}
      >
        {/* TOP APP BAR: Matching Screen Design */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-200/80 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (currentView === "view_report") {
                  setCurrentView("add_photos");
                } else if (currentView === "list") {
                  setCurrentView("add_photos");
                } else {
                  onClose();
                }
              }}
              className="p-1.5 -ml-1 text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-white font-sans">
              FrameSense
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View History toggle pill */}
            <button
              type="button"
              onClick={() => setCurrentView(currentView === "list" ? "add_photos" : "list")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === "list"
                  ? "bg-amber-500 text-stone-950 shadow-xs"
                  : "bg-stone-200/70 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300"
              }`}
              title="View Scan History"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">History</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px]">
                {analyses.length}
              </span>
            </button>
          </div>
        </div>

        {/* HIVE TITLE & SUB-NAV BAR: Unified Hive Experience */}
        <div className="flex items-center justify-between pt-3 pb-2 shrink-0">
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

          {/* 2. Syrup */}
          <button
            type="button"
            onClick={() => {
              if (onOpenSyrup) {
                onOpenSyrup(selectedHive.id);
              } else {
                setIsSyrupOpen(true);
              }
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer group"
          >
            <Droplets className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">Syrup</span>
          </button>

          {/* 3. FrameSense (Active) */}
          <button
            type="button"
            onClick={() => {
              setCurrentView("add_photos");
            }}
            className="flex flex-col items-center flex-1 min-w-[62px] py-1 text-amber-700 dark:text-amber-400 relative cursor-pointer group font-bold"
          >
            <Layers className="w-5 h-5 mb-1 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] leading-none whitespace-nowrap">FrameSense</span>
            {/* Active Amber Underline */}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-amber-600 dark:bg-amber-400" />
          </button>

          {/* 4. Notes */}
          <button
            type="button"
            onClick={() => {
              toast.info(`Notes for ${hiveDisplayName}: Regular comb inspections recorded.`);
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
        {/* VIEW 1: ADD FRAME PHOTOS FOR ANALYSIS (MATCHING SCREENSHOT) */}
        {/* ========================================================================= */}
        {currentView === "add_photos" && (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Top Introductory Explanation */}
            <p className="text-xs sm:text-[13px] text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
              AI-based analysis of frame photos — classifies comb cells, detects queen cells, determines coverage and estimates the number of bees, and provides recommendations.
            </p>

            {/* Instruction Callout */}
            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white">
                Add frame photos for analysis
              </h3>
              <p className="text-xs sm:text-[12.5px] text-stone-500 dark:text-stone-400 leading-relaxed">
                The frame should be fully visible in the photo (no cropped corners or edges) and fill almost the entire frame, leaving only a small margin. When possible, take the photo against a uniform background to ensure the highest quality AI analysis.
              </p>
            </div>

            {/* PHOTO SLOTS */}
            <div className="space-y-3.5">
              {/* Slot 1: Middle (central) frame [Required] */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    Middle (central) frame
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                    Required
                  </span>
                </div>

                <div
                  onClick={() => {
                    if (!middlePhoto) {
                      middleInputRef.current?.click();
                    }
                  }}
                  className={`w-full rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all relative overflow-hidden flex flex-col items-center justify-center ${
                    middlePhoto
                      ? "border-amber-400/90 bg-stone-900 aspect-[16/10]"
                      : "border-[#DFD2C0] dark:border-stone-800 bg-[#EFE8DC]/80 dark:bg-stone-900/60 hover:bg-[#EAE0D2] dark:hover:bg-stone-900 hover:border-amber-400 cursor-pointer min-h-[190px] sm:min-h-[220px]"
                  }`}
                >
                  <input
                    ref={middleInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, "middle")}
                  />

                  {middlePhoto ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={middlePhoto}
                        alt="Middle central frame"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                      {/* Remove photo button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMiddlePhoto(null);
                        }}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white shadow-md transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Replace photo badge */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          middleInputRef.current?.click();
                        }}
                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retake Photo
                      </button>

                      {/* Captured status pill */}
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md backdrop-blur-xs">
                        <Check className="w-3.5 h-3.5" />
                        Frame Photo Attached
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 pointer-events-none">
                      {/* Exact Camera+ Icon from design */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-stone-400 dark:text-stone-500">
                        <svg
                          className="w-12 h-12 stroke-[1.8]"
                          viewBox="0 0 48 48"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {/* Camera Body */}
                          <path d="M12 16h5l2.5-4h9l2.5 4h5a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4Z" />
                          {/* Plus Symbol in Center */}
                          <line x1="24" y1="23" x2="24" y2="33" />
                          <line x1="19" y1="28" x2="29" y2="28" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                        Tap to capture or upload central brood comb
                      </span>
                    </div>
                  )}
                </div>

                {/* Instant Demo Comb Loader */}
                {!middlePhoto && (
                  <div className="flex items-center justify-between text-[11px] pt-0.5 px-1">
                    <span className="text-stone-500">No frame photo on hand?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMiddlePhoto(
                          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=700&q=80"
                        );
                        toast.success("Loaded verified Kibwezi Langstroth brood frame photo");
                      }}
                      className="font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Load Demo Comb Photo
                    </button>
                  </div>
                )}
              </div>

              {/* Slot 2: First frame in the hive [Optional] */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                    First frame in the hive
                  </span>
                  <span className="text-stone-400 dark:text-stone-500 font-semibold text-[11px]">
                    Optional
                  </span>
                </div>

                <input
                  ref={firstInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e, "first")}
                />

                <div
                  onClick={() => {
                    if (!firstPhoto) {
                      firstInputRef.current?.click();
                    }
                  }}
                  className={`w-full rounded-2xl border transition-all flex items-center justify-between px-4 cursor-pointer ${
                    firstPhoto
                      ? "border-amber-400/80 bg-stone-900 p-2 text-white"
                      : "h-12 sm:h-14 border-[#DFD2C0] dark:border-stone-800 bg-[#EFE8DC]/60 dark:bg-stone-900/40 hover:bg-[#EAE0D2] dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400"
                  }`}
                >
                  {firstPhoto ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={firstPhoto}
                          alt="First frame"
                          className="w-9 h-9 rounded-xl object-cover border border-white/20"
                        />
                        <span className="text-xs font-bold">First Frame Attached</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFirstPhoto(null);
                        }}
                        className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full justify-center text-xs font-medium">
                      <Camera className="w-4 h-4 text-stone-400" />
                      <span>Tap to add first frame photo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEND FOR ANALYSIS PRIMARY BUTTON */}
            <div className="pt-2 mt-auto">
              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !middlePhoto}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-black text-sm sm:text-base tracking-wide shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2 text-stone-950">
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>{analysisStep || "Running AI Comb Analysis..."}</span>
                  </div>
                ) : (
                  <span>Send for analysis</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: FULL DIAGNOSTIC REPORT */}
        {/* ========================================================================= */}
        {currentView === "view_report" && selectedReport && (
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base sm:text-lg text-stone-900 dark:text-white">
                  Comb Analysis Report
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  {selectedReport.timestamp} • {hiveDisplayName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView("add_photos")}
                className="px-3.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 shadow-xs cursor-pointer"
              >
                New Scan
              </button>
            </div>

            {/* Diagnostic Metrics 4-Box Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-0.5">
                <span className="text-[11px] font-bold text-stone-500 block">Worker Brood</span>
                <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                  {selectedReport.broodPct}%
                </span>
                <span className="text-[10px] text-stone-400 block">Concentric layout</span>
              </div>
              <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-0.5">
                <span className="text-[11px] font-bold text-stone-500 block">Honey Stores</span>
                <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
                  {selectedReport.storesPct}%
                </span>
                <span className="text-[10px] text-stone-400 block">Capped nectar ring</span>
              </div>
              <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-0.5">
                <span className="text-[11px] font-bold text-stone-500 block">Comb Drawn</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {selectedReport.combSurfacePct}%
                </span>
                <span className="text-[10px] text-stone-400 block">Foundation coverage</span>
              </div>
              <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-0.5">
                <span className="text-[11px] font-bold text-stone-500 block">Queen Cells</span>
                <span className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                  {selectedReport.queenCells}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block">
                  Zero swarming risk
                </span>
              </div>
            </div>

            {/* Comb Cell Breakdown */}
            {selectedReport.combTypeDistribution && (
              <div className="p-3.5 sm:p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
                <h4 className="font-bold text-xs text-stone-900 dark:text-white uppercase tracking-wider">
                  Comb Surface Cell Classification
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Worker Capped Brood
                    </span>
                    <span className="font-mono font-bold">
                      {selectedReport.combTypeDistribution.workerCapped}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      Eggs & Open Larvae
                    </span>
                    <span className="font-mono font-bold">
                      {selectedReport.combTypeDistribution.eggsLarvae}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Honey & Nectar Arch
                    </span>
                    <span className="font-mono font-bold">
                      {selectedReport.combTypeDistribution.honeyNectar}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
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

            {/* AI Agronomic Recommendation */}
            <div className="p-3.5 sm:p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" /> BeeYield Vision Recommendation
              </span>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed pt-0.5">
                {selectedReport.aiRecommendations}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-3 flex items-center justify-end gap-2 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => {
                  toast.success("FrameSense inspection report saved to colony records");
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs shadow-xs cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: SCAN HISTORY */}
        {/* ========================================================================= */}
        {currentView === "list" && (
          <div className="flex-1 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                  Recorded Frame Analyses
                </h3>
                <p className="text-xs text-stone-500">
                  {analyses.length} photo inspection scans stored for {hiveDisplayName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView("add_photos")}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>New Scan</span>
              </button>
            </div>

            {analyses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 my-4 space-y-2">
                <Layers className="w-10 h-10 text-stone-400 mb-1 stroke-[1.5]" />
                <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">
                  No FrameSense Scans Yet
                </h4>
                <p className="text-xs text-stone-500 max-w-sm">
                  Upload a photo of {hiveDisplayName}'s central brood comb to let BeeYield AI classify worker brood, honey stores, and queen cells.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView("add_photos")}
                  className="mt-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer"
                >
                  Start First Comb Scan
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {analyses.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                        {item.timestamp}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {item.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAnalysis(item.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs bg-stone-50 dark:bg-stone-800/50 p-2 rounded-xl">
                      <div>
                        <span className="text-stone-400 text-[10px] block">Brood</span>
                        <span className="font-bold text-amber-600">{item.broodPct}%</span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] block">Honey</span>
                        <span className="font-bold text-blue-600">{item.storesPct}%</span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] block">Comb Drawn</span>
                        <span className="font-bold text-emerald-600">{item.combSurfacePct}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-stone-500">
                        Queen Cells: <strong className="text-stone-900 dark:text-stone-100">{item.queenCells}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReport(item);
                          setCurrentView("view_report");
                        }}
                        className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Report</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Intact Syrup Tool Navigation */}
      {isSyrupOpen && (
        <SyrupFeedingToolPage
          isOpen={isSyrupOpen}
          onClose={() => setIsSyrupOpen(false)}
          initialHiveId={selectedHive.id}
          onOpenFrameSense={() => setIsSyrupOpen(false)}
        />
      )}
    </div>
  );

  return embedded ? content : createPortal(content, document.body);
}

export default FrameSenseToolPage;
