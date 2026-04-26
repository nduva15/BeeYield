import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Calculator, Loader2, Sparkles, Save, FileDown, History, Trash2, Copy, TrendingUp, FileSpreadsheet, Link2, StickyNote, GitBranch, ListTree, Target, Beaker, Info } from "lucide-react";
import { toast } from "sonner";
import MarkdownRenderer from "@/components/beeyield/lovable_ai/MarkdownRenderer";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { downloadPDF, downloadCSV, type AssumptionsBlock, type ExportPayload } from "@/lib/harvest-export";
import { PROMPT_VARIANTS, type PromptVariant, coercePromptVariant } from "@/lib/pollination";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldCard, BeeYieldBadge } from "../BeeYieldUI";
import { cn } from "@/lib/utils";

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
  embedded?: boolean;
}

export default function HarvestCalculator({ isOpen, onClose, onOpenPlanning, embedded = false }: Props) {
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

  const [assumptions, setAssumptions] = useState<AssumptionsBlock>({
    region_climate: "",
    bloom_window: "",
    hhi_source: "",
    data_caveats: "",
  });
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);

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

  const CROP_FLIGHT_RADIUS_M: Record<string, number> = {
    "Almonds (CA)": 800, "Apples": 700, "Blueberries (highbush)": 500, "Cranberries": 600,
    "Avocado (Hass)": 600, "Sunflower (hybrid seed)": 1200, "Canola/Oilseed Rape": 1500,
    "Watermelon": 700, "Cucumber": 500, "Strawberry": 400, "Coffee (Arabica)": 800,
    "Macadamia": 600, "Mango": 700, "Sidr": 1000, "Mixed wildflower / honey only": 900,
  };
  const totalFrames = hives * framesPerHive;
  const framesPerAcreStandard = acres > 0 ? totalFrames / acres : 0;
  const cropRadius = CROP_FLIGHT_RADIUS_M[crop] ?? 700;
  const acreM2 = 4046.86;
  const effectiveHivesPerAcre = acreM2 / (Math.PI * cropRadius * cropRadius);
  const framesPerAcrePrecision = effectiveHivesPerAcre * framesPerHive;

  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");

  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedRuns, setSavedRuns] = useState<SavedRun[]>([]);
  const [saving, setSaving] = useState(false);
  const [trendOnlyAI, setTrendOnlyAI] = useState(false);

  const [versionsByRun, setVersionsByRun] = useState<Record<string, RunVersion[]>>({});
  const [selectedVersion, setSelectedVersion] = useState<Record<string, string>>({});

  const loadRuns = useCallback(async () => {
    const { data } = await supabase
      .from("harvest_runs")
      .select("*")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false })
      .limit(50);
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
        return "Prioritize bloom phenology, deployment timing, bloom-stage risk, and timing-sensitive contract actions.";
      case "flight-only":
        return "Prioritize bee-flight activity, forager throughput, movement radius, and activity-derived deployment actions.";
      case "bloom-flight":
        return "Blend bloom phenology and bee-flight telemetry equally.";
      default:
        return "Use the balanced BeeYield baseline model across harvest math, pollination planning, and risk management.";
    }
  }, [promptVariant]);

  const buildPrompt = () =>
    `Use the BeeYield Harvest Math and Pollination PSI v2 model to produce a fully worked numeric forecast. Show every formula step. Apply the 50/50 ethical harvest rule. Then add a Pollination Saturation Index assessment for the listed crop, recommended colonies vs supplied colonies, and a 7-bullet action plan.\n\n` +
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
    `\nRequired output sections (markdown): ## Executive Summary, ## Situation Assessment, ## Recommendations, ## Implementation Plan, ## Risks, ## Metrics, ## Sources.`;

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
        toast.error("Error reaching AI");
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
    if (error) { toast.error("Failed to save run"); return; }
    toast.success("Harvest run saved");
    loadRuns();
  };

  const saveAsNewVersion = async (run: SavedRun) => {
    if (!aiText) { toast.error("Generate an AI forecast first"); return; }
    const existing = versionsByRun[run.id] || [];
    const nextN = existing.length + 1;
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
    toast.success(`Saved as v${nextN}`);
    loadVersionsFor(run.id);
  };

  const copyShareLink = async (id: string) => {
    const url = `${window.location.origin}/shared-run/${id}`;
    try {
      if (navigator.share) await navigator.share({ title: "BeeYield Harvest Forecast", url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied");
      }
    } catch { /* canceled */ }
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
    if (r.ai_forecast) { setAiText(r.ai_forecast); setAiOpen(true); }
    else { setAiOpen(false); setAiText(""); }
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
    setNotes((r.notes ? r.notes + "\n" : "") + "[clone] scenario based on " + new Date(r.created_at).toLocaleDateString());
    setAssumptions((r.assumptions as AssumptionsBlock) || { region_climate: "", bloom_window: "", hhi_source: "", data_caveats: "" });
    setAiOpen(false);
    setAiText("");
    setHistoryOpen(false);
    toast.success("Run cloned");
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

  const exportPDF = () => { downloadPDF(buildPayload()); toast.success("PDF exported"); };
  const exportForecastCSV = () => { downloadCSV(buildPayload()); toast.success("CSV exported"); };

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
    const f = FRAME_TYPES.find((x) => x.name === r.frame_type) || FRAME_TYPES[0];
    const gross = f.kgPerFrame * 8 * (r.fill_pct / 100);
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
    if (fmt === "pdf") downloadPDF(payload);
    else downloadCSV(payload);
  };

  if (!isOpen) return null;

  const content = (
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={Calculator}
        label="Economics"
        title="Harvest Calculator"
        subtitle="BeeYield Harvest Math • Frame yield × HHI × 50/50 ethical rule"
        onBack={onClose}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setHistoryOpen(!historyOpen)} className="px-3 py-1.5 rounded-xl border border-honey/30 bg-honey/5 text-honey text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-honey/10 transition-all">
              <History className="w-3.5 h-3.5" /> History ({savedRuns.length})
            </button>
            <button onClick={saveRun} disabled={saving} className="px-3 py-1.5 rounded-xl bg-honey text-honey-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-md">
              <Save className="w-3.5 h-3.5" /> Save Run
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-12">
            {historyOpen && (
                <BeeYieldCard className="mb-8 border-2 border-honey/20 bg-honey/5 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-honey uppercase tracking-widest">Saved Runs Dashboard</h3>
                        <label className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase cursor-pointer">
                            <input type="checkbox" checked={trendOnlyAI} onChange={(e) => setTrendOnlyAI(e.target.checked)} className="accent-honey" /> Filter AI Runs
                        </label>
                    </div>
                    {savedRuns.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic text-center py-4">No saved runs yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {trendData.length >= 2 && (
                                <div className="h-48 mb-6 border-b border-honey/10 pb-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                                            <YAxis yAxisId="left" stroke="hsl(var(--honey))" fontSize={10} />
                                            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--primary))" fontSize={10} />
                                            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 10 }} />
                                            <Line yAxisId="left" type="monotone" dataKey="hhi" stroke="hsl(var(--honey))" strokeWidth={2} dot={false} />
                                            <Line yAxisId="right" type="monotone" dataKey="harvest" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scroll pr-2">
                                {savedRuns.map((r) => (
                                    <div key={r.id} className="p-3 rounded-xl border border-border bg-white flex items-center justify-between group">
                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => loadRun(r)}>
                                            <div className="text-xs font-black text-foreground uppercase tracking-tight truncate">{r.crop} · {r.hives} hives</div>
                                            <div className="text-[9px] text-muted-foreground font-bold">{new Date(r.created_at).toLocaleDateString()} · {r.local_estimate_kg}kg</div>
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => copyShareLink(r.id)} className="w-7 h-7 rounded-lg border border-border hover:bg-muted flex items-center justify-center"><Link2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => deleteRun(r.id)} className="w-7 h-7 rounded-lg border border-border hover:bg-red-50 text-red-500 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </BeeYieldCard>
            )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <BeeYieldSection title="Genetic & Crop Factors" icon={Target}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Crop Target</label>
                <select value={crop} onChange={(e) => setCrop(e.target.value)} className={inputCls}>
                    {CROP_OPTIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Frame Type</label>
                <select value={frameType} onChange={(e) => setFrameType(e.target.value)} className={inputCls}>
                    {FRAME_TYPES.map(f => <option key={f.name}>{f.name}</option>)}
                </select>
              </div>
            </div>
          </BeeYieldSection>

          <BeeYieldSection title="Active Variables" icon={Beaker}>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Colonies</label>
                  <input type="number" value={hives} onChange={(e) => setHives(Number(e.target.value))} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Acreage</label>
                  <input type="number" value={acres} onChange={(e) => setAcres(Number(e.target.value))} className={inputCls} />
                </div>
             </div>
             <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">HHI (Health Index): {hhi}%</label>
                </div>
                <input type="range" value={hhi} onChange={(e) => setHhi(Number(e.target.value))} className="w-full accent-honey h-1.5 bg-honey/10 rounded-full appearance-none cursor-pointer" />
                
                <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Frame Fill Cap: {fillPct}%</label>
                </div>
                <input type="range" value={fillPct} onChange={(e) => setFillPct(Number(e.target.value))} className="w-full accent-honey h-1.5 bg-honey/10 rounded-full appearance-none cursor-pointer" />
             </div>
          </BeeYieldSection>

          <BeeYieldSection title="Expert Assumptions" icon={ListTree}>
              <div className="space-y-3">
                  <input value={assumptions.region_climate} onChange={(e) => setAssumptions({...assumptions, region_climate: e.target.value})} className={inputCls} placeholder="Climate assumptions..." />
                  <input value={assumptions.bloom_window} onChange={(e) => setAssumptions({...assumptions, bloom_window: e.target.value})} className={inputCls} placeholder="Bloom window (e.g. 21 days)..." />
              </div>
          </BeeYieldSection>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <BeeYieldCard className="p-6 border-honey/20 bg-honey/5">
                <div className="text-[10px] font-black text-honey uppercase tracking-widest mb-1">Ethical Harvest</div>
                <div className="text-3xl font-black text-foreground">{ethicalPerHive.toFixed(1)} <span className="text-sm font-bold text-muted-foreground">kg / hive</span></div>
                <p className="text-[9px] text-muted-foreground font-bold mt-2 uppercase tracking-wide">50/50 Survival Margin Applied</p>
            </BeeYieldCard>
            <BeeYieldCard className="p-6 border-honey/20 bg-honey/5">
                <div className="text-[10px] font-black text-honey uppercase tracking-widest mb-1">Saturation Index</div>
                <div className="text-3xl font-black text-foreground">{framesPerAcrePrecision.toFixed(1)} <span className="text-sm font-bold text-muted-foreground">F/A</span></div>
                <p className="text-[9px] text-muted-foreground font-bold mt-2 uppercase tracking-wide">Precision Flight Geometry</p>
            </BeeYieldCard>
          </div>

          <BeeYieldCard className="p-10 border-honey/40 bg-honey/10 relative overflow-hidden text-center">
            <div className="relative z-10">
                <div className="text-[10px] font-black text-honey uppercase tracking-[0.3em] mb-4">Total Apiary Yield Forecast</div>
                <div className="text-7xl font-black text-foreground tabular-nums tracking-tighter">{apiaryHarvest.toFixed(0)} <span className="text-2xl text-muted-foreground">kg</span></div>
                <div className="mt-8 flex items-center justify-center gap-4">
                    <button onClick={runAI} disabled={aiLoading} className="px-6 py-3 rounded-2xl bg-gradient-amber text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-xl hover:shadow-honey/30 transition-all flex items-center gap-2">
                        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI Intelligence Report
                    </button>
                    <button onClick={exportPDF} className="px-6 py-3 rounded-2xl border border-honey/30 bg-white text-honey text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-all">
                        <FileDown className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>
          </BeeYieldCard>

          {aiOpen && (
              <BeeYieldCard className="p-8 border-honey/30 bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-6 border-b border-honey/10 pb-4">
                      <h3 className="text-xs font-black text-honey uppercase tracking-widest flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> BeeGPT Forecast Strategy
                      </h3>
                      <div className="flex items-center gap-2">
                        <select value={promptVariant} onChange={(e) => setPromptVariant(e.target.value as PromptVariant)} className="bg-transparent text-[10px] font-black text-muted-foreground uppercase outline-none cursor-pointer">
                            {PROMPT_VARIANTS.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                        </select>
                      </div>
                  </div>
                  {aiLoading && !aiText ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center">
                          <Loader2 className="w-10 h-10 animate-spin text-honey mb-4" />
                          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Running Neural Inference...</p>
                      </div>
                  ) : (
                      <div className="prose prose-sm max-w-none prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-honey prose-li:text-muted-foreground">
                        <MarkdownRenderer content={aiText} />
                      </div>
                  )}
              </BeeYieldCard>
          )}

          <BeeYieldSection title="Worked Proof (Manual Verification)" icon={History}>
              <div className="font-mono text-[10px] leading-relaxed text-muted-foreground bg-muted/20 p-4 rounded-xl border border-border">
                  <p>H_fixed ({frameType}) = {frame.kgPerFrame} kg × {fillPct}% fill = {(frame.kgPerFrame * fillPct / 100).toFixed(2)} kg/capped</p>
                  <p>H_gross = {framesPerHive} F × {(frame.kgPerFrame * fillPct / 100).toFixed(2)} = {grossPerHive.toFixed(2)} kg/colony</p>
                  <p>H_ethical = min(50% of {grossPerHive.toFixed(1)}, ({grossPerHive.toFixed(1)} - {reserve} reserve)) = {ethicalPerHive.toFixed(2)} kg/colony</p>
                  <p className="text-honey font-black mt-1">H_apiary = {hives} colonies × {ethicalPerHive.toFixed(2)} kg × ({hhi}% HHI) = {apiaryHarvest.toFixed(2)} kg total</p>
              </div>
          </BeeYieldSection>
        </div>
      </div>
    </BeeYieldPageShell>
  );

  if (embedded) return content;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity p-4", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <div className={cn("bg-white rounded-[2.5rem] w-full h-[95vh] max-w-6xl shadow-2xl relative transition-all transform overflow-hidden", isOpen ? "scale-100" : "scale-95")}>
        <button onClick={onClose} className="absolute top-10 right-10 p-2 rounded-full hover:bg-muted transition-colors z-50 text-muted-foreground hover:text-foreground">
          <X className="w-6 h-6" />
        </button>
        <div className="h-full overflow-y-auto custom-scroll p-10">
          {content}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "w-full bg-white border border-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-honey/40 transition-all shadow-sm";
