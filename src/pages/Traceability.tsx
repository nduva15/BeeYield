import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  QrCode, MapPin, Calendar, Leaf, Info, Heart,
  Shield, Droplets, Home, Users, Award,
  CheckCircle2, Thermometer, CloudRain,
  Activity, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Html5QrcodeScanner } from "html5-qrcode";

const Traceability = () => {
  const [qrCode, setQrCode] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  // Mock data with Timothy Nduva as the only farmer/beekeeper
  const mockData = {
    batchId: "PH2024-WF-0342",
    harvestDate: "August 15, 2025",
    location: "BeeYield Kibwezi Apiary, Kenya",
    coordinates: "42.3601° N, 71.0589° W",
    beekeeper: "Timothy Nduva",
    flowerSource: "Acacia, Maize, Mangoes (Mixed)",
    certifications: ["Organic", "Fair Trade", "Non-GMO"],
    sensorData: {
      temperature: "34.5",
      humidity: "52",
      colonyHealth: "OPTIMAL"
    },
    story: "A third-generation beekeeper committed to sustainable practices and bee welfare. Timothy has been nurturing bees in the Kibwezi region for over 15 years, preserving traditional techniques while embracing modern technology."
  };

  const traceabilityFeatures = [
    { icon: Home, label: "Hive Location", description: "Know exactly which hive your honey came from" },
    { icon: Users, label: "Beekeeper", description: "Meet the guardian who nurtured your honey" },
    { icon: Leaf, label: "Flower Source", description: "Discover the blooms that flavored your jar" },
    { icon: Droplets, label: "Water Source", description: "Trace the pure water that sustained the colony" },
    { icon: MapPin, label: "Geographic Origin", description: "GPS coordinates of every harvest" },
    { icon: Calendar, label: "Harvest Date", description: "Know when your honey was collected" },
  ];

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      const timer = setTimeout(() => {
        scanner = new Html5QrcodeScanner(
          "reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          false
        );

        scanner.render(
          (decodedText) => {
            setQrCode(decodedText);
            setIsScanning(false);
            toast({
              title: "QR Code Scanned",
              description: `Found code: ${decodedText}`,
            });
          },
          (error) => {
            // Ignore scan errors
          }
        );
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scanner) {
          scanner.clear().catch(console.error);
        }
      };
    }
  }, [isScanning, toast]);

  useEffect(() => {
    document.title = "Verified Traceability | BeeYield Blockchain & Sensor Network";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCode.trim()) {
      setIsLoading(true);
      setShowResults(false);

      // Show accessing blockchain toast
      toast({
        title: "Accessing HoneyChain... 🔗",
        description: "Verifying cryptographic records... 🕵️‍♂️",
      });

      // Simulate blockchain verification delay
      setTimeout(() => {
        setShowResults(true);
        setIsLoading(false);
        toast({
          title: "Verified Authenticity! ✅",
          description: "Success! 🐝 Full journey found on the BeeYield Blockchain.",
        });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - GREEN STYLED */}
      <div className="relative overflow-hidden bg-gradient-to-b from-nature-green to-nature-green/80 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.green.200),transparent)] opacity-30" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white/10 shadow-xl shadow-green-900/10 ring-1 ring-green-50/20 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

        <div className="container mx-auto px-6 lg:px-12 text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 px-4 py-1.5 text-xs font-black uppercase tracking-widest">
            Verified Traceability
          </Badge>
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl mb-8">
            From Hive to <span className="text-green-100">Home</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-white/90 leading-relaxed mb-12">
            Every jar of BeeYield honey tells a story. Use your unique batch code to unlock the precise cryptographic journey of your purchase.
          </p>

          <Card className="mx-auto max-w-xl border-none shadow-2xl shadow-green-900/20 overflow-hidden rounded-3xl">
            <CardContent className="p-8 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3 text-left">
                  <label htmlFor="qrCode" className="text-sm font-black uppercase tracking-widest text-neutral-500 ml-1">
                    Enter Batch Code
                  </label>
                  <div className="relative group">
                    <Input
                      id="qrCode"
                      name="qrCode"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      placeholder="e.g. PH2024-WF-0342"
                      className="h-16 px-6 rounded-2xl border-2 border-neutral-100 group-hover:border-nature-green/50 focus:border-nature-green transition-all text-lg font-bold placeholder:text-neutral-300"
                    />
                    <div className="absolute right-2 top-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsScanning(true)}
                        className="h-12 w-12 rounded-xl hover:bg-nature-green/10 hover:text-nature-green"
                      >
                        <QrCode className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !qrCode.trim()}
                  className="w-full h-16 rounded-2xl bg-nature-green hover:bg-nature-green/90 text-white font-black text-lg transition-all shadow-xl shadow-nature-green/20"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" /> VERIFYING...
                    </span>
                  ) : (
                    "UNLOCK JOURNEY"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Scanner Dialog */}
      <Dialog open={isScanning} onOpenChange={setIsScanning}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Point your camera at the QR code on the bottom of the honey jar.
            </DialogDescription>
          </DialogHeader>
          <div id="reader" className="overflow-hidden rounded-2xl bg-neutral-100 min-h-[300px]" />
          <Button variant="outline" onClick={() => setIsScanning(false)} className="rounded-xl">
            Cancel
          </Button>
        </DialogContent>
      </Dialog>

      {/* Results Section */}
      {showResults && (
        <div className="container mx-auto px-6 py-20 lg:px-12 max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="grid lg:grid-cols-3 gap-12">

            {/* Left Column: Core Data */}
            <div className="lg:col-span-2 space-y-12">

              {/* Product Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-neutral-200 pb-12">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-nature-green text-white border-none px-3 py-1 gap-1.5 font-bold">
                      <Shield className="h-3.5 w-3.5" /> CRYPTO-VERIFIED
                    </Badge>
                    <span className="text-sm font-black text-neutral-400 uppercase tracking-widest">BATCH ID: {mockData.batchId}</span>
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-black text-neutral-900 leading-tight">
                    Pure Wildflower Honey
                  </h2>
                </div>
                <div className="bg-nature-green/10 p-6 rounded-3xl border border-nature-green/20 text-center">
                  <p className="text-xs font-black text-nature-green uppercase tracking-widest mb-1">Impact Score</p>
                  <p className="text-4xl font-black text-nature-green">98%</p>
                </div>
              </div>

              {/* Sensor Grid */}
              <div className="grid sm:grid-cols-3 gap-6">
                <Card className="rounded-3xl border-none shadow-sm bg-blue-50/50 p-8">
                  <div className="rounded-2xl bg-white w-12 h-12 flex items-center justify-center mb-6 shadow-sm">
                    <Thermometer className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Nest Temp</p>
                  <p className="text-3xl font-black text-neutral-900">{mockData.sensorData.temperature}°C</p>
                </Card>

                <Card className="rounded-3xl border-none shadow-sm bg-cyan-50/50 p-8">
                  <div className="rounded-2xl bg-white w-12 h-12 flex items-center justify-center mb-6 shadow-sm">
                    <Droplets className="h-6 w-6 text-cyan-600" />
                  </div>
                  <p className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-1">Humidity</p>
                  <p className="text-3xl font-black text-neutral-900">{mockData.sensorData.humidity}%</p>
                </Card>

                <Card className="rounded-3xl border-none shadow-sm bg-nature-green/5 p-8">
                  <div className="rounded-2xl bg-white w-12 h-12 flex items-center justify-center mb-6 shadow-sm">
                    <Activity className="h-6 w-6 text-nature-green" />
                  </div>
                  <p className="text-xs font-black text-nature-green uppercase tracking-widest mb-1">Colony Health</p>
                  <p className="text-3xl font-black text-neutral-900">{mockData.sensorData.colonyHealth}</p>
                </Card>
              </div>

              {/* Honey Information Details */}
              <Card className="border-none shadow-soft rounded-3xl">
                <CardContent className="p-8">
                  <h2 className="mb-6 text-2xl font-bold">Honey Information</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-nature-green/10 p-3">
                        <Info className="h-5 w-5 text-nature-green" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Batch ID</h3>
                        <p className="text-muted-foreground">{mockData.batchId}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-nature-green/10 p-3">
                        <Calendar className="h-5 w-5 text-nature-green" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Harvest Date</h3>
                        <p className="text-muted-foreground">{mockData.harvestDate}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-nature-green/10 p-3">
                        <MapPin className="h-5 w-5 text-nature-green" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Origin</h3>
                        <p className="text-muted-foreground">{mockData.location}</p>
                        <p className="text-sm text-muted-foreground">{mockData.coordinates}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-nature-green/10 p-3">
                        <Leaf className="h-5 w-5 text-nature-green" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Flower Source</h3>
                        <p className="text-muted-foreground">{mockData.flowerSource}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Farmer & Environment */}
            <div className="space-y-8">
              {/* Timothy Nduva Beekeeper Card */}
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-neutral-900 text-white overflow-hidden p-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 p-4">
                    <Users className="h-full w-full text-nature-green" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black">{mockData.beekeeper}</h4>
                    <p className="text-nature-green font-bold text-sm">Master Beekeeper</p>
                  </div>
                </div>
                <p className="text-neutral-400 italic leading-relaxed mb-8">
                  "{mockData.story}"
                </p>
                <div className="space-y-4 pt-8 border-t border-white/10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500 font-bold uppercase tracking-widest">Location</span>
                    <span className="font-bold">Kibwezi, Kenya</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500 font-bold uppercase tracking-widest">Since</span>
                    <span className="font-bold">2010</span>
                  </div>
                </div>
              </Card>

              {/* Certifications */}
              <Card className="border-none shadow-soft rounded-3xl">
                <CardContent className="p-8">
                  <h3 className="mb-4 font-semibold">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockData.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="rounded-full bg-nature-green/20 px-4 py-2 text-sm font-medium text-nature-green"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Impact Card */}
              <Card className="rounded-[2.5rem] bg-nature-green p-10 text-white border-none shadow-xl shadow-nature-green/20">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="h-6 w-6 text-white" />
                  <h4 className="text-xl font-black">Community Impact</h4>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/20 pb-4">
                    <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Farmer Pay</span>
                    <span className="text-2xl font-black">Fair Trade</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/20 pb-4">
                    <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Trees Supported</span>
                    <span className="text-2xl font-black">2,500+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Ethical Harvest</span>
                    <span className="text-2xl font-black">50% Left</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Mission Statement - Champions for Bees */}
      <div className="bg-nature-green/5 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mb-6 inline-block rounded-full bg-nature-green/20 p-4">
              <Heart className="h-10 w-10 text-nature-green" />
            </div>
            <h2 className="mb-6 text-4xl font-bold">Champions for Saving Bees</h2>
            <p className="mb-8 text-xl leading-relaxed text-muted-foreground">
              At BeeYield, we believe that the future of our planet depends on the health of our pollinators.
              That's why we've made a radical commitment: <span className="font-semibold text-nature-green">we only harvest 50% of the honey our bees produce</span>.
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
            <Card className="border-none bg-nature-green/5 text-center shadow-soft">
              <CardContent className="pt-8 pb-8">
                <div className="mb-4 text-5xl font-bold text-nature-green">883 kg</div>
                <p className="text-lg font-medium">Pure Traceable Honey</p>
                <p className="mt-2 text-sm text-muted-foreground">Harvested and verified to date</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-nature-green/5 text-center shadow-soft">
              <CardContent className="pt-8 pb-8">
                <div className="mb-4 text-5xl font-bold text-nature-green">50%</div>
                <p className="text-lg font-medium">Ethical Harvest Rate</p>
                <p className="mt-2 text-sm text-muted-foreground">Half stays with the bees, always</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-nature-green/5 text-center shadow-soft">
              <CardContent className="pt-8 pb-8">
                <div className="mb-4 text-5xl font-bold text-nature-green">100%</div>
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
              <div className="mb-4 inline-block rounded-full bg-nature-green/10 p-4">
                <Shield className="h-10 w-10 text-nature-green" />
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
                or region, but the <span className="font-semibold text-nature-green">exact hive, the beekeeper who cared for it,
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
                  <div className="rounded-lg bg-nature-green/10 p-3">
                    <feature.icon className="h-5 w-5 text-nature-green" />
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
      <div className="bg-nature-green/5 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mb-6 inline-block rounded-full bg-nature-green/10 p-4">
              <Award className="h-10 w-10 text-nature-green" />
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

      {/* Education/Mission - Data Philosophy */}
      {!showResults && (
        <div className="py-24 sm:py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-sm font-black text-nature-green uppercase tracking-widest mb-8">Our Data Philosophy</h2>
            <p className="mx-auto max-w-4xl text-2xl sm:text-4xl font-black text-neutral-900 leading-tight">
              "We believe radical transparency is the only cure for a market flooded with counterfeit honey. Trust is built on every frame."
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Traceability;
