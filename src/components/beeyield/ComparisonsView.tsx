import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
    ArrowLeftRight, FileText, FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';

const comparisonData: any[] = [];

const ComparisonsView: React.FC = () => {
    const [selectedComparisonTab, setSelectedComparisonTab] = useState<'apt12' | 'apt24' | 'main'>('main');

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            <Card className="rounded-[1.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-[#09090b] dark:text-white mb-6">Filters</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Building / apartment */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-500 font-semibold">Building / apartment</label>
                            <Input
                                defaultValue="Kibwezi Main Area A"
                                className="rounded-xl border-gray-100 bg-white dark:bg-[#09090b] h-11 font-medium focus:border-[#F4D03F] focus:ring-0 shadow-none text-gray-700"
                            />
                        </div>

                        {/* Medium */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-500 font-semibold">Medium</label>
                            <Select defaultValue="water">
                                <SelectTrigger className="rounded-xl border-gray-100 bg-white dark:bg-[#09090b] h-11 font-medium focus:ring-0 shadow-none text-gray-700">
                                    <SelectValue placeholder="Select medium" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="water">Water</SelectItem>
                                    <SelectItem value="heat">Heat</SelectItem>
                                    <SelectItem value="electricity">Electricity</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date range */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-500 font-semibold">Date range</label>
                            <Select defaultValue="7days">
                                <SelectTrigger className="rounded-xl border-gray-100 bg-white dark:bg-[#09090b] h-11 font-medium focus:ring-0 shadow-none text-gray-700">
                                    <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7days">Last 7 days</SelectItem>
                                    <SelectItem value="30days">Last 30 days</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Compare */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-500 font-semibold">Compare</label>
                            <Select defaultValue="main">
                                <SelectTrigger className="rounded-xl border-gray-100 bg-white dark:bg-[#09090b] h-11 font-medium focus:ring-0 shadow-none text-gray-700">
                                    <SelectValue placeholder="Select comparison" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="main">Main meter</SelectItem>
                                    <SelectItem value="avg">Avg. Building</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Export */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-500 font-semibold">Export</label>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 rounded-xl h-11 border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 gap-2 font-bold text-xs shadow-none border-[#F1F5F9]">
                                    <FileText className="w-3.5 h-3.5" /> CSV
                                </Button>
                                <Button variant="outline" className="flex-1 rounded-xl h-11 border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 gap-2 font-bold text-xs shadow-none border-[#F1F5F9]">
                                    <FileSpreadsheet className="w-3.5 h-3.5" /> XLS
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Comparisons Chart Section */}
            <Card className="rounded-[1.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm min-h-[500px]">
                <CardContent className="p-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowLeftRight className="w-5 h-5 text-[#091E42] dark:text-white" />
                            <h2 className="text-lg font-bold text-[#091E42] dark:text-white">Comparisons</h2>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">Large buildings show aggregated data or selected meters.</p>

                        {/* Comparison Pills */}
                        <div className="flex gap-3 mt-6">
                            {(['apt12', 'apt24', 'main'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedComparisonTab(tab)}
                                    className={cn(
                                        "rounded-full h-9 px-5 text-[13px] font-bold transition-all border",
                                        selectedComparisonTab === tab
                                            ? "bg-white border-[#F4D03F] text-[#1A1A1A] shadow-sm"
                                            : "bg-white border-gray-100 text-slate-900 border-[#F1F5F9]"
                                    )}
                                >
                                    {tab === 'apt12' ? 'Hive Area 1' : tab === 'apt24' ? 'Hive Area 2' : 'Main Area'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="week"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#8C9BAB', fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#8C9BAB', fontWeight: 600 }}
                                    dx={-10}
                                    domain={[90, 170]}
                                    tickCount={9}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="rect"
                                    formatter={(value) => <span className="text-[13px] font-bold text-slate-500 ml-1 uppercase tracking-tighter">{value === 'mainMeter' ? 'Main Area' : 'Hive Area 1'}</span>}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="mainMeter"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 0, stroke: 'white' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="apartment12"
                                    stroke="#F97316"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#F97316', strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: '#F97316', strokeWidth: 0, stroke: 'white' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ComparisonsView;
