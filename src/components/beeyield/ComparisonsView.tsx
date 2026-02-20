import React from 'react';
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
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter italic">Comparison Parameters</h3>
                            <p className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] mt-1">Configure recursive diagnostic logic</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Apiary Selector */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Location_Node</label>
                            <Select name="apiary_id" value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                                <SelectTrigger id="comparison-apiary" className="rounded-none border-4 border-[#064e3b] bg-white h-14 font-black uppercase text-xs focus:ring-0 transition-none">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-[#facc15]" />
                                        <SelectValue placeholder="Select Apiary" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-[#064e3b] p-1 bg-white">
                                    {apiaries.map(a => (
                                        <SelectItem key={a.id} value={a.id} className="rounded-none py-2.5 font-black uppercase text-[10px]">{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Medium Selector */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Diagnostic_Var</label>
                            <Select name="medium" value={medium} onValueChange={setMedium}>
                                <SelectTrigger id="comparison-medium" className="rounded-none border-4 border-[#064e3b] bg-white h-14 font-black uppercase text-xs focus:ring-0 transition-none">
                                    <SelectValue placeholder="Select medium" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-[#064e3b] p-1 bg-white">
                                    <SelectItem value="pollen" className="rounded-none py-2.5 font-black uppercase text-[10px]">Pollen Flow</SelectItem>
                                    <SelectItem value="nectar" className="rounded-none py-2.5 font-black uppercase text-[10px]">Nectar Yield</SelectItem>
                                    <SelectItem value="water" className="rounded-none py-2.5 font-black uppercase text-[10px]">Water Usage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date range */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Temporal_Scope</label>
                            <Select name="date_range" value={dateRange} onValueChange={setDateRange}>
                                <SelectTrigger id="comparison-range" className="rounded-none border-4 border-[#064e3b] bg-white h-14 font-black uppercase text-xs focus:ring-0 transition-none">
                                    <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-[#064e3b] p-1 bg-white">
                                    <SelectItem value="7days" className="rounded-none py-2.5 font-black uppercase text-[10px]">Last 7 days</SelectItem>
                                    <SelectItem value="30days" className="rounded-none py-2.5 font-black uppercase text-[10px]">Last 30 days</SelectItem>
                                    <SelectItem value="month" className="rounded-none py-2.5 font-black uppercase text-[10px]">This Month</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Compare Mode */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Operational_Mode</label>
                            <Select name="comparison_mode" value={comparisonMode} onValueChange={setComparisonMode}>
                                <SelectTrigger id="comparison-mode" className="rounded-none border-4 border-[#064e3b] bg-white h-14 font-black uppercase text-xs focus:ring-0 transition-none">
                                    <SelectValue placeholder="Select comparison" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-[#064e3b] p-1 bg-white">
                                    <SelectItem value="main" className="rounded-none py-2.5 font-black uppercase text-[10px]">Main Area</SelectItem>
                                    <SelectItem value="avg" className="rounded-none py-2.5 font-black uppercase text-[10px]">Avg. Global</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Export */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Digital_Archive</label>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 rounded-none h-14 border-2 border-[#064e3b] bg-white font-black text-[10px] uppercase text-[#064e3b] shadow-[3px_3px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 hover:bg-[#10b981] hover:text-white transition-none">
                                    CSV
                                </Button>
                                <Button variant="outline" className="flex-1 rounded-none h-14 border-2 border-[#064e3b] bg-white font-black text-[10px] uppercase text-[#064e3b] shadow-[3px_3px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 hover:bg-[#10b981] hover:text-white transition-none">
                                    XLS
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Comparisons Chart Section */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden group">
                <CardContent className="p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b-4 border-[#064e3b]/10 pb-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#064e3b] border-2 border-[#10b981] rounded-none flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
                                    <ArrowLeftRight className="w-6 h-6 text-[#facc15]" />
                                </div>
                                <h2 className="text-3xl font-black text-[#064e3b] uppercase tracking-tighter italic leading-none">Yield <span className="text-[#10b981]">Variance</span></h2>
                            </div>
                            <p className="text-[10px] text-[#064e3b]/40 font-black uppercase tracking-[0.2em] mt-3 ml-1">Aggregated performance across selected registry nodes.</p>
                        </div>

                        {/* Comparison Pills */}
                        <div className="flex bg-neutral-50 border-4 border-[#064e3b] p-1.5 gap-1.5 shadow-inner">
                            {(['apt12', 'apt24', 'main'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedComparisonTab(tab)}
                                    className={cn(
                                        "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-none",
                                        selectedComparisonTab === tab
                                            ? "bg-[#064e3b] text-white shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
                                            : "text-[#064e3b]/40 hover:text-[#064e3b] hover:bg-white"
                                    )}
                                >
                                    {tab === 'apt12' ? 'APT_NODE_01' : tab === 'apt24' ? 'APT_NODE_02' : 'MAIN_REGISTRY'}
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
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                                <LineChart data={comparisonData}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#064e3b', fontWeight: 900 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#064e3b', fontWeight: 900 }}
                                        dx={-15}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '0px',
                                            border: '4px solid #064e3b',
                                            boxShadow: '8px 8px 0px 0px rgba(6,78,59,0.1)',
                                            padding: '12px',
                                            fontSize: '11px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        height={60}
                                        iconType="rect"
                                        formatter={(value) => <span className="text-[10px] font-black text-[#064e3b] ml-1 uppercase tracking-widest italic">{value}</span>}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="primary_value"
                                        name="PROTOCOL_ALPHA"
                                        stroke="#10b981"
                                        strokeWidth={6}
                                        dot={{ r: 0 }}
                                        activeDot={{ r: 8, fill: '#facc15', strokeWidth: 4, stroke: '#064e3b' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="secondary_value"
                                        name="PROTOCOL_BETA"
                                        stroke="#064e3b"
                                        strokeWidth={2}
                                        strokeDasharray="10 6"
                                        dot={{ r: 0 }}
                                        activeDot={{ r: 6, fill: '#fff', strokeWidth: 2, stroke: '#064e3b' }}
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
