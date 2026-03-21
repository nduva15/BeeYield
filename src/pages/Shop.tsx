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
  Activity
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
  // --- HONEY (Only 2 Items - Official Collection) ---
  {
    id: "h1",
    name: "BeeYield Premium Acacia",
    description: "Premium grade select Acacia honey. High enzyme content, smooth texture, and exceptional clarity. Harvested from the pristine northern plains.",
    category: "honey",
    badge: "Bestseller",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 245,
    is_active: true,
    variants: [
      { id: "vh1-1", size: "250g", price_kes: 250, stock_quantity: 100, is_available: true, batch_code: "KIB-ACAC-PREM-250G" },
      { id: "vh1-2", size: "500g", price_kes: 500, stock_quantity: 75, is_available: true, batch_code: "KIB-ACAC-PREM-500G" },
      { id: "vh1-3", size: "1kg", price_kes: 1000, stock_quantity: 50, is_available: true, batch_code: "KIB-ACAC-PREM-1KG" }
    ]
  },
  {
    id: "h2",
    name: "BeeYield Acacia",
    description: "Pure organic Acacia honey. 100% natural, harvested from the pristine plains of Makueni. Light golden color with a mild, sweet flavour.",
    category: "honey",
    badge: "Classic",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5.0,
    review_count: 182,
    is_active: true,
    variants: [
      { id: "vh2-1", size: "250g", price_kes: 250, stock_quantity: 80, is_available: true, batch_code: "KIB-ACAC-STD-250G" },
      { id: "vh2-2", size: "500g", price_kes: 500, stock_quantity: 60, is_available: true, batch_code: "KIB-ACAC-STD-500G" },
      { id: "vh2-3", size: "1kg", price_kes: 1000, stock_quantity: 30, is_available: true, batch_code: "KIB-ACAC-STD-1KG" }
    ]
  },
  // --- HARDWARE (BeeHUB Precision IoT Ecosystem) ---
  {
    id: "hw1",
    name: "BeeHUB Queen - Lora Pro",
    description: "The primary gateway for your apiary. Manages multiple sensors and transmits data via Satellite or GSM. Includes solar charging capability.",
    category: "hardware",
    badge: "Gateway",
    images: ["/images/products/beeyield_hub_sensor.jpg"],
    rating: 5.0,
    review_count: 84,
    is_active: true,
    variants: [
      { id: "vhw1-1", size: "Unit Only", price_kes: 38500, stock_quantity: 15, is_available: true }
    ]
  },
  {
    id: "hw2",
    name: "BeeHUB Sense",
    description: "Internal hive sensor. Tracks temperature and humidity. Connects wirelessly to the BeeHUB Queen gateway.",
    category: "hardware",
    badge: "Sensor",
    images: ["/images/products/beehub_temp_humidity.png"],
    rating: 4.8,
    review_count: 56,
    is_active: true,
    variants: [
      { id: "vhw2-1", size: "Sense V2", price_kes: 12500, stock_quantity: 50, is_available: true }
    ]
  },
  {
    id: "hw3",
    name: "Precision Hive Scale",
    description: "Industrial-grade scale for monitoring nectar flow and honey stores. Highly precise sensors for real-time weight tracking.",
    category: "hardware",
    badge: "Production",
    images: ["/images/products/beehub_hive_scale.png"],
    rating: 4.9,
    review_count: 42,
    is_active: true,
    variants: [
      { id: "vhw3-1", size: "150kg Max", price_kes: 24500, stock_quantity: 20, is_available: true }
    ]
  },
  {
    id: "hw4",
    name: "BeeHUB Tracker (GPS)",
    description: "Anti-theft GPS tracking for your valuable colonies. Features movement alerts and geofencing via the BeeHUB dashboard.",
    category: "hardware",
    badge: "Security",
    images: ["/images/products/beehub_sim_card.png"],
    rating: 4.7,
    review_count: 31,
    is_active: true,
    variants: [
      { id: "vhw4-1", size: "GPS Unit", price_kes: 8500, stock_quantity: 15, is_available: true }
    ]
  },
  {
    id: "hw5",
    name: "Temp & Humidity Probe",
    description: "High-precision internal probe for monitoring brood nest climate. Essential for early disease detection and swarm prevention.",
    category: "hardware",
    badge: "Accessory",
    images: ["/images/products/beehub_temp_humidity.png"],
    rating: 4.6,
    review_count: 124,
    is_active: true,
    variants: [
      { id: "vhw5-1", size: "Single Probe", price_kes: 4500, stock_quantity: 100, is_available: true }
    ]
  },
  {
    id: "hw6",
    name: "BeeHUB Solar Panel",
    description: "Weatherproof solar panel for BeeHUB Queen and Sense sensors. Helps keep devices running in remote locations.",
    category: "hardware",
    badge: "Power",
    images: ["/images/products/beehub_solar_panel.png"],
    rating: 4.9,
    review_count: 28,
    is_active: true,
    variants: [
      { id: "vhw6-1", size: "10W Panel", price_kes: 6500, stock_quantity: 40, is_available: true }
    ]
  },
  {
    id: "hw7",
    name: "Acoustic Analysis Module",
    description: "Microphone sensor for analyzing hive sound signatures to detect queen presence and swarm behavior.",
    category: "hardware",
    badge: "Technical",
    images: ["/images/products/beehub_sound_sensor.png"],
    rating: 4.8,
    review_count: 19,
    is_active: true,
    variants: [
      { id: "vhw7-1", size: "Pro Audio", price_kes: 11000, stock_quantity: 10, is_available: true }
    ]
  },
  {
    id: "hw8",
    name: "Full BeeHUB Station Kit",
    description: "Starter kit: 1 BeeHUB Queen, 2 Sense sensors, 1 Tracker, and 1 Solar panel for your apiary.",
    category: "hardware",
    badge: "Best Value",
    images: ["/images/products/beeyield_hub_sensor.jpg"],
    rating: 5.0,
    review_count: 15,
    is_active: true,
    variants: [
      { id: "vhw8-1", size: "Station Kit", price_kes: 72000, stock_quantity: 5, is_available: true }
    ]
  },
  // --- MERCH (8 Items - Lifestyle & Gear) ---
  {
    id: "m1",
    name: "BeeYield Premium Hoodie",
    description: "Heavyweight organic cotton hoodie with embroidered BeeYield logo. Stylish, warm, and built to last.",
    category: "merch",
    badge: "Premium Gear",
    images: ["/images/products/beeyield_hoodie.png"],
    rating: 4.9,
    review_count: 86,
    is_active: true,
    variants: [
      { id: "vm1-1", size: "M", price_kes: 3800, stock_quantity: 20, is_available: true },
      { id: "vm1-2", size: "L", price_kes: 3800, stock_quantity: 25, is_available: true }
    ]
  },
  {
    id: "m2",
    name: "BeeYield Trucker Cap",
    description: "Classic ventilated trucker cap with embroidered logo. Perfect for sunny days in the apiary.",
    category: "merch",
    badge: null,
    images: ["/images/products/beeyield_cap.png"],
    rating: 4.5,
    review_count: 42,
    is_active: true,
    variants: [
      { id: "vm2-1", size: "Standard", price_kes: 1200, stock_quantity: 60, is_available: true }
    ]
  },
  {
    id: "m3",
    name: "Sustainability Tote Bag",
    description: "Eco-friendly heavy canvas tote. Features stunning botanical bee artwork.",
    category: "merch",
    badge: "Eco-Choice",
    images: ["/images/products/beeyield_tote_bag.png"],
    rating: 4.7,
    review_count: 42,
    is_active: true,
    variants: [
      { id: "vm3-1", size: "Large", price_kes: 1200, stock_quantity: 100, is_available: true }
    ]
  },
  {
    id: "m4",
    name: "Signature Beekeeper Tee",
    description: "Soft, breathable 100% organic cotton. A minimalist design that makes a statement.",
    category: "merch",
    badge: null,
    images: ["/images/products/beekeeper_tshirt.png"],
    rating: 4.8,
    review_count: 124,
    is_active: true,
    variants: [
      { id: "vm4-1", size: "M", price_kes: 2200, stock_quantity: 30, is_available: true },
      { id: "vm4-2", size: "L", price_kes: 2200, stock_quantity: 40, is_available: true }
    ]
  },
  {
    id: "m5",
    name: "BeeYield Ceramic Mug",
    description: "A high-fire ceramic mug in matte charcoal. Ergonomic design for that perfect morning coffee.",
    category: "merch",
    badge: "Lifestyle",
    images: ["/images/products/beeyield_tote_bag.png"],
    rating: 4.6,
    review_count: 34,
    is_active: true,
    variants: [
      { id: "vm5-1", size: "12oz", price_kes: 950, stock_quantity: 60, is_available: true }
    ]
  },
  {
    id: "m6",
    name: "Beekeeping Enamel Pin",
    description: "Limited edition enamel pins featuring different bee species. Perfect for your jacket.",
    category: "merch",
    badge: "Collectible",
    images: ["/images/products/beeyield_cap.png"],
    rating: 5.0,
    review_count: 48,
    is_active: true,
    variants: [
      { id: "vm6-1", size: "Set", price_kes: 1500, stock_quantity: 200, is_available: true }
    ]
  },
  {
    id: "m7",
    name: "Bamboo Bee Hotel",
    description: "Support solitary bees in your garden with this sustainably sourced bamboo bee hotel.",
    category: "merch",
    badge: "Garden",
    images: ["/images/products/beeyield_tote_bag.png"],
    rating: 4.8,
    review_count: 29,
    is_active: true,
    variants: [
      { id: "vm7-1", size: "Standard", price_kes: 3200, stock_quantity: 15, is_available: true }
    ]
  },
  {
    id: "m8",
    name: "Wildflower Seed Mix",
    description: "A curated blend of 25 native wildflower species designed to provide forage for bees.",
    category: "merch",
    badge: "Impact",
    images: ["/images/products/beeyield_tote_bag.png"],
    rating: 4.7,
    review_count: 156,
    is_active: true,
    variants: [
      { id: "vm8-1", size: "50g Pack", price_kes: 450, stock_quantity: 500, is_available: true }
    ]
  },
  // --- EDUCATION (8 Items - From BeeLearn.tsx) ---
  {
    id: "edu-1",
    name: "BEEKEEPING STARTER GUIDE",
    description: "Entry-level handbook: hive setup, bee care, and your first honey harvest.",
    category: "education",
    badge: "Digital",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 4.9,
    review_count: 215,
    is_active: true,
    variants: [
      { id: "ve1-1", size: "PDF Download", price_kes: 1500, stock_quantity: 9999, is_available: true }
    ]
  },
  {
    id: "edu-2",
    name: "PRECISION POLLINATION HANDBOOK",
    description: "Data-driven techniques for crop yields. For commercial farmers and professional beekeepers.",
    category: "education",
    badge: "Professional",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 5.0,
    review_count: 48,
    is_active: true,
    variants: [
      { id: "ve2-1", size: "PDF Download", price_kes: 3500, stock_quantity: 9999, is_available: true }
    ]
  },
  {
    id: "edu-3",
    name: "QUEEN REARING MASTERCLASS",
    description: "Video course with 12 hours of expert instruction on queen breeding, grafting, and colony management.",
    category: "education",
    badge: "VIDEO COURSE",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 4.8,
    review_count: 87,
    is_active: true,
    variants: [
      { id: "ve3-1", size: "Online Access", price_kes: 5500, stock_quantity: 9999, is_available: true }
    ]
  },
  {
    id: "edu-4",
    name: "HONEY PROCESSING MANUAL",
    description: "Complete guide to extraction, filtering, bottling, and quality certification for commercial honey production.",
    category: "education",
    badge: "Bestseller",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 4.7,
    review_count: 134,
    is_active: true,
    variants: [
      { id: "ve4-1", size: "PDF Download", price_kes: 2500, stock_quantity: 9999, is_available: true }
    ]
  },
  {
    id: "edu-5",
    name: "HIVE MONITORING COURSE",
    description: "Learn to set up, calibrate, and interpret data from BeeYield sensors. Includes troubleshooting guides.",
    category: "education",
    badge: "Technical",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 4.9,
    review_count: 56,
    is_active: true,
    variants: [
      { id: "ve5-1", size: "Online Access", price_kes: 4000, stock_quantity: 9999, is_available: true }
    ]
  },
  {
    id: "edu-6",
    name: "DISEASE & PEST MANAGEMENT",
    description: "Identify and treat common bee diseases and pests in East Africa. Includes natural and chemical treatment options.",
    category: "education",
    badge: "Essential",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 4.8,
    review_count: 98,
    is_active: true,
    variants: [
      { id: "ve6-1", size: "PDF Download", price_kes: 2000, stock_quantity: 9999, is_available: true }
    ]
  },
  {
    id: "edu-7",
    name: "BUSINESS OF BEEKEEPING",
    description: "Transform your hobby into a profitable venture. Covers pricing, marketing, regulations, and scaling operations.",
    category: "education",
    badge: "Entrepreneur",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 4.6,
    review_count: 73,
    is_active: true,
    variants: [
      { id: "ve7-1", size: "PDF + Templates", price_kes: 4500, stock_quantity: 9999, is_available: true }
    ]
  },
  {
    id: "edu-8",
    name: "COMPLETE BEEKEEPER BUNDLE",
    description: "All educational materials in one package! Includes all guides, courses, and lifetime updates.",
    category: "education",
    badge: "BEST VALUE",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 5.0,
    review_count: 42,
    is_active: true,
    variants: [
      { id: "ve8-1", size: "Full Bundle", price_kes: 15000, stock_quantity: 9999, is_available: true }
    ]
  }
];

const Shop = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Product["category"]>('honey');

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

  const honeyProducts = products.filter((p) => p.category === "honey").slice(0, 8);
  const hardwareProducts = products
    .filter((p) => p.category === "hardware")
    // Ensure Sensors tab is truly hardware/sensors
    .filter((p) => /beehub|beeyield|sensor|tracker|scale|probe|acoustic|queen/i.test(`${p.name} ${p.badge ?? ''} ${p.description}`))
    .sort((a, b) => {
      const ap = a.variants?.[0]?.price_kes ?? 0;
      const bp = b.variants?.[0]?.price_kes ?? 0;
      return ap - bp;
    });
  const merchProducts = products.filter((p) => p.category === "merch");
  const educationProducts = products.filter((p) => p.category === "education");

  const visibleProducts =
    activeCategory === 'honey' ? honeyProducts :
      activeCategory === 'hardware' ? hardwareProducts :
        activeCategory === 'merch' ? merchProducts :
          educationProducts;

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
              Browse honey, sensors, merch, and education.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex bg-muted/40 border border-border/50 rounded-xl p-1 gap-1">
              {([
                { id: 'honey', label: 'Honey' },
                { id: 'hardware', label: 'Sensors' },
                { id: 'merch', label: 'Merch' },
                { id: 'education', label: 'Learn' },
              ] as const).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={cn(
                    "h-9 px-4 rounded-lg font-semibold text-sm transition-all",
                    activeCategory === c.id ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

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

        {activeCategory === 'hardware' && (
          <div className="mb-10 overflow-hidden rounded-[2.5rem] border border-border/50 bg-[#FFF9F0] shadow-premium">
            <div className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">Sensors</p>
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">
                  BeeHUB <span className="text-[#F4D03F]">Sensors</span>
                </h2>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  Gateways and hive sensors for temperature, humidity, weight, GPS, and acoustic health—built for remote apiaries.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { label: 'LoRa / GSM gateway', icon: Radio },
                    { label: 'Hive metrics', icon: Activity },
                    { label: 'Industrial hardware', icon: Cpu },
                  ].map((b) => (
                    <Badge
                      key={b.label}
                      className="bg-white/70 text-foreground border-border/40 font-semibold text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5"
                    >
                      <b.icon className="h-3.5 w-3.5 text-primary" />
                      {b.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                className="h-11 rounded-2xl px-6 font-semibold text-sm bg-primary text-primary-foreground shadow-primary/20"
                onClick={() => window.open('https://beeyield.com/shop-sensors', '_blank', 'noopener,noreferrer')}
              >
                View all sensors
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                          const label = inStock ? `${v?.stock_quantity ?? 0} in stock` : 'Out of stock';
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
