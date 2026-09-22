import { useState } from "react";
import { Link } from "@tanstack/react-router";
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
  Calendar,
  Layers,
  Award,
  BookOpen,
  ArrowLeft,
  Share2,
  Droplets,
  Heart,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import beeyieldLogo from "@/assets/beeyield-logo.png";
import { treeSpeciesData } from "@/components/PandaMitiSection";

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

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !donorEmail.trim()) {
      toast.error("Please provide your name and email to pledge seedlings.");
      return;
    }
    setPledgeSubmitted(true);
    toast.success(
      `Thank you ${donorName}! Your pledge to nurture ${pledgeTrees} trees around Kibwezi has been logged.`
    );
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Initiative link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={beeyieldLogo} alt="BeeYield" className="h-8 w-auto transition-transform group-hover:scale-105" />
              <span className="font-display font-bold text-base sm:text-lg text-foreground tracking-tight">
                BeeYield
              </span>
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Trees className="w-3.5 h-3.5" />
              <span>Panda Miti</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/about"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:inline-flex"
            >
              Our Story
            </Link>
            <Link
              to="/blogs"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:inline-flex"
            >
              Field Blogs
            </Link>
            <Link
              to="/careers"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex"
            >
              Careers
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={copyShareLink}
              className="h-8 px-2.5 text-xs rounded-xl border-border"
            >
              <Share2 className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              asChild
              size="sm"
              className="h-8 px-3 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <a href="#support">Plant a Tree</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative py-16 sm:py-24 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-background to-background pointer-events-none" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold mb-6">
            <Trees className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Ecological Reforestation Mission</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-foreground font-bold">Kibwezi, Makueni County</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1] mb-6">
            Panda Miti: <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 bg-clip-text text-transparent">45,000 Trees</span> for Kibwezi
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Panda Miti (<em>"Plant Trees"</em> in Swahili) is BeeYield’s signature ecological restoration initiative. We are planting 45,000 deep-rooted indigenous and bee-forage trees across semi-arid Kibwezi to restore natural aquifers, build perennial bee pastures, and guarantee food security.
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl border border-border/50">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Target: Kibwezi Basin, Kenya</span>
            </div>
            <div className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl border border-border/50">
              <Heart className="w-4 h-4 text-amber-500" />
              <span>184+ Bee Colonies Protected</span>
            </div>
            <div className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl border border-border/50">
              <Globe2 className="w-4 h-4 text-teal-500" />
              <span>100% Indigenous Flora</span>
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
                  <Sprout className="w-4 h-4 text-emerald-500" /> Live Kibwezi Reforestation Telemetry
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
                  Planting Progress: {planted.toLocaleString()} of {target.toLocaleString()} Trees
                </h2>
              </div>
              <Badge
                variant="outline"
                className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold text-sm px-3.5 py-1"
              >
                {percentage}% Completed
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
                <span>Phase 1 Verified: 2,500 Seedlings Established</span>
                <span>Target Horizon: 45,000 Mature Trees</span>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-border/50">
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border/50 text-center">
                <p className="text-[11px] font-semibold text-muted-foreground">Planted &amp; Verified</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {planted.toLocaleString()}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border/50 text-center">
                <p className="text-[11px] font-semibold text-muted-foreground">Remaining to Goal</p>
                <p className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
                  {remaining.toLocaleString()}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border/50 text-center">
                <p className="text-[11px] font-semibold text-muted-foreground">Carbon Captured</p>
                <p className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">
                  3.2+ Tons CO₂
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border/50 text-center">
                <p className="text-[11px] font-semibold text-muted-foreground">Active Seedling Zones</p>
                <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  8 Corridors
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative & Strategic Pillars */}
      <section className="py-16 sm:py-20">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-3">
              Why Kibwezi Needs 45,000 Trees
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Kibwezi is situated in the semi-arid lowlands of Makueni County. While known for rich volcanic soils, rainfall variability and severe dry spells place extreme pressure on honeybee colonies and smallholder crop yields.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-3xl bg-card border border-border/60 hover:border-emerald-500/40 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Aquifer &amp; Microclimate Revival</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Indigenous dryland species sink taproots 15+ meters deep. This breaks compacted hardpans, recharges underground aquifers, lowers ambient daytime temperatures by up to 3.5°C, and prevents flash-flood erosion across farm borders.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/60 hover:border-amber-500/40 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Zero Pollen Famine</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                By staggering species flowering periods between Acacia senegal, Mukau, and Moringa, BeeYield colonies have access to clean, pesticide-free floral nectar throughout the driest months, preventing seasonal colony absconding.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/60 hover:border-teal-500/40 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Smallholder Agroforestry</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Over 40 partner farmers and local youth groups in Kibwezi care for planted seedlings on farm borders. Farmers gain nitrogen-fixing mulch, fodder, and top-tier pollination coverage for their mango, pigeon pea, and citrus crops.
              </p>
            </div>
          </div>

          {/* Species Showcase */}
          <div className="rounded-3xl bg-card border border-border/70 p-6 sm:p-10 shadow-lg mb-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Key Indigenous &amp; Drought-Resilient Flora
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Carefully selected for maximum pollinator nectar yield, drought hardiness, and soil regeneration.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                100% Drought-Adapted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {treeSpeciesData.map((species, i) => (
                <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-foreground text-sm flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{species.name}</span>
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium text-xs mb-2">
                      {species.localName}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {species.role}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground font-medium">
                    🌸 {species.blooms}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SDG Alignment Badges */}
          <div className="rounded-3xl bg-gradient-to-br from-background via-muted/20 to-background border border-border/60 p-6 sm:p-8 mb-16 text-center">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              UN Sustainable Development Goals (SDGs) Championed
            </h4>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { num: "SDG 1", title: "No Poverty", desc: "Farmer training & bee income" },
                { num: "SDG 2", title: "Zero Hunger", desc: "Pollination boosts crop harvest" },
                { num: "SDG 6", title: "Clean Water", desc: "Aquifer replenishment" },
                { num: "SDG 13", title: "Climate Action", desc: "Active CO₂ sequestration" },
                { num: "SDG 15", title: "Life on Land", desc: "Ecosystem restoration" },
                { num: "SDG 17", title: "Partnerships", desc: "ApiSense & local beekeepers" },
              ].map((sdg) => (
                <div
                  key={sdg.num}
                  className="p-3 rounded-2xl bg-card border border-border/60 text-left min-w-[150px] flex-1 max-w-[200px]"
                >
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                    {sdg.num}
                  </span>
                  <span className="text-xs font-bold text-foreground block">{sdg.title}</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">{sdg.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Seedling Pledge Section */}
          <div id="support" className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-card to-amber-950/20 p-6 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Pledge or Sponsor Seedlings in Kibwezi
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every seedling is nurtured by local youth beekeepers and mapped with GPS telemetry to guarantee survival and perennial blossom.
              </p>
            </div>

            {pledgeSubmitted ? (
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-foreground text-lg">Pledge Registered!</h4>
                <p className="text-xs text-muted-foreground">
                  Our Kibwezi field coordinator will email you with your seedling GPS certificate and planting schedule.
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
                    Select Seedlings to Plant: <span className="text-foreground text-sm font-black">{pledgeTrees} Trees</span>
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
                  <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                    <span>Est. Field Cost: KES {(pledgeTrees * costPerTree).toLocaleString()}</span>
                    <span>CO₂ Offset: ~{(pledgeTrees * 0.08).toFixed(1)} Tons</span>
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

      {/* Footer */}
      <footer className="py-12 border-t border-border/40 bg-muted/10 text-center space-y-4">
        <div className="container max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Trees className="w-4 h-4 text-emerald-500" />
            <span>Panda Miti Initiative • BeeYield Ecological Corridors</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">About &amp; Story</Link>
            <Link to="/blogs" className="hover:text-foreground transition-colors">Blogs</Link>
            <Link to="/careers" className="hover:text-foreground transition-colors">Careers</Link>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} BeeYield. 45,000 Trees around Kibwezi, Makueni County, Kenya.
        </p>
      </footer>
    </div>
  );
}
