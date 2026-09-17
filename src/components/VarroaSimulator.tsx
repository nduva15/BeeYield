import { useMemo, useState } from "react";
import { X, Microscope, Play, Save } from "lucide-react";
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

export interface VarroaSimulatorProps {
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
}

export default function VarroaSimulator({
  isOpen = true,
  onClose,
  embedded = false,
}: VarroaSimulatorProps) {
  const deviceId = useDeviceId();
  const [mode, setMode] = useState<"det" | "sto" | "scenario">("det");
  const [days, setDays] = useState(180);
  const [m0, setM0] = useState(50);
  const [growth, setGrowth] = useState(1.2);
  const [carry, setCarry] = useState(8000);
  const [treatments, setTreatments] = useState<Treatment[]>([{ day: 60, knockdownPct: 90, label: "Treatment 1" }]);
  const [runStamp, setRunStamp] = useState(0);

  const detResult = useMemo(() => simulateDeterministic(days, m0, growth / 100, carry, treatments), [days, m0, growth, carry, treatments]);
  const stoResult = useMemo(() => {
    void runStamp;
    return simulateStochastic(days, m0, treatments);
  }, [days, m0, treatments, runStamp]);
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

  if (!isOpen && !embedded) return null;

  const content = (
    <div className="w-full max-w-full space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center text-honey flex-shrink-0">
            <Microscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Varroa <span className="text-honey">Simulator</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Deterministic · Stochastic · Scenario comparison · Treatment events
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={save}
            className="px-3.5 py-2 rounded-xl border border-honey/40 bg-honey/10 text-honey hover:bg-honey/20 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Save className="w-3.5 h-3.5" /> Save run
          </button>
          {!embedded && onClose && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl border border-border/70 bg-muted/40 w-fit">
        {[
          { k: "det", l: "Deterministic (logistic)" },
          { k: "sto", l: "Stochastic (daily noise)" },
          { k: "scenario", l: "Scenario comparison" },
        ].map((m) => (
          <button
            key={m.k}
            onClick={() => setMode(m.k as typeof mode)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === m.k
                ? "bg-honey text-honey-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            }`}
          >
            {m.l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 shadow-sm">
        <Field label="Days">
          <input type="number" min={10} max={730} value={days} onChange={(e) => setDays(+e.target.value)} className={inp} />
        </Field>
        <Field label="Initial mites">
          <input type="number" min={1} max={5000} value={m0} onChange={(e) => setM0(+e.target.value)} className={inp} />
        </Field>
        <Field label="Growth %/day">
          <input type="number" step={0.1} min={0} max={10} value={growth} onChange={(e) => setGrowth(+e.target.value)} className={inp} />
        </Field>
        <Field label="Carrying capacity">
          <input type="number" min={500} max={20000} value={carry} onChange={(e) => setCarry(+e.target.value)} className={inp} />
        </Field>
      </div>

      {mode !== "scenario" && (
        <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-foreground">Treatment events</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={addTreatment}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted font-medium transition-all"
              >
                + Add
              </button>
              {mode === "sto" && (
                <button
                  onClick={() => setRunStamp(runStamp + 1)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-honey text-honey-foreground flex items-center gap-1.5 font-medium shadow-sm"
                >
                  <Play className="w-3 h-3" /> Re-roll
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {treatments.map((t, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end p-3 rounded-xl bg-muted/20 border border-border/40">
                <Field label="Label">
                  <input
                    value={t.label}
                    onChange={(e) => setTreatments(treatments.map((tt, j) => (j === i ? { ...tt, label: e.target.value } : tt)))}
                    className={inp}
                  />
                </Field>
                <Field label="Day">
                  <input
                    type="number"
                    min={1}
                    max={days}
                    value={t.day}
                    onChange={(e) => setTreatments(treatments.map((tt, j) => (j === i ? { ...tt, day: +e.target.value } : tt)))}
                    className={inp}
                  />
                </Field>
                <Field label="Knockdown %">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={t.knockdownPct}
                    onChange={(e) => setTreatments(treatments.map((tt, j) => (j === i ? { ...tt, knockdownPct: +e.target.value } : tt)))}
                    className={inp}
                  />
                </Field>
                <button
                  onClick={() => removeTreatment(i)}
                  className="h-10 px-3 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-semibold transition-all"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === "det" && <DetView data={detResult} treatments={treatments} />}
      {mode === "sto" && <StoView data={stoResult} treatments={treatments} />}
      {mode === "scenario" && <ScenarioView results={scenarioResults} />}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-background text-foreground border border-border rounded-2xl w-full max-w-5xl shadow-2xl p-4 sm:p-6 my-auto max-h-[92vh] overflow-y-auto custom-scroll">
        {content}
      </div>
    </div>
  );
}

function DetView({ data, treatments }: { data: { day: number; mites: number; load: number; bees: number }[]; treatments: Treatment[] }) {
  const peak = Math.max(...data.map((d) => d.load));
  return (
    <div className="space-y-4">
      <KPIs peak={peak} finalMites={data[data.length - 1].mites} finalBees={data[data.length - 1].bees} treatments={treatments.length} />
      <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 shadow-sm overflow-hidden">
        <h3 className="font-display text-sm font-bold text-foreground mb-3">Mite & bee population (logistic)</h3>
        <div className="w-full min-w-0 overflow-hidden">
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
      </div>
      <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 shadow-sm overflow-hidden">
        <h3 className="font-display text-sm font-bold text-foreground mb-3">Mite load % (3% threshold = treat)</h3>
        <div className="w-full min-w-0 overflow-hidden">
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
    </div>
  );
}

function StoView({ data, treatments }: { data: { day: number; mites: number; load: number; bees: number }[]; treatments: Treatment[] }) {
  const peak = Math.max(...data.map((d) => d.load));
  return (
    <div className="space-y-4">
      <KPIs peak={peak} finalMites={data[data.length - 1].mites} finalBees={data[data.length - 1].bees} treatments={treatments.length} />
      <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 shadow-sm overflow-hidden">
        <h3 className="font-display text-sm font-bold text-foreground mb-3">Stochastic mite trajectory</h3>
        <div className="w-full min-w-0 overflow-hidden">
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
      <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 shadow-sm overflow-hidden">
        <h3 className="font-display text-sm font-bold text-foreground mb-3">Mite load % — 3 strategies overlaid</h3>
        <div className="w-full min-w-0 overflow-hidden">
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
      </div>
      <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 shadow-sm overflow-hidden">
        <h3 className="font-display text-sm font-bold text-foreground mb-3">Outcome comparison</h3>
        <div className="w-full min-w-0 overflow-hidden">
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
    </div>
  );
}

function KPIs({ peak, finalMites, finalBees, treatments }: { peak: number; finalMites: number; finalBees: number; treatments: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Kpi label="Peak load %" value={`${peak.toFixed(1)}%`} accent={peak > 5 ? "warn" : "ok"} />
      <Kpi label="Final mites" value={finalMites.toLocaleString()} />
      <Kpi label="Final bees" value={finalBees.toLocaleString()} />
      <Kpi label="Treatments" value={treatments} />
    </div>
  );
}

const inp = "w-full bg-background border border-border/70 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary/60 transition-all";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground block">{label}</label>{children}</div>;
}
function Kpi({ label, value, accent }: { label: string; value: string | number; accent?: "ok" | "warn" }) {
  const cls = accent === "ok" ? "text-emerald-500" : accent === "warn" ? "text-destructive" : "text-honey";
  return (
    <div className="p-4 rounded-2xl border border-border/70 bg-card/60 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-2xl font-display font-bold mt-1 ${cls}`}>{value}</div>
    </div>
  );
}
