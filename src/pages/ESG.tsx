import { useState, useEffect } from "react";
import {
  Database, TrendingUp, Check, Heart, Sprout, Globe, Wind, Sun, ArrowRight, Quote,
  Users, Droplets, TreePine, Bug, Package, MapPin, Shield, Leaf, Cpu, Code, Loader2,
  Download, ShieldCheck, Zap, Scale, Radio, Activity
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

/* ── Authentic Field Photos (Zero AI Renders) ─────────────────── */
const ESG_IMAGES = {
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

const ESG = () => {
  const [downloading, setDownloading] = useState(false);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [esgPillars, setEsgPillars] = useState<any[]>([]);

  useEffect(() => {
    beeyieldService.getImpactStats().then(data => {
      if (data) setLiveStats(data);
    });
    beeyieldService.getEsgPillars().then(data => {
      if (data) setEsgPillars(data);
    });
  }, []);

  const handleDownloadReport = () => {
    setDownloading(true);
    setTimeout(() => {
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
        doc.text('Ecological ESG Report 2026', 50, 32);
        doc.text('Provenance: Kibwezi Apiary, Kenya', 50, 38);

        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text('ESG Strategic Framework', 14, 55);

        doc.setDrawColor(217, 119, 6);
        doc.setLineWidth(1);
        doc.line(14, 60, pageWidth - 14, 60);

        let yPos = 75;

        doc.setFontSize(12);
        doc.setTextColor(75, 85, 99);
        const introText = "BeeYield delivers measurable environmental, social, and governance outcomes: 22 IoT devices monitoring 45 precision-pollinated acres, 3 tons of carbon offset, and verifiable bio-data across Kenyan apiaries.";
        const introLines = doc.splitTextToSize(introText, pageWidth - 28);
        doc.text(introLines, 14, yPos);
        yPos += introLines.length * 7 + 10;

        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text('2026 ESG Verified Highlights', 14, yPos);
        yPos += 10;

        doc.setFillColor(248, 250, 252);
        doc.rect(14, yPos - 5, pageWidth - 28, 55, 'F');

        doc.setFontSize(11);
        doc.setTextColor(75, 85, 99);

        const stats = [
          `IoT Devices Deployed: 22 Live Telemetry Nodes`,
          `Precision Pollination: 45 Verified Acres`,
          `Carbon Sequestration: 3.0 Tons CO₂ Offset`,
          `Indigenous Flora Restored: 2,500+ Native Trees`,
          `Managed Inventory: ${liveStats?.hive_count || "184"} Monitored Hives`,
          `Pollinators Protected: 2.4M+ Active Bees`
        ];

        stats.forEach(stat => {
          doc.text(`• ${stat}`, 20, yPos + 5);
          yPos += 8;
        });
        yPos += 15;

        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text('Strategic Pillars', 14, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setTextColor(107, 114, 128);

        const pillars = [
          "1. Hive Health - Continuous acoustic & temperature telemetry from 22 deployed IoT nodes",
          "2. Traceability - Verifiable honey batch provenance and weight gain telemetry",
          "3. The 50/50 Anchor - 50% harvest reserved for colony climate resilience",
          "4. Precision Pollination - Real-time bloom telemetry across 45 client acres",
          "5. Women-Led Engineering - 66% diversity in founding leadership (Agatha, Carole, Timothy)",
          "6. Circular Ecosystems - Zero-waste, chemical-free operations with 2,500+ trees",
        ];

        pillars.forEach(pillar => {
          doc.text(pillar, 14, yPos);
          yPos += 8;
        });

        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('BeeYield ESG Registry | www.beeyield.com', pageWidth / 2, 280, { align: 'center' });
        doc.text('Report ID: BY-ESG-2026-X7', pageWidth / 2, 286, { align: 'center' });

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
    { value: "22", label: "IoT Devices", icon: Radio, description: "Deployed across apiaries" },
    { value: "45", label: "Acres Pollinated", icon: MapPin, description: "Bio-verified coverage" },
    { value: "3t", label: "Carbon Offset", icon: TreePine, description: "CO₂ sequestered to date" },
    { value: "2,500+", label: "Trees Planted", icon: Sprout, description: "Flora restoration" },
    { value: "184+", label: "Monitored Hives", icon: Bug, description: "Active colony inventory" },
    { value: "2.4M+", label: "Pollinators", icon: Heart, description: "Estimated bees supported" },
  ];

  return (
    <BeeYieldPageShell className="bg-white">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION — Real IoT Field Hive Background
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0">
          <img
            src={ESG_IMAGES.deployedHive1}
            alt="BeeYield IoT hive deployed in Kenyan apiary with solar antenna"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/94 via-white/88 to-white/98" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider">
              <Globe className="w-3 h-3 mr-2" />
              Verified ESG Framework
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 mb-8 tracking-tight leading-[1]">
              Governance <br />
              <span className="text-beeyield-green">by Integrity.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
              Every ESG metric at BeeYield is backed by authentic field telemetry from 22 deployed IoT devices across 45 pollinated acres and 3 tons of carbon offset — zero AI imagery, 100% ground truth.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="h-14 px-10 bg-neutral-900 text-white font-bold text-sm rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20" onClick={handleDownloadReport} disabled={downloading}>
                {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {downloading ? "Downloading…" : "Download 2026 ESG Report"}
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-10 border-neutral-200 text-neutral-900 font-bold text-sm rounded-2xl hover:bg-neutral-50 transition-all backdrop-blur-sm">
                <Link to="/commitment">Vision & Purpose</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-beeyield-green/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          IMPACT METRICS GRID (6 Verified Metrics)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-neutral-50/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {impactStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="text-center p-6 rounded-[2rem] bg-white border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl hover:border-beeyield-green/20 group hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-beeyield-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className="w-7 h-7 text-beeyield-green" />
                </div>
                <div className="text-2xl font-black text-[#1A1A1A] mb-1 tracking-tighter">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-700 mb-1">{stat.label}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PHOTO EVIDENCE SHOWCASE — Authentic ESG in Action
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white border-t border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-4 px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider">
              Field Ground Truth
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
              ESG in the <span className="text-beeyield-green">Field</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Authentic photography from our apiaries showing solar telemetry nodes, in-hive sensors, precision scales, and biocompatible wax development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Photo 1: Environmental / Solar Gateway */}
            <div className="group rounded-[2rem] overflow-hidden border border-neutral-200 bg-neutral-900 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={ESG_IMAGES.solarGateway}
                  alt="Solar IoT Gateway Node with dual high-gain antennas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-emerald-500 text-neutral-950 font-bold text-[9px]">Environmental</Badge>
                </div>
              </div>
              <div className="p-6 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-neutral-900 text-base mb-1">Zero-Watt Solar Hub</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">Self-sustaining solar harvest panel powering continuous cellular telemetry with zero grid draw.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-beeyield-green font-bold">
                  <span>3t CO₂ Offset</span>
                  <Zap className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Photo 2: Social / ApiSense with Bees */}
            <div className="group rounded-[2rem] overflow-hidden border border-neutral-200 bg-neutral-900 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={ESG_IMAGES.apisenseCloseup1}
                  alt="ApiSense sensor board inside active log hive with bees"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-amber-500 text-neutral-950 font-bold text-[9px]">Social Impact</Badge>
                </div>
              </div>
              <div className="p-6 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-neutral-900 text-base mb-1">Community Apiculture</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">Traditional log and top-bar hives modernized with non-invasive sensors to train local beekeepers.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-beeyield-green font-bold">
                  <span>45 Acres Served</span>
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Photo 3: Governance / Deployed Hive with Antenna */}
            <div className="group rounded-[2rem] overflow-hidden border border-neutral-200 bg-neutral-900 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={ESG_IMAGES.deployedHive2}
                  alt="Weatherproof antenna module deployed on traditional hive"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-blue-500 text-white font-bold text-[9px]">Governance</Badge>
                </div>
              </div>
              <div className="p-6 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-neutral-900 text-base mb-1">Verified Telemetry Nodes</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">22 deployed nodes transmitting tamper-evident microclimate and weight telemetry 24/7.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-beeyield-green font-bold">
                  <span>22 Active Nodes</span>
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Photo 4: Ecological / Natural Comb Building */}
            <div className="group rounded-[2rem] overflow-hidden border border-neutral-200 bg-neutral-900 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={ESG_IMAGES.combProbe2}
                  alt="Worker bees building fresh wax comb along sensor probe frame"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-lime-500 text-neutral-950 font-bold text-[9px]">Biocompatibility</Badge>
                </div>
              </div>
              <div className="p-6 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-neutral-900 text-base mb-1">Natural Comb Acceptance</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">Worker bees building natural comb directly onto sensor structures, confirming non-invasive integration.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-beeyield-green font-bold">
                  <span>100% Chemical-Free</span>
                  <Activity className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THREE ESG PILLARS WITH PHOTO INTEGRATION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-neutral-50/50 border-t border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            
            {/* Pillar 1: Environmental Stewardship */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px]">
                  E — Environmental
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
                  Biodiversity Stewardship & Carbon Offsets
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Through precision pollination across 45 client acres and the restoration of 2,500+ indigenous trees in Makueni County, we have sequestered 3 tons of CO₂. Continuous under-hive load-cell telemetry verifies nectar flow rates without disrupting colony homeostasis.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-200">
                  <div>
                    <span className="text-3xl font-black text-beeyield-green">3.0t</span>
                    <p className="text-xs font-semibold text-neutral-500 mt-1">Carbon Sequestered</p>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-beeyield-green">2,500+</span>
                    <p className="text-xs font-semibold text-neutral-500 mt-1">Indigenous Trees Planted</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-neutral-200 aspect-[4/3] bg-neutral-900">
                <img
                  src={ESG_IMAGES.hiveScale}
                  alt="Precision electronic hive scale load cell mounted under wooden hive"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Pillar 2: Social Impact & Smallholder Inclusion */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 rounded-[2.5rem] overflow-hidden shadow-2xl border border-neutral-200 aspect-[4/3] bg-neutral-900">
                <img
                  src={ESG_IMAGES.beeColonyWide}
                  alt="Dense African bee colony thriving around in-hive sensor probe"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[10px]">
                  S — Social Impact
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
                  Farmer Prosperity & Women-Led Innovation
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Founded in Kibwezi by siblings Timothy, Agatha, and Carole Nduva, BeeYield champions inclusive technology. With 66% women leadership in founding engineering, we empower smallholder mango and avocado growers with precision pollination that increases crop yields up to 35%.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-200">
                  <div>
                    <span className="text-3xl font-black text-amber-600">45</span>
                    <p className="text-xs font-semibold text-neutral-500 mt-1">Acres Pollinated</p>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-amber-600">66%</span>
                    <p className="text-xs font-semibold text-neutral-500 mt-1">Women Founding Leadership</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 3: Governance & Verifiable Bio-Data */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge className="bg-blue-100 text-blue-800 border-none font-bold text-[10px]">
                  G — Governance
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
                  Transparent Data & The 50/50 Harvest Anchor
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our governance enforces strict bio-auditing: 22 autonomous IoT devices transmit unalterable temperature, humidity, acoustic, and weight curves. We strictly enforce a policy where 50% of the harvest resides in the hive for colony climate resilience during dry cycles.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-200">
                  <div>
                    <span className="text-3xl font-black text-blue-600">22</span>
                    <p className="text-xs font-semibold text-neutral-500 mt-1">IoT Transmitting Nodes</p>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-blue-600">50/50</span>
                    <p className="text-xs font-semibold text-neutral-500 mt-1">Ethical Harvest Anchor</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-neutral-200 aspect-[4/3] bg-neutral-900">
                <img
                  src={ESG_IMAGES.apisenseCluster2}
                  alt="ApiSense sensor node surrounded by worker bees in hive"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOD SECURITY FOCUS (SDG 2)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white text-neutral-900 border-t border-neutral-100 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider">
                Strategic Focus: SDG 2 Zero Hunger
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight leading-tight">
                Data-Driven <br />Food Security.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-xl">
                In semi-arid Makueni, pollination isn't just a service—it's food security. We deploy 22 monitored hives across 45 acres of smallholder avocado and mango farms to maximize fruit set and yield.
              </p>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-beeyield-green">45</p>
                  <p className="text-sm font-semibold text-muted-foreground">Acres supported</p>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-beeyield-green">100%</p>
                  <p className="text-sm font-semibold text-muted-foreground">Pesticide-free baseline</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-beeyield-green to-emerald-400 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-neutral-100 aspect-square bg-neutral-900">
                <img
                  src={ESG_IMAGES.deployedHive2}
                  alt="BeeYield IoT monitoring station on traditional Kenyan hive"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent opacity-80" />
                <div className="absolute bottom-10 left-10 right-10">
                  <Quote className="w-10 h-10 text-beeyield-green mb-4 opacity-50" />
                  <p className="text-xl font-medium text-white leading-relaxed mb-4">
                    "Through precision pollination, we're not just harvesting honey—we're creating local food abundance with hard data."
                  </p>
                  <p className="text-sm font-bold text-beeyield-green">Timothy Nduva, CEO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PARTNER & MEDIA FOOTPRINT
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-neutral-50/50 border-t border-neutral-100">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="w-24 h-24 bg-white border border-neutral-200 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-12 h-12 text-beeyield-green" />
            </div>
            <h3 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight">Verified by Design.</h3>
            <p className="text-muted-foreground text-lg">
              22 IoT devices deployed. 45 acres precision-pollinated. 3 tons of carbon offset. Every jar traceable to its source apiary.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <Link to="/contact" className="px-10 py-5 bg-neutral-900 text-white rounded-2xl font-bold shadow-xl shadow-neutral-900/20 hover:bg-neutral-800 transition-all text-sm">
                Partner Engagement
              </Link>
              <Link to="/media" className="px-10 py-5 bg-white text-neutral-900 border border-neutral-200 rounded-2xl font-bold shadow-sm hover:bg-neutral-50 transition-all text-sm backdrop-blur-sm">
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
