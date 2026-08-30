import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Users, Cpu, Sprout, ArrowRight, Heart, TreePine, Home, Hexagon,
  Radio, Scale, ShieldCheck, Activity, Zap, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { ThreePhotoSlideshow, SlideItem } from "@/components/ThreePhotoSlideshow";

/* ── Authentic Field Photo Assets (Zero AI Renders) ──────────── */
const STORY_IMAGES = {
  deployedHive1: '/images/story/deployed-hive-antenna-1.png',
  deployedHive2: '/images/story/deployed-hive-antenna-2.png',
  apisenseCluster1: '/images/story/apisense-bees-cluster-1.png',
  apisenseCluster2: '/images/story/apisense-bees-cluster-2.png',
  apisenseCloseup1: '/images/story/apisense-bees-closeup-1.png',
  apisenseCloseup2: '/images/story/apisense-bees-closeup-2.png',
  beeColonyWide: '/images/story/bee-colony-device-wide.jpg',
  solarGateway: '/images/pollination/gateway-solar-node.png',
  hiveScale: '/images/pollination/hive-scale-loadcell.png',
  combProbe1: '/images/pollination/hive-comb-inspection-6.png',
  combProbe2: '/images/pollination/hive-comb-inspection-7.png',
  combProbe3: '/images/pollination/hive-comb-inspection-8.png',
  fieldInspection1: '/images/diseases/hive-inspection-1.png',
  fieldInspection2: '/images/diseases/hive-inspection-2.png',
};

const OurStory = () => {
  return (
    <BeeYieldPageShell className="min-h-screen bg-background p-0">
      
      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION — Real IoT Deployed Hive Background
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32 border-b border-neutral-100">
        <div className="absolute inset-0">
          <img
            src={STORY_IMAGES.deployedHive1}
            alt="BeeYield IoT hive deployed in Kenyan apiary with solar antenna on roof"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/94 via-white/86 to-white/96" />
        </div>

        <div className="absolute top-20 right-10 text-primary/5 animate-pulse">
          <Hexagon size={120} strokeWidth={1} />
        </div>
        <div className="absolute bottom-20 left-10 text-accent/10">
          <Hexagon size={180} strokeWidth={1} className="rotate-12" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm bg-beeyield-green/10 text-beeyield-green font-bold rounded-full">
                Our Authentic Story
              </Badge>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
                The Story of <span className="text-primary">BeeYield</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8">
                Born in Kibwezi, Makueni County, Kenya — a story of family, resilience, and 22 IoT devices transforming 45 acres of pollination.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="px-4 py-2 bg-white/80 backdrop-blur rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-2">
                  <Radio className="w-4 h-4 text-beeyield-green" />
                  <span className="text-xs font-bold text-neutral-900">22 IoT Devices Deployed</span>
                </div>
                <div className="px-4 py-2 bg-white/80 backdrop-blur rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-beeyield-green" />
                  <span className="text-xs font-bold text-neutral-900">45 Acres Pollinated</span>
                </div>
                <div className="px-4 py-2 bg-white/80 backdrop-blur rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-beeyield-green" />
                  <span className="text-xs font-bold text-neutral-900">3t Carbon Offset</span>
                </div>
              </div>
            </div>

            <div className="relative mx-auto lg:ml-auto max-w-md lg:max-w-full flex justify-center">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl rounded-full" />
              <img
                src={Logo}
                alt="BeeYield Logo"
                className="relative w-full max-w-[380px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. ORIGIN STORY — ApiSense PCB In-Hive with Live Worker Bees
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 lg:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            
            {/* Visual Photo Card: Real ApiSense Bee Landing */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-beeyield-green/20 to-amber-400/20 rounded-[3rem] blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-neutral-200 bg-neutral-950 aspect-[4/3]">
                <img
                  src={STORY_IMAGES.apisenseCloseup2}
                  alt="ApiSense sensor PCB with worker bee landed directly on device inside Kenyan hive"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <Badge className="bg-beeyield-green text-neutral-950 font-bold px-3 py-1 text-[9px] mb-2">Ground Truth</Badge>
                  <p className="text-white font-bold text-base leading-snug">
                    Real ApiSense sensor board inside Kenyan log hive with active worker bee on PCB
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Badge variant="outline" className="mb-2">
                <Home className="mr-2 h-3 w-3" />
                Kibwezi, Kenya • 2020 Origin
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight">
                A Pandemic Spark, a Family Mission
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  In 2020, during the COVID pandemic, <strong className="text-foreground">Timothy Nduva</strong> found himself restless in rural Kibwezi, Kenya. While studying at Strathmore University, Timothy's drive for technological innovation grew. He began experimenting with sensors inside traditional beehives on a half-acre family plot.
                </p>
                <p>
                  BeeYield was built together with Timothy's sisters, <strong className="text-foreground">Agatha</strong> and <strong className="text-foreground">Carole</strong>. Combining software engineering, product architecture, and IoT research, the siblings transformed a small family apiary into a precision pollination engine.
                </p>
                <p>
                  What started with 4 hives on half an acre has grown into 184+ hives, 22 IoT devices deployed, and 45 acres precision-pollinated across Kenya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. GROWTH JOURNEY — 4 Verified Metrics + 4 Visual Photos
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50/70 py-20 sm:py-24 border-y border-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-4 px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider">
              Measurable Progress
            </Badge>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight mb-4">
              From 4 Hives to 184 — Our Growth in Numbers & Photos
            </h2>
            <p className="text-muted-foreground">
              Real field milestones achieved across our Kibwezi and Makueni apiaries.
            </p>
          </div>

          {/* Metric Numbers */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
            {[
              { number: "184+", label: "Beehives", desc: "Active colony inventory" },
              { number: "22", label: "IoT Devices", desc: "Live telemetry nodes" },
              { number: "45", label: "Acres Pollinated", desc: "Client orchards served" },
              { number: "3t", label: "Carbon Offset", desc: "CO₂ sequestered to date" },
            ].map((stat, i) => (
              <Card key={i} className="text-center border-border/50 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <p className="text-4xl font-black text-primary mb-1 tracking-tight">{stat.number}</p>
                  <p className="text-lg font-bold text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 4-Photo Growth Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-md group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={STORY_IMAGES.deployedHive1}
                  alt="Traditional Kenyan hive with solar antenna device"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white">
                <span className="text-[10px] font-bold text-beeyield-green uppercase">Stage 1</span>
                <h4 className="font-bold text-sm text-neutral-900 mt-1">IoT Top-Bar Hive Deployment</h4>
                <p className="text-xs text-neutral-500 mt-1">Solar antenna module bolted to galvanized tin hive roof.</p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-md group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={STORY_IMAGES.apisenseCluster1}
                  alt="Hundreds of worker bees clustered around in-hive sensor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white">
                <span className="text-[10px] font-bold text-beeyield-green uppercase">Stage 2</span>
                <h4 className="font-bold text-sm text-neutral-900 mt-1">In-Hive Sensor Acceptance</h4>
                <p className="text-xs text-neutral-500 mt-1">Colony acceptance verified with worker bee cluster on probe.</p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-md group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={STORY_IMAGES.solarGateway}
                  alt="Solar IoT LTE Transmission Hub"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white">
                <span className="text-[10px] font-bold text-beeyield-green uppercase">Stage 3</span>
                <h4 className="font-bold text-sm text-neutral-900 mt-1">Solar LTE Gateway Hub</h4>
                <p className="text-xs text-neutral-500 mt-1">Autonomous high-gain antenna node relaying yard data.</p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-md group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={STORY_IMAGES.combProbe2}
                  alt="In-hive brood inspection and early disease detection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white">
                <span className="text-[10px] font-bold text-beeyield-green uppercase">Stage 4</span>
                <h4 className="font-bold text-sm text-neutral-900 mt-1">Detect Bee Diseases & Pathogens</h4>
                <p className="text-xs text-neutral-500 mt-1">Early detection of Varroa mites, Foulbrood, and brood stress directly on the comb.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. OUR STORY IN PHOTOS — Multiple 3-Photo Slideshows
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-neutral-950 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-4 px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider">
              100% Authentic Field Archive
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Our Story <span className="text-beeyield-green">in Photos</span>
            </h2>
            <p className="text-neutral-400 text-base">
              4 curated 3-photo slideshows tracking our journey from early in-hive hardware experiments in Kibwezi to 22 IoT-monitored hive stations across Kenya.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            
            {/* Slideshow 1: Origin & Early In-Hive Probes */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: STORY_IMAGES.apisenseCloseup1,
                  title: "ApiSense Bio-Sensor Probe",
                  subtitle: "In-hive probe installed inside log hive cavity",
                  badge: "Kibwezi Origin",
                  description: "Initial hardware prototypes tested in traditional log hives to monitor internal brood microclimate non-invasively."
                },
                {
                  image: STORY_IMAGES.apisenseCloseup2,
                  title: "Forager Bee on ApiSense PCB",
                  subtitle: "Live worker bee landed directly on sensor board",
                  badge: "Zero Rejection",
                  description: "Worker bees accept the electronic hardware immediately, navigating the sensor board without alarm responses."
                },
                {
                  image: STORY_IMAGES.beeColonyWide,
                  title: "Thriving African Bee Colony",
                  subtitle: "Dense worker population around probe",
                  badge: "Colony Vitality",
                  description: "Full-depth colony cluster proving healthy brood rearing alongside digital telemetry equipment."
                }
              ]}
              badge="Hardware Roots"
              title="Origin & Bio-Sensors"
              subtitle="Early prototypes & bee behavior"
              dark={true}
            />

            {/* Slideshow 2: Scaling to 22 Deployed IoT Hives */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: STORY_IMAGES.deployedHive1,
                  title: "Night Field Hive Inspection",
                  subtitle: "Solar antenna module on galvanized tin roof",
                  badge: "22 Deployed Hives",
                  description: "Field deployment on anti-termite stand transmitting live ambient and internal telemetry throughout the night."
                },
                {
                  image: STORY_IMAGES.deployedHive2,
                  title: "Top-Bar Hive Station on Stand",
                  subtitle: "Weatherproof antenna unit mounted on lid",
                  badge: "45 Acres Served",
                  description: "Robust solar-powered node operating at commercial orchard boundaries to monitor pollinator foraging density."
                },
                {
                  image: STORY_IMAGES.solarGateway,
                  title: "Autonomous Solar LTE Hub",
                  subtitle: "High-gain dual antenna yard gateway",
                  badge: "Zero-Watt Grid",
                  description: "Self-powered gateway aggregating data from all local hive sensors and relaying to cloud dashboards in real time."
                }
              ]}
              badge="Network Scale"
              title="22 IoT Deployed Stations"
              subtitle="Solar antennas & hive stands"
              dark={true}
            />

            {/* Slideshow 3: In-Hive Sensor Integration */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: STORY_IMAGES.apisenseCluster1,
                  title: "Active Colony Around Probe",
                  subtitle: "Hundreds of bees clustered on sensor",
                  badge: "Colony Vitality",
                  description: "Continuous microclimate and acoustics tracking with seamless bee acceptance inside hive."
                },
                {
                  image: STORY_IMAGES.apisenseCluster2,
                  title: "Dense Bee Cluster Telemetry",
                  subtitle: "Worker bees covering vertical sensor node",
                  badge: "Bee Behavior",
                  description: "Proves complete biological acceptance with bees moving freely across probe surface."
                },
                {
                  image: STORY_IMAGES.fieldInspection1,
                  title: "In-Hive Multi-Frame Probe",
                  subtitle: "Vertical sensor between brood frames",
                  badge: "Brood Diagnostics",
                  description: "Direct observation of brood thermoregulation stability across commercial hives."
                }
              ]}
              badge="Bio-Telemetry"
              title="Colony Bio-Telemetry"
              subtitle="Live bee clusters & sensors"
              dark={true}
            />

            {/* Slideshow 4: Precision Pollination & Disease Screening */}
            <ThreePhotoSlideshow
              slides={[
                {
                  image: STORY_IMAGES.hiveScale,
                  title: "Under-Hive Load Cell Bar",
                  subtitle: "Sub-milligram continuous scale telemetry",
                  badge: "Weight Delta",
                  description: "Industrial scale bar tracking daily nectar inflow and hive biomass continuously during crop bloom."
                },
                {
                  image: STORY_IMAGES.combProbe2,
                  title: "Detect Bee Diseases & Brood Health",
                  subtitle: "Early pathogen screening on drawn brood comb",
                  badge: "Disease Detection",
                  description: "Sensor-equipped frames enable early identification of American Foulbrood, chalkbrood, and Varroa-related brood abnormalities."
                },
                {
                  image: STORY_IMAGES.combProbe3,
                  title: "Multi-Frame Brood Coverage",
                  subtitle: "Top-down commercial hive inspection",
                  badge: "3t Carbon Offset",
                  description: "Parallel active frames showing full brood vitality and verified strength across precision-pollinated client orchards."
                }
              ]}
              badge="Disease Defense"
              title="Scales & Disease Detection"
              subtitle="Continuous scales & pathogen defense"
              dark={true}
            />

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. WHO WE ARE & OUR VALUES
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight">
              Who We Are And What We Stand For
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three siblings, one mission: modernizing pollination in Kenya and beyond.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Family-Driven Innovation",
                desc: "Founded by siblings Timothy, Agatha, and Carole — combining agricultural passion with world-class IoT, data science, and web engineering."
              },
              {
                icon: Sprout,
                title: "Guardians of Biodiversity",
                desc: "With 2,500+ indigenous trees planted and 3 tons of carbon offset, we're ecosystem builders committed to long-term ecological restoration."
              },
              {
                icon: Cpu,
                title: "Precision Pollination",
                desc: "With 22 IoT devices deployed across 45 acres, we use real-time sensor data to optimize fruit set and yield for Kenyan smallholders."
              }
            ].map((item, i) => (
              <Card key={i} className="group border-border/50 rounded-3xl transition-all hover:border-primary/50 hover:shadow-lg bg-neutral-50/50">
                <CardContent className="p-8">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. PRECISION POLLINATION SERVICES — Side-by-Side Photo Story
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 sm:py-24 border-t border-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="px-3 py-1">
                <TreePine className="mr-2 h-3 w-3" />
                Precision Pollination Services
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight">
                From Traditional Beekeeping to Precision Pollination
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Our pollination journey started with traditional methods — moving hives to client farms and letting nature do its work. We successfully pollinated <strong className="text-foreground">45 acres</strong> of farmland with <strong className="text-foreground">22 IoT-monitored hives</strong>, proving the value of managed precision pollination services in Kenya.
                </p>
                <p>
                  Today, BeeYield uses continuous under-hive weight telemetry, acoustic monitoring, and climate tracking to deliver transparent pollination results with <strong className="text-foreground">3 tons</strong> of carbon offset.
                </p>
                <p>
                  Our goal is to help growers increase crop yields while protecting pollinator colonies and biodiversity across Africa.
                </p>
              </div>
              <Button asChild className="mt-4 rounded-2xl h-12 px-8 bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs shadow-lg">
                <Link to="/pollination-solutions">
                  Explore Our Solutions <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl overflow-hidden border border-neutral-200 shadow-lg aspect-square bg-neutral-900">
                <img
                  src={STORY_IMAGES.deployedHive2}
                  alt="IoT hive with antenna on lid"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-3xl overflow-hidden border border-neutral-200 shadow-lg aspect-square bg-neutral-900">
                <img
                  src={STORY_IMAGES.combProbe2}
                  alt="Comb disease detection on sensor frame"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-3xl overflow-hidden border border-neutral-200 shadow-lg aspect-square bg-neutral-900">
                <img
                  src={STORY_IMAGES.solarGateway}
                  alt="Solar LTE IoT gateway"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-3xl overflow-hidden border border-neutral-200 shadow-lg aspect-square bg-neutral-900">
                <img
                  src={STORY_IMAGES.apisenseCloseup1}
                  alt="ApiSense sensor board in hive"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7. VIDEOS SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 border-t border-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              Watch BeeYield
            </Badge>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight">
              Our Story In Motion
            </h2>
            <p className="mt-4 text-muted-foreground">
              Two key videos covering BeeYield's story and the field reality behind our work.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
            <YouTubeEmbed
              title="About BeeYield"
              wrapperClassName="aspect-video"
            />
            <YouTubeEmbed
              title="BeeYield Video"
              wrapperClassName="aspect-video"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          8. CTA SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-[#0A2612] text-white border-none shadow-2xl rounded-[3rem] overflow-hidden">
            <CardContent className="p-8 sm:p-14 text-center relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#1B9157] rounded-full blur-3xl -mr-32 -mt-32 opacity-30" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F4D03F] rounded-full blur-3xl -ml-32 -mb-32 opacity-30" />

              <h2 className="text-3xl font-bold sm:text-5xl mb-6 relative z-10 text-white">
                Join Us on Our <span className="text-[#1B9157]">Journey</span>
              </h2>
              <p className="text-neutral-300 max-w-2xl mx-auto mb-10 text-lg relative z-10">
                From a family dream in rural Kenya to 22 IoT devices monitoring 45 acres — we're just getting started. Partner with us to modernize agriculture.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Button size="lg" className="bg-white text-neutral-950 hover:bg-neutral-100 font-bold px-8 h-12 rounded-xl" asChild>
                  <Link to="/contact">Get In Touch</Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 font-bold px-8 h-12 rounded-xl" asChild>
                  <Link to="/careers">Join Our Team</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

    </BeeYieldPageShell>
  );
};

export default OurStory;
