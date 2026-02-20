import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Calculator,
    Map as MapIcon,
    Target,
    Zap,
    ArrowRight,
    Info,
    AlertCircle,
    BarChart3,
    Layers,
    Navigation2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const HpaOptimizer: React.FC = () => {
    const [acreage, setAcreage] = useState(40);
    const [treeDensity, setTreeDensity] = useState('high'); // high, medium, low
    const [variety, setVariety] = useState('almond');

    // Simple calculus-inspired logic for suggested HPA
    const calculateSuggestedHPA = () => {
        let base = 2.0;
        if (treeDensity === 'high') base += 0.5;
        if (treeDensity === 'low') base -= 0.5;
        if (variety === 'cherry') base += 0.2;
        return base;
    };

    const suggestedHPA = calculateSuggestedHPA();
    const totalHives = Math.round(acreage * suggestedHPA);

    return (
        <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
            <CardHeader className="border-b-4 border-[#064e3b] bg-white p-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                            <Calculator className="w-3.5 h-3.5 text-[#facc15]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Path Calculus // Levy Flight Model</span>
                        </div>
                        <CardTitle className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                            HPA <span className="text-[#10b981]">Optimizer</span>
                        </CardTitle>
                        <p className="text-[10px] font-bold text-[#064e3b]/40 uppercase tracking-[0.4em]">Dynamic Hive-per-Acre Stocking Rates</p>
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-[#064e3b]/40 tracking-widest mb-1">Efficiency Gain</p>
                        <p className="text-4xl font-black text-[#10b981] leading-none">+12.4%</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col xl:flex-row divide-y-4 xl:divide-y-0 xl:divide-x-4 divide-[#064e3b]">
                {/* Inputs & Parameters */}
                <div className="w-full xl:w-96 p-10 space-y-10 bg-neutral-50 shrink-0">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-[#064e3b] border-l-8 pl-6">
                            <Layers className="w-5 h-5 text-[#064e3b]" />
                            <h3 className="text-xl font-black uppercase tracking-tighter">Site Parameters</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/60">Orchard Acreage</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={acreage}
                                        onChange={(e) => setAcreage(Number(e.target.value))}
                                        className="w-full h-14 border-4 border-[#064e3b] bg-white px-6 font-black text-lg focus:ring-4 focus:ring-[#10b981]/20 outline-none"
                                    />
                                    <span className="font-black text-[#064e3b]">AC</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/60">Tree Density</label>
                                <div className="grid grid-cols-3 border-4 border-[#064e3b] bg-white p-1">
                                    {['low', 'medium', 'high'].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setTreeDensity(d)}
                                            className={cn(
                                                "h-10 text-[9px] font-black uppercase tracking-widest transition-none",
                                                treeDensity === d ? "bg-[#064e3b] text-white" : "text-[#064e3b]/40 hover:text-[#064e3b]"
                                            )}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <Separator className="bg-[#064e3b]/10 h-1" />

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-[#facc15] border-l-8 pl-6">
                            <Target className="w-5 h-5 text-[#064e3b]" />
                            <h3 className="text-xl font-black uppercase tracking-tighter">Target Crop</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {['Almond', 'Cherry', 'Apple', 'Blueberry'].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setVariety(c.toLowerCase())}
                                    className={cn(
                                        "h-12 border-2 text-left px-6 text-[10px] font-black uppercase tracking-widest transition-none",
                                        variety === c.toLowerCase() ? "bg-[#10b981] border-[#10b981] text-white" : "border-[#064e3b] text-[#064e3b] hover:bg-neutral-100"
                                    )}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Main Visualizer */}
                <div className="flex-1 p-10 space-y-12 bg-white min-h-[600px]">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Stocking Recommendation</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Optimized for 100% Bloom Coverage</p>
                        </div>
                        <Badge className="rounded-none border-4 border-[#064e3b] bg-[#facc15] text-[#064e3b] font-black px-4 py-2 text-lg">
                            {suggestedHPA.toFixed(1)} HPA
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Cold Spot Detector Map (Mock) */}
                        <div className="border-4 border-[#064e3b] bg-neutral-50 relative aspect-square overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1000&auto=format&fit=crop')] bg-cover opacity-20 grayscale" />
                            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                <div className="flex justify-between items-start">
                                    <Badge className="bg-[#064e3b] text-white border-2 border-[#10b981] rounded-none px-3 py-1 font-black text-[9px]">COLD_SPOT_OVERLAY</Badge>
                                    <div className="bg-red-500 text-white p-2 border-2 border-[#064e3b] animate-pulse">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Simulated Heatmap Blobs */}
                                <div className="relative flex-1">
                                    <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-red-500/30 blur-2xl rounded-full" />
                                    <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-red-500/20 blur-3xl rounded-full" />

                                    {/* Crosshair */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <Navigation2 className="w-6 h-6 text-[#064e3b] rotate-45" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-[#064e3b] uppercase bg-white/80 p-2 border-2 border-[#064e3b] inline-block">
                                        DETECTION: Low activity sector found (NW-Block)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Summary Details */}
                        <div className="space-y-8">
                            <div className="p-8 border-4 border-[#064e3b] bg-[#064e3b] text-white shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
                                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2">Total Deployment</p>
                                <p className="text-6xl font-black text-[#facc15] tracking-tighter mb-4">{totalHives}</p>
                                <p className="text-xs font-bold uppercase leading-relaxed">
                                    Strategic drops of <span className="text-[#10b981]">12 hives per pallet</span> recommended for {acreage} acres.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-6 border-4 border-[#064e3b] bg-white">
                                    <div className="w-12 h-12 bg-neutral-100 border-2 border-[#064e3b] flex items-center justify-center shrink-0">
                                        <Zap className="w-6 h-6 text-[#064e3b]" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-[#064e3b]">Coverage Radius</h4>
                                        <p className="text-lg font-black text-[#064e3b]">500 - 800 Meters</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-6 border-4 border-[#064e3b] bg-white">
                                    <div className="w-12 h-12 bg-neutral-100 border-2 border-[#064e3b] flex items-center justify-center shrink-0">
                                        <BarChart3 className="w-6 h-6 text-[#064e3b]" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-[#064e3b]">Levy Flight Efficiency</h4>
                                        <p className="text-lg font-black text-[#10b981]">0.84 (Highly Directed)</p>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full h-20 bg-[#064e3b] hover:bg-[#10b981] text-white rounded-none border-4 border-[#064e3b] shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] text-lg font-black uppercase tracking-widest group transition-none">
                                Generate Drop Plan <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 border-4 border-[#064e3b] bg-neutral-50 flex items-start gap-6">
                        <div className="w-12 h-12 bg-[#10b981] border-4 border-[#064e3b] flex items-center justify-center shrink-0">
                            <Info className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black uppercase tracking-tighter">About Path Calculus</h4>
                            <p className="text-xs font-bold text-gray-500 uppercase leading-relaxed">
                                Standard models use static averages. Our HPA Optimizer uses the <span className="text-[#064e3b]">Levy Flight Model</span> to account for stochastic bee movement patterns,
                                ensuring that the "Active Foraging Zone" of each hive drop perfectly tiles your orchard with zero overlap waste.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default HpaOptimizer;
