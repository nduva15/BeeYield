import { Database, TrendingUp, Shield, Heart, Sprout, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";

const Commitment = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32">
          <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-8 bg-primary/10 text-primary border-none hover:bg-primary/20">
                Global Impact Report
              </Badge>
              <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl tracking-tight text-foreground">
                75% of Food Crops <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Rely on Bees</span>
              </h1>
              <p className="mb-10 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                BeeYield is dedicated to acting as an ecosystem guardian, prioritizing the welfare of pollinators to actively secure the future of our food systems.
              </p>
            </div>
          </div>
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -z-10 opacity-60"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl -z-10 opacity-60"></div>
        </section>

        {/* Our Commitment / What's in a Name */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div>
                <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold tracking-wider uppercase text-sm">
                  <Heart className="h-4 w-4" />
                  Our Commitment
                </div>
                <h2 className="text-4xl font-bold mb-6 text-foreground">What about Our Name?</h2>
                <div className="prose prose-lg text-muted-foreground">
                  <p className="mb-4">
                    In our case, our name defines our entire philosophy. BeeYield. It bridges the gap between the health of the colony and the success of the harvest. We are the supporters of the pollinator, the advocates for the ecosystem, and the champions of your yield.
                  </p>
                  <p>
                    From the very beginning, our name has been our compass. BeeYield. It defines the simple but critical equation for our survival: without the bee, there is no yield. It serves as a daily reminder that these aren't just unsung heroes—they are the engines of agriculture that power our entire food ecosystem.
                  </p>
                </div>
              </div>
              <div className="grid gap-6">
                <img 
                  src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800" 
                  alt="Beekeeper holding frame" 
                  className="rounded-2xl shadow-xl object-cover h-[400px] w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Healthy Hive Index Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-foreground">Enter the Healthy Hive Index</h2>
              <p className="text-xl text-muted-foreground">
                We have developed data-driven tools that measure the impact of bee-friendly orchards on the overall welfare of bees.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-card">
                <CardContent className="p-8">
                  <div className="mb-6 bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">Unprecedented Visibility</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Tracking colony health during pollination requires visibility into these colonies on an unprecedented scale. Only BeeYield has the volume of aggregated data to achieve this. By analyzing hive data derived from all of our monitored colonies, we have developed a scientific model to create reports that help growers fulfill their sustainability goals.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-card">
                <CardContent className="p-8">
                  <div className="mb-6 bg-accent w-12 h-12 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">And it's Good for Business</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These personalized bee health reports and certificates help crop producers benefit from the wave of consumer demand for ethically sourced food ingredients. This can be a powerful market differentiator and can translate directly into an advantage when working with other supply chain stakeholders.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Impact Stat */}
        <section className="py-24 bg-foreground text-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-block mb-4">
              <Badge variant="outline" className="border-background/20 text-background hover:bg-background/10">
                Global Impact Since 2020
              </Badge>
            </div>
            <h2 className="text-[80px] md:text-[120px] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4">
              629 M+
            </h2>
            <p className="text-2xl md:text-3xl font-medium tracking-wide text-background/90">
              BEES SAVED AND PROTECTED
            </p>
          </div>
        </section>

        {/* Wild Pollinators */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <img 
                  src="https://images.unsplash.com/photo-1470753937643-efeb931202a9?auto=format&fit=crop&q=80&w=800" 
                  alt="Wildflower meadow" 
                  className="rounded-2xl shadow-xl object-cover h-[500px] w-full"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold tracking-wider uppercase text-sm">
                  <Sprout className="h-4 w-4" />
                  Biodiversity
                </div>
                <h2 className="text-4xl font-bold mb-6 leading-tight text-foreground">
                  Healthy Ecosystems Require Stable Wild Pollinator Populations
                </h2>
                <div className="prose prose-lg text-muted-foreground mb-8">
                  <p className="mb-4">
                    Across the spectrum, wild pollinators including wasps, flies, and beetles, many solitary bee species, moths and butterflies, are all under pressure. Habitat loss, fossil fuel-based agricultural inputs and other drivers all contribute to population decline.
                  </p>
                  <p>
                    Only by accurately tracking population levels can conservation work be effective. BeeYield's acoustic detection technology can greatly improve the accuracy of species monitoring.
                  </p>
                </div>
                <Button variant="outline" size="lg">
                  Learn About Our Tech
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ESG Commitment */}
        <section className="py-24 bg-gradient-to-br from-secondary to-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <Card className="border-none shadow-xl bg-card overflow-hidden">
              <div className="grid md:grid-cols-5">
                <div className="md:col-span-3 p-10 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-6 text-primary font-bold">
                    <Globe className="h-5 w-5" />
                    <span>Corporate Responsibility</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-6 text-foreground">Our ESG Commitment</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    ESG (Environmental, Social and Governance) practices are an increasingly important component of corporate responsibility and reputation. BeeYield fulfills its obligations in several demonstrable ways, ensuring transparency and sustainable growth.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button size="lg">
                      Read More
                    </Button>
                    <Button variant="outline" size="lg">
                      View 2024 Report
                    </Button>
                  </div>
                </div>
                <div className="md:col-span-2 bg-primary/5 flex items-center justify-center p-10">
                  <div className="grid gap-4 w-full">
                    {[
                      { label: "Environmental", icon: Sprout },
                      { label: "Social", icon: Users },
                      { label: "Governance", icon: Shield }
                    ].map((item, i) => (
                      <div key={i} className="bg-card p-4 rounded-xl shadow-sm flex items-center gap-4 border border-border/50">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-bold text-foreground">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Commitment;
