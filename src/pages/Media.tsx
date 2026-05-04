import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  ArrowRight,
  Sprout,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  Quote,
  ChevronLeft,
  ChevronRight,
  User,
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
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

const Media = () => {
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

  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    import("@/services/mediaService").then(({ getCaseStudies }) => {
      getCaseStudies().then((data) => {
        if (isMounted) {
          setCaseStudies(data);
          setLoading(false);
        }
      });
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <BeeYieldPageShell className="min-h-screen bg-background p-0">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1.5 rounded-full text-primary border-primary/30"
          >
            Field Reports
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
            Crop Case <span className="text-primary">Studies</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore how our pollination services are improving yields across
            different crops. Verified results from our partner farmers.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {caseStudies.map((study) => (
              <Button
                key={study.id}
                variant="outline"
                size="sm"
                className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() =>
                  document
                    .getElementById(study.id)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
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
            className={`py-24 ${index % 2 === 0 ? "bg-background" : "bg-muted/30"}`}
          >
            <div className="container mx-auto px-4">
              {/* Section Title */}
              <div className="mb-12 flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${index % 2 === 0 ? "bg-secondary/50" : "bg-background"}`}
                >
                  <Sprout className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{study.title}</h2>
                  <Badge variant="secondary" className="mt-1">
                    {study.category}
                  </Badge>
                </div>
              </div>

              {/* Farmer Stories Carousel for this Crop */}
              <Carousel className="w-full relative">
                <CarouselContent>
                  {study.stories.map((story, storyIndex) => (
                    <CarouselItem key={storyIndex}>
                      <div
                        className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                      >
                        {/* Image Column */}
                        <div className="w-full lg:w-1/2">
                          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group border-4 border-background">
                            <img
                              src={story.image}
                              alt={`${story.farmer} - ${study.title}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute top-6 right-6 z-10">
                              <Badge className="bg-background/95 text-foreground backdrop-blur border-none shadow-xl px-4 py-2 text-sm font-bold">
                                {story.acres} Acres Pollinated
                              </Badge>
                            </div>
                            <div className="absolute bottom-8 left-8 text-[#1A1A1A] z-10">
                              <p className="font-bold text-2xl mb-2">
                                {story.farmer}
                              </p>
                              <p className="text-[#1A1A1A] text-sm flex items-center font-medium bg-[#F4D03F]/10 backdrop-blur-sm w-fit px-3 py-1 rounded-full">
                                <MapPin className="w-4 h-4 mr-1.5" />
                                {story.location}
                              </p>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-4 mt-8">
                            {story.stats.map((stat, i) => (
                              <Card
                                key={i}
                                className="border-border/50 bg-card/80 backdrop-blur shadow-sm hover:shadow-md transition-shadow"
                              >
                                <CardContent className="p-4 text-center">
                                  <p className="text-xl md:text-2xl font-black text-primary mb-1">
                                    {stat.value}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground tracking-wider font-semibold">
                                    {stat.label}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Content Column */}
                        <div className="w-full lg:w-1/2 space-y-8">
                          <div>
                            <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-primary">
                              <User className="w-6 h-6" />
                              Farmer Story
                            </h3>
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                              {story.description}
                            </p>
                          </div>

                          {/* Testimonial */}
                          <div className="relative p-8 md:p-10 bg-primary/5 rounded-3xl border border-primary/10">
                            <Quote className="absolute top-8 left-8 w-10 h-10 text-primary/20" />
                            <blockquote className="relative z-10 pt-6">
                              <p className="text-xl md:text-2xl font-medium text-foreground mb-6 leading-normal">
                                "{story.quote}"
                              </p>
                              <footer className="flex items-center gap-4 border-t border-primary/10 pt-6">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border-2 border-background shadow-sm">
                                  {story.farmer.charAt(0)}
                                </div>
                                <div>
                                  <cite className="not-italic font-bold text-foreground block text-lg">
                                    {story.farmer}
                                  </cite>
                                  <span className="text-sm text-muted-foreground font-medium">
                                    {story.role} &bull; {story.acres} Acres
                                  </span>
                                </div>
                              </footer>
                            </blockquote>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
                            <Button
                              asChild
                              size="lg"
                              className="w-full sm:w-auto rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all h-14 px-8 text-lg"
                            >
                              <Link to="/pollination-request">
                                Book Pollination{" "}
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="w-3 h-3 mr-1" /> Verified at{" "}
                              {story.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* IMPROVED Carousel Controls - Positioned clearly at the bottom center for mobile, or side for desktop */}
                <div className="flex justify-center gap-4 mt-8 md:mt-0 md:absolute md:top-1/2 md:-translate-y-1/2 md:w-full md:justify-between md:pointer-events-none md:px-4 lg:px-0 lg:-mx-16">
                  <div className="pointer-events-auto">
                    <CarouselPrevious className="relative left-0 translate-y-0 hover:bg-primary hover:text-primary-foreground border-2 border-primary/20 h-12 w-12 md:h-14 md:w-14 bg-background shadow-xl" />
                  </div>
                  <div className="pointer-events-auto">
                    <CarouselNext className="relative right-0 translate-y-0 hover:bg-primary hover:text-primary-foreground border-2 border-primary/20 h-12 w-12 md:h-14 md:w-14 bg-background shadow-xl" />
                  </div>
                </div>
              </Carousel>
            </div>
          </section>
        ))}
      </div>

      {/* CTA Footer */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Sprout className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Join these farmers and experience the power of precision
            pollination.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="rounded-full text-lg px-8 py-6 shadow-xl hover:scale-105 transition-transform"
          >
            <Link to="/pollination-request">Work With Us</Link>
          </Button>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default Media;
