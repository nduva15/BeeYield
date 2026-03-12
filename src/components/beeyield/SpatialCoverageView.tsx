import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Map as MapIcon, Zap, Maximize2, Filter, Info, Layers, Crosshair, Target, AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';

const SpatialCoverageView: React.FC = () => {
    const [zoom, setZoom] = React.useState(1);

    // Mock Pallets for the map
    const pallets = [
        { id: 'P1', x: 30, y: 40, type: 'ALMOND' },
        { id: 'P2', x: 60, y: 25, type: 'ALMOND' },
        { id: 'P3', x: 45, y: 70, type: 'BLUEBERRY' },
    ];

    return (
        <div className={cn(glass.page, "p-8 -m-8 min-h-screen")}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20')}>
                        <Target className="w-3.5 h-3.5" />
                        <span className="uppercase tracking-[0.1em]">Spatial Decoupling Engine</span>
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Saturation <span className="text-honey">Math</span>
                    </h1>
                    <p className={cn(glass.microLabel, 'opacity-70 normal-case italic font-bold')}>
                        P(d) = P0 e^(-lambda * d) · Exponential Decay Visualizer · Orchard Coverage Integrals
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className={cn(glass.btnSecondary, "gap-2 px-6")}>
                        <Layers className="w-4 h-4" />
                        Toggle Heatmap
                    </button>
                    <button className={cn(glass.btnPrimary, "px-6")}>
                        Recalculate Overlaps
                    </button>
                </div>
            </div>

            {/* Matrix Definitions */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    {/* The Visual Map (SVG Based) */}
                    <div className={cn(glass.card, "relative overflow-hidden h-[600px] p-0 border-border group")}>
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                        <div className="absolute top-8 left-8 p-6 rounded-[2rem] bg-white/60 border border-border backdrop-blur-md z-10 hidden md:block shadow-xl">
                            <h3 className={cn(glass.microLabel, "mb-4 border-b border-border pb-2")}>Coverage Legend</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] border border-emerald-500/20" />
                                    <span className={cn(glass.microLabel, "text-muted-foreground")}>Optimal Intensity ({'>'}85%)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full bg-emerald-500/40 border border-emerald-500/20" />
                                    <span className={cn(glass.microLabel, "text-muted-foreground")}>Marginal (P ≈ 50%)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border-2 border-dashed border-destructive" />
                                    <span className={cn(glass.microLabel, "text-destructive")}>Blind Spot (Under-Pollinated)</span>
                                </div>
                            </div>
                        </div>

                        <svg className="w-full h-full cursor-grab active:cursor-grabbing relative z-0" viewBox="0 0 100 100">
                            {pallets.map((p) => (
                                <g key={p.id}>
                                    {/* Exponential Decay Halos */}
                                    <motion.circle
                                        cx={p.x} cy={p.y} r="25"
                                        className="fill-emerald-500/10 stroke-emerald-500/30 stroke-[0.2]"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                    <motion.circle
                                        cx={p.x} cy={p.y} r="15"
                                        className="fill-emerald-500/20 stroke-emerald-500/50 stroke-[0.3]"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                    <motion.circle
                                        cx={p.x} cy={p.y} r="6"
                                        className="fill-emerald-500 stroke-emerald-500 stroke-1 shadow-lg"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                    <text x={p.x} y={p.y - 8} className="fill-foreground font-black text-[2px] uppercase tracking-widest text-center" textAnchor="middle">{p.id} ({p.type})</text>
                                </g>
                            ))}

                            {/* Blind Spot Indicator */}
                            <circle cx="85" cy="80" r="10" className="fill-destructive/10 stroke-destructive stroke-[0.5] stroke-dasharray-1" />
                            <text x="85" y="75" className="fill-destructive font-black text-[2px] uppercase tracking-widest" textAnchor="middle">BLIND SPOT DETECTED</text>
                        </svg>

                        <div className="absolute bottom-8 right-8 flex gap-4">
                            <button className="w-14 h-14 rounded-2xl bg-white/60 border border-border backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-lg hover:border-honey/50">
                                <Maximize2 className="w-6 h-6" />
                            </button>
                            <button className="w-14 h-14 rounded-2xl bg-white/60 border border-border backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-lg hover:border-honey/50">
                                <Crosshair className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Coverage Analysis Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className={cn(glass.card, "p-8")}>
                            <p className={cn(glass.microLabel, "text-muted-foreground mb-4")}>Total Saturation</p>
                            <div className="flex flex-col items-start gap-2">
                                <span className={cn(glass.sectionTitle, "text-5xl tabular-nums leading-none")}>84.2%</span>
                                <Badge className={cn(glass.badge, "bg-destructive/10 text-destructive border-destructive/20 scale-90 origin-left mt-2")}>INSUFFICIENT</Badge>
                            </div>
                        </div>
                        <div className={cn(glass.card, "p-8")}>
                            <p className={cn(glass.microLabel, "text-muted-foreground mb-4")}>Overlapping Flow</p>
                            <span className={cn(glass.sectionTitle, "text-5xl tabular-nums leading-none text-emerald-500")}>1,280 m²</span>
                        </div>
                        <div className={cn(glass.card, "p-8")}>
                            <p className={cn(glass.microLabel, "text-muted-foreground mb-4")}>Predicted Yield Impact</p>
                            <span className={cn(glass.sectionTitle, "text-5xl tabular-nums leading-none text-honey")}>+12.5%</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Decay Settings */}
                    <div className={cn(glass.card, "p-0")}>
                        <div className="p-8 border-b border-border bg-muted/20">
                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Decay Coefficient (λ)</h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className={cn(glass.microLabel, "font-bold text-muted-foreground")}>Almond (Standard)</span>
                                    <span className={cn(glass.sectionTitle, "text-xl text-emerald-500")}>0.024</span>
                                </div>
                                <div className="h-2 w-full bg-muted/50 rounded-full relative overflow-hidden">
                                    <div className="absolute inset-y-0 left-0 bg-emerald-500 w-[24%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                            </div>
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className={cn(glass.microLabel, "font-bold text-muted-foreground")}>Fruiting Period Intensity (P0)</span>
                                    <span className={cn(glass.sectionTitle, "text-xl")}>0.95</span>
                                </div>
                                <div className="h-2 w-full bg-muted/50 rounded-full relative overflow-hidden">
                                    <div className="absolute inset-y-0 left-0 bg-honey w-[95%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                </div>
                            </div>
                            <p className={cn(glass.microLabel, "text-muted-foreground/60 leading-relaxed italic border-t border-border pt-6")}>
                                Adjust these parameters to match current botanical blooming density and local bee forage behavior.
                            </p>
                        </div>
                    </div>

                    {/* Optimization Console */}
                    <div className={cn(glass.card, "p-0 overflow-hidden relative shadow-2xl")}>
                        <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay" />
                        <div className="relative z-10 p-8 border-b border-border/10 bg-emerald-500/10 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <Zap className="w-6 h-6 text-emerald-500" />
                                <h3 className={cn(glass.sectionTitle, "text-2xl normal-case text-emerald-500")}>BeeYield Optimizer</h3>
                            </div>
                        </div>
                        <div className="relative z-10 p-8 space-y-6 bg-background/80 backdrop-blur-md">
                            <p className={cn(glass.microLabel, "text-muted-foreground leading-relaxed")}>
                                The system has identified <span className="text-foreground">4.2 acres</span> of under-pollinated orchard.
                            </p>
                            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-4 shadow-inner">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className={cn(glass.microLabel, "font-semibold")}>Optimal Drop Points Found</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-honey" />
                                    <span className={cn(glass.microLabel, "font-semibold text-honey")}>Move PLT-1105 to (X:85, Y:80)</span>
                                </div>
                            </div>
                            <button className={cn(glass.btnPrimary, "w-full bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 mt-4")}>
                                Apply Auto-Layout
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpatialCoverageView;
