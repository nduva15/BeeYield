import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, TrendingUp, Shield, BarChart3, ArrowRight, 
  Cpu, Eye, Zap, Target, Leaf, Award, Clock, Users,
  Activity, Database, Radio, Smartphone, Bug
} from "lucide-react";
import { Link } from "react-router-dom";

const PollinationServices = () => {
  const crops = [
    { name: "Maize", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400" },
    { name: "Sisal", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400" },
    { name: "Mangoes", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400" },
    { name: "Apples", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400" },
    { name: "Sunflower", image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=400" },
    { name: "Oranges", image: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=400" },
    { name: "Vegetables", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400" },
    { name: "Tomatoes", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400" },
    { name: "Onions", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa829?auto=format&fit=crop&q=80&w=400" },
    { name: "Beans", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400" },
  ];

  const differences = [
    {
      icon: Database,
      title: "Data-First Approach",
      description: "Every decision backed by real-time hive analytics and field data, not guesswork."
    },
    {
      icon: Radio,
      title: "IoT-Enabled Monitoring",
      description: "Sensors in every hive transmitting colony health metrics 24/7 to our platform."
    },
    {
      icon: Target,
      title: "Precision Placement",
      description: "AI-optimized hive positioning ensures maximum coverage across your fields."
    },
    {
      icon: Activity,
      title: "Live Activity Tracking",
      description: "Watch bee foraging patterns in real-time and adjust strategies instantly."
    },
    {
      icon: Users,
      title: "Expert Agronomists",
      description: "Dedicated pollination specialists who understand your crop's unique needs."
    },
    {
      icon: Award,
      title: "Guaranteed Results",
      description: "We stake our reputation on measurable yield improvements for your harvest."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse delay-500" />
          </div>
          {/* Honeycomb Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="honeycomb" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5.77 20,17.32 10,23.09 0,17.32 0,5.77" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb)"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-foreground space-y-8">
              <Badge className="bg-primary/10 text-primary border-primary/30 text-sm px-4 py-2">
                🐝 Africa and the World's Premier Pollination Partner
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Your Partner in
                <span className="text-primary block">Pollination</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                With BeeYield's data-driven, managed pollination solutions for commercial crop growers.
              </p>

              <div className="flex flex-wrap gap-4">
                <a href="mailto:info@beeyield.com">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90 text-lg px-8 py-6 font-semibold shadow-2xl">
                    Book Consultation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <Link to="/PollinationRequest">
                  <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6">
                    Book Pollination
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-6 gap-3 pt-8 border-t border-border">
                <div>
                  <p className="text-3xl font-bold text-primary">35%</p>
                  <p className="text-muted-foreground text-sm">Average Yield Increase</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">150+</p>
                  <p className="text-muted-foreground text-sm">Managed Hives</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">2K+</p>
                  <p className="text-muted-foreground text-sm">Data Points</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">1+</p>
                  <p className="text-muted-foreground text-sm">Continents</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">1+</p>
                  <p className="text-muted-foreground text-sm">Countries</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">2+</p>
                  <p className="text-muted-foreground text-sm">Counties</p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square">
                {/* Central Hexagon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 bg-gradient-to-br from-primary/10 to-green-500/10 backdrop-blur-sm rounded-3xl rotate-45 border border-primary/20 shadow-2xl">
                    <div className="w-full h-full -rotate-45 flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=500" 
                        alt="Bee pollinating"
                        className="w-64 h-64 object-cover rounded-2xl shadow-xl"
                      />
                    </div>
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute top-10 right-10 bg-primary/10 backdrop-blur-md rounded-xl p-4 border border-primary/20 animate-bounce">
                  <span className="text-3xl">🐝</span>
                </div>
                <div className="absolute bottom-20 left-0 bg-green-500/10 backdrop-blur-md rounded-xl p-4 border border-green-500/20 animate-pulse">
                  <Smartphone className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm">Discover More</span>
            <ArrowRight className="h-5 w-5 rotate-90" />
          </div>
        </div>
      </section>

      {/* The Story Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="text-primary border-primary/30">
              Our Philosophy
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Pollination is an <span className="text-primary">Art</span> and a <span className="text-primary">Science</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              For centuries, farmers relied on hope and good weather. Bees came, bees went, 
              and harvests were a mystery until the day of picking. <strong>We changed that story.</strong>
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At BeeYield, we've merged the ancient wisdom of beekeeping with cutting-edge IoT technology. 
              Every hive tells a story. Every bee's journey is mapped. Every flower's fate is known. 
              This isn't just pollination. It's <em>precision agriculture</em> at its finest.
            </p>
          </div>
        </div>
      </section>

      {/* Two Pollination Types Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30">
              Our Solutions
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Two Paths to <span className="text-primary">Perfect Pollination</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the approach that fits your operation, or combine both for complete visibility
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* In-Hive Precision */}
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-500 bg-gradient-to-br from-card to-primary/5 dark:to-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 relative z-10">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Cpu className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <h3 className="text-2xl font-bold text-foreground">In-Hive Precision</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Smart sensors inside every hive monitor colony strength, bee population, 
                      temperature, and activity levels. Know exactly what you're paying for 
                      before the first bee takes flight.
                    </p>
                    <ul className="space-y-2">
                      {["Real-time colony health metrics", "Bee count verification", "Temperature & humidity tracking", "Gateway connectivity"].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to="/PrecisionPollination">
                      <Button className="mt-4 bg-primary hover:bg-primary/90 text-white">
                        Explore In-Hive Tech
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* In-Land PLIP Platform */}
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-green-400 transition-all duration-500 bg-gradient-to-br from-card to-green-50/50 dark:to-green-950/20">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 relative z-10">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <h3 className="text-2xl font-bold text-foreground">In-Land PLIP Platform</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      PLIP (Pollination Land Insight Platform) measures bee activity in crops, 
                      providing crucial data on per-flower bee visits to evaluate pollination 
                      efficacy and make real-time decisions that influence yield.
                    </p>
                    <ul className="space-y-2">
                      {["Per-flower bee visit tracking", "Acoustic monitoring technology", "Real-time pollination dashboard", "24/7 land activity insights"].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to="/InLandPollinationPlatform">
                      <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white">
                        Explore PLIP Platform
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Combined Platform CTA */}
          <div className="mt-12 text-center">
            <Link to="/PollinationSolutions">
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20">
                See How Both Work Together
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The BeeYield Difference */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="diff-hex" x="0" y="0" width="10" height="8.66" patternUnits="userSpaceOnUse">
              <polygon points="5,0 10,2.89 10,8.66 5,11.55 0,8.66 0,2.89" fill="none" stroke="currentColor" strokeWidth="0.3"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#diff-hex)"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
              Why We're Different
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              The <span className="text-primary">BeeYield</span> Difference
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Other providers bring bees. We bring a complete ecosystem of technology, 
              expertise, and accountability that transforms your pollination from a gamble into a guarantee.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {differences.map((diff, index) => (
              <Card key={index} className="group bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <diff.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{diff.title}</h3>
                  <p className="text-muted-foreground">{diff.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Crops We Pollinate */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30">
              Our Expertise
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Crops We <span className="text-primary">Pollinate</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From staple grains to high-value fruits, our pollination expertise spans the full spectrum
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {crops.map((crop, index) => (
              <Link 
                to="/crops-we-pollinate"
                key={index} 
                className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer"
              >
                <img 
                  src={crop.image} 
                  alt={crop.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg group-hover:text-primary-foreground transition-colors">
                    {crop.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/crops-we-pollinate">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                View All Crops & Case Studies
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30">
              See It In Action
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Hear From Our <span className="text-primary">Partners</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch how BeeYield is transforming pollination for farmers across Africa and the world
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Video 1 */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border border-border">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/VIDEO_ID_1"
                title="BeeYield Partner Testimonial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video 2 */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border border-border">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/VIDEO_ID_2"
                title="BeeYield Technology in Action"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-80 h-80 bg-accent/50 rounded-full blur-3xl" />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold text-white">
              Take Control of Your Pollination Today
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Partner with BeeYield's precision-driven, technology-powered pollination 
              solutions built for commercial growers across Africa and beyond.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-primary hover:bg-primary-foreground/90 text-lg px-8 py-6 font-semibold shadow-xl">
                  Request a Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="mailto:info@beeyield.com">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 bg-transparent">
                  Email Us
                </Button>
              </a>
            </div>
            <p className="text-white/70 text-sm pt-4">
              No commitment required. We'll assess your needs and create a custom pollination plan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PollinationServices;
