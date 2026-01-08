import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Heart, Shield, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-honey.jpg";
import productImage from "@/assets/product-honey.jpg";

const Home = () => {
  const features = [
    {
      icon: Leaf,
      title: "100% Natural",
      description: "Pure, raw honey with no additives or processing",
    },
    {
      icon: Heart,
      title: "Ethical Sourcing",
      description: "Supporting local beekeepers and sustainable practices",
    },
    {
      icon: Shield,
      title: "Full Traceability",
      description: "Track your honey from hive to home with QR codes",
    },
  ];

  const products = [
    {
      name: "Wildflower Honey",
      price: "1000",
      image: productImage,
    },
    {
      name: "Acacia Honey",
      price: "1000",
      image: productImage,
    },
    {
      name: "Lavender Honey",
      price: "1000",
      image: productImage,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Pure honey"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/60" />
        </div>
        <div className="container relative mx-auto flex h-full items-center px-4">
          <div className="max-w-2xl space-y-6">
            <Badge className="bg-secondary text-secondary-foreground">
              Sustainably Sourced
            </Badge>
            <h1 className="text-5xl font-bold leading-tight text-foreground md:text-6xl">
              Pure Honey from
              <span className="block text-primary">Nature to You</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Experience the authentic taste of raw, unfiltered honey while supporting sustainable beekeeping and environmental conservation.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/shop">Shop Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/impact">Our Impact</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-soft">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-block rounded-lg bg-primary/10 p-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Featured Products</h2>
            <p className="text-lg text-muted-foreground">
              Discover our collection of premium, artisan honey
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {products.map((product, index) => (
              <Card key={index} className="overflow-hidden transition-all hover:shadow-glow">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="mb-2 text-xl font-semibold">{product.name}</h3>
                  <p className="mb-4 text-2xl font-bold text-primary">{product.price}</p>
                  <Button className="w-full" variant="outline">
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link to="/shop" className="group">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary to-accent py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">Track Your Honey's Journey</h2>
          <p className="mb-8 text-lg opacity-90">
            Scan the QR code on your jar to discover the story behind your honey
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/traceability">Learn More</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
