import { useState } from "react";
import { Globe, Activity, BookOpen, Heart, AlertTriangle, MapPin, Check, Mail, Leaf, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GlobalHiveNetwork = () => {
  const [supportType, setSupportType] = useState("monthly");

  return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 bg-gradient-to-br from-secondary via-background to-primary/10 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              A Planetary Initiative
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
              The Global Two Million Hives Network
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8 max-w-3xl mx-auto">
              BeeYield is creating the world's largest science-driven initiative to address the global bee crisis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-xl">
                Support the Cause Today
              </Button>
              <Button size="lg" variant="outline">
                Read the Whitepaper
              </Button>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5"></div>
        </section>

        {/* The Crisis Section */}
        <section className="py-24 bg-foreground text-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="order-2 lg:order-1">
                <Card className="bg-background/10 border-background/20 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Global Emergency</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-background">The Silent Decline</h3>
                    <p className="text-background/80 leading-relaxed mb-6">
                      A major indication of the health of a hive is the density of bees on its frames. But with growing bee mortality rates, it is becoming increasingly frequent for beekeepers around the world to open their hives – and discover weak hives with few, if any, bees.
                    </p>
                    <div className="bg-red-500/20 p-4 rounded-lg">
                      <p className="text-4xl font-bold text-red-400">60%</p>
                      <p className="text-sm text-background/70">Mortality rate in U.S. hives this past season</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-4xl font-bold mb-6">The Bee Crisis: <br/>A Global Emergency</h2>
                <p className="text-background/80 leading-relaxed mb-6">
                  Bees are at the heart of global food production, biodiversity, and ecosystem stability, yet they face an unprecedented crisis. Alarming declines are reported worldwide.
                </p>
                <p className="text-background/80 leading-relaxed mb-8">
                  This threat to pollinators is a threat to food security and agricultural sustainability. The time to act is now.
                </p>
                <Button variant="secondary" className="gap-2">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* The Initiative & Goals */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-foreground">A Science-Driven Response</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                To address this crisis, BeeYield is launching The Global Two Million Hives Network. This initiative is the world's first large-scale, science-driven effort of its kind. We prioritize research, data, and technology to drive meaningful impact.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-none shadow-xl text-center">
                <CardContent className="p-8">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">GOAL 1</p>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">2M Smart Hives</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Creating a global network of smart hives, focusing on high-risk countries and priority agricultural regions by partnering with local stakeholders.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl text-center">
                <CardContent className="p-8">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">GOAL 2</p>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">100M Signals</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Collecting 100 million daily bee signals to build the largest and most comprehensive global bee health dataset in history.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl text-center">
                <CardContent className="p-8">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">GOAL 3</p>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">Education</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Working with governments, NGOs, farmers, and educators to implement sustainable pollination practices worldwide.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Global Case Studies */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-4 text-foreground">Pioneering Work Across the Globe</h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-16" />

            <div className="space-y-16 max-w-6xl mx-auto">
              {/* Peru */}
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
                    <MapPin className="h-3 w-3 mr-1" /> PERU
                  </Badge>
                  <h3 className="text-3xl font-bold mb-4 text-foreground">Empowering Latin America</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    BeeYield is breaking new ground through a strategic collaboration with CONAPI, the National Confederation of Beekeepers. This partnership aims to empower Peruvian beekeepers with data-driven pollination tools, specifically for key exports like avocado and blueberries.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> First partnership in Latin America</li>
                    <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> Focus on education and market readiness</li>
                  </ul>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=800" 
                    alt="Peru landscape" 
                    className="w-full h-[300px] object-cover"
                  />
                </div>
              </div>

              {/* California */}
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=800" 
                    alt="Almond orchard" 
                    className="w-full h-[300px] object-cover"
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
                    <MapPin className="h-3 w-3 mr-1" /> CALIFORNIA, USA
                  </Badge>
                  <h3 className="text-3xl font-bold mb-4 text-foreground">The Almond Bloom Experiment</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    During the 2025 almond bloom, BeeYield launched an ambitious dual-site study on the effects of ground cover and topography. Deploying 144 sensors capturing data every ten minutes, we are pioneering one of the most granular studies of pollination environments to date.
                  </p>
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                    "Preliminary results are already challenging assumptions, such as the belief that bare soil retains and radiates heat overnight."
                  </blockquote>
                </div>
              </div>

              {/* Israel */}
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200">
                    <MapPin className="h-3 w-3 mr-1" /> ISRAEL
                  </Badge>
                  <h3 className="text-3xl font-bold mb-4 text-foreground">Solving the Avocado Puzzle</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Partnering with the Israeli Honey Board, BeeYield is spearheading a ground-breaking study on optimal hive density for the Hass avocado cultivar. Little is known about the density that maximizes fruit set without harming colony health—until now.
                  </p>
                  <Button variant="outline" className="gap-2">
                    Read the Study Findings <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=800" 
                    alt="Avocado farm" 
                    className="w-full h-[300px] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support / Donation Section */}
        <section className="py-24 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <Heart className="h-12 w-12 mx-auto mb-4 text-primary-foreground/80" />
              <h2 className="text-4xl font-bold mb-4 text-primary-foreground">Show Your Support</h2>
              <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                Join our global community of growers, researchers, and advocates working to secure the future of pollinators and global food supply.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Donation Card */}
              <Card className="border-none shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    <div className="bg-muted rounded-lg p-1 inline-flex">
                      <button 
                        onClick={() => setSupportType("onetime")}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${supportType === "onetime" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        One-time
                      </button>
                      <button 
                        onClick={() => setSupportType("monthly")}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${supportType === "monthly" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <span className="text-5xl font-bold text-foreground">
                      {supportType === "monthly" ? "$10" : "$50"}
                    </span>
                    {supportType === "monthly" && <span className="text-muted-foreground">/mo</span>}
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Fund sensor deployment</li>
                    <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Support beekeeper education</li>
                    <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Receive impact reports</li>
                  </ul>

                  <Button className="w-full">Support</Button>
                </CardContent>
              </Card>

              {/* Higher Tier Card */}
              <Card className="border-2 border-primary shadow-2xl relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">MOST POPULAR</Badge>
                </div>
                <CardContent className="p-8 pt-10">
                  <h3 className="text-xl font-bold text-center mb-6 text-foreground">Patron of the Hive</h3>
                  
                  <div className="text-center mb-6">
                    <span className="text-5xl font-bold text-foreground">
                      {supportType === "monthly" ? "$100" : "$500"}
                    </span>
                    {supportType === "monthly" && <span className="text-muted-foreground">/mo</span>}
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Adopt a smart hive</li>
                    <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Access to webinars & events</li>
                    <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Exclusive network insights</li>
                  </ul>

                  <Button className="w-full">Support</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Signup Form */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-foreground">Sign Up To Our Network</h2>
              <p className="text-muted-foreground">
                Interested in updates, webinars, events, and research related to bee health and The Two Million Hives Initiative? We will be happy to keep in touch.
              </p>
            </div>
            
            <Card className="border-none shadow-xl">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" placeholder="John" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" placeholder="Doe" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="info@beeyield.com" required />
                  </div>
                  <Button type="submit" className="w-full">
                    <Mail className="h-4 w-4 mr-2" /> Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
  );
};

export default GlobalHiveNetwork;