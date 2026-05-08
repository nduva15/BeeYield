import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, AlertTriangle, Plus, Pencil, Trash2, Save, Upload, Download, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { toast } from "sonner";
import { toCSV, fromCSV, downloadCSV } from "@/lib/csv";

type Disease = {
  id: string; device_id: string; name: string; pathogen: string; type: string; severity: string;
  symptoms: string[]; treatments: string[]; prevention: string | null;
  affected_castes: string | null; notes: string | null; is_default: boolean;
};

const TYPES = ["Parasitic", "Bacterial", "Viral", "Fungal", "Microsporidian", "Environmental", "Nutritional", "Genetic", "Predator", "Other"];
const SEVERITIES = ["Critical", "High", "Moderate", "Low"];
const SEV_COLOR: Record<string, string> = {
  Critical: "bg-destructive/15 text-destructive border-destructive/30",
  High: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  Moderate: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  Low: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
};

const EMPTY: Omit<Disease, "id" | "is_default"> = {
  device_id: "", name: "", pathogen: "", type: "Parasitic", severity: "Moderate",
  symptoms: [], treatments: [], prevention: "", affected_castes: "", notes: "",
};

export default function BeeDiseasesPage({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [rows, setRows] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [sev, setSev] = useState("All");
  const [editing, setEditing] = useState<Disease | null>(null);
  const [draft, setDraft] = useState<typeof EMPTY>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("bee_diseases").select("*")
      .or(`device_id.eq.global,device_id.eq.${deviceId}`).order("severity").order("name");
    if (error) toast.error(error.message);
    setRows((data as Disease[]) || []);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => { if (isOpen) load(); }, [isOpen, load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const t = type === "All" || r.type === type;
      const s = sev === "All" || r.severity === sev;
      const m = !q || r.name.toLowerCase().includes(q) || r.pathogen.toLowerCase().includes(q) ||
        r.symptoms.some((x) => x.toLowerCase().includes(q));
      return t && s && m;
    });
  }, [rows, search, type, sev]);

  const startNew = () => { setEditing(null); setDraft(EMPTY); setShowForm(true); };
  const startEdit = (r: Disease) => {
    setEditing(r);
    setDraft({ device_id: r.device_id, name: r.name, pathogen: r.pathogen, type: r.type, severity: r.severity,
      symptoms: r.symptoms, treatments: r.treatments, prevention: r.prevention || "",
      affected_castes: r.affected_castes || "", notes: r.notes || "" });
    setShowForm(true);
  };

  const save = async () => {
    if (!draft.name || !draft.pathogen) { toast.error("Name + pathogen required"); return; }
    const payload = { ...draft, device_id: deviceId,
      symptoms: draft.symptoms.filter(Boolean), treatments: draft.treatments.filter(Boolean) };
    if (editing) {
      const { error } = await supabase.from("bee_diseases").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("bee_diseases").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Added");
    }
    setShowForm(false); setEditing(null); load();
  };

  const remove = async (r: Disease) => {
    if (r.is_default && r.device_id === "global") { toast.error("Default rows can't be deleted"); return; }
    if (!confirm(`Delete "${r.name}"?`)) return;
    const { error } = await supabase.from("bee_diseases").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const exportCSV = () => {
    const csv = toCSV(filtered.map((r) => ({
      name: r.name, pathogen: r.pathogen, type: r.type, severity: r.severity,
      symptoms: r.symptoms, treatments: r.treatments, prevention: r.prevention,
      affected_castes: r.affected_castes, notes: r.notes,
    })));
    downloadCSV(`bee-diseases-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast.success(`Exported ${filtered.length}`);
  };

  const importCSV = async (file: File) => {
    const parsed = fromCSV(await file.text()).filter((p) => p.name && p.pathogen);
    if (!parsed.length) { toast.error("No valid rows"); return; }
    const payload = parsed.map((p) => ({
      device_id: deviceId,
      name: p.name, pathogen: p.pathogen, type: p.type || "Other", severity: p.severity || "Moderate",
      symptoms: (p.symptoms || "").split("|").map((s) => s.trim()).filter(Boolean),
      treatments: (p.treatments || "").split("|").map((s) => s.trim()).filter(Boolean),
      prevention: p.prevention || null, affected_castes: p.affected_castes || null, notes: p.notes || null,
    }));
    const { error } = await supabase.from("bee_diseases").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(`Imported ${payload.length} diseases`); load();
  };

  if (!isOpen) return null;
  return (
    <div className={embedded ? "relative z-0 bg-background overflow-visible custom-scroll pt-6" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Bee Diseases (Editable)</h1>
              <p className="text-xs text-muted-foreground">{rows.length} diseases · CRUD + CSV · per-device + global defaults</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="px-3 py-2 rounded-lg border border-border text-xs flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Export</button>
            <label className="px-3 py-2 rounded-lg border border-border text-xs flex items-center gap-1.5 cursor-pointer"><Upload className="w-3.5 h-3.5" />Import
              <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importCSV(e.target.files[0])} />
            </label>
            <button onClick={startNew} className="px-3 py-2 rounded-lg bg-honey text-honey-foreground text-xs font-semibold flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />New</button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search diseases, pathogens, symptoms..." className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background" />
          </div>
          <div className="flex flex-wrap gap-1.5 items-center text-xs">
            <span className="text-muted-foreground">Type:</span>
            {["All", ...TYPES].map((t) => (
              <button key={t} onClick={() => setType(t)} className={`px-2 py-0.5 rounded-full border ${type === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 items-center text-xs">
            <span className="text-muted-foreground">Severity:</span>
            {["All", ...SEVERITIES].map((s) => (
              <button key={s} onClick={() => setSev(s)} className={`px-2 py-0.5 rounded-full border ${sev === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>{s}</button>
            ))}
          </div>
        </div>

        {showForm && (
          <div className="mb-4 p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
            <h3 className="font-semibold text-sm">{editing ? "Edit" : "New"} disease</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Field label="Name *"><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inp} /></Field>
              <Field label="Pathogen *"><input value={draft.pathogen} onChange={(e) => setDraft({ ...draft, pathogen: e.target.value })} className={inp} /></Field>
              <Field label="Type"><select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className={inp}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="Severity"><select value={draft.severity} onChange={(e) => setDraft({ ...draft, severity: e.target.value })} className={inp}>{SEVERITIES.map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label="Affected castes"><input value={draft.affected_castes || ""} onChange={(e) => setDraft({ ...draft, affected_castes: e.target.value })} className={inp} /></Field>
              <Field label="Prevention"><input value={draft.prevention || ""} onChange={(e) => setDraft({ ...draft, prevention: e.target.value })} className={inp} /></Field>
            </div>
            <Field label="Symptoms (pipe `|` separated)"><textarea value={draft.symptoms.join("|")} onChange={(e) => setDraft({ ...draft, symptoms: e.target.value.split("|").map((s) => s.trim()) })} className={`${inp} min-h-[50px]`} /></Field>
            <Field label="Treatments (pipe `|` separated)"><textarea value={draft.treatments.join("|")} onChange={(e) => setDraft({ ...draft, treatments: e.target.value.split("|").map((s) => s.trim()) })} className={`${inp} min-h-[50px]`} /></Field>
            <Field label="Notes"><textarea value={draft.notes || ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className={`${inp} min-h-[40px]`} /></Field>
            <div className="flex gap-2 pt-1">
              <button onClick={save} className="px-3 py-2 rounded-lg bg-honey text-honey-foreground text-xs font-semibold flex items-center gap-1.5"><Save className="w-3.5 h-3.5" />Save</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-3 py-2 rounded-lg border border-border text-xs">Cancel</button>
            </div>
          </div>
        )}

        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-honey" /></div> :
        filtered.length === 0 ? <div className="text-center py-8 text-sm text-muted-foreground">No diseases match.</div> : (
          <div className="space-y-2">
            {filtered.map((r) => {
              const isExp = expanded === r.id;
              return (
                <div key={r.id} className="border border-border rounded-xl overflow-hidden bg-card">
                  <div className="px-4 py-3 flex items-center justify-between gap-2">
                    <button onClick={() => setExpanded(isExp ? null : r.id)} className="flex-1 flex items-center gap-3 text-left">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SEV_COLOR[r.severity] || "border-border"}`}>{r.severity}</span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">{r.name} {r.is_default && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">DEFAULT</span>}</h4>
                        <p className="text-xs text-muted-foreground truncate">{r.pathogen} · {r.type}</p>
                      </div>
                      {isExp ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" /> : <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />}
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(r)} className="p-1.5 rounded hover:bg-muted" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(r)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {isExp && (
                    <div className="px-4 pb-4 border-t border-border pt-3 space-y-2 text-xs">
                      {r.symptoms.length > 0 && <div><b className="text-foreground">Symptoms:</b> <span className="text-muted-foreground">{r.symptoms.join(" · ")}</span></div>}
                      {r.treatments.length > 0 && <div><b className="text-foreground">Treatments:</b> <span className="text-muted-foreground">{r.treatments.join(" · ")}</span></div>}
                      {r.prevention && <div><b className="text-foreground">Prevention:</b> <span className="text-muted-foreground">{r.prevention}</span></div>}
                      {r.affected_castes && <div><b className="text-foreground">Affects:</b> <span className="text-muted-foreground">{r.affected_castes}</span></div>}
                      {r.notes && <div><b className="text-foreground">Notes:</b> <span className="text-muted-foreground">{r.notes}</span></div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 p-3 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground">
          <b>CSV format:</b> name, pathogen, type, severity, symptoms, treatments, prevention, affected_castes, notes — symptoms/treatments use pipe `|` separator.
        </div>
      </div>
    </div>
  );
}

const inp = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs text-muted-foreground mb-1 block">{label}</label>{children}</div>;
}
