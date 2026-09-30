import { useState, useEffect, useCallback } from "react";
import { X, Bell, Plus, Trash2, BellRing, BellOff, Check, AlertTriangle, ShieldAlert, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { toast } from "sonner";
import { notifyFieldError } from "@/lib/fieldErrorTranslator";
import { formatOrchardTime } from "@/lib/fieldTimezone";

type AlertRule = {
  id: string;
  hive_label: string;
  metric: string;
  comparator: string;
  threshold: number;
  window_hours: number;
  enabled: boolean;
};

type AlertEvent = {
  id: string;
  hive_label: string;
  metric: string;
  value: number | null;
  message: string;
  acknowledged: boolean;
  created_at: string;
};

const METRICS = [
  { value: "predicted_bees_per_min", label: "Predicted bees/min" },
  { value: "actual_bees_per_min", label: "Actual bees/min" },
  { value: "wind_kmh", label: "Wind speed (km/h)" },
  { value: "temp_c", label: "Temperature (°C)" },
  { value: "precip_mm", label: "Precipitation (mm)" },
  { value: "bloom_intensity", label: "Bloom intensity (%)" },
];

const EMPTY_RULE = { hive_label: "Hive 1", metric: "predicted_bees_per_min", comparator: "lt", threshold: 30, window_hours: 48, enabled: true };

export default function AlertsPage({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState(EMPTY_RULE);
  const [pushPerm, setPushPerm] = useState<NotificationPermission>(() =>
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default",
  );

  const load = useCallback(async () => {
    try {
      const [{ data: r, error: errR }, { data: e, error: errE }] = await Promise.all([
        supabase.from("alert_rules").select("*").eq("device_id", deviceId).order("created_at", { ascending: false }),
        supabase.from("alert_events").select("*").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(50),
      ]);
      if (errR) notifyFieldError(errR, "Unable to load alert rules");
      if (errE) notifyFieldError(errE, "Unable to load recent telemetry events");
      setRules((r as AlertRule[]) || []);
      setEvents((e as AlertEvent[]) || []);
    } catch (err) {
      notifyFieldError(err, "Field alert sync interrupted");
    }
  }, [deviceId]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const requestPush = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Browser notifications not supported on this mobile device");
      return;
    }
    const res = await Notification.requestPermission();
    setPushPerm(res);
    if (res === "granted") toast.success("Browser push notifications enabled!");
  };

  const addRule = async () => {
    const { error } = await supabase.from("alert_rules").insert({
      device_id: deviceId,
      ...draft,
    });
    if (error) {
      notifyFieldError(error, "Could not save alert rule");
      return;
    }
    toast.success("Alert rule created successfully");
    setShowNew(false);
    setDraft(EMPTY_RULE);
    load();
  };

  const deleteRule = async (id: string) => {
    const { error } = await supabase.from("alert_rules").delete().eq("id", id);
    if (error) {
      notifyFieldError(error, "Could not remove alert rule");
      return;
    }
    toast.success("Rule removed");
    load();
  };

  const toggleRule = async (r: AlertRule) => {
    const { error } = await supabase.from("alert_rules").update({ enabled: !r.enabled }).eq("id", r.id);
    if (error) {
      notifyFieldError(error, "Could not update rule status");
      return;
    }
    load();
  };

  const ackEvent = async (id: string) => {
    const { error } = await supabase.from("alert_events").update({ acknowledged: true }).eq("id", id);
    if (error) {
      notifyFieldError(error, "Could not acknowledge event");
      return;
    }
    load();
  };

  const testFire = async (r: AlertRule) => {
    const msg = `TEST: ${r.hive_label} ${METRICS.find((m) => m.value === r.metric)?.label} ${cmpLabel(r.comparator)} ${r.threshold}`;
    await supabase.from("alert_events").insert({
      device_id: deviceId, rule_id: r.id, hive_label: r.hive_label, metric: r.metric, value: r.threshold, message: msg,
    });
    toast.warning(msg);
    if (pushPerm === "granted") new Notification("BeeYield Alert", { body: msg, icon: "/favicon.ico" });
    load();
  };


  if (!isOpen) return null;

  const content = (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center text-honey shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Alerts</h2>
            <p className="text-xs text-muted-foreground">Threshold-based notifications for predicted activity, weather, and bloom conditions</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pushPerm !== "granted" ? (
            <button onClick={requestPush} className="px-3 py-2 rounded-lg border border-honey/50 text-honey text-xs flex items-center gap-1.5"><BellRing className="w-3.5 h-3.5" />Enable push</button>
          ) : (
            <span className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs flex items-center gap-1.5"><Check className="w-3.5 h-3.5" />Push active</span>
          )}
          <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all border border-emerald-500/40"><Plus className="w-4 h-4 text-white stroke-[2.5]" /><span className="text-white">New Rule</span></button>
          {!embedded && (
            <button onClick={onClose} className="w-9 h-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center"><X className="w-4 h-4" /></button>
          )}
        </div>
      </div>

      {showNew && (
        <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary/5">
          <h3 className="font-semibold text-sm mb-3">New alert rule</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <label className="text-xs">Hive label
              <input value={draft.hive_label} onChange={(e) => setDraft({ ...draft, hive_label: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" />
            </label>
            <label className="text-xs">Metric
              <select value={draft.metric} onChange={(e) => setDraft({ ...draft, metric: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm">
                {METRICS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </label>
            <label className="text-xs">Comparator
              <select value={draft.comparator} onChange={(e) => setDraft({ ...draft, comparator: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm">
                <option value="lt">below</option>
                <option value="gt">above</option>
                <option value="eq">equals</option>
              </select>
            </label>
            <label className="text-xs">Threshold
              <input type="number" step="0.1" value={draft.threshold} onChange={(e) => setDraft({ ...draft, threshold: Number(e.target.value) })} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" />
            </label>
            <label className="text-xs">Window (hours)
              <input type="number" value={draft.window_hours} onChange={(e) => setDraft({ ...draft, window_hours: Number(e.target.value) })} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" />
            </label>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addRule} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all border border-emerald-500/40"><span className="text-white">Save Rule</span></button>
            <button onClick={() => { setShowNew(false); setDraft(EMPTY_RULE); }} className="px-3 py-2 rounded-lg border border-border text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Rules ({rules.length})</h3>
          <div className="space-y-2">
            {rules.length === 0 && <div className="p-4 rounded-xl border border-dashed border-border text-xs text-muted-foreground text-center">No alert rules yet.</div>}
            {rules.map((r) => (
              <div key={r.id} className={`p-3 rounded-xl border ${r.enabled ? "border-honey/30 bg-honey/5" : "border-border bg-muted/30 opacity-60"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 text-sm">
                    <div className="font-semibold text-foreground">{r.hive_label}</div>
                    <div className="text-xs text-muted-foreground">{METRICS.find((m) => m.value === r.metric)?.label || r.metric} {cmpLabel(r.comparator)} <b className="text-honey">{r.threshold}</b> · window {r.window_hours}h</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => testFire(r)} className="p-1.5 rounded hover:bg-muted text-xs" title="Test fire">⚡</button>
                    <button onClick={() => toggleRule(r)} className="p-1.5 rounded hover:bg-muted" title={r.enabled ? "Disable" : "Enable"}>{r.enabled ? <BellRing className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}</button>
                    <button onClick={() => deleteRule(r.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs uppercase text-muted-foreground font-semibold">Calibrated Events ({events.length})</h3>
            <span className="text-[10px] font-mono text-muted-foreground">Orchard Solar Time</span>
          </div>
          <div className="space-y-2">
            {events.length === 0 && <div className="p-4 rounded-xl border border-dashed border-border text-xs text-muted-foreground text-center">No events yet. All colony vitals within target parameters.</div>}
            {events.map((e) => {
              const metric = (e.metric || '').toLowerCase();
              const val = e.value;
              const isCritical = (metric.includes('temp') && val !== null && (val < 32 || val > 38)) ||
                                 (metric.includes('bees_per_min') && val !== null && val < 5);
              const isWarning = !isCritical && (metric.includes('wind') || metric.includes('temp') || metric.includes('precip') || metric.includes('bloom'));
              
              const borderClass = e.acknowledged 
                ? "border-border opacity-50 bg-card" 
                : isCritical 
                  ? "border-red-500/50 bg-red-50/30 dark:bg-red-950/20 shadow-xs" 
                  : isWarning 
                    ? "border-amber-400/40 bg-amber-50/20 dark:bg-amber-950/10" 
                    : "border-border bg-card";

              const badgeColor = isCritical
                ? "bg-red-600 text-white"
                : isWarning
                  ? "bg-amber-500 text-black font-bold"
                  : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300";

              const tierLabel = isCritical ? "CRITICAL EMERGENCY" : isWarning ? "OPERATIONAL WARNING" : "ROUTINE ADVISORY";
              const Icon = isCritical ? ShieldAlert : isWarning ? AlertTriangle : Info;

              return (
                <div key={e.id} className={`p-3.5 rounded-xl border ${borderClass} transition-all`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isCritical ? 'bg-red-500/10 text-red-600' : isWarning ? 'bg-amber-500/10 text-amber-600' : 'bg-stone-500/10 text-stone-500'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${badgeColor}`}>
                            {tierLabel}
                          </span>
                          <span className="text-sm font-bold text-foreground truncate">{e.hive_label}</span>
                          <span className="text-xs text-muted-foreground font-mono">· {e.metric}</span>
                        </div>
                        <div className="text-xs text-foreground/90 mt-1 font-medium">{e.message}</div>
                        <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
                          <span>Field Time: <strong>{formatOrchardTime(e.created_at, 'full')}</strong></span>
                        </div>
                      </div>
                    </div>
                    {!e.acknowledged && (
                      <button 
                        onClick={() => ackEvent(e.id)} 
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-xs shrink-0 cursor-pointer active:scale-95 transition-all" 
                        title="Acknowledge & Clear"
                      >
                        <Check className="w-3.5 h-3.5 text-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 rounded-xl border border-primary/30 bg-primary/5 text-xs text-muted-foreground">
        <b className="text-primary">How it works:</b> Activity Forecaster writes daily forecast snapshots; opening the Forecaster (or the Alerts page) re-evaluates rules against the latest predictions, weather, and bloom data. Triggered events appear here and as toasts; if browser push is enabled, you get a notification even when the tab is in the background.
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-5xl shadow-2xl p-4 sm:p-6 overflow-y-auto max-h-[90vh] my-auto">
        {content}
      </div>
    </div>
  );
}

function cmpLabel(c: string) { return c === "lt" ? "<" : c === "gt" ? ">" : "="; }

// Exported helper for the Forecaster to call when it produces a new prediction.
// Dedupes per (rule, snapshot date, hive) so the same forecast doesn't fire repeatedly.
export async function evaluateAlerts(
  deviceId: string,
  sample: { hive_label: string; metric: string; value: number; snapshotDate?: string }
) {
  const { data: rules } = await supabase
    .from("alert_rules")
    .select("*")
    .eq("device_id", deviceId)
    .eq("enabled", true)
    .eq("metric", sample.metric)
    .eq("hive_label", sample.hive_label);
  if (!rules || rules.length === 0) return;
  const snapshot = sample.snapshotDate || new Date().toISOString().slice(0, 10);
  for (const r of rules as AlertRule[]) {
    const v = sample.value;
    const fires = (r.comparator === "lt" && v < r.threshold) || (r.comparator === "gt" && v > r.threshold) || (r.comparator === "eq" && Math.abs(v - r.threshold) < 0.01);
    if (!fires) continue;
    const dedupe_key = `${r.id}|${snapshot}|${r.hive_label}`;
    const msg = `${r.hive_label}: ${sample.metric} = ${v.toFixed(1)} (${cmpLabel(r.comparator)} ${r.threshold})`;
    // Insert with unique dedupe_key — duplicate inserts are silently ignored,
    // and we only fire the toast/push when the insert actually creates a row.
    const { data: inserted, error } = await supabase
      .from("alert_events")
      .insert({
        device_id: deviceId, rule_id: r.id, hive_label: r.hive_label, metric: r.metric,
        value: v, message: msg, dedupe_key, snapshot_date: snapshot,
      })
      .select("id");
    if (error) {
      // 23505 = unique violation → already notified for this snapshot/hive/rule
      if ((error as { code?: string }).code !== "23505") console.warn("alert insert", error);
      continue;
    }
    if (!inserted || inserted.length === 0) continue;
    toast.warning(msg);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("BeeYield Alert", { body: msg, icon: "/favicon.ico", tag: dedupe_key });
    }
  }
}
