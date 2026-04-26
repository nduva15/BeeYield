import { useState, useMemo } from "react";
import { X, Target, Wind, Mountain, Compass, ChevronRight, Info } from "lucide-react";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldCard, BeeYieldBadge } from "../BeeYieldUI";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlanning?: () => void;
  embedded?: boolean;
}

type CropProfile = {
  name: string;
  flightRadius_m: number;
  recColoniesPerAcre: number;
  bloomDays: number;
  notes: string;
};

const CROP_PROFILES: CropProfile[] = [
  { name: "Almonds (CA)", flightRadius_m: 800, recColoniesPerAcre: 2.5, bloomDays: 21, notes: "High floral reward; bees concentrate near edges within 400m." },
  { name: "Apples", flightRadius_m: 700, recColoniesPerAcre: 1.5, bloomDays: 14, notes: "Low nectar; needs strong colonies for cross-pollination." },
  { name: "Blueberries", flightRadius_m: 500, recColoniesPerAcre: 4.0, bloomDays: 25, notes: "Buzz-pollinated; favor strong colonies + bumble augmentation." },
];

const COMPASS_DIRS = [
  { label: "N", deg: 0 }, { label: "NE", deg: 45 }, { label: "E", deg: 90 },
  { label: "SE", deg: 135 }, { label: "S", deg: 180 }, { label: "SW", deg: 225 },
  { label: "W", deg: 270 }, { label: "NW", deg: 315 },
];

export default function PrecisionDrilldown({ isOpen, onClose, onOpenPlanning, embedded = false }: Props) {
  const [cropName, setCropName] = useState(CROP_PROFILES[0].name);
  const [acres, setAcres] = useState(20);
  const [hives, setHives] = useState(40);
  const [fieldShape, setFieldShape] = useState<"square" | "rectangular_2x1" | "long_strip_4x1">("rectangular_2x1");
  const [windKmh, setWindKmh] = useState(12);
  const [windDirDeg, setWindDirDeg] = useState(90);
  const [fieldOrientationDeg, setFieldOrientationDeg] = useState(0);
  const [slopePct, setSlopePct] = useState(4);
  const [orientationDeg, setOrientationDeg] = useState(135);

  const crop = CROP_PROFILES.find((c) => c.name === cropName)!;

  const math = useMemo(() => {
    const totalArea = acres * 4046.86;
    const ratio = fieldShape === "square" ? 1 : fieldShape === "rectangular_2x1" ? 2 : 4;
    const L = Math.sqrt(totalArea * ratio);
    const W = L / ratio;

    const targetSpacing = crop.flightRadius_m * 1.4;
    const dropsAlongL = Math.max(1, Math.round(L / targetSpacing));
    const dropsAlongW = Math.max(1, Math.round(W / targetSpacing));
    const totalDrops = dropsAlongL * dropsAlongW;

    const hivesPerDrop = Math.max(1, Math.round(hives / totalDrops));

    const singleCoverage = Math.PI * crop.flightRadius_m * crop.flightRadius_m;
    const grossCoverage = singleCoverage * hives;
    const overlapFactor = grossCoverage > 0 ? Math.min(1, totalArea / grossCoverage) : 0;
    const effectiveCoverage = grossCoverage * overlapFactor;
    const coveragePct = Math.min(100, (effectiveCoverage / totalArea) * 100);

    const windPenalty = Math.max(0, windKmh - 8) * 0.02;
    const slopePenalty = Math.max(0, slopePct - 3) * 0.01;

    const downwind = (windDirDeg + 180) % 360;
    const rawDelta = Math.abs(orientationDeg - downwind);
    const angleFromDownwind = Math.min(rawDelta, 360 - rawDelta);
    const windAlignScore = Math.cos((angleFromDownwind * Math.PI) / 180);
    const thermalBonus = Math.max(0, Math.cos(((orientationDeg - 135) * Math.PI) / 180));
    const orientationBonus = 0.05 * windAlignScore + 0.02 * thermalBonus;

    const windAxisDelta = Math.abs(((fieldOrientationDeg - windDirDeg + 360) % 180) - 90);
    const fieldWindAlign = windAxisDelta / 90;
    const fieldDriftPenalty = (1 - fieldWindAlign) * 0.03 * Math.min(1, windKmh / 20);

    const efficiency = Math.max(0.4, 1 - windPenalty - slopePenalty + orientationBonus - fieldDriftPenalty);
    const recHives = Math.ceil(crop.recColoniesPerAcre * acres);

    return {
      L, W, totalArea,
      targetSpacing, dropsAlongL, dropsAlongW, totalDrops, hivesPerDrop,
      singleCoverage, grossCoverage, effectiveCoverage, coveragePct,
      windPenalty, slopePenalty, orientationBonus, fieldDriftPenalty, efficiency,
      angleFromDownwind, windAlignScore, fieldWindAlign,
      recHives,
      hiveDeficit: recHives - hives,
    };
  }, [acres, hives, crop, fieldShape, windKmh, windDirDeg, fieldOrientationDeg, slopePct, orientationDeg]);

  if (!isOpen) return null;

  const content = (
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={Compass}
        label="Science"
        title="Precision Drilldown"
        subtitle="High-performance placement modeling with local ecological variables."
        onBack={onClose}
        actions={
          onOpenPlanning && (
            <button onClick={onOpenPlanning} className="px-4 py-2 rounded-xl bg-honey text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-md">
              <ChevronRight className="w-4 h-4" /> Planning Module
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Total Drops" value={`${math.totalDrops}`} highlight />
            <Stat label="Hives/Drop" value={`${math.hivesPerDrop}`} highlight />
            <Stat label="Coverage" value={`${math.coveragePct.toFixed(0)}%`} highlight={math.coveragePct < 70} />
            <Stat label="Net Efficiency" value={`${(math.efficiency * 100).toFixed(0)}%`} />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <BeeYieldSection title="Field Parameters" icon={Mountain}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Target Crop">
                <select value={cropName} onChange={(e) => setCropName(e.target.value)} className={inputCls}>
                  {CROP_PROFILES.map((c) => <option key={c.name}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Field Shape">
                <select value={fieldShape} onChange={(e) => setFieldShape(e.target.value as typeof fieldShape)} className={inputCls}>
                  <option value="square">Square</option>
                  <option value="rectangular_2x1">2:1 Rect</option>
                  <option value="long_strip_4x1">4:1 Strip</option>
                </select>
              </Field>
              <Field label="Acreage">
                <input type="number" value={acres} onChange={(e) => setAcres(Math.max(1, +e.target.value))} className={inputCls} />
              </Field>
              <Field label="Hives Avail.">
                <input type="number" value={hives} onChange={(e) => setHives(Math.max(1, +e.target.value))} className={inputCls} />
              </Field>
            </div>
          </BeeYieldSection>

          <BeeYieldSection title="Environmental Load" icon={Wind}>
             <div className="space-y-4">
                <Slider label="Static Wind" value={windKmh} unit="km/h" max={40} onChange={setWindKmh} />
                <Slider label="Ground Slope" value={slopePct} unit="%" max={20} onChange={setSlopePct} />
                
                <div className="flex items-center gap-6 py-4">
                    <WindCompass windDirDeg={windDirDeg} entranceDeg={orientationDeg} onChange={setWindDirDeg} />
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Wind Direction (FROM)</label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {COMPASS_DIRS.map(d => (
                                <button key={d.label} onClick={() => setWindDirDeg(d.deg)} className={cn("text-[9px] font-black py-1.5 rounded-lg border transition-all", windDirDeg === d.deg ? "bg-honey border-honey text-white shadow-md shadow-honey/20" : "bg-white border-border text-muted-foreground hover:border-honey/30")}>{d.label}</button>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
          </BeeYieldSection>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <BeeYieldSection title="Mathematical Validation" icon={Info}>
              <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-muted/20 border border-border">
                        <ol className="space-y-6">
                            <Step n={1} label="Spatial Geometry">
                                Field Boundary: {math.L.toFixed(0)}m × {math.W.toFixed(0)}m (Total Area: {math.totalArea.toLocaleString()}m²)
                            </Step>
                            <Step n={2} label="Biotic Flight Radius">
                                {crop.name}: {crop.flightRadius_m}m forage reach | Theoretical Overlap: {math.targetSpacing.toFixed(0)}m
                            </Step>
                            <Step n={3} label="Penalty Matrix">
                                Wind Attrition: -{(math.windPenalty * 100).toFixed(0)}% | Altimetric Load: -{(math.slopePenalty * 100).toFixed(0)}%
                                <br />Orientation Bonus: {math.orientationBonus >= 0 ? '+' : ''}{(math.orientationBonus * 100).toFixed(0)}%
                            </Step>
                            <Step n={4} label="Stocking Verdict">
                                Recommended Stocking: {math.recHives} colonies | Deployment Status: 
                                <BeeYieldBadge variant={math.hiveDeficit > 0 ? "error" : "success"} className="ml-2 font-black uppercase text-[9px] tracking-widest">
                                    {math.hiveDeficit > 0 ? `${math.hiveDeficit} Units Short` : 'Optimal Load'}
                                </BeeYieldBadge>
                            </Step>
                        </ol>
                  </div>

                  <BeeYieldCard className="p-8 border-honey/40 bg-honey/10">
                      <div className="text-[10px] font-black text-honey uppercase tracking-[0.2em] mb-4">Precision Deployment Map</div>
                      <div className="aspect-video bg-white/50 rounded-2xl border border-honey/20 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-honey/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                           <div className="w-12 h-12 rounded-full bg-honey/10 text-honey flex items-center justify-center mb-3">
                               <Compass className="w-6 h-6 animate-spin-slow" />
                           </div>
                           <p className="text-xs font-black text-foreground uppercase tracking-widest">Dynamic Coverage Model</p>
                           <p className="text-[10px] text-muted-foreground mt-2 max-w-[200px]">Optimal placement for {math.totalDrops} drops identified across the {math.totalArea.toLocaleString()}m² matrix.</p>
                      </div>
                  </BeeYieldCard>
              </div>
          </BeeYieldSection>
        </div>
      </div>
    </BeeYieldPageShell>
  );

  if (embedded) return content;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity p-4", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <div className={cn("bg-white rounded-[2.5rem] w-full h-[95vh] max-w-6xl shadow-2xl relative transition-all transform overflow-hidden", isOpen ? "scale-100" : "scale-95")}>
        <button onClick={onClose} className="absolute top-10 right-10 p-2 rounded-full hover:bg-muted transition-colors z-50 text-muted-foreground hover:text-foreground">
          <X className="w-6 h-6" />
        </button>
        <div className="h-full overflow-y-auto custom-scroll p-10">
          {content}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <BeeYieldCard className={cn("p-5 border-border/50 bg-muted/10", highlight && "border-amber-500/20 bg-amber-50")}>
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</div>
      <div className={cn("text-2xl font-black tabular-nums", highlight ? "text-amber-600" : "text-foreground")}>{value}</div>
    </BeeYieldCard>
  );
}

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <div className="w-8 h-8 rounded-xl bg-honey/10 text-honey text-[10px] font-black flex items-center justify-center flex-shrink-0 border border-honey/20">{n}</div>
      <div className="flex-1">
        <div className="text-[10px] font-black text-foreground uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-[11px] text-muted-foreground font-bold">{children}</div>
      </div>
    </li>
  );
}

function Slider({ label, value, unit, max, onChange }: { label: string; value: number; unit: string; max: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">
        <span>{label}</span>
        <span className="text-honey">{value}{unit}</span>
      </div>
      <input type="range" min={0} max={max} value={value} onChange={e => onChange(+e.target.value)} className="w-full h-1.5 bg-honey/10 rounded-full appearance-none cursor-pointer accent-honey" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white border border-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-honey/40 transition-all shadow-sm";

function WindCompass({ windDirDeg, entranceDeg, onChange }: any) {
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const handleClick = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    const angle = (Math.atan2(x, -y) * 180) / Math.PI;
    onChange(Math.round((angle + 360) % 360));
  };
  const fromRad = ((windDirDeg - 90) * Math.PI) / 180;
  const fromX = cx + r * Math.cos(fromRad);
  const fromY = cy + r * Math.sin(fromRad);
  const downwindRad = ((windDirDeg + 180 - 90) * Math.PI) / 180;
  const dwX = cx + r * 0.8 * Math.cos(downwindRad);
  const dwY = cy + r * 0.8 * Math.sin(downwindRad);
  const entRad = ((entranceDeg - 90) * Math.PI) / 180;
  const entX = cx + r * 0.9 * Math.cos(entRad);
  const entY = cy + r * 0.9 * Math.sin(entRad);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} onClick={handleClick} className="cursor-crosshair flex-shrink-0 bg-white rounded-full border border-border shadow-md">
      <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="hsl(var(--border))" strokeDasharray="2 4" />
      <text x={cx} y={15} textAnchor="middle" fontSize="9" fontWeight="900" fill="hsl(var(--muted-foreground))">N</text>
      <text x={size-15} y={cy+3} textAnchor="middle" fontSize="9" fontWeight="900" fill="hsl(var(--muted-foreground))">E</text>
      <text x={cx} y={size-8} textAnchor="middle" fontSize="9" fontWeight="900" fill="hsl(var(--muted-foreground))">S</text>
      <text x={15} y={cy+3} textAnchor="middle" fontSize="9" fontWeight="900" fill="hsl(var(--muted-foreground))">W</text>
      <line x1={fromX} y1={fromY} x2={dwX} y2={dwY} stroke="hsl(var(--honey))" strokeWidth={3} markerEnd="url(#arr2)" />
      <line x1={cx} y1={cy} x2={entX} y2={entY} stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="3 3" />
      <defs>
        <marker id="arr2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 Z" fill="hsl(var(--honey))" />
        </marker>
      </defs>
      <circle cx={cx} cy={cy} r={4} fill="hsl(var(--honey))" />
    </svg>
  );
}
