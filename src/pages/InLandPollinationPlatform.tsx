
import { Link } from "react-router-dom";
import {
  Mic, Map, LayoutDashboard, ArrowRight, Cpu,
  Quote, Activity, Mail, ChevronRight,
  BarChart3, Signal, Play, Star, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PollinationContactForm } from "@/components/PollinationContactForm";
import { Card, CardContent } from "@/components/ui/card";

const InLandPollination = () => {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Almond Grower, Central Valley CA",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
      quote: "PLIP gave us visibility we never had before. We spotted a cold spot in the north orchard and adjusted hive placement—15% yield increase that season."
    },
    {
      name: "Miguel Rodriguez",
      role: "Blueberry Farm Owner, WA",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      quote: "Acoustic monitoring tells us exactly when bees are active. We time nutrient sprays around that so we don’t disrupt pollination."
    },
    {
      name: "David Chen",
      role: "Seed Producer, OR",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
      quote: "Real-time data on the dashboard allowed us to catch a weak pollination window early. We supplemented the hives within 24 hours and saved the season."
    }
  ];

  return (
    <div className="pt-8">
      {/* Hero Section - The Science of Sight */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
        {/* Architectural Background */}
        <div className="absolute inset-0 bg-[#f9fafb]">
          <div className="absolute top-0 right-0 w-[45%] h-full bg-beeyield-green pointer-events-none transform skew-x-[-12deg] translate-x-20 shadow-[-40px_0_80px_rgba(0,0,0,0.1)]" />
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #064e3b 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          {/* Large Editorial Watermark */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute left-8 top-1/2 -translate-y-1/2 hidden 2xl:block pointer-events-none"
          >
            <span className="text-[180px] font-black text-neutral-200/40 tracking-tighter leading-none select-none uppercase" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
              In-Land Intelligence
            </span>
          </motion.div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge className="mb-8 bg-beeyield-green/10 text-beeyield-green border-beeyield-green/20 px-6 py-2 rounded-full font-black uppercase tracking-[0.3em] text-[10px] backdrop-blur-md shadow-sm">
                <Signal className="w-3.5 h-3.5 mr-2 animate-pulse" />
                Live Field Telemetry Platform
              </Badge>

              <h1 className="text-6xl md:text-8xl font-black text-neutral-900 mb-8 tracking-tighter leading-[0.8] uppercase italic">
                The Field <br />
                <span className="text-beeyield-green">Visible.</span> <br />
                <span className="text-beeyield-gold">Quantified.</span>
              </h1>

              <p className="text-xl md:text-2xl text-neutral-500 mb-10 max-w-xl leading-relaxed font-medium tracking-tight">
                BeeYield's <span className="text-neutral-900 font-bold italic">Pollination Land Insight Platform (PLIP)</span> delivers granular data on per-flower bee visits, turning field variables into actionable metrics.
              </p>

              <div className="flex flex-wrap gap-6 mb-16">
                <Button size="lg" className="bg-neutral-900 hover:bg-beeyield-green text-white font-black rounded-[2rem] px-10 h-16 shadow-2xl transition-all hover:scale-105 uppercase tracking-widest text-[11px]" onClick={() => document.getElementById('in-land-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  Deploy Intelligence <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-neutral-100 text-neutral-900 hover:bg-neutral-50 font-black rounded-[2rem] px-10 h-16 uppercase tracking-widest text-[11px] backdrop-blur-sm" asChild>
                  <Link to="/precision-pollination">The Architecture</Link>
                </Button>
              </div>

              {/* Status Bar */}
              <div className="flex items-center gap-10 pt-8 border-t border-neutral-100">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Network Version</span>
                  <span className="text-xl font-bold text-neutral-900 uppercase">PLIP v4.2</span>
                </div>
                <div className="w-px h-10 bg-neutral-100" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Sync Latency</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xl font-bold text-neutral-900 uppercase">Real-Time</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              {/* Dynamic Visualization Module */}
              <div className="relative z-10 aspect-square max-w-xl mx-auto bg-neutral-900 rounded-[4rem] flex flex-col items-center justify-center shadow-[0_64px_128px_-32px_rgba(0,0,0,0.4)] border border-white/10 group overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1598135753163-6167c1a1ad65?q=80&w=1200&auto=format&fit=crop"
                  alt="Sunflower Field"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000"
                />

                <div className="relative z-20 flex flex-col items-center gap-6">
                  <div className="w-24 h-24 bg-beeyield-gold/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-beeyield-gold/30 shadow-[0_0_40px_rgba(244,208,63,0.2)] animate-pulse">
                    <Signal className="h-12 w-12 text-beeyield-gold" />
                  </div>
                  <div className="text-center px-8">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-1">Detection Logic active</h3>
                    <p className="text-sm text-neutral-400 font-medium">Acoustic Signature Recognition Module: ON</p>
                  </div>
                </div>

                {/* Data Stream Animation */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-neutral-900 to-transparent p-10 flex flex-col justify-end">
                  <div className="flex items-center justify-between border-t border-white/10 pt-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-beeyield-green uppercase tracking-widest">Flora Density</span>
                      <span className="text-2xl font-black text-white tracking-tighter">0.82 pt</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-black text-beeyield-gold uppercase tracking-widest">Visitation Index</span>
                      <span className="text-2xl font-black text-white tracking-tighter">42.8 v/m</span>
                    </div>
                  </div>
                </div>

                {/* Scanline */}
                <motion.div
                  animate={{ y: ["0%", "100%", "0%"] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-beeyield-gold/5 to-transparent h-40 w-full pointer-events-none"
                />
              </div>

              {/* Floating Floating Accreditation Tag */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-neutral-100 rotate-12"
              >
                <div className="flex flex-col items-center text-center">
                  <ShieldCheck className="h-8 w-8 text-beeyield-green mb-2" />
                  <span className="text-sm font-black text-neutral-900 uppercase leading-none">Verified</span>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Platform Core</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Is PLIP + Quote */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-foreground">PLIP. BeeYield's In-Land Solution</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                BeeYield's Pollination Land Insight Platform (PLIP) measures bee activity in crops. You see how many bees are actually pollinating your crop and get data in real time so you can act on it.
              </p>
            </div>

            <div className="bg-secondary/50 p-8 rounded-2xl border-l-4 border-primary">
              <Quote className="h-10 w-10 text-primary mb-4 opacity-50" />
              <p className="text-lg text-foreground leading-relaxed mb-6">
                "PLIP lets us see the actual number of bees that visit the flowers. Now I can check the amount of pollination in our lands 24/7."
              </p>
              <div>
                <p className="font-bold text-foreground">Avi Gabai</p>
                <p className="text-sm text-muted-foreground">Hazera Seed Production Israel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Breakdown (Acoustics & Visibility) */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Acoustic Sensor Card */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">We Can Hear Bees!</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Designed to handle outdoor conditions, our new sensor features a larger enclosure for improved battery life and uses custom analysis to detect bee flight signatures.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary">
                  Learn More <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
            {/* Visibility Card */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Map className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Visibility Into Every Land</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Accurate information about forage rates allows for real-time responses. You can see actual pollinator visits on the flower, efficiency of the pollination process, and data on the degree to which synchronized bloom has occurred, all in real-time.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary">
                  View Demo <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="relative">
              {/* Dashboard Mockup */}
              <div className="bg-muted/50 rounded-2xl p-6 shadow-xl border border-border">
                <div className="bg-background rounded-xl p-6 shadow-inner">
                  <div className="flex items-center gap-3 mb-6">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    <span className="font-bold text-foreground">PLIP Dashboard Live View</span>
                  </div>
                  <div className="flex items-end gap-2 h-32">
                    {[40, 70, 50, 90, 60, 30, 80, 50].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t-md" style={{ height: `${h}% ` }} />
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating Metric Badge */}
              <div className="absolute -bottom-6 -right-6 bg-background rounded-xl shadow-lg p-4 border border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Visits / Min
                </div>
                <p className="text-2xl font-bold text-foreground">42.8</p>
              </div>
            </div>

            <div>
              <Badge variant="secondary" className="mb-4">
                <Activity className="h-3 w-3 mr-1" />
                Data Driven
              </Badge>
              <h2 className="text-4xl font-bold mb-6 text-foreground">All on an Easy-to-Read Dashboard</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The PLIP dashboard presents key metrics and delivers actionable insights every day the bees are at work. It gives highly detailed information on the per minute bee visits from each land's data collection points.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                With PLIP you can compare the impact of pollination activity among different genetic strains of the same varietal, filter by different production practices and treatments, track and correlate output rates, as well as quality levels and germination rates.
              </p>

              {/* Research Quote */}
              <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-sm text-foreground mb-2">
                  "We built highly sensitive analysis models that can distinguish the acoustic signature of a flying bee from a tractor engine on the same frequency."
                </p>
                <p className="text-xs font-bold text-foreground">George Clouston</p>
                <p className="text-xs text-muted-foreground">Research Director</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Testimonials with Photos */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">Hear What Our Growers Have to Say</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Real results from farms across the country using the Pollination Land Insight Platform.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((t, i) => (
              <Card key={i} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={t.image} alt={t.name} className="h-14 w-14 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Success */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square max-w-sm mx-auto bg-gradient-to-br from-secondary to-muted rounded-full flex items-center justify-center">
                <div className="h-40 w-40 bg-muted rounded-full shadow-inner" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">We Don't Succeed Unless You Succeed</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We want our partnership with you to be as smooth and stress free as possible. Meet Alissa, Head of Customer Success. Her team is ready to provide you with all the help you need, from onboarding, to making sure all your contract paperwork is buttoned up.
              </p>
              <Button variant="outline" className="gap-2" asChild>
                <a href="mailto:info@beeyield.com"><Mail className="h-4 w-4" /> Email Us: info@beeyield.com</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-20">
            <PollinationContactForm
              type="in_land"
              title="Try BeeYield In-Land in your apiary"
              description="BeeYield is constantly evolving. We invite you to take part in the international testing of our system – together, we can advance technology that protects bees worldwide."
            />
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
                <span className="font-bold text-lg">Intelligent Hives</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Link to Precision Pollination & Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
            <div className="h-1 w-16 bg-primary-foreground/30 hidden md:block" />
            {/* CTA Side */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4">Ready to get more from your land?</h2>
              <p className="opacity-90 mb-6">
                Start getting actionable data on your pollination efficacy today.
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/pollination-request">Book Pollination Service</Link>
              </Button>
            </div>

            {/* Cross-Link Side */}
            <div className="bg-primary-foreground/10 p-6 rounded-2xl backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="bg-primary-foreground/20 p-3 rounded-lg">
                  <Mic className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Looking for In-Hive Monitoring?</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Check out our Precision Pollination solution to monitor colony health from the inside out.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-primary-foreground gap-1" asChild>
                    <Link to="/precision-pollination">Explore Precision Pollination <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InLandPollination;