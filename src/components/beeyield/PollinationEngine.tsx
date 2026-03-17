import React from 'react';
import { Calculator, Zap, Target, TrendingUp, Info, ArrowRight, Save, LayoutGrid, CheckCircle2, Loader2, BarChart3, Waves, Sparkles, Heart, ChevronDown, Binary, ShieldCheck, Activity, Settings, List as ListIcon, Hexagon, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
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
        <div className="flex flex-col items-center gap-2">
            <svg width="80" height="80" viewBox="0 0 100 100">
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
                <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontSize="18" fill="#1A1A1A" className="font-bold">
                    {Math.round(pct * 100)}%
                </text>
            </svg>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        </div>
    );
};

const PollinationEngine: React.FC<PollinationEngineProps> = ({ onTabChange }) => {
    const [schemeA, setSchemeA] = React.useState<Scenario>({ hivesPerAcre: 2, framesPerHive: 8, label: 'Standard plan' });
    const [schemeB, setSchemeB] = React.useState<Scenario>({ hivesPerAcre: 1.5, framesPerHive: 10, label: 'Optimized plan' });
    const [isSaving, setIsSaving] = React.useState(false);
    const [crops, setCrops] = React.useState<any[]>([]);
    const [selectedCrop, setSelectedCrop] = React.useState<string>('');
    const [calcResultA, setCalcResultA] = React.useState<any>(null);
    const [calcResultB, setCalcResultB] = React.useState<any>(null);
    const [isCalculating, setIsCalculating] = React.useState(false);

    React.useEffect(() => {
        const loadCrops = async () => {
            const data = await beeyieldService.getCropRequirements();
            setCrops(data);
            const names = (data || []).map((c: any) => String(c?.crop_name || c?.cropName || '').trim()).filter(Boolean);
            setSelectedCrop((prev) => {
                if (prev && names.includes(prev)) return prev;
                return names[0] || '';
            });
        };
        loadCrops();
    }, []);

    const runCalculation = React.useCallback(async () => {
        if (!selectedCrop) return;
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
            crop_type: `${selectedCrop} (Modeled)`,
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
        <BeeYieldPageShell>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
            <BeeYieldPageHeader
                icon={Calculator}
                label="Simulation"
                title={<>Pollination <span className="text-[#1B9157]">Matrix</span></>}
                subtitle="High-fidelity harvest planning and yield outcome simulation engine."
                actions={
                    <div className="flex items-center gap-2">
                        {crops.length > 0 ? (
                            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                                <SelectTrigger className={cn(glass.select, "min-w-[140px]")}>
                                    <div className="flex items-center gap-2">
                                        <Hexagon className="w-3.5 h-3.5 text-[#F4D03F]" />
                                        <SelectValue placeholder="Select Crop" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className={glass.selectContent}>
                                    {crops.map(c => (
                                        <SelectItem key={c.id} value={c.crop_name} className="text-xs font-semibold">
                                            {c.crop_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="h-9 px-3 bg-white animate-pulse rounded-lg flex items-center gap-2 border border-[#F4D03F]/20">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F4D03F]" />
                            </div>
                        )}
                        <div className={cn(glass.badge, "bg-[#1B9157]/5 text-[#1B9157] border-[#1B9157]/20 py-1.5")}>
                            Yield Index: {(calcResultA?.target_fpa || 1.0).toFixed(2)}
                        </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Option 1 */}
                <div className={cn(glass.section, "p-6 space-y-6")}>
                    <div className="flex items-center justify-between border-b border-[#F4D03F]/10 pb-4">
                        <h3 className="text-sm font-bold text-[#1A1A1A]">{schemeA.label}</h3>
                        <div className="w-8 h-8 rounded-lg bg-[#1B9157]/5 flex items-center justify-center border border-[#1B9157]/10">
                            <Zap className="w-4 h-4 text-[#1B9157]" />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label htmlFor="schemeA_hivesPerAcre" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Hives / Acre</label>
                                <span className="text-lg font-bold text-[#1B9157] tabular-nums">{schemeA.hivesPerAcre}</span>
                            </div>
                            <div className="relative h-2 bg-[#F9F7F2] rounded-full overflow-hidden border border-[#F4D03F]/10">
                                <input
                                    id="schemeA_hivesPerAcre"
                                    type="range" min="0.5" max="4" step="0.1"
                                    value={schemeA.hivesPerAcre}
                                    onChange={(e) => setSchemeA({ ...schemeA, hivesPerAcre: parseFloat(e.target.value) })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="absolute top-0 left-0 h-full bg-[#1B9157] transition-all" style={{ width: `${((schemeA.hivesPerAcre - 0.5) / 3.5) * 100}%` }} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label htmlFor="schemeA_framesPerHive" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Frames / Hive</label>
                                <span className="text-lg font-bold text-[#1B9157] tabular-nums">{schemeA.framesPerHive}</span>
                            </div>
                            <div className="relative h-2 bg-[#F9F7F2] rounded-full overflow-hidden border border-[#F4D03F]/10">
                                <input
                                    id="schemeA_framesPerHive"
                                    type="range" min="4" max="14" step="1"
                                    value={schemeA.framesPerHive}
                                    onChange={(e) => setSchemeA({ ...schemeA, framesPerHive: parseInt(e.target.value) })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="absolute top-0 left-0 h-full bg-[#1B9157] transition-all" style={{ width: `${((schemeA.framesPerHive - 4) / 10) * 100}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 mt-4 border-t border-[#F4D03F]/10">
                        <CircularGauge value={calcResultA?.coverage_health_pct || statsA.setProbability} max={100} label="Success Prob" />
                        <div className="p-4 bg-[#F9F7F2]/50 rounded-xl border border-[#F4D03F]/10 flex flex-col justify-center items-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Cost / Acre</p>
                            <span className="text-2xl font-bold text-[#1A1A1A]">${statsA.cost.toFixed(0)}</span>
                        </div>
                    </div>
                </div>

                {/* Option 2 */}
                <div className={cn(glass.section, "p-6 space-y-6")}>
                    <div className="flex items-center justify-between border-b border-[#F4D03F]/10 pb-4">
                        <h3 className="text-sm font-bold text-[#1A1A1A]">{schemeB.label}</h3>
                        <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/5 flex items-center justify-center border border-[#F4D03F]/10">
                            <Target className="w-4 h-4 text-[#F4D03F]" />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label htmlFor="schemeB_hivesPerAcre" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Hives / Acre</label>
                                <span className="text-lg font-bold text-[#F4D03F] tabular-nums">{schemeB.hivesPerAcre}</span>
                            </div>
                            <div className="relative h-2 bg-[#F9F7F2] rounded-full overflow-hidden border border-[#F4D03F]/10">
                                <input
                                    id="schemeB_hivesPerAcre"
                                    type="range" min="0.5" max="4" step="0.1"
                                    value={schemeB.hivesPerAcre}
                                    onChange={(e) => setSchemeB({ ...schemeB, hivesPerAcre: parseFloat(e.target.value) })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="absolute top-0 left-0 h-full bg-[#F4D03F] transition-all" style={{ width: `${((schemeB.hivesPerAcre - 0.5) / 3.5) * 100}%` }} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label htmlFor="schemeB_framesPerHive" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Frames / Hive</label>
                                <span className="text-lg font-bold text-[#F4D03F] tabular-nums">{schemeB.framesPerHive}</span>
                            </div>
                            <div className="relative h-2 bg-[#F9F7F2] rounded-full overflow-hidden border border-[#F4D03F]/10">
                                <input
                                    id="schemeB_framesPerHive"
                                    type="range" min="4" max="14" step="1"
                                    value={schemeB.framesPerHive}
                                    onChange={(e) => setSchemeB({ ...schemeB, framesPerHive: parseInt(e.target.value) })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="absolute top-0 left-0 h-full bg-[#F4D03F] transition-all" style={{ width: `${((schemeB.framesPerHive - 4) / 10) * 100}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 mt-4 border-t border-[#F4D03F]/10">
                        <CircularGauge isPremium value={calcResultB?.coverage_health_pct || statsB.setProbability} max={100} label="Success Prob" />
                        <div className="p-4 bg-[#F9F7F2]/50 rounded-xl border border-[#F4D03F]/10 flex flex-col justify-center items-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Cost / Acre</p>
                            <span className="text-2xl font-bold text-[#1A1A1A]">${statsB.cost.toFixed(0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis Result */}
            <div
                className={cn(glass.section, "overflow-hidden grid grid-cols-1 lg:grid-cols-12")}
            >
                <div className="lg:col-span-8 p-8 border-b lg:border-b-0 lg:border-r border-[#F4D03F]/20">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm", aIsBetter ? "bg-[#1B9157]/5 border-[#1B9157]/20 text-[#1B9157]" : "bg-[#F4D03F]/5 border-[#F4D03F]/20 text-[#F4D03F]")}>
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#1B9157]/10 rounded-lg border border-[#1B9157]/20 mb-2">
                                <Sparkles className="w-3.5 h-3.5 text-[#1B9157]" />
                                <span className="text-sm font-semibold text-[#1B9157]">Plan comparison</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#1A1A1A]">Efficiency Projection</h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 leading-relaxed max-w-2xl pl-4 border-l-2 border-[#1B9157]/20">
                            {aIsBetter
                                ? <>{schemeA.label} increases projected yield by <span className="text-[#1B9157] font-bold">+{absDelta}%</span> compared to alternative strategies.</>
                                : <>{schemeB.label} increases projected yield by <span className="text-[#F4D03F] font-bold">+{absDelta}%</span> compared to alternative strategies.</>}
                            {" "}Recommended density: <span className="text-[#1A1A1A] font-bold">{(calcResultA?.target_fpa || 1.0).toFixed(2)}</span> FPA.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-4 p-8 flex flex-col justify-between bg-[#F4D03F]/[0.02]">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Cost Delta</p>
                        <div className="text-4xl font-black text-[#1A1A1A] tracking-tighter mb-1">
                            ${Math.abs(statsA.cost - statsB.cost).toFixed(0)}
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Saving / Acre</p>
                    </div>

                    <div className="flex flex-col gap-2 mt-8">
                        <button
                            onClick={() => handleCommitPlan(statsA.setProbability > statsB.setProbability ? schemeA : schemeB, statsA.setProbability > statsB.setProbability ? statsA : statsB)}
                            disabled={isSaving}
                            className={cn(glass.btnPrimary, "w-full")}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Sync Strategy
                        </button>
                    </div>
                </div>
            </div>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default PollinationEngine;
