import React, { useState } from "react";
import { 
  Menu, X, Search, Hexagon, ChevronDown, 
  ArrowRight, Activity, Sprout, BarChart3, 
  Cpu, Wifi, ShieldCheck, QrCode, Leaf
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
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-foreground">
          <Hexagon className="h-8 w-8 text-primary fill-primary" />
          <span>Hive<span className="text-primary">Mind</span></span>
        </div>
        
        <div className="hidden md:flex md:items-center md:gap-8">
          {/* Solutions Dropdown Trigger */}
          <div className="relative group">
            <button 
              className="flex items-center gap-1 text-sm font-bold text-primary focus:outline-none"
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              onMouseEnter={() => setSolutionsOpen(true)}
            >
              Solutions <ChevronDown className="h-4 w-4" />
            </button>
            
            {/* Dropdown Content */}
            <div 
              className={`absolute top-full left-0 w-64 pt-4 transition-all duration-200 ${solutionsOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <div className="bg-white rounded-xl shadow-xl border border-border overflow-hidden">
                <a href="#" className="block p-4 hover:bg-secondary/50 transition-colors">
                  <div className="font-bold text-foreground mb-1">In-Hive Precision</div>
                  <div className="text-xs text-muted-foreground">Colony health & strength monitoring</div>
                </a>
                <div className="h-px bg-border/50"></div>
                <a href="#" className="block p-4 hover:bg-secondary/50 transition-colors">
                  <div className="font-bold text-foreground mb-1">In-Field Insights</div>
                  <div className="text-xs text-muted-foreground">Real-time pollination activity tracking</div>
                </a>
              </div>
            </div>
          </div>

          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Our Story</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Technology</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact</a>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <a href="#" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
            <QrCode className="h-4 w-4" />
            Traceability
          </a>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {/* Mobile Menu omitted for brevity but would mirror desktop structure */}
    </nav>
  );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT (Pollination Solutions Hub)
// -----------------------------------------------------------------------------

const PollinationSolutions = () => {
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
          {/* Hub Hero */}
          <section className="relative py-24 bg-gradient-to-b from-secondary/30 to-white overflow-hidden">
            <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                End-to-End Visibility
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                Pollination Solutions
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mb-10">
                We combine biological understanding with technological innovation to monitor pollination from the inside out.
              </p>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          </section>

          {/* The Two Paths Section */}
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                
                {/* Path 1: In-Hive */}
                <div className="relative group rounded-3xl overflow-hidden border border-border shadow-soft hover:shadow-elegant transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                  <div className="p-8 md:p-12 flex flex-col h-full bg-white relative z-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                      <Cpu className="h-8 w-8 text-primary" />
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-4">In-Hive Precision</h2>
                    <p className="text-lg text-muted-foreground mb-8 flex-grow">
                      Our proprietary sensors live inside the hive box, monitoring acoustic signatures, temperature, and humidity 24/7. Know the strength of your colonies before they are deployed.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="font-medium">Queen health status</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="font-medium">Colony strength grading</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="font-medium">Environmental stress alerts</span>
                      </div>
                    </div>

                    <Button size="lg" className="w-full gap-2 group-hover:bg-primary group-hover:text-white transition-colors">
                      Explore In-Hive Technology <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Background Image Overlay */}
                  <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                    <img 
                      src="https://images.unsplash.com/photo-1520500201882-e3d8f804562e?auto=format&fit=crop&q=80&w=800" 
                      className="w-full h-full object-cover" 
                      alt="Hive bg" 
                    />
                  </div>
                </div>

                {/* Path 2: In-Field */}
                <div className="relative group rounded-3xl overflow-hidden border border-border shadow-soft hover:shadow-elegant transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-2 bg-accent-foreground"></div>
                  <div className="p-8 md:p-12 flex flex-col h-full bg-white relative z-10">
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                      <Wifi className="h-8 w-8 text-accent-foreground" />
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-4">In-Field Insights</h2>
                    <p className="text-lg text-muted-foreground mb-8 flex-grow">
                      Sensors deployed across your orchards measure actual bee flight activity and pollination events. Visualize coverage maps to ensure every acre gets the attention it needs.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="font-medium">Real-time pollination maps</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="font-medium">Foraging efficiency tracking</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="font-medium">Weather impact analysis</span>
                      </div>
                    </div>

                    <Button size="lg" variant="outline" className="w-full gap-2 group-hover:bg-accent-foreground group-hover:text-white transition-colors border-accent-foreground/20 text-accent-foreground">
                      Explore In-Field Technology <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Background Image Overlay */}
                  <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                    <img 
                      src="https://images.unsplash.com/photo-1621252179027-94459d27d3ee?auto=format&fit=crop&q=80&w=800" 
                      className="w-full h-full object-cover" 
                      alt="Field bg" 
                    />
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Unified Platform Section */}
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <Badge className="mb-4 bg-white border border-primary/20 text-primary">
                  The HiveMind Platform
                </Badge>
                <h2 className="text-4xl font-bold mb-6">Better Together</h2>
                <p className="text-lg text-muted-foreground">
                  While powerful individually, our In-Hive and In-Field solutions work best in tandem, providing a complete feedback loop for growers and beekeepers.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Monitor</h3>
                  <p className="text-muted-foreground">Track hive health and field conditions simultaneously.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm">
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Analyze</h3>
                  <p className="text-muted-foreground">Correlate colony strength with yield outcomes using AI models.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sprout className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Optimize</h3>
                  <p className="text-muted-foreground">Make data-driven decisions to boost crop yield and bee welfare.</p>
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

// Helper Check icon
function Check(props) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default PollinationSolutions;