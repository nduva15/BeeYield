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
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Eye,
  ShieldCheck,
  Quote,
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
    year: "Dec 2020",
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
    subtitle: "22 IoT devices, 105 and counting acres pollinated, global partnerships",
    image: "/images/story/2025-iot-pivot.jpg",
    imageAlt:
      "2026 — IoT devices deployed, global partnerships with Apisense and Intelligent Hives",
    color: "from-violet-600 to-purple-500",
    stats: [
      { label: "IoT Devices", value: "22" },
      { label: "Acres Pollinated", value: "105 & Counting" },
      { label: "Data Points/Day", value: "2,000+ & Growing" },
      { label: "Honey to Date", value: "988 kg" },
    ],
    highlights: [
      "July 2026: BeeYield officially founded as an IoT precision pollination company — uniting intelligent sensors, acoustic bio-analytics, and precision pollination",
      "June 12th: Official partnership with Apisense.io (Poland) — their Global Field Partner Program for disease detection IoT",
      "Received 20 in-hive devices, 1 in-land device, and 2 weight sensors from Apisense",
      "June 23rd: Partnership with Intelligent Hives (Poland) — first precision pollination in-land device and weight scale",
      "Intelligent Hives prototype became our first operational precision pollination prototype",
      "Devices collect temperature, weight, humidity, pressure, outside temp, colony state, and Varroa detection",
      "Also detect Asian hornets — proven incredibly useful for colony protection",
      "Collecting over 2,000 data points daily and growing across all sensor categories — unprecedented for a Kenyan operation",
      "3 farmers enrolled in IoT device program with 22 devices working in hives right now",
      "Pollinated 105 and counting acres — started with a goal of 15 acres, exceeded by 7x",
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
  { icon: MapPin, label: "Acres Pollinated & Counting", value: 105, suffix: "+" },
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
      className="text-center p-4 rounded-2xl border border-amber-200/90 bg-white/95 text-stone-900 shadow-xs hover:border-amber-400 hover:shadow-md transition-all duration-300"
    >
      <stat.icon className="w-5 h-5 text-amber-600 mx-auto mb-2" />
      <div className="font-display text-xl font-bold text-stone-900">
        {count}
        {stat.suffix}
      </div>
      <div className="text-[11px] text-stone-600 font-semibold leading-tight mt-1">{stat.label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Our Hives & Living Apiary Photography                              */
/* ------------------------------------------------------------------ */
export interface HivePhoto {
  id: string;
  image: string;
  title: string;
  category: "Canopy Hives" | "Modern Boxes" | "Field Work";
  badge: string;
  location: string;
  description: string;
  details: string;
}

export const HIVE_PHOTOS: HivePhoto[] = [
  {
    id: "canopy-cluster",
    image: "/images/story/hives/hanging-log-hives-canopy.jpg",
    title: "Suspended Acacia Canopy Apiary",
    category: "Canopy Hives",
    badge: "Traditional Mwatu",
    location: "Kibwezi, Makueni County",
    description: "Multiple traditional African log hives suspended high within the sprawling canopy of native acacia trees.",
    details: "Suspended 3 to 5 meters above the ground, this indigenous Kenyan technique shields colonies from honey badgers, safari ants, and extreme soil heat radiation. The bees have clear flight trajectories directly into surrounding flowering thorn crowns.",
  },
  {
    id: "acacia-keystone",
    image: "/images/story/hives/acacia-tree-log-hive.jpg",
    title: "Keystone Acacia Fork Hive",
    category: "Canopy Hives",
    badge: "Keystone Colony",
    location: "Kibwezi East Apiary Zone",
    description: "Traditional hollowed log hive wedged securely in the primary trunk fork of a mature wild acacia.",
    details: "Thick natural hardwood combined with heavy tree shade keeps brood temperature rock-steady at approximately 35°C even during severe semi-arid droughts. African honeybees (Apis mellifera scutellata) thrive here naturally.",
  },
  {
    id: "yellow-box",
    image: "/images/story/hives/yellow-langstroth-hive.jpg",
    title: "Elevated Modern Apiary Box",
    category: "Modern Boxes",
    badge: "Modern Apiculture",
    location: "Makueni Demonstration Yard",
    description: "Reflective yellow painted hive box mounted on elevated timber stands in the forage undergrowth.",
    details: "Raised platforms keep the hive dry, deter crawling pests, and allow precision under-hive weight scales and acoustic sensors to monitor colony health and honey flow without disturbing comb wax.",
  },
  {
    id: "twilight-inspection",
    image: "/images/story/hives/beekeeper-inspection-twilight.jpg",
    title: "Twilight Apiary Inspection",
    category: "Field Work",
    badge: "Zero-Chemical Care",
    location: "Kibwezi Bush Apiary",
    description: "BeeYield beekeeper in full protective gear inspecting suspended log hives at dusk.",
    details: "Field checks are carried out at dawn or dusk once worker foragers have safely returned. BeeYield enforces a strict no-smoke, zero-chemical policy to protect bee immunity and preserve 100% enzyme purity in the honey.",
  },
  {
    id: "savannah-solitary",
    image: "/images/story/hives/savannah-hanging-hive.jpg",
    title: "Savanna Dryland Suspended Hive",
    category: "Canopy Hives",
    badge: "Wild Forage Corridor",
    location: "Kibwezi Bush Reserve",
    description: "Solitary traditional log hive floating gracefully between acacia branches in semi-arid scrub.",
    details: "Positioned along natural pollinator highways where worker bees gather nectar from indigenous acacia flushes, neem, and desert blossoms. The aerodynamic cylinder naturally sheds heavy seasonal rainstorms.",
  },
  {
    id: "apiary-landscape-1",
    image: "/images/story/hives/apiary-hive-field-1.jpg",
    title: "105+ Acre Forage Habitat",
    category: "Field Work",
    badge: "Natural Ecology",
    location: "Kibwezi Agroforestry Reserve",
    description: "Deep bush landscape showing how our 184 hives are harmoniously spaced across natural ecosystems.",
    details: "Dispersing hives across wide forage corridors prevents resource depletion and competition between colonies, ensuring robust nutrition and high disease resistance for all resident colonies.",
  },
  {
    id: "canopy-thermoregulation",
    image: "/images/story/hives/apiary-hive-field-2.jpg",
    title: "Canopy Shade & Thermal Comfort",
    category: "Canopy Hives",
    badge: "Microclimate Balance",
    location: "Makueni Wild Lands",
    description: "Hives shaded beneath dense green thorn leaves to prevent heat exhaustion in the colony.",
    details: "Natural tree canopies lower ambient temperatures by 4–8°C compared to exposed ground, drastically reducing the water and energy worker bees need to expend on internal hive cooling.",
  },
  {
    id: "orchard-baobab-agroforestry",
    image: "/images/pollination/orchard-panorama-mango-citrus-baobab.jpg",
    title: "105+ Acre Agroforestry Pollination Corridor",
    category: "Field Work",
    badge: "Agroforestry Sanctuary",
    location: "Makueni County Orchard Corridor",
    description: "Flowering mangoes, citrus groves, and ancient baobab trees anchored by BeeYield precision apiaries.",
    details: "Bee colonies positioned along hillside orchard contours pollinate synchronous mango and citrus bloom bursts while finding drought sanctuary in indigenous tree canopies across 105 acres and counting.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function About() {
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<HivePhoto | null>(null);
  const [photoFilter, setPhotoFilter] = useState<string>("All");

  const filteredPhotos = photoFilter === "All"
    ? HIVE_PHOTOS
    : HIVE_PHOTOS.filter((p) => p.category === photoFilter);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (!selectedPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPhoto(null);
      if (e.key === "ArrowRight") {
        const idx = HIVE_PHOTOS.findIndex((p) => p.id === selectedPhoto.id);
        if (idx !== -1) setSelectedPhoto(HIVE_PHOTOS[(idx + 1) % HIVE_PHOTOS.length]);
      }
      if (e.key === "ArrowLeft") {
        const idx = HIVE_PHOTOS.findIndex((p) => p.id === selectedPhoto.id);
        if (idx !== -1) setSelectedPhoto(HIVE_PHOTOS[(idx - 1 + HIVE_PHOTOS.length) % HIVE_PHOTOS.length]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto]);

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
              <Heart className="w-4 h-4" /> Established Dec 2020 • IoT Precision Pollination Co. Founded July 2026 • Kibwezi &amp; Makueni, Kenya
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
                <Calendar className="w-4 h-4" /> Est. Dec 2020 (IoT Precision Pollination Co. July 2026)
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
      <section className="relative py-16 bg-gradient-to-r from-amber-100/60 via-amber-50 to-amber-100/60 border-y border-amber-200/80">
        <div className="container mx-auto px-4">
          <FadeIn>
            <h2 className="font-display text-2xl font-bold text-center mb-2 text-stone-900">
              Where We Stand Today
            </h2>
            <p className="text-center text-stone-600 font-medium text-sm mb-10">
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
      <section className="py-20 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/40 text-stone-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <FadeIn>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4 text-stone-900">
              Who We Are &amp; What We Stand For
            </h2>
            <p className="text-center text-stone-600 font-medium max-w-2xl mx-auto mb-12">
              Three siblings, one mission: modernizing pollination in Kenya and beyond.
            </p>
          <div className="my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 text-stone-900 border border-amber-200/90 shadow-sm relative overflow-hidden text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold uppercase tracking-wider mb-4">
              Why We Are Devoted to Saving Bees
            </div>
            <blockquote className="text-lg sm:text-xl md:text-2xl font-black tracking-tight leading-snug italic text-stone-950 max-w-3xl mx-auto mb-3">
              “If the bee disappeared off the surface of the globe, then man would have only four years of life left. No more bees, no more pollination, no more plants, no more animals, no more man.”
            </blockquote>
            <p className="text-amber-800 font-bold text-xs tracking-widest uppercase mb-4">
              — Albert Einstein <span className="text-stone-500 font-normal lowercase">(attributed)</span>
            </p>
            <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Bees pollinate 1 in every 3 bites of food we eat. At BeeYield, we are devoted to reversing pollinator decline through non-invasive IoT telemetry, zero-chemical natural apiculture, and biodiverse tree corridors.
            </p>
          </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Heart,
                title: "Family-Driven Innovation",
                desc: "Founded by siblings Timothy (Finance, Marketing & IT — Strathmore University), Agatha (IT — Strathmore), and Carole (Project Management & Sales/Finance — Strathmore). Combining agricultural passion with world-class education and relentless work ethic.",
                color: "text-rose-600",
                border: "border-rose-200/80",
                bg: "from-rose-50/70 via-white to-amber-50/40",
              },
              {
                icon: Sprout,
                title: "Guardians of Biodiversity",
                desc: "With 1,500+ indigenous trees planted, our own nursery, and 3 tons of carbon offset, we're ecosystem builders committed to long-term ecological restoration. We only harvest 50% of our honey — the bees always eat first.",
                color: "text-emerald-700",
                border: "border-emerald-200/80",
                bg: "from-emerald-50/70 via-white to-amber-50/40",
              },
              {
                icon: Wifi,
                title: "Precision Pollination",
                desc: "22 IoT devices deployed, over 2,000 data points daily and growing, real-time temperature, weight, humidity, pressure, colony state, Varroa detection, and Asian hornet alerts. We use data to protect bees and maximize yields for Kenyan smallholders.",
                color: "text-sky-700",
                border: "border-sky-200/80",
                bg: "from-sky-50/70 via-white to-amber-50/40",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 100}>
                <div className={`p-6 rounded-2xl border ${item.border} bg-gradient-to-br ${item.bg} hover:shadow-md hover:border-amber-300 transition-all duration-300 h-full shadow-xs`}>
                  <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
                  <h3 className="font-display text-lg font-bold mb-2 text-stone-900">{item.title}</h3>
                  <p className="text-sm text-stone-600 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Revenue & Reinvestment */}
          <FadeIn>
            <div className="p-6 rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/90 via-white to-amber-100/40 text-stone-900 shadow-sm">
              <h3 className="font-display text-lg font-bold text-amber-950 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" /> Revenue — 100% Reinvested
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-stone-700 font-medium">
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-stone-950">Honey Sales: $3,000+ USD</span>{" "}
                    — 988 kg sold through word of mouth alone. Never branded, never packaged, never
                    advertised. All profits reinvested in land, hives, trees, and research.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-stone-950">
                      Pollination Revenue: $550 USD
                    </span>{" "}
                    — 105 acres and counting pollinated since July 2025. 18% average yield increase. Mango bloom
                    season ongoing — targeting 150 acres and 25%+ yield improvement.
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  OUR HIVES & APIARIES IN PHOTOS                               */}
      {/* ============================================================ */}
      <section
        id="our-hives"
        className="py-20 bg-gradient-to-b from-amber-50/60 via-amber-100/30 to-amber-50/60 border-t border-amber-200/80 text-stone-900"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300 bg-amber-100/90 text-amber-900 text-xs sm:text-sm font-bold mb-4 shadow-xs">
                <Camera className="w-4 h-4 text-amber-700" />
                <span>Real Field Photography • Kibwezi &amp; Makueni, Kenya</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900 mb-4">
                Our Living Apiary &amp; Hives in Photos
              </h2>
              <p className="text-stone-700 font-medium text-sm sm:text-base leading-relaxed">
                Step inside our actual apiary grounds across 105+ acres in southeastern Kenya. Witness our indigenous suspended acacia log hives (<em>Mwatu</em>), modern elevated box hives, and sustainable twilight inspection protocols.
              </p>

              {/* Quick stats pills */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-amber-200 text-xs text-stone-800 font-semibold shadow-xs">
                  <Hexagon className="w-3.5 h-3.5 text-amber-600" /> 184 Hives in Semi-Arid Kenya
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-amber-200 text-xs text-stone-800 font-semibold shadow-xs">
                  <TreePine className="w-3.5 h-3.5 text-emerald-700" /> Acacia Canopy Placement
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-amber-200 text-xs text-stone-800 font-semibold shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-700" /> 100% Smoke &amp; Chemical-Free
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-amber-200 text-xs text-stone-800 font-semibold shadow-xs">
                  <Thermometer className="w-3.5 h-3.5 text-orange-600" /> ~35°C Natural Thermoregulation
                </span>
              </div>
            </div>
          </FadeIn>

          {/* Category Tabs */}
          <FadeIn delay={100}>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {["All", "Canopy Hives", "Modern Boxes", "Field Work"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPhotoFilter(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border cursor-pointer ${
                    photoFilter === cat
                      ? "bg-amber-600 text-white border-amber-600 shadow-md font-bold"
                      : "bg-white/90 border-amber-200 text-stone-700 hover:border-amber-400 hover:text-stone-900 shadow-xs"
                  }`}
                >
                  {cat === "All" ? `All Field Photos (${HIVE_PHOTOS.length})` : cat}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, i) => (
              <FadeIn key={photo.id} delay={i * 70}>
                <div
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative rounded-2xl overflow-hidden border border-amber-200/90 bg-white shadow-md hover:border-amber-400 hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col h-full"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] sm:aspect-[3/2] overflow-hidden bg-stone-900">
                    <img
                      src={photo.image}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-500 text-stone-950 shadow-sm">
                        {photo.badge}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-md text-white/95 border border-white/20 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-amber-400" />
                        {photo.location.split(",")[0]}
                      </span>
                    </div>

                    {/* Hover Prompt */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-stone-900 text-xs font-bold flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <Maximize2 className="w-3.5 h-3.5 text-amber-600" /> View Full Photo
                      </span>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white text-stone-900">
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors mb-1.5">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed font-medium line-clamp-2">
                        {photo.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-amber-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
                      <span className="text-amber-700 font-bold">{photo.category}</span>
                      <span className="flex items-center gap-1 group-hover:text-stone-900 transition-colors">
                        <Eye className="w-3 h-3 text-amber-600" /> Click to enlarge
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Educational Callout: Dual-Hive Philosophy */}
          <FadeIn delay={200}>
            <div className="mt-14 p-6 sm:p-8 rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-50 via-white to-emerald-50/40 shadow-lg text-stone-900">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    Our Apiculture Doctrine
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                    Bridging Indigenous Wisdom with Modern Precision
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                    Rather than abandoning traditional African beekeeping, BeeYield honors centuries-old Kamba and Maasai tree-hanging methods while augmenting them with IoT telemetry and modern raised hive architecture.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-1">
                    <p className="font-bold text-amber-800 flex items-center gap-1.5">
                      <TreePine className="w-3.5 h-3.5 text-amber-600" /> Suspended Tree Hives
                    </p>
                    <p className="text-stone-600 text-[11px] leading-relaxed font-medium">
                      Superior thermal insulation during 38°C dry spells. Natural pest barriers against honey badgers. Preferred nesting choice of wild African bees.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-1">
                    <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-emerald-600" /> Elevated Box Hives
                    </p>
                    <p className="text-stone-600 text-[11px] leading-relaxed font-medium">
                      Seamless integration with load cells, acoustic varroa sensors, and frame inspection. Clean separation of 50% harvest without damaging comb.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative bg-card border border-border/80 rounded-2xl sm:rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors border border-white/20 shadow-lg cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev / Next Navigation Buttons */}
            <button
              onClick={() => {
                const idx = HIVE_PHOTOS.findIndex((p) => p.id === selectedPhoto.id);
                if (idx !== -1) setSelectedPhoto(HIVE_PHOTOS[(idx - 1 + HIVE_PHOTOS.length) % HIVE_PHOTOS.length]);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors border border-white/20 shadow-lg cursor-pointer"
              title="Previous photo (←)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const idx = HIVE_PHOTOS.findIndex((p) => p.id === selectedPhoto.id);
                if (idx !== -1) setSelectedPhoto(HIVE_PHOTOS[(idx + 1) % HIVE_PHOTOS.length]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors border border-white/20 shadow-lg cursor-pointer"
              title="Next photo (→)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Full Image */}
            <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-black max-h-[60vh] overflow-hidden flex items-center justify-center">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Body / Information */}
            <div className="p-5 sm:p-7 space-y-3 bg-card border-t border-border">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950">
                    {selectedPhoto.badge}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> {selectedPhoto.location}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  Photo {HIVE_PHOTOS.findIndex((p) => p.id === selectedPhoto.id) + 1} of {HIVE_PHOTOS.length}
                </span>
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                {selectedPhoto.title}
              </h3>

              <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                {selectedPhoto.description}
              </p>

              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground font-semibold">Field Context &amp; Significance: </strong>
                {selectedPhoto.details}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  YEAR-BY-YEAR TIMELINE                                        */}
      {/* ============================================================ */}
      <section
        id="timeline"
        className="py-20 bg-gradient-to-b from-amber-50/30 via-white to-amber-50/30 border-t border-amber-200/60 scroll-mt-20 text-stone-900"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <FadeIn>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-2 text-stone-900">
              Our Journey — Year by Year
            </h2>
            <p className="text-center text-stone-600 font-medium max-w-xl mx-auto mb-16">
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
                      ? "bg-amber-600 text-white border-amber-600 shadow-md font-bold"
                      : "bg-white/90 border-amber-200 text-stone-700 hover:border-amber-400 hover:text-stone-900 shadow-xs"
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
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-200" />
                      <div
                        className={`mx-4 px-6 py-2 rounded-full bg-gradient-to-r ${yr.color} text-white font-display text-2xl font-bold shadow-lg`}
                      >
                        {yr.year}
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-200" />
                    </div>
                  </FadeIn>

                  <div
                    className={`grid lg:grid-cols-2 gap-8 items-start ${isEven ? "" : "lg:direction-rtl"}`}
                  >
                    {/* Image */}
                    <FadeIn delay={100} className={isEven ? "" : "lg:order-2"}>
                      <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-amber-200/80 bg-white">
                        <img
                          src={yr.image}
                          alt={yr.imageAlt}
                          className="w-full h-64 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-display text-xl font-bold text-white">{yr.title}</h3>
                          <p className="text-white/80 text-sm">{yr.subtitle}</p>
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
                              className="p-3 rounded-xl border border-amber-200 bg-white text-center shadow-xs"
                            >
                              <div className="font-display text-lg font-bold text-amber-700">
                                {stat.value}
                              </div>
                              <div className="text-[11px] text-stone-600 font-semibold">{stat.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Highlights */}
                        <ul className="space-y-2">
                          {yr.highlights.map((h, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-stone-700 font-medium"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Quote */}
                        {yr.quote && (
                          <blockquote className="border-l-2 border-amber-500 pl-4 italic text-sm text-stone-700 my-2 font-medium">
                            "{yr.quote}"
                            <footer className="mt-2 text-xs text-amber-700 not-italic flex items-center gap-2">
                              <img
                                src="/images/timothy-nduva.png"
                                alt="Timothy Nduva"
                                className="w-6 h-6 rounded-full object-cover object-center border border-amber-500 shadow-xs shrink-0"
                              />
                              <span className="font-bold text-stone-900">Timothy Nduva</span>
                              <span className="text-stone-500 font-normal">• Founder &amp; CEO</span>
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
                    <strong className="text-foreground">105 acres and counting</strong> of farmland, proving the
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
                    from partner farmers across the Kalakalya, Mbuinzau, Kiunduani, Kibarani, Kaunguni, and Ndeini areas, providing hive checkups, honey harvesting, and education
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
              The Team Behind BeeYield
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-10">
              Three siblings combining Strathmore University training in Finance, Marketing, IT, and Project Management with hands-on apiculture.
            </p>

            {/* Featured CEO & Founder Quote */}
            <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 backdrop-blur-xs flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
              <div className="relative shrink-0">
                <img
                  src="/images/timothy-nduva.png"
                  alt="Timothy Nduva, Founder & CEO"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover object-center border-2 border-amber-500/60 shadow-md"
                />
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow font-bold text-xs" title="Founder & Lead Beekeeper">
                  🐝
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <Quote className="w-7 h-7 text-amber-500/50 mb-2 mx-auto sm:mx-0" />
                <blockquote className="text-base sm:text-lg font-medium text-foreground italic leading-relaxed mb-3">
                  “When we started losing bees to pesticides, I knew we had two choices: give up or innovate. We chose to protect them. Every hive we monitor with IoT telemetry is another step toward ensuring that Kenyan farmers and pollinators thrive together.”
                </blockquote>
                <div>
                  <div className="font-bold text-base text-foreground">Timothy Nduva</div>
                  <div className="text-xs text-amber-500 font-medium">Founder, CEO &amp; Lead Beekeeper • BeeYield</div>
                </div>
              </div>
            </div>
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
                    { year: "Dec 2020", hives: "4 → 20", honey: "40", land: "¼ acre", trees: "—" },
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
              988 kg of honey. 105 and counting acres pollinated. 1,500 trees planted. 3 tons of CO₂ offset. 40
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
