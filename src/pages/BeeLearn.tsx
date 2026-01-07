
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ShoppingCart, Star, Download, Loader2, PlayCircle, ShieldCheck } from "lucide-react";
import { getProducts, ProductWithVariants } from "@/services/shopService";

function renderStars(rating: number) {
  const fullStars = Math.floor(rating || 0);
  const halfStar = (rating || 0) % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < fullStars ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
      ))}
    </div>
  );
}

const BeeLearn = () => {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inject GTM script into head
    const script = document.createElement('script');
    script.innerHTML = ` (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-KF284247');`;
    script.async = true;
    document.head.appendChild(script);

    const fetchLearnProducts = async () => {
      try {
        const allProducts = await getProducts();
        // Filter for education category
        const learnProducts = allProducts.filter(p => p.category === 'education');
        setProducts(learnProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLearnProducts();

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* BeeLearn Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-background to-primary/10 py-24 sm:py-32">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          {/* Left: Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-6 flex justify-center md:justify-start">
              <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold text-sm border border-yellow-200 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Curated by African Experts
              </span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-yellow-900 mb-6 leading-tight">
              Learning That <span className="text-primary">Gives Back</span>
            </h1>
            <p className="text-lg md:text-2xl text-yellow-900/80 mb-8 max-w-xl font-medium leading-relaxed">
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
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/40 to-transparent" />

              {/* Floating elements */}
              <div className="absolute top-6 left-6 bg-white rounded-2xl p-3 shadow-2xl animate-bounce-slow">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute top-20 right-6 bg-white rounded-2xl p-3 shadow-2xl animate-pulse">
                <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
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
        <div className="absolute -left-20 top-20 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
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
              <h3 className="font-black text-xl mb-3 text-yellow-900">{prop.title}</h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">{prop.content}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-2 mb-6">
              <BookOpen className="h-6 w-6 text-primary" />
              <Badge variant="outline" className="border-primary text-primary font-bold px-4 py-1">Education Hub</Badge>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6">Our Learning Pathways</h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto font-medium">
              Join thousands of beekeepers and conservationists in mastering the art of sustainable pollination.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {products.length > 0 ? (
                products.map((p) => (
                  <Card key={p.id} className="group overflow-hidden border-none shadow-soft hover:shadow-glow transition-all duration-500 bg-white flex flex-col">
                    <CardContent className="p-0 flex flex-col flex-grow">
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <img
                          src={p.images?.[0] || "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=600"}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                        {p.badge && (
                          <Badge className="absolute top-6 left-6 bg-primary text-white font-black text-xs px-4 py-1.5 shadow-lg">
                            {p.badge}
                          </Badge>
                        )}
                        <div className="absolute bottom-6 left-6 text-white font-black text-xl">
                          KES {p.variants?.[0]?.price_kes || '0'}
                        </div>
                      </div>
                      <div className="p-8 flex flex-col flex-grow">
                        <h3 className="text-2xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">{p.name}</h3>
                        <div className="mb-4">{renderStars(p.rating || 0)}</div>
                        <p className="text-muted-foreground font-medium mb-6 line-clamp-3 text-sm leading-relaxed">
                          {p.description}
                        </p>
                        <div className="mt-auto">
                          <Button className="w-full gap-3 font-black h-12 shadow-glow hover:shadow-primary/40 transition-shadow">
                            <ShoppingCart className="h-5 w-5" />
                            Get Started
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-muted/20 rounded-3xl">
                  <p className="text-muted-foreground font-bold">No courses available at the moment. Please check back soon!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-20 bg-yellow-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <blockquote className="text-2xl md:text-4xl font-black italic max-w-4xl mx-auto leading-tight">
            "Knowledge is like honey; it's best when shared, and it never expires. We're seeding a future where everyone can be a guardian of the honey bee."
          </blockquote>
          <p className="mt-8 text-yellow-400 font-bold">— Timothy Mathuva, CEO</p>
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
