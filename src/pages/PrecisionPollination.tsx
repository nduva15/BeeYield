import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, BookOpen, ChevronDown, CheckCircle, CheckCircle2, Zap,
  Calculator, Shield, Cpu, Mic, LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PollinationContactForm } from "@/components/PollinationContactForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

import LOGO from "@/assets/Logo.png";
import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";

import {
  SHOWCASE_SLIDES,
  FEATURE_BADGES,
  PROFESSIONAL_TOOLS,
  HOW_IT_WORKS,
  POLLINATION_ADVANTAGES,
  ADVANTAGE_TABLE,
  AI_CAPABILITIES,
  BEEHUB_IMAGES,
} from "@/data/pollinationContent";



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


const PrecisionPollination = () => {
  const [isProfessionalOpen, setIsProfessionalOpen] = useState(false);


  return (
    <BeeYieldPageShell className="bg-background text-foreground">

      {/* ═══════════════════════════════════════════════════════════════
          DYNAMIC NAV BAR & SUB-HEADER (Sleek Modernized)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="sticky top-20 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hidden lg:block">
        <div className="container mx-auto px-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-beeyield-green/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-beeyield-green" />
            </div>
            <span className="font-bold text-xs tracking-tight text-neutral-900">Precision System 2.4</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-5 py-2 bg-neutral-900 text-white rounded-full font-bold text-[10px] hover:bg-neutral-800 transition-all shadow-md focus:outline-none">
                Professional Suite
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-2 bg-white rounded-2xl border border-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)]" align="end" sideOffset={8}>
              {PROFESSIONAL_TOOLS.map((tool) => (
                <DropdownMenuItem key={tool.path} asChild className="rounded-xl cursor-pointer">
                  <Link to={tool.path} className="flex items-start gap-4 p-3 hover:bg-neutral-50 transition-colors group outline-none">
                    <div className="mt-0.5 w-10 h-10 shrink-0 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-center group-hover:bg-beeyield-green/10 group-hover:border-beeyield-green/20 group-hover:text-beeyield-green transition-all">
                      <tool.icon className="w-4 h-4 text-neutral-500 group-hover:text-beeyield-green" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-neutral-900 tracking-tight">{tool.label}</p>
                      <p className="text-xs font-medium text-neutral-500 mt-0.5 leading-tight">{tool.description}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION — EXACT MAP OF DISEASES HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-neutral-100">
          <div className="absolute inset-0">
              <img src={BEEHUB_IMAGES.apiaryHero} alt="BeeHUB sensors deployed in lavender apiary" className="w-full h-full object-cover" />
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
                      className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto"
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
                          className="h-14 px-10 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20"
                          onClick={() => document.getElementById('in-hive-form')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                          Get a Free Consultation <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                  </motion.div>
              </div>
          </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          PARTNERSHIP NARRATIVE MAP — "WHAT IS PRECISION POLLINATION"
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
                      <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] aspect-square bg-neutral-900 group">
                          <img
                              src={BEEHUB_IMAGES.deployed}
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
                                  "Our commitment to our growers is to bring them complete transparency for the most effective pollination outcomes."
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

              {/* Product showcase grid — Queen detail + Sense unit */}
              <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="rounded-[2rem] overflow-hidden border border-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)] group"
                  >
                      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                          <img src={BEEHUB_IMAGES.queenDetail} alt="BeeHUB Queen unit with sensors and cables" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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
                          <img src={BEEHUB_IMAGES.senseUnit} alt="BeeHUB Sense expansion module" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <div className="p-6 bg-white">
                          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 text-[9px] font-bold px-3 py-1 rounded-lg mb-3">BeeHUB Sense</Badge>
                          <p className="text-sm text-neutral-500 font-medium">BLE expansion module for Queen with extra T/RH sensors, industrial inputs, and flexible add-ons.</p>
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
      <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10 pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-16 max-w-3xl mx-auto">
                  <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                      Dashboard Features
                  </Badge>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                      The BeeYield <span className="text-beeyield-green">Advantage</span>
                  </h2>
              </div>

              <div className="max-w-6xl mx-auto space-y-4">
                  {/* Table Header */}
                  <div className="hidden md:grid md:grid-cols-3 gap-4 px-8 pb-4 border-b border-white/10">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Metric</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Technology Tracking</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Pollination Benefit</span>
                  </div>

                  {ADVANTAGE_TABLE.map((row, index) => (
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
                                  <row.icon className="h-5 w-5" />
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
          AI CAPABILITIES / DASHBOARD SHOWCASE MAP
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
                      {/* BeeYield Dashboard — actual system screenshot */}
                      <div className="relative mx-auto max-w-lg">
                          <div className="rounded-[2rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.18)] border border-neutral-200 bg-white">
                              <img
                                  src={BEEHUB_IMAGES.dashboard}
                                  alt="BeeYield Apiary Dashboard showing weather telemetry, pollination planning, and Timothy Nduva verified beekeeper status"
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
                          <LayoutDashboard className="h-4 w-4 text-beeyield-green" />
                          <span className="text-xs font-bold text-neutral-900">Weather Telemetry</span>
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
                <div className="aspect-[3/4] bg-neutral-900 rounded-[1.5rem] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
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
              <Button className="h-14 px-8 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-2xl shadow-xl transition-all" asChild>
                <Link to="/learn">Download the Free Guide <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </div>
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

      {/* ═══════════════════════════════════════════════════════════════
          THE BEEYIELD DIFFERENCE (MOVED TO FOOTER)
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
                      The BeeYield Difference
                  </Badge>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                      Knowledge is power. <span className="text-beeyield-green">Data is even better.</span>
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
                      <div className="text-7xl md:text-8xl font-black text-beeyield-green mb-4 tracking-tighter flex items-center justify-center">
                          <Calculator className="h-20 w-20 text-beeyield-green" />
                      </div>
                      <div className="h-1 w-16 bg-beeyield-green/30 mx-auto mb-6 rounded-full" />
                      <h3 className="text-xl font-bold mb-3">Precision Calculation</h3>
                      <p className="text-neutral-400 font-medium leading-relaxed text-sm">
                          Knowing the exact strength of every hive in your field means pollination can be calculated using a <strong className="text-white">frames-per-acre model</strong> for a far more precise outcome.
                      </p>
                  </motion.div>

                  <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-12 text-center group hover:bg-white/10 transition-all"
                  >
                      <div className="text-7xl md:text-8xl font-black text-amber-400 mb-4 tracking-tighter flex items-center justify-center">
                          <Shield className="h-20 w-20 text-amber-400" />
                      </div>
                      <div className="h-1 w-16 bg-amber-400/30 mx-auto mb-6 rounded-full" />
                      <h3 className="text-xl font-bold mb-3">Financial Prudence</h3>
                      <p className="text-neutral-400 font-medium leading-relaxed text-sm">
                          It's accurate, efficient, and cost-effective. You <strong className="text-white">stop paying for "boxes"</strong> and start paying for actual pollination power.
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
      <section className="py-24 lg:py-32 bg-neutral-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-8 px-5 py-2 font-semibold text-[10px] rounded-full">
             Ready to Transform Your Pollination?
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-white tracking-tight">Ready to work with us?</h2>
          <p className="text-xl text-neutral-400 mb-12 font-medium max-w-xl mx-auto leading-relaxed">
            Fill in some basic information — just your name and the best way to contact you and we'll be in touch shortly.
          </p>
          <Button size="lg" className="h-16 px-12 bg-beeyield-green text-neutral-900 font-bold text-sm rounded-2xl hover:bg-white shadow-[0_0_40px_rgba(45,168,79,0.3)] transition-all hover:scale-[1.02] active:scale-95" asChild>
            <Link to="/contact">Contact Us Today <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default PrecisionPollination;
