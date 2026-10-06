import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Users, Cpu, Sprout, ArrowRight, Heart, TreePine, Home, Hexagon,
  Radio, Scale, ShieldCheck, Activity, Zap, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { ThreePhotoSlideshow, SlideItem } from "@/components/ThreePhotoSlideshow";

/* ── Authentic Field Photo Assets (Zero AI Renders) ──────────── */
const STORY_IMAGES = {
  deployedHive1: '/images/story/deployed-hive-antenna-1.png',
  deployedHive2: '/images/story/deployed-hive-antenna-2.png',
  apisenseCluster1: '/images/story/apisense-bees-cluster-1.png',
  apisenseCluster2: '/images/story/apisense-bees-cluster-2.png',
  apisenseCloseup1: '/images/story/apisense-bees-closeup-1.png',
  apisenseCloseup2: '/images/story/apisense-bees-closeup-2.png',
  beeColonyWide: '/images/story/bee-colony-device-wide.jpg',
  solarGateway: '/images/pollination/gateway-solar-node.png',
  hiveScale: '/images/pollination/hive-scale-loadcell.png',
  combProbe1: '/images/pollination/hive-comb-inspection-6.png',
  combProbe2: '/images/pollination/hive-comb-inspection-7.png',
  combProbe3: '/images/pollination/hive-comb-inspection-8.png',
  fieldInspection1: '/images/diseases/hive-inspection-1.png',
  fieldInspection2: '/images/diseases/hive-inspection-2.png',
  /* ── Real Hive Photos — Our Apiary Growth ──────────── */
  apiaryLangstrothRow: '/images/story/hives/apiary-langstroth-row.jpg',
  yellowLangstrothCloseup: '/images/story/hives/yellow-langstroth-closeup.jpg',
  savannahLogHiveTree: '/images/story/hives/savannah-log-hive-tree.jpg',
  hangingLogHivesCanopy: '/images/story/hives/hanging-log-hives-canopy.jpg',
  apiaryHiveField1: '/images/story/hives/apiary-hive-field-1.jpg',
  apiaryHiveField2: '/images/story/hives/apiary-hive-field-2.jpg',
  acaciaTreeLogHive: '/images/story/hives/acacia-tree-log-hive.jpg',
  savannahHangingHive: '/images/story/hives/savannah-hanging-hive.jpg',
};


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
    imageAlt: "IoT sensors deployed on hives — the moment BeeYield pivoted to precision pollination",
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
    imageAlt: "2026 — IoT devices deployed, global partnerships with Apisense and Intelligent Hives",
    color: "from-violet-600 to-purple-500",
    stats: [
      { label: "IoT Devices", value: "22" },
      { label: "Acres Pollinated", value: "105 & Counting" },
      { label: "Data Points/Day", value: "2,000+ & Growing" },
      { label: "Honey to Date", value: "988 kg" },
    ],
    highlights: [
      "July 2026: BeeYield officially founded as an IoT precision pollination company — uniting intelligent sensors, acoustic AI, and precision pollination",
      "June 12th: Official partnership with Apisense.io (Poland) — their Global Field Partner Program for disease detection IoT",
      "Received 20 in-hive devices, 1 in-land device, and 2 weight sensors from Apisense",
      "June 23rd: Partnership with Intelligent Hives (Poland) — first precision pollination in-land device and weight scale",
      "Intelligent Hives prototype became our first operational precision pollination prototype",
      "Devices collect temperature, weight, humidity, pressure, outside temp, colony state, and Varroa detection",
      "Also detect Asian hornets — proven incredibly useful for colony protection",
      "Collecting over 2,000 data points daily and growing across all sensor categories — unprecedented for a Kenyan operation",
      "3 farmers enrolled in IoT device program with 22 devices working in hives right now",
      "Pollinated 105 and counting acres — started with a goal of 15 acres, exceeded by 7x",
      "Pioneered our calibrated Hives per Acre (HPA) precision model — matching 1.5 to 4.5 IoT-monitored colonies per acre based on canopy density, bloom phenology, and real-time forager flight hours",
      "Mango bloom season in Makueni, Kenya — targeting 150 acres before year-end",
      "9–18% average yield increase for pollinated farms through scientific hive density calibration",
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

const GROWTH_BY_YEAR = [
  { year: "Dec 2020", hives: "4 → 20", honey: "40 kg", land: "¼ acre", trees: "—", milestone: "Inherited 4 hives from father, harvested 40 kg, word-of-mouth only" },
  { year: "2021", hives: "35", honey: "70 kg", land: "1.25 acres", trees: "76", milestone: "Bought 1st full acre with honey proceeds, planted 76 trees" },
  { year: "2022", hives: "45", honey: "95 kg", land: "2.5 acres", trees: "—", milestone: "Sisters Agatha (IT) & Carole (Project Mgmt) join the mission" },
  { year: "2023", hives: "75", honey: "150 kg", land: "3.5 acres", trees: "113", milestone: "Linear doubling, Timothy graduated Strathmore & saved salary" },
  { year: "2024", hives: "105+", honey: "210 kg", land: "5 acres", trees: "250+", milestone: "Acquired beeyield.com, fully fenced 5 acres, professional harvesting" },
  { year: "2025", hives: "150+", honey: "240 kg", land: "5 acres", trees: "800+", milestone: "Pesticide crisis, Timothy quit job, pivot to pollination, 40 partner farmers" },
  { year: "2026*", hives: "184 (+205 partner)", honey: "203 kg (988 kg total)", land: "5 acres", trees: "1,500+", milestone: "BeeYield officially founded as an IoT precision pollination company (July 2026). 22 IoT devices, Apisense & Intelligent Hives partnerships, 105+ acres" },
];

const OurStory = () => {
  const [activeTimelineYear, setActiveTimelineYear] = useState<string | null>(null);
  return (
    <BeeYieldPageShell className="min-h-screen bg-background p-0">
      
      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION — Real IoT Deployed Hive Background
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32 border-b border-neutral-100">
        <div className="absolute inset-0">
          <img
            src={STORY_IMAGES.apiaryLangstrothRow}
            alt="BeeYield Langstroth hive apiary — yellow hives on wooden stands under acacia shade in Kibwezi, Kenya"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/94 via-white/86 to-white/96" />
        </div>

        <div className="absolute top-20 right-10 text-primary/5 animate-pulse">
          <Hexagon size={120} strokeWidth={1} />
        </div>
        <div className="absolute bottom-20 left-10 text-accent/10">
          <Hexagon size={180} strokeWidth={1} className="rotate-12" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm bg-beeyield-green/10 text-beeyield-green font-bold rounded-full">
                Our Authentic Story
              </Badge>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
                The Story of <span className="text-primary">BeeYield</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8">
                Born in Kibwezi, Makueni County, Kenya — a story of family, resilience, and 22 IoT devices transforming 105 and counting acres of pollination.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="px-4 py-2 bg-white/80 backdrop-blur rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-2">
                  <Radio className="w-4 h-4 text-beeyield-green" />
                  <span className="text-xs font-bold text-neutral-900">22 IoT Devices Deployed</span>
                </div>
                <div className="px-4 py-2 bg-white/80 backdrop-blur rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-beeyield-green" />
                  <span className="text-xs font-bold text-neutral-900">105 Acres and Counting Pollinated</span>
                </div>
                <div className="px-4 py-2 bg-white/80 backdrop-blur rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-beeyield-green" />
                  <span className="text-xs font-bold text-neutral-900">3t Carbon Offset</span>
                </div>
              </div>
            </div>

            <div className="relative mx-auto lg:ml-auto max-w-md lg:max-w-full flex justify-center">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl rounded-full" />
              <img
                src={Logo}
                alt="BeeYield Logo"
                className="relative w-full max-w-[380px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. ORIGIN STORY — ApiSense PCB In-Hive with Live Worker Bees
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 lg:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            
            {/* Visual Photo Card: Real ApiSense Bee Landing */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-beeyield-green/20 to-amber-400/20 rounded-[3rem] blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-neutral-200 bg-neutral-950 aspect-[4/3]">
                <img
                  src={STORY_IMAGES.apisenseCloseup2}
                  alt="ApiSense sensor PCB with worker bee landed directly on device inside Kenyan hive"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <Badge className="bg-beeyield-green text-neutral-950 font-bold px-3 py-1 text-[9px] mb-2">Ground Truth</Badge>
                  <p className="text-white font-bold text-base leading-snug">
                    Real ApiSense sensor board inside Kenyan log hive with active worker bee on PCB
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Badge variant="outline" className="mb-2">
                <Home className="mr-2 h-3 w-3" />
                Kibwezi, Kenya • Dec 2020 Origin (IoT Precision Pollination Co. July 2026)
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight">
                A Family Mission, a Technological Spark
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  In December 2020, <strong className="text-foreground">Timothy Nduva</strong> began BeeYield in rural Kibwezi, Kenya. With 4 traditional log hives inherited from his father and a passion for technological innovation, Timothy began experimenting with precision sensors inside beehives on the family land. BeeYield was later officially founded as an IoT precision pollination company in July 2026.
                </p>
                <p>
                  BeeYield was built together with Timothy's sisters, <strong className="text-foreground">Agatha</strong> and <strong className="text-foreground">Carole</strong>. Combining software engineering, product architecture, and IoT research, the siblings transformed a small family apiary into a precision pollination engine.
                </p>
                <p>
                  What started with 4 hives on half an acre has grown into 184+ hives, 22 IoT devices deployed, and 105 and counting acres precision-pollinated across Kenya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          3. GROWTH JOURNEY — 4 Verified Metrics + 4 Visual Photos
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50/70 py-20 sm:py-24 border-y border-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-4 px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider">
              Measurable Progress
            </Badge>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight mb-4">
              From 4 Hives to 184 — Our Growth in Numbers & Photos
            </h2>
            <p className="text-muted-foreground">
              Real field milestones achieved across our Kibwezi and Makueni apiaries.
            </p>
          </div>

          {/* Metric Numbers */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
            {[
              { number: "184+", label: "Beehives", desc: "Active colony inventory" },
              { number: "22", label: "IoT Devices", desc: "Live telemetry nodes" },
              { number: "105+", label: "Acres Pollinated", desc: "Client orchards served (105 and counting)" },
              { number: "3t", label: "Carbon Offset", desc: "CO₂ sequestered to date" },
            ].map((stat, i) => (
              <Card key={i} className="text-center border-border/50 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <p className="text-4xl font-black text-primary mb-1 tracking-tight">{stat.number}</p>
                  <p className="text-lg font-bold text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 4-Photo Growth Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-md group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={STORY_IMAGES.deployedHive1}
                  alt="Traditional Kenyan hive with solar antenna device"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white">
                <span className="text-[10px] font-bold text-beeyield-green uppercase">Stage 1</span>
                <h4 className="font-bold text-sm text-neutral-900 mt-1">IoT Top-Bar Hive Deployment</h4>
                <p className="text-xs text-neutral-500 mt-1">Solar antenna module bolted to galvanized tin hive roof.</p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-md group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={STORY_IMAGES.apisenseCluster1}
                  alt="Hundreds of worker bees clustered around in-hive sensor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white">
                <span className="text-[10px] font-bold text-beeyield-green uppercase">Stage 2</span>
                <h4 className="font-bold text-sm text-neutral-900 mt-1">In-Hive Sensor Acceptance</h4>
                <p className="text-xs text-neutral-500 mt-1">Colony acceptance verified with worker bee cluster on probe.</p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-md group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={STORY_IMAGES.solarGateway}
                  alt="Solar IoT LTE Transmission Hub"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white">
                <span className="text-[10px] font-bold text-beeyield-green uppercase">Stage 3</span>
                <h4 className="font-bold text-sm text-neutral-900 mt-1">Solar LTE Gateway Hub</h4>
                <p className="text-xs text-neutral-500 mt-1">Autonomous high-gain antenna node relaying yard data.</p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-md group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={STORY_IMAGES.combProbe2}
                  alt="In-hive brood inspection and early disease detection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white">
                <span className="text-[10px] font-bold text-beeyield-green uppercase">Stage 4</span>
                <h4 className="font-bold text-sm text-neutral-900 mt-1">Detect Bee Diseases & Pathogens</h4>
                <p className="text-xs text-neutral-500 mt-1">Early detection of Varroa mites, Foulbrood, and brood stress directly on the comb.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. OUR STORY IN PHOTOS — Multiple 3-Photo Slideshows
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#FAFAF8] text-neutral-900 border-y border-neutral-200/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-4 px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider">
              100% Authentic Field Archive
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-neutral-900">
              Our Story <span className="text-beeyield-green">in Photos</span>
            </h2>
            <p className="text-neutral-600 text-base">
              5 curated 3-photo slideshows tracking our journey from early in-hive hardware experiments in Kibwezi to 22 intelligent hive stations across Kenya.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-[90rem] mx-auto">
            
            {/* Slideshow 1: Origin & Early In-Hive Probes */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: STORY_IMAGES.apisenseCloseup1,
                  title: "ApiSense Bio-Sensor Probe",
                  subtitle: "In-hive probe installed inside log hive cavity",
                  badge: "Kibwezi Origin",
                  description: "Initial hardware prototypes tested in traditional log hives to monitor internal brood microclimate non-invasively."
                },
                {
                  image: STORY_IMAGES.apisenseCloseup2,
                  title: "Forager Bee on ApiSense PCB",
                  subtitle: "Live worker bee landed directly on sensor board",
                  badge: "Zero Rejection",
                  description: "Worker bees accept the electronic hardware immediately, navigating the sensor board without alarm responses."
                },
                {
                  image: STORY_IMAGES.beeColonyWide,
                  title: "Thriving African Bee Colony",
                  subtitle: "Dense worker population around probe",
                  badge: "Colony Vitality",
                  description: "Full-depth colony cluster proving healthy brood rearing alongside digital telemetry equipment."
                }
              ]}
              badge="Hardware Roots"
              title="Origin & Bio-Sensors"
              subtitle="Early prototypes & bee behavior"
              dark={false}
            />

            {/* Slideshow 2: Scaling to 22 Deployed IoT Hives */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: STORY_IMAGES.deployedHive1,
                  title: "Night Field Hive Inspection",
                  subtitle: "Solar antenna module on galvanized tin roof",
                  badge: "22 Deployed Hives",
                  description: "Field deployment on anti-termite stand transmitting live ambient and internal telemetry throughout the night."
                },
                {
                  image: STORY_IMAGES.deployedHive2,
                  title: "Top-Bar Hive Station on Stand",
                  subtitle: "Weatherproof antenna unit mounted on lid",
                  badge: "105 Acres and Counting Served",
                  description: "Robust solar-powered node operating at commercial orchard boundaries to monitor pollinator foraging density."
                },
                {
                  image: STORY_IMAGES.solarGateway,
                  title: "Autonomous Solar LTE Hub",
                  subtitle: "High-gain dual antenna yard gateway",
                  badge: "Zero-Watt Grid",
                  description: "Self-powered gateway aggregating data from all local hive sensors and relaying to cloud dashboards in real time."
                }
              ]}
              badge="Network Scale"
              title="22 IoT Deployed Stations"
              subtitle="Solar antennas & hive stands"
              dark={false}
            />

            {/* Slideshow 3: In-Hive Sensor Integration */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: STORY_IMAGES.apisenseCluster1,
                  title: "Active Colony Around Probe",
                  subtitle: "Hundreds of bees clustered on sensor",
                  badge: "Colony Vitality",
                  description: "Continuous microclimate and acoustics tracking with seamless bee acceptance inside hive."
                },
                {
                  image: STORY_IMAGES.apisenseCluster2,
                  title: "Dense Bee Cluster Telemetry",
                  subtitle: "Worker bees covering vertical sensor node",
                  badge: "Bee Behavior",
                  description: "Proves complete biological acceptance with bees moving freely across probe surface."
                },
                {
                  image: STORY_IMAGES.fieldInspection1,
                  title: "In-Hive Multi-Frame Probe",
                  subtitle: "Vertical sensor between brood frames",
                  badge: "Brood Diagnostics",
                  description: "Direct observation of brood thermoregulation stability across commercial hives."
                }
              ]}
              badge="Bio-Telemetry"
              title="Colony Bio-Telemetry"
              subtitle="Live bee clusters & sensors"
              dark={false}
            />

            {/* Slideshow 4: Precision Pollination & Disease Screening */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: STORY_IMAGES.hiveScale,
                  title: "Under-Hive Load Cell Bar",
                  subtitle: "Sub-milligram continuous scale telemetry",
                  badge: "Weight Delta",
                  description: "Industrial scale bar tracking daily nectar inflow and hive biomass continuously during crop bloom."
                },
                {
                  image: STORY_IMAGES.combProbe2,
                  title: "Detect Bee Diseases & Brood Health",
                  subtitle: "Early pathogen screening on drawn brood comb",
                  badge: "Disease Detection",
                  description: "Sensor-equipped frames enable early identification of American Foulbrood, chalkbrood, and Varroa-related brood abnormalities."
                },
                {
                  image: STORY_IMAGES.combProbe3,
                  title: "Multi-Frame Brood Coverage",
                  subtitle: "Top-down commercial hive inspection",
                  badge: "3t Carbon Offset",
                  description: "Parallel active frames showing full brood vitality and verified strength across precision-pollinated client orchards."
                }
              ]}
              badge="Disease Defense"
              title="Scales & Disease Detection"
              subtitle="Continuous scales & pathogen defense"
              dark={false}
            />

            {/* Slideshow 5: Our Hives — Growth Through the Years */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: STORY_IMAGES.apiaryLangstrothRow,
                  title: "Langstroth Apiary Row",
                  subtitle: "Yellow Langstroth hives on wooden stands under acacia shade",
                  badge: "184 Hives",
                  description: "Our core apiary expanded from 4 inherited hives to rows of modern Langstroth colonies — each standing on elevated stands to protect from termites and flooding."
                },
                {
                  image: STORY_IMAGES.yellowLangstrothCloseup,
                  title: "Single Langstroth Close-Up",
                  subtitle: "Hand-built yellow hive with tin roof and wire bracing",
                  badge: "Hand-Crafted",
                  description: "Every hive is built locally using sustainable timber and painted yellow for thermal regulation. Wire bracing and tin roofing protect against harsh Makueni weather."
                },
                {
                  image: STORY_IMAGES.hangingLogHivesCanopy,
                  title: "Traditional Log Hives in Canopy",
                  subtitle: "Multiple carved log hives hanging from acacia branches",
                  badge: "Heritage Craft",
                  description: "Traditional Kamba log hives — the same design our father used. These are still active and some of our most productive colonies for wild-harvest honey."
                }
              ]}
              badge="Our Hives"
              title="Hive Growth Story"
              subtitle="From 4 hives to 184 — real photos"
              dark={false}
            />

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. WHO WE ARE & OUR VALUES
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight">
              Who We Are And What We Stand For
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three siblings, one mission: modernizing pollination in Kenya and beyond.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Family-Driven Innovation",
                desc: "Founded by siblings Timothy, Agatha, and Carole — combining agricultural passion with world-class IoT, data science, and web engineering."
              },
              {
                icon: Sprout,
                title: "Guardians of Biodiversity",
                desc: "With 2,500+ indigenous trees planted and 3 tons of carbon offset, we're ecosystem builders committed to long-term ecological restoration."
              },
              {
                icon: Cpu,
                title: "Precision Pollination",
                desc: "With 22 IoT devices deployed across 105 and counting acres, we use real-time sensor data to optimize fruit set and yield for Kenyan smallholders."
              }
            ].map((item, i) => (
              <Card key={i} className="group border-border/50 rounded-3xl transition-all hover:border-primary/50 hover:shadow-lg bg-neutral-50/50">
                <CardContent className="p-8">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. PRECISION POLLINATION SERVICES — Side-by-Side Photo Story
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 sm:py-24 border-t border-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="px-3 py-1">
                <TreePine className="mr-2 h-3 w-3" />
                Precision Pollination Services
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight">
                From Traditional Beekeeping to Precision Pollination
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Our pollination journey started with traditional methods — moving hives to client farms and letting nature do its work. We successfully pollinated <strong className="text-foreground">105 and counting acres</strong> of farmland with <strong className="text-foreground">22 intelligent hives</strong>, proving the value of managed precision pollination services in Kenya.
                </p>
                <p>
                  Today, BeeYield uses continuous under-hive weight telemetry, acoustic monitoring, and climate tracking to deliver transparent pollination results with <strong className="text-foreground">3 tons</strong> of carbon offset.
                </p>
                <p>
                  Our goal is to help growers increase crop yields while protecting pollinator colonies and biodiversity across Africa.
                </p>
              </div>
              <Button asChild className="mt-4 rounded-2xl h-12 px-8 bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs shadow-lg">
                <Link to="/pollination-solutions">
                  Explore Our Solutions <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl overflow-hidden border border-neutral-200 shadow-lg aspect-square bg-neutral-900">
                <img
                  src={STORY_IMAGES.apiaryLangstrothRow}
                  alt="Row of BeeYield Langstroth hives on wooden stands in Kibwezi apiary"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-3xl overflow-hidden border border-neutral-200 shadow-lg aspect-square bg-neutral-900">
                <img
                  src={STORY_IMAGES.yellowLangstrothCloseup}
                  alt="Close-up of hand-built yellow Langstroth hive with tin roof"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-3xl overflow-hidden border border-neutral-200 shadow-lg aspect-square bg-neutral-900">
                <img
                  src={STORY_IMAGES.savannahLogHiveTree}
                  alt="Traditional log hive mounted in acacia tree on the Kenyan savannah"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-3xl overflow-hidden border border-neutral-200 shadow-lg aspect-square bg-neutral-900">
                <img
                  src={STORY_IMAGES.hangingLogHivesCanopy}
                  alt="Multiple traditional log hives hanging from tree canopy branches"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>

          {/* ── The Hives per Acre Precision Model Card ── */}
          <div className="mt-16 bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xl shadow-neutral-900/5">
            <div className="max-w-3xl mb-10">
              <Badge className="bg-emerald-500/10 text-emerald-800 border-emerald-200 mb-3 px-3 py-1 font-semibold text-[11px] rounded-full">
                Precision Ag Breakthrough
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-3">
                The Science Behind Our 105+ Acres: The Hives per Acre (HPA) Model
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Traditional pollination in East Africa was always a guessing game: a beekeeper dropped random wooden boxes at an orchard border, with no idea if the bees inside were active or if flower densities were adequately matched. We engineered a proprietary <strong>Hives per Acre (HPA)</strong> model that treats pollination as a calibrated biological force.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-black text-sm mb-4">
                    01
                  </div>
                  <h4 className="font-bold text-neutral-900 text-base mb-2">Canopy Phenology Index</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Calibrates hive density by floral architecture: Hass Avocado (2.5–3.5 HPA), Macadamia (3.0–4.5 HPA), Mango (2.0–3.0 HPA), and Watermelon (1.5–2.5 HPA).
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-200/60 text-[11px] font-bold text-amber-700">
                  Targeted Anthesis Matching
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-black text-sm mb-4">
                    02
                  </div>
                  <h4 className="font-bold text-neutral-900 text-base mb-2">Effective Frames/Acre (FPA)</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We never sell empty boxes. Every placement guarantees a minimum of 12 to 16 active brood and forager frames per acre, verified via digital frame scoring.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-200/60 text-[11px] font-bold text-emerald-700">
                  Real Bio-Mass, Not Empty Wood
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-black text-sm mb-4">
                    03
                  </div>
                  <h4 className="font-bold text-neutral-900 text-base mb-2">In-Hive Biometrics</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Brood chamber thermal stability (34.8°C ± 0.5°C), load-cell continuous scale weight gains, and acoustic frequency audits (180–220 Hz) verify colony vitality 24/7.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-200/60 text-[11px] font-bold text-blue-700">
                  Continuous Telemetry Audits
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center font-black text-sm mb-4">
                    04
                  </div>
                  <h4 className="font-bold text-neutral-900 text-base mb-2">In-Land Ground Truth</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    In-land acoustic counters log actual visits per flower (>15 visits/hr target) and eradicate orchard cold spots with dynamic hive re-positioning.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-200/60 text-[11px] font-bold text-purple-700">
                  Closed-Loop Field Verification
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-neutral-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Eliminates floral under-pollination & premature fruitlet abortion</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Protects colonies from nectar-starvation caused by over-stocking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Validated across 105+ acres delivering 9%–18%+ verified yield lifts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7. VIDEOS SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 border-t border-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              Watch BeeYield
            </Badge>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight">
              Our Story In Motion
            </h2>
            <p className="mt-4 text-muted-foreground">
              Two key videos covering BeeYield's story and the field reality behind our work.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
            <YouTubeEmbed
              title="About BeeYield"
              wrapperClassName="aspect-video"
            />
            <YouTubeEmbed
              title="BeeYield Video"
              wrapperClassName="aspect-video"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          8. CTA SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-[#0A2612] text-white border-none shadow-2xl rounded-[3rem] overflow-hidden">
            <CardContent className="p-8 sm:p-14 text-center relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#1B9157] rounded-full blur-3xl -mr-32 -mt-32 opacity-30" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F4D03F] rounded-full blur-3xl -ml-32 -mb-32 opacity-30" />

              <h2 className="text-3xl font-bold sm:text-5xl mb-6 relative z-10 text-white">
                Join Us on Our <span className="text-[#1B9157]">Journey</span>
              </h2>
              <p className="text-neutral-300 max-w-2xl mx-auto mb-10 text-lg relative z-10">
                From a family dream in rural Kenya to 22 IoT devices monitoring 105 and counting acres — we're just getting started. Partner with us to modernize agriculture.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Button size="lg" className="bg-white text-neutral-950 hover:bg-neutral-100 font-bold px-8 h-12 rounded-xl" asChild>
                  <Link to="/contact">Get In Touch</Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 font-bold px-8 h-12 rounded-xl" asChild>
                  <Link to="/careers">Join Our Team</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

    </BeeYieldPageShell>
  );
};

export default OurStory;
