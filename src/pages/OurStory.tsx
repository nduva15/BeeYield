import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Users, Hexagon, Radio, Scale, ShieldCheck, CheckCircle2,
  TrendingUp, Network, Quote, ChevronDown, Flower2, Store
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import SEO from "@/components/SEO";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { ThreePhotoSlideshow, SlideItem } from "@/components/ThreePhotoSlideshow";
import { TechPhilosophySection } from "@/components/beeyield/FieldTrustSections";
import { AudienceSegmentsSection } from "@/components/AudienceSegmentsSection";
import { GlobalPartnerNetworkSection } from "@/components/beeyield/GlobalPartnerNetworkSection";
import { LeadershipSection } from "@/components/beeyield/LeadershipSection";

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
  beekeeperInspection: '/images/story/hives/beekeeper-inspection-twilight.jpg',
};


interface YearMilestone {
  year: string;
  title: string;
  subtitle: string;
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
    color: "from-amber-600 to-yellow-500",
    stats: [
      { label: "Hives", value: "4 → 20" },
      { label: "Honey Harvested", value: "40 kg" },
      { label: "Land", value: "¼ acre" },
    ],
    highlights: [
      "Received 4 hives from our father — our entire inheritance and the seed of BeeYield",
      "Started out as a small business selling honey, sold jar by jar to neighbours",
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
      "3 farmers enrolled in our IoT partner network, with 22 devices working in hives right now",
      "Pollinated 105 and counting acres — started with a goal of 15 acres, exceeded by 7x",
      "Pioneered our calibrated Hives per Acre (HPA) precision model — matching 1.5 to 4.5 IoT-monitored colonies per acre based on canopy density, bloom phenology, and real-time forager flight hours",
      "Mango bloom season in Makueni, Kenya — targeting 150 acres before year-end",
      "9–18% average yield increase for pollinated farms through scientific hive density calibration",
      "Built Bee LLM and bee sound analysis — trained on 350K+ bee sounds via Kaggle for disease detection",
      "Started mobile app development on August 3rd for full audience experience",
      "203 kg honey harvested so far this year, bringing total to 988 kg lifetime",
      "Managing 205+ additional hives from partner farmers",
      "Planted 2,500 trees so far toward our 45,000-tree goal, and started our own nursery for our apiary and partner apiaries",
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

const TODAY_STATS = [
  { icon: Hexagon, value: "184", label: "Hives", desc: "Up from the 4 we started with" },
  { icon: Radio, value: "22", label: "IoT devices", desc: "Live in hives and in the field" },
  { icon: Flower2, value: "105+", label: "Acres pollinated", desc: "And counting, this season" },
  { icon: Users, value: "40", label: "Partner farmers", desc: "Hive checks, harvests and training" },
  { icon: Network, value: "3", label: "IoT partner farmers", desc: "Sensors running on their own hives" },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const OurStory = () => {
  const [activeTimelineYear, setActiveTimelineYear] = useState<string | null>("2026");
  return (
    <BeeYieldPageShell className="min-h-screen bg-background p-0">
      <SEO
        title="Our Story | Protecting Bees, Precision Pollination & Apiary Heritage"
        description="From 4 hives to Africa's precision pollination pioneer. How BeeYield built its apiary network, engineered the hives per acre model, and dedicated its mission to protecting bees."
        keywords="protecting bees, precision pollination, hives per acre model, bees, apiary, in hive pollination, in land pollination, BeeYield story, Timothy Nduva, Kenya beekeeping history"
        url="/our-story"
        image="/images/story/deployed-hive-antenna-1.png"
      />
      {/* ═══════════════════════════════════════════════════════════════
          1. HERO — The Story Behind BeeYield
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-36 border-b border-neutral-100">
        <div className="absolute inset-0">
          <img
            src={STORY_IMAGES.apiaryLangstrothRow}
            alt="BeeYield Langstroth hive apiary — yellow hives on wooden stands under acacia shade in Kibwezi, Kenya"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/94 via-white/88 to-white/97" />
        </div>
        <div className="absolute top-20 right-10 text-primary/5 animate-pulse">
          <Hexagon size={120} strokeWidth={1} />
        </div>
        <div className="absolute bottom-20 left-10 text-accent/10">
          <Hexagon size={180} strokeWidth={1} className="rotate-12" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-8 items-center">
            <motion.div {...fadeUp} className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm bg-beeyield-green/10 text-beeyield-green font-bold rounded-full">
                Our Story
              </Badge>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.05]">
                The Story Behind <span className="text-primary">BeeYield</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8">
                BeeYield started as a small business selling honey. Today we are a precision pollination company
                working with beekeepers and farmers in Kenya.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {[
                  { icon: Hexagon, text: "4 → 184 hives" },
                  { icon: Radio, text: "22 IoT devices" },
                  { icon: Scale, text: "105+ acres pollinated" },
                ].map((chip) => (
                  <div key={chip.text} className="px-4 py-2 bg-white/80 backdrop-blur rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-2">
                    <chip.icon className="w-4 h-4 text-beeyield-green" />
                    <span className="text-xs font-bold text-neutral-900">{chip.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="relative mx-auto lg:ml-auto max-w-md lg:max-w-full flex justify-center">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl rounded-full" />
              <img
                src={Logo}
                alt="BeeYield Logo"
                className="relative w-full max-w-[340px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. NARRATIVE CHAPTERS — honey → reinvestment → pivot
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-24 lg:space-y-32">
          {[
            {
              kicker: "December 2020 · Kibwezi, Kenya",
              icon: Store,
              title: "It started as a honey business",
              body: [
                "BeeYield did not start with pollination. It started as a small business selling honey.",
                "Our father gave us four hives on a quarter acre. We harvested them and sold the honey jar by jar to neighbours. There was no brand and no plan, just honey people trusted because they knew where it came from.",
              ],
              image: STORY_IMAGES.savannahHangingHive,
              alt: "Traditional log hive hanging in an acacia tree in Kibwezi, Kenya",
              caption: "4 hives · ¼ acre · 40 kg first harvest",
            },
            {
              kicker: "2021 – 2024 · Reinvesting every shilling",
              icon: TrendingUp,
              title: "Then the honey started paying for more hives",
              body: [
                "Instead of spending the profit, we put it back into the bees. 4 hives became 20, then 35, then 75, then more than 100. Each harvest paid for another acre, another row of hives and another batch of trees.",
                "In 2022 Agatha and Carole joined, and the honey business became a family company. We still had no investors and no adverts. Growth came from word of mouth.",
              ],
              image: STORY_IMAGES.beekeeperInspection,
              alt: "BeeYield beekeeper inspecting hives at twilight in Kibwezi",
              caption: "3 siblings · 5 acres · 105+ hives by 2024",
            },
            {
              kicker: "2025 – 2026 · The pivot",
              icon: ShieldCheck,
              title: "So we changed course",
              body: [
                "In 2025, pesticide spraying on nearby farms started killing our colonies. Everything we needed to know about a hive was hidden inside the box until the next visit, and by then it was often too late.",
                "Timothy left his job to work on the hives full time. On 28 July 2025 we started offering pollination, and the farms we served got noticeably better yields. In 2026 we partnered with Apisense and Intelligent Hives, put sensors inside our hives and out in the fields, and became an IoT precision pollination company.",
              ],
              image: STORY_IMAGES.apisenseCloseup2,
              alt: "ApiSense sensor PCB with worker bee landed on the device inside a Kenyan hive",
              caption: "Sensors in the hive · data in the farmer's hands",
            },
          ].map((ch, i) => (
            <motion.div
              key={ch.title}
              {...fadeUp}
              className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center"
            >
              <div className={`relative group ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="absolute -inset-2 bg-gradient-to-r from-beeyield-green/20 to-amber-400/20 rounded-[3rem] blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-neutral-200 bg-neutral-950 aspect-[4/3]">
                  <img
                    src={ch.image}
                    alt={ch.alt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-transparent to-transparent" />
                  <p className="absolute bottom-6 left-6 right-6 text-white font-bold text-sm sm:text-base">{ch.caption}</p>
                </div>
              </div>
              <div className="space-y-6">
                <Badge variant="outline" className="px-3 py-1">
                  <ch.icon className="mr-2 h-3 w-3" />
                  {ch.kicker}
                </Badge>
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight">{ch.title}</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed text-base sm:text-lg">
                  {ch.body.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. WHERE WE ARE TODAY — headline numbers
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50/70 py-20 sm:py-28 border-y border-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center mb-14">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-4 px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider">
              Where we are today
            </Badge>
            <h2 className="text-3xl font-bold text-foreground sm:text-5xl tracking-tight mb-4">
              From 4 hives to <span className="text-primary">184</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Paid for by honey and reinvested profit.
            </p>
          </motion.div>

          {/* Headline numbers */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {TODAY_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="h-full text-center border-border/50 bg-white rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <p className="text-4xl font-black text-primary mb-1 tracking-tight">{stat.value}</p>
                    <p className="text-base font-bold text-foreground">{stat.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. THE UNCOMFORTABLE TRUTH
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 sm:py-28 bg-[#0A2612] text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1B9157] rounded-full blur-3xl -mr-40 -mt-40 opacity-25" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F4D03F] rounded-full blur-3xl -ml-40 -mb-40 opacity-15" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-start">
            <motion.div {...fadeUp}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300 mb-5">Here is the uncomfortable truth</p>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                We are not only losing bees. <span className="text-[#F4D03F]">We are losing beekeepers.</span>
              </h2>
            </motion.div>
            <motion.div {...fadeUp} className="space-y-5 text-neutral-300 text-base sm:text-lg leading-relaxed">
              <p>
                Pesticide drift, drought and unpredictable honey prices make keeping colonies alive harder every year.
                When a beekeeper gives up, the hives go with them. Fewer hives means less pollination, and less pollination
                means smaller mango and avocado harvests for the farmers next door.
              </p>
              <p className="text-white font-semibold">It is a structural cycle, not a bad season.</p>
              <p>
                A gadget will not fix that, and neither will squeezing beekeepers harder. What fixes it is making
                beekeeping a business worth staying in. That means giving experienced beekeepers better information and
                more time, keeping the data with the farmers who produce it, and proving everything in our own apiary before
                we sell it to anyone else.
              </p>
              <div className="flex items-start gap-3 pt-4 border-t border-white/10">
                <Quote className="h-6 w-6 text-[#1B9157] shrink-0 mt-1" />
                <p className="text-white text-xl font-bold">That is the company we set out to build.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. DEVELOPMENT TIMELINE — interactive, driven by TIMELINE data
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center mb-14">
            <Badge variant="outline" className="mb-4">Development timeline</Badge>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight">Six years, one hive at a time</h2>
            <p className="mt-4 text-muted-foreground">Select a year to see what happened.</p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-[19px] sm:left-[23px] top-2 bottom-2 w-px bg-gradient-to-b from-amber-400 via-beeyield-green to-violet-500" />
            <ol className="space-y-4">
              {TIMELINE.map((m) => {
                const open = activeTimelineYear === m.year;
                const hiveStat = m.stats.find((s) => s.label === "Hives");
                return (
                  <li key={m.year} className="relative pl-14 sm:pl-16">
                    <span className={`absolute left-0 top-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br ${m.color} text-white shadow-lg ring-4 ring-white`}>
                      <Hexagon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <button
                      id={`timeline-${m.year.replace(/\s+/g, "-").toLowerCase()}`}
                      type="button"
                      aria-expanded={open}
                      onClick={() => setActiveTimelineYear(open ? null : m.year)}
                      className={`w-full text-left rounded-3xl border p-5 sm:p-6 transition-all duration-300 ${
                        open ? "border-primary/40 bg-primary/[0.03] shadow-lg" : "border-neutral-200 hover:border-primary/30 hover:shadow-md bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-primary">{m.year}</p>
                          <h3 className="text-lg sm:text-xl font-bold text-foreground mt-1">{m.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{m.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {hiveStat && (
                            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                              {hiveStat.value} hives
                            </span>
                          )}
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                        </div>
                      </div>

                      {open && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.35 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {m.stats.map((s) => (
                              <div key={s.label} className="rounded-2xl bg-neutral-50 border border-neutral-100 p-3">
                                <p className="text-sm font-black text-foreground">{s.value}</p>
                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                              </div>
                            ))}
                          </div>
                          <ul className="mt-5 space-y-2">
                            {m.highlights.slice(0, 6).map((h) => (
                              <li key={h} className="flex gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-beeyield-green shrink-0 mt-0.5" />
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                          {m.quote && (
                            <blockquote className="mt-5 border-l-4 border-amber-400 pl-4 italic text-sm text-foreground/80">
                              “{m.quote}”
                            </blockquote>
                          )}
                        </motion.div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Our Leadership — co-founders & press contacts (moved from Media) */}
      <LeadershipSection />



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


      {/* Tech that works for everyone — audience segments */}
      <AudienceSegmentsSection />

      {/* How we think about technology — software & hardware */}
      <TechPhilosophySection />

      {/* Building a global understanding of pollinators — partner network */}
      <GlobalPartnerNetworkSection />


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
                Help shape <span className="text-[#1B9157]">what comes next</span>
              </h2>
              <p className="text-neutral-300 max-w-2xl mx-auto mb-10 text-lg relative z-10">
                From a small honey business with 4 hives to 184 hives, 22 IoT devices, 40 partner farmers and 105+ acres pollinated. Talk to us about a project, a collaboration or an investment.
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
