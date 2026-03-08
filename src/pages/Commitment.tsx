import { ArrowRight, Target, Wheat, TreePine, Heart, Users, Droplets, Zap, Building, Globe, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CommitmentPage = () => {
  const sdgs = [
    {
      number: 1,
      title: "Poverty Eradication",
      description: "We provide training programs and a sustainable platform for smallholder farmers and youth to earn income.",
      impact: "50+ smallholders integrated into the BeeYield ecosystem.",
      color: "from-[#E5243B] to-[#E5243B]/80",
      icon: Users,
    },
    {
      number: 2,
      title: "Zero Hunger",
      description: "75% of food crops rely on pollinators. Our services directly boost local and global food security.",
      impact: "30%+ increase in pollination efficiency measured.",
      color: "from-[#DDA63A] to-[#DDA63A]/80",
      icon: Wheat,
    },
    {
      number: 6,
      title: "Clean Water",
      description: "Restoring local biodiversity through tree planting creates resilient ecosystems that naturally filter water.",
      impact: "Water table stability improved in 5 key apiary nodes.",
      color: "from-[#4C9F38] to-[#4C9F38]/80",
      icon: Droplets,
    },
    {
      number: 13,
      title: "Climate Action",
      description: "We've planted 2,500+ trees to restore habitats and capture carbon across the rift valley.",
      impact: "40+ Tons of carbon sequestration projected annually.",
      color: "from-[#3F7E44] to-[#3F7E44]/80",
      icon: Globe,
    },
    {
      number: 15,
      title: "Life On Land",
      description: "Reducing bee mortality rates and protecting wild pollinators ensures healthy terrestrial landscapes.",
      impact: "15% Colony loss rate maintained vs 60% global avg.",
      color: "from-[#56AD46] to-[#56AD46]/80",
      icon: TreePine,
    },
    {
      number: 17,
      title: "Strategic Alliances",
      description: "We collaborate with global partners to scale our impact and share knowledge across borders.",
      impact: "Active partnerships with 12 research institutions.",
      color: "from-[#19486A] to-[#19486A]/80",
      icon: Heart,
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf6] text-slate-900 selection:bg-beeyield-gold/30">

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-white">
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <Badge variant="outline" className="mb-8 border-beeyield-gold/30 text-beeyield-gold bg-beeyield-gold/5 font-black uppercase tracking-[0.3em] text-[10px] py-2 px-6 rounded-full">
            Global Impact Framework
          </Badge>

          <h1 className="mb-10 text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
            Our <span className="text-beeyield-green">Mandate</span> <br />
            For The Future.
          </h1>

          <p className="mb-12 text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
            BeeYield's mission extends beyond the hive. We are actively contributing to the
            <span className="text-slate-900 font-black"> UN Sustainable Development Goals</span>,
            driving measurable progress for people and pollinators.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/esg">
              <Button size="lg" className="h-16 px-12 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-slate-800 transition-all">
                The ESG Report <ArrowRight className="ml-3 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-beeyield-green/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-beeyield-gold/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2" />
      </section>

      {/* Grid Section */}
      <section className="py-24 bg-[#fdfbf6]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {sdgs.map((sdg) => (
              <motion.div
                key={sdg.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative bg-white border border-slate-100 rounded-[3rem] p-10 hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* SDG Number Indicator */}
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${sdg.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-black text-3xl">{sdg.number}</span>
                  </div>
                  <sdg.icon className="h-6 w-6 text-slate-200 group-hover:text-beeyield-gold transition-colors" />
                </div>

                <h3 className="text-2xl font-black mb-4 text-slate-900 uppercase tracking-tighter">
                  {sdg.title}
                </h3>

                <p className="text-slate-500 text-base leading-relaxed mb-8 font-medium">
                  {sdg.description}
                </p>

                <div className="pt-8 border-t border-slate-50 flex flex-col gap-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-beeyield-green">Impact Status</p>
                  <p className="text-sm font-black text-slate-900 leading-snug">
                    {sdg.impact}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Mission Section */}
      <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter uppercase leading-[0.9]">
              Saving Bees <br />
              Secure the <span className="text-beeyield-gold">Species.</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 mb-12 font-medium">
              We're building a network that ensures pollinators thrive alongside modern technology. Our commitment is measurable, scientific, and unwavering.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/contact">
                <Button className="h-16 px-12 rounded-2xl bg-beeyield-gold text-slate-900 font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-white transition-all">
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Abstract decor */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')]" />
        </div>
      </section>

    </div>
  );
};

export default CommitmentPage;
