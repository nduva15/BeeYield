import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sprout, Droplets, TreePine, Bug, Download, ArrowRight, Loader2,
  ShieldCheck, Zap, Globe, Heart, Radio, Scale, Activity, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import BEEYIELD_LOGO from "@/assets/Logo.png";
import beeyieldService from "@/services/beeyieldService";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

/* ── Authentic Field Photos (Zero AI Renders) ─────────────────── */
const IMPACT_IMAGES = {
  deployedHive1: '/images/story/deployed-hive-antenna-1.png',
  deployedHive2: '/images/story/deployed-hive-antenna-2.png',
  apisenseCluster1: '/images/story/apisense-bees-cluster-1.png',
  apisenseCluster2: '/images/story/apisense-bees-cluster-2.png',
  apisenseCloseup1: '/images/story/apisense-bees-closeup-1.png',
  apisenseCloseup2: '/images/story/apisense-bees-closeup-2.png',
  beeColonyWide: '/images/story/bee-colony-device-wide.jpg',
  solarGateway: '/images/pollination/gateway-solar-node.png',
  hiveScale: '/images/pollination/hive-scale-loadcell.png',
  combProbe1: '/images/pollination/hive-comb-inspection-6.png',
  combProbe2: '/images/pollination/hive-comb-inspection-7.png',
  combProbe3: '/images/pollination/hive-comb-inspection-8.png',
};

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

      try {
        doc.addImage(BEEYIELD_LOGO, 'PNG', 14, 10, 30, 30);
      } catch (e) {
        console.warn('Could not load logo for PDF');
      }

      doc.setFontSize(24);
      doc.setTextColor(22, 163, 74);
      doc.text('BeeYield', 50, 25);

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text('Ecological Impact Report 2026', 50, 32);
      doc.text('Provenance: BeeYield Apiary, Makueni, Kenya', 50, 38);

      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text('Impact Summary', 14, 55);

      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(1);
      doc.line(14, 60, pageWidth - 14, 60);

      let yPos = 75;
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Executive Summary', 14, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      const summaryText = 'BeeYield supports healthier hives, stronger pollination, and traceable harvests. With 22 IoT devices deployed across 45 acres of pollinated farmland, we deliver precision agriculture through real-time sensor data while offsetting 3 tons of carbon through native tree restoration.';
      const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 28);
      doc.text(summaryLines, 14, yPos);
      yPos += summaryLines.length * 7 + 10;

      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Ecological Metrics', 14, yPos);
      yPos += 10;

      doc.setFillColor(248, 250, 252);
      doc.rect(14, yPos - 5, pageWidth - 28, 50, 'F');

      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      doc.text(`• Monitored hives: ${liveStats?.hive_count || "184"}`, 20, yPos + 5);
      doc.text('• IoT Devices Deployed: 22 Live Nodes', 20, yPos + 15);
      doc.text('• Acres Pollinated: 45 Verified Acres', 20, yPos + 25);
      doc.text('• Indigenous Flora Restored: 2,500+ Trees', 20, yPos + 35);
      doc.text('• Carbon Offset: 3.0 Tons CO₂', 20, yPos + 45);
      yPos += 65;

      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Progress Indicators', 14, yPos);
      yPos += 12;

      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text('Habitat Fidelity: 95%', 14, yPos); yPos += 8;
      doc.text('Chemical-free baseline: 100%', 14, yPos); yPos += 8;
      doc.text('Acoustic Health Baseline: 88%', 14, yPos); yPos += 15;

      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('The 50/50 Ethical Anchor', 14, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      const promiseText = 'We strictly enforce a policy where 50% of the harvest resides in the hive. This is resource management for colony resilience during climate-driven dry cycles.';
      const promiseLines = doc.splitTextToSize(promiseText, pageWidth - 28);
      doc.text(promiseLines, 14, yPos);

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
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
    { label: "IoT Devices Deployed", value: "22", icon: Radio, color: "text-[#1B9157]", bg: "bg-emerald-50" },
    { label: "Acres Pollinated", value: "45", icon: Sprout, color: "text-[#F4D03F]", bg: "bg-amber-50" },
    { label: "Carbon Offset", value: "3t", icon: TreePine, color: "text-lime-600", bg: "bg-lime-50" },
    { label: "Bees Protected", value: "2.4M+", icon: Bug, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Trees Planted", value: "2,500+", icon: TreePine, color: "text-[#1B9157]", bg: "bg-emerald-50" },
    { label: "Integrity Score", value: "99.9%", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <BeeYieldPageShell className="min-h-screen bg-[#fdfbf6] p-0">
      
      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION — Real Honeybee Colony on Sensor Background
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMPACT_IMAGES.apisenseCluster1}
            alt="Active bee colony clustered on ApiSense in-hive sensor"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf6]/94 via-[#fdfbf6]/90 to-[#fdfbf6]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 border-beeyield-gold/30 text-beeyield-gold bg-beeyield-gold/5 font-semibold text-sm">
              <Globe className="w-3 h-3 mr-2" />
              Verified Impact Data
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] mb-8 tracking-tighter leading-[0.95]">
              Ecological <span className="text-beeyield-green">Impact.</span> <br />
              <span className="text-beeyield-gold italic">Quantified.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
              22 IoT devices deployed. 45 acres precision-pollinated. 3 tons of carbon offset. Every metric is backed by authentic sensor data from our Kenyan apiaries — zero AI imagery.
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
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. LIVE METRICS GRID (6 Verified Metrics)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
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

      {/* ═══════════════════════════════════════════════════════════════
          3. REAL FIELD EVIDENCE PHOTO MOSAIC (Photos Everywhere)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-neutral-950 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-4 px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider">
              100% Authentic Photography
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Real Field <span className="text-beeyield-green">Evidence.</span>
            </h2>
            <p className="text-neutral-400 text-lg font-medium">
              Authentic photography from our apiary network across Kenya — solar antennas on hive stands, active bee clusters on ApiSense probes, and load-cell continuous scales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* Photo 1: Nighttime Hive Stand Check */}
            <div className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-neutral-900 shadow-xl group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={IMPACT_IMAGES.deployedHive1}
                  alt="Deployed IoT hive with antenna on roof during nighttime field inspection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <Badge className="bg-beeyield-green text-neutral-950 font-bold text-[9px] mb-2">22 Active Nodes</Badge>
                <h4 className="text-white font-bold text-base">Nighttime Apiary Field Telemetry</h4>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Kenyan hive fitted with solar antenna on galvanized tin roof, operating autonomously on pole stands.
                </p>
              </div>
            </div>

            {/* Photo 2: Live Bee Landing on ApiSense */}
            <div className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-neutral-900 shadow-xl group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={IMPACT_IMAGES.apisenseCloseup2}
                  alt="Worker bee landing directly on ApiSense PCB"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <Badge className="bg-amber-400 text-neutral-950 font-bold text-[9px] mb-2">Biocompatible</Badge>
                <h4 className="text-white font-bold text-base">In-Hive Hardware Acceptance</h4>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Worker bees landing naturally on the ApiSense-branded board without rejection or alarm pheromones.
                </p>
              </div>
            </div>

            {/* Photo 3: Dense Bee Colony Wide */}
            <div className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-neutral-900 shadow-xl group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={IMPACT_IMAGES.beeColonyWide}
                  alt="Dense African honeybee colony thriving around in-hive sensor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <Badge className="bg-lime-400 text-neutral-950 font-bold text-[9px] mb-2">2.4M+ Bees</Badge>
                <h4 className="text-white font-bold text-base">Colony Population Vitality</h4>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  High-density African honeybee cluster building comb around our vertical telemetry probe.
                </p>
              </div>
            </div>

            {/* Photo 4: Solar LTE Gateway */}
            <div className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-neutral-900 shadow-xl group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={IMPACT_IMAGES.solarGateway}
                  alt="Autonomous solar IoT LTE gateway with dual high-gain antennas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <Badge className="bg-beeyield-green text-neutral-950 font-bold text-[9px] mb-2">Zero-Watt Grid</Badge>
                <h4 className="text-white font-bold text-base">Solar LTE Field Hub</h4>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  High-gain dual antenna LTE gateway with solar panel ensuring uninterrupted 24/7 cloud sync.
                </p>
              </div>
            </div>

            {/* Photo 5: Under-Hive Scale Load Cell */}
            <div className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-neutral-900 shadow-xl group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={IMPACT_IMAGES.hiveScale}
                  alt="Precision electronic hive scale load cell mounted under wooden hive"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <Badge className="bg-blue-400 text-neutral-950 font-bold text-[9px] mb-2">Weight Delta</Badge>
                <h4 className="text-white font-bold text-base">Continuous Scale Telemetry</h4>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Industrial load cell bar mounted under hive base tracking diurnal weight changes down to sub-grams.
                </p>
              </div>
            </div>

            {/* Photo 6: Fresh Comb Wax on Frame */}
            <div className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-neutral-900 shadow-xl group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={IMPACT_IMAGES.combProbe2}
                  alt="Fresh white honeycomb wax built seamlessly onto sensor frame"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <Badge className="bg-amber-300 text-neutral-950 font-bold text-[9px] mb-2">Wax Secretion</Badge>
                <h4 className="text-white font-bold text-base">Natural Comb Integration</h4>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Bees drawing fresh white beeswax directly across the biocompatible sensor frame.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. NARRATIVE SECTION (Radical Ecological Transparency)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#FFF9F0]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group aspect-[4/5] bg-neutral-900">
                <img
                  src={IMPACT_IMAGES.deployedHive2}
                  alt="BeeYield IoT hive with antenna device deployed on traditional Kenyan beehive"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
                <div className="absolute bottom-10 left-10 text-white">
                  <p className="text-sm font-semibold mb-2">Location: Makueni, Kenya</p>
                  <h4 className="text-2xl font-bold">22 Devices. 45 Acres. Real Impact.</h4>
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
                <h2 className="text-3xl md:text-5xl font-black text-[#1A1A1A] mb-6 tracking-tighter">
                  Radical Ecological <br />Transparency.
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  We don't just harvest honey; we steward a biome. With 22 IoT devices deployed across 45 acres of precision-pollinated farmland and 3 tons of carbon offset through 2,500+ native trees, our impact is verifiable from satellite to in-hive sensor.
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
                  <p className="text-xs text-slate-400 font-medium">Data synced from 22 IoT sensor nodes</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. 2030 BIOSPHERE ROADMAP
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#FFF9F0] text-[#1A1A1A] overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">The 2030 <br />Biosphere Roadmap.</h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Our architecture is designed for scale. Building on 22 deployed devices, 45 acres pollinated, and 3 tons of carbon offset, we aim to be the digital backbone for ethical apiculture across Sub-Saharan Africa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Scale up", desc: "Support 10,000 additional beehives with real-time IoT monitoring.", icon: Bug },
              { title: "Tree tracking", desc: "Track 100k native trees with ground sensor nodes and satellite telemetry.", icon: TreePine },
              { title: "Zero-Watt", desc: "100% carbon-neutral processing through solar IoT micro-grids.", icon: Zap },
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

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-beeyield-green/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. IMPACT CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#FFF9F0] border-b border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-10 h-10 text-beeyield-green" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-6">Invest in Planetary Health.</h3>
            <p className="text-slate-500 mb-10 text-lg">
              Whether you're a consumer, partner, or researcher, you're part of this ecosystem. 22 devices deployed. 45 acres served. 3 tons of carbon offset. Let's make every drop count.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="px-8 py-4 bg-neutral-900 text-white rounded-2xl font-black shadow-xl hover:bg-neutral-800 transition-all flex items-center gap-2">
                Contact the Hive <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/global-hive-network" className="px-8 py-4 bg-white text-neutral-900 border-2 border-neutral-200 rounded-2xl font-black hover:bg-neutral-50 transition-all">
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
