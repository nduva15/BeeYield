import React, { useState, useMemo, useEffect } from "react";
import {
  Scale,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  Check,
  Layers,
  Droplets,
  ArrowDownRight,
  X,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// Custom Honeycomb Icon matching Apisense design
export const HoneycombIcon = ({ className = "w-5 h-5 text-amber-800 dark:text-amber-400" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.5l3.5 2v4l-3.5 2-3.5-2v-4l3.5-2z" />
    <path d="M16.5 8.5l3.5 2v4l-3.5 2-3.5-2v-4l3.5-2z" />
    <path d="M7.5 8.5l3.5 2v4l-3.5 2-3.5-2v-4l3.5-2z" />
  </svg>
);

// Custom Honey Dipper Icon at the end of the ranking progress bar (matching Screenshot 2)
export const HoneyDipperIcon = ({ className = "w-4 h-4 text-amber-900 dark:text-amber-200" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    {/* Dipper Stick */}
    <rect x="14" y="2" width="2" height="10" rx="1" transform="rotate(42 14 2)" />
    {/* Dipper bulb rings */}
    <ellipse cx="8.5" cy="15.5" rx="3.5" ry="4.5" transform="rotate(42 8.5 15.5)" fill="currentColor" opacity="0.9" />
    <line x1="6.5" y1="13.5" x2="10.5" y2="17.5" stroke="#FAF4EE" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="8" y1="12" x2="12" y2="16" stroke="#FAF4EE" strokeWidth="1.2" strokeLinecap="round" />
    {/* Dipping Honey Drop */}
    <circle cx="5" cy="19" r="1.5" fill="#D97706" />
  </svg>
);

export interface SeasonHarvestData {
  year: number;
  label: string;
  isCurrent?: boolean;
  estimatedHarvestKg: number;
  confirmedHarvestKg: number;
  detectedDropKg: number;
  topHives: {
    hiveCode: string;
    displayName: string;
    kg: number;
    pct: number;
  }[];
  apiaryTotalKg: number;
  ripeningHivesCount: number;
  readyHivesCount: number;
}

const STORAGE_CONFIRMED_DROPS_KEY = "beeyield_apisense_confirmed_drops_v1";

interface ApisenseHarvestWeightCardProps {
  apiaryId?: string;
  apiaryName?: string;
  hiveId?: string;
  hiveCode?: string;
  isExpandedInHiveWeight?: boolean;
  hasScale?: boolean;
  hasDevice?: boolean;
  onConfirmHarvest?: (batch: {
    hiveCode: string;
    quantityKg: number;
    date: string;
    batchCode: string;
    honeyType: string;
    moisturePct: number;
  }) => void;
  onNavigateToHive?: (hiveCode: string) => void;
}

export const ApisenseHarvestWeightCard: React.FC<ApisenseHarvestWeightCardProps> = ({
  apiaryId = "apiary-kibwezi",
  apiaryName = "beeyield 2",
  hiveId,
  hiveCode = "KIB-007",
  isExpandedInHiveWeight = false,
  hasScale = false,
  hasDevice = false,
  onConfirmHarvest,
  onNavigateToHive,
}) => {
  // Season selector state (Current 2026 vs Past Harvest Records)
  const [selectedSeason, setSelectedSeason] = useState<string>("2026");
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Track confirmed drops in local storage
  const [confirmedDrops, setConfirmedDrops] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CONFIRMED_DROPS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const saveConfirmedDrop = (key: string, kg: number) => {
    setConfirmedDrops((prev) => {
      const next = { ...prev, [key]: kg };
      try {
        localStorage.setItem(STORAGE_CONFIRMED_DROPS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const is2026Confirmed = (confirmedDrops["2026"] ?? 0) >= 12.5;

  // Seasons dataset supporting current (2026) and past harvest records (2025, 2024, 2023, 2022, 2021)
  const seasonsData: Record<string, SeasonHarvestData> = useMemo(() => {
    const currentConfirmed = is2026Confirmed ? 12.5 : 0.0;
    return {
      "2026": {
        year: 2026,
        label: "Season 2026 - in progress",
        isCurrent: true,
        estimatedHarvestKg: 12.5,
        confirmedHarvestKg: currentConfirmed,
        detectedDropKg: 12.5,
        topHives: [
          {
            hiveCode: "KIB-007",
            displayName: "beeyield 007",
            kg: 12.5,
            pct: 100,
          },
        ],
        apiaryTotalKg: 12.5,
        ripeningHivesCount: 1,
        readyHivesCount: is2026Confirmed ? 1 : 0,
      },
      "2025": {
        year: 2025,
        label: "Season 2025",
        isCurrent: false,
        estimatedHarvestKg: 300.0,
        confirmedHarvestKg: 300.0,
        detectedDropKg: 300.0,
        topHives: [
          { hiveCode: "KIB-001", displayName: "beeyield 001", kg: 42.0, pct: 100 },
          { hiveCode: "KIB-002", displayName: "beeyield 002", kg: 38.5, pct: 92 },
          { hiveCode: "KIB-007", displayName: "beeyield 007", kg: 36.0, pct: 86 },
          { hiveCode: "KIB-004", displayName: "beeyield 004", kg: 32.5, pct: 77 },
        ],
        apiaryTotalKg: 300.0,
        ripeningHivesCount: 0,
        readyHivesCount: 6,
      },
      "2024": {
        year: 2024,
        label: "Season 2024",
        isCurrent: false,
        estimatedHarvestKg: 250.0,
        confirmedHarvestKg: 250.0,
        detectedDropKg: 250.0,
        topHives: [
          { hiveCode: "KIB-002", displayName: "beeyield 002", kg: 40.0, pct: 100 },
          { hiveCode: "KIB-007", displayName: "beeyield 007", kg: 35.0, pct: 88 },
          { hiveCode: "KIB-001", displayName: "beeyield 001", kg: 34.0, pct: 85 },
          { hiveCode: "KIB-003", displayName: "beeyield 003", kg: 31.0, pct: 78 },
        ],
        apiaryTotalKg: 250.0,
        ripeningHivesCount: 0,
        readyHivesCount: 6,
      },
      "2023": {
        year: 2023,
        label: "Season 2023",
        isCurrent: false,
        estimatedHarvestKg: 105.0,
        confirmedHarvestKg: 105.0,
        detectedDropKg: 105.0,
        topHives: [
          { hiveCode: "KIB-007", displayName: "beeyield 007", kg: 28.0, pct: 100 },
          { hiveCode: "KIB-003", displayName: "beeyield 003", kg: 24.0, pct: 86 },
          { hiveCode: "KIB-001", displayName: "beeyield 001", kg: 20.0, pct: 71 },
        ],
        apiaryTotalKg: 105.0,
        ripeningHivesCount: 0,
        readyHivesCount: 4,
      },
      "2022": {
        year: 2022,
        label: "Season 2022",
        isCurrent: false,
        estimatedHarvestKg: 55.0,
        confirmedHarvestKg: 55.0,
        detectedDropKg: 55.0,
        topHives: [
          { hiveCode: "KIB-001", displayName: "beeyield 001", kg: 18.0, pct: 100 },
          { hiveCode: "KIB-007", displayName: "beeyield 007", kg: 15.0, pct: 83 },
        ],
        apiaryTotalKg: 55.0,
        ripeningHivesCount: 0,
        readyHivesCount: 3,
      },
      "2021": {
        year: 2021,
        label: "Season 2021",
        isCurrent: false,
        estimatedHarvestKg: 60.0,
        confirmedHarvestKg: 60.0,
        detectedDropKg: 60.0,
        topHives: [
          { hiveCode: "KIB-001", displayName: "beeyield 001", kg: 22.0, pct: 100 },
          { hiveCode: "KIB-007", displayName: "beeyield 007", kg: 18.0, pct: 82 },
        ],
        apiaryTotalKg: 60.0,
        ripeningHivesCount: 0,
        readyHivesCount: 3,
      },
    };
  }, [is2026Confirmed]);

  const currentData = seasonsData[selectedSeason] || seasonsData["2026"];

  const handleConfirmDrop = () => {
    saveConfirmedDrop("2026", 12.5);
    setShowConfirmModal(false);
    toast.success("🎉 Confirmed ~12.5 kg harvest batch for beeyield 007 from scale weight drop!");
    if (onConfirmHarvest) {
      onConfirmHarvest({
        hiveCode: "KIB-007",
        quantityKg: 12.5,
        date: new Date().toISOString().slice(0, 10),
        batchCode: `BEE-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-007`,
        honeyType: "Early Spring Acacia Blossom (Apisense Scale Batch)",
        moisturePct: 16.8,
      });
    }
  };

  const handleResetConfirmation = () => {
    saveConfirmedDrop("2026", 0);
    toast.info("Harvest drop reset to unconfirmed estimate for testing.");
  };

  return (
    <div className="space-y-4">
      {/* 1. HONEY RIPENING BANNER (Screenshot 1) - Only shown when connected scale/device telemetry is active */}
      {(hasScale || hasDevice) && (
        <div className="bg-[#EAF5FC] dark:bg-[#132738] rounded-2xl p-4 sm:p-5 border border-[#D0E8F8] dark:border-[#1E3A52] space-y-3 shadow-sm transition-all">
          <div className="flex items-center gap-2 text-[#3B5A75] dark:text-[#8BB4D6] text-xs font-semibold">
            <HoneycombIcon className="w-4 h-4 text-[#0B72B9] dark:text-[#38BDF8]" />
            <span>
              {currentData.isCurrent
                ? `Honey is ripening · ${currentData.readyHivesCount} of ${currentData.ripeningHivesCount} monitored hives ready`
                : `Historical Season · All ${currentData.readyHivesCount} monitored hives harvested`}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-base sm:text-lg font-bold text-[#1C2C3D] dark:text-[#E2EFF8] tracking-tight">
              {currentData.isCurrent && !is2026Confirmed
                ? "Don't take it yet - the honey is still drying"
                : "Honey extraction verified & completed for this cycle"}
            </h4>

            {/* Ripening Progress Bar */}
            <div className="w-full bg-[#CBE4F7] dark:bg-[#1E3A52] h-2 sm:h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#0B72B9] dark:bg-[#38BDF8] h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: currentData.isCurrent ? (is2026Confirmed ? "100%" : "72%") : "100%",
                }}
              />
            </div>

            <p className="text-center text-xs font-semibold text-[#3B5A75] dark:text-[#8BB4D6]">
              {currentData.isCurrent ? (is2026Confirmed ? "ready for harvest" : "ripening") : "harvest completed"}
            </p>
          </div>

          <p className="text-[11px] text-[#476785] dark:text-[#7D9FBD] pt-1 border-t border-[#D0E8F8]/60 dark:border-[#1E3A52]/60">
            {currentData.isCurrent
              ? "Apisense scale telemetry tracks daily nectar intake (+1.8 kg) and nighttime water evaporation (drying). Ready to extract once weight plateaus and moisture stabilizes <18%."
              : `Certified extraction records from Season ${currentData.year}. Verified against Apisense telemetry scales and refractometer logs.`}
          </p>
        </div>
      )}

      {/* 2. SEASON SELECTOR DROPDOWN (Screenshot 2: "Season 2026 - in progress ⌵") */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsSeasonDropdownOpen((v) => !v)}
          className="w-full bg-[#FAF4EE] dark:bg-[#1E1B18] border border-[#EFE8DE] dark:border-stone-800 rounded-2xl px-4 sm:px-5 py-3.5 flex items-center justify-between text-left shadow-sm hover:border-amber-400 dark:hover:border-amber-600/50 transition-colors select-none group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-bold text-base sm:text-lg text-[#2E2A25] dark:text-stone-100 truncate">
              {currentData.label}
            </span>
            {currentData.isCurrent && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Active
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-stone-500 transition-transform duration-200 shrink-0 ${
              isSeasonDropdownOpen ? "rotate-180 text-amber-600" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu for Current and Past Harvest Records */}
        {isSeasonDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-[#FAF4EE] dark:bg-[#1E1B18] border border-[#EFE8DE] dark:border-stone-800 rounded-2xl p-2 shadow-xl space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-[#EFE8DE] dark:border-stone-800">
              Select Harvest Season
            </div>
            {Object.keys(seasonsData).map((yearKey) => {
              const item = seasonsData[yearKey];
              const isSelected = selectedSeason === yearKey;
              return (
                <button
                  key={yearKey}
                  type="button"
                  onClick={() => {
                    setSelectedSeason(yearKey);
                    setIsSeasonDropdownOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold"
                      : "text-stone-700 dark:text-stone-300 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
                        Live
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-500">
                      {item.isCurrent && !is2026Confirmed
                        ? `~${item.estimatedHarvestKg.toFixed(1)} kg est.`
                        : `${item.confirmedHarvestKg.toFixed(1)} kg`}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. CARD 1: HONEY HARVESTED (ESTIMATE FROM SCALE DATA) (Screenshot 2) */}
      <div className="bg-[#FAF4EE] dark:bg-[#1E1B18] rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] dark:border-stone-800 space-y-2 shadow-sm">
        <h4 className="text-base font-bold text-[#2E2A25] dark:text-stone-100">
          Honey harvested
        </h4>
        <p className="text-xs text-[#8E8880] dark:text-stone-400 font-medium">
          since the start of the {currentData.year} season
        </p>
        <p className="text-2xl sm:text-3xl font-black text-[#2E2A25] dark:text-stone-100 pt-1">
          ~{currentData.estimatedHarvestKg.toFixed(1)} <span className="text-base font-bold text-[#8E8880]">kg</span>
        </p>
        <p className="text-xs text-[#8E8880] dark:text-stone-400 font-normal pt-1">
          An estimate from Scale data until you confirm the harvests.
        </p>
      </div>

      {/* 4. CARD 2: CONFIRMED HONEY (SCALE WEIGHT DROPS DETECTED) (Screenshot 2) */}
      <div className="bg-[#FAF4EE] dark:bg-[#1E1B18] rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] dark:border-stone-800 space-y-2.5 shadow-sm">
        <h4 className="text-xs sm:text-sm font-semibold text-[#8E8880] dark:text-stone-400">
          Confirmed honey since the start of the {currentData.year} season
        </h4>
        <p className="text-2xl sm:text-3xl font-black text-[#2E2A25] dark:text-stone-100">
          {currentData.confirmedHarvestKg.toFixed(1)}{" "}
          <span className="text-base font-bold text-[#8E8880]">kg</span>
        </p>
        <p className="text-xs text-[#8E8880] dark:text-stone-400 leading-relaxed">
          Scale devices detected weight drops of ~{currentData.detectedDropKg.toFixed(1)} kg. How much of it was honey? Confirm the harvests in each hive's events.
        </p>

        {/* Interactive confirmation button for 2026 current season */}
        {currentData.isCurrent && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {!is2026Confirmed ? (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Scale className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Confirm Harvest (~12.5 kg Detected)</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Scale Drop Confirmed (12.5 kg Verified)
                </span>
                <button
                  type="button"
                  onClick={handleResetConfirmation}
                  className="text-[11px] text-stone-500 hover:text-stone-700 underline"
                  title="Reset confirmation for demo"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. CARD 3: HARVEST RANKING (Screenshot 2) */}
      <div className="bg-[#FAF4EE] dark:bg-[#1E1B18] rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] dark:border-stone-800 space-y-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-base font-bold text-[#2E2A25] dark:text-stone-100">
              Harvest ranking
            </h4>
            <p className="text-xs text-[#8E8880] dark:text-stone-400 font-medium">
              Best-producing hives • {currentData.year}
            </p>
          </div>
          <HoneycombIcon className="w-6 h-6 text-stone-700 dark:text-stone-300 shrink-0" />
        </div>

        {/* Ranked Hives List with Honey Dipper at Progress End */}
        <div className="space-y-4 pt-1">
          {currentData.topHives.map((h, idx) => (
            <div key={h.hiveCode} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-[#2E2A25] dark:text-stone-200">
                  {idx + 1}. {h.displayName}
                </span>
                <span className="font-bold text-[#2E2A25] dark:text-stone-100">
                  ~{h.kg.toFixed(1)} <span className="font-normal text-[#8E8880]">kg</span>
                </span>
              </div>

              {/* Progress bar with honey dipper icon at the tip */}
              <div className="relative flex items-center w-full">
                <div className="w-full bg-[#F5EAD9] dark:bg-stone-800/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#F59E0B] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(12, h.pct)}%` }}
                  />
                </div>
                {/* Honey dipper positioned at the bar end */}
                <div
                  className="absolute -top-1.5 -ml-2 pointer-events-none transition-all duration-500"
                  style={{ left: `${Math.min(96, Math.max(12, h.pct))}%` }}
                >
                  <HoneyDipperIcon className="w-4 h-4 text-amber-900 dark:text-amber-200" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Apiary Harvest Total Footer */}
        <div className="pt-2 border-t border-[#EFE8DE] dark:border-stone-800/80 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-[#8E8880] dark:text-stone-400 font-medium">
            Apiary harvest total:
          </span>
          <span className="font-bold text-[#2E2A25] dark:text-stone-100">
            ~{currentData.apiaryTotalKg.toFixed(1)} <span className="font-normal text-[#8E8880]">kg</span>
          </span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF4EE] dark:bg-[#1E1B18] border border-[#EFE8DE] dark:border-stone-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE8DE] dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Confirm Scale Harvest</h3>
                  <p className="text-xs text-muted-foreground">Apisense Telemetry Weight Drop</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monitored Hive:</span>
                  <span className="font-bold text-foreground">beeyield 007 (KIB-007)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Detected Scale Drop:</span>
                  <span className="font-black text-amber-600 text-sm">~12.5 kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Moisture Content:</span>
                  <span className="font-bold text-emerald-600">16.8% (Grade A Dry)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Extraction Date:</span>
                  <span className="font-mono text-foreground">01.10.2026, 11:40</span>
                </div>
              </div>
              <p className="text-[#8E8880] text-[11px] leading-relaxed">
                Confirming this event records an authentic harvest batch in your certified ledger and marks the scale estimate as confirmed.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDrop}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Confirm & Seal Batch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApisenseHarvestWeightCard;
