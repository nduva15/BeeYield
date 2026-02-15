import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sprout, Droplets, TreePine, Bug, Download, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import impactImage from "@/assets/impact-beekeeping.jpg";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import BEEYIELD_LOGO from "@/assets/Logo.png";
import { beeyieldService } from "@/services/beeyieldService";
import { useState, useEffect } from "react";

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
      doc.setTextColor(245, 158, 11);
      doc.text('BeeYield', 50, 25);

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text('Environmental Impact Report 2024', 50, 32);
      doc.text('Kibwezi, Makueni County, Kenya', 50, 38);

      // Title
      doc.setFontSize(22);
      doc.setTextColor(31, 41, 55);
      doc.text('Our Environmental Impact', 14, 55);

      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.5);
      doc.line(14, 60, pageWidth - 14, 60);

      // Executive Summary
      let yPos = 75;
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Executive Summary', 14, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      const summaryText = 'Every jar of BeeYield honey contributes to a healthier planet and thriving bee populations. Through our sustainable beekeeping practices in Kenya\'s semi-arid Makueni County, we are creating measurable environmental and social impact.';
      const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 28);
      doc.text(summaryLines, 14, yPos);
      yPos += summaryLines.length * 7 + 10;

      // Key Statistics
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Key Impact Statistics', 14, yPos);
      yPos += 10;

      doc.setFillColor(249, 250, 251);
      doc.rect(14, yPos - 5, pageWidth - 28, 40, 'F');

      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      doc.text('• Beehives Protected: 184', 20, yPos + 5);
      doc.text('• Trees Planted: 2,500+', 20, yPos + 15);
      doc.text('• Bee Colonies Saved: 2M+', 20, yPos + 25);
      doc.text('• Carbon Offset: 2+ tons annually', 20, yPos + 35);
      yPos += 55;

      // Conservation Progress
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Pollinator Protection Progress', 14, yPos);
      yPos += 12;

      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text('Habitat Conservation: 95%', 14, yPos);
      yPos += 8;
      doc.text('Chemical-Free Practices: 100%', 14, yPos);
      yPos += 8;
      doc.text('Native Plant Restoration: 88%', 14, yPos);
      yPos += 15;

      // 50/50 Promise
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('The 50/50 Harvest Promise', 14, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      const promiseText = 'We only harvest 50% of the honey our bees produce. The other half stays with the bees, ensuring their health and survival through harsh seasons.';
      const promiseLines = doc.splitTextToSize(promiseText, pageWidth - 28);
      doc.text(promiseLines, 14, yPos);
      yPos += promiseLines.length * 7 + 15;

      // 2030 Goals
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Our 2030 Goals', 14, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(16, 185, 129);
      doc.text('✓ Protect 10,000 additional beehives', 14, yPos); yPos += 7;
      doc.text('✓ Plant 10,000 native flowering plants', 14, yPos); yPos += 7;
      doc.text('✓ Achieve carbon-neutral operations', 14, yPos); yPos += 7;
      doc.text('✓ Expand to 200+ partner beekeepers', 14, yPos);

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text('BeeYield Impact Report - www.beeyield.com', pageWidth / 2, 280, { align: 'center' });
      doc.text('Champions for Saving Bees | 50% Ethical Harvest Promise', pageWidth / 2, 286, { align: 'center' });

      doc.save('BeeYield-Impact-Report-2024.pdf');
      toast.success('Impact Report downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate Impact Report');
    } finally {
      setDownloading(false);
    }
  };

  const stats = [
    { label: "Beehives Protected", value: liveStats?.hive_count || "184", icon: Bug },
    { label: "Trees Planted", value: "2,500+", icon: TreePine },
    { label: "Bees Saved (Colonies)", value: "2M+", icon: Droplets },
    { label: "Carbon Offset (Tons)", value: "2+", icon: Sprout },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
            Our Environmental Impact
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Every jar of BeeYield contributes to a healthier planet and thriving bee populations.
          </p>
          <button
            onClick={handleDownloadImpactReport}
            disabled={downloading}
            className="mb-12 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Download Our Impact Report
              </>
            )}
          </button>
        </div>

        <div className="relative mb-16 overflow-hidden rounded-2xl">
          <img src={impactImage} alt="Impact" className="h-[400px] w-full object-cover" />
        </div>

        <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-3xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <h3 className="mb-4 text-xl font-semibold text-foreground">Pollinator Protection</h3>
              <p className="mb-6 text-muted-foreground">
                We're committed to protecting bee populations through sustainable beekeeping practices and habitat conservation.
              </p>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-foreground">Habitat Conservation</span>
                    <span className="text-primary">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-foreground">Chemical-Free Practices</span>
                    <span className="text-primary">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-foreground">Native Plant Restoration</span>
                    <span className="text-primary">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
              </div>
              <Link to="/commitment" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline">
                Read More <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <h3 className="mb-4 text-xl font-semibold text-foreground">Community Impact</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Beyond environmental conservation, BeeYield is dedicated to supporting local beekeeping communities. We provide fair compensation, training, and resources to help our partner beekeepers thrive.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Fair trade pricing ensuring sustainable livelihoods
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Educational programs for new beekeepers
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Equipment grants for sustainable practices
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Support for bee health research initiatives
                  </li>
                </ul>
              </div>
              <Link to="/commitment" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline">
                Read More <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground lg:col-span-1">
            <CardContent className="p-6">
              <h3 className="mb-4 text-xl font-semibold">Our 2030 Goals</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  Protect 10,000 additional beehives
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  Plant 10,000 native flowering plants
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  Achieve carbon-neutral operations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  Expand to 200+ partner beekeepers
                </li>
              </ul>
              <Link
                to="/global-hive-network"
                className="mt-6 inline-flex items-center gap-2 bg-primary-foreground text-primary px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Join Our Global Hive Network <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Impact;
