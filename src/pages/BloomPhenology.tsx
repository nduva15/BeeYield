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
                    <button className={cn(glass.btnSecondary, "h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all")}>
                        <History className="w-3.5 h-3.5 mr-2" />
                        Historic Index
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* stage selection */}
                <div className={cn(glass.card, "lg:col-span-1 p-8 space-y-8 shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10")}>
                    <div className="flex items-center justify-between border-b border-[#F4D03F]/20 pb-4">
                        <h3 className="text-xl font-black uppercase tracking-tight leading-none">Growth <span className="text-[#F4D03F]">Stage</span></h3>
                        <Sprout className="w-5 h-5 text-[#F4D03F]" />
                    </div>

                    <div className="text-center py-6 border-2 border-[#F4D03F]/10 bg-[#F4D03F]/5 rounded-2xl">
                        <span className="text-4xl font-black text-[#064e3b] italic">65</span>
                        <p className="text-[9px] font-black uppercase text-[#064e3b]/40 mt-1 tracking-widest">BBCH: Full Bloom</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-[#064e3b]/40 tracking-widest block">Stage Progression Slider</label>
                        <div className="h-2 w-full bg-muted rounded-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 bottom-0 bg-[#1B9157] w-[65%]" />
                        </div>
                        <div className="flex justify-between text-[8px] font-black uppercase text-[#064e3b]/60">
                            <span>Bud (50)</span>
                            <span className="text-[#F4D03F]">Peak (65)</span>
                            <span>Fall (69)</span>
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-6 bg-[#064e3b] text-white rounded-2xl relative overflow-hidden group")}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <Flower2 className="w-4 h-4 text-[#F4D03F]" />
                            <span className="text-[10px] font-black uppercase tracking-tight">Optimization Notice</span>
                        </div>
                        <p className="text-[9px] font-bold leading-relaxed uppercase opacity-80 relative z-10 pl-3 border-l-2 border-[#F4D03F]/40">
                            Current stage indicates peak nectar secretion. Deploy Grade A pallets immediately.
                        </p>
                    </div>
                </div>

                {/* Intensity Chart */}
                <div className={cn(glass.card, "lg:col-span-2 p-0 flex flex-col overflow-hidden shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10")}>
                    <div className="flex flex-col md:flex-row items-center justify-between p-8 border-b border-[#F4D03F]/10 bg-white/30">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Intensity <span className="text-[#F4D03F]">Curve</span></h3>
                            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest pl-2 border-l-4 border-[#F4D03F]/20">Real-time flowering density over time</p>
                        </div>
                        <div className={cn(glass.badge, "bg-[#F4D03F] text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-sm")}>
                            PEAK WINDOW: 4 DAYS REMAINING
                        </div>
                    </div>

                    <div className="h-[400px] w-full p-8 relative flex-1">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                        
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

