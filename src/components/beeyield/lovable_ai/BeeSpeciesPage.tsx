import { useEffect, useMemo, useState, useCallback } from "react";
import { X, Search, Bug, Plus, Pencil, Trash2, Save, Upload, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { toast } from "sonner";
import { toCSV, fromCSV, downloadCSV } from "@/lib/csv";

type Species = {
  id: string; device_id: string; name: string; scientific: string; category: string;
  description: string | null; habitat: string | null; traits: string[];
  image_url: string | null; notes: string | null; is_default: boolean;
};

const EMPTY: Omit<Species, "id" | "is_default"> = {
  device_id: "", name: "", scientific: "", category: "Other",
  description: "", habitat: "", traits: [], image_url: "", notes: "",
};

const CATS = ["Honey Bee", "Bumblebee", "Solitary", "Stingless", "Other"];

export default function BeeSpeciesPage({ isOpen, onClose, embedded }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [rows, setRows] = useState<Species[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [editing, setEditing] = useState<Species | null>(null);
  const [draft, setDraft] = useState<typeof EMPTY>(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bee_species")
      .select("*")
      .or(`device_id.eq.global,device_id.eq.${deviceId}`)
      .order("name");
    if (error) toast.error(error.message);
    setRows((data as Species[]) || []);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => { if (isOpen || embedded) load(); }, [isOpen, embedded, load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const c = cat === "All" || r.category === cat;
      const s = !q || r.name.toLowerCase().includes(q) || r.scientific.toLowerCase().includes(q) ||
        (r.habitat || "").toLowerCase().includes(q) || r.traits.some((t) => t.toLowerCase().includes(q));
      return c && s;
    });
  }, [rows, search, cat]);

  const startNew = () => { setEditing(null); setDraft(EMPTY); setShowForm(true); };
  const startEdit = (r: Species) => {
    setEditing(r);
    setDraft({ device_id: r.device_id, name: r.name, scientific: r.scientific, category: r.category,
      description: r.description || "", habitat: r.habitat || "", traits: r.traits,
      image_url: r.image_url || "", notes: r.notes || "" });
    setShowForm(true);
  };

  const save = async () => {
    if (!draft.name || !draft.scientific) { toast.error("Name and scientific name required"); return; }
    const payload = { ...draft, device_id: deviceId, traits: draft.traits.filter(Boolean) };
    if (editing) {
      const { error } = await supabase.from("bee_species").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("bee_species").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Added");
    }
    setShowForm(false); setEditing(null); load();
  };

  const remove = async (r: Species) => {
    if (r.is_default && r.device_id === "global") { toast.error("Default rows can't be deleted (clone & edit)"); return; }
    if (!confirm(`Delete "${r.name}"?`)) return;
    const { error } = await supabase.from("bee_species").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const exportCSV = () => {
    const csv = toCSV(filtered.map((r) => ({
      name: r.name, scientific: r.scientific, category: r.category,
      description: r.description, habitat: r.habitat, traits: r.traits, image_url: r.image_url, notes: r.notes,
    })));
    downloadCSV(`bee-species-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast.success(`Exported ${filtered.length} rows`);
  };

  const importCSV = async (file: File) => {
    const text = await file.text();
    const parsed = fromCSV(text);
    const valid = parsed.filter((p) => p.name && p.scientific);
    if (valid.length === 0) { toast.error("No valid rows (need name + scientific)"); return; }
    const payload = valid.map((p) => ({
      device_id: deviceId,
      name: p.name, scientific: p.scientific,
      category: p.category || "Other",
      description: p.description || null, habitat: p.habitat || null,
      traits: (p.traits || "").split("|").map((t) => t.trim()).filter(Boolean),
      image_url: p.image_url || null, notes: p.notes || null,
    }));
    const { error } = await supabase.from("bee_species").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(`Imported ${payload.length} species`); load();
  };

  if (!isOpen && !embedded) return null;

  const containerClasses = embedded 
    ? "relative w-full h-full" 
    : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll";
  
  const contentClasses = embedded 
    ? "w-full" 
    : "max-w-6xl mx-auto p-6";

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {!embedded && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bug className="w-6 h-6 text-honey" />
              <div>
                <h1 className="font-display text-2xl font-bold text-honey">Bee Species (Editable)</h1>
                <p className="text-xs text-muted-foreground">{rows.length} entries · CRUD + CSV import/export · per-device + global defaults</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exportCSV} className="px-3 py-2 rounded-lg border border-border text-xs flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Export CSV</button>
              <label className="px-3 py-2 rounded-lg border border-border text-xs flex items-center gap-1.5 cursor-pointer"><Upload className="w-3.5 h-3.5" />Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importCSV(e.target.files[0])} />
              </label>
              <button onClick={startNew} className="px-3 py-2 rounded-lg bg-honey text-honey-foreground text-xs font-semibold flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />New species</button>
              <button onClick={onClose} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, scientific, habitat, trait..." className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["All", ...CATS].map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`text-xs px-3 py-1.5 rounded-full border transition ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>{c}</button>
            ))}
          </div>
        </div>

        {showForm && (
          <div className="mb-4 p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
            <h3 className="font-semibold text-sm">{editing ? "Edit" : "New"} species</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Field label="Common name *"><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inp} /></Field>
              <Field label="Scientific *"><input value={draft.scientific} onChange={(e) => setDraft({ ...draft, scientific: e.target.value })} className={inp} /></Field>
              <Field label="Category"><select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={inp}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Habitat"><input value={draft.habitat || ""} onChange={(e) => setDraft({ ...draft, habitat: e.target.value })} className={inp} /></Field>
              <Field label="Image URL"><input value={draft.image_url || ""} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} className={inp} /></Field>
              <Field label="Traits (pipe `|` separated)"><input value={draft.traits.join("|")} onChange={(e) => setDraft({ ...draft, traits: e.target.value.split("|").map((t) => t.trim()) })} className={inp} /></Field>
            </div>
            <Field label="Description"><textarea value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={`${inp} min-h-[60px]`} /></Field>
            <Field label="Notes (private)"><textarea value={draft.notes || ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className={`${inp} min-h-[40px]`} /></Field>
            <div className="flex gap-2 pt-1">
              <button onClick={save} className="px-3 py-2 rounded-lg bg-honey text-honey-foreground text-xs font-semibold flex items-center gap-1.5"><Save className="w-3.5 h-3.5" />Save</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-3 py-2 rounded-lg border border-border text-xs">Cancel</button>
            </div>
          </div>
        )}

        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-honey" /></div> :
        filtered.length === 0 ? <div className="text-center py-8 text-sm text-muted-foreground">No species match.</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((r) => (
              <div key={r.id} className="p-3 rounded-xl border border-border bg-card flex gap-3">
                {r.image_url && <img src={r.image_url} alt={r.name} className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0" loading="lazy" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">{r.name} {r.is_default && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">DEFAULT</span>}</h4>
                      <p className="text-xs italic text-primary truncate">{r.scientific}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(r)} className="p-1.5 rounded hover:bg-muted" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(r)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{r.category} · {r.habitat}</p>
                  {r.description && <p className="text-xs text-foreground/80 mt-1 line-clamp-2">{r.description}</p>}
                  {r.traits.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{r.traits.slice(0, 4).map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-honey/10 text-honey border border-honey/20">{t}</span>)}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground">
          <b>CSV format:</b> name, scientific, category, description, habitat, traits, image_url, notes — traits use pipe `|` separator.
        </div>
      </div>
    </div>
  );
}

const inp = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs text-muted-foreground mb-1 block">{label}</label>{children}</div>;
}
