
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mic, Map, LayoutDashboard, ArrowRight, Cpu,
  Quote, Activity, Mail, ChevronRight,
  BarChart3, Signal, Play, Globe, Wifi,
  CheckCircle, CheckCircle2, Shield, MapPin, Search,
  Sparkles, Layers, Volume2, Zap, BookOpen,
  Calculator, Thermometer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PollinationContactForm } from "@/components/PollinationContactForm";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

import LOGO from "@/assets/Logo.png";
import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";

// BeeHUB real product & deployment photos
const BEEHUB_APIARY_HERO = "/images/beehub/apiary-lavender.jpg";
const BEEHUB_QUEEN_DETAIL = "/images/beehub/queen-product-detail.png";
const BEEHUB_SENSE_UNIT = "/images/beehub/sense-unit.png";
const BEEHUB_DEPLOYED = "/images/beehub/deployed-hive-bees.jpg";
const BEEYIELD_DASHBOARD = "/images/beehub/beeyield-dashboard.png";

/* ── Screenshot showcase data ──────────────────────────────────────── */
const SHOWCASE_SLIDES = [
  {
    image: "/Logo.png",
    title: "Quick Analysis",
    description: "Fast statistical overview for decision-making. View activity status, brood strength, temperature, humidity, daily weight changes, and swarm/pest risk — all at a glance.",
  },
  {
    image: "/Logo.png",
    title: "Acoustic Audit",
    description: "Record a short sample and check for unusual sound patterns. BeeYield AI processes spectral wave data at 94.8% confidence to detect pre-swarm signatures and colony anomalies.",
  },
  {
    image: "/Logo.png",
    title: "BeeYield AI",
    description: "The world's most comprehensive bee knowledge system. Powered by an extensive dataset covering every bee species, honey variety, disease, treatment, pollination science, and global industry research.",
  },
  {
    image: "/Logo.png",
    title: "Platform Capabilities",
    description: "20,000+ bee species covered, 300+ honey varieties, 50+ disease protocols, 750K+ research datasets, 91 million managed hives globally. Comprehensive database, image identification, and voice input.",
  },
  {
    image: "/Logo.png",
    title: "Coverage Area",
    description: "Spatial overlay of your apiary with kernel density mapping. Monitor coverage metrics, FPA targets, node efficiency, and hive spacing with live environmental telemetry and actionable insights.",
  },
  {
    image: "/Logo.png",
    title: "Bee Flight Area",
    description: "Live forage, map, and route planning for your selected apiary. View forage potential, effective and maximum flight radius, land type analysis, flight heatmaps, and forage share estimates.",
  },
  {
    image: "/Logo.png",
    title: "Device Management",
    description: "Manage your BeeHUB devices and view recent readings. Monitor total inventory, active devices, offline status, battery levels, and real-time apiary weather telemetry including humidity, pressure, wind, and UV index.",
  },
];

const FEATURE_BADGES = [
  { label: "AI swarm detection", icon: Sparkles },
  { label: "Flight-radius map", icon: Map },
  { label: "Unlimited apiaries/hives", icon: Layers },
  { label: "Image & sound analytics", icon: Volume2 },
];

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
            <div className="rounded-[2rem] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.12)] border border-neutral-200 bg-white">
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-auto"
              />
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


const InLandPollination = () => {

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
                          <div className="absolute bottom-12 left-12 right-12 p-10 bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl">
                              <div className="flex items-center gap-4 mb-6">
                                  <div className="h-0.5 w-12 bg-beeyield-green" />
                                  <span className="text-[10px] font-bold text-beeyield-green">CEO, BeeYield</span>
                              </div>
                              <p className="text-white text-xl md:text-2xl font-bold leading-tight tracking-tight">
                                  "PLIP lets us see the actual number of bees that visit the flowers. Now growers can check the amount of pollination in their lands 24/7."
                              </p>
                              <div className="mt-4 flex items-center gap-4">
                                <img src={TIMOTHY_PHOTO} alt="Timothy Nduva" className="w-8 h-8 rounded-full object-cover border-2 border-beeyield-green/30" />
                                <span className="font-bold text-white text-sm">Timothy Nduva</span>
                                <span className="text-xs text-white/50 border-l border-white/20 pl-4">CEO, BeeYield</span>
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
          DARK SECTION — BEEYIELD DIFFERENCE
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-neutral-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
              <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
              >
                  <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                      The PLIP Difference
                  </Badge>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                      See the bees. <span className="text-beeyield-green">Know the data.</span>
                  </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-12 text-center group hover:bg-white/10 transition-all"
                  >
                      <div className="flex items-center justify-center mb-4">
                          <Signal className="h-20 w-20 text-beeyield-green" />
                      </div>
                      <div className="h-1 w-16 bg-beeyield-green/30 mx-auto mb-6 rounded-full" />
                      <h3 className="text-xl font-bold mb-3">Acoustic Precision</h3>
                      <p className="text-neutral-400 font-medium leading-relaxed text-sm">
                          Highly sensitive analysis models distinguish the <strong className="text-white">acoustic signature of a flying bee</strong> from a tractor engine on the same frequency.
                      </p>
                  </motion.div>

                  <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-12 text-center group hover:bg-white/10 transition-all"
                  >
                      <div className="flex items-center justify-center mb-4">
                          <BarChart3 className="h-20 w-20 text-amber-400" />
                      </div>
                      <div className="h-1 w-16 bg-amber-400/30 mx-auto mb-6 rounded-full" />
                      <h3 className="text-xl font-bold mb-3">Real-Time Visibility</h3>
                      <p className="text-neutral-400 font-medium leading-relaxed text-sm">
                          Compare pollination activity among different <strong className="text-white">genetic strains</strong>, filter by treatments, and correlate output rates with quality levels and germination rates.
                      </p>
                  </motion.div>
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
                  ))}
              </div>
          </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ADVANTAGE TABLE
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10 pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-16 max-w-3xl mx-auto">
                  <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                      Dashboard Features
                  </Badge>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                      The PLIP <span className="text-beeyield-green">Advantage</span>
                  </h2>
              </div>

              <div className="max-w-6xl mx-auto space-y-4">
                  {/* Table Header */}
                  <div className="hidden md:grid md:grid-cols-3 gap-4 px-8 pb-4 border-b border-white/10">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Metric</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Technology Tracking</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">In-Land Benefit</span>
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
          DASHBOARD SHOWCASE + BEEYIELD SYSTEM SCREENSHOT
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white border-b border-neutral-100">
          <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-20 items-center max-w-6xl mx-auto">
                  <div>
                      <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-8 px-4 py-1.5 font-semibold text-[10px]">
                          Interactive Dashboard
                      </Badge>
                      <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-8">
                          Easy-to-Read <span className="text-beeyield-green">PLIP Dashboard</span>
                      </h2>
                      <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                          The PLIP dashboard presents key metrics and delivers actionable insights every day the bees are at work. It gives highly detailed information on the per-minute bee visits from each land's data collection points.
                      </p>
                      <div className="space-y-5">
                          {[
                            "Per-minute bee visits from each land collection point",
                            "Compare pollination activity among different genetic strains",
                            "Filter by production practices and treatments",
                            "Track and correlate output rates with quality levels",
                            "Monitor germination rates and yield projections",
                          ].map((cap, index) => (
                              <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -15 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: index * 0.08 }}
                                  className="flex items-start gap-4 group"
                              >
                                  <CheckCircle2 className="h-5 w-5 text-beeyield-green mt-0.5 shrink-0" />
                                  <p className="text-neutral-600 font-medium leading-relaxed text-sm">{cap}</p>
                              </motion.div>
                          ))}
                      </div>
                  </div>

                  <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="relative"
                  >
                      {/* BeeYield Dashboard — actual system screenshot */}
                      <div className="relative mx-auto max-w-lg">
                          <div className="rounded-[2rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.18)] border border-neutral-200 bg-white">
                              <img
                                  src={BEEYIELD_DASHBOARD}
                                  alt="BeeYield Apiary Dashboard showing weather telemetry and pollination planning"
                                  className="w-full h-auto"
                              />
                          </div>
                      </div>

                      {/* Floating badges */}
                      <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-neutral-100 px-4 py-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-beeyield-green" />
                          <span className="text-xs font-bold text-neutral-900">Live Dashboard</span>
                      </div>
                      <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-neutral-100 px-4 py-3 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-beeyield-green" />
                          <span className="text-xs font-bold text-neutral-900">Visits Per Minute</span>
                      </div>
                  </motion.div>
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
          FINAL CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-neutral-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-8 px-5 py-2 font-semibold text-[10px] rounded-full">
             Ready to Transform Your Land?
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-white tracking-tight">Ready to get more from your land?</h2>
          <p className="text-xl text-neutral-400 mb-12 font-medium max-w-xl mx-auto leading-relaxed">
            Start getting actionable data on your pollination efficacy today. Fill in some basic information and we'll be in touch shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-16 px-12 bg-beeyield-green text-neutral-900 font-bold text-sm rounded-2xl hover:bg-white shadow-[0_0_40px_rgba(45,168,79,0.3)] transition-all hover:scale-[1.02] active:scale-95" asChild>
              <Link to="/contact">Contact Us Today <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-12 border-white/20 text-white font-bold text-sm rounded-2xl hover:bg-white/10 transition-all" asChild>
              <Link to="/precision-pollination">Explore In-Hive Solution <ChevronRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default InLandPollination;