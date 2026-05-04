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
  {
    name: "Leafcutter Bee",
    scientific: "Megachile spp.",
    description: "Named for their habit of cutting circular pieces from leaves to construct their nests. Important pollinators for alfalfa and wildflowers.",
    habitat: "Worldwide",
    image: leafcutterBee,
    traits: ["Leaf cutting", "Solitary", "Alfalfa pollinator"],
    category: "Solitary",
  },
  {
    name: "Carpenter Bee",
    scientific: "Xylocopa spp.",
    description: "Large, robust bees that bore into wood to create nests. Often mistaken for bumblebees but have a shiny, hairless abdomen.",
    habitat: "Worldwide (tropical & subtropical)",
    image: carpenterBee,
    traits: ["Wood boring", "Solitary", "Large body", "Buzz pollination"],
    category: "Solitary",
  },
  {
    name: "Stingless Bee",
    scientific: "Meliponini tribe",
    description: "Tropical bees that produce a unique, tangy honey called pot honey. They have vestigial stingers and defend by biting instead.",
    habitat: "Tropical regions worldwide",
    image: stinglessBee,
    traits: ["No sting", "Pot honey", "Resin collector", "Tropical"],
    category: "Stingless",
  },
  {
    name: "Sweat Bee",
    scientific: "Halictidae family",
    description: "Small, often metallic-colored bees attracted to human perspiration. They are important pollinators of wildflowers and crops.",
    habitat: "Worldwide",
    image: sweatBee,
    traits: ["Metallic colors", "Tiny size", "Ground nester", "Attracted to sweat"],
    category: "Solitary",
  },
  {
    name: "Mining Bee",
    scientific: "Andrena spp.",
    description: "One of the largest genera of bees, with over 1,500 species. They nest in the ground and are important early-spring pollinators.",
    habitat: "Northern Hemisphere",
    image: miningBee,
    traits: ["Ground nester", "Spring active", "Solitary", "Gentle"],
    category: "Solitary",
  },
  {
    name: "Orchid Bee",
    scientific: "Euglossini tribe",
    description: "Brilliantly metallic tropical bees. Males collect fragrant compounds from orchids to attract females — a remarkable co-evolutionary relationship.",
    habitat: "Central & South America",
    image: orchidBee,
    traits: ["Iridescent", "Orchid pollinator", "Long tongue", "Fragrance collector"],
    category: "Solitary",
  },
];

const ALL_CATEGORIES = ["All", ...Array.from(new Set(BEE_SPECIES.map((b) => b.category)))];

interface BeeGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BeeGallery({ isOpen, onClose, embedded }: BeeGalleryProps & { embedded?: boolean }) {
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

  if (!isOpen && !embedded) return null;

  const containerClasses = embedded 
    ? "relative w-full h-full" 
    : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm";
  
  const contentClasses = embedded 
    ? "bg-card border border-border rounded-2xl w-full flex flex-col" 
    : "bg-card border border-border rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden mx-4 flex flex-col";

  const selected = selectedIndex !== null ? BEE_SPECIES[selectedIndex] : null;

  return (
    <div className={containerClasses} onClick={!embedded ? onClose : undefined}>
      <div className={contentClasses} onClick={(e) => e.stopPropagation()}>
        {!embedded && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <Bug className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Bee Species Gallery</h2>
                <p className="text-xs text-muted-foreground">{BEE_SPECIES.length} species documented • AI-generated photos</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {selected ? (
          /* Detail View */
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] custom-scroll">
            <button
              onClick={() => setSelectedIndex(null)}
              className="text-xs text-primary hover:underline mb-4 flex items-center gap-1"
            >
              <ChevronLeft className="w-3 h-3" /> Back to all species
            </button>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0 w-full sm:w-56 h-56 rounded-xl overflow-hidden border border-border">
                <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" loading="lazy" width={512} height={512} />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-display text-2xl font-bold text-foreground">{selected.name}</h3>
                  <p className="text-sm text-primary italic">{selected.scientific}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border mt-1 inline-block">{selected.category}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
                <div>
                  <span className="text-xs font-semibold text-foreground">Habitat:</span>
                  <span className="text-xs text-muted-foreground ml-1">{selected.habitat}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.traits.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    disabled={selectedIndex === 0}
                    onClick={() => setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3 h-3" /> Previous
                  </button>
                  <button
                    disabled={selectedIndex === BEE_SPECIES.length - 1}
                    onClick={() => setSelectedIndex((i) => (i !== null && i < BEE_SPECIES.length - 1 ? i + 1 : i))}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all flex items-center gap-1"
                  >
                    Next <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Grid View with Search */
          <div className="flex flex-col max-h-[calc(90vh-80px)]">
            {/* Search & Filter Bar */}
            <div className="px-6 pt-4 pb-3 border-b border-border space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, habitat, or trait..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      activeCategory === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 overflow-y-auto custom-scroll">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No species match your search.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filtered.map(({ bee, i }) => (
                    <button
                      key={bee.scientific}
                      onClick={() => setSelectedIndex(i)}
                      className="text-left rounded-xl border border-border hover:border-primary/50 bg-card hover:bg-muted transition-all group overflow-hidden"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={bee.image}
                          alt={bee.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          width={512}
                          height={512}
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                          {bee.name}
                        </h4>
                        <p className="text-xs text-muted-foreground italic mt-0.5">{bee.scientific}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
