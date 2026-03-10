import React from 'react';
import { Calculator, Zap, Target, TrendingUp, Info, ArrowRight, Save, LayoutGrid, CheckCircle2, Loader2, BarChart3, Waves, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface PollinationEngineProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

interface Scenario {
    hivesPerAcre: number;
    framesPerHive: number;
    label: string;
}

const CircularGauge: React.FC<{ value: number; max: number; label: string; isPremium?: boolean }> = ({ value, max, label, isPremium }) => {
    const pct = Math.min(1, value / max);
    const R = 40;
    const circumference = 2 * Math.PI * R;
    const dash = circumference * pct;

    const color = isPremium
        ? (pct >= 0.85 ? '#FBBE24' : '#FBBF24')
        : (pct >= 0.85 ? '#10B981' : pct >= 0.6 ? '#FBBE24' : '#EF4444');

    return (
        <div className="flex flex-col items-center gap-6 group transition-transform duration-700 hover:scale-110">
            <svg width="140" height="140" viewBox="0 0 100 100" className="drop-shadow-4xl">
                <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeOpacity={0.05} strokeWidth="10" />
                <motion.circle
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${dash} ${circumference}` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    cx="50" cy="50" r={R}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ filter: `drop-shadow(0 0 15px ${color}60)` }}
                />
                <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontSize="22" fill="currentColor" className="font-black italic">
                    {Math.round(pct * 100)}%
                </text>
            </svg>
            <p className="text-xl font-black italic uppercase tracking-widest opacity-40">{label}</p>
        </div>
    );
};

const PollinationEngine: React.FC<PollinationEngineProps> = ({ onTabChange }) => {
    const [schemeA, setSchemeA] = React.useState<Scenario>({ hivesPerAcre: 2, framesPerHive: 8, label: 'Option 1 (Normal)' });
    const [schemeB, setSchemeB] = React.useState<Scenario>({ hivesPerAcre: 1.5, framesPerHive: 10, label: 'Option 2 (Best)' });
    const [isSaving, setIsSaving] = React.useState(false);
    const [crops, setCrops] = React.useState<any[]>([]);
    const [selectedCrop, setSelectedCrop] = React.useState('Almond');
    const [calcResultA, setCalcResultA] = React.useState<any>(null);
    const [calcResultB, setCalcResultB] = React.useState<any>(null);
    const [isCalculating, setIsCalculating] = React.useState(false);

    React.useEffect(() => {
        const loadCrops = async () => {
            setTimeout(async () => {
                const data = await beeyieldService.getCropRequirements();
                setCrops(data);
            }, 600);
        };
        loadCrops();
    }, []);

    const runCalculation = React.useCallback(async () => {
        setIsCalculating(true);
        try {
            const [resA, resB] = await Promise.all([
                beeyieldService.calculatePollination({
                    crop_type: selectedCrop,
                    acreage: 100,
                    avg_frames_per_hive: schemeA.framesPerHive,
                    weather_factor: 0.9
                }),
                beeyieldService.calculatePollination({
                    crop_type: selectedCrop,
                    acreage: 100,
                    avg_frames_per_hive: schemeB.framesPerHive,
                    weather_factor: 0.9
                })
            ]);
            setCalcResultA(resA);
            setCalcResultB(resB);
        } catch (e) {
            console.error('Calculation error:', e);
        } finally {
            setIsCalculating(false);
        }
    }, [selectedCrop, schemeA, schemeB]);

    React.useEffect(() => {
        const timer = setTimeout(runCalculation, 500);
        return () => clearTimeout(timer);
    }, [runCalculation]);

    const PRICE_PER_HIVE = 180;
    const VARIETY_MULTIPLIER = 1.25;

    const statsA = React.useMemo(() => {
        const fpa = (schemeA.hivesPerAcre * schemeA.framesPerHive) / 10;
        const cost = schemeA.hivesPerAcre * PRICE_PER_HIVE;
        const setProbability = Math.min(100, fpa * 100 * VARIETY_MULTIPLIER);
        return { fpa, cost, setProbability };
    }, [schemeA]);

    const statsB = React.useMemo(() => {
        const fpa = (schemeB.hivesPerAcre * schemeB.framesPerHive) / 10;
        const cost = schemeB.hivesPerAcre * PRICE_PER_HIVE;
        const setProbability = Math.min(100, fpa * 100 * VARIETY_MULTIPLIER);
        return { fpa, cost, setProbability };
    }, [schemeB]);

    const handleCommitPlan = async (scheme: Scenario, stats: any) => {
        setIsSaving(true);
        const { error } = await beeyieldService.savePollinationDeployment({
            field_name: `Planned: ${scheme.label}`,
            crop_type: 'Almond (Modeled)',
            total_acres: 100,
            target_fpa: stats.fpa,
            bloom_intensity: 0.8,
            forage_condition: 0.8,
            status: 'planned',
            metrics_json: { ...stats, scheme }
        });
        setIsSaving(false);
        if (!error) {
            toast.success("Pollination plan saved.");
            onTabChange('precision-pollination-home', 'Pollination plan saved.', 'view-registry');
        }
    };

    const deltaProbability = (calcResultA?.coverage_health_pct || statsA.setProbability) - (calcResultB?.coverage_health_pct || statsB.setProbability);
    const aIsBetter = deltaProbability > 0;
    const absDelta = Math.abs(deltaProbability).toFixed(1);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-20 pb-24")}
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 pb-12 border-b border-white/5">
                <div className="space-y-6">
                    <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20 px-8 py-2.5 shadow-3xl skew-x-[-12deg]')}>
                        <div className="flex items-center gap-4 skew-x-[12deg]">
                            <Calculator className="w-5 h-5" />
                            <span className="uppercase tracking-[0.4em] font-black italic text-[12px]">Harvest Planner</span>
                        </div>
                    </div>
                    <h1 className="text-8xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Pollination <span className="text-honey">Planner</span>
                    </h1>
                    <p className={cn(glass.microLabel, "opacity-40 italic font-black uppercase tracking-[0.4em] ml-2")}>
                        Find the best hive plan for your orchard and see the results.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8">
                    {crops.length > 0 ? (
                        <div className="relative w-full sm:w-auto overflow-hidden rounded-[2.5rem] shadow-4xl group">
                            <select
                                value={selectedCrop}
                                onChange={(e) => setSelectedCrop(e.target.value)}
                                className="h-24 px-12 pr-20 appearance-none bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl border-4 border-white/5 text-3xl font-black italic uppercase tracking-tighter outline-none focus:border-honey/50 transition-all cursor-pointer"
                            >
                                {crops.map(c => (
                                    <option key={c.id} value={c.crop_name}>{c.crop_name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none opacity-40 group-hover:text-honey transition-colors">
                                <Waves className="w-8 h-8" />
                            </div>
                        </div>
                    ) : (
                        <div className="h-24 px-12 bg-white/5 animate-pulse rounded-[2.5rem] flex items-center gap-6">
                            <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                            <span className="text-xl font-black italic uppercase opacity-20">Loading Crops...</span>
                        </div>
                    )}

                    <div className="h-24 px-12 bg-emerald-500/10 border-4 border-emerald-500/20 shadow-4xl rounded-[2.5rem] flex flex-col justify-center items-center gap-1 min-w-[200px]">
                        <p className="text-[12px] font-black italic uppercase tracking-widest text-emerald-500 opacity-60">Best Score</p>
                        <p className="text-4xl font-black italic tracking-tighter text-emerald-500 leading-none">
                            {(calcResultA?.target_fpa || 1.0).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Option 1 */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(glass.card, "p-16 space-y-12 shadow-4xl relative overflow-hidden bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-[6rem] border-white/5 group hover:border-honey/20 transition-all")}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000" />

                    <div className="flex items-center justify-between border-b-4 border-white/5 pb-10 relative z-10">
                        <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{schemeA.label}</h3>
                        <Zap className="w-10 h-10 text-emerald-500" />
                    </div>

                    <div className="space-y-12 relative z-10">
                        <div className="space-y-6">
                            <div className="flex justify-between items-end px-4">
                                <label className="text-xl font-black italic uppercase tracking-widest opacity-40">Hives per Acre</label>
                                <span className="text-5xl font-black italic tracking-tighter tabular-nums border-b-8 border-emerald-500/20">{schemeA.hivesPerAcre}</span>
                            </div>
                            <input
                                type="range" min="0.5" max="4" step="0.1"
                                value={schemeA.hivesPerAcre}
                                onChange={(e) => setSchemeA({ ...schemeA, hivesPerAcre: parseFloat(e.target.value) })}
                                className="w-full h-4 bg-black/10 dark:bg-white/10 rounded-full outline-none appearance-none cursor-pointer p-1 shadow-inner [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-4xl"
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-end px-4">
                                <label className="text-xl font-black italic uppercase tracking-widest opacity-40">Frames per Hive</label>
                                <span className="text-5xl font-black italic tracking-tighter tabular-nums border-b-8 border-emerald-500/20">{schemeA.framesPerHive}</span>
                            </div>
                            <input
                                type="range" min="4" max="14" step="1"
                                value={schemeA.framesPerHive}
                                onChange={(e) => setSchemeA({ ...schemeA, framesPerHive: parseInt(e.target.value) })}
                                className="w-full h-4 bg-black/10 dark:bg-white/10 rounded-full outline-none appearance-none cursor-pointer p-1 shadow-inner [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-4xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 pt-12 relative z-10">
                        <CircularGauge value={calcResultA?.coverage_health_pct || statsA.setProbability} max={100} label="Flower Score" />
                        <div className="rounded-[4rem] bg-black/5 dark:bg-white/5 p-10 flex flex-col justify-center items-center text-center border-4 border-white/5 shadow-4xl">
                            <p className="text-[14px] font-black italic uppercase tracking-[0.3em] opacity-40 mb-3">Cost per Acre</p>
                            <p className="text-6xl font-black italic tracking-tighter tabular-nums leading-none">${statsA.cost.toFixed(0)}</p>
                            <div className="mt-8 h-3 bg-black/10 dark:bg-white/10 w-full rounded-full overflow-hidden p-[2px]">
                                <motion.div
                                    animate={{ width: `${calcResultA?.coverage_health_pct || Math.min(100, statsA.fpa * 100)}%` }}
                                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Option 2 */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(glass.card, "p-16 space-y-12 shadow-4xl relative overflow-hidden bg-honey/10 dark:bg-[#0D0D0D]/90 backdrop-blur-3xl rounded-[6rem] border-honey/20 group hover:border-honey transition-all")}
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-honey/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none group-hover:bg-honey/15 transition-all duration-1000" />

                    <div className="flex items-center justify-between border-b-4 border-white/5 pb-10 relative z-10">
                        <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{schemeB.label}</h3>
                        <Target className="w-10 h-10 text-honey" />
                    </div>

                    <div className="space-y-12 relative z-10">
                        <div className="space-y-6">
                            <div className="flex justify-between items-end px-4">
                                <label className="text-xl font-black italic uppercase tracking-widest opacity-40">Hives per Acre</label>
                                <span className="text-5xl font-black italic tracking-tighter tabular-nums border-b-8 border-honey/40">{schemeB.hivesPerAcre}</span>
                            </div>
                            <input
                                type="range" min="0.5" max="4" step="0.1"
                                value={schemeB.hivesPerAcre}
                                onChange={(e) => setSchemeB({ ...schemeB, hivesPerAcre: parseFloat(e.target.value) })}
                                className="w-full h-4 bg-black/10 dark:bg-white/10 rounded-full outline-none appearance-none cursor-pointer p-1 shadow-inner [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-honey [&::-webkit-slider-thumb]:shadow-4xl"
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-end px-4">
                                <label className="text-xl font-black italic uppercase tracking-widest opacity-40">Frames per Hive</label>
                                <span className="text-5xl font-black italic tracking-tighter tabular-nums border-b-8 border-honey/40">{schemeB.framesPerHive}</span>
                            </div>
                            <input
                                type="range" min="4" max="14" step="1"
                                value={schemeB.framesPerHive}
                                onChange={(e) => setSchemeB({ ...schemeB, framesPerHive: parseInt(e.target.value) })}
                                className="w-full h-4 bg-black/10 dark:bg-white/10 rounded-full outline-none appearance-none cursor-pointer p-1 shadow-inner [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-honey [&::-webkit-slider-thumb]:shadow-4xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 pt-12 relative z-10">
                        <CircularGauge isPremium value={calcResultB?.coverage_health_pct || statsB.setProbability} max={100} label="Flower Score" />
                        <div className="rounded-[4rem] bg-black/5 dark:bg-white/5 p-10 flex flex-col justify-center items-center text-center border-4 border-white/5 shadow-4xl transition-all group-hover:bg-honey/5">
                            <p className="text-[14px] font-black italic uppercase tracking-[0.3em] opacity-40 mb-3">Cost per Acre</p>
                            <p className="text-6xl font-black italic tracking-tighter tabular-nums leading-none">${statsB.cost.toFixed(0)}</p>
                            <div className="mt-8 h-3 bg-black/10 dark:bg-white/10 w-full rounded-full overflow-hidden p-[2px]">
                                <motion.div
                                    animate={{ width: `${calcResultB?.coverage_health_pct || Math.min(100, statsB.fpa * 100)}%` }}
                                    className="h-full bg-honey rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)]"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Analysis Result */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={cn(glass.card, "p-16 shadow-4xl bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-[5.5rem] border-8 relative group", aIsBetter ? "border-emerald-500/20" : "border-honey/20")}
            >
                <div className="absolute right-0 top-0 w-96 h-96 bg-honey/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-honey/10 transition-all duration-1000" />
                <div className="flex flex-col md:flex-row gap-16 items-center">
                    <div className={cn("shrink-0 w-32 h-32 rounded-[4rem] flex items-center justify-center border-4 shadow-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700", aIsBetter ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-honey/10 border-honey/20 text-honey")}>
                        <TrendingUp className="w-16 h-16" />
                    </div>

                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Success <span className={aIsBetter ? "text-emerald-500" : "text-honey"}>Insight</span></h3>
                        <p className="text-3xl font-black italic text-foreground opacity-60 leading-tight max-w-5xl pl-8 border-l-8 border-current">
                            {aIsBetter
                                ? <><span className="text-emerald-500">{schemeA.label} is better because it gets you more honey (+{absDelta}%).</span></>
                                : <><span className="text-honey">{schemeB.label} is better because it gets you more honey (+{absDelta}%).</span></>}
                            {" "}Based on your trees and {selectedCrop} needs, we recommend about <span className="text-foreground italic font-black">{(calcResultA?.target_fpa || 1.0).toFixed(2)}</span> hives for best results.
                        </p>
                    </div>

                    <div className="border-l-4 border-black/5 dark:border-white/5 pl-12 hidden md:block shrink-0 text-right">
                        <p className="text-[14px] font-black italic uppercase tracking-[0.4em] opacity-40 mb-4">Cost Difference</p>
                        <p className="text-7xl font-black italic uppercase tracking-tighter tabular-nums leading-none">${Math.abs(statsA.cost - statsB.cost).toFixed(0)}</p>
                        <p className="text-[12px] font-black italic uppercase opacity-20 mt-2">per acre</p>
                    </div>
                </div>
            </motion.div>

            <motion.button
                onClick={() => handleCommitPlan(statsA.setProbability > statsB.setProbability ? schemeA : schemeB, statsA.setProbability > statsB.setProbability ? statsA : statsB)}
                disabled={isSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(glass.btnPrimary, "w-full h-32 text-3xl font-black italic uppercase tracking-[0.4em] rounded-[4rem] shadow-4xl relative overflow-hidden group border-white/10 flex items-center justify-center gap-10")}
            >
                <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer" />
                {isSaving ? <Loader2 className="w-12 h-12 animate-spin" /> : <Save className="w-12 h-12" />}
                <span>Save Best <span className="text-black font-serif italic text-4xl">Plan</span> to Hive Hub</span>
                <Sparkles className="w-12 h-12 group-hover:translate-x-6 transition-transform opacity-40" />
            </motion.button>

            <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 2s infinite linear; }
            `}</style>
        </motion.div>
    );
};

export default PollinationEngine;
