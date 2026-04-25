import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { X, MapPin, Trash2, Save, Loader2, Plus, Layers, FileDown, MessageSquare, Send, GitBranch } from "lucide-react";
import { MapContainer, TileLayer, Marker, Polygon, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
const commentIcon = L.divIcon({
  className: "",
  html: `<div style="background:hsl(217,91%,60%);border:2px solid white;width:18px;height:18px;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:10px;">💬</div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
  /** Read-only shared-run view (no editing, no save controls) */
  readOnly?: boolean;
  /** When set, the map auto-loads this saved run's layout (for shared links) */
  initialRunId?: string;
  /** When set + initialRunId is set, the map loads layout from this version's site_layout */
  initialVersionId?: string;
}

type LatLng = { lat: number; lng: number };
type Mode = "field" | "hive" | "comment";

const CROP_RADIUS_M: Record<string, number> = {
  Almonds: 800, Apples: 700, Blueberries: 500, Cranberries: 600, Avocado: 600,
  Sunflower: 1200, Canola: 1500, Watermelon: 700, Cucumber: 500, Strawberry: 400,
  Coffee: 800, Macadamia: 600, Mango: 700, Sidr: 1000,
};

type SiteLayout = {
  crop: string;
  framesPerHive: number;
  flight_radius_m: number;
  field: LatLng[];
  hives: LatLng[];
  stats?: { acres: number; framesPerAcre: number; coveragePct: number };
  saved_at?: string;
};

type AnchoredComment = {
  id: string;
  run_id: string;
  parent_id: string | null;
  author_name: string;
  body: string;
  anchor_type: string;
  anchor_lat: number | null;
  anchor_lng: number | null;
  anchor_step: number | null;
  created_at: string;
};

function ClickHandler({ mode, onClick }: { mode: Mode; onClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) { onClick({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return null;
}

function MapInvalidator({ trigger }: { trigger: number }) {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 0); }, [trigger, map]);
  return null;
}

function FitBounds({ field, hives }: { field: LatLng[]; hives: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    const all = [...field, ...hives];
    if (all.length === 0) return;
    const bounds = L.latLngBounds(all.map((p) => [p.lat, p.lng] as [number, number]));
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
  }, [field, hives, map]);
  return null;
}

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

export default function HivePlacementMap({ isOpen, onClose, embedded, readOnly = false, initialRunId, initialVersionId }: Props) {
  const deviceId = useDeviceId();
  const [field, setField] = useState<LatLng[]>([]);
  const [hives, setHives] = useState<LatLng[]>([]);
  const [mode, setMode] = useState<Mode>("field");
  const [cropKey, setCropKey] = useState<string>("Almonds");
  const [framesPerHive, setFramesPerHive] = useState(8);
  const [tile, setTile] = useState<"sat" | "street">("sat");
  const [savedRunId, setSavedRunId] = useState<string>(initialRunId || "");
  const [savedRuns, setSavedRuns] = useState<{ id: string; crop: string; created_at: string }[]>([]);
  const [versions, setVersions] = useState<{ id: string; version_label: string; created_at: string }[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>(initialVersionId || "current");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Comments
  const [comments, setComments] = useState<AnchoredComment[]>([]);
  const [draftAnchor, setDraftAnchor] = useState<LatLng | null>(null);
  const [draftAuthor, setDraftAuthor] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const mapWrapRef = useRef<HTMLDivElement>(null);
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

  const loadRuns = useCallback(async () => {
    if (readOnly) return;
    const { data } = await supabase
      .from("harvest_runs")
      .select("id, crop, created_at")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setSavedRuns(data);
  }, [deviceId, readOnly]);

  const applyLayout = useCallback((layout: SiteLayout | null | undefined) => {
    if (!layout) { setField([]); setHives([]); return; }
    setField(layout.field || []);
    setHives(layout.hives || []);
    if (layout.crop) setCropKey(layout.crop);
    if (layout.framesPerHive) setFramesPerHive(layout.framesPerHive);
  }, []);

  const loadRunLayoutAndComments = useCallback(async (runId: string, versionId: string) => {
    const [{ data: runRow }, { data: vData }, { data: cData }] = await Promise.all([
      supabase.from("harvest_runs").select("site_layout, crop").eq("id", runId).maybeSingle(),
      supabase.from("harvest_run_versions").select("id, version_label, site_layout, created_at").eq("run_id", runId).order("created_at", { ascending: false }),
      supabase.from("harvest_run_comments").select("*").eq("run_id", runId).order("created_at", { ascending: true }),
    ]);
    setVersions((vData || []).map((v) => ({ id: v.id, version_label: v.version_label, created_at: v.created_at })));
    setComments((cData || []) as AnchoredComment[]);
    if (versionId === "current") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      applyLayout((runRow as any)?.site_layout as SiteLayout | null);
    } else {
      const v = (vData || []).find((x) => x.id === versionId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      applyLayout((v as any)?.site_layout as SiteLayout | null);
    }
  }, [applyLayout]);

  useEffect(() => { if (isOpen) loadRuns(); }, [isOpen, loadRuns]);
  useEffect(() => {
    if (isOpen && savedRunId) loadRunLayoutAndComments(savedRunId, selectedVersion);
  }, [isOpen, savedRunId, selectedVersion, loadRunLayoutAndComments]);

  const handleClick = (ll: LatLng) => {
    if (readOnly && mode !== "comment") return;
    if (mode === "field") setField((prev) => [...prev, ll]);
    else if (mode === "hive") setHives((prev) => [...prev, ll]);
    else if (mode === "comment") setDraftAnchor(ll);
  };

  const reset = () => { setField([]); setHives([]); };

  const persistToRun = async (asVersion: boolean) => {
    if (!savedRunId) { toast.error("Pick a saved harvest run to attach this layout to"); return; }
    setSaving(true);
    const payload: SiteLayout = {
      crop: cropKey, framesPerHive, flight_radius_m: radius,
      field, hives,
      stats: { acres: stats.acres, framesPerAcre: stats.framesPerAcre, coveragePct: stats.coveragePct },
      saved_at: new Date().toISOString(),
    };
    if (asVersion) {
      const nextN = versions.length + 1;
      const { error } = await supabase.from("harvest_run_versions").insert({
        run_id: savedRunId,
        version_label: `layout-v${nextN}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        site_layout: payload as any,
      });
      setSaving(false);
      if (error) { toast.error("Failed to save version"); return; }
      toast.success(`Saved layout-v${nextN} to harvest run`);
      loadRunLayoutAndComments(savedRunId, "current");
    } else {
      const { error } = await supabase.from("harvest_runs").update({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        site_layout: payload as any,
      }).eq("id", savedRunId);
      setSaving(false);
      if (error) { toast.error("Failed to save layout"); return; }
      toast.success("Site layout saved to harvest run");
    }
  };

  const exportMapPDF = async () => {
    if (!mapWrapRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(mapWrapRef.current, { useCORS: true, allowTaint: true, scale: 1.5, logging: false });
      const img = canvas.toDataURL("image/jpeg", 0.92);
      const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 36;

      // Header band
      doc.setFillColor(245, 158, 11);
      doc.rect(0, 0, pageW, 60, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("BeeYield Hive Placement Map", margin, 32);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const verLabel = selectedVersion === "current"
        ? "current"
        : versions.find((v) => v.id === selectedVersion)?.version_label || "current";
      doc.text(`${new Date().toLocaleString()}  ·  Version: ${verLabel}  ·  Crop: ${cropKey}  ·  Flight radius: ${radius} m`, margin, 50);

      // Map image
      const imgW = pageW - margin * 2;
      const imgH = (canvas.height / canvas.width) * imgW;
      const targetH = Math.min(imgH, pageH - 60 - margin - 90);
      const targetW = (canvas.width / canvas.height) * targetH;
      doc.addImage(img, "JPEG", (pageW - targetW) / 2, 70, targetW, targetH);

      // Stats footer
      const y0 = 70 + targetH + 14;
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Coverage stats", margin, y0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Field area: ${stats.acres.toFixed(2)} ac (${stats.areaM2.toFixed(0)} m²)`, margin, y0 + 16);
      doc.text(`Hives placed: ${hives.length}  ·  Frames/hive: ${framesPerHive}  ·  Total frames: ${stats.framesTotal}`, margin, y0 + 30);
      doc.text(`Frames per acre: ${stats.framesPerAcre.toFixed(2)}`, margin, y0 + 44);
      doc.text(`Effective pollination coverage: ${stats.coveragePct.toFixed(1)}%`, margin, y0 + 58);

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`BeeYield • Hive Placement • ${verLabel}`, pageW - margin, pageH - 14, { align: "right" });

      doc.save(`beeyield-map-${cropKey.toLowerCase()}-${verLabel}-${Date.now()}.pdf`);
      toast.success("Map PDF exported");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export map PDF");
    } finally {
      setExporting(false);
    }
  };

  const postComment = async () => {
    if (!savedRunId) { toast.error("Open a saved harvest run to comment"); return; }
    if (!draftBody.trim()) { toast.error("Write a comment first"); return; }
    setPosting(true);
    const author = draftAuthor.trim() || "Partner";
    const insert = {
      run_id: savedRunId,
      parent_id: replyTo,
      author_name: author,
      body: draftBody.trim(),
      anchor_type: draftAnchor ? "map" : "general",
      anchor_lat: draftAnchor?.lat ?? null,
      anchor_lng: draftAnchor?.lng ?? null,
      anchor_step: null,
    };
    const { data, error } = await supabase
      .from("harvest_run_comments")
      .insert(insert)
      .select("*")
      .single();
    setPosting(false);
    if (error || !data) { toast.error("Failed to post comment"); return; }
    setComments((p) => [...p, data as AnchoredComment]);
    setDraftBody(""); setDraftAnchor(null); setReplyTo(null);
    toast.success(replyTo ? "Reply posted" : "Comment posted");
  };

  const mapComments = comments.filter((c) => c.anchor_type === "map" && c.anchor_lat != null && c.anchor_lng != null);
  const threaded = useMemo(() => {
    const byParent: Record<string, AnchoredComment[]> = {};
    comments.forEach((c) => {
      const k = c.parent_id || "root";
      (byParent[k] = byParent[k] || []).push(c);
    });
    return byParent;
  }, [comments]);

  if (!isOpen) return null;

  return (
    <div className={embedded ? "overflow-y-auto custom-scroll" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <MapPin className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">
                Precision Hive Placement Map {readOnly && <span className="text-xs text-muted-foreground ml-2">(read-only)</span>}
              </h1>
              <p className="text-xs text-muted-foreground">
                {readOnly ? "Viewing the saved layout for this shared harvest run" : "Draw your field, drop hives, see frames/acre + pollination coverage"}
              </p>
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
          {!readOnly && (
            <>
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
            </>
          )}
          <button
            onClick={() => setMode("comment")}
            className={`px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${mode === "comment" ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            title="Click the map to drop a comment pin"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Pin comment
          </button>
          <span className="mx-1 h-6 border-l border-border" />
          <select
            value={cropKey}
            onChange={(e) => setCropKey(e.target.value)}
            disabled={readOnly}
            className="bg-background border border-border rounded-lg px-2 h-9 text-xs disabled:opacity-50"
            title="Crop (sets flight radius)"
          >
            {Object.keys(CROP_RADIUS_M).map((c) => <option key={c}>{c}</option>)}
          </select>
          <label className="text-xs text-muted-foreground flex items-center gap-1.5">
            Frames/hive
            <input
              type="number" min={1} max={30} value={framesPerHive}
              onChange={(e) => setFramesPerHive(Math.max(1, +e.target.value || 1))}
              disabled={readOnly}
              className="w-16 bg-background border border-border rounded-lg px-2 h-9 text-xs disabled:opacity-50"
            />
          </label>
          <button
            onClick={() => setTile((t) => (t === "sat" ? "street" : "sat"))}
            className="px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-border text-muted-foreground hover:text-foreground"
          >
            <Layers className="w-3.5 h-3.5" /> {tile === "sat" ? "Satellite" : "Street"}
          </button>
          {!readOnly && (
            <button
              onClick={reset}
              className="px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-border text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" /> Reset
            </button>
          )}
          <span className="mx-1 h-6 border-l border-border" />
          {!readOnly && (
            <select
              value={savedRunId}
              onChange={(e) => { setSavedRunId(e.target.value); setSelectedVersion("current"); }}
              className="bg-background border border-border rounded-lg px-2 h-9 text-xs max-w-[220px]"
            >
              <option value="">Attach to harvest run…</option>
              {savedRuns.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.crop} · {new Date(r.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          )}
          {savedRunId && (
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="bg-background border border-border rounded-lg px-2 h-9 text-xs max-w-[220px]"
              title="Version"
            >
              <option value="current">current layout</option>
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.version_label} · {new Date(v.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          )}
          {!readOnly && (
            <>
              <button
                onClick={() => persistToRun(false)}
                disabled={saving || !savedRunId}
                className="px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-honey/40 bg-honey/10 text-honey hover:bg-honey/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save layout
              </button>
              <button
                onClick={() => persistToRun(true)}
                disabled={saving || !savedRunId}
                className="px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-honey/40 text-honey hover:bg-honey/10 disabled:opacity-50"
                title="Snapshot this layout as a new version"
              >
                <GitBranch className="w-3.5 h-3.5" /> Save as new version
              </button>
            </>
          )}
          <button
            onClick={exportMapPDF}
            disabled={exporting}
            className="px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-50"
            title="Export the satellite map + polygon + hives + stats as a PDF"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />} Export Map PDF
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
        <div ref={mapWrapRef} className="rounded-xl overflow-hidden border border-border" style={{ height: 520 }}>
          <MapContainer center={defaultCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
            <MapInvalidator trigger={isOpen ? 1 : 0} />
            <FitBounds field={field} hives={hives} />
            {tile === "sat" ? (
              <TileLayer
                attribution='Tiles &copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                crossOrigin
              />
            ) : (
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                crossOrigin
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
              field.map((p, i) => (<Marker key={`fc-${i}`} position={[p.lat, p.lng]} />))
            }
            {hives.map((h, i) => (<Marker key={`h-${i}`} position={[h.lat, h.lng]} icon={hiveIcon} />))}
            {hives.map((h, i) => (
              <Circle
                key={`hc-${i}`}
                center={[h.lat, h.lng]}
                radius={radius}
                pathOptions={{ color: "hsl(43,74%,49%)", fillColor: "hsl(43,74%,49%)", fillOpacity: 0.06, weight: 1, dashArray: "4 4" }}
              />
            ))}
            {mapComments.map((c) => (
              <Marker key={`c-${c.id}`} position={[c.anchor_lat as number, c.anchor_lng as number]} icon={commentIcon} />
            ))}
            {draftAnchor && (
              <Marker position={[draftAnchor.lat, draftAnchor.lng]} icon={commentIcon} />
            )}
          </MapContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {readOnly
            ? `Read-only layout. Switch to "Pin comment" to leave anchored feedback.`
            : `Click on the map to ${mode === "field" ? "add the next field corner" : mode === "hive" ? "drop a hive marker" : "drop a comment pin"}. Dashed circles show each hive's foraging radius for ${cropKey} (${radius} m).`}
        </p>

        {/* Comments panel */}
        {savedRunId && (
          <section className="mt-6 p-5 rounded-xl border border-border bg-card">
            <h3 className="font-display text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-honey" /> Threaded comments ({comments.length})
            </h3>

            <div className="space-y-2 mb-4">
              <input
                type="text"
                value={draftAuthor}
                onChange={(e) => setDraftAuthor(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                placeholder={replyTo ? "Write your reply…" : draftAnchor ? `Comment pinned at ${draftAnchor.lat.toFixed(5)}, ${draftAnchor.lng.toFixed(5)}` : "General comment, or click the map (with Pin comment mode) to anchor it"}
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-y min-h-[64px]"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={postComment}
                  disabled={posting || !draftBody.trim()}
                  className="px-3 py-2 rounded-lg bg-honey/15 hover:bg-honey/25 text-honey border border-honey/40 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {replyTo ? "Post reply" : "Post comment"}
                </button>
                {(draftAnchor || replyTo) && (
                  <button
                    onClick={() => { setDraftAnchor(null); setReplyTo(null); }}
                    className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear anchor / reply
                  </button>
                )}
              </div>
            </div>

            {(threaded["root"] || []).length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No comments yet — be the first to leave one.</p>
            ) : (
              <div className="space-y-2">
                {(threaded["root"] || []).map((c) => (
                  <CommentNode key={c.id} c={c} replies={threaded[c.id] || []} onReply={(id) => setReplyTo(id)} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function CommentNode({ c, replies, onReply }: { c: AnchoredComment; replies: AnchoredComment[]; onReply: (id: string) => void }) {
  return (
    <div className="p-3 rounded-lg border border-border bg-muted/20">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 gap-2 flex-wrap">
        <span className="font-semibold text-honey flex items-center gap-1.5">
          {c.author_name}
          {c.anchor_type === "map" && (
            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-primary/15 text-primary">📍 map pin</span>
          )}
          {c.anchor_type === "step" && c.anchor_step != null && (
            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-primary/15 text-primary">step {c.anchor_step}</span>
          )}
        </span>
        <span>{new Date(c.created_at).toLocaleString()}</span>
      </div>
      <p className="text-sm text-foreground whitespace-pre-wrap">{c.body}</p>
      {c.anchor_type === "map" && c.anchor_lat != null && c.anchor_lng != null && (
        <p className="text-[11px] text-muted-foreground mt-1 font-mono">📍 {c.anchor_lat.toFixed(5)}, {c.anchor_lng.toFixed(5)}</p>
      )}
      <button
        onClick={() => onReply(c.id)}
        className="mt-2 text-xs text-primary hover:underline"
      >
        Reply
      </button>
      {replies.length > 0 && (
        <div className="mt-3 ml-4 space-y-2 border-l-2 border-border pl-3">
          {replies.map((r) => (
            <CommentNode key={r.id} c={r} replies={[]} onReply={onReply} />
          ))}
        </div>
      )}
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
