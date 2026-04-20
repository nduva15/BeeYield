import React from 'react';
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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { useApiaries, useHives } from '@/hooks/useHives';
import { useFlightPotential } from '@/hooks/useFlightPotential';
import { beeyieldService, CropPollinationRequirement } from '@/services/beeyieldService';
import {
  BeeYieldBadge,
  BeeYieldPageHeader,
  BeeYieldPageShell,
} from '@/components/beeyield/BeeYieldUI';
import {
  calculateCurrentFPA,
  calculateSuccessProbability,
  estimateYieldLoss,
} from '@/lib/apicultureModels';
import { dashboardPollinationCropNames } from '@/data/beePollinationData';
import { cn } from '@/lib/utils';
import { resolveTargetFpa } from '@/lib/pollinationInsights';
import { glass } from './GlassTheme';

interface PollinationEngineProps {
  onTabChange: (tab: string, message?: string, action?: string) => void;
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
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontSize="20" fill="#1A1A1A" className="font-black">
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

const PollinationEngine: React.FC<PollinationEngineProps> = ({ onTabChange }) => {
  const [selectedApiaryId, setSelectedApiaryId] = React.useState('');
  const [selectedCrop, setSelectedCrop] = React.useState('');
  const [cropRequirements, setCropRequirements] = React.useState<CropPollinationRequirement[]>([]);
  const [acreage, setAcreage] = React.useState(1);
  const [weatherFactor, setWeatherFactor] = React.useState(0.9);
  const [bloomIntensity, setBloomIntensity] = React.useState(1);
  const [isSaving, setIsSaving] = React.useState(false);

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
    return () => {
      mounted = false;
    };
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
  }, [activeApiary, apiaryHives, cropRequirements, flightPotential?.score, selectedCropRequirement, targetFpa]);

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

  const handleCommitPlan = async (scenario: Scenario, stats: ReturnType<typeof calculateStats>) => {
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
        },
      });

      if (error) throw error;

      toast.success('Pollination plan saved.');
      onTabChange('precision-pollination-home', 'Plan saved to pollination overview.', 'view-registry');
    } catch (error) {
      console.error(error);
      toast.error('Could not save the plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const loading = apiariesQuery.isLoading || hivesQuery.isLoading;

  return (
    <BeeYieldPageShell>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
        <BeeYieldPageHeader
          icon={Binary}
          label="Pollination Planning"
          title={
            <>
              Pollination <span className="text-[#1B9157]">Planning</span>
            </>
          }
          subtitle="Scenario planning grounded in the selected apiary's acreage, hive inventory, and flight potential."
          actions={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={selectedApiaryId}
                onChange={(event) => setSelectedApiaryId(event.target.value)}
                className={cn(glass.input, 'h-10 min-w-[220px] bg-muted/')}
                aria-label="Select apiary"
                title="Select apiary"
              >
                {apiaries.map((apiary) => (
                  <option key={apiary.id} value={apiary.id}>
                    {apiary.name}
                  </option>
                ))}
              </select>
              <BeeYieldBadge variant="success">
                {loading ? 'Loading...' : `${apiaryHives.length} live hives`}
              </BeeYieldBadge>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: 'Acreage',
              value: acreage,
              accent: 'accent-[#1B9157]',
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
              accent: 'accent-[#1B9157]',
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
              accent: 'accent-[#F4D03F]',
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
                  <control.icon className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em]">{control.label}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { scenario: schemeA, setScenario: setSchemeA, stats: statsA, accent: '#1B9157', muted: 'text-[#1B9157]' },
            { scenario: schemeB, setScenario: setSchemeB, stats: statsB, accent: '#F4D03F', muted: 'text-[#F4D03F]' },
          ].map(({ scenario, setScenario, stats, accent, muted }) => (
            <div key={scenario.label} className={cn(glass.section, 'p-6 space-y-6')}>
              <div className="flex items-center justify-between border-b border-border/ pb-4">
                <div>
                  <h3 className="text-sm font-black tracking-tight text-foreground">{scenario.label}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
                    {selectedCrop || activeApiary?.forage_type || 'Crop not set'}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/ bg-muted/">
                  <Target className="h-5 w-5" style={{ color: accent }} />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Hives per acre</label>
                    <span className={cn('text-xl font-black tabular-nums', muted)}>{scenario.hivesPerAcre.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={scenario.hivesPerAcre}
                    onChange={(event) => setScenario((current) => ({ ...current, hivesPerAcre: Number(event.target.value) }))}
                    className="w-full h-2 cursor-pointer accent-[#1B9157]"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Frames per hive</label>
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
                    className="w-full h-2 cursor-pointer accent-[#F4D03F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-border/ pt-4">
                <CircularGauge value={stats.successProb} max={100} label="Success" accent={accent} />
                <div className="rounded-2xl border border-border/ bg-muted/ p-4 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">FPA</p>
                  <p className="mt-2 text-2xl font-black text-foreground">{stats.fpa.toFixed(1)}</p>
                </div>
                <div className="rounded-2xl border border-border/ bg-muted/ p-4 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Yield loss</p>
                  <p className="mt-2 text-2xl font-black text-red-600">-{stats.yieldLoss.toFixed(1)}%</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCommitPlan(scenario, stats)}
                disabled={isSaving}
                className={cn(glass.btnPrimary, 'h-11 w-full rounded-2xl')}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                <span>Save {scenario.label.toLowerCase()}</span>
              </button>
            </div>
          ))}
        </div>

        <div className={cn(glass.card, 'p-6')}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Plan comparison</p>
              <h3 className="text-2xl font-black tracking-tight text-foreground">
                Best projected result: <span className="text-[#1B9157]">{betterPlan.label}</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Target FPA is {targetFpa.toFixed(1)}. Current apiary inventory is {apiaryHives.length} hives across{' '}
                {acreage} acres.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:min-w-[320px]">
              <div className="rounded-2xl border border-border/ bg-muted/ p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Yield delta</p>
                <p className="mt-2 text-2xl font-black text-foreground">
                  {Math.abs(statsA.yieldLoss - statsB.yieldLoss).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-2xl border border-border/ bg-muted/ p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Cost delta</p>
                <p className="mt-2 text-2xl font-black text-foreground">
                  ${Math.abs(statsA.costPerAcre - statsB.costPerAcre).toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <BeeYieldBadge>{selectedCrop || 'Crop not set'}</BeeYieldBadge>
            <BeeYieldBadge variant="success">{activeApiary?.name || 'No apiary selected'}</BeeYieldBadge>
            <BeeYieldBadge variant={flightPotential?.status === 'optimal' ? 'success' : 'warning'}>
              {flightPotential?.status || 'Flight potential pending'}
            </BeeYieldBadge>
          </div>
        </div>
      </motion.div>
    </BeeYieldPageShell>
  );
};

export default PollinationEngine;

