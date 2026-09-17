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

export interface BeeSpeciesPageProps {
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
}

export default function BeeSpeciesPage({ isOpen = true, onClose, embedded = false }: BeeSpeciesPageProps) {
  const deviceId = useDeviceId();
  const [rows, setRows] = useState<Species[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [editing, setEditing] = useState<Species | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    const { data, error } = await supabase.from("bee_species").select("*").order("name");
    if (error) toast.error(error.message);
    else setRows((data ?? []) as Species[]);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => {
    if ((isOpen || embedded) && deviceId) void load();
  }, [isOpen, embedded, deviceId, load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const mc = cat === "All" || r.category === cat;
      const ms = !q || r.name.toLowerCase().includes(q) || r.scientific.toLowerCase().includes(q) ||
        (r.habitat ?? "").toLowerCase().includes(q) || (r.traits ?? []).some((t) => t.toLowerCase().includes(q));
      return mc && ms;
    });
  }, [rows, search, cat]);

  const startNew = () => {
    setEditing({ ...EMPTY, id: "temp", is_default: false, device_id: deviceId });
    setIsNew(true);
  };

  const saveEdit = async () => {
    if (!editing || !editing.name.trim() || !editing.scientific.trim()) {
      return toast.error("Name and scientific name are required");
    }
    setSaving(true);
    const payload = {
      name: editing.name.trim(), scientific: editing.scientific.trim(), category: editing.category,
      description: editing.description?.trim() || null, habitat: editing.habitat?.trim() || null,
      traits: editing.traits || [], image_url: editing.image_url?.trim() || null, notes: editing.notes?.trim() || null,
    };
    if (isNew) {
      const { error } = await supabase.from("bee_species").insert({ ...payload, device_id: deviceId, is_default: false });
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("Species added");
    } else {
      const { error } = await supabase.from("bee_species").update(payload).eq("id", editing.id);
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("Species updated");
    }
    setEditing(null); setIsNew(false); load();
  };

  const del = async (s: Species) => {
    if (!confirm(`Delete ${s.name}?`)) return;
    const { error } = await supabase.from("bee_species").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const exportCSV = () => {
    const data = rows.map((r) => ({
      name: r.name, scientific: r.scientific, category: r.category,
      description: r.description || "", habitat: r.habitat || "",
      traits: (r.traits || []).join("|"), image_url: r.image_url || "", notes: r.notes || "",
    }));
    downloadCSV(`bee-species-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(data));
  };

  const importCSV = async (file: File) => {
    const parsed = fromCSV<Record<string, string>>(await file.text());
    if (parsed.length === 0) return toast.error("Empty CSV");
    const payload = parsed.map((p) => ({
      device_id: deviceId, is_default: false,
      name: p.name || "Unnamed", scientific: p.scientific || "Spec.", category: p.category || "Other",
      description: p.description || null, habitat: p.habitat || null,
      traits: (p.traits || "").split("|").map((t) => t.trim()).filter(Boolean),
      image_url: p.image_url || null, notes: p.notes || null,
    }));
    const { error } = await supabase.from("bee_species").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(`Imported ${payload.length} species`); load();
  };

  if (!isOpen && !embedded) return null;

  const content = (
    <div className="w-full max-w-full space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center text-honey flex-shrink-0">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Bee Species <span className="text-honey">(Editable)</span>
            </h1>
            <p className="text-xs text-muted-foreground">{rows.length} entries · CRUD + CSV import/export · per-device + global defaults</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <button onClick={exportCSV} className="px-3.5 py-2 rounded-xl border border-border text-xs flex items-center gap-1.5 hover:bg-muted transition-all">
            <Download className="w-3.5 h-3.5" />Export CSV
          </button>
          <label className="px-3.5 py-2 rounded-xl border border-border text-xs flex items-center gap-1.5 cursor-pointer hover:bg-muted transition-all">
            <Upload className="w-3.5 h-3.5" />Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importCSV(e.target.files[0])} />
          </label>
          <button onClick={startNew} className="px-3.5 py-2 rounded-xl bg-honey text-honey-foreground text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
            <Plus className="w-3.5 h-3.5" />New species
          </button>
          {!embedded && onClose && (
            <button onClick={onClose} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, scientific, habitat, trait..." className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-border/70 bg-background" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {["All", ...CATS].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${cat === c ? "bg-honey text-honey-foreground" : "border border-border text-muted-foreground hover:bg-muted"}`}>{c}</button>
          ))}
        </div>
      </div>

      {editing && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-foreground">{isNew ? "New Species" : `Edit ${editing.name}`}</h3>
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Common name"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inp} /></Field>
            <Field label="Scientific name"><input value={editing.scientific} onChange={(e) => setEditing({ ...editing, scientific: e.target.value })} className={inp} /></Field>
            <Field label="Category">
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={inp}>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Habitat"><input value={editing.habitat || ""} onChange={(e) => setEditing({ ...editing, habitat: e.target.value })} className={inp} /></Field>
            <Field label="Image URL"><input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className={inp} /></Field>
            <Field label="Traits (comma-separated)">
              <input value={(editing.traits || []).join(", ")} onChange={(e) => setEditing({ ...editing, traits: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} className={inp} />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Description">
                <textarea rows={2} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inp} />
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg border border-border text-xs">Cancel</button>
            <button onClick={saveEdit} disabled={saving} className="px-4 py-1.5 rounded-lg bg-honey text-honey-foreground text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">No species match.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl border border-border/70 bg-card/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-display font-bold text-sm text-foreground">{r.name}</h4>
                    <p className="text-xs italic text-muted-foreground">{r.scientific}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditing(r); setIsNew(false); }} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                    {!r.is_default && <button onClick={() => del(r)} className="p-1 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>}
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

      <div className="mt-4 p-3 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
        <b>CSV format:</b> name, scientific, category, description, habitat, traits, image_url, notes — traits use pipe `|` separator.
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-background text-foreground border border-border rounded-2xl w-full max-w-6xl shadow-2xl p-4 sm:p-6 my-auto max-h-[92vh] overflow-y-auto custom-scroll">
        {content}
      </div>
    </div>
  );
}

const inp = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs text-muted-foreground mb-1 block">{label}</label>{children}</div>;
}
