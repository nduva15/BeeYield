import { useState, useEffect, useCallback } from "react";
import { X, Bell, Plus, Trash2, BellRing, BellOff, Check, Download, FileText, Filter } from "lucide-react";
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

type AlertSample = {
  hive_label: string;
  metric: string;
  value: number | null;
  snapshotDate?: string | null;
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
const NOTIFICATION_DEDUPE_PREFIX = "beeyield-alert-notification";

export default function AlertsPage({ isOpen, onClose, embedded }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState(EMPTY_RULE);
  const [pushPerm, setPushPerm] = useState<NotificationPermission>(() => ("Notification" in window ? Notification.permission : "default"));
  
  const [filterDays, setFilterDays] = useState<number>(30);
  const [filterHive, setFilterHive] = useState<string>("All");
  const [filterNowMs] = useState<number>(() => Date.now());

  const load = useCallback(async () => {
    const [{ data: r }, { data: e }] = await Promise.all([
      supabase.from("alert_rules").select("*").eq("device_id", deviceId).order("created_at", { ascending: false }),
      supabase.from("alert_events").select("*").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(50),
    ]);
    setRules((r as AlertRule[]) || []);
    setEvents((e as AlertEvent[]) || []);
  }, [deviceId]);

  useEffect(() => {
    if (!isOpen) return;
    load();
  }, [isOpen, load]);

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
    notifyBrowser(msg);
    load();
  };

  const uniqueHives = Array.from(new Set([...rules, ...events].map(x => x.hive_label)));
  const filteredEvents = events.filter(e => {
      if (filterHive !== "All" && e.hive_label !== filterHive) return false;
      if (filterDays > 0) {
          const eTime = new Date(e.created_at).getTime();
          if ((filterNowMs - eTime) / 86400000 > filterDays) return false;
      }
      return true;
  });

  const handleExportCSV = () => {
    let csv = "Date,Hive,Metric,Value,Message,Acknowledged\n";
    filteredEvents.forEach(e => {
      csv += `"${new Date(e.created_at).toLocaleString()}","${e.hive_label}","${e.metric}",${e.value || ""},"${e.message.replace(/"/g, '""')}",${e.acknowledged}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beeyield-alerts-${Date.now()}.csv`;
    a.click();
  };

  const content = (
    <div className={embedded ? "custom-scroll" : "max-h-[85vh] overflow-y-auto custom-scroll"}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Health & Alerts</h2>
          <p className="text-sm text-muted-foreground">Threshold-based notifications for apiary performance</p>
        </div>
        <div className="flex items-center gap-2">
          {pushPerm !== "granted" ? (
            <button onClick={requestPush} className="px-3 py-1.5 rounded-lg border border-honey/30 text-honey text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-honey/5 transition-all">
              <BellRing className="w-3.5 h-3.5" /> Enable Push
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-500/20">
              <Check className="w-3.5 h-3.5" /> Active
            </div>
          )}
          <button onClick={() => setShowNew(true)} className="px-3 py-1.5 rounded-lg bg-honey text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:opacity-90 transition-all shadow-lg shadow-honey/20">
            <Plus className="w-3.5 h-3.5" /> New Rule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rules Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Plus className="w-3 h-3" /> Alert Rules
            </h3>
            <span className="text-[10px] font-bold text-honey bg-honey/10 px-2 py-0.5 rounded-full">{rules.length} Active</span>
          </div>

          {showNew && (
            <div className="p-5 rounded-2xl border-2 border-honey/20 bg-honey/5 animate-in zoom-in-95 duration-200">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Hive Label</label>
                  <input value={draft.hive_label} onChange={(e) => setDraft({ ...draft, hive_label: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white border border-border text-xs font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Metric</label>
                  <select value={draft.metric} onChange={(e) => setDraft({ ...draft, metric: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white border border-border text-xs font-bold">
                    {METRICS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Comparator</label>
                  <select value={draft.comparator} onChange={(e) => setDraft({ ...draft, comparator: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white border border-border text-xs font-bold">
                    <option value="lt">Below</option>
                    <option value="gt">Above</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Threshold</label>
                  <input type="number" step="0.1" value={draft.threshold} onChange={(e) => setDraft({ ...draft, threshold: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-white border border-border text-xs font-bold" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addRule} className="px-4 py-2 rounded-xl bg-honey text-white text-[10px] font-black uppercase tracking-widest flex-1">Save Rule</button>
                <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest border border-border">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {rules.map((r) => (
              <div key={r.id} className={`p-4 rounded-2xl border transition-all ${r.enabled ? "border-honey/20 bg-white/40 shadow-sm" : "border-border bg-muted/20 opacity-60"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.enabled ? 'bg-honey/10 text-honey' : 'bg-muted text-muted-foreground'}`}>
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{r.hive_label}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">
                        {metricLabel(r.metric)} {cmpLabel(r.comparator)} <span className="text-honey font-bold">{r.threshold}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => testFire(r)} className="w-8 h-8 rounded-lg hover:bg-honey/10 text-honey transition-colors flex items-center justify-center" title="Test signal">⚡</button>
                    <button onClick={() => toggleRule(r)} className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground transition-colors flex items-center justify-center">
                      {r.enabled ? <BellRing className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteRule(r.id)} className="w-8 h-8 rounded-lg hover:bg-destructive/10 text-destructive transition-colors flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Bell className="w-3 h-3" /> Recent Signals
            </h3>
            <button onClick={handleExportCSV} className="text-[10px] font-black text-muted-foreground uppercase hover:text-honey transition-colors flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((e) => (
              <div key={e.id} className={`p-4 rounded-2xl border transition-all ${e.acknowledged ? "border-border bg-muted/10 opacity-60" : "border-destructive/20 bg-destructive/5"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${e.acknowledged ? 'bg-muted-foreground' : 'bg-destructive animate-pulse'}`} />
                      <h4 className="text-sm font-bold text-foreground">{e.hive_label}</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{e.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[9px] font-black text-muted-foreground uppercase">{new Date(e.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="text-[9px] font-black text-honey uppercase tracking-wider bg-honey/10 px-1.5 py-0.5 rounded-md">{e.metric}</span>
                    </div>
                  </div>
                  {!e.acknowledged && (
                    <button onClick={() => ackEvent(e.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative transition-all transform ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors z-10"><X className="w-5 h-5" /></button>
        <div className="p-8">{content}</div>
      </div>
    </div>
  );
}

function cmpLabel(c: string) { return c === "lt" ? "<" : c === "gt" ? ">" : "="; }
function metricLabel(metric: string) { return METRICS.find((entry) => entry.value === metric)?.label || metric; }
function canNotifyBrowser() { return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"; }
function notifyBrowser(message: string) { if (!canNotifyBrowser()) return; new Notification("BeeYield Alert", { body: message, icon: "/favicon.ico" }); }
function dedupeStorageKey(deviceId: string, ruleId: string, sample: AlertSample) { return [NOTIFICATION_DEDUPE_PREFIX, deviceId, ruleId, sample.hive_label, sample.metric, sample.snapshotDate || "no-snapshot-date"].join(":"); }
function hasLocalNotificationRecord(key: string) { if (typeof window === "undefined") return false; return localStorage.getItem(key) === "1"; }
function markLocalNotificationRecord(key: string) { if (typeof window === "undefined") return; localStorage.setItem(key, "1"); }
function isMissingSnapshotDateColumn(error: unknown) { const message = error instanceof Error ? error.message : String(error || ""); return message.toLowerCase().includes("snapshot_date"); }

async function hasExistingSnapshotEvent(deviceId: string, ruleId: string, sample: AlertSample) {
  if (!sample.snapshotDate) return false;
  const { data, error } = await (supabase as any).from("alert_events").select("id").eq("device_id", deviceId).eq("rule_id", ruleId).eq("hive_label", sample.hive_label).eq("metric", sample.metric).eq("snapshot_date", sample.snapshotDate).limit(1);
  if (error) return false;
  return Array.isArray(data) && data.length > 0;
}

async function insertAlertEvent(deviceId: string, rule: AlertRule, sample: AlertSample, message: string) {
  const payload = { device_id: deviceId, rule_id: rule.id, hive_label: rule.hive_label, metric: rule.metric, value: sample.value, message, snapshot_date: sample.snapshotDate || null };
  const { error } = await (supabase as any).from("alert_events").insert(payload);
  if (!error) return;
  if (isMissingSnapshotDateColumn(error)) {
    const { error: fallbackError } = await supabase.from("alert_events").insert({ device_id: deviceId, rule_id: rule.id, hive_label: rule.hive_label, metric: rule.metric, value: sample.value, message });
    if (fallbackError) throw fallbackError;
    return;
  }
  throw error;
}

export async function evaluateAlerts(deviceId: string, sample: AlertSample) {
  if (sample.value === null || sample.value === undefined || Number.isNaN(sample.value)) return;
  const { data: rules } = await supabase.from("alert_rules").select("*").eq("device_id", deviceId).eq("enabled", true).eq("metric", sample.metric).eq("hive_label", sample.hive_label);
  if (!rules || rules.length === 0) return;
  for (const r of rules as AlertRule[]) {
    const v = sample.value;
    const fires = (r.comparator === "lt" && v < r.threshold) || (r.comparator === "gt" && v > r.threshold) || (r.comparator === "eq" && Math.abs(v - r.threshold) < 0.01);
    if (!fires) continue;
    const dateSuffix = sample.snapshotDate ? ` for ${sample.snapshotDate}` : "";
    const msg = `${r.hive_label}: ${metricLabel(sample.metric)} = ${v.toFixed(1)} (${cmpLabel(r.comparator)} ${r.threshold})${dateSuffix}`;
    const localKey = dedupeStorageKey(deviceId, r.id, sample);
    if (sample.snapshotDate && (hasLocalNotificationRecord(localKey) || await hasExistingSnapshotEvent(deviceId, r.id, sample))) {
      markLocalNotificationRecord(localKey);
      continue;
    }
    await insertAlertEvent(deviceId, r, sample, msg);
    toast.warning(msg);
    notifyBrowser(msg);
    markLocalNotificationRecord(localKey);
  }
}
