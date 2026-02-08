
import { Link } from "react-router-dom";
import {
  Mic, Map, LayoutDashboard, ArrowRight, Cpu,
  Quote, Activity, Mail, ChevronRight,
  BarChart3, Signal, Play, Star, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const InLandPollination = () => {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Almond Grower, Central Valley CA",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
      quote: "PLIP gave us visibility we never had before. We identified a cold spot in the north orchard immediately and optimized our hive placement, resulting in a 15% yield increase."
    },
    {
      name: "Miguel Rodriguez",
      role: "Blueberry Farm Owner, WA",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      quote: "The acoustic monitoring is game-changing. Knowing exactly when the bees are active helps us time our nutrient sprays perfectly to avoid disrupting pollination."
    },
    {
      name: "David Chen",
      role: "Seed Producer, OR",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
      quote: "Real-time data on the dashboard allowed us to catch a weak pollination window early. We supplemented the hives within 24 hours and saved the season."
    }
  ];

  return (
    <div className="pt-8">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-secondary via-background to-primary/10 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                In-Land Technology
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
                Pollination Land <br />
                Insight Platform
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                PLIP delivers key in-land data on per-flower bee visits to evaluate pollination efficacy.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="shadow-lg" asChild>
                  <Link to="/pollination-request">Book Pollination Service</Link>
                </Button>
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <Link to="/precision-pollination"><Play className="h-4 w-4" /> View Sensor Demo</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              {/* Hero Image */}
              <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center relative shadow-xl">
                <Signal className="h-32 w-32 text-primary opacity-60" />
                <div className="absolute -bottom-4 -right-4 bg-background rounded-xl shadow-lg p-4 border border-border">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">Acoustic Monitoring</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Activity className="h-3 w-3" />
                      Detecting Flight Signatures
                    </div>
                  </div>
                </div>
              </div>
              {/* Abstract decorations */}
              <div className="absolute top-10 left-0 h-20 w-20 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute bottom-10 right-10 h-32 w-32 bg-accent/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* What Is PLIP + Quote */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-foreground">PLIP. BeeYield's In-Land Solution</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                BeeYield's Pollination Land Insight Platform (PLIP) measures bee activity in crops. This innovative platform provides you with the crucial knowledge of how many bees are actually pollinating your crop, along with additional actionable data to make real-time decisions that influence crop yield.
              </p>
            </div>

            <div className="bg-secondary/50 p-8 rounded-2xl border-l-4 border-primary">
              <Quote className="h-10 w-10 text-primary mb-4 opacity-50" />
              <p className="text-lg text-foreground italic leading-relaxed mb-6">
                "PLIP lets us see the actual number of bees that visit the flowers. Now I can check the amount of pollination in our lands 24/7."
              </p>
              <div>
                <p className="font-bold text-foreground">Avi Gabai</p>
                <p className="text-sm text-muted-foreground">Hazera Seed Production Israel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Breakdown (Acoustics & Visibility) */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Acoustic Sensor Card */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">We Can Hear Bees!</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Redesigned to withstand the rigors of the land, our new sensor boasts a larger enclosure to deliver improved battery life, and features a custom analysis precisely tuned to detect the flight audio signature of the bees.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary">
                  Learn More <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
            {/* Visibility Card */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Map className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Visibility Into Every Land</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Accurate information about forage rates allows for real-time responses. You can see actual pollinator visits on the flower, efficiency of the pollination process, and data on the degree to which synchronized bloom has occurred, all in real-time.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary">
                  View Demo <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="relative">
              {/* Dashboard Mockup */}
              <div className="bg-muted/50 rounded-2xl p-6 shadow-xl border border-border">
                <div className="bg-background rounded-xl p-6 shadow-inner">
                  <div className="flex items-center gap-3 mb-6">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    <span className="font-bold text-foreground">PLIP Dashboard Live View</span>
                  </div>
                  <div className="flex items-end gap-2 h-32">
                    {[40, 70, 50, 90, 60, 30, 80, 50].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t-md" style={{ height: `${h}% ` }} />
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating Metric Badge */}
              <div className="absolute -bottom-6 -right-6 bg-background rounded-xl shadow-lg p-4 border border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Visits / Min
                </div>
                <p className="text-2xl font-bold text-foreground">42.8</p>
              </div>
            </div>

            <div>
              <Badge variant="secondary" className="mb-4">
                <Activity className="h-3 w-3 mr-1" />
                Data Driven
              </Badge>
              <h2 className="text-4xl font-bold mb-6 text-foreground">All on an Easy-to-Read Dashboard</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The PLIP dashboard presents key metrics and delivers actionable insights every day the bees are at work. It gives highly detailed information on the per minute bee visits from each land's data collection points.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                With PLIP you can compare the impact of pollination activity among different genetic strains of the same varietal, filter by different production practices and treatments, track and correlate output rates, as well as quality levels and germination rates.
              </p>

              {/* Research Quote */}
              <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-sm italic text-foreground mb-2">
                  "We built highly sensitive analysis models that can distinguish the acoustic signature of a flying bee from a tractor engine on the same frequency."
                </p>
                <p className="text-xs font-bold text-foreground">George Clouston</p>
                <p className="text-xs text-muted-foreground">Research Director</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Testimonials with Photos */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">Hear What Our Growers Have to Say</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Real results from farms across the country using the Pollination Land Insight Platform.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((t, i) => (
              <Card key={i} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={t.image} alt={t.name} className="h-14 w-14 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm italic leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Success */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square max-w-sm mx-auto bg-gradient-to-br from-secondary to-muted rounded-full flex items-center justify-center">
                <div className="h-40 w-40 bg-muted rounded-full shadow-inner" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">We Don't Succeed Unless You Succeed</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We want our partnership with you to be as smooth and stress free as possible. Meet Alissa, Head of Customer Success. Her team is ready to provide you with all the help you need, from onboarding, to making sure all your contract paperwork is buttoned up.
              </p>
              <Button variant="outline" className="gap-2" asChild>
                <a href="mailto:info@beeyield.com"><Mail className="h-4 w-4" /> Email Us: info@beeyield.com</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20 bg-background p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-4">Try BeeYield in your apiary</h2>
            <p className="text-muted-foreground mb-6">
              BeeYield is constantly evolving. We invite you to take part in the international testing of our system – together, we can advance technology that protects bees worldwide.
            </p>
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/contact">Join the Program</Link>
            </Button>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">We are building a global network of partners</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
              BeeYield collaborates with leading partners worldwide, joining forces with beekeeping equipment manufacturers, industry organizations, and renowned universities.
            </p>
            {/* Partners */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 items-center opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-lg">Farmers</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-lg">ApiSense</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-lg">Technical Hives</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Link to Precision Pollination & Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
            <div className="h-1 w-16 bg-primary-foreground/30 hidden md:block" />
            {/* CTA Side */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4">Ready to optimize your lands?</h2>
              <p className="opacity-90 mb-6">
                Start getting actionable data on your pollination efficacy today.
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/pollination-request">Book Pollination Service</Link>
              </Button>
            </div>

            {/* Cross-Link Side */}
            <div className="bg-primary-foreground/10 p-6 rounded-2xl backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="bg-primary-foreground/20 p-3 rounded-lg">
                  <Mic className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Looking for In-Hive Monitoring?</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Check out our Precision Pollination solution to monitor colony health from the inside out.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-primary-foreground gap-1" asChild>
                    <Link to="/precision-pollination">Explore Precision Pollination <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InLandPollination;