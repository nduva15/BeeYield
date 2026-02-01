import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Droplet, Flame, Zap, AlertTriangle, TrendingUp, Send,
    Bot, ChevronDown, MessageCircle, ThermometerSun, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { meterService, Meter, MeterEvent, Building } from '@/services/meterService';
import MetersAlarms from './MetersAlarms';
import MetersPayments from './MetersPayments';
import MetersReports from './MetersReports';
import MetersSettings from './MetersSettings';
import MetersMeasurements from './MetersMeasurements';
import MetersListWater from './MetersListWater';
import MetersListHeat from './MetersListHeat';
import MetersListEnergy from './MetersListEnergy';
import MetersListOther from './MetersListOther';
import { toast } from 'sonner';

// Usage trend data (Keep as sample for now until we have time-series API)
const usageTrendData = [
    { day: 'Day 1', value: 125 },
    { day: 'Day 3', value: 165 },
    { day: 'Day 5', value: 185 },
    { day: 'Day 7', value: 195 },
    { day: 'Day 9', value: 210 },
    { day: 'Day 11', value: 200 },
    { day: 'Day 13', value: 195 },
];

const suggestedQuestions = [
    'How long does meter certification take?',
    'How to settle heat costs in a multi-unit building?',
    'How to detect a water leak quickly?',
    'Which meters have the highest usage today?',
    'Show me all active alerts.',
];

interface MetersViewProps {
    onTabChange: (tab: string) => void;
    activeSubTab?: string;
}

const MetersView: React.FC<MetersViewProps> = ({ onTabChange, activeSubTab = 'meters-dashboard' }) => {
    // Data States
    const [meters, setMeters] = useState<Meter[]>([]);
    const [events, setEvents] = useState<MeterEvent[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [usagePeriod, setUsagePeriod] = useState<'Daily' | 'Hourly'>('Daily');
    const [usageFilter, setUsageFilter] = useState<'Water' | 'Heat' | 'Energy' | 'Other'>('Water');
    const [aiMessage, setAiMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', content: 'Hi! I can help with meter operations and billing.' },
    ]);

    useEffect(() => {
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
    if (activeSubTab === 'meters-reports') return <MetersReports />;
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

    // Dashboard Calculations
    const getUsageByMedium = (medium: string) => {
        const mediumMeters = meters.filter(m => m.meter_type === medium);
        const total = mediumMeters.reduce((acc, current) => acc + (current.last_reading_value || 0), 0);
        const unit = mediumMeters[0]?.last_reading_unit || (medium === 'Energy' ? 'kWh' : medium === 'Heat' ? 'GJ' : 'm3');
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
                    content: 'I am analyzing the real-time meter data. Currently, I see ' + meters.length + ' active devices in the system.'
                }]);
            }, 1000);
        }
    };

    if (loading && activeSubTab === 'meters-dashboard') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#1B9157]" />
                <p className="text-gray-500 font-medium font-mono text-xs">Syncing utility data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <h1 className="text-[2.5rem] font-bold text-[#1B9157] dark:text-[#F4D03F] tracking-tight">Meters Overview</h1>

            {/* Usage Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Water', 'Heat', 'Energy'].map(medium => {
                    const { total, unit } = getUsageByMedium(medium);
                    const Icon = medium === 'Water' ? Droplet : medium === 'Heat' ? ThermometerSun : Zap;
                    const alertCount = meters.filter(m => m.meter_type === medium && m.has_alarm).length;

                    return (
                        <Card key={medium} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm p-5 border-t-4 border-t-[#F4D03F]">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                                        medium === 'Water' ? "bg-blue-50" : medium === 'Heat' ? "bg-orange-50" : "bg-yellow-50")}>
                                        <Icon className={cn("w-5 h-5",
                                            medium === 'Water' ? "text-blue-500" : medium === 'Heat' ? "text-orange-500" : "text-yellow-500")} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{medium}</p>
                                    </div>
                                </div>
                                <Badge className={cn("border-0 text-[10px] font-bold px-2",
                                    alertCount > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
                                    {alertCount > 0 ? 'ALERTS' : 'STABLE'}
                                </Badge>
                            </div>
                            <div className="mt-4">
                                <p className="text-xl font-black text-gray-900 dark:text-white">{total} <span className="text-xs font-normal text-gray-400">{unit}</span></p>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Current total consumption</p>
                            </div>
                        </Card>
                    );
                })}

                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm p-5 border-t-4 border-t-[#F4D03F]">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Events</p>
                            </div>
                        </div>
                        <Badge className={cn("border-0 text-[10px] font-bold px-2",
                            activeAlarmsCount > 0 ? "bg-red-500 text-white" : "bg-green-100 text-green-700")}>
                            {activeAlarmsCount} ACTIVE
                        </Badge>
                    </div>
                    <div className="mt-4">
                        <p className="text-xl font-black text-gray-900 dark:text-white">{events.length}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Total events in history</p>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                    <CardHeader className="p-6 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gray-400" />
                                <CardTitle className="text-lg font-bold">Usage trend</CardTitle>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            {['Water', 'Heat', 'Energy'].map(m => (
                                <Button
                                    key={m}
                                    variant={usageFilter === m ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-8 rounded-xl text-xs"
                                    onClick={() => setUsageFilter(m as any)}
                                >{m}</Button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={usageTrendData}>
                                    <defs>
                                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1B9157" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#1B9157" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="value" stroke="#1B9157" fillOpacity={1} fill="url(#colorUsage)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden border-t-2 border-[#1B9157]/10">
                    <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-[#1B9157]">Recent events</CardTitle>
                        <Button variant="ghost" size="sm" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" onClick={() => onTabChange('meters-alarms')}>View all</Button>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 max-h-[380px] overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            {events.slice(0, 5).map((event) => (
                                <div key={event.id} className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                                    <div className="flex items-start gap-3">
                                        <div className={cn("w-2 h-2 rounded-full mt-1.5",
                                            event.severity === 'CRITICAL' || event.severity === 'ALERT' ? "bg-red-500" : "bg-amber-500")} />
                                        <div>
                                            <span className="text-sm font-bold block">{event.event_type}</span>
                                            <p className="text-[11px] text-gray-500 line-clamp-1">{event.message || event.reason}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AI Assistant Card */}
            <Card className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden border-t-4 border-t-[#F4D03F]">
                <CardHeader className="p-6 pb-4">
                    <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-[#1B9157]" />
                        <CardTitle className="text-lg font-bold text-[#1B9157]">Meters Expert AI</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <div className="space-y-3 mb-6">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={cn("py-3 px-4 rounded-2xl max-w-[85%] text-sm",
                                msg.role === 'assistant' ? "bg-gray-50 dark:bg-gray-800" : "bg-[#F4D03F]/10 border border-[#F4D03F]/20 ml-auto")}>
                                {msg.content}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="How many water meters have alerts?"
                            value={aiMessage}
                            onChange={e => setAiMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            className="h-12 rounded-xl border-gray-100"
                        />
                        <Button onClick={handleSendMessage} className="h-12 w-12 rounded-xl bg-[#F4D03F] hover:bg-yellow-500 text-black shadow-sm flex items-center justify-center p-0">
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MetersView;
