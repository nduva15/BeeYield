import { useState, useMemo } from "react";
import { X, Search, Target, Droplets, Sun, Wind, Info, Sparkles, Filter, ChevronRight, Activity, Zap } from "lucide-react";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldCard, BeeYieldBadge } from "../BeeYieldUI";
import { cn } from "@/lib/utils";

type CropData = {
  name: string;
  scientificName: string;
  category: string;
  pollinationDependency: number;
  recColoniesPerAcre: number;
  bloomWindow: string;
  nectarScore: number;
  pollenScore: number;
  keyPests: string[];
  bestHives: string;
  notes: string;
};

const DATABASE: CropData[] = [
  { name: "Almonds (California)", scientificName: "Prunus dulcis", category: "Nut", pollinationDependency: 100, recColoniesPerAcre: 2.5, bloomWindow: "Feb-Mar (21 days)", nectarScore: 70, pollenScore: 90, keyPests: ["Peach Twig Borer"], bestHives: "Apis mellifera (8+ frames)", notes: "Highly dependent on weather for flight during critical bloom cross-pollination." },
  { name: "Apples", scientificName: "Malus domestica", category: "Fruit", pollinationDependency: 90, recColoniesPerAcre: 1.5, bloomWindow: "Apr-May (14 days)", nectarScore: 50, pollenScore: 80, keyPests: ["Codling Moth"], bestHives: "Osmia (Mason bees) + Apis", notes: "Requires multiple varieties in field for cross-pollination success." },
  { name: "Avocado (Hass)", scientificName: "Persea americana", category: "Fruit", pollinationDependency: 80, recColoniesPerAcre: 2.0, bloomWindow: "Apr-June", nectarScore: 60, pollenScore: 40, keyPests: ["Thrips"], bestHives: "Apis mellifera", notes: "A/B flower type behavior; needs high hive density to overcome low nectar attractiveness." },
  { name: "Coffee (Arabica)", scientificName: "Coffea arabica", category: "Beverage", pollinationDependency: 25, recColoniesPerAcre: 1.2, bloomWindow: "Post-rain (short)", nectarScore: 85, pollenScore: 30, keyPests: ["Coffee Berry Borer"], bestHives: "Apis mellifera adansonii", notes: "Self-fertile but bees increase yield weight by 15-20% and uniformity." },
  { name: "Mango", scientificName: "Mangifera indica", category: "Fruit", pollinationDependency: 60, recColoniesPerAcre: 1.8, bloomWindow: "Late Dry Season", nectarScore: 40, pollenScore: 20, keyPests: ["Mealybugs", "Fruit Fly"], bestHives: "Wild stingless + Apis", notes: "Flies are major competitors/partners; bees prefer other sources if available." },
  { name: "Macadamia", scientificName: "Macadamia integrifolia", category: "Nut", pollinationDependency: 95, recColoniesPerAcre: 3.5, bloomWindow: "Aug-Oct", nectarScore: 85, pollenScore: 75, keyPests: ["Nut Borer"], bestHives: "Apis mellifera + Stingless", notes: "Very high dependency; yields drop significantly without managed hives." },
];

export default function PollinationLookup({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<CropData | null>(DATABASE[0]);

  const categories = ["All", ...Array.from(new Set(DATABASE.map(c => c.category)))];

  const filtered = useMemo(() => {
    return DATABASE.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.scientificName.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || c.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  if (!isOpen) return null;

  const content = (
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={Search}
        label="Repository"
        title="Botanical Lookup"
        subtitle="Global pollination dependency matrix and crop-specific management curves."
        onBack={onClose}
        actions={
          <div className="flex items-center gap-2">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-1.5 rounded-xl border border-border bg-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-honey/40 transition-all cursor-pointer">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-4 space-y-6">
            <BeeYieldSection title="Search Archives" icon={Filter}>
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search database..." className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-white text-sm font-bold outline-none focus:border-honey/40 shadow-sm transition-all" />
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scroll pr-2">
                    {filtered.map((c) => (
                        <button 
                            key={c.name}
                            onClick={() => setSelected(c)}
                            className={cn("w-full p-4 rounded-2xl border transition-all text-left group relative overflow-hidden", 
                                selected?.name === c.name ? "bg-honey border-honey text-white shadow-xl shadow-honey/20" : "bg-white border-border hover:border-honey/30 text-foreground"
                            )}
                        >
                            <div className="relative z-10">
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{c.category}</div>
                                <div className="text-sm font-black uppercase tracking-tight">{c.name}</div>
                                <div className={cn("text-[9px] font-bold italic mt-1", selected?.name === c.name ? "text-white/80" : "text-muted-foreground")}>{c.scientificName}</div>
                            </div>
                            <ChevronRight className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform", selected?.name === c.name ? "text-white translate-x-0" : "text-muted-foreground/30 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0")} />
                        </button>
                    ))}
                    {filtered.length === 0 && <p className="py-12 text-center text-xs text-muted-foreground italic">No biological matches identified.</p>}
                </div>
            </BeeYieldSection>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
            {selected ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BeeYieldCard className="p-8 border-honey/20 bg-honey/5 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-honey/10 text-honey flex items-center justify-center mb-4">
                                <Zap className="w-8 h-8 fill-current" />
                            </div>
                            <div className="text-[10px] font-black text-honey uppercase tracking-[0.2em] mb-2">Dependency Rating</div>
                            <div className="text-6xl font-black text-foreground tabular-nums">{selected.pollinationDependency}%</div>
                            <p className="text-[11px] text-muted-foreground font-bold mt-4 max-w-[200px]">Strict requirement for active pollination vectors to achieve baseline yield.</p>
                        </BeeYieldCard>

                        <BeeYieldSection title="Technical Profile" icon={Target}>
                            <div className="space-y-4">
                                <StatItem label="Recommended Load" value={`${selected.recColoniesPerAcre} colonies / acre`} />
                                <StatItem label="Optimal Bio-Unit" value={selected.bestHives} />
                                <StatItem label="Bloom Dynamics" value={selected.bloomWindow} />
                            </div>
                        </BeeYieldSection>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BeeYieldCard className="p-6 border-border/50 bg-muted/5">
                             <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Sun className="w-3.5 h-3.5" /> Forage Attraction</h4>
                             </div>
                             <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">
                                        <span>Nectar Resource</span>
                                        <span className="text-blue-500">{selected.nectarScore}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-blue-500/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selected.nectarScore}%` }} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">
                                        <span>Pollen Quality</span>
                                        <span className="text-honey">{selected.pollenScore}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-honey/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-honey rounded-full" style={{ width: `${selected.pollenScore}%` }} />
                                    </div>
                                </div>
                             </div>
                        </BeeYieldCard>

                        <BeeYieldCard className="p-6 border-border/50 bg-muted/5">
                             <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Entomological Threats</h4>
                             <div className="flex flex-wrap gap-2">
                                {selected.keyPests.map(p => (
                                    <BeeYieldBadge key={p} className="bg-red-50 text-red-500 border-red-100 text-[9px] font-black uppercase tracking-widest">{p}</BeeYieldBadge>
                                ))}
                             </div>
                             <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed font-bold italic">Application of pest controls must be timed outside of active foraging windows (post-sunset).</p>
                        </BeeYieldCard>
                    </div>

                    <BeeYieldCard className="p-8 border-border bg-white shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-honey/10 text-honey flex items-center justify-center">
                                <Info className="w-4 h-4" />
                            </div>
                            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Management Directives</h4>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed font-medium">{selected.notes}</p>
                    </BeeYieldCard>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-24 opacity-50 border-2 border-dashed border-border rounded-[2.5rem]">
                    <Search className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">Select a botanical Subject</p>
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

function StatItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col border-b border-border/40 pb-3 last:border-0 last:pb-0">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</span>
            <span className="text-sm font-black text-foreground uppercase tracking-tight">{value}</span>
        </div>
    );
}
