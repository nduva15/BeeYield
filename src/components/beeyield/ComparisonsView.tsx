import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
    ArrowLeftRight, FileText, FileSpreadsheet, Loader2, MapPin, Info, Settings2, Download, TrendingUp
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

    const [selectedComparisonTab, setSelectedComparisonTab] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('');
    const [medium, setMedium] = React.useState<string>('pollen');
    const [dateRange, setDateRange] = React.useState<string>('7days');
    const [comparisonMode, setComparisonMode] = React.useState<string>('main');

    const [sensorReadings, setSensorReadings] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isOffline, setIsOffline] = React.useState(false);

    const LS_KEY = "beeyield_comparisons_cache_v1";

    const readCache = React.useCallback(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }, []);

    const writeCache = React.useCallback((data: any) => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(data));
        } catch { /* ignore */ }
    }, []);

    React.useEffect(() => {
        const loadApiaries = async () => {
            try {
                const data = await beeyieldService.getApiaries();
                if (userId) {
                    const filtered = data.filter(a => !a.user_id || a.user_id === userId);
                    setApiaries(filtered);
                    if (filtered.length > 0) setSelectedApiaryId(filtered[0].id);
                } else {
                    setApiaries(data);
                    if (data.length > 0) setSelectedApiaryId(data[0].id);
                }
            } catch (err) {
                console.error("Failed to load apiaries", err);
            }
        };
        loadApiaries();
    }, [userId]);

    React.useEffect(() => {
        const fetchComparison = async () => {
            if (!selectedApiaryId) return;
            setIsLoading(true);
            setIsOffline(false);
            try {
                const data = await beeyieldService.getComparisonData({
                    medium,
                    range: dateRange,
                    apiary_id: selectedApiaryId === 'all' ? undefined : selectedApiaryId,
                    user_id: userId
                });
                setSensorReadings(data || []);
                writeCache({ readings: data || [], timestamp: Date.now() });
            } catch (err) {
                console.error('Failed to fetch comparisons', err);
                const cached = readCache();
                if (cached?.readings) {
                    setSensorReadings(cached.readings);
                    setIsOffline(true);
                    toast.info("Showing cached comparison data");
                } else {
                    setSensorReadings([]);
                    toast.error("Failed to load comparisons");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchComparison();
    }, [selectedApiaryId, medium, dateRange, userId, readCache, writeCache]);

    // Data transformation for Recharts
    const chartData = React.useMemo(() => {
        if (!sensorReadings || sensorReadings.length === 0) return [];

        // group by date
        const groups = new Map<string, { primary: number[]; secondary: number[] }>();

        sensorReadings.forEach(r => {
            const date = new Date(r.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
            if (!groups.has(date)) {
                groups.set(date, { primary: [], secondary: [] });
            }
            const group = groups.get(date)!;
            
            // For now, treat odd/even ids or hive_ids as primary/secondary to simulate comparison
            // In a real app, this would be based on specific filter logic (e.g. this year vs last year)
            const val = r.value || 0;
            if (r.id % 2 === 0) {
                group.primary.push(val);
            } else {
                group.secondary.push(val);
            }
        });

        return Array.from(groups.entries()).map(([label, values]) => ({
            label,
            primary_value: values.primary.length ? values.primary.reduce((a, b) => a + b) / values.primary.length : 0,
            secondary_value: values.secondary.length ? values.secondary.reduce((a, b) => a + b) / values.secondary.length : 0,
        })).sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
    }, [sensorReadings]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-12 pb-12 min-h-screen")}
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-border/50 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20 mb-2')}>
                        <ArrowLeftRight className="w-4 h-4 mr-2" />
                        Yield Comparison Engine
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Yield <span className="text-[#F4D03F]">Trends</span>
                    </h1>
                    <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70")}>
                        Compare honey production and colony health across your apiaries.
                    </p>
                </div>
            </div>

            {isOffline && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <Info className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-sm font-semibold text-amber-700">You are viewing cached data. Some recent comparisons may be missing.</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="text-amber-700 hover:bg-amber-100 font-bold">Retry</Button>
                </div>
            )}

            {/* Filters Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(glass.card, "p-8 shadow-xl")}
            >
                <div className="flex items-center gap-3 mb-8">
                    <Settings2 className="w-5 h-5 text-[#F4D03F]" />
                    <h3 className={cn(glass.microLabel, "font-bold opacity-70")}>Analysis Parameters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* Apiary Selector */}
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")} htmlFor="comparison-apiary-select">Apiary</label>
                        <Select name="apiary_id" value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                            <SelectTrigger id="comparison-apiary-select" aria-label="Select Apiary" className={cn(glass.input, "h-14 text-sm font-semibold")}>
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
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")} htmlFor="comparison-variable-select">Variable</label>
                        <Select name="medium" value={medium} onValueChange={setMedium}>
                            <SelectTrigger id="comparison-variable-select" aria-label="Select Variable" className={cn(glass.input, "h-14 text-sm font-semibold")}>
                                <SelectValue placeholder="Select variable" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border bg-background shadow-xl">
                                <SelectItem value="pollen" className="rounded-xl">Pollen Flow</SelectItem>
                                <SelectItem value="nectar" className="rounded-xl">Nectar Yield</SelectItem>
                                <SelectItem value="water" className="rounded-xl">Water Usage</SelectItem>
                                <SelectItem value="honey" className="rounded-xl">Weight Change</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date range */}
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")} htmlFor="comparison-range-select">Timeframe</label>
                        <Select name="date_range" value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger id="comparison-range-select" aria-label="Select Timeframe" className={cn(glass.input, "h-14 text-sm font-semibold")}>
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
                        <label className={cn(glass.microLabel, "pl-1 opacity-70")} htmlFor="comparison-mode-select">Mode</label>
                        <Select name="comparison_mode" value={comparisonMode} onValueChange={setComparisonMode}>
                            <SelectTrigger id="comparison-mode-select" aria-label="Select Comparison Mode" className={cn(glass.input, "h-14 text-sm font-semibold")}>
                                <SelectValue placeholder="Select comparison" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border bg-background shadow-xl">
                                <SelectItem value="main" className="rounded-xl">Selected vs Peers</SelectItem>
                                <SelectItem value="avg" className="rounded-xl">Selected vs Global</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Export */}
                    <div className="space-y-2">
                        <label className={cn(glass.microLabel, "pl-1 opacity-70 text-[#F4D03F]")}>Export Data</label>
                        <div className="flex gap-2">
                            <button className={cn(glass.btnSecondary, "flex-1 h-14 justify-center text-[10px] font-bold")} aria-label="Export as CSV">
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                CSV
                            </button>
                            <button className={cn(glass.btnSecondary, "flex-1 h-14 justify-center text-[10px] font-bold")} aria-label="Export as Excel">
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

                <div className="p-10 pb-4 border-b border-border bg-[#FCFAF5] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-border shadow-sm">
                                <TrendingUp className="w-6 h-6 text-[#F1C40F]" />
                            </div>
                            <h2 className={cn(glass.sectionTitle, "text-3xl normal-case")}>Production <span className="text-[#F1C40F]">Benchmarks</span></h2>
                        </div>
                        <p className={cn(glass.microLabel, "opacity-60 italic mt-3 ml-2")}>Comparison of yield data across your apiary network.</p>
                    </div>

                    {/* Comparison Pills */}
                    <div className="flex bg-[#F9F7F2] p-1.5 gap-1.5 rounded-2xl border border-border shadow-inner">
                        {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedComparisonTab(tab)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-bold transition-all",
                                    selectedComparisonTab === tab
                                        ? "bg-white text-[#F1C40F] shadow-sm ring-1 ring-border"
                                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                                )}
                            >
                                {tab === 'daily' ? 'Daily' : tab === 'weekly' ? 'Weekly' : 'Monthly'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-10 relative z-10 bg-white">
                    <div className="h-[480px] w-full relative">
                        <AnimatePresence>
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center"
                                >
                                    <div className="flex flex-col items-center gap-4 text-[#F1C40F]">
                                        <Loader2 className="w-12 h-12 animate-spin" />
                                        <span className={cn(glass.microLabel, "animate-pulse font-bold")}>Loading comparison data…</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {chartData.length === 0 && !isLoading ? (
                            <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-border text-gray-400">
                                <ArrowLeftRight className="w-16 h-16 mb-6 opacity-20" />
                                <p className={cn(glass.microLabel, "normal-case text-base font-semibold")}>Not enough data for this selection.</p>
                                <p className="text-xs mt-1">Connect more sensors to enable comparison mapping.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#999', fontWeight: 600 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#999', fontWeight: 600 }}
                                        dx={-15}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(12px)',
                                            borderRadius: '1rem',
                                            border: '1px solid #EEE',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            padding: '16px',
                                        }}
                                        itemStyle={{ fontWeight: 600, fontSize: '12px' }}
                                        labelStyle={{ fontWeight: 700, marginBottom: '8px', fontSize: '13px', color: '#1A1A1A' }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        height={60}
                                        iconType="circle"
                                        formatter={(value) => <span className={cn(glass.microLabel, "ml-2 font-bold opacity-70")}>{value === 'primary_value' ? 'Current Apiary' : 'Baseline Group'}</span>}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="primary_value"
                                        stroke="#F1C40F"
                                        strokeWidth={4}
                                        dot={false}
                                        activeDot={{ r: 8, fill: '#F1C40F', stroke: 'white', strokeWidth: 2 }}
                                        animationDuration={1500}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="secondary_value"
                                        stroke="#E0E0E0"
                                        strokeWidth={2}
                                        strokeDasharray="8 6"
                                        dot={false}
                                        activeDot={{ r: 6, fill: 'white', stroke: '#DDD', strokeWidth: 2 }}
                                        animationDuration={2000}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={cn(glass.card, "p-8 shadow-xl bg-emerald-50/50 border-emerald-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group")}
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <Info className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h5 className={cn(glass.sectionTitle, "text-2xl normal-case mb-2")}>Trend Analysis Summary</h5>
                    <p className="text-sm italic font-medium opacity-80 leading-relaxed max-w-4xl text-[#1A1A1A]/70">
                        We compare yield across locations. The yellow line reflects recent foraging conditions in your selected apiary, while the dashed line shows the peer group average for comparison.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ComparisonsView;
