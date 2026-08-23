import { useState, useEffect, useCallback, useMemo } from "react";
import { Layers, ArrowLeftRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { toast } from "sonner";

type Run = { id: string; crop: string; region: string; acres: number; hives: number; created_at: string };
type Version = {
  id: string;
  run_id: string;
  version_label: string;
  created_at: string;
  ai_forecast: string | null;
  local_estimate_kg: number | null;
  site_layout: { field?: { lat: number; lng: number }[]; hives?: { lat: number; lng: number }[]; crop?: string } | null;
  moa_filters: Record<string, unknown> | null;
  prompt_variant: string;
};

export default function MOACompare({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<string>("");
  const [versions, setVersions] = useState<Version[]>([]);
  const [vA, setVA] = useState<string>("");
  const [vB, setVB] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const loadRuns = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("harvest_runs").select("id,crop,region,acres,hives,created_at")
      .eq("device_id", deviceId).order("created_at", { ascending: false }).limit(50);
    setRuns((data as Run[]) || []);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => { if (isOpen) loadRuns(); }, [isOpen, loadRuns]);

  const loadVersions = useCallback(async (runId: string) => {
    const { data } = await supabase.from("harvest_run_versions").select("*").eq("run_id", runId).order("created_at", { ascending: true });
    const vs = (data as Version[]) || [];
    setVersions(vs);
    if (vs.length >= 2) { setVA(vs[0].id); setVB(vs[vs.length - 1].id); }
    else if (vs.length === 1) { setVA(vs[0].id); setVB(vs[0].id); }
    else { setVA(""); setVB(""); }
  }, []);

  useEffect(() => { if (selectedRun) loadVersions(selectedRun); }, [selectedRun, loadVersions]);

  const a = versions.find((v) => v.id === vA) || null;
  const b = versions.find((v) => v.id === vB) || null;

  const diff = useMemo(() => {
    if (!a || !b) return null;
    const aHives = a.site_layout?.hives?.length || 0;
    const bHives = b.site_layout?.hives?.length || 0;
    const aField = a.site_layout?.field?.length || 0;
    const bField = b.site_layout?.field?.length || 0;
    const aKg = Number(a.local_estimate_kg || 0);
    const bKg = Number(b.local_estimate_kg || 0);
    const aFilters = a.moa_filters || {};
    const bFilters = b.moa_filters || {};
    const filterKeys = Array.from(new Set([...Object.keys(aFilters), ...Object.keys(bFilters)]));
    const filterDiffs = filterKeys.filter((k) => JSON.stringify(aFilters[k]) !== JSON.stringify(bFilters[k]));
    return {
      hives: { a: aHives, b: bHives, delta: bHives - aHives },
      fieldVerts: { a: aField, b: bField, delta: bField - aField },
      kg: { a: aKg, b: bKg, delta: Math.round((bKg - aKg) * 10) / 10 },
      crop: { a: a.site_layout?.crop || "—", b: b.site_layout?.crop || "—" },
      promptVariant: { a: a.prompt_variant, b: b.prompt_variant },
      filterDiffs,
      aFilters, bFilters,
    };
  }, [a, b]);

  if (!isOpen) return null;
  return (
    <div className={embedded ? "relative z-0 bg-background overflow-visible custom-scroll pt-6" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">MOA Run Comparison</h1>
              <p className="text-xs text-muted-foreground">Overlay two saved version snapshots side-by-side and diff forecast, layout, and filters</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 p-4 rounded-xl border border-border bg-muted/30">
          <label className="text-xs">Saved run
            <select value={selectedRun} onChange={(e) => setSelectedRun(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm">
              <option value="">— choose —</option>
              {runs.map((r) => <option key={r.id} value={r.id}>{r.crop} · {r.region} · {r.acres} ac · {r.hives} hives ({new Date(r.created_at).toLocaleDateString()})</option>)}
            </select>
          </label>
          <label className="text-xs">Version A (baseline)
            <select value={vA} onChange={(e) => setVA(e.target.value)} disabled={!versions.length} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm disabled:opacity-50">
              {versions.map((v) => <option key={v.id} value={v.id}>{v.version_label} · {new Date(v.created_at).toLocaleDateString()}</option>)}
            </select>
          </label>
          <label className="text-xs">Version B (compare)
            <select value={vB} onChange={(e) => setVB(e.target.value)} disabled={!versions.length} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm disabled:opacity-50">
              {versions.map((v) => <option key={v.id} value={v.id}>{v.version_label} · {new Date(v.created_at).toLocaleDateString()}</option>)}
            </select>
          </label>
        </div>

        {loading && <div className="text-center text-xs text-muted-foreground py-12"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>}
        {!loading && !selectedRun && (
          <div className="p-12 text-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            <Layers className="w-8 h-8 mx-auto mb-3 opacity-40" />
            Pick a saved run above to compare its versions.
          </div>
        )}
        {!loading && selectedRun && versions.length < 2 && (
          <div className="p-12 text-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            This run has {versions.length} saved version{versions.length === 1 ? "" : "s"}. Save another version from Hive Placement Map to enable comparison.
          </div>
        )}

        {diff && a && b && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <VersionPanel side="A" v={a} />
              <VersionPanel side="B" v={b} />
            </div>

            <div className="p-4 rounded-xl border border-honey/30 bg-honey/5 mb-4">
              <h3 className="text-xs uppercase text-honey font-semibold mb-3">Differences</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <DiffStat label="Hives" a={diff.hives.a} b={diff.hives.b} delta={diff.hives.delta} suffix="" />
                <DiffStat label="Field vertices" a={diff.fieldVerts.a} b={diff.fieldVerts.b} delta={diff.fieldVerts.delta} suffix="" />
                <DiffStat label="Local estimate" a={diff.kg.a} b={diff.kg.b} delta={diff.kg.delta} suffix=" kg" />
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground">Crop</div>
                  <div className="text-sm">{diff.crop.a} → <b className="text-foreground">{diff.crop.b}</b></div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground">Prompt variant</div>
                  <div className="text-sm">{diff.promptVariant.a} → <b className="text-foreground">{diff.promptVariant.b}</b></div>
                </div>
              </div>

              {diff.filterDiffs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-honey/20">
                  <div className="text-[10px] uppercase text-muted-foreground mb-2">MOA filter changes ({diff.filterDiffs.length})</div>
                  <div className="space-y-1 text-xs font-mono">
                    {diff.filterDiffs.map((k) => (
                      <div key={k} className="grid grid-cols-3 gap-2">
                        <span className="text-honey">{k}</span>
                        <span className="text-muted-foreground">A: {JSON.stringify(diff.aFilters[k])}</span>
                        <span className="text-foreground">B: {JSON.stringify(diff.bFilters[k])}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card">
                <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Forecast — Version A ({a.version_label})</h4>
                <div className="text-sm whitespace-pre-wrap text-foreground/80 max-h-64 overflow-y-auto custom-scroll">{a.ai_forecast || <span className="text-muted-foreground italic">No forecast saved.</span>}</div>
              </div>
              <div className="p-4 rounded-xl border border-honey/30 bg-honey/5">
                <h4 className="text-xs uppercase text-honey font-semibold mb-2">Forecast — Version B ({b.version_label})</h4>
                <div className="text-sm whitespace-pre-wrap text-foreground/80 max-h-64 overflow-y-auto custom-scroll">{b.ai_forecast || <span className="text-muted-foreground italic">No forecast saved.</span>}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function VersionPanel({ side, v }: { side: "A" | "B"; v: Version }) {
  const hives = v.site_layout?.hives?.length || 0;
  const verts = v.site_layout?.field?.length || 0;
  return (
    <div className={`p-4 rounded-xl border ${side === "A" ? "border-border bg-card" : "border-honey/30 bg-honey/5"}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{side === "A" ? "Version A" : "Version B"}</h3>
        <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString()}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">{v.version_label}</div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded bg-muted/30"><div className="text-lg font-bold text-foreground">{hives}</div><div className="text-[10px] text-muted-foreground">hives</div></div>
        <div className="p-2 rounded bg-muted/30"><div className="text-lg font-bold text-foreground">{verts}</div><div className="text-[10px] text-muted-foreground">field verts</div></div>
        <div className="p-2 rounded bg-muted/30"><div className="text-lg font-bold text-honey">{v.local_estimate_kg ? Math.round(Number(v.local_estimate_kg)) : "—"}</div><div className="text-[10px] text-muted-foreground">kg est.</div></div>
      </div>
    </div>
  );
}

function DiffStat({ label, a, b, delta, suffix }: { label: string; a: number; b: number; delta: number; suffix: string }) {
  const color = delta > 0 ? "text-emerald-500" : delta < 0 ? "text-destructive" : "text-muted-foreground";
  const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
  return (
    <div>
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="text-sm">{a}{suffix} → <b className="text-foreground">{b}{suffix}</b> <span className={`ml-1 ${color}`}>{arrow} {delta > 0 ? "+" : ""}{delta}{suffix}</span></div>
    </div>
  );
}
