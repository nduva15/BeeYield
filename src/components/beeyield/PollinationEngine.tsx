import React from 'react';
import {
  Binary,
  Calculator,
  ChevronDown,
  ChevronUp,
  Hexagon,
  Leaf,
  Loader2,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { getDefaultFlorageLibrary, type FloragePlant } from '@/lib/florage';
import MarkdownRenderer from '@/components/beeyield/lovable_ai/MarkdownRenderer';

const FLORAGE: FloragePlant[] = getDefaultFlorageLibrary();

// ─── Florage-weighted precision pollination model ────────────────────────
//
// Required hives (precision) =
//   (acreage_m² / single_hive_effective_area) × florageDeficitFactor × cropDemandFactor
//
// where:
//   single_hive_effective_area = π × radius² × florageMultiplier × activityMultiplier
//   florageMultiplier         = avg(nectar+pollen score)/10  (limits effective foraging)
//   activityMultiplier        = expectedBpm / 100  (compared to baseline 100 bees/min)
//   cropDemandFactor          = crop-specific multiplier (almonds 1.5, blueberries 1.3, …)
//
// Contract baseline (industry stocking density) shown alongside for comparison.

const FLORAGE_CROP_DATA: Record<string, { radius: number; contractPerAc: number; demand: number; setBoost: number }> = {
  Almonds:     { radius: 800,  contractPerAc: 2.0, demand: 1.5, setBoost: 0.85 },
  Apples:      { radius: 600,  contractPerAc: 1.0, demand: 1.2, setBoost: 0.70 },
  Blueberries: { radius: 500,  contractPerAc: 3.0, demand: 1.3, setBoost: 0.75 },
  Avocado:     { radius: 700,  contractPerAc: 2.5, demand: 1.2, setBoost: 0.65 },
  Sunflower:   { radius: 1200, contractPerAc: 1.0, demand: 0.8, setBoost: 0.60 },
  Coffee:      { radius: 600,  contractPerAc: 1.5, demand: 0.7, setBoost: 0.30 },
  Mango:       { radius: 700,  contractPerAc: 1.5, demand: 1.0, setBoost: 0.55 },
  Macadamia:   { radius: 800,  contractPerAc: 4.0, demand: 1.4, setBoost: 0.80 },
  Sidr:        { radius: 1500, contractPerAc: 0.5, demand: 0.5, setBoost: 0.20 },
  Watermelon:  { radius: 700,  contractPerAc: 1.0, demand: 1.1, setBoost: 0.90 },
  Strawberry:  { radius: 400,  contractPerAc: 1.5, demand: 1.0, setBoost: 0.30 },
  Canola:      { radius: 1500, contractPerAc: 0.5, demand: 0.6, setBoost: 0.25 },
};

// ─── Component types ─────────────────────────────────────────────────────

interface PollinationEngineProps {
  onTabChange?: (tab: string, message?: string, action?: string) => void;
  /** When true the component is visible (modal/overlay mode). */
  isOpen?: boolean;
  /** Close callback for overlay mode. */
  onClose?: () => void;
  /** When true renders inline for dashboard embedding (no overlay shell). */
  embedded?: boolean;
}

interface Scenario {
  hivesPerAcre: number;
  framesPerHive: number;
  label: string;
  colonyGrade: 'A' | 'B' | 'C';
}

// ─── Constants ───────────────────────────────────────────────────────────

const EMPTY_APIARIES: any[] = [];
const EMPTY_APIARY_HIVES: any[] = [];

// ─── Helpers ─────────────────────────────────────────────────────────────

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

// Small field helper components
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>{children}</div>
);

const KPI = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className={`p-3 rounded-lg border ${highlight ? 'border-honey/40 bg-honey/5' : 'border-border bg-card'}`}>
    <div className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</div>
    <div className={`font-display text-xl font-bold ${highlight ? 'text-honey' : 'text-foreground'}`}>{value}</div>
  </div>
);

const inputCls = 'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors';

// ─── Main Component ──────────────────────────────────────────────────────

const PollinationEngine: React.FC<PollinationEngineProps> = ({
  onTabChange,
  isOpen,
  onClose,
  embedded,
}) => {
  // ── Mode: "external" = typed fields (no apiary), "apiary" = database-driven
  const [mode, setMode] = React.useState<'apiary' | 'external'>('apiary');

  // ── Apiary-driven state
  const [selectedApiaryId, setSelectedApiaryId] = React.useState('');
  const [selectedCrop, setSelectedCrop] = React.useState('');
  const [cropRequirements, setCropRequirements] = React.useState<CropPollinationRequirement[]>([]);
  const [acreage, setAcreage] = React.useState(1);
  const [weatherFactor, setWeatherFactor] = React.useState(0.9);
  const [bloomIntensity, setBloomIntensity] = React.useState(1);
  const [isSaving, setIsSaving] = React.useState(false);

  // ── Florage-weighted model state (from PollinationPlanning)
  const [florageCrop, setFlorageCrop] = React.useState('Almonds');
  const [externalAcres, setExternalAcres] = React.useState(40);
  const [externalRegion, setExternalRegion] = React.useState('');
  const [expectedBpm, setExpectedBpm] = React.useState(100);
  const [selectedFlorage, setSelectedFlorage] = React.useState<string[]>(['Clover (White)', 'Phacelia']);

  // ── AI generation state
  const [aiText, setAiText] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);

  // ── Collapsible sections
  const [showFlorage, setShowFlorage] = React.useState(true);
  const [showScenarios, setShowScenarios] = React.useState(true);
  const [showAI, setShowAI] = React.useState(true);

  // ── Scenario state
  const [schemeA, setSchemeA] = React.useState<Scenario>({
    hivesPerAcre: 1,
    framesPerHive: 8,
    label: 'Current field plan',
    colonyGrade: 'B',
  });
  const [schemeB, setSchemeB] = React.useState<Scenario>({
    hivesPerAcre: 1.5,
    framesPerHive: 10,
    label: 'Recommended plan',
    colonyGrade: 'A',
  });

  // ── Hooks
  const apiariesQuery = useApiaries();
  const apiaries = apiariesQuery.data ?? EMPTY_APIARIES;
  const activeApiary = React.useMemo(
    () => apiaries.find((apiary) => apiary.id === selectedApiaryId) || null,
    [apiaries, selectedApiaryId],
  );

  const hivesQuery = useHives(selectedApiaryId || undefined);
  const apiaryHives = hivesQuery.data ?? EMPTY_APIARY_HIVES;
  const flightPotentialQuery = useFlightPotential(selectedApiaryId || undefined);
  const flightPotential = flightPotentialQuery.data;

  // ── Effective values (merge apiary & external modes)
  const effectiveAcres = mode === 'apiary' ? acreage : externalAcres;
  const effectiveCrop = mode === 'apiary' ? (selectedCrop || activeApiary?.forage_type || 'Almonds') : florageCrop;
  const effectiveRegion = mode === 'apiary' ? (activeApiary?.name || 'Selected Apiary') : (externalRegion || 'Not specified');

  // ── Florage-weighted calculations
  const florageData = React.useMemo(() => {
    const picks = FLORAGE.filter((f) => selectedFlorage.includes(f.name));
    const avgScore = picks.length ? picks.reduce((s, p) => s + (p.nectar + p.pollen), 0) / (picks.length * 2) : 5;
    return { picks, avgScore, multiplier: avgScore / 10 };
  }, [selectedFlorage]);

  const florageCropData = FLORAGE_CROP_DATA[effectiveCrop] || FLORAGE_CROP_DATA['Almonds'];

  const florageCalcs = React.useMemo(() => {
    const acreM2 = effectiveAcres * 4046.86;
    const florageMult = Math.max(0.4, florageData.multiplier);
    const activityMult = Math.max(0.3, expectedBpm / 100);
    const singleHiveArea = Math.PI * florageCropData.radius * florageCropData.radius * florageMult * activityMult;
    const precisionHives = Math.ceil((acreM2 / singleHiveArea) * florageCropData.demand);
    const contractHives = Math.ceil(effectiveAcres * florageCropData.contractPerAc);
    const expectedSet = Math.min(0.95, florageCropData.setBoost * florageMult * activityMult);
    const yieldUplift = (expectedSet - 0.4) * 100;
    return { acreM2, singleHiveArea, precisionHives, contractHives, expectedSet, yieldUplift, florageMult, activityMult };
  }, [effectiveAcres, florageCropData, florageData, expectedBpm]);

  // ── Apiary-driven effects
  React.useEffect(() => {
    if (!selectedApiaryId && apiaries.length > 0) {
      setSelectedApiaryId(apiaries[0].id);
    }
  }, [apiaries, selectedApiaryId]);

  React.useEffect(() => {
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
    return () => { mounted = false; };
  }, []);

  const selectedCropRequirement = React.useMemo(() => {
    const normalized = String(selectedCrop || '').trim().toLowerCase();
    return cropRequirements.find((crop) => String(crop.crop_name || '').trim().toLowerCase() === normalized) || null;
  }, [cropRequirements, selectedCrop]);

  const targetFpa = React.useMemo(
    () => resolveTargetFpa(selectedCrop || activeApiary?.forage_type, cropRequirements),
    [activeApiary?.forage_type, cropRequirements, selectedCrop],
  );

  React.useEffect(() => {
    if (!activeApiary || mode === 'external') return;

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

    setAcreage(resolvedAcreage);
    setWeatherFactor(Number(baselineWeather.toFixed(2)));
    setSelectedCrop((current) => {
      if (current) return current;
      if (activeApiary.forage_type) return String(activeApiary.forage_type);
      return selectedCropRequirement?.crop_name || cropRequirements[0]?.crop_name || dashboardPollinationCropNames[0];
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
  }, [activeApiary, apiaryHives, cropRequirements, flightPotential?.score, selectedCropRequirement, targetFpa, mode]);

  // ── Scenario math
  const calculateStats = React.useCallback(
    (scenario: Scenario) => {
      const currentFpa = calculateCurrentFPA(scenario.hivesPerAcre, scenario.framesPerHive, 1);
      const successProb = calculateSuccessProbability(currentFpa, targetFpa, weatherFactor, bloomIntensity);
      const yieldLoss = estimateYieldLoss(successProb);
      const costPerAcre = scenario.hivesPerAcre * 180;
      return { fpa: currentFpa, successProb, yieldLoss, costPerAcre };
    },
    [bloomIntensity, targetFpa, weatherFactor],
  );

  const statsA = calculateStats(schemeA);
  const statsB = calculateStats(schemeB);
  const betterPlan = statsA.successProb > statsB.successProb ? schemeA : schemeB;

  // ── Save plan
  const handleCommitPlan = async (scenario: Scenario, stats: ReturnType<typeof calculateStats>) => {
    setIsSaving(true);
    try {
      const { error } = await beeyieldService.savePollinationDeployment({
        field_name: activeApiary?.name || `Pollination plan ${new Date().toLocaleDateString()}`,
        crop_type: effectiveCrop,
        total_acres: effectiveAcres,
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
          florage_multiplier: florageCalcs.florageMult,
          activity_multiplier: florageCalcs.activityMult,
          precision_hives: florageCalcs.precisionHives,
        },
      });

      if (error) throw error;
      toast.success('Pollination plan saved.');
      onTabChange?.('precision-pollination-home', 'Plan saved to pollination overview.', 'view-registry');
    } catch (error) {
      console.error(error);
      toast.error('Could not save the plan.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── AI generation
  const runAI = async () => {
    setAiLoading(true);
    setAiText('');
    const prompt = `As Beeyield AI, write a **Florage-Weighted Pollination Plan** for **${effectiveCrop}** on **${effectiveAcres} acres** in **${effectiveRegion}**.

Computed inputs:
- Field area: ${florageCalcs.acreM2.toFixed(0)} m² (${effectiveAcres} ac)
- Crop foraging radius: ${florageCropData.radius} m
- Florage diversity multiplier: ${florageCalcs.florageMult.toFixed(2)} (selected: ${selectedFlorage.join(', ') || 'none'})
- Activity multiplier: ${florageCalcs.activityMult.toFixed(2)} (expected ${expectedBpm} bees/min)
- Effective area per hive: ${(florageCalcs.singleHiveArea / 10000).toFixed(2)} ha
- **Precision hive requirement: ${florageCalcs.precisionHives} hives**
- Contract baseline (industry standard): ${florageCalcs.contractHives} hives
- Expected fruit/seed set: ${(florageCalcs.expectedSet * 100).toFixed(0)}%
- Yield uplift vs unpollinated baseline: ${florageCalcs.yieldUplift.toFixed(0)}%

Required sections:
1. **Hive Deployment Schedule** — when to place, in what configuration (perimeter vs grid vs strip).
2. **Florage Enhancement Plan** — 3 specific cover-crop or hedgerow species to plant for season-long support.
3. **Risk Mitigation** — 3 risks (weather, pesticides, pest pressure) with mitigations.
4. **ROI Estimate** — projected yield uplift in tons or kg per acre, marketable value vs hive rental cost.`;

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], promptVariant: 'bloom_flight' }),
      });
      if (!resp.ok || !resp.body) { toast.error('AI generation failed'); setAiLoading(false); return; }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let acc = '';
      let done = false;
      while (!done) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const j = line.slice(6).trim();
          if (j === '[DONE]') { done = true; break; }
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) { acc += c; setAiText(acc); }
          } catch { /* partial JSON */ }
        }
      }
    } catch {
      toast.error('AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleFlorage = (name: string) => {
    setSelectedFlorage((cur) => cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name]);
  };

  const loading = apiariesQuery.isLoading || hivesQuery.isLoading;

  // ── If used as modal and not open, return null
  if (typeof isOpen === 'boolean' && !isOpen) return null;

  // ── Render
  const content = (
    <div className="space-y-6 relative z-10 pb-20">

      {/* ── Mode Toggle ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/30 border border-border w-fit">
        <button
          onClick={() => setMode('apiary')}
          className={cn(
            'px-4 py-2 rounded-lg text-xs font-bold transition-all',
            mode === 'apiary' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <MapPin className="w-3.5 h-3.5 inline-block mr-1.5" /> From Apiary
        </button>
        <button
          onClick={() => setMode('external')}
          className={cn(
            'px-4 py-2 rounded-lg text-xs font-bold transition-all',
            mode === 'external' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Calculator className="w-3.5 h-3.5 inline-block mr-1.5" /> External Field
        </button>
      </div>

      {/* ── Input Fields ────────────────────────────────────────────── */}
      {mode === 'external' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-border bg-muted/30">
          <Field label="Crop">
            <select value={florageCrop} onChange={(e) => setFlorageCrop(e.target.value)} className={inputCls}>
              {Object.keys(FLORAGE_CROP_DATA).map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Region / Location">
            <input value={externalRegion} onChange={(e) => setExternalRegion(e.target.value)} className={inputCls} placeholder="e.g. Kibwezi, Kenya" />
          </Field>
          <Field label="Field area (acres)">
            <input type="number" value={externalAcres} onChange={(e) => setExternalAcres(+e.target.value)} className={inputCls} />
          </Field>
          <Field label={`Expected colony activity: ${expectedBpm} bees/min`}>
            <input type="range" min={20} max={300} value={expectedBpm} onChange={(e) => setExpectedBpm(+e.target.value)} className="w-full accent-honey" />
          </Field>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          ].map((control) => (
            <div key={control.label} className={cn(glass.section, 'p-4')}>
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
                className={cn('w-full h-2 cursor-pointer rounded-full', control.accent)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Activity BPM slider (apiary mode) ───────────────────────── */}
      {mode === 'apiary' && (
        <div className={cn(glass.section, 'p-4')}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-4 w-4 text-honey" />
              <span className={glass.microLabel}>Expected colony activity: {expectedBpm} bees/min</span>
            </div>
            <span className="text-base font-black text-honey">{florageCalcs.activityMult.toFixed(2)}×</span>
          </div>
          <input type="range" min={20} max={300} value={expectedBpm} onChange={(e) => setExpectedBpm(+e.target.value)} className="w-full h-2 cursor-pointer accent-honey" />
        </div>
      )}

      {/* ── Florage Diversity Selector ───────────────────────────────── */}
      <div className={cn(glass.section, 'p-5')}>
        <button
          onClick={() => setShowFlorage(!showFlorage)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">Surrounding Florage</h3>
            <span className="text-[10px] text-muted-foreground ml-1">({selectedFlorage.length} selected · {florageCalcs.florageMult.toFixed(2)}× multiplier)</span>
          </div>
          {showFlorage ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {showFlorage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-xs text-muted-foreground mt-3 mb-3">Select all melliferous plants present within 1 km of the field</p>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto custom-scroll">
                {FLORAGE.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => toggleFlorage(f.name)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[11px] border transition-all',
                      selectedFlorage.includes(f.name)
                        ? 'bg-honey/20 border-honey text-honey font-semibold'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {f.name} <span className="opacity-60">({((f.nectar + f.pollen) / 2).toFixed(0)})</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Florage-Weighted KPIs ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Precision hives" value={`${florageCalcs.precisionHives}`} highlight />
        <KPI label="Contract baseline" value={`${florageCalcs.contractHives}`} />
        <KPI label="Expected set" value={`${(florageCalcs.expectedSet * 100).toFixed(0)}%`} />
        <KPI label="Yield uplift" value={`+${florageCalcs.yieldUplift.toFixed(0)}%`} />
        <KPI label="Per-hive coverage" value={`${(florageCalcs.singleHiveArea / 10000).toFixed(2)} ha`} />
        <KPI label="Crop radius" value={`${florageCropData.radius} m`} />
        <KPI label="Florage mult" value={`${florageCalcs.florageMult.toFixed(2)}×`} />
        <KPI label="Activity mult" value={`${florageCalcs.activityMult.toFixed(2)}×`} />
      </div>

      {/* ── Scenario Comparison (Scheme A vs B) ─────────────────────── */}
      {mode === 'apiary' && (
        <div className={cn(glass.section, 'p-0 overflow-hidden')}>
          <button
            onClick={() => setShowScenarios(!showScenarios)}
            className="flex items-center justify-between w-full p-5"
          >
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Scenario Comparison</h3>
              <span className="text-[10px] text-muted-foreground ml-1">Scheme A vs B · FPA analysis</span>
            </div>
            {showScenarios ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showScenarios && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5 pt-0">
                  {[
                    { scenario: schemeA, setScenario: setSchemeA, stats: statsA, accent: 'var(--primary)', accentClass: 'accent-primary', muted: 'text-primary' },
                    { scenario: schemeB, setScenario: setSchemeB, stats: statsB, accent: 'var(--honey)', accentClass: 'accent-honey', muted: 'text-honey' },
                  ].map(({ scenario, setScenario, stats, accent, accentClass, muted }) => (
                    <div key={scenario.label} className={cn(glass.section, 'p-6 space-y-6')}>
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                          <h3 className="text-sm font-black tracking-tight text-foreground">{scenario.label}</h3>
                          <p className={cn(glass.microLabel, 'mt-1')}>
                            {effectiveCrop}
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
                            className={cn('w-full h-2 cursor-pointer', accentClass)}
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
                            className={cn('w-full h-2 cursor-pointer', accentClass)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
                        <CircularGauge value={stats.successProb} max={100} label="Success" accent={accent} />
                        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center">
                          <p className={glass.microLabel}>FPA</p>
                          <p className="mt-2 text-2xl font-black text-foreground">{stats.fpa.toFixed(1)}</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center">
                          <p className={glass.microLabel}>Yield loss</p>
                          <p className="mt-2 text-2xl font-black text-red-500">-{stats.yieldLoss.toFixed(1)}%</p>
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

                {/* Plan comparison summary */}
                <div className={cn(glass.card, 'p-6 mx-5 mb-5')}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <p className={glass.microLabel}>Plan comparison</p>
                      <h3 className="text-2xl font-black tracking-tight text-foreground">
                        Best projected result: <span className="text-primary">{betterPlan.label}</span>
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-xl">
                        Target FPA is {targetFpa.toFixed(1)}. Current apiary inventory is {apiaryHives.length} hives across{' '}
                        {effectiveAcres} acres.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 lg:min-w-[320px]">
                      <div className="rounded-2xl border border-border bg-muted/10 p-4">
                        <p className={glass.microLabel}>Yield delta</p>
                        <p className="mt-2 text-2xl font-black text-foreground">
                          {Math.abs(statsA.yieldLoss - statsB.yieldLoss).toFixed(1)}%
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/10 p-4">
                        <p className={glass.microLabel}>Cost delta</p>
                        <p className="mt-2 text-2xl font-black text-foreground">
                          ${Math.abs(statsA.costPerAcre - statsB.costPerAcre).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className={glass.badge}>{effectiveCrop}</span>
                    <span className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20')}>{activeApiary?.name || 'No apiary selected'}</span>
                    <span className={cn(glass.badge, flightPotential?.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20')}>
                      {flightPotential?.status || 'Flight potential pending'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── AI Deployment Plan ──────────────────────────────────────── */}
      <div className={cn(glass.section, 'p-5')}>
        <button
          onClick={() => setShowAI(!showAI)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-honey" />
            <h3 className="text-sm font-bold text-foreground">AI Deployment Plan</h3>
            <span className="text-[10px] text-muted-foreground ml-1">Generate a full deployment strategy with ROI estimates</span>
          </div>
          {showAI ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4">
                <button
                  onClick={runAI}
                  disabled={aiLoading}
                  className="w-full px-4 py-2.5 rounded-lg bg-gradient-amber text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate AI deployment plan
                </button>

                {aiText && (
                  <div className="p-5 rounded-xl border border-honey/30 bg-card mt-4">
                    <MarkdownRenderer content={aiText} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Linked tools footer ────────────────────────────────────── */}
      <div className="p-3 rounded-lg border border-honey/30 bg-honey/5 text-xs">
        <b className="text-honey">Linked tools:</b> Pulls florage scores from <b>Florage Database</b>; activity from <b>Activity Counter</b>/<b>Forecaster</b>; feeds hive plan into <b>Hive Placement Map</b> and <b>Precision Drilldown</b>.
      </div>
    </div>
  );

  // ── Wrapper: embedded dashboard page vs modal overlay
  if (embedded || (!isOpen && typeof isOpen !== 'boolean')) {
    // Dashboard page mode (embedded or no isOpen prop = default dashboard rendering)
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={glass.page}>
        <PageHeader
          icon={Binary}
          label="Pollination Planning"
          title={<>Pollination <span className="text-primary">Planning</span></>}
          subtitle="Florage-weighted precision model with scenario planning, AI deployment strategy, and plan comparison."
          actions={
            mode === 'apiary' ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={selectedApiaryId}
                  onChange={(event) => setSelectedApiaryId(event.target.value)}
                  className={cn(glass.input, 'h-10 min-w-[220px]')}
                  aria-label="Select apiary"
                  title="Select apiary"
                >
                  {apiaries.map((apiary) => (
                    <option key={apiary.id} value={apiary.id}>
                      {apiary.name}
                    </option>
                  ))}
                </select>
                <span className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20')}>
                  {loading ? 'Loading...' : `${apiaryHives.length} live hives`}
                </span>
              </div>
            ) : (
              <span className={cn(glass.badge, 'bg-amber-500/10 text-amber-600 border-amber-500/20')}>
                External Field Mode
              </span>
            )
          }
        />
        {content}
      </motion.div>
    );
  }

  // Modal overlay mode (BeeYield AI tools)
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Pollination Planning</h1>
              <p className="text-xs text-muted-foreground">Florage-weighted precision model · scenario comparison · AI deployment plan</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === 'apiary' && (
          <div className="flex items-center gap-3 mb-6">
            <select
              value={selectedApiaryId}
              onChange={(event) => setSelectedApiaryId(event.target.value)}
              className={cn(inputCls, 'max-w-xs')}
              aria-label="Select apiary"
              title="Select apiary"
            >
              {apiaries.map((apiary) => (
                <option key={apiary.id} value={apiary.id}>
                  {apiary.name}
                </option>
              ))}
            </select>
            <span className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20')}>
              {loading ? 'Loading...' : `${apiaryHives.length} live hives`}
            </span>
          </div>
        )}

        {content}
      </div>
    </div>
  );
};

export default PollinationEngine;
