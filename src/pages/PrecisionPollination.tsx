import { useState } from "react";
import { 
  Cpu, Wifi, LayoutDashboard, ArrowRight, 
  Quote, Check, BookOpen, Mail, ChevronRight,
  BarChart3, Thermometer, Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PrecisionPollination = () => {
  return (
      <div className="pt-8">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-br from-secondary via-background to-primary/10 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                  In-Hive Technology
                </Badge>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
                  Precision Pollination
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  Accountability. Actionable data. <br/>
                  And a guarantee of the strongest bees available.
                </p>
                <Button size="lg" className="shadow-lg">
                  Get a Free Consultation
                </Button>
              </div>

              <div className="relative">
                {/* Hero Image / Graphic Placeholder */}
                <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center relative shadow-xl">
                  <Cpu className="h-32 w-32 text-primary opacity-60" />
                  <div className="absolute -bottom-4 -right-4 bg-background rounded-xl shadow-lg p-4 border border-border">
                     <div className="flex items-center gap-2">
                       <p className="text-sm font-bold text-foreground">Live Monitoring Active</p>
                       <div className="flex items-center gap-1 text-xs text-green-600">
                         <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                         System Online
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

        {/* What Is Precision Pollination + Quote */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-4xl font-bold mb-6 text-foreground">What is Precision Pollination?</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Precision Pollination is a groundbreaking, innovative approach to the critical process of managed pollination in commercial crop growing. Growers whose crops rely on commercial beekeepers for their annual pollination can now, for the first time, get visibility and accountability for their pollination experience.
                </p>
              </div>

              <div className="bg-secondary/50 p-8 rounded-2xl border-l-4 border-primary">
                <Quote className="h-10 w-10 text-primary mb-4 opacity-50" />
                <p className="text-lg text-foreground italic leading-relaxed mb-6">
                  "Our commitment to our growers is to bring them unprecedented transparency for the most effective pollination outcomes."
                </p>
                <div>
                  <p className="font-bold text-foreground">Ze'ev Barylka</p>
                  <p className="text-sm text-muted-foreground">BeeYield Chief Sales and Marketing Officer</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Breakdown (Sensor & Gateway) */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Sensor Card */}
              <div className="bg-background rounded-2xl shadow-lg p-8 border border-border hover:shadow-xl transition-shadow">
                <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">In-Hive Sensor</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  BeeYield hives are equipped with small IoT (Internet of Things) sensors. They capture key metrics from the colony, including temperature, humidity, light levels, location, hive orientation, and most importantly, the acoustic signature of the hive. The sensors communicate with the Gateway, which is attached to the outside of the hive.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary">
                  Read More <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              {/* Gateway Card */}
              <div className="bg-background rounded-2xl shadow-lg p-8 border border-border hover:shadow-xl transition-shadow">
                <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Wifi className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Gateway</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  One Gateway (think of it as a modem) is attached to the exterior of one of the hives. The sensors communicate with the Gateway via a low energy Bluetooth™ connection. The Gateway then transfers the data to the cloud for analysis.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary">
                  Read More <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
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
                      <span className="font-bold text-foreground">Interactive Dashboard Preview</span>
                    </div>
                    {/* Fake Graphs */}
                    <div className="grid grid-cols-3 gap-4 h-32">
                       <div className="bg-gradient-to-t from-primary/20 to-transparent rounded-lg" />
                       <div className="bg-gradient-to-t from-primary/30 to-transparent rounded-lg" />
                       <div className="bg-gradient-to-t from-primary/10 to-transparent rounded-lg" />
                    </div>
                  </div>
                </div>
                {/* Floating Metric Badge */}
                <div className="absolute -bottom-6 -right-6 bg-background rounded-xl shadow-lg p-4 border border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Thermometer className="h-4 w-4 text-primary" />
                    Optimal Temp
                  </div>
                  <p className="text-2xl font-bold text-foreground">35.4°C</p>
                </div>
              </div>

              <div>
                <Badge variant="secondary" className="mb-4">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Full Visibility
                </Badge>
                <h2 className="text-4xl font-bold mb-6 text-foreground">Easy-to-Understand Dashboard</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All the key metrics for each orchard, from the day the bees are delivered until the day the beekeepers remove them, are displayed on the dashboard.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  These include the current frames-per-acre count of the orchards, along with bee activity, flight time, location and temperature for drop points, and more, giving growers complete confidence that they are getting the pollination they have paid for.
                </p>
                <ul className="space-y-3">
                  {["Frames-per-acre count", "Bee activity & flight time", "GPS Location & Temperature"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" /> <span className="font-medium text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* The BeeYield Difference */}
        <section className="py-20 bg-primary text-primary-foreground">
           <div className="container mx-auto px-4 text-center max-w-4xl">
            <h2 className="text-4xl font-bold mb-4">The BeeYield Difference</h2>
            <p className="text-xl opacity-90 mb-12 italic">
              "Knowledge is power. Data is even better."
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-primary-foreground/10 p-6 rounded-xl backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-3">Precision Calculation</h3>
                <p className="opacity-90 leading-relaxed">
                  Knowing the exact strength of every hive in your field means pollination can be calculated using a frames-per-acre model for a far more precise outcome.
                </p>
              </div>
              <div className="bg-primary-foreground/10 p-6 rounded-xl backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-3">Financial Prudence</h3>
                <p className="opacity-90 leading-relaxed">
                  It's accurate, efficient, and financially prudent. You stop paying for "boxes" and start paying for actual pollination power.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Visibility Section */}
        <section className="py-20 bg-muted/30 text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-4xl font-bold mb-2 text-foreground">Do You Know What's in the Box?</h2>
            <p className="text-4xl font-bold text-primary mb-8">We do.</p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              When you pollinate with BeeYield you get complete visibility into the hives deployed in your orchards. We are accountable to you to bring the precise number of bees needed for optimal pollination outcomes. We replace any non-performing hives with stronger, more effective colonies.
            </p>
          </div>
        </section>

        {/* Education Download */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto bg-secondary/30 p-8 md:p-12 rounded-3xl">
              <div>
                 <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                    <BookOpen className="h-7 w-7 text-primary" />
                  </div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">How Much Should You Know About Bees?</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Your call, of course. But you should know enough to speak your beekeepers language. For example, did you know that bee math is different from regular math?
                </p>
                <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary mb-6">
                  <p className="text-sm text-foreground">
                    💡 2x8 does not equal sixteen when it comes to bee frames. A sixteen frame hive actually has 30% more foraging force than that of two 8 framers.
                  </p>
                </div>
                <p className="text-muted-foreground mb-6">
                  Download our free guide to understand bees and how to get the most from them during pollination.
                </p>
                <Button className="gap-2">
                  Download Guide <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-center">
                 <div className="bg-background rounded-xl shadow-xl p-6 transform rotate-3 hover:rotate-0 transition-transform">
                   <div className="w-48 h-64 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex flex-col items-center justify-center text-primary-foreground p-4 text-center">
                     <p className="text-xs font-bold uppercase tracking-wider opacity-80">Bee Math</p>
                     <p className="text-lg font-bold mt-2">The Grower's Guide to Precision Pollination</p>
                     <p className="text-4xl mt-4">🐝</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Success */}
        <section className="py-20 bg-muted/30">
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
                  <Button variant="outline" className="gap-2">
                    <Mail className="h-4 w-4" /> Email Us: info@beeyield.com
                  </Button>
               </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-background text-center">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Ready to work with us?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Fill in some basic information - just your name and the best way to contact you and we'll be in touch shortly.
            </p>
            <Button size="lg">
              Contact Us Today
            </Button>
          </div>
        </section>
      </div>
  );
};

export default PrecisionPollination;
