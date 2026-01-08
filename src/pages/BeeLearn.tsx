
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ShoppingCart, Star, Download, Loader2, PlayCircle, ShieldCheck, Heart, Users } from "lucide-react";
import { getProducts, Product } from "@/services/shopService";
import { getLearningModules, LearningModule } from "@/services/servicesService";

function renderStars(rating: number) {
  const fullStars = Math.floor(rating || 0);
  const halfStar = (rating || 0) % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < fullStars ? 'text-honey-light fill-honey-light' : 'text-muted'}`} />
      ))}
    </div>
  );
}

const BeeLearn = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [freeModules, setFreeModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearnProducts = async () => {
      try {
        const [allProducts, modules] = await Promise.all([
          getProducts(),
          getLearningModules()
        ]);

        // Filter for education category
        const learnProducts = allProducts.filter(p => p.category === 'education');
        setProducts(learnProducts);
        setFreeModules(modules);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLearnProducts();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* BeeLearn Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary/5 via-background to-primary/10 py-24 sm:py-32">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          {/* Left: Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-6 flex justify-center md:justify-start">
              <span className="inline-flex items-center gap-2 bg-honey-light/10 text-honey-dark px-4 py-2 rounded-full font-bold text-sm border border-honey-light/20 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Curated by African Experts
              </span>
            </div>
            <h1 className="text-display-xl md:text-display-2xl font-black text-honey-dark mb-8 leading-none tracking-tightest">
              Learning That <br />
              <span className="text-primary italic">Gives Back</span>
            </h1>
            <p className="text-lg md:text-2xl text-honey-dark/80 mb-8 max-w-xl font-medium leading-relaxed">
              We share only the best, most sustainable knowledge. Every course contributes to pollinator health and farmers' success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center md:justify-start">
              <Button asChild size="lg" className="bg-primary text-white font-bold h-14 px-8 text-lg shadow-glow shadow-primary/20">
                <Link to="/shop#learn">Explore Courses</Link>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold border-2 border-primary/20 hover:bg-primary/5">
                <PlayCircle className="mr-2 h-5 w-5" /> Free Lessons
              </Button>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="flex-1 hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-white group">
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
                alt="Learning Hub"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-honey-dark/40 to-transparent" />

              {/* Floating elements */}
              <div className="absolute top-6 left-6 bg-white rounded-2xl p-3 shadow-2xl animate-bounce-slow">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute top-20 right-6 bg-white rounded-2xl p-3 shadow-2xl animate-pulse">
                <Star className="h-8 w-8 text-honey-light fill-honey-light" />
              </div>

              <div className="absolute bottom-8 left-0 right-0 p-8 text-white">
                <span className="block text-white font-black text-2xl drop-shadow-md">Professional Beekeeping V2</span>
                <span className="block text-white/90 text-sm mt-2 font-bold bg-primary/40 inline-block px-3 py-1 rounded-full backdrop-blur-sm">Featured Course</span>
              </div>
            </div>
          </div>
        </div>

        {/* Abstract Backgrounds */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 origin-top-right -z-0" />
        <div className="absolute -left-20 top-20 w-80 h-80 bg-honey-light/10 rounded-full blur-3xl animate-pulse" />
      </section>

      {/* Value Props */}
      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Practical & Science-Backed", content: "Expert guides written by practitioners, blending local wisdom with global best practices.", icon: ShieldCheck },
            { title: "Bee-First Philosophy", content: "Learn sustainable beekeeping: harvest only what bees spare, putting pollinator health first.", icon: Heart },
            { title: "Empowering Communities", content: "Designed to uplift farmers, women, and youth for a sustainable industrial future.", icon: Users }
          ].map((prop, i) => (
            <Card key={i} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-none p-8 flex flex-col items-center text-center transition-transform hover:-translate-y-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <prop.icon className="h-8 w-8" />
              </div>
              <h3 className="font-black text-xl mb-3 text-honey-dark">{prop.title}</h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">{prop.content}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24 space-y-6">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <Badge variant="outline" className="border-primary text-primary font-black uppercase tracking-widest px-4 py-1">Expert-Led Curriculum</Badge>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tightest leading-none">Our Learning Pathways</h2>
            <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
              Join thousands of beekeepers and conservationists in mastering the art of sustainable pollination.
            </p>
          </div>

          {/* Course Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.length > 0 ? (
              products.map((product) => (
                <Card key={product.id} className="group overflow-hidden border-none shadow-premium hover:shadow-glow transition-all duration-700 bg-white dark:bg-card rounded-[3rem]">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img
                      src={product.images?.[0] || "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.badge && (
                      <Badge className="absolute top-6 right-6 bg-primary shadow-glow font-black border-none px-4 py-2 rounded-xl">{product.badge}</Badge>
                    )}
                  </div>
                  <CardContent className="p-10">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-3xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary tracking-tighter">KES {product.variants?.[0]?.price_kes?.toLocaleString() || "0"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-8">
                      {renderStars(product.rating || 5)}
                      <span className="text-muted-foreground font-black text-xs uppercase tracking-widest">({product.review_count || 0} reviews)</span>
                    </div>
                    <Button asChild className="w-full font-black h-14 rounded-2xl shadow-glow text-lg">
                      <Link to={`/shop?product=${product.id}`}>
                        <ShoppingCart className="mr-2 h-5 w-5" /> Enroll Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-muted/20 rounded-3xl">
                <p className="text-muted-foreground font-bold">No courses available currently. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Free learning modules section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6">Free Learning Resources</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto font-medium">
              Start your journey with our community-supported open access modules.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {freeModules.length > 0 ? (
              freeModules.map((module) => (
                <Card key={module.id} className="border-none shadow-soft hover:shadow-glow transition-all bg-white flex flex-col md:flex-row overflow-hidden">
                  <div className="md:w-1/3 bg-primary/10 flex items-center justify-center p-8">
                    <BookOpen className="h-12 w-12 text-primary" />
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center md:w-2/3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="font-bold text-xs uppercase tracking-wider">{module.category}</Badge>
                      <span className="text-xs font-bold text-muted-foreground uppercase">{module.difficulty_level}</span>
                    </div>
                    <h3 className="text-xl font-black mb-2">{module.title}</h3>
                    <p className="text-muted-foreground text-sm mb-6">{module.description}</p>
                    <Button variant="outline" className="self-start font-bold border-2 border-primary/20 hover:bg-primary/5">
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-10 text-center">
                <p className="text-muted-foreground font-bold">New free modules coming soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-20 bg-secondary text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <blockquote className="text-2xl md:text-4xl font-black italic max-w-4xl mx-auto leading-tight">
            "Knowledge is like honey; it's best when shared, and it never expires. We're seeding a future where everyone can be a guardian of the honey bee."
          </blockquote>
          <p className="mt-8 text-honey-light font-bold">— Timothy Mathuva, CEO</p>
        </div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-primary/10 rounded-full blur-2xl" />
      </section>

      {/* Final CTA */}
      <section className="py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-foreground tracking-tight">Ready to Impact the Hive?</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium">Explore our equipment and premium honey in the full shop.</p>
          <Button asChild size="lg" className="font-black h-16 px-12 text-xl shadow-2xl">
            <Link to="/shop">Visit Full Shop</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default BeeLearn;
