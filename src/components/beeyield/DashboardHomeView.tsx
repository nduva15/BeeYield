import React, { useMemo } from 'react';
import {
    Activity,
    Smartphone,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Hexagon,
    Zap,
    Signal,
    Terminal,
    RefreshCw
} from 'lucide-react';
import { IoTDevice, SensorReading, Apiary, Hive } from '@/services/beeyieldService';
import StatCard from './StatCard';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardHomeViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    apiaries: Apiary[];
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ devices, readings, apiaries, onTabChange }) => {
    const activeStats = useMemo(() => {
        const total = devices.length;
        const online = devices.filter(d => d.status === 'active').length;
        const lowBattery = devices.filter(d => d.battery_level < 20).length;

        // Health Index (Simplified)
        const health = total > 0 ? Math.round((online / total) * 100) : 0;

        return { total, online, lowBattery, health };
    }, [devices]);

    const chartData = useMemo(() => {
        // Mock data for Brutalist chart
        return [
            { name: '00:00', val: 400 },
            { name: '04:00', val: 300 },
            { name: '08:00', val: 600 },
            { name: '12:00', val: 800 },
            { name: '16:00', val: 500 },
            { name: '20:00', val: 700 },
            { name: '23:59', val: 600 },
        ];
    }, []);

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-black antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-black pb-8">
                <div className="space-y-4">
                    <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.8]">
                        Dashboard <span className="text-[#FF4F00]">Home</span>
                    </h1>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-3 h-3 bg-black border-2 border-black" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{activeStats.online} Online</span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-3 h-3 bg-[#FF4F00] border-2 border-black" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{activeStats.total - activeStats.online} Offline</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 border-4 border-black bg-black text-white font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Balance: KES 48,500
                    </div>
                    <button className="h-12 w-12 border-2 border-black bg-white flex items-center justify-center hover:bg-neutral-100 transition-none">
                        <RefreshCw className="w-5 h-5 text-black" />
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <StatCard
                    title="Health"
                    value={`${activeStats.health}%`}
                    trend="+2.1%"
                    trendType="positive"
                    icon={Signal}
                    subtitle="System Online"
                />
                <StatCard
                    title="Devices"
                    value={activeStats.total}
                    icon={Smartphone}
                    subtitle="Connected Nodes"
                />
                <StatCard
                    title="Battery"
                    value={activeStats.lowBattery}
                    trend={`-${activeStats.lowBattery}`}
                    trendType={activeStats.lowBattery > 0 ? 'negative' : 'positive'}
                    icon={Zap}
                    subtitle="Low Power Alerts"
                />
                <StatCard
                    title="Locations"
                    value={apiaries.length}
                    icon={MapPin}
                    subtitle="Registered Hubs"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Performance Chart */}
                <div className="lg:col-span-8 border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between mb-10 border-b-4 border-black pb-6">
                        <div className="flex items-center gap-4">
                            <Terminal className="w-8 h-8 text-[#FF4F00]" />
                            <h3 className="text-4xl font-black uppercase tracking-tighter">Performance</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 border-2 border-black bg-black text-white text-[10px] font-bold uppercase tracking-widest">Live</div>
                        </div>
                    </div>
                    <div className="h-80 w-full px-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="0" vertical={true} stroke="#00000010" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={{ stroke: '#000', strokeWidth: 2 }}
                                    tickLine={false}
                                    tick={{ fill: '#000', fontSize: 10, fontWeight: 700 }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ stroke: '#FF4F00', strokeWidth: 2 }}
                                    contentStyle={{
                                        backgroundColor: '#000',
                                        border: 'none',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="stepAfter"
                                    dataKey="val"
                                    stroke="#FF4F00"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="#FF4F0010"
                                    animationDuration={0}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Activity className="w-8 h-8 text-black" />
                        <h3 className="text-4xl font-black uppercase tracking-tighter">Activity</h3>
                    </div>
                    <div className="border-4 border-black divide-y-4 divide-black bg-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {[
                            { event: 'Node WAT-001 High Temp', time: '12:04', status: 'WARN' },
                            { event: 'Sync: Zone Alpha', time: '11:58', status: 'OK' },
                            { event: 'Hardware Connected', time: '11:42', status: 'OK' },
                            { event: 'Battery Low: ENE-015', time: '10:15', status: 'FAIL' },
                        ].map((item, i) => (
                            <div key={i} className="p-5 flex items-center justify-between hover:bg-neutral-50 transition-none">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest">{item.event}</p>
                                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">{item.time} UTC</p>
                                </div>
                                <div className={cn(
                                    "px-2 py-1 border-2 border-black text-[9px] font-black uppercase tracking-widest",
                                    item.status === 'OK' ? "bg-black text-white" :
                                        item.status === 'WARN' ? "bg-[#FF4F00] text-white" :
                                            "bg-white text-black"
                                )}>
                                    {item.status}
                                </div>
                            </div>
                        ))}
                        <button className="w-full h-14 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-none border-t-4 border-black">
                            View All Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHomeView;
