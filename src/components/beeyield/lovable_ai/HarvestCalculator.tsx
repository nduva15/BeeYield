import { useState, useEffect, useCallback, useMemo } from "react";
import { Calculator, Loader2, Sparkles, Save, FileDown, History, Trash2, Copy, TrendingUp, FileSpreadsheet, Link2, StickyNote, GitBranch, ListTree, Target } from "lucide-react";
import { toast } from "sonner";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { downloadPDF, downloadCSV, type AssumptionsBlock, type ExportPayload } from "@/lib/harvest-export";
import { PROMPT_VARIANTS, type PromptVariant, coercePromptVariant } from "@/lib/pollination";

const CROP_OPTIONS = [
  "Almonds (CA)", "Apples", "Blueberries (highbush)", "Cranberries", "Avocado (Hass)",
  "Sunflower (hybrid seed)", "Canola/Oilseed Rape", "Watermelon", "Cucumber", "Strawberry",
  "Coffee (Arabica)", "Macadamia", "Mango", "Sidr", "Mixed wildflower / honey only",
];

const FRAME_TYPES = [
  { name: "Langstroth deep", kgPerFrame: 2.5 },
  { name: "Langstroth medium", kgPerFrame: 1.6 },
  { name: "Langstroth shallow", kgPerFrame: 1.1 },
  { name: "National deep", kgPerFrame: 1.8 },
  { name: "Dadant deep", kgPerFrame: 3.2 },
];

type SavedRun = {
  id: string;
  device_id: string;
  hives: number;
  acres: number;
  crop: string;
  frame_type: string;
  fill_pct: number;
  hhi: number;
  region: string;
  local_estimate_kg: number | null;
  moa_filters: unknown | null;
  ai_forecast: string | null;
  notes: string | null;
  prompt_variant: string;
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
  prompt_variant: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assumptions: any | null;
  created_at: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlanning?: () => void;
}

export default function HarvestCalculator({ isOpen, onClose, onOpenPlanning }: Props) {
  const deviceId = useDeviceId();
  const [hives, setHives] = useState(10);
  const [acres, setAcres] = useState(0);
  const [crop, setCrop] = useState(CROP_OPTIONS[0]);
  const [frameType, setFrameType] = useState(FRAME_TYPES[0].name);
  const [framesPerHive, setFramesPerHive] = useState(8);
  const [fillPct, setFillPct] = useState(75);
  const [hhi, setHhi] = useState(80);
  const [region, setRegion] = useState("Kenya / East Africa");
  const [notes, setNotes] = useState("");
  const [promptVariant, setPromptVariant] = useState<PromptVariant>("baseline");

  // Assumptions block — captured & shown in CSV/PDF/share
  const [assumptions, setAssumptions] = useState<AssumptionsBlock>({
    region_climate: "",
    bloom_window: "",
    hhi_source: "",
    data_caveats: "",
  });
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);

  // Local quick estimate
  const frame = FRAME_TYPES.find((f) => f.name === frameType)!;
  const grossPerHive = frame.kgPerFrame * framesPerHive * (fillPct / 100);
  const reserveByRegion: Record<string, number> = {
    "Kenya / East Africa": 6,
    "Subtropical": 10,
    "Temperate (US/EU)": 22,
  };
  const reserve = reserveByRegion[region] ?? 8;
  const netPerHive = Math.max(0, grossPerHive - reserve);
  const ethicalPerHive = Math.min(0.5 * grossPerHive, netPerHive);
  const colonyHealth = hhi / 100;
  const apiaryHarvest = ethicalPerHive * hives * colonyHealth;

  // Frames/acre — Standard (rule-of-thumb) vs Precision (geometry + flight radius)
  const CROP_FLIGHT_RADIUS_M: Record<string, number> = {
    "Almonds (CA)": 800, "Apples": 700, "Blueberries (highbush)": 500, "Cranberries": 600,
    "Avocado (Hass)": 600, "Sunflower (hybrid seed)": 1200, "Canola/Oilseed Rape": 1500,
    "Watermelon": 700, "Cucumber": 500, "Strawberry": 400, "Coffee (Arabica)": 800,
    "Macadamia": 600, "Mango": 700, "Sidr": 1000, "Mixed wildflower / honey only": 900,
  };
  const totalFrames = hives * framesPerHive;
  const framesPerAcreStandard = acres > 0 ? totalFrames / acres : 0;
  // Precision: use geometric coverage — 1 effective hive per π r² m² of foraging area
  const cropRadius = CROP_FLIGHT_RADIUS_M[crop] ?? 700;
  const acreM2 = 4046.86;
  const effectiveHivesPerAcre = acreM2 / (Math.PI * cropRadius * cropRadius);
  const framesPerAcrePrecision = effectiveHivesPerAcre * framesPerHive;


  // AI forecast
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");

  // History
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedRuns, setSavedRuns] = useState<SavedRun[]>([]);
  const [saving, setSaving] = useState(false);
  const [trendOnlyAI, setTrendOnlyAI] = useState(false);

  // Versions per saved run
  const [versionsByRun, setVersionsByRun] = useState<Record<string, RunVersion[]>>({});
  const [selectedVersion, setSelectedVersion] = useState<Record<string, string>>({}); // runId -> versionId or "current"

  const loadRuns = useCallback(async () => {
    const { data, error } = await supabase
      .from("harvest_runs")
      .select("*")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return;
    if (data) setSavedRuns(data as SavedRun[]);
  }, [deviceId]);

  useEffect(() => {
    if (isOpen) loadRuns();
  }, [isOpen, loadRuns]);

  const loadVersionsFor = useCallback(async (runId: string) => {
    const { data } = await supabase
      .from("harvest_run_versions")
      .select("*")
      .eq("run_id", runId)
      .order("created_at", { ascending: false });
    setVersionsByRun((prev) => ({ ...prev, [runId]: (data || []) as RunVersion[] }));
  }, []);

  const variantGuidance = useMemo(() => {
    switch (promptVariant) {
      case "bloom-only":
        return "Prioritize bloom phenology, deployment timing, bloom-stage risk, and timing-sensitive contract actions. Keep flight analysis secondary.";
      case "flight-only":
        return "Prioritize bee-flight activity, forager throughput, movement radius, hive-entrance counts, and activity-derived deployment actions. Keep bloom analysis secondary.";
      case "bloom-flight":
        return "Blend bloom phenology and bee-flight telemetry equally. Explicitly connect bloom timing shifts to activity counter trends, movement reach, and placement changes.";
      default:
        return "Use the balanced BeeYield baseline model across harvest math, pollination planning, and risk management.";
    }
  }, [promptVariant]);

  const buildPrompt = () =>
    `Use the BeeYield Harvest Math (Section 18) and Pollination PSI v2 model (Section 18) to produce a fully worked numeric forecast for the following operation. Show every formula step. Apply the 50/50 ethical harvest rule. Then add a Pollination Saturation Index assessment for the listed crop, recommended colonies vs supplied colonies, and a 7-bullet action plan.\n\n` +
    `PROMPT VARIANT: ${promptVariant}\n` +
    `VARIANT GUIDANCE: ${variantGuidance}\n\n` +
    `INPUTS:\n` +
    `- Hive count: ${hives}\n` +
    `- Crop / forage: ${crop}\n` +
    `- Acreage of crop: ${acres} acres\n` +
    `- Frame type: ${frameType} (${frame.kgPerFrame} kg/capped frame)\n` +
    `- Honey frames per hive: ${framesPerHive}\n` +
    `- Average frame fill (capped %): ${fillPct}%\n` +
    `- Hive Health Index (HHI 0–100): ${hhi}\n` +
    `- Region: ${region}\n` +
    (assumptions.region_climate || assumptions.bloom_window || assumptions.hhi_source || assumptions.data_caveats
      ? `\nASSUMPTIONS:\n` +
        (assumptions.region_climate ? `- Region/climate: ${assumptions.region_climate}\n` : "") +
        (assumptions.bloom_window ? `- Bloom window: ${assumptions.bloom_window}\n` : "") +
        (assumptions.hhi_source ? `- HHI source: ${assumptions.hhi_source}\n` : "") +
        (assumptions.data_caveats ? `- Data caveats: ${assumptions.data_caveats}\n` : "")
      : "") +
    `\nRequired output sections (markdown): ## Executive Summary, ## Situation Assessment, ## Recommendations (Prioritized), ## Implementation Plan, ## Risks & Mitigations, ## Metrics to Track, ## Sources & Assumptions.`;

  const runAI = async () => {
    setAiLoading(true);
    setAiText("");
    setAiOpen(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: "user", content: buildPrompt() }], promptVariant }),
      });
      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        toast.error(err.error || `Error ${resp.status}`);
        setAiLoading(false);
        return;
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      let acc = "";
      while (!done) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        buf += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (c) { acc += c; setAiText(acc); }
          } catch { /* partial */ }
        }
      }
    } catch {
      toast.error("Failed to reach Beeyield AI");
    } finally {
      setAiLoading(false);
    }
  };

  const saveRun = async () => {
    setSaving(true);
    const { error } = await supabase.from("harvest_runs").insert({
      device_id: deviceId,
      hives, acres, crop, frame_type: frameType,
      fill_pct: fillPct, hhi, region,
      local_estimate_kg: Number(apiaryHarvest.toFixed(2)),
      ai_forecast: aiText || null,
      notes: notes.trim() || null,
      prompt_variant: promptVariant,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assumptions: assumptions as any,
    });
    setSaving(false);
    if (error) {
      toast.error("Failed to save run");
      return;
    }
    toast.success("Harvest run saved");
    loadRuns();
  };

  // Save current AI forecast as a NEW VERSION on a saved run
  const saveAsNewVersion = async (run: SavedRun) => {
    if (!aiText) { toast.error("Generate an AI forecast first to save it as a new version"); return; }
    const existing = versionsByRun[run.id] || [];
    const nextN = existing.length + 1; // labels v1, v2, ... (excluding original on the run row itself)
    const { error } = await supabase.from("harvest_run_versions").insert({
      run_id: run.id,
      version_label: `v${nextN}`,
      ai_forecast: aiText,
      local_estimate_kg: Number(apiaryHarvest.toFixed(2)),
      prompt_variant: promptVariant,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assumptions: assumptions as any,
    });
    if (error) { toast.error("Failed to save version"); return; }
    toast.success(`Saved as v${nextN} on ${run.crop}`);
    loadVersionsFor(run.id);
  };

  const copyShareLink = async (id: string) => {
    const url = `${window.location.origin}/shared-run/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "BeeYield Harvest Forecast", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied — send to your farm partners");
      }
    } catch { /* user cancelled */ }
  };

  const loadRun = (r: SavedRun) => {
    setHives(r.hives);
    setAcres(Number(r.acres));
    setCrop(r.crop);
    setFrameType(r.frame_type);
    setFillPct(r.fill_pct);
    setHhi(r.hhi);
    setRegion(r.region);
    setNotes(r.notes || "");
    setPromptVariant(coercePromptVariant(r.prompt_variant));
    setAssumptions((r.assumptions as AssumptionsBlock) || { region_climate: "", bloom_window: "", hhi_source: "", data_caveats: "" });
    if (r.ai_forecast) {
      setAiText(r.ai_forecast);
      setAiOpen(true);
    } else {
      setAiOpen(false);
      setAiText("");
    }
    setHistoryOpen(false);
    toast.success("Loaded saved run");
  };

  const duplicateRun = (r: SavedRun) => {
    setHives(r.hives);
    setAcres(Number(r.acres));
    setCrop(r.crop);
    setFrameType(r.frame_type);
    setFillPct(r.fill_pct);
    setHhi(r.hhi);
    setRegion(r.region);
    setNotes((r.notes ? r.notes + "\n" : "") + "[clone] what-if scenario based on " + new Date(r.created_at).toLocaleDateString());
    setAssumptions((r.assumptions as AssumptionsBlock) || { region_climate: "", bloom_window: "", hhi_source: "", data_caveats: "" });
    setAiOpen(false);
    setAiText("");
    setHistoryOpen(false);
    toast.success("Run cloned — tweak any parameter for a what-if scenario");
  };

  const trendData = useMemo(() => {
    return [...savedRuns]
      .filter((r) => (trendOnlyAI ? !!r.ai_forecast : true))
      .reverse()
      .map((r, i) => ({
        idx: i + 1,
        date: new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        hhi: r.hhi,
        harvest: Number(r.local_estimate_kg ?? 0),
        crop: r.crop,
      }));
  }, [savedRuns, trendOnlyAI]);

  const deleteRun = async (id: string) => {
    const { error } = await supabase.from("harvest_runs").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Run deleted");
    loadRuns();
  };

  // Build payload for export — for current calculator state
  const buildPayload = (versionLabel?: string, overrideAi?: string | null, overrideAssumptions?: AssumptionsBlock | null): ExportPayload => ({
    crop, hives, acres,
    frame_type: frameType,
    kgPerFrame: frame.kgPerFrame,
    framesPerHive,
    fillPct, hhi, region,
    notes,
    reserve, grossPerHive, netPerHive, ethicalPerHive, apiaryHarvest,
    aiText: overrideAi !== undefined ? overrideAi : aiText,
    versionLabel: versionLabel || "current",
    assumptions: overrideAssumptions !== undefined ? overrideAssumptions : assumptions,
    framesPerAcreStandard,
    framesPerAcrePrecision,
  });

  const exportPDF = () => { downloadPDF(buildPayload()); toast.success("PDF report exported"); };
  const exportForecastCSV = () => { downloadCSV(buildPayload()); toast.success("CSV exported"); };

  // Per-saved-run, version-aware export
  const exportRunVersion = (r: SavedRun, fmt: "pdf" | "csv") => {
    const verId = selectedVersion[r.id] || "current";
    let aiTextOverride: string | null = r.ai_forecast;
    let aLabel = "current";
    let aAssumptions = (r.assumptions as AssumptionsBlock) || null;
    if (verId !== "current") {
      const v = (versionsByRun[r.id] || []).find((x) => x.id === verId);
      if (v) {
        aiTextOverride = v.ai_forecast;
        aLabel = v.version_label;
        aAssumptions = (v.assumptions as AssumptionsBlock) || null;
      }
    }
    // Reconstruct the same numeric math on the fly using the stored inputs
    const f = FRAME_TYPES.find((x) => x.name === r.frame_type) || FRAME_TYPES[0];
    const gross = f.kgPerFrame * 8 * (r.fill_pct / 100); // we don't store framesPerHive — use 8 default
    const res = (reserveByRegion[r.region] ?? 8);
    const net = Math.max(0, gross - res);
    const eth = Math.min(0.5 * gross, net);
    const apiary = Number(r.local_estimate_kg ?? eth * r.hives * (r.hhi / 100));
    const payload: ExportPayload = {
      crop: r.crop, hives: r.hives, acres: Number(r.acres),
      frame_type: r.frame_type, kgPerFrame: f.kgPerFrame, framesPerHive: 8,
      fillPct: r.fill_pct, hhi: r.hhi, region: r.region, notes: r.notes,
      reserve: res, grossPerHive: gross, netPerHive: net, ethicalPerHive: eth, apiaryHarvest: apiary,
      aiText: aiTextOverride, versionLabel: aLabel, assumptions: aAssumptions,
    };
    if (fmt === "pdf") { downloadPDF(payload); toast.success(`Exported ${aLabel} PDF`); }
    else { downloadCSV(payload); toast.success(`Exported ${aLabel} CSV`); }
  };

  const sharePDF = async () => {
    const summary =
      `BeeYield Harvest Forecast\n` +
      `${hives} hives · ${crop} · ${acres} acres\n` +
      `Frame: ${frameType} @ ${fillPct}% fill · HHI ${hhi}\n` +
      `Estimated apiary harvest: ${apiaryHarvest.toFixed(0)} kg (${ethicalPerHive.toFixed(1)} kg/hive ethical)\n` +
      (notes.trim() ? `\nNotes: ${notes.trim()}\n` : "");
    try {
      if (navigator.share) await navigator.share({ title: "BeeYield Harvest Forecast", text: summary });
      else { await navigator.clipboard.writeText(summary); toast.success("Summary copied to clipboard"); }
    } catch { /* canceled */ }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calculator className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Harvest Calculator</h1>
              <p className="text-xs text-muted-foreground">BeeYield Harvest Math • Frame yield × HHI × 50/50 ethical rule</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistoryOpen((v) => !v)}
              className="px-3 h-9 rounded-lg border border-border hover:border-primary/50 text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              title="Saved runs"
            >
              <History className="w-3.5 h-3.5" /> History ({savedRuns.length})
            </button>
          </div>
        </div>

        {historyOpen && (
          <div className="mb-6 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="font-display text-sm font-bold text-foreground">Saved harvest runs</h3>
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={trendOnlyAI}
                  onChange={(e) => setTrendOnlyAI(e.target.checked)}
                  className="accent-honey w-3.5 h-3.5"
                />
                Trend chart: AI-forecasted runs only
              </label>
            </div>
            {savedRuns.length === 0 ? (
              <p className="text-xs text-muted-foreground">No saved runs yet. Click Save below to track HHI improvements over time.</p>
            ) : (
              <>
                {trendData.length >= 2 && (
                  <div className="mb-4 p-4 rounded-lg border border-border bg-muted/10">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-honey" />
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">HHI & Apiary harvest trend</h4>
                    </div>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                          <YAxis yAxisId="left" stroke="hsl(var(--honey))" fontSize={11} domain={[0, 100]} label={{ value: "HHI", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                          <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--primary))" fontSize={11} label={{ value: "kg", angle: 90, position: "insideRight", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Line yAxisId="left" type="monotone" dataKey="hhi" name="HHI (0–100)" stroke="hsl(var(--honey))" strokeWidth={2} dot={{ r: 3 }} />
                          <Line yAxisId="right" type="monotone" dataKey="harvest" name="Harvest (kg)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scroll">
                  {savedRuns.map((r) => {
                    const versions = versionsByRun[r.id] || [];
                    const sel = selectedVersion[r.id] || "current";
                    return (
                      <div key={r.id} className="p-3 rounded-lg border border-border hover:border-primary/40 bg-muted/20">
                        <div className="flex items-center justify-between gap-3">
                          <button onClick={() => loadRun(r)} className="flex-1 text-left min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {r.crop} · {r.hives} hives · <span className="text-honey">{Number(r.local_estimate_kg ?? 0).toFixed(0)} kg</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              HHI {r.hhi} · fill {r.fill_pct}% · {r.region} · {new Date(r.created_at).toLocaleDateString()}
                              {r.ai_forecast ? " · AI ✓" : ""}
                            </div>
                            {r.notes && (
                              <div className="text-xs text-foreground/70 mt-1 flex items-start gap-1.5">
                                <StickyNote className="w-3 h-3 mt-0.5 shrink-0 text-honey" />
                                <span className="line-clamp-2 italic">{r.notes}</span>
                              </div>
                            )}
                          </button>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => { loadVersionsFor(r.id); }}
                              className="w-8 h-8 rounded-lg border border-border hover:border-honey/50 hover:text-honey text-muted-foreground flex items-center justify-center"
                              title="Load versions"
                            >
                              <ListTree className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => saveAsNewVersion(r)}
                              className="w-8 h-8 rounded-lg border border-border hover:border-honey/50 hover:text-honey text-muted-foreground flex items-center justify-center"
                              title="Save current AI forecast as new version on this run"
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => copyShareLink(r.id)}
                              className="w-8 h-8 rounded-lg border border-border hover:border-primary/50 hover:text-primary text-muted-foreground flex items-center justify-center"
                              title="Copy read-only share link for farm partners"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => duplicateRun(r)}
                              className="w-8 h-8 rounded-lg border border-border hover:border-honey/50 hover:text-honey text-muted-foreground flex items-center justify-center"
                              title="Duplicate run for what-if scenario"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteRun(r.id)}
                              className="w-8 h-8 rounded-lg border border-border hover:border-destructive/50 hover:text-destructive text-muted-foreground flex items-center justify-center"
                              title="Delete run"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Version selector + per-version export */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
                          <span className="text-muted-foreground flex items-center gap-1"><GitBranch className="w-3 h-3" /> Version:</span>
                          <select
                            value={sel}
                            onChange={(e) => setSelectedVersion((p) => ({ ...p, [r.id]: e.target.value }))}
                            onFocus={() => { if (!versionsByRun[r.id]) loadVersionsFor(r.id); }}
                            className="bg-background border border-border rounded px-2 h-7 text-xs"
                          >
                            <option value="current">current ({new Date(r.created_at).toLocaleDateString()})</option>
                            {versions.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.version_label} · {new Date(v.created_at).toLocaleDateString()} · {Number(v.local_estimate_kg ?? 0).toFixed(0)} kg
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => exportRunVersion(r, "pdf")}
                            className="px-2 h-7 rounded border border-border hover:border-honey/50 hover:text-honey text-muted-foreground flex items-center gap-1"
                          >
                            <FileDown className="w-3 h-3" /> PDF
                          </button>
                          <button
                            onClick={() => exportRunVersion(r, "csv")}
                            className="px-2 h-7 rounded border border-border hover:border-honey/50 hover:text-honey text-muted-foreground flex items-center gap-1"
                          >
                            <FileSpreadsheet className="w-3 h-3" /> CSV
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Inputs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-xl border border-border bg-muted/30">
          <Field label="Hive count">
            <input type="number" min={1} value={hives} onChange={(e) => setHives(Math.max(1, +e.target.value || 1))} className={inputCls} />
          </Field>
          <Field label="Acreage (crop forage)">
            <input type="number" min={0} value={acres} onChange={(e) => setAcres(Math.max(0, +e.target.value || 0))} className={inputCls} />
          </Field>
          <Field label="Crop / forage type">
            <select value={crop} onChange={(e) => setCrop(e.target.value)} className={inputCls}>
              {CROP_OPTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Frame type">
            <select value={frameType} onChange={(e) => setFrameType(e.target.value)} className={inputCls}>
              {FRAME_TYPES.map((f) => <option key={f.name}>{f.name}</option>)}
            </select>
          </Field>
          <Field label="Honey frames per hive">
            <input type="number" min={1} max={30} value={framesPerHive} onChange={(e) => setFramesPerHive(Math.max(1, +e.target.value || 1))} className={inputCls} />
          </Field>
          <Field label={`Frame fill capped: ${fillPct}%`}>
            <input type="range" min={0} max={100} value={fillPct} onChange={(e) => setFillPct(+e.target.value)} className="w-full accent-honey" />
          </Field>
          <Field label={`Hive Health Index (HHI): ${hhi}`}>
            <input type="range" min={0} max={100} value={hhi} onChange={(e) => setHhi(+e.target.value)} className="w-full accent-honey" />
          </Field>
          <Field label="Region (winter reserve)">
            <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls}>
              <option>Kenya / East Africa</option>
              <option>Subtropical</option>
              <option>Temperate (US/EU)</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <StickyNote className="w-3 h-3 text-honey" /> Notes (what changed in this what-if scenario?)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bumped HHI from 70 to 82 after Apivar treatment; tested wider frame fill assumption."
              rows={2}
              className={`${inputCls} resize-y min-h-[60px]`}
            />
          </div>
        </div>

        {/* Assumptions block — captured to CSV/PDF/share */}
        <div className="mb-6 rounded-xl border border-honey/30 bg-honey/5 overflow-hidden">
          <button
            type="button"
            onClick={() => setAssumptionsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold text-honey flex items-center gap-2">
              <ListTree className="w-4 h-4" /> Assumptions ({assumptionsOpen ? "hide" : "edit"})
            </span>
            <span className="text-xs text-muted-foreground">
              Region · bloom window · HHI source · caveats — included in CSV/PDF/share
            </span>
          </button>
          {assumptionsOpen && (
            <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Region / climate notes">
                <input
                  className={inputCls}
                  value={assumptions.region_climate || ""}
                  onChange={(e) => setAssumptions((a) => ({ ...a, region_climate: e.target.value }))}
                  placeholder="e.g. Makueni semi-arid, 2025 long rains delayed 3 weeks"
                />
              </Field>
              <Field label="Bloom window assumptions">
                <input
                  className={inputCls}
                  value={assumptions.bloom_window || ""}
                  onChange={(e) => setAssumptions((a) => ({ ...a, bloom_window: e.target.value }))}
                  placeholder="e.g. Mango Mar 5–28, 24-day effective bloom"
                />
              </Field>
              <Field label="HHI source">
                <input
                  className={inputCls}
                  value={assumptions.hhi_source || ""}
                  onChange={(e) => setAssumptions((a) => ({ ...a, hhi_source: e.target.value }))}
                  placeholder="e.g. ApiSense IoT 30-day rolling avg, calibrated 2025-04-10"
                />
              </Field>
              <Field label="Data caveats">
                <input
                  className={inputCls}
                  value={assumptions.data_caveats || ""}
                  onChange={(e) => setAssumptions((a) => ({ ...a, data_caveats: e.target.value }))}
                  placeholder="e.g. frames/hive estimated, no scale data this round"
                />
              </Field>
            </div>
          )}
        </div>

        {/* Quick local estimate */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <Stat label="Gross / hive" value={`${grossPerHive.toFixed(1)} kg`} />
          <Stat label="Reserve held back" value={`${reserve} kg`} />
          <Stat label="Ethical / hive" value={`${ethicalPerHive.toFixed(1)} kg`} highlight />
          <Stat label="Apiary total (× HHI)" value={`${apiaryHarvest.toFixed(0)} kg`} highlight />
        </div>

        {/* Frames per acre — standard vs precision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-xl border border-border bg-muted/20">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <Calculator className="w-3 h-3" /> Frames/acre · <b className="text-foreground">Standard</b>
            </div>
            <div className="font-display text-xl font-bold text-foreground">
              {acres > 0 ? framesPerAcreStandard.toFixed(2) : "—"}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              total frames ({totalFrames}) ÷ {acres || 0} acres
            </div>
          </div>
          <div className="p-4 rounded-xl border border-honey/40 bg-honey/5">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <Target className="w-3 h-3 text-honey" /> Frames/acre · <b className="text-honey">Precision</b>
            </div>
            <div className="font-display text-xl font-bold text-honey">
              {framesPerAcrePrecision.toFixed(2)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              4046.86 m² ÷ (π × {cropRadius}²) × {framesPerHive} frames/hive
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card mb-6 text-sm text-muted-foreground font-mono space-y-1">
          <div>H_frame = {frame.kgPerFrame} kg × ({fillPct}%/100) = <span className="text-foreground">{(frame.kgPerFrame * fillPct / 100).toFixed(2)} kg/frame</span></div>
          <div>H_gross/hive = {framesPerHive} × {(frame.kgPerFrame * fillPct / 100).toFixed(2)} = <span className="text-foreground">{grossPerHive.toFixed(1)} kg</span></div>
          <div>Reserve ({region}) = {reserve} kg → Net = <span className="text-foreground">{netPerHive.toFixed(1)} kg</span></div>
          <div>Ethical (50/50 rule) = min(50% × gross, net) = <span className="text-honey font-bold">{ethicalPerHive.toFixed(1)} kg/hive</span></div>
          <div>Apiary = {ethicalPerHive.toFixed(1)} × {hives} × ({hhi}/100) = <span className="text-honey font-bold">{apiaryHarvest.toFixed(0)} kg</span></div>
        </div>

        <button
          onClick={runAI}
          disabled={aiLoading}
          className="w-full px-4 py-3 rounded-xl bg-gradient-amber text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all mb-3"
        >
          {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {aiLoading ? "Beeyield AI is forecasting..." : "Generate Full AI Forecast (Beeyield AI)"}
        </button>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="col-span-2 md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              BeeGPT prompt variant
            </label>
            <select value={promptVariant} onChange={(e) => setPromptVariant(e.target.value as PromptVariant)} className={inputCls}>
              {PROMPT_VARIANTS.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.label} - {variant.description}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={saveRun}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg border border-honey/40 bg-honey/5 hover:bg-honey/10 text-honey font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save run
          </button>
          <button
            onClick={exportPDF}
            className="px-4 py-2.5 rounded-lg border border-border hover:border-primary/50 text-foreground font-medium text-sm flex items-center justify-center gap-2"
            title="Export the full forecast card (inputs, worked math, AI forecast, assumptions, notes) as a PDF"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={exportForecastCSV}
            className="px-4 py-2.5 rounded-lg border border-border hover:border-primary/50 text-foreground font-medium text-sm flex items-center justify-center gap-2"
            title="Export numeric inputs + AI forecast + assumptions as CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={sharePDF}
            className="px-4 py-2.5 rounded-lg border border-border hover:border-primary/50 text-foreground font-medium text-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Share summary
          </button>
          {onOpenPlanning && (
            <button
              onClick={onOpenPlanning}
              className="col-span-2 md:col-span-4 px-4 py-2.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 font-medium text-sm flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              Open Pollination Planning
            </button>
          )}
        </div>

        {aiOpen && (
          <div className="p-5 rounded-xl border border-honey/30 bg-card">
            <h3 className="font-display text-base font-bold text-honey mb-3">
              Beeyield AI Forecast
              <span className="ml-2 text-xs font-normal text-muted-foreground">Variant: {PROMPT_VARIANTS.find((variant) => variant.id === promptVariant)?.label}</span>
            </h3>
            {aiText ? (
              <MarkdownRenderer content={aiText} />
            ) : (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Streaming worked forecast...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary/50 outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? "border-honey/40 bg-honey/5" : "border-border bg-muted/30"}`}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`font-display text-xl font-bold ${highlight ? "text-honey" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
