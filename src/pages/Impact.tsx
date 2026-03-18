import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sprout, Droplets, TreePine, Bug, Download, ArrowRight, Loader2, ShieldCheck, Zap, Globe, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import impactImage from "@/assets/impact-beekeeping.jpg";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import BEEYIELD_LOGO from "@/assets/Logo.png";
import beeyieldService from "@/services/beeyieldService";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

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
      doc.text('BeeYield', 50, 25);

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text('Ecological Impact Report 2026', 50, 32);
      doc.text('Provenance: Kibwezi Apiary, Kenya', 50, 38);

      // Title
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('Impact summary', 14, 55);

      doc.setDrawColor(217, 119, 6); // beeyield-gold
      doc.setLineWidth(1);
      doc.line(14, 60, pageWidth - 14, 60);

      // Executive Summary
      let yPos = 75;
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Summary', 14, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      const summaryText = 'BeeYield supports healthier hives, stronger pollination, and traceable harvests. We work with local beekeepers and farmers and track impact over time.';
      const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 28);
      doc.text(summaryLines, 14, yPos);
      yPos += summaryLines.length * 7 + 10;

      // Key Statistics
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Ecological Metrics', 14, yPos);
      yPos += 10;

      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(14, yPos - 5, pageWidth - 28, 40, 'F');

      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      doc.text(`• Monitored hives: ${liveStats?.hive_count || "184"}`, 20, yPos + 5);
      doc.text('• Indigenous Flora Restored: 2,500+ Trees', 20, yPos + 15);
      doc.text('• Estimated bees supported: 2.4M+', 20, yPos + 25);
      doc.text('• Carbon Sequestration: 2.1 Tons (Projected)', 20, yPos + 35);
      yPos += 55;

      // Conservation Progress
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Progress indicators', 14, yPos);
      yPos += 12;

      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text('Habitat Fidelity: 95%', 14, yPos); yPos += 8;
      doc.text('Chemical-free baseline: 100%', 14, yPos); yPos += 8;
      doc.text('Acoustic Health Baseline: 88%', 14, yPos); yPos += 15;

      // 50/50 Promise
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('The 50/50 Ethical Anchor', 14, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      const promiseText = 'We strictly enforce a policy where 50% of the harvest resides in the hive. This is not just ethics; it is resource management for colony resilience during climate-driven dry cycles.';
      const promiseLines = doc.splitTextToSize(promiseText, pageWidth - 28);
      doc.text(promiseLines, 14, yPos);

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('BeeYield impact report', pageWidth / 2, 280, { align: 'center' });
      doc.text('Report ID: BY-IMP-2026-X7', pageWidth / 2, 286, { align: 'center' });

      doc.save('BeeYield-Impact-Report-2026.pdf');
      toast.success('Impact report downloaded');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const stats = [
    { label: "Bees Protected", value: "2.4M+", icon: Bug, color: "text-[#F4D03F]", bg: "bg-amber-50" },
    { label: "Trees Planted", value: "2,500+", icon: TreePine, color: "text-[#1B9157]", bg: "bg-emerald-50" },
    { label: "Integrity Score", value: "99.9%", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Carbon Offset", value: "2.1t", icon: Sprout, color: "text-lime-600", bg: "bg-lime-50" },
  ];

  return (
    <BeeYieldPageShell className="min-h-screen bg-[#fdfbf6] p-0">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 border-beeyield-gold/30 text-beeyield-gold bg-beeyield-gold/5 font-semibold text-sm">
              <Globe className="w-3 h-3 mr-2" />
              Global impact
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] mb-8 tracking-tighter leading-[0.95]">
              Ecological <span className="text-beeyield-green">Impact.</span> <br />
              <span className="text-beeyield-gold italic">Quantified.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
              Every drop of BeeYield honey is a verifiable record of environmental restoration. We use advanced analytics to turn nature's health into hard data.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleDownloadImpactReport}
                disabled={downloading}
                className="group relative inline-flex items-center gap-3 bg-[#FFF9F0] text-[#1A1A1A] px-8 py-4 rounded-2xl font-black shadow-2xl hover:bg-slate-800 transition-all disabled:opacity-50 h-16"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-beeyield-gold to-beeyield-green rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                {downloading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying Data...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Download Official Record
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Background Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="impact-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#impact-grid)" />
          </svg>
        </div>
      </section>

      {/* Live Metrics Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-none shadow-soft rounded-[2.5rem] bg-[#FFF9F0] overflow-hidden group hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                      <stat.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-4xl font-black text-[#1A1A1A] mb-2 tracking-tighter">{stat.value}</h3>
                    <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Narrative Sections */}
      <section className="py-24 bg-[#FFF9F0]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group">
                <img src={impactImage} alt="BeYield Sustainable Beekeeping" className="w-full aspect-[4/5] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div className="absolute bottom-10 left-10 text-[#1A1A1A]">
                  <p className="text-sm font-semibold mb-2">Location: Kibwezi, Kenya</p>
                  <h4 className="text-2xl font-bold">Resilient Landscapes</h4>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div>
                <h2 className="text-3xl md:text-5xl font-black text-[#1A1A1A] mb-6 tracking-tighter">Radical Ecological <br />Transparency.</h2>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  We don't just harvest honey; we steward a biome. Our precision pollination model ensures that for every acre of apiary, local biodiversity thrives. We track native flora restoration down to the coordinate.
                </p>
              </div>

              <div className="space-y-8">
                <div className="p-6 rounded-[2.5rem] bg-emerald-50 border border-[#1B9157]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-[#1B9157] text-sm">Habitat health</span>
                    <span className="font-black text-[#1B9157]">95%</span>
                  </div>
                  <Progress value={95} className="h-3 bg-emerald-100" />
                </div>

                <div className="p-6 rounded-[2.5rem] bg-beeyield-gold/5 border border-beeyield-gold/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-[#D4AC0D] text-sm">Chemical-free index</span>
                    <span className="font-black text-beeyield-gold">100%</span>
                  </div>
                  <Progress value={100} className="h-3 bg-amber-100" />
                </div>

                <div className="p-6 rounded-[2.5rem] bg-blue-50 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-blue-800 text-sm">Acoustic health baseline</span>
                    <span className="font-black text-blue-700">88%</span>
                  </div>
                  <Progress value={88} className="h-3 bg-blue-100" />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-6">
                <div className="h-14 w-14 rounded-2xl bg-[#FFF9F0] flex items-center justify-center text-[#1A1A1A] shadow-xl">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">Live data sync</p>
                  <p className="text-xs text-slate-400 font-medium">Data synced with Kibwezi Sensor Network</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2030 Roadmap */}
      <section className="py-24 bg-[#FFF9F0] text-[#1A1A1A] overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">The 2030 <br />Biosphere Roadmap.</h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Our architecture is designed for scale. By 2030, we aim to be the digital backbone for ethical apiculture across Sub-Saharan Africa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Scale up", desc: "Support 10,000 additional beehives with better monitoring and training.", icon: Bug },
              { title: "Tree tracking", desc: "Track 100k native trees with on-the-ground updates and satellite data.", icon: TreePine },
              { title: "Zero-Watt", desc: "100% carbon-neutral processing through solar micro-grids.", icon: Zap },
              { title: "Global Hive", desc: "Expand to 200+ partner beekeepers in rural emerging markets.", icon: Globe },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-[#F9F7F2] border border-[#F4D03F]/20 backdrop-blur-md"
              >
                <item.icon className="h-8 w-8 text-beeyield-gold mb-6" />
                <h4 className="text-xl font-bold mb-4">{item.title}</h4>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Decorative BG Blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-beeyield-green/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* Impact CTA */}
      <section className="py-24 bg-[#FFF9F0] border-b border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-10 h-10 text-beeyield-green" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-6">Invest in Planetary Health.</h3>
            <p className="text-slate-500 mb-10 text-lg">
              Whether you're a consumer, partner, or researcher, you're part of this ecosystem. Let's make every drop count.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="px-8 py-4 bg-[#FFF9F0] text-[#1A1A1A] rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2">
                Contact the Hive <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/global-hive-network" className="px-8 py-4 bg-[#FFF9F0] text-[#1A1A1A] border-2 border-slate-100 rounded-2xl font-black hover:bg-[#F9F7F2] transition-all">
                Join our Global Hive Network
              </Link>
            </div>
          </div>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default Impact;
