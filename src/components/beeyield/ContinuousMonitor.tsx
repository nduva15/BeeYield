import React from 'react';
import { Clock, Activity, Zap, AlertTriangle, CheckCircle2, Thermometer, Hexagon, ArrowRight, ShieldAlert, Wifi, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface ContinuousMonitorProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

type EventLevel = 'ok' | 'warn' | 'critical';

interface HiveEvent {
    id: number;
    hive: string;
    event: string;
    level: EventLevel;
    time: string;
}

const initialEvents: HiveEvent[] = [
    { id: 1, hive: 'HV-001', event: 'Temperature nominal — 35.1°C', level: 'ok', time: '14:55:02' },
    { id: 2, hive: 'HV-002', event: 'Swarm risk — temp spike to 37.8°C', level: 'warn', time: '14:54:47' },
    { id: 3, hive: 'HV-003', event: 'Cluster loss warning — temp dropped to 28.4°C', level: 'critical', time: '14:53:11' },
    { id: 4, hive: 'HV-004', event: 'Heartbeat confirmed — all vitals nominal', level: 'ok', time: '14:52:30' },
    { id: 5, hive: 'HV-005', event: 'Humidity normalized — 63%', level: 'ok', time: '14:51:09' },
    { id: 6, hive: 'HV-006', event: 'High external wind detected — activity reduced', level: 'warn', time: '14:50:22' },
    { id: 7, hive: 'HV-001', event: 'Queen-present acoustic signature confirmed', level: 'ok', time: '14:49:55' },
    { id: 8, hive: 'HV-002', event: 'Flight traffic above hourly average', level: 'ok', time: '14:48:10' },
];

const levelConfig: Record<EventLevel, { color: string; bg: string; icon: React.ElementType; dot: string; glow: string }> = {
    ok: { color: 'text-emerald-500', bg: 'bg-emerald-500/5', icon: CheckCircle2, dot: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
    warn: { color: 'text-amber-500', bg: 'bg-amber-500/5', icon: AlertTriangle, dot: 'bg-amber-500', glow: 'shadow-amber-500/20' },
    critical: { color: 'text-red-500', bg: 'bg-red-500/5', icon: ShieldAlert, dot: 'bg-red-500 animate-pulse', glow: 'shadow-red-500/40' },
};

const heartbeatNodes = [
    { id: 'HV-001', status: 'ok', temp: 35.1, pattern: [70, 80, 72, 85, 68, 90, 75, 88, 71, 82] },
    { id: 'HV-002', status: 'warn', temp: 37.8, pattern: [60, 95, 45, 100, 55, 98, 50, 99, 62, 97] },
    { id: 'HV-003', status: 'critical', temp: 28.4, pattern: [20, 25, 18, 30, 22, 15, 28, 12, 20, 18] },
    { id: 'HV-004', status: 'ok', temp: 34.8, pattern: [65, 78, 70, 82, 60, 77, 73, 80, 66, 79] },
    { id: 'HV-005', status: 'ok', temp: 35.0, pattern: [68, 75, 72, 80, 65, 78, 70, 82, 67, 76] },
    { id: 'HV-006', status: 'ok', temp: 36.1, pattern: [72, 82, 74, 86, 70, 84, 76, 88, 73, 83] },
];

const ContinuousMonitor: React.FC<ContinuousMonitorProps> = ({ onTabChange }) => {
    const [events, setEvents] = React.useState<HiveEvent[]>(initialEvents);
    const [tick, setTick] = React.useState(0);
    const [liveTime, setLiveTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => {
            setLiveTime(new Date());
            setTick(t => t + 1);
            if (Math.random() > 0.6) {
                const nodes = ['HV-001', 'HV-004', 'HV-005'];
                const msgs = ['Heartbeat confirmed', 'Temp stable at 35.0°C', 'Activity nominal'];
                const node = nodes[Math.floor(Math.random() * nodes.length)];
                const msg = msgs[Math.floor(Math.random() * msgs.length)];
                setEvents(prev => [{
                    id: Date.now(),
                    hive: node,
                    event: msg,
                    level: 'ok',
                    time: new Date().toLocaleTimeString('en-GB'),
                }, ...prev.slice(0, 19)]);
            }
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const criticalCount = events.filter(e => e.level === 'critical').length;
    const warnCount = events.filter(e => e.level === 'warn').length;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-12 pb-20 min-h-screen")}
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-border/50 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 mb-2')}>
                        <Wifi className="w-4 h-4 mr-2" />
                        Live Synchronous Monitoring v5.0
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Continuous <span className="text-honey">Monitor</span>
                    </h1>
                    <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70")}>
                        24/7 Hive Heartbeat Stream · Acoustic Analysis · Thermal Vitals
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <AnimatePresence mode="popLayout">
                        {criticalCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className={cn(glass.badge, "bg-red-500 text-gray-900 border-transparent px-4 py-2 shadow-lg shadow-red-500/20 animate-pulse")}
                            >
                                <ShieldAlert className="w-4 h-4 mr-2" /> {criticalCount} Critical
                            </motion.div>
                        )}
                        {warnCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className={cn(glass.badge, "bg-amber-500 text-gray-900 border-transparent px-4 py-2 shadow-lg shadow-amber-500/20")}
                            >
                                <AlertTriangle className="w-4 h-4 mr-2" /> {warnCount} Warnings
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className={cn(glass.badge, "bg-white/40 border-honey/30 px-6 py-2 shadow-inner group")}>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <Clock className="w-4 h-4 text-honey mr-2 group-hover:rotate-12 transition-transform" />
                        <span className="text-honey font-bold text-sm tracking-widest tabular-nums">
                            {liveTime.toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Heartbeat Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <Activity className="w-5 h-5 text-honey" />
                    <h3 className={cn(glass.microLabel, "font-bold opacity-60 uppercase tracking-[0.3em]")}>Fleet Heartbeat</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {heartbeatNodes.map((node, nodeIdx) => {
                        const cfg = levelConfig[node.status as EventLevel];
                        const shifted = [...node.pattern.slice(tick % node.pattern.length), ...node.pattern.slice(0, tick % node.pattern.length)];
                        return (
                            <motion.div
                                key={node.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: nodeIdx * 0.05 }}
                                className={cn(
                                    glass.card,
                                    "p-8 space-y-6 shadow-xl hover:shadow-2xl transition-all border-honey/10 relative overflow-hidden group",
                                    node.status === 'critical' ? 'border-red-500/30' : node.status === 'warn' ? 'border-amber-500/30' : ''
                                )}
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-honey/5 rounded-full blur-xl pointer-events-none group-hover:bg-honey/10 transition-colors" />

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-3 h-3 rounded-full shadow-lg", cfg.dot, cfg.glow)} />
                                        <div>
                                            <p className={cn(glass.sectionTitle, "text-xl normal-case italic opacity-80")}>{node.id}</p>
                                            <p className={cn(glass.microLabel, "opacity-40 font-bold mt-1")}>{node.temp}°C · VITALS</p>
                                        </div>
                                    </div>
                                    <div className={cn(glass.badge, "px-3 py-1", cfg.bg, cfg.color, "border-transparent text-[10px] font-bold")}>
                                        {node.status === 'ok' ? 'NOMINAL' : node.status === 'warn' ? 'WARNING' : 'CRITICAL'}
                                    </div>
                                </div>

                                {/* Live visualizer */}
                                <div className="flex items-end gap-1 h-16 relative z-10">
                                    {shifted.map((val, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${val}%` }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            className={cn(
                                                "flex-1 rounded-full opacity-30 group-hover:opacity-60 transition-opacity",
                                                node.status === 'ok' ? 'bg-emerald-500' :
                                                    node.status === 'warn' ? 'bg-amber-500' : 'bg-red-500'
                                            )}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Live Event Feed */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/50 pb-6 gap-4 px-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-honey/10 flex items-center justify-center border border-honey/20 shadow-sm">
                            <Zap className="w-6 h-6 text-honey" />
                        </div>
                        <div>
                            <h3 className={cn(glass.sectionTitle, "text-3xl normal-case")}>Activity <span className="text-honey">Ledger</span></h3>
                            <p className={cn(glass.microLabel, "normal-case italic opacity-60 mt-1")}>Recursive real-time event indexing</p>
                        </div>
                    </div>
                    <div className={cn(glass.badge, "bg-white/40 border-border px-4 py-2 shadow-sm font-bold")}>
                        {events.length} EVENTS_BUFFERED
                    </div>
                </div>

                <div className={cn(glass.card, "p-0 shadow-2xl overflow-hidden border-border/50 relative")}>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-honey/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />

                    <div className="max-h-[550px] overflow-y-auto divide-y divide-border/20 custom-scrollbar relative z-10">
                        <AnimatePresence initial={false}>
                            {events.map((event, idx) => {
                                const cfg = levelConfig[event.level];
                                const Icon = cfg.icon;
                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -20, height: 0 }}
                                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className={cn("flex items-start gap-6 px-10 py-6 hover:bg-white/40:bg-gray-100 transition-all group overflow-hidden")}
                                    >
                                        <div className={cn("w-1.5 h-12 rounded-full shrink-0 group-hover:scale-y-110 transition-transform", cfg.dot, "shadow-sm")} />
                                        <div className={cn("w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center border border-border shadow-sm group-hover:border-honey transition-colors")}>
                                            <Icon className={cn("w-6 h-6", cfg.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-4 mb-2">
                                                <span className={cn(glass.microLabel, "text-sm font-bold opacity-80")}>{event.hive}</span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <span className={cn(glass.microLabel, "opacity-40 tabular-nums")}>{event.time}</span>
                                            </div>
                                            <p className={cn("text-base font-medium leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity", cfg.color)}>
                                                {event.event}
                                            </p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                            <button className={cn(glass.btnSecondary, "h-10 px-4 text-[10px] uppercase font-bold")}>View Details</button>
                                            <button className={cn(glass.btnSecondary, "h-10 w-10 p-0 flex items-center justify-center")}><ArrowRight className="w-4 h-4" /></button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* AI Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={cn(glass.card, "p-8 shadow-xl bg-gradient-to-br from-honey/10 to-transparent border-honey/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group")}
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-honey/15 rounded-full blur-[80px] pointer-events-none group-hover:bg-honey/25 transition-colors" />
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/60 flex items-center justify-center shrink-0 border border-honey shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <Info className="w-8 h-8 text-honey" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h5 className={cn(glass.sectionTitle, "text-2xl normal-case mb-2")}>Continuous Monitoring Insight</h5>
                    <p className="text-sm italic font-medium opacity-80 leading-relaxed max-w-4xl text-foreground">
                        Our recursive monitoring engine analyzes biometric signals across the entire fleet in real-time.
                        Thermal anomalies in HV-003 and HV-002 require immediate inspection to prevent colony loss or unintended swarming.
                        Overall fleet stability remains at 94.2% nominal uptime.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ContinuousMonitor;
