import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/contexts/CartContext";
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
  Loader2
} from "lucide-react";
import { Product } from "@/services/shopService"; // Removed getProducts import
import { toast } from "sonner";

interface ShopProps {
  initialProducts?: Product[];
}

const Shop = ({ initialProducts = [] }: ShopProps) => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  // Initialize with SSR data!
  const [activeProducts, setActiveProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, openCart } = useCart();

  // No useEffect for fetching anymore! SSR handles it.

  // Hardcoded rich fallbacks if backend is empty or for initial dev
  const fallbackProducts: Product[] = [
    // ========== HONEY PRODUCTS (8) ==========
    {
      id: "honey-1",
      name: "Highland Blossom Honey",
      description: "Rare, multi-floral honey harvested from the pristine Aberdare highlands. Delicate floral notes with a smooth, lingering finish.",
      category: "honey",
      badge: "Bestseller",
      images: ["/images/products/highland_blossom_honey.png"],
      rating: 4.9,
      review_count: 128,
      is_active: true,
      variants: [
        { id: "v1", size: "250g", price_kes: 850, stock_quantity: 100, is_available: true },
        { id: "v2", size: "500g", price_kes: 1500, stock_quantity: 75, is_available: true },
        { id: "v3", size: "1kg", price_kes: 2800, stock_quantity: 50, is_available: true }
      ]
    },
    {
      id: "honey-2",
      name: "Savannah Gold Honey",
      description: "Rich, amber honey with distinctive citrus and acacia undertones from the Kibwezi savannah. Bold and energizing.",
      category: "honey",
      badge: "Premium",
      images: ["/images/products/savannah_blossom_honey.png"],
      rating: 4.8,
      review_count: 89,
      is_active: true,
      variants: [
        { id: "v4", size: "250g", price_kes: 950, stock_quantity: 80, is_available: true },
        { id: "v5", size: "500g", price_kes: 1700, stock_quantity: 60, is_available: true },
        { id: "v6", size: "1kg", price_kes: 3200, stock_quantity: 40, is_available: true }
      ]
    },
    {
      id: "honey-3",
      name: "Mara Wildflower Honey",
      description: "Exquisite wildflower honey from the Maasai Mara region. Complex, aromatic profile with hints of wild herbs and grassland blooms.",
      category: "honey",
      badge: "Limited Edition",
      images: ["/images/products/wildflower_honey.png"],
      rating: 4.9,
      review_count: 67,
      is_active: true,
      variants: [
        { id: "v-h3-1", size: "250g", price_kes: 1100, stock_quantity: 40, is_available: true },
        { id: "v-h3-2", size: "500g", price_kes: 2000, stock_quantity: 30, is_available: true },
        { id: "v-h3-3", size: "1kg", price_kes: 3800, stock_quantity: 20, is_available: true }
      ]
    },
    {
      id: "honey-4",
      name: "Pure Acacia Honey",
      description: "Light, mild honey with a subtle sweetness. Perfect for tea, baking, and those who prefer delicate flavors.",
      category: "honey",
      badge: "Organic",
      images: ["/images/products/acacia_honey.png"],
      rating: 4.7,
      review_count: 156,
      is_active: true,
      variants: [
        { id: "v-h4-1", size: "250g", price_kes: 800, stock_quantity: 120, is_available: true },
        { id: "v-h4-2", size: "500g", price_kes: 1400, stock_quantity: 90, is_available: true },
        { id: "v-h4-3", size: "1kg", price_kes: 2600, stock_quantity: 60, is_available: true }
      ]
    },
    {
      id: "honey-5",
      name: "Desert Bloom Honey",
      description: "Unique honey from desert-adapted flora in Northern Kenya. Crystallizes naturally with a creamy texture.",
      category: "honey",
      badge: "Rare",
      images: ["/images/products/desert_bloom_honey.png"],
      rating: 4.8,
      review_count: 34,
      is_active: true,
      variants: [
        { id: "v-h5-1", size: "250g", price_kes: 1200, stock_quantity: 25, is_available: true },
        { id: "v-h5-2", size: "500g", price_kes: 2200, stock_quantity: 15, is_available: true }
      ]
    },
    {
      id: "honey-6",
      name: "Eucalyptus Reserve Honey",
      description: "Bold, medicinal honey harvested from eucalyptus forests. Known for its immune-boosting properties.",
      category: "honey",
      badge: "Therapeutic",
      images: ["/images/products/eucalyptus_honey.png"],
      rating: 4.9,
      review_count: 78,
      is_active: true,
      variants: [
        { id: "v-h6-1", size: "250g", price_kes: 900, stock_quantity: 70, is_available: true },
        { id: "v-h6-2", size: "500g", price_kes: 1600, stock_quantity: 50, is_available: true },
        { id: "v-h6-3", size: "1kg", price_kes: 3000, stock_quantity: 35, is_available: true }
      ]
    },
    {
      id: "honey-7",
      name: "Raw Honeycomb Chunk",
      description: "Pure, unprocessed honeycomb straight from the hive. Experience honey in its most natural form.",
      category: "honey",
      badge: "Artisan",
      images: ["/images/products/honey_comb_chunk.png"],
      rating: 5.0,
      review_count: 92,
      is_active: true,
      variants: [
        { id: "v-h7-1", size: "200g", price_kes: 1500, stock_quantity: 40, is_available: true },
        { id: "v-h7-2", size: "400g", price_kes: 2800, stock_quantity: 25, is_available: true }
      ]
    },
    {
      id: "honey-8",
      name: "Coastal Mangrove Honey",
      description: "Exotic honey from the mangrove forests of the Kenyan coast. Unique minerality with caramel undertones.",
      category: "honey",
      badge: "New",
      images: ["/images/products/savannah_blossom_honey.png"],
      rating: 4.6,
      review_count: 23,
      is_active: true,
      variants: [
        { id: "v-h8-1", size: "250g", price_kes: 1050, stock_quantity: 35, is_available: true },
        { id: "v-h8-2", size: "500g", price_kes: 1900, stock_quantity: 20, is_available: true }
      ]
    },
    // ========== HARDWARE/SENSORS PRODUCTS (8) ==========
    {
      id: "hw-1",
      name: "ApiSense Sentinel Node",
      description: "Advanced IoT hive monitor with acoustic disease detection, temperature, and humidity sensors. Real-time alerts via cellular network.",
      category: "hardware",
      badge: "New Technology",
      images: ["/images/products/solar_hive_monitor.png"],
      rating: 5.0,
      review_count: 12,
      is_active: true,
      variants: [
        { id: "v-hw-1", size: "Standard Unit", price_kes: 15000, stock_quantity: 50, is_available: true }
      ]
    },
    {
      id: "hw-2",
      name: "Intelligent Hive Scale",
      description: "Precision weight monitoring with 4G connectivity. Track honey flow and colony growth in real-time from your dashboard.",
      category: "hardware",
      badge: "Best Value",
      images: ["/images/products/hive_temp_sensor.png"],
      rating: 4.8,
      review_count: 24,
      is_active: true,
      variants: [
        { id: "v-hw-2", size: "Standard Unit", price_kes: 12500, stock_quantity: 50, is_available: true }
      ]
    },
    {
      id: "hw-3",
      name: "BeeSense Humidity Monitor",
      description: "Compact IoT humidity sensor with digital display. Track optimal hive conditions for healthy bee colonies.",
      category: "hardware",
      badge: "Essential",
      images: ["/images/products/hive_humidity_sensor.png"],
      rating: 4.9,
      review_count: 38,
      is_active: true,
      variants: [
        { id: "v-hw-3", size: "Standard Unit", price_kes: 8500, stock_quantity: 75, is_available: true }
      ]
    },
    {
      id: "hw-4",
      name: "Solar Power Kit",
      description: "Complete solar panel kit for off-grid hive monitoring. Powers all BeeYield sensors for 24/7 operation.",
      category: "hardware",
      badge: "Eco-Friendly",
      images: ["/images/products/solar_hive_monitor.png"],
      rating: 4.7,
      review_count: 19,
      is_active: true,
      variants: [
        { id: "v-hw-4-1", size: "5W Panel", price_kes: 4500, stock_quantity: 60, is_available: true },
        { id: "v-hw-4-2", size: "10W Panel", price_kes: 7500, stock_quantity: 40, is_available: true }
      ]
    },
    {
      id: "hw-5",
      name: "Hive Gateway Hub",
      description: "Central hub connecting up to 20 hive sensors. Aggregates data and provides mesh networking for remote apiaries.",
      category: "hardware",
      badge: "Professional",
      images: ["/images/products/hive_temp_sensor.png"],
      rating: 4.9,
      review_count: 15,
      is_active: true,
      variants: [
        { id: "v-hw-5", size: "Standard Unit", price_kes: 22000, stock_quantity: 25, is_available: true }
      ]
    },
    {
      id: "hw-6",
      name: "Acoustic Swarm Detector",
      description: "AI-powered sound analysis module that predicts swarming events 48 hours in advance. Protect your colonies.",
      category: "hardware",
      badge: "AI Powered",
      images: ["/images/products/hive_humidity_sensor.png"],
      rating: 5.0,
      review_count: 8,
      is_active: true,
      variants: [
        { id: "v-hw-6", size: "Standard Unit", price_kes: 18500, stock_quantity: 30, is_available: true }
      ]
    },
    {
      id: "hw-7",
      name: "Weather Station Pro",
      description: "Agricultural weather station with wind, rain, UV, and barometric sensors. Integrates with your hive dashboard.",
      category: "hardware",
      badge: "Premium",
      images: ["/images/products/solar_hive_monitor.png"],
      rating: 4.8,
      review_count: 22,
      is_active: true,
      variants: [
        { id: "v-hw-7", size: "Complete Kit", price_kes: 28000, stock_quantity: 15, is_available: true }
      ]
    },
    {
      id: "hw-8",
      name: "Starter Sensor Bundle",
      description: "Perfect for beginners! Includes temperature, humidity, and weight sensors for monitoring 3 hives.",
      category: "hardware",
      badge: "Best for Beginners",
      images: ["/images/products/hive_temp_sensor.png"],
      rating: 4.9,
      review_count: 45,
      is_active: true,
      variants: [
        { id: "v-hw-8", size: "3-Hive Bundle", price_kes: 35000, stock_quantity: 20, is_available: true }
      ]
    },
    // ========== MERCH PRODUCTS (8) ==========
    {
      id: "merch-1",
      name: "BeeYield Classic Tee",
      description: "100% organic cotton with embroidered BeeYield logo. Durable, breathable, and supports sustainable pollination.",
      category: "merch",
      badge: "Eco-Friendly",
      images: ["/images/products/beekeeper_tshirt.png"],
      rating: 4.7,
      review_count: 56,
      is_active: true,
      variants: [
        { id: "v13", size: "S", price_kes: 2500, stock_quantity: 30, is_available: true },
        { id: "v14", size: "M", price_kes: 2500, stock_quantity: 50, is_available: true },
        { id: "v15", size: "L", price_kes: 2500, stock_quantity: 50, is_available: true },
        { id: "v16", size: "XL", price_kes: 2500, stock_quantity: 30, is_available: true }
      ]
    },
    {
      id: "merch-2",
      name: "Pollinator Hoodie",
      description: "Premium heavyweight organic cotton hoodie. Perfect for early morning hive inspections.",
      category: "merch",
      badge: "Seasonal",
      images: ["/images/products/beeyield_hoodie.png"],
      rating: 4.9,
      review_count: 42,
      is_active: true,
      variants: [
        { id: "v17", size: "M", price_kes: 4500, stock_quantity: 20, is_available: true },
        { id: "v18", size: "L", price_kes: 4500, stock_quantity: 25, is_available: true },
        { id: "v18-xl", size: "XL", price_kes: 4500, stock_quantity: 15, is_available: true }
      ]
    },
    {
      id: "merch-3",
      name: "Hive & Co. Trucker Cap",
      description: "Premium mesh-back trucker cap with embroidered bee logo. Adjustable fit, breathable design.",
      category: "merch",
      badge: "New Arrival",
      images: ["/images/products/beeyield_cap.png"],
      rating: 4.8,
      review_count: 31,
      is_active: true,
      variants: [
        { id: "v-m3", size: "One Size", price_kes: 1800, stock_quantity: 80, is_available: true }
      ]
    },
    {
      id: "merch-4",
      name: "Canvas Tote Bag",
      description: "Heavy-duty canvas tote with honeycomb print. Perfect for farmers markets and grocery runs.",
      category: "merch",
      badge: "Sustainable",
      images: ["/images/products/beeyield_tote_bag.png"],
      rating: 4.6,
      review_count: 67,
      is_active: true,
      variants: [
        { id: "v-m4", size: "Standard", price_kes: 1500, stock_quantity: 100, is_available: true }
      ]
    },
    {
      id: "merch-5",
      name: "Beekeeper Work Shirt",
      description: "Long-sleeve cotton work shirt with ventilated back panel. Professional look for the modern apiarist.",
      category: "merch",
      badge: "Professional",
      images: ["/images/products/beekeeper_tshirt.png"],
      rating: 4.7,
      review_count: 28,
      is_active: true,
      variants: [
        { id: "v-m5-1", size: "M", price_kes: 3200, stock_quantity: 25, is_available: true },
        { id: "v-m5-2", size: "L", price_kes: 3200, stock_quantity: 35, is_available: true },
        { id: "v-m5-3", size: "XL", price_kes: 3200, stock_quantity: 20, is_available: true }
      ]
    },
    {
      id: "merch-6",
      name: "Honey Harvest Apron",
      description: "Durable waxed canvas apron with multiple pockets. Protects while extracting and bottling honey.",
      category: "merch",
      badge: "Handcrafted",
      images: ["/images/products/beeyield_hoodie.png"],
      rating: 4.9,
      review_count: 19,
      is_active: true,
      variants: [
        { id: "v-m6", size: "One Size", price_kes: 3800, stock_quantity: 40, is_available: true }
      ]
    },
    {
      id: "merch-7",
      name: "Kids Bee Explorer Tee",
      description: "Fun, educational t-shirt for young bee enthusiasts. Features cartoon bees and pollination facts.",
      category: "merch",
      badge: "Kids",
      images: ["/images/products/beekeeper_tshirt.png"],
      rating: 4.8,
      review_count: 52,
      is_active: true,
      variants: [
        { id: "v-m7-1", size: "Age 4-6", price_kes: 1800, stock_quantity: 30, is_available: true },
        { id: "v-m7-2", size: "Age 7-9", price_kes: 1800, stock_quantity: 35, is_available: true },
        { id: "v-m7-3", size: "Age 10-12", price_kes: 1800, stock_quantity: 25, is_available: true }
      ]
    },
    {
      id: "merch-8",
      name: "Limited Edition Jacket",
      description: "Premium windbreaker jacket with reflective bee pattern. Water-resistant and stylish.",
      category: "merch",
      badge: "Limited",
      images: ["/images/products/beeyield_hoodie.png"],
      rating: 5.0,
      review_count: 14,
      is_active: true,
      variants: [
        { id: "v-m8-1", size: "M", price_kes: 6500, stock_quantity: 10, is_available: true },
        { id: "v-m8-2", size: "L", price_kes: 6500, stock_quantity: 12, is_available: true }
      ]
    },
    // ========== EDUCATION/LEARN PRODUCTS (8) ==========
    {
      id: "edu-1",
      name: "Beekeeping Starter Guide",
      description: "Comprehensive 85-page PDF covering hive selection, bee health, and honey harvesting for beginners in East Africa.",
      category: "education",
      badge: "Digital",
      images: ["/images/products/beekeeping_guide.png"],
      rating: 4.9,
      review_count: 215,
      is_active: true,
      variants: [
        { id: "v22", size: "PDF Download", price_kes: 1500, stock_quantity: 9999, is_available: true }
      ]
    },
    {
      id: "edu-2",
      name: "Precision Pollination Handbook",
      description: "Advanced techniques for using data to optimize crop yields. Essential for commercial farmers and professional beekeepers.",
      category: "education",
      badge: "Professional",
      images: ["/images/products/beekeeping_guide.png"],
      rating: 5.0,
      review_count: 48,
      is_active: true,
      variants: [
        { id: "v23", size: "PDF Download", price_kes: 3500, stock_quantity: 9999, is_available: true }
      ]
    },
    {
      id: "edu-3",
      name: "Queen Rearing Masterclass",
      description: "Video course with 12 hours of expert instruction on queen breeding, grafting, and colony management.",
      category: "education",
      badge: "Video Course",
      images: ["/images/products/beekeeping_guide.png"],
      rating: 4.8,
      review_count: 87,
      is_active: true,
      variants: [
        { id: "v-e3", size: "Online Access", price_kes: 5500, stock_quantity: 9999, is_available: true }
      ]
    },
    {
      id: "edu-4",
      name: "Honey Processing Manual",
      description: "Complete guide to extraction, filtering, bottling, and quality certification for commercial honey production.",
      category: "education",
      badge: "Bestseller",
      images: ["/images/products/beekeeping_guide.png"],
      rating: 4.7,
      review_count: 134,
      is_active: true,
      variants: [
        { id: "v-e4", size: "PDF Download", price_kes: 2500, stock_quantity: 9999, is_available: true }
      ]
    },
    {
      id: "edu-5",
      name: "IoT Hive Monitoring Course",
      description: "Learn to set up, calibrate, and interpret data from BeeYield sensors. Includes troubleshooting guides.",
      category: "education",
      badge: "Technical",
      images: ["/images/products/beekeeping_guide.png"],
      rating: 4.9,
      review_count: 56,
      is_active: true,
      variants: [
        { id: "v-e5", size: "Online Access", price_kes: 4000, stock_quantity: 9999, is_available: true }
      ]
    },
    {
      id: "edu-6",
      name: "Disease & Pest Management",
      description: "Identify and treat common bee diseases and pests in East Africa. Includes natural and chemical treatment options.",
      category: "education",
      badge: "Essential",
      images: ["/images/products/beekeeping_guide.png"],
      rating: 4.8,
      review_count: 98,
      is_active: true,
      variants: [
        { id: "v-e6", size: "PDF Download", price_kes: 2000, stock_quantity: 9999, is_available: true }
      ]
    },
    {
      id: "edu-7",
      name: "Business of Beekeeping",
      description: "Transform your hobby into a profitable venture. Covers pricing, marketing, regulations, and scaling operations.",
      category: "education",
      badge: "Entrepreneur",
      images: ["/images/products/beekeeping_guide.png"],
      rating: 4.6,
      review_count: 73,
      is_active: true,
      variants: [
        { id: "v-e7", size: "PDF + Templates", price_kes: 4500, stock_quantity: 9999, is_available: true }
      ]
    },
    {
      id: "edu-8",
      name: "Complete Beekeeper Bundle",
      description: "All educational materials in one package! Includes all guides, courses, and lifetime updates.",
      category: "education",
      badge: "Best Value",
      images: ["/images/products/beekeeping_guide.png"],
      rating: 5.0,
      review_count: 42,
      is_active: true,
      variants: [
        { id: "v-e8", size: "Full Bundle", price_kes: 15000, stock_quantity: 9999, is_available: true }
      ]
    }
  ];

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
    const variant = product.variants.find((v) => v.size === selectedSize) || product.variants[0];

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
      image: product.images[0]
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
                        <div className="relative aspect-square overflow-hidden bg-muted m-2 rounded-[2rem]">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              // Image fallback if path doesn't exist
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {product.badge && (
                            <Badge className="absolute top-4 left-4 min-h-[1.5rem] px-3 font-black uppercase tracking-tighter text-[10px]">
                              {product.badge}
                            </Badge>
                          )}

                          <button
                            aria-label="Add to wishlist"
                            className="absolute top-4 right-4 p-2.5 bg-background/80 backdrop-blur-md rounded-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white"
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                        </div>

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
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Investment</p>
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
      </section>

      {/* Tech CTA Section */}
      <section className="container mx-auto px-4 py-12">
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
      </section>

      {/* Social Proof / Trust */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground mb-12">Trusted by 500+ Regenerative Farmers</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 opacity-40 grayscale group hover:grayscale-0 transition-all duration-1000">
          <div className="flex items-center justify-center font-black text-2xl tracking-tighter">KEPSA AGRI</div>
          <div className="flex items-center justify-center font-black text-2xl tracking-tighter">MAUENI HIVE</div>
          <div className="flex items-center justify-center font-black text-2xl tracking-tighter">RIFT FARMS</div>
          <div className="flex items-center justify-center font-black text-2xl tracking-tighter">SAVANNAH FOODS</div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
