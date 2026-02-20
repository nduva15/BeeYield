import React, { useState, useEffect } from 'react';
import {
    Thermometer,
    Droplets,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Volume2,
    Cpu,
    ChevronLeft,
    ChevronRight,
    Clock,
    Zap,
    Shield,
    ArrowUp,
    ArrowDown,
    Minus
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    ComposedChart,
    Bar
} from 'recharts';
import { cn } from '@/lib/utils';

interface SensorHealthViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

// --- Mock Data ---
const generateHistoryData = (months: number) => {
    const data = [];
    const now = new Date(2026, 1, 20); // Feb 2026
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

const hiveNodes = [
    { id: 'HV-001', name: 'Hive Alpha', temp: 35.2, humidity: 62, acoustic: 'Healthy', alert: null, lastSeen: '2m ago' },
    { id: 'HV-002', name: 'Hive Bravo', temp: 37.8, humidity: 58, acoustic: 'Swarm Risk', alert: 'TEMP_HIGH', lastSeen: '1m ago' },
    { id: 'HV-003', name: 'Hive Charlie', temp: 28.4, humidity: 71, acoustic: 'Queenless', alert: 'TEMP_LOW', lastSeen: '5m ago' },
    { id: 'HV-004', name: 'Hive Delta', temp: 34.8, humidity: 60, acoustic: 'Healthy', alert: null, lastSeen: '3m ago' },
    { id: 'HV-005', name: 'Hive Echo', temp: 35.0, humidity: 63, acoustic: 'Healthy', alert: null, lastSeen: '2m ago' },
    { id: 'HV-006', name: 'Hive Foxtrot', temp: 36.1, humidity: 57, acoustic: 'Healthy', alert: null, lastSeen: '4m ago' },
];

const acousticConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    'Healthy': { label: 'Queen Present', color: 'text-[#10b981]', bg: 'bg-[#10b981]', icon: CheckCircle2 },
    'Queenless': { label: 'Queenless Detected', color: 'text-red-500', bg: 'bg-red-500', icon: AlertTriangle },
    'Swarm Risk': { label: 'Pre-Swarm Pattern', color: 'text-[#facc15]', bg: 'bg-[#facc15]', icon: Zap },
};

// --- Sub-components ---

const AlertBanner: React.FC<{ hive: typeof hiveNodes[0] }> = ({ hive }) => {
    if (!hive.alert) return null;
    const isHigh = hive.alert === 'TEMP_HIGH';
    return (
        <div className={cn(
            "flex items-start gap-4 p-4 border-l-8 border-4",
            isHigh
                ? "bg-[#facc15]/10 border-[#facc15] border-l-[#facc15]"
                : "bg-red-50 border-red-400 border-l-red-500"
        )}>
            <AlertTriangle className={cn("w-5 h-5 mt-0.5 shrink-0", isHigh ? "text-[#facc15]" : "text-red-500")} />
            <div>
                <p className={cn("text-xs font-black uppercase tracking-widest", isHigh ? "text-[#b45309]" : "text-red-700")}>
                    {isHigh ? '⚠ Swarm Risk — Temperature Elevated' : '⚠ Cluster Loss Warning — Temperature Drop Detected'}
                </p>
                <p className="text-[10px] font-bold text-neutral-500 mt-1">
                    {isHigh
                        ? `${hive.name} is reading ${hive.temp}°C. Target range: 34–36°C. Inspect hive for swarm cells immediately.`
                        : `${hive.name} is reading ${hive.temp}°C — below cluster threshold. Risk of colony collapse.`
                    }
                </p>
            </div>
        </div>
    );
};

const VitalsCard: React.FC<{
    label: string;
    value: string | number;
    unit: string;
    target: string;
    icon: React.ElementType;
    status: 'ok' | 'warn' | 'critical';
    trend: 'up' | 'down' | 'stable';
}> = ({ label, value, unit, target, icon: Icon, status, trend }) => {
    const statusColors = {
        ok: 'border-[#10b981] shadow-[6px_6px_0px_0px_rgba(16,185,129,0.4)]',
        warn: 'border-[#facc15] shadow-[6px_6px_0px_0px_rgba(250,204,21,0.4)]',
        critical: 'border-red-500 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.4)]',
    };
    const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
    const trendColor = status === 'ok'
        ? 'text-[#10b981]'
        : status === 'warn' ? 'text-[#facc15]' : 'text-red-500';

    return (
        <div className={cn("border-4 bg-white p-8 flex flex-col justify-between", statusColors[status])}>
            <div className="flex items-start justify-between mb-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064e3b]/40">{label}</p>
                    <div className="flex items-end gap-2">
                        <span className="text-6xl font-black text-[#064e3b] leading-none">{value}</span>
                        <span className="text-xl font-black text-[#064e3b]/40 mb-1">{unit}</span>
                        <TrendIcon className={cn("w-5 h-5 mb-2", trendColor)} />
                    </div>
                </div>
                <div className={cn(
                    "w-14 h-14 border-2 flex items-center justify-center",
                    status === 'ok' ? "bg-[#064e3b] border-[#064e3b]" :
                        status === 'warn' ? "bg-[#facc15] border-[#b45309]" :
                            "bg-red-500 border-red-700"
                )}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
            </div>
            <div className="flex items-center justify-between border-t-2 border-[#064e3b]/10 pt-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/30">Target</span>
                <span className="text-xs font-black text-[#064e3b]">{target}</span>
            </div>
        </div>
    );
};

// --- Main Component ---

const SensorHealthView: React.FC<SensorHealthViewProps> = ({ onTabChange }) => {
    const [selectedHive, setSelectedHive] = useState(hiveNodes[0]);
    const [historyRange, setHistoryRange] = useState(12);
    const [historyData] = useState(() => generateHistoryData(12));
    const [liveTime, setLiveTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setLiveTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const visibleData = historyData.slice(12 - historyRange);

    const tempStatus = selectedHive.temp < 32 ? 'critical' : selectedHive.temp > 36.5 ? 'warn' : 'ok';
    const humidStatus = selectedHive.humidity < 50 ? 'warn' : selectedHive.humidity > 70 ? 'warn' : 'ok';
    const acoustic = acousticConfig[selectedHive.acoustic] ?? acousticConfig['Healthy'];

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center">
                            <Thermometer className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Sensor <span className="text-[#10b981]">Vitals</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Internal Hive Environmental Monitoring — 24/7
                    </p>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 border-4 border-[#064e3b] bg-[#064e3b]">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
                    <Clock className="w-4 h-4 text-[#facc15]" />
                    <span className="text-[#facc15] font-black text-xs tracking-widest uppercase tabular-nums">
                        {liveTime.toLocaleTimeString()} — LIVE
                    </span>
                </div>
            </div>

            {/* Alert Banners */}
            {hiveNodes.filter(h => h.alert).length > 0 && (
                <div className="space-y-3">
                    {hiveNodes.filter(h => h.alert).map(h => (
                        <AlertBanner key={h.id} hive={h} />
                    ))}
                </div>
            )}

            {/* Hive Node Selector */}
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#064e3b]/40">Select Node</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {hiveNodes.map(hive => {
                        const ac = acousticConfig[hive.acoustic] ?? acousticConfig['Healthy'];
                        const isSelected = hive.id === selectedHive.id;
                        return (
                            <button
                                key={hive.id}
                                onClick={() => setSelectedHive(hive)}
                                className={cn(
                                    "p-4 border-4 text-left transition-none space-y-2",
                                    isSelected
                                        ? "bg-[#064e3b] border-[#064e3b] shadow-[4px_4px_0px_0px_#10b981]"
                                        : "bg-white border-[#064e3b]/20 hover:border-[#064e3b]",
                                    hive.alert && !isSelected && "border-[#facc15]"
                                )}
                            >
                                <div className={cn("w-2 h-2 rounded-full", ac.bg)} />
                                <p className={cn("text-[10px] font-black uppercase tracking-wider", isSelected ? "text-white" : "text-[#064e3b]")}>
                                    {hive.id}
                                </p>
                                <p className={cn("text-[10px] font-bold", isSelected ? "text-[#10b981]" : "text-[#064e3b]/40")}>
                                    {hive.temp}°C
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Vitals Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                {/* Acoustic Signature Card */}
                <div className={cn(
                    "border-4 bg-white p-8 flex flex-col justify-between",
                    selectedHive.acoustic === 'Healthy'
                        ? 'border-[#10b981] shadow-[6px_6px_0px_0px_rgba(16,185,129,0.4)]'
                        : selectedHive.acoustic === 'Swarm Risk'
                            ? 'border-[#facc15] shadow-[6px_6px_0px_0px_rgba(250,204,21,0.4)]'
                            : 'border-red-500 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.4)]'
                )}>
                    <div className="flex items-start justify-between mb-6">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064e3b]/40">Acoustic Signature</p>
                            <p className={cn("text-3xl font-black uppercase tracking-tight", acoustic.color)}>
                                {selectedHive.acoustic}
                            </p>
                            <p className="text-xs font-bold text-[#064e3b]/50">{acoustic.label}</p>
                        </div>
                        <div className={cn("w-14 h-14 border-2 border-[#064e3b] flex items-center justify-center", acoustic.bg)}>
                            <Volume2 className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    {/* Fake waveform bars */}
                    <div className="flex items-end gap-1 h-10 border-t-2 border-[#064e3b]/10 pt-4">
                        {Array.from({ length: 24 }).map((_, i) => {
                            const h = selectedHive.acoustic === 'Healthy'
                                ? 30 + Math.sin(i * 0.8) * 20 + Math.random() * 10
                                : selectedHive.acoustic === 'Swarm Risk'
                                    ? 20 + Math.abs(Math.sin(i * 1.5)) * 40
                                    : 10 + Math.random() * 15;
                            return (
                                <div
                                    key={i}
                                    style={{ height: `${Math.max(4, h)}%` }}
                                    className={cn(
                                        "flex-1",
                                        selectedHive.acoustic === 'Healthy' ? "bg-[#10b981]" :
                                            selectedHive.acoustic === 'Swarm Risk' ? "bg-[#facc15]" : "bg-red-400"
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Historical Scrubber */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b-4 border-[#064e3b] pb-4">
                    <div className="flex items-center gap-4">
                        <Activity className="w-6 h-6 text-[#10b981]" />
                        <h3 className="text-3xl font-black uppercase tracking-tighter">12-Month Trend</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/40">
                            Showing last {historyRange} months
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setHistoryRange(r => Math.max(1, r - 1))}
                                className="w-8 h-8 border-2 border-[#064e3b] flex items-center justify-center hover:bg-[#064e3b] hover:text-white transition-none"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setHistoryRange(r => Math.min(12, r + 1))}
                                className="w-8 h-8 border-2 border-[#064e3b] flex items-center justify-center hover:bg-[#064e3b] hover:text-white transition-none"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-4 border-[#064e3b] bg-white p-8 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={visibleData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#064e3b" strokeOpacity={0.05} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#064e3b', fontWeight: 900, fontSize: 10 }} />
                                <YAxis yAxisId="temp" domain={[25, 40]} axisLine={false} tickLine={false} tick={{ fill: '#064e3b', fontWeight: 900, fontSize: 10 }} />
                                <YAxis yAxisId="humid" orientation="right" domain={[40, 80]} axisLine={false} tickLine={false} tick={{ fill: '#064e3b', fontWeight: 900, fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#064e3b', border: '4px solid #10b981', borderRadius: 0, padding: '10px' }}
                                    itemStyle={{ color: '#fff', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
                                    labelStyle={{ color: '#facc15', fontWeight: 900, marginBottom: '4px' }}
                                />
                                <ReferenceLine yAxisId="temp" y={34} stroke="#facc15" strokeDasharray="6 4" strokeWidth={2} label={{ value: 'MIN', fill: '#b45309', fontSize: 9, fontWeight: 900 }} />
                                <ReferenceLine yAxisId="temp" y={36} stroke="#facc15" strokeDasharray="6 4" strokeWidth={2} label={{ value: 'MAX', fill: '#b45309', fontSize: 9, fontWeight: 900 }} />
                                <Area yAxisId="temp" type="monotone" dataKey="temp" stroke="#10b981" strokeWidth={3} fill="url(#tempGrad)" name="Temp (°C)" />
                                <Bar yAxisId="humid" dataKey="humidity" fill="#064e3b" fillOpacity={0.1} name="Humidity (%)" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-8 pt-4 border-t-2 border-[#064e3b]/10 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-1 bg-[#10b981]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/40">Temp (°C)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#064e3b]/10 border border-[#064e3b]/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/40">Humidity (%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0.5 bg-[#facc15]" style={{ borderTop: '2px dashed #facc15' }} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/40">Target Band</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fleet Summary Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 border-b-4 border-[#064e3b] pb-4">
                    <Shield className="w-5 h-5 text-[#10b981]" />
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Fleet Vitals Registry</h3>
                </div>
                <div className="border-4 border-[#064e3b] overflow-hidden shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                    <table className="w-full">
                        <thead className="bg-[#064e3b]">
                            <tr>
                                {['Node', 'Temp', 'Humidity', 'Acoustic', 'Last Seen', 'Status'].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-[#064e3b]/5">
                            {hiveNodes.map(hive => {
                                const ac = acousticConfig[hive.acoustic] ?? acousticConfig['Healthy'];
                                const tStatus = hive.temp < 32 ? 'critical' : hive.temp > 36.5 ? 'warn' : 'ok';
                                return (
                                    <tr
                                        key={hive.id}
                                        onClick={() => setSelectedHive(hive)}
                                        className={cn(
                                            "cursor-pointer hover:bg-[#064e3b]/5 transition-none",
                                            selectedHive.id === hive.id && "bg-[#10b981]/5"
                                        )}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-2.5 h-2.5 rounded-full", ac.bg)} />
                                                <div>
                                                    <p className="text-xs font-black text-[#064e3b]">{hive.id}</p>
                                                    <p className="text-[9px] font-bold text-[#064e3b]/40 uppercase">{hive.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "text-sm font-black tabular-nums",
                                                tStatus === 'ok' ? 'text-[#064e3b]' : tStatus === 'warn' ? 'text-[#b45309]' : 'text-red-600'
                                            )}>{hive.temp}°C</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-black text-[#064e3b] tabular-nums">{hive.humidity}%</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest", ac.color)}>
                                                {ac.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[10px] font-bold text-[#064e3b]/40">{hive.lastSeen}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            {hive.alert ? (
                                                <span className="px-3 py-1.5 bg-[#facc15] text-[#064e3b] text-[9px] font-black uppercase tracking-widest">
                                                    ALERT
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1.5 bg-[#10b981]/10 text-[#10b981] text-[9px] font-black uppercase tracking-widest">
                                                    NOMINAL
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SensorHealthView;
