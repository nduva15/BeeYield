import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileText, FileSpreadsheet, Search, Sun, Bell, Headset, Wifi, Settings, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const consumptionData = [
    { name: 'Water', value: 320, color: '#2563EB' },
    { name: 'Heat', value: 210, color: '#EA580C' },
    { name: 'Energy', value: 410, color: '#EAB308' },
    { name: 'Other', value: 100, color: '#64748B' },
];

const summaryItems = [
    { label: 'Water', value: '320 m3', subtext: 'last month' },
    { label: 'Heat', value: '210 GJ', subtext: 'last month' },
    { label: 'Energy', value: '410 kWh', subtext: 'last month' },
];

const ConsumptionView: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filters Section */}
            <Card className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                <CardContent className="p-6">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-medium">Building / apartment</label>
                            <Input
                                defaultValue="Kibwezi Main Area A"
                                className="rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] h-10 text-sm font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-medium">Medium</label>
                            <Select defaultValue="water">
                                <SelectTrigger className="rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] h-10 text-sm font-medium">
                                    <SelectValue placeholder="Select medium" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="water">Water</SelectItem>
                                    <SelectItem value="heat">Heat</SelectItem>
                                    <SelectItem value="energy">Energy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-medium">Date range</label>
                            <Select defaultValue="7days">
                                <SelectTrigger className="rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] h-10 text-sm font-medium">
                                    <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7days">Last 7 days</SelectItem>
                                    <SelectItem value="30days">Last 30 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-medium">Compare</label>
                            <Select defaultValue="main">
                                <SelectTrigger className="rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] h-10 text-sm font-medium">
                                    <SelectValue placeholder="Select comparison" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="main">Main meter</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-medium">Export</label>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 rounded-xl h-10 border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] gap-2 font-bold text-[10px] uppercase">
                                    <FileText className="w-3.5 h-3.5" /> CSV
                                </Button>
                                <Button variant="outline" className="flex-1 rounded-xl h-10 border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] gap-2 font-bold text-[10px] uppercase">
                                    <FileSpreadsheet className="w-3.5 h-3.5" /> XLS
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Chart Section */}
            <Card className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-6 border-b border-gray-50 dark:border-gray-900 flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-400">Usage by medium</p>
                </div>
                <CardContent className="p-8">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={consumptionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        fontSize: '12px',
                                        fontWeight: 600
                                    }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={180}>
                                    {consumptionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white px-2">Consumption summary</h3>
                <Card className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm divide-y divide-gray-50 dark:divide-gray-900">
                    {summaryItems.map((item, idx) => (
                        <div key={idx} className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{item.subtext}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                <p className="text-xs font-bold text-gray-900 dark:text-white">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </div>
    );
};

export default ConsumptionView;
