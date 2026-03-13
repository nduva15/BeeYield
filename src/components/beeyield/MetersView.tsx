import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Droplet, Flame, Zap, AlertTriangle, TrendingUp, Send,
    Bot, ThermometerSun, Activity, Search, RefreshCw, ChevronRight, Database, Layers, ShieldCheck
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
import { glass, PageHeader } from './GlassTheme';

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
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Activity className="w-8 h-8 animate-spin text-[#F4D03F]" />
                <span className="text-[10px] font-black tracking-widest uppercase italic">SYNCHRONIZING HUBS...</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Activity}
                label="Environmental Telemetry"
                title={<>Apiary <span className="text-[#F4D03F]">Meters</span></>}
                subtitle="Real-time multi-node environment and vibration metrics monitoring."
                actions={
                    <Button
                        onClick={() => onTabChange('meters-list')}
                        className={cn(glass.btnPrimary, "h-8 px-4 text-[9px] font-black uppercase tracking-[0.2em]")}
                    >
                        Node_Inventory <ChevronRight className="w-3" />
                    </Button>
                }
            />

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
                                    {alertCount > 0 ? `${alertCount} ALARMS` : 'OPTIMIZED'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{medium}_LOAD</p>
                                <p className="text-lg font-black text-[#1A1A1A] tracking-tighter tabular-nums">
                                     {total} <span className="text-[9px] font-medium opacity-30 tracking-normal font-sans uppercase">{unit}</span>
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
                        <Badge className="bg-red-500 text-white border-none px-1.5 py-0.5 rounded-md font-bold text-[8px] animate-pulse">ACTION</Badge>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-red-500/60 uppercase tracking-widest">PROTOCOL_ALERTS</p>
                        <p className="text-lg font-black text-red-600 tracking-tighter tabular-nums">{activeAlarmsCount}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Chart */}
                <div className={cn(glass.card, "lg:col-span-2 p-5 space-y-4 bg-white/40 border-white/20 shadow-xl")}>
                    <div className="flex justify-between items-center border-b border-white/20 pb-4">
                        <div className="space-y-0.5">
                            <h3 className="text-[11px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase">Resource_Flow</h3>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">BIOMASS_ACCUMULATION_DELTA</p>
                        </div>
                        <div className="flex bg-white/40 p-1 rounded-xl border border-white/40 gap-1 backdrop-blur-sm">
                            {(['Water', 'Heat', 'Energy'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setUsageFilter(m)}
                                    className={cn(
                                        "h-7 px-4 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                                        usageFilter === m ? "bg-white text-[#1A1A1A] shadow-sm border border-white/40" : "text-gray-400 hover:text-[#1A1A1A]/60"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={usageTrendData}>
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
                    </div>
                </div>

                {/* AI Assistant */}
                <div className={cn(glass.card, "p-5 flex flex-col bg-white/40 border-white/20 shadow-xl")}>
                    <div className="flex items-center gap-3 mb-4 border-b border-white/20 pb-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-[#1A1A1A]/10 shadow-sm">
                            <Bot className="w-5 h-5 text-[#1A1A1A]" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-[11px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase">Co_Pilot</h3>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">ACOUSTIC_RESONANCE_EXPERT</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 mb-6 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "px-4 py-2.5 rounded-2xl max-w-[90%] text-[10px] font-black uppercase tracking-wider leading-relaxed shadow-sm",
                                    msg.role === 'user' ? "bg-[#1A1A1A] text-white rounded-tr-none" : "bg-white border border-white/40 text-gray-500 rounded-tl-none"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="relative">
                        <input
                            placeholder="QUERY_TELEMETRY..."
                            value={aiMessage}
                            onChange={e => setAiMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            className="w-full h-10 bg-white border border-white/40 rounded-xl pl-4 pr-12 text-[9px] font-black tracking-widest uppercase outline-none focus:ring-1 focus:ring-[#1A1A1A]/10 shadow-sm"
                        />
                        <button
                            onClick={handleSendMessage}
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
                        <h3 className="text-[11px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase">Audit_Records</h3>
                    </div>
                    <Button onClick={() => onTabChange('meters-alarms')} variant="ghost" className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-[#1A1A1A] hover:bg-white/40 rounded-xl px-3 h-7">
                        Historical_Log <ChevronRight className="w-3" />
                    </Button>
                </div>
                <div className="divide-y divide-white/20">
                    {events.slice(0, 5).map((event, i) => (
                        <div key={event.id || i} className="p-5 flex items-center justify-between hover:bg-white/40 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    event.severity === 'CRITICAL' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" : "bg-[#1B9157]"
                                )} />
                                <div>
                                    <p className={cn("text-[11px] font-black uppercase tracking-tight italic", event.severity === 'CRITICAL' ? "text-red-500" : "text-[#1A1A1A]")}>
                                        {event.event_type}
                                    </p>
                                    <p className="text-[10px] text-[#1A1A1A]/40 font-medium italic mt-0.5 truncate max-w-[400px]">
                                        {event.reason} · Node: {event.meter_id || 'System'}
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
                            <p className="text-[10px] font-black tracking-widest uppercase">STABLE_NOMINAL_BASELINE_DETECTED</p>
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
    );
};

export default MetersView;
