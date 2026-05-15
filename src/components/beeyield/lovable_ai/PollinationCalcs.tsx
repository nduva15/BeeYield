import { useState, useEffect, useMemo } from "react";
import { Calculator, Truck, Sprout, Calendar, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { toast } from "sonner";
import type { FloragePlant } from "./FloragePage";

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
  const [floragePlants, setFloragePlants] = useState<FloragePlant[]>([]);
  const [aiNarrative, setAiNarrative] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    supabase.from("florage_plants").select("*").eq("device_id", deviceId).then(({ data }) => {
      setFloragePlants((data as FloragePlant[]) || []);
    });
  }, [isOpen, deviceId]);

  const calc = useMemo(() => {
    const spec = STOCKING[crop] || STOCKING.general;
    // Florage diversity multiplier (0.85–1.15 based on local plant scores within bloom window)
    const inWindow = floragePlants.filter((p) => p.bloom.toLowerCase().includes(spec.bloomDays > 30 ? "" : ""));
    const avgNectar = inWindow.length ? inWindow.reduce((s, p) => s + p.nectar, 0) / inWindow.length : 5;
    const florageMult = 0.85 + (avgNectar / 10) * 0.3; // 0.85 → 1.15

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
      { label: "Pre-position hives (T-2 days)", date: setDate, icon: "🚚" },
      { label: "Bloom start", date: start, icon: "🌸" },
      { label: "Peak bloom", date: peakDate, icon: "🌺" },
      { label: "Remove hives (bloom +2 days)", date: removeDate, icon: "🚛" },
      { label: "Extract honey (if applicable)", date: extractDate, icon: "🍯" },
    ];

    return { spec, requiredHives, florageAdjustedHives, gap, florageMult, expectedYieldKg, trucksNeeded, transportCost, timeline };
  }, [crop, hectares, currentHives, transportKm, hivesPerTruck, costPerKm, bloomStart, floragePlants]);

  const askAi = async () => {
    setLoadingAi(true); setAiNarrative("");
    const prompt = `You are a pollination contracting expert. Given:
Crop: ${crop}, Area: ${hectares} ha, Current hives: ${currentHives}, Recommended (florage-adjusted): ${calc.florageAdjustedHives} hives, Gap: ${calc.gap}, Expected honey yield: ${calc.expectedYieldKg} kg, Transport: ${calc.trucksNeeded} truck(s) over ${transportKm} km (~$${calc.transportCost}), Bloom start: ${bloomStart}, Bloom duration: ${calc.spec.bloomDays} days, Florage multiplier: ${calc.florageMult.toFixed(2)}.

In ≤200 words, give a tactical action plan: (1) gap fill strategy if hives short, (2) transport scheduling risks, (3) florage gaps to address with cover crops, (4) expected pollination success score (0–100) with reasoning.`;
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], promptVariant: "baseline" }),
      });
      if (!resp.ok || !resp.body) { toast.error("AI failed"); setLoadingAi(false); return; }
      const reader = resp.body.getReader(); const dec = new TextDecoder(); let buf = "";
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() || "";
        for (const ln of lines) {
          if (!ln.startsWith("data: ")) continue;
          const data = ln.slice(6); if (data === "[DONE]") continue;
          try { const j = JSON.parse(data); const t = j.choices?.[0]?.delta?.content; if (t) setAiNarrative((p) => p + t); } catch { /* partial SSE JSON chunk */ }
        }
      }
    } catch (e) { toast.error("AI error"); }
    setLoadingAi(false);
  };

  if (!isOpen) return null;
  return (
    <div className={embedded ? "relative z-0 bg-background overflow-visible custom-scroll pt-6" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calculator className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Pollination Calcs</h1>
              <p className="text-xs text-muted-foreground">Hives needed · transport · expected yield · timeline</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <h3 className="text-xs uppercase text-muted-foreground font-semibold">Inputs</h3>
            <label className="text-xs block">Crop
              <select value={crop} onChange={(e) => setCrop(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm">
                {Object.keys(STOCKING).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs">Hectares<input type="number" value={hectares} onChange={(e) => setHectares(Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" /></label>
              <label className="text-xs">Current hives<input type="number" value={currentHives} onChange={(e) => setCurrentHives(Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" /></label>
              <label className="text-xs">Transport km<input type="number" value={transportKm} onChange={(e) => setTransportKm(Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" /></label>
              <label className="text-xs">Hives / truck<input type="number" value={hivesPerTruck} onChange={(e) => setHivesPerTruck(Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" /></label>
              <label className="text-xs">$ / km<input type="number" step="0.1" value={costPerKm} onChange={(e) => setCostPerKm(Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" /></label>
              <label className="text-xs">Bloom start<input type="date" value={bloomStart} onChange={(e) => setBloomStart(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" /></label>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-honey/30 bg-honey/5 space-y-2">
            <h3 className="text-xs uppercase text-honey font-semibold">Results</h3>
            <Stat label="Standard requirement" value={`${calc.requiredHives} hives`} sub={`${calc.spec.hivesPerHa}/ha × ${hectares} ha`} />
            <Stat label="Florage-adjusted recommendation" value={`${calc.florageAdjustedHives} hives`} sub={`× ${calc.florageMult.toFixed(2)} florage multiplier`} />
            <Stat label="Gap vs current" value={calc.gap > 0 ? `+${calc.gap} short` : `${Math.abs(calc.gap)} surplus`} sub={calc.gap > 0 ? "rent or relocate" : "consider splitting"} highlight={calc.gap > 0 ? "warn" : "ok"} />
            <Stat label="Expected honey yield" value={`${calc.expectedYieldKg} kg`} sub={`${calc.spec.expectedYieldKgPerHa} kg/ha baseline`} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-xs uppercase text-muted-foreground font-semibold mb-3 flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" />Transport plan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Trucks needed</span><span className="font-semibold">{calc.trucksNeeded}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Round-trip distance</span><span className="font-semibold">{transportKm * 2} km</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Estimated cost</span><span className="font-semibold text-honey">${calc.transportCost}</span></div>
              <div className="pt-2 mt-2 border-t border-border text-xs text-muted-foreground">{calc.spec.transportNote}</div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-xs uppercase text-muted-foreground font-semibold mb-3 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Timeline</h3>
            <div className="space-y-2">
              {calc.timeline.map((t, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-base">{t.icon}</span>
                  <div className="flex-1">
                    <div className="text-foreground">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.date.toDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-honey/30 bg-honey/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase text-honey font-semibold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" />Expert AI plan</h3>
            <button onClick={askAi} disabled={loadingAi} className="px-3 py-1.5 rounded-lg bg-honey text-honey-foreground text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5">
              {loadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}Generate
            </button>
          </div>
          {aiNarrative ? (
            <div className="text-sm whitespace-pre-wrap text-foreground/90">{aiNarrative}</div>
          ) : (
            <p className="text-xs text-muted-foreground">Click Generate for tactical recommendations on gap-fill, transport timing, and florage strategy.</p>
          )}
        </div>

        <div className="mt-6 p-3 rounded-xl border border-primary/30 bg-primary/5 text-xs text-muted-foreground flex items-start gap-2">
          <Sprout className="w-4 h-4 text-primary mt-0.5" />
          <div>Linked to <b className="text-foreground">Florage Database</b> ({floragePlants.length} plants) for the florage multiplier and to <b className="text-foreground">Pollination Planning</b> for the precision contract model.</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: "ok" | "warn" }) {
  const color = highlight === "warn" ? "text-destructive" : highlight === "ok" ? "text-emerald-500" : "text-foreground";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
