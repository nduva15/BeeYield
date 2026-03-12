import React from 'react';
import { Calculator, Zap, Target, TrendingUp, Info, Activity, ShieldAlert, Cpu, ArrowRight, Download, Waves, Sparkles, BarChart3, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { glass, PageHeader } from './GlassTheme';
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
            className={cn(glass.page, "space-y-8 pb-24")}
        >
            {/* Header Section */}
            <PageHeader
                icon={Target}
                label="Yield Predictor"
                title={<>Harvest <span className="text-[#F4D03F]">Forecast</span></>}
                subtitle="Predicting your final harvest based on bee activity."
                actions={
                    <div className={cn(glass.badge, "px-4 py-2 bg-[#1B9157]/10 border border-[#1B9157]/20 text-[#1B9157] rounded-lg flex items-center gap-2")}>
                        <Activity className="w-4 h-4" />
                        <div className="flex flex-col">
                            <span className="text-sm font-black italic tracking-tighter leading-none">14.2 Visits</span>
                            <span className="text-[8px] font-black uppercase opacity-60">High Activity</span>
                        </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(glass.card, "p-8 flex flex-col items-center shadow-sm overflow-hidden relative bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10")}
                >
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />

                    <div className="flex items-center gap-4 mb-8 w-full border-[#F4D03F] border-l-4 pl-4">
                        <BarChart3 className="w-5 h-5 text-[#F4D03F]" />
                        <h3 className="text-xl font-black uppercase tracking-tight leading-none">Final Prediction</h3>
                    </div>

                    <div className="relative w-64 h-32 overflow-hidden mb-8 flex-shrink-0 z-10 transition-transform duration-700 hover:scale-105">
                        {/* Gauge background */}
                        <div className="absolute inset-x-0 top-0 h-64 border-[25px] border-black/5 rounded-full" />
                        <motion.div
                            initial={{ rotate: -90 }}
                            animate={{ rotate: 55 }}
                            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                            className="absolute inset-x-0 top-0 h-64 border-[25px] border-emerald-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)' }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                            <motion.p
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.2, type: 'spring' }}
                                className="text-5xl font-black tabular-nums tracking-tighter leading-none"
                            >
                                2,200
                            </motion.p>
                            <p className="text-sm font-black opacity-40 uppercase tracking-widest mb-1">lbs / acre</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full relative z-10 mb-8">
                        <div className="rounded-2xl bg-white/50 p-4 text-center border border-[#F4D03F]/10 shadow-sm group hover:bg-[#F4D03F]/10 transition-all duration-300">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 group-hover:text-[#F4D03F] transition-colors">Accuracy</p>
                            <p className="text-xl font-black tabular-nums text-[#1B9157] tracking-tighter shadow-emerald-500/20">± 5%</p>
                        </div>
                        <div className="rounded-2xl bg-white/50 p-4 text-center border border-[#F4D03F]/10 shadow-sm group hover:bg-[#F4D03F]/10 transition-all duration-300">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 group-hover:text-[#F4D03F] transition-colors">Growth</p>
                            <p className="text-xl font-black tabular-nums tracking-tighter">+12%</p>
                        </div>
                    </div>

                    <p className="text-sm font-bold opacity-60 text-center leading-relaxed uppercase tracking-tight relative z-10 px-2">
                        Expect a <span className="text-[#1B9157]">robust yield</span> based on current activity.
                    </p>
                </motion.div>

                {/* Flight Analysis Graph */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(glass.card, "lg:col-span-2 p-0 flex flex-col overflow-hidden bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10 shadow-sm")}
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between p-8 border-b border-[#F4D03F]/10 bg-white/30">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Flight <span className="text-[#F4D03F]">Time</span></h3>
                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest pl-2 border-l-4 border-[#F4D03F]/10">Sensors vs. Local Weather Node</p>
                            </div>
                            <div className="flex items-center gap-6 mt-4 md:mt-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#F4D03F]" />
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Hive Node</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full border-2 border-[#F4D03F]/40 border-dashed" />
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Weather</span>
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

                        <div className="mt-auto p-8 border-t border-[#F4D03F]/10 flex flex-col md:flex-row items-center gap-6 group transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#1B9157]/10 flex items-center justify-center border border-[#1B9157]/20 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                <ShieldAlert className="w-6 h-6 text-[#1B9157]" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-black uppercase tracking-tight text-[#1B9157] leading-none">Bonus activity found</p>
                                <p className="text-xs font-bold opacity-60 uppercase tracking-tight leading-relaxed">
                                    Bees worked <span className="text-foreground">4 hours longer</span> than predicted by local weather telemetry.
                                </p>
                            </div>
                        </div>
                </motion.div>
            </div>

            {/* Success Factors table */}
            <div className="space-y-12">
                <div className="flex items-center gap-4 border-[#F4D03F] border-l-4 pl-4">
                    <Heart className="w-5 h-5 text-[#F4D03F]" />
                    <h3 className="text-xl font-black uppercase tracking-tight leading-none">Success <span className="text-[#F4D03F]">Factors</span></h3>
                </div>

                <div className={cn(glass.card, "p-0 overflow-hidden shadow-4xl bg-[#FFF9F0]/80 backdrop-blur-3xl rounded-[4rem] border-[#F4D03F]/10")}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead>
                                <tr className="bg-white/30">
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-40">Factor</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-40">Status</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-40">Density</th>
                                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest opacity-40">Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y border-t-8 border-black/10">
                                {[
                                    { name: 'Flower Visits', val: '14.2 per minute', weight: '45%', status: 'HIGH' },
                                    { name: 'Bee Activity', val: '92% Aligned', weight: '28%', status: 'NORMAL' },
                                    { name: 'Energy Levels', val: '1,280 J/colony', weight: '15%', status: 'HIGH' },
                                    { name: 'Bee Variety', val: 'Excellent Mix', weight: '11%', status: 'STABLE' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-[#F4D03F]/5 transition-all group">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black uppercase tracking-tight group-hover:text-[#F4D03F] transition-colors">{row.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold uppercase opacity-60 tracking-tight">{row.val}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-2 w-32 bg-white/50 rounded-full overflow-hidden shadow-inner">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: row.weight }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 1.5, delay: i * 0.1 }}
                                                        className="h-full bg-[#F4D03F] rounded-full"
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black tracking-tighter tabular-nums">{row.weight}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={cn(
                                                "inline-block px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                                                row.status === 'HIGH' ? "bg-[#1B9157] text-white border-emerald-400" :
                                                    row.status === 'STABLE' || row.status === 'NORMAL' ? "bg-[#F4D03F] text-[#1A1A1A] border-[#F4D03F]/40" : "bg-[#F4D03F]/10 text-foreground/40 border-[#F4D03F]/20"
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
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(glass.btnPrimary, "w-full h-16 text-sm font-black uppercase tracking-widest rounded-2xl shadow-md group flex items-center justify-center gap-4")}
            >
                <Download className="w-5 h-5" />
                <span>Export Intelligence Brief</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </motion.button>

            <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 2s infinite linear; }
            `}</style>
        </motion.div>
    );
};

export default PredictiveSuccessEngine;
