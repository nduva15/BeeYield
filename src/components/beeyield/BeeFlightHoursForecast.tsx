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

const CUSTOM_COLORS = {
    optimal: 'hsl(var(--honey))',
    moderate: 'hsl(var(--honey) / 0.5)',
    low: 'hsl(var(--foreground) / 0.1)',
};

const BeeFlightHoursForecast: React.FC = () => {
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
                subtitle="Requires real weather + flight telemetry."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <GlassStatCard label="Min Flight Temp" value="—" icon={Thermometer} index={0} />
                <GlassStatCard label="Max Wind Speed" value="—" icon={Wind} index={1} color="text-red-500" />
                <GlassStatCard label="Light Index" value="—" icon={Sun} index={2} />
                <GlassStatCard label="Total Week" value="—" icon={Activity} index={3} color="text-[#1B9157]" />
            </div>

            <div className={cn(glass.section, "overflow-hidden flex flex-col mt-6")}>
                <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/20 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-[#F4D03F]" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Weekly Capacity</h3>
                            <p className="text-[10px] text-gray-500 text-[9px]">Predicted Work Windows</p>
                        </div>
                    </div>
                </div>

                <div className="h-[380px] w-full p-6 relative bg-[#FFF9F0]">
                    <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    
                    <div className={cn(glass.card, "h-full w-full flex items-center justify-center bg-white/50 border border-[#F4D03F]/10")}>
                        <div className="text-center space-y-2 p-6">
                            <div className="inline-flex items-center gap-2 justify-center text-[#1A1A1A]">
                                <AlertCircle className="w-4 h-4 text-[#F4D03F]" />
                                <span className="text-sm font-bold">No forecast data yet</span>
                            </div>
                            <p className="text-xs font-medium text-gray-500 max-w-md">
                                This view no longer uses mock weekly forecast data. Wire weather inputs + flight telemetry to enable charts.
                            </p>
                        </div>
                    </div>
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
                            <p className="text-[10px] font-bold text-[#F4D03F]/60">Weather & Foraging Cycles</p>
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
