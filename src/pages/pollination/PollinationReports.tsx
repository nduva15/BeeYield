import React from 'react';
import {
    FileBarChart,
    Terminal,
    Activity,
    Download,
    CheckCircle2,
    AlertTriangle,
    Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from '@/components/beeyield/GlassTheme';

const PollinationReports: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            <PageHeader
                icon={FileBarChart}
                label="Site reports"
                title={<>Site <span className="text-primary">Reports</span></>}
                subtitle="Enterprise audit, compliance documentation, and pollination performance analytics."
                actions={
                    <button className={cn(glass.btnSecondary, "gap-2")}>
                        <Download className="w-4 h-4 text-primary" />
                        Export All
                    </button>
                }
            />

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {/* Bloom Saturation Report */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.4 }}
                    className={cn(glass.section, "overflow-hidden")}
                >
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-emerald-500/5">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Terminal className="w-4 h-4 text-emerald-600" />
                            </div>
                            <h4 className="text-sm font-bold text-foreground">Bloom Saturation Report</h4>
                        </div>
                        <span className={cn(glass.badge, "bg-emerald-500/10 text-emerald-600 border-emerald-500/20")}>Active</span>
                    </div>
                    <div className="p-6 space-y-5">
                        {[
                            { label: 'Period Coverage', value: 'MAR 14 – MAR 28' },
                            { label: 'Peak Saturation', value: '92.4%', highlight: true },
                            { label: 'Foraging Overlap', value: '88.1%' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-2.5 border-b border-border last:border-b-0">
                                <span className={glass.microLabel}>{item.label}</span>
                                <span className={cn("text-sm font-bold", item.highlight ? "text-emerald-600" : "text-foreground")}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                        <button className={cn(glass.btnPrimary, "w-full mt-2 gap-2")}>
                            <Download className="w-4 h-4" />
                            Export Geodata (.CSV)
                        </button>
                    </div>
                </motion.div>

                {/* Hive Efficiency Audit */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className={cn(glass.section, "overflow-hidden")}
                >
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-primary/5">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-primary" />
                            </div>
                            <h4 className="text-sm font-bold text-foreground">Hive Efficiency Audit</h4>
                        </div>
                        <span className={cn(glass.badge, "py-1")}>Review</span>
                    </div>
                    <div className="p-6 space-y-5">
                        {[
                            { label: 'Audit Units', value: '45 Nodes' },
                            { label: 'Underperforming', value: '2 Units', danger: true },
                            { label: 'Avg Colony Health', value: 'Optimal', highlight: true },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-2.5 border-b border-border last:border-b-0">
                                <span className={glass.microLabel}>{item.label}</span>
                                <span className={cn(
                                    "text-sm font-bold",
                                    item.danger ? "text-red-500" : item.highlight ? "text-emerald-600" : "text-foreground"
                                )}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                        <button className={cn(glass.btnSecondary, "w-full mt-2 gap-2")}>
                            <Activity className="w-4 h-4 text-primary" />
                            Run Deep Diagnostic
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Audit Logs */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className={cn(glass.section, "overflow-hidden relative z-10")}
            >
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-border flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Recent Audit Logs</h3>
                    </div>
                </div>
                <div className="divide-y divide-border">
                    {[
                        {
                            time: '2026.03.14 09:42',
                            type: 'System',
                            message: 'Automated bloom report generated for Sector 7G.',
                            icon: CheckCircle2,
                            iconClass: 'text-emerald-500',
                        },
                        {
                            time: '2026.03.13 14:10',
                            type: 'System',
                            message: 'Wait time for Node_Alpha exceeding threshold (Colony Activity Spike).',
                            icon: AlertTriangle,
                            iconClass: 'text-amber-500',
                        },
                        {
                            time: '2026.03.12 23:58',
                            type: 'Audit Alert',
                            message: 'Manual override detected at Gate_Beta. Logging session.',
                            icon: AlertTriangle,
                            iconClass: 'text-red-500',
                        },
                    ].map((log, i) => (
                        <div key={i} className="px-5 py-4 flex items-start gap-4 hover:bg-muted/20 transition-colors">
                            <div className={cn("w-8 h-8 rounded-lg bg-muted/30 border border-border flex items-center justify-center flex-shrink-0 mt-0.5")}>
                                <log.icon className={cn("w-4 h-4", log.iconClass)} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-[11px] font-bold text-primary tabular-nums">{log.time}</span>
                                    <span className={cn(glass.badge, "text-[9px]")}>{log.type}</span>
                                </div>
                                <p className="text-[12px] font-medium text-foreground mt-1 leading-relaxed">{log.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PollinationReports;
