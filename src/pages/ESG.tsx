import { useState } from "react";
import { Database, TrendingUp, Check, Heart, Sprout, Globe, Wind, Sun, ArrowRight, Quote, Users, Droplets, TreePine, Bug, Package, MapPin, Shield, Leaf, Cpu, Code, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";

import { toast } from "sonner";
import BEEYIELD_LOGO from "@/assets/Logo.png";

const ESG = () => {
  const [downloading, setDownloading] = useState(false);

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
        doc.setTextColor(245, 158, 11);
        doc.text('BeeYield', 50, 25);

        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text('Corporate Social Responsibility Report 2024', 50, 32);
        doc.text('Kibwezi, Makueni County, Kenya', 50, 38);

        // Title
        doc.setFontSize(22);
        doc.setTextColor(31, 41, 55);
        doc.text('Our ESG Commitment', 14, 55);

        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.5);
        doc.line(14, 60, pageWidth - 14, 60);

        let yPos = 75;

        // Intro
        doc.setFontSize(12);
        doc.setTextColor(75, 85, 99);
        const introText = "Environmental, Social, and Governance practices are the foundation of BeeYield. From the semi-arid lands of Kibwezi, we're proving that sustainable beekeeping can transform communities and ecosystems.";
        const introLines = doc.splitTextToSize(introText, pageWidth - 28);
        doc.text(introLines, 14, yPos);
        yPos += introLines.length * 7 + 10;

        // Impact Stats
        doc.setFontSize(16);
        doc.setTextColor(31, 41, 55);
        doc.text('2024 Impact Highlights', 14, yPos);
        yPos += 10;

        doc.setFillColor(249, 250, 251);
        doc.rect(14, yPos - 5, pageWidth - 28, 55, 'F');

        doc.setFontSize(11);
        doc.setTextColor(75, 85, 99);

        const stats = [
          "Partner Beekeepers: 20+ (Local farmers trained)",
          "Acres Pollinated: 25 (Precision coverage)",
          "Trees Planted: 2,500+ (Ecosystem restoration)",
          "Active Colonies: 184 (Managed hives)",
          "Honey Produced: 883kg (Pure traceable honey)",
          "Bees Protected: 2M+ (Pollinators thriving)"
        ];

        stats.forEach(stat => {
          doc.text(`• ${stat}`, 20, yPos + 5);
          yPos += 8;
        });
        yPos += 15;

        // Pillars
        doc.setFontSize(16);
        doc.setTextColor(31, 41, 55);
        doc.text('Our 6 ESG Pillars', 14, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.setTextColor(107, 114, 128); // Gray

        const pillars = [
          "1. Bee Disease Prevention - <15% colony loss rate",
          "2. The 50/50 Harvest Promise - Ethical beekeeping",
          "3. HoneyChain™ Traceability - 100% verified journey",
          "4. Sustainable AgriTech - IoT & AI optimization",
          "5. Sustainable Farming - Zero chemical pesticides",
          "6. Women-Led Tech Leadership - 66% women founders"
        ];

        pillars.forEach(pillar => {
          doc.text(pillar, 14, yPos);
          yPos += 8;
        });

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.text('BeeYield ESG Report - www.beeyield.com', pageWidth / 2, 280, { align: 'center' });
        doc.text('Champions for Saving Bees | 50% Ethical Harvest Promise', pageWidth / 2, 286, { align: 'center' });

        doc.save('BeeYield_ESG_Report_2024.pdf');
        toast.success("Report downloaded successfully");
      } catch (err) {
        console.error("PDF generation failed", err);
        toast.error("Failed to generate report");
      } finally {
        setDownloading(false);
      }
    }, 1000);
  };

  const impactStats = [
    { value: "20+", label: "Partner Beekeepers", icon: Users, description: "Local farmers trained & earning" },
    { value: "25", label: "Acres Pollinated", icon: MapPin, description: "Precision pollination coverage" },
    { value: "2,500+", label: "Trees Planted", icon: TreePine, description: "Ecosystem restoration" },
    { value: "184", label: "Active Colonies", icon: Bug, description: "Managed bee colonies" },
    { value: "883kg", label: "Honey Produced", icon: Package, description: "Pure traceable honey" },
    { value: "2M+", label: "Bees Protected", icon: Heart, description: "Pollinators saved & thriving" },
  ];

  const esgPillars = [
    {
      title: "Bee Disease Prevention",
      icon: Shield,
      color: "from-emerald-500 to-green-600",
      initiatives: [
        "Regular hive health inspections using IoT-enabled monitoring systems",
        "Proactive Varroa mite detection and natural treatment protocols",
        "Hygienic queen breeding programs to strengthen colony immunity",
        "Quarantine protocols for new colonies to prevent disease spread",
        "Training beekeepers on early warning signs of common bee diseases"
      ],
      impact: "Less than 15% colony loss rate vs. 60% global average through preventive care"
    },
    {
      title: "The 50/50 Harvest Promise",
      icon: Heart,
      color: "from-amber-500 to-orange-600",
      initiatives: [
        "We harvest only 50% of honey—bees keep what they need to thrive",
        "Ethical beekeeping that prioritizes colony health over profit",
        "No artificial feeding—bees sustain themselves naturally",
        "Seasonal harvest schedules aligned with bee lifecycles",
        "Stronger, more resilient colonies that survive harsh conditions"
      ],
      impact: "Sustainable beekeeping that ensures long-term colony health and productivity"
    },
    {
      title: "HoneyChain™ Traceability",
      icon: Database,
      color: "from-blue-500 to-indigo-600",
      initiatives: [
        "Blockchain-verified journey from hive to jar for every batch",
        "QR codes on every product linking to harvest origin data",
        "GPS-tagged hive locations with environmental monitoring",
        "Beekeeper profiles and fair payment records on-chain",
        "Consumer transparency dashboard for complete product visibility"
      ],
      impact: "100% of honey batches traceable to specific hive, beekeeper, and harvest date"
    },
    {
      title: "Sustainable AgriTech",
      icon: Cpu,
      color: "from-violet-500 to-purple-600",
      initiatives: [
        "Solar-powered IoT hive monitoring systems for off-grid apiaries",
        "Smart predictive analytics for optimal harvest timing",
        "Real-time temperature and humidity sensors protecting colony health",
        "Mobile app for beekeepers with instant hive health alerts",
        "Carbon-neutral technology operations through renewable energy"
      ],
      impact: "Tech-enabled beekeeping reducing environmental impact while maximizing efficiency"
    },
    {
      title: "Sustainable Farming Practices",
      icon: Leaf,
      color: "from-lime-500 to-green-600",
      initiatives: [
        "2,500+ indigenous trees planted for habitat restoration",
        "Zero chemical pesticides in all partner apiaries",
        "Water source protection and conservation programs",
        "Native pollinator corridor creation across Makueni County",
        "Regenerative agriculture partnerships with local farms"
      ],
      impact: "3,000+ tons CO₂ avoided annually through ecosystem restoration"
    },
    {
      title: "Women-Led Tech Leadership",
      icon: Code,
      color: "from-pink-500 to-rose-600",
      initiatives: [
        "Co-founded by Carole Nduva (Chief Growth Officer) & Agatha Nduva (Chief IT Head)",
        "Women holding key decision-making roles in technology and strategy",
        "Mentorship programs for young women in STEM and agriculture",
        "Championing gender equality in the African tech ecosystem",
        "Driving digital innovation to empower rural women farmers"
      ],
      impact: "Visionary women leaders driving 66% of our founding team's impact"
    }
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5">
              <Globe className="w-4 h-4 mr-2" />
              Corporate Responsibility
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Our <span className="text-primary">ESG</span> Commitment
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Environmental, Social, and Governance practices aren't just corporate buzzwords for us—they're the foundation of everything we do at BeeYield. From the semi-arid lands of Kibwezi, Kenya, we're proving that sustainable beekeeping can transform communities and ecosystems.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2" onClick={handleDownloadReport} disabled={downloading}>
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    Download 2024 Report
                    <Download className="w-4 h-4" />
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/commitment">View SDG Alignment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact in Numbers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real, measurable results from our operations in Makueni County and beyond
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {impactStats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 pb-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm font-medium mb-1">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What ESG Means to Us - NEW EXPANDED SECTION */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">Understanding Our Commitment</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                What ESG Means for BeeYield
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                At BeeYield, ESG isn't a checkbox—it's our DNA. From bee disease prevention to women empowerment, from sustainable agritech to full traceability, these six pillars define how we operate and measure success.
              </p>
            </div>

            {/* ESG Pillars Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {esgPillars.map((pillar, index) => (
                <Card key={index} className="overflow-hidden border-border/50 hover:shadow-xl transition-all">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className={`p-6 bg-gradient-to-br ${pillar.color} text-white`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                          <pillar.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">{pillar.title}</h3>
                      </div>
                      <p className="text-white/90 text-sm font-medium">
                        {pillar.impact}
                      </p>
                    </div>

                    {/* Initiatives */}
                    <div className="p-6 bg-card">
                      <h4 className="font-semibold mb-4 text-foreground text-sm uppercase tracking-wide">Key Initiatives</h4>
                      <ul className="space-y-2">
                        {pillar.initiatives.map((initiative, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{initiative}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Food Security & Hunger Section - WITH PHOTO */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  SDG 2: Zero Hunger
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Fighting Hunger Through Pollination
                </h2>
                <p className="text-muted-foreground mb-6">
                  In Makueni County, where droughts and food insecurity are recurring challenges, our pollination services directly improve crop yields for smallholder farmers. Every acre we pollinate means more food on local tables. Our 50/50 Harvest Promise ensures bees stay healthy and strong to continue this vital work season after season.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-600">75%</span>
                    </div>
                    <div>
                      <div className="font-semibold">Food Crops Need Bees</div>
                      <div className="text-sm text-muted-foreground">Of global food production relies on pollinators</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-600">883</span>
                    </div>
                    <div>
                      <div className="font-semibold">Kilograms of Honey</div>
                      <div className="text-sm text-muted-foreground">Nutritious honey distributed locally & sold</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-600">25</span>
                    </div>
                    <div>
                      <div className="font-semibold">Acres Pollinated</div>
                      <div className="text-sm text-muted-foreground">Mangoes, avocados, macadamia & more</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/pollination-farmers.png"
                    alt="Kenyan farmers benefiting from pollination services in their mango and avocado orchards"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-xl border border-border/50 max-w-xs">
                  <Quote className="w-8 h-8 text-primary/30 mb-2" />
                  <p className="text-sm italic text-muted-foreground mb-2">
                    "Since BeeYield brought their hives to my farm, my mango harvest has doubled. My family eats better now."
                  </p>
                  <p className="text-xs font-medium">— Mary Mutua, Farmer, Kibwezi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Beekeepers Section - UPDATED WITH COMMITMENT METRICS */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Social Impact</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Empowering 20+ Local Beekeepers
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Our partner beekeeper program provides training, equipment, and a guaranteed market for honey. Each beekeeper manages 5-15 hives, creating sustainable income for their families while practicing ethical and traceable beekeeping.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center border-border/50 hover:shadow-lg transition-all">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">&lt;15%</div>
                  <div className="text-sm text-muted-foreground mb-4">Colony Loss Rate</div>
                  <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full inline-block">
                    vs. 60% Global Average
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center border-border/50 hover:shadow-lg transition-all">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">50/50</div>
                  <div className="text-sm text-muted-foreground mb-4">Harvest Promise</div>
                  <div className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full inline-block">
                    Bees Keep Half
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center border-border/50 hover:shadow-lg transition-all">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground mb-4">Full Traceability</div>
                  <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full inline-block">
                    Hive to Jar via HoneyChain™
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Women in Tech Highlight */}
            <div className="mt-12 p-8 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-2xl border border-pink-200/50 dark:border-pink-800/30">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <Code className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-4xl font-bold text-primary">66%</div>
                    <div className="text-sm font-semibold">Women Founders</div>
                  </div>
                </div>
                <div className="max-w-md text-left">
                  <h4 className="font-bold text-lg mb-2">Women Leading in AgriTech</h4>
                  <p className="text-sm text-muted-foreground">
                    BeeYield is proudly co-founded by <strong>Carole Nduva</strong> (Chief Growth Officer) and <strong>Agatha Nduva</strong> (Chief IT Head). Their leadership in business strategy and technology infrastructure proves that women are at the forefront of Africa's digital revolution in agriculture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CEO Quote */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="w-12 h-12 text-primary/30 mx-auto mb-6" />
            <blockquote className="text-xl md:text-2xl italic text-foreground mb-8 leading-relaxed">
              "ESG isn't a report we file once a year—it's how we wake up every morning. Every bee we protect, every farmer we train, every tree we plant is a step toward the Kenya and the Africa we want to see."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">TN</span>
              </div>
              <div className="text-left">
                <div className="font-bold">Timothy Nduva</div>
                <div className="text-sm text-muted-foreground">CEO & Founder, BeeYield</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Partner With Us for Impact
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you're a farmer seeking pollination services, an investor aligned with ESG principles, or a beekeeper looking to join our network—we'd love to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/learn">Start Learning</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ESG;