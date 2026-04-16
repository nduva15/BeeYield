import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Cpu, Sprout, Play, ArrowRight, Heart, TreePine, Home, Hexagon
} from "lucide-react";
import { Link } from "react-router-dom";
import impactBeekeeping from "@/assets/impact-beekeeping.jpg";
import Logo from "@/assets/Logo.png";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

const OurStory = () => {
  return (
    <BeeYieldPageShell className="min-h-screen bg-background p-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#F0F7F0] py-20 sm:py-28 lg:py-32">
        {/* Decorative Background Icons */}
        <div className="absolute top-20 right-10 text-primary/5 animate-pulse">
          <Hexagon size={120} strokeWidth={1} />
        </div>
        <div className="absolute bottom-20 left-10 text-accent/10">
          <Hexagon size={180} strokeWidth={1} className="rotate-12" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6 px-4 py-1 text-sm">
                Our story
              </Badge>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
                The Story of <span className="text-primary">BeeYield</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Born in Kibwezi, Makueni County, Kenya — a story of family, resilience, and a mission to improve pollination for a sustainable future.
              </p>
            </div>

            <div className="relative mx-auto lg:ml-auto max-w-md lg:max-w-full flex justify-center">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl rounded-full" />
              <img
                src={Logo}
                alt="BeeYield Logo"
                className="relative w-full max-w-[400px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-xl shadow-xl border border-border/50 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Sprout size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Local Roots</p>
                  <p className="text-xs text-muted-foreground">Kenya Grown</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/10 rounded-3xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-500" />
                <img
                  src={impactBeekeeping}
                  alt="Early days in Kibwezi"
                  className="relative rounded-3xl shadow-lg w-full object-cover h-[400px] lg:h-[500px]"
                />
                {/* Floating Quote Card */}
                <Card className="absolute -bottom-8 -right-8 w-[90%] sm:w-[80%] shadow-xl border-none bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="text-4xl text-primary font-serif">"</div>
                      <blockquote className="text-lg font-medium text-foreground">
                        Sometimes, the spark for something big comes from boredom, family, and a little bit of courage.
                      </blockquote>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <Badge variant="outline" className="mb-2">
                <Home className="mr-2 h-3 w-3" />
                Kibwezi, Kenya • 2020
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                A Pandemic Spark, a Family Mission
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  In 2020, as the world slowed down during the COVID pandemic, <strong className="text-foreground">Timothy Nduva</strong> found himself restless in rural Kibwezi, Kenya. While attending Strathmore University, Timothy’s curiosity and drive for innovation grew. The unique challenges of the pandemic became the spark that ignited BeeYield’s vision for scalable, tech-driven beekeeping solutions.
                </p>
                <p>
                  But BeeYield was never a solo journey. Timothy’s sisters, <strong className="text-foreground">Agatha</strong> and <strong className="text-foreground">Carole</strong>, brought their own unique skills—ranging from web development and product design to IoT research. Together, the siblings transformed a small family apiary into a platform for technological advancement and agricultural impact.
                </p>
                <p>
                  What began with just half an acre and four hives quickly became a family mission to empower farmers, advance pollination, and prove that innovation can flourish anywhere—even in the most unexpected places.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Journey */}
      <section className="bg-muted/30 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
              From 4 Hives to 184 — Our Growth Journey
            </h2>
            <p className="text-muted-foreground">
              What began on half an acre has grown into a thriving 5-acre apiary, fenced and flourishing.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { number: "184+", label: "Beehives", desc: "From 4 to 184 hives" },
              { number: "1M+", label: "Bee Colonies", desc: "Thriving colonies" },
              { number: "2,500+", label: "Trees Planted", desc: "Restoring the ecosystem" },
              { number: "25+", label: "Acres Pollinated", desc: "Client farmlands served" },
            ].map((stat, i) => (
              <Card key={i} className="text-center border-border/50">
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-primary mb-1">{stat.number}</p>
                  <p className="text-lg font-semibold text-foreground">{stat.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values / Who We Are */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Who We Are And What We Stand For
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three siblings, one mission: modernizing pollination in Kenya and beyond.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Family-Driven",
                desc: "Built by siblings Timothy, Agatha, and Carole — we combine passion with purpose, bringing diverse skills under one shared vision."
              },
              {
                icon: Sprout,
                title: "Guardians of Nature",
                desc: "With 2,500+ trees planted, we're not just beekeepers — we're ecosystem builders committed to environmental restoration."
              },
              {
                icon: Cpu,
                title: "Precision Pollination",
                desc: "We're now directing BeeYield toward precision pollination, using technology to maximize impact for farmers across Kenya."
              }
            ].map((item, i) => (
              <Card key={i} className="group border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pollination Services Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <Badge variant="outline">
                <TreePine className="mr-2 h-3 w-3" />
                Our Services
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                From Traditional to Precision Pollination
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our pollination journey started with traditional methods — moving hives to client farms and letting nature do its work. We successfully pollinated <strong className="text-foreground">25 acres+</strong> of farmland, proving the value of managed pollination services in Kenya.
                </p>
                <p>
                  But we knew we could do more. Today, BeeYield is evolving toward precision pollination — using sensors, data, and hive management to deliver clear pollination results.
                </p>
                <p>
                  Our goal is to help farmers across the world increase their yields while supporting bee health and biodiversity.
                </p>
              </div>
              <Button asChild className="mt-4">
                <Link to="/pollination-solutions">
                  Explore Our Solutions <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <Card className="overflow-hidden border-border/50">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-4">
                        <Heart className="h-8 w-8" />
                      </div>
                      <p className="text-lg font-semibold text-foreground">Growing Together</p>
                      <p className="text-sm text-muted-foreground mt-2">Kibwezi, Kenya → Africa → Beeyond</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-[#0A2612] text-[#1A1A1A] border-none shadow-2xl rounded-[3rem] overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#1B9157] rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F4D03F] rounded-full blur-3xl -ml-32 -mb-32" />

              <h2 className="text-3xl font-bold sm:text-5xl mb-6 relative z-10 text-[#1A1A1A]">
                Join Us on Our <span className="text-[#1B9157]">Journey</span>
              </h2>
              <p className="text-[#1B9157]/80 max-w-2xl mx-auto mb-10 text-lg relative z-10">
                From a family dream in rural Kenya to a growing presence in pollination services — we're just getting started. Partner with us to improve agriculture.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Button size="lg" className="bg-[#FFF9F0] text-[#1B9157] hover:bg-green-50 font-bold px-8 h-12 rounded-xl" asChild>
                  <Link to="/contact">Get In Touch</Link>
                </Button>
                <Button variant="outline" size="lg" className="border-[#F4D03F]/40 text-[#1A1A1A] hover:bg-[#F4D03F]/10 font-bold px-8 h-12 rounded-xl" asChild>
                  <Link to="/careers">Join Our Team</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* About Videos */}
      <section className="bg-[#F0F7F0] py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              Watch BeeYield
            </Badge>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Our Story In Motion
            </h2>
            <p className="mt-4 text-muted-foreground">
              Two key videos covering BeeYield's story and the field reality behind our work.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <YouTubeEmbed
              title="About BeeYield"
              wrapperClassName="aspect-video"
            />
            <YouTubeEmbed
              title="BeeYield Video"
              wrapperClassName="aspect-video"
            />
          </div>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default OurStory;
