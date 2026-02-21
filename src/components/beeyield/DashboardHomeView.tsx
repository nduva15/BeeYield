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
    Users,
    Calendar,
    BarChart3,
    ChevronRight,
    Plus
} from 'lucide-react';
import beeyieldService, { IoTDevice, SensorReading, Apiary } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface DashboardHomeViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    apiaries: Apiary[];
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

/* ─── Fleet Health Gauge ─── */
const FleetHealthGauge: React.FC<{ score: number }> = ({ score }) => {
    const normalizedScore = Math.min(Math.max(score, 0), 1000);
    const percentage = normalizedScore / 1000;
    const angle = percentage * 180; // Semi-circle
    const radius = 120;
    const cx = 140;
    const cy = 140;

    // Create arc path
    const startAngle = Math.PI;
    const endAngle = Math.PI - (angle * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = angle > 180 ? 1 : 0;

    // Color based on score
    const getColor = () => {
        if (percentage < 0.33) return '#FF6B6B';
        if (percentage < 0.66) return '#FBBF24';
        return '#10B981';
    };

    return (
        <div className="relative flex flex-col items-center">
            <svg width="280" height="160" viewBox="0 0 280 160">
                {/* Background arc */}
                <path
                    d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="18"
                    strokeLinecap="round"
                />
                {/* Score arc */}
                <motion.path
                    d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth="18"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* Score segments - Red/Yellow/Green indicators */}
                {[0, 60, 120].map((pos, i) => {
                    const a = Math.PI - (pos * Math.PI) / 180;
                    const outerR = radius + 24;
                    return (
                        <circle
                            key={i}
                            cx={cx + outerR * Math.cos(a)}
                            cy={cy + outerR * Math.sin(a)}
                            r="3"
                            fill={['#FF6B6B', '#FBBF24', '#10B981'][i]}
                            opacity={0.4}
                        />
                    );
                })}
            </svg>
            {/* Center score display */}
            <div className="absolute top-[60px] flex flex-col items-center">
                <motion.span
                    className="text-5xl font-black text-slate-900 tabular-nums tracking-tighter"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    {normalizedScore}
                </motion.span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Health Score</span>
            </div>
        </div>
    );
};

/* ─── Telemetry Dot Matrix ─── */
const TelemetryDotMatrix: React.FC = () => {
    // Generate 12 weeks × 7 days of mock telemetry data
    const weeks = 12;
    const days = 7;
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const matrix = React.useMemo(() =>
        Array.from({ length: weeks }, () =>
            Array.from({ length: days }, () => Math.random() > 0.12) // ~88% success rate
        ), []
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400">Daily Sensor Pings</p>
                <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                        <span>Online</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                        <span>Offline</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-1.5">
                {/* Day labels */}
                <div className="flex flex-col gap-1.5 pr-1">
                    {dayLabels.map((d, i) => (
                        <span key={i} className="text-[8px] font-bold text-slate-300 w-3 h-3 flex items-center justify-center">{d}</span>
                    ))}
                </div>
                {/* Matrix grid */}
                {matrix.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1.5">
                        {week.map((ok, di) => (
                            <motion.div
                                key={di}
                                className={cn(
                                    "w-3 h-3 rounded-sm transition-colors",
                                    ok ? "bg-emerald-500/80 hover:bg-emerald-500" : "bg-red-400/60 hover:bg-red-400"
                                )}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: wi * 0.03 + di * 0.01, duration: 0.3 }}
                                title={ok ? 'Sensor online' : 'Sensor offline'}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ─── Avatar Group ─── */
const AvatarGroup: React.FC<{ avatars: string[]; max?: number }> = ({ avatars, max = 4 }) => {
    const visible = avatars.slice(0, max);
    const overflow = avatars.length - max;

    return (
        <div className="flex items-center -space-x-2.5">
            {visible.map((src, i) => (
                <img
                    key={i}
                    src={src}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover"
                    alt={`Team member ${i + 1}`}
                />
            ))}
            {overflow > 0 && (
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                    +{overflow}
                </div>
            )}
        </div>
    );
};

/* ─── Deployment Card ─── */
const DeploymentCard: React.FC<{
    orchard: Apiary;
    onAction: (tab: string) => void;
}> = ({ orchard, onAction }) => {
    const sparkData = [
        { v: 20 }, { v: 35 }, { v: 50 }, { v: 48 }, { v: 70 }, { v: 65 }, { v: 80 },
    ];

    const teamAvatars = [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80',
        'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80',
    ];

    const healthScore = Math.floor(Math.random() * 30) + 70; // 70-100

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer group"
            onClick={() => onAction('orchard-mapper')}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{orchard.name}</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Almond · Nonpareil
                    </p>
                </div>
                <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold",
                    healthScore >= 80 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                    {healthScore}% Health
                </div>
            </div>

            {/* Spark Chart */}
            <div className="h-16 mb-5">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={sparkData}>
                        <Line
                            type="monotone"
                            dataKey="v"
                            stroke="#10B981"
                            strokeWidth={2.5}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { label: 'Hives', val: '120' },
                    { label: 'Bloom', val: '85%' },
                    { label: 'Activity', val: '9.2' },
                ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-2xl px-3 py-2.5 text-center">
                        <p className="text-lg font-bold text-slate-900">{s.val}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Footer: Team Avatars + Action */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <AvatarGroup avatars={teamAvatars} max={4} />
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                    View Details
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>
        </motion.div>
    );
};


/* ─── Main Dashboard Home ─── */
const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ apiaries, onTabChange }) => {
    const healthScore = 782;

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Good Afternoon, Timothy <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                        Here's your apiary overview for today
                    </p>
                </div>

                {/* Pill Tabs */}
                <div className="flex bg-slate-50 rounded-full p-1.5 border border-slate-100 gap-1">
                    {['Overview', 'Analytics', 'Reports'].map((tab, i) => (
                        <button
                            key={tab}
                            className={cn(
                                "px-5 py-2 rounded-full text-[12px] font-bold transition-all",
                                i === 0
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Hero Row: Health Gauge + Quick Stats + Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fleet Health Gauge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center"
                >
                    <FleetHealthGauge score={healthScore} />
                    <div className="flex items-center gap-6 mt-2">
                        {[
                            { label: 'Sensors Online', val: '24/26', color: 'text-emerald-500' },
                            { label: 'Alerts Active', val: '2', color: 'text-amber-500' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <p className={cn("text-lg font-bold", s.color)}>{s.val}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Portfolio Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)] flex flex-col justify-between"
                >
                    <p className="text-[11px] font-bold text-slate-400 mb-4">Portfolio Summary</p>
                    <div className="space-y-5">
                        {[
                            { label: 'Total Acreage', val: '482 ac', icon: LayoutGrid, trend: '+12%' },
                            { label: 'Total Hives', val: '840', icon: Hexagon, trend: '+8%' },
                            { label: 'Mean Activity', val: '8.4/10', icon: Zap, trend: '+5%' },
                            { label: 'Yield Confidence', val: '92%', icon: Target, trend: '+3%' },
                        ].map(stat => (
                            <div key={stat.label} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-[#CEF144]/20 transition-colors">
                                        <stat.icon className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{stat.val}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{stat.label}</p>
                                    </div>
                                </div>
                                <span className="text-[11px] font-bold text-emerald-500">{stat.trend}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Telemetry Dot Matrix */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)]"
                >
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[11px] font-bold text-slate-400">Telemetry History</p>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full">88% Uptime</span>
                    </div>
                    <TelemetryDotMatrix />
                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div>
                            <p className="text-lg font-bold text-slate-900">24</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Active Sensors</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900">2</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Need Check</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900">5m</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Ping Rate</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Yield Prediction Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-slate-900 rounded-[32px] p-10 text-white overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#CEF144] opacity-5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-[#CEF144]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight">Season Yield Forecast</h3>
                                <p className="text-[11px] text-white/40 font-medium">Based on current bloom and activity data</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-6xl font-black tabular-nums tracking-tighter">742.4</span>
                            <span className="text-lg font-bold text-[#CEF144]">metric tons</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">+12.8% vs last year</span>
                            <span className="text-[11px] text-white/30 font-medium">Confidence: 718.2 – 765.9 MT</span>
                        </div>
                    </div>
                    <Button
                        onClick={async () => {
                            toast.loading("Generating season report...");
                            try {
                                const result = await (beeyieldService as any).generateSeasonReport({ apiary_id: 'apiary_123' });
                                toast.success("Season report ready", { description: "Report saved to your records." });
                            } catch (error: any) {
                                toast.error("Report failed", { description: error.message });
                            }
                        }}
                        className="bg-[#CEF144] text-slate-900 hover:bg-[#c5e83a] rounded-full px-8 h-12 font-bold text-[12px] shadow-lg shadow-[#CEF144]/20"
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Generate Full Report
                    </Button>
                </div>
            </motion.div>

            {/* Active Deployments */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Active Deployments</h2>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{apiaries.length} orchards under management</p>
                    </div>
                    <Button
                        variant="outline"
                        className="rounded-full px-5 h-10 text-[11px] font-bold border-slate-200 hover:bg-slate-50"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Orchard
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {apiaries.map(orchard => (
                        <DeploymentCard key={orchard.id} orchard={orchard} onAction={onTabChange} />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default DashboardHomeView;
