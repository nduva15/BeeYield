import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Layers, MapPin, Flower2, Plane, Calculator, Loader2, FileDown, Sparkles, Save } from "lucide-react";
import { MapContainer, TileLayer, Polygon, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import MarkdownRenderer from "./MarkdownRenderer";

const CROP_RADIUS: Record<string, number> = {
  Almonds: 800, Apples: 600, Blueberries: 500, Avocado: 700,
  Sunflower: 1200, Coffee: 600, Mango: 700, Macadamia: 800, Sidr: 1500,
};

const hiveIcon = L.divIcon({
  html: '<div style="background:hsl(38,92%,50%);width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5);cursor:pointer"></div>',
  className: "", iconSize: [18, 18], iconAnchor: [9, 9],
});
const hiveIconActive = L.divIcon({
  html: '<div style="background:hsl(0,84%,60%);width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.6)"></div>',
  className: "", iconSize: [24, 24], iconAnchor: [12, 12],
});

type Run = {
  id: string; crop: string; region: string; hives: number; acres: number; hhi: number;
  site_layout: { polygon?: [number, number][]; hives?: [number, number][]; crop?: string } | null;
};
type Version = { id: string; version_label: string; site_layout: Run["site_layout"]; moa_filters: Filters | null };
type Filters = {
  crop?: string;
  dateFrom?: string;
  dateTo?: string;
  showCoverage?: boolean;
  showBloom?: boolean;
  showFlight?: boolean;
  showDiagnostics?: boolean;
  selectedHive?: number | null;
};
type Bloom = { id: string; crop: string; intensity: number; bloom_start: string | null; peak_bloom: string | null; bloom_end: string | null; created_at: string };
type Flight = { id: string; hive_label: string; bees_per_minute: number; pollen_loads: number; florage_source: string | null; observed_at: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  initialRunId?: string;
  initialVersionId?: string;
  embedded?: boolean;
}

const DEFAULT_FILTERS: Filters = {
  showCoverage: true, showBloom: true, showFlight: true, showDiagnostics: true, selectedHive: null,
};

export default function MOAView({ isOpen, onClose, readOnly = false, initialRunId, initialVersionId, embedded = false }: Props) {
  const deviceId = useDeviceId();
  const [runs, setRuns] = useState<Run[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [blooms, setBlooms] = useState<Bloom[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [diagnostics, setDiagnostics] = useState("");
  const [diagLoading, setDiagLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  // Initial load
  const load = useCallback(async () => {
    setLoading(true);
    const queries: Promise<unknown>[] = [
      (supabase as any).from("harvest_runs").select("id,crop,region,hives,acres,hhi,site_layout").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(20),
      (supabase as any).from("bloom_observations").select("*").order("created_at", { ascending: false }).limit(50),
      (supabase as any).from("bee_flight_logs").select("*").order("observed_at", { ascending: false }).limit(50),
    ];
    if (readOnly && initialRunId) {
      queries[0] = (supabase as any).from("harvest_runs").select("id,crop,region,hives,acres,hhi,site_layout").eq("id", initialRunId);
    } else {
      queries[1] = (supabase as any).from("bloom_observations").select("*").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(50);
      queries[2] = (supabase as any).from("bee_flight_logs").select("*").eq("device_id", deviceId).order("observed_at", { ascending: false }).limit(50);
    }
    const [r, b, f] = await Promise.all(queries) as any[];
    if (r.data) {
      setRuns(r.data);
      const target = initialRunId || r.data[0]?.id || "";
      if (target) setSelectedRunId(target);
    }
    if (b.data) setBlooms(b.data);
    if (f.data) setFlights(f.data);
    setLoading(false);
  }, [deviceId, readOnly, initialRunId]);

   
  useEffect(() => { if (isOpen) load(); }, [isOpen, load]);

  // Load versions & restore filters when run changes
  useEffect(() => {
    if (!selectedRunId) { setVersions([]); return; }
    (async () => {
      const { data } = await (supabase as any).from("harvest_run_versions").select("id,version_label,site_layout,moa_filters").eq("run_id", selectedRunId).order("created_at", { ascending: true });
      if (data) {
        setVersions(data);
        const targetV = initialVersionId || data[data.length - 1]?.id || "";
        if (targetV) setSelectedVersionId(targetV);
      }
    })();
  }, [selectedRunId, initialVersionId]);

  // When version changes, restore its saved filters
  useEffect(() => {
    if (!selectedVersionId) return;
    const v = versions.find((x) => x.id === selectedVersionId);
    if (v?.moa_filters) setFilters({ ...DEFAULT_FILTERS, ...v.moa_filters });
  }, [selectedVersionId, versions]);

  const run = runs.find((r) => r.id === selectedRunId);
  const activeVersion = versions.find((v) => v.id === selectedVersionId);
  const layout = activeVersion?.site_layout || run?.site_layout || {};
  const polygon = layout?.polygon || [];
  const hives = layout?.hives || [];
  const cropEffective = filters.crop || layout?.crop || run?.crop || "Almonds";
  const radius = CROP_RADIUS[cropEffective.split(" ")[0]] || 700;
  const center: [number, number] = polygon.length ? polygon[0] : hives[0] || [-2.4078, 37.9658];

  // Filter blooms by crop + date range
  const filteredBlooms = useMemo(() => {
    return blooms.filter((b) => {
      if (!b.crop.toLowerCase().includes(cropEffective.toLowerCase().split(" ")[0])) return false;
      if (filters.dateFrom && b.created_at < filters.dateFrom) return false;
      if (filters.dateTo && b.created_at > filters.dateTo + "T23:59:59") return false;
      return true;
    });
  }, [blooms, cropEffective, filters.dateFrom, filters.dateTo]);

  // Filter flights by selected hive label + date range
  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      if (filters.dateFrom && f.observed_at < filters.dateFrom) return false;
      if (filters.dateTo && f.observed_at > filters.dateTo + "T23:59:59") return false;
      if (filters.selectedHive != null) {
        const want = `Hive ${filters.selectedHive + 1}`;
        if (f.hive_label !== want) return false;
      }
      return true;
    });
  }, [flights, filters.dateFrom, filters.dateTo, filters.selectedHive]);

  const totalBeesPerMin = filteredFlights.reduce((s, f) => s + f.bees_per_minute, 0);
  const avgPollen = filteredFlights.length ? Math.round(filteredFlights.reduce((s, f) => s + f.pollen_loads, 0) / filteredFlights.length) : 0;
  const coverageM2 = hives.length * Math.PI * radius * radius;
  const acreM2 = (run?.acres || 0) * 4046.86;
  const coveragePct = acreM2 > 0 ? Math.min(100, (coverageM2 / acreM2) * 100) : 0;

  const persistFilters = async () => {
    if (!selectedVersionId) return;
    const { error } = await (supabase as any).from("harvest_run_versions").update({ moa_filters: filters }).eq("id", selectedVersionId);
    if (error) toast.error("Save failed"); else toast.success("MOA view saved to version");
  };

  const runDiagnostics = async () => {
    if (!run) return;
    setDiagLoading(true); setDiagnostics("");
    const avgIntensity = filteredBlooms.length ? Math.round(filteredBlooms.reduce((s, b) => s + b.intensity, 0) / filteredBlooms.length) : 0;
    const avgBpm = filteredFlights.length ? Math.round(totalBeesPerMin / filteredFlights.length) : 0;
    const prompt = `As Beeyield AI, write a **Combined Bloom × Flight Diagnostics** report for **${run.crop}** in **${run.region}**.

Inputs:
- Hives placed: ${hives.length} | Field: ${run.acres} ac | Coverage: ${coveragePct.toFixed(1)}% | HHI: ${run.hhi}/100
- Bloom observations (n=${filteredBlooms.length}): avg intensity ${avgIntensity}%
- Bee flight observations (n=${filteredFlights.length}): avg ${avgBpm} bees/min, avg pollen loads ${avgPollen}

Required sections:
1. **Gap Analysis** — 3 bullets identifying bloom-vs-activity mismatches (low activity + high bloom = colony stress; high activity + low bloom = robbing risk; low coverage = pollination deficit).
2. **Hive Placement Actions** — 3 numbered next actions (move hives N/S/E/W, add hive count, swap site).
3. **Feeding & Florage Plan** — 3 numbered actions (sugar syrup ratio, pollen patty timing, supplementary forage species to plant).
4. **48-Hour Decision** — single clear go/no-go recommendation.`;
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], promptVariant: "bloom_flight" }),
      });
      if (!resp.ok || !resp.body) { toast.error("AI failed"); setDiagLoading(false); return; }
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
          try { const p = JSON.parse(j); const c = p.choices?.[0]?.delta?.content; if (c) { acc += c; setDiagnostics(acc); } } catch { /* partial */ }
        }
      }
    } catch { toast.error("AI failed"); }
    finally { setDiagLoading(false); }
  };

  const exportPDF = async (includePanels: boolean) => {
    if (!mapWrapRef.current) return;
    setExporting(true);
    try {
      const mapCanvas = await html2canvas(mapWrapRef.current, { useCORS: true, allowTaint: true, scale: 1.5, logging: false });
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // Header band
      pdf.setFillColor(250, 204, 21);
      pdf.rect(0, 0, pageW, 14, "F");
      pdf.setTextColor(20, 20, 20);
      pdf.setFontSize(13); pdf.setFont("helvetica", "bold");
      pdf.text(`Beeyield · MOA Export · ${run?.crop || ""} · ${run?.region || ""}`, 8, 9);
      pdf.setFontSize(9); pdf.setFont("helvetica", "normal");
      pdf.text(`Version: ${activeVersion?.version_label || "—"}  |  ${new Date().toLocaleString()}`, pageW - 8, 9, { align: "right" });

      // Map image
      const mapW = includePanels ? pageW * 0.62 : pageW - 16;
      const ratio = mapCanvas.width / mapCanvas.height;
      const mapH = mapW / ratio;
      pdf.addImage(mapCanvas.toDataURL("image/jpeg", 0.85), "JPEG", 8, 20, mapW, Math.min(mapH, pageH - 50));

      // Stats footer band
      pdf.setFillColor(245, 245, 245);
      pdf.rect(0, pageH - 22, pageW, 22, "F");
      pdf.setTextColor(40, 40, 40);
      pdf.setFontSize(9);
      const stats = [
        `Hives: ${hives.length}`,
        `Field: ${run?.acres || 0} ac`,
        `Coverage: ${coveragePct.toFixed(1)}%`,
        `HHI: ${run?.hhi || 0}/100`,
        `Bees/min: ${totalBeesPerMin}`,
        `Pollen avg: ${avgPollen}`,
        `Bloom obs: ${filteredBlooms.length}`,
        `Flight obs: ${filteredFlights.length}`,
      ];
      stats.forEach((s, i) => pdf.text(s, 8 + (i % 4) * 70, pageH - 14 + Math.floor(i / 4) * 6));

      // Optional right-side panels capture
      if (includePanels && panelsRef.current) {
        const panelsCanvas = await html2canvas(panelsRef.current, { useCORS: true, allowTaint: true, scale: 1.4, backgroundColor: "#ffffff", logging: false });
        const panelW = pageW * 0.34;
        const panelRatio = panelsCanvas.width / panelsCanvas.height;
        const panelH = Math.min(panelW / panelRatio, pageH - 50);
        pdf.addImage(panelsCanvas.toDataURL("image/jpeg", 0.85), "JPEG", pageW - panelW - 8, 20, panelW, panelH);
      }

      pdf.save(`beeyield-moa-${run?.crop || "run"}-${activeVersion?.version_label || "v"}-${Date.now()}.pdf`);
      toast.success("MOA PDF exported");
    } catch (e) {
      console.error(e); toast.error("PDF export failed");
    } finally { setExporting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className={embedded ? "relative z-0 mt-4 h-[calc(100vh-9.5rem)] min-h-[640px] rounded-2xl border border-border bg-background overflow-hidden flex flex-col" : "fixed inset-0 z-50 bg-background overflow-hidden flex flex-col"}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-honey" />
          <div>
            <h1 className="font-display text-base font-bold text-honey leading-tight">Multi-Objective Apiary View</h1>
            <p className="text-[10px] text-muted-foreground">Map · bloom · flight · coverage · diagnostics — synced per version</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!readOnly && (
            <select value={selectedRunId} onChange={(e) => setSelectedRunId(e.target.value)} className="bg-background border border-border rounded-md px-2 py-1 text-xs">
              <option value="">— run —</option>
              {runs.map((r) => <option key={r.id} value={r.id}>{r.crop} · {r.hives}h</option>)}
            </select>
          )}
          <select value={selectedVersionId} onChange={(e) => setSelectedVersionId(e.target.value)} disabled={!versions.length} className="bg-background border border-border rounded-md px-2 py-1 text-xs">
            {versions.length === 0 ? <option>— no versions —</option> : versions.map((v) => <option key={v.id} value={v.id}>{v.version_label}</option>)}
          </select>
          <button onClick={() => exportPDF(false)} disabled={exporting || !run} className="px-2 py-1 rounded-md border border-border text-xs flex items-center gap-1 hover:border-primary/50 disabled:opacity-50">
            {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />} Map PDF
          </button>
          <button onClick={() => exportPDF(true)} disabled={exporting || !run} className="px-2 py-1 rounded-md bg-honey/10 border border-honey/40 text-honey text-xs flex items-center gap-1 disabled:opacity-50">
            <FileDown className="w-3 h-3" /> Map + Panels PDF
          </button>
          {!readOnly && (
            <button onClick={persistFilters} disabled={!selectedVersionId} className="px-2 py-1 rounded-md border border-border text-xs flex items-center gap-1 hover:border-primary/50 disabled:opacity-50">
              <Save className="w-3 h-3" /> Save filters
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex-shrink-0 border-b border-border bg-muted/30 px-4 py-2 flex items-center gap-3 flex-wrap text-xs">
        <label className="flex items-center gap-1">Crop override:
          <select value={filters.crop || ""} onChange={(e) => setFilters({ ...filters, crop: e.target.value || undefined })} className="bg-background border border-border rounded-md px-2 py-0.5 ml-1">
            <option value="">(use run crop)</option>
            {Object.keys(CROP_RADIUS).map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1">From: <input type="date" value={filters.dateFrom || ""} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })} className="bg-background border border-border rounded-md px-2 py-0.5" /></label>
        <label className="flex items-center gap-1">To: <input type="date" value={filters.dateTo || ""} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })} className="bg-background border border-border rounded-md px-2 py-0.5" /></label>
        <span className="ml-2 text-muted-foreground">Panels:</span>
        {(["showCoverage","showBloom","showFlight","showDiagnostics"] as const).map((k) => (
          <label key={k} className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={!!filters[k]} onChange={(e) => setFilters({ ...filters, [k]: e.target.checked })} className="accent-honey" />
            {k.replace("show", "")}
          </label>
        ))}
        {filters.selectedHive != null && (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-honey/15 text-honey text-[10px] font-semibold">
            Synced to Hive {filters.selectedHive + 1} · <button onClick={() => setFilters({ ...filters, selectedHive: null })} className="underline">clear</button>
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-honey" /></div>
      ) : !run ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-6 text-center">
          No saved harvest runs yet. Save a run from the Harvest Calculator to load the MOA view.
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-5 overflow-hidden">
          {/* Map */}
          <div ref={mapWrapRef} className="md:col-span-3 relative min-h-[420px] md:min-h-0 border-r border-border">
            <MapContainer center={center} zoom={15} style={{ width: "100%", height: "100%" }}>
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri Satellite" />
              {polygon.length >= 3 && <Polygon positions={polygon} pathOptions={{ color: "#facc15", fillOpacity: 0.15 }} />}
              {hives.map((h, i) => (
                <Marker
                  key={i}
                  position={h}
                  icon={filters.selectedHive === i ? hiveIconActive : hiveIcon}
                  eventHandlers={{ click: () => setFilters({ ...filters, selectedHive: filters.selectedHive === i ? null : i }) }}
                >
                  <Popup>Hive {i + 1} — click to sync panels<br />Foraging: {radius}m</Popup>
                </Marker>
              ))}
              {hives.map((h, i) => (
                <Circle key={`r${i}`} center={h} radius={radius} pathOptions={{ color: filters.selectedHive === i ? "#ef4444" : "#22c55e", fillOpacity: filters.selectedHive === i ? 0.12 : 0.05, weight: 1 }} />
              ))}
            </MapContainer>
            <div className="absolute bottom-3 left-3 z-[1000] bg-card/95 backdrop-blur border border-border rounded-lg px-3 py-2 text-xs">
              <b className="text-honey">{cropEffective}</b> · {hives.length} hives · {radius}m · <b>{coveragePct.toFixed(0)}%</b> coverage
            </div>
          </div>

          {/* Right panels */}
          <div ref={panelsRef} className="md:col-span-2 min-h-0 overflow-y-auto custom-scroll p-3 space-y-3 bg-muted/10">
            {filters.showCoverage && (
              <Panel icon={<Calculator className="w-4 h-4 text-honey" />} title="Pollination Coverage">
                <Stat label="Hives" value={`${hives.length}`} />
                <Stat label="Field area" value={`${run.acres} ac`} />
                <Stat label="Per-hive coverage" value={`${(Math.PI * radius * radius / 10000).toFixed(2)} ha`} />
                <Stat label="Total coverage" value={`${(coverageM2 / 10000).toFixed(2)} ha`} />
                <Stat label="Coverage %" value={`${coveragePct.toFixed(1)}%`} highlight={coveragePct >= 80} />
                <Stat label="HHI" value={`${run.hhi}/100`} highlight={run.hhi >= 75} />
              </Panel>
            )}
            {filters.showBloom && (
              <Panel icon={<Flower2 className="w-4 h-4 text-honey" />} title={`Bloom — ${cropEffective}`}>
                {filteredBlooms.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No matching bloom observations.</p>
                ) : filteredBlooms.slice(0, 4).map((b) => (
                  <div key={b.id} className="text-xs space-y-0.5 pb-2 border-b border-border last:border-0">
                    <div className="font-semibold text-foreground">Intensity {b.intensity}%</div>
                    <div className="text-muted-foreground">start {b.bloom_start || "—"} · peak {b.peak_bloom || "—"} · end {b.bloom_end || "—"}</div>
                  </div>
                ))}
              </Panel>
            )}
            {filters.showFlight && (
              <Panel icon={<Plane className="w-4 h-4 text-honey" />} title={filters.selectedHive != null ? `Flight Activity — Hive ${filters.selectedHive + 1}` : "Flight Activity (all hives)"}>
                <Stat label="Total bees/min" value={`${totalBeesPerMin}`} />
                <Stat label="Avg pollen loads" value={`${avgPollen}`} />
                <Stat label="Observations" value={`${filteredFlights.length}`} />
                {filteredFlights.slice(0, 4).map((f) => (
                  <div key={f.id} className="text-xs pt-2 border-t border-border space-y-0.5">
                    <div className="font-semibold text-foreground">{f.hive_label} · {f.bees_per_minute}/min</div>
                    <div className="text-muted-foreground">{f.florage_source || "—"} · {new Date(f.observed_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </Panel>
            )}
            {filters.showDiagnostics && (
              <Panel icon={<Sparkles className="w-4 h-4 text-honey" />} title="Combined Bloom × Flight Diagnostics">
                <button onClick={runDiagnostics} disabled={diagLoading} className="w-full mb-2 px-3 py-1.5 rounded-md bg-gradient-amber text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50">
                  {diagLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Run AI diagnostics
                </button>
                {diagnostics ? <div className="text-xs"><MarkdownRenderer content={diagnostics} /></div> : <p className="text-[11px] text-muted-foreground">Click above to generate gap analysis, placement actions, and feeding/florage plan.</p>}
              </Panel>
            )}
            <Panel icon={<MapPin className="w-4 h-4 text-honey" />} title="Run Summary">
              <Stat label="Crop" value={run.crop} />
              <Stat label="Region" value={run.region} />
              <Stat label="Apiary" value={`${run.hives} hives · ${run.acres} ac`} />
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2 mb-2">{icon}<h3 className="font-display text-xs font-bold text-foreground">{title}</h3></div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${highlight ? "text-honey" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
