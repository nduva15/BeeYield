import { useEffect, useState, useCallback, useMemo } from "react";
import { X, Plane, Plus, Loader2, Sparkles, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import MarkdownRenderer from "./MarkdownRenderer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getForagingZone, projectPoint } from "@/lib/pollination";

const FLORAGE_SOURCES = [
  "Acacia", "Almond", "Avocado", "Apple", "Blueberry", "Canola", "Clover", "Coffee",
  "Cucurbits", "Eucalyptus", "Macadamia", "Mango", "Sidr / Ziziphus", "Sunflower", "Wildflower mix",
];

const FLORAGE_INDICATORS = ["Sparse", "Balanced", "Rich", "Diverse", "Single-source"];

type Log = {
  id: string;
  hive_label: string;
  observed_at: string;
  bees_per_minute: number;
  pollen_loads: number;
  weather: string | null;
  florage_source: string | null;
  flight_distance_m: number | null;
  notes: string | null;
  ai_insights: string | null;
  created_at: string;
  hive_lat: number | null;
  hive_lng: number | null;
  flight_bearing_deg: number | null;
  storage_level_pct: number | null;
  nutrition_score: number | null;
  florage_indicator: string | null;
  foraging_zone: string | null;
  run_id: string | null;
  version_id: string | null;
};

type RunRow = { id: string; crop: string; created_at: string };
type RunVersion = { id: string; version_label: string; created_at: string };

export default function BeeFlightTracker({ isOpen, onClose, embedded }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [logs, setLogs] = useState<Log[]>([]);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [versions, setVersions] = useState<RunVersion[]>([]);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState("current");
  const [hiveLabel, setHiveLabel] = useState("Hive 1");
  const [observedAt, setObservedAt] = useState(new Date().toISOString().slice(0, 16));
  const [hiveLat, setHiveLat] = useState("");
  const [hiveLng, setHiveLng] = useState("");
  const [bpm, setBpm] = useState(0);
  const [pollen, setPollen] = useState(0);
  const [weather, setWeather] = useState("Clear, 24C");
  const [florage, setFlorage] = useState(FLORAGE_SOURCES[0]);
  const [florageIndicator, setFlorageIndicator] = useState(FLORAGE_INDICATORS[1]);
  const [distance, setDistance] = useState(500);
  const [flightBearingDeg, setFlightBearingDeg] = useState(90);
  const [storageLevelPct, setStorageLevelPct] = useState(65);
  const [nutritionScore, setNutritionScore] = useState(72);
  const [notes, setNotes] = useState("");
  const [ai, setAi] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [counterRunning, setCounterRunning] = useState(false);
  const [counter, setCounter] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (!counterRunning) return;
    if (secondsLeft <= 0) {
      setCounterRunning(false);
      setBpm(counter);
      toast.success(`Counted ${counter} bees in 60s`);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(t);
  }, [counterRunning, secondsLeft, counter]);

  const startCounter = () => {
    setCounter(0);
    setSecondsLeft(60);
    setCounterRunning(true);
  };

  const load = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [logRes, runRes] = await Promise.all([
      (supabase as any).from("bee_flight_logs").select("*").eq("device_id", deviceId).order("observed_at", { ascending: false }).limit(50),
      supabase.from("harvest_runs").select("id,crop,created_at").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(20),
    ]);
    if (logRes.data) setLogs(logRes.data as Log[]);
    if (runRes.data) setRuns(runRes.data as RunRow[]);
  }, [deviceId]);

  useEffect(() => { if (isOpen || embedded) load(); }, [isOpen, embedded, load]);

  useEffect(() => {
    if (!selectedRunId) {
      setVersions([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("harvest_run_versions")
        .select("id,version_label,created_at")
        .eq("run_id", selectedRunId)
        .order("created_at", { ascending: false });
      setVersions((data || []) as RunVersion[]);
    })();
  }, [selectedRunId]);

  const saveLog = async () => {
    setSaving(true);
    const anchor =
      hiveLat && hiveLng
        ? { lat: Number(hiveLat), lng: Number(hiveLng) }
        : null;
    const flightPath = anchor
      ? [anchor, projectPoint(anchor, flightBearingDeg, distance)]
      : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("bee_flight_logs").insert({
      run_id: selectedRunId || null,
      version_id: selectedVersionId !== "current" ? selectedVersionId : null,
      device_id: deviceId,
      hive_label: hiveLabel,
      observed_at: observedAt ? new Date(observedAt).toISOString() : new Date().toISOString(),
      bees_per_minute: bpm,
      pollen_loads: pollen,
      weather,
      florage_source: florage,
      flight_distance_m: distance,
      hive_lat: anchor?.lat ?? null,
      hive_lng: anchor?.lng ?? null,
      flight_bearing_deg: flightBearingDeg,
      flight_path: flightPath,
      foraging_zone: getForagingZone(distance),
      storage_level_pct: storageLevelPct,
      nutrition_score: nutritionScore,
      florage_indicator: florageIndicator,
      notes: notes || null,
      ai_insights: ai || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Save failed");
      return;
    }
    toast.success("Flight log saved");
    load();
  };

  const runAI = async () => {
    setAiLoading(true);
    setAi("");
    try {
      const prompt = `As Beeyield AI, analyze this bee flight + foraging snapshot and combine it with bloom phenology context to give expert recommendations.\n\nHive: ${hiveLabel}\nObserved at: ${observedAt}\nForager rate: ${bpm} bees/min entering\nPollen loads observed: ${pollen}/min\nFlorage source: ${florage}\nFlorage indicator: ${florageIndicator}\nMean flight distance: ${distance} m\nFlight bearing: ${flightBearingDeg} degrees\nForaging zone: ${getForagingZone(distance)}\nStorage level: ${storageLevelPct}%\nNutrition score: ${nutritionScore}/100\nWeather: ${weather}\nNotes: ${notes || "(none)"}\n\nProvide: colony-strength estimate, foraging-zone health, bloom-stage inference, expected nectar inflow (kg/day), and 5 expert recommendations.`;
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], promptVariant: "flight-only" }),
      });
      if (!resp.ok || !resp.body) {
        toast.error("AI request failed");
        setAiLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;

      while (!done) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        buf += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) {
              acc += chunk;
              setAi(acc);
            }
          } catch {
            // streaming partial
          }
        }
      }
    } finally {
      setAiLoading(false);
    }
  };

  const trend = useMemo(
    () =>
      [...logs].reverse().map((log, index) => ({
        idx: index + 1,
        date: new Date(log.observed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        bpm: log.bees_per_minute,
        pollen: log.pollen_loads,
      })),
    [logs],
  );

  const exportCSV = () => {
    const rows = [
      ["hive", "observed_at", "bees_per_minute", "pollen_loads", "florage", "indicator", "weather", "distance_m", "zone", "storage_pct", "nutrition_score", "lat", "lng", "notes"],
      ...logs.map((log) => [
        log.hive_label,
        log.observed_at,
        String(log.bees_per_minute),
        String(log.pollen_loads),
        log.florage_source || "",
        log.florage_indicator || "",
        log.weather || "",
        String(log.flight_distance_m || ""),
        log.foraging_zone || "",
        String(log.storage_level_pct || ""),
        String(log.nutrition_score || ""),
        String(log.hive_lat || ""),
        String(log.hive_lng || ""),
        (log.notes || "").replace(/\n/g, " "),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `beeyield-flights-${Date.now()}.csv`;
    a.click();
    toast.success("Flights CSV exported");
  };

  if (!isOpen && !embedded) return null;

  const containerClasses = embedded 
    ? "relative w-full h-full" 
    : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll";
  
  const contentClasses = embedded 
    ? "w-full" 
    : "max-w-5xl mx-auto p-6";

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {!embedded && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Plane className="w-7 h-7 text-honey" />
              <div>
                <h1 className="font-display text-2xl font-bold text-honey">Bee Flight & Activity Tracker</h1>
                <p className="text-xs text-muted-foreground">Foraging zones, activity counter, flight paths, and storage or nutrition indicators</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-5 rounded-xl border border-honey/40 bg-honey/5 mb-4 flex items-center gap-4 flex-wrap">
          <div>
            <div className="text-xs text-muted-foreground mb-1">60-second hive entrance counter</div>
            <div className="font-display text-3xl font-bold text-honey">
              {counter} <span className="text-sm text-muted-foreground">bees · {secondsLeft}s left</span>
            </div>
          </div>
          {counterRunning ? (
            <button onClick={() => setCounter((value) => value + 1)} className="flex-1 min-w-[160px] h-16 rounded-xl bg-gradient-amber text-primary-foreground text-lg font-bold">
              +1 bee
            </button>
          ) : (
            <button onClick={startCounter} className="px-5 h-12 rounded-lg border border-honey/40 text-honey hover:bg-honey/10 font-semibold">
              Start 60s count
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 rounded-xl border border-border bg-muted/30">
          <Field label="Saved run">
            <select value={selectedRunId} onChange={(e) => { setSelectedRunId(e.target.value); setSelectedVersionId("current"); }} className={inputCls}>
              <option value="">Not linked to a run</option>
              {runs.map((run) => (
                <option key={run.id} value={run.id}>{run.crop} · {new Date(run.created_at).toLocaleDateString()}</option>
              ))}
            </select>
          </Field>
          <Field label="Saved version">
            <select value={selectedVersionId} onChange={(e) => setSelectedVersionId(e.target.value)} className={inputCls} disabled={!selectedRunId}>
              <option value="current">Current run</option>
              {versions.map((version) => (
                <option key={version.id} value={version.id}>{version.version_label}</option>
              ))}
            </select>
          </Field>
          <Field label="Hive label"><input value={hiveLabel} onChange={(e) => setHiveLabel(e.target.value)} className={inputCls} /></Field>
          <Field label="Observed at"><input type="datetime-local" value={observedAt} onChange={(e) => setObservedAt(e.target.value)} className={inputCls} /></Field>
          <Field label="Hive latitude"><input type="number" value={hiveLat} onChange={(e) => setHiveLat(e.target.value)} className={inputCls} placeholder="-2.4078" /></Field>
          <Field label="Hive longitude"><input type="number" value={hiveLng} onChange={(e) => setHiveLng(e.target.value)} className={inputCls} placeholder="37.9658" /></Field>
          <Field label="Florage source">
            <select value={florage} onChange={(e) => setFlorage(e.target.value)} className={inputCls}>
              {FLORAGE_SOURCES.map((source) => <option key={source}>{source}</option>)}
            </select>
          </Field>
          <Field label="Florage indicator">
            <select value={florageIndicator} onChange={(e) => setFlorageIndicator(e.target.value)} className={inputCls}>
              {FLORAGE_INDICATORS.map((indicator) => <option key={indicator}>{indicator}</option>)}
            </select>
          </Field>
          <Field label={`Bees/min entering: ${bpm}`}><input type="range" min={0} max={300} value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-full accent-honey" /></Field>
          <Field label={`Pollen loads/min: ${pollen}`}><input type="range" min={0} max={150} value={pollen} onChange={(e) => setPollen(+e.target.value)} className="w-full accent-honey" /></Field>
          <Field label={`Mean flight distance: ${distance} m`}><input type="range" min={50} max={3000} step={50} value={distance} onChange={(e) => setDistance(+e.target.value)} className="w-full accent-honey" /></Field>
          <Field label={`Flight bearing: ${flightBearingDeg}°`}><input type="range" min={0} max={359} value={flightBearingDeg} onChange={(e) => setFlightBearingDeg(+e.target.value)} className="w-full accent-honey" /></Field>
          <Field label={`Storage level: ${storageLevelPct}%`}><input type="range" min={0} max={100} value={storageLevelPct} onChange={(e) => setStorageLevelPct(+e.target.value)} className="w-full accent-honey" /></Field>
          <Field label={`Nutrition score: ${nutritionScore}/100`}><input type="range" min={0} max={100} value={nutritionScore} onChange={(e) => setNutritionScore(+e.target.value)} className="w-full accent-honey" /></Field>
          <Field label="Weather"><input value={weather} onChange={(e) => setWeather(e.target.value)} className={inputCls} /></Field>
          <Field label="Computed zone">
            <input value={getForagingZone(distance)} className={inputCls} readOnly />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputCls} resize-y`} /></Field>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <button onClick={runAI} disabled={aiLoading} className="px-4 py-2.5 rounded-lg bg-gradient-amber text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI flight insights
          </button>
          <button onClick={saveLog} disabled={saving} className="px-4 py-2.5 rounded-lg border border-honey/40 bg-honey/5 text-honey font-medium flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Save log
          </button>
          <button onClick={exportCSV} className="px-4 py-2.5 rounded-lg border border-border flex items-center justify-center gap-2">
            <FileSpreadsheet className="w-4 h-4" /> CSV
          </button>
        </div>

        {ai && (
          <div className="p-5 rounded-xl border border-honey/30 bg-card mb-4">
            <MarkdownRenderer content={ai} />
          </div>
        )}

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

        <div className="p-4 rounded-xl border border-border bg-card">
          <h3 className="font-display text-sm font-bold text-foreground mb-3">Recent saved logs ({logs.length})</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto custom-scroll">
            {logs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg border border-border bg-muted/20 text-sm">
                <div className="font-semibold text-foreground">{log.hive_label} · {log.bees_per_minute}/min</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(log.observed_at).toLocaleString()} · {log.florage_source || "—"} · {log.foraging_zone || getForagingZone(log.flight_distance_m)} zone
                </div>
                <div className="text-xs text-muted-foreground">
                  storage {log.storage_level_pct ?? "—"}% · nutrition {log.nutrition_score ?? "—"}/100 · {log.florage_indicator || "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
