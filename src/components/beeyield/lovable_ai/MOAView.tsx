import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { X, Layers, MapPin, Flower2, Plane, Calculator, Loader2, FileDown, Sparkles, Save, Info, Activity } from "lucide-react";
import { MapContainer, TileLayer, Polygon, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import MarkdownRenderer from "./MarkdownRenderer";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldBadge, BeeYieldCard } from "../BeeYieldUI";
import { cn } from "@/lib/utils";

const CROP_RADIUS: Record<string, number> = {
  Almonds: 800, Apples: 600, Blueberries: 500, Avocado: 700,
  Sunflower: 1200, Coffee: 600, Mango: 700, Macadamia: 800, Sidr: 1500,
};

const hiveIcon = L.divIcon({
  html: '<div style="background:hsl(38,92%,50%);width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5);cursor:pointer"></div>',
  className: "", iconSize: [18, 18], iconAnchor: [9, 9],
});
const hiveIconActive = L.divIcon({
  html: '<div style="background:hsl(10,80%,50%);width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(239,68,68,0.7);cursor:pointer"></div>',
  className: "", iconSize: [22, 22], iconAnchor: [11, 11],
});

type Run = { id: string; crop: string; region: string; hives: number; acres: number; hhi: number; site_layout: any };
type Version = { id: string; version_label: string; site_layout: any; moa_filters: Filters | null };
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

  const load = useCallback(async () => {
    setLoading(true);
    const queries = [
      supabase.from("harvest_runs").select("id,crop,region,hives,acres,hhi,site_layout").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(20),
      supabase.from("bloom_observations").select("*").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(50),
      supabase.from("bee_flight_logs").select("*").eq("device_id", deviceId).order("observed_at", { ascending: false }).limit(50),
    ];
    if (readOnly && initialRunId) {
      queries[0] = supabase.from("harvest_runs").select("id,crop,region,hives,acres,hhi,site_layout").eq("id", initialRunId);
    }
    const [r, b, f] = await Promise.all(queries);
    if (r.data) {
      setRuns(r.data as unknown as Run[]);
      const target = initialRunId || r.data[0]?.id || "";
      if (target) setSelectedRunId(target);
    }
    if (b.data) setBlooms(b.data as Bloom[]);
    if (f.data) setFlights(f.data as Flight[]);
    setLoading(false);
  }, [deviceId, readOnly, initialRunId]);

  useEffect(() => { if (isOpen) load(); }, [isOpen, load]);

  useEffect(() => {
    if (!selectedRunId) { setVersions([]); return; }
    (async () => {
      const { data } = await supabase.from("harvest_run_versions").select("id,version_label,site_layout,moa_filters").eq("run_id", selectedRunId).order("created_at", { ascending: true });
      if (data) {
        setVersions(data as Version[]);
        const targetV = initialVersionId || data[data.length - 1]?.id || "";
        if (targetV) setSelectedVersionId(targetV);
      }
    })();
  }, [selectedRunId, initialVersionId]);

  useEffect(() => {
    if (!selectedVersionId) return;
    const v = versions.find((x) => x.id === selectedVersionId);
    if (v?.moa_filters) setFilters({ ...DEFAULT_FILTERS, ...v.moa_filters });
  }, [selectedVersionId, versions]);

  const run = runs.find((r) => r.id === selectedRunId);
  const activeVersion = versions.find((v) => v.id === selectedVersionId);
  const layout = activeVersion?.site_layout || run?.site_layout || {};
  const polygon = layout?.polygon || [];
  const hivesArr = layout?.hives || [];
  const cropEffective = filters.crop || layout?.crop || run?.crop || "Almonds";
  const radius = CROP_RADIUS[cropEffective.split(" ")[0]] || 700;
  const center: [number, number] = polygon.length ? polygon[0] : hivesArr[0] || [-2.4078, 37.9658];

  const filteredBlooms = useMemo(() => {
    return blooms.filter((b) => {
      if (!b.crop.toLowerCase().includes(cropEffective.toLowerCase().split(" ")[0])) return false;
      if (filters.dateFrom && b.created_at < filters.dateFrom) return false;
      if (filters.dateTo && b.created_at > filters.dateTo + "T23:59:59") return false;
      return true;
    });
  }, [blooms, cropEffective, filters.dateFrom, filters.dateTo]);

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
  const coverageM2 = hivesArr.length * Math.PI * radius * radius;
  const acreM2 = (run?.acres || 0) * 4046.86;
  const coveragePct = acreM2 > 0 ? Math.min(100, (coverageM2 / acreM2) * 100) : 0;

  const exportPDF = async () => {
    if (!mapWrapRef.current) return;
    setExporting(true);
    try {
      const mapCanvas = await html2canvas(mapWrapRef.current, { useCORS: true, allowTaint: true, scale: 1.5, logging: false });
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      pdf.setFillColor(255, 185, 0);
      pdf.rect(0, 0, pageW, 14, "F");
      pdf.setTextColor(20, 20, 20);
      pdf.setFontSize(13); pdf.setFont("helvetica", "bold");
      pdf.text(`BeeYield MOA Export · ${run?.crop || ""} · ${run?.region || ""}`, 8, 9);
      pdf.addImage(mapCanvas.toDataURL("image/jpeg", 0.85), "JPEG", 8, 20, pageW - 16, 150);
      pdf.save(`beeyield-moa-export.pdf`);
      toast.success("PDF Generated");
    } finally { setExporting(false); }
  };

  const content = (
    <BeeYieldPageShell className={cn("flex flex-col h-full bg-background", embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : "")}>
      <BeeYieldPageHeader
        icon={Layers}
        label="MOA Intelligence"
        title="Multi-Objective View"
        subtitle="High-fidelity spatial synchronization of flight activity, bloom, and coverage."
        onBack={onClose}
        actions={
          <div className="flex items-center gap-2">
             <button onClick={exportPDF} disabled={exporting} className="px-3 py-1.5 rounded-xl border border-border bg-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-all">
               {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />} PDF
             </button>
          </div>
        }
      />

      <div className="flex-shrink-0 bg-honey/5 p-3 px-6 border-y border-honey/20 flex items-center gap-6 flex-wrap mt-4">
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Run</label>
          <select value={selectedRunId} onChange={(e) => setSelectedRunId(e.target.value)} className="bg-white border border-border rounded-lg px-3 py-1 text-xs font-bold focus:border-honey transition-all outline-none">
            {runs.map(r => <option key={r.id} value={r.id}>{r.crop} - {r.region}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Version</label>
          <select value={selectedVersionId} onChange={(e) => setSelectedVersionId(e.target.value)} className="bg-white border border-border rounded-lg px-3 py-1 text-xs font-bold focus:border-honey transition-all outline-none">
            {versions.map(v => <option key={v.id} value={v.id}>{v.version_label}</option>)}
          </select>
        </div>
        <div className="h-4 w-px bg-border/50 hidden md:block" />
        <div className="flex gap-4">
          {["showCoverage", "showBloom", "showFlight"].map(k => (
             <label key={k} className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest cursor-pointer group">
               <input type="checkbox" checked={!!(filters as any)[k]} onChange={e => setFilters({...filters, [k]: e.target.checked})} className="w-4 h-4 rounded border-honey/30 text-honey focus:ring-honey" />
               <span className="group-hover:text-honey transition-colors">{k.replace('show', '')}</span>
             </label>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        <div ref={mapWrapRef} className="flex-1 relative border-r border-border bg-muted">
          <MapContainer center={center} zoom={15} className="w-full h-full z-0">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            {polygon.length >= 3 && <Polygon positions={polygon} pathOptions={{ color: "#facc15", fillOpacity: 0.1, weight: 2 }} />}
            {hivesArr.map((h: any, i: number) => (
              <Marker key={i} position={h} icon={filters.selectedHive === i ? hiveIconActive : hiveIcon} eventHandlers={{ click: () => setFilters({...filters, selectedHive: i}) }}>
                <Circle center={h} radius={radius} pathOptions={{ color: filters.selectedHive === i ? "#ef4444" : "#facc15", fillOpacity: 0.05, weight: 1 }} />
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="w-full lg:w-96 flex-shrink-0 bg-white overflow-y-auto custom-scroll p-8 space-y-8">
          {filters.showCoverage && (
            <BeeYieldCard className="p-0 border-none shadow-none space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                    <Calculator className="w-4 h-4 text-honey" />
                    <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Spatial Metrics</h3>
                </div>
                <div className="space-y-4">
                    <Stat label="Total Coverage" value={`${coveragePct.toFixed(1)}%`} progress={coveragePct} />
                    <Stat label="Field Area" value={`${run?.acres || 0} Ac`} />
                    <Stat label="Hive Density" value={`${(hivesArr.length / (run?.acres || 1)).toFixed(1)}/ac`} />
                </div>
            </BeeYieldCard>
          )}

          {filters.showBloom && (
            <BeeYieldCard className="p-0 border-none shadow-none space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                    <Flower2 className="w-4 h-4 text-honey" />
                    <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Bloom Dynamics</h3>
                </div>
                <div className="space-y-3">
                    {filteredBlooms.slice(0, 3).map(b => (
                        <div key={b.id} className="p-4 rounded-2xl border border-border bg-honey/5 flex items-center justify-between group hover:border-honey/40 transition-all">
                            <div>
                                <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">{new Date(b.created_at).toLocaleDateString()}</div>
                                <div className="text-sm font-black text-foreground">{b.intensity}% Intensive</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-honey/10 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-honey" />
                            </div>
                        </div>
                    ))}
                </div>
            </BeeYieldCard>
          )}

          {filters.showFlight && (
            <BeeYieldCard className="p-0 border-none shadow-none space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                    <Plane className="w-4 h-4 text-honey" />
                    <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Flight Observations</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-honey/5 border border-honey/20">
                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Bees/Min</div>
                        <div className="text-xl font-black text-honey tracking-tight">{totalBeesPerMin}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-honey/5 border border-honey/20">
                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pollen</div>
                        <div className="text-xl font-black text-honey tracking-tight">{avgPollen}%</div>
                    </div>
                </div>
            </BeeYieldCard>
          )}
        </div>
      </div>
    </BeeYieldPageShell>
  );

  if (embedded) return content;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-opacity p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-[2.5rem] w-full h-[95vh] max-w-[95vw] shadow-2xl relative transition-all transform overflow-hidden ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-full hover:bg-muted transition-colors z-[1001]"><X className="w-5 h-5" /></button>
        {content}
      </div>
    </div>
  );
}

function Stat({ label, value, progress }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
        <span className="text-base font-black text-foreground tracking-tight">{value}</span>
      </div>
      {progress !== undefined && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-honey" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
