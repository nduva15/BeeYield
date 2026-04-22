import { useState, useMemo } from "react";
import { X, Target, Wind, Mountain, Compass } from "lucide-react";

/**
 * Precision Pollination Drilldown
 * Step-by-step placement math for the selected crop and site.
 * Pure presentation/calculation — no backend writes.
 */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

type CropProfile = {
  name: string;
  flightRadius_m: number;     // effective foraging radius for THIS crop
  recColoniesPerAcre: number; // PSI v2 stocking density
  bloomDays: number;
  notes: string;
};

const CROP_PROFILES: CropProfile[] = [
  { name: "Almonds (CA)",          flightRadius_m: 800,  recColoniesPerAcre: 2.5, bloomDays: 21, notes: "High floral reward; bees concentrate near edges within 400m." },
  { name: "Apples",                flightRadius_m: 700,  recColoniesPerAcre: 1.5, bloomDays: 14, notes: "Low nectar; needs strong colonies for cross-pollination." },
  { name: "Blueberries (highbush)",flightRadius_m: 500,  recColoniesPerAcre: 4.0, bloomDays: 25, notes: "Buzz-pollinated; favor strong colonies + bumble augmentation." },
  { name: "Cranberries",           flightRadius_m: 600,  recColoniesPerAcre: 3.0, bloomDays: 28, notes: "Bog edges critical; place hives on dry pads." },
  { name: "Avocado (Hass)",        flightRadius_m: 600,  recColoniesPerAcre: 2.0, bloomDays: 30, notes: "Synchronized AB flowering; mid-canopy placement preferred." },
  { name: "Sunflower (hybrid seed)",flightRadius_m: 1200, recColoniesPerAcre: 1.5, bloomDays: 18, notes: "Long-range foragers; spread blocks along prevailing wind." },
  { name: "Canola/Oilseed Rape",   flightRadius_m: 1500, recColoniesPerAcre: 1.0, bloomDays: 24, notes: "Strong nectar pull; bees wander beyond field boundary." },
  { name: "Watermelon",            flightRadius_m: 700,  recColoniesPerAcre: 2.0, bloomDays: 35, notes: "Female flowers open early; place hives by dawn." },
  { name: "Cucumber",              flightRadius_m: 500,  recColoniesPerAcre: 2.5, bloomDays: 40, notes: "Multi-visit demand; stocking on the high end." },
  { name: "Strawberry",            flightRadius_m: 400,  recColoniesPerAcre: 1.5, bloomDays: 30, notes: "Short flight; small drops every 100m row." },
  { name: "Coffee (Arabica)",      flightRadius_m: 800,  recColoniesPerAcre: 1.0, bloomDays: 7,  notes: "Self-fertile but yield gain ~25 % with bees." },
  { name: "Macadamia",             flightRadius_m: 600,  recColoniesPerAcre: 2.5, bloomDays: 14, notes: "Racemes at canopy edge; align drops with row direction." },
  { name: "Mango",                 flightRadius_m: 700,  recColoniesPerAcre: 1.5, bloomDays: 21, notes: "Heat reduces foraging midday; shaded drops help." },
  { name: "Sidr",                  flightRadius_m: 1000, recColoniesPerAcre: 1.0, bloomDays: 30, notes: "Premium honey crop; spread hives along wadis." },
];

export default function PrecisionDrilldown({ isOpen, onClose, embedded }: Props) {
  const [cropName, setCropName] = useState(CROP_PROFILES[0].name);
  const [acres, setAcres] = useState(20);
  const [hives, setHives] = useState(40);
  const [fieldShape, setFieldShape] = useState<"square" | "rectangular_2x1" | "long_strip_4x1">("rectangular_2x1");
  const [windKmh, setWindKmh] = useState(12);
  const [slopePct, setSlopePct] = useState(4);
  const [orientationDeg, setOrientationDeg] = useState(135); // SE-facing
  const [edgeBufferM, setEdgeBufferM] = useState(20);

  const crop = CROP_PROFILES.find((c) => c.name === cropName)!;

  const math = useMemo(() => {
    // 1 acre = 4046.86 m² ; convert acres to area and derive geometry
    const totalArea = acres * 4046.86;
    const ratio = fieldShape === "square" ? 1 : fieldShape === "rectangular_2x1" ? 2 : 4;
    // length = sqrt(area * ratio), width = length / ratio
    const L = Math.sqrt(totalArea * ratio);
    const W = L / ratio;

    // Drop spacing target — pair-wise 2× radius gives full overlap; we use 1.4× for 70 % overlap (industry sweet spot)
    const targetSpacing = crop.flightRadius_m * 1.4;
    const dropsAlongL = Math.max(1, Math.round(L / targetSpacing));
    const dropsAlongW = Math.max(1, Math.round(W / targetSpacing));
    const totalDrops = dropsAlongL * dropsAlongW;

    const hivesPerDrop = Math.max(1, Math.round(hives / totalDrops));

    // Coverage: each colony covers π r² ; clip to 1 hive/colony non-overlap area then sum
    const singleCoverage = Math.PI * crop.flightRadius_m * crop.flightRadius_m;
    const grossCoverage = singleCoverage * hives;
    // Overlap factor — empirical: when coverage > area, effective coverage saturates
    const overlapFactor = grossCoverage > 0 ? Math.min(1, totalArea / grossCoverage) : 0;
    const effectiveCoverage = grossCoverage * overlapFactor;
    const coveragePct = Math.min(100, (effectiveCoverage / totalArea) * 100);

    // Modifiers
    // Wind: subtract 2 % flight efficiency per km/h above 8
    const windPenalty = Math.max(0, windKmh - 8) * 0.02;
    // Slope: 1 % efficiency loss per 1 % grade above 3 %
    const slopePenalty = Math.max(0, slopePct - 3) * 0.01;
    const orientationFactor = Math.cos(((orientationDeg - 135) * Math.PI) / 180); // 1.0 at SE, drops away
    const orientationBonus = 0.04 * Math.max(0, orientationFactor); // up to +4 %

    const efficiency = Math.max(0.4, 1 - windPenalty - slopePenalty + orientationBonus);

    // Recommended hives for full coverage given crop stocking density
    const recHives = Math.ceil(crop.recColoniesPerAcre * acres);

    return {
      L, W, totalArea,
      targetSpacing, dropsAlongL, dropsAlongW, totalDrops, hivesPerDrop,
      singleCoverage, grossCoverage, effectiveCoverage, coveragePct,
      windPenalty, slopePenalty, orientationBonus, efficiency,
      recHives,
      hiveDeficit: recHives - hives,
    };
  }, [acres, hives, crop, fieldShape, windKmh, slopePct, orientationDeg]);

  if (!isOpen) return null;

  return (
    <div className={embedded ? "overflow-y-auto custom-scroll" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"}>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Precision Pollination Drilldown</h1>
              <p className="text-xs text-muted-foreground">Drop spacing • orientation • overlap • slope/wind modifiers</p>
            </div>
          </div>
          {!embedded && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-xl border border-border bg-muted/30">
          <Field label="Crop">
            <select value={cropName} onChange={(e) => setCropName(e.target.value)} className={inputCls}>
              {CROP_PROFILES.map((c) => <option key={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Field shape">
            <select value={fieldShape} onChange={(e) => setFieldShape(e.target.value as typeof fieldShape)} className={inputCls}>
              <option value="square">Square (1:1)</option>
              <option value="rectangular_2x1">Rectangular (2:1)</option>
              <option value="long_strip_4x1">Long strip (4:1)</option>
            </select>
          </Field>
          <Field label="Acreage">
            <input type="number" min={1} value={acres} onChange={(e) => setAcres(Math.max(1, +e.target.value || 1))} className={inputCls} />
          </Field>
          <Field label="Available hives">
            <input type="number" min={1} value={hives} onChange={(e) => setHives(Math.max(1, +e.target.value || 1))} className={inputCls} />
          </Field>
          <Field label={`Edge buffer: ${edgeBufferM} m`}>
            <input type="range" min={0} max={80} value={edgeBufferM} onChange={(e) => setEdgeBufferM(+e.target.value)} className="w-full accent-honey" />
          </Field>
          <Field label={`Hive entrance orientation: ${orientationDeg}° (135° = SE optimal)`}>
            <input type="range" min={0} max={359} value={orientationDeg} onChange={(e) => setOrientationDeg(+e.target.value)} className="w-full accent-honey" />
          </Field>
          <Field label={`Avg wind: ${windKmh} km/h`}>
            <input type="range" min={0} max={40} value={windKmh} onChange={(e) => setWindKmh(+e.target.value)} className="w-full accent-honey" />
          </Field>
          <Field label={`Slope: ${slopePct}%`}>
            <input type="range" min={0} max={25} value={slopePct} onChange={(e) => setSlopePct(+e.target.value)} className="w-full accent-honey" />
          </Field>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="Field size" value={`${math.L.toFixed(0)} × ${math.W.toFixed(0)} m`} />
          <Stat label="Drops needed" value={`${math.totalDrops}`} highlight />
          <Stat label="Hives per drop" value={`${math.hivesPerDrop}`} highlight />
          <Stat label="Effective coverage" value={`${math.coveragePct.toFixed(0)}%`} highlight />
          <Stat label="Recommended hives" value={`${math.recHives}`} />
          <Stat label="Hive deficit/surplus" value={math.hiveDeficit > 0 ? `+${math.hiveDeficit} short` : `${Math.abs(math.hiveDeficit)} surplus`} />
          <Stat label="Foraging efficiency" value={`${(math.efficiency * 100).toFixed(0)}%`} />
          <Stat label="Crop flight radius" value={`${crop.flightRadius_m} m`} />
        </div>

        {/* Worked steps */}
        <div className="p-5 rounded-xl border border-honey/30 bg-card mb-6">
          <h3 className="font-display text-base font-bold text-honey mb-3 flex items-center gap-2">
            <Compass className="w-4 h-4" /> Step-by-step placement math
          </h3>
          <ol className="space-y-3 text-sm text-foreground">
            <Step n={1} label="Field geometry">
              area = {acres} ac × 4046.86 m²/ac = <b>{math.totalArea.toFixed(0)} m²</b><br />
              shape ratio = {fieldShape.replace("_", " ")} → L = √(area × ratio), W = L/ratio<br />
              ⇒ <b>{math.L.toFixed(0)} m × {math.W.toFixed(0)} m</b>
            </Step>
            <Step n={2} label="Target drop spacing (70 % overlap rule)">
              spacing = crop flight radius × 1.4 = {crop.flightRadius_m} × 1.4 = <b>{math.targetSpacing.toFixed(0)} m</b>
            </Step>
            <Step n={3} label="Drop grid">
              along L = round({math.L.toFixed(0)} / {math.targetSpacing.toFixed(0)}) = <b>{math.dropsAlongL}</b><br />
              along W = round({math.W.toFixed(0)} / {math.targetSpacing.toFixed(0)}) = <b>{math.dropsAlongW}</b><br />
              total drops = {math.dropsAlongL} × {math.dropsAlongW} = <b>{math.totalDrops}</b>
            </Step>
            <Step n={4} label="Hives per drop">
              hives_per_drop = ceil({hives} / {math.totalDrops}) = <b>{math.hivesPerDrop}</b><br />
              place each drop ≥ {edgeBufferM} m from field edge to avoid edge-effect drift loss.
            </Step>
            <Step n={5} label="Single-colony coverage">
              A_colony = π × r² = π × {crop.flightRadius_m}² = <b>{math.singleCoverage.toFixed(0)} m²</b>
            </Step>
            <Step n={6} label="Gross vs effective coverage (overlap clipping)">
              gross = {hives} × {math.singleCoverage.toFixed(0)} = {math.grossCoverage.toFixed(0)} m²<br />
              effective = min(field area, gross × overlap factor) = <b>{math.effectiveCoverage.toFixed(0)} m²</b><br />
              coverage% = effective / field = <b>{math.coveragePct.toFixed(1)} %</b>
            </Step>
            <Step n={7} label="Efficiency modifiers">
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="px-2 py-1 rounded bg-muted/50 flex items-center gap-1.5"><Wind className="w-3 h-3" /> wind penalty −{(math.windPenalty * 100).toFixed(0)} %</span>
                <span className="px-2 py-1 rounded bg-muted/50 flex items-center gap-1.5"><Mountain className="w-3 h-3" /> slope penalty −{(math.slopePenalty * 100).toFixed(0)} %</span>
                <span className="px-2 py-1 rounded bg-muted/50 flex items-center gap-1.5"><Compass className="w-3 h-3" /> orientation bonus +{(math.orientationBonus * 100).toFixed(0)} %</span>
              </div>
              net efficiency = max(0.40, 1 − wind − slope + orient) = <b>{(math.efficiency * 100).toFixed(0)} %</b>
            </Step>
            <Step n={8} label="Stocking check vs PSI v2">
              recommended hives for {acres} ac of {crop.name} = ceil({crop.recColoniesPerAcre} × {acres}) = <b>{math.recHives}</b><br />
              you have {hives} hives → <b>{math.hiveDeficit > 0 ? `${math.hiveDeficit} hive deficit` : `${Math.abs(math.hiveDeficit)} hive surplus`}</b>
            </Step>
          </ol>
        </div>

        <div className="p-4 rounded-xl border border-border bg-muted/20 text-xs text-muted-foreground">
          <b className="text-honey">Crop note:</b> {crop.notes}
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary/50 outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-xl border ${highlight ? "border-honey/40 bg-honey/5" : "border-border bg-muted/30"}`}>
      <div className="text-[11px] text-muted-foreground mb-0.5">{label}</div>
      <div className={`font-display text-lg font-bold ${highlight ? "text-honey" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-honey/20 text-honey text-xs font-bold flex items-center justify-center">{n}</span>
      <div className="flex-1">
        <div className="font-semibold text-foreground text-sm mb-1">{label}</div>
        <div className="text-xs text-muted-foreground font-mono leading-relaxed">{children}</div>
      </div>
    </li>
  );
}
