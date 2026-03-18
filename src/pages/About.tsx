import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, ArrowRight, Sprout, Globe, ShieldCheck, Heart, History, TrendingUp, Leaf, Hexagon, Terminal, Activity, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

const About = () => {
  return (
    <BeeYieldPageShell className="bg-[#FFF9F0] text-[#064e3b] font-sans antialiased selection:bg-[#facc15] selection:text-[#064e3b]">
      {/* Hero Section - Swiss Brutalist */}
      <section className="relative flex items-center border-b-4 border-[#064e3b] py-32 bg-[#FFF9F0]">
        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 border-2 border-[#064e3b] bg-[#10b981] text-[#1A1A1A] text-[10px] font-black mb-12 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
              EST. 2020 // KIBWEZI FARM
            </div>

            <h1 className="text-7xl md:text-[10rem] font-black mb-12 tracking-tighter leading-[0.8] text-[#064e3b]">
              BEE<span className="text-[#10b981]">Yield</span>
            </h1>

            <p className="text-xl md:text-3xl font-black mb-12 max-w-2xl leading-tight text-[#064e3b]">
              Managing 184 hives with real-time monitoring.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                to="/ourstory"
                className="h-16 px-12 border-2 border-[#064e3b] bg-[#FFF9F0] text-[#064e3b] font-black text-xs hover:bg-[#10b981] hover:text-[#1A1A1A] transition-all shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] active:shadow-none flex items-center justify-center transform active:translate-x-1 active:translate-y-1"
              >
                View History
              </Link>
              <Link
                to="/contact"
                className="h-16 px-12 border-2 border-[#064e3b] bg-[#facc15] text-[#064e3b] font-black text-xs hover:bg-[#FFF9F0] hover:text-[#1A1A1A] transition-all shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] active:shadow-none flex items-center justify-center transform active:translate-x-1 active:translate-y-1"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Section */}
      <section className="py-32 border-b-4 border-[#064e3b] bg-[#FFF9F0]">
        <div className="container mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-stretch">
            <div className="border-2 border-[#064e3b] p-12 bg-[#FFF9F0] shadow-[10px_10px_0px_0px_rgba(6,78,59,1)] flex flex-col justify-center">
              <div className="inline-block border-2 border-[#064e3b] bg-[#064e3b] text-[#1A1A1A] px-4 py-1 font-black text-[10px] mb-8">
                How we started
              </div>
              <h2 className="text-5xl md:text-7xl font-black mb-10 leading-[0.85] tracking-tighter">
                4 HIVES <span className="text-[#10b981]">To</span> 184.
              </h2>
              <div className="space-y-8 text-lg font-black leading-snug text-[#064e3b]/60">
                <p>
                  Started in 2020 at Kibwezi Farm. Changed from manual checks to smart technology.
                </p>
                <p>
                  Built for precision. Every hive is part of our national farm map.
                </p>
              </div>
            </div>

            <div className="relative border-2 border-[#064e3b] bg-[#facc15]/10 p-4">
              <div className="w-full h-full border-2 border-[#064e3b] overflow-hidden grayscale contrast-125">
                <img
                  src="https://images.unsplash.com/photo-1587334274328-64186a80aeee?q=80&w=1000&auto=format&fit=crop"
                  alt="Hardware"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-10 right-10 bg-[#10b981] border-2 border-[#064e3b] p-8 shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                <p className="text-6xl font-black text-[#1A1A1A]">184</p>
                <p className="text-[10px] font-black text-[#1A1A1A] border-t border-[#F4D03F]/40 pt-2 mt-2">Active Hives</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Modules */}
      <section className="py-32 bg-[#FFF9F0]">
        <div className="container mx-auto px-8">
          <div className="flex items-center gap-4 mb-20">
            <Terminal className="w-8 h-8 text-[#10b981]" />
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">Modules</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border-4 border-[#064e3b]">
            {[
              { title: "Network", desc: "Hive sensors and maps.", icon: Activity, link: "/team" },
              { title: "Output", desc: "Production and harvest stats.", icon: Zap, link: "/impact" },
              { title: "Health", desc: "Hive checks and safety.", icon: ShieldCheck, link: "/traceability" }
            ].map((item, i) => (
              <Link
                key={i}
                to={item.link}
                className="p-12 border-[#064e3b] border-r-4 last:border-r-0 hover:bg-[#facc15]/20 transition-all flex flex-col group"
              >
                <div className="h-16 w-16 border-2 border-[#064e3b] flex items-center justify-center mb-10 bg-[#FFF9F0] group-hover:bg-[#10b981] group-hover:text-[#1A1A1A] transition-all">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter">{item.title}</h3>
                <p className="font-bold text-[#064e3b]/60 uppercase text-xs mb-10 flex-1">{item.desc}</p>
                <div className="text-[10px] font-black flex items-center gap-3 text-[#10b981]">
                  Enter Module <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tactical Footer */}
      <section className="bg-[#064e3b] py-24 px-8 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=2600')] bg-cover grayscale" />
        <div className="relative z-10 max-w-4xl mx-auto text-center border-4 border-white p-12 bg-[#064e3b]/80 backdrop-blur-sm">
          <Hexagon className="w-12 h-12 text-[#facc15] mx-auto mb-8 fill-current" />
          <h2 className="text-3xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter leading-none mb-6">Hive Monitoring</h2>
          <p className="text-xs font-black text-[#10b981]">Active since 2020</p>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default About;
