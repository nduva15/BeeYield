
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Cpu, Sprout, Play, ArrowRight, Heart, TreePine, Home, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { getCompanyStory, CompanyStory } from "@/services/companyService";

const OurStory = () => {
  const [story, setStory] = useState<CompanyStory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const data = await getCompanyStory();
        setStory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 sm:py-28 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center relative z-10">
            <Badge variant="secondary" className="mb-4">
              About Us
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl drop-shadow-sm">
              {story?.title || "The Story of BeeYield"}
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl font-medium">
              {story?.intro || "Born in Kibwezi, Makueni County, Kenya, a story of family, resilience, and a mission to transform pollination."}
            </p>
          </div>

          {/* Background Decorations */}
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl animate-pulse delay-700" />
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <Card className="border-none bg-primary/5 shadow-soft hover:shadow-glow transition-all">
                <CardContent className="p-6 sm:p-10">
                  <blockquote className="text-xl font-bold italic text-foreground sm:text-2xl leading-relaxed">
                    "{story?.founders_message || "Where would three beekeepers meet? In our case, around the family dinner table."}"
                  </blockquote>
                </CardContent>
              </Card>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <Badge variant="outline" className="mb-2 shadow-sm border-primary/20 bg-primary/5">
                <Home className="mr-2 h-3 w-3 text-primary" />
                Kibwezi, Kenya • 2020
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl leading-tight">
                A Family Mission Born in a Pandemic
              </h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  In 2020, while the world stood still, <strong className="text-foreground">Timothy</strong>, a Strathmore University student, saw an opportunity in the quiet of rural Kibwezi. With just <strong className="text-foreground">half an acre and 4 beehives</strong>, BeeYield was born.
                </p>
                <p>
                  What started as a small venture quickly became a family affair. Timothy's sisters, <strong className="text-foreground">Agatha</strong> and <strong className="text-foreground">Carole</strong>, brought their expertise in IT and growth to help give BeeYield its technological edge and visibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-muted/20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Growth Journey</h2>
            <p className="text-muted-foreground">Key milestones that shaped BeeYield</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-primary/20 hidden md:block" />

            <div className="space-y-12">
              {story?.milestones.map((ms, i) => (
                <div key={ms.id} className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  <div className="flex-1 text-center md:text-right">
                    {i % 2 === 0 ? (
                      <div className="space-y-2">
                        <span className="text-4xl font-black text-primary/20">{ms.year}</span>
                        <h3 className="text-xl font-bold">{ms.title}</h3>
                        <p className="text-muted-foreground text-sm">{ms.description}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="relative z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-glow">
                    <Sprout className="h-6 w-6" />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    {i % 2 !== 0 ? (
                      <div className="space-y-2">
                        <span className="text-4xl font-black text-primary/20">{ms.year}</span>
                        <h3 className="text-xl font-bold">{ms.title}</h3>
                        <p className="text-muted-foreground text-sm">{ms.description}</p>
                      </div>
                    ) : null}
                  </div>

                  {/* Mobile view for all */}
                  <div className="md:hidden space-y-2 text-center bg-white p-6 rounded-2xl shadow-soft">
                    <span className="text-3xl font-black text-primary">{ms.year}</span>
                    <h3 className="text-xl font-bold">{ms.title}</h3>
                    <p className="text-muted-foreground text-sm">{ms.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative shadow-2xl">
            <CardContent className="p-8 sm:p-16 text-center relative z-10">
              <h2 className="text-3xl font-bold sm:text-5xl mb-6">
                Join Us on Our Journey
              </h2>
              <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-10 text-lg">
                From a family dream in rural Kenya to a growing force in precision pollination, we're just getting started. Partner with us to transform agriculture.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button variant="secondary" size="lg" asChild className="font-bold px-8 shadow-lg">
                  <Link to="/contact">Get In Touch</Link>
                </Button>
                <Button className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 shadow-lg border-none" size="lg" asChild>
                  <Link to="/Team">Meet the Family</Link>
                </Button>
              </div>
            </CardContent>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full -ml-20 -mb-20 blur-3xl" />
          </Card>
        </div>
      </section>

      {/* Video Section */}
      <div className="relative w-full h-[80vh] bg-foreground shadow-inner">
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
