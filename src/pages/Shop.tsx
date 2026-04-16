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
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { BrandedProductImage } from "@/components/BrandedProductImage";
import { type Product, type ProductVariant } from "@/services/shopService";
import { getCatalogByCategory } from "@/data/catalog";

const STATIC_PRODUCTS: Product[] = [
  // --- HONEY (8 Items) ---
  {
    id: "h1",
    name: "Beeyield Premium Acacia",
    description: "Premium grade select Acacia honey. High enzyme content and smooth texture.",
    category: "honey",
    badge: "Bestseller",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 245,
    is_active: true,
    variants: [
      { id: "vh1-1", size: "250g", price_kes: 250, stock_quantity: 100, is_available: true },
      { id: "vh1-2", size: "500g", price_kes: 500, stock_quantity: 75, is_available: true },
      { id: "vh1-3", size: "1kg", price_kes: 1000, stock_quantity: 50, is_available: true }
    ]
  },
  {
    id: "h2",
    name: "Beeyield Acacia",
    description: "Pure organic Acacia honey. 100% natural, harvested from Makueni.",
    category: "honey",
    badge: "Classic",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5.0,
    review_count: 182,
    is_active: true,
    variants: [
      { id: "vh2-1", size: "250g", price_kes: 250, stock_quantity: 80, is_available: true },
      { id: "vh2-2", size: "500g", price_kes: 500, stock_quantity: 60, is_available: true },
      { id: "vh2-3", size: "1kg", price_kes: 1000, stock_quantity: 30, is_available: true }
    ]
  },
  {
    id: "h3",
    name: "Beeyield Premium Acacia",
    description: "Raw, unfiltered honey straight from Kitui county. Rich in natural enzymes.",
    category: "honey",
    badge: "Raw",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.8,
    review_count: 115,
    is_active: true,
    variants: [
      { id: "vh3-1", size: "250g", price_kes: 250, stock_quantity: 45, is_available: true },
      { id: "vh3-2", size: "500g", price_kes: 500, stock_quantity: 60, is_available: true },
      { id: "vh3-3", size: "1kg", price_kes: 1000, stock_quantity: 25, is_available: true }
    ]
  },
  {
    id: "h4",
    name: "Beeyield Acacia",
    description: "A beautiful blend of nectars from the diverse flora of Baringo.",
    category: "honey",
    badge: null,
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.7,
    review_count: 92,
    is_active: true,
    variants: [
      { id: "vh4-1", size: "250g", price_kes: 250, stock_quantity: 110, is_available: true },
      { id: "vh4-2", size: "500g", price_kes: 500, stock_quantity: 90, is_available: true },
      { id: "vh4-3", size: "1kg", price_kes: 1000, stock_quantity: 35, is_available: true }
    ]
  },
  {
    id: "h5",
    name: "Beeyield Premium Acacia",
    description: "Deep, dark, and intensely flavored honey from West Pokot forests.",
    category: "honey",
    badge: "Wild",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 140,
    is_active: true,
    variants: [
      { id: "vh5-1", size: "250g", price_kes: 250, stock_quantity: 65, is_available: true },
      { id: "vh5-2", size: "500g", price_kes: 500, stock_quantity: 40, is_available: true },
      { id: "vh5-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true }
    ]
  },
  {
    id: "h6",
    name: "Beeyield Acacia",
    description: "A rare nectar collected by bees in the Taita Hills forests.",
    category: "honey",
    badge: "Rare",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5.0,
    review_count: 67,
    is_active: true,
    variants: [
      { id: "vh6-1", size: "250g", price_kes: 250, stock_quantity: 30, is_available: true },
      { id: "vh6-2", size: "500g", price_kes: 500, stock_quantity: 20, is_available: true },
      { id: "vh6-3", size: "1kg", price_kes: 1000, stock_quantity: 10, is_available: true }
    ]
  },
  {
    id: "h7",
    name: "Beeyield Premium Acacia",
    description: "Crystal clear honey from the alpine forage zones of Mt. Kenya.",
    category: "honey",
    badge: null,
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.8,
    review_count: 89,
    is_active: true,
    variants: [
      { id: "vh7-1", size: "250g", price_kes: 250, stock_quantity: 70, is_available: true },
      { id: "vh7-2", size: "500g", price_kes: 500, stock_quantity: 50, is_available: true },
      { id: "vh7-3", size: "1kg", price_kes: 1000, stock_quantity: 25, is_available: true }
    ]
  },
  {
    id: "h8",
    name: "Beeyield Acacia",
    description: "A highly unique honey from coastal mangrove forests. Salty-sweet.",
    category: "honey",
    badge: "Unique",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 103,
    is_active: true,
    variants: [
      { id: "vh8-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true },
      { id: "vh8-2", size: "500g", price_kes: 500, stock_quantity: 35, is_available: true },
      { id: "vh8-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true }
    ]
  },

  // --- SENSORS (8 Items) ---
  {
    id: "s1",
    name: "BeeYield Smart Hive Monitor",
    description: "Advanced acoustic and temperature monitoring for optimal hive health.",
    category: "hardware",
    badge: "Featured",
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.8,
    review_count: 42,
    is_active: true,
    variants: [{ id: "vs1", size: "Standard", price_kes: 15000, stock_quantity: 50, is_available: true }]
  },
  {
    id: "s2",
    name: "Hive Heat Sensor",
    description: "Precise brood nest temperature tracking in any climate.",
    category: "hardware",
    badge: null,
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.6,
    review_count: 28,
    is_active: true,
    variants: [{ id: "vs2", size: "Standard", price_kes: 4500, stock_quantity: 100, is_available: true }]
  },
  {
    id: "s3",
    name: "Humidity Controller",
    description: "Maintain optimal hive environment to prevent mold and moisture.",
    category: "hardware",
    badge: null,
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.7,
    review_count: 15,
    is_active: true,
    variants: [{ id: "vs3", size: "Standard", price_kes: 6200, stock_quantity: 30, is_available: true }]
  },
  {
    id: "s4",
    name: "Activity Monitor",
    description: "Track bee flight patterns and traffic in real-time.",
    category: "hardware",
    badge: "New",
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.9,
    review_count: 12,
    is_active: true,
    variants: [{ id: "vs4", size: "Standard", price_kes: 8500, stock_quantity: 25, is_available: true }]
  },
  {
    id: "s5",
    name: "Queen Cell Sensor",
    description: "Early detection of swarming or supersedure cells.",
    category: "hardware",
    badge: null,
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.5,
    review_count: 9,
    is_active: true,
    variants: [{ id: "vs5", size: "Standard", price_kes: 5800, stock_quantity: 40, is_available: true }]
  },
  {
    id: "s6",
    name: "Propolis Weight Sensor",
    description: "Monitor hive productivity by tracking weight changes.",
    category: "hardware",
    badge: null,
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.4,
    review_count: 21,
    is_active: true,
    variants: [{ id: "vs6", size: "Standard", price_kes: 12500, stock_quantity: 15, is_available: true }]
  },
  {
    id: "s7",
    name: "Smart Hive Battery Pack",
    description: "Extended power for remote honey production sites.",
    category: "hardware",
    badge: null,
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.7,
    review_count: 34,
    is_active: true,
    variants: [{ id: "vs7", size: "Standard", price_kes: 3500, stock_quantity: 60, is_available: true }]
  },
  {
    id: "s8",
    name: "Apiary Solar Station",
    description: "Renewable energy for all your sensors and connectivity.",
    category: "hardware",
    badge: "Eco",
    images: ["/images/products/beeyield_sensor.png"],
    rating: 5.0,
    review_count: 7,
    is_active: true,
    variants: [{ id: "vs8", size: "Standard", price_kes: 22000, stock_quantity: 10, is_available: true }]
  },

  // --- MERCH (8 Items) ---
  {
    id: "m1",
    name: "BeeYield Signature Cap",
    description: "Premium embroidered cotton cap with adjustable strap.",
    category: "merch",
    badge: "Bestseller",
    images: ["/images/products/beeyield_merch.png"],
    rating: 4.9,
    review_count: 156,
    is_active: true,
    variants: [{ id: "vm1", size: "Adjustable", price_kes: 1200, stock_quantity: 80, is_available: true }]
  },
  {
    id: "m2",
    name: "Beekeeping Master T-Shirt",
    description: "100% organic cotton, breathable and comfortable.",
    category: "merch",
    badge: null,
    images: ["/images/products/beeyield_merch.png"],
    rating: 4.8,
    review_count: 89,
    is_active: true,
    variants: [{ id: "vm2", size: "M, L, XL", price_kes: 2500, stock_quantity: 120, is_available: true }]
  },
  {
    id: "m3",
    name: "Waggle Dance Hoodie",
    description: "Stay warm during early morning hive inspections.",
    category: "merch",
    badge: null,
    images: ["/images/products/beeyield_merch.png"],
    rating: 5.0,
    review_count: 45,
    is_active: true,
    variants: [{ id: "vm3", size: "M, L, XL", price_kes: 4800, stock_quantity: 35, is_available: true }]
  },
  {
    id: "m4",
    name: "BeeYield Branded Honey Jar",
    description: "Elegant glass jar for your own local harvest.",
    category: "merch",
    badge: null,
    images: ["/images/products/beeyield_merch.png"],
    rating: 4.7,
    review_count: 62,
    is_active: true,
    variants: [{ id: "vm4", size: "500ml", price_kes: 800, stock_quantity: 200, is_available: true }]
  },
  {
    id: "m5",
    name: "Professional Smoke Bellows",
    description: "Durable stainless steel with premium leather bellows.",
    category: "merch",
    badge: "Essential",
    images: ["/images/products/beeyield_merch.png"],
    rating: 4.9,
    review_count: 112,
    is_active: true,
    variants: [{ id: "vm5", size: "Standard", price_kes: 3200, stock_quantity: 55, is_available: true }]
  },
  {
    id: "m6",
    name: "Ultra-Breeze Bee Suit",
    description: "Three-layer ventilated mesh for maximum comfort and protection.",
    category: "merch",
    badge: "Pro",
    images: ["/images/products/beeyield_merch.png"],
    rating: 5.0,
    review_count: 73,
    is_active: true,
    variants: [{ id: "vm6", size: "M, L", price_kes: 12000, stock_quantity: 20, is_available: true }]
  },
  {
    id: "m7",
    name: "Sheepskin Beekeeping Gloves",
    description: "Soft sheepskin with long canvas gauntlets for sting-proof protection.",
    category: "merch",
    badge: null,
    images: ["/images/products/beeyield_merch.png"],
    rating: 4.8,
    review_count: 94,
    is_active: true,
    variants: [{ id: "vm7", size: "M, L", price_kes: 1800, stock_quantity: 85, is_available: true }]
  },
  {
    id: "m8",
    name: "BeeYield Coffee Mug",
    description: "Start your morning with a sweet brew in this ceramic mug.",
    category: "merch",
    badge: null,
    images: ["/images/products/beeyield_merch.png"],
    rating: 4.6,
    review_count: 51,
    is_active: true,
    variants: [{ id: "vm8", size: "350ml", price_kes: 1100, stock_quantity: 150, is_available: true }]
  },

  // --- LEARN (8 Items) ---
  {
    id: "l1",
    name: "Introduction to Apiculture",
    description: "Complete guide for beginners to start their first hive.",
    category: "education",
    badge: "Free Extract",
    images: ["/images/products/beeyield_course.png"],
    rating: 4.9,
    review_count: 320,
    is_active: true,
    variants: [{ id: "vl1", size: "E-Book", price_kes: 1500, stock_quantity: 999, is_available: true }]
  },
  {
    id: "l2",
    name: "Advanced Hive Management",
    description: "Master the art of high-yield sustainable beekeeping.",
    category: "education",
    badge: "Bestseller",
    images: ["/images/products/beeyield_course.png"],
    rating: 5.0,
    review_count: 215,
    is_active: true,
    variants: [{ id: "vl2", size: "Video Course", price_kes: 5500, stock_quantity: 999, is_available: true }]
  },
  {
    id: "l3",
    name: "Pest & Disease Control",
    description: "Keep your colonies healthy and strong throughout the year.",
    category: "education",
    badge: null,
    images: ["/images/products/beeyield_course.png"],
    rating: 4.8,
    review_count: 142,
    is_active: true,
    variants: [{ id: "vl3", size: "Digital Guide", price_kes: 2200, stock_quantity: 999, is_available: true }]
  },
  {
    id: "l4",
    name: "Organic Honey Certification",
    description: "Learn how to meet global organic standards for your harvest.",
    category: "education",
    badge: null,
    images: ["/images/products/beeyield_course.png"],
    rating: 4.7,
    review_count: 88,
    is_active: true,
    variants: [{ id: "vl4", size: "Certification Course", price_kes: 8500, stock_quantity: 999, is_available: true }]
  },
  {
    id: "l5",
    name: "Wintering Success Guide",
    description: "Ensure your bees survive the cold season with expert techniques.",
    category: "education",
    badge: "Seasonal",
    images: ["/images/products/beeyield_course.png"],
    rating: 4.9,
    review_count: 67,
    is_active: true,
    variants: [{ id: "vl5", size: "E-Book", price_kes: 1800, stock_quantity: 999, is_available: true }]
  },
  {
    id: "l6",
    name: "Pollination Services 101",
    description: "Turn your beekeeping hobby into a professional pollination service.",
    category: "education",
    badge: "Pro",
    images: ["/images/products/beeyield_course.png"],
    rating: 5.0,
    review_count: 94,
    is_active: true,
    variants: [{ id: "vl6", size: "Workshop", price_kes: 12000, stock_quantity: 50, is_available: true }]
  },
  {
    id: "l7",
    name: "Queen Rearing Masterclass",
    description: "Techniques for breeding superior queens and colony genetics.",
    category: "education",
    badge: "Advanced",
    images: ["/images/products/beeyield_course.png"],
    rating: 4.8,
    review_count: 53,
    is_active: true,
    variants: [{ id: "vl7", size: "Full Course", price_kes: 9500, stock_quantity: 999, is_available: true }]
  },
  {
    id: "l8",
    name: "Urban Beekeeping Essentials",
    description: "Thrive with hives in any city landscape or small space.",
    category: "education",
    badge: null,
    images: ["/images/products/beeyield_course.png"],
    rating: 4.6,
    review_count: 121,
    is_active: true,
    variants: [{ id: "vl8", size: "E-Book", price_kes: 1400, stock_quantity: 999, is_available: true }]
  }
];

const SHOP_PRODUCTS: Product[] = [
  ...getCatalogByCategory("honey"),
  ...getCatalogByCategory("hardware"),
  ...getCatalogByCategory("merch"),
  ...getCatalogByCategory("education"),
];

const Shop = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string>("honey");
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleSizeChange = (productId: string, size: string) => {
    const product = SHOP_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    if (product.category === 'honey') {
      const newSizes = { ...selectedSizes };
      SHOP_PRODUCTS.forEach(p => {
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
              className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground font-medium ml-1">{rating} ({count})</span>
      </div>
    );
  };

  const visibleProducts = SHOP_PRODUCTS.filter(p => p.category === activeCategory);

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
              Our curated collection of premium 100% pure honey.
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {visibleProducts.map((product) => (
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
                                  )?.price_kes || product.variants?.[0]?.price_kes || 0
                                )}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2">
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
          ))}
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default Shop;
