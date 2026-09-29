import React from 'react';
import {
    Thermometer,
    Droplets,
    Scale,
    Battery,
    BatteryWarning,
    BatteryCharging,
    Wifi,
    Radio,
    Clock,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractSafeSensorTelemetry, RawSensorTelemetry } from '@/lib/sensorDataSafety';
import { SensorErrorBoundary } from './SensorErrorBoundary';

interface SafeSensorMetricCardProps {
    reading?: RawSensorTelemetry | null;
    title: string;
    hiveCode?: string;
    className?: string;
}

export const SafeSensorMetricCard: React.FC<SafeSensorMetricCardProps> = ({
    reading,
    title,
    hiveCode,
    className
}) => {
    const safe = extractSafeSensorTelemetry(reading);

    return (
        <SensorErrorBoundary fallbackTitle={`${title} (${hiveCode || 'Hive'})`}>
            <div
                className={cn(
                    "rounded-2xl border bg-card p-4 sm:p-5 shadow-sm transition-all duration-200 flex flex-col justify-between relative overflow-hidden",
                    safe.timestamp.isStale ? "border-amber-400/60 bg-amber-50/20 dark:bg-amber-950/10" : "border-border",
                    className
                )}
            >
                {/* Stale Data Warning Banner */}
                {safe.timestamp.isStale && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 animate-pulse" />
                )}

                {/* Header */}
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs",
                            safe.isSensorOnline 
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        )}>
                            <Radio className={cn("w-4 h-4", safe.isSensorOnline && "animate-pulse")} />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-sm text-foreground tracking-tight">
                                {title}
                            </h3>
                            {hiveCode && (
                                <p className="text-[11px] font-mono text-muted-foreground">
                                    Colony ID: {hiveCode}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center gap-1.5">
                        <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border",
                            safe.isSensorOnline
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : safe.timestamp.isStale
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                    : "bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20"
                        )}>
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                safe.isSensorOnline ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                            )} />
                            {safe.isSensorOnline ? "LIVE STREAM" : safe.timestamp.isStale ? "STALE DATA" : "OFFLINE"}
                        </span>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                    {/* Temperature */}
                    <div className="p-3 rounded-xl bg-background/80 border border-border/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted-foreground text-xs">
                            <span className="font-semibold uppercase tracking-wider text-[10px]">Brood Core</span>
                            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <div className="mt-2">
                            <div className="text-xl sm:text-2xl font-black font-mono text-foreground">
                                {safe.temperature.formatted}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium block truncate mt-0.5",
                                safe.temperature.isOptimal ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                            )}>
                                {safe.temperature.statusText}
                            </span>
                        </div>
                    </div>

                    {/* Humidity */}
                    <div className="p-3 rounded-xl bg-background/80 border border-border/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted-foreground text-xs">
                            <span className="font-semibold uppercase tracking-wider text-[10px]">Humidity</span>
                            <Droplets className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <div className="mt-2">
                            <div className="text-xl sm:text-2xl font-black font-mono text-foreground">
                                {safe.humidity.formatted}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium block truncate mt-0.5",
                                safe.humidity.isOptimal ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                            )}>
                                {safe.humidity.statusText}
                            </span>
                        </div>
                    </div>

                    {/* Weight Scale */}
                    <div className="p-3 rounded-xl bg-background/80 border border-border/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted-foreground text-xs">
                            <span className="font-semibold uppercase tracking-wider text-[10px]">Hive Mass</span>
                            <Scale className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <div className="mt-2">
                            <div className="text-xl sm:text-2xl font-black font-mono text-foreground">
                                {safe.weight.formatted}
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground block truncate mt-0.5">
                                {safe.weight.statusText}
                            </span>
                        </div>
                    </div>

                    {/* Battery */}
                    <div className="p-3 rounded-xl bg-background/80 border border-border/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-muted-foreground text-xs">
                            <span className="font-semibold uppercase tracking-wider text-[10px]">Battery</span>
                            {safe.battery.isCritical ? (
                                <BatteryWarning className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                            ) : safe.battery.isLow ? (
                                <Battery className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                                <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                        </div>
                        <div className="mt-2">
                            <div className={cn(
                                "text-xl sm:text-2xl font-black font-mono",
                                safe.battery.isCritical ? "text-red-600 dark:text-red-400" : "text-foreground"
                            )}>
                                {safe.battery.formatted}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium block truncate mt-0.5",
                                safe.battery.isCritical ? "text-red-600 dark:text-red-400 font-bold" : "text-muted-foreground"
                            )}>
                                {safe.battery.statusText}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Sync & Signal Info */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                        <span>Last packet: <strong className="text-foreground font-semibold">{safe.timestamp.formatted}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Wifi className={cn(
                                "w-3.5 h-3.5",
                                safe.signal.quality === 'excellent' ? "text-emerald-500" :
                                safe.signal.quality === 'good' ? "text-blue-500" :
                                safe.signal.quality === 'weak' ? "text-amber-500" : "text-red-500"
                            )} />
                            <span className="font-mono text-[11px]">{safe.signal.formatted}</span>
                        </div>
                    </div>
                </div>
            </div>
        </SensorErrorBoundary>
    );
};
