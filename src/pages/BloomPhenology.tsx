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
import { glass, PageHeader } from '@/components/beeyield/GlassTheme';

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "space-y-8 pb-32")}
        >
            {/* Header */}
            <PageHeader
                icon={Flower2}
                label="Floral Phenology Engine"
                title={<>Bloom <span className="text-[#F4D03F]">Synchronization</span></>}
                subtitle="BBCH Growth Stages · Pollination Window Tracking · Forage Opportunity Math"
                actions={
                    <button className={cn(glass.btnSecondary, "h-9 px-4 text-[10px] font-bold uppercase tracking-widest transition-all")}>
                        <History className="w-3.5 h-3.5 mr-2" />
                        Historic Index
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* stage selection */}
                <div className={cn(glass.card, "lg:col-span-1 p-6 space-y-6")}>
                    <div className="flex items-center justify-between border-b border-[#F4D03F]/20 pb-3">
                        <h3 className={cn(glass.sectionTitle)}>Growth <span className="text-[#F4D03F]">Stage</span></h3>
                        <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] flex items-center justify-center border border-[#F4D03F]/20">
                            <Sprout className="w-4 h-4 text-[#F4D03F]" />
                        </div>
                    </div>

                    <div className="text-center py-5 border border-[#F4D03F]/20 bg-[#F4D03F]/5 rounded-xl">
                        <span className="text-3xl font-bold text-[#1A1A1A] tabular-nums">65</span>
                        <p className={cn(glass.microLabel, "mt-1")}>BBCH: Full Bloom</p>
                    </div>

                    <div className="space-y-3">
                        <label className={glass.microLabel}>Stage Progression Slider</label>
                        <div className="h-1.5 w-full bg-[#F4D03F]/10 rounded-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 bottom-0 bg-[#1B9157] rounded-full w-[65%]" />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold uppercase text-[#1A1A1A]/40 tracking-wider">
                            <span>Bud (50)</span>
                            <span className="text-[#F4D03F]">Peak (65)</span>
                            <span>Fall (69)</span>
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-5 bg-[#1A1A1A] text-white border-[#1A1A1A] relative overflow-hidden group")}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <Flower2 className="w-3.5 h-3.5 text-[#F4D03F]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F4D03F]">Optimization Notice</span>
                        </div>
                        <p className="text-[10px] font-medium leading-relaxed opacity-70 relative z-10 pl-3 border-l-2 border-[#F4D03F]/40">
                            Current stage indicates peak nectar secretion. Deploy Grade A pallets immediately.
                        </p>
                    </div>
                </div>

                {/* Intensity Chart */}
                <div className={cn(glass.card, "lg:col-span-2 p-0 flex flex-col overflow-hidden")}>
                    <div className={cn(glass.sectionHeader, "flex-col md:flex-row gap-3")}>
                        <div className="space-y-1">
                            <h3 className={glass.sectionTitle}>Intensity <span className="text-[#F4D03F]">Curve</span></h3>
                            <p className={glass.microLabel}>Real-time flowering density over time</p>
                        </div>
                        <div className={cn(glass.badge, "bg-[#F4D03F] text-[#1A1A1A] border-[#F4D03F]")}>
                            PEAK WINDOW: 4 DAYS REMAINING
                        </div>
                    </div>

                    <div className="h-[380px] w-full p-6 relative flex-1 bg-[#FFF9F0]">
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                        
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={bloomData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="bloomGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1B9157" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#1B9157" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.05} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'currentColor', opacity: 0.3, fontWeight: 'black', fontSize: 10 }}
                                    dy={10}
                                />
                                <YAxis hide domain={[0, 110]} />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                                        backdropFilter: 'blur(12px)', 
                                        border: 'none', 
                                        borderRadius: '1rem', 
                                        color: '#fff', 
                                        padding: '1rem',
                                        fontSize: '10px',
                                        fontWeight: 'black',
                                        textTransform: 'uppercase'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="intensity"
                                    stroke="#1B9157"
                                    strokeWidth={4}
                                    fill="url(#bloomGradient)"
                                    animationDuration={2000}
                                />
                                <ReferenceLine x="Mar 15" stroke="#F4D03F" strokeWidth={3} strokeDasharray="6 6" label={{ position: 'top', value: 'CURRENT', fill: '#064e3b', fontSize: 8, fontWeight: 900 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default BloomPhenology;

