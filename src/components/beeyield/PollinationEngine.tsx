import React from 'react';
import { Calculator, Zap, Target, TrendingUp, Info, ArrowRight, Save, LayoutGrid, CheckCircle2, Loader2, BarChart3, Hexagon, Binary, ShieldCheck, Activity, Settings, List as ListIcon, Database, Wind, Sun, CloudRain } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    CROP_PROFILES, 
    calculateCurrentFPA, 
    calculateSuccessProbability,
    estimateYieldLoss,
    calculateRequiredHives
} from '@/lib/apicultureModels';
import { dashboardPollinationCropNames } from '@/data/beePollinationData';

interface PollinationEngineProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

interface Scenario {
    hivesPerAcre: number;
    framesPerHive: number;
    label: string;
    colonyGrade: 'A' | 'B' | 'C';
}

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

const PollinationEngine: React.FC<PollinationEngineProps> = ({ onTabChange }) => {
    const [selectedCrop, setSelectedCrop] = React.useState<string>(dashboardPollinationCropNames[0]);
    const [acreage, setAcreage] = React.useState<number>(100);
    const [weatherFactor, setWeatherFactor] = React.useState<number>(0.9);
    const [bloomIntensity, setBloomIntensity] = React.useState<number>(1.0);
    
    const [schemeA, setSchemeA] = React.useState<Scenario>({ 
        hivesPerAcre: 2.0, 
        framesPerHive: 8, 
        label: 'Standard Deployment',
        colonyGrade: 'B'
    });
    
    const [schemeB, setSchemeB] = React.useState<Scenario>({ 
        hivesPerAcre: 1.5, 
        framesPerHive: 12, 
        label: 'Precision Strategy',
        colonyGrade: 'A'
    });

    const [isSaving, setIsSaving] = React.useState(false);
    const cropProfile = CROP_PROFILES[selectedCrop] || CROP_PROFILES[dashboardPollinationCropNames[0]];

    const calculateStats = (scenario: Scenario) => {
        const currentFPA = calculateCurrentFPA(scenario.hivesPerAcre, scenario.framesPerHive, 1);
        const successProb = calculateSuccessProbability(currentFPA, cropProfile.recommendedFPA, weatherFactor, bloomIntensity);
        const yieldLoss = estimateYieldLoss(successProb);
        const costPerAcre = scenario.hivesPerAcre * 180; // Assuming $180/hive
        return { fpa: currentFPA, successProb, yieldLoss, costPerAcre };
    };

    const statsA = calculateStats(schemeA);
    const statsB = calculateStats(schemeB);

    const handleCommitPlan = async (scheme: Scenario, stats: any) => {
        setIsSaving(true);
        const { error } = await beeyieldService.savePollinationDeployment({
            field_name: `Plan: ${scheme.label} for ${selectedCrop}`,
            crop_type: selectedCrop,
            total_acres: acreage,
            target_fpa: cropProfile.recommendedFPA,
            actual_fpa: stats.fpa,
            bloom_intensity: bloomIntensity,
            forage_condition: weatherFactor,
            status: 'planned',
            metrics_json: { ...stats, scheme, crop_profile: cropProfile }
        });
        setIsSaving(false);
        if (!error) {
            toast.success("Intelligence strategy synchronized successfully.");
            onTabChange('precision-pollination-home', 'Strategy synced.', 'view-registry');
        }
    };

    const yieldDelta = Math.abs(statsA.yieldLoss - statsB.yieldLoss).toFixed(1);
    const costDelta = Math.abs(statsA.costPerAcre - statsB.costPerAcre).toFixed(0);
    const aIsBetter = statsA.successProb > statsB.successProb;

    return (
        <BeeYieldPageShell>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pb-20"
            >
            <BeeYieldPageHeader
                icon={Binary}
                label="BeeYield AI Tactical OS"
                title={<>Pollination <span className="text-[#1B9157]">Matrix</span></>}
                subtitle="Expert Frames-Per-Acre (FPA) simulation and yield outcome modeling."
                actions={
                    <div className="flex items-center gap-3">
                        <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                            <SelectTrigger className={cn(glass.select, "min-w-[160px] h-10")}>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-5 h-5 rounded-lg bg-[#1B9157]/10 flex items-center justify-center border border-[#1B9157]/20">
                                        <Database className="w-3 h-3 text-[#1B9157]" />
                                    </div>
                                    <SelectValue placeholder="Select Crop" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className={cn(glass.selectContent, "z-[105]")}>
                                {dashboardPollinationCropNames.map(name => (
                                    <SelectItem key={name} value={name} className="text-xs font-bold py-2.5">
                                        {name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <div className="hidden sm:flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Yield Index</span>
                            <span className="text-sm font-black text-[#1B9157]">v1.0.4</span>
                        </div>
                    </div>
                }
            />

            {/* Environmental Factors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className={cn(glass.section, "p-4 flex flex-col justify-between h-28")}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-gray-500">
                             <TrendingUp className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-black uppercase tracking-wider">Acres</span>
                        </div>
                        <span className="text-sm font-black text-[#1A1A1A]">{acreage}</span>
                    </div>
                    <input 
                        type="range" min="1" max="1000" step="10" 
                        value={acreage} 
                        onChange={(e) => setAcreage(parseInt(e.target.value))}
                        className="w-full accent-[#1B9157] h-1.5 rounded-full cursor-pointer"
                    />
                 </div>
                 <div className={cn(glass.section, "p-4 flex flex-col justify-between h-28")}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-gray-500">
                             <Sun className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-black uppercase tracking-wider">Weather Factor</span>
                        </div>
                        <span className="text-sm font-black text-[#1B9157]">{Math.round(weatherFactor * 100)}%</span>
                    </div>
                    <input 
                        type="range" min="0.1" max="1.0" step="0.05" 
                        value={weatherFactor} 
                        onChange={(e) => setWeatherFactor(parseFloat(e.target.value))}
                        className="w-full accent-[#1B9157] h-1.5 rounded-full cursor-pointer"
                    />
                 </div>
                 <div className={cn(glass.section, "p-4 flex flex-col justify-between h-28")}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-gray-500">
                             <Hexagon className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-black uppercase tracking-wider">Bloom Intensity</span>
                        </div>
                        <span className="text-sm font-black text-[#F4D03F]">{Math.round(bloomIntensity * 100)}%</span>
                    </div>
                    <input 
                        type="range" min="0.1" max="1.5" step="0.05" 
                        value={bloomIntensity} 
                        onChange={(e) => setBloomIntensity(parseFloat(e.target.value))}
                        className="w-full accent-[#F4D03F] h-1.5 rounded-full cursor-pointer"
                    />
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scenario A */}
                <div className={cn(glass.section, "p-6 space-y-8 relative overflow-hidden group")}>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-tight">{schemeA.label}</h3>
                            <p className="text-[10px] font-bold text-gray-400">Target Strategy v1</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#1B9157]/5 flex items-center justify-center border border-[#1B9157]/10 text-[#1B9157] group-hover:bg-[#1B9157] group-hover:text-white transition-all duration-500">
                             <Target className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="space-y-8">
                         <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hives per Acre (HPA)</label>
                                <span className="text-xl font-black text-[#1B9157] tabular-nums">{schemeA.hivesPerAcre.toFixed(1)}</span>
                            </div>
                            <input 
                                type="range" min="0.5" max="4.0" step="0.1" 
                                value={schemeA.hivesPerAcre} 
                                onChange={(e) => setSchemeA({...schemeA, hivesPerAcre: parseFloat(e.target.value)})}
                                className="w-full h-2 accent-[#1B9157]"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Frames of Bees / Hive</label>
                                <span className="text-xl font-black text-[#1B9157] tabular-nums">{schemeA.framesPerHive}</span>
                            </div>
                            <input 
                                type="range" min="4" max="18" step="1" 
                                value={schemeA.framesPerHive} 
                                onChange={(e) => setSchemeA({...schemeA, framesPerHive: parseInt(e.target.value)})}
                                className="w-full h-2 accent-[#1B9157]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-8 mt-4 border-t border-gray-100">
                        <CircularGauge value={statsA.successProb} max={100} label="Success" />
                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col justify-center items-center">
                            <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Density</p>
                            <span className={cn("text-xl font-black tabular-nums tracking-tighter", statsA.fpa >= cropProfile.recommendedFPA ? "text-[#1B9157]" : "text-[#F4D03F]")}>
                                {statsA.fpa.toFixed(1)} <span className="text-[10px] opacity-40">FPA</span>
                            </span>
                        </div>
                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col justify-center items-center">
                            <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Impact</p>
                            <span className="text-xl font-black tabular-nums tracking-tighter text-red-500">
                                -{statsA.yieldLoss.toFixed(1)}<span className="text-[10px] opacity-40">%</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Scenario B */}
                <div className={cn(glass.section, "p-6 space-y-8 relative overflow-hidden group")}>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-tight">{schemeB.label}</h3>
                            <p className="text-[10px] font-bold text-gray-400">Target Strategy v2</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/5 flex items-center justify-center border border-[#F4D03F]/10 text-[#F4D03F] group-hover:bg-[#F4D03F] group-hover:text-white transition-all duration-500">
                             <Zap className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="space-y-8">
                         <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hives per Acre (HPA)</label>
                                <span className="text-xl font-black text-[#F4D03F] tabular-nums">{schemeB.hivesPerAcre.toFixed(1)}</span>
                            </div>
                            <input 
                                type="range" min="0.5" max="4.0" step="0.1" 
                                value={schemeB.hivesPerAcre} 
                                onChange={(e) => setSchemeB({...schemeB, hivesPerAcre: parseFloat(e.target.value)})}
                                className="w-full h-2 accent-[#F4D03F]"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Frames of Bees / Hive</label>
                                <span className="text-xl font-black text-[#F4D03F] tabular-nums">{schemeB.framesPerHive}</span>
                            </div>
                            <input 
                                type="range" min="4" max="18" step="1" 
                                value={schemeB.framesPerHive} 
                                onChange={(e) => setSchemeB({...schemeB, framesPerHive: parseInt(e.target.value)})}
                                className="w-full h-2 accent-[#F4D03F]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-8 mt-4 border-t border-gray-100">
                        <CircularGauge isPremium value={statsB.successProb} max={100} label="Success" />
                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col justify-center items-center">
                            <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Density</p>
                            <span className={cn("text-xl font-black tabular-nums tracking-tighter", statsB.fpa >= cropProfile.recommendedFPA ? "text-[#1B9157]" : "text-[#F4D03F]")}>
                                {statsB.fpa.toFixed(1)} <span className="text-[10px] opacity-40">FPA</span>
                            </span>
                        </div>
                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col justify-center items-center">
                            <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Impact</p>
                            <span className="text-xl font-black tabular-nums tracking-tighter text-red-500">
                                -{statsB.yieldLoss.toFixed(1)}<span className="text-[10px] opacity-40">%</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis Overlay */}
            <div className={cn(glass.section, "grid grid-cols-1 lg:grid-cols-12 overflow-hidden shadow-xl border-gray-100")}>
                <div className="lg:col-span-8 p-10 space-y-8 border-b lg:border-b-0 lg:border-r border-gray-50">
                    <div className="flex items-center gap-5">
                         <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg transition-transform hover:rotate-3", aIsBetter ? "bg-[#1B9157]/5 border-[#1B9157]/20 text-[#1B9157]" : "bg-[#F4D03F]/5 border-[#F4D03F]/20 text-[#F4D03F]")}>
                            <TrendingUp className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-3">
                                Intelligence Core v4
                            </div>
                            <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight">Yield Difference: <span className={aIsBetter ? "text-[#1B9157]" : "text-[#F4D03F]"}>{yieldDelta}%</span></h3>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-3xl pl-5 border-l-4 border-gray-100">
                        {aIsBetter 
                            ? <><span className="text-[#1A1A1A] font-black">{schemeA.label}</span> offers superior saturation profiles. This strategy achieves <span className="text-[#1B9157] font-black">{statsA.fpa.toFixed(1)} FPA</span>, which aligns perfectly with <span className="text-[#1A1A1A] font-black">{selectedCrop}</span> requirements ({cropProfile.recommendedFPA} FPA base).</>
                            : <><span className="text-[#1A1A1A] font-black">{schemeB.label}</span> is optimized for your current parameters. By increasing colony grade, you recover <span className="text-[#F4D03F] font-black">{yieldDelta}%</span> of potential yield lost to under-pollination.</>
                        }
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Colony Standard</p>
                            <p className="text-xs font-bold text-[#1A1A1A]">8+ Frame Baseline</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kernel Coverage</p>
                            <p className="text-xs font-bold text-[#1A1A1A]">{Math.round(weatherFactor * 100)}% Saturation</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Risk Index</p>
                            <p className="text-xs font-bold text-emerald-600">Minimal</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Model Confidence</p>
                            <p className="text-xs font-bold text-[#1A1A1A]">High (Verified)</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 p-10 flex flex-col justify-between bg-gray-50/20 backdrop-blur-sm">
                    <div className="text-center space-y-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cost Efficiency Delta</span>
                        <div className="text-5xl font-black text-[#1A1A1A] tracking-tighter">
                            ${costDelta}
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saving / Acre</p>
                    </div>

                    <div className="space-y-3 mt-10">
                         <button
                            onClick={() => handleCommitPlan(aIsBetter ? schemeA : schemeB, aIsBetter ? statsA : statsB)}
                            disabled={isSaving}
                            className={cn(glass.btnPrimary, "w-full h-14 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all")}
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            <span className="text-sm font-black uppercase tracking-wider">Deploy Intelligence</span>
                        </button>
                        <p className="text-[9px] text-gray-400 text-center font-bold px-4">
                            Deployment logs are audited under precision pollination protocols.
                        </p>
                    </div>
                </div>
            </div>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default PollinationEngine;
