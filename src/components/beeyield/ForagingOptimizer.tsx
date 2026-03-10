import React from 'react';
import { Target, Move, Zap, TrendingUp, Info, Activity, ShieldAlert, Crosshair, Hexagon, Brain, Map as MapIcon, BarChart3, ArrowRight, Wind, Waves, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface ForagingOptimizerProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

// Simulated Data: Honey gain over time
const FORAGING_MATH = [
    { t: 0, phi: 120, baseline: 100 },
    { t: 2, phi: 150, baseline: 100 },
    { t: 4, phi: 310, baseline: 110 },
    { t: 6, phi: 450, baseline: 120 },
    { t: 8, phi: 410, baseline: 120 },
    { t: 10, phi: 520, baseline: 130 },
];

const ForagingOptimizer: React.FC<ForagingOptimizerProps> = ({ onTabChange }) => {
    const [viewMode, setViewMode] = React.useState<'MAP' | 'MATH'>('MAP');

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
                            <Target className="w-5 h-5" />
                            <span className="uppercase tracking-[0.4em] font-black italic text-[12px]">Smart Planning</span>
                        </div>
                    </div>
                    <h1 className="text-8xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Bee <span className="text-honey">Efficiency</span>
                    </h1>
                    <p className={cn(glass.microLabel, "opacity-40 italic font-black uppercase tracking-[0.4em] ml-2")}>
                        Finding the best spots for your hives and tracking honey collection.
                    </p>
                </div>

                <div className="flex gap-6">
                    <button
                        onClick={() => setViewMode('MAP')}
                        className={cn(
                            glass.btnSecondary,
                            "h-20 px-12 rounded-full font-black italic uppercase text-xl transition-all flex items-center gap-6",
                            viewMode === 'MAP' ? "bg-honey text-black border-honey shadow-4xl scale-110" : "bg-white/5 border-white/5 text-foreground/40"
                        )}
                    >
                        <MapIcon className="w-8 h-8" />
                        Flight Map
                    </button>
                    <button
                        onClick={() => setViewMode('MATH')}
                        className={cn(
                            glass.btnSecondary,
                            "h-20 px-12 rounded-full font-black italic uppercase text-xl transition-all flex items-center gap-6",
                            viewMode === 'MATH' ? "bg-honey text-black border-honey shadow-4xl scale-110" : "bg-white/5 border-white/5 text-foreground/40"
                        )}
                    >
                        <BarChart3 className="w-8 h-8" />
                        Honey Gain
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Main Visualizer Area */}
                <div className="lg:col-span-8 space-y-16">
                    <AnimatePresence mode="wait">
                        {viewMode === 'MAP' ? (
                            <motion.div
                                key="map"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.8 }}
                                className={cn(glass.card, "bg-black h-[700px] relative overflow-hidden rounded-[6rem] shadow-4xl border-white/5 border-8")}
                            >
                                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #fff 2px, transparent 2px), linear-gradient(to bottom, #fff 2px, transparent 2px)', backgroundSize: '60px 60px' }} />

                                <svg className="absolute inset-0 w-full h-full opacity-40 blur-3xl">
                                    <circle cx="30%" cy="40%" r="200" fill="url(#gradientGreen)" />
                                    <circle cx="70%" cy="60%" r="150" fill="url(#gradientYellow)" />
                                    <defs>
                                        <radialGradient id="gradientGreen">
                                            <stop offset="0%" stopColor="#FBBE24" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="transparent" />
                                        </radialGradient>
                                        <radialGradient id="gradientYellow">
                                            <stop offset="0%" stopColor="#FBBE24" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="transparent" />
                                        </radialGradient>
                                    </defs>
                                </svg>

                                <svg className="absolute inset-0 w-full h-full">
                                    <path
                                        d="M 120,300 Q 300,150 480,350 T 840,250"
                                        fill="none"
                                        stroke="#FBBE24"
                                        strokeWidth="6"
                                        strokeDasharray="20 10"
                                        className="animate-dash"
                                    />
                                </svg>

                                <div className="absolute top-1/4 left-1/3 p-10 bg-white dark:bg-[#0D0D0D] border-4 border-honey rounded-[3rem] shadow-4xl group hover:-translate-y-4 transition-transform duration-700">
                                    <p className="text-[12px] font-black italic uppercase text-honey mb-2 tracking-[0.2em]">Best Spot</p>
                                    <p className="text-3xl font-black italic uppercase tracking-tighter leading-none">Healthy Bloom</p>
                                </div>

                                <div className="absolute bottom-16 right-16 flex items-center gap-10 bg-black/80 backdrop-blur-3xl p-10 rounded-[3.5rem] border-4 border-honey shadow-4xl group">
                                    <div className="w-16 h-16 bg-honey/20 rounded-2xl flex items-center justify-center border-2 border-honey/40 shadow-4xl group-hover:scale-110 transition-transform">
                                        <Crosshair className="w-8 h-8 text-honey" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xl font-black italic uppercase tracking-widest text-honey leading-none mb-2">Hive Update</p>
                                        <p className="text-2xl font-black italic opacity-60 uppercase tracking-tighter leading-tight">Moving bees North for better flowers.</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="math"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.8 }}
                                className={cn(glass.card, "bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl h-[700px] p-16 flex flex-col rounded-[6rem] shadow-4xl border-white/5 border-8")}
                            >
                                <div className="flex-1 space-y-12">
                                    <div className="flex items-center justify-between border-b-4 border-black/5 dark:border-white/5 pb-12">
                                        <div className="space-y-4">
                                            <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Honey <span className="text-honey">Gain</span></h3>
                                            <p className="text-xl font-black italic opacity-40 uppercase tracking-widest pl-2 border-l-8 border-white/5">How much honey is being made.</p>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <p className="text-7xl font-black italic uppercase tracking-tighter leading-none">Score: 520</p>
                                            <p className="text-2xl font-black italic text-emerald-500 uppercase tracking-widest">Efficiency: High</p>
                                        </div>
                                    </div>
                                    <div className="h-[350px] w-full relative">
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #000 2px, transparent 2px), linear-gradient(to bottom, #000 2px, transparent 2px)', backgroundSize: '60px 60px' }} />
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={FORAGING_MATH}>
                                                <defs>
                                                    <linearGradient id="honeyGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#FBBE24" stopOpacity={0.6} />
                                                        <stop offset="95%" stopColor="#FBBE24" stopOpacity={0.05} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                                                <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fontSize: 16, fontWeight: 'black', fontStyle: 'italic', fill: 'currentColor', opacity: 0.3 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 16, fontWeight: 'black', fontStyle: 'italic', fill: 'currentColor', opacity: 0.3 }} />
                                                <Area type="monotone" dataKey="phi" stroke="#FBBE24" strokeWidth={8} fill="url(#honeyGrad)" animationDuration={2000} />
                                                <Area type="step" dataKey="baseline" stroke="currentColor" strokeOpacity={0.1} strokeWidth={4} fill="none" strokeDasharray="12 12" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="mt-12 border-t-4 border-black/5 dark:border-white/5 pt-12 grid grid-cols-3 gap-12">
                                    <div className="space-y-4">
                                        <p className="text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">Energy Use</p>
                                        <p className="text-4xl font-black italic uppercase tracking-tighter leading-none">Normal</p>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">Honey Made</p>
                                        <p className="text-4xl font-black italic uppercase tracking-tighter text-honey leading-none">High</p>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">Overall Score</p>
                                        <p className="text-4xl font-black italic uppercase tracking-tighter leading-none">92%</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar: Science & Alerts */}
                <div className="lg:col-span-4 space-y-16">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card, "p-16 shadow-4xl bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-[5rem] border-white/5 relative overflow-hidden flex flex-col gap-12 group")}
                    >
                        <div className="absolute top-0 right-0 w-80 h-80 bg-honey/5 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-40" />

                        <div className="flex items-center gap-8 border-honey border-l-8 pl-8 relative z-10">
                            <Brain className="w-10 h-10 text-honey" />
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Bee <span className="text-honey">Activity</span></h3>
                        </div>

                        <div className="space-y-10 relative z-10">
                            {[
                                { label: 'Working Bees', val: '84%', status: 'GOOD' },
                                { label: 'Flower Visits', val: '14.8', status: 'FAST' },
                                { label: 'Flower Variety', val: '92%', status: 'HIGH' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center group/item hover:bg-honey/5 p-6 rounded-[2.5rem] border-2 border-transparent hover:border-white/5 transition-all">
                                    <div className="space-y-3">
                                        <p className="text-[14px] font-black italic uppercase tracking-[0.3em] opacity-30">{item.label}</p>
                                        <p className="text-4xl font-black italic uppercase tracking-tighter leading-none group-hover/item:text-honey transition-colors">{item.val}</p>
                                    </div>
                                    <span className="text-[12px] font-black italic uppercase px-6 py-2 bg-black/5 dark:bg-white/5 border border-white/5 rounded-full opacity-60">{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className={cn(glass.card, "p-16 shadow-4xl bg-honey/10 border-honey/20 rounded-[4rem] group hover:bg-honey/15 transition-all relative overflow-hidden flex flex-col gap-8")}>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                        <div className="flex items-center gap-8 mb-4 relative z-10">
                            <div className="w-20 h-20 rounded-[2rem] bg-white/80 dark:bg-black/80 flex items-center justify-center border-2 border-current shadow-4xl text-red-500">
                                <Wind className="w-10 h-10" />
                            </div>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-red-500 leading-none">Weather Check</h3>
                        </div>
                        <p className="text-2xl font-black italic opacity-60 leading-tight uppercase tracking-tight pl-6 border-l-8 border-red-500 relative z-10">
                            The wind is too strong in Sector 4. Moving your hives might help them collect more honey.
                        </p>
                        <button className="w-full mt-6 h-28 bg-black text-honey rounded-[3.5rem] font-black italic text-2xl uppercase tracking-[0.2em] shadow-4xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 group/btn">
                            <Move className="w-10 h-10 group-hover/btn:-translate-y-2 transition-transform" />
                            Update Location
                            <ArrowRight className="w-10 h-10 group-hover/btn:translate-x-4 transition-transform opacity-20" />
                        </button>
                    </div>

                    <div className={cn(glass.card, "p-12 shadow-4xl bg-[#0D0D0D] border-4 border-honey/20 rounded-[4rem] group hover:border-honey/40 transition-all relative overflow-hidden flex items-start gap-10")}>
                        <div className="w-20 h-20 rounded-[2.5rem] bg-honey/10 flex items-center justify-center border-2 border-honey/30 shadow-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                            <Waves className="w-10 h-10 text-honey" />
                        </div>
                        <div className="space-y-4">
                            <p className="text-[14px] font-black italic uppercase tracking-[0.3em] text-honey">Live Tracking</p>
                            <p className="text-xl font-black italic opacity-40 leading-tight uppercase tracking-widest pl-4 border-l-4 border-white/10">
                                Our sensors are tracking bee flight patterns to make sure they return home safely.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes dash { to { stroke-dashoffset: -200; } }
                .animate-dash { animation: dash 10s linear infinite; stroke-dashoffset: 0; }
            `}</style>
        </motion.div>
    );
};

export default ForagingOptimizer;
