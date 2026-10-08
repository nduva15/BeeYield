import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Quote, ArrowRight, BookOpen, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, CheckCircle2, Zap,
  Calculator, Shield, Cpu, Mic, LayoutDashboard, Radio, Scale, Activity, Sparkles, Play, Pause,
  Thermometer, BarChart3, Flower2, Sprout, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoryHeroBackground } from "@/components/StoryHeroBackground";
import { PollinationContactForm } from "@/components/PollinationContactForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import SEO from "@/components/SEO";

import LOGO from "@/assets/Logo.png";
import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";

import {
  SHOWCASE_SLIDES,
  FEATURE_BADGES,
  HOW_IT_WORKS,
  POLLINATION_ADVANTAGES,
  ADVANTAGE_TABLE,
  AI_CAPABILITIES,
  BEEHUB_IMAGES,
  IN_HIVE_FIELD_SLIDES,
} from "@/data/pollinationContent";

import { ThreePhotoSlideshow, SlideItem } from "@/components/ThreePhotoSlideshow";

/* ── 4 Curated 3-Photo Slideshow Datasets (In-Hive Pollination) ───────── */
const HARDWARE_SLIDES: SlideItem[] = [
  {
    image: '/images/pollination/gateway-solar-node.png',
    title: 'Autonomous Solar LTE Gateway',
    subtitle: 'High-gain dual cellular antennas with solar harvest panel',
    badge: 'Solar Gateway Node',
    description: 'Relays telemetry data from all in-hive sensor nodes across the apiary yard directly to the cloud via cellular uplink.',
  },
  {
    image: '/images/story/deployed-hive-antenna-1.png',
    title: 'Weatherproof Hive Antenna Station',
    subtitle: 'Galvanized tin lid mount on traditional Kenyan beehive stand',
    badge: '22 Deployed Hives',
    description: 'Autonomous transmission station standing in active Kenyan apiary yard, operating continuously in harsh semi-arid weather.',
  },
  {
    image: '/images/story/deployed-hive-antenna-2.png',
    title: 'Kenyan Top-Bar Hive Stand Deployment',
    subtitle: 'Anti-termite pole mount with solar transmission unit',
    badge: '45 Acres Served',
    description: 'Field station deployed at avocado and mango orchard boundaries to monitor foraging flight density during peak flowering.',
  },
];

const SCALES_SLIDES: SlideItem[] = [
  {
    image: '/images/pollination/hive-scale-loadcell.png',
    title: 'Precision Under-Hive Load Cell Scale',
    subtitle: 'Industrial continuous weighing bar mounted under wooden hive floor',
    badge: 'Under-Hive Scale',
    description: 'Measures sub-milligram daily weight gains during heavy nectar flow and alerts immediately upon swarming biomass departure.',
  },
  {
    image: '/images/pollination/hive-comb-inspection-8.png',
    title: 'Top-Down Multi-Frame Brood Coverage',
    subtitle: 'Parallel active frames with central telemetry probe insertion',
    badge: 'Field Inspection',
    description: 'Full-depth inspection showing high colony population density and active brood comb across multiple frames in commercial hive boxes.',
  },
  {
    image: '/images/diseases/hive-inspection-1.png',
    title: 'In-Hive Vertical Telemetry Probe',
    subtitle: 'Microclimate sensor probe installed between brood frames',
    badge: 'Thermal Profiling',
    description: 'Continuous microclimate and VOC tracking delivering early warning of pathogen stress weeks before visual symptoms.',
  },
];

const COMB_DIAGNOSTICS_SLIDES: SlideItem[] = [
  {
    image: '/images/story/apisense-bees-closeup-2.png',
    title: 'ApiSense Sensor Board & Worker Bee',
    subtitle: 'Live forager bee landing on in-hive PCB with zero alarm pheromones',
    badge: 'Biocompatible Sensor',
    description: 'Multi-sensor probe tracking internal brood temperature, relative humidity, and acoustic frequency without hive disruption.',
  },
  {
    image: '/images/story/apisense-bees-cluster-1.png',
    title: 'Active Colony Surrounding Probe',
    subtitle: 'Hundreds of African honeybees clustered naturally around hardware',
    badge: 'Bee Behavior',
    description: 'Proves complete acceptance of the sensor probe inside the hive cavity, allowing uninterrupted brood rearing and thermoregulation.',
  },
  {
    image: '/images/story/apisense-bees-closeup-1.png',
    title: 'ApiSense Probe Inside Log Hive',
    subtitle: 'In-hive sensor installed in traditional log cavity',
    badge: 'Log Hive Validated',
    description: 'Direct measurement of African bee colony thermoregulation inside traditional Kenyan log hives with full biocompatibility.',
  },
];

const COLONY_VITALITY_SLIDES: SlideItem[] = [
  {
    image: '/images/beehub/beeyield-dashboard.png',
    title: 'Detect Bee Diseases & Brood Health',
    subtitle: 'Early pathogen detection on drawn brood comb',
    badge: 'Disease Detection',
    description: 'AI-enhanced comb imaging detects early symptoms of American Foulbrood, chalkbrood, and sacbrood virus across brood cells.',
  },
  {
    image: '/images/story/bee-colony-device-wide.jpg',
    title: 'Thriving African Bee Colony Density',
    subtitle: 'Wide-angle view of massive colony cluster around sensor probe',
    badge: '2.4M+ Bees Protected',
    description: 'Demonstrates vigorous colony health, high worker population density, and seamless coexistence with digital telemetry hardware.',
  },
  {
    image: '/images/story/apisense-bees-cluster-2.png',
    title: 'Dense Bee Cluster Telemetry',
    subtitle: 'Worker bees covering vertical sensor probe without propolizing vents',
    badge: 'Colony Vitality',
    description: 'Complete acceptance of internal hardware enclosure without defensive stinging or propolis clogging over sensor apertures.',
  },
];

/* ── Multiple 3-Photo Telemetry Slideshows Section ──────────────────── */
const InHiveTelemetrySlideshowSection = () => {
  return (
    <section className="py-24 bg-[#FAFAF8] text-neutral-900 relative overflow-hidden border-y border-neutral-200/80">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10 pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-4 px-5 py-2 font-semibold text-[10px] uppercase tracking-wider rounded-full">
            Real In-Hive Hardware & Field Deployments
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4 text-neutral-900">
            Live Telemetry <span className="text-beeyield-green">In Action</span>
          </h2>
          <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
          <p className="text-neutral-600 text-base leading-relaxed">
            4 curated 3-photo slideshows showcasing solar LTE gateways, continuous under-hive load-cell scales, in-hive brood sensors, and comb disease detection.
          </p>
        </div>

        {/* 4 Distinct 3-Photo Slideshows Grid (2x2 on Desktop) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <ThreePhotoSlideshow
            slides={HARDWARE_SLIDES}
            badge="Hardware Network"
            title="Solar Gateways & Stands"
            subtitle="Autonomous transmission hubs"
            dark={false}
          />
          <ThreePhotoSlideshow
            slides={SCALES_SLIDES}
            badge="Scale Telemetry"
            title="Continuous Load Cells"
            subtitle="Sub-milligram weighing bars"
            dark={false}
          />
          <ThreePhotoSlideshow
            slides={COMB_DIAGNOSTICS_SLIDES}
            badge="In-Hive Probes"
            title="ApiSense Bio-Sensors"
            subtitle="Live bee interaction on PCB"
            dark={false}
          />
          <ThreePhotoSlideshow
            slides={COLONY_VITALITY_SLIDES}
            badge="Disease Screening"
            title="Comb Disease Screening"
            subtitle="Early brood pathology detection"
            dark={false}
          />
        </div>
      </div>
    </section>
  );
};



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
                  app.beeyield.com/in-hive
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

/* ── In-Hive Hives Per Acre Model Component ────────────────────────── */
const HPA_CROP_BENCHMARKS = [
  {
    crop: "Avocado (Hass / Fuerte)",
    badge: "Export Tree Crop",
    hivesPerAcre: "2.5 - 3.5",
    targetFPA: "24 - 36",
    anthesisWindow: "10% to 85% Bloom",
    yieldLift: "+18% to +35%",
    foragerRequirement: "High Forager Density",
    pollenChallenge: "Complex dichogamy (Type A female morning / Type B male afternoon) requires dense forager saturation during brief overlapping flower opening windows.",
    telemetryMarker: "Brood chamber thermal core maintained at 34.8°C ensures early morning flight mobilization matching delicate female flower opening.",
  },
  {
    crop: "Macadamia",
    badge: "High-Density Nut Crop",
    hivesPerAcre: "3.0 - 4.5",
    targetFPA: "28 - 42",
    anthesisWindow: "Raceme Anthesis Flush",
    yieldLift: "+20% to +42%",
    foragerRequirement: "Ultra-High Forager Density",
    pollenChallenge: "100–300 individual florets per raceme with heavy self-incompatibility; dense bee coverage is required within 48 hours to prevent premature nutlet drop.",
    telemetryMarker: "Continuous under-hive load-cell scales record rapid hourly weight spikes confirming active floral pollen collection from dense racemes.",
  },
  {
    crop: "Mango (Apple / Ngowe / Tommy)",
    badge: "Commercial Fruit Orchard",
    hivesPerAcre: "2.0 - 3.0",
    targetFPA: "18 - 26",
    anthesisWindow: "Panicle Emergence to 80%",
    yieldLift: "+15% to +28%",
    foragerRequirement: "Moderate-High Density",
    pollenChallenge: "Hermaphrodite blossoms require swift pollen transfer to achieve Grade-A export symmetry, uniform fruit shoulder filling, and reduced post-anthesis drop.",
    telemetryMarker: "Acoustic audits monitor flight hum at 180–220 Hz to verify aggressive foraging while ensuring colonies don't enter pre-swarm clustering.",
  },
  {
    crop: "Watermelon & Cucurbits",
    badge: "Open-Field Horticultural",
    hivesPerAcre: "1.5 - 2.5",
    targetFPA: "14 - 22",
    anthesisWindow: "First Staminate & Pistillate",
    yieldLift: "+25% to +50%",
    foragerRequirement: "Morning Peak Synchronization",
    pollenChallenge: "Female flowers remain receptive for only 4–5 hours in the morning. Each stigma requires 10 to 15 bee visits to ensure full seed set and prevent misshapen fruit.",
    telemetryMarker: "Internal activity and humidity sensors trigger real-time flight window confirmation between 07:00 AM and 11:30 AM before daytime heat closes stigmas.",
  },
  {
    crop: "Coffee (Arabica / Robusta)",
    badge: "Highland Cash Crop",
    hivesPerAcre: "1.5 - 2.0",
    targetFPA: "12 - 18",
    anthesisWindow: "3-Day Post-Rain Flush",
    yieldLift: "+12% to +22%",
    foragerRequirement: "Flash Mobilization",
    pollenChallenge: "Coffee blooms simultaneously for only 48 to 72 hours after first seasonal rains; peak colony workforce must be on-site and primed immediately.",
    telemetryMarker: "Under-hive weight curves capture the instant nectar surge when bloom opens, allowing growers to verify pollination timing down to the hour.",
  },
];

const InHiveHivesPerAcreSection = () => {
  const [selectedCropIdx, setSelectedCropIdx] = useState(0);
  const activeCrop = HPA_CROP_BENCHMARKS[selectedCropIdx];

  return (
    <section className="py-28 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 relative overflow-hidden border-b border-neutral-200/70">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-[0.03] pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-emerald-500/10 text-emerald-800 border-emerald-200 mb-4 px-5 py-2 font-semibold text-[10px] uppercase tracking-wider rounded-full">
            Proprietary Agronomic Model
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-neutral-900 mb-6">
            Our In-Hive Model: <span className="text-beeyield-green">Calibrating Hives per Acre</span>
          </h2>
          <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
          <p className="text-neutral-600 text-base md:text-lg leading-relaxed">
            Traditional beekeeping counts wooden boxes. BeeYield measures <strong>actual biological pollination workforce</strong>. Our proprietary Hives per Acre (HPA) algorithm combines in-hive telemetry with crop canopy requirements to guarantee optimal flower visit saturation.
          </p>
        </div>

        {/* ── Interactive Crop Selector ── */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {HPA_CROP_BENCHMARKS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCropIdx(idx)}
              className={`px-5 py-3 rounded-2xl font-bold text-xs transition-all duration-300 flex items-center gap-2 ${
                idx === selectedCropIdx
                  ? "bg-neutral-900 text-beeyield-green shadow-lg shadow-neutral-900/10 border-neutral-900 scale-105"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:border-beeyield-green/40 hover:bg-neutral-50"
              }`}
            >
              <Flower2 className={`h-4 w-4 ${idx === selectedCropIdx ? "text-beeyield-green" : "text-neutral-400"}`} />
              <span>{item.crop.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* ── Active Crop Specification Card ── */}
        <motion.div
          key={selectedCropIdx}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/90 shadow-xl mb-16"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-100">
            <div>
              <Badge className="bg-amber-500/10 text-amber-800 border-amber-200 mb-2 px-3 py-1 text-[10px] font-bold">
                {activeCrop.badge}
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900">{activeCrop.crop}</h3>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-800">Verified Yield Lift: {activeCrop.yieldLift}</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Recommended Density</span>
              <div className="text-2xl font-black text-neutral-900 flex items-baseline gap-1">
                {activeCrop.hivesPerAcre}
                <span className="text-xs font-semibold text-neutral-500">hives / acre</span>
              </div>
              <span className="text-[11px] text-neutral-500 mt-1 block">Calibrated for canopy volume</span>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Target Effective Frames</span>
              <div className="text-2xl font-black text-beeyield-green flex items-baseline gap-1">
                {activeCrop.targetFPA}
                <span className="text-xs font-semibold text-neutral-500">frames / acre</span>
              </div>
              <span className="text-[11px] text-neutral-500 mt-1 block">Active brood & forager workforce</span>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Deployment Window</span>
              <div className="text-lg font-bold text-neutral-900">
                {activeCrop.anthesisWindow}
              </div>
              <span className="text-[11px] text-neutral-500 mt-1 block">Synchronized with flowering</span>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Forager Requirement</span>
              <div className="text-lg font-bold text-neutral-900">
                {activeCrop.foragerRequirement}
              </div>
              <span className="text-[11px] text-neutral-500 mt-1 block">Zero box-drop guesswork</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-neutral-100">
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100/80">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider text-amber-800">
                <Flower2 className="h-4 w-4" />
                <span>Floral Biology & Agronomic Challenge</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                {activeCrop.pollenChallenge}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider text-emerald-800">
                <Cpu className="h-4 w-4" />
                <span>In-Hive Telemetry Validation Trigger</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                {activeCrop.telemetryMarker}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── 3 In-Hive Biometric Pillars of our HPA Model ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-8 rounded-3xl bg-white border border-neutral-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mb-6">
                <Thermometer className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 mb-2">1. Brood Core Homeostasis</h4>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium mb-4">
                Internal telemetry maintains 34.8°C ± 0.5°C in the core brood chamber. A stable thermal core confirms an active queen and ongoing forager nursery replacement during rigorous orchard foraging cycles.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-100 text-[11px] font-bold text-red-700">
              Guarantees Queen Viability
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-neutral-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
                <Scale className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 mb-2">2. Sub-Gram Scale Telemetry</h4>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium mb-4">
                Under-hive load-cell scales track net diurnal weight gain down to 5 grams. A steady weight curve proves bees are vigorously collecting nectar/pollen; a flat curve warns that bloom is ending.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-100 text-[11px] font-bold text-emerald-700">
              Direct Proof of Floral Influx
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-neutral-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6">
                <Mic className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 mb-2">3. Acoustic Flight Profiling</h4>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium mb-4">
                Acoustic sensors continuously analyze frequency spectrums (180–220 Hz for foraging, 250–290 Hz for pre-swarm agitation). This prevents colonies from swarming away during critical anthesis periods.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-100 text-[11px] font-bold text-blue-700">
              Early Swarm & Stress Detection
            </div>
          </div>
        </div>

        {/* ── Why 2 Strong Hives Beat 4 Weak Hives Callout ── */}
        <div className="p-8 rounded-3xl bg-neutral-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-2 max-w-2xl">
            <Badge className="bg-beeyield-green/20 text-beeyield-green border-none text-[10px] font-bold px-3 py-1">
              Agronomic Efficiency Rule
            </Badge>
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Why 2 Strong Hives Always Beat 4 Weak Hives
            </h4>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              In a 4-frame colony, up to 70% of bees are trapped inside warming the brood. In a certified 10-frame colony, over 65% of the population acts as surplus foragers visiting thousands of blossoms per hour. That’s why our model prices by <strong>verified frames per acre</strong>, saving growers up to 30% in rental costs while delivering superior fruit set.
            </p>
          </div>
          <Button asChild className="shrink-0 h-12 px-8 bg-beeyield-green text-neutral-950 hover:bg-emerald-400 font-bold text-xs rounded-2xl">
            <Link to="/pollination-request">
              Calculate Your Orchard HPA <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};


const PrecisionPollination = () => {
  return (
    <BeeYieldPageShell className="bg-background text-foreground">
      <SEO
        title="Precision Pollination & Hives Per Acre Model | In-Hive Pollination"
        description="Maximize commercial crop yields with BeeYield precision pollination. Data-driven hives per acre models, in-hive pollination monitoring, and expert apiary management protecting bees."
        keywords="precision pollination, hives per acre model, in hive pollination, bees, apiary, protecting bees, in land pollination, smart hive sensors, commercial orchard pollination, bee colony strength"
        url="/precision-pollination"
        image="/images/pollination/gateway-solar-node.png"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "BeeYield Precision Pollination & Hives Per Acre Service",
          "serviceType": "Precision Pollination & In-Hive Agricultural Monitoring",
          "description": "Commercial precision pollination deploying verified hives per acre models, acoustic in-hive monitoring, and real-time foraging telemetry while protecting bees and apiary health.",
          "provider": {
            "@type": "Organization",
            "name": "BeeYield",
            "url": "https://beeyield.com"
          },
          "areaServed": "Kenya"
        }}
      />


      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-neutral-100">
          <StoryHeroBackground />
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
                      In-Hive Technology
                  </Badge>
                  <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900"
                  >
                      Precision <br />
                      <span className="text-beeyield-green">Pollination</span>
                  </motion.h1>
                  <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl md:text-2xl font-medium text-neutral-800 leading-relaxed mb-4 max-w-3xl mx-auto italic"
                  >
                      “Precision pollination: where technology meets nature to ensure every flower blooms with potential.”
                  </motion.p>
                  <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="text-base text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto"
                  >
                      Accountability. Actionable data. And a commitment to the strongest bees available for your orchards.
                  </motion.p>
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                      <Button
                          size="lg"
                          className="h-14 px-10 bg-beeyield-green text-neutral-950 font-bold text-xs rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-beeyield-green/20"
                          onClick={() => document.getElementById('in-hive-form')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                          Get a Free Consultation <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                  </motion.div>
              </div>
          </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PARTNERSHIP NARRATIVE
      ═══════════════════════════════════════════════════════════════ */}
      <section id="partnership" className="py-32 lg:py-48 relative overflow-hidden bg-white">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-100 to-transparent" />
          <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-24 items-center">
                  <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="relative"
                  >
                      <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] aspect-square bg-neutral-100 group">
                          <img
                              src={BEEHUB_IMAGES.deployed}
                              alt="In-hive telemetry probe deployed inside active beehive with clustering bees"
                              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform"
                              style={{ transitionDuration: '2000ms' }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/30 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 p-6 sm:p-8 bg-white/90 backdrop-blur-2xl rounded-[2rem] border border-neutral-200/80 shadow-xl">
                              <div className="flex items-center gap-3 mb-4">
                                  <Quote className="w-5 h-5 text-emerald-600 shrink-0 fill-emerald-600/20" />
                                  <div className="h-0.5 w-10 bg-emerald-600" />
                                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">Timothy Nduva • Founder & CEO</span>
                              </div>
                              <p className="text-neutral-900 text-lg sm:text-xl md:text-2xl font-bold leading-relaxed tracking-tight italic">
                                  “Pollination powers the planet—precision sustains it.”
                              </p>
                              <div className="mt-4 flex items-center gap-3 pt-3 border-t border-neutral-200/60">
                                <img src={TIMOTHY_PHOTO} alt="Timothy Nduva" className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shadow-sm" />
                                <div>
                                  <div className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                                    Timothy Nduva
                                    <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">Founder & CEO</span>
                                  </div>
                                  <div className="text-xs text-neutral-500 font-medium">BeeYield In-Hive Precision</div>
                                </div>
                              </div>
                          </div>
                      </div>
                      <div className="absolute -top-6 -left-6 w-32 h-32 border-t-2 border-l-2 border-beeyield-green/20 rounded-tl-[3rem] -z-10" />
                      <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b-2 border-r-2 border-amber-400/20 rounded-br-[3rem] -z-10" />
                  </motion.div>

                  <div className="space-y-12">
                      <div>
                          <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-8 px-4 py-1.5 font-semibold text-[10px]">
                              Precision Agriculture
                          </Badge>
                          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-8">
                              What is <br />
                              <span className="text-beeyield-green">Precision Pollination?</span>
                          </h2>
                          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                              <strong className="text-neutral-900">Precision Pollination</strong> is a groundbreaking, innovative approach to the critical process of managed pollination in commercial crop growing.
                          </p>
                          <p className="text-lg text-muted-foreground leading-relaxed">
                              Growers whose crops rely on commercial beekeepers for their annual pollination can now, for the first time, get <strong className="text-neutral-900">visibility and accountability</strong> for their pollination experience.
                          </p>
                      </div>

                      <div className="grid gap-8 pt-6">
                          <div className="flex items-start gap-6 group">
                              <div className="h-14 w-14 shrink-0 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-beeyield-green group-hover:border-beeyield-green transition-all shadow-sm">
                                  <Cpu className="w-6 h-6 text-beeyield-green group-hover:text-white transition-colors" />
                              </div>
                              <div>
                                  <h4 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">BeeHUB Queen</h4>
                                  <p className="text-neutral-400 font-medium leading-relaxed">Main unit with LTE/SIM and offline buffer. Measures internal/external temperature, humidity, acoustics, weight and location with vandalism/theft alerts.</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-6 group">
                              <div className="h-14 w-14 shrink-0 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-amber-400 group-hover:border-amber-400 transition-all shadow-sm">
                                  <Mic className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors" />
                              </div>
                              <div>
                                  <h4 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">BeeHUB Sense</h4>
                                  <p className="text-neutral-400 font-medium leading-relaxed">BLE expansion module for Queen with extra sensors and flexible add-ons. Connects to the Queen or the mobile/web app for extended monitoring.</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>


{/* ═══════════════════════════════════════════════════════════════
          THE BEEYIELD DIFFERENCE
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-b from-[#fbf8ef] to-[#f4f7f4] text-neutral-900 relative overflow-hidden border-y border-neutral-200/60">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
              <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
              >
                  <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                      The BeeYield Difference
                  </Badge>
                  <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-8 max-w-4xl mx-auto leading-[0.9]">
                      Knowledge is power. <br />
                      <span className="text-beeyield-green">Data is even better.</span>
                  </h2>
                  <p className="text-xl text-neutral-600 font-medium max-w-2xl mx-auto leading-relaxed">
                      Knowing the exact strength of every hive in your field means pollination can be calculated using a <strong className="text-neutral-900 font-bold">frames-per-acre model</strong> for a far more precise outcome. It’s accurate, efficient, and financially prudent.
                  </p>
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
                      <h3 className="text-xl font-bold mb-3 uppercase tracking-widest text-[10px]">Precision Calculation</h3>
                      <p className="text-neutral-400 font-medium leading-relaxed text-sm">
                          Accurate frames-per-acre modeling based on live hive strength data.
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
                      <h3 className="text-xl font-bold mb-3 uppercase tracking-widest text-[10px]">Financial Prudence</h3>
                      <p className="text-neutral-400 font-medium leading-relaxed text-sm">
                          Stop paying for boxes and start paying for actual pollination power.
                      </p>
                  </motion.div>
              </div>
          </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          IN-HIVE HIVES PER ACRE (HPA) MODEL DEEP DIVE
      ═══════════════════════════════════════════════════════════════ */}
      <InHiveHivesPerAcreSection />


      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS GRID MAP
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-neutral-50/50 border-y border-neutral-100 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-24">
                  <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                      Core Technology
                  </Badge>
                  <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4">How Does It Work?</h2>
                  <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
                  <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                      BeeYield Hives are equipped with the BeeHUB monitoring suite designed to measure activity and deliver analytics to growers without interfering with the natural process of the bees.
                  </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="rounded-[2rem] overflow-hidden border border-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)] group bg-white"
                  >
                      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                          <img src="/images/pollination/gateway-solar-node.png" alt="Solar LTE IoT Gateway node deployed on hive with dual antennas" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <div className="p-6 bg-white">
                          <Badge className="bg-beeyield-green/10 text-beeyield-green border-none text-[9px] font-bold px-3 py-1 rounded-lg mb-3">Solar IoT Gateway Node</Badge>
                          <h4 className="font-bold text-neutral-900 text-base mb-1">Autonomous Solar Field Transmission Hub</h4>
                          <p className="text-sm text-neutral-500 font-medium leading-relaxed">Integrated solar harvest panel, dual high-gain cellular antennas, and continuous real-time data sync directly from apiary yards.</p>
                      </div>
                  </motion.div>
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="rounded-[2rem] overflow-hidden border border-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)] group bg-white"
                  >
                      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                          <img src="/images/pollination/hive-scale-loadcell.png" alt="Precision load cell scale mounted under wooden hive" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <div className="p-6 bg-white">
                          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 text-[9px] font-bold px-3 py-1 rounded-lg mb-3">Under-Hive Load Cell</Badge>
                          <h4 className="font-bold text-neutral-900 text-base mb-1">Continuous Precision Hive Scale</h4>
                          <p className="text-sm text-neutral-500 font-medium leading-relaxed">Industrial load cell bar mounted directly under hive floor measuring diurnal nectar flows, foraging gains, and swarming weight departures.</p>
                      </div>
                  </motion.div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                  {HOW_IT_WORKS.map((item, index) => (
                      <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white p-12 rounded-[2.5rem] border border-neutral-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:border-beeyield-green/20 transition-all duration-500 group"
                      >
                          <div className="mb-10 inline-flex items-center justify-center p-6 bg-neutral-50 rounded-3xl group-hover:bg-beeyield-green/10 transition-colors text-beeyield-green">
                              <item.icon className="h-7 w-7" />
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
          REAL IN-HIVE TELEMETRY & HARDWARE SLIDESHOW
      ═══════════════════════════════════════════════════════════════ */}
      <InHiveTelemetrySlideshowSection />

      {/* ═══════════════════════════════════════════════════════════════
          WHY THIS MATTERS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4">
              <div className="text-center mb-20 max-w-3xl mx-auto">
                  <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                      Precision Agriculture
                  </Badge>
                  <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
                      Do You Know What's <span className="text-beeyield-green">in the Box?</span>
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                      We do. When you pollinate with <strong>BeeYield</strong> you get complete visibility into the hives deployed in your orchards.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                      We are accountable to you to bring the precise number of bees needed for optimal pollination outcomes. We replace any non-performing hives with stronger, more effective colonies.
                  </p>
              </div>

              <div className="space-y-8 max-w-5xl mx-auto">
                  {POLLINATION_ADVANTAGES.map((adv, index) => (
                      <motion.div
                          key={index}
                          initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="flex flex-col md:flex-row gap-8 p-10 bg-neutral-50 rounded-[2rem] border border-neutral-100 hover:border-beeyield-green/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500 group"
                      >
                          <div className="shrink-0 flex flex-col items-center md:items-start gap-4">
                              <div className="h-16 w-16 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center text-beeyield-green group-hover:bg-beeyield-green group-hover:text-white group-hover:border-beeyield-green transition-all shadow-sm">
                                  <adv.icon className="h-7 w-7" />
                              </div>
                              <Badge className="bg-beeyield-green/10 text-beeyield-green border-none text-[9px] font-bold px-3 py-1 rounded-lg whitespace-nowrap">
                                  {adv.badge}
                              </Badge>
                          </div>
                          <div>
                              <h3 className="text-2xl font-bold text-neutral-900 tracking-tight mb-4">
                                  <span className="text-beeyield-green mr-2">{index + 1}.</span>{adv.title}
                              </h3>
                              <p className="text-neutral-500 font-medium leading-relaxed">{adv.description}</p>
                          </div>
                      </motion.div>
                  ))}
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
                      The BeeYield <span className="text-beeyield-green">Advantage</span>
                  </h2>
              </div>

              <div className="max-w-6xl mx-auto space-y-4">
                  <div className="hidden md:grid md:grid-cols-3 gap-4 px-8 pb-4 border-b border-neutral-200">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Metric</span>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Technology Tracking</span>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Pollination Benefit</span>
                  </div>

                  {ADVANTAGE_TABLE.map((row, index) => (
                      <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.08 }}
                          className="grid md:grid-cols-3 gap-6 p-8 bg-white rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-md hover:border-beeyield-green/30 transition-all"
                      >
                          <div className="flex items-center gap-4">
                              <div className="h-10 w-10 shrink-0 rounded-xl bg-beeyield-green/10 flex items-center justify-center text-beeyield-green">
                                  <row.icon className="h-5 w-5" />
                              </div>
                              <span className="font-bold text-sm text-neutral-900">{row.feature}</span>
                          </div>
                          <p className="text-neutral-600 text-sm leading-relaxed">{row.technology}</p>
                          <p className="text-emerald-700 text-sm leading-relaxed font-semibold">{row.benefit}</p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          AI CAPABILITIES / DASHBOARD SHOWCASE
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white border-b border-neutral-100">
          <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-20 items-center max-w-6xl mx-auto">
                  <div>
                      <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-8 px-4 py-1.5 font-semibold text-[10px]">
                          Interactive Dashboard
                      </Badge>
                      <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-8">
                          Easy-to-Understand <span className="text-beeyield-green">Dashboard</span>
                      </h2>
                      <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                          All the key metrics for each orchard, from the day the bees are delivered until the day the beekeepers remove them, are displayed on the dashboard. These include the current frames-per-acre count of the orchards, along with bee activity, flight time, location and temperature for drop points, and more &mdash; giving growers complete confidence that they are getting the pollination they have paid for.
                      </p>
                      <div className="space-y-5">
                          {AI_CAPABILITIES.map((cap, index) => (
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
                      <div className="relative mx-auto max-w-lg">
                          <div className="rounded-[2rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.18)] border border-neutral-200 bg-neutral-100 aspect-[4/3]">
                              <img
                                  src="/images/beehub/beeyield-dashboard.png"
                                  alt="Real worker bees building fresh honeycomb wax along in-hive telemetry sensor probe"
                                  className="w-full h-full object-cover"
                              />
                          </div>
                      </div>
                      <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-neutral-100 px-4 py-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-beeyield-green" />
                          <span className="text-xs font-bold text-neutral-900">Biocompatible Design</span>
                      </div>
                      <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-neutral-100 px-4 py-3 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-beeyield-green" />
                          <span className="text-xs font-bold text-neutral-900">Brood Disease Screening</span>
                      </div>
                  </motion.div>
              </div>
          </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          EDUCATION DOWNLOAD
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-neutral-50 border-y border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
              <motion.div 
                initial={{ opacity: 0, rotate: -5, scale: 0.95 }}
                whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] p-5 border border-neutral-100 hover:-translate-y-4 hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.2)] transition-all duration-500 w-full max-w-sm"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[1.5rem] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-beeyield-green/20 rounded-full blur-3xl" />
                  
                  <Badge className="bg-white/10 text-white border-white/20 mb-6 backdrop-blur-md">Free Guide</Badge>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-4">Bee Math</p>
                  <h4 className="text-2xl font-bold text-white leading-tight tracking-tight mb-8">The Grower's Guide to Precision Pollination</h4>
                  <div className="w-16 h-1 bg-white/20 rounded-full mb-8" />
                  <BookOpen className="h-10 w-10 text-white/50" />
                </div>
              </motion.div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="w-14 h-14 bg-beeyield-green/10 rounded-2xl flex items-center justify-center mb-8">
                <BookOpen className="h-7 w-7 text-beeyield-green" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-neutral-900 tracking-tight">How Much Should You Know About Bees?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Your call, of course. But you should know enough to speak your beekeepers language. For example, did you know that bee math is different from regular math?
              </p>
              
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 mb-8 flex gap-4">
                <div className="shrink-0 mt-1">
                  <span className="text-xl">💡</span>
                </div>
                <p className="text-sm font-medium text-amber-900 leading-relaxed">
                  2x8 does not equal sixteen when it comes to bee frames. A sixteen frame hive actually has 30% more foraging force than that of two 8 framers.
                </p>
              </div>
              
              <p className="text-muted-foreground mb-8">
                Download our free guide to understand bees and how to get the most from them during pollination.
              </p>
              <Button className="h-14 px-8 bg-beeyield-green hover:bg-emerald-600 text-neutral-950 font-bold text-xs rounded-2xl shadow-xl shadow-beeyield-green/20 transition-all" asChild>
                <Link to="/learn">Download the Free Guide <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CONTACT FORM
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-neutral-50 relative overflow-hidden" id="in-hive-form">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_24px_64px_rgba(0,0,0,0.04)] border border-neutral-100">
            <PollinationContactForm
              type="in_hive"
              title="Try BeeYield In-Hive in your apiary"
              description="Contact us to discuss how Precision Pollination can revolutionize your crop yield and deliver full accountability for your operation."
            />
          </div>
        </div>
      </section>

      <FeatureShowcaseSection />

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
             Ready to Transform Your Pollination?
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-neutral-900 tracking-tight">Ready to work with us?</h2>
          <p className="text-xl text-neutral-600 mb-12 font-medium max-w-xl mx-auto leading-relaxed">
            Fill in some basic information — just your name and the best way to contact you and we'll be in touch shortly.
          </p>
          <Button size="lg" className="h-16 px-12 bg-beeyield-green text-neutral-900 font-bold text-sm rounded-2xl hover:bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95" asChild>
            <Link to="/contact">Contact Us Today <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

    </BeeYieldPageShell>
  );
};

export default PrecisionPollination;
