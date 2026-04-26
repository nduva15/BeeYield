import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { X, Layers, MapPin, Flower2, Plane, Calculator, Loader2, FileDown, Sparkles, Save } from "lucide-react";
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
  const panelsRef = useRef<HTMLDivElement>(null);

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
      setRuns(r.data);
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

  const exportPDF = async (includePanels: boolean) => {
    if (!mapWrapRef.current) return;
    setExporting(true);
    try {
      const mapCanvas = await html2canvas(mapWrapRef.current, { useCORS: true, allowTaint: true, scale: 1.5, logging: false });
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      pdf.setFillColor(250, 204, 21);
      pdf.rect(0, 0, pageW, 14, "F");
      pdf.setTextColor(20, 20, 20);
      pdf.setFontSize(13); pdf.setFont("helvetica", "bold");
      pdf.text(`Beeyield · MOA Export · ${run?.crop || ""} · ${run?.region || ""}`, 8, 9);
      pdf.addImage(mapCanvas.toDataURL("image/jpeg", 0.85), "JPEG", 8, 20, includePanels ? pageW * 0.6 : pageW-16, 150);
      pdf.save(`beeyield-moa-export.pdf`);
      toast.success("PDF Generated");
    } finally { setExporting(false); }
  };

  const content = (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-shrink-0 p-4 border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-honey" />
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Multi-Objective View</h2>
            <p className="text-xs text-muted-foreground">High-fidelity spatial synchronization</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => exportPDF(true)} className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted">
             <FileDown className="w-3.5 h-3.5" /> PDF
           </button>
           <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-shrink-0 bg-muted/30 p-2 px-4 border-b border-border flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase">
          Run:
          <select value={selectedRunId} onChange={(e) => setSelectedRunId(e.target.value)} className="bg-white border border-border rounded px-2 py-0.5 text-foreground font-bold">
            {runs.map(r => <option key={r.id} value={r.id}>{r.crop} - {r.region}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase">
          Version:
          <select value={selectedVersionId} onChange={(e) => setSelectedVersionId(e.target.value)} className="bg-white border border-border rounded px-2 py-0.5 text-foreground font-bold">
            {versions.map(v => <option key={v.id} value={v.id}>{v.version_label}</option>)}
          </select>
        </div>
        <div className="flex gap-4 ml-auto">
          {["showCoverage", "showBloom", "showFlight"].map(k => (
             <label key={k} className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase cursor-pointer">
               <input type="checkbox" checked={!!(filters as any)[k]} onChange={e => setFilters({...filters, [k]: e.target.checked})} className="accent-honey" />
               {k.replace('show', '')}
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

        <div className="w-full lg:w-96 flex-shrink-0 bg-white overflow-y-auto custom-scroll p-6 space-y-6">
          {filters.showCoverage && (
            <Panel icon={<Calculator className="w-4 h-4 text-honey" />} title="Spatial Metrics">
               <Stat label="Total Coverage" value={`${coveragePct.toFixed(1)}%`} progress={coveragePct} />
               <Stat label="Field Area" value={`${run?.acres || 0} Ac`} />
               <Stat label="Hive Density" value={`${(hivesArr.length / (run?.acres || 1)).toFixed(1)}/ac`} />
            </Panel>
          )}

          {filters.showBloom && (
            <Panel icon={<Flower2 className="w-4 h-4 text-honey" />} title={`Bloom Dynamics`}>
              {filteredBlooms.slice(0, 3).map(b => (
                <div key={b.id} className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                   <div className="flex justify-between text-xs font-black uppercase">
                     <span>Intensity</span>
                     <span className="text-honey">{b.intensity}%</span>
                   </div>
                   <div className="h-1.5 bg-honey/10 rounded-full overflow-hidden">
                     <div className="h-full bg-honey" style={{ width: `${b.intensity}%` }} />
                   </div>
                   <div className="text-[10px] text-muted-foreground font-bold">{new Date(b.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </Panel>
          )}

          {filters.showFlight && (
            <Panel icon={<Plane className="w-4 h-4 text-honey" />} title="Flight Observations">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-honey/5 border border-honey/20">
                     <div className="text-[9px] font-black text-muted-foreground uppercase mb-1">Bees/Min</div>
                     <div className="text-lg font-black text-honey">{totalBeesPerMin}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-honey/5 border border-honey/20">
                     <div className="text-[9px] font-black text-muted-foreground uppercase mb-1">Pollen Load</div>
                     <div className="text-lg font-black text-honey">{avgPollen}%</div>
                  </div>
               </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-opacity p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-3xl w-full h-[95vh] max-w-[95vw] shadow-2xl relative transition-all transform overflow-hidden ${isOpen ? 'scale-100' : 'scale-95'}`}>
        {content}
      </div>
    </div>
  );
}

function Panel({ icon, title, children }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {icon}
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Stat({ label, value, progress }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-muted-foreground uppercase">{label}</span>
        <span className="text-sm font-black text-foreground">{value}</span>
      </div>
      {progress !== undefined && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-honey" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
