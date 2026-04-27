import { useState, useEffect, useCallback, useRef } from "react";
import { X, Sprout, Flower2, Plus, Pencil, Trash2, Upload, Download, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { toast } from "sonner";

// Default seed (40 expert melliferous plants). Inserted on first load per device.
const DEFAULT_FLORAGE = [
  { name: "Black Locust", latin: "Robinia pseudoacacia", bloom: "May–Jun", nectar: 10, pollen: 4, radius: 1500, notes: "Premium acacia honey; 10–14 day bloom; cold-sensitive" },
  { name: "Manuka", latin: "Leptospermum scoparium", bloom: "Nov–Feb (S.Hem)", nectar: 9, pollen: 5, radius: 1200, notes: "MGO-rich antibacterial honey; NZ/Aus" },
  { name: "Sidr (Christ's Thorn)", latin: "Ziziphus spina-christi", bloom: "Oct–Dec", nectar: 10, pollen: 6, radius: 1500, notes: "Premium arid-zone honey; Yemen/Saudi/Kenya" },
  { name: "Sunflower", latin: "Helianthus annuus", bloom: "Jul–Aug", nectar: 7, pollen: 9, radius: 1200, notes: "Fast crystallisation; high pollen load" },
  { name: "Almond", latin: "Prunus dulcis", bloom: "Feb", nectar: 5, pollen: 10, radius: 800, notes: "First-of-season pollen pulse; CA mass-bloom" },
  { name: "Apple", latin: "Malus domestica", bloom: "Apr–May", nectar: 6, pollen: 8, radius: 600, notes: "King-bloom sets 70%; orchard pollination" },
  { name: "Rapeseed/Canola", latin: "Brassica napus", bloom: "Apr–May", nectar: 9, pollen: 9, radius: 1500, notes: "Heavy crystalliser; major early-summer flow" },
  { name: "Heather (Ling)", latin: "Calluna vulgaris", bloom: "Aug–Sep", nectar: 8, pollen: 6, radius: 1500, notes: "Thixotropic gel-honey; UK moors" },
  { name: "Linden/Basswood", latin: "Tilia spp.", bloom: "Jun–Jul", nectar: 10, pollen: 5, radius: 1200, notes: "Single-tree can yield 10kg honey; menthol notes" },
  { name: "Eucalyptus", latin: "Eucalyptus spp.", bloom: "Year-round (varies)", nectar: 9, pollen: 7, radius: 2000, notes: "200+ species; reliable arid forage" },
  { name: "Clover (White)", latin: "Trifolium repens", bloom: "May–Sep", nectar: 9, pollen: 7, radius: 800, notes: "Workhorse pasture nectar source" },
  { name: "Buckwheat", latin: "Fagopyrum esculentum", bloom: "Jul–Sep", nectar: 8, pollen: 6, radius: 1000, notes: "Dark mineral-rich honey; AM-only nectar flow" },
  { name: "Borage", latin: "Borago officinalis", bloom: "Jun–Sep", nectar: 10, pollen: 7, radius: 800, notes: "Refills nectaries every 2 minutes!" },
  { name: "Phacelia", latin: "Phacelia tanacetifolia", bloom: "Jun–Sep", nectar: 9, pollen: 9, radius: 800, notes: "Top cover-crop for bee forage; purple-blue pollen" },
  { name: "Avocado (Hass)", latin: "Persea americana", bloom: "Mar–May", nectar: 7, pollen: 6, radius: 700, notes: "Dichogamous A/B flowering" },
  { name: "Coffee (Arabica)", latin: "Coffea arabica", bloom: "Sep–Oct (E.Africa)", nectar: 7, pollen: 6, radius: 600, notes: "7-day mass bloom after rain trigger" },
  { name: "Mango", latin: "Mangifera indica", bloom: "Mar (India), Aug (Kenya)", nectar: 6, pollen: 7, radius: 700, notes: "Heat-suppressed >32°C" },
  { name: "Macadamia", latin: "Macadamia integrifolia", bloom: "Aug–Sep", nectar: 7, pollen: 7, radius: 800, notes: "Long racemes need 4 hives/ha" },
  { name: "Blueberry (highbush)", latin: "Vaccinium corymbosum", bloom: "Apr–May", nectar: 6, pollen: 7, radius: 500, notes: "Buzz pollination; bumblebees superior" },
  { name: "Cucurbits (squash)", latin: "Cucurbita spp.", bloom: "Jun–Sep", nectar: 8, pollen: 8, radius: 700, notes: "Squash bees specialised; AM-only flowers" },
  { name: "Citrus (Orange)", latin: "Citrus sinensis", bloom: "Mar–May", nectar: 9, pollen: 7, radius: 1000, notes: "Aromatic premium honey; orange-blossom" },
  { name: "Lavender", latin: "Lavandula angustifolia", bloom: "Jun–Aug", nectar: 8, pollen: 5, radius: 600, notes: "Provence honey; aromatic terpenes" },
  { name: "Goldenrod", latin: "Solidago spp.", bloom: "Aug–Oct", nectar: 8, pollen: 7, radius: 1000, notes: "Critical autumn flow; smelly during ripening" },
  { name: "Aster (Michaelmas)", latin: "Symphyotrichum spp.", bloom: "Sep–Oct", nectar: 7, pollen: 6, radius: 700, notes: "Late-season pollen for winter bees" },
  { name: "Dandelion", latin: "Taraxacum officinale", bloom: "Mar–May", nectar: 6, pollen: 9, radius: 400, notes: "Critical first spring pollen pulse" },
  { name: "Willow (Goat)", latin: "Salix caprea", bloom: "Mar–Apr", nectar: 7, pollen: 10, radius: 800, notes: "Earliest pollen source in temperate zones" },
  { name: "Hawthorn", latin: "Crataegus monogyna", bloom: "May", nectar: 7, pollen: 6, radius: 800, notes: "Hedgerow staple; brief intense bloom" },
  { name: "Ivy", latin: "Hedera helix", bloom: "Sep–Nov", nectar: 8, pollen: 7, radius: 600, notes: "Last major nectar before winter; ivy bee specialist" },
  { name: "Bramble (Blackberry)", latin: "Rubus fruticosus", bloom: "Jun–Aug", nectar: 7, pollen: 6, radius: 700, notes: "Hedgerow workhorse; long bloom" },
  { name: "Lime/Linden Honeydew", latin: "Tilia + aphid", bloom: "Jun–Aug", nectar: 9, pollen: 0, radius: 1500, notes: "Aphid-mediated forest honeydew flow" },
  { name: "Sainfoin", latin: "Onobrychis viciifolia", bloom: "May–Jul", nectar: 9, pollen: 7, radius: 800, notes: "100kg/ha nectar potential; alpine pasture" },
  { name: "Alfalfa", latin: "Medicago sativa", bloom: "Jun–Sep", nectar: 8, pollen: 8, radius: 1000, notes: "Tripping-flower mechanism; leafcutter bees preferred" },
  { name: "Cotton", latin: "Gossypium hirsutum", bloom: "Jun–Sep", nectar: 7, pollen: 6, radius: 800, notes: "Extrafloral nectaries supplement floral flow" },
  { name: "Mesquite", latin: "Prosopis spp.", bloom: "Apr–Jul", nectar: 8, pollen: 7, radius: 1500, notes: "Premium desert honey; SW USA, Argentina" },
  { name: "Tupelo", latin: "Nyssa ogeche", bloom: "Apr–May", nectar: 10, pollen: 5, radius: 800, notes: "Non-crystallising honey; Florida swamps" },
  { name: "Star Thistle", latin: "Centaurea solstitialis", bloom: "Jul–Sep", nectar: 9, pollen: 6, radius: 1000, notes: "California summer dearth-breaker" },
  { name: "Pumpkin/Squash", latin: "Cucurbita pepo", bloom: "Jul–Sep", nectar: 7, pollen: 9, radius: 600, notes: "Large pollen grains; squash bees specialist" },
  { name: "Strawberry", latin: "Fragaria × ananassa", bloom: "Apr–Jun", nectar: 5, pollen: 6, radius: 400, notes: "Per-flower bee visits boost berry size 30%" },
  { name: "Raspberry", latin: "Rubus idaeus", bloom: "May–Jul", nectar: 8, pollen: 7, radius: 600, notes: "Long bloom; high-grade honey" },
  { name: "Vetch (Hairy)", latin: "Vicia villosa", bloom: "May–Jul", nectar: 8, pollen: 7, radius: 800, notes: "Nitrogen-fixing cover crop; bee magnet" },
];

export type FloragePlant = {
  id: string;
  name: string;
  latin: string;
  bloom: string;
  nectar: number;
  pollen: number;
  radius: number;
  notes: string | null;
  is_default: boolean;
};

const EMPTY_DRAFT: Omit<FloragePlant, "id" | "is_default"> = {
  name: "", latin: "", bloom: "", nectar: 5, pollen: 5, radius: 800, notes: "",
};

export default function FloragePage({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [plants, setPlants] = useState<FloragePlant[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<FloragePlant | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [showImport, setShowImport] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvPreview, setCsvPreview] = useState<typeof EMPTY_DRAFT[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("florage_plants")
      .select("*")
      .eq("device_id", deviceId)
      .order("is_default", { ascending: false })
      .order("name", { ascending: true });
    if (error) {
      toast.error("Failed to load florage");
      setLoading(false);
      return;
    }
    if (!data || data.length === 0) {
      // Seed defaults
      const seed = DEFAULT_FLORAGE.map((p) => ({ ...p, device_id: deviceId, is_default: true }));
      const { data: seeded } = await (supabase as any).from("florage_plants").insert(seed).select("*");
      setPlants(((seeded || []) as unknown as FloragePlant[]));
    } else {
      setPlants((data as unknown as FloragePlant[]));
    }
    setLoading(false);
  }, [deviceId]);

  useEffect(() => { if (isOpen) load(); }, [isOpen, load]);

  const startEdit = (p: FloragePlant) => {
    setEditing(p);
    setDraft({ name: p.name, latin: p.latin, bloom: p.bloom, nectar: p.nectar, pollen: p.pollen, radius: p.radius, notes: p.notes || "" });
  };

  const startNew = () => {
    setEditing({ id: "new" } as FloragePlant);
    setDraft(EMPTY_DRAFT);
  };

  const cancel = () => { setEditing(null); setDraft(EMPTY_DRAFT); };

  const save = async () => {
    if (!draft.name.trim() || !draft.latin.trim() || !draft.bloom.trim()) {
      toast.error("Name, Latin, and Bloom are required");
      return;
    }
    if (editing && editing.id !== "new") {
      const { error } = await (supabase as any).from("florage_plants").update({
        ...draft, notes: draft.notes || null, updated_at: new Date().toISOString(),
      }).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Updated");
    } else {
      const { error } = await (supabase as any).from("florage_plants").insert({
        ...draft, notes: draft.notes || null, device_id: deviceId, is_default: false,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Plant added");
    }
    cancel();
    load();
  };

  const remove = async (p: FloragePlant) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    const { error } = await (supabase as any).from("florage_plants").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  const exportCsv = () => {
    const header = "name,latin,bloom,nectar,pollen,radius,notes";
    const rows = plants.map((p) => [p.name, p.latin, p.bloom, p.nectar, p.pollen, p.radius, p.notes || ""]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "florage.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const parseCsv = (text: string) => {
    const errors: string[] = [];
    const rows: typeof EMPTY_DRAFT[] = [];
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) { setCsvErrors(["CSV needs a header row + at least 1 data row"]); setCsvPreview([]); return; }
    const header = lines[0].toLowerCase().split(",").map((s) => s.trim().replace(/"/g, ""));
    const required = ["name", "latin", "bloom", "nectar", "pollen", "radius"];
    const missing = required.filter((c) => !header.includes(c));
    if (missing.length) { setCsvErrors([`Missing columns: ${missing.join(", ")}`]); setCsvPreview([]); return; }
    const idx = (k: string) => header.indexOf(k);
    for (let i = 1; i < lines.length; i++) {
      const raw = lines[i];
      if (!raw.trim()) continue;
      // simple CSV parse (handles "quoted, fields")
      const cells: string[] = [];
      let cur = "", inQ = false;
      for (const ch of raw) {
        if (ch === '"') inQ = !inQ;
        else if (ch === "," && !inQ) { cells.push(cur); cur = ""; }
        else cur += ch;
      }
      cells.push(cur);
      const trimmed = cells.map((c) => c.trim().replace(/^"|"$/g, ""));
      const row = {
        name: trimmed[idx("name")] || "",
        latin: trimmed[idx("latin")] || "",
        bloom: trimmed[idx("bloom")] || "",
        nectar: Number(trimmed[idx("nectar")] || 0),
        pollen: Number(trimmed[idx("pollen")] || 0),
        radius: Number(trimmed[idx("radius")] || 0),
        notes: idx("notes") >= 0 ? trimmed[idx("notes")] : "",
      };
      if (!row.name || !row.latin || !row.bloom) errors.push(`Row ${i + 1}: missing required field`);
      if (row.nectar < 0 || row.nectar > 10) errors.push(`Row ${i + 1}: nectar must be 0–10`);
      if (row.pollen < 0 || row.pollen > 10) errors.push(`Row ${i + 1}: pollen must be 0–10`);
      if (row.radius < 0 || row.radius > 10000) errors.push(`Row ${i + 1}: radius must be 0–10000m`);
      rows.push(row);
    }
    setCsvErrors(errors);
    setCsvPreview(rows);
  };

  const importCsv = async () => {
    if (csvErrors.length || csvPreview.length === 0) { toast.error("Fix validation errors first"); return; }
    const payload = csvPreview.map((r) => ({ ...r, notes: r.notes || null, device_id: deviceId, is_default: false }));
    const { error } = await (supabase as any).from("florage_plants").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(`Imported ${payload.length} plants`);
    setCsvText(""); setCsvPreview([]); setCsvErrors([]); setShowImport(false);
    load();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { const t = String(reader.result || ""); setCsvText(t); parseCsv(t); };
    reader.readAsText(f);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sprout className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Florage Database</h1>
              <p className="text-xs text-muted-foreground">{plants.length} plants — full CRUD, CSV import/export</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={startNew} className="px-3 py-2 rounded-lg bg-honey text-honey-foreground text-xs font-semibold flex items-center gap-1.5 hover:opacity-90"><Plus className="w-3.5 h-3.5" />New plant</button>
            <button onClick={() => setShowImport((s) => !s)} className="px-3 py-2 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:border-honey/50"><Upload className="w-3.5 h-3.5" />Import CSV</button>
            <button onClick={exportCsv} className="px-3 py-2 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:border-honey/50"><Download className="w-3.5 h-3.5" />Export</button>
            <button onClick={onClose} className="w-9 h-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {showImport && (
          <div className="mb-6 p-4 rounded-xl border border-honey/30 bg-honey/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-honey text-sm">Bulk import from CSV</h3>
              <button onClick={() => setShowImport(false)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Required columns: <code className="text-honey">name, latin, bloom, nectar, pollen, radius</code>. Optional: <code className="text-honey">notes</code>. Scores 0–10, radius in metres.</p>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile} className="text-xs mb-2" />
            <textarea value={csvText} onChange={(e) => { setCsvText(e.target.value); parseCsv(e.target.value); }} placeholder="Paste CSV here…" rows={6} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs font-mono" />
            {csvErrors.length > 0 && (
              <div className="mt-2 p-2 rounded bg-destructive/10 text-destructive text-xs">
                {csvErrors.slice(0, 5).map((e, i) => <div key={i}>• {e}</div>)}
                {csvErrors.length > 5 && <div>…and {csvErrors.length - 5} more</div>}
              </div>
            )}
            {csvPreview.length > 0 && csvErrors.length === 0 && (
              <div className="mt-2 text-xs text-muted-foreground">✓ {csvPreview.length} rows ready to import</div>
            )}
            <button onClick={importCsv} disabled={csvErrors.length > 0 || csvPreview.length === 0} className="mt-3 px-3 py-2 rounded-lg bg-honey text-honey-foreground text-xs font-semibold disabled:opacity-40">Import {csvPreview.length} plants</button>
          </div>
        )}

        {editing && (
          <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary/5">
            <h3 className="font-semibold text-sm mb-3">{editing.id === "new" ? "New plant" : `Edit ${editing.name}`}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name" className="px-3 py-2 rounded-lg bg-background border border-border text-xs" />
              <input value={draft.latin} onChange={(e) => setDraft({ ...draft, latin: e.target.value })} placeholder="Latin" className="px-3 py-2 rounded-lg bg-background border border-border text-xs italic" />
              <input value={draft.bloom} onChange={(e) => setDraft({ ...draft, bloom: e.target.value })} placeholder="Bloom (e.g. Mar–May)" className="px-3 py-2 rounded-lg bg-background border border-border text-xs" />
              <input type="number" value={draft.radius} onChange={(e) => setDraft({ ...draft, radius: Number(e.target.value) })} placeholder="Radius (m)" className="px-3 py-2 rounded-lg bg-background border border-border text-xs" />
              <label className="text-xs flex items-center gap-2">Nectar <input type="number" min={0} max={10} value={draft.nectar} onChange={(e) => setDraft({ ...draft, nectar: Number(e.target.value) })} className="w-16 px-2 py-1 rounded bg-background border border-border" /></label>
              <label className="text-xs flex items-center gap-2">Pollen <input type="number" min={0} max={10} value={draft.pollen} onChange={(e) => setDraft({ ...draft, pollen: Number(e.target.value) })} className="w-16 px-2 py-1 rounded bg-background border border-border" /></label>
              <input value={draft.notes ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Notes" className="md:col-span-2 px-3 py-2 rounded-lg bg-background border border-border text-xs" />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={save} className="px-3 py-2 rounded-lg bg-honey text-honey-foreground text-xs font-semibold flex items-center gap-1.5"><Save className="w-3.5 h-3.5" />Save</button>
              <button onClick={cancel} className="px-3 py-2 rounded-lg border border-border text-xs">Cancel</button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Plant</th>
                  <th className="text-left p-3">Latin</th>
                  <th className="text-left p-3">Bloom</th>
                  <th className="text-center p-3">Nectar</th>
                  <th className="text-center p-3">Pollen</th>
                  <th className="text-right p-3">Radius (m)</th>
                  <th className="text-left p-3">Notes</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={8} className="p-6 text-center text-xs text-muted-foreground">Loading…</td></tr>}
                {!loading && plants.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-xs text-muted-foreground">No plants yet — click "New plant" or import a CSV.</td></tr>}
                {plants.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3 font-semibold text-foreground"><Flower2 className="w-3 h-3 inline mr-1 text-honey" />{p.name}{p.is_default && <span className="ml-1 text-[10px] text-muted-foreground">(seed)</span>}</td>
                    <td className="p-3 italic text-xs text-muted-foreground">{p.latin}</td>
                    <td className="p-3 text-xs">{p.bloom}</td>
                    <td className="p-3 text-center"><Score val={p.nectar} /></td>
                    <td className="p-3 text-center"><Score val={p.pollen} /></td>
                    <td className="p-3 text-right text-xs">{p.radius}</td>
                    <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">{p.notes}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button onClick={() => startEdit(p)} className="p-1.5 rounded hover:bg-muted" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(p)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl border border-honey/30 bg-honey/5 text-sm">
          <b className="text-honey">Linked tools:</b> Florage scores feed Pollination Planning (florage diversity multiplier), MOA View (florage radius overlay), and Activity Forecaster (expected bees/min × florage abundance).
        </div>
      </div>
    </div>
  );
}

function Score({ val }: { val: number }) {
  const filled = "★".repeat(Math.round(val / 2));
  const empty = "☆".repeat(5 - Math.round(val / 2));
  return <span className="text-honey text-xs">{filled}<span className="text-muted-foreground">{empty}</span></span>;
}

// Re-export for components that previously imported FLORAGE constant
export const FLORAGE = DEFAULT_FLORAGE;
