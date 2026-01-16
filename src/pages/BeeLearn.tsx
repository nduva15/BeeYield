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

// Education products from Shop
const educationProducts: Product[] = [
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
    color: "bg-amber-100 text-amber-700"
  },
  {
    title: "Harvesting",
    description: "Master sustainable honey extraction techniques and timing",
    icon: Leaf,
    color: "bg-green-100 text-green-700"
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
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

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
    toast.success(`${product.name} added to cart!`);
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
              className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground font-medium ml-1">{rating} ({count})</span>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50/30 pt-8 pb-20 lg:pt-16 lg:pb-32">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-[40%] h-[80%] bg-gradient-to-bl from-amber-200/30 to-orange-300/20 rounded-bl-[100px] blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[50%] bg-gradient-to-tr from-amber-100/40 to-transparent rounded-tr-full blur-2xl -z-10" />

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <Badge
                variant="outline"
                className="mb-6 px-4 py-1.5 border-amber-300 bg-amber-50 text-amber-700 font-semibold"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                BeeYield Learn Platform
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-neutral-900 mb-6 leading-[1.1] tracking-tight">
                Master the Art of{" "}
                <span className="text-amber-600 italic">Sustainable Beekeeping</span>
              </h1>

              <p className="text-lg lg:text-xl text-neutral-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Access expert-led video curriculums, comprehensive PDF field manuals, and apiary certifications. From backyard hobbyists to commercial producers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Button
                  size="lg"
                  className="h-14 px-8 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl shadow-lg"
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
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Free Starter Guide
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-black text-neutral-900">12,500+</p>
                    <p className="text-xs text-neutral-500 font-medium">Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-600 fill-amber-600" />
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
                      <Badge className="bg-amber-600 text-white font-bold text-[10px]">
                        LESSON 3
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {/* Play button */}
                      <div className="flex justify-center">
                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
                          <PlayCircle className="h-10 w-10 text-white fill-white/20" />
                        </div>
                      </div>

                      {/* Video info */}
                      <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 space-y-2">
                        <p className="text-white font-bold text-sm">Module 3: Queen Rearing</p>
                        <div className="flex items-center justify-between text-white/80 text-xs">
                          <span>14:20 / 45:00</span>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-white hover:text-amber-300">
                            <Download className="h-3 w-3 mr-1" />
                            Resources
                          </Button>
                        </div>
                        <Progress value={32} className="h-1 bg-white/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stat Card - Left Top */}
              <div className="absolute left-0 top-12 lg:-left-8 lg:top-20 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-neutral-100 z-20 animate-in slide-in-from-left duration-700">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-neutral-900">12,500+</p>
                    <p className="text-xs text-neutral-500 font-medium">Certified Students</p>
                  </div>
                </div>
              </div>

              {/* Floating Stat Card - Right Top */}
              <div className="absolute right-0 top-4 lg:-right-4 lg:top-8 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-neutral-100 z-20 animate-in slide-in-from-right duration-700 delay-150">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Star className="h-6 w-6 text-amber-600 fill-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-neutral-900">4.9/5</p>
                    <p className="text-xs text-neutral-500 font-medium">Instructor Rating</p>
                  </div>
                </div>
              </div>

              {/* Floating Info Card - Left Bottom */}
              <div className="absolute left-0 bottom-20 lg:-left-12 lg:bottom-32 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-neutral-100 z-20 max-w-[200px] animate-in slide-in-from-left duration-700 delay-300">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-amber-600" />
                  <p className="text-sm font-bold text-neutral-900">50+ Digital Guides</p>
                </div>
                <p className="text-xs text-neutral-500 mb-3">Instant access to comprehensive field manuals</p>
                <Button size="sm" variant="outline" className="h-8 text-xs font-bold w-full border-amber-200 hover:bg-amber-50">
                  Preview Library
                </Button>
              </div>

              {/* Floating Product Card - Right Bottom */}
              <div className="absolute right-0 bottom-8 lg:-right-8 lg:bottom-16 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-neutral-100 z-20 max-w-[220px] animate-in slide-in-from-right duration-700 delay-450">
                <Badge className="mb-2 bg-amber-600 text-white text-[10px]">Best Seller</Badge>
                <p className="font-bold text-neutral-900 text-sm mb-1">Commercial Apiary Management</p>
                <p className="text-xs text-neutral-500 mb-2">Video Course + PDF Bundle</p>
                <p className="text-xl font-black text-amber-600">KES 14,900</p>
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
              <div className="absolute bottom-4 left-4 lg:bottom-8 lg:left-8 bg-amber-500 text-white rounded-2xl p-4 lg:p-6 shadow-xl">
                <p className="text-4xl lg:text-5xl font-black">254+</p>
                <p className="text-sm font-medium opacity-90">Years Combined Experience</p>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <Badge variant="outline" className="mb-4 border-amber-300 text-amber-700 font-semibold">
                About BeeYield Learn
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 mb-6 leading-tight">
                Experience & Expertise in{" "}
                <span className="text-amber-600">Beekeeping</span>
              </h2>
              <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
                Our curriculum is developed by practicing apiarists, agricultural scientists, and business experts with decades of hands-on experience. Every course is designed to give you practical skills you can apply immediately.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl">
                  <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">Professional Beekeepers</p>
                    <p className="text-sm text-neutral-500">Learn from certified experts with real-world experience</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl">
                  <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">Educational Advocates</p>
                    <p className="text-sm text-neutral-500">Committed to spreading sustainable beekeeping knowledge</p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="h-14 px-8 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl">
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
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 lg:p-12 shadow-xl relative">
            <Quote className="absolute top-8 left-8 h-16 w-16 text-amber-200" />
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
                <p className="text-xl lg:text-2xl text-neutral-700 mb-6 leading-relaxed italic">
                  "As a beekeeping hobbyist, I rely on BeeYield's top-quality education to maintain my hives. Their beekeeping courses are comfortable and durable, allowing me to work with my bees with confidence."
                </p>
                <div>
                  <p className="font-bold text-neutral-900 text-lg">Sarah Johnson</p>
                  <p className="text-amber-600 font-medium">Commercial Beekeeper, Nakuru</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Workshops Section */}
      <section className="py-20 lg:py-28 bg-neutral-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-amber-500 text-amber-400 font-semibold">
              Our Programs
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-black mb-6">
              Educational Workshops on{" "}
              <span className="text-amber-400">Sustainable Beekeeping</span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
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
                  <h3 className="text-white font-bold text-xl mb-2">{workshop.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{workshop.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="h-14 px-8 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl">
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
            <Badge variant="outline" className="mb-4 border-amber-300 text-amber-700 font-semibold">
              Course Catalog
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 mb-6">
              All Courses & <span className="text-amber-600">Field Guides</span>
            </h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              From beginner fundamentals to advanced commercial operations—find the perfect learning path for your beekeeping journey.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-amber-600 opacity-50" />
              <p className="text-neutral-500 font-medium">Loading courses...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {educationProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group overflow-hidden border border-neutral-100 bg-white hover:shadow-xl transition-all duration-500 rounded-2xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {product.badge && (
                      <Badge className="absolute top-3 left-3 bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wide">
                        {product.badge}
                      </Badge>
                    )}

                    <button
                      aria-label="Add to wishlist"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist({
                          id: product.id,
                          name: product.name,
                          description: product.description,
                          price: product.variants[0].price_kes,
                          image: product.images[0],
                          category: product.category,
                          badge: product.badge,
                          inStock: product.variants.some(v => v.stock_quantity > 0 && v.is_available)
                        });
                      }}
                      className={`absolute top-3 right-3 p-2 backdrop-blur-md rounded-full translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ${isInWishlist(product.id) ? "bg-amber-500 text-white opacity-100 translate-y-0" : "bg-white/80 hover:bg-amber-500 hover:text-white"
                        }`}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <CardContent className="p-5">
                    {renderStars(product.rating, product.review_count)}

                    <h3 className="text-lg font-bold text-neutral-900 mt-2 mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">Price</p>
                        <p className="text-xl font-black text-amber-600">
                          {formatPrice(product.variants[0].price_kes)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="h-10 px-4 rounded-xl gap-1.5 font-bold bg-neutral-900 hover:bg-neutral-800 shadow-lg"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span className="hidden sm:inline">Add</span>
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
                <div className="h-16 w-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-amber-600" />
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
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-8 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <Badge className="mb-6 bg-amber-600 text-white font-bold">
                Join Our Community
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">
                Trusted Source for{" "}
                <span className="text-amber-400">Premium Learning</span>
              </h2>
              <p className="text-neutral-400 text-lg mb-10 max-w-2xl mx-auto">
                Get exclusive access to new courses, early bird discounts, and monthly beekeeping tips delivered straight to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-14 px-6 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Button size="lg" className="h-14 px-8 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl">
                  Get All-Access Pass
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BeeLearn;
