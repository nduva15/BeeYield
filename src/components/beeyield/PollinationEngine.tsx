import React from 'react';
import { Calculator, Zap, Target, TrendingUp, Info, ArrowRight, Save, LayoutGrid, CheckCircle2, Loader2, BarChart3, Waves, Sparkles, Heart, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
import { glass, PageHeader } from './GlassTheme';
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
    const R = 32;
    const circumference = 2 * Math.PI * R;
    const dash = circumference * pct;

    const color = isPremium
        ? '#F4D03F'
        : (pct >= 0.85 ? '#10B981' : pct >= 0.6 ? '#F4D03F' : '#EF4444');

    return (
        <div className="flex flex-col items-center gap-3">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeOpacity={0.05} strokeWidth="8" />
                <motion.circle
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${dash} ${circumference}` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="50" cy="50" r={R}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                />
                <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontSize="16" fill="#1A1A1A" className="font-black italic">
                    {Math.round(pct * 100)}%
                </text>
            </svg>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">{label}</p>
        </div>
    );
};

const PollinationEngine: React.FC<PollinationEngineProps> = ({ onTabChange }) => {
    const [schemeA, setSchemeA] = React.useState<Scenario>({ hivesPerAcre: 2, framesPerHive: 8, label: 'Standard Protocol' });
    const [schemeB, setSchemeB] = React.useState<Scenario>({ hivesPerAcre: 1.5, framesPerHive: 10, label: 'Optimized Protocol' });
    const [isSaving, setIsSaving] = React.useState(false);
    const [crops, setCrops] = React.useState<any[]>([]);
    const [selectedCrop, setSelectedCrop] = React.useState('Almond');
    const [calcResultA, setCalcResultA] = React.useState<any>(null);
    const [calcResultB, setCalcResultB] = React.useState<any>(null);
    const [isCalculating, setIsCalculating] = React.useState(false);

    React.useEffect(() => {
        const loadCrops = async () => {
            const data = await beeyieldService.getCropRequirements();
            setCrops(data);
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
            className={cn(glass.page, "max-w-7xl mx-auto space-y-6 pb-24")}
        >
            <PageHeader
                icon={Calculator}
                label="Simulation Node"
                title={<>Pollination <span className="text-[#F4D03F]">Matrix</span></>}
                subtitle="High-fidelity harvest planning and yield outcome simulation engine."
                actions={
                    <div className="flex items-center gap-3">
                        {crops.length > 0 ? (
                            <div className="relative">
                                <select
                                    value={selectedCrop}
                                    onChange={(e) => setSelectedCrop(e.target.value)}
                                    className={cn(glass.input, "h-9 pl-3 pr-8 min-w-[140px] appearance-none text-[10px] font-black uppercase italic")}
                                >
                                    {crops.map(c => (
                                        <option key={c.id} value={c.crop_name} className="text-black bg-white">{c.crop_name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        ) : (
                            <div className="h-9 px-3 bg-white/40 animate-pulse rounded-lg flex items-center gap-2 border border-[#F4D03F]/10">
                                <Loader2 className="w-3 h-3 animate-spin text-[#F4D03F]" />
                            </div>
                        )}
                        <div className="h-9 px-4 bg-[#1B9157]/10 border border-[#1B9157]/10 rounded-xl flex flex-col justify-center items-center">
                            <p className="text-[7px] font-black uppercase text-[#1B9157] opacity-60 italic leading-none">Yield Index</p>
                            <p className="text-[12px] font-black text-[#1B9157] leading-none mt-1">
                                {(calcResultA?.target_fpa || 1.0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Option 1 */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(glass.section, "p-6 space-y-6 bg-white/40")}
                >
                    <div className="flex items-center justify-between border-b border-[#F4D03F]/10 pb-3">
                        <h3 className="text-[11px] font-black uppercase italic tracking-widest text-[#1A1A1A]">{schemeA.label}</h3>
                        <Zap className="w-4 h-4 text-[#1B9157]" />
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end px-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Hives/Acre</label>
                                <span className="text-base font-black italic text-[#1B9157]">{schemeA.hivesPerAcre}</span>
                            </div>
                            <input
                                type="range" min="0.5" max="4" step="0.1"
                                value={schemeA.hivesPerAcre}
                                onChange={(e) => setSchemeA({ ...schemeA, hivesPerAcre: parseFloat(e.target.value) })}
                                className="w-full h-1.5 bg-[#1A1A1A]/5 rounded-full appearance-none cursor-pointer accent-[#1B9157]"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end px-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Frames/Hive</label>
                                <span className="text-base font-black italic text-[#1B9157]">{schemeA.framesPerHive}</span>
                            </div>
                            <input
                                type="range" min="4" max="14" step="1"
                                value={schemeA.framesPerHive}
                                onChange={(e) => setSchemeA({ ...schemeA, framesPerHive: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-[#1A1A1A]/5 rounded-full appearance-none cursor-pointer accent-[#1B9157]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F4D03F]/5">
                        <CircularGauge value={calcResultA?.coverage_health_pct || statsA.setProbability} max={100} label="Success Prob" />
                        <div className="p-4 flex flex-col justify-center items-center bg-white/20 rounded-xl border border-[#F4D03F]/5">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-30 italic mb-1">Cost/Acre</p>
                            <p className="text-[24px] font-black italic text-[#1A1A1A] leading-none">${statsA.cost.toFixed(0)}</p>
                            <div className="mt-4 h-1 bg-[#1A1A1A]/5 w-full rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${calcResultA?.coverage_health_pct || Math.min(100, statsA.fpa * 100)}%` }}
                                    className="h-full bg-[#1B9157]"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Option 2 */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(glass.section, "p-6 space-y-6 bg-white/40")}
                >
                    <div className="flex items-center justify-between border-b border-[#F4D03F]/10 pb-3">
                        <h3 className="text-[11px] font-black uppercase italic tracking-widest text-[#1A1A1A]">{schemeB.label}</h3>
                        <Target className="w-4 h-4 text-[#F4D03F]" />
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end px-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Hives/Acre</label>
                                <span className="text-base font-black italic text-[#F4D03F]">{schemeB.hivesPerAcre}</span>
                            </div>
                            <input
                                type="range" min="0.5" max="4" step="0.1"
                                value={schemeB.hivesPerAcre}
                                onChange={(e) => setSchemeB({ ...schemeB, hivesPerAcre: parseFloat(e.target.value) })}
                                className="w-full h-1.5 bg-[#1A1A1A]/5 rounded-full appearance-none cursor-pointer accent-[#F4D03F]"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end px-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Frames/Hive</label>
                                <span className="text-base font-black italic text-[#F4D03F]">{schemeB.framesPerHive}</span>
                            </div>
                            <input
                                type="range" min="4" max="14" step="1"
                                value={schemeB.framesPerHive}
                                onChange={(e) => setSchemeB({ ...schemeB, framesPerHive: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-[#1A1A1A]/5 rounded-full appearance-none cursor-pointer accent-[#F4D03F]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F4D03F]/5">
                        <CircularGauge isPremium value={calcResultB?.coverage_health_pct || statsB.setProbability} max={100} label="Success Prob" />
                        <div className="p-4 flex flex-col justify-center items-center bg-white/20 rounded-xl border border-[#F4D03F]/5">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-30 italic mb-1">Cost/Acre</p>
                            <p className="text-[24px] font-black italic text-[#1A1A1A] leading-none">${statsB.cost.toFixed(0)}</p>
                            <div className="mt-4 h-1 bg-[#1A1A1A]/5 w-full rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${calcResultB?.coverage_health_pct || Math.min(100, statsB.fpa * 100)}%` }}
                                    className="h-full bg-[#F4D03F]"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Analysis Result */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-6 bg-white/60 border-[#F4D03F]/20 flex flex-col md:flex-row gap-6 items-center")}
            >
                <div className={cn("shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm", aIsBetter ? "bg-[#1B9157]/10 border-[#1B9157]/10 text-[#1B9157]" : "bg-[#F4D03F]/10 border-[#F4D03F]/10 text-[#F4D03F]")}>
                    <TrendingUp className="w-6 h-6" />
                </div>

                <div className="flex-1 space-y-1">
                    <h3 className="text-[13px] font-black uppercase italic tracking-tight text-[#1A1A1A]">Simulation <span className={aIsBetter ? "text-[#1B9157]" : "text-[#F4D03F]"}>Results</span></h3>
                    <p className="text-[11px] font-medium text-[#1A1A1A]/60 leading-relaxed uppercase italic tracking-tight border-l-2 border-current pl-4">
                        {aIsBetter
                            ? <>{schemeA.label} increases projected yield by <span className="text-[#1B9157] font-black">+{absDelta}%</span>.</>
                            : <>{schemeB.label} increases projected yield by <span className="text-[#F4D03F] font-black">+{absDelta}%</span>.</>}
                        {" "}Recommended density: <span className="text-[#1A1A1A] font-black">{(calcResultA?.target_fpa || 1.0).toFixed(2)}</span> FPA.
                    </p>
                </div>

                <div className="text-right shrink-0 px-6 border-l border-[#1A1A1A]/5 hidden md:block">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 italic mb-1">Price Delta</p>
                    <p className="text-[20px] font-black italic text-[#1A1A1A] leading-none">${Math.abs(statsA.cost - statsB.cost).toFixed(0)}</p>
                    <p className="text-[8px] font-black uppercase opacity-20 italic">per unit</p>
                </div>
            </motion.div>

            <button
                onClick={() => handleCommitPlan(statsA.setProbability > statsB.setProbability ? schemeA : schemeB, statsA.setProbability > statsB.setProbability ? statsA : statsB)}
                disabled={isSaving}
                className={cn(glass.btnPrimary, "w-full h-11 text-[10px] italic shadow-lg flex items-center justify-center gap-3")}
            >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Sync Strategy with Command Node</span>
            </button>
        </motion.div>
    );
};

export default PollinationEngine;
