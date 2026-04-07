import React from 'react';
import {
  AlertTriangle,
  Beaker,
  BookOpen,
  Brain,
  Calculator,
  Flower2,
  Gauge,
  GaugeCircle,
  Package,
  Scale,
  ShieldCheck,
  Sprout,
  Syringe,
  Thermometer,
  Truck,
  Wind,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { glass } from '@/components/beeyield/GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { cn } from '@/lib/utils';
import { useBeekeepingMath } from '@/hooks/useBeekeepingMath';
import { calculatePollinationMetrics } from '@/lib/pollinationCalculations';

type FeedRatio = '1:1' | '2:1';
type HiveStrength = 'Modest' | 'Medium' | 'Strong';
type ForageType = 'Poor' | 'Average' | 'Rich';
type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';
type Method = 'Formic acid' | 'Oxalic acid' | 'Thymol';

const TOOL_COUNT = 18;
const homeCard = 'flex h-full flex-col rounded-[20px] border border-[#F4D03F]/12 bg-white/85 p-4 shadow-[0_10px_28px_rgba(143,104,18,0.08)]';
const sectionTone = 'border-b border-[#F4D03F]/20 bg-[linear-gradient(135deg,rgba(255,249,240,0.96),rgba(249,247,242,0.98))]';
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const sectionMeta = [
  { id: 'feeding', label: 'Feeding', note: '3 tools', icon: Beaker },
  { id: 'treatment', label: 'Treatment / prophylaxis', note: '2 tools', icon: Syringe },
  { id: 'equipment', label: 'Equipment / apiary', note: '3 tools', icon: Package },
  { id: 'economics', label: 'Economics', note: '2 tools', icon: GaugeCircle },
  { id: 'mini', label: 'Mini calculators (educational)', note: '4 tools', icon: Brain },
  { id: 'quizzes', label: 'Quizzes and tips', note: '4 tools', icon: BookOpen },
] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">{label}</span>
      {children}
    </label>
  );
}

function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type="number"
      className={cn(glass.input, 'h-10 w-full rounded-xl border-[#F4D03F]/15 bg-[#FFFDF7] px-3.5 text-[13px] font-bold text-[#1A1A1A]', props.className)}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(glass.select, 'h-10 w-full rounded-xl border-[#F4D03F]/15 bg-[#FFFDF7] px-3.5 text-[13px] font-bold text-[#1A1A1A]', props.className)}
    />
  );
}

function StatTile({ label, value, accent = 'text-[#1A1A1A]' }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl border border-[#F4D03F]/12 bg-[#FFF9F0] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">{label}</p>
      <p className={cn('mt-1.5 text-[1.15rem] font-black tracking-tight', accent)}>{value}</p>
    </div>
  );
}

function StatusBox({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone: 'green' | 'amber' | 'red';
}) {
  const toneClass =
    tone === 'green'
      ? 'border-[#cde7cf] bg-[#eefaf0] text-[#166534]'
      : tone === 'amber'
        ? 'border-[#f4df9b] bg-[#fff7de] text-[#a16207]'
        : 'border-[#f3c4be] bg-[#fff1ef] text-[#b45309]';

  return (
    <div className={cn('rounded-xl border p-3.5', toneClass)}>
      <p className="text-[9px] font-black uppercase tracking-[0.16em]">{title}</p>
      <p className="mt-1.5 text-[13px] font-semibold leading-relaxed">{body}</p>
    </div>
  );
}

function ToolCard({
  icon: Icon,
  title,
  description,
  children,
  badge,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: string;
  className?: string;
}) {
  return (
    <article className={cn(homeCard, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-[1rem] font-black tracking-tight text-[#1A1A1A]">{title}</h3>
          <p className="text-[12px] leading-relaxed text-gray-500">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {badge ? (
            <Badge className="rounded-full border border-[#F4D03F]/20 bg-[#F4D03F]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#8a6a00]">
              {badge}
            </Badge>
          ) : null}
          <div className="rounded-xl border border-[#F4D03F]/15 bg-[#F4D03F]/10 p-2.5 text-[#8a6a00]">
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3.5">{children}</div>
    </article>
  );
}

function SectionBlock({
  id,
  title,
  subtitle,
  badge,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn(glass.section, 'scroll-mt-24 overflow-hidden')}>
      <div className={cn(sectionTone, 'px-5 py-4 md:px-6')}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {Icon ? (
                <div className="rounded-xl border border-[#F4D03F]/15 bg-white/80 p-2 text-[#8a6a00]">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              ) : null}
              {badge ? (
                <Badge className="rounded-full border border-[#F4D03F]/20 bg-white/80 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#8a6a00]">
                  {badge}
                </Badge>
              ) : null}
            </div>
            <h2 className="text-[1.25rem] font-black tracking-tight text-[#1A1A1A]">{title}</h2>
          </div>
        </div>
        <p className="mt-1 text-[12px] text-gray-500">{subtitle}</p>
      </div>
      <div className="grid gap-4 p-5 md:p-6 lg:grid-cols-3">{children}</div>
    </section>
  );
}

const BeeCalculatorSuite = () => {
  const math = useBeekeepingMath();
  const [activeSection, setActiveSection] = React.useState('feeding');

  const [syrupVolume, setSyrupVolume] = React.useState(18);
  const [feedRatio, setFeedRatio] = React.useState<FeedRatio>('1:1');
  const [fondantColonies, setFondantColonies] = React.useState(24);
  const [fondantKgPerColony, setFondantKgPerColony] = React.useState(1.5);
  const [alreadyFedKg, setAlreadyFedKg] = React.useState(6);
  const [winterHiveType, setWinterHiveType] = React.useState<'Nucleus' | 'Standard' | 'Double brood'>('Standard');
  const [currentStoresKg, setCurrentStoresKg] = React.useState(12);
  const [targetStoresKg, setTargetStoresKg] = React.useState(18);

  const [treatmentMethod, setTreatmentMethod] = React.useState<Method>('Formic acid');
  const [dayTemperature, setDayTemperature] = React.useState(20);
  const [broodPresent, setBroodPresent] = React.useState(true);
  const [mitesFound, setMitesFound] = React.useState(8);
  const [sampleSize, setSampleSize] = React.useState(300);
  const [treatmentMonth, setTreatmentMonth] = React.useState<'Apr' | 'Jul' | 'Sep' | 'Nov'>('Apr');

  const [frameType, setFrameType] = React.useState<'Langstroth deep' | 'Langstroth super' | 'Warre'>('Langstroth deep');
  const [boxesToFit, setBoxesToFit] = React.useState(12);
  const [sheetsAvailable, setSheetsAvailable] = React.useState(20);
  const [sheetWeightG, setSheetWeightG] = React.useState(82);
  const [honeyKg, setHoneyKg] = React.useState(90);
  const [jarSizeMl, setJarSizeMl] = React.useState(500);
  const [reservePct, setReservePct] = React.useState(5);
  const [cartonSize, setCartonSize] = React.useState(12);
  const [totalColonies, setTotalColonies] = React.useState(50);
  const [replacementRate, setReplacementRate] = React.useState(10);
  const [splitsPlanned, setSplitsPlanned] = React.useState(12);

  const [economicAcres, setEconomicAcres] = React.useState(180);
  const [economicHives, setEconomicHives] = React.useState(24);
  const [economicFrames, setEconomicFrames] = React.useState(9);
  const [targetFpa, setTargetFpa] = React.useState(10);
  const [contractPrice, setContractPrice] = React.useState(185);
  const [cropValuePerAcre, setCropValuePerAcre] = React.useState(1450);
  const [bloomIntensity, setBloomIntensity] = React.useState(0.92);
  const [forageCondition, setForageCondition] = React.useState(0.88);
  const [weatherRisk, setWeatherRisk] = React.useState(0.22);
  const [hivesPerPallet, setHivesPerPallet] = React.useState(4);
  const [deploymentSpeed, setDeploymentSpeed] = React.useState(18);
  const [laneTurns, setLaneTurns] = React.useState(12);
  const [siteSpacingMeters, setSiteSpacingMeters] = React.useState(220);

  const [flightDistance, setFlightDistance] = React.useState(1.5);
  const [flightForageType, setFlightForageType] = React.useState<ForageType>('Rich');
  const [flightStrength, setFlightStrength] = React.useState<HiveStrength>('Medium');
  const [seasonFlights, setSeasonFlights] = React.useState<Season>('Summer');
  const [nectarDistance, setNectarDistance] = React.useState(1.2);
  const [nectarFlow, setNectarFlow] = React.useState<'Light' | 'Steady' | 'Heavy'>('Heavy');
  const [apiaryHives, setApiaryHives] = React.useState(20);
  const [forageAreaHa, setForageAreaHa] = React.useState(60);
  const [overloadSeason, setOverloadSeason] = React.useState<Season>('Summer');
  const [honeyFrameDistance, setHoneyFrameDistance] = React.useState(1.5);
  const [honeyFrameForage, setHoneyFrameForage] = React.useState<ForageType>('Rich');
  const [honeyFrameStrength, setHoneyFrameStrength] = React.useState<HiveStrength>('Medium');

  const [reactionStyle, setReactionStyle] = React.useState<'Wait and observe' | 'Treat early'>('Wait and observe');
  const [planningStyle, setPlanningStyle] = React.useState<'Adaptive' | 'Season plan'>('Adaptive');
  const [riskAttitude, setRiskAttitude] = React.useState<'Avoid chemistry' | 'Use the fastest tool'>('Avoid chemistry');
  const [stopTemp, setStopTemp] = React.useState(13);
  const [stopWind, setStopWind] = React.useState(4);
  const [stopSeason, setStopSeason] = React.useState<Season>('Spring');
  const [outsideTemp, setOutsideTemp] = React.useState(12);
  const [outsideSeason, setOutsideSeason] = React.useState<Season>('Spring');
  const [outsideStrength, setOutsideStrength] = React.useState<HiveStrength>('Medium');
  const [inspectTemp, setInspectTemp] = React.useState(20);
  const [inspectWind, setInspectWind] = React.useState(3);
  const [inspectFlow, setInspectFlow] = React.useState<'Dearth' | 'Normal flow' | 'Strong flow'>('Normal flow');

  const syrupResult = React.useMemo(() => math.calculateSyrup(syrupVolume, feedRatio), [feedRatio, math, syrupVolume]);
  const winterResult = React.useMemo(() => math.calculateWinterDeficit(currentStoresKg, targetStoresKg), [currentStoresKg, math, targetStoresKg]);
  const fondantNeededKg = React.useMemo(() => Number((fondantColonies * fondantKgPerColony).toFixed(1)), [fondantColonies, fondantKgPerColony]);
  const fondantToBuyKg = React.useMemo(() => Number(Math.max(0, fondantNeededKg - alreadyFedKg).toFixed(1)), [alreadyFedKg, fondantNeededKg]);

  const methodRules: Record<Method, { min: number; max: number; message: string }> = {
    'Formic acid': { min: 10, max: 29, message: 'Useful during brood cycles when daytime warmth stays moderate.' },
    'Oxalic acid': { min: 4, max: 28, message: 'Most efficient with minimal brood and stable dry weather.' },
    Thymol: { min: 15, max: 30, message: 'Best when temperatures remain consistently warm.' },
  };
  const selectedMethodRule = methodRules[treatmentMethod];
  const treatmentTone =
    dayTemperature < selectedMethodRule.min || dayTemperature > selectedMethodRule.max
      ? 'red'
      : treatmentMethod === 'Oxalic acid' && broodPresent
        ? 'amber'
        : 'green';
  const treatmentMessage =
    treatmentTone === 'green'
      ? `OK to schedule. ${selectedMethodRule.message}`
      : treatmentTone === 'amber'
        ? 'Use with caution. Oxalic acid works best when brood is minimal.'
        : `Hold treatment. Keep ${treatmentMethod.toLowerCase()} inside ${selectedMethodRule.min}-${selectedMethodRule.max} C.`;

  const varroaResult = React.useMemo(() => math.getVarroaInfestation(mitesFound, sampleSize), [math, mitesFound, sampleSize]);
  const thresholdBands = { Apr: { low: 2, medium: 10 }, Jul: { low: 3, medium: 15 }, Sep: { low: 4, medium: 12 }, Nov: { low: 1, medium: 8 } };
  const currentVarroaBand = thresholdBands[treatmentMonth];
  const varroaDecision =
    varroaResult.percentage <= currentVarroaBand.low
      ? { label: 'Monitor only', tone: 'green' as const }
      : varroaResult.percentage <= currentVarroaBand.medium
        ? { label: 'Plan treatment', tone: 'amber' as const }
        : { label: 'Treat now', tone: 'red' as const };

  const frameMap = { 'Langstroth deep': 10, 'Langstroth super': 10, Warre: 8 } as const;
  const totalFramesToBuild = boxesToFit * frameMap[frameType];
  const sheetsToBuy = Math.max(0, totalFramesToBuild - sheetsAvailable);
  const waxMassKg = Number(((sheetsToBuy * sheetWeightG) / 1000).toFixed(1));
  const jarCounts = React.useMemo(() => math.calculateHarvestSupplies(honeyKg, jarSizeMl), [honeyKg, jarSizeMl, math]);
  const labelsNeeded = Math.ceil(jarCounts.jars * (1 + reservePct / 100));
  const cartonsNeeded = Math.ceil(jarCounts.jars / Math.max(cartonSize, 1));
  const queensToReplace = Math.ceil(totalColonies * (replacementRate / 100));
  const totalQueensNeeded = queensToReplace + splitsPlanned;

  const economicMetrics = React.useMemo(
    () =>
      calculatePollinationMetrics({
        totalAcres: economicAcres,
        targetFpa,
        averageFramesPerHive: economicFrames,
        bloomIntensity,
        forageCondition,
        weatherRisk,
        hives: Array.from({ length: economicHives }).map(() => ({ frameCount: economicFrames, isStrong: economicFrames >= 9, isLarge: economicFrames >= 10 })),
      }),
    [bloomIntensity, economicAcres, economicFrames, economicHives, forageCondition, targetFpa, weatherRisk],
  );
  const projectedPollinationRevenue = React.useMemo(() => Number((economicAcres * cropValuePerAcre * (economicMetrics.projectedYieldLiftPercent / 100)).toFixed(0)), [cropValuePerAcre, economicAcres, economicMetrics.projectedYieldLiftPercent]);
  const deploymentCost = React.useMemo(() => Number((economicHives * contractPrice).toFixed(0)), [contractPrice, economicHives]);
  const projectedRoi = React.useMemo(() => (deploymentCost ? Number((((projectedPollinationRevenue - deploymentCost) / deploymentCost) * 100).toFixed(1)) : 0), [deploymentCost, projectedPollinationRevenue]);
  const palletsRequired = React.useMemo(() => Math.max(1, Math.ceil(economicMetrics.hivesRequired / Math.max(hivesPerPallet, 1))), [economicMetrics.hivesRequired, hivesPerPallet]);
  const routeDistanceKm = React.useMemo(() => Number(((palletsRequired * laneTurns * siteSpacingMeters) / 1000).toFixed(1)), [laneTurns, palletsRequired, siteSpacingMeters]);
  const fieldHours = React.useMemo(() => Number((routeDistanceKm / Math.max(deploymentSpeed, 1)).toFixed(1)), [deploymentSpeed, routeDistanceKm]);
  const overlapRisk = React.useMemo(() => Math.max(0, Math.round((siteSpacingMeters < 180 ? 28 : siteSpacingMeters < 220 ? 16 : 8) + (economicMetrics.saturationRisk === 'high' ? 12 : 0))), [economicMetrics.saturationRisk, siteSpacingMeters]);

  const flightProfitability = React.useMemo(() => {
    const forageFactor = { Poor: 0.62, Average: 0.82, Rich: 1 }[flightForageType];
    const strengthFactor = { Modest: 0.84, Medium: 1, Strong: 1.12 }[flightStrength];
    const distanceFactor = clamp(1 - Math.max(flightDistance - 0.5, 0) * 0.22, 0.35, 1);
    const score = Number((forageFactor * strengthFactor * distanceFactor).toFixed(2));
    const label = score >= 0.85 ? 'Energetically profitable' : score >= 0.65 ? 'Borderline' : 'Too costly';
    return { score, label };
  }, [flightDistance, flightForageType, flightStrength]);
  const flightsPerDay = React.useMemo(() => clamp(Math.round({ Spring: 10, Summer: 12, Autumn: 7, Winter: 3 }[seasonFlights] + { Light: -2, Steady: 0, Heavy: 2 }[nectarFlow] - nectarDistance * 1.5), 1, 18), [nectarDistance, nectarFlow, seasonFlights]);
  const overloadAssessment = React.useMemo(() => {
    const carryingCapacity = Math.max(1, forageAreaHa * { Spring: 1.8, Summer: 1.4, Autumn: 1, Winter: 0.5 }[overloadSeason]);
    const pressure = Number((apiaryHives / carryingCapacity).toFixed(2));
    const label = pressure > 1.2 ? 'Competition' : pressure > 0.9 ? 'Tight' : 'Comfortable';
    return { pressure, label };
  }, [apiaryHives, forageAreaHa, overloadSeason]);
  const honeyFrameEstimate = React.useMemo(() => `${Math.max(1, clamp(Math.round({ Poor: 4, Average: 7, Rich: 10 }[honeyFrameForage] + { Modest: -1, Medium: 0, Strong: 2 }[honeyFrameStrength] - honeyFrameDistance * 1.2), 1, 14) - 1)}-${Math.min(15, clamp(Math.round({ Poor: 4, Average: 7, Rich: 10 }[honeyFrameForage] + { Modest: -1, Medium: 0, Strong: 2 }[honeyFrameStrength] - honeyFrameDistance * 1.2), 1, 14) + 1)} frames`, [honeyFrameDistance, honeyFrameForage, honeyFrameStrength]);

  const beekeeperStyle = React.useMemo(() => (reactionStyle === 'Treat early' && planningStyle === 'Season plan' ? 'Preventive planner' : reactionStyle === 'Wait and observe' && riskAttitude === 'Avoid chemistry' ? 'Low-intervention observer' : 'Adaptive field manager'), [planningStyle, reactionStyle, riskAttitude]);
  const stopDecision = React.useMemo(() => {
    const floor = { Spring: 13, Summer: 12, Autumn: 15, Winter: 16 }[stopSeason];
    if (stopTemp < floor || stopWind > 6) return { label: 'Flights paused', tone: 'red' as const };
    if (stopTemp < floor + 2 || stopWind > 4) return { label: 'Reduced traffic', tone: 'amber' as const };
    return { label: 'Flights active', tone: 'green' as const };
  }, [stopSeason, stopTemp, stopWind]);
  const heatingDecision = React.useMemo(() => {
    if (outsideTemp < 12 && outsideStrength !== 'Strong') return { label: 'Mostly heating', tone: 'amber' as const };
    if (outsideSeason === 'Winter' && outsideTemp < 16) return { label: 'Heat-conserving cluster', tone: 'amber' as const };
    return { label: 'Likely working', tone: 'green' as const };
  }, [outsideSeason, outsideStrength, outsideTemp]);
  const inspectionDecision = React.useMemo(() => {
    if (inspectTemp < 16 || inspectWind > 5) return { label: 'Skip opening today', tone: 'red' as const };
    if (inspectFlow === 'Dearth') return { label: 'Open briefly only', tone: 'amber' as const };
    return { label: 'Good inspection window', tone: 'green' as const };
  }, [inspectFlow, inspectTemp, inspectWind]);

  const jumpToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  React.useEffect(() => {
    const sections = sectionMeta
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target?.id) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.2, 0.35, 0.5, 0.7],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    setTargetStoresKg(winterHiveType === 'Nucleus' ? 8 : winterHiveType === 'Double brood' ? 25 : 18);
  }, [winterHiveType]);

  return (
    <BeeYieldPageShell className="space-y-6">
      <BeeYieldPageHeader
        icon={Calculator}
        label="Beekeeping calculators"
        title={<>Beekeeping <span className="text-[#F4D03F]">calculators</span></>}
        subtitle="Click through feeding, treatments, equipment, and field heuristics without leaving the BeeYield home experience."
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full border border-[#F4D03F]/20 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8a6a00]">{TOOL_COUNT} tools</Badge>
            <Badge className="rounded-full border border-[#1B9157]/15 bg-[#eefaf0] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#166534]">Home UI preserved</Badge>
          </div>
        }
      />

      <section className={cn(glass.section, 'overflow-hidden')}>
        <div className={cn(sectionTone, 'px-5 py-5 md:px-6')}>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F4D03F]/20 bg-white/80 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#8a6a00]">Intelligent hives · calculators</div>
              <div>
                <h2 className="text-[2rem] font-black tracking-tight text-[#1A1A1A] md:text-[2.15rem]">Beekeeping calculators</h2>
                <p className="mt-2 max-w-2xl text-[13px] text-gray-500">Results are indicative. Use them as operational checks before inspections, feeding, transport, or treatment decisions.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-[#F4D03F]/12 bg-white/80 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">Tools</p>
                <p className="mt-1.5 text-[1.7rem] font-black tracking-tight text-[#1A1A1A]">{TOOL_COUNT}</p>
              </div>
              <div className="rounded-[24px] border border-[#F4D03F]/12 bg-white/80 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">Tip</p>
                <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-[#1A1A1A]">Move section by section like a seasonal checklist.</p>
              </div>
              <div className="rounded-[24px] border border-[#F4D03F]/12 bg-white/80 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">Winter gap</p>
                <p className="mt-1.5 text-[1.35rem] font-black tracking-tight text-[#8a6a00]">{winterResult.deficitKg} kg</p>
                <p className="mt-1 text-[11px] font-semibold text-gray-500">Current shortfall to winter stores.</p>
              </div>
              <div className="rounded-[24px] border border-[#F4D03F]/12 bg-white/80 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">Varroa call</p>
                <p className={cn('mt-1.5 text-[1.35rem] font-black tracking-tight', varroaDecision.tone === 'green' ? 'text-[#166534]' : varroaDecision.tone === 'amber' ? 'text-[#a16207]' : 'text-[#b45309]')}>
                  {varroaDecision.label}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-gray-500">{varroaResult.percentage}% infestation in current sample.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#F4D03F]/10 bg-[#F9F7F2] px-4 py-4 md:px-5">
          <div className="flex flex-wrap gap-2">
          {sectionMeta.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => jumpToSection(section.id)}
              className={cn('rounded-full border px-3.5 py-2 text-left transition-all', activeSection === section.id ? 'border-[#F4D03F]/40 bg-[#FFF4CC] text-[#1A1A1A]' : 'border-[#F4D03F]/15 bg-white text-gray-600 hover:border-[#F4D03F]/30 hover:bg-[#FFF9F0]')}
            >
              <div className="flex items-center gap-2 text-[10px] font-black tracking-tight">
                <section.icon className="h-3.5 w-3.5" />
                <span>{section.label}</span>
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.12em] opacity-60">{section.note}</div>
            </button>
          ))}
        </div>
        </div>
      </section>

      <SectionBlock id="feeding" title="Feeding" subtitle="Plan winter stores and syrup quantities before the next feeding round." badge="3 tools" icon={Beaker}>
        <ToolCard icon={Beaker} title="Sugar syrup calculator" description="Quick ratio mix for field batches.">
          <Field label="Syrup ratio">
            <div className="grid grid-cols-2 gap-2">
              {(['1:1', '2:1'] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setFeedRatio(ratio)}
                  className={cn('h-11 rounded-2xl border text-sm font-black transition-all', feedRatio === ratio ? 'border-[#1B9157]/25 bg-[#eefaf0] text-[#166534]' : 'border-[#F4D03F]/12 bg-[#FFFDF7] text-gray-500')}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </Field>
          <Field label="How much syrup do you want to make">
            <NumberInput value={syrupVolume} min={1} step={1} onChange={(event) => setSyrupVolume(Number(event.target.value))} />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <StatTile label="Sugar" value={`${syrupResult.sugarKg} kg`} accent="text-[#166534]" />
            <StatTile label="Water" value={`${syrupResult.waterL} L`} accent="text-sky-600" />
          </div>
          <StatTile label="Final volume" value={`${syrupVolume} L`} />
        </ToolCard>

        <ToolCard icon={Sprout} title="Fondant / invert dough per colony" description="Estimate pre-winter feed reserves for multiple colonies.">
          <Field label="Number of colonies">
            <NumberInput value={fondantColonies} min={1} step={1} onChange={(event) => setFondantColonies(Number(event.target.value))} />
          </Field>
          <Field label="Kg per colony">
            <NumberInput value={fondantKgPerColony} min={0.5} step={0.1} onChange={(event) => setFondantKgPerColony(Number(event.target.value))} />
          </Field>
          <Field label="Already fed kg">
            <NumberInput value={alreadyFedKg} min={0} step={0.5} onChange={(event) => setAlreadyFedKg(Number(event.target.value))} />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <StatTile label="Total needed" value={`${fondantNeededKg} kg`} />
            <StatTile label="To buy / prepare" value={`${fondantToBuyKg} kg`} accent="text-[#8a6a00]" />
          </div>
        </ToolCard>

        <ToolCard icon={Scale} title="Feeding shortfall to winter" description="Estimate missing stores and conversion to syrup.">
          <Field label="Hive / brood type">
            <SelectInput value={winterHiveType} onChange={(event) => setWinterHiveType(event.target.value as 'Nucleus' | 'Standard' | 'Double brood')}>
              <option>Nucleus</option>
              <option>Standard</option>
              <option>Double brood</option>
            </SelectInput>
          </Field>
          <Field label="Current stores kg">
            <NumberInput value={currentStoresKg} min={0} step={1} onChange={(event) => setCurrentStoresKg(Number(event.target.value))} />
          </Field>
          <Field label="Target stores kg">
            <NumberInput value={targetStoresKg} min={0} step={1} onChange={(event) => setTargetStoresKg(Number(event.target.value))} />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <StatTile label="Missing kg" value={`${winterResult.deficitKg} kg`} accent="text-[#8a6a00]" />
            <StatTile label="Estimated syrup volume" value={`${winterResult.syrupNeededL} L`} accent="text-sky-600" />
          </div>
        </ToolCard>
      </SectionBlock>

      <SectionBlock id="treatment" title="Treatment / prophylaxis" subtitle="Check weather windows and interpret mite pressure before you treat." badge="2 tools" icon={Syringe}>
        <ToolCard icon={Syringe} title="Treatment timing & weather window" description="Simple weather gate for common treatment methods.">
          <Field label="Method">
            <SelectInput value={treatmentMethod} onChange={(event) => setTreatmentMethod(event.target.value as Method)}>
              <option>Formic acid</option>
              <option>Oxalic acid</option>
              <option>Thymol</option>
            </SelectInput>
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Day temperature">
              <NumberInput value={dayTemperature} min={0} max={40} step={1} onChange={(event) => setDayTemperature(Number(event.target.value))} />
            </Field>
            <Field label="Is there brood?">
              <div className="grid grid-cols-2 gap-2">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setBroodPresent(value)}
                    className={cn('h-11 rounded-2xl border text-sm font-black transition-all', broodPresent === value ? 'border-[#1B9157]/25 bg-[#eefaf0] text-[#166534]' : 'border-[#F4D03F]/12 bg-[#FFFDF7] text-gray-500')}
                  >
                    {value ? 'Yes' : 'No'}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <StatusBox title={treatmentTone === 'green' ? 'OK' : treatmentTone === 'amber' ? 'Caution' : 'Hold'} body={treatmentMessage} tone={treatmentTone} />
        </ToolCard>

        <ToolCard icon={ShieldCheck} title="Varroa drop calculator (interpretation)" description="Convert wash counts into a practical action band." className="xl:col-span-2">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Mites found">
                  <NumberInput value={mitesFound} min={0} step={1} onChange={(event) => setMitesFound(Number(event.target.value))} />
                </Field>
                <Field label="Sample size">
                  <NumberInput value={sampleSize} min={100} step={50} onChange={(event) => setSampleSize(Number(event.target.value))} />
                </Field>
                <Field label="Month">
                  <SelectInput value={treatmentMonth} onChange={(event) => setTreatmentMonth(event.target.value as 'Apr' | 'Jul' | 'Sep' | 'Nov')}>
                    <option value="Apr">Apr</option>
                    <option value="Jul">Jul</option>
                    <option value="Sep">Sep</option>
                    <option value="Nov">Nov</option>
                  </SelectInput>
                </Field>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <StatTile label="Infestation" value={`${varroaResult.percentage}%`} accent={varroaDecision.tone === 'green' ? 'text-[#166534]' : varroaDecision.tone === 'amber' ? 'text-[#a16207]' : 'text-[#b45309]'} />
                <StatTile label="Low up to" value={`${currentVarroaBand.low}%`} />
                <StatTile label="Medium up to" value={`${currentVarroaBand.medium}%`} />
              </div>
            </div>

            <div className="space-y-4">
              <StatusBox title={varroaDecision.label} body={`This ${treatmentMonth} reading sits ${varroaDecision.tone === 'green' ? 'below' : varroaDecision.tone === 'amber' ? 'inside' : 'above'} the working threshold band for the season.`} tone={varroaDecision.tone} />
              <div className="rounded-2xl border border-[#F4D03F]/12 bg-[#FFF9F0] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Configurable thresholds</p>
                <div className="mt-4 grid gap-2 text-sm">
                  {[
                    ['Spring (Apr-May)', '2', '10'],
                    ['Summer (Jun-Aug)', '3', '15'],
                    ['Autumn (Sep-Nov)', '4', '12'],
                    ['Winter (Dec-Feb)', '1', '8'],
                  ].map(([period, low, medium]) => (
                    <div key={period} className="grid grid-cols-[minmax(0,1fr)_80px_100px] items-center gap-2 rounded-xl bg-white px-3 py-2">
                      <span className="font-semibold text-[#1A1A1A]">{period}</span>
                      <span className="text-center font-black text-[#166534]">{low}%</span>
                      <span className="text-center font-black text-[#a16207]">{medium}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ToolCard>
      </SectionBlock>

      <SectionBlock id="equipment" title="Equipment / apiary" subtitle="Plan purchases, packaging, and replacement queens before the next yard move." badge="3 tools" icon={Package}>
        <ToolCard icon={Package} title="Wax foundation calculator" description="Count the sheets and wax weight needed for upcoming frame work.">
          <Field label="Frame type">
            <SelectInput value={frameType} onChange={(event) => setFrameType(event.target.value as 'Langstroth deep' | 'Langstroth super' | 'Warre')}>
              <option>Langstroth deep</option>
              <option>Langstroth super</option>
              <option>Warre</option>
            </SelectInput>
          </Field>
          <Field label="Boxes to fit">
            <NumberInput value={boxesToFit} min={1} step={1} onChange={(event) => setBoxesToFit(Number(event.target.value))} />
          </Field>
          <Field label="Sheets available">
            <NumberInput value={sheetsAvailable} min={0} step={1} onChange={(event) => setSheetsAvailable(Number(event.target.value))} />
          </Field>
          <Field label="Sheet weight g">
            <NumberInput value={sheetWeightG} min={10} step={1} onChange={(event) => setSheetWeightG(Number(event.target.value))} />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <StatTile label="Sheets to buy" value={sheetsToBuy} />
            <StatTile label="Estimated wax mass" value={`${waxMassKg} kg`} accent="text-[#8a6a00]" />
          </div>
        </ToolCard>

        <ToolCard icon={BookOpen} title="Jar & label calculator" description="Convert bulk honey into jars, labels, and cartons.">
          <Field label="Honey amount kg">
            <NumberInput value={honeyKg} min={1} step={1} onChange={(event) => setHoneyKg(Number(event.target.value))} />
          </Field>
          <Field label="Jar size ml">
            <NumberInput value={jarSizeMl} min={125} step={125} onChange={(event) => setJarSizeMl(Number(event.target.value))} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Reserve %">
              <NumberInput value={reservePct} min={0} step={1} onChange={(event) => setReservePct(Number(event.target.value))} />
            </Field>
            <Field label="Carton size">
              <NumberInput value={cartonSize} min={1} step={1} onChange={(event) => setCartonSize(Number(event.target.value))} />
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <StatTile label="Jar count" value={jarCounts.jars} />
            <StatTile label="Label count" value={labelsNeeded} accent="text-[#166534]" />
            <StatTile label="Cartons" value={cartonsNeeded} accent="text-sky-600" />
          </div>
        </ToolCard>

        <ToolCard icon={Flower2} title="The Queen's Substitute / splits" description="Estimate queens needed for replacement and planned splits.">
          <Field label="Number of colonies">
            <NumberInput value={totalColonies} min={1} step={1} onChange={(event) => setTotalColonies(Number(event.target.value))} />
          </Field>
          <Field label="Percent needing replacement">
            <NumberInput value={replacementRate} min={0} max={100} step={1} onChange={(event) => setReplacementRate(Number(event.target.value))} />
          </Field>
          <Field label="Splits planned">
            <NumberInput value={splitsPlanned} min={0} step={1} onChange={(event) => setSplitsPlanned(Number(event.target.value))} />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <StatTile label="Queens to replace" value={queensToReplace} />
            <StatTile label="Total queens needed" value={totalQueensNeeded} accent="text-[#8a6a00]" />
          </div>
        </ToolCard>
      </SectionBlock>

      <SectionBlock id="economics" title="Economics" subtitle="Keep the forecasting pieces from the old suite, but inside the home dashboard visual language." badge="2 tools" icon={GaugeCircle}>
        <ToolCard icon={GaugeCircle} title="Pollination contract optimizer" description="Blend coverage, bloom, and value into a quick contract check." badge="ROI" className="xl:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Orchard size ac">
              <NumberInput value={economicAcres} min={10} step={5} onChange={(event) => setEconomicAcres(Number(event.target.value))} />
            </Field>
            <Field label="Colonies deployed">
              <NumberInput value={economicHives} min={1} step={1} onChange={(event) => setEconomicHives(Number(event.target.value))} />
            </Field>
            <Field label="Average frames per hive">
              <NumberInput value={economicFrames} min={5} max={16} step={1} onChange={(event) => setEconomicFrames(Number(event.target.value))} />
            </Field>
            <Field label="Target FPA">
              <NumberInput value={targetFpa} min={4} max={16} step={1} onChange={(event) => setTargetFpa(Number(event.target.value))} />
            </Field>
            <Field label="Contract price / hive">
              <NumberInput value={contractPrice} min={50} step={5} onChange={(event) => setContractPrice(Number(event.target.value))} />
            </Field>
            <Field label="Crop value / acre">
              <NumberInput value={cropValuePerAcre} min={100} step={50} onChange={(event) => setCropValuePerAcre(Number(event.target.value))} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Bloom intensity">
              <NumberInput value={bloomIntensity} min={0.2} max={1.5} step={0.05} onChange={(event) => setBloomIntensity(Number(event.target.value))} />
            </Field>
            <Field label="Forage condition">
              <NumberInput value={forageCondition} min={0.2} max={1.2} step={0.05} onChange={(event) => setForageCondition(Number(event.target.value))} />
            </Field>
            <Field label="Weather risk">
              <NumberInput value={weatherRisk} min={0} max={0.8} step={0.01} onChange={(event) => setWeatherRisk(Number(event.target.value))} />
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <StatTile label="Effective FPA" value={economicMetrics.effectiveFPA} accent="text-[#166534]" />
            <StatTile label="Readiness score" value={`${economicMetrics.readinessScore}%`} accent="text-sky-600" />
            <StatTile label="Coverage gap" value={`${economicMetrics.coverageGapHives} hives`} accent="text-[#8a6a00]" />
            <StatTile label="Projected upside" value={`$${projectedPollinationRevenue.toLocaleString()}`} />
          </div>
        </ToolCard>

        <ToolCard icon={Truck} title="Deployment calculus" description="Translate hive need into pallets, travel, and field hours." badge={`ROI ${projectedRoi}%`} className="xl:col-span-1">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Hives per pallet">
              <NumberInput value={hivesPerPallet} min={1} max={8} step={1} onChange={(event) => setHivesPerPallet(Number(event.target.value))} />
            </Field>
            <Field label="Field speed km/h">
              <NumberInput value={deploymentSpeed} min={4} max={40} step={1} onChange={(event) => setDeploymentSpeed(Number(event.target.value))} />
            </Field>
            <Field label="Turn count per block">
              <NumberInput value={laneTurns} min={1} max={30} step={1} onChange={(event) => setLaneTurns(Number(event.target.value))} />
            </Field>
            <Field label="Spacing between drop points m">
              <NumberInput value={siteSpacingMeters} min={80} max={400} step={10} onChange={(event) => setSiteSpacingMeters(Number(event.target.value))} />
            </Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <StatTile label="Pallets required" value={palletsRequired} accent="text-[#166534]" />
            <StatTile label="Route distance" value={`${routeDistanceKm} km`} accent="text-sky-600" />
            <StatTile label="Field hours" value={`${fieldHours} h`} accent="text-[#8a6a00]" />
            <StatTile label="Deployment cost" value={`$${deploymentCost.toLocaleString()}`} />
          </div>
          <StatusBox title={overlapRisk > 20 ? 'Competition watch' : 'Spacing healthy'} body={`Current spacing keeps overlap risk around ${overlapRisk}%. Recommended contract band stays at ${economicMetrics.recommendedHivesLow}-${economicMetrics.recommendedHivesHigh} hives.`} tone={overlapRisk > 20 ? 'amber' : 'green'} />
        </ToolCard>
      </SectionBlock>

      <SectionBlock id="mini" title="Mini calculators (educational)" subtitle="Fast heuristics for training, field intuition, and crew alignment." badge="4 tools" icon={Brain}>
        <ToolCard icon={Wind} title="Is it worth flying there?" description="Energy balance heuristic for forage trips.">
          <Field label="Forage distance km">
            <NumberInput value={flightDistance} min={0.2} step={0.1} onChange={(event) => setFlightDistance(Number(event.target.value))} />
          </Field>
          <Field label="Forage type">
            <SelectInput value={flightForageType} onChange={(event) => setFlightForageType(event.target.value as ForageType)}>
              <option>Poor</option>
              <option>Average</option>
              <option>Rich</option>
            </SelectInput>
          </Field>
          <Field label="Colony strength">
            <SelectInput value={flightStrength} onChange={(event) => setFlightStrength(event.target.value as HiveStrength)}>
              <option>Modest</option>
              <option>Medium</option>
              <option>Strong</option>
            </SelectInput>
          </Field>
          <StatusBox title={flightProfitability.label} body={`Profitability score ${flightProfitability.score}. Long flights only pay when nectar is dense and the colony is strong enough to support them.`} tone={flightProfitability.score >= 0.85 ? 'green' : flightProfitability.score >= 0.65 ? 'amber' : 'red'} />
        </ToolCard>

        <ToolCard icon={Gauge} title="How many flights does a bee make per day?" description="Small rule-of-thumb estimate for crew education.">
          <Field label="Season">
            <SelectInput value={seasonFlights} onChange={(event) => setSeasonFlights(event.target.value as Season)}>
              <option>Spring</option>
              <option>Summer</option>
              <option>Autumn</option>
              <option>Winter</option>
            </SelectInput>
          </Field>
          <Field label="Forage distance km">
            <NumberInput value={nectarDistance} min={0.2} step={0.1} onChange={(event) => setNectarDistance(Number(event.target.value))} />
          </Field>
          <Field label="Nectar flow">
            <SelectInput value={nectarFlow} onChange={(event) => setNectarFlow(event.target.value as 'Light' | 'Steady' | 'Heavy')}>
              <option>Light</option>
              <option>Steady</option>
              <option>Heavy</option>
            </SelectInput>
          </Field>
          <StatTile label="Estimate" value={`${flightsPerDay} flights / day`} accent="text-[#166534]" />
        </ToolCard>

        <ToolCard icon={AlertTriangle} title="Is this apiary overloaded?" description="Simple competition check using forage area and hive count.">
          <Field label="Number of hives">
            <NumberInput value={apiaryHives} min={1} step={1} onChange={(event) => setApiaryHives(Number(event.target.value))} />
          </Field>
          <Field label="Forage area ha">
            <NumberInput value={forageAreaHa} min={1} step={1} onChange={(event) => setForageAreaHa(Number(event.target.value))} />
          </Field>
          <Field label="Season">
            <SelectInput value={overloadSeason} onChange={(event) => setOverloadSeason(event.target.value as Season)}>
              <option>Spring</option>
              <option>Summer</option>
              <option>Autumn</option>
              <option>Winter</option>
            </SelectInput>
          </Field>
          <StatusBox title={overloadAssessment.label} body={`Pressure ratio ${overloadAssessment.pressure}. Higher than 1 means colonies are competing for the same forage window.`} tone={overloadAssessment.pressure > 0.9 ? 'amber' : 'green'} />
        </ToolCard>

        <ToolCard icon={Brain} title="How many honey frames are realistically possible?" description="Use strength, forage richness, and distance to set a realistic frame target.">
          <Field label="Forage distance km">
            <NumberInput value={honeyFrameDistance} min={0.2} step={0.1} onChange={(event) => setHoneyFrameDistance(Number(event.target.value))} />
          </Field>
          <Field label="Forage type">
            <SelectInput value={honeyFrameForage} onChange={(event) => setHoneyFrameForage(event.target.value as ForageType)}>
              <option>Poor</option>
              <option>Average</option>
              <option>Rich</option>
            </SelectInput>
          </Field>
          <Field label="Colony strength">
            <SelectInput value={honeyFrameStrength} onChange={(event) => setHoneyFrameStrength(event.target.value as HiveStrength)}>
              <option>Modest</option>
              <option>Medium</option>
              <option>Strong</option>
            </SelectInput>
          </Field>
          <StatTile label="Estimate" value={honeyFrameEstimate} accent="text-[#166534]" />
        </ToolCard>
      </SectionBlock>

      <SectionBlock id="quizzes" title="Quizzes and tips" subtitle="Tiny interactive prompts for training decisions and inspection judgment." badge="4 tools" icon={BookOpen}>
        <ToolCard icon={BookOpen} title="Your beekeeping style" description="See the management bias your answers imply.">
          <Field label="Reaction to first symptoms">
            <SelectInput value={reactionStyle} onChange={(event) => setReactionStyle(event.target.value as 'Wait and observe' | 'Treat early')}>
              <option>Wait and observe</option>
              <option>Treat early</option>
            </SelectInput>
          </Field>
          <Field label="Season planning">
            <SelectInput value={planningStyle} onChange={(event) => setPlanningStyle(event.target.value as 'Adaptive' | 'Season plan')}>
              <option>Adaptive</option>
              <option>Season plan</option>
            </SelectInput>
          </Field>
          <Field label="Risk attitude">
            <SelectInput value={riskAttitude} onChange={(event) => setRiskAttitude(event.target.value as 'Avoid chemistry' | 'Use the fastest tool')}>
              <option>Avoid chemistry</option>
              <option>Use the fastest tool</option>
            </SelectInput>
          </Field>
          <StatusBox title={beekeeperStyle} body="Your answers suggest how you balance intervention, planning, and tolerance for uncertainty." tone="green" />
        </ToolCard>

        <ToolCard icon={Thermometer} title="When do bees say STOP?" description="Rough flight threshold based on temperature and wind.">
          <Field label="Temperature C">
            <NumberInput value={stopTemp} min={0} step={1} onChange={(event) => setStopTemp(Number(event.target.value))} />
          </Field>
          <Field label="Wind m/s">
            <NumberInput value={stopWind} min={0} step={1} onChange={(event) => setStopWind(Number(event.target.value))} />
          </Field>
          <Field label="Season">
            <SelectInput value={stopSeason} onChange={(event) => setStopSeason(event.target.value as Season)}>
              <option>Spring</option>
              <option>Summer</option>
              <option>Autumn</option>
              <option>Winter</option>
            </SelectInput>
          </Field>
          <StatusBox title={stopDecision.label} body="Use this as a teaching aid, not an absolute biological cutoff. Local genetics and sun exposure still matter." tone={stopDecision.tone} />
        </ToolCard>

        <ToolCard icon={ShieldCheck} title="Is the colony working or just heating?" description="Use outside weather and strength to read likely colony effort.">
          <Field label="Outside temperature C">
            <NumberInput value={outsideTemp} min={0} step={1} onChange={(event) => setOutsideTemp(Number(event.target.value))} />
          </Field>
          <Field label="Season">
            <SelectInput value={outsideSeason} onChange={(event) => setOutsideSeason(event.target.value as Season)}>
              <option>Spring</option>
              <option>Summer</option>
              <option>Autumn</option>
              <option>Winter</option>
            </SelectInput>
          </Field>
          <Field label="Colony strength">
            <SelectInput value={outsideStrength} onChange={(event) => setOutsideStrength(event.target.value as HiveStrength)}>
              <option>Modest</option>
              <option>Medium</option>
              <option>Strong</option>
            </SelectInput>
          </Field>
          <StatusBox title={heatingDecision.label} body="Cold air often means the colony spends more effort on brood warmth than on active field work." tone={heatingDecision.tone} />
        </ToolCard>

        <ToolCard icon={Flower2} title="Should you open the hive today?" description="Quick inspection gate using weather and nectar context.">
          <Field label="Outside temperature C">
            <NumberInput value={inspectTemp} min={0} step={1} onChange={(event) => setInspectTemp(Number(event.target.value))} />
          </Field>
          <Field label="Wind m/s">
            <NumberInput value={inspectWind} min={0} step={1} onChange={(event) => setInspectWind(Number(event.target.value))} />
          </Field>
          <Field label="Nectar context">
            <SelectInput value={inspectFlow} onChange={(event) => setInspectFlow(event.target.value as 'Dearth' | 'Normal flow' | 'Strong flow')}>
              <option>Dearth</option>
              <option>Normal flow</option>
              <option>Strong flow</option>
            </SelectInput>
          </Field>
          <StatusBox title={inspectionDecision.label} body={inspectionDecision.tone === 'green' ? 'Conditions support a fuller inspection window.' : inspectionDecision.tone === 'amber' ? 'Keep the hive open briefly and avoid creating robbing pressure.' : 'Wait for calmer, warmer conditions before breaking the cluster or brood nest.'} tone={inspectionDecision.tone} />
        </ToolCard>
      </SectionBlock>

    </BeeYieldPageShell>
  );
};

export default BeeCalculatorSuite;
