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
  ArrowRight,
  ShieldCheck,
  Truck,
  Zap,
  Loader2
} from "lucide-react";
import { getProducts, Product, fallbackProducts } from "@/services/shopService";
import { toast } from "sonner";

const HoneyLanding = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, openCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await getProducts();
        if (data && data.length > 0) {
          setActiveProducts(data);
        } else {
          // Use fallback products if no data from backend
          setActiveProducts(fallbackProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setActiveProducts(fallbackProducts);
        toast.error("Could not load products. Showing cached inventory.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Combine live products with fallbacks for missing categories
  const products = activeProducts.length > 0 ? activeProducts : fallbackProducts;

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

    toast.success(`${product.name} added to cart!`);
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  const getBadgeVariant = (badge: string | null) => {
    if (!badge) return "secondary";
    const b = badge.toLowerCase();
    if (b.includes("best") || b.includes("gold")) return "default";
    if (b.includes("prem") || b.includes("tech")) return "secondary";
    if (b.includes("new") || b.includes("limit")) return "outline";
    return "secondary";
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
    { value: "honey", label: "Honey", icon: Leaf, description: "Pure, traceable honey from Kibwezi" },
    { value: "hardware", label: "Sensors", icon: Cpu, description: "Precision IoT hive monitoring" },
    { value: "merch", label: "Merch", icon: Shirt, description: "Sustainable gear for beekeepers" },
    { value: "education", label: "Learn", icon: BookOpen, description: "Expert guides and handbooks" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Mobile Responsive */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 rounded-l-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-accent/10 rounded-r-full blur-3xl opacity-30" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1 sm:py-1.5 border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-bottom-2 duration-700 text-xs sm:text-sm">
              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2 fill-primary/20" />
              The Future of Apiculture Is Here
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-foreground mb-4 sm:mb-6 tracking-tightest leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Harvest the <span className="text-primary italic">Precision.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
              From our award-winning traceable honey to cutting-edge IoT hive sensors,
              everything in our shop supports the mission of sustainable pollination in Kenya.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 animate-in fade-in mt-2 duration-1000 delay-500">
              <div className="flex items-center gap-2 sm:gap-3 bg-card px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-border/50 shadow-sm">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold">Fast Delivery Nationwide</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 bg-card px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-border/50 shadow-sm">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold">Secure Transactions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Content */}
      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="honey" className="w-full">
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
              <p className="text-muted-foreground font-medium">Synchronizing Hive Inventory...</p>
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
                              // Image fallback if path doesn't exist
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

      {/* Tech CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-primary rounded-[3rem] p-8 lg:p-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-1000" />

          <div className="max-w-3xl relative z-10">
            <h2 className="text-3xl lg:text-5xl font-black text-primary-foreground mb-6 leading-tight">
              Bring Professional Grade <br />
              <span className="italic">Pollination Tech</span> To Your Farm.
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl">
              Our IoT sensors and monitoring solutions help you optimize hive health,
              predict swarming, and maximize honey yield with data-driven insights.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="secondary" className="rounded-2xl font-black" asChild>
                <Link to="/shop">
                  Explore All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl font-black bg-transparent border-white/30 text-white hover:bg-white/10" asChild>
                <Link to="/traceability">
                  Trace Your Honey
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 rounded-2xl bg-muted/30 border border-border/50">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-black text-lg mb-1">100% Natural</h3>
            <p className="text-sm text-muted-foreground">Pure, raw honey with no additives</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-muted/30 border border-border/50">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-black text-lg mb-1">Full Traceability</h3>
            <p className="text-sm text-muted-foreground">Track from hive to home</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-muted/30 border border-border/50">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-black text-lg mb-1">Fast Delivery</h3>
            <p className="text-sm text-muted-foreground">Nationwide shipping available</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-muted/30 border border-border/50">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-black text-lg mb-1">Ethical Sourcing</h3>
            <p className="text-sm text-muted-foreground">Supporting local beekeepers</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HoneyLanding;
