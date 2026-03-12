import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Droplet, Flame, Zap, AlertTriangle, TrendingUp, Send,
    Bot, ThermometerSun, Activity, Search,
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

const usageTrendData = [
    { day: 'Day 1', value: 125 },
    { day: 'Day 3', value: 165 },
    { day: 'Day 5', value: 185 },
    { day: 'Day 7', value: 195 },
    { day: 'Day 9', value: 210 },
    { day: 'Day 11', value: 200 },
    { day: 'Day 13', value: 195 },
];

interface MetersViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
    activeSubTab?: string;
}

const MetersView: React.FC<MetersViewProps> = ({ onTabChange, activeSubTab = 'meters-dashboard' }) => {
    const [meters, setMeters] = React.useState<Meter[]>([]);
    const [events, setEvents] = React.useState<MeterEvent[]>([]);
    const [buildings, setBuildings] = React.useState<Building[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [usageFilter, setUsageFilter] = React.useState<'Water' | 'Heat' | 'Energy'>('Water');
    const [aiMessage, setAiMessage] = React.useState('');
    const [chatMessages, setChatMessages] = React.useState([
        { role: 'assistant', content: 'Checking system status... How can I help you today?' },
    ]);

    React.useEffect(() => {
        const loadDashboardData = async () => {
            if (activeSubTab !== 'meters-dashboard') return;
            setLoading(true);
            try {
                const [mData, eData, bData] = await Promise.all([
                    meterService.getMeters(),
                    meterService.getEvents(),
                    meterService.getBuildings()
                ]);
                setMeters(mData);
                setEvents(eData);
                setBuildings(bData);
            } catch (error) {
                console.error('Failed to load meter dashboard', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, [activeSubTab]);

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
        'meters-import',
        'meters-measurements'
    ].includes(activeSubTab)) {
        return <MetersMeasurements onTabChange={onTabChange} activeSubTab={activeSubTab} />;
    }

    const getUsageByMedium = (medium: string) => {
        const mediumMeters = meters.filter(m => m.meter_type === medium);
        const total = mediumMeters.reduce((acc, current) => acc + (current.last_reading_value || 0), 0);
        const unit = mediumMeters[0]?.last_reading_unit || (medium === 'Energy' ? 'kWh' : medium === 'Heat' ? 'GJ' : 'm³');
        return { total: total.toFixed(1), unit };
    };

    const activeAlarmsCount = events.filter(e => !e.is_resolved).length;

    const handleSendMessage = () => {
        if (aiMessage.trim()) {
            setChatMessages([...chatMessages, { role: 'user', content: aiMessage }]);
            setAiMessage('');
            setTimeout(() => {
                setChatMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Analysis complete. Recommend checking Water Gate 04 in Kibwezi — flow rate is slightly above nominal baseline.'
                }]);
            }, 1000);
        }
    };

    if (loading && activeSubTab === 'meters-dashboard') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                <div className="w-12 h-12 border-4 border-honey border-t-transparent rounded-full animate-spin" />
                <p className={cn(glass.microLabel, "animate-pulse")}>Synchronizing Hubs...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn(glass.page, "p-8 -m-8 space-y-12 pb-12 min-h-screen")}>
            {/* Header */}
            <div className="space-y-4">
                <div className={cn(glass.badge, "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 font-bold mb-4")}>
                    <Activity className="w-4 h-4 mr-2" />
                    Operational Telemetry Hub
                </div>
                <h1 className={cn(glass.sectionTitle, "text-6xl")}>Resource <span className="text-honey">Inventory</span></h1>
                <p className={cn(glass.microLabel, "normal-case italic font-semibold text-lg opacity-70")}>
                    Critical payloads: Water, and Neural system energy health.
                </p>
            </div>

            {/* Usage Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {(['Water', 'Heat', 'Energy'] as const).map((medium, i) => {
                    const { total, unit } = getUsageByMedium(medium);
                    const Icon = medium === 'Water' ? Droplet : medium === 'Heat' ? ThermometerSun : Zap;
                    const alertCount = meters.filter(m => m.meter_type === medium && m.has_alarm).length;

                    const themeColors = {
                        Water: "text-blue-500 bg-blue-500/10 border-blue-500/20",
                        Heat: "text-amber-500 bg-amber-500/10 border-amber-500/20",
                        Energy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    };

                    return (
                        <motion.div
                            key={medium}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(glass.card, "p-6 hover:shadow-xl transition-all duration-300 border-border group")}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center border transition-all shadow-sm group-hover:scale-110 duration-300', themeColors[medium])}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className={cn(
                                    glass.badge, "text-[10px] font-bold px-3 py-1 shadow-none transition-colors",
                                    alertCount > 0 ? 'bg-red-500 text-gray-900 border-transparent' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white'
                                )}>
                                    {alertCount > 0 ? 'ALERT' : 'NOMINAL'}
                                </div>
                            </div>
                            <h3 className={cn(glass.sectionTitle, "text-4xl tabular-nums")}>
                                {total} <span className="text-sm font-semibold opacity-50 ml-1">{unit}</span>
                            </h3>
                            <p className={cn(glass.microLabel, "italic normal-case opacity-60 mt-2 font-bold")}>{medium} Accumulation</p>
                        </motion.div>
                    );
                })}

                {/* Alerts Card */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className={cn(glass.card, "p-6 bg-red-500/5 border-red-500/20 relative overflow-hidden group hover:shadow-xl transition-all")}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-6 shadow-sm">
                                <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
                            </div>
                            <h3 className={cn(glass.sectionTitle, "text-5xl tabular-nums text-red-600")}>{activeAlarmsCount}</h3>
                            <p className={cn(glass.microLabel, "normal-case italic opacity-70 font-bold mt-2")}>Active Protocol Alerts</p>
                        </div>
                        <button
                            onClick={() => onTabChange('meters-alarms')}
                            className={cn(glass.btnSecondary, "mt-6 text-red-600 bg-white/50 border-red-500/30 hover:bg-red-500 hover:text-gray-900 hover:border-transparent group-hover:-translate-y-1")}
                        >
                            Interrogate Records →
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Usage Trend Chart */}
            <div className={cn(glass.card, "p-8 space-y-8 shadow-xl")}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h3 className={cn(glass.sectionTitle, "text-4xl normal-case")}>Activity <span className="text-honey">Trend</span></h3>
                        <p className={cn(glass.microLabel, "normal-case italic mt-2 opacity-60")}>Usage records from the last two weeks.</p>
                    </div>
                    <div className={cn(glass.filterBar, "bg-muted/40 p-1.5 shadow-inner")}>
                        {(['Water', 'Heat', 'Energy'] as const).map(m => (
                            <button
                                key={m}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                    usageFilter === m
                                        ? "bg-white text-foreground shadow-sm scale-100"
                                        : "text-muted-foreground hover:bg-gray-50:bg-white/5 scale-95 hover:scale-100"
                                )}
                                onClick={() => setUsageFilter(m)}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[360px] w-full mt-4">
                    <ResponsiveContainer width="99%" height="100%">
                        <AreaChart data={usageTrendData}>
                            <defs>
                                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'currentColor', fontSize: 12, fontFamily: 'serif', opacity: 0.6 }}
                                dy={12}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'currentColor', fontSize: 12, fontFamily: 'sans-serif', fontWeight: 600, opacity: 0.6 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.08)',
                                    padding: '16px 20px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(12px)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#f59e0b"
                                fill="url(#colorUsage)"
                                strokeWidth={4}
                                dot={{ r: 6, strokeWidth: 3, fill: '#fff', stroke: '#f59e0b' }}
                                activeDot={{ r: 8, fill: '#f59e0b' }}
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom: Smart Tips + Recent Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Smart Assistant */}
                <div className={cn(glass.card, "p-8 flex flex-col shadow-lg")}>
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-14 h-14 bg-honey/10 border border-honey/20 rounded-2xl flex items-center justify-center">
                            <Bot className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Neural Co-Pilot</h3>
                            <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-60 mt-1")}>Autonomous Hive Assistant</p>
                        </div>
                    </div>

                    <div className="bg-white/40 border border-border rounded-2xl p-6 mb-8 min-h-[140px] flex-1 max-h-[250px] overflow-y-auto custom-scrollbar flex flex-col gap-4">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "px-4 py-3 rounded-2xl max-w-[85%] shadow-sm",
                                    msg.role === 'user' ? "bg-honey text-white rounded-br-none" : "bg-white border border-border text-foreground rounded-bl-none"
                                )}>
                                    <p className="text-sm font-medium leading-relaxed">
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 mt-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-50" />
                        <input
                            placeholder="Interrogate the Co-Pilot..."
                            value={aiMessage}
                            onChange={e => setAiMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            className={cn(glass.input, "flex-1 rounded-2xl pl-12 h-14")}
                        />
                        <button
                            onClick={handleSendMessage}
                            className={cn(glass.btnPrimary, "w-14 h-14 rounded-2xl p-0 flex items-center justify-center border-transparent shadow-lg shadow-honey/20 shrink-0")}
                        >
                            <Send className="w-5 h-5 ml-1" />
                        </button>
                    </div>
                </div>

                {/* Recent Events */}
                <div className={cn(glass.card, "p-8 flex flex-col shadow-lg")}>
                    <div className="flex items-start justify-between mb-8 border-b border-border pb-4">
                        <div>
                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case inline-flex items-center gap-2")}>System <span className="text-emerald-500">Events</span></h3>
                            <p className={cn(glass.microLabel, "normal-case text-muted-foreground opacity-70 italic font-semibold mt-1")}>Live Telemetry Archive</p>
                        </div>
                        <button
                            className={cn(glass.btnSecondary, "text-xs px-4 h-9 bg-muted/40 border-transparent hover:bg-muted font-bold")}
                            onClick={() => onTabChange('meters-alarms')}
                        >
                            Full Archive →
                        </button>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {events.length === 0 ? (
                            <div className={glass.emptyState}>
                                <Activity className="w-10 h-10 mb-4 text-muted-foreground/30" />
                                <p className={glass.microLabel}>No events recorded.</p>
                            </div>
                        ) : (
                            events.slice(0, 5).map((event) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/40 border border-border hover:bg-white/60:bg-gray-100 hover:border-border/80 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn('w-3 h-3 rounded-full shrink-0 shadow-sm border border-transparent',
                                            event.severity === 'CRITICAL' || event.severity === 'ALERT'
                                                ? 'bg-red-500 shadow-red-500/50 animate-pulse border-red-200'
                                                : 'bg-emerald-500 shadow-emerald-500/50'
                                        )} />
                                        <div>
                                            <span className={cn(glass.microLabel, "font-bold tracking-wider opacity-90 group-hover:opacity-100 transition-opacity block", event.severity === 'CRITICAL' ? "text-red-600" : "")}>{event.event_type}</span>
                                            <p className="text-xs text-muted-foreground font-medium mt-1 truncate max-w-[200px] sm:max-w-[250px]">{event.reason}</p>
                                        </div>
                                    </div>
                                    <span className={cn(glass.microLabel, "text-[10px] opacity-40 group-hover:opacity-70 transition-opacity font-bold shrink-0")}>
                                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MetersView;
