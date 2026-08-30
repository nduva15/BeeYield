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
import { ThreePhotoSlideshow, SlideItem } from "@/components/ThreePhotoSlideshow";

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
          3. REAL FIELD EVIDENCE — Multiple 3-Photo Slideshows
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
              4 curated 3-photo slideshows documenting 22 deployed IoT hardware stations, live colony populations, in-hive bio-sensors, and precision continuous scales across Kenya.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            
            {/* Slideshow 1: 22 IoT Hardware Deployments */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: IMPACT_IMAGES.deployedHive1,
                  title: "Nighttime Apiary Field Telemetry",
                  subtitle: "Solar antenna module on galvanized tin roof",
                  badge: "22 Deployed Hives",
                  description: "Autonomous transmission node standing on metal pole in Kenyan apiary during nighttime field check."
                },
                {
                  image: IMPACT_IMAGES.deployedHive2,
                  title: "Kenyan Top-Bar Hive Stand",
                  subtitle: "Weatherproof antenna unit mounted on lid",
                  badge: "45 Acres Served",
                  description: "Robust solar-powered node operating at commercial orchard boundaries to monitor pollinator foraging density."
                },
                {
                  image: IMPACT_IMAGES.solarGateway,
                  title: "Solar LTE Field Gateway",
                  subtitle: "High-gain dual antenna LTE gateway",
                  badge: "Zero-Watt Grid",
                  description: "Self-powered gateway aggregating data from all local hive sensors and relaying to cloud dashboards in real time."
                }
              ]}
              badge="Hardware Grid"
              title="22 IoT Deployed Stations"
              subtitle="Solar antennas & hive stands"
              dark={true}
            />

            {/* Slideshow 2: Colony Health & Biocompatibility */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: IMPACT_IMAGES.apisenseCloseup2,
                  title: "In-Hive Hardware Acceptance",
                  subtitle: "Live forager on non-toxic sensor board",
                  badge: "Zero Rejection",
                  description: "Worker bees accept the electronic hardware immediately, navigating the sensor board without alarm responses."
                },
                {
                  image: IMPACT_IMAGES.apisenseCluster1,
                  title: "Active Colony Surrounding Probe",
                  subtitle: "Hundreds of bees clustered on sensor",
                  badge: "Colony Vitality",
                  description: "Dense bee cluster surrounding the in-hive ApiSense probe, showing zero repellent behavior."
                },
                {
                  image: IMPACT_IMAGES.beeColonyWide,
                  title: "Thriving African Bee Colony",
                  subtitle: "Full-depth cluster density",
                  badge: "2.4M+ Bees Protected",
                  description: "Demonstrates vigorous colony health, high worker population density, and healthy brood rearing."
                }
              ]}
              badge="Colony Health"
              title="Bio-Sensors & Bees"
              subtitle="Colony vitality & zero rejection"
              dark={true}
            />

            {/* Slideshow 3: Bio-Telemetry Diagnostics */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: IMPACT_IMAGES.apisenseCloseup1,
                  title: "ApiSense Bio-Sensor Probe",
                  subtitle: "In-hive probe installed inside log cavity",
                  badge: "Log Hive Validated",
                  description: "Real-time acoustic and temperature tracking inside occupied traditional log hives with full biocompatibility."
                },
                {
                  image: IMPACT_IMAGES.apisenseCluster2,
                  title: "Dense Bee Cluster Telemetry",
                  subtitle: "Worker bees covering vertical sensor node",
                  badge: "Bee Behavior",
                  description: "Proves complete biological acceptance with bees moving freely across probe surface."
                },
                {
                  image: IMPACT_IMAGES.combProbe1,
                  title: "In-Hive Acoustic Sampling",
                  subtitle: "Acoustic diagnostic sampling frame",
                  badge: "Acoustic AI",
                  description: "High-fidelity bio-acoustic spectrum tracking for swarm prediction and colony stress monitoring."
                }
              ]}
              badge="Bio-Telemetry"
              title="In-Hive Bio-Sensors"
              subtitle="Acoustic & thermal sampling"
              dark={true}
            />

            {/* Slideshow 4: Scales, Comb & Disease Detection */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: IMPACT_IMAGES.hiveScale,
                  title: "Continuous Scale Telemetry",
                  subtitle: "Sub-milligram load cell telemetry",
                  badge: "Weight Delta",
                  description: "Industrial load cell bar mounted under hive base tracking diurnal weight changes down to sub-grams."
                },
                {
                  image: IMPACT_IMAGES.combProbe2,
                  title: "Comb Disease Detection",
                  subtitle: "Early pathogen screening on drawn brood comb",
                  badge: "Disease Detection",
                  description: "Sensor-equipped frames enable early identification of American Foulbrood, chalkbrood, and Varroa-related brood abnormalities."
                },
                {
                  image: IMPACT_IMAGES.combProbe3,
                  title: "Multi-Frame Brood Coverage",
                  subtitle: "Top-down commercial hive inspection",
                  badge: "3t Carbon Offset",
                  description: "Parallel active frames showing full brood vitality and verified strength across precision-pollinated client orchards."
                }
              ]}
              badge="Disease Defense"
              title="Scales & Disease Detection"
              subtitle="Continuous weighing & pathogen defense"
              dark={true}
            />

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
