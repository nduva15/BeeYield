import { useState, useEffect, useCallback } from "react";
import { Calendar, Save, Plus, Trash2, Beaker } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from "recharts";

type Action = { date: string; kind: "syrup_1_1" | "syrup_2_1" | "fondant" | "winter_check" | "candy"; kg: number; note: string };
type Plan = { id?: string; hive_label: string; plan_label: string; plan: Action[] };

const KIND_OPTS: { key: Action["kind"]; label: string; color: string }[] = [
  { key: "syrup_1_1", label: "1:1 syrup (spring)", color: "hsl(var(--primary))" },
  { key: "syrup_2_1", label: "2:1 syrup (autumn)", color: "hsl(var(--honey))" },
  { key: "fondant", label: "Fondant (winter)", color: "hsl(var(--accent))" },
  { key: "candy", label: "Candy board", color: "hsl(var(--muted-foreground))" },
  { key: "winter_check", label: "Winter store check", color: "hsl(var(--destructive))" },
];

function defaultPlan(): Action[] {
  const today = new Date();
  const yyyy = today.getFullYear();
  return [
    { date: `${yyyy}-03-10`, kind: "syrup_1_1", kg: 4, note: "Brood build-up stim" },
    { date: `${yyyy}-04-05`, kind: "syrup_1_1", kg: 4, note: "Pre-flow boost" },
    { date: `${yyyy}-08-25`, kind: "syrup_2_1", kg: 8, note: "Autumn store top-up" },
    { date: `${yyyy}-09-20`, kind: "syrup_2_1", kg: 6, note: "Final liquid feed" },
    { date: `${yyyy}-10-15`, kind: "winter_check", kg: 0, note: "Heft test — target ≥20 kg" },
    { date: `${yyyy}-12-15`, kind: "fondant", kg: 2.5, note: "Place above cluster" },
    { date: `${yyyy + 1}-01-20`, kind: "candy", kg: 1.5, note: "Top-up emergency feed" },
  ];
}

export default function FeedingSchedule({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [active, setActive] = useState<Plan>({ hive_label: "Hive 1", plan_label: "Season plan", plan: defaultPlan() });

  const load = useCallback(async () => {
    if (!deviceId) return;
    const { data } = await supabase.from("feeding_schedules").select("*").eq("device_id", deviceId).order("created_at", { ascending: false });
    setPlans(((data ?? []) as unknown) as Plan[]);
  }, [deviceId]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isOpen && deviceId) load(); }, [isOpen, deviceId, load]);

  const save = async () => {
    if (active.id) {
      const { error } = await supabase.from("feeding_schedules").update({ plan: active.plan as never, plan_label: active.plan_label, hive_label: active.hive_label, updated_at: new Date().toISOString() }).eq("id", active.id);
      if (error) return toast.error(error.message);
    } else {
      const { error, data } = await supabase.from("feeding_schedules").insert([{ device_id: deviceId, hive_label: active.hive_label, plan_label: active.plan_label, plan: active.plan as never }]).select().single();
      if (error) return toast.error(error.message);
      if (data) setActive({ ...active, id: data.id });
    }
    toast.success("Schedule saved");
    load();
  };
  const del = async (id: string) => { await supabase.from("feeding_schedules").delete().eq("id", id); load(); };

  const sorted = [...active.plan].sort((a, b) => a.date.localeCompare(b.date));
  const monthly = Array.from({ length: 12 }, (_, m) => ({ month: new Date(2024, m, 1).toLocaleString(undefined, { month: "short" }), kg: sorted.filter((a) => new Date(a.date).getMonth() === m).reduce((s, a) => s + a.kg, 0) }));
  const cumulative: { date: string; kg: number }[] = [];
  let total = 0;
  sorted.forEach((a) => { total += a.kg; cumulative.push({ date: a.date.slice(5), kg: total }); });

  if (!isOpen) return null;
  return (
    <div className={embedded ? "relative z-0 bg-background overflow-visible custom-scroll pt-6" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Feeding Schedule Timeline</h1>
              <p className="text-xs text-muted-foreground">Plan syrup, fondant and winter-gap actions per hive</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2 p-4 rounded-xl border border-border bg-card">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div><label className="text-xs text-muted-foreground">Hive</label><input value={active.hive_label} onChange={(e) => setActive({ ...active, hive_label: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-muted-foreground">Plan label</label><input value={active.plan_label} onChange={(e) => setActive({ ...active, plan_label: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-display text-base font-bold text-honey">Actions ({active.plan.length})</h3>
              <button onClick={() => setActive({ ...active, plan: [...active.plan, { date: new Date().toISOString().slice(0, 10), kind: "syrup_2_1", kg: 4, note: "" }] })} className="text-xs text-honey flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scroll">
              {sorted.map((a, idx) => {
                const i = active.plan.indexOf(a);
                return (
                  <div key={idx} className="grid grid-cols-12 gap-1 items-center text-xs">
                    <input type="date" value={a.date} onChange={(e) => { const p = [...active.plan]; p[i] = { ...a, date: e.target.value }; setActive({ ...active, plan: p }); }} className="col-span-3 bg-background border border-border rounded px-2 py-1.5" />
                    <select value={a.kind} onChange={(e) => { const p = [...active.plan]; p[i] = { ...a, kind: e.target.value as Action["kind"] }; setActive({ ...active, plan: p }); }} className="col-span-3 bg-background border border-border rounded px-2 py-1.5">
                      {KIND_OPTS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
                    </select>
                    <input type="number" value={a.kg} step="0.1" onChange={(e) => { const p = [...active.plan]; p[i] = { ...a, kg: +e.target.value }; setActive({ ...active, plan: p }); }} className="col-span-2 bg-background border border-border rounded px-2 py-1.5" />
                    <input value={a.note} placeholder="note" onChange={(e) => { const p = [...active.plan]; p[i] = { ...a, note: e.target.value }; setActive({ ...active, plan: p }); }} className="col-span-3 bg-background border border-border rounded px-2 py-1.5" />
                    <button onClick={() => setActive({ ...active, plan: active.plan.filter((_, j) => j !== i) })} className="col-span-1 text-destructive"><Trash2 className="w-3 h-3" /></button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={save} className="px-3 py-2 rounded-lg bg-honey text-honey-foreground text-xs font-medium flex items-center gap-1"><Save className="w-3 h-3" />Save plan</button>
              <button onClick={() => setActive({ hive_label: "Hive 1", plan_label: "Season plan", plan: defaultPlan() })} className="px-3 py-2 rounded-lg border border-border text-xs">Reset to default</button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="font-display text-base font-bold text-honey mb-2">Saved plans</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto custom-scroll">
              {plans.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded border border-border bg-muted/30">
                  <button onClick={() => setActive(p)} className="text-left flex-1">
                    <div className="text-xs font-medium text-honey">{p.plan_label}</div>
                    <div className="text-[10px] text-muted-foreground">{p.hive_label} · {p.plan.length} actions</div>
                  </button>
                  <button onClick={() => p.id && del(p.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              {plans.length === 0 && <div className="text-xs text-muted-foreground p-2">No saved plans yet</div>}
            </div>
            <div className="mt-3 p-2 rounded bg-honey/10 border border-honey/30">
              <Beaker className="w-3 h-3 inline text-honey mr-1" />
              <span className="text-[11px]">Total feed planned: <span className="font-bold text-honey">{sorted.reduce((s, a) => s + a.kg, 0).toFixed(1)} kg</span></span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-display font-bold text-honey mb-2">Monthly feed (kg)</h3>
            <div className="h-56"><ResponsiveContainer><BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
              <Bar dataKey="kg" fill="hsl(var(--honey))" />
            </BarChart></ResponsiveContainer></div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-display font-bold text-honey mb-2">Cumulative feed timeline</h3>
            <div className="h-56"><ResponsiveContainer><LineChart data={cumulative}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="kg" stroke="hsl(var(--primary))" strokeWidth={2} dot />
            </LineChart></ResponsiveContainer></div>
          </div>
        </div>
      </div>
    </div>
  );
}
