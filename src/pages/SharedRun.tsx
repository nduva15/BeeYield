import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Calculator, Sparkles, AlertTriangle, FileDown, FileSpreadsheet, MessageSquare, Send, GitBranch, Eye } from "lucide-react";
import beeyieldLogo from "@/assets/Logo.png";
import { supabase } from "@/integrations/supabase/client";
import MarkdownRenderer from "@/components/beeyield/lovable_ai/MarkdownRenderer";
import { downloadPDF, downloadCSV, type AssumptionsBlock, type ExportPayload } from "@/lib/harvest-export";
import { toast } from "sonner";

type SharedRunRow = {
  id: string;
  hives: number;
  acres: number;
  crop: string;
  frame_type: string;
  fill_pct: number;
  hhi: number;
  region: string;
  local_estimate_kg: number | null;
  ai_forecast: string | null;
  notes: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assumptions: any | null;
  created_at: string;
};

type RunVersion = {
  id: string;
  run_id: string;
  version_label: string;
  ai_forecast: string | null;
  local_estimate_kg: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assumptions: any | null;
  created_at: string;
};

type Comment = {
  id: string;
  run_id: string;
  author_name: string;
  body: string;
  created_at: string;
};

const FRAME_FALLBACK_KG: Record<string, number> = {
  "Langstroth deep": 2.5,
  "Langstroth medium": 1.6,
  "Langstroth shallow": 1.1,
  "National deep": 1.8,
  "Dadant deep": 3.2,
};
const RESERVE: Record<string, number> = {
  "Kenya / East Africa": 6,
  "Subtropical": 10,
  "Temperate (US/EU)": 22,
};

export default function SharedRun() {
  const { id } = useParams<{ id: string }>();
  const [run, setRun] = useState<SharedRunRow | null>(null);
  const [versions, setVersions] = useState<RunVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("current");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!id) return;
      const [{ data: runData, error: runErr }, { data: vData }, { data: cData }] = await Promise.all([
        supabase.from("harvest_runs")
          .select("id,hives,acres,crop,frame_type,fill_pct,hhi,region,local_estimate_kg,ai_forecast,notes,assumptions,created_at")
          .eq("id", id).maybeSingle(),
        supabase.from("harvest_run_versions").select("*").eq("run_id", id).order("created_at", { ascending: false }),
        supabase.from("harvest_run_comments").select("*").eq("run_id", id).order("created_at", { ascending: false }),
      ]);
      if (cancel) return;
      if (runErr || !runData) {
        setError("This shared harvest run could not be found. The link may be invalid or the run was deleted.");
      } else {
        setRun(runData as SharedRunRow);
        setVersions((vData || []) as RunVersion[]);
        setComments((cData || []) as Comment[]);
      }
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, [id]);

  // Resolve currently selected version's AI / assumptions / kg
  const active = useMemo(() => {
    if (!run) return null;
    if (selectedVersion === "current") {
      return {
        ai_forecast: run.ai_forecast,
        local_estimate_kg: run.local_estimate_kg,
        assumptions: (run.assumptions as AssumptionsBlock) || null,
        version_label: "current",
        created_at: run.created_at,
      };
    }
    const v = versions.find((x) => x.id === selectedVersion);
    return v ? {
      ai_forecast: v.ai_forecast,
      local_estimate_kg: v.local_estimate_kg,
      assumptions: (v.assumptions as AssumptionsBlock) || null,
      version_label: v.version_label,
      created_at: v.created_at,
    } : null;
  }, [run, versions, selectedVersion]);

  const buildExportPayload = (): ExportPayload | null => {
    if (!run || !active) return null;
    const kg = run.frame_type ? (FRAME_FALLBACK_KG[run.frame_type] ?? 2.0) : 2.0;
    const gross = kg * 8 * (run.fill_pct / 100);
    const res = RESERVE[run.region] ?? 8;
    const net = Math.max(0, gross - res);
    const eth = Math.min(0.5 * gross, net);
    const apiary = Number(active.local_estimate_kg ?? eth * run.hives * (run.hhi / 100));
    return {
      crop: run.crop, hives: run.hives, acres: Number(run.acres),
      frame_type: run.frame_type, kgPerFrame: kg, framesPerHive: 8,
      fillPct: run.fill_pct, hhi: run.hhi, region: run.region, notes: run.notes,
      reserve: res, grossPerHive: gross, netPerHive: net, ethicalPerHive: eth, apiaryHarvest: apiary,
      aiText: active.ai_forecast, versionLabel: active.version_label, assumptions: active.assumptions,
    };
  };

  const handleExportPDF = () => {
    const p = buildExportPayload();
    if (!p) return;
    downloadPDF(p);
    toast.success(`Exported ${p.versionLabel} PDF`);
  };
  const handleExportCSV = () => {
    const p = buildExportPayload();
    if (!p) return;
    downloadCSV(p);
    toast.success(`Exported ${p.versionLabel} CSV`);
  };

  const postComment = async () => {
    if (!run || !commentBody.trim()) { toast.error("Write a comment first"); return; }
    setPostingComment(true);
    const author = commentName.trim() || "Partner";
    const { data, error } = await supabase
      .from("harvest_run_comments")
      .insert({ run_id: run.id, author_name: author, body: commentBody.trim() })
      .select("*")
      .single();
    setPostingComment(false);
    if (error || !data) { toast.error("Failed to post comment"); return; }
    setComments((prev) => [data as Comment, ...prev]);
    setCommentBody("");
    toast.success("Comment posted — the farm owner will see this");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Branded header */}
      <header className="border-b border-border bg-gradient-amber">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
|          <div className="flex items-center gap-3">
|            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl overflow-hidden">
|              <img src={beeyieldLogo} alt="BeeYield" className="w-9 h-9 object-contain" />
|            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-primary-foreground">BeeYield Harvest Forecast</h1>
              <p className="text-xs text-primary-foreground/80 flex items-center gap-1.5">
                <Eye className="w-3 h-3" /> Partner read-only mode — downloads & comments enabled
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="px-3 h-9 rounded-lg bg-background/15 hover:bg-background/25 text-primary-foreground text-sm flex items-center gap-1.5 backdrop-blur"
          >
            <ArrowLeft className="w-4 h-4" /> Open BeeYield
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {loading && (
          <div className="flex items-center gap-3 text-muted-foreground py-20 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading shared run...
          </div>
        )}

        {error && (
          <div className="p-6 rounded-xl border border-destructive/40 bg-destructive/5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-foreground mb-1">Run not available</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {run && active && (
          <>
            <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-muted-foreground">
                Forecast generated {new Date(active.created_at).toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <GitBranch className="w-3 h-3" /> Version
                </span>
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="bg-background border border-border rounded px-2 h-8 text-xs"
                >
                  <option value="current">current ({new Date(run.created_at).toLocaleDateString()})</option>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.version_label} · {new Date(v.created_at).toLocaleDateString()} · {Number(v.local_estimate_kg ?? 0).toFixed(0)} kg
                    </option>
                  ))}
                </select>
                <button onClick={handleExportPDF} className="px-2 h-8 rounded border border-border hover:border-honey/50 hover:text-honey text-muted-foreground flex items-center gap-1 text-xs">
                  <FileDown className="w-3 h-3" /> PDF
                </button>
                <button onClick={handleExportCSV} className="px-2 h-8 rounded border border-border hover:border-honey/50 hover:text-honey text-muted-foreground flex items-center gap-1 text-xs">
                  <FileSpreadsheet className="w-3 h-3" /> CSV
                </button>
              </div>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              {run.crop} · {run.hives} hives
            </h2>

            {/* Inputs */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Stat label="Hives" value={String(run.hives)} />
              <Stat label="Acreage" value={`${run.acres}`} />
              <Stat label="Frame type" value={run.frame_type} />
              <Stat label="Frame fill" value={`${run.fill_pct}%`} />
              <Stat label="HHI" value={`${run.hhi}/100`} highlight />
              <Stat label="Region" value={run.region} />
              <Stat
                label="Apiary harvest"
                value={`${Number(active.local_estimate_kg ?? 0).toFixed(0)} kg`}
                highlight
              />
              <Stat label="Per hive (avg)" value={`${(Number(active.local_estimate_kg ?? 0) / Math.max(1, run.hives)).toFixed(1)} kg`} />
            </section>

            {/* Notes */}
            {run.notes && run.notes.trim().length > 0 && (
              <section className="mb-6 p-4 rounded-xl border border-honey/30 bg-honey/5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-honey mb-1.5">Notes from beekeeper</h3>
                <p className="text-sm text-foreground whitespace-pre-wrap">{run.notes}</p>
              </section>
            )}

            {/* Assumptions */}
            {active.assumptions && (active.assumptions.region_climate || active.assumptions.bloom_window || active.assumptions.hhi_source || active.assumptions.data_caveats) && (
              <section className="mb-6 p-4 rounded-xl border border-border bg-muted/20">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground mb-2">Assumptions</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {active.assumptions.region_climate && (<div><dt className="text-xs text-muted-foreground">Region / climate</dt><dd className="text-foreground">{active.assumptions.region_climate}</dd></div>)}
                  {active.assumptions.bloom_window && (<div><dt className="text-xs text-muted-foreground">Bloom window</dt><dd className="text-foreground">{active.assumptions.bloom_window}</dd></div>)}
                  {active.assumptions.hhi_source && (<div><dt className="text-xs text-muted-foreground">HHI source</dt><dd className="text-foreground">{active.assumptions.hhi_source}</dd></div>)}
                  {active.assumptions.data_caveats && (<div><dt className="text-xs text-muted-foreground">Data caveats</dt><dd className="text-foreground">{active.assumptions.data_caveats}</dd></div>)}
                </dl>
              </section>
            )}

            {/* AI forecast */}
            {active.ai_forecast ? (
              <section className="p-5 rounded-xl border border-honey/30 bg-card mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-honey" />
                  <h3 className="font-display text-base font-bold text-honey">Beeyield AI Forecast — {active.version_label}</h3>
                </div>
                <MarkdownRenderer content={active.ai_forecast} />
              </section>
            ) : (
              <section className="p-5 rounded-xl border border-border bg-muted/20 text-sm text-muted-foreground mb-6">
                No AI forecast was attached to this version.
              </section>
            )}

            {/* Partner comments */}
            <section className="p-5 rounded-xl border border-border bg-card mb-6">
              <h3 className="font-display text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-honey" /> Partner review comments ({comments.length})
              </h3>

              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary/50 outline-none"
                />
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Leave a review comment for the farm owner — they'll see this when they reopen the run."
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary/50 outline-none resize-y min-h-[72px]"
                />
                <button
                  onClick={postComment}
                  disabled={postingComment || !commentBody.trim()}
                  className="px-4 py-2 rounded-lg bg-honey/15 hover:bg-honey/25 text-honey border border-honey/40 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post comment
                </button>
              </div>

              {comments.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No comments yet — be the first to review.</p>
              ) : (
                <div className="space-y-2">
                  {comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg border border-border bg-muted/20">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span className="font-semibold text-honey">{c.author_name}</span>
                        <span>{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{c.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <footer className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground text-center">
              This is a read-only shared forecast generated by the BeeYield platform. Visit{" "}
              <Link to="/" className="text-honey hover:underline">BeeYield</Link> to run your own harvest forecast.
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? "border-honey/40 bg-honey/5" : "border-border bg-muted/30"}`}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`font-display text-lg font-bold ${highlight ? "text-honey" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
