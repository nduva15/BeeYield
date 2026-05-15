import { useState, useEffect, useRef } from "react";
import { Plane, Play, Pause, RotateCcw, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";

// Lightweight one-tap activity counter — quicker workflow than the full BeeFlightTracker.
// Tap "+1" each time a bee exits the entrance during the 60-second window.
export default function ActivityCounter({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [hiveLabel, setHiveLabel] = useState("Hive 1");
  const [florage, setFlorage] = useState("");
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { setRunning(false); window.clearInterval(intervalRef.current!); toast.success(`Counter complete: ${count} bees/min`); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const reset = () => { setCount(0); setSeconds(60); setRunning(false); };

  const save = async () => {
    if (count === 0) { toast.error("Run a count first"); return; }
     
    const { error } = await (supabase as any).from("bee_flight_logs").insert({
      device_id: deviceId, hive_label: hiveLabel, bees_per_minute: count,
      pollen_loads: 0, florage_source: florage || null, observed_at: new Date().toISOString(),
    });
    if (error) { toast.error("Save failed"); return; }
    toast.success(`Saved ${count}/min for ${hiveLabel}`);
    reset();
  };

  // Activity band interpretation
  const band =
    count < 20 ? { label: "Weak / dearth", colour: "text-destructive", note: "Investigate queen status, weather, dearth." } :
    count < 60 ? { label: "Normal early/late season", colour: "text-foreground", note: "Healthy baseline activity." } :
    count < 120 ? { label: "Healthy mid-season", colour: "text-honey", note: "Good nectar flow." } :
    count < 250 ? { label: "Strong nectar flow", colour: "text-honey font-bold", note: "Confirm super capacity." } :
    { label: "Peak / robbing risk", colour: "text-destructive font-bold", note: "Inspect for swarm prep or robbing." };

  if (!isOpen) return null;
  return (
    <div className={embedded ? "relative z-0 bg-background flex items-center justify-center p-4 pt-6 min-h-[calc(100vh-10rem)]" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"}>
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Plane className="w-5 h-5 text-honey" /><h2 className="font-display text-lg font-bold text-honey">Quick Activity Counter</h2></div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <input value={hiveLabel} onChange={(e) => setHiveLabel(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="Hive label" />
          <input value={florage} onChange={(e) => setFlorage(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="Florage (e.g. clover)" />
        </div>

        <div className="text-center py-6 mb-4 rounded-xl bg-muted/40 border border-border">
          <div className="text-6xl font-display font-bold text-honey">{count}</div>
          <div className="text-xs text-muted-foreground mt-1">bees / minute</div>
          <div className="text-xs text-muted-foreground mt-3">Time left: <b className="text-foreground">{seconds}s</b></div>
        </div>

        <button
          onClick={() => running && setCount(count + 1)}
          disabled={!running}
          className="w-full py-6 rounded-xl bg-gradient-amber text-primary-foreground text-2xl font-bold mb-3 disabled:opacity-40 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6 inline mr-2" /> +1 bee
        </button>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <button onClick={() => { setSeconds(60); setRunning(true); }} className="px-3 py-2 rounded-lg border border-honey/40 text-honey text-xs flex items-center justify-center gap-1"><Play className="w-3 h-3" /> Start</button>
          <button onClick={() => setRunning(false)} className="px-3 py-2 rounded-lg border border-border text-xs flex items-center justify-center gap-1"><Pause className="w-3 h-3" /> Pause</button>
          <button onClick={reset} className="px-3 py-2 rounded-lg border border-border text-xs flex items-center justify-center gap-1"><RotateCcw className="w-3 h-3" /> Reset</button>
        </div>

        {count > 0 && (
          <div className="p-3 rounded-lg border border-honey/30 bg-honey/5 mb-3 text-xs">
            <b className={band.colour}>{band.label}</b><br />
            <span className="text-muted-foreground">{band.note}</span>
          </div>
        )}

        <button onClick={save} disabled={count === 0} className="w-full px-4 py-2.5 rounded-lg bg-gradient-amber text-primary-foreground font-semibold text-sm disabled:opacity-50">Save to Bee Flight Logs</button>

        <p className="text-[10px] text-muted-foreground mt-3 text-center">Linked to: Bee Flight Tracker · MOA Activity panel · Activity Forecaster · Pollination Planning</p>
      </div>
    </div>
  );
}
