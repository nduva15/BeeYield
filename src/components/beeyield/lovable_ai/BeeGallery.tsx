import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Bug, Search, Image as ImageIcon } from "lucide-react";
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSection, BeeYieldBadge, BeeYieldCard } from "../BeeYieldUI";

// Image imports
import westernHoneyBee from "@/assets/bees/western-honey-bee.jpg";
import easternHoneyBee from "@/assets/bees/eastern-honey-bee.jpg";
import giantHoneyBee from "@/assets/bees/giant-honey-bee.jpg";
import dwarfHoneyBee from "@/assets/bees/dwarf-honey-bee.jpg";
import bumblebee from "@/assets/bees/bumblebee.jpg";
import masonBee from "@/assets/bees/mason-bee.jpg";
import leafcutterBee from "@/assets/bees/leafcutter-bee.jpg";
import carpenterBee from "@/assets/bees/carpenter-bee.jpg";
import stinglessBee from "@/assets/bees/stingless-bee.jpg";
import sweatBee from "@/assets/bees/sweat-bee.jpg";
import miningBee from "@/assets/bees/mining-bee.jpg";
import orchidBee from "@/assets/bees/orchid-bee.jpg";

interface BeeSpecies {
  name: string;
  scientific: string;
  description: string;
  habitat: string;
  image: string;
  traits: string[];
  category: string;
}

const BEE_SPECIES: BeeSpecies[] = [
  {
    name: "Western Honey Bee",
    scientific: "Apis mellifera",
    description: "The most widely managed bee species in the world, responsible for the majority of commercial honey production and crop pollination.",
    habitat: "Worldwide (managed colonies)",
    image: westernHoneyBee,
    traits: ["Social", "Honey producer", "Wax builder", "Waggle dance"],
    category: "Honey Bee",
  },
  {
    name: "Eastern Honey Bee",
    scientific: "Apis cerana",
    description: "Native to southern and southeastern Asia. More resistant to Varroa mites than its western counterpart due to co-evolution.",
    habitat: "South & Southeast Asia",
    image: easternHoneyBee,
    traits: ["Varroa resistant", "Smaller colonies", "Tropical adapted"],
    category: "Honey Bee",
  },
  {
    name: "Giant Honey Bee",
    scientific: "Apis dorsata",
    description: "The largest honey bee species, building single massive combs on tree branches and cliff faces. Known for aggressive defensive behavior.",
    habitat: "South & Southeast Asia",
    image: giantHoneyBee,
    traits: ["Open-air nesting", "Migratory", "Aggressive defense", "Large size"],
    category: "Honey Bee",
  },
  {
    name: "Dwarf Honey Bee",
    scientific: "Apis florea",
    description: "One of the smallest honey bee species. Builds a single small comb on tree branches. Important pollinator in tropical ecosystems.",
    habitat: "Southern Asia",
    image: dwarfHoneyBee,
    traits: ["Tiny size", "Single comb", "Gentle temperament"],
    category: "Honey Bee",
  },
  {
    name: "Bumblebee",
    scientific: "Bombus spp.",
    description: "Fuzzy, robust bees essential for buzz pollination. They can fly in cooler temperatures and lower light than most bees.",
    habitat: "Temperate regions worldwide",
    image: bumblebee,
    traits: ["Buzz pollination", "Cold tolerant", "Fuzzy body", "Short tongue"],
    category: "Bumblebee",
  },
  {
    name: "Mason Bee",
    scientific: "Osmia spp.",
    description: "Solitary bees that are exceptionally efficient pollinators — a single mason bee can do the work of 100 honey bees for fruit trees.",
    habitat: "North America, Europe, Asia",
    image: masonBee,
    traits: ["Solitary", "Super pollinator", "Mud nester", "Non-aggressive"],
    category: "Solitary",
  },
];

const ALL_CATEGORIES = ["All", ...Array.from(new Set(BEE_SPECIES.map((b) => b.category)))];

interface BeeGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export default function BeeGallery({ isOpen, onClose, embedded = false }: BeeGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return BEE_SPECIES.map((bee, i) => ({ bee, i })).filter(({ bee }) => {
      const matchesCategory = activeCategory === "All" || bee.category === activeCategory;
      const matchesSearch =
        !q ||
        bee.name.toLowerCase().includes(q) ||
        bee.scientific.toLowerCase().includes(q) ||
        bee.habitat.toLowerCase().includes(q) ||
        bee.traits.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const selected = selectedIndex !== null ? BEE_SPECIES[selectedIndex] : null;

  const content = (
    <BeeYieldPageShell className={embedded ? "p-0 md:p-0 -m-0 min-h-0 pb-0" : ""}>
      <BeeYieldPageHeader
        icon={ImageIcon}
        label="Science Gallery"
        title="Species Database"
        subtitle={`${BEE_SPECIES.length} species documented with high-fidelity research data.`}
        onBack={selectedIndex !== null ? () => setSelectedIndex(null) : onClose}
      />

      {selected ? (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
           <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-96 h-96 rounded-3xl overflow-hidden border border-border shadow-xl flex-shrink-0">
              <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-3xl font-black text-foreground tracking-tight mb-1">{selected.name}</h3>
                <p className="text-sm text-honey italic font-black uppercase tracking-widest">{selected.scientific}</p>
                <div className="flex gap-2 mt-4">
                  <BeeYieldBadge className="px-3 py-1 font-black uppercase text-[10px] tracking-widest">{selected.category}</BeeYieldBadge>
                  <BeeYieldBadge variant="success" className="px-3 py-1 font-black uppercase text-[10px] tracking-widest">Active Database</BeeYieldBadge>
                </div>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">{selected.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BeeYieldCard className="bg-muted/20 border-border/50">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Global Habitat</span>
                  <span className="text-sm text-foreground font-black tracking-tight">{selected.habitat}</span>
                </BeeYieldCard>
                <BeeYieldCard className="bg-muted/20 border-border/50">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Scientific Traits</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selected.traits.map((t) => (
                      <span key={t} className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-border uppercase tracking-tight">{t}</span>
                    ))}
                  </div>
                </BeeYieldCard>
              </div>
              
              <div className="flex gap-3 pt-6 border-t border-border">
                <button
                  disabled={selectedIndex === 0}
                  onClick={() => setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
                  className="px-6 py-3 rounded-2xl border border-border bg-white text-xs font-black uppercase tracking-widest hover:border-honey transition-all flex items-center gap-2 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  disabled={selectedIndex === BEE_SPECIES.length - 1}
                  onClick={() => setSelectedIndex((i) => (i !== null && i < BEE_SPECIES.length - 1 ? i + 1 : i))}
                  className="px-6 py-3 rounded-2xl border border-border bg-white text-xs font-black uppercase tracking-widest hover:border-honey transition-all flex items-center gap-2 disabled:opacity-30"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
            <div className="relative w-full sm:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-honey transition-colors" />
              <input
                type="text"
                placeholder="Filter search by species name or traits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl border border-border bg-white font-bold transition-all focus:border-honey/50 outline-none"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] px-4 py-2 rounded-xl border transition-all font-black uppercase tracking-widest ${
                    activeCategory === cat
                      ? "bg-honey text-white border-honey"
                      : "bg-white border-border text-muted-foreground hover:border-honey/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filtered.map(({ bee, i }) => (
              <button
                key={bee.scientific}
                onClick={() => setSelectedIndex(i)}
                className="text-left rounded-3xl border border-border hover:border-honey/50 bg-white hover:bg-muted/10 transition-all group overflow-hidden shadow-sm hover:shadow-honey/10"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={bee.image}
                    alt={bee.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-5">
                  <h4 className="text-sm font-black text-foreground group-hover:text-honey transition-colors leading-tight mb-1 uppercase tracking-tight">
                    {bee.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic truncate">{bee.scientific}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </BeeYieldPageShell>
  );

  if (embedded) return content;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-3xl w-full h-[90vh] max-w-6xl shadow-2xl relative transition-all transform overflow-hidden ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-full hover:bg-muted transition-colors z-50"><X className="w-5 h-5" /></button>
        <div className="h-full overflow-y-auto custom-scroll p-8">{content}</div>
      </div>
    </div>
  );
}
