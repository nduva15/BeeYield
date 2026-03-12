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
                    setHives([
                        { id: 'H-001', infestation: 1.2, status: 'safe', trend: 'down', method: 'alcohol_wash', date: '-' },
                        { id: 'H-002', infestation: 3.5, status: 'warning', trend: 'up', method: 'sticky_board', date: '-' },
                        { id: 'H-003', infestation: 0.8, status: 'safe', trend: 'stable', method: 'sugar_roll', date: '-' },
                        { id: 'H-004', infestation: 5.2, status: 'critical', trend: 'up', method: 'alcohol_wash', date: '-' },
                    ]);
                }

                setTreatments(treatmentData || []);
            } catch (err) {
                console.error('Error loading varroa data:', err);
                setHives([
                    { id: 'H-001', infestation: 1.2, status: 'safe', trend: 'down', method: 'alcohol_wash', date: '-' },
                    { id: 'H-002', infestation: 3.5, status: 'warning', trend: 'up', method: 'sticky_board', date: '-' },
                    { id: 'H-003', infestation: 0.8, status: 'safe', trend: 'stable', method: 'sugar_roll', date: '-' },
                    { id: 'H-004', infestation: 5.2, status: 'critical', trend: 'up', method: 'alcohol_wash', date: '-' },
                ]);
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
            {/* Header */}
            <PageHeader
                icon={Microscope}
                label="Varroa Monitoring"
                title={<>Varroa <span className="text-[#F4D03F]">Analysis</span></>}
                subtitle="Track mite infestation levels across your colonies and manage treatments."
                actions={
                    <button className={cn(glass.btnPrimary)}>
                        <Microscope className="w-4 h-4" />
                        Run Diagnosis
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
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-0.5">High Infestation Alert</h3>
                        <p className="text-sm text-red-600 font-medium">Hive {criticalHive.id} shows a {criticalHive.infestation}% infestation rate. Treatment recommended within 48 hours.</p>
                    </div>
                    <button className="h-9 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors">
                        Treatment Guide
                    </button>
                </div>
            )}

            {/* Hive Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {hives.map(hive => (
                    <div key={hive.id} className="bg-white border border-[#F4D03F]/10 rounded-2xl p-5 relative overflow-hidden hover:border-[#F4D03F]/30 transition-all shadow-sm">
                        <div className={cn(
                            "absolute top-0 left-0 w-full h-[3px]",
                            hive.status === 'safe' ? "bg-[#1B9157]" : hive.status === 'warning' ? "bg-[#F4D03F]" : "bg-red-500"
                        )} />
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{hive.id}</span>
                            <Badge className={cn(
                                "border-none text-[9px] font-bold uppercase tracking-wider",
                                hive.status === 'safe' ? "bg-[#1B9157]/10 text-[#1B9157]" : hive.status === 'warning' ? "bg-[#F4D03F]/10 text-[#F4D03F]" : "bg-red-500/10 text-red-500"
                            )}>
                                {hive.status}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-[#1A1A1A] tabular-nums">{hive.infestation}%</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Infestation Rate</p>
                        </div>
                        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-[#F4D03F]/10">
                            <TrendingUp className={cn("w-3 h-3", hive.trend === 'up' ? "text-red-500" : hive.trend === 'down' ? "text-[#1B9157]" : "text-gray-400")} />
                            <span className="text-[10px] font-bold text-gray-500 capitalize">{hive.trend} trend</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Historic Trend */}
                <div className="bg-white border border-[#F4D03F]/10 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-[#1B9157]/10 flex items-center justify-center border border-[#1B9157]/20">
                            <History className="w-4 h-4 text-[#1B9157]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Historic Trend</h3>
                            <p className="text-[10px] text-gray-400 font-medium">Infestation levels over the last 30 days.</p>
                        </div>
                    </div>
                    <div className="h-[200px] w-full bg-[#F9F7F2] rounded-xl flex items-center justify-center border border-dashed border-[#F4D03F]/20">
                        <BarChart3 className="w-10 h-10 text-[#F4D03F]/20" />
                    </div>
                </div>

                {/* Recommended Actions */}
                <div className="bg-white border border-[#F4D03F]/10 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20">
                            <ShieldCheck className="w-4 h-4 text-[#F4D03F]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Recommended Actions</h3>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {(treatments.length > 0 ? treatments.slice(0, 3) : [
                            { treatment_type: 'oxalic_acid', notes: 'Scheduled for next maintenance' },
                            { treatment_type: 'biotechnical', notes: 'Effective biological control' },
                            { treatment_type: 'formic_acid', notes: 'For high infestation levels' },
                        ]).map((t: any, i: number) => (
                            <div key={i} className="p-4 rounded-xl bg-[#F9F7F2] border border-[#F4D03F]/10 flex items-center justify-between group cursor-pointer hover:border-[#F4D03F]/20 transition-colors">
                                <div>
                                    <h4 className="font-bold text-[#1A1A1A] text-sm capitalize tracking-tight">{(t.treatment_type || 'treatment').replace(/_/g, ' ')}</h4>
                                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t.notes || 'No additional notes'}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F4D03F] transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VarroaView;
