import { Download, ArrowRight, FileText, Image, Video, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Media = () => {
  const pressReleases = [
    "BeeYield Establishes Regional Headquarters in Kenya, Growing its Local Presence & Supporting Pollination of Multiple Crops",
    "BeeYield Achieves 10 Million Hive Samples Daily With Its In-Hive Sensors",
    "BeeYield Unveils Latest ESG Data, Highlighting Precision Pollination's Contribution to Achieving Global Sustainability",
    "Precision Pollination Leader BeeYield Welcomes Kevin Murphy to Board of Directors",
    "Precision Pollination Leader BeeYield Named to the CNBC Disruptor 50 List for 2023",
    "BeeYield Reveals Groundbreaking Data-Backed Insights from the Latest Almond Pollination Seasons",
    "BeeYield Launches Pollination Insight Platform (PIP), an In-Field Sensing Solution Monitoring Pollinator Activity to Improve Crop Pollination",
    "BeeYield Introduces 'Healthy Hive Score' Metrics for Measuring Bee Health and Promoting Sustainable Precision Pollination",
  ];

  const imageCategories = [
    { name: "Technology", icon: Video },
    { name: "Pollination", icon: Image },
    { name: "Founders", icon: Users },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
            Media Kit &{" "}
            <span className="text-primary">Brand Tools</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Download our brand guide, logos, and video assets.
          </p>
        </div>
      </section>

      {/* BeeHero Media Kit Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">BeeYield Media </h2>
            </div>
            <p className="text-muted-foreground mb-8 ml-15">
              View our latest news, press releases, awards, and industry recognition.
            </p>
          </div>
        </div>
      </section>

      {/* Logo Assets Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Logo Assets</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px] bg-foreground rounded-t-lg">
                  <div className="flex items-center gap-2 text-background">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">BY</span>
                    </div>
                    <span className="text-2xl font-bold">BeeYield</span>
                  </div>
                </CardContent>
                <div className="p-4 flex justify-center">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </Card>

              <Card className="border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px] bg-background rounded-t-lg">
                  <div className="flex items-center gap-2 text-foreground">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">BY</span>
                    </div>
                    <span className="text-2xl font-bold">BeeYield</span>
                  </div>
                </CardContent>
                <div className="p-4 flex justify-center">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Image Library Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Image className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">BeeYield Image Library</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {imageCategories.map((category) => (
                <Card key={category.name} className="border-border/50 hover:shadow-lg transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <category.icon className="h-16 w-16 text-primary/50" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-3">{category.name}</h3>
                      <Button variant="outline" size="sm" className="gap-2 w-full">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              Download Our Press Releases
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {pressReleases.map((release, index) => (
                <Card key={index} className="border-border/50 hover:shadow-lg transition-all hover:border-primary/30 group">
                  <CardContent className="p-6">
                    <p className="text-foreground font-medium mb-4 line-clamp-3 group-hover:text-primary transition-colors">
                      {release}
                    </p>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0 gap-1">
                      Read More <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            See What Our Growers and Beekeepers Are Saying
          </h2>
          <Button size="lg" className="gap-2">
            View Testimonials <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </>
  );
};

export default Media;