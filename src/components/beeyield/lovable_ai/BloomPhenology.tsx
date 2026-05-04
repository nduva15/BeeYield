import { useEffect, useState, useCallback } from "react";
import { X, Flower2, Plus, Loader2, FileSpreadsheet, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import MarkdownRenderer from "./MarkdownRenderer";

// Static expert phenology table (Northern Hemisphere baseline; AI narrative adapts to region)
const PHENOLOGY: Record<string, { start: string; peak: string; end: string; notes: string }> = {
  "Almonds (CA)":          { start: "Feb 10", peak: "Feb 22", end: "Mar 15", notes: "Tight 3-week bloom; place hives 24h before bloom break." },
  "Apples":                { start: "Apr 15", peak: "Apr 25", end: "May 10", notes: "King bloom = 70% of crop set; protect from frost." },
  "Blueberries (highbush)":{ start: "Apr 01", peak: "Apr 18", end: "May 05", notes: "Sequential cultivar bloom; stagger placement." },
  "Avocado (Hass)":        { start: "Mar 20", peak: "Apr 10", end: "May 20", notes: "AB synchronous flowering; dichogamous." },
  "Sunflower (hybrid)":    { start: "Jul 10", peak: "Jul 25", end: "Aug 15", notes: "18-day effective bloom per head; staggered fields ideal." },
  "Coffee (Arabica)":      { start: "Sep 15", peak: "Sep 22", end: "Oct 05", notes: "Triggered by post-drought rain; 7-day mass bloom." },
  "Mango":                 { start: "Mar 01", peak: "Mar 15", end: "Apr 05", notes: "Heat-suppressed; bees less active midday >32°C." },
  "Macadamia":             { start: "Aug 20", peak: "Sep 05", end: "Sep 25", notes: "Racemes need ≥4 hives/ha for full nut set." },
  "Sidr":                  { start: "Oct 15", peak: "Nov 01", end: "Dec 10", notes: "Premium honey; long bloom in arid wadis." },
};

type Obs = {
  id: string; crop: string; region: string;
  bloom_start: string | null; peak_bloom: string | null; bloom_end: string | null;
  intensity: number; notes: string | null; ai_insights: string | null; created_at: string;
  observed_on: string; zone_label: string | null; anchor_lat: number | null; anchor_lng: number | null;
  run_id: string | null; version_id: string | null;
};

type RunRow = { id: string; crop: string; created_at: string };
type RunVersion = { id: string; version_label: string; created_at: string };

export default function BloomPhenology({ isOpen, onClose, embedded }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [obs, setObs] = useState<Obs[]>([]);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [versions, setVersions] = useState<RunVersion[]>([]);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState("current");
  const [crop, setCrop] = useState(Object.keys(PHENOLOGY)[0]);
  const [region, setRegion] = useState("Kenya / East Africa");
  const [observedOn, setObservedOn] = useState(new Date().toISOString().slice(0, 10));
  const [zoneLabel, setZoneLabel] = useState("");
  const [anchorLat, setAnchorLat] = useState("");
  const [anchorLng, setAnchorLng] = useState("");
  const [bloomStart, setBloomStart] = useState("");
  const [peakBloom, setPeakBloom] = useState("");
  const [bloomEnd, setBloomEnd] = useState("");
  const [intensity, setIntensity] = useState(70);
  const [notes, setNotes] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [obsRes, runRes] = await Promise.all([
      (supabase as any).from("bloom_observations").select("*").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(50),
      supabase.from("harvest_runs").select("id,crop,created_at").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(20),
    ]);
    if (obsRes.data) setObs(obsRes.data as Obs[]);
    if (runRes.data) setRuns(runRes.data as RunRow[]);
  }, [deviceId]);
  useEffect(() => { if (isOpen || embedded) load(); }, [isOpen, embedded, load]);

  useEffect(() => {
    if (!selectedRunId) { setVersions([]); return; }
    (async () => {
      const { data } = await supabase
        .from("harvest_run_versions")
        .select("id,version_label,created_at")
        .eq("run_id", selectedRunId)
        .order("created_at", { ascending: false });
      setVersions((data || []) as RunVersion[]);
    })();
  }, [selectedRunId]);

  const baseline = PHENOLOGY[crop];

  const runAI = async () => {
    setAiLoading(true); setAiText("");
    try {
      const prompt = `As Beeyield AI, write a Bloom Phenology Insight Report for **${crop}** in **${region}**.\n\nBaseline expert window (Northern Hemisphere): start ${baseline.start}, peak ${baseline.peak}, end ${baseline.end}.\nObserved this season: start ${bloomStart || "—"}, peak ${peakBloom || "—"}, end ${bloomEnd || "—"}, intensity ${intensity}%.\nBeekeeper notes: ${notes || "(none)"}\n\nProvide: shift vs baseline (days early/late), forager-day estimate, recommended hive deployment date, climate drivers, and 5-point action plan.`;
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], promptVariant: "bloom-only" }),
      });
      if (!resp.ok || !resp.body) { toast.error("AI request failed"); setAiLoading(false); return; }
      const reader = resp.body.getReader(); const decoder = new TextDecoder();
      let buf = ""; let acc = ""; let done = false;
      while (!done) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { done = true; break; }
          try { const p = JSON.parse(j); const c = p.choices?.[0]?.delta?.content; if (c) { acc += c; setAiText(acc); } } catch { /* partial */ }
        }
      }
    } catch { toast.error("AI failed"); }
    finally { setAiLoading(false); }
  };

  const saveObs = async () => {
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("bloom_observations").insert({
      device_id: deviceId, crop, region,
      run_id: selectedRunId || null,
      version_id: selectedVersionId !== "current" ? selectedVersionId : null,
      observed_on: observedOn,
      zone_label: zoneLabel || null,
      anchor_lat: anchorLat ? Number(anchorLat) : null,
      anchor_lng: anchorLng ? Number(anchorLng) : null,
      bloom_start: bloomStart || null, peak_bloom: peakBloom || null, bloom_end: bloomEnd || null,
      intensity, notes: notes || null, ai_insights: aiText || null,
    });
    setSaving(false);
    if (error) { toast.error("Save failed"); return; }
    toast.success("Bloom observation saved");
    load();
  };

  const exportCSV = () => {
    const rows = [["crop","region","bloom_start","peak_bloom","bloom_end","intensity","notes","created_at"], ...obs.map((o) => [o.crop,o.region,o.bloom_start||"",o.peak_bloom||"",o.bloom_end||"",String(o.intensity),(o.notes||"").replace(/\n/g," "),o.created_at])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `beeyield-bloom-${Date.now()}.csv`; a.click();
    toast.success("Bloom CSV exported");
  };

  if (!isOpen && !embedded) return null;

  const containerClasses = embedded 
    ? "relative w-full h-full" 
    : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll";
  
  const contentClasses = embedded 
    ? "w-full" 
    : "max-w-5xl mx-auto p-6";

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {!embedded && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3"><Flower2 className="w-7 h-7 text-honey" />
              <div><h1 className="font-display text-2xl font-bold text-honey">Bloom Phenology</h1>
                <p className="text-xs text-muted-foreground">Expert tables × your observations × AI bloom-shift insights</p></div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 rounded-xl border border-border bg-muted/30">
          <Field label="Saved run">
            <select value={selectedRunId} onChange={(e) => { setSelectedRunId(e.target.value); setSelectedVersionId("current"); }} className={inputCls}>
              <option value="">Not linked to a run</option>
              {runs.map((run) => <option key={run.id} value={run.id}>{run.crop} · {new Date(run.created_at).toLocaleDateString()}</option>)}
            </select>
          </Field>
          <Field label="Saved version">
            <select value={selectedVersionId} onChange={(e) => setSelectedVersionId(e.target.value)} className={inputCls} disabled={!selectedRunId}>
              <option value="current">Current run</option>
              {versions.map((version) => <option key={version.id} value={version.id}>{version.version_label}</option>)}
            </select>
          </Field>
          <Field label="Crop"><select value={crop} onChange={(e) => setCrop(e.target.value)} className={inputCls}>{Object.keys(PHENOLOGY).map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Region"><input value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls} /></Field>
          <Field label="Observed on"><input type="date" value={observedOn} onChange={(e) => setObservedOn(e.target.value)} className={inputCls} /></Field>
          <Field label="Zone / block label"><input value={zoneLabel} onChange={(e) => setZoneLabel(e.target.value)} className={inputCls} placeholder="North block, bloom strip A, etc." /></Field>
          <Field label="Anchor latitude"><input type="number" value={anchorLat} onChange={(e) => setAnchorLat(e.target.value)} className={inputCls} placeholder="-2.4078" /></Field>
          <Field label="Anchor longitude"><input type="number" value={anchorLng} onChange={(e) => setAnchorLng(e.target.value)} className={inputCls} placeholder="37.9658" /></Field>
          <Field label="Observed bloom start"><input type="date" value={bloomStart} onChange={(e) => setBloomStart(e.target.value)} className={inputCls} /></Field>
          <Field label="Observed peak bloom"><input type="date" value={peakBloom} onChange={(e) => setPeakBloom(e.target.value)} className={inputCls} /></Field>
          <Field label="Observed bloom end"><input type="date" value={bloomEnd} onChange={(e) => setBloomEnd(e.target.value)} className={inputCls} /></Field>
          <Field label={`Bloom intensity: ${intensity}%`}><input type="range" min={0} max={100} value={intensity} onChange={(e) => setIntensity(+e.target.value)} className="w-full accent-honey" /></Field>
          <div className="md:col-span-2"><Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputCls} resize-y`} placeholder="weather, pest pressure, observed forager activity…" /></Field></div>
        </div>

        <div className="p-4 rounded-xl border border-honey/30 bg-honey/5 mb-4 text-sm">
          <b className="text-honey">Expert baseline for {crop}:</b> start <b>{baseline.start}</b> · peak <b>{baseline.peak}</b> · end <b>{baseline.end}</b><br />
          <span className="text-muted-foreground">{baseline.notes}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <button onClick={runAI} disabled={aiLoading} className="px-4 py-2.5 rounded-lg bg-gradient-amber text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50">{aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI bloom insights</button>
          <button onClick={saveObs} disabled={saving} className="px-4 py-2.5 rounded-lg border border-honey/40 bg-honey/5 hover:bg-honey/10 text-honey font-medium flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Save observation</button>
          <button onClick={exportCSV} className="px-4 py-2.5 rounded-lg border border-border flex items-center justify-center gap-2 text-foreground"><FileSpreadsheet className="w-4 h-4" /> Export CSV</button>
        </div>

        {aiText && (<div className="p-5 rounded-xl border border-honey/30 bg-card mb-4"><MarkdownRenderer content={aiText} /></div>)}

        <div className="p-4 rounded-xl border border-border bg-card">
          <h3 className="font-display text-sm font-bold text-foreground mb-3">Saved bloom observations ({obs.length})</h3>
          {obs.length === 0 ? <p className="text-xs text-muted-foreground">No observations yet.</p> : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {obs.map((o) => (
                <div key={o.id} className="p-3 rounded-lg border border-border bg-muted/20 text-sm">
                  <div className="font-semibold text-foreground">{o.crop} · {o.region}</div>
                  <div className="text-xs text-muted-foreground">observed {o.observed_on} · start {o.bloom_start || "—"} · peak {o.peak_bloom || "—"} · end {o.bloom_end || "—"} · intensity {o.intensity}%</div>
                  {(o.zone_label || (o.anchor_lat != null && o.anchor_lng != null)) && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {o.zone_label ? `zone ${o.zone_label}` : "mapped"}{o.anchor_lat != null && o.anchor_lng != null ? ` · ${o.anchor_lat.toFixed(5)}, ${o.anchor_lng.toFixed(5)}` : ""}
                    </div>
                  )}
                  {o.notes && <div className="text-xs italic mt-1">{o.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>{children}</div>; }
