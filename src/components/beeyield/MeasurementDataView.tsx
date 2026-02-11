import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Thermometer, Droplets, Weight, Download, Activity, FileText, Zap } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MeasurementDataViewProps {
    onTabChange: (tab: string) => void;
}

const MeasurementDataView: React.FC<MeasurementDataViewProps> = ({ onTabChange }) => {
    const [timeRange, setTimeRange] = useState('7d');

    const { data: metrics } = useQuery({
        queryKey: ['measurement_data', timeRange],
        queryFn: async () => {
            const { data: { user } } = await supabase!.auth.getUser();
            if (!user) return [];

            const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
            const startTime = new Date();
            startTime.setDate(startTime.getDate() - days);

            const { data, error } = await supabase!
                .from('sensor_readings')
                .select('*')
                .gte('recorded_at', startTime.toISOString())
                .order('recorded_at', { ascending: true });

            if (error) {
                console.error("Error fetching measurements:", error);
                return [];
            }

            return data.map(d => ({
                time: new Date(d.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                temp: d.temp_internal,
                hum: d.humidity_internal,
                acoustics: d.acoustic_freq,
                weight: d.weight_kg
            }));
        }
    });

    const displayData = metrics || [];
    const latest = displayData[displayData.length - 1] || { temp: 0, hum: 0, weight: 0, acoustics: 0 };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1B9157] dark:text-[#F4D03F]">Measurement Data</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Historical and real-time sensor analytics.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-200 hover:border-[#1B9157] gap-2 font-bold h-11 px-5 shadow-sm">
                        <FileText className="w-4 h-4 text-[#1B9157]" /> Export PDF
                    </Button>
                    <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-200 hover:border-[#F4D03F] gap-2 font-bold h-11 px-5 shadow-sm">
                        <Download className="w-4 h-4 text-[#F4D03F]" /> Export CSV
                    </Button>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px] h-11 rounded-xl">
                            <SelectValue placeholder="Time Range" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-50">
                            <SelectItem value="24h">Last 24 Hours</SelectItem>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Latest temperature', value: `${latest.temp}°C`, icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                    { label: 'Latest humidity', value: `${latest.hum}%`, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Current Weight', value: `${latest.weight}kg`, icon: Weight, color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/10 dark:bg-[#1B9157]/20' },
                    { label: 'Acoustic Signature', value: `${latest.acoustics}Hz`, icon: Zap, color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]/10 dark:bg-[#F4D03F]/20' },
                ].map((stat) => (
                    <Card key={stat.label} className="rounded-3xl border border-gray-100 dark:border-slate-200 bg-white dark:bg-slate-50 shadow-sm hover:border-[#F4D03F]/30 transition-colors">
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
            <Card className="rounded-[2.5rem] border border-gray-100 dark:border-slate-200 bg-white dark:bg-slate-50 shadow-sm overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-[#1B9157]">Thermal Stability Trend</h3>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4D03F]/10 border border-[#F4D03F]/30">
                                <div className="w-2 h-2 rounded-full bg-[#F4D03F]" />
                                <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F4D03F] uppercase tracking-tighter">Inner Brood</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayData}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F4D03F" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#F4D03F" stopOpacity={0} />
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
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="temp"
                                    stroke="#F4D03F"
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
                <Card className="rounded-[2.5rem] border border-gray-100 dark:border-slate-200 bg-white dark:bg-slate-50 shadow-sm p-8">
                    <h3 className="text-xl font-bold mb-6">Colony Weight (kg)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={displayData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Line type="monotone" dataKey="weight" stroke="#1B9157" strokeWidth={3} dot={{ r: 4, fill: '#1B9157', strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="rounded-[2.5rem] border border-gray-100 dark:border-slate-200 bg-white dark:bg-slate-50 shadow-sm p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">In-Hive Humidity (%)</h3>
                        <Badge className="bg-[#1B9157]/10 text-[#1B9157] border-none font-black text-[10px] uppercase">Stable</Badge>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayData}>
                                <defs>
                                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1B9157" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#1B9157" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Area type="monotone" dataKey="hum" stroke="#1B9157" strokeWidth={3} fill="url(#colorHum)" fillOpacity={1} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MeasurementDataView;
