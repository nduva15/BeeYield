import { useState, useEffect } from "react";
import { apiGet } from "@/services/api";
import { Sprout, Droplets, TreePine, Bug, Download, ArrowRight, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import impactImage from "@/assets/impact-beekeeping.jpg";

interface ImpactStats {
  hive_count?: string | number;
  beekeepers?: string | number;
  total_honey_kg?: string | number;
}

const Impact = () => {
  const [impactStats, setImpactStats] = useState<ImpactStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiGet<ImpactStats>("/stats/impact");
        setImpactStats(data);
      } catch (err: unknown) {
        console.error("Failed to fetch impact stats:", err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: "Beehives Protected", value: impactStats?.hive_count || "2,500+", icon: Bug },
    { label: "Trees Planted", value: "1,500+", icon: TreePine },
    { label: "Beekeepers Trained", value: impactStats?.beekeepers || "500+", icon: Heart },
    { label: "Honey Produced (kg)", value: impactStats?.total_honey_kg || "50,000", icon: Droplets },
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
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/impact-report.pdf';
              link.download = 'BeeYield-Impact-Report.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="mb-12 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="h-5 w-5" />
            Download Our Impact Report
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
                to="/GlobalHiveNetwork"
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
