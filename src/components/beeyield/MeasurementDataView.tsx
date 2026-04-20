import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Thermometer, Droplets, Weight, Download, FileText, Zap, Calendar, Database } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { glass } from './GlassTheme';
import { beeyieldService, SensorReading } from '@/services/beeyieldService';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

interface MeasurementDataViewProps {
    onTabChange: (tab: string) => void;
}

const MeasurementDataView: React.FC<MeasurementDataViewProps> = ({ onTabChange }) => {
    const [timeRange, setTimeRange] = React.useState('7d');

    const { data: metrics } = useQuery({
        queryKey: ['measurement_data', timeRange],
        queryFn: async () => {
            const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 24 * 7 : 24 * 30;
            const rows: SensorReading[] = await beeyieldService.getSensorReadings(undefined, hours);
            const toNum = (v: any) => (typeof v === 'number' ? v : (v != null && !Number.isNaN(Number(v)) ? Number(v) : null));

            // Best-effort normalization (schema varies by device type).
            return (rows || [])
                .map((d: any) => {
                    const tsRaw = d?.recorded_at || d?.timestamp || d?.created_at;
                    const ts = tsRaw ? new Date(tsRaw) : null;
                    if (!ts || Number.isNaN(ts.getTime())) return null;

                    const readings = d?.readings || {};
                    const temp = toNum(d?.temp_internal ?? d?.temperature ?? readings?.temperature ?? readings?.internal_temp);
                    const hum = toNum(d?.humidity_internal ?? d?.humidity ?? readings?.humidity);
                    const weight = toNum(d?.weight_kg ?? d?.hive_weight ?? d?.hive_weight_kg ?? d?.weight ?? readings?.hive_weight);
                    const acoustics = toNum(d?.acoustic_freq ?? readings?.acoustic_freq ?? d?.signal_strength);

                    return {
                        time: ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        temp: temp ?? 0,
                        hum: hum ?? 0,
                        acoustics: acoustics ?? 0,
                        weight: weight ?? 0,
                    };
                })
                .filter(Boolean) as any[];
        }
    });

    const displayData = metrics || [];
    const latest = displayData[displayData.length - 1] || { temp: 0, hum: 0, weight: 0, acoustics: 0 };

    return (
        <BeeYieldPageShell className="space-y-8 animate-in fade-in duration-500 pb-20">
            <BeeYieldPageHeader
                icon={Database}
                label="Sensor Dashboard"
                title="Telemetry Analytics"
                subtitle="High-fidelity sensor telemetry and environmental monitoring."
                actions={
                    <div className="flex flex-wrap gap-3">
                        <button className={cn(glass.btnSecondary, "h-9 px-6 rounded-xl flex items-center gap-2")}>
                            <FileText className="w-3.5 h-3.5 text-[#F4D03F]" />
                            <span>Export Report</span>
                        </button>
                        <button className={cn(glass.btnSecondary, "h-9 px-6 rounded-xl flex items-center gap-2")}>
                            <Download className="w-3.5 h-3.5 text-[#F4D03F]" />
                            <span>Raw Dataset</span>
                        </button>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className={cn(glass.select, "w-[160px] h-9 rounded-xl")}>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-[#F4D03F]" />
                                    <SelectValue placeholder="Range" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className={cn(glass.selectContent, "rounded-xl")}>
                                <SelectItem value="24h" className="font-black text-[9px]">24h Cycle</SelectItem>
                                <SelectItem value="7d" className="font-black text-[9px]">7d Cycle</SelectItem>
                                <SelectItem value="30d" className="font-black text-[9px]">30d Cycle</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                }
            />

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Internal Temperature', value: `${latest.temp}°C`, icon: Thermometer, color: 'text-amber-500' },
                    { label: 'Relative Humidity', value: `${latest.hum}%`, icon: Droplets, color: 'text-blue-500' },
                    { label: 'Hive Weight', value: `${latest.weight}kg`, icon: Weight, color: 'text-[#1B9157]' },
                    { label: 'Frequency Pattern', value: `${latest.acoustics}Hz`, icon: Zap, color: 'text-[#F4D03F]' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(glass.card, "p-4 flex flex-col gap-1.5 border-border/ shadow-sm group hover:border-border/ transition-all")}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <span className={glass.microLabel}>{stat.label}</span>
                            <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                        </div>
                        <span className={cn("text-xl font-black tracking-tighter tabular-nums relative z-10", stat.color)}>{stat.value}</span>
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#F4D03F]/10 group-hover:bg-[#F4D03F]/30 transition-all" />
                    </motion.div>
                ))}
            </div>

            {/* Main Chart Area */}
            <div className={cn(glass.card, "p-6 bg-muted/ border-border/ shadow-xl relative overflow-hidden mt-6")}>
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F4D03F 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div className="space-y-1">
                            <h3 className="text-[14px] font-black text-foreground italic">Temperature Stability</h3>
                            <p className="text-[9px] font-black text-muted-foreground/70">Environmental Monitoring</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-muted/ border border-border/ shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F] animate-pulse shadow-sm shadow-[#F4D03F]/50" />
                                <span className="text-[9px] font-black text-foreground">Active Sensor 01</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayData}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(244, 208, 63, 0.2)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '12px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)' }}
                                    itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '9px', color: '#F4D03F' }}
                                    labelStyle={{ fontWeight: 900, marginBottom: '4px', fontSize: '9px', color: '#1A1A1A' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="temp"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTemp)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className={cn(glass.card, "p-6 bg-muted/ border-border/ shadow-xl relative overflow-hidden")}>
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1B9157 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-[12px] font-black text-foreground italic">Weight Variance (kg)</h3>
                        <Badge className="bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20 font-black text-[9px] px-3 py-1 rounded-xl shadow-sm">Digital Scale</Badge>
                    </div>
                    <div className="h-[220px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={displayData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 900 }} dy={5} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 900 }} dx={-5} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(244, 208, 63, 0.1)' }} />
                                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={cn(glass.card, "p-6 bg-muted/ border-border/ shadow-xl relative overflow-hidden")}>
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1B9157 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-[12px] font-black text-foreground italic">Humidity Profile (%)</h3>
                        <Badge className="bg-[#F4D03F]/10 text-[#F4D03F] border-border/ font-black text-[9px] px-3 py-1 rounded-xl shadow-sm">Humidity Sensor</Badge>
                    </div>
                    <div className="h-[220px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayData}>
                                <defs>
                                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 900 }} dy={5} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 900 }} dx={-5} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(244, 208, 63, 0.1)' }} />
                                <Area type="monotone" dataKey="hum" stroke="#10b981" strokeWidth={3} fill="url(#colorHum)" fillOpacity={1} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </BeeYieldPageShell>
    );
};

export default MeasurementDataView;

