import React from 'react';
import {
    Thermometer, Droplets, Activity, AlertTriangle, CheckCircle2, Volume2, Cpu, ChevronLeft, ChevronRight, Clock, Zap, Shield, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Bar
} from 'recharts';
import { cn } from '@/lib/utils';
import beeyieldService, { ActivityLog, SensorAlert, Hive } from '@/services/beeyieldService';
import { formatDistanceToNow } from 'date-fns';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface SensorHealthViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

// --- Mock Data ---
const generateHistoryData = (months: number) => {
    const data: any[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const baseTemp = 34 + Math.sin(i * 0.8) * 3;
        const baseHumid = 55 + Math.cos(i * 0.5) * 10;
        data.push({
            month: d.toLocaleString('default', { month: 'short' }),
            temp: parseFloat((baseTemp + (Math.random() - 0.5) * 2).toFixed(1)),
            humidity: parseFloat((baseHumid + (Math.random() - 0.5) * 5).toFixed(1)),
            activity: Math.floor(40 + Math.random() * 50),
        });
    }
    return data;
};

const acousticConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    'Healthy': { label: 'Normal Activity', color: 'text-emerald-500', bg: 'bg-emerald-500', icon: CheckCircle2 },
    'Queenless': { label: 'Queen Issues', color: 'text-destructive', bg: 'bg-destructive', icon: AlertTriangle },
    'Swarm Risk': { label: 'Swarm Risk', color: 'text-amber-500', bg: 'bg-amber-500', icon: Zap },
};

// --- Sub-components ---

const VitalsCard: React.FC<{
    label: string;
    value: string | number;
    unit: string;
    target: string;
    icon: React.ElementType;
    status: 'ok' | 'warn' | 'critical';
    trend: 'up' | 'down' | 'stable';
}> = ({ label, value, unit, target, icon: Icon, status, trend }) => {
    const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
    const trendColor = status === 'ok'
        ? 'text-emerald-500 bg-emerald-500/10'
        : status === 'warn' ? 'text-amber-500 bg-amber-500/10' : 'text-red-500 bg-red-500/10';

    return (
        <div className={cn(glass.card, "p-10 flex flex-col justify-between group transition-all h-full")}>
            <div className="flex items-start justify-between mb-8">
                <div className="space-y-4">
                    <p className={cn(glass.microLabel, "opacity-60 uppercase italic")}>{label}</p>
                    <div className="flex items-end gap-3">
                        <span className={cn("text-7xl font-black italic tracking-tighter leading-none", status === 'ok' ? 'text-foreground' : status === 'warn' ? 'text-amber-500' : 'text-red-500')}>{value}</span>
                        <span className="text-2xl font-black italic opacity-30 mb-2">{unit}</span>
                    </div>
                </div>
                <div className={cn(
                    "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-4xl group-hover:scale-110 group-hover:rotate-6 transition-all",
                    status === 'ok' ? "bg-emerald-500/10 text-emerald-500" :
                        status === 'warn' ? "bg-amber-500/10 text-amber-500" :
                            "bg-red-500/10 text-red-500"
                )}>
                    <Icon className="w-10 h-10" />
                </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-auto">
                <div className="flex items-center gap-4">
                    <span className={cn(glass.microLabel, "opacity-40 italic")}>Target</span>
                    <span className="text-lg font-black italic text-foreground/60">{target}</span>
                </div>
                <div className={cn("px-4 py-1.5 rounded-full flex items-center gap-2", trendColor)}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-[12px] font-black uppercase italic tracking-widest">{trend}</span>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const SensorHealthView: React.FC<SensorHealthViewProps> = ({ onTabChange }) => {
    const [realHives, setRealHives] = React.useState<any[]>([]);
    const [selectedHive, setSelectedHive] = React.useState<any>(null);
    const [historyRange, setHistoryRange] = React.useState(6);
    const [historyData, setHistoryData] = React.useState(() => generateHistoryData(12));
    const [liveTime, setLiveTime] = React.useState(new Date());
    const [realAlerts, setRealAlerts] = React.useState<SensorAlert[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [hives, alerts] = await Promise.all([
                    beeyieldService.getHives(),
                    beeyieldService.getSensorAlerts(false, 10)
                ]);

                const readings = await beeyieldService.getSensorReadings(undefined, 100);

                const mappedHives = hives.map(h => {
                    const latest = readings.find(r => r.hive_id === h.id);
                    const hasAlert = alerts.some(a => a.hive_id === h.id && !a.resolved);

                    return {
                        id: h.id,
                        name: h.name,
                        code: h.hive_code || h.id.slice(0, 8),
                        temp: latest?.temperature || 35.0,
                        humidity: latest?.humidity || 60,
                        acoustic: h.health_status || 'Healthy',
                        alert: hasAlert,
                        lastSeen: latest ? formatDistanceToNow(new Date(latest.created_at), { addSuffix: true }) : 'No signal'
                    };
                });

                setRealHives(mappedHives);
                setRealAlerts(alerts);
                if (mappedHives.length > 0) {
                    setSelectedHive(mappedHives[0]);
                }
            } catch (err) {
                console.error("Health view load error", err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
        const timer = setInterval(() => setLiveTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (loading || !selectedHive) {
        return (
            <div className={cn(glass.page, "flex items-center justify-center min-h-[60vh]")}>
                <div className="text-center space-y-10">
                    <div className="w-32 h-32 rounded-[4rem] bg-honey/10 mx-auto flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-[4rem] border-2 border-honey/30 animate-ping" />
                        <Zap className="w-16 h-16 text-honey animate-pulse" />
                    </div>
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase animate-pulse">Loading Sensor Data...</h3>
                </div>
            </div>
        );
    }

    const visibleData = historyData.slice(12 - historyRange);
    const tempStatus = selectedHive.temp < 32 ? 'critical' : selectedHive.temp > 36.5 ? 'warn' : 'ok';
    const humidStatus = selectedHive.humidity < 50 ? 'warn' : selectedHive.humidity > 70 ? 'warn' : 'ok';
    const acoustic = acousticConfig[selectedHive.acoustic] ?? acousticConfig['Healthy'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-8 -m-8 pb-24 space-y-16")}
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 pb-12 border-b border-white/5">
                <div className="space-y-6">
                    <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20 px-8 py-2.5 shadow-3xl skew-x-[-12deg]')}>
                        <div className="flex items-center gap-4 skew-x-[12deg]">
                            <Activity className="w-5 h-5" />
                            <span className="uppercase tracking-[0.4em] font-black italic text-[12px]">Live Monitoring</span>
                        </div>
                    </div>
                    <h1 className="text-8xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Hive <span className="text-honey">Health</span>
                    </h1>
                    <p className={cn(glass.microLabel, 'opacity-40 italic font-black uppercase tracking-[0.4em] ml-2')}>Track hive conditions in real-time.</p>
                </div>
                <div className="flex items-center gap-6 bg-white/40 backdrop-blur-3xl px-8 py-4 rounded-full border border-gray-200 shadow-4xl">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                    <span className="text-xl font-black italic tabular-nums text-foreground/80 tracking-widest">{liveTime.toLocaleTimeString()} — LIVE</span>
                </div>
            </div>

            {/* Alerts */}
            {realAlerts.filter(a => !a.resolved).length > 0 && (
                <div className="space-y-6">
                    {realAlerts.filter(a => !a.resolved).map(alert => (
                        <motion.div
                            key={alert.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className={cn(
                                glass.card,
                                "p-8 border-l-[12px] flex items-center gap-10 bg-white/40",
                                alert.severity === 'critical' ? "border-red-500" : "border-amber-500"
                            )}
                        >
                            <div className={cn("w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-4xl", alert.severity === 'critical' ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500")}>
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <h4 className={cn("text-3xl font-black italic uppercase tracking-tighter", alert.severity === 'critical' ? "text-red-500" : "text-amber-500")}>
                                    Attention Needed: {alert.alert_type}
                                </h4>
                                <p className="text-xl font-black italic text-foreground/60">{alert.message}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black italic opacity-30 uppercase">{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Hive Selector */}
            <div className="space-y-8">
                <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-honey/10 flex items-center justify-center border border-honey/20">
                        <Layers className="w-6 h-6 text-honey" />
                    </div>
                    <h3 className={cn(glass.microLabel, "opacity-60 uppercase italic font-black tracking-[0.4em]")}>Select Hive</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-8">
                    {realHives.map(hive => {
                        const isSelected = hive.id === selectedHive.id;
                        return (
                            <button
                                key={hive.id}
                                onClick={() => setSelectedHive(hive)}
                                className={cn(
                                    glass.card,
                                    "p-8 text-left transition-all relative overflow-hidden group border-white/5",
                                    isSelected ? "bg-honey text-black border-honey shadow-4xl scale-110 z-10" : "hover:border-honey/40 hover:bg-honey/10"
                                )}
                            >
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center">
                                        <span className={cn("text-4xl font-black italic tracking-tighter uppercase", isSelected ? "text-black" : "text-foreground")}>{hive.code}</span>
                                        {hive.alert && <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-4xl" />}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={cn("text-lg font-black italic", isSelected ? "text-black/60" : "text-foreground/40")}>{hive.temp}°C</span>
                                        <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-gray-100" : "bg-white/10")} />
                                        <span className={cn("text-lg font-black italic", isSelected ? "text-black/60" : "text-foreground/40")}>{hive.humidity}%</span>
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <VitalsCard
                    label="Internal Temperature"
                    value={selectedHive.temp}
                    unit="°C"
                    target="34 – 36°C"
                    icon={Thermometer}
                    status={tempStatus}
                    trend={selectedHive.temp > 35.5 ? 'up' : selectedHive.temp < 34 ? 'down' : 'stable'}
                />
                <VitalsCard
                    label="Internal Humidity"
                    value={selectedHive.humidity}
                    unit="%"
                    target="55 – 65%"
                    icon={Droplets}
                    status={humidStatus}
                    trend="stable"
                />
                <div className={cn(glass.card, "p-10 flex flex-col justify-between group transition-all")}>
                    <div className="flex items-start justify-between mb-8">
                        <div className="space-y-4">
                            <p className={cn(glass.microLabel, "opacity-60 uppercase italic")}>Hive Sound</p>
                            <h3 className={cn("text-5xl font-black italic tracking-tighter uppercase", acoustic.color)}>
                                {selectedHive.acoustic}
                            </h3>
                            <p className="text-xl font-black italic opacity-40">{acoustic.label}</p>
                        </div>
                        <div className={cn(
                            "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-4xl group-hover:scale-110 group-hover:rotate-6 transition-all",
                            selectedHive.acoustic === 'Healthy' ? "bg-emerald-500/10 text-emerald-500" :
                                selectedHive.acoustic === 'Swarm Risk' ? "bg-amber-500/10 text-amber-500" :
                                    "bg-red-500/10 text-red-500"
                        )}>
                            <Volume2 className="w-10 h-10" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2 h-20 border-t border-white/5 pt-6 mt-auto">
                        {Array.from({ length: 32 }).map((_, i) => (
                            <div
                                key={i}
                                className={cn("flex-1 rounded-t-lg transition-all duration-300",
                                    selectedHive.acoustic === 'Healthy' ? "bg-emerald-500" :
                                        selectedHive.acoustic === 'Swarm Risk' ? "bg-amber-500" : "bg-red-500"
                                )}
                                style={{
                                    height: `${Math.random() * (selectedHive.acoustic === 'Healthy' ? 60 : selectedHive.acoustic === 'Swarm Risk' ? 100 : 30)}%`,
                                    opacity: 0.3 + (Math.random() * 0.7)
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Trends Section */}
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-10 gap-10">
                    <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[2rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-4xl">
                            <Activity className="w-10 h-10 text-honey" />
                        </div>
                        <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">History <span className="text-honey">Trends</span></h2>
                    </div>
                    <div className="flex items-center gap-8 bg-white/40 p-4 rounded-[3.5rem] border border-gray-200 shadow-4xl">
                        <span className={cn(glass.microLabel, "px-6 opacity-40 italic uppercase")}>Past {historyRange} months</span>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setHistoryRange(r => Math.max(1, r - 1))} className={cn(glass.btnSecondary, "h-14 w-14 rounded-2xl")}><ChevronLeft className="w-6 h-6" /></button>
                            <button onClick={() => setHistoryRange(r => Math.min(12, r + 1))} className={cn(glass.btnSecondary, "h-14 w-14 rounded-2xl")}><ChevronRight className="w-6 h-6" /></button>
                        </div>
                    </div>
                </div>

                <div className={cn(glass.card, "p-12 relative overflow-hidden")}>
                    <div className="h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={visibleData}>
                                <defs>
                                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FBBE24" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FBBE24" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 14, fontWeight: 'black', fontStyle: 'italic' }} dy={20} />
                                <YAxis yAxisId="temp" domain={[20, 40]} axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 14, fontWeight: 'black' }} dx={-20} />
                                <Tooltip
                                    cursor={{ stroke: '#FBBE24', strokeWidth: 2, strokeDasharray: '10 10' }}
                                    contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '2rem', padding: '20px', backdropFilter: 'blur(20px)', color: 'white' }}
                                    itemStyle={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                />
                                <Area yAxisId="temp" type="monotone" dataKey="temp" stroke="#FBBE24" strokeWidth={6} fill="url(#tempGradient)" />
                                <Bar yAxisId="temp" dataKey="humidity" fill="#10B981" fillOpacity={0.1} radius={[20, 20, 0, 0]} barSize={40} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="space-y-10">
                <div className="flex items-center gap-8 border-b border-white/5 pb-8">
                    <Shield className="w-10 h-10 text-emerald-500" />
                    <h3 className="text-5xl font-black italic tracking-tighter uppercase">Global Status</h3>
                </div>
                <div className={cn(glass.card, "p-0 overflow-hidden shadow-4xl")}>
                    <div className="overflow-x-auto thin-scrollbar">
                        <table className="w-full">
                            <thead className="bg-white/40">
                                <tr>
                                    {['Hive', 'Temp', 'Humidity', 'Sound', 'Signal', 'Status'].map(h => (
                                        <th key={h} className={cn(glass.microLabel, "px-10 py-10 opacity-40 uppercase italic text-left")}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {realHives.map(hive => (
                                    <tr key={hive.id} onClick={() => setSelectedHive(hive)} className={cn("hover:bg-honey/10 transition-colors cursor-pointer group", selectedHive.id === hive.id && "bg-honey/5")}>
                                        <td className="px-10 py-10">
                                            <div className="flex items-center gap-6">
                                                <div className={cn("w-3 h-3 rounded-full", acousticConfig[hive.acoustic]?.bg || "bg-emerald-500")} />
                                                <span className="text-3xl font-black italic tracking-tighter group-hover:text-honey">{hive.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10 text-2xl font-black italic opacity-60 tabular-nums">{hive.temp}°C</td>
                                        <td className="px-10 py-10 text-2xl font-black italic opacity-60 tabular-nums">{hive.humidity}%</td>
                                        <td className="px-10 py-10">
                                            <span className={cn(glass.badge, "border-transparent", acousticConfig[hive.acoustic]?.color, acousticConfig[hive.acoustic]?.bg + "/10")}>{hive.acoustic}</span>
                                        </td>
                                        <td className="px-10 py-10 text-xl font-black italic opacity-30 uppercase">{hive.lastSeen}</td>
                                        <td className="px-10 py-10">
                                            {hive.alert ? <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-2 rounded-full font-black italic text-xs uppercase shadow-4xl">Alert</span> : <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-6 py-2 rounded-full font-black italic text-xs uppercase shadow-4xl">OK</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SensorHealthView;
