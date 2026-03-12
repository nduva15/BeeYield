import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Bell, Clock, Activity, Loader2, AlertTriangle, CheckCircle2, ShieldAlert, RefreshCw, Layers
} from 'lucide-react';
import beeyieldService, { SensorAlert, Hive, Apiary } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

const SensorAlertsView: React.FC = () => {
    const [alerts, setAlerts] = React.useState<SensorAlert[]>([]);
    const [hives, setHives] = React.useState<Hive[]>([]);
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<'active' | 'resolved' | 'all'>('active');

    const loadData = async () => {
        setLoading(true);
        try {
            const resolvedFilter = filter === 'all' ? undefined : (filter === 'resolved');
            const [alertData, hiveData, apiaryData] = await Promise.all([
                beeyieldService.getSensorAlerts(resolvedFilter),
                beeyieldService.getHives(),
                beeyieldService.getApiaries()
            ]);
            setAlerts(alertData);
            setHives(hiveData);
            setApiaries(apiaryData);
        } catch (error) {
            console.error('Failed to load sensor alerts', error);
            toast.error('Could not load alerts.');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [filter]);

    const getHiveName = (hiveId: string) => {
        const hive = hives.find(h => h.id === hiveId);
        return hive ? hive.hive_code : 'Unknown Hive';
    };

    const getApiaryName = (apiaryId: string) => {
        const apiary = apiaries.find(a => a.id === apiaryId);
        return apiary ? apiary.name : 'Unknown Location';
    };

    const handleResolve = async (alertId: string) => {
        const { success } = await beeyieldService.resolveSensorAlert(alertId, 'Resolved from dashboard');
        if (success) {
            setAlerts(prev => prev.filter(a => a.id !== alertId));
            loadData();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-8 -m-8 pb-24 space-y-16")}
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 pb-12 border-b border-[#F4D03F]/10">
                <div className="space-y-6">
                    <div className={cn(glass.badge, 'bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20 px-8 py-2.5 shadow-3xl skew-x-[-12deg]')}>
                        <div className="flex items-center gap-4 skew-x-[12deg]">
                            <ShieldAlert className="w-5 h-5" />
                            <span className="uppercase tracking-[0.4em] font-black italic text-[12px]">System Alerts</span>
                        </div>
                    </div>
                    <h1 className="text-8xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Alert <span className="text-[#F4D03F]">Feed</span>
                    </h1>
                </div>

                <div className="flex bg-gray-400 p-3 rounded-[3rem] border border-[#F4D03F]/20 gap-3 shadow-4xl relative overflow-hidden group">
                    {(['active', 'resolved', 'all'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-10 py-3 rounded-full text-[12px] font-black uppercase tracking-[0.2em] italic transition-all duration-700 relative z-10",
                                filter === f ? "bg-[#FFF9F0] text-[#F4D03F] shadow-4xl" : "text-muted-foreground/30 hover:text-[#F4D03F] hover:bg-[#F4D03F]/5"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alert List */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(glass.card, "p-0 overflow-hidden bg-[#FFF9F0]/80 backdrop-blur-3xl rounded-[6rem] relative")}
            >
                <div className="p-16 border-b border-[#F4D03F]/10 bg-gray-400 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[2rem] bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-4xl">
                            <Bell className="w-8 h-8 text-[#F4D03F]" />
                        </div>
                        <h2 className="text-5xl font-black italic tracking-tighter uppercase">Notifications</h2>
                    </div>
                </div>

                <div className="divide-y divide-gray-100 bg-gray-200">
                    <AnimatePresence mode="popLayout">
                        {loading && alerts.length === 0 ? (
                            <div className="p-48 flex flex-col items-center justify-center gap-10">
                                <Loader2 className="w-16 h-16 animate-spin text-[#F4D03F]" />
                                <span className="text-xl font-black italic uppercase opacity-40">Syncing data...</span>
                            </div>
                        ) : alerts.length === 0 ? (
                            <div className="p-48 flex flex-col items-center justify-center space-y-10 group/null opacity-20">
                                <CheckCircle2 className="w-32 h-32" />
                                <h3 className="text-6xl font-black italic tracking-tighter uppercase">All Clear</h3>
                                <p className="text-2xl italic uppercase tracking-widest pl-4 border-l-8 border-[#F4D03F]/40">No {filter !== 'all' ? filter : ''} items to show.</p>
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={alert.id}
                                    className="p-12 flex flex-col xl:flex-row xl:items-center justify-between hover:bg-[#F4D03F]/5 transition-all duration-700 group relative overflow-hidden"
                                >
                                    <div className="flex items-start gap-10 flex-1">
                                        <div className={cn("w-2.5 h-20 rounded-full", alert.resolved ? "bg-[#1B9157]" : alert.severity === 'critical' ? "bg-red-500" : "bg-[#F4D03F]")} />
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-6">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center border-2 shadow-4xl",
                                                    alert.resolved ? "bg-[#1B9157]/ border-[#1B9157]/ text-[#1B9157]" : alert.severity === 'critical' ? "bg-red-500/10 border-red-500/20 text-red-500 shadow-red-500/20" : "bg-[#F4D03F]/ border-amber-500/20 text-[#F4D03F] shadow-amber-500/20"
                                                )}>
                                                    {alert.resolved ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                                                </div>
                                                <h4 className="text-4xl font-black italic uppercase tracking-tighter group-hover:text-[#F4D03F] transition-colors">{alert.alert_type} Alert</h4>
                                            </div>
                                            <p className="text-2xl font-black italic text-foreground opacity-60 leading-tight pl-2 border-l-8 border-[#F4D03F]/10">{alert.message}</p>
                                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                                <span className={cn(glass.badge, "bg-gray-400 shadow-4xl px-8 py-2.5 skew-x-[-12deg]")}>
                                                    <span className="skew-x-[12deg] font-black italic uppercase text-[12px] opacity-40">{getHiveName(alert.hive_id)} · {getApiaryName(alert.apiary_id)}</span>
                                                </span>
                                                <span className="text-[14px] font-black italic opacity-20 uppercase tracking-widest">{new Date(alert.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row items-center gap-8 mt-10 xl:mt-0 xl:pl-0 shrink-0">
                                        <div className="flex gap-4">
                                            <div className={cn("px-8 py-3 rounded-full font-black italic text-[12px] uppercase shadow-4xl",
                                                alert.severity === 'critical' ? "bg-red-500 text-[#1A1A1A]" : alert.severity === 'warning' ? "bg-[#F4D03F] text-[#1A1A1A]" : "bg-[#1B9157] text-white"
                                            )}>
                                                {alert.severity}
                                            </div>
                                            <div className={cn("px-8 py-3 rounded-full font-black italic text-[12px] uppercase border shadow-4xl",
                                                alert.resolved ? 'bg-[#1B9157]/ text-[#1B9157] border-[#1B9157]/' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                            )}>
                                                {alert.resolved ? 'RESOLVED' : 'URGENT'}
                                            </div>
                                        </div>
                                        {!alert.resolved && (
                                            <button
                                                onClick={() => handleResolve(alert.id)}
                                                className={cn(glass.btnSecondary, "h-14 px-10 text-[12px] font-black uppercase italic rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-[#1B9157] hover:text-white border-[#F4D03F]/10")}
                                            >
                                                Resolve
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>

                    <div className="p-10 bg-gray-400 flex justify-center border-t border-[#F4D03F]/10">
                        <button
                            onClick={loadData}
                            className={cn(glass.btnSecondary, "h-16 px-12 rounded-full text-xs font-black uppercase italic border-[#F4D03F]/10 opacity-40 hover:opacity-100 hover:text-[#F4D03F] transition-all flex items-center gap-4")}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                            {loading ? 'Syncing...' : 'Refresh Feed'}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
                <div className={cn(glass.card, "p-0 overflow-hidden bg-[#FFF9F0]/60 backdrop-blur-3xl rounded-[4rem]")}>
                    <div className="p-12 border-b border-[#F4D03F]/10 bg-gray-400">
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase">Alert Summary</h3>
                        <p className={cn(glass.microLabel, "opacity-40 italic mt-2")}>Alerts by priority</p>
                    </div>
                    <div className="p-16 space-y-12 bg-gray-200">
                        {(['critical', 'warning', 'info'] as const).map(s => {
                            const count = alerts.filter(e => e.severity === s).length;
                            const total = alerts.length || 1;
                            const pct = (count / total) * 100;
                            return (
                                <div key={s} className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <span className={cn("text-[14px] font-black italic uppercase tracking-widest opacity-40", s === 'critical' ? 'text-red-500' : s === 'warning' ? 'text-[#F4D03F]' : 'text-[#1B9157]')}>Priority: {s}</span>
                                        <span className={cn("text-5xl font-black italic tracking-tighter leading-none", s === 'critical' ? 'text-red-500' : s === 'warning' ? 'text-[#F4D03F]' : 'text-[#1B9157]')}>{count}</span>
                                    </div>
                                    <div className="h-4 w-full bg-[#F9F7F2] rounded-full overflow-hidden shadow-inner p-[2px] border border-[#F4D03F]/10">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                            className={cn("h-full rounded-full shadow-2xl relative",
                                                s === 'critical' ? "bg-red-500" : s === 'warning' ? "bg-[#F4D03F]" : "bg-[#1B9157]"
                                            )}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                        </motion.div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className={cn(glass.card, "p-0 overflow-hidden relative bg-[#F4D03F] text-[#1A1A1A] rounded-[4rem] group")}>
                    <div className="absolute inset-0 bg-gradient-to-br from-honey to-honey-dark opacity-90 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 p-12 border-b border-black/10">
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase">System Health</h3>
                    </div>
                    <div className="relative z-10 p-16 space-y-12 flex flex-col h-full justify-between">
                        <div className="p-10 rounded-[3rem] bg-gray-200 border border-white/40 flex items-center justify-between shadow-4xl group-hover:scale-105 transition-transform">
                            <div className="space-y-2">
                                <h4 className="text-3xl font-black italic uppercase">All Systems Normal</h4>
                                <p className="text-lg font-black italic opacity-60">No urgent issues detected.</p>
                            </div>
                            <div className="w-20 h-20 rounded-[2.5rem] bg-[#1B9157]/ flex items-center justify-center border border-[#1B9157]/">
                                <CheckCircle2 className="w-10 h-10 text-[#1B9157]" />
                            </div>
                        </div>
                        <button
                            onClick={loadData}
                            className="w-full h-24 bg-[#FFF9F0] text-[#F4D03F] rounded-[3.5rem] font-black italic text-3xl uppercase shadow-4xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-10"
                        >
                            <RefreshCw className="w-10 h-10" />
                            Check Status
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 2.5s infinite linear; }
                .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default SensorAlertsView;
