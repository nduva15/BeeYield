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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-slate-200/60 dark:border-white/5 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-black/40 transition-all"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: `${accentColor}15` }}>
                    <Icon className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                {change && (
                    <div className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide",
                        positive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    )}>
                        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {change}
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em]">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                        {value}
                    </span>
                    {unit && <span className="text-xs font-black text-slate-400 dark:text-white/20 uppercase tracking-widest">{unit}</span>}
                </div>
            </div>

            {spark && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                    <SparkLine data={spark} color={accentColor} height={40} />
                </div>
            )}

            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-black/[0.02] dark:to-white/[0.02] pointer-events-none" />
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
    const [realActivities, setRealActivities] = React.useState<ActivityItem[]>(activityFeed);
    const [stats, setStats] = React.useState<any>(null);

    React.useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                // F1, F2: Real Data Integration
                const [logs, dashboardStats] = await Promise.all([
                    beeyieldService.getActivityLogs(10),
                    beeyieldService.getStats()
                ]);

                if (isMounted) {
                    if (logs && logs.length > 0) {
                        const mapped = logs.map(log => {
                            let type: 'sync' | 'alert' | 'harvest' | 'inspection' | 'system' = 'system';
                            let status: 'ok' | 'warn' | 'error' | 'pending' = 'ok';
                            if (log.event_type.includes('alert')) { type = 'alert'; status = 'warn'; }
                            else if (log.event_type.includes('harvest')) type = 'harvest';
                            else if (log.event_type.includes('sync')) type = 'sync';
                            else if (log.event_type.includes('inspection')) type = 'inspection';

                            return {
                                id: log.id,
                                type: type,
                                title: log.title,
                                subtitle: log.subtitle || '',
                                time: new Date(log.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                                status: status,
                                value: log.metadata?.value || undefined
                            };
                        });
                        setRealActivities(mapped);
                    }
                    if (dashboardStats) {
                        setStats(dashboardStats);
                    }
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, []);

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
                transition={{ duration: 0.6 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2"
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            Sync Status: Optimal
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest font-mono">Live Telemetry</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mt-2">
                        {greeting} Registry.
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-white/30">
                        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        {' · '}All industrial nodes report nominal operation.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onTabChange('hives')}
                        className="group flex items-center gap-2.5 px-6 h-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:border-amber-500/30 hover:shadow-lg rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest"
                    >
                        <Hexagon className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                        Hive Registry
                    </button>
                    <button
                        onClick={() => onTabChange('harvests')}
                        className="flex items-center gap-2.5 px-6 h-12 bg-amber-500 text-neutral-900 hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/10 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest"
                    >
                        <Plus className="w-4 h-4" />
                        Log Harvest
                    </button>
                </div>
            </motion.div>

            {/* ── Stats Grid — 3-column like X's metrics ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <StatCard
                    label="Total Hives"
                    value={stats?.total_hives?.toString() || "..."}
                    change="+8%"
                    positive
                    spark={sparkHives}
                    icon={Hexagon}
                    accentColor="#F59E0B"
                    delay={0}
                />
                <StatCard
                    label="Season Harvest"
                    value={stats?.total_honey_kg?.toLocaleString() || "..."}
                    unit="KG"
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
                    value={stats?.total_hives ? Math.round((stats.active_hives / stats.total_hives) * 100).toString() : "92"}
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
                    transition={{ delay: 0.24, duration: 0.5 }}
                    className="xl:col-span-2 bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-[2rem] overflow-hidden"
                >
                    <div className="h-16 flex items-center justify-between px-8 border-b border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Operational Journal</span>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black tracking-widest uppercase rounded-md">
                                <Activity className="w-3 h-3" />
                                Live
                            </div>
                        </div>
                        <button
                            onClick={() => onTabChange('harvests')}
                            className="text-[10px] font-black text-amber-600 hover:text-amber-700 transition-colors uppercase tracking-widest flex items-center gap-1 group"
                        >
                            History Archive <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[520px] overflow-y-auto custom-scrollbar">
                        <AnimatePresence>
                            {realActivities.map((item, i) => {
                                const cfg = statusConfig[item.status];
                                const ItemIcon = typeIcon[item.type];
                                const isSelected = selectedActivity === item.id;
                                return (
                                    <motion.button
                                        key={item.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.05 }}
                                        onClick={() => setSelectedActivity(isSelected ? null : item.id)}
                                        className={cn(
                                            "w-full flex items-center gap-5 px-8 py-5 text-left transition-all",
                                            isSelected ? "bg-amber-50/50 dark:bg-amber-500/5 shadow-inner" : "hover:bg-slate-50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        {/* Icon */}
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", cfg.bg)}>
                                            <ItemIcon className={cn("w-5 h-5", cfg.color)} />
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{item.title}</p>
                                                {item.status !== 'ok' && (
                                                    <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest", cfg.bg, cfg.color)}>
                                                        {item.status}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs font-medium text-slate-500 dark:text-white/30 truncate mt-1">{item.subtitle}</p>
                                        </div>

                                        {/* Meta */}
                                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                            {item.value && (
                                                <span className={cn("text-[11px] font-black font-mono tracking-tighter", cfg.color)}>{item.value}</span>
                                            )}
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">{item.time}</span>
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
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 p-6 rounded-[2rem]"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Node Matrix</span>
                            <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-widest uppercase rounded-lg">99.8% Uptime</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-[#000000]/20 rounded-2xl">
                            <HiveStatusMatrix />
                        </div>
                        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                            {[
                                { label: 'Online', color: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' },
                                { label: 'Warning', color: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' },
                                { label: 'Error', color: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' },
                            ].map(l => (
                                <div key={l.label} className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", l.color)} />
                                    <span className="text-[9px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Sensor Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.36, duration: 0.5 }}
                        className="bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 p-6 rounded-[2rem]"
                    >
                        <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] block mb-6">Environment Sensors</span>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: Thermometer, label: 'Ambient', value: '34.2°C', color: '#EF4444' },
                                { icon: Droplets, label: 'Humidity', value: '68%', color: '#3B82F6' },
                                { icon: Wind, label: 'Bio-Activity', value: 'HIGH', color: '#10B981' },
                                { icon: Cpu, label: 'Nodes', value: '24/26', color: '#F59E0B' },
                            ].map(s => (
                                <div key={s.label} className="bg-slate-50 dark:bg-black/20 p-4 rounded-2xl border border-transparent hover:border-amber-500/10 transition-all group">
                                    <s.icon className="w-4 h-4 mb-3 transition-transform group-hover:scale-110" style={{ color: s.color }} />
                                    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{s.value}</p>
                                    <p className="text-[9px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-[0.15em] mt-1">{s.label}</p>
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
                transition={{ delay: 0.42, duration: 0.5 }}
                className="bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2"
            >
                {/* Left: Forecast bars */}
                <div className="p-10 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Season Yield Forecast</p>
                            <p className="text-xs font-medium text-slate-500 dark:text-white/30 mt-1">Projection based on bloom telemetry</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">742.4</span>
                            <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest">MT</span>
                        </div>
                    </div>
                    <div className="space-y-6">
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
                <div className="p-10 flex flex-col justify-between bg-slate-50/50 dark:bg-black/20">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-black tracking-widest uppercase rounded-lg">+12.8% Growth</span>
                            <span className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest">CI: 718.2–765.9 MT</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter">
                            A record season is <br />
                            <span className="text-amber-600 underline decoration-amber-200/50 underline-offset-4">projected for 2026.</span>
                        </h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-white/30 leading-relaxed max-w-sm">
                            Real-time colony metrics indicate high productivity across all 4 monitored apiaries.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
                        <button
                            onClick={async () => {
                                toast.loading("Synthesizing season records...");
                                try {
                                    await (beeyieldService as any).generateSeasonReport?.({ apiary_id: 'apiary_123' });
                                    toast.success("Industrial report ready");
                                } catch (error: any) {
                                    toast.error("Failed to generate report");
                                }
                            }}
                            className="h-12 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Full Audit Report
                        </button>
                        <button
                            onClick={() => onTabChange('harvests')}
                            className="h-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-white/60 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                        >
                            History Archive
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* ── Active Deployments ── */}
            {apiaries.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.48, duration: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Active Deployments</span>
                            <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/20 text-[10px] font-black uppercase tracking-widest rounded-lg">{apiaries.length} industrial nodes</span>
                        </div>
                        <button
                            onClick={() => onTabChange('orchard-mapper')}
                            className="text-[10px] font-black text-amber-600 hover:text-amber-700 transition-colors uppercase tracking-widest flex items-center gap-1 group"
                        >
                            Spatial Map <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                                    className="bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 p-6 text-left rounded-[2rem] hover:border-amber-500/30 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-black/40 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="space-y-1">
                                            <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight group-hover:text-amber-600 transition-colors uppercase italic">{apiary.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                                                {apiary.location_name || 'Industrial Apiary'}
                                            </p>
                                        </div>
                                        <div className={cn(
                                            "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest",
                                            health >= 85 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                        )}>
                                            {health}%
                                        </div>
                                    </div>

                                    <div className="h-10 mb-8 px-2">
                                        <SparkLine data={spark} color={health >= 85 ? '#10B981' : '#F59E0B'} height={40} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { l: 'HIVES', v: Math.floor(Math.random() * 80 + 100) },
                                            { l: 'BLOOM', v: `${Math.floor(Math.random() * 20 + 75)}%` },
                                            { l: 'ACT', v: (Math.random() * 2 + 7).toFixed(1) },
                                        ].map(s => (
                                            <div key={s.l} className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl text-center border border-transparent group-hover:border-amber-500/10 transition-all">
                                                <p className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{s.v}</p>
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">{s.l}</p>
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
