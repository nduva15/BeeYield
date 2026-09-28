import React, { useState } from "react";
import {
  DeviceTelemetryReading,
  persistScannedDeviceTelemetry,
} from "@/services/deviceReadingService";
import {
  Thermometer,
  Droplets,
  Scale,
  BatteryCharging,
  Wifi,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Radio,
  Sparkles,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RecentDeviceReadingsViewProps {
  reading: DeviceTelemetryReading;
  targetHiveName?: string;
  onConfirmApply?: (reading: DeviceTelemetryReading) => void;
  onRescan?: () => void;
  showApplyButton?: boolean;
}

export const RecentDeviceReadingsView: React.FC<RecentDeviceReadingsViewProps> = ({
  reading,
  targetHiveName,
  onConfirmApply,
  onRescan,
  showApplyButton = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleCopySerial = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(reading.serial);
      setCopied(true);
      toast.success(`Copied serial ${reading.serial}`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const hive = targetHiveName || reading.hiveName || "Primary Hive";
      await persistScannedDeviceTelemetry(reading, hive);
      toast.success(`Applied device readings from ${reading.serial} to ${hive}!`);
      if (onConfirmApply) {
        onConfirmApply(reading);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to persist readings");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/5 via-card to-card p-4 space-y-4 shadow-md animate-in fade-in">
      {/* Hardware Header Card */}
      <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Scanned Hardware Readings
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Telemetry Synced
              </span>
            </div>
            <h4 className="font-mono text-base font-bold text-foreground mt-1 truncate">
              {reading.serial}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {reading.deviceName} · {reading.timestamp}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopySerial}
            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Copy serial number"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {onRescan && (
            <button
              type="button"
              onClick={onRescan}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-amber-600 hover:text-amber-700 transition-colors"
              title="Scan another camera QR code"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Key Telemetry Readings */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Brood Temperature */}
        <div className="p-3 rounded-xl border border-border bg-card/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold">Brood Core</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-amber-600">
              {reading.temperature_c}°C
            </span>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-tight truncate">
              {reading.tempStatus}
            </p>
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3 rounded-xl border border-border bg-card/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold">Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-blue-600">
              {reading.humidity_pct}%
            </span>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-tight truncate">
              {reading.humidityStatus}
            </p>
          </div>
        </div>

        {/* Scale Mass / Weight */}
        <div className="p-3 rounded-xl border border-border bg-card/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold">Colony Scale</span>
            <Scale className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-emerald-600">
              {reading.weight_kg > 0 ? `${reading.weight_kg} kg` : "Ambient"}
            </span>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-tight truncate">
              {reading.weight_kg > 0 ? "Honey + Stores Net" : "No Load Cell"}
            </p>
          </div>
        </div>

        {/* Acoustic Cluster Vibration */}
        <div className="p-3 rounded-xl border border-border bg-card/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold">Acoustic Vib</span>
            <Activity className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-purple-600">
              {reading.acoustic_hz} Hz
            </span>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-tight truncate">
              {reading.acousticStatus}
            </p>
          </div>
        </div>

        {/* Battery Health */}
        <div className="p-3 rounded-xl border border-border bg-card/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold">Battery</span>
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-foreground">
              {reading.battery_pct}%
            </span>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-tight truncate">
              Li-Po Solar Float: Nominal
            </p>
          </div>
        </div>

        {/* Radio Link & Varroa */}
        <div className="p-3 rounded-xl border border-border bg-card/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-semibold">Link / Parasites</span>
            <Wifi className="w-3.5 h-3.5 text-honey" />
          </div>
          <div className="mt-2">
            <span className="text-sm font-bold font-mono uppercase text-foreground">
              {reading.link_type} ({reading.signal_dbm} dBm)
            </span>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-tight truncate">
              Varroa: {reading.varroa_count} mite / 100 bees
            </p>
          </div>
        </div>
      </div>

      {/* Target Hive Banner / Apply Button */}
      {showApplyButton && (
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="text-xs text-muted-foreground">
            <span>Target Colony: </span>
            <strong className="text-foreground">
              {targetHiveName || reading.hiveName || "Selected Hive"}
            </strong>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            disabled={isApplying}
            className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs gap-1.5 shadow-sm"
          >
            {isApplying ? (
              <span>Syncing…</span>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply Telemetry to Hive</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
