import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
    ArrowLeftRight, FileText, FileSpreadsheet, Loader2, MapPin, Info, Settings2, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { beeyieldService, Apiary } from '@/services/beeyieldService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

const ComparisonsView: React.FC = () => {
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    const [selectedComparisonTab, setSelectedComparisonTab] = React.useState<'apt12' | 'apt24' | 'main'>('main');
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('');
    const [medium, setMedium] = React.useState<string>('pollen');
    const [dateRange, setDateRange] = React.useState<string>('7days');
    const [comparisonMode, setComparisonMode] = React.useState<string>('main');

    const [comparisonData, setComparisonData] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        const loadApiaries = async () => {
            const data = await beeyieldService.getApiaries();
            if (userId) {
                const filtered = data.filter(a => !a.user_id || a.user_id === userId);
                setApiaries(filtered);
                if (filtered.length > 0) setSelectedApiaryId(filtered[0].id);
            } else {
                setApiaries(data);
                if (data.length > 0) setSelectedApiaryId(data[0].id);
            }
        };
        loadApiaries();
    }, [userId]);

    React.useEffect(() => {
        const fetchComparison = async () => {
            if (!selectedApiaryId) return;
            setIsLoading(true);
            try {
                const data = await beeyieldService.getComparisonData({
                    medium,
                    range: dateRange,
                    apiary_id: selectedApiaryId === 'all' ? undefined : selectedApiaryId,
                    user_id: userId
                });
                setComparisonData(data || []);
            } catch (err) {
                console.error('Failed to fetch comparisons', err);
                setComparisonData([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchComparison();
    }, [selectedApiaryId, medium, dateRange, userId]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-12 pb-12 min-h-screen")}
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-border/50 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-[#1B9157]/ text-[#1B9157] border-[#1B9157]/ mb-2')}>
                        <ArrowLeftRight className="w-4 h-4 mr-2" />
                        Recursive Diagnostic Engine v3.0
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Yield <span className="text-[#F4D03F]">Variance</span>
                    </h1>
                    <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70")}>
                        Performance benchmarking across locations · Predictive yield delta
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
                    <h3 className={cn(glass.microLabel, "font-bold opacity-70")}>Comparison Parameters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* Apiary Selector */}
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")}>Location_Node</label>
                        <Select name="apiary_id" value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                            <SelectTrigger className={cn(glass.input, "h-14 text-sm font-semibold")}>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#F4D03F]" />
                                    <SelectValue placeholder="Select Apiary" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border bg-background shadow-xl">
                                {apiaries.map(a => (
                                    <SelectItem key={a.id} value={a.id} className="rounded-xl">{a.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Medium Selector */}
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")}>Diagnostic_Var</label>
                        <Select name="medium" value={medium} onValueChange={setMedium}>
                            <SelectTrigger className={cn(glass.input, "h-14 text-sm font-semibold")}>
                                <SelectValue placeholder="Select medium" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border bg-background shadow-xl">
                                <SelectItem value="pollen" className="rounded-xl">Pollen Flow</SelectItem>
                                <SelectItem value="nectar" className="rounded-xl">Nectar Yield</SelectItem>
                                <SelectItem value="water" className="rounded-xl">Water Usage</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date range */}
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")}>Temporal_Scope</label>
                        <Select name="date_range" value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className={cn(glass.input, "h-14 text-sm font-semibold")}>
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border bg-background shadow-xl">
                                <SelectItem value="7days" className="rounded-xl">Last 7 days</SelectItem>
                                <SelectItem value="30days" className="rounded-xl">Last 30 days</SelectItem>
                                <SelectItem value="month" className="rounded-xl">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Compare Mode */}
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")}>Operational_Mode</label>
                        <Select name="comparison_mode" value={comparisonMode} onValueChange={setComparisonMode}>
                            <SelectTrigger className={cn(glass.input, "h-14 text-sm font-semibold")}>
                                <SelectValue placeholder="Select comparison" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border bg-background shadow-xl">
                                <SelectItem value="main" className="rounded-xl">Main Area</SelectItem>
                                <SelectItem value="avg" className="rounded-xl">Avg. Global</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Export */}
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70 text-[#F4D03F]")}>Digital_Archive</label>
                        <div className="flex gap-2">
                            <button className={cn(glass.btnSecondary, "flex-1 h-14 justify-center text-[10px] font-bold")}>
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                CSV
                            </button>
                            <button className={cn(glass.btnSecondary, "flex-1 h-14 justify-center text-[10px] font-bold")}>
                                <FileText className="w-4 h-4 mr-2" />
                                XLS
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Comparisons Chart Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={cn(glass.card, "p-0 overflow-hidden shadow-2xl relative")}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4D03F]/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />

                <div className="p-10 pb-4 border-b border-border bg-gray-400 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F0]/60 flex items-center justify-center border border-border shadow-sm">
                                <TrendingUp className="w-6 h-6 text-[#F4D03F]" />
                            </div>
                            <h2 className={cn(glass.sectionTitle, "text-3xl normal-case")}>Aggregated <span className="text-[#F4D03F]">Benchmarks</span></h2>
                        </div>
                        <p className={cn(glass.microLabel, "opacity-60 italic mt-3 ml-2")}>Performance metrics across selected registry nodes.</p>
                    </div>

                    {/* Comparison Pills */}
                    <div className="flex bg-gray-400 p-1.5 gap-1.5 rounded-2xl border border-border shadow-inner">
                        {(['apt12', 'apt24', 'main'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedComparisonTab(tab)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                    selectedComparisonTab === tab
                                        ? "bg-[#FFF9F0] text-[#F4D03F] shadow-sm ring-1 ring-border"
                                        : "text-foreground/40 hover:text-foreground hover:bg-gray-400:bg-[#F4D03F]/10"
                                )}
                            >
                                {tab === 'apt12' ? 'APT_NODE_01' : tab === 'apt24' ? 'APT_NODE_02' : 'MAIN_REGISTRY'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-10 relative z-10">
                    <div className="h-[480px] w-full relative">
                        <AnimatePresence>
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-20 bg-background/40 backdrop-blur-sm rounded-3xl flex items-center justify-center"
                                >
                                    <div className="flex flex-col items-center gap-4 text-[#F4D03F]">
                                        <Loader2 className="w-12 h-12 animate-spin" />
                                        <span className={cn(glass.microLabel, "animate-pulse font-bold")}>RECURSIVE_DIAGNOSTIC_FETCH...</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {comparisonData.length === 0 && !isLoading ? (
                            <div className="h-full w-full flex flex-col items-center justify-center bg-gray-200 rounded-3xl border border-dashed border-border text-foreground/40">
                                <ArrowLeftRight className="w-16 h-16 mb-6 opacity-20" />
                                <p className={cn(glass.microLabel, "normal-case text-lg font-semibold")}>No comparison data available for this selection.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                <LineChart data={comparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: 'hsl(var(--foreground) / 0.6)', fontWeight: 600 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: 'hsl(var(--foreground) / 0.6)', fontWeight: 600 }}
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
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        height={60}
                                        iconType="circle"
                                        formatter={(value) => <span className={cn(glass.microLabel, "ml-2 font-bold opacity-70")}>{value}</span>}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="primary_value"
                                        name="PROTOCOL_ALPHA"
                                        stroke="hsl(var(--honey))"
                                        strokeWidth={4}
                                        dot={false}
                                        activeDot={{ r: 8, fill: 'hsl(var(--honey))', stroke: 'white', strokeWidth: 2, className: 'drop-shadow-lg' }}
                                        animationDuration={2000}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="secondary_value"
                                        name="PROTOCOL_BETA"
                                        stroke="hsl(var(--foreground) / 0.3)"
                                        strokeWidth={2}
                                        strokeDasharray="8 6"
                                        dot={false}
                                        activeDot={{ r: 6, fill: 'white', stroke: 'hsl(var(--foreground) / 0.4)', strokeWidth: 2 }}
                                        animationDuration={2500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* AI Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={cn(glass.card, "p-8 shadow-xl bg-[#F4D03F]/5 border-[#F4D03F]/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group")}
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#F4D03F]/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-[#F4D03F]/15 transition-colors" />
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#FFF9F0]/60 flex items-center justify-center shrink-0 border border-[#F4D03F] shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <Info className="w-8 h-8 text-[#F4D03F]" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h5 className={cn(glass.sectionTitle, "text-2xl normal-case mb-2")}>Comparison Diagnostic Summary</h5>
                    <p className="text-sm italic font-medium opacity-80 leading-relaxed max-w-4xl text-foreground">
                        We compare yield across locations. The “Current” line reflects recent foraging conditions, and “Baseline” shows the longer-term trend.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ComparisonsView;
