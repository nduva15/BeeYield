import React, { useState } from "react";
import { 
  Database, TrendingUp, 
  Menu, X, Hexagon,
  Check, Shield, Heart, Sprout, Globe, Users, Leaf, Wind, Sun, ArrowRight, Quote
} from "lucide-react";

// -----------------------------------------------------------------------------
// MOCK IMPORTS & THEME CONFIGURATION
// -----------------------------------------------------------------------------

const Button = ({ children, variant = "default", size = "default", className = "", asChild = false, ...props }) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:opacity-90 shadow-md",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
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
    accent: "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
  };
  
  return (
    <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-8 ${className}`}>
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
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Our Mission</a>
          <a href="#" className="text-sm font-bold text-primary">ESG Commitment</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Technology</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Impact</a>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <Button>View 2024 Report</Button>
        </div>
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {isOpen && (
        <div className="border-b bg-background px-4 py-4 md:hidden animate-in slide-in-from-top-5">
          <div className="flex flex-col gap-4">
            <a href="#" className="text-sm font-medium hover:text-primary">Our Mission</a>
            <a href="#" className="text-sm font-medium hover:text-primary">ESG Commitment</a>
            <a href="#" className="text-sm font-medium hover:text-primary">Technology</a>
            <Button className="w-full">View 2024 Report</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT (ESG Page)
// -----------------------------------------------------------------------------

const ESGPage = () => {
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
        
        .bg-accent { background-color: var(--accent); }
        .text-accent-foreground { color: var(--accent-foreground); }
        
        .text-foreground { color: var(--foreground); }
        
        .border { border-width: 1px; border-color: var(--border); }
        .border-input { border-color: var(--border); }
        
        /* Utility */
        .text-gradient { background: linear-gradient(to right, #d97706, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .shadow-soft { box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); }
        .shadow-elegant { box-shadow: 0 20px 40px -10px rgba(245, 158, 11, 0.15); }
      `}</style>

      <div className="min-h-screen bg-background font-sans text-foreground">
        <Navigation />
        
        <div className="pt-20">
          {/* Header Section */}
          <section className="bg-secondary/30 py-20 border-b">
            <div className="container mx-auto px-4 text-center max-w-4xl">
              <Badge className="mb-6 bg-white border border-primary/20 text-primary hover:bg-white">
                Corporate Responsibility
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Our ESG Commitment
              </h1>
              <p className="text-2xl text-muted-foreground leading-relaxed">
                We’re committed to addressing pressing global sustainability challenges through our precision pollination technology.
              </p>
            </div>
          </section>

          {/* Key Stats Section */}
          <section className="py-12 -mt-10 relative z-10">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="shadow-elegant border-none bg-primary text-primary-foreground">
                  <CardContent className="flex flex-col items-center text-center">
                    <Heart className="h-8 w-8 mb-4 opacity-80" />
                    <div className="text-4xl font-bold mb-2">629 M+</div>
                    <div className="text-sm font-medium opacity-90 uppercase tracking-wider">Bees Saved</div>
                  </CardContent>
                </Card>
                <Card className="shadow-elegant border-none bg-white">
                  <CardContent className="flex flex-col items-center text-center">
                    <Wind className="h-8 w-8 mb-4 text-primary" />
                    <div className="text-4xl font-bold mb-2 text-foreground">1,174</div>
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tons CO2 Avoided</div>
                  </CardContent>
                </Card>
                <Card className="shadow-elegant border-none bg-white">
                  <CardContent className="flex flex-col items-center text-center">
                    <TrendingUp className="h-8 w-8 mb-4 text-primary" />
                    <div className="text-4xl font-bold mb-2 text-foreground">240%</div>
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Increase in Coverage</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Intro Narrative */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 max-w-4xl">
              <h2 className="text-3xl font-bold mb-8">Unveiling Our Impact</h2>
              <div className="prose prose-lg text-muted-foreground">
                <p className="mb-6">
                  In June 2024, BeeYield revealed ESG data from 2023 showcasing how its Precision Pollination as a Service (PPaaS) solution contributes to food security, reduced emissions, and the biodiversity and protection of the ecosystem.
                </p>
                <p>
                  By enhancing bee colony health and minimizing CO2 emissions, BeeYield is helping to advance global UN Sustainable Development Goals (SDGs) and to secure the future of the global food supply.
                </p>
              </div>
            </div>
          </section>

          {/* SDG Details */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid gap-16 max-w-5xl mx-auto">
                
                {/* SDG 15 - Life on Land */}
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div className="bg-white p-8 rounded-2xl shadow-soft">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Sprout className="h-6 w-6 text-green-700" />
                      </div>
                      <h3 className="text-xl font-bold text-green-800">SDG 15: Life on Land</h3>
                    </div>
                    <h4 className="text-2xl font-bold mb-4">Protecting Biodiversity</h4>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Supporting biodiversity and ecosystem protection, BeeYield's technology provides beekeepers with real-time insights into colony health. In 2023, our beekeepers experienced significantly lower colony losses, equating to approximately 629 million bees saved. This directly contributes to stopping biodiversity loss.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm font-medium">
                        <Check className="h-4 w-4 text-primary" /> 25,190 fewer colonies lost
                      </li>
                      <li className="flex items-center gap-2 text-sm font-medium">
                        <Check className="h-4 w-4 text-primary" /> Stronger hives require fewer resources
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden shadow-md">
                     <img 
                      src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800" 
                      alt="Biodiversity" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* SDG 2 - Zero Hunger */}
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div className="order-2 md:order-1 relative h-full min-h-[300px] rounded-2xl overflow-hidden shadow-md">
                    <img 
                      src="https://images.unsplash.com/photo-1625246333195-58197bd47d26?auto=format&fit=crop&q=80&w=800" 
                      alt="Crop Field" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="order-1 md:order-2 bg-white p-8 rounded-2xl shadow-soft">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-amber-100 p-3 rounded-lg">
                        <Sun className="h-6 w-6 text-amber-700" />
                      </div>
                      <h3 className="text-xl font-bold text-amber-800">SDG 2: Zero Hunger</h3>
                    </div>
                    <h4 className="text-2xl font-bold mb-4">Food Security & Yield</h4>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      In 2023, BeeYield serviced over 140K acres across North America, Europe, and Australia—a 240% increase. By optimizing deployment for crops like almonds, apples, and blueberries, we leverage technology to increase yield and nutritional value, directly supporting the goal of Zero Hunger.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Almonds", "Apples", "Cherries", "Blueberries", "Rapeseed"].map(crop => (
                        <Badge key={crop} variant="secondary">{crop}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SDG 13 - Climate Change */}
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div className="bg-white p-8 rounded-2xl shadow-soft">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Globe className="h-6 w-6 text-blue-700" />
                      </div>
                      <h3 className="text-xl font-bold text-blue-800">SDG 13: Climate Change</h3>
                    </div>
                    <h4 className="text-2xl font-bold mb-4">Reducing Emissions</h4>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Our technology minimizes hive transportation by utilizing fewer, stronger colonies per acre. In 2023, BeeYield's services prevented 1,174 tons of CO2 emissions—a 188% increase in savings from the previous year.
                    </p>
                     <Button variant="outline" className="w-full justify-between group">
                        Read Climate Report <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                     </Button>
                  </div>
                  <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden shadow-md">
                     <img 
                      src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" 
                      alt="Clean Air Mountains" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* CEO Quote */}
          <section className="py-24 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 text-center max-w-4xl">
              <Quote className="h-12 w-12 mx-auto mb-8 opacity-50" />
              <blockquote className="text-2xl md:text-4xl font-bold leading-tight mb-10">
                "We are proud to showcase BeeYield's commitment to addressing pressing global sustainability challenges. Our data underscores the vital role bees play in ensuring food security, reducing emissions, and safeguarding biodiversity."
              </blockquote>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-white/20 rounded-full mb-4"></div>
                <cite className="not-italic font-bold text-lg">Omer Davidi</cite>
                <span className="opacity-80">CEO & Co-Founder, BeeYield</span>
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <section className="py-20 bg-white text-center">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6">Join Us in Creating a Sustainable Future</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Explore our full Environmental, Social, and Governance data to see how we are making a difference.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg">Download 2023 ESG Report</Button>
                <Button size="lg" variant="outline">Contact Our ESG Team</Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default ESGPage;