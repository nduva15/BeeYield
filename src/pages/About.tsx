import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, ArrowRight, Sprout, Globe, ShieldCheck, Heart, History, TrendingUp, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* 1. Modern Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20 dark:to-background">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="container relative mx-auto px-4 text-center">
          <Badge className="mb-6 bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 px-4 py-1.5 text-sm font-medium rounded-full transition-colors">
            Est. 2020 • Kibwezi, Kenya
          </Badge>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Cultivating the <span className="text-primary italic">Future</span> of Food
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl text-muted-foreground leading-relaxed">
            Born from a family's shared vision in rural Kenya, we're on a mission to solve the global pollination crisis through precision pollination, technology, and ecosystem guardianship.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link to="/ourstory">Read Our Full Story</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link to="/contact">Partner With Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Our Story - Tree Form / Timeline */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <History className="h-8 w-8 text-primary" /> Our Roots & Growth
            </h2>
            <p className="text-muted-foreground text-lg">From a humble half-acre plot to a precision pollination leader.</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Tree Trunk / Vertical Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary/20 via-primary to-primary/20 rounded-full"></div>

            {/* Node 1: 2020 Origin */}
            <div className="relative mb-16 sm:mb-24">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-16">
                <div className="sm:w-1/2 sm:text-right order-2 sm:order-1">
                  <h3 className="text-2xl font-bold text-primary mb-2">2020: The Seed is Planted</h3>
                  <p className="text-muted-foreground">BeeYield is born on a half-acre plot in Kibwezi with just 4 hives. Timothy Nduva sees an opportunity where others saw crisis.</p>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 w-12 h-12 bg-background border-4 border-primary rounded-full flex items-center justify-center z-10 order-1 sm:order-2 mt-[-2rem] sm:mt-0">
                  <Sprout className="h-6 w-6 text-primary" />
                </div>
                <div className="sm:w-1/2 order-3 sm:order-3"></div>
              </div>
            </div>

            {/* Node 2: Family Joins */}
            <div className="relative mb-16 sm:mb-24">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-16">
                <div className="sm:w-1/2 order-3 sm:order-1"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-background border-4 border-primary rounded-full flex items-center justify-center z-10 mt-[-2rem] sm:mt-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="sm:w-1/2 order-2 sm:order-2">
                  <h3 className="text-2xl font-bold text-primary mb-2">The Family Unites</h3>
                  <p className="text-muted-foreground">Sisters Agatha and Carole bring their expertise in web development and IoT, turning a beekeeping project into a tech-driven family legacy.</p>
                </div>
              </div>
            </div>

            {/* Node 3: Growth */}
            <div className="relative mb-16 sm:mb-24">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-16">
                <div className="sm:w-1/2 sm:text-right order-2 sm:order-1">
                  <h3 className="text-2xl font-bold text-primary mb-2">Expansion & Impact</h3>
                  <p className="text-muted-foreground">Growth to 184 hives across a 5-acre apiary. 2,500+ trees planted, restoring local ecosystems and pollinating 25 acres of farmland.</p>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-background border-4 border-primary rounded-full flex items-center justify-center z-10 mt-[-2rem] sm:mt-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="sm:w-1/2 order-3 sm:order-3"></div>
              </div>
            </div>

            {/* Node 4: Present Day */}
            <div className="relative">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-16">
                <div className="sm:w-1/2 order-3 sm:order-1"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-background border-4 border-primary rounded-full flex items-center justify-center z-10 mt-[-2rem] sm:mt-0">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="sm:w-1/2 order-2 sm:order-2">
                  <h3 className="text-2xl font-bold text-primary mb-2">Today: Precision Tech</h3>
                  <p className="text-muted-foreground">Evolving into a Precision Pollination leader using IoT, Data, and AI to secure the future of food globally.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Meet Our Team & Impact (Expanded Section) */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Explore Our Ecosystem</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Dive deeper into the people, technology, and initiatives driving BeeYield forward.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Linked Card 1: Team */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-none shadow-md bg-secondary/10">
              <CardContent className="p-8">
                <div className="mb-6 inline-block rounded-2xl bg-white p-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">Meet The Team</h3>
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  Get to know the founding family—three Strathmore graduates combining tech, business, and beekeeping.
                </p>
                <Link to="/team" className="inline-flex items-center text-primary font-semibold group-hover:translate-x-1 transition-transform">
                  Meet the Founders <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Linked Card 2: Impact */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-none shadow-md bg-green-50/50 dark:bg-green-900/10">
              <CardContent className="p-8">
                <div className="mb-6 inline-block rounded-2xl bg-white p-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">Our Impact</h3>
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  From 4 to 184 hives, protecting ecosystems and planting 2,500+ trees. See our environmental footprint.
                </p>
                <Link to="/impact" className="inline-flex items-center text-green-700 dark:text-green-400 font-semibold group-hover:translate-x-1 transition-transform">
                  View Impact Report <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Linked Card 3: Global Hive Network (New) */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-none shadow-md bg-blue-50/50 dark:bg-blue-900/10">
              <CardContent className="p-8">
                <div className="mb-6 inline-block rounded-2xl bg-white p-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">Global Hive Network</h3>
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  Join our planetary initiative to save pollinators. Adopt a hive, support farmers, and be part of the solution.
                </p>
                <Link to="/global-hive-network" className="inline-flex items-center text-blue-700 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Join the Network <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Linked Card 4: Traceability (New) */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-none shadow-md bg-amber-50/50 dark:bg-amber-900/10">
              <CardContent className="p-8">
                <div className="mb-6 inline-block rounded-2xl bg-white p-4 shadow-sm group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">HoneyChain™ Traceability</h3>
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  Track every drop of honey from hive to jar. Verify our 50/50 harvest promise and meet the beekeeper.
                </p>
                <Link to="/traceability" className="inline-flex items-center text-amber-700 dark:text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Trace Your Honey <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Linked Card 5: Pollination Services (New) */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-none shadow-md bg-purple-50/50 dark:bg-purple-900/10">
              <CardContent className="p-8">
                <div className="mb-6 inline-block rounded-2xl bg-white p-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Sprout className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">Pollination Services</h3>
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  Boost crop yields with our precision pollination services. Custom solutions for mango, bean, and sisal farmers.
                </p>
                <Link to="/pollination-solutions" className="inline-flex items-center text-purple-700 dark:text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Services for Farmers <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Linked Card 6: Our Values (New/Modified) */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-none shadow-md bg-zinc-50 dark:bg-zinc-800/10">
              <CardContent className="p-8">
                <div className="mb-6 inline-block rounded-2xl bg-white p-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">Our Commitment</h3>
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  Read about our core values: Sustainability, Traceability, and Community Empowerment.
                </p>
                <Link to="/commitment" className="inline-flex items-center text-foreground font-semibold group-hover:translate-x-1 transition-transform">
                  Our Promise <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Full-width Video Section - Before Footer */}
      <div className="relative w-full h-[60vh] md:h-[80vh] bg-[#F0F7F0]">
        <iframe
          className="absolute inset-0 w-full h-full opacity-60"
          src="https://www.youtube.com/embed/vV-m_k8E5Yc"
          title="About BeeYield"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F0F7F0] via-transparent to-transparent pointer-events-none flex items-end justify-center pb-20">
          <div className="text-center text-neutral-900 p-4">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">See the BeeYield Difference</h2>
            <p className="text-lg md:text-xl opacity-80">Watch how we're transforming agriculture, one hive at a time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
