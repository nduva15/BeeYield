import { useState, useMemo } from "react";
import { X, Search, AlertTriangle, Shield, Bug, ChevronDown, ChevronUp } from "lucide-react";

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
  { name: "Neonicotinoid Sublethality", pathogen: "Imidacloprid/Clothianidin/Thiamethoxam", type: "Environmental", severity: "High", symptoms: ["Impaired navigation", "Reduced learning", "Lower foraging efficiency", "Weakened immunity", "Reduced reproduction"], treatments: ["Remove contaminated pollen", "Clean feed sources"], prevention: "Advocacy, IPM farming, buffer zones", affectedCastes: "All castes" },
  { name: "Nosema Bombi", pathogen: "Nosema bombi", type: "Microsporidian", severity: "High", symptoms: ["Reduced colony size", "Queen infertility", "Worker mortality", "Population decline"], treatments: ["No approved treatments for wild bumblebees"], prevention: "Reduce pathogen spillover from managed colonies", affectedCastes: "Bumblebees" },
  { name: "Brood Diseases (Mixed)", pathogen: "Multiple pathogens", type: "Bacterial", severity: "Moderate", symptoms: ["Spotty brood pattern", "Discolored larvae", "Unusual odor", "Uncapped dead brood"], treatments: ["Identify specific pathogen", "Hygienic requeening", "Antibiotic if bacterial"], prevention: "Regular inspection, hygienic stock", affectedCastes: "Larvae" },
  { name: "Bee Louse", pathogen: "Braula coeca", type: "Parasitic", severity: "Low", symptoms: ["Wingless fly on queen/workers", "Tunnels in cappings", "Minor honey damage", "Cosmetic comb damage"], treatments: ["Tobacco smoke (historical)", "Fluvalinate side-effect removal"], prevention: "Generally benign, rarely treated", affectedCastes: "Adults (queen)" },
  { name: "Amoeba Disease", pathogen: "Malpighamoeba mellificae", type: "Parasitic", severity: "Low", symptoms: ["Similar to Nosema", "Malpighian tubule cysts", "Often co-occurs with Nosema", "Dysentery"], treatments: ["Fumagillin", "Good husbandry"], prevention: "Clean water, reduce stress", affectedCastes: "Adults" },
  { name: "Septicemia", pathogen: "Pseudomonas/Serratia spp.", type: "Bacterial", severity: "Moderate", symptoms: ["Hemolymph turns milky", "Rapid death", "Legs/wings fall off easily", "Bad odor from dead bees"], treatments: ["No effective treatment", "Requeen", "Improve conditions"], prevention: "Reduce stress, maintain strong colonies", affectedCastes: "Adults" },
  { name: "Spiroplasma Infection", pathogen: "Spiroplasma apis/melliferum", type: "Bacterial", severity: "Low", symptoms: ["May flower disease", "Inability to fly in spring", "Crawling at entrance", "Rapid death during nectar dearth"], treatments: ["No treatment needed", "Self-resolving with nectar flow"], prevention: "Ensure adequate forage", affectedCastes: "Adults" },
  { name: "Filamentous Virus", pathogen: "AmFV", type: "Viral", severity: "Low", symptoms: ["Milky hemolymph", "Often asymptomatic", "Reduced longevity", "Interacts with Nosema"], treatments: ["No direct treatment", "Nosema management"], prevention: "Reduce Nosema co-infection", affectedCastes: "Adults" },
  { name: "Cloudy Wing Virus", pathogen: "CWV", type: "Viral", severity: "Low", symptoms: ["Opaque/cloudy wings", "Loss of transparency", "Reduced flight ability"], treatments: ["No direct treatment"], prevention: "General colony health", affectedCastes: "Adults" },
  { name: "Slow Bee Paralysis Virus", pathogen: "SBPV", type: "Viral", severity: "Moderate", symptoms: ["Anterior leg paralysis", "Death within days", "Varroa-associated"], treatments: ["Varroa control"], prevention: "Mite management", affectedCastes: "Adults" },
  { name: "Lake Sinai Virus", pathogen: "LSV 1/2", type: "Viral", severity: "Low", symptoms: ["Often asymptomatic", "Fatigue", "Possible colony stress"], treatments: ["No direct treatment"], prevention: "General colony health", affectedCastes: "Adults" },
  { name: "Apis Iridescent Virus", pathogen: "AIV (Iridoviridae)", type: "Viral", severity: "Moderate", symptoms: ["Iridescent sheen on thorax", "Clustering at entrance", "Reduced flight", "Colony dwindling"], treatments: ["No direct treatment", "Supportive care"], prevention: "Reduce stress, good nutrition", affectedCastes: "Adults" },
  { name: "Bee Virus X/Y", pathogen: "BVX / BVY", type: "Viral", severity: "Low", symptoms: ["Shortened lifespan", "Generally subclinical", "Interact with Nosema"], treatments: ["Nosema management"], prevention: "Reduce co-infections", affectedCastes: "Adults" },
  { name: "Varroosis-Associated Syndrome", pathogen: "Varroa + multiple viruses", type: "Parasitic", severity: "Critical", symptoms: ["Parasitic mite syndrome (PMS)", "Mixed brood disease symptoms", "Deformed wings + spotty brood", "Rapid autumn collapse"], treatments: ["Aggressive Varroa treatment", "Oxalic + formic acid combo", "Emergency feeding"], prevention: "Never let mites exceed 3% threshold", affectedCastes: "All castes" },
  { name: "Dysentery", pathogen: "Non-infectious / Nosema secondary", type: "Nutritional", severity: "Low", symptoms: ["Brown streaks on hive front", "Fecal staining inside hive", "Swollen abdomen", "Winter/spring occurrence"], treatments: ["Improve ventilation", "Provide clean feed", "Replace old combs"], prevention: "Quality winter feed, ventilation", affectedCastes: "Adults" },
  { name: "Starvation", pathogen: "N/A (Management failure)", type: "Nutritional", severity: "High", symptoms: ["Bees headfirst in cells", "Empty food stores", "Dead cluster", "Rapid colony death"], treatments: ["Emergency sugar syrup/fondant feeding", "Pollen substitute"], prevention: "Monitor stores, fall feeding", affectedCastes: "All castes" },
  { name: "Chilled Brood", pathogen: "N/A (Temperature failure)", type: "Environmental", severity: "Moderate", symptoms: ["Dead brood in arc pattern", "Dark/discolored dead brood", "Often after inspection", "Edge-of-cluster mortality"], treatments: ["Reduce hive space", "Insulate", "Combine weak colonies"], prevention: "Minimize inspections in cold weather", affectedCastes: "Brood" },
  { name: "Laying Workers", pathogen: "N/A (Queenless colony)", type: "Genetic", severity: "High", symptoms: ["Multiple eggs per cell", "Drone brood in worker cells", "Scattered brood pattern", "Aggressive/disorganized behavior"], treatments: ["Introduce mated queen", "Combine with queenright colony", "Shake out method"], prevention: "Maintain queen-right status, quick requeening", affectedCastes: "Colony-level" },
  { name: "Queen Failure", pathogen: "N/A (Age/injury/genetics)", type: "Genetic", severity: "High", symptoms: ["Spotty brood pattern", "Excessive drone brood", "Supersedure cells", "Colony decline", "Increased aggression"], treatments: ["Requeen with young mated queen", "Allow supersedure"], prevention: "Requeen every 1-2 years", affectedCastes: "Colony-level" },
  { name: "Robbing", pathogen: "N/A (Behavioral)", type: "Environmental", severity: "Moderate", symptoms: ["Fighting at entrance", "Bees wrestling on landing board", "Torn wax cappings", "Rapid honey loss", "Dead bees at entrance"], treatments: ["Reduce entrance", "Robbing screen", "Move weak hives", "Stop feeding syrup openly"], prevention: "Reduce entrances in dearth, don't spill syrup", affectedCastes: "Colony-level" },
  { name: "Absconding", pathogen: "N/A (Stress response)", type: "Environmental", severity: "High", symptoms: ["Entire colony abandons hive", "Empty hive with stores", "Common in tropical bees", "Often triggered by disturbance"], treatments: ["Address root cause", "Reduce disturbance", "Improve conditions"], prevention: "Reduce stress, adequate shade, pest control", affectedCastes: "Colony-level" },
  { name: "Propolis Allergy (Beekeeper)", pathogen: "Contact allergen", type: "Environmental", severity: "Low", symptoms: ["Contact dermatitis", "Skin rash on hands", "Itching/swelling", "Occupational hazard"], treatments: ["Antihistamines", "Topical corticosteroids", "Gloves"], prevention: "Wear nitrile gloves", affectedCastes: "Beekeeper" },
  { name: "Africanized Bee Aggression", pathogen: "A. m. scutellata hybrid genetics", type: "Genetic", severity: "Moderate", symptoms: ["Excessive stinging response", "Rapid colony buildup", "Frequent swarming", "Defensive over large area"], treatments: ["Requeen with gentle stock", "European queen introduction"], prevention: "Maintain European genetics, requeen regularly", affectedCastes: "Colony-level" },
  { name: "Toxic Honey (Rhododendron)", pathogen: "Grayanotoxin from Rhododendron/Azalea", type: "Environmental", severity: "Moderate", symptoms: ["'Mad honey' — dizziness in humans", "Cardiac issues if consumed", "Bees generally unaffected", "Regional issue (Turkey, Nepal)"], treatments: ["Remove contaminated honey", "Do not sell for consumption"], prevention: "Avoid placing hives near toxic flora", affectedCastes: "Humans (consuming honey)" },
  { name: "Phorid Fly Parasitism", pathogen: "Apocephalus borealis", type: "Parasitic", severity: "Moderate", symptoms: ["Zombie bee behavior (ZomBees)", "Nocturnal flight", "Disorientation", "Larvae emerge from dead bees"], treatments: ["No established treatment", "Remove dead bees"], prevention: "Monitor for aberrant night flying", affectedCastes: "Adults" },
  { name: "Conopid Fly Parasitism", pathogen: "Conops/Physocephala spp.", type: "Parasitic", severity: "Low", symptoms: ["Bees burying in soil before death", "Pupae found inside dead bees", "Reduced foraging efficiency"], treatments: ["No treatment available"], prevention: "Monitor, maintain strong colonies", affectedCastes: "Adults (bumblebees too)" },
  { name: "Deformed Wing Virus Type B", pathogen: "DWV-B (VDV-1)", type: "Viral", severity: "Critical", symptoms: ["More virulent than DWV-A", "Deformed wings", "Higher larval mortality", "Rapid colony decline"], treatments: ["Aggressive Varroa control", "No direct antiviral"], prevention: "Early and consistent mite treatment", affectedCastes: "All stages" },
  { name: "Melanosis", pathogen: "Fungal / Bacterial mixed", type: "Fungal", severity: "Moderate", symptoms: ["Black discoloration of queen ovaries", "Reduced egg laying", "Queen infertility", "Dark tissue"], treatments: ["Requeen"], prevention: "Avoid instrumental insemination contamination", affectedCastes: "Queens" },
  { name: "Asian Hornet Predation", pathogen: "Vespa velutina", type: "Predator", severity: "High", symptoms: ["Hawking behavior at entrance", "Forager attrition", "Colony stress/reduced foraging", "Colony collapse if sustained"], treatments: ["Hornet traps", "Muzzle guards", "Report sightings", "Nest destruction"], prevention: "Early detection, trapping programs", affectedCastes: "Foragers" },
  { name: "Giant Hornet Predation", pathogen: "Vespa mandarinia", type: "Predator", severity: "Critical", symptoms: ["Mass slaughter at entrance", "Colony destruction in hours", "Decapitated bees", "Robbing of brood/honey"], treatments: ["Entrance reducers", "Hornet guards", "Trapping", "'Hot bee ball' defense (Apis cerana)"], prevention: "Entrance guards, monitoring", affectedCastes: "Colony-level" },
  { name: "Chronic Pesticide Exposure", pathogen: "Sublethal agrochemical mix", type: "Environmental", severity: "High", symptoms: ["Reduced immunity", "Impaired learning/memory", "Lower brood viability", "Synergistic pathogen susceptibility"], treatments: ["Move to clean foraging area", "Supplement feeding", "Advocate for IPM farming"], prevention: "Buffer zones, organic forage areas", affectedCastes: "All castes" },
];

const PATHOGEN_TYPES: PathogenType[] = ["Parasitic", "Bacterial", "Viral", "Fungal", "Microsporidian", "Environmental", "Nutritional", "Genetic", "Predator"];

interface BeeDiseasesPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BeeDiseasesPage({ isOpen, onClose }: BeeDiseasesPageProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-6xl max-h-[92vh] overflow-hidden mx-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Bee Diseases & Health</h2>
              <p className="text-xs text-muted-foreground">{DISEASES.length} diseases documented • Symptoms, treatments & severity</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Severity summary */}
        <div className="px-6 py-3 border-b border-border flex gap-3 flex-wrap flex-shrink-0">
          {(["Critical", "High", "Moderate", "Low"] as Severity[]).map((sev) => (
            <div key={sev} className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${SEVERITY_COLORS[sev]}`}>
              {sev}: {severityCounts[sev]}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-border space-y-2 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search diseases, pathogens, or symptoms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-1.5 items-center flex-wrap">
              <span className="text-xs text-muted-foreground">Type:</span>
              {["All", ...PATHOGEN_TYPES].map((t) => (
                <button key={t} onClick={() => setFilterType(t)} className={`text-xs px-2 py-0.5 rounded-full border transition-all ${filterType === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 items-center flex-wrap">
              <span className="text-xs text-muted-foreground">Severity:</span>
              {["All", "Critical", "High", "Moderate", "Low"].map((s) => (
                <button key={s} onClick={() => setFilterSeverity(s)} className={`text-xs px-2 py-0.5 rounded-full border transition-all ${filterSeverity === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Disease list */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-2">
          {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No diseases match your filters.</p>}
          {filtered.map((d, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <div key={d.name} className="border border-border rounded-xl overflow-hidden bg-card hover:border-primary/30 transition-colors">
                <button onClick={() => setExpandedIndex(isExpanded ? null : i)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${SEVERITY_COLORS[d.severity]}`}>{d.severity}</span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">{d.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{d.pathogen} • {d.type}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div>
                      <h5 className="text-xs font-semibold text-foreground mb-1">Symptoms</h5>
                      <div className="flex flex-wrap gap-1">
                        {d.symptoms.map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-foreground mb-1">Treatments</h5>
                      <div className="flex flex-wrap gap-1">
                        {d.treatments.map((t) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <div><span className="font-semibold text-foreground">Prevention:</span> <span className="text-muted-foreground">{d.prevention}</span></div>
                    </div>
                    <div className="text-xs"><span className="font-semibold text-foreground">Affects:</span> <span className="text-muted-foreground">{d.affectedCastes}</span></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

