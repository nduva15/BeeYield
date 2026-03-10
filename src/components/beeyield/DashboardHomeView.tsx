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
    Microspectrum,
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
    color = '#FBBE24',
    height = 40
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
    ok: { label: 'Online', color: 'text-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
    warn: { label: 'Alert', color: 'text-[#FBBE24]', bg: 'bg-[#FBBE24]/10', dot: 'bg-[#FBBE24]' },
    error: { label: 'Error', color: 'text-red-500', bg: 'bg-red-500/10', dot: 'bg-red-500' },
    pending: { label: 'Connecting...', color: 'text-foreground/30', bg: 'bg-white/5', dot: 'bg-white/30' },
};

const typeIcon: Record<ActivityItem['type'], React.ElementType> = {
    sync: Activity,
    alert: AlertTriangle,
    harvest: Hexagon,
    inspection: CheckCircle2,
    system: Cpu,
};

/* ─── Status Grid Matrix ─── */
const HiveStatusMatrix: React.FC = () => {
    const weeks = 12;
    const days = 7;
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const matrix = React.useMemo(() =>
        Array.from({ length: weeks }, () =>
            Array.from({ length: days }, () => {
                const r = Math.random();
                if (r > 0.90) return 'error';
                if (r > 0.82) return 'warn';
                return 'ok';
            })
        ), []
    );

    const cellColors = {
        ok: 'bg-emerald-500/60 hover:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
        warn: 'bg-[#FBBE24]/60 hover:bg-[#FBBE24] shadow-[0_0_10px_rgba(251,191,36,0.2)]',
        error: 'bg-red-500/60 hover:bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
    };

    return (
        <div className="flex gap-3">
            <div className="flex flex-col gap-2 pr-6 border-r border-white/5 mr-1">
                {dayLabels.map((d, i) => (
                    <span key={i} className="text-[10px] font-black text-foreground/20 w-5 h-5 flex items-center justify-center italic">{d}</span>
                ))}
            </div>
            {matrix.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-2">
                    {week.map((status, di) => (
                        <motion.div
                            key={di}
                            className={cn("w-5 h-5 rounded-[6px] transition-all duration-300 cursor-default hover:scale-150 hover:z-10", cellColors[status])}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: wi * 0.02 + di * 0.005, duration: 0.2 }}
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
            className="flex items-center gap-8 group"
        >
            <span className="text-[12px] font-black text-foreground/40 uppercase tracking-[0.2em] italic w-48 flex-shrink-0 truncate group-hover:text-honey transition-all">{label}</span>
            <div className="flex-1 h-3.5 bg-black/10 dark:bg-black/60 rounded-full relative overflow-hidden shadow-inner p-[1.5px] border border-white/5">
                <motion.div
                    className="absolute left-0 top-0 h-full rounded-full shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 2.5, ease: "easeOut", delay: 0.5 + index * 0.1 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </motion.div>
            </div>
            <span className="text-[16px] font-black text-foreground italic tabular-nums w-28 text-right group-hover:scale-110 group-hover:text-honey transition-all">{value} kg</span>
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
            <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-honey/[0.04] rounded-full blur-[150px] -mr-40 -mt-20 pointer-events-none" />

            {/* Header */}
            <PageHeader
                icon={LayoutGrid}
                label="System Overview"
                title={<>{greeting}, <span className="text-honey">Producer</span></>}
                subtitle="All systems are running smoothly. Your hives are being monitored in real-time."
                actions={
                    <div className="flex gap-8 relative z-10">
                        <button
                            onClick={() => onTabChange('ai-assistant')}
                            className={cn(glass.btnSecondary, "h-24 px-12 rounded-[3.5rem] bg-white dark:bg-black/40 border-white/5 shadow-4xl flex items-center gap-8 font-black italic uppercase tracking-[0.3em] text-lg hover:text-honey hover:scale-105 transition-all duration-700")}
                        >
                            <Bot className="w-10 h-10 text-honey animate-pulse" />
                            BeeYield AI
                        </button>
                        <button
                            onClick={() => onTabChange('harvests')}
                            className={cn(glass.btnPrimary, "h-24 bg-honey text-black shadow-4xl rounded-[3.5rem] px-16 font-black italic text-2xl transition-all uppercase flex items-center justify-center gap-10 group/btn pl-24")}
                        >
                            <Plus className="w-10 h-10 group-hover/btn:rotate-90 transition-transform duration-1000" />
                            New Harvest
                        </button>
                    </div>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                <GlassStatCard
                    label="Active Hives"
                    value={stats?.total_hives?.toString() || "..."}
                    icon={Hexagon}
                    index={0}
                />
                <GlassStatCard
                    label="Total Honey (kg)"
                    value={stats?.total_honey_kg?.toLocaleString() || "..."}
                    icon={TrendingUp}
                    index={1}
                    color="text-emerald-500"
                />
                <GlassStatCard
                    label="System Health"
                    value="Stable"
                    icon={ShieldCheck}
                    index={2}
                    color="text-honey"
                />
                <GlassStatCard
                    label="Active Locations"
                    value={apiaries.length.toString()}
                    icon={MapPin}
                    index={3}
                    color="text-honey"
                />
            </div>

            {/* Activity & Health Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 relative z-10">

                {/* Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                    className="xl:col-span-8 space-y-12"
                >
                    <div className={cn(glass.card, "p-0 overflow-hidden bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl rounded-[5rem] relative group")}>
                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-honey/[0.04] rounded-full blur-[100px] pointer-events-none -mr-40 -mt-20" />

                        <div className="p-16 border-b border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                            <div className="flex items-center gap-10">
                                <div className="w-20 h-20 rounded-[2.5rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-4xl">
                                    <Activity className="w-10 h-10 text-honey" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none">Activity <span className="text-honey">Feed</span></h3>
                                    <div className="flex items-center gap-4 px-6 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-2xl skew-x-[-15deg]">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse skew-x-[15deg]" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.3em] skew-x-[15deg] italic text-emerald-500">Live Syncing</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onTabChange('harvests')}
                                className={cn(glass.btnSecondary, "h-20 px-12 rounded-[2.5rem] flex items-center gap-6 font-black italic uppercase tracking-[0.2em] text-lg hover:text-honey transition-all")}
                            >
                                View History <ArrowRight className="w-8 h-8 group-hover:translate-x-4 transition-transform" />
                            </button>
                        </div>

                        <div className="divide-y divide-white/5 max-h-[700px] overflow-y-auto custom-scrollbar-modern relative z-10">
                            <AnimatePresence mode="popLayout">
                                {realActivities.map((item, i) => {
                                    const cfg = statusConfig[item.status];
                                    const ItemIcon = typeIcon[item.type];
                                    const isSelected = selectedActivity === item.id;
                                    return (
                                        <motion.button
                                            key={item.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.08, duration: 1 }}
                                            onClick={() => setSelectedActivity(isSelected ? null : item.id)}
                                            className={cn(
                                                "w-full flex items-center gap-12 px-16 py-10 text-left transition-all duration-1000 group/item relative overflow-hidden",
                                                isSelected ? "bg-honey/[0.08]" : "hover:bg-honey/[0.03]"
                                            )}
                                        >
                                            <div className={cn("w-20 h-20 rounded-[2.5rem] flex items-center justify-center flex-shrink-0 shadow-4xl border border-white/5", cfg.bg)}>
                                                <ItemIcon className={cn("w-10 h-10", cfg.color)} />
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div className="flex items-center gap-8">
                                                    <p className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none">{item.title}</p>
                                                    {item.status !== 'ok' && (
                                                        <div className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] skew-x-[-15deg]", cfg.bg, cfg.color)}>
                                                            <span className="skew-x-[15deg] block">{cfg.label}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xl font-black text-foreground/20 italic tracking-tight uppercase leading-none border-l-4 border-honey/10 pl-8">{item.subtitle}</p>
                                            </div>

                                            <div className="flex flex-col items-end gap-6">
                                                {item.value && (
                                                    <span className={cn("text-3xl font-black italic tabular-nums tracking-tighter px-8 py-3 rounded-[1.5rem]", cfg.bg, cfg.color)}>{item.value}</span>
                                                )}
                                                <span className="text-[12px] font-black text-foreground/10 uppercase italic">{item.time}</span>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                {/* Health & Grid */}
                <div className="xl:col-span-4 space-y-16">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={cn(glass.card, "p-12 bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl rounded-[4rem] relative group")}
                    >
                        <div className="flex items-center justify-between mb-12">
                            <div className="space-y-3">
                                <h3 className="text-5xl font-black italic text-foreground tracking-tighter uppercase leading-none">Daily <span className="text-honey">Status</span></h3>
                                <p className="text-[11px] font-black opacity-30 uppercase tracking-[0.4em] italic">Last 12 Weeks</p>
                            </div>
                            <div className="w-18 h-18 rounded-[2rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-4xl">
                                <Network className="w-8 h-8 text-honey" />
                            </div>
                        </div>
                        <div className="p-12 bg-black/10 dark:bg-black/40 rounded-[3.5rem] border border-white/5 flex justify-center shadow-inner relative overflow-hidden">
                            <HiveStatusMatrix />
                        </div>
                        <div className="flex flex-wrap items-center gap-10 mt-12 pt-12 border-t border-white/5">
                            {[
                                { label: 'HEALTHY', color: 'bg-emerald-500' },
                                { label: 'CHECK', color: 'bg-[#FBBE24]' },
                                { label: 'OFFLINE', color: 'bg-red-500' },
                            ].map(l => (
                                <div key={l.label} className="flex items-center gap-4">
                                    <div className={cn("w-3.5 h-3.5 rounded-full animate-pulse shadow-4xl", l.color)} />
                                    <span className="text-[11px] font-black opacity-30 uppercase tracking-[0.2em] italic">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className={cn(glass.card, "p-12 bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl rounded-[4rem] group")}
                    >
                        <div className="flex items-center justify-between mb-12">
                            <div className="space-y-3">
                                <h3 className="text-5xl font-black italic text-foreground tracking-tighter uppercase leading-none">Environment</h3>
                                <p className="text-[11px] font-black opacity-30 uppercase tracking-[0.4em] italic">Real-time Sensors</p>
                            </div>
                            <Waves className="w-10 h-10 text-honey opacity-30" />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            {[
                                { icon: Thermometer, label: 'TEMP', value: '34.2°C', color: '#EF4444', bg: 'bg-red-500/10' },
                                { icon: Droplets, label: 'HUMIDITY', value: '68%', color: '#3B82F6', bg: 'bg-blue-500/10' },
                                { icon: Activity, label: 'ACTIVITY', value: 'Optimal', color: '#10B981', bg: 'bg-emerald-500/10' },
                                { icon: Cpu, label: 'STATUS', value: 'Healthy', color: '#FBBE24', bg: 'bg-honey/10' },
                            ].map((s, i) => (
                                <div key={s.label} className="bg-white/40 dark:bg-black/40 p-10 rounded-[2.5rem] border border-white/5 hover:border-honey/60 transition-all duration-700">
                                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-4xl", s.bg)}>
                                        <s.icon className="w-10 h-10" style={{ color: s.color }} />
                                    </div>
                                    <p className="text-4xl font-black italic text-foreground tracking-tighter tabular-nums leading-none mb-3">{s.value}</p>
                                    <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em] italic">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Forecast Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.5 }}
                className={cn(glass.card, "p-0 overflow-hidden shadow-4xl grid grid-cols-1 lg:grid-cols-12 relative z-10 border-honey/20 rounded-[6rem] bg-black dark:bg-[#080808]")}
            >
                <div className="lg:col-span-7 p-20 border-b lg:border-b-0 lg:border-r border-white/10 bg-white/5 relative">
                    <div className="flex items-center justify-between mb-24 relative z-10">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-6 px-8 py-3 bg-honey/10 rounded-full border border-honey/30 shadow-4xl skew-x-[-15deg]">
                                <Sparkles className="w-6 h-6 text-honey animate-pulse skew-x-[15deg]" />
                                <span className="text-[12px] font-black uppercase tracking-[0.5em] skew-x-[15deg] italic text-honey">Market Estimates</span>
                            </div>
                            <h3 className="text-7xl font-black italic text-white tracking-tighter uppercase leading-none">Harvest <span className="text-honey">Forecast</span></h3>
                        </div>
                        <div className="text-right space-y-4">
                            <div className="text-9xl font-black text-white italic tracking-tighter tabular-nums leading-none">742.4<span className="text-4xl opacity-20 ml-4">MT</span></div>
                            <span className="text-honey font-black tracking-[0.4em] uppercase block italic opacity-60 text-[14px]">Predicted for 2026</span>
                        </div>
                    </div>
                    <div className="space-y-12 relative z-10">
                        {[
                            { label: 'Nakuru North Sector', value: 248, max: 300, color: '#FBBE24' },
                            { label: 'Mau Forest Preserve', value: 195, max: 300, color: '#10B981' },
                            { label: 'Maasai Mara Hub', value: 172, max: 300, color: '#A78BFA' },
                            { label: 'Aberdare Ridge Deploy', value: 127, max: 300, color: '#F1916D' },
                        ].map((f, i) => (
                            <YieldForecastBar key={f.label} {...f} index={i} />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-5 p-20 flex flex-col justify-between bg-honey/[0.05] relative group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-honey/[0.08] rounded-full blur-[150px] -mr-60 -mt-60 pointer-events-none group-hover:scale-125 transition-transform duration-[3000ms]" />

                    <div className="space-y-16 relative z-10">
                        <div className="flex items-center gap-8">
                            <div className="px-10 py-4 bg-emerald-500/10 text-emerald-500 text-[12px] font-black tracking-[0.5em] uppercase rounded-full border border-emerald-500/20 shadow-4xl skew-x-[-15deg]">
                                <span className="skew-x-[15deg] block">+12.8% Growth</span>
                            </div>
                            <Zap className="w-10 h-10 text-honey" />
                        </div>
                        <h3 className="text-8xl font-black italic text-white tracking-tighter uppercase leading-[0.85]">
                            A Great Season <br />
                            <span className="text-honey">Ahead.</span>
                        </h3>
                        <p className="text-3xl font-black text-white/40 italic leading-relaxed border-l-8 border-honey/40 pl-16 uppercase tracking-tight">
                            Current data shows exceptional productivity across all of your locations. You're on track for a record-breaking harvest!
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-20 relative z-10">
                        <button
                            onClick={() => onTabChange('reports')}
                            className={cn(glass.btnPrimary, "h-24 bg-honey text-black shadow-4xl rounded-[3.5rem] font-black italic text-2xl transition-all uppercase flex items-center justify-center gap-10")}
                        >
                            View Report
                        </button>
                        <button
                            onClick={() => onTabChange('harvests')}
                            className={cn(glass.btnSecondary, "h-24 px-12 rounded-[3.5rem] bg-white dark:bg-black/60 border-white/10 shadow-4xl flex items-center justify-center gap-6 font-black italic uppercase tracking-[0.2em] text-xl hover:text-honey transition-all")}
                        >
                            History
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Locations */}
            {apiaries.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.8 }}
                    className="space-y-16"
                >
                    <div className="flex items-center justify-between border-l-8 border-honey/40 pl-16 group">
                        <div className="space-y-4">
                            <h3 className="text-7xl font-black italic text-foreground tracking-tighter uppercase leading-none">My <span className="text-honey">Locations</span></h3>
                            <p className="text-[14px] font-black opacity-30 italic uppercase tracking-[0.6em]">{apiaries.length} Locations Online</p>
                        </div>
                        <button
                            onClick={() => onTabChange('orchard-mapper')}
                            className={cn(glass.btnSecondary, "h-20 px-14 rounded-[2.5rem] flex items-center gap-10 font-black italic uppercase tracking-[0.3em] text-xl hover:text-honey transition-all")}
                        >
                            View Map <ChevronRight className="w-10 h-10 text-honey" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-14">
                        {apiaries.slice(0, 6).map((apiary, i) => {
                            const health = Math.floor(Math.random() * 25) + 75;
                            const spark = Array.from({ length: 12 }, () => Math.random() * 40 + 60);
                            return (
                                <motion.div
                                    key={apiary.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1 + i * 0.1, duration: 1 }}
                                    onClick={() => onTabChange('orchard-mapper')}
                                    className={cn(glass.card, "p-12 text-left hover:border-honey/60 group relative overflow-hidden cursor-pointer shadow-4xl transition-all duration-1000 bg-white/80 dark:bg-[#0D0D0D]/90 backdrop-blur-3xl rounded-[5rem] border-white/5")}
                                >
                                    <div className="flex items-start justify-between mb-12 relative z-10">
                                        <div className="space-y-6">
                                            <h4 className="text-5xl font-black italic text-foreground tracking-tighter uppercase leading-none group-hover:text-honey transition-colors truncate max-w-[300px]">{apiary.name}</h4>
                                            <div className="flex items-center gap-6">
                                                <MapPin className="w-8 h-8 text-honey opacity-40" />
                                                <p className="text-[14px] font-black text-foreground/40 uppercase tracking-[0.3em] italic">
                                                    {apiary.location_name?.toUpperCase() || 'Location unspecified'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-8 py-3 rounded-full text-[12px] font-black uppercase tracking-[0.4em] skew-x-[-15deg] shadow-4xl",
                                            health >= 85 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-[#FBBE24]/10 text-[#FBBE24] border border-[#FBBE24]/20"
                                        )}>
                                            <span className="skew-x-[15deg] block flex items-center gap-4">
                                                <div className={cn("w-3 h-3 rounded-full animate-pulse shadow-4xl", health >= 85 ? "bg-emerald-500" : "bg-honey")} />
                                                {health}% Health
                                            </span>
                                        </div>
                                    </div>

                                    <div className="h-24 mb-16 px-8 relative z-10 bg-black/10 dark:bg-black/40 rounded-[3rem] py-6 shadow-inner border border-white/5 group-hover:border-honey/20 transition-all duration-1000 flex items-center">
                                        <SparkLine data={spark} color={health >= 85 ? '#10B981' : '#FBBE24'} height={60} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-8 relative z-10">
                                        {[
                                            { l: 'Hives', v: Math.floor(Math.random() * 80 + 100), icon: Hexagon },
                                            { l: 'Flow', v: `${Math.floor(Math.random() * 20 + 75)}%`, icon: Sparkles },
                                            { l: 'Activity', v: (Math.random() * 2 + 7).toFixed(1), icon: Activity },
                                        ].map((s, idx) => (
                                            <div key={idx} className="bg-black/10 p-8 rounded-[3rem] text-center border border-white/5 group-hover:border-honey/30 transition-all shadow-4xl group/s">
                                                <s.icon className="w-8 h-8 mx-auto mb-6 text-honey/30 group-hover/s:text-honey group-hover/s:scale-125 transition-all" />
                                                <p className="text-4xl font-black italic text-foreground tabular-nums tracking-tighter leading-none mb-3">{s.v}</p>
                                                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] italic">{s.l}</p>
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
            <div className="relative z-10 flex flex-col items-center gap-12 pt-32 border-t border-white/10">
                <img src={Logo} alt="BeeYield" className="h-20 w-auto grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 hover:scale-110" />
                <div className="space-y-6 text-center">
                    <p className="text-[16px] font-black text-foreground/10 italic uppercase tracking-[1em] hover:text-honey transition-colors">
                        BeeYield Hub v5.2.0
                    </p>
                    <div className="flex items-center justify-center gap-12 opacity-10">
                        <Lock className="w-8 h-8 text-honey" />
                        <p className="text-[12px] font-black uppercase tracking-[0.8em] italic">© 2026 BeeYield Technologies · All Systems Active</p>
                        <Fingerprint className="w-8 h-8 text-honey" />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 4s infinite linear; }
                .custom-scrollbar-modern::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar-modern::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-modern::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default DashboardHomeView;
