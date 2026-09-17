import { useState, useEffect, useMemo, useCallback } from "react";
import { X, TrendingUp, Save, Trash2 } from "lucide-react";
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
    const weatherF = Math.max(0.1, (tempF + windF + precipF) / 3);

    // Yield per hive per day: base 1.2 kg at peak flow & full brood & ideal weather
    const dailyKg = 1.2 * broodF * nectarF * weatherF;
    const seasonKg = dailyKg * bloomDays;
    const totalKg = seasonKg * hives;
    const revenue = totalKg * pricePerKg;

    return { broodF, nectarF, weatherF, tempF, windF, precipF, dailyKg, seasonKg, totalKg, revenue };
  }, [hives, broodFrames, nectarScore, bloomDays, tempC, windKmh, precipMm, pricePerKg]);

  const dailyCurve = useMemo(() => Array.from({ length: bloomDays }, (_, i) => {
    // Bell-shaped: ramp 0-30%, peak 30-70%, taper 70-100%
    const x = i / bloomDays;
    const factor = x < 0.3 ? x / 0.3 : x < 0.7 ? 1 : Math.max(0, (1 - x) / 0.3);
    return { day: `D${i + 1}`, kg: +(calc.dailyKg * factor).toFixed(2), cum: 0 };
  }).map((d, i, arr) => { d.cum = +(arr.slice(0, i + 1).reduce((s, x) => s + x.kg, 0)).toFixed(1); return d; }), [calc.dailyKg, bloomDays]);

  const radarData = [
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
  useEffect(() => { if ((isOpen || embedded) && deviceId) void load(); }, [isOpen, embedded, deviceId, load]);

  const save = async () => {
    const inputs = { hives, broodFrames, nectarScore, bloomDays, tempC, windKmh, precipMm, pricePerKg };
    const outputs = { dailyKg: +calc.dailyKg.toFixed(2), seasonKg: +calc.seasonKg.toFixed(1), totalKg: +calc.totalKg.toFixed(1), revenue: Math.round(calc.revenue) };
    const { error } = await supabase.from("yield_projections").insert([{ device_id: deviceId, label: `${hives} hives · ${bloomDays}d`, inputs: inputs as never, outputs: outputs as never }]);
    if (error) return toast.error(error.message);
    toast.success("Projection saved to history");
    load();
  };
  const del = async (id: string) => { await supabase.from("yield_projections").delete().eq("id", id); load(); };

  if (!isOpen && !embedded) return null;

  const content = (
    <div className="w-full max-w-full space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center text-honey flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Honey Yield <span className="text-honey">Projection</span>
            </h1>
            <p className="text-xs text-muted-foreground">Brood × nectar × weather → kg & revenue</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button onClick={save} className="px-3.5 py-2 rounded-xl border border-honey/40 bg-honey/10 text-honey hover:bg-honey/20 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
            <Save className="w-3.5 h-3.5" /> Save run
          </button>
          {!embedded && onClose && (
            <button onClick={onClose} className="w-9 h-9 rounded-xl border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 shadow-sm space-y-3">
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
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 shadow-sm space-y-3">
          <h3 className="text-sm font-display font-bold text-honey">Limiting Factors</h3>
          <div className="w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="k" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <PolarRadiusAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={9} />
                <Radar name="Factor %" dataKey="v" stroke="hsl(var(--honey))" fill="hsl(var(--honey))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground">Polygon shape shows which condition is most bottlenecking harvest volume.</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 shadow-sm flex flex-col justify-between space-y-3">
          <h3 className="text-sm font-display font-bold text-honey">Projected Outcomes</h3>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="kg / hive" value={`${calc.seasonKg.toFixed(1)} kg`} accent="ok" />
            <Stat label="Total crop" value={`${Math.round(calc.totalKg).toLocaleString()} kg`} accent="ok" />
            <Stat label="Daily rate" value={`${calc.dailyKg.toFixed(2)} kg/d`} />
            <Stat label="Gross revenue" value={`KES ${Math.round(calc.revenue).toLocaleString()}`} accent="ok" />
          </div>
          <p className="text-xs text-muted-foreground">Projections assume healthy queen and typical foraging range (3 km radius).</p>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 shadow-sm">
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
  );

  if (embedded) return content;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-6xl shadow-2xl p-4 sm:p-6 overflow-y-auto max-h-[90vh] my-auto">
        {content}
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
