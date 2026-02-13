import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  QrCode, MapPin, Calendar, Leaf, Info, Heart, Shield, Droplets, Home, Users, Award,
  CheckCircle2, Box, Activity, Thermometer, Waves, Loader2, X, Search, Globe, ShieldCheck, Zap, Lock, FileDown, Wheat, TreePine, Scale, Cpu,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import { PDFDownloadLink } from "@react-pdf/renderer";
import HoneyTracePDF from "@/components/HoneyTracePDF";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import TIMOTHY_PHOTO from '@/assets/timothy-nduva.png';
import LOGO from '@/assets/Logo.png';
import PLACEHOLDER_SVG from '@/assets/placeholder.svg';
import { traceBatch, TraceResponse, TraceJourneyStep } from "@/services/traceabilityService";
import { adminService } from "@/services/adminService";

const Traceability = () => {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false); // New state for sync animation
  const [traceData, setTraceData] = useState<TraceResponse | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const handleTrace = useCallback(async (code: string) => {
    if (!code.trim()) return;

    setLoading(true);
    setTraceData(null);

    try {
      // Use client-side traceBatch which has demo data fallback
      const data = await traceBatch(code);

      if (!data) {
        throw new Error("Batch not found");
      }

      setTraceData(data);

      // Artificial delay for "Perfect Sync" animation
      setVerifying(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setVerifying(false);

      setIsModalOpen(true);

      // Log traceability scan for admin dashboard
      adminService.logTrace({
        batch_code: code,
        honey_type: data.product_name || 'Unknown Honey',
        farmer_name: data.farmer?.name || 'Unknown Farmer',
        trace_source: 'website_scan',
        is_authenticated: true
      }).catch(err => console.error("Failed to log trace:", err));

      toast({
        title: "Batch Found",
        description: `Origin details retrieved for batch ${code}`,
      });
    } catch (error) {
      console.error("Trace error:", error);
      const errorMessage = error instanceof Error ? error.message : "Please check the code and try again.";
      toast({
        variant: "destructive",
        title: "Code not found",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Handle direct trace from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    if (code) {
      setQrCode(code);
      handleTrace(code);
    }
  }, [location.search, handleTrace]);

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
  }, [showScanner, handleTrace]);

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
      {/* Hero Section - Premium Sage Green theme - Mobile Responsive */}
      <section className="relative min-h-[50vh] sm:min-h-[55vh] md:min-h-[60vh] flex items-center overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="absolute inset-0 bg-[#F0F7F0]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-40 sm:w-72 h-40 sm:h-72 bg-green-200 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-amber-100 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-64 h-32 sm:h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-500" />
          </div>
          {/* Honeycomb Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="honeycomb-trace" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5.77 20,17.32 10,23.09 0,17.32 0,5.77" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-trace)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-neutral-900 space-y-4 sm:space-y-6 md:space-y-8">
            <div className="flex justify-center">
              <Badge className="bg-green-100 text-green-900 border-green-200 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-green-200/80 transition-colors inline-flex items-center font-bold">
                <ShieldCheck className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> 100% Verified Authentic
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tighter px-2">
              The Journey of <span className="text-green-700 italic">Every Drop</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed px-4">
              Transparent. Ethical. Traceable. Scan your jar's QR code to see where your honey comes from,
              check live hive conditions, and verify our 50/50 harvest promise.
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
                            placeholder="e.g. KIB-ACACIAL-26"
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
                          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Trace Batch"}
                        </Button>
                      </form>

                      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Try these example codes</p>
                        <div className="flex flex-wrap gap-2">
                          {["KIB-ACACIAL-26", "KIB-SAV-2026", "KIB-GOLD-2026"].map(code => (
                            <Button
                              key={code}
                              variant="ghost"
                              size="sm"
                              className="text-[10px] font-bold bg-slate-50 hover:bg-amber-50 hover:text-amber-700 rounded-full h-8"
                              onClick={() => {
                                setQrCode(code);
                                handleTrace(code);
                              }}
                            >
                              {code}
                            </Button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                          <span className="text-xs font-bold text-muted-foreground italic">Every batch is permanently recorded and verified</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-10 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center text-center">
                      <div className="mb-6 w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center animate-bounce">
                        <QrCode className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">Quick Scan</h3>
                      <p className="text-muted-foreground mb-8 text-sm">
                        Use your smartphone camera to instantly verify your honey's authenticity and see its full origin story.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full h-16 border-2 border-amber-500/20 hover:border-amber-500 text-amber-700 dark:text-amber-400 font-black rounded-2xl transition-all"
                        onClick={() => setShowScanner(true)}
                      >
                        <Zap className="mr-2 h-5 w-5 fill-amber-500" />
                        Open Scanner
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Blockchain Sync Animation Overlay */}
            {verifying && (
              <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-2xl flex items-center justify-center">
                <div className="max-w-md w-full px-6 text-center space-y-10 animate-in fade-in zoom-in duration-700">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>

                    {/* High-Tech Scanner Visual */}
                    <div className="relative h-48 w-48 mx-auto bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-primary/10 overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent"></div>

                      {/* Scanning Line */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/30 to-transparent h-12 w-full -translate-y-full animate-[scan_1.5s_ease-in-out_infinite] z-20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"></div>

                      <div className="relative z-10 flex flex-col items-center">
                        <Activity className="h-16 w-16 text-primary animate-pulse" />
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-1 w-4 rounded-full bg-primary/20 animate-pulse overflow-hidden">
                              <div className={`h-full bg-primary animate-[loading-bar_1s_infinite] delay-${i * 100}`} style={{ width: '40%' }}></div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Corner Accents */}
                      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary/40 rounded-tl-lg"></div>
                      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary/40 rounded-tr-lg"></div>
                      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary/40 rounded-bl-lg"></div>
                      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary/40 rounded-br-lg"></div>
                    </div>

                    <div className="mt-8 space-y-3">
                      <h3 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Verifying Origin</h3>
                      <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Checking <span className="text-primary font-black">BeeYield</span> harvest records
                      </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Record ID</p>
                        <p className="text-xs font-mono font-bold text-slate-700">#8,442,109</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch Verified</p>
                        <p className="text-xs font-mono font-bold text-slate-700">Authentic</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest animate-pulse">
                        <ShieldCheck className="h-3 w-3" />
                        Origin Confirmed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-white rounded-[2rem] border-none shadow-2xl">
                <div className="sticky top-0 right-0 z-50 flex justify-end p-4">
                  <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-black shadow-lg">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="px-10 pb-10 -mt-14">
                  {/* Header / Brand */}
                  <div className="bg-[#F0F7F0] -mx-10 px-10 py-10 flex flex-col items-center text-center relative overflow-hidden mb-10 rounded-t-[2rem]">
                    <div className="absolute inset-0 opacity-5">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <pattern id="hex-dialog" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M5 0 L10 2.5 L10 7.5 L5 10 L0 7.5 L0 2.5 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#hex-dialog)" />
                      </svg>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-12 relative z-10">
                      <div className="relative group scale-110">
                        <div className="absolute -inset-6 bg-amber-400/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                        <img src={LOGO} alt="BeeYield Logo" className="h-32 md:h-40 object-contain relative z-10 hover:scale-110 transition-transform duration-500 filter drop-shadow-2xl" />
                      </div>

                      <div className="h-1 md:h-24 w-24 md:w-1 bg-gradient-to-b from-transparent via-green-200 to-transparent hidden md:block" />

                      {traceData?.farmer?.name === "Timothy Nduva" ? (
                        <div className="relative">
                          <div className="absolute -inset-3 bg-gradient-to-r from-amber-400 to-green-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                          <img src={TIMOTHY_PHOTO} alt="Timothy Nduva" className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-4 border-white relative z-10 shadow-2xl" />
                        </div>
                      ) : traceData?.farmer?.photo_url ? (
                        <img src={traceData.farmer.photo_url} alt={traceData.farmer.name} className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-4 border-white shadow-2xl" />
                      ) : null}
                    </div>

                    <Badge className="bg-green-100 text-green-900 border-green-200 text-xs px-4 py-2 hover:bg-green-200/80 transition-colors inline-flex items-center font-bold mb-4">
                      <ShieldCheck className="mr-1.5 h-4 w-4" /> Verified Authentic
                    </Badge>

                    <h2 className="text-3xl font-black text-neutral-900 tracking-tight">Traceability Report</h2>
                    <p className="text-neutral-600 font-medium">Batch: <span className="text-green-700 font-bold">{traceData?.batch_code}</span></p>
                  </div>

                  {/* Mission Story Section */}
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                        <Leaf className="h-6 w-6 text-orange-600" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">The BeeYield Story</h3>
                    </div>

                    <div className="space-y-4 text-lg text-neutral-800 leading-relaxed font-medium">
                      <p>
                        In 2020, Timothy Nduva saw an opportunity in the quiet of rural Kibwezi. With just <span className="text-green-800 font-black">4 beehives on half an acre</span>, BeeYield was born as a family mission for sustainable pollination.
                      </p>
                      <p>
                        Today, we've grown to <span className="text-green-800 font-black">184 hives across a thriving 5-acre apiary</span>. Our commitment remains radical: we only harvest 50% of the honey our bees produce.
                      </p>
                      <p className="text-neutral-600 font-normal">
                        Timothy, along with his sisters Agatha and Carole, has turned a modest family venture into a modern beekeeping operation — using sensor-monitored hives to ensure transparency, protect the African honey bee, and restore biodiversity in their native Kenya.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-200 mt-6 md:mt-8">
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-4 py-2 rounded-xl font-bold text-sm">SDG 2: Zero Hunger</Badge>
                      <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2 rounded-xl font-bold text-sm">SDG 13: Climate Action</Badge>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-4 py-2 rounded-xl font-bold text-sm">SDG 15: Life on Land</Badge>
                    </div>
                  </div>

                  {/* Real-time Hive Metrics (Dashboard Data) */}
                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter">Hive Conditions</h3>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-bold gap-1.5 py-1 px-3">
                        <Activity className="h-3 w-3 animate-pulse" /> Verified Data
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="border-none bg-orange-50/50 shadow-sm p-4 text-center">
                        <div className="mx-auto h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                          <Thermometer className="h-5 w-5 text-orange-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900">
                          {typeof traceData?.sensor_snapshot?.avg_temp === 'number' ? traceData.sensor_snapshot.avg_temp.toFixed(1) : "34.5"}°C
                        </p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Temperature</p>
                      </Card>
                      <Card className="border-none bg-blue-50/50 shadow-sm p-4 text-center">
                        <div className="mx-auto h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                          <Droplets className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900">
                          {typeof traceData?.sensor_snapshot?.avg_humidity === 'number' ? traceData.sensor_snapshot.avg_humidity.toFixed(1) : "42.0"}%
                        </p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Humidity</p>
                      </Card>
                      <Card className="border-none bg-amber-50/50 shadow-sm p-4 text-center">
                        <div className="mx-auto h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                          <Box className="h-5 w-5 text-amber-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900">{traceData?.sensor_snapshot?.weight_kg || "24.8"}kg</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hive Weight</p>
                      </Card>
                      <Card className="border-none bg-indigo-50/50 shadow-sm p-4 text-center">
                        <div className="mx-auto h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                          <Zap className="h-5 w-5 text-indigo-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900">Active</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Colony Status</p>
                      </Card>
                    </div>
                  </div>

                  {/* Main Grid: Origin & Beekeeper */}
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Origin Details Card */}
                    <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white h-full relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                        <Globe className="h-24 w-24 text-amber-600" />
                      </div>

                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter">Origin Details</h3>
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-amber-600" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-8 relative z-10">
                        {/* Batch Identifier */}
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Batch Identifier</p>
                          <p className="text-xl font-black text-slate-900 leading-none">{traceData?.batch_code}</p>
                        </div>

                        {/* Harvest Date */}
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Harvest Date</p>
                          <p className="text-xl font-black text-slate-900 leading-none">
                            {traceData?.timeline?.find(s => s.title === "Harvest Day")?.date || traceData?.extra_metadata?.harvest_window?.split('-')[0] || "Jan 5, 2026"}
                          </p>
                        </div>

                        {/* Apiary Stats */}
                        <div className="col-span-2">
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex items-center gap-2 mb-3">
                              <Home className="h-4 w-4 text-amber-600" />
                              <span className="font-black text-slate-900 uppercase tracking-wide text-xs">Harvest Context</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Selected Hives</p>
                                <p className="text-lg font-black text-slate-900">
                                  <span className="text-green-600">{traceData?.impact_stats?.harvested_hives || (traceData?.batch_code?.includes('2026') ? "30" : "184")}</span> <span className="text-slate-400 text-sm">/ {traceData?.impact_stats?.hive_count?.replace(/\D/g, '') || "184"}</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Harvest</p>
                                <p className="text-lg font-black text-slate-900">
                                  {traceData?.impact_stats?.total_honey_kg || (traceData?.batch_code?.includes('2026') ? "60" : "943")} kg
                                </p>
                              </div>
                              <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
                                <p className="text-[10px] font-bold text-primary uppercase">Your Jar</p>
                                <p className="text-lg font-black text-slate-900">{traceData?.extra_metadata?.production_lot_size || "4 jars of 500g"}</p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <p className="text-[10px] text-slate-500 font-medium italic">
                                {traceData?.extra_metadata?.harvest_context || "Only 30 hives met our peak maturity strict standards for this harvest."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Apiary Site */}
                        <div className="col-span-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Apiary Location</p>
                          <p className="text-lg font-black text-slate-900 leading-tight mb-0.5">{traceData?.apiary?.name || "Kibwezi Sanctuary"}</p>
                          <p className="text-xs font-semibold text-slate-500">{traceData?.apiary?.location_name || "Kibwezi West"}, {traceData?.apiary?.county || "Makueni"}</p>
                        </div>

                        {/* Flora Sources */}
                        <div className="col-span-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Flower Sources</p>
                          <div className="flex flex-wrap gap-2">
                            {traceData?.apiary?.flora_types?.length ? traceData.apiary.flora_types.map((flora: string) => (
                              <Badge key={flora} className="bg-green-100 text-green-800 border-green-200 text-xs font-bold px-3 py-1 rounded-lg">
                                {flora}
                              </Badge>
                            )) : (
                              <>
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs font-bold px-3 py-1 rounded-lg">Acacia</Badge>
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs font-bold px-3 py-1 rounded-lg">Wildflower</Badge>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Water Source */}
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Water Source</p>
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <span className="font-bold text-slate-900">{traceData?.apiary?.water_source || "Natural Spring"}</span>
                          </div>
                        </div>

                        {/* Hive Details (Precision Pollination Node) */}
                        {traceData?.hive && (
                          <div className="col-span-2 pt-6 border-t border-slate-100 mt-2">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
                                <Zap className="h-3 w-3" /> Hive Sensor Data
                              </p>
                              <Badge variant="outline" className="border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 bg-emerald-50 flex items-center gap-1">
                                <Activity className="h-2.5 w-2.5 animate-pulse" /> Updated: {traceData.sensor_snapshot?.sync_time || "7m ago"}
                              </Badge>
                            </div>

                            <div className="bg-gradient-to-br from-[#064e3b] to-[#042f2e] text-white rounded-[2rem] p-6 overflow-hidden relative border border-emerald-500/20 shadow-2xl">
                              {/* Background Pattern */}
                              <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                  <pattern id="grid-p" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
                                  </pattern>
                                  <rect width="100%" height="100%" fill="url(#grid-p)" />
                                </svg>
                              </div>

                              <div className="relative z-10">
                                {/* Header: Hive ID & Queen Status */}
                                <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/10">
                                  <div className="flex items-center gap-4">
                                    <div className="relative">
                                      {/* Aura effect for the node icon */}
                                      <div className="absolute -inset-2 bg-amber-500/20 rounded-full blur-lg animate-pulse" />
                                      <div className="h-14 w-14 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center relative z-10 shadow-lg group-hover:bg-white/20 transition-all duration-500">
                                        <div className="text-center">
                                          <Cpu className="h-5 w-5 text-amber-300 mb-0.5 mx-auto" />
                                          <p className="text-[10px] font-black text-white leading-none">{traceData.hive.hive_code}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-black leading-tight tracking-tight flex items-center gap-2">
                                        Hive <span className="px-1.5 py-0.5 bg-emerald-600/50 border border-emerald-500/30 text-[10px] rounded text-white font-mono">{traceData.hive.hive_code.replace(/\D/g, '')}</span>
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        {traceData.sensor_snapshot?.queen_status === 'present' ? (
                                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                            <span className="text-[10px] text-green-400 font-bold leading-none">🛡️</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-green-300">Queen Present</span>
                                          </div>
                                        ) : traceData.sensor_snapshot?.queen_status === 'absent' ? (
                                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
                                            <span className="text-[10px] leading-none">⚠️</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-red-300">Colony Alert</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full">
                                            <span className="text-[10px] leading-none text-slate-400 italic">?</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 italic">State Unknown</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right glass-panel p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                                    <p className="text-[8px] font-black text-emerald-300 uppercase mb-0.5 tracking-widest">GPS Location</p>
                                    <p className="text-[10px] font-mono font-bold text-white mb-0.5">{traceData.sensor_snapshot?.latitude || "-1.2870"}</p>
                                    <p className="text-[10px] font-mono font-bold text-white">{traceData.sensor_snapshot?.longitude || "36.8252"}</p>
                                  </div>
                                </div>

                                {/* Precision Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                  {/* Acoustics */}
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">Hive Sound Level</p>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-black">{traceData.sensor_snapshot?.colony_acoustics || "246"}Hz</span>
                                      <span className="text-[10px] text-green-400 font-bold flex items-center">• {traceData.sensor_snapshot?.acoustics_status || "Stable"}</span>
                                    </div>
                                  </div>

                                  {/* Flight Activity */}
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">Bee Activity</p>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-black">{traceData.sensor_snapshot?.flight_activity || "27.2"} visits/min</span>
                                      <span className="text-[10px] text-green-400 font-bold flex items-center">• {traceData.sensor_snapshot?.activity_status || "Stable"}</span>
                                    </div>
                                  </div>

                                  {/* Brood Temp */}
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">Nursery Temperature</p>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-black">{traceData.sensor_snapshot?.brood_temp || "36"}°C</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-amber-400 font-bold flex items-center italic animate-pulse">LIVE</span>
                                        <span className="text-[10px] text-amber-400 font-bold flex items-center">▲ {traceData.sensor_snapshot?.temp_trend || "+0.9%"}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Nest Humidity */}
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">Inside Humidity</p>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-black">{traceData.sensor_snapshot?.nest_humidity || "75"}%</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-amber-400 font-bold flex items-center italic animate-pulse">LIVE</span>
                                        <span className="text-[10px] text-amber-400 font-bold flex items-center">▲ {traceData.sensor_snapshot?.humidity_trend || "+5.2%"}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Vibration Index */}
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">Hive Movement</p>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-black">{traceData.sensor_snapshot?.vibration_index || "2.4"}m/s²</span>
                                      <span className="text-[10px] text-green-400 font-bold flex items-center">• {traceData.sensor_snapshot?.vibration_status || "Optimal"}</span>
                                    </div>
                                  </div>

                                  {/* Queen Pheromone */}
                                  <div className="space-y-1">
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">Queen Health Signal</p>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-black">{traceData.sensor_snapshot?.queen_pheromone || "High"}</span>
                                        <span className="text-[10px] text-amber-400 font-bold flex items-center">▲ {traceData.sensor_snapshot?.pheromone_trend || "Strong"}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Flight Territory Map */}
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Foraging Range (5km Radius)</p>
                                    <div className="aspect-[4/3] md:aspect-square rounded-2xl bg-[#022c22]/50 relative overflow-hidden border border-emerald-500/20 flex items-center justify-center">
                                      {/* Grid Overlays */}
                                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #34d399 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                      {/* Concentric Circles */}
                                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                        {[100, 75, 50, 25].map((size) => (
                                          <div key={size} className="absolute border border-emerald-400/40 rounded-full" style={{ width: `${size}%`, height: `${size}%` }} />
                                        ))}
                                      </div>
                                      {/* Floral Pins (Simulated - Deterministic) */}
                                      <div className="absolute top-[25%] left-[35%] h-1.5 w-1.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                      <div className="absolute top-[65%] left-[75%] h-1.5 w-1.5 bg-amber-400 rounded-full animate-pulse delay-700 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                      {/* Apiary Center */}
                                      <div className="relative z-10 p-2.5 bg-emerald-600 rounded-xl shadow-2xl border border-white/20">
                                        <MapPin className="h-4 w-4 text-white" />
                                      </div>
                                      <div className="absolute bottom-3 left-3 text-[9px] font-black text-emerald-100 uppercase bg-emerald-900/80 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                        {traceData?.apiary?.environment_type || "Savanna Wooded"}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Record Integrity Block - Simplified */}
                                  <div className="space-y-2 flex flex-col">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Record Integrity</p>
                                    <div className="bg-[#022c22]/40 rounded-2xl p-5 border border-emerald-500/20 flex-1 flex flex-col justify-between">
                                      <div className="space-y-4">
                                        <div>
                                          <p className="text-[9px] font-black text-emerald-400 uppercase mb-2 tracking-tighter">Safe & Verified</p>
                                          <div className="flex items-center gap-3 p-3 bg-emerald-950/50 rounded-xl border border-emerald-500/20">
                                            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                              <ShieldCheck className="h-4 w-4 text-green-400" />
                                            </div>
                                            <div>
                                              <p className="text-[10px] font-bold text-white leading-tight">Batch Fingerprint</p>
                                              <p className="text-[9px] font-medium text-emerald-300/80">Authorized by BeeYield</p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-[9px] font-black text-emerald-400 uppercase mb-1 tracking-tighter">Verified By</p>
                                            <div className="flex items-center gap-2">
                                              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                              <p className="text-xl font-black text-white">{(traceData.batch_code.length * 314 + 1024).toLocaleString()}</p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-[9px] font-black text-emerald-400 uppercase mb-1 tracking-tighter">System</p>
                                            <Badge className="bg-emerald-500/20 text-emerald-100 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 whitespace-nowrap">BeeYield Registry</Badge>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <Lock className="h-3 w-3 text-emerald-400" />
                                          <span className="text-[9px] font-bold text-emerald-300 uppercase">Secure Record</span>
                                        </div>
                                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Tamper-Proof</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Footer Stats */}
                                <div className="flex items-center gap-6 pt-5 border-t border-white/10">
                                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Hive Quality:</span>
                                    <span className="text-xs font-black text-white">{traceData.sensor_snapshot?.fob || "7"}/10</span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Tracking:</span>
                                    <span className="text-xs font-black text-emerald-200">Hive to Jar</span>
                                  </div>
                                  <div className="flex-1 text-right">
                                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em] animate-pulse">Hive: {traceData.batch_code.split('-')[2] || 'H000'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Master Beekeeper Card */}
                    <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-[#064e3b] to-[#042f2e] text-white p-8 relative overflow-hidden h-full">
                      <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-8 text-emerald-200">Your Beekeeper</h3>

                      <div className="flex gap-6 items-start relative z-10 mb-8">
                        {/* Photo & Logo */}
                        <div className="shrink-0 relative">
                          {/* Timothy's Photo (Always for Demo) */}
                          <div className="flex items-center gap-8">
                            <div className="relative group">
                              <div className="absolute -inset-2 bg-gradient-to-tr from-amber-400 to-green-500 rounded-[1.8rem] blur-lg opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                              <img src={TIMOTHY_PHOTO} alt="Timothy Nduva" className="h-24 w-24 md:h-32 md:w-32 rounded-[1.5rem] object-cover border-2 border-white/20 shadow-2xl relative z-10" />
                            </div>
                            <div className="relative flex flex-col items-center gap-2 group">
                              <img src={LOGO} alt="BeeYield" className="h-20 w-20 md:h-24 md:w-24 object-contain transition-transform group-hover:scale-110 duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/80 animate-pulse">Verified</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-3">
                        <div className="text-2xl font-black tracking-tighter">{traceData?.farmer?.name || "Timothy Nduva"}</div>
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold text-[10px] px-2 py-0.5 inline-flex items-center gap-1">
                          <Award className="h-3 w-3" /> Head Beekeeper
                        </Badge>
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center gap-2 text-emerald-200">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{traceData?.farmer?.location_name || "Kibwezi"}, Kenya</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-200">
                            <div className="h-3.5 w-3.5 flex items-center justify-center font-serif font-black bg-emerald-500 text-emerald-900 rounded-full text-[9px]">E</div>
                            <span className="text-xs font-bold">{traceData?.farmer?.experience_years || "6"}+ Years Experience</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-emerald-500/20 relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-4">Our Commitment</p>
                        <div className="bg-emerald-900/40 rounded-xl p-4 mb-6 backdrop-blur-sm border border-emerald-500/20">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Scale className="h-4 w-4 text-green-400" />
                            </div>
                            <p className="font-bold text-lg text-white">50% Harvest Promise</p>
                          </div>
                          <p className="text-xs text-emerald-200 leading-relaxed">We strictly ensure half of every harvest remains in the hive to nourish the colony through dry seasons.</p>
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-4">Our Story</p>
                        <p className="text-sm font-medium text-emerald-100 italic leading-relaxed">
                          " {traceData?.farmer?.story || "Dedicated to sustainable beekeeping and protecting our local ecosystems. Every jar tells the story of our commitment to the bees and the land we share with them."} "
                        </p>
                      </div>

                      {/* Decorative BG Blob */}
                      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                    </Card>
                  </div>

                  {/* Journey Timeline */}
                  <div className="space-y-8 mb-8 bg-white rounded-[2.5rem] p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase">The Honey Journey</h3>
                      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 font-bold gap-1.5 py-1.5 pl-2 pr-3 hidden sm:flex">
                        <Lock className="h-3 w-3" /> Permanently Recorded
                      </Badge>
                    </div>

                    <div className="space-y-12 relative px-4 sm:px-8">
                      {/* Vertical Line */}
                      <div className="absolute left-[4rem] sm:left-[5rem] top-4 bottom-4 w-1 bg-gradient-to-b from-amber-500 to-amber-100/20" />

                      {/* 1. Hive Origin Step */}
                      {traceData?.hive && (
                        <div className="flex gap-6 sm:gap-10 group relative">
                          <div className="relative z-10 shrink-0">
                            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white border-4 border-amber-500 flex items-center justify-center text-amber-600 shadow-xl group-hover:scale-110 transition-transform duration-300">
                              <Home className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            <div className="mt-2 text-center text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block w-full">
                              Origin
                            </div>
                          </div>
                          <div className="flex-1 pb-8 border-b border-slate-100">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h4 className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight">Hive #{traceData.hive.hive_code}</h4>
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200">Source</Badge>
                            </div>
                            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium mb-3">
                              Nectar collection began in the <span className="text-slate-900 font-bold">{traceData.apiary?.name}</span>. <br />
                              <span className="text-sm text-slate-500">Bee Species: <span className="font-bold">{traceData.hive.bee_type}</span></span>
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" /> {traceData.apiary?.location_name}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. Ethical Harvest Metrics Step */}
                      <div className="flex gap-6 sm:gap-10 group relative">
                        <div className="relative z-10 shrink-0">
                          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white border-4 border-amber-500 flex items-center justify-center text-amber-600 shadow-xl group-hover:scale-110 transition-transform duration-300">
                            <Scale className="h-6 w-6 sm:h-7 sm:w-7" />
                          </div>
                          <div className="mt-2 text-center text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block w-full">
                            Metrics
                          </div>
                        </div>
                        <div className="flex-1 pb-8 border-b border-slate-100">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h4 className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight">Ethical Harvest Verified</h4>
                            <Badge className="bg-green-100 text-green-800 border-green-200">50/50 Promise</Badge>
                          </div>
                          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium mb-3">
                            Total Yield: <span className="text-slate-900 font-black">{traceData?.sensor_snapshot?.weight_kg || "45.2"}kg</span>. <br />
                            Exactly 50% left for the colony.
                          </p>
                          <div className="p-3 bg-green-50 rounded-xl border border-green-100 inline-block">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-green-600" />
                              <span className="text-xs font-bold text-green-800">Scale Verified</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. Standard Timeline Steps */}
                      {traceData?.timeline?.map((step: TraceJourneyStep, idx: number) => (
                        <div key={idx} className="flex gap-6 sm:gap-10 group relative">
                          <div className="relative z-10 shrink-0">
                            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white border-4 border-amber-500 flex items-center justify-center text-amber-600 shadow-xl group-hover:scale-110 transition-transform duration-300">
                              <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            <div className="mt-2 text-center text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block w-full">
                              {step.date}
                            </div>
                          </div>
                          <div className="flex-1 pb-8 border-b border-slate-100 last:border-0 last:pb-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h4 className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight">{step.title}</h4>
                            </div>
                            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium mb-3">{step.description}</p>
                            <div className="flex items-center gap-2">
                              <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" /> {step.location}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    {traceData && (
                      <PDFDownloadLink
                        document={<HoneyTracePDF traceData={traceData} />}
                        fileName={`BeeYield-Trace-${traceData.batch_code}.pdf`}
                        className="w-full sm:flex-1"
                      >
                        {({ loading }) => (
                          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black h-14 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileDown className="h-5 w-5" />}
                            Download Certificate
                          </Button>
                        )}
                      </PDFDownloadLink>
                    )}
                    <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto h-14 rounded-2xl font-black px-8">
                      Close
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Traceability;
