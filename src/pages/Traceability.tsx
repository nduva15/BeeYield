import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, MapPin, Calendar, Leaf, Info, Heart, Shield, Droplets, Home, Users, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Traceability = () => {
  const [qrCode, setQrCode] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCode.trim()) {
      setShowResults(true);
      toast({
        title: "Code verified!",
        description: "Loading honey information...",
      });
    }
  };

  const mockData = {
    batchId: "PH2024-WF-0342",
    harvestDate: "August 15, 2025",
    location: "BeeYield Kibwezi Apiary, Kenya",
    coordinates: "42.3601° N, 71.0589° W",
    beekeeper: "Timothy Nduva",
    flowerSource: "Acacia, Maize, Mangoes (Mixed)",
    certifications: ["Organic", "Fair Trade", "Non-GMO"],
  };

  const traceabilityFeatures = [
    { icon: Home, label: "Hive Location", description: "Know exactly which hive your honey came from" },
    { icon: Users, label: "Beekeeper", description: "Meet the guardian who nurtured your honey" },
    { icon: Leaf, label: "Flower Source", description: "Discover the blooms that flavored your jar" },
    { icon: Droplets, label: "Water Source", description: "Trace the pure water that sustained the colony" },
    { icon: MapPin, label: "Geographic Origin", description: "GPS coordinates of every harvest" },
    { icon: Calendar, label: "Harvest Date", description: "Know when your honey was collected" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-block rounded-full bg-primary/10 p-4">
              <QrCode className="h-12 w-12 text-primary" />
            </div>
            <h1 className="mb-4 text-5xl font-bold">Honey Traceability</h1>
            <p className="mx-auto text-xl text-muted-foreground">
              Discover the complete journey of your honey from hive to home. Simply enter the code from your jar or scan the QR code.
            </p>
          </div>
        </div>
      </div>
       {/* Trace Your Honey Section */}
      <div className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold">Trace Your Honey</h2>
              <p className="text-muted-foreground">
                Enter the unique code from your jar to discover its complete journey
              </p>
            </div>
            
            <Card className="mb-12 border-none shadow-soft">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="qrCode" className="text-sm font-medium">
                      Enter Traceability Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="qrCode"
                        name="qrCode"
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value)}
                        placeholder="e.g., PH2024-WF-0342"
                        className="flex-1"
                      />
                      <Button type="submit">
                        Trace
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Find the code on the bottom of your honey jar
                    </p>
                  </div>
                </form>

                <div className="mt-6 border-t pt-6">
                  <Button variant="outline" className="w-full" size="lg">
                    <QrCode className="mr-2 h-5 w-5" />
                    Scan QR Code Instead
                  </Button>
                </div>
              </CardContent>
            </Card>

            {showResults && (
              <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <Card className="border-none shadow-soft">
                  <CardContent className="p-8">
                    <h2 className="mb-6 text-2xl font-bold">Honey Information</h2>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-primary/10 p-3">
                          <Info className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Batch ID</h3>
                          <p className="text-muted-foreground">{mockData.batchId}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-secondary/10 p-3">
                          <Calendar className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Harvest Date</h3>
                          <p className="text-muted-foreground">{mockData.harvestDate}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-accent/10 p-3">
                          <MapPin className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Origin</h3>
                          <p className="text-muted-foreground">{mockData.location}</p>
                          <p className="text-sm text-muted-foreground">{mockData.coordinates}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-primary/10 p-3">
                          <Leaf className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Flower Source</h3>
                          <p className="text-muted-foreground">{mockData.flowerSource}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-soft">
                  <CardContent className="p-8">
                    <h3 className="mb-4 font-semibold">Beekeeper</h3>
                    <p className="mb-2 text-lg">{mockData.beekeeper}</p>
                    <p className="text-sm text-muted-foreground">
                      A third-generation beekeeper committed to sustainable practices and bee welfare.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-soft">
                  <CardContent className="p-8">
                    <h3 className="mb-4 font-semibold">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {mockData.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="rounded-full bg-secondary/20 px-4 py-2 text-sm font-medium text-secondary-foreground"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

      {/* Mission Statement - Champions for Bees */}
      <div className="bg-secondary/5 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mb-6 inline-block rounded-full bg-accent/20 p-4">
              <Heart className="h-10 w-10 text-accent" />
            </div>
            <h2 className="mb-6 text-4xl font-bold">Champions for Saving Bees</h2>
            <p className="mb-8 text-xl leading-relaxed text-muted-foreground">
              At BeeYield, we believe that the future of our planet depends on the health of our pollinators. 
              That's why we've made a radical commitment: <span className="font-semibold text-primary">we only harvest 50% of the honey our bees produce</span>. 
              The other half? It stays exactly where it belongs—with the bees who made it.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              While others chase profits, we chase purpose. Our bees aren't just workers; they're partners in a mission 
              to restore balance to our ecosystem. Every jar you purchase directly supports sustainable beekeeping practices 
              and funds our bee conservation initiatives across the region.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-none bg-primary/5 text-center shadow-soft">
              <CardContent className="pt-8 pb-8">
                <div className="mb-4 text-5xl font-bold text-primary">883 kg</div>
                <p className="text-lg font-medium">Pure Traceable Honey</p>
                <p className="mt-2 text-sm text-muted-foreground">Harvested and verified to date</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-secondary/5 text-center shadow-soft">
              <CardContent className="pt-8 pb-8">
                <div className="mb-4 text-5xl font-bold text-secondary">50%</div>
                <p className="text-lg font-medium">Ethical Harvest Rate</p>
                <p className="mt-2 text-sm text-muted-foreground">Half stays with the bees, always</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-accent/5 text-center shadow-soft">
              <CardContent className="pt-8 pb-8">
                <div className="mb-4 text-5xl font-bold text-accent">100%</div>
                <p className="text-lg font-medium">Full Transparency</p>
                <p className="mt-2 text-sm text-muted-foreground">Every drop traceable to source</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Why Traceability Matters */}
      <div className="bg-foreground/5 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <div className="mb-4 inline-block rounded-full bg-primary/10 p-4">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mb-4 text-4xl font-bold">Trust in Every Drop</h2>
              <p className="text-xl text-muted-foreground">
                In a booming honey market flooded with adulterated products, we're setting a new standard for transparency.
              </p>
            </div>
            
            <div className="mb-12 rounded-2xl bg-background p-8 shadow-soft">
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                Did you know that up to <span className="font-semibold text-destructive">70% of honey on supermarket shelves</span> may be 
                adulterated with cheap syrups or mislabeled about its origin? In an industry plagued by fraud, 
                we believe you deserve to know exactly what you're putting on your table.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Our revolutionary traceability system lets you trace every jar back to its source—not just the country 
                or region, but the <span className="font-semibold text-primary">exact hive, the beekeeper who cared for it, 
                the flowers the bees visited, and even the water sources that sustained the colony</span>. 
                This isn't just honey; it's a story you can verify.
              </p>
            </div>

            {/* What We Trace Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {traceabilityFeatures.map((feature) => (
                <div 
                  key={feature.label}
                  className="flex items-start gap-4 rounded-xl bg-background p-4 shadow-soft transition-all hover:shadow-md"
                >
                  <div className="rounded-lg bg-primary/10 p-3">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{feature.label}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The Promise Section */}
      <div className="bg-primary/5 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mb-6 inline-block rounded-full bg-primary/10 p-4">
              <Award className="h-10 w-10 text-primary" />
            </div>
            <h2 className="mb-6 text-4xl font-bold">Our Promise to You</h2>
            <p className="mb-8 text-xl leading-relaxed text-muted-foreground">
              Every jar of BeeYield honey carries more than just sweetness—it carries a story of ethical beekeeping, 
              environmental stewardship, and unwavering commitment to quality. When you choose our honey, you're not 
              just buying a product; you're joining a movement to protect the pollinators that sustain our world.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="rounded-full bg-background px-6 py-3 shadow-soft">
                <span className="font-medium">🐝 Bee-First Philosophy</span>
              </div>
              <div className="rounded-full bg-background px-6 py-3 shadow-soft">
                <span className="font-medium">🌸 Single-Origin Purity</span>
              </div>
              <div className="rounded-full bg-background px-6 py-3 shadow-soft">
                <span className="font-medium">🔍 Complete Transparency</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Video Section */}
      <div className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="mb-4 text-3xl font-bold">See Our Story</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Watch how we're revolutionizing the honey industry with transparency and ethical practices
            </p>
          </div>
          <div className="relative mx-auto max-w-6xl aspect-video">
            <iframe
              className="absolute inset-0 w-full h-full rounded-2xl shadow-soft"
              src="https://www.youtube.com/embed/VIDEO_ID_HERE"
              title="BeeYield Traceability Story"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Traceability;
