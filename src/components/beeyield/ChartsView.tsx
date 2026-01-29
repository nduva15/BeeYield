import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Search, Globe, Bell, Headphones, Wifi, Settings, LogOut,
    ChevronDown, AlertCircle, TrendingUp, TrendingDown, FileText, FileSpreadsheet,
    Sun, Moon
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

const ChartsView: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filters Section */}
            <Card className="rounded-[2.5rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                <CardContent className="p-8">
                    <h3 className="text-sm font-extrabold text-[#091E42] dark:text-white mb-6">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="space-y-3">
                            <label className="text-[13px] text-slate-400 font-bold">Building / apartment</label>
                            <Input
                                defaultValue="Lipowa 12 · Lodz"
                                className="rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] h-11 text-[13px] font-semibold text-slate-300"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[13px] text-slate-400 font-bold">Medium</label>
                            <Select defaultValue="water">
                                <SelectTrigger className="rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] h-11 text-[13px] font-semibold text-slate-300">
                                    <SelectValue placeholder="Select medium" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="water">Water</SelectItem>
                                    <SelectItem value="heat">Heat</SelectItem>
                                    <SelectItem value="electricity">Electricity</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[13px] text-slate-400 font-bold">Date range</label>
                            <Select defaultValue="7days">
                                <SelectTrigger className="rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] h-11 text-[13px] font-semibold text-slate-300">
                                    <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7days">Last 7 days</SelectItem>
                                    <SelectItem value="30days">Last 30 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[13px] text-slate-400 font-bold">Compare</label>
                            <Select defaultValue="main">
                                <SelectTrigger className="rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] h-11 text-[13px] font-semibold text-slate-300">
                                    <SelectValue placeholder="Select comparison" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="main">Main meter</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[13px] text-slate-400 font-bold">Export</label>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 rounded-xl h-11 border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] gap-2 font-bold text-[11px] text-slate-900 dark:text-white uppercase shadow-none hover:bg-slate-50 transition-colors">
                                    <FileText className="w-4 h-4" /> CSV
                                </Button>
                                <Button variant="outline" className="flex-1 rounded-xl h-11 border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] gap-2 font-bold text-[11px] text-slate-900 dark:text-white uppercase shadow-none hover:bg-slate-50 transition-colors">
                                    <FileSpreadsheet className="w-4 h-4" /> XLS
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>



            {/* Charts Section */}
            <Card className="rounded-[2.5rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden min-h-[500px]">
                <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-slate-900 dark:text-white" />
                    <h3 className="text-sm font-extrabold text-[#091E42] dark:text-white">Charts</h3>
                </div>
                <CardContent className="p-8">
                    <div className="mb-6">
                        <p className="text-[13px] font-medium text-slate-400">Usage trend with highlighted anomalies</p>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="0 0" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                                    domain={[0, 1.0]}
                                    ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                        fontWeight: 600
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#CBD5E1"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6, fill: '#FF9500', stroke: 'white' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Grid: Anomalies & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detected Anomalies */}
                <div className="space-y-4">
                    <h3 className="text-[15px] font-extrabold text-[#091E42] dark:text-white px-2">Detected anomalies</h3>
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-4 space-y-3">
                            {/* Spike Alert */}
                            <div className="p-5 rounded-3xl border border-gray-50 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-[15px] font-extrabold text-[#091E42]">Sudden use of spike</h4>
                                    <p className="text-[13px] text-slate-400 font-medium">Building C · 3 hours</p>
                                </div>
                                <div className="bg-[#FFF1F2] dark:bg-[#FFF1F210] px-3.5 py-1 rounded-full flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
                                    <span className="text-[10px] font-extrabold text-[#E11D48] tracking-widest uppercase">Alert</span>
                                </div>
                            </div>
                            {/* Drop Warning */}
                            <div className="p-5 rounded-3xl border border-gray-50 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-[15px] font-extrabold text-[#091E42]">Unnatural drop</h4>
                                    <p className="text-[13px] text-slate-400 font-medium">Building B · 12 hours</p>
                                </div>
                                <div className="bg-[#FFFBEB] dark:bg-[#FFFBEB10] px-3.5 py-1 rounded-full flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                                    <span className="text-[10px] font-extrabold text-[#D97706] tracking-widest uppercase">Warning</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Insights */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <TrendingUp className="w-5 h-5 text-slate-900" />
                        <h3 className="text-[15px] font-extrabold text-[#091E42] dark:text-white">Insights</h3>
                    </div>
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-4 space-y-3">
                            {/* Usage Peak */}
                            <div className="p-5 rounded-3xl border border-gray-50 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-[15px] font-extrabold text-[#091E42]">Usage peak</h4>
                                    <p className="text-[13px] text-slate-400 font-medium">Highest hour</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-gray-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-gray-800">
                                    <span className="text-[13px] font-extrabold text-[#091E42]">+18%</span>
                                </div>
                            </div>
                            {/* Usage Dip */}
                            <div className="p-5 rounded-3xl border border-gray-50 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-[15px] font-extrabold text-[#091E42]">Usage dip</h4>
                                    <p className="text-[13px] text-slate-400 font-medium">Lowest day of week</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-gray-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-gray-800">
                                    <span className="text-[13px] font-extrabold text-[#091E42]">-9%</span>
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
