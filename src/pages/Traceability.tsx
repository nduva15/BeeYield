import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  QrCode, MapPin, Calendar, Leaf, Info, Heart,
  Shield, Droplets, Home, Users, Award,
  CheckCircle2, Thermometer, CloudRain,
  Activity, Zap, Box, Factory, Jar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { traceBatch, TraceResponse, TraceJourneyStep } from "@/services/traceabilityService";
import { Badge } from "@/components/ui/badge";

const Traceability = () => {
  const [qrCode, setQrCode] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [batchData, setBatchData] = useState<TraceResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCode.trim()) {
      setIsLoading(true);
      setShowResults(false);
      try {
        toast({
          title: "Accessing HoneyChain...",
          description: "Verifying cryptographic records.",
        });

        const data = await traceBatch(qrCode);

        if (data) {
          setBatchData(data);
          setShowResults(true);
          toast({
            title: "Verified Authenticity",
            description: "Full journey found on the BeeYield Blockchain.",
          });
        } else {
          toast({
            title: "Code Not Found",
            description: "We couldn't find this batch on the blockchain. Please check the code.",
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
      case "Jar": return <Jar className="h-6 w-6" />;
      case "Factory": return <Factory className="h-6 w-6" />;
      case "Basket": return <Box className="h-6 w-6" />;
      case "Hexagon": return <Zap className="h-6 w-6" />;
      case "MapPin": return <MapPin className="h-6 w-6" />;
      default: return <Activity className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-white py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              <Shield className="mr-2 h-3.5 w-3.5" />
              Powered by HoneyChain™ Blockchain
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Authenticity <span className="text-primary italic">You Can Trace</span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
              Every drop of BeeYield honey tells a story of sustainable beekeeping,
              local empowerment, and radical transparency.
            </p>

            <Card className="mx-auto max-w-xl border-none bg-white/60 shadow-2xl backdrop-blur-md">
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <QrCode className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="qrCode"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      placeholder="Enter Batch ID (e.g. DEMO-001)"
                      className="h-12 border-none bg-white/80 pl-11 focus-visible:ring-primary shadow-inner"
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={isLoading} className="h-12 px-8 font-semibold shadow-lg shadow-primary/20">
                    {isLoading ? "Verifying..." : "Trace Journey"}
                  </Button>
                </form>
                <div className="mt-4 flex items-center justify-between px-2 text-xs font-medium text-muted-foreground">
                  <span>Enter the code found on the back of your jar</span>
                  <button className="flex items-center text-primary hover:underline">
                    <QrCode className="mr-1 h-3 w-3" />
                    Scan QR
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

      {showResults && batchData && (
        <div className="container mx-auto px-6 py-12 lg:px-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column: Product & Journey */}
            <div className="lg:col-span-2 space-y-8">
              {/* Product Card */}
              <Card className="overflow-hidden border-none shadow-premium bg-white">
                <div className="bg-primary/5 p-8 border-b border-primary/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">{batchData.product_name}</h2>
                      <p className="font-mono text-sm text-muted-foreground mt-1">Batch ID: {batchData.batch_code}</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-bold uppercase tracking-wider">Blockchain Verified</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs uppercase font-bold text-muted-foreground flex items-center">
                        <Thermometer className="mr-1 h-3 w-3" /> Temp
                      </p>
                      <p className="text-xl font-semibold">34.2°C</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase font-bold text-muted-foreground flex items-center">
                        <Droplets className="mr-1 h-3 w-3" /> Humidity
                      </p>
                      <p className="text-xl font-semibold">52%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase font-bold text-muted-foreground flex items-center">
                        <Leaf className="mr-1 h-3 w-3" /> Purity
                      </p>
                      <p className="text-xl font-semibold">100% Raw</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase font-bold text-muted-foreground flex items-center">
                        <Users className="mr-1 h-3 w-3" /> Fair Pay
                      </p>
                      <p className="text-xl font-semibold text-green-600">Guaranteed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Journey Timeline */}
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Immutable Journey
              </h3>
              <div className="relative space-y-8 pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-muted">
                {batchData.timeline.map((step, idx) => (
                  <div key={idx} className="relative transition-all hover:translate-x-1">
                    <div className={`absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ${idx === 0 ? 'ring-primary' : 'ring-muted shadow-sm'}`}>
                      {idx === 0 ? <Jar className="h-3 w-3 text-primary" /> : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />}
                    </div>
                    <Card className="border-none shadow-soft hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                          <h4 className="font-bold text-lg">{step.title}</h4>
                          <span className="text-xs font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">{step.date}</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="rounded-lg bg-primary/5 p-3 text-primary">
                            {getIcon(step.icon)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                              <MapPin className="mr-1 h-3 w-3" /> {step.location}
                            </p>
                            <p className="text-sm leading-relaxed">{step.description}</p>
                            {step.hash && (
                              <p className="mt-3 font-mono text-[10px] text-muted-foreground bg-muted/20 p-2 rounded truncate max-w-[200px] sm:max-w-md">
                                BLOCK HASH: {step.hash}
                              </p>
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
                        <span className="text-sm font-semibold">{batchData.apiary.flora_types.join(", ")}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-muted/50">
                        <span className="text-sm text-muted-foreground flex items-center"><Droplets className="mr-2 h-4 w-4" /> Water Source</span>
                        <span className="text-sm font-semibold">{batchData.apiary.water_source || "Natural Springs"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hive Details */}
              {batchData.hive && (
                <Card className="border-none shadow-soft bg-[#2A2A2A] text-white overflow-hidden">
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                        <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Hive Type</p>
                        <p className="text-sm font-medium">{batchData.hive.hive_type}</p>
                      </div>
                      <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                        <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Status</p>
                        <p className="text-sm font-medium text-green-400">Monitoring Active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trust Elements Section */}
      <div className="bg-white py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Trust is Our <span className="text-primary italic">Single Ingredient</span></h2>
            <p className="text-xl text-muted-foreground">
              We leverage advanced blockchain cryptography and IoT edge sensors to prove that your honey is exactly what it claims to be.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
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
              <div key={i} className="group p-8 rounded-3xl bg-[#fafafa] transition-all hover:bg-white hover:shadow-premium text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold">{item.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Traceability;
