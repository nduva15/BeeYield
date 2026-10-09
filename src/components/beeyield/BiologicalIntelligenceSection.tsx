import React from "react";
import { motion } from "framer-motion";
import {
  Dna, Satellite, BrainCircuit, Eye, TrendingUp, Zap,
  Sprout, ExternalLink, ArrowRight
} from "lucide-react";

/**
 * "Turning Nature into Intelligence" — BeeYield's Biological Intelligence story.
 * Shared between the Home page (PollinationServices) and Crops We Pollinate.
 * Apisense is credited as the in-hive sensing technology partner.
 */

const INPUTS = [
  {
    icon: Dna,
    title: "Biological signals",
    text: "Sound, temperature and activity read straight from inside the colony.",
  },
  {
    icon: Satellite,
    title: "Environmental & satellite data",
    text: "Weather, bloom timing and land cover around every apiary and field.",
  },
  {
    icon: BrainCircuit,
    title: "AI",
    text: "Models that connect the signals and learn what normal looks like.",
  },
];

const OUTCOMES = [
  { icon: Eye, label: "Understand", text: "what is happening now" },
  { icon: TrendingUp, label: "Predict", text: "what comes next" },
  { icon: Zap, label: "Act earlier", text: "before losses show" },
];

const JOURNEY = [
  {
    step: "Where we started",
    text: "Helping beekeepers understand their colonies before problems become visible.",
  },
  {
    step: "Why it matters",
    text: "Strong colonies drive effective pollination, and pollination underpins agriculture and food production.",
  },
  {
    step: "What we do today",
    text: "Monitoring bee health and measuring pollination performance in the crops we serve.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

interface BiologicalIntelligenceSectionProps {
  id?: string;
  className?: string;
}

export const BiologicalIntelligenceSection: React.FC<BiologicalIntelligenceSectionProps> = ({
  id = "biological-intelligence",
  className = "",
}) => {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`relative overflow-hidden py-24 sm:py-32 bg-gradient-to-b from-[#FFFDF7] via-[#F6FAF3] to-[#EEF6EC] border-y border-emerald-100/80 ${className}`}
    >
      {/* Ambient glow + honeycomb texture */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-[#F4D03F]/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-24 w-[560px] h-[560px] rounded-full bg-[#1B9157]/15 blur-[130px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.05] text-[#1B9157]">
          <defs>
            <pattern id={`${id}-hex`} width="28" height="48" patternUnits="userSpaceOnUse">
              <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z M14 32 L14 48" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${id}-hex)`} />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center mb-16 space-y-5"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#1B9157]/25 text-[#1B9157] text-xs font-black tracking-wide shadow-sm backdrop-blur">
            <Sprout className="w-3.5 h-3.5" />
            Biological Intelligence
          </span>
          <h2
            id={`${id}-heading`}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.02] text-neutral-900"
          >
            Turning <span className="text-[#1B9157]">Nature</span> into{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Intelligence</span>
              <span className="absolute left-0 right-0 bottom-1 sm:bottom-2 h-3 sm:h-4 bg-[#F4D03F]/60 -z-0 rounded-sm" />
            </span>
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-neutral-700 tracking-tight">
            Understanding biology before the outcome is visible.
          </p>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-3xl mx-auto">
            BeeYield combines biological signals from inside the hive with environmental and satellite data,
            then applies AI to understand what is happening across a pollination system, predict what comes
            next, and help farmers and beekeepers act earlier.
          </p>
        </motion.div>

        {/* Signal flow: inputs -> outcomes */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-stretch mb-20">
          <div className="grid gap-4">
            {INPUTS.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex items-start gap-4 p-5 rounded-3xl bg-white/90 backdrop-blur border border-neutral-200/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-[#1B9157]/40 transition-all"
              >
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#1B9157]/10 text-[#1B9157] flex items-center justify-center group-hover:bg-[#1B9157] group-hover:text-white transition-colors">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-neutral-900 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Connector */}
          <div className="flex lg:flex-col items-center justify-center gap-3 py-2" aria-hidden="true">
            <div className="h-px w-16 lg:h-24 lg:w-px bg-gradient-to-r lg:bg-gradient-to-b from-transparent via-[#1B9157]/50 to-transparent" />
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-full bg-neutral-900 text-[#F4D03F] flex items-center justify-center shadow-xl shadow-emerald-900/20"
            >
              <ArrowRight className="w-6 h-6 rotate-90 lg:rotate-0" />
            </motion.div>
            <div className="h-px w-16 lg:h-24 lg:w-px bg-gradient-to-r lg:bg-gradient-to-b from-transparent via-[#1B9157]/50 to-transparent" />
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-[2.5rem] p-8 sm:p-10 bg-gradient-to-br from-[#0F3D26] via-[#145C38] to-[#1B9157] text-white shadow-2xl shadow-emerald-900/25 overflow-hidden flex flex-col justify-center"
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#F4D03F]/25 blur-3xl" aria-hidden="true" />
            <p className="text-xs font-black tracking-widest uppercase text-[#F4D03F] mb-6">What it gives you</p>
            <ul className="space-y-5 relative">
              {OUTCOMES.map((o) => (
                <li key={o.label} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                    <o.icon className="w-5 h-5 text-[#F4D03F]" />
                  </div>
                  <p className="text-lg sm:text-xl leading-tight">
                    <span className="font-black">{o.label}</span>{" "}
                    <span className="text-white/75 font-medium">{o.text}</span>
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Mission + journey */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter leading-tight text-neutral-900">
              The future of resilient agriculture starts with{" "}
              <span className="text-[#1B9157]">healthier bees.</span>
            </h3>
            <p className="text-neutral-600 leading-relaxed text-base sm:text-lg">
              BeeYield grew out of the real challenges beekeepers face every day, from protecting colony health
              to knowing what is actually happening inside the hive.
            </p>
            <p className="text-neutral-600 leading-relaxed text-base sm:text-lg">
              We build smart, accessible technology that pairs biological signals, environmental data and AI
              with easy-to-use digital tools, turning complex data into clear, actionable insight. That means
              risks are spotted before they become visible, and decisions are better informed.
            </p>
            <a
              href="https://apisense.ai/en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 shadow-sm text-sm font-bold text-neutral-800 hover:border-[#1B9157]/50 hover:text-[#1B9157] transition-colors"
            >
              In-hive sensing in partnership with <span className="text-[#1B9157]">Apisense</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          <ol className="relative border-l-2 border-dashed border-[#1B9157]/30 pl-8 space-y-8">
            {JOURNEY.map((j, i) => (
              <motion.li
                key={j.step}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative"
              >
                <span className="absolute -left-[46px] top-0 w-8 h-8 rounded-full bg-[#F4D03F] text-neutral-900 text-sm font-black flex items-center justify-center shadow-md ring-4 ring-[#FFFDF7]">
                  {i + 1}
                </span>
                <p className="text-xs font-black tracking-widest uppercase text-[#1B9157] mb-1">{j.step}</p>
                <p className="text-neutral-800 font-semibold leading-relaxed">{j.text}</p>
              </motion.li>
            ))}

            <motion.li
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              <span className="absolute -left-[46px] top-1 w-8 h-8 rounded-full bg-[#1B9157] text-white flex items-center justify-center shadow-md ring-4 ring-[#FFFDF7]">
                <Sprout className="w-4 h-4" />
              </span>
              <div className="p-6 rounded-3xl bg-white/90 border border-[#1B9157]/20 shadow-sm">
                <p className="text-lg font-black text-neutral-900 tracking-tight leading-snug">
                  This is BeeYield: starting with bees, advancing Biological Intelligence, and building a more
                  resilient future for agriculture.
                </p>
              </div>
            </motion.li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default BiologicalIntelligenceSection;
