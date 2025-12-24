import { Database, TrendingUp, Check, Heart, Sprout, Globe, Wind, Sun, ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";

const ESG = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <section className="bg-secondary/30 py-20 border-b border-border">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <Badge className="mb-6 bg-background border border-primary/20 text-primary hover:bg-background">
              Corporate Responsibility
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
              Our ESG Commitment
            </h1>
            <p className="text-2xl text-muted-foreground leading-relaxed">
              We're committed to addressing pressing global sustainability challenges through our precision pollination technology.
            </p>
          </div>
        </section>

        {/* Key Stats Section */}
        <section className="py-12 -mt-10 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-xl border-none bg-primary text-primary-foreground">
                <CardContent className="flex flex-col items-center text-center p-8">
                  <Heart className="h-8 w-8 mb-4 opacity-80" />
                  <div className="text-4xl font-bold mb-2">2M+</div>
                  <div className="text-sm font-medium opacity-90 uppercase tracking-wider">Bees Saved</div>
                </CardContent>
              </Card>
              <Card className="shadow-xl border-none bg-card">
                <CardContent className="flex flex-col items-center text-center p-8">
                  <Wind className="h-8 w-8 mb-4 text-primary" />
                  <div className="text-4xl font-bold mb-2 text-foreground">3000</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tons CO2 Avoided</div>
                </CardContent>
              </Card>
              <Card className="shadow-xl border-none bg-card">
                <CardContent className="flex flex-col items-center text-center p-8">
                  <TrendingUp className="h-8 w-8 mb-4 text-primary" />
                  <div className="text-4xl font-bold mb-2 text-foreground">240%</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Increase in Coverage</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Intro Narrative */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-foreground">Unveiling Our Impact</h2>
            <div className="prose prose-lg text-muted-foreground">
              <p className="mb-6">
                What started as a passion project during the pandemic has transformed into a critical agricultural solution. In June 2024, BeeYield released impact data confirming that our aim to secure the future of food is working. The report details how our expansion—now protecting the ecosystem through 1,500+ planted trees and managed colonies—is actively reducing emissions and safeguarding the biodiversity essential for our planet.
              </p>
              <p>
                Our work goes beyond agriculture; it is an act of ecosystem guardianship. By optimizing colony health and minimizing our carbon footprint, we are driving progress toward the UN Sustainable Development Goals (SDGs) necessary to safeguard our food systems.
              </p>
            </div>
          </div>
        </section>

        {/* SDG Details */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid gap-16 max-w-5xl mx-auto">
              
              {/* SDG 15 - Life on Land */}
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Sprout className="h-6 w-6 text-green-700" />
                      </div>
                      <h3 className="text-xl font-bold text-green-800">SDG 15: Life on Land</h3>
                    </div>
                    <h4 className="text-2xl font-bold mb-4 text-foreground">Protecting Biodiversity</h4>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Beyond monitoring colony health, our holistic approach actively regenerates the environment. By planting over 1,500 trees and saving over 2 million bees, we create a resilient ecosystem that does double duty: reversing biodiversity loss while delivering the high-quality pollination essential for improving crop yields.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Check className="h-4 w-4 text-primary" /> Fewer colonies lost
                      </li>
                      <li className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Check className="h-4 w-4 text-primary" /> Stronger hives require fewer resources
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800" 
                    alt="Biodiversity" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* SDG 2 - Zero Hunger */}
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="order-2 md:order-1 relative h-full min-h-[300px] rounded-2xl overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1625246333195-58197bd47d26?auto=format&fit=crop&q=80&w=800" 
                    alt="Crop Field" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <Card className="order-1 md:order-2 border-none shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-amber-100 p-3 rounded-lg">
                        <Sun className="h-6 w-6 text-amber-700" />
                      </div>
                      <h3 className="text-xl font-bold text-amber-800">SDG 2: Zero Hunger</h3>
                    </div>
                    <h4 className="text-2xl font-bold mb-4 text-foreground">Food Security & Yield</h4>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Our operations have scaled to meet the challenge of food security. As of 2025, we have pollinated 25 acres and expanded our green footprint by planting 1,500+ trees. This commitment to 'Precision Pollination' has not only improved local yields but also delivered over 883kg of traceable honey, creating a model for sustainable growth.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Almonds", "Apples", "Cherries", "Blueberries", "Rapeseed"].map(crop => (
                        <Badge key={crop} variant="secondary">{crop}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SDG 13 - Climate Change */}
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Globe className="h-6 w-6 text-blue-700" />
                      </div>
                      <h3 className="text-xl font-bold text-blue-800">SDG 13: Climate Change</h3>
                    </div>
                    <h4 className="text-2xl font-bold mb-4 text-foreground">Reducing Emissions</h4>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Our technology redefines efficiency by utilizing our proprietary Hives Per Acre and Frames Per Acre model. By deploying fewer, stronger colonies with verified frame density, we minimize transportation needs and maximize impact. In 2025, this precision approach—combined with planting 1,500+ trees—significantly reduced our carbon footprint while boosting pollination success.
                    </p>
                    <Button variant="outline" className="w-full justify-between group">
                      Read Climate Report <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
                <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" 
                    alt="Clean Air Mountains" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CEO Quote */}
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <Quote className="h-12 w-12 mx-auto mb-8 opacity-50" />
            <blockquote className="text-2xl md:text-4xl font-bold leading-tight mb-10">
              BeeYield is dedicated to securing the future of food by addressing the most pressing gap in agriculture today. Our findings highlight the critical role of precision apiculture in stabilizing food security, lowering carbon footprints, and ensuring that our planet's biodiversity thrives alongside our farms.
            </blockquote>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-primary-foreground/20 rounded-full mb-4"></div>
              <cite className="not-italic font-bold text-lg">Timothy Nduva</cite>
              <span className="opacity-80">CEO & Founder, BeeYield</span>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-20 bg-background text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Join Us in Creating a Sustainable Future</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore our full Environmental, Social, and Governance data to see how we are making a difference.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg">Read More</Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ESG;
