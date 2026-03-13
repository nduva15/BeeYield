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
            className={glass.page}
        >
            <PageHeader
                icon={Calendar}
                label="Forecast"
                title={<>Flight <span className="text-[#F4D03F]">Hours</span></>}
                subtitle="Seasonal 7-day activity window prediction models."
                actions={
                    <AnimatePresence>
                        {needsMakeUpTime && (
                           <div className={cn(glass.badge, "bg-[#F4D03F]/10 text-[#1A1A1A] border-[#F4D03F]/20 py-1.5")}>
                                <AlertCircle className="w-3.5 h-3.5 mr-2 text-[#F4D03F]" />
                                Activity Spike Predicted
                            </div>
                        )}
                    </AnimatePresence>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <GlassStatCard label="Min Flight Temp" value="15°C+" icon={Thermometer} index={0} />
                <GlassStatCard label="Max Wind Speed" value="25km/h" icon={Wind} index={1} color="text-red-500" />
                <GlassStatCard label="Light Index" value="High UV" icon={Sun} index={2} />
                <GlassStatCard label="Total Week" value="62.5h" icon={Activity} index={3} color="text-[#1B9157]" />
            </div>

            <div className={cn(glass.section, "overflow-hidden flex flex-col mt-6")}>
                <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/20 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-[#F4D03F]" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Weekly Capacity</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest text-[9px]">Predicted Work Windows</p>
                        </div>
                    </div>
                </div>

                <div className="h-[380px] w-full p-6 relative bg-[#FFF9F0]">
                    <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000008" />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontWeight: 700, fontSize: 10 }}
                                dy={10}
                            />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    border: '1px solid #F4D03F30', 
                                    borderRadius: '12px', 
                                    padding: '12px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
                                }}
                                itemStyle={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#1A1A1A',
                                    textTransform: 'uppercase'
                                }}
                                labelStyle={{ display: 'none' }}
                            />
                            <Bar
                                dataKey="hours"
                                radius={[6, 6, 0, 0]}
                                barSize={40}
                            >
                                {mockData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={CUSTOM_COLORS[entry.status]}
                                    />
                                ))}
                            </Bar>
                             <ReferenceLine
                                y={8}
                                stroke="#F4D03F"
                                strokeDasharray="5 5"
                                strokeWidth={2}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={cn(glass.card, "p-8 mt-6 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] text-white border-transparent relative overflow-hidden group")}>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F4D03F]/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none group-hover:bg-[#F4D03F]/15 transition-all duration-1000" />

                <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-[#F4D03F] flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(244,208,63,0.3)]">
                        <Info className="w-8 h-8 text-[#1A1A1A]" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-xl font-bold tracking-tight">Activity <span className="text-[#F4D03F]">Intelligence</span></h4>
                            <p className="text-[10px] font-bold text-[#F4D03F]/60 uppercase tracking-widest">Weather & Foraging Cycles</p>
                        </div>
                        <p className="text-sm font-medium opacity-80 leading-relaxed pl-6 border-l-2 border-[#F4D03F]/40">
                            We use precision local weather data to predict bee activity windows.
                            Optimum flight occurs between 15°C and 25°C with wind speeds under 25km/h.
                        </p>
                    </div>
                    <button className={cn(glass.btnSecondary, "h-12 px-8 bg-white border-transparent hover:bg-white/90 text-[#1A1A1A]")}>
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>


            <style>{`
                .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default BeeFlightHoursForecast;
