import React from 'react';
import { motion } from 'framer-motion';
import {
    Flower2,
    Calendar,
    LineChart as ChartIcon,
    ArrowRight,
    Search,
    Filter,
    CloudSun,
    Sprout,
    History
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { cn } from '@/lib/utils';
import { glass } from '@/components/beeyield/GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { fadeInUp } from '@/lib/motion';

const bloomData = [
    { stage: 'BBCH 51', intensity: 10, date: 'Mar 1' },
    { stage: 'BBCH 55', intensity: 35, date: 'Mar 5' },
    { stage: 'BBCH 60', intensity: 65, date: 'Mar 10' },
    { stage: 'BBCH 65', intensity: 95, date: 'Mar 15' },
    { stage: 'BBCH 67', intensity: 80, date: 'Mar 20' },
    { stage: 'BBCH 69', intensity: 40, date: 'Mar 25' },
];

const BloomPhenology: React.FC = () => {
    return (
        <motion.div
            {...fadeInUp}
            className="h-full"
        >
            <BeeYieldPageShell>
                <BeeYieldPageHeader
                    icon={Flower2}
                    label="Phenology"
                    title={<>Bloom <span className="text-[#F4D03F]">Synchronization</span></>}
                    subtitle="BBCH Growth Stages · Pollination Window Tracking · Forage Opportunity Math"
                    actions={
                        <button className={cn(glass.btnSecondary, "h-9 px-4")}>
                            <History className="w-3.5 h-3.5 mr-2" />
                            Historical Data
                        </button>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Stage Selection */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={cn(glass.section, "p-6 space-y-6")}>
                        <div className="flex items-center justify-between border-b border-[#F4D03F]/10 pb-4">
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Growth Stage</h3>
                            <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/5 flex items-center justify-center border border-[#F4D03F]/10">
                                <Sprout className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                        </div>

                        <div className="text-center py-8 bg-[#F9F7F2]/50 rounded-2xl border border-[#F4D03F]/10">
                            <span className="text-5xl font-black text-[#1A1A1A] tabular-nums tracking-tighter">65</span>
                            <p className="text-[10px] font-bold text-gray-400 mt-2">BBCH: Full Bloom</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-gray-500">Stage Progression</label>
                                <span className="text-[10px] font-bold text-[#1B9157]">65% Optimal</span>
                            </div>
                            <div className="h-2 w-full bg-[#F9F7F2] rounded-full relative overflow-hidden border border-[#F4D03F]/10">
                                <div className="absolute top-0 left-0 bottom-0 bg-[#1B9157] rounded-full transition-all duration-1000" style={{ width: '65%' }} />
                            </div>
                            <div className="flex justify-between text-[9px] font-bold text-gray-400">
                                <span>Bud (50)</span>
                                <span className="text-[#F4D03F]">Peak (65)</span>
                                <span>Fall (69)</span>
                            </div>
                        </div>

                        <div className={cn(glass.card, "p-5 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] text-white border-transparent relative overflow-hidden")}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4D03F]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <Flower2 className="w-3.5 h-3.5 text-[#F4D03F]" />
                                <span className="text-[10px] font-bold text-[#F4D03F]">Heads up</span>
                            </div>
                            <p className="text-[11px] font-medium leading-relaxed opacity-80 relative z-10 pl-3 border-l-2 border-[#F4D03F]/40">
                                Current stage suggests a peak nectar window. If you’re moving hives or adding boxes, aim to do it in the next few days.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Intensity Chart */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className={cn(glass.section, "overflow-hidden flex flex-col")}>
                        <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#1B9157]/5 flex items-center justify-center border border-[#1B9157]/10">
                                    <ChartIcon className="w-4 h-4 text-[#1B9157]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-[#1A1A1A]">Intensity Curve</h3>
                                    <p className="text-[10px] text-gray-500">Flowering Density Analysis</p>
                                </div>
                            </div>
                            <div className={cn(glass.badge, "bg-[#F4D03F]/10 text-[#1A1A1A] border-[#F4D03F]/20")}>
                                Peak Window: 4 Days Left
                            </div>
                        </div>

                        <div className="h-[380px] w-full p-6 relative flex-1 bg-[#FFF9F0]">
                            <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                            
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={bloomData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="bloomGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1B9157" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#1B9157" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000008" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontWeight: 700, fontSize: 10 }}
                                        dy={10}
                                    />
                                    <YAxis hide domain={[0, 110]} />
                                    <Tooltip
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #F4D03F20', 
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
                                    <Area
                                        type="monotone"
                                        dataKey="intensity"
                                        stroke="#1B9157"
                                        strokeWidth={3}
                                        fill="url(#bloomGradient)"
                                        animationDuration={2000}
                                    />
                                    <ReferenceLine x="Mar 15" stroke="#F4D03F" strokeWidth={2} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
            </BeeYieldPageShell>
        </motion.div>
    );
};

export default BloomPhenology;

