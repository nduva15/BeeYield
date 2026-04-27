import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Cpu, Sprout, ArrowRight, Check,
  Globe, Flower2, Wheat, MapPin, Mail, Target, Home, TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { dashboardPollinationCropDetails } from "@/data/beePollinationData";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import LOGO from "@/assets/Logo.png";

const CropsWePollinate = () => {
  const pollinationCrops = dashboardPollinationCropDetails;

  // Accurate world map TopoJSON from world-atlas
  const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  return (
    <BeeYieldPageShell className="bg-background">
      <SEO 
        title="Crops We Pollinate | BeeYield"
        description="Expert crop pollination services for major agricultural products in Kenya and across East Africa."
        url="/crops-we-pollinate"
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
                Crops We Pollinate
            </Badge>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900 leading-tight"
            >
              Data-Driven <br />
              <span className="text-beeyield-green">Crop Pollination</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl font-medium"
            >
              Our end-to-end solution gives unprecedented control and visibility into pollination, ensuring maximized crop yields.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" className="h-14 px-10 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20" asChild>
                <Link to="/contact">Get a Free Consultation</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section — Sync with Diseases Efficiency grid */}
      <section className="py-24 bg-white border-b border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">Work With the Experts</h2>
            <div className="h-1 w-20 bg-beeyield-green mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { label: "Acres Managed", value: "25+", icon: Target },
              { label: "Country", value: "1", icon: Globe },
              { label: "Counties", value: "2", icon: Home },
              { label: "Crop Varieties", value: "9", icon: Sprout }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-neutral-50 p-8 rounded-[2.5rem] border border-neutral-100 text-center shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-4 text-beeyield-green">
                  <stat.icon size={20} />
                </div>
                <p className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</p>
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-tight">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section — Refined but keeping the functional map */}
      <section className="py-24 bg-neutral-50/50 border-b border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none px-4 py-1.5 mb-4 font-bold text-[10px] rounded-full">Global Presence</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900">Where We Operate</h2>
          </div>

          <div className="relative max-w-5xl mx-auto bg-white p-8 rounded-[3rem] border border-neutral-100 shadow-sm">
            <ComposableMap projection="geoNaturalEarth1" className="w-full">
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: { fill: "#f1f5f9", stroke: "#e2e8f0", strokeWidth: 0.5 },
                        hover: { fill: "#cbd5e1", outline: "none" },
                        pressed: { fill: "#94a3b8", outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>
              <Marker coordinates={[36.8219, -1.2921]}>
                <g className="animate-ping opacity-75">
                  <circle r={8} fill="#1B9157" />
                </g>
                <circle r={6} fill="#1B9157" />
                <text y={-15} textAnchor="middle" className="text-[10px] font-bold fill-neutral-900">Kenya (HQ)</text>
              </Marker>
            </ComposableMap>
          </div>
        </div>
      </section>

      {/* Crops Grid — Sync with Diseases Grid */}
      <section id="crops" className="py-24 bg-white border-b border-neutral-100">
        <div className="container mx-auto px-4">
           <div className="max-w-4xl mx-auto text-center mb-20">
             <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">Our Specialty Crops</h2>
             <p className="text-lg text-muted-foreground font-medium mt-4">Selected crops where we provide precision pollination services.</p>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pollinationCrops.map((crop, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                className="group relative overflow-hidden rounded-[2.5rem] aspect-[4/5] shadow-sm border border-neutral-200/60"
              >
                <img src={crop.image} alt={crop.cropName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <Badge className="mb-3 bg-beeyield-green text-neutral-900 border-none px-3 py-1 font-bold text-[9px] uppercase tracking-wider">
                    {crop.beeDependence.split('(')[0].trim()}
                  </Badge>
                  <p className="text-white font-bold leading-tight tracking-tight text-xl md:text-2xl">{crop.cropName}</p>
                </div>
              </motion.div>
            ))}
           </div>
        </div>
      </section>

      {/* Final CTA — Match Diseases CTA */}
      <section className="bg-neutral-900 py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="max-w-4xl mx-auto"
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-beeyield-green/10 text-beeyield-green mb-8 border border-beeyield-green/20">
                  <Flower2 className="w-8 h-8" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight leading-tight">
                    Don't See Your Crop?
                </h2>
                <p className="text-xl text-neutral-400 mb-10 font-medium max-w-2xl mx-auto leading-relaxed">
                  If your crop depends on bees, we’d like to hear from you. We can help with placement, timing, and efficacy.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                    <Button size="lg" className="h-14 px-12 bg-white text-neutral-900 font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-xl shadow-white/10" asChild>
                        <Link to="/contact">Contact Our Team</Link>
                    </Button>
                </div>
            </motion.div>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default CropsWePollinate;
