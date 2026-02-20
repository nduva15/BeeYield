import React, { useState, useEffect } from 'react';
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
    onTabChange: (tab: string) => void;
    activeSubTab?: string;
}

const MetersView: React.FC<MetersViewProps> = ({ onTabChange, activeSubTab = 'meters-dashboard' }) => {
    const [meters, setMeters] = useState<Meter[]>([]);
    const [events, setEvents] = useState<MeterEvent[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(true);
    const [usageFilter, setUsageFilter] = useState<'Water' | 'Heat' | 'Energy'>('Water');
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
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-6">
                    <Activity className="w-3.5 h-3.5 text-beeyield-forest" />
                    <span className="text-[10px] font-bold text-beeyield-forest uppercase tracking-[0.15em]">Live Monitoring</span>
                </div>
                <h1 className="text-5xl font-bold text-beeyield-charcoal tracking-tight">
                    Resource Usage
                </h1>
                <p className="text-gray-500 font-medium mt-3 text-lg">
                    Water, energy, and system health across all monitored sectors.
                </p>
            </div>

            {/* Usage Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {(['Water', 'Heat', 'Energy'] as const).map((medium, i) => {
                    const { total, unit } = getUsageByMedium(medium);
                    const Icon = medium === 'Water' ? Droplet : medium === 'Heat' ? ThermometerSun : Zap;
                    const alertCount = meters.filter(m => m.meter_type === medium && m.has_alarm).length;
                    const iconColors = {
                        Water: 'text-blue-600 bg-blue-50 border-blue-100',
                        Heat: 'text-orange-500 bg-orange-50 border-orange-100',
                        Energy: 'text-beeyield-forest bg-beeyield-forest/5 border-beeyield-forest/10'
                    };

                    return (
                        <motion.div key={medium} whileHover={{ y: -4, scale: 1.01 }}>
                            <Card className="rounded-[2rem] border-[#E0E0E0] bg-white shadow-sm hover:shadow-xl hover:shadow-beeyield-forest/5 transition-all duration-500 overflow-hidden group">
                                <CardContent className="p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:bg-beeyield-forest group-hover:border-beeyield-forest group-hover:text-white', iconColors[medium])}>
                                            <Icon className="w-6 h-6 stroke-[2] transition-colors duration-500 group-hover:text-white" />
                                        </div>
                                        <div className={cn('px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border',
                                            alertCount > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        )}>
                                            {alertCount > 0 ? 'Alert' : 'Normal'}
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-beeyield-charcoal tracking-tight">
                                        {total} <span className="text-sm font-bold text-gray-400">{unit}</span>
                                    </h3>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-2">{medium} Total</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}

                {/* Alerts Card — Forest green dark */}
                <motion.div whileHover={{ y: -4, scale: 1.01 }}>
                    <Card className="rounded-[2rem] border-none bg-beeyield-forest shadow-xl shadow-beeyield-forest/20 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
                        <CardContent className="p-8 relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-amber-300" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold text-white tracking-tight">{activeAlarmsCount}</h3>
                            <p className="text-[11px] font-bold text-white/60 uppercase tracking-[0.15em] mt-2">Active Alerts</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onTabChange('meters-alarms')}
                                className="mt-4 text-white/70 hover:text-white hover:bg-white/10 rounded-xl h-8 px-3 text-[10px] font-bold uppercase tracking-widest"
                            >
                                View All →
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Usage Trend Chart */}
            <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
                <CardContent className="p-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h3 className="text-2xl font-bold text-beeyield-charcoal tracking-tight">Activity Trend</h3>
                            <p className="text-gray-400 text-sm font-medium mt-1">Usage records from the last two weeks.</p>
                        </div>
                        <div className="flex bg-beeyield-sand/30 border border-[#E8E0D5] rounded-2xl p-1.5 gap-1">
                            {(['Water', 'Heat', 'Energy'] as const).map(m => (
                                <Button
                                    key={m}
                                    variant="ghost"
                                    className={cn('h-10 px-6 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all',
                                        usageFilter === m
                                            ? 'bg-beeyield-forest text-white shadow-md shadow-beeyield-forest/20'
                                            : 'text-gray-400 hover:text-beeyield-charcoal hover:bg-white'
                                    )}
                                    onClick={() => setUsageFilter(m)}
                                >{m}</Button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[360px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                                    stroke="#1B4332"
                                    fillOpacity={1}
                                    fill="url(#colorUsage)"
                                    strokeWidth={4}
                                    dot={{ r: 6, strokeWidth: 3, fill: '#fff', stroke: '#1B4332' }}
                                    activeDot={{ r: 8 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom: Smart Tips + Recent Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Smart Assistant */}
                <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-beeyield-forest/5 border border-beeyield-forest/10 rounded-2xl flex items-center justify-center">
                                <Bot className="w-7 h-7 text-beeyield-forest" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-beeyield-charcoal">Smart Tips</h3>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Neural Hive Assistant</p>
                            </div>
                        </div>

                        <div className="bg-beeyield-sand/30 border border-[#E8E0D5] rounded-[1.5rem] p-6 mb-6 min-h-[100px]">
                            {chatMessages.slice(-1).map((msg, idx) => (
                                <p key={idx} className="text-sm font-medium text-beeyield-charcoal leading-relaxed">
                                    {msg.content}
                                </p>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <Input
                                placeholder="Ask the System Assistant..."
                                value={aiMessage}
                                onChange={e => setAiMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                className="h-14 rounded-2xl border-[#E0E0E0] bg-white text-sm font-medium px-6 focus:ring-beeyield-forest/20 focus:border-beeyield-forest/30"
                            />
                            <Button
                                onClick={handleSendMessage}
                                className="h-14 w-14 rounded-2xl bg-beeyield-forest hover:opacity-90 text-white shadow-lg shadow-beeyield-forest/20"
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Events */}
                <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-beeyield-charcoal">System Events</h3>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Live activity feed</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-[10px] font-bold text-beeyield-forest uppercase tracking-widest hover:bg-beeyield-forest/5 rounded-xl px-4"
                                onClick={() => onTabChange('meters-alarms')}
                            >
                                Full Archive
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {events.slice(0, 5).map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between p-5 rounded-2xl hover:bg-beeyield-sand/20 transition-colors border border-transparent hover:border-[#E8E0D5] group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn('w-3 h-3 rounded-full border-2',
                                            event.severity === 'CRITICAL' || event.severity === 'ALERT'
                                                ? 'bg-red-500 border-red-200 animate-pulse'
                                                : 'bg-amber-400 border-amber-200'
                                        )} />
                                        <div>
                                            <span className="text-sm font-bold text-beeyield-charcoal block">{event.event_type}</span>
                                            <p className="text-[11px] text-gray-400 font-medium mt-0.5 uppercase tracking-wider">{event.reason}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest group-hover:text-gray-400 transition-colors">
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
