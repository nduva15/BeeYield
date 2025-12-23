import React, { useState } from "react";
import { 
  Menu, X, Search, Hexagon, ArrowRight, 
  Globe, Activity, BookOpen, Heart, AlertTriangle,
  MapPin, Check, Mail, Leaf, TrendingUp
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
    white: "bg-white text-primary font-bold shadow-sm",
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

const Input = ({ label, required, ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium leading-none text-muted-foreground">
      {label} {required && <span className="text-primary">*</span>}
    </label>
    <input
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
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
          <a href="#" className="text-sm font-bold text-primary">Global Network</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Technology</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Impact</a>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Button>Support the Cause</Button>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
    </nav>
  );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT (Global Network Page)
// -----------------------------------------------------------------------------

const GlobalNetworkPage = () => {
  const [supportType, setSupportType] = useState("monthly");

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
          --input: #e7e5e4;
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
        .border-input { border-color: var(--input); }
        
        .shadow-soft { box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); }
        .shadow-elegant { box-shadow: 0 20px 40px -10px rgba(245, 158, 11, 0.15); }
        .text-gradient { background: linear-gradient(to right, #d97706, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      <div className="min-h-screen bg-background font-sans text-foreground">
        <Navigation />
        
        <div className="pt-20">
          {/* Hero Section */}
          <section className="relative py-24 bg-gradient-to-b from-secondary/50 via-white to-primary/5 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10 text-center max-w-5xl">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                A Planetary Initiative
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                The Global <span className="text-gradient">Two Million Hives</span> Network
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10 max-w-3xl mx-auto">
                HiveMind is creating the world’s largest science-driven initiative to address the global bee crisis.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="shadow-elegant h-14 text-lg">
                  Support the Cause Today
                </Button>
                <Button size="lg" variant="outline" className="h-14 text-lg">
                  Read the Whitepaper
                </Button>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5"></div>
          </section>

          {/* The Crisis Section */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-50 rounded-3xl transform rotate-3"></div>
                  <div className="relative bg-white border border-red-100 p-8 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-3 mb-6 text-red-600">
                      <AlertTriangle className="h-6 w-6" />
                      <span className="font-bold uppercase tracking-wider">Global Emergency</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">The Silent Decline</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      A major indication of the health of a hive is the density of bees on its frames. But with growing bee mortality rates, it is becoming increasingly frequent for beekeepers around the world to open their hives – and discover weak hives with few, if any, bees.
                    </p>
                    <div className="bg-red-50 p-6 rounded-xl">
                      <div className="text-4xl font-bold text-red-600 mb-1">60%</div>
                      <div className="text-sm font-medium text-red-900 opacity-80">Mortality rate in U.S. hives this past season</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-4xl font-bold mb-6">The Bee Crisis: <br/>A Global Emergency</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Bees are at the heart of global food production, biodiversity, and ecosystem stability, yet they face an unprecedented crisis. Alarming declines are reported worldwide.
                  </p>
                  <p className="text-lg font-medium text-foreground mb-8">
                    This threat to pollinators is a threat to food security and agricultural sustainability. The time to act is now.
                  </p>
                  <div className="h-1 w-24 bg-primary rounded-full"></div>
                </div>
              </div>
            </div>
          </section>

          {/* The Initiative & Goals */}
          <section className="py-24 bg-secondary/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center mb-20">
                <h2 className="text-3xl font-bold mb-6">A Science-Driven Response</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To address this crisis, HiveMind is launching The Global Two Million Hives Network. This initiative is the world’s first large-scale, science-driven effort of its kind. We prioritize research, data, and technology to drive meaningful impact.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Goal 1 */}
                <Card className="border-none shadow-soft hover:shadow-md transition-all text-center p-8 bg-white">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-primary">GOAL 1</h3>
                  <div className="text-3xl font-bold mb-4 text-foreground">2M Smart Hives</div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Creating a global network of smart hives, focusing on high-risk countries and priority agricultural regions by partnering with local stakeholders.
                  </p>
                </Card>

                {/* Goal 2 */}
                <Card className="border-none shadow-soft hover:shadow-md transition-all text-center p-8 bg-white">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-blue-600">GOAL 2</h3>
                  <div className="text-3xl font-bold mb-4 text-foreground">100M Signals</div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Collecting 100 million daily bee signals to build the largest and most comprehensive global bee health dataset in history.
                  </p>
                </Card>

                {/* Goal 3 */}
                <Card className="border-none shadow-soft hover:shadow-md transition-all text-center p-8 bg-white">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-green-600">GOAL 3</h3>
                  <div className="text-3xl font-bold mb-4 text-foreground">Education</div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Working with governments, NGOs, farmers, and educators to implement sustainable pollination practices worldwide.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* Global Case Studies */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold text-center mb-16">Pioneering Work Across the Globe</h2>
              
              <div className="space-y-24">
                {/* Peru */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="order-2 md:order-1">
                    <div className="flex items-center gap-2 mb-4 text-primary font-bold tracking-wider">
                      <MapPin className="h-5 w-5" /> PERU
                    </div>
                    <h3 className="text-3xl font-bold mb-4">Empowering Latin America</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      HiveMind is breaking new ground through a strategic collaboration with CONAPI, the National Confederation of Beekeepers. This partnership aims to empower Peruvian beekeepers with data-driven pollination tools, specifically for key exports like avocado and blueberries.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-primary" /> First partnership in Latin America</li>
                      <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-primary" /> Focus on education and market readiness</li>
                    </ul>
                  </div>
                  <div className="order-1 md:order-2 rounded-2xl overflow-hidden shadow-elegant h-[400px]">
                    <img src="https://images.unsplash.com/photo-1526346698789-22fd84314424?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Peru Agriculture" />
                  </div>
                </div>

                {/* California */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="rounded-2xl overflow-hidden shadow-elegant h-[400px]">
                    <img src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="California Almonds" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-primary font-bold tracking-wider">
                      <MapPin className="h-5 w-5" /> CALIFORNIA, USA
                    </div>
                    <h3 className="text-3xl font-bold mb-4">The Almond Bloom Experiment</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      During the 2025 almond bloom, HiveMind launched an ambitious dual-site study on the effects of ground cover and topography. Deploying 144 sensors capturing data every ten minutes, we are pioneering one of the most granular studies of pollination environments to date.
                    </p>
                    <div className="bg-secondary/30 p-4 rounded-xl border border-secondary">
                      <p className="text-sm italic text-muted-foreground">
                        "Preliminary results are already challenging assumptions, such as the belief that bare soil retains and radiates heat overnight."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Israel */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="order-2 md:order-1">
                    <div className="flex items-center gap-2 mb-4 text-primary font-bold tracking-wider">
                      <MapPin className="h-5 w-5" /> ISRAEL
                    </div>
                    <h3 className="text-3xl font-bold mb-4">Solving the Avocado Puzzle</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Partnering with the Israeli Honey Board, HiveMind is spearheading a ground-breaking study on optimal hive density for the Hass avocado cultivar. Little is known about the density that maximizes fruit set without harming colony health—until now.
                    </p>
                    <Button variant="outline">Read the Study Findings</Button>
                  </div>
                  <div className="order-1 md:order-2 rounded-2xl overflow-hidden shadow-elegant h-[400px]">
                    <img src="https://images.unsplash.com/photo-1517260739337-6799d2df9ece?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Avocado Orchard" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support / Donation Section */}
          <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <Heart className="h-16 w-16 mx-auto mb-6 text-white/80" />
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Show Your Support</h2>
                <p className="text-xl opacity-90 leading-relaxed">
                  Join our global community of growers, researchers, and advocates working to secure the future of pollinators and global food supply.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                {/* Donation Card */}
                <Card className="bg-white text-foreground border-none p-8 text-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-6">
                    <div className="bg-secondary p-1 rounded-lg inline-flex">
                      <button 
                        onClick={() => setSupportType("onetime")}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${supportType === "onetime" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        One-time
                      </button>
                      <button 
                        onClick={() => setSupportType("monthly")}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${supportType === "monthly" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <span className="text-6xl font-bold text-primary">
                      {supportType === "monthly" ? "$10" : "$50"}
                    </span>
                    {supportType === "monthly" && <span className="text-muted-foreground text-xl">/mo</span>}
                  </div>
                  
                  <ul className="text-left space-y-3 mb-8 px-4">
                    <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Fund sensor deployment</li>
                    <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Support beekeeper education</li>
                    <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Receive impact reports</li>
                  </ul>

                  <Button size="lg" className="w-full h-12 text-lg shadow-md">
                    Support
                  </Button>
                </Card>

                {/* Higher Tier Card */}
                <Card className="bg-white/95 text-foreground border-4 border-yellow-300 p-8 text-center shadow-2xl relative overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  <div className="absolute top-0 right-0 bg-yellow-300 text-yellow-900 text-xs font-bold px-3 py-1">MOST POPULAR</div>
                  <div className="flex justify-center mb-6 pt-4">
                    <h3 className="font-bold text-xl">Patron of the Hive</h3>
                  </div>
                  
                  <div className="mb-8">
                    <span className="text-6xl font-bold text-primary">
                      {supportType === "monthly" ? "$100" : "$500"}
                    </span>
                    {supportType === "monthly" && <span className="text-muted-foreground text-xl">/mo</span>}
                  </div>
                  
                  <ul className="text-left space-y-3 mb-8 px-4">
                    <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Adopt a smart hive</li>
                    <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Access to webinars & events</li>
                    <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Exclusive network insights</li>
                  </ul>

                  <Button size="lg" className="w-full h-12 text-lg shadow-md bg-primary hover:bg-primary/90">
                    Support
                  </Button>
                </Card>
              </div>
            </div>
          </section>

          {/* Signup Form */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-2xl">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-4">Sign Up To Our Network</h2>
                <p className="text-muted-foreground">
                  Interested in updates, webinars, events, and research related to bee health and The Two Million Hives Initiative? We will be happy to keep in touch.
                </p>
              </div>
              
              <Card className="border shadow-soft p-8">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input label="First Name" required placeholder="John" />
                    <Input label="Last Name" required placeholder="Doe" />
                  </div>
                  <Input label="Email" required type="email" placeholder="john@example.com" />
                  
                  <Button size="lg" className="w-full">
                    Submit
                  </Button>
                </form>
              </Card>
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

export default GlobalNetworkPage;