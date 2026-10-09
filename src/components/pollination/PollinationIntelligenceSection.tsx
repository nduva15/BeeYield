import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Signal, Cpu, Satellite, CloudSun, Map as MapIcon, Activity, Layers,
  Compass, History, GitCompare, ArrowRight, CheckCircle2, FlaskConical,
  Hexagon, Sprout, TrendingUp, Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ────────────────────────────────────────────────────────────────────
   Pollination Intelligence — BeeYield
   Connects in-land (PLIP acoustic canopy nodes) and in-hive (BeeHUB)
   signals with satellite + weather context to make pollination
   measurable during the bloom window.
   ──────────────────────────────────────────────────────────────────── */

type Variant = "in_land" | "in_hive";

interface Props {
  /** Which page hosts the section — tweaks emphasis & default signal tab. */
  variant?: Variant;
  /** DOM id of the contact form to scroll to from the CTA. */
  formId?: string;
}

const LAYERS = [
  {
    tag: "Layer 1",
    status: "live" as const,
    icon: Hexagon,
    title: "Pollinator activity & colony condition",
    lead: "Are the bees present, active and strong enough to do the work?",
    questions: [
      "Are the colonies queen-right, strong and foraging?",
      "Are foragers actually reaching the crop rows?",
      "How does visitation differ between blocks of the field?",
    ],
    body: "PLIP acoustic nodes count bee flights in the canopy while BeeHUB units report brood temperature, weight and colony sound. Together they show whether hives are working the crop — not just whether boxes were dropped off.",
    accent: "emerald",
  },
  {
    tag: "Layer 2",
    status: "live" as const,
    icon: Satellite,
    title: "Environmental & satellite context",
    lead: "Read bee activity against the crop and its surroundings.",
    questions: [
      "Is the crop at the right flowering stage?",
      "Do temperature, wind and rain allow flight?",
      "Is competing forage pulling bees off the crop?",
      "Is a dip caused by the colony, the crop or the weather?",
    ],
    body: "Sentinel-2 vegetation indices, bloom phenology and Open-Meteo flight-window data are layered over activity, so growers can separate a weak colony from a cold morning or a late bloom.",
    accent: "amber",
  },
  {
    tag: "Layer 3 · R&D",
    status: "rnd" as const,
    icon: TrendingUp,
    title: "Fruit set, yield & quality forecasting",
    lead: "Translate pollination performance into expected harvest.",
    questions: [
      "Was pollination sufficient for this crop?",
      "What fruit set can current visitation support?",
      "What does this season's activity imply for yield?",
      "How might pollination quality affect grade & size?",
    ],
    body: "We are building crop-specific models that link measured visitation and conditions to fruit set, tonnage and export grade — moving from \"were bees active?\" to \"what will that pollination deliver?\".",
    accent: "violet",
  },
];

const SIGNALS = [
  {
    id: "field",
    where: "In the field",
    title: "Direct pollinator activity",
    icon: Signal,
    body: "Solar-powered PLIP acoustic nodes sit in the crop canopy and isolate bee wingbeat signatures (≈180–240 Hz) from tractors, wind and other insects — giving visit counts where pollination actually happens.",
    metrics: [["Flights / min", "Per node"], ["Coverage", "Per block"], ["Peak hours", "Daily curve"]],
  },
  {
    id: "hive",
    where: "In the hive",
    title: "Colony condition",
    icon: Cpu,
    body: "BeeHUB Queen and Sense units track brood-nest temperature, humidity, hive weight and acoustic state, flagging queenless, weak or pre-swarm colonies before they cost you pollination days.",
    metrics: [["Brood core", "34–35 °C"], ["Weight Δ", "Nectar flow"], ["Acoustics", "Queen state"]],
  },
  {
    id: "space",
    where: "From space",
    title: "Satellite observations",
    icon: Satellite,
    body: "Sentinel-2 NDVI and bloom-stage signals show crop vigour, flowering progress and surrounding forage — revealing when nearby vegetation competes with your crop for foragers.",
    metrics: [["NDVI", "5-day revisit"], ["Bloom stage", "% anthesis"], ["Forage", "2 km radius"]],
  },
  {
    id: "weather",
    where: "From the environment",
    title: "Weather",
    icon: CloudSun,
    body: "Hourly Open-Meteo temperature, wind, solar radiation and rainfall compute effective flight hours, so low activity on a cold, windy morning is not mistaken for a colony problem.",
    metrics: [["Flight hours", "Per day"], ["Wind", "< 18 km/h"], ["Temp", "> 13 °C"]],
  },
] as const;

const TODAY = [
  "Direct in-canopy pollinator activity measurement",
  "In-hive colony health & strength monitoring",
  "Satellite, bloom and weather context",
];
const VALIDATING = [
  "Models linking visitation with fruit set",
  "Crop-specific pollination targets (avocado, macadamia, coffee…)",
  "Yield and crop-quality forecasting",
];

const SEASON_FEATURES = [
  { icon: MapIcon, title: "Live field map", body: "Hive drops, PLIP nodes and bee activity across every block." },
  { icon: Activity, title: "Activity indicators", body: "How visitation shifts across zones and through the day." },
  { icon: Layers, title: "Environmental context", body: "Weather, bloom stage and NDVI side-by-side with activity." },
  { icon: Compass, title: "Actionable guidance", body: "Where to inspect, re-position hives or intervene next." },
  { icon: History, title: "Season history", body: "A pollination record to compare against fruit set and harvest." },
  { icon: GitCompare, title: "Cross-field comparison", body: "Benchmark farms, varieties and blocks to see where performance differs." },
];

/* ── Deterministic pseudo-random field for the heat map ─────────────── */
const COLS = 14;
const ROWS = 8;
function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const HIVES = [
  { c: 2, r: 2 }, { c: 6, r: 1 }, { c: 11, r: 3 }, { c: 4, r: 6 },
];

function activityAt(c: number, r: number, t: number) {
  // Activity decays with distance from hives + gentle diurnal pulse + noise.
  let v = 0;
  for (const h of HIVES) {
    const d = Math.hypot(c - h.c, r - h.r);
    v += Math.exp(-d / 3.2);
  }
  const pulse = 0.85 + 0.15 * Math.sin(t / 2 + c * 0.4 + r * 0.3);
  return Math.min(1, (v * 0.75 + seeded(c * 31 + r) * 0.2) * pulse);
}

function cellColor(v: number) {
  if (v > 0.7) return "bg-emerald-500";
  if (v > 0.5) return "bg-emerald-400/80";
  if (v > 0.35) return "bg-lime-300/80";
  if (v > 0.22) return "bg-amber-300/80";
  return "bg-rose-300/80";
}

const PollinationMap = () => {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((p) => p + 1), 1400);
    return () => clearInterval(id);
  }, []);

  const cells = useMemo(() => {
    const out: { c: number; r: number; v: number }[] = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) out.push({ c, r, v: activityAt(c, r, t) });
    return out;
  }, [t]);

  const avg = cells.reduce((s, x) => s + x.v, 0) / cells.length;
  const cold = cells.filter((x) => x.v <= 0.22).length;

  return (
    <div className="rounded-[2rem] bg-neutral-950 p-5 sm:p-7 border border-neutral-800 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <span className="text-[11px] font-mono text-neutral-400">plip://block-A · avocado · 42 ac</span>
        </div>
        <Badge className="bg-emerald-500/15 text-emerald-300 border-none text-[10px]">Live demo</Badge>
      </div>

      <div
        className="grid gap-1 relative"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        role="img"
        aria-label="Simulated pollination heat map showing bee activity across a field"
      >
        {cells.map(({ c, r, v }) => {
          const hive = HIVES.some((h) => h.c === c && h.r === r);
          const node = (c + r * 3) % 5 === 0;
          return (
            <motion.div
              key={`${c}-${r}`}
              animate={{ opacity: 0.55 + v * 0.45 }}
              transition={{ duration: 1.2 }}
              className={`aspect-square rounded-[4px] ${cellColor(v)} relative flex items-center justify-center`}
            >
              {hive && <Hexagon className="w-3/4 h-3/4 text-neutral-950 fill-amber-400" strokeWidth={2.5} />}
              {!hive && node && <span className="w-1.5 h-1.5 rounded-full bg-neutral-950/70" />}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 relative">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500">Field index</div>
          <div className="text-xl font-bold text-white tabular-nums">{Math.round(avg * 100)}</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500">Cold zones</div>
          <div className="text-xl font-bold text-rose-300 tabular-nums">{cold}</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500">Flight window</div>
          <div className="text-xl font-bold text-emerald-300">Open</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-neutral-400 relative">
        <span className="flex items-center gap-1.5"><Hexagon className="w-3 h-3 fill-amber-400 text-neutral-900" /> Hive drop</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-neutral-300" /> PLIP node</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-rose-300" />Low</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-amber-300" /></span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-lime-300" /></span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-emerald-500" />High</span>
      </div>
    </div>
  );
};

const accentClasses: Record<string, { ring: string; chip: string; icon: string }> = {
  emerald: { ring: "hover:border-emerald-300", chip: "bg-emerald-500/10 text-emerald-700", icon: "bg-emerald-500/10 text-emerald-600" },
  amber: { ring: "hover:border-amber-300", chip: "bg-amber-500/10 text-amber-700", icon: "bg-amber-500/10 text-amber-600" },
  violet: { ring: "hover:border-violet-300", chip: "bg-violet-500/10 text-violet-700", icon: "bg-violet-500/10 text-violet-600" },
};

export const PollinationIntelligenceSection = ({ variant = "in_land", formId }: Props) => {
  const [signal, setSignal] = useState<string>(variant === "in_hive" ? "hive" : "field");
  const active = SIGNALS.find((s) => s.id === signal) ?? SIGNALS[0];

  const scrollToForm = () => {
    if (formId) document.getElementById(formId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pollination-intelligence" className="relative overflow-hidden bg-[#FBFAF6] border-y border-neutral-200/70">
      {/* ── Intro / Problem ── */}
      <div className="container mx-auto px-4 max-w-6xl pt-28 pb-20">
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full uppercase tracking-wider">
            Pollination Intelligence
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-neutral-900 mb-6">
            Making pollination <span className="text-beeyield-green">visible</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            BeeYield combines in-canopy bee activity, in-hive colony condition, satellite imagery and weather into one
            measurable view of pollination — across the whole bloom window, not after harvest.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white border border-neutral-200/80"
          >
            <div className="text-[10px] uppercase tracking-wider font-bold text-rose-500 mb-3">The gap</div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Pollination drives the harvest — yet it goes unmeasured.</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              A hive count tells you how many boxes arrived. It doesn't tell you whether bees are working the crop,
              whether visits are spread evenly across blocks, or whether activity is enough for good fruit set.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="p-8 rounded-3xl bg-neutral-950 text-white border border-neutral-800"
          >
            <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 mb-3">The BeeYield approach</div>
            <h3 className="text-xl font-bold mb-3">Measure inside the pollination window.</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {variant === "in_hive"
                ? "BeeHUB sensors verify colony strength in every hive while PLIP nodes confirm those bees are reaching the flowers — while there's still time to act."
                : "PLIP nodes measure bee visits in the canopy while BeeHUB confirms colony strength — so you see what's happening and can respond while flowers are still open."}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Three layers ── */}
      <div className="container mx-auto px-4 max-w-6xl pb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h3 className="text-2xl lg:text-4xl font-bold tracking-tight text-neutral-900 mb-4">From bee activity to crop outcomes</h3>
          <p className="text-muted-foreground">
            Three connected layers. Two are running in Kenyan fields today; the third is being validated with growers and research partners.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {LAYERS.map((l, i) => {
            const a = accentClasses[l.accent];
            return (
              <motion.div
                key={l.tag}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-[2rem] bg-white border ${l.status === "rnd" ? "border-dashed border-violet-200" : "border-neutral-200/80"} ${a.ring} hover:shadow-xl transition-all flex flex-col`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.icon}`}>
                    <l.icon className="w-6 h-6" />
                  </div>
                  {l.status === "live" ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> In the field
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full">
                      <FlaskConical className="w-3 h-3" /> Validating
                    </span>
                  )}
                </div>
                <span className={`self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${a.chip} mb-3`}>{l.tag}</span>
                <h4 className="text-xl font-bold text-neutral-900 mb-2 tracking-tight">{l.title}</h4>
                <p className="text-sm font-medium text-neutral-700 mb-5">{l.lead}</p>
                <ul className="space-y-2 mb-6">
                  {l.questions.map((q) => (
                    <li key={q} className="flex gap-2 text-sm text-neutral-500">
                      <span className="text-neutral-300 mt-0.5">?</span>{q}
                    </li>
                  ))}
                </ul>
                <p className="mt-auto text-xs text-neutral-500 leading-relaxed pt-5 border-t border-neutral-100">{l.body}</p>
              </motion.div>
            );
          })}
        </div>
        <p className="text-[11px] text-neutral-400 mt-4 text-center">
          Layer 3 forecasting is under active development and validation with growers and research partners.
        </p>
      </div>

      {/* ── Signals tabs ── */}
      <div className="bg-white border-y border-neutral-200/70">
        <div className="container mx-auto px-4 max-w-6xl py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl lg:text-4xl font-bold tracking-tight text-neutral-900 mb-4">Connecting the signals behind pollination</h3>
            <p className="text-muted-foreground">The bee, the colony, the crop and the environment — read together, not in isolation.</p>
          </div>

          <div className="grid lg:grid-cols-[320px_1fr] gap-8">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3" role="tablist" aria-label="Pollination signal sources">
              {SIGNALS.map((s) => {
                const on = s.id === signal;
                return (
                  <button
                    key={s.id}
                    id={`pi-signal-${s.id}`}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setSignal(s.id)}
                    className={`text-left p-4 rounded-2xl border transition-all flex items-center gap-3 ${on ? "bg-neutral-950 border-neutral-950 text-white shadow-lg" : "bg-neutral-50 border-neutral-100 hover:border-neutral-300"}`}
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${on ? "bg-beeyield-green text-neutral-950" : "bg-white text-beeyield-green border border-neutral-100"}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`text-[10px] uppercase tracking-wider font-bold ${on ? "text-emerald-300" : "text-neutral-400"}`}>{s.where}</div>
                      <div className="text-sm font-bold">{s.title}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}
                className="p-8 sm:p-10 rounded-[2rem] bg-gradient-to-br from-neutral-50 to-emerald-50/40 border border-neutral-100"
                role="tabpanel"
              >
                <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-4 text-[10px]">{active.where}</Badge>
                <h4 className="text-2xl lg:text-3xl font-bold text-neutral-900 tracking-tight mb-4">{active.title}</h4>
                <p className="text-neutral-600 leading-relaxed mb-8 max-w-2xl">{active.body}</p>
                <div className="grid grid-cols-3 gap-4">
                  {active.metrics.map(([k, v]) => (
                    <div key={k} className="p-4 rounded-2xl bg-white border border-neutral-100">
                      <div className="text-sm font-bold text-neutral-900">{k}</div>
                      <div className="text-xs text-neutral-500">{v}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Map + pipeline ── */}
      <div className="container mx-auto px-4 max-w-6xl py-24">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 mb-5 text-[10px]">Spatial intelligence</Badge>
            <h3 className="text-2xl lg:text-4xl font-bold tracking-tight text-neutral-900 mb-5">
              From individual bee flights to a <span className="text-beeyield-green">pollination map</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Each PLIP node measures activity at one point in the crop. Combined across the field, those readings become a
              spatial picture — showing where bees are working hard, where visitation is thin, and where a hive move or a
              closer look is needed.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {["Bee flights", "Field pattern", "Pollination map", "Actionable insight"].map((s, i, arr) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${i === arr.length - 1 ? "bg-beeyield-green text-neutral-950" : "bg-neutral-100 text-neutral-700"}`}>{s}</span>
                  {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-neutral-300" />}
                </div>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <PollinationMap />
          </motion.div>
        </div>
      </div>

      {/* ── Roadmap ── */}
      <div className="container mx-auto px-4 max-w-5xl pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-white border border-emerald-200/70">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-neutral-900">Available today</h4>
            </div>
            <ul className="space-y-3">
              {TODAY.map((x) => (
                <li key={x} className="flex gap-3 text-sm text-neutral-600"><span className="w-1.5 h-1.5 mt-2 rounded-full bg-emerald-500 shrink-0" />{x}</li>
              ))}
            </ul>
          </div>
          <div className="p-8 rounded-3xl bg-white border border-dashed border-violet-200">
            <div className="flex items-center gap-2 mb-5">
              <FlaskConical className="w-5 h-5 text-violet-600" />
              <h4 className="font-bold text-neutral-900">Being developed & validated</h4>
            </div>
            <ul className="space-y-3">
              {VALIDATING.map((x) => (
                <li key={x} className="flex gap-3 text-sm text-neutral-600"><span className="w-1.5 h-1.5 mt-2 rounded-full bg-violet-400 shrink-0" />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Season at a glance ── */}
      <div className="bg-white border-t border-neutral-200/70">
        <div className="container mx-auto px-4 max-w-6xl py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl lg:text-4xl font-bold tracking-tight text-neutral-900 mb-4">The pollination season at a glance</h3>
            <p className="text-muted-foreground">Bee activity, colony condition and environmental context in one BeeYield dashboard.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SEASON_FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="group p-7 rounded-3xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:border-beeyield-green/30 hover:shadow-lg transition-all"
              >
                <div className="w-11 h-11 rounded-2xl bg-beeyield-green/10 text-beeyield-green flex items-center justify-center mb-5 group-hover:bg-beeyield-green group-hover:text-white transition-colors">
                  <f.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-neutral-900 mb-1.5">{f.title}</h4>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Validation programme CTA ── */}
      <div className="container mx-auto px-4 max-w-6xl pb-28">
        <div className="relative rounded-[2.5rem] bg-neutral-950 text-white p-10 sm:p-14 overflow-hidden">
          <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-beeyield-green/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-24 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sprout className="w-4 h-4" /> 2027 validation programme
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">Let's prove it on your fields.</h3>
              <p className="text-neutral-400 max-w-xl">
                We're selecting growers and research partners to validate BeeYield Pollination Intelligence — including
                the yield-forecasting layer — across avocado, macadamia, coffee and horticulture.
              </p>
            </div>
            <Button
              id="pi-join-programme"
              size="lg"
              onClick={scrollToForm}
              className="h-14 px-8 bg-beeyield-green text-neutral-950 hover:bg-emerald-400 font-bold text-sm rounded-2xl shadow-xl shadow-beeyield-green/20"
            >
              <Eye className="w-4 h-4 mr-2" /> Join the 2027 programme <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PollinationIntelligenceSection;
