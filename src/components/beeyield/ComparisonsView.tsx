import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
    ArrowLeftRight, FileText, FileSpreadsheet, Loader2, MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { beeyieldService, Apiary } from '@/services/beeyieldService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ComparisonsView: React.FC = () => {
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    const [selectedComparisonTab, setSelectedComparisonTab] = useState<'apt12' | 'apt24' | 'main'>('main');
    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [selectedApiaryId, setSelectedApiaryId] = useState<string>('');
    const [medium, setMedium] = useState<string>('pollen');
    const [dateRange, setDateRange] = useState<string>('7days');
    const [comparisonMode, setComparisonMode] = useState<string>('main');

    const [comparisonData, setComparisonData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
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

    useEffect(() => {
        const fetchComparison = async () => {
            if (!selectedApiaryId) return;
            setIsLoading(true);
            try {
                // In a real app we'd call beeyieldService.getComparisonData
                // But let's mock some data if service isn't fully implemented
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filters Section */}
            <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-50 shadow-xl shadow-slate-200/40 overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Data Filters</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Configure your comparison parameters.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Apiary Selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location / Apiary</label>
                            <Select name="apiary_id" value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                                <SelectTrigger id="comparison-apiary" className="rounded-2xl border-slate-100 bg-slate-50/50 h-14 font-bold focus:ring-0 shadow-none text-slate-600 transition-all hover:bg-slate-50">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-amber-500" />
                                        <SelectValue placeholder="Select Apiary" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1 bg-white">
                                    {apiaries.map(a => (
                                        <SelectItem key={a.id} value={a.id} className="rounded-xl py-2.5 font-bold text-sm">{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Medium Selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Variable (Medium)</label>
                            <Select name="medium" value={medium} onValueChange={setMedium}>
                                <SelectTrigger id="comparison-medium" className="rounded-2xl border-slate-100 bg-slate-50/50 h-14 font-bold focus:ring-0 shadow-none text-slate-600 transition-all hover:bg-slate-50">
                                    <SelectValue placeholder="Select medium" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1 bg-white">
                                    <SelectItem value="pollen" className="rounded-xl py-2.5 font-bold text-sm">Pollen Flow</SelectItem>
                                    <SelectItem value="nectar" className="rounded-xl py-2.5 font-bold text-sm">Nectar Yield</SelectItem>
                                    <SelectItem value="water" className="rounded-xl py-2.5 font-bold text-sm">Water Usage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date range */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Temporal Scope</label>
                            <Select name="date_range" value={dateRange} onValueChange={setDateRange}>
                                <SelectTrigger id="comparison-range" className="rounded-2xl border-slate-100 bg-slate-50/50 h-14 font-bold focus:ring-0 shadow-none text-slate-600 transition-all hover:bg-slate-50">
                                    <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1 bg-white">
                                    <SelectItem value="7days" className="rounded-xl py-2.5 font-bold text-sm">Last 7 days</SelectItem>
                                    <SelectItem value="30days" className="rounded-xl py-2.5 font-bold text-sm">Last 30 days</SelectItem>
                                    <SelectItem value="month" className="rounded-xl py-2.5 font-bold text-sm">This Month</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Compare Mode */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Compare Mode</label>
                            <Select name="comparison_mode" value={comparisonMode} onValueChange={setComparisonMode}>
                                <SelectTrigger id="comparison-mode" className="rounded-2xl border-slate-100 bg-slate-50/50 h-14 font-bold focus:ring-0 shadow-none text-slate-600 transition-all hover:bg-slate-50">
                                    <SelectValue placeholder="Select comparison" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1 bg-white">
                                    <SelectItem value="main" className="rounded-xl py-2.5 font-bold text-sm">Main Area</SelectItem>
                                    <SelectItem value="avg" className="rounded-xl py-2.5 font-bold text-sm">Avg. Global</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Export */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Data Export</label>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 rounded-2xl h-14 border-slate-100 bg-slate-50/50 hover:bg-slate-100 gap-2 font-bold text-[10px] shadow-none uppercase tracking-widest">
                                    <FileText className="w-3.5 h-3.5" /> CSV
                                </Button>
                                <Button variant="outline" className="flex-1 rounded-2xl h-14 border-slate-100 bg-slate-50/50 hover:bg-slate-100 gap-2 font-bold text-[10px] shadow-none uppercase tracking-widest">
                                    <FileSpreadsheet className="w-3.5 h-3.5" /> XLS
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Comparisons Chart Section */}
            <Card className="rounded-[2.5rem] border-none bg-white dark:bg-slate-50 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/[0.01] rounded-full -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-110" />

                <CardContent className="p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
                                    <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">BeeYield Comparisons</h2>
                            </div>
                            <p className="text-sm text-slate-400 font-medium ml-13">Aggregated performance data across selected apiary zones.</p>
                        </div>

                        {/* Comparison Pills */}
                        <div className="flex bg-slate-50 border border-slate-100 rounded-2xl p-1.5 gap-1.5 shadow-inner">
                            {(['apt12', 'apt24', 'main'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedComparisonTab(tab)}
                                    className={cn(
                                        "px-6 py-2.5 text-[11px] font-bold rounded-xl transition-all",
                                        selectedComparisonTab === tab
                                            ? "bg-white text-slate-800 shadow-md scale-[1.05] z-10"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {tab === 'apt12' ? 'Apiary Zone 1' : tab === 'apt24' ? 'Apiary Zone 2' : 'Main Area'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[450px] w-full relative">
                        {isLoading && (
                            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] rounded-3xl flex items-center justify-center">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            </div>
                        )}

                        {comparisonData.length === 0 && !isLoading ? (
                            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">
                                <ArrowLeftRight className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-bold text-sm">No comparison data available for this selection.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <LineChart data={comparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                                        dx={-15}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '20px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            padding: '20px'
                                        }}
                                        itemStyle={{
                                            fontWeight: 700,
                                            fontSize: '12px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        height={60}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-[11px] font-black text-slate-500 ml-1 uppercase tracking-widest">{value}</span>}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="primary_value"
                                        name="Current Period"
                                        stroke="#10B981"
                                        strokeWidth={4}
                                        dot={{ r: 0 }}
                                        activeDot={{ r: 6, fill: '#10B981', strokeWidth: 0, stroke: 'white' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="secondary_value"
                                        name="Prior Period"
                                        stroke="#94A3B8"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={{ r: 0 }}
                                        activeDot={{ r: 4, fill: '#94A3B8', strokeWidth: 0, stroke: 'white' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ComparisonsView;
