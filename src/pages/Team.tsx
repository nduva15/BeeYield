import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Linkedin, Award, Users, Briefcase, Code, Loader2,
  Globe, Heart, Zap, Sparkles, ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTeamMembers, TeamMember } from "@/services/companyService";

const Team = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTeamMembers();
        setMembers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Non-blocking load for better UX
  // Grouping members for display
  const founders = members.filter(m => m.role.toLowerCase().includes('founder'));
  const others = members.filter(m => !m.role.toLowerCase().includes('founder'));

  return (
    <main className="min-h-screen bg-background selection:bg-primary selection:text-white">

      {/* Hero Section - Extremely Premium */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-32 pb-24">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge variant="outline" className="mb-8 border-primary/40 text-primary px-6 py-2 bg-primary/5 font-black uppercase tracking-widest animate-fade-in">
            Meet the Visionaries
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-10 tracking-tight leading-tight">
            The Hive <br />
            <span className="text-primary italic">Mind</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed mb-12">
            A family-founded collective of engineers, bioscientists, and dreamers rewriting the code of agriculture.
          </p>

          <div className="flex justify-center gap-12 pt-10">
            <div className="text-center">
              <p className="text-4xl font-black text-foreground">15+</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Experts</p>
            </div>
            <div className="w-[1px] h-12 bg-border" />
            <div className="text-center">
              <p className="text-4xl font-black text-foreground">3</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Founders</p>
            </div>
            <div className="w-[1px] h-12 bg-border" />
            <div className="text-center">
              <p className="text-4xl font-black text-foreground">∞</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Passion</p>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </section>

      {/* Philosophy Section */}
      <section className="py-32 bg-muted/20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-soft mb-10">
              <Heart className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-10 tracking-tight leading-tight">
              Beyond code and honey, we build <br />
              <span className="text-primary italic underline decoration-primary/30">resilience</span>.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed font-medium italic max-w-4xl mx-auto">
              "Our team unites beekeepers, IoT engineers, and data scientists to solve one of humanity's most silent crises. We don't just monitor hives; we secure the future of our food supply through radical transparency and precision tech."
            </p>
          </div>
        </div>
        {/* Background hex pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5 pointer-events-none" />
      </section>

      {/* Founders Section - Large, Impactful Cards */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <Badge className="mb-6 bg-foreground text-background font-black px-6 py-1.5 uppercase tracking-widest">The Foundation</Badge>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">The Founders</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-16 max-w-7xl mx-auto">
            {founders.map((member, index) => (
              <div key={member.id} className="group relative">
                <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-700 group-hover:scale-[0.98] group-hover:rounded-[4rem]">
                  <img
                    src={member.image_url || member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                  <div className="absolute bottom-10 left-10 right-10">
                    <p className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-3">{member.role}</p>
                    <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">{member.name}</h3>
                    <p className="text-white/70 text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-3">
                      {member.bio || member.description}
                    </p>
                  </div>

                  <a
                    href={member.linkedin_url || member.linkedin || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-8 right-8 w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-primary transition-all duration-300 group-hover:rotate-12"
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                </div>
                {/* Decorative border */}
                <div className="absolute -inset-4 border-2 border-primary/10 rounded-[4rem] -z-10 group-hover:border-primary/30 transition-all duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership & Technical Team */}
      <section className="py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <Badge variant="outline" className="mb-6 border-primary/40 text-primary px-6 py-1.5 font-black uppercase tracking-widest">Growth & Tech</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">The Full Hive</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {others.map((member) => (
              <Card key={member.id} className="group overflow-hidden border-none bg-white rounded-[2.5rem] shadow-soft hover:shadow-glow transition-all duration-500">
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={member.image_url || member.image}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-40" />
                    <a
                      href={member.linkedin_url || member.linkedin || "#"}
                      className="absolute bottom-6 right-6 w-10 h-10 bg-white shadow-xl rounded-xl flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all transform translate-y-20 group-hover:translate-y-0 duration-500"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-black text-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-bold text-xs uppercase tracking-widest mb-4">{member.role}</p>
                    <p className="text-sm text-muted-foreground font-medium line-clamp-2 italic">
                      {member.bio || member.description || "Driving the future of ag-tech with passion."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Mission CTA */}
      <section className="py-32 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 mb-10 border border-white/10 backdrop-blur-md">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter">Want to build <br /><span className="text-primary italic">with us?</span></h2>
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto font-medium">
            We're always looking for brilliant minds who care about the planet as much as they care about the code.
          </p>
          <Button asChild size="lg" className="h-16 px-12 bg-primary hover:bg-white hover:text-primary text-white font-black text-xl rounded-2xl shadow-glow transition-all">
            <Link to="/careers">View Openings</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Team;
