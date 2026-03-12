import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileText, FileSpreadsheet, Search, Info, Settings2, Zap, Activity, Droplets, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion } from 'framer-motion';

const consumptionData = [
    { name: 'Water', value: 320, color: 'var(--honey)' },
    { name: 'Heat', value: 210, color: '#EA580C' },
    { name: 'Energy', value: 410, color: '#10B981' },
    { name: 'Other', value: 100, color: '#6366F1' },
];

const summaryItems = [
    { label: 'Water', value: '320 m3', icon: Droplets, color: 'text-blue-500' },
    { label: 'Heat', value: '210 GJ', icon: Thermometer, color: 'text-orange-500' },
    { label: 'Energy', value: '410 kWh', icon: Zap, color: 'text-[#1B9157]' },
];

const ConsumptionView: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-12 pb-20 min-h-screen")}
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-border/50 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-[#1B9157]/ text-[#1B9157] border-[#1B9157]/ mb-2')}>
                        <Activity className="w-4 h-4 mr-2" />
                        Usage Volumetric Engine v4.2
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Consumption <span className="text-[#F4D03F]">Density</span>
                    </h1>
                    <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70")}>
                        Resource Utilization · Volumetric Analysis · Live Signal Processing
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(glass.card, "p-8 shadow-xl")}
            >
                <div className="flex items-center gap-3 mb-8">
                    <Settings2 className="w-5 h-5 text-[#F4D03F]" />
                    <h3 className={cn(glass.microLabel, "font-bold opacity-70")}>Aggregate Parameters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")}>Geospatial Zone</label>
                        <Input
                            defaultValue="Kibwezi Main Area A"
                            className={cn(glass.input, "h-12 text-sm font-semibold")}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")}>Logic_Type</label>
                        <Select defaultValue="water">
                            <SelectTrigger className={cn(glass.input, "h-12 text-sm font-semibold")}>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border bg-background shadow-xl">
                                <SelectItem value="water">Water</SelectItem>
                                <SelectItem value="heat">Heat</SelectItem>
                                <SelectItem value="energy">Energy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")}>Temporal_Bin</label>
                        <Select defaultValue="7days">
                            <SelectTrigger className={cn(glass.input, "h-12 text-sm font-semibold")}>
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border bg-background shadow-xl">
                                <SelectItem value="7days">Last 7 days</SelectItem>
                                <SelectItem value="30days">Last 30 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")}>Recursive_Comp</label>
                        <Select defaultValue="main">
                            <SelectTrigger className={cn(glass.input, "h-12 text-sm font-semibold")}>
                                <SelectValue placeholder="Select comparison" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border bg-background shadow-xl">
                                <SelectItem value="main">Main Area</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70 text-[#F4D03F]")}>Archival Export</label>
                        <div className="flex gap-2">
                            <button className={cn(glass.btnSecondary, "flex-1 h-12 justify-center text-[10px] font-bold")}>
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                CSV
                            </button>
                            <button className={cn(glass.btnSecondary, "flex-1 h-12 justify-center text-[10px] font-bold")}>
                                <FileText className="w-4 h-4 mr-2" />
                                XLS
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Chart Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={cn(glass.card, "p-0 overflow-hidden shadow-2xl relative min-h-[550px]")}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4D03F]/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />

                <div className="p-10 pb-4 border-b border-border bg-gray-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF9F0]/60 flex items-center justify-center border border-border shadow-sm">
                            <Search className="w-6 h-6 text-[#F4D03F]" />
                        </div>
                        <div>
                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Volumetric <span className="text-[#F4D03F]">Density</span></h3>
                            <p className={cn(glass.microLabel, "opacity-60 italic mt-1")}>Live usage signal array benchmarking</p>
                        </div>
                    </div>
                    <div className={cn(glass.badge, "bg-[#F4D03F] text-white border-transparent px-4 py-2 shadow-lg animate-pulse")}>
                        LIVE_SIGNAL_ARRAY
                    </div>
                </div>

                <div className="p-10 pb-12 relative z-10">
                    <div className="h-[420px] w-full">
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <BarChart data={consumptionData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--foreground) / 0.6)', fontSize: 12, fontWeight: 700 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--foreground) / 0.6)', fontSize: 12, fontWeight: 700 }}
                                    dx={-15}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--foreground) / 0.05)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background) / 0.8)',
                                        backdropFilter: 'blur(12px)',
                                        borderRadius: '1rem',
                                        border: '1px solid hsl(var(--border))',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        padding: '16px',
                                    }}
                                    itemStyle={{ fontWeight: 600, fontSize: '12px' }}
                                    labelStyle={{ fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}
                                />
                                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={100} animationDuration={2500}>
                                    {consumptionData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color === 'var(--honey)' ? 'hsl(var(--honey))' : entry.color}
                                            className="opacity-80 hover:opacity-100 transition-opacity"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>

            {/* Recursive Summary Log */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
            >
                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                        <Activity className="w-5 h-5 text-[#F4D03F]" />
                    </div>
                    <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Recursive Summary <span className="text-[#F4D03F]">Log</span></h3>
                </div>

                <div className={cn(glass.card, "p-4 space-y-4 shadow-xl divide-y divide-border/30 overflow-hidden")}>
                    {summaryItems.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                            className="p-6 pt-8 flex items-center justify-between hover:bg-gray-400:bg-[#F4D03F]/10 rounded-2xl transition-all group first:pt-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn("w-14 h-14 rounded-2xl bg-[#FFF9F0]/60 flex items-center justify-center border border-border shadow-sm group-hover:scale-110 transition-transform duration-300", item.color)}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className={cn(glass.sectionTitle, "text-xl normal-case italic opacity-80 group-hover:opacity-100 transition-opacity")}>{item.label}</p>
                                    <p className={cn(glass.microLabel, "opacity-40 font-bold")}>LAST_MONTH_BIN</p>
                                </div>
                            </div>
                            <div className={cn(glass.badge, "h-12 px-8 text-lg font-bold bg-[#FFF9F0] text-[#F4D03F] border-[#F4D03F]/30 shadow-lg group-hover:scale-105 transition-transform")}>
                                {item.value}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* AI Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={cn(glass.card, "p-8 shadow-xl bg-[#F4D03F]/5 border-[#F4D03F]/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group")}
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#F4D03F]/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#F4D03F]/15 transition-colors" />
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#FFF9F0]/60 flex items-center justify-center shrink-0 border border-[#F4D03F] shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <Info className="w-8 h-8 text-[#F4D03F]" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h5 className={cn(glass.sectionTitle, "text-2xl normal-case mb-2")}>Volumetric Diagnostic Summary</h5>
                    <p className="text-sm italic font-medium opacity-80 leading-relaxed max-w-4xl text-foreground">
                        Recursive volumetric analysis indicates balanced density across Water, Heat, and Energy sectors. The Energy sector shows
                        a 12% peak increase compared to the previous bin, while Water remains within historical baseline thresholds.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ConsumptionView;
