import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Signal, Cpu, Satellite, CloudSun,
  FlaskConical, Hexagon, TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

/* ── Authentic BeeYield field photos (same archive as Our Story) ───── */
const PHOTOS = {
  apiaryRow: "/images/story/hives/apiary-langstroth-row.jpg",
  langstrothCloseup: "/images/story/hives/yellow-langstroth-closeup.jpg",
  apiaryField1: "/images/story/hives/apiary-hive-field-1.jpg",
  apiaryField2: "/images/story/hives/apiary-hive-field-2.jpg",
  beekeeperTwilight: "/images/story/hives/beekeeper-inspection-twilight.jpg",
  acaciaCanopy: "/images/story/hives/acacia-canopy-traditional-hives.jpg",
  deployedHive1: "/images/story/deployed-hive-antenna-1.png",
  deployedHive2: "/images/story/deployed-hive-antenna-2.png",
  apisenseCluster: "/images/story/apisense-bees-cluster-1.png",
  apisenseCloseup: "/images/story/apisense-bees-closeup-2.png",
  solarGateway: "/images/pollination/gateway-solar-node.png",
  hiveScale: "/images/pollination/hive-scale-loadcell.png",
  combProbe: "/images/pollination/hive-comb-inspection-8.png",
};

const MOSAIC = [
  { src: PHOTOS.apiaryRow, tag: "Our apiary", caption: "Langstroth colonies on raised stands, Makueni", big: true },
  { src: PHOTOS.deployedHive1, tag: "Deployed tech", caption: "Solar telemetry module on a field hive" },
  { src: PHOTOS.hiveScale, tag: "In-hive", caption: "Load-cell scale tracking nectar flow" },
  { src: PHOTOS.langstrothCloseup, tag: "Our hives", caption: "Locally built, painted for thermal control" },
  { src: PHOTOS.beekeeperTwilight, tag: "Field team", caption: "Evening colony inspection" },
];

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
    image: PHOTOS.apisenseCluster,
    imageAlt: "Worker bees clustered around a BeeYield in-hive sensor probe",
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
    image: PHOTOS.apiaryField2,
    imageAlt: "BeeYield hives placed in the surrounding forage landscape",
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
    image: PHOTOS.combProbe,
    imageAlt: "Top-down view of brood frames in a precision-pollination hive",
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
    image: PHOTOS.deployedHive2,
    caption: "Solar node on a hive stand at an orchard boundary",
  },
  {
    id: "hive",
    where: "In the hive",
    title: "Colony condition",
    icon: Cpu,
    body: "BeeHUB Queen and Sense units track brood-nest temperature, humidity, hive weight and acoustic state, flagging queenless, weak or pre-swarm colonies before they cost you pollination days.",
    metrics: [["Brood core", "34–35 °C"], ["Weight Δ", "Nectar flow"], ["Acoustics", "Queen state"]],
    image: PHOTOS.apisenseCloseup,
    caption: "Forager bee walking across a BeeYield sensor board",
  },
  {
    id: "space",
    where: "From space",
    title: "Satellite observations",
    icon: Satellite,
    body: "Sentinel-2 NDVI and bloom-stage signals show crop vigour, flowering progress and surrounding forage — revealing when nearby vegetation competes with your crop for foragers.",
    metrics: [["NDVI", "5-day revisit"], ["Bloom stage", "% anthesis"], ["Forage", "2 km radius"]],
    image: PHOTOS.apiaryField1,
    caption: "Apiary and surrounding forage — what the satellite sees",
  },
  {
    id: "weather",
    where: "From the environment",
    title: "Weather",
    icon: CloudSun,
    body: "Hourly Open-Meteo temperature, wind, solar radiation and rainfall compute effective flight hours, so low activity on a cold, windy morning is not mistaken for a colony problem.",
    metrics: [["Flight hours", "Per day"], ["Wind", "< 18 km/h"], ["Temp", "> 13 °C"]],
    image: PHOTOS.solarGateway,
    caption: "Autonomous solar LTE gateway in the apiary yard",
  },
] as const;



const accentClasses: Record<string, { ring: string; chip: string; icon: string }> = {
  emerald: { ring: "hover:border-emerald-300", chip: "bg-emerald-500/10 text-emerald-700", icon: "bg-emerald-500/10 text-emerald-600" },
  amber: { ring: "hover:border-amber-300", chip: "bg-amber-500/10 text-amber-700", icon: "bg-amber-500/10 text-amber-600" },
  violet: { ring: "hover:border-violet-300", chip: "bg-violet-500/10 text-violet-700", icon: "bg-violet-500/10 text-violet-600" },
};

export const PollinationIntelligenceSection = ({ variant = "in_land" }: Props) => {
  const [signal, setSignal] = useState<string>(variant === "in_hive" ? "hive" : "field");
  const active = SIGNALS.find((s) => s.id === signal) ?? SIGNALS[0];

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
            className="p-8 rounded-3xl bg-emerald-50 text-neutral-900 border border-emerald-200"
          >
            <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 mb-3">The BeeYield approach</div>
            <h3 className="text-xl font-bold mb-3">Measure inside the pollination window.</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {variant === "in_hive"
                ? "BeeHUB sensors verify colony strength in every hive while PLIP nodes confirm those bees are reaching the flowers — while there's still time to act."
                : "PLIP nodes measure bee visits in the canopy while BeeHUB confirms colony strength — so you see what's happening and can respond while flowers are still open."}
            </p>
          </motion.div>
        </div>

        {/* ── Field photo mosaic ── */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[440px]">
          {MOSAIC.map((p, i) => (
            <motion.figure
              key={p.src}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className={`group relative overflow-hidden rounded-3xl bg-neutral-200 ${p.big ? "col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto" : "aspect-square md:aspect-auto"}`}
            >
              <img
                src={p.src}
                alt={p.caption}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/10 to-transparent" />
              <figcaption className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <span className="inline-block mb-2 px-2.5 py-1 rounded-full bg-beeyield-green text-neutral-950 text-[9px] font-bold uppercase tracking-wider">{p.tag}</span>
                <p className={`text-white font-semibold leading-snug ${p.big ? "text-base sm:text-lg" : "text-xs sm:text-sm"}`}>{p.caption}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
        <p className="text-[11px] text-neutral-400 mt-3 text-center">Real photos from BeeYield apiaries and deployments in Kenya.</p>
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
                className={`group relative p-8 pt-0 rounded-[2rem] bg-white border overflow-hidden ${l.status === "rnd" ? "border-dashed border-violet-200" : "border-neutral-200/80"} ${a.ring} hover:shadow-xl transition-all flex flex-col`}
              >
                <div className="relative -mx-8 mb-6 h-44 overflow-hidden">
                  <img
                    src={l.image}
                    alt={l.imageAlt}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${l.status === "rnd" ? "saturate-[0.6]" : ""}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/0 to-transparent" />
                </div>
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
                <div className="grid xl:grid-cols-[1fr_260px] gap-8 items-start mb-8">
                  <div>
                    <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-4 text-[10px]">{active.where}</Badge>
                    <h4 className="text-2xl lg:text-3xl font-bold text-neutral-900 tracking-tight mb-4">{active.title}</h4>
                    <p className="text-neutral-600 leading-relaxed max-w-2xl">{active.body}</p>
                  </div>
                  <figure className="relative rounded-2xl overflow-hidden aspect-[4/3] xl:aspect-[4/5] shadow-lg ring-1 ring-black/5">
                    <img src={active.image} alt={active.caption} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 to-transparent" />
                    <figcaption className="absolute bottom-0 p-3 text-[11px] font-medium text-white leading-snug">{active.caption}</figcaption>
                  </figure>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {(active.metrics as ReadonlyArray<readonly [string, string]>).map(([k, v]) => (
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

    </section>
  );
};

export default PollinationIntelligenceSection;

