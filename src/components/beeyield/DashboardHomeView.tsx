import React from 'react';
import {
    Activity,
    MapPin,
    Zap,
    TrendingUp,
    ArrowUpRight,
    Hexagon,
    Target,
    LayoutGrid,
    BarChart3,
    ChevronRight,
    Plus,
    Cpu,
    Droplets,
    Thermometer,
    Wind,
    CheckCircle2,
    AlertTriangle,
    Clock,
    ArrowDownRight,
} from 'lucide-react';
import beeyieldService, { IoTDevice, SensorReading, Apiary } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { LineChart, Line, AreaChart, Area, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardHomeViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    apiaries: Apiary[];
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

/* ─── Animated Counter ─── */
const AnimatedNumber: React.FC<{ value: number; prefix?: string; suffix?: string; decimals?: number }> = ({
    value, prefix = '', suffix = '', decimals = 0
}) => {
    const [display, setDisplay] = React.useState(0);
    React.useEffect(() => {
        let start = 0;
        const duration = 1200;
        const step = 16;
        const increment = value / (duration / step);
        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setDisplay(value);
                clearInterval(timer);
            } else {
                setDisplay(start);
            }
        }, step);
        return () => clearInterval(timer);
    }, [value]);
    return (
        <span className="tabular-nums">{prefix}{display.toFixed(decimals)}{suffix}</span>
    );
};

/* ─── Spark Line ─── */
const SparkLine: React.FC<{ data: number[]; color?: string; height?: number }> = ({
    data,
    color = '#F59E0B',
    height = 40
}) => {
    const chartData = data.map((v, i) => ({ i, v }));
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                    <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="v"
                    stroke={color}
                    strokeWidth={1.5}
                    fill={`url(#spark-${color})`}
                    dot={false}
                    animationDuration={1000}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

/* ─── Stat Card ─── */
const StatCard: React.FC<{
    label: string;
    value: string | number;
    unit?: string;
    change?: string;
    positive?: boolean;
    spark?: number[];
    icon: React.ElementType;
    accentColor?: string;
    delay?: number;
}> = ({ label, value, unit, change, positive = true, spark, icon: Icon, accentColor = '#F59E0B', delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#111111] border border-[#1A1A1A] p-5 flex flex-col gap-4 hover:border-white/10 transition-colors group"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    </div>
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em] font-mono">{label}</span>
                </div>
                {change && (
                    <div className={cn(
                        "flex items-center gap-0.5 text-[9px] font-black font-mono",
                        positive ? "text-emerald-400" : "text-red-400"
                    )}>
                        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {change}
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between gap-4">
                <div>
                    <div className="text-2xl font-black text-white tabular-nums leading-none">
                        {value}
                        {unit && <span className="text-sm font-bold text-white/30 ml-1">{unit}</span>}
                    </div>
                </div>
                {spark && (
                    <div className="flex-1 max-w-[80px]">
                        <SparkLine data={spark} color={accentColor} height={36} />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

/* ─── Activity Feed Item ─── */
interface ActivityItem {
    id: string;
    type: 'sync' | 'alert' | 'harvest' | 'inspection' | 'system';
    title: string;
    subtitle: string;
    time: string;
    status: 'ok' | 'warn' | 'error' | 'pending';
    value?: string;
}

const activityFeed: ActivityItem[] = [
    { id: '1', type: 'alert', title: 'Hive #12 — Weight Drop', subtitle: 'Apiary: Nakuru North · Sensor offline', time: '2m ago', status: 'warn', value: '−4.2 kg' },
    { id: '2', type: 'sync', title: 'Telemetry Sync Complete', subtitle: '26 sensors reported · 0 errors', time: '8m ago', status: 'ok', value: '26/26' },
    { id: '3', type: 'harvest', title: 'Harvest Logged', subtitle: 'Apiary: Mau Forest · Batch #B-441', time: '1h ago', status: 'ok', value: '38 kg' },
    { id: '4', type: 'inspection', title: 'Scheduled Inspection Due', subtitle: 'Hive #7 · Varroa monitor overdue', time: '2h ago', status: 'warn', value: 'PENDING' },
    { id: '5', type: 'system', title: 'Season Report Generated', subtitle: 'Q1 2026 · PDF ready for download', time: '4h ago', status: 'ok', value: 'PDF' },
    { id: '6', type: 'sync', title: 'QuickBooks Integration', subtitle: 'Invoice #1092 exported successfully', time: '6h ago', status: 'ok', value: '$1,240' },
];

const statusConfig = {
    ok: { label: 'OK', color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
    warn: { label: 'WARN', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', dot: 'bg-[#F59E0B]' },
    error: { label: 'ERR', color: 'text-red-400', bg: 'bg-red-400/10', dot: 'bg-red-400' },
    pending: { label: 'PEND', color: 'text-white/40', bg: 'bg-white/5', dot: 'bg-white/30' },
};

const typeIcon: Record<ActivityItem['type'], React.ElementType> = {
    sync: Activity,
    alert: AlertTriangle,
    harvest: Hexagon,
    inspection: CheckCircle2,
    system: Cpu,
};

/* ─── Hive Status Matrix ─── */
const HiveStatusMatrix: React.FC = () => {
    const weeks = 12;
    const days = 7;
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const matrix = React.useMemo(() =>
        Array.from({ length: weeks }, () =>
            Array.from({ length: days }, () => {
                const r = Math.random();
                if (r > 0.88) return 'error';
                if (r > 0.80) return 'warn';
                return 'ok';
            })
        ), []
    );

    const cellColors = { ok: 'bg-emerald-500 hover:bg-emerald-400', warn: 'bg-[#F59E0B] hover:bg-[#FBBF24]', error: 'bg-red-500 hover:bg-red-400' };
    const opacities = { ok: 'opacity-70', warn: 'opacity-80', error: 'opacity-90' };

    return (
        <div className="flex gap-1.5">
            <div className="flex flex-col gap-1 pr-1.5 pt-1">
                {dayLabels.map((d, i) => (
                    <span key={i} className="text-[7px] font-black text-white/15 w-3 h-3 flex items-center justify-center font-mono">{d}</span>
                ))}
            </div>
            {matrix.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                    {week.map((status, di) => (
                        <motion.div
                            key={di}
                            className={cn("w-3 h-3 transition-colors cursor-default", cellColors[status], opacities[status])}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: wi * 0.025 + di * 0.008, duration: 0.2 }}
                            title={`Week ${wi + 1}, Day ${di + 1}: ${status.toUpperCase()}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

/* ─── Yield Forecast Bar ─── */
const YieldForecastBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({
    label, value, max, color
}) => {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest font-mono w-24 flex-shrink-0 truncate">{label}</span>
            <div className="flex-1 h-px bg-[#1A1A1A] relative">
                <motion.div
                    className="absolute left-0 top-0 h-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                />
            </div>
            <span className="text-[11px] font-black text-white font-mono tabular-nums w-16 text-right">{value} kg</span>
        </div>
    );
};

/* ─── Main ─── */
const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ apiaries, onTabChange }) => {
    const [selectedActivity, setSelectedActivity] = React.useState<string | null>(null);
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    const sparkHives = [60, 68, 71, 75, 72, 80, 84, 82, 87, 90, 88, 92];
    const sparkHarvest = [30, 45, 38, 55, 60, 58, 70, 65, 78, 74, 80, 85];
    const sparkActivity = [7.2, 7.8, 8.1, 7.9, 8.4, 8.6, 8.3, 8.8, 9.0, 9.1, 8.9, 9.2];

    return (
        <div className="space-y-6 pb-12">

            {/* ── Welcome Row ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2"
            >
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                        {greeting}
                    </h1>
                    <p className="text-[11px] text-white/30 font-mono mt-1.5 uppercase tracking-widest">
                        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        {' · '}Fleet sync nominal
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onTabChange('hives')}
                        className="flex items-center gap-2 px-4 h-9 bg-[#111111] border border-[#1A1A1A] text-white/50 hover:text-white hover:border-white/20 transition-colors text-[10px] font-black uppercase tracking-widest font-mono"
                    >
                        <Hexagon className="w-3.5 h-3.5" />
                        Hives
                    </button>
                    <button
                        onClick={() => onTabChange('harvests')}
                        className="flex items-center gap-2 px-4 h-9 bg-[#F59E0B] text-black hover:bg-[#FBBF24] transition-colors text-[10px] font-black uppercase tracking-widest font-mono"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Log Harvest
                    </button>
                </div>
            </motion.div>

            {/* ── Stats Grid — 3-column like X's metrics ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <StatCard
                    label="Total Hives"
                    value="840"
                    change="+8%"
                    positive
                    spark={sparkHives}
                    icon={Hexagon}
                    accentColor="#F59E0B"
                    delay={0}
                />
                <StatCard
                    label="Season Harvest"
                    value="742"
                    unit="MT"
                    change="+12.8%"
                    positive
                    spark={sparkHarvest}
                    icon={TrendingUp}
                    accentColor="#10B981"
                    delay={0.06}
                />
                <StatCard
                    label="Mean Activity"
                    value="9.2"
                    unit="/10"
                    change="+5%"
                    positive
                    spark={sparkActivity}
                    icon={Zap}
                    accentColor="#A78BFA"
                    delay={0.12}
                />
                <StatCard
                    label="Fleet Health"
                    value="92"
                    unit="%"
                    change="-1%"
                    positive={false}
                    icon={Activity}
                    accentColor="#F87171"
                    delay={0.18}
                />
            </div>

            {/* ── Command Center Row ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">

                {/* Activity Feed — 2/3 */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24, duration: 0.4 }}
                    className="xl:col-span-2 bg-[#111111] border border-[#1A1A1A]"
                >
                    <div className="h-12 flex items-center justify-between px-5 border-b border-[#1A1A1A]">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-mono">Activity Feed</span>
                            <span className="px-2 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] text-[8px] font-black font-mono uppercase">LIVE</span>
                        </div>
                        <button
                            onClick={() => onTabChange('harvests')}
                            className="text-[9px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-widest font-mono flex items-center gap-1"
                        >
                            View All <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="divide-y divide-[#1A1A1A]">
                        <AnimatePresence>
                            {activityFeed.map((item, i) => {
                                const cfg = statusConfig[item.status];
                                const ItemIcon = typeIcon[item.type];
                                const isSelected = selectedActivity === item.id;
                                return (
                                    <motion.button
                                        key={item.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.28 + i * 0.05 }}
                                        onClick={() => setSelectedActivity(isSelected ? null : item.id)}
                                        className={cn(
                                            "w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors",
                                            isSelected ? "bg-[#F59E0B]/5" : "hover:bg-white/3"
                                        )}
                                    >
                                        {/* Icon */}
                                        <div className={cn("w-7 h-7 flex items-center justify-center flex-shrink-0", cfg.bg)}>
                                            <ItemIcon className={cn("w-3.5 h-3.5", cfg.color)} />
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold text-white truncate">{item.title}</p>
                                            <p className="text-[9px] text-white/25 font-mono truncate mt-0.5">{item.subtitle}</p>
                                        </div>

                                        {/* Meta */}
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            {item.value && (
                                                <span className={cn("text-[10px] font-black font-mono", cfg.color)}>{item.value}</span>
                                            )}
                                            <span className="text-[8px] text-white/20 font-mono">{item.time}</span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Right Column — Telemetry + Forecast */}
                <div className="flex flex-col gap-3">

                    {/* Telemetry Matrix */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="bg-[#111111] border border-[#1A1A1A] p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-mono">Sensor Matrix</span>
                            <span className="text-[9px] font-black text-emerald-400 font-mono">88% UPTIME</span>
                        </div>
                        <HiveStatusMatrix />
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#1A1A1A]">
                            {[
                                { label: 'Online', color: 'bg-emerald-500' },
                                { label: 'Warn', color: 'bg-[#F59E0B]' },
                                { label: 'Error', color: 'bg-red-500' },
                            ].map(l => (
                                <div key={l.label} className="flex items-center gap-1.5">
                                    <div className={cn("w-2 h-2", l.color)} />
                                    <span className="text-[8px] font-black text-white/25 font-mono uppercase">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Sensor Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.36, duration: 0.4 }}
                        className="bg-[#111111] border border-[#1A1A1A] p-5"
                    >
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-mono block mb-4">Live Environment</span>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: Thermometer, label: 'Temp', value: '34.2°C', color: '#F87171' },
                                { icon: Droplets, label: 'Humidity', value: '68%', color: '#60A5FA' },
                                { icon: Wind, label: 'Activity', value: 'HIGH', color: '#10B981' },
                                { icon: Cpu, label: 'Sensors', value: '24/26', color: '#F59E0B' },
                            ].map(s => (
                                <div key={s.label} className="bg-[#0D0D0D] border border-[#1A1A1A] p-3">
                                    <s.icon className="w-3.5 h-3.5 mb-2" style={{ color: s.color }} />
                                    <p className="text-[13px] font-black text-white font-mono">{s.value}</p>
                                    <p className="text-[8px] font-black text-white/25 uppercase tracking-widest font-mono mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── Yield Forecast + CTA Banner ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.4 }}
                className="bg-[#111111] border border-[#1A1A1A] grid grid-cols-1 lg:grid-cols-2"
            >
                {/* Left: Forecast bars */}
                <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#1A1A1A]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-mono">Season Yield Forecast</p>
                            <p className="text-[9px] text-white/20 font-mono mt-1">Based on bloom & activity data</p>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-white tabular-nums tracking-tight">742.4</span>
                            <span className="text-[10px] font-black text-[#F59E0B] font-mono">MT</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Nakuru North', value: 248, max: 300, color: '#F59E0B' },
                            { label: 'Mau Forest', value: 195, max: 300, color: '#10B981' },
                            { label: 'Maasai Mara', value: 172, max: 300, color: '#A78BFA' },
                            { label: 'Aberdare Rng', value: 127, max: 300, color: '#60A5FA' },
                        ].map(f => (
                            <YieldForecastBar key={f.label} {...f} />
                        ))}
                    </div>
                </div>

                {/* Right: CTA + quick links */}
                <div className="p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-400 text-[8px] font-black font-mono uppercase tracking-wider">+12.8% YoY</span>
                            <span className="text-[9px] text-white/20 font-mono">CI: 718.2–765.9 MT</span>
                        </div>
                        <h3 className="text-lg font-black text-white leading-tight">
                            You're on track for a<br />
                            <span className="text-[#F59E0B]">record season.</span>
                        </h3>
                        <p className="text-[11px] text-white/30 font-mono mt-2">
                            Confidence 94.2% · 4 apiaries · 840 hives active
                        </p>
                    </div>

                    <div className="space-y-2 mt-6">
                        <button
                            onClick={async () => {
                                toast.loading("Generating season report...");
                                try {
                                    await (beeyieldService as any).generateSeasonReport?.({ apiary_id: 'apiary_123' });
                                    toast.success("Season report ready", { description: "Report saved to your records." });
                                } catch (error: any) {
                                    toast.error("Report failed", { description: error?.message });
                                }
                            }}
                            className="w-full h-11 bg-[#F59E0B] text-black font-black text-[10px] uppercase tracking-[0.2em] font-mono hover:bg-[#FBBF24] transition-colors flex items-center justify-center gap-2"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Generate Full Report
                        </button>
                        <button
                            onClick={() => onTabChange('harvests')}
                            className="w-full h-11 bg-transparent border border-[#1A1A1A] text-white/40 font-black text-[10px] uppercase tracking-[0.2em] font-mono hover:border-white/20 hover:text-white transition-colors"
                        >
                            View Harvest History
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* ── Active Deployments ── */}
            {apiaries.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.48, duration: 0.4 }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-mono">Active Deployments</span>
                            <span className="text-[9px] font-black text-white/20 font-mono">{apiaries.length} apiaries</span>
                        </div>
                        <button
                            onClick={() => onTabChange('orchard-mapper')}
                            className="text-[9px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-widest font-mono flex items-center gap-1"
                        >
                            Map View <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {apiaries.slice(0, 6).map((apiary, i) => {
                            const health = Math.floor(Math.random() * 25) + 75;
                            const spark = Array.from({ length: 8 }, () => Math.random() * 40 + 60);
                            return (
                                <motion.button
                                    key={apiary.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.52 + i * 0.05 }}
                                    onClick={() => onTabChange('orchard-mapper')}
                                    className="bg-[#111111] border border-[#1A1A1A] p-5 text-left hover:border-white/10 transition-colors group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-[12px] font-black text-white group-hover:text-[#F59E0B] transition-colors">{apiary.name}</p>
                                            <p className="text-[9px] text-white/25 font-mono flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-2.5 h-2.5" />
                                                Apiary · {apiary.location || 'Kenya'}
                                            </p>
                                        </div>
                                        <span className={cn(
                                            "text-[8px] font-black font-mono px-2 py-0.5",
                                            health >= 85 ? "bg-emerald-400/10 text-emerald-400" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                                        )}>
                                            {health}%
                                        </span>
                                    </div>

                                    <div className="h-8 mb-4">
                                        <SparkLine data={spark} color={health >= 85 ? '#10B981' : '#F59E0B'} height={32} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { l: 'HIVES', v: Math.floor(Math.random() * 80 + 100) },
                                            { l: 'BLOOM', v: `${Math.floor(Math.random() * 20 + 75)}%` },
                                            { l: 'ACT', v: (Math.random() * 2 + 7).toFixed(1) },
                                        ].map(s => (
                                            <div key={s.l} className="bg-[#0D0D0D] border border-[#1A1A1A] p-2 text-center">
                                                <p className="text-[11px] font-black text-white font-mono">{s.v}</p>
                                                <p className="text-[7px] font-black text-white/20 uppercase font-mono">{s.l}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default DashboardHomeView;
