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

// Use localized assets where possible to match Diseases UI
const ESG_HERO_BG = "/images/diseases/satellite-heatmap.jpg"; 
const ECO_MISSION_IMG = "/images/diseases/hive-inspection.jpg";

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

        // Add logo
        try {
          doc.addImage(BEEYIELD_LOGO, 'PNG', 14, 10, 30, 30);
        } catch (e) {
          console.warn('Could not load logo for PDF');
        }

        // Header
        doc.setFontSize(24);
        doc.setTextColor(22, 163, 74); // beeyield-green
        doc.text('BeeYield', 50, 25);

        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text('Ecological ESG Report 2026', 50, 32);
        doc.text('Provenance: Kibwezi Apiary, Kenya', 50, 38);

        // Title
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text('ESG Strategic Framework', 14, 55);

        doc.setDrawColor(217, 119, 6); // beeyield-gold
        doc.setLineWidth(1);
        doc.line(14, 60, pageWidth - 14, 60);

        let yPos = 75;

        // Intro
        doc.setFontSize(12);
        doc.setTextColor(75, 85, 99);
        const introText = "BeeYield focuses on practical, measurable impact: healthier hives, better pollination, and traceable harvests.";
        const introLines = doc.splitTextToSize(introText, pageWidth - 28);
        doc.text(introLines, 14, yPos);
        yPos += introLines.length * 7 + 10;

        // Impact Stats
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text('2026 ESG Highlights', 14, yPos);
        yPos += 10;

        doc.setFillColor(248, 250, 252);
        doc.rect(14, yPos - 5, pageWidth - 28, 55, 'F');

        doc.setFontSize(11);
        doc.setTextColor(75, 85, 99);

        const stats = [
          `Strategic Partners: ${liveStats?.beekeepers || "20+"} Local Custodians`,
          `Managed Inventory: ${liveStats?.hive_count || "184"} Monitored hives`,
          `Ecological Coverage: ${liveStats?.acres_pollinated || "25"} Verified Acres`,
          `Integrity Score: 99.9% System Uptime`,
          `Harvest Yield: ${liveStats?.total_honey_kg || "943kg"} Traceable Units`,
          `Pollinators Protected: 2.4M+ Managed Bees`
        ];

        stats.forEach(stat => {
          doc.text(`• ${stat}`, 20, yPos + 5);
          yPos += 8;
        });
        yPos += 15;

        // Pillars
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text('Strategic Pillars', 14, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.setTextColor(107, 114, 128);

        const pillars = [
          "1. Hive Health - Early warning from sensors and inspections",
          "2. Traceability - Verifiable harvest records",
          "3. The 50/50 Anchor - Resource management for colony resilience",
          "4. Precision Pollination - Field and hive monitoring during bloom",
          "5. Women-Led Engineering - 66% diversity in founding leadership",
          "6. Circular Ecosystems - Zero-waste, chemical-free operations",
        ];

        pillars.forEach(pillar => {
          doc.text(pillar, 14, yPos);
          yPos += 8;
        });

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('BeeYield ESG Registry | www.beeyield.com', pageWidth / 2, 280, { align: 'center' });

        doc.save('BeeYield_ESG_Report_2026.pdf');
        toast.success("ESG report downloaded");
      } catch (err) {
        console.error("PDF generation failed", err);
        toast.error("Download failed. Please try again.");
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
      description: "Sound pattern checks and real-timeCondition snapshots (Temp, Humidity, Mass) flag early disease risk.",
      icon: <Cpu className="h-7 w-7" />,
      accent: "bg-emerald-500/10 text-emerald-600",
      impact: "Earlier detection of issues and faster response during the season"
    },
    {
      title: "Traceability",
      description: "Immutable harvest records and hive-to-jar tracking provide audit support for global partners.",
      icon: <ShieldCheck className="h-7 w-7" />,
      accent: "bg-amber-500/10 text-amber-600",
      impact: "Clear, checkable records from hive to jar"
    },
    {
      title: "The 50/50 Anchor",
      description: "Strict adherence to 50% ethical harvest threshold. No supplements; bees sustain purely on native flora.",
      icon: <Scale className="h-7 w-7" />,
      accent: "bg-violet-500/10 text-violet-600",
      impact: "Colonies maintain peak biological vigor through extreme weather cycles"
    },
    {
      title: "Diversity-Led Growth",
      description: "Co-founded by Agatha & Carole Nduva, prioritizing inclusive economic growth in Kibwezi.",
      icon: <Code className="h-7 w-7" />,
      accent: "bg-sky-500/10 text-sky-600",
      impact: "Diversity-driven innovation accelerating project dev-cycles by 30%"
    }
  ];

  return (
    <BeeYieldPageShell className="bg-white text-foreground">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION — ESG Strategy & Vision
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0">
          <img src={ESG_HERO_BG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <motion.img 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              src={BEEYIELD_LOGO} 
              alt="BeeYield Logo" 
              className="h-24 md:h-36 w-auto mb-12 drop-shadow-2xl" 
            />
            <Badge className="mb-6 bg-emerald-500/10 text-emerald-700 border-emerald-200 px-5 py-2 font-semibold text-[10px] rounded-full backdrop-blur-sm uppercase tracking-widest">
              Governance by Integrity.
            </Badge>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-bold mb-8 tracking-tight text-neutral-900 leading-[0.9]"
            >
              Ecological <br />
              Accountability <span className="text-beeyield-green">& Global Resilience</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto font-medium"
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
          IMPACT STATS — High-Fidelity Metrics
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white relative overflow-hidden border-b border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-7xl mx-auto">
            {impactStats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="text-center p-8 rounded-[2rem] bg-neutral-50 border border-neutral-100 group hover:bg-white hover:shadow-xl transition-all duration-500"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white border border-neutral-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-3xl font-black text-neutral-900 mb-1 tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CORE COMMITMENT — Narrative Section
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-neutral-100">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-stretch">
            {/* Left Column */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <Badge className="bg-beeyield-green/10 text-beeyield-green border-none px-4 py-1.5 font-semibold text-[10px] uppercase tracking-widest">
                Our Mandate
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
                ESG Governance <br />
                <span className="text-beeyield-green">by Design</span>
              </h2>
              <p className="text-xl text-neutral-500 leading-relaxed font-medium">
                For BeeYield, ESG (Environmental, Social, and Governance) isn’t just a corporate framework—it’s the core of our technical and operational architecture.
              </p>
              <p className="text-lg text-neutral-400 leading-relaxed">
                We fulfill our obligations in several demonstrable ways, from verified pesticide-free baselines to inclusive resource management for colony resilience.
              </p>
              
              <div className="pt-8 border-t border-neutral-100">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-neutral-900 flex items-center justify-center shadow-2xl">
                    <ShieldCheck className="h-8 w-8 text-beeyield-green" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-neutral-900">Verified Integrity</h4>
                    <p className="text-sm text-neutral-400 font-medium">100% Transparency via the BeeYield Dashboard.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column — Deep Dive Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-neutral-900 p-12 rounded-[3.5rem] border border-neutral-800 h-full flex flex-col justify-center shadow-2xl shadow-neutral-900/40"
            >
              <h3 className="text-3xl font-bold text-white mb-6">Strategic <br /><span className="text-beeyield-green">SDG Alignment</span></h3>
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <p className="text-neutral-300 font-medium italic leading-relaxed">"Stable ecosystems are built on the foundations of diverse pollinator populations."</p>
                </div>
                <p className="text-neutral-500 leading-relaxed">
                  Only by accurately tracking population levels can conservation work be effective. BeeYield’s acoustic detection technology improves the accuracy of species monitoring.
                </p>
              </div>
              <Button size="lg" className="w-full bg-beeyield-green text-neutral-900 font-bold hover:bg-white transition-all rounded-2xl h-14" asChild>
                <Link to="/precision-pollination">Explore Bio-Metrics <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THE ESG PILLARS — Advantage Grid
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-neutral-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-neutral-900">Strategic Pillars</h2>
            <p className="text-lg text-neutral-500 font-medium">Practical, measurable impact across the biological and social spectrum.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {esgPillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="h-full bg-white p-12 rounded-[3rem] border border-neutral-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  <div className={`w-16 h-16 ${pillar.accent} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                    {pillar.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4 tracking-tight">{pillar.title}</h3>
                  <p className="text-lg text-neutral-400 font-medium leading-relaxed mb-8">{pillar.description}</p>
                  
                  <div className="pt-6 border-t border-neutral-50">
                    <Badge className="bg-neutral-900 text-beeyield-green px-4 py-1.5 font-bold text-[9px] uppercase tracking-[0.2em] mb-3">Impact Result</Badge>
                    <p className="text-neutral-900 font-black text-sm italic">"{pillar.impact}"</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          WILD POLLINATORS — Deep Dark Section
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <img src={ECO_MISSION_IMG} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/80 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-bold px-4 py-1 uppercase tracking-widest text-[9px]">
                Biodiversity Resilience
              </Badge>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-none">
                Guardians of <br /><span className="text-beeyield-green italic">the Wild.</span>
              </h2>
              <div className="space-y-6 text-xl text-neutral-400 font-medium leading-relaxed">
                <p>
                  Across the spectrum, wild pollinators including wasps, flies, and beetles, many solitary bee species, moths and butterflies, are all under pressure. Habitat loss and fossil fuel-based agricultural inputs contribute to population decline.
                </p>
                <p>
                  Managed colonies are only part of a complex biological legacy. We are committed to a vision where commercial success and wild biodiversity exist in a virtuous cycle.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-8">
                <div className="p-8 border border-white/10 bg-white/5 rounded-[2rem] hover:bg-white/10 transition-all group">
                  <Cpu className="w-8 h-8 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xl font-bold mb-2">Species Monitoring</h4>
                  <p className="text-sm text-neutral-500">Deploying BeeHUB IoT telemetry to transition from observation to active safeguarding.</p>
                </div>
                <div className="p-8 border border-white/10 bg-white/5 rounded-[2rem] hover:bg-white/10 transition-all group">
                  <Microscope className="w-8 h-8 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xl font-bold mb-2">Acoustic Auditing</h4>
                  <p className="text-sm text-neutral-500">Using sensory AI to track wild species presence with high-fidelity accuracy.</p>
                </div>
              </div>
            </motion.div>

            {/* Interactive/Visual Column */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="relative lg:pl-12"
            >
              <div className="relative rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-3xl aspect-[4/5] flex flex-col p-12">
                <div className="flex-1 flex flex-col justify-center space-y-12">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 text-emerald-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Live Bio-Signature Analysis</span>
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight">SDG 2 & 15 <br />Data-Driven Integration</h3>
                    <p className="text-neutral-500 leading-relaxed max-w-sm">
                      Our system monitors mango and avocado blooms in Makueni, documentation field data to support smallholders and biodiversity.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <div className="text-4xl font-black text-white">25+</div>
                      <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Acres Monitored</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-4xl font-black text-emerald-500">95%</div>
                      <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Detection Confidence</p>
                    </div>
                  </div>
                  
                  <div className="pt-8">
                    <Quote className="w-12 h-12 text-beeyield-green mb-6 opacity-30" />
                    <p className="text-xl font-medium italic text-neutral-200">
                      "Through precision, we're creating local abundance."
                    </p>
                  </div>
                </div>
              </div>
              {/* Floating element */}
              <div className="absolute -bottom-10 -left-10 p-8 bg-beeyield-green rounded-3xl text-neutral-900 shadow-2xl rotate-[-5deg] border-4 border-neutral-900">
                <p className="text-xs font-black uppercase tracking-tighter">SDG Commitment</p>
                <p className="text-lg font-black leading-none">Net-Positive Ecology</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CALL TO ACTION — Unified Brand Style
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-white text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-10">
            <h2 className="text-5xl md:text-8xl font-bold tracking-tight text-neutral-900 leading-[0.85]">
              Integrity <br /><span className="text-neutral-300">at Scale.</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <Button 
                size="lg" 
                className="px-12 py-8 bg-neutral-900 text-beeyield-green font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-neutral-800 transition-all transition-all shadow-2xl shadow-neutral-900/30"
                asChild
              >
                <Link to="/contact">Partner with BeeYield</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-12 py-8 border-neutral-200 text-neutral-900 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-neutral-50 transition-all"
                asChild
              >
                <Link to="/beeyield-dashboard/reports">View Impact Registry</Link>
              </Button>
            </div>
            
            <p className="text-sm font-bold text-neutral-400 pt-8 flex items-center justify-center gap-4">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Impact Registry Update: 2026 Reporting Cycle Active
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </p>
          </div>
        </div>
      </section>

    </BeeYieldPageShell>
  );
};

export default ESG;
