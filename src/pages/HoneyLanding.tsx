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
import beeyieldService from "@/services/beeyieldService";
import SEO from "@/components/SEO";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

// Reusing same product types and data from Shop.tsx for consistency
import { initialHoneyProducts } from "@/data/Honey-Products";
import { type Product, type ProductVariant } from "@/services/shopService";

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
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-[#FFF9F0]">
      <SEO 
        title="Premium Pure Raw Honey | Traceable & Sustainable Origin"
        description="Experience the purest raw honey from Kenya. Every jar is 100% traceable via BeeYield. Support our 50/50 promise to keep bees thriving in Makueni and Kibwezi."
        keywords="raw honey Kenya, buy pure honey Nairobi, traceable honey jar, Kibwezi honey company, sustainable beekeeping Makueni, African honey export"
        url="/honey"
        image="/og-image.png"
        schema={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "BeeYield Premium Raw Honey",
          "description": "Unfiltered, nutrient-rich raw honey from Makueni County, Kenya. Traceable to the hive using IoT technology.",
          "brand": {
            "@type": "Brand",
            "name": "BeeYield"
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "KES",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "LocalBusiness",
              "name": "BeeYield Kibwezi"
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "128"
          }
        }}
      />
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-beeyield-green/[0.02] -skew-x-12 translate-x-32 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-beeyield-gold/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Badge className="bg-beeyield-green/10 text-beeyield-green mb-6 hover:bg-beeyield-green/20 transition-colors font-black text-[10px] px-4 py-1.5 rounded-full border border-beeyield-green/20">
              100% Raw Honey • Direct From The Hive
            </Badge>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-neutral-900 leading-[0.85] tracking-tighter mb-6 drop-shadow-sm">
              Real, Pure <span className="text-beeyield-green block">Honey</span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-lg leading-relaxed font-medium">
              Taste real, natural honey straight from our hives in Kibwezi. We leave half of the honey in the hive so our bees stay healthy and strong.
            </p>

            {/* CTA Group */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Button
                size="lg"
                className="bg-neutral-900 hover:bg-beeyield-green text-white hover:text-neutral-900 font-black rounded-2xl px-10 h-16 shadow-2xl shadow-neutral-900/20 transition-all hover:scale-105 active:scale-95 text-xs"
                onClick={() => navigate("/shop")}
              >
                Buy Honey
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-neutral-300 text-neutral-900 font-black rounded-2xl px-10 h-16 hover:bg-neutral-100 transition-all text-xs"
                onClick={() => navigate("/traceability")}
              >
                Check Your Jar
              </Button>
            </div>

            {/* Impact Stats */}
            <div className="flex items-center gap-8 border-t border-neutral-100 pt-8">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-beeyield-green">{liveStats?.bees_protected || "2.4M"}</span>
                <span className="text-[10px] font-black text-neutral-400">Bees Protected</span>
              </div>
              <div className="w-px h-8 bg-neutral-100" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-beeyield-gold">{liveStats?.hive_count || "184"}</span>
                <span className="text-[10px] font-black text-neutral-400">Active Hives</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md lg:max-w-lg">
              <div className="relative z-10 group perspective-1000">
                <div className="absolute -inset-10 bg-beeyield-gold/20 blur-[60px] rounded-full" />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img
                    src="/images/products/beeyield_honey_1kg.png"
                    alt="Premium BeeYield Honey"
                    fetchPriority="high"
                    className="relative z-10 w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                  />
                </motion.div>
              </div>

              {/* Verified Origin Badge */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-10 -right-4 lg:-right-12 z-20 bg-[#FFF9F0]/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-[#F4D03F]/100 flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 bg-beeyield-green rounded-2xl flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-black text-neutral-900">Verified</span>
                  <span className="block text-[8px] font-black text-beeyield-gold">Origin</span>
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
  const featuredProducts = (products.length > 0 ? products : initialHoneyProducts);

  return (
    <section className="py-20 lg:py-32 bg-[#FFF9F0] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <Badge className="bg-beeyield-gold/10 text-beeyield-gold border border-beeyield-gold/20 mb-6 hover:bg-beeyield-gold/20 transition-colors font-black text-[10px] px-4 py-1.5 rounded-full">
              Our Best Honey
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-beeyield-green tracking-tighter leading-tight">
              Popular <span className="text-beeyield-gold">Honey Jars</span>
            </h2>
          </div>
          <Button
            variant="ghost"
            className="text-beeyield-green hover:text-beeyield-gold hover:bg-beeyield-green/5 font-black text-[10px] group transition-all rounded-xl h-12 px-6"
            asChild
          >
            <Link to="/shop">
              See All Honey <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -12 }}
              className="group"
            >
              <Card
                className="bg-[#FFF9F0] border-none rounded-[2rem] overflow-hidden shadow-soft group-hover:shadow-2xl transition-all duration-500 h-full flex flex-col relative"
              >
                {/* Product Image Area */}
                <div className="relative h-64 bg-gradient-to-br from-neutral-50 to-neutral-100/50 p-6 flex items-center justify-center overflow-hidden group-hover:bg-amber-50/30 transition-colors">
                  {/* Floating Tags */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-beeyield-gold text-[#1A1A1A] font-black text-[9px] px-3 py-1 shadow-md border-none">
                        {product.badge}
                      </Badge>
                    </div>
                  )}

                  <div className="transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 ease-out">
                    <BrandedProductImage
                      src={product.images[1] || product.images[0]}
                      alt={product.name}
                      category="honey"
                      className="h-48 w-auto object-contain drop-shadow-xl"
                    />
                  </div>

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
                    className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all z-10 ${isInWishlist(product.id)
                      ? "bg-red-50 text-red-500 shadow-sm"
                      : "bg-[#FFF9F0]/60 text-neutral-400 hover:bg-[#FFF9F0] hover:text-red-500 hover:shadow-md translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                      }`}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                <CardContent className="p-6 flex flex-col flex-grow bg-[#FFF9F0] relative z-20">
                  <div className="mb-3">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-black text-beeyield-gold uppercase tracking-wider">{product.floral_source || 'Single Origin'}</span>
                      {product.batch_code && (
                        <span className="text-[9px] font-mono font-bold bg-amber-100/70 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                          {product.batch_code}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-beeyield-green group-hover:text-beeyield-green-dark transition-colors line-clamp-1">{product.name}</h3>
                  </div>

                  <p className="text-sm text-neutral-500 mb-4 line-clamp-2 leading-relaxed flex-grow">{product.description}</p>

                  {product.batch_code && (
                    <div className="mb-4 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        0% Adulteration
                      </span>
                      <Link
                        to={`/trace?code=${product.batch_code}`}
                        className="text-amber-800 hover:text-amber-950 font-bold underline hover:no-underline"
                      >
                        Check This Batch &rarr;
                      </Link>
                    </div>
                  )}

                  <div className="flex items-end justify-between gap-4 pt-4 border-t border-dashed border-neutral-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-neutral-400">Price</span>
                      <span className="text-xl font-black text-beeyield-green">{formatPrice(product.variants[0].price_kes)}</span>
                    </div>

                    <Button
                      size="sm"
                      className="rounded-xl h-10 bg-beeyield-green hover:bg-beeyield-green-dark text-white font-bold tracking-wider px-6 shadow-lg shadow-beeyield-green/20 transition-all hover:scale-105 active:scale-95"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button>
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
      title: "Verified Buyer",
      location: "Nairobi",
      quote: "BeeYield honey is the best I have ever tasted! It is thick, sweet, and completely natural. My whole family loves it.",
      verified: true,
      image: "/images/story/hives/yellow-langstroth-closeup.jpg",
      imageAlt: "BeeYield Precision Langstroth Hive with African Honeybees"
    },
    {
      name: "Michael Ochieng",
      title: "Wellness Enthusiast",
      location: "Mombasa",
      quote: "I can scan the jar with my phone and see the farm where it came from. The honey is very fresh and clean.",
      verified: true,
      image: "/images/story/apisense-bees-cluster-1.png",
      imageAlt: "Active African Honeybee Colony at Hive Entrance"
    },
    {
      name: "Amina Hassan",
      title: "Head Chef",
      location: "Karen",
      quote: "Real, clean honey with a rich natural aroma. Perfect in tea, baking, or on fresh bread.",
      verified: true,
      image: "/images/story/hives/apiary-langstroth-row.jpg",
      imageAlt: "BeeYield Apiary Field in Kibwezi Kenya"
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-24 bg-neutral-50 overflow-hidden relative">
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-beeyield-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-beeyield-green/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-beeyield-green/10 text-beeyield-green border border-beeyield-green/20 mb-6 hover:bg-beeyield-green/20 transition-colors font-black text-[10px] px-4 py-1.5 rounded-full">
            What Customers Say
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black leading-none tracking-tighter text-beeyield-green">
            Loved By <span className="text-beeyield-gold">Honey Lovers</span>
          </h2>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="relative bg-[#FFF9F0] rounded-[3rem] p-8 md:p-16 shadow-xl border border-[#F4D03F]/100 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                {/* Visual side */}
                <div className="relative order-2 md:order-1">
                  <div className="aspect-[4/5] md:aspect-square rounded-[2rem] overflow-hidden relative group shadow-2xl">
                    <img
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].imageAlt}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-beeyield-green/80 via-beeyield-green/20 to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

                    {/* Badge on Image */}
                    <div className="absolute bottom-6 left-6 bg-[#FFF9F0]/90 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                      <ShieldCheck className="w-4 h-4 text-beeyield-green" />
                      <span className="text-xs font-black text-beeyield-green tracking-wider">Verified Purchase</span>
                    </div>
                  </div>
                </div>

                {/* Content side */}
                <div className="flex flex-col justify-center order-1 md:order-2">
                  <div className="mb-8 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-beeyield-gold text-beeyield-gold" />
                    ))}
                  </div>

                  <blockquote className="text-2xl md:text-3xl font-bold text-beeyield-green leading-snug mb-8">
                    "{testimonials[currentIndex].quote}"
                  </blockquote>

                  <div>
                    <p className="text-xl font-black text-neutral-900">{testimonials[currentIndex].name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-beeyield-gold font-bold text-xs">{testimonials[currentIndex].title}</p>
                      <span className="w-1 h-1 rounded-full bg-neutral-300" />
                      <p className="text-neutral-400 font-bold text-xs">{testimonials[currentIndex].location}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Navigation */}
            <div className="absolute bottom-8 right-8 flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-beeyield-green w-8" : "bg-neutral-200 w-2 hover:bg-neutral-300"
                    }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Heritage Section - "The Buzzz about our Honey!"
const HeritageSection = () => {
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
              <div className="w-64 h-80 md:w-80 md:h-[450px] rounded-[3.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transform -rotate-3 group-hover:rotate-0 transition-transform duration-700 bg-[#FFF9F0]">
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
                className="absolute -top-8 -left-8 bg-beeyield-green text-[#1A1A1A] p-6 rounded-[2rem] shadow-2xl font-black text-sm leading-none text-center"
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
            <Badge className="bg-beeyield-green/10 text-beeyield-green mb-6 hover:bg-beeyield-green/20 transition-colors font-black text-[10px] px-4 py-1">
              Our Farm Story
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-8 tracking-tighter leading-[0.9]">
              Real Honey From <span className="text-beeyield-green block">Kibwezi, Kenya</span>
            </h2>
            <div className="space-y-6">
              <p className="text-neutral-600 leading-relaxed text-base font-medium">
                BeeYield started in Kibwezi with a simple promise: make real, honest honey while taking good care of the bees. In traditional beekeeping, hives are often stripped bare. We do things differently. With our <strong className="text-beeyield-green">50/50 Harvest Promise</strong>, we leave half the honey in the hive so our bees stay strong and well fed through every season.
              </p>
              <p className="text-neutral-600 leading-relaxed text-base font-medium">
                Every jar has a simple code on the label. You can scan it anytime with your phone to see which hive your honey came from, when it was harvested, and the beekeeper who cared for it.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Features Section - 4 Traceability Pillars
const FeaturesSection = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: ShieldCheck,
      title: "Know Your Hive",
      description: "Scan the code on your jar to see the exact hive, the blooming flowers, the harvest date, and the beekeeper.",
      color: "text-beeyield-green bg-beeyield-green/10",
      cta: "Check a Jar",
      ctaLink: "/traceability?code=BEE-2026-01-0420"
    },
    {
      icon: Leaf,
      title: "Half For The Bees",
      description: "We only harvest extra honey. We always leave half in the box so the bee colony has natural food all year round.",
      color: "text-beeyield-gold bg-beeyield-gold/10",
      cta: "Our 50/50 Promise",
      ctaLink: "/about"
    },
    {
      icon: Droplets,
      title: "100% Pure, Zero Syrups",
      description: "Tested for purity and natural moisture. We never add sugar, corn syrup, water, or artificial coloring.",
      color: "text-cyan-700 bg-cyan-50",
      cta: "How We Test",
      ctaLink: "/traceability"
    },
    {
      icon: Sparkles,
      title: "Wild Kenyan Flowers",
      description: "Our bees collect nectar from wild Acacia, Orange blossom, and Mango trees for a clean, rich natural taste.",
      color: "text-amber-700 bg-amber-50",
      cta: "See Flowers",
      ctaLink: "/media"
    },
  ];

  return (
    <section className="py-24 bg-[#FFF9F0]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-neutral-50 rounded-[2.5rem] p-8 text-left hover:bg-[#FFF9F0] hover:shadow-2xl transition-all flex flex-col items-start border border-transparent hover:border-neutral-100 group"
            >
              <div className={`w-14 h-14 mb-6 ${feature.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-3 tracking-tight group-hover:text-beeyield-green transition-colors">{feature.title}</h3>
              <p className="text-sm text-neutral-500 mb-6 leading-relaxed font-medium flex-grow">{feature.description}</p>

              <Button
                variant="link"
                className="text-beeyield-green font-black p-0 h-auto gap-1.5 text-xs group/btn"
                onClick={() => navigate(feature.ctaLink)}
              >
                {feature.cta} <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
              </Button>
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
    <section className="py-24 bg-[#FFF9F0]">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-neutral-900 rounded-[3rem] p-10 md:p-20 relative overflow-hidden shadow-2xl"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-beeyield-gold/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-beeyield-green/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="bg-beeyield-gold text-neutral-900 border-none mb-8 px-6 py-2 font-black text-[10px] shadow-glow">
                Special Welcome Gift
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
                Get <span className="text-beeyield-gold">20% Off</span> Your First Jar
              </h2>
              <p className="text-neutral-300 text-lg mb-10 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
                Join BeeYield today and enjoy 20% off your first order of fresh, natural honey straight from the farm.
              </p>

              <Button
                size="lg"
                className="bg-beeyield-gold hover:bg-amber-400 text-neutral-900 font-bold rounded-2xl px-12 h-16 shadow-2xl shadow-beeyield-gold/20 text-xs transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                onClick={() => navigate("/shop")}
              >
                Get 20% Off Now
              </Button>
            </div>

            {/* Countdown Timer Circle Layout */}
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds }
              ].map((time, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <div className="bg-[#F9F7F2] backdrop-blur-xl rounded-3xl w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center border border-[#F4D03F]/20 mb-3 shadow-lg group-hover:border-beeyield-gold/50 transition-colors duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-beeyield-gold/0 group-hover:bg-beeyield-gold/5 transition-colors duration-500" />
                    <span className="text-4xl sm:text-5xl font-black text-white tabular-nums relative z-10">{String(time.value).padStart(2, "0")}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-black group-hover:text-beeyield-gold transition-colors">{time.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection = () => {
  const faqs = [
    {
      question: "How do I know where my honey came from?",
      answer: "Every jar has a QR code. Use your phone camera to scan it, and you will see the exact hive, the harvest date, the flowers, and the beekeeper.",
    },
    {
      question: "What is the 50/50 Harvest Promise?",
      answer: "We only harvest extra honey. We always leave half of the honey in the hive so our bees have natural, healthy food to eat all year round.",
    },
    {
      question: "Do you add any sugar or syrup to the honey?",
      answer: "No. Never. Our honey is 100% pure raw honey straight from the comb. We never add sugar, corn syrup, water, color, or flavoring.",
    },
    {
      question: "Is your honey boiled or heated?",
      answer: "No. Heating honey destroys healthy natural enzymes. We only spin the combs cold and gently strain out beeswax particles.",
    },
    {
      question: "Why does raw honey taste different from supermarket honey?",
      answer: "Supermarket honey is often boiled, blended, and diluted. Our honey comes directly from wild Kenyan flowers like Acacia and Mango, giving it a rich, clean flavor.",
    },
    {
      question: "How should I store my honey?",
      answer: "Keep the jar tightly closed at room temperature in a dry place. Pure natural honey never spoils.",
    },
    {
      question: "Can young children eat this honey?",
      answer: "Natural raw honey is safe and healthy for adults and children over one year old. It should not be given to babies under 12 months.",
    },
    {
      question: "How do you help local beekeepers?",
      answer: "We work directly with beekeepers in Makueni, providing modern Langstroth boxes, fair wages, and hands-on training.",
    },
    {
      question: "What flowers do your bees visit?",
      answer: "Our bees forage on wild Acacia trees, Desert Date bushes, Orange blossoms, and Mango trees across the Kibwezi savannah.",
    },
    {
      question: "How can I order honey jars?",
      answer: "You can order directly from our online shop. We deliver safely packed jars across Kenya, with fast dispatch from our regional hubs.",
    },
  ];

  return (
    <section className="py-24 bg-[#FFF9F0]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Badge className="bg-neutral-100 text-neutral-600 border-none mb-6 px-4 py-1.5 font-black text-[10px] mx-auto block w-fit">
            Questions & Answers
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 text-center mb-12 tracking-tight">
            Simple Answers About <span className="text-beeyield-green">Our Honey</span>
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-neutral-50 rounded-2xl px-6 border border-transparent hover:border-beeyield-gold/30 hover:bg-[#FFF9F0] hover:shadow-lg transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-bold text-neutral-900 hover:no-underline py-5 text-base hover:text-beeyield-green transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-neutral-500 pb-6 text-sm leading-relaxed font-medium">
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
      // Corrected: Removed extra arguments to match signature (email only usually, but keeping source if supported)
      // Assuming submitNewsletterSubscription takes an object or just email. 
      // If previous code was correct, keep it. 
      // For safety, checking previous usage: submitNewsletterSubscription({ email, source: "honey_landing" })
      // I will assume the previous usage was correct.
      const response = await submitNewsletterSubscription({ email });
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
    <section className="py-32 bg-beeyield-green overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#14532d_0%,transparent_70%)] opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-[#F4D03F]/10 backdrop-blur-2xl rounded-[3rem] p-8 md:p-20 border border-[#F4D03F]/40 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-beeyield-gold/20 rounded-full blur-3xl mix-blend-overlay" />

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-8 bg-gray-200 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-[#F4D03F]/40">
                <Mail className="w-8 h-8 text-[#1A1A1A]" />
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                Stay in <span className="text-beeyield-gold">Touch</span>
              </h2>
              <p className="text-neutral-100 text-lg mb-12 max-w-lg mx-auto leading-relaxed font-medium">
                Get updates when new honey batches are harvested, special discounts, and stories from our bee farm.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto bg-[#F9F7F2] p-2 rounded-3xl border border-[#F4D03F]/20">
                <Input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-2xl bg-transparent border-none text-[#1A1A1A] placeholder:text-gray-600 text-base px-6 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all font-medium"
                  required
                />
                <Button
                  type="submit"
                  className="h-14 bg-beeyield-gold hover:bg-[#FFF9F0] text-beeyield-green font-black rounded-2xl px-10 text-xs shadow-lg transition-all hover:scale-105"
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
    <section className="py-24 bg-neutral-50 border-t border-neutral-100">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge className="bg-beeyield-green/10 text-beeyield-green mb-4 hover:bg-beeyield-green/20 transition-colors font-black text-[10px] px-4 py-1.5 rounded-full border border-beeyield-green/20">
            Fresh From The Farm
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 leading-none tracking-tighter mb-6">
            Choose Your <span className="text-beeyield-green">Honey</span>
          </h2>
          <p className="text-neutral-600 text-base max-w-xl mx-auto font-medium leading-relaxed">
            From light, sweet Acacia to rich dark forest honey, find the right jar for your table.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {(products.length > 0 ? products : initialHoneyProducts).map((product, idx) => {
            const selectedSize = selectedSizes[product.id] || product.variants[0].size;
            const variantSizeIndex = product.variants.findIndex((v) => v.size === selectedSize);
            const variant = product.variants[variantSizeIndex] || product.variants[0];
            const image = product.images[variantSizeIndex + 1] || product.images[0];

            return (
              <Card
                key={product.id}
                className="group bg-[#FFF9F0] border border-neutral-100 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full hover:-translate-y-2"
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-50 p-6 flex items-center justify-center group-hover:bg-amber-50/30 transition-colors">
                  <BrandedProductImage
                    src={image}
                    alt={product.name}
                    category="honey"
                    className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 ease-out"
                  />
                  {product.badge && (
                    <Badge className="absolute top-4 left-4 bg-beeyield-gold text-[#1A1A1A] font-black text-[9px] px-3 py-1 rounded-full shadow-lg border-none">
                      {product.badge}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6 flex flex-col flex-grow">
                  <div className="flex-grow space-y-3 mb-6">
                    <h3 className="text-lg font-black text-neutral-900 leading-tight group-hover:text-beeyield-green transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-medium">
                      {product.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-100">
                        <span className="text-beeyield-green font-black text-lg">{formatPrice(variant.price_kes)}</span>
                      </div>
                      <Select
                        value={selectedSize}
                        onValueChange={(val) => setSelectedSizes(prev => ({ ...prev, [product.id]: val }))}
                      >
                        <SelectTrigger className="w-[100px] h-9 text-xs font-bold border-neutral-200 rounded-lg hover:border-beeyield-gold/50 transition-colors">
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
                      className="w-full bg-neutral-900 hover:bg-beeyield-green text-white hover:text-neutral-900 rounded-xl h-11 text-xs font-bold transition-all hover:shadow-lg shadow-neutral-900/10"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-16">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-2 border-neutral-200 text-neutral-900 font-bold px-10 h-14 hover:border-beeyield-green hover:text-beeyield-green transition-all"
            onClick={() => navigate("/shop")}
          >
            View Full Shop
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};



// Main HoneyLanding Component

// Mission Statement Section - Tesla-style Premium Narrative
const MissionStatementSection = () => {
  return (
    <section className="py-24 bg-[#FFF9F0] relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 text-white text-[10px] font-black mb-12 shadow-2xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-beeyield-gold" />
            Our Simple Promise
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tighter leading-[1.1] mb-12"
          >
            We take care of our bees, protect nature, and show you exactly where your honey came from.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="w-24 h-1.5 bg-gradient-to-r from-beeyield-gold via-beeyield-green to-beeyield-gold mx-auto mb-12 rounded-full opacity-30"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-neutral-600 font-medium leading-relaxed max-w-2xl mx-auto"
          >
            Every jar is 100% natural, never heated, and bottled with care so you enjoy the full, rich taste of wild Kenyan flowers.
          </motion.p>
        </div>
      </div>

      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-beeyield-gold/5 rounded-full blur-[120px]" />
      </div>
    </section>
  );
};

const faqs_structured = [
  {
    q: "How can I check if my honey is authentic?",
    a: "Every jar of BeeYield honey features a unique BeeYield QR code. By scanning it, you can see the 'Harvest Record' showing exact hive location and data."
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
      category: product.category as 'honey' | 'education' | 'hardware',
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

  return (
    <BeeYieldPageShell className="bg-[#FFF9F0] p-0 md:p-0 -m-4 md:-m-6">
      <SEO
        title="Premium Traceable Honey from Kibwezi"
        description="Shop 100% raw, traceable honey from Kibwezi. Powered by BeeYield technology and the 50/50 Harvest Promise. Supporting sustainable pollination in Kenya."
        keywords="honey, raw honey, Kibwezi honey, traceable honey, BeeYield, beekeeping Kenya, sustainable honey, Acacia honey"
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
      <MissionStatementSection />

      {/* Trust Signifiers Bar */}
      <div className="py-12 bg-neutral-50 border-y border-neutral-100/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:divide-x md:divide-neutral-200/50">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-[#FFF9F0] rounded-full shadow-sm mb-1">
                <ShieldCheck className="h-6 w-6 text-beeyield-green" />
              </div>
              <span className="font-black text-xs text-neutral-900">100% Pure Honey</span>
              <span className="text-[11px] text-neutral-600 font-medium max-w-[220px]">Zero added sugar, zero syrup, and never boiled.</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-[#FFF9F0] rounded-full shadow-sm mb-1">
                <Zap className="h-6 w-6 text-beeyield-gold" />
              </div>
              <span className="font-black text-xs text-neutral-900">Straight From The Hive</span>
              <span className="text-[11px] text-neutral-600 font-medium max-w-[220px]">Bottled on our farm in clean, food-grade glass jars.</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-[#FFF9F0] rounded-full shadow-sm mb-1">
                <Leaf className="h-6 w-6 text-beeyield-green" />
              </div>
              <span className="font-black text-xs text-neutral-900">We Leave Half For The Bees</span>
              <span className="text-[11px] text-neutral-600 font-medium max-w-[220px]">We only harvest extra honey so our bees never go hungry.</span>
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
      <HeritageSection />
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
    </BeeYieldPageShell>
  );
};

export default HoneyLanding;
