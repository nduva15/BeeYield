import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Flower2,
  Sparkles,
  Activity,
  MapPin,
  Plus,
  Search,
  Trash2,
  Pencil,
  FileDown,
  RefreshCw,
  Loader2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Compass,
  Trees,
  Copy,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useDeviceId } from "@/hooks/use-device-id";
import { supabase } from "@/integrations/supabase/client";
import { streamBeeGpt } from "@/lib/beegpt-stream";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { downloadReportPdf, safeName } from "@/lib/report-pdf";

export type ForageZone = {
  id: string;
  user_id?: string;
  apiary_id?: string | null;
  zone_name: string;
  flora_type: string;
  latitude?: number | null;
  longitude?: number | null;
  radius_km?: number | null;
  density_score?: number | null;
  season?: string | null;
  geojson?: any;
  notes?: string | null;
  ai_insights?: string | null;
  created_at?: string;
  updated_at?: string | null;
};

type ApiaryOption = {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
};

const FLORA_PRESETS = [
  "Acacia tortilis (Umbrella Thorn)",
  "Acacia mellifera (Wait-a-bit)",
  "Citrus & Orange Orchards",
  "Mango Trees (Apple/Kent)",
  "Wild Clover & Meadow Flowers",
  "Eucalyptus saligna",
  "Sunflower Belts",
  "Macadamia Nut Trees",
  "Coffee Blossoms",
  "Avocado Groves",
];

const SEASONS = [
  "Current Bloom Peak",
  "Wet Season Flow (Apr - Jun)",
  "Short Rains Flow (Nov - Dec)",
  "Dry Season Dearth Forage",
  "Year-Round Staggered Bloom",
];

const QUICK_PROMPTS = [
  "Calculate colony carrying capacity for this zone",
  "Acacia nectar secretion timings & brix index",
  "Bee-friendly floral buffer crops to prevent dearth",
  "Assess pesticide drift hazards in surrounding fields",
];

const EMPTY_DRAFT = {
  apiary_id: "",
  zone_name: "",
  flora_type: "Acacia tortilis (Umbrella Thorn)",
  season: "Current Bloom Peak",
  radius_km: 1.5,
  density_score: 0.75,
  latitude: "",
  longitude: "",
  notes: "",
};

function densityTone(score?: number | null) {
  const val = score ?? 0.5;
  if (val >= 0.7) return { label: "High / Surplus", badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", bar: "bg-emerald-500" };
  if (val >= 0.4) return { label: "Moderate / Active", badge: "text-amber-400 bg-amber-500/10 border-amber-500/30", bar: "bg-amber-500" };
  return { label: "Low / Dearth Risk", badge: "text-rose-400 bg-rose-500/10 border-rose-500/30", bar: "bg-rose-500" };
}

interface ForageZonesViewProps {
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
  onTabChange?: (tab: string) => void;
}

export default function ForageZonesView({
  isOpen = true,
  onClose,
  embedded = false,
  onTabChange,
}: ForageZonesViewProps) {
  const { user } = useAuth();
  const deviceId = useDeviceId();

  const [apiaries, setApiaries] = useState<ApiaryOption[]>([]);
  const [zones, setZones] = useState<ForageZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [densityFilter, setDensityFilter] = useState("all");
  const [apiaryFilter, setApiaryFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  // BeeGPT state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiStreaming, setAiStreaming] = useState(false);
  const [expandedZoneAi, setExpandedZoneAi] = useState<Record<string, boolean>>({});

  // Deletion confirm
  const [zoneToDelete, setZoneToDelete] = useState<ForageZone | null>(null);

  const userEmail = user?.email || "";

  // Load apiaries
  const loadApiaries = useCallback(async () => {
    try {
      const { data } = await (supabase as any)
        .from("apiaries")
        .select("id, name, latitude, longitude")
        .order("name");
      if (data && Array.isArray(data) && data.length > 0) {
        setApiaries(data);
      } else {
        setApiaries([
          { id: "primary-apiary", name: "Kibwezi Main Apiary", latitude: -2.4251, longitude: 37.9742 },
          { id: "north-apiary", name: "Mbuinzau Hill Apiary", latitude: -2.4412, longitude: 37.9890 },
        ]);
      }
    } catch {
      setApiaries([
        { id: "primary-apiary", name: "Kibwezi Main Apiary", latitude: -2.4251, longitude: 37.9742 },
        { id: "north-apiary", name: "Mbuinzau Hill Apiary", latitude: -2.4412, longitude: 37.9890 },
      ]);
    }
  }, []);

  // 1. Fetch data from backend with multi-level fallback
  const loadData = useCallback(async () => {
    setLoading(true);
    let loaded: ForageZone[] = [];

    // Attempt Backend API
    try {
      const headers: Record<string, string> = {};
      if (user?.id) headers["x-user-id"] = user.id;
      if (deviceId) headers["x-device-id"] = deviceId;

      const res = await fetch("/api/v1/forage/zones", { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          loaded = data;
        }
      }
    } catch (e) {
      console.warn("Backend forage zones fetch notice:", e);
    }

    // Attempt Supabase fallback if backend empty
    if (loaded.length === 0) {
      try {
        let query = (supabase as any)
          .from("forage_zones")
          .select("*")
          .order("created_at", { ascending: false });

        if (user?.id) {
          query = query.eq("user_id", user.id);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          loaded = data;
        }
      } catch (err) {
        console.warn("Supabase forage zones fallback notice:", err);
      }
    }

    // LocalStorage fallback
    try {
      const raw = localStorage.getItem("beeyield_local_forage_zones_v1");
      if (raw) {
        const localItems: ForageZone[] = JSON.parse(raw);
        if (Array.isArray(localItems)) {
          const seen = new Set(loaded.map((z) => z.id));
          for (const it of localItems) {
            if (!seen.has(it.id)) {
              loaded.push(it);
              seen.add(it.id);
            }
          }
        }
      }
    } catch { void 0; }

    setZones(loaded);
    setLoading(false);
  }, [user?.id, deviceId]);

  useEffect(() => {
    void loadApiaries();
    void loadData();
  }, [loadApiaries, loadData]);

  // Set default apiary in draft
  useEffect(() => {
    if (!draft.apiary_id && apiaries.length > 0) {
      setDraft((prev) => ({
        ...prev,
        apiary_id: apiaries[0].id,
        latitude: apiaries[0].latitude ? String(apiaries[0].latitude) : prev.latitude,
        longitude: apiaries[0].longitude ? String(apiaries[0].longitude) : prev.longitude,
      }));
    }
  }, [apiaries, draft.apiary_id]);

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setDraft({
      apiary_id: apiaries[0]?.id || "",
      zone_name: "",
      flora_type: "Acacia tortilis (Umbrella Thorn)",
      season: "Current Bloom Peak",
      radius_km: 1.5,
      density_score: 0.75,
      latitude: apiaries[0]?.latitude ? String(apiaries[0].latitude) : "",
      longitude: apiaries[0]?.longitude ? String(apiaries[0].longitude) : "",
      notes: "",
    });
    setAiText("");
    setAiPrompt("");
  };

  const startEdit = (zone: ForageZone) => {
    setEditingId(zone.id);
    setDraft({
      apiary_id: zone.apiary_id || apiaries[0]?.id || "",
      zone_name: zone.zone_name || "",
      flora_type: zone.flora_type || "Acacia tortilis (Umbrella Thorn)",
      season: zone.season || "Current Bloom Peak",
      radius_km: zone.radius_km ?? 1.5,
      density_score: zone.density_score ?? 0.75,
      latitude: zone.latitude ? String(zone.latitude) : "",
      longitude: zone.longitude ? String(zone.longitude) : "",
      notes: zone.notes || "",
    });
    setAiText(zone.ai_insights || "");
    setShowForm(true);
  };

  // Run BeeGPT Advisor
  const runAiAdvisor = async (promptOverride?: string) => {
    const query = promptOverride || aiPrompt;
    if (!query.trim()) {
      toast.error("Please enter a question or select a prompt for BeeGPT");
      return;
    }
    setAiStreaming(true);
    setAiText("");

    const context = `Flora Species: ${draft.flora_type}
Flowering Season: ${draft.season}
Flight Radius: ${draft.radius_km} km (Area: ${(Math.PI * Math.pow(draft.radius_km, 2)).toFixed(1)} km²)
Floral Density Score: ${(draft.density_score * 100).toFixed(0)}%
Zone Notes: ${draft.notes || "None"}`;

    try {
      const prompt = `${query}\n\nApiary Forage Zone Parameters:\n${context}`;
      await streamBeeGpt(prompt, (token: string) => setAiText((prev) => prev + token));
    } catch (e: any) {
      toast.error("AI service notice", { description: e?.message || "Check network connection" });
    } finally {
      setAiStreaming(false);
    }
  };

  // Save Forage Zone (Create or Update)
  const handleSave = async () => {
    if (!draft.zone_name.trim()) {
      toast.error("Please enter a zone name");
      return;
    }
    if (!draft.flora_type.trim()) {
      toast.error("Please specify the flora species");
      return;
    }

    setSaving(true);
    const zoneId = editingId || crypto.randomUUID();
    const latNum = parseFloat(draft.latitude);
    const lngNum = parseFloat(draft.longitude);

    const currentRecord: ForageZone = {
      id: zoneId,
      user_id: user?.id,
      apiary_id: draft.apiary_id || null,
      zone_name: draft.zone_name.trim(),
      flora_type: draft.flora_type.trim(),
      season: draft.season,
      radius_km: draft.radius_km,
      density_score: draft.density_score,
      latitude: Number.isFinite(latNum) ? latNum : null,
      longitude: Number.isFinite(lngNum) ? lngNum : null,
      notes: draft.notes.trim() || null,
      ai_insights: aiText.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Backend API (FastAPI)
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/v1/forage/zones/${editingId}` : "/api/v1/forage/zones";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user?.id) headers["x-user-id"] = user.id;
      if (deviceId) headers["x-device-id"] = deviceId;

      await fetch(url, {
        method,
        headers,
        body: JSON.stringify(currentRecord),
      });
    } catch (err) {
      console.warn("Backend forage zone sync notice:", err);
    }

    // 2. Supabase DB Sync
    try {
      if (editingId) {
        await (supabase as any)
          .from("forage_zones")
          .update({
            apiary_id: currentRecord.apiary_id,
            zone_name: currentRecord.zone_name,
            flora_type: currentRecord.flora_type,
            season: currentRecord.season,
            radius_km: currentRecord.radius_km,
            density_score: currentRecord.density_score,
            latitude: currentRecord.latitude,
            longitude: currentRecord.longitude,
            notes: currentRecord.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);
      } else {
        const payload: any = {
          id: zoneId,
          apiary_id: currentRecord.apiary_id,
          zone_name: currentRecord.zone_name,
          flora_type: currentRecord.flora_type,
          season: currentRecord.season,
          radius_km: currentRecord.radius_km,
          density_score: currentRecord.density_score,
          latitude: currentRecord.latitude,
          longitude: currentRecord.longitude,
          notes: currentRecord.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (user?.id) payload.user_id = user.id;
        await (supabase as any).from("forage_zones").insert(payload);
      }
    } catch (e) {
      console.warn("Supabase forage zone sync notice:", e);
    }

    // 3. LocalStorage Sync
    try {
      const stored: ForageZone[] = JSON.parse(localStorage.getItem("beeyield_local_forage_zones_v1") || "[]");
      let nextLocal: ForageZone[];
      if (editingId) {
        nextLocal = stored.map((z) => (z.id === editingId ? currentRecord : z));
        if (!nextLocal.some((z) => z.id === editingId)) {
          nextLocal.unshift(currentRecord);
        }
      } else {
        nextLocal = [currentRecord, ...stored.filter((z) => z.id !== zoneId)];
      }
      localStorage.setItem("beeyield_local_forage_zones_v1", JSON.stringify(nextLocal));
    } catch { void 0; }

    // 4. Update UI
    if (editingId) {
      setZones((prev) => prev.map((z) => (z.id === editingId ? currentRecord : z)));
      toast.success("Forage zone updated successfully");
    } else {
      setZones((prev) => [currentRecord, ...prev]);
      toast.success("Forage zone created successfully");
    }

    setSaving(false);
    setShowForm(false);
    resetForm();
  };

  // Delete Forage Zone
  const handleDelete = async () => {
    if (!zoneToDelete) return;
    const targetId = zoneToDelete.id;

    // Optimistic UI update
    setZones((prev) => prev.filter((z) => z.id !== targetId));

    // 1. Backend API
    try {
      const headers: Record<string, string> = {};
      if (user?.id) headers["x-user-id"] = user.id;
      if (deviceId) headers["x-device-id"] = deviceId;
      await fetch(`/api/v1/forage/zones/${targetId}`, { method: "DELETE", headers });
    } catch (e) {
      console.warn("Backend delete notice:", e);
    }

    // 2. Supabase DB
    try {
      await (supabase as any).from("forage_zones").delete().eq("id", targetId);
    } catch (e) {
      console.warn("Supabase delete notice:", e);
    }

    // 3. LocalStorage
    try {
      const stored: ForageZone[] = JSON.parse(localStorage.getItem("beeyield_local_forage_zones_v1") || "[]");
      const next = stored.filter((z) => z.id !== targetId);
      localStorage.setItem("beeyield_local_forage_zones_v1", JSON.stringify(next));
    } catch { void 0; }

    toast.success("Forage zone deleted");
    setZoneToDelete(null);
  };

  // GPS geolocation helper
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    toast.info("Fetching GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDraft((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success("GPS location locked");
      },
      (err) => {
        toast.error("Failed to acquire GPS position", { description: err.message });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const copyApiaryCoords = () => {
    const selected = apiaries.find((a) => a.id === draft.apiary_id);
    if (selected && selected.latitude && selected.longitude) {
      setDraft((prev) => ({
        ...prev,
        latitude: String(selected.latitude),
        longitude: String(selected.longitude),
      }));
      toast.success("Apiary coordinates copied to zone");
    } else {
      toast.error("Selected apiary has no recorded coordinates");
    }
  };

  // PDF Export
  const exportZonePdf = (zone: ForageZone) => {
    const areaKm2 = (Math.PI * Math.pow(zone.radius_km || 1.5, 2)).toFixed(1);
    const areaAcres = (parseFloat(areaKm2) * 247.105).toFixed(0);
    const apiaryName = apiaries.find((a) => a.id === zone.apiary_id)?.name || "Primary Apiary";

    downloadReportPdf({
      kind: "forage_zone",
      title: `Forage Zone Report — ${zone.zone_name}`,
      subtitle: `${zone.flora_type} · ${apiaryName} · Effective Radius: ${zone.radius_km || 1.5} km`,
      badge: `${((zone.density_score || 0.5) * 100).toFixed(0)}% DENSITY`,
      fileName: `beeyield-forage-zone-${safeName(zone.zone_name)}.pdf`,
      sections: [
        {
          type: "kv",
          heading: "Floral Resources & Coverage",
          rows: [
            ["Zone Name", zone.zone_name],
            ["Flora Species", zone.flora_type],
            ["Flowering Season", zone.season || "Peak Bloom"],
            ["Flight Radius", `${zone.radius_km || 1.5} km`],
            ["Effective Forage Footprint", `${areaKm2} km² (~${areaAcres} acres)`],
            ["Bloom Density Score", `${((zone.density_score || 0.5) * 100).toFixed(0)}%`],
            ["Associated Apiary", apiaryName],
            ["Coordinates", zone.latitude && zone.longitude ? `${zone.latitude}, ${zone.longitude}` : "Not logged"],
            ["Registered On", zone.created_at ? new Date(zone.created_at).toLocaleDateString() : "Active"],
          ],
        },
        ...(zone.notes ? [{ type: "text" as const, heading: "Field Notes & Observations", body: zone.notes }] : []),
        ...(zone.ai_insights ? [{ type: "text" as const, heading: "BeeGPT Flora Intelligence", body: zone.ai_insights }] : []),
      ],
    });
  };

  // Computed metrics
  const stats = useMemo(() => {
    const total = zones.length;
    const highDensity = zones.filter((z) => (z.density_score ?? 0) >= 0.7).length;
    const totalRadius = zones.reduce((acc, z) => acc + (z.radius_km || 1.5), 0);
    const avgRadius = total > 0 ? (totalRadius / total).toFixed(1) : "0.0";
    const uniqueApiaries = new Set(zones.map((z) => z.apiary_id).filter(Boolean)).size;

    return { total, highDensity, avgRadius, uniqueApiaries };
  }, [zones]);

  // Filtered list
  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = z.zone_name.toLowerCase().includes(q);
        const matchesFlora = z.flora_type.toLowerCase().includes(q);
        const matchesNotes = (z.notes || "").toLowerCase().includes(q);
        if (!matchesName && !matchesFlora && !matchesNotes) return false;
      }

      if (speciesFilter !== "all") {
        if (!z.flora_type.toLowerCase().includes(speciesFilter.toLowerCase())) return false;
      }

      if (seasonFilter !== "all" && z.season !== seasonFilter) return false;

      if (densityFilter !== "all") {
        const score = z.density_score ?? 0.5;
        if (densityFilter === "high" && score < 0.7) return false;
        if (densityFilter === "medium" && (score < 0.4 || score >= 0.7)) return false;
        if (densityFilter === "low" && score >= 0.4) return false;
      }

      if (apiaryFilter !== "all" && z.apiary_id !== apiaryFilter) return false;

      return true;
    });
  }, [zones, searchQuery, speciesFilter, seasonFilter, densityFilter, apiaryFilter]);

  if (!isOpen) return null;

  const content = (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header matching InspectionsPage */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Flower2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              Forage Zones & Floral Resources
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {filteredZones.length} {filteredZones.length === 1 ? "zone" : "zones"}
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Map nectar corridors, floral phenology, and hive flight coverage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userEmail && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {userEmail}
            </span>
          )}

          <button
            onClick={() => void loadData()}
            disabled={loading}
            title="Refresh forage zones"
            className="p-2 rounded-lg border border-border/50 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Forage Zone</span>
          </button>

          {!embedded && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Prominent Add Forage Zone Banner (matching InspectionsPage) */}
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Flower2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Record New Forage Zone</div>
            <div className="text-xs text-emerald-200/80">
              Log flora species, bloom density, and flight radii to predict nectar flow and carrying capacity
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md active:scale-95 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          + Add Forage Zone
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Total Zones</span>
            <Flower2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Active forage zones</div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Prime / Surplus Flow</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.highDensity}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Bloom density ≥ 70%</div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Avg Flight Radius</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.avgRadius} <span className="text-sm font-normal text-muted-foreground">km</span></div>
          <div className="text-[11px] text-muted-foreground mt-0.5">~{(Math.PI * Math.pow(parseFloat(stats.avgRadius) || 1.5, 2)).toFixed(1)} km² per zone</div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Apiaries Covered</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.uniqueApiaries}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Connected apiary yards</div>
        </div>
      </div>

      {/* Expandable Add / Edit Form */}
      {showForm && (
        <div className="rounded-2xl border border-emerald-500/40 bg-card/90 backdrop-blur-md p-5 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Flower2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                {editingId ? "Edit Forage Zone" : "Log New Forage Zone"}
              </h2>
            </div>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* BeeGPT Field SOP Assistant */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>BeeGPT Floral & Forage Intelligence</span>
              </div>
              {aiStreaming && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Generating botanical advice...
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setAiPrompt(prompt);
                    void runAiAdvisor(prompt);
                  }}
                  className="px-2.5 py-1 rounded-full text-[11px] border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask BeeGPT about nectar flow, sugar concentrations, or carrying capacity..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void runAiAdvisor();
                  }
                }}
                className="flex-1 bg-background/80 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => void runAiAdvisor()}
                disabled={aiStreaming}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI
              </button>
            </div>

            {aiText && (
              <div className="mt-2 p-3 rounded-lg bg-background/90 border border-emerald-500/30 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/40 pb-1.5">
                  <span className="font-semibold text-emerald-400">Field Advice & Calculations</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft((prev) => ({
                        ...prev,
                        notes: prev.notes ? `${prev.notes}\n\n[BeeGPT Advice]:\n${aiText}` : `[BeeGPT Advice]:\n${aiText}`,
                      }));
                      toast.success("Advice copied into notes");
                    }}
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Insert into Notes
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto pr-1">
                  <MarkdownRenderer content={aiText} />
                </div>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Apiary */}
            <div className="space-y-1">
              <label className="font-medium text-foreground">Associated Apiary</label>
              <select
                value={draft.apiary_id}
                onChange={(e) => {
                  const val = e.target.value;
                  setDraft((prev) => ({ ...prev, apiary_id: val }));
                  const selected = apiaries.find((a) => a.id === val);
                  if (selected && selected.latitude && selected.longitude) {
                    setDraft((prev) => ({
                      ...prev,
                      latitude: String(selected.latitude),
                      longitude: String(selected.longitude),
                    }));
                  }
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Select Apiary --</option>
                {apiaries.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone Name */}
            <div className="space-y-1">
              <label className="font-medium text-foreground">Zone Identifier / Name *</label>
              <input
                type="text"
                placeholder="e.g. North Ridge Acacia Belt"
                value={draft.zone_name}
                onChange={(e) => setDraft((prev) => ({ ...prev, zone_name: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Flowering Season */}
            <div className="space-y-1">
              <label className="font-medium text-foreground">Flowering Season</label>
              <select
                value={draft.season}
                onChange={(e) => setDraft((prev) => ({ ...prev, season: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:border-emerald-500"
              >
                {SEASONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Flora Species */}
            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="font-medium text-foreground">Flora Species / Dominant Crop *</label>
                <span className="text-[11px] text-muted-foreground">Select preset or type custom</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Acacia tortilis (Umbrella Thorn)"
                value={draft.flora_type}
                onChange={(e) => setDraft((prev) => ({ ...prev, flora_type: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:border-emerald-500 mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {FLORA_PRESETS.slice(0, 6).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, flora_type: preset }))}
                    className={cn(
                      "px-2 py-0.5 rounded text-[11px] border transition-colors",
                      draft.flora_type === preset
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold"
                        : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {preset.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Flight Radius (km) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-medium text-foreground">Flight Radius (km)</label>
                <span className="text-emerald-400 font-semibold">{draft.radius_km} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={draft.radius_km}
                onChange={(e) => setDraft((prev) => ({ ...prev, radius_km: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0.5 km (Core)</span>
                <span>Area: {(Math.PI * Math.pow(draft.radius_km, 2)).toFixed(1)} km² (~{((Math.PI * Math.pow(draft.radius_km, 2)) * 247.1).toFixed(0)} ac)</span>
                <span>6.0 km (Max)</span>
              </div>
            </div>

            {/* Floral Density Score */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-medium text-foreground">Bloom Density Score</label>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded border", densityTone(draft.density_score).badge)}>
                  {(draft.density_score * 100).toFixed(0)}% · {densityTone(draft.density_score).label}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={draft.density_score}
                onChange={(e) => setDraft((prev) => ({ ...prev, density_score: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Sparse (10%)</span>
                <span>Moderate (50%)</span>
                <span>Surplus (100%)</span>
              </div>
            </div>

            {/* GPS Coordinates */}
            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="font-medium text-foreground">Center Coordinates (Latitude, Longitude)</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Compass className="w-3 h-3" />
                    Use Device GPS
                  </button>
                  <button
                    type="button"
                    onClick={copyApiaryCoords}
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Copy Apiary
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Latitude (e.g. -2.4251)"
                  value={draft.latitude}
                  onChange={(e) => setDraft((prev) => ({ ...prev, latitude: e.target.value }))}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Longitude (e.g. 37.9742)"
                  value={draft.longitude}
                  onChange={(e) => setDraft((prev) => ({ ...prev, longitude: e.target.value }))}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Field Notes */}
            <div className="space-y-1 md:col-span-3">
              <label className="font-medium text-foreground">Field Notes & Phenological Observations</label>
              <textarea
                rows={3}
                placeholder="Note blossom progression, nectar secretion, honey super additions, or nearby pesticide sprays..."
                value={draft.notes}
                onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{editingId ? "Update Forage Zone" : "Save Forage Zone"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Bar & Quick Filters */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by zone name, flora species, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card/60 pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {apiaries.length > 0 && (
            <select
              value={apiaryFilter}
              onChange={(e) => setApiaryFilter(e.target.value)}
              className="rounded-xl border border-border bg-card/60 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Apiaries ({apiaries.length})</option>
              {apiaries.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground text-[11px] font-medium mr-1">Flora:</span>
          {["all", "Acacia", "Citrus", "Mango", "Wildflower", "Coffee", "Macadamia"].map((sp) => (
            <button
              key={sp}
              onClick={() => setSpeciesFilter(sp)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] border transition-colors",
                speciesFilter === sp
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold"
                  : "bg-card/60 border-border/60 text-muted-foreground hover:border-emerald-500/40"
              )}
            >
              {sp === "all" ? "All Flora" : sp}
            </button>
          ))}

          <span className="text-muted-foreground text-[11px] font-medium ml-2 mr-1">Density:</span>
          {[
            { id: "all", label: "All" },
            { id: "high", label: "High (≥70%)" },
            { id: "medium", label: "Medium (40-69%)" },
            { id: "low", label: "Low (<40%)" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDensityFilter(d.id)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] border transition-colors",
                densityFilter === d.id
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold"
                  : "bg-card/60 border-border/60 text-muted-foreground hover:border-emerald-500/40"
              )}
            >
              {d.label}
            </button>
          ))}

          <span className="text-muted-foreground text-[11px] font-medium ml-2 mr-1">Season:</span>
          {["all", "Current Bloom Peak", "Wet Season Flow (Apr - Jun)", "Dry Season Dearth Forage"].map((s) => (
            <button
              key={s}
              onClick={() => setSeasonFilter(s)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] border transition-colors",
                seasonFilter === s
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold"
                  : "bg-card/60 border-border/60 text-muted-foreground hover:border-emerald-500/40"
              )}
            >
              {s === "all" ? "All Seasons" : s.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Forage Zones Cards List */}
      {filteredZones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center space-y-3 bg-card/30">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <Flower2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-base font-semibold text-foreground">
              {searchQuery || speciesFilter !== "all" || densityFilter !== "all"
                ? "No matching forage zones found"
                : "No forage zones registered yet"}
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Map floral resources around your apiaries to calculate flight ranges, predict nectar influx, and schedule super placement.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Forage Zone</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredZones.map((zone) => {
            const apiary = apiaries.find((a) => a.id === zone.apiary_id);
            const radius = zone.radius_km || 1.5;
            const areaKm2 = (Math.PI * Math.pow(radius, 2)).toFixed(1);
            const density = densityTone(zone.density_score);
            const isAiExpanded = !!expandedZoneAi[zone.id];

            return (
              <div
                key={zone.id}
                className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-4 space-y-3 hover:border-emerald-500/40 transition-all shadow-sm"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{zone.zone_name}</span>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", density.badge)}>
                        {((zone.density_score ?? 0.5) * 100).toFixed(0)}% Density · {density.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                      <Trees className="w-3.5 h-3.5 shrink-0" />
                      <span>{zone.flora_type}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => exportZonePdf(zone)}
                      title="Download PDF report"
                      className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => startEdit(zone)}
                      title="Edit forage zone"
                      className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-emerald-400 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoneToDelete(zone)}
                      title="Delete forage zone"
                      className="p-1.5 rounded-lg border border-border hover:border-rose-500/40 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Density Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Floral Abundance Meter</span>
                    <span className="font-medium text-foreground">{((zone.density_score ?? 0.5) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", density.bar)}
                      style={{ width: `${Math.min(100, Math.max(5, (zone.density_score ?? 0.5) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Details Badges */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground border border-border/40">
                    <Activity className="w-3 h-3 text-amber-400" />
                    {radius} km radius (~{areaKm2} km²)
                  </span>

                  {zone.season && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground border border-border/40">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      {zone.season}
                    </span>
                  )}

                  {apiary && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground border border-border/40">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {apiary.name}
                    </span>
                  )}
                </div>

                {/* Coordinates & Map Link */}
                {zone.latitude && zone.longitude && (
                  <div className="flex items-center justify-between text-[11px] bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40 text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono">
                      <Compass className="w-3 h-3 text-emerald-400" />
                      {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${zone.latitude},${zone.longitude}`);
                          toast.success("Coordinates copied");
                        }}
                        className="hover:text-foreground flex items-center gap-0.5"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${zone.latitude}&mlon=${zone.longitude}#map=15/${zone.latitude}/${zone.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Map
                      </a>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {zone.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/20 p-2 rounded-lg border border-border/30">
                    {zone.notes}
                  </p>
                )}

                {/* BeeGPT Advice Drawer */}
                {zone.ai_insights && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-2.5 text-xs space-y-1.5">
                    <button
                      onClick={() => setExpandedZoneAi((prev) => ({ ...prev, [zone.id]: !prev[zone.id] }))}
                      className="w-full flex items-center justify-between text-emerald-400 font-semibold text-[11px]"
                    >
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        BeeGPT Flora Intelligence
                      </span>
                      {isAiExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {isAiExpanded && (
                      <div className="pt-1.5 border-t border-emerald-500/20 text-muted-foreground max-h-36 overflow-y-auto pr-1">
                        <MarkdownRenderer content={zone.ai_insights} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {zoneToDelete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">Delete Forage Zone?</h3>
              <p className="text-xs text-muted-foreground">
                Are you sure you want to delete <span className="font-semibold text-foreground">"{zoneToDelete.zone_name}"</span>?
                This will remove its boundary records and flight radius calculations.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setZoneToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDelete()}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md active:scale-95"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="min-h-full flex items-start justify-center">
        <div className="w-full max-w-7xl bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {content}
        </div>
      </div>
    </div>
  );
}
