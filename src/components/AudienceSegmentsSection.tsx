import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Truck, Sprout, Building2, type LucideIcon } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   "Tech that works for everyone" — audience segments
   Shared across Home, Our Story and In-Land Pollination pages.
═══════════════════════════════════════════════════════════════ */

interface AudienceSegment {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  cta: { label: string; to: string };
  accent: string; // tailwind classes for icon chip
}

const SEGMENTS: AudienceSegment[] = [
  {
    id: "commercial-beekeepers",
    icon: Truck,
    eyebrow: "Beekeepers",
    title: "For Commercial Beekeepers",
    body:
      "Know which hives need you before you drive three hours to find out. Fewer wasted trips, stronger colonies, better paid pollination work. BeeYield is built around your season and your workflow.",
    image: "/images/story/deployed-hive-antenna-2.png",
    imageAlt: "IoT-monitored BeeYield hive with solar antenna on a field stand",
    cta: { label: "See the hive tech", to: "/pollination-solutions" },
    accent: "bg-amber-500/15 text-amber-600",
  },
  {
    id: "growers-and-farms",
    icon: Sprout,
    eyebrow: "Growers",
    title: "For Growers and Farms",
    body:
      "If your crop depends on bees, you should be able to see what you are paying for. Talk to us about your crop, region and season.",
    image: "/images/pollination/mango-orchard-flowering.jpg",
    imageAlt: "Flowering mango orchard in Makueni ready for precision pollination",
    cta: { label: "Talk to us about your crop", to: "/pollination-request" },
    accent: "bg-beeyield-green/15 text-beeyield-green",
  },
  {
    id: "corporate-and-investors",
    icon: Building2,
    eyebrow: "Corporate & Investors",
    title: "For Corporate and Investors",
    body:
      "We are a data company building the infrastructure for agriculture that depends on bees, one connected system from hive to harvest. If that dependency matters to your supply chain or your portfolio, we should talk.",
    image: "/images/pollination/gateway-solar-node.png",
    imageAlt: "Solar-powered BeeYield LTE gateway relaying hive data to the cloud",
    cta: { label: "Let's talk", to: "/contact" },
    accent: "bg-neutral-900/10 text-neutral-900",
  },
];

interface AudienceSegmentsSectionProps {
  className?: string;
}

export const AudienceSegmentsSection: React.FC<AudienceSegmentsSectionProps> = ({ className = "" }) => (
  <section
    id="tech-for-everyone"
    aria-labelledby="tech-for-everyone-heading"
    className={`py-20 sm:py-28 bg-gradient-to-b from-[#FFFDF8] via-white to-[#F4F9F4] border-y border-neutral-100 relative overflow-hidden ${className}`}
  >
    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />
    <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-beeyield-green/15 blur-3xl pointer-events-none" />

    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="mx-auto max-w-3xl text-center mb-14 sm:mb-16">
        <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-4 px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider">
          Who We Serve
        </Badge>
        <h2
          id="tech-for-everyone-heading"
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-900 leading-tight"
        >
          Tech that works <span className="text-beeyield-green">for everyone</span>
        </h2>
      </div>

      <div className="grid gap-6 lg:gap-8 md:grid-cols-3">
        {SEGMENTS.map((seg, i) => (
          <motion.article
            key={seg.id}
            id={`segment-${seg.id}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group flex flex-col rounded-[2rem] overflow-hidden bg-white border border-neutral-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
              <img
                src={seg.image}
                alt={seg.imageAlt}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-widest text-white/90">
                {seg.eyebrow}
              </span>
            </div>

            <div className="flex flex-col flex-1 p-7 sm:p-8">
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${seg.accent}`}>
                <seg.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">{seg.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed flex-1">{seg.body}</p>
              <Link
                id={`segment-cta-${seg.id}`}
                to={seg.cta.to}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-neutral-900 group-hover:text-beeyield-green transition-colors"
              >
                {seg.cta.label}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default AudienceSegmentsSection;
