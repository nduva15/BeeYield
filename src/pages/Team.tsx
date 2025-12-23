import React, { useState } from "react";
import { 
  Menu, X, Search, ShoppingCart, Hexagon,
  Users, Linkedin, ArrowRight, Globe, Award
} from "lucide-react";

// -----------------------------------------------------------------------------
// MOCK IMPORTS & THEME CONFIGURATION
// -----------------------------------------------------------------------------

const Link = ({ to, children, className }) => (
  <a href={to} className={`contents ${className || ''}`} onClick={(e) => e.preventDefault()}>
    {children}
  </a>
);

const Button = ({ children, variant = "default", size = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:opacity-90 shadow-md",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  const sizes = {
    default: "h-10 px-6 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-12 rounded-md px-8 text-lg",
    icon: "h-10 w-10",
  };

  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className = "", variant = "default" }) => {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "text-foreground border border-input",
  };
  
  return (
    <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className} overflow-hidden`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-foreground">
          <Hexagon className="h-8 w-8 text-primary fill-primary" />
          <span>Hive<span className="text-primary">Mind</span></span>
        </div>
        <div className="hidden md:flex md:items-center md:gap-8">
          <a href="#" className="text-sm font-bold text-primary">Team</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Our Story</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Technology</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Careers</a>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <Button>Contact Us</Button>
        </div>
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {isOpen && (
        <div className="border-b bg-background px-4 py-4 md:hidden animate-in slide-in-from-top-5">
          <div className="flex flex-col gap-4">
            <a href="#" className="text-sm font-medium hover:text-primary">Team</a>
            <a href="#" className="text-sm font-medium hover:text-primary">Our Story</a>
            <a href="#" className="text-sm font-medium hover:text-primary">Technology</a>
            <Button className="w-full">Contact Us</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT (Team Page)
// -----------------------------------------------------------------------------

const TeamPage = () => {
  const teamMembers = [
    { name: "Omer Davidi", role: "Chief Executive Officer", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400" },
    { name: "Itai Kanot", role: "Chief Growth Officer", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" },
    { name: "Yuval Regev", role: "Chief Product & Technology Officer", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400" },
  ];

  const boardMembers = [
    "Kevin Murphy",
    "Mor Assia",
    "Alastair Cooper",
    "Daniella Vellinga"
  ];

  return (
    <>
      <style>{`
        :root {
          --primary: #f59e0b;
          --primary-foreground: #ffffff;
          --secondary: #fffbeb;
          --secondary-foreground: #451a03;
          --muted: #f5f5f4;
          --muted-foreground: #78716c;
          --accent: #ecfccb;
          --accent-foreground: #365314;
          --background: #ffffff;
          --foreground: #1c1917;
          --card: #ffffff;
          --card-foreground: #1c1917;
          --border: #e7e5e4;
        }
        
        .bg-background { background-color: var(--background); }
        .bg-primary { background-color: var(--primary); }
        .text-primary { color: var(--primary); }
        .text-primary-foreground { color: var(--primary-foreground); }
        .bg-secondary { background-color: var(--secondary); }
        .text-secondary-foreground { color: var(--secondary-foreground); }
        .bg-muted { background-color: var(--muted); }
        .text-muted-foreground { color: var(--muted-foreground); }
        .text-foreground { color: var(--foreground); }
        
        .shadow-soft { box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); }
        .shadow-elegant { box-shadow: 0 20px 40px -10px rgba(245, 158, 11, 0.15); }
        .text-gradient { background: linear-gradient(to right, #d97706, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      <div className="min-h-screen bg-background font-sans text-foreground">
        <Navigation />
        
        <div className="pt-20">
          {/* Hero Section */}
          <section className="relative py-24 bg-gradient-to-br from-secondary/50 via-white to-primary/5">
            <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                Leadership
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                Meet the <span className="text-gradient">BeeYield Team</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
                Decades of experience in agriculture, technology, and entrepreneurship.
              </p>
            </div>
            
            {/* Abstract Background Shapes */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-60" />
          </section>

          {/* Who is BeeYield? */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto bg-secondary/30 rounded-3xl p-10 md:p-14 border border-secondary/50">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Who is BeeYield?</h2>
                </div>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  BeeYield's three founders guide a team of beekeepers, engineers, data scientists, programmers, researchers, agriculturalists, and more who are committed to applying their diverse expertise to help secure the future of the world's food supply. By bringing the power of data science to bear on the critical role played by pollination in agriculture, BeeYield is working tirelessly to ensure the well-being of all pollinators.
                </p>
              </div>
            </div>
          </section>

          {/* Leadership Team Grid */}
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">Executive Leadership</h2>
                <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
              </div>

              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                  <Card key={index} className="border-none shadow-soft hover:shadow-elegant transition-all duration-300 group bg-white text-center">
                    <CardContent className="pt-8 pb-8 flex flex-col items-center">
                      <div className="w-32 h-32 mb-6 rounded-full overflow-hidden ring-4 ring-secondary group-hover:ring-primary/30 transition-all">
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{member.name}</h3>
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
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                <div>
                  <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold tracking-wider uppercase text-sm">
                    <Award className="h-4 w-4" />
                    Governance
                  </div>
                  <h2 className="text-4xl font-bold mb-6">Board Members</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                    Our board members bring a wealth of experience, expertise, and dedication to the BeeYield mission. Collectively, their unique backgrounds and perspectives provide the guidance and experience that steers BeeYield toward success.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {boardMembers.map((member, index) => (
                    <div key={index} className="bg-secondary/20 border border-secondary p-6 rounded-xl flex items-center gap-4">
                      <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-bold text-lg">{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 bg-white border-t">
            <div className="container mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tighter text-foreground mb-8">
                <Hexagon className="h-8 w-8 text-primary fill-primary" />
                <span>Hive<span className="text-primary">Mind</span></span>
              </div>
              <p className="text-muted-foreground mb-8">
                Revolutionizing agriculture, one hive at a time.
              </p>
              <div className="flex justify-center gap-6 text-sm font-medium text-muted-foreground">
                <a href="#" className="hover:text-primary">Contact</a>
                <a href="#" className="hover:text-primary">Careers</a>
                <a href="#" className="hover:text-primary">Press</a>
                <a href="#" className="hover:text-primary">Privacy</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default TeamPage;