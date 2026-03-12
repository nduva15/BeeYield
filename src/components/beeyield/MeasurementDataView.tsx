import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Thermometer, Droplets, Weight, Download, Activity, FileText, Zap, ChevronDown, Calendar, Database } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';

interface MeasurementDataViewProps {
    onTabChange: (tab: string) => void;
}

const MeasurementDataView: React.FC<MeasurementDataViewProps> = ({ onTabChange }) => {
    const [timeRange, setTimeRange] = React.useState('7d');

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
        <div className="space-y-12 animate-in fade-in duration-500 pb-20 honeycomb-bg min-h-screen p-8 -m-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 pb-4">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-honey/10 text-honey rounded-full text-[10px] font-black uppercase tracking-widest border border-honey/20 backdrop-blur-sm">
                        <Database className="w-3.5 h-3.5" />
                        AI-Enhanced Telemetry
                    </div>
                    <h1 className="text-6xl font-serif font-black text-honey tracking-tight leading-none">Telemetry <span className="text-foreground">Analytics</span></h1>
                    <p className="text-sm font-medium text-muted-foreground max-w-lg leading-relaxed uppercase tracking-wider opacity-70">
                        Historical and real-time sensor analytics powered by BeeYield&apos;s Global Intelligence Framework.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button variant="ghost" className="h-14 px-8 rounded-2xl bg-white/50 backdrop-blur-md border border-border text-muted-foreground hover:text-honey font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-honey/50 transition-all">
                        <FileText className="w-4 h-4 mr-2" /> Export Audit
                    </Button>
                    <Button variant="ghost" className="h-14 px-8 rounded-2xl bg-white/50 backdrop-blur-md border border-border text-muted-foreground hover:text-honey font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-honey/50 transition-all">
                        <Download className="w-4 h-4 mr-2" /> Dataset
                    </Button>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[200px] h-14 rounded-2xl border-border bg-white/50 backdrop-blur-md font-black text-[10px] uppercase tracking-widest shadow-sm focus:ring-honey/20">
                            <Calendar className="w-4 h-4 mr-2 text-honey" />
                            <SelectValue placeholder="Time Range" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border shadow-2xl p-0 backdrop-blur-xl bg-white/90">
                            <SelectItem value="24h" className="p-4 font-black uppercase text-[10px] tracking-widest">Cycle: 24h</SelectItem>
                            <SelectItem value="7d" className="p-4 font-black uppercase text-[10px] tracking-widest">Cycle: 7d</SelectItem>
                            <SelectItem value="30d" className="p-4 font-black uppercase text-[10px] tracking-widest">Cycle: 30d</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Thermal Internal', value: `${latest.temp}°C`, icon: Thermometer, color: 'text-honey', bg: 'bg-honey/10' },
                    { label: 'Ambient Saturation', value: `${latest.hum}%`, icon: Droplets, color: 'text-honey', bg: 'bg-honey/10' },
                    { label: 'Colony Biomass', value: `${latest.weight}kg`, icon: Weight, color: 'text-honey', bg: 'bg-honey/10' },
                    { label: 'Acoustic Signature', value: `${latest.acoustics}Hz`, icon: Zap, color: 'text-honey', bg: 'bg-honey/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="rounded-[2.5rem] border border-border bg-white/80 backdrop-blur-md shadow-xl shadow-black/5 hover:border-honey/30 transition-all group overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                                        <stat.icon className={cn("w-7 h-7", stat.color)} />
                                    </div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-tight opacity-70">{stat.label}</p>
                                </div>
                                <p className="text-4xl font-serif font-black text-foreground tabular-nums tracking-tight">{stat.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Chart Area */}
            <Card className="rounded-[3rem] border border-slate-200/60 bg-white shadow-2xl shadow-black/5 overflow-hidden">
                <CardContent className="p-10">
                    <div className="flex justify-between items-center mb-12">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Thermal Stability Registry</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal environmental control audit</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-100">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Internal Node 01</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayData}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.1} />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                                    dx={-15}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '20px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                                    itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="temp"
                                    stroke="#f59e0b"
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
                <Card className="rounded-[3rem] border border-slate-200/60 bg-white shadow-2xl shadow-black/5 p-10">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Mass Variation (kg)</h3>
                        <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] uppercase tracking-widest">Active Scale</Badge>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={displayData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.1} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 15px 30px -5px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 6, fill: '#10b981', strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="rounded-[3rem] border border-slate-200/60 bg-white shadow-2xl shadow-black/5 p-10">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Saturation Profile (%)</h3>
                        <Badge className="bg-amber-50 text-amber-700 border-none font-black text-[10px] uppercase tracking-widest">Balanced</Badge>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayData}>
                                <defs>
                                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.1} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                                <Area type="monotone" dataKey="hum" stroke="#10b981" strokeWidth={4} fill="url(#colorHum)" fillOpacity={1} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MeasurementDataView;
