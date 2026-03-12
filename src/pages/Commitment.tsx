import { ArrowRight, Target, Wheat, TreePine, Heart, Users, Droplets, Zap, Building, Globe, CheckCircle2 } from "lucide-react";
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
      impact: "50+ farmers trained on bee disease prevention & sustainable agriculture",
      color: "from-red-500 to-red-600",
      icon: Users,
    },
    {
      number: 2,
      title: "Zero Hunger",
      description: "75% of food crops rely on pollinators. Our pollination services directly boost agricultural yields, ensuring food security for communities across Africa.",
      impact: "25 acres pollinated, increasing crop yields by up to 40%",
      color: "from-amber-500 to-amber-600",
      icon: Wheat,
    },
    {
      number: 6,
      title: "Clean Water & Sanitation",
      description: "Restoring local biodiversity through tree planting creates resilient ecosystems that naturally filter water and combat climate change, protecting vital water sources.",
      impact: "2,500+ trees restoring biodiversity & climate resilience",
      color: "from-cyan-500 to-cyan-600",
      icon: Droplets,
    },
    {
      number: 7,
      title: "Affordable & Clean Energy",
      description: "We're exploring solar-powered hive monitoring systems, reducing reliance on fossil fuels while enabling precision beekeeping in off-grid areas.",
      impact: "Solar-powered hive monitoring sensors in development",
      color: "from-yellow-500 to-yellow-600",
      icon: Zap,
    },
    {
      number: 8,
      title: "Decent Work & Economic Growth",
      description: "We create dignified work in rural areas: beekeepers get fair pay and a direct market for their honey.",
      impact: "Creating sustainable livelihoods for rural youth",
      color: "from-rose-600 to-rose-700",
      icon: Building,
    },
    {
      number: 13,
      title: "Climate Action",
      description: "We've planted 2,500+ trees to restore habitats and capture carbon. Our sustainable practices promote biodiversity and build climate resilience.",
      impact: "Estimated 30+ tons CO₂ captured annually",
      color: "from-green-600 to-green-700",
      icon: Globe,
    },
    {
      number: 15,
      title: "Life on Land",
      description: "Reducing bee mortality rates and protecting wild pollinators ensures healthy terrestrial ecosystems. We maintain less than 15% colony loss rate vs. 60% global average.",
      impact: "184 healthy hives across 5-acre restored habitat",
      color: "from-lime-500 to-lime-600",
      icon: TreePine,
    },
    {
      number: 17,
      title: "Partnerships for the Goals",
      description: "We collaborate with strategic partners to scale our impact and share knowledge across borders, building a resilient ecosystem for bees and people.",
      impact: "Partnering with Farmers, ApiSense & Technical Hive Partners",
      color: "from-blue-700 to-blue-900",
      icon: Heart,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden z-10">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-8 px-4 py-2 border-primary/20 bg-primary/5 text-primary tracking-widest uppercase font-semibold text-xs rounded-full">
            Sustainable Development Goals
          </Badge>

          <h1 className="mb-8 text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            Our Commitment <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600">
              To The Future
            </span>
          </h1>

          <p className="mb-12 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
            BeeYield's mission extends beyond the hive. We are actively contributing to
            <span className="text-foreground font-bold"> 8 UN Sustainable Development Goals</span>,
            creating measurable impact for communities, ecosystems, and global food security.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/esg">
              <Button size="lg" className="h-14 px-8 rounded-full text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                View ESG Impact <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="lg" className="h-14 px-8 rounded-full text-base font-bold text-muted-foreground hover:text-foreground">
              Scroll to Explore
            </Button>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sdgs.map((sdg) => (
              <Card
                key={sdg.number}
                className="group relative border-none bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 ring-1 ring-border/50 hover:ring-primary/20"
              >
                {/* Gradient Header */}
                <div className={`h-2 w-full bg-gradient-to-r ${sdg.color}`} />

                <CardContent className="p-8">
                  {/* Icon & Number Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${sdg.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                      <span className="text-[#1A1A1A] font-black text-2xl">{sdg.number}</span>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${sdg.color} bg-opacity-10 text-transparent bg-clip-text`}>
                      <sdg.icon className={`h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors`} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                    {sdg.title}
                  </h3>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 min-h-[80px]">
                    {sdg.description}
                  </p>

                  {/* Impact Footer */}
                  <div className="pt-6 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">Impact Delivered</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      {sdg.impact}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center bg-card rounded-[3rem] p-12 md:p-16 shadow-2xl border border-border/50 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10">
              Join The <span className="text-primary">Movement</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto relative z-10">
              Whether you're a farmer, investor, or sustainability advocate—there's a place for you in our mission to save bees and secure food systems.
            </p>

            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <Link to="/learn">
                <Button size="lg" className="h-14 px-10 rounded-full font-bold text-base bg-primary hover:bg-primary/90">
                  Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="h-14 px-10 rounded-full font-bold text-base border-2 hover:bg-muted/50">
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CommitmentPage;
