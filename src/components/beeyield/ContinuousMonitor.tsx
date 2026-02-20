import React, { useState, useEffect } from 'react';
import { Clock, Activity, Zap, AlertTriangle, CheckCircle2, Thermometer, Hexagon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const levelConfig: Record<EventLevel, { color: string; bg: string; icon: React.ElementType; dot: string }> = {
    ok: { color: 'text-[#10b981]', bg: 'bg-[#10b981]/5', icon: CheckCircle2, dot: 'bg-[#10b981]' },
    warn: { color: 'text-[#b45309]', bg: 'bg-[#facc15]/10', icon: AlertTriangle, dot: 'bg-[#facc15]' },
    critical: { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle, dot: 'bg-red-500 animate-pulse' },
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
    const [events, setEvents] = useState<HiveEvent[]>(initialEvents);
    const [tick, setTick] = useState(0);
    const [liveTime, setLiveTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setLiveTime(new Date());
            setTick(t => t + 1);
            // Occasionally add fake live events
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
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center">
                            <Activity className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Continuous <span className="text-[#10b981]">Monitor</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        24/7 Hive Heartbeat Stream
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {criticalCount > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500 border-2 border-red-700">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-white font-black text-[10px] uppercase tracking-widest">{criticalCount} Critical</span>
                        </div>
                    )}
                    {warnCount > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#facc15] border-2 border-[#b45309]">
                            <span className="text-[#064e3b] font-black text-[10px] uppercase tracking-widest">{warnCount} Warnings</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-5 py-2 bg-[#064e3b] border-4 border-[#064e3b]">
                        <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
                        <Clock className="w-4 h-4 text-[#facc15]" />
                        <span className="text-[#facc15] font-black text-xs tracking-widest tabular-nums">
                            {liveTime.toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Heartbeat Grid */}
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#064e3b]/40">Fleet Heartbeat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {heartbeatNodes.map(node => {
                        const dotColor = node.status === 'ok' ? 'bg-[#10b981]' : node.status === 'warn' ? 'bg-[#facc15] animate-pulse' : 'bg-red-500 animate-pulse';
                        const borderColor = node.status === 'ok' ? 'border-[#064e3b]/20' : node.status === 'warn' ? 'border-[#facc15]' : 'border-red-500';
                        const barColor = node.status === 'ok' ? 'bg-[#10b981]' : node.status === 'warn' ? 'bg-[#facc15]' : 'bg-red-400';
                        // Shift pattern on each tick for live feel
                        const shifted = [...node.pattern.slice(tick % node.pattern.length), ...node.pattern.slice(0, tick % node.pattern.length)];
                        return (
                            <div key={node.id} className={cn("border-4 bg-white p-6 space-y-4", borderColor)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2.5 h-2.5 rounded-full", dotColor)} />
                                        <div>
                                            <p className="text-xs font-black uppercase text-[#064e3b]">{node.id}</p>
                                            <p className="text-[9px] font-bold uppercase text-[#064e3b]/40">{node.temp}°C</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-1 text-[9px] font-black uppercase tracking-widest",
                                        node.status === 'ok' ? "bg-[#10b981]/10 text-[#10b981]" :
                                            node.status === 'warn' ? "bg-[#facc15]/30 text-[#b45309]" :
                                                "bg-red-50 text-red-600"
                                    )}>
                                        {node.status === 'ok' ? 'Nominal' : node.status === 'warn' ? 'Warning' : 'Critical'}
                                    </span>
                                </div>
                                {/* Live bar waveform */}
                                <div className="flex items-end gap-0.5 h-12">
                                    {shifted.map((val, i) => (
                                        <div
                                            key={i}
                                            style={{ height: `${val}%` }}
                                            className={cn("flex-1 transition-all duration-700", barColor)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Live Event Feed */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b-4 border-[#064e3b] pb-4">
                    <div className="flex items-center gap-4">
                        <Zap className="w-5 h-5 text-[#10b981]" />
                        <h3 className="text-3xl font-black uppercase tracking-tighter">Activity Ledger</h3>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/30">{events.length} events</span>
                </div>
                <div className="border-4 border-[#064e3b] divide-y-2 divide-[#064e3b]/5 max-h-[480px] overflow-y-auto shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                    {events.map(event => {
                        const cfg = levelConfig[event.level];
                        const Icon = cfg.icon;
                        return (
                            <div key={event.id} className={cn("flex items-start gap-4 px-6 py-4", cfg.bg)}>
                                <div className={cn("w-1.5 h-full min-h-[24px] rounded-full shrink-0 self-stretch mt-1", cfg.dot)} style={{ width: '3px' }} />
                                <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", cfg.color)} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-0.5">
                                        <span className="text-[10px] font-black text-[#064e3b] uppercase tracking-wider">{event.hive}</span>
                                        <span className="text-[9px] font-bold text-[#064e3b]/30 tabular-nums">{event.time}</span>
                                    </div>
                                    <p className={cn("text-xs font-bold", cfg.color)}>{event.event}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ContinuousMonitor;
