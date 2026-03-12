import React from 'react';
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
    Navigation2,
    TreePine,
    Maximize2,
    Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(glass.card, "p-0 overflow-hidden bg-white/80 backdrop-blur-3xl rounded-[6rem] border-white/5 relative shadow-4xl")}
        >
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-honey/[0.05] to-transparent pointer-events-none" />

            <div className="p-16 border-b border-white/5 bg-white/40 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div className="space-y-6">
                        <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20 px-8 py-2.5 shadow-3xl skew-x-[-12deg]')}>
                            <div className="flex items-center gap-4 skew-x-[12deg]">
                                <Calculator className="w-5 h-5" />
                                <span className="uppercase tracking-[0.4em] font-black italic text-[12px]">Precision Planning</span>
                            </div>
                        </div>
                        <h1 className="text-7xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                            Placement <span className="text-honey">Planner</span>
                        </h1>
                        <p className="text-[14px] font-black text-foreground/40 uppercase tracking-[0.4em] ml-2 italic">Calculate the perfect number of hives for your farm.</p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                        <span className="text-[12px] font-black uppercase text-honey tracking-widest italic opacity-40">Efficiency Gain</span>
                        <div className="flex items-end gap-3">
                            <span className="text-7xl font-black text-emerald-500 tracking-tighter italic leading-none">+12.4%</span>
                            <div className="w-4 h-16 bg-emerald-500/20 rounded-full relative overflow-hidden mb-1 shadow-4xl">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: '70%' }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    className="absolute bottom-0 w-full bg-emerald-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row relative z-10">
                {/* Inputs & Parameters */}
                <div className="w-full xl:w-[450px] p-16 space-y-16 bg-gray-50 backdrop-blur-3xl border-r border-white/5 shrink-0">
                    <section className="space-y-10">
                        <div className="flex items-center gap-6 border-honey border-l-8 pl-8">
                            <Layers className="w-8 h-8 text-honey" />
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Site Details</h3>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-[12px] font-black uppercase tracking-[0.3em] text-foreground/40 italic ml-2">Orchard Acreage</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={acreage}
                                        onChange={(e) => setAcreage(Number(e.target.value))}
                                        className={cn(glass.input, "h-20 px-10 text-3xl font-black italic border-gray-200 group-hover:border-honey/40 transition-colors")}
                                    />
                                    <span className="absolute right-10 top-1/2 -translate-y-1/2 font-black italic text-honey opacity-40 text-xl uppercase tracking-widest">Acres</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[12px] font-black uppercase tracking-[0.3em] text-foreground/40 italic ml-2">Tree Density</label>
                                <div className="flex bg-gray-100 p-2 rounded-[2.5rem] border border-white/5 gap-2 shadow-4xl">
                                    {['low', 'medium', 'high'].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setTreeDensity(d)}
                                            className={cn(
                                                "flex-1 h-14 rounded-full text-[12px] font-black uppercase italic tracking-widest transition-all duration-700 relative overflow-hidden group/btn",
                                                treeDensity === d ? "bg-honey text-black shadow-4xl scale-110" : "text-muted-foreground/30 hover:text-honey hover:bg-honey/5"
                                            )}
                                        >
                                            <span className="relative z-10">{d}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-10">
                        <div className="flex items-center gap-6 border-blue-400 border-l-8 pl-8">
                            <TreePine className="w-8 h-8 text-blue-400" />
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Select Crop</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {['Almond', 'Cherry', 'Apple', 'Blueberry'].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setVariety(c.toLowerCase())}
                                    className={cn(
                                        "h-18 rounded-3xl border-2 text-left px-10 text-[14px] font-black uppercase italic tracking-[0.2em] transition-all relative overflow-hidden group/crop",
                                        variety === c.toLowerCase() ? "bg-blue-400 border-blue-400 text-black shadow-4xl scale-[1.02]" : "border-gray-200 text-foreground/40 hover:border-blue-400 hover:text-blue-400 hover:bg-blue-400/5"
                                    )}
                                >
                                    <span className="relative z-10">{c}</span>
                                    {variety === c.toLowerCase() && (
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12 blur-2xl" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Main Visualizer */}
                <div className="flex-1 p-16 lg:p-24 space-y-16 bg-white/5 min-h-[800px] relative overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-honey/5 rounded-full blur-[150px] pointer-events-none" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 relative z-10">
                        <div className="space-y-4">
                            <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none">Suggestions</h2>
                            <p className="text-2xl font-black italic opacity-40 uppercase tracking-widest pl-2 border-l-8 border-white/5">Optimized for full crop coverage.</p>
                        </div>
                        <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20 px-12 py-5 rounded-[3rem] shadow-4xl')}>
                            <span className="text-4xl font-black italic uppercase tracking-tighter">{suggestedHPA.toFixed(1)} <span className="text-xl opacity-40">HPA</span></span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                        {/* Coverage Analysis Map */}
                        <div className={cn(glass.card, "aspect-square relative overflow-hidden group rounded-[5rem] border-gray-200 shadow-4xl")}>
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1000&auto=format&fit=crop')] bg-cover opacity-10 grayscale scale-110 group-hover:scale-125 transition-transform duration-10000" />
                            <div className="absolute inset-0 p-12 flex flex-col justify-between z-10">
                                <div className="flex justify-between items-start">
                                    <div className={cn(glass.badge, 'bg-white/80 backdrop-blur-md border-gray-200 px-6 py-2 rounded-full')}>
                                        <span className="text-[10px] font-black uppercase italic tracking-[0.4em]">Coverage Analysis</span>
                                    </div>
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="bg-red-500 text-gray-900 p-4 rounded-3xl border-4 border-black shadow-4xl"
                                    >
                                        <AlertCircle className="w-8 h-8" />
                                    </motion.div>
                                </div>

                                {/* Simulated Heatmap Blobs */}
                                <div className="relative flex-1">
                                    <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-red-500/20 blur-[60px] rounded-full animate-pulse" />
                                    <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full animate-pulse [animation-delay:1s]" />

                                    {/* Crosshair */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:rotate-180 transition-transform duration-1000">
                                        <Compass className="w-16 h-16 text-honey/40" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200 shadow-4xl flex items-center gap-6">
                                        <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                                        <p className="text-[14px] font-black text-gray-900 uppercase italic tracking-widest leading-tight">
                                            Low activity found in North-West sector.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Details */}
                        <div className="space-y-12">
                            <div className={cn(glass.card, "p-12 bg-honey text-black shadow-4xl rounded-[5rem] group relative overflow-hidden transition-all hover:scale-[1.02]")}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                                <div className="relative z-10">
                                    <p className="text-[14px] font-black uppercase tracking-[0.4em] opacity-40 italic mb-4">Total Hives Needed</p>
                                    <div className="flex items-end gap-6 mb-8">
                                        <p className="text-9xl font-black tracking-tighter italic leading-none">{totalHives}</p>
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xl font-black italic uppercase opacity-40">Hives</span>
                                            <div className="w-24 h-2 bg-gray-100 rounded-full" />
                                        </div>
                                    </div>
                                    <p className="text-xl font-black italic uppercase leading-relaxed max-w-sm pl-4 border-l-8 border-black/20">
                                        We recommend placing <span className="text-gray-900">12 hives per pallet</span> to cover your {acreage} acres perfectly.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-8 p-10 rounded-[3.5rem] bg-white/40 border border-gray-200 shadow-4xl group/stat hover:bg-honey/5 transition-all">
                                    <div className="w-20 h-20 bg-honey/10 rounded-[2.5rem] border border-honey/20 flex items-center justify-center shrink-0 group-hover/stat:scale-110 group-hover/stat:rotate-6 transition-all shadow-4xl">
                                        <Maximize2 className="w-10 h-10 text-honey" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">Coverage Radius</h4>
                                        <p className="text-3xl font-black italic uppercase tracking-tighter text-foreground">500 - 800 Meters</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 p-10 rounded-[3.5rem] bg-white/40 border border-gray-200 shadow-4xl group/stat hover:bg-emerald-500/5 transition-all">
                                    <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover/stat:scale-110 group-hover/stat:-rotate-6 transition-all shadow-4xl">
                                        <BarChart3 className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">Efficiency Score</h4>
                                        <p className="text-3xl font-black italic uppercase tracking-tighter text-emerald-500">0.84 (High)</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full h-28 bg-black text-honey rounded-[4.5rem] font-black italic text-3xl uppercase shadow-4xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-10 group/plan relative overflow-hidden">
                                <div className="absolute inset-0 bg-honey/0 group-hover/plan:bg-honey/10 transition-all" />
                                <span className="relative z-10">Generate Plan</span>
                                <ArrowRight className="w-10 h-10 group-hover/plan:translate-x-6 transition-transform relative z-10" />
                            </button>
                        </div>
                    </div>

                    <div className="p-16 rounded-[5rem] bg-white/40 border border-gray-200 backdrop-blur-3xl flex items-center gap-12 shadow-4xl relative z-10 hover:border-honey/20 transition-all group/info">
                        <div className="w-24 h-24 rounded-[3rem] bg-honey text-black flex items-center justify-center shrink-0 group-hover/info:scale-110 transition-transform shadow-4xl">
                            <Info className="w-12 h-12" />
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Smart Planning</h4>
                            <p className="text-2xl font-black italic text-foreground opacity-60 leading-relaxed max-w-5xl pl-4 border-l-8 border-honey">
                                Our tool ensures every tree in your orchard is covered without wasting hives. We calculate movement patterns
                                to make sure the foraging zone of each hive drop fits together like a perfect puzzle, maximizing your harvest efficiency.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HpaOptimizer;
