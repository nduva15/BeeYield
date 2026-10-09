import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  EyeOff, TrendingDown, CircleHelp, Route, Scale, Apple,
  KeyRound, ShieldCheck, BadgeCheck, Hexagon, Thermometer, BellRing,
  Users, Flower2, ArrowRight, CalendarDays, Gauge, Activity, ClipboardCheck,
  Eye, Truck, HandHeart,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────
   Shared building blocks
───────────────────────────────────────────────────────────────────── */

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

type IconCard = {
  icon: React.ElementType;
  title: string;
  body: string;
};

const SectionEyebrow = ({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "amber" }) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-wider border ${
      tone === "green"
        ? "bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20"
        : "bg-amber-100/80 text-amber-800 border-amber-200"
    }`}
  >
    <Hexagon className="h-3.5 w-3.5" />
    {children}
  </span>
);

const NumberedCard = ({ card, index, accent }: { card: IconCard; index: number; accent: "amber" | "green" }) => (
  <motion.article
    {...fadeUp}
    transition={{ duration: 0.6, delay: index * 0.12 }}
    className="group relative h-full rounded-[2rem] border border-neutral-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
  >
    <span className="absolute right-7 top-6 text-5xl font-black tracking-tighter text-neutral-100 transition-colors group-hover:text-amber-100 select-none">
      0{index + 1}
    </span>
    <div
      className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${
        accent === "amber" ? "bg-amber-100 text-amber-700" : "bg-[#1B9157]/10 text-[#1B9157]"
      }`}
    >
      <card.icon className="h-7 w-7" />
    </div>
    <h3 className="relative mb-3 text-xl font-black tracking-tight text-neutral-900">{card.title}</h3>
    <p className="relative text-sm font-medium leading-relaxed text-neutral-600">{card.body}</p>
  </motion.article>
);

/* ─────────────────────────────────────────────────────────────────────
   1. HOME — The gap between visits (problem + why it matters)
───────────────────────────────────────────────────────────────────── */

const PROBLEMS: IconCard[] = [
  {
    icon: EyeOff,
    title: "The hive goes dark when the lid closes",
    body: "A beekeeper inspects, closes up and moves on. Whatever happens next (a failing queen, a hungry colony, pesticide drifting in from a neighbouring farm) stays invisible until the next visit. Across Makueni, that next visit can be a long drive away.",
  },
  {
    icon: TrendingDown,
    title: "Beekeeping is getting harder to pay for",
    body: "Most inspection time goes to hives that turn out to be fine, while the colony in trouble waits its turn. Fuel, labour, pests and pesticide losses keep climbing. When beekeepers give up, farms lose the bees they depend on.",
  },
  {
    icon: CircleHelp,
    title: "Farmers pay for bees they cannot see",
    body: "A grower rents hives with no objective way to know how hard those colonies worked. Too few and fruit set suffers. Too many and the money is wasted. Neither should be a guess.",
  },
];

const OUTCOMES: IconCard[] = [
  {
    icon: Route,
    title: "Beekeepers go where they are needed",
    body: "Alerts point to the colonies that need a visit, so time and fuel go to the hives that need them instead of a blanket round of every yard. The hours saved go back into the colonies that are struggling.",
  },
  {
    icon: Scale,
    title: "Pollination stays within reach",
    body: "Every grower feels pollination costs rising. The lasting fix is not haggling. It is supply: beekeeping businesses healthy enough to bring strong colonies back season after season.",
  },
  {
    icon: Apple,
    title: "Food on Kenyan tables",
    body: "Mangoes, avocados, citrus, sunflower and beans all lean on pollinators. When pollination weakens, harvests and rural incomes follow.",
  },
];

export const BetweenVisitsSection = () => (
  <section
    id="between-visits"
    aria-labelledby="between-visits-title"
    className="relative overflow-hidden bg-gradient-to-b from-white via-[#FFFDF8] to-[#FFF9F0] py-24 sm:py-32"
  >
    <div className="pointer-events-none absolute -left-40 top-20 h-[480px] w-[480px] rounded-full bg-amber-100/50 blur-[120px]" />
    <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-emerald-100/50 blur-[120px]" />

    <div className="container relative z-10 mx-auto px-4 sm:px-6">
      <motion.div {...fadeUp} transition={{ duration: 0.7 }} className="mx-auto mb-20 max-w-4xl space-y-6 text-center">
        <SectionEyebrow tone="amber">Technology That Earns Trust In The Field</SectionEyebrow>
        <h2 id="between-visits-title" className="text-4xl font-black leading-[1.05] tracking-tighter text-neutral-900 md:text-6xl">
          A hive can change a lot <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-amber-500 via-[#1B9157] to-emerald-700 bg-clip-text text-transparent">
            between two visits.
          </span>
        </h2>
        <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-neutral-600 md:text-xl">
          BeeYield watches what happens in between, on working hives in real Kenyan conditions,
          and turns it into decisions that pay for themselves. Here is the problem we solve and how we think about it.
        </p>
      </motion.div>

      {/* The problem */}
      <div className="mb-6 flex items-center gap-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-700">The Problem We Solve</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-amber-200 to-transparent" />
      </div>
      <div className="mb-24 grid gap-6 md:grid-cols-3">
        {PROBLEMS.map((card, i) => (
          <NumberedCard key={card.title} card={card} index={i} accent="amber" />
        ))}
      </div>

      {/* Why it matters */}
      <div className="mb-6 flex items-center gap-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#1B9157]">Why This Matters</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-200 to-transparent" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {OUTCOMES.map((card, i) => (
          <NumberedCard key={card.title} card={card} index={i} accent="green" />
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────
   2. HOME — One connected system + data you can trust
───────────────────────────────────────────────────────────────────── */

const CHAIN = [
  {
    icon: Thermometer,
    label: "Hive Health",
    points: ["Brood temperature", "Hive weight", "Colony sound"],
  },
  {
    icon: Users,
    label: "Beekeeper Workload",
    points: ["Alerts and priorities", "Inspection records", "Harvest logs"],
  },
  {
    icon: Flower2,
    label: "Farm Pollination",
    points: ["Bloom timing", "Hives per acre", "Activity on the crop"],
  },
];

const TRUST: (IconCard & { link?: { to: string; label: string } })[] = [
  {
    icon: KeyRound,
    title: "Yours",
    body: "Beekeepers and growers own the data their hives and farms produce. It exists to work for you.",
  },
  {
    icon: ShieldCheck,
    title: "Secure",
    body: "Hive data is commercial data, and we treat it that way. Security is designed into how readings are collected, sent and stored from the start, not added later.",
  },
  {
    icon: BadgeCheck,
    title: "Provable",
    body: "Anyone can put a number on a screen. We are building traceability that shows a reading is genuine and untouched from the moment it is captured in the hive.",
    link: { to: "/traceability", label: "See our traceability work" },
  },
];

export const ConnectedSystemSection = () => (
  <section
    id="connected-system"
    aria-labelledby="connected-system-title"
    className="relative overflow-hidden bg-[#0A2612] py-24 text-white sm:py-32"
  >
    <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
      <svg className="h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="hex-grid-dark" width="28" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1.4)">
            <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z M14 32 L14 48" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-grid-dark)" />
      </svg>
    </div>
    <div className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-[#1B9157]/30 blur-[140px]" />
    <div className="pointer-events-none absolute -bottom-40 left-0 h-[480px] w-[480px] rounded-full bg-[#F4D03F]/15 blur-[140px]" />

    <div className="container relative z-10 mx-auto px-4 sm:px-6">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <motion.div {...fadeUp} transition={{ duration: 0.7 }} className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#F4D03F]/30 bg-[#F4D03F]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#F4D03F]">
            <Hexagon className="h-3.5 w-3.5" /> From Hive To Harvest
          </span>
          <h2 id="connected-system-title" className="text-4xl font-black leading-[1.05] tracking-tighter md:text-5xl">
            One connected system, <br />
            <span className="text-[#F4D03F]">from hive to harvest.</span>
          </h2>
          <p className="text-lg leading-relaxed text-white/75">
            Most agtech adds a sensor here or an app there. BeeYield links the whole chain in one platform: the
            health of the colony, the work of the beekeeper and the pollination happening on the farm. When one
            system sees all three, pollination stops being a guess. It becomes measured, efficient and transparent.
          </p>
          <blockquote className="border-l-4 border-[#F4D03F] pl-5 text-base font-semibold leading-relaxed text-white/90">
            BeeYield is a data company. Sensors are how the data gets in. Better pollination is what the data makes
            possible. <span className="text-[#F4D03F]">Not a gadget. Infrastructure.</span>
          </blockquote>
        </motion.div>

        {/* Chain diagram */}
        <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
          <div className="grid gap-4 sm:grid-cols-3">
            {CHAIN.map((node, i) => (
              <motion.div
                key={node.label}
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md transition-colors hover:border-[#F4D03F]/40 hover:bg-white/[0.1]"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B9157] text-white shadow-lg shadow-[#1B9157]/30">
                  <node.icon className="h-5 w-5" />
                </div>
                <p className="mb-3 text-sm font-black tracking-tight">{node.label}</p>
                <ul className="space-y-1.5">
                  {node.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-xs text-white/65">
                      <span className="h-1 w-1 rounded-full bg-[#F4D03F]" /> {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Connectors */}
          <svg className="mx-auto my-2 h-14 w-full max-w-md" viewBox="0 0 300 56" fill="none" aria-hidden="true">
            <path d="M50 0 C50 30, 150 26, 150 56" stroke="#F4D03F" strokeOpacity="0.6" strokeWidth="2" strokeDasharray="4 5" />
            <path d="M150 0 L150 56" stroke="#F4D03F" strokeOpacity="0.6" strokeWidth="2" strokeDasharray="4 5" />
            <path d="M250 0 C250 30, 150 26, 150 56" stroke="#F4D03F" strokeOpacity="0.6" strokeWidth="2" strokeDasharray="4 5" />
          </svg>

          <div className="relative mx-auto max-w-sm rounded-3xl bg-gradient-to-br from-[#F4D03F] to-amber-500 p-[2px] shadow-2xl shadow-amber-500/20">
            <div className="flex items-center gap-4 rounded-[calc(1.5rem-2px)] bg-[#0A2612] px-6 py-5">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F4D03F] text-[#0A2612]">
                <Activity className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-emerald-400" />
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight">BeeYield Platform</p>
                <p className="text-xs text-white/60">Quantified, efficient, transparent pollination</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data you can trust */}
      <div className="mt-28">
        <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="mb-12 max-w-2xl">
          <h3 className="text-3xl font-black tracking-tighter md:text-4xl">
            Data you can <span className="text-[#F4D03F]">trust.</span>
          </h3>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {TRUST.map((item, i) => (
            <motion.article
              key={item.title}
              {...fadeUp}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group flex h-full flex-col rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[#F4D03F]/40"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F4D03F]/30 bg-[#F4D03F]/10 text-[#F4D03F] transition-transform group-hover:scale-110">
                <item.icon className="h-7 w-7" />
              </div>
              <h4 className="mb-3 text-2xl font-black tracking-tight">{item.title}</h4>
              <p className="flex-1 text-sm leading-relaxed text-white/70">{item.body}</p>
              {item.link && (
                <Link
                  to={item.link.to}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#F4D03F] transition-colors hover:text-amber-300"
                >
                  {item.link.label} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────
   3. OUR STORY — How we think about software and hardware
───────────────────────────────────────────────────────────────────── */

type PhotoBlock = {
  kicker: string;
  title: string;
  body: string[];
  image: string;
  imageAlt: string;
  icon: React.ElementType;
};

const SOFTWARE: PhotoBlock[] = [
  {
    kicker: "Software",
    icon: BellRing,
    title: "Targeted inspections, not blanket rounds",
    body: [
      "The platform watches every connected hive and flags which ones need attention and which can wait. When a colony breaks from its own normal pattern, such as a temperature swing, a sudden weight drop or a change in its sound, that becomes the reason to visit, before it becomes a loss.",
      "That is where the time savings come from, and where colonies get saved.",
    ],
    image: "/images/story/apisense-bees-closeup-2.png",
    imageAlt: "Worker bee on a BeeYield in-hive sensor board inside a Kenyan hive",
  },
  {
    kicker: "Software",
    icon: Eye,
    title: "One platform, both sides of the fence",
    body: [
      "Beekeepers see the state of every yard and what needs doing next. Growers follow the pollination story of their own farm as bloom unfolds. Both look at the same data, and that is the point.",
      "It never replaces the beekeeper. Monitoring gives experienced judgement better information and more time. The judgement stays human.",
    ],
    image: "/images/diseases/hive-inspection-1.png",
    imageAlt: "BeeYield beekeeper inspecting brood frames alongside an in-hive sensor",
  },
  {
    kicker: "Hardware",
    icon: Truck,
    title: "Field grade, not lab grade",
    body: [
      "Our devices live on working hives: Kibwezi heat, long dry seasons, sudden rains, termites and dust. We run them on log hives, top-bars and Langstroth boxes alike, and every lesson from our 22 deployed devices feeds back into how we install and protect them.",
    ],
    image: "/images/story/deployed-hive-antenna-1.png",
    imageAlt: "Solar antenna module mounted on a BeeYield hive roof in the field",
  },
  {
    kicker: "Hardware",
    icon: HandHeart,
    title: "Designed to disappear into the workflow",
    body: [
      "Installation is quick, and the equipment stays out of the colony's way and out of the beekeeper's way on inspection day. The best technology in a hive is the kind you forget is there.",
    ],
    image: "/images/story/hives/yellow-langstroth-closeup.jpg",
    imageAlt: "Hand-built yellow Langstroth hive in the BeeYield apiary",
  },
];

export const TechPhilosophySection = () => (
  <section
    id="how-we-think"
    aria-labelledby="how-we-think-title"
    className="relative overflow-hidden border-t border-neutral-100 bg-[#FFFDF8] py-24 sm:py-32"
  >
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div {...fadeUp} transition={{ duration: 0.7 }} className="mx-auto mb-20 max-w-3xl space-y-5 text-center">
        <SectionEyebrow>How We Think About Technology</SectionEyebrow>
        <h2 id="how-we-think-title" className="text-4xl font-black leading-tight tracking-tighter text-neutral-900 md:text-5xl">
          Built in our own apiary, <span className="text-[#1B9157]">before anyone else's.</span>
        </h2>
        <p className="text-lg font-medium leading-relaxed text-neutral-600">
          We lost colonies to pesticides we never saw coming. Everything we build is meant to make sure the next
          beekeeper sees it first. Here is what that looks like in software and in the field.
        </p>
      </motion.div>

      <div className="space-y-20 lg:space-y-28">
        {SOFTWARE.map((block, i) => {
          const reversed = i % 2 === 1;
          return (
            <motion.div
              key={block.title}
              {...fadeUp}
              transition={{ duration: 0.7 }}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <div className={`relative ${reversed ? "lg:order-2" : ""}`}>
                <div className="absolute -inset-3 rounded-[3rem] bg-gradient-to-br from-[#1B9157]/20 to-[#F4D03F]/25 opacity-70 blur-2xl" />
                <div className="group relative aspect-[4/3] overflow-hidden rounded-[2.5rem] border border-neutral-200 bg-neutral-900 shadow-2xl">
                  <img
                    src={block.image}
                    alt={block.imageAlt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />
                  <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-neutral-900 backdrop-blur">
                    <block.icon className="h-3.5 w-3.5 text-[#1B9157]" /> {block.kicker}
                  </span>
                </div>
              </div>
              <div className={`space-y-5 ${reversed ? "lg:order-1" : ""}`}>
                <span
                  className={`text-xs font-black uppercase tracking-[0.2em] ${
                    block.kicker === "Software" ? "text-[#1B9157]" : "text-amber-700"
                  }`}
                >
                  Our {block.kicker} Solution
                </span>
                <h3 className="text-3xl font-black leading-tight tracking-tighter text-neutral-900 md:text-4xl">
                  {block.title}
                </h3>
                {block.body.map((p, pi) => (
                  <p
                    key={pi}
                    className={
                      pi === block.body.length - 1 && block.body.length > 1
                        ? "text-base font-bold leading-relaxed text-neutral-900"
                        : "text-base font-medium leading-relaxed text-neutral-600"
                    }
                  >
                    {p}
                  </p>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────
   4. CROPS — Every crop gets its own program
───────────────────────────────────────────────────────────────────── */

const PROGRAM_STEPS: IconCard[] = [
  {
    icon: CalendarDays,
    title: "Timed to the bloom",
    body: "We track each crop's flowering window so colonies arrive as the first flowers open, not a week early or a week late.",
  },
  {
    icon: Gauge,
    title: "Sized to the canopy",
    body: "Our Hives per Acre model sets colony numbers by crop, flower density and tree age, so you pay for the bees the crop actually needs.",
  },
  {
    icon: Activity,
    title: "Watched through bloom",
    body: "Sensor-equipped hives report colony strength and activity while they work, so a weak colony is spotted and swapped before it costs fruit set.",
  },
  {
    icon: ClipboardCheck,
    title: "Recorded at petal fall",
    body: "At the end of bloom you get a record of what was delivered: how many hives, for how long, and how they performed.",
  },
];

export const CropProgramSection = () => (
  <section
    id="crop-programs"
    aria-labelledby="crop-programs-title"
    className="relative overflow-hidden bg-gradient-to-b from-white via-[#FFF7F9] to-[#FFF9F0] py-24 sm:py-28"
  >
    <div className="pointer-events-none absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full bg-pink-100/60 blur-[120px]" />
    <div className="pointer-events-none absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-amber-100/60 blur-[120px]" />

    <div className="container relative z-10 mx-auto px-4">
      <div className="mb-16 grid items-end gap-10 lg:grid-cols-2">
        <motion.div {...fadeUp} transition={{ duration: 0.7 }} className="space-y-5">
          <SectionEyebrow>Crop-Specific Pollination</SectionEyebrow>
          <h2 id="crop-programs-title" className="text-4xl font-black leading-tight tracking-tighter text-neutral-900 md:text-5xl">
            Every crop gets <span className="text-[#1B9157]">its own program.</span>
          </h2>
        </motion.div>
        <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }} className="text-lg font-medium leading-relaxed text-neutral-600">
          A mango panicle, an avocado flower and a sunflower head do not pollinate the same way. Each crop we
          serve gets its own plan: timed to its bloom, sized to its canopy, and monitored until the last petal falls.
        </motion.p>
      </div>

      <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PROGRAM_STEPS.map((card, i) => (
          <NumberedCard key={card.title} card={card} index={i} accent={i % 2 === 0 ? "green" : "amber"} />
        ))}
      </div>

      {/* Grower visibility panel */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.7 }}
        className="grid items-center gap-8 overflow-hidden rounded-[2.5rem] border border-[#1B9157]/20 bg-white p-8 shadow-xl shadow-emerald-900/5 sm:p-12 lg:grid-cols-[1.4fr_1fr]"
      >
        <div className="space-y-4">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">For Growers</span>
          <h3 className="text-2xl font-black tracking-tight text-neutral-900 md:text-3xl">
            See what you paid for.
          </h3>
          <p className="font-medium leading-relaxed text-neutral-600">
            Most farms rent hives without any objective way to know what they received. Under-pollinate and you
            lose harvest. Over-spend and you never find out. With BeeYield you follow the colonies on your own
            farm through the season, looking at the same data your beekeeper sees.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            to="/pollination-request"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#1B9157] px-8 font-bold text-white shadow-lg shadow-[#1B9157]/20 transition-all hover:scale-[1.02] hover:bg-[#157746]"
          >
            Plan My Crop's Program <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/precision-pollination"
            className="inline-flex h-14 items-center justify-center rounded-full border-2 border-neutral-200 px-8 font-bold text-neutral-900 transition-colors hover:bg-[#F9F7F2]"
          >
            How Monitoring Works
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);
