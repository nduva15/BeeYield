import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Droplet, Flame, Zap, AlertTriangle, TrendingUp, Send,
    Bot, ThermometerSun, Activity
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
                <div className="w-16 h-16 border-4 border-beeyield-forest border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em] animate-pulse">Synchronizing Hubs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-6">
                    <Activity className="w-3.5 h-3.5 text-[#facc15]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Operational Telemetry Hub</span>
                </div>
                <h1 className="text-6xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">Resource <span className="text-[#10b981]">Inventory</span></h1>
                <p className="text-[#064e3b]/40 font-black mt-3 text-xl uppercase tracking-tight">
                    Critical payloads: Water, and Neural system energy health.
                </p>
            </div>

            {/* Usage Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {(['Water', 'Heat', 'Energy'] as const).map((medium, i) => {
                    const { total, unit } = getUsageByMedium(medium);
                    const Icon = medium === 'Water' ? Droplet : medium === 'Heat' ? ThermometerSun : Zap;
                    const alertCount = meters.filter(m => m.meter_type === medium && m.has_alarm).length;
                    const iconColors = {
                        Water: 'text-[#10b981]',
                        Heat: 'text-[#facc15]',
                        Energy: 'text-white'
                    };

                    return (
                        <div key={medium}>
                            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={cn('w-12 h-12 rounded-none bg-[#064e3b] flex items-center justify-center border-2 border-[#10b981] transition-all', iconColors[medium])}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className={cn('px-2 py-0.5 border-2 text-[8px] font-black uppercase tracking-widest',
                                            alertCount > 0 ? 'bg-red-500 text-white border-[#064e3b]' : 'bg-[#10b981] text-white border-[#064e3b]'
                                        )}>
                                            {alertCount > 0 ? 'ALERT' : 'NOMINAL'}
                                        </div>
                                    </div>
                                    <h3 className="text-4xl font-black text-[#064e3b] tracking-tighter uppercase">
                                        {total} <span className="text-sm font-black text-[#064e3b]/20">{unit}</span>
                                    </h3>
                                    <p className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] mt-2">{medium} ACCUMULATION</p>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}

                {/* Alerts Card — Forest green dark */}
                <div>
                    <Card className="rounded-none border-4 border-[#064e3b] bg-[#064e3b] shadow-[6px_6px_0px_0px_rgba(24acc15,1)] shadow-[#facc15] overflow-hidden relative">
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-12 h-12 rounded-none bg-white/5 border-2 border-white/20 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-[#facc15]" />
                                </div>
                            </div>
                            <h3 className="text-5xl font-black text-white tracking-tighter uppercase">{activeAlarmsCount}</h3>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mt-2">Active Protocol Alerts</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onTabChange('meters-alarms')}
                                className="mt-6 text-[#facc15] hover:bg-white/10 rounded-none h-10 px-4 border-2 border-[#facc15]/20 font-black uppercase text-[10px] tracking-widest transition-none"
                            >
                                INTERROGATE RECORDS →
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Usage Trend Chart */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                <CardContent className="p-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h3 className="text-4xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">Activity <span className="text-[#10b981]">Trend</span></h3>
                            <p className="text-[#064e3b]/30 font-black text-[10px] mt-2 uppercase tracking-[0.2em]">Usage records from the last two weeks.</p>
                        </div>
                        <div className="flex bg-[#064e3b]/5 border-4 border-[#064e3b] p-1.5 gap-1.5">
                            {(['Water', 'Heat', 'Energy'] as const).map(m => (
                                <button
                                    key={m}
                                    className={cn('h-10 px-6 rounded-none text-[10px] font-black uppercase tracking-widest transition-none',
                                        usageFilter === m
                                            ? 'bg-[#064e3b] text-white shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]'
                                            : 'text-[#064e3b]/40 hover:text-[#064e3b] hover:bg-white'
                                    )}
                                    onClick={() => setUsageFilter(m)}
                                >{m}</button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[360px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                            <AreaChart data={usageTrendData}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1B4332" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#1B4332" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F5F5F5" />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }}
                                    dy={12}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: '1px solid #E0E0E0',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.08)',
                                        padding: '16px 20px',
                                        fontSize: '13px',
                                        fontWeight: 700
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#064e3b"
                                    fillOpacity={1}
                                    fill="url(#colorUsage)"
                                    strokeWidth={4}
                                    dot={{ r: 6, strokeWidth: 3, fill: '#fff', stroke: '#064e3b' }}
                                    activeDot={{ r: 8, fill: '#10b981' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom: Smart Tips + Recent Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Smart Assistant */}
                <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-14 h-14 bg-[#064e3b] border-2 border-[#10b981] rounded-none flex items-center justify-center">
                                <Bot className="w-7 h-7 text-[#facc15]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter">Neural Co-Pilot</h3>
                                <p className="text-[9px] text-[#064e3b]/30 font-black uppercase tracking-[0.2em] mt-0.5">Autonomous Hive Assistant</p>
                            </div>
                        </div>

                        <div className="bg-neutral-50/50 border-4 border-[#064e3b]/10 rounded-none p-6 mb-8 min-h-[100px]">
                            {chatMessages.slice(-1).map((msg, idx) => (
                                <p key={idx} className="text-sm font-medium text-beeyield-charcoal leading-relaxed">
                                    {msg.content}
                                </p>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <Input
                                placeholder="Interrogate the Co-Pilot..."
                                value={aiMessage}
                                onChange={e => setAiMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                className="h-14 rounded-none border-4 border-[#064e3b] bg-white text-xs font-black uppercase px-6 focus-visible:ring-0 focus-visible:bg-[#facc15]/5 transition-none"
                            />
                            <Button
                                onClick={handleSendMessage}
                                className="h-14 w-14 rounded-none bg-[#064e3b] hover:bg-[#10b981] text-white border-2 border-[#064e3b] transition-none shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                            >
                                <Send className="w-6 h-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Events */}
                <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter leading-none">System <span className="text-[#10b981]">Events</span></h3>
                                <p className="text-[9px] text-[#064e3b]/30 font-black uppercase tracking-[0.2em] mt-2">Live Telemetry Archive</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest hover:text-[#064e3b] hover:bg-[#facc15]/10 rounded-none h-10 px-4 transition-none"
                                onClick={() => onTabChange('meters-alarms')}
                            >
                                FULL ARCHIVE →
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {events.slice(0, 5).map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between p-5 rounded-none bg-neutral-50/30 border-2 border-transparent hover:border-[#064e3b]/10 transition-none group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn('w-3 h-3 rounded-none border-2',
                                            event.severity === 'CRITICAL' || event.severity === 'ALERT'
                                                ? 'bg-red-500 border-[#064e3b] animate-pulse'
                                                : 'bg-[#facc15] border-[#064e3b]'
                                        )} />
                                        <div>
                                            <span className="text-[11px] font-black text-[#064e3b] uppercase tracking-tighter block">{event.event_type}</span>
                                            <p className="text-[9px] text-[#064e3b]/30 font-black mt-0.5 uppercase tracking-[0.1em]">{event.reason}</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] text-[#064e3b]/20 font-black uppercase tracking-[0.2em] group-hover:text-[#064e3b]/40 transition-none">
                                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            {events.length === 0 && (
                                <div className="py-12 text-center text-gray-400">
                                    <Activity className="w-10 h-10 mx-auto mb-4 text-gray-200" />
                                    <p className="text-sm font-bold">No events recorded</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MetersView;
