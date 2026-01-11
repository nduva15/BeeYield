import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Cpu, Sprout, ArrowRight, Check,
  Globe, Flower2, Wheat, MapPin, Mail
} from "lucide-react";
import { Link } from "react-router-dom";

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
      name: "Onions",
      image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa829?auto=format&fit=crop&q=80&w=600",
      desc: "Onion seed production requires cross-pollination between male and female plants. BeeYield helps producers optimize hive placement and monitor pollination activity for maximum seed yield."
    }
  ];

  const locations = [
    { continent: "Africa", countries: ["Kenya", "Tanzania"], color: "bg-primary" }
  ];

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
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Get Data-Driven <br />
                <span className="text-primary">Crop Pollination</span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Our end-to-end solution gives unprecedented control and visibility into pollination, ensuring 40% crop yields and sustainable practices.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full" asChild>
                  <Link to="/contact">Get a Free Consultation</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full" asChild>
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
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-12">
            BeeYield is comprised of leading experts in the field of pollination. Bee biologists and researchers, data-science experts, electrical engineers, leading agronomists, and veteran beekeepers make up our team, and all are committed to creating improved pollination outcomes for our customers.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-4xl font-bold text-primary mb-2">25+</p>
                <p className="text-muted-foreground font-medium">Acres Managed</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-4xl font-bold text-primary mb-2">1</p>
                <p className="text-muted-foreground font-medium">Countries</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-4xl font-bold text-primary mb-2">2</p>
                <p className="text-muted-foreground font-medium">Counties</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-4xl font-bold text-primary mb-2">9+</p>
                <p className="text-muted-foreground font-medium">Crop Varieties</p>
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
              BeeYield is expanding its precision pollination services across Africa, starting with our home base in Kenya.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="relative bg-secondary/20 rounded-3xl p-4 md:p-8 overflow-hidden">
              {/* World Map SVG */}
              <svg viewBox="0 0 1000 500" className="w-full h-auto">
                {/* Ocean background */}
                <rect width="1000" height="500" fill="hsl(var(--secondary)/0.3)" />
                
                {/* North America */}
                <path 
                  d="M50 80 L180 60 L250 80 L280 120 L290 180 L270 220 L230 250 L180 280 L140 300 L100 280 L70 240 L50 180 L40 120 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                {/* USA/Canada details */}
                <path 
                  d="M90 160 L200 140 L240 170 L220 210 L160 230 L100 210 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* Central America */}
                <path 
                  d="M180 280 L220 290 L240 320 L220 350 L190 340 L170 310 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* South America */}
                <path 
                  d="M220 350 L280 340 L320 380 L330 450 L300 490 L250 480 L220 440 L200 390 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* Europe */}
                <path 
                  d="M440 60 L520 50 L560 70 L580 100 L570 140 L530 160 L480 150 L450 120 L430 90 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                {/* UK/Ireland */}
                <path 
                  d="M420 80 L440 75 L445 95 L435 110 L420 105 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* Africa Main */}
                <path 
                  d="M450 170 L550 160 L600 200 L620 280 L610 360 L570 420 L500 450 L440 430 L410 380 L400 300 L410 220 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* Kenya - Highlighted */}
                <path 
                  d="M560 280 L590 270 L605 295 L595 330 L565 340 L545 320 L550 295 Z"
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--primary-foreground))"
                  strokeWidth="2"
                  className="drop-shadow-lg"
                />
                
                {/* Tanzania - Highlighted */}
                <path 
                  d="M545 320 L595 330 L610 365 L590 400 L550 395 L530 360 L535 335 Z"
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--primary-foreground))"
                  strokeWidth="2"
                  className="drop-shadow-lg"
                />
                
                {/* Madagascar */}
                <path 
                  d="M620 360 L640 355 L650 400 L635 430 L620 420 L615 380 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* Middle East */}
                <path 
                  d="M580 160 L650 150 L680 190 L660 230 L610 240 L590 200 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* Asia/Russia */}
                <path 
                  d="M560 50 L750 30 L900 50 L920 100 L900 140 L800 160 L700 150 L600 130 L570 90 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* India */}
                <path 
                  d="M700 180 L750 170 L780 220 L760 280 L720 300 L690 270 L680 220 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* Southeast Asia */}
                <path 
                  d="M780 200 L850 190 L880 240 L860 290 L810 300 L780 260 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* China/East Asia */}
                <path 
                  d="M750 100 L850 90 L900 130 L880 180 L820 190 L760 170 L740 130 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* Japan */}
                <path 
                  d="M910 120 L930 110 L940 150 L925 170 L910 160 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* Indonesia */}
                <path 
                  d="M820 320 L920 310 L950 340 L930 370 L850 380 L820 350 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* Australia */}
                <path 
                  d="M820 380 L920 370 L970 410 L960 470 L900 490 L840 480 L810 440 L800 400 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                
                {/* New Zealand */}
                <path 
                  d="M960 450 L975 445 L985 475 L970 490 L955 480 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />

                {/* Kenya marker with pulse animation */}
                <circle cx="575" cy="305" r="12" fill="hsl(var(--primary-foreground))" className="animate-ping opacity-75" />
                <circle cx="575" cy="305" r="8" fill="hsl(var(--primary-foreground))" />
                <circle cx="575" cy="305" r="4" fill="hsl(var(--primary))" />
                
                {/* Tanzania marker */}
                <circle cx="570" cy="365" r="8" fill="hsl(var(--primary-foreground))" />
                <circle cx="570" cy="365" r="4" fill="hsl(var(--primary))" />

                {/* Continent Labels */}
                <text x="150" y="200" fill="hsl(var(--muted-foreground))" fontSize="12" fontWeight="500" opacity="0.7">North America</text>
                <text x="240" y="420" fill="hsl(var(--muted-foreground))" fontSize="12" fontWeight="500" opacity="0.7">South America</text>
                <text x="470" y="110" fill="hsl(var(--muted-foreground))" fontSize="12" fontWeight="500" opacity="0.7">Europe</text>
                <text x="480" y="320" fill="hsl(var(--muted-foreground))" fontSize="12" fontWeight="500" opacity="0.7">Africa</text>
                <text x="760" y="80" fill="hsl(var(--muted-foreground))" fontSize="12" fontWeight="500" opacity="0.7">Asia</text>
                <text x="850" y="440" fill="hsl(var(--muted-foreground))" fontSize="12" fontWeight="500" opacity="0.7">Australia</text>

                {/* Country Labels for active regions */}
                <text x="600" y="300" fill="hsl(var(--foreground))" fontSize="11" fontWeight="bold">Kenya</text>
                <text x="600" y="375" fill="hsl(var(--foreground))" fontSize="11" fontWeight="bold">Tanzania</text>
              </svg>

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
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">Tanzania</span>
                  </div>
                </div>
              </div>

              {/* Stats overlay */}
              <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border">
                <p className="text-xs text-muted-foreground mb-1">Operating in</p>
                <p className="text-2xl font-bold text-primary">2 Countries</p>
                <p className="text-xs text-muted-foreground mt-1">East Africa</p>
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
                  <Button variant="link" className="p-0 h-auto text-primary">
                    View Case Study <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
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

