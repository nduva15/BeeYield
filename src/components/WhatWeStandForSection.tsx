import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

/**
 * "Who We Are And What We Stand For" — six numbered values.
 * Shared by the Our Story and In-Land pages.
 */

const VALUES = [
  "We are pioneers",
  "We are technologists",
  "We are bridge builders",
  "We are for the greater good",
  "We are collaborators",
  "We are data-driven",
];

export const WhatWeStandForSection = () => (
  <section id="what-we-stand-for" className="py-24 bg-white border-y border-neutral-100">
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
          Our Values
        </Badge>
        <h2 className="text-3xl lg:text-5xl font-light tracking-tight text-neutral-900">
          Who We Are And <span className="font-bold text-beeyield-green">What We Stand For</span>
        </h2>
        <div className="h-1 w-20 bg-beeyield-green mx-auto mt-6 rounded-full" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {VALUES.map((value, index) => (
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="flex items-stretch rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-h-[7rem]"
          >
            <div className="w-24 shrink-0 bg-emerald-900/70 flex items-center justify-center">
              <span className="text-5xl font-serif font-semibold text-white">{index + 1}</span>
            </div>
            <div className="flex-1 bg-beeyield-green flex items-center px-6">
              <p className="text-white font-bold text-lg leading-snug">{value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WhatWeStandForSection;
