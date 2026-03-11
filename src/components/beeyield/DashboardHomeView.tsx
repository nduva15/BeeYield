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
    ok: { label: 'Online', color: 'text-white', bg: 'bg-white/10', dot: 'bg-white' },
    warn: { label: 'Alert', color: 'text-[#FF6B00]', bg: 'bg-[#FF6B00]/10', dot: 'bg-[#FF6B00]' },
    error: { label: 'Error', color: 'text-[#FF6B00]', bg: 'bg-[#FF6B00]/10', dot: 'bg-[#FF6B00]' },
    pending: { label: 'Connecting...', color: 'text-white/30', bg: 'bg-white/5', dot: 'bg-white/30' },
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
                if (r > 0.90) return 'citrus';
                if (r > 0.70) return 'orange';
                return 'off_white';
            })
        ), []
    );

    const cellColors = {
        citrus: 'bg-[#FF6B00] shadow-[0_0_10px_rgba(255,107,0,0.4)]',
        orange: 'bg-[#FF6B00]/40',
        off_white: 'bg-white/10'
    };

    return (
        <div className="flex gap-2">
            <div className="flex flex-col gap-2 pr-4 border-r border-white/10">
                {dayLabels.map((d, i) => (
                    <span key={i} className="text-[9px] font-black text-white/20 w-4 h-4 flex items-center justify-center italic tracking-tighter">{d}</span>
                ))}
            </div>
            {matrix.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-2">
                    {week.map((status, di) => (
                        <motion.div
                            key={di}
                            className={cn("w-4 h-4 rounded-[2px] transition-all duration-300 cursor-default hover:scale-150 hover:z-10", cellColors[status as keyof typeof cellColors])}
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
            className="flex items-center gap-6 group"
        >
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest w-40 flex-shrink-0 truncate group-hover:text-[#FF6B00] transition-colors">{label}</span>
            <div className="flex-1 h-3 bg-white/5 rounded-none relative overflow-hidden border border-white/10">
                <motion.div
                    className="absolute left-0 top-0 h-full shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                    style={{ backgroundColor: '#FF6B00' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 2, ease: "easeOut", delay: index * 0.1 }}
                />
            </div>
            <span className="text-[14px] font-mono font-black text-white tabular-nums w-24 text-right">{value} KG</span>
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
            <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-[#FF6B00]/[0.02] rounded-full blur-[150px] -mr-40 -mt-20 pointer-events-none" />

            {/* Header */}
            <PageHeader
                icon={LayoutGrid}
                label="Command Center"
                title={<>{greeting}, <span className="text-[#FF6B00]">Producer</span></>}
                subtitle="Centralized telemetry hub. Monitoring global apiary operations strictly and securely."
                actions={
                    <div className="flex gap-6 relative z-10">
                        <button
                            onClick={() => onTabChange('ai-assistant')}
                            className={cn(glass.btnSecondary, "px-8 bg-white/5 hover:text-[#FF6B00] transition-colors")}
                        >
                            <Bot className="w-6 h-6 text-[#FF6B00]" />
                            Intelligence
                        </button>
                        <button
                            onClick={() => onTabChange('harvests')}
                            className={glass.btnPrimary}
                        >
                            <Plus className="w-6 h-6" />
                            Initiate Harvest
                        </button>
                    </div>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <GlassStatCard
                    label="Connected Fleet"
                    value={stats?.total_hives?.toString() || "..."}
                    icon={Hexagon}
                    index={0}
                />
                <GlassStatCard
                    label="Yield Velocity (KG)"
                    value={stats?.total_honey_kg?.toLocaleString() || "..."}
                    icon={TrendingUp}
                    index={1}
                    color="text-white"
                />
                <GlassStatCard
                    label="Protocol Status"
                    value="Secure"
                    icon={ShieldCheck}
                    index={2}
                    color="text-[#FF6B00]"
                />
                <GlassStatCard
                    label="Deployment Sectors"
                    value={apiaries.length.toString()}
                    icon={MapPin}
                    index={3}
                    color="text-[#FF6B00]"
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
                    <div className={cn(glass.card, "p-0 overflow-hidden bg-[#0A0A0A] border-white/20 rounded-[3rem] relative group")}>
                        <div className="p-12 border-b border-white/10 bg-white/5 backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                            <div className="flex items-center gap-8">
                                <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center border border-[#FF6B00]/20">
                                    <Activity className="w-8 h-8 text-[#FF6B00]" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase relative">Activity <span className="text-[#FF6B00]">Feed</span></h3>
                                    <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#FF6B00]">Telemetry Live</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onTabChange('harvests')}
                                className={cn(glass.btnSecondary, "h-14 px-8 rounded-2xl flex items-center gap-4 text-sm")}
                            >
                                History <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
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
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => setSelectedActivity(isSelected ? null : item.id)}
                                            className={cn(
                                                "w-full flex items-center gap-8 px-12 py-8 text-left transition-all duration-300 group/item relative border-b border-white/5",
                                                isSelected ? "bg-[#FF6B00]/5" : "hover:bg-white/5"
                                            )}
                                        >
                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10", cfg.bg)}>
                                                <ItemIcon className={cn("w-7 h-7", cfg.color)} />
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center gap-4">
                                                    <p className="text-2xl font-black text-white tracking-tighter uppercase">{item.title}</p>
                                                    {item.status !== 'ok' && (
                                                        <div className={cn("px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest", cfg.bg, cfg.color)}>
                                                            {cfg.label}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-white/30 uppercase tracking-tight">{item.subtitle}</p>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                {item.value && (
                                                    <span className={cn("text-xl font-mono font-black tracking-tighter px-4 py-1 rounded-lg", cfg.bg, cfg.color)}>{item.value}</span>
                                                )}
                                                <span className="text-[10px] font-bold text-white/10 uppercase">{item.time}</span>
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
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card, "p-10 bg-[#0A0A0A] border-white/20 rounded-[3rem] group")}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Fleet <span className="text-[#FF6B00]">Integrity</span></h3>
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">Historical Data Grid</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center border border-[#FF6B00]/20">
                                <Network className="w-6 h-6 text-[#FF6B00]" />
                            </div>
                        </div>
                        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 flex justify-center shadow-inner relative overflow-hidden">
                            <HiveStatusMatrix />
                        </div>
                        <div className="flex flex-wrap items-center gap-8 mt-10 pt-8 border-t border-white/5">
                            {[
                                { label: 'PEAK', color: 'bg-white' },
                                { label: 'NOMINAL', color: 'bg-[#FF6B00]' },
                                { label: 'OFFLINE', color: 'bg-white/10' },
                            ].map(l => (
                                <div key={l.label} className="flex items-center gap-3">
                                    <div className={cn("w-3 h-3 rounded-[2px] shadow-[0_0_8px_rgba(255,255,255,0.1)]", l.color)} />
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card, "p-10 bg-[#0A0A0A] border-white/20 rounded-[3rem] group")}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Sensors</h3>
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Critical Biometrics</p>
                            </div>
                            <Waves className="w-8 h-8 text-[#FF6B00] opacity-30" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Thermometer, label: 'TEMP', value: '34.2°C', color: '#FF6B00', bg: 'bg-[#FF6B00]/10' },
                                { icon: Droplets, label: 'HUMIDITY', value: '68%', color: '#FFFFFF', bg: 'bg-white/10' },
                                { icon: Activity, label: 'VIBRATION', value: 'Optimal', color: '#FFFFFF', bg: 'bg-white/10' },
                                { icon: Cpu, label: 'CPU', value: '98%', color: '#FF6B00', bg: 'bg-[#FF6B00]/10' },
                            ].map((s, i) => (
                                <div key={s.label} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-[#FF6B00]/40 transition-all duration-300">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", s.bg)}>
                                        <s.icon className="w-6 h-6" style={{ color: s.color }} />
                                    </div>
                                    <p className="text-2xl font-mono font-black text-white tracking-tighter leading-none mb-2">{s.value}</p>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Forecast Banner */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-0 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 relative z-10 border-[#FF6B00]/30 rounded-[3rem] bg-[#000000]")}
            >
                <div className="lg:col-span-7 p-14 border-b lg:border-b-0 lg:border-r border-white/10 bg-white/5 relative">
                    <div className="flex items-center justify-between mb-16 relative z-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-4 px-6 py-2 bg-[#FF6B00]/10 rounded-full border border-[#FF6B00]/30">
                                <Sparkles className="w-5 h-5 text-[#FF6B00] animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00]">Market Estimates</span>
                            </div>
                            <h3 className="text-6xl font-black text-white tracking-tighter uppercase">Harvest <span className="text-[#FF6B00]">Forecast</span></h3>
                        </div>
                        <div className="text-right">
                            <div className="text-8xl font-mono font-black text-white tracking-tighter tabular-nums leading-none">742.4<span className="text-2xl opacity-20 ml-2">MT</span></div>
                            <span className="text-[#FF6B00] font-black tracking-widest uppercase block text-[10px] mt-2">Predicted for 2026</span>
                        </div>
                    </div>
                    <div className="space-y-8 relative z-10">
                        {[
                            { label: 'Nakuru North Sector', value: 248, max: 300, color: '#FF6B00' },
                            { label: 'Mau Forest Preserve', value: 195, max: 300, color: '#FFFFFF' },
                            { label: 'Maasai Mara Hub', value: 172, max: 300, color: '#FF6B00' },
                            { label: 'Aberdare Ridge Deploy', value: 127, max: 300, color: '#FFFFFF' },
                        ].map((f, i) => (
                            <YieldForecastBar key={f.label} {...f} index={i} />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-5 p-14 flex flex-col justify-between bg-[#FF6B00]/[0.03] relative group">
                    <div className="space-y-12 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="px-6 py-2 bg-white/10 text-white text-[10px] font-black tracking-widest uppercase rounded-full border border-white/10">
                                +12.8% GROWTH
                            </div>
                            <Zap className="w-8 h-8 text-[#FF6B00]" />
                        </div>
                        <h3 className="text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                            Peak Season <br />
                            <span className="text-[#FF6B00]">Target.</span>
                        </h3>
                        <p className="text-2xl font-bold text-white/40 leading-tight border-l-4 border-[#FF6B00]/40 pl-10 uppercase tracking-tight">
                            Telemetry indicates optimal conditions across all operational sectors. Production quota set for 2026.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16 relative z-10">
                        <button
                            onClick={() => onTabChange('reports')}
                            className={glass.btnPrimary}
                        >
                            View Report
                        </button>
                        <button
                            onClick={() => onTabChange('harvests')}
                            className={glass.btnSecondary}
                        >
                            History
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Locations */}
            {apiaries.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <div className="flex items-center justify-between border-l-4 border-[#FF6B00]/40 pl-8 group">
                        <div className="space-y-2">
                            <h3 className="text-6xl font-black text-white tracking-tighter uppercase">Deployment <span className="text-[#FF6B00]">Sectors</span></h3>
                            <p className="text-[12px] font-black text-white/20 uppercase tracking-widest">{apiaries.length} Active Operational Nuclei</p>
                        </div>
                        <button
                            onClick={() => onTabChange('orchard-mapper')}
                            className={cn(glass.btnSecondary, "px-8")}
                        >
                            Global Logistics <ChevronRight className="w-6 h-6 text-[#FF6B00]" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {apiaries.slice(0, 6).map((apiary, i) => {
                            const health = Math.floor(Math.random() * 25) + 75;
                            const spark = Array.from({ length: 12 }, () => Math.random() * 40 + 60);
                            return (
                                <motion.div
                                    key={apiary.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => onTabChange('orchard-mapper')}
                                    className={cn(glass.card, "p-10 bg-[#0A0A0A] hover:border-[#FF6B00]/40 transition-all duration-300 cursor-pointer")}
                                >
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="space-y-4">
                                            <h4 className="text-4xl font-black text-white tracking-tighter uppercase leading-none group-hover:text-[#FF6B00] transition-colors truncate max-w-[280px]">{apiary.name}</h4>
                                            <div className="flex items-center gap-4">
                                                <MapPin className="w-5 h-5 text-[#FF6B00]" />
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                                    {apiary.location_name?.toUpperCase() || 'SEC-UNKNOWN'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10",
                                            health >= 85 ? "bg-white/5 text-white" : "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20"
                                        )}>
                                            {health}% NOMINAL
                                        </div>
                                    </div>

                                    <div className="h-20 mb-10 px-6 bg-white/5 rounded-2xl border border-white/5 group-hover:border-[#FF6B00]/20 transition-all flex items-center">
                                        <SparkLine data={spark} color={health >= 85 ? '#FFFFFF' : '#FF6B00'} height={40} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { l: 'UNITS', v: Math.floor(Math.random() * 80 + 100), icon: Hexagon },
                                            { l: 'FLOW', v: `${Math.floor(Math.random() * 20 + 75)}%`, icon: Sparkles },
                                            { l: 'TEMP', v: (Math.random() * 2 + 32).toFixed(1), icon: Thermometer },
                                        ].map((s, idx) => (
                                            <div key={idx} className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                                                <p className="text-2xl font-mono font-black text-white tracking-tighter leading-none mb-1">{s.v}</p>
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{s.l}</p>
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
            <div className="relative z-10 flex flex-col items-center gap-8 pt-24 border-t border-white/10">
                <img src={Logo} alt="BeeYield" className="h-14 w-auto grayscale opacity-10 hover:opacity-100 transition-all" />
                <div className="space-y-4 text-center">
                    <p className="text-sm font-black text-white/5 uppercase tracking-[1em] hover:text-[#FF6B00] transition-colors">
                        BeeYield Command Hub v6.0.0
                    </p>
                    <div className="flex items-center justify-center gap-10 opacity-5">
                        <Lock className="w-5 h-5 text-white" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.5em]">Encryption AES-256 Enabled · All Protocols Active</p>
                        <Fingerprint className="w-5 h-5 text-white" />
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
