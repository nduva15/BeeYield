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
                <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="white" strokeWidth={2} />
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
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-6">
                    <BarChart3 className="w-3.5 h-3.5 text-beeyield-forest" />
                    <span className="text-[10px] font-bold text-beeyield-forest uppercase tracking-[0.15em]">Analytics Suite</span>
                </div>
                <h1 className="text-5xl font-bold text-beeyield-charcoal tracking-tight">Usage Telemetry</h1>
                <p className="text-gray-500 font-medium mt-3 text-lg">
                    Granular consumption analysis and anomaly detection across all monitored sectors.
                </p>
            </div>

            {/* Filters Section */}
            <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm">
                <CardContent className="p-10">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Filter Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="space-y-3">
                            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em]">Area</label>
                            <Input
                                defaultValue="Kibwezi Main Area A"
                                className="rounded-xl border-[#E0E0E0] bg-white h-12 text-[13px] font-bold text-beeyield-charcoal focus:ring-beeyield-forest/20 focus:border-beeyield-forest/30"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em]">Type</label>
                            <Select defaultValue="water">
                                <SelectTrigger className="rounded-xl border-[#E0E0E0] bg-white h-12 text-[13px] font-bold text-beeyield-charcoal">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-[#E0E0E0] shadow-xl">
                                    <SelectItem value="water">Water</SelectItem>
                                    <SelectItem value="heat">Heat</SelectItem>
                                    <SelectItem value="electricity">Electricity</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em]">Time Period</label>
                            <Select defaultValue="7days">
                                <SelectTrigger className="rounded-xl border-[#E0E0E0] bg-white h-12 text-[13px] font-bold text-beeyield-charcoal">
                                    <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-[#E0E0E0] shadow-xl">
                                    <SelectItem value="7days">Last 7 days</SelectItem>
                                    <SelectItem value="30days">Last 30 days</SelectItem>
                                    <SelectItem value="90days">Last 90 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em]">Compare With</label>
                            <Select defaultValue="main">
                                <SelectTrigger className="rounded-xl border-[#E0E0E0] bg-white h-12 text-[13px] font-bold text-beeyield-charcoal">
                                    <SelectValue placeholder="Select comparison" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-[#E0E0E0] shadow-xl">
                                    <SelectItem value="main">Main area</SelectItem>
                                    <SelectItem value="prev">Previous period</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em]">Export</label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl border-[#E0E0E0] bg-white gap-2 font-bold text-[11px] text-beeyield-charcoal uppercase tracking-wider hover:bg-beeyield-forest/5 hover:border-beeyield-forest/20 hover:text-beeyield-forest transition-all"
                                >
                                    <FileText className="w-4 h-4" /> CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl border-[#E0E0E0] bg-white gap-2 font-bold text-[11px] text-beeyield-charcoal uppercase tracking-wider hover:bg-beeyield-forest/5 hover:border-beeyield-forest/20 hover:text-beeyield-forest transition-all"
                                >
                                    <FileSpreadsheet className="w-4 h-4" /> XLS
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts Section */}
            <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
                <div className="p-10 pb-0 border-b border-[#F5F5F5]">
                    <div className="flex items-center justify-between pb-8">
                        <div>
                            <h3 className="text-xl font-bold text-beeyield-charcoal">Usage Trend Analysis</h3>
                            <p className="text-sm text-gray-400 font-medium mt-1">Consumption patterns with flagged anomaly markers</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-beeyield-forest" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Baseline</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Anomaly</span>
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
                                        <stop offset="0%" stopColor="#1B4332" />
                                        <stop offset="100%" stopColor="#52B788" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F5F5F5" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }}
                                    dy={12}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }}
                                    domain={[0, 1.0]}
                                    ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: '1px solid #E0E0E0',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.08)',
                                        padding: '16px 20px',
                                        fontSize: '13px',
                                        fontWeight: 700
                                    }}
                                />
                                <ReferenceLine y={0.55} stroke="#E0E0E0" strokeDasharray="6 4" label={{ value: 'Threshold', fill: '#9CA3AF', fontSize: 11, fontWeight: 700 }} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="url(#lineGrad)"
                                    strokeWidth={4}
                                    dot={<CustomDot />}
                                    activeDot={{ r: 8, fill: '#1B4332', stroke: 'white', strokeWidth: 3 }}
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
                        <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-beeyield-charcoal">System Anomalies</h3>
                    </div>
                    <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
                        <CardContent className="p-6 space-y-3">
                            <div className="p-6 rounded-2xl bg-red-50/30 border border-red-100 flex items-center justify-between group hover:bg-red-50 transition-colors cursor-pointer">
                                <div className="space-y-1">
                                    <h4 className="text-base font-bold text-beeyield-charcoal">Sudden usage jump</h4>
                                    <p className="text-sm text-gray-400 font-medium">Kibwezi Main Area C · 3 hours ago</p>
                                </div>
                                <div className="bg-red-50 border border-red-100 px-4 py-1.5 rounded-full flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase">Alert</span>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-amber-50/30 border border-amber-100 flex items-center justify-between group hover:bg-amber-50 transition-colors cursor-pointer">
                                <div className="space-y-1">
                                    <h4 className="text-base font-bold text-beeyield-charcoal">Unexpected drop</h4>
                                    <p className="text-sm text-gray-400 font-medium">Kibwezi Main Area B · 12 hours ago</p>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 px-4 py-1.5 rounded-full flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-[10px] font-bold text-amber-600 tracking-widest uppercase">Warning</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Insights */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-beeyield-forest/5 border border-beeyield-forest/10 flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-beeyield-forest" />
                        </div>
                        <h3 className="text-xl font-bold text-beeyield-charcoal">Analytical Insights</h3>
                    </div>
                    <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
                        <CardContent className="p-6 space-y-3">
                            <div className="p-6 rounded-2xl border border-[#F0F0F0] bg-beeyield-sand/20 flex items-center justify-between group hover:bg-beeyield-sand/40 transition-colors cursor-pointer">
                                <div className="space-y-1">
                                    <h4 className="text-base font-bold text-beeyield-charcoal">Peak consumption window</h4>
                                    <p className="text-sm text-gray-400 font-medium">Highest usage hour of the day</p>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    <span className="text-[13px] font-bold text-emerald-600">+18%</span>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl border border-[#F0F0F0] bg-beeyield-sand/20 flex items-center justify-between group hover:bg-beeyield-sand/40 transition-colors cursor-pointer">
                                <div className="space-y-1">
                                    <h4 className="text-base font-bold text-beeyield-charcoal">Lowest activity signal</h4>
                                    <p className="text-sm text-gray-400 font-medium">Most efficient day of the week</p>
                                </div>
                                <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-xl flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                    <span className="text-[13px] font-bold text-red-500">-9%</span>
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
