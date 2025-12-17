import React, { useState } from "react";
import { 
  Menu, X, Search, ShoppingCart, Hexagon,
  Mail, Phone, MapPin, Check, ChevronDown, 
  Sprout, Bug, MessageSquare
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
  <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className} overflow-hidden bg-white`}>
    {children}
  </div>
);

const Input = ({ label, required = false, ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  </div>
);

const Select = ({ label, required = false, options, ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium leading-none">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      >
        <option value="" disabled selected>Select an option</option>
        {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
    </div>
  </div>
);

const Checkbox = ({ id, label }) => (
  <div className="flex items-start space-x-2">
    <input type="checkbox" id={id} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
    <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground">
      {label}
    </label>
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
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Team</a>
          <a href="#" className="text-sm font-bold text-primary">Contact</a>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <Button>Get Started</Button>
        </div>
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {isOpen && (
        <div className="border-b bg-background px-4 py-4 md:hidden animate-in slide-in-from-top-5">
          <div className="flex flex-col gap-4">
            <a href="#" className="text-sm font-medium hover:text-primary">Our Story</a>
            <a href="#" className="text-sm font-medium hover:text-primary">Technology</a>
            <a href="#" className="text-sm font-medium hover:text-primary">Team</a>
            <Button className="w-full">Contact</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT (Contact Page)
// -----------------------------------------------------------------------------

const ContactPage = () => {
  const [activeTab, setActiveTab] = useState("grower");

  const tabs = [
    { id: "grower", label: "Grower Inquiries", icon: Sprout },
    { id: "beekeeper", label: "Beekeeper Inquiries", icon: Bug },
    { id: "general", label: "General Inquiries", icon: MessageSquare },
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
          --input: #e7e5e4;
          --border: #e7e5e4;
        }
        
        .bg-background { background-color: var(--background); }
        .bg-primary { background-color: var(--primary); }
        .text-primary { color: var(--primary); }
        .text-primary-foreground { color: var(--primary-foreground); }
        .text-muted-foreground { color: var(--muted-foreground); }
        .text-foreground { color: var(--foreground); }
        .border-input { border-color: var(--input); }
        
        .shadow-soft { box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); }
        .shadow-elegant { box-shadow: 0 20px 40px -10px rgba(245, 158, 11, 0.15); }
      `}</style>

      <div className="min-h-screen bg-background font-sans text-foreground">
        <Navigation />
        
        <div className="pt-20">
          {/* Header */}
          <section className="bg-secondary/30 py-20 border-b">
            <div className="container mx-auto px-4 text-center max-w-4xl">
              <Badge className="mb-6 bg-white border border-primary/20 text-primary hover:bg-white">
                Get in Touch
              </Badge>
              <h1 className="text-5xl font-bold mb-6 tracking-tight">
                Contact Us Today
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Fill in the form, and we will get back to you at our earliest convenience.
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4 max-w-5xl">
              
              {/* Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                        isActive 
                          ? "border-primary bg-primary/5 text-primary shadow-sm" 
                          : "border-transparent bg-white shadow-soft text-muted-foreground hover:bg-secondary/20"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-bold">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form Container */}
              <Card className="border-none shadow-elegant">
                <div className="p-8 md:p-12">
                  <form className="space-y-8">
                    {/* Common Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input label="First Name" required placeholder="Jane" />
                      <Input label="Last Name" required placeholder="Doe" />
                      
                      <Input label="City" required placeholder="New York" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="State" required placeholder="NY" />
                        <Input label="Country" required placeholder="USA" />
                      </div>
                      
                      <Input label="Email" required type="email" placeholder="jane@example.com" />
                      <Input label="Phone Number" required type="tel" placeholder="+1 (555) 000-0000" />
                    </div>

                    <div className="h-px bg-border/50" />

                    {/* Specific Fields based on Tab */}
                    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      
                      {activeTab === "grower" && (
                        <>
                          <Input label="Farm Name" required placeholder="Green Acres Farm" />
                          <Select 
                            label="Crop" 
                            required 
                            options={["Almonds", "Apples", "Avocados", "Blueberries", "Cherries", "Other"]} 
                          />
                          <Input label="Acres" required type="number" placeholder="500" />
                          <Select 
                            label="Topic" 
                            required 
                            options={["Pollination Services", "Pricing", "Partnership", "Support"]} 
                          />
                        </>
                      )}

                      {activeTab === "beekeeper" && (
                        <>
                          <Input label="Apiary Name" required placeholder="Busy Bee Apiaries" />
                          <Input label="Number of Hives" required type="number" placeholder="1000" />
                          <Select 
                            label="Years of Experience" 
                            required 
                            options={["1-5 years", "5-10 years", "10+ years"]} 
                          />
                          <Select 
                            label="Topic" 
                            required 
                            options={["Technology Integration", "Hive Monitoring", "Partnership", "Support"]} 
                          />
                        </>
                      )}

                      {activeTab === "general" && (
                        <>
                          <div className="md:col-span-2">
                            <Input label="Company / Organization" placeholder="Optional" />
                          </div>
                          <div className="md:col-span-2">
                            <Select 
                              label="Topic" 
                              required 
                              options={["Press Inquiry", "Careers", "Sustainability", "General Question"]} 
                            />
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Message Area for everyone */}
                    {activeTab === 'general' && (
                       <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Message</label>
                        <textarea className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="How can we help you?"></textarea>
                      </div>
                    )}

                    <div className="space-y-6 pt-4">
                      <Checkbox 
                        id="terms" 
                        label={
                          <span>
                            I agree with the <a href="#" className="text-primary hover:underline">Terms and Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                          </span>
                        } 
                      />
                      
                      <Button size="lg" className="w-full md:w-auto min-w-[200px]">
                        Submit Inquiry
                      </Button>
                    </div>

                  </form>
                </div>
              </Card>

              {/* Direct Contact Info */}
              <div className="grid md:grid-cols-3 gap-8 mt-16 text-center">
                <div className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Email Us</h3>
                  <p className="text-muted-foreground">hello@beeyield.com</p>
                </div>
                <div className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Call Us</h3>
                  <p className="text-muted-foreground">+1 (800) 123-4567</p>
                </div>
                <div className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Visit Us</h3>
                  <p className="text-muted-foreground">San Francisco, CA</p>
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

export default ContactPage;