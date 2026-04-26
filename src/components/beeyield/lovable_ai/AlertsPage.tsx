import { useState, useEffect, useCallback } from "react";
import { X, Bell, Plus, Trash2, BellRing, BellOff, Check, Download, FileText, Filter, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { toast } from "sonner";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldBadge, BeeYieldCard } from "../BeeYieldUI";

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

  const handleExportCSV = () => {
    const filteredEvents = events.filter(e => {
        if (filterHive !== "All" && e.hive_label !== filterHive) return false;
        if (filterDays > 0) {
            const eTime = new Date(e.created_at).getTime();
            if ((filterNowMs - eTime) / 86400000 > filterDays) return false;
        }
        return true;
    });
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
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={Bell}
        label="Safety Engine"
        title="Health & Alerts"
        subtitle="Automatic threshold monitoring and browser-level critical signals."
        onBack={onClose}
        actions={
          <div className="flex items-center gap-2">
            {pushPerm !== "granted" ? (
              <button onClick={requestPush} className="px-3 py-1.5 rounded-xl border border-honey/30 bg-honey/5 text-honey text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-honey/10 transition-all">
                <BellRing className="w-3.5 h-3.5" /> Enable Push
              </button>
            ) : (
              <BeeYieldBadge variant="success" className="px-3 py-1.5 font-black uppercase text-[10px] tracking-widest">
                Push Active
              </BeeYieldBadge>
            )}
            <button onClick={() => setShowNew(true)} className="px-3 py-1.5 rounded-xl bg-honey text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-md">
              <Plus className="w-3.5 h-3.5" /> New Rule
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-12">
            {showNew && (
                <BeeYieldCard className="mb-8 border-2 border-honey/20 bg-honey/5 animate-in zoom-in-95 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Hive Label</label>
                    <input value={draft.hive_label} onChange={(e) => setDraft({ ...draft, hive_label: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-border text-sm font-bold outline-none focus:border-honey/40 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Metric</label>
                    <select value={draft.metric} onChange={(e) => setDraft({ ...draft, metric: e.target.value })} className="w-full h-11 px-3 rounded-xl bg-white border border-border text-sm font-bold outline-none focus:border-honey/40 transition-all">
                        {METRICS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    </div>
                    <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Comparator</label>
                    <select value={draft.comparator} onChange={(e) => setDraft({ ...draft, comparator: e.target.value })} className="w-full h-11 px-3 rounded-xl bg-white border border-border text-sm font-bold outline-none focus:border-honey/40 transition-all">
                        <option value="lt">Below</option>
                        <option value="gt">Above</option>
                    </select>
                    </div>
                    <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Threshold</label>
                    <input type="number" step="0.1" value={draft.threshold} onChange={(e) => setDraft({ ...draft, threshold: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-white border border-border text-sm font-bold outline-none focus:border-honey/40 transition-all" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={addRule} className="px-6 py-3 rounded-2xl bg-honey text-white text-[11px] font-black uppercase tracking-widest flex-1 shadow-md hover:opacity-90 transition-all">Create Policy</button>
                    <button onClick={() => setShowNew(false)} className="px-6 py-3 rounded-2xl bg-white text-muted-foreground text-[11px] font-black uppercase tracking-widest border border-border hover:bg-muted transition-all">Cancel</button>
                </div>
                </BeeYieldCard>
            )}
        </div>

        <div className="lg:col-span-5 space-y-6">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                <Activity className="w-3 h-3 text-honey" /> Monitoring Policies
            </h3>
            <div className="space-y-3">
                {rules.map((r) => (
                <BeeYieldCard key={r.id} className={cn("p-5 border-border/50", !r.enabled && "opacity-60 bg-muted/20")}>
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-2xl border flex items-center justify-center", r.enabled ? 'bg-honey/10 border-honey/20 text-honey' : 'bg-muted border-border text-muted-foreground')}>
                            <BellRing className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{r.hive_label}</h4>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                                {metricLabel(r.metric)} {cmpLabel(r.comparator)} <span className="text-honey">{r.threshold}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => testFire(r)} className="w-9 h-9 rounded-xl hover:bg-honey/10 text-honey border border-transparent hover:border-honey/20 transition-all flex items-center justify-center" title="Test signal">⚡</button>
                        <button onClick={() => toggleRule(r)} className="w-9 h-9 rounded-xl hover:bg-muted border border-transparent hover:border-border transition-all flex items-center justify-center">
                            {r.enabled ? <BellRing className="w-4 h-4 text-honey" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
                        </button>
                        <button onClick={() => deleteRule(r.id)} className="w-9 h-9 rounded-xl hover:bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/20 transition-all flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    </div>
                </BeeYieldCard>
                ))}
            </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between ml-1">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                    <Bell className="w-3 h-3 text-honey" /> Critical Signals
                </h3>
                <button onClick={handleExportCSV} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-honey transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download Logs
                </button>
            </div>

          <div className="space-y-3">
            {events.map((e) => (
              <BeeYieldCard key={e.id} className={cn("p-5 border-border/50", e.acknowledged && "opacity-60 grayscale bg-muted/10")}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <BeeYieldBadge variant={e.acknowledged ? 'default' : 'error'} className="px-2 py-0.5 font-black uppercase text-[8px] tracking-widest">
                        {e.acknowledged ? 'CLEARED' : 'UNREAD'}
                      </BeeYieldBadge>
                      <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{e.hive_label}</h4>
                    </div>
                    <p className="text-xs text-foreground font-bold leading-relaxed">{e.message}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{new Date(e.created_at).toLocaleString()}</span>
                      <div className="h-1 w-1 rounded-full bg-border" />
                      <span className="text-[9px] font-black text-honey uppercase tracking-widest">{e.metric}</span>
                    </div>
                  </div>
                  {!e.acknowledged && (
                    <button onClick={() => ackEvent(e.id)} className="w-10 h-10 rounded-2xl bg-honey/10 text-honey border border-honey/20 hover:bg-honey hover:text-white transition-all flex items-center justify-center shadow-sm">
                      <Check className="w-5 h-5 font-black" />
                    </button>
                  )}
                </div>
              </BeeYieldCard>
            ))}
          </div>
        </div>
      </div>
    </BeeYieldPageShell>
  );

  if (embedded) return content;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-3xl w-full h-[90vh] max-w-6xl shadow-2xl relative transition-all transform overflow-hidden ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-full hover:bg-muted transition-colors z-50"><X className="w-5 h-5" /></button>
        <div className="h-full overflow-y-auto custom-scroll p-8">{content}</div>
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
