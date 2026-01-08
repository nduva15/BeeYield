import { Database, TrendingUp, Check, Heart, Sprout, Globe, Wind, Sun, ArrowRight, Quote, Users, Droplets, TreePine, Bug, Package, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const ESG = () => {
  const impactStats = [
    { value: "20+", label: "Partner Beekeepers", icon: Users, description: "Local farmers trained & earning" },
    { value: "25", label: "Acres Pollinated", icon: MapPin, description: "Precision pollination coverage" },
    { value: "1,500+", label: "Trees Planted", icon: TreePine, description: "Ecosystem restoration" },
    { value: "184", label: "Active Colonies", icon: Bug, description: "Managed bee colonies" },
    { value: "883kg", label: "Honey Produced", icon: Package, description: "Pure traceable honey" },
    { value: "2M+", label: "Bees Protected", icon: Heart, description: "Pollinators saved & thriving" },
  ];

  const esgPillars = [
    {
      title: "Environmental",
      icon: Sprout,
      color: "from-emerald-500 to-green-600",
      initiatives: [
        "1,500+ indigenous trees planted across Kibwezi, Makueni County",
        "Only 50% honey harvest policy—bees keep what they need",
        "Zero chemical pesticides in our apiaries",
        "Water source protection for bee colonies",
        "Carbon footprint reduction through local operations"
      ],
      impact: "3,000+ tons CO₂ avoided annually through our tree planting and sustainable practices"
    },
    {
      title: "Social",
      icon: Users,
      color: "from-amber-500 to-orange-600",
      initiatives: [
        "20+ local beekeepers trained and earning sustainable income",
        "Women-led beekeeping cooperatives supported",
        "Youth apprenticeship programs in apiculture",
        "Food security through pollination of local crops",
        "Community awareness on pollinator importance"
      ],
      impact: "KES 2.4M+ in income generated for local farming communities since 2020"
    },
    {
      title: "Governance",
      icon: Database,
      color: "from-blue-500 to-indigo-600",
      initiatives: [
        "Full traceability from hive to jar",
        "Transparent pricing for partner beekeepers",
        "Fair trade practices with all suppliers",
        "Regular impact reporting and audits",
        "Stakeholder engagement and feedback systems"
      ],
      impact: "100% of honey batches traceable to specific hive, beekeeper, and harvest date"
    }
  ];

  return (
      <div className="min-h-screen bg-background">

        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="container relative z-10 mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5">
                <Globe className="w-4 h-4 mr-2" />
                Corporate Responsibility
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Our <span className="text-primary">ESG</span> Commitment
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Environmental, Social, and Governance practices aren't just corporate buzzwords for us—they're the foundation of everything we do at BeeYield. From the semi-arid lands of Kibwezi, Kenya, we're proving that sustainable beekeeping can transform communities and ecosystems.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2">
                  Download 2024 Report
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/sdgs">View SDG Alignment</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Numbers Grid */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact in Numbers</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Real, measurable results from our operations in Makueni County and beyond
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {impactStats.map((stat, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6 pb-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm font-medium mb-1">{stat.label}</div>
                    <div className="text-xs text-muted-foreground">{stat.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What ESG Means to Us */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <Badge variant="secondary" className="mb-4">Understanding ESG</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  What ESG Means for BeeYield
                </h2>
                <p className="text-lg text-muted-foreground">
                  ESG stands for Environmental, Social, and Governance—three pillars that guide how we operate, make decisions, and measure our success. For a Kenyan agri-tech company working with bees and farmers, these aren't abstract concepts—they're daily realities.
                </p>
              </div>

              {/* ESG Pillars */}
              <div className="space-y-8">
                {esgPillars.map((pillar, index) => (
                  <Card key={index} className="overflow-hidden border-border/50">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-3 gap-0">
                        {/* Header */}
                        <div className={`p-6 md:p-8 bg-gradient-to-br ${pillar.color} text-white`}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                              <pillar.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold">{pillar.title}</h3>
                          </div>
                          <p className="text-white/90 text-sm font-medium">
                            {pillar.impact}
                          </p>
                        </div>
                        
                        {/* Initiatives */}
                        <div className="p-6 md:p-8 md:col-span-2 bg-card">
                          <h4 className="font-semibold mb-4 text-foreground">Key Initiatives</h4>
                          <ul className="space-y-3">
                            {pillar.initiatives.map((initiative, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{initiative}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Food Security & Hunger Section */}
        <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge variant="outline" className="mb-4 border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    SDG 2: Zero Hunger
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Fighting Hunger Through Pollination
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    In Makueni County, where droughts and food insecurity are recurring challenges, our pollination services directly improve crop yields for smallholder farmers. Every acre we pollinate means more food on local tables.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-amber-600">75%</span>
                      </div>
                      <div>
                        <div className="font-semibold">Food Crops Need Bees</div>
                        <div className="text-sm text-muted-foreground">Of global food production relies on pollinators</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-amber-600">883</span>
                      </div>
                      <div>
                        <div className="font-semibold">Kilograms of Honey</div>
                        <div className="text-sm text-muted-foreground">Nutritious honey distributed locally & sold</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-amber-600">25</span>
                      </div>
                      <div>
                        <div className="font-semibold">Acres Pollinated</div>
                        <div className="text-sm text-muted-foreground">Mangoes, avocados, macadamia & more</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="aspect-square rounded-2xl overflow-hidden">
                    <img 
                      src="/placeholder.svg" 
                      alt="Farmers benefiting from pollination services" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-xl border border-border/50 max-w-xs">
                    <Quote className="w-8 h-8 text-primary/30 mb-2" />
                    <p className="text-sm italic text-muted-foreground mb-2">
                      "Since BeeYield brought their hives to my farm, my mango harvest has doubled. My family eats better now."
                    </p>
                    <p className="text-xs font-medium">— Mary Mutua, Farmer, Kibwezi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Beekeepers Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">Social Impact</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Empowering 20+ Local Beekeepers
              </h2>
              <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                Our partner beekeeper program provides training, equipment, and a guaranteed market for honey. Each beekeeper manages 5-15 hives, creating sustainable income for their families.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center border-border/50">
                  <CardContent className="pt-8 pb-6">
                    <div className="text-4xl font-bold text-primary mb-2">KES 15,000</div>
                    <div className="text-sm text-muted-foreground mb-4">Average monthly income per beekeeper</div>
                    <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full inline-block">
                      +200% from baseline
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="text-center border-border/50">
                  <CardContent className="pt-8 pb-6">
                    <div className="text-4xl font-bold text-primary mb-2">40%</div>
                    <div className="text-sm text-muted-foreground mb-4">Women beekeepers in our network</div>
                    <div className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full inline-block">
                      Gender equality focus
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="text-center border-border/50">
                  <CardContent className="pt-8 pb-6">
                    <div className="text-4xl font-bold text-primary mb-2">100%</div>
                    <div className="text-sm text-muted-foreground mb-4">Fair prices paid to all partners</div>
                    <div className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full inline-block">
                      Above market rates
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CEO Quote */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Quote className="w-12 h-12 text-primary/30 mx-auto mb-6" />
              <blockquote className="text-xl md:text-2xl italic text-foreground mb-8 leading-relaxed">
                "ESG isn't a report we file once a year—it's how we wake up every morning. Every bee we protect, every farmer we train, every tree we plant is a step toward the Kenya and the Africa we want to see."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">TN</span>
                </div>
                <div className="text-left">
                  <div className="font-bold">Timothy Nduva</div>
                  <div className="text-sm text-muted-foreground">CEO & Founder, BeeYield</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Partner With Us for Impact
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Whether you're a farmer seeking pollination services, an investor aligned with ESG principles, or a beekeeper looking to join our network—we'd love to hear from you.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/pollination-services">Explore Pollination Services</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
};

export default ESG;