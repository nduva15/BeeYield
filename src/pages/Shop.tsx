import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Container,
  Cpu,
  Download,
  Heart,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { BrandedProductImage } from "@/components/BrandedProductImage";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { getLearnMaterialByName } from "@/data/learnMaterials";
import { CATALOG } from "@/data/catalog";
import { cn } from "@/lib/utils";
import { getProducts, type Product } from "@/services/shopService";

const STATIC_PRODUCTS: Product[] = CATALOG as Product[];

const CATEGORY_META = {
  honey: {
    label: "Honey products",
    eyebrow: "Traceable harvests",
    title: "Single-origin jars and gifting formats with verified batch handling.",
    description:
      "Production-ready inventory for everyday orders, gifting moments, and repeat household buying.",
    icon: Container,
  },
  hardware: {
    label: "Sensors & tech",
    eyebrow: "Apiary systems",
    title: "Field devices and monitoring hardware for serious hive operations.",
    description:
      "BeeYield hardware for telemetry, security, solar deployment, and remote observation.",
    icon: Cpu,
  },
  merch: {
    label: "Brand merch",
    eyebrow: "Fieldwear collection",
    title: "BeeYield apparel and utility pieces built around the core identity system.",
    description:
      "Wearable brand assets for partners, teams, retail drops, and beekeeper communities.",
    icon: ShoppingBag,
  },
  education: {
    label: "Bee academy",
    eyebrow: "Operator knowledge",
    title: "Downloadable guides, training packs, and commercial playbooks.",
    description:
      "Learning materials for first-time keepers, field teams, and digital hive operators.",
    icon: BookOpen,
  },
} as const;

const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

const Shop = () => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<keyof typeof CATEGORY_META>("honey");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      try {
        const liveProducts = await getProducts();
        if (!cancelled && liveProducts.length > 0) {
          setProducts(liveProducts.filter((product) => product.is_active));
        }
      } catch (error) {
        console.error("Failed to load live products, using fallback catalog:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleProducts = useMemo(
    () => products.filter((product) => product.category === activeCategory),
    [activeCategory, products],
  );

  const categoryMeta = CATEGORY_META[activeCategory];
  const categoryCounts = useMemo(() => {
    return Object.keys(CATEGORY_META).reduce<Record<string, number>>((acc, key) => {
      acc[key] = products.filter((product) => product.category === key).length;
      return acc;
    }, {});
  }, [products]);

  const selectVariant = (product: Product) => {
    const chosenSize = selectedSizes[product.id] || product.variants[0]?.size;
    return product.variants.find((variant) => variant.size === chosenSize) || product.variants[0];
  };

  const handleSizeChange = (product: Product, size: string) => {
    setSelectedSizes((current) => ({ ...current, [product.id]: size }));
  };

  const handleAddToCart = (product: Product) => {
    const variant = selectVariant(product);
    if (!variant || !variant.is_available || variant.stock_quantity <= 0) {
      toast.error("This item is currently unavailable");
      return;
    }

    const variantIndex = product.variants.findIndex((entry) => entry.id === variant.id);
    const image = product.images[variantIndex + 1] || product.images[0] || "/placeholder.svg";

    addToCart({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      description: product.description,
      size: variant.size,
      price: variant.price_kes,
      quantity: 1,
      category: product.category,
      badge: product.badge,
      image,
    });
  };

  return (
    <BeeYieldPageShell className="bg-background">
      <section className="border-b border-border/40 bg-[radial-gradient(circle_at_top_left,_rgba(244,208,63,0.22),_transparent_32%),linear-gradient(135deg,_#fff9f0_0%,_#f9f7f2_48%,_#eef7f1_100%)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-10 md:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-16">
          <div className="max-w-3xl space-y-5">
            <Badge className="rounded-full border border-[#1B9157]/15 bg-white/85 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#1B9157]">
              BeeYield Commerce
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-black tracking-[-0.05em] text-[#1A1A1A] md:text-6xl">
                Shop honey, hardware, fieldwear, and education in one clean buying flow.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[#1B4332]/78 md:text-base">
                Real product inventory, stored customer preferences, and checkout-ready ordering across Kenya.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-full px-6 text-sm font-black shadow-glow">
                <Link to="/checkout">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Review Cart
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-border/50 bg-white/80 px-6 text-sm font-black">
                <Link to="/my-account">
                  <User className="mr-2 h-4 w-4" />
                  My Account
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(CATEGORY_META).map(([key, meta], index) => (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => setActiveCategory(key as keyof typeof CATEGORY_META)}
                className={cn(
                  "rounded-[1.75rem] border px-4 py-4 text-left transition-all",
                  activeCategory === key
                    ? "border-[#1A1A1A]/10 bg-[#1A1A1A] text-white shadow-diffuse"
                    : "border-border/50 bg-white/75 text-[#1A1A1A] hover:border-[#1B9157]/20 hover:bg-white",
                )}
              >
                <meta.icon className={cn("mb-5 h-5 w-5", activeCategory === key ? "text-[#F4D03F]" : "text-[#1B9157]")} />
                <p className="text-[11px] font-black uppercase tracking-[0.16em]">
                  {meta.label}
                </p>
                <p className={cn("mt-2 text-2xl font-black tracking-tight", activeCategory === key ? "text-white" : "text-[#1A1A1A]")}>
                  {categoryCounts[key] || 0}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-border/50 bg-white shadow-soft">
          <div className="grid gap-0 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-5 px-6 py-7 md:px-8 md:py-9">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#1B9157]">
                {categoryMeta.eyebrow}
              </p>
              <div className="space-y-3">
                <h2 className="max-w-3xl text-3xl font-black tracking-tight text-[#1A1A1A] md:text-4xl">
                  {categoryMeta.title}
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-[#1B4332]/75">
                  {categoryMeta.description}
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between border-l border-border/40 bg-[#1A1A1A] px-6 py-7 text-white md:px-8 md:py-9">
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                  Store promise
                </p>
                <p className="text-lg font-black leading-tight">
                  Verified stock, fast reorder paths, and direct handoff into checkout.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-2 text-sm text-white/70">
                <Sparkles className="h-4 w-4 text-[#F4D03F]" />
                Every category feeds the same cart and account flow.
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product, index) => {
              const variant = selectVariant(product);
              const variantIndex = product.variants.findIndex((entry) => entry.id === variant?.id);
              const material = product.category === "education" ? getLearnMaterialByName(product.name) : undefined;
              const inStock = Boolean(variant?.is_available && (variant?.stock_quantity || 0) > 0);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="group overflow-hidden rounded-[2rem] border border-border/50 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-diffuse">
                    <div className="relative">
                      <button
                        aria-label="Toggle wishlist"
                        onClick={() => {
                          toggleWishlist({
                            id: product.id,
                            name: product.name,
                            description: product.description,
                            price: variant?.price_kes || 0,
                            image: product.images[variantIndex + 1] || product.images[0],
                            category: product.category,
                            badge: product.badge,
                            inStock: product.variants.some((entry) => entry.is_available && entry.stock_quantity > 0),
                          });
                        }}
                        className={cn(
                          "absolute left-5 top-5 z-20 rounded-full border p-2.5 transition-all",
                          isInWishlist(product.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-white/70 bg-white/90 text-muted-foreground hover:border-primary/30 hover:text-primary",
                        )}
                      >
                        <Heart className={cn("h-4 w-4", isInWishlist(product.id) && "fill-current")} />
                      </button>

                      <div className="absolute right-5 top-5 z-20 flex gap-2">
                        <Badge className="rounded-full border border-white/65 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#1B9157]">
                          <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                          Verified
                        </Badge>
                      </div>

                      <BrandedProductImage
                        src={product.images[variantIndex + 1] || product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        category={product.category}
                        badge={product.badge}
                        className="aspect-[1.04] bg-muted"
                      />
                    </div>

                    <CardContent className="space-y-5 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                            <span className="font-semibold">
                              {product.rating.toFixed(1)} · {product.review_count} reviews
                            </span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-black tracking-tight text-[#1A1A1A]">
                              {product.name}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#1B4332]/75">
                              {product.description}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]",
                            inStock
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700",
                          )}
                        >
                          {inStock ? "In stock" : "Sold out"}
                        </Badge>
                      </div>

                      {product.variants.length > 1 ? (
                        <Select
                          value={variant?.size}
                          onValueChange={(value) => handleSizeChange(product, value)}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-border/50 bg-[#f9f7f2] font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {product.variants.map((item) => (
                              <SelectItem key={item.id} value={item.size}>
                                {item.size} · {formatPrice(item.price_kes)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="rounded-2xl border border-border/40 bg-[#f9f7f2] px-4 py-3 text-sm font-semibold text-[#1A1A1A]">
                          {variant?.size || "Standard"}
                        </div>
                      )}

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                            Price
                          </p>
                          <p className="mt-1 text-3xl font-black tracking-tight text-[#1A1A1A]">
                            {formatPrice(variant?.price_kes || 0)}
                          </p>
                          {material && (
                            <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#1B9157]">
                              {material.formatLabel}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {material && (
                            <Button asChild variant="outline" className="rounded-full border-[#1B9157]/15 bg-white text-xs font-black">
                              <a href={material.pdfPath} target="_blank" rel="noreferrer">
                                <Download className="mr-2 h-3.5 w-3.5" />
                                Open PDF
                              </a>
                            </Button>
                          )}
                          <Button
                            onClick={() => handleAddToCart(product)}
                            disabled={!inStock}
                            className="h-12 rounded-full px-5 text-xs font-black uppercase tracking-[0.16em] shadow-glow"
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {inStock ? "Add to cart" : "Unavailable"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </BeeYieldPageShell>
  );
};

export default Shop;
