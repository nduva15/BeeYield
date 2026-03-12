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
      { id: "vh1-1", size: "250g", price_kes: 250, stock_quantity: 100, is_available: true, batch_code: "KIB-ACAC-121-250G" },
      { id: "vh1-2", size: "500g", price_kes: 500, stock_quantity: 75, is_available: true, batch_code: "KIB-ACAC-111-500G" },
      { id: "vh1-3", size: "1kg", price_kes: 1000, stock_quantity: 50, is_available: true, batch_code: "KIB-ACAC-101-1KG" }
    ]
  },
  {
    id: "h2",
    name: "BeeYield Acacia",
    description: "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "Premium",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5.0,
    review_count: 182,
    is_active: true,
    variants: [
      { id: "vh2-1", size: "250g", price_kes: 250, stock_quantity: 80, is_available: true, batch_code: "KIB-WILD-122-250G" },
      { id: "vh2-2", size: "500g", price_kes: 500, stock_quantity: 60, is_available: true, batch_code: "KIB-WILD-112-500G" },
      { id: "vh2-3", size: "1kg", price_kes: 1000, stock_quantity: 30, is_available: true, batch_code: "KIB-WILD-102-1KG" }
    ]
  },
  {
    id: "h3",
    name: "BeeYield Acacia",
    description: "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "Rare",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.8,
    review_count: 96,
    is_active: true,
    variants: [
      { id: "vh3-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true, batch_code: "KIB-FOR-123-250G" },
      { id: "vh3-2", size: "500g", price_kes: 500, stock_quantity: 30, is_available: true, batch_code: "KIB-FOR-113-500G" },
      { id: "vh3-3", size: "1kg", price_kes: 1000, stock_quantity: 20, is_available: true, batch_code: "KIB-FOR-103-1KG" }
    ]
  },
  {
    id: "h4",
    name: "BeeYield Acacia",
    description: "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "Limited Edition",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 54,
    is_active: true,
    variants: [
      { id: "vh4-1", size: "250g", price_kes: 250, stock_quantity: 30, is_available: true, batch_code: "KIB-THORN-124-250G" },
      { id: "vh4-2", size: "500g", price_kes: 500, stock_quantity: 25, is_available: true, batch_code: "KIB-THORN-114-500G" },
      { id: "vh4-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true, batch_code: "KIB-THORN-104-1KG" }
    ]
  },
  {
    id: "h5",
    name: "BeeYield Acacia",
    description: "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "100% Raw",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5.0,
    review_count: 312,
    is_active: true,
    variants: [
      { id: "vh5-1", size: "250g", price_kes: 250, stock_quantity: 30, is_available: true, batch_code: "KIB-COMB-125-250G" },
      { id: "vh5-2", size: "500g", price_kes: 500, stock_quantity: 20, is_available: true, batch_code: "KIB-COMB-115-500G" },
      { id: "vh5-3", size: "1kg", price_kes: 1000, stock_quantity: 10, is_available: true, batch_code: "KIB-COMB-105-1KG" }
    ]
  },
  {
    id: "h6",
    name: "BeeYield Acacia",
    description: "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "New Arrival",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.7,
    review_count: 42,
    is_active: true,
    variants: [
      { id: "vh6-1", size: "250g", price_kes: 250, stock_quantity: 50, is_available: true, batch_code: "KIB-LAV-126-250G" },
      { id: "vh6-2", size: "500g", price_kes: 500, stock_quantity: 30, is_available: true, batch_code: "KIB-LAV-116-500G" },
      { id: "vh6-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true, batch_code: "KIB-LAV-106-1KG" }
    ]
  },
  {
    id: "h7",
    name: "BeeYield Acacia",
    description: "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "Wellness",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.8,
    review_count: 128,
    is_active: true,
    variants: [
      { id: "vh7-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true, batch_code: "KIB-GINGER-127-250G" },
      { id: "vh7-2", size: "500g", price_kes: 500, stock_quantity: 60, is_available: true, batch_code: "KIB-GINGER-117-500G" },
      { id: "vh7-3", size: "1kg", price_kes: 1000, stock_quantity: 25, is_available: true, batch_code: "KIB-GINGER-107-1KG" }
    ]
  },
  {
    id: "h8",
    name: "BeeYield Acacia",
    description: "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "Gold Label",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5.0,
    review_count: 15,
    is_active: true,
    variants: [
      { id: "vh8-1", size: "250g", price_kes: 250, stock_quantity: 10, is_available: true, batch_code: "KIB-SIGN-128-250G" },
      { id: "vh8-2", size: "500g", price_kes: 500, stock_quantity: 10, is_available: true, batch_code: "KIB-SIGN-118-500G" },
      { id: "vh8-3", size: "1kg", price_kes: 1000, stock_quantity: 5, is_available: true, batch_code: "KIB-SIGN-108-1KG" }
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
    name: "BeeHUB Sense Node",
    description: "Internal hive monitoring node. Tracks temperature and humidity. Connects wirelessly to the BeeHUB Queen gateway.",
    category: "hardware",
    badge: "Sensor Node",
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
    description: "Weatherproof solar energy harvester for BeeHUB Queen and Sense nodes. Ensures 24/7 uptime in remote locations.",
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
    description: "A complete starter kit including 1 BeeHUB Queen, 2 Sense nodes, 1 Tracker, and 1 Solar panel for your apiary.",
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
    description: "Data-driven techniques for crop yields. For commercial farmers and professional beekeepers.",
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
    name: "HIVE MONITORING COURSE",
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
    { value: "hardware", label: "Sensors", icon: Cpu, description: "Precision IoT hive monitoring" },
    { value: "merch", label: "Merch", icon: Shirt, description: "Sustainable gear for beekeepers" },
    { value: "education", label: "Learn", icon: BookOpen, description: "Expert guides and handbooks" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Zero-Trust Premium Theme */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf6] to-[#f8faf8]">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_80%_20%,#fef3c7_0%,transparent_50%)] opacity-40 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_20%_80%,#ecfdf5_0%,transparent_50%)] opacity-40 pointer-events-none" />

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
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black uppercase tracking-[0.2em] mb-8 border border-amber-100 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              Verified Authenticity Hub
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black text-neutral-900 mb-8 tracking-tighter leading-[0.95]">
              The Gold <span className="text-amber-600">Standard.</span> <br />
              <span className="text-green-700">Traceable</span> by Default.
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-2xl leading-relaxed font-medium">
              Every item in our boutique is a proof of concept for uncompromised trust. From 100% raw honey to IoT hive monitoring, quality is cryptographically verified from the source.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-neutral-100 shadow-sm">
                <Truck className="h-5 w-5 text-green-700" />
                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Global Purity Standards</span>
              </div>
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-neutral-100 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Zero-Trust Verified</span>
              </div>
            </div>
          </motion.div>
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
            <div className="flex items-center gap-3 sm:gap-4">
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
                  <SelectItem value="rating">Average Rating</SelectItem>
                </SelectContent>
              </Select>

              {/* Account Shortcut for Shop */}
              <Button
                variant="outline"
                className="h-12 rounded-xl px-4 border-border/50 bg-card hover:bg-muted/50 transition-all font-black text-[10px] uppercase tracking-widest gap-2"
                asChild
              >
                <Link to="/my-account">
                  <User className="h-4 w-4 text-primary" />
                  <span className="hidden md:inline">My Account</span>
                </Link>
              </Button>
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
                      className={cn(
                        "group relative overflow-hidden border-none transition-all duration-500 shadow-premium hover:shadow-glow hover:shadow-primary/5 rounded-[2.5rem]",
                        product.category === 'hardware' ? "bg-white" : "bg-card hover:bg-white/50"
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
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Trust & Traceability Proof */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-neutral-900 rounded-[3rem] p-10 md:p-20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-600/20 to-transparent pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <Badge className="bg-amber-500 text-neutral-900 border-none mb-8 px-6 py-1.5 font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-500/20">
                BeeYield HoneyChain™
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-[0.9] tracking-tighter uppercase">
                Trust in Every <span className="text-amber-500">Blockchain</span> Sealed Jar
              </h2>
              <p className="text-neutral-400 text-lg mb-10 leading-relaxed font-medium">
                Africa's leader in honey traceability. Our HoneyChain™ protocol guarantees authenticity, purity, and full transparency. Look for the QR code on your boutique jar.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  "Immutable Harvest Records",
                  "Verified Flora & Water Sources",
                  "Direct Impact Tracking",
                  "Zero-Trust Verification"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-900 font-bold text-sm">
                    <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <ShieldCheck className="h-3 w-3 text-green-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                className="h-14 border-2 border-gray-300 text-gray-900 hover:bg-white hover:text-neutral-900 font-black rounded-2xl px-10 uppercase tracking-widest text-xs transition-all"
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
                <div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full" />
                <div className="w-64 h-64 border-2 border-gray-200 rounded-full flex items-center justify-center backdrop-blur-sm bg-white/5">
                  <Cpu className="w-24 h-24 text-amber-500/40" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Partners Section - Redesigned */}
      <section className="container mx-auto px-4 py-24 border-t border-neutral-100">
        <div className="text-center mb-16">
          <Badge className="bg-neutral-100 text-neutral-500 border-none mb-6 px-4 py-1 font-black uppercase tracking-widest text-[9px]">
            Global Ecosystem
          </Badge>
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
              <div className="h-12 w-12 bg-neutral-50 rounded-2xl flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-gray-900 transition-all">
                <partner.icon className="h-6 w-6" />
              </div>
              <span className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400 group-hover:text-neutral-900 transition-colors">
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
