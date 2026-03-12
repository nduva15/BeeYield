import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';
import { Cloud, Sun, Wind, Thermometer, Zap, AlertCircle, Info, Activity, ArrowRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface BFHData {
    day: string;
    hours: number;
    temp: number;
    wind: number;
    uv: number;
    status: 'optimal' | 'moderate' | 'low';
}

const mockData: BFHData[] = [
    { day: 'MON', hours: 8.5, temp: 24, wind: 12, uv: 7, status: 'optimal' },
    { day: 'TUE', hours: 9.2, temp: 26, wind: 8, uv: 8, status: 'optimal' },
    { day: 'WED', hours: 4.0, temp: 18, wind: 25, uv: 3, status: 'low' },
    { day: 'THU', hours: 2.1, temp: 16, wind: 35, uv: 2, status: 'low' },
    { day: 'FRI', hours: 6.5, temp: 21, wind: 15, uv: 5, status: 'moderate' },
    { day: 'SAT', hours: 10.0, temp: 28, wind: 5, uv: 9, status: 'optimal' },
    { day: 'SUN', hours: 11.5, temp: 29, wind: 4, uv: 9, status: 'optimal' },
];

const CUSTOM_COLORS = {
    optimal: 'hsl(var(--honey))',
    moderate: 'hsl(var(--honey) / 0.5)',
    low: 'hsl(var(--foreground) / 0.1)',
};

const BeeFlightHoursForecast: React.FC = () => {
    // Detection for making up time
    const needsMakeUpTime = mockData.slice(2, 4).every(d => d.status === 'low');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "space-y-8 pb-24")}
        >
            {/* Header Section */}
            <PageHeader
                icon={Calendar}
                label="Activity Forecast"
                title={<>Flight <span className="text-[#F4D03F]">Hours</span></>}
                subtitle="7-day guide to bee activity windows."
                actions={
                    <AnimatePresence>
                        {needsMakeUpTime && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={cn(glass.card, "px-6 py-2 flex items-center gap-4 bg-[#F4D03F]/10 border-[#F4D03F]/20 relative overflow-hidden group shadow-sm rounded-xl")}
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#F4D03F]/20 flex items-center justify-center border border-[#F4D03F]/30 relative z-10 shrink-0">
                                    <AlertCircle className="w-5 h-5 text-[#F4D03F]" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black uppercase tracking-tight leading-none">Activity Spike</h3>
                                    <p className="text-[10px] font-black uppercase opacity-40 mt-1">Post-rain window detected</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                }
            />

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                <GlassStatCard label="Min Flight Temp" value="15°C+" icon={Thermometer} index={0} />
                <GlassStatCard label="Max Flight Wind" value="25km/h" icon={Wind} index={1} color="text-destructive" />
                <GlassStatCard label="Peak Activity" value="UV High" icon={Sun} index={2} />
                <GlassStatCard label="Total Week" value="62.5h" icon={Activity} index={3} color="text-[#1B9157]" />
            </div>

            {/* Main Forecast Chart Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-8 lg:p-12 bg-white/50 backdrop-blur-xl rounded-3xl relative overflow-hidden group border-[#F4D03F]/10 shadow-sm")}
            >
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-honey/[0.05] to-transparent pointer-events-none" />

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-12 relative z-10 pb-8 border-b border-[#F4D03F]/10">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black tracking-tight uppercase leading-none">Weekly <span className="text-[#F4D03F]">Schedule</span></h3>
                        <p className="text-xs font-bold opacity-40 uppercase tracking-widest leading-tight max-w-2xl pl-2 border-l-4 border-[#F4D03F]/10">Estimated flight hours for each day based on weather conditions.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-white/50 backdrop-blur-xl p-3 rounded-xl border border-[#F4D03F]/20 shadow-sm">
                        {[
                            { label: 'High Activity', color: 'bg-[#F4D03F]' },
                            { label: 'Moderate', color: 'bg-[#F4D03F]/50' },
                            { label: 'Low', color: 'bg-foreground/10' }
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-2 px-2">
                                <div className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-[400px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
                            <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 12, fontWeight: 'black' }}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 12, fontWeight: 'black' }}
                                dx={-15}
                            />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--honey) / 0.05)' }}
                                contentStyle={{
                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(251, 191, 36, 0.2)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                                    color: 'black'
                                }}
                                itemStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px' }}
                                labelStyle={{ fontWeight: 'black', color: '#FBBE24', marginBottom: '0.8rem', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}
                            />
                            <Bar
                                dataKey="hours"
                                radius={[8, 8, 0, 0]}
                                barSize={40}
                            >
                                {mockData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={CUSTOM_COLORS[entry.status]}
                                        className="transition-all duration-700 hover:brightness-125"
                                    />
                                ))}
                            </Bar>
                            <ReferenceLine
                                y={8}
                                stroke="rgba(251, 191, 36, 0.3)"
                                strokeWidth={4}
                                strokeDasharray="12 12"
                                label={{
                                    position: 'insideTopRight',
                                    value: 'TARGET HOURS (8h)',
                                    fill: '#FBBE24',
                                    fontWeight: '900',
                                    fontSize: 12,
                                    fontStyle: 'italic',
                                    offset: 30
                                }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Info Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(glass.card, "p-10 bg-white/50 backdrop-blur-xl rounded-3xl relative overflow-hidden group border-[#F4D03F]/10 shadow-sm")}
            >
                <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-[#F4D03F]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#F4D03F]/10 transition-all duration-1000" />

                <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                    <div className="w-20 h-20 rounded-[2rem] bg-[#F4D03F]/10 flex items-center justify-center shrink-0 border border-[#F4D03F]/20 shadow-sm group-hover:scale-105 transition-all duration-700">
                        <Info className="w-10 h-10 text-[#F4D03F]" />
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="space-y-1">
                            <h4 className="text-3xl font-black tracking-tight uppercase leading-none">Activity <span className="text-[#F4D03F]">Intelligence</span></h4>
                            <p className="text-[10px] font-black uppercase opacity-40">Weather & Foraging Cycles</p>
                        </div>
                        <p className="text-sm font-bold text-foreground opacity-60 leading-relaxed uppercase tracking-tight pl-4 border-l-4 border-[#F4D03F]">
                            We use precision local weather data to predict bee activity windows.
                            Optimum flight occurs between 15°C and 25°C with wind speeds under 25km/h. Bright sunny days with high UV optimize foraging yield.
                        </p>
                    </div>
                    <button className={cn(glass.btnSecondary, "relative h-14 px-8 group/btn bg-white overflow-hidden rounded-2xl border-[#F4D03F]/20 shadow-sm")}>
                        <div className="relative flex items-center gap-4">
                            <span className="text-xs font-black uppercase tracking-widest">Learn More</span>
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                        </div>
                    </button>
                </div>
            </motion.div>

            <style>{`
                .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default BeeFlightHoursForecast;
