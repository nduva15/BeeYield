import { Fragment, useState, useMemo, useEffect, useRef, useCallback } from "react";
import { X, MapPin, Trash2, Save, Loader2, Plus, Layers, FileDown, MessageSquare, Send, GitBranch, Flower2, Plane, Activity } from "lucide-react";
import { MapContainer, TileLayer, Marker, Polygon, Circle, Polyline, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  DEFAULT_MOA_FILTERS,
  coerceMoaFilters,
  haversineMeters,
  normalizeCropLabel,
  resolveCropRadius,
  withinDateRange,
  type MoaFilters,
} from "@/lib/pollination";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const hiveIcon = L.divIcon({
  className: "",
  html: `<div style="background:hsl(43,74%,49%);border:2px solid white;width:20px;height:20px;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:10px;">H</div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const commentIcon = L.divIcon({
  className: "",
  html: `<div style="background:hsl(217,91%,60%);border:2px solid white;width:18px;height:18px;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:10px;">C</div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const bloomIcon = L.divIcon({
  className: "",
  html: `<div style="background:hsl(142,71%,45%);border:2px solid white;width:18px;height:18px;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:10px;">B</div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const flightIcon = L.divIcon({
  className: "",
  html: `<div style="background:hsl(262,83%,58%);border:2px solid white;width:18px;height:18px;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:10px;">F</div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  initialRunId?: string;
  initialVersionId?: string;
}

type LatLng = { lat: number; lng: number };
type Mode = "field" | "hive" | "comment";

type SiteLayout = {
  crop: string;
  framesPerHive: number;
  flight_radius_m: number;
  field: LatLng[] | [number, number][];
  hives: LatLng[] | [number, number][];
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

type VersionRow = {
  id: string;
  version_label: string;
  created_at: string;
  site_layout: SiteLayout | null;
  moa_filters: unknown | null;
};

type BloomObservation = {
  id: string;
  crop: string;
  region: string;
  observed_on: string;
  intensity: number;
  bloom_start: string | null;
  peak_bloom: string | null;
  bloom_end: string | null;
  zone_label: string | null;
  anchor_lat: number | null;
  anchor_lng: number | null;
  run_id: string | null;
  version_id: string | null;
};

type FlightLog = {
  id: string;
  hive_label: string;
  observed_at: string;
  bees_per_minute: number;
  pollen_loads: number;
  flight_distance_m: number | null;
  flight_bearing_deg: number | null;
  flight_path: Array<{ lat: number; lng: number }> | null;
  hive_lat: number | null;
  hive_lng: number | null;
  storage_level_pct: number | null;
  nutrition_score: number | null;
  florage_source: string | null;
  florage_indicator: string | null;
  foraging_zone: string | null;
  run_id: string | null;
  version_id: string | null;
};

type FocusPoint = {
  kind: "hive" | "comment" | "bloom" | "flight";
  label: string;
  point: LatLng;
};

function ClickHandler({ onClick }: { onClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(event) {
      onClick({ lat: event.latlng.lat, lng: event.latlng.lng });
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

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng] as [number, number]));
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);
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

function coercePoint(value: unknown): LatLng | null {
  if (!value) return null;
  if (Array.isArray(value) && value.length >= 2) {
    return { lat: Number(value[0]), lng: Number(value[1]) };
  }
  if (typeof value === "object" && value !== null) {
    const raw = value as { lat?: unknown; lng?: unknown };
    if (typeof raw.lat === "number" && typeof raw.lng === "number") {
      return { lat: raw.lat, lng: raw.lng };
    }
  }
  return null;
}

function coercePoints(values: SiteLayout["field"] | SiteLayout["hives"] | null | undefined): LatLng[] {
  if (!Array.isArray(values)) return [];
  return values.map(coercePoint).filter(Boolean) as LatLng[];
}

export default function HivePlacementMap({
  isOpen,
  onClose,
  readOnly = false,
  initialRunId,
  initialVersionId,
}: Props) {
  const deviceId = useDeviceId();
  const [field, setField] = useState<LatLng[]>([]);
  const [hives, setHives] = useState<LatLng[]>([]);
  const [mode, setMode] = useState<Mode>("field");
  const [cropKey, setCropKey] = useState<string>("Almonds");
  const [framesPerHive, setFramesPerHive] = useState(8);
  const [tile, setTile] = useState<"sat" | "street">("sat");
  const [savedRunId, setSavedRunId] = useState<string>(initialRunId || "");
  const [savedRuns, setSavedRuns] = useState<{ id: string; crop: string; created_at: string }[]>([]);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>(initialVersionId || "current");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [comments, setComments] = useState<AnchoredComment[]>([]);
  const [draftAnchor, setDraftAnchor] = useState<LatLng | null>(null);
  const [draftAuthor, setDraftAuthor] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [blooms, setBlooms] = useState<BloomObservation[]>([]);
  const [flights, setFlights] = useState<FlightLog[]>([]);
  const [focus, setFocus] = useState<FocusPoint | null>(null);
  const [moaFilters, setMoaFilters] = useState<MoaFilters>(DEFAULT_MOA_FILTERS("Almonds"));

  const mapWrapRef = useRef<HTMLDivElement>(null);
  const exportWrapRef = useRef<HTMLDivElement>(null);
  const hydratingFiltersRef = useRef(false);
  const defaultCenter: [number, number] = [-2.4, 37.95];
  const radius = resolveCropRadius(cropKey);

  useEffect(() => {
    if (initialRunId) setSavedRunId(initialRunId);
  }, [initialRunId]);

  useEffect(() => {
    if (initialVersionId) setSelectedVersion(initialVersionId);
  }, [initialVersionId]);

  const stats = useMemo(() => {
    const areaM2 = polygonAreaM2(field);
    const acres = areaM2 / 4046.86;
    const framesTotal = hives.length * framesPerHive;
    const framesPerAcre = acres > 0 ? framesTotal / acres : 0;
    const grossCoverage = hives.length * Math.PI * radius * radius;
    const coveragePct = areaM2 > 0 ? Math.min(100, (Math.min(areaM2, grossCoverage) / areaM2) * 100) : 0;
    return { areaM2, acres, framesTotal, framesPerAcre, coveragePct, grossCoverage };
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
    if (!layout) {
      setField([]);
      setHives([]);
      return;
    }
    setField(coercePoints(layout.field));
    setHives(coercePoints(layout.hives));
    if (layout.crop) setCropKey(normalizeCropLabel(layout.crop));
    if (layout.framesPerHive) setFramesPerHive(layout.framesPerHive);
  }, []);

  const loadRunContext = useCallback(async (runId: string, versionId: string) => {
    const [{ data: runRow }, { data: versionRows }, { data: commentRows }, { data: bloomRows }, { data: flightRows }] = await Promise.all([
      supabase.from("harvest_runs").select("site_layout,crop,moa_filters").eq("id", runId).maybeSingle(),
      supabase.from("harvest_run_versions").select("id,version_label,created_at,site_layout,moa_filters").eq("run_id", runId).order("created_at", { ascending: false }),
      supabase.from("harvest_run_comments").select("*").eq("run_id", runId).order("created_at", { ascending: true }),
      supabase.from("bloom_observations").select("*").eq("run_id", runId).order("observed_on", { ascending: false }).limit(100),
      supabase.from("bee_flight_logs").select("*").eq("run_id", runId).order("observed_at", { ascending: false }).limit(200),
    ]);

    const versionsTyped = (versionRows || []) as VersionRow[];
    setVersions(versionsTyped);
    setComments((commentRows || []) as AnchoredComment[]);
    setBlooms((bloomRows || []) as unknown as BloomObservation[]);
    setFlights((flightRows || []) as unknown as FlightLog[]);

    const activeVersion = versionId === "current" ? null : versionsTyped.find((row) => row.id === versionId) || null;
    applyLayout((activeVersion?.site_layout || runRow?.site_layout) as SiteLayout | null);

    const cropFallback = normalizeCropLabel(
      (activeVersion?.site_layout as SiteLayout | null)?.crop || runRow?.crop || cropKey,
    );
    hydratingFiltersRef.current = true;
    setMoaFilters(coerceMoaFilters(activeVersion?.moa_filters ?? runRow?.moa_filters, cropFallback));
    setTimeout(() => {
      hydratingFiltersRef.current = false;
    }, 0);
    setFocus(null);
  }, [applyLayout, cropKey]);

  useEffect(() => { if (isOpen) loadRuns(); }, [isOpen, loadRuns]);

  useEffect(() => {
    if (!isOpen || !savedRunId) return;
    loadRunContext(savedRunId, selectedVersion);
  }, [isOpen, savedRunId, selectedVersion, loadRunContext]);

  useEffect(() => {
    if (!savedRunId || readOnly || hydratingFiltersRef.current) return;
    const timeout = setTimeout(async () => {
      const payload = { moa_filters: moaFilters };
      if (selectedVersion === "current") {
        await supabase.from("harvest_runs").update(payload).eq("id", savedRunId);
      } else {
        await supabase.from("harvest_run_versions").update(payload).eq("id", selectedVersion);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [savedRunId, selectedVersion, moaFilters, readOnly]);

  const handleClick = (point: LatLng) => {
    if (readOnly && mode !== "comment") return;
    if (mode === "field") setField((prev) => [...prev, point]);
    else if (mode === "hive") setHives((prev) => [...prev, point]);
    else if (mode === "comment") setDraftAnchor(point);
  };

  const reset = () => {
    setField([]);
    setHives([]);
    setFocus(null);
  };

  const persistToRun = async (asVersion: boolean) => {
    if (!savedRunId) {
      toast.error("Pick a saved harvest run to attach this layout to");
      return;
    }

    setSaving(true);
    const payload: SiteLayout = {
      crop: cropKey,
      framesPerHive,
      flight_radius_m: radius,
      field,
      hives,
      stats: { acres: stats.acres, framesPerAcre: stats.framesPerAcre, coveragePct: stats.coveragePct },
      saved_at: new Date().toISOString(),
    };

    if (asVersion) {
      const nextN = versions.length + 1;
      const { error } = await supabase.from("harvest_run_versions").insert({
        run_id: savedRunId,
        version_label: `layout-v${nextN}`,
        site_layout: payload,
        moa_filters: moaFilters,
      });
      setSaving(false);
      if (error) {
        toast.error("Failed to save version");
        return;
      }
      toast.success(`Saved layout-v${nextN} to harvest run`);
      loadRunContext(savedRunId, "current");
    } else {
      const { error } = await supabase.from("harvest_runs").update({
        site_layout: payload,
        moa_filters: moaFilters,
      }).eq("id", savedRunId);
      setSaving(false);
      if (error) {
        toast.error("Failed to save layout");
        return;
      }
      toast.success("Site layout saved to harvest run");
    }
  };

  const exportMapPDF = async () => {
    if (!exportWrapRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(exportWrapRef.current, { useCORS: true, allowTaint: true, scale: 1.4, logging: false });
      const img = canvas.toDataURL("image/jpeg", 0.92);
      const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 28;

      doc.setFillColor(245, 158, 11);
      doc.rect(0, 0, pageW, 56, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("BeeYield MOA Map Export", margin, 30);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const versionLabel = selectedVersion === "current"
        ? "current"
        : versions.find((version) => version.id === selectedVersion)?.version_label || "current";
      doc.text(`${new Date().toLocaleString()} · Version: ${versionLabel} · Crop: ${cropKey} · Radius: ${radius} m`, margin, 46);

      const imgW = pageW - margin * 2;
      const imgH = (canvas.height / canvas.width) * imgW;
      const targetH = Math.min(imgH, pageH - 56 - margin - 70);
      const targetW = (canvas.width / canvas.height) * targetH;
      doc.addImage(img, "JPEG", (pageW - targetW) / 2, 66, targetW, targetH);

      const footerY = 66 + targetH + 16;
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Coverage summary", margin, footerY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Field area: ${stats.acres.toFixed(2)} ac (${stats.areaM2.toFixed(0)} m²)`, margin, footerY + 16);
      doc.text(`Hives: ${hives.length} · Frames/hive: ${framesPerHive} · Frames/acre: ${stats.framesPerAcre.toFixed(2)}`, margin, footerY + 30);
      doc.text(`Coverage: ${stats.coveragePct.toFixed(1)}% · Bloom records: ${filteredBlooms.length} · Flight records: ${filteredFlights.length}`, margin, footerY + 44);
      doc.text(`MOA filters: ${moaFilters.crop} · ${moaFilters.dateFrom || "open"} to ${moaFilters.dateTo || "open"}`, margin, footerY + 58);

      doc.save(`beeyield-moa-map-${cropKey.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`);
      toast.success("Map PDF exported");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export map PDF");
    } finally {
      setExporting(false);
    }
  };

  const postComment = async () => {
    if (!savedRunId) {
      toast.error("Open a saved harvest run to comment");
      return;
    }
    if (!draftBody.trim()) {
      toast.error("Write a comment first");
      return;
    }
    setPosting(true);
    const insert = {
      run_id: savedRunId,
      parent_id: replyTo,
      author_name: draftAuthor.trim() || "Partner",
      body: draftBody.trim(),
      anchor_type: draftAnchor ? "map" : "general",
      anchor_lat: draftAnchor?.lat ?? null,
      anchor_lng: draftAnchor?.lng ?? null,
      anchor_step: null,
    };
    const { data, error } = await supabase.from("harvest_run_comments").insert(insert).select("*").single();
    setPosting(false);
    if (error || !data) {
      toast.error("Failed to post comment");
      return;
    }
    setComments((prev) => [...prev, data as AnchoredComment]);
    setDraftBody("");
    setDraftAnchor(null);
    setReplyTo(null);
    toast.success(replyTo ? "Reply posted" : "Comment posted");
  };

  const activeBlooms = useMemo(() => {
    return blooms.filter((row) => (selectedVersion === "current" ? !row.version_id : row.version_id === selectedVersion || !row.version_id));
  }, [blooms, selectedVersion]);

  const activeFlights = useMemo(() => {
    return flights.filter((row) => (selectedVersion === "current" ? !row.version_id : row.version_id === selectedVersion || !row.version_id));
  }, [flights, selectedVersion]);

  const locationMatches = useCallback((point: LatLng | null, target: LatLng | null) => {
    if (!point || !target) return true;
    return haversineMeters(point, target) <= Math.max(250, radius * 0.75);
  }, [radius]);

  const filteredBlooms = useMemo(() => {
    const focusPoint = focus?.point || null;
    return activeBlooms.filter((row) => {
      const cropMatch = normalizeCropLabel(row.crop).toLowerCase().includes(normalizeCropLabel(moaFilters.crop || cropKey).toLowerCase());
      const dateMatch = withinDateRange(`${row.observed_on}T00:00:00`, moaFilters.dateFrom, moaFilters.dateTo);
      const anchor = row.anchor_lat != null && row.anchor_lng != null ? { lat: row.anchor_lat, lng: row.anchor_lng } : null;
      return cropMatch && dateMatch && locationMatches(focusPoint, anchor);
    });
  }, [activeBlooms, moaFilters, cropKey, focus, locationMatches]);

  const filteredFlights = useMemo(() => {
    const focusPoint = focus?.point || null;
    return activeFlights.filter((row) => {
      const dateMatch = withinDateRange(row.observed_at, moaFilters.dateFrom, moaFilters.dateTo);
      const anchor = row.hive_lat != null && row.hive_lng != null ? { lat: row.hive_lat, lng: row.hive_lng } : null;
      return dateMatch && locationMatches(focusPoint, anchor);
    });
  }, [activeFlights, moaFilters, focus, locationMatches]);

  const threaded = useMemo(() => {
    const byParent: Record<string, AnchoredComment[]> = {};
    comments.forEach((comment) => {
      const key = comment.parent_id || "root";
      (byParent[key] = byParent[key] || []).push(comment);
    });
    return byParent;
  }, [comments]);

  const combinedFitPoints = useMemo(() => {
    const bloomPoints = filteredBlooms
      .map((row) => (row.anchor_lat != null && row.anchor_lng != null ? { lat: row.anchor_lat, lng: row.anchor_lng } : null))
      .filter(Boolean) as LatLng[];
    const flightPoints = filteredFlights
      .map((row) => (row.hive_lat != null && row.hive_lng != null ? { lat: row.hive_lat, lng: row.hive_lng } : null))
      .filter(Boolean) as LatLng[];
    const commentPoints = comments
      .map((comment) => (comment.anchor_lat != null && comment.anchor_lng != null ? { lat: comment.anchor_lat, lng: comment.anchor_lng } : null))
      .filter(Boolean) as LatLng[];
    return [...field, ...hives, ...bloomPoints, ...flightPoints, ...commentPoints];
  }, [field, hives, filteredBlooms, filteredFlights, comments]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <MapPin className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">
                Precision Hive Placement Map {readOnly && <span className="text-xs text-muted-foreground ml-2">(read-only)</span>}
              </h1>
              <p className="text-xs text-muted-foreground">
                Map, bloom phenology, bee-flight telemetry, and coverage panels stay synced per saved run version.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap p-3 rounded-xl border border-border bg-muted/20">
          {!readOnly && (
            <>
              <button onClick={() => setMode("field")} className={`px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${mode === "field" ? "border-honey bg-honey/15 text-honey" : "border-border text-muted-foreground hover:text-foreground"}`}>
                <Plus className="w-3.5 h-3.5" /> Add field corner
              </button>
              <button onClick={() => setMode("hive")} className={`px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${mode === "hive" ? "border-honey bg-honey/15 text-honey" : "border-border text-muted-foreground hover:text-foreground"}`}>
                <MapPin className="w-3.5 h-3.5" /> Drop hive
              </button>
            </>
          )}
          <button onClick={() => setMode("comment")} className={`px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${mode === "comment" ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
            <MessageSquare className="w-3.5 h-3.5" /> Pin comment
          </button>
          <span className="mx-1 h-6 border-l border-border" />
          <select value={cropKey} onChange={(event) => { const nextCrop = normalizeCropLabel(event.target.value); setCropKey(nextCrop); setMoaFilters((prev) => ({ ...prev, crop: nextCrop })); }} disabled={readOnly} className="bg-background border border-border rounded-lg px-2 h-9 text-xs disabled:opacity-50">
            {["Almonds", "Apples", "Blueberries", "Avocado", "Sunflower", "Coffee", "Macadamia", "Mango", "Sidr"].map((crop) => <option key={crop}>{crop}</option>)}
          </select>
          <label className="text-xs text-muted-foreground flex items-center gap-1.5">
            Frames/hive
            <input type="number" min={1} max={30} value={framesPerHive} onChange={(event) => setFramesPerHive(Math.max(1, +event.target.value || 1))} disabled={readOnly} className="w-16 bg-background border border-border rounded-lg px-2 h-9 text-xs disabled:opacity-50" />
          </label>
          <button onClick={() => setTile((current) => (current === "sat" ? "street" : "sat"))} className="px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-border text-muted-foreground hover:text-foreground">
            <Layers className="w-3.5 h-3.5" /> {tile === "sat" ? "Satellite" : "Street"}
          </button>
          {!readOnly && (
            <button onClick={reset} className="px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-border text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" /> Reset
            </button>
          )}
          <span className="mx-1 h-6 border-l border-border" />
          {!readOnly && (
            <select value={savedRunId} onChange={(event) => { setSavedRunId(event.target.value); setSelectedVersion("current"); }} className="bg-background border border-border rounded-lg px-2 h-9 text-xs max-w-[220px]">
              <option value="">Attach to harvest run...</option>
              {savedRuns.map((run) => <option key={run.id} value={run.id}>{run.crop} · {new Date(run.created_at).toLocaleDateString()}</option>)}
            </select>
          )}
          {savedRunId && (
            <select value={selectedVersion} onChange={(event) => setSelectedVersion(event.target.value)} className="bg-background border border-border rounded-lg px-2 h-9 text-xs max-w-[220px]">
              <option value="current">current layout</option>
              {versions.map((version) => <option key={version.id} value={version.id}>{version.version_label} · {new Date(version.created_at).toLocaleDateString()}</option>)}
            </select>
          )}
          {!readOnly && (
            <>
              <button onClick={() => persistToRun(false)} disabled={saving || !savedRunId} className="px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-honey/40 bg-honey/10 text-honey hover:bg-honey/20 disabled:opacity-50">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save layout
              </button>
              <button onClick={() => persistToRun(true)} disabled={saving || !savedRunId} className="px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-honey/40 text-honey hover:bg-honey/10 disabled:opacity-50">
                <GitBranch className="w-3.5 h-3.5" /> Save as new version
              </button>
            </>
          )}
          <button onClick={exportMapPDF} disabled={exporting} className="px-3 h-9 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-50">
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />} Export Map PDF
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
          <Stat label="Field corners" value={`${field.length}`} />
          <Stat label="Field area" value={`${stats.acres.toFixed(2)} ac`} highlight />
          <Stat label="Hives placed" value={`${hives.length}`} />
          <Stat label="Frames / acre" value={`${stats.framesPerAcre.toFixed(1)}`} highlight />
          <Stat label="Coverage" value={`${stats.coveragePct.toFixed(0)}%`} highlight />
        </div>

        <div ref={exportWrapRef} className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-start">
          <div className="xl:col-span-3">
            <div ref={mapWrapRef} className="rounded-xl overflow-hidden border border-border" style={{ height: 560 }}>
              <MapContainer center={defaultCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
                <MapInvalidator trigger={isOpen ? 1 : 0} />
                <FitBounds points={combinedFitPoints} />
                {tile === "sat" ? (
                  <TileLayer attribution='Tiles © Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" crossOrigin />
                ) : (
                  <TileLayer attribution='© OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png" crossOrigin />
                )}
                <ClickHandler onClick={handleClick} />

                {field.length >= 3 && (
                  <Polygon positions={field.map((point) => [point.lat, point.lng] as [number, number])} pathOptions={{ color: "hsl(43,74%,49%)", fillColor: "hsl(43,74%,49%)", fillOpacity: 0.18, weight: 2 }} />
                )}
                {hives.map((hive, index) => (
                  <Fragment key={`hive-wrap-${index}`}>
                    <Marker
                      position={[hive.lat, hive.lng]}
                      icon={hiveIcon}
                      eventHandlers={{ click: () => setFocus({ kind: "hive", label: `Hive ${index + 1}`, point: hive }) }}
                    />
                    <Circle center={[hive.lat, hive.lng]} radius={radius} pathOptions={{ color: "hsl(43,74%,49%)", fillColor: "hsl(43,74%,49%)", fillOpacity: 0.05, weight: 1, dashArray: "4 4" }} />
                  </Fragment>
                ))}
                {comments.filter((comment) => comment.anchor_lat != null && comment.anchor_lng != null).map((comment) => (
                  <Marker
                    key={`comment-${comment.id}`}
                    position={[comment.anchor_lat as number, comment.anchor_lng as number]}
                    icon={commentIcon}
                    eventHandlers={{ click: () => setFocus({ kind: "comment", label: comment.author_name, point: { lat: comment.anchor_lat as number, lng: comment.anchor_lng as number } }) }}
                  />
                ))}
                {filteredBlooms.slice(0, 25).map((row) => row.anchor_lat != null && row.anchor_lng != null ? (
                  <Marker
                    key={`bloom-${row.id}`}
                    position={[row.anchor_lat, row.anchor_lng]}
                    icon={bloomIcon}
                    eventHandlers={{ click: () => setFocus({ kind: "bloom", label: row.zone_label || row.crop, point: { lat: row.anchor_lat as number, lng: row.anchor_lng as number } }) }}
                  />
                ) : null)}
                {filteredFlights.slice(0, 25).map((row) => (
                  row.hive_lat != null && row.hive_lng != null ? (
                    <Marker
                      key={`flight-${row.id}`}
                      position={[row.hive_lat, row.hive_lng]}
                      icon={flightIcon}
                      eventHandlers={{ click: () => setFocus({ kind: "flight", label: row.hive_label, point: { lat: row.hive_lat as number, lng: row.hive_lng as number } }) }}
                    />
                  ) : null
                ))}
                {filteredFlights.map((row) => Array.isArray(row.flight_path) && row.flight_path.length >= 2 ? (
                  <Polyline
                    key={`path-${row.id}`}
                    positions={row.flight_path.map((point) => [point.lat, point.lng] as [number, number])}
                    pathOptions={{ color: "hsl(262,83%,58%)", weight: 2, opacity: 0.75 }}
                  />
                ) : null)}
                {draftAnchor && <Marker position={[draftAnchor.lat, draftAnchor.lng]} icon={commentIcon} />}
              </MapContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Click hive, bloom, flight, or comment pins to sync the right-side MOA panels to that location and time window.
            </p>
          </div>

          <div className="xl:col-span-2 space-y-4">
            <section className="p-4 rounded-xl border border-border bg-card">
              <h3 className="font-display text-sm font-bold text-foreground mb-3">MOA filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-3">
                <Field label="Crop">
                  <input value={moaFilters.crop} onChange={(event) => setMoaFilters((prev) => ({ ...prev, crop: event.target.value }))} className={inputCls} />
                </Field>
                <Field label="Date from">
                  <input type="date" value={moaFilters.dateFrom} onChange={(event) => setMoaFilters((prev) => ({ ...prev, dateFrom: event.target.value }))} className={inputCls} />
                </Field>
                <Field label="Date to">
                  <input type="date" value={moaFilters.dateTo} onChange={(event) => setMoaFilters((prev) => ({ ...prev, dateTo: event.target.value }))} className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Toggle label="Coverage" checked={moaFilters.showCoverage} onChange={(checked) => setMoaFilters((prev) => ({ ...prev, showCoverage: checked }))} />
                  <Toggle label="Bloom" checked={moaFilters.showBloom} onChange={(checked) => setMoaFilters((prev) => ({ ...prev, showBloom: checked }))} />
                  <Toggle label="Flight" checked={moaFilters.showFlight} onChange={(checked) => setMoaFilters((prev) => ({ ...prev, showFlight: checked }))} />
                  <Toggle label="Comments" checked={moaFilters.showComments} onChange={(checked) => setMoaFilters((prev) => ({ ...prev, showComments: checked }))} />
                </div>
              </div>
            </section>

            {focus && (
              <section className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                <div className="text-xs text-primary font-semibold mb-1">Map focus</div>
                <div className="text-sm text-foreground">{focus.kind} · {focus.label}</div>
                <div className="text-xs text-muted-foreground font-mono">{focus.point.lat.toFixed(5)}, {focus.point.lng.toFixed(5)}</div>
              </section>
            )}

            {moaFilters.showCoverage && (
              <Panel icon={<Activity className="w-4 h-4 text-honey" />} title="Coverage panel">
                <Line label="Crop" value={cropKey} />
                <Line label="Radius" value={`${radius} m`} />
                <Line label="Coverage" value={`${stats.coveragePct.toFixed(1)}%`} />
                <Line label="Bloom records" value={`${filteredBlooms.length}`} />
                <Line label="Flight records" value={`${filteredFlights.length}`} />
              </Panel>
            )}

            {moaFilters.showBloom && (
              <Panel icon={<Flower2 className="w-4 h-4 text-honey" />} title="Bloom panel">
                {filteredBlooms.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No bloom observations match the selected run version, date range, and map focus.</p>
                ) : (
                  filteredBlooms.slice(0, 6).map((row) => (
                    <div key={row.id} className="p-3 rounded-lg border border-border bg-muted/20">
                      <div className="text-sm font-semibold text-foreground">{row.zone_label || row.crop}</div>
                      <div className="text-xs text-muted-foreground">{row.observed_on} · intensity {row.intensity}%</div>
                      <div className="text-xs text-muted-foreground">start {row.bloom_start || "—"} · peak {row.peak_bloom || "—"} · end {row.bloom_end || "—"}</div>
                    </div>
                  ))
                )}
              </Panel>
            )}

            {moaFilters.showFlight && (
              <Panel icon={<Plane className="w-4 h-4 text-honey" />} title="Bee-flight panel">
                {filteredFlights.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No flight logs match the selected run version, date range, and map focus.</p>
                ) : (
                  filteredFlights.slice(0, 6).map((row) => (
                    <div key={row.id} className="p-3 rounded-lg border border-border bg-muted/20">
                      <div className="text-sm font-semibold text-foreground">{row.hive_label} · {row.bees_per_minute}/min</div>
                      <div className="text-xs text-muted-foreground">{new Date(row.observed_at).toLocaleString()} · {row.florage_source || "—"} · {row.foraging_zone || "unknown"} zone</div>
                      <div className="text-xs text-muted-foreground">distance {row.flight_distance_m ?? "—"} m · storage {row.storage_level_pct ?? "—"}% · nutrition {row.nutrition_score ?? "—"}/100</div>
                    </div>
                  ))
                )}
              </Panel>
            )}
          </div>
        </div>

        {savedRunId && moaFilters.showComments && (
          <section className="mt-6 p-5 rounded-xl border border-border bg-card">
            <h3 className="font-display text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-honey" /> Threaded comments ({comments.length})
            </h3>
            <div className="space-y-2 mb-4">
              <input value={draftAuthor} onChange={(event) => setDraftAuthor(event.target.value)} placeholder="Your name (optional)" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
              <textarea value={draftBody} onChange={(event) => setDraftBody(event.target.value)} placeholder={replyTo ? "Write your reply..." : draftAnchor ? `Comment pinned at ${draftAnchor.lat.toFixed(5)}, ${draftAnchor.lng.toFixed(5)}` : "General comment, or click the map with Pin comment mode to anchor it"} rows={3} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-y min-h-[64px]" />
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={postComment} disabled={posting || !draftBody.trim()} className="px-3 py-2 rounded-lg bg-honey/15 hover:bg-honey/25 text-honey border border-honey/40 text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {replyTo ? "Post reply" : "Post comment"}
                </button>
                {(draftAnchor || replyTo) && (
                  <button onClick={() => { setDraftAnchor(null); setReplyTo(null); }} className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground">
                    Clear anchor / reply
                  </button>
                )}
              </div>
            </div>

            {(threaded.root || []).length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No comments yet — be the first to leave one.</p>
            ) : (
              <div className="space-y-2">
                {(threaded.root || []).map((comment) => (
                  <CommentNode key={comment.id} comment={comment} replies={threaded[comment.id] || []} onReply={setReplyTo} onFocus={(point) => setFocus(point)} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function CommentNode({
  comment,
  replies,
  onReply,
  onFocus,
}: {
  comment: AnchoredComment;
  replies: AnchoredComment[];
  onReply: (id: string) => void;
  onFocus: (focus: FocusPoint) => void;
}) {
  return (
    <div className="p-3 rounded-lg border border-border bg-muted/20">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 gap-2 flex-wrap">
        <span className="font-semibold text-honey">{comment.author_name}</span>
        <span>{new Date(comment.created_at).toLocaleString()}</span>
      </div>
      <p className="text-sm text-foreground whitespace-pre-wrap">{comment.body}</p>
      {comment.anchor_lat != null && comment.anchor_lng != null && (
        <button
          onClick={() => onFocus({ kind: "comment", label: comment.author_name, point: { lat: comment.anchor_lat as number, lng: comment.anchor_lng as number } })}
          className="mt-2 text-[11px] text-primary hover:underline"
        >
          Focus map on {comment.anchor_lat.toFixed(5)}, {comment.anchor_lng.toFixed(5)}
        </button>
      )}
      <button onClick={() => onReply(comment.id)} className="mt-2 block text-xs text-primary hover:underline">Reply</button>
      {replies.length > 0 && (
        <div className="mt-3 ml-4 space-y-2 border-l-2 border-border pl-3">
          {replies.map((reply) => (
            <CommentNode key={reply.id} comment={reply} replies={[]} onReply={onReply} onFocus={onFocus} />
          ))}
        </div>
      )}
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-3">{icon}<h3 className="font-display text-sm font-bold text-foreground">{title}</h3></div>
      <div className="space-y-2">{children}</div>
    </section>
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border bg-muted/20 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="accent-honey" />
      <span className="text-xs text-foreground">{label}</span>
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-semibold text-right">{value}</span>
    </div>
  );
}

const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none";
