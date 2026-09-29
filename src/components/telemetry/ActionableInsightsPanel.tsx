import React from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    TrendingUp,
    ShieldAlert,
    HelpCircle,
    Layers,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActionableInsight, evaluateAgronomicInsights, AgronomicTelemetryInputs } from '@/lib/agronomicInsights';

interface ActionableInsightsPanelProps {
    inputs: AgronomicTelemetryInputs;
    onActionClick?: (actionType: string, insight: ActionableInsight) => void;
    className?: string;
}

export const ActionableInsightsPanel: React.FC<ActionableInsightsPanelProps> = ({
    inputs,
    onActionClick,
    className
}) => {
    const insights = evaluateAgronomicInsights(inputs);

    const getSeverityStyles = (severity: ActionableInsight['severity']) => {
        switch (severity) {
            case 'critical':
                return {
                    badge: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
                    border: 'border-red-500/40 bg-red-50/20 dark:bg-red-950/10',
                    icon: ShieldAlert,
                    iconColor: 'text-red-500',
                    btn: 'bg-red-600 hover:bg-red-700 text-white'
                };
            case 'warning':
                return {
                    badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
                    border: 'border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/10',
                    icon: AlertTriangle,
                    iconColor: 'text-amber-500',
                    btn: 'bg-amber-600 hover:bg-amber-700 text-white'
                };
            case 'opportunity':
                return {
                    badge: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
                    border: 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10',
                    icon: TrendingUp,
                    iconColor: 'text-emerald-500',
                    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white'
                };
            default:
                return {
                    badge: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30',
                    border: 'border-border bg-card',
                    icon: CheckCircle2,
                    iconColor: 'text-emerald-500',
                    btn: 'bg-stone-800 hover:bg-stone-900 text-white dark:bg-stone-700'
                };
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-sm sm:text-base text-foreground tracking-tight">
                            Agronomic Diagnostic Engine
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Translating raw multi-spectral sensor telemetry into immediate farm actions
                        </p>
                    </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    {insights.length} INSIGHTS
                </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-1">
                {insights.map((insight) => {
                    const styles = getSeverityStyles(insight.severity);
                    const Icon = styles.icon;

                    return (
                        <div
                            key={insight.id}
                            className={cn(
                                "rounded-2xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between gap-4",
                                styles.border
                            )}
                        >
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn("p-1.5 rounded-lg bg-background border shadow-2xs", styles.iconColor)}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-display font-bold text-sm text-foreground">
                                            {insight.title}
                                        </h4>
                                    </div>
                                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", styles.badge)}>
                                        {insight.severity}
                                    </span>
                                </div>

                                {/* Plain English Diagnosis */}
                                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                                    {insight.plainEnglishDiagnosis}
                                </p>

                                {/* Technical metric summary in muted font */}
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/80 border border-border text-[11px] font-mono text-muted-foreground">
                                    <span>Sensor Trigger:</span>
                                    <span className="font-semibold text-foreground">{insight.technicalMetric}</span>
                                </div>
                            </div>

                            {/* Recommended Action & CTA */}
                            <div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="text-xs text-muted-foreground">
                                    <strong className="text-foreground">Prescription:</strong> {insight.recommendedAction}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onActionClick?.(insight.actionType, insight)}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer",
                                        styles.btn
                                    )}
                                >
                                    <span>{insight.actionLabel}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
