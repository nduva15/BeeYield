import React from 'react';
import { Brain, TrendingUp, AlertCircle, Building2, FileText, Info, Zap, Activity, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';

interface PollinationIntelligenceProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const PREDICTION_DATA = [
    { stage: 'Early Bloom', yield: 400, bfh: 12 },
    { stage: '10% Bloom', yield: 650, bfh: 28 },
    { stage: 'King Bloom', yield: 1800, bfh: 84 },
    { stage: 'Petal Fall', yield: 2200, bfh: 120 },
];

const PollinationIntelligence: React.FC<PollinationIntelligenceProps> = ({ onTabChange }) => {
    const [activeHub, setActiveHub] = React.useState('Central Orchard');

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_#facc15]">
                            <Brain className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Pollination <span className="text-[#10b981]">Info</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        All Farm Info · Growth Predictions · Problem Check
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="border-4 border-[#064e3b] px-6 py-2 bg-[#064e3b] text-white flex flex-col items-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Prediction Accuracy</span>
                        <span className="text-xl font-black italic">94.2%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Data Hub Section (Merged Apiaries) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="border-4 border-[#064e3b] p-8 bg-white shadow-[10px_10px_0px_0px_#064e3b]">
                        <div className="flex items-center justify-between mb-8 border-b-2 border-[#064e3b]/10 pb-4">
                            <h3 className="text-xl font-black uppercase tracking-tight text-[#064e3b]">Connected Farms</h3>
                            <Building2 className="w-5 h-5 text-[#10b981]" />
                        </div>
                        <div className="space-y-4">
                            {['Central Orchard', 'North Block', 'Creek Side'].map(hub => (
                                <button
                                    key={hub}
                                    onClick={() => setActiveHub(hub)}
                                    className={cn(
                                        "w-full p-4 border-4 text-left transition-all flex justify-between items-center group",
                                        activeHub === hub ? "bg-[#064e3b] text-white border-[#064e3b]" : "bg-white text-[#064e3b] border-[#064e3b]/10 hover:border-[#064e3b]"
                                    )}
                                >
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest">{hub}</p>
                                        <p className={cn("text-[8px] font-bold uppercase", activeHub === hub ? "text-[#10b981]" : "text-[#064e3b]/40")}>12 Hives · Active</p>
                                    </div>
                                    <Activity className={cn("w-4 h-4", activeHub === hub ? "text-[#facc15]" : "text-[#064e3b]/10")} />
                                </button>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 border-2 border-dashed border-[#064e3b]/20 text-[10px] font-black uppercase text-[#064e3b]/40 hover:bg-[#064e3b]/5 transition-none">
                            + Connect New Farm
                        </button>
                    </div>

                    <div className="border-4 border-[#10b981] p-8 bg-[#10b981]/5 shadow-[10px_10px_0px_0px_#10b981]">
                        <div className="flex items-center gap-3 mb-4">
                            <Cpu className="w-5 h-5 text-[#064e3b]" />
                            <h4 className="text-lg font-black uppercase tracking-tight text-[#064e3b]">Smart Check</h4>
                        </div>
                        <p className="text-[10px] font-bold text-[#064e3b]/60 leading-relaxed uppercase">
                            Your farms now have **Smart Sensors**. Every hive helps us build a **Growth Chart** based on bee flight time.
                        </p>
                    </div>
                </div>

                {/* Intelligence Visuals (Merged Reports & Predict) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="border-4 border-[#064e3b] p-8 bg-white shadow-[12px_12px_0px_0px_#064e3b]">
                        <div className="flex items-center justify-between mb-8 border-b-2 border-[#064e3b]/10 pb-4">
                            <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-[#064e3b]">Growth <span className="text-[#10b981]">Chart</span></h3>
                                <p className="text-[10px] font-bold text-[#064e3b]/30 uppercase tracking-[0.2em] mt-1">Bloom Stage vs. Total Flight Time</p>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[#10b981]" />
                                    <span className="text-[8px] font-black uppercase">Predicted Pollination</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[#064e3b]" />
                                    <span className="text-[8px] font-black uppercase">Flight Time</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                                <ComposedChart data={PREDICTION_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#064e3b10" />
                                    <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#064e3b' }} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#064e3b', border: 'none', borderRadius: '0', color: 'white' }}
                                        itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                    />
                                    <Area type="monotone" dataKey="yield" fill="#10b98120" stroke="#10b981" strokeWidth={4} />
                                    <Line type="monotone" dataKey="bfh" stroke="#064e3b" strokeWidth={3} dot={{ fill: '#facc15', r: 6 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Gap Alert */}
                        <div className="border-4 border-red-500 p-8 bg-red-50 flex items-start gap-6">
                            <AlertCircle className="w-10 h-10 text-red-600 shrink-0" />
                            <div>
                                <h4 className="text-xl font-black text-red-600 uppercase tracking-tight mb-2">Growth Problem</h4>
                                <p className="text-[10px] font-bold text-red-600/70 uppercase leading-relaxed">
                                    Our model shows that the bees might not fly enough during peak bloom. We suggest adding 8 more hives to the North area to help.
                                </p>
                            </div>
                        </div>

                        {/* Audit Summary */}
                        <div className="border-4 border-[#064e3b] p-8 bg-[#064e3b]/3 flex items-start gap-6">
                            <FileText className="w-10 h-10 text-[#064e3b] shrink-0" />
                            <div>
                                <h4 className="text-xl font-black text-[#064e3b] uppercase tracking-tight mb-2">Farm Report: Seasonal</h4>
                                <p className="text-[10px] font-bold text-[#064e3b]/60 uppercase leading-relaxed">
                                    Your end-of-season report is now **ready**. Historical data is checked against hive sound logs automatically.
                                </p>
                                <button className="mt-4 text-[9px] font-black uppercase text-[#10b981] border-b-2 border-[#10b981]">Get Live Report</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PollinationIntelligence;
