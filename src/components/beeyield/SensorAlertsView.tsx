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

            {/* Alert List */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-0 overflow-hidden bg-white border-gray-200 shadow-sm")}
            >
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                            <Bell className="w-4 h-4 text-muted-foreground/70" />
                        </div>
                        <h2 className="text-sm font-bold text-foreground tracking-tight">Notifications</h2>
                    </div>
                    <button 
                        onClick={loadData}
                        className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100"
                    >
                        <RefreshCw className={cn("w-4 h-4 text-muted-foreground/70", loading && "animate-spin")} />
                    </button>
                </div>

                <div className="divide-y divide-gray-100">
                    <AnimatePresence mode="popLayout">
                        {loading && alerts.length === 0 ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-[#F4D03F]" />
                                <span className="text-xs font-bold text-muted-foreground/70">Syncing Matrix...</span>
                            </div>
                        ) : alerts.length === 0 ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-4 text-gray-200">
                                <CheckCircle2 className="w-16 h-16" />
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-gray-300">All Clear</h3>
                                    <p className="text-xs font-medium text-muted-foreground/70">No {filter !== 'all' ? filter : ''} items to show.</p>
                                </div>
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={alert.id}
                                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50/50 transition-all group gap-4"
                                >
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105",
                                            alert.resolved ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                                            alert.severity === 'critical' ? "bg-red-50 border-red-100 text-red-500" : 
                                            "bg-amber-50 border-amber-100 text-amber-600"
                                        )}>
                                            {alert.resolved ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-sm font-bold text-foreground tracking-tight">{alert.alert_type} Alert</h4>
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                                                    alert.severity === 'critical' ? "bg-red-50 text-red-600 border-red-100" : 
                                                    alert.severity === 'warning' ? "bg-amber-50 text-amber-600 border-amber-100" : 
                                                    "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                )}>{alert.severity.toUpperCase()}</span>
                                            </div>
                                            <p className="text-xs font-medium text-muted-foreground leading-relaxed border-l-2 border-gray-100 pl-3 group-hover:border-[#F4D03F] transition-colors">{alert.message}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                                                     <div className="w-1 h-1 rounded-full bg-gray-400" />
                                                     <span className="text-[10px] font-bold text-muted-foreground/70 tracking-tighter sm:tracking-normal">{getHiveName(alert.hive_id)}</span>
                                                </div>
                                                {alert.apiary_id && (
                                                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 px-2 py-0.5 rounded-md">
                                                        <div className="w-1 h-1 rounded-full bg-[#F4D03F]" />
                                                        <span className="text-[10px] font-bold text-muted-foreground tracking-tighter sm:tracking-normal">
                                                            {getApiaryName(alert.apiary_id)}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="text-[10px] font-medium text-gray-300">{new Date(alert.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 self-end sm:self-center">
                                        {!alert.resolved && (
                                            <button
                                                onClick={() => handleResolve(alert.id)}
                                                className={cn(glass.btnSecondary, "h-8 px-4 text-[10px] font-bold rounded-lg bg-white border-gray-200 sm:opacity-0 sm:group-hover:opacity-100 transition-all")}
                                            >
                                                Resolve
                                            </button>
                                        )}
                                        {alert.resolved && (
                                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 shadow-none font-bold text-[10px] h-8 px-3 rounded-lg">Resolved</Badge>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
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

