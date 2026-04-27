import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sprout, Droplets, TreePine, Bug, Download, ArrowRight, Loader2, ShieldCheck, Zap, Globe, Heart, Activity, Home } from "lucide-react";
import { Link } from "react-router-dom";
import impactImage from "@/assets/impact-beekeeping.jpg";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import BEEYIELD_LOGO from "@/assets/Logo.png";
import beeyieldService from "@/services/beeyieldService";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";

const Impact = () => {
  const [downloading, setDownloading] = useState(false);
  const [liveStats, setLiveStats] = useState<any>(null);

  useEffect(() => {
    beeyieldService.getImpactStats().then(data => {
      if (data) setLiveStats(data);
    });
  }, []);

  const handleDownloadImpactReport = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      try { doc.addImage(BEEYIELD_LOGO, 'PNG', 14, 10, 30, 30); } catch (e) {}
      doc.setFontSize(24);
      doc.setTextColor(22, 163, 74);
      doc.text('BeeYield', 50, 25);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text('Ecological Impact Report 2026', 50, 32);
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text('Impact summary', 14, 55);
      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(1);
      doc.line(14, 60, pageWidth - 14, 60);
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      doc.text(`• Monitored hives: ${liveStats?.hive_count || "184"}`, 20, 80);
      doc.text('• Indigenous Flora Restored: 2,500+ Trees', 20, 90);
      doc.text('• Estimated bees supported: 2.4M+', 20, 100);
      doc.save('BeeYield-Impact-Report-2026.pdf');
      toast.success('Impact report downloaded');
    } catch (error) {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const stats = [
    { label: "Bees Protected", value: "2.4M+", icon: Bug },
    { label: "Trees Planted", value: "2,500+", icon: TreePine },
    { label: "Integrity Score", value: "99.9%", icon: ShieldCheck },
    { label: "Carbon Offset", value: "2.1t", icon: Sprout },
  ];

  return (
    <BeeYieldPageShell className="bg-background text-foreground">
      <SEO 
        title="Impact | BeeYield"
        description="Quantifying nature's recovery. Verifiable ecological impact records from our tech-driven apiaries in Kenya."
        url="/impact"
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={BEEYIELD_LOGO}
                alt="BeeYield Logo"
                className="h-24 md:h-36 w-auto mb-12 drop-shadow-2xl"
            />
            <Badge className="mb-6 bg-beeyield-green/10 text-beeyield-green border-beeyield-green/20 px-5 py-2 font-semibold text-[10px] rounded-full backdrop-blur-sm">
                Ecological Provenance
            </Badge>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900 leading-tight"
            >
              Ecological Impact <br />
              <span className="text-beeyield-green">Quantified</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl"
            >
              Every drop of BeeYield honey is a verifiable record of environmental restoration. We use advanced analytics to turn nature's health into hard data.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={handleDownloadImpactReport}
                disabled={downloading}
                className="h-14 px-10 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20"
              >
                {downloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Official Impact Record PDF
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           STATS GRID — Match Diseases "How it Works" layout
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-neutral-50/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-10 rounded-[2.5rem] border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-500 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-neutral-50 flex items-center justify-center mx-auto mb-6 text-beeyield-green">
                  <stat.icon className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold text-neutral-900 mb-2 tracking-tight">{stat.value}</h3>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           NARRATIVE — Match Diseases "Intelligent Protection" layout
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-white relative overflow-hidden border-b border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-24 max-w-7xl mx-auto items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-1 font-bold text-[10px] uppercase tracking-widest rounded-full">
                Transparency
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight leading-tight">
                Radical Ecological <br />
                <span className="text-beeyield-green">Transparency</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                We don't just harvest honey; we steward a biome. Our precision pollination model ensures that for every acre of apiary, local biodiversity thrives. We track native flora restoration down to the coordinate.
              </p>
              
              <div className="space-y-6 pt-6">
                {[
                  { label: "Habitat Health", value: 95 },
                  { label: "Chemical-Free baseline", value: 100 },
                  { label: "Acoustic health baseline", value: 88 }
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-neutral-500 uppercase tracking-widest">{item.label}</span>
                        <span className="text-beeyield-green">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-2 bg-neutral-100" />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-[3rem] overflow-hidden bg-neutral-50 border border-neutral-100 shadow-2xl"
            >
              <img src={impactImage} alt="BeeYield Impact" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-neutral-900/10" />
              <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
                      <p className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-1">Makueni Basin</p>
                      <p className="text-[10px] font-medium text-neutral-500">Telemetry active across native scrubland.</p>
                  </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           ROADMAP — Match Diseases Threat Grid style
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-neutral-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                Future Projection
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4">The 2030 Roadmap</h2>
            <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              { title: "Scale Capacity", desc: "Support 10,000+ monitored beehives with precision sensors.", icon: Bug },
              { title: "Flora Maps", desc: "Real-time satellite tracking of 100k native tree coordinates.", icon: TreePine },
              { title: "Zero Watt", desc: "100% solar micro-grid processing units in rural outposts.", icon: Zap },
              { title: "Global Hive", desc: "Empower 2,000+ local beekeeping families with tech.", icon: Globe },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 rounded-[2.5rem] border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-500 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center mb-8 text-neutral-900 group-hover:text-beeyield-green transition-colors">
                  <item.icon className="h-7 w-7" />
                </div>
                <h4 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight">{item.title}</h4>
                <p className="text-xs text-neutral-500 leading-relaxed font-medium">{item.desc}</p>
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
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="max-w-4xl mx-auto"
            >
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-10">
                    <Heart className="w-10 h-10 text-beeyield-green animate-pulse" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                    Invest in <span className="text-beeyield-green">Planetary Health</span>
                </h2>
                <p className="text-lg text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Be a part of a verified ecosystem. Every partner, every hive, every drop makes the planet resilient.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild className="h-14 px-12 bg-white text-neutral-900 rounded-2xl font-bold hover:bg-neutral-100 transition-all shadow-xl">
                        <Link to="/contact">Contact the Hive</Link>
                    </Button>
                </div>
            </motion.div>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default Impact;
