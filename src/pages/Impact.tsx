import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
import { StoryHeroBackground } from "@/components/StoryHeroBackground";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import SEO from "@/components/SEO";
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
      const pageHeight = doc.internal.pageSize.getHeight();

      /* ─────────────────────────────────────────────────────────────
         PAGE 1: Executive Summary, Ecological KPIs & Ethical Anchor
      ───────────────────────────────────────────────────────────── */
      try {
        doc.addImage(BEEYIELD_LOGO, 'PNG', 14, 10, 24, 24);
      } catch (e) {
        console.warn('Could not load logo for PDF');
      }

      doc.setFontSize(22);
      doc.setTextColor(27, 145, 87); // BeeYield green
      doc.text('BeeYield', 42, 20);

      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text('Ecological Impact & Provenance Dossier • Official Record 2026', 42, 26);
      doc.text('Provenance: BeeYield Apiary, Kibwezi & Makueni County, Kenya • Lead Farmer: Timothy Nduva', 42, 31);

      doc.setDrawColor(27, 145, 87);
      doc.setLineWidth(0.8);
      doc.line(14, 38, pageWidth - 14, 38);

      let yPos = 47;
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('1. Executive Summary & Mission', 14, yPos);
      yPos += 7;

      doc.setFontSize(9.5);
      doc.setTextColor(75, 85, 99);
      const summaryText =
        'BeeYield supports healthier hives, stronger pollination, and traceable harvests. With 22 IoT devices deployed across 105 acres and counting of pollinated farmland (Lead Farmer: Timothy Nduva) across 1 county (Makueni & counting) with 7 crops (mango, oranges, citrus, maize, vegetables, beans and sunflower), we deliver precision agriculture through real-time telemetry while offsetting 3 tons of carbon through native tree restoration. Our data-informed stocking protocols increase crop yields by 9–18% while safeguarding wild and managed pollinators.';
      const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 28);
      doc.text(summaryLines, 14, yPos);
      yPos += summaryLines.length * 5 + 6;

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('2. Core Ecological & Precision Metrics', 14, yPos);
      yPos += 6;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, yPos, pageWidth - 28, 64, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, yPos, pageWidth - 28, 64, 3, 3, 'S');

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const kpis = [
        `• Intelligent Hives: ${liveStats?.hive_count || "184"} Smart Hives in Active Deployment`,
        '• IoT Telemetry Nodes: 22 Live Nodes (Apisense & Intelligent Hives)',
        '• Land Under Pollination: 105 acres and counting (Verified • Lead Farmer: Timothy Nduva)',
        '• Counties Served: 1 County (Makueni & Counting)',
        '• Crops Covered: Mango, Oranges, Citrus, Maize, Vegetables, Beans and Sunflower',
        '• Telemetry Ingestion: Over 2,000 data points daily & growing',
        '• Documented Crop Yield Uplift: 9–18% average increase observed in partner orchards',
        '• Indigenous Flora Restored: 2,500+ Indigenous Trees Planted',
        '• Verified Carbon Offset: 3.0 Tons CO₂ Sequestered',
      ];
      let kpiY = yPos + 6;
      kpis.forEach((kpi) => {
        doc.text(kpi, 20, kpiY);
        kpiY += 6.2;
      });
      yPos += 72;

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('3. Progress & Biological Quality Indicators', 14, yPos);
      yPos += 7;

      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.text('• Habitat Fidelity Rate: 95% — optimal forage diversity index maintained', 16, yPos); yPos += 5.5;
      doc.text('• Chemical-Free Baseline: 100% — zero synthetic pesticides or organophosphates in hives', 16, yPos); yPos += 5.5;
      doc.text('• Acoustic Health Baseline: 88% — low stress & normal queen piping frequencies', 16, yPos); yPos += 5.5;
      doc.text('• Traceability Integrity Score: 99.9% — tamper-proof BeeYield batch hashing', 16, yPos); yPos += 9;

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('4. The 50/50 Ethical Anchor', 14, yPos);
      yPos += 7;

      doc.setFontSize(9.5);
      doc.setTextColor(75, 85, 99);
      const promiseText =
        'BeeYield strictly enforces our core doctrine: exactly 50% of the honey harvest resides permanently in the hive. This is non-negotiable biological resource management ensuring colony survival and disease resistance during arid climate dry cycles. The bees always eat first.';
      const promiseLines = doc.splitTextToSize(promiseText, pageWidth - 28);
      doc.text(promiseLines, 14, yPos);

      // Page 1 Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('BeeYield Official Impact Record 2026 • Report ID: BY-IMP-2026-X7', 14, pageHeight - 10);
      doc.text('Page 1 of 3', pageWidth - 14, pageHeight - 10, { align: 'right' });

      /* ─────────────────────────────────────────────────────────────
         PAGE 2: Traceability Batches, Tree Commitment & Our Growth
      ───────────────────────────────────────────────────────────── */
      doc.addPage();

      doc.setFontSize(16);
      doc.setTextColor(27, 145, 87);
      doc.text('BeeYield Traceability Batches & Tree Commitment', 14, 20);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 24, pageWidth - 14, 24);

      yPos = 33;
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('5. Authenticated Harvest Batches (BeeYield Traceability)', 14, yPos);
      yPos += 7;

      const batches = [
        {
          id: 'Batch KIB-ACAC-2026-01',
          name: '100% Pure Raw Acacia Honey',
          details: 'Apiary: Kibwezi Base | Hives: 184 Intelligent Nodes | Moisture: 17.2% (Standard <18%) | HMF: <10 mg/kg | 100% Unpasteurized & Cold-Filtered | Zero Sugar Adulteration | Verified Under-Hive Weight Telemetry',
        },
        {
          id: 'Batch MAK-FLOR-2026-02',
          name: 'Multi-Flora Orchard Blossom Honey',
          details: 'Origin: Makueni Orchard Corridor | Pollination: Mango & Citrus Bloom | Acres: 105 and counting | Verified Yield Uplift: 9–18% | 100% Chemical-Free Standard | Batch QR Encoded',
        },
        {
          id: 'Batch KIB-COMB-125',
          name: 'Pure Natural Cut Comb Honey',
          details: 'Apiary: Kibwezi North Apiary | Virgin Beeswax Comb | Harvested per 50/50 Ethical Rule | Tamper-Evident Food-Grade Seal | Real-Time Temperature & Humidity Bio-Audited',
        },
      ];

      batches.forEach((b) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, yPos, pageWidth - 28, 22, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, yPos, pageWidth - 28, 22, 2, 2, 'S');

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
      doc.text('6. Tree Commitment & Indigenous Reforestation', 14, yPos);
      yPos += 7;

      doc.setFontSize(9.5);
      doc.setTextColor(75, 85, 99);
      const treeText =
        'BeeYield has planted over 2,500 indigenous trees across Kibwezi and Makueni to restore pollinator forage belts and combat semi-arid desertification. Our on-site tree nursery propagates drought-tolerant native species including Acacia tortilis, Melia volkensii (Mukau), and Moringa oleifera. These trees sequester 3.0 tons of CO₂ annually while restoring groundwater retention for rural community smallholders.';
      const treeLines = doc.splitTextToSize(treeText, pageWidth - 28);
      doc.text(treeLines, 14, yPos);
      yPos += treeLines.length * 5 + 8;

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('7. Our Growth & Operational Journey (Dec 2020–2026)', 14, yPos);
      yPos += 7;

      const milestones = [
        '• December 2020: Founded by siblings Timothy, Agatha, and Carole Nduva with 4 hives on ¼ acre in Kibwezi.',
        '• 2021–2023: Scaled to 75 hives, planted first 113 indigenous trees, initiated pollination trials.',
        '• 2024–2025: Surpassed 150 hives, enrolled 40 partner beekeepers, established BeeYield traceability.',
        '• 2026 (The Tech Year): BeeYield officially founded as an IoT precision pollination company in July 2026. 184 hives, 22 IoT devices deployed with global partners (Apisense & Intelligent Hives Poland), 105 acres and counting precision-pollinated across 1 county (Makueni & counting) for 7 crops (mango, oranges, citrus, maize, vegetables, beans and sunflower), over 2,000 data points daily & growing, 988 kg lifetime honey, 100% reinvested with zero external capital.',
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
      doc.text('BeeYield Official Impact Record 2026 • Report ID: BY-IMP-2026-X7', 14, pageHeight - 10);
      doc.text('Page 2 of 3', pageWidth - 14, pageHeight - 10, { align: 'right' });

      /* ─────────────────────────────────────────────────────────────
         PAGE 3: UN SDGs, Media Archive & Formal Certification
      ───────────────────────────────────────────────────────────── */
      doc.addPage();

      doc.setFontSize(16);
      doc.setTextColor(27, 145, 87);
      doc.text('UN Sustainable Development Goals (SDGs) & Media Verification', 14, 20);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 24, pageWidth - 14, 24);

      yPos = 33;
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('8. UN SDGs Commitment & Measurable Outcomes', 14, yPos);
      yPos += 7;

      const sdgs = [
        '• SDG 1 - No Poverty: Trained 50+ local smallholders in modern beekeeping and disease prevention.',
        '• SDG 2 - Zero Hunger: 105 acres and counting pollinated across 1 county (Makueni & counting) for 7 crops (mango, oranges, citrus, maize, vegetables, beans and sunflower), increasing crop yields by 9–18%.',
        '• SDG 6 - Clean Water: 2,500+ indigenous trees planted, stabilizing catchment soil and protecting groundwater.',
        '• SDG 7 - Clean Energy: 100% solar-powered IoT micro-grids and low-power telemetry nodes.',
        '• SDG 8 - Decent Work: Fair-trade farmer pricing; 66% women leadership in founding engineering.',
        '• SDG 13 - Climate Action: 3.0 tons CO₂ offset annually; active reforestation in semi-arid Kenya.',
        '• SDG 15 - Life on Land: Varroa mite & Asian hornet early warning, strict zero-pesticide sanctuary baseline.',
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
      doc.text('9. Authentic Media, Field Telemetry & Verification Archive', 14, yPos);
      yPos += 7;

      doc.setFontSize(9.5);
      doc.setTextColor(75, 85, 99);
      const mediaText =
        'BeeYield maintains a strict authentic field photography standard. Our media archive includes acoustic frequency spectrograms trained on 350,000+ bee sound samples, time-lapse anthesis imagery, and live telemetry feeds.';
      const mediaLines = doc.splitTextToSize(mediaText, pageWidth - 28);
      doc.text(mediaLines, 14, yPos);
      yPos += mediaLines.length * 5 + 6;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, yPos, pageWidth - 28, 26, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, yPos, pageWidth - 28, 26, 2, 2, 'S');

      doc.setFontSize(9);
      doc.setTextColor(27, 145, 87);
      doc.text('Official Public Verification Links:', 18, yPos + 6);
      doc.setTextColor(51, 65, 85);
      doc.text('• Field Photo & Video Archive: https://www.beeyield.com/media', 18, yPos + 12);
      doc.text('• Field Agronomy & Blossom Research: https://www.beeyield.com/blogs', 18, yPos + 18);
      doc.text('• Precision Pollination Telemetry: https://www.beeyield.com/pollination-services', 18, yPos + 24);
      yPos += 34;

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Official Impact Certification & Sign-off', 14, yPos);
      yPos += 6;

      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Issued by BeeYield Engineering & Agronomy Directorate • Nairobi & Makueni, Kenya', 14, yPos);
      yPos += 5;
      doc.text('Directors & Lead Farmer: Timothy Nduva (CEO & Lead Farmer) • Agatha Nduva (CTO) • Carole Nduva (COO)', 14, yPos);

      // Page 3 Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('BeeYield Official Impact Record 2026 • Report ID: BY-IMP-2026-X7', 14, pageHeight - 10);
      doc.text('Page 3 of 3', pageWidth - 14, pageHeight - 10, { align: 'right' });

      doc.save('BeeYield-Impact-Report-2026.pdf');
      toast.success('Impact report downloaded (3-page official record)');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const stats = [
    { label: "Sensors in hives", value: "22", icon: Radio, color: "text-[#1B9157]", bg: "bg-green-100" },
    { label: "Acres pollinated", value: "105+", icon: Sprout, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Tons of carbon offset", value: "3", icon: TreePine, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Bees protected", value: "2.4M+", icon: Bug, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Trees planted", value: "2,500+", icon: TreePine, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Data uptime", value: "99.9%", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-100" },
  ];

  return (
    <BeeYieldPageShell className="min-h-screen bg-background p-0">
      <SEO
        title="Ecological & Agricultural Impact | Protecting Bees"
        description="Measurable impact of BeeYield: 2.4M+ bees protected, 105+ acres pollinated with calibrated hives per acre models, 2,500+ trees planted, and sustainable apiary support."
        keywords="protecting bees, bees, apiary, precision pollination, hives per acre model, in hive pollination, in land pollination, ecological impact, sustainable agriculture Kenya"
        url="/impact"
        image="/images/story/apisense-bees-cluster-1.png"
      />
      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION — Real Honeybee Colony on Sensor Background
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden border-b border-neutral-100">
        <StoryHeroBackground />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Globe className="w-3 h-3 mr-2" />
              Our Impact
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
              What We've Done <br /> So Far
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
              22 sensors in hives. Over 105 acres pollinated. 2,500+ trees planted. These numbers come from our own apiaries in Kenya.
            </p>

            <Button size="lg" className="shadow-xl h-14 text-lg" onClick={handleDownloadImpactReport} disabled={downloading}>
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Preparing report...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Impact Report
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. LIVE METRICS GRID (6 Verified Metrics)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Our numbers</h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full">
                  <CardContent className="p-6">
                    <div className={`${stat.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <h3 className="text-3xl font-bold mb-1 text-foreground">{stat.value}</h3>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
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
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              Real Photos
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              See It in the Field
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Photos from our hives in Kenya: the sensors we use, the bees living with them, and the scales that weigh each hive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            
            {/* Slideshow 1: 22 IoT Hardware Deployments */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: IMPACT_IMAGES.deployedHive1,
                  title: "Night Check at the Apiary",
                  subtitle: "Solar sensor on a hive roof",
                  badge: "22 Hives",
                  description: "A solar-powered sensor on a hive, sending readings through the night."
                },
                {
                  image: IMPACT_IMAGES.deployedHive2,
                  title: "Hive on a Stand",
                  subtitle: "Antenna fixed to the hive lid",
                  badge: "105+ Acres",
                  description: "Placed at the edge of a farm to count how many bees are flying."
                },
                {
                  image: IMPACT_IMAGES.solarGateway,
                  title: "Solar Gateway",
                  subtitle: "Sends data to the internet",
                  badge: "Solar Powered",
                  description: "Collects readings from nearby hives and sends them to our app."
                }
              ]}
              badge="Sensors"
              title="22 Hives with Sensors"
              subtitle="Solar sensors on hive stands"
              dark={false}
            />

            {/* Slideshow 2: Colony Health & Biocompatibility */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: IMPACT_IMAGES.apisenseCloseup2,
                  title: "Bees Accept the Sensor",
                  subtitle: "A bee walking on the sensor board",
                  badge: "Bee Safe",
                  description: "Bees walk over the sensor calmly. It doesn't disturb them."
                },
                {
                  image: IMPACT_IMAGES.apisenseCluster1,
                  title: "Bees Around the Sensor",
                  subtitle: "Hundreds of bees on the probe",
                  badge: "Healthy Colony",
                  description: "The colony gathers around the sensor and carries on as normal."
                },
                {
                  image: IMPACT_IMAGES.beeColonyWide,
                  title: "A Strong Colony",
                  subtitle: "A full, busy hive",
                  badge: "2.4M+ Bees",
                  description: "Lots of worker bees and healthy young bees growing in the comb."
                }
              ]}
              badge="Bee Health"
              title="Bees & Sensors"
              subtitle="Bees live happily with our sensors"
              dark={false}
            />

            {/* Slideshow 3: Bio-Telemetry Diagnostics */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: IMPACT_IMAGES.apisenseCloseup1,
                  title: "Sensor in a Log Hive",
                  subtitle: "Fitted inside a traditional hive",
                  badge: "Works in Log Hives",
                  description: "Measures sound and temperature inside traditional Kenyan log hives."
                },
                {
                  image: IMPACT_IMAGES.apisenseCluster2,
                  title: "Bees Covering the Sensor",
                  subtitle: "Worker bees on the sensor",
                  badge: "Normal Behaviour",
                  description: "Bees move freely over the sensor. They don't avoid it."
                },
                {
                  image: IMPACT_IMAGES.combProbe1,
                  title: "Listening to the Hive",
                  subtitle: "Recording hive sounds",
                  badge: "Sound Checks",
                  description: "Hive sounds help us spot stress or a colony getting ready to swarm."
                }
              ]}
              badge="Inside the Hive"
              title="Sensors Inside the Hive"
              subtitle="Sound & temperature"
              dark={false}
            />

            {/* Slideshow 4: Scales, Comb & Disease Detection */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: IMPACT_IMAGES.hiveScale,
                  title: "Hive Scale",
                  subtitle: "A scale under the hive",
                  badge: "Weight",
                  description: "Weighs the hive every day so we can see how much nectar the bees bring in."
                },
                {
                  image: IMPACT_IMAGES.combProbe2,
                  title: "Spotting Disease Early",
                  subtitle: "Checking the comb",
                  badge: "Disease Checks",
                  description: "Helps us catch problems like foulbrood, chalkbrood and Varroa mites early."
                },
                {
                  image: IMPACT_IMAGES.combProbe3,
                  title: "Full Frames",
                  subtitle: "Looking down into a hive",
                  badge: "Strong Hives",
                  description: "Frames full of young bees in hives used to pollinate farms."
                }
              ]}
              badge="Scales & Disease"
              title="Weighing & Disease Checks"
              subtitle="Daily weight & early warnings"
              dark={false}
            />

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. NARRATIVE SECTION (Radical Ecological Transparency)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="aspect-[4/5] bg-muted">
                  <img
                    src={IMPACT_IMAGES.deployedHive2}
                    alt="BeeYield sensor fitted on a traditional Kenyan beehive"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Makueni, Kenya</p>
                  <h4 className="text-xl font-bold text-foreground">22 sensors. 105+ acres.</h4>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div>
                <h2 className="text-4xl font-bold mb-6 text-foreground">
                  Open About Our Numbers
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We do more than make honey. We look after the land around our hives too. We have sensors in 22 hives, we've helped pollinate over 105 acres of farms, and we've planted more than 2,500 native trees.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Healthy habitat around our hives", value: 95 },
                  { label: "Hives kept free of chemicals", value: 100 },
                  { label: "Hives with normal sound levels", value: 88 },
                ].map((m) => (
                  <div key={m.label} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-foreground text-sm">{m.label}</span>
                      <span className="font-bold text-primary">{m.value}%</span>
                    </div>
                    <Progress value={m.value} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 font-medium text-foreground">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Updated live</p>
                  <p className="text-xs text-muted-foreground">Data comes straight from our 22 hive sensors</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      
      {/* ───────────────────────────────────────────────────────────────
          DEDICATED REFORESTATION LINK: PROJECT PANDA MITI
      ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 mb-4 text-sm font-medium opacity-90">
            <TreePine className="h-4 w-4" />
            Tree Planting
          </div>
          <h2 className="text-3xl font-bold mb-6">Panda Miti: 45,000 Trees for Kibwezi</h2>
          <p className="text-lg opacity-90 leading-relaxed mb-8">
            We've planted over 2,500 native trees so far. They cool the land, help hold water in the soil, and give bees flowers to feed on all year.
          </p>
          <Button variant="secondary" asChild className="gap-2 font-bold">
            <Link to="/panda-miti">Learn about Panda Miti <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. 2030 BIOSPHERE ROADMAP
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Our Goals for 2030</h2>
            <p className="text-muted-foreground">
              We want to grow from where we are today and help many more beekeepers and farmers across Africa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { title: "More hives", desc: "Put sensors in 10,000 more beehives.", icon: Bug, bg: "bg-orange-100", color: "text-orange-600" },
              { title: "More trees", desc: "Plant and track 100,000 native trees.", icon: TreePine, bg: "bg-green-100", color: "text-[#1B9157]" },
              { title: "Solar power", desc: "Run all our sensors and equipment on solar power.", icon: Zap, bg: "bg-yellow-100", color: "text-yellow-600" },
              { title: "More beekeepers", desc: "Work with over 200 partner beekeepers in rural areas.", icon: Globe, bg: "bg-blue-100", color: "text-blue-600" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full">
                  <CardContent className="p-6">
                    <div className={`${item.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. IMPACT CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-secondary/30 p-10 md:p-12 rounded-2xl border border-secondary text-center max-w-3xl mx-auto">
            <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-7 w-7 text-[#1B9157]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Help Us Protect Bees</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Whether you buy our honey, farm with us, or study bees, you can be part of this. Get in touch and let's work together.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="shadow-xl gap-2">
                <Link to="/contact">Contact Us <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/global-hive-network">Join Our Beekeeper Network</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </BeeYieldPageShell>
  );
};

export default Impact;
