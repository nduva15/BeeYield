import { useState, useEffect } from "react";
import { 
  Heart, Globe, Quote, Users, TreePine, Bug, Package, MapPin, 
  Cpu, Code, Loader2, Download, ShieldCheck, Scale, Mic, Activity,
  ArrowRight, Shield, Leaf, Sparkles, AlertTriangle, Microscope, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";

import { toast } from "sonner";
import BEEYIELD_LOGO from "@/assets/Logo.png";
import beeyieldService from "@/services/beeyieldService";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import SEO from "@/components/SEO";

// Use localized assets 
const HERO_BG = "/images/diseases/satellite-heatmap.jpg"; 

const ESG = () => {
  const [downloading, setDownloading] = useState(false);
  const [liveStats, setLiveStats] = useState<any>(null);

  useEffect(() => {
    beeyieldService.getImpactStats().then(data => {
      if (data) setLiveStats(data);
    });
  }, []);

  const handleDownloadReport = () => {
    setDownloading(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        try { doc.addImage(BEEYIELD_LOGO, 'PNG', 14, 10, 30, 30); } catch (e) {}
        doc.setFontSize(24);
        doc.setTextColor(22, 163, 74);
        doc.text('BeeYield', 50, 25);
        doc.text('Ecological ESG Report 2026', 14, 55);
        doc.save('BeeYield_ESG_Report_2026.pdf');
        toast.success("ESG report downloaded");
      } catch (err) {
        toast.error("Download failed");
      } finally {
        setDownloading(false);
      }
    }, 1000);
  };

  const impactStats = [
    { value: liveStats?.beekeepers || "20+", label: "Custodians", icon: Users },
    { value: liveStats?.acres_pollinated || "25", label: "Acres", icon: MapPin },
    { value: "2,500+", label: "Trees", icon: TreePine },
    { value: liveStats?.hive_count || "184", label: "Hives", icon: Bug },
    { value: liveStats?.total_honey_kg || "943kg", label: "Kg Yield", icon: Package },
    { value: "2.4M+", label: "Bees", icon: Heart },
  ];

  const esgPillars = [
    {
      title: "Hive Health",
      description: "Sound pattern checks and real-time condition snapshots (Temp, Humidity, Mass) flag early disease risk.",
      icon: <Cpu className="h-7 w-7" />,
      impact: "Earlier detection of issues and faster response"
    },
    {
      title: "Traceability",
      description: "Immutable harvest records and hive-to-jar tracking provide audit support for global partners.",
      icon: <ShieldCheck className="h-7 w-7" />,
      impact: "Clear, checkable records from hive to jar"
    },
    {
      title: "The 50/50 Anchor",
      description: "Strict adherence to 50% ethical harvest threshold. No supplements; bees sustain purely on native flora.",
      icon: <Scale className="h-7 w-7" />,
      impact: "Colonies maintain peak biological vigor through cycles"
    },
    {
      title: "Inclusion",
      description: "Prioritizing inclusive economic growth and diversity-driven innovation in local apiary regions.",
      icon: <Users className="h-7 w-7" />,
      impact: "Diversity-driven innovation accelerating development"
    }
  ];

  return (
    <BeeYieldPageShell className="bg-background text-foreground">
      <SEO 
        title="ESG Strategy | BeeYield"
        description="Ecological Accountability & Global Resilience. BeeYield fulfills its ESG obligations through measurable, bio-verified impact."
        url="/esg"
      />
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION — Exact Match to Diseases Hero
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-10" />
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
                Governance by Integrity
            </Badge>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900 leading-tight"
            >
              Ecological <br />
              Accountability <span className="text-beeyield-green">& Resilience</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl font-medium"
            >
              BeeYield fulfills its ESG obligations through measurable, bio-verified impact: healthier hives, inclusive growth, and immutable traceability.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                className="h-14 px-10 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20"
                onClick={handleDownloadReport}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download 2026 ESG Report
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-10 border-neutral-200 text-neutral-900 font-bold text-xs rounded-2xl hover:bg-neutral-50 transition-all backdrop-blur-sm"
                asChild
              >
                <Link to="/contact">Partner Engagement</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          IMPACT STATS — Match Diseases "How it Works" icons pattern
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-neutral-50/50 relative overflow-hidden border-b border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {impactStats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="text-center p-8 rounded-[2.5rem] bg-white border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] group hover:shadow-xl transition-all duration-500"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-neutral-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-beeyield-green" />
                </div>
                <div className="text-3xl font-bold text-neutral-900 mb-1 tracking-tight">{stat.value}</div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CORE COMMITMENT — Match Diseases "Intelligent Protection" layout
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-neutral-100">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-stretch">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Badge className="bg-beeyield-green/10 text-beeyield-green border-none px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider mb-2 inline-block">
                Mandate
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
                ESG Governance <br />
                <span className="text-beeyield-green">by Design</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                For BeeYield, ESG (Environmental, Social, and Governance) isn’t just a corporate framework—it’s the core of our technical and operational architecture.
              </p>
              
              <div className="pt-8 border-t border-neutral-100">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center shadow-xl">
                    <ShieldCheck className="h-7 w-7 text-beeyield-green" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-neutral-900">Verified Integrity</h4>
                    <p className="text-sm text-neutral-400 font-medium">100% Transparency via BeeYield Dashboard.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-neutral-50 p-10 rounded-[2.5rem] border border-neutral-100 h-full flex flex-col justify-center group"
            >
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Strategic <br /><span className="text-beeyield-green">SDG Integration</span></h3>
              <p className="text-neutral-500 leading-relaxed font-medium italic mb-6">
                "Stable ecosystems are built on the foundations of diverse pollinator populations."
              </p>
              <p className="text-sm text-neutral-400 leading-relaxed mb-10">
                Only by accurately tracking population levels can conservation work be effective. BeeYield’s acoustic detection technology improves the accuracy of species monitoring.
              </p>
              <Button className="w-full bg-neutral-900 text-beeyield-green font-bold hover:bg-neutral-800 transition-all rounded-2xl h-14" asChild>
                <Link to="/precision-pollination">Explore Analytics <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THE ESG PILLARS — Match Diseases "How it Works" grid
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-neutral-50/50 border-b border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-24">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none px-5 py-2 font-semibold text-[10px] rounded-full mb-6">Pillars</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">Strategic ESG Pillars</h2>
            <div className="h-1 w-20 bg-beeyield-green mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {esgPillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-[2.5rem] border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center mb-8 text-beeyield-green">
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight">{pillar.title}</h3>
                <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-8">{pillar.description}</p>
                
                <div className="pt-6 border-t border-neutral-50">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Impact Result</p>
                  <p className="text-neutral-900 font-bold text-sm">"{pillar.impact}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA — Match Diseases CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-900 py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-10 leading-tight">
              Integrity <br /><span className="text-beeyield-green">at Global Scale</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <Button 
                size="lg" 
                className="h-14 px-12 bg-white text-neutral-900 font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-xl"
                asChild
              >
                <Link to="/contact">Partner with BeeYield</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-12 border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm"
                asChild
              >
                <Link to="/beeyield-dashboard/reports">Impact Registry</Link>
              </Button>
            </div>
            
            <p className="text-[10px] font-bold text-white/30 pt-12 flex items-center justify-center gap-4 uppercase tracking-[0.3em]">
                Registry Update: 2026 Reporting Active
            </p>
          </motion.div>
        </div>
      </section>

    </BeeYieldPageShell>
  );
};

export default ESG;
