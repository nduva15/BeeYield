import React, { useState } from "react";
import { 
  Menu, X, Search, Hexagon, ArrowRight, 
  MapPin, Globe, Heart, Zap, Database, 
  Cpu, Sun, Users, Compass, Briefcase, Smile
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
    white: "bg-white text-primary hover:bg-white/90 shadow-md"
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
  <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className} overflow-hidden bg-white`}>
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
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Our Story</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Technology</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Impact</a>
          <a href="#" className="text-sm font-bold text-primary">Careers</a>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Button>See Open Roles</Button>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
    </nav>
  );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT (Careers Page)
// -----------------------------------------------------------------------------

const CareersPage = () => {
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
      `}</style>

      <div className="min-h-screen bg-background font-sans text-foreground">
        <Navigation />
        
        <div className="pt-20">
          {/* Hero Section */}
          <section className="relative py-24 bg-gradient-to-br from-secondary via-white to-primary/10 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                Join the Hive
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                Join Us to Make <br/> an Impact
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
                We’re a team on a mission to help future-proof the global food supply.
              </p>
              <Button size="lg" className="shadow-elegant h-14 text-lg">
                View Openings
              </Button>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5"></div>
          </section>

          {/* Intro Section */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="grid md:grid-cols-2 gap-16 items-start">
                <div>
                  <h2 className="text-6xl font-bold mb-6 text-primary">Hi!</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    We get it. Choosing your next job is one of the most important decisions you get to make. After all there’s a ton of companies to choose from. All with different cultures and vibes, different levels of compensation, different missions, so in the end it comes down to this — what matters to you, is what matters.
                  </p>
                </div>
                <div className="bg-secondary/30 p-8 rounded-2xl border border-secondary">
                  <h3 className="text-2xl font-bold mb-4">So why choose us?</h3>
                  <p className="text-muted-foreground mb-6">
                    Well for one thing we’re one of the world’s fastest-growing ag-tech companies with a genuinely purpose-driven mission: HiveMind combines a passion for leveraging technology to improve pollination and thereby improve crop outcomes, and at the same time ensuring beekeepers and their bees continue to thrive.
                  </p>
                  <div className="flex items-center gap-3 font-medium text-foreground">
                    <Heart className="h-5 w-5 text-primary" />
                    <span>Balance is key</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 ml-8">
                    We keep things fun and lighthearted, but our commitment to our mission is unwavering.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Values Grid */}
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">What to know about us</h2>
                <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Pioneers */}
                <Card className="border-none shadow-soft hover:shadow-md transition-all p-6">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Compass className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">We are Pioneers</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We aim to redefine pollination by leveraging technology to deliver predictability and precision to the process.
                  </p>
                </Card>

                {/* Technologists */}
                <Card className="border-none shadow-soft hover:shadow-md transition-all p-6">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Cpu className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">We are Technologists</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We believe in the power of technology to improve crop yields & future proof humanity’s food supply.
                  </p>
                </Card>

                {/* Optimists */}
                <Card className="border-none shadow-soft hover:shadow-md transition-all p-6">
                  <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Sun className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">We are Optimists</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We believe pollination does not have to be a zero-sum game. All stakeholders can benefit from our solution.
                  </p>
                </Card>

                {/* Bridge Builders */}
                <Card className="border-none shadow-soft hover:shadow-md transition-all p-6">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">We are Bridge Builders</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our work positions us to be leaders in the field of pollinator health and welfare. We embrace this responsibility.
                  </p>
                </Card>

                {/* Data Driven */}
                <Card className="border-none shadow-soft hover:shadow-md transition-all p-6">
                  <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Database className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">We are Data-Driven</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    At HiveMind, we like to say, “If you can measure it, you can monitor it.” A science-based approach guides all our decision-making.
                  </p>
                </Card>

                {/* Innovation */}
                <Card className="border-none shadow-soft hover:shadow-md transition-all p-6">
                  <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Innovation is in our DNA</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We’re building the world's largest database of bee and pollination knowledge — empowering beekeepers to manage hives right from their smartphones.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* Innovation DNA Extra Section */}
          <section className="py-20 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <h2 className="text-3xl font-bold mb-6">Innovation - It’s in our DNA</h2>
              <p className="text-lg opacity-90 leading-relaxed mb-8">
                With AI and machine learning, we’re decoding colony behavior to better understand and support bee health. At the same time, growers are using our state-of-the-art pollination platform to boost crop outcomes. Pretty cool, right? TIME magazine thought so too!
              </p>
              <Button variant="white" className="gap-2 text-primary font-bold">
                Check out The Buzz Blog <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </section>

          {/* Jobs Section */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Make Your Next Choice</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  If you’re seeking a new role, one that truly aligns with your goals, we’d love to be part of your journey! Check out the list of openings below.
                </p>
                
                {/* Location Filter */}
                <div className="inline-flex items-center bg-secondary/50 rounded-full px-4 py-2 text-sm font-medium">
                  <Globe className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-muted-foreground mr-2">Showing roles in:</span>
                  <span className="text-foreground font-bold">Kenya</span>
                </div>
              </div>

              {/* Job Listings */}
              <div className="space-y-4">
                {[
                  { title: "Senior Agronomist", location: "Nairobi, Kenya", type: "Full-time" },
                  { title: "Field Operations Manager", location: "Rift Valley, Kenya", type: "Full-time" },
                  { title: "Data Scientist (Remote)", location: "Kenya (Remote)", type: "Full-time" },
                  { title: "Beekeeping Specialist", location: "Mount Kenya Region", type: "Contract" },
                  { title: "Customer Success Manager", location: "Nairobi, Kenya", type: "Full-time" },
                ].map((job, i) => (
                  <div key={i} className="group border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between bg-white">
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.type}</span>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Apply Now <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground bg-secondary/30 inline-block px-6 py-3 rounded-lg">
                  HiveMind is an international company. We have offices in Tel Aviv, Fresno, Palo Alto, Australia, and <strong>Kenya</strong>.
                </p>
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

export default CareersPage;