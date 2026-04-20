import { useState, useEffect, useCallback } from "react";
import { X, Calculator, Loader2, Sparkles, Save, FileDown, History, Trash2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import MarkdownRenderer from "@/components/beeyield/lovable_ai/MarkdownRenderer";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";

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
  ai_forecast: string | null;
  created_at: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HarvestCalculator({ isOpen, onClose }: Props) {
  const deviceId = useDeviceId();
  const [hives, setHives] = useState(10);
  const [acres, setAcres] = useState(0);
  const [crop, setCrop] = useState(CROP_OPTIONS[0]);
  const [frameType, setFrameType] = useState(FRAME_TYPES[0].name);
  const [framesPerHive, setFramesPerHive] = useState(8);
  const [fillPct, setFillPct] = useState(75);
  const [hhi, setHhi] = useState(80);
  const [region, setRegion] = useState("Kenya / East Africa");

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

  // AI forecast
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");

  // History
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedRuns, setSavedRuns] = useState<SavedRun[]>([]);
  const [saving, setSaving] = useState(false);

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

  const buildPrompt = () =>
    `Use the BeeYield Harvest Math (Section 18) and Pollination PSI v2 model (Section 18) to produce a fully worked numeric forecast for the following operation. Show every formula step. Apply the 50/50 ethical harvest rule. Then add a Pollination Saturation Index assessment for the listed crop, recommended colonies vs supplied colonies, and a 7-bullet action plan.\n\n` +
    `INPUTS:\n` +
    `- Hive count: ${hives}\n` +
    `- Crop / forage: ${crop}\n` +
    `- Acreage of crop: ${acres} acres\n` +
    `- Frame type: ${frameType} (${frame.kgPerFrame} kg/capped frame)\n` +
    `- Honey frames per hive: ${framesPerHive}\n` +
    `- Average frame fill (capped %): ${fillPct}%\n` +
    `- Hive Health Index (HHI 0–100): ${hhi}\n` +
    `- Region: ${region}\n\n` +
    `Required output sections (markdown): ## Executive Summary, ## Situation Assessment, ## Recommendations (Prioritized), ## Implementation Plan, ## Risks & Mitigations, ## Metrics to Track, ## Sources & Assumptions.`;

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
        body: JSON.stringify({ messages: [{ role: "user", content: buildPrompt() }] }),
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
    });
    setSaving(false);
    if (error) {
      toast.error("Failed to save run");
      return;
    }
    toast.success("Harvest run saved");
    loadRuns();
  };

  const loadRun = (r: SavedRun) => {
    setHives(r.hives);
    setAcres(Number(r.acres));
    setCrop(r.crop);
    setFrameType(r.frame_type);
    setFillPct(r.fill_pct);
    setHhi(r.hhi);
    setRegion(r.region);
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

  const deleteRun = async (id: string) => {
    const { error } = await supabase.from("harvest_runs").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Run deleted");
    loadRuns();
  };

  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    let y = margin;

    const ensureRoom = (h: number) => {
      if (y + h > pageH - margin) { doc.addPage(); y = margin; }
    };
    const writeLine = (txt: string, size = 10, bold = false, color: [number, number, number] = [30, 30, 30]) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(txt, pageW - margin * 2);
      lines.forEach((ln: string) => {
        ensureRoom(size + 4);
        doc.text(ln, margin, y);
        y += size + 4;
      });
    };

    // Header
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 0, pageW, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("BeeYield Harvest Forecast", margin, 38);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleString(), margin, 56);
    y = 100;

    writeLine("Inputs", 14, true, [180, 100, 0]);
    writeLine(`Hives: ${hives}    Crop: ${crop}    Acres: ${acres}`);
    writeLine(`Frame type: ${frameType} (${frame.kgPerFrame} kg/frame)    Frames/hive: ${framesPerHive}`);
    writeLine(`Fill: ${fillPct}%    HHI: ${hhi}    Region: ${region}`);
    y += 8;

    writeLine("Worked Math (50/50 Ethical Rule)", 14, true, [180, 100, 0]);
    writeLine(`H_frame  = ${frame.kgPerFrame} kg × (${fillPct}%/100) = ${(frame.kgPerFrame * fillPct / 100).toFixed(2)} kg/frame`);
    writeLine(`H_gross  = ${framesPerHive} × ${(frame.kgPerFrame * fillPct / 100).toFixed(2)} = ${grossPerHive.toFixed(1)} kg/hive`);
    writeLine(`Reserve  (${region}) = ${reserve} kg → Net = ${netPerHive.toFixed(1)} kg`);
    writeLine(`Ethical  = min(50% × gross, net) = ${ethicalPerHive.toFixed(1)} kg/hive`);
    writeLine(`Apiary   = ${ethicalPerHive.toFixed(1)} × ${hives} × (${hhi}/100) = ${apiaryHarvest.toFixed(0)} kg`, 11, true, [180, 100, 0]);
    y += 8;

    if (aiText) {
      writeLine("Beeyield AI Forecast", 14, true, [180, 100, 0]);
      // Strip markdown markers for cleaner PDF
      const plain = aiText
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1");
      writeLine(plain, 10);
    }

    // Footer
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`BeeYield • Page ${i} / ${total}`, pageW - margin, pageH - 20, { align: "right" });
    }

    const fname = `beeyield-harvest-${crop.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${Date.now()}.pdf`;
    doc.save(fname);
    toast.success("PDF report exported");
  };

  const sharePDF = async () => {
    // Simple share: copy a text summary to clipboard
    const summary =
      `BeeYield Harvest Forecast\n` +
      `${hives} hives · ${crop} · ${acres} acres\n` +
      `Frame: ${frameType} @ ${fillPct}% fill · HHI ${hhi}\n` +
      `Estimated apiary harvest: ${apiaryHarvest.toFixed(0)} kg (${ethicalPerHive.toFixed(1)} kg/hive ethical)\n`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "BeeYield Harvest Forecast", text: summary });
      } else {
        await navigator.clipboard.writeText(summary);
        toast.success("Summary copied to clipboard");
      }
    } catch { /* user canceled */ }
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
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {historyOpen && (
          <div className="mb-6 p-4 rounded-xl border border-border bg-card">
            <h3 className="font-display text-sm font-bold text-foreground mb-3">Saved harvest runs</h3>
            {savedRuns.length === 0 ? (
              <p className="text-xs text-muted-foreground">No saved runs yet. Click Save below to track HHI improvements over time.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scroll">
                {savedRuns.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:border-primary/40 bg-muted/20">
                    <button onClick={() => loadRun(r)} className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">
                        {r.crop} · {r.hives} hives · <span className="text-honey">{Number(r.local_estimate_kg ?? 0).toFixed(0)} kg</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        HHI {r.hhi} · fill {r.fill_pct}% · {r.region} · {new Date(r.created_at).toLocaleDateString()}
                        {r.ai_forecast ? " · AI ✓" : ""}
                      </div>
                    </button>
                    <button
                      onClick={() => deleteRun(r.id)}
                      className="w-8 h-8 rounded-lg border border-border hover:border-destructive/50 hover:text-destructive text-muted-foreground flex items-center justify-center"
                      title="Delete run"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
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
        </div>

        {/* Quick local estimate */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="Gross / hive" value={`${grossPerHive.toFixed(1)} kg`} />
          <Stat label="Reserve held back" value={`${reserve} kg`} />
          <Stat label="Ethical / hive" value={`${ethicalPerHive.toFixed(1)} kg`} highlight />
          <Stat label="Apiary total (× HHI)" value={`${apiaryHarvest.toFixed(0)} kg`} highlight />
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

        {/* Action bar: Save / PDF / Share */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          <button
            onClick={saveRun}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg border border-honey/40 bg-honey/5 hover:bg-honey/10 text-honey font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save run to history
          </button>
          <button
            onClick={exportPDF}
            className="px-4 py-2.5 rounded-lg border border-border hover:border-primary/50 text-foreground font-medium text-sm flex items-center justify-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export PDF report
          </button>
          <button
            onClick={sharePDF}
            className="px-4 py-2.5 rounded-lg border border-border hover:border-primary/50 text-foreground font-medium text-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Share summary
          </button>
        </div>

        {aiOpen && (
          <div className="p-5 rounded-xl border border-honey/30 bg-card">
            <h3 className="font-display text-base font-bold text-honey mb-3">Beeyield AI Forecast</h3>
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
