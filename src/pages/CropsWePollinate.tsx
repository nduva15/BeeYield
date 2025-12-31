import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Cpu, Sprout, ArrowRight, Check,
  Globe, Flower2, Wheat, MapPin, Mail
} from "lucide-react";
import { Link } from "react-router-dom";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const CropsWePollinate = () => {
  useEffect(() => {
    // Inject GTM script into head
    const script = document.createElement('script');
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-KF284247');`;
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const crops = [
    {
      name: "Maize",
      image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600",
      desc: "Maize is a wind-pollinated crop, but bee activity can enhance pollination efficiency and improve yield quality. BeeYield monitors pollinator activity to ensure optimal conditions during the critical tasseling period."
    },
    {
      name: "Sisal",
      image: "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&q=80&w=600",
      desc: "Sisal plants produce abundant nectar that attracts bees. Our monitoring solutions help track bee activity around sisal plantations, contributing to both fiber production and honey yields."
    },
    {
      name: "Mangoes",
      image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600",
      desc: "Mango trees depend heavily on insect pollination for fruit set. BeeYield's precision monitoring ensures that bee colonies are active during the brief flowering window, maximizing fruit production."
    },
    {
      name: "Beans",
      image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600",
      desc: "Bean crops benefit significantly from bee pollination, with studies showing up to 30% yield increases. Our In-Field sensors track pollinator visits to ensure optimal bean pod development."
    },
    {
      name: "Sunflower",
      image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=600",
      desc: "Sunflowers are highly attractive to bees and require cross-pollination for maximum seed production. BeeYield monitors hive activity to ensure thorough pollination across large sunflower fields."
    },
    {
      name: "Oranges",
      image: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=600",
      desc: "Citrus orchards rely on bee pollination for fruit quality and quantity. Our technology provides real-time insights into colony health and foraging patterns throughout the orange bloom season."
    },
    {
      name: "Vegetables",
      image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=600",
      desc: "Many vegetable crops require bee pollination for successful fruit and seed production. BeeYield helps growers optimize pollinator placement and timing for diverse vegetable operations."
    },
    {
      name: "Tomatoes",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600",
      desc: "Tomato flowers benefit from buzz pollination. Our monitoring systems track bee activity to ensure adequate pollination, leading to better fruit size, shape, and uniformity."
    },
    {
      name: "Apples",
      image: "https://images.unsplash.com/photo-1560806887-1295c3f2efb2?auto=format&fit=crop&q=80&w=600",
      desc: "Apple orchards rely heavily on bee pollination for fruit set and quality. BeeYield's monitoring ensures optimal hive placement and activity during the critical bloom period for maximum yield."
    }
  ];

  const locations = [
    { continent: "Africa", countries: ["Kenya"], color: "bg-primary" }
  ];

  // Accurate world map TopoJSON from world-atlas
  const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  return (
    <div className="min-h-screen bg-background">
      {/* Google Tag Manager (noscript) */}
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KF284247" height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe></noscript>

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
                  Get a Free Consultation
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              {/* Decorative grid of crop images - Using Sisal and Oranges */}
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
            BeeYield is comprised of leading experts in the field of pollination. Bee biologists and researchers, data-science experts, electrical engineers, leading agronomists, and veteran beekeepers make up our team, and all are committed to creating improved pollination outcomes for our customers.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <Card className="bg-card border-border/50">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-bold text-primary mb-2">25+</p>
                <p className="text-sm text-muted-foreground">Acres Managed</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-bold text-primary mb-2">1</p>
                <p className="text-sm text-muted-foreground">Countries</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-bold text-primary mb-2">2</p>
                <p className="text-sm text-muted-foreground">Counties</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-bold text-primary mb-2">1</p>
                <p className="text-sm text-muted-foreground">Continents</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-bold text-primary mb-2">9+</p>
                <p className="text-sm text-muted-foreground">Crop Varieties</p>
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
            <p className="text-muted-foreground max-w-2xl mx-auto">
              BeeYield is expanding its precision pollination services across Africa and the world, starting with our home base in Kenya.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative bg-card rounded-3xl border border-border/50 p-8 overflow-hidden">
              {/* Accurate World Map */}
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

                  {/* Kenya marker (Nairobi) */}
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

              {/* Legend */}
              <div className="absolute bottom-8 left-8 bg-background/80 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm font-medium">Active Regions</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    Kenya (Headquarters)
                  </div>
                </div>
              </div>

              {/* Stats overlay */}
              <div className="absolute top-8 right-8 bg-primary text-primary-foreground rounded-xl p-4">
                <p className="text-sm opacity-80">Operating in</p>
                <p className="text-2xl font-bold">1 Country</p>
                <p className="text-sm opacity-80">Africa & Beyond</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crops Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Crop Navigation Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {crops.map((c, i) => (
              <Badge key={i} variant="outline" className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                {c.name}
              </Badge>
            ))}
          </div>

          {/* Crops Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {crops.map((crop, index) => (
              <Card key={index} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50">
                <div className="relative h-48 overflow-hidden">
                  <img src={crop.image} alt={crop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-foreground">{crop.name}</h3>
                </div>
                <CardContent className="p-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {crop.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Missing Crop CTA */}
      <section className="relative py-24 bg-primary text-primary-foreground overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="hexagons" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M5 0L10 2.5V7.5L5 10L0 7.5V2.5L5 0Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-foreground/10 mb-6">
            <Flower2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Don't See Your Crop?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            If your crop relies on bees for pollination, we would love to talk to see how we can improve your pollination. Whether through optimized placement, more precise timing of bee removal, or simply more efficient and cost-effective outcomes.
          </p>
          <Button size="lg" variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" asChild>
            <a href="mailto:info@beeyield.com">
              <Mail className="mr-2 h-5 w-5" /> Email Our Customer Success Team
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CropsWePollinate;


