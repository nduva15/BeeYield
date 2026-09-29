import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Bell, Loader2, AlertTriangle, CheckCircle2, ShieldAlert, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import { useSensorAlerts, useResolveAlert } from '@/hooks/useSensorAlerts';
import { CalibratedAlertsList } from '@/components/telemetry/CalibratedAlertsList';

const SensorAlertsView: React.FC = () => {
    const [filter, setFilter] = React.useState<'active' | 'resolved' | 'all'>('active');
    
    // Data Hooks
    const resolvedFilter = filter === 'all' ? undefined : (filter === 'resolved');
    const { data: alertsData, isLoading: alertsLoading, refetch: refetchAlerts } = useSensorAlerts(resolvedFilter);
    const { data: hivesData, isLoading: hivesLoading } = useHives();
    const { data: apiariesData, isLoading: apiariesLoading } = useApiaries();
    
    // Mutations
    const resolveMutation = useResolveAlert();

    const alerts = alertsData || [];
    const hives = hivesData || [];
    const apiaries = apiariesData || [];
    
    const loading = alertsLoading || hivesLoading || apiariesLoading;

    const loadData = () => {
        refetchAlerts();
    };

    const getHiveName = (hiveId: string) => {
        const hive = hives.find(h => h.id === hiveId);
        return hive ? hive.hive_code : 'Unknown Hive';
    };

    const getApiaryName = (apiaryId: string) => {
        const apiary = apiaries.find(a => a.id === apiaryId);
        return apiary ? apiary.name : 'Unknown Location';
    };

    const handleResolve = async (alertId: string) => {
        await resolveMutation.mutateAsync({ id: alertId, notes: 'Resolved from dashboard' });
    };

    return (
        <BeeYieldPageShell className="p-4 lg:p-6 space-y-6 pb-20">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={glass.page}
            >
            <BeeYieldPageHeader
                icon={ShieldAlert}
                label="System Alerts"
                title={<>Alert <span className="text-[#1B9157]">Feed</span></>}
                subtitle="Real-time registry of sensor exceptions, environmental hazards, and colony stress signals."
                actions={
                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                        {(['active', 'resolved', 'all'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    filter === f ? "bg-white text-foreground shadow-sm" : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/"
                                )}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                }
            />

            {/* 3-Tier Calibrated Alert List (Eliminates Alert Fatigue) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-4 sm:p-6 bg-white border-gray-200 shadow-sm")}
            >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-xs">
                            <Bell className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-foreground tracking-tight">Calibrated Telemetry Alarms</h2>
                            <p className="text-[11px] text-muted-foreground">Classified into 3 distinct tiers: Critical Emergency, Operational Warning, and Routine Log.</p>
                        </div>
                    </div>
                    <button 
                        onClick={loadData}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                        title="Sync latest alerts"
                    >
                        <RefreshCw className={cn("w-4 h-4 text-muted-foreground", loading && "animate-spin")} />
                    </button>
                </div>

                {loading && alerts.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#F4D03F]" />
                        <span className="text-xs font-bold text-muted-foreground">Syncing Alert Matrix...</span>
                    </div>
                ) : (
                    <CalibratedAlertsList alerts={alerts} onResolve={handleResolve} />
                )}
            </motion.div>

            {/* Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className={cn(glass.card, "lg:col-span-7 p-0 overflow-hidden bg-white border-gray-200 shadow-sm")}>
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-bold text-foreground tracking-tight">Priority Distribution</h3>
                    </div>
                    <div className="p-6 space-y-5">
                        {(['critical', 'warning', 'info'] as const).map(s => {
                            const count = alerts.filter(e => e.severity === s).length;
                            const total = alerts.length || 1;
                            const pct = (count / total) * 100;
                            return (
                                <div key={s} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                             <div className={cn("w-1.5 h-1.5 rounded-full", s === 'critical' ? 'bg-red-500' : s === 'warning' ? 'bg-[#F4D03F]' : 'bg-[#1B9157]')} />
                                             <span className="text-[10px] font-bold tracking-wider text-muted-foreground/70">{s}</span>
                                        </div>
                                        <span className="text-sm font-bold text-foreground">{count} Nodes</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1 }}
                                            className={cn("h-full rounded-full",
                                                s === 'critical' ? "bg-red-500" : s === 'warning' ? "bg-[#F4D03F]" : "bg-[#1B9157]"
                                            )}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className={cn(glass.card, "lg:col-span-5 p-6 bg-emerald-50 border-emerald-100 flex flex-col justify-between shadow-sm relative overflow-hidden group")}>
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-muted/ blur-3xl rounded-full" />
                    <div className="relative z-10 flex items-start justify-between">
                         <div className="space-y-1">
                            <h3 className="text-sm font-bold text-emerald-700 tracking-tight">System Status</h3>
                            <p className="text-xs font-medium text-emerald-600/70">No critical hazards pending.</p>
                         </div>
                         <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                         </div>
                    </div>
                    
                    <button
                        onClick={loadData}
                        className="relative z-10 w-full mt-8 h-10 bg-white text-foreground border border-emerald-100 rounded-xl font-bold text-xs shadow-sm hover:bg-emerald-500 hover:text-white hover:border-emerald-600 transition-all flex items-center justify-center gap-3"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Run System Audit
                    </button>
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
            `}</style>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default SensorAlertsView;

