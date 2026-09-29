import React, { useState } from 'react';
import {
    ShieldAlert,
    AlertTriangle,
    Info,
    CheckCircle2,
    Clock,
    Filter,
    Battery,
    Bug,
    Flame,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SensorAlert } from '@/services/beeyieldService';
import { classifyAlertTier, AlertTier } from '@/lib/alertHierarchy';

interface CalibratedAlertsListProps {
    alerts: SensorAlert[];
    onResolve?: (alertId: string) => void;
    className?: string;
}

export const CalibratedAlertsList: React.FC<CalibratedAlertsListProps> = ({
    alerts = [],
    onResolve,
    className
}) => {
    const [selectedTier, setSelectedTier] = useState<AlertTier | 'all'>('all');

    const classifiedAlerts = alerts.map(a => {
        const classification = classifyAlertTier(a);
        return {
            ...a,
            ...classification
        };
    });

    const criticalCount = classifiedAlerts.filter(a => a.tier === 'tier1_critical' && !a.resolved).length;
    const warningCount = classifiedAlerts.filter(a => a.tier === 'tier2_warning' && !a.resolved).length;
    const advisoryCount = classifiedAlerts.filter(a => a.tier === 'tier3_advisory').length;

    const filtered = classifiedAlerts.filter(a => {
        if (selectedTier === 'all') return true;
        return a.tier === selectedTier;
    });

    return (
        <div className={cn("space-y-4", className)}>
            {/* Critical Alarm Callout Banner (Only shown if Tier 1 Critical alerts exist) */}
            {criticalCount > 0 && (
                <div className="rounded-2xl border-2 border-red-500 bg-red-50 dark:bg-red-950/40 p-4 sm:p-5 flex items-start gap-4 shadow-md animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                                EMERGENCY LEVEL 1
                            </span>
                            <span className="text-xs font-mono font-bold text-red-700 dark:text-red-300">
                                {criticalCount} Critical Biological Alarm{criticalCount > 1 ? 's' : ''}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-red-950 dark:text-red-100 mt-1">
                            Urgent hive intervention required. Immediate response recommended to avoid colony loss.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelectedTier('tier1_critical')}
                        className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs active:scale-95"
                    >
                        View Critical ({criticalCount})
                    </button>
                </div>
            )}

            {/* Filter Tabs by Tier */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
                <button
                    type="button"
                    onClick={() => setSelectedTier('all')}
                    className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border",
                        selectedTier === 'all'
                            ? "bg-stone-900 text-white dark:bg-white dark:text-black border-transparent shadow-xs"
                            : "bg-card text-muted-foreground border-border hover:text-foreground"
                    )}
                >
                    All Signals ({classifiedAlerts.length})
                </button>

                <button
                    type="button"
                    onClick={() => setSelectedTier('tier1_critical')}
                    className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                        selectedTier === 'tier1_critical'
                            ? "bg-red-600 text-white border-red-700 shadow-xs"
                            : "bg-card text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40 hover:bg-red-50/50"
                    )}
                >
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Tier 1 Critical ({criticalCount})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setSelectedTier('tier2_warning')}
                    className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                        selectedTier === 'tier2_warning'
                            ? "bg-amber-500 text-black border-amber-600 shadow-xs font-black"
                            : "bg-card text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40 hover:bg-amber-50/50"
                    )}
                >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Tier 2 Warnings ({warningCount})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setSelectedTier('tier3_advisory')}
                    className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                        selectedTier === 'tier3_advisory'
                            ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                            : "bg-card text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40 hover:bg-blue-50/50"
                    )}
                >
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Tier 3 Routine Log ({advisoryCount})</span>
                </button>
            </div>

            {/* Alert Items List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card/60 p-8 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                        <h4 className="text-sm font-bold text-foreground">No alerts in this category</h4>
                        <p className="text-xs text-muted-foreground">All monitoring thresholds within safe limits.</p>
                    </div>
                ) : (
                    filtered.map((alert) => {
                        const isCritical = alert.tier === 'tier1_critical';
                        const isWarning = alert.tier === 'tier2_warning';

                        return (
                            <div
                                key={alert.id}
                                className={cn(
                                    "rounded-2xl border p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
                                    isCritical
                                        ? "border-red-400 bg-red-50/30 dark:bg-red-950/20 shadow-xs"
                                        : isWarning
                                            ? "border-amber-300 bg-amber-50/20 dark:bg-amber-950/10"
                                            : "border-border bg-card"
                                )}
                            >
                                <div className="flex items-start gap-3.5 flex-1">
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs font-bold",
                                        isCritical
                                            ? "bg-red-500 text-white border-red-600"
                                            : isWarning
                                                ? "bg-amber-400 text-black border-amber-500"
                                                : "bg-stone-100 dark:bg-stone-800 text-muted-foreground border-border"
                                    )}>
                                        {isCritical ? (
                                            <ShieldAlert className="w-4 h-4" />
                                        ) : isWarning ? (
                                            <AlertTriangle className="w-4 h-4" />
                                        ) : (
                                            <Info className="w-4 h-4" />
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                                                isCritical
                                                    ? "bg-red-600 text-white"
                                                    : isWarning
                                                        ? "bg-amber-400 text-black"
                                                        : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                                            )}>
                                                {isCritical ? "CRITICAL EMERGENCY" : isWarning ? "OPERATIONAL WARNING" : "ROUTINE ADVISORY"}
                                            </span>
                                            <h4 className="text-xs sm:text-sm font-bold text-foreground">
                                                {alert.alert_type || 'Colony Alert'}
                                            </h4>
                                        </div>

                                        <p className="text-xs text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
                                            {alert.message}
                                        </p>

                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                                            <span className="font-mono">Response protocol: within {alert.urgencyHours}h</span>
                                            <span>·</span>
                                            <span>{new Date(alert.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="self-end sm:self-center shrink-0">
                                    {!alert.resolved && onResolve && (
                                        <button
                                            type="button"
                                            onClick={() => onResolve(alert.id)}
                                            className="px-3 py-1.5 rounded-xl border border-border hover:bg-background text-xs font-bold text-foreground transition-colors cursor-pointer active:scale-95"
                                        >
                                            Resolve
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
