import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import {
  ShoppingCart,
  Star,
  Heart,
  ShieldCheck,
  ShoppingBag,
  User,
  Cpu,
  Radio,
  Activity,
  Container,
  BookOpen,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { BrandedProductImage } from "@/components/BrandedProductImage";
import { type Product, type ProductVariant } from "@/services/shopService";
import { CATALOG } from "@/data/catalog";
import { getLearnMaterialByName } from "@/data/learnMaterials";

const STATIC_PRODUCTS: Product[] = CATALOG as Product[];
const CATEGORY_CONTENT: Record<string, { eyebrow: string; title: string; description: string; pills: string[] }> = {
  honey: {
    eyebrow: "Traceable Honey",
    title: "Pure honey with verified origin and seasonal harvest batches.",
    description: "Single-origin BeeYield honey with transparent batch handling, clean packaging, and everyday staples for gifting or home use.",
    pills: ["3 jar sizes", "Batch-linked stock", "Verified quality"]
  },
  hardware: {
    eyebrow: "Apiary Technology",
    title: "Sensors, gateways, and monitoring tools built for productive hives.",
    description: "BeeHUB devices and accessories for climate telemetry, weight tracking, solar power, security, and acoustic monitoring.",
    pills: ["Live monitoring", "Solar-ready kits", "Commercial apiaries"]
  },
  merch: {
    eyebrow: "BeeYield Merch Drop",
    title: "Eight branded merch materials designed as one coherent BeeYield collection.",
    description: "Logo-led apparel and fieldwear for beekeepers, partners, and fans of the brand. The range covers beanies, tees, hoodies, carry gear, and a pro bee suit.",
    pills: ["8-piece collection", "Brand-first graphics", "Fieldwear and lifestyle"]
  },
  education: {
    eyebrow: "Bee Academy",
    title: "Guides, courses, and operational playbooks for modern beekeeping.",
    description: "Downloadable learning materials and training products for beginners, commercial operators, and BeeYield technology users.",
    pills: ["PDF guides", "Video learning", "Professional toolkits"]
  }
};

const Shop = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string>("honey");
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleSizeChange = (productId: string, size: string) => {
    const product = STATIC_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    if (product.category === 'honey') {
      const newSizes = { ...selectedSizes };
      STATIC_PRODUCTS.forEach(p => {
        if (p.category === 'honey') {
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

  const formatPrice = (price: number, category?: string) => {
    return `KES ${price.toLocaleString()}`;
  };

  const renderStars = (rating: number, count: number) => {
    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground font-medium ml-1">{rating} ({count})</span>
      </div>
    );
  };

  const visibleProducts = STATIC_PRODUCTS.filter(p => p.category === activeCategory);
  const categoryContent = CATEGORY_CONTENT[activeCategory] || CATEGORY_CONTENT.honey;

  return (
    <BeeYieldPageShell className="bg-background">
      {/* Shop */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">Shop</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">
              BeeYield <span className="text-[#F4D03F]">Store</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              BeeYield honey, merch, technology, and learning materials in one curated store.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              className="h-11 rounded-xl px-4 border-border/50 bg-card hover:bg-muted/50 transition-all font-semibold text-sm gap-2"
              asChild
            >
              <Link to="/my-account">
                <User className="h-4 w-4 text-primary" />
                <span>My Account</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { id: "honey", label: "Honey products", icon: <Container className="h-4 w-4" /> },
            { id: "hardware", label: "Sensors & Tech", icon: <Cpu className="h-4 w-4" /> },
            { id: "merch", label: "Brand Merch", icon: <ShoppingBag className="h-4 w-4" /> },
            { id: "education", label: "Bee Academy", icon: <BookOpen className="h-4 w-4" /> }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all duration-300 border whitespace-nowrap",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                  : "bg-card text-muted-foreground border-border/50 hover:bg-muted/50"
              )}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        <section className="mb-10 overflow-hidden rounded-[2rem] border border-border/50 bg-gradient-to-br from-[#FFF9F0] via-white to-[#F4D03F]/15 p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#1B9157]">
                {categoryContent.eyebrow}
              </p>
              <h2 className="text-2xl font-black tracking-tight text-[#1A1A1A] md:text-3xl">
                {categoryContent.title}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-[#1B4332]/75">
                {categoryContent.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {categoryContent.pills.map((pill) => (
                <Badge
                  key={pill}
                  className="rounded-full border border-[#1B9157]/15 bg-white/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#1B9157] shadow-sm"
                >
                  {pill}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {visibleProducts.map((product) => {
            const material = product.category === "education" ? getLearnMaterialByName(product.name) : undefined;

            return (
            <Card
              key={product.id}
              className={cn(
                "group relative overflow-hidden border-none transition-all duration-500 shadow-premium hover:shadow-glow hover:shadow-primary/5 rounded-[2.5rem]",
                "bg-card hover:bg-[#F9F7F2]0"
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
                            "bg-muted"
                          )}
                        />

                        <div className="absolute top-8 right-8 z-30 animate-in fade-in zoom-in duration-1000 delay-300">
                          <Badge className="bg-[#FFF9F0]/90 backdrop-blur-sm text-primary border-primary/20 shadow-sm hover:bg-[#FFF9F0] transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] tracking-wider">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified Quality
                          </Badge>
                        </div>

                        {/* Availability badge */}
                        {(() => {
                          const selectedSize = selectedSizes[product.id] || (product.variants?.[0]?.size ?? "");
                          const v = product.variants?.find((vv) => vv.size === selectedSize) || product.variants?.[0];
                          const inStock = !!v && v.is_available && (v.stock_quantity ?? 0) > 0;
                          const label = inStock ? 'In Stock' : 'Out of stock';
                          return (
                            <div className="absolute bottom-8 right-8 z-30">
                              <Badge
                                className={cn(
                                  "backdrop-blur-sm shadow-sm font-black text-[10px] tracking-wider px-3 py-1.5 rounded-full border",
                                  inStock
                                    ? "bg-emerald-50/90 text-emerald-700 border-emerald-200"
                                    : "bg-red-50/90 text-red-700 border-red-200"
                                )}
                              >
                                {label}
                              </Badge>
                            </div>
                          );
                        })()}


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
                          : "bg-[#FFF9F0] text-muted-foreground hover:bg-primary hover:text-primary-foreground shadow-sm border border-border/10"
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
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium mb-6 line-clamp-2 leading-relaxed h-10">
                          {product.description}
                        </p>

                        <div className="space-y-4">
                          {!product.variants || product.variants.length === 0 ? (
                            <div className="h-12 flex items-center px-4 bg-muted/30 rounded-xl">
                              <span className="text-[10px] font-black text-muted-foreground">No variants available</span>
                            </div>
                          ) : product.variants.length > 1 ? (
                            <Select
                              value={selectedSizes[product.id] || product.variants[0].size}
                              onValueChange={(value) => handleSizeChange(product.id, value)}
                            >
                              <SelectTrigger className="w-full h-12 bg-muted/30 border-none rounded-xl font-black text-[10px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-none shadow-glow">
                                {product.variants.map((v) => (
                                  <SelectItem key={v.id} value={v.size} className="font-black text-[10px] focus:bg-primary focus:text-primary-foreground">
                                    {v.size} — {formatPrice(v.price_kes)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="h-12 flex items-center px-4 bg-muted/30 rounded-xl">
                              <span className="text-[10px] font-black text-muted-foreground mr-2">Edition:</span>
                              <span className="text-xs font-black">{product.variants[0]?.size}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="text-[10px] font-black text-muted-foreground mb-0.5">Price</p>
                              <p className="text-2xl font-black text-foreground">
                                {formatPrice(
                                  product.variants?.find(
                                    (v) => v.size === (selectedSizes[product.id] || product.variants?.[0]?.size)
                                  )?.price_kes || product.variants?.[0]?.price_kes || 0,
                                  product.category
                                )}
                              </p>
                              {material && (
                                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#1B9157]">
                                  {material.formatLabel}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              {material && (
                                <Button
                                  asChild
                                  variant="outline"
                                  className="w-full h-11 rounded-2xl border-amber-200 bg-white px-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#1B9157] hover:bg-amber-50"
                                >
                                  <a href={material.pdfPath} target="_blank" rel="noreferrer">
                                    <Download className="h-3.5 w-3.5" />
                                    Open PDF
                                  </a>
                                </Button>
                              )}
                              <Button
                                className={cn(
                                  "w-full h-12 rounded-2xl font-black text-[10px] transition-all duration-300 shadow-lg px-6",
                                  (!product.variants?.find(v => v.size === (selectedSizes[product.id] || product.variants?.[0]?.size))?.is_available || (product.variants?.find(v => v.size === (selectedSizes[product.id] || product.variants?.[0]?.size))?.stock_quantity ?? 0) <= 0)
                                    ? "bg-[#F9F7F2] text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
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
            );
          })}
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default Shop;
