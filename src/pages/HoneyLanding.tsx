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

// Reusing same product types and data from Shop.tsx for consistency
import { initialHoneyProducts } from "@/data/honey-products";
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
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-white">
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
            <Badge className="bg-beeyield-green/10 text-beeyield-green mb-6 hover:bg-beeyield-green/20 transition-colors uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1.5 rounded-full border border-beeyield-green/20">
              Verifiable Purity • Smart Beekeeping
            </Badge>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-neutral-900 leading-[0.85] tracking-tighter uppercase mb-6 drop-shadow-sm">
              The Purest <span className="text-beeyield-green block">Harvest</span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-500 mb-10 max-w-lg leading-relaxed font-medium">
              Experience the world's most transparent honey. Powered by <span className="text-beeyield-gold font-bold">HoneyChain™</span> and a commitment to protecting 50% of the surplus for the bees.
            </p>

            {/* CTA Group */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Button
                size="lg"
                className="bg-neutral-900 hover:bg-beeyield-green text-gray-900 font-black rounded-2xl px-10 h-16 shadow-2xl shadow-neutral-900/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
                onClick={() => navigate("/shop")}
              >
                Shop Collection
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-neutral-200 text-neutral-900 font-black rounded-2xl px-10 h-16 hover:bg-neutral-50 transition-all uppercase tracking-widest text-xs"
                onClick={() => navigate("/traceability")}
              >
                Trace Your Jar
              </Button>
            </div>

            {/* Impact Stats */}
            <div className="flex items-center gap-8 border-t border-neutral-100 pt-8">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-beeyield-green">{liveStats?.bees_protected || "2.4M"}</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-neutral-400">Bees Protected</span>
              </div>
              <div className="w-px h-8 bg-neutral-100" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-beeyield-gold">{liveStats?.hive_count || "184"}</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-neutral-400">Smart Hives</span>
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
                className="absolute top-10 -right-4 lg:-right-12 z-20 bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/50 flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 bg-beeyield-green rounded-2xl flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-gray-900" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-black text-neutral-900">Verified</span>
                  <span className="block text-[8px] font-black text-beeyield-gold uppercase tracking-widest">Origin</span>
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
    <section className="py-20 lg:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <Badge className="bg-beeyield-gold/10 text-beeyield-gold border border-beeyield-gold/20 mb-6 hover:bg-beeyield-gold/20 transition-colors uppercase tracking-[0.25em] font-black text-[10px] px-4 py-1.5 rounded-full">
              Purest Gold
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-beeyield-green tracking-tighter leading-tight">
              Featured <span className="text-beeyield-gold">Collection</span>
            </h2>
          </div>
          <Button
            variant="ghost"
            className="text-beeyield-green hover:text-beeyield-gold hover:bg-beeyield-green/5 font-black uppercase tracking-widest text-[10px] group transition-all rounded-xl h-12 px-6"
            asChild
          >
            <Link to="/shop">
              Shop All <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
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
                className="bg-white border-none rounded-[2rem] overflow-hidden shadow-soft group-hover:shadow-2xl transition-all duration-500 h-full flex flex-col relative"
              >
                {/* Product Image Area */}
                <div className="relative h-64 bg-gradient-to-br from-neutral-50 to-neutral-100/50 p-6 flex items-center justify-center overflow-hidden group-hover:bg-amber-50/30 transition-colors">
                  {/* Floating Tags */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-beeyield-gold text-gray-900 font-black uppercase text-[9px] tracking-widest px-3 py-1 shadow-md border-none">
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
                      : "bg-white/60 text-neutral-400 hover:bg-white hover:text-red-500 hover:shadow-md translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                      }`}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                <CardContent className="p-6 flex flex-col flex-grow bg-white relative z-20">
                  <div className="mb-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-beeyield-gold mb-1">Single Origin</div>
                    <h3 className="font-bold text-lg text-beeyield-green group-hover:text-beeyield-green-dark transition-colors line-clamp-1">{product.name}</h3>
                  </div>

                  <p className="text-sm text-neutral-500 mb-6 line-clamp-2 leading-relaxed flex-grow">{product.description}</p>

                  <div className="flex items-end justify-between gap-4 pt-4 border-t border-dashed border-neutral-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Price</span>
                      <span className="text-xl font-black text-beeyield-green">{formatPrice(product.variants[0].price_kes)}</span>
                    </div>

                    <Button
                      size="sm"
                      className="rounded-xl h-10 bg-beeyield-green hover:bg-beeyield-green-dark text-gray-900 font-black uppercase tracking-wider px-6 shadow-lg shadow-beeyield-green/20 transition-all hover:scale-105 active:scale-95"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add
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
      quote: "BeeYield honey is the best I've ever had! The taste is so pure and rich, and I love knowing that it's ethically sourced through the 50/50 promise.",
      verified: true
    },
    {
      name: "Michael Ochieng",
      title: "Wellness Enthusiast",
      location: "Mombasa",
      quote: "The traceability feature gives me confidence that we're consuming 100% pure honey. Amazing quality!",
      verified: true
    },
    {
      name: "Amina Hassan",
      title: "Head Chef",
      location: "Karen",
      quote: "As a professional chef, I'm very particular about ingredients. BeeYield's honey has become a staple in my kitchen.",
      verified: true
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
          <Badge className="bg-beeyield-green/10 text-beeyield-green border border-beeyield-green/20 mb-6 hover:bg-beeyield-green/20 transition-colors uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1.5 rounded-full">
            Community Love
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black leading-none tracking-tighter uppercase text-beeyield-green">
            Trusted by the <span className="text-beeyield-gold">Hive</span>
          </h2>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="relative bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-white/50 backdrop-blur-sm">
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
                      src={`https://i.pravatar.cc/600?u=${testimonials[currentIndex].name}`}
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-beeyield-green/80 via-beeyield-green/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Badge on Image */}
                    <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                      <ShieldCheck className="w-4 h-4 text-beeyield-green" />
                      <span className="text-xs font-black text-beeyield-green uppercase tracking-wider">Verified Purchase</span>
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
                      <p className="text-beeyield-gold font-bold uppercase tracking-widest text-xs">{testimonials[currentIndex].title}</p>
                      <span className="w-1 h-1 rounded-full bg-neutral-300" />
                      <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">{testimonials[currentIndex].location}</p>
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
                className="absolute -top-8 -left-8 bg-beeyield-green text-gray-900 p-6 rounded-[2rem] shadow-2xl font-black text-sm uppercase tracking-widest leading-none text-center"
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
            <Badge className="bg-beeyield-green/10 text-beeyield-green mb-6 hover:bg-beeyield-green/20 transition-colors uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1">
              Our Vision
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-8 uppercase tracking-tighter leading-[0.9]">
              The Most Trusted <span className="text-beeyield-green block">Honey in Makueni</span>
            </h2>
            <div className="space-y-6">
              <p className="text-neutral-600 leading-relaxed text-base font-medium">
                BeeYield was founded with a simple goal: to make beekeeping better through technology and honest reporting. Our journey began in the pristine landscapes of Kenya, where we saw the need for a more sustainable approach. Today, we are proud to lead with our <strong className="text-beeyield-green">50/50 Harvest Promise</strong>—ensuring that for every drop we take, enough is left for the bees to thrive.
              </p>
              <p className="text-neutral-600 leading-relaxed text-base font-medium">
                Every jar you hold features <strong className="text-beeyield-gold">Honey Journey Tracking</strong>, allowing you to trace your honey back to the very hive it came from, meeting the beekeeper and seeing our verified seal of authenticity.
              </p>
              <div className="pt-4">
                <Button size="lg" variant="link" className="text-beeyield-green font-black p-0 h-auto gap-2 uppercase tracking-[0.2em] text-xs group" asChild>
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
      color: "text-beeyield-green bg-beeyield-green/10"
    },
    {
      icon: Leaf,
      title: "50/50 Harvest Promise",
      description: "We only harvest what the bees can spare, leaving 50% of the surplus to ensure colony survival.",
      color: "text-beeyield-gold bg-beeyield-gold/10"
    },
    {
      icon: Droplets,
      title: "Intelligent Hive Monitoring",
      description: "Our hives use intelligent sensors to detect disease and stress before they impact the honey.",
      color: "text-beeyield-orange bg-beeyield-orange/10"
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-neutral-50 rounded-[2.5rem] p-10 text-left hover:bg-white hover:shadow-2xl transition-all flex flex-col items-start border border-transparent hover:border-neutral-100 group"
            >
              <div className={`w-16 h-16 mb-8 ${feature.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-neutral-900 mb-4 tracking-tight group-hover:text-beeyield-green transition-colors">{feature.title}</h3>
              <p className="text-sm text-neutral-500 mb-8 leading-relaxed font-medium flex-grow">{feature.description}</p>

              {feature.title === "Honey Journey Tracking" && (
                <Button
                  variant="link"
                  className="text-beeyield-green font-black p-0 h-auto gap-2 text-xs uppercase tracking-widest group/btn"
                  onClick={() => navigate("/traceability")}
                >
                  Verify Now <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
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
    <section className="py-24 bg-white">
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
              <Badge className="bg-beeyield-gold text-neutral-900 border-none mb-8 px-6 py-2 font-black uppercase tracking-widest text-[10px] shadow-glow">
                Limited Time Offer
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-[0.9] tracking-tighter uppercase">
                Claim Your <span className="text-beeyield-gold">20% Welcome</span> Discount
              </h2>
              <p className="text-neutral-400 text-lg mb-10 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
                Join the BeeYield community today and get a discount on your first purchase of our traceable honey.
              </p>

              <Button
                size="lg"
                className="bg-gradient-to-r from-beeyield-gold to-beeyield-orange hover:from-beeyield-orange hover:to-beeyield-gold text-gray-900 font-black rounded-2xl px-12 h-16 shadow-2xl shadow-beeyield-gold/20 uppercase tracking-[0.2em] text-xs transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                onClick={() => navigate("/shop")}
              >
                Claim Discount Now
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
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center border border-gray-200 mb-3 shadow-lg group-hover:border-beeyield-gold/50 transition-colors duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-beeyield-gold/0 group-hover:bg-beeyield-gold/5 transition-colors duration-500" />
                    <span className="text-4xl sm:text-5xl font-black text-gray-900 tabular-nums relative z-10">{String(time.value).padStart(2, "0")}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest group-hover:text-beeyield-gold transition-colors">{time.label}</span>
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
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Badge className="bg-neutral-100 text-neutral-600 border-none mb-6 px-4 py-1.5 font-black uppercase tracking-widest text-[10px] mx-auto block w-fit">
            Common Questions
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 text-center mb-12 uppercase tracking-tight">
            Curious about <span className="text-beeyield-green">Quality?</span>
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-neutral-50 rounded-2xl px-6 border border-transparent hover:border-beeyield-gold/30 hover:bg-white hover:shadow-lg transition-all duration-300"
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
          <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-8 md:p-20 border border-gray-300 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-beeyield-gold/20 rounded-full blur-3xl mix-blend-overlay" />

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-8 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-gray-300">
                <Mail className="w-8 h-8 text-gray-900" />
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 uppercase tracking-tighter">
                Keep in <span className="text-beeyield-gold">Touch</span>
              </h2>
              <p className="text-beeyield-green-100/80 text-lg mb-12 max-w-lg mx-auto leading-relaxed font-medium">
                Subscribe for exclusive drops, blockchain reports, and the future of verifiable beekeeping.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto bg-white/5 p-2 rounded-3xl border border-gray-200">
                <Input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-2xl bg-transparent border-none text-gray-900 placeholder:text-gray-600 text-base px-6 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all font-medium"
                  required
                />
                <Button
                  type="submit"
                  className="h-14 bg-beeyield-gold hover:bg-white text-beeyield-green font-black rounded-2xl px-10 text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-105"
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
          <Badge className="bg-beeyield-green/10 text-beeyield-green mb-4 hover:bg-beeyield-green/20 transition-colors uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1.5 rounded-full border border-beeyield-green/20">
            Pure Kibwezi Gold
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 leading-none tracking-tighter uppercase mb-6">
            Our Full <span className="text-beeyield-green">Honey</span> Collection
          </h2>
          <p className="text-neutral-500 text-base max-w-xl mx-auto font-medium leading-relaxed">
            From medicinal Neem to delicate Acacia, discover our range of ethically harvested, 100% raw honey.
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
                className="group bg-white border border-neutral-100 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full hover:-translate-y-2"
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-50 p-6 flex items-center justify-center group-hover:bg-amber-50/30 transition-colors">
                  <BrandedProductImage
                    src={image}
                    alt={product.name}
                    category="honey"
                    className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 ease-out"
                  />
                  {product.badge && (
                    <Badge className="absolute top-4 left-4 bg-beeyield-gold text-gray-900 font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full shadow-lg border-none">
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
                      className="w-full bg-neutral-900 hover:bg-beeyield-green text-gray-900 rounded-xl h-11 text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-lg shadow-neutral-900/10"
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
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 text-gray-900 text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-2xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-beeyield-gold" />
            The Mission
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tighter leading-[1.1] mb-12 uppercase"
          >
            To protect the world's pollinators through <span className="text-beeyield-green">bio-digital intelligence</span> and provide consumers with <span className="text-beeyield-gold italic">radical transparency</span>.
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
            className="text-lg md:text-xl text-neutral-500 font-medium leading-relaxed max-w-2xl mx-auto"
          >
            Ensuring every drop of honey is not just a product, but a testament to planetary health and verified ecosystem restoration.
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
      <MissionStatementSection />

      {/* Trust Signifiers Bar */}
      <div className="py-12 bg-neutral-50 border-y border-neutral-100/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:divide-x md:divide-neutral-200/50">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-white rounded-full shadow-sm mb-1">
                <ShieldCheck className="h-6 w-6 text-beeyield-green" />
              </div>
              <span className="font-black uppercase tracking-widest text-xs text-neutral-900">100% Lab Tested</span>
              <span className="text-[10px] text-neutral-500 font-medium max-w-[200px]">Verified for purity and absence of antibiotics</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-white rounded-full shadow-sm mb-1">
                <Zap className="h-6 w-6 text-beeyield-gold" />
              </div>
              <span className="font-black uppercase tracking-widest text-xs text-neutral-900">Direct from Hive</span>
              <span className="text-[10px] text-neutral-500 font-medium max-w-[200px]">Bottled at source to preserve active enzymes</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-white rounded-full shadow-sm mb-1">
                <Leaf className="h-6 w-6 text-beeyield-green" />
              </div>
              <span className="font-black uppercase tracking-widest text-xs text-neutral-900">Sustainable Harvest</span>
              <span className="text-[10px] text-neutral-500 font-medium max-w-[200px]">50/50 Promise: We leave half for the bees</span>
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
