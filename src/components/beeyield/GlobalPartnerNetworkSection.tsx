import React from "react";
import { motion } from "framer-motion";
import {
  Globe2, Users, GraduationCap, Handshake, ArrowRight,
  Microscope, Satellite, BrainCircuit, ThermometerSun, Check
} from "lucide-react";
import RESEARCH_LAB from "@/assets/bee-research-lab.jpg";

/**
 * "Building a global understanding of pollinators" — BeeYield's partner network.
 * Three partner groups: beekeepers & associations, universities & research
 * centres, and business partners. Copy is intentionally free of invented
 * partner names or figures; add real logos/stats once agreements are public.
 */

const PARTNERS = [
  {
    icon: Users,
    tag: "Field network",
    title: "Beekeepers & beekeeping associations",
    text: "Working through cooperatives and associations lets us reach thousands of beekeepers at once, and puts their field knowledge at the centre of what we build.",
    points: ["Co-designed tools and training", "Shared colony health insights", "Fair access to pollination contracts"],
  },
  {
    icon: GraduationCap,
    tag: "Science network",
    title: "Universities & research centres",
    text: "With research institutions we study bee diseases, analyse satellite and climate data, and train the AI models that flag threats to apiaries before losses show.",
    points: ["Bee disease & pest research", "Satellite and bloom analysis", "Predictive threat models"],
  },
  {
    icon: Handshake,
    tag: "Industry network",
    title: "Business partners",
    text: "Industry partners help us take BeeYield to growers and beekeepers in new markets, from hardware distribution to agribusiness integration.",
    points: ["Regional distribution", "Agribusiness integrations", "Joint innovation programmes"],
  },
];

const RESEARCH_FOCUS = [
  { icon: Microscope, label: "Bee diseases" },
  { icon: Satellite, label: "Satellite data" },
  { icon: BrainCircuit, label: "AI forecasting" },
  { icon: ThermometerSun, label: "Climate zones" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

interface GlobalPartnerNetworkSectionProps {
  id?: string;
  className?: string;
}

export const GlobalPartnerNetworkSection: React.FC<GlobalPartnerNetworkSectionProps> = ({
  id = "global-partner-network",
  className = "",
}) => {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`relative overflow-hidden py-24 sm:py-32 bg-gradient-to-b from-white via-[#FFFBEF] to-[#F6FAF3] border-y border-amber-100/70 ${className}`}
    >
      {/* Ambient glow + orbit lines */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 right-0 w-[520px] h-[520px] rounded-full bg-[#F4D03F]/20 blur-[120px]" />
        <div className="absolute bottom-0 -left-32 w-[520px] h-[520px] rounded-full bg-[#1B9157]/12 blur-[130px]" />
        <svg className="absolute left-1/2 top-24 -translate-x-1/2 w-[1100px] h-[1100px] opacity-[0.07] text-[#1B9157]" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.15" />
          <ellipse cx="50" cy="50" rx="48" ry="18" stroke="currentColor" strokeWidth="0.15" />
          <ellipse cx="50" cy="50" rx="18" ry="48" stroke="currentColor" strokeWidth="0.15" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="0.15" />
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
            <Globe2 className="w-3.5 h-3.5" />
            Global Partner Network
          </span>
          <h2
            id={`${id}-heading`}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.02] text-neutral-900"
          >
            Building a{" "}
            <span className="relative inline-block">
              <span className="relative z-10">global understanding</span>
              <span className="absolute left-0 right-0 bottom-1 sm:bottom-2 h-3 sm:h-4 bg-[#F4D03F]/60 -z-0 rounded-sm" />
            </span>{" "}
            of <span className="text-[#1B9157]">pollinators</span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-3xl mx-auto">
            We are growing a network of partners so BeeYield can serve beekeepers and growers wherever they are.
            Together with beekeepers and scientists, we adapt our tools to different climate zones, run field
            research, and push beekeeping forward.
          </p>
        </motion.div>

        {/* Partner cards */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mb-20">
          {PARTNERS.map((p, i) => (
            <motion.article
              key={p.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="group relative flex flex-col p-7 rounded-[2rem] bg-white/90 backdrop-blur border border-neutral-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#1B9157]/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#1B9157]/10 text-[#1B9157] flex items-center justify-center group-hover:bg-[#1B9157] group-hover:text-white group-hover:rotate-[-6deg] transition-all duration-300">
                  <p.icon className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase text-[#B7950B] bg-[#F4D03F]/20 px-3 py-1 rounded-full">
                  {p.tag}
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-neutral-900 mb-3 leading-snug">{p.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-6">{p.text}</p>
              <ul className="mt-auto space-y-2.5 pt-5 border-t border-dashed border-neutral-200">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2.5 text-sm font-semibold text-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-[#1B9157]/12 text-[#1B9157] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        {/* Research spotlight */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/15 aspect-[3/2]">
              <img
                src={RESEARCH_LAB}
                alt="Researcher examining a honeybee brood frame and honey samples in a university laboratory"
                loading="lazy"
                className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/50 via-transparent to-transparent" />
            </div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 left-6 right-6 sm:right-auto sm:max-w-sm p-4 rounded-2xl bg-white/95 backdrop-blur border border-neutral-200 shadow-xl"
            >
              <p className="text-[10px] font-black tracking-widest uppercase text-[#1B9157] mb-2">Joint research focus</p>
              <div className="flex flex-wrap gap-2">
                {RESEARCH_FOCUS.map((r) => (
                  <span key={r.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-xs font-bold text-neutral-800">
                    <r.icon className="w-3.5 h-3.5 text-[#1B9157]" />
                    {r.label}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-6 pt-8 lg:pt-0"
          >
            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter leading-tight text-neutral-900">
              Science in the lab, <span className="text-[#1B9157]">proof in the field.</span>
            </h3>
            <p className="text-neutral-600 leading-relaxed text-base sm:text-lg">
              Every climate zone stresses colonies differently. By pairing laboratory research with real apiaries,
              we validate what our models predict and tune them to local bees, local flora and local weather.
            </p>
            <p className="text-neutral-600 leading-relaxed text-base sm:text-lg">
              Run a beekeeping association, a research group or an agribusiness? We would like to build this with you.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="/contact"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white font-bold shadow-lg shadow-neutral-900/20 hover:bg-[#1B9157] transition-colors"
              >
                Become a partner
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GlobalPartnerNetworkSection;
