import { useMemo, useState } from "react";
import { Microscope, Play, Save } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";

// ===== Beeyield's Varroa Simulator =====
// Three modes: deterministic (logistic), stochastic (daily), scenario comparison.
// Distinct from screenshot reference — uses different curves/visuals.

type Treatment = { day: number; knockdownPct: number; label: string };

function simulateDeterministic(days: number, m0: number, growthPerDay: number, carry: number, treatments: Treatment[]) {
  let m = m0;
  const out: { day: number; mites: number; load: number; bees: number }[] = [];
  let bees = 30000;
  for (let d = 0; d < days; d++) {
    // logistic growth
    m = m + m * growthPerDay * (1 - m / carry);
    // brood shrink as mite load grows
    const load = m / Math.max(1, bees) * 100; // %
    bees = Math.max(2000, bees + 80 - load * 60);
    // treatment knockdown
    const t = treatments.find((tt) => tt.day === d);
    if (t) m = m * (1 - t.knockdownPct / 100);
    out.push({ day: d, mites: Math.round(m), load: Math.round(load * 10) / 10, bees: Math.round(bees) });
  }
  return out;
}

function simulateStochastic(days: number, m0: number, treatments: Treatment[]) {
  let m = m0;
  let bees = 30000;
  const out: { day: number; mites: number; load: number; bees: number }[] = [];
  for (let d = 0; d < days; d++) {
    const growth = 0.012 + (Math.random() - 0.5) * 0.008; // ~1.2% per day ± noise
    m = m * (1 + growth);
    const load = m / Math.max(1, bees) * 100;
    const beeLoss = load * 50 + (Math.random() - 0.5) * 200;
    bees = Math.max(1500, bees + 80 - beeLoss);
    const t = treatments.find((tt) => tt.day === d);
    if (t) m = m * (1 - t.knockdownPct / 100) * (0.9 + Math.random() * 0.2);
    out.push({ day: d, mites: Math.round(m), load: Math.round(load * 10) / 10, bees: Math.round(bees) });
  }
  return out;
}

const STRATEGIES = [
  { name: "No treatment", treatments: [] as Treatment[] },
  { name: "Spring + Autumn OA", treatments: [{ day: 30, knockdownPct: 90, label: "Spring OA" }, { day: 150, knockdownPct: 92, label: "Autumn OA" }] },
  { name: "Aggressive (3x)", treatments: [{ day: 20, knockdownPct: 70, label: "Formic" }, { day: 90, knockdownPct: 90, label: "Apivar" }, { day: 160, knockdownPct: 95, label: "OA vapor" }] },
];

export default function VarroaSimulator({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const deviceId = useDeviceId();
  const [mode, setMode] = useState<"det" | "sto" | "scenario">("det");
  const [days, setDays] = useState(180);
  const [m0, setM0] = useState(50);
  const [growth, setGrowth] = useState(1.2);
  const [carry, setCarry] = useState(8000);
  const [treatments, setTreatments] = useState<Treatment[]>([{ day: 60, knockdownPct: 90, label: "Treatment 1" }]);
  const [runStamp, setRunStamp] = useState(0);

  const detResult = useMemo(() => simulateDeterministic(days, m0, growth / 100, carry, treatments), [days, m0, growth, carry, treatments]);
  const stoResult = useMemo(() => simulateStochastic(days, m0, treatments), [days, m0, treatments, runStamp]);
  const scenarioResults = useMemo(() => STRATEGIES.map((s) => ({ name: s.name, data: simulateDeterministic(days, m0, growth / 100, carry, s.treatments) })), [days, m0, growth, carry]);

  const peakLoad = (data: { load: number }[]) => Math.max(...data.map((d) => d.load));

  const addTreatment = () => setTreatments([...treatments, { day: 100, knockdownPct: 85, label: `Treatment ${treatments.length + 1}` }]);
  const removeTreatment = (i: number) => setTreatments(treatments.filter((_, j) => j !== i));

  const save = async () => {
    const data = mode === "det" ? detResult : mode === "sto" ? stoResult : scenarioResults;
    const peak = mode === "scenario"
      ? Math.max(...scenarioResults.map((s) => peakLoad(s.data)))
      : peakLoad(mode === "det" ? detResult : stoResult);
    const { error } = await supabase.from("varroa_simulations").insert([{
      device_id: deviceId, mode, label: `${mode} run · peak ${peak.toFixed(1)}%`,
      params: { days, m0, growth, carry, treatments } as never,
      results: { peak_load: peak, points: data } as never,
    }]);
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Microscope className="w-6 h-6 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Varroa Simulator</h1>
              <p className="text-xs text-muted-foreground">Deterministic · Stochastic · Scenario comparison · Treatment events</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="px-3 py-2 rounded-lg border border-honey/40 text-honey text-xs flex items-center gap-1.5"><Save className="w-3.5 h-3.5" />Save run</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { k: "det", l: "Deterministic (logistic)" },
            { k: "sto", l: "Stochastic (daily noise)" },
            { k: "scenario", l: "Scenario comparison" },
          ].map((m) => (
            <button key={m.k} onClick={() => setMode(m.k as typeof mode)} className={`px-3 py-2 rounded-lg border text-xs font-medium transition ${mode === m.k ? "bg-honey text-honey-foreground border-honey" : "border-border text-muted-foreground hover:border-primary/50"}`}>{m.l}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 p-4 rounded-xl border border-border bg-muted/30">
          <Field label="Days"><input type="number" value={days} onChange={(e) => setDays(+e.target.value)} className={inp} /></Field>
          <Field label="Initial mites"><input type="number" value={m0} onChange={(e) => setM0(+e.target.value)} className={inp} /></Field>
          <Field label="Growth %/day"><input type="number" step={0.1} value={growth} onChange={(e) => setGrowth(+e.target.value)} className={inp} /></Field>
          <Field label="Carrying capacity"><input type="number" value={carry} onChange={(e) => setCarry(+e.target.value)} className={inp} /></Field>
        </div>

        {mode !== "scenario" && (
          <div className="p-4 rounded-xl border border-border bg-card mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-foreground">Treatment events</h3>
              <div className="flex gap-2">
                <button onClick={addTreatment} className="text-xs px-2 py-1 rounded border border-border">+ Add</button>
                {mode === "sto" && <button onClick={() => setRunStamp(runStamp + 1)} className="text-xs px-2 py-1 rounded bg-honey text-honey-foreground flex items-center gap-1"><Play className="w-3 h-3" />Re-roll</button>}
              </div>
            </div>
            <div className="space-y-2">
              {treatments.map((t, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-end">
                  <Field label="Label"><input value={t.label} onChange={(e) => setTreatments(treatments.map((tt, j) => j === i ? { ...tt, label: e.target.value } : tt))} className={inp} /></Field>
                  <Field label="Day"><input type="number" value={t.day} onChange={(e) => setTreatments(treatments.map((tt, j) => j === i ? { ...tt, day: +e.target.value } : tt))} className={inp} /></Field>
                  <Field label="Knockdown %"><input type="number" value={t.knockdownPct} onChange={(e) => setTreatments(treatments.map((tt, j) => j === i ? { ...tt, knockdownPct: +e.target.value } : tt))} className={inp} /></Field>
                  <button onClick={() => removeTreatment(i)} className="px-3 py-2 rounded-lg border border-destructive/30 text-destructive text-xs">Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === "det" && <DetView data={detResult} treatments={treatments} />}
        {mode === "sto" && <StoView data={stoResult} treatments={treatments} />}
        {mode === "scenario" && <ScenarioView results={scenarioResults} />}
      </div>
    </div>
  );
}

function DetView({ data, treatments }: { data: { day: number; mites: number; load: number; bees: number }[]; treatments: Treatment[] }) {
  const peak = Math.max(...data.map((d) => d.load));
  return (
    <div className="space-y-4">
      <KPIs peak={peak} finalMites={data[data.length - 1].mites} finalBees={data[data.length - 1].bees} treatments={treatments.length} />
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="font-display text-sm font-bold text-foreground mb-3">Mite & bee population (logistic)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="mites" stroke="hsl(0,84%,60%)" fill="hsl(0,84%,60%)" fillOpacity={0.3} name="Mites" />
            <Area yAxisId="right" type="monotone" dataKey="bees" stroke="hsl(38,92%,50%)" fill="hsl(38,92%,50%)" fillOpacity={0.2} name="Bees" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="font-display text-sm font-bold text-foreground mb-3">Mite load % (3% threshold = treat)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip />
            <Line type="monotone" dataKey="load" stroke="hsl(0,84%,60%)" strokeWidth={2} dot={false} name="Mite load %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StoView({ data, treatments }: { data: { day: number; mites: number; load: number; bees: number }[]; treatments: Treatment[] }) {
  const peak = Math.max(...data.map((d) => d.load));
  return (
    <div className="space-y-4">
      <KPIs peak={peak} finalMites={data[data.length - 1].mites} finalBees={data[data.length - 1].bees} treatments={treatments.length} />
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="font-display text-sm font-bold text-foreground mb-3">Stochastic mite trajectory</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="mites" stroke="hsl(0,84%,60%)" strokeWidth={2} dot={false} name="Mites (noisy)" />
            <Line type="monotone" dataKey="load" stroke="hsl(38,92%,50%)" strokeWidth={2} dot={false} name="Mite load %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground">Re-roll the simulation to see how stochastic noise affects timing of critical thresholds.</p>
    </div>
  );
}

function ScenarioView({ results }: { results: { name: string; data: { day: number; load: number; bees: number }[] }[] }) {
  const merged = results[0].data.map((_, i) => {
    const row: Record<string, number> = { day: i };
    results.forEach((r) => (row[r.name] = r.data[i].load));
    return row;
  });
  const summary = results.map((r) => ({
    name: r.name,
    peakLoad: Math.max(...r.data.map((d) => d.load)),
    finalBees: r.data[r.data.length - 1].bees,
  }));
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="font-display text-sm font-bold text-foreground mb-3">Mite load % — 3 strategies overlaid</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={merged}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip />
            <Legend />
            {results.map((r, i) => (
              <Line key={r.name} type="monotone" dataKey={r.name} stroke={`hsl(${i * 70},80%,55%)`} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="font-display text-sm font-bold text-foreground mb-3">Outcome comparison</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={summary}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip />
            <Legend />
            <Bar dataKey="peakLoad" fill="hsl(0,84%,60%)" name="Peak load %" />
            <Bar dataKey="finalBees" fill="hsl(38,92%,50%)" name="Final bee count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KPIs({ peak, finalMites, finalBees, treatments }: { peak: number; finalMites: number; finalBees: number; treatments: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <Kpi label="Peak load %" value={`${peak.toFixed(1)}%`} accent={peak > 5 ? "warn" : "ok"} />
      <Kpi label="Final mites" value={finalMites.toLocaleString()} />
      <Kpi label="Final bees" value={finalBees.toLocaleString()} />
      <Kpi label="Treatments" value={treatments} />
    </div>
  );
}

const inp = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs text-muted-foreground mb-1 block">{label}</label>{children}</div>;
}
function Kpi({ label, value, accent }: { label: string; value: string | number; accent?: "ok" | "warn" }) {
  const cls = accent === "ok" ? "text-emerald-500" : accent === "warn" ? "text-destructive" : "text-honey";
  return (
    <div className="p-3 rounded-xl border border-border bg-card">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className={`text-xl font-display font-bold ${cls}`}>{value}</div>
    </div>
  );
}
