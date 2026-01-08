import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, ArrowRight, Cpu, Eye, Zap, Target,
  Activity, Database, Shield, BarChart3, Radio,
  Smartphone, Globe, Award, Sparkles, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

const PollinationSolutions = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-slate-950">
        {/* Abstract Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] -ml-64 -mb-64" />
          <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-6 py-2 text-sm font-black uppercase tracking-widest">
              Digital Pollination Ecosystem
            </Badge>
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">
              One Platform. <br />
              <span className="text-primary italic">Unlimited</span> Yield.
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed">
              BeeYield doesn't just manage bees; we manage outcomes. Choose the path that leads to your most successful harvest yet.
            </p>
          </div>
        </div>
      </section>

      {/* The Two Paths Section */}
      <section className="py-24 bg-background relative -mt-16 z-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* path 1: In-Hive Precision */}
            <Card className="group relative overflow-hidden border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[3rem] p-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-honey-light opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative z-10 bg-white dark:bg-gray-950 rounded-[2.9rem] p-10 md:p-14 h-full flex flex-col">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                  <Cpu className="h-10 w-10 text-primary dark:text-primary group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 space-y-6">
                  <h3 className="text-4xl font-black tracking-tight text-foreground">In-Hive <br /><span className="text-primary">Precision</span></h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    X-ray vision into every hive. Monitor colony health, population dynamics, and queen status in real-time using in-hive sensors.
                  </p>
                  <ul className="space-y-4">
                    {["Acoustic Health Monitoring", "Internal Temp & Humidity", "Population Velocity Tracking", "Instant Hive Replacements"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button asChild size="lg" className="mt-12 bg-primary hover:bg-primary/90 text-white w-full h-16 text-lg font-black rounded-2xl">
                  <Link to="/precision-pollination">
                    Explore In-Hive Technology
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Path 2: In-Field Insights */}
            <Card className="group relative overflow-hidden border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[3rem] p-1">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary to-nature-green opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative z-10 bg-white dark:bg-gray-950 rounded-[2.9rem] p-10 md:p-14 h-full flex flex-col">
                <div className="w-20 h-20 rounded-2xl bg-nature-green/10 dark:bg-nature-green/20 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                  <Eye className="h-10 w-10 text-nature-green dark:text-nature-green-light group-hover:text-nature-green transition-colors" />
                </div>
                <div className="flex-1 space-y-6">
                  <h3 className="text-4xl font-black tracking-tight text-foreground">In-Field <br /><span className="text-nature-green">Insights</span></h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Measure the work where it happens. Track per-flower bee visits, identify coverage gaps, and optimize hive placement across every acre.
                  </p>
                  <ul className="space-y-4">
                    {["Flower Visitation Metrics", "Pollination Heatmaps", "Foraging Range Analysis", "Yield/Visitation Correlation"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground">
                        <Check className="h-5 w-5 text-secondary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button asChild size="lg" className="mt-12 bg-nature-green hover:bg-nature-green-light text-white w-full h-16 text-lg font-black rounded-2xl">
                  <Link to="/in-land-pollination">
                    Explore Field Analytics
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Unified Platform Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="space-y-8">
              <Badge variant="outline" className="text-primary border-primary/30">Total Visibility</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">The Power of Both</h2>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                Combine In-Hive health data with In-Field activity metrics for the ultimate pollination protocol.
                Identify precisely why certain areas are underperforming and resolve it instantly.
              </p>
              <div className="space-y-4 pt-4">
                {[
                  { icon: Zap, text: "Instant actionable insights on mobile" },
                  { icon: Target, text: "Surgical precision in hive placement" },
                  { icon: Shield, text: "Complete harvest insurance through data" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[4rem] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-12 border border-border shadow-soft">
                <Globe className="h-48 w-48 text-primary animate-pulse opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full p-8 space-y-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-border flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Global Colonies</p>
                        <p className="text-2xl font-black">10,000+</p>
                      </div>
                      <Award className="h-8 w-8 text-primary" />
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-border flex items-center justify-between ml-12">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Data Points/Sec</p>
                        <p className="text-2xl font-black">2.4M</p>
                      </div>
                      <Activity className="h-8 w-8 text-secondary" />
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-border flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Countries Active</p>
                        <p className="text-2xl font-black">12+</p>
                      </div>
                      <Globe className="h-8 w-8 text-nature-green" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Logos/System Logos */}
      <section className="py-24 border-y border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-12">Powered By Industry Leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2">
              <Smartphone className="h-8 w-8" />
              <span className="text-2xl font-black italic">ApiSense.io</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="h-8 w-8" />
              <span className="text-2xl font-black italic">HiveGate™</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="h-8 w-8" />
              <span className="text-2xl font-black italic">LoRaWAN</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-8 w-8" />
              <span className="text-2xl font-black italic">AgriCloud</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-[100px] -ml-48 -mb-48" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center space-y-10">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter">Ready for the <br /> Future of Farming?</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-medium">
            Contact our pollination agronomists today for a custom consultation and see how BeeYield can transform your harvest.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/contact">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-xl font-black h-20 px-12 rounded-2xl shadow-2xl">
                Get a Custom Quote
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link to="/pollination-request">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-xl font-black h-20 px-12 rounded-2xl">
                Book Service Online
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PollinationSolutions;
