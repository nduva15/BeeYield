import { ArrowRight, Target, Wheat, TreePine, Heart, Users, Droplets, Zap, Building, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const CommitmentPage = () => {
  const sdgs = [
    {
      number: 1,
      title: "No Poverty",
      description: "We provide training programs and a sustainable platform for smallholder farmers and youth to earn income through beekeeping, hive management, and pollination services.",
      impact: "50+ farmers trained with income-generating hives",
      color: "bg-red-500",
      icon: Users,
    },
    {
      number: 2,
      title: "Zero Hunger",
      description: "75% of food crops rely on pollinators. Our pollination services directly boost agricultural yields, ensuring food security for communities across Africa.",
      impact: "25 acres pollinated, increasing crop yields by up to 40%",
      color: "bg-amber-500",
      icon: Wheat,
    },
    {
      number: 6,
      title: "Clean Water & Sanitation",
      description: "Healthy ecosystems protect water sources. Our tree planting initiatives restore watersheds and protect water quality for rural communities.",
      impact: "2,500+ trees protecting local water catchments",
      color: "bg-cyan-500",
      icon: Droplets,
    },
    {
      number: 7,
      title: "Affordable & Clean Energy",
      description: "We're exploring solar-powered hive monitoring systems, reducing reliance on fossil fuels while enabling precision beekeeping in off-grid areas.",
      impact: "Solar-powered IoT sensors in development",
      color: "bg-yellow-500",
      icon: Zap,
    },
    {
      number: 8,
      title: "Decent Work & Economic Growth",
      description: "Our platform creates dignified employment opportunities in rural areas, empowering beekeepers with fair compensation and market access.",
      impact: "Creating sustainable livelihoods for rural youth",
      color: "bg-rose-600",
      icon: Building,
    },
    {
      number: 13,
      title: "Climate Action",
      description: "We've planted 2,500+ trees to restore habitats and capture carbon. Our sustainable practices promote biodiversity and build climate resilience.",
      impact: "Estimated 30+ tons CO₂ captured annually",
      color: "bg-green-600",
      icon: Globe,
    },
    {
      number: 15,
      title: "Life on Land",
      description: "Reducing bee mortality rates and protecting wild pollinators ensures healthy terrestrial ecosystems. We maintain less than 15% colony loss rate vs. 40% global average.",
      impact: "184 healthy hives across 5-acre restored habitat",
      color: "bg-lime-500",
      icon: TreePine,
    },
    {
      number: 17,
      title: "Partnerships for the Goals",
      description: "We collaborate with universities, research institutions, and agricultural partners to scale our impact and share knowledge across borders.",
      impact: "Partnerships with Strathmore University & local farmers",
      color: "bg-blue-800",
      icon: Heart,
    },
  ];

  return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32">
          <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-8 bg-primary/10 text-primary border-none hover:bg-primary/20">
                United Nations Sustainable Development Goals
              </Badge>
              <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl tracking-tight text-foreground">
                Our SDG <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Commitment</span>
              </h1>
              <p className="mb-10 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                BeeYield's work directly contributes to 8 Sustainable Development Goals, creating lasting impact for communities, ecosystems, and global food security.
              </p>
            </div>
          </div>
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -z-10 opacity-60"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl -z-10 opacity-60"></div>
        </section>

        {/* SDG Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sdgs.map((sdg) => (
                <Card key={sdg.number} className="border-none shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                  <div className={`${sdg.color} h-2 group-hover:h-3 transition-all`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`${sdg.color} text-white w-14 h-14 rounded-lg flex items-center justify-center font-bold text-2xl shrink-0`}>
                        {sdg.number}
                      </div>
                      <div className={`${sdg.color}/10 p-2 rounded-lg`}>
                        <sdg.icon className={`h-6 w-6 ${sdg.color.replace('bg-', 'text-')}`} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">{sdg.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {sdg.description}
                    </p>
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Our Impact</p>
                      <p className="text-sm text-foreground font-medium">{sdg.impact}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-foreground text-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Join Us in Creating Impact</h2>
            <p className="text-xl text-background/80 max-w-2xl mx-auto mb-10">
              Whether you're a farmer, investor, or sustainability advocate, there's a place for you in our mission to save bees and secure food systems.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/">
                <Button size="lg" variant="secondary">
                  Our Solutions <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Link back to Impact */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <Link to="/impact">
              <Button variant="ghost" size="lg">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to Impact
              </Button>
            </Link>
          </div>
        </section>
      </div>
  );
};

export default CommitmentPage;
