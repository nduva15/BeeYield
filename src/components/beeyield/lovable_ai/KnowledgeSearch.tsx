import { useState, useEffect, useMemo } from "react";
import { Search, BookOpen, ExternalLink, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from "recharts";

type Fact = {
  id: string; topic: string; category: string; fact: string; citation: string | null;
  source_url: string | null; confidence: number; tags: string[]; is_default: boolean; device_id: string;
};

const CATS = ["disease", "species", "florage", "honey", "behavior", "management", "crop", "general"];

export default function KnowledgeSearch({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [facts, setFacts] = useState<Fact[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Partial<Fact>>({ topic: "", category: "general", fact: "", citation: "", source_url: "", confidence: 0.85, tags: [] });

  const load = async () => {
    const { data } = await supabase.from("knowledge_facts").select("*").order("confidence", { ascending: false });
    setFacts((data ?? []) as Fact[]);
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isOpen) load(); }, [isOpen]);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase().trim();
    return facts.filter((f) => {
      if (cat && f.category !== cat) return false;
      if (!ql) return true;
      return f.topic.toLowerCase().includes(ql) || f.fact.toLowerCase().includes(ql) || f.tags.some((t) => t.toLowerCase().includes(ql)) || (f.citation ?? "").toLowerCase().includes(ql);
    });
  }, [facts, q, cat]);

  const addFact = async () => {
    if (!draft.topic || !draft.fact) return toast.error("Topic and fact required");
    const { error } = await supabase.from("knowledge_facts").insert([{ ...draft, device_id: deviceId, is_default: false } as never]);
    if (error) return toast.error(error.message);
    toast.success("Fact added"); setAdding(false);
    setDraft({ topic: "", category: "general", fact: "", citation: "", source_url: "", confidence: 0.85, tags: [] });
    load();
  };
  const del = async (id: string) => { await supabase.from("knowledge_facts").delete().eq("id", id); load(); };

  const byCat = CATS.map((c) => ({ name: c, count: facts.filter((f) => f.category === c).length })).filter((x) => x.count > 0);
  const confBuckets = [
    { name: "≥0.9", count: facts.filter((f) => f.confidence >= 0.9).length, fill: "hsl(var(--honey))" },
    { name: "0.8-0.9", count: facts.filter((f) => f.confidence >= 0.8 && f.confidence < 0.9).length, fill: "hsl(var(--primary))" },
    { name: "<0.8", count: facts.filter((f) => f.confidence < 0.8).length, fill: "hsl(var(--muted-foreground))" },
  ];

  if (!isOpen) return null;

  return (
    <div className={embedded ? "relative z-0 bg-background overflow-visible custom-scroll pt-6" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Bee Knowledge Base</h1>
              <p className="text-xs text-muted-foreground">Search facts, diseases, cures with citations & confidence</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2 p-4 rounded-xl border border-border bg-card">
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search facts, diseases, cures, tags..." className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm" />
              </div>
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 text-sm">
                <option value="">All</option>
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => setAdding(!adding)} className="px-3 py-2 rounded-lg border border-honey/40 text-honey text-xs flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
            </div>
            <div className="text-xs text-muted-foreground mb-2">{filtered.length} results</div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-display font-bold text-honey mb-2">Confidence distribution</h3>
            <div className="h-32"><ResponsiveContainer><RadialBarChart innerRadius="20%" outerRadius="100%" data={confBuckets} startAngle={180} endAngle={0}>
              <RadialBar background dataKey="count" />
              <Legend wrapperStyle={{ fontSize: 9 }} iconSize={8} />
            </RadialBarChart></ResponsiveContainer></div>
          </div>
        </div>

        {adding && (
          <div className="p-4 rounded-xl border border-honey/40 bg-honey/5 mb-4">
            <h3 className="text-sm font-display font-bold text-honey mb-2">New fact</h3>
            <div className="grid md:grid-cols-3 gap-2">
              <input placeholder="Topic" value={draft.topic ?? ""} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} className="bg-background border border-border rounded-lg px-3 py-2 text-sm" />
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="bg-background border border-border rounded-lg px-3 py-2 text-sm">{CATS.map((c) => <option key={c}>{c}</option>)}</select>
              <input type="number" step="0.05" min="0" max="1" placeholder="Confidence" value={draft.confidence ?? 0.85} onChange={(e) => setDraft({ ...draft, confidence: +e.target.value })} className="bg-background border border-border rounded-lg px-3 py-2 text-sm" />
              <textarea placeholder="Fact / explanation" value={draft.fact ?? ""} onChange={(e) => setDraft({ ...draft, fact: e.target.value })} className="md:col-span-3 bg-background border border-border rounded-lg px-3 py-2 text-sm" rows={2} />
              <input placeholder="Citation" value={draft.citation ?? ""} onChange={(e) => setDraft({ ...draft, citation: e.target.value })} className="bg-background border border-border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Source URL" value={draft.source_url ?? ""} onChange={(e) => setDraft({ ...draft, source_url: e.target.value })} className="bg-background border border-border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="tags (comma-separated)" value={(draft.tags ?? []).join(",")} onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <button onClick={addFact} className="mt-2 px-3 py-2 rounded-lg bg-honey text-honey-foreground text-xs flex items-center gap-1"><Save className="w-3 h-3" />Save fact</button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((f) => (
            <div key={f.id} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground mr-2">{f.category}</span>
                  <span className="font-display text-base font-bold text-honey">{f.topic}</span>
                </div>
                <ConfBadge value={f.confidence} />
              </div>
              <p className="text-sm text-foreground mb-2">{f.fact}</p>
              {f.citation && <p className="text-xs text-muted-foreground italic">— {f.citation}</p>}
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1 flex-wrap">{f.tags.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">#{t}</span>)}</div>
                <div className="flex gap-2 items-center">
                  {f.source_url && <a href={f.source_url} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1"><ExternalLink className="w-3 h-3" />source</a>}
                  {!f.is_default && <button onClick={() => del(f.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></button>}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="md:col-span-2 text-center text-xs text-muted-foreground p-8">No matches</div>}
        </div>

        <div className="mt-6 p-4 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-display font-bold text-honey mb-2">Facts per category</h3>
          <div className="h-48"><ResponsiveContainer><BarChart data={byCat}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
            <Bar dataKey="count" fill="hsl(var(--honey))" />
          </BarChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );
}

function ConfBadge({ value }: { value: number }) {
  const tone = value >= 0.9 ? "text-emerald-500 border-emerald-500/40" : value >= 0.8 ? "text-honey border-honey/40" : "text-muted-foreground border-border";
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tone}`}>conf {value.toFixed(2)}</span>;
}
