import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import SEO from "@/components/SEO";

// Reusing same product types and data from Shop.tsx for consistency
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
    description: "Raw honey with organic ginger and lemon. Soothing for throats and a natural pick-me-up.",
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

  return (
    <section className="relative py-8 lg:py-16 overflow-hidden bg-[#F0F7F0]">
      {/* Vertical "Honey" text accent */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none">
        <span
          className="text-[140px] xl:text-[180px] font-black text-green-200/40 tracking-tighter leading-none select-none"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
          }}
        >
          Honey
        </span>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="relative z-10 text-center lg:text-left lg:pl-16 xl:pl-24">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 mb-6 tracking-tighter leading-none">
              Premium Raw <span className="text-amber-600 italic">Honey</span> <br />
              Direct from <span className="text-green-700">Kibwezi</span>
            </h1>
            <p className="text-sm md:text-base text-neutral-600 mb-4 max-w-md mx-auto lg:mx-0">
              Discover the purest, most delicious honey straight from our apiaries in Kibwezi to your plate. Our honey is carefully harvested to preserve its rich flavor, natural nutrients, and health benefits.
            </p>

            {/* Stats badges - horizontal */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl border border-green-200/50 shadow-sm">
                <span className="text-xl font-black text-green-700">2500+</span>
                <span className="text-[10px] font-semibold text-neutral-500 uppercase leading-none">Trees<br />Planted</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl border border-green-200/50 shadow-sm">
                <span className="text-xl font-black text-green-700">50/50</span>
                <span className="text-[10px] font-semibold text-neutral-500 uppercase leading-none">Harvest<br />Promise</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-full px-8 h-12 shadow-lg shadow-primary/10 uppercase tracking-widest text-xs"
                onClick={() => navigate("/shop")}
              >
                Explore the Honey Collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right - Hero Image & Stats */}
          <div className="relative">
            {/* Main honey jar image */}
            <div className="relative mx-auto max-w-sm lg:max-w-md">
              <img
                src="/images/products/beeyield_honey_500g.png"
                alt="Premium BeeYield Honey"
                className="w-full h-auto object-cover aspect-[4/5] rounded-[2rem] drop-shadow-2xl shadow-amber-900/20"
              />

              {/* Floating stats - top right */}
              <div className="absolute -top-4 -right-4 lg:right-0 flex flex-col gap-3">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-neutral-100">
                  <span className="text-2xl font-black text-green-700">100+</span>
                  <p className="text-[10px] text-neutral-500 font-semibold uppercase">Satisfied Clients</p>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-neutral-100">
                  <span className="text-2xl font-black text-green-700">20+</span>
                  <p className="text-[10px] text-neutral-500 font-semibold uppercase">Professional Farmers</p>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-neutral-100">
                  <span className="text-2xl font-black text-green-700">25+</span>
                  <p className="text-[10px] text-neutral-500 font-semibold uppercase">Acres Pollinated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Featured Products Section - 3 cards like reference
const FeaturedProductsSection = ({
  handleAddToCart,
  formatPrice,
}: {
  handleAddToCart: (product: Product) => void;
  formatPrice: (price: number) => string;
}) => {
  const honeyProducts = STATIC_PRODUCTS.slice(0, 3);
  const { toggleWishlist, isInWishlist } = useWishlist();

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {honeyProducts.map((product) => (
            <Card
              key={product.id}
              className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Product Image */}
              <BrandedProductImage
                src={product.images[1]} // Using 250g Jar image (index 1)
                alt={product.name}
                category="honey"
                className="h-48"
              />

              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-neutral-900">{product.name}</h3>
                  <span className="text-lg font-black text-amber-600">{formatPrice(product.variants[0].price_kes)}</span>
                </div>
                <p className="text-xs text-neutral-500 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    className="rounded-full text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest px-6"
                    onClick={() => handleAddToCart(product)}
                  >
                    Buy Now
                  </Button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: product.variants[0].price_kes,
                        image: product.images[1],
                        category: product.category,
                        badge: product.badge,
                        inStock: true
                      });
                    }}
                    className={`p-2 rounded-full transition-colors ${isInWishlist(product.id) ? "bg-amber-100 text-amber-500" : "hover:bg-neutral-100 text-neutral-400"
                      }`}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                  </button>
                </div>
              </CardContent>
            </Card>
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
      quote: "I've been buying BeeYield honey for my family for over a year now. The traceability feature gives me confidence that we're consuming 100% pure honey. Amazing quality!",
    },
    {
      name: "Amina Hassan",
      title: "Chef & restaurateur",
      quote: "As a professional chef, I'm very particular about ingredients. BeeYield's honey has become a staple in my kitchen. The flavor profiles are exceptional.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl font-black text-neutral-900 text-center mb-12">
          What people are <span className="text-green-700">saying</span>
        </h2>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Customer Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center overflow-hidden">
                  <span className="text-6xl">👩</span>
                </div>
                {/* Decorative honey elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-200 rounded-full opacity-80"></div>
                <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full overflow-hidden">
                  <img src="/images/products/beeyield_honey_500g.png" alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Quote */}
            <div>
              <p className="text-neutral-600 leading-relaxed mb-6 text-sm md:text-base">
                {testimonials[currentIndex].quote}
              </p>
              <p className="font-bold text-neutral-900">– {testimonials[currentIndex].name},</p>
              <p className="text-green-700 text-sm font-semibold">{testimonials[currentIndex].title}</p>
            </div>
          </div>

          {/* Carousel dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex ? "bg-green-600 w-8" : "bg-neutral-300 hover:bg-neutral-400"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// About Section - "The Buzzz about our Honey!"
const AboutSection = () => {
  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual side */}
          <div className="flex justify-center">
            <div className="relative group">
              {/* Main Lifestyle Image */}
              <div className="w-64 h-80 md:w-80 md:h-[450px] rounded-[3rem] overflow-hidden shadow-2xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-700">
                <img src="/images/products/beeyield_honey_1kg.png" alt="BeeYield Journey" className="w-full h-full object-cover bg-amber-50" />
              </div>

              {/* Overlapping Secondary Image */}
              <div className="absolute -bottom-10 -right-8 w-40 h-40 md:w-56 md:h-56 rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white transform rotate-6 group-hover:rotate-0 transition-transform duration-700 delay-100">
                <img src="/images/products/beeyield_honey_250g.png" alt="Our Impact" className="w-full h-full object-cover bg-amber-50" />
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-6 -left-6 bg-green-700 text-white p-4 rounded-2xl shadow-xl transform -rotate-12 font-black text-sm uppercase tracking-widest">
                50/50<br />Promise
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-6 uppercase tracking-tighter">
              The Most Trusted <span className="text-green-700 italic">Honey</span> in Makueni County
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-4 text-sm md:text-base">
              BeeYield was founded with a singular vision: to revolutionize beekeeping through technology and radical transparency. Our journey began in the pristine landscapes of Kenya, where we saw the need for a more sustainable approach. Today, we are proud to lead with our <strong>50/50 Harvest Promise</strong>—ensuring that for every drop we take, enough is left for the bees to thrive and pollinate our future.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-4 text-sm md:text-base">
              With over <strong>2,500 trees planted</strong> and a growing network of tech-enabled apiaries, our impact goes beyond just honey. Every jar you hold is powered by <strong>HoneyChain™ Traceability</strong>, allowing you to trace your honey back to the very hive it came from, meeting the beekeeper and seeing the digital seal of authenticity.
            </p>
            <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
              We believe in "Pollination with Purpose." When you choose BeeYield, you're buying raw, unfiltered honey and supporting a circular ecosystem: biodiversity, local farmers, and hive monitoring that protects our colonies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Features Section - 3 cards
const FeaturesSection = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: "HoneyChain™ Traceability",
      description: "Scan the QR code on any jar to trace your honey back to the specific hive and harvest date.",
    },
    {
      icon: Leaf,
      title: "50/50 Harvest Promise",
      description: "We only harvest what the bees can spare, leaving 50% of the surplus to ensure colony survival.",
    },
    {
      icon: Droplets,
      title: "IoT Health Monitoring",
      description: "Our hives use analysis and acoustic sensors to detect disease and stress before they impact the honey.",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-neutral-50 rounded-2xl p-6 text-center hover:bg-neutral-100 transition-colors"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <feature.icon className="h-7 w-7 text-green-700" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-500">{feature.description}</p>
            </div>
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
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-[#F0F7F0] border border-green-100 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Decorative honey jar */}
          <div className="absolute right-4 md:right-12 bottom-0 opacity-80 hidden sm:block">
            <img
              src="/images/products/beeyield_honey_1kg.png"
              alt=""
              className="w-48 md:w-64 transform translate-y-8"
            />
          </div>

          <div className="relative z-10 max-w-xl">
            <Badge className="bg-green-700 text-white mb-6 animate-bounce">Flash Sale</Badge>
            <h2 className="text-3xl md:text-5xl font-black text-neutral-900 mb-4 leading-tight">
              Get <span className="text-green-700">20% Off</span> on your first HoneyChain™ order!
            </h2>

            {/* Countdown Timer */}
            <div className="flex gap-3 mb-6">
              <div className="bg-white rounded-xl px-4 py-2 text-center min-w-[60px] border border-green-100 shadow-sm">
                <p className="text-2xl md:text-3xl font-black text-green-700">{String(timeLeft.hours).padStart(2, "0")}</p>
                <p className="text-[10px] text-neutral-500 font-semibold uppercase">Hours</p>
              </div>
              <span className="text-2xl text-neutral-300 font-bold self-center">:</span>
              <div className="bg-white rounded-xl px-4 py-2 text-center min-w-[60px] border border-green-100 shadow-sm">
                <p className="text-2xl md:text-3xl font-black text-green-700">{String(timeLeft.minutes).padStart(2, "0")}</p>
                <p className="text-[10px] text-neutral-500 font-semibold uppercase">Minutes</p>
              </div>
              <span className="text-2xl text-neutral-300 font-bold self-center">:</span>
              <div className="bg-white rounded-xl px-4 py-2 text-center min-w-[60px] border border-green-100 shadow-sm">
                <p className="text-2xl md:text-3xl font-black text-green-700">{String(timeLeft.seconds).padStart(2, "0")}</p>
                <p className="text-[10px] text-neutral-500 font-semibold uppercase">Seconds</p>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-full px-10 h-14 shadow-xl shadow-primary/10 uppercase tracking-widest text-xs"
              onClick={() => navigate("/shop")}
            >
              Claim Discount Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection = () => {
  const faqs = [
    {
      question: "How can I verify the authenticity of my honey?",
      answer: "Every jar of BeeYield honey features a unique HoneyChain™ QR code. By scanning it, you can access the 'Digital Birth Certificate' of your honey, showing the exact hive location, harvest date, moisture levels, and even the beekeeper who cared for the colony.",
    },
    {
      question: "What exactly is the 50/50 Harvest Promise?",
      answer: "Traditional beekeeping often over-harvests, leaving bees with sugar water. Our 50/50 Promise means we only take a maximum of 50% of the surplus honey. We leave the rest to ensure the bees have their natural, nutrient-rich food to survive and thrive through all seasons.",
    },
    {
      question: "How does BeeYield protect bees from diseases?",
      answer: "We use IoT-enabled sensors and advanced acoustic monitoring to listen to the hive. Our technology can detect the 'signature sounds' of stress or specific diseases (like Varroa mites or Foulbrood) up to 48 hours before they become critical, allowing for non-invasive, early intervention.",
    },
    {
      question: "Why does protecting bees result in better honey?",
      answer: "A healthy, stress-free bee colony has a stronger immune system and produces honey with higher enzymatic activity. By protecting bees from disease and environmental stress, we ensure the honey remains pure, potent, and free from the contaminants often found in struggling colonies.",
    },
    {
      question: "How are you contributing to apiary restoration?",
      answer: "We don't just place hives; we restore ecosystems. To date, we have planted over 2,500 indigenous trees around our apiary sites to provide diverse forage for bees and restore the natural biodiversity of the region.",
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
      await submitNewsletterSubscription({ email, source: "honey_landing" });
      setStatus("success");
      toast.success("Welcome to the hive! Check your email for confirmation.");
      setEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Subscription failed. Please try again later.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 text-center relative">
            {/* Close button decoration */}
            <button className="absolute top-4 right-4 text-neutral-300 hover:text-neutral-500">
              <span className="text-lg">&times;</span>
            </button>

            {/* Honeycomb illustration */}
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <img
                src="/images/products/beeyield_honey_250g.png"
                alt=""
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <h2 className="text-xl font-black text-neutral-900 mb-2">Join the Hive!</h2>
            <p className="text-xs text-neutral-500 mb-6">
              Become a part of our buzzing community by subscribing to our newsletter for exclusive offers, honey recipes, and beekeeping insights.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-full border-neutral-200 text-center text-sm"
                required
              />
              <Button
                type="submit"
                className="w-full h-10 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full text-sm"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Joining..." : "Join"}
              </Button>
            </form>
          </div>
        </div>
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
}: {
  selectedSizes: Record<string, string>;
  setSelectedSizes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleAddToCart: (product: Product) => void;
  formatPrice: (price: number) => string;
}) => {
  const honeyProducts = STATIC_PRODUCTS;
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-green-300 bg-green-50 text-green-700">
            Our Collection
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
            All Premium Honey Products
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Discover our complete range of pure, traceable honey sourced from the finest apiaries.
          </p>
        </div>

        {/* Products Grid - 4 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {honeyProducts.map((product) => {
            const selectedSize = selectedSizes[product.id] || product.variants[0].size;
            const selectedVariant = product.variants.find((v) => v.size === selectedSize) || product.variants[0];

            return (
              <Card
                key={product.id}
                className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300"
              >
                {/* Product Image with Branded UI Overlay */}
                {(() => {
                  const variantIndex = product.variants.findIndex(v => v.size === selectedSize);
                  // The new structure is: 0: Lifestyle, 1: 250g, 2: 500g, 3: 1kg
                  // So we use variantIndex + 1 to get the specific jar, or fallback to lifestyle
                  const displayImage = (variantIndex !== -1 && product.images[variantIndex + 1])
                    ? product.images[variantIndex + 1]
                    : product.images[0];

                  return (
                    <BrandedProductImage
                      src={displayImage}
                      alt={product.name}
                      category="honey"
                      badge={product.badge}
                      className="aspect-square bg-gradient-to-br from-amber-50 to-orange-50"
                    />
                  );
                })()}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const variantIndex = product.variants.findIndex(v => v.size === selectedSize);
                    const displayImage = (variantIndex !== -1 && product.images[variantIndex + 1])
                      ? product.images[variantIndex + 1]
                      : product.images[0];

                    toggleWishlist({
                      id: product.id,
                      name: product.name,
                      description: product.description,
                      price: selectedVariant.price_kes,
                      image: displayImage,
                      category: product.category,
                      badge: product.badge,
                      inStock: product.variants.some(v => v.stock_quantity > 0 && v.is_available)
                    });
                  }}
                  className={`absolute top-3 right-3 z-20 p-2 rounded-full transition-all ${isInWishlist(product.id)
                    ? "opacity-100 bg-amber-500 text-white"
                    : "opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-amber-500 hover:text-white"
                    }`}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                </button>

                <CardContent className="p-4">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
                      />
                    ))}
                    <span className="text-xs text-neutral-400 ml-1">({product.review_count})</span>
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-neutral-900 mb-1 group-hover:text-amber-600 transition-colors text-sm">
                    {product.name}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{product.description}</p>

                  {/* Size Selector */}
                  {product.variants.length > 1 && (
                    <Select
                      value={selectedSize}
                      onValueChange={(value) => setSelectedSizes({ ...selectedSizes, [product.id]: value })}
                    >
                      <SelectTrigger className="w-full h-9 mb-3 rounded-lg bg-neutral-50 border-neutral-200 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.map((v) => (
                          <SelectItem key={v.id} value={v.size} className="text-xs">
                            {v.size} — {formatPrice(v.price_kes)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Price & Buy */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-neutral-900">
                      {formatPrice(selectedVariant.price_kes)}
                    </span>
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
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    const selectedSize = selectedSizes[product.id] || product.variants[0].size;
    const variantIndex = product.variants.findIndex((v) => v.size === selectedSize);
    const variant = product.variants[variantIndex] || product.variants[0];
    const image = product.images[variantIndex + 1] || product.images[1];

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
      image: image,
    });

    toast.success(`${product.name} added to cart!`);
  };

  const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

  const faqs_structured = [
    {
      q: "How can I verify the authenticity of my honey?",
      a: "Every jar of BeeYield honey features a unique HoneyChain™ QR code. By scanning it, you can access the 'Digital Birth Certificate' showing exact hive location and harvest date."
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
        description="Shop 100% raw, traceable honey from Kibwezi. Powered by HoneyChain™ technology and the 50/50 Harvest Promise. Supporting sustainable pollination in Kenya."
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
      />

      <TestimonialSection />
      <AboutSection />
      <FeaturesSection />

      <AllProductsSection
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        handleAddToCart={handleAddToCart}
        formatPrice={formatPrice}
      />

      <FlashSaleSection />
      <FAQSection />
      <NewsletterSection />
    </div>
  );
};

export default HoneyLanding;
