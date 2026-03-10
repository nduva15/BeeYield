import React from 'react';
import { Brain, TrendingUp, AlertCircle, Building2, FileText, Info, Zap, Activity, Cpu, Loader2, FileDown, Plus, Sparkles, Waves, BarChart3, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface PollinationIntelligenceProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const PREDICTION_DATA = [
    { stage: 'Bloom Start', yield: 400, bfh: 12 },
    { stage: '10% Bloom', yield: 650, bfh: 28 },
    { stage: 'Full Bloom', yield: 1800, bfh: 84 },
    { stage: 'Fall', yield: 2200, bfh: 120 },
];

const PollinationIntelligence: React.FC<PollinationIntelligenceProps> = ({ onTabChange }) => {
    const [activeHub, setActiveHub] = React.useState<string | null>(null);
    const [apiaries, setApiaries] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

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
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 2000)),
            {
                loading: 'Preparing your report...',
                success: 'Seasonal Report Ready',
                error: 'Could not prepare report'
            }
        );

        await beeyieldService.logExport({
            export_type: 'PDF',
            entity_scope: 'Intelligence',
            file_name: `Farm_Report_${activeHub}_${new Date().toISOString().slice(0, 7)}.pdf`,
            record_count: 1
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-20 pb-24")}
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 pb-12 border-b border-white/5">
                <div className="space-y-6">
                    <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20 px-8 py-2.5 shadow-3xl skew-x-[-12deg]')}>
                        <div className="flex items-center gap-4 skew-x-[12deg]">
                            <Brain className="w-5 h-5" />
                            <span className="uppercase tracking-[0.4em] font-black italic text-[12px]">Smart Info</span>
                        </div>
                    </div>
                    <h1 className="text-8xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Farm <span className="text-honey">Insights</span>
                    </h1>
                    <p className={cn(glass.microLabel, "opacity-40 italic font-black uppercase tracking-[0.4em] ml-2")}>
                        Everything you need to know about your farm and bee activity.
                    </p>
                </div>

                <div className="flex gap-6">
                    <div className={cn(glass.badge, "px-10 py-5 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-500 shadow-4xl rounded-[2.5rem] flex items-center gap-6")}>
                        <Sparkles className="w-8 h-8" />
                        <div className="flex flex-col">
                            <span className="text-2xl font-black italic uppercase italic tracking-tighter leading-none">94%</span>
                            <span className="text-[12px] font-black uppercase tracking-widest opacity-60">Accuracy</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Farms Hub */}
                <div className="lg:col-span-4 space-y-12">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card, "p-12 space-y-10 shadow-4xl bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-[5rem] border-white/5")}
                    >
                        <div className="flex items-center justify-between border-b-4 border-white/5 pb-8">
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Connected <span className="text-honey">Farms</span></h3>
                            <Building2 className="w-10 h-10 text-honey" />
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 animate-spin text-honey opacity-20" /></div>
                            ) : apiaries.length === 0 ? (
                                <div className="p-16 text-center border-4 border-dashed border-white/5 rounded-[3rem]">
                                    <Building2 className="w-16 h-16 text-foreground/10 mx-auto mb-6" />
                                    <p className="text-xl font-black italic opacity-20 uppercase tracking-widest">No farms connected</p>
                                </div>
                            ) : apiaries.map((apiary, idx) => (
                                <motion.button
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={apiary.id}
                                    onClick={() => setActiveHub(apiary.id)}
                                    className={cn(
                                        "w-full h-28 px-10 rounded-[3rem] text-left transition-all duration-700 flex justify-between items-center group border-4",
                                        activeHub === apiary.id
                                            ? "bg-honey text-black border-honey shadow-4xl scale-105"
                                            : "bg-white/5 border-white/5 hover:border-honey/20"
                                    )}
                                >
                                    <div className="space-y-1">
                                        <p className="text-3xl font-black italic uppercase tracking-tighter leading-none transition-colors">{apiary.name}</p>
                                        <p className={cn("text-[12px] font-black italic uppercase tracking-widest leading-none", activeHub === apiary.id ? "text-black/60" : "opacity-40")}>Active Farm</p>
                                    </div>
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all", activeHub === apiary.id ? "bg-black/10 border-black/20" : "bg-white/5 border-white/5 group-hover:bg-honey/10 group-hover:border-honey/20")}>
                                        <Activity className={cn("w-6 h-6", activeHub === apiary.id ? "text-black" : "text-foreground/20 group-hover:text-honey")} />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                        <button className="w-full h-20 border-4 border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center gap-4 text-xl font-black italic uppercase opacity-40 hover:opacity-100 hover:border-honey/40 transition-all">
                            <Plus className="w-6 h-6" />
                            Connect New Farm
                        </button>
                    </motion.div>

                    <div className={cn(glass.card, "p-12 shadow-4xl bg-honey/10 border-honey/20 rounded-[4rem] group hover:bg-honey/15 transition-all relative overflow-hidden flex flex-col gap-8")}>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                        <div className="flex items-center gap-8 mb-4 relative z-10">
                            <div className="w-20 h-20 rounded-[2rem] bg-white/80 dark:bg-black/80 flex items-center justify-center border-2 border-honey/20 shadow-4xl text-honey">
                                <Cpu className="w-10 h-10" />
                            </div>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Hive Check</h3>
                        </div>
                        <p className="text-2xl font-black italic opacity-60 leading-tight uppercase tracking-tight pl-6 border-l-8 border-honey relative z-10">
                            Your farms are tracked with <span className="text-foreground">Smart Sensors</span> to show you how your bees are working.
                        </p>
                    </div>
                </div>

                {/* Insights Visuals */}
                <div className="lg:col-span-8 flex flex-col gap-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(glass.card, "p-0 flex flex-col overflow-hidden shadow-4xl bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-[6rem] border-white/5")}
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between p-12 border-b border-white/5 bg-black/10 dark:bg-black/40">
                            <div className="space-y-4">
                                <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Growth <span className="text-honey">Charts</span></h3>
                                <p className="text-xl font-black italic opacity-40 uppercase tracking-widest pl-2 border-l-8 border-white/5">Flower Stage vs. Bee Activity</p>
                            </div>
                            <div className="flex items-center gap-10 mt-8 md:mt-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                                    <span className="text-[12px] font-black italic uppercase tracking-widest opacity-60">Expected Activity</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-4 h-4 rounded-full border-4 border-honey border-dashed" />
                                    <span className="text-[12px] font-black italic uppercase tracking-widest opacity-60">Bee Activity</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[450px] w-full p-12 relative flex-1">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #fff 2px, transparent 2px), linear-gradient(to bottom, #fff 2px, transparent 2px)', backgroundSize: '60px 60px' }} />

                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={PREDICTION_DATA} margin={{ top: 20, right: 30, left: -40, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="white" strokeOpacity={0.05} />
                                    <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.3, fontWeight: 'black', fontSize: 16, fontStyle: 'italic' }} dy={20} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(12px)', border: 'none', borderRadius: '2rem', color: '#fff', padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ fontSize: '14px', fontWeight: 'black', textTransform: 'uppercase', fontStyle: 'italic', padding: '0.5rem 0' }}
                                    />
                                    <Area type="monotone" dataKey="yield" fill="url(#yieldGrad)" stroke="#10B981" strokeWidth={8} animationDuration={2000} />
                                    <Line type="monotone" dataKey="bfh" stroke="#FBBE24" strokeWidth={6} dot={{ fill: '#000', stroke: '#FBBE24', strokeWidth: 4, r: 8 }} activeDot={{ r: 12, strokeWidth: 0, fill: '#FBBE24' }} animationDuration={2000} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Gap Alert */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            className={cn(glass.card, "p-12 space-y-8 bg-black/80 backdrop-blur-3xl border-4 border-red-500/20 shadow-4xl rounded-[4rem] group")}
                        >
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center border-2 border-red-500/20 shadow-4xl group-hover:scale-110 transition-transform">
                                    <AlertCircle className="w-10 h-10 text-red-500" />
                                </div>
                                <h4 className="text-4xl font-black italic uppercase tracking-tighter text-red-500 leading-none">Problem Found</h4>
                            </div>
                            <p className="text-2xl font-black italic opacity-60 uppercase tracking-tight leading-tight pl-8 border-l-8 border-red-500/20">
                                The bees might not be active enough in some areas. Adding <span className="text-red-500">8 more hives</span> to the North area might help.
                            </p>
                        </motion.div>

                        {/* Audit Summary */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            className={cn(glass.card, "p-12 space-y-8 bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl border-4 border-white/5 shadow-4xl rounded-[4rem] group relative overflow-hidden")}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-8 relative z-10">
                                <div className="w-20 h-20 rounded-[2rem] bg-black/5 dark:bg-white/5 flex items-center justify-center border-2 border-white/10 shadow-4xl group-hover:scale-110 transition-transform">
                                    <FileText className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h4 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Seasonal <span className="text-emerald-500">Report</span></h4>
                            </div>
                            <p className="text-2xl font-black italic opacity-60 uppercase tracking-tight leading-tight pl-8 border-l-8 border-white/5 relative z-10">
                                Your farm report is ready. We compare your data with <span className="text-foreground">hive sounds</span> automatically.
                            </p>
                            <button
                                onClick={handleGetReport}
                                className={cn(glass.btnSecondary, "h-20 w-full mt-4 rounded-full font-black italic uppercase text-xl text-emerald-500 border-2 border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-4 relative z-10")}
                            >
                                <FileDown className="w-8 h-8" />
                                Get Farm Report
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PollinationIntelligence;
