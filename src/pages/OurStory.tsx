import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Users, Cpu, Sprout, ArrowRight, Heart, TreePine, Home, Hexagon,
  Radio, Scale, ChevronLeft, ChevronRight, Play, Pause
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

/* ── Authentic Field Photo Paths ────────────────────────────── */
const STORY_IMAGES = {
  deployedHive1: '/images/story/deployed-hive-antenna-1.png',
  deployedHive2: '/images/story/deployed-hive-antenna-2.png',
  apisenseCluster1: '/images/story/apisense-bees-cluster-1.png',
  apisenseCluster2: '/images/story/apisense-bees-cluster-2.png',
  apisenseCloseup1: '/images/story/apisense-bees-closeup-1.png',
  apisenseCloseup2: '/images/story/apisense-bees-closeup-2.png',
  beeColonyWide: '/images/story/bee-colony-device-wide.jpg',
  // Existing comb/probe/gateway images
  solarGateway: '/images/pollination/gateway-solar-node.png',
  hiveScale: '/images/pollination/hive-scale-loadcell.png',
  combProbe1: '/images/pollination/hive-comb-inspection-6.png',
  combProbe2: '/images/pollination/hive-comb-inspection-7.png',
  combProbe3: '/images/pollination/hive-comb-inspection-8.png',
};

/* ── Story Timeline Slideshow Data ──────────────────────────── */
const STORY_SLIDES = [
  {
    image: STORY_IMAGES.deployedHive1,
    title: 'Deployed IoT Hive — Night Field Check',
    description: 'A traditional Kenyan top-bar hive equipped with our solar antenna device on galvanized tin roofing, standing on the apiary pole stand during a nighttime field inspection.',
  },
  {
    image: STORY_IMAGES.deployedHive2,
    title: 'Standalone IoT Monitoring Station',
    description: 'Close-up showing the weatherproof antenna module bolted onto the hive lid, with the cellular uplink mast visible. One of 22 deployed IoT devices across our apiaries.',
  },
  {
    image: STORY_IMAGES.apisenseCloseup1,
    title: 'ApiSense Device — Live Bee Interaction',
    description: 'The ApiSense branded sensor board deployed inside a log hive. Worker bees interact naturally with the device, confirming full biocompatibility of the enclosure.',
  },
  {
    image: STORY_IMAGES.apisenseCluster1,
    title: 'Active Colony Around In-Hive Sensor',
    description: 'Hundreds of worker bees clustered around the in-hive ApiSense sensor, showing no rejection behavior — proof the hardware integrates seamlessly with colony life.',
  },
  {
    image: STORY_IMAGES.beeColonyWide,
    title: 'Dense Bee Colony with Sensor Probe',
    description: 'Wide-angle capture showing the full density of a thriving African bee colony inside a traditional log hive, with the dark sensor board visible at the bottom of the comb mass.',
  },
  {
    image: STORY_IMAGES.apisenseCloseup2,
    title: 'ApiSense Branding — Bee Landing on PCB',
    description: 'A forager bee landing directly on the ApiSense-branded PCB. The green logo is clearly visible — this is real hardware in a real hive, not a render.',
  },
  {
    image: STORY_IMAGES.apisenseCluster2,
    title: 'In-Hive Telemetry Cluster View',
    description: 'The ApiSense sensor node surrounded by worker bees inside the log hive cavity. LED indicator and data bus lines are visible alongside propolis deposits.',
  },
  {
    image: STORY_IMAGES.solarGateway,
    title: 'Solar LTE Gateway Node',
    description: 'The autonomous solar-powered LTE gateway with integrated harvest panel and dual high-gain antennas, deployed in a Kenyan apiary for continuous real-time data uplink.',
  },
  {
    image: STORY_IMAGES.hiveScale,
    title: 'Under-Hive Precision Load Cell',
    description: 'Industrial-grade load cell bar mounted beneath a traditional wooden hive floor, continuously measuring diurnal nectar flows, foraging gains, and swarming weight departures.',
  },
  {
    image: STORY_IMAGES.combProbe2,
    title: 'Bees Building Wax on Sensor Frame',
    description: 'Fresh white honeycomb wax being built directly onto the in-hive sensor frame by worker bees — demonstrating complete acceptance of the biocompatible hardware.',
  },
];

/* ── Story Slideshow Component ──────────────────────────────── */
const StorySlideshow = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % STORY_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const slide = STORY_SLIDES[activeIdx];

  return (
    <div className="bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
      <div className="relative aspect-[4/3] overflow-hidden group">
        <motion.img
          key={activeIdx}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Nav Arrows */}
        <button
          onClick={() => setActiveIdx((prev) => (prev - 1 + STORY_SLIDES.length) % STORY_SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center border border-white/20 hover:bg-beeyield-green hover:text-black transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setActiveIdx((prev) => (prev + 1) % STORY_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center border border-white/20 hover:bg-beeyield-green hover:text-black transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center border border-white/20 hover:bg-white/20"
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        {/* Counter */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-beeyield-green text-neutral-950 font-bold px-3 py-1 text-[10px]">
            {activeIdx + 1} / {STORY_SLIDES.length}
          </Badge>
        </div>
      </div>

      {/* Caption */}
      <div className="p-6 md:p-8">
        <h4 className="text-white font-bold text-lg mb-2">{slide.title}</h4>
        <p className="text-neutral-400 text-sm leading-relaxed">{slide.description}</p>
      </div>

      {/* Thumbnail Strip */}
      <div className="px-6 pb-6 flex gap-2 overflow-x-auto scrollbar-hide">
        {STORY_SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
              i === activeIdx ? 'border-beeyield-green scale-110' : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

const OurStory = () => {
  return (
    <BeeYieldPageShell className="min-h-screen bg-background p-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
        {/* Background: Authentic deployed hive photo */}
        <div className="absolute inset-0">
          <img
            src={STORY_IMAGES.deployedHive1}
            alt="BeeYield IoT hive deployed in Kenyan apiary at night"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/92 via-white/85 to-white/95" />
        </div>

        {/* Decorative Background Icons */}
        <div className="absolute top-20 right-10 text-primary/5 animate-pulse">
          <Hexagon size={120} strokeWidth={1} />
        </div>
        <div className="absolute bottom-20 left-10 text-accent/10">
          <Hexagon size={180} strokeWidth={1} className="rotate-12" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6 px-4 py-1 text-sm">
                Our story
              </Badge>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
                The Story of <span className="text-primary">BeeYield</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Born in Kibwezi, Makueni County, Kenya — a story of family, resilience, and a mission to improve pollination for a sustainable future.
              </p>
            </div>

            <div className="relative mx-auto lg:ml-auto max-w-md lg:max-w-full flex justify-center">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl rounded-full" />
              <img
                src={Logo}
                alt="BeeYield Logo"
                className="relative w-full max-w-[400px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-xl shadow-xl border border-border/50 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Radio size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold">22 IoT Devices</p>
                  <p className="text-xs text-muted-foreground">Deployed & Live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story — with authentic ApiSense bee photo */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/10 rounded-3xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-500" />
                <img
                  src={STORY_IMAGES.apisenseCloseup1}
                  alt="ApiSense branded sensor inside active beehive with Kenyan worker bees"
                  className="relative rounded-3xl shadow-lg w-full object-cover h-[400px] lg:h-[500px]"
                />
                {/* Floating Quote Card */}
                <Card className="absolute -bottom-8 -right-8 w-[90%] sm:w-[80%] shadow-xl border-none bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="text-4xl text-primary font-serif">"</div>
                      <blockquote className="text-lg font-medium text-foreground">
                        Sometimes, the spark for something big comes from boredom, family, and a little bit of courage.
                      </blockquote>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <Badge variant="outline" className="mb-2">
                <Home className="mr-2 h-3 w-3" />
                Kibwezi, Kenya • 2020
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                A Pandemic Spark, a Family Mission
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  In 2020, as the world slowed down during the COVID pandemic, <strong className="text-foreground">Timothy Nduva</strong> found himself restless in rural Kibwezi, Kenya. While attending Strathmore University, Timothy's curiosity and drive for innovation grew. The unique challenges of the pandemic became the spark that ignited BeeYield's vision for scalable, tech-driven beekeeping solutions.
                </p>
                <p>
                  But BeeYield was never a solo journey. Timothy's sisters, <strong className="text-foreground">Agatha</strong> and <strong className="text-foreground">Carole</strong>, brought their own unique skills—ranging from web development and product design to IoT research. Together, the siblings transformed a small family apiary into a platform for technological advancement and agricultural impact.
                </p>
                <p>
                  What began with just half an acre and four hives quickly became a family mission to empower farmers, advance pollination, and prove that innovation can flourish anywhere—even in the most unexpected places.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Journey — Updated Stats */}
      <section className="bg-muted/30 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
              From 4 Hives to 184 — Our Growth Journey
            </h2>
            <p className="text-muted-foreground">
              What began on half an acre has grown into a thriving 5-acre apiary, with 22 IoT devices deployed across our network.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { number: "184+", label: "Beehives", desc: "From 4 to 184 hives" },
              { number: "22", label: "IoT Devices", desc: "Deployed & transmitting live" },
              { number: "45", label: "Acres Pollinated", desc: "Client farmlands served" },
              { number: "3t", label: "Carbon Offset", desc: "CO₂ sequestered to date" },
            ].map((stat, i) => (
              <Card key={i} className="text-center border-border/50">
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-primary mb-1">{stat.number}</p>
                  <p className="text-lg font-semibold text-foreground">{stat.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Field Photography Slideshow — All Authentic Photos */}
      <section className="py-16 sm:py-20 lg:py-24 bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <Badge className="bg-beeyield-green/20 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
              100% Authentic Field Photography
            </Badge>
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Real Hives. Real Devices. <span className="text-beeyield-green">Real Bees.</span>
            </h2>
            <p className="text-neutral-400">
              Every image below is a genuine photograph from our Kenyan apiaries — no AI-generated imagery, no stock photos, no renders.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <StorySlideshow />
          </div>
        </div>
      </section>

      {/* Values / Who We Are */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
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
                title: "Family-Driven",
                desc: "Built by siblings Timothy, Agatha, and Carole — we combine passion with purpose, bringing diverse skills under one shared vision."
              },
              {
                icon: Sprout,
                title: "Guardians of Nature",
                desc: "With 2,500+ trees planted and 3 tons of carbon offset, we're not just beekeepers — we're ecosystem builders committed to environmental restoration."
              },
              {
                icon: Cpu,
                title: "Precision Pollination",
                desc: "With 22 IoT devices deployed across 45 acres, we're using real-time sensor data to maximize pollination impact for farmers across Kenya."
              }
            ].map((item, i) => (
              <Card key={i} className="group border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pollination Services Section — with real deployed hive image */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <Badge variant="outline">
                <TreePine className="mr-2 h-3 w-3" />
                Our Services
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                From Traditional to Precision Pollination
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our pollination journey started with traditional methods — moving hives to client farms and letting nature do its work. We successfully pollinated <strong className="text-foreground">45 acres</strong> of farmland with <strong className="text-foreground">22 IoT-monitored hives</strong>, proving the value of managed precision pollination services in Kenya.
                </p>
                <p>
                  But we knew we could do more. Today, BeeYield is evolving toward precision pollination — using sensors, data, and hive management to deliver clear pollination results, with <strong className="text-foreground">3 tons</strong> of carbon offset through native tree restoration.
                </p>
                <p>
                  Our goal is to help farmers across the world increase their yields while supporting bee health and biodiversity.
                </p>
              </div>
              <Button asChild className="mt-4">
                <Link to="/pollination-solutions">
                  Explore Our Solutions <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-neutral-200">
                <img
                  src={STORY_IMAGES.deployedHive2}
                  alt="BeeYield IoT hive with antenna device deployed on traditional Kenyan beehive"
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-background p-4 rounded-2xl shadow-xl border border-border/50 flex items-center gap-3">
                <div className="p-2 bg-beeyield-green/10 rounded-full text-beeyield-green">
                  <Scale size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">45 Acres</p>
                  <p className="text-xs text-muted-foreground">Precision Pollinated</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-background p-4 rounded-2xl shadow-xl border border-border/50 flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-full text-amber-700">
                  <Radio size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">22 Devices</p>
                  <p className="text-xs text-muted-foreground">Live IoT Network</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-[#0A2612] text-[#1A1A1A] border-none shadow-2xl rounded-[3rem] overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#1B9157] rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F4D03F] rounded-full blur-3xl -ml-32 -mb-32" />

              <h2 className="text-3xl font-bold sm:text-5xl mb-6 relative z-10 text-[#1A1A1A]">
                Join Us on Our <span className="text-[#1B9157]">Journey</span>
              </h2>
              <p className="text-[#1B9157]/80 max-w-2xl mx-auto mb-10 text-lg relative z-10">
                From a family dream in rural Kenya to 22 IoT devices monitoring 45 acres — we're just getting started. Partner with us to improve agriculture.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Button size="lg" className="bg-[#FFF9F0] text-[#1B9157] hover:bg-green-50 font-bold px-8 h-12 rounded-xl" asChild>
                  <Link to="/contact">Get In Touch</Link>
                </Button>
                <Button variant="outline" size="lg" className="border-[#F4D03F]/40 text-[#1A1A1A] hover:bg-[#F4D03F]/10 font-bold px-8 h-12 rounded-xl" asChild>
                  <Link to="/careers">Join Our Team</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* About Videos */}
      <section className="bg-[#F0F7F0] py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              Watch BeeYield
            </Badge>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Our Story In Motion
            </h2>
            <p className="mt-4 text-muted-foreground">
              Two key videos covering BeeYield's story and the field reality behind our work.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
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
    </BeeYieldPageShell>
  );
};

export default OurStory;
