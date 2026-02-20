import React from 'react';
import {
    Activity,
    MapPin,
    Zap,
    TrendingUp,
    ArrowUpRight,
    Search,
    Edit3,
    Download,
    Hexagon,
    Target,
    LayoutGrid
} from 'lucide-react';
import { IoTDevice, SensorReading, Apiary } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis } from 'recharts';

interface DashboardHomeViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    apiaries: Apiary[];
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const OrchardStatusCard: React.FC<{ orchard: Apiary; onAction: (tab: string) => void }> = ({ orchard, onAction }) => {
    // Simulated live metrics based on orchard data
    const activityScore = Math.floor(Math.random() * 4) + 6; // 6-10 range

    const sparkData = [
        { name: 'D1', bloom: 10, activity: 20 },
        { name: 'D2', bloom: 30, activity: 35 },
        { name: 'D3', bloom: 60, activity: 50 }, // Deficit starting
        { name: 'D4', bloom: 85, activity: 48 }, // Deficit peak
        { name: 'D5', bloom: 90, activity: 70 },
    ];

    return (
        <div className="border-4 border-[#064e3b] bg-white group hover:shadow-[12px_12px_0px_0px_rgba(45,90,39,1)] transition-all shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b-4 border-[#064e3b] bg-[#064e3b]/3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-[#064e3b] tracking-tighter uppercase">{orchard.name}</h3>
                        <p className="text-[10px] font-black uppercase text-[#10b981] tracking-widest mt-1">Variety: Almond (Nonpareil)</p>
                    </div>
                    <div className="w-10 h-10 border-2 border-[#064e3b] bg-white flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#064e3b]" />
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="p-6 flex-1 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/40">Bee Activity Score</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-5xl font-black text-[#064e3b] tabular-nums">{activityScore}</span>
                            <span className="text-xs font-black text-[#064e3b]/30">/ 10</span>
                        </div>
                    </div>
                    {/* Activity Gauge */}
                    <div className="w-16 h-8 bg-[#064e3b]/5 overflow-hidden relative flex items-end px-1 gap-0.5">
                        {[0.3, 0.5, 0.8, 1, 0.9, 0.7].map((h, i) => (
                            <div key={i} className="flex-1 bg-[#10b981]" style={{ height: `${h * 100}%` }} />
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/40">Bloom vs. Bee Pulse</p>
                        <span className="text-[9px] font-black text-[#facc15] uppercase">Alert: Coverage Deficit</span>
                    </div>
                    <div className="h-20 w-full bg-[#064e3b]/[0.02] border-2 border-[#064e3b]/5">
                        <ResponsiveContainer width="100%" height={80} minWidth={0} minHeight={0} debounce={50}>
                            <LineChart data={sparkData}>
                                <Line type="monotone" dataKey="bloom" stroke="#facc15" strokeWidth={3} dot={false} />
                                <Line type="monotone" dataKey="activity" stroke="#2D5A27" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-[#064e3b]/10 p-3">
                        <p className="text-[8px] font-black uppercase text-[#064e3b]/30">Current Bloom</p>
                        <p className="text-lg font-black text-[#064e3b]">85%</p>
                    </div>
                    <div className="border-2 border-[#064e3b]/10 p-3">
                        <p className="text-[8px] font-black uppercase text-[#064e3b]/30">FPA Ratio</p>
                        <p className="text-lg font-black text-[#10b981]">0.92</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 border-t-4 border-[#064e3b]">
                <button
                    onClick={() => onAction('orchard-mapper')}
                    className="p-4 flex flex-col items-center justify-center border-r-4 border-[#064e3b] hover:bg-[#064e3b] hover:text-white transition-none"
                >
                    <MapPin className="w-4 h-4 mb-2" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Map</span>
                </button>
                <button
                    onClick={() => onAction('bloom-tracking')}
                    className="p-4 flex flex-col items-center justify-center border-r-4 border-[#064e3b] hover:bg-[#064e3b] hover:text-white transition-none"
                >
                    <Edit3 className="w-4 h-4 mb-2" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Bloom</span>
                </button>
                <button
                    onClick={() => onAction('season-summary')}
                    className="p-4 flex flex-col items-center justify-center hover:bg-[#064e3b] hover:text-white transition-none"
                >
                    <Download className="w-4 h-4 mb-2" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Audit</span>
                </button>
            </div>
        </div>
    );
};

const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ apiaries, onTabChange }) => {
    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-[#064e3b] pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-2">
                        <Activity className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Executive Portfolio Summary</span>
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter uppercase leading-[0.8] text-[#064e3b]">
                        Orchard <span className="text-[#10b981]">Status</span>
                    </h1>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em] pt-2">
                        Cross-Property Pollination Analytics · Real-Time Coverage Scores
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-8 py-4 border-4 border-[#064e3b] bg-[#064e3b] text-white font-black text-sm uppercase tracking-[0.2em] shadow-[6px_6px_0px_0px_rgba(45,90,39,1)] italic">
                        FUND_RES: KES 142,500
                    </div>
                </div>
            </div>

            {/* Quick Portfolio Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { label: 'Total Acreage', val: '482 ac', icon: LayoutGrid },
                    { label: 'Mean Activity', val: '8.4', icon: Zap },
                    { label: 'Total Hives', val: '840', icon: Hexagon },
                    { label: 'Yield Confidence', val: '92%', icon: Target },
                ].map(stat => (
                    <div key={stat.label} className="border-4 border-[#064e3b] p-6 bg-[#064e3b]/3 relative overflow-hidden group">
                        <stat.icon className="absolute -right-4 -bottom-4 w-20 h-20 text-[#064e3b]/5 group-hover:rotate-12 transition-all" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/40">{stat.label}</p>
                        <p className="text-4xl font-black text-[#064e3b] mt-1 tabular-nums">{stat.val}</p>
                    </div>
                ))}
            </div>

            {/* AI Yield Summary Block */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-[#064e3b] text-white shadow-[12px_12px_0px_0px_rgba(16,185,129,1)] overflow-hidden">
                <div className="flex flex-col lg:flex-row divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-white/10">
                    <div className="p-10 flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-[#facc15]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter italic">AI YIELD PREDICTION</h3>
                                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Season Aggregate Forecast v4.2</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <span className="text-8xl font-black tabular-nums tracking-tighter italic">742.4</span>
                            <span className="text-2xl font-black text-[#10b981]">METRIC TONS</span>
                        </div>
                        <div className="flex items-center gap-4 pt-4 border-t-2 border-white/10">
                            <Badge className="bg-[#10b981] text-white rounded-none px-4 py-1 text-[10px] font-black italic">+12.8% YOY</Badge>
                            <p className="text-[10px] font-black uppercase text-white/40">Confidence Interval: [718.2 - 765.9]</p>
                        </div>
                    </div>
                    <div className="p-10 lg:w-96 bg-white flex flex-col justify-between">
                        <div>
                            <span className="text-[9px] font-black uppercase text-[#064e3b]/40 tracking-widest block mb-4">Risk Assessment</span>
                            <div className="space-y-4">
                                {[
                                    { label: 'Pests/Pathogens', val: 12, color: 'bg-green-500' },
                                    { label: 'Weather Impact', val: 8, color: 'bg-green-500' },
                                    { label: 'Hive Mortality', val: 4, color: 'bg-[#10b981]' },
                                ].map(risk => (
                                    <div key={risk.label} className="space-y-1">
                                        <div className="flex justify-between text-[9px] font-black uppercase text-[#064e3b]">
                                            <span>{risk.label}</span>
                                            <span>{risk.val}% RISK</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-neutral-100 border border-[#064e3b]/10">
                                            <div className={cn("h-full", risk.color)} style={{ width: `${risk.val}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button className="w-full h-12 mt-8 rounded-none bg-[#064e3b] text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
                            Generate Full Season Report
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Orchard Detail Cards */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b-4 border-[#064e3b]/10 pb-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Property Registry</h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/30">{apiaries.length} Active Orchards</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                    {apiaries.map(orchard => (
                        <OrchardStatusCard key={orchard.id} orchard={orchard} onAction={onTabChange} />
                    ))}
                    {/* Empty placeholder for adding new */}
                    <button className="border-4 border-dashed border-[#064e3b]/20 p-10 flex flex-col items-center justify-center hover:border-[#064e3b] hover:bg-[#064e3b]/3 transition-all">
                        <div className="w-16 h-16 border-4 border-dashed border-[#064e3b]/20 flex items-center justify-center mb-4">
                            <span className="text-4xl font-light text-[#064e3b]/30">+</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#064e3b]/40">Provision New Orchard</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHomeView;

