import { motion } from "framer-motion";
import {
  Users,
  Target,
  ArrowRight,
  Globe,
  ShieldCheck,
  Heart,
  History,
  TrendingUp,
  Leaf,
  Hexagon,
  Terminal,
  Activity,
  Zap,
  Sparkles,
  MapPin,
  Clock
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased">
      <SEO
        title="Our Story | BeeYield Precision Beekeeping"
        description="Learn about BeeYield's journey from 4 hives to a national smart hive network, our commitment to 50/50 harvesting, and our mission to protect bees through technology."
      />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[85vh] flex items-center pt-24 overflow-hidden bg-neutral-50/50">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#10b981]/[0.03] -skew-x-12 translate-x-32 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-[#facc15]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#10b981]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-[#10b981]/10 text-[#064e3b] mb-8 hover:bg-[#10b981]/20 transition-colors uppercase tracking-[0.3em] font-black text-[10px] px-5 py-2 rounded-full border border-[#10b981]/20 shadow-sm">
                Established 2020 • Kibwezi Farm
              </Badge>

              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-[#064e3b] leading-[0.82] tracking-tighter uppercase mb-10 drop-shadow-sm">
                Our <span className="text-[#facc15] block italic underline decoration-[#10b981]/10 underline-offset-[12px]">Legacy</span>
              </h1>

              <p className="text-xl md:text-3xl text-neutral-600 mb-12 max-w-2xl leading-tight font-bold uppercase tracking-tight">
                From a single humble apiary to a nationwide <span className="text-[#10b981]">Smart Hive Network</span>—reimagining the future of honey.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-[#064e3b] hover:bg-[#10b981] text-white font-black rounded-2xl px-12 h-16 shadow-2xl shadow-[#064e3b]/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
                  onClick={() => navigate("/ourstory")}
                >
                  The Full Journey
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-neutral-200 bg-white text-neutral-900 font-black rounded-2xl px-12 h-16 hover:bg-neutral-50 transition-all uppercase tracking-widest text-xs shadow-sm"
                  onClick={() => navigate("/contact")}
                >
                  Join the Mission
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Floating Element */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-12 hidden lg:block"
        >
          <div className="relative w-80 h-96">
            <div className="absolute inset-0 bg-[#facc15]/20 rounded-[4rem] blur-3xl" />
            <div className="relative z-10 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white p-10 shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#facc15]/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <Hexagon className="w-16 h-16 text-[#facc15] mb-8 fill-current opacity-80" />
              <p className="text-4xl font-black text-[#064e3b] mb-2">184+</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-t border-neutral-100 pt-3">Intelligent Hive Units Currently Online</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- ORIGIN & GROWTH --- */}
      <section className="py-24 lg:py-40 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative group">
                {/* Main Lifestyle Image */}
                <div className="w-full aspect-[4/5] rounded-[4rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] bg-neutral-100 relative z-10">
                  <img
                    src="https://images.unsplash.com/photo-1587334274328-64186a80aeee?q=80&w=1000&auto=format&fit=crop"
                    alt="Sustainable Beekeeping"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b]/40 to-transparent" />
                </div>

                {/* Overlapping Info Card */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-10 -right-4 lg:-right-12 z-20 bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-premium border border-neutral-100 max-w-xs"
                >
                  <p className="text-5xl font-black text-[#facc15] tracking-tight mb-2">2020</p>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">The Seeds are Planted</p>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                      <span className="text-[10px] font-black uppercase text-neutral-500">4 Initial Colonized Hives</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#10b981]/40" />
                      <span className="text-[10px] font-black uppercase text-neutral-500">Kibwezi Pilot Site</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <Badge className="bg-[#facc15]/10 text-[#064e3b] mb-6 border border-[#facc15]/20 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">
                The Origin Story
              </Badge>
              <h2 className="text-5xl md:text-7xl font-black text-neutral-900 mb-10 tracking-tighter uppercase leading-[0.85]">
                4 HIVES <span className="text-[#10b981] block">TO 184.</span>
              </h2>
              <div className="space-y-8">
                <p className="text-lg md:text-xl text-neutral-600 font-bold leading-relaxed">
                  What started as a modest 4-hive experimental apiary in the sun-drenched plains of Kibwezi has bloomed into a movement. Changed by necessity, we evolved from manual visual checks to a sophisticated <strong className="text-[#064e3b] font-black">Intelligent Monitoring Hub</strong>.
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 group hover:border-[#10b981]/30 transition-all">
                    <History className="w-8 h-8 text-[#064e3b] mb-4" />
                    <p className="text-sm font-bold text-neutral-900 uppercase tracking-tight mb-2">Heritage</p>
                    <p className="text-xs text-neutral-500 font-medium leading-relaxed">Preserving the traditional wisdom of Kenyan beekeeping while injecting modern precision.</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 group hover:border-[#10b981]/30 transition-all">
                    <Zap className="w-8 h-8 text-[#facc15] mb-4" />
                    <p className="text-sm font-bold text-neutral-900 uppercase tracking-tight mb-2">Innovation</p>
                    <p className="text-xs text-neutral-500 font-medium leading-relaxed">Custom acoustic sensors and thermal maps tracking every vibration of the hive.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- VISIONARY MODULES (THE SYSTEM) --- */}
      <section className="py-24 lg:py-40 bg-neutral-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,#1B915715_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,#F4D03F08_0%,transparent_50%)]" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mb-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-1 bg-[#facc15] rounded-full" />
              <p className="text-[10px] font-black text-[#facc15] uppercase tracking-[0.4em]">Operations Overview</p>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
              A Living <span className="text-[#10b981] italic">Ecosystem</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Network",
                desc: "Every hive is a digital vertex. Our IoT mesh provides sub-second monitoring of health, sound, and production data.",
                icon: Activity,
                color: "text-blue-500",
                link: "/team",
                badge: "Active Mesh"
              },
              {
                title: "Output",
                desc: "The 50/50 Harvest Promise. We only take the overflow, ensuring the bees thrive through every season.",
                icon: Zap,
                color: "text-[#facc15]",
                link: "/impact",
                badge: "Ethical Harvest"
              },
              {
                title: "Health",
                desc: "Traceability beyond the jar. Verifying purity through real-time hive diagnostics and medical-grade logs.",
                icon: ShieldCheck,
                color: "text-[#10b981]",
                link: "/traceability",
                badge: "Verified"
              }
            ].map((module, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <Link to={module.link} className="block h-full">
                  <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col hover:bg-white/10 transition-all duration-500 group-hover:border-white/30 hover:scale-[1.02] shadow-2xl">
                    <div className="flex justify-between items-start mb-10">
                      <div className={`w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white transition-all duration-500`}>
                        <module.icon className={`w-8 h-8 ${module.color} group-hover:scale-110 transition-transform`} />
                      </div>
                      <Badge className="bg-white/5 text-white/40 border-white/10 px-3 py-1 text-[8px] uppercase font-black tracking-widest">{module.badge}</Badge>
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">{module.title}</h3>
                    <p className="text-sm text-white/50 font-medium leading-relaxed mb-10 flex-grow">{module.desc}</p>
                    <div className="flex items-center gap-3 text-[10px] font-black text-[#10b981] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                      Initialize Module <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CORE PILLARS --- */}
      <section className="py-24 lg:py-40 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <h2 className="text-4xl font-black text-neutral-900 uppercase tracking-tighter leading-none mb-6">Our DNA</h2>
              <p className="text-neutral-500 font-medium leading-relaxed">The principles that define every decision we make in the apiary.</p>
              <div className="mt-10 h-px w-20 bg-[#facc15]" />
            </div>

            <div className="lg:col-span-2 grid md:grid-cols-2 gap-12">
              {[
                { title: "Precision", desc: "No more guesswork. Every intervention in the hive is data-driven.", icon: Target },
                { title: "Transparency", desc: "Verifiable purity that you can trace back to the exact GPS coordinate.", icon: Globe },
                { title: "Regeneration", desc: "Restoring Kenyan flora through pollination and indigenous tree planting.", icon: Leaf },
                { title: "Empathy", desc: "A deep, technology-enabled listening to the health of our colonies.", icon: Heart }
              ].map((pillar, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-[#10b981]">
                    <pillar.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-neutral-900 mb-2">{pillar.title}</h4>
                    <p className="text-xs text-neutral-500 font-medium leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-24 bg-neutral-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="bg-[#064e3b] rounded-[4rem] p-12 md:p-24 relative overflow-hidden flex flex-col items-center text-center shadow-premium">
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=2600')] bg-cover grayscale" />

            <div className="relative z-10 w-full max-w-2xl">
              <Hexagon className="w-20 h-20 text-[#facc15] mx-auto mb-10 fill-current drop-shadow-glow" />
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-8">
                Ready to Join <span className="text-[#facc15] block italic">the Hive?</span>
              </h2>
              <p className="text-white/70 text-lg md:text-xl font-medium mb-12">
                Whether you're a farmer, a customer, or a technologist, there's a place for you in our mission.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  className="bg-white hover:bg-neutral-100 text-[#064e3b] font-black rounded-2xl px-12 h-16 uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                  onClick={() => navigate("/shop")}
                >
                  Start Shopping
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/20 text-white font-black rounded-2xl px-12 h-16 hover:bg-white/10 uppercase tracking-widest text-xs active:scale-95 transition-all"
                  onClick={() => navigate("/contact")}
                >
                  Book Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER STATUS --- */}
      <div className="bg-white py-12 border-t border-neutral-100">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.4em]">All Systems Nominal // Kernel v4.2</p>
          </div>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-[9px] font-black uppercase text-neutral-400 hover:text-[#10b981] transition-colors tracking-widest">Privacy Protocol</Link>
            <Link to="/terms" className="text-[9px] font-black uppercase text-neutral-400 hover:text-[#10b981] transition-colors tracking-widest">Service Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
