const stats = [
  { label: "Bee Species Worldwide", value: "20,000+", icon: "🐝", color: "text-honey" },
  { label: "Global Honey Production", value: "1.9M MT/yr", icon: "🍯", color: "text-pollen" },
  { label: "Known Bee Diseases", value: "50+", icon: "🦠", color: "text-destructive" },
  { label: "Honey Varieties", value: "300+", icon: "✨", color: "text-accent" },
  { label: "Managed Hives Globally", value: "91 Million", icon: "🏡", color: "text-honey" },
  { label: "Pollination Value/Year", value: "$577B USD", icon: "🌸", color: "text-pollen" },
  { label: "Training Data Points", value: "3.2M+", icon: "📊", color: "text-honey" },
  { label: "FP16 Model Precision", value: "97.4%", icon: "🧠", color: "text-accent" },
];

const categories = [
  {
    icon: "🐝",
    title: "Bee Species & Taxonomy",
    description: "All 20,000+ bee species — honey bees, bumblebees, stingless bees, solitary bees, rare & endangered species, subspecies classification",
    topics: ["Apis mellifera", "Bombus spp.", "Meliponini", "Mason Bees", "Carpenter Bees", "Africanized Bees", "Megachile pluto", "Perdita minima"],
    prompt: "Tell me about all major bee species types and their characteristics",
  },
  {
    icon: "🍯",
    title: "Honey Science & Varieties",
    description: "300+ honey varieties, chemical composition, medicinal properties, rheology, crystallization, grading, adulteration detection",
    topics: ["Manuka UMF/MGO", "Sidr Honey", "Acacia", "Raw vs Processed", "Crystallization", "NMR Testing", "Honeydew Honey"],
    prompt: "Explain the different types of honey and their unique properties",
  },
  {
    icon: "🦠",
    title: "Diseases & Pathogens",
    description: "Complete pathogen database — viral, bacterial, fungal, parasitic, and microsporidian diseases with diagnostic protocols",
    topics: ["Varroa Destructor", "American Foulbrood", "European Foulbrood", "Nosema ceranae", "DWV", "Chalkbrood", "Sacbrood", "ABPV", "CBPV", "Small Hive Beetle"],
    prompt: "Give me a comprehensive overview of all bee diseases with symptoms and treatments",
  },
  {
    icon: "💊",
    title: "Treatments & IPM",
    description: "All approved and research treatments — chemical, organic, biotechnical, integrated pest management, resistance monitoring",
    topics: ["Oxalic Acid", "Formic Acid", "Thymol", "Apivar", "Oxytetracycline", "VSH Bees", "Drone Brood Removal", "Biotechnical Methods"],
    prompt: "What are all the treatments available for bee diseases?",
  },
  {
    icon: "🌸",
    title: "Pollination Data",
    description: "Crop-specific pollination requirements, economic valuations, pollinator-plant networks, buzz pollination mechanics, decline impact models",
    topics: ["Almond Pollination", "Crop Dependencies", "Pollinator Networks", "Economic Models", "PSI Index", "Hand Pollination", "Pollinator Decline"],
    prompt: "What is the economic impact of bee pollination on global agriculture?",
  },
  {
    icon: "🏡",
    title: "Hive Systems & Apiaries",
    description: "Every hive design, apiary management, seasonal inspection calendars, overwintering, swarming management, queen rearing",
    topics: ["Langstroth", "Warré", "Top-Bar", "Flow Hive", "British National", "Log Hives", "Apiary Layout", "Queen Rearing"],
    prompt: "Compare all the different types of beehives and their advantages",
  },
  {
    icon: "⚠️",
    title: "Problems & Colony Loss",
    description: "CCD, pesticide impacts, habitat loss, climate change effects, monoculture stress, transportation mortality, robbing, absconding",
    topics: ["CCD", "Neonicotinoids", "Habitat Loss", "Climate Stress", "Colony Collapse", "Robbing Behavior", "Absconding", "Winter Losses"],
    prompt: "What are the biggest threats facing bee populations today?",
  },
  {
    icon: "🔬",
    title: "Research & Genomics",
    description: "Bee neuroscience, CRISPR, microbiome, pheromone communication, navigation, cognitive mapping, FP16 training models",
    topics: ["Waggle Dance", "Bee Cognition", "Genome (236M bp)", "Microbiome", "UV Vision", "CRISPR", "FP16 Models", "Neural Networks"],
    prompt: "What are the most important discoveries in bee genetics and neuroscience?",
  },
  {
    icon: "🌍",
    title: "Global Industry & Trade",
    description: "Honey trade routes, fraud detection, organic certification, urban beekeeping regulations, global production statistics by country",
    topics: ["China 9M+ Hives", "Colony Losses 40%", "Honey Fraud", "Urban Beekeeping", "AI Hive Tech", "2030 Projections", "Fair Trade Honey"],
    prompt: "Tell me about world bee and honey industry records and statistics",
  },
  {
    icon: "🌱",
    title: "Bee Products & Apitherapy",
    description: "Royal jelly, propolis, bee pollen, beeswax, bee venom therapy — composition, clinical trials, and commercial applications",
    topics: ["Royal Jelly", "Propolis CAPE", "Bee Pollen", "Beeswax", "Apitoxin", "Apilarnil", "Bee Venom Therapy"],
    prompt: "What are all the products that bees produce and their health benefits?",
  },
  {
    icon: "📡",
    title: "Smart Hive Technology",
    description: "IoT sensors, AI-powered disease detection, acoustic monitoring, weight tracking, thermal imaging, remote hive management",
    topics: ["Weight Sensors", "Acoustic Analysis", "Thermal Cameras", "AI Diagnostics", "BeeYield HHI", "Remote Monitoring", "Predictive Analytics"],
    prompt: "How is technology being used in modern beekeeping?",
  },
  {
    icon: "📈",
    title: "Training & Model Data",
    description: "3.2M+ data points used for FP16 precision training — species classification, disease identification, yield prediction, pollination mapping",
    topics: ["FP16 Training", "3.2M Datapoints", "Species Classifier", "Disease Detection", "Yield Predictor", "Image Recognition", "97.4% Accuracy"],
    prompt: "Tell me about BeeYield's AI training data and model architecture",
  },
];

interface KnowledgeDashboardProps {
  onAsk: (question: string) => void;
}

export default function KnowledgeDashboard({ onAsk }: KnowledgeDashboardProps) {
  return (
    <div className="h-full overflow-y-auto custom-scroll p-6">
      {/* Stats row */}
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-honey mb-1">🐝 Bee Knowledge Hub</h2>
        <p className="text-muted-foreground text-sm mb-4">Powered by 3.2M+ datasets • FP16 precision training • Bees, diseases, pollination, hives & global research</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="knowledge-card rounded-xl p-3">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`font-display text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category cards */}
      <div>
        <h3 className="font-display text-lg font-bold text-foreground mb-4">Knowledge Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.title}
              onClick={() => onAsk(cat.prompt)}
              className="knowledge-card rounded-xl p-4 text-left group w-full"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{cat.icon}</span>
                <h4 className="font-semibold text-foreground group-hover:text-honey transition-colors">
                  {cat.title}
                </h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{cat.description}</p>
              <div className="flex flex-wrap gap-1">
                {cat.topics.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick facts */}
      <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
        <h3 className="font-display text-base font-bold text-honey mb-3">⚡ Quick Bee Facts</h3>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>🏆 Oldest honey found: <span className="text-foreground font-medium">5,500 years old</span> — Egyptian tombs</li>
          <li>🔬 Largest bee: <span className="text-foreground font-medium">Megachile pluto</span> (Wallace's giant bee) at 38mm wingspan</li>
          <li>⚡ Fastest bee: <span className="text-foreground font-medium">Carpenter bee (Xylocopa)</span> at ~30 mph</li>
          <li>🌍 Most honey-producing country: <span className="text-foreground font-medium">China</span> with 446,000 MT/year</li>
          <li>💉 Varroa threshold for treatment: <span className="text-foreground font-medium">3% infestation</span> (3 mites per 100 bees)</li>
          <li>🧬 Honey bee genome sequenced: <span className="text-foreground font-medium">2006</span> — 236 million base pairs</li>
          <li>🌡️ Colony maintains: <span className="text-foreground font-medium">35°C</span> for brood development year-round</li>
          <li>💰 Annual pollination value: <span className="text-foreground font-medium">$235–577 billion USD</span> globally</li>
          <li>🧠 FP16 model trained on: <span className="text-foreground font-medium">3.2M+ data points</span> across 12 categories</li>
          <li>📊 Species classification accuracy: <span className="text-foreground font-medium">97.4%</span> on test datasets</li>
        </ul>
      </div>
    </div>
  );
}

