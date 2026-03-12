import React from 'react';
import { Calculator, Zap, Target, TrendingUp, Info, Activity, ShieldAlert, Cpu, ArrowRight, Download, Waves, Sparkles, BarChart3, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { glass } from './GlassTheme';
import { motion } from 'framer-motion';

interface PredictiveSuccessEngineProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

// Simulated data correlating Bloom %, True Flight Hours, and Predicted Yield
const PREDICTION_DATA = [
    { day: 'D1', bloom: 5, flight: 2.2, yield: 400 },
    { day: 'D2', bloom: 15, flight: 4.8, yield: 650 },
    { day: 'D3', bloom: 35, flight: 8.4, yield: 1100 },
    { day: 'D4', bloom: 60, flight: 12.1, yield: 1750 },
    { day: 'D5', bloom: 85, flight: 14.2, yield: 2200 },
    { day: 'D6', bloom: 95, flight: 13.5, yield: 2180 },
];

const PredictiveSuccessEngine: React.FC<PredictiveSuccessEngineProps> = ({ onTabChange }) => {

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
                            <span className="uppercase tracking-[0.4em] font-black italic text-[12px]">Yield Predictor</span>
                        </div>
                    </div>
                    <h1 className="text-8xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Harvest <span className="text-honey">Forecast</span>
                    </h1>
                    <p className={cn(glass.microLabel, "opacity-40 italic font-black uppercase tracking-[0.4em] ml-2")}>
                        Predicting your final harvest based on bee activity.
                    </p>
                </div>

                <div className="flex gap-6">
                    <div className={cn(glass.badge, "px-10 py-5 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-500 shadow-4xl rounded-[2.5rem] flex items-center gap-6")}>
                        <Activity className="w-8 h-8" />
                        <div className="flex flex-col">
                            <span className="text-2xl font-black italic uppercase italic tracking-tighter leading-none">14.2 Visits</span>
                            <span className="text-[12px] font-black uppercase tracking-widest opacity-60">High Activity</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Predicted Yield Gauge */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(glass.card, "p-16 flex flex-col items-center shadow-4xl overflow-hidden relative bg-white/80 backdrop-blur-3xl rounded-[5rem] border-white/5")}
                >
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />

                    <div className="flex items-center gap-6 mb-16 w-full border-honey border-l-8 pl-8">
                        <BarChart3 className="w-8 h-8 text-honey" />
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Final Prediction</h3>
                    </div>

                    <div className="relative w-96 h-48 overflow-hidden mb-16 flex-shrink-0 z-10 transition-transform duration-700 hover:scale-110">
                        {/* Gauge background */}
                        <div className="absolute inset-x-0 top-0 h-96 border-[40px] border-black/5 rounded-full" />
                        <motion.div
                            initial={{ rotate: -90 }}
                            animate={{ rotate: 55 }}
                            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                            className="absolute inset-x-0 top-0 h-96 border-[40px] border-emerald-500 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.5)]"
                            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)' }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                            <motion.p
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.2, type: 'spring' }}
                                className="text-8xl font-black italic tabular-nums tracking-tighter leading-none"
                            >
                                2,200
                            </motion.p>
                            <p className="text-2xl font-black italic opacity-40 uppercase tracking-widest mb-2">lbs / acre</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 w-full relative z-10 mb-12">
                        <div className="rounded-[2.5rem] bg-gray-50 p-8 text-center border border-white/5 shadow-inner group hover:bg-honey/10 transition-all duration-700">
                            <p className="text-[12px] font-black italic uppercase tracking-[0.3em] opacity-40 mb-3 group-hover:text-honey transition-colors">Accuracy</p>
                            <p className="text-4xl font-black italic tabular-nums text-emerald-500 tracking-tighter shadow-emerald-500/20">± 5%</p>
                        </div>
                        <div className="rounded-[2.5rem] bg-gray-50 p-8 text-center border border-white/5 shadow-inner group hover:bg-honey/10 transition-all duration-700">
                            <p className="text-[12px] font-black italic uppercase tracking-[0.3em] opacity-40 mb-3 group-hover:text-honey transition-colors">Improvement</p>
                            <p className="text-4xl font-black italic tabular-nums tracking-tighter">+12%</p>
                        </div>
                    </div>

                    <p className="text-xl font-black italic opacity-60 text-center leading-normal uppercase tracking-widest relative z-10 px-4">
                        We expect a great harvest based on this year's bee activity.
                    </p>
                </motion.div>

                {/* Flight Analysis Graph */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(glass.card, "lg:col-span-2 p-0 flex flex-col overflow-hidden bg-white/80 backdrop-blur-3xl rounded-[5rem] border-white/5 shadow-4xl")}
                >
                    <div className="flex flex-col md:flex-row items-center justify-between p-12 border-b border-white/5 bg-gray-50">
                        <div className="space-y-4">
                            <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Flight <span className="text-honey">Time</span></h3>
                            <p className="text-xl font-black italic opacity-40 uppercase tracking-widest pl-2 border-l-8 border-white/5">Our sensors vs. the local weather station.</p>
                        </div>
                        <div className="flex items-center gap-10 mt-8 md:mt-0">
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-4 rounded-full bg-honey shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                                <span className="text-[12px] font-black italic uppercase tracking-widest opacity-60">Hive Sensors</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-4 rounded-full border-4 border-gray-300 border-dashed" />
                                <span className="text-[12px] font-black italic uppercase tracking-widest opacity-60">Weather Station</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[450px] w-full p-12 relative">
                        {/* Background grid */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #fff 2px, transparent 2px), linear-gradient(to bottom, #fff 2px, transparent 2px)', backgroundSize: '60px 60px' }} />

                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={PREDICTION_DATA} margin={{ top: 20, right: 20, left: -40, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="flightGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FBBE24" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#FBBE24" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="white" strokeOpacity={0.05} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.3, fontWeight: 'black', fontSize: 16, fontStyle: 'italic' }} dy={20} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.3, fontWeight: 'black', fontSize: 16, fontStyle: 'italic' }} />
                                <Area type="monotone" dataKey="flight" fill="url(#flightGrad)" stroke="#FBBE24" strokeWidth={8} animationDuration={2000} />
                                <Line type="step" dataKey="flight" stroke="white" strokeOpacity={0.2} strokeWidth={4} strokeDasharray="12 12" dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-auto p-12 bg-emerald-500/10 border-t-4 border-emerald-500/20 flex flex-col md:flex-row items-center gap-10 group transition-all hover:bg-emerald-500/20">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500/30 shrink-0 shadow-4xl group-hover:scale-110 transition-transform">
                            <ShieldAlert className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="space-y-4">
                            <p className="text-3xl font-black italic uppercase tracking-tighter text-emerald-500 leading-none">Bonus activity found</p>
                            <p className="text-xl font-black italic opacity-60 uppercase tracking-widest leading-tight">
                                Your bees worked <span className="text-foreground">4 hours longer</span> than the local weather report suggested. They are very active and healthy.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Success Factors table */}
            <div className="space-y-12">
                <div className="flex items-center gap-8 border-honey border-l-8 pl-8">
                    <Heart className="w-10 h-10 text-honey" />
                    <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Success <span className="text-honey">Factors</span></h3>
                </div>

                <div className={cn(glass.card, "p-0 overflow-hidden shadow-4xl bg-white/80 backdrop-blur-3xl rounded-[4rem] border-white/5")}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-12 py-10 text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">Factor</th>
                                    <th className="px-12 py-10 text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">Current Status</th>
                                    <th className="px-12 py-10 text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">Focus</th>
                                    <th className="px-12 py-10 text-right text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y border-t-8 border-black/10">
                                {[
                                    { name: 'Flower Visits', val: '14.2 per minute', weight: '45%', status: 'HIGH' },
                                    { name: 'Bee Activity', val: '92% Aligned', weight: '28%', status: 'NORMAL' },
                                    { name: 'Energy Levels', val: '1,280 J/colony', weight: '15%', status: 'HIGH' },
                                    { name: 'Bee Variety', val: 'Excellent Mix', weight: '11%', status: 'STABLE' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-honey/5 transition-all duration-700 group">
                                        <td className="px-12 py-10">
                                            <span className="text-3xl font-black italic uppercase tracking-tighter group-hover:text-honey transition-colors">{row.name}</span>
                                        </td>
                                        <td className="px-12 py-10">
                                            <span className="text-2xl font-black italic uppercase opacity-60 tracking-widest">{row.val}</span>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex items-center gap-8">
                                                <div className="h-4 w-48 bg-gray-50 rounded-full overflow-hidden p-1 shadow-inner">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: row.weight }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 1.5, delay: i * 0.1 }}
                                                        className="h-full bg-honey rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                                                    />
                                                </div>
                                                <span className="text-2xl font-black italic tracking-tighter tabular-nums">{row.weight}</span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10 text-right">
                                            <div className={cn(
                                                "inline-block px-10 py-3 rounded-full text-xl font-black italic tracking-widest border-2 shadow-4xl transition-all",
                                                row.status === 'HIGH' ? "bg-emerald-500 text-black border-emerald-400" :
                                                    row.status === 'STABLE' || row.status === 'NORMAL' ? "bg-honey text-black border-honey/40" : "bg-white/10 text-foreground/40 border-gray-200"
                                            )}>{row.status}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(glass.btnPrimary, "w-full h-32 text-3xl font-black italic uppercase tracking-[0.4em] rounded-[4rem] shadow-4xl relative overflow-hidden group border-gray-200 flex items-center justify-center gap-10")}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer" />
                <Download className="w-12 h-12" />
                <span>Get Full <span className="text-black font-serif italic text-4xl">Forecast</span> Report</span>
                <ArrowRight className="w-12 h-12 group-hover:translate-x-6 transition-transform" />
            </motion.button>

            <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 2s infinite linear; }
            `}</style>
        </motion.div>
    );
};

export default PredictiveSuccessEngine;
