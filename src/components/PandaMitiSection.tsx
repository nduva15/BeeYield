import React from "react";
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
  ExternalLink,
  ChevronRight,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PandaMitiSectionProps {
  className?: string;
  compact?: boolean;
}

export const treeSpeciesData = [
  {
    name: "Acacia senegal & tortilis",
    localName: "All-Season Bee Acacia",
    role: "Key nectar source for premium pure acacia honey & natural soil nitrogen fixing",
    blooms: "Biannual flush (dry season resilient)",
  },
  {
    name: "Melia volkensii",
    localName: "Mukau (Dryland Mahogany)",
    role: "Fast-growing indigenous canopy providing crucial hive shade and windbreak",
    blooms: "Abundant sweet floral nectar",
  },
  {
    name: "Moringa oleifera",
    localName: "Ben Oil Tree",
    role: "Continuous high-protein pollen forage for brood rearing and community nutrition",
    blooms: "Year-round flowering",
  },
  {
    name: "African Baobab (Adansonia)",
    localName: "Mbuyu / Keystone Oasis",
    role: "Retains deep groundwater, cools microclimates, and shelters wild pollinator swarms",
    blooms: "Nocturnal white blooms",
  },
];

/**
 * Small, compact container designed specifically for pages like Blogs and Careers
 * Features live progress bar, key metrics, and direct action buttons to the Panda Miti Initiative page.
 */
export const PandaMitiSmallContainer: React.FC<{
  className?: string;
  variant?: "card" | "banner";
}> = ({ className, variant = "card" }) => {
  const planted = 2500;
  const target = 45000;
  const percentage = 5.6;

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-teal-500/10 border border-emerald-500/30 text-left shadow-sm relative overflow-hidden",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Trees className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Panda Miti Initiative • Kibwezi Reforestation</span>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]"
          >
            {planted.toLocaleString()} / {target.toLocaleString()} Trees Planted
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Our ecological mission to plant <strong className="text-foreground">45,000 indigenous and bee-forage trees</strong> across the semi-arid landscape around <strong className="text-emerald-600 dark:text-emerald-400">Kibwezi, Makueni County</strong>. Reviving natural aquifers, cooling microclimates, and safeguarding pollinator corridors.
        </p>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-3 border border-emerald-500/20">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] text-muted-foreground">
          <span>
            Planted: <strong className="text-foreground">2,500</strong> ({percentage}%) • Target: <strong className="text-foreground">45,000</strong>
          </span>
          <div className="flex items-center gap-2">
            <Link
              to="/panda-miti"
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              Explore Panda Miti Page <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-emerald-500/30 bg-card/90 backdrop-blur-md p-5 sm:p-6 shadow-lg relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/5",
        className
      )}
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <Trees className="w-3.5 h-3.5 text-emerald-500" />
          <span>Panda Miti Initiative</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-foreground font-medium">Kibwezi, Kenya</span>
        </div>
        <Badge
          variant="secondary"
          className="w-fit text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20"
        >
          {percentage}% Complete (2,500 / 45,000)
        </Badge>
      </div>

      <div className="space-y-1.5 mb-3.5">
        <h3 className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
          Reforesting Kibwezi for Resilient Bee Corridors
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          BeeYield's direct field commitment to plant 45,000 indigenous and drought-adapted forage trees around Kibwezi Basin, recharging natural aquifers and guaranteeing year-round acacia nectar.
        </p>
      </div>

      {/* Progress meter */}
      <div className="space-y-1.5 mb-4">
        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-emerald-500/20">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>2,500 Planted So Far</span>
          <span className="font-semibold text-foreground">Goal: 45,000 Trees</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-border/60">
        <Button
          asChild
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-600/20"
        >
          <Link to="/panda-miti">
            Explore Panda Miti Page <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 rounded-xl text-xs"
        >
          <Link to="/about">
            Why Kibwezi? <ChevronRight className="ml-1 w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

/**
 * Full Section Component for Marketing & Story pages
 */
export const PandaMitiSection: React.FC<PandaMitiSectionProps> = ({
  className,
  compact = false,
}) => {
  const planted = 2500;
  const target = 45000;
  const percentage = Math.round((planted / target) * 1000) / 10; // 5.6%
  const remaining = target - planted;

  return (
    <section className={cn("relative py-16 md:py-24 overflow-hidden", className)}>
      {/* Subtle nature-inspired background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/5 via-amber-950/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="rounded-3xl border border-emerald-500/20 bg-card/80 backdrop-blur-xl shadow-2xl p-6 sm:p-10 md:p-14 overflow-hidden relative">
          {/* Top Pill / Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold tracking-wide uppercase">
              <Trees className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Panda Miti Initiative</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-foreground font-bold">Reforesting Kibwezi</span>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>Target Region: Kibwezi, Makueni County, Kenya</span>
            </div>
          </div>

          {/* Heading and Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
                Panda Miti: <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">45,000 Trees</span> for Kibwezi
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                Panda Miti (<em>"Plant Trees"</em> in Swahili) is BeeYield's signature ecological restoration initiative. Our direct aim is to plant <strong className="text-foreground">45,000 indigenous and bee-forage trees</strong> across the semi-arid landscape around <strong className="text-emerald-600 dark:text-emerald-400">Kibwezi, Makueni County</strong>.
              </p>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Kibwezi’s unique acacia savannah ecosystem experiences harsh dry spells that jeopardize smallholder harvests and deplete honeybee forage. By establishing continuous agroforestry corridors of drought-hardy acacia, mukau, and flowering flora, Panda Miti revives natural water catchments, combats desertification, and guarantees flourishing nectar corridors for over 184+ colonies and local wild pollinators.
              </p>
            </div>

            {/* Progress Card Container */}
            <div className="lg:col-span-5 bg-gradient-to-br from-emerald-500/10 via-background to-amber-500/10 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 shadow-inner flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-emerald-500" /> Planting Progress
                  </span>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold text-xs"
                  >
                    {percentage}% Completed
                  </Badge>
                </div>

                {/* Big numbers */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                    {planted.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-lg sm:text-xl font-medium">
                    / {target.toLocaleString()} trees
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="space-y-2 mb-6">
                  <div className="h-4 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-emerald-500/20">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 rounded-full transition-all duration-1000 relative shadow-sm"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground font-medium px-1">
                    <span>2,500 Planted So Far</span>
                    <span>Goal: 45,000 Trees</span>
                  </div>
                </div>
              </div>

              {/* Stat badges */}
              <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-border/50 text-xs">
                <div className="bg-background/80 p-2.5 rounded-xl border border-border/40">
                  <div className="text-muted-foreground">Corridor</div>
                  <div className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Kibwezi Basin
                  </div>
                </div>
                <div className="bg-background/80 p-2.5 rounded-xl border border-border/40">
                  <div className="text-muted-foreground">To Target</div>
                  <div className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                    <Trees className="w-3.5 h-3.5 text-amber-500" /> {remaining.toLocaleString()} Left
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Three Story Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <div className="p-5 rounded-2xl bg-card border border-border/60 hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Sun className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground text-base mb-1.5">Why Around Kibwezi?</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Kibwezi is a vital agricultural gateway in Makueni County. Planting 45,000 deep-rooted indigenous trees cools the microclimate, recharges local aquifers, and prevents flash-flood erosion across farm borders.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/60 hover:border-amber-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground text-base mb-1.5">Perennial Bee Pastures</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                BeeYield hives stationed across Kibwezi feed on pesticide-free acacia blooms. Staggered tree flowering eliminates seasonal pollen famine, increasing colony strength and organic honey yields.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/60 hover:border-teal-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground text-base mb-1.5">Community Agroforestry</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                We partner directly with Kibwezi smallholder farmers, schools, and youth beekeeping groups. Seedlings are nurtured locally, providing fodder, gum, and beekeeping income to surrounding families.
              </p>
            </div>
          </div>

          {/* Species List */}
          {!compact && (
            <div className="mb-10 bg-muted/30 rounded-2xl p-5 sm:p-6 border border-border/50">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Trees className="w-4 h-4 text-emerald-500" />
                  Key Tree Species Planted Around Kibwezi
                </h4>
                <span className="text-xs text-muted-foreground">100% Drought-Adapted & Indigenous Flora</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {treeSpeciesData.map((sp, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-card border border-border/40 text-xs">
                    <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{sp.name}</span>
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px] mt-0.5">
                      {sp.localName}
                    </div>
                    <div className="text-muted-foreground mt-1.5 leading-snug">
                      {sp.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to action footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Every tree in Kibwezi is geo-monitored and maintained with local beekeeping partners.</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                asChild
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20"
              >
                <Link to="/panda-miti">
                  View Panda Miti Initiative Page <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl">
                <Link to="/about">Our Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PandaMitiSection;
