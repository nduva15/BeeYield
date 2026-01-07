import { useEffect } from "react";
import {
  Cpu, Wifi, LayoutDashboard, ArrowRight,
  Quote, Check, BookOpen, Mail, ChevronRight,
  BarChart3, Thermometer, Mic, Zap, Shield, Database, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const PrecisionPollination = () => {
  useEffect(() => {
    // Inject GTM script into head
    const script = document.createElement('script');
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-KF284247');`;
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-KF284247"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        ></iframe>
      </noscript>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-primary/5 to-background py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-6 py-2 rounded-2xl font-black uppercase tracking-widest shadow-sm">
                In-Hive IoT Intelligence
              </Badge>
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none">
                Precision <br />
                <span className="text-primary italic">Pollination</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl font-medium leading-relaxed">
                The strongest bees, backed by surgical data. We turn pollination from a gamble into a guarantee through real-time hive monitoring.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Button size="lg" className="h-16 px-10 text-xl font-black shadow-glow group" asChild>
                  <Link to="/contact">Get Consultation <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-black border-2" asChild>
                  <Link to="/PollinationRequest">Book Pollination</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-[4rem] bg-white shadow-premium flex items-center justify-center p-20 border border-border group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <Cpu className="h-48 w-48 text-primary animate-pulse" />

                {/* Floating Metric Badges */}
                <div className="absolute top-12 left-12 bg-white p-6 rounded-3xl shadow-xl border border-border animate-float-delayed">
                  <Thermometer className="h-8 w-8 text-primary mb-2" />
                  <p className="text-xs font-black uppercase text-muted-foreground">Internal Temp</p>
                  <p className="text-2xl font-black">35.4°C</p>
                </div>

                <div className="absolute bottom-12 right-12 bg-white p-6 rounded-3xl shadow-xl border border-border animate-float">
                  <Activity className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-xs font-black uppercase text-muted-foreground">Colony Status</p>
                  <p className="text-2xl font-black">Optimal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter">What is <span className="text-primary italic">Precision Pollination?</span></h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">
              It's a revolutionary way to handle commercial pollination. For the first time, growers get full visibility into the hives they rent, ensuring they pay for pollination power, not just boxes.
            </p>
            <div className="bg-muted/30 p-12 rounded-[3.5rem] border-l-8 border-primary relative">
              <Quote className="absolute top-8 right-12 h-20 w-20 text-primary/10" />
              <p className="text-2xl font-black italic text-foreground mb-8 leading-relaxed relative z-10">
                "Our commitment to our growers is to bring them unprecedented transparency for the most effective pollination outcomes."
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-left font-black">
                  <p className="text-primary">Ze'ev Barylka</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">BeeYield Chief Sales Officer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hardware Breakdown */}
      <section className="py-32 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="border-none shadow-soft hover:shadow-glow transition-all duration-700 bg-white rounded-[3.5rem] p-16 group">
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Mic className="h-12 w-12" />
              </div>
              <h3 className="text-4xl font-black mb-6">In-Hive Sensor</h3>
              <p className="text-lg text-muted-foreground font-medium mb-10 leading-relaxed">
                Captures temperature, humidity, and the acoustic signature of the hive. Using AI to decode colony health through sound.
              </p>
              <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                System Specification <ChevronRight className="h-4 w-4" />
              </div>
            </Card>

            <Card className="border-none shadow-soft hover:shadow-glow transition-all duration-700 bg-white rounded-[3.5rem] p-16 group">
              <div className="w-24 h-24 bg-accent/10 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-accent group-hover:text-amber-900 transition-all duration-500">
                <Wifi className="h-12 w-12" />
              </div>
              <h3 className="text-4xl font-black mb-6">Gateway Unit</h3>
              <p className="text-lg text-muted-foreground font-medium mb-10 leading-relaxed">
                Acts as a central hub, collecting data via Bluetooth™ from internal sensors and securely uploading it to the cloud.
              </p>
              <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                Connectivity Overview <ChevronRight className="h-4 w-4" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Visibility Section */}
      <section className="py-32 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-24 items-center max-w-7xl mx-auto">
            <div className="space-y-10">
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.8]">
                Do You <span className="text-primary italic">Actually</span> Know What's in the Box?
              </h2>
              <p className="text-2xl font-black text-primary italic">We do.</p>
              <p className="text-xl text-white/60 font-medium leading-relaxed">
                When you pollinate with BeeYield, you stop paying for boxes and start paying for actual pollination power. We replace any non-performing hives with stronger ones, guaranteed.
              </p>
              <ul className="space-y-6">
                {['Frames-per-acre count audit', 'Real-time activity heatmaps', 'Automated hive replacement'].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-xl font-bold">
                    <Check className="h-6 w-6 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-[#1A1A1A] rounded-[4rem] p-10 border border-white/10 shadow-3xl aspect-square flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <Badge className="bg-primary/20 text-white border-primary/40">Real-time Feed</Badge>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-white/40">Live</span>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="h-12 w-full bg-white/5 rounded-2xl animate-pulse" style={{ width: '80%' }} />
                  <div className="h-12 w-full bg-white/5 rounded-2xl animate-pulse" style={{ width: '60%' }} />
                  <div className="h-12 w-full bg-white/5 rounded-2xl animate-pulse" style={{ width: '90%' }} />
                </div>
                <div className="p-8 bg-primary rounded-3xl text-center">
                  <p className="text-white font-black text-3xl">99.8% Connectivity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Success */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">Your Success is Our <span className="text-primary italic">Obsession</span></h2>
          <p className="text-xl text-muted-foreground font-medium mb-12">
            Our Customer Success team is ready to provide you with all the help you need, from onboarding to contract management.
          </p>
          <Button variant="outline" size="lg" className="h-16 px-12 border-2 font-black text-lg gap-3" asChild>
            <a href="mailto:info@beeyield.com"><Mail className="h-6 w-6" /> Talk to Customer Success</a>
          </Button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-primary text-white text-center rounded-t-[5rem]">
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-10">Ready for Precision?</h2>
        <Button size="lg" className="h-20 px-16 text-2xl font-black bg-white text-primary hover:bg-white/90 shadow-2xl" asChild>
          <Link to="/contact">Get a Free Consultation</Link>
        </Button>
      </section>
    </div>
  );
};

export default PrecisionPollination;
