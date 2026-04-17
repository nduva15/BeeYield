import { useState, useEffect } from "react";
import { Heart, Globe, Quote, Users, TreePine, Bug, Package, MapPin, Cpu, Code, Loader2, Download, ShieldCheck, Scale } from "lucide-react";
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
      color: "bg-muted/40 border-border",
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
      color: "bg-muted/40 border-border",
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
      color: "bg-muted/40 border-border",
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
      color: "bg-muted/40 border-border",
      initiatives: [
        "Co-Founded by Agatha Nduva (IT Architecture) & Carole Nduva (Growth)",
        "Diversity-first engineering and strategic leadership teams",
        "Mentorship programs for women in digital agriculture and advanced intelligence",
        "Strategic focus on inclusive economic growth in Kibwezi",
        "Leadership in Africa's emerging high-tech ag-ecosystem"
      ],
      impact: "Diversity-driven innovation accelerating project dev-cycles by 30%"
    }
  ];

  return (
    <BeeYieldPageShell className="min-h-screen bg-background text-foreground p-0">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-amber-500/10 via-background to-background overflow-hidden">
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-primary text-primary-foreground hover:bg-primary/90">
              <Globe className="w-3 h-3 mr-2" />
              ESG overview
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Governance <br /><span className="text-primary">by Integrity.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              BeeYield focuses on measurable impact: healthier hives, better pollination, and traceable harvests.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2" onClick={handleDownloadReport} disabled={downloading}>
                {downloading ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Download className="w-5 h-5 mr-3" />}
                {downloading ? "Downloading…" : "Download 2026 ESG report"}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/commitment">Vision & Purpose</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      </section>

      {/* Impact Metrics */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {impactStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="text-center p-6 rounded-2xl bg-background border border-border shadow-sm group hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-muted-foreground mb-1">{stat.label}</div>
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
                  <Card className={`overflow-hidden border h-full rounded-3xl ${pillar.color} shadow-lg hover:shadow-xl transition-shadow`}>
                    <CardContent className="p-10 flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center border border-border shadow-sm">
                          <pillar.icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground tracking-tight">{pillar.title}</h3>
                      </div>

                      <div className="space-y-4 mb-10 flex-1">
                        {pillar.initiatives.map((initiative, i) => (
                          <div key={i} className="flex items-start gap-4">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-sm text-muted-foreground font-medium leading-relaxed">{initiative}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-8 border-t border-border">
                        <p className="text-sm font-semibold text-primary mb-2">Measured impact</p>
                        <p className="text-lg font-bold text-foreground leading-tight">
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
      <section className="py-24 bg-muted/20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <Badge variant="outline" className="mb-6 border-primary/40 text-primary font-semibold text-sm">
                Strategic Focus: SDG 2
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Data-Driven <br />Food Security.</h2>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-xl">
                In semi-arid Makueni, pollination isn't just a service?it's survival. We deploy monitored hives to support mango and avocado smallholders during flowering and document what happens in the field.
              </p>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-primary">25+</p>
                  <p className="text-sm font-semibold text-muted-foreground">Acres supported</p>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-primary">100%</p>
                  <p className="text-sm font-semibold text-muted-foreground">Pesticide-free baseline</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-[3rem] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-border">
                <img src="/pollination-farmers.png" alt="Participatory Ag" className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-10 left-10 right-10">
                  <Quote className="w-10 h-10 text-primary mb-4 opacity-70" />
                  <p className="text-xl font-medium italic text-slate-100 mb-4">
                    "Through precision pollination, we're not just harvesting honey?we're creating local abundance."
                  </p>
                  <p className="text-sm font-semibold text-primary-foreground">Timothy Nduva, CEO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner/Trust Footprint */}
      <section className="py-24 bg-background border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Verified by Design.</h3>
            <p className="text-muted-foreground text-lg font-medium">
              Every jar tracked. Every hive monitored. Every community supported. Partner with us to improve traceability and pollinator health.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <Link to="/contact" className="px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-xl hover:bg-primary/90 transition-all">
                Partner Engagement
              </Link>
              <Link to="/media" className="px-10 py-5 bg-background text-foreground border border-border rounded-2xl font-semibold hover:bg-muted transition-all">
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
