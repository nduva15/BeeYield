import React, { useState, useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import {
  ArrowRight, Sprout, MapPin, Calendar,
  TrendingUp, Users, Quote, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Media = () => {
  const [activeCrop, setActiveCrop] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // Small delay to ensure render
    }
  }, [location]);

  const caseStudies = [
    {
      id: "maize",
      title: "Maize Pollination",
      category: "Cereal Crop",
      location: "Trans-Nzoia, Kenya",
      description: "Maize, a staple food crop, benefits significantly from bee pollination despite being wind-pollinated. Our targeted hive placement during the critical tasseling phase has demonstrated remarkable improvements in kernel filling and overall yield weight.",
      stats: [
        { label: "Yield Increase", value: "+18%" },
        { label: "Seed Quality", value: "High Grade" },
        { label: "Pollination Period", value: "3 Weeks" }
      ],
      testimonial: {
        quote: "I was skeptical at first because maize is wind-pollinated, but the difference in cob fullness was undeniable. The kernels were packed to the tip.",
        author: "James Mwangi",
        role: "Commercial Maize Farmer",
        location: "Kitale"
      },
      images: [
        "/images/maize_case.png",
        "https://images.unsplash.com/photo-1634467524884-897d0af5e104?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=1200"
      ]
    },
    {
      id: "sunflower",
      title: "Sunflower Production",
      category: "Oilseed Crop",
      location: "Meru, Kenya",
      description: "Sunflowers are heavily dependent on insect pollination. Our precision pollination service ensures distinct male and female rows in hybrid seed production are effectively cross-pollinated, maximizing seed set and oil content.",
      stats: [
        { label: "Oil Content", value: "+25%" },
        { label: "Seed Set", value: "95%" },
        { label: "Hives per Acre", value: "2.5" }
      ],
      testimonial: {
        quote: "The bees were incredibly active. We saw full heads of seeds and higher oil extraction rates than previous seasons.",
        author: "Sarah Kimathi",
        role: "Sunflower Producer",
        location: "Timau"
      },
      images: [
        "/images/sunflower_case.png",
        "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1470509037663-253afd7f0f6e?auto=format&fit=crop&q=80&w=1200"
      ]
    },
    {
      id: "mangoes",
      title: "Mango Exports",
      category: "Fruit Orchard",
      location: "Makueni, Kenya",
      description: "For export-quality mangoes, fruit shape and retention are key. Our bees ensure efficient pollination during the brief flowering window, resulting in better fruit set and reduced early drop.",
      stats: [
        { label: "Fruit Retention", value: "+30%" },
        { label: "Export Grade", value: "Premium" },
        { label: "Harvest Volume", value: "40 Tons" }
      ],
      testimonial: {
        quote: "Our export rejection rate dropped significantly. The fruit uniformity this season was the best we've had in a decade.",
        author: "David Mutua",
        role: "Orchard Manager",
        location: "Wote"
      },
      images: [
        "/images/mango_case.png",
        "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=1200"
      ]
    },
    {
      id: "beans",
      title: "Bean Yields",
      category: "Legumes",
      location: "Nakuru, Kenya",
      description: "While beans are self-pollinating, bee visits 'trip' the flowers, enhancing pollination and ensuring every pod is filled. This results in heavier harvests and uniform pod maturity.",
      stats: [
        { label: "Pod Fill", value: "98%" },
        { label: "Yield/Acre", value: "+22%" },
        { label: "Harvest Time", value: "Uniform" }
      ],
      testimonial: {
        quote: "BeeYield's service helped us achieve a bumper harvest. The pods were consistently full, and we harvested everything at once.",
        author: "Alice Chebet",
        role: "Mixed Crop Farmer",
        location: "Njoro"
      },
      images: [
        "/images/beans_case.png",
        "https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=1200"
      ]
    },
    {
      id: "sisal",
      title: "Sisal Agave",
      category: "Fiber Crop",
      location: "Taita Taveta, Kenya",
      description: "Sisal flowering poles are massive nectar sources. Our bees thrive here, producing unique honey while ensuring the biodiversity of the plantation ecosystem is maintained.",
      stats: [
        { label: "Honey Produced", value: "500kg" },
        { label: "Pollinator Health", value: "Optimal" },
        { label: "Sustainability", value: "High" }
      ],
      testimonial: {
        quote: "Integrating bees into our sisal estate has created a new revenue stream from honey and improved the local ecology.",
        author: "Estate Manager",
        role: "Sisal Plantation",
        location: "Voi"
      },
      images: [
        "/images/sisal_case.png",
        "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1595123550441-d377e017de6a?auto=format&fit=crop&q=80&w=1200"
      ]
    },
    {
      id: "oranges",
      title: "Citrus Quality",
      category: "Fruit Orchard",
      location: "Kilifi, Kenya",
      description: "Citrus trees yield more juicy and perfectly shaped fruits when well-pollinated. We track bee visits to ensure coverage across the entire orchard during peak bloom.",
      stats: [
        { label: "Juice Content", value: "High" },
        { label: "Fruit Size", value: "Large" },
        { label: "Bloom Coverage", value: "100%" }
      ],
      testimonial: {
        quote: "The quality of our oranges has improved drastically. They are larger, sweeter, and fetch a better price at the market.",
        author: "Hassan Juma",
        role: "Citrus Farmer",
        location: "Malindi"
      },
      images: [
        "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1582281298055-e87743d1a58a?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=1200"
      ]
    },
    {
      id: "vegetables",
      title: "Mixed Vegetables",
      category: "Horticulture",
      location: "Naivasha, Kenya",
      description: "For diverse vegetable farms, generalist pollinators are crucial. Our hives ensure that everything from zucchinis to peppers gets the pollination visits they need.",
      stats: [
        { label: "Crop Diversity", value: "12 Types" },
        { label: "Yield Uplift", value: "+28%" },
        { label: "Defects", value: "-15%" }
      ],
      testimonial: {
        quote: "We grow a bit of everything, and the bees have helped boost production across the board. It's our best insurance policy.",
        author: "Grace Wanjiku",
        role: "Horticulturist",
        location: "Kinangop"
      },
      images: [
        "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1595855709915-f5b2b295ba5d?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1615485925763-8678628890a2?auto=format&fit=crop&q=80&w=1200"
      ]
    },
    {
      id: "tomatoes",
      title: "Tomato Greenhouses",
      category: "Greenhouse",
      location: "Isinya, Kenya",
      description: "For greenhouse tomatoes, buzz pollination is essential. Our managed colonies are perfect for enclosed environments, ensuring every flower sets fruit.",
      stats: [
        { label: "Fruit Set", value: "99%" },
        { label: "Market Class", value: "Grade 1" },
        { label: "Labor Saved", value: "40 Hrs/Wk" }
      ],
      testimonial: {
        quote: "Before bees, we had to mechanically vibrate flowers. The bees do it better, faster, and cheaper. The tomatoes are perfect.",
        author: "Peter Njoroge",
        role: "Greenhouse Manager",
        location: "Kajiado"
      },
      images: [
        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1561136120-f19b16ea9399?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1524593166156-311f36f2b95a?auto=format&fit=crop&q=80&w=1200"
      ]
    },
    {
      id: "onions",
      title: "Onion Seed",
      category: "Seed Production",
      location: "Baringo, Kenya",
      description: "Seed production requires absolute pollination certainty. Our high-density hive placement ensures massive flower visitation rates for maximum seed yield.",
      stats: [
        { label: "Seed Yield", value: "+35%" },
        { label: "Germination", value: "92%" },
        { label: "Hive Density", value: "4/Acre" }
      ],
      testimonial: {
        quote: "We are in the business of seeds, and bees are our most valuable employees. The yield per acre this year is record-breaking.",
        author: "Seed Co. Rep",
        role: "Production Lead",
        location: "Marigat"
      },
      images: [
        "https://images.unsplash.com/photo-1618512496248-a07fe83aa829?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=1200"
      ]
    },
    {
      id: "land",
      title: "The Land",
      category: "Ecosystem",
      location: "East Africa",
      description: "Our work goes beyond crops; it's about the land itself. By supporting pollinators, we restore biodiversity, support wildflowers, and ensure the health of the entire ecosystem.",
      stats: [
        { label: "Biodiversity", value: "Restored" },
        { label: "Wildflowers", value: "Thriving" },
        { label: "Farming Future", value: "Sustainable" }
      ],
      testimonial: {
        quote: "It's not just about the harvest; it's about seeing the land come alive again. The birds, the butterflies, they all come back with the bees.",
        author: "Community Elder",
        role: "Land Custodian",
        location: "Rift Valley"
      },
      images: [
        "/images/land_case.png",
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=1200"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 rounded-full text-primary border-primary/30">
            Field Reports
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
            Crop Case <span className="text-primary">Studies</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore how precision pollination is transforming yields across different crops. Real data, real stories, real results.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {caseStudies.map((study) => (
              <Button
                key={study.id}
                variant="outline"
                size="sm"
                className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => document.getElementById(study.id)?.scrollIntoView({ behavior: 'smooth' })}
              >
                {study.title}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Sections */}
      <div className="space-y-0">
        {caseStudies.map((study, index) => (
          <section
            key={study.id}
            id={study.id}
            className={`py-24 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
          >
            <div className="container mx-auto px-4">
              <div className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>

                {/* Slideshow Column */}
                <div className="w-full lg:w-1/2">
                  <Carousel className="w-full rounded-2xl overflow-hidden shadow-2xl">
                    <CarouselContent>
                      {study.images.map((img, i) => (
                        <CarouselItem key={i}>
                          <div className="relative aspect-[4/3] w-full bg-muted">
                            <img
                              src={img}
                              alt={`${study.title} ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                            <div className="absolute bottom-4 left-4 text-white">
                              <p className="text-sm font-medium opacity-90">Image {i + 1} of {study.images.length}</p>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="hidden md:block">
                      <CarouselPrevious className="left-4 bg-background/80 hover:bg-background" />
                      <CarouselNext className="right-4 bg-background/80 hover:bg-background" />
                    </div>
                  </Carousel>

                  {/* Quick Stats Overlay (Mobile) / Grid (Desktop) */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    {study.stats.map((stat, i) => (
                      <Card key={i} className="border-border/50 bg-card/50 backdrop-blur">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-primary mb-1">{stat.value}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Content Column */}
                <div className="w-full lg:w-1/2 space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="rounded-full">
                        {study.category}
                      </Badge>
                      <span className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1 text-primary" />
                        {study.location}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{study.title}</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {study.description}
                    </p>
                  </div>

                  {/* Testimonial */}
                  <div className="relative p-6 md:p-8 bg-primary/5 rounded-2xl border border-primary/10">
                    <Quote className="absolute top-6 left-6 w-8 h-8 text-primary/20" />
                    <blockquote className="relative z-10 pt-4">
                      <p className="text-lg font-medium italic text-foreground mb-4">
                        "{study.testimonial.quote}"
                      </p>
                      <footer className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {study.testimonial.author.charAt(0)}
                        </div>
                        <div>
                          <cite className="not-italic font-bold text-foreground block">
                            {study.testimonial.author}
                          </cite>
                          <span className="text-sm text-muted-foreground">
                            {study.testimonial.role}, {study.testimonial.location}
                          </span>
                        </div>
                      </footer>
                    </blockquote>
                  </div>

                  <Button className="w-full md:w-auto rounded-full group">
                    Schedule a Consultation <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

              </div>
            </div>
          </section>
        ))}
      </div>

      {/* CTA Footer */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Sprout className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Write Your Success Story?</h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Join the hundreds of farmers seeing real results with BeeYield's precision pollination services.
          </p>
          <Button size="lg" variant="secondary" className="rounded-full text-lg px-8 py-6 shadow-xl hover:scale-105 transition-transform">
            Start Your Transformation
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Media;