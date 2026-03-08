import { Linkedin, Globe, Award, Users, Code, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";

const Team = () => {
  const founders = [
    {
      name: "Timothy Nduva",
      role: "CEO & Founder",
      description: "Leading the confluence of precision apiculture and deep learning.",
      image: TIMOTHY_PHOTO,
      linkedin: "#"
    },
    {
      name: "Carole Nduva",
      role: "Chief Growth Officer",
      description: "Driving global expansion and strategic apiary partnerships.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      linkedin: "#"
    },
    {
      name: "Agatha Nduva",
      role: "Chief IT Head",
      description: "Architecting the infrastructure for the next generation of agri-tech.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
      linkedin: "#"
    },
  ];

  const technicalTeam = [
    {
      name: "Rose Ndinda",
      role: "VP Technology",
      description: "Designing seamless human-bee interactions through digital interfaces.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
      linkedin: "#"
    },
  ];

  const boardMembers = [
    {
      name: "Nicholas Nduva",
      role: "Visionary Board Member",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
      linkedin: "#"
    },
  ];

  return (
    <main className="min-h-screen bg-[#fdfbf6]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-40 pb-24 mt-16 md:mt-24">
        <div className="container mx-auto px-4 text-center relative z-10 max-w-5xl">
          <Badge variant="outline" className="mb-8 border-beeyield-gold/30 text-beeyield-gold bg-beeyield-gold/5 font-black uppercase tracking-[0.3em] text-[10px] py-2 px-6 rounded-full">
            The Leadership Hub
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.85] uppercase">
            MEET THE <br /><span className="text-beeyield-green">COLLECTIVE.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
            A family-founded initiative scaling from Kibwezi to the world. We combine multi-generational agricultural wisdom with modern edge-computing.
          </p>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-beeyield-green/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-beeyield-gold/5 rounded-full blur-[140px] translate-y-1/2 -translate-x-1/2" />
      </section>

      {/* Origin/Mission */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-1 bg-beeyield-gold rounded-full" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">The Mandate</p>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Who is <span className="text-beeyield-green">BeeYield?</span></h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Founded by the Nduva siblings, our collective brings together agronomists, engineers, and researchers. We are dedicated to one singular mission: delivering predictability to pollination through the most advanced technical stack in East Africa.
              </p>
            </div>
            <div className="bg-[#fdfbf6] p-10 rounded-[3rem] border border-slate-50 shadow-inner">
              <Users className="h-12 w-12 text-beeyield-green mb-6" />
              <p className="font-black text-2xl text-slate-900 tracking-tighter uppercase mb-4">Precision First.</p>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                Every member of our team is committed to scientific integrity and the well-being of the global pollinator population.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-32 bg-[#fdfbf6]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <Badge variant="outline" className="mb-4 border-slate-200 text-slate-400 font-black uppercase tracking-[0.2em] text-[9px]">
              The Siblings / Founders
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">THE <span className="text-beeyield-gold italic">CORE</span> NODES.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {founders.map((member, index) => (
              <div key={index} className="group relative">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-soft mb-8">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-80 object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white hover:bg-slate-900 hover:text-white transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-beeyield-green">{member.role}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{member.name}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expanded Team Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Technical Node */}
            <div className="space-y-12">
              <div>
                <Badge variant="outline" className="mb-4 border-slate-200 text-slate-400 font-black uppercase tracking-[0.1em] text-[8px]">Technical Node</Badge>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Systems Integration.</h2>
              </div>
              {technicalTeam.map((member, index) => (
                <div key={index} className="flex gap-8 items-center bg-[#fdfbf6] p-8 rounded-[2.5rem] border border-slate-50">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-2xl object-cover grayscale"
                  />
                  <div>
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{member.name}</h4>
                    <p className="text-[9px] font-black text-beeyield-gold uppercase tracking-[0.25em] mb-2">{member.role}</p>
                    <p className="text-xs text-slate-400 font-medium">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Governance Node */}
            <div className="space-y-12">
              <div>
                <Badge variant="outline" className="mb-4 border-slate-200 text-slate-400 font-black uppercase tracking-[0.1em] text-[8px]">Governance Node</Badge>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">The Board.</h2>
              </div>
              {boardMembers.map((member, index) => (
                <div key={index} className="flex gap-8 items-center bg-slate-900 p-8 rounded-[2.5rem] text-white">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-2xl object-cover grayscale opacity-80"
                  />
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight">{member.name}</h4>
                    <p className="text-[9px] font-black text-beeyield-gold uppercase tracking-[0.25em] mb-2">{member.role}</p>
                    <p className="text-xs text-slate-400 font-medium">Providing strategic oversight and multi-decade leadership experience.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join the collective CTA */}
      <section className="py-24 bg-[#fdfbf6]">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block p-1 bg-slate-900 rounded-full mb-8">
            <div className="px-6 py-3 border border-white/10 rounded-full flex items-center gap-3">
              <Award className="h-4 w-4 text-beeyield-gold" />
              <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Scale With Us</span>
            </div>
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-8 max-w-2xl mx-auto">
            WE ARE ALWAYS LOOKING FOR <span className="text-beeyield-green italic">PIONEERS.</span>
          </h2>
          <Link to="/careers">
            <Button className="h-16 px-12 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-soft hover:bg-slate-50 transition-all">
              View Open Roles
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Team;
