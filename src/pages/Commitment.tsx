import React, { useState } from "react";
import { 
  Database, TrendingUp, 
  Menu, X, Hexagon,
  Shield, Heart, Sprout, Globe, Users
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
          <a href="#" className="text-sm font-bold text-primary">Commitment</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Technology</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Impact</a>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <Button>Get Involved</Button>
        </div>
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {isOpen && (
        <div className="border-b bg-background px-4 py-4 md:hidden animate-in slide-in-from-top-5">
          <div className="flex flex-col gap-4">
            <a href="#" className="text-sm font-medium hover:text-primary">Our Mission</a>
            <a href="#" className="text-sm font-medium hover:text-primary">Commitment</a>
            <a href="#" className="text-sm font-medium hover:text-primary">Technology</a>
            <Button className="w-full">Get Involved</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT (Commitment Page)
// -----------------------------------------------------------------------------

const CommitmentPage = () => {
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
        
        /* Shadows & Gradients */
        .shadow-soft { box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); }
        .shadow-elegant { box-shadow: 0 20px 40px -10px rgba(245, 158, 11, 0.15); }
        
        .bg-gradient-hero { background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%); }
        .text-gradient { background: linear-gradient(to right, #d97706, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      <div className="min-h-screen bg-background font-sans text-foreground">
        <Navigation />
        
        <div className="pt-20">
          {/* Hero Section */}
          <section className="relative overflow-hidden py-24 md:py-32">
            <div className="container mx-auto px-4 relative z-10">
              <div className="mx-auto max-w-4xl text-center">
                <Badge className="mb-8 bg-amber-100 text-amber-800 border-none hover:bg-amber-200">
                  Global Impact Report
                </Badge>
                <h1 className="mb-6 text-6xl font-bold leading-tight md:text-7xl tracking-tight text-foreground">
                  75% of Food Crops <br />
                  <span className="text-gradient">Rely on Bees</span>
                </h1>
                <p className="mb-10 text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  HiveMind is committed to the welfare of honey bees and the future of our food systems.
                </p>
              </div>
            </div>
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-50 rounded-full blur-3xl -z-10 opacity-60"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-yellow-50 rounded-full blur-3xl -z-10 opacity-60"></div>
          </section>

          {/* Our Commitment / What's in a Name */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-16 items-start">
                <div>
                  <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold tracking-wider uppercase text-sm">
                    <Heart className="h-4 w-4" />
                    Our Commitment
                  </div>
                  <h2 className="text-4xl font-bold mb-6">What's in a Name?</h2>
                  <div className="prose prose-lg text-muted-foreground">
                    <p className="mb-4">
                      In our case, it turns out it’s quite a lot. <strong>HiveMind</strong> says everything about us. We are their supporters. We are their advocates. We are their champions.
                    </p>
                    <p>
                      From the very beginning, our name has been the lens through which we make decisions. It gives clarity to our mission and serves as a daily reminder of how important it is. After all is said and done, bees are the unsung heroes of agriculture. They pollinate the planet and power our food ecosystem.
                    </p>
                  </div>
                </div>
                <div className="grid gap-6">
                   <img 
                    src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800" 
                    alt="Beekeeper holding frame" 
                    className="rounded-2xl shadow-elegant object-cover h-[400px] w-full"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Healthy Hive Index Section */}
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">Enter the Healthy Hive Index</h2>
                <p className="text-xl text-muted-foreground">
                  We have developed data-driven tools that measure the impact of bee-friendly orchards on the overall welfare of bees.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-none shadow-soft hover:shadow-lg transition-all">
                  <CardContent>
                    <div className="mb-6 bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                      <Database className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Unprecedented Visibility</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Tracking colony health during pollination requires visibility into these colonies on an unprecedented scale. Only HiveMind has the volume of aggregated data to achieve this. By analyzing hive data derived from all of our monitored colonies, we have developed a scientific model to create reports that help growers fulfill their sustainability goals.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-soft hover:shadow-lg transition-all">
                  <CardContent>
                    <div className="mb-6 bg-accent w-12 h-12 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">And it's Good for Business</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      These personalized bee health reports and certificates help crop producers benefit from the wave of consumer demand for ethically sourced food ingredients. This can be a powerful market differentiator and can translate directly into an advantage when working with other supply chain stakeholders.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Impact Stat */}
          <section className="py-24 bg-foreground text-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5"></div>
            <div className="container mx-auto px-4 text-center relative z-10">
              <div className="inline-block mb-4">
                <Badge variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Global Impact Since 2020
                </Badge>
              </div>
              <h2 className="text-[120px] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 mb-4">
                629 M+
              </h2>
              <p className="text-2xl md:text-3xl font-medium tracking-wide text-white/90">
                BEES SAVED AND PROTECTED
              </p>
            </div>
          </section>

          {/* Wild Pollinators */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="order-2 md:order-1">
                  <img 
                    src="https://images.unsplash.com/photo-1470753937643-efeb931202a9?auto=format&fit=crop&q=80&w=800" 
                    alt="Wildflower meadow" 
                    className="rounded-2xl shadow-elegant object-cover h-[500px] w-full"
                  />
                </div>
                <div className="order-1 md:order-2">
                  <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold tracking-wider uppercase text-sm">
                    <Sprout className="h-4 w-4" />
                    Biodiversity
                  </div>
                  <h2 className="text-4xl font-bold mb-6 leading-tight">
                    Healthy Ecosystems Require Stable Wild Pollinator Populations
                  </h2>
                  <div className="prose prose-lg text-muted-foreground mb-8">
                    <p className="mb-4">
                      Across the spectrum, wild pollinators including wasps, flies, and beetles, many solitary bee species, moths and butterflies, are all under pressure. Habitat loss, fossil fuel-based agricultural inputs and other drivers all contribute to population decline.
                    </p>
                    <p>
                      Only by accurately tracking population levels can conservation work be effective. HiveMind's acoustic detection technology can greatly improve the accuracy of species monitoring.
                    </p>
                  </div>
                  <Button variant="outline" size="lg">
                    Learn About Our Tech
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* ESG Commitment */}
          <section className="py-24 bg-gradient-to-br from-secondary to-white">
            <div className="container mx-auto px-4 max-w-5xl">
              <Card className="border-none shadow-elegant bg-white overflow-hidden">
                <div className="grid md:grid-cols-5">
                  <div className="md:col-span-3 p-10 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-6 text-primary font-bold">
                      <Globe className="h-5 w-5" />
                      <span>Corporate Responsibility</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-6">Our ESG Commitment</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                      ESG (Environmental, Social and Governance) practices are an increasingly important component of corporate responsibility and reputation. HiveMind fulfills its obligations in several demonstrable ways, ensuring transparency and sustainable growth.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Read More
                      </Button>
                      <Button variant="outline" size="lg">
                        View 2024 Report
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-primary/5 flex items-center justify-center p-10">
                    <div className="grid gap-4 w-full">
                      {[
                        { label: "Environmental", icon: Sprout },
                        { label: "Social", icon: Users },
                        { label: "Governance", icon: Shield }
                      ].map((item, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-bold">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default CommitmentPage;