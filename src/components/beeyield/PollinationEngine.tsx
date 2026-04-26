import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Binary,
  Calculator,
  Hexagon,
  Loader2,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  X,
  Server,
  Flower2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { useApiaries, useHives } from '@/hooks/useHives';
import { useFlightPotential } from '@/hooks/useFlightPotential';
import { beeyieldService, CropPollinationRequirement } from '@/services/beeyieldService';
import {
  calculateCurrentFPA,
  calculateSuccessProbability,
  estimateYieldLoss,
} from '@/lib/apicultureModels';
import { dashboardPollinationCropNames } from '@/data/beePollinationData';
import { cn } from '@/lib/utils';
import { resolveTargetFpa } from '@/lib/pollinationInsights';
import { glass, PageHeader } from './GlassTheme';
import MarkdownRenderer from "./lovable_ai/MarkdownRenderer";
import { FLORAGE } from "./lovable_ai/FloragePage";

// AI Tools data constants:
const CROP_DATA: Record<string, { radius: number; contractPerAc: number; demand: number; setBoost: number }> = {
  Almonds:    { radius: 800,  contractPerAc: 2.0, demand: 1.5, setBoost: 0.85 },
  Apples:     { radius: 600,  contractPerAc: 1.0, demand: 1.2, setBoost: 0.70 },
  Blueberries:{ radius: 500,  contractPerAc: 3.0, demand: 1.3, setBoost: 0.75 },
  Avocado:    { radius: 700,  contractPerAc: 2.5, demand: 1.2, setBoost: 0.65 },
  Sunflower:  { radius: 1200, contractPerAc: 1.0, demand: 0.8, setBoost: 0.60 },
  Coffee:     { radius: 600,  contractPerAc: 1.5, demand: 0.7, setBoost: 0.30 },
  Mango:      { radius: 700,  contractPerAc: 1.5, demand: 1.0, setBoost: 0.55 },
  Macadamia:  { radius: 800,  contractPerAc: 4.0, demand: 1.4, setBoost: 0.80 },
  Sidr:       { radius: 1500, contractPerAc: 0.5, demand: 0.5, setBoost: 0.20 },
  Watermelon: { radius: 700,  contractPerAc: 1.0, demand: 1.1, setBoost: 0.90 },
  Strawberry: { radius: 400,  contractPerAc: 1.5, demand: 1.0, setBoost: 0.30 },
  Canola:     { radius: 1500, contractPerAc: 0.5, demand: 0.6, setBoost: 0.25 },
};

interface PollinationEngineProps {
  onTabChange?: (tab: string, message?: string, action?: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
}

interface Scenario {
  hivesPerAcre: number;
  framesPerHive: number;
  label: string;
  colonyGrade: 'A' | 'B' | 'C';
}

const EMPTY_APIARIES: any[] = [];
const EMPTY_APIARY_HIVES: any[] = [];

const CircularGauge: React.FC<{ value: number; max: number; label: string; accent: string }> = ({
  value,
  max,
  label,
  accent,
}) => {
  const pct = Math.min(1, value / max);
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * pct;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="84" height="84" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth="8" />
        <motion.circle
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference}` }}
          transition={{ duration: 1.1, ease: 'circOut' }}
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth="8"
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontSize="20" fill="#E2E8F0" className="font-black">
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">{label}</p>
    </div>
  );
};

const gradeFromFrames = (framesPerHive: number): Scenario['colonyGrade'] => {
  if (framesPerHive >= 11) return 'A';
  if (framesPerHive >= 8) return 'B';
  return 'C';
};

const PollinationEngine: React.FC<PollinationEngineProps> = ({ onTabChange, isOpen = true, onClose, embedded = false }) => {
  const [isExternal, setIsExternal] = useState(false);
  const [selectedApiaryId, setSelectedApiaryId] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Almonds');
  const [cropRequirements, setCropRequirements] = useState<CropPollinationRequirement[]>([]);
  const [acreage, setAcreage] = useState(40);
  const [weatherFactor, setWeatherFactor] = useState(0.9);
  const [bloomIntensity, setBloomIntensity] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Florage AI Inputs
  const [expectedBpm, setExpectedBpm] = useState(100);
  const [selectedFlorage, setSelectedFlorage] = useState<string[]>(["Clover (White)", "Phacelia"]);
  const [region, setRegion] = useState("California Central Valley");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [schemeA, setSchemeA] = useState<Scenario>({
    hivesPerAcre: 1,
    framesPerHive: 8,
    label: 'Current field plan',
    colonyGrade: 'B',
  });
  const [schemeB, setSchemeB] = useState<Scenario>({
    hivesPerAcre: 1.5,
    framesPerHive: 10,
    label: 'Recommended plan',
    colonyGrade: 'A',
  });

  const apiariesQuery = useApiaries();
  const apiaries = apiariesQuery.data ?? EMPTY_APIARIES;
  const activeApiary = useMemo(
    () => apiaries.find((apiary) => apiary.id === selectedApiaryId) || null,
    [apiaries, selectedApiaryId],
  );

  const hivesQuery = useHives(isExternal ? undefined : (selectedApiaryId || undefined));
  const apiaryHives = hivesQuery.data ?? EMPTY_APIARY_HIVES;
  const flightPotentialQuery = useFlightPotential(isExternal ? undefined : (selectedApiaryId || undefined));
  const flightPotential = flightPotentialQuery.data;

  useEffect(() => {
    if (!isExternal && !selectedApiaryId && apiaries.length > 0) {
      setSelectedApiaryId(apiaries[0].id);
    }
  }, [apiaries, selectedApiaryId, isExternal]);

  useEffect(() => {
    let mounted = true;

    const loadCropRequirements = async () => {
      try {
        const data = await beeyieldService.getCropRequirements();
        if (mounted) setCropRequirements(data || []);
      } catch (error) {
        console.error(error);
        if (mounted) setCropRequirements([]);
      }
    };

    loadCropRequirements();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedCropRequirement = useMemo(() => {
    const normalized = String(selectedCrop || '').trim().toLowerCase();
    return cropRequirements.find((crop) => String(crop.crop_name || '').trim().toLowerCase() === normalized) || null;
  }, [cropRequirements, selectedCrop]);

  const targetFpa = useMemo(
    () => resolveTargetFpa(selectedCrop || activeApiary?.forage_type, cropRequirements),
    [activeApiary?.forage_type, cropRequirements, selectedCrop],
  );

  const florageData = useMemo(() => {
    const picks = FLORAGE.filter((f) => selectedFlorage.includes(f.name));
    const avgScore = picks.length ? picks.reduce((s, p) => s + (p.nectar + p.pollen), 0) / (picks.length * 2) : 5;
    return { picks, avgScore, multiplier: avgScore / 10 };
  }, [selectedFlorage]);

  // Combine original weather/bloom with florage/BPM multipliers for scenario math.
  // The precision hives approach leverages effective flight radius which acts essentially like high FPA buffering.
  const activityMult = Math.max(0.3, expectedBpm / 100);
  const florageMult = Math.max(0.4, florageData.multiplier);
  
  const aiCropData = CROP_DATA[selectedCrop] || CROP_DATA.Almonds;
  const calcs = useMemo(() => {
    const acreM2 = acreage * 4046.86;
    const singleHiveArea = Math.PI * aiCropData.radius * aiCropData.radius * florageMult * activityMult;
    const precisionHives = Math.ceil((acreM2 / singleHiveArea) * aiCropData.demand);
    const contractHives = Math.ceil(acreage * aiCropData.contractPerAc);
    const expectedSet = Math.min(0.95, aiCropData.setBoost * florageMult * activityMult * bloomIntensity);
    const yieldUplift = (expectedSet - 0.4) * 100;
    return { acreM2, singleHiveArea, precisionHives, contractHives, expectedSet, yieldUplift };
  }, [acreage, aiCropData, florageMult, activityMult, bloomIntensity]);

  useEffect(() => {
    if (isExternal) return; // Don't override user inputs when external
    if (!activeApiary) return;

    const resolvedAcreage = Math.max(1, Number(activeApiary.size_acres || 0) || 1);
    const avgFrames = apiaryHives.length
      ? apiaryHives.reduce((sum, hive) => sum + (Number(hive.frame_count) || 8), 0) / apiaryHives.length
      : Number(selectedCropRequirement?.target_frames_per_hive || 8);
    const currentHpa = apiaryHives.length ? apiaryHives.length / resolvedAcreage : Number(selectedCropRequirement?.hives_per_acre_recommended || 1);
    const recommendedFrames = Math.max(Number(selectedCropRequirement?.target_frames_per_hive || avgFrames || 8), 8);
    const recommendedHpa = Math.max(Number(selectedCropRequirement?.hives_per_acre_recommended || 0), targetFpa / Math.max(1, recommendedFrames));
    const baselineWeather = typeof flightPotential?.score === 'number'
      ? Math.max(0.4, Math.min(1, flightPotential.score / 100))
      : 0.9;

    setTimeout(() => {
      setAcreage(resolvedAcreage);
      setWeatherFactor(Number(baselineWeather.toFixed(2)));
      setSelectedCrop((current) => {
        if (current && Object.keys(CROP_DATA).includes(current)) return current;
        if (activeApiary.forage_type && Object.keys(CROP_DATA).includes(String(activeApiary.forage_type))) return String(activeApiary.forage_type);
        return 'Almonds';
      });
      setSchemeA({
        hivesPerAcre: Number(currentHpa.toFixed(2)),
        framesPerHive: Math.round(avgFrames || 8),
        label: 'Current field plan',
        colonyGrade: gradeFromFrames(avgFrames || 8),
      });
      setSchemeB({
        hivesPerAcre: Number(Math.max(currentHpa, recommendedHpa || 1).toFixed(2)),
        framesPerHive: Math.round(recommendedFrames),
        label: 'Recommended plan',
        colonyGrade: gradeFromFrames(recommendedFrames),
      });
    }, 0);
  }, [activeApiary, apiaryHives.length, selectedCropRequirement, targetFpa, isExternal, flightPotential?.score]);

  const calculateStats = useCallback(
    (scenario: Scenario) => {
      // Modify current FPA logic with modern multipliers
      const baseFpa = calculateCurrentFPA(scenario.hivesPerAcre, scenario.framesPerHive, 1);
      const enhancedFpa = baseFpa * florageMult * activityMult;
      const successProb = calculateSuccessProbability(enhancedFpa, targetFpa, weatherFactor, bloomIntensity);
      const yieldLoss = estimateYieldLoss(successProb);
      const costPerAcre = scenario.hivesPerAcre * 180;
      return { fpa: enhancedFpa, successProb, yieldLoss, costPerAcre };
    },
    [bloomIntensity, targetFpa, weatherFactor, florageMult, activityMult],
  );

  const statsA = calculateStats(schemeA);
  const statsB = calculateStats(schemeB);
  const betterPlan = statsA.successProb > statsB.successProb ? schemeA : schemeB;

  const handleCommitPlan = async (scenario: Scenario, stats: ReturnType<typeof calculateStats>) => {
    if (isExternal) {
      toast.success('Simulation run successfully. (External mode saves locally only)');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await beeyieldService.savePollinationDeployment({
        field_name: activeApiary?.name || `Pollination plan ${new Date().toLocaleDateString()}`,
        crop_type: selectedCrop || activeApiary?.forage_type || 'Unknown',
        total_acres: acreage,
        target_fpa: targetFpa,
        actual_fpa: stats.fpa,
        bloom_intensity: bloomIntensity,
        forage_condition: weatherFactor,
        status: 'planned',
        metrics_json: {
          apiary_id: selectedApiaryId,
          apiary_name: activeApiary?.name,
          scheme: scenario,
          stats,
          live_hives: apiaryHives.length,
          ai_florage_multiplier: florageMult,
          ai_activity_multiplier: activityMult,
        },
      });

      if (error) throw error;

      toast.success('Pollination plan saved.');
      if (onTabChange) onTabChange('precision-pollination-home', 'Plan saved to pollination overview.', 'view-registry');
    } catch (error) {
      console.error(error);
      toast.error('Could not save the plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const runAI = async () => {
    setAiLoading(true); setAiText("");
    const prompt = `As Beeyield AI, write a **Florage-Weighted Pollination Plan** for **${selectedCrop}** on **${acreage} acres** in **${region}**.

Computed inputs:
- Field area: ${calcs.acreM2.toFixed(0)} m² (${acreage} ac)
- Crop foraging radius: ${aiCropData.radius} m
- Florage diversity multiplier: ${florageMult.toFixed(2)} (selected: ${selectedFlorage.join(", ") || "none"})
- Activity multiplier: ${activityMult.toFixed(2)} (expected ${expectedBpm} bees/min)
- Effective area per hive: ${(calcs.singleHiveArea / 10000).toFixed(2)} ha
- **Precision hive requirement: ${calcs.precisionHives} hives**
- Contract baseline (industry standard): ${calcs.contractHives} hives
- Expected fruit/seed set: ${(calcs.expectedSet * 100).toFixed(0)}%
- Yield uplift vs unpollinated baseline: ${calcs.yieldUplift.toFixed(0)}%

Required sections:
1. **Hive Deployment Schedule** — when to place, in what configuration (perimeter vs grid vs strip).
2. **Florage Enhancement Plan** — 3 specific cover-crop or hedgerow species to plant for season-long support.
3. **Risk Mitigation** — 3 risks (weather, pesticides, pest pressure) with mitigations.
4. **ROI Estimate** — projected yield uplift in tons or kg per acre, marketable value vs hive rental cost.`;
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], promptVariant: "bloom_flight" }),
      });
      if (!resp.ok || !resp.body) { toast.error("AI gateway error: Could not fetch plan."); setAiLoading(false); return; }
      const reader = resp.body.getReader(); const decoder = new TextDecoder();
      let buf = ""; let acc = ""; let done = false;
      while (!done) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { done = true; break; }
          try { const p = JSON.parse(j); const c = p.choices?.[0]?.delta?.content; if (c) { acc += c; setAiText(acc); } } catch { /* partial */ }
        }
      }
    } catch { toast.error("Connection failed."); }
    finally { setAiLoading(false); }
  };

  const toggleFlorage = (name: string) => {
    setSelectedFlorage((cur) => cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name]);
  };

  if (!isOpen) return null;

  const loading = isExternal ? false : (apiariesQuery.isLoading || hivesQuery.isLoading);

  const MasterContainer = embedded ? motion.div : React.Fragment;
  const containerProps = embedded ? {
      className: "h-full bg-card/60 backdrop-blur-xl rounded-[2rem] border border-border/50 overflow-y-auto custom-scroll -m-2 p-2 relative",
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.3 }
  } : {};

  return (
    <MasterContainer {...containerProps}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={embedded ? "p-4 space-y-6" : glass.page}>
        
        {embedded ? (
          <div className="flex items-center justify-between mb-4 mt-2 px-2 sticky top-0 z-50 py-2 bg-gradient-to-b from-background/90 to-transparent backdrop-blur-sm -mx-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-honey" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-black tracking-tight text-foreground leading-none">Pollination Intelligence</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-honey mt-1">AI-Powered Modeling</span>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <PageHeader
            icon={Binary}
            label="Pollination Planning"
            title={<>Pollination <span className="text-primary">Engine</span></>}
            subtitle="Scenario planning grounded in historical yield, florage arrays, and flight potential."
            actions={
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={isExternal ? 'external' : selectedApiaryId}
                  onChange={(event) => {
                    const val = event.target.value;
                    if (val === 'external') setIsExternal(true);
                    else { setIsExternal(false); setSelectedApiaryId(val); }
                  }}
                  className={cn(glass.input, 'h-10 min-w-[220px]')}
                >
                  <optgroup label="Database Apiaries">
                    {apiaries.map((apiary) => (
                      <option key={apiary.id} value={apiary.id}>{apiary.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Tools">
                    <option value="external">Simulation Tool (External Field)</option>
                  </optgroup>
                </select>
                <span className={cn(glass.badge, isExternal ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20")}>
                  {loading ? 'Loading...' : (isExternal ? 'Simulation mode' : `${apiaryHives.length} live hives`)}
                </span>
              </div>
            }
          />
        )}

        <div className="space-y-6 relative z-10 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Acreage',
                value: acreage,
                accent: 'accent-primary',
                icon: MapPin,
                step: 1,
                min: 1,
                max: Math.max(10, Math.ceil(acreage * 2)),
                onChange: (value: number) => setAcreage(value),
              },
              {
                label: 'Weather factor',
                value: weatherFactor,
                display: `${Math.round(weatherFactor * 100)}%`,
                accent: 'accent-primary',
                icon: TrendingUp,
                step: 0.05,
                min: 0.2,
                max: 1,
                onChange: (value: number) => setWeatherFactor(value),
              },
              {
                label: 'Bloom intensity',
                value: bloomIntensity,
                display: `${Math.round(bloomIntensity * 100)}%`,
                accent: 'accent-honey',
                icon: Sparkles,
                step: 0.05,
                min: 0.3,
                max: 1.5,
                onChange: (value: number) => setBloomIntensity(value),
              },
              {
                label: 'Expected BPM',
                value: expectedBpm,
                display: `${expectedBpm} bees/m`,
                accent: 'accent-amber-500',
                icon: Server,
                step: 10,
                min: 20,
                max: 300,
                onChange: (value: number) => setExpectedBpm(value),
              },
            ].map((control) => (
              <div key={control.label} className={cn(glass.section, 'p-4 flex flex-col justify-between')}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <control.icon className="h-4 w-4 text-foreground/70" />
                    <span className={glass.microLabel}>{control.label}</span>
                  </div>
                  <span className="text-base font-black text-foreground">
                    {control.display || control.value}
                  </span>
                </div>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={control.value}
                  onChange={(event) => control.onChange(Number(event.target.value))}
                  className={cn('w-full h-2 cursor-pointer rounded-full mt-2', control.accent)}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={cn(glass.section, "p-4")}>
              <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
                <div className="flex items-center gap-2 text-foreground">
                  <Flower2 className="h-4 w-4 text-honey" />
                  <span className="text-sm font-bold tracking-tight">Surrounding Florage <span className="opacity-60 font-medium text-xs">(within 1 km)</span></span>
                </div>
                <span className="font-mono text-xs font-bold text-honey">{florageMult.toFixed(2)}x Boost</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto custom-scroll pr-2">
                {FLORAGE.map((f) => (
                  <button key={f.name} onClick={() => toggleFlorage(f.name)} className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${selectedFlorage.includes(f.name) ? "bg-honey text-honey-foreground border-transparent shadow shadow-honey/20" : "bg-card border-border text-muted-foreground hover:border-primary/50"}`}>
                    {f.name} <span className="opacity-60 text-[9px] ml-1">({((f.nectar + f.pollen) / 2).toFixed(0)})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={cn(glass.section, "p-4 bg-muted/20 border-primary/10")}>
              <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
                <span className="text-sm font-bold tracking-tight">AI Precision Math Metrics</span>
                <span className="text-xs font-mono font-medium text-muted-foreground">Area: {(calcs.acreM2).toFixed(0)}m²</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="rounded-xl border border-border bg-card p-3 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Precision Hives</span>
                  <span className="text-2xl font-black text-primary">{calcs.precisionHives}</span>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contract Default</span>
                  <span className="text-2xl font-black text-foreground">{calcs.contractHives}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs px-2 mt-4 text-muted-foreground">
                <span className="font-medium">Expected Seed Set: <b className="text-foreground">{(calcs.expectedSet * 100).toFixed(0)}%</b></span>
                <span className="font-medium">Yield Uplift: <b className="text-emerald-500">+{calcs.yieldUplift.toFixed(0)}%</b></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 py-2">
            <h2 className="text-base font-black text-foreground w-full md:w-auto uppercase tracking-wide">Deployment Tactics</h2>
            <div className="flex-1 w-full relative">
               <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-border" />
            </div>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className={cn(glass.input, "h-9 w-full md:w-48 !py-0 !text-xs")}
            >
              {Object.keys(CROP_DATA).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { scenario: schemeA, setScenario: setSchemeA, stats: statsA, accent: 'var(--primary)', accentClass: 'accent-primary', muted: 'text-primary' },
              { scenario: schemeB, setScenario: setSchemeB, stats: statsB, accent: 'var(--honey)', accentClass: 'accent-honey', muted: 'text-honey' },
            ].map(({ scenario, setScenario, stats, accent, accentClass, muted }) => (
              <div key={scenario.label} className={cn(glass.section, 'p-6 space-y-6')}>
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-foreground">{scenario.label}</h3>
                    <p className={cn(glass.microLabel, "mt-1")}>
                      {selectedCrop || activeApiary?.forage_type || 'Crop not set'}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/20">
                    <Target className="h-5 w-5" style={{ color: accent }} />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className={glass.microLabel}>Hives per acre</label>
                      <span className={cn('text-xl font-black tabular-nums', muted)}>{scenario.hivesPerAcre.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.1"
                      value={scenario.hivesPerAcre}
                      onChange={(event) => setScenario((current) => ({ ...current, hivesPerAcre: Number(event.target.value) }))}
                      className={cn("w-full h-2 cursor-pointer", accentClass)}
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className={glass.microLabel}>Frames per hive</label>
                      <span className={cn('text-xl font-black tabular-nums', muted)}>{scenario.framesPerHive}</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="18"
                      step="1"
                      value={scenario.framesPerHive}
                      onChange={(event) =>
                        setScenario((current) => {
                          const frames = Number(event.target.value);
                          return { ...current, framesPerHive: frames, colonyGrade: gradeFromFrames(frames) };
                        })
                      }
                      className={cn("w-full h-2 cursor-pointer", accentClass)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
                  <CircularGauge value={stats.successProb} max={100} label="Success" accent={accent} />
                  <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center">
                    <p className={glass.microLabel}>Effective FPA</p>
                    <p className="mt-2 text-xl font-black text-foreground">{stats.fpa.toFixed(1)}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center">
                    <p className={glass.microLabel}>Yield loss</p>
                    <p className="mt-2 text-xl font-black text-red-500">-{stats.yieldLoss.toFixed(1)}%</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCommitPlan(scenario, stats)}
                  disabled={isSaving}
                  className={cn(glass.btnPrimary, 'h-11 w-full rounded-xl')}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  <span>Save {scenario.label.toLowerCase()}</span>
                </button>
              </div>
            ))}
          </div>

          <div className={cn(glass.card, 'p-6')}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="space-y-2">
                <p className={glass.microLabel}>AI Generated Strategy</p>
                <h3 className="text-2xl font-black tracking-tight text-foreground">
                  Need a full <span className="text-primary">deployment plan?</span>
                </h3>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Synthesize your acreage, selected florage, expected yields, and precision math into a comprehensive ROI mitigation report using BeeYield AI.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:min-w-[320px]">
                <button
                  onClick={runAI}
                  disabled={aiLoading}
                  className={cn(glass.btnPrimary, "h-12 text-sm shadow-md")}
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {aiText ? "Regenerate Strategy" : "Generate AI Plan"}
                </button>
              </div>
            </div>

            {aiText && (
               <div className="p-6 rounded-2xl border border-honey/30 bg-card/60 shadow-inner overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
                   <Target className="w-24 h-24 text-honey" />
                 </div>
                 <div className="relative z-10 prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-headings:text-honey max-w-none">
                   <MarkdownRenderer content={aiText} />
                 </div>
               </div>
            )}
            
          </div>
        </div>
      </motion.div>
    </MasterContainer>
  );
};

export default PollinationEngine;
