import { useState, useEffect, useCallback } from "react";
import { Bell, Plus, Trash2, BellRing, BellOff, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { toast } from "sonner";

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

export default function AlertsPage({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const deviceId = useDeviceId();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState(EMPTY_RULE);
  const [pushPerm, setPushPerm] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) setPushPerm(Notification.permission);
  }, []);

  const load = useCallback(async () => {
    const [{ data: r }, { data: e }] = await Promise.all([
      supabase.from("alert_rules").select("*").eq("device_id", deviceId).order("created_at", { ascending: false }),
      supabase.from("alert_events").select("*").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(50),
    ]);
    setRules((r as AlertRule[]) || []);
    setEvents((e as AlertEvent[]) || []);
  }, [deviceId]);

  useEffect(() => { if (isOpen) load(); }, [isOpen, load]);

  const requestPush = async () => {
    if (!("Notification" in window)) { toast.error("Notifications not supported"); return; }
    const p = await Notification.requestPermission();
    setPushPerm(p);
    if (p === "granted") toast.success("Browser notifications enabled");
    else toast.error("Permission denied");
  };

  const addRule = async () => {
    const { error } = await supabase.from("alert_rules").insert({ ...draft, device_id: deviceId });
    if (error) { toast.error(error.message); return; }
    toast.success("Alert created");
    setShowNew(false); setDraft(EMPTY_RULE); load();
  };

  const toggleRule = async (r: AlertRule) => {
    await supabase.from("alert_rules").update({ enabled: !r.enabled }).eq("id", r.id);
    load();
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Delete this alert?")) return;
    await supabase.from("alert_rules").delete().eq("id", id);
    toast.success("Deleted");
    load();
  };

  const ackEvent = async (id: string) => {
    await supabase.from("alert_events").update({ acknowledged: true }).eq("id", id);
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
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Alerts</h1>
              <p className="text-xs text-muted-foreground">Threshold-based notifications for predicted activity, weather, and bloom conditions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pushPerm !== "granted" ? (
              <button onClick={requestPush} className="px-3 py-2 rounded-lg border border-honey/50 text-honey text-xs flex items-center gap-1.5"><BellRing className="w-3.5 h-3.5" />Enable browser push</button>
            ) : (
              <span className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs flex items-center gap-1.5"><Check className="w-3.5 h-3.5" />Push enabled</span>
            )}
            <button onClick={() => setShowNew(true)} className="px-3 py-2 rounded-lg bg-honey text-honey-foreground text-xs font-semibold flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />New rule</button>
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
              <button onClick={addRule} className="px-3 py-2 rounded-lg bg-honey text-honey-foreground text-xs font-semibold">Save rule</button>
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
            <h3 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Recent events ({events.length})</h3>
            <div className="space-y-2">
              {events.length === 0 && <div className="p-4 rounded-xl border border-dashed border-border text-xs text-muted-foreground text-center">No events yet.</div>}
              {events.map((e) => (
                <div key={e.id} className={`p-3 rounded-xl border ${e.acknowledged ? "border-border opacity-50" : "border-destructive/30 bg-destructive/5"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-foreground">{e.hive_label} <span className="text-xs text-muted-foreground">· {e.metric}</span></div>
                      <div className="text-xs text-muted-foreground">{e.message}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{new Date(e.created_at).toLocaleString()}</div>
                    </div>
                    {!e.acknowledged && <button onClick={() => ackEvent(e.id)} className="p-1.5 rounded hover:bg-muted text-xs" title="Acknowledge"><Check className="w-3.5 h-3.5" /></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 rounded-xl border border-primary/30 bg-primary/5 text-xs text-muted-foreground">
          <b className="text-primary">How it works:</b> Activity Forecaster writes daily forecast snapshots; opening the Forecaster (or the Alerts page) re-evaluates rules against the latest predictions, weather, and bloom data. Triggered events appear here and as toasts; if browser push is enabled, you get a notification even when the tab is in the background.
        </div>
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
