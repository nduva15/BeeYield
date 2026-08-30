import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Activity, Sprout, BarChart3,
  Cpu, Wifi, Check, Shield, Globe,
  BookOpen, Heart, AlertTriangle, MapPin, Mail,
  ChevronLeft, ChevronRight, Play, Pause
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { IN_HIVE_FIELD_SLIDES } from "@/data/pollinationContent";

const InHiveHardwareSlideshow = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % IN_HIVE_FIELD_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const slide = IN_HIVE_FIELD_SLIDES[activeIdx];

  return (
    <section className="py-24 bg-neutral-900 text-white relative overflow-hidden border-y border-neutral-800">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10 pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-4 px-4 py-1.5 font-semibold text-[10px] rounded-full">
            In-Hive Telemetry & Field Hardware
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
            Deployed Devices <span className="text-beeyield-green">&amp; Active Colonies</span>
          </h2>
          <div className="h-1 w-20 bg-beeyield-green mx-auto mb-5 rounded-full" />
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
            Real photography from commercial Kenyan apiaries showing solar LTE gateway nodes, under-hive continuous load cells, and non-invasive telemetry probes integrated into live brood frames.
          </p>
        </div>

        {/* Slideshow Frame */}
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8 items-center bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-6 md:p-8 shadow-2xl">
            {/* Image Box */}
            <div className="lg:col-span-7 relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-neutral-950 flex items-center justify-center group">
              <motion.img
                key={activeIdx}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4">
                <Badge className="bg-beeyield-green text-neutral-950 font-bold px-3 py-1 text-[10px] uppercase tracking-wider">
                  {slide.badge}
                </Badge>
              </div>

              {/* Prev / Next */}
              <button
                onClick={() => {
                  setActiveIdx((prev) => (prev - 1 + IN_HIVE_FIELD_SLIDES.length) % IN_HIVE_FIELD_SLIDES.length);
                  setIsPlaying(false);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-beeyield-green hover:text-black transition-all"
                aria-label="Previous hardware slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActiveIdx((prev) => (prev + 1) % IN_HIVE_FIELD_SLIDES.length);
                  setIsPlaying(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-beeyield-green hover:text-black transition-all"
                aria-label="Next hardware slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Info Panel */}
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-between h-full py-2">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-beeyield-green uppercase tracking-widest">
                    Hardware Stream {activeIdx + 1} / {IN_HIVE_FIELD_SLIDES.length}
                  </span>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[10px] font-semibold text-neutral-300 hover:text-white hover:bg-white/20 transition-all"
                  >
                    {isPlaying ? <Pause className="w-3 h-3 text-beeyield-green" /> : <Play className="w-3 h-3 text-beeyield-green" />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
                  {slide.title}
                </h3>
                <p className="text-neutral-300 text-xs font-medium mb-3 leading-relaxed">
                  {slide.subtitle}
                </p>
                <p className="text-neutral-400 text-xs leading-relaxed border-l-2 border-beeyield-green/40 pl-3">
                  {slide.description}
                </p>
              </div>

              {/* Thumbnails */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Telemetry Channels:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {IN_HIVE_FIELD_SLIDES.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveIdx(idx);
                        setIsPlaying(false);
                      }}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden border transition-all ${
                        activeIdx === idx
                          ? "border-beeyield-green ring-2 ring-beeyield-green/50 scale-105"
                          : "border-white/10 opacity-50 hover:opacity-100 hover:border-white/30"
                      }`}
                    >
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PollinationSolutions = () => {
  const [supportType, setSupportType] = useState("monthly");

  return (
    <BeeYieldPageShell className="pt-8 p-0">
      {/* Hub Hero */}
      <section className="relative py-24 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            End-to-End Visibility
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
            Pollination Solutions
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mb-10">
            We combine biological understanding with technological innovation to monitor pollination from the inside out.
          </p>
        </div>
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      </section>

      {/* The Two Paths Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">

            {/* Path 1: In-Hive */}
            <div className="relative group rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              <div className="p-8 md:p-12 flex flex-col h-full bg-card relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Cpu className="h-8 w-8 text-primary" />
                </div>

                <h2 className="text-3xl font-bold mb-4 text-foreground">In-Hive Precision</h2>
                <p className="text-lg text-muted-foreground mb-8 flex-grow">
                  Our proprietary sensors live inside the hive box, monitoring acoustic signatures, temperature, and humidity 24/7. Know the strength of your colonies before they are deployed.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#1B9157] flex-shrink-0" />
                    <span className="font-medium text-foreground">Queen health status</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#1B9157] flex-shrink-0" />
                    <span className="font-medium text-foreground">Colony strength grading</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#1B9157] flex-shrink-0" />
                    <span className="font-medium text-foreground">Environmental stress alerts</span>
                  </div>
                </div>

                <Button size="lg" className="w-full gap-2" asChild>
                  <Link to="/precision-pollination">Explore In-Hive Technology <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>

              {/* Background Image Overlay with Real Bees and In-Hive Sensor */}
              <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <img
                  src="/images/pollination/hive-comb-inspection-6.png"
                  className="w-full h-full object-cover"
                  alt="Real in-hive telemetry sensor with live bees on comb"
                />
              </div>
            </div>

            {/* Path 2: In-Field */}
            <div className="relative group rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-2 bg-accent-foreground"></div>
              <div className="p-8 md:p-12 flex flex-col h-full bg-card relative z-10">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Wifi className="h-8 w-8 text-accent-foreground" />
                </div>

                <h2 className="text-3xl font-bold mb-4 text-foreground">In-Field Insights</h2>
                <p className="text-lg text-muted-foreground mb-8 flex-grow">
                  Sensors deployed across your orchards measure actual bee flight activity and pollination events. Visualize coverage maps to ensure every acre gets the attention it needs.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#1B9157] flex-shrink-0" />
                    <span className="font-medium text-foreground">Real-time pollination maps</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#1B9157] flex-shrink-0" />
                    <span className="font-medium text-foreground">Foraging efficiency tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#1B9157] flex-shrink-0" />
                    <span className="font-medium text-foreground">Weather impact analysis</span>
                  </div>
                </div>

                <Button size="lg" variant="outline" className="w-full gap-2 border-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground hover:text-background" asChild>
                  <Link to="/in-land-pollination">Explore In-Field Technology <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>

              {/* Background Image Overlay with Real Solar IoT Gateway */}
              <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <img
                  src="/images/pollination/gateway-solar-node.png"
                  className="w-full h-full object-cover"
                  alt="Solar LTE IoT Gateway deployed on hive"
                />
              </div>
            </div>

            {/* Path 3: Disease & Health */}
            <div className="relative group rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-2 bg-green-600"></div>
              <div className="p-8 md:p-12 flex flex-col h-full bg-card relative z-10">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-[#1B9157]" />
                </div>

                <h2 className="text-3xl font-bold mb-4 text-foreground">Diseases</h2>
                <p className="text-lg text-muted-foreground mb-8 flex-grow">
                  Early warnings for hive health. Detect disease risk sooner and monitor colony conditions with clear alerts.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#1B9157] flex-shrink-0" />
                    <span className="font-medium text-foreground">Early disease detection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#1B9157] flex-shrink-0" />
                    <span className="font-medium text-foreground">Colony health grading</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#1B9157] flex-shrink-0" />
                    <span className="font-medium text-foreground">Reduced chemical use</span>
                  </div>
                </div>

                <Button size="lg" variant="outline" className="w-full gap-2 border-[#1B9157] text-[#1B9157] hover:bg-green-600 hover:text-[#1A1A1A]" asChild>
                  <Link to="/diseases">Explore hive health <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>

              {/* Background Image Overlay with Real Pathogen Screening */}
              <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <img
                  src="/images/diseases/hive-inspection-3.png"
                  className="w-full h-full object-cover"
                  alt="Brood health and pathogen telemetry sensor"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20 bg-background p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-4">Try BeeYield in your apiary</h2>
            <p className="text-muted-foreground mb-6">
              BeeYield is constantly evolving. We invite you to take part in the international testing of our system ΓÇô together, we can advance technology that protects bees worldwide.
            </p>
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/contact">Join the Program</Link>
            </Button>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">We are building a global network of partners</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
              BeeYield collaborates with leading partners worldwide, joining forces with beekeeping equipment manufacturers, industry organizations, and renowned universities.
            </p>
            {/* Partners */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 items-center opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-lg">Farmers</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-lg">ApiSense</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-lg">Monitored Hives</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Platform Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-background border border-primary/20 text-primary">
              The BeeYield Platform
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-foreground">Better Together</h2>
            <p className="text-lg text-muted-foreground">
              In-Hive and In-Field work even better together, giving growers and beekeepers a full picture from hive to crop.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Monitor</h3>
              <p className="text-muted-foreground">Track hive health and field conditions simultaneously.</p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
              <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Review</h3>
              <p className="text-muted-foreground">See how hive strength and bloom conditions relate to yield.</p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sprout className="h-6 w-6 text-[#1B9157]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Improve</h3>
              <p className="text-muted-foreground">Use what you learn to improve yield and bee health.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Real In-Hive Telemetry & Field Hardware Slideshow ── */}
      <InHiveHardwareSlideshow />

      {/* ── Global Hive Network Content (merged) ── */}

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-secondary via-background to-primary/10 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center max-w-4xl">
          <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
            A Global Effort
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight text-foreground px-2">
            Saving Africa and the World's Pollinators
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            BeeYield is leading the charge to address the pollinator crisis in Africa and the world, where 60% of bee colonies are lost annually and 75% of food crops depend on pollination.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button size="lg" asChild className="shadow-xl w-full sm:w-auto">
              <a href="#support-african-farmers">Support the Cause Today</a>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link to="/media">Read the Whitepaper</Link>
            </Button>
          </div>
          <div className="mt-12 pt-8 border-t border-primary/10 flex flex-col items-center">
            <p className="text-sm font-medium text-muted-foreground mb-4">Trusted By Global Leaders</p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 items-center opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center"><Globe className="h-4 w-4 text-primary" /></div>
                <span className="font-bold text-base text-foreground/80">Farmers</span>
              </div>
              <div className="w-px h-8 bg-primary/20 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center"><Activity className="h-4 w-4 text-primary" /></div>
                <span className="font-bold text-base text-foreground/80">ApiSense</span>
              </div>
              <div className="w-px h-8 bg-primary/20 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center"><Activity className="h-4 w-4 text-primary" /></div>
                <span className="font-bold text-base text-foreground/80">Monitored Hives</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5"></div>
      </section>

      {/* Video Section */}
      <YouTubeEmbed
        title="About BeeYield"
        wrapperClassName="h-[70vh] w-full rounded-none border-0 bg-foreground shadow-none"
        iframeClassName="opacity-100"
      />

      {/* Crisis Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1">
              <Card className="bg-background/10 border-background/20 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Global Emergency</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-background">The Bee Crisis</h3>
                  <p className="text-background/80 leading-relaxed mb-6">
                    Across Africa and the world, beekeepers are opening their hives to discover devastating losses. African bee colonies face unique challenges from climate change, habitat loss, and limited access to modern beekeeping technology.
                  </p>
                  <div className="bg-red-500/20 p-4 rounded-lg">
                    <p className="text-4xl font-bold text-red-400">60%</p>
                    <p className="text-sm text-background/70">Annual colony mortality rate in Africa</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold mb-6">The Pollination Crisis: <br />Food Security at Risk</h2>
              <p className="text-background/80 leading-relaxed mb-6">
                With 75% of food crops relying on pollinators, the decline of African bee populations threatens agricultural productivity, farmer livelihoods, and regional food security.
              </p>
              <p className="text-background/80 leading-relaxed mb-8">
                This isn't just about beesΓÇöit's about ensuring sustainable agriculture and food security for millions across Africa and the world.
              </p>
              <Button variant="secondary" className="gap-2" asChild>
                <Link to="/ourstory">Learn More <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Initiative & Goals */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">A Research-Based Approach to African Agriculture</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              BeeYield is bringing precision pollination to African farmers. We partner with local beekeepers and farming communities to monitor hive health, improve pollination, and raise yields for crops that feed millions.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-none shadow-xl text-center">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"><Globe className="h-8 w-8 text-primary" /></div>
                <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Goal 1</p>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Monitored Hives Network</h3>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Target: 2M hives</p>
                <p className="text-muted-foreground text-sm leading-relaxed">A network of sensor-equipped hives across Makueni and Kitui. Beekeepers get real-time colony health and pollination data.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl text-center">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"><Activity className="h-8 w-8 text-primary" /></div>
                <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Goal 2</p>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Health Monitoring</h3>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Target: 100M+ signals</p>
                <p className="text-muted-foreground text-sm leading-relaxed">Daily bee health data builds a clear picture of hive condition so farmers can time crop pollination better.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl text-center">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"><BookOpen className="h-8 w-8 text-primary" /></div>
                <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Goal 3</p>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Farmer Education</h3>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Target: 50K farmers</p>
                <p className="text-muted-foreground text-sm leading-relaxed">Training local farmers and beekeepers in sustainable pollination practices, improving yields for mangoes, beans, tomatoes, and sisal.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">Our Work Across Africa</h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-16" />
          <div className="space-y-16 max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 bg-green-100 text-[#1B9157] border-green-200"><MapPin className="h-3 w-3 mr-1" /> MAKUENI COUNTY</Badge>
                <h3 className="text-3xl font-bold mb-4 text-foreground">Improving Mango Pollination</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">In partnership with local mango growers in Makueni County, BeeYield is deploying hive sensors to track colony conditions during flowering.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> 40% increase in mango yields observed</li>
                  <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> Training 50+ local beekeepers</li>
                </ul>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl bg-neutral-900">
                <img src="/images/pollination/hive-comb-inspection-7.png" alt="In-hive telemetry sensor with bees building wax comb in Makueni mango orchard apiary" className="w-full h-[300px] object-cover" />
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-xl bg-neutral-900">
                <img src="/images/pollination/hive-scale-loadcell.png" alt="Electronic load cell scale mounted under hive floor in Kitui vegetable farm" className="w-full h-[300px] object-cover" />
              </div>
              <div className="order-1 lg:order-2">
                <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200"><MapPin className="h-3 w-3 mr-1" /> KITUI COUNTY</Badge>
                <h3 className="text-3xl font-bold mb-4 text-foreground">Improved Vegetable Production</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">Working with smallholder farmers in Kitui County, we're transforming bean and tomato production through precision pollination.</p>
                <blockquote className="border-l-4 border-primary pl-4 text-muted-foreground">
                  "With BeeYield's technology, we've seen 30% better pod development in our bean crops and more uniform tomato sizes."
                </blockquote>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 bg-amber-100 text-[#F4D03F] border-amber-200"><MapPin className="h-3 w-3 mr-1" /> MAKUENI COUNTY</Badge>
                <h3 className="text-3xl font-bold mb-4 text-foreground">Sisal &amp; Honey Production</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">BeeYield is pioneering dual-benefit pollination models in sisal plantations, creating additional income streams for local beekeepers and farmers.</p>
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/impact">Learn About Our Impact <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl bg-neutral-900">
                <img src="/images/pollination/gateway-solar-node.png" alt="Solar LTE IoT Gateway installed on hive in Sisal plantation apiary" className="w-full h-[300px] object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section id="support-african-farmers" className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-primary-foreground/80" />
            <h2 className="text-4xl font-bold mb-4 text-primary-foreground">Support African and World Farmers</h2>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Join our community of supporters strengthening pollinator health and food security across Makueni and Kitui Counties today.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-none shadow-2xl">
              <CardContent className="p-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-muted rounded-lg p-1 inline-flex">
                    <button onClick={() => setSupportType("onetime")} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${supportType === "onetime" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>One-time</button>
                    <button onClick={() => setSupportType("monthly")} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${supportType === "monthly" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>Monthly</button>
                  </div>
                </div>
                <div className="text-center mb-6">
                  <span className="text-5xl font-bold text-foreground">{supportType === "monthly" ? "$10" : "$50"}</span>
                  {supportType === "monthly" && <span className="text-muted-foreground">/mo</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Fund sensor deployment</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Support beekeeper education</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Receive impact reports</li>
                </ul>
                <Button className="w-full" asChild><Link to="/contact">Support</Link></Button>
              </CardContent>
            </Card>
            <Card className="border-2 border-primary shadow-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-primary text-primary-foreground">Most Popular</Badge></div>
              <CardContent className="p-8 pt-10">
                <h3 className="text-xl font-bold text-center mb-6 text-foreground">Patron of the Hive</h3>
                <div className="text-center mb-6">
                  <span className="text-5xl font-bold text-foreground">{supportType === "monthly" ? "$100" : "$500"}</span>
                  {supportType === "monthly" && <span className="text-muted-foreground">/mo</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Partner with a monitored hive</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Access to webinars &amp; events</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Exclusive network insights</li>
                </ul>
                <Button className="w-full" asChild><Link to="/contact">Support</Link></Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Join Our Network</h2>
            <p className="text-muted-foreground">Interested in updates about bee health, pollination research, and agricultural innovations? Stay connected with BeeYield's work.</p>
          </div>
          <Card className="border-none shadow-xl">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="networkEmail">Email *</Label>
                  <Input id="networkEmail" type="email" placeholder="info@beeyield.com" required />
                </div>
                <Button type="submit" className="w-full">
                  <Mail className="h-4 w-4 mr-2" /> Submit
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default PollinationSolutions;
