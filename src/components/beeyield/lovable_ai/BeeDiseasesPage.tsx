import { useState, useMemo } from "react";
import { X, Search, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

type Severity = "Critical" | "High" | "Moderate" | "Low";
type PathogenType = "Parasitic" | "Bacterial" | "Viral" | "Fungal" | "Microsporidian" | "Environmental" | "Nutritional" | "Genetic" | "Predator";

interface Disease {
  name: string;
  pathogen: string;
  type: PathogenType;
  severity: Severity;
  symptoms: string[];
  treatments: string[];
  prevention: string;
  affectedCastes: string;
}

const SEVERITY_COLORS: Record<Severity, string> = {
  Critical: "bg-destructive/15 text-destructive border-destructive/30",
  High: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  Moderate: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  Low: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
};

const DISEASES: Disease[] = [
  { name: "Varroa Mite Infestation", pathogen: "Varroa destructor", type: "Parasitic", severity: "Critical", symptoms: ["Deformed wings", "Shortened abdomen", "Weight loss", "Viral transmission", "Colony weakening"], treatments: ["Oxalic acid vaporization", "Formic acid strips", "Apivar (amitraz)", "Apistan (fluvalinate)", "Drone brood removal", "Sugar dusting"], prevention: "Regular mite counts, IPM rotation", affectedCastes: "All castes" },
  { name: "American Foulbrood (AFB)", pathogen: "Paenibacillus larvae", type: "Bacterial", severity: "Critical", symptoms: ["Sunken/perforated cappings", "Ropy brown larvae", "Foul odor", "Matchstick test positive", "Scale formation"], treatments: ["Burn infected equipment (many regions)", "Oxytetracycline (preventive)", "Tylosin tartrate", "Irradiation of equipment"], prevention: "Inspect regularly, quarantine new colonies", affectedCastes: "Larvae" },
  { name: "European Foulbrood (EFB)", pathogen: "Melissococcus plutonius", type: "Bacterial", severity: "High", symptoms: ["Twisted/discolored larvae", "Yellow-brown larvae", "Sour odor", "Irregular brood pattern"], treatments: ["Oxytetracycline", "Shook swarm method", "Requeening"], prevention: "Strong colonies, good nutrition", affectedCastes: "Larvae" },
  { name: "Nosemosis (Type C)", pathogen: "Nosema ceranae", type: "Microsporidian", severity: "High", symptoms: ["Dysentery", "Reduced lifespan", "Poor spring buildup", "Queen supersedure", "Crawling bees"], treatments: ["Fumagillin", "Thymol-based", "Requeening", "Probiotics (research)"], prevention: "Clean water, reduce stress, good ventilation", affectedCastes: "Adult workers" },
  { name: "Nosemosis (Type A)", pathogen: "Nosema apis", type: "Microsporidian", severity: "Moderate", symptoms: ["Dysentery on hive fronts", "Swollen abdomen", "K-wing", "Disjointed wings"], treatments: ["Fumagillin", "Thermal treatment"], prevention: "Proper ventilation, clean combs", affectedCastes: "Adult workers" },
  { name: "Deformed Wing Virus (DWV)", pathogen: "DWV (Iflaviridae)", type: "Viral", severity: "Critical", symptoms: ["Crumpled/deformed wings", "Shortened abdomen", "Discoloration", "Reduced lifespan"], treatments: ["Control Varroa (vector)", "No direct antiviral"], prevention: "Varroa management is key", affectedCastes: "Pupae, adults" },
  { name: "Acute Bee Paralysis Virus", pathogen: "ABPV", type: "Viral", severity: "High", symptoms: ["Trembling", "Inability to fly", "Dark/hairless body", "Rapid death"], treatments: ["Varroa control", "No direct treatment"], prevention: "Mite management", affectedCastes: "Adults" },
  { name: "Chronic Bee Paralysis Virus", pathogen: "CBPV", type: "Viral", severity: "High", symptoms: ["Trembling/shaking bees", "Bloated abdomen", "Hairless/shiny 'black robbers'", "Crawling at entrance"], treatments: ["Requeen", "Reduce colony density", "Improve ventilation"], prevention: "Avoid overcrowding", affectedCastes: "Adults" },
  { name: "Sacbrood Virus", pathogen: "SBV (Iflaviridae)", type: "Viral", severity: "Moderate", symptoms: ["Fluid-filled larvae", "Larvae fail to pupate", "Gondola-shaped larvae", "Color change to brown"], treatments: ["Requeen", "No direct treatment"], prevention: "Maintain strong colonies", affectedCastes: "Larvae" },
  { name: "Black Queen Cell Virus", pathogen: "BQCV", type: "Viral", severity: "Moderate", symptoms: ["Dead queen larvae in cells", "Darkened queen cells", "Associated with Nosema"], treatments: ["Nosema control", "Requeen"], prevention: "Nosema prevention", affectedCastes: "Queen larvae" },
  { name: "Israeli Acute Paralysis Virus", pathogen: "IAPV", type: "Viral", severity: "High", symptoms: ["Shivering wings", "Progressive paralysis", "Rapid colony loss", "Linked to CCD"], treatments: ["Varroa control", "No direct treatment"], prevention: "Mite management, reduce stress", affectedCastes: "Adults" },
  { name: "Kashmir Bee Virus", pathogen: "KBV", type: "Viral", severity: "Moderate", symptoms: ["No visible symptoms often", "Sudden colony death", "Adults cease foraging"], treatments: ["Varroa management"], prevention: "Integrated pest management", affectedCastes: "Adults" },
  { name: "Chalkbrood", pathogen: "Ascosphaera apis", type: "Fungal", severity: "Moderate", symptoms: ["White/grey mummified larvae", "Hard chalk-like mummies", "Mummies at hive entrance", "Irregular brood"], treatments: ["Improve ventilation", "Requeen (hygienic stock)", "Remove infected frames"], prevention: "Good ventilation, strong colonies", affectedCastes: "Larvae" },
  { name: "Stonebrood", pathogen: "Aspergillus flavus/fumigatus", type: "Fungal", severity: "Moderate", symptoms: ["Hard mummified larvae", "Green/yellow fungal growth", "Stone-hard brood", "Potential human pathogen"], treatments: ["Remove infected combs", "Improve ventilation", "Requeen"], prevention: "Reduce humidity, ventilate", affectedCastes: "Larvae, adults" },
  { name: "Small Hive Beetle", pathogen: "Aethina tumida", type: "Predator", severity: "High", symptoms: ["Slime trails on combs", "Fermented honey", "Larvae tunneling in combs", "Colony absconding"], treatments: ["Beetle traps (oil/vinegar)", "CheckMite+", "GardStar", "Soil treatment around hives"], prevention: "Strong colonies, reduce space, ground treatment", affectedCastes: "Colony-level" },
  { name: "Wax Moth Infestation", pathogen: "Galleria mellonella / Achroia grisella", type: "Predator", severity: "Moderate", symptoms: ["Webbing in combs", "Tunneled comb", "Frass/debris", "Silken tunnels through brood"], treatments: ["Freeze combs", "BT (Bacillus thuringiensis)", "Paramoth", "Strong colony maintenance"], prevention: "Keep colonies strong, store combs properly", affectedCastes: "Colony-level" },
  { name: "Tracheal Mite", pathogen: "Acarapis woodi", type: "Parasitic", severity: "Moderate", symptoms: ["K-wing", "Crawling bees", "Reduced winter survival", "Disjointed wings", "Dysentery"], treatments: ["Menthol crystals", "Formic acid", "Grease patties"], prevention: "Select resistant stock, menthol in autumn", affectedCastes: "Adults" },
  { name: "Tropilaelaps Mite", pathogen: "Tropilaelaps clareae/mercedesae", type: "Parasitic", severity: "Critical", symptoms: ["Deformed brood", "Irregular brood pattern", "Parasitic mite syndrome", "Rapid colony decline"], treatments: ["Formic acid", "Brood-free period", "Fluvalinate"], prevention: "Quarantine, brood interruption", affectedCastes: "Brood" },
  { name: "Colony Collapse Disorder", pathogen: "Multifactorial", type: "Environmental", severity: "Critical", symptoms: ["Sudden worker disappearance", "Queen present with brood", "Few/no dead bees in hive", "Delayed robbing"], treatments: ["Address multiple stressors", "Reduce pesticide exposure", "Improve nutrition", "Varroa control"], prevention: "Holistic IPM, reduce chemical exposure", affectedCastes: "Workers" },
  { name: "Pesticide Poisoning", pathogen: "Neonicotinoids/Organophosphates", type: "Environmental", severity: "Critical", symptoms: ["Mass die-off at entrance", "Tongue extension reflex", "Disorientation", "Trembling", "Inability to fly"], treatments: ["Remove contaminated stores", "Feed clean syrup", "Shade hives", "Report to authorities"], prevention: "Communication with farmers, pesticide-free forage", affectedCastes: "Foragers primarily" },
];

const PATHOGEN_TYPES: PathogenType[] = ["Parasitic", "Bacterial", "Viral", "Fungal", "Microsporidian", "Environmental", "Nutritional", "Genetic", "Predator"];

interface BeeDiseasesPageProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export default function BeeDiseasesPage({ isOpen, onClose, embedded = false }: BeeDiseasesPageProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterSeverity, setFilterSeverity] = useState<string>("All");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return DISEASES.filter((d) => {
      const matchType = filterType === "All" || d.type === filterType;
      const matchSev = filterSeverity === "All" || d.severity === filterSeverity;
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.pathogen.toLowerCase().includes(q) || d.symptoms.some((s) => s.toLowerCase().includes(q));
      return matchType && matchSev && matchSearch;
    });
  }, [search, filterType, filterSeverity]);

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
    DISEASES.forEach((d) => counts[d.severity]++);
    return counts;
  }, []);

  const content = (
    <div className={embedded ? "" : "max-h-[85vh] overflow-y-auto custom-scroll"}>
      {/* Header Info */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">Bee Diseases & Health</h2>
        <p className="text-sm text-muted-foreground">{DISEASES.length} diseases documented • Symptoms, treatments & severity</p>
      </div>

      {/* Severity summary */}
      <div className="flex gap-3 flex-wrap mb-6">
        {(["Critical", "High", "Moderate", "Low"] as Severity[]).map((sev) => (
          <div key={sev} className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${filterSeverity === sev ? 'ring-2 ring-primary/20 bg-muted border-primary' : SEVERITY_COLORS[sev]}`}>
            {sev}: {severityCounts[sev]}
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search diseases, pathogens, or symptoms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 backdrop-blur-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1">Type:</span>
          {["All", ...PATHOGEN_TYPES.slice(0, 5)].map((t) => (
            <button key={t} onClick={() => setFilterType(t)} className={`text-xs px-3 py-1 rounded-full border transition-all font-bold ${filterType === t ? "bg-honey text-white border-honey" : "bg-white/50 border-border text-muted-foreground hover:border-honey/50"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Disease list */}
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No diseases match your filters.</p>}
        {filtered.map((d, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <div key={d.name} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-honey/40 bg-honey/5' : 'border-border bg-white/40 hover:border-honey/20'}`}>
              <button onClick={() => setExpandedIndex(isExpanded ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-black uppercase flex-shrink-0 ${SEVERITY_COLORS[d.severity]}`}>{d.severity}</span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">{d.name}</h4>
                    <p className="text-xs text-muted-foreground truncate italic">{d.pathogen}</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-honey" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>
              
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-honey/10 pt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-honey" /> Symptoms
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {d.symptoms.map((s) => (
                          <span key={s} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-destructive/5 text-destructive border border-destructive/10">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-honey" /> Treatments
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {d.treatments.map((t) => (
                          <span key={t} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-primary/5 text-primary border border-primary/10">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="rounded-xl bg-white/50 border border-border p-3">
                      <span className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Prevention Strategy</span>
                      <span className="text-xs text-foreground font-medium leading-relaxed">{d.prevention}</span>
                    </div>
                    <div className="rounded-xl bg-white/50 border border-border p-3">
                      <span className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Target Population</span>
                      <span className="text-xs text-foreground font-medium">{d.affectedCastes}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className={`bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative transition-all transform ${isOpen ? 'scale-100' : 'scale-95'}`}
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
