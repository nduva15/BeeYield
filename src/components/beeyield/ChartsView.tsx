import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import {
    TrendingUp, TrendingDown, FileText, FileSpreadsheet,
    AlertCircle, BarChart3, Lightbulb, Info, Activity, Download, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion } from 'framer-motion';

const chartData = [];

const CustomDot = (props: any) => {
    const { cx, cy, value } = props;
    if (value > 0.55) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={6} fill="hsl(var(--destructive))" stroke="white" strokeWidth={2} className="drop-shadow-sm" />
                <circle cx={cx} cy={cy} r={12} fill="hsl(var(--destructive) / 0.1)" className="animate-pulse" />
            </g>
        );
    }
    return null;
};

const ChartsView: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-12 pb-12 min-h-screen")}
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-border/50 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-[#1B9157] text-[#1B9157] border-[#1B9157] mb-2')}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Telemetry Diagnostics v3.0
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Usage <span className="text-[#F4D03F]">Archive</span>
                    </h1>
                    <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70")}>
                        Granular Consumption Analysis · Anomaly Marker Detection
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
                <h3 className={cn(glass.microLabel, "font-bold opacity-60 mb-6")}>Filtering Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")}>Geospatial Area</label>
                        <Input
                            defaultValue="Kibwezi Main Area A"
                            className={cn(glass.input, "h-12 text-sm font-semibold")}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")}>Tele-Type</label>
                        <Select defaultValue="water">
                            <SelectTrigger className={cn(glass.input, "h-12 text-sm font-semibold")}>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border bg-background shadow-xl">
                                <SelectItem value="water">Water</SelectItem>
                                <SelectItem value="heat">Heat</SelectItem>
                                <SelectItem value="electricity">Electricity</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")}>Temporal Scope</label>
                        <Select defaultValue="7days">
                            <SelectTrigger className={cn(glass.input, "h-12 text-sm font-semibold")}>
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border bg-background shadow-xl">
                                <SelectItem value="7days">Last 7 days</SelectItem>
                                <SelectItem value="30days">Last 30 days</SelectItem>
                                <SelectItem value="90days">Last 90 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")}>Comparison</label>
                        <Select defaultValue="main">
                            <SelectTrigger className={cn(glass.input, "h-12 text-sm font-semibold")}>
                                <SelectValue placeholder="Select comparison" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border bg-background shadow-xl">
                                <SelectItem value="main">Main Area</SelectItem>
                                <SelectItem value="prev">Previous Period</SelectItem>
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

            {/* Charts Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={cn(glass.card, "p-0 overflow-hidden shadow-2xl relative")}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4D03F]/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />

                <div className="p-10 pb-4 border-b border-border bg-gray-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div>
                        <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Usage Trend <span className="text-[#F4D03F]">History</span></h3>
                        <p className={cn(glass.microLabel, "opacity-60 italic mt-1")}>Activity patterns and trend analysis</p>
                    </div>
                    <div className="flex items-center gap-6 bg-card/ p-2 px-4 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#F4D03F]" />
                            <span className={cn(glass.microLabel, "font-bold normal-case opacity-70")}>Normal range</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                            <span className={cn(glass.microLabel, "font-bold normal-case opacity-70")}>Detected anomaly</span>
                        </div>
                    </div>
                </div>

                <div className="p-10 relative z-10">
                    <div className="h-[430px] w-full relative">
                        {chartData.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/ backdrop-blur-sm z-20 rounded-2xl border border-dashed border-border/">
                                <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-[#F4D03F]/10 flex items-center justify-center">
                                        <Activity className="w-8 h-8 text-[#F4D03F]" />
                                    </div>
                                    <h3 className="text-sm font-black text-foreground tracking-tighter uppercase opacity-60">Awaiting signal…</h3>
                                </motion.div>
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData.length > 0 ? chartData : [{ name: '', value: 0 }]} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="hsl(var(--honey))" />
                                        <stop offset="100%" stopColor="#10b981" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--foreground) / 0.6)', fontSize: 11, fontWeight: 600 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--foreground) / 0.6)', fontSize: 11, fontWeight: 600 }}
                                    domain={[0, 1.0]}
                                    ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                                    dx={-15}
                                />
                                <Tooltip
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
                                <ReferenceLine
                                    y={0.55}
                                    stroke="hsl(var(--destructive) / 0.3)"
                                    strokeDasharray="6 6"
                                    label={{ value: 'Protocol Cap', fill: 'hsl(var(--destructive))', fontSize: 10, fontWeight: 700, position: 'insideTopRight' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="url(#lineGrad)"
                                    strokeWidth={4}
                                    dot={<CustomDot />}
                                    activeDot={{ r: 8, fill: 'hsl(var(--honey))', stroke: 'white', strokeWidth: 2, className: 'drop-shadow-lg' }}
                                    animationDuration={2000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Grid: Issues & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* System Issues */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-sm">
                            <AlertCircle className="w-6 h-6 text-destructive" />
                        </div>
                        <h3 className={cn(glass.sectionTitle, "text-2xl normal-case italic")}>Anomaly Queue</h3>
                    </div>
                    <div className={cn(glass.card, "p-8 space-y-4 shadow-xl")}>
                        <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-center justify-between group hover:bg-destructive/10 transition-colors cursor-pointer shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/5 rounded-full blur-xl pointer-events-none" />
                            <div className="space-y-1 relative z-10">
                                <h4 className={cn(glass.microLabel, "text-sm font-bold text-foreground")}>Recursive Usage Spike</h4>
                                <p className={cn(glass.microLabel, "opacity-60 italic")}>KIB_MAIN_C · T+03:00</p>
                            </div>
                            <div className={cn(glass.badge, "bg-destructive text-foreground border-transparent px-4 py-1 animate-pulse shadow-md relative z-10")}>
                                <Zap className="w-3 h-3 mr-1" /> HIGH_SEV
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-400 border border-border flex items-center justify-between group hover:border-[#F4D03F] transition-colors cursor-pointer shadow-sm">
                            <div className="space-y-1">
                                <h4 className={cn(glass.microLabel, "text-sm font-bold text-foreground")}>Signal Drop Isolation</h4>
                                <p className={cn(glass.microLabel, "opacity-60 italic")}>KIB_MAIN_B · T+12:00</p>
                            </div>
                            <div className={cn(glass.badge, "bg-[#F4D03F] text-white border-transparent px-4 py-1 shadow-md")}>
                                MED_SEV
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Insights */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1B9157] flex items-center justify-center border border-[#1B9157] shadow-sm">
                            <Lightbulb className="w-6 h-6 text-[#1B9157]" />
                        </div>
                        <h3 className={cn(glass.sectionTitle, "text-2xl normal-case italic")}>Optimization Hub</h3>
                    </div>
                    <div className={cn(glass.card, "p-8 space-y-4 shadow-xl")}>
                        <div className="p-6 rounded-2xl bg-[#1B9157] border border-[#1B9157] flex items-center justify-between group hover:bg-[#1B9157] transition-colors cursor-pointer shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#1B9157] rounded-full blur-xl pointer-events-none" />
                            <div className="space-y-1 relative z-10">
                                <h4 className={cn(glass.microLabel, "text-sm font-bold text-foreground")}>Efficiency Peak Phase</h4>
                                <p className={cn(glass.microLabel, "opacity-60 italic")}>Optimized recursive window detected</p>
                            </div>
                            <div className={cn(glass.badge, "bg-[#145A32] text-white border-transparent px-4 py-2 shadow-lg flex items-center gap-2 relative z-10")}>
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-bold">+18%_GAIN</span>
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-400 border border-border flex items-center justify-between group hover:border-destructive transition-colors cursor-pointer shadow-sm">
                            <div className="space-y-1">
                                <h4 className={cn(glass.microLabel, "text-sm font-bold text-foreground")}>Load Compression Baseline</h4>
                                <p className={cn(glass.microLabel, "opacity-60 italic")}>Minimum signal overhead window</p>
                            </div>
                            <div className={cn(glass.badge, "bg-destructive text-foreground border-transparent px-4 py-2 shadow-lg flex items-center gap-2")}>
                                <TrendingDown className="w-4 h-4" />
                                <span className="font-bold">-9%_LOSS</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={cn(glass.card, "p-8 shadow-xl bg-[#F4D03F]/5 border-border/ flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group")}
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#F4D03F]/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-[#F4D03F]/15 transition-colors" />
                <div className="w-16 h-16 rounded-[1.5rem] bg-card/ flex items-center justify-center shrink-0 border border-[#F4D03F] shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <Info className="w-8 h-8 text-[#F4D03F]" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h5 className={cn(glass.sectionTitle, "text-2xl normal-case mb-2")}>Telemetry Insight Summary</h5>
                    <p className="text-sm italic font-medium opacity-80 leading-relaxed max-w-4xl text-foreground">
                        Recursive signal analysis indicates a stable consumption baseline with isolated anomalies in Area C. System optimization is reaching peak efficiency for the current temporal scope. Archival exports are available for external audits.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ChartsView;

