import React from "react";
import {
  ArrowRight,
  Target,
  Wheat,
  TreePine,
  Heart,
  Users,
  Droplets,
  Zap,
  Building,
  Globe,
  CheckCircle2,
  MapPin,
  Sprout,
  Trees,
  Flower2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoryHeroBackground } from "@/components/StoryHeroBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

// Robust icon component with SVG fallback to guarantee zero ReferenceError
const MapPinIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
};

const CommitmentPage = () => {
  const sdgs = [
    {
      number: 1,
      title: "No Poverty",
      description:
        "We provide training programs and a sustainable platform for smallholder farmers and youth to earn income through beekeeping, hive management, and pollination services.",
      impact: "50+ farmers trained on bee disease prevention & sustainable agriculture",
      color: "from-red-500 to-red-600",
      icon: Users,
    },
    {
      number: 2,
      title: "Zero Hunger",
      description:
        "75% of food crops rely on pollinators. Our pollination services directly boost agricultural yields, ensuring food security for communities across Africa.",
      impact:
        "105 and counting acres pollinated across 1 county (Makueni & counting) for 9+ crops & counting, increasing crop yields by 9–18%",
      color: "from-amber-500 to-amber-600",
      icon: Wheat,
    },
    {
      number: 6,
      title: "Clean Water & Sanitation",
      description:
        "Restoring local biodiversity through tree planting creates resilient ecosystems that naturally filter water and combat climate change, protecting vital water sources.",
      impact: "2,500+ trees restoring biodiversity & climate resilience",
      color: "from-cyan-500 to-cyan-600",
      icon: Droplets,
    },
    {
      number: 7,
      title: "Affordable & Clean Energy",
      description:
        "We're exploring solar-powered hive monitoring systems, reducing reliance on fossil fuels while enabling precision beekeeping in off-grid areas.",
      impact: "Solar-powered hive monitoring sensors in development",
      color: "from-yellow-500 to-yellow-600",
      icon: Zap,
    },
    {
      number: 8,
      title: "Decent Work & Economic Growth",
      description:
        "We create dignified work in rural areas: beekeepers get fair pay and a direct market for their honey.",
      impact: "Creating sustainable livelihoods for rural youth",
      color: "from-rose-600 to-rose-700",
      icon: Building,
    },
    {
      number: 13,
      title: "Climate Action",
      description:
        "We've planted 2,500+ trees to restore habitats and capture carbon. Our sustainable practices promote biodiversity and build climate resilience.",
      impact: "Estimated 30+ tons CO₂ captured annually",
      color: "from-green-600 to-green-700",
      icon: Globe,
    },
    {
      number: 15,
      title: "Life on Land",
      description:
        "Reducing bee mortality rates and protecting wild pollinators ensures healthy terrestrial ecosystems. We maintain less than 15% colony loss rate vs. 60% global average.",
      impact: "184 healthy hives across 5-acre restored habitat",
      color: "from-lime-500 to-lime-600",
      icon: TreePine,
    },
    {
      number: 17,
      title: "Partnerships for the Goals",
      description:
        "We collaborate with strategic partners to scale our impact and share knowledge across borders, building a resilient ecosystem for bees and people.",
      impact: "Partnering with Farmers, ApiSense & Intelligent Hives",
      color: "from-blue-700 to-blue-900",
      icon: Heart,
    },
  ];

  return (
    <BeeYieldPageShell className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 p-0">
      {/* Hero Header */}
      <section className="py-20 md:py-28 relative overflow-hidden border-b border-border/40">
        <StoryHeroBackground />
        <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center space-y-6">
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            🌿 United Nations Sustainable Development Goals
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-tight">
            Our Commitment <br />
            <span className="text-emerald-700">To The Future</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-600 font-medium leading-relaxed">
            At BeeYield, our mission is intrinsically linked to global sustainability. Through data-driven apiculture, indigenous reforestation, and precision pollination, we actively advance 8 UN Sustainable Development Goals.
          </p>
        </div>
      </section>

      {/* SDGs Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-3xl font-black md:text-4xl text-foreground">
              Advancing 8 UN Sustainable Development Goals
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              Every hive deployed and every tree planted supports systemic social and environmental progress.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {sdgs.map((sdg) => {
              const Icon = sdg.icon;
              return (
                <Card key={sdg.number} className="overflow-hidden border border-border/60 hover:shadow-lg transition-all flex flex-col justify-between bg-card">
                  <div className={`h-2 bg-gradient-to-r ${sdg.color}`} />
                  <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-foreground">SDG {sdg.number}</span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-foreground leading-snug">{sdg.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{sdg.description}</p>
                    </div>
                    <div className="pt-3 border-t border-border/50">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                        Impact Metric:
                      </span>
                      <p className="text-xs font-semibold text-foreground/90 mt-0.5">{sdg.impact}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden z-10 bg-secondary/10">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center bg-card rounded-[2.5rem] p-10 md:p-14 shadow-2xl border border-border/50 relative overflow-hidden">
            <h2 className="text-3xl md:text-5xl font-black mb-4 relative z-10 text-foreground">
              Join The <span className="text-primary">Movement</span>
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto relative z-10">
              Whether you're a farmer, investor, or sustainability advocate—there's a place for you in our mission to save bees and secure food systems.
            </p>

            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <Link to="/blogs">
                <Button size="lg" className="h-12 px-8 rounded-full font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                  Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="h-12 px-8 rounded-full font-bold text-sm border-2 hover:bg-muted/50">
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SDG 15 & PROJECT PANDA MITI: REFORESTATION & BEE POLLINATION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-emerald-50/50 text-neutral-900 relative overflow-hidden border-b border-emerald-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="rounded-3xl p-8 sm:p-12 bg-white border border-emerald-200 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <Badge className="bg-emerald-500/20 text-emerald-800 border-emerald-500/30 px-4 py-1.5 font-bold text-xs uppercase tracking-widest">
                SDG 15: Life on Land • Floral Sanctum & Aquifer Recovery
              </Badge>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-semibold">
                <MapPinIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kibwezi Basin, Makueni County</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-center mb-8">
              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                  Project Panda Miti:{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600">
                    45,000 Trees
                  </span>{" "}
                  for Kibwezi
                </h2>
                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                  Our flagship ecological restoration initiative restores degraded semi-arid landscapes by propagating 45,000 drought-resilient indigenous trees—including Acacia, Mukau, Moringa, and Baobab. This active reforestation recharges groundwater aquifers, cools microclimates over hives, and eliminates seasonal forage famine for African honeybees.
                </p>
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs sm:text-sm italic">
                  “Every seedling is nurtured by local youth beekeepers for ecosystem restoration to guarantee survival and perennial blossom.”
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-emerald-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-emerald-600" /> Planting Progress
                  </span>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-800 bg-emerald-500/10 font-bold text-[11px]">
                    2,500 / 45,000 (5.6%)
                  </Badge>
                </div>

                <div className="h-3 w-full bg-neutral-200 rounded-full overflow-hidden p-0.5 border border-emerald-500/20">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full w-[5.6%]" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px] pt-2 border-t border-neutral-100">
                  <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <Trees className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span className="font-bold text-neutral-900 block">Tree Restoration</span>
                    <span className="text-neutral-500 text-[9px]">Aquifer recharge</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <Heart className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <span className="font-bold text-neutral-900 block">Bees Saved</span>
                    <span className="text-neutral-500 text-[9px]">Zero dry famine</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <Flower2 className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                    <span className="font-bold text-neutral-900 block">Flowers Needing Bees</span>
                    <span className="text-neutral-500 text-[9px]">Cross-pollination</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-emerald-100">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                  🌱 1 Tree = ~250 Bees Nourished
                </span>
                <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                  🌸 1 Tree = ~5,000 Blossoms Pollinated
                </span>
              </div>
              <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full px-8 shadow-xl shadow-emerald-900/10">
                <Link to="/panda-miti">
                  Explore Project Panda Miti <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default CommitmentPage;
