import { useEffect, useState, useCallback, useMemo } from "react";
import { X, Plane, Plus, Loader2, Sparkles, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import MarkdownRenderer from "./MarkdownRenderer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const FLORAGE_SOURCES = [
  "Acacia", "Almond", "Avocado", "Apple", "Blueberry", "Canola", "Clover", "Coffee",
  "Cucurbits", "Eucalyptus", "Macadamia", "Mango", "Sidr / Ziziphus", "Sunflower", "Wildflower mix",
];

type Log = {
  id: string; hive_label: string; observed_at: string;
  bees_per_minute: number; pollen_loads: number;
  weather: string | null; florage_source: string | null; flight_distance_m: number | null;
  notes: string | null; ai_insights: string | null; created_at: string;
};

export default function BeeFlightTracker({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const deviceId = useDeviceId();
  const [logs, setLogs] = useState<Log[]>([]);
  const [hiveLabel, setHiveLabel] = useState("Hive 1");
  const [bpm, setBpm] = useState(0);
  const [pollen, setPollen] = useState(0);
  const [weather, setWeather] = useState("Clear, 24°C");
  const [florage, setFlorage] = useState(FLORAGE_SOURCES[0]);
  const [distance, setDistance] = useState(500);
  const [notes, setNotes] = useState("");
  const [ai, setAi] = useState(""); const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Activity counter — increments bpm on click for a 60s window
  const [counterRunning, setCounterRunning] = useState(false);
  const [counter, setCounter] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (!counterRunning) return;
    if (secondsLeft <= 0) { setCounterRunning(false); setBpm(counter); toast.success(`Counted ${counter} bees in 60s`); return; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [counterRunning, secondsLeft, counter]);

  const startCounter = () => { setCounter(0); setSecondsLeft(60); setCounterRunning(true); };

  const load = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).from("bee_flight_logs").select("*").eq("device_id", deviceId).order("observed_at", { ascending: false }).limit(50);
    if (data) setLogs(data as Log[]);
  }, [deviceId]);
  useEffect(() => { if (isOpen) load(); }, [isOpen, load]);

  const saveLog = async () => {
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("bee_flight_logs").insert({
      device_id: deviceId, hive_label: hiveLabel,
      bees_per_minute: bpm, pollen_loads: pollen,
      weather, florage_source: florage, flight_distance_m: distance,
      notes: notes || null, ai_insights: ai || null,
    });
    setSaving(false);
    if (error) { toast.error("Save failed"); return; }
    toast.success("Flight log saved"); load();
  };

  const runAI = async () => {
    setAiLoading(true); setAi("");
    try {
      const prompt = `As Beeyield AI, analyze this bee flight + foraging snapshot and combine it with bloom phenology context to give expert recommendations.\n\nHive: ${hiveLabel}\nForager rate: ${bpm} bees/min entering\nPollen loads observed: ${pollen}/min\nFlorage source: ${florage}\nMean flight distance: ${distance} m\nWeather: ${weather}\nNotes: ${notes || "(none)"}\n\nProvide: colony-strength estimate, foraging-zone health, bloom-stage inference, expected nectar inflow (kg/day), and 5 expert recommendations.`;
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      if (!resp.ok || !resp.body) { toast.error("AI request failed"); setAiLoading(false); return; }
      const reader = resp.body.getReader(); const dec = new TextDecoder(); let buf = ""; let acc = ""; let done = false;
      while (!done) {
        const { done: rd, value } = await reader.read(); if (rd) break;
        buf += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { done = true; break; }
          try { const p = JSON.parse(j); const c = p.choices?.[0]?.delta?.content; if (c) { acc += c; setAi(acc); } } catch { /* partial */ }
        }
      }
    } finally { setAiLoading(false); }
  };

  const trend = useMemo(() => [...logs].reverse().map((l, i) => ({ idx: i + 1, date: new Date(l.observed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }), bpm: l.bees_per_minute, pollen: l.pollen_loads })), [logs]);

  const exportCSV = () => {
    const rows = [["hive","observed_at","bees_per_minute","pollen_loads","florage","weather","distance_m","notes"], ...logs.map((l) => [l.hive_label,l.observed_at,String(l.bees_per_minute),String(l.pollen_loads),l.florage_source||"",l.weather||"",String(l.flight_distance_m||""),(l.notes||"").replace(/\n/g," ")])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `beeyield-flights-${Date.now()}.csv`; a.click();
    toast.success("Flights CSV exported");
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><Plane className="w-7 h-7 text-honey" />
            <div><h1 className="font-display text-2xl font-bold text-honey">Bee Flight & Activity Tracker</h1>
              <p className="text-xs text-muted-foreground">Foraging zones · activity counter · florage source · AI flight-path insights</p></div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        {/* Activity counter */}
        <div className="p-5 rounded-xl border border-honey/40 bg-honey/5 mb-4 flex items-center gap-4 flex-wrap">
          <div>
            <div className="text-xs text-muted-foreground mb-1">60-second hive entrance counter</div>
            <div className="font-display text-3xl font-bold text-honey">{counter} <span className="text-sm text-muted-foreground">bees · {secondsLeft}s left</span></div>
          </div>
          {counterRunning ? (
            <button onClick={() => setCounter((c) => c + 1)} className="flex-1 min-w-[160px] h-16 rounded-xl bg-gradient-amber text-primary-foreground text-lg font-bold">+1 bee</button>
          ) : (
            <button onClick={startCounter} className="px-5 h-12 rounded-lg border border-honey/40 text-honey hover:bg-honey/10 font-semibold">Start 60s count</button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 rounded-xl border border-border bg-muted/30">
          <Field label="Hive label"><input value={hiveLabel} onChange={(e) => setHiveLabel(e.target.value)} className={inputCls} /></Field>
          <Field label="Florage source"><select value={florage} onChange={(e) => setFlorage(e.target.value)} className={inputCls}>{FLORAGE_SOURCES.map((f) => <option key={f}>{f}</option>)}</select></Field>
          <Field label={`Bees/min entering: ${bpm}`}><input type="range" min={0} max={300} value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-full accent-honey" /></Field>
          <Field label={`Pollen loads/min: ${pollen}`}><input type="range" min={0} max={150} value={pollen} onChange={(e) => setPollen(+e.target.value)} className="w-full accent-honey" /></Field>
          <Field label={`Mean flight distance: ${distance} m`}><input type="range" min={50} max={3000} step={50} value={distance} onChange={(e) => setDistance(+e.target.value)} className="w-full accent-honey" /></Field>
          <Field label="Weather"><input value={weather} onChange={(e) => setWeather(e.target.value)} className={inputCls} /></Field>
          <div className="md:col-span-2"><Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputCls} resize-y`} /></Field></div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <button onClick={runAI} disabled={aiLoading} className="px-4 py-2.5 rounded-lg bg-gradient-amber text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50">{aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI flight insights</button>
          <button onClick={saveLog} disabled={saving} className="px-4 py-2.5 rounded-lg border border-honey/40 bg-honey/5 text-honey font-medium flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Save log</button>
          <button onClick={exportCSV} className="px-4 py-2.5 rounded-lg border border-border flex items-center justify-center gap-2"><FileSpreadsheet className="w-4 h-4" /> CSV</button>
        </div>

        {ai && (<div className="p-5 rounded-xl border border-honey/30 bg-card mb-4"><MarkdownRenderer content={ai} /></div>)}

        {trend.length >= 2 && (
          <div className="p-4 rounded-xl border border-border bg-card mb-4">
            <h3 className="font-display text-sm font-bold text-foreground mb-2">Activity trend</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="bpm" name="bees/min" stroke="hsl(var(--honey))" strokeWidth={2} />
                  <Line type="monotone" dataKey="pollen" name="pollen/min" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>{children}</div>; }
