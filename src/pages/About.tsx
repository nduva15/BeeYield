import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, ArrowRight, Sprout, Globe, ShieldCheck, Heart, History, TrendingUp, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Zero-Trust Premium Theme */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf6] to-[#f8faf8]">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_80%_20%,#fef3c7_0%,transparent_50%)] opacity-40 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_20%_80%,#ecfdf5_0%,transparent_50%)] opacity-40 pointer-events-none" />

          {/* Vertical Text Accent */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="absolute left-8 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none"
          >
            <span className="text-[100px] font-black text-neutral-200/50 tracking-tighter leading-none select-none uppercase" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
              Our Story
            </span>
          </motion.div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-[0.2em] mb-8 border border-green-100 shadow-sm"
            >
              <Heart className="w-3.5 h-3.5" />
              Est. 2020 • Kibwezi, Kenya
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black text-neutral-900 mb-8 tracking-tighter leading-[0.95]">
              Cultivating the <span className="text-green-700">Future.</span> <br />
              <span className="text-amber-600">Verification</span> Rooted in Nature.
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              Born from a family's shared vision, we are solving the global pollination crisis through clear transparency, sensor technology, and deep ecosystem guardianship.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white font-black rounded-2xl px-10 h-14 shadow-xl uppercase tracking-widest text-xs transition-all hover:scale-105" asChild>
                <Link to="/ourstory">Read Full Story</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-neutral-200 text-neutral-900 hover:bg-neutral-50 font-black rounded-2xl px-10 h-14 uppercase tracking-widest text-xs" asChild>
                <Link to="/contact">Partner With Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Zero Trust Story Sections */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <Badge className="bg-green-50 text-green-700 border-none mb-6 px-4 py-1 font-black uppercase tracking-widest text-[10px]">
                The Origin Story
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black text-neutral-900 mb-8 leading-[0.9] tracking-tighter uppercase">
                From 4 Hives to <span className="text-green-700">Sustainable Growth.</span>
              </h2>
              <div className="space-y-6 text-lg text-neutral-600 font-medium leading-relaxed">
                <p>
                  In 2020, Timothy Nduva saw an opportunity in the quiet of rural Kibwezi. What started as a family mission for sustainable pollination on a half-acre plot has evolved into a precision-tech apiary.
                </p>
                <p>
                  Today, sisters Agatha and Carole have joined the mission, bringing practical tech and data expertise to create a clear process where every drop of honey is an open book.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-[3rem] bg-neutral-100 overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1587334274328-64186a80aeee?q=80&w=1000&auto=format&fit=crop"
                  alt="Beekeeping"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
              </div>
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl border border-neutral-100 max-w-[200px]"
              >
                <p className="text-3xl font-black text-green-700">184+</p>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Monitored Hives Managed</p>
              </motion.div>
            </motion.div>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-neutral-900 uppercase tracking-tighter">Our Ecosystem</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Meet The Team", desc: "Three founders combining tech, business, and beekeeping legacy.", icon: Users, color: "bg-amber-50 text-amber-600", link: "/team" },
              { title: "Our Impact", desc: "2,500+ trees planted and counting. Restoring biodiversity.", icon: Leaf, color: "bg-green-50 text-green-700", link: "/impact" },
              { title: "HoneyChain™", desc: "The verification system that tracks every drop from hive to jar.", icon: ShieldCheck, color: "bg-blue-50 text-blue-600", link: "/traceability" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className={`p-10 rounded-[2.5rem] ${item.color.split(' ')[0]} border border-transparent hover:border-neutral-200 transition-all flex flex-col items-start text-left`}
              >
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                  <item.icon className={`h-7 w-7 ${item.color.split(' ')[1]}`} />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 mb-4">{item.title}</h3>
                <p className="text-neutral-500 font-medium mb-6 leading-relaxed">{item.desc}</p>
                <Button variant="link" className={`${item.color.split(' ')[1]} font-black p-0 h-auto uppercase tracking-widest text-[10px] group`} asChild>
                  <Link to={item.link}>Explore <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" /></Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width Video Section - Before Footer */}
      <div className="relative w-full h-[60vh] md:h-[80vh] bg-[#F0F7F0]">
        <iframe
          className="absolute inset-0 w-full h-full opacity-60"
          src="https://www.youtube.com/embed/vV-m_k8E5Yc"
          title="About BeeYield"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F0F7F0] via-transparent to-transparent pointer-events-none flex items-end justify-center pb-20">
          <div className="text-center text-neutral-900 p-4">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">See the BeeYield Difference</h2>
            <p className="text-lg md:text-xl opacity-80">Watch how we're transforming agriculture, one hive at a time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
