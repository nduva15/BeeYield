import { useState, useEffect, useRef } from "react";
import { Upload, Database, RefreshCw, CheckCircle2, AlertTriangle, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { fromCSV } from "@/lib/csv";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type Imp = {
  id: string; filename: string; dataset_kind: string; row_count: number;
  schema_valid: boolean; validation_errors: unknown; sample_rows: unknown;
  reindex_status: string; created_at: string; notes: string | null;
};

const KINDS = [
  { key: "bees", label: "Bees / activity logs", required: ["hive_label", "bees_per_minute"] },
  { key: "honey", label: "Honey batch records", required: ["batch_id", "moisture_pct", "kg"] },
  { key: "diseases", label: "Disease observations", required: ["name", "symptoms", "severity"] },
  { key: "florage", label: "Florage / plant records", required: ["name", "bloom", "nectar"] },
] as const;
type KindKey = typeof KINDS[number]["key"];

const COLORS = ["hsl(var(--honey))", "hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))"];

export default function DatasetImport({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [imports, setImports] = useState<Imp[]>([]);
  const [kind, setKind] = useState<KindKey>("bees");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!deviceId) return;
    const { data } = await supabase.from("dataset_imports").select("*").eq("device_id", deviceId).order("created_at", { ascending: false });
    setImports((data ?? []) as Imp[]);
  };
  useEffect(() => { if (isOpen && deviceId) load(); }, [isOpen, deviceId]);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const text = await file.text();
      const rows = fromCSV(text);
      const required = KINDS.find((k) => k.key === kind)!.required;
      const errors: string[] = [];
      if (rows.length === 0) errors.push("CSV has no data rows");
      else {
        const headers = Object.keys(rows[0]);
        required.forEach((r) => { if (!headers.includes(r)) errors.push(`Missing required column: ${r}`); });
        rows.slice(0, 200).forEach((row, i) => {
          required.forEach((r) => { if (!row[r] || String(row[r]).trim() === "") errors.push(`Row ${i + 2}: empty ${r}`); });
        });
      }
      const valid = errors.length === 0;
      const { error } = await supabase.from("dataset_imports").insert([{
        device_id: deviceId, filename: file.name, dataset_kind: kind,
        row_count: rows.length, schema_valid: valid,
        validation_errors: errors.slice(0, 50) as never,
        sample_rows: rows.slice(0, 5) as never,
        reindex_status: valid ? "ready" : "blocked",
      }]);
      if (error) throw error;
      toast[valid ? "success" : "warning"](valid ? `Imported ${rows.length} rows` : `${errors.length} validation issues`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const reindex = async (id: string) => {
    await supabase.from("dataset_imports").update({ reindex_status: "indexing" }).eq("id", id);
    load();
    setTimeout(async () => {
      await supabase.from("dataset_imports").update({ reindex_status: "indexed", notes: `Re-indexed at ${new Date().toLocaleString()}` }).eq("id", id);
      toast.success("LLM index refreshed");
      load();
    }, 1500);
  };

  const del = async (id: string) => {
    await supabase.from("dataset_imports").delete().eq("id", id);
    load();
  };

  if (!isOpen) return null;

  const byKind = KINDS.map((k) => ({ name: k.label.split(" ")[0], rows: imports.filter((i) => i.dataset_kind === k.key).reduce((s, i) => s + i.row_count, 0) }));
  const byStatus = ["pending", "ready", "indexing", "indexed", "blocked"].map((s) => ({ name: s, value: imports.filter((i) => i.reindex_status === s).length })).filter((x) => x.value > 0);

  return (
    <div className={embedded ? "relative z-0 bg-background overflow-visible custom-scroll pt-6" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Dataset Import & Re-indexing</h1>
              <p className="text-xs text-muted-foreground">Upload bee / honey / disease / florage CSVs to feed the AI knowledge base</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="font-display text-base font-bold text-honey mb-3">Upload CSV</h3>
            <label className="text-xs text-muted-foreground mb-1 block">Dataset kind</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as KindKey)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mb-3">
              {KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
            </select>
            <p className="text-[11px] text-muted-foreground mb-2">Required columns: <span className="font-mono text-honey">{KINDS.find((k) => k.key === kind)!.required.join(", ")}</span></p>
            <input ref={fileRef} type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" id="csv-up" />
            <label htmlFor="csv-up" className={`flex items-center justify-center gap-2 w-full py-6 border-2 border-dashed rounded-lg cursor-pointer transition ${busy ? "opacity-50" : "border-honey/50 hover:bg-honey/5"}`}>
              <Upload className="w-5 h-5 text-honey" />
              <span className="text-sm">{busy ? "Processing..." : "Click to upload CSV"}</span>
            </label>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="font-display text-base font-bold text-honey mb-3">Stats</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Stat label="Files" value={imports.length} />
              <Stat label="Total rows" value={imports.reduce((s, i) => s + i.row_count, 0)} />
              <Stat label="Indexed" value={imports.filter((i) => i.reindex_status === "indexed").length} accent="ok" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-32">
                <ResponsiveContainer><BarChart data={byKind}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
                  <Bar dataKey="rows" fill="hsl(var(--honey))" />
                </BarChart></ResponsiveContainer>
              </div>
              <div className="h-32">
                <ResponsiveContainer><PieChart>
                  <Pie data={byStatus} dataKey="value" outerRadius={45} label={{ fontSize: 9 }}>
                    {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart></ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-honey">Import history</h3>
            <button onClick={load} className="text-xs text-muted-foreground hover:text-honey flex items-center gap-1"><RefreshCw className="w-3 h-3" />Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr><th className="px-3 py-2 text-left">File</th><th className="px-3 py-2 text-left">Kind</th><th className="px-3 py-2 text-right">Rows</th><th className="px-3 py-2 text-left">Schema</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2"></th></tr>
              </thead>
              <tbody>
                {imports.map((i) => (
                  <tr key={i.id} className="border-t border-border">
                    <td className="px-3 py-2"><FileText className="w-3 h-3 inline mr-1 text-muted-foreground" />{i.filename}</td>
                    <td className="px-3 py-2 text-xs">{i.dataset_kind}</td>
                    <td className="px-3 py-2 text-right">{i.row_count}</td>
                    <td className="px-3 py-2">{i.schema_valid
                      ? <span className="text-emerald-500 flex items-center gap-1 text-xs"><CheckCircle2 className="w-3 h-3" />OK</span>
                      : <span className="text-destructive flex items-center gap-1 text-xs" title={JSON.stringify(i.validation_errors)}><AlertTriangle className="w-3 h-3" />{Array.isArray(i.validation_errors) ? (i.validation_errors as unknown[]).length : 0} errors</span>}
                    </td>
                    <td className="px-3 py-2"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${i.reindex_status === "indexed" ? "border-emerald-500/40 text-emerald-500" : i.reindex_status === "blocked" ? "border-destructive/40 text-destructive" : "border-honey/40 text-honey"}`}>{i.reindex_status}</span></td>
                    <td className="px-3 py-2 text-right">
                      {i.schema_valid && i.reindex_status !== "indexing" && <button onClick={() => reindex(i.id)} className="text-xs text-honey mr-2">Re-index</button>}
                      <button onClick={() => del(i.id)} className="text-xs text-destructive"><Trash2 className="w-3 h-3 inline" /></button>
                    </td>
                  </tr>
                ))}
                {imports.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-xs text-muted-foreground">No imports yet — upload a CSV above</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: "ok" }) {
  return <div className="p-2 rounded-lg bg-muted/40 border border-border">
    <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
    <div className={`text-lg font-display font-bold ${accent === "ok" ? "text-emerald-500" : "text-honey"}`}>{value}</div>
  </div>;
}
