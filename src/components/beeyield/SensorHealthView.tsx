import React from 'react';
import {
    Thermometer, Droplets, Activity, AlertTriangle, CheckCircle2, Volume2, Cpu, ChevronLeft, ChevronRight, Clock, Zap, Shield, ArrowUp, ArrowDown, Minus, Layers
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Bar
} from 'recharts';
import { cn } from '@/lib/utils';
import beeyieldService, { ActivityLog, SensorAlert, Hive } from '@/services/beeyieldService';
import { formatDistanceToNow } from 'date-fns';
import { glass, PageHeader } from './GlassTheme';
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
    'Healthy': { label: 'Normal Activity', color: 'text-emerald-600', bg: 'bg-emerald-500', icon: CheckCircle2 },
    'Queenless': { label: 'Queen Issues', color: 'text-red-600', bg: 'bg-red-500', icon: AlertTriangle },
    'Swarm Risk': { label: 'Swarm Risk', color: 'text-amber-600', bg: 'bg-amber-500', icon: Zap },
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
        ? 'text-emerald-600'
        : status === 'warn' ? 'text-amber-600' : 'text-red-600';

    return (
        <div className={cn(glass.card, "p-5 flex flex-col justify-between group transition-all h-full bg-white shadow-sm")}>
            <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                    <div className="flex items-baseline gap-1">
                        <span className={cn("text-3xl font-bold tracking-tight", status === 'ok' ? 'text-[#1A1A1A]' : status === 'warn' ? 'text-amber-600' : 'text-red-600')}>{value}</span>
                        <span className="text-xs font-bold text-gray-400">{unit}</span>
                    </div>
                </div>
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm group-hover:scale-105 transition-transform",
                    status === 'ok' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                        status === 'warn' ? "bg-amber-50 border-amber-100 text-amber-600" :
                            "bg-red-50 border-red-100 text-red-600"
                )}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-4">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Target</span>
                    <span className="text-xs font-bold text-gray-600">{target}</span>
                </div>
                <div className={cn("flex items-center gap-1 font-bold text-[10px] uppercase", trendColor)}>
                    <TrendIcon className="w-3 h-3" />
                    <span>{trend}</span>
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
            <div className={cn(glass.page, "flex items-center justify-center min-h-[50vh]")}>
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#F9F7F2] border border-gray-200 mx-auto flex items-center justify-center relative shadow-sm">
                        <Zap className="w-8 h-8 text-[#F4D03F] animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A1A] animate-pulse">Loading Sensor Matrix...</h3>
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
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Activity}
                label="Monitoring"
                title={<>Hive <span className="text-[#1B9157]">Health</span></>}
                subtitle="Live readings to help spot issues early."
                actions={
                    <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                         <div className="w-2 h-2 rounded-full bg-[#1B9157] shadow-[0_0_8px_rgba(27,145,87,0.4)] animate-pulse" />
                         <span className="text-xs font-bold text-[#1A1A1A] tabular-nums">{liveTime.toLocaleTimeString()} — LIVE</span>
                    </div>
                }
            />

            {/* Alerts */}
            {realAlerts.filter(a => !a.resolved).length > 0 && (
                <div className="space-y-3">
                    {realAlerts.filter(a => !a.resolved).slice(0, 2).map(alert => (
                        <motion.div
                            key={alert.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className={cn(
                                glass.card,
                                "p-4 border-l-4 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden shadow-sm",
                                alert.severity === 'critical' ? "border-red-500" : "border-amber-400"
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm", alert.severity === 'critical' ? "bg-red-50 border-red-100 text-red-500" : "bg-amber-50 border-amber-100 text-amber-600")}>
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 space-y-0.5">
                                <h4 className={cn("text-sm font-bold tracking-tight", alert.severity === 'critical' ? "text-red-600" : "text-amber-700")}>
                                    Attention Needed: {alert.alert_type}
                                </h4>
                                <p className="text-xs font-medium text-gray-500">{alert.message}</p>
                            </div>
                            <div className="shrink-0 text-right">
                                <span className="text-[10px] font-bold text-gray-300 uppercase">{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Hive Selector */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Hive selection</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {realHives.map(hive => {
                        const isSelected = hive.id === selectedHive.id;
                        return (
                            <button
                                key={hive.id}
                                onClick={() => setSelectedHive(hive)}
                                className={cn(
                                    glass.card,
                                    "p-4 text-left transition-all relative overflow-hidden group border-gray-100 shadow-sm",
                                    isSelected ? "bg-white border-[#1B9157] ring-1 ring-[#1B9157]/20" : "bg-gray-50 hover:bg-white hover:border-gray-200"
                                )}
                            >
                                <div className="space-y-3 relative z-10">
                                    <div className="flex justify-between items-center">
                                        <span className={cn("text-xs font-bold tracking-wider uppercase", isSelected ? "text-[#1B9157]" : "text-gray-500")}>{hive.code}</span>
                                        {hive.alert && <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-[#1A1A1A] tabular-nums">{hive.temp}°C</span>
                                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                                        <span className="text-sm font-bold text-gray-400 tabular-nums">{hive.humidity}%</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className={cn(glass.card, "p-5 flex flex-col justify-between group transition-all bg-white shadow-sm overflow-hidden")}>
                    <div className="flex items-start justify-between mb-2">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Hive Sound</p>
                            <h3 className={cn("text-xl font-bold tracking-tight uppercase", acoustic.color)}>
                                {selectedHive.acoustic}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400">{acoustic.label}</p>
                        </div>
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm",
                            selectedHive.acoustic === 'Healthy' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                selectedHive.acoustic === 'Swarm Risk' ? "bg-amber-50 border-amber-100 text-amber-600" :
                                    "bg-red-50 border-red-100 text-red-600"
                        )}>
                            <Volume2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-end gap-1 h-12 border-t border-gray-50 pt-3 mt-4">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div
                                key={i}
                                className={cn("flex-1 rounded-t-sm transition-all duration-300",
                                    selectedHive.acoustic === 'Healthy' ? "bg-emerald-400" :
                                        selectedHive.acoustic === 'Swarm Risk' ? "bg-amber-400" : "bg-red-400"
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
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                            <Activity className="w-5 h-5 text-gray-400" />
                        </div>
                        <h2 className="text-base font-bold text-[#1A1A1A] tracking-tight">History Trends</h2>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                        <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Past {historyRange} Mo</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setHistoryRange(r => Math.max(1, r - 1))}
                                className="h-8 w-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                                aria-label="Show fewer months"
                                title="Show fewer months"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setHistoryRange(r => Math.min(12, r + 1))}
                                className="h-8 w-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                                aria-label="Show more months"
                                title="Show more months"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className={cn(glass.card, "p-5 bg-white shadow-sm")}>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={visibleData}>
                                <defs>
                                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F4D03F" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#F4D03F" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }} dy={10} />
                                <YAxis yAxisId="temp" domain={[20, 40]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }} dx={-10} />
                                <Tooltip
                                    contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                />
                                <Area yAxisId="temp" type="monotone" dataKey="temp" stroke="#F4D03F" strokeWidth={3} fill="url(#tempGradient)" />
                                <Bar yAxisId="temp" dataKey="humidity" fill="#1B9157" fillOpacity={0.05} radius={[4, 4, 0, 0]} barSize={30} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                        <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-base font-bold text-[#1A1A1A] tracking-tight">Global Status Matrix</h3>
                </div>
                <div className={cn(glass.card, "p-0 overflow-hidden shadow-sm bg-white")}>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    {['Hive', 'Temp', 'Humidity', 'Sound profile', 'Last sync', 'Health'].map(h => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {realHives.map(hive => (
                                    <tr key={hive.id} onClick={() => setSelectedHive(hive)} className={cn("hover:bg-gray-50 transition-colors cursor-pointer group", selectedHive.id === hive.id && "bg-emerald-50/20")}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-2 h-2 rounded-full", acousticConfig[hive.acoustic]?.bg || "bg-emerald-500")} />
                                                <span className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#1B9157] transition-colors">{hive.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-500 tabular-nums">{hive.temp}°C</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-500 tabular-nums">{hive.humidity}%</td>
                                        <td className="px-6 py-4">
                                            <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg border", 
                                                hive.acoustic === 'Healthy' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                hive.acoustic === 'Swarm Risk' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                "bg-red-50 text-red-600 border-red-100"
                                            )}>{hive.acoustic}</span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-gray-300 uppercase tracking-tighter sm:tracking-normal">{hive.lastSeen}</td>
                                        <td className="px-6 py-4">
                                            {hive.alert ? <span className="bg-red-50 text-red-500 border border-red-100 px-3 py-1 rounded-lg font-bold text-[10px] uppercase shadow-sm">Alert</span> : <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-lg font-bold text-[10px] uppercase shadow-sm">OK</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
            `}</style>
        </motion.div>
    );
};

export default SensorHealthView;
