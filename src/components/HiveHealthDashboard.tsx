import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X, HeartPulse, RefreshCw, AlertTriangle, Loader2, CloudSun, Activity, AudioLines,
  ClipboardList, Bug, Thermometer, Droplets, Wind, ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { toast } from "sonner";

type Inspection = {
  id: string;
  inspected_on: string;
  hive_label: string;
  location: string;
  colony_health: string;
  brood_frames: number;
  honey_frames: number;
  varroa_count: number;
  queen_seen: boolean;
  queen_cells: number;
};

type Audit = {
  id: string;
  hive_label: string;
  recorded_at: string;
  health_state: string;
  health_confidence: number;
  piping_detected: boolean;
  disease_predictions: unknown;
};

type Weather = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  wind_speed_10m_max: number[];
};

type Alert = {
  level: "critical" | "warning" | "info";
  title: string;
  detail: string;
  hive: string;
};

const HEALTH_SCORE: Record<string, number> = {
  Thriving: 100, Strong: 90, Healthy: 85, Stable: 75, Average: 65,
  Weak: 45, Stressed: 40, Swarming: 35, Queenless: 25, Collapsing: 10, Dead: 0,
};

function scoreOf(label: string) {
  return HEALTH_SCORE[label] ?? 60;
}

const DEFAULT_LAT = -1.286389;
const DEFAULT_LNG = 36.817223;

export default function HiveHealthDashboard({
  isOpen, onClose,
}: { isOpen: boolean; onClose: () => void }) {
  const deviceId = useDeviceId();
  const [loading, setLoading] = useState(false);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [hive, setHive] = useState("all");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });

  const load = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    const [insRes, audRes] = await Promise.all([
      supabase.from("inspections").select("id, inspected_on, hive_label, location, colony_health, brood_frames, honey_frames, varroa_count, queen_seen, queen_cells")
        .eq("device_id", deviceId).order("inspected_on", { ascending: false }).limit(200),
      supabase.from("sound_analyses").select("id, hive_label, recorded_at, health_state, health_confidence, piping_detected, disease_predictions")
        .eq("device_id", deviceId).order("recorded_at", { ascending: false }).limit(200),
    ]);
    setInspections((insRes.data ?? []) as Inspection[]);
    setAudits((audRes.data ?? []) as Audit[]);
    setLoading(false);
  }, [deviceId]);

  const loadWeather = useCallback(async (lat: number, lng: number) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
        `&past_days=14&forecast_days=7&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`weather ${res.status}`);
      const json = await res.json();
      setWeather(json.daily as Weather);
    } catch {
      toast.error("Weather feed unavailable");
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    void load();
    void loadWeather(coords.lat, coords.lng);
  }, [isOpen, load, loadWeather, coords.lat, coords.lng]);

  const useMyLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation unavailable"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error("Location permission denied"),
    );
  };

  const hives = useMemo(() => {
    const set = new Set<string>();
    inspections.forEach((i) => set.add(i.hive_label));
    audits.forEach((a) => set.add(a.hive_label));
    return Array.from(set).sort();
  }, [inspections, audits]);

  const fIns = useMemo(
    () => (hive === "all" ? inspections : inspections.filter((i) => i.hive_label === hive)),
    [inspections, hive],
  );
  const fAud = useMemo(
    () => (hive === "all" ? audits : audits.filter((a) => a.hive_label === hive)),
    [audits, hive],
  );

  /** Combined daily trend: inspection score, acoustic score, varroa, weather. */
  const trend = useMemo(() => {
    const byDay = new Map<string, { date: string; inspection?: number; acoustic?: number; varroa?: number; tempMax?: number; rain?: number }>();
    const touch = (date: string) => {
      const row = byDay.get(date) ?? { date };
      byDay.set(date, row);
      return row;
    };
    for (const i of fIns) {
      const r = touch(i.inspected_on);
      r.inspection = scoreOf(i.colony_health);
      r.varroa = i.varroa_count;
    }
    for (const a of fAud) {
      const date = a.recorded_at.slice(0, 10);
      const r = touch(date);
      r.acoustic = Math.round(scoreOf(a.health_state) * (0.6 + 0.4 * Number(a.health_confidence ?? 0.5)));
    }
    if (weather) {
      weather.time.forEach((d, idx) => {
        if (!byDay.has(d)) return;
        const r = touch(d);
        r.tempMax = weather.temperature_2m_max[idx];
        r.rain = weather.precipitation_sum[idx];
      });
    }
    return Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [fIns, fAud, weather]);

  const weatherSeries = useMemo(() => {
    if (!weather) return [];
    return weather.time.map((d, i) => ({
      date: d.slice(5),
      max: weather.temperature_2m_max[i],
      min: weather.temperature_2m_min[i],
      rain: weather.precipitation_sum[i],
      wind: weather.wind_speed_10m_max[i],
    }));
  }, [weather]);

  const latestIns = fIns[0];
  const latestAud = fAud[0];

  const healthIndex = useMemo(() => {
    const parts: number[] = [];
    if (latestIns) parts.push(scoreOf(latestIns.colony_health));
    if (latestAud) parts.push(scoreOf(latestAud.health_state));
    if (latestIns) parts.push(Math.max(0, 100 - latestIns.varroa_count * 8));
    if (parts.length === 0) return null;
    return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
  }, [latestIns, latestAud]);

  const alerts = useMemo<Alert[]>(() => {
    const out: Alert[] = [];
    const perHive = hive === "all" ? hives : [hive];
    for (const h of perHive) {
      const ins = inspections.find((i) => i.hive_label === h);
      const aud = audits.find((a) => a.hive_label === h);
      if (ins && ins.varroa_count >= 10) {
        out.push({ level: "critical", hive: h, title: "Varroa above treatment threshold",
          detail: `${ins.varroa_count} mites / 300 bees on ${ins.inspected_on}. Treat within 7 days.` });
      } else if (ins && ins.varroa_count >= 5) {
        out.push({ level: "warning", hive: h, title: "Varroa load rising",
          detail: `${ins.varroa_count} mites / 300 bees — re-count in 14 days.` });
      }
      if (aud?.health_state === "Queenless") {
        out.push({ level: "critical", hive: h, title: "Acoustic model reports queenless signature",
          detail: `Confidence ${(Number(aud.health_confidence) * 100).toFixed(0)}% — inspect for eggs and consider requeening.` });
      }
      if (aud?.piping_detected) {
        out.push({ level: "warning", hive: h, title: "Queen piping detected",
          detail: "Swarm departure typically follows within 24–72 h. Check for sealed queen cells." });
      }
      if (ins && !ins.queen_seen && ins.queen_cells > 0) {
        out.push({ level: "warning", hive: h, title: "Queen cells without a sighted queen",
          detail: `${ins.queen_cells} queen cell(s) logged — verify supersedure vs swarming.` });
      }
      if (ins && ins.honey_frames <= 1) {
        out.push({ level: "info", hive: h, title: "Low stores",
          detail: `${ins.honey_frames} honey frame(s) — plan supplemental feeding.` });
      }
      const lastSeen = ins?.inspected_on ?? aud?.recorded_at?.slice(0, 10);
      if (lastSeen) {
        const days = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 86400000);
        if (days > 21) out.push({ level: "info", hive: h, title: "Inspection overdue", detail: `${days} days since the last record.` });
      }
    }
    if (weather) {
      const next = weather.time.findIndex((d) => d >= new Date().toISOString().slice(0, 10));
      if (next >= 0) {
        const rain = weather.precipitation_sum.slice(next, next + 7).reduce((a, b) => a + (b ?? 0), 0);
        const heat = Math.max(...weather.temperature_2m_max.slice(next, next + 7).map((v) => v ?? 0));
        const wind = Math.max(...weather.wind_speed_10m_max.slice(next, next + 7).map((v) => v ?? 0));
        if (rain > 60) out.push({ level: "warning", hive: "Apiary", title: "Wet week ahead",
          detail: `${rain.toFixed(0)} mm forecast — foraging will drop, watch stores.` });
        if (heat > 34) out.push({ level: "warning", hive: "Apiary", title: "Heat stress risk",
          detail: `${heat.toFixed(0)} °C peak forecast — add shade and water points.` });
        if (wind > 40) out.push({ level: "info", hive: "Apiary", title: "High winds forecast",
          detail: `${wind.toFixed(0)} km/h gusts — secure lids and stands.` });
      }
    }
    const rank = { critical: 0, warning: 1, info: 2 };
    return out.sort((a, b) => rank[a.level] - rank[b.level]);
  }, [inspections, audits, hives, hive, weather]);

  if (!isOpen) return null;

  const tone = (level: Alert["level"]) =>
    level === "critical" ? "border-destructive/40 bg-destructive/10 text-destructive"
      : level === "warning" ? "border-honey/50 bg-honey/10 text-foreground"
      : "border-border bg-muted/40 text-muted-foreground";

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <HeartPulse className="w-7 h-7 text-honey" />
            <div>
              <h2 className="font-display text-2xl font-bold">
                Hive Health <span className="text-honey">Dashboard</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Inspections, acoustic audits and live weather in one trend view.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { void load(); void loadWeather(coords.lat, coords.lng); }}
              className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
            </button>
            <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          <select value={hive} onChange={(e) => setHive(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
            <option value="all">All hives</option>
            {hives.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <button onClick={useMyLocation}
            className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted flex items-center gap-2">
            <CloudSun className="w-4 h-4" /> Use my location for weather
          </button>
          <span className="text-xs text-muted-foreground">
            {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <Kpi icon={ShieldCheck} label="Health index" value={healthIndex === null ? "—" : `${healthIndex}`} hint="inspection + acoustic + varroa" />
          <Kpi icon={ClipboardList} label="Inspections" value={String(fIns.length)} hint={latestIns ? `last ${latestIns.inspected_on}` : "none yet"} />
          <Kpi icon={AudioLines} label="Acoustic audits" value={String(fAud.length)} hint={latestAud ? latestAud.health_state : "none yet"} />
          <Kpi icon={Bug} label="Varroa (latest)" value={latestIns ? `${latestIns.varroa_count}` : "—"} hint="mites / 300 bees" />
          <Kpi icon={AlertTriangle} label="Open alerts" value={String(alerts.length)} hint={`${alerts.filter((a) => a.level === "critical").length} critical`} />
        </div>

        {/* Quick hive record entry */}
        <div className="rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-honey" /> Log a hive record
            </h3>
            <button onClick={() => setShowEntry((v) => !v)}
              className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> {showEntry ? "Hide" : "New record"}
            </button>
          </div>
          {showEntry ? (
            <div className="grid md:grid-cols-4 gap-3">
              <L label="Hive label">
                <input value={entry.hive_label} onChange={(e) => setEntry({ ...entry, hive_label: e.target.value })} className="fld" />
              </L>
              <L label="Location">
                <input value={entry.location} onChange={(e) => setEntry({ ...entry, location: e.target.value })} className="fld" />
              </L>
              <L label="Date">
                <input type="date" value={entry.inspected_on} onChange={(e) => setEntry({ ...entry, inspected_on: e.target.value })} className="fld" />
              </L>
              <L label="Colony health">
                <select value={entry.colony_health} onChange={(e) => setEntry({ ...entry, colony_health: e.target.value })} className="fld">
                  {["Thriving", "Healthy", "Stable", "Weak", "Stressed", "Queenless", "Collapsing"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </L>
              <L label="Brood frames">
                <input type="number" min={0} value={entry.brood_frames}
                  onChange={(e) => setEntry({ ...entry, brood_frames: Number(e.target.value) })} className="fld" />
              </L>
              <L label="Honey frames">
                <input type="number" min={0} value={entry.honey_frames}
                  onChange={(e) => setEntry({ ...entry, honey_frames: Number(e.target.value) })} className="fld" />
              </L>
              <L label="Varroa / 300 bees">
                <input type="number" min={0} value={entry.varroa_count}
                  onChange={(e) => setEntry({ ...entry, varroa_count: Number(e.target.value) })} className="fld" />
              </L>
              <L label="Queen cells">
                <input type="number" min={0} value={entry.queen_cells}
                  onChange={(e) => setEntry({ ...entry, queen_cells: Number(e.target.value) })} className="fld" />
              </L>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input type="checkbox" checked={entry.queen_seen}
                  onChange={(e) => setEntry({ ...entry, queen_seen: e.target.checked })} />
                Queen sighted
              </label>
              <div className="md:col-span-2 flex items-end">
                <button onClick={saveEntry} disabled={savingEntry}
                  className="px-4 py-2 rounded-lg bg-honey text-honey-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-60">
                  {savingEntry ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save record
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Records you save here feed the trends, alerts and integration sync immediately — nothing on this screen is sample data.
            </p>
          )}
        </div>

        {/* Alerts */}
        <div className="rounded-xl border border-border p-4 mb-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-honey" /> Alerts
          </h3>

          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts — colonies, acoustics and weather all within range.</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={`${a.title}-${i}`} className={`rounded-lg border p-3 ${tone(a.level)}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <span className="text-[10px] uppercase tracking-wide opacity-70">{a.hive}</span>
                  </div>
                  <p className="text-xs mt-1 opacity-90">{a.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Combined trend */}
        <div className="rounded-xl border border-border p-4 mb-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-honey" /> Colony health trend
          </h3>
          {trend.length === 0 ? (
            <p className="text-sm text-muted-foreground">Log an inspection or an acoustic audit to build the trend.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis yAxisId="score" domain={[0, 100]} fontSize={11} />
                  <YAxis yAxisId="mites" orientation="right" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="score" type="monotone" dataKey="inspection" name="Inspection score" stroke="hsl(var(--honey))" strokeWidth={2} connectNulls />
                  <Line yAxisId="score" type="monotone" dataKey="acoustic" name="Acoustic score" stroke="hsl(var(--primary))" strokeWidth={2} connectNulls />
                  <Line yAxisId="mites" type="monotone" dataKey="varroa" name="Varroa count" stroke="hsl(var(--destructive))" strokeDasharray="4 3" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Weather */}
        <div className="rounded-xl border border-border p-4 mb-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <CloudSun className="w-4 h-4 text-honey" /> Weather context (14 days back · 7 days ahead)
          </h3>
          {weatherSeries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Weather feed loading…</p>
          ) : (
            <>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weatherSeries}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="max" name="Max °C" stroke="hsl(var(--honey))" fill="hsl(var(--honey))" fillOpacity={0.18} />
                    <Area type="monotone" dataKey="min" name="Min °C" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.12} />
                    <Area type="monotone" dataKey="rain" name="Rain mm" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                <span className="flex items-center gap-2"><Thermometer className="w-3 h-3 text-honey" /> Peak {Math.max(...weatherSeries.map((w) => w.max)).toFixed(0)} °C</span>
                <span className="flex items-center gap-2"><Droplets className="w-3 h-3 text-honey" /> Total {weatherSeries.reduce((a, w) => a + (w.rain ?? 0), 0).toFixed(0)} mm</span>
                <span className="flex items-center gap-2"><Wind className="w-3 h-3 text-honey" /> Gusts {Math.max(...weatherSeries.map((w) => w.wind)).toFixed(0)} km/h</span>
              </div>
            </>
          )}
        </div>

        {/* Recent records */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <ClipboardList className="w-4 h-4 text-honey" /> Latest inspections
            </h3>
            <div className="space-y-2">
              {fIns.slice(0, 6).map((i) => (
                <div key={i.id} className="flex items-center justify-between text-sm border-b border-border/60 pb-2">
                  <span>{i.inspected_on} · {i.hive_label}</span>
                  <span className="text-muted-foreground">{i.colony_health} · {i.brood_frames}B/{i.honey_frames}H · {i.varroa_count} mites</span>
                </div>
              ))}
              {fIns.length === 0 && <p className="text-sm text-muted-foreground">No inspections logged.</p>}
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <AudioLines className="w-4 h-4 text-honey" /> Latest acoustic audits
            </h3>
            <div className="space-y-2">
              {fAud.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm border-b border-border/60 pb-2">
                  <span>{a.recorded_at.slice(0, 10)} · {a.hive_label}</span>
                  <span className="text-muted-foreground">
                    {a.health_state} {(Number(a.health_confidence) * 100).toFixed(0)}%{a.piping_detected ? " · piping" : ""}
                  </span>
                </div>
              ))}
              {fAud.length === 0 && <p className="text-sm text-muted-foreground">No acoustic audits archived.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, hint }: { icon: typeof Activity; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="w-3.5 h-3.5 text-honey" /> {label}
      </div>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}
