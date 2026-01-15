import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Thermometer, Droplets, Weight, CloudRain, Filter, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FirstStepsBanner from './FirstStepsBanner';

interface MeasurementDataViewProps {
    onTabChange: (tab: string) => void;
}

const MeasurementDataView: React.FC<MeasurementDataViewProps> = ({ onTabChange }) => {
    // Mock chart data
    const data = [
        { time: '00:00', temp: 32, hum: 45, weight: 40 },
        { time: '04:00', temp: 31, hum: 48, weight: 40.1 },
        { time: '08:00', temp: 33, hum: 42, weight: 40.5 },
        { time: '12:00', temp: 35, hum: 38, weight: 41.2 },
        { time: '16:00', temp: 34, hum: 40, weight: 41.8 },
        { time: '20:00', temp: 32, hum: 44, weight: 42.1 },
        { time: '23:59', temp: 31, hum: 46, weight: 42.3 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <FirstStepsBanner onTabChange={onTabChange} />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Measurement Data</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Historical and real-time sensor analytics.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-gray-100 dark:border-gray-800 gap-2 font-bold h-11 px-5 shadow-sm">
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                    <Button className="bg-[#B48428] hover:bg-[#966b1d] text-white rounded-xl gap-2 font-bold h-11 px-6 shadow-lg shadow-amber-500/20 border-none">
                        <Calendar className="w-4 h-4" /> Last 7 Days
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Avg temperature', value: '33.2°C', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                    { label: 'Avg humidity', value: '43.5%', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Total weight gain', value: '+2.3kg', icon: Weight, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { label: 'Weather impact', value: 'Low', icon: CloudRain, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                ].map((stat) => (
                    <Card key={stat.label} className="rounded-3xl border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Chart Area */}
            <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold">In-hive Temperature Trend</h3>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30">
                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-tighter">Inner Cover</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800/50">
                                <div className="w-2 h-2 rounded-full bg-gray-400" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Ambient</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }}
                                    dx={-10}
                                    domain={['dataMin - 5', 'dataMax + 5']}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="temp"
                                    stroke="#f97316"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorTemp)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm p-8">
                    <h3 className="text-xl font-bold mb-6">Humidity Level (%)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Line type="monotone" dataKey="hum" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm p-8">
                    <h3 className="text-xl font-bold mb-6">Hive Weight (kg)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.05} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

import { cn } from '@/lib/utils';
export default MeasurementDataView;
