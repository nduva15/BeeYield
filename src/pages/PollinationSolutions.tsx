import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Activity, Sprout, BarChart3,
  Cpu, Wifi, Check, Shield, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PollinationSolutions = () => {
  return (
    <div className="pt-8">
      {/* Hub Hero */}
      <section className="relative py-24 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            End-to-End Visibility
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-foreground">
            Pollination Solutions
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mb-10">
            We combine biological understanding with technological innovation to monitor pollination from the inside out.
          </p>
        </div>
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      </section>

      {/* The Two Paths Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">

            {/* Path 1: In-Hive */}
            <div className="relative group rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              <div className="p-8 md:p-12 flex flex-col h-full bg-card relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Cpu className="h-8 w-8 text-primary" />
                </div>

                <h2 className="text-3xl font-bold mb-4 text-foreground">In-Hive Precision</h2>
                <p className="text-lg text-muted-foreground mb-8 flex-grow">
                  Our proprietary sensors live inside the hive box, monitoring acoustic signatures, temperature, and humidity 24/7. Know the strength of your colonies before they are deployed.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-foreground">Queen health status</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-foreground">Colony strength grading</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-foreground">Environmental stress alerts</span>
                  </div>
                </div>

                <Button size="lg" className="w-full gap-2" asChild>
                  <Link to="/precision-pollination">Explore In-Hive Technology <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>

              {/* Background Image Overlay */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                <img
                  src="https://images.unsplash.com/photo-1520500201882-e3d8f804562e?auto=format&fit=crop&q=80&w=800"
                  className="w-full h-full object-cover"
                  alt="Hive bg"
                />
              </div>
            </div>

            {/* Path 2: In-Field */}
            <div className="relative group rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-2 bg-accent-foreground"></div>
              <div className="p-8 md:p-12 flex flex-col h-full bg-card relative z-10">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Wifi className="h-8 w-8 text-accent-foreground" />
                </div>

                <h2 className="text-3xl font-bold mb-4 text-foreground">In-Field Insights</h2>
                <p className="text-lg text-muted-foreground mb-8 flex-grow">
                  Sensors deployed across your orchards measure actual bee flight activity and pollination events. Visualize coverage maps to ensure every acre gets the attention it needs.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-foreground">Real-time pollination maps</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-foreground">Foraging efficiency tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-foreground">Weather impact analysis</span>
                  </div>
                </div>

                <Button size="lg" variant="outline" className="w-full gap-2 border-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground hover:text-background" asChild>
                  <Link to="/in-land-pollination">Explore In-Field Technology <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>

              {/* Background Image Overlay */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                <img
                  src="https://images.unsplash.com/photo-1621252179027-94459d27d3ee?auto=format&fit=crop&q=80&w=800"
                  className="w-full h-full object-cover"
                  alt="Field bg"
                />
              </div>
            </div>

            {/* Path 3: Disease & Health */}
            <div className="relative group rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
              <div className="p-8 md:p-12 flex flex-col h-full bg-card relative z-10">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-amber-600" />
                </div>

                <h2 className="text-3xl font-bold mb-4 text-foreground">Disease Defense</h2>
                <p className="text-lg text-muted-foreground mb-8 flex-grow">
                  Intelligent protection for your beehives. Detect diseases early and monitor colony health with AI-driven analysis and real-time alerts.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-foreground">Early disease detection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-foreground">Colony health grading</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-foreground">Reduced chemical use</span>
                  </div>
                </div>

                <Button size="lg" variant="outline" className="w-full gap-2 border-amber-500/20 text-amber-600 hover:bg-amber-500 hover:text-white" asChild>
                  <Link to="/diseases">Explore Disease Technology <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>

              {/* Background Image Overlay */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                <img
                  src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800"
                  className="w-full h-full object-cover"
                  alt="Disease bg"
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
                <span className="font-bold text-lg">Intelligent Hives</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-4 bg-background rounded-lg shadow-sm border border-border">
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <span className="font-bold text-lg">ApiSense</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Platform Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-background border border-primary/20 text-primary">
              The BeeYield Platform
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-foreground">Better Together</h2>
            <p className="text-lg text-muted-foreground">
              While powerful individually, our In-Hive and In-Field solutions work best in tandem, providing a complete feedback loop for growers and beekeepers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Monitor</h3>
              <p className="text-muted-foreground">Track hive health and field conditions simultaneously.</p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
              <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Analyze</h3>
              <p className="text-muted-foreground">Correlate colony strength with yield outcomes using AI models.</p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sprout className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Optimize</h3>
              <p className="text-muted-foreground">Make data-driven decisions to boost crop yield and bee welfare.</p>
            </div>
          </div>
        </div>
      </section>
    </div >
  );
};

export default PollinationSolutions;