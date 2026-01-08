import { Linkedin, Globe, Award, Users, Code, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const Team = () => {
  const founders = [
    {
      name: "Timothy Mathuva",
      role: "CEO & Founder",
      description: "Visionary leader driving BeeYield's mission to revolutionize pollination through technology.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
      linkedin: "#"
    },
    {
      name: "Carole Mathuva",
      role: "Chief Growth Officer & Co-founder",
      description: "Business Development lead, shaping partnerships and driving company growth.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      linkedin: "#"
    },
    {
      name: "Agatha Mathuva",
      role: "Chief IT Head & Co-founder",
      description: "Leading technology infrastructure and digital innovation at BeeYield.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
      linkedin: "#"
    },
  ];

  const technicalTeam = [
    {
      name: "Rose Ndinda",
      role: "VP Technology",
      description: "Building seamless digital experiences across web and mobile platforms.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
      linkedin: "#"
    },
    {
      name: "Nandi Dean",
      role: "VP Technology",
      description: "Combining development expertise with research to drive innovation.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      linkedin: "#"
    },
  ];

  const boardMembers = [
    {
      name: "Nicholas Mathuva",
      role: "Board Member",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
      linkedin: "#"
    },
    {
      name: "Redempta",
      role: "Board Member",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400", // Placeholder image
      linkedin: "#"
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-24">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
            Leadership
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Meet the BeeYield Team
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A family-driven team combining agriculture, technology, and innovation to secure the future of pollination and food security.
          </p>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </section>

      {/* Who is BeeYield? */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Who is BeeYield?</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              BeeYield's founders guide a team of beekeepers, IOT Engineers, data scientists, programmers, researchers, ML Experts, Blockchain Experts and more who are committed to applying their diverse expertise to help secure the future of the world's food supply. By bringing the power of data science and ML to bear on the critical role played by pollination in agriculture, BeeYield is working tirelessly to ensure the well-being of all pollinators.
            </p>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Briefcase className="h-6 w-6 text-primary" />
              <Badge variant="secondary">The Siblings</Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Founders</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three siblings united by a shared vision to transform agriculture through precision pollination and Traceability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {founders.map((member, index) => (
              <Card key={index} className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${member.name} on LinkedIn`}
                      className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Code className="h-6 w-6 text-primary" />
              <Badge variant="secondary">Tech Wizards</Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Technical Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The brilliant minds building the technology that powers BeeYield's innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {technicalTeam.map((member, index) => (
              <Card key={index} className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${member.name} on LinkedIn`}
                      className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Board Members Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Award className="h-6 w-6 text-primary" />
                <Badge variant="outline" className="border-primary/30">Governance</Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Board of Directors</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Guiding BeeYield with experience, expertise, and dedication to our mission.
              </p>
            </div>

            <div className="flex justify-center">
              {boardMembers.map((member, index) => (
                <Card key={index} className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg max-w-sm">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${member.name} on LinkedIn`}
                        className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                      <p className="text-primary font-medium">{member.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Team;
