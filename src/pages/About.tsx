import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, ArrowRight, Sprout, Globe, ShieldCheck, Heart, History, TrendingUp, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const About = () => {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#FF4F00] selection:text-white">
      {/* Hero Section - Brutalist / Swiss Design */}
      <section className="relative flex items-center border-b-2 border-black py-24">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black bg-white text-black text-[10px] font-bold uppercase tracking-widest mb-8">
              EST. 2020 • KIBWEZI, KENYA
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] uppercase">
              BEEYIELD: <br />
              <span className="text-[#FF4F00]">HIVE MANAGEMENT</span>
            </h1>

            <p className="text-xl md:text-2xl font-bold mb-10 max-w-2xl leading-tight uppercase text-neutral-500">
              Traceable beekeeping data. Founded in 2020 in Kibwezi, Kenya.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-black text-white hover:bg-[#FF4F00] font-bold rounded-none px-10 h-14 border-2 border-black transition-none uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" asChild>
                <Link to="/ourstory">History</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-[#007AFF] text-white hover:bg-black font-bold rounded-none px-10 h-14 border-2 border-black transition-none uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" asChild>
                <Link to="/contact">Contact</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Section */}
      <section className="py-24 border-b-2 border-black bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="border-2 border-black p-10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="inline-block border-2 border-black bg-black text-white px-4 py-1 font-bold uppercase tracking-widest text-[10px] mb-6">
                ORIGIN
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
                FROM 4 HIVES TO <span className="text-[#FF4F00]">184.</span>
              </h2>
              <div className="space-y-6 text-lg font-bold leading-tight uppercase text-neutral-600">
                <p>
                  Started in 2020 in Kibwezi. Family apiary focused on sustainable pollination.
                </p>
                <p>
                  Managed by Timothy, Agatha, and Carole Nduva. Technical oversight and data management for every hive.
                </p>
              </div>
            </div>

            <div className="relative border-4 border-black aspect-square overflow-hidden grayscale">
              <img
                src="https://images.unsplash.com/photo-1587334274328-64186a80aeee?q=80&w=1000&auto=format&fit=crop"
                alt="Beekeeping"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-4xl font-black text-[#FF4F00]">184</p>
                <p className="text-[10px] font-bold text-black uppercase tracking-widest">HIVES MANAGED</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-7xl font-black mb-16 tracking-tighter uppercase">SYSTEM</h2>

          <div className="grid md:grid-cols-3 gap-0 border-2 border-black">
            {[
              { title: "TEAM", desc: "Founders specializing in tech and beekeeping.", icon: Users, link: "/team" },
              { title: "IMPACT", desc: "2,500+ trees planted.", icon: Leaf, link: "/impact" },
              { title: "TRACEABILITY", desc: "Digital tracking of hive production.", icon: ShieldCheck, link: "/traceability" }
            ].map((item, i) => (
              <Link
                key={i}
                to={item.link}
                className="p-10 border-black border-r-2 last:border-r-0 hover:bg-neutral-100 transition-none group"
              >
                <div className="h-12 w-12 border-2 border-black flex items-center justify-center mb-6 group-hover:bg-[#FF4F00] transition-none">
                  <item.icon className="h-6 w-6 text-black group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase">{item.title}</h3>
                <p className="font-bold text-neutral-500 uppercase text-xs mb-6">{item.desc}</p>
                <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  VIEW MODULE <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="border-t-2 border-black bg-black text-white relative h-[60vh] overflow-hidden">
        <iframe
          className="absolute inset-0 w-full h-full opacity-40 grayscale contrast-125"
          src="https://www.youtube.com/embed/vV-m_k8E5Yc"
          title="About BeeYield"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-6 border-4 border-white bg-black/80">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">HIVE MONITORING</h2>
            <p className="text-xl font-bold uppercase opacity-80 mt-2 tracking-widest">TRACEABLE HONEY PRODUCTION</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
