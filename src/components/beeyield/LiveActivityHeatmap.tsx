import React from 'react';
import { MapPin, Zap, Info, Layers, PieChart, Activity, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';

interface LiveActivityHeatmapProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const POLLINATOR_DATA = [
    { name: 'Honeybees', value: 72, color: '#facc15' },
    { name: 'Bumblebees', value: 18, color: '#10b981' },
    { name: 'Hoverflies', value: 10, color: '#064e3b' },
];

const LiveActivityHeatmap: React.FC<LiveActivityHeatmapProps> = ({ onTabChange }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [activeSector, setActiveSector] = React.useState<number | null>(null);
    const [pulseOpacity, setPulseOpacity] = React.useState(0.4);

    // Simulated "Pulse" animation for the heatmap
    React.useEffect(() => {
        const interval = setInterval(() => {
            setPulseOpacity(prev => (prev === 0.4 ? 0.7 : 0.4));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const sectors = React.useMemo(() => {
        return Array.from({ length: 24 }).map((_, i) => ({
            id: i,
            vpm: Math.floor(Math.random() * 12) + 6, // 6-18 VPM range
            intensity: Math.random(),
        }));
    }, []);

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8 relative z-10">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_#facc15]">
                            <Layers className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            PIP <span className="text-[#10b981]">Heatmap</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Live Activity Visualizer · Flower Visit Intensity · Multi-Species Tracking
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-[#064e3b] p-1 border-4 border-[#064e3b] shadow-[4px_4px_0px_0px_#10b981]">
                        <div className="px-4 py-2 bg-white flex items-center gap-2">
                            <Activity className="w-3 h-3 text-[#10b981] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">Live Stream Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                {/* Map View Area */}
                <div className="lg:col-span-8 relative">
                    <div className="border-8 border-[#064e3b] bg-[#064e3b]/5 h-[600px] relative overflow-hidden shadow-[20px_20px_0px_px_rgba(6,78,59,0.05)]">
                        {/* Mock Satellite Background */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center grayscale" />

                        {/* Heatmap Grid Overlay */}
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 p-4 gap-2">
                            {sectors.map((s) => (
                                <div
                                    key={s.id}
                                    onMouseEnter={() => setActiveSector(s.id)}
                                    onMouseLeave={() => setActiveSector(null)}
                                    className={cn(
                                        "transition-all duration-700 cursor-crosshair border-2 border-[#064e3b]/10 flex flex-col items-center justify-center group",
                                        s.intensity > 0.7 ? "bg-[#facc15]" : s.intensity > 0.4 ? "bg-[#10b981]" : "bg-[#064e3b]/20"
                                    )}
                                    style={{
                                        opacity: activeSector === s.id ? 0.9 : (s.intensity > 0.7 ? pulseOpacity : 0.4),
                                    }}
                                >
                                    {activeSector === s.id && (
                                        <div className="bg-[#064e3b] text-white p-2 border-2 border-white pointer-events-none transform -translate-y-8 animate-in fade-in slide-in-from-bottom-2">
                                            <p className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">{s.vpm} Visits/Min</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Glassmorphism Legend Overlay */}
                        <div className="absolute bottom-6 left-6 backdrop-blur-md bg-white/10 border-4 border-[#064e3b] p-6 shadow-2xl max-w-xs">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-[#064e3b]">Visit Intensity Legend</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-3 bg-[#facc15]" />
                                    <span className="text-[9px] font-black uppercase text-[#064e3b]/60">High Activity (Bloom Peak)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-3 bg-[#10b981]" />
                                    <span className="text-[9px] font-black uppercase text-[#064e3b]/60">Stable Coverage</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-3 bg-[#064e3b]/20" />
                                    <span className="text-[9px] font-black uppercase text-[#064e3b]/60">Low / Potential Gap</span>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-3 border-4 border-[#064e3b] text-[9px] font-black uppercase tracking-widest hover:bg-[#064e3b] hover:text-white transition-none">
                                Optimize Hive Placement
                            </button>
                        </div>

                        {/* Zoom Controls */}
                        <div className="absolute top-6 right-6 flex flex-col gap-2">
                            <button className="w-10 h-10 bg-white border-4 border-[#064e3b] flex items-center justify-center hover:bg-[#064e3b] hover:text-white transition-none">
                                <Maximize2 className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 bg-white border-4 border-[#064e3b] flex items-center justify-center hover:bg-[#064e3b] hover:text-white transition-none">
                                <Minimize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pollinator Mix Analysis */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="border-4 border-[#064e3b] p-8 bg-white shadow-[10px_10px_0px_0px_#10b981]">
                        <div className="flex items-center gap-3 mb-8 border-b-2 border-[#064e3b]/10 pb-4">
                            <PieChart className="w-5 h-5 text-[#10b981]" />
                            <h3 className="text-xl font-black uppercase tracking-tight text-[#064e3b]">Pollinator Mix</h3>
                        </div>

                        <div className="h-64 w-full relative">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                                <RePieChart>
                                    <Pie
                                        data={POLLINATOR_DATA}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {POLLINATOR_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ReTooltip
                                        contentStyle={{ backgroundColor: '#064e3b', border: 'none', padding: '8px' }}
                                        itemStyle={{ color: 'white', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                            {/* Center Label */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[8px] font-black text-[#064e3b]/30 uppercase tracking-widest">Total Visits</p>
                                <p className="text-2xl font-black text-[#064e3b]">14.2<span className="text-xs">/m</span></p>
                            </div>
                        </div>

                        <div className="space-y-4 mt-8">
                            {POLLINATOR_DATA.map((p) => (
                                <div key={p.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 border-2 border-[#064e3b]" style={{ backgroundColor: p.color }} />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">{p.name}</span>
                                    </div>
                                    <span className="text-sm font-black tabular-nums">{p.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* VPM Summary */}
                    <div className="border-4 border-[#064e3b] p-8 bg-[#064e3b] text-white shadow-[10px_10px_0px_0px_#facc15]">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">Bloom-Sync Evaluation</h4>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <p className="text-4xl font-black text-[#facc15]">14.2</p>
                                    <p className="text-[10px] font-black uppercase text-white/60">Avg VPM</p>
                                </div>
                                <div className="h-4 w-full bg-white/10 relative">
                                    <div className="absolute inset-y-0 bg-[#10b981]" style={{ width: '78%', left: '0%' }} />
                                    {/* Optimal target range indicator */}
                                    <div className="absolute inset-y-0 border-x-4 border-white/40" style={{ left: '60%', width: '30%' }} />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Target: 12-18</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[#10b981]">Good VPM Range</span>
                                </div>
                            </div>

                            <p className="text-[9px] font-bold text-white/40 leading-relaxed uppercase">
                                Current flower visit density matches prediction for the 85% bloom stage. No immediate hive adjustment required for sector 12-F.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Branding */}
            <div className="absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none rotate-12 select-none">
                <p className="text-[200px] font-black uppercase leading-none text-[#064e3b]">BEEYIELD</p>
            </div>
        </div>
    );
};

export default LiveActivityHeatmap;
