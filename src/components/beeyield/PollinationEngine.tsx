import React from 'react';
import { Calculator, Zap, Target, TrendingUp, Info, ArrowRight, Save, LayoutGrid, CheckCircle2, Loader2, BarChart3, Waves, Sparkles, Heart, ChevronDown, Binary, ShieldCheck, Activity, Settings, List as ListIcon, Hexagon, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import { beeyieldService } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { glass, PageHeader } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Calculator}
                label="Simulation Node"
                title={<>Pollination <span className="text-[#1B9157]">Matrix</span></>}
                subtitle="High-fidelity harvest planning and yield outcome simulation engine."
                actions={
                    <div className="flex items-center gap-2">
                        {crops.length > 0 ? (
                            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                                <SelectTrigger className="h-8 min-w-[120px] bg-white/50 border-[#F4D03F]/20 rounded-lg text-[10px] font-black uppercase tracking-widest pl-3 pr-2">
                                    <div className="flex items-center gap-2">
                                        <Hexagon className="w-3 h-3 text-[#F4D03F]" />
                                        <SelectValue placeholder="Select Crop" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-white border-[#F4D03F]/10">
                                    {crops.map(c => (
                                        <SelectItem key={c.id} value={c.crop_name} className="text-[10px] font-bold uppercase tracking-wider">
                                            {c.crop_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="h-8 px-3 bg-white/50 animate-pulse rounded-lg flex items-center gap-2 border border-black/5">
                                <Loader2 className="w-3 h-3 animate-spin text-[#F4D03F]" />
                            </div>
                        )}
                        <div className="h-8 px-3 bg-[#1B9157]/5 border border-[#1B9157]/10 rounded-lg flex flex-col justify-center items-center shadow-sm">
                            <p className="text-[8px] font-black uppercase text-[#1B9157]/70 leading-none mb-0.5 tracking-tighter">Yield Index</p>
                            <p className="text-xs font-black text-[#1B9157] leading-none tabular-nums">
                                {(calcResultA?.target_fpa || 1.0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Option 1 */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(glass.card, "p-5 lg:p-6 space-y-6 bg-white")}
                >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">{schemeA.label}</h3>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                            <Zap className="w-4 h-4 text-[#1B9157]" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Hives / Acre</label>
                                <span className="text-base font-bold text-[#1B9157]">{schemeA.hivesPerAcre}</span>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                <input
                                    type="range" min="0.5" max="4" step="0.1"
                                    value={schemeA.hivesPerAcre}
                                    onChange={(e) => setSchemeA({ ...schemeA, hivesPerAcre: parseFloat(e.target.value) })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="absolute top-0 left-0 h-full bg-[#1B9157] rounded-full pointer-events-none" style={{ width: `${((schemeA.hivesPerAcre - 0.5) / 3.5) * 100}%` }} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Frames / Hive</label>
                                <span className="text-base font-bold text-[#1B9157]">{schemeA.framesPerHive}</span>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                <input
                                    type="range" min="4" max="14" step="1"
                                    value={schemeA.framesPerHive}
                                    onChange={(e) => setSchemeA({ ...schemeA, framesPerHive: parseInt(e.target.value) })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="absolute top-0 left-0 h-full bg-[#1B9157] rounded-full pointer-events-none" style={{ width: `${((schemeA.framesPerHive - 4) / 10) * 100}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <CircularGauge value={calcResultA?.coverage_health_pct || statsA.setProbability} max={100} label="Success Prob" />
                        <div className="p-4 flex flex-col justify-center items-center bg-gray-50/50 rounded-xl border border-gray-100 shadow-sm group hover:bg-white transition-colors">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Cost / Acre</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">${statsA.cost.toFixed(0)}</span>
                            </div>
                            <div className="mt-4 h-1.5 bg-gray-100 w-full rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${calcResultA?.coverage_health_pct || Math.min(100, statsA.fpa * 100)}%` }}
                                    className="h-full bg-[#1B9157] rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Option 2 */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(glass.card, "p-5 lg:p-6 space-y-6 bg-white")}
                >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">{schemeB.label}</h3>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm">
                            <Target className="w-4 h-4 text-[#F4D03F]" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Hives / Acre</label>
                                <span className="text-base font-bold text-[#F4D03F]">{schemeB.hivesPerAcre}</span>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                <input
                                    type="range" min="0.5" max="4" step="0.1"
                                    value={schemeB.hivesPerAcre}
                                    onChange={(e) => setSchemeB({ ...schemeB, hivesPerAcre: parseFloat(e.target.value) })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="absolute top-0 left-0 h-full bg-[#F4D03F] rounded-full pointer-events-none" style={{ width: `${((schemeB.hivesPerAcre - 0.5) / 3.5) * 100}%` }} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Frames / Hive</label>
                                <span className="text-base font-bold text-[#F4D03F]">{schemeB.framesPerHive}</span>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                <input
                                    type="range" min="4" max="14" step="1"
                                    value={schemeB.framesPerHive}
                                    onChange={(e) => setSchemeB({ ...schemeB, framesPerHive: parseInt(e.target.value) })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="absolute top-0 left-0 h-full bg-[#F4D03F] rounded-full pointer-events-none" style={{ width: `${((schemeB.framesPerHive - 4) / 10) * 100}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <CircularGauge isPremium value={calcResultB?.coverage_health_pct || statsB.setProbability} max={100} label="Success Prob" />
                        <div className="p-4 flex flex-col justify-center items-center bg-gray-50/50 rounded-xl border border-gray-100 shadow-sm group hover:bg-white transition-colors">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Cost / Acre</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">${statsB.cost.toFixed(0)}</span>
                            </div>
                            <div className="mt-4 h-1.5 bg-gray-100 w-full rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${calcResultB?.coverage_health_pct || Math.min(100, statsB.fpa * 100)}%` }}
                                    className="h-full bg-[#F4D03F] rounded-full"
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
                className={cn(glass.card, "p-4 lg:p-6 bg-white border-gray-200 flex flex-col md:flex-row gap-4 lg:gap-6 items-center shadow-sm")}
            >
                <div className={cn("shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border shadow-sm transition-colors", aIsBetter ? "bg-emerald-50 border-emerald-100 text-[#1B9157]" : "bg-amber-50 border-amber-100 text-[#F4D03F]")}>
                    <TrendingUp className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1 text-center md:text-left">
                    <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Simulation Results</h3>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed max-w-2xl border-l-2 border-gray-200 pl-4">
                        {aIsBetter
                            ? <>{schemeA.label} increases projected yield by <span className="text-emerald-600 font-bold">+{absDelta}%</span>.</>
                            : <>{schemeB.label} increases projected yield by <span className="text-amber-600 font-bold">+{absDelta}%</span>.</>}
                        {" "}Recommended density: <span className="text-[#1A1A1A] font-bold">{(calcResultA?.target_fpa || 1.0).toFixed(2)}</span> FPA.
                    </p>
                </div>

                <div className="text-right shrink-0 px-6 border-l border-gray-100 hidden md:block">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Price Delta</p>
                    <div className="flex items-baseline justify-end gap-1">
                        <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">${Math.abs(statsA.cost - statsB.cost).toFixed(0)}</span>
                        <span className="text-[10px] font-medium text-gray-400">UNIT</span>
                    </div>
                </div>
            </motion.div>

            <button
                onClick={() => handleCommitPlan(statsA.setProbability > statsB.setProbability ? schemeA : schemeB, statsA.setProbability > statsB.setProbability ? statsA : statsB)}
                disabled={isSaving}
                className={cn(glass.btnPrimary, "w-full h-9 text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2")}
            >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Sync Strategy with Command Node</span>
            </button>
        </motion.div>
    );
};

export default PollinationEngine;
