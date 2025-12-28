import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Cpu, Sprout, Play, ArrowRight, Heart, TreePine, Home
} from "lucide-react";
import { Link } from "react-router-dom";

const OurStory = () => {
  useEffect(() => {
    // Inject GTM script into head
    const script = document.createElement('script');
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-KF284247');`;
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-KF284247"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        ></iframe>
      </noscript>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 sm:py-28 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              About Us
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The Story of BeeYield
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Born in Kibwezi, Makueni County, Kenya, a story of family, resilience, and a mission to transform pollination.
            </p>
          </div>

          {/* Background Decorations */}
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <Card className="border-none bg-primary/5 shadow-none">
                <CardContent className="p-6 sm:p-8">
                  <blockquote className="text-xl font-medium italic text-foreground sm:text-2xl">
                    "Where would three beekeepers meet? In our case, around the family dinner table."
                  </blockquote>
                </CardContent>
              </Card>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <Badge variant="outline" className="mb-2">
                <Home className="mr-2 h-3 w-3" />
                Kibwezi, Kenya • 2020
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                A Family Mission Born in a Pandemic
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  In 2020, while the world stood still amid a global pandemic, <strong className="text-foreground">Timothy</strong>, a Strathmore University student, saw an opportunity in the quiet of rural Kibwezi, Makueni County. With just <strong className="text-foreground">half an acre of land and 4 beehives</strong>, BeeYield was born.
                </p>
                <p>
                  What started as a small venture quickly became a family affair. Timothy's two sisters, <strong className="text-foreground">Agatha</strong> and <strong className="text-foreground">Carole</strong>, brought their unique expertise to shape the company's direction, from web development and product design to IoT research, they helped give BeeYield its visibility and technological edge.
                </p>
                <p>
                  Together, the three siblings transformed a modest apiary into something much greater, proving that innovation can flourish anywhere, even in the most unexpected places.
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
              From 4 Hives to 184: Our Growth Journey
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
              Three siblings, one mission: revolutionizing pollination in Kenya and beyond.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Family-Driven",
                desc: "Built by siblings Timothy, Agatha, and Carole, we combine passion with purpose, bringing diverse skills under one shared vision."
              },
              {
                icon: Sprout,
                title: "Guardians of Nature",
                desc: "With 2,500+ trees planted, we're not just beekeepers, we're ecosystem builders committed to environmental restoration."
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
                  Our pollination journey started with traditional methods, moving hives to client farms and letting nature do its work. We successfully pollinated <strong className="text-foreground">25 acres+</strong> of farmland, proving the value of managed pollination services in Kenya.
                </p>
                <p>
                  But we knew we could do more. Today, BeeYield is evolving toward <strong className="text-foreground">precision pollination</strong>, leveraging IoT sensors, data analytics, and smart hive management to deliver measurable, optimized pollination outcomes.
                </p>
                <p>
                  Our goal is to help farmers across the world increase their yields while supporting bee health and biodiversity.
                </p>
              </div>
              <Button asChild className="mt-4">
                <Link to="/PollinationSolutions">
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
          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="text-2xl font-bold sm:text-3xl mb-4">
                Join Us on Our Journey
              </h2>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-6">
                From a family dream in rural Kenya to a growing force in precision pollination, we're just getting started. Partner with us to transform agriculture.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" asChild>
                  <Link to="/contact">Get In Touch</Link>
                </Button>
                <Button className="bg-green-500 hover:bg-green-600 text-white" asChild>
                  <Link to="/Team">Join Our Team</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Full-width Video Section - Before Footer */}
      <div className="relative w-full h-[70vh] bg-foreground">
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="About BeeYield"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default OurStory;
