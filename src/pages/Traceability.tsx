import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  QrCode, MapPin, Calendar, Leaf, Info, Heart,
  Shield, Droplets, Home, Users, Award,
  CheckCircle2, Thermometer, CloudRain,
  Activity, Zap, Box, Factory, Package, Cpu, Loader2, Bug, Sprout, Smartphone, Database, TreePine
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { traceBatch, TraceResponse, TraceJourneyStep } from "@/services/traceabilityService";
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
  const [batchData, setBatchData] = useState<TraceResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      // Small timeout to ensure DOM is ready inside Dialog
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
            // Optional: Auto-submit or just let user click
            // handleSubmit(new Event('submit') as any); // Might be safer to just fill it
            toast({
              title: "QR Code Scanned",
              description: `Found code: ${decodedText}`,
            });
          },
          (error) => {
            // console.warn(error); // Ignore scan errors as they happen every frame
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
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Trace your honey jar back to the exact hive using BeeYield Blockchain. Verified by ApiSense acoustic nodes and Intelligent Hives precision sensors.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCode.trim()) {
      setIsLoading(true);
      setShowResults(false);
      try {
        toast({
          title: "Accessing HoneyChain... 🔗",
          description: "Verifying cryptographic records... 🕵️‍♂️",
        });

        const data = await traceBatch(qrCode);

        if (data) {
          setBatchData(data);
          setShowResults(true);
          toast({
            title: "Verified Authenticity! ✅",
            description: "Success! 🐝 Full journey found on the BeeYield Blockchain.",
          });
        } else {
          toast({
            title: "Code Not Found 🚫",
            description: "Oops! 🙈 We couldn't find this batch on the blockchain. Please check the code.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error(err);
        toast({
          title: "System Busy",
          description: "Could not connect to the blockchain network.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Jar": return <Package className="h-6 w-6" />;
      case "Factory": return <Factory className="h-6 w-6" />;
      case "Basket": return <Box className="h-6 w-6" />;
      case "Hexagon": return <Zap className="h-6 w-6" />;
      case "MapPin": return <MapPin className="h-6 w-6" />;
      case "Shield": return <Shield className="h-6 w-6 text-emerald-600" />;
      default: return <Activity className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24 sm:py-32">
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/10 px-6 py-2 text-primary font-black uppercase tracking-widest backdrop-blur-md">
              <Shield className="mr-3 h-4 w-4" />
              Powered by HoneyChain™ Blockchain
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
              Authenticity <br /><span className="text-primary italic">You Can Trace</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Every drop of BeeYield honey tells a unique story of sustainable beekeeping, verified through our immutable sensor network.
            </p>

            <Card className="mx-auto max-w-2xl border-none glass-dark sm:glass shadow-premium rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <QrCode className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-primary" />
                    <Input
                      id="qrCode"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      placeholder="Enter Batch ID (e.g. DEMO-001)"
                      className="h-16 border-none bg-background/50 pl-14 text-lg font-bold focus-visible:ring-primary shadow-inner rounded-2xl placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={isLoading} className="h-16 px-10 text-lg font-black shadow-glow rounded-2xl">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Verify Identity"}
                  </Button>
                </form>
                <div className="mt-6 flex items-center justify-between px-2 text-xs font-black uppercase tracking-widest text-muted-foreground/70">
                  <span>Code found on your jar label</span>
                  <button
                    type="button"
                    onClick={() => setIsScanning(true)}
                    className="flex items-center text-primary hover:text-honey-dark transition-colors"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan QR Code
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      {/* How it Works Section - Shown before results or when no search is active */}
      {!showResults && (
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">How <span className="text-primary italic">HoneyChain™</span> Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">Our proprietary physical-to-digital link ensures every jar is authentic and ethically sourced.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Cpu, title: "Precision IoT", desc: "Sensors at the apiary record weight, temp, and acoustics 24/7." },
              { icon: Database, title: "Blockchain Log", desc: "Data is hashed and committed to our immutable HoneyChain." },
              { icon: Shield, title: "Physical Shield", desc: "Tamper-proof labels with unique encrypted IDs on every jar." },
              { icon: Smartphone, title: "Instant Verify", desc: "Scan or enter the ID to verify the entire journey instantly." }
            ].map((step, i) => (
              <div key={i} className="relative p-8 rounded-[2.5rem] bg-muted/20 border border-border/50 group hover:bg-white hover:shadow-premium transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
                <div className="absolute top-4 right-4 text-4xl font-black opacity-10">0{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[95vh] lg:h-[90vh] overflow-y-auto rounded-[2rem] lg:rounded-[3rem] p-0 border-none bg-background shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Honey Journey: {batchData?.product_name}</DialogTitle>
            <DialogDescription>Full traceability records from the BeeYield blockchain.</DialogDescription>
          </DialogHeader>

          {batchData && (
            <div className="p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Product & Journey */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Product Card */}
                  <Card className="overflow-hidden border-none shadow-premium bg-white dark:bg-card rounded-[3rem]">
                    <div className="bg-primary/5 p-10 border-b border-primary/10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                          <h2 className="text-4xl font-black text-foreground tracking-tightest">{batchData.product_name}</h2>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="font-mono text-sm text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg">ID: {batchData.batch_code}</span>
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Certified Premium</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-nature-green/10 border border-nature-green/20 px-6 py-3 text-nature-green shadow-glow shadow-nature-green/20">
                          <CheckCircle2 className="h-6 w-6" />
                          <span className="text-sm font-black uppercase tracking-widest">HoneyChain Verified</span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-10">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nature-green opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-nature-green"></span>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-nature-green">Live Sensor Feed Active</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="p-6 rounded-3xl bg-muted/20 border border-border/50 group/sensor hover:bg-primary/5 transition-colors">
                          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center mb-3">
                            <Thermometer className="mr-2 h-4 w-4 text-primary" /> Temp
                          </p>
                          <p className="text-4xl font-black tracking-tightest text-foreground">
                            {batchData.sensor_snapshot?.avg_temp || "34.2"}°C
                          </p>
                        </div>
                        <div className="p-6 rounded-3xl bg-muted/20 border border-border/50 group/sensor hover:bg-primary/5 transition-colors">
                          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center mb-3">
                            <Droplets className="mr-2 h-4 w-4 text-primary" /> Humidity
                          </p>
                          <p className="text-4xl font-black tracking-tightest text-foreground">
                            {batchData.sensor_snapshot?.avg_humidity || "52"}%
                          </p>
                        </div>
                        <div className="p-6 rounded-3xl bg-muted/20 border border-border/50 group/sensor hover:bg-primary/5 transition-colors">
                          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center mb-3">
                            <Leaf className="mr-2 h-4 w-4 text-primary" /> Purity
                          </p>
                          <p className="text-4xl font-black tracking-tightest text-foreground">100% Raw</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-muted/20 border border-border/50 group/sensor hover:bg-primary/5 transition-colors">
                          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center mb-3">
                            <Users className="mr-2 h-4 w-4 text-primary" /> Fair Pay
                          </p>
                          <p className="text-2xl font-black text-nature-green tracking-tight uppercase">Verified</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Honey Story Section */}
                  {batchData.story_content && (
                    <Card className="border-none shadow-premium bg-gradient-to-br from-primary/5 to-background rounded-[3rem] overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Award className="h-40 w-40" />
                      </div>
                      <CardContent className="p-10 space-y-8 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-glow">
                            <Heart className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-black tracking-tight">{batchData.story_title || "The Story of Your Honey"}</h3>
                            <p className="text-primary font-black uppercase tracking-widest text-[10px]">Batch Impact & Provenance</p>
                          </div>
                        </div>

                        <div className="prose prose-lg prose-honey dark:prose-invert max-w-none">
                          <p className="text-xl leading-relaxed text-muted-foreground font-medium italic">
                            "{batchData.story_content}"
                          </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 pt-10 border-t border-primary/10">
                          {[
                            { label: "Community", value: batchData.impact_stats?.beekeepers || "1 Master Beekeeper", icon: Users },
                            { label: "Environment", value: batchData.impact_stats?.acres_pollinated || "25+ Acres", icon: Sprout },
                            { label: "Reforestation", value: "2,500+ Trees", icon: TreePine },
                            { label: "Water", value: "Spring Source", icon: Droplets },
                            { label: "Biodiversity", value: "1 Site", icon: Bug },
                            { label: "Purity Index", value: "99.8%", icon: Shield }
                          ].map((item, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex items-center gap-2 text-primary/70">
                                <item.icon className="h-3 w-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                              </div>
                              <p className="text-xl font-black text-foreground tracking-tight">{String(item.value)}</p>
                            </div>
                          ))}
                        </div>

                        {batchData.impact_stats && Object.keys(batchData.impact_stats).length > 4 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 pt-6 border-t border-border/10">
                            {Object.entries(batchData.impact_stats).slice(4).map(([key, value]) => (
                              <div key={key}>
                                <p className="text-xl font-black text-primary tracking-tight">{String(value)}</p>
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{key.replace(/_/g, ' ')}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Journey Timeline */}
                  <h3 className="text-4xl font-black flex items-center gap-4 tracking-tightest">
                    <Activity className="h-10 w-10 text-primary" />
                    Immutable Journey
                  </h3>
                  <div className="relative space-y-8 pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-muted">
                    {batchData.timeline.map((step, idx) => (
                      <div key={idx} className="relative transition-all hover:translate-x-1">
                        <div className={`absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ${idx === 0 ? 'ring-primary' : 'ring-muted shadow-sm'}`}>
                          {idx === 0 ? <Package className="h-3 w-3 text-primary" /> : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />}
                        </div>
                        <Card className="border-none shadow-soft hover:shadow-premium transition-all duration-500 rounded-3xl overflow-hidden">
                          <CardContent className="p-8">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                              <h4 className="font-black text-2xl tracking-tight">{step.title}</h4>
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">{step.date}</span>
                            </div>
                            <div className="flex items-start gap-6">
                              <div className="rounded-2xl bg-primary/10 p-4 text-primary shadow-inner">
                                {getIcon(step.icon)}
                              </div>
                              <div className="space-y-3">
                                <p className="text-xs font-black uppercase tracking-widest text-primary/70 flex items-center">
                                  <MapPin className="mr-2 h-4 w-4" /> {step.location}
                                </p>
                                <p className="text-base font-medium leading-relaxed text-muted-foreground">{step.description}</p>
                                {step.hash && (
                                  <div className="mt-6 pt-4 border-t border-border/50">
                                    <p className="font-mono text-[9px] text-muted-foreground bg-muted/20 p-3 rounded-xl truncate max-w-full">
                                      HONEYCHAIN BLOCK HASH: {step.hash}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Entities & Details */}
                <div className="space-y-8">
                  {/* Farmer Card */}
                  {batchData.farmer && (
                    <Card className="border-none shadow-premium overflow-hidden bg-white group">
                      <div className="aspect-square w-full bg-muted relative">
                        <img
                          src="https://images.unsplash.com/photo-1508500350118-afbd8ce5d494?w=800&auto=format&fit=crop&q=80"
                          alt="Timothy Nduva"
                          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 text-white">
                          <h3 className="text-2xl font-bold">{batchData.farmer.name}</h3>
                          <p className="text-sm text-white/80">{batchData.farmer.experience_years}+ Years Experience</p>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">The Beekeeper</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground italic mb-4">
                          "{batchData.farmer.story}"
                        </p>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <Heart className="h-4 w-4 text-accent" />
                          <span>Empowering local farmers in {batchData.farmer.region}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Origin Map Section */}
                  <Card className="border-none shadow-soft overflow-hidden bg-white">
                    <div className="p-6 border-b border-muted/50">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Origin Location</h4>
                    </div>
                    <div className="aspect-video relative bg-muted/20 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80"
                        alt="Map"
                        className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping" />
                          <div className="relative bg-primary p-3 rounded-full text-white shadow-glow">
                            <MapPin className="h-6 w-6" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-white/20 shadow-lg">
                        <p className="text-xs font-bold text-foreground truncate">{batchData.apiary?.region || "Kibwezi"}, Kenya</p>
                        <p className="text-[10px] text-muted-foreground">Lat: {batchData.apiary?.latitude || "-2.41"}, Long: {batchData.apiary?.longitude || "37.96"}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Apiary Details */}
                  {batchData.apiary && (
                    <Card className="border-none shadow-soft bg-white">
                      <CardContent className="p-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">Apiary Intelligence</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between py-2 border-b border-muted/50">
                            <span className="text-sm text-muted-foreground flex items-center"><CloudRain className="mr-2 h-4 w-4" /> Environment</span>
                            <span className="text-sm font-semibold">{batchData.apiary.environment_type}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-muted/50">
                            <span className="text-sm text-muted-foreground flex items-center"><Leaf className="mr-2 h-4 w-4" /> Primary Flora</span>
                            <span className="text-sm font-semibold text-right">{batchData.apiary.flora_types.length > 0 ? batchData.apiary.flora_types.join(", ") : "Maize, Sunflower, Sisal, Mangoes, Acacia, Wildflowers"}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-muted/50">
                            <span className="text-sm text-muted-foreground flex items-center"><Droplets className="mr-2 h-4 w-4" /> Water Source</span>
                            <span className="text-sm font-semibold">{batchData.apiary.water_source || "Natural Spring Water"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Hive Details */}
                  {batchData.hive && (
                    <Card className="border-none shadow-soft bg-foreground text-background overflow-hidden">
                      <div className="bg-primary px-6 py-2 text-xs font-bold uppercase tracking-widest text-center">Hive Sensor Node: {batchData.hive.hive_code}</div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="rounded-full bg-white/10 p-3">
                            <Activity className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-white/50 uppercase font-bold">Bee Variety</p>
                            <p className="font-semibold text-lg">{batchData.hive.bee_type}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                            <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Hive Type</p>
                            <p className="text-sm font-medium">{batchData.hive.hive_type}</p>
                          </div>
                          <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                            <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Status</p>
                            <p className="text-sm font-medium text-nature-green-light">Monitoring Active</p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/10">
                          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Active Sensors</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">BeeYield Sensors™</span>
                            <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded">Scale + Temp</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">BeeYield Acoustic Node</span>
                            <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded">Acoustic Analysis</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/70">Atmosphere</span>
                            <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded">VOCs / CO2</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Trust Elements Section */}
      <div className="bg-white py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Trust is Our <span className="text-primary italic">Single Ingredient</span></h2>
            <p className="text-xl text-muted-foreground">
              We leverage advanced blockchain cryptography and IoT edge sensors to prove that your honey is exactly what it claims to be.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-24">
            {[
              {
                icon: Shield,
                title: "Anti-Adulteration",
                description: "Blockchain prevents mislabeling. Each block represents a physical harvest event verified at the apiary level."
              },
              {
                icon: Heart,
                title: "The 50% Rule",
                description: "We are the first to programmatically verify that 50% of production remains in the hive for the bees."
              },
              {
                icon: Award,
                title: "Single Origin",
                description: "No blending. No shortcuts. Trace every individual jar back to a single hive and a named beekeeper."
              }
            ].map((item, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-muted/30 transition-all hover:bg-card hover:shadow-premium text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold">{item.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-border/50 pt-16">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">Official Technology Partners</p>
            <div className="flex flex-wrap items-center justify-center gap-12 text-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-2">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <span className="font-bold text-foreground">BeeYield Acoustic Node</span>
                <span className="text-xs text-muted-foreground">Acoustic Disease Diagnostics</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-2">
                  <Cpu className="h-8 w-8 text-secondary" />
                </div>
                <span className="font-bold text-foreground">BeeYield Sensors™</span>
                <span className="text-xs text-muted-foreground">Precision GPS & Weight</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Traceability;
