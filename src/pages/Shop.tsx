import { useState, useEffect } from "react";
import { apiGet } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Shirt, BookOpen, Filter, Heart, ShoppingCart, Star } from "lucide-react";

interface ProductVariant {
  size: string;
  price?: number;
  price_kes?: number;
}

interface Product {
  id: number | string;
  name: string;
  description: string;
  category?: string;
  variants: ProductVariant[];
  badge?: string | null;
  rating: number;
  reviews: number;
  format?: string;
  pages?: number;
  price?: number;
}

const Shop = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await apiGet<Product[]>("/shop/products");
        setProducts(data || []);

        // Initialize default sizes for each product
        const initialSizes: Record<string, string> = {};
        data?.forEach(product => {
          if (product.variants?.length > 0) {
            initialSizes[product.id] = product.variants[0].size;
          }
        });
        setSelectedSizes(initialSizes);
      } catch (err: unknown) {
        console.error("Failed to fetch products:", err);
        setError("Unable to load products. Showing offline collection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Group products by category
  const honeyProducts = products.filter(p => p.category?.toLowerCase().includes("honey") || p.category === "Food");
  const merchProducts = products.filter(p => ["merch", "apparel", "accessories"].includes(p.category?.toLowerCase() || ""));
  const educationalProducts = products.filter(p => ["learn", "education", "guides"].includes(p.category?.toLowerCase() || ""));
  const hardwareProducts = products.filter(p => ["hardware", "systems", "technology"].includes(p.category?.toLowerCase() || ""));

  // Fallback to mock data if API fails or returns nothing
  const displayHoney: Product[] = honeyProducts.length > 0 ? honeyProducts : [
    {
      id: 1,
      name: "Kibwezi Wildflower",
      description: "Pure honey from the diverse wildflower meadows of Makueni",
      variants: [
        { size: "250g", price: 850 },
        { size: "500g", price: 1500 },
        { size: "1kg", price: 2800 },
      ],
      badge: "Bestseller",
      rating: 4.9,
      reviews: 127,
    },
    {
      id: 2,
      name: "Acacia Gold",
      description: "Light, crystalline honey with a delicate sweet flavor",
      variants: [
        { size: "250g", price: 950 },
        { size: "500g", price: 1700 },
        { size: "1kg", price: 3200 },
      ],
      badge: "Premium",
      rating: 4.8,
      reviews: 89,
    },
    {
      id: 3,
      name: "Forest Dark",
      description: "Rich, robust honey from mountain forest blossoms",
      variants: [
        { size: "250g", price: 900 },
        { size: "500g", price: 1600 },
        { size: "1kg", price: 3000 },
      ],
      badge: null,
      rating: 4.7,
      reviews: 64,
    },
    {
      id: 4,
      name: "Raw Honeycomb",
      description: "Unprocessed honeycomb pieces in natural beeswax",
      variants: [
        { size: "200g", price: 1200 },
        { size: "400g", price: 2200 },
      ],
      badge: "Limited",
      rating: 5.0,
      reviews: 43,
    },
    {
      id: 5,
      name: "Sisal Flower Honey",
      description: "Unique honey from sisal plant blooms",
      variants: [
        { size: "250g", price: 800 },
        { size: "500g", price: 1400 },
        { size: "1kg", price: 2600 },
      ],
      badge: "New",
      rating: 4.6,
      reviews: 28,
    },
    {
      id: 6,
      name: "Gift Box Collection",
      description: "Curated selection of 4 honey varieties",
      variants: [
        { size: "4x125g", price: 2500 },
        { size: "4x250g", price: 4200 },
      ],
      badge: "Gift Set",
      rating: 4.9,
      reviews: 56,
    },
  ];

  const displayMerch: Product[] = merchProducts.length > 0 ? merchProducts : [
    {
      id: 101,
      name: "BeeYield Classic Tee",
      description: "100% organic cotton with embroidered logo",
      category: "Unisex",
      variants: [
        { size: "S", price_kes: 1800 },
        { size: "M", price_kes: 1800 },
        { size: "L", price_kes: 1800 },
        { size: "XL", price_kes: 1800 },
        { size: "XXL", price_kes: 2000 },
      ],
      badge: "Bestseller",
      rating: 4.8,
      reviews: 89,
    },
    {
      id: 102,
      name: "Beekeeper's Cap",
      description: "Adjustable cotton cap with bee embroidery",
      category: "Unisex",
      variants: [
        { size: "One Size", price_kes: 1200 },
      ],
      badge: null,
      rating: 4.7,
      reviews: 45,
    },
    {
      id: 103,
      name: "Pollinator Hoodie",
      description: "Cozy fleece hoodie with back print",
      category: "Unisex",
      variants: [
        { size: "S", price_kes: 3500 },
        { size: "M", price_kes: 3500 },
        { size: "L", price_kes: 3500 },
        { size: "XL", price_kes: 3500 },
        { size: "XXL", price_kes: 3800 },
      ],
      badge: "Premium",
      rating: 4.9,
      reviews: 67,
    }
  ];

  const displayLearn: Product[] = educationalProducts.length > 0 ? educationalProducts : [
    {
      id: 201,
      name: "Beginner's Beekeeping Guide",
      description: "Complete PDF guide for starting your beekeeping journey",
      format: "PDF",
      pages: 85,
      price: 1500,
      badge: "Bestseller",
      rating: 4.9,
      reviews: 156,
      variants: [{ size: "Digital", price_kes: 1500 }]
    },
    {
      id: 202,
      name: "Precision Pollination Handbook",
      description: "Advanced techniques for agricultural pollination",
      format: "PDF",
      pages: 120,
      price: 2500,
      badge: "Professional",
      rating: 4.8,
      reviews: 89,
      variants: [{ size: "Digital", price_kes: 2500 }]
    }
  ];

  const displayHardware: Product[] = hardwareProducts.length > 0 ? hardwareProducts : [
    {
      id: 301,
      name: "ApiSense Sentinel Node",
      description: "IoT hive monitor with acoustic disease detection and gas sensing.",
      variants: [{ size: "Unit", price_kes: 15000 }],
      badge: "New Tech",
      rating: 5.0,
      reviews: 12,
      category: "Hardware",
    },
    {
      id: 302,
      name: "Intelligent Hive Scale",
      description: "Precision weight and environment monitoring with 4G connectivity.",
      variants: [{ size: "Unit", price_kes: 12500 }],
      badge: "Best Value",
      rating: 4.8,
      reviews: 24,
      category: "Hardware",
    }
  ];

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  const getBadgeVariant = (badge: string | null) => {
    if (!badge) return "secondary";
    if (badge === "Bestseller" || badge === "Best Value") return "default";
    if (badge === "Premium" || badge === "Professional") return "secondary";
    if (badge === "New" || badge === "Limited") return "outline";
    return "secondary";
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
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="outline" className="mb-4 px-4 py-1">
            <Leaf className="h-3 w-3 mr-1" />
            From Kibwezi with Love
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            The BeeYield <span className="text-primary">Shop</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Premium honey, sustainable merch, and expert knowledge — all supporting our mission to revolutionize pollination in Kenya.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Free delivery over KES 5,000
            </span>
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
            <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-muted/50 p-1">
              <TabsTrigger value="honey" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Leaf className="h-4 w-4" />
                <span className="hidden sm:inline">Honey</span>
              </TabsTrigger>
              <TabsTrigger value="merch" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Shirt className="h-4 w-4" />
                <span className="hidden sm:inline">Merch</span>
              </TabsTrigger>
              <TabsTrigger value="learn" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Learn</span>
              </TabsTrigger>
              <TabsTrigger value="hardware" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Cpu className="h-4 w-4" />
                <span className="hidden sm:inline">Systems</span>
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
              {displayHoney.map((product) => (
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
                              {variant.size} — {formatPrice(variant.price_kes)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button className="w-full gap-2">
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
                <Button key={cat} variant={cat === "All" ? "default" : "outline"} size="sm">
                  {cat}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayMerch.map((product) => (
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
                        {product.variants.map((variant, idx) => (
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
                              (v) => v.size === (selectedSizes[product.id] || product.variants[0].size)
                            )?.price_kes || product.variants[0].price_kes || 0
                          )}
                        </span>
                        <Button size="sm" className="gap-2">
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

          {/* Educational Tab */}
          <TabsContent value="learn" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayLearn.map((product) => (
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
                      {product.format}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      {renderStars(product.rating)}
                      <span className="text-xs text-muted-foreground">{product.pages} pages</span>
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-foreground">{formatPrice(product.variants?.[0]?.price_kes || product.price)}</span>
                      <Button className="gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Hardware Tab */}
          <TabsContent value="hardware" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayHardware.map((product) => (
                <Card key={product.id} className="group overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-square bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-900/20 dark:to-neutral-800/10 flex items-center justify-center overflow-hidden">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-nature-green/10 to-nature-green/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Cpu className="h-16 w-16 text-nature-green/40" />
                    </div>
                    {product.badge && (
                      <Badge variant={getBadgeVariant(product.badge)} className="absolute top-3 left-3">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-2">{renderStars(product.rating)}</div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-foreground">
                        {formatPrice(product.variants?.[0]?.price_kes || 0)}
                      </span>
                      <Button className="gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
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
    </div>
  );
};

export default Shop;
