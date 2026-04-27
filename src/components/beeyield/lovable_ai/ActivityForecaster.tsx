import { useState, useEffect, useCallback } from "react";
import { X, CloudSun, Loader2, Sparkles, Plane, History as HistoryIcon } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from "recharts";
import MarkdownRenderer from "./MarkdownRenderer";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { evaluateAlerts } from "./AlertsPage";

// Open-Meteo: free, no API key. Hourly temp + wind + precip for next 7 days.
// Activity prediction model: bees/min ≈ baseline × tempFactor × windFactor × precipFactor × florageFactor
//   tempFactor: 0 below 12°C, ramps to 1.0 at 18-28°C, drops to 0.5 above 35°C
//   windFactor: 1.0 below 8 km/h, drops linearly to 0.3 at 30 km/h, 0 above
//   precipFactor: 1.0 dry, 0.4 light rain (<1mm), 0 above
//   florageFactor: user-supplied 0.5–1.5 (low/avg/high)

type Forecast = { date: string; hour: number; tempC: number; windKmh: number; precipMm: number; predictedBpm: number; band: string };

export default function ActivityForecaster({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [hiveLabel, setHiveLabel] = useState("Hive 1");
  const [lat, setLat] = useState("-2.4078");
  const [lng, setLng] = useState("37.9658");
  const [baseline, setBaseline] = useState(100);
  const [florageScore, setFlorageScore] = useState(1.0);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [history, setHistory] = useState<{ date: string; predicted: number; actual: number | null }[]>([]);

  const fetchForecast = async () => {
    setLoading(true); setAiText("");
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,wind_speed_10m,precipitation&forecast_days=7&timezone=auto`;
      const r = await fetch(url);
      if (!r.ok) { toast.error("Open-Meteo request failed"); setLoading(false); return; }
      const data = await r.json();
      const times: string[] = data.hourly?.time || [];
      const temps: number[] = data.hourly?.temperature_2m || [];
      const winds: number[] = data.hourly?.wind_speed_10m || [];
      const precs: number[] = data.hourly?.precipitation || [];
      const out: Forecast[] = [];
      for (let i = 0; i < times.length; i++) {
        const t = temps[i]; const w = winds[i]; const p = precs[i];
        const hour = parseInt(times[i].slice(11, 13));
        if (hour < 7 || hour > 19) continue; // bees inactive at night
        const tF = t < 12 ? 0 : t < 18 ? (t - 12) / 6 : t < 28 ? 1 : t < 35 ? 1 - (t - 28) * 0.07 : 0.5;
        const wF = w < 8 ? 1 : w < 30 ? 1 - ((w - 8) * 0.7 / 22) : 0;
        const pF = p < 0.1 ? 1 : p < 1 ? 0.4 : 0;
        const bpm = Math.round(baseline * tF * wF * pF * florageScore);
        const band = bpm < 20 ? "weak" : bpm < 60 ? "normal" : bpm < 120 ? "healthy" : bpm < 250 ? "strong" : "peak";
        out.push({ date: times[i].slice(5, 10), hour, tempC: t, windKmh: w, precipMm: p, predictedBpm: bpm, band });
      }
      setForecast(out);
      toast.success(`Loaded ${out.length} hourly forecasts`);

      // Persist daily snapshots + evaluate alerts (today only, to avoid spam)
      const dayMap = new Map<string, Forecast[]>();
      for (const f of out) {
        const key = `2025-${f.date}`; // simple ISO; year not critical for compare
        if (!dayMap.has(key)) dayMap.set(key, []);
        dayMap.get(key)!.push(f);
      }
      const today = new Date().toISOString().slice(0, 10);
      const snapshots = Array.from(dayMap.entries()).map(([dateKey, pts]) => ({
        device_id: deviceId,
        hive_label: hiveLabel,
        forecast_for_date: dateKey,
        predicted_bees_per_min: Math.round(pts.reduce((s, p) => s + p.predictedBpm, 0) / pts.length),
        temp_c: Math.round((pts.reduce((s, p) => s + p.tempC, 0) / pts.length) * 10) / 10,
        wind_kmh: Math.round((pts.reduce((s, p) => s + p.windKmh, 0) / pts.length) * 10) / 10,
        precip_mm: Math.round((pts.reduce((s, p) => s + p.precipMm, 0) / pts.length) * 10) / 10,
        band: pts[0]?.band || "normal",
      }));
      await (supabase as any).from("forecast_snapshots").insert(snapshots);
      const todaySnap = snapshots.find((s) => s.forecast_for_date.endsWith(today.slice(5)));
      if (todaySnap) {
        await evaluateAlerts(deviceId, { hive_label: hiveLabel, metric: "predicted_bees_per_min", value: todaySnap.predicted_bees_per_min });
        await evaluateAlerts(deviceId, { hive_label: hiveLabel, metric: "wind_kmh", value: todaySnap.wind_kmh });
        await evaluateAlerts(deviceId, { hive_label: hiveLabel, metric: "temp_c", value: todaySnap.temp_c });
      }
      loadHistory();
    } catch (e) { console.error(e); toast.error("Forecast failed"); }
    finally { setLoading(false); }
  };

  const loadHistory = useCallback(async () => {
    const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);
    const [{ data: snaps }, { data: actuals }] = await Promise.all([
      (supabase as any).from("forecast_snapshots").select("forecast_for_date,predicted_bees_per_min")
        .eq("device_id", deviceId).eq("hive_label", hiveLabel)
        .gte("created_at", sevenAgo.toISOString()).order("forecast_for_date", { ascending: true }),
      supabase.from("bee_flight_logs").select("observed_at,bees_per_minute")
        .eq("device_id", deviceId).eq("hive_label", hiveLabel)
        .gte("observed_at", sevenAgo.toISOString()).order("observed_at", { ascending: true }),
    ]);
    // Aggregate by date
    const map = new Map<string, { predicted: number[]; actual: number[] }>();
    for (const s of ((snaps || []) as { forecast_for_date: string; predicted_bees_per_min: number }[])) {
      const d = s.forecast_for_date.slice(0, 10);
      if (!map.has(d)) map.set(d, { predicted: [], actual: [] });
      map.get(d)!.predicted.push(s.predicted_bees_per_min);
    }
    for (const a of (actuals as { observed_at: string; bees_per_minute: number }[]) || []) {
      const d = a.observed_at.slice(0, 10);
      if (!map.has(d)) map.set(d, { predicted: [], actual: [] });
      map.get(d)!.actual.push(a.bees_per_minute);
    }
    const rows = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date: date.slice(5),
        predicted: v.predicted.length ? Math.round(v.predicted.reduce((s, x) => s + x, 0) / v.predicted.length) : 0,
        actual: v.actual.length ? Math.round(v.actual.reduce((s, x) => s + x, 0) / v.actual.length) : null,
      }));
    setHistory(rows);
  }, [deviceId, hiveLabel]);

  useEffect(() => { if (isOpen) loadHistory(); }, [isOpen, loadHistory]);

  const runAI = async () => {
    if (forecast.length === 0) { toast.error("Fetch forecast first"); return; }
    setAiLoading(true); setAiText("");
    const peakDay = [...new Set(forecast.map(f => f.date))].map(d => {
      const dayPoints = forecast.filter(f => f.date === d);
      const avgBpm = Math.round(dayPoints.reduce((s, p) => s + p.predictedBpm, 0) / dayPoints.length);
      return { date: d, avgBpm };
    });
    const prompt = `As Beeyield AI, write a **7-Day Bee Activity Forecast Report** for an apiary at lat ${lat}, lng ${lng}.

Inputs:
- Baseline activity: ${baseline} bees/min (peak-season estimate)
- Florage abundance multiplier: ${florageScore}× (1.0 = average, >1 abundant, <1 dearth)
- Daily averages (predicted bees/min, daylight hours only): ${peakDay.map(d => `${d.date}=${d.avgBpm}`).join(", ")}

Provide: (1) best foraging day & why; (2) weakest day & cause (cold/wind/rain); (3) hive-management actions per day band (feed, inspect, harvest, swarm-watch); (4) supplementary feeding recommendations.`;
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], promptVariant: "flight" }),
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

  const dailyAverage = [...new Set(forecast.map(f => f.date))].map(d => {
    const pts = forecast.filter(f => f.date === d);
    return {
      date: d,
      avgBpm: Math.round(pts.reduce((s, p) => s + p.predictedBpm, 0) / pts.length),
      avgTemp: Math.round((pts.reduce((s, p) => s + p.tempC, 0) / pts.length) * 10) / 10,
      avgWind: Math.round((pts.reduce((s, p) => s + p.windKmh, 0) / pts.length) * 10) / 10,
    };
  });

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CloudSun className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Bee Activity Forecaster</h1>
              <p className="text-xs text-muted-foreground">7-day activity prediction · Open-Meteo weather × florage × baseline</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 p-4 rounded-xl border border-border bg-muted/30">
          <Field label="Hive label"><input value={hiveLabel} onChange={(e) => setHiveLabel(e.target.value)} className={inputCls} /></Field>
          <Field label="Latitude"><input value={lat} onChange={(e) => setLat(e.target.value)} className={inputCls} /></Field>
          <Field label="Longitude"><input value={lng} onChange={(e) => setLng(e.target.value)} className={inputCls} /></Field>
          <Field label="Baseline bees/min"><input type="number" value={baseline} onChange={(e) => setBaseline(+e.target.value)} className={inputCls} /></Field>
          <Field label={`Florage score: ${florageScore.toFixed(1)}×`}><input type="range" min={0.5} max={1.5} step={0.1} value={florageScore} onChange={(e) => setFlorageScore(+e.target.value)} className="w-full accent-honey" /></Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <button onClick={fetchForecast} disabled={loading} className="px-4 py-2.5 rounded-lg bg-gradient-amber text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudSun className="w-4 h-4" />} Fetch 7-day forecast</button>
          <button onClick={runAI} disabled={aiLoading || forecast.length === 0} className="px-4 py-2.5 rounded-lg border border-honey/40 bg-honey/5 text-honey font-medium flex items-center justify-center gap-2 disabled:opacity-50">{aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI forecast narrative</button>
        </div>

        {dailyAverage.length > 0 && (
          <div className="p-4 rounded-xl border border-border bg-card mb-4">
            <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Plane className="w-4 h-4 text-honey" /> Daily predicted activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={dailyAverage}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="avgBpm" stroke="hsl(38,92%,50%)" fill="hsl(38,92%,50%)" fillOpacity={0.3} name="Predicted bees/min" />
                <Line yAxisId="right" type="monotone" dataKey="avgTemp" stroke="hsl(0,84%,60%)" strokeWidth={2} name="Avg °C" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="avgWind" stroke="hsl(217,91%,60%)" strokeWidth={2} name="Wind km/h" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {history.length > 0 && (
          <div className="p-4 rounded-xl border border-border bg-card mb-4">
            <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2"><HistoryIcon className="w-4 h-4 text-honey" /> Last 7 days · predicted vs actual ({hiveLabel})</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Line type="monotone" dataKey="predicted" stroke="hsl(38,92%,50%)" strokeWidth={2} name="Predicted bees/min" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="actual" stroke="hsl(142,71%,45%)" strokeWidth={2} name="Actual logged" dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 text-[11px] text-muted-foreground">Actuals come from <b>Bee Flight Tracker</b> entries for this hive label. Days with no entry show predicted only.</div>
          </div>
        )}

        {aiText && <div className="p-5 rounded-xl border border-honey/30 bg-card mb-4"><MarkdownRenderer content={aiText} /></div>}


        <div className="p-3 rounded-lg border border-honey/30 bg-honey/5 text-xs">
          <b className="text-honey">Linked tools:</b> Forecast feeds <b>Pollination Planning</b> (effective forager-days), <b>MOA View</b> (activity panel), and <b>Bee Flight Tracker</b> (compare predicted vs observed).
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>{children}</div>;
}
