import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Cpu, Wifi, LayoutDashboard, ArrowRight,
  Quote, Check, BookOpen, Mail, ChevronRight,
  BarChart3, Thermometer, Mic, Globe, Activity,
  ChevronDown, Calculator, Navigation, FileBarChart, Layers, Zap,
  CheckCircle, CheckCircle2, Leaf, Shield, MapPin, Search, Handshake
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

// Re-using same style constants/images to perfectly map Diseases' structure
const HIVE_INSPECTION = "/images/diseases/hive-inspection.jpg";
const SENSOR_PORTRAIT = "/images/diseases/apisense-sensor-portrait.jpg";
const APISENSE_APP = "/images/diseases/apisense-app.png";

const PrecisionPollination = () => {
  const [isProfessionalOpen, setIsProfessionalOpen] = useState(false);

  const professionalTools = [
    { label: 'Tactical Grid', icon: Layers, path: '/beeyield-dashboard', description: 'Live device monitoring' },
    { label: 'Pollination Calcs', icon: Calculator, path: '/precision-pollination/calcs', description: 'Yield & FPA analysis' },
    { label: 'Flight Mapping', icon: Navigation, path: '/precision-pollination/map', description: 'Geospatial movement' },
    { label: 'Site Reports', icon: FileBarChart, path: '/precision-pollination/reports', description: 'Audit & compliance' }
  ];

  /* ── Data Arrays map exactly to Diseases array structure ────────────────────────────── */

  const howItWorks = [
    {
        title: "In-Hive Sensors",
        description: "Small digital sensors capture key info from the colony, including temperature, humidity, light levels, location, and most importantly, the sound of the hive.",
        icon: <Mic className="h-7 w-7" />,
    },
    {
        title: "Wireless Gateway",
        description: "One Gateway attached to the exterior of the hive connects wirelessly to all sensors within the apiary radius.",
        icon: <Wifi className="h-7 w-7" />,
    },
    {
        title: "Secure Transmission",
        description: "The Gateway sends the telemetry info securely to our cloud system for real-time review and analysis.",
        icon: <Cpu className="h-7 w-7" />,
    },
    {
        title: "Dashboard Visibility",
        description: "All the key metrics for each orchard are processed and displayed on the dashboard for complete accountability.",
        icon: <LayoutDashboard className="h-7 w-7" />,
    },
  ];

  const pollinationAdvantages = [
    {
        title: "Frames-Per-Acre Count",
        description: "Knowing the exact strength of every hive in your field means pollination can be calculated using a precise frames-per-acre model.",
        icon: <Calculator className="h-7 w-7" />,
        badge: "Precision Calculation",
    },
    {
        title: "Financial Prudence",
        description: "It's accurate, efficient, and cost-effective. You stop paying for \"boxes\" and start paying for actual pollination power.",
        icon: <Shield className="h-7 w-7" />,
        badge: "Cost Effectiveness",
    },
    {
        title: "Unmatched Transparency",
        description: "From the day the bees are delivered until the day they are removed, we are accountable to you for optimal pollination outcomes.",
        icon: <Search className="h-7 w-7" />,
        badge: "Full Accountability",
    }
  ];

  const advantageTable = [
    {
        feature: "Bee Activity & Flight Time",
        technology: "Monitors daily foraging durations, weather impacts, and total active bee flight hours.",
        benefit: "Gives growers complete confidence they are getting the pollination they paid for.",
        icon: <Activity className="h-5 w-5" />,
    },
    {
        feature: "GPS Location Tracking",
        technology: "Real-time mapping of every deployed colony drop point.",
        benefit: "Ensures optimal distribution density and prevents theft or misplacement.",
        icon: <MapPin className="h-5 w-5" />,
    },
    {
        feature: "Live Temperature Logs",
        technology: "Tracks internal hive temperature to predict colony strength and stress.",
        benefit: "We proactively replace any non-performing hives with stronger, more effective colonies.",
        icon: <Thermometer className="h-5 w-5" />,
    },
    {
        feature: "Post-Pollination Audits",
        technology: "Aggregated reporting when the pollination cycle concludes.",
        benefit: "Provides actionable yield intelligence for next season's planning.",
        icon: <BarChart3 className="h-5 w-5" />,
    },
  ];

  const aiCapabilities = [
    "Precision Calculation — accurate frames-per-acre modeling based on hive data",
    "Financial Prudence — pay for actual pollination power, not just boxes",
    "Accountability — rapid deployment and replacement of non-performing hives",
    "Interactive Reporting — easy-to-understand metrics for drop points and activity",
    "Complete Transparency — insight from the day bees are delivered until removal",
  ];

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
              {professionalTools.map((tool) => (
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
              <img src={HIVE_INSPECTION} alt="" className="w-full h-full object-cover" />
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
          EFFICIENCY STATS MAP — THE BEEYIELD DIFFERENCE (DARK BG)
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
                              src={SENSOR_PORTRAIT}
                              alt="Precision tracking installed on hive frame"
                              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform"
                              style={{ transitionDuration: '2000ms' }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent" />
                          <div className="absolute bottom-12 left-12 right-12 p-10 bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl">
                              <div className="flex items-center gap-4 mb-6">
                                  <div className="h-0.5 w-12 bg-beeyield-green" />
                                  <span className="text-[10px] font-bold text-beeyield-green">Quality Assurance</span>
                              </div>
                              <p className="text-white text-xl md:text-2xl font-bold leading-tight tracking-tight">
                                  "Our commitment to our growers is to bring them complete transparency for the most effective pollination outcomes."
                              </p>
                              <div className="mt-4 flex items-center gap-4">
                                <span className="font-bold text-white text-sm">Ze'ev Barylka</span>
                                <span className="text-xs text-white/50 border-l border-white/20 pl-4">Chief Sales Officer</span>
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
                              At <strong className="text-neutral-900">BeeYield</strong>, we offer a data-driven approach to the critical process of managed pollination in commercial crop growing.
                          </p>
                          <p className="text-lg text-muted-foreground leading-relaxed">
                              Growers whose crops rely on commercial beekeepers for their annual pollination can now get <strong className="text-neutral-900">visibility and accountability</strong> for their pollination experience.
                          </p>
                      </div>

                      <div className="grid gap-8 pt-6">
                          <div className="flex items-start gap-6 group">
                              <div className="h-14 w-14 shrink-0 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-beeyield-green group-hover:border-beeyield-green transition-all shadow-sm">
                                  <Mic className="w-6 h-6 text-beeyield-green group-hover:text-white transition-colors" />
                              </div>
                              <div>
                                  <h4 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">In-Hive Sensors</h4>
                                  <p className="text-neutral-400 font-medium leading-relaxed">Equipped with small digital sensors capturing key info including temperature, humidity, and the sound of the hive.</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-6 group">
                              <div className="h-14 w-14 shrink-0 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-amber-400 group-hover:border-amber-400 transition-all shadow-sm">
                                  <Wifi className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors" />
                              </div>
                              <div>
                                  <h4 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">Gateway Communication</h4>
                                  <p className="text-neutral-400 font-medium leading-relaxed">Acting as a modem on the exterior of the hive, the Gateway continuously sends wireless sensor info to our system for review.</p>
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
                      BeeYield Hives are equipped with a suite of monitoring tools designed to measure activity and deliver analytics to growers without interfering with the natural process of the bees.
                  </p>
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
          WHY THIS MATTERS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4">
              <div className="text-center mb-20 max-w-3xl mx-auto">
                  <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                      Precision Agriculture
                  </Badge>
                  <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
                      Visibility and <span className="text-beeyield-green">Accountability</span>
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                      We replace any non-performing hives with stronger, more effective colonies. Here's why precision pollination provides unmatched transparency.
                  </p>
              </div>

              <div className="space-y-8 max-w-5xl mx-auto">
                  {pollinationAdvantages.map((adv, index) => (
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
                                  {adv.icon}
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
                          Easy-to-Understand <span className="text-beeyield-green">Visibility</span>
                      </h2>
                      <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                          All the key metrics for each orchard, from the day the bees are delivered until the day the beekeepers remove them, are displayed on the dashboard giving growers complete confidence.
                      </p>
                      <div className="space-y-5">
                          {aiCapabilities.map((cap, index) => (
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
                      {/* Apisense App matching the dashboard vibe */}
                      <div className="relative mx-auto max-w-md">
                          <div className="rounded-[2rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.25)] border-[6px] border-neutral-800 bg-neutral-900">
                              <img
                                  src={APISENSE_APP}
                                  alt="BeeYield Pollination Dashboard"
                                  className="w-full h-auto"
                              />
                          </div>
                      </div>

                      {/* Floating badges */}
                      <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-neutral-100 px-4 py-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-beeyield-green" />
                          <span className="text-xs font-bold text-neutral-900">Live Metrics</span>
                      </div>
                      <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-neutral-100 px-4 py-3 flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4 text-beeyield-green" />
                          <span className="text-xs font-bold text-neutral-900">Frames Per Acre</span>
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
          PARTNERS & FORM
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-neutral-50 relative overflow-hidden" id="in-hive-form">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-32 bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_24px_64px_rgba(0,0,0,0.04)] border border-neutral-100">
            <PollinationContactForm
              type="in_hive"
              title="Try BeeYield In-Hive in your apiary"
              description="Contact us to discuss how Precision Pollination can revolutionize your crop yield and deliver full accountability for your operation."
            />
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-8 px-5 py-2 font-semibold text-[10px] rounded-full">
                Global Ecosystem
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 tracking-tight text-neutral-900">We are building a global network of partners</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16 leading-relaxed">
              BeeYield collaborates with leading partners worldwide, joining forces with beekeeping equipment manufacturers, industry organizations, and renowned universities.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
                {[
                    { label: "Farmers", subtitle: "Crop Yield Partners", icon: Globe },
                    { label: "Apisense", subtitle: "Hardware Engineering", icon: Activity },
                    { label: "Monitored Hives", subtitle: "Global Fleet", icon: Cpu },
                ].map((partner, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col items-center gap-5 p-10 bg-white rounded-[2.5rem] border border-neutral-100 hover:border-beeyield-green/20 hover:shadow-lg transition-all group"
                    >
                        <div className="h-16 w-16 flex items-center justify-center bg-neutral-50 rounded-2xl border border-neutral-50 text-neutral-400 group-hover:bg-beeyield-green group-hover:text-white group-hover:border-beeyield-green transition-all shadow-sm">
                            <partner.icon className="h-7 w-7" />
                        </div>
                        <div className="text-center">
                            <span className="font-bold text-lg text-neutral-900 block">{partner.label}</span>
                            <span className="text-[10px] font-semibold text-neutral-400">{partner.subtitle}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
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
