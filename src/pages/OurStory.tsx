import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Cpu, Sprout, Play, ArrowRight, Heart
} from "lucide-react";
import { Link } from "react-router-dom";

const OurStory = () => {
  return (
    <div className="min-h-screen py-20">
          {/* Hero Section */}
          <section className="relative py-24 md:py-32 bg-secondary/20">
            <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
              <Badge className="mb-6 bg-white border border-primary/20 text-primary">
                About Us
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
                The Story of <span className="text-gradient">BeeYield</span>
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground font-light leading-relaxed">
                Our origin story is one of friendship, timing, and unique skillsets.
              </p>
            </div>
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          </section>

          {/* Origin Story */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl transform rotate-3 scale-105" />
                  <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                    alt="Founders Meeting" 
                    className="relative rounded-2xl shadow-elegant w-full object-cover h-[500px]"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg max-w-xs">
                    <p className="text-sm font-semibold italic text-muted-foreground">
                      "Where else would a beekeeper, a cybersecurity polymath and a data science student find themselves in the same class?"
                    </p>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    A Chance Meeting Led to a Meeting of the Minds
                  </h2>
                  <div className="prose prose-lg text-muted-foreground">
                    <p className="mb-6">
                      In a small town in rural Israel, <span className="text-foreground font-semibold">Itai Kanot</span> was learning how to be a beekeeper from his father. By the time he was attending Reichman University, he had been a beekeeper most of his life.
                    </p>
                    <p className="mb-6">
                      As it turned out, RUNI's pioneering approach to interdisciplinary education would be the spark that ignited BeeYield.
                    </p>
                    <p>
                      The convergence of these distinct fields—agriculture, security, and data analytics—created the foundation for a technology that would revolutionize how we understand and protect our food supply.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Values / Who We Are */}
          <section className="py-24 bg-foreground text-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Who We Are And What We Stand For</h2>
                <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Sprout,
                    title: "Guardians of Nature",
                    desc: "We believe technology should serve nature, not replace it. Every sensor we deploy is there to give a voice to the bees."
                  },
                  {
                    icon: Users,
                    title: "Interdisciplinary Innovation",
                    desc: "Our strength lies in our diversity. We combine centuries-old beekeeping wisdom with cutting-edge data science."
                  },
                  {
                    icon: Cpu,
                    title: "Data-Driven Impact",
                    desc: "We don't guess; we measure. Precision is our tool for delivering quantifiable sustainability outcomes."
                  }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors">
                    <div className="bg-primary/20 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                    <p className="text-white/60 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Almond Pollination Story (Video Section) */}
          <section className="py-24 bg-secondary/30">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold tracking-wider uppercase text-sm">
                    <Heart className="h-4 w-4" />
                    A Journey Seldom Told
                  </div>
                  <h2 className="text-4xl font-bold mb-6">The Story of Almond Pollination</h2>
                  <div className="prose prose-lg text-muted-foreground">
                    <p className="mb-6">
                      From the almond groves of California's Central Valley to the frost-kissed sheds of Idaho, we traverse landscapes and seasons to bring you a story seldom told.
                    </p>
                    <p className="mb-6">
                      This video invites you on an awe-inspiring odyssey, where billions of blossoms burst into life and the air resonates with the hypnotic drone of pollinators.
                    </p>
                    <p>
                      Experience the spectacle of one of the largest pollination events on our planet, told through the lens of BeeYield. Witness how every bee, visiting thousands of flowers a day, transforms simple blossoms into the food that graces our tables.
                    </p>
                  </div>
                  <Button className="mt-8 gap-2">
                    Watch Full Documentary <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Video Placeholder */}
                <div className="order-1 lg:order-2 relative group cursor-pointer">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-2xl z-10" />
                  <img 
                    src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1000" 
                    alt="Almond Blossoms" 
                    className="rounded-2xl shadow-2xl w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Play className="h-6 w-6 text-primary ml-1 fill-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 z-20 text-white">
                    <span className="bg-black/50 px-3 py-1 rounded text-sm font-medium backdrop-blur-md">02:45</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
    </div>
  );
};

export default OurStory;