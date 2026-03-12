import React, { useState, useMemo } from 'react';
import {
    Calculator,
    Plus,
    Minus,
    AlertTriangle,
    CheckCircle2,
    Zap,
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { calculatePollinationMetrics, CalculationInputs } from '@/lib/pollinationCalculations';

const PollinationCalcs: React.FC = () => {
    // Calc Engine State
    const [calcInputs, setCalcInputs] = useState<CalculationInputs>({
        totalAcres: 50,
        hives: Array(10).fill(null).map((_, i) => ({
            frameCount: 8,
            isStrong: i % 3 !== 0,
            isLarge: i % 2 === 0
        })),
        forageCondition: 0.8,
        bloomIntensity: 0.9
    });

    const metrics = useMemo(() => calculatePollinationMetrics(calcInputs), [calcInputs]);

    return (
        <div className="min-h-screen bg-[#FFF9F0] text-[#064e3b] font-sans antialiased p-8 md:p-12">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Back Link */}
                <Link to="/precision-pollination" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#10b981] hover:text-[#064e3b] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Overview
                </Link>

                {/* Header */}
                <div className="border-b-4 border-[#064e3b] pb-8">
                    <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">
                        Pollination <span className="text-[#10b981]">Calcs</span>
                    </h1>
                    <p className="text-[#064e3b]/40 font-black uppercase text-[10px] tracking-[0.4em] mt-4">
                        Precision Dynamic Yield Engine // v2.4.0
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Parameters Panel */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="border-4 border-[#064e3b] p-8 bg-[#FFF9F0] shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                            <div className="flex items-center gap-4 mb-8">
                                <Calculator className="w-8 h-8 text-[#10b981]" />
                                <h3 className="text-2xl font-black uppercase tracking-tight text-[#064e3b]">Parameters</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Total Area (Acres)</label>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => setCalcInputs(prev => ({ ...prev, totalAcres: Math.max(1, prev.totalAcres - 5) }))}
                                            className="w-12 h-12 border-4 border-[#064e3b] bg-[#FFF9F0] flex items-center justify-center hover:bg-[#facc15]/10"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <div className="flex-1 h-12 border-y-4 border-[#064e3b] flex items-center justify-center font-black text-xl">
                                            {calcInputs.totalAcres}
                                        </div>
                                        <button
                                            onClick={() => setCalcInputs(prev => ({ ...prev, totalAcres: prev.totalAcres + 5 }))}
                                            className="w-12 h-12 border-4 border-[#064e3b] bg-[#FFF9F0] flex items-center justify-center hover:bg-[#facc15]/10"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Bloom Intensity (0.1 - 1.0)</label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1.0"
                                        step="0.1"
                                        value={calcInputs.bloomIntensity}
                                        onChange={(e) => setCalcInputs(prev => ({ ...prev, bloomIntensity: parseFloat(e.target.value) }))}
                                        className="w-full accent-[#10b981] h-2 bg-neutral-100 rounded-none appearance-none"
                                    />
                                    <div className="flex justify-between mt-2 font-black text-[10px] uppercase">
                                        <span>Low</span>
                                        <span className="text-[#10b981]">{Math.round(calcInputs.bloomIntensity * 100)}%</span>
                                        <span>Industrial</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Forage Competition</label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1.0"
                                        step="0.1"
                                        value={calcInputs.forageCondition}
                                        onChange={(e) => setCalcInputs(prev => ({ ...prev, forageCondition: parseFloat(e.target.value) }))}
                                        className="w-full accent-[#064e3b] h-2 bg-neutral-100 rounded-none appearance-none"
                                    />
                                    <div className="flex justify-between mt-2 font-black text-[10px] uppercase">
                                        <span>High Comp</span>
                                        <span className="text-[#064e3b]">{Math.round(calcInputs.forageCondition * 100)}%</span>
                                        <span>Clear Sky</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Output */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="border-4 border-[#064e3b] p-8 bg-[#FFF9F0] space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total Frames Deployed</p>
                                <h4 className="text-6xl font-black">{metrics.totalFrames}</h4>
                                <div className="flex items-center gap-2 px-3 py-1 bg-neutral-100 border-2 border-black inline-flex">
                                    <div className="w-2 h-2 bg-[#FFF9F0]" />
                                    <span className="text-[8px] font-black uppercase">Standard Count</span>
                                </div>
                            </div>
                            <div className="border-4 border-[#064e3b] p-8 bg-[#facc15] space-y-4 shadow-[8px_8px_0px_0px_#064e3b]">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/60">Effective Frames (Bee Mathâ„¢)</p>
                                <h4 className="text-6xl font-black">{metrics.effectiveFrames}</h4>
                                <div className="flex items-center gap-2 px-3 py-1 bg-[#FFF9F0] border-2 border-[#064e3b] inline-flex">
                                    <Zap className="w-3 h-3 text-[#10b981] fill-current" />
                                    <span className="text-[8px] font-black uppercase text-[#064e3b]">Adjusted Force</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-4 border-[#064e3b] p-10 bg-[#FFF9F0] grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-4">Frames Per Acre (FPA)</p>
                                <div className="text-5xl font-black">{metrics.framesPerAcre}</div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-[#10b981]">Effective FPA</p>
                                <div className="text-5xl font-black text-[#10b981]">{metrics.effectiveFPA}</div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-4">Efficacy Index</p>
                                <div className="text-5xl font-black">{metrics.pollinationEfficacy}%</div>
                            </div>
                        </div>

                        <div className={cn(
                            "border-4 p-8 flex items-start gap-6",
                            metrics.pollinationEfficacy < 60 ? "border-red-500 bg-red-50" :
                                metrics.pollinationEfficacy < 85 ? "border-[#facc15] bg-[#facc15]/10" : "border-[#10b981] bg-[#10b981]/5"
                        )}>
                            {metrics.pollinationEfficacy < 60 ? <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" /> : <CheckCircle2 className="w-8 h-8 text-[#10b981] shrink-0" />}
                            <div className="space-y-2">
                                <h5 className="font-black uppercase text-xs tracking-widest">Protocol Recommendation</h5>
                                <p className="text-lg font-bold leading-tight">{metrics.recommendation}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hive Inventory */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b-4 border-black pb-4">
                        <h3 className="text-3xl font-black uppercase tracking-tighter">Colony Inventory & Strength Logic</h3>
                        <button
                            onClick={() => setCalcInputs(prev => ({
                                ...prev,
                                hives: [...prev.hives, { frameCount: 8, isStrong: true, isLarge: false }]
                            }))}
                            className="px-6 py-2 border-4 border-black font-black uppercase text-xs hover:bg-[#FFF9F0] hover:text-[#1A1A1A] transition-none"
                        >
                            Add Unit
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {calcInputs.hives.map((hive, idx) => (
                            <div key={idx} className="border-4 border-[#064e3b] p-6 bg-[#FFF9F0] space-y-4 relative group">
                                <button
                                    onClick={() => setCalcInputs(prev => ({ ...prev, hives: prev.hives.filter((_, i) => i !== idx) }))}
                                    className="absolute top-4 right-4 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-none"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <div className="text-[10px] font-black uppercase opacity-40">Unit #{idx + 1}</div>
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-2xl">{hive.frameCount} FR</span>
                                    <div className="flex gap-1">
                                        {[...Array(hive.frameCount)].map((_, i) => (
                                            <div key={i} className="w-1.5 h-4 bg-[#10b981]" />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const newHives = [...calcInputs.hives];
                                            newHives[idx].isStrong = !newHives[idx].isStrong;
                                            setCalcInputs(prev => ({ ...prev, hives: newHives }));
                                        }}
                                        className={cn("flex-1 py-1 border-2 text-[8px] font-black uppercase", hive.isStrong ? "bg-[#10b981] text-[#1A1A1A] border-[#10b981]" : "border-[#064e3b]")}
                                    >
                                        Strong
                                    </button>
                                    <button
                                        onClick={() => {
                                            const newHives = [...calcInputs.hives];
                                            newHives[idx].isLarge = !newHives[idx].isLarge;
                                            setCalcInputs(prev => ({ ...prev, hives: newHives }));
                                        }}
                                        className={cn("flex-1 py-1 border-2 text-[8px] font-black uppercase", hive.isLarge ? "bg-[#064e3b] text-[#1A1A1A] border-[#064e3b]" : "border-[#064e3b]")}
                                    >
                                        Large
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PollinationCalcs;
