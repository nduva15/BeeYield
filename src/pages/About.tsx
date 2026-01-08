import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, MapPin, TreePine, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getAboutPageData, AboutPageData } from "@/services/companyService";

const About = () => {
  const [data, setData] = useState<AboutPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Backend Data
    const fetchData = async () => {
      try {
        const { getAboutPageData } = await import("@/services/companyService");
        const res = await getAboutPageData();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const info = data?.info;
  const story = data?.story;
  const stats = data?.stats || [];

  // Fallback if data fetch fails
  const displayInfo = info || {
    name: "BeeYield",
    mission: "To secure the future of food by reversing the pollination crisis through precision pollination and ecosystem restoration.",
    description: "Born from a family's shared vision in rural Kenya, we're on a mission to solve the global pollination crisis through precision pollination and ecosystem guardianship.",
    location: "Kibwezi, Makueni County, Kenya",
    origin_story: [
      "In 2020, in the midst of the global pandemic, BeeYield was born on a humble half-acre plot with just 4 hives in Kibwezi, a rural town in Makueni, Kenya. Timothy, then a Strathmore University student, saw an opportunity where others saw crisis.",
      "But where would three beekeepers meet? At the family table. Timothy's sisters, Agatha and Carole, brought their own Strathmore expertise to shape BeeYield's direction.",
      "From those 4 hives, BeeYield has grown to 184 hives across a 5-acre fenced apiary. We've planted over 2,500+ trees to restore the ecosystem."
    ],
    stats: [
      { value: "184", label: "Hives Today" },
      { value: "5", label: "Acre Apiary" },
      { value: "2,500+", label: "Trees Planted" },
      { value: "25", label: "Acres Pollinated" },
    ],
    values: [
      { title: "Family-Powered", description: "Three siblings, one vision. Combining Strathmore studies to build a precision pollination company." },
      { title: "Sustainability", description: "Protecting bees and improving yields from hive to harvest." },
      { title: "Traceability", description: "Ensuring authenticity and quality through blockchain technology." }
    ]
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl font-bold">About {displayInfo.name}</h1>
          <p className="mb-8 sm:mb-12 text-base sm:text-xl text-muted-foreground">
            {displayInfo.description}
          </p>
        </div>

        {/* Origin Story */}
        <div className="mx-auto mb-16 max-w-4xl">
          <Card className="border-none shadow-soft overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-2 mb-4 text-primary font-bold tracking-wider uppercase text-sm">
                <MapPin className="h-4 w-4" />
                {displayInfo.location}
              </div>
              <h2 className="mb-6 text-3xl font-bold">Our Story</h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                {displayInfo.origin_story.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Growth Stats */}
        <div className="mx-auto mb-16 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayInfo.stats.map((stat, index) => (
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
                  Exploring how BeeYield is restoring ecosystems, supporting farmers, and building a sustainable future for pollinators.
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
          {displayInfo.values.map((value, idx) => (
            <Card key={idx} className="border-none shadow-soft">
              <CardContent className="pt-6 text-center">
                <div className="mb-4 inline-block rounded-lg bg-primary/10 p-4">
                  {idx === 0 ? <Users className="h-8 w-8 text-primary" /> : idx === 1 ? <Target className="h-8 w-8 text-secondary-foreground" /> : <Award className="h-8 w-8 text-accent-foreground" />}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{value.title}</h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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

export default About;
