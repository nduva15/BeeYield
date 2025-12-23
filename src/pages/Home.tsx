import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, TrendingUp, Shield, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const PollinationServices = () => {
  const stats = [
    { label: "Farmers Served", value: "20+", description: "Active agricultural partners" },
    { label: "Acres Pollinated", value: "30+", description: "Annual coverage area" },
    { label: "Managed Hives", value: "150+", description: "Professional bee colonies" },
    { label: "Yield Increase", value: "35%", description: "Average crop improvement" },
  ];

  const solutions = [
    {
      icon: Shield,
      title: "Precision Pollination",
      description: "Deploy our managed bee colonies to your crops at optimal times for maximum pollination efficiency.",
      features: [
        "Expert hive placement and timing",
        "Regular colony health monitoring",
        "Customized for your crop type",
        "Weather-optimized deployment"
      ]
    },
    {
      icon: BarChart3,
      title: "Pollination Analytics",
      description: "Track bee activity and pollination effectiveness with our monitoring technology and detailed reporting.",
      features: [
        "Real-time activity tracking",
        "Yield prediction models",
        "Pollination coverage mapping",
        "Detailed performance reports"
      ]
    }
  ];

  const benefits = [
    "Increase crop yield by up to 40%",
    "Improve fruit quality and uniformity",
    "Reduce pollination uncertainty",
    "Access expert beekeeping support",
    "Sustainable farming practices",
    "Flexible service agreements"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary via-secondary/90 to-primary py-24 text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              Professional Pollination Services
            </h1>
            <p className="mb-8 text-xl opacity-90">
              Boost your crop yields with BeeYield's managed pollination solutions. 
              We provide healthy bee colonies and expert monitoring for commercial growers.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/pollination-request">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                  Request Pollination Service
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-secondary-foreground/20 bg-secondary-foreground/10 hover:bg-secondary-foreground/20">
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="border-none text-center shadow-soft">
                <CardContent className="pt-6">
                  <div className="mb-2 text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="mb-1 text-lg font-semibold">{stat.label}</div>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Our Pollination Solutions</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Choose the service that best fits your agricultural needs
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            {solutions.map((solution, index) => (
              <Card key={index} className="border-none shadow-soft">
                <CardContent className="p-8">
                  <div className="mb-4 inline-block rounded-lg bg-secondary/10 p-4">
                    <solution.icon className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold">{solution.title}</h3>
                  <p className="mb-6 text-muted-foreground">{solution.description}</p>
                  <ul className="space-y-3">
                    {solution.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <TrendingUp className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h2 className="mb-4 text-4xl font-bold">Why Choose BeeYield Pollination?</h2>
              <p className="text-lg text-muted-foreground">
                Maximize your crop potential with professional pollination management
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-none shadow-soft">
                  <CardContent className="flex items-start p-6">
                    <Check className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                    <span className="text-lg">{benefit}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Crops We Serve */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-8 text-4xl font-bold">Crops We Pollinate</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {["Mangoes", "Maize", "Beans", "Cucumbers", "Melons", "Pumpkins", "Bananas", "Tomatoes"].map((crop, index) => (
                <Card key={index} className="border-none shadow-soft">
                  <CardContent className="p-6">
                    <p className="text-lg font-semibold">{crop}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="border-none bg-gradient-to-br from-primary to-secondary shadow-elegant">
            <CardContent className="p-12 text-center text-primary-foreground">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Boost Your Harvest?</h2>
              <p className="mb-8 text-lg opacity-90">
                Partner with BeeYield for reliable, professional pollination services
              </p>
              <Link to="/pollination-request">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                  Get Started Today
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PollinationServices;
