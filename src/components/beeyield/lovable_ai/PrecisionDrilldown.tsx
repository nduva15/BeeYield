import { useState, useMemo } from "react";
import { X, Target, Wind, Mountain, Compass, ChevronRight } from "lucide-react";

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
  const [edgeBufferM, setEdgeBufferM] = useState(20);

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

  const content = (
    <div className={embedded ? "" : "max-h-[85vh] overflow-y-auto custom-scroll"}>
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-foreground">Precision Drilldown</h2>
        <p className="text-sm text-muted-foreground">High-performance placement modeling with local variables</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4 p-6 rounded-3xl border border-honey/20 bg-honey/5 backdrop-blur-sm">
            <h3 className="text-xs font-black text-honey uppercase tracking-widest flex items-center gap-2">
              <Compass className="w-4 h-4" /> Field Variables
            </h3>
            
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

            <div className="space-y-4 pt-2">
              <Slider label="Wind Speed" value={windKmh} unit="km/h" max={40} onChange={setWindKmh} />
              <Slider label="Ground Slope" value={slopePct} unit="%" max={20} onChange={setSlopePct} />
              <div className="flex items-center gap-4 py-2">
                <WindCompass windDirDeg={windDirDeg} entranceDeg={orientationDeg} onChange={setWindDirDeg} />
                <div className="flex-1 space-y-2">
                   <div className="text-[10px] font-black text-muted-foreground uppercase">Prevailing Wind FROM</div>
                   <div className="grid grid-cols-4 gap-1">
                      {COMPASS_DIRS.map(d => (
                        <button key={d.label} onClick={() => setWindDirDeg(d.deg)} className={`text-[10px] font-bold py-1 rounded-lg border ${windDirDeg === d.deg ? 'bg-honey border-honey text-white' : 'bg-white border-border text-muted-foreground'}`}>{d.label}</button>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Total Drops" value={`${math.totalDrops}`} highlight />
            <Stat label="Hives/Drop" value={`${math.hivesPerDrop}`} highlight />
            <Stat label="Coverage" value={`${math.coveragePct.toFixed(0)}%`} highlight={math.coveragePct < 70} />
            <Stat label="Net Efficiency" value={`${(math.efficiency * 100).toFixed(0)}%`} />
          </div>

          <div className="p-6 rounded-3xl border border-border bg-white shadow-sm space-y-4">
             <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Mathematical Workflow</h3>
             <ol className="space-y-4">
               <Step n={1} label="Spatial Geometry">
                 Area: {math.totalArea.toFixed(0)}m² | Matrix: {math.L.toFixed(0)}m × {math.W.toFixed(0)}m
               </Step>
               <Step n={2} label="Foraging Radius">
                 {crop.name}: {crop.flightRadius_m}m radius | Overlap Spacing: {math.targetSpacing.toFixed(0)}m
               </Step>
               <Step n={3} label="Penalty Adjustments">
                 Wind: -{(math.windPenalty * 100).toFixed(0)}% | Slope: -{(math.slopePenalty * 100).toFixed(0)}%
                 <br />Orientation Bonus: {math.orientationBonus >= 0 ? '+' : ''}{(math.orientationBonus * 100).toFixed(0)}%
               </Step>
               <Step n={4} label="Stocking Verdict">
                 Recommended: {math.recHives} hives | Status: <span className={math.hiveDeficit > 0 ? 'text-destructive font-bold' : 'text-green-600 font-bold'}>{math.hiveDeficit > 0 ? `${math.hiveDeficit} Short` : 'Optimal'}</span>
               </Step>
             </ol>
          </div>

          {onOpenPlanning && (
            <button onClick={onOpenPlanning} className="w-full py-4 rounded-2xl bg-honey text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-honey/20 transition-all">
              Launch Detailed Planning Module <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-3xl w-full max-w-6xl shadow-2xl relative transition-all transform ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors z-10"><X className="w-5 h-5" /></button>
        <div className="p-8">{content}</div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-2xl border ${highlight ? "border-amber-500/20 bg-amber-50" : "border-border bg-muted/20"}`}>
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-xl font-black ${highlight ? "text-amber-600" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <div className="w-8 h-8 rounded-xl bg-honey/10 text-honey text-xs font-black flex items-center justify-center flex-shrink-0">{n}</div>
      <div>
        <div className="text-xs font-black text-foreground uppercase tracking-wider mb-1">{label}</div>
        <div className="text-[11px] text-muted-foreground font-bold">{children}</div>
      </div>
    </li>
  );
}

function Slider({ label, value, unit, max, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
        <span>{label}</span>
        <span className="text-honey">{value}{unit}</span>
      </div>
      <input type="range" min={0} max={max} value={value} onChange={e => onChange(+e.target.value)} className="w-full h-1.5 bg-honey/10 rounded-lg appearance-none cursor-pointer accent-honey" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white border border-border rounded-xl px-3 py-2 text-xs font-bold focus:border-honey/40 outline-none transition-all";

function WindCompass({ windDirDeg, entranceDeg, onChange }: any) {
  const size = 110;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} onClick={handleClick} className="cursor-crosshair flex-shrink-0 bg-white rounded-full border border-border shadow-inner">
      <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="hsl(var(--border))" strokeDasharray="2 4" />
      <text x={cx} y={15} textAnchor="middle" fontSize="9" fontWeight="900" fill="hsl(var(--muted-foreground))">N</text>
      <text x={size-15} y={cy+3} textAnchor="middle" fontSize="9" fontWeight="900" fill="hsl(var(--muted-foreground))">E</text>
      <text x={cx} y={size-8} textAnchor="middle" fontSize="9" fontWeight="900" fill="hsl(var(--muted-foreground))">S</text>
      <text x={15} y={cy+3} textAnchor="middle" fontSize="9" fontWeight="900" fill="hsl(var(--muted-foreground))">W</text>
      <line x1={fromX} y1={fromY} x2={dwX} y2={dwY} stroke="hsl(var(--honey))" strokeWidth={3} markerEnd="url(#arr)" />
      <line x1={cx} y1={cy} x2={entX} y2={entY} stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="3 3" />
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 Z" fill="hsl(var(--honey))" />
        </marker>
      </defs>
      <circle cx={cx} cy={cy} r={4} fill="hsl(var(--honey))" />
    </svg>
  );
}
