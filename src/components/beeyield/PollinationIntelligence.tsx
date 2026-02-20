import React, { useState, useMemo } from 'react';
import {
    Brain,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Zap,
    Target,
    Activity,
    ChevronDown,
    ArrowRight
} from 'lucide-react';
import {
    ComposedChart,
    Bar,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine
} from 'recharts';
import { cn } from '@/lib/utils';

interface PollinationIntelligenceProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const pulseData = [
    { day: 'Feb 10', bloom: 12, activity: 35, health: 88 },
    { day: 'Feb 11', bloom: 20, activity: 42, health: 86 },
    { day: 'Feb 12', bloom: 35, activity: 55, health: 87 },
    { day: 'Feb 13', bloom: 50, activity: 68, health: 85 },
    { day: 'Feb 14', bloom: 65, activity: 72, health: 84 },
    { day: 'Feb 15', bloom: 78, activity: 80, health: 83 },
    { day: 'Feb 16', bloom: 85, activity: 44, health: 79 }, // ← Deficit
    { day: 'Feb 17', bloom: 88, activity: 38, health: 76 }, // ← Deficit
    { day: 'Feb 18', bloom: 84, activity: 41, health: 75 },
    { day: 'Feb 19', bloom: 78, activity: 60, health: 78 },
    { day: 'Feb 20', bloom: 70, activity: 65, health: 80 },
];

const blockData = [
    { block: 'Block 1C', trees: 320, hives: 12, fpa: 0.94, deficitRisk: 'low' },
    { block: 'Block 2D', trees: 280, hives: 8, fpa: 0.71, deficitRisk: 'medium' },
    { block: 'Block 3A', trees: 410, hives: 6, fpa: 0.37, deficitRisk: 'high' },
    { block: 'Block 4B', trees: 350, hives: 14, fpa: 1.00, deficitRisk: 'low' },
];

const riskConfig = {
    low: { label: 'Optimal', color: 'text-[#10b981]', bg: 'bg-[#10b981]/10' },
    medium: { label: 'Deficit', color: 'text-[#b45309]', bg: 'bg-[#facc15]/20' },
    high: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#064e3b] border-4 border-[#10b981] p-4 min-w-[160px]">
            <p className="text-[#facc15] font-black text-[10px] uppercase tracking-widest mb-3">{label}</p>
            {payload.map((p: any) => (
                <div key={p.name} className="flex items-center justify-between gap-6 mb-1">
                    <span className="text-white/50 font-black text-[9px] uppercase">{p.name}</span>
                    <span className="text-white font-black text-xs tabular-nums">{p.value}{p.name === 'Health' ? '' : '%'}</span>
                </div>
            ))}
        </div>
    );
};

const PollinationIntelligence: React.FC<PollinationIntelligenceProps> = ({ onTabChange }) => {
    // Derive if there's a current deficit (bloom > 60 and activity < 50)
    const latestDay = pulseData[pulseData.length - 1];
    const hasDeficit = latestDay.bloom > 60 && latestDay.activity < 50;
    const deficitDays = pulseData.filter(d => d.bloom > 60 && d.activity < 50);

    // Yield prediction: simple model
    const avgActivity = pulseData.reduce((s, d) => s + d.activity, 0) / pulseData.length;
    const avgBloom = pulseData.reduce((s, d) => s + d.bloom, 0) / pulseData.length;
    const yieldScore = Math.round((avgActivity * 0.6 + avgBloom * 0.4) * 0.95);
    const yieldTons = ((yieldScore / 100) * 4200).toFixed(0);

    // HHI
    const hhi = Math.round(pulseData.reduce((s, d) => s + d.health, 0) / pulseData.length);
    // Flight Efficiency
    const flightEff = Math.round((avgActivity / 100) * 100);

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center">
                            <Brain className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Pollination <span className="text-[#10b981]">Intelligence</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Predictive Yield Modeling — Bloom vs. Activity Correlation
                    </p>
                </div>
            </div>

            {/* Deficit Alert */}
            {hasDeficit && (
                <div className="flex items-start gap-4 p-5 border-l-8 border-4 bg-[#facc15]/10 border-[#facc15] border-l-[#facc15]">
                    <AlertTriangle className="w-5 h-5 mt-0.5 text-[#b45309] shrink-0" />
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-[#b45309]">
                            ⚠ Pollination Deficit Detected — {deficitDays.length} Day(s)
                        </p>
                        <p className="text-[10px] font-bold text-neutral-500 mt-1">
                            Bloom saturation exceeded 60% while bee activity remained below 50%. Block 3A has critical under-coverage. Recommend relocating 4+ hives from Block 4B to Block 3A.
                        </p>
                    </div>
                </div>
            )}

            {/* KPI Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Yield Prediction', value: `${yieldTons} kg`, sub: `${yieldScore}% efficiency score`, icon: TrendingUp, accent: '#10b981' },
                    { label: 'Hive Health Index', value: `${hhi}/100`, sub: 'AI-generated composite score', icon: Activity, accent: '#064e3b' },
                    { label: 'Flight Efficiency', value: `${flightEff}%`, sub: 'Activity vs. conditions ratio', icon: Zap, accent: '#facc15' },
                ].map(kpi => (
                    <div key={kpi.label} className="border-4 border-[#064e3b] p-8 bg-white shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                        <div className="flex items-start justify-between mb-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064e3b]/40">{kpi.label}</p>
                            <div className="w-10 h-10 border-2 border-[#064e3b] flex items-center justify-center" style={{ background: kpi.accent }}>
                                <kpi.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-[#064e3b] tracking-tight tabular-nums">{kpi.value}</p>
                        <p className="text-[9px] font-black uppercase text-[#064e3b]/30 mt-2 tracking-widest">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Pollination Pulse Graph */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 border-b-4 border-[#064e3b] pb-4">
                    <Activity className="w-6 h-6 text-[#10b981]" />
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Pollination Pulse</h3>
                    <span className="text-[10px] font-black uppercase text-[#064e3b]/30 tracking-widest ml-2">3-Layer Correlation Chart</span>
                </div>
                <div className="border-4 border-[#064e3b] bg-white p-8 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={pulseData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#064e3b" strokeOpacity={0.05} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#064e3b', fontWeight: 900, fontSize: 9 }} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#064e3b', fontWeight: 900, fontSize: 9 }} />
                                <Tooltip content={<CustomTooltip />} />
                                {/* Deficit zone — when bloom high, activity low */}
                                <ReferenceLine x="Feb 16" stroke="rgba(239,68,68,0.3)" strokeWidth={24} strokeDasharray="0" label={{ value: 'DEFICIT', fill: '#ef4444', fontSize: 8, fontWeight: 900 }} />
                                <ReferenceLine x="Feb 17" stroke="rgba(239,68,68,0.3)" strokeWidth={24} />
                                {/* Bloom bars — Yellow */}
                                <Bar dataKey="bloom" name="Bloom %" fill="#facc15" fillOpacity={0.6} barSize={20} />
                                {/* Activity area — Green */}
                                <Area type="monotone" dataKey="activity" name="Activity %" stroke="#10b981" strokeWidth={3} fill="url(#activityGrad)" />
                                {/* Health line — White/Dark */}
                                <Line type="monotone" dataKey="health" name="Health" stroke="#064e3b" strokeWidth={2} dot={false} strokeDasharray="4 3" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap items-center gap-8 pt-4 border-t-2 border-[#064e3b]/10 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-4 bg-[#facc15]/60" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/40">Bloom Stage %</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-1 bg-[#10b981]" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/40">Bee Activity %</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0 border-t-2 border-dashed border-[#064e3b]" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/40">Hive Health Index</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-4 bg-red-400/25" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/40">Deficit Window</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Block Recommendation Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 border-b-4 border-[#064e3b] pb-4">
                    <Target className="w-5 h-5 text-[#10b981]" />
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Block Efficiency Report</h3>
                </div>
                <div className="border-4 border-[#064e3b] overflow-hidden shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                    <table className="w-full">
                        <thead className="bg-[#064e3b]">
                            <tr>
                                {['Block', 'Trees', 'Hives', 'FPA', 'Coverage', 'Status'].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-[#064e3b]/5">
                            {blockData.map(block => {
                                const risk = riskConfig[block.deficitRisk as keyof typeof riskConfig];
                                const coveragePct = Math.round((block.fpa / 1.0) * 100);
                                return (
                                    <tr key={block.block} className="hover:bg-[#064e3b]/3 transition-none">
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-black text-[#064e3b]">{block.block}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-black tabular-nums">{block.trees}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-black tabular-nums">{block.hives}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-black tabular-nums text-[#10b981]">{block.fpa.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-24 bg-[#064e3b]/10">
                                                    <div
                                                        className={cn("h-full", coveragePct > 80 ? "bg-[#10b981]" : coveragePct > 50 ? "bg-[#facc15]" : "bg-red-500")}
                                                        style={{ width: `${Math.min(100, coveragePct)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-[#064e3b]/50 tabular-nums">{coveragePct}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn("px-3 py-1.5 text-[9px] font-black uppercase tracking-widest", risk.bg, risk.color)}>
                                                {risk.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PollinationIntelligence;
