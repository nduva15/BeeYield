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
            className={cn(glass.page, "p-8 -m-8 space-y-20 pb-24")}
        >
            {/* Header Section */}
            <PageHeader
                icon={Calendar}
                label="Activity Forecast"
                title={<>Flight <span className="text-honey">Hours</span></>}
                subtitle="Your 7-day guide to when bees will be most active based on local weather."
                actions={
                    <AnimatePresence>
                        {needsMakeUpTime && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={cn(glass.card, "p-8 flex items-center gap-8 bg-honey/10 border-honey/20 relative overflow-hidden group shadow-4xl rounded-[3rem]")}
                            >
                                <div className="absolute inset-0 bg-honey/5 group-hover:bg-honey/10 transition-colors animate-pulse" />
                                <div className="w-16 h-16 rounded-[2rem] bg-honey/20 flex items-center justify-center border border-honey/30 relative z-10 shrink-0 shadow-4xl">
                                    <AlertCircle className="w-8 h-8 text-honey" />
                                </div>
                                <div className="relative z-10 pr-4">
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Plan <span className="text-honey">Ahead</span></h3>
                                    <p className="text-[12px] font-black uppercase italic opacity-40 mt-1">Activity may spike after the rain.</p>
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
                <GlassStatCard label="Total Week" value="62.5h" icon={Activity} index={3} color="text-emerald-500" />
            </div>

            {/* Main Forecast Chart Container */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-16 lg:p-24 bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-[6rem] relative overflow-hidden group border-white/5 shadow-4xl")}
            >
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-honey/[0.05] to-transparent pointer-events-none" />
                <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] bg-honey/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-16 mb-24 relative z-10 pb-12 border-b border-white/5">
                    <div className="space-y-4">
                        <h3 className="text-6xl font-black italic tracking-tighter uppercase leading-none">Weekly <span className="text-honey">Schedule</span></h3>
                        <p className="text-2xl font-black italic opacity-40 uppercase tracking-widest leading-tight max-w-2xl pl-2 border-l-8 border-white/5">Estimated flight hours for each day based on weather conditions.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-8 bg-white/40 dark:bg-black/40 backdrop-blur-3xl p-6 rounded-[3.5rem] border border-white/10 shadow-4xl">
                        {[
                            { label: 'High Activity', color: 'bg-honey shadow-[0_0_20px_rgba(251,191,36,0.5)]' },
                            { label: 'Moderate', color: 'bg-honey/50' },
                            { label: 'Low / Idle', color: 'bg-foreground/10' }
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-4 px-4">
                                <div className={cn("w-4 h-4 rounded-full", item.color)} />
                                <span className="text-[12px] font-black uppercase italic tracking-widest opacity-60">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-[600px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
                            <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 16, fontWeight: 'black', fontStyle: 'italic' }}
                                dy={30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 16, fontWeight: 'black' }}
                                dx={-30}
                            />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--honey) / 0.05)' }}
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.85)',
                                    backdropFilter: 'blur(30px)',
                                    border: '1px solid rgba(251, 191, 36, 0.2)',
                                    borderRadius: '3rem',
                                    padding: '2.5rem',
                                    boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)',
                                    color: 'white'
                                }}
                                itemStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '14px', fontStyle: 'italic' }}
                                labelStyle={{ fontWeight: 'black', color: '#FBBE24', marginBottom: '1.5rem', fontSize: '18px', textTransform: 'uppercase', fontStyle: 'italic', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}
                            />
                            <Bar
                                dataKey="hours"
                                radius={[24, 24, 0, 0]}
                                barSize={80}
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(glass.card, "p-16 lg:p-24 bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-[6rem] relative overflow-hidden group border-white/5 shadow-4xl")}
            >
                <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-honey/5 rounded-full blur-[150px] pointer-events-none group-hover:bg-honey/10 transition-all duration-1000" />

                <div className="flex flex-col lg:flex-row items-center gap-20 relative z-10">
                    <div className="w-32 h-32 rounded-[4rem] bg-honey/10 flex items-center justify-center shrink-0 border border-honey/20 shadow-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                        <Info className="w-16 h-16 text-honey" />
                    </div>
                    <div className="flex-1 space-y-10">
                        <div className="space-y-4">
                            <h4 className="text-5xl font-black italic tracking-tighter uppercase leading-none">How it <span className="text-honey">Works</span></h4>
                            <p className="text-[12px] font-black uppercase italic tracking-[0.4em] opacity-40">Weather & Intelligence</p>
                        </div>
                        <p className="text-2xl font-black italic text-foreground opacity-60 leading-relaxed max-w-6xl pl-4 border-l-8 border-honey">
                            We use local weather data to predict when your bees will be most active.
                            When it's too cold (below 15°C) or too windy (over 25km/h), flight time is reduced to protect the colony.
                            Bright sunny days with high UV are the best for foraging, and our system highlights these peak windows so you know when to expect the most activity.
                        </p>
                    </div>
                    <button className={cn(glass.btnSecondary, "relative h-24 px-16 group/btn bg-white dark:bg-black overflow-hidden rounded-[3.5rem] border-white/10 shadow-4xl")}>
                        <div className="absolute inset-0 bg-honey/0 group-hover/btn:bg-honey/10 transition-all" />
                        <div className="relative flex items-center gap-8">
                            <span className="text-2xl font-black italic uppercase">Learn More</span>
                            <ArrowRight className="w-10 h-10 group-hover/btn:translate-x-4 transition-transform" />
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
