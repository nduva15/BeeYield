import { Linkedin, Globe, Award, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Team = () => {
  const founders = [
    { 
      name: "Timothy Mathuva", 
      role: "Founder & CEO", 
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400" 
    },
    { 
      name: "Mumbe Mathuva", 
      role: "COO & Co-founder", 
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" 
    },
    { 
      name: "Agatha Mathuva", 
      role: "Co-founder", 
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400" 
    },
    
  ];

  const boardMembers = [
    "Nandi Dean",
    "Nicholas Nduva",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-muted via-background to-primary/5">
        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            Leadership
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-foreground">
            Meet the <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">BeeYield Team</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            Decades of experience in agriculture, technology, and entrepreneurship.
          </p>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/20 rounded-full blur-3xl opacity-60" />
      </section>

      {/* Who is BeeYield? */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-muted/50 rounded-3xl p-10 md:p-14 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Who is BeeYield?</h2>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              BeeYield's founders guide a team of beekeepers, IOT Engineers, data scientists, programmers, researchers, agriculturalists, and more who are committed to applying their diverse expertise to help secure the future of the world's food supply. By bringing the power of data science to bear on the critical role played by pollination in agriculture, BeeYield is working tirelessly to ensure the well-being of all pollinators.
            </p>
          </div>
        </div>
      </section>

      {/* Founders Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Our Founders</h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {founders.map((member, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group bg-card text-center">
                <CardContent className="pt-8 pb-8 flex flex-col items-center">
                  <div className="w-32 h-32 mb-6 rounded-full overflow-hidden ring-4 ring-muted group-hover:ring-primary/30 transition-all">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{member.name}</h3>
                  <p className="text-sm text-primary font-medium uppercase tracking-wide mb-4 h-10 flex items-center justify-center">
                    {member.role}
                  </p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Board Members */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold tracking-wider uppercase text-sm">
                <Award className="h-4 w-4" />
                Governance
              </div>
              <h2 className="text-4xl font-bold mb-6 text-foreground">Board Members</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Our board members bring a wealth of experience, expertise, and dedication to the BeeYield's mission. Collectively, their unique backgrounds and perspectives provide the guidance and experience that steers BeeYield towards success.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {boardMembers.map((member, index) => (
                <div key={index} className="bg-muted/50 border border-border p-6 rounded-xl flex items-center gap-4">
                  <div className="h-12 w-12 bg-card rounded-full flex items-center justify-center shadow-sm">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-bold text-lg text-foreground">{member}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;