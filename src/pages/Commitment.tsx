import React from "react";
import { ArrowRight, Target, Wheat, TreePine, Heart, Users, Droplets, Zap, Building, Globe, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import LOGO from "@/assets/Logo.png";

const CommitmentPage = () => {
  const sdgs = [
    {
      number: 1,
      title: "No Poverty",
      description: "We provide training programs and a sustainable platform for smallholder farmers to earn income.",
      impact: "50+ farmers trained on bee disease prevention.",
      icon: Users,
    },
    {
      number: 2,
      title: "Zero Hunger",
      description: "Our pollination services directly boost agricultural yields, ensuring food security.",
      impact: "25 acres pollinated, increasing yields by up to 35%.",
      icon: Wheat,
    },
    {
      number: 6,
      title: "Clean Water",
      description: "Restoring local biodiversity through tree planting creates resilient ecosystems.",
      impact: "2,500+ trees restoring biodiversity.",
      icon: Droplets,
    },
    {
      number: 13,
      title: "Climate Action",
      description: "We've planted 2,500+ trees to restore habitats and capture carbon.",
      impact: "Estimated 30+ tons CO₂ captured annually.",
      icon: Globe,
    }
  ];

  return (
    <BeeYieldPageShell className="bg-background">
      <SEO 
        title="Our Commitment | SDG Goals | BeeYield"
        description="BeeYield's mission extends beyond the hive. We are actively contributing to 8 UN Sustainable Development Goals."
        url="/commitment"
      />

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION — Sync with Diseases Hero
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-beeyield-green/5 to-transparent pointer-events-none" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <motion.img
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                src={LOGO}
                alt="BeeYield Logo"
                className="h-24 md:h-36 w-auto mb-12 drop-shadow-2xl"
            />
            <Badge className="mb-6 bg-beeyield-green/10 text-beeyield-green border-beeyield-green/20 px-5 py-2 font-semibold text-[10px] rounded-full backdrop-blur-sm">
                Sustainable Development Goals
            </Badge>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900 leading-tight"
            >
              Our Commitment <br /> <span className="text-beeyield-green">To The Future</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-3xl font-medium"
            >
              BeeYield's mission extends beyond the hive. We are actively contributing to the UN Sustainable Development Goals, creating measurable impact.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" className="h-14 px-10 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20" asChild>
                <Link to="/esg">View ESG Impact</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SDG Grid — Sync with Diseases Grid */}
      <section className="py-24 bg-white border-b border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {sdgs.map((sdg, i) => (
              <motion.div 
                key={sdg.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-neutral-50 p-10 rounded-[2.5rem] border border-neutral-100 group hover:shadow-xl transition-all duration-500"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-beeyield-green font-bold text-xl shadow-sm group-hover:scale-110 transition-transform">
                    {sdg.number}
                  </div>
                  <sdg.icon size={20} className="text-neutral-400 group-hover:text-beeyield-green transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight leading-none group-hover:text-beeyield-green transition-colors">{sdg.title}</h3>
                <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-8 min-h-[60px]">{sdg.description}</p>
                <div className="pt-6 border-t border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={12} className="text-beeyield-green" />
                    <p className="text-[9px] font-bold text-beeyield-green uppercase tracking-widest">Impact Delivered</p>
                  </div>
                  <p className="text-xs font-bold text-neutral-900 leading-tight">{sdg.impact}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — Match Diseases CTA style */}
      <section className="bg-neutral-900 py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-beeyield-green/[0.05] to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="max-w-4xl mx-auto"
            >
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight leading-tight">
                    Join The <span className="text-beeyield-green">Movement</span>
                </h2>
                <p className="text-xl text-neutral-400 mb-10 font-medium max-w-2xl mx-auto leading-relaxed">
                  Whether you're a farmer, investor, or sustainability advocate—there's a place for you in our mission.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                    <Button size="lg" className="h-14 px-12 bg-white text-neutral-900 font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-xl shadow-white/10" asChild>
                        <Link to="/contact">Partner With Us</Link>
                    </Button>
                </div>
            </motion.div>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default CommitmentPage;
