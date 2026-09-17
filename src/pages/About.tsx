import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  TreePine,
  Droplets,
  Bug,
  Wifi,
  Users,
  Award,
  TrendingUp,
  MapPin,
  Calendar,
  ChevronDown,
  ArrowRight,
  Leaf,
  Heart,
  Hexagon,
  Scale,
  Thermometer,
  Volume2,
  Globe,
  Sprout,
  BookOpen,
} from "lucide-react";
import beeyieldLogo from "@/assets/beeyield-logo.png";

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */
function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration, startOnView]);

  return { count, ref };
}

/* ------------------------------------------------------------------ */
/*  Fade-in-on-scroll wrapper                                          */
/* ------------------------------------------------------------------ */
function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Year data                                                          */
/* ------------------------------------------------------------------ */
interface YearMilestone {
  year: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  color: string;
  stats: { label: string; value: string }[];
  highlights: string[];
  quote?: string;
}

const TIMELINE: YearMilestone[] = [
  {
    year: "2020",
    title: "Humble Beginnings",
    subtitle: "4 hives, ¼ acre, and a dream",
    image: "/images/story/2020-humble-beginnings.jpg",
    imageAlt: "Our first 4 hives on a quarter acre in rural Kenya — where it all started",
    color: "from-amber-600 to-yellow-500",
    stats: [
      { label: "Hives", value: "4 → 20" },
      { label: "Honey Harvested", value: "40 kg" },
      { label: "Land", value: "¼ acre" },
    ],
    highlights: [
      "Received 4 hives from our father — our entire inheritance and the seed of BeeYield",
      "Timothy was in his 2nd year studying Finance & Marketing at Strathmore University",
      "We were only keeping bees for the honey — no grand plans, just ambition and hope",
      "Grew from 4 to 20 hives by year-end through pure grit",
      "First harvest: 40 kg of pure, traceable honey sold entirely through word of mouth",
      "Zero external funding — every shilling came from honey sales and personal savings",
    ],
    quote:
      "We had nothing but 4 hives, a quarter acre of land, and the stubborn belief that we could build something extraordinary from it.",
  },
  {
    year: "2021",
    title: "Bigger Ambitions",
    subtitle: "35 hives, first acre, first trees planted",
    image: "/images/story/2021-growing-apiary.jpg",
    imageAlt: "Growing our apiary — 35 hives and our first tree-planting initiative",
    color: "from-green-600 to-emerald-500",
    stats: [
      { label: "Hives", value: "35" },
      { label: "Honey Sold", value: "70 kg" },
      { label: "Land Acquired", value: "1 acre" },
      { label: "Trees Planted", value: "76" },
    ],
    highlights: [
      "Set ambitious goal of 35 hives and 70 kg of honey — and hit both targets",
      "Acquired our first full acre of land using only honey sale proceeds and savings",
      "Planted 76 trees — mostly acacia, neem, and sunflower — to make our land bee-friendly",
      "Identified water and packaging as our biggest challenges — issues we're still solving today",
      "Maintained our commitment to harvesting only 50% of honey, leaving the rest for the bees",
      "Still zero investors — still word of mouth only — still reinvesting everything",
    ],
  },
  {
    year: "2022",
    title: "The Team Forms",
    subtitle: "3 siblings, 1 mission — 95 kg harvested",
    image: "/images/story/2022-team-formation.jpg",
    imageAlt: "Timothy, Agatha, and Carole — the three siblings behind BeeYield",
    color: "from-blue-600 to-indigo-500",
    stats: [
      { label: "Hives", value: "45" },
      { label: "Honey Sold", value: "95 kg" },
      { label: "Land Total", value: "2.5 acres" },
      { label: "Yield/Hive", value: "2 kg (50%)" },
    ],
    highlights: [
      "Agatha and Carole joined the dream — both Strathmore University graduates",
      "Agatha brought IT expertise; Carole brought Project Management and Sales/Finance skills",
      "BeeYield became a true family operation — three siblings, three different skill sets, one mission",
      "Harvested 95 kg from 45 hives — averaging 2 kg per hive while only harvesting 50%",
      "Acquired another acre, bringing total land to 2.5 acres — all from honey money",
      "This was the year BeeYield stopped being a hobby and became a company",
    ],
    quote:
      "When my sisters joined, everything changed. Agatha saw the data opportunity. Carole saw the business. I saw the future. Together, we saw BeeYield.",
  },
  {
    year: "2023",
    title: "The Fruitful Year",
    subtitle: "150 kg of traceable honey — linear, steady growth",
    image: "/images/story/2023-fruitful-year.jpg",
    imageAlt: "150 kg of pure traceable honey — our most fruitful year of linear growth",
    color: "from-amber-500 to-orange-500",
    stats: [
      { label: "Hives", value: "75" },
      { label: "Honey Sold", value: "150 kg" },
      { label: "Land Total", value: "3.5 acres" },
      { label: "Trees Planted", value: "113" },
    ],
    highlights: [
      "Our most fruitful year yet — 150 kg of pure, traceable honey from 75 hives",
      "Growth remained linear and steady: hives doubled, honey doubled, trust doubled",
      "Timothy graduated from Strathmore with a Second Class Honours in Finance & Marketing",
      "Timothy got employed and saved almost his entire salary to fuel BeeYield's growth",
      "Reinvested all profits to acquire another acre — total land now 3.5 acres",
      "Planted 113 more trees to continue building our bee-friendly ecosystem",
      "Traceability journey — Timothy built the documentation system from day one",
    ],
  },
  {
    year: "2024",
    title: "Our Best Harvest Yet",
    subtitle: "210 kg harvested — domain acquired — digital ambitions begin",
    image: "/images/story/2024-best-year.jpg",
    imageAlt: "210 kg harvest — our best year yet, with hives stretching across 5 acres",
    color: "from-yellow-500 to-amber-600",
    stats: [
      { label: "Hives", value: "105+" },
      { label: "Honey Sold", value: "210 kg" },
      { label: "Land Total", value: "5 acres" },
      { label: "Trees Planted", value: "250+" },
    ],
    highlights: [
      "Best harvest year — 210 kg of honey, our highest volume to date",
      "Acquired 30 more hives, pushing our colony count past 100",
      "Reinvested revenue in acquiring 1.5 more acres — total land now 5 acres, fully fenced",
      "Planted 250+ more trees, deepening our commitment to biodiversity",
      "Secured beeyield.com domain and hosting — the digital chapter begins",
      "Paid for professional harvesting and hive treatments for the first time",
      "All funded by honey sales and Timothy's salary — still zero external investment",
    ],
    quote:
      "Every kilogram of honey we sold went right back into the ground — more land, more hives, more trees. We were building something bigger than a honey business.",
  },
  {
    year: "2025",
    title: "The Pivot — Protecting Our Bees",
    subtitle: "Crisis breeds innovation — from honey to precision pollination",
    image: "/images/story/2025-iot-pivot.jpg",
    imageAlt:
      "IoT sensors deployed on hives — the moment BeeYield pivoted to precision pollination",
    color: "from-red-500 to-rose-600",
    stats: [
      { label: "Honey Harvested", value: "240 kg" },
      { label: "Pollination Started", value: "July 28" },
      { label: "Farmer Partners", value: "40" },
      { label: "Part-Time Staff", value: "2" },
    ],
    highlights: [
      "Timothy quit his job to focus full-time on the hives — colonies were dying from nearby pesticide use",
      "Nearby farms using pesticides devastated our colonies — the crisis that changed everything",
      "Timothy discovered Bee Hero, Apisense, and Intelligent Hives — and reached out to all of them",
      "July 28th: BeeYield pivoted from honey-only to precision pollination as a primary revenue stream",
      "Started pollination using traditional methods on family and neighbor farms — noticed real yield improvements",
      "Timothy began building beeyield.com webapp and learning IoT, leveraging his Strathmore IT diploma",
      "Managed to harvest 150+ kg despite colony losses — all documented in our traceability system",
      "Hired Peter George and Ngumbau as part-time employees for field work, farmer partnerships, and harvesting",
      "Started the farmer partner program in late 2025 — 40 farmers enrolled for hive checkups, harvesting, and education",
      "Timothy also graduated his diploma in IT from Strathmore — now armed with Finance, Marketing, and IT",
    ],
    quote:
      "When we started losing bees to pesticides, I knew we had two choices: give up or innovate. We chose to protect them. That's when BeeYield truly became what it was meant to be.",
  },
  {
    year: "2026",
    title: "The Technology Year",
    subtitle: "22 IoT devices, 95 and counting acres pollinated, global partnerships",
    image: "/images/story/2025-iot-pivot.jpg",
    imageAlt:
      "2026 — IoT devices deployed, global partnerships with Apisense and Intelligent Hives",
    color: "from-violet-600 to-purple-500",
    stats: [
      { label: "IoT Devices", value: "22" },
      { label: "Acres Pollinated", value: "95+ & Counting" },
      { label: "Data Points/Day", value: "2,000+ & Growing" },
      { label: "Honey to Date", value: "988 kg" },
    ],
    highlights: [
      "June 12th: Official partnership with Apisense.io (Poland) — their Global Field Partner Program for disease detection IoT",
      "Received 20 in-hive devices, 1 in-land device, and 2 weight sensors from Apisense",
      "June 23rd: Partnership with Intelligent Hives (Poland) — first precision pollination in-land device and weight scale",
      "Intelligent Hives prototype became our first operational precision pollination prototype",
      "Devices collect temperature, weight, humidity, pressure, outside temp, colony state, and Varroa detection",
      "Also detect Asian hornets — proven incredibly useful for colony protection",
      "Collecting over 2,000 data points daily and growing across all sensor categories — unprecedented for a Kenyan operation",
      "3 farmers enrolled in IoT device program with 22 devices working in hives right now",
      "Pollinated 95 and counting acres — started with a goal of 15 acres, exceeded by 6x",
      "Mango bloom season in Makueni, Kenya — targeting 150 acres before year-end",
      "9–18% average yield increase for pollinated farms",
      "Built Bee LLM and bee sound analysis — trained on 350K+ bee sounds via Kaggle for disease detection",
      "Started mobile app development on August 3rd for full audience experience",
      "203 kg honey harvested so far this year, bringing total to 988 kg lifetime",
      "Managing 205+ additional hives from partner farmers",
      "Planted 1,500 trees total, started own nursery for apiary and partner apiaries",
      "Got water to apiary (bucket storage — borehole still a dream)",
      "3 tons of CO₂ offset through our tree planting program",
      "Timothy enrolled in his 3rd degree — a Private Pilot License in Aviation",
      "Pollination revenue: $550 USD | Honey sales: $3,000+ USD — all reinvested",
      "Marketing launch planned for September 14th, 2026 — the world is about to hear from us",
    ],
    quote:
      "988 kg of honey from a 3-person team that's never branded a jar, never ran an ad, never took a cent from investors. All word of mouth. Imagine what happens when we actually start marketing.",
  },
];

/* ------------------------------------------------------------------ */
/*  Impact Metrics                                                     */
/* ------------------------------------------------------------------ */
const IMPACT_STATS = [
  { icon: Hexagon, label: "Hives Owned", value: 184, suffix: "" },
  { icon: Scale, label: "Honey Sold (kg)", value: 988, suffix: " kg" },
  { icon: Users, label: "Partner Farmers", value: 40, suffix: "" },
  { icon: MapPin, label: "Acres Pollinated & Counting", value: 95, suffix: "+" },
  { icon: Wifi, label: "IoT Devices Active", value: 22, suffix: "" },
  { icon: TreePine, label: "Trees Planted", value: 1500, suffix: "+" },
  { icon: Leaf, label: "CO₂ Offset", value: 3, suffix: " tons" },
  { icon: Globe, label: "Global Partners", value: 2, suffix: "" },
];

function ImpactStatCard({ stat }: { stat: (typeof IMPACT_STATS)[number] }) {
  const { count, ref } = useCountUp(stat.value, 2000);
  return (
    <div
      ref={ref}
      className="text-center p-4 rounded-2xl border border-border bg-card hover:border-amber-500/30 hover:shadow-[0_0_20px_hsl(38_95%_52%/0.1)] transition-all duration-300"
    >
      <stat.icon className="w-5 h-5 text-amber-500 mx-auto mb-2" />
      <div className="font-display text-xl font-bold text-foreground">
        {count}
        {stat.suffix}
      </div>
      <div className="text-[11px] text-muted-foreground leading-tight mt-1">{stat.label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function About() {
  const [activeYear, setActiveYear] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(24,12%,7%)] via-[hsl(28,30%,10%)] to-[hsl(24,12%,7%)]" />
        <div className="absolute inset-0 opacity-[0.06]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern
              id="hero-hex"
              x="0"
              y="0"
              width="20"
              height="17.32"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="10,0 20,5.77 20,17.32 10,23.09 0,17.32 0,5.77"
                fill="none"
                stroke="hsl(38 95% 52%)"
                strokeWidth="0.3"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#hero-hex)" />
          </svg>
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <FadeIn>
            <img
              src={beeyieldLogo}
              alt="BeeYield Logo"
              className="w-20 h-20 mx-auto mb-8 drop-shadow-lg"
            />
          </FadeIn>
          <FadeIn delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium mb-6">
              <Heart className="w-4 h-4" /> Established 2020 • Kibwezi &amp; Makueni, Kenya
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-amber-100 mb-3">
              From 4 Hives to{" "}
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                184
              </span>
            </h1>
            <p className="font-display text-lg sm:text-xl md:text-2xl text-amber-300/90 font-semibold mb-6">
              Precision Pollination &amp; Honey Traceability in Makueni &amp; Kibwezi
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <p className="text-lg md:text-xl text-amber-200/70 leading-relaxed max-w-2xl mx-auto mb-8">
              Three siblings. A quarter acre to five fenced acres. Zero external funding — just pure
              grit, savings, and a 50% ethical harvest promise. Reimagining the future of African
              apiculture through IoT and AI.
            </p>
          </FadeIn>
          <FadeIn delay={400}>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-amber-300/60">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Kibwezi &amp; Makueni, Kenya
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Est. 2020
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Timothy • Agatha • Carole
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Link
                to="/blogs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md"
              >
                <BookOpen className="w-3.5 h-3.5" /> Read Field Blogs (4 Dispatches)
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-amber-500/30 hover:bg-amber-500/10 text-amber-300 font-semibold text-xs transition-all"
              >
                Launch BeeGPT AI →
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={500}>
            <a
              href="#timeline"
              className="inline-flex flex-col items-center mt-12 text-amber-400/50 hover:text-amber-400 transition-colors"
            >
              <span className="text-xs mb-2">Scroll to explore</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  IMPACT STATS BAR                                             */}
      {/* ============================================================ */}
      <section className="relative py-16 bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-amber-600/10 border-y border-amber-500/10">
        <div className="container mx-auto px-4">
          <FadeIn>
            <h2 className="font-display text-2xl font-bold text-center mb-2 text-foreground">
              Where We Stand Today
            </h2>
            <p className="text-center text-muted-foreground text-sm mb-10">
              September 2026 — every number funded by honey sales and savings alone
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {IMPACT_STATS.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 80}>
                <ImpactStatCard stat={stat} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  WHO WE ARE                                                    */}
      {/* ============================================================ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <FadeIn>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
              Who We Are &amp; What We Stand For
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              Three siblings, one mission: modernizing pollination in Kenya and beyond.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Heart,
                title: "Family-Driven Innovation",
                desc: "Founded by siblings Timothy (Finance, Marketing & IT — Strathmore University), Agatha (IT — Strathmore), and Carole (Project Management & Sales/Finance — Strathmore). Combining agricultural passion with world-class education and relentless work ethic.",
                color: "text-rose-400",
              },
              {
                icon: Sprout,
                title: "Guardians of Biodiversity",
                desc: "With 1,500+ indigenous trees planted, our own nursery, and 3 tons of carbon offset, we're ecosystem builders committed to long-term ecological restoration. We only harvest 50% of our honey — the bees always eat first.",
                color: "text-green-400",
              },
              {
                icon: Wifi,
                title: "Precision Pollination",
                desc: "22 IoT devices deployed, over 2,000 data points daily and growing, real-time temperature, weight, humidity, pressure, colony state, Varroa detection, and Asian hornet alerts. We use data to protect bees and maximize yields for Kenyan smallholders.",
                color: "text-blue-400",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 100}>
                <div className="p-6 rounded-2xl border border-border bg-card hover:border-amber-500/20 transition-all duration-300 h-full">
                  <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
                  <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Revenue & Reinvestment */}
          <FadeIn>
            <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <h3 className="font-display text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Revenue — 100% Reinvested
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">Honey Sales: $3,000+ USD</span>{" "}
                    — 988 kg sold through word of mouth alone. Never branded, never packaged, never
                    advertised. All profits reinvested in land, hives, trees, and research.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">
                      Pollination Revenue: $550 USD
                    </span>{" "}
                    — 95+ acres pollinated since July 2025. 18% average yield increase. Mango bloom
                    season ongoing — targeting 150 acres and 25%+ yield improvement.
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  YEAR-BY-YEAR TIMELINE                                        */}
      {/* ============================================================ */}
      <section
        id="timeline"
        className="py-20 bg-gradient-to-b from-background via-card to-background scroll-mt-20"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <FadeIn>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-2">
              Our Journey — Year by Year
            </h2>
            <p className="text-center text-muted-foreground max-w-xl mx-auto mb-16">
              From 4 hives on a quarter acre to 184 hives, 22 IoT devices, and global partnerships —
              in less than 6 years.
            </p>
          </FadeIn>

          {/* Year navigation pills */}
          <FadeIn>
            <div className="flex flex-wrap justify-center gap-2 mb-16">
              {TIMELINE.map((yr) => (
                <a
                  key={yr.year}
                  href={`#year-${yr.year}`}
                  onClick={() => setActiveYear(yr.year)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 ${
                    activeYear === yr.year
                      ? "bg-amber-500 text-black border-amber-500"
                      : "border-border text-muted-foreground hover:border-amber-500/50 hover:text-foreground"
                  }`}
                >
                  {yr.year}
                </a>
              ))}
            </div>
          </FadeIn>

          {/* Timeline entries */}
          <div className="space-y-24">
            {TIMELINE.map((yr, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={yr.year} id={`year-${yr.year}`} className="scroll-mt-28">
                  <FadeIn>
                    {/* Year badge */}
                    <div className="flex items-center justify-center mb-8">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
                      <div
                        className={`mx-4 px-6 py-2 rounded-full bg-gradient-to-r ${yr.color} text-white font-display text-2xl font-bold shadow-lg`}
                      >
                        {yr.year}
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
                    </div>
                  </FadeIn>

                  <div
                    className={`grid lg:grid-cols-2 gap-8 items-start ${isEven ? "" : "lg:direction-rtl"}`}
                  >
                    {/* Image */}
                    <FadeIn delay={100} className={isEven ? "" : "lg:order-2"}>
                      <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-border">
                        <img
                          src={yr.image}
                          alt={yr.imageAlt}
                          className="w-full h-64 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-display text-xl font-bold text-white">{yr.title}</h3>
                          <p className="text-white/70 text-sm">{yr.subtitle}</p>
                        </div>
                      </div>
                    </FadeIn>

                    {/* Content */}
                    <FadeIn delay={200} className={isEven ? "" : "lg:order-1"}>
                      <div className="space-y-6">
                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {yr.stats.map((stat) => (
                            <div
                              key={stat.label}
                              className="p-3 rounded-xl border border-border bg-card text-center"
                            >
                              <div className="font-display text-lg font-bold text-amber-400">
                                {stat.value}
                              </div>
                              <div className="text-[11px] text-muted-foreground">{stat.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Highlights */}
                        <ul className="space-y-2">
                          {yr.highlights.map((h, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Quote */}
                        {yr.quote && (
                          <blockquote className="border-l-2 border-amber-500/50 pl-4 italic text-sm text-muted-foreground">
                            "{yr.quote}"
                            <footer className="mt-1 text-xs text-amber-500/70 not-italic">
                              — Timothy, Co-founder
                            </footer>
                          </blockquote>
                        )}
                      </div>
                    </FadeIn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TECHNOLOGY & IoT SECTION                                     */}
      {/* ============================================================ */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <FadeIn>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
              Our Technology Stack
            </h2>
            <p className="text-center text-muted-foreground max-w-xl mx-auto mb-12">
              From traditional beekeeping to precision agriculture powered by IoT, AI, and data
              science.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Thermometer,
                title: "Temperature Monitoring",
                desc: "Real-time in-hive and outside temperature tracking for colony health assessment",
                color: "text-red-400",
              },
              {
                icon: Scale,
                title: "Weight Telemetry",
                desc: "Continuous under-hive weight sensors detect honey flow, swarming, and foraging patterns",
                color: "text-blue-400",
              },
              {
                icon: Droplets,
                title: "Humidity & Pressure",
                desc: "Environmental monitoring for optimal brood development and honey curing conditions",
                color: "text-cyan-400",
              },
              {
                icon: Bug,
                title: "Varroa Detection",
                desc: "IoT-powered Varroa mite detection — our biggest win in colony protection",
                color: "text-amber-400",
              },
              {
                icon: Volume2,
                title: "Bee Sound Analysis",
                desc: "Trained on 350K+ bee sounds via Kaggle — acoustic disease detection and colony mood",
                color: "text-green-400",
              },
              {
                icon: Globe,
                title: "Asian Hornet Alerts",
                desc: "In-hive detection of invasive Asian hornets — critical for African bee colony defense",
                color: "text-purple-400",
              },
            ].map((tech, i) => (
              <FadeIn key={tech.title} delay={i * 80}>
                <div className="p-5 rounded-2xl border border-border bg-background hover:border-amber-500/20 transition-all duration-300">
                  <tech.icon className={`w-6 h-6 ${tech.color} mb-3`} />
                  <h4 className="font-semibold text-foreground mb-1">{tech.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tech.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Partnerships */}
          <FadeIn>
            <div className="mt-12 p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5">
              <h3 className="font-display text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" /> Global Partnerships — 2026
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="font-semibold text-foreground mb-1">🇵🇱 Apisense.io — Poland</div>
                  <p className="text-xs text-muted-foreground">
                    Global Field Partner Program for disease detection IoT. 20 in-hive devices, 1
                    in-land device, 2 weight sensors deployed. Partnership signed June 12th, 2026.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="font-semibold text-foreground mb-1">
                    🇵🇱 Intelligent Hives — Poland
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Precision pollination in-land devices, weight scale, and in-hive device. First
                    operational prototype for precision pollination. Partnership signed June 23rd,
                    2026.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  POLLINATION JOURNEY                                          */}
      {/* ============================================================ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <FadeIn>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
              Our Pollination Journey
            </h2>
            <p className="text-center text-muted-foreground max-w-xl mx-auto mb-12">
              From traditional hive-moving to intelligent hive precision pollination.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8">
            <FadeIn>
              <div className="p-6 rounded-2xl border border-border bg-card h-full">
                <h3 className="font-display text-lg font-bold mb-4">Traditional → Precision</h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Our pollination journey started with traditional methods — physically moving
                    hives to client farms and letting nature do its work. We successfully pollinated{" "}
                    <strong className="text-foreground">95+ acres</strong> of farmland, proving the
                    value of managed pollination services in Kenya.
                  </p>
                  <p>
                    Today, BeeYield uses continuous under-hive weight telemetry, acoustic
                    monitoring, and climate tracking to deliver transparent pollination results. Our{" "}
                    <strong className="text-foreground">18% yield increase</strong> target is
                    already being achieved, with ambitions to push past 25%.
                  </p>
                  <p>
                    It's mango bloom season in{" "}
                    <strong className="text-foreground">Makueni, Kenya</strong> — we're aiming to
                    hit <strong className="text-foreground">150 acres</strong> by year-end.
                  </p>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="p-6 rounded-2xl border border-green-500/20 bg-green-500/5 h-full">
                <h3 className="font-display text-lg font-bold text-green-400 mb-4">
                  Partner Farmer Impact
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Our partner farmers have seen significant increases in honey harvests after
                    adopting our
                    <strong className="text-foreground"> no-pesticides, no-smoke</strong> approach
                    and modern harvesting techniques.
                  </p>
                  <p>
                    We manage <strong className="text-foreground">205+ additional hives</strong>{" "}
                    from partner farmers, providing hive checkups, honey harvesting, and education
                    on bee diseases and apiary management.
                  </p>
                  <p>
                    The challenge remains financing — most partner farmers still use traditional
                    harvesting methods. But the results speak for themselves: healthier colonies,
                    more honey, better yields.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  THE TEAM                                                      */}
      {/* ============================================================ */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <FadeIn>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              The Team Behind BeeYield
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                name: "Timothy Nduva",
                role: "Co-Founder • CEO & Operations",
                education:
                  "BSc Finance & Marketing, Diploma IT — Strathmore University | Private Pilot License (in progress)",
                desc: "The builder. Quit his job to save the bees. Built the platform, learned IoT, reached out to global partners, and manages daily field operations. Currently pursuing his 3rd degree in Aviation.",
                image: "/images/timothy-nduva.png",
              },
              {
                name: "Agatha Nduva",
                role: "Co-Founder • CTO & Data Systems",
                education: "Strathmore University Graduate — IT",
                desc: "The technologist. Brings deep IT expertise to BeeYield's telemetry data systems and digital infrastructure. Architects data security, backend ingestion, and system integrity.",
                emoji: "👩‍💻",
              },
              {
                name: "Carole Nduva",
                role: "Co-Founder • COO & Growth",
                education: "Strathmore University Graduate — Project Management & Sales/Finance",
                desc: "The strategist. Manages farmer partnerships, operational expansion, project planning, and financial growth. Her leadership is core to every community apiary partnership.",
                emoji: "👩‍💼",
              },
            ].map((member, i) => (
              <FadeIn key={member.name} delay={i * 100}>
                <div className="p-6 rounded-2xl border border-border bg-background text-center hover:border-amber-500/20 transition-all duration-300 h-full flex flex-col">
                  {member.image ? (
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-amber-500/40 shadow">
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover object-center" />
                    </div>
                  ) : (
                    <div className="text-4xl mb-3">{member.emoji}</div>
                  )}
                  <h3 className="font-display text-xl font-bold">{member.name}</h3>
                  <div className="text-xs text-amber-500 font-medium mb-2">{member.role}</div>
                  <div className="text-[10px] text-muted-foreground italic mb-3">
                    {member.education}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {member.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card">
                <h4 className="font-semibold text-sm mb-2">🤝 Field Team</h4>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Peter George</strong> and{" "}
                  <strong className="text-foreground">Ngumbau</strong> — part-time employees since
                  July 28th, 2025. They handle field work, farmer partnerships, and harvesting
                  operations.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <h4 className="font-semibold text-sm mb-2">🌍 What's Next</h4>
                <p className="text-xs text-muted-foreground">
                  Marketing launch:{" "}
                  <strong className="text-foreground">September 14th, 2026</strong>. Mobile app in
                  development since August 3rd. We want to give our audience the full experience —
                  not half-done things. The world is about to hear from BeeYield.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BY THE NUMBERS — HONEY JOURNEY                               */}
      {/* ============================================================ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <FadeIn>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
              The Honey Journey — By the Numbers
            </h2>
            <p className="text-center text-muted-foreground max-w-lg mx-auto mb-12">
              We only harvest 50% of our honey. If we harvested 100%, our total would exceed 1.3
              tonnes. All from a 3-person team. All word of mouth. Unbranded. Unpackaged.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-500/10">
                    <th className="px-4 py-3 text-left font-display font-bold text-foreground">
                      Year
                    </th>
                    <th className="px-4 py-3 text-right font-display font-bold text-foreground">
                      Hives
                    </th>
                    <th className="px-4 py-3 text-right font-display font-bold text-foreground">
                      Honey (kg)
                    </th>
                    <th className="px-4 py-3 text-right font-display font-bold text-foreground">
                      Land
                    </th>
                    <th className="px-4 py-3 text-right font-display font-bold text-foreground">
                      Trees
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { year: "2020", hives: "4 → 20", honey: "40", land: "¼ acre", trees: "—" },
                    { year: "2021", hives: "35", honey: "70", land: "1.25 acres", trees: "76" },
                    { year: "2022", hives: "45", honey: "95", land: "2.5 acres", trees: "—" },
                    { year: "2023", hives: "75", honey: "150", land: "3.5 acres", trees: "113" },
                    { year: "2024", hives: "105+", honey: "210", land: "5 acres", trees: "250+" },
                    { year: "2025", hives: "150+", honey: "240", land: "5 acres", trees: "800+" },
                    {
                      year: "2026*",
                      hives: "184",
                      honey: "203*",
                      land: "5 acres",
                      trees: "1,500+",
                    },
                  ].map((row) => (
                    <tr key={row.year} className="hover:bg-amber-500/5 transition-colors">
                      <td className="px-4 py-3 font-semibold text-amber-400">{row.year}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{row.hives}</td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {row.honey}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{row.land}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{row.trees}</td>
                    </tr>
                  ))}
                  <tr className="bg-amber-500/10 font-bold">
                    <td className="px-4 py-3 text-amber-400">TOTAL</td>
                    <td className="px-4 py-3 text-right text-foreground">184 owned</td>
                    <td className="px-4 py-3 text-right text-foreground">988 kg</td>
                    <td className="px-4 py-3 text-right text-foreground">5 acres</td>
                    <td className="px-4 py-3 text-right text-foreground">1,500+</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              * 2026 figures as of September 2026 — year still in progress. Honey harvested at 50%
              capacity.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CHALLENGES & WHAT'S STILL UNSOLVED                           */}
      {/* ============================================================ */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <FadeIn>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
              The Challenges We Still Face
            </h2>
            <p className="text-center text-muted-foreground max-w-lg mx-auto mb-12">
              We don't hide our struggles. This journey is real, raw, and unfinished.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "Pesticide-Driven Colony Loss",
                desc: "Neighboring farms continue to use heavy pesticides that decimate our colonies. This is our single biggest threat and the reason Timothy quit his job to focus full-time.",
                emoji: "☠️",
              },
              {
                title: "Water Access",
                desc: "We still have no borehole. Our apiary water comes from bucket storage — reliable enough, but far from ideal for 184+ hives and a growing nursery.",
                emoji: "💧",
              },
              {
                title: "Branding & Packaging",
                desc: "988 kg of honey sold with no brand, no packaging, no label. We haven't reached our desired threshold yet. Costs for professional packaging are significant.",
                emoji: "📦",
              },
              {
                title: "Marketing Budget",
                desc: "Everything to date has been word of mouth. We plan to start marketing on September 14th, 2026 — but the costs are real. Webapp and mobile app need to be complete first.",
                emoji: "📢",
              },
              {
                title: "Financing Modern Equipment",
                desc: "Most of our harvesting still uses traditional methods due to financing constraints. Modern equipment is expensive, and we refuse to take on debt.",
                emoji: "⚙️",
              },
              {
                title: "Scale vs. Personal Touch",
                desc: "Managing 184 owned hives + 205 partner hives with a 3-person core team is intense. Quality can't drop even as we scale.",
                emoji: "⚖️",
              },
            ].map((challenge, i) => (
              <FadeIn key={challenge.title} delay={i * 80}>
                <div className="p-4 rounded-xl border border-border bg-background">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{challenge.emoji}</span>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground mb-1">
                        {challenge.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {challenge.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CLOSING / CTA                                                */}
      {/* ============================================================ */}
      <section className="py-24 bg-gradient-to-b from-background to-[hsl(24,12%,7%)]">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <FadeIn>
            <img
              src={beeyieldLogo}
              alt="BeeYield"
              className="w-16 h-16 mx-auto mb-6 drop-shadow-lg"
            />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              This Is Just The Beginning
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              988 kg of honey. 95 and counting acres pollinated. 1,500 trees planted. 3 tons of CO₂ offset. 40
              partner farmers. 22 IoT devices. 2 global partnerships. Zero external funding.
              <br />
              <br />
              All built by three siblings from Makueni, Kenya — with nothing but grit, savings, and
              honey money. If we can do this with zero marketing, imagine what happens next.
            </p>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-lg hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105"
              >
                Try BeeGPT AI <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/blogs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-amber-500/30 hover:bg-amber-500/10 text-amber-300 font-semibold transition-all duration-300 hover:scale-105"
              >
                Read Field Blogs <BookOpen className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="mt-12 pt-6 border-t border-border/40 text-center space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                <span className="text-amber-400 font-semibold uppercase tracking-wider text-[11px]">Global Partners:</span>
                <span className="font-medium text-foreground">Farmers</span>
                <span>•</span>
                <a href="https://apisense.ai/en" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-amber-400 transition-colors">ApiSense</a>
                <span>•</span>
                <a href="https://intelligenthives.eu/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-amber-400 transition-colors">Intelligent Hives</a>
              </div>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} BeeYield — Makueni, Kenya
                <br />
                Three siblings. One mission. Modernizing pollination for Africa and beyond.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
