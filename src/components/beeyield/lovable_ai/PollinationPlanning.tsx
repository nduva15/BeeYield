import { useState, useMemo } from "react";
import { X, Target, Sparkles, Loader2, Info, Layers, Beaker, MapPin } from "lucide-react";
import { toast } from "sonner";
import MarkdownRenderer from "./MarkdownRenderer";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldCard, BeeYieldBadge } from "../BeeYieldUI";
import { cn } from "@/lib/utils";

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

export default function PollinationPlanning({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const [crop, setCrop] = useState("Almonds");
  const [acres, setAcres] = useState(40);
  const [region, setRegion] = useState("Central Valley");
  const [expectedBpm, setExpectedBpm] = useState(100);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const data = CROP_DATA[crop];

  const calcs = useMemo(() => {
    const acreM2 = acres * 4046.86;
    const florageMult = 1.0; // Baseline
    const activityMult = Math.max(0.3, expectedBpm / 100);
    const singleHiveArea = Math.PI * data.radius * data.radius * florageMult * activityMult;
    const precisionHives = Math.ceil((acreM2 / singleHiveArea) * data.demand);
    const contractHives = Math.ceil(acres * data.contractPerAc);
    const expectedSet = Math.min(0.95, data.setBoost * florageMult * activityMult);
    const yieldUplift = (expectedSet - 0.4) * 100;
    return { acreM2, singleHiveArea, precisionHives, contractHives, expectedSet, yieldUplift, florageMult, activityMult };
  }, [acres, data, expectedBpm]);

  const runAI = async () => {
    setAiLoading(true); setAiText("");
    const prompt = `As Beeyield AI, write a **Pollination Plan** for **${crop}**-**${acres} acres** in **${region}**.
    Requirement: ${calcs.precisionHives} hives vs ${calcs.contractHives} baseline.
    Provide deployment schedule, risk mitigations, and ROI estimate.`;
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      if (!resp.ok || !resp.body) { toast.error("AI failed"); setAiLoading(false); return; }
      const reader = resp.body.getReader(); const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try { const j = JSON.parse(json); const t = j.choices?.[0]?.delta?.content; if (t) { acc += t; setAiText(acc); } } catch {}
          }
        }
      }
    } catch { toast.error("AI error"); }
    finally { setAiLoading(false); }
  };

  if (!isOpen) return null;

  const content = (
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={Target}
        label="Strategic"
        title="Pollination Planning"
        subtitle="Florage-weighted precision model and AI deployment coordination."
        onBack={onClose}
        actions={
            <button onClick={runAI} disabled={aiLoading} className="px-4 py-2 rounded-xl bg-honey text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-md disabled:opacity-50">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI Deployment Plan
            </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-5 space-y-6">
            <BeeYieldSection title="Matrix Inputs" icon={Beaker}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Crop Subject</label>
                        <select value={crop} onChange={(e) => setCrop(e.target.value)} className={inputCls}>
                            {Object.keys(CROP_DATA).map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Region</label>
                        <input value={region} onChange={e => setRegion(e.target.value)} className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Acres</label>
                        <input type="number" value={acres} onChange={e => setAcres(+e.target.value)} className={inputCls} />
                    </div>
                </div>
                <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Expected Foraging Activity: {expectedBpm} bpm</label>
                    </div>
                    <input type="range" min={20} max={300} value={expectedBpm} onChange={e => setExpectedBpm(+e.target.value)} className="w-full h-1.5 bg-honey/10 rounded-full appearance-none cursor-pointer accent-honey" />
                </div>
            </BeeYieldSection>

            <BeeYieldCard className="p-6 border-border/50 bg-muted/5">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Forage Attrition</h4>
                <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground">Crop Radius</span>
                        <span className="text-foreground">{data.radius}m</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground">Effective Area / Hive</span>
                        <span className="text-foreground">{(calcs.singleHiveArea / 10000).toFixed(2)} ha</span>
                    </div>
                </div>
            </BeeYieldCard>
        </div>

        <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <BeeYieldCard className="p-8 border-honey/20 bg-honey/5 flex flex-col justify-center">
                    <div className="text-[10px] font-black text-honey uppercase tracking-widest mb-1">Precision Req.</div>
                    <div className="text-4xl font-black text-foreground">{calcs.precisionHives} <span className="text-sm font-bold text-muted-foreground">Units</span></div>
                    <p className="text-[9px] text-muted-foreground font-bold mt-2 uppercase">Industry Baseline: {calcs.contractHives}</p>
                </BeeYieldCard>
                <BeeYieldCard className="p-8 border-border bg-muted/10 flex flex-col justify-center">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Expected Set</div>
                    <div className="text-4xl font-black text-foreground">{(calcs.expectedSet * 100).toFixed(0)}%</div>
                    <p className="text-[9px] text-honey font-bold mt-2 uppercase">Yield Uplift: +{calcs.yieldUplift.toFixed(0)}%</p>
                </BeeYieldCard>
            </div>

            {aiText || aiLoading ? (
                 <BeeYieldCard className="p-8 border-honey/30 bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4 border-b border-honey/10 pb-4">
                        <Sparkles className="w-4 h-4 text-honey" />
                        <h3 className="text-xs font-black text-honey uppercase tracking-widest">Neural Deployment Model</h3>
                    </div>
                    {aiLoading && !aiText ? (
                        <div className="py-12 flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-honey mb-4" />
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Calculating Foraging Matrix...</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-honey leading-relaxed">
                            <MarkdownRenderer content={aiText} />
                        </div>
                    )}
                 </BeeYieldCard>
            ) : (
                <BeeYieldCard className="p-12 border-2 border-dashed border-border bg-muted/5 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-honey/10 flex items-center justify-center mb-6">
                        <Target className="w-8 h-8 text-honey" />
                    </div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-2">Optimization Report Ready</h3>
                    <p className="text-xs text-muted-foreground max-w-xs font-bold leading-relaxed mb-8">Execute the AI model to generate a precision deployment schedule, risk profile, and ROI projection based on current field variables.</p>
                    <button onClick={runAI} className="px-10 py-4 rounded-2xl bg-honey text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-honey/20 hover:opacity-90 transition-all flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Run Strategic Inference
                    </button>
                </BeeYieldCard>
            )}
        </div>
      </div>
    </BeeYieldPageShell>
  );

  if (embedded) return content;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity p-4", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <div className={cn("bg-white rounded-[2.5rem] w-full h-[90vh] max-w-6xl shadow-2xl relative transition-all transform overflow-hidden", isOpen ? "scale-100" : "scale-95")}>
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

const inputCls = "w-full bg-white border border-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-honey/40 transition-all shadow-sm";
