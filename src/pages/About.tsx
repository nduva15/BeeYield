import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold">About BeeYield</h1>
          <p className="mb-12 text-xl text-muted-foreground">
            We're on a mission to bring pure, sustainable honey to your table while protecting our planet's precious pollinators.
          </p>
        </div>

        <div className="mx-auto mb-20 max-w-4xl">
          <Card className="border-none shadow-soft">
            <CardContent className="p-8">
              <h2 className="mb-4 text-3xl font-bold">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2020, BeeYield was born from a simple belief: honey should be pure, traceable, and produced in harmony with nature. Our founders, passionate about both environmental conservation and supporting local communities, set out to create a honey brand that would set new standards for transparency and sustainability.
                </p>
                <p>
                  Today, we partner with ethical beekeepers across the region who share our commitment to sustainable practices. Every jar of BeeYield supports these dedicated farmers and contributes to vital pollinator conservation efforts.
                </p>
                <p>
                  Our innovative QR code traceability system lets you discover the unique story behind your honey - from the specific hive location to the flowering plants visited by the bees that produced it.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="border-none shadow-soft">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 inline-block rounded-lg bg-primary/10 p-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Our Team</h3>
              <p className="text-muted-foreground">
                50+ dedicated beekeepers and conservation experts working together
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 inline-block rounded-lg bg-secondary/10 p-4">
                <Target className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Our Mission</h3>
              <p className="text-muted-foreground">
                To produce the finest honey while protecting bees and supporting sustainable agriculture
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 inline-block rounded-lg bg-accent/10 p-4">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Our Values</h3>
              <p className="text-muted-foreground">
                Transparency, sustainability, quality, and community at the heart of everything we do
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
