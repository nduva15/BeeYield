
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mic, Map, LayoutDashboard, ArrowRight, Cpu,
  Quote, Activity, Mail, ChevronRight,
  BarChart3, Signal, Play, Globe, Wifi,
  CheckCircle, Shield, MapPin, Search,
  Sparkles, Layers, Volume2, Zap, BookOpen,
  Calculator, Thermometer, TrendingUp, Flower2, Sprout, CheckCircle2, Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PollinationContactForm } from "@/components/PollinationContactForm";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import SEO from "@/components/SEO";

import LOGO from "@/assets/Logo.png";
import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";

// BeeHUB real product & deployment photos
const BEEHUB_APIARY_HERO = "/images/beehub/apiary-lavender.jpg";
const BEEHUB_QUEEN_DETAIL = "/images/beehub/queen-product-detail.png";
const BEEHUB_SENSE_UNIT = "/images/beehub/sense-unit.png";
const BEEHUB_DEPLOYED = "/images/beehub/deployed-hive-bees.jpg";
const BEEYIELD_DASHBOARD = "/images/beehub/beeyield-dashboard.png";

import { SHOWCASE_SLIDES, FEATURE_BADGES } from "@/data/pollinationContent";

/* ── Feature Showcase Section Component ────────────────────────────── */
const FeatureShowcaseSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = SHOWCASE_SLIDES[activeSlide];

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-100 to-transparent" />
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
            BeeHUB Platform
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-neutral-900 mb-6">
            Gain time before the <span className="text-beeyield-green">swarm takes it away.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Peace of mind begins with knowledge and you'll gain it with the free Intelligent Hives app and AI-powered BeeHUB devices. They help beekeepers act in advance: predicting swarms, analyzing colony condition, and saving hours of work during the season.
          </p>
          <p className="text-lg text-neutral-900 font-semibold mt-4">
            With BeeHUB, you work calmer, smarter, more confidently — and your bees stay safer.
          </p>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {FEATURE_BADGES.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 px-6 py-3 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-beeyield-green/20 hover:shadow-md transition-all"
            >
              <feat.icon className="h-4 w-4 text-beeyield-green" />
              <span className="font-bold text-sm text-neutral-900">{feat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Screenshot carousel with description */}
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Left: Screenshot */}
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="rounded-[2rem] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.12)] border border-neutral-200/90 bg-white">
              <div className="px-4 py-2.5 bg-neutral-100/80 border-b border-neutral-200/70 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="text-[11px] font-mono text-neutral-500 font-medium truncate max-w-[220px]">
                  app.beeyield.com/in-land
                </div>
                <Badge className="bg-beeyield-green/15 text-beeyield-green border-none text-[9px] font-bold px-2 py-0.5">
                  Live Platform
                </Badge>
              </div>
              <div className="p-1 sm:p-2 bg-[#FAF9F5]">
                <img
                  src={current.image}
                  alt={current.title}
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
            </div>
          </motion.div>

          {/* Right: Description + navigation dots */}
          <div>
            <motion.div
              key={`desc-${activeSlide}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-4 py-1.5 font-semibold text-[10px]">
                {current.title}
              </Badge>
              <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 tracking-tight mb-6">
                {current.title}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                {current.description}
              </p>
            </motion.div>

            {/* Slide selector dots + labels */}
            <div className="space-y-3">
              {SHOWCASE_SLIDES.map((slide, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`flex items-center gap-4 w-full text-left px-5 py-3 rounded-2xl transition-all ${
                    i === activeSlide
                      ? "bg-beeyield-green/10 border border-beeyield-green/20"
                      : "bg-neutral-50 border border-transparent hover:border-neutral-100"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                    i === activeSlide ? "bg-beeyield-green" : "bg-neutral-300"
                  }`} />
                  <span className={`font-bold text-sm transition-colors ${
                    i === activeSlide ? "text-beeyield-green" : "text-neutral-400"
                  }`}>
                    {slide.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const INLAND_DASHBOARD_SCREENS = [
  {
    id: "microclimate",
    label: "Microclimate & 5-Day Forecast",
    badge: "Open-Meteo Weather",
    url: "app.beeyield.com/in-land/microclimate",
    src: "/images/dashboard/dashboard-microclimate-forecast.png",
    alt: "BeeYield Live Microclimate & 5-Day Forecast",
    floatingBadge1: "Open-Meteo Live API",
    floatingBadge2: "Optimal Flight Window • 184 Hives",
  },
  {
    id: "telemetry",
    label: "Colony Sensor Telemetry",
    badge: "IoT Telemetry Stream",
    url: "app.beeyield.com/in-land/telemetry",
    src: "/images/dashboard/dashboard-hive-telemetry.png",
    alt: "In-Hive Telemetry with Acoustic Audits and Varroa Guard",
    floatingBadge1: "Live Biometric Telemetry",
    floatingBadge2: "Varroa & Hornet Guard Active",
  },
  {
    id: "colonies",
    label: "Colony Directory & Yield",
    badge: "Apiary Harvests",
    url: "app.beeyield.com/in-land/colonies",
    src: "/images/dashboard/dashboard-hive-directory.png",
    alt: "Colony Directory showing Langstroth hives and FrameSense",
    floatingBadge1: "16 kg Harvested (8 batches)",
    floatingBadge2: "FrameSense AI Integrated",
  },
];

const InLandPollination = () => {
  const [activeInlandScreenIdx, setActiveInlandScreenIdx] = useState(0);
  const currentInlandScreen = INLAND_DASHBOARD_SCREENS[activeInlandScreenIdx];

  const howItWorks = [
    {
        title: "BeeHUB Queen",
        description: "Main unit with LTE/SIM and offline buffer. Measures internal/external temperature, internal humidity, acoustics, weight (via hive scale) and location.",
        icon: <Cpu className="h-7 w-7" />,
    },
    {
        title: "BeeHUB Sense",
        description: "BLE expansion module that connects to the Queen or mobile/web app. Flexible add-ons for additional temperature/humidity points and industrial inputs.",
        icon: <Mic className="h-7 w-7" />,
    },
    {
        title: "Land Acoustic Sensors",
        description: "Outdoor-optimized sensors detect bee flight signatures in the field, giving per-flower visit counts and pollination efficacy data in real-time.",
        icon: <Signal className="h-7 w-7" />,
    },
    {
        title: "PLIP Dashboard",
        description: "All key data — visits per minute, forage rates, synchronized bloom, and coverage density — processed and displayed for complete in-land accountability.",
        icon: <LayoutDashboard className="h-7 w-7" />,
    },
  ];

  const advantageTable = [
    {
        feature: "Per-Flower Bee Visits",
        technology: "Acoustic sensors count individual bee visits at collection points across the field.",
        benefit: "Exact pollination efficacy measurement — not estimates, but real visit counts.",
        icon: <Activity className="h-5 w-5" />,
    },
    {
        feature: "Sound Spectrum (FFT)",
        technology: "BeeHUB Queen captures acoustic signatures to distinguish bee flight from ambient noise.",
        benefit: "Prevents swarming losses and identifies queenless colonies before visual inspection.",
        icon: <Mic className="h-5 w-5" />,
    },
    {
        feature: "Forage Rate Tracking",
        technology: "Continuous monitoring of pollinator activity rates across different field zones.",
        benefit: "Time nutrient sprays and interventions around peak pollination for maximum yield.",
        icon: <BarChart3 className="h-5 w-5" />,
    },
    {
        feature: "Coverage Mapping",
        technology: "Spatial overlay showing pollination density and identifying cold spots in real-time.",
        benefit: "Adjust hive placement mid-season to eliminate coverage gaps and boost yields.",
        icon: <MapPin className="h-5 w-5" />,
    },
    {
        feature: "Battery & Solar Status",
        technology: "Device battery level and solar charging status monitored continuously for proactive maintenance.",
        benefit: "Plan logistics and maintenance proactively — continuous operation with solar add-on.",
        icon: <Zap className="h-5 w-5" />,
    },
  ];

  return (
    <BeeYieldPageShell className="bg-background text-foreground">
      <SEO
        title="In-Land Pollination Platform & Apiary Insights | Protecting Bees"
        description="BeeYield's in-land pollination platform pairs field mapping with in-hive telemetry. Monitor bee activity, calculate optimal hives per acre, and protect bees across agricultural acreage."
        keywords="in land pollination, precision pollination, hives per acre model, bees, apiary, protecting bees, in hive pollination, bee activity mapping, smart pollination platform Kenya, apiary management"
        url="/in-land-pollination"
        image="/images/beehub/apiary-lavender.jpg"
        schema={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "BeeYield In-Land Pollination Platform",
          "applicationCategory": "AgriculturalTechnologyApplication",
          "operatingSystem": "Web, iOS, Android",
          "description": "In-land pollination platform delivering field coverage analytics, in-hive monitoring data, and hives per acre intelligence for commercial farmers and apiary managers.",
          "provider": {
            "@type": "Organization",
            "name": "BeeYield",
            "url": "https://beeyield.com"
          }
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-neutral-100">
          <div className="absolute inset-0">
              <img src={BEEHUB_APIARY_HERO} alt="BeeHUB sensors deployed in lavender apiary" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
                  <motion.img
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      src={LOGO}
                      alt="BeeYield Logo"
                      className="h-24 md:h-36 w-auto mb-12 drop-shadow-2xl"
                  />
                  <Badge className="mb-6 bg-amber-500/10 text-amber-700 border-amber-200 px-5 py-2 font-semibold text-[10px] rounded-full backdrop-blur-sm">
                      In-Land Technology
                  </Badge>
                  <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900"
                  >
                      Pollination Land <br />
                      <span className="text-beeyield-green">Insight Platform</span>
                  </motion.h1>
                  <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto"
                  >
                      PLIP delivers key in-land data on per-flower bee visits to evaluate pollination efficacy. See how many bees are actually pollinating your crop and get data in real time.
                  </motion.p>
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                      <Button
                          size="lg"
                          className="h-14 px-10 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20"
                          onClick={() => document.getElementById('in-land-form')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                          Book Pollination Service <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button
                          size="lg"
                          variant="outline"
                          className="h-14 px-10 border-neutral-200 text-neutral-900 font-bold text-xs rounded-2xl hover:bg-neutral-50 transition-all shadow-sm"
                          asChild
                      >
                          <Link to="/precision-pollination"><Play className="h-4 w-4 mr-2" /> View Hive Sensors</Link>
                      </Button>
                  </motion.div>
              </div>
          </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          WHAT IS PLIP — NARRATIVE + TIMOTHY NDUVA QUOTE
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 lg:py-48 relative overflow-hidden bg-white">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-100 to-transparent" />
          <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-24 items-center">
                  <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="relative"
                  >
                      <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] aspect-square bg-neutral-900 group">
                          <img
                              src={BEEHUB_DEPLOYED}
                              alt="BeeHUB Queen deployed on active hive with bees"
                              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform"
                              style={{ transitionDuration: '2000ms' }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 p-6 sm:p-8 bg-neutral-950/80 backdrop-blur-2xl rounded-[2rem] border border-white/15 shadow-2xl">
                              <div className="flex items-center gap-3 mb-4">
                                  <Quote className="w-5 h-5 text-beeyield-green shrink-0 fill-beeyield-green/20" />
                                  <div className="h-0.5 w-10 bg-beeyield-green" />
                                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-beeyield-green">Timothy Nduva • Founder & CEO</span>
                              </div>
                              <p className="text-white text-base sm:text-lg md:text-xl font-bold leading-relaxed tracking-tight italic">
                                  “Pollination is mission-critical to fruit production, but it is still too often managed through assumption. Our goal is to make precision pollination scalable across crops and useful as a day-to-day production tool.”
                              </p>
                              <div className="mt-4 flex items-center gap-3 pt-3 border-t border-white/10">
                                <img src={TIMOTHY_PHOTO} alt="Timothy Nduva" className="w-9 h-9 rounded-full object-cover border-2 border-beeyield-green/40 shadow-sm" />
                                <div>
                                  <div className="font-bold text-white text-sm flex items-center gap-2">
                                    Timothy Nduva
                                    <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">Founder & CEO</span>
                                  </div>
                                  <div className="text-xs text-white/60">BeeYield Precision Pollination</div>
                                </div>
                              </div>
                          </div>
                      </div>
                      {/* Decorative corners */}
                      <div className="absolute -top-6 -left-6 w-32 h-32 border-t-2 border-l-2 border-beeyield-green/20 rounded-tl-[3rem] -z-10" />
                      <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b-2 border-r-2 border-amber-400/20 rounded-br-[3rem] -z-10" />
                  </motion.div>

                  <div className="space-y-12">
                      <div>
                          <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-8 px-4 py-1.5 font-semibold text-[10px]">
                              In-Land Solution
                          </Badge>
                          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-8">
                              PLIP. <br />
                              <span className="text-beeyield-green">BeeYield's In-Land Solution</span>
                          </h2>
                          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                              BeeYield's Pollination Land Insight Platform (PLIP) measures bee activity in crops. You see how many bees are <strong className="text-neutral-900">actually pollinating your crop</strong> and get data in real time so you can act on it.
                          </p>
                          <p className="text-lg text-muted-foreground leading-relaxed">
                              Accurate information about forage rates allows for real-time responses. You can see actual pollinator visits on the flower, efficiency of the pollination process, and data on synchronized bloom — <strong className="text-neutral-900">all in real-time</strong>.
                          </p>
                      </div>

                      <div className="grid gap-8 pt-6">
                          <div className="flex items-start gap-6 group">
                              <div className="h-14 w-14 shrink-0 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-beeyield-green group-hover:border-beeyield-green transition-all shadow-sm">
                                  <Signal className="w-6 h-6 text-beeyield-green group-hover:text-white transition-colors" />
                              </div>
                              <div>
                                  <h4 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">We Can Hear Bees!</h4>
                                  <p className="text-neutral-400 font-medium leading-relaxed">Our outdoor sensor features custom analysis that can distinguish a bee's acoustic signature from a tractor engine on the same frequency.</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-6 group">
                              <div className="h-14 w-14 shrink-0 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-amber-400 group-hover:border-amber-400 transition-all shadow-sm">
                                  <Map className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors" />
                              </div>
                              <div>
                                  <h4 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">Visibility Into Every Land</h4>
                                  <p className="text-neutral-400 font-medium leading-relaxed">See actual pollinator visits on the flower, pollination efficiency, and synchronized bloom occurrence — all from the PLIP dashboard.</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

            

{/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS GRID + PRODUCT SHOWCASE
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-neutral-50/50 border-y border-neutral-100 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-24">
                  <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                      Core Technology
                  </Badge>
                  <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4">How Does PLIP Work?</h2>
                  <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
                  <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                      BeeYield's In-Land system combines BeeHUB devices with outdoor acoustic sensors to measure bee activity in the field and deliver per-flower visit analytics.
                  </p>
              </div>

              {/* Product showcase grid — Queen detail + Sense unit */}
              <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="rounded-[2rem] overflow-hidden border border-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)] group"
                  >
                      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                          <img src={BEEHUB_QUEEN_DETAIL} alt="BeeHUB Queen unit with sensors and cables" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <div className="p-6 bg-white">
                          <Badge className="bg-beeyield-green/10 text-beeyield-green border-none text-[9px] font-bold px-3 py-1 rounded-lg mb-3">BeeHUB Queen</Badge>
                          <p className="text-sm text-neutral-500 font-medium">Main unit with LTE/SIM, offline buffer, multiple sensor connectors, and integrated hive scale mount.</p>
                      </div>
                  </motion.div>
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="rounded-[2rem] overflow-hidden border border-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)] group"
                  >
                      <div className="aspect-[4/3] overflow-hidden bg-neutral-50 flex items-center justify-center p-8">
                          <img src={BEEHUB_SENSE_UNIT} alt="BeeHUB Sense expansion module" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <div className="p-6 bg-white">
                          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 text-[9px] font-bold px-3 py-1 rounded-lg mb-3">BeeHUB Sense</Badge>
                          <p className="text-sm text-neutral-500 font-medium">BLE expansion module for Queen with extra T/RH sensors, industrial inputs, and flexible add-ons.</p>
                      </div>
                  </motion.div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                  {howItWorks.map((item, index) => (
                      <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white p-12 rounded-[2.5rem] border border-neutral-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:border-beeyield-green/20 transition-all duration-500 group"
                      >
                          <div className="mb-10 inline-flex items-center justify-center p-6 bg-neutral-50 rounded-3xl group-hover:bg-beeyield-green/10 transition-colors text-beeyield-green">
                              {item.icon}
                          </div>
                          <h3 className="text-xl font-bold text-neutral-900 mb-5 tracking-tight">{item.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.description}
                          </p>
                      </motion.div>
                  ))/* End of map */}
              </div>
          </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ADVANTAGE TABLE
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#FAFAF8] text-neutral-900 relative overflow-hidden border-y border-neutral-200/60">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10 pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-16 max-w-3xl mx-auto">
                  <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                      Dashboard Features
                  </Badge>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-neutral-900">
                      The PLIP <span className="text-beeyield-green">Advantage</span>
                  </h2>
              </div>

              <div className="max-w-6xl mx-auto space-y-4">
                  {/* Table Header */}
                  <div className="hidden md:grid md:grid-cols-3 gap-4 px-8 pb-4 border-b border-neutral-200">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Metric</span>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Technology Tracking</span>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">In-Land Benefit</span>
                  </div>

                  {advantageTable.map((row, index) => (
                      <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.08 }}
                          className="grid md:grid-cols-3 gap-6 p-8 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
                      >
                          <div className="flex items-center gap-4">
                              <div className="h-10 w-10 shrink-0 rounded-xl bg-beeyield-green/20 flex items-center justify-center text-beeyield-green">
                                  {row.icon}
                              </div>
                              <span className="font-bold text-sm">{row.feature}</span>
                          </div>
                          <p className="text-neutral-400 text-sm leading-relaxed">{row.technology}</p>
                          <p className="text-beeyield-green/90 text-sm leading-relaxed font-medium">{row.benefit}</p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          IN-LAND HIVES PER ACRE (HPA) VALIDATION & GROUND-TRUTH
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white border-b border-neutral-200/80 relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center max-w-3xl mx-auto mb-16">
                  <Badge className="bg-amber-500/10 text-amber-800 border-amber-200 mb-4 px-5 py-2 font-semibold text-[10px] uppercase tracking-wider rounded-full">
                      Field Ground-Truth
                  </Badge>
                  <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-neutral-900 mb-6">
                      Closing the Loop: <span className="text-beeyield-green">In-Land HPA Verification</span>
                  </h2>
                  <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
                  <p className="text-neutral-600 text-base md:text-lg leading-relaxed">
                      Deploying calibrated hives per acre is only half the battle. Our <strong>In-Land Platform (PLIP)</strong> places acoustic ground nodes right in the crop canopy to verify that worker bees are actively visiting flowers across every single tree, eliminating orchard cold-spots in real time.
                  </p>
              </div>

              {/* 4 In-Land HPA Validation Pillars */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                  <div className="p-7 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col justify-between hover:border-beeyield-green/30 transition-all group">
                      <div>
                          <div className="w-12 h-12 rounded-2xl bg-beeyield-green/10 text-beeyield-green flex items-center justify-center mb-6 group-hover:bg-beeyield-green group-hover:text-white transition-colors">
                              <Signal className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Pillar 1</span>
                          <h4 className="text-lg font-bold text-neutral-900 mb-2">Acoustic Visit Counting</h4>
                          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                              Canopy microphones isolate bee wingbeat frequencies (180–240 Hz) from ambient orchard noise, logging exact visits per flower per hour (benchmark: &gt;15 visits/flower/hr).
                          </p>
                      </div>
                      <div className="mt-5 pt-3 border-t border-neutral-200/60 text-[11px] font-bold text-emerald-700">
                          Direct Stigma Touch Metrics
                      </div>
                  </div>

                  <div className="p-7 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col justify-between hover:border-amber-400/40 transition-all group">
                      <div>
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6 group-hover:bg-amber-400 group-hover:text-neutral-900 transition-colors">
                              <MapPin className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Pillar 2</span>
                          <h4 className="text-lg font-bold text-neutral-900 mb-2">Cold-Spot Eradication</h4>
                          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                              Bees prefer foraging within 250m of their stands. Our spatial mapping identifies orchard sectors with visitation deficits and prompts mobile hive redistributions across the block.
                          </p>
                      </div>
                      <div className="mt-5 pt-3 border-t border-neutral-200/60 text-[11px] font-bold text-amber-700">
                          100% Uniform Canopy Coverage
                      </div>
                  </div>

                  <div className="p-7 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col justify-between hover:border-blue-400/40 transition-all group">
                      <div>
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <Flower2 className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Pillar 3</span>
                          <h4 className="text-lg font-bold text-neutral-900 mb-2">Anthesis Phasing</h4>
                          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                              Hive density ramps up in synchrony with flowering: 1.0 hive/acre at 10% bloom, peaking at 3.0+ hives/acre during 75% anthesis, and tapering off before petal drop to prevent colony hunger.
                          </p>
                      </div>
                      <div className="mt-5 pt-3 border-t border-neutral-200/60 text-[11px] font-bold text-blue-700">
                          Biomass Protection Phase
                      </div>
                  </div>

                  <div className="p-7 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col justify-between hover:border-purple-400/40 transition-all group">
                      <div>
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                              <Activity className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Pillar 4</span>
                          <h4 className="text-lg font-bold text-neutral-900 mb-2">Flight-Hour Gating</h4>
                          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                              Combines Open-Meteo degree-days, solar radiance, and wind speeds (&lt;18 km/h) to calculate real effective flight hours per acre, ensuring pollination quotas are achieved before sunset.
                          </p>
                      </div>
                      <div className="mt-5 pt-3 border-t border-neutral-200/60 text-[11px] font-bold text-purple-700">
                          Weather-Calibrated Quotas
                      </div>
                  </div>
              </div>

              {/* ── Visual Closed-Loop Pipeline Banner ── */}
              <div className="bg-neutral-950 text-white rounded-3xl p-8 sm:p-10 border border-neutral-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-beeyield-green/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                          <div>
                              <Badge className="bg-beeyield-green/20 text-beeyield-green border-none text-[10px] font-bold px-3 py-1 mb-2">
                                  Closed-Loop Architecture
                              </Badge>
                              <h3 className="text-2xl font-bold tracking-tight text-white">
                                  How In-Hive &amp; In-Land Sensors Co-Calculate HPA
                              </h3>
                          </div>
                          <Button asChild className="h-11 px-6 bg-beeyield-green text-neutral-950 hover:bg-emerald-400 font-bold text-xs rounded-xl">
                              <Link to="/precision-pollination">
                                  Explore In-Hive Sensors <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                          </Button>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 text-center">
                          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                              <div className="text-xs font-bold text-beeyield-green uppercase tracking-wider mb-1">Step 1: In-Hive</div>
                              <div className="text-sm font-bold text-white mb-2">Frame Strength Verification</div>
                              <p className="text-[11px] text-neutral-400 leading-relaxed">
                                  Brood core (34.8°C) and scales confirm colony is Queen-right with &ge;14 effective frames/acre.
                              </p>
                          </div>

                          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Step 2: In-Land</div>
                              <div className="text-sm font-bold text-white mb-2">Canopy Visit Auditing</div>
                              <p className="text-[11px] text-neutral-400 leading-relaxed">
                                  Acoustic sensors measure flower landing rates across blocks, validating if 2.0–4.5 HPA is delivering target visits.
                              </p>
                          </div>

                          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Step 3: Algorithm</div>
                              <div className="text-sm font-bold text-white mb-2">Dynamic Re-Distribution</div>
                              <p className="text-[11px] text-neutral-400 leading-relaxed">
                                  If canopy visits drop in remote orchard corners, mobile hives are repositioned to eliminate cold spots.
                              </p>
                          </div>

                          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Step 4: Outcome</div>
                              <div className="text-sm font-bold text-white mb-2">9%–18%+ Certified Yield</div>
                              <p className="text-[11px] text-neutral-400 leading-relaxed">
                                  Maximum fruitlet set, uniform export fruit geometry, and complete colony health protection.
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          DASHBOARD SHOWCASE + BEEYIELD SYSTEM SCREENSHOT
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white border-b border-neutral-100">
          <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center max-w-3xl mx-auto mb-14">
                  <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-4 px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider">
                      Interactive Field Telemetry
                  </Badge>
                  <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
                      Easy-to-Read <span className="text-beeyield-green">Dashboards</span>
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                      Real-time Open-Meteo microclimate tracking, flight-window analytics, hourly weather curves, and verified apiary ledger yields &mdash; structured into clear, readable dashboards for growers and beekeepers.
                  </p>
              </div>

              {/* Dashboard Showcase Tab Switcher */}
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {INLAND_DASHBOARD_SCREENS.map((screen, idx) => (
                      <button
                          key={screen.id}
                          onClick={() => setActiveInlandScreenIdx(idx)}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                              activeInlandScreenIdx === idx
                                  ? "bg-beeyield-green text-neutral-950 shadow-md shadow-beeyield-green/20"
                                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                          }`}
                      >
                          {screen.label}
                      </button>
                  ))}
              </div>

              {/* Full high-resolution easy to read dashboard screenshot presentation */}
              <motion.div
                  key={currentInlandScreen.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative mx-auto max-w-5xl mb-14"
              >
                  <div className="rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.12)] border border-neutral-200/90 bg-white">
                      <div className="px-5 py-3 bg-neutral-100/80 border-b border-neutral-200/70 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-400/80" />
                              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                              <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                          </div>
                          <div className="text-xs font-mono text-neutral-500 font-medium">
                              {currentInlandScreen.url}
                          </div>
                          <Badge className="bg-beeyield-green/15 text-beeyield-green border-none text-[10px] font-bold px-2.5 py-0.5">
                              {currentInlandScreen.badge}
                          </Badge>
                      </div>
                      <div className="p-2 sm:p-4 bg-[#FAF9F5]">
                          <img
                              src={currentInlandScreen.src}
                              alt={currentInlandScreen.alt}
                              className="w-full h-auto object-contain rounded-2xl"
                          />
                      </div>
                  </div>

                  {/* Floating badges */}
                  <div className="hidden sm:flex absolute -top-3 -right-3 bg-white rounded-2xl shadow-xl border border-neutral-100 px-4 py-2.5 items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-beeyield-green" />
                      <span className="text-xs font-bold text-neutral-900">{currentInlandScreen.floatingBadge1}</span>
                  </div>
                  <div className="hidden sm:flex absolute -bottom-3 -left-3 bg-white rounded-2xl shadow-xl border border-neutral-100 px-4 py-2.5 items-center gap-2">
                      <Activity className="h-4 w-4 text-beeyield-green" />
                      <span className="text-xs font-bold text-neutral-900">{currentInlandScreen.floatingBadge2}</span>
                  </div>
              </motion.div>

              {/* Key dashboard capabilities breakdown */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                  {[
                    {
                      title: "Live Microclimate",
                      desc: "Real-time 25°C ambient temperature, 58% humidity, and 10 km/h wind velocity at Kibwezi Apiary (-2.409°S, 37.967°E).",
                      icon: Thermometer,
                    },
                    {
                      title: "Flight Window Analytics",
                      desc: "Continuous detection of optimal foraging conditions with clear green status flags for precision pollination inspections.",
                      icon: Activity,
                    },
                    {
                      title: "Hourly & 5-Day Outlook",
                      desc: "Hourly microclimate forecast and 5-day safe foraging range tracking to time colony field releases perfectly.",
                      icon: BarChart3,
                    },
                    {
                      title: "Certified Yield Ledger",
                      desc: "184 managed hives with 150 active colonies and 843.0 KG certified yield verified across 401 blockchain batches.",
                      icon: Shield,
                    },
                  ].map((item, index) => (
                      <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.08 }}
                          className="p-6 rounded-2xl bg-neutral-50/80 border border-neutral-100 hover:border-beeyield-green/30 transition-all space-y-2.5"
                      >
                          <div className="w-9 h-9 rounded-xl bg-beeyield-green/10 flex items-center justify-center text-beeyield-green">
                              <item.icon className="w-5 h-5" />
                          </div>
                          <h4 className="font-bold text-neutral-900 text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BEEHUB FEATURE SHOWCASE — "Gain time before the swarm"
      ═══════════════════════════════════════════════════════════════ */}
      <FeatureShowcaseSection />

      {/* ═══════════════════════════════════════════════════════════════
          CONTACT FORM
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-neutral-50 relative overflow-hidden" id="in-land-form">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_24px_64px_rgba(0,0,0,0.04)] border border-neutral-100">
            <PollinationContactForm
              type="in_land"
              title="Try BeeYield In-Land in your fields"
              description="Contact us to discuss how PLIP can give you visibility and accountability for your pollination experience."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THE BEEYIELD DIFFERENCE (MOVED TO FOOTER)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-[#fbf8ef] to-[#f4f7f4] text-neutral-900 relative overflow-hidden border-y border-neutral-200/60">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
              <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
              >
                  <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                      The BeeYield Difference
                  </Badge>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900">
                      Knowledge is power. <span className="text-beeyield-green">Data is even better.</span>
                  </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-neutral-200 shadow-sm p-12 text-center group hover:shadow-md transition-all"
                  >
                      <div className="text-7xl md:text-8xl font-black text-beeyield-green mb-4 tracking-tighter flex items-center justify-center">
                          <Calculator className="h-20 w-20 text-beeyield-green" />
                      </div>
                      <div className="h-1 w-16 bg-beeyield-green/30 mx-auto mb-6 rounded-full" />
                      <h3 className="text-xl font-bold mb-3">Precision Calculation</h3>
                      <p className="text-neutral-600 font-medium leading-relaxed text-sm">
                          Knowing the exact strength of every hive in your field means pollination can be calculated using a <strong className="text-neutral-900">frames-per-acre model</strong> for a far more precise outcome.
                      </p>
                  </motion.div>

                  <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-neutral-200 shadow-sm p-12 text-center group hover:shadow-md transition-all"
                  >
                      <div className="text-7xl md:text-8xl font-black text-amber-400 mb-4 tracking-tighter flex items-center justify-center">
                          <Shield className="h-20 w-20 text-amber-400" />
                      </div>
                      <div className="h-1 w-16 bg-amber-400/30 mx-auto mb-6 rounded-full" />
                      <h3 className="text-xl font-bold mb-3">Financial Prudence</h3>
                      <p className="text-neutral-600 font-medium leading-relaxed text-sm">
                          It's accurate, efficient, and cost-effective. You <strong className="text-neutral-900">stop paying for "boxes"</strong> and start paying for actual pollination power.
                      </p>
                  </motion.div>
              </div>
          </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CUSTOMER SUCCESS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden line-bottom border-y border-neutral-100">
        <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-8">
                We Don’t Succeed <span className="text-beeyield-green">Unless You Succeed</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                We want our partnership with you to be as smooth and stress free as possible. Meet Alissa, Head of Customer Success; her team is ready to provide you with all the help you need, from onboarding, to making sure all your contract paperwork is buttoned up.
            </p>
            <p className="text-lg text-neutral-900 font-semibold mb-8">
                Get in touch for any reason at all: <a href="mailto:info@beeyield.com" className="text-beeyield-green hover:underline">info@beeyield.com</a>
            </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-[#f0f7f0] to-[#e8f4e8] text-center relative overflow-hidden border-t border-emerald-100">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-8 px-5 py-2 font-semibold text-[10px] rounded-full">
             Ready to Transform Your Land?
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-neutral-900 tracking-tight">Ready to get more from your land?</h2>
          <p className="text-xl text-neutral-600 mb-12 font-medium max-w-xl mx-auto leading-relaxed">
            Start getting actionable data on your pollination efficacy today. Fill in some basic information and we'll be in touch shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-16 px-12 bg-beeyield-green text-neutral-900 font-bold text-sm rounded-2xl hover:bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95" asChild>
              <Link to="/contact">Contact Us Today <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-12 border-white/20 text-neutral-900 font-bold text-sm rounded-2xl hover:bg-white/10 transition-all" asChild>
              <Link to="/precision-pollination">Explore In-Hive Solution <ChevronRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default InLandPollination;