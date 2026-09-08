import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X, ClipboardList, Plus, Search, Trash2, HeartPulse, AlertTriangle, Activity,
  Sparkles, Loader2, Save, CalendarDays, MapPin, Crown, Bug, FileDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { streamBeeGpt } from "@/lib/beegpt-stream";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { toast } from "sonner";
import { autoSyncRecord } from "@/lib/integration-sync";
import { downloadReportPdf, safeName } from "@/lib/report-pdf";

type Inspection = {
  id: string;
  inspected_on: string;
  location: string;
  hive_label: string;
  batch: string;
  colony_health: string;
  temperament: string;
  queen_seen: boolean;
  queen_cells: number;
  brood_frames: number;
  honey_frames: number;
  varroa_count: number;
  issues: string[];
  actions: string[];
  weather: string | null;
  notes: string | null;
  ai_insights: string | null;
  created_at: string;
};

const HEALTH = ["Healthy", "Watch", "At risk", "Critical"];
const TEMPERAMENT = ["Calm", "Nervous", "Defensive", "Aggressive"];
const ISSUE_OPTIONS = [
  "Varroa mites", "Chalkbrood", "American foulbrood", "European foulbrood", "Nosema",
  "Wax moth", "Small hive beetle", "Ants", "Queen failing", "Queenless",
  "Laying workers", "Swarm cells", "Robbing", "Starvation risk", "Chilled brood", "Deformed wing virus",
];
const ACTION_OPTIONS = [
  "Treated for varroa", "Fed syrup", "Fed pollen patty", "Added super", "Removed super",
  "Requeened", "Removed swarm cells", "Split colony", "Combined colonies",
  "Cleaned floor", "Replaced comb", "Narrowed entrance", "Scheduled follow-up",
];

const EMPTY = {
  inspected_on: new Date().toISOString().slice(0, 10),
  location: "",
  hive_label: "BY-H001",
  batch: "Batch A",
  colony_health: "Healthy",
  temperament: "Calm",
  queen_seen: true,
  queen_cells: 0,
  brood_frames: 4,
  honey_frames: 3,
  varroa_count: 0,
  issues: [] as string[],
  actions: [] as string[],
  weather: "",
  notes: "",
};

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
        active
          ? "bg-honey/20 border-honey text-honey"
          : "bg-card border-border text-muted-foreground hover:border-honey/40"
      }`}
    >
      {children}
    </button>
  );
}

function healthTone(h: string) {
  if (h === "Healthy") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (h === "Watch") return "text-honey bg-honey/10 border-honey/30";
  if (h === "At risk") return "text-orange-400 bg-orange-500/10 border-orange-500/30";
  return "text-red-400 bg-red-500/10 border-red-500/30";
}

function inspectionPdf(r: Inspection) {
  downloadReportPdf({
    kind: "inspection",
    title: `Hive inspection — ${r.hive_label}`,
    subtitle: `${r.location || "Location not recorded"} · inspected ${r.inspected_on}`,
    badge: r.colony_health.toUpperCase(),
    fileName: `beeyield-inspection-${safeName(r.hive_label)}-${r.inspected_on}.pdf`,
    sections: [
      {
        type: "kv",
        heading: "Colony summary",
        rows: [
          ["Hive", r.hive_label],
          ["Batch", r.batch],
          ["Inspected on", r.inspected_on],
          ["Location", r.location || "—"],
          ["Colony health", r.colony_health],
          ["Temperament", r.temperament],
          ["Queen sighted", r.queen_seen ? "Yes" : "No"],
          ["Queen cells", String(r.queen_cells)],
          ["Brood frames", String(r.brood_frames)],
          ["Honey frames", String(r.honey_frames)],
          ["Varroa / 300 bees", String(r.varroa_count)],
          ["Weather", r.weather || "—"],
        ],
      },
      { type: "list", heading: "Issues found", items: r.issues ?? [] },
      { type: "list", heading: "Actions taken", items: r.actions ?? [] },
      ...(r.notes ? [{ type: "text" as const, heading: "Beekeeper notes", body: r.notes }] : []),
      ...(r.ai_insights ? [{ type: "text" as const, heading: "AI diagnosis", body: r.ai_insights }] : []),
    ],
  });
}

export default function InspectionsPage({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const deviceId = useDeviceId();
  const [rows, setRows] = useState<Inspection[]>([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inspections")
      .select("*")
      .eq("device_id", deviceId)
      .order("inspected_on", { ascending: false })
      .limit(300);
    if (error) toast.error(error.message);
    setRows((data as Inspection[]) ?? []);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => { if (isOpen) void load(); }, [isOpen, load]);

  const stats = useMemo(() => {
    const total = rows.length;
    const healthy = rows.filter((r) => r.colony_health === "Healthy" && r.issues.length === 0).length;
    const issues = rows.filter((r) => r.issues.length > 0 || r.colony_health !== "Healthy").length;
    const varroa = rows.length
      ? Math.round(rows.reduce((a, r) => a + (r.varroa_count || 0), 0) / rows.length)
      : 0;
    return { total, healthy, issues, varroa };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.hive_label, r.location, r.batch, r.colony_health, r.temperament, r.notes ?? "", ...r.issues, ...r.actions]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  const toggle = (key: "issues" | "actions", value: string) =>
    setDraft((d) => ({
      ...d,
      [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value],
    }));

  const runAi = async () => {
    setAiLoading(true);
    setAiText("");
    try {
      const prompt = `Act as Beeyield's diagnostic vet. Interpret this hive inspection and give a diagnosis.

Date: ${draft.inspected_on}
Hive: ${draft.hive_label} (${draft.batch}) at ${draft.location || "unspecified site"}
Colony health call: ${draft.colony_health} · temperament: ${draft.temperament}
Queen seen: ${draft.queen_seen ? "yes" : "no"} · queen cells: ${draft.queen_cells}
Brood frames: ${draft.brood_frames} · honey frames: ${draft.honey_frames}
Varroa count (24h drop / 300-bee wash): ${draft.varroa_count}
Observed issues: ${draft.issues.join(", ") || "none recorded"}
Actions already taken: ${draft.actions.join(", ") || "none"}
Weather: ${draft.weather || "n/a"}
Notes: ${draft.notes || "none"}

Return: (1) most likely diagnosis with confidence, (2) differential diagnoses to rule out, (3) varroa threshold interpretation, (4) treatment protocol with dosages suited to East African conditions, (5) a 14-day follow-up plan, (6) biosecurity warnings.`;
      await streamBeeGpt(prompt, setAiText);
    } catch {
      toast.error("AI diagnosis failed");
    } finally {
      setAiLoading(false);
    }
  };

  const save = async () => {
    if (!draft.hive_label.trim()) { toast.error("Hive label is required"); return; }
    setSaving(true);
    const { data: saved, error } = await supabase.from("inspections").insert({
      device_id: deviceId,
      ...draft,
      weather: draft.weather || null,
      notes: draft.notes || null,
      ai_insights: aiText || null,
    }).select("id").single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Inspection logged");
    void autoSyncRecord({
      deviceId,
      kind: "inspection",
      recordId: saved?.id ?? crypto.randomUUID(),
      hiveLabel: draft.hive_label,
      title: `${draft.colony_health} colony at ${draft.location || "unspecified site"}`,
      summary: draft.notes || "No beekeeper notes recorded.",
      status: draft.colony_health,
      occurredAt: draft.inspected_on,
      metrics: {
        broodFrames: draft.brood_frames,
        honeyFrames: draft.honey_frames,
        varroaCount: draft.varroa_count,
        queenSeen: draft.queen_seen,
        queenCells: draft.queen_cells,
        temperament: draft.temperament,
      },
    });
    setShowForm(false);
    setDraft(EMPTY);
    setAiText("");
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this inspection record?")) return;
    await supabase.from("inspections").delete().eq("id", id);
    toast.success("Deleted");
    void load();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Inspection History</h1>
              <p className="text-xs text-muted-foreground">
                Log hive diagnostics, track colony health and get AI-assisted disease interpretation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm((s) => !s)}
              className="px-3 py-2 rounded-lg bg-honey text-background text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Log Diagnostic
            </button>
            <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg border border-border hover:bg-card">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total inspections", value: stats.total, icon: ClipboardList, tone: "text-honey" },
            { label: "Healthy colonies", value: stats.healthy, icon: HeartPulse, tone: "text-emerald-400" },
            { label: "Colonies with issues", value: stats.issues, icon: AlertTriangle, tone: "text-orange-400" },
            { label: "Avg varroa count", value: stats.varroa, icon: Bug, tone: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.tone}`} />
              </div>
              <p className={`mt-2 font-display text-3xl font-bold ${s.tone}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* New inspection form */}
        {showForm && (
          <div className="rounded-xl border border-honey/30 bg-card p-5 mb-6 space-y-4">
            <h2 className="font-display text-lg text-honey flex items-center gap-2">
              <Plus className="w-4 h-4" /> New diagnostic entry
            </h2>

            <div className="grid md:grid-cols-4 gap-3">
              <label className="text-xs space-y-1">
                <span className="text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Date</span>
                <input type="date" value={draft.inspected_on} onChange={(e) => setDraft({ ...draft, inspected_on: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-2 py-1.5" />
              </label>
              <label className="text-xs space-y-1">
                <span className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Location / apiary</span>
                <input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  placeholder="Kiambu site 2" className="w-full bg-background border border-border rounded-lg px-2 py-1.5" />
              </label>
              <label className="text-xs space-y-1">
                <span className="text-muted-foreground">Hive label</span>
                <input value={draft.hive_label} onChange={(e) => setDraft({ ...draft, hive_label: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-2 py-1.5" />
              </label>
              <label className="text-xs space-y-1">
                <span className="text-muted-foreground">Batch / group</span>
                <input value={draft.batch} onChange={(e) => setDraft({ ...draft, batch: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-2 py-1.5" />
              </label>
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              <label className="text-xs space-y-1">
                <span className="text-muted-foreground">Colony health</span>
                <select value={draft.colony_health} onChange={(e) => setDraft({ ...draft, colony_health: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-2 py-1.5">
                  {HEALTH.map((h) => <option key={h}>{h}</option>)}
                </select>
              </label>
              <label className="text-xs space-y-1">
                <span className="text-muted-foreground">Temperament</span>
                <select value={draft.temperament} onChange={(e) => setDraft({ ...draft, temperament: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-2 py-1.5">
                  {TEMPERAMENT.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="text-xs space-y-1">
                <span className="text-muted-foreground">Weather</span>
                <input value={draft.weather} onChange={(e) => setDraft({ ...draft, weather: e.target.value })}
                  placeholder="26 °C, light wind" className="w-full bg-background border border-border rounded-lg px-2 py-1.5" />
              </label>
              <label className="text-xs space-y-1 flex flex-col justify-end">
                <span className="text-muted-foreground flex items-center gap-1"><Crown className="w-3 h-3" /> Queen sighted</span>
                <button type="button" onClick={() => setDraft({ ...draft, queen_seen: !draft.queen_seen })}
                  className={`w-full rounded-lg px-2 py-1.5 border text-left ${draft.queen_seen ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-border text-muted-foreground"}`}>
                  {draft.queen_seen ? "Yes — queen seen" : "No — not seen"}
                </button>
              </label>
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              {([
                ["brood_frames", "Brood frames"],
                ["honey_frames", "Honey frames"],
                ["queen_cells", "Queen cells"],
                ["varroa_count", "Varroa count"],
              ] as const).map(([key, label]) => (
                <label key={key} className="text-xs space-y-1">
                  <span className="text-muted-foreground">{label}</span>
                  <input type="number" min={0} value={draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-lg px-2 py-1.5" />
                </label>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Observed issues</p>
              <div className="flex flex-wrap gap-1.5">
                {ISSUE_OPTIONS.map((i) => (
                  <Chip key={i} active={draft.issues.includes(i)} onClick={() => toggle("issues", i)}>{i}</Chip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Actions taken</p>
              <div className="flex flex-wrap gap-1.5">
                {ACTION_OPTIONS.map((a) => (
                  <Chip key={a} active={draft.actions.includes(a)} onClick={() => toggle("actions", a)}>{a}</Chip>
                ))}
              </div>
            </div>

            <label className="text-xs space-y-1 block">
              <span className="text-muted-foreground">Notes</span>
              <textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} rows={3}
                placeholder="Brood pattern spotty on frames 4-5, chalk mummies on the floor…"
                className="w-full bg-background border border-border rounded-lg px-2 py-1.5" />
            </label>

            <div className="flex flex-wrap gap-2">
              <button onClick={runAi} disabled={aiLoading}
                className="px-3 py-2 rounded-lg border border-honey/50 text-honey text-xs flex items-center gap-1.5 disabled:opacity-50">
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                AI diagnosis
              </button>
              <button onClick={save} disabled={saving}
                className="px-3 py-2 rounded-lg bg-honey text-background text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save inspection
              </button>
              <button onClick={() => { setShowForm(false); setAiText(""); }} className="px-3 py-2 rounded-lg border border-border text-xs">
                Cancel
              </button>
            </div>

            {aiText && (
              <div className="rounded-lg border border-honey/20 bg-background p-4">
                <MarkdownRenderer content={aiText} />
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by hive, location, issue or action…"
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm" />
        </div>

        {/* List */}
        {loading ? (
          <div className="py-16 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading inspections…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Activity className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No inspections recorded yet.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 px-3 py-2 rounded-lg bg-honey text-background text-xs font-semibold">
              Log your first diagnostic
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  className="w-full text-left p-4 flex flex-wrap items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full border text-[11px] ${healthTone(r.colony_health)}`}>{r.colony_health}</span>
                  <span className="font-semibold text-sm text-foreground">{r.hive_label}</span>
                  <span className="text-xs text-muted-foreground">{r.location || "—"}</span>
                  <span className="text-xs text-muted-foreground">{r.inspected_on}</span>
                  <span className="text-xs text-muted-foreground">Varroa {r.varroa_count}</span>
                  <span className="text-xs text-muted-foreground">Brood {r.brood_frames} / Honey {r.honey_frames}</span>
                  {r.issues.length > 0 && (
                    <span className="text-[11px] text-orange-400">{r.issues.length} issue{r.issues.length > 1 ? "s" : ""}</span>
                  )}
                  <span className="ml-auto text-[11px] text-muted-foreground">{expanded === r.id ? "Hide" : "Details"}</span>
                </button>
                {expanded === r.id && (
                  <div className="border-t border-border p-4 space-y-3 text-xs">
                    <div className="grid md:grid-cols-3 gap-3">
                      <p><span className="text-muted-foreground">Batch:</span> {r.batch}</p>
                      <p><span className="text-muted-foreground">Temperament:</span> {r.temperament}</p>
                      <p><span className="text-muted-foreground">Queen seen:</span> {r.queen_seen ? "Yes" : "No"} ({r.queen_cells} cells)</p>
                      <p><span className="text-muted-foreground">Weather:</span> {r.weather || "—"}</p>
                    </div>
                    {r.issues.length > 0 && (
                      <p><span className="text-muted-foreground">Issues:</span> {r.issues.join(", ")}</p>
                    )}
                    {r.actions.length > 0 && (
                      <p><span className="text-muted-foreground">Actions:</span> {r.actions.join(", ")}</p>
                    )}
                    {r.notes && <p><span className="text-muted-foreground">Notes:</span> {r.notes}</p>}
                    {r.ai_insights && (
                      <div className="rounded-lg border border-honey/20 bg-background p-3">
                        <MarkdownRenderer content={r.ai_insights} />
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button onClick={() => inspectionPdf(r)}
                        className="px-3 py-1.5 rounded-lg border border-honey/50 text-honey flex items-center gap-1.5">
                        <FileDown className="w-3.5 h-3.5" /> Download PDF report
                      </button>
                      <button onClick={() => remove(r.id)} className="text-red-400 flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Delete record
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
