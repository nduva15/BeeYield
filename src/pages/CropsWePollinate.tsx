import React from "react";
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium">
                Precision Agriculture
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Get Data-Driven <br />
                <span className="text-primary">Crop Pollination</span>
              </h1>
              <p className="max-w-xl text-base sm:text-lg text-muted-foreground">
                Our end-to-end solution gives unprecedented control and visibility into pollination, ensuring 40% crop yields and sustainable practices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="w-full sm:w-auto rounded-full" asChild>
                  <Link to="/contact">Get a Free Consultation</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full" asChild>
                  <a href="#crops">Explore Crops</a>
                </Button>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              {/* Decorative grid of crop images */}
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-2xl bg-primary/20 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-secondary/30 blur-3xl" />
              <div className="grid grid-cols-2 gap-4">
                <img src={crops[0].image} alt={crops[0].name} className="h-48 w-full rounded-2xl object-cover shadow-lg" />
                <img src={crops[2].image} alt={crops[2].name} className="h-48 w-full rounded-2xl object-cover shadow-lg mt-8" />
                <img src={crops[4].image} alt={crops[4].name} className="h-48 w-full rounded-2xl object-cover shadow-lg -mt-4" />
                <img src={crops[5].image} alt={crops[5].name} className="h-48 w-full rounded-2xl object-cover shadow-lg mt-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl mb-4">Work With the Pollination Experts</h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-8 rounded-full" />
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-muted-foreground mb-12 px-4">
            BeeYield is comprised of leading experts in the field of pollination. Bee biologists and researchers, data-science experts, electrical engineers, leading agronomists, and veteran beekeepers make up our team, and all are committed to creating improved pollination outcomes for our customers.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-8 max-w-5xl mx-auto px-4">
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-4 sm:p-8 text-center">
                <p className="text-2xl sm:text-4xl font-bold text-primary mb-2">25+</p>
                <p className="text-muted-foreground font-medium text-xs sm:text-base">Acres Managed</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-4 sm:p-8 text-center">
                <p className="text-2xl sm:text-4xl font-bold text-primary mb-2">1</p>
                <p className="text-muted-foreground font-medium text-xs sm:text-base">Countries</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-4 sm:p-8 text-center">
                <p className="text-2xl sm:text-4xl font-bold text-primary mb-2">2</p>
                <p className="text-muted-foreground font-medium text-xs sm:text-base">Counties</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-4 sm:p-8 text-center">
                <p className="text-2xl sm:text-4xl font-bold text-primary mb-2">1</p>
                <p className="text-muted-foreground font-medium text-xs sm:text-base">Continents</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-lg col-span-2 sm:col-span-1">
              <CardContent className="p-4 sm:p-8 text-center">
                <p className="text-2xl sm:text-4xl font-bold text-primary mb-2">9+</p>
                <p className="text-muted-foreground font-medium text-xs sm:text-base">Crop Varieties</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* World Map Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="rounded-full px-4 py-1.5 mb-4">
              <Globe className="w-4 h-4 mr-2" />
              Global Presence
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl mb-4">Where We Operate</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              BeeYield is expanding its precision pollination services across Africa and the world, starting with our home base in Kenya.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="relative bg-secondary/20 rounded-3xl p-4 md:p-8 overflow-hidden">
              {/* Accurate World Map */}
              <div className="w-full">
                <ComposableMap projection="geoNaturalEarth1" className="w-full">
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          style={{
                            default: { fill: "hsl(var(--muted))", stroke: "hsl(var(--border))", strokeWidth: 0.5 },
                            hover: { fill: "hsl(var(--secondary)/0.6)", outline: "none" },
                            pressed: { fill: "hsl(var(--secondary)/0.8)", outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>

                  {/* Kenya marker (Nairobi) */}
                  <Marker coordinates={[36.8219, -1.2921]}>
                    <g className="animate-ping opacity-75">
                      <circle r={8} fill="hsl(var(--primary-foreground))" />
                    </g>
                    <circle r={6} fill="hsl(var(--primary-foreground))" />
                    <circle r={3} fill="hsl(var(--primary))" />
                    <text y={-12} className="text-[11px]" fill="hsl(var(--foreground))" fontWeight={700}>
                      Kenya
                    </text>
                  </Marker>

                </ComposableMap>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Active Regions
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground">Kenya (Headquarters)</span>
                  </div>
                </div>
              </div>

              {/* Stats overlay */}
              <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border">
                <p className="text-xs text-muted-foreground mb-1">Operating in</p>
                <p className="text-2xl font-bold text-primary">1 Country</p>
                <p className="text-xs text-muted-foreground mt-1">Africa & Beyond</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crops Grid */}
      <section id="crops" className="py-20 bg-secondary/10">
        <div className="container mx-auto px-4">
          {/* Crop Navigation Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {crops.map((c, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors rounded-full"
              >
                {c.name}
              </Badge>
            ))}
          </div>

          {/* Crops Cards */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {crops.map((crop, index) => (
              <Card key={index} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={crop.image} 
                    alt={crop.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">{crop.name}</h3>
                </div>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {crop.desc}
                  </p>
                  {/* <Button variant="link" className="p-0 h-auto text-primary">
                    View Case Study <ArrowRight className="ml-2 h-4 w-4" />
                  </Button> */}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Missing Crop CTA */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="hexagons" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M5 0 L10 2.5 L10 7.5 L5 10 L0 7.5 L0 2.5 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-foreground/20 mb-6">
            <Flower2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold md:text-4xl mb-4">Don't See Your Crop?</h2>
          <p className="max-w-2xl mx-auto text-primary-foreground/80 mb-8">
            If your crop relies on bees for pollination, we would love to talk to see how we can improve your pollination. Whether through optimized placement, more precise timing of bee removal, or simply more efficient and cost-effective outcomes.
          </p>
          <Button size="lg" variant="secondary" className="rounded-full" asChild>
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

