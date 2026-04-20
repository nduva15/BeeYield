import React from 'react';
import { Clock, Activity, Zap, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, Wifi, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import beeyieldService, { SensorAlert } from '@/services/beeyieldService';
import { format } from 'date-fns';

interface ContinuousMonitorProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

type EventLevel = 'ok' | 'warn' | 'critical';

interface HiveEvent {
    id: string | number;
    hive: string;
    event: string;
    level: EventLevel;
    time: string;
}

const levelConfig: Record<EventLevel, { color: string; bg: string; icon: React.ElementType; dot: string; glow: string }> = {
    ok: { color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/10', icon: CheckCircle2, dot: 'bg-[#1B9157]', glow: 'shadow-emerald-500/20' },
    warn: { color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]/10', icon: AlertTriangle, dot: 'bg-[#F4D03F]', glow: 'shadow-amber-500/20' },
    critical: { color: 'text-red-500', bg: 'bg-red-500/5', icon: ShieldAlert, dot: 'bg-red-500 animate-pulse', glow: 'shadow-red-500/40' },
};

const heartbeatNodes: never[] = [];

const ContinuousMonitor: React.FC<ContinuousMonitorProps> = ({ onTabChange }) => {
    const [events, setEvents] = React.useState<HiveEvent[]>([]);
    const [tick, setTick] = React.useState(0);
    const [liveTime, setLiveTime] = React.useState(new Date());

    React.useEffect(() => {
        const fetchInitialEvents = async () => {
            try {
                const alerts = await beeyieldService.getSensorAlerts(false, 15);
                const mappedAlerts: HiveEvent[] = alerts.map(a => ({
                    id: a.id,
                    hive: a.hive_id.slice(0, 6).toUpperCase(),
                    event: a.message,
                    level: a.severity === 'info' ? 'ok' : a.severity === 'warning' ? 'warn' : 'critical',
                    time: format(new Date(a.created_at), 'HH:mm:ss')
                }));
                setEvents(mappedAlerts);
            } catch (err) {
                console.error("Initial fetch error:", err);
            }
        };
        fetchInitialEvents();

        const timer = setInterval(() => {
            setLiveTime(new Date());
            setTick(t => t + 1);
        }, 3000);

        const refresh = setInterval(async () => {
            try {
                const alerts = await beeyieldService.getSensorAlerts(false, 15);
                const mappedAlerts: HiveEvent[] = alerts.map(a => ({
                    id: a.id,
                    hive: a.hive_id.slice(0, 6).toUpperCase(),
                    event: a.message,
                    level: a.severity === 'info' ? 'ok' : a.severity === 'warning' ? 'warn' : 'critical',
                    time: format(new Date(a.created_at), 'HH:mm:ss')
                }));
                setEvents(mappedAlerts);
            } catch (err) {
                // ignore transient polling failures
            }
        }, 15_000);

        return () => {
            clearInterval(timer);
            clearInterval(refresh);
        };
    }, []);

    const criticalCount = events.filter(e => e.level === 'critical').length;
    const warnCount = events.filter(e => e.level === 'warn').length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            <PageHeader
                icon={Wifi}
                label="Live Feed"
                title={<>Continuous <span className="text-[#F4D03F]">Monitor</span></>}
                subtitle="24/7 heartbeat stream with acoustic analysis and thermal vitals."
                actions={
                    <div className="flex items-center gap-3">
                        {criticalCount > 0 && (
                            <div className={cn(glass.badge, "bg-red-50 text-red-500 border-red-100 py-1.5")}>
                                <ShieldAlert className="w-3.5 h-3.5 mr-2" />
                                {criticalCount} Critical
                            </div>
                        )}
                        {warnCount > 0 && (
                            <div className={cn(glass.badge, "bg-[#F4D03F]/10 text-foreground border-border/ py-1.5")}>
                                <AlertTriangle className="w-3.5 h-3.5 mr-2 text-[#F4D03F]" />
                                {warnCount} Warnings
                            </div>
                        )}
                        <div className={cn(glass.badge, "bg-muted/20 border-border/ py-1.5")}>
                            <div className="w-2 h-2 rounded-full bg-[#1B9157] mr-2 animate-pulse" />
                            <span className="text-xs font-bold text-foreground tabular-nums">
                                {liveTime.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                }
            />

            {/* Heartbeat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {heartbeatNodes.length === 0 ? (
                    <div className={cn(glass.card, "p-8 text-center lg:col-span-3 bg-muted/ border-border/")}>
                        <p className="text-sm font-bold text-foreground">No heartbeat telemetry yet</p>
                        <p className="text-xs font-medium text-muted-foreground mt-1">
                            This view requires live sensor streams (temperature, acoustic, etc.). Connect devices to enable the heartbeat grid.
                        </p>
                    </div>
                ) : heartbeatNodes.map((node, nodeIdx) => {
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
                                "p-5 space-y-4 group",
                                node.status === 'critical' ? 'border-red-200' : node.status === 'warn' ? 'border-amber-200' : ''
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-2.5 h-2.5 rounded-full", cfg.dot)} />
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{node.id}</p>
                                        <p className="text-[10px] text-muted-foreground/70 tabular-nums">{node.temp}°C</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[8px] font-black border",
                                    node.status === 'ok' ? 'bg-emerald-50 text-[#1B9157] border-emerald-100' :
                                    node.status === 'warn' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-500 border-red-100'
                                )}>
                                    {node.status === 'ok' ? 'Nominal' : node.status === 'warn' ? 'Warning' : 'Critical'}
                                </div>
                            </div>

                            <div className="flex items-end gap-1 h-12">
                                {shifted.map((val, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${val}%` }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        className={cn(
                                            "flex-1 rounded-full opacity-20 group-hover:opacity-50 transition-opacity",
                                            node.status === 'ok' ? 'bg-[#1B9157]' :
                                                node.status === 'warn' ? 'bg-[#F4D03F]' : 'bg-red-500'
                                        )}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Live Event Feed */}
            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                <div className="px-5 py-4 border-b border-border/ flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/5 border border-border/ flex items-center justify-center">
                            <Zap className="w-4 h-4 text-[#F4D03F]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Activity Ledger</h3>
                            <p className="text-[10px] text-muted-foreground text-[9px]">Real-time Events</p>
                        </div>
                    </div>
                    <div className={cn(glass.badge, "bg-muted/20 border-border/ py-1.5")}>
                        {events.length} events
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto divide-y divide-[#F4D03F]/5 thin-scrollbar">
                    <AnimatePresence initial={false}>
                        {events.map((event) => {
                            const cfg = levelConfig[event.level];
                            const Icon = cfg.icon;
                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -10, height: 0 }}
                                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors group"
                                >
                                    <div className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot)} />
                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", cfg.bg, "border-transparent")}>
                                        <Icon className={cn("w-4 h-4", cfg.color)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">{event.hive}</span>
                                            <span className="text-[10px] text-gray-300 tabular-nums">{event.time}</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground truncate">{event.event}</p>
                                    </div>
                                    <button
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="View event details"
                                        title="View event details"
                                        type="button"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Summary Banner */}
            <div className={cn(glass.card, "p-8 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] text-white border-transparent relative overflow-hidden group")}>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F4D03F]/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-[#F4D03F] flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(244,208,63,0.3)]">
                        <Info className="w-8 h-8 text-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h5 className="text-xl font-bold tracking-tight">Monitoring <span className="text-[#F4D03F]">Intelligence</span></h5>
                        <p className="text-sm font-medium opacity-80 leading-relaxed pl-6 border-l-2 border-border/">
                            Alerts and status summaries will appear here once real heartbeat telemetry is connected.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(244, 208, 63, 0.1); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default ContinuousMonitor;

