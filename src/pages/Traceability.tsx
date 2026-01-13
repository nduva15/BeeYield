import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  QrCode, MapPin, Calendar, Leaf, Info, Heart, Shield, Droplets, Home, Users, Award,
  CheckCircle2, Box, Activity, Thermometer, Waves, Loader2, X, Search, Globe, ShieldCheck, Zap, Lock, FileDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import { PDFDownloadLink } from "@react-pdf/renderer";
import HoneyTracePDF from "@/components/HoneyTracePDF";
import { traceBatchFn } from "@/server/traceability";

const Traceability = () => {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [traceData, setTraceData] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const { toast } = useToast();

  const handleTrace = async (code: string) => {
    if (!code.trim()) return;

    setLoading(true);
    setTraceData(null);

    try {
      // Isomorphic function call - this looks like a normal function but runs on server!
      const data = await traceBatchFn({ data: code });

      if (!data) {
        throw new Error("Batch not found using centralized ledger");
      }

      setTraceData(data);
      toast({
        title: "Chain Verified!",
        description: `Full journey data retrieved for batch ${code}`,
      });
    } catch (error: any) {
      console.error("Trace error:", error);
      toast({
        variant: "destructive",
        title: "Code not found",
        description: error.message || "Please check the code and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrace(qrCode);
  };

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (showScanner) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          setQrCode(decodedText);
          setShowScanner(false);
          handleTrace(decodedText);
          if (scanner) scanner.clear();
        },
        (error) => {
          // console.warn(error);
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((error) => console.error("Failed to clear scanner", error));
      }
    };
  }, [showScanner]);

  // Scroll to results when trace data is loaded
  useEffect(() => {
    if (traceData) {
      const resultsElement = document.getElementById("trace-results");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [traceData]);

  const traceabilityFeatures = [
    { icon: Home, label: "Hive Location", description: "Know exactly which hive your honey came from" },
    { icon: Users, label: "Beekeeper", description: "Meet the guardian who nurtured your honey" },
    { icon: Leaf, label: "Flower Source", description: "Discover the blooms that flavored your jar" },
    { icon: Droplets, label: "Water Source", description: "Trace the pure water that sustained the colony" },
    { icon: MapPin, label: "Geographic Origin", description: "GPS coordinates of every harvest" },
    { icon: Calendar, label: "Harvest Date", description: "Know when your honey was collected" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Premium Orange/Amber - Mobile Responsive */}
      <section className="relative min-h-[50vh] sm:min-h-[55vh] md:min-h-[60vh] flex items-center overflow-hidden py-12 sm:py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-amber-800 to-orange-700">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-40 sm:w-72 h-40 sm:h-72 bg-yellow-400 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-amber-300 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-64 h-32 sm:h-64 bg-orange-400 rounded-full blur-3xl animate-pulse delay-500" />
          </div>
          {/* Honeycomb Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="honeycomb-trace" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5.77 20,17.32 10,23.09 0,17.32 0,5.77" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-trace)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white space-y-4 sm:space-y-6 md:space-y-8">
            <div className="flex justify-center">
              <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-white/30 transition-colors inline-flex items-center">
                <ShieldCheck className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> 100% HoneyChain™ Verified
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tighter px-2">
              The Journey of <span className="text-yellow-400 italic">Every Drop</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed px-4">
              Transparent. Ethical. Traceable. Scan your jar's QR code to meet your bees,
              view real-time hive metrics, and verify our 50/50 harvest promise.
            </p>
          </div>
        </div>
      </section>

      {/* Trace Your Honey Section */}
      <div className="py-24 -mt-16 relative z-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <Card className="border-none shadow-2xl overflow-hidden bg-white/95 backdrop-blur-md dark:bg-slate-950/95 rounded-[2.5rem]">
              <CardContent className="p-0">
                {showScanner ? (
                  <div className="p-10">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-2xl font-black tracking-tight">Scan Honey QR</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowScanner(false)} className="rounded-full">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <div id="reader" className="overflow-hidden rounded-3xl border-4 border-dashed border-amber-500/30" />
                    <p className="mt-6 text-center text-sm text-muted-foreground font-medium">
                      Allow camera access and frame the QR code on your BeeYield jar.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2">
                    <div className="p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                      <h2 className="mb-4 text-3xl font-black tracking-tight">Manual Verification</h2>
                      <p className="mb-8 text-muted-foreground">
                        Enter the unique batch code found on the bottom or side of your honey jar.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                          <Input
                            id="qrCode"
                            name="qrCode"
                            value={qrCode}
                            onChange={(e) => setQrCode(e.target.value)}
                            placeholder="e.g. KIB-ACACIA-24"
                            className="h-16 pl-12 pr-4 rounded-2xl border-2 border-slate-100 focus:border-amber-500 focus:ring-amber-500 transition-all text-lg font-bold"
                            disabled={loading}
                          />
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                        </div>
                        <Button
                          type="submit"
                          disabled={loading || !qrCode.trim()}
                          className="w-full h-16 bg-amber-600 hover:bg-amber-700 text-white text-lg font-black rounded-2xl shadow-xl hover:shadow-amber-500/20 transition-all"
                        >
                          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Verify Identity"}
                        </Button>
                      </form>

                      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Try These Demo Batches:</p>
                        <div className="flex flex-wrap gap-2">
                          {["DEMO-001", "KIB-ACACIA-24", "KIB-GOLD-24"].map(code => (
                            <button
                              key={code}
                              onClick={() => { setQrCode(code); handleTrace(code); }}
                              className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                            >
                              {code}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-10 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center text-center">
                      <div className="mb-6 w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center animate-bounce">
                        <QrCode className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">Quick Scan</h3>
                      <p className="text-muted-foreground mb-8 text-sm">
                        Use your smartphone camera to instantly verify authenticity and unlock the full story on HoneyChain™.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full h-16 border-2 border-amber-500/20 hover:border-amber-500 text-amber-700 dark:text-amber-400 font-black rounded-2xl transition-all"
                        onClick={() => setShowScanner(true)}
                      >
                        <Zap className="mr-2 h-5 w-5 fill-amber-500" />
                        Launch Scanner
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {traceData && (
              <div id="trace-results" className="mt-16 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                  <div className="flex items-center gap-2 px-6 py-2 bg-green-500/10 rounded-full border border-green-500/20 animate-pulse">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-black text-green-600 uppercase tracking-widest">Authenticated on HoneyChain™</span>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>

                {/* PDF Download Button */}
                <div className="flex justify-center">
                  <PDFDownloadLink
                    document={<HoneyTracePDF traceData={traceData} />}
                    fileName={`BeeYield-Traceability-${traceData.batch_code || 'Certificate'}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black px-8 py-6 rounded-2xl shadow-xl hover:shadow-amber-500/30 transition-all flex items-center gap-3 text-lg"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <FileDown className="h-5 w-5" />
                            Download Traceability Certificate
                          </>
                        )}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden group">
                    <CardContent className="p-10 space-y-8">
                      <div className="flex justify-between items-start">
                        <h2 className="text-3xl font-black tracking-tighter">Origin Details</h2>
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl group-hover:rotate-12 transition-transform">
                          <Globe className="h-6 w-6 text-amber-600" />
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4">
                            <Box className="h-6 w-6 text-indigo-500" />
                          </div>
                          <div>
                            <h3 className="font-black text-xs text-muted-foreground uppercase tracking-wider mb-1">Batch Identifier</h3>
                            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{traceData.batch_code}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4">
                            <Home className="h-6 w-6 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-black text-xs text-muted-foreground uppercase tracking-wider mb-1">Apiary Location</h3>
                            <p className="text-xl font-black text-slate-900 dark:text-white mb-1">{traceData.apiary?.name || "Kibwezi Savannah"}</p>
                            <p className="text-sm font-medium text-muted-foreground">{traceData.apiary?.location_name}, {traceData.apiary?.county}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4">
                            <Leaf className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-black text-xs text-muted-foreground uppercase tracking-wider mb-1">Flora Sources</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {traceData.apiary?.flora_types?.map((flora: string) => (
                                <Badge key={flora} variant="outline" className="bg-green-500/5 text-green-600 border-green-500/20">{flora}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden">
                    <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-10 text-white">
                      <h3 className="font-black text-xs uppercase tracking-widest mb-6 opacity-60">Master Beekeeper</h3>
                      <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-[2rem] bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl font-black border border-white/20">
                          {traceData.farmer?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-3xl font-black tracking-tighter mb-1">{traceData.farmer?.name}</p>
                          <Badge className="bg-white/20 text-white border-none py-1">Certified Guardian</Badge>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-10 bg-white dark:bg-slate-950">
                      <p className="text-lg text-muted-foreground leading-relaxed italic font-medium">
                        "{traceData.farmer?.story}"
                      </p>
                      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                              <Award className="h-4 w-4 text-amber-600" />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Multi-Award Winner</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* IoT Sensor Data Section */}
                {traceData.sensor_snapshot && (
                  <Card className="border-none shadow-xl bg-slate-950 text-white rounded-[3rem] overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8">
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Hive Link</span>
                      </div>
                    </div>
                    <CardContent className="p-12">
                      <div className="mb-12">
                        <h3 className="text-3xl font-black tracking-tighter mb-2">Hive Intelligence</h3>
                        <p className="text-slate-400 font-medium">Remote monitoring data captured at moment of harvest</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest">
                            <Thermometer className="h-4 w-4 text-orange-500" /> Temperature
                          </div>
                          <p className="text-5xl font-black tracking-tighter">{traceData.sensor_snapshot.avg_temp}°C</p>
                          <Badge className="bg-green-500/20 text-green-400 border-none">OPTIMAL</Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest">
                            <Waves className="h-4 w-4 text-blue-500" /> Humidity
                          </div>
                          <p className="text-5xl font-black tracking-tighter">{traceData.sensor_snapshot.avg_humidity}%</p>
                          <Badge className="bg-green-500/20 text-green-400 border-none">STABLE</Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest">
                            <Activity className="h-4 w-4 text-purple-500" /> Acoustic
                          </div>
                          <p className="text-xl font-black tracking-tight leading-tight pt-2">{traceData.sensor_snapshot.acoustic_health}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Active Queen Pattern</p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest">
                            <Box className="h-4 w-4 text-amber-500" /> Hive Weight
                          </div>
                          <p className="text-5xl font-black tracking-tighter">{traceData.sensor_snapshot.weight_kg}kg</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Productivity Peak</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Journey Timeline */}
                <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden">
                  <CardContent className="p-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                      <h3 className="text-4xl font-black tracking-tighter">The Honey Journey</h3>
                      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground bg-slate-50 dark:bg-slate-900 px-6 py-2 rounded-full">
                        <Lock className="h-4 w-4" /> Immutable Ledger Records
                      </div>
                    </div>

                    <div className="space-y-12 relative">
                      <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-gradient-to-b from-amber-500 to-amber-100 dark:to-slate-800" />

                      {traceData.timeline?.map((step: any, idx: number) => (
                        <div key={idx} className="flex gap-10 group">
                          <div className="relative z-10">
                            <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-950 border-4 border-amber-500 flex items-center justify-center text-amber-600 shadow-xl group-hover:scale-110 transition-transform">
                              <CheckCircle2 className="h-6 w-6" />
                            </div>
                          </div>
                          <div className="flex-1 pb-10 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <h4 className="font-black text-2xl tracking-tight">{step.title}</h4>
                              <Badge variant="secondary" className="font-black px-3">{step.date}</Badge>
                              {step.hash && (
                                <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-muted-foreground uppercase">
                                  Hash: {step.hash.substring(0, 12)}...
                                </span>
                              )}
                            </div>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-4 font-medium">{step.description}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
                                <MapPin className="h-3 w-3" /> {step.location}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Mission Statement */}
            <div className="bg-amber-50/50 dark:bg-slate-900/30 py-32 rounded-[4rem] mt-24">
              <div className="container mx-auto px-6 lg:px-12">
                <div className="mx-auto max-w-4xl text-center space-y-12">
                  <div className="inline-block rounded-[2rem] bg-orange-500/10 p-8">
                    <Heart className="h-16 w-16 text-orange-600 fill-orange-600" />
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                    Champions for <span className="text-orange-600 italic">Saving Bees</span>
                  </h2>
                  <div className="space-y-8">
                    <p className="text-2xl leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                      At BeeYield, we believe that the future of our planet depends on the health of our pollinators.
                      That's why we've made a radical commitment: <span className="text-amber-600 font-black">we only harvest 50% of the honey our bees produce</span>.
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
            </div>

            {/* Stats Section */}
            <div className="py-32">
              <div className="container mx-auto px-6 lg:px-12">
                <div className="grid gap-8 md:grid-cols-3">
                  <Card className="border-none bg-amber-500/5 text-center shadow-xl rounded-[3rem] p-8">
                    <CardContent className="space-y-4">
                      <div className="text-6xl font-black text-amber-600 tracking-tighter">883 kg</div>
                      <p className="text-xl font-black tracking-tight">Pure Traceable Honey</p>
                      <p className="text-sm text-muted-foreground font-medium">Harvested and verified on-chain to date</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-orange-500/5 text-center shadow-xl rounded-[3rem] p-8">
                    <CardContent className="space-y-4">
                      <div className="text-6xl font-black text-orange-600 tracking-tighter">50%</div>
                      <p className="text-xl font-black tracking-tight">Ethical Harvest Rate</p>
                      <p className="text-sm text-muted-foreground font-medium">Half stays with the bees, ensuring survival</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-indigo-500/5 text-center shadow-xl rounded-[3rem] p-8">
                    <CardContent className="space-y-4">
                      <div className="text-6xl font-black text-indigo-600 tracking-tighter">100%</div>
                      <p className="text-xl font-black tracking-tight">Full Transparency</p>
                      <p className="text-sm text-muted-foreground font-medium">Every drop traceable to source and hive</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Why Traceability Matters */}
            <div className="bg-slate-900 text-white py-32 rounded-[5rem] overflow-hidden relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500 rounded-full blur-[140px] -mr-32 -mt-32" />
              </div>

              <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="mx-auto max-w-6xl text-center">
                  <div className="mb-20 space-y-6">
                    <div className="inline-block rounded-3xl bg-amber-500/20 p-6">
                      <Shield className="h-12 w-12 text-amber-500" />
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">Trust in <br /> Every <span className="text-amber-500 italic">Drop</span></h2>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-16 items-center text-left">
                    <div className="space-y-8">
                      <p className="text-2xl leading-relaxed font-medium">
                        Did you know that up to <span className="text-red-500 font-black">70% of honey</span> on supermarket shelves may be
                        adulterated?
                      </p>
                      <p className="text-lg text-slate-400 leading-relaxed font-medium">
                        Our revolutionary traceability system lets you trace every jar back to its source—not just the country
                        or region, but the <span className="text-amber-500 font-black">exact hive, the beekeeper who cared for it,
                          and the flowers the bees visited</span>. This isn't just honey; it's a story you can verify.
                      </p>
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                      {traceabilityFeatures.slice(0, 4).map((f) => (
                        <div key={f.label} className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 space-y-3">
                          <f.icon className="h-8 w-8 text-amber-500" />
                          <h4 className="font-black tracking-tight">{f.label}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* YouTube Video Section */}
            <div className="py-32">
              <div className="container mx-auto px-6 lg:px-12">
                <div className="mx-auto max-w-4xl text-center space-y-6 mb-16">
                  <h2 className="text-5xl font-black tracking-tighter">Watch the Story</h2>
                  <p className="text-xl text-muted-foreground font-medium">
                    See how we're revolutionizing the industry with transparency and ethical practices
                  </p>
                </div>
                <div className="relative mx-auto max-w-6xl aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
                  <iframe
                    className="absolute inset-0 w-full h-full"
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
        </div>
      </div>
    </div>
  );
};

export default Traceability;
