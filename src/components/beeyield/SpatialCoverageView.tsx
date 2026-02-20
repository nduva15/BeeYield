import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Map as MapIcon,
    Zap,
    Maximize2,
    Filter,
    Info,
    Layers,
    Crosshair,
    Target,
    AlertCircle,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SpatialCoverageView: React.FC = () => {
    const [zoom, setZoom] = React.useState(1);

    // Mock Pallets for the map
    const pallets = [
        { id: 'P1', x: 30, y: 40, type: 'ALMOND' },
        { id: 'P2', x: 60, y: 25, type: 'ALMOND' },
        { id: 'P3', x: 45, y: 70, type: 'BLUEBERRY' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                        <Target className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Spatial Decoupling Engine</span>
                    </div>
                    <h1 className="text-6xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                        Saturation <span className="text-[#10b981]">Math</span>
                    </h1>
                    <p className="text-[#064e3b]/40 font-black text-sm uppercase tracking-widest mt-2 px-1">
                        P(d) = P0 e^(-lambda * d) · Exponential Decay Visualizer · Orchard Coverage Integrals
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-none border-2 border-[#064e3b] font-black uppercase text-[10px] tracking-widest transition-none bg-white">
                        <Layers className="w-4 h-4 mr-2" />
                        Toggle Heatmap
                    </Button>
                    <Button className="h-12 px-6 rounded-none bg-[#064e3b] text-white font-black uppercase text-[10px] tracking-widest hover:bg-[#10b981] transition-none border-2 border-[#064e3b]">
                        Recalculate Overlaps
                    </Button>
                </div>
            </div>

            {/* Matrix Definitions */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    {/* The Visual Map (SVG Based) */}
                    <Card className="rounded-none border-4 border-[#064e3b] bg-neutral-900 shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] relative overflow-hidden h-[600px]">
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                        <div className="absolute top-8 left-8 p-4 bg-white border-4 border-[#064e3b] z-10 hidden md:block">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#064e3b] mb-2">Coverage Legend</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#10b981] border border-[#064e3b]/20" />
                                    <span className="text-[9px] font-black text-[#064e3b]/60 uppercase">Optimal Intensity ({'>'}85%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#10b981]/40 border border-[#064e3b]/20" />
                                    <span className="text-[9px] font-black text-[#064e3b]/60 uppercase">Marginal ($P \approx 50\%$)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-dashed border-red-500" />
                                    <span className="text-[9px] font-black text-red-500 uppercase">Blind Spot (Under-Pollinated)</span>
                                </div>
                            </div>
                        </div>

                        <svg className="w-full h-full cursor-grab active:cursor-grabbing" viewBox="0 0 100 100">
                            {pallets.map((p) => (
                                <g key={p.id}>
                                    {/* Exponential Decay Halos */}
                                    <motion.circle
                                        cx={p.x} cy={p.y} r="25"
                                        className="fill-[#10b981]/10 stroke-[#10b981]/30 stroke-2"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                    <motion.circle
                                        cx={p.x} cy={p.y} r="15"
                                        className="fill-[#10b981]/20 stroke-[#10b981]/50 stroke-2"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                    <motion.circle
                                        cx={p.x} cy={p.y} r="8"
                                        className="fill-[#10b981] stroke-[#064e3b] stroke-2"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                    <text x={p.x} y={p.y - 10} className="fill-white font-black text-[2px] uppercase tracking-widest text-center" textAnchor="middle">{p.id} ({p.type})</text>
                                </g>
                            ))}

                            {/* Blind Spot Indicator */}
                            <circle cx="85" cy="80" r="10" className="fill-red-500/10 stroke-red-500 stroke-[0.5] stroke-dasharray-1" />
                            <text x="85" y="75" className="fill-red-500 font-black text-[2px] uppercase tracking-widest" textAnchor="middle">BLIND SPOT DETECTED</text>
                        </svg>

                        <div className="absolute bottom-8 right-8 flex gap-4">
                            <Button variant="outline" className="w-12 h-12 rounded-none border-4 border-[#064e3b] bg-white p-0">
                                <Maximize2 className="w-5 h-5 text-[#064e3b]" />
                            </Button>
                            <Button variant="outline" className="w-12 h-12 rounded-none border-4 border-[#064e3b] bg-white p-0">
                                <Crosshair className="w-5 h-5 text-[#064e3b]" />
                            </Button>
                        </div>
                    </Card>

                    {/* Coverage Analysis Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="rounded-none border-4 border-[#064e3b] bg-white p-6 shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/30 mb-2">Total Saturation</p>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-[#064e3b]">84.2%</span>
                                <Badge className="bg-[#facc15] text-[#064e3b] text-[8px] font-black rounded-none mb-1">INSUFFICIENT</Badge>
                            </div>
                        </Card>
                        <Card className="rounded-none border-4 border-[#064e3b] bg-white p-6 shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/30 mb-2">Overlapping Flow</p>
                            <span className="text-4xl font-black text-[#10b981]">1,280 m²</span>
                        </Card>
                        <Card className="rounded-none border-4 border-[#064e3b] bg-white p-6 shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/30 mb-2">Predicted Yield Impact</p>
                            <span className="text-4xl font-black text-[#064e3b]">+12.5%</span>
                        </Card>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Decay Settings */}
                    <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                        <CardHeader className="p-8 border-b-4 border-[#064e3b]/5">
                            <CardTitle className="text-xl font-black text-[#064e3b] uppercase tracking-tighter italic">Decay Coefficient (lambda)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase">Almond (Standard)</span>
                                    <span className="text-sm font-black text-[#10b981]">0.024</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-100 border-2 border-[#064e3b] relative">
                                    <div className="absolute inset-y-0 left-0 bg-[#064e3b] w-[24%]" />
                                </div>
                            </div>
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase">Fruiting Period Intensity (P0)</span>
                                    <span className="text-sm font-black text-[#064e3b]">0.95</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-100 border-2 border-[#064e3b] relative">
                                    <div className="absolute inset-y-0 left-0 bg-[#facc15] w-[95%]" />
                                </div>
                            </div>
                            <p className="text-[9px] font-bold text-[#064e3b]/40 uppercase mt-4 leading-relaxed">
                                Adjust these parameters to match current botanical blooming density and local bee forage behavior.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Optimization Console */}
                    <Card className="rounded-none border-4 border-[#10b981] bg-[#064e3b] text-white shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
                        <CardHeader className="p-8">
                            <div className="flex items-center gap-3">
                                <Zap className="w-6 h-6 text-[#facc15]" />
                                <CardTitle className="text-xl font-black uppercase tracking-tighter">AI Optimizer</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <p className="text-[10px] font-bold text-white/60 uppercase leading-snug">
                                The system has identified 4.2 acres of under-pollinated orchard.
                            </p>
                            <div className="p-4 bg-white/5 border-2 border-white/10 space-y-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                                    <span className="text-[9px] font-black uppercase">Optimal Drop Points Found</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-[#facc15]" />
                                    <span className="text-[9px] font-black uppercase">Move Pallet #PLT-1105 to (X:85, Y:80)</span>
                                </div>
                            </div>
                            <Button className="w-full h-12 rounded-none bg-[#facc15] text-[#064e3b] font-black uppercase text-[10px] tracking-widest hover:bg-white transition-none shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                                Apply Auto-Layout
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SpatialCoverageView;
