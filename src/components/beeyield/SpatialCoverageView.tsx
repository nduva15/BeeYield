import React from 'react';
import {
    Map as MapIcon, Zap, Maximize2, Filter, Info, Layers, Crosshair, Target, AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';

const SpatialCoverageView: React.FC = () => {
    const [zoom, setZoom] = React.useState(1);

    const pallets = [
        { id: 'P1', x: 30, y: 40, type: 'Almond' },
        { id: 'P2', x: 60, y: 25, type: 'Almond' },
        { id: 'P3', x: 45, y: 70, type: 'Blueberry' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Target}
                label="Spatial Kernel"
                title={<>Saturation <span className="text-[#F4D03F]">Math</span></>}
                subtitle="Exponential decay visualization and coverage integrals."
                actions={
                    <div className="flex gap-2">
                        <button className={cn(glass.btnSecondary, "h-9 px-3 text-xs font-bold flex items-center gap-2")}>
                            <Layers className="w-3.5 h-3.5" />
                            Heatmap
                        </button>
                        <button className={cn(glass.btnPrimary, "h-9 px-4 text-xs font-bold")}>
                            Recalculate
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 space-y-4">
                    {/* SVG Map */}
                    <div className={cn(glass.card, "relative overflow-hidden h-[400px] p-0 bg-gray-50 border-gray-200 group")}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent)]" />
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                        <div className="absolute top-4 left-4 p-3 rounded-xl bg-white/90 border border-gray-200 shadow-sm backdrop-blur-md z-10 hidden md:block">
                            <p className="text-[10px] font-bold text-gray-500 tracking-wider mb-2 border-b border-gray-100 pb-2">Coverage Legend</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#1B9157] shadow-sm" />
                                    <span className="text-xs font-medium text-gray-600">Optimal ({'>'}85%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#1B9157]/40" />
                                    <span className="text-xs font-medium text-gray-600">Marginal (~50%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-dashed border-red-400" />
                                    <span className="text-xs font-medium text-red-500">Blind Spot</span>
                                </div>
                            </div>
                        </div>

                        <svg className="w-full h-full cursor-grab relative z-0" viewBox="0 0 100 100">
                            {pallets.map((p) => (
                                <g key={p.id}>
                                    <motion.circle
                                        cx={p.x} cy={p.y} r="25"
                                        className="fill-emerald-500/10 stroke-emerald-500/30 stroke-[0.2]"
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                    <motion.circle
                                        cx={p.x} cy={p.y} r="15"
                                        className="fill-emerald-500/20 stroke-emerald-500/50 stroke-[0.3]"
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ duration: 1 }}
                                    />
                                    <motion.circle
                                        cx={p.x} cy={p.y} r="3"
                                        className="fill-emerald-500 stroke-none shadow-sm"
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ duration: 1.2 }}
                                    />
                                    <text x={p.x} y={p.y - 5} className="fill-[#1A1A1A] font-bold text-[2.5px]" textAnchor="middle">{p.id} <tspan className="fill-gray-500 text-[2px]">({p.type})</tspan></text>
                                </g>
                            ))}
                            <circle cx="85" cy="80" r="6" className="fill-red-500/5 stroke-red-400 stroke-[0.5]" strokeDasharray="1 1.5" />
                            <text x="85" y="72" className="fill-red-500 font-bold text-[2px]" textAnchor="middle">Blind Spot</text>
                            <circle cx="85" cy="80" r="1" className="fill-red-500 stroke-none" />
                        </svg>

                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#1A1A1A] transition-all">
                                <Maximize2 className="w-4 h-4" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#1A1A1A] transition-all">
                                <Crosshair className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Coverage Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className={cn(glass.card, "p-4 space-y-1 bg-white border-l-2 border-l-red-500")}>
                            <p className="text-[10px] font-bold text-gray-500 tracking-wider">Total Saturation</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-bold tracking-tight text-[#1A1A1A]">84.2%</p>
                                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100 mb-1">Low</span>
                            </div>
                        </div>
                        <div className={cn(glass.card, "p-4 space-y-1 bg-white border-l-2 border-l-[#1B9157]")}>
                            <p className="text-[10px] font-bold text-gray-500 tracking-wider">Overlap Zone</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-bold tracking-tight text-[#1B9157]">1,280</p>
                                <span className="text-[10px] font-medium text-gray-400 mb-1">m²</span>
                            </div>
                        </div>
                        <div className={cn(glass.card, "p-4 space-y-1 bg-[#F9F7F2] border-l-2 border-l-[#F4D03F]")}>
                            <p className="text-[10px] font-bold text-gray-500 tracking-wider">Yield Impact</p>
                            <p className="text-2xl font-bold tracking-tight text-[#1A1A1A]">+12.5%</p>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="space-y-4">
                    <div className={cn(glass.card, "p-0 bg-white")}>
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Decay Coefficient (λ)</h3>
                        </div>
                        <div className="p-4 space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-gray-500">Almond (Std)</span>
                                    <span className="text-sm font-bold text-[#1B9157]">0.024</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#1B9157] w-[24%] rounded-full shadow-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-gray-500">Intensity (P0)</span>
                                    <span className="text-sm font-bold text-[#1A1A1A]">0.95</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#F4D03F] w-[95%] rounded-full shadow-sm" />
                                </div>
                            </div>
                            <p className="text-[10px] font-medium text-gray-400 leading-relaxed pt-2">
                                Adjust parameters for current botanical density and local forage behavior.
                            </p>
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-0 bg-[#F9F7F2] border-[#F4D03F]/20 overflow-hidden")}>
                        <div className="p-4 border-b border-[#F4D03F]/10 flex items-center gap-2 bg-white/50">
                            <Zap className="w-4 h-4 text-[#F4D03F]" />
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Optimizer</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-[11px] font-medium text-gray-600 leading-relaxed">
                                Identified <span className="text-[#1A1A1A] font-bold">4.2 acres</span> of under-pollinated orchard.
                            </p>
                            <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm space-y-3">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1B9157]" />
                                        <span className="text-xs font-bold text-[#1A1A1A]">Drop Points Located</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 pl-5">Optimal new locations found.</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                        <span className="text-xs font-bold text-red-600">Move Required</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-gray-600 pl-5">Move <span className="font-bold">PLT-1105</span> → <span className="text-[#1A1A1A]">X:85, Y:80</span></p>
                                </div>
                            </div>
                            <button className={cn(glass.btnPrimary, "w-full h-10 bg-[#1B9157] text-white hover:bg-[#145A32] shadow-sm text-xs font-bold")}>
                                Apply Auto-Layout
                                <ArrowRight className="w-3.5 h-3.5 ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SpatialCoverageView;
