import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import {
  Sprout,
  Droplets,
  TreePine,
  Bug,
  Download,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Zap,
  Globe,
  Heart,
  Radio,
  Scale,
  Activity,
  CheckCircle2,
  Trees,
  Flower2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { ThreePhotoSlideshow } from "@/components/ThreePhotoSlideshow";
import BEEYIELD_LOGO from "@/assets/Logo.png";
import beeyieldService from "@/services/beeyieldService";

/* ── Authentic Field Photos (Zero AI Renders) ─────────────────── */
const IMPACT_IMAGES = {
  deployedHive1: "/images/pollination/beeyield-apisense-deployment.png",
  deployedHive2: "/images/pollination/beeyield-apisense-gateway-field.png",
  apisenseCluster1: "/images/pollination/apisense-colony-monitoring.png",
  apisenseCluster2: "/images/pollination/apisense-sensor-comb-inspection.png",
  apisenseCloseup1: "/images/pollination/apisense-internal-sensor-probe.png",
  apisenseCloseup2: "/images/pollination/apisense-colony-monitoring.png",
  beeColonyWide: "/images/story/hives/apiary-hive-field-1.jpg",
  solarGateway: "/images/pollination/gateway-solar-node.png",
  hiveScale: "/images/pollination/hive-scale-loadcell.png",
  combProbe1: "/images/pollination/hive-comb-inspection-6.png",
  combProbe2: "/images/pollination/hive-comb-inspection-7.png",
  combProbe3: "/images/pollination/hive-comb-inspection-8.png",
};

const Impact = () => {
  const [downloading, setDownloading] = useState(false);
  const [liveStats, setLiveStats] = useState<any>(null);

  useEffect(() => {
    beeyieldService.getImpactStats().then((data) => {
      if (data) setLiveStats(data);
    });
  }, []);

  const handleDownloadImpactReport = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      /* ─────────────────────────────────────────────────────────────
         PAGE 1: Executive Summary, Ecological KPIs & Ethical Anchor
      ───────────────────────────────────────────────────────────── */
      try {
        doc.addImage(BEEYIELD_LOGO, "PNG", 14, 10, 24, 24);
      } catch (e) {
        console.warn("Could not load logo for PDF");
      }

      doc.setFontSize(22);
      doc.setTextColor(27, 145, 87); // BeeYield green
      doc.text("BeeYield", 42, 20);

      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text("Ecological Impact & Provenance Dossier • Official Record 2026", 42, 26);
      doc.text("Provenance: BeeYield Apiary, Kibwezi & Makueni County, Kenya • Lead Farmer: Timothy Nduva", 42, 31);

      doc.setDrawColor(27, 145, 87);
      doc.setLineWidth(0.8);
      doc.line(14, 38, pageWidth - 14, 38);

      let yPos = 47;
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("1. Executive Summary & Mission", 14, yPos);
      yPos += 7;

      doc.setFontSize(9.5);
      doc.setTextColor(75, 85, 99);
      const summaryText =
        "BeeYield supports healthier hives, stronger pollination, and traceable harvests. With 22 IoT devices deployed across 105 acres and counting of pollinated farmland (Lead Farmer: Timothy Nduva) across 1 county (Makueni & counting) with 9+ crops & counting, we deliver precision agriculture through real-time telemetry while offsetting 3 tons of carbon through native tree restoration. Our data-informed stocking protocols increase crop yields by 9–18% while safeguarding wild and managed pollinators.";
      const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 28);
      doc.text(summaryLines, 14, yPos);
      yPos += summaryLines.length * 5 + 6;

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("2. Core Ecological & Precision Metrics", 14, yPos);
      yPos += 6;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, yPos, pageWidth - 28, 64, 3, 3, "F");
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, yPos, pageWidth - 28, 64, 3, 3, "S");

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const kpis = [
        `• Intelligent Hives: ${liveStats?.hive_count || "184"} Smart Hives in Active Deployment`,
        "• IoT Telemetry Nodes: 22 Live Nodes (Apisense & Intelligent Hives)",
        "• Land Under Pollination: 105 acres and counting (Verified • Lead Farmer: Timothy Nduva)",
        "• Counties Served: 1 County (Makueni & Counting)",
        "• Crop Varieties Covered: 9+ Crops & Counting (Mango, Avocado, Citrus, Oranges, Sunflower, etc.)",
        "• Telemetry Ingestion: Over 2,000 data points daily & growing",
        "• Documented Crop Yield Uplift: 9–18% average increase observed in partner orchards",
        "• Indigenous Flora Restored: 2,500+ Indigenous Trees Planted",
        "• Verified Carbon Offset: 3.0 Tons CO₂ Sequestered",
      ];
      let kpiY = yPos + 6;
      kpis.forEach((kpi) => {
        doc.text(kpi, 20, kpiY);
        kpiY += 6.2;
      });
      yPos += 72;

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("3. Progress & Biological Quality Indicators", 14, yPos);
      yPos += 7;

      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.text("• Habitat Fidelity Rate: 95% — optimal forage diversity index maintained", 16, yPos); yPos += 5.5;
      doc.text("• Chemical-Free Baseline: 100% — zero synthetic pesticides or organophosphates in hives", 16, yPos); yPos += 5.5;
      doc.text("• Acoustic Health Baseline: 88% — low stress & normal queen piping frequencies", 16, yPos); yPos += 5.5;
      doc.text("• Traceability Integrity Score: 99.9% — tamper-proof BeeYield batch hashing", 16, yPos); yPos += 9;

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("4. The 50/50 Ethical Anchor", 14, yPos);
      yPos += 7;

      doc.setFontSize(9.5);
      doc.setTextColor(75, 85, 99);
      const promiseText =
        "BeeYield strictly enforces our core doctrine: exactly 50% of the honey harvest resides permanently in the hive. This is non-negotiable biological resource management ensuring colony survival and disease resistance during arid climate dry cycles. The bees always eat first.";
      const promiseLines = doc.splitTextToSize(promiseText, pageWidth - 28);
      doc.text(promiseLines, 14, yPos);

      // Page 1 Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("BeeYield Official Impact Record 2026 • Report ID: BY-IMP-2026-X7", 14, pageHeight - 10);
      doc.text("Page 1 of 3", pageWidth - 14, pageHeight - 10, { align: "right" });

      /* ─────────────────────────────────────────────────────────────
         PAGE 2: Traceability Batches, Tree Commitment & Our Growth
      ───────────────────────────────────────────────────────────── */
      doc.addPage();

      doc.setFontSize(16);
      doc.setTextColor(27, 145, 87);
      doc.text("BeeYield Traceability Batches & Tree Commitment", 14, 20);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 24, pageWidth - 14, 24);

      yPos = 33;
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("5. Authenticated Harvest Batches (BeeYield Traceability)", 14, yPos);
      yPos += 7;

      const batches = [
        {
          id: "Batch KIB-ACAC-2026-01",
          name: "100% Pure Raw Acacia Honey",
          details: "Apiary: Kibwezi Base | Hives: 184 Intelligent Nodes | Moisture: 17.2% (Standard <18%) | HMF: <10 mg/kg | 100% Unpasteurized & Cold-Filtered | Zero Sugar Adulteration | Verified Under-Hive Weight Telemetry",
        },
        {
          id: "Batch MAK-FLOR-2026-02",
          name: "Multi-Flora Orchard Blossom Honey",
          details: "Origin: Makueni Orchard Corridor | Pollination: Apple Mango & Hass Avocado Anthesis | Acres: 105 and counting | Verified Yield Uplift: 9–18% | 100% Chemical-Free Standard | Batch QR Encoded",
        },
        {
          id: "Batch KIB-COMB-125",
          name: "Pure Natural Cut Comb Honey",
          details: "Apiary: Kibwezi North Apiary | Virgin Beeswax Comb | Harvested per 50/50 Ethical Rule | Tamper-Evident Food-Grade Seal | Real-Time Temperature & Humidity Bio-Audited",
        },
      ];

      batches.forEach((b) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, yPos, pageWidth - 28, 22, 2, 2, "F");
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, yPos, pageWidth - 28, 22, 2, 2, "S");

        doc.setFontSize(10);
        doc.setTextColor(27, 145, 87);
        doc.text(b.id, 18, yPos + 6);
        doc.setTextColor(15, 23, 42);
        doc.text(`— ${b.name}`, 68, yPos + 6);

        doc.setFontSize(8.5);
        doc.setTextColor(75, 85, 99);
        const detailLines = doc.splitTextToSize(b.details, pageWidth - 36);
        doc.text(detailLines, 18, yPos + 12);

        yPos += 27;
      });

      yPos += 2;
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("6. Tree Commitment & Indigenous Reforestation", 14, yPos);
      yPos += 7;

      doc.setFontSize(9.5);
      doc.setTextColor(75, 85, 99);
      const treeText =
        "BeeYield has planted over 2,500 indigenous trees across Kibwezi and Makueni to restore pollinator forage belts and combat semi-arid desertification. Our on-site tree nursery propagates drought-tolerant native species including Acacia tortilis, Melia volkensii (Mukau), and Moringa oleifera. These trees sequester 3.0 tons of CO₂ annually while restoring groundwater retention for rural community smallholders.";
      const treeLines = doc.splitTextToSize(treeText, pageWidth - 28);
      doc.text(treeLines, 14, yPos);
      yPos += treeLines.length * 5 + 8;

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("7. Our Growth & Operational Journey (2020–2026)", 14, yPos);
      yPos += 7;

      const milestones = [
        "• 2020: Founded by siblings Timothy, Agatha, and Carole Nduva with 4 hives on ¼ acre in Kibwezi.",
        "• 2021–2023: Scaled to 75 hives, planted first 113 indigenous trees, initiated pollination trials.",
        "• 2024–2025: Surpassed 150 hives, enrolled 40 partner beekeepers, established BeeYield traceability.",
        "• 2026 (The Tech Year): 184 hives, 22 IoT devices deployed with global partners (Apisense & Intelligent Hives Poland), 105 acres and counting precision-pollinated across 1 county (Makueni & counting) for 9+ crops & counting, over 2,000 data points daily & growing, 988 kg lifetime honey, 100% reinvested with zero external capital.",
      ];

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      milestones.forEach((m) => {
        const mLines = doc.splitTextToSize(m, pageWidth - 28);
        doc.text(mLines, 14, yPos);
        yPos += mLines.length * 4.8 + 2;
      });

      // Page 2 Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("BeeYield Official Impact Record 2026 • Report ID: BY-IMP-2026-X7", 14, pageHeight - 10);
      doc.text("Page 2 of 3", pageWidth - 14, pageHeight - 10, { align: "right" });

      /* ─────────────────────────────────────────────────────────────
         PAGE 3: UN SDGs, Media Archive & Formal Certification
      ───────────────────────────────────────────────────────────── */
      doc.addPage();

      doc.setFontSize(16);
      doc.setTextColor(27, 145, 87);
      doc.text("UN Sustainable Development Goals (SDGs) & Media Verification", 14, 20);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 24, pageWidth - 14, 24);

      yPos = 33;
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("8. UN SDGs Commitment & Measurable Outcomes", 14, yPos);
      yPos += 7;

      const sdgs = [
        "• SDG 1 - No Poverty: Trained 50+ local smallholders in modern beekeeping and disease prevention.",
        "• SDG 2 - Zero Hunger: 105 acres and counting pollinated across 1 county (Makueni & counting) for 9+ crops & counting, increasing crop yields by 9–18%.",
        "• SDG 6 - Clean Water: 2,500+ indigenous trees planted, stabilizing catchment soil and protecting groundwater.",
        "• SDG 7 - Clean Energy: 100% solar-powered IoT micro-grids and low-power telemetry nodes.",
        "• SDG 8 - Decent Work: Fair-trade farmer pricing; 66% women leadership in founding engineering.",
        "• SDG 13 - Climate Action: 3.0 tons CO₂ offset annually; active reforestation in semi-arid Kenya.",
        "• SDG 15 - Life on Land: Varroa mite & Asian hornet early warning, strict zero-pesticide sanctuary baseline.",
      ];

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      sdgs.forEach((sdg) => {
        const sLines = doc.splitTextToSize(sdg, pageWidth - 28);
        doc.text(sLines, 14, yPos);
        yPos += sLines.length * 4.8 + 2;
      });

      yPos += 4;
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("9. Authentic Media, Field Telemetry & Verification Archive", 14, yPos);
      yPos += 7;

      doc.setFontSize(9.5);
      doc.setTextColor(75, 85, 99);
      const mediaText =
        "BeeYield maintains a strict 100% authentic field photography standard — zero AI renders, 100% real ground truth. Our media archive includes acoustic frequency spectrograms trained on 350,000+ bee sound samples, time-lapse anthesis imagery, and live telemetry feeds.";
      const mediaLines = doc.splitTextToSize(mediaText, pageWidth - 28);
      doc.text(mediaLines, 14, yPos);
      yPos += mediaLines.length * 5 + 6;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, yPos, pageWidth - 28, 26, 2, 2, "F");
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, yPos, pageWidth - 28, 26, 2, 2, "S");

      doc.setFontSize(9);
      doc.setTextColor(27, 145, 87);
      doc.text("Official Public Verification Links:", 18, yPos + 6);
      doc.setTextColor(51, 65, 85);
      doc.text("• Field Photo & Video Archive: https://www.beeyield.com/media", 18, yPos + 12);
      doc.text("• Field Agronomy & Blossom Research: https://www.beeyield.com/blogs", 18, yPos + 18);
      doc.text("• Precision Pollination Telemetry: https://www.beeyield.com/crops-we-pollinate", 18, yPos + 24);
      yPos += 34;

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Official Impact Certification & Sign-off", 14, yPos);
      yPos += 6;

      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Issued by BeeYield Engineering & Agronomy Directorate • Nairobi & Makueni, Kenya", 14, yPos);
      yPos += 5;
      doc.text("Directors & Lead Farmer: Timothy Nduva (CEO & Lead Farmer) • Agatha Nduva (CTO) • Carole Nduva (COO)", 14, yPos);

      // Page 3 Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("BeeYield Official Impact Record 2026 • Report ID: BY-IMP-2026-X7", 14, pageHeight - 10);
      doc.text("Page 3 of 3", pageWidth - 14, pageHeight - 10, { align: "right" });

      doc.save("BeeYield-Impact-Report-2026.pdf");
      toast.success("Impact report downloaded (3-page official record)");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const stats = [
    { label: "IoT Devices Deployed", value: "22", icon: Radio, color: "text-[#1B9157]", bg: "bg-emerald-50" },
    { label: "Acres Pollinated", value: "105+", icon: Sprout, color: "text-[#F4D03F]", bg: "bg-amber-50" },
    { label: "Carbon Offset", value: "3t", icon: TreePine, color: "text-lime-600", bg: "bg-lime-50" },
    { label: "Bees Protected", value: "2.4M+", icon: Bug, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Trees Planted", value: "2,500+", icon: TreePine, color: "text-[#1B9157]", bg: "bg-emerald-50" },
    { label: "Integrity Score", value: "99.9%", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <BeeYieldPageShell className="min-h-screen bg-[#fdfbf6] p-0">

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION — Authentic Honeybee Colony Background
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMPACT_IMAGES.apisenseCluster1}
            alt="Active bee colony clustered on ApiSense in-hive sensor"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf6]/95 via-[#fdfbf6]/90 to-[#fdfbf6]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 border-beeyield-gold/30 text-amber-800 bg-amber-50/80 font-bold text-xs uppercase tracking-wider shadow-sm">
              <Globe className="w-3.5 h-3.5 mr-2 text-beeyield-gold" />
              Biosphere Intelligence • Verified Ground Truth
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] mb-8 tracking-tighter leading-[0.95]">
              Ecological <span className="text-beeyield-green">Impact.</span> <br />
              <span className="text-beeyield-gold italic">Quantified.</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-700 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
              22 IoT devices deployed. 105+ acres precision-pollinated across Makueni County. 3 tons of carbon offset. Every metric is backed by authentic sensor data from our Kenyan apiaries — zero AI imagery.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleDownloadImpactReport}
                disabled={downloading}
                className="group relative inline-flex items-center gap-3 bg-neutral-900 text-white px-8 py-4 rounded-2xl font-black shadow-2xl hover:bg-neutral-800 transition-all disabled:opacity-50 h-16"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-beeyield-gold to-beeyield-green rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                {downloading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying Data...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 text-beeyield-gold" />
                    Download Official Record (3-Page Dossier)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. LIVE METRICS GRID (6 Verified Metrics)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="border border-neutral-200/80 shadow-md rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-4xl font-black text-[#1A1A1A] mb-2 tracking-tighter">{stat.value}</h3>
                  <p className="text-sm font-semibold text-neutral-600">{stat.label}</p>
                </CardContent>
              </Card>
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
                  description: "Autonomous transmission node standing on metal pole in Kenyan apiary during nighttime field check.",
                },
                {
                  image: IMPACT_IMAGES.deployedHive2,
                  title: "Kenyan Top-Bar Hive Stand",
                  subtitle: "Weatherproof antenna unit mounted on lid",
                  badge: "105+ Acres Served",
                  description: "Robust solar-powered node operating at commercial orchard boundaries to monitor pollinator foraging density.",
                },
                {
                  image: IMPACT_IMAGES.solarGateway,
                  title: "Solar LTE Field Gateway",
                  subtitle: "High-gain dual antenna LTE gateway",
                  badge: "Zero-Watt Grid",
                  description: "Self-powered gateway aggregating data from all local hive sensors and relaying to cloud dashboards in real time.",
                },
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
                  description: "Worker bees accept the electronic hardware immediately, navigating the sensor board without alarm responses.",
                },
                {
                  image: IMPACT_IMAGES.apisenseCluster1,
                  title: "Active Colony Surrounding Probe",
                  subtitle: "Hundreds of bees clustered on sensor",
                  badge: "Colony Vitality",
                  description: "Dense bee cluster surrounding the in-hive ApiSense probe, showing zero repellent behavior.",
                },
                {
                  image: IMPACT_IMAGES.beeColonyWide,
                  title: "Thriving African Bee Colony",
                  subtitle: "Full-depth cluster density",
                  badge: "2.4M+ Bees Protected",
                  description: "Demonstrates vigorous colony health, high worker population density, and healthy brood rearing.",
                },
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
                  description: "Real-time acoustic and temperature tracking inside occupied traditional log hives with full biocompatibility.",
                },
                {
                  image: IMPACT_IMAGES.apisenseCluster2,
                  title: "Dense Bee Cluster Telemetry",
                  subtitle: "Worker bees covering vertical sensor node",
                  badge: "Bee Behavior",
                  description: "Proves complete biological acceptance with bees moving freely across probe surface.",
                },
                {
                  image: IMPACT_IMAGES.combProbe1,
                  title: "In-Hive Acoustic Sampling",
                  subtitle: "Acoustic diagnostic sampling frame",
                  badge: "Acoustic AI",
                  description: "High-fidelity bio-acoustic spectrum tracking for swarm prediction and colony stress monitoring.",
                },
              ]}
              badge="Bio-Telemetry"
              title="In-Hive Bio-Sensors"
              subtitle="Acoustic & thermal sampling"
              dark={true}
            />

            {/* Slideshow 4: Scales, Comb & Carbon Offset */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: IMPACT_IMAGES.hiveScale,
                  title: "Continuous Scale Telemetry",
                  subtitle: "Sub-milligram load cell telemetry",
                  badge: "Weight Delta",
                  description: "Industrial load cell bar mounted under hive base tracking diurnal weight changes down to sub-grams.",
                },
                {
                  image: IMPACT_IMAGES.combProbe2,
                  title: "Natural Honeycomb Wax Integration",
                  subtitle: "Bees drawing wax directly on sensor frame",
                  badge: "Biocompatible",
                  description: "Worker bees building fresh white beeswax around sensor structures, embedding the probe in natural comb.",
                },
                {
                  image: IMPACT_IMAGES.combProbe3,
                  title: "Multi-Frame Brood Coverage",
                  subtitle: "Top-down commercial hive inspection",
                  badge: "3t Carbon Offset",
                  description: "Parallel active frames showing full brood vitality and verified strength across precision-pollinated client orchards.",
                },
              ]}
              badge="Carbon & Comb"
              title="Scales & Comb Growth"
              subtitle="Continuous weighing & wax drawing"
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
            <div>
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group aspect-[4/5] bg-neutral-900">
                <img
                  src={IMPACT_IMAGES.deployedHive2}
                  alt="BeeYield IoT hive with antenna device deployed on traditional Kenyan beehive"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10 text-white">
                  <p className="text-sm font-semibold mb-2 text-emerald-400">Location: Makueni County, Kenya</p>
                  <h4 className="text-2xl font-bold">22 Devices. 105+ Acres. Real Impact.</h4>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div>
                <h2 className="text-3xl md:text-5xl font-black text-[#1A1A1A] mb-6 tracking-tighter">
                  Radical Ecological <br />Transparency.
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  We don't just harvest honey; we steward a biome. With 22 IoT devices deployed across 105+ acres of precision-pollinated farmland and 3 tons of carbon offset through 2,500+ native trees, our impact is verifiable from satellite to in-hive sensor.
                </p>
              </div>

              <div className="space-y-8">
                <div className="p-6 rounded-[2.5rem] bg-emerald-50 border border-[#1B9157]/40 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-[#1B9157] text-sm">Habitat health fidelity</span>
                    <span className="font-black text-[#1B9157]">95%</span>
                  </div>
                  <Progress value={95} className="h-3 bg-emerald-100" />
                </div>

                <div className="p-6 rounded-[2.5rem] bg-amber-50/70 border border-amber-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-amber-800 text-sm">Chemical-free index</span>
                    <span className="font-black text-amber-700">100%</span>
                  </div>
                  <Progress value={100} className="h-3 bg-amber-100" />
                </div>

                <div className="p-6 rounded-[2.5rem] bg-blue-50 border border-blue-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-blue-800 text-sm">Acoustic health baseline</span>
                    <span className="font-black text-blue-700">88%</span>
                  </div>
                  <Progress value={88} className="h-3 bg-blue-100" />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-6">
                <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-[#1A1A1A] shadow-md border border-neutral-200">
                  <Zap className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A1A1A]">Live data sync active</p>
                  <p className="text-xs text-neutral-500 font-medium">Data synced from 22 IoT sensor nodes across Makueni apiaries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. DEDICATED REFORESTATION LINK: PROJECT PANDA MITI
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-neutral-950 text-white border-y border-neutral-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-r from-emerald-950 via-neutral-900 to-emerald-950 border border-emerald-500/30 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                <Trees className="w-4 h-4 text-emerald-400" />
                <span>Featured Ecological Initiative • Panda Miti Corridors</span>
              </div>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-500/10 font-bold text-xs px-3 py-1">
                2,500 / 45,000 Trees (5.6%)
              </Badge>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-center mb-8">
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Project Panda Miti: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">45,000 Trees</span> for Kibwezi
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  2,500+ indigenous trees already planted to restore groundwater aquifers, cool microclimates, and secure continuous nectar and pollen sanctuaries for bees. By planting native Acacia, Mukau, and Moringa, Panda Miti ends dry-season famine for over 184+ colonies and millions of wild pollinators.
                </p>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-emerald-200 text-xs sm:text-sm italic">
                  “Every seedling is nurtured by local youth beekeepers and mapped with GPS telemetry to guarantee survival and perennial blossom.”
                </div>
              </div>

              <div className="lg:col-span-5 bg-black/40 p-6 rounded-2xl border border-emerald-500/20 space-y-4">
                <div className="flex justify-between text-xs font-semibold text-emerald-200">
                  <span>Field Planting Progress</span>
                  <span className="text-emerald-400 font-bold">2,500 / 45,000 Goal</span>
                </div>
                <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-emerald-500/20">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full w-[5.6%]" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px] pt-2 border-t border-white/10">
                  <div className="p-2 rounded-xl bg-white/5">
                    <TreePine className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="font-bold text-white block">Tree Restoration</span>
                    <span className="text-emerald-200/70 text-[9px]">Aquifer recovery</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <Heart className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <span className="font-bold text-white block">Bees Saved</span>
                    <span className="text-amber-200/70 text-[9px]">Colony survival</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <Flower2 className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                    <span className="font-bold text-white block">Flowers Needing Bees</span>
                    <span className="text-teal-200/70 text-[9px]">85%+ dependent</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-emerald-500/20">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                  🌱 1 Tree = ~250 Bees Nourished
                </span>
                <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/20">
                  🌸 1 Tree = ~5,000 Blossoms Pollinated
                </span>
              </div>
              <Button size="lg" asChild className="bg-beeyield-green text-neutral-950 font-bold hover:bg-emerald-400 rounded-full px-8 shrink-0 shadow-lg">
                <Link to="/panda-miti">Explore Project Panda Miti <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. 2030 BIOSPHERE ROADMAP
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#FFF9F0] text-[#1A1A1A] overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">The 2030 <br />Biosphere Roadmap.</h2>
            <p className="text-slate-600 text-lg font-medium leading-relaxed">
              Our architecture is designed for scale. Building on 22 deployed devices, 105 and counting acres pollinated across Makueni, and 3 tons of carbon offset, we aim to be the digital backbone for ethical apiculture across Sub-Saharan Africa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Scale up", desc: "Support 10,000 additional beehives with real-time IoT monitoring.", icon: Bug },
              { title: "Tree tracking", desc: "Track 100k native trees with ground sensor nodes and satellite telemetry.", icon: TreePine },
              { title: "Zero-Watt", desc: "100% carbon-neutral processing through solar IoT micro-grids.", icon: Zap },
              { title: "Global Hive", desc: "Expand to 200+ partner beekeepers in rural emerging markets.", icon: Globe },
            ].map((item, i) => (
              <div key={i} className="rounded-3xl border border-neutral-200/80 p-8 shadow-sm bg-white hover:shadow-md transition-shadow">
                <item.icon className="h-8 w-8 text-beeyield-gold mb-6" />
                <h4 className="text-xl font-bold mb-4 text-neutral-900">{item.title}</h4>
                <p className="text-sm text-neutral-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-beeyield-green/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7. IMPACT CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#FFF9F0] border-b border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Heart className="w-10 h-10 text-beeyield-green" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-6">Invest in Planetary Health.</h3>
            <p className="text-slate-600 mb-10 text-lg">
              Whether you're a consumer, partner, or researcher, you're part of this ecosystem. 22 devices deployed. 105 and counting acres served. 3 tons of carbon offset. Let's make every drop count.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={"/about" as any} className="px-8 py-4 bg-neutral-900 text-white rounded-2xl font-black shadow-xl hover:bg-neutral-800 transition-all flex items-center gap-2">
                Our Story & Team <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={"/commitment" as any} className="px-8 py-4 bg-white text-neutral-900 border-2 border-neutral-200 rounded-2xl font-black hover:bg-neutral-50 transition-all">
                Our 8 UN SDGs Commitment
              </Link>
            </div>
          </div>
        </div>
      </section>

    </BeeYieldPageShell>
  );
};

export default Impact;
