import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Cpu, Sprout, Play, ArrowRight, Heart, TreePine, Home, Hexagon, ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import impactBeekeeping from "@/assets/impact-beekeeping.jpg";
import BEEYIELD_LOGO from "@/assets/Logo.png";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";

const OurStory = () => {
  return (
    <BeeYieldPageShell className="bg-background text-foreground">
      <SEO 
        title="Our Story | BeeYield"
        description="Born in Kibwezi, Makueni County, Kenya — a story of family, resilience, and a mission to improve pollination for a sustainable future."
        url="/ourstory"
      />
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION — Exact Match to Diseases Hero
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
                src={BEEYIELD_LOGO}
                alt="BeeYield Logo"
                className="h-24 md:h-36 w-auto mb-12 drop-shadow-2xl"
            />
            <Badge className="mb-6 bg-beeyield-green/10 text-beeyield-green border-beeyield-green/20 px-5 py-2 font-semibold text-[10px] rounded-full backdrop-blur-sm">
                Our Story
            </Badge>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900 leading-tight"
            >
              The Story of <br />
              <span className="text-beeyield-green">BeeYield</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl font-medium"
            >
              Born in Kibwezi, Makueni County, Kenya — a story of family, resilience, and a mission to improve pollination.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Origin Story — Match Diseases "Intelligent Protection" pattern */}
      <section className="py-24 bg-white border-b border-neutral-100 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-center">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="relative group"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-neutral-200/60">
                <img src={impactBeekeeping} alt="Early days in Kibwezi" className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-neutral-900 p-8 rounded-[2rem] border-4 border-white shadow-2xl max-w-xs rotate-2">
                 <p className="text-beeyield-green font-bold text-sm italic">"Sometimes, the spark comes from boredom, family, and a little bit of courage."</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Badge className="bg-neutral-100 text-neutral-500 border-none px-4 py-1.5 font-bold text-[9px] uppercase tracking-widest mb-2 inline-block">
                Kibwezi, Kenya • 2020
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
                A Family <br />
                <span className="text-beeyield-green">Mission</span>
              </h2>
              <div className="space-y-4 text-muted-foreground font-medium text-lg leading-relaxed">
                <p>
                  In 2020, Timothy Nduva found himself restless in rural Kibwezi. While attending Strathmore University, Timothy’s curiosity and drive for innovation grew. The challenges of the pandemic became the spark for BeeYield.
                </p>
                <p>
                  But BeeYield was never a solo journey. Timothy's sisters, Agatha and Carole, brought their own unique skills—from web development and design to IoT research. Together, they transformed a small family apiary into a platform for impact.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* growth journey — Match Diseases "Efficiency" grid */}
      <section className="py-24 bg-neutral-50/50 border-b border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
             <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">184 Hives & Growing</h2>
             <div className="h-1 w-20 bg-beeyield-green mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { number: "184+", label: "Beehives", icon: Home },
              { number: "1M+", label: "Bee Colonies", icon: Users },
              { number: "2,500+", label: "Trees Planted", icon: TreePine },
              { number: "25+", label: "Acres served", icon: Sprout },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-8 rounded-[2.5rem] border border-neutral-200/60 text-center shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center mx-auto mb-6 text-beeyield-green">
                  <stat.icon size={24} />
                </div>
                <p className="text-3xl font-bold text-neutral-900 mb-1">{stat.number}</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values — Match Diseases "How it Works" grid */}
      <section className="py-24 bg-white border-b border-neutral-100">
        <div className="container mx-auto px-4">
           <div className="max-w-4xl mx-auto text-center mb-20">
             <Badge className="bg-beeyield-green/10 text-beeyield-green border-none px-4 py-1.5 font-bold text-[10px] rounded-full mb-4">Values</Badge>
             <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900">What We Stand For</h2>
           </div>

           <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              { icon: Users, title: "Family-Driven", desc: "Built by siblings Timothy, Agatha, and Carole — we combine passion with purpose." },
              { icon: Sprout, title: "Guardians of Nature", desc: "With 2,500+ trees planted, we're ecosystem builders committed to restoration." },
              { icon: Cpu, title: "Precision", desc: "Using technology to maximize impact for farmers across Kenya and the world." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-neutral-50 p-10 rounded-[2.5rem] border border-neutral-100 group hover:shadow-xl transition-all duration-500"
              >
                <div className="mb-8 inline-flex items-center justify-center p-6 bg-white rounded-2xl text-beeyield-green shadow-sm group-hover:scale-110 transition-transform">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight leading-none">{item.title}</h3>
                <p className="text-sm text-neutral-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
           </div>
        </div>
      </section>

      {/* FINAL CTA — Match Diseases CTA */}
      <section className="bg-neutral-900 py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="max-w-4xl mx-auto"
            >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 tracking-tight leading-tight">
                    Join Us on Our <br /><span className="text-beeyield-green">Journey</span>
                </h2>
                <div className="flex flex-wrap justify-center gap-6">
                    <Button size="lg" className="h-14 px-12 bg-white text-neutral-900 font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-xl shadow-white/10" asChild>
                        <Link to="/contact">Get in Touch</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-12 border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm" asChild>
                        <Link to="/team">Meet The Team</Link>
                    </Button>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Video Content — Match Diseases layout for media */}
      <section className="bg-neutral-50/50 py-24">
        <div className="container mx-auto px-4">
           <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
             <div className="bg-white p-4 rounded-[3rem] border border-neutral-100 shadow-sm overflow-hidden">
                <YouTubeEmbed title="About BeeYield" wrapperClassName="aspect-video rounded-[2rem] overflow-hidden" />
             </div>
             <div className="bg-white p-4 rounded-[3rem] border border-neutral-100 shadow-sm overflow-hidden">
                <YouTubeEmbed title="BeeYield Performance" wrapperClassName="aspect-video rounded-[2rem] overflow-hidden" />
             </div>
           </div>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default OurStory;
