import React from 'react';
import { Target, Zap, TrendingUp, Info, ArrowRight, ShieldCheck, Database, LayoutGrid, CheckCircle2, ChevronDown, Binary, ShieldAlert, Activity, Settings, List as ListIcon, Hexagon, Loader2, Gauge, Scale, Waves, Trees, Calculator, TreePine, BarChart3, Maximize2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { beeyieldService } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CROP_PROFILES, calculateRequiredHives, ColonyGrade } from '@/lib/apicultureModels';

const CircularGauge: React.FC<{ value: number; max: number; label: string; isPremium?: boolean }> = ({ value, max, label, isPremium }) => {
    const pct = Math.min(1, value / max);
    const R = 32;
    const circumference = 2 * Math.PI * R;
    const dash = circumference * pct;

    const color = isPremium
        ? '#F4D03F'
        : (pct >= 0.85 ? '#1B9157' : pct >= 0.6 ? '#F4D03F' : '#EF4444');

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width="84" height="84" viewBox="0 0 100 100" className="drop-shadow-sm">
                <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeOpacity={0.05} strokeWidth="8" />
                <motion.circle
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${dash} ${circumference}` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    cx="50" cy="50" r={R}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                />
                <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontSize="20" fill="#1A1A1A" className="font-black">
                    {Math.round(pct * 100)}%
                </text>
            </svg>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</p>
        </div>
    );
};

const HpaOptimizer: React.FC = () => {
    const [acreage, setAcreage] = React.useState<number>(50);
    const [treeDensity, setTreeDensity] = React.useState<string>('medium');
    const [variety, setVariety] = React.useState<string>('Almond (Nonpareil)');
    const [colonyGrade, setColonyGrade] = React.useState<ColonyGrade>('Grade A');
    const [treesPerAcre, setTreesPerAcre] = React.useState<number>(110);
    const [cropOptions, setCropOptions] = React.useState<string[]>([]);
    const [cropsLoading, setCropsLoading] = React.useState(true);

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
                if (names.length > 0 && !names.includes(variety)) {
                    setVariety(names[0]);
                }
            } catch {
                if (!mounted) return;
                setCropOptions(Object.keys(CROP_PROFILES));
            } finally {
                if (mounted) setCropsLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [variety]);

    const profile = CROP_PROFILES[variety as keyof typeof CROP_PROFILES] || CROP_PROFILES['Almond (Nonpareil)'];
    
    // Density multiplier based on tree density selection
    const densityMultiplier = treeDensity === 'high' ? 1.2 : treeDensity === 'low' ? 0.8 : 1.0;
    const adjustedTreesPerAcre = treesPerAcre * densityMultiplier;

    const results = calculateRequiredHives({
        cropType: variety as any,
        acreage,
        colonyGrade,
        treesPerAcre: adjustedTreesPerAcre
    });

    return (
        <BeeYieldPageShell className="p-4 lg:p-6 space-y-6 pb-20 relative overflow-hidden">
             {/* Background Refraction */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#1B9157]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -left-20 top-1/2 w-80 h-80 bg-[#F4D03F]/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 space-y-6">
            <BeeYieldPageHeader
                icon={Target}
                label="BeeYield Placement Optimizer"
                title={<>Placement <span className="text-[#1B9157]">Calculator</span></>}
                subtitle="Determine the best hive density for your orchard based on industry standards."
                actions={
                    <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-2xl border border-gray-100 shadow-sm backdrop-blur-md">
                        <Scale className="w-4 h-4 text-[#F4D03F]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none pt-0.5">Result Confidence: High</span>
                    </div>
                }
            />

            <div className={cn(glass.card, "flex flex-col xl:flex-row overflow-hidden p-0 bg-white/40 shadow-xl border-white/60 min-h-[600px]")}>
                {/* Inputs & Parameters */}
                <div className="w-full xl:w-[320px] p-8 space-y-8 bg-white/30 border-r border-white/40 shrink-0">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                <Database className="w-5 h-5 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-tighter pt-0.5">Field Metadata</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="orchard-acreage" className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Maximize2 className="w-3 h-3" />
                                    Orchard Size
                                </label>
                                <div className="relative group">
                                    <input
                                        id="orchard-acreage"
                                        type="number"
                                        value={acreage}
                                        onChange={(e) => setAcreage(Number(e.target.value))}
                                        className={cn(glass.input, "pr-14 h-12 text-sm text-[#1B9157] font-black bg-white shadow-sm")}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-300 text-[10px] tracking-widest uppercase">Acres</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Trees className="w-3 h-3" />
                                    Trees Per Acre
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={treesPerAcre}
                                        onChange={(e) => setTreesPerAcre(Number(e.target.value))}
                                        className={cn(glass.input, "pr-14 h-12 text-sm text-[#1A1A1A] font-black bg-white shadow-sm")}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-300 text-[10px] tracking-widest uppercase">TPA</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Scale className="w-3 h-3" />
                                    Maturation Coefficient
                                </label>
                                <div className="flex bg-white/50 p-1.5 rounded-2xl border border-gray-100 gap-1 shadow-inner overflow-hidden">
                                    {['low', 'medium', 'high'].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setTreeDensity(d)}
                                            className={cn(
                                                "flex-1 h-9 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest pt-0.5",
                                                treeDensity === d ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600 hover:bg-white"
                                            )}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6 pt-8 border-t border-white/40">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                <TreePine className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-tighter pt-0.5">Crop Selection</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">Variety Profile</label>
                                <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                    {(cropOptions.length > 0 ? cropOptions : Object.keys(CROP_PROFILES)).map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setVariety(c)}
                                            className={cn(
                                                "w-full h-11 px-4 rounded-xl border text-left text-[11px] font-black transition-all uppercase tracking-tighter flex items-center justify-between group",
                                                variety === c 
                                                    ? "bg-[#1B9157] border-[#1B9157] text-white shadow-lg" 
                                                    : "bg-white border-gray-100 text-gray-400 hover:border-emerald-200 hover:bg-emerald-50/10"
                                            )}
                                        >
                                            <span>{c}</span>
                                            {variety === c && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Main Results Solver */}
                <div className="flex-1 p-10 space-y-10 relative bg-gradient-to-br from-white to-gray-50/30">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-gray-100 pb-8">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tighter leading-none">Placement <span className="text-[#1B9157]">Results</span></h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Based on BeeYield recommendations</p>
                        </div>
                        <div className="bg-white border border-gray-100 p-1.5 rounded-2xl flex gap-1 shadow-sm">
                            {(['Grade A', 'Grade B', 'Grade C'] as ColonyGrade[]).map((g) => (
                                <button
                                    key={g}
                                    onClick={() => setColonyGrade(g)}
                                    className={cn(
                                        "h-10 px-6 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest pt-0.5",
                                        colonyGrade === g ? "bg-[#F4D03F] text-white shadow-lg shadow-[#F4D03F]/20" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        {/* Target Frame Per Acre */}
                        <div className={cn(glass.card, "bg-white border-white p-8 space-y-6 shadow-xl relative group overflow-hidden")}>
                            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
                                <LayoutGrid className="w-32 h-32" />
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                <LayoutGrid className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Requirement</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black tracking-tighter text-[#1A1A1A] leading-none">{results.targetFPA.toFixed(1)}</p>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase">FPA Index</span>
                                </div>
                            </div>
                            <p className="text-[10px] font-medium text-gray-400 leading-relaxed border-l-2 border-emerald-500/20 pl-4">
                                Critical saturation required for maximum yield potential.
                            </p>
                        </div>

                        {/* Required Hive Units */}
                        <div className={cn(glass.card, "bg-white border-white p-8 space-y-6 shadow-xl relative group overflow-hidden border-b-4 border-b-[#1B9157]")}>
                            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
                                <Hexagon className="w-32 h-32" />
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-900 border border-emerald-800 flex items-center justify-center">
                                <Hexagon className="w-6 h-6 text-white" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Optimal Density</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black tracking-tighter text-[#1A1A1A] leading-none">{results.requiredHives}</p>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase">Total Units</span>
                                </div>
                            </div>
                            <p className="text-[10px] font-medium text-gray-400 leading-relaxed border-l-2 border-emerald-500/20 pl-4">
                                Deployment density: <span className="text-[#1A1A1A] font-bold uppercase">{(results.requiredHives / acreage).toFixed(2)} Hive/Acre</span>.
                            </p>
                        </div>

                        {/* Success Probability */}
                        <div className={cn(glass.card, "bg-white border-white p-8 flex flex-col items-center justify-center gap-6 shadow-xl relative group overflow-hidden")}>
                             <CircularGauge 
                                value={results.probability} 
                                max={1} 
                                label="Success Likelihood"
                            />
                            <div className="text-center">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Optimized Outcome</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                        <div className={cn(glass.card, "p-8 bg-gray-900 border-gray-800 flex items-start gap-6 relative overflow-hidden group shadow-2xl")}>
                            <div className="absolute right-0 bottom-0 opacity-[0.02] scale-150 group-hover:translate-x-4 transition-transform duration-1000">
                                 <ShieldCheck className="w-32 h-32 text-white" />
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-[#F4D03F] border border-white/20 flex items-center justify-center shrink-0 shadow-lg shadow-[#F4D03F]/20 transition-transform hover:scale-110">
                                <Binary className="w-7 h-7 text-white" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-base font-black text-white tracking-tighter uppercase leading-none pt-2">Placement Tip</h4>
                                <p className="text-xs font-medium text-gray-400 leading-relaxed max-w-sm">
                                    Using <span className="text-white font-bold">{colonyGrade}</span> colonies for <span className="text-[#F4D03F] font-black uppercase">{variety}</span> increases the total effective frame count by {colonyGrade === 'Grade A' ? '42%' : '18%'} compared to regional averages.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                             <div className="flex bg-white/50 p-2 rounded-2xl border border-gray-100 gap-2 shadow-sm">
                                <div className="flex-1 bg-white p-6 rounded-xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-[#1B9157]/20 transition-all">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Calculated Flux</p>
                                        <p className="text-xl font-black text-[#1A1A1A] tracking-tighter">{(results.requiredHives / acreage).toFixed(2)}</p>
                                    </div>
                                    <Activity className="w-5 h-5 text-gray-100 group-hover:text-[#1B9157] transition-colors" />
                                </div>
                                <div className="flex-1 bg-[#1B9157] p-6 rounded-xl border border-[#1B9157] flex items-center justify-between group cursor-pointer shadow-lg shadow-[#1B9157]/20 hover:scale-[1.02] transition-all">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Baseline</p>
                                        <p className="text-xl font-black text-white tracking-tighter">{results.targetFPA.toFixed(1)}</p>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                             </div>
                             <button className={cn(glass.btnPrimary, "w-full h-14 rounded-2xl flex items-center justify-center gap-4 group/btn shadow-xl active:scale-95 transition-all bg-[#1A1A1A]")}>
                                <span className="text-sm font-black uppercase tracking-wider text-white">Confirm Placement</span>
                                <ArrowRight className="w-5 h-5 text-white group-hover/btn:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </motion.div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
            `}</style>
        </BeeYieldPageShell>
    );
};

export default HpaOptimizer;
