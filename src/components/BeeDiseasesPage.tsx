import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useMemo, useState, useCallback } from "react";
import { X, Quote, Search, AlertTriangle, Plus, Pencil, Trash2, Save, Upload, Download, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Moderate: "bg-amber-50 text-amber-800 border-amber-200",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
  const [deleteRecord, setDeleteRecord] = useState<Disease | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("bee_diseases").select("*")
      .or(`device_id.eq.global,device_id.eq.${deviceId}`).order("severity").order("name");
    if (error) toast.error(error.message);
    setRows((data as Disease[]) || []);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => { if (isOpen || embedded) load(); }, [isOpen, embedded, load]);

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

  const confirmAsync = (msg: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(typeof window !== "undefined" ? window.confirm(msg) : true);
      }, 25);
    });
  };

  const remove = async (r: Disease) => {
    if (r.is_default && r.device_id === "global") { toast.error("Default rows can't be deleted"); return; }
    if (!await confirmAsync(`Delete "${r.name}"?`)) return;
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
    toast.success(`Imported ${payload.length} diseases`);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteRecord) return;
    const { error } = await supabase.from("bee_diseases").delete().eq("id", deleteRecord.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Disease record deleted");
      load();
    }
    setDeleteRecord(null);
  };

  if (!isOpen && !embedded) return null;

  const content = (
    <div className="w-full space-y-4 text-stone-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900">Bee Diseases (Editable)</h2>
            <p className="text-xs text-stone-500">{rows.length} diseases · CRUD + CSV · per-device + global defaults</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportCSV} className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 text-xs flex items-center gap-1.5 hover:bg-stone-50 transition-colors shadow-xs"><Download className="w-3.5 h-3.5 text-stone-500" />Export</button>
          <label className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 text-xs flex items-center gap-1.5 cursor-pointer hover:bg-stone-50 transition-colors shadow-xs"><Upload className="w-3.5 h-3.5 text-stone-500" />Import
            <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importCSV(e.target.files[0])} />
          </label>
          <button onClick={startNew} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all border border-emerald-500/40"><Plus className="w-4 h-4 text-white stroke-[2.5]" /><span className="text-white">New Disease</span></button>
          {!embedded && (
            <button onClick={onClose} className="w-9 h-9 rounded-lg border border-stone-200 bg-white text-stone-500 flex items-center justify-center hover:bg-stone-100 hover:text-stone-800 transition-colors"><X className="w-4 h-4" /></button>
          )}
        </div>
      </div>

      {/* Executive Quote • Timothy Nduva */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start sm:items-center gap-3">
        <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-xs sm:text-sm font-medium text-stone-800 italic">
          “Bees are guardians of biodiversity, invisible partners in agriculture, and lifelines for human survival.”
          <span className="ml-2 font-bold text-emerald-700 not-italic text-[11px] sm:text-xs tracking-wide">
            — Timothy Nduva, Founder & CEO
          </span>
        </p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search diseases, pathogens, symptoms..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 items-center text-xs">
          <span className="text-stone-500 font-medium">Type:</span>
          {["All", ...TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-2.5 py-0.5 rounded-full border text-xs font-medium transition-all ${
                type === t
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center text-xs">
          <span className="text-stone-500 font-medium">Severity:</span>
          {["All", ...SEVERITIES].map((s) => (
            <button
              key={s}
              onClick={() => setSev(s)}
              className={`px-2.5 py-0.5 rounded-full border text-xs font-medium transition-all ${
                sev === s
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="mb-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3 shadow-xs">
          <h3 className="font-semibold text-sm text-stone-900">{editing ? "Edit" : "New"} disease</h3>
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
            <button onClick={save} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all border border-emerald-500/40"><Save className="w-4 h-4 text-white" /><span className="text-white">Save Disease</span></button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 text-xs">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div> :
      filtered.length === 0 ? <div className="text-center py-8 text-sm text-stone-500">No diseases match.</div> : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const isExp = expanded === r.id;
            return (
              <div key={r.id} className="border border-stone-200/90 rounded-xl overflow-hidden bg-white shadow-xs hover:border-stone-300 transition-all">
                <div className="px-4 py-3 flex items-center justify-between gap-2 hover:bg-stone-50/60 transition-colors">
                  <button onClick={() => setExpanded(isExp ? null : r.id)} className="flex-1 flex items-center gap-3 text-left">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${SEV_COLOR[r.severity] || "border-stone-200 bg-stone-50 text-stone-700"}`}>{r.severity}</span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-stone-900 truncate flex items-center gap-1.5">
                        {r.name}
                        {r.is_default && <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-500 font-bold uppercase tracking-wider">DEFAULT</span>}
                      </h4>
                      <p className="text-xs text-stone-500 truncate">{r.pathogen} · {r.type}</p>
                    </div>
                    {isExp ? <ChevronUp className="w-4 h-4 text-stone-400 ml-auto" /> : <ChevronDown className="w-4 h-4 text-stone-400 ml-auto" />}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(r)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteRecord(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {isExp && (
                  <div className="px-4 pb-4 border-t border-stone-100 bg-stone-50/50 pt-3 space-y-2 text-xs">
                    {r.symptoms.length > 0 && <div><b className="text-stone-800">Symptoms:</b> <span className="text-stone-600">{r.symptoms.join(" · ")}</span></div>}
                    {r.treatments.length > 0 && <div><b className="text-stone-800">Treatments:</b> <span className="text-stone-600">{r.treatments.join(" · ")}</span></div>}
                    {r.prevention && <div><b className="text-stone-800">Prevention:</b> <span className="text-stone-600">{r.prevention}</span></div>}
                    {r.affected_castes && <div><b className="text-stone-800">Affects:</b> <span className="text-stone-600">{r.affected_castes}</span></div>}
                    {r.notes && <div><b className="text-stone-800">Notes:</b> <span className="text-stone-600">{r.notes}</span></div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-600">
        <b className="text-stone-800">CSV format:</b> name, pathogen, type, severity, symptoms, treatments, prevention, affected_castes, notes — symptoms/treatments use pipe `|` separator.
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div className="w-full max-w-full space-y-4 p-4 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-sm text-stone-900">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-stone-200/90 rounded-2xl w-full max-w-6xl shadow-2xl p-4 sm:p-6 overflow-y-auto max-h-[90vh] my-auto text-stone-900">
        {content}
      </div>
      <AlertDialog open={!!deleteRecord} onOpenChange={(open) => !open && setDeleteRecord(null)}>
        <AlertDialogContent className="rounded-2xl border border-stone-200 bg-white text-stone-900 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-stone-900">Delete Disease Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-stone-600">
              Are you sure you want to remove the record for "{deleteRecord?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-stone-200 bg-white text-stone-700 hover:bg-stone-50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const inp = "w-full bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xs";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs font-medium text-stone-600 mb-1 block">{label}</label>{children}</div>;
}
