import React from 'react';
import {
  Calculator,
  CheckCircle2,
  Hexagon,
  MapPin,
  Scale,
  Target,
  Trees,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useApiaries, useHives } from '@/hooks/useHives';
import { beeyieldService, CropPollinationRequirement } from '@/services/beeyieldService';
import {
  BeeYieldBadge,
  BeeYieldPageHeader,
  BeeYieldPageShell,
} from '@/components/beeyield/BeeYieldUI';
import { ColonyGrade } from '@/lib/apicultureModels';
import { dashboardPollinationCropNames } from '@/data/beePollinationData';
import { resolveTargetFpa } from '@/lib/pollinationInsights';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';

const framesByGrade: Record<ColonyGrade, number> = {
  'Grade A': 12,
  'Grade B': 8,
  'Grade C': 6,
};

const EMPTY_APIARIES: any[] = [];
const EMPTY_HIVES: any[] = [];

interface HpaOptimizerProps {
  embedded?: boolean;
}

const HpaOptimizer: React.FC<HpaOptimizerProps> = ({ embedded = false }) => {
  const [selectedApiaryId, setSelectedApiaryId] = React.useState('');
  const [acreage, setAcreage] = React.useState(1);
  const [treesPerAcre, setTreesPerAcre] = React.useState(110);
  const [treeDensity, setTreeDensity] = React.useState<'low' | 'medium' | 'high'>('medium');
  const [colonyGrade, setColonyGrade] = React.useState<ColonyGrade>('Grade A');
  const [variety, setVariety] = React.useState('');
  const [cropRequirements, setCropRequirements] = React.useState<CropPollinationRequirement[]>([]);

  const apiariesQuery = useApiaries();
  const apiaries = apiariesQuery.data ?? EMPTY_APIARIES;
  const activeApiary = React.useMemo(
    () => apiaries.find((apiary) => apiary.id === selectedApiaryId) || null,
    [apiaries, selectedApiaryId],
  );
  const hivesQuery = useHives(selectedApiaryId || undefined);
  const hives = hivesQuery.data ?? EMPTY_HIVES;

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

  React.useEffect(() => {
    if (!activeApiary) return;

    setAcreage(Math.max(1, Number(activeApiary.size_acres || 0) || 1));
    setVariety((current) => current || String(activeApiary.forage_type || cropRequirements[0]?.crop_name || dashboardPollinationCropNames[0]));
  }, [activeApiary, cropRequirements]);

  const selectedRequirement = React.useMemo(() => {
    const normalized = String(variety || '').trim().toLowerCase();
    return cropRequirements.find((crop) => String(crop.crop_name || '').trim().toLowerCase() === normalized) || null;
  }, [cropRequirements, variety]);

  const densityMultiplier = treeDensity === 'high' ? 1.15 : treeDensity === 'low' ? 0.9 : 1;
  const adjustedTreesPerAcre = Math.round(treesPerAcre * densityMultiplier);
  const targetFpa = resolveTargetFpa(variety || activeApiary?.forage_type, cropRequirements) || 8;
  const framesPerHive = selectedRequirement?.target_frames_per_hive || framesByGrade[colonyGrade];
  const requiredHives = Math.max(1, Math.ceil((acreage * targetFpa) / Math.max(1, framesPerHive)));
  const recommendedHpa = requiredHives / Math.max(1, acreage);
  const currentHpa = hives.length / Math.max(1, acreage);
  const attainment = Math.max(0, Math.min(100, (hives.length / requiredHives) * 100));
  const shortfall = Math.max(0, requiredHives - hives.length);

  return (
    <BeeYieldPageShell embedded={embedded}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
        <BeeYieldPageHeader
          icon={Target}
          label="Performance Planning"
          title={
            <>
              Hive Density <span className="text-primary">Planner</span>
            </>
          }
          subtitle="Right-size hive density with live apiary acreage and crop pollination requirements."
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
              <BeeYieldBadge variant="success">{hives.length} live hives</BeeYieldBadge>
            </div>
          }
        />

        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
          <div className={cn(glass.section, 'p-6 space-y-6')}>
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-primary/5">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-foreground">Field Inputs</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">Apiary-driven defaults</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                    Orchard size
                  </label>
                  <input
                    type="number"
                    value={acreage}
                    onChange={(event) => setAcreage(Math.max(1, Number(event.target.value) || 1))}
                    className={cn(glass.input, 'h-11 w-full bg-card')}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                    Trees per acre
                  </label>
                  <input
                    type="number"
                    value={treesPerAcre}
                    onChange={(event) => setTreesPerAcre(Math.max(1, Number(event.target.value) || 1))}
                    className={cn(glass.input, 'h-11 w-full bg-card')}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                    Orchard density
                  </label>
                  <div className="flex gap-2 rounded-2xl border border-border bg-muted/30 p-1">
                    {(['low', 'medium', 'high'] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setTreeDensity(option)}
                        className={cn(
                          'flex-1 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all',
                          treeDensity === option ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-primary/10',
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-border pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Trees className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-foreground">Crop Profile</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">Live crop requirements</p>
                </div>
              </div>

              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {(cropRequirements.length > 0 ? cropRequirements : []).map((crop) => (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => setVariety(crop.crop_name)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-[11px] font-black transition-all',
                      variety === crop.crop_name
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary/30',
                    )}
                  >
                    <span>{crop.crop_name}</span>
                    {variety === crop.crop_name && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className={cn(glass.card, 'p-6 md:p-8')}>
            <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Density <span className="text-primary">Results</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {activeApiary?.name || 'Select an apiary'} using {variety || 'crop profile pending'}
                </p>
              </div>

              <div className="flex rounded-2xl border border-border bg-muted/30 p-1">
                {(['Grade A', 'Grade B', 'Grade C'] as ColonyGrade[]).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setColonyGrade(grade)}
                    className={cn(
                      'rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all',
                      colonyGrade === grade ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-primary/10',
                    )}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: 'Target FPA',
                  value: targetFpa.toFixed(1),
                  hint: 'Frames per acre',
                  icon: Scale,
                  accent: 'text-primary',
                },
                {
                  label: 'Required Hives',
                  value: requiredHives.toString(),
                  hint: `${recommendedHpa.toFixed(2)} hives / acre`,
                  icon: Hexagon,
                  accent: 'text-foreground',
                },
                {
                  label: 'Current Coverage',
                  value: `${attainment.toFixed(0)}%`,
                  hint: `${shortfall} hive shortfall`,
                  icon: Target,
                  accent: shortfall > 0 ? 'text-destructive' : 'text-primary',
                },
              ].map((card) => (
                <div key={card.label} className={cn(glass.card, 'p-6 bg-muted/5')}>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
                      <card.icon className={cn('h-5 w-5', card.accent)} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">{card.label}</span>
                  </div>
                  <div className="mt-5">
                    <p className={cn('text-4xl font-black tracking-tight', card.accent)}>{card.value}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{card.hint}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-muted/20 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Current deployment</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-foreground">{currentHpa.toFixed(2)}</p>
                <p className="mt-2 text-xs text-muted-foreground">Hives per acre with the current apiary inventory.</p>
              </div>
              <div className="rounded-2xl border border-border bg-primary/5 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/70">Planning note</p>
                <p className="mt-3 text-sm leading-relaxed font-medium">
                  {shortfall > 0
                    ? `Add ${shortfall} more hive${shortfall === 1 ? '' : 's'} or increase frame strength to hit the target pollination density.`
                    : 'Current hive inventory is already meeting or exceeding the target density for this crop profile.'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <BeeYieldBadge>{adjustedTreesPerAcre} adjusted trees / acre</BeeYieldBadge>
              <BeeYieldBadge variant="success">{framesPerHive} target frames / hive</BeeYieldBadge>
              <BeeYieldBadge variant={shortfall > 0 ? 'warning' : 'success'}>
                {shortfall > 0 ? `${shortfall} hives needed` : 'Target met'}
              </BeeYieldBadge>
            </div>
          </div>
        </div>
      </motion.div>
    </BeeYieldPageShell>
  );
};

export default HpaOptimizer;
