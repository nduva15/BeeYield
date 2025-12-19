import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Cpu, Sprout, ArrowRight, Check,
  Globe, Flower2, Wheat, MapPin, ChevronDown, Mail
} from "lucide-react";
import { Link } from "react-router-dom";

const CropsWePollinate = () => {
  const crops = [
    {
      name: "Almonds",
      image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600",
      desc: "Almond pollination has specific challenges as it is the earliest crop to bloom. With BeeYield's In-Hive Precision Pollination solution and In-Field Pollination Insight Platform, growers have insight into the strength of every colony that is delivered for pollination combined with real-time monitoring of colony activity throughout the bloom period."
    },
    {
      name: "Apples",
      image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&q=80&w=600",
      desc: "In 2023, BeeYield collaborated with four orchards in Washington State’s Yakima Valley to gather data during the apple bloom. Our In-Field Pollination Insight Platform captured data on how growers can use hive removal timing to reduce thinning expenses."
    },
    {
      name: "Avocados",
      image: "https://images.unsplash.com/photo-1523049673856-388669a9092d?auto=format&fit=crop&q=80&w=600",
      desc: "Avocado trees require cross-pollination to produce fruit, and honey bees play a crucial role in this process. BeeYield monitors bee activity in real time throughout the pollination period to assess activity at different times of the day, different parts of the orchard, and also in relation to bloom status and weather conditions."
    },
    {
      name: "Blueberries",
      image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&q=80&w=600",
      desc: "Blueberry flowers are generally less attractive to honey bees than other flowers. Bees brought in to perform pollination may be attracted to competing forage which can lead to reduced pollination efficacy. This means, to deliver effective and optimized pollination outcomes, the measurement of flower visitation rates by pollinating bees will be critical."
    },
    {
      name: "Canola Seed",
      image: "https://images.unsplash.com/photo-1499529112042-9553f0724506?auto=format&fit=crop&q=80&w=600",
      desc: "Bee pollination is essential for the production of hybrid canola seeds, which are produced by cross-pollinating two different parental lines. As well as assessing the quality and strength of hives delivered, BeeYield can monitor activity in the field and the amount of cross pollination. This provides invaluable insights for pollination management as well as crop planting and management."
    },
    {
      name: "Onion Seed",
      image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa829?auto=format&fit=crop&q=80&w=600",
      desc: "To set seed, honey bees need to move pollen between male and female plants. They tend to find the male lines more attractive and have a tendency to move up and down rows instead of crossing between the lines. We can help producers estimate the optimum pollination input for different varietal combinations, planting densities and male/female row configurations."
    },
    {
      name: "Carrot Seed",
      image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=600",
      desc: "Carrot flowers produce less nectar and have less protein-rich pollen than other plants, so bees may be attracted to competing forage. Our In-Field Pollination Insight Platform provides visibility into the strength and foraging effectiveness of each colony of bees that a grower contracts to ensure the best pollination outcome."
    },
    {
      name: "Cherries",
      image: "https://images.unsplash.com/photo-1528821128474-27f963b0bddb?auto=format&fit=crop&q=80&w=600",
      desc: "Honey bees are a vital component in cross-pollinating a variety of cherry cultivars. With our technology, growers have insight into the strength of every colony that is delivered for pollination combined with real-time monitoring of colony activity throughout the bloom period."
    },
    {
      name: "Raspberries",
      image: "https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?auto=format&fit=crop&q=80&w=600",
      desc: "Raspberries can self-pollinate, but require insect pollination to maximize yield. The effectiveness of pollination affects the size, shape, and quantity of fruit produced. BeeYield can provide growers with assurance that they are getting the most effective pollination outcome possible."
    },
    {
      name: "Cucurbits",
      image: "https://images.unsplash.com/photo-1595123550441-d377e017de2d?auto=format&fit=crop&q=80&w=600",
      desc: "Our In-Field sensor can effectively monitor pollination in Cucurbit crops by tracking bee activity between male and female plants. With a pollination window as short as 4 hours, it's vital to know that there is sufficient bee activity happening at the right time."
    },
    {
      name: "Macadamia",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600",
      desc: "Macadamia trees require cross-pollination to produce fruit, and honey bees play a crucial role in this process along with other native pollinators. Little research has been done in Macadamia pollination and the use of BeeYield's technology suite will greatly enhance the understanding and requirements of this crop."
    }
  ];

  return (
    <div className="min-h-screen py-20">
          {/* Hero Section */}
          <section className="relative py-24 bg-gradient-to-br from-secondary/50 via-white to-primary/5">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2 space-y-8">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Precision Agriculture
                  </Badge>
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                    Get Data-Driven <br/>
                    <span className="text-gradient">Crop Pollination</span>
                  </h1>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                    Our end-to-end solution gives unprecedented control and visibility into pollination, ensuring higher yields and sustainable practices.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button size="lg" className="shadow-elegant">
                      Get a Free Consultation
                    </Button>
                    <Button size="lg" variant="outline">
                      Explore Crops
                    </Button>
                  </div>
                </div>
                
                <div className="md:w-1/2 grid grid-cols-3 gap-3">
                  {/* Decorative grid of crop images */}
                  <img src={crops[0].image} className="rounded-2xl shadow-lg w-full h-48 object-cover translate-y-8" alt="" />
                  <img src={crops[1].image} className="rounded-2xl shadow-lg w-full h-48 object-cover" alt="" />
                  <img src={crops[3].image} className="rounded-2xl shadow-lg w-full h-48 object-cover translate-y-12" alt="" />
                </div>
              </div>
            </div>
          </section>

          {/* Expert Section */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4 text-center max-w-4xl">
              <h2 className="text-3xl font-bold mb-6">Work With the Pollination Experts</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-8" />
              <p className="text-lg text-muted-foreground leading-relaxed mb-12">
                BeeYield is comprised of leading experts in the field of pollination. Bee biologists and researchers, data-science experts, electrical engineers, leading agronomists, and veteran beekeepers make up our team, and all are committed to creating improved pollination outcomes for our customers.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6 bg-secondary rounded-xl">
                  <div className="text-4xl font-bold text-primary mb-2">200K+</div>
                  <div className="text-sm font-bold uppercase tracking-wide text-secondary-foreground">Acres Managed</div>
                </div>
                <div className="p-6 bg-secondary rounded-xl">
                  <div className="text-4xl font-bold text-primary mb-2">7</div>
                  <div className="text-sm font-bold uppercase tracking-wide text-secondary-foreground">Countries</div>
                </div>
                <div className="p-6 bg-secondary rounded-xl">
                  <div className="text-4xl font-bold text-primary mb-2">10+</div>
                  <div className="text-sm font-bold uppercase tracking-wide text-secondary-foreground">Crop Varieties</div>
                </div>
              </div>
            </div>
          </section>

          {/* Crops Grid */}
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-2 justify-center mb-16">
                {crops.map((c, i) => (
                  <Badge key={i} variant="secondary" className="text-sm px-4 py-2 cursor-default">
                    {c.name}
                  </Badge>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {crops.map((crop, index) => (
                  <Card key={index} className="border-none shadow-soft hover:shadow-elegant transition-all duration-300 group bg-white overflow-hidden flex flex-col h-full">
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={crop.image} 
                        alt={crop.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                        <h3 className="text-2xl font-bold text-white">{crop.name}</h3>
                      </div>
                    </div>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                        {crop.desc}
                      </p>
                      <div className="pt-4 border-t border-border/50">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                          View Case Study <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Missing Crop CTA */}
          <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
             {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
               <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
               </svg>
            </div>
            
            <div className="container mx-auto px-4 text-center relative z-10 max-w-3xl">
              <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <Flower2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Don't See Your Crop?</h2>
              <p className="text-xl opacity-90 mb-10 leading-relaxed">
                If your crop relies on bees for pollination, we would love to talk to see how we can improve your pollination. Whether through optimized placement, more precise timing of bee removal, or simply more efficient and cost-effective outcomes.
              </p>
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 font-bold text-lg h-14 px-8 shadow-xl">
                <Mail className="h-5 w-5" /> Email Our Customer Success Team
              </Button>
            </div>
          </section>
    </div>
  );
};

export default CropsWePollinate;