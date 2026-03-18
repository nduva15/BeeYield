import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Droplet, Flame, Zap, AlertTriangle, TrendingUp, Send,
    Bot, ThermometerSun, Activity, Search, RefreshCw, ChevronRight, Database, Layers, ShieldCheck,
    LayoutList, ChevronDown, Gauge, List, Bell, Banknote, FileText, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { meterService, Meter, MeterEvent, Building } from '@/services/meterService';
import MetersAlarms from './MetersAlarms';
import MetersPayments from './MetersPayments';
import MetersSettings from './MetersSettings';
import MetersMeasurements from './MetersMeasurements';
import MetersListWater from './MetersListWater';
import MetersListHeat from './MetersListHeat';
import MetersListEnergy from './MetersListEnergy';
import MetersListOther from './MetersListOther';
import ReportsExportsView from './ReportsExportsView';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { glass } from './GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

interface MetersViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
    activeSubTab?: string;
}

const MetersView: React.FC<MetersViewProps> = ({ onTabChange, activeSubTab = 'meters-dashboard' }) => {
    const [meters, setMeters] = React.useState<Meter[]>([]);
    const [events, setEvents] = React.useState<MeterEvent[]>([]);
    const [buildings, setBuildings] = React.useState<Building[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [usageFilter, setUsageFilter] = React.useState<'Water' | 'Heat' | 'Energy'>('Water');
    const [aiMessage, setAiMessage] = React.useState('');
    const [chatMessages, setChatMessages] = React.useState([
        { role: 'assistant', content: 'Checking system status... How can I help you today?' },
    ]);

    const LS_KEY = React.useMemo(() => 'beeyield_meters_dashboard_cache_v1', []);
    const readCache = React.useCallback((): { meters: Meter[]; events: MeterEvent[]; buildings: Building[] } | null => {
        try {
            const raw = globalThis.localStorage?.getItem(LS_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            const m = Array.isArray(parsed?.meters) ? (parsed.meters as Meter[]) : [];
            const e = Array.isArray(parsed?.events) ? (parsed.events as MeterEvent[]) : [];
            const b = Array.isArray(parsed?.buildings) ? (parsed.buildings as Building[]) : [];
            return { meters: m, events: e, buildings: b };
        } catch {
            return null;
        }
    }, [LS_KEY]);

    const writeCache = React.useCallback((next: { meters: Meter[]; events: MeterEvent[]; buildings: Building[] }) => {
        try {
            globalThis.localStorage?.setItem(LS_KEY, JSON.stringify(next));
        } catch {
            // ignore
        }
    }, [LS_KEY]);

    React.useEffect(() => {
        const loadDashboardData = async () => {
            if (activeSubTab !== 'meters-dashboard') return;
            setLoading(true);
            setError(null);
            try {
                const [mData, eData, bData] = await Promise.all([
                    meterService.getMeters(),
                    meterService.getEvents(),
                    meterService.getBuildings()
                ]);
                setMeters(mData);
                setEvents(eData);
                setBuildings(bData);
                writeCache({ meters: mData || [], events: eData || [], buildings: bData || [] });
            } catch (error) {
                console.error('Failed to load meter dashboard', error);
                const cached = readCache();
                if (cached && (cached.meters.length > 0 || cached.events.length > 0 || cached.buildings.length > 0)) {
                    setMeters(cached.meters);
                    setEvents(cached.events);
                    setBuildings(cached.buildings);
                    toast.info('Loaded meters dashboard from this device');
                } else {
                    setError('Connecting to sensors... Data may be incomplete until you reconnect.');
                    toast.error('Failed to load dashboard data');
                }
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, [activeSubTab, readCache, writeCache]);

    const getUsageByMedium = (medium: string) => {
        const mediumMeters = meters.filter(m => m.meter_type === medium);
        const total = mediumMeters.reduce((acc, current) => acc + (current.last_reading_value || 0), 0);
        const unit = mediumMeters[0]?.last_reading_unit || (medium === 'Energy' ? 'kWh' : medium === 'Heat' ? 'GJ' : 'm³');
        return { total: total.toFixed(1), unit };
    };

    const trendData = React.useMemo(() => {
        const mediumMeters = meters.filter((m) => m.meter_type === usageFilter);
        const points = mediumMeters
            .map((m) => {
                const ts = m.last_reading_at ? new Date(m.last_reading_at).getTime() : NaN;
                const v = typeof m.last_reading_value === 'number' ? m.last_reading_value : 0;
                return Number.isFinite(ts) ? { ts, v } : null;
            })
            .filter(Boolean) as { ts: number; v: number }[];

        if (points.length < 2) return [];

        // Aggregate by day (YYYY-MM-DD) to create a small trend series.
        const byDay = new Map<string, number>();
        for (const p of points) {
            const d = new Date(p.ts);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            byDay.set(key, (byDay.get(key) || 0) + p.v);
        }

        const rows = Array.from(byDay.entries())
            .sort((a, b) => (a[0] < b[0] ? -1 : 1))
            .slice(-14) // last ~2 weeks of datapoints
            .map(([key, value]) => ({
                day: key.slice(5), // MM-DD
                value: Number(value.toFixed(2)),
            }));
        return rows;
    }, [meters, usageFilter]);

    const activeAlarmsCount = events.filter(e => !e.is_resolved).length;

    const handleSendMessage = () => {
        const msg = aiMessage.trim();
        if (!msg) return;
        setChatMessages([...chatMessages, { role: 'user', content: msg }]);
        setAiMessage('');
        toast.info('Opening BeeYield AI…');
        onTabChange('assistant', `Meters: ${msg}`);
    };

    if (activeSubTab === 'meters-alarms') return <MetersAlarms />;
    if (activeSubTab === 'meters-payments') return <MetersPayments onTabChange={onTabChange} />;
    if (activeSubTab === 'meters-reports') return <ReportsExportsView />;
    if (activeSubTab === 'meters-settings') return <MetersSettings />;
    if (activeSubTab === 'meters-water' || activeSubTab === 'meters-list') return <MetersListWater onTabChange={onTabChange} />;
    if (activeSubTab === 'meters-heat') return <MetersListHeat onTabChange={onTabChange} />;
    if (activeSubTab === 'meters-energy') return <MetersListEnergy onTabChange={onTabChange} />;
    if (activeSubTab === 'meters-other') return <MetersListOther onTabChange={onTabChange} />;

    if ([
        'meters-charts',
        'meters-consumption',
        'meters-comparisons',
        'meters-heatmap',
        'meters-import',
        'meters-measurements'
    ].includes(activeSubTab)) {
        return <MetersMeasurements onTabChange={onTabChange} activeSubTab={activeSubTab} />;
    }

    if (loading && activeSubTab === 'meters-dashboard') {
        return (
            <BeeYieldPageShell className="space-y-0">
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Activity className="w-8 h-8 animate-spin text-[#F4D03F]" />
                <span className="text-sm font-semibold text-gray-600 italic">Updating data...</span>
                </div>
            </BeeYieldPageShell>
        );
    }

    return (
        <BeeYieldPageShell className="p-0 md:p-0 -m-4 md:-m-6 space-y-0 pb-0">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn("p-4 lg:p-6 space-y-6 pb-20")}
            >
            <BeeYieldPageHeader
                icon={Activity}
                label="Apiary readings"
                title={<>Apiary <span className="text-[#F4D03F]">Meters</span></>}
                subtitle="Live readings from your devices."
                onBack={() => onTabChange('home')}
                actions={
                    <div className="flex items-center gap-3">
                         <div className="hidden sm:flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-xl border border-white/40 shadow-sm backdrop-blur-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                            <span className="text-xs font-semibold text-gray-500">Live</span>
                        </div>

                        <div className="relative group/nav">
                            <Button
                                className={cn(glass.btnPrimary, "h-9 px-4 text-sm font-semibold gap-2")}
                            >
                                <LayoutList className="w-3.5 h-3.5" />
                                Navigation <ChevronDown className="w-3 h-3 transition-transform group-hover/nav:rotate-180" />
                            </Button>
                            
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white/90 backdrop-blur-xl border border-[#F4D03F]/20 rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all z-50 overflow-hidden">
                                {[
                                    { id: 'meters-dashboard', label: 'Dashboard', icon: Gauge },
                                    { id: 'meters-list', label: 'Meter list', icon: List },
                                    { id: 'meters-alarms', label: 'Alarms/Events', icon: Bell },
                                    { id: 'meters-payments', label: 'Payments', icon: Banknote },
                                    { id: 'meters-reports', label: 'Reports', icon: FileText },
                                    { id: 'meters-settings', label: 'Settings', icon: Settings }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onTabChange(item.id)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F4D03F]/10 transition-colors border-b border-[#F4D03F]/5 last:border-none group/item"
                                    >
                                        <item.icon className="w-4 h-4 text-gray-400 group-hover/item:text-[#F4D03F] transition-colors" />
                                        <span className="text-[10px] font-black text-gray-600">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                }
            />

            {error && (
                <div className={cn(glass.card, "p-4 border border-red-200 bg-red-50/60")}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="text-[10px] font-black text-red-600">Offline mode</div>
                            <div className="text-sm font-semibold text-slate-700 mt-1">{error}</div>
                        </div>
                        <Button
                            variant="outline"
                            className="h-10 rounded-xl text-[10px] font-black"
                            onClick={() => onTabChange('meters-dashboard')}
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            )}

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {(['Water', 'Heat', 'Energy'] as const).map((medium, i) => {
                    const { total, unit } = getUsageByMedium(medium);
                    const Icon = medium === 'Water' ? Droplet : medium === 'Heat' ? ThermometerSun : Zap;
                    const alertCount = meters.filter(m => m.meter_type === medium && m.has_alarm).length;
                    
                    const colors = {
                        Water: "text-blue-500",
                        Heat: "text-[#F4D03F]",
                        Energy: "text-[#1B9157]"
                    };

                    return (
                        <div key={medium} className={cn(glass.card, "p-4 space-y-3 bg-white/40 border-white/20 shadow-xl group hover:shadow-2xl transition-all")}>
                            <div className="flex justify-between items-start">
                                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border border-white/40 bg-white shadow-sm group-hover:scale-105 transition-transform", colors[medium])}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <Badge className={cn("text-[8px] px-1.5 py-0.5 rounded-md border-none font-bold", alertCount > 0 ? "bg-red-500/10 text-red-500" : "bg-[#1B9157]/10 text-[#1B9157]")}>
                                    {alertCount > 0 ? `${alertCount} Alarms` : 'Optimized'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-gray-400">{medium} LOAD</p>
                                <p className="text-lg font-black text-[#1A1A1A] tracking-tighter tabular-nums">
                                     {total} <span className="text-[9px] font-medium opacity-30 tracking-normal font-sans">{unit}</span>
                                </p>
                            </div>
                        </div>
                    );
                })}

                <div className={cn(glass.card, "p-4 space-y-3 border-red-500/20 bg-red-500/[0.05] shadow-xl group hover:shadow-2xl transition-all")}>
                    <div className="flex justify-between items-start">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-red-500/20 bg-white shadow-sm text-red-500 group-hover:scale-105 transition-transform">
                            <AlertTriangle className="w-4 h-4 animate-pulse" />
                        </div>
                        <Badge className="bg-red-500 text-white border-none px-1.5 py-0.5 rounded-md font-bold text-[8px] animate-pulse">Action</Badge>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-red-500/60">Alerts</p>
                        <p className="text-lg font-black text-red-600 tracking-tighter tabular-nums">{activeAlarmsCount}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Chart */}
                <div className={cn(glass.card, "lg:col-span-2 p-5 space-y-4 bg-white/40 border-white/20 shadow-xl")}>
                    <div className="flex justify-between items-center border-b border-white/20 pb-4">
                        <div className="space-y-0.5">
                            <h3 className="text-[11px] font-black text-[#1A1A1A]">Usage patterns</h3>
                            <p className="text-[8px] font-black text-gray-400">Daily monitoring trend</p>
                        </div>
                        <div className="flex bg-white/40 p-1 rounded-xl border border-white/40 gap-1 backdrop-blur-sm">
                            {(['Water', 'Heat', 'Energy'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setUsageFilter(m)}
                                    className={cn(
                                        "h-7 px-4 rounded-lg text-[8px] font-black transition-all",
                                        usageFilter === m ? "bg-white text-[#1A1A1A] shadow-sm border border-white/40" : "text-gray-400 hover:text-[#1A1A1A]/60"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[250px] w-full mt-4">
                        {trendData.length < 2 ? (
                            <div className="h-full w-full flex items-center justify-center text-center">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-gray-400">Not enough readings</div>
                                    <div className="text-sm font-semibold text-gray-600">Connect devices to populate trends.</div>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="meterGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F4D03F" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#F4D03F" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#F4D03F" strokeWidth={3} fillOpacity={1} fill="url(#meterGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Assistant */}
                <div className={cn(glass.card, "p-5 flex flex-col bg-white/40 border-white/20 shadow-xl")}>
                    <div className="flex items-center gap-3 mb-4 border-b border-white/20 pb-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-[#1A1A1A]/10 shadow-sm">
                            <Bot className="w-5 h-5 text-[#1A1A1A]" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-[11px] font-black text-[#1A1A1A]">Assistant</h3>
                            <p className="text-[8px] font-black text-gray-400">Colony health advisor</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 mb-6 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "px-4 py-2.5 rounded-2xl max-w-[90%] text-[10px] font-black tracking-wider leading-relaxed shadow-sm",
                                    msg.role === 'user' ? "bg-[#1A1A1A] text-white rounded-tr-none" : "bg-white border border-white/40 text-gray-500 rounded-tl-none"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="relative">
                        <input
                            placeholder="Search telemetry..."
                            value={aiMessage}
                            onChange={e => setAiMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            className="w-full h-10 bg-white border border-white/40 rounded-xl pl-4 pr-12 text-[9px] font-black outline-none focus:ring-1 focus:ring-[#1A1A1A]/10 shadow-sm"
                        />
                        <button
                            onClick={handleSendMessage}
                            aria-label="Send telemetry query"
                            title="Send"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-[#1A1A1A] text-white rounded-lg flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Events List */}
            <div className={cn(glass.card, "p-0 overflow-hidden bg-white/40 border-white/20 shadow-xl")}>
                <div className="p-4 border-b border-white/20 bg-white/20 flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-[#1B9157]" />
                        <h3 className="text-[11px] font-black text-[#1A1A1A]">Activity log</h3>
                    </div>
                    <Button onClick={() => onTabChange('meters-alarms')} variant="ghost" className="text-[8px] font-black text-gray-500 hover:text-[#1A1A1A] hover:bg-white/40 rounded-xl px-3 h-7">
                        Full history <ChevronRight className="w-3" />
                    </Button>
                </div>
                <div className="divide-y divide-white/20">
                    {events.slice(0, 5).map((event, i) => (
                        <div key={event.id || i} className="p-5 flex items-center justify-between hover:bg-white/40 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    event.severity === 'Critical' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" : "bg-[#1B9157]"
                                )} />
                                <div>
                                    <p className={cn("text-[11px] font-black tracking-tight italic", event.severity === 'Critical' ? "text-red-500" : "text-[#1A1A1A]")}>
                                        {event.event_type}
                                    </p>
                                    <p className="text-[10px] text-[#1A1A1A]/40 font-medium italic mt-0.5 truncate max-w-[400px]">
                                        {event.reason} · Meter: {event.meter_id || 'System'}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-[#1A1A1A]/30 tabular-nums">
                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="p-20 text-center opacity-30 italic">
                            <Activity className="w-10 h-10 mx-auto mb-4 opacity-20" />
                            <p className="text-[10px] font-black">Everything is currently running smoothly</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(244, 208, 63, 0.1); border-radius: 10px; }
            `}</style>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default MetersView;
