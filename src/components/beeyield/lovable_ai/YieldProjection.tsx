import { useState, useEffect, useCallback, useMemo } from "react";
import { TrendingUp, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

type Run = { id: string; label: string; inputs: Record<string, number>; outputs: Record<string, number>; created_at: string };

export default function YieldProjection({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [hives, setHives] = useState(20);
  const [broodFrames, setBroodFrames] = useState(8); // 0-12, drives bee population
  const [nectarScore, setNectarScore] = useState(7); // 0-10 florage
  const [bloomDays, setBloomDays] = useState(28);
  const [tempC, setTempC] = useState(24);
  const [windKmh, setWindKmh] = useState(12);
  const [precipMm, setPrecipMm] = useState(2);
  const [pricePerKg, setPricePerKg] = useState(800);
  const [runs, setRuns] = useState<Run[]>([]);

  const calc = useMemo(() => {
    // Brood-strength factor 0-1
    const broodF = Math.min(1, broodFrames / 10);
    // Nectar flow factor
    const nectarF = nectarScore / 10;
    // Weather factor: ideal 18-28°C, calm, dry
    const tempF = tempC < 12 || tempC > 36 ? 0.2 : 1 - Math.abs(tempC - 23) / 25;
    const windF = windKmh > 30 ? 0.3 : 1 - windKmh / 60;
    const precipF = precipMm > 8 ? 0.3 : 1 - precipMm / 25;
    const wxF = (tempF + windF + precipF) / 3;
    // Daily kg/hive base = 1.4 kg in perfect; usable foraging hours scaled
    const dailyKg = 1.4 * broodF * nectarF * wxF;
    const seasonKg = dailyKg * bloomDays;
    const totalKg = seasonKg * hives;
    const revenue = totalKg * pricePerKg;
    return { broodF, nectarF, wxF, dailyKg, seasonKg, totalKg, revenue, tempF, windF, precipF };
  }, [hives, broodFrames, nectarScore, bloomDays, tempC, windKmh, precipMm, pricePerKg]);

  const dailyCurve = useMemo(() => Array.from({ length: bloomDays }, (_, i) => {
    // Bell-shaped: ramp 0-30%, peak 30-70%, taper 70-100%
    const x = i / bloomDays;
    const factor = x < 0.3 ? x / 0.3 : x < 0.7 ? 1 : Math.max(0, (1 - x) / 0.3);
    return { day: `D${i + 1}`, kg: +(calc.dailyKg * factor).toFixed(2), cum: 0 };
  }).map((d, i, arr) => { d.cum = +(arr.slice(0, i + 1).reduce((s, x) => s + x.kg, 0)).toFixed(1); return d; }), [calc.dailyKg, bloomDays]);

  const radar = [
    { k: "Brood", v: calc.broodF * 100 },
    { k: "Nectar", v: calc.nectarF * 100 },
    { k: "Temp", v: calc.tempF * 100 },
    { k: "Wind", v: calc.windF * 100 },
    { k: "Precip", v: calc.precipF * 100 },
  ];

  const load = useCallback(async () => {
    if (!deviceId) return;
    const { data } = await supabase.from("yield_projections").select("*").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(30);
    setRuns((data ?? []) as Run[]);
  }, [deviceId]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isOpen && deviceId) load(); }, [isOpen, deviceId, load]);

  const save = async () => {
    const inputs = { hives, broodFrames, nectarScore, bloomDays, tempC, windKmh, precipMm, pricePerKg };
    const outputs = { dailyKg: +calc.dailyKg.toFixed(2), seasonKg: +calc.seasonKg.toFixed(1), totalKg: +calc.totalKg.toFixed(1), revenue: Math.round(calc.revenue) };
    const { error } = await supabase.from("yield_projections").insert([{ device_id: deviceId, label: `${hives} hives · ${bloomDays}d`, inputs: inputs as never, outputs: outputs as never }]);
    if (error) return toast.error(error.message);
    toast.success("Projection saved to history");
    load();
  };
  const del = async (id: string) => { await supabase.from("yield_projections").delete().eq("id", id); load(); };

  if (!isOpen) return null;

  return (
    <div className={embedded ? "relative z-0 bg-background overflow-visible custom-scroll pt-6" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Honey Yield Projection</h1>
              <p className="text-xs text-muted-foreground">Brood × nectar × weather → kg & revenue</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <h3 className="text-sm font-display font-bold text-honey">Inputs</h3>
            <Field label={`Hives: ${hives}`}><input type="range" min={1} max={500} value={hives} onChange={(e) => setHives(+e.target.value)} className="w-full" /></Field>
            <Field label={`Brood frames per hive: ${broodFrames}`}><input type="range" min={0} max={12} value={broodFrames} onChange={(e) => setBroodFrames(+e.target.value)} className="w-full" /></Field>
            <Field label={`Nectar flow score (0-10): ${nectarScore}`}><input type="range" min={0} max={10} value={nectarScore} onChange={(e) => setNectarScore(+e.target.value)} className="w-full" /></Field>
            <Field label={`Bloom days: ${bloomDays}`}><input type="range" min={5} max={60} value={bloomDays} onChange={(e) => setBloomDays(+e.target.value)} className="w-full" /></Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Temp °C"><input type="number" value={tempC} onChange={(e) => setTempC(+e.target.value)} className={inp} /></Field>
              <Field label="Wind km/h"><input type="number" value={windKmh} onChange={(e) => setWindKmh(+e.target.value)} className={inp} /></Field>
              <Field label="Precip mm/d"><input type="number" value={precipMm} onChange={(e) => setPrecipMm(+e.target.value)} className={inp} /></Field>
            </div>
            <Field label="Price / kg (KES)"><input type="number" value={pricePerKg} onChange={(e) => setPricePerKg(+e.target.value)} className={inp} /></Field>
            <button onClick={save} className="w-full px-3 py-2 rounded-lg bg-honey text-honey-foreground text-xs flex items-center justify-center gap-1"><Save className="w-3 h-3" />Save run to history</button>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-2">
            <Stat label="Daily kg/hive" value={calc.dailyKg.toFixed(2)} />
            <Stat label="Per hive (season)" value={`${calc.seasonKg.toFixed(1)} kg`} />
            <Stat label="Total apiary kg" value={calc.totalKg.toFixed(0)} accent="ok" />
            <Stat label="Revenue (KES)" value={Math.round(calc.revenue).toLocaleString()} accent="ok" />
            <div className="col-span-2 p-4 rounded-xl border border-border bg-card">
              <h3 className="text-sm font-display font-bold text-honey mb-2">Daily yield curve</h3>
              <div className="h-48"><ResponsiveContainer><LineChart data={dailyCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="day" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="kg" stroke="hsl(var(--honey))" name="Daily kg/hive" dot={false} />
                <Line type="monotone" dataKey="cum" stroke="hsl(var(--primary))" name="Cumulative" dot={false} />
              </LineChart></ResponsiveContainer></div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-display font-bold text-honey mb-2">Driver radar (0-100)</h3>
            <div className="h-56"><ResponsiveContainer><RadarChart data={radar}>
              <PolarGrid stroke="hsl(var(--border))" /><PolarAngleAxis dataKey="k" tick={{ fontSize: 10 }} /><PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
              <Radar dataKey="v" stroke="hsl(var(--honey))" fill="hsl(var(--honey) / 0.4)" />
            </RadarChart></ResponsiveContainer></div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-display font-bold text-honey mb-2">Runs comparison (total kg)</h3>
            <div className="h-56"><ResponsiveContainer><BarChart data={runs.slice(0, 10).reverse().map((r) => ({ name: r.label.slice(0, 12), kg: r.outputs.totalKg }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
              <Bar dataKey="kg" fill="hsl(var(--primary))" />
            </BarChart></ResponsiveContainer></div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-display font-bold text-honey mb-2">History</h3>
          <div className="overflow-x-auto"><table className="w-full text-xs">
            <thead className="text-muted-foreground"><tr><th className="text-left py-1">Label</th><th className="text-right">kg/hive</th><th className="text-right">Total kg</th><th className="text-right">Revenue</th><th className="text-right">When</th><th></th></tr></thead>
            <tbody>
              {runs.map((r) => (<tr key={r.id} className="border-t border-border">
                <td className="py-1">{r.label}</td>
                <td className="text-right">{r.outputs.seasonKg}</td>
                <td className="text-right text-honey">{r.outputs.totalKg}</td>
                <td className="text-right">{Number(r.outputs.revenue).toLocaleString()}</td>
                <td className="text-right text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="text-right"><button onClick={() => del(r.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></button></td>
              </tr>))}
              {runs.length === 0 && <tr><td colSpan={6} className="py-3 text-center text-muted-foreground">No projections yet</td></tr>}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}

const inp = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="text-xs text-muted-foreground mb-1 block">{label}</label>{children}</div>; }
function Stat({ label, value, accent }: { label: string; value: string | number; accent?: "ok" }) {
  return <div className="p-3 rounded-xl border border-border bg-card">
    <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
    <div className={`text-xl font-display font-bold ${accent === "ok" ? "text-emerald-500" : "text-honey"}`}>{value}</div>
  </div>;
}
