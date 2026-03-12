import React from 'react';
import {
    Calculator,
    Zap,
    ArrowRight,
    Info,
    AlertCircle,
    BarChart3,
    Layers,
    TreePine,
    Maximize2,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import { motion } from 'framer-motion';

const HpaOptimizer: React.FC = () => {
    const [acreage, setAcreage] = React.useState(40);
    const [treeDensity, setTreeDensity] = React.useState('high'); // high, medium, low
    const [variety, setVariety] = React.useState('almond');

    // Logic for suggested hive placement
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Calculator}
                label="Site Setup Node"
                title={<>Placement <span className="text-[#F4D03F]">Planner</span></>}
                subtitle="Calculate precision hive placement density for apiary operations."
                actions={
                    <div className="flex items-center gap-2 bg-[#F9F7F2] px-3 py-1.5 rounded-lg border border-[#F4D03F]/10">
                        <Activity className="w-3.5 h-3.5 text-[#1B9157]" />
                        <span className="text-[10px] font-bold text-gray-500">Efficiency Gain: <span className="text-[#1B9157]">+12.4%</span></span>
                    </div>
                }
            />

            <div className={cn(glass.card, "flex flex-col xl:flex-row overflow-hidden p-0")}>
                {/* Inputs & Parameters */}
                <div className="w-full xl:w-[320px] p-6 space-y-8 bg-[#F9F7F2] border-r border-[#F4D03F]/10 shrink-0">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                <Layers className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Site Parameters</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className={glass.microLabel}>Orchard Acreage</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={acreage}
                                        onChange={(e) => setAcreage(Number(e.target.value))}
                                        className={cn(glass.input, "pr-12 text-sm text-[#1B9157] font-bold")}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">Acres</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={glass.microLabel}>Tree Density</label>
                                <div className="flex bg-white p-1 rounded-xl border border-gray-200 gap-1">
                                    {['low', 'medium', 'high'].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setTreeDensity(d)}
                                            className={cn(
                                                "flex-1 h-8 rounded-lg text-xs font-bold capitalize transition-all",
                                                treeDensity === d ? "bg-[#F9F7F2] text-[#1A1A1A] border border-[#F4D03F]/20 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                            )}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#1B9157]/20 shadow-sm">
                                <TreePine className="w-4 h-4 text-[#1B9157]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Crop Profile</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {['Almond', 'Cherry', 'Apple', 'Blueberry'].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setVariety(c.toLowerCase())}
                                    className={cn(
                                        "h-10 rounded-xl border text-left px-4 text-xs font-bold transition-all",
                                        variety === c.toLowerCase() ? "bg-white border-[#F4D03F]/30 text-[#1A1A1A] shadow-sm" : "border-transparent text-gray-500 hover:border-gray-200 hover:bg-white"
                                    )}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Main Visualizer */}
                <div className="flex-1 p-6 space-y-6 relative bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-0.5">
                            <h2 className="text-base font-bold text-[#1A1A1A] tracking-tight">Placement Suggestions</h2>
                            <p className="text-[10px] font-medium text-gray-500">Full crop coverage dynamics</p>
                        </div>
                        <div className="bg-[#F9F7F2] border border-[#F4D03F]/20 px-4 py-2 rounded-xl flex items-center gap-3">
                            <Zap className="w-4 h-4 text-[#F4D03F]" />
                            <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">{suggestedHPA.toFixed(1)} <span className="text-xs text-gray-500 font-medium">HPA</span></span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        {/* Coverage Preview */}
                        <div className={cn(glass.card, "aspect-video md:aspect-[4/3] relative overflow-hidden bg-gray-50 p-0 border-gray-200")}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent)]" />
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                            
                            <div className="absolute inset-0 p-4 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="bg-white/90 backdrop-blur-md border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                                        <span className="text-[10px] font-bold text-gray-600">Coverage Scan</span>
                                    </div>
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="bg-red-50 text-red-500 p-2 rounded-lg border border-red-100"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                    </motion.div>
                                </div>

                                <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <p className="text-xs font-bold text-[#1A1A1A]">Sector B12 Deficit detected</p>
                                </div>
                            </div>
                        </div>

                        {/* Summary Details */}
                        <div className="space-y-4">
                            <div className={cn(glass.card, "bg-[#F9F7F2] border-[#F4D03F]/20")}>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Total Hives Required</p>
                                    <div className="flex items-end gap-2 mb-2">
                                        <p className="text-4xl font-bold tracking-tight text-[#1A1A1A] leading-none">{totalHives}</p>
                                        <p className="text-[10px] font-bold text-gray-500 mb-1">UNITS</p>
                                    </div>
                                    <p className="text-[11px] font-medium text-gray-500 leading-relaxed pl-3 border-l-2 border-[#F4D03F]/30">
                                        Suggested: <span className="font-bold text-[#1A1A1A]">12 per pallet</span> configuration.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-xl bg-white border border-gray-200 text-center shadow-sm">
                                    <Maximize2 className="w-4 h-4 mx-auto mb-2 text-gray-400" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Radius</p>
                                    <p className="text-xs font-bold text-[#1A1A1A]">500-800m</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white border border-gray-200 text-center shadow-sm">
                                    <BarChart3 className="w-4 h-4 mx-auto mb-2 text-[#1B9157]/60" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Efficiency</p>
                                    <p className="text-xs font-bold text-[#1B9157]">0.84 High</p>
                                </div>
                            </div>

                            <button className={cn(glass.btnPrimary, "w-full h-11 flex items-center justify-center gap-2 group/btn")}>
                                <span className="text-xs font-bold">Commit Planning Matrix</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                            <Info className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-[#1A1A1A] tracking-tight">Industrial Mapping</h4>
                            <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                                Coverage optimized for industrial apiary flow. Movement patterns validated for maximal foraging efficiency.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default HpaOptimizer;
