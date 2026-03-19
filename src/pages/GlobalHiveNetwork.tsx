import { useState } from "react";
import { Link } from "react-router-dom";
import { Globe, Activity, BookOpen, Heart, AlertTriangle, MapPin, Check, Mail, Leaf, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

const GlobalHiveNetwork = () => {
  const [supportType, setSupportType] = useState("monthly");

  return (

    <BeeYieldPageShell className="min-h-screen bg-background p-0">
      {/* Hero Section - Mobile Responsive */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-secondary via-background to-primary/10 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center max-w-4xl">
          <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
            A Global Effort
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight text-foreground px-2">
            Saving Africa and the World's Pollinators
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            BeeYield is leading the charge to address the pollinator crisis in Africa and the world, where 60% of bee colonies are lost annually and 75% of food crops depend on pollination.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button size="lg" asChild className="shadow-xl w-full sm:w-auto">
              <Link to="#support-african-farmers">Support the Cause Today</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link to="/media">Read the Whitepaper</Link>
            </Button>
          </div>

          {/* Hero Partners */}
          <div className="mt-12 pt-8 border-t border-primary/10 flex flex-col items-center">
            <p className="text-sm font-medium text-muted-foreground mb-4">Trusted By Global Leaders</p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 items-center opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-base text-foreground/80">Farmers</span>
              </div>
              <div className="w-px h-8 bg-primary/20 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-base text-foreground/80">ApiSense</span>
              </div>
              <div className="w-px h-8 bg-primary/20 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-base text-foreground/80">Monitored Hives</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5"></div>
      </section>

      {/* Full-width Video Section - Before Footer */}
      <div className="relative w-full h-[70vh] bg-foreground">
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://www.youtube.com/embed/vV-m_k8E5Yc"
          title="About BeeYield"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* The Crisis Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1">
              <Card className="bg-background/10 border-background/20 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Global Emergency</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-background">The Bee Crisis</h3>
                  <p className="text-background/80 leading-relaxed mb-6">
                    Across Africa and the world, beekeepers are opening their hives to discover devastating losses. African bee colonies face unique challenges from climate change, habitat loss, and limited access to modern beekeeping technology.
                  </p>
                  <div className="bg-red-500/20 p-4 rounded-lg">
                    <p className="text-4xl font-bold text-red-400">60%</p>
                    <p className="text-sm text-background/70">Annual colony mortality rate in Africa</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold mb-6">The Pollination Crisis: <br />Food Security at Risk</h2>
              <p className="text-background/80 leading-relaxed mb-6">
                With 75% of food crops relying on pollinators, the decline of African bee populations threatens agricultural productivity, farmer livelihoods, and regional food security. Crops like mangoes, beans, tomatoes, and sisal depend heavily on healthy bee colonies.
              </p>
              <p className="text-background/80 leading-relaxed mb-8">
                This isn't just about bees—it's about ensuring sustainable agriculture and food security for millions across Africa and the world. The time to act is now.
              </p>
              <Button variant="secondary" className="gap-2" asChild>
                <Link to="/about">Learn More <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The Initiative & Goals */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">A Research-Based Approach to African Agriculture</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              BeeYield is bringing precision pollination to African farmers. We partner with local beekeepers and farming communities to monitor hive health, improve pollination, and raise yields for crops that feed millions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-none shadow-xl text-center">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Goal 1</p>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Monitored Hives Network</h3>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Target: 2M hives</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A network of sensor-equipped hives across Makueni and Kitui. Beekeepers get real-time colony health and pollination data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl text-center">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Goal 2</p>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Health Monitoring</h3>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Target: 100M+ signals</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Daily bee health data builds a clear picture of hive condition so farmers can time crop pollination better.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl text-center">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Goal 3</p>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Farmer Education</h3>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Target: 50K farmers</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Training local farmers and beekeepers in sustainable pollination practices, improving yields for mangoes, beans, tomatoes, and sisal across Africa and the world.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Global Case Studies */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">Our Work Across Africa</h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-16" />

          <div className="space-y-16 max-w-6xl mx-auto">
            {/* Makueni County - Mangoes */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 bg-green-100 text-[#1B9157] border-green-200">
                  <MapPin className="h-3 w-3 mr-1" /> MAKUENI COUNTY
                </Badge>
                <h3 className="text-3xl font-bold mb-4 text-foreground">Improving Mango Pollination</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  In partnership with local mango growers in Makueni County, BeeYield is deploying hive sensors to track colony conditions during flowering. This helps growers time decisions around bloom and keep colonies strong when trees need them most.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> 40% increase in mango yields observed</li>
                  <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> Training 50+ local beekeepers</li>
                </ul>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800"
                  alt="Mango orchard in Makueni"
                  className="w-full h-[300px] object-cover"
                />
              </div>
            </div>

            {/* Kitui County - Beans & Tomatoes */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800"
                  alt="Vegetable farming in Kitui"
                  className="w-full h-[300px] object-cover"
                />
              </div>
              <div className="order-1 lg:order-2">
                <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
                  <MapPin className="h-3 w-3 mr-1" /> KITUI COUNTY
                </Badge>
                <h3 className="text-3xl font-bold mb-4 text-foreground">Improved Vegetable Production</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Working with smallholder farmers in Kitui County, we're transforming bean and tomato production through precision pollination. Our sensors track pollinator activity in real-time, helping farmers time their interventions perfectly.
                </p>
                <blockquote className="border-l-4 border-primary pl-4 text-muted-foreground">
                  "With BeeYield's technology, we've seen 30% better pod development in our bean crops and more uniform tomato sizes."
                </blockquote>
              </div>
            </div>

            {/* Sisal Production */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 bg-amber-100 text-[#F4D03F] border-amber-200">
                  <MapPin className="h-3 w-3 mr-1" /> MAKUENI COUNTY
                </Badge>
                <h3 className="text-3xl font-bold mb-4 text-foreground">Sisal & Honey Production</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  BeeYield is pioneering dual-benefit pollination models in sisal plantations. While supporting fiber production, our monitored bee colonies also produce high-quality honey, creating additional income streams for local beekeepers and farmers.
                </p>
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/impact">Learn About Our Impact <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&q=80&w=800"
                  alt="Sisal plantation"
                  className="w-full h-[300px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Partners Section */}
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
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 px-6 py-4 bg-background rounded-lg shadow-sm border border-border">
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <span className="font-bold text-lg">Farmers</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-4 bg-background rounded-lg shadow-sm border border-border">
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <span className="font-bold text-lg">ApiSense</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-4 bg-background rounded-lg shadow-sm border border-border">
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <span className="font-bold text-lg">Monitored Hives</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support / Donation Section */}
      <section id="support-african-farmers" className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-primary-foreground/80" />
            <h2 className="text-4xl font-bold mb-4 text-primary-foreground">Support African and World Farmers</h2>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Join our community of supporters strengthening pollinator health and food security across Makueni and Kitui Counties today—and building a global network for farmers everywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Donation Card */}
            <Card className="border-none shadow-2xl">
              <CardContent className="p-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-muted rounded-lg p-1 inline-flex">
                    <button
                      onClick={() => setSupportType("onetime")}
                      className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${supportType === "onetime" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      One-time
                    </button>
                    <button
                      onClick={() => setSupportType("monthly")}
                      className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${supportType === "monthly" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <span className="text-5xl font-bold text-foreground">
                    {supportType === "monthly" ? "$10" : "$50"}
                  </span>
                  {supportType === "monthly" && <span className="text-muted-foreground">/mo</span>}
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Fund sensor deployment</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Support beekeeper education</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Receive impact reports</li>
                </ul>

                <Button className="w-full" asChild>
                  <Link to="/contact">Support</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Higher Tier Card */}
            <Card className="border-2 border-primary shadow-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardContent className="p-8 pt-10">
                <h3 className="text-xl font-bold text-center mb-6 text-foreground">Patron of the Hive</h3>

                <div className="text-center mb-6">
                  <span className="text-5xl font-bold text-foreground">
                    {supportType === "monthly" ? "$100" : "$500"}
                  </span>
                  {supportType === "monthly" && <span className="text-muted-foreground">/mo</span>}
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Partner with a monitored hive</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Access to webinars & events</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary" /> Exclusive network insights</li>
                </ul>

                <Button className="w-full" asChild>
                  <Link to="/contact">Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Join Our Network</h2>
            <p className="text-muted-foreground">
              Interested in updates about bee health, pollination research, and agricultural innovations in Africa and the world? Stay connected with BeeYield's work.
            </p>
          </div>

          <Card className="border-none shadow-xl">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="info@beeyield.com" required />
                </div>
                <Button type="submit" className="w-full">
                  <Mail className="h-4 w-4 mr-2" /> Submit
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default GlobalHiveNetwork;
