import { useState } from "react";
import { Link } from "react-router-dom";
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
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { BrandedProductImage } from "@/components/BrandedProductImage";

// Define local types if not importing from service, or reuse
interface ProductVariant {
  id: string;
  size: string;
  price_kes: number;
  stock_quantity: number;
  is_available: boolean;
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
  // --- HONEY (8 Items - Professional Traceable Collection) ---
  {
    id: "h1",
    name: "BeeYield Premium Acacia",
    description: "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
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
    name: "Wildflower Blossom Honey",
    description: "A complex, multi-floral honey with aromatic notes from Makueni's diverse flora. Perfect for daily wellness and gourmet pairings.",
    category: "honey",
    badge: "Premium",
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
    name: "Kibwezi Forest Honey",
    description: "Bold, dark, and rich in minerals. This forest honey is harvested from deep within the protected Kibwezi groundwater forest.",
    category: "honey",
    badge: "Rare",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.8,
    review_count: 96,
    is_active: true,
    variants: [
      { id: "vh3-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true },
      { id: "vh3-2", size: "500g", price_kes: 500, stock_quantity: 30, is_available: true },
      { id: "vh3-3", size: "1kg", price_kes: 1000, stock_quantity: 20, is_available: true }
    ]
  },
  {
    id: "h4",
    name: "Desert Thorn Honey",
    description: "Exquisite honey from the arid regions. Intense floral notes with a hint of spice. Highly sought after for its unique properties.",
    category: "honey",
    badge: "Limited Edition",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 54,
    is_active: true,
    variants: [
      { id: "vh4-1", size: "250g", price_kes: 250, stock_quantity: 30, is_available: true },
      { id: "vh4-2", size: "500g", price_kes: 500, stock_quantity: 25, is_available: true },
      { id: "vh4-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true }
    ]
  },
  {
    id: "h5",
    name: "Raw Honeycomb Chunk",
    description: "The purest form of honey. A generous slab of fresh honeycomb submerged in our premium liquid honey. Entirely edible and delicious.",
    category: "honey",
    badge: "100% Raw",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5.0,
    review_count: 312,
    is_active: true,
    variants: [
      { id: "vh5-1", size: "250g", price_kes: 250, stock_quantity: 30, is_available: true },
      { id: "vh5-2", size: "500g", price_kes: 500, stock_quantity: 20, is_available: true },
      { id: "vh5-3", size: "1kg", price_kes: 1000, stock_quantity: 10, is_available: true }
    ]
  },
  {
    id: "h6",
    name: "Lavender Infused Honey",
    description: "Our premium acacia honey gently infused with organic lavender blossoms. Calming, floral, and perfect for evening tea.",
    category: "honey",
    badge: "New Arrival",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.7,
    review_count: 42,
    is_active: true,
    variants: [
      { id: "vh6-1", size: "250g", price_kes: 250, stock_quantity: 50, is_available: true },
      { id: "vh6-2", size: "500g", price_kes: 500, stock_quantity: 30, is_available: true },
      { id: "vh6-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true }
    ]
  },
  {
    id: "h7",
    name: "Ginger & Lemon Honey",
    description: "A powerful immune-boosting blend of raw honey, organic ginger root, and zesty lemon. Great for soothing throats and boosting energy.",
    category: "honey",
    badge: "Wellness",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.8,
    review_count: 128,
    is_active: true,
    variants: [
      { id: "vh7-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true },
      { id: "vh7-2", size: "500g", price_kes: 500, stock_quantity: 60, is_available: true },
      { id: "vh7-3", size: "1kg", price_kes: 1000, stock_quantity: 25, is_available: true }
    ]
  },
  {
    id: "h8",
    name: "Signature Reserve (Aged)",
    description: "Our most exclusive honey, aged for 12 months to develop deep, molasses-like complexity. A true connoisseur's choice.",
    category: "honey",
    badge: "Gold Label",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5.0,
    review_count: 15,
    is_active: true,
    variants: [
      { id: "vh8-1", size: "250g", price_kes: 250, stock_quantity: 10, is_available: true },
      { id: "vh8-2", size: "500g", price_kes: 500, stock_quantity: 10, is_available: true },
      { id: "vh8-3", size: "1kg", price_kes: 1000, stock_quantity: 5, is_available: true }
    ]
  },
  // --- HARDWARE (8 Items - Precision IoT Sensors) ---
  {
    id: "hw1",
    name: "Solar Hive Monitor Pro",
    description: "The ultimate IoT solution for beekeepers. Tracks weight, temperature, humidity, and acoustics using advanced solar-powered sensors.",
    category: "hardware",
    badge: "Cutting Edge",
    images: ["/images/products/solar_hive_monitor.png"],
    rating: 5.0,
    review_count: 24,
    is_active: true,
    variants: [
      { id: "vhw1-1", size: "V3.0 Unit", price_kes: 25000, stock_quantity: 15, is_available: true }
    ]
  },
  {
    id: "hw2",
    name: "Hive Temp Sensor",
    description: "Internal temperature probe for brood nest monitoring. Helps prevent swarming and detect colony loss early.",
    category: "hardware",
    badge: null,
    images: ["/images/products/hive_temp_sensor.png"],
    rating: 4.6,
    review_count: 15,
    is_active: true,
    variants: [
      { id: "vhw2-1", size: "Pack of 5", price_kes: 4500, stock_quantity: 50, is_available: true }
    ]
  },
  {
    id: "hw3",
    name: "Hive Humidity Sensor",
    description: "Monitor in-hive humidity levels to prevent fungal diseases and ensure optimal brood rearing conditions.",
    category: "hardware",
    badge: null,
    images: ["/images/products/hive_humidity_sensor.png"],
    rating: 4.7,
    review_count: 12,
    is_active: true,
    variants: [
      { id: "vhw3-1", size: "Pack of 5", price_kes: 5000, stock_quantity: 40, is_available: true }
    ]
  },
  {
    id: "hw4",
    name: "Acoustic Health Sensor",
    description: "AI-powered sound analysis that detects swarming behavior and queen absence before they become visible problems.",
    category: "hardware",
    badge: "AI Powered",
    images: ["/images/products/solar_hive_monitor.png"],
    rating: 4.9,
    review_count: 8,
    is_active: true,
    variants: [
      { id: "vhw4-1", size: "In-Hive Unit", price_kes: 9500, stock_quantity: 15, is_available: true }
    ]
  },
  {
    id: "hw5",
    name: "Smart GPS Hive Tracker",
    description: "Discreet anti-theft tracking for your valuable colonies. Feature geofencing and motion alerts via LoRaWAN.",
    category: "hardware",
    badge: "Security",
    images: ["/images/products/solar_hive_monitor.png"],
    rating: 4.8,
    review_count: 31,
    is_active: true,
    variants: [
      { id: "vhw5-1", size: "Hidden Unit", price_kes: 5500, stock_quantity: 50, is_available: true }
    ]
  },
  {
    id: "hw6",
    name: "Digital Brood Probe",
    description: "Ultra-thin sensor that fits between frames to monitor the precise climate of your brood nest.",
    category: "hardware",
    badge: "Precision",
    images: ["/images/products/hive_temp_sensor.png"],
    rating: 4.6,
    review_count: 18,
    is_active: true,
    variants: [
      { id: "vhw6-1", size: "Standard", price_kes: 4200, stock_quantity: 40, is_available: true }
    ]
  },
  {
    id: "hw7",
    name: "Base Station Gateway",
    description: "Industrial grade gateway to connect up to 500 sensors across your whole farm farm. Range up to 15km.",
    category: "hardware",
    badge: "Infrastructure",
    images: ["/images/products/solar_hive_monitor.png"],
    rating: 5.0,
    review_count: 8,
    is_active: true,
    variants: [
      { id: "vhw7-1", size: "Gateway Unit", price_kes: 18000, stock_quantity: 5, is_available: true }
    ]
  },
  {
    id: "hw8",
    name: "Precision Bluetooth Scale",
    description: "Monitor nectar flow and honey production remotely. Capable of measuring up to 150kg with 10g precision.",
    category: "hardware",
    badge: "Essential",
    images: ["/images/products/solar_hive_monitor.png"],
    rating: 4.9,
    review_count: 45,
    is_active: true,
    variants: [
      { id: "vhw8-1", size: "Max 150kg", price_kes: 14000, stock_quantity: 20, is_available: true }
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
    description: "Our comprehensive entry-level handbook covering everything from hive setup to your first honey harvest.",
    category: "education",
    badge: "DIGITAL",
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
    description: "Advanced techniques for using data to optimize crop yields. Essential for commercial farmers and professional beekeepers.",
    category: "education",
    badge: "PROFESSIONAL",
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
    badge: "BESTSELLER",
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
    name: "IOT HIVE MONITORING COURSE",
    description: "Learn to set up, calibrate, and interpret data from BeeYield sensors. Includes troubleshooting guides.",
    category: "education",
    badge: "TECHNICAL",
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
    badge: "ESSENTIAL",
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
    badge: "ENTREPRENEUR",
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
  // Use static products directly
  const products = STATIC_PRODUCTS;

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

    if (!variant) {
      toast.error("This product is currently unavailable");
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
    { value: "hardware", label: "Sensors", icon: Cpu, description: "Precision IoT hive monitoring" },
    { value: "merch", label: "Merch", icon: Shirt, description: "Sustainable gear for beekeepers" },
    { value: "education", label: "Learn", icon: BookOpen, description: "Expert guides and handbooks" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Mobile Responsive */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden bg-primary/10">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 rounded-l-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-accent/20 rounded-r-full blur-3xl opacity-30" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center lg:text-left">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1 sm:py-1.5 border-primary/20 bg-primary/20 text-primary-foreground font-black animate-in fade-in slide-in-from-bottom-2 duration-700 text-xs sm:text-sm uppercase tracking-widest">
              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2 fill-primary/20" />
              The Future of Apiculture Is Here
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-foreground mb-4 sm:mb-6 tracking-tightest leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Harvest the <span className="text-primary italic">Precision.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
              From our award-winning traceable honey to cutting-edge IoT hive sensors,
              everything in our shop supports the mission of sustainable pollination in Kenya.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 animate-in fade-in mt-2 duration-1000 delay-500 justify-center lg:justify-start">
              <div className="flex items-center gap-2 sm:gap-3 bg-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-primary/10 shadow-sm">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider">Fast Delivery Nationwide</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 bg-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-primary/10 shadow-sm">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider">Secure Transactions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Content */}
      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="honey" className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12">
            <TabsList className="h-auto p-1 bg-muted/30 border border-border/50 rounded-2xl self-start overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 font-black uppercase tracking-widest text-xs"
                >
                  <cat.icon className="h-4 w-4 mr-2 hidden sm:inline" />
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="hidden lg:flex items-center gap-4 text-sm font-black uppercase tracking-widest text-muted-foreground/60">
              <Filter className="h-4 w-4" />
              <span>Scroll to explore the range</span>
            </div>
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

          {categories.map((category) => (
            <TabsContent key={category.value} value={category.value} className="mt-0 animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products
                  .filter(p => p.category === category.value)
                  .map((product) => (
                    <Card
                      key={product.id}
                      className="group relative overflow-hidden border-none bg-card hover:bg-white/50 transition-all duration-500 shadow-premium hover:shadow-glow hover:shadow-primary/5 rounded-[2.5rem]"
                    >
                      <BrandedProductImage
                        src={(() => {
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
                        className="aspect-square bg-muted m-2 rounded-[2rem]"
                      />

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
                          : "bg-white text-muted-foreground hover:bg-primary hover:text-primary-foreground shadow-black/5 border border-border/10"
                          }`}
                      >
                        <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                      </button>

                      <CardContent className="p-8 pt-4">
                        <div className="flex justify-between items-start mb-2">
                          {renderStars(product.rating, product.review_count)}
                        </div>

                        <h3 className="text-2xl font-black text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium mb-6 line-clamp-2 leading-relaxed h-10">
                          {product.description}
                        </p>

                        <div className="space-y-4">
                          {product.variants.length > 1 ? (
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
                              <span className="text-xs font-black uppercase tracking-widest">{product.variants[0].size}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Price</p>
                              <p className="text-2xl font-black text-foreground">
                                {formatPrice(
                                  product.variants.find(
                                    (v) => v.size === (selectedSizes[product.id] || product.variants[0].size)
                                  )?.price_kes || product.variants[0].price_kes
                                )}
                              </p>
                            </div>
                            <Button
                              className="h-14 px-8 rounded-2xl gap-2 font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg hover:shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
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
          ))}
        </Tabs>
      </section >

      {/* Tech CTA Section */}
      < section className="container mx-auto px-4 py-12" >
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
      </section >

      {/* Social Proof / Trust */}
      {/* Partners Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12 bg-muted/30 p-8 rounded-[2rem] border border-border/50">
          <h2 className="text-3xl font-black mb-4">Try BeeYield in your apiary</h2>
          <p className="text-muted-foreground mb-6 font-medium">
            BeeYield is constantly evolving. We invite you to take part in the international testing of our system – together, we can advance technology that protects bees worldwide.
          </p>
          <Button size="lg" className="w-full sm:w-auto rounded-xl font-bold gap-2" asChild>
            <Link to="/contact">Join the Program <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-black mb-8 text-muted-foreground uppercase tracking-widest">Global Partners</h2>
          {/* Partners */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 items-center opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-2xl border border-border/50">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg">Farmers</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-2xl border border-border/50">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg">ApiSense</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-2xl border border-border/50">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg">Intelligent Hives</span>
            </div>
          </div>
        </div>
      </section>
    </div >
  );
};

export default Shop;
