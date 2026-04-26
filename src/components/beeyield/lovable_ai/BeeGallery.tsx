import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Bug, Search } from "lucide-react";

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
    <div className={embedded ? "" : "max-h-[85vh] overflow-y-auto custom-scroll"}>
      {/* Header Info */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">Bee Species Gallery</h2>
        <p className="text-sm text-muted-foreground">{BEE_SPECIES.length} species documented • High-fidelity research data</p>
      </div>

      {selected ? (
        /* Detail View */
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <button
            onClick={() => setSelectedIndex(null)}
            className="text-xs font-black text-honey uppercase tracking-widest mb-6 flex items-center gap-1 hover:opacity-70 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" /> Back to grid
          </button>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-72 h-72 rounded-3xl overflow-hidden border-2 border-honey/20 shadow-xl shadow-honey/5 flex-shrink-0">
              <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-display text-3xl font-bold text-foreground mb-1">{selected.name}</h3>
                <p className="text-sm text-honey italic font-medium">{selected.scientific}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-muted border border-border uppercase tracking-widest">{selected.category}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20 uppercase tracking-widest">Active</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-muted/30 border border-border p-4">
                  <span className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Global Habitat</span>
                  <span className="text-xs text-foreground font-bold">{selected.habitat}</span>
                </div>
                <div className="rounded-2xl bg-muted/30 border border-border p-4">
                  <span className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Key Traits</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selected.traits.map((t) => (
                      <span key={t} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white border border-border uppercase">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-border">
                <button
                  disabled={selectedIndex === 0}
                  onClick={() => setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
                  className="px-4 py-2 rounded-xl border border-border bg-white text-xs font-bold hover:border-honey/30 transition-all flex items-center gap-2 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  disabled={selectedIndex === BEE_SPECIES.length - 1}
                  onClick={() => setSelectedIndex((i) => (i !== null && i < BEE_SPECIES.length - 1 ? i + 1 : i))}
                  className="px-4 py-2 rounded-xl border border-border bg-white text-xs font-bold hover:border-honey/30 transition-all flex items-center gap-2 disabled:opacity-30"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search species..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-honey/20"
              />
            </div>
            
            <div className="flex gap-1.5 flex-wrap">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all font-bold ${
                    activeCategory === cat
                      ? "bg-honey text-white border-honey"
                      : "bg-white/50 border-border text-muted-foreground hover:border-honey/30 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Bug className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No species match your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(({ bee, i }) => (
                <button
                  key={bee.scientific}
                  onClick={() => setSelectedIndex(i)}
                  className="text-left rounded-3xl border border-border hover:border-honey/40 bg-white/40 hover:bg-white transition-all group overflow-hidden shadow-sm hover:shadow-honey/5"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={bee.image}
                      alt={bee.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-bold text-foreground group-hover:text-honey transition-colors leading-tight mb-1">
                      {bee.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground italic truncate">{bee.scientific}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className={`bg-white rounded-3xl w-full max-w-6xl shadow-2xl relative transition-all transform ${isOpen ? 'scale-100' : 'scale-95'}`}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {content}
        </div>
      </div>
    </div>
  );
}
