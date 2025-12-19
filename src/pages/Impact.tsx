import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sprout, Droplets, TreePine, Bug, Download, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import impactImage from "@/assets/impact-beekeeping.jpg";

const Impact = () => {
  const stats = [
    { label: "Beehives Protected", value: "150+", icon: Bug },
    { label: "Trees Planted", value: "2500+", icon: TreePine },
    { label: "Bees Saved (Colonies)", value: "2M+", icon: Droplets },
    { label: "Carbon Offset (Tons)", value: "2+", icon: Sprout },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold">Our Environmental Impact</h1>
          <p className="mb-12 text-xl text-muted-foreground">
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

        <div className="mb-16">
          <img
            src={impactImage}
            alt="Sustainable beekeeping"
            className="h-[400px] w-full rounded-lg object-cover shadow-glow"
          />
        </div>

        <div className="mb-20 grid gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-none shadow-soft">
              <CardContent className="pt-6 text-center">
                <div className="mb-4 inline-block rounded-lg bg-secondary/10 p-4">
                  <stat.icon className="h-8 w-8 text-secondary" />
                </div>
                <div className="mb-2 text-3xl font-bold text-primary">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto max-w-4xl space-y-12">
          <Card className="border-none shadow-soft">
            <CardContent className="p-8">
              <h2 className="mb-6 text-3xl font-bold">Pollinator Protection</h2>
              <p className="mb-4 text-muted-foreground">
                We're committed to protecting bee populations through sustainable beekeeping practices and habitat conservation.
              </p>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Habitat Conservation</span>
                    <span className="font-semibold text-primary">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Chemical-Free Practices</span>
                    <span className="font-semibold text-primary">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Native Plant Restoration</span>
                    <span className="font-semibold text-primary">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
              </div>
              <Link to="/Commitment" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Read More <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft">
            <CardContent className="p-8">
              <h2 className="mb-6 text-3xl font-bold">Community Impact</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Beyond environmental conservation, BeeYield is dedicated to supporting local beekeeping communities. We provide fair compensation, training, and resources to help our partner beekeepers thrive.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 text-primary">•</span>
                    <span>Fair trade pricing ensuring sustainable livelihoods</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 text-primary">•</span>
                    <span>Educational programs for new beekeepers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 text-primary">•</span>
                    <span>Equipment grants for sustainable practices</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 text-primary">•</span>
                    <span>Support for bee health research initiatives</span>
                  </li>
                </ul>
              </div>
              <Link to="/esg" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Read More <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-soft">
            <CardContent className="p-8">
              <h2 className="mb-4 text-3xl font-bold">Our 2030 Goals</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Protect 10,000 additional beehives</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Plant 10,000 native flowering plants</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Achieve carbon-neutral operations</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1">✓</span>
                  <span>Expand to 200+ partner beekeepers</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Impact;
