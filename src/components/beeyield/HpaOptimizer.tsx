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
import { beeyieldService } from '@/services/beeyieldService';

const HpaOptimizer: React.FC = () => {
    const [acreage, setAcreage] = React.useState(40);
    const [treeDensity, setTreeDensity] = React.useState('high'); // high, medium, low
    const [variety, setVariety] = React.useState<string>('');
    const [cropOptions, setCropOptions] = React.useState<string[]>([]);
    const [cropsLoading, setCropsLoading] = React.useState(true);

    // Logic for suggested hive placement
    const calculateSuggestedHPA = () => {
        let base = 2.0;
        if (treeDensity === 'high') base += 0.5;
        if (treeDensity === 'low') base -= 0.5;
        if (variety.toLowerCase().includes('cherry')) base += 0.2;
        return base;
    };

    React.useEffect(() => {
        let mounted = true;
        const load = async () => {
            setCropsLoading(true);
            try {
                const data = await beeyieldService.getCropRequirements();
                const names = (data || [])
                    .map((c: any) => String(c?.crop_name || c?.cropName || '').trim())
                    .filter(Boolean);
                if (!mounted) return;
                setCropOptions(names);
                setVariety((prev) => {
                    if (prev && names.includes(prev)) return prev;
                    return names[0] || '';
                });
            } catch {
                if (!mounted) return;
                setCropOptions([]);
                setVariety('');
            } finally {
                if (mounted) setCropsLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

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
                label="Site setup"
                title={<>Placement <span className="text-[#1B9157]">Planner</span></>}
                subtitle="Estimate hive placement density for a location."
                actions={
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                        <Activity className="w-4 h-4 text-[#1B9157]" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Efficiency Gain: <span className="text-[#1B9157] font-bold">+12.4%</span></span>
                    </div>
                }
            />

            <div className={cn(glass.card, "flex flex-col xl:flex-row overflow-hidden p-0 bg-white shadow-sm border-gray-100")}>
                {/* Inputs & Parameters */}
                <div className="w-full xl:w-[280px] p-5 space-y-6 bg-gray-50/30 border-r border-gray-100 shrink-0">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2.5 mb-1 px-1">
                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-inner">
                                <Layers className="w-4 h-4 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Parameters</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="orchard-acreage" className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Orchard Acreage</label>
                                <div className="relative group">
                                    <input
                                        id="orchard-acreage"
                                        type="number"
                                        value={acreage}
                                        onChange={(e) => setAcreage(Number(e.target.value))}
                                        className={cn(glass.input, "pr-12 h-9 text-xs text-[#1B9157] font-bold bg-white/50 focus:bg-white")}
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-[9px] uppercase tracking-tighter">Acres</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Tree Density</label>
                                <div className="flex bg-white/50 p-1 rounded-xl border border-gray-100 gap-1 shadow-inner md:shadow-none">
                                    {['low', 'medium', 'high'].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setTreeDensity(d)}
                                            className={cn(
                                                "flex-1 h-7 rounded-lg text-[9px] font-bold uppercase transition-all tracking-wider",
                                                treeDensity === d ? "bg-[#1B9157] text-white shadow-md" : "text-gray-400 hover:text-gray-600 hover:bg-white"
                                            )}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2.5 mb-1 px-1">
                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-inner">
                                <TreePine className="w-4 h-4 text-emerald-600" />
                            </div>
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Crop Profile</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {cropsLoading ? (
                                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Loading crops…
                                </div>
                            ) : cropOptions.length === 0 ? (
                                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    No crop requirements found
                                </div>
                            ) : (
                                cropOptions.slice(0, 6).map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setVariety(c)}
                                        className={cn(
                                            "h-8 rounded-xl border text-center text-[10px] font-bold transition-all uppercase tracking-tighter",
                                            variety === c ? "bg-white border-[#F4D03F]/50 text-[#1A1A1A] shadow-sm ring-1 ring-[#F4D03F]/10" : "bg-transparent border-transparent text-gray-400 hover:border-gray-100 hover:bg-white"
                                        )}
                                    >
                                        {c}
                                    </button>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Main Visualizer */}
                <div className="flex-1 p-5 space-y-6 relative bg-white/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-4">
                        <div className="space-y-0.5 px-1">
                            <h2 className="text-base font-bold text-[#1A1A1A] tracking-tight">Placement Suggestions</h2>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Suggested placements for better coverage</p>
                        </div>
                        <div className="bg-emerald-50/50 border border-emerald-100 px-4 py-2 rounded-2xl flex items-center gap-4 shadow-sm backdrop-blur-sm">
                            <Zap className="w-5 h-5 text-amber-500" />
                            <span className="text-3xl font-bold tracking-tighter text-emerald-700 leading-none">{suggestedHPA.toFixed(1)} <span className="text-[10px] text-emerald-600/40 font-bold tracking-widest uppercase ml-1">HPA</span></span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        {/* Coverage Preview */}
                        <div className={cn(glass.card, "aspect-video md:aspect-[4/3] relative overflow-hidden bg-gray-50/30 p-0 border-gray-100 shadow-inner group")}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01),transparent)]" />
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                            
                            <div className="absolute inset-0 p-4 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="bg-white/90 backdrop-blur-sm border border-gray-100 px-2.5 py-1.5 rounded-xl shadow-sm">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Coverage Scan Active</span>
                                    </div>
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="bg-red-50 text-red-500 p-2 rounded-xl border border-red-100 shadow-sm"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                    </motion.div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-white/90 backdrop-blur-md border border-gray-100 shadow-lg flex items-center gap-3 animate-pulse border-l-4 border-l-red-500/50">
                                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                    <p className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-tighter">Sector B12 Deficit Detected</p>
                                </div>
                            </div>
                        </div>

                        {/* Summary Details */}
                        <div className="space-y-4">
                            <div className={cn(glass.card, "bg-gray-50/50 border-gray-100 shadow-sm p-6 relative overflow-hidden")}>
                                <div className="relative z-10">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Total Nodes Required</p>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <p className="text-4xl font-bold tracking-tighter text-[#1A1A1A] leading-none">{totalHives}</p>
                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Hectare Units</p>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500 leading-relaxed pl-3 border-l-2 border-[#F4D03F]/50 uppercase tracking-tighter">
                                        Suggested: <span className="text-[#1A1A1A]">12 per pallet</span> configuration for optimal foraging velocity.
                                    </p>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] scale-150 rotate-12">
                                    <Calculator className="w-24 h-24" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-xl bg-white border border-gray-100 text-center shadow-sm hover:border-emerald-200 transition-colors group">
                                    <Maximize2 className="w-4 h-4 mx-auto mb-2 text-gray-300 group-hover:text-[#1B9157]/40 transition-colors" />
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">Radius</p>
                                    <p className="text-[11px] font-bold text-[#1A1A1A]">500-800m</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white border border-gray-100 text-center shadow-sm hover:border-emerald-200 transition-colors group">
                                    <BarChart3 className="w-4 h-4 mx-auto mb-2 text-gray-300 group-hover:text-emerald-500/40 transition-colors" />
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">Efficiency</p>
                                    <p className="text-[11px] font-bold text-emerald-600">0.84 HIGH</p>
                                </div>
                            </div>

                            <button className={cn(glass.btnPrimary, "w-full h-10 flex items-center justify-center gap-3 group/btn shadow-md mt-2")}>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Commit Matrix</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 flex items-start gap-4">
                        <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                            <Info className="w-4 h-4 text-gray-300" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-[#1A1A1A] tracking-widest uppercase">Mapping notes</h4>
                            <p className="text-[10px] font-medium text-gray-400 leading-relaxed border-l-2 border-emerald-500/30 pl-4 mt-2">
                                Coverage is estimated from acreage and tree density. Use this as a starting point, then adjust based on bloom timing and access.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
            `}</style>
        </motion.div>
    );
};

export default HpaOptimizer;
