import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Star,
  Heart,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Play,
  Sparkles,
  Droplets,
  Award,
  ChevronRight,
  Mail,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { BrandedProductImage } from "@/components/BrandedProductImage";
import { submitNewsletterSubscription } from "@/services/contactService";
import { beeyieldService } from "@/services/beeyieldService";
import SEO from "@/components/SEO";

// Reusing same product types and data from Shop.tsx for consistency
import { type Product, type ProductVariant } from "@/services/shopService";

const initialHoneyProducts: Product[] = [
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
  }
];

// Hero Section matching reference design
const HeroSection = () => {
  const navigate = useNavigate();
  const [liveStats, setLiveStats] = useState<any>(null);

  useEffect(() => {
    beeyieldService.getImpactStats().then(data => {
      if (data) setLiveStats(data);
    });
  }, []);

  return (
    <section className="relative py-12 lg:py-24 overflow-hidden bg-gradient-to-b from-[#fdfbf6] to-[#f8faf8]">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_80%_20%,#fef3c7_0%,transparent_50%)] opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_20%_80%,#ecfdf5_0%,transparent_50%)] opacity-40 pointer-events-none" />

      {/* Vertical "Honey" text accent - More subtle & premium */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute left-8 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none"
      >
        <span
          className="text-[120px] font-black text-neutral-200/50 tracking-tighter leading-none select-none"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
          }}
        >
          PURE GOLD
        </span>
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center lg:text-left lg:pl-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black uppercase tracking-[0.2em] mb-8 border border-amber-100 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Origin
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tighter leading-[0.95]">
              <span className="bg-gradient-to-r from-beeyield-gold to-beeyield-green bg-clip-text text-transparent">Pure</span> <span className="text-beeyield-gold block sm:inline">Harvests.</span> <br />
              <span className="text-beeyield-green">Verified</span> by Nature.
            </h1>

            <p className="text-base md:text-lg text-beeyield-green/80 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Don't just believe us, see the records. Every jar of BeeYield is backed by permanent harvest data, ensuring 100% purity from the Kibwezi groundwater forest to your table.
            </p>

            {/* Premium Stats - Horizontal with micro-interactions */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
              {[
                { label: "Trees Planted", value: "2,500+", color: "text-beeyield-green", delay: 0 },
                { label: "Colonies", value: liveStats?.hive_count || "184", color: "text-beeyield-gold", delay: 0.1 },
                { label: "Purity Level", value: "100%", color: "text-beeyield-green", delay: 0.2 }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: stat.delay, duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="bg-gradient-to-br from-white to-beeyield-gold/5 backdrop-blur-sm px-6 py-4 rounded-3xl border-2 border-beeyield-gold/20 shadow-soft hover:shadow-glow transition-all animate-float flex flex-col"
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  <span className={`text-2xl font-black ${stat.color} drop-shadow-sm`}>{stat.value}</span>
                  <span className="text-[10px] font-bold text-beeyield-green/60 border-t border-beeyield-gold/10 mt-1 pt-1 uppercase tracking-wider">{stat.label}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons - Premium Styled */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-beeyield-green to-beeyield-green-dark hover:from-beeyield-green-dark hover:to-beeyield-green text-white font-black rounded-2xl px-10 h-14 shadow-glow uppercase tracking-widest text-xs transition-all"
                  onClick={() => navigate("/shop")}
                >
                  Shop Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-beeyield-gold text-beeyield-green hover:bg-beeyield-gold/10 hover:border-beeyield-green font-black rounded-2xl px-10 h-14 uppercase tracking-widest text-xs transition-all"
                  onClick={() => navigate("/traceability")}
                >
                  Trace Your Jar
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Hero Image & Dynamic Trust Badge */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-sm lg:max-w-md xl:max-w-lg">
              {/* Image Container with Glow */}
              <div className="relative z-10 group">
                <div className="absolute -inset-4 bg-amber-200/20 blur-3xl rounded-full group-hover:bg-amber-300/30 transition-colors duration-1000" />
                <img
                  src="/images/products/beeyield_honey_500g.png"
                  alt="Premium BeeYield Honey"
                  className="relative z-10 w-full h-auto object-cover aspect-[4/5] rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(120,53,15,0.2)] transform group-hover:scale-[1.02] transition-transform duration-700"
                />
              </div>

              {/* Floating Zero-Trust Badge - Micro-interaction highlight */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 2, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-6 -right-6 lg:-right-10 z-20 bg-white/95 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl border border-amber-100/50 flex flex-col items-center justify-center gap-2 group cursor-pointer"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-lg rounded-full animate-pulse" />
                  <div className="relative w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-black text-neutral-900">Verified</span>
                  <span className="block text-[9px] font-black text-green-700 uppercase tracking-widest">Clear Records</span>
                </div>
              </motion.div>

              {/* Verified Farmers Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-8 -left-8 lg:-left-12 z-20 bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border border-neutral-100/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-neutral-100 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-neutral-900 leading-tight">{liveStats?.beekeepers || "20+"} Local Farmers</span>
                    <span className="block text-[10px] text-neutral-500 font-medium">Verified Partners</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Featured Products Section - 3 cards like reference
const FeaturedProductsSection = ({ handleAddToCart, formatPrice, products }: {
  handleAddToCart: (p: Product) => void;
  formatPrice: (p: number) => string;
  products: Product[];
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const featuredProducts = (products.length > 0 ? products : initialHoneyProducts).slice(0, 4);

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <Badge className="bg-beeyield-orange/20 text-beeyield-orange border border-beeyield-orange/30 mb-4 hover:bg-beeyield-orange/30 transition-colors uppercase tracking-[0.2em] font-black text-[10px] px-3">
              Purest Gold
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-beeyield-green uppercase tracking-tighter">
              Featured <span className="text-beeyield-gold">Collection</span>
            </h2>
          </div>
          <Button
            variant="ghost"
            className="text-beeyield-green/70 hover:text-beeyield-gold font-bold uppercase tracking-widest text-[10px] group transition-colors"
            asChild
          >
            <Link to="/shop">
              Shop All Products <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="animate-float"
              style={{ animationDelay: `${idx * 0.3}s` }}
            >
              <Card
                className="group bg-beeyield-white border-2 border-beeyield-gold/20 rounded-2xl overflow-hidden hover:shadow-glow hover:border-beeyield-orange transition-all duration-300"
              >
                {/* Product Image */}
                <BrandedProductImage
                  src={product.images[1] || product.images[0]} // Using 250g Jar image (index 1) or first image
                  alt={product.name}
                  category="honey"
                  className="h-48"
                />

                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-beeyield-green">{product.name}</h3>
                    <span className="text-lg font-black text-beeyield-orange">{formatPrice(product.variants[0].price_kes)}</span>
                  </div>
                  <p className="text-xs text-beeyield-green/60 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      className="rounded-full text-xs font-black bg-gradient-to-r from-beeyield-gold to-beeyield-orange hover:from-beeyield-orange hover:to-beeyield-gold text-white uppercase tracking-widest px-6 shadow-soft"
                      onClick={() => handleAddToCart(product)}
                    >
                      Buy Now
                    </Button>
                    <button
                      aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist({
                          id: product.id,
                          name: product.name,
                          description: product.description,
                          price: product.variants[0].price_kes,
                          image: product.images[1] || product.images[0],
                          category: product.category,
                          badge: product.badge,
                          inStock: true
                        });
                      }}
                      className={`p-2 rounded-full transition-colors ${isInWishlist(product.id) ? "bg-beeyield-orange/20 text-beeyield-orange" : "hover:bg-beeyield-gold/10 text-beeyield-green/40"
                        }`}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonial Section matching reference
const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Sarah Jurbina",
      title: "Happy customer",
      quote: "BeeYield honey is the best I've ever had! The taste is so pure and rich, and I love knowing that it's ethically sourced through the 50/50 promise. I use it daily in my tea and even for skincare. Highly recommended!",
    },
    {
      name: "Michael Ochieng",
      title: "Wellness enthusiast",
      quote: "I've been buying BeeYield honey for my family for a year now. The traceability feature gives me confidence that we're consuming 100% pure honey. Amazing quality!",
    },
    {
      name: "Amina Hassan",
      title: "Chef & restaurateur",
      quote: "As a professional chef, I'm very particular about ingredients. BeeYield's honey has become a staple in my kitchen. The flavor profiles are exceptional.",
    },
    {
      name: "David Mutua",
      title: "Organic Farmer",
      quote: "The pollination services exceeded my expectations. My mango yields have doubled since we started working with BeeYield. The tech-enabled hive monitoring is a game changer.",
    },
    {
      name: "Esther Muli",
      title: "Nature Lover",
      quote: "Scanning the QR code and seeing exactly where my honey comes from is such a cool experience. Transparency at its best! It makes every drop feel special.",
    },
    {
      name: "James Mwangi",
      title: "Food Critic",
      quote: "Acacia honey from BeeYield has a floral note I haven't found anywhere else. It's truly premium grade and worth every cent. The clarity is world-class.",
    },
    {
      name: "Alice Wanjiku",
      title: "Home Baker",
      quote: "I use their wildflower honey for all my bakes. The moisture content is perfect and the sweetness is so balanced. My customers can really taste the difference.",
    },
    {
      name: "Peter Korir",
      title: "Endurance Athlete",
      quote: "A spoonful of this honey before my morning run gives me that natural energy boost without the crash. It's my secret weapon for long-distance training.",
    },
    {
      name: "Grace Nduku",
      title: "Nutritionist",
      quote: "Finally, a honey brand that doesn't heat-process their product. You can taste the active enzymes and beneficial pollen. It's real medicine in a jar.",
    },
    {
      name: "Robert Kemboi",
      title: "Eco-Conscious Advocate",
      quote: "The 50/50 promise means a lot to me. Finally, a brand that cares as much about the bees as they do about profit. Ethical beekeeping is the only way forward.",
    },
    {
      name: "Sarah Chepkoech",
      title: "Tea Sommelier",
      quote: "This honey pairs beautifully with oolong and green teas. It enhances the floral notes without overpowering the delicate tea leaves. Simply exquisite.",
    },
    {
      name: "Michael Sang",
      title: "Ag-Tech Specialist",
      quote: "Merging IoT with beekeeping is genius. The data-driven approach to beehive health ensures consistent quality that you can literally verify on the blockchain.",
    },
    {
      name: "Amani Hassan",
      title: "Community Leader",
      quote: "BeeYield has transformed our local economy in Kibwezi. The training and technology provided to our small-scale farmers have created sustainable livelihoods.",
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-beeyield-orange/20 text-beeyield-orange border border-beeyield-orange/30 mb-6 hover:bg-beeyield-orange/30 transition-colors uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1">
            Testimonials
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black leading-none tracking-tighter uppercase">
            What the <span className="text-beeyield-green">Hive is Saying</span>
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                {/* Visual side */}
                <div className="relative">
                  <div className="aspect-square rounded-[3rem] bg-neutral-50 overflow-hidden relative group">
                    <img
                      src={`https://i.pravatar.cc/600?u=${testimonials[currentIndex].name}`}
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent" />
                  </div>
                  <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute -bottom-6 -right-6 w-32 h-32 bg-white rounded-3xl shadow-glow p-4 flex items-center justify-center border-2 border-beeyield-gold/30"
                  >
                    <img src="/images/products/beeyield_honey_500g.png" alt="" className="w-full h-full object-contain" />
                  </motion.div>
                </div>

                {/* Content side */}
                <div className="flex flex-col justify-center">
                  <div className="mb-8">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="inline-block w-5 h-5 fill-beeyield-orange text-beeyield-orange mr-1" />
                    ))}
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-beeyield-green/90 leading-tight mb-8 italic">
                    "{testimonials[currentIndex].quote}"
                  </p>
                  <div>
                    <p className="text-xl font-black text-beeyield-green">{testimonials[currentIndex].name}</p>
                    <p className="text-beeyield-gold font-bold uppercase tracking-widest text-xs mt-1">{testimonials[currentIndex].title}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel dots */}
            <div className="flex justify-center md:justify-start gap-3 mt-12 md:pl-[50%] md:ml-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Go to testimonial ${index + 1}`}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-green-700 w-12" : "bg-neutral-200 w-4 hover:bg-neutral-300"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// About Section - "The Buzzz about our Honey!"
const AboutSection = () => {
  return (
    <section className="py-24 bg-neutral-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative group">
              {/* Main Lifestyle Image */}
              <div className="w-64 h-80 md:w-80 md:h-[450px] rounded-[3.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transform -rotate-3 group-hover:rotate-0 transition-transform duration-700 bg-white">
                <img src="/images/products/beeyield_honey_1kg.png" alt="BeeYield Journey" className="w-full h-full object-cover p-8" />
              </div>

              {/* Overlapping Secondary Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 12 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute -bottom-10 -right-8 w-44 h-44 md:w-60 md:h-60 rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white transform group-hover:rotate-0 transition-transform duration-700 bg-amber-50"
              >
                <img src="/images/products/beeyield_honey_250g.png" alt="Our Impact" className="w-full h-full object-cover p-6" />
              </motion.div>

              {/* Floating Badge */}
              <motion.div
                animate={{ rotate: [-12, -8, -12] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-8 -left-8 bg-green-700 text-white p-6 rounded-[2rem] shadow-2xl font-black text-sm uppercase tracking-widest leading-none text-center"
              >
                50 / 50<br />
                <span className="text-[10px] opacity-70">Promise</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-green-100 text-green-700 mb-6 hover:bg-green-200 transition-colors uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1">
              Our Vision
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-8 uppercase tracking-tighter leading-[0.9]">
              The Most Trusted <span className="text-green-700 block">Honey in Makueni</span>
            </h2>
            <div className="space-y-6">
              <p className="text-neutral-600 leading-relaxed text-base font-medium">
                BeeYield was founded with a simple goal: to make beekeeping better through technology and honest reporting. Our journey began in the pristine landscapes of Kenya, where we saw the need for a more sustainable approach. Today, we are proud to lead with our <strong className="text-green-700">50/50 Harvest Promise</strong>—ensuring that for every drop we take, enough is left for the bees to thrive.
              </p>
              <p className="text-neutral-600 leading-relaxed text-base font-medium">
                Every jar you hold features <strong className="text-amber-600">Honey Journey Tracking</strong>, allowing you to trace your honey back to the very hive it came from, meeting the beekeeper and seeing our verified seal of authenticity.
              </p>
              <div className="pt-4">
                <Button size="lg" variant="link" className="text-green-700 font-black p-0 h-auto gap-2 uppercase tracking-[0.2em] text-xs group" asChild>
                  <Link to="/about">
                    Learn Our Story <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Features Section - 3 cards
const FeaturesSection = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: ShieldCheck,
      title: "Honey Journey Tracking",
      description: "Scan the QR code on any jar to trace your honey back to the specific hive and harvest date.",
      color: "bg-green-50 text-green-700"
    },
    {
      icon: Leaf,
      title: "50/50 Harvest Promise",
      description: "We only harvest what the bees can spare, leaving 50% of the surplus to ensure colony survival.",
      color: "bg-amber-50 text-amber-600"
    },
    {
      icon: Droplets,
      title: "Intelligent Hive Monitoring",
      description: "Our hives use intelligent sensors to detect disease and stress before they impact the honey.",
      color: "bg-blue-50 text-blue-600"
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-neutral-50 rounded-[2.5rem] p-8 text-left hover:bg-white hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all flex flex-col items-start border border-transparent hover:border-neutral-100"
            >
              <div className={`w-16 h-16 mb-6 ${feature.color.split(' ')[0]} rounded-2xl flex items-center justify-center shadow-sm`}>
                <feature.icon className={`h-8 w-8 ${feature.color.split(' ')[1]}`} />
              </div>
              <h3 className="text-xl font-black text-neutral-900 mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-sm text-neutral-500 mb-6 leading-relaxed font-medium">{feature.description}</p>
              {feature.title === "Honey Journey Tracking" && (
                <Button
                  variant="link"
                  className="text-green-700 font-black p-0 h-auto gap-2 text-xs uppercase tracking-widest group"
                  onClick={() => navigate("/traceability")}
                >
                  Verify Now <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Flash Sale Section with countdown
const FlashSaleSection = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 20, minutes: 40, seconds: 7 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-neutral-900 rounded-[3rem] p-10 md:p-20 relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-600/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-green-700/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl text-center md:text-left">
            <Badge className="bg-amber-500 text-neutral-900 border-none mb-8 px-6 py-1.5 font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-500/20">
              Limited Time Offer
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[0.9] tracking-tighter uppercase">
              Claim Your <span className="text-amber-500">20% Welcome</span> Discount
            </h2>
            <p className="text-neutral-400 text-lg mb-10 max-w-lg leading-relaxed font-medium">
              Join the BeeYield community today and get a discount on your first purchase of our traceable honey.
            </p>

            {/* Countdown Timer */}
            <div className="flex justify-center md:justify-start gap-4 mb-10">
              {[
                { label: "Hours", value: timeLeft.hours },
                { label: "Mins", value: timeLeft.minutes },
                { label: "Secs", value: timeLeft.seconds }
              ].map((time, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl w-20 h-20 flex items-center justify-center border border-white/10 mb-2">
                    <span className="text-3xl font-black text-white">{String(time.value).padStart(2, "0")}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">{time.label}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-neutral-900 font-black rounded-2xl px-12 h-16 shadow-2xl shadow-amber-500/20 uppercase tracking-[0.2em] text-xs transition-all hover:scale-105"
              onClick={() => navigate("/shop")}
            >
              Claim Discount Now
            </Button>
          </div>

          {/* Floating Product Image */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-12 bottom-12 hidden lg:block"
          >
            <img
              src="/images/products/beeyield_honey_1kg.png"
              alt=""
              className="w-80 drop-shadow-[0_32px_64px_rgba(245,158,11,0.3)] filter brightness-110"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection = () => {
  const faqs = [
    {
      question: "How can I verify where my honey comes from?",
      answer: "Every jar of BeeYield honey features a unique QR code. By scanning it, you can access the record of your honey, showing the exact hive location, harvest date, moisture levels, and even the beekeeper who cared for the colony.",
    },
    {
      question: "What exactly is the 50/50 Harvest Promise?",
      answer: "Traditional beekeeping often over-harvests, leaving bees with sugar water. Our 50/50 Promise means we only take a maximum of 50% of the surplus honey. We leave the rest to ensure the bees have their natural, nutrient-rich food to survive and thrive through all seasons.",
    },
    {
      question: "How does BeeYield protect bees from diseases?",
      answer: "We use intelligent sensors and sound monitoring to listen to the hive. Our technology can detect signs of stress or specific diseases (like Varroa mites) early, allowing us to help the bees before it becomes a problem.",
    },
    {
      question: "Why does protecting bees result in better honey?",
      answer: "A healthy, stress-free bee colony has a stronger immune system and produces honey with higher enzymatic activity. By protecting bees from disease and environmental stress, we ensure the honey remains pure, potent, and free from the contaminants often found in struggling colonies.",
    },
    {
      question: "How are you contributing to apiary restoration?",
      answer: "We don't just place hives; we restore ecosystems. To date, we have planted 2,500 indigenous trees around our apiary sites to provide diverse forage for bees and restore the natural biodiversity of the region.",
    },
    {
      question: "Is your honey raw and unfiltered?",
      answer: "Yes! Our honey is 100% raw and gravity-filtered, preserving all the natural pollen, enzymes, and antioxidants that commercial heat-processing destroys.",
    },
    {
      question: "Can I visit the apiary from which my honey was harvested?",
      answer: "Through our digital dashboard, you can virtually visit your honey's origin. For corporate partners and members, we also organize physical 'Open Apiary Days' to witness our beekeeping practices firsthand.",
    },
    {
      question: "How does BeeYield support local farmers?",
      answer: "We provide local farmers with professional beekeeping training and IoT hive monitoring technology. By creating a sustainable market for their honey, we ensure they earn significantly above fair-trade market rates.",
    },
    {
      question: "Does BeeYield offer honey subscriptions?",
      answer: "Yes! Our 'Hive Connection' subscription ensures you never run out of your favorite blossoms while directly supporting the maintenance of a specific apiary restoration project.",
    },
    {
      question: "Is BeeYield honey suitable for medicinal use?",
      answer: "While we don't make medical claims, our honey is tested for high 'Total Activity' (TA) levels. Because it is raw and never heat-modified, it retains the natural antibacterial properties prized in traditional wellness.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 text-center mb-8">
            Some <span className="text-green-700">FAQs</span>
          </h2>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-neutral-50 rounded-xl px-5 border-none"
              >
                <AccordionTrigger className="text-left font-semibold text-neutral-900 hover:no-underline py-4 text-sm">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-neutral-600 pb-4 text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

// Newsletter Section - "Join the Hive!"
const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const response = await submitNewsletterSubscription({ email, source: "honey_landing" });
      setStatus("success");
      toast.success(response?.message || "Welcome to the hive! Check your email for confirmation.");
      setEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Subscription failed. Please try again later.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <section className="py-24 bg-neutral-900 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#15803d_0%,transparent_70%)] opacity-10 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 md:p-16 border border-white/10 text-center relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
                <img
                  src="/images/products/beeyield_honey_250g.png"
                  alt=""
                  className="relative w-full h-full object-cover rounded-3xl rotate-12 shadow-2xl"
                />
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">
                Keep in <span className="text-amber-500">Touch</span>
              </h2>
              <p className="text-neutral-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed font-medium">
                Subscribe for exclusive drops, blockchain reports, and the future of verifiable beekeeping.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-2xl bg-white/10 border-white/10 text-white placeholder:text-neutral-500 text-lg px-8 focus:bg-white/20 transition-all font-medium"
                  required
                />
                <Button
                  type="submit"
                  className="h-14 bg-green-700 hover:bg-green-800 text-white font-black rounded-2xl px-12 text-xs uppercase tracking-widest shadow-2xl shadow-green-900/20"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Joining..." : "Join"}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// All Products Grid - All 8 honey products
const AllProductsSection = ({
  selectedSizes,
  setSelectedSizes,
  handleAddToCart,
  formatPrice,
  products
}: {
  selectedSizes: Record<string, string>;
  setSelectedSizes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleAddToCart: (product: Product) => void;
  formatPrice: (price: number) => string;
  products: Product[];
}) => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge className="bg-green-100 text-green-700 mb-4 hover:bg-green-200 transition-colors uppercase tracking-[0.2em] font-black text-[10px] px-3">
            Pure Kibwezi Gold
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 leading-none tracking-tighter uppercase mb-4">
            Our Full <span className="text-green-700">Honey</span> Collection
          </h2>
          <p className="text-neutral-500 text-sm max-w-xl mx-auto font-medium">
            From medicinal Neem to delicate Acacia, discover our range of ethically harvested, 100% raw honey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {(products.length > 0 ? products : initialHoneyProducts).map((product) => {
            const selectedSize = selectedSizes[product.id] || product.variants[0].size;
            const variantSizeIndex = product.variants.findIndex((v) => v.size === selectedSize);
            const variant = product.variants[variantSizeIndex] || product.variants[0];
            const image = product.images[variantSizeIndex + 1] || product.images[0];

            return (
              <Card
                key={product.id}
                className="group border border-neutral-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-50">
                  <BrandedProductImage
                    src={image}
                    alt={product.name}
                    category="honey"
                    className="w-full h-full"
                  />
                  {product.badge && (
                    <Badge className="absolute top-4 left-4 bg-amber-500 text-white font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                      {product.badge}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6 flex flex-col flex-grow">
                  <div className="flex-grow space-y-3 mb-6">
                    <h3 className="text-lg font-black text-neutral-900 leading-tight group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-medium">
                      {product.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                        <span className="text-amber-700 font-bold text-lg">{formatPrice(variant.price_kes)}</span>
                      </div>
                      <Select
                        value={selectedSize}
                        onValueChange={(val) => setSelectedSizes(prev => ({ ...prev, [product.id]: val }))}
                      >
                        <SelectTrigger className="w-[100px] h-9 text-xs font-bold border-neutral-200 rounded-lg">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.variants.map((v) => (
                            <SelectItem key={v.id} value={v.size} className="text-xs font-bold">
                              {v.size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 h-9 text-[10px] font-black uppercase tracking-widest"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-10">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-2 border-neutral-900 text-neutral-900 font-bold px-8"
            onClick={() => navigate("/shop")}
          >
            View All Products
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};



// Main HoneyLanding Component
const HoneyLanding = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart, openCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { getProducts } = await import("@/services/shopService");
        const honeyData = await getProducts("honey");
        if (honeyData && honeyData.length > 0) {
          setProducts(honeyData);
        }
      } catch (error) {
        console.error("Failed to fetch honey products:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    const selectedSize = selectedSizes[product.id] || product.variants[0].size;
    const variantIndex = product.variants.findIndex((v) => v.size === selectedSize);
    const variant = product.variants[variantIndex] || product.variants[0];
    const image = product.images[variantIndex + 1] || product.images[1] || product.images[0];

    const cartItem = {
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      description: product.description,
      size: selectedSize,
      price: variant.price_kes,
      quantity: 1,
      category: product.category as 'honey' | 'merch' | 'education' | 'hardware',
      badge: product.badge,
      image: image,
    };

    addToCart(cartItem);
    openCart();
    toast.success(`${product.name} added to cart!`);

    // Backend Sync (Fire and Forget)
    try {
      const { add_to_cart } = await import("@/services/shopService");
      await add_to_cart({
        product_id: product.id,
        variant_id: variant.id,
        quantity: 1
      });
    } catch (e) {
      // Ignore auth/network errors for cart sync in UI
    }
  };

  const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

  const faqs_structured = [
    {
      q: "How can I check if my honey is authentic?",
      a: "Every jar of BeeYield honey features a unique HoneyChain™ QR code. By scanning it, you can see the 'Harvest Record' showing exact hive location and data."
    },
    {
      q: "Where is BeeYield honey harvested?",
      a: "Our honey is harvested from the pristine northern plains and protected forest areas in Kibwezi, Makueni County, Kenya."
    },
    {
      q: "Is BeeYield honey raw and unfiltered?",
      a: "Yes! Our honey is 100% raw and gravity-filtered, preserving all natural pollen and enzymes."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Premium Traceable Honey from Kibwezi"
        description="Shop 100% raw, traceable honey from Kibwezi. Powered by HoneyChainâ„¢ technology and the 50/50 Harvest Promise. Supporting sustainable pollination in Kenya."
        keywords="honey, raw honey, Kibwezi honey, traceable honey, HoneyChain, beekeeping Kenya, sustainable honey, Acacia honey"
      />

      {/* Structured Data for AEO / SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs_structured.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.a
            }
          }))
        })}
      </script>

      <HeroSection />

      <div className="py-8 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-green-700" />
              <span className="font-black uppercase tracking-tighter text-sm">100% Lab Tested</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-green-700" />
              <span className="font-black uppercase tracking-tighter text-sm">Direct from Hive</span>
            </div>
            <div className="flex items-center gap-3">
              <Leaf className="h-6 w-6 text-green-700" />
              <span className="font-black uppercase tracking-tighter text-sm">Sustainable Harvest</span>
            </div>
          </div>
        </div>
      </div>

      <FeaturedProductsSection
        handleAddToCart={handleAddToCart}
        formatPrice={formatPrice}
        products={products}
      />

      <TestimonialSection />
      <AboutSection />
      <FeaturesSection />

      <AllProductsSection
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        handleAddToCart={handleAddToCart}
        formatPrice={formatPrice}
        products={products}
      />

      <FlashSaleSection />
      <FAQSection />
      <NewsletterSection />
    </div>
  );
};

export default HoneyLanding;
