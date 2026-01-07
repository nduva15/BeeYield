
import React, { useEffect } from "react";
import {
  Mic, Map, LayoutDashboard, ArrowRight,
  Quote, Activity, Mail, ChevronRight,
  BarChart3, Signal, Play, Star, Zap, Cpu, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const InLandPollination = () => {
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

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Almond Grower, Central Valley CA",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
      quote: "PLIP gave us visibility we never had before. We identified a cold spot in the north orchard immediately and optimized our hive placement, resulting in a 15% yield increase."
    },
    {
      name: "Miguel Rodriguez",
      role: "Blueberry Farm Owner, WA",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      quote: "The acoustic monitoring is game-changing. Knowing exactly when the bees are active helps us time our nutrient sprays perfectly to avoid disrupting pollination."
    },
    {
      name: "David Chen",
      role: "Seed Producer, OR",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
      quote: "Real-time data on the dashboard allowed us to catch a weak pollination window early. We supplemented the hives within 24 hours and saved the season."
    }
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-white">
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-KF284247"
          height="0" width="0" style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        ></iframe>
      </noscript>

      {/* Hero Section - Ultra Premium */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0A0A0A] text-white py-24">
        <div className="container mx-auto px-4 relative z-20">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-6 py-2 text-sm font-black uppercase tracking-widest">
                Agricultural Intelligence
              </Badge>
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8]">
                PLIP <br />
                <span className="text-primary italic">Platform</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/60 max-w-xl font-medium leading-relaxed">
                The Pollination Land Insight Platform delivers surgical data on per-flower bee visits, giving you the power to see and save your harvest.
              </p>
              <div className="flex flex-wrap gap-6 pt-6">
                <Button size="lg" className="h-16 px-12 bg-primary hover:bg-white hover:text-primary text-white font-black text-xl rounded-2xl shadow-glow transition-all" asChild>
                  <Link to="/PollinationRequest">Get Early Access</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-12 border-white/20 hover:bg-white hover:text-black font-black text-xl rounded-2xl transition-all gap-3">
                  <Play className="h-6 w-6" /> Watch Demo
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-[4rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-white/10 p-12 flex items-center justify-center relative overflow-hidden group">
                <Signal className="h-64 w-64 text-primary animate-pulse opacity-40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1),transparent)]" />

                <div className="absolute top-10 right-10 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 animate-float">
                  <Activity className="h-8 w-8 text-primary mb-3" />
                  <p className="text-xs font-black uppercase tracking-widest text-white/40">Real-time Visiblity</p>
                  <p className="text-2xl font-black text-white">98.4% Accuracy</p>
                </div>

                <div className="absolute bottom-10 left-10 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 animate-float-delayed">
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-6 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/40">Acoustic Signature</p>
                  <p className="text-2xl font-black text-white">Detecting Flight</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient background */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[150px] -mr-[25vw] -mt-[25vw]" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-accent/5 rounded-full blur-[150px] -ml-[25vw] -mb-[25vw]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10 pointer-events-none" />
      </section>

      {/* Narrative Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-24 items-center max-w-7xl mx-auto">
            <div className="relative">
              <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl skew-y-2">
                <img
                  src="https://images.unsplash.com/photo-1547514701-42782101795e?w=800"
                  alt="Farm Land"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
            </div>
            <div className="space-y-8">
              <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 px-4">Why PLIP?</Badge>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">Hear the bees, <br /><span className="text-primary italic">see the yield</span>.</h2>
              <p className="text-xl text-muted-foreground leading-relaxed font-secondary">
                BeeYield's Pollination Land Insight Platform (PLIP) uses proprietary acoustic AI to measure bee activity at the flower level. This isn't just data; it's the heartbeat of your farm.
              </p>
              <div className="bg-muted/50 p-10 rounded-[3rem] border-l-8 border-primary relative">
                <Quote className="absolute top-6 right-10 h-20 w-20 text-primary/10" />
                <p className="text-2xl font-black italic text-foreground mb-6 leading-relaxed relative z-10">
                  "PLIP lets us see the actual number of bees that visit the flowers. Now I can check the amount of pollination in our lands 24/7."
                </p>
                <div>
                  <p className="font-black text-primary text-xl tracking-tighter">Avi Gabai</p>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1">Hazera Seed Production Israel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Cards */}
      <section className="py-32 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="border-none shadow-soft hover:shadow-glow transition-all duration-700 bg-white rounded-[4rem] group overflow-hidden">
              <CardContent className="p-16">
                <div className="bg-primary/10 w-24 h-24 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Mic className="h-12 w-12" />
                </div>
                <h3 className="text-4xl font-black mb-6 tracking-tight">Sonic Vision</h3>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium mb-10">
                  Equipped with industrial-grade outdoor enclosures, our sensors use custom algorithms tuned to detect the unique frequency of bee flight among field noise.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary font-black uppercase text-xs tracking-widest hover:gap-4 transition-all group/link">
                  Technical Specs <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft hover:shadow-glow transition-all duration-700 bg-white rounded-[4rem] group overflow-hidden">
              <CardContent className="p-16">
                <div className="bg-accent/10 w-24 h-24 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-accent group-hover:text-amber-900 transition-all duration-500">
                  <Map className="h-12 w-12" />
                </div>
                <h3 className="text-4xl font-black mb-6 tracking-tight">Network Visibility</h3>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium mb-10">
                  Visualize foraging efficiency and bloom synchronization in real-time. Know exactly which acres are being underserved before it's too late.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary font-black uppercase text-xs tracking-widest hover:gap-4 transition-all group/link">
                  Explore Heatmaps <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-32 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-32 items-center max-w-7xl mx-auto">
            <div className="order-2 lg:order-1">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[3.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-[#1A1A1A] rounded-[3rem] p-4 border border-white/10 shadow-3xl overflow-hidden aspect-video flex items-center justify-center">
                  <div className="w-full space-y-4 p-8">
                    <div className="flex justify-between items-center mb-8">
                      <div className="h-6 w-32 bg-white/10 rounded-full" />
                      <div className="h-10 w-10 bg-primary/20 rounded-xl" />
                    </div>
                    <div className="flex items-end gap-3 h-48">
                      {[60, 40, 90, 70, 50, 80, 40, 60, 50, 70].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary rounded-t-lg transition-all duration-1000 group-hover:scale-y-110 origin-bottom" style={{ height: `${h}%`, opacity: h / 100 }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[2rem] shadow-2xl rotate-3 text-foreground">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Bee Traffic</p>
                  <p className="text-5xl font-black text-primary tracking-tighter">42.8</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Visits / Minute</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-10">
              <Badge className="bg-primary text-white font-black px-6 py-2 uppercase tracking-widest">The Command Center</Badge>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.8]">One View. <br /> Total <span className="text-primary italic">Control</span>.</h2>
              <p className="text-xl text-white/50 leading-relaxed font-medium">
                Compare genetic strains, track production practices, and correlate output rates in real-time. PLIP turns your land into a predictable factory of growth.
              </p>
              <ul className="space-y-6">
                {['Compare genetic strain impact', 'Filter by production practices', 'Real-time bloom tracking'].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-xl font-bold">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Check className="h-5 w-5" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-7xl font-black text-center mb-24 tracking-tighter">The Proof</h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="group flex flex-col items-center text-center space-y-8 p-12 rounded-[4rem] hover:bg-muted/30 transition-all duration-500">
                <div className="relative">
                  <img src={t.image} alt={t.name} className="h-24 w-24 rounded-[2rem] object-cover ring-8 ring-primary/5 group-hover:ring-primary/10 transition-all" />
                  <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg">
                    <Quote className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xl font-medium italic text-muted-foreground leading-relaxed">"{t.quote}"</p>
                <div>
                  <p className="text-2xl font-black text-foreground">{t.name}</p>
                  <p className="text-xs font-black uppercase tracking-widest text-primary mt-1">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Expansion */}
      <section className="py-32 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <Globe className="h-20 w-20 text-primary mx-auto mb-10 animate-bounce-subtle" />
          <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tight">Deploy Anywhere.</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium mb-12 italic">
            From the Central Valley of California to the highlands of Kenya, PLIP is designed to survive the elements and deliver the results.
          </p>
          <Button size="lg" className="h-16 px-12 bg-foreground text-background font-black text-xl rounded-2xl shadow-premium hover:bg-primary transition-all">
            Contact Global Sales
          </Button>
        </div>
      </section>
    </div>
  );
};

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default InLandPollination;