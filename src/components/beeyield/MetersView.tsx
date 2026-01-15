import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Gauge, Activity, Database, Plus, RefreshCw, Settings2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: '00:00', value: 400 },
    { name: '04:00', value: 300 },
    { name: '08:00', value: 200 },
    { name: '12:00', value: 578 },
    { name: '16:00', value: 189 },
    { name: '20:00', value: 239 },
    { name: '23:59', value: 349 },
];

const MetersView: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meters</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">High-precision digital meters and multi-sensor management.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl h-12 gap-2 border-gray-100 dark:border-gray-800 font-bold">
                        <RefreshCw className="w-5 h-5 text-gray-400" />
                        Sync All
                    </Button>
                    <Button className="bg-[#B48428] hover:bg-[#966b1d] text-white rounded-xl px-6 h-12 gap-2 border-none shadow-lg shadow-amber-500/20">
                        <Plus className="w-5 h-5" />
                        Connect Meter
                    </Button>
                </div>
            </div>

            {/* Meter Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Meter Card */}
                <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm overflow-hidden lg:col-span-2">
                    <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <Badge className="bg-green-500 rounded-md">LIVE</Badge>
                                <CardTitle className="text-xl font-black">Digital Flow Meter V2</CardTitle>
                            </div>
                            <p className="text-sm text-gray-400 font-medium">Device ID: MTR-9902-X</p>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#B48428" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#B48428" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#B48428"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            <div className="p-4 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Flow</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">12.5 L/min</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Yield</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">142.8 L</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Accuracy</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">99.92%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Meter List & Settings */}
                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm p-8">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Database className="w-5 h-5 text-amber-500" />
                            Connected Devices
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Flow Meter V2', status: 'Online', val: 'Active' },
                                { name: 'Precision Scale X1', status: 'Standby', val: 'Low Battery' },
                                { name: 'Temp Probe MK3', status: 'Error', val: 'Offline' },
                            ].map((d, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full", d.status === 'Online' ? "bg-green-500" : d.status === 'Standby' ? "bg-amber-500" : "bg-red-500")} />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{d.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{d.val}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                                        <Settings2 className="w-4 h-4 text-gray-400" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-6 rounded-xl border-gray-100 dark:border-gray-800 font-bold h-10">Manage All Devices</Button>
                    </Card>

                    <Card className="rounded-[2.5rem] border border-[#FFE5B4] bg-[#FFF8F0] dark:bg-amber-950/10 p-8">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <Gauge className="w-5 h-5 text-amber-600" />
                            Calibration Notice
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-amber-200 opacity-80 font-medium italic">
                            Your Flow Meter V2 is due for calibration in 14 days to maintain precision standards.
                        </p>
                        <Button className="w-full mt-6 bg-[#B48428] rounded-xl font-bold h-10 border-none">Schedule Now</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MetersView;
