import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  Globe,
  Activity,
  ShoppingBag,
  User
} from "lucide-react";
import { toast } from "sonner";
import { BrandedProductImage } from "@/components/BrandedProductImage";
import { getProducts } from "@/services/shopService";

// Define local types if not importing from service, or reuse
interface ProductVariant {
  id: string;
  size: string;
  price_kes: number;
  stock_quantity: number;
  is_available: boolean;
  batch_code?: string; // For honey traceability
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: 'honey' | 'hardware' | 'merch' | 'education';
  badge: string | null;
  images: string[];
  rating: number;
  review_count: number;
  is_active: boolean;
  variants: ProductVariant[];
}

const STATIC_PRODUCTS: Product[] = [
  {
    id: "h1",
    name: "BeeYield Acacia Premium",
    description: "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "Bestseller",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 245,
    is_active: true,
    variants: [
      { id: "vh1-1", size: "250g", price_kes: 350, stock_quantity: 100, is_available: true, batch_code: "KIB-ACAC-2026-P" },
      { id: "vh1-2", size: "500g", price_kes: 700, stock_quantity: 75, is_available: true, batch_code: "KIB-ACAC-2026-P" },
      { id: "vh1-3", size: "1kg", price_kes: 1400, stock_quantity: 50, is_available: true, batch_code: "KIB-ACAC-2026-P" }
    ]
  },
  {
    id: "h2",
    name: "BeeYield Acacia",
    description: "Our signature Acacia honey, wild-harvested and full of floral notes. Perfect for daily wellness and natural sweetness.",
    category: "honey",
    badge: "Signature",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5.0,
    review_count: 182,
    is_active: true,
    variants: [
      { id: "vh2-1", size: "250g", price_kes: 250, stock_quantity: 80, is_available: true, batch_code: "KIB-ACAC-2026" },
      { id: "vh2-2", size: "500g", price_kes: 500, stock_quantity: 60, is_available: true, batch_code: "KIB-ACAC-2026" },
      { id: "vh2-3", size: "1kg", price_kes: 1000, stock_quantity: 30, is_available: true, batch_code: "KIB-ACAC-2026" }
    ]
  }
];

const Shop = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        if (data && data.length > 0) {
          // Map API response to local Product type if necessary
          const mapped = data.map(p => ({
            ...p,
            category: p.category as Product["category"]
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // No loading state needed
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleSizeChange = (productId: string, size: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.category === 'honey') {
      // Synchronized switching for all honey products
      const newSizes = { ...selectedSizes };
      products.forEach(p => {
        if (p.category === 'honey') {
          // Check if this honey product has the selected size
          const hasSize = p.variants.some(v => v.size === size);
          if (hasSize) {
            newSizes[p.id] = size;
          }
        }
      });
      setSelectedSizes(newSizes);
    } else {
      setSelectedSizes({ ...selectedSizes, [productId]: size });
    }
  };

  const handleAddToCart = (product: Product) => {
    const selectedSize = selectedSizes[product.id] || (product.variants && product.variants.length > 0 ? product.variants[0].size : "");
    const variant = product.variants && product.variants.length > 0
      ? (product.variants.find((v) => v.size === selectedSize) || product.variants[0])
      : null;

    if (!variant || !variant.is_available || variant.stock_quantity <= 0) {
      toast.error("This product is currently out of stock");
      return;
    }

    const variantIndex = variant ? product.variants.indexOf(variant) : -1;

    // Safety check for images
    const image = (variantIndex !== -1 && product.images && product.images[variantIndex + 1])
      ? product.images[variantIndex + 1]
      : (product.images && product.images[0]) || "/placeholder.svg";

    addToCart({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      description: product.description,
      size: selectedSize,
      price: variant.price_kes,
      quantity: 1,
      category: product.category,
      badge: product.badge,
      image: image
    });

    toast.success(`Added ${product.name} to cart`);
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
    { value: "honey", label: "Honey", icon: Leaf, description: "Pure, traceable honey from Kibwezi" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Premium Editorial (matches About page) */}
      <section className="relative py-24 sm:py-32 overflow-hidden bg-neutral-50/50">
        {/* Animated Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#10b981]/[0.03] -skew-x-12 translate-x-32 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-[#facc15]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#10b981]/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Vertical Text Accent */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="absolute left-8 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none"
        >
          <span className="text-[100px] font-black text-neutral-200/50 tracking-tighter leading-none select-none uppercase" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            Collection
          </span>
        </motion.div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="bg-[#10b981]/10 text-[#064e3b] mb-8 hover:bg-[#10b981]/20 transition-colors uppercase tracking-[0.3em] font-black text-[10px] px-5 py-2 rounded-full border border-[#10b981]/20 shadow-sm">
                  <Zap className="w-3.5 h-3.5 mr-2" />
                  Verified Authenticity Hub
                </Badge>
              </motion.div>

              <h1 className="text-6xl md:text-8xl font-black text-[#064e3b] mb-10 tracking-tighter leading-[0.85] uppercase">
                The Gold <span className="text-[#facc15] block italic">Standard.</span>
                <span className="text-[#10b981]">Traceable</span> by Default.
              </h1>

              <p className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-2xl leading-tight font-bold uppercase tracking-tight">
                Every item in our boutique is a proof of concept for uncompromised trust. From 100% raw honey to IoT hive monitoring, quality is verified from the source.
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-neutral-100 shadow-sm">
                  <Truck className="h-5 w-5 text-[#064e3b]" />
                  <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Free Delivery Over 5K KES</span>
                </div>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-neutral-100 shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-[#facc15]" />
                  <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Blockchain Verified</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Stat Card (matches About page) */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-12 -translate-y-1/2 hidden lg:block"
        >
          <div className="relative w-72 h-80">
            <div className="absolute inset-0 bg-[#facc15]/20 rounded-[4rem] blur-3xl" />
            <div className="relative z-10 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#facc15]/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <ShoppingBag className="w-14 h-14 text-[#facc15] mb-6 fill-current opacity-80" />
              <p className="text-4xl font-black text-[#064e3b] mb-2">32</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-t border-neutral-100 pt-3">Traceable Products in the Collection</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Shop Content */}
      <section className="container mx-auto px-6 py-16 lg:py-24">
        <Tabs defaultValue="honey" className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-16">
            {/* Category Section Label */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-1 bg-[#facc15] rounded-full" />
                <p className="text-[10px] font-black text-[#064e3b] uppercase tracking-[0.4em]">The Honey Collection</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <Filter className="h-4 w-4 text-neutral-400" />
                <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Order By</span>
              </div>
              <Select defaultValue="featured">
                <SelectTrigger className="w-[180px] h-12 rounded-xl border-neutral-200 bg-white font-bold text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="featured">Featured Status</SelectItem>
                  <SelectItem value="price-low">Economic to Premium</SelectItem>
                  <SelectItem value="price-high">Premium to Economic</SelectItem>
                  <SelectItem value="rating">Average Rating</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="h-12 rounded-xl px-5 border-neutral-200 bg-white hover:bg-neutral-50 transition-all font-black text-[10px] uppercase tracking-widest gap-2"
                asChild
              >
                <Link to="/my-account">
                  <User className="h-4 w-4 text-[#064e3b]" />
                  <span className="hidden md:inline">My Account</span>
                </Link>
              </Button>
            </div>
          </div>

          {categories.map((category) => (
            <TabsContent key={category.value} value={category.value} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products
                  .filter(p => p.category === category.value)
                  .map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.08 }}
                    >
                      <Card
                        className={cn(
                          "group relative overflow-hidden border-none transition-all duration-500 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] rounded-[3rem]",
                          product.category === 'hardware' ? "bg-white shadow-lg" : "bg-white shadow-md hover:bg-neutral-50/50"
                        )}
                      >
                        <div className="relative">
                          <BrandedProductImage
                            src={(() => {
                              if (!product.variants || product.variants.length === 0) return (product.images && product.images[0]) || "/placeholder.svg";
                              const selectedSize = selectedSizes[product.id] || product.variants[0].size;
                              const variantIndex = product.variants.findIndex(v => v.size === selectedSize);
                              // Structure: [0: Lifestyle, 1: 250g, 2: 500g, 3: 1kg]
                              return (variantIndex !== -1 && product.images && product.images[variantIndex + 1])
                                ? product.images[variantIndex + 1]
                                : (product.images && product.images[0]) || "/placeholder.svg";
                            })()}
                            alt={product.name}
                            category={product.category}
                            badge={product.badge}
                            className={cn(
                              "aspect-square m-2 rounded-[2rem] transition-all duration-700 group-hover:scale-105 group-hover:rotate-1",
                              product.category === 'hardware' ? "bg-[#F4F8FB] shadow-inner border border-primary/5 p-8" : "bg-muted"
                            )}
                          />

                          {product.category === 'honey' && (
                            <div className="absolute top-8 right-8 z-30 animate-in fade-in zoom-in duration-1000 delay-300">
                              <Badge className="bg-white/90 backdrop-blur-sm text-primary border-primary/20 shadow-sm hover:bg-white transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Verified Quality
                              </Badge>
                            </div>
                          )}

                          {product.category === 'hardware' && (
                            <div className="absolute top-8 right-8 z-30">
                              <Badge className="bg-primary/10 backdrop-blur-sm text-primary border-primary/20 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider">
                                <Cpu className="h-3.5 w-3.5" />
                                Pro Grade
                              </Badge>
                            </div>
                          )}


                        </div>

                        <button
                          aria-label="Add to wishlist"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click if any
                            const selectedSize = selectedSizes[product.id] || (product.variants && product.variants.length > 0 ? product.variants[0].size : "");
                            const variantIndex = product.variants.findIndex(v => v.size === selectedSize);
                            const variant = variantIndex !== -1 ? product.variants[variantIndex] : (product.variants[0] || null);

                            // Structure: [0: Lifestyle, 1: 250g, 2: 500g, 3: 1kg]
                            const image = (variantIndex !== -1 && product.images && product.images[variantIndex + 1])
                              ? product.images[variantIndex + 1]
                              : (product.images && product.images[0]) || "/placeholder.svg";

                            toggleWishlist({
                              id: product.id,
                              name: product.name,
                              description: product.description,
                              price: variant?.price_kes || 0,
                              image: image,
                              category: product.category,
                              badge: product.badge,
                              inStock: product.variants.some(v => v.stock_quantity > 0 && v.is_available)
                            });
                          }}
                          className={`absolute top-6 left-6 z-30 p-2.5 rounded-full shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 ${isInWishlist(product.id)
                            ? "bg-primary text-primary-foreground shadow-primary/25"
                            : "bg-white text-muted-foreground hover:bg-primary hover:text-primary-foreground shadow-sm border border-border/10"
                            }`}
                        >
                          <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                        </button>

                        <CardContent className="p-8 pt-4">
                          <div className="flex justify-between items-start mb-2">
                            {renderStars(product.rating, product.review_count)}
                          </div>

                          <h3 className="text-2xl font-black text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-2">
                            {product.name}
                            {product.category === 'hardware' && <Zap className="h-4 w-4 text-primary fill-primary/20" />}
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium mb-6 line-clamp-2 leading-relaxed h-10">
                            {product.description}
                          </p>

                          {product.category === 'hardware' && (
                            <div className="grid grid-cols-2 gap-2 mb-6">
                              <div className="bg-[#F4F8FB] p-2 rounded-xl border border-primary/5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Performance</p>
                                <p className="text-[10px] font-black text-slate-700 leading-none">Ultra Precision</p>
                              </div>
                              <div className="bg-[#F4F8FB] p-2 rounded-xl border border-primary/5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Connectivity</p>
                                <p className="text-[10px] font-black text-slate-700 leading-none">LoRaWAN/GSM</p>
                              </div>
                            </div>
                          )}

                          <div className="space-y-4">
                            {!product.variants || product.variants.length === 0 ? (
                              <div className="h-12 flex items-center px-4 bg-muted/30 rounded-xl">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No variants available</span>
                              </div>
                            ) : product.variants.length > 1 ? (
                              <Select
                                value={selectedSizes[product.id] || product.variants[0].size}
                                onValueChange={(value) => handleSizeChange(product.id, value)}
                              >
                                <SelectTrigger className="w-full h-12 bg-muted/30 border-none rounded-xl font-black uppercase tracking-widest text-[10px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-glow">
                                  {product.variants.map((v) => (
                                    <SelectItem key={v.id} value={v.size} className="font-black uppercase tracking-widest text-[10px] focus:bg-primary focus:text-primary-foreground">
                                      {v.size} — {formatPrice(v.price_kes)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="h-12 flex items-center px-4 bg-muted/30 rounded-xl">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">Edition:</span>
                                <span className="text-xs font-black uppercase tracking-widest">{product.variants[0]?.size}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Price</p>
                                <p className="text-2xl font-black text-foreground">
                                  {formatPrice(
                                    product.variants?.find(
                                      (v) => v.size === (selectedSizes[product.id] || product.variants?.[0]?.size)
                                    )?.price_kes || product.variants?.[0]?.price_kes || 0
                                  )}
                                </p>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button
                                  className={cn(
                                    "w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 shadow-lg px-6",
                                    (!product.variants?.find(v => v.size === (selectedSizes[product.id] || product.variants?.[0]?.size))?.is_available || (product.variants?.find(v => v.size === (selectedSizes[product.id] || product.variants?.[0]?.size))?.stock_quantity ?? 0) <= 0)
                                      ? "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                                      : "bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] shadow-primary/20"
                                  )}
                                  onClick={() => handleAddToCart(product)}
                                  disabled={!product.variants?.find(v => v.size === (selectedSizes[product.id] || product.variants?.[0]?.size))?.is_available || (product.variants?.find(v => v.size === (selectedSizes[product.id] || product.variants?.[0]?.size))?.stock_quantity ?? 0) <= 0}
                                >
                                  {(!product.variants?.find(v => v.size === (selectedSizes[product.id] || product.variants?.[0]?.size))?.is_available || (product.variants?.find(v => v.size === (selectedSizes[product.id] || product.variants?.[0]?.size))?.stock_quantity ?? 0) <= 0) ? (
                                    <span className="flex items-center gap-2">
                                      <ShoppingBag className="h-3.5 w-3.5 opacity-50" />
                                      Sold Out
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-2">
                                      <ShoppingCart className="h-3.5 w-3.5" />
                                      Add to Cart
                                    </span>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Trust & Traceability Proof */}
      <section className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-neutral-900 rounded-[3rem] p-10 md:p-20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#facc15]/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#10b981]/10 to-transparent pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <Badge className="bg-[#facc15] text-neutral-900 border-none mb-8 px-6 py-1.5 font-black uppercase tracking-widest text-xs shadow-lg shadow-[#facc15]/20">
                BeeYield HoneyChain™
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[0.85] tracking-tighter uppercase">
                Trust in Every <span className="text-[#facc15] italic">Blockchain</span> Sealed Jar
              </h2>
              <p className="text-neutral-400 text-lg mb-10 leading-relaxed font-medium">
                Africa's leader in honey traceability. Our HoneyChain™ protocol guarantees authenticity, purity, and full transparency. Look for the QR code on your boutique jar.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  "Immutable Harvest Records",
                  "Verified Flora & Water Sources",
                  "Direct Impact Tracking",
                  "1 Batch per 2kg — Geographic Diversity"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-bold text-sm">
                    <div className="h-5 w-5 rounded-full bg-[#10b981]/20 flex items-center justify-center">
                      <ShieldCheck className="h-3 w-3 text-[#10b981]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                className="h-14 border-2 border-white/20 text-white hover:bg-white hover:text-neutral-900 font-black rounded-2xl px-10 uppercase tracking-widest text-xs transition-all"
                asChild
              >
                <Link to="/traceability">Explore HoneyChain™</Link>
              </Button>
            </div>

            <div className="hidden lg:flex justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-[#facc15]/20 blur-[100px] rounded-full" />
                <div className="w-64 h-64 border-2 border-white/10 rounded-full flex items-center justify-center backdrop-blur-sm bg-white/5">
                  <Cpu className="w-24 h-24 text-[#facc15]/40" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Partners Section */}
      <section className="container mx-auto px-6 py-24 border-t border-neutral-100">
        <div className="text-center mb-16">
          <div className="flex items-center gap-4 justify-center mb-6">
            <div className="w-12 h-1 bg-[#facc15] rounded-full" />
            <p className="text-[10px] font-black text-[#064e3b] uppercase tracking-[0.4em]">Global Ecosystem</p>
            <div className="w-12 h-1 bg-[#facc15] rounded-full" />
          </div>
          <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tighter">Verified Partners</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-12 items-center opacity-40 hover:opacity-100 transition-opacity duration-700">
          {[
            { label: "Regional Farmers", icon: Globe },
            { label: "ApiSense Network", icon: Activity },
            { label: "Intelligent Hives", icon: Cpu },
            { label: "Traceability Core", icon: ShieldCheck }
          ].map((partner, i) => (
            <div key={i} className="flex items-center gap-4 group cursor-pointer">
              <div className="h-12 w-12 bg-neutral-50 rounded-2xl flex items-center justify-center group-hover:bg-[#064e3b] group-hover:text-white transition-all">
                <partner.icon className="h-6 w-6" />
              </div>
              <span className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400 group-hover:text-[#064e3b] transition-colors">
                {partner.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Shop;
