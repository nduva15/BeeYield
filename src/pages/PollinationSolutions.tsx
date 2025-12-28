import { 
  ArrowRight, Activity, Sprout, BarChart3, 
  Cpu, Wifi, Check, Quote, MapPin, Users, 
  Smartphone, Clock, Shield, TrendingUp, GraduationCap,
  Target, Zap, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const PollinationSolutions = () => {
  return (
    <div className="min-h-screen bg-background">

      {/* Hub Hero - Beekeeping Solutions */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left relative z-10">
              <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
                Smart Beekeeping Network
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Beekeeping Solutions
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Helping beekeepers build, maintain, and deploy the strongest, healthiest hives. Our cutting-edge hive monitoring technology and data-driven insights empower you to overcome daily colony management challenges and maximize hive productivity.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button asChild size="lg">
                  <Link to="/contact">
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800" 
                  alt="Beekeeper inspecting hives" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow-lg">
                <p className="text-2xl font-bold">184+</p>
                <p className="text-sm opacity-90">Managed Hives</p>
              </div>
            </div>
          </div>
        </div>
        {/* Background elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </section>

      {/* The Two Paths Section - Moved to Top */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Two Powerful Approaches to Pollination
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the solution that fits your needs, or combine both for complete visibility.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Path 1: In-Hive */}
            <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                  <Cpu className="w-8 h-8 text-primary" />
                </div>
                <Badge className="mb-4">Colony Health</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-4">In-Hive Precision</h3>
                <p className="text-muted-foreground mb-6">
                  Our proprietary sensors live inside the hive box, monitoring acoustic signatures, temperature, and humidity 24/7. Know the strength of your colonies before they are deployed.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-foreground">
                    <Check className="w-5 h-5 text-primary" />
                    Queen health status
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <Check className="w-5 h-5 text-primary" />
                    Colony strength grading
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <Check className="w-5 h-5 text-primary" />
                    Environmental stress alerts
                  </li>
                </ul>

                <Button asChild variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link to="/PrecisionPollination">
                    Explore In-Hive Technology <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Path 2: In-Land */}
            <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-accent/50 transition-all duration-300">
              <CardContent className="p-8 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
                  <Sprout className="w-8 h-8 text-accent-foreground" />
                </div>
                <Badge variant="secondary" className="mb-4">Land Analytics</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-4">In-Land Insights</h3>
                <p className="text-muted-foreground mb-6">
                  PLIP sensors deployed across your orchards measure actual bee flight activity and per-flower pollination events. Visualize coverage maps to ensure every acre gets the attention it needs.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-foreground">
                    <Check className="w-5 h-5 text-primary" />
                    Real-time pollination maps
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <Check className="w-5 h-5 text-primary" />
                    Foraging efficiency tracking
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <Check className="w-5 h-5 text-primary" />
                    Weather impact analysis
                  </li>
                </ul>

                <Button asChild variant="outline" className="group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Link to="/InLandPollinationPlatform">
                    Explore In-Land Technology <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial Quote */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Photo Half */}
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=600" 
                  alt="John Mutua - Partner Beekeeper" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Testimonial Half */}
              <div className="text-center md:text-left">
                <Quote className="w-10 h-10 text-primary/40 mb-4 mx-auto md:mx-0" />
                <p className="text-xl md:text-2xl font-medium text-foreground italic mb-6">
                  "Beekeepers face daily challenges to maintain thriving colonies. BeeYield delivers real-world solutions to help address these issues."
                </p>
                <div>
                  <p className="font-bold text-foreground text-lg">John Mutua</p>
                  <p className="text-muted-foreground">Partner Beekeeper, Makueni</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A Better Way to Manage Bees */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-accent/20 text-accent-foreground border-accent/30">
                Smart Beekeeping
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                A Better Way to Manage Bees
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We use small, non-intrusive sensors inside the hives to collect data on bee health and behavior. Each hive can be monitored year-round to help you better manage your operations, and build stronger colonies more efficiently.
              </p>
              <p className="text-muted-foreground mb-6">
                Our technology provides unprecedented visibility into colony health, enabling beekeepers to make informed decisions that improve hive strength and reduce mortality rates.
              </p>
              
              {/* Bee Mortality Stats */}
              <div className="bg-muted/50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-foreground mb-4">Tackling the Bee Mortality Crisis</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Globally, bee colony mortality rates average <strong className="text-foreground">30-40%</strong> annually. In Africa, some regions experience losses as high as <strong className="text-foreground">60%</strong> due to climate change, habitat loss, and limited access to monitoring technology.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-background rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-red-500">40%</p>
                    <p className="text-xs text-muted-foreground">Global Average Colony Loss</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">&lt;15%</p>
                    <p className="text-xs text-muted-foreground">BeeYield Managed Colonies</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mt-4">
                  Through real-time monitoring, early disease detection, and data-driven hive management, we've reduced colony loss rates to <strong className="text-foreground">less than 15%</strong>, saving thousands of bees and securing livelihoods for local beekeepers.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link to="/contact">
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline">
                  Download Brochure
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800" 
                  alt="Beehive monitoring" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">24/7 Monitoring</p>
                    <p className="text-sm text-muted-foreground">Real-time hive data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disease Detection & Colony Monitoring */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              Advanced Monitoring
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Disease Detection & Colony Monitoring
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our sensors provide continuous, buffered data streams including temperature, humidity, weight, sound, and GPS, enabling early disease detection and proactive colony management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Continuous Data Collection */}
            <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                  <Cpu className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Continuous Data</h3>
                <p className="text-muted-foreground mb-6">
                  Our sensors provide continuous, buffered data streams to give you complete visibility into colony health around the clock.
                </p>
                <ul className="space-y-3">
                  {["Temperature & humidity", "Weight monitoring", "Acoustic analysis", "GPS tracking"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground">
                      <Check className="w-5 h-5 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Smart Alerts */}
            <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Smart Alerts</h3>
                <p className="text-muted-foreground mb-6">
                  Motion/weight anomalies and GPS movement trigger instant alerts, helping you detect theft, swarming, or disease before it spreads.
                </p>
                <ul className="space-y-3">
                  {["Weight anomaly detection", "GPS movement alerts", "Swarm prediction", "Disease early warning"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground">
                      <Check className="w-5 h-5 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Honey Production */}
            <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Honey Production</h3>
                <p className="text-muted-foreground mb-6">
                  Track honey production in real-time through weight monitoring. Know exactly when your hives are ready for harvest and optimize yield.
                </p>
                <ul className="space-y-3">
                  {["Real-time weight tracking", "Harvest timing alerts", "Production forecasting", "Yield optimization"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground">
                      <Check className="w-5 h-5 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* From Hive to Cloud to Pocket */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="aspect-square max-w-md mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex items-center justify-center">
                  <Smartphone className="w-48 h-48 text-primary/60" />
                </div>
                <div className="absolute top-4 right-4 bg-card p-4 rounded-xl shadow-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-foreground">Live</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                Mobile Platform
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                From the Hive, to the Cloud, to Your Pocket
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                You're a professional and you need professional tools. The data from the hives that feeds the BeeYield app on your phone is available 24/7 so you can monitor every aspect of hive health.
              </p>
              <p className="text-muted-foreground mb-8">
                It provides actionable insights, including the exact location of your hives year-round. Only BeeYield gives you this level of visibility combined with actionable solutions to the everyday issues you face as a beekeeper.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">All Features You Need</h4>
                    <p className="text-sm text-muted-foreground">Treatments, feedings, visit history, and split information.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Increase Hive Strength</h4>
                    <p className="text-sm text-muted-foreground">Reduce mortality rates and lower operational overhead.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Streamline Tasks</h4>
                    <p className="text-sm text-muted-foreground">Improve team management for greater efficiency.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Alert System</h4>
                    <p className="text-sm text-muted-foreground">Get notified when hives need attention.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hive Placement & Management */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/20 text-accent-foreground border-accent/30">
              Strategic Deployment
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Hive Placement & Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Optimal hive placement is critical for pollination success. Our data-driven approach ensures maximum coverage and efficiency.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Strategic Positioning</h3>
                <p className="text-muted-foreground mb-4">
                  We analyze your orchard layout, crop type, and environmental factors to determine optimal hive placement for maximum pollination coverage.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    GPS-mapped placement
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Coverage optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Terrain analysis
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Frames-Per-Acre Model</h3>
                <p className="text-muted-foreground mb-4">
                  Our proprietary model calculates the exact number of frames needed per acre, ensuring you're not over or under-deploying resources.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Custom stocking rates
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Crop-specific recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Seasonal adjustments
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6">
                  <Activity className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Continuous Monitoring</h3>
                <p className="text-muted-foreground mb-4">
                  Track hive performance throughout the pollination season with real-time dashboards and automated alerts for any issues.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Live health metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Automated alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Performance reports
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Training Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                Capacity Building
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Beekeeper Training & Support
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We believe in empowering beekeepers with the knowledge and skills they need to succeed. Our comprehensive training programs cover everything from basic hive management to advanced pollination techniques.
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Hands-On Workshops</h4>
                    <p className="text-muted-foreground">
                      Practical training sessions at our apiaries covering hive inspection, disease detection, and colony management.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Technology Training</h4>
                    <p className="text-muted-foreground">
                      Learn to use our sensor technology, mobile app, and data analytics platform to optimize your operations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Ongoing Support</h4>
                    <p className="text-muted-foreground">
                      Our customer success team is always available to help you troubleshoot issues and optimize your beekeeping practice.
                    </p>
                  </div>
                </div>
              </div>

              <Button asChild>
                <Link to="/contact">
                  Join Our Training Program <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=800" 
                  alt="Beekeeper training" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-xl shadow-lg border border-border">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">20+</p>
                  <p className="text-sm text-muted-foreground">Trained Beekeepers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Partner With BeeYield */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              Partnership Benefits
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Why Partner With BeeYield?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We believe beekeepers deserve more than just a contract. They deserve a partner invested in their success. Join a network where technology meets tradition.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <Card className="border-2 border-primary/20 bg-card">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Your Hives, Your Rewards
                </h3>
                <p className="text-muted-foreground mb-6">
                  Every colony is unique, and we recognize that. Our smart monitoring technology grades each hive individually, ensuring you're compensated fairly for the colonies you've worked hard to nurture.
                </p>
                <p className="text-muted-foreground mb-6">
                  No more flat-rate contracts that undervalue your best performers. With BeeYield, stronger hives mean better returns. It's that simple.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-primary">Real-Time</p>
                    <p className="text-sm text-muted-foreground">Hive Health Data</p>
                  </div>
                  <div className="bg-accent/10 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-accent-foreground">Fair</p>
                    <p className="text-sm text-muted-foreground">Performance-Based Pay</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Your Success Is Our Mission
              </h3>
              <p className="text-muted-foreground mb-6">
                From the moment you join, our dedicated team walks alongside you. Whether it's integrating our sensors, interpreting colony data, or connecting you with new opportunities, we're here every step of the way.
              </p>
              <div className="bg-card rounded-xl p-6 border border-border mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Dedicated Support Team</p>
                    <p className="text-sm text-muted-foreground">Your partners in beekeeping success</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Have questions or ready to get started? Reach out anytime: <span className="text-primary font-medium">info@beeyield.com</span>
                </p>
              </div>
              <Button asChild>
                <Link to="/contact">
                  Become a Partner <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Platform Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              The BeeYield Platform
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Better Together
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              While powerful individually, our In-Hive and In-Land solutions work best in tandem, providing a complete feedback loop for growers and beekeepers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Monitor</h3>
              <p className="text-muted-foreground">Track hive health and field conditions simultaneously.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Analyze</h3>
              <p className="text-muted-foreground">Correlate colony strength with yield outcomes using AI models.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Sprout className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Optimize</h3>
              <p className="text-muted-foreground">Make data-driven decisions to boost crop yield and bee welfare.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hear What Our Beekeepers Have to Say */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Hear What Our Beekeepers Have to Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from beekeepers who have partnered with BeeYield.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Video 1 */}
            <div className="rounded-2xl overflow-hidden shadow-lg bg-card">
              <div className="aspect-video">
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/VIDEO_ID_1" 
                  title="Beekeeper Testimonial 1"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground">Partner Beekeeper Story</h3>
                <p className="text-sm text-muted-foreground">How BeeYield transformed our operations</p>
              </div>
            </div>

            {/* Video 2 */}
            <div className="rounded-2xl overflow-hidden shadow-lg bg-card">
              <div className="aspect-video">
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/VIDEO_ID_2" 
                  title="Beekeeper Testimonial 2"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground">Success with BeeYield</h3>
                <p className="text-sm text-muted-foreground">Improved colony health and profitability</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Pollinating with Precision Today
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join the growing network of beekeepers and growers using BeeYield technology.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link to="/pollination-request">
                Request Pollination Services
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-green-500 hover:bg-green-600 text-white">
              <Link to="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default PollinationSolutions;
