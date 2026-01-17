import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
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
  Loader2,
  Globe,
  Activity
} from "lucide-react";
import { Product, fallbackProducts } from "@/services/shopService";
import { toast } from "sonner";
import { BrandedProductImage } from "@/components/BrandedProductImage";

interface ShopProps {
  initialProducts?: Product[];
}

const Shop = ({ initialProducts = [] }: ShopProps) => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  // Initialize with SSR data!
  const [activeProducts, setActiveProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // No useEffect for fetching anymore! SSR handles it.

  // Hardcoded rich fallbacks if backend is empty or for initial dev


  // Combine live products with fallbacks for missing categories
  const products = [...activeProducts];
  const fetchedCategories = new Set(activeProducts.map(p => p.category));

  fallbackProducts.forEach(fallback => {
    if (!fetchedCategories.has(fallback.category)) {
      products.push(fallback);
    }
  });

  const handleAddToCart = (product: Product) => {
    const selectedSize = selectedSizes[product.id] || product.variants[0].size;
    const variantIndex = product.variants.findIndex((v) => v.size === selectedSize);
    const variant = product.variants[variantIndex] || product.variants[0];

    // Structure: [0: Lifestyle, 1: 250g, 2: 500g, 3: 1kg]
    const image = (variantIndex !== -1 && product.images[variantIndex + 1])
      ? product.images[variantIndex + 1]
      : product.images[0];

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
      image: image
    });

    // Optionally open the cart drawer to show the success
    // openCart();
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
                        <BrandedProductImage
                          src={(() => {
                            const selectedSize = selectedSizes[product.id] || product.variants[0].size;
                            const variantIndex = product.variants.findIndex(v => v.size === selectedSize);
                            // Structure: [0: Lifestyle, 1: 250g, 2: 500g, 3: 1kg]
                            return (variantIndex !== -1 && product.images[variantIndex + 1])
                              ? product.images[variantIndex + 1]
                              : product.images[0];
                          })()}
                          alt={product.name}
                          category={product.category}
                          badge={product.badge}
                          className="aspect-square bg-muted m-2 rounded-[2rem]"
                        />

                        <button
                          aria-label="Add to wishlist"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click if any
                            const selectedSize = selectedSizes[product.id] || product.variants[0].size;
                            const variantIndex = product.variants.findIndex(v => v.size === selectedSize);
                            // Structure: [0: Lifestyle, 1: 250g, 2: 500g, 3: 1kg]
                            const image = (variantIndex !== -1 && product.images[variantIndex + 1])
                              ? product.images[variantIndex + 1]
                              : product.images[0];

                            toggleWishlist({
                              id: product.id,
                              name: product.name,
                              description: product.description,
                              price: product.variants[variantIndex]?.price_kes || product.variants[0].price_kes,
                              image: image,
                              category: product.category,
                              badge: product.badge,
                              inStock: product.variants.some(v => v.stock_quantity > 0 && v.is_available)
                            });
                          }}
                          className={`absolute top-6 right-6 z-30 p-2.5 rounded-full shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 ${isInWishlist(product.id)
                            ? "bg-primary text-primary-foreground shadow-primary/25"
                            : "bg-white text-muted-foreground hover:bg-primary hover:text-primary-foreground shadow-black/5 border border-border/10"
                            }`}
                        >
                          <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                        </button>

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
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Price</p>
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
      </section >

      {/* Tech CTA Section */}
      < section className="container mx-auto px-4 py-12" >
        <div className="bg-primary rounded-[3rem] p-8 lg:p-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-1000" />

          <div className="max-w-3xl relative z-10">
            <h2 className="text-3xl lg:text-5xl font-black text-primary-foreground mb-6 leading-tight">
              Bring Professional Grade <br />
              <span className="italic">Pollination Tech</span> To Your Farm.
            </h2>
            <p className="text-primary-foreground/80 text-lg font-medium mb-10 max-w-xl">
              Our hardware solutions aren't just gadgets—they're scientific instruments
              designed to maximize yield and protect the health of your colonies.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="secondary"
                size="lg"
                className="h-14 px-10 rounded-2xl font-black text-primary bg-white hover:bg-white/90"
                asChild
              >
                <Link to="/contact">
                  Request Consultation <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2">
            <div className="w-80 h-80 rounded-[3rem] border-2 border-white/20 rotate-12 flex items-center justify-center p-8 backdrop-blur-sm bg-white/5">
              <Cpu className="w-32 h-32 text-white/40" />
            </div>
          </div>
        </div>
      </section >

      {/* Social Proof / Trust */}
      {/* Partners Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12 bg-muted/30 p-8 rounded-[2rem] border border-border/50">
          <h2 className="text-3xl font-black mb-4">Try BeeYield in your apiary</h2>
          <p className="text-muted-foreground mb-6 font-medium">
            BeeYield is constantly evolving. We invite you to take part in the international testing of our system – together, we can advance technology that protects bees worldwide.
          </p>
          <Button size="lg" className="w-full sm:w-auto rounded-xl font-bold gap-2" asChild>
            <Link to="/contact">Join the Program <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-black mb-8 text-muted-foreground uppercase tracking-widest">Global Partners</h2>
          {/* Partners */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 items-center opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-2xl border border-border/50">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg">Farmers</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-2xl border border-border/50">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg">ApiSense</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-2xl border border-border/50">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg">Intelligent Hives</span>
            </div>
          </div>
        </div>
      </section>
    </div >
  );
};

export default Shop;
