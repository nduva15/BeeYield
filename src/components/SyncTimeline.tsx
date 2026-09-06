import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardList, AudioLines, RefreshCw, Loader2, CheckCircle2, AlertCircle,
  Clock, History,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resyncRecord } from "@/lib/integrations.functions";
import { toast } from "sonner";

type Kind = "inspection" | "acoustic";
type ProviderId = "shopify" | "quickbooks";

const PROVIDERS: { id: ProviderId; name: string }[] = [
  { id: "shopify", name: "Shopify" },
  { id: "quickbooks", name: "QuickBooks" },
];

type Item = {
  id: string;
  kind: Kind;
  hive: string;
  when: string;
  title: string;
  status: string;
};

type LogRow = {
  id: string;
  provider: string;
  status: string;
  detail: string | null;
  created_at: string;
  record_id: string | null;
};

type Outcome = { state: "ok" | "error" | "skipped" | "never"; detail: string; at?: string };

function outcomeTone(state: Outcome["state"]) {
  if (state === "ok") return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (state === "error") return "text-red-400 border-red-500/30 bg-red-500/10";
  if (state === "skipped") return "text-honey border-honey/30 bg-honey/10";
  return "text-muted-foreground border-border";
}

function OutcomeIcon({ state }: { state: Outcome["state"] }) {
  if (state === "ok") return <CheckCircle2 className="w-3 h-3" />;
  if (state === "error") return <AlertCircle className="w-3 h-3" />;
  return <Clock className="w-3 h-3" />;
}

/**
 * Per-record history of what reached Shopify and QuickBooks, newest first,
 * with a one-click retry for anything that failed or was skipped.
 */
export default function SyncTimeline({ deviceId }: { deviceId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "failed" | Kind>("all");
  const [busy, setBusy] = useState<string>("");

  const load = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    const [insp, aud, lg] = await Promise.all([
      supabase.from("inspections")
        .select("id,hive_label,inspected_on,colony_health,issues,created_at")
        .eq("device_id", deviceId).order("created_at", { ascending: false }).limit(80),
      supabase.from("sound_analyses")
        .select("id,hive_label,recorded_at,health_state,health_confidence,created_at")
        .eq("device_id", deviceId).order("created_at", { ascending: false }).limit(80),
      supabase.from("integration_sync_logs")
        .select("id,provider,status,detail,created_at,record_id")
        .eq("device_id", deviceId).not("record_id", "is", null)
        .order("created_at", { ascending: false }).limit(400),
    ]);

    const a: Item[] = (insp.data ?? []).map((r) => ({
      id: r.id,
      kind: "inspection" as const,
      hive: r.hive_label,
      when: r.created_at ?? r.inspected_on,
      status: r.colony_health,
      title: (r.issues as string[] | null)?.length
        ? `Inspection — ${(r.issues as string[]).slice(0, 3).join(", ")}`
        : "Inspection — no issues recorded",
    }));
    const b: Item[] = (aud.data ?? []).map((r) => ({
      id: r.id,
      kind: "acoustic" as const,
      hive: r.hive_label,
      when: r.created_at ?? r.recorded_at,
      status: r.health_state,
      title: `Acoustic audit — ${Math.round(Number(r.health_confidence) * 100)}% confidence`,
    }));

    setItems([...a, ...b].sort((x, y) => (x.when < y.when ? 1 : -1)));
    setLogs((lg.data as LogRow[]) ?? []);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => { void load(); }, [load]);

  const outcomeFor = useCallback(
    (recordId: string, provider: ProviderId): Outcome => {
      const hit = logs.find((l) => l.record_id === recordId && l.provider === provider);
      if (!hit) return { state: "never", detail: "Not sent yet" };
      const state = hit.status === "ok" ? "ok" : hit.status === "skipped" ? "skipped" : "error";
      return { state, detail: hit.detail ?? "", at: hit.created_at };
    },
    [logs],
  );

  const visible = useMemo(() => {
    if (filter === "inspection" || filter === "acoustic") return items.filter((i) => i.kind === filter);
    if (filter === "failed") {
      return items.filter((i) => PROVIDERS.some((p) => outcomeFor(i.id, p.id).state === "error"));
    }
    return items;
  }, [items, filter, outcomeFor]);

  const failedCount = useMemo(
    () => items.filter((i) => PROVIDERS.some((p) => outcomeFor(i.id, p.id).state === "error")).length,
    [items, outcomeFor],
  );

  const retry = async (item: Item, provider: ProviderId) => {
    const key = `${item.id}:${provider}`;
    setBusy(key);
    try {
      const res = await resyncRecord({ data: { deviceId, provider, kind: item.kind, recordId: item.id } });
      if (res.ok) toast.success(`${provider === "shopify" ? "Shopify" : "QuickBooks"} re-synced`, { description: res.detail });
      else toast.error("Re-sync failed", { description: res.detail });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Re-sync failed");
    } finally {
      setBusy("");
    }
  };

  const retryAllFailed = async () => {
    const jobs: { item: Item; provider: ProviderId }[] = [];
    for (const item of items) {
      for (const p of PROVIDERS) if (outcomeFor(item.id, p.id).state === "error") jobs.push({ item, provider: p.id });
    }
    if (jobs.length === 0) { toast.info("Nothing to retry"); return; }
    setBusy("all");
    let good = 0;
    for (const job of jobs) {
      try {
        const res = await resyncRecord({ data: { deviceId, provider: job.provider, kind: job.item.kind, recordId: job.item.id } });
        if (res.ok) good++;
      } catch { /* counted as failure below */ }
    }
    setBusy("");
    toast[good === jobs.length ? "success" : "warning"](`${good}/${jobs.length} record(s) re-synced`);
    await load();
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <History className="w-5 h-5 text-honey" />
        <div>
          <h2 className="font-display text-lg text-honey">Record sync timeline</h2>
          <p className="text-[11px] text-muted-foreground">
            Every inspection and acoustic audit, and exactly what reached Shopify and QuickBooks.
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {([["all", "All"], ["inspection", "Inspections"], ["acoustic", "Acoustic"], ["failed", `Failures${failedCount ? ` (${failedCount})` : ""}`]] as const).map(
            ([id, label]) => (
              <button key={id} onClick={() => setFilter(id as typeof filter)}
                className={`px-2.5 py-1 rounded-full text-[11px] border ${filter === id ? "bg-honey/20 border-honey text-honey" : "border-border text-muted-foreground hover:border-honey/40"}`}>
                {label}
              </button>
            ),
          )}
          <button onClick={() => void load()} disabled={loading}
            className="px-2.5 py-1 rounded-full text-[11px] border border-border text-muted-foreground flex items-center gap-1 disabled:opacity-50">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Refresh
          </button>
          {failedCount > 0 && (
            <button onClick={retryAllFailed} disabled={busy !== ""}
              className="px-2.5 py-1 rounded-full text-[11px] bg-honey text-background font-semibold flex items-center gap-1 disabled:opacity-50">
              {busy === "all" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Re-sync all failures
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">
          {loading ? "Loading records…" : "No records yet — log an inspection or run an acoustic audit and it will appear here."}
        </p>
      ) : (
        <ol className="relative border-l border-border ml-2 space-y-4">
          {visible.map((item) => (
            <li key={`${item.kind}-${item.id}`} className="ml-4">
              <span className="absolute -left-[7px] mt-1.5 w-3 h-3 rounded-full bg-honey" />
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="flex flex-wrap items-center gap-2">
                  {item.kind === "inspection"
                    ? <ClipboardList className="w-4 h-4 text-honey" />
                    : <AudioLines className="w-4 h-4 text-honey" />}
                  <span className="text-sm font-medium text-foreground">{item.hive}</span>
                  <span className="px-2 py-0.5 rounded-full border border-border text-[10px] text-muted-foreground">{item.status}</span>
                  <span className="text-[11px] text-muted-foreground">{item.title}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/70">{new Date(item.when).toLocaleString()}</span>
                </div>

                <div className="mt-2 grid sm:grid-cols-2 gap-2">
                  {PROVIDERS.map((p) => {
                    const o = outcomeFor(item.id, p.id);
                    const key = `${item.id}:${p.id}`;
                    return (
                      <div key={p.id} className={`rounded-lg border p-2 text-[11px] ${outcomeTone(o.state)}`}>
                        <div className="flex items-center gap-1.5">
                          <OutcomeIcon state={o.state} />
                          <span className="font-semibold">{p.name}</span>
                          <span className="opacity-80">
                            {o.state === "ok" ? "synced" : o.state === "error" ? "failed" : o.state === "skipped" ? "skipped" : "not sent"}
                          </span>
                          {o.state !== "ok" && (
                            <button onClick={() => retry(item, p.id)} disabled={busy !== ""}
                              className="ml-auto px-2 py-0.5 rounded-full border border-current text-[10px] flex items-center gap-1 disabled:opacity-50">
                              {busy === key ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />} Re-sync
                            </button>
                          )}
                        </div>
                        {o.detail && <p className="mt-1 opacity-80 break-words">{o.detail}</p>}
                        {o.at && <p className="mt-0.5 opacity-60">{new Date(o.at).toLocaleString()}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
