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
  icon?: LucideIcon;
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
      color: "from-emerald-500 to-green-600",
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
      color: "from-amber-500 to-orange-600",
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
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5">
              <Globe className="w-4 h-4 mr-2" />
              Corporate Responsibility
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Our <span className="text-primary">ESG</span> Commitment
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 font-medium">
              Environmental, Social, and Governance practices are the foundation of BeeYield. From Kibwezi, Kenya, we're proving that sustainable beekeeping can transform ecosystems.
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
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Our Impact in Numbers</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {impactStats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-glow transition-all border-none shadow-soft bg-white">
                <CardContent className="pt-8 pb-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-3xl font-black text-primary mb-1">{stat.value}</div>
                  <div className="text-sm font-bold uppercase tracking-wider mb-2">{stat.label}</div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ESG Pillars */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Built on Strong Foundations</h2>
              <p className="text-xl text-muted-foreground font-medium max-w-3xl mx-auto">
                Our pillars guide our daily operations, ensuring every action contributes to long-term sustainability.
              </p>
            </div>

            <div className="space-y-12">
              {displayPillars.map((pillar: Pillar, index) => (
                <Card key={index} className="overflow-hidden border-none shadow-premium bg-white group hover:shadow-glow transition-all duration-500">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-3">
                      <div className={`p-10 bg-gradient-to-br ${pillar.color || 'from-primary to-primary-foreground'} text-white`}>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                            {pillar.icon ? (typeof pillar.icon === 'string' ? <Sprout className="w-7 h-7" /> : <pillar.icon className="w-7 h-7" />) : <Sprout className="w-7 h-7" />}
                          </div>
                          <h3 className="text-3xl font-black">{pillar.title || pillar.name}</h3>
                        </div>
                        <p className="text-white/90 font-bold leading-relaxed">{pillar.impact || pillar.description}</p>
                      </div>
                      <div className="p-10 md:col-span-2">
                        <h4 className="text-xl font-black mb-6 text-foreground">Key Initiatives</h4>
                        <ul className="space-y-4">
                          {(pillar.initiatives || pillar.metrics || []).map((initiative: string, i: number) => (
                            <li key={i} className="flex items-start gap-4">
                              <Check className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground font-medium">{initiative}</span>
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
      <section className="py-32 bg-yellow-900 text-white relative overflow-hidden">
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
              <div className="text-yellow-400 font-bold uppercase tracking-widest text-sm">CEO & Founder</div>
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