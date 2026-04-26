import { useState, useEffect } from "react";
import { X, Activity, Play, Pause, RotateCcw, Save, Trash2, Calendar, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldCard, BeeYieldBadge } from "../BeeYieldUI";
import { cn } from "@/lib/utils";

interface Log {
  id: string;
  hive_label: string;
  count: number;
  duration_seconds: number;
  created_at: string;
}

export default function ActivityCounter({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [hiveLabel, setHiveLabel] = useState("Hive 1");
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [logs, setLogs] = useState<Log[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const loadLogs = async () => {
    const { data } = await supabase.from("activity_logs").select("*").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(20);
    if (data) setLogs(data as Log[]);
  };

  useEffect(() => {
    if (isOpen) loadLogs();
  }, [isOpen]);

  const saveLog = async () => {
    if (count === 0) { toast.error("Count is zero"); return; }
    setSaving(true);
    const { error } = await supabase.from("activity_logs").insert({
      device_id: deviceId, hive_label: hiveLabel, count, duration_seconds: seconds,
    });
    setSaving(false);
    if (error) { toast.error("Failed to save"); return; }
    toast.success("Activity logged");
    setCount(0); setSeconds(0); setIsRunning(false);
    loadLogs();
  };

  const deleteLog = async (id: string) => {
    await supabase.from("activity_logs").delete().eq("id", id);
    loadLogs();
  };

  if (!isOpen) return null;

  const content = (
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={Activity}
        label="Telemetry"
        title="Physical Counter"
        subtitle="Manual forager-day assessment for colony strength calibration."
        onBack={onClose}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => { setCount(0); setSeconds(0); setIsRunning(false); }} className="px-3 py-1.5 rounded-xl border border-border bg-white text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-all">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={saveLog} disabled={saving || count === 0} className="px-3 py-1.5 rounded-xl bg-honey text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-md disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> Save Data
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-12">
            <BeeYieldCard className="p-10 border-honey/40 bg-honey/10 relative overflow-hidden text-center cursor-pointer select-none active:scale-[0.98] transition-transform" onClick={() => isRunning && setCount(c => c + 1)}>
                <div className="relative z-10">
                    <div className="text-[10px] font-black text-honey uppercase tracking-[0.3em] mb-4">Bee Traffic Count</div>
                    <div className="text-8xl font-black text-foreground tabular-nums tracking-tighter">{count}</div>
                    <div className="mt-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        {seconds}s <span className="opacity-50 mx-2">|</span> {(count / (seconds || 1) * 60).toFixed(1)} bpm
                    </div>
                    <div className="mt-8 flex justify-center gap-4">
                        <button onClick={(e) => { e.stopPropagation(); setIsRunning(!isRunning); }} className={cn("px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl", isRunning ? "bg-white text-honey border border-honey/20 shadow-honey/10" : "bg-honey text-white shadow-honey/30")}>
                            {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                            {isRunning ? "Pause Session" : "Start Counting"}
                        </button>
                    </div>
                    {!isRunning && count === 0 && (
                        <p className="mt-6 text-[10px] font-black text-honey/60 uppercase tracking-widest animate-pulse">Press Start to Begin Observation</p>
                    )}
                    {isRunning && (
                        <p className="mt-6 text-[10px] font-black text-honey uppercase tracking-widest animate-bounce">Tap Anywhere to Count</p>
                    )}
                </div>
            </BeeYieldCard>
        </div>

        <div className="lg:col-span-4 space-y-6">
            <BeeYieldSection title="Sesssion Configuration" icon={ClipboardCheck}>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Hive Subject</label>
                        <input value={hiveLabel} onChange={(e) => setHiveLabel(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-border text-sm font-bold outline-none focus:border-honey/40 transition-all shadow-sm" />
                    </div>
                    <BeeYieldCard className="p-4 border-border/50 bg-muted/10">
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">Standard BeeYield protocols recommend 60-second observations at solar noon for peak accuracy.</p>
                    </BeeYieldCard>
                </div>
            </BeeYieldSection>
        </div>

        <div className="lg:col-span-8 space-y-6">
            <BeeYieldSection title="Historical Observations" icon={Calendar}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scroll pr-2">
                    {logs.map((log) => (
                        <BeeYieldCard key={log.id} className="p-4 border-border/60 bg-white hover:border-honey/40 transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-black text-foreground uppercase truncate tracking-tight">{log.hive_label}</h4>
                                    <div className="text-[10px] text-honey font-black uppercase mt-0.5">{log.count} bees <span className="text-muted-foreground mx-1">·</span> {log.duration_seconds}s</div>
                                    <div className="text-[9px] text-muted-foreground font-bold mt-1 uppercase italic">{new Date(log.created_at).toLocaleString()}</div>
                                </div>
                                <button onClick={() => deleteLog(log.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </BeeYieldCard>
                    ))}
                    {logs.length === 0 && <p className="col-span-full py-12 text-center text-xs text-muted-foreground italic border-2 border-dashed border-border rounded-2xl">No recorded sessions in this device brain.</p>}
                </div>
            </BeeYieldSection>
        </div>
      </div>
    </BeeYieldPageShell>
  );

  if (embedded) return content;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity p-4", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <div className={cn("bg-white rounded-[2.5rem] w-full h-[85vh] max-w-4xl shadow-2xl relative transition-all transform overflow-hidden", isOpen ? "scale-100" : "scale-95")}>
        <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-full hover:bg-muted transition-colors z-50 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <div className="h-full overflow-y-auto custom-scroll p-8">
          {content}
        </div>
      </div>
    </div>
  );
}
