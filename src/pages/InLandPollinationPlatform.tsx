import React, { useState } from "react";
import { 
  Menu, X, Search, ShoppingCart, Hexagon,
  Mic, Map, LayoutDashboard, ArrowRight, 
  Quote, Check, Activity, Mail, ChevronRight,
  BarChart3, Signal, Sprout, Play, Star, Calendar
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
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Precision Pollination</a>
          <a href="#" className="text-sm font-bold text-primary">In-Land Insights</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Technology</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact</a>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Button>Get Started</Button>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
    </nav>
  );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT (In-Land Pollination Page)
// -----------------------------------------------------------------------------

const InLandPollination = () => {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Almond Grower, Central Valley CA",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
      quote: "PLIP gave us visibility we never had before. We identified a cold spot in the north orchard immediately and optimized our hive placement, resulting in a 15% yield increase."
    },
    {
      name: "Miguel Rodriguez",
      role: "Blueberry Farm Owner, WA",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      quote: "The acoustic monitoring is game-changing. Knowing exactly when the bees are active helps us time our nutrient sprays perfectly to avoid disrupting pollination."
    },
    {
      name: "David Chen",
      role: "Seed Producer, OR",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
      quote: "Real-time data on the dashboard allowed us to catch a weak pollination window early. We supplemented the hives within 24 hours and saved the season."
    }
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
            <div className="container mx-auto px-4 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                    In-Land Technology
                  </Badge>
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    Pollination Land <br/>
                    Insight Platform
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
                    PLIP delivers key in-land data on per-flower bee visits to evaluate pollination efficacy.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button size="lg" className="shadow-elegant h-14 text-lg gap-2">
                      <Calendar className="h-5 w-5" /> Book Pollination Service
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 text-lg gap-2">
                      <Mic className="h-5 w-5" /> View Sensor Demo
                    </Button>
                  </div>
                </div>
                <div className="order-1 lg:order-2 relative">
                  {/* Hero Image */}
                  <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3]">
                    <img 
                      src="https://images.unsplash.com/photo-1621252179027-94459d27d3ee?auto=format&fit=crop&q=80&w=800" 
                      alt="HiveMind In-Land Sensor" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                       <div className="text-white">
                         <div className="font-bold text-lg mb-1">Acoustic Monitoring</div>
                         <div className="text-sm opacity-80 flex items-center gap-2">
                           <Activity className="h-4 w-4 text-green-400" />
                           Detecting Flight Signatures
                         </div>
                       </div>
                    </div>
                  </div>
                  {/* Abstract decorations */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/30 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          </section>

          {/* What Is PLIP + Quote */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold mb-6">PLIP. HiveMind’s In-Land Solution</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    HiveMind’s Pollination Land Insight Platform (PLIP) measures bee activity in crops. This innovative platform provides you with the crucial knowledge of how many bees are actually pollinating your crop, along with additional actionable data to make real-time decisions that influence crop yield.
                  </p>
                </div>

                <div className="relative bg-secondary/30 rounded-3xl p-10 md:p-14 border border-secondary/50">
                  <Quote className="absolute top-8 left-8 h-12 w-12 text-primary/20" />
                  <blockquote className="text-2xl md:text-3xl font-serif italic text-foreground mb-8 relative z-10 text-center">
                    “PLIP lets us see the actual number of bees that visit the flowers. Now I can check the amount of pollination in our lands 24/7.”
                  </blockquote>
                  <div className="flex flex-col items-center">
                    <div className="font-bold text-lg">Avi Gabai</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">Hazera Seed Production Israel</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tech Breakdown (Acoustics & Visibility) */}
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Acoustic Sensor Card */}
                <Card className="border-none shadow-soft hover:shadow-elegant transition-all duration-300">
                  <div className="p-8 md:p-10 flex flex-col h-full">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                      <Mic className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">We Can Hear Bees!</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Redesigned to withstand the rigors of the land, our new sensor boasts a larger enclosure to deliver improved battery life, and features a custom algorithm precisely tuned to detect the flight audio signature of the bees.
                    </p>
                    <Button variant="outline" className="w-fit group">
                      Learn More <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>

                {/* Visibility Card */}
                <Card className="border-none shadow-soft hover:shadow-elegant transition-all duration-300">
                  <div className="p-8 md:p-10 flex flex-col h-full">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                      <Map className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Visibility Into Every Land</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Accurate information about forage rates allows for real-time responses. You can see actual pollinator visits on the flower, efficiency of the pollination process, and data on the degree to which synchronized bloom has occurred, all in real-time.
                    </p>
                    <Button variant="outline" className="w-fit group">
                      View Demo <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Dashboard Section */}
          <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative">
                  {/* Dashboard Mockup */}
                  <div className="relative rounded-xl bg-gray-900 border-4 border-gray-800 shadow-2xl p-2 aspect-[16/10] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <div className="text-center p-8">
                        <BarChart3 className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
                        <div className="text-gray-400">PLIP Dashboard Live View</div>
                        <div className="grid grid-cols-4 gap-2 mt-8 opacity-40">
                          {[40, 70, 50, 90, 60, 30, 80, 50].map((h, i) => (
                            <div key={i} style={{height: `${h}%`}} className="w-full bg-primary rounded-t-sm"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floating Metric Badge */}
                  <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Signal className="h-5 w-5 text-green-500" />
                      <span className="font-bold text-gray-900">Visits / Min</span>
                    </div>
                    <div className="text-2xl font-bold">42.8</div>
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold tracking-wider uppercase text-sm">
                    <LayoutDashboard className="h-4 w-4" />
                    Data Driven
                  </div>
                  <h2 className="text-4xl font-bold mb-6">All on an Easy-to-Read Dashboard</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    The PLIP dashboard presents key metrics and delivers actionable insights every day the bees are at work. It gives highly detailed information on the per minute bee visits from each land’s data collection points.
                  </p>
                  <p className="text-lg text-muted-foreground mb-8">
                    With PLIP you can compare the impact of pollination activity among different genetic strains of the same varietal, filter by different production practices and treatments, track and correlate output rates, as well as quality levels and germination rates.
                  </p>
                  
                  {/* Research Quote */}
                  <div className="bg-muted p-6 rounded-xl border-l-4 border-primary">
                    <p className="italic text-muted-foreground mb-4">
                      “We built highly sensitive algorithms that can distinguish the acoustic signature of a flying bee from a tractor engine on the same frequency.”
                    </p>
                    <div className="font-bold text-sm">George Clouston</div>
                    <div className="text-xs uppercase tracking-wide opacity-70">Research Director</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Real Testimonials with Photos */}
          <section className="py-24 bg-secondary/20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">Hear What Our Growers Have to Say</h2>
              <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                Real results from farms across the country using the Pollination Land Insight Platform.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8">
                 {testimonials.map((t, i) => (
                   <Card key={i} className="text-left h-full border-none shadow-soft hover:shadow-elegant transition-shadow bg-white">
                      <CardContent className="p-8 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-6">
                          <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/10" />
                          <div>
                            <div className="font-bold text-foreground">{t.name}</div>
                            <div className="text-xs text-primary font-bold uppercase tracking-wide">{t.role}</div>
                          </div>
                        </div>
                        <p className="text-muted-foreground italic mb-6 flex-grow leading-relaxed">"{t.quote}"</p>
                        <div className="flex text-yellow-400 gap-1">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                        </div>
                      </CardContent>
                   </Card>
                 ))}
              </div>
            </div>
          </section>

          {/* Customer Success */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
                 <div className="w-48 h-48 flex-shrink-0 relative">
                   <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" 
                    alt="Alissa" 
                    className="w-full h-full object-cover rounded-full border-8 border-secondary shadow-lg"
                   />
                   <div className="absolute bottom-2 right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                     <Check className="h-4 w-4 text-white" />
                   </div>
                 </div>
                 <div className="text-center md:text-left">
                   <h2 className="text-3xl font-bold mb-4">We Don’t Succeed Unless You Succeed</h2>
                   <p className="text-lg text-muted-foreground mb-6">
                     We want our partnership with you to be as smooth and stress free as possible. Meet <strong>Alissa, Head of Customer Success</strong>. Her team is ready to provide you with all the help you need, from onboarding, to making sure all your contract paperwork is buttoned up.
                   </p>
                   <Button variant="outline" className="gap-2">
                     <Mail className="h-4 w-4" /> Email Us: customersuccess@hivemind.com
                   </Button>
                 </div>
              </div>
            </div>
          </section>

          {/* Cross-Link to Precision Pollination & Final CTA */}
          <section className="py-20 bg-gradient-to-br from-primary via-primary to-orange-400 text-white">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                
                {/* CTA Side */}
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-4">Ready to optimize your lands?</h2>
                  <p className="mb-8 opacity-90 text-lg">
                    Start getting actionable data on your pollination efficacy today.
                  </p>
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold h-14 px-8 text-lg border-none shadow-xl gap-2">
                    <Calendar className="h-5 w-5" /> Book Pollination Service
                  </Button>
                </div>

                {/* Cross-Link Side */}
                <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md border border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-3 rounded-lg text-primary">
                      <Sprout className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Looking for In-Hive Monitoring?</h3>
                      <p className="opacity-90 mb-6">
                        Check out our Precision Pollination solution to monitor colony health from the inside out.
                      </p>
                      <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary gap-2">
                         Explore Precision Pollination <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default InLandPollination;