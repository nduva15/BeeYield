import { useState, useEffect, useMemo } from "react";
import { Box, Save, Truck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, AreaChart, Area, Legend } from "recharts";

type Run = { id: string; label: string; inputs: Record<string, number | string>; outputs: Record<string, number>; created_at: string };

const CROPS: Record<string, { hivesPerHa: number; bloomDays: number }> = {
  Almond: { hivesPerHa: 5, bloomDays: 18 },
  Avocado: { hivesPerHa: 6, bloomDays: 28 },
  Mango: { hivesPerHa: 4, bloomDays: 25 },
  Sunflower: { hivesPerHa: 2.5, bloomDays: 21 },
  Canola: { hivesPerHa: 2, bloomDays: 24 },
  Coffee: { hivesPerHa: 3, bloomDays: 14 },
  Macadamia: { hivesPerHa: 6, bloomDays: 30 },
  "Acacia (forest)": { hivesPerHa: 1.5, bloomDays: 35 },
};

export default function ApiarySizing({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const deviceId = useDeviceId();
  const [crop, setCrop] = useState("Almond");
  const [hectares, setHectares] = useState(40);
  const [supersPerHive, setSupersPerHive] = useState(2);
  const [framesPerSuper, setFramesPerSuper] = useState(10);
  const [hivesPerTruck, setHivesPerTruck] = useState(120);
  const [transportKm, setTransportKm] = useState(80);
  const [costPerKm, setCostPerKm] = useState(180); // KES/km
  const [bloomStart, setBloomStart] = useState(new Date().toISOString().slice(0, 10));
  const [runs, setRuns] = useState<Run[]>([]);

  const out = useMemo(() => {
    const c = CROPS[crop];
    const hives = Math.ceil(hectares * c.hivesPerHa);
    const supers = hives * supersPerHive;
    const frames = supers * framesPerSuper;
    const trucks = Math.ceil(hives / hivesPerTruck);
    const transportCost = trucks * transportKm * costPerKm * 2; // round trip
    const placementDate = new Date(new Date(bloomStart).getTime() - 2 * 86400000).toISOString().slice(0, 10);
    const removalDate = new Date(new Date(bloomStart).getTime() + (c.bloomDays + 2) * 86400000).toISOString().slice(0, 10);
    return { hives, supers, frames, trucks, transportCost, placementDate, removalDate, bloomDays: c.bloomDays };
  }, [crop, hectares, supersPerHive, framesPerSuper, hivesPerTruck, transportKm, costPerKm, bloomStart]);

  const ramp = useMemo(() => {
    // Ramp curve: 0% prior, 100% during bloom, fade to 0
    const days = out.bloomDays + 6;
    return Array.from({ length: days }, (_, i) => {
      const day = i - 2;
      const pct = day < 0 ? 0 : day < 3 ? (day + 1) * 33 : day < out.bloomDays - 3 ? 100 : Math.max(0, (out.bloomDays - day) * 33);
      return { day: `D${day}`, hives: Math.round((pct / 100) * out.hives), nectar: Math.round((pct / 100) * out.hives * 0.6) };
    });
  }, [out]);

  const load = async () => {
    if (!deviceId) return;
    const { data } = await supabase.from("apiary_sizing_runs").select("*").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(20);
    setRuns((data ?? []) as Run[]);
  };
  useEffect(() => { if (isOpen && deviceId) load(); }, [isOpen, deviceId]);

  const save = async () => {
    const inputs = { crop, hectares, supersPerHive, framesPerSuper, hivesPerTruck, transportKm, costPerKm, bloomStart };
    const { error } = await supabase.from("apiary_sizing_runs").insert([{ device_id: deviceId, label: `${crop} ${hectares}ha`, inputs: inputs as never, outputs: out as never }]);
    if (error) return toast.error(error.message);
    toast.success("Sizing run saved");
    load();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Box className="w-6 h-6 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Apiary & Equipment Sizing</h1>
              <p className="text-xs text-muted-foreground">Hives, supers and transport for a target crop bloom</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-1 p-4 rounded-xl border border-border bg-card space-y-3">
            <Field label="Crop"><select value={crop} onChange={(e) => setCrop(e.target.value)} className={inp}>{Object.keys(CROPS).map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Hectares"><input type="number" value={hectares} onChange={(e) => setHectares(+e.target.value)} className={inp} /></Field>
            <Field label="Bloom start"><input type="date" value={bloomStart} onChange={(e) => setBloomStart(e.target.value)} className={inp} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Supers / hive"><input type="number" value={supersPerHive} onChange={(e) => setSupersPerHive(+e.target.value)} className={inp} /></Field>
              <Field label="Frames / super"><input type="number" value={framesPerSuper} onChange={(e) => setFramesPerSuper(+e.target.value)} className={inp} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Hives / truck"><input type="number" value={hivesPerTruck} onChange={(e) => setHivesPerTruck(+e.target.value)} className={inp} /></Field>
              <Field label="Transport km"><input type="number" value={transportKm} onChange={(e) => setTransportKm(+e.target.value)} className={inp} /></Field>
            </div>
            <Field label="Cost / km (KES)"><input type="number" value={costPerKm} onChange={(e) => setCostPerKm(+e.target.value)} className={inp} /></Field>
            <button onClick={save} className="w-full px-3 py-2 rounded-lg bg-honey text-honey-foreground text-xs flex items-center justify-center gap-1"><Save className="w-3 h-3" />Save sizing run</button>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-2">
            <Stat label="Hives needed" value={out.hives} accent="ok" />
            <Stat label="Supers" value={out.supers} />
            <Stat label="Frames" value={out.frames} />
            <Stat label="Trucks (one-way)" value={out.trucks} />
            <Stat label="Transport cost (KES)" value={out.transportCost.toLocaleString()} />
            <Stat label="Bloom window" value={`${out.bloomDays} d`} />
            <div className="col-span-full p-4 rounded-xl border border-honey/30 bg-honey/5">
              <Truck className="w-4 h-4 inline text-honey mr-1" />
              <span className="text-sm">Place hives by <span className="font-bold text-honey">{out.placementDate}</span> · remove by <span className="font-bold text-honey">{out.removalDate}</span></span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-display font-bold text-honey mb-2">Hive deployment ramp</h3>
            <div className="h-56"><ResponsiveContainer><AreaChart data={ramp}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="day" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
              <Area type="monotone" dataKey="hives" stroke="hsl(var(--honey))" fill="hsl(var(--honey) / 0.25)" />
            </AreaChart></ResponsiveContainer></div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-display font-bold text-honey mb-2">Equipment breakdown</h3>
            <div className="h-56"><ResponsiveContainer><BarChart data={[
              { k: "Hives", v: out.hives }, { k: "Supers", v: out.supers }, { k: "Frames", v: out.frames }, { k: "Trucks×10", v: out.trucks * 10 },
            ]}>
              <XAxis dataKey="k" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
              <Bar dataKey="v" fill="hsl(var(--primary))" />
            </BarChart></ResponsiveContainer></div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-display font-bold text-honey mb-2">Run history</h3>
          <div className="overflow-x-auto"><table className="w-full text-xs">
            <thead className="text-muted-foreground"><tr><th className="text-left py-1">Label</th><th className="text-right">Hives</th><th className="text-right">Supers</th><th className="text-right">Trucks</th><th className="text-right">Transport KES</th><th className="text-right">When</th></tr></thead>
            <tbody>
              {runs.map((r) => (<tr key={r.id} className="border-t border-border">
                <td className="py-1">{r.label}</td>
                <td className="text-right">{r.outputs.hives}</td>
                <td className="text-right">{r.outputs.supers}</td>
                <td className="text-right">{r.outputs.trucks}</td>
                <td className="text-right">{Number(r.outputs.transportCost).toLocaleString()}</td>
                <td className="text-right text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>))}
              {runs.length === 0 && <tr><td colSpan={6} className="py-3 text-center text-muted-foreground">No runs yet</td></tr>}
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
