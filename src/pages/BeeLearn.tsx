import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  BookOpen,
  GraduationCap,
  PlayCircle,
  FileText,
  Star,
  Users,
  Award,
  Download,
  ChevronRight,
  Heart,
  Loader2,
  CheckCircle,
  ArrowRight,
  Quote,
  Leaf,
  Bug,
  Briefcase,
  Monitor,
  Package,
} from "lucide-react";
import { Product } from "@/services/shopService";
import { toast } from "sonner";
import { submitNewsletterSubscription } from "@/services/contactService";

// Education products from Shop
const initialEducationProducts: Product[] = [
  // ... existing products ...
];

// Stats data
const stats = [
  { value: "12,500+", label: "Certified Students", icon: GraduationCap },
  { value: "4.9/5", label: "Instructor Rating", icon: Star },
  { value: "50+", label: "Digital Guides", icon: FileText },
  { value: "24/7", label: "Access Available", icon: Monitor },
];

// Partner logos (text placeholders)
const partners = [
  "AGRITECH INSTITUTE",
  "GLOBAL HIVE ALLIANCE",
  "APIARY SCIENCE LABS",
  "UNIVERSITY OF AGRO",
  "NATURE CONSERVANCY",
  "BEE RESEARCH ORG",
];

// Workshop categories
const workshops = [
  {
    title: "Swarm Removal",
    description: "Learn expert methods to safely capture and relocate bee swarms",
    icon: Bug,
    color: "bg-amber-100 text-[#F4D03F]"
  },
  {
    title: "Harvesting",
    description: "Master sustainable honey extraction techniques and timing",
    icon: Leaf,
    color: "bg-green-100 text-[#1B9157]"
  },
  {
    title: "Specialization",
    description: "Advanced courses for commercial apiaries and research",
    icon: Award,
    color: "bg-blue-100 text-blue-700"
  },
  {
    title: "Workshops",
    description: "Hands-on field training with industry experts",
    icon: Briefcase,
    color: "bg-purple-100 text-purple-700"
  },
];

const BeeLearn = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Modal States
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Form States
  const [guideEmail, setGuideEmail] = useState("");
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { getProducts } = await import("@/services/shopService");
        const eduData = await getProducts("education");
        // Also check 'learn' category if 'education' is empty
        let finalData = eduData;
        if (!finalData || finalData.length === 0) {
          finalData = await getProducts("learn");
        }

        if (finalData && finalData.length > 0) {
          setProducts(finalData);
        } else {
          setProducts(initialEducationProducts); // Fallback to hardcoded if no data
        }
      } catch (error) {
        console.error("Failed to fetch education products:", error);
        setProducts(initialEducationProducts); // Fallback to hardcoded on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handlers
  const handleGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await submitNewsletterSubscription({ email: guideEmail, source: 'starter_guide_download' });
      toast.success(response?.message || "Guide sent to your email!");
      setIsGuideModalOpen(false);
      setGuideEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { submitContactForm } = await import("@/services/contactService");
      const response = await submitContactForm({
        first_name: quoteForm.name.split(' ')[0],
        last_name: quoteForm.name.split(' ').slice(1).join(' ') || '',
        email: quoteForm.email,
        phone: "",
        city: "",
        state: "",
        country: "",
        inquiry_type: "general",
        company: quoteForm.company,
        topic: "Corporate Workshop Quote",
        message: quoteForm.message
      });
      toast.success(response?.message || "Quote request received! We'll be in touch shortly.");
      setIsQuoteModalOpen(false);
      setQuoteForm({ name: "", email: "", company: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsSubmitting(true);
    try {
      const response = await submitNewsletterSubscription({ email: newsletterEmail, source: 'beelearn_footer' });
      toast.success(response?.message || "Welcome to the community!");
      setNewsletterEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Subscription failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAddToCart = async (product: Product) => {
    const selectedSize = selectedSizes[product.id] || product.variants[0].size;
    const variant = product.variants.find((v) => v.size === selectedSize) || product.variants[0];

    const cartItem = {
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      description: product.description,
      size: selectedSize,
      price: variant.price_kes,
      quantity: 1,
      category: product.category as any,
      badge: product.badge,
      image: product.images[0],
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

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-amber-500 text-[#F4D03F]" : "text-muted-foreground/30"
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#FFF9F0]">
      {/* GUIDE MODAL */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F9F7F2]0 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#FFF9F0] rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsGuideModalOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600">
              <span className="text-2xl">&times;</span>
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-[#F4D03F]" />
              </div>
              <h3 className="text-2xl font-black text-neutral-900">Get Your Free Guide</h3>
              <p className="text-neutral-500 text-sm mt-2">Enter your email to receive the "Beekeeping Starter Guide" instantly.</p>
            </div>
            <form onSubmit={handleGuideSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Email Address</label>
                <input
                  id="guide-email"
                  name="guide-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={guideEmail}
                  onChange={e => setGuideEmail(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-green-700 hover:bg-green-800 text-[#1A1A1A] font-bold rounded-xl">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Send Me The Guide"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* QUOTE MODAL */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F9F7F2]0 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#FFF9F0] rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setIsQuoteModalOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600">
              <span className="text-2xl">&times;</span>
            </button>
            <div className="mb-6">
              <span className="bg-green-100 text-[#1B9157] text-xs font-bold px-2 py-1 rounded-md uppercase">Corporate</span>
              <h3 className="text-2xl font-black text-neutral-900 mt-2">Request Training Quote</h3>
              <p className="text-neutral-500 text-sm mt-1">Tell us about your organization's needs.</p>
            </div>
            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quote-contact-name" className="block text-xs font-bold uppercase text-neutral-500 mb-1">Contact Name</label>
                  <input id="quote-contact-name" name="contact-name" type="text" required className="w-full h-10 px-3 rounded-lg border border-neutral-200" value={quoteForm.name} onChange={e => setQuoteForm({ ...quoteForm, name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="quote-company" className="block text-xs font-bold uppercase text-neutral-500 mb-1">Company</label>
                  <input id="quote-company" name="company" type="text" required className="w-full h-10 px-3 rounded-lg border border-neutral-200" value={quoteForm.company} onChange={e => setQuoteForm({ ...quoteForm, company: e.target.value })} />
                </div>
              </div>
              <div>
                <label htmlFor="quote-email" className="block text-xs font-bold uppercase text-neutral-500 mb-1">Work Email</label>
                <input id="quote-email" name="work-email" type="email" required className="w-full h-10 px-3 rounded-lg border border-neutral-200" value={quoteForm.email} onChange={e => setQuoteForm({ ...quoteForm, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Training Needs</label>
                <textarea id="quote-message" name="training-needs" required rows={3} className="w-full p-3 rounded-lg border border-neutral-200" placeholder="Number of attendees, preferred dates, etc." value={quoteForm.message} onChange={e => setQuoteForm({ ...quoteForm, message: e.target.value })}></textarea>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-[#F4D03F] hover:bg-amber-600 text-[#1A1A1A] font-bold rounded-xl">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Request"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#F0F7F0] pt-8 pb-20 lg:pt-16 lg:pb-32">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-[40%] h-[80%] bg-gradient-to-bl from-green-200/30 to-green-300/20 rounded-bl-[100px] blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[50%] bg-gradient-to-tr from-green-100/40 to-transparent rounded-tr-full blur-2xl -z-10" />

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <Badge
                variant="outline"
                className="mb-6 px-4 py-1.5 border-green-300 bg-green-50 text-[#1B9157] font-semibold"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                BeeYield Learn Platform
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 mb-6 leading-[1.1] tracking-tight">
                Master the Art of{" "}
                <span className="text-[#1B9157]">Sustainable Beekeeping</span>
              </h1>

              <p className="text-lg lg:text-xl text-neutral-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Access expert-led video curriculums, comprehensive PDF field manuals, and apiary certifications. From backyard hobbyists to commercial producers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Button
                  size="lg"
                  className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl shadow-lg uppercase tracking-widest text-xs"
                  asChild
                >
                  <a href="#courses">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Browse Course Catalog
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 border-2 border-neutral-200 hover:bg-neutral-50 font-bold rounded-xl"
                  onClick={() => setIsGuideModalOpen(true)}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Free Starter Guide
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#1B9157]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-black text-neutral-900">12,500+</p>
                    <p className="text-xs text-neutral-500 font-medium">Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-[#1B9157] fill-green-700" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-black text-neutral-900">4.9/5</p>
                    <p className="text-xs text-neutral-500 font-medium">Rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Phone Mockup with Floating Cards */}
            <div className="relative order-1 lg:order-2 flex justify-center items-center min-h-[400px] lg:min-h-[600px]">
              {/* Phone Mockup */}
              <div className="relative w-[280px] sm:w-[300px] h-[560px] sm:h-[600px] bg-neutral-900 rounded-[40px] p-3 shadow-2xl z-10">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-neutral-900 rounded-full z-20" />
                <div className="w-full h-full bg-neutral-800 rounded-[32px] overflow-hidden relative">
                  {/* Video Player UI */}
                  <img
                    src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80"
                    alt="Beekeeper inspecting frame"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Video Overlay UI */}
                  <div className="absolute inset-0 flex flex-col justify-between p-4">
                    <div>
                      <Badge className="bg-amber-600 text-[#1A1A1A] font-bold text-[10px]">
                        LESSON 3
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {/* Play button */}
                      <div className="flex justify-center">
                        <div className="h-16 w-16 rounded-full bg-gray-200 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-all">
                          <PlayCircle className="h-10 w-10 text-[#1A1A1A] fill-white/20" />
                        </div>
                      </div>

                      {/* Video info */}
                      <div className="bg-[#F4D03F]/10 backdrop-blur-md rounded-2xl p-4 space-y-2">
                        <p className="text-[#1A1A1A] font-bold text-sm">Module 3: Queen Rearing</p>
                        <div className="flex items-center justify-between text-[#1A1A1A] text-xs">
                          <span>14:20 / 45:00</span>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-[#1A1A1A] hover:text-[#F4D03F]">
                            <Download className="h-3 w-3 mr-1" />
                            Resources
                          </Button>
                        </div>
                        <Progress value={32} className="h-1 bg-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stat Card - Left Top */}
              <div className="absolute left-0 top-12 lg:-left-8 lg:top-20 bg-[#FFF9F0]/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-neutral-100 z-20 animate-in slide-in-from-left duration-700">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-[#F4D03F]" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-neutral-900">12,500+</p>
                    <p className="text-xs text-neutral-500 font-medium">Certified Students</p>
                  </div>
                </div>
              </div>

              {/* Floating Stat Card - Right Top */}
              <div className="absolute right-0 top-4 lg:-right-4 lg:top-8 bg-[#FFF9F0]/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-neutral-100 z-20 animate-in slide-in-from-right duration-700 delay-150">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Star className="h-6 w-6 text-[#F4D03F] fill-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-neutral-900">4.9/5</p>
                    <p className="text-xs text-neutral-500 font-medium">Instructor Rating</p>
                  </div>
                </div>
              </div>

              {/* Floating Info Card - Left Bottom */}
              <div className="absolute left-0 bottom-20 lg:-left-12 lg:bottom-32 bg-[#FFF9F0]/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-neutral-100 z-20 max-w-[200px] animate-in slide-in-from-left duration-700 delay-300">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-[#F4D03F]" />
                  <p className="text-sm font-bold text-neutral-900">50+ Digital Guides</p>
                </div>
                <p className="text-xs text-neutral-500 mb-3">Instant access to comprehensive field manuals</p>
                <Button size="sm" variant="outline" className="h-8 text-xs font-bold w-full border-amber-200 hover:bg-amber-50">
                  Preview Library
                </Button>
              </div>

              {/* Floating Product Card - Right Bottom */}
              <div className="absolute right-0 bottom-8 lg:-right-8 lg:bottom-16 bg-[#FFF9F0]/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-neutral-100 z-20 max-w-[220px] animate-in slide-in-from-right duration-700 delay-450">
                <Badge className="mb-2 bg-amber-600 text-[#1A1A1A] text-[10px]">Best Seller</Badge>
                <p className="font-bold text-neutral-900 text-sm mb-1">Commercial Apiary Management</p>
                <p className="text-xs text-neutral-500 mb-2">Video Course + PDF Bundle</p>
                <p className="text-xl font-black text-[#F4D03F]">KES 14,900</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Partners */}
      <section className="py-12 border-y border-neutral-100 bg-neutral-50/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-medium text-neutral-500 mb-8">
            Curriculum accredited by leading agricultural institutes
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {partners.map((partner, index) => (
              <span
                key={index}
                className="text-neutral-400 font-bold text-xs lg:text-sm tracking-widest uppercase hover:text-neutral-600 transition-colors cursor-default"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Experience & Expertise Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Image Collage */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-3xl overflow-hidden h-48 lg:h-64">
                    <img
                      src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80"
                      alt="Beekeeper with hives"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-3xl overflow-hidden h-32 lg:h-40">
                    <img
                      src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=400&q=80"
                      alt="Honeycomb close-up"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-3xl overflow-hidden h-32 lg:h-40">
                    <img
                      src="https://images.unsplash.com/photo-1471943038886-91c893c33c58?auto=format&fit=crop&w=400&q=80"
                      alt="Honey extraction"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-3xl overflow-hidden h-48 lg:h-64">
                    <img
                      src="https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=400&q=80"
                      alt="Learning environment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Experience Badge */}
              <div className="absolute bottom-4 left-4 lg:bottom-8 lg:left-8 bg-green-700 text-[#1A1A1A] rounded-2xl p-4 lg:p-6 shadow-xl">
                <p className="text-4xl lg:text-5xl font-black">254+</p>
                <p className="text-sm font-medium opacity-90">Years Combined Experience</p>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <Badge variant="outline" className="mb-4 border-green-300 text-[#1B9157] font-semibold">
                About BeeYield Learn
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 mb-6 leading-tight">
                Experience & Expertise in{" "}
                <span className="text-[#1B9157]">Beekeeping</span>
              </h2>
              <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
                Our curriculum is developed by practicing apiarists, agricultural scientists, and business experts with decades of hands-on experience. Every course is designed to give you practical skills you can apply immediately.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl">
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-[#1B9157]" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">Professional Beekeepers</p>
                    <p className="text-sm text-neutral-500">Learn from certified experts with real-world experience</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl">
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-[#1B9157]" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">Educational Advocates</p>
                    <p className="text-sm text-neutral-500">Committed to spreading sustainable beekeeping knowledge</p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl uppercase tracking-widest text-xs">
                Learn More About Our Team
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-[#FFF9F0] rounded-3xl p-8 lg:p-12 shadow-xl relative">
            <Quote className="absolute top-8 left-8 h-16 w-16 text-[#F4D03F]" />
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="lg:w-1/3 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-amber-200 shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                      alt="Student testimonial"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="lg:w-2/3 text-center lg:text-left">
                <p className="text-xl lg:text-2xl text-neutral-700 mb-6 leading-relaxed">
                  "As a beekeeping hobbyist, I rely on BeeYield's top-quality education to maintain my hives. Their beekeeping courses are comfortable and durable, allowing me to work with my bees with confidence."
                </p>
                <div>
                  <p className="font-bold text-neutral-900 text-lg">Sarah Johnson</p>
                  <p className="text-[#1B9157] font-medium">Commercial Beekeeper, Nakuru</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Workshops Section */}
      <section className="py-20 lg:py-28 bg-[#0A2612] text-[#1A1A1A]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-green-500 text-[#1B9157] font-semibold">
              Our Programs
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-black mb-6">
              Educational Workshops on{" "}
              <span className="text-[#1B9157]">Sustainable Beekeeping</span>
            </h2>
            <p className="text-[#1B9157]/60 text-lg max-w-2xl mx-auto">
              Join our comprehensive workshops designed for every level of expertise
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workshops.map((workshop, index) => (
              <Card key={index} className="bg-neutral-800 border-neutral-700 hover:bg-neutral-750 transition-all group cursor-pointer overflow-hidden">
                <CardContent className="p-6">
                  <div className={`h-14 w-14 rounded-2xl ${workshop.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <workshop.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-[#1A1A1A] font-bold text-xl mb-2">{workshop.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{workshop.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="h-14 px-8 bg-green-600 hover:bg-green-700 text-[#1A1A1A] font-bold rounded-xl" onClick={() => setIsQuoteModalOpen(true)}>
              Request a Quote for Your Company
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Course Catalog Section */}
      <section id="courses" className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-green-300 text-[#1B9157] font-semibold">
              Course Catalog
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 mb-6">
              All Courses & <span className="text-[#1B9157]">Field Guides</span>
            </h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              From beginner fundamentals to advanced commercial operations—find the perfect learning path for your beekeeping journey.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#F4D03F] opacity-50" />
              <p className="text-neutral-500 font-medium">Loading courses...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(products.length > 0 ? products : initialEducationProducts).map((product) => (
                <Card key={product.id} className="group border-none shadow-xl shadow-amber-900/5 bg-[#FFF9F0] rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-500 flex flex-col h-full">
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <Badge className="absolute top-4 left-4 bg-[#FFF9F0]/90 backdrop-blur-md text-neutral-900 border-none font-bold uppercase tracking-widest text-[10px] px-3 py-1.5 rounded-xl shadow-sm">
                      {product.badge}
                    </Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist({
                          id: product.id,
                          name: product.name,
                          description: product.description,
                          price: product.variants[0].price_kes,
                          image: product.images[0],
                          category: product.category,
                          badge: product.badge || '',
                          inStock: true
                        });
                      }}
                      aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      className={`absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-md shadow-lg transition-all duration-300 ${isInWishlist(product.id)
                        ? "bg-[#F4D03F] text-[#1A1A1A]"
                        : "bg-[#FFF9F0]/80 hover:bg-[#F4D03F] hover:text-[#1A1A1A] text-neutral-400 group-hover:opacity-100 opacity-0"
                        }`}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <CardContent className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-1 mb-3">
                      {renderStars(product.rating)}
                      <span className="text-[10px] font-bold text-neutral-400 ml-1">({product.review_count})</span>
                    </div>

                    <div className="flex-grow mb-6">
                      <h3 className="text-lg font-black text-neutral-900 mb-2 leading-tight group-hover:text-[#F4D03F] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-medium">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-6 border-t border-neutral-50 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-0.5">Price</p>
                        <p className="text-xl font-black text-[#F4D03F]">
                          {formatPrice(product.variants[0].price_kes)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="h-10 w-10 p-0 rounded-2xl bg-neutral-900 hover:bg-amber-600 text-[#1A1A1A] shadow-lg shadow-neutral-900/10 transition-all duration-300"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="h-14 px-8 border-2 font-bold rounded-xl">
              <Link to="/shop">
                View All Products in Shop
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-[#FFF9F0] shadow-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-[#F4D03F]" />
                </div>
                <p className="text-3xl lg:text-4xl font-black text-neutral-900 mb-2">{stat.value}</p>
                <p className="text-neutral-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-[#0A2612] rounded-3xl p-8 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1B9157]/ rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#1B9157]/ rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <Badge className="mb-6 bg-green-700 text-[#1A1A1A] font-bold">
                Join Our Community
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-black text-[#1A1A1A] mb-6">
                Trusted Source for{" "}
                <span className="text-[#1B9157]">Premium Learning</span>
              </h2>
              <p className="text-[#1B9157]/60 text-lg mb-10 max-w-2xl mx-auto">
                Get exclusive access to new courses, early bird discounts, and monthly beekeeping tips delivered straight to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="flex-1 h-14 px-6 rounded-xl bg-[#F4D03F]/10 border border-[#F4D03F]/40 text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                />
                <Button type="submit" size="lg" disabled={isSubmitting} className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl uppercase tracking-widest text-xs">
                  {isSubmitting ? "Joining..." : "Get All-Access Pass"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BeeLearn;
