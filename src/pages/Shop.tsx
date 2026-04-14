import { useState } from "react";
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
  Container,
  BookOpen,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { BrandedProductImage } from "@/components/BrandedProductImage";
import { type Product } from "@/services/shopService";
import { CATALOG } from "@/data/catalog";
import { getLearnMaterialByName } from "@/data/learnMaterials";

const STATIC_PRODUCTS: Product[] = CATALOG;

const CATEGORY_CONTENT: Record<string, { eyebrow: string; title: string; description: string; pills: string[] }> = {
  honey: {
    eyebrow: "Traceable Honey",
    title: "Pure honey with verified origin and seasonal harvest batches.",
    description: "Single-origin BeeYield honey with transparent batch handling, clean packaging, and everyday staples for gifting or home use.",
    pills: ["3 jar sizes", "Batch-linked stock", "Verified quality"],
  },
  hardware: {
    eyebrow: "Apiary Technology",
    title: "Sensors, gateways, and monitoring tools built for productive hives.",
    description: "BeeHUB devices and accessories for climate telemetry, weight tracking, solar power, security, and acoustic monitoring.",
    pills: ["Live monitoring", "Solar-ready kits", "Commercial apiaries"],
  },
  merch: {
    eyebrow: "BeeYield Merch Drop",
    title: "Eight branded merch materials designed as one coherent BeeYield collection.",
    description: "Logo-led apparel and fieldwear for beekeepers, partners, and fans of the brand. The range covers beanies, tees, hoodies, carry gear, and a pro bee suit.",
    pills: ["8-piece collection", "Brand-first graphics", "Fieldwear and lifestyle"],
  },
  education: {
    eyebrow: "Bee Academy",
    title: "Guides, courses, and operational playbooks for modern beekeeping.",
    description: "Downloadable learning materials and training products for beginners, commercial operators, and BeeYield technology users.",
    pills: ["PDF guides", "Video learning", "Professional toolkits"],
  },
};

const Shop = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string>("honey");
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleSizeChange = (productId: string, size: string) => {
    const product = STATIC_PRODUCTS.find((item) => item.id === productId);
    if (!product) return;

    if (product.category === "honey") {
      const newSizes = { ...selectedSizes };
      STATIC_PRODUCTS.forEach((item) => {
        if (item.category !== "honey") return;
        const hasSize = item.variants.some((variant) => variant.size === size);
        if (hasSize) {
          newSizes[item.id] = size;
        }
      });
      setSelectedSizes(newSizes);
      return;
    }

    setSelectedSizes({ ...selectedSizes, [productId]: size });
  };

  const handleAddToCart = (product: Product) => {
    const selectedSize = selectedSizes[product.id] || product.variants?.[0]?.size || "";
    const variant = product.variants?.find((item) => item.size === selectedSize) || product.variants?.[0] || null;

    if (!variant || !variant.is_available || variant.stock_quantity <= 0) {
      toast.error("This product is currently out of stock");
      return;
    }

    const variantIndex = product.variants.indexOf(variant);
    const image = variantIndex !== -1 && product.images?.[variantIndex + 1]
      ? product.images[variantIndex + 1]
      : product.images?.[0] || "/placeholder.svg";

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
      image,
    });

    toast.success(`Added ${product.name} to cart`);
  };

  const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

  const renderStars = (rating: number, count: number) => (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-3 w-3 ${index < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>
      <span className="ml-1 text-xs font-medium text-muted-foreground">{rating} ({count})</span>
    </div>
  );

  const visibleProducts = STATIC_PRODUCTS.filter((product) => product.category === activeCategory);
  const categoryContent = CATEGORY_CONTENT[activeCategory] || CATEGORY_CONTENT.honey;

  return (
    <BeeYieldPageShell className="bg-background">
      <section className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">Shop</p>
            <h1 className="text-3xl font-black tracking-tighter text-foreground md:text-4xl">
              BeeYield <span className="text-[#F4D03F]">Store</span>
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              BeeYield honey, merch, technology, and learning materials in one curated store.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="h-11 rounded-xl border-border/50 bg-card px-4 text-sm font-semibold transition-all hover:bg-muted/50"
              asChild
            >
              <Link to="/my-account">
                <User className="h-4 w-4 text-primary" />
                <span>My Account</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-12 flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { id: "honey", label: "Honey products", icon: <Container className="h-4 w-4" /> },
            { id: "hardware", label: "Sensors & Tech", icon: <Cpu className="h-4 w-4" /> },
            { id: "merch", label: "Brand Merch", icon: <ShoppingBag className="h-4 w-4" /> },
            { id: "education", label: "Bee Academy", icon: <BookOpen className="h-4 w-4" /> },
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "whitespace-nowrap rounded-2xl border px-6 py-3 text-xs font-black transition-all duration-300",
                "flex items-center gap-2",
                activeCategory === category.id
                  ? "scale-105 border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "border-border/50 bg-card text-muted-foreground hover:bg-muted/50",
              )}
            >
              {category.icon}
              {category.label}
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

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {visibleProducts.map((product) => {
            const material = product.category === "education" ? getLearnMaterialByName(product.name) : undefined;
            const selectedSize = selectedSizes[product.id] || product.variants?.[0]?.size || "";
            const selectedVariant = product.variants?.find((variant) => variant.size === selectedSize) || product.variants?.[0];
            const variantIndex = selectedVariant ? product.variants.indexOf(selectedVariant) : -1;
            const selectedImage = variantIndex !== -1 && product.images?.[variantIndex + 1]
              ? product.images[variantIndex + 1]
              : product.images?.[0] || "/placeholder.svg";
            const inStock = !!selectedVariant && selectedVariant.is_available && selectedVariant.stock_quantity > 0;

            return (
              <Card
                key={product.id}
                className={cn(
                  "group relative overflow-hidden rounded-[2.5rem] border-none bg-card shadow-premium transition-all duration-500 hover:shadow-glow hover:shadow-primary/5",
                  "hover:bg-[#F9F7F2]0",
                )}
              >
                <div className="relative">
                  <BrandedProductImage
                    src={selectedImage}
                    alt={product.name}
                    category={product.category}
                    badge={product.badge}
                    className="m-2 aspect-square rounded-[2rem] bg-muted transition-all duration-700 group-hover:rotate-1 group-hover:scale-105"
                  />

                  <div className="absolute right-8 top-8 z-30 animate-in zoom-in fade-in duration-1000 delay-300">
                    <Badge className="flex items-center gap-1.5 rounded-full border-primary/20 bg-[#FFF9F0]/90 px-3 py-1.5 text-[10px] font-black tracking-wider text-primary shadow-sm backdrop-blur-sm transition-all hover:bg-[#FFF9F0]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified Quality
                    </Badge>
                  </div>

                  <div className="absolute bottom-8 right-8 z-30">
                    <Badge
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[10px] font-black tracking-wider shadow-sm backdrop-blur-sm",
                        inStock
                          ? "border-emerald-200 bg-emerald-50/90 text-emerald-700"
                          : "border-red-200 bg-red-50/90 text-red-700",
                      )}
                    >
                      {inStock ? "In Stock" : "Out of stock"}
                    </Badge>
                  </div>
                </div>

                <button
                  aria-label="Add to wishlist"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleWishlist({
                      id: product.id,
                      name: product.name,
                      description: product.description,
                      price: selectedVariant?.price_kes || 0,
                      image: selectedImage,
                      category: product.category,
                      badge: product.badge,
                      inStock: product.variants.some((variant) => variant.stock_quantity > 0 && variant.is_available),
                    });
                  }}
                  className={`absolute left-6 top-6 z-30 rounded-full p-2.5 shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isInWishlist(product.id)
                      ? "bg-primary text-primary-foreground shadow-primary/25"
                      : "border border-border/10 bg-[#FFF9F0] text-muted-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                </button>

                <CardContent className="p-8 pt-4">
                  <div className="mb-2 flex items-start justify-between">
                    {renderStars(product.rating, product.review_count)}
                  </div>

                  <h3 className="mb-2 line-clamp-1 flex items-center gap-2 text-2xl font-black text-foreground transition-colors group-hover:text-primary">
                    {product.name}
                  </h3>
                  <p className="mb-6 h-10 line-clamp-2 text-sm font-medium leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>

                  <div className="space-y-4">
                    {!product.variants?.length ? (
                      <div className="flex h-12 items-center rounded-xl bg-muted/30 px-4">
                        <span className="text-[10px] font-black text-muted-foreground">No variants available</span>
                      </div>
                    ) : product.variants.length > 1 ? (
                      <Select
                        value={selectedSizes[product.id] || product.variants[0].size}
                        onValueChange={(value) => handleSizeChange(product.id, value)}
                      >
                        <SelectTrigger className="h-12 w-full rounded-xl border-none bg-muted/30 text-[10px] font-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-glow">
                          {product.variants.map((variant) => (
                            <SelectItem
                              key={variant.id}
                              value={variant.size}
                              className="text-[10px] font-black focus:bg-primary focus:text-primary-foreground"
                            >
                              {variant.size} — {formatPrice(variant.price_kes)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex h-12 items-center rounded-xl bg-muted/30 px-4">
                        <span className="mr-2 text-[10px] font-black text-muted-foreground">Edition:</span>
                        <span className="text-xs font-black">{product.variants[0]?.size}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="mb-0.5 text-[10px] font-black text-muted-foreground">Price</p>
                        <p className="text-2xl font-black text-foreground">
                          {formatPrice(selectedVariant?.price_kes || 0)}
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
                            className="h-11 w-full rounded-2xl border-amber-200 bg-white px-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#1B9157] hover:bg-amber-50"
                          >
                            <a href={material.pdfPath} target="_blank" rel="noreferrer">
                              <Download className="h-3.5 w-3.5" />
                              Open PDF
                            </a>
                          </Button>
                        )}
                        <Button
                          className={cn(
                            "h-12 w-full rounded-2xl px-6 text-[10px] font-black shadow-lg transition-all duration-300",
                            inStock
                              ? "bg-primary text-primary-foreground shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                              : "cursor-not-allowed border border-slate-200 bg-[#F9F7F2] text-slate-400 shadow-none",
                          )}
                          onClick={() => handleAddToCart(product)}
                          disabled={!inStock}
                        >
                          {inStock ? (
                            <span className="flex items-center gap-2">
                              <ShoppingCart className="h-3.5 w-3.5" />
                              Add to Cart
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <ShoppingBag className="h-3.5 w-3.5 opacity-50" />
                              Sold Out
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
