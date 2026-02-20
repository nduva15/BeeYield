import React from 'react';
import { Target, Move, Zap, TrendingUp, Info, Activity, ShieldAlert, Crosshair, Hexagon, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ForagingOptimizerProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

// Simulated Calculus Data: Net Energy Yield (Phi) over Time
const FORAGING_MATH = [
    { t: 0, phi: 120, baseline: 100 },
    { t: 2, phi: 150, baseline: 100 },
    { t: 4, phi: 310, baseline: 110 },
    { t: 6, phi: 450, baseline: 120 },
    { t: 8, phi: 410, baseline: 120 },
    { t: 10, phi: 520, baseline: 130 },
];

const ForagingOptimizer: React.FC<ForagingOptimizerProps> = ({ onTabChange }) => {
    const [viewMode, setViewMode] = React.useState<'MAP' | 'MATH'>('MAP');

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_#facc15]">
                            <Target className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Bee <span className="text-[#10b981]">Optimizer</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Flower Tracking · Yield Map · Growth Math
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setViewMode('MAP')}
                        className={cn(
                            "px-6 py-2 font-black text-[10px] uppercase tracking-widest border-4 transition-all",
                            viewMode === 'MAP' ? "bg-[#064e3b] text-white border-[#064e3b]" : "bg-white text-[#064e3b] border-[#064e3b]/10"
                        )}
                    >Flower Map</button>
                    <button
                        onClick={() => setViewMode('MATH')}
                        className={cn(
                            "px-6 py-2 font-black text-[10px] uppercase tracking-widest border-4 transition-all",
                            viewMode === 'MATH' ? "bg-[#064e3b] text-white border-[#064e3b]" : "bg-white text-[#064e3b] border-[#064e3b]/10"
                        )}
                    >Yield Math</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Visualizer Area */}
                <div className="lg:col-span-8 space-y-8">
                    {viewMode === 'MAP' ? (
                        <div className="border-8 border-[#064e3b] bg-[#f9f9f9] h-[550px] relative overflow-hidden shadow-[15px_15px_0px_0px_rgba(6,78,59,1)] group">
                            <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 opacity-20 pointer-events-none">
                                {Array.from({ length: 96 }).map((_, i) => (
                                    <div key={i} className="border border-[#064e3b]/10" />
                                ))}
                            </div>

                            <svg className="absolute inset-0 w-full h-full opacity-40">
                                <circle cx="30%" cy="40%" r="200" fill="url(#gradientGreen)" />
                                <circle cx="70%" cy="60%" r="150" fill="url(#gradientYellow)" />
                                <defs>
                                    <radialGradient id="gradientGreen">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="transparent" />
                                    </radialGradient>
                                    <radialGradient id="gradientYellow">
                                        <stop offset="0%" stopColor="#facc15" />
                                        <stop offset="100%" stopColor="transparent" />
                                    </radialGradient>
                                </defs>
                            </svg>

                            <svg className="absolute inset-0 w-full h-full">
                                <path
                                    d="M 100,250 Q 250,100 400,300 T 700,200"
                                    fill="none"
                                    stroke="#064e3b"
                                    strokeWidth="2"
                                    strokeDasharray="8 4"
                                    className="animate-dash"
                                />
                            </svg>

                            <div className="absolute top-1/4 left-1/3 p-4 bg-white border-4 border-[#064e3b] shadow-[6px_6px_0px_0px_#10b981] group-hover:-translate-y-2 transition-transform">
                                <p className="text-[10px] font-black uppercase text-[#064e3b] mb-1">Best Hive Spot</p>
                                <p className="text-[8px] font-bold text-[#10b981] uppercase">Honey Gain: High</p>
                            </div>

                            <div className="absolute bottom-8 right-8 flex items-center gap-4 bg-[#064e3b] text-white p-4 border-2 border-[#10b981] shadow-xl">
                                <Crosshair className="w-5 h-5 text-[#facc15]" />
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase">Optimization Update</p>
                                    <p className="text-[8px] font-bold opacity-60 uppercase">Moving bees 40m North for better flowers.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="border-8 border-[#064e3b] bg-white h-[550px] p-10 flex flex-col shadow-[15px_15px_0px_0px_rgba(16,185,129,1)]">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter text-[#064e3b]">Honey <span className="text-[#10b981]">Gain</span></h3>
                                        <p className="text-[10px] font-bold text-[#064e3b]/30 uppercase tracking-[0.2em] mt-1">Calculated based on bee field activity</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black text-[#064e3b]">Score: 520</p>
                                        <p className="text-[10px] font-black text-[#10b981] uppercase">Efficiency: Good</p>
                                    </div>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                                        <AreaChart data={FORAGING_MATH}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#064e3b10" />
                                            <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#064e3b50' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#064e3b50' }} />
                                            <Area type="monotone" dataKey="phi" stroke="#10b981" strokeWidth={4} fill="#10b98120" />
                                            <Area type="step" dataKey="baseline" stroke="#064e3b20" strokeWidth={2} fill="none" strokeDasharray="5 5" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="mt-8 border-t-4 border-[#064e3b] pt-8 grid grid-cols-3 gap-8">
                                <div>
                                    <p className="text-[8px] font-black uppercase text-[#064e3b]/30">Energy Cost</p>
                                    <p className="text-xl font-black text-[#064e3b]">Normal</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-[#064e3b]/30">Honey Return</p>
                                    <p className="text-xl font-black text-[#10b981]">0.85 mg / Bee</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-[#064e3b]/30">Profit Score</p>
                                    <p className="text-xl font-black text-[#064e3b]">Very High</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Science & Alerts */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="border-4 border-[#064e3b] p-8 bg-white shadow-[10px_10px_0px_0px_#064e3b]">
                        <div className="flex items-center gap-3 mb-8 border-b-2 border-[#064e3b]/10 pb-4">
                            <Brain className="w-5 h-5 text-[#10b981]" />
                            <h3 className="text-xl font-black uppercase text-[#064e3b] tracking-tight">Bee Activity</h3>
                        </div>
                        <div className="space-y-6">
                            {[
                                { label: 'Working Bees', val: '84%', status: 'GOOD' },
                                { label: 'Visits Per Minute', val: '14.8', status: 'BEST' },
                                { label: 'Flower Match', val: '92%', status: 'SYNCED' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-[#064e3b]/40">{item.label}</p>
                                        <p className="text-lg font-black text-[#064e3b] group-hover:text-[#10b981] transition-colors">{item.val}</p>
                                    </div>
                                    <span className="text-[8px] font-black px-2 py-1 bg-[#064e3b]/5 border border-[#064e3b]/10">{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-4 border-[#facc15] p-8 bg-[#facc15]/5 shadow-[10px_10px_0px_0px_#facc15]">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldAlert className="w-6 h-6 text-[#064e3b]" />
                            <h3 className="text-xl font-black uppercase text-[#064e3b] tracking-tight">Profit Check</h3>
                        </div>
                        <p className="text-[10px] font-bold text-[#064e3b]/60 leading-relaxed uppercase mb-6">
                            Bees are losing energy in Sector 4 due to high winds. The honey gain is currently lower than what the bees are spending to fly there.
                        </p>
                        <button className="w-full py-4 bg-[#064e3b] text-white font-black text-[10px] uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(6,78,59,0.3)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            Fix: Move 50m East
                        </button>
                    </div>

                    <div className="p-6 bg-[#064e3b] border-4 border-[#064e3b] text-white flex items-start gap-4 shadow-[10px_10px_0px_0px_rgba(16,185,129,0.2)]">
                        <Activity className="w-10 h-10 text-[#facc15]" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Live Flight Check</p>
                            <p className="text-[9px] font-bold opacity-60 leading-relaxed uppercase mt-1">
                                Bees are using the sun to find their way home. We are tracking their return rates in real-time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes dash {
                    to {
                        stroke-dashoffset: -100;
                    }
                }
                .animate-dash {
                    animation: dash 20s linear infinite;
                    stroke-dashoffset: 0;
                }
            `}</style>
        </div>
    );
};

export default ForagingOptimizer;
