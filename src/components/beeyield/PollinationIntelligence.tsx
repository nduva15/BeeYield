import React from 'react';
import { Brain, TrendingUp, AlertCircle, Building2, FileText, Activity, Cpu, Loader2, FileDown, Plus, Sparkles, ChevronRight, CheckCircle2, Wind, Thermometer, Zap, BarChart3, Clock, MapPin, Globe, Database, ShieldCheck, Target, Binary } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, LineChart, Line, Legend } from 'recharts';
import { beeyieldService } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

interface PollinationIntelligenceProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const FORAGING_PULSE_DATA = [
    { time: '06:00', activity: 5, temp: 12, prob: 10 },
    { time: '08:00', activity: 18, temp: 15, prob: 28 },
    { time: '10:00', activity: 68, temp: 19, prob: 72 },
    { time: '12:00', activity: 88, temp: 23, prob: 96 },
    { time: '14:00', activity: 94, temp: 25, prob: 99 },
    { time: '16:00', activity: 78, temp: 22, prob: 88 },
    { time: '18:00', activity: 35, temp: 18, prob: 45 },
    { time: '20:00', activity: 8, temp: 15, prob: 12 },
];

const PollinationIntelligence: React.FC<PollinationIntelligenceProps> = ({ onTabChange }) => {
    const [activeHub, setActiveHub] = React.useState<string | null>(null);
    const [apiaries, setApiaries] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [exporting, setExporting] = React.useState(false);

    const fetchData = async () => {
        setLoading(true);
        const data = await beeyieldService.getApiaries();
        setApiaries(data);
        if (data.length > 0) setActiveHub(data[0].id);
        setLoading(false);
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleGetReport = async () => {
        if (exporting) return;
        if (!activeHub) {
            toast.error('Select a tactical hub first');
            return;
        }

        const tid = toast.loading('Synchronizing intelligence metrics…');
        setExporting(true);
        try {
            const { data, error } = await beeyieldService.generateReport({
                report_type: 'season',
                parameters: {
                    scope_days: 90,
                    place_id: activeHub,
                    sections: ['overview', 'apiaries', 'hives', 'harvests', 'inspections'],
                },
                file_format: 'PDF',
            } as any);
            if (error || !data?.id) throw error || new Error('Intelligence protocol failure');

            const status = await beeyieldService.waitForReport(String(data.id), { timeoutMs: 90_000 });
            if (status?.file_url) window.open(status.file_url, '_blank');

            await beeyieldService.logExport({
                export_type: 'PDF',
                entity_scope: 'Analysis',
                file_name: status?.file_name || `Intelligence_Report_${activeHub}_${new Date().toISOString().slice(0, 10)}.pdf`,
                record_count: 1,
            });

            toast.success('Strategy protocol synced successfully', { id: tid });
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Protocol sync failure', { id: tid });
        } finally {
            setExporting(false);
        }
    };

    return (
        <BeeYieldPageShell className="relative overflow-hidden">
             {/* Background Atmosphere */}
            <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#10b981]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -left-20 top-1/2 w-80 h-80 bg-[#F4D03F]/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 pb-20 relative z-10"
            >
            <BeeYieldPageHeader
                icon={Brain}
                label="BeeYield AI Intelligence Ops"
                onBack={() => onTabChange?.('home')}
                title={<>Pollination <span className="text-[#1B9157]">Overview</span> Matrix</>}
                subtitle="Detailed multi-variate analytics derived from field nodes and historical foraging vectors."
                actions={
                    <div className="flex items-center gap-3">
                         <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-100 shadow-sm transition-all hover:bg-white/80">
                            <Activity className="w-3.5 h-3.5 text-[#1B9157] animate-pulse" />
                            <span className="text-[10px] font-black text-gray-400 tracking-widest leading-none pt-0.5 uppercase">Model Confidence: 98.4%</span>
                         </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Registered Tactical Hubs */}
                <div className="xl:col-span-4 space-y-6">
                    <div className={cn(glass.section, "flex flex-col h-full overflow-hidden relative shadow-xl border-white/60")}>
                        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-white/40 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 shadow-sm transition-transform hover:rotate-6">
                                    <MapPin className="w-5 h-5 text-[#F4D03F]" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-black text-[#1A1A1A] tracking-tighter uppercase italic">Tactical Hubs</h3>
                                    <p className="text-[9px] font-bold text-[#1B9157] tracking-widest uppercase">{apiaries.length} Verified Nodes</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 space-y-3 overflow-y-auto thin-scrollbar min-h-[400px] bg-gradient-to-b from-transparent to-gray-50/20">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-[#F4D03F]/30" />
                                    <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Synchronizing Nodes...</span>
                                </div>
                            ) : apiaries.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50 flex flex-col items-center justify-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Building2 className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Tactical Hubs Synchronized</p>
                                </div>
                            ) : apiaries.map((apiary) => (
                                <button
                                    key={apiary.id}
                                    onClick={() => setActiveHub(apiary.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all border group relative overflow-hidden",
                                        activeHub === apiary.id
                                            ? "bg-white border-[#F4D03F]/60 shadow-2xl ring-1 ring-[#F4D03F]/10 scale-[1.02]"
                                            : "bg-transparent border-transparent hover:bg-white/50 hover:border-gray-100 hover:scale-[1.01]"
                                    )}
                                >
                                    {activeHub === apiary.id && (
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#F4D03F]/5 blur-2xl rounded-full" />
                                    )}
                                    <div className="flex items-center gap-4 relative z-10">
                                         <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-700", activeHub === apiary.id ? "bg-[#1A1A1A] border-white/20 text-white shadow-xl" : "bg-white border-gray-100 text-gray-300")}>
                                              <Activity className="w-6 h-6" />
                                         </div>
                                         <div className="text-left">
                                             <p className="text-[13px] font-black text-[#1A1A1A] truncate max-w-[140px] tracking-tight uppercase">{apiary.name}</p>
                                              <p className="text-[9px] text-[#1B9157] font-black tracking-widest leading-none mt-1 uppercase">Link: Active</p>
                                         </div>
                                     </div>
                                     <ChevronRight className={cn("w-5 h-5 transition-transform duration-700 relative z-10", activeHub === apiary.id ? "translate-x-1 text-[#F4D03F]" : "text-gray-200")} />
                                </button>
                            ))}
                        </div>

                        <div className="p-6 mt-auto border-t border-gray-100 bg-white/60 backdrop-blur-sm">
                            <button
                                type="button"
                                onClick={() => onTabChange?.('places')}
                                className={cn(glass.btnSecondary, "w-full h-14 rounded-2xl border-dashed border-[#F4D03F]/40 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:shadow-md hover:border-[#F4D03F] hover:bg-white transition-all group")}
                            >
                                <Plus className="w-4 h-4 mr-3 transition-transform group-hover:rotate-180" />
                                Synchronize Node
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Insights Panel */}
                <div className="xl:col-span-8 space-y-6">
                    {/* Foraging Dynamics Chart */}
                    <div className={cn(glass.section, "overflow-hidden flex flex-col pt-8 relative shadow-2xl border-white/60")}>
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[#1B9157]/5 rounded-full blur-[120px] pointer-events-none" />
                        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-[100px] pointer-events-none" />
                        
                        <div className="px-10 pb-8 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-[#1B9157]/10 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                                    <TrendingUp className="w-7 h-7 text-[#1B9157]" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none italic">Foraging Dynamics</h3>
                                    <p className="text-[10px] font-black text-gray-400 tracking-[0.15em] leading-none uppercase pt-1">BeeYield AI Pulse Protocol</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-[#1B9157] shadow-lg shadow-[#1B9157]/40 animate-pulse" />
                                    <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Colony Vector</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-[#F4D03F] shadow-lg shadow-[#F4D03F]/40" />
                                    <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Ambient Matrix</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[420px] w-full p-10 relative bg-white/20 backdrop-blur-sm z-10 group/chart">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                            
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={FORAGING_PULSE_DATA} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1B9157" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#1B9157" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F4D03F" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#F4D03F" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" opacity={0.05} />
                                    <XAxis 
                                        dataKey="time" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 900, fill: '#9CA3AF', letterSpacing: '0.1em'}}
                                        dy={15}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 900, fill: '#9CA3AF'}}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(26,26,26,0.95)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: '16px', color: '#fff' }}
                                        itemStyle={{ fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', color: '#fff' }}
                                        labelStyle={{ fontSize: '12px', fontWeight: 'black', marginBottom: '10px', color: '#F4D03F', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}
                                        cursor={{ stroke: '#1B9157', strokeWidth: 2, strokeDasharray: '6 6' }}
                                    />
                                    <Area type="monotone" dataKey="activity" stroke="#1B9157" strokeWidth={5} fillOpacity={1} fill="url(#colorActivity)" />
                                    <Area type="monotone" dataKey="temp" stroke="#F4D03F" strokeWidth={5} fillOpacity={1} fill="url(#colorTemp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className={cn(glass.section, "p-10 border-l-[6px] border-l-red-500 group relative transition-all hover:shadow-2xl bg-white/40 shadow-xl border-white/60")}>
                             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-150" />
                            
                            <div className="flex items-center justify-between mb-8 relative">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-6 duration-500">
                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-base font-black text-[#1A1A1A] tracking-tighter uppercase leading-none pt-1">Tactical Warnings</h4>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1">Under-Pollination Cluster</p>
                                    </div>
                                </div>
                                <span className="bg-[#1A1A1A] text-[#F4D03F] text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-xl ring-1 ring-white/10">3 CRITICAL</span>
                            </div>
                            <p className="text-xs text-gray-500 font-bold leading-relaxed mb-8 relative border-l-2 border-red-500/20 pl-6 italic">
                                Strategic under-pollination identified in <span className="text-red-600 font-black uppercase">Tactical Block 4/9</span>. FPA levels dropped below 12.0 threshold due to persistent wind-resistance vectors and reduced flight windows.
                            </p>
                            <button className="text-[10px] font-black text-red-600 tracking-[0.2em] uppercase hover:underline flex items-center gap-3 relative group-hover:translate-x-2 transition-transform">
                                Review Spatial Map <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className={cn(glass.section, "p-10 border-l-[6px] border-l-[#1B9157] group flex flex-col justify-between relative transition-all hover:shadow-2xl bg-[#1A1A1A] shadow-xl border-white/10")}>
                             <div className="absolute top-0 right-0 w-32 h-32 bg-[#1B9157]/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-150" />
                            
                            <div className="flex items-center justify-between mb-8 relative">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-6 duration-500">
                                        <Binary className="w-6 h-6 text-[#1B9157]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-base font-black text-white tracking-tighter uppercase leading-none pt-1">Protocol Sync</h4>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mt-1">Intelligence Integrity: 1.0</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6 relative">
                                <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/5 transition-colors hover:border-white/10">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-[#F4D03F]" />
                                        <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Flight Window</span>
                                    </div>
                                    <span className="text-sm font-black text-white tracking-widest tabular-nums">06:42 — 18:15</span>
                                </div>
                                
                                <button
                                    onClick={handleGetReport}
                                    disabled={exporting}
                                    className={cn(glass.btnPrimary, "w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#1B9157]/20 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all bg-[#1B9157] hover:bg-[#1B9157] text-white border-0", exporting && "opacity-60 cursor-not-allowed")}
                                >
                                    {exporting ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <ShieldCheck className="w-5 h-5 text-white" />}
                                    <span className="text-white">{exporting ? 'Synchronizing Intelligence...' : 'Export Tactical Brief'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </motion.div>

            <style>{`
                .thin-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 20px; }
                .thin-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.1); }
            `}</style>
        </BeeYieldPageShell>
    );
};

export default PollinationIntelligence;
