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
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Filters Section */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                <CardContent className="p-8">
                    <h3 className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] mb-6">Aggregate Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Area_Zone</label>
                            <Input
                                defaultValue="Kibwezi Main Area A"
                                className="rounded-none border-4 border-[#064e3b] bg-white h-12 text-xs font-black uppercase focus-visible:ring-0 focus-visible:bg-[#facc15]/5 transition-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Logic_Type</label>
                            <Select defaultValue="water">
                                <SelectTrigger className="rounded-none border-4 border-[#064e3b] bg-white h-12 text-xs font-black uppercase focus:ring-0 transition-none">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                    <SelectItem value="water" className="uppercase font-black text-[10px]">Water</SelectItem>
                                    <SelectItem value="heat" className="uppercase font-black text-[10px]">Heat</SelectItem>
                                    <SelectItem value="energy" className="uppercase font-black text-[10px]">Energy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Temporal_Bin</label>
                            <Select defaultValue="7days">
                                <SelectTrigger className="rounded-none border-4 border-[#064e3b] bg-white h-12 text-xs font-black uppercase focus:ring-0 transition-none">
                                    <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                    <SelectItem value="7days" className="uppercase font-black text-[10px]">Last 7 days</SelectItem>
                                    <SelectItem value="30days" className="uppercase font-black text-[10px]">Last 30 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Recursive_Comp</label>
                            <Select defaultValue="main">
                                <SelectTrigger className="rounded-none border-4 border-[#064e3b] bg-white h-12 text-xs font-black uppercase focus:ring-0 transition-none">
                                    <SelectValue placeholder="Select comparison" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                    <SelectItem value="main" className="uppercase font-black text-[10px]">Main Area</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Archive_Desk</label>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 rounded-none h-12 border-2 border-[#064e3b] bg-white font-black text-[10px] uppercase text-[#064e3b] tracking-widest hover:bg-[#10b981] hover:text-white transition-none shadow-[3px_3px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                                    CSV
                                </Button>
                                <Button variant="outline" className="flex-1 rounded-none h-12 border-2 border-[#064e3b] bg-white font-black text-[10px] uppercase text-[#064e3b] tracking-widest hover:bg-[#10b981] hover:text-white transition-none shadow-[3px_3px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                                    XLS
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Chart Section */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden min-h-[500px]">
                <div className="p-8 border-b-4 border-[#064e3b]/10 bg-neutral-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-[#10b981]" />
                        <p className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter">Usage Volumetric Density</p>
                    </div>
                    <div className="px-3 py-1 border-2 border-[#064e3b] bg-[#facc15] text-[10px] font-black uppercase tracking-widest">
                        LIVE_SIGNAL_ARRAY
                    </div>
                </div>
                <CardContent className="p-10">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <BarChart data={consumptionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#064e3b', fontSize: 11, fontWeight: 900 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#064e3b', fontSize: 11, fontWeight: 900 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ fill: '#facc15', fillOpacity: 0.1 }}
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
                                <Bar dataKey="value" radius={0} barSize={140} stroke="#064e3b" strokeWidth={4}>
                                    {consumptionData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.name === 'Energy' ? '#facc15' : entry.name === 'Water' ? '#10b981' : '#064e3b'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <h3 className="text-xl font-black text-[#064e3b] uppercase tracking-tighter px-2">Recursive Summary <span className="text-[#10b981]">Log</span></h3>
                <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] divide-y-4 divide-neutral-50 overflow-hidden">
                    {summaryItems.map((item, idx) => (
                        <div key={idx} className="p-6 flex items-center justify-between hover:bg-[#facc15]/5 transition-none group">
                            <div>
                                <p className="text-lg font-black text-[#064e3b] uppercase tracking-tighter italic">{item.label}</p>
                                <p className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] mt-0.5">{item.subtext}_BIN</p>
                            </div>
                            <div className="bg-[#064e3b] px-6 py-2 rounded-none border-2 border-[#10b981] shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
                                <p className="text-sm font-black text-white uppercase tracking-widest">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </div>
    );
};

export default ConsumptionView;
