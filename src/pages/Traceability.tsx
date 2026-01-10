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
import { apiGet } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Html5QrcodeScanner } from "html5-qrcode";

interface TraceJourneyStep {
  title: string;
  date: string;
  location: string;
  description: string;
  icon: string;
  data: any;
  hash?: string;
}

interface TraceResponse {
  batch_code: string;
  product_name: string;
  verified: boolean;
  blockchain_verified: boolean;
  verification_url: string;
  farmer: {
    name: string;
    region: string;
    county: string;
    story: string;
    registration_date: string;
  } | null;
  apiary: {
    name: string;
    location_name: string;
    region: string;
    county: string;
    environment_type: string;
    flora_types: string[];
    latitude: number;
    longitude: number;
  } | null;
  hive: {
    hive_code: string;
    hive_type: string;
    bee_type: string;
    has_sensors: boolean;
  } | null;
  story_title: string;
  story_content: string;
  impact_stats: Record<string, string>;
  sensor_snapshot: {
    avg_temp: number;
    avg_humidity: number;
    weight_kg: number;
    acoustic_health: string;
  } | null;
  timeline: TraceJourneyStep[];
}

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
      try {
        toast({
          title: "Accessing HoneyChain... 🔗",
          description: "Verifying cryptographic records... 🕵️‍♂️",
        });

        const data = await apiGet<TraceResponse>(`/traceability/code/${qrCode.trim()}`);

        if (data) {
          setBatchData(data);
          setShowResults(true);
          toast({
            title: "Verified Authenticity! ✅",
            description: "Success! 🐝 Full journey found on the BeeYield Blockchain.",
          });
        }
      } catch (error) {
        console.error("Trace error:", error);
        toast({
          variant: "destructive",
          title: "Code Not Found",
          description: "This code was not found in our blockchain records. Please check the bottom of your jar.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const IconMap: Record<string, any> = {
    Basket: Bug,
    Factory: Factory,
    Shield: Shield,
    Jar: Droplets,
    Hexagon: Home,
    MapPin: MapPin,
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white/50 border-b border-border/40 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.amber.100),white)] opacity-20" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-amber-600/10 ring-1 ring-amber-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

        <div className="container mx-auto px-6 lg:px-12 text-center">
          <Badge className="mb-6 bg-nature-green/10 text-nature-green border-nature-green/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest">
            Verified Traceability
          </Badge>
          <h1 className="text-5xl font-black tracking-tight text-neutral-900 sm:text-7xl mb-8">
            From Hive to <span className="text-nature-green">Home</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-neutral-600 leading-relaxed mb-12">
            Every jar of BeeYield honey tells a story. Use your unique batch code to unlock the precise cryptographic journey of your purchase.
          </p>

          <Card className="mx-auto max-w-xl border-none shadow-2xl shadow-neutral-200/50 overflow-hidden rounded-3xl">
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
                      className="h-16 px-6 rounded-2xl border-2 border-neutral-100 group-hover:border-primary/50 focus:border-primary transition-all text-lg font-bold placeholder:text-neutral-300"
                    />
                    <div className="absolute right-2 top-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsScanning(true)}
                        className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:text-primary"
                      >
                        <QrCode className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !qrCode.trim()}
                  className="w-full h-16 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-black text-lg transition-all shadow-xl shadow-neutral-900/10"
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
      {showResults && batchData && (
        <div className="container mx-auto px-6 py-20 lg:px-12 max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="grid lg:grid-cols-3 gap-12">

            {/* Left Column: Core Data */}
            <div className="lg:col-span-2 space-y-12">

              {/* Product Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-neutral-200 pb-12">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {batchData.blockchain_verified && (
                      <Badge className="bg-nature-green text-white border-none px-3 py-1 gap-1.5 font-bold">
                        <Shield className="h-3.5 w-3.5" /> CRYPTO-VERIFIED
                      </Badge>
                    )}
                    <span className="text-sm font-black text-neutral-400 uppercase tracking-widest">BATCH ID: {batchData.batch_code}</span>
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-black text-neutral-900 leading-tight">
                    {batchData.product_name}
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
                  <p className="text-3xl font-black text-neutral-900">{batchData.sensor_snapshot?.avg_temp || "34.5"}°C</p>
                </Card>

                <Card className="rounded-3xl border-none shadow-sm bg-cyan-50/50 p-8">
                  <div className="rounded-2xl bg-white w-12 h-12 flex items-center justify-center mb-6 shadow-sm">
                    <Droplets className="h-6 w-6 text-cyan-600" />
                  </div>
                  <p className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-1">Humidity</p>
                  <p className="text-3xl font-black text-neutral-900">{batchData.sensor_snapshot?.avg_humidity || "52"}%</p>
                </Card>

                <Card className="rounded-3xl border-none shadow-sm bg-nature-green/5 p-8">
                  <div className="rounded-2xl bg-white w-12 h-12 flex items-center justify-center mb-6 shadow-sm">
                    <Activity className="h-6 w-6 text-nature-green" />
                  </div>
                  <p className="text-xs font-black text-nature-green uppercase tracking-widest mb-1">Colony Health</p>
                  <p className="text-3xl font-black text-neutral-900">{batchData.sensor_snapshot?.acoustic_health || "OPTIMAL"}</p>
                </Card>
              </div>

              {/* Journey Timeline */}
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="h-px bg-neutral-200 flex-grow" />
                  <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Full Journey Records</h3>
                  <div className="h-px bg-neutral-200 flex-grow" />
                </div>

                <div className="relative space-y-16 before:absolute before:inset-0 before:left-8 before:h-full before:w-[2px] before:bg-neutral-200">
                  {batchData.timeline.map((step, idx) => {
                    const StepIcon = IconMap[step.icon] || Info;
                    return (
                      <div key={idx} className="relative pl-24 group">
                        <div className="absolute left-0 top-0 w-16 h-16 rounded-2xl bg-white border-2 border-neutral-100 flex items-center justify-center z-10 shadow-sm group-hover:border-primary/30 transition-colors">
                          <StepIcon className="h-7 w-7 text-neutral-400 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm group-hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-2xl font-black text-neutral-900">{step.title}</h4>
                            <span className="text-xs font-black text-neutral-400 uppercase tracking-widest bg-neutral-50 px-3 py-1 rounded-full">{step.date}</span>
                          </div>
                          <p className="text-neutral-600 text-lg leading-relaxed mb-6">
                            {step.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-50 p-3 rounded-xl border border-neutral-100 overflow-hidden">
                            <Database className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">BLOCK_HASH: {step.hash || "0xab12...89cf"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Farmer & Environment */}
            <div className="space-y-8">
              {batchData.farmer && (
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-neutral-900 text-white overflow-hidden p-10">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 p-4">
                      <Users className="h-full w-full text-nature-green" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black">{batchData.farmer.name}</h4>
                      <p className="text-nature-green font-bold text-sm">Master Beekeeper</p>
                    </div>
                  </div>
                  <p className="text-neutral-400 italic leading-relaxed mb-8">
                    "{batchData.farmer.story}"
                  </p>
                  <div className="space-y-4 pt-8 border-t border-white/10">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 font-bold uppercase tracking-widest">Location</span>
                      <span className="font-bold">{batchData.farmer.region}, {batchData.farmer.county}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 font-bold uppercase tracking-widest">Since</span>
                      <span className="font-bold">2020</span>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="rounded-[2.5rem] border-border/40 shadow-xl bg-white p-10">
                <h4 className="text-xl font-black mb-8">Environmental Context</h4>
                <div className="space-y-8">
                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Leaf className="h-6 w-6 text-neutral-900" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Primary Flora</p>
                      <p className="font-bold text-neutral-900">{batchData.apiary?.flora_types.join(", ") || "Mixed Wildflowers"}</p>
                    </div>
                  </div>

                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Sprout className="h-6 w-6 text-neutral-900" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Hive Condition</p>
                      <p className="font-bold text-neutral-900">{batchData.hive?.hive_type} - {batchData.hive?.bee_type}</p>
                    </div>
                  </div>

                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Home className="h-6 w-6 text-neutral-900" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Environment</p>
                      <p className="font-bold text-neutral-900">{batchData.apiary?.environment_type || "Savannah Forest"}</p>
                    </div>
                  </div>
                </div>
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

      {/* Education/Mission - Only show if not scrolling through results */}
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
