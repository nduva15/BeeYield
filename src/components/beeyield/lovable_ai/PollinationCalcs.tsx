import { useState, useEffect, useMemo } from "react";
import { X, Calculator, Truck, Sprout, Calendar, Sparkles, Loader2, Info, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { toast } from "sonner";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldCard, BeeYieldBadge } from "../BeeYieldUI";
import { cn } from "@/lib/utils";

// Industry stocking densities (hives per hectare)
const STOCKING: Record<string, { hivesPerHa: number; expectedYieldKgPerHa: number; bloomDays: number; transportNote: string }> = {
  almond:     { hivesPerHa: 5,   expectedYieldKgPerHa: 0,   bloomDays: 21, transportNote: "Night-only transport, screened loads, set within 24h of bloom" },
  apple:      { hivesPerHa: 2.5, expectedYieldKgPerHa: 8,   bloomDays: 10, transportNote: "Set at king-bloom; ≤2 km moves OK during day" },
  blueberry:  { hivesPerHa: 7.5, expectedYieldKgPerHa: 5,   bloomDays: 18, transportNote: "Place in clusters of 4–8 to overcome buzz-pollination preference" },
  canola:     { hivesPerHa: 2,   expectedYieldKgPerHa: 60,  bloomDays: 28, transportNote: "Major honey crop — extract before crystallisation" },
  sunflower:  { hivesPerHa: 2.5, expectedYieldKgPerHa: 25,  bloomDays: 20, transportNote: "Heat-tolerant transport OK; supers need ventilation" },
  avocado:    { hivesPerHa: 6,   expectedYieldKgPerHa: 0,   bloomDays: 30, transportNote: "Dichogamous A/B trees need staggered timing" },
  coffee:     { hivesPerHa: 3,   expectedYieldKgPerHa: 12,  bloomDays: 7,  transportNote: "Mass bloom 7–10 days post-rain; pre-position hives" },
  mango:      { hivesPerHa: 3,   expectedYieldKgPerHa: 8,   bloomDays: 21, transportNote: "Avoid >32°C; early-morning offloads" },
  macadamia:  { hivesPerHa: 4,   expectedYieldKgPerHa: 10,  bloomDays: 35, transportNote: "Long racemes; maintain 4 hives/ha for set" },
  cucurbit:   { hivesPerHa: 2,   expectedYieldKgPerHa: 18,  bloomDays: 60, transportNote: "AM-only flowers; place hives by 6am" },
  citrus:     { hivesPerHa: 5,   expectedYieldKgPerHa: 35,  bloomDays: 14, transportNote: "Aromatic premium honey; isolate from other floral sources" },
  sidr:       { hivesPerHa: 3,   expectedYieldKgPerHa: 8,   bloomDays: 60, transportNote: "Arid-zone — water provision essential" },
  black_locust:{ hivesPerHa: 4,  expectedYieldKgPerHa: 40,  bloomDays: 12, transportNote: "Cold-sensitive; abort if night T <8°C predicted" },
  general:    { hivesPerHa: 3,   expectedYieldKgPerHa: 15,  bloomDays: 21, transportNote: "Generic baseline — refine with local florage" },
};

export default function PollinationCalcs({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [crop, setCrop] = useState("almond");
  const [hectares, setHectares] = useState(10);
  const [currentHives, setCurrentHives] = useState(20);
  const [transportKm, setTransportKm] = useState(50);
  const [hivesPerTruck, setHivesPerTruck] = useState(48);
  const [costPerKm, setCostPerKm] = useState(2.5);
  const [bloomStart, setBloomStart] = useState<string>(new Date().toISOString().slice(0, 10));
  const [floragePlants, setFloragePlants] = useState<any[]>([]);
  const [aiNarrative, setAiNarrative] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    supabase.from("florage_inventory").select("*").eq("device_id", deviceId).then(({ data }) => {
      setFloragePlants((data) || []);
    });
  }, [isOpen, deviceId]);

  const calc = useMemo(() => {
    const spec = STOCKING[crop] || STOCKING.general;
    // Florage diversity multiplier (0.85–1.15 based on local plant scores within bloom window)
    const avgNectar = floragePlants.length ? floragePlants.reduce((s, p) => s + (p.nectar_score || 50), 0) / floragePlants.length : 50;
    const florageMult = 0.85 + (avgNectar / 100) * 0.3; // 0.85 → 1.15

    const requiredHives = Math.ceil(spec.hivesPerHa * hectares);
    const florageAdjustedHives = Math.ceil(requiredHives / florageMult);
    const gap = florageAdjustedHives - currentHives;
    const expectedYieldKg = Math.round(spec.expectedYieldKgPerHa * hectares * florageMult);

    // Transport
    const trucksNeeded = Math.ceil(florageAdjustedHives / hivesPerTruck);
    const transportCost = Math.round(trucksNeeded * transportKm * 2 * costPerKm); // round trip

    // Timeline
    const start = new Date(bloomStart);
    const setDate = new Date(start); setDate.setDate(start.getDate() - 2);
    const peakDate = new Date(start); peakDate.setDate(start.getDate() + Math.floor(spec.bloomDays / 2));
    const removeDate = new Date(start); removeDate.setDate(start.getDate() + spec.bloomDays + 2);
    const extractDate = new Date(removeDate); extractDate.setDate(removeDate.getDate() + 7);

    const timeline = [
      { label: "Pre-position hives", date: setDate, icon: "🚚" },
      { label: "Bloom start", date: start, icon: "🌸" },
      { label: "Peak bloom", date: peakDate, icon: "🌺" },
      { label: "Remove hives", date: removeDate, icon: "🚛" },
      { label: "Extract honey", date: extractDate, icon: "🍯" },
    ];

    return { spec, requiredHives, florageAdjustedHives, gap, florageMult, expectedYieldKg, trucksNeeded, transportCost, timeline };
  }, [crop, hectares, currentHives, transportKm, hivesPerTruck, costPerKm, bloomStart, floragePlants]);

  const askAi = async () => {
    setLoadingAi(true); setAiNarrative("");
    const prompt = `As Beeyield AI, provide a tactical pollination plan:\nCrop: ${crop}\nHectares: ${hectares}\nGap: ${calc.gap} hives\nTransport: ${calc.trucksNeeded} trucks\nBloom Start: ${bloomStart}\n\nOutline risk mitigation, forager loading, and expected success score.`;
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      if (!resp.ok || !resp.body) { toast.error("AI failed"); setLoadingAi(false); return; }
      const reader = resp.body.getReader(); const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        const chunk = dec.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try { const j = JSON.parse(json); const t = j.choices?.[0]?.delta?.content; if (t) { acc += t; setAiNarrative(acc); } } catch {}
          }
        }
      }
    } catch { toast.error("AI inference error"); }
    finally { setLoadingAi(false); }
  };

  if (!isOpen) return null;

  const content = (
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={Calculator}
        label="Analytics"
        title="Pollination Calcs"
        subtitle="Hives requirement, transport logistics, and expected production yield."
        onBack={onClose}
        actions={
            <button onClick={askAi} disabled={loadingAi} className="px-4 py-2 rounded-xl bg-honey text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-md">
                {loadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Neural Evaluation
            </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-5 space-y-6">
            <BeeYieldSection title="Matrix Parameters" icon={Target}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Crop Subject</label>
                        <select value={crop} onChange={(e) => setCrop(e.target.value)} className={inputCls}>
                            {Object.keys(STOCKING).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Area (ha)</label>
                        <input type="number" value={hectares} onChange={e => setHectares(+e.target.value)} className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Hives</label>
                        <input type="number" value={currentHives} onChange={e => setCurrentHives(+e.target.value)} className={inputCls} />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Bloom Start</label>
                        <input type="date" value={bloomStart} onChange={(e) => setBloomStart(e.target.value)} className={inputCls} />
                    </div>
                </div>
            </BeeYieldSection>

            <BeeYieldSection title="Transport Logic" icon={Truck}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Distance (km)</label>
                        <input type="number" value={transportKm} onChange={e => setTransportKm(+e.target.value)} className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Hives / Truck</label>
                        <input type="number" value={hivesPerTruck} onChange={e => setHivesPerTruck(+e.target.value)} className={inputCls} />
                    </div>
                </div>
                <div className="mt-4 p-4 rounded-xl border border-border bg-card">
                    <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-muted-foreground uppercase">Estimated Cost</span>
                        <span className="text-honey">${calc.transportCost}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">{calc.trucksNeeded} Truckloads Required</p>
                </div>
            </BeeYieldSection>
        </div>

        <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <BeeYieldCard className="p-6 border-honey/20 bg-honey/5">
                    <div className="text-[10px] font-black text-honey uppercase tracking-widest mb-1">Stocking Verdict</div>
                    <div className="text-3xl font-black text-foreground">{calc.florageAdjustedHives} <span className="text-sm font-bold text-muted-foreground">hives</span></div>
                    <BeeYieldBadge variant={calc.gap > 0 ? "error" : "success"} className="mt-2 text-[8px] font-black uppercase tracking-widest">
                        {calc.gap > 0 ? `${calc.gap} Units Missing` : 'Sufficient Load'}
                    </BeeYieldBadge>
                </BeeYieldCard>
                <BeeYieldCard className="p-6 border-border bg-muted/5">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Expected Yield</div>
                    <div className="text-3xl font-black text-foreground">{calc.expectedYieldKg} <span className="text-sm font-bold text-muted-foreground">kg</span></div>
                    <p className="text-[9px] text-muted-foreground font-bold mt-2 uppercase">Multiplier: {calc.florageMult.toFixed(2)}x</p>
                </BeeYieldCard>
            </div>

            <BeeYieldCard className="p-8 border-border bg-white shadow-sm">
                <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-6 flex items-center gap-2"><Calendar className="w-4 h-4 text-honey" /> Operational Timeline</h4>
                <div className="space-y-4">
                    {calc.timeline.map((t, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-muted/50 text-xl flex items-center justify-center border border-border group-hover:border-honey/40 transition-colors">{t.icon}</div>
                            <div className="flex-1 border-b border-border/50 pb-4 group-last:border-0 group-last:pb-0">
                                <div className="text-sm font-black text-foreground uppercase tracking-tight">{t.label}</div>
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{t.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </BeeYieldCard>

            {aiNarrative && (
                <BeeYieldCard className="p-8 border-honey/30 bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4 border-b border-honey/10 pb-4">
                        <Sparkles className="w-4 h-4 text-honey" />
                        <h3 className="text-xs font-black text-honey uppercase tracking-widest">Neural Logistics Strategy</h3>
                    </div>
                    <div className="prose prose-sm max-w-none prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-honey text-sm leading-relaxed">
                        {aiNarrative}
                    </div>
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
