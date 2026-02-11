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
import ReportsExportsView from './ReportsExportsView';
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
        { role: 'assistant', content: 'Checking system status... How can I help you today?' },
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
                    content: 'Analysis complete. I recommend checking the Water Gate 04 in Kibwezi; flow rate is slightly above nominal.'
                }]);
            }, 1000);
        }
    };

    if (loading && activeSubTab === 'meters-dashboard') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                <div className="w-16 h-16 border-4 border-amber-100 border-t-[#FF9100] rounded-full animate-spin" />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Checking your Hubs</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-[3rem] font-black text-slate-800 tracking-tighter leading-none">
                    Usage & Stats
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Check your water, energy, and system health here.</p>
            </div>

            {/* Usage Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['Water', 'Heat', 'Energy'].map(medium => {
                    const { total, unit } = getUsageByMedium(medium);
                    const Icon = medium === 'Water' ? Droplet : medium === 'Heat' ? ThermometerSun : Zap;
                    const alertCount = meters.filter(m => m.meter_type === medium && m.has_alarm).length;

                    return (
                        <Card key={medium} className="rounded-[2rem] border-none bg-white dark:bg-slate-50 shadow-xl shadow-slate-200/40 p-8 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                                        medium === 'Water' ? "bg-blue-50 text-blue-500" : medium === 'Heat' ? "bg-orange-50 text-orange-500" : "bg-yellow-50 text-amber-500")}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{medium}</p>
                                </div>
                                <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                                    alertCount > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}>
                                    {alertCount > 0 ? 'ALERTS' : 'NORMAL'}
                                </div>
                            </div>

                            <div className="mt-8 relative z-10">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-800">{total}</span>
                                    <span className="text-sm font-bold text-slate-400">{unit}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-widest">Total Usage</p>
                            </div>
                        </Card>
                    );
                })}

                <Card className="rounded-[2rem] border-none bg-slate-800 p-8 text-white shadow-xl shadow-slate-900/10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-amber-400" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network</p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-black">{activeAlarmsCount}</span>
                            <span className="text-xs font-bold text-[#FF9100] uppercase tracking-widest">Active Alerts</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-widest">Needs attention</p>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <Card className="lg:col-span-12 rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/40 p-10 overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#FF9100]/10 rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-[#FF9100]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Activity trend</h3>
                                <p className="text-slate-400 text-sm font-medium mt-1">Your usage records from the last two weeks.</p>
                            </div>
                        </div>
                        <div className="flex bg-slate-50 border border-slate-100 rounded-2xl p-1 gap-1">
                            {['Water', 'Heat', 'Energy'].map(m => (
                                <Button
                                    key={m}
                                    variant="ghost"
                                    className={cn("h-11 px-8 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                                        usageFilter === m ? "bg-white text-slate-800 shadow-md" : "text-slate-400")}
                                    onClick={() => setUsageFilter(m as any)}
                                >{m}</Button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={usageTrendData}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF9100" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#FF9100" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 900 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 900 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)', padding: '15px' }}
                                    itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#FF9100" fillOpacity={1} fill="url(#colorUsage)" strokeWidth={4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="lg:col-span-12 rounded-[2.5rem] border-none bg-white dark:bg-slate-50 shadow-xl shadow-slate-200/40 p-10 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#1B9157]/20" />
                    <div className="w-20 h-20 bg-[#1B9157]/10 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Bot className="w-10 h-10 text-[#1B9157]" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Smart tips</h3>
                    <p className="text-slate-400 font-medium text-sm mt-3 px-6">
                        Simple suggestions to help you save and improve.
                    </p>

                    <div className="mt-10 w-full bg-slate-50 rounded-[2rem] p-6 text-left">
                        {chatMessages.slice(-1).map((msg, idx) => (
                            <div key={idx} className="text-xs font-bold text-slate-600 leading-relaxed">
                                "{msg.content}"
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 w-full flex gap-3">
                        <Input
                            placeholder="Ask System Assistant..."
                            className="h-14 rounded-2xl border-none bg-slate-50 dark:bg-slate-100 text-xs font-black px-6"
                        />
                        <Button className="h-14 w-14 rounded-2xl bg-[#FF9100] hover:bg-[#F57C00] text-white shadow-xl shadow-amber-500/20">
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </Card>

                <Card className="lg:col-span-7 rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/40 p-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Recent updates</h3>
                            <p className="text-slate-400 text-xs font-black uppercase mt-1 tracking-widest">Live feed</p>
                        </div>
                        <Button variant="ghost" className="text-[10px] font-black text-[#1B9157] tracking-widest uppercase" onClick={() => onTabChange('meters-alarms')}>Logs Archive</Button>
                    </div>

                    <div className="space-y-6">
                        {events.slice(0, 4).map((event) => (
                            <div key={event.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                <div className="flex items-center gap-5">
                                    <div className={cn("w-3 h-3 rounded-full shadow-sm",
                                        event.severity === 'CRITICAL' || event.severity === 'ALERT' ? "bg-red-500 animate-pulse" : "bg-amber-400")} />
                                    <div>
                                        <span className="text-[14px] font-black text-slate-800 block leading-none">{event.event_type}</span>
                                        <p className="text-[11px] text-slate-400 font-medium mt-1 uppercase tracking-widest">{event.reason}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-300 font-black uppercase group-hover:text-slate-400 transition-colors">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MetersView;
