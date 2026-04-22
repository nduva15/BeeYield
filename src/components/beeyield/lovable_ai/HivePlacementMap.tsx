import { useState, useMemo, useEffect } from "react";
import { X, MapPin, Trash2, Save, Loader2, Plus, Layers } from "lucide-react";
import { MapContainer, TileLayer, Marker, Polygon, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";

// Fix default marker icons for Vite/CRA bundlers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const hiveIcon = L.divIcon({
  className: "",
  html: `<div style="background:hsl(43,74%,49%);border:2px solid white;width:20px;height:20px;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:10px;">🐝</div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

type LatLng = { lat: number; lng: number };

type Mode = "field" | "hive";

const CROP_RADIUS_M: Record<string, number> = {
  Almonds: 800,
  Apples: 700,
  Blueberries: 500,
  Cranberries: 600,
  Avocado: 600,
  Sunflower: 1200,
  Canola: 1500,
  Watermelon: 700,
  Cucumber: 500,
  Strawberry: 400,
  Coffee: 800,
  Macadamia: 600,
  Mango: 700,
  Sidr: 1000,
};

function ClickHandler({ mode, onClick }: { mode: Mode; onClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapInvalidator({ trigger }: { trigger: number }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 0);
  }, [trigger, map]);
  return null;
}

// Polygon area in m² using equirectangular approximation (good enough for farm-scale)
function polygonAreaM2(points: LatLng[]): number {
  if (points.length < 3) return 0;
  const R = 6378137;
  let area = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = (points[i].lng * Math.PI) / 180;
    const yi = (points[i].lat * Math.PI) / 180;
    const xj = (points[j].lng * Math.PI) / 180;
    const yj = (points[j].lat * Math.PI) / 180;
    area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj));
  }
  return Math.abs((area * R * R) / 2);
}

export default function HivePlacementMap({ isOpen, onClose, embedded }: Props) {
  const deviceId = useDeviceId();
  const [field, setField] = useState<LatLng[]>([]);
  const [hives, setHives] = useState<LatLng[]>([]);
  const [mode, setMode] = useState<Mode>("field");
  const [cropKey, setCropKey] = useState<string>("Almonds");
  const [framesPerHive, setFramesPerHive] = useState(8);
  const [tile, setTile] = useState<"sat" | "street">("sat");
  const [savedRunId, setSavedRunId] = useState<string>("");
  const [savedRuns, setSavedRuns] = useState<{ id: string; crop: string; created_at: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Default to a Kenya/Makueni-friendly center
  const defaultCenter: [number, number] = [-2.4, 37.95];

  const radius = CROP_RADIUS_M[cropKey] ?? 700;

  const stats = useMemo(() => {
    const areaM2 = polygonAreaM2(field);
    const acres = areaM2 / 4046.86;
    const framesTotal = hives.length * framesPerHive;
    const framesPerAcre = acres > 0 ? framesTotal / acres : 0;
    const grossCoverage = hives.length * Math.PI * radius * radius;
    const overlapFactor = grossCoverage > 0 ? Math.min(1, areaM2 / grossCoverage) : 0;
    const effectiveCoverage = grossCoverage * overlapFactor;
    const coveragePct = areaM2 > 0 ? Math.min(100, (effectiveCoverage / areaM2) * 100) : 0;
    return { areaM2, acres, framesTotal, framesPerAcre, coveragePct };
  }, [field, hives, framesPerHive, radius]);

  const loadRuns = async () => {
    const { data } = await supabase
      .from("harvest_runs")
      .select("id, crop, created_at")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setSavedRuns(data);
  };
  useEffect(() => { if (isOpen) loadRuns(); }, [isOpen]); // eslint-disable-line

  const handleClick = (ll: LatLng) => {
    if (mode === "field") setField((prev) => [...prev, ll]);
    else setHives((prev) => [...prev, ll]);
  };

  const reset = () => { setField([]); setHives([]); };

  const persistToRun = async () => {
    if (!savedRunId) { toast.error("Pick a saved harvest run to attach this layout to"); return; }
    setSaving(true);
    const payload = {
      crop: cropKey,
      framesPerHive,
      flight_radius_m: radius,
      field,
      hives,
      stats: { acres: stats.acres, framesPerAcre: stats.framesPerAcre, coveragePct: stats.coveragePct },
      saved_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("harvest_runs")
      .update({ site_layout: payload })
      .eq("id", savedRunId);
    setSaving(false);
    if (error) { toast.error("Failed to save layout"); return; }
    toast.success("Site layout saved to harvest run");
  };

  if (!isOpen) return null;

  return (
    <div className={embedded ? "overflow-y-auto custom-scroll" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <MapPin className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Precision Hive Placement Map</h1>
              <p className="text-xs text-muted-foreground">Draw your field, drop hives, see frames/acre + pollination coverage instantly</p>
            </div>
          </div>
          {!embedded && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-3 flex-wrap p-3 rounded-xl border border-border bg-muted/20">
          <button
            onClick={() => setMode("field")}
            className={`px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${mode === "field" ? "border-honey bg-honey/15 text-honey" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            <Plus className="w-3.5 h-3.5" /> Add field corner
          </button>
          <button
            onClick={() => setMode("hive")}
            className={`px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${mode === "hive" ? "border-honey bg-honey/15 text-honey" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            <MapPin className="w-3.5 h-3.5" /> Drop hive
          </button>
          <span className="mx-1 h-6 border-l border-border" />
          <select
            value={cropKey}
            onChange={(e) => setCropKey(e.target.value)}
            className="bg-background border border-border rounded-lg px-2 h-9 text-xs"
            title="Crop (sets flight radius)"
          >
            {Object.keys(CROP_RADIUS_M).map((c) => <option key={c}>{c}</option>)}
          </select>
          <label className="text-xs text-muted-foreground flex items-center gap-1.5">
            Frames/hive
            <input
              type="number" min={1} max={30} value={framesPerHive}
              onChange={(e) => setFramesPerHive(Math.max(1, +e.target.value || 1))}
              className="w-16 bg-background border border-border rounded-lg px-2 h-9 text-xs"
            />
          </label>
          <button
            onClick={() => setTile((t) => (t === "sat" ? "street" : "sat"))}
            className="px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-border text-muted-foreground hover:text-foreground"
            title="Toggle satellite / street"
          >
            <Layers className="w-3.5 h-3.5" /> {tile === "sat" ? "Satellite" : "Street"}
          </button>
          <button
            onClick={reset}
            className="px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-border text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset
          </button>
          <span className="mx-1 h-6 border-l border-border" />
          <select
            value={savedRunId}
            onChange={(e) => setSavedRunId(e.target.value)}
            className="bg-background border border-border rounded-lg px-2 h-9 text-xs max-w-[220px]"
          >
            <option value="">Attach to harvest run…</option>
            {savedRuns.map((r) => (
              <option key={r.id} value={r.id}>
                {r.crop} · {new Date(r.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
          <button
            onClick={persistToRun}
            disabled={saving || !savedRunId}
            className="px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-honey/40 bg-honey/10 text-honey hover:bg-honey/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save layout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
          <Stat label="Field corners" value={`${field.length}`} />
          <Stat label="Field area" value={`${stats.acres.toFixed(2)} ac`} highlight />
          <Stat label="Hives placed" value={`${hives.length}`} />
          <Stat label="Frames / acre" value={`${stats.framesPerAcre.toFixed(1)}`} highlight />
          <Stat label="Coverage" value={`${stats.coveragePct.toFixed(0)}%`} highlight />
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-border" style={{ height: 520 }}>
          <MapContainer center={defaultCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
            <MapInvalidator trigger={isOpen ? 1 : 0} />
            {tile === "sat" ? (
              <TileLayer
                attribution='Tiles &copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            ) : (
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}
            <ClickHandler mode={mode} onClick={handleClick} />

            {field.length >= 3 && (
              <Polygon
                positions={field.map((p) => [p.lat, p.lng] as [number, number])}
                pathOptions={{ color: "hsl(43,74%,49%)", fillColor: "hsl(43,74%,49%)", fillOpacity: 0.18, weight: 2 }}
              />
            )}
            {field.length >= 1 && field.length < 3 &&
              field.map((p, i) => (
                <Marker key={`fc-${i}`} position={[p.lat, p.lng]} />
              ))
            }
            {hives.map((h, i) => (
              <Marker key={`h-${i}`} position={[h.lat, h.lng]} icon={hiveIcon} />
            ))}
            {hives.map((h, i) => (
              <Circle
                key={`hc-${i}`}
                center={[h.lat, h.lng]}
                radius={radius}
                pathOptions={{ color: "hsl(43,74%,49%)", fillColor: "hsl(43,74%,49%)", fillOpacity: 0.06, weight: 1, dashArray: "4 4" }}
              />
            ))}
          </MapContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Click on the map to {mode === "field" ? "add the next field corner" : "drop a hive marker"}. Dashed circles show each hive's effective foraging radius for {cropKey} ({radius} m).
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-xl border ${highlight ? "border-honey/40 bg-honey/5" : "border-border bg-muted/30"}`}>
      <div className="text-[11px] text-muted-foreground mb-0.5">{label}</div>
      <div className={`font-display text-base font-bold ${highlight ? "text-honey" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
