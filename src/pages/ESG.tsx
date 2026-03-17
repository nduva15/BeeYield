import { useState, useEffect } from "react";
import { Database, TrendingUp, Check, Heart, Sprout, Globe, Wind, Sun, ArrowRight, Quote, Users, Droplets, TreePine, Bug, Package, MapPin, Shield, Leaf, Cpu, Code, Loader2, Download, ShieldCheck, Zap, Scale } from "lucide-react";
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
          doc.text(`? ${stat}`, 20, yPos + 5);
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
        doc.text('BeeYield ESG summary', pageWidth / 2, 286, { align: 'center' });

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
    { value: liveStats?.beekeepers || "20+", label: "Custodians", icon: Users, description: "Strategic partners trained" },
    { value: liveStats?.acres_pollinated || "25", label: "Acres", icon: MapPin, description: "Bio-verified coverage" },
    { value: "2,500+", label: "Trees", icon: TreePine, description: "Flora restoration" },
    { value: liveStats?.hive_count || "184", label: "Monitored hives", icon: Bug, description: "Colonies monitored during the season" },
    { value: liveStats?.total_honey_kg || "943kg", label: "Yield", icon: Package, description: "Traceable harvest" },
    { value: "2.4M+", label: "Pollinators", icon: Heart, description: "Estimated bees supported" },
  ];

  const esgPillars = [
    {
      title: "Hive Health",
      icon: Cpu,
      color: "from-emerald-950 to-emerald-900 border-[#1B9157]/",
      initiatives: [
        "Sound pattern checks to flag early disease risk",
        "Real-time hive condition snapshots (Temp, Humidity, Mass)",
        "Swarm-risk indicators to support timely inspections",
        "Simple health signals that are easy to act on",
        "Sharing aggregated learnings with local partners"
      ],
      impact: "Earlier detection of issues and faster response during the season"
    },
    {
      title: "Traceability",
      icon: ShieldCheck,
      color: "from-slate-950 to-slate-900 border-amber-500/20",
      initiatives: [
        "Verification checks for each batch",
        "Verifiable records for each harvest event",
        "Hive ID to jar-level tracking where available",
        "QR access to batch details for customers",
        "Audit support for retail and export partners"
      ],
      impact: "Clear, checkable records from hive to jar"
    },
    {
      title: "The 50/50 Anchor",
      icon: Scale,
      color: "from-amber-950 to-amber-900 border-amber-500/20",
      initiatives: [
        "Strict adherence to the 50% ethical harvest threshold",
        "No artificial supplements: Bees sustain on native flora",
        "Resource-buffer management for dry seasons in Kenya",
        "Biological-centric harvest cycles prioritized over volume",
        "High-potency nutrient retention in final honey product"
      ],
      impact: "Colonies maintain peak biological vigor through extreme weather cycles"
    },
    {
      title: "Women-Led Engineering",
      icon: Code,
      color: "from-indigo-950 to-indigo-900 border-indigo-500/20",
      initiatives: [
        "Co-Founded by Agatha Nduva (IT Architecture) & Carole Nduva (Growth)",
        "Diversity-first engineering and strategic leadership teams",
        "Mentorship programs for women in digital agriculture and AI",
        "Strategic focus on inclusive economic growth in Kibwezi",
        "Leadership in Africa's emerging high-tech ag-ecosystem"
      ],
      impact: "Diversity-driven innovation accelerating project dev-cycles by 30%"
    }
  ];

  return (
    <BeeYieldPageShell className="bg-[#fdfbf6]">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 border-beeyield-gold/30 text-beeyield-gold bg-beeyield-gold/5 font-semibold text-sm">
              <Globe className="w-3 h-3 mr-2" />
              ESG overview
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] mb-8 tracking-tighter leading-[0.95]">
              Governance <br /><span className="text-beeyield-gold">by Integrity.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
              BeeYield focuses on measurable impact: healthier hives, better pollination, and traceable harvests.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-[#FFF9F0] text-[#1A1A1A] rounded-2xl h-16 px-10 font-black shadow-2xl hover:bg-slate-800" onClick={handleDownloadReport} disabled={downloading}>
                {downloading ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Download className="w-5 h-5 mr-3" />}
                {downloading ? "Downloading…" : "Download 2026 ESG report"}
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-2xl h-16 px-10 border-2 font-black border-slate-100 hover:bg-[#F9F7F2]">
                <Link to="/commitment">Vision & Purpose</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-beeyield-green/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* Impact Metrics */}
      <section className="py-20 bg-[#FFF9F0]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {impactStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="text-center p-6 rounded-[2rem] bg-[#fdfbf6] border border-slate-50 shadow-soft group hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#FFF9F0] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-beeyield-green" />
                </div>
                <div className="text-2xl font-black text-[#1A1A1A] mb-1 tracking-tighter">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-500 mb-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {esgPillars.map((pillar, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className={`overflow-hidden border-2 h-full rounded-[2.5rem] bg-gradient-to-br ${pillar.color} shadow-2xl`}>
                    <CardContent className="p-10 flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-[#F4D03F]/10 backdrop-blur-md flex items-center justify-center border border-[#F4D03F]/40">
                          <pillar.icon className="w-8 h-8 text-[#1A1A1A] shadow-lg" />
                        </div>
                        <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight">{pillar.title}</h3>
                      </div>

                      <div className="space-y-4 mb-10 flex-1">
                        {pillar.initiatives.map((initiative, i) => (
                          <div key={i} className="flex items-start gap-4">
                            <div className="mt-1.5 h-1 w-1 rounded-full bg-beeyield-gold shadow-[0_0_8px_rgba(217,119,6,0.8)] flex-shrink-0" />
                            <span className="text-sm text-[#1A1A1A] font-medium leading-relaxed">{initiative}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-8 border-t border-[#F4D03F]/20">
                        <p className="text-sm font-semibold text-beeyield-gold mb-2">Measured impact</p>
                        <p className="text-lg font-bold text-[#1A1A1A] leading-tight">
                          {pillar.impact}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Food Security / Hunger Focus */}
      <section className="py-24 bg-[#FFF9F0] text-[#1A1A1A] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <Badge variant="outline" className="mb-6 border-beeyield-gold/40 text-beeyield-gold font-semibold text-sm">
                Strategic Focus: SDG 2
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">Data-Driven <br />Food Security.</h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10 max-w-xl">
                In semi-arid Makueni, pollination isn't just a service?it's survival. We deploy monitored hives to support mango and avocado smallholders during flowering and document what happens in the field.
              </p>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                  <p className="text-4xl font-black text-beeyield-gold">25+</p>
                  <p className="text-sm font-semibold text-slate-600">Acres supported</p>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-black text-beeyield-green">100%</p>
                  <p className="text-sm font-semibold text-slate-600">Pesticide-free baseline</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-beeyield-gold to-beeyield-green rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-[#F4D03F]/20">
                <img src="/pollination-farmers.png" alt="Participatory Ag" className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-10 left-10 right-10">
                  <Quote className="w-10 h-10 text-beeyield-gold mb-4 opacity-50" />
                  <p className="text-xl font-medium italic text-slate-100 mb-4">
                    "Through precision pollination, we're not just harvesting honey?we're creating local abundance."
                  </p>
                  <p className="text-sm font-semibold text-beeyield-gold">Timothy Nduva, CEO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner/Trust Footprint */}
      <section className="py-24 bg-[#FFF9F0] border-b border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="w-24 h-24 bg-[#F9F7F2] rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-12 h-12 text-[#1A1A1A]" />
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter">Verified by Design.</h3>
            <p className="text-slate-500 text-lg font-medium">
              Every jar tracked. Every hive monitored. Every community supported. Partner with us to improve traceability and pollinator health.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <Link to="/contact" className="px-10 py-5 bg-[#FFF9F0] text-[#1A1A1A] rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all">
                Partner Engagement
              </Link>
              <Link to="/media" className="px-10 py-5 bg-[#FFF9F0] text-[#1A1A1A] border-2 border-slate-100 rounded-2xl font-black hover:bg-[#F9F7F2] transition-all">
                Impact Media Room
              </Link>
            </div>
          </div>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default ESG;
