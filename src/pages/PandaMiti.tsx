import { useState } from "react";
import {
  Trees,
  Sprout,
  MapPin,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  Sun,
  CheckCircle2,
  Leaf,
  Flower2,
  Calendar,
  Layers,
  Award,
  BookOpen,
  ArrowLeft,
  Droplets,
  Heart,
  Globe2,
  Activity,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoryHeroBackground } from "@/components/StoryHeroBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { treeSpeciesData } from "@/components/beeyield/PandaMitiSection";

export const richFloraData = [
  {
    name: "Acacia senegal & Acacia tortilis",
    localName: "All-Season Bee Acacia (Mgunga)",
    role: "Deep-rooted dryland keystone providing critical drought-resilient nectar flushes and fixing natural nitrogen in soil.",
    flowerType: "Dense, fragrant golden & cream flower spikes buzzing with honeybees.",
    beeImpact:
      "Saves colonies from severe mid-season famine with light amber, enzyme-dense nectar.",
    pollinationNeed:
      "Flowers depend 100% on honeybee cross-pollination to fertilize seed pods and naturally regenerate.",
    blooms: "Biannual peak flushes (drought-resilient)",
  },
  {
    name: "Melia volkensii",
    localName: "Mukau (Dryland Mahogany)",
    role: "Fast-growing indigenous canopy providing cooling shade over hives and essential windbreaks for bee flight corridors.",
    flowerType: "Delicate star-shaped lilac-white flowers with intense sweet scent.",
    beeImpact:
      "High-protein pollen burst that stimulates rapid queen laying and brood rearing before honey flows.",
    pollinationNeed:
      "Requires active bee visitation for successful pollination and propagation of high-value timber seed.",
    blooms: "Early-season abundant floral nectar",
  },
  {
    name: "Moringa oleifera",
    localName: "Miracle Pollen Tree (Mlonge)",
    role: "Perennial blossom champion that thrives in semi-arid zones, sustaining both wild bees and community nutrition.",
    flowerType: "Clusters of cream-white nectar-rich blossoms flowering 10 to 12 months a year.",
    beeImpact:
      "Continuous crude protein (24%+) pollen, boosting worker bee longevity and immune defense against pests.",
    pollinationNeed:
      "Every blossom requires bee pollination to set the long drumstick pods and nutrient-packed seeds.",
    blooms: "Continuous year-round flowering",
  },
  {
    name: "Adansonia digitata",
    localName: "African Baobab (Mbuyu)",
    role: "Ancient water-storing monolith that anchors microclimates, shelters wild pollinator swarms, and halts soil erosion.",
    flowerType:
      "Magnificent nocturnal pendulous white blossoms with thousands of pollen-laden stamens.",
    beeImpact:
      "Abundant twilight and dawn nectar reservoir, providing water and sugars during extreme heatwaves.",
    pollinationNeed:
      "Flowers rely on twilight bee and bat pollination to produce vitamin C-rich baobab superfruit.",
    blooms: "Nocturnal white blooms during rain onset",
  },
  {
    name: "Tamarindus indica",
    localName: "Tamarind (Mkwaju)",
    role: "Dense evergreen shade tree that protects hives from scorching 38°C dryland heatwaves while reviving degraded soils.",
    flowerType: "Yellow-and-red orchid-like blossoms producing aromatic high-sugar nectar.",
    beeImpact:
      "Supplies bees with thick, antioxidant-rich honey stores that prevent colony starvation in dry spells.",
    pollinationNeed:
      "Must have honeybees to transfer pollen across flowers to set fruit pods and produce viable seeds.",
    blooms: "Late dry-season bridging blossoms",
  },
  {
    name: "Balanites aegyptiaca",
    localName: "Desert Date (Mnyara)",
    role: "Spiny, ultra-drought-hardy native tree that thrives where other plants perish, anchoring shifting soils.",
    flowerType:
      "Greenish-yellow fragrant blossoms blooming right when surrounding grasses dry out.",
    beeImpact:
      "Essential emergency forage buffer when other flora is dormant, keeping colonies alive and strong.",
    pollinationNeed:
      "Critically dependent on honeybee visits for cross-pollination to yield oil-rich desert dates.",
    blooms: "Mid-drought emergency blossom flush",
  },
];

export default function PandaMitiPage() {
  const [pledgeTrees, setPledgeTrees] = useState<number>(10);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [pledgeSubmitted, setPledgeSubmitted] = useState(false);

  const planted = 2500;
  const target = 45000;
  const percentage = 5.6;
  const remaining = target - planted;

  const costPerTree = 250; // KES 250 per indigenous sapling nurture
  const beesSavedPerTree = 250;
  const flowersPollinatedPerTree = 5000;

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !donorEmail.trim()) {
      toast.error("Please provide your name and email to pledge seedlings.");
      return;
    }
    setPledgeSubmitted(true);
    toast.success(
      `Thank you ${donorName}! Your pledge to nurture ${pledgeTrees} trees around Kibwezi has been logged. You are helping save ${(pledgeTrees * beesSavedPerTree).toLocaleString()} bees!`,
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Hero Banner */}
      <section className="relative py-16 sm:py-24 overflow-hidden border-b border-border/40">
        <StoryHeroBackground />

        <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold mb-6">
            <Trees className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Tree Restoration • Saving Bee Colonies • Perennial Floral Corridors</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-foreground font-bold">Kibwezi, Kenya</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1] mb-6">
            Reforesting Kibwezi to{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 bg-clip-text text-transparent">
              Save Bees
            </span>{" "}
            &amp; Restore Flowering Canopies
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Panda Miti (<em>"Plant Trees"</em> in Swahili) is BeeYield’s signature ecological
            restoration initiative. We are planting{" "}
            <strong className="text-foreground font-semibold">45,000 indigenous trees</strong>{" "}
            across semi-arid Kibwezi to restore depleted aquifers, save honeybee colonies from
            seasonal famine, and cultivate endless canopies of pollinating flowers that depend on
            bees for life.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm text-muted-foreground max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center p-3 bg-card rounded-2xl border border-border/50 text-center shadow-sm">
              <Trees className="w-5 h-5 text-emerald-500 mb-1" />
              <span className="font-bold text-foreground">45,000 Trees</span>
              <span className="text-[11px] text-muted-foreground">Target Reforestation</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-card rounded-2xl border border-border/50 text-center shadow-sm">
              <Heart className="w-5 h-5 text-amber-500 mb-1" />
              <span className="font-bold text-foreground">184+ Colonies</span>
              <span className="text-[11px] text-muted-foreground">Saved from Starvation</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-card rounded-2xl border border-border/50 text-center shadow-sm">
              <Flower2 className="w-5 h-5 text-teal-500 mb-1" />
              <span className="font-bold text-foreground">50M+ Blossoms</span>
              <span className="text-[11px] text-muted-foreground">Flowers Needing Bees</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-card rounded-2xl border border-border/50 text-center shadow-sm">
              <Sprout className="w-5 h-5 text-emerald-500 mb-1" />
              <span className="font-bold text-foreground">Ecosystem Restoration</span>
              <span className="text-[11px] text-muted-foreground">Youth Beekeeper Nurtured</span>
            </div>
          </div>
        </div>
      </section>

      {/* Progress & Live Telemetry Section */}
      <section className="py-12 sm:py-16 bg-muted/20 border-b border-border/40">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl border border-emerald-500/30 bg-card/90 backdrop-blur-xl p-6 sm:p-10 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-500" /> Live Kibwezi Ecosystem Restoration
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
                  Planting Progress: {planted.toLocaleString()} of {target.toLocaleString()}{" "}
                  Indigenous Trees
                </h2>
              </div>
              <Badge
                variant="outline"
                className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold text-sm px-3.5 py-1"
              >
                {percentage}% Phase 1 Verified
              </Badge>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2 mb-8">
              <div className="h-5 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-emerald-500/25">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 rounded-full transition-all duration-1000 relative shadow-sm"
                  style={{ width: `${percentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-medium px-1">
                <span>Phase 1 Established: 2,500 Flowering Seedlings</span>
                <span>Target Horizon: 45,000 Mature Trees</span>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-border/50">
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border/50 text-center">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  Trees Planting for Ecosystem Restoration
                </p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {planted.toLocaleString()}
                </p>
                <span className="text-[10px] text-muted-foreground">Native acacia &amp; mukau</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border/50 text-center">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  Bees Saved from Famine
                </p>
                <p className="text-xl sm:text-2xl font-black text-amber-500 mt-0.5">11.2M+</p>
                <span className="text-[10px] text-muted-foreground">Across 184+ colonies</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border/50 text-center">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  Pollinating Flowers Fed
                </p>
                <p className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">
                  50M+
                </p>
                <span className="text-[10px] text-muted-foreground">Annual blossom capacity</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border/50 text-center">
                <p className="text-[11px] font-semibold text-muted-foreground">Forage Corridors</p>
                <p className="text-xl sm:text-2xl font-black text-foreground mt-0.5">8 Zones</p>
                <span className="text-[10px] text-muted-foreground">105+ acres revitalized</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative & Strategic Pillars */}
      <section className="py-16 sm:py-20">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-3">
              The Symbiosis: Trees, Bees &amp; Pollinating Flowers
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              When dryland forests disappear, bees starve, flowering plants fail to produce seed,
              and agricultural yields plummet. Panda Miti restores this unbroken biological cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-3xl bg-card border border-border/60 hover:border-emerald-500/40 transition-colors shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <Trees className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">
                  1. Tree Restoration &amp; Aquifers
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Indigenous dryland trees sink taproots 15+ meters deep. They break sun-baked
                  hardpans, draw deep water to the surface, cool microclimates by up to 3.5°C, and
                  create shaded canopies that prevent blooming flowers from drying out under the
                  intense equatorial sun.
                </p>
              </div>
              <div className="pt-3 border-t border-border/40 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Groundwater recharged &amp; desertification halted
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/60 hover:border-amber-500/40 transition-colors shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">
                  2. Saving Bees from Famine
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Prolonged dry seasons in semi-arid Kenya trigger lethal pollen deficits. Staggered
                  plantings of Acacia, Mukau, and Moringa ensure continuous, uninterrupted nectar
                  flows throughout the dry months, completely preventing seasonal colony starvation
                  and absconding.
                </p>
              </div>
              <div className="pt-3 border-t border-border/40 text-xs font-semibold text-amber-500">
                ✓ Over 184+ colonies &amp; wild swarms preserved
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/60 hover:border-teal-500/40 transition-colors shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                  <Flower2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">3. Flowers Needing Bees</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Over 85% of dryland trees, flowering shrubs, and surrounding smallholder crops
                  (mango, avocado, citrus, pigeon peas) cannot reproduce or set fruit without insect
                  pollination. Honeybees deliver the vital pollen transfer that turns flowers into
                  bountiful seeds and harvests.
                </p>
              </div>
              <div className="pt-3 border-t border-border/40 text-xs font-semibold text-teal-600 dark:text-teal-400">
                ✓ 50M+ blossoms fertilized &amp; crops boosted
              </div>
            </div>
          </div>

          {/* Species Showcase with Detailed Pollination Symbiosis */}
          <div className="rounded-3xl bg-card border border-border/70 p-6 sm:p-10 shadow-lg mb-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Flowering Trees Restored &amp; Their Bee Pollination Needs
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Every species is selected for its mutual biological contract: nourishing bees with
                  nectar while relying on bees for cross-pollination.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                100% Native &amp; Drought-Hardy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {richFloraData.map((species, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-muted/30 border border-border/50 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-colors"
                >
                  <div>
                    <div className="font-bold text-foreground text-sm flex items-center gap-1.5 mb-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{species.name}</span>
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-2.5">
                      {species.localName}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {species.role}
                    </p>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-background/60 border border-border/40">
                        <span className="font-bold text-foreground block text-[11px] mb-0.5">
                          🌸 Flower Profile:
                        </span>
                        <span className="text-muted-foreground text-[11px] leading-relaxed block">
                          {species.flowerType}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="font-bold text-amber-600 dark:text-amber-400 block text-[11px] mb-0.5">
                          🐝 How It Saves Bees:
                        </span>
                        <span className="text-muted-foreground text-[11px] leading-relaxed block">
                          {species.beeImpact}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20">
                        <span className="font-bold text-teal-600 dark:text-teal-400 block text-[11px] mb-0.5">
                          🌱 Why Flowers Need Bees:
                        </span>
                        <span className="text-muted-foreground text-[11px] leading-relaxed block">
                          {species.pollinationNeed}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground font-medium flex items-center justify-between">
                    <span>Bloom Timing:</span>
                    <span className="font-bold text-foreground">{species.blooms}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The Closed-Loop Cycle Diagram Card */}
          <div className="rounded-3xl bg-gradient-to-br from-emerald-950/20 via-card to-amber-950/20 border border-border/70 p-6 sm:p-8 mb-16 shadow-md">
            <h4 className="text-center text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">
              The Closed-Loop Ecological Restoration Cycle
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-card/80 border border-border/60">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm mb-2">
                  1
                </div>
                <h5 className="font-bold text-foreground text-xs mb-1">Tree Reforestation</h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Youth beekeepers plant deep-root native trees that restore aquifers and halt
                  erosion.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card/80 border border-border/60">
                <div className="w-10 h-10 mx-auto rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold text-sm mb-2">
                  2
                </div>
                <h5 className="font-bold text-foreground text-xs mb-1">Perennial Flowers Bloom</h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Trees produce millions of seasonal and year-round blossoms with nectar and pollen.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card/80 border border-border/60">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm mb-2">
                  3
                </div>
                <h5 className="font-bold text-foreground text-xs mb-1">Bees Saved from Famine</h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Colonies find abundant forage during peak drought, multiplying hive populations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card/80 border border-border/60">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm mb-2">
                  4
                </div>
                <h5 className="font-bold text-foreground text-xs mb-1">Flowers Pollinated</h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Bees cross-pollinate blossoms, ensuring seed reproduction and farmer fruit yields.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Seedling Pledge Section */}
          <div
            id="support"
            className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-card to-amber-950/20 p-6 sm:p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Pledge or Sponsor Seedlings in Kibwezi
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Every seedling is nurtured by local youth beekeepers for ecosystem restoration
                to guarantee survival and perennial blossom.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-2 pt-1 text-xs">
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-bold border border-emerald-500/20">
                  🌱 1 Tree = ~250 Bees Nourished
                </span>
                <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 px-3 py-1 rounded-full font-bold border border-teal-500/20">
                  🌸 1 Tree = ~5,000 Blossoms Pollinated
                </span>
              </div>
            </div>

            {pledgeSubmitted ? (
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-foreground text-lg">Pledge Registered!</h4>
                <p className="text-xs text-muted-foreground">
                  Our Kibwezi field coordinator will email you with your seedling planting certificate,
                  planting corridor location, and bee impact report.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPledgeSubmitted(false)}
                  className="rounded-xl text-xs"
                >
                  Pledge More Trees
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePledgeSubmit} className="max-w-xl mx-auto space-y-5">
                {/* Seedling quantity selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2 text-center">
                    Select Seedlings to Plant:{" "}
                    <span className="text-foreground text-sm font-black">{pledgeTrees} Trees</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[5, 10, 25, 50].map((count) => (
                      <button
                        type="button"
                        key={count}
                        onClick={() => setPledgeTrees(count)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          pledgeTrees === count
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                            : "bg-background/80 text-muted-foreground border-border hover:border-emerald-500/40"
                        }`}
                      >
                        {count} Trees
                      </button>
                    ))}
                  </div>

                  {/* Impact preview pill */}
                  <div className="p-3 rounded-2xl bg-background/80 border border-border/60 mb-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Field Cost</span>
                      <span className="font-bold text-foreground">
                        KES {(pledgeTrees * costPerTree).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Bees Saved</span>
                      <span className="font-bold text-amber-500">
                        ~{(pledgeTrees * beesSavedPerTree).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10px] block">
                        Flowers Pollinated
                      </span>
                      <span className="font-bold text-teal-500">
                        ~{(pledgeTrees * flowersPollinatedPerTree).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Your Full Name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                    className="rounded-xl bg-background/90"
                  />
                  <Input
                    type="email"
                    placeholder="Your Email Address"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    required
                    className="rounded-xl bg-background/90"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 shadow-xl shadow-emerald-900/30"
                >
                  Pledge {pledgeTrees} Trees for Kibwezi <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

export { PandaMitiPage, PandaMitiPage as PandaMiti };
