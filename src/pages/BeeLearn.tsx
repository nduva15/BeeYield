import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Leaf,
  BookOpen,
  Shirt,
  Filter,
  Star,
  Heart,
  Cpu,
  Zap,
  Loader2,
  ShieldCheck,
  Users,
  PlayCircle,
  Truck,
} from "lucide-react";
import { getProducts, Product, FALLBACK_PRODUCTS } from "@/services/shopService";
import { getLearningModules, LearningModule } from "@/services/servicesService";
import { toast } from "sonner";

const BeeLearn = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [freeModules, setFreeModules] = useState<LearningModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [allProducts, modules] = await Promise.all([
          getProducts(),
          getLearningModules()
        ]);

        if (allProducts && allProducts.length > 0) {
          setActiveProducts(allProducts);
        }
        setFreeModules(modules);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Could not load products. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combine live products with fallbacks for missing categories
  const products = [...activeProducts];
  const fetchedCategories = new Set(activeProducts.map(p => p.category));

  FALLBACK_PRODUCTS.forEach(fallback => {
    if (!fetchedCategories.has(fallback.category)) {
      products.push(fallback);
    }
  });

  const handleAddToCart = (product: Product) => {
    const selectedSize = selectedSizes[product.id] || product.variants[0].size;
    const variant = product.variants.find((v) => v.size === selectedSize) || product.variants[0];

    addToCart({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      description: product.description,
      size: selectedSize,
      price: variant.price_kes,
      quantity: 1,
      category: product.category as any,
      badge: product.badge,
      image: product.images[0]
    });
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  const renderStars = (rating: number, count: number) => {
    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground/30"
                }`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground font-medium ml-1">{rating} ({count})</span>
      </div>
    );
  };

  const categories = [
    { value: "education", label: "Learn", icon: BookOpen, description: "Expert guides and handbooks" },
    { value: "honey", label: "Honey", icon: Leaf, description: "Pure, traceable honey from Kibwezi" },
    { value: "hardware", label: "Sensors", icon: Cpu, description: "Precision IoT hive monitoring" },
    { value: "merch", label: "Merch", icon: Shirt, description: "Sustainable gear for beekeepers" },
  ];

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
                <a href="#courses">Explore Courses</a>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold border-2 border-primary/20 hover:bg-primary/5">
                <PlayCircle className="mr-2 h-5 w-5" /> Free Lessons
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 animate-in fade-in mt-2 duration-1000 delay-500">
              <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-2xl border border-border/50 shadow-sm">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold">Instant Digital Access</span>
              </div>
              <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-2xl border border-border/50 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold">Lifetime Updates</span>
              </div>
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

      {/* Shop Content with Tabs - Same as Shop Page */}
      <section id="courses" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16 space-y-6">
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <Badge variant="outline" className="border-primary text-primary font-black uppercase tracking-widest px-4 py-1">Full Learning Store</Badge>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tightest leading-none">Shop All Products</h2>
          <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
            Browse our complete catalog — from learning materials to honey, sensors, and merchandise.
          </p>
        </div>

        <Tabs defaultValue="education" className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12">
            <TabsList className="h-auto p-1 bg-muted/30 border border-border/50 rounded-2xl self-start">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <cat.icon className="h-4 w-4 mr-2" />
                  <span className="font-bold tracking-tight">{cat.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Order By</span>
              </div>
              <Select defaultValue="featured">
                <SelectTrigger className="w-[180px] h-12 rounded-xl border-border/50 bg-card">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="featured">Featured Status</SelectItem>
                  <SelectItem value="price-low">Economic to Premium</SelectItem>
                  <SelectItem value="price-high">Premium to Economic</SelectItem>
                  <SelectItem value="rating">Technical Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
              <p className="text-muted-foreground font-medium">Synchronizing Learning Inventory...</p>
            </div>
          ) : (
            categories.map((category) => (
              <TabsContent key={category.value} value={category.value} className="mt-0 animate-in fade-in zoom-in-95 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products
                    .filter(p => p.category === category.value)
                    .map((product) => (
                      <Card
                        key={product.id}
                        className="group overflow-hidden border-none bg-card hover:bg-white/50 transition-all duration-500 shadow-premium hover:shadow-glow hover:shadow-primary/5 rounded-[2.5rem]"
                      >
                        <div className="relative aspect-square overflow-hidden bg-muted m-2 rounded-[2rem]">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {product.badge && (
                            <Badge className="absolute top-4 left-4 min-h-[1.5rem] px-3 font-black uppercase tracking-tighter text-[10px]">
                              {product.badge}
                            </Badge>
                          )}

                          <button
                            aria-label="Add to wishlist"
                            className="absolute top-4 right-4 p-2.5 bg-background/80 backdrop-blur-md rounded-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white"
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                        </div>

                        <CardContent className="p-8 pt-4">
                          <div className="flex justify-between items-start mb-2">
                            {renderStars(product.rating, product.review_count)}
                          </div>

                          <h3 className="text-2xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium mb-6 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>

                          <div className="space-y-4">
                            {product.variants.length > 1 ? (
                              <Select
                                value={selectedSizes[product.id] || product.variants[0].size}
                                onValueChange={(value) => setSelectedSizes({ ...selectedSizes, [product.id]: value })}
                              >
                                <SelectTrigger className="w-full h-12 bg-muted/30 border-none rounded-xl font-bold">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  {product.variants.map((v) => (
                                    <SelectItem key={v.id} value={v.size} className="font-medium">
                                      {v.size} — {formatPrice(v.price_kes)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="h-12 flex items-center px-4 bg-muted/30 rounded-xl">
                                <span className="text-sm font-black uppercase tracking-widest text-muted-foreground mr-2">Edition:</span>
                                <span className="text-sm font-bold">{product.variants[0].size}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Investment</p>
                                <p className="text-2xl font-black text-foreground">
                                  {formatPrice(
                                    product.variants.find(
                                      (v) => v.size === (selectedSizes[product.id] || product.variants[0].size)
                                    )?.price_kes || product.variants[0].price_kes
                                  )}
                                </p>
                              </div>
                              <Button
                                className="h-14 px-8 rounded-2xl gap-2 font-black transition-all active:scale-95 shadow-lg hover:shadow-primary/20"
                                onClick={() => handleAddToCart(product)}
                              >
                                <ShoppingCart className="h-5 w-5" />
                                <span className="hidden sm:inline">Add to Cart</span>
                                <span className="sm:hidden">Add</span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))
          )}
        </Tabs>
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
                <Card key={module.id} className="border-none shadow-soft hover:shadow-glow transition-all bg-white flex flex-col md:flex-row overflow-hidden rounded-2xl">
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
          <p className="mt-8 text-honey-light font-bold">— Timothy Nduva, CEO</p>
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
