import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  ArrowRight, Activity, Sprout, BarChart3,
  Cpu, Wifi, Check, Shield, Globe,
  BookOpen, Heart, AlertTriangle, MapPin, Mail, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { motion } from "framer-motion";
import BEEYIELD_LOGO from "@/assets/Logo.png";
import SEO from "@/components/SEO";

const PollinationSolutions = () => {
  const [supportType, setSupportType] = useState("monthly");

  return (
    <BeeYieldPageShell className="bg-background text-foreground">
      <SEO 
        title="Pollination Solutions | BeeYield"
        description="End-to-End Visibility. We combine biological understanding with technological innovation to monitor pollination from the inside out."
        url="/pollination-solutions"
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
                End-to-End Visibility
            </Badge>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900 leading-tight"
            >
              Pollination <br />
              <span className="text-beeyield-green">Solutions</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl font-medium"
            >
              We combine biological understanding with technological innovation to monitor pollination from the inside out.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           THE THREE PATHS — Match Diseases "How it Works" layout
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-neutral-50/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
            {/* Path 1: In-Hive */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-white p-10 rounded-[2.5rem] border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-500 overflow-hidden relative group"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-beeyield-green opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="mb-8 inline-flex items-center justify-center p-6 bg-neutral-50 rounded-2xl text-beeyield-green">
                <Cpu className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-neutral-900 tracking-tight">In-Hive Precision</h2>
              <p className="text-sm text-neutral-500 leading-relaxed mb-8 flex-grow font-medium">
                Our proprietary sensors live inside the hive box, monitoring acoustic signatures and environmental metrics 24/7.
              </p>
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-beeyield-green" />
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Queen health status</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-beeyield-green" />
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Colony grading</span>
                </div>
              </div>
              <Button size="lg" className="h-14 px-8 w-full bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20" asChild>
                <Link to="/precision-pollination">Explore Technology <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </motion.div>

            {/* Path 2: In-Field */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="bg-white p-10 rounded-[2.5rem] border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-500 overflow-hidden relative group"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-beeyield-gold opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="mb-8 inline-flex items-center justify-center p-6 bg-neutral-50 rounded-2xl text-beeyield-gold">
                <Wifi className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-neutral-900 tracking-tight">In-Field Insights</h2>
              <p className="text-sm text-neutral-500 leading-relaxed mb-8 flex-grow font-medium">
                Sensors deployed across your orchards measure actual bee flight activity and pollination events.
              </p>
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-beeyield-gold" />
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Real-time maps</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-beeyield-gold" />
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Efficiency tracking</span>
                </div>
              </div>
              <Button size="lg" variant="outline" className="h-14 px-8 w-full border-neutral-200 text-neutral-900 font-bold text-xs rounded-2xl hover:bg-neutral-50 transition-all" asChild>
                <Link to="/in-land-pollination">Explore Field Ops <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </motion.div>

            {/* Path 3: Disease & Health */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="bg-white p-10 rounded-[2.5rem] border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-500 overflow-hidden relative group"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500 opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="mb-8 inline-flex items-center justify-center p-6 bg-neutral-50 rounded-2xl text-red-500">
                <Shield className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-neutral-900 tracking-tight">Diseases</h2>
              <p className="text-sm text-neutral-500 leading-relaxed mb-8 flex-grow font-medium">
                Early warnings for hive health. Detect disease risk sooner and monitor colony conditions with clear alerts.
              </p>
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Early detection</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Health grading</span>
                </div>
              </div>
              <Button size="lg" variant="outline" className="h-14 px-8 w-full border-neutral-200 text-neutral-900 font-bold text-xs rounded-2xl hover:bg-neutral-50 transition-all text-red-500" asChild>
                <Link to="/diseases">Explore Hive Health <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partners Section — Exact Match to Team workforce grid style */}
      <section className="py-24 bg-white border-b border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16 bg-neutral-50 p-12 rounded-[3rem] border border-neutral-100 shadow-sm">
            <h2 className="text-3xl font-bold mb-6 text-neutral-900 tracking-tight">Try BeeYield today</h2>
            <p className="text-lg text-muted-foreground mb-10 font-medium">
              We invite you to take part in the international testing of our system – together, we can advance technology that protects pollinators worldwide.
            </p>
            <Button size="lg" className="h-14 px-12 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl shadow-xl shadow-neutral-900/20" asChild>
              <Link to="/contact">Join the Program Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Unified Platform — Match Diseases "Intelligent Protection" style */}
      <section className="py-24 bg-white border-b border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Badge className="mb-4 bg-beeyield-green/10 text-beeyield-green border-none px-4 py-1.5 font-semibold text-[10px] rounded-full">
              Full Spectrum
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-neutral-900 tracking-tight">Better Together</h2>
            <p className="text-lg text-muted-foreground font-medium">
              In-Hive and In-Field work even better together, giving practitioners a full picture from hive to crop.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              { icon: Activity, title: "Monitor", desc: "Track health and field conditions simultaneously.", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: BarChart3, title: "Review", desc: "See how hive strength relates to yield.", color: "text-amber-500", bg: "bg-amber-50" },
              { icon: Sprout, title: "Improve", desc: "Use data to improve yield and bee health.", color: "text-emerald-500", bg: "bg-emerald-50" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-neutral-50 p-10 rounded-[2.5rem] border border-neutral-100 text-center group"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner", item.bg, item.color)}>
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-neutral-900 tracking-tight leading-none">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
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
                    Deploy Precision <br /><span className="text-beeyield-green">at Your Apiary</span>
                </h2>
                <div className="flex flex-wrap justify-center gap-6">
                    <Button size="lg" className="h-14 px-12 bg-white text-neutral-900 font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-xl" asChild>
                        <Link to="/contact">Request a Demo</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-12 border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm" asChild>
                        <Link to="/media">Read the Research</Link>
                    </Button>
                </div>
            </motion.div>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default PollinationSolutions;
