import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold">About BeeYield</h1>
          <p className="mb-12 text-xl text-muted-foreground">
            Our mission is to solve the global pollination crisis by deploying healthy, verified colonies that revitalize ecosystems and ensure a sustainable food supply.
          </p>
        </div>

        <div className="mx-auto mb-20 max-w-4xl">
          <Card className="border-none shadow-soft">
            <CardContent className="p-8">
              <h2 className="mb-4 text-3xl font-bold">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                 Founded and Started in 2020, BeeYield was born from a critical realization: the future of food depends on the health of our pollinators. Our founder, Timothy, driven by the urgent need to reverse biodiversity loss, set out to build an ecosystem guardianship model that restores nature, empowers farmers with higher yields, and secures a sustainable food supply for all.
                </p>
                <p>
Today, we partner with forward-thinking farmers across the region who recognize pollination as an essential input. Every colony we deploy boosts agricultural yields for these growers and contributes to vital ecosystem restoration efforts.
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
Today, we have built a robust network of 20 partner beekeepers and 5 key farmers working together to standardize sustainable pollination across the region.              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 inline-block rounded-lg bg-secondary/10 p-4">
                <Target className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Our Mission</h3>
              <p className="text-muted-foreground">
To secure the future of food by reversing the pollination crisis and delivering the essential inputs that restore agricultural yields.          
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
At the heart of everything we do is a commitment to protecting bees and improving pollination to drive higher yields—ensuring sustainability, quality, and total traceability from hive to harvest.  

            </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
