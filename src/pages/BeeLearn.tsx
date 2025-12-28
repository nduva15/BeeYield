import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ShoppingCart, Star, Download } from "lucide-react";
import heroImage from "@/assets/hero-honey.jpg";

// PDF products from Shop.tsx
const pdfs = [
  {
    id: 201,
    title: "Beginner's Beekeeping Guide",
    description: "Complete PDF guide for starting your beekeeping journey",
    price: 1500,
    badge: "Bestseller",
    rating: 4.9,
    reviews: 156,
    cover: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 202,
    title: "Precision Pollination Handbook",
    description: "Advanced techniques for agricultural pollination",
    price: 2500,
    badge: "Professional",
    rating: 4.8,
    reviews: 89,
    cover: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 203,
    title: "Hive Health & Disease Prevention",
    description: "Identifying and treating common bee diseases",
    price: 1200,
    badge: null,
    rating: 4.7,
    reviews: 67,
    cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 204,
    title: "Sustainable Apiary Management",
    description: "Eco-friendly practices for modern beekeepers",
    price: 3500,
    badge: "Bundle",
    rating: 5.0,
    reviews: 43,
    cover: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 205,
    title: "Urban Beekeeping Essentials",
    description: "Keep bees in cities and suburban areas",
    price: 1000,
    badge: "New",
    rating: 4.6,
    reviews: 21,
    cover: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 206,
    title: "Complete Beekeeper's Library",
    description: "All 5 guides bundled at a special price",
    price: 7500,
    badge: "Best Value",
    rating: 4.9,
    reviews: 78,
    cover: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  },
];

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
      ))}
      {halfStar && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 opacity-50" />}
    </div>
  );
}

const BeeLearn = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* BeeLearn Hero/Landing Section (like Honey) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-background to-primary/10 py-24">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          {/* Left: Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-6 flex justify-center md:justify-start">
              <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium text-sm border border-yellow-200">
                Curated by African Experts
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-yellow-900 mb-4">
              Learning That <span className="text-primary">Gives Back</span>
            </h1>
            <p className="text-lg md:text-xl text-yellow-900 mb-6 max-w-xl">
              We share only the best, most sustainable knowledge, leaving plenty for the next generation. Every PDF is fully traceable from expert to your hands.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center md:justify-start">
              <Button asChild variant="default" className="bg-primary text-white">
                <Link to="/shop#learn">Shop Our PDFs</Link>
              </Button>
            </div>
          </div>
          {/* Right: Visual */}
          <div className="flex-1 hidden md:flex items-center justify-center">
            <div className="relative w-full max-w-xs aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-100 bg-white">
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80"
                alt="PDF Learning Illustration"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              {/* Floating icons */}
              <div className="absolute top-6 left-6 bg-white/90 rounded-full p-2 shadow-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute top-6 right-6 bg-white/90 rounded-full p-2 shadow-lg">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="absolute bottom-6 left-6 bg-white/90 rounded-full p-2 shadow-lg">
                <Badge className="h-6 w-6 text-green-600" />
              </div>
              <div className="absolute bottom-6 right-6 bg-white/90 rounded-full p-2 shadow-lg">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-50/90 to-transparent p-4">
                <span className="block text-primary font-bold text-lg drop-shadow">{pdfs[0].title}</span>
                <span className="block text-yellow-900 text-xs mt-1">Featured PDF</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </section>

      {/* 3 Value Additions as boxed cards below the hero section */}
      <section className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg border border-primary/10 p-8 flex flex-col items-center text-center">
            <span className="font-bold text-lg mb-2 text-primary">100% Practical & Science-Backed</span>
            <span className="text-muted-foreground text-sm">Our guides are written by experts and practitioners, blending local wisdom with global best practices. No fluff, just actionable, field-tested knowledge.</span>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-primary/10 p-8 flex flex-col items-center text-center">
            <span className="font-bold text-lg mb-2 text-primary">Bee-First Philosophy</span>
            <span className="text-muted-foreground text-sm">We teach sustainable beekeeping: harvest only what bees can spare, and always put pollinator health first.</span>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-primary/10 p-8 flex flex-col items-center text-center">
            <span className="font-bold text-lg mb-2 text-primary">Empowering Communities</span>
            <span className="text-muted-foreground text-sm">Our materials are designed to uplift farmers, empower women and youth, and build a sustainable future for all.</span>
          </div>
        </div>
      </section>

      {/* PDF Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <Badge variant="secondary">PDF Guides</Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Shop Our Learning PDFs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Downloadable guides for farmers, beekeepers, and anyone passionate about pollination and sustainability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pdfs.map((pdf) => (
              <Card key={pdf.id} className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={pdf.cover}
                      alt={pdf.title}
                      className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                    <Badge variant="secondary" className="absolute top-4 left-4">{pdf.badge}</Badge>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-1">{pdf.title}</h3>
                    <p className="text-primary font-medium mb-3">KES {pdf.price}</p>
                    <p className="text-sm text-muted-foreground mb-3">{pdf.description}</p>
                    <div className="mb-2">{renderStars(pdf.rating)} <span className="text-xs text-muted-foreground">({pdf.reviews} reviews)</span></div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button className="gap-2 flex-1">
                        <Download className="h-4 w-4" />
                        Buy & Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Learn & Grow?</h2>
          <p className="text-lg text-muted-foreground mb-8">Explore our full shop for more resources and products.</p>
          <Button asChild size="lg">
            <Link to="/shop#learn">Go to Learn in Shop</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default BeeLearn;
