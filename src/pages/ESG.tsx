import { useState, useEffect } from "react";
import { Database, Check, Heart, Sprout, Globe, ArrowRight, Quote, Users, TreePine, Bug, Package, MapPin, Loader2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { getESGMetrics, getESGPillars, ESGMetric } from "@/services/servicesService";

interface Pillar {
  title?: string;
  name?: string;
  icon?: LucideIcon | string;
  color?: string;
  impact?: string;
  description?: string;
  initiatives?: string[];
  metrics?: string[];
}

const ESG = () => {
  const [metrics, setMetrics] = useState<ESGMetric[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedMetrics, fetchedPillars] = await Promise.all([
          getESGMetrics(),
          getESGPillars()
        ]);
        setMetrics(fetchedMetrics);
        setPillars(fetchedPillars);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getMetricValue = (key: string, defaultValue: string) => {
    const metric = metrics.find(m => m.metric_key === key);
    if (!metric) return defaultValue;
    return `${metric.metric_value}${metric.metric_unit === 'farmers' ? '+' : metric.metric_unit}`;
  };

  const impactStats = [
    { value: getMetricValue('farmers_trained', "20+"), label: "Partner Beekeepers", icon: Users, description: "Local farmers trained & earning" },
    { value: "25", label: "Acres Pollinated", icon: MapPin, description: "Precision pollination coverage" },
    { value: getMetricValue('trees_planted', "2,500+"), label: "Trees Planted", icon: TreePine, description: "Ecosystem restoration" },
    { value: "184", label: "Active Colonies", icon: Bug, description: "Managed bee colonies" },
    { value: "883kg", label: "Honey Produced", icon: Package, description: "Pure traceable honey" },
    { value: "2M+", label: "Bees Protected", icon: Heart, description: "Pollinators saved & thriving" },
  ];

  const fallbackPillars: Pillar[] = [
    {
      title: "Environmental",
      icon: Sprout,
      color: "from-nature-green to-nature-green-light",
      initiatives: [
        "2,500+ indigenous trees planted across Kibwezi, Makueni County",
        "Only 50% honey harvest policy. Bees keep what they need",
        "Zero chemical pesticides in our apiaries"
      ],
      impact: "3,000+ tons CO₂ avoided annually"
    },
    {
      title: "Social",
      icon: Users,
      color: "from-honey-light to-honey-dark",
      initiatives: [
        "20+ local beekeepers trained and earning sustainable income",
        "Women-led beekeeping cooperatives supported"
      ],
      impact: "KES 2.4M+ in income generated since 2020"
    }
  ];

  const displayPillars = pillars.length > 0 ? pillars : fallbackPillars;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-8 px-5 py-2 text-sm font-black tracking-tighter border-primary/30 bg-primary/5 text-primary backdrop-blur-sm">
              <Globe className="w-5 h-5 mr-3" />
              CORPORATE SUSTAINABILITY
            </Badge>
            <h1 className="text-display-xl md:text-display-2xl font-black mb-8 leading-none tracking-tightest">
              Our <span className="text-primary italic">ESG</span> Promise
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
              Environmental, Social, and Governance practices are the heartbeat of BeeYield. From the acacia forests of Kibwezi, we're proving that technology and nature thrive together.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="h-14 px-8 font-bold shadow-glow">
                Download 2024 Report
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers Grid */}
      <section className="py-32 bg-muted/20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-4">
            <Badge variant="outline" className="text-primary uppercase tracking-widest text-xs font-black">Performance Metrics</Badge>
            <h2 className="text-5xl md:text-6xl font-black tracking-tightest leading-none text-foreground">Our Impact in Numbers</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {impactStats.map((stat, index) => (
              <Card key={index} className="text-center border-none shadow-soft glass bg-white/50 hover:shadow-glow transition-all duration-500 hover:-translate-y-2 group">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-primary/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl font-black text-primary mb-2 tracking-tighter">{stat.value}</div>
                  <div className="text-xs font-black uppercase tracking-widest mb-3 text-foreground">{stat.label}</div>
                  <div className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">{stat.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ESG Pillars */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-24 space-y-6">
              <Badge variant="outline" className="text-secondary uppercase tracking-widest text-xs font-black">Strategic Pillars</Badge>
              <h2 className="text-5xl md:text-7xl font-black tracking-tightest leading-none text-foreground">Built on Foundation</h2>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
                Our pillars guide every operational decision, ensuring that BeeYield remains a force for good in the global ecosystem.
              </p>
            </div>

            <div className="space-y-16">
              {displayPillars.map((pillar: Pillar, index) => (
                <Card key={index} className="overflow-hidden border-none shadow-premium bg-white group hover:shadow-glow transition-all duration-700 rounded-[3rem]">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-5">
                      <div className={`p-12 md:col-span-2 bg-gradient-to-br ${pillar.color || 'from-primary to-primary-foreground'} text-white relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                        <div className="relative z-10">
                          <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                              {pillar.icon ? (typeof pillar.icon === 'string' ? <Sprout className="w-8 h-8" /> : <pillar.icon className="w-8 h-8" />) : <Sprout className="w-8 h-8" />}
                            </div>
                            <h3 className="text-4xl font-black tracking-tighter">{pillar.title || pillar.name}</h3>
                          </div>
                          <p className="text-lg text-white/90 font-black leading-relaxed italic">{pillar.impact || pillar.description}</p>
                        </div>
                      </div>
                      <div className="p-12 md:col-span-3 bg-card/10">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-8 text-primary">Strategic Key Initiatives</h4>
                        <ul className="space-y-6">
                          {(pillar.initiatives || pillar.metrics || []).map((initiative: string, i: number) => (
                            <li key={i} className="flex items-start gap-4 group/item">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-primary/20 transition-colors">
                                <Check className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-muted-foreground font-bold leading-relaxed">{initiative}</span>
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

      {/* CEO Quote */}
      <section className="py-32 bg-secondary text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Quote className="w-16 h-16 text-primary/40 mx-auto mb-10" />
          <blockquote className="text-2xl md:text-4xl font-black italic max-w-4xl mx-auto leading-tight mb-12">
            "ESG isn't a report we file once a year. It's how we wake up every morning. Every bee we protect and every farmer we train is a step toward the future we want to see."
          </blockquote>
          <div className="flex items-center justify-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
              <span className="text-3xl font-black">TN</span>
            </div>
            <div className="text-left">
              <div className="text-2xl font-black">Timothy Nduva</div>
              <div className="text-honey-light font-bold uppercase tracking-widest text-sm">CEO & Founder</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Ready to Partner for Impact?</h2>
          <Button size="lg" className="h-16 px-12 text-xl font-black shadow-2xl" asChild>
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ESG;