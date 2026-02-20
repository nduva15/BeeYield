import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import {
    TrendingUp, TrendingDown, FileText, FileSpreadsheet,
    AlertCircle, BarChart3, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

const chartData = [
    { name: '0.1', value: 0.15 },
    { name: '0.2', value: 0.25 },
    { name: '0.3', value: 0.2 },
    { name: '0.4', value: 0.4 },
    { name: '0.5', value: 0.35 },
    { name: '0.6', value: 0.5 },
    { name: '0.7', value: 0.45 },
    { name: '0.8', value: 0.6 },
    { name: '0.9', value: 0.55 },
    { name: '1.0', value: 0.7 },
];

const CustomDot = (props: any) => {
    const { cx, cy, value } = props;
    if (value > 0.55) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#064e3b" strokeWidth={3} />
            </g>
        );
    }
    return null;
};

const ChartsView: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-4">
                        <BarChart3 className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Telemetry Diagnostics</span>
                    </div>
                    <h1 className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">Usage <span className="text-[#10b981]">Archive</span></h1>
                    <p className="text-[#064e3b]/40 font-black mt-3 text-xl uppercase tracking-tight">
                        Granular consumption analysis and anomaly markers.
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                <CardContent className="p-8">
                    <h3 className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] mb-6">Filtering Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Area</label>
                            <Input
                                defaultValue="Kibwezi Main Area A"
                                className="rounded-none border-4 border-[#064e3b] bg-white h-12 text-xs font-black uppercase focus-visible:ring-0 focus-visible:bg-[#facc15]/5 transition-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Tele-Type</label>
                            <Select defaultValue="water">
                                <SelectTrigger className="rounded-none border-4 border-[#064e3b] bg-white h-12 text-xs font-black uppercase focus:ring-0 transition-none">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                    <SelectItem value="water" className="uppercase font-black text-[10px]">Water</SelectItem>
                                    <SelectItem value="heat" className="uppercase font-black text-[10px]">Heat</SelectItem>
                                    <SelectItem value="electricity" className="uppercase font-black text-[10px]">Electricity</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Temporal Scope</label>
                            <Select defaultValue="7days">
                                <SelectTrigger className="rounded-none border-4 border-[#064e3b] bg-white h-12 text-xs font-black uppercase focus:ring-0 transition-none">
                                    <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                    <SelectItem value="7days" className="uppercase font-black text-[10px]">Last 7 days</SelectItem>
                                    <SelectItem value="30days" className="uppercase font-black text-[10px]">Last 30 days</SelectItem>
                                    <SelectItem value="90days" className="uppercase font-black text-[10px]">Last 90 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Comparison</label>
                            <Select defaultValue="main">
                                <SelectTrigger className="rounded-none border-4 border-[#064e3b] bg-white h-12 text-xs font-black uppercase focus:ring-0 transition-none">
                                    <SelectValue placeholder="Select comparison" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                    <SelectItem value="main" className="uppercase font-black text-[10px]">Main Area</SelectItem>
                                    <SelectItem value="prev" className="uppercase font-black text-[10px]">Previous Period</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Archival Export</label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-none border-2 border-[#064e3b] bg-white font-black text-[10px] text-[#064e3b] uppercase tracking-widest hover:bg-[#10b981] hover:text-white transition-none shadow-[3px_3px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                >
                                    CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-none border-2 border-[#064e3b] bg-white font-black text-[10px] text-[#064e3b] uppercase tracking-widest hover:bg-[#10b981] hover:text-white transition-none shadow-[3px_3px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                >
                                    XLS
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts Section */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                <div className="p-10 pb-4 border-b-4 border-[#064e3b]/10 bg-neutral-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter">Usage Trend Analysis</h3>
                            <p className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] mt-1">Telemetry patterns with recursive anomaly detection</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-none border-2 border-[#064e3b] bg-[#10b981]" />
                                <span className="text-[9px] font-black text-[#064e3b]/40 uppercase tracking-widest">Baseline_Sig</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-none border-2 border-[#064e3b] bg-red-500 animate-pulse" />
                                <span className="text-[9px] font-black text-[#064e3b]/40 uppercase tracking-widest">Anomaly_Sig</span>
                            </div>
                        </div>
                    </div>
                </div>
                <CardContent className="p-10">
                    <div className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#064e3b" />
                                        <stop offset="100%" stopColor="#10b981" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#064e3b', fontSize: 10, fontWeight: 900 }}
                                    dy={12}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#064e3b', fontSize: 10, fontWeight: 900 }}
                                    domain={[0, 1.0]}
                                    ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
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
                                <ReferenceLine y={0.55} stroke="#064e3b" strokeDasharray="8 8" label={{ value: 'PROTOCOL_CAP', fill: '#064e3b', fontSize: 9, fontWeight: 900, position: 'insideTopRight' }} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="url(#lineGrad)"
                                    strokeWidth={6}
                                    dot={<CustomDot />}
                                    activeDot={{ r: 10, fill: '#facc15', stroke: '#064e3b', strokeWidth: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Grid: Issues & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* System Issues */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-none bg-red-500 border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                            <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter italic">Anomaly Queue</h3>
                    </div>
                    <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            <div className="p-6 rounded-none bg-red-50 border-2 border-[#064e3b] flex items-center justify-between group hover:bg-[#facc15]/10 transition-none cursor-pointer shadow-[4px_4px_0px_0px_rgba(239,68,68,0.2)]">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-[#064e3b] uppercase tracking-tight">Recursive Usage Spike</h4>
                                    <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest">KIB_MAIN_C · T+03:00</p>
                                </div>
                                <div className="bg-red-500 border-2 border-[#064e3b] px-4 py-1 rounded-none flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-none bg-white animate-pulse" />
                                    <span className="text-[9px] font-black text-white tracking-[0.2em] uppercase">High_Sev</span>
                                </div>
                            </div>
                            <div className="p-6 rounded-none bg-white border-2 border-[#064e3b]/10 flex items-center justify-between group hover:bg-[#facc15]/10 transition-none cursor-pointer">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-[#064e3b] uppercase tracking-tight">Signal Drop Isolation</h4>
                                    <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest">KIB_MAIN_B · T+12:00</p>
                                </div>
                                <div className="bg-[#facc15] border-2 border-[#064e3b] px-4 py-1 rounded-none flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-none bg-[#064e3b]" />
                                    <span className="text-[9px] font-black text-[#064e3b] tracking-[0.2em] uppercase">Med_Sev</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Insights */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-none bg-[#10b981] border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                            <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter italic">Optimization Hub</h3>
                    </div>
                    <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            <div className="p-6 rounded-none border-2 border-[#064e3b]/10 bg-neutral-50/50 flex items-center justify-between group hover:bg-[#facc15]/10 transition-none cursor-pointer">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-[#064e3b] uppercase tracking-tight">Efficiency Peak Phase</h4>
                                    <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest">Optimized recursive window detected</p>
                                </div>
                                <div className="bg-[#10b981] border-2 border-[#064e3b] px-4 py-2 rounded-none flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                    <span className="text-[11px] font-black text-white">+18%_GAIN</span>
                                </div>
                            </div>
                            <div className="p-6 rounded-none border-2 border-[#064e3b]/10 bg-neutral-50/50 flex items-center justify-between group hover:bg-[#facc15]/10 transition-none cursor-pointer">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-[#064e3b] uppercase tracking-tight">Load Compression Baseline</h4>
                                    <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest">Minimum signal overhead window</p>
                                </div>
                                <div className="bg-red-500 border-2 border-[#064e3b] px-4 py-2 rounded-none flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4 text-white" />
                                    <span className="text-[11px] font-black text-white">-9%_LOSS</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ChartsView;
