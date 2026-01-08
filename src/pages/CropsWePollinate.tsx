import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Cpu, Sprout, ArrowRight, Check,
  Globe, Flower2, Wheat, MapPin, Mail, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { getCrops, Crop } from "@/services/servicesService";
import { getCompanyStats, CompanyStat } from "@/services/companyService";

const CropsWePollinate = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [stats, setStats] = useState<CompanyStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        const [fetchedCrops, fetchedStats] = await Promise.all([
          getCrops(),
          getCompanyStats()
        ]);
        setCrops(fetchedCrops);
        setStats(fetchedStats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Fallback crops for display if backend data is empty or missing
  const fallbackCrops = [
    {
      id: "fallback-maize",
      name: "Maize",
      image_url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600",
      description: "Maize is a wind-pollinated crop, but bee activity can enhance pollination efficiency and improve yield quality."
    },
    {
      id: "fallback-sisal",
      name: "Sisal",
      image_url: "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&q=80&w=600",
      description: "Sisal plants produce abundant nectar that attracts bees. Our monitoring solutions help track bee activity around sisal plantations."
    },
    {
      id: "fallback-sunflower",
      name: "Sunflower",
      image_url: "https://images.unsplash.com/photo-1553279761-de8a66699195?w=500",
      description: "Sunflowers are highly dependent on insect pollination, especially by bees, for optimal seed production and oil yield."
    }
  ];

  // Accurate world map TopoJSON from world-atlas
  const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  const getStatValue = (key: string, defaultValue: string) => {
    const s = stats.find(stat => stat.stat_key === key);
    return s ? s.stat_value : defaultValue;
  };

  const cropsToDisplay = crops.length > 0 ? crops : fallbackCrops;

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
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="outline" className="border-primary/30 text-primary px-4 py-2">
                Precision Agriculture
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Get Data-Driven <br />
                <span className="text-primary">Crop Pollination</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Our end-to-end solution gives unprecedented control and visibility into pollination, ensuring 40% crop yields and sustainable practices.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                  <Link to="/contact">Get a Free Consultation</Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              {/* Decorative grid of crop images */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
              <div className="grid grid-cols-2 gap-4 relative">
                <img src="https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&q=80&w=400" alt="Sisal plantation" className="rounded-2xl shadow-xl h-48 w-full object-cover" />
                <img src="https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=400" alt="Orange orchard" className="rounded-2xl shadow-xl h-48 w-full object-cover mt-8" />
                <img src="https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=400" alt="Fresh oranges" className="rounded-2xl shadow-xl h-48 w-full object-cover" />
                <img src="https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&q=80&w=400" alt="Sisal field" className="rounded-2xl shadow-xl h-48 w-full object-cover mt-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Work With the Pollination Experts</h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-8" />
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-12">
            BeeYield is comprised of leading experts in the field of pollination. Bee biologists and researchers, data-science experts, electrical engineers, leading agronomists, and veteran beekeepers make up our team.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <Card className="bg-card border-border/50 shadow-soft">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-black text-primary mb-2">{getStatValue('acres_pollinated', '25+')}</p>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Acres Managed</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50 shadow-soft">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-black text-primary mb-2">1</p>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Countries</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50 shadow-soft">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-black text-primary mb-2">2</p>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Counties</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50 shadow-soft">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-black text-primary mb-2">1</p>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Continents</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50 shadow-soft">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-black text-primary mb-2">{cropsToDisplay.length}</p>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Crop Varieties</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* World Map Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="border-primary/30 text-primary mb-4">
              <Globe className="w-4 h-4 mr-2" />
              Global Presence
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Where We Operate</h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative bg-card rounded-3xl border border-border/50 p-8 overflow-hidden shadow-premium">
              <div className="w-full h-[400px]">
                <ComposableMap projectionConfig={{ scale: 147 }}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={geo.properties.name === "Kenya" ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                          stroke="hsl(var(--border))"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none", fill: geo.properties.name === "Kenya" ? "hsl(var(--primary))" : "hsl(var(--accent))" },
                            pressed: { outline: "none" }
                          }}
                        />
                      ))
                    }
                  </Geographies>
                  <Marker coordinates={[36.8219, -1.2921]}>
                    <circle r={8} fill="hsl(var(--primary))" stroke="#fff" strokeWidth={2} />
                    <circle r={12} fill="hsl(var(--primary))" fillOpacity={0.3}>
                      <animate attributeName="r" from="8" to="20" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <text textAnchor="middle" y={-20} className="fill-foreground text-sm font-semibold">
                      Kenya
                    </text>
                  </Marker>
                </ComposableMap>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crops Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Seeds of Success</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Leading the way in diverse crop pollination across the region.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {cropsToDisplay.map((crop, index) => (
              <Card key={crop.id || index} className="overflow-hidden group hover:shadow-glow transition-all duration-500 border-none shadow-soft flex flex-col h-full bg-white">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={crop.image_url || "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=600"}
                    alt={crop.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <h3 className="absolute bottom-6 left-6 text-2xl font-black text-white">{crop.name}</h3>
                </div>
                <CardContent className="p-8 flex-grow">
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {crop.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-primary text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 mb-8 border border-white/20 backdrop-blur-sm">
            <Flower2 className="w-12 h-12" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Don't See Your Crop?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-12 font-medium">
            We work with growers of all types to improve pollination outcomes through optimized placement and precise timing.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 h-16 px-12 text-xl font-black shadow-2xl" asChild>
            <a href="mailto:info@beeyield.com">
              <Mail className="mr-4 h-6 w-6" /> Talk to an Expert
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CropsWePollinate;
