import { Activity, AlertTriangle, BookOpen, Droplets, Globe, Microscope, TrendingUp, Zap } from "lucide-react";

const stats = [
    { label: "Bee Species Worldwide", value: "20,000+", icon: "🐝", color: "text-honey" },
    { label: "Global Honey Production", value: "1.9M MT/yr", icon: "🍯", color: "text-pollen" },
    { label: "Known Bee Diseases", value: "50+", icon: "🦠", color: "text-destructive" },
    { label: "Honey Varieties", value: "300+", icon: "✨", color: "text-accent" },
    { label: "Managed Hives Globally", value: "91 Million", icon: "🏡", color: "text-honey" },
    { label: "Pollination Value/Year", value: "$577B USD", icon: "🌸", color: "text-pollen" },
];

const categories = [
    {
        icon: "🐝",
        title: "Bee Species",
        description: "All 20,000+ bee species — honey bees, bumblebees, stingless bees, solitary bees, and rare species",
        topics: ["Apis mellifera", "Bombus spp.", "Meliponini", "Mason Bees", "Carpenter Bees", "Africanized Bees"],
        prompt: "Tell me about all major bee species types and their characteristics",
    },
    {
        icon: "🍯",
        title: "Honey Science",
        description: "300+ honey varieties, composition, medicinal properties, global production, and records",
        topics: ["Manuka (UMF/MGO)", "Sidr Honey", "Acacia", "Raw vs Processed", "Crystallization", "Adulteration"],
        prompt: "Explain the different types of honey and their unique properties",
    },
    {
        icon: "🦠",
        title: "Bee Diseases",
        description: "Complete database of all bee diseases — parasitic, fungal, bacterial, viral, and environmental",
        topics: ["Varroa Destructor", "American Foulbrood", "Nosema ceranae", "DWV", "Chalkbrood", "CCD"],
        prompt: "Give me a comprehensive overview of all bee diseases with symptoms and treatments",
    },
    {
        icon: "💊",
        title: "Treatments & Cures",
        description: "All approved and research treatments — chemical, organic, biotechnical, and IPM strategies",
        topics: ["Oxalic Acid", "Formic Acid", "Thymol", "Apivar", "Oxytetracycline", "VSH Bees"],
        prompt: "What are all the treatments available for bee diseases?",
    },
    {
        icon: "🏡",
        title: "Hive Systems",
        description: "Every hive design from Langstroth to Flow Hive, traditional skeps to modern insulated systems",
        topics: ["Langstroth", "Warré", "Top-Bar", "Flow Hive", "British National", "Log Hives"],
        prompt: "Compare all the different types of beehives and their advantages",
    },
    {
        icon: "🔬",
        title: "Research & Science",
        description: "Cutting-edge bee science — neuroscience, genetics, microbiome, waggle dance, and projections",
        topics: ["Waggle Dance", "Bee Cognition", "Genome", "Microbiome", "UV Vision", "Climate Impact"],
        prompt: "What are the most important recent discoveries in bee science?",
    },
    {
        icon: "🌍",
        title: "Industry & Records",
        description: "Global honey trade, world records, population projections, industry news, and beekeeping tech",
        topics: ["China 9M+ Hives", "Colony Losses 40%", "Honey Fraud", "Urban Beekeeping", "AI Hive Tech", "2030 Projections"],
        prompt: "Tell me about world bee and honey industry records and statistics",
    },
    {
        icon: "🌱",
        title: "Bee Products",
        description: "Royal jelly, propolis, bee pollen, beeswax, bee venom — composition and applications",
        topics: ["Royal Jelly", "Propolis CAPE", "Bee Pollen", "Beeswax", "Apitoxin", "Apilarnil"],
        prompt: "What are all the products that bees produce and their health benefits?",
    },
];

interface KnowledgeHubDashboardProps {
    onAsk: (question: string) => void;
}

export default function KnowledgeHubDashboard({ onAsk }: KnowledgeHubDashboardProps) {
    return (
        <div className="h-full overflow-y-auto custom-scroll p-6">
            {/* Stats row */}
            <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-honey mb-1">🐝 BeeYield AI</h2>
                <p className="text-muted-foreground text-sm mb-4">Powered by 500K+ datasets on bees, honey, diseases, research & the global industry</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </ul>
            </div>
        </div>
    );
}
