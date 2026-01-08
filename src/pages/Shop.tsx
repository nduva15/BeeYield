import { useState, useEffect } from "react";
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
  Star,
  Leaf,
  Shirt,
  BookOpen,
  Filter,
  Heart,
  ShoppingCart,
  ShoppingBag,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Product, ProductVariant, getProducts } from "@/services/shopService";
import SEO from "@/components/SEO";

const Shop = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedMerchCategory, setSelectedMerchCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart functionality
  const { addToCart, openCart, getTotalItems } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        // Filter out products with no variants to prevent crashes
        const validProducts = data.filter(p => p.variants && p.variants.length > 0);
        setProducts(validProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const honeyProducts = products.filter(p => p.category === 'honey');
  const merchProducts = products.filter(p => p.category === 'merch');
  const educationalProducts = products.filter(p => p.category === 'education');

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  const getBadgeVariant = (badge: string | null) => {
    if (!badge) return "secondary";
    if (badge === "Bestseller" || badge === "Best Value") return "default";
    if (badge === "Premium" || badge === "Professional") return "secondary";
    if (badge === "New" || badge === "Limited" || badge === "New Technology") return "outline";
    return "secondary";
  };

  // Handle Add to Cart for all product types
  const handleAddToCart = (product: Product, category: 'honey' | 'merch' | 'education' | 'hardware') => {
    const selectedSize = selectedSizes[product.id] || product.variants[0].size;
    const variant = product.variants.find((v: ProductVariant) => v.size === selectedSize);

    if (!variant) return;

    addToCart({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      description: product.description,
      size: selectedSize,
      price: variant.price_kes,
      quantity: 1,
      image: product.images[0],
      badge: product.badge,
      category,
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground/30"
              }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Shop | Premium Honey & Beekeeping Hardware"
        description="Shop premium organic honey, professional beekeeping suits, and advanced IoT hive sensors from Intelligent Hives and ApiSense."
      />
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent rounded-full blur-[120px] animate-pulse-delayed" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10 space-y-8">
          <Badge variant="outline" className="mb-4 px-6 py-2 border-primary/30 bg-primary/5 text-primary font-black uppercase tracking-widest backdrop-blur-md">
            <Leaf className="h-4 w-4 mr-2" />
            Sustainably sourced with love
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
            The BeeYield <span className="text-primary italic">Shop</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
            Premium honey, sustainable merch, and expert knowledge, all supporting our mission to revolutionize pollination in Kenya.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-black uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-3 bg-white/50 dark:bg-card/50 px-6 py-3 rounded-2xl border border-border/50 backdrop-blur-md shadow-soft">
              <ShieldCheck className="h-5 w-5 text-primary" />
              100% Traceable Products
            </span>
          </div>
        </div>
      </section>

      {/* Shop Content */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <Tabs defaultValue="honey" className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-16">
            <TabsList className="flex w-full lg:w-auto overflow-x-auto bg-muted/30 p-2 rounded-3xl backdrop-blur-sm border border-border/50 scrollbar-hide">
              <TabsTrigger value="honey" className="flex-1 lg:flex-none h-14 px-8 flex items-center gap-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">
                <Leaf className="h-5 w-5" />
                <span>Honey</span>
              </TabsTrigger>
              <TabsTrigger value="merch" className="flex-1 lg:flex-none h-14 px-8 flex items-center gap-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">
                <Shirt className="h-5 w-5" />
                <span>Merch</span>
              </TabsTrigger>
              <TabsTrigger value="hardware" className="flex-1 lg:flex-none h-14 px-8 flex items-center gap-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">
                <Cpu className="h-5 w-5" />
                <span>Hardware</span>
              </TabsTrigger>
              <TabsTrigger value="learn" className="flex-1 lg:flex-none h-14 px-8 flex items-center gap-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">
                <BookOpen className="h-5 w-5" />
                <span>Learn</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4 self-end lg:self-auto">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Select defaultValue="featured">
                  <SelectTrigger className="w-[200px] h-14 pl-12 border-2 rounded-2xl font-bold bg-muted/20 hover:bg-muted/30 transition-all">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="featured" className="font-bold">Featured</SelectItem>
                    <SelectItem value="price-low" className="font-bold">Price: Low to High</SelectItem>
                    <SelectItem value="price-high" className="font-bold">Price: High to Low</SelectItem>
                    <SelectItem value="rating" className="font-bold">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Honey Tab */}
          <TabsContent value="honey" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {honeyProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden border-none shadow-premium hover:shadow-glow-primary transition-all duration-700 bg-white dark:bg-card rounded-[3rem]">
                  <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                    <img
                      src={product.images[0] || "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.badge && (
                      <Badge variant={getBadgeVariant(product.badge)} className="absolute top-6 left-6 font-black uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-lg border-none">
                        {product.badge}
                      </Badge>
                    )}
                    <button
                      aria-label="Add to wishlist"
                      className="absolute top-6 right-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-xl hover:scale-110 active:scale-95 translate-x-4 group-hover:translate-x-0"
                    >
                      <Heart className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/60 to-transparent">
                      <Button className="w-full h-14 bg-white text-black hover:bg-white/90 font-black rounded-2xl shadow-xl">
                        Verify Traceability
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-10 space-y-6">
                    <div className="flex flex-col gap-2">
                      {renderStars(product.rating)}
                      <h3 className="font-bold text-2xl text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                    </div>
                    <p className="text-base text-muted-foreground font-semibold leading-relaxed line-clamp-2">{product.description}</p>

                    <div className="pt-6 space-y-6 border-t border-border/50">
                      <Select
                        value={selectedSizes[product.id] || product.variants[0].size}
                        onValueChange={(value) => setSelectedSizes({ ...selectedSizes, [product.id]: value })}
                      >
                        <SelectTrigger className="w-full h-14 border-2 rounded-2xl font-bold bg-muted/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {product.variants.map((variant) => (
                            <SelectItem key={variant.size} value={variant.size} className="font-bold">
                              {variant.size} — {formatPrice(variant.price_kes)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        className="w-full h-16 gap-3 font-black text-lg rounded-2xl shadow-glow"
                        onClick={() => handleAddToCart(product, 'honey')}
                      >
                        <ShoppingCart className="h-6 w-6" />
                        Add to Hive Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Merch Tab */}
          <TabsContent value="merch" className="mt-0">
            <div className="flex flex-wrap gap-3 mb-12">
              {["All", "Unisex", "Women", "Kids", "Accessories"].map((cat) => (
                <Button
                  key={cat}
                  variant={selectedMerchCategory === cat ? "default" : "outline"}
                  size="lg"
                  className={`h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${selectedMerchCategory === cat ? "shadow-glow" : "border-2 bg-muted/20 hover:bg-muted/30"}`}
                  onClick={() => setSelectedMerchCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {merchProducts
                .filter((p) =>
                  selectedMerchCategory === "All" ? true : p.category === selectedMerchCategory
                )
                .map((product) => (
                  <Card key={product.id} className="group overflow-hidden border-none shadow-premium hover:shadow-glow-primary transition-all duration-700 bg-white dark:bg-card rounded-[3rem]">
                    <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                      <img
                        src={product.images[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {product.badge && (
                        <Badge variant={getBadgeVariant(product.badge)} className="absolute top-6 left-6 font-black uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-lg border-none">
                          {product.badge}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="absolute top-6 right-6 font-black uppercase tracking-widest px-4 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                        {product.category}
                      </Badge>
                    </div>
                    <CardContent className="p-10 space-y-6">
                      <div className="flex flex-col gap-2">
                        {renderStars(product.rating)}
                        <h3 className="font-bold text-2xl text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                      </div>
                      <p className="text-base text-muted-foreground font-semibold leading-relaxed line-clamp-2">{product.description}</p>

                      <div className="pt-6 space-y-6 border-t border-border/50">
                        <div className="flex flex-wrap gap-3">
                          {product.variants.map((variant: ProductVariant) => (
                            <button
                              key={variant.size}
                              className={`h-10 px-4 text-xs font-black uppercase tracking-widest rounded-xl border-2 transition-all ${(selectedSizes[product.id] || product.variants[0].size) === variant.size
                                ? "border-primary bg-primary/10 text-primary shadow-sm"
                                : "border-border text-muted-foreground hover:border-primary/50"
                                }`}
                              onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: variant.size })}
                            >
                              {variant.size}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Price</span>
                            <span className="text-3xl font-black text-foreground tracking-tighter">
                              {formatPrice(
                                product.variants.find(
                                  (v: ProductVariant) => v.size === (selectedSizes[product.id] || product.variants[0].size)
                                )?.price_kes || product.variants[0].price_kes
                              )}
                            </span>
                          </div>
                          <Button
                            size="lg"
                            className="h-14 px-10 gap-3 font-black rounded-2xl shadow-glow"
                            onClick={() => handleAddToCart(product, 'merch')}
                          >
                            <ShoppingCart className="h-5 w-5" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Hardware Tab */}
          <TabsContent value="hardware" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.filter(p => p.category === 'hardware' && p.variants && p.variants.length > 0).map((product) => (
                <Card key={product.id} className="group overflow-hidden border-none shadow-premium hover:shadow-glow-primary transition-all duration-700 bg-white dark:bg-card rounded-[3rem]">
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    <img
                      src={product.images[0] || "https://images.unsplash.com/photo-1558383331-f520f2888351?w=800"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.badge && (
                      <Badge variant={getBadgeVariant(product.badge)} className="absolute top-6 left-6 z-10 font-black uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-lg border-none">
                        {product.badge}
                      </Badge>
                    )}
                    <div className="absolute bottom-6 right-6 z-10">
                      <Badge variant="outline" className="bg-white/80 backdrop-blur-md font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border-none shadow-premium">
                        IoT Ready
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-10 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      {renderStars(product.rating)}
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Systems v2.0 Live</span>
                    </div>
                    <h3 className="font-bold text-2xl text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-base text-muted-foreground font-semibold leading-relaxed line-clamp-2 min-h-[48px]">{product.description}</p>

                    <div className="flex items-center justify-between pt-6 border-t border-border/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Starting at</span>
                        <span className="text-3xl font-black text-foreground tracking-tighter">{formatPrice(product.variants[0]?.price_kes || 0)}</span>
                      </div>
                      <Button
                        variant="default"
                        className="h-14 px-8 gap-3 font-black rounded-2xl shadow-glow transition-all"
                        onClick={() => {
                          handleAddToCart(product, 'hardware');
                          openCart();
                        }}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Educational Tab */}
          <TabsContent value="learn" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {educationalProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden border-none shadow-premium hover:shadow-glow-primary transition-all duration-700 bg-white dark:bg-card rounded-[3rem]">
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    <img
                      src={product.images[0] || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.badge && (
                      <Badge variant={getBadgeVariant(product.badge)} className="absolute top-6 left-6 font-black uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-lg border-none">
                        {product.badge}
                      </Badge>
                    )}
                    <Badge variant="outline" className="absolute top-6 right-6 bg-white/80 backdrop-blur-md font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border-none shadow-premium">
                      {product.variants[0]?.size || "PDF"}
                    </Badge>
                  </div>
                  <CardContent className="p-10 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      {renderStars(product.rating)}
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Professional Guide</span>
                    </div>
                    <h3 className="font-bold text-2xl text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-base text-muted-foreground font-semibold leading-relaxed line-clamp-2 min-h-[48px]">{product.description}</p>

                    <div className="flex items-center justify-between pt-6 border-t border-border/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Price</span>
                        <span className="text-3xl font-black text-foreground tracking-tighter">{formatPrice(product.variants[0]?.price_kes || 0)}</span>
                      </div>
                      <Button
                        className="h-14 px-10 gap-3 font-black rounded-2xl shadow-glow"
                        onClick={() => {
                          handleAddToCart(product, 'education');
                          openCart();
                        }}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Enroll
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Newsletter/CTA Section */}
      <section className="bg-primary/5 border-y border-border">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Join the Hive Community
            </h2>
            <p className="text-muted-foreground mb-6">
              Get early access to new products, exclusive discounts, and beekeeping tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Cart Trigger (Mobile/Quick Access) */}
      {getTotalItems() > 0 && (
        <button
          onClick={openCart}
          className="fixed bottom-6 right-6 z-40 p-4 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-in fade-in zoom-in duration-300 group"
          aria-label="Open cart"
        >
          <div className="relative">
            <ShoppingBag className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-primary group-hover:bg-white group-hover:text-primary transition-colors">
              {getTotalItems()}
            </span>
          </div>
        </button>
      )}
    </div>
  );
};

export default Shop;
