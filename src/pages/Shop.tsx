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
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Product, ProductVariant } from "@/services/shopService";

const Shop = () => {
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
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    document.title = "BeeYield Shop | Premium Honey & Beekeeping Hardware";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Shop premium organic honey, professional beekeeping suits, and advanced IoT hive sensors from Intelligent Hives and ApiSense.');
    }
  }, []);

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
        const { getProducts } = await import("@/services/shopService");
        const data = await getProducts();
        setProducts(data);
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
      name: product.name,
      description: product.description,
      size: selectedSize,
      price: variant.price_kes,
      quantity: 1,
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
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-KF284247"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        ></iframe>
      </noscript>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="outline" className="mb-4 px-4 py-1">
            <Leaf className="h-3 w-3 mr-1" />
            Sustainably sourced with love
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            The BeeYield <span className="text-primary">Shop</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Premium honey, sustainable merch, and expert knowledge, all supporting our mission to revolutionize pollination in Kenya.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border">
              100% Traceable Products
            </span>
          </div>
        </div>
      </section>

      {/* Shop Content */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <Tabs defaultValue="honey" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:grid-cols-4 bg-muted/50 p-1">
              <TabsTrigger value="honey" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Leaf className="h-4 w-4" />
                <span className="hidden sm:inline">Honey</span>
              </TabsTrigger>
              <TabsTrigger value="merch" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Shirt className="h-4 w-4" />
                <span className="hidden sm:inline">Merch</span>
              </TabsTrigger>
              <TabsTrigger value="hardware" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Cpu className="h-4 w-4" />
                <span className="hidden sm:inline">Hardware</span>
              </TabsTrigger>
              <TabsTrigger value="learn" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Learn</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="featured">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Honey Tab */}
          <TabsContent value="honey" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {honeyProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-square bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/10 flex items-center justify-center overflow-hidden">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 opacity-80 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl">🍯</span>
                    </div>
                    {product.badge && (
                      <Badge variant={getBadgeVariant(product.badge)} className="absolute top-3 left-3">
                        {product.badge}
                      </Badge>
                    )}
                    <button
                      aria-label="Add to wishlist"
                      className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    >
                      <Heart className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-2">{renderStars(product.rating)}</div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

                    <div className="space-y-3">
                      <Select
                        value={selectedSizes[product.id] || product.variants[0].size}
                        onValueChange={(value) => setSelectedSizes({ ...selectedSizes, [product.id]: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {product.variants.map((variant) => (
                            <SelectItem key={variant.size} value={variant.size}>
                              {variant.size}, {formatPrice(variant.price_kes)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        className="w-full gap-2"
                        onClick={() => handleAddToCart(product, 'honey')}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Merch Tab */}
          <TabsContent value="merch" className="mt-0">
            <div className="flex flex-wrap gap-2 mb-6">
              {["All", "Unisex", "Women", "Kids", "Accessories"].map((cat) => (
                <Button
                  key={cat}
                  variant={selectedMerchCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMerchCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {merchProducts
                .filter((p) =>
                  selectedMerchCategory === "All" ? true : p.category === selectedMerchCategory
                )
                .map((product) => (
                  <Card key={product.id} className="group overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                      <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Shirt className="h-12 w-12 text-primary/50" />
                      </div>
                      {product.badge && (
                        <Badge variant={getBadgeVariant(product.badge)} className="absolute top-3 left-3">
                          {product.badge}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="absolute top-3 right-3">
                        {product.category}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <div className="mb-2">{renderStars(product.rating)}</div>
                      <h3 className="font-semibold text-lg text-foreground mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {product.variants.map((variant: ProductVariant) => (
                            <button
                              key={variant.size}
                              className={`px-3 py-1 text-xs rounded-md border transition-colors ${(selectedSizes[product.id] || product.variants[0].size) === variant.size
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/50"
                                }`}
                              onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: variant.size })}
                            >
                              {variant.size}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-foreground">
                            {formatPrice(
                              product.variants.find(
                                (v: ProductVariant) => v.size === (selectedSizes[product.id] || product.variants[0].size)
                              )?.price_kes || product.variants[0].price_kes
                            )}
                          </span>
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => handleAddToCart(product, 'merch')}
                          >
                            <ShoppingCart className="h-4 w-4" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(p => p.category === 'hardware').map((product) => (
                <Card key={product.id} className="group overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900/50 dark:to-zinc-800/20 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-4 border border-zinc-200 rounded-lg flex items-center justify-center bg-white/50 backdrop-blur-sm">
                      <Cpu className="h-16 w-16 text-zinc-400 group-hover:text-primary transition-colors duration-500" />
                    </div>
                    {product.badge && (
                      <Badge variant={getBadgeVariant(product.badge)} className="absolute top-3 left-3 z-10">
                        {product.badge}
                      </Badge>
                    )}
                    <div className="absolute bottom-3 right-3 z-10">
                      <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                        IoT Ready
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      {renderStars(product.rating)}
                      <span className="text-xs font-mono text-muted-foreground">V 2.0</span>
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">{product.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-bold">Starting at</span>
                        <span className="text-xl font-bold text-foreground">{formatPrice(product.variants[0]?.price_kes || 0)}</span>
                      </div>
                      <Button
                        variant="default"
                        className="gap-2 shadow-lg hover:shadow-xl transition-all"
                        onClick={() => {
                          handleAddToCart(product, 'hardware');
                          openCart();
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Order Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Educational Tab */}
          <TabsContent value="learn" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {educationalProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-4 border-2 border-dashed border-primary/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary/30 group-hover:text-primary/50 transition-colors" />
                    </div>
                    {product.badge && (
                      <Badge variant={getBadgeVariant(product.badge)} className="absolute top-3 left-3">
                        {product.badge}
                      </Badge>
                    )}
                    <Badge variant="outline" className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm">
                      {product.variants[0]?.size || "PDF"}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      {renderStars(product.rating)}
                      <span className="text-xs text-muted-foreground">Professional Guide</span>
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-foreground">{formatPrice(product.variants[0]?.price_kes || 0)}</span>
                      <Button
                        className="gap-2"
                        onClick={() => {
                          handleAddToCart(product, 'education');
                          openCart();
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Buy Now
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
