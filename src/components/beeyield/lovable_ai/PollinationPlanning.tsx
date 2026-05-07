import { useState, useMemo } from "react";
import { Calculator, Sparkles, Loader2, Target } from "lucide-react";
import { toast } from "sonner";
import MarkdownRenderer from "./MarkdownRenderer";
import { FLORAGE } from "./FloragePage";

// Florage-weighted precision pollination model.
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

export default function PollinationPlanning({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [crop, setCrop] = useState("Almonds");
  const [acres, setAcres] = useState(40);
  const [region, setRegion] = useState("California Central Valley");
  const [expectedBpm, setExpectedBpm] = useState(100);
  const [selectedFlorage, setSelectedFlorage] = useState<string[]>(["Clover (White)", "Phacelia"]);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const data = CROP_DATA[crop];

  const florageData = useMemo(() => {
    const picks = FLORAGE.filter((f) => selectedFlorage.includes(f.name));
    const avgScore = picks.length ? picks.reduce((s, p) => s + (p.nectar + p.pollen), 0) / (picks.length * 2) : 5;
    return { picks, avgScore, multiplier: avgScore / 10 };
  }, [selectedFlorage]);

  const calcs = useMemo(() => {
    const acreM2 = acres * 4046.86;
    const florageMult = Math.max(0.4, florageData.multiplier);
    const activityMult = Math.max(0.3, expectedBpm / 100);
    const singleHiveArea = Math.PI * data.radius * data.radius * florageMult * activityMult;
    const precisionHives = Math.ceil((acreM2 / singleHiveArea) * data.demand);
    const contractHives = Math.ceil(acres * data.contractPerAc);
    const expectedSet = Math.min(0.95, data.setBoost * florageMult * activityMult);
    const yieldUplift = (expectedSet - 0.4) * 100; // % vs unpollinated baseline
    return { acreM2, singleHiveArea, precisionHives, contractHives, expectedSet, yieldUplift, florageMult, activityMult };
  }, [acres, data, florageData, expectedBpm]);

  const runAI = async () => {
    setAiLoading(true); setAiText("");
    const prompt = `As Beeyield AI, write a **Florage-Weighted Pollination Plan** for **${crop}** on **${acres} acres** in **${region}**.

Computed inputs:
- Field area: ${calcs.acreM2.toFixed(0)} m² (${acres} ac)
- Crop foraging radius: ${data.radius} m
- Florage diversity multiplier: ${calcs.florageMult.toFixed(2)} (selected: ${selectedFlorage.join(", ") || "none"})
- Activity multiplier: ${calcs.activityMult.toFixed(2)} (expected ${expectedBpm} bees/min)
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
      if (!resp.ok || !resp.body) { toast.error("AI failed"); setAiLoading(false); return; }
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
    } catch { toast.error("AI failed"); }
    finally { setAiLoading(false); }
  };

  const toggleFlorage = (name: string) => {
    setSelectedFlorage((cur) => cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name]);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Pollination Planning</h1>
              <p className="text-xs text-muted-foreground">Florage-weighted precision model · contract baseline · AI deployment plan</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 rounded-xl border border-border bg-muted/30">
          <Field label="Crop"><select value={crop} onChange={(e) => setCrop(e.target.value)} className={inputCls}>{Object.keys(CROP_DATA).map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Region"><input value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls} /></Field>
          <Field label="Field area (acres)"><input type="number" value={acres} onChange={(e) => setAcres(+e.target.value)} className={inputCls} /></Field>
          <Field label={`Expected colony activity: ${expectedBpm} bees/min`}><input type="range" min={20} max={300} value={expectedBpm} onChange={(e) => setExpectedBpm(+e.target.value)} className="w-full accent-honey" /></Field>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card mb-4">
          <h3 className="font-display text-sm font-bold text-foreground mb-2">Surrounding florage (select all present within 1 km)</h3>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {FLORAGE.map((f) => (
              <button key={f.name} onClick={() => toggleFlorage(f.name)} className={`px-2 py-1 rounded-full text-[11px] border ${selectedFlorage.includes(f.name) ? "bg-honey/20 border-honey text-honey font-semibold" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                {f.name} <span className="opacity-60">({((f.nectar + f.pollen) / 2).toFixed(0)})</span>
              </button>
            ))}
          </div>
          <div className="text-xs mt-2 text-muted-foreground">Florage diversity multiplier: <b className="text-honey">{calcs.florageMult.toFixed(2)}×</b></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <KPI label="Precision hives" value={`${calcs.precisionHives}`} highlight />
          <KPI label="Contract baseline" value={`${calcs.contractHives}`} />
          <KPI label="Expected set" value={`${(calcs.expectedSet * 100).toFixed(0)}%`} />
          <KPI label="Yield uplift" value={`+${calcs.yieldUplift.toFixed(0)}%`} />
          <KPI label="Per-hive coverage" value={`${(calcs.singleHiveArea / 10000).toFixed(2)} ha`} />
          <KPI label="Crop radius" value={`${data.radius} m`} />
          <KPI label="Florage mult" value={`${calcs.florageMult.toFixed(2)}×`} />
          <KPI label="Activity mult" value={`${calcs.activityMult.toFixed(2)}×`} />
        </div>

        <button onClick={runAI} disabled={aiLoading} className="w-full px-4 py-2.5 rounded-lg bg-gradient-amber text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mb-4">
          {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate AI deployment plan
        </button>

        {aiText && <div className="p-5 rounded-xl border border-honey/30 bg-card mb-4"><MarkdownRenderer content={aiText} /></div>}

        <div className="p-3 rounded-lg border border-honey/30 bg-honey/5 text-xs">
          <b className="text-honey">Linked tools:</b> Pulls florage scores from <b>Florage Database</b>; activity from <b>Activity Counter</b>/<b>Forecaster</b>; feeds hive plan into <b>Hive Placement Map</b> and <b>Precision Drilldown</b>.
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>{children}</div>;
}
function KPI({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-lg border ${highlight ? "border-honey/40 bg-honey/5" : "border-border bg-card"}`}>
      <div className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</div>
      <div className={`font-display text-xl font-bold ${highlight ? "text-honey" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
