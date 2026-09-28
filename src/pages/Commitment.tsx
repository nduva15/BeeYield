import { ArrowRight, Target, Wheat, TreePine, Heart, Users, Droplets, Zap, Building, Globe, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

const CommitmentPage = () => {
  const sdgs = [
    {
      number: 1,
      title: "No Poverty",
      description: "We provide training programs and a sustainable platform for smallholder farmers and youth to earn income through beekeeping, hive management, and pollination services.",
      impact: "50+ farmers trained on bee disease prevention & sustainable agriculture",
      color: "from-red-500 to-red-600",
      icon: Users,
    },
    {
      number: 2,
      title: "Zero Hunger",
      description: "75% of food crops rely on pollinators. Our pollination services directly boost agricultural yields, ensuring food security for communities across Africa.",
      impact: "105 and counting acres pollinated across 1 county (Makueni & counting) for 9+ crops & counting, increasing crop yields by 9–18%",
      color: "from-amber-500 to-amber-600",
      icon: Wheat,
    },
    {
      number: 6,
      title: "Clean Water & Sanitation",
      description: "Restoring local biodiversity through tree planting creates resilient ecosystems that naturally filter water and combat climate change, protecting vital water sources.",
      impact: "2,500+ trees restoring biodiversity & climate resilience",
      color: "from-cyan-500 to-cyan-600",
      icon: Droplets,
    },
    {
      number: 7,
      title: "Affordable & Clean Energy",
      description: "We're exploring solar-powered hive monitoring systems, reducing reliance on fossil fuels while enabling precision beekeeping in off-grid areas.",
      impact: "Solar-powered hive monitoring sensors in development",
      color: "from-yellow-500 to-yellow-600",
      icon: Zap,
    },
    {
      number: 8,
      title: "Decent Work & Economic Growth",
      description: "We create dignified work in rural areas: beekeepers get fair pay and a direct market for their honey.",
      impact: "Creating sustainable livelihoods for rural youth",
      color: "from-rose-600 to-rose-700",
      icon: Building,
    },
    {
      number: 13,
      title: "Climate Action",
      description: "We've planted 2,500+ trees to restore habitats and capture carbon. Our sustainable practices promote biodiversity and build climate resilience.",
      impact: "Estimated 30+ tons CO₂ captured annually",
      color: "from-green-600 to-green-700",
      icon: Globe,
    },
    {
      number: 15,
      title: "Life on Land",
      description: "Reducing bee mortality rates and protecting wild pollinators ensures healthy terrestrial ecosystems. We maintain less than 15% colony loss rate vs. 60% global average.",
      impact: "184 healthy hives across 5-acre restored habitat",
      color: "from-lime-500 to-lime-600",
      icon: TreePine,
    },
    {
      number: 17,
      title: "Partnerships for the Goals",
      description: "We collaborate with strategic partners to scale our impact and share knowledge across borders, building a resilient ecosystem for bees and people.",
      impact: "Partnering with Farmers, ApiSense & Intelligent Hives",
      color: "from-blue-700 to-blue-900",
      icon: Heart,
    },
  ];

  return (
    <BeeYieldPageShell className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 p-0">

            {/* ─────────────────────────────────────────────────────────────
          SDG 15 & PROJECT PANDA MITI: REFORESTATION & BEE POLLINATION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-emerald-50/50 text-neutral-900 relative overflow-hidden border-y border-emerald-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="rounded-3xl p-8 sm:p-12 bg-white border border-emerald-200 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-4 py-1.5 font-bold text-xs uppercase tracking-widest">
                SDG 15: Life on Land • Floral Sanctum & Aquifer Recovery
              </Badge>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kibwezi Basin, Makueni County</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-center mb-8">
              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                  Project Panda Miti: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">45,000 Trees</span> for Kibwezi
                </h2>
                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                  Our flagship ecological restoration initiative restores degraded semi-arid landscapes by propagating 45,000 drought-resilient indigenous trees—including Acacia, Mukau, Moringa, and Baobab. This active reforestation recharges groundwater aquifers, cools microclimates over hives, and eliminates seasonal forage famine for African honeybees.
                </p>
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs sm:text-sm italic">
                  “Every seedling is nurtured by local youth beekeepers and mapped with GPS telemetry to guarantee survival and perennial blossom.”
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-emerald-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-emerald-400" /> Planting Telemetry
                  </span>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-500/10 font-bold text-[11px]">
                    2,500 / 45,000 (5.6%)
                  </Badge>
                </div>

                <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-emerald-500/20">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full w-[5.6%]" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px] pt-2 border-t border-white/10">
                  <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <Trees className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="font-bold text-neutral-900 block">Tree Restoration</span>
                    <span className="text-neutral-500 text-[9px]">Aquifer recharge</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <Heart className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <span className="font-bold text-neutral-900 block">Bees Saved</span>
                    <span className="text-neutral-500 text-[9px]">Zero dry famine</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <Flower2 className="w-4 h-4 text-teal-400 mx-auto mb-1" />
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
              <Button size="lg" asChild className="bg-beeyield-green text-neutral-950 font-bold hover:bg-emerald-400 rounded-full px-8 shadow-xl">
                <Link to="/panda-miti">Explore Project Panda Miti <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


            
      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center bg-card rounded-[3rem] p-12 md:p-16 shadow-2xl border border-border/50 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10">
              Join The <span className="text-primary">Movement</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto relative z-10">
              Whether you're a farmer, investor, or sustainability advocate—there's a place for you in our mission to save bees and secure food systems.
            </p>

            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <Link to="/learn">
                <Button size="lg" className="h-14 px-10 rounded-full font-bold text-base bg-primary hover:bg-primary/90">
                  Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="h-14 px-10 rounded-full font-bold text-base border-2 hover:bg-muted/50">
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </BeeYieldPageShell>
  );
};

export default CommitmentPage;
