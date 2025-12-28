import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, MapPin, TreePine, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold">About BeeYield</h1>
          <p className="mb-12 text-xl text-muted-foreground">
            Born from a family's shared vision in rural Kenya, we're on a mission to solve the global pollination crisis through precision pollination and ecosystem guardianship.
          </p>
        </div>

        {/* Origin Story */}
        <div className="mx-auto mb-16 max-w-4xl">
          <Card className="border-none shadow-soft overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-2 mb-4 text-primary font-bold tracking-wider uppercase text-sm">
                <MapPin className="h-4 w-4" />
                Kibwezi, Makueni County, Kenya
              </div>
              <h2 className="mb-6 text-3xl font-bold">Our Story</h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  In 2020, in the midst of the global pandemic, BeeYield was born on a humble half-acre plot with just 4 hives in Kibwezi, a rural town in Makueni, Kenya. Timothy, then a Strathmore University student, saw an opportunity where others saw crisis. With a mission to protect pollinators and secure food systems, he placed those first hives and began a journey that would become a family legacy.
                </p>
                <p>
                  But where would three beekeepers meet? At the family table. Timothy's sisters, Agatha and Carole, brought their own Strathmore expertise to shape BeeYield's direction: web development, product design, and IoT research. Together, they made a decision: combine their studies and build something meaningful for their community and beyond.
                </p>
                <p>
                  From those 4 hives, BeeYield has grown to <strong className="text-foreground">184 hives</strong> across a <strong className="text-foreground">5-acre fenced apiary</strong>. We've planted over <strong className="text-foreground">2,500+ trees</strong> to restore the ecosystem. We launched pollination services and while it wasn't precision at first, we served real clients and successfully pollinated <strong className="text-foreground">25 acres</strong> of farmland.
                </p>
                <p>
                  Today, BeeYield is evolving into <strong className="text-foreground">precision pollination</strong>, using data, technology, and verified healthy colonies to maximize agricultural yields and restore biodiversity. What started as a student's dream is now a family-powered movement to secure the future of food.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Growth Stats */}
        <div className="mx-auto mb-16 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "184", label: "Hives Today" },
              { value: "5", label: "Acre Apiary" },
              { value: "2,500+", label: "Trees Planted" },
              { value: "25", label: "Acres Pollinated" },
            ].map((stat, index) => (
              <Card key={index} className="border-none shadow-soft bg-secondary/30">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Links to Team and Impact */}
        <div className="mx-auto mb-16 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-soft hover:shadow-elegant transition-all group">
              <CardContent className="p-8">
                <div className="mb-4 inline-block rounded-lg bg-primary/10 p-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">Meet Our Team</h3>
                <p className="text-muted-foreground mb-6">
                  Get to know the founding family behind BeeYield: three Strathmore graduates who combined their expertise in technology, business, and beekeeping to build a precision pollination company from rural Kenya.
                </p>
                <Link to="/team">
                  <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Meet the Founders <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft hover:shadow-elegant transition-all group">
              <CardContent className="p-8">
                <div className="mb-4 inline-block rounded-lg bg-accent/30 p-4">
                  <TreePine className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">Our Impact</h3>
                <p className="text-muted-foreground mb-6">
                  From 4 hives to 184, from a half-acre to 5 acres, from seedlings to 2,500+ trees. Explore how BeeYield is restoring ecosystems, supporting farmers, and building a sustainable future for pollinators.
                </p>
                <Link to="/impact">
                  <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    See Our Impact <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values Cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          <Card className="border-none shadow-soft">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 inline-block rounded-lg bg-primary/10 p-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Family-Powered</h3>
              <p className="text-muted-foreground">
                Three siblings, one vision. Combining Strathmore studies to build a precision pollination company from rural Kenya.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 inline-block rounded-lg bg-secondary/50 p-4">
                <Target className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Our Mission</h3>
              <p className="text-muted-foreground">
                To secure the future of food by reversing the pollination crisis through precision pollination and ecosystem restoration.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 inline-block rounded-lg bg-accent/30 p-4">
                <Award className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Our Values</h3>
              <p className="text-muted-foreground">
                Sustainability, traceability, and community. Protecting bees and improving yields from hive to harvest.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full-width Video Section - Before Footer */}
      <div className="relative w-full h-[70vh] bg-foreground">
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://www.youtube.com/embed/VIDEO_ID_HERE"
          title="About BeeYield"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default About;