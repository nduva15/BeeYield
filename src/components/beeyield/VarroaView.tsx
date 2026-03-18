import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, ShieldCheck, Microscope, History, ChevronRight, BarChart3, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import beeyieldService from '@/services/beeyieldService';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

const VarroaView: React.FC = () => {
    const [hives, setHives] = React.useState<{ id: string; infestation: number; status: string; trend: string; method: string; date: string }[]>([]);
    const [treatments, setTreatments] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [readings, treatmentData] = await Promise.all([
                    beeyieldService.getVarroaReadings(),
                    beeyieldService.getVarroaTreatments(),
                ]);

                if (readings && readings.length > 0) {
                    const mapped = readings.map((r: any) => ({
                        id: r.hive_id?.slice(0, 5) || r.id?.slice(0, 5) || 'H-???',
                        infestation: r.infestation_rate ?? 0,
                        status: r.infestation_rate >= 5 ? 'critical' : r.infestation_rate >= 3 ? 'warning' : 'safe',
                        trend: 'stable',
                        method: r.method || 'alcohol_wash',
                        date: r.reading_date || '-',
                    }));
                    setHives(mapped);
                } else {
                    setHives([]);
                }

                setTreatments(treatmentData || []);
            } catch (err) {
                console.error('Error loading varroa data:', err);
                setHives([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = React.useMemo(() => {
        const safe = hives.filter(h => h.status === 'safe').length;
        const warning = hives.filter(h => h.status === 'warning').length;
        const critical = hives.filter(h => h.status === 'critical').length;
        const avg = hives.length > 0 ? (hives.reduce((s, h) => s + h.infestation, 0) / hives.length).toFixed(1) : '0.0';
        return { total: hives.length, safe, warning, critical, avg };
    }, [hives]);

    const criticalHive = hives.find(h => h.status === 'critical');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-6 h-6 animate-spin text-[#F4D03F]" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Microscope}
                label="Hive health"
                title="Varroa Analysis"
                subtitle="Review infestation risk and next steps."
                actions={
                    <button className={cn(glass.btnPrimary, "h-10 px-6 font-black text-[10px] rounded-xl")}>
                        <Microscope className="w-4 h-4" />
                        <span>Run check</span>
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassStatCard label="Total Hives" value={stats.total} icon={Microscope} index={0} />
                <GlassStatCard label="Safe" value={stats.safe} icon={ShieldCheck} index={1} color="text-[#1B9157]" />
                <GlassStatCard label="Warning" value={stats.warning} icon={AlertTriangle} index={2} color="text-[#F4D03F]" />
                <GlassStatCard label="Avg Rate" value={`${stats.avg}%`} icon={BarChart3} index={3} color="text-red-500" />
            </div>

            {/* Alert Banner */}
            {criticalHive && (
                <div className={cn(glass.card, "p-4 border-red-500/30 bg-red-500/5 shadow-red-500/10 flex items-center gap-4 relative overflow-hidden")}>
                    <div className="absolute inset-0 opacity-[0.03] bg-red-500 blur-xl pointer-events-none" />
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0 border border-red-500/20 relative z-10">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 relative z-10">
                        <h3 className="text-[10px] font-black text-red-700 mb-0.5">High infestation</h3>
                        <p className="text-[11px] font-black text-red-600/60 tracking-tighter">
                            Hive {criticalHive.id} shows a {criticalHive.infestation}% infestation rate. Treatment recommended within 48 hours.
                        </p>
                    </div>
                    <button className={cn(glass.btnPrimary, "h-9 px-4 bg-red-500 border-red-600 text-white font-black text-[9px] rounded-xl relative z-10")}>
                        Treatment steps
                    </button>
                </div>
            )}

            {/* Hive Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {hives.map(hive => (
                    <div key={hive.id} className={cn(glass.card, "p-4 space-y-4 border-white/40 shadow-sm relative overflow-hidden group hover:border-[#F4D03F]/40 transition-all")}>
                        <div className={cn(
                            "absolute top-0 left-0 w-full h-1",
                            hive.status === 'safe' ? "bg-[#1B9157]" : hive.status === 'warning' ? "bg-[#F4D03F]" : "bg-red-500"
                        )} />
                        <div className="flex justify-between items-start">
                            <span className={glass.microLabel}>{hive.id}</span>
                            <div className={cn(
                                glass.badge,
                                "border-none",
                                hive.status === 'safe' ? "bg-[#1B9157]/10 text-[#1B9157]" : hive.status === 'warning' ? "bg-[#F4D03F]/10 text-[#F4D03F]" : "bg-red-500/10 text-red-500"
                            )}>
                                {hive.status.toUpperCase()}
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-2xl font-black text-[#1A1A1A] tabular-nums tracking-tighter leading-none">{hive.infestation}%</p>
                            <p className={glass.microLabel}>Infestation Rate</p>
                        </div>
                        <div className="pt-3 border-t border-[#F4D03F]/10 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className={cn("w-3 h-3", hive.trend === 'up' ? "text-red-500" : hive.trend === 'down' ? "text-[#1B9157]" : "text-gray-400")} />
                                <span className="text-[8px] font-black text-gray-400">{hive.trend}</span>
                            </div>
                            <span className="text-[7px] font-black text-gray-300">Audit Nominal</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Historic Trend */}
                {/* Historic Trend */}
                <div className={cn(glass.card, "p-5 space-y-4 border-white/40 shadow-sm")}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1B9157]/10 flex items-center justify-center border border-[#1B9157]/20">
                            <History className="w-4 h-4 text-[#1B9157]" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className={glass.sectionTitle}>Historic Trends</h3>
                            <p className={glass.microLabel}>Infestation levels last 30-day epoch.</p>
                        </div>
                    </div>
                    <div className="h-[200px] w-full bg-white/20 rounded-2xl flex flex-col items-center justify-center border border-dashed border-[#F4D03F]/20 relative group">
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F4D03F 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <BarChart3 className="w-10 h-10 text-[#F4D03F]/20 group-hover:scale-110 transition-transform duration-500" />
                        <span className="text-[8px] font-black text-gray-400 mt-2">Updating data stream...</span>
                    </div>
                </div>

                {/* Recommended Actions */}
                {/* Recommended Actions */}
                <div className={cn(glass.card, "p-5 space-y-4 border-white/40 shadow-sm")}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20">
                            <ShieldCheck className="w-4 h-4 text-[#F4D03F]" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className={glass.sectionTitle}>Action Protocols</h3>
                            <p className={glass.microLabel}>Recommended field mitigation procedures.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {(treatments.length > 0 ? treatments.slice(0, 3) : [
                            { treatment_type: 'oxalic_acid', notes: 'Scheduled for next maintenance' },
                            { treatment_type: 'biotechnical', notes: 'Effective biological control' },
                            { treatment_type: 'formic_acid', notes: 'For high infestation levels' },
                        ]).map((t: any, i: number) => (
                            <div key={i} className="p-3.5 rounded-xl bg-white/40 border border-[#F4D03F]/10 flex items-center justify-between group cursor-pointer hover:border-[#F4D03F]/40 transition-all">
                                <div className="space-y-0.5">
                                    <h4 className="font-black text-[#1A1A1A] text-[11px] tracking-tight transition-colors group-hover:text-[#F4D03F]">{(t.treatment_type || 'treatment').replace(/_/g, ' ')}</h4>
                                    <p className="text-[8px] font-black text-gray-400">{t.notes || 'Registry Entry Empty'}</p>
                                </div>
                                <div className="w-7 h-7 rounded-lg bg-white border border-transparent group-hover:border-[#F4D03F]/20 flex items-center justify-center transition-all">
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#F4D03F] transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VarroaView;
