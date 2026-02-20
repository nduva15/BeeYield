import React, { useState, useMemo } from 'react';
import { Calculator, Zap, Target, TrendingUp, Info, ArrowRight, Save, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface PollinationEngineProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

interface Scenario {
    hivesPerAcre: number;
    framesPerHive: number;
    label: string;
}

const CircularGauge: React.FC<{ value: number; max: number; label: string }> = ({ value, max, label }) => {
    const pct = Math.min(1, value / max);
    const R = 40;
    const circumference = 2 * Math.PI * R;
    const dash = circumference * pct;
    const color = pct >= 0.85 ? '#10b981' : pct >= 0.6 ? '#facc15' : '#ef4444';

    return (
        <div className="flex flex-col items-center gap-3">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={R} fill="none" stroke="#064e3b10" strokeWidth="8" />
                <circle
                    cx="50" cy="50" r={R}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeDasharray={`${dash} ${circumference}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-1000 ease-out"
                />
                <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontSize="18" fill="#064e3b" style={{ fontWeight: 900 }}>
                    {Math.round(pct * 100)}%
                </text>
            </svg>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">{label}</p>
        </div>
    );
};

const PollinationEngine: React.FC<PollinationEngineProps> = ({ onTabChange }) => {
    const [schemeA, setSchemeA] = useState<Scenario>({ hivesPerAcre: 2, framesPerHive: 8, label: 'Scheme A (Standard)' });
    const [schemeB, setSchemeB] = useState<Scenario>({ hivesPerAcre: 1.5, framesPerHive: 10, label: 'Scheme B (Premium)' });

    // Model Constants
    const TARGET_FPA = 1.0; // Frames per acre target
    const PRICE_PER_HIVE = 180; // $
    const VARIETY_MULTIPLIER = 1.25; // Technical multiplier for Almonds

    const statsA = useMemo(() => {
        const fpa = (schemeA.hivesPerAcre * schemeA.framesPerHive) / 10; // Normalized FPA
        const cost = schemeA.hivesPerAcre * PRICE_PER_HIVE;
        const setProbability = Math.min(100, fpa * 100 * VARIETY_MULTIPLIER);
        return { fpa, cost, setProbability };
    }, [schemeA]);

    const statsB = useMemo(() => {
        const fpa = (schemeB.hivesPerAcre * schemeB.framesPerHive) / 10;
        const cost = schemeB.hivesPerAcre * PRICE_PER_HIVE;
        const setProbability = Math.min(100, fpa * 100 * VARIETY_MULTIPLIER);
        return { fpa, cost, setProbability };
    }, [schemeB]);

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center">
                            <Calculator className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Bee <span className="text-[#10b981]">Calculator</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Technical Sandbox · Scenario Modeling · ROI Estimation
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 border-4 border-[#064e3b] bg-[#064e3b] text-white">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Target FPA</p>
                        <p className="text-xl font-black text-[#facc15]">1.00 <span className="text-[10px] text-white/60">Frames/Ac</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Scheme A */}
                <div className="border-4 border-[#064e3b] p-8 space-y-8 bg-[#064e3b]/3 shadow-[10px_10px_0px_0px_rgba(6,78,59,1)]">
                    <div className="flex items-center justify-between border-b-2 border-[#064e3b]/10 pb-4">
                        <h3 className="text-xl font-black uppercase tracking-tight">{schemeA.label}</h3>
                        <Zap className="w-4 h-4 text-[#10b981]" />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest">Hives per Acre</label>
                                <span className="text-sm font-black text-[10px]">{schemeA.hivesPerAcre} h/ac</span>
                            </div>
                            <input
                                type="range" min="0.5" max="4" step="0.1"
                                value={schemeA.hivesPerAcre}
                                onChange={(e) => setSchemeA({ ...schemeA, hivesPerAcre: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-[#064e3b]/10 appearance-none cursor-pointer accent-[#064e3b]"
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest">Frames per Hive</label>
                                <span className="text-sm font-black text-[10px]">{schemeA.framesPerHive} f/h</span>
                            </div>
                            <input
                                type="range" min="4" max="14" step="1"
                                value={schemeA.framesPerHive}
                                onChange={(e) => setSchemeA({ ...schemeA, framesPerHive: parseInt(e.target.value) })}
                                className="w-full h-2 bg-[#064e3b]/10 appearance-none cursor-pointer accent-[#10b981]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-6">
                        <CircularGauge value={statsA.setProbability} max={100} label="Pollination Set" />
                        <div className="border-4 border-[#064e3b] p-4 flex flex-col justify-center">
                            <p className="text-[9px] font-black uppercase text-[#064e3b]/40">Est. Cost/Acre</p>
                            <p className="text-3xl font-black text-[#064e3b] tabular-nums">${statsA.cost.toFixed(0)}</p>
                            <div className="mt-2 h-1 bg-[#064e3b]/10 w-full">
                                <div className="h-full bg-[#10b981]" style={{ width: `${Math.min(100, statsA.fpa * 100)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scheme B */}
                <div className="border-4 border-[#064e3b] p-8 space-y-8 bg-white shadow-[10px_10px_0px_0px_rgba(250,204,21,1)]">
                    <div className="flex items-center justify-between border-b-2 border-[#064e3b]/10 pb-4">
                        <h3 className="text-xl font-black uppercase tracking-tight">{schemeB.label}</h3>
                        <Target className="w-4 h-4 text-[#facc15]" />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest">Hives per Acre</label>
                                <span className="text-sm font-black text-[10px]">{schemeB.hivesPerAcre} h/ac</span>
                            </div>
                            <input
                                type="range" min="0.5" max="4" step="0.1"
                                value={schemeB.hivesPerAcre}
                                onChange={(e) => setSchemeB({ ...schemeB, hivesPerAcre: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-[#064e3b]/10 appearance-none cursor-pointer accent-[#064e3b]"
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest">Frames per Hive</label>
                                <span className="text-sm font-black text-[10px]">{schemeB.framesPerHive} f/h</span>
                            </div>
                            <input
                                type="range" min="4" max="14" step="1"
                                value={schemeB.framesPerHive}
                                onChange={(e) => setSchemeB({ ...schemeB, framesPerHive: parseInt(e.target.value) })}
                                className="w-full h-2 bg-[#064e3b]/10 appearance-none cursor-pointer accent-[#10b981]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-6">
                        <CircularGauge value={statsB.setProbability} max={100} label="Pollination Set" />
                        <div className="border-4 border-[#064e3b] p-4 flex flex-col justify-center">
                            <p className="text-[9px] font-black uppercase text-[#064e3b]/40">Est. Cost/Acre</p>
                            <p className="text-3xl font-black text-[#064e3b] tabular-nums">${statsB.cost.toFixed(0)}</p>
                            <div className="mt-2 h-1 bg-[#064e3b]/10 w-full">
                                <div className="h-full bg-[#facc15]" style={{ width: `${Math.min(100, statsB.fpa * 100)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis Result */}
            <div className="border-8 border-[#064e3b] p-10 bg-[#10b981]/5 shadow-[15px_15px_0px_0px_#064e3b]">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="shrink-0 w-24 h-24 bg-[#064e3b] flex items-center justify-center">
                        <TrendingUp className="w-12 h-12 text-[#facc15]" />
                    </div>
                    <div className="flex-1 space-y-3 text-center md:text-left">
                        <h3 className="text-4xl font-black uppercase tracking-tighter">ROI Delta Analysis</h3>
                        <p className="text-xs font-bold text-[#064e3b]/70 max-w-2xl uppercase">
                            {statsA.setProbability > statsB.setProbability
                                ? "Scheme A offers superior biological set probability (+" + (statsA.setProbability - statsB.setProbability).toFixed(1) + "%)."
                                : "Scheme B offers superior biological set probability (+" + (statsB.setProbability - statsA.setProbability).toFixed(1) + "%)."}
                            Given tree age data, a minimum FPA of {TARGET_FPA.toFixed(2)} is recommended for 100% variety set coverage.
                        </p>
                    </div>
                    <div className="border-l-4 border-[#064e3b]/10 pl-10 hidden md:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/40">Cost Delta / Ac</p>
                        <p className="text-4xl font-black text-[#064e3b] tabular-nums">${Math.abs(statsA.cost - statsB.cost).toFixed(0)}</p>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onTabChange('precision-pollination-home', 'Calculation results modeled and ready.', 'commit-plan')}
                className="w-full py-6 bg-[#064e3b] text-white font-black uppercase tracking-[0.4em] text-sm hover:translate-x-1 hover:translate-y-1 transition-all shadow-[8px_8px_0px_0px_#10b981] active:shadow-none active:translate-x-2 active:translate-y-2"
            >
                Commit Modeling to Mission Control
            </button>
        </div>
    );
};

export default PollinationEngine;
