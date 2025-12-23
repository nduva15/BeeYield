import React, { useState } from "react";
import { 
  Menu, X, Search, ShoppingCart, Hexagon,
  Cpu, Wifi, LayoutDashboard, ArrowRight, 
  Quote, Check, BookOpen, Mail, ChevronRight,
  BarChart3, Thermometer, Mic
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
          <a href="#" className="text-sm font-bold text-primary">Precision Pollination</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">In-Field Insights</a>
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
      {/* Mobile Menu omitted for brevity */}
    </nav>
  );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT (Precision Pollination Page)
// -----------------------------------------------------------------------------

const PrecisionPollination = () => {
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
                <div>
                  <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                    In-Hive Technology
                  </Badge>
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    Precision Pollination
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
                    Accountability. Actionable data. <br/>
                    And a guarantee of the strongest bees available.
                  </p>
                  <Button size="lg" className="shadow-elegant h-14 text-lg">
                    Get a Free Consultation
                  </Button>
                </div>
                <div className="relative">
                  {/* Hero Image / Graphic Placeholder */}
                  <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                    <img 
                      src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800" 
                      alt="HiveMind Precision Hive" 
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                       <div className="text-white">
                         <div className="font-bold text-lg mb-1">Live Monitoring Active</div>
                         <div className="text-sm opacity-80 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                           System Online
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

          {/* What Is Precision Pollination + Quote */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold mb-6">What is Precision Pollination?</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Precision Pollination is a groundbreaking, innovative approach to the critical process of managed pollination in commercial crop growing. Growers whose crops rely on commercial beekeepers for their annual pollination can now, for the first time, get visibility and accountability for their pollination experience.
                  </p>
                </div>

                <div className="relative bg-secondary/30 rounded-3xl p-10 md:p-14 border border-secondary/50">
                  <Quote className="absolute top-8 left-8 h-12 w-12 text-primary/20" />
                  <blockquote className="text-2xl md:text-3xl font-serif italic text-foreground mb-8 relative z-10 text-center">
                    “Our commitment to our growers is to bring them unprecedented transparency for the most effective pollination outcomes.”
                  </blockquote>
                  <div className="flex flex-col items-center">
                    <div className="font-bold text-lg">Ze’ev Barylka</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">HiveMind Chief Sales and Marketing Officer</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tech Breakdown (Sensor & Gateway) */}
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Sensor Card */}
                <Card className="border-none shadow-soft hover:shadow-elegant transition-all duration-300">
                  <div className="p-8 md:p-10 flex flex-col h-full">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                      <Mic className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">In-Hive Sensor</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      HiveMind hives are equipped with small IoT (Internet of Things) sensors. They capture key metrics from the colony, including temperature, humidity, light levels, location, hive orientation, and most importantly, the acoustic signature of the hive. The sensors communicate with the Gateway, which is attached to the outside of the hive.
                    </p>
                    <Button variant="outline" className="w-fit group">
                      Read More <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>

                {/* Gateway Card */}
                <Card className="border-none shadow-soft hover:shadow-elegant transition-all duration-300">
                  <div className="p-8 md:p-10 flex flex-col h-full">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                      <Wifi className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Gateway</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      One Gateway (think of it as a modem) is attached to the exterior of one of the hives. The sensors communicate with the Gateway via a low energy Bluetooth™ connection. The Gateway then transfers the data to the cloud for analysis.
                    </p>
                    <Button variant="outline" className="w-fit group">
                      Read More <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
                <div className="order-2 lg:order-1 relative">
                  {/* Dashboard Mockup */}
                  <div className="relative rounded-xl bg-gray-900 border-4 border-gray-800 shadow-2xl p-2 aspect-[16/10] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <div className="text-center p-8">
                        <LayoutDashboard className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
                        <div className="text-gray-400">Interactive Dashboard Preview</div>
                        {/* Fake Graphs */}
                        <div className="flex gap-4 mt-8 justify-center opacity-30">
                           <div className="w-16 h-24 bg-primary rounded-t-lg"></div>
                           <div className="w-16 h-32 bg-primary rounded-t-lg"></div>
                           <div className="w-16 h-16 bg-primary rounded-t-lg"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floating Metric Badge */}
                  <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Thermometer className="h-5 w-5 text-red-500" />
                      <span className="font-bold text-gray-900">Optimal Temp</span>
                    </div>
                    <div className="text-2xl font-bold">35.4°C</div>
                  </div>
                </div>

                <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold tracking-wider uppercase text-sm">
                    <BarChart3 className="h-4 w-4" />
                    Full Visibility
                  </div>
                  <h2 className="text-4xl font-bold mb-6">Easy-to-Understand Dashboard</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    All the key metrics for each orchard, from the day the bees are delivered until the day the beekeepers remove them, are displayed on the dashboard.
                  </p>
                  <p className="text-lg text-muted-foreground mb-8">
                    These include the current frames-per-acre count of the orchards, along with bee activity, flight time, location and temperature for drop points, and more — giving growers complete confidence that they are getting the pollination they have paid for.
                  </p>
                  <ul className="space-y-3">
                    {["Frames-per-acre count", "Bee activity & flight time", "GPS Location & Temperature"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 font-medium">
                        <Check className="h-5 w-5 text-green-500" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* The HiveMind Difference */}
          <section className="py-24 bg-primary text-primary-foreground relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5"></div>
            <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
              <h2 className="text-4xl font-bold mb-8">The HiveMind Difference</h2>
              <p className="text-2xl font-light mb-12 leading-relaxed">
                "Knowledge is power. Data is even better."
              </p>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm border border-white/20">
                  <h3 className="text-xl font-bold mb-4">Precision Calculation</h3>
                  <p className="opacity-90">
                    Knowing the exact strength of every hive in your field means pollination can be calculated using a frames-per-acre model for a far more precise outcome.
                  </p>
                </div>
                <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm border border-white/20">
                  <h3 className="text-xl font-bold mb-4">Financial Prudence</h3>
                  <p className="opacity-90">
                    It’s accurate, efficient, and financially prudent. You stop paying for "boxes" and start paying for actual pollination power.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Visibility Section */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <h2 className="text-3xl font-bold mb-6">Do You Know What’s in the Box?</h2>
              <p className="text-xl text-primary font-bold mb-8">We do.</p>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                When you pollinate with HiveMind you get complete visibility into the hives deployed in your orchards. We are accountable to you to bring the precise number of bees needed for optimal pollination outcomes. We replace any non-performing hives with stronger, more effective colonies.
              </p>
            </div>
          </section>

          {/* Education Download */}
          <section className="py-20 bg-secondary/30">
            <div className="container mx-auto px-4">
              <div className="bg-white rounded-3xl p-8 md:p-16 shadow-elegant border border-secondary flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2">
                   <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6">
                      <BookOpen className="h-8 w-8 text-accent-foreground" />
                    </div>
                  <h2 className="text-3xl font-bold mb-4">How Much Should You Know About Bees?</h2>
                  <p className="text-muted-foreground mb-6">
                    Your call, of course. But you should know enough to speak your beekeepers language. For example, did you know that bee math is different from regular math?
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-xl mb-6">
                    <p className="font-medium text-secondary-foreground">
                      💡 2x8 does not equal sixteen when it comes to bee frames. A sixteen frame hive actually has 30% more foraging force than that of two 8 framers.
                    </p>
                  </div>
                  <p className="text-muted-foreground mb-8">
                    Download our free guide to understand bees and how to get the most from them during pollination.
                  </p>
                  <Button size="lg" className="gap-2">
                    Download Guide <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="md:w-1/2 flex justify-center">
                   <div className="w-64 aspect-[3/4] bg-muted rounded-lg shadow-lg rotate-3 border-8 border-white flex items-center justify-center text-center p-8">
                     <div>
                       <div className="font-bold text-2xl mb-2 text-primary">BEE MATH</div>
                       <div className="text-sm text-muted-foreground">The Grower's Guide to Precision Pollination</div>
                       <div className="mt-8 text-6xl">🐝</div>
                     </div>
                   </div>
                </div>
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

          {/* Final CTA */}
          <section className="py-20 bg-muted/50 border-t">
            <div className="container mx-auto px-4 text-center max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">Ready to work with us?</h2>
              <p className="text-muted-foreground mb-8">
                Fill in some basic information - just your name and the best way to contact you and we’ll be in touch shortly.
              </p>
              <Button size="lg" className="w-full md:w-auto h-14 text-lg px-12">
                Contact Us Today
              </Button>
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

export default PrecisionPollination;