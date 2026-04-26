import { useState, useEffect, useCallback } from "react";
import { X, Search, Plus, Trash2, MapPin, Leaf, Droplets, Sun, Wind, Calendar, Sparkles, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldCard, BeeYieldBadge } from "../BeeYieldUI";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "./MarkdownRenderer";

type FlorageEntry = {
  id: string;
  source_name: string;
  region: string;
  lat: number | null;
  lng: number | null;
  bloom_start: string | null;
  bloom_end: string | null;
  nectar_score: number;
  pollen_score: number;
  notes: string | null;
  ai_evaluation: string | null;
  created_at: string;
};

export default function FloragePage({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const [entries, setEntries] = useState<FlorageEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [draft, setDraft] = useState<Partial<FlorageEntry>>({
    source_name: "",
    region: "East Africa",
    nectar_score: 80,
    pollen_score: 70,
    bloom_start: new Date().toISOString().split('T')[0],
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("florage_inventory").select("*").eq("device_id", deviceId).order("created_at", { ascending: false });
    if (data) setEntries(data as FlorageEntry[]);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const saveEntry = async () => {
    if (!draft.source_name) { toast.error("Name required"); return; }
    const { error } = await supabase.from("florage_inventory").insert({ ...draft, device_id: deviceId });
    if (error) { toast.error(error.message); return; }
    toast.success("Florage saved");
    setShowNew(false); setDraft({ source_name: "", region: "East Africa", nectar_score: 80, pollen_score: 70 }); load();
  };

  const deleteEntry = async (id: string) => {
    await supabase.from("florage_inventory").delete().eq("id", id);
    load();
  };

  const runAI = async (entry: FlorageEntry) => {
    setAiLoading(true);
    try {
      const prompt = `As Beeyield AI, evaluate the apicultural value of **${entry.source_name}** in **${entry.region}**. Nectar: ${entry.nectar_score}, Pollen: ${entry.pollen_score}. Provide bloom duration, honey characteristics, and hive management tips.`;
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beegpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      if (!resp.ok) throw new Error("AI failed");
      const result = await resp.json();
      const text = result.choices?.[0]?.message?.content || "No evaluation found.";
      await supabase.from("florage_inventory").update({ ai_evaluation: text }).eq("id", entry.id);
      load();
    } catch { toast.error("AI error"); }
    finally { setAiLoading(false); }
  };

  const filtered = entries.filter(e => e.source_name.toLowerCase().includes(search.toLowerCase()) || e.region.toLowerCase().includes(search.toLowerCase()));

  if (!isOpen) return null;

  const content = (
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={Leaf}
        label="Ecosystem"
        title="Florage Inventory"
        subtitle="Cataloging local nectar sources and botanical foraging maps."
        onBack={onClose}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sources..." className="pl-9 pr-4 py-2 rounded-xl border border-border bg-white text-xs font-bold outline-none focus:border-honey/40 w-48 transition-all" />
            </div>
            <button onClick={() => setShowNew(true)} className="px-3 py-1.5 rounded-xl bg-honey text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-md">
              <Plus className="w-3.5 h-3.5" /> Log Source
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-12">
            {showNew && (
                <BeeYieldCard className="mb-8 border-2 border-honey/20 bg-honey/5 animate-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Source Name</label>
                            <input value={draft.source_name} onChange={(e) => setDraft({...draft, source_name: e.target.value})} className={inputCls} placeholder="e.g. Acacia mellifera" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Region</label>
                            <input value={draft.region} onChange={(e) => setDraft({...draft, region: e.target.value})} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nectar (0-100)</label>
                            <input type="number" value={draft.nectar_score} onChange={(e) => setDraft({...draft, nectar_score: +e.target.value})} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pollen (0-100)</label>
                            <input type="number" value={draft.pollen_score} onChange={(e) => setDraft({...draft, pollen_score: +e.target.value})} className={inputCls} />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={saveEntry} className="px-6 py-3 rounded-2xl bg-honey text-white text-[11px] font-black uppercase tracking-widest flex-1 shadow-md hover:opacity-90 transition-all">Catalog Source</button>
                        <button onClick={() => setShowNew(false)} className="px-6 py-3 rounded-2xl bg-white text-muted-foreground text-[11px] font-black uppercase tracking-widest border border-border hover:bg-muted transition-all">Cancel</button>
                    </div>
                </BeeYieldCard>
            )}
        </div>

        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((e) => (
                <BeeYieldCard key={e.id} className="p-6 border-border/50 bg-white hover:border-honey/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Leaf className="w-20 h-20" />
                    </div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <h4 className="text-base font-black text-foreground uppercase tracking-tight">{e.source_name}</h4>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                                <MapPin className="w-3 h-3 text-honey" /> {e.region}
                            </div>
                        </div>
                        <button onClick={() => deleteEntry(e.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center -mt-2 -mr-2">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-widest px-0.5">
                                <span className="flex items-center gap-1"><Droplets className="w-2.5 h-2.5 text-blue-500" /> Nectar</span>
                                <span>{e.nectar_score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-blue-500/10 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${e.nectar_score}%` }} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-widest px-0.5">
                                <span className="flex items-center gap-1"><Sun className="w-2.5 h-2.5 text-honey" /> Pollen</span>
                                <span>{e.pollen_score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-honey/10 rounded-full overflow-hidden">
                                <div className="h-full bg-honey rounded-full" style={{ width: `${e.pollen_score}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        {e.ai_evaluation ? (
                            <div className="p-4 rounded-xl border border-honey/20 bg-honey/5 max-h-48 overflow-y-auto custom-scroll">
                                <div className="text-[9px] font-black text-honey uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> Expert Evaluation
                                </div>
                                <div className="prose prose-xs prose-p:text-[10px] prose-p:leading-relaxed prose-p:text-foreground/80 lowercase">
                                    <MarkdownRenderer content={e.ai_evaluation} />
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => runAI(e)} disabled={aiLoading} className="w-full py-2.5 rounded-xl border border-honey/20 bg-honey/5 text-honey text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-honey/10 transition-all disabled:opacity-50">
                                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Review Botanicals
                            </button>
                        )}
                    </div>
                </BeeYieldCard>
            ))}
            {filtered.length === 0 && !loading && (
                <div className="col-span-full py-24 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Leaf className="w-8 h-8 text-muted-foreground opacity-20" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No botanical records found</p>
                </div>
            )}
        </div>
      </div>
    </BeeYieldPageShell>
  );

  if (embedded) return content;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity p-4", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <div className={cn("bg-white rounded-[2.5rem] w-full h-[90vh] max-w-7xl shadow-2xl relative transition-all transform overflow-hidden", isOpen ? "scale-100" : "scale-95")}>
        <button onClick={onClose} className="absolute top-10 right-10 p-2 rounded-full hover:bg-muted transition-colors z-50 text-muted-foreground hover:text-foreground">
          <X className="w-6 h-6" />
        </button>
        <div className="h-full overflow-y-auto custom-scroll p-10">
          {content}
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-white border border-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-honey/40 transition-all shadow-sm";
