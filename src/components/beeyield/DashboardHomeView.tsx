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
    Bot,
    Sparkles,
    SearchCode,
    Radio,
    Terminal,
    Layers,
    Waves,
    Calendar,
    ArrowRight,
    ShieldCheck,
    Dna,
    Network,
    Lock,
    Fingerprint
} from 'lucide-react';
import beeyieldService, { IoTDevice, SensorReading, Apiary } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/assets/Logo.png';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

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
    color = '#FF6B00',
    height = 36
}) => {
    const chartData = data.map((v, i) => ({ i, v }));
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                    <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
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
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

/* ─── Activity Item ─── */
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
    { id: '1', type: 'alert', title: 'Weight Drop detected', subtitle: 'Hive #12 · Nakuru North', time: '2 mins ago', status: 'warn', value: '-4.2kg' },
    { id: '2', type: 'sync', title: 'Sync Successful', subtitle: '26 sensors reported successfully', time: '8 mins ago', status: 'ok', value: '26/26' },
    { id: '3', type: 'harvest', title: 'New Harvest recorded', subtitle: 'Mau Forest · Batch #441', time: '1 hour ago', status: 'ok', value: '38kg' },
    { id: '4', type: 'inspection', title: 'Inspection Due', subtitle: 'Hive #7 · Scheduled health check', time: '2 hours ago', status: 'warn', value: 'Pending' },
];

const statusConfig = {
    ok: { label: 'Online', color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
    warn: { label: 'Alert', color: 'text-[#FF6B00]', bg: 'bg-[#FF6B00]/10', dot: 'bg-[#FF6B00]' },
    error: { label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
    pending: { label: 'Pending', color: 'text-gray-600', bg: 'bg-white/5', dot: 'bg-white/30' },
};

const typeIcon: Record<ActivityItem['type'], React.ElementType> = {
    sync: Activity,
    alert: AlertTriangle,
    harvest: Hexagon,
    inspection: CheckCircle2,
    system: Cpu,
};

/* ─── Status Grid ─── */
const HiveStatusMatrix: React.FC = () => {
    const weeks = 12;
    const days = 7;
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const matrix = React.useMemo(() =>
        Array.from({ length: weeks }, () =>
            Array.from({ length: days }, () => {
                const r = Math.random();
                if (r > 0.90) return 'high';
                if (r > 0.70) return 'med';
                return 'low';
            })
        ), []
    );

    const cellColors = {
        high: 'bg-[#FF6B00]',
        med: 'bg-[#FF6B00]/40',
        low: 'bg-white/[0.08]'
    };

    return (
        <div className="flex gap-1">
            <div className="flex flex-col gap-1 pr-2">
                {dayLabels.map((d, i) => (
                    <span key={i} className="text-[9px] text-gray-400 w-3 h-3 flex items-center justify-center">{d}</span>
                ))}
            </div>
            {matrix.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                    {week.map((status, di) => (
                        <motion.div
                            key={di}
                            className={cn("w-3 h-3 rounded-sm transition-all hover:scale-125", cellColors[status as keyof typeof cellColors])}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: wi * 0.02 + di * 0.005 }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

/* ─── Forecast Bar ─── */
const YieldForecastBar: React.FC<{ label: string; value: number; max: number; color: string; index: number }> = ({
    label, value, max, color, index
}) => {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 group"
        >
            <span className="text-[11px] font-medium text-gray-600 w-32 flex-shrink-0 truncate group-hover:text-gray-700 transition-colors">{label}</span>
            <div className="flex-1 h-2 bg-white/5 rounded-full relative overflow-hidden">
                <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ backgroundColor: color === '#FFFFFF' ? 'rgba(255,255,255,0.4)' : '#FF6B00' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
                />
            </div>
            <span className="text-sm font-semibold text-gray-900 tabular-nums w-16 text-right">{value} kg</span>
        </motion.div>
    );
};

/* ─── Main View ─── */
const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ apiaries, onTabChange }) => {
    const [selectedActivity, setSelectedActivity] = React.useState<string | null>(null);
    const [realActivities, setRealActivities] = React.useState<ActivityItem[]>(activityFeed);
    const [stats, setStats] = React.useState<any>(null);

    React.useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [logs, dashboardStats] = await Promise.all([
                    beeyieldService.getActivityLogs(10),
                    beeyieldService.getStats()
                ]);
                if (isMounted) {
                    if (logs && logs.length > 0) {
                        setRealActivities(logs.map(log => ({
                            id: log.id,
                            type: log.event_type.includes('alert') ? 'alert' : log.event_type.includes('harvest') ? 'harvest' : log.event_type.includes('sync') ? 'sync' : 'system' as any,
                            title: log.title,
                            subtitle: log.subtitle || '',
                            time: new Date(log.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                            status: log.event_type.includes('alert') ? 'warn' : 'ok' as any,
                            value: log.metadata?.value || undefined
                        })));
                    }
                    if (dashboardStats) setStats(dashboardStats);
                }
            } catch (err) { console.error("Could not sync data", err); }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            {/* Header */}
            <PageHeader
                icon={LayoutGrid}
                label="Dashboard"
                title={<>{greeting}</>}
                subtitle="Overview of your apiary operations, sensor data, and harvest metrics."
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={() => onTabChange('assistant')}
                            className={cn(glass.btnSecondary, "gap-2")}
                        >
                            <Bot className="w-4 h-4 text-[#FF6B00]" />
                            AI Assistant
                        </button>
                        <button
                            onClick={() => onTabChange('harvests')}
                            className={cn(glass.btnPrimary)}
                        >
                            <Plus className="w-4 h-4" />
                            New Harvest
                        </button>
                    </div>
                }
            />

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassStatCard
                    label="Total Hives"
                    value={stats?.total_hives?.toString() || "—"}
                    icon={Hexagon}
                    index={0}
                />
                <GlassStatCard
                    label="Honey Yield (kg)"
                    value={stats?.total_honey_kg?.toLocaleString() || "—"}
                    icon={TrendingUp}
                    index={1}
                    color="text-emerald-400"
                />
                <GlassStatCard
                    label="System Status"
                    value="Healthy"
                    icon={ShieldCheck}
                    index={2}
                    color="text-emerald-400"
                />
                <GlassStatCard
                    label="Apiaries"
                    value={apiaries.length.toString()}
                    icon={MapPin}
                    index={3}
                    color="text-[#FF6B00]"
                />
            </div>

            {/* Main Grid: Activity + Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="xl:col-span-8"
                >
                    <div className={cn(glass.section, "overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-[#FF6B00]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] text-gray-500">Live</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onTabChange('harvests')}
                                className="text-[12px] text-gray-500 hover:text-white/60 transition-colors flex items-center gap-1"
                            >
                                View all <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                            <AnimatePresence mode="popLayout">
                                {realActivities.map((item, i) => {
                                    const cfg = statusConfig[item.status];
                                    const ItemIcon = typeIcon[item.type];
                                    return (
                                        <motion.button
                                            key={item.id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            onClick={() => setSelectedActivity(selectedActivity === item.id ? null : item.id)}
                                            className={cn(
                                                "w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors group/item",
                                                selectedActivity === item.id ? "bg-gray-50" : "hover:bg-white/[0.02]"
                                            )}
                                        >
                                            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", cfg.bg)}>
                                                <ItemIcon className={cn("w-4 h-4", cfg.color)} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                                <p className="text-[12px] text-gray-500 truncate">{item.subtitle}</p>
                                            </div>

                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                {item.value && (
                                                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md", cfg.bg, cfg.color)}>{item.value}</span>
                                                )}
                                                <span className="text-[10px] text-gray-400">{item.time}</span>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                {/* Sidebar Widgets */}
                <div className="xl:col-span-4 space-y-6">
                    {/* Hive Health Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={cn(glass.section, "p-5")}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Fleet Health</h3>
                                <p className="text-[11px] text-gray-500">12-week activity</p>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                <Network className="w-4 h-4 text-[#FF6B00]/60" />
                            </div>
                        </div>
                        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 flex justify-center">
                            <HiveStatusMatrix />
                        </div>
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                            {[
                                { label: 'High', color: 'bg-[#FF6B00]' },
                                { label: 'Normal', color: 'bg-[#FF6B00]/40' },
                                { label: 'Idle', color: 'bg-white/[0.08]' },
                            ].map(l => (
                                <div key={l.label} className="flex items-center gap-1.5">
                                    <div className={cn("w-2 h-2 rounded-sm", l.color)} />
                                    <span className="text-[10px] text-gray-500">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Sensors */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={cn(glass.section, "p-5")}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">Sensor Overview</h3>
                            <Waves className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: Thermometer, label: 'Temp', value: '34.2°C', color: '#FF6B00' },
                                { icon: Droplets, label: 'Humidity', value: '68%', color: '#fff' },
                                { icon: Activity, label: 'Vibration', value: 'Normal', color: '#fff' },
                                { icon: Cpu, label: 'Uptime', value: '98%', color: '#FF6B00' },
                            ].map((s) => (
                                <div key={s.label} className="bg-white p-3.5 rounded-xl border border-white/5 hover:border-gray-200 transition-colors">
                                    <s.icon className="w-4 h-4 mb-2" style={{ color: s.color, opacity: 0.6 }} />
                                    <p className="text-lg font-bold text-gray-900 tracking-tight leading-none mb-0.5">{s.value}</p>
                                    <p className="text-[10px] text-gray-500">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Harvest Forecast */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={cn(glass.section, "overflow-hidden grid grid-cols-1 lg:grid-cols-12")}
            >
                <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#FF6B00]/10 rounded-lg border border-[#FF6B00]/20 mb-2">
                                <Sparkles className="w-3 h-3 text-[#FF6B00]" />
                                <span className="text-[10px] font-semibold text-[#FF6B00]">Forecast</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Harvest Projection</h3>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900 tabular-nums">742.4 <span className="text-sm text-gray-400">kg</span></div>
                            <span className="text-[11px] text-[#FF6B00]">Predicted 2026</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Nakuru North', value: 248, max: 300, color: '#FF6B00' },
                            { label: 'Mau Forest', value: 195, max: 300, color: '#FFFFFF' },
                            { label: 'Maasai Mara', value: 172, max: 300, color: '#FF6B00' },
                            { label: 'Aberdare Ridge', value: 127, max: 300, color: '#FFFFFF' },
                        ].map((f, i) => (
                            <YieldForecastBar key={f.label} {...f} index={i} />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-[#FF6B00]/[0.02]">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-lg border border-gray-200 mb-3">
                            <span className="text-[11px] text-gray-600">+12.8% Growth</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Peak Season <span className="text-[#FF6B00]">Target</span>
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Conditions are optimal across all sectors. Production targets set for the 2026 season cycle.
                        </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button onClick={() => onTabChange('reports-exports')} className={glass.btnPrimary}>
                            View Report
                        </button>
                        <button onClick={() => onTabChange('harvests')} className={glass.btnSecondary}>
                            History
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Apiaries */}
            {apiaries.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Your Apiaries</h3>
                            <p className="text-[12px] text-gray-500">{apiaries.length} active locations</p>
                        </div>
                        <button
                            onClick={() => onTabChange('orchard-mapper')}
                            className={cn(glass.btnSecondary, "text-[12px]")}
                        >
                            View Map <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {apiaries.slice(0, 6).map((apiary, i) => {
                            const health = Math.floor(Math.random() * 25) + 75;
                            const spark = Array.from({ length: 12 }, () => Math.random() * 40 + 60);
                            return (
                                <motion.div
                                    key={apiary.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.04 }}
                                    onClick={() => onTabChange('orchard-mapper')}
                                    className={cn(glass.card, "p-5 cursor-pointer")}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="min-w-0">
                                            <h4 className="text-base font-semibold text-gray-900 truncate">{apiary.name}</h4>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <MapPin className="w-3 h-3 text-[#FF6B00]" />
                                                <p className="text-[11px] text-gray-500 truncate">
                                                    {apiary.location_name || 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-medium px-2 py-0.5 rounded-md flex-shrink-0",
                                            health >= 85 ? "bg-emerald-500/10 text-emerald-400" : "bg-[#FF6B00]/10 text-[#FF6B00]"
                                        )}>
                                            {health}%
                                        </span>
                                    </div>

                                    <div className="h-12 mb-3 px-2 bg-white/[0.02] rounded-lg border border-white/5 flex items-center">
                                        <SparkLine data={spark} color={health >= 85 ? '#10b981' : '#FF6B00'} height={32} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { l: 'Hives', v: Math.floor(Math.random() * 80 + 100) },
                                            { l: 'Flow', v: `${Math.floor(Math.random() * 20 + 75)}%` },
                                            { l: 'Temp', v: (Math.random() * 2 + 32).toFixed(1) },
                                        ].map((s, idx) => (
                                            <div key={idx} className="bg-white py-2 px-2.5 rounded-lg border border-white/5 text-center">
                                                <p className="text-sm font-semibold text-gray-900 tabular-nums leading-none mb-0.5">{s.v}</p>
                                                <p className="text-[9px] text-white/25">{s.l}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-center gap-3 pt-8 border-t border-white/5">
                <img src={Logo} alt="BeeYield" className="h-6 w-auto grayscale opacity-10" />
                <span className="text-[11px] text-white/10">BeeYield Platform © 2026</span>
            </div>
        </motion.div>
    );
};

export default DashboardHomeView;
