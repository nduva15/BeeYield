import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Star,
  FileText,
  Monitor,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Download,
  ShieldCheck,
  Activity,
  Bug,
  Leaf,
  Briefcase,
  PlayCircle,
  Loader2,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { type Product } from "@/services/shopService";
import SEO from "@/components/SEO";
import MailtrixHero from "@/components/MailtrixHero";
import { initialEducationProducts } from "@/data/education-products";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { getProducts } = await import("@/services/shopService");
        const eduData = await getProducts("education");
        let finalData = eduData;
        if (!finalData || finalData.length === 0) {
          finalData = await getProducts("learn");
        }

        if (finalData && finalData.length > 0) {
          setProducts(finalData);
        } else {
          setProducts(initialEducationProducts);
        }
      } catch (error) {
        console.error("Failed to fetch education products:", error);
        setProducts(initialEducationProducts);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      variantId: product.variants[0].id,
      name: product.name,
      description: product.description,
      size: product.variants[0].size,
      price: product.variants[0].price_kes,
      quantity: 1,
      category: "education",
      image: product.images[0] || "/placeholder.svg"
    });
    toast.success(`Enrolled in ${product.name}`);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock simulation
    setTimeout(() => {
      toast.success("Welcome to the community!");
      setNewsletterEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-white">
      <SEO
        title="Beekeeping Education & Certifications"
        description="Master sustainable beekeeping with expert-led courses, digital field guides, and professional certifications from BeeYield Learn."
      />

      <MailtrixHero
        badge="BeeYield Learn Platform"
        title={["Master", "Sustainable", "Beekeeping"]}
        description="Access expert-led video curriculums, comprehensive PDF field manuals, and apiary certifications. From backyard hobbyists to commercial producers."
        ctaText="Browse Course Catalog"
        ctaLink="#courses"
        secondaryCtaText="Starter Guide"
        onSecondaryClick={() => setIsGuideModalOpen(true)}
        variant="learn"
        centralImage="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80"
        stats={[
          { label: "Students", value: "12,500+" },
          { label: "Rating", value: "4.9/5" }
        ]}
        floatingBadges={[
          { icon: BookOpen, text: "Video Courses" },
          { icon: FileText, text: "Field Manuals" },
          { icon: Award, text: "Certifications" },
          { icon: Users, text: "Expert Instructors" },
          { icon: Download, text: "Digital Guides" },
          { icon: GraduationCap, text: "Apiary Access" },
        ]}
      />

      {/* Visual Impact - Professional Training */}
      <section className="relative h-[70vh] flex items-center overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1473976321200-a226786c1c87?auto=format&fit=crop&w=2000&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          initial={{ scale: 1.2 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="absolute inset-0 bg-neutral-900/60 z-10" />
        <div className="container mx-auto px-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl text-white"
          >
            <Badge className="bg-amber-600 text-white mb-8">Professional Grade</Badge>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
              Expertise Meets <br />
              <span className="text-amber-500">Innovation.</span>
            </h2>
            <p className="text-xl text-white/80 font-medium leading-relaxed mb-10 max-w-xl">
              Our curriculum is designed by agro-biologists and commercial apiary managers. Go beyond the basics with data-driven yield optimization strategies.
            </p>
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <BookOpen className="w-6 h-6 text-amber-500" />
                </div>
                <span className="font-bold uppercase tracking-widest text-xs">50+ Handbooks</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <PlayCircle className="w-6 h-6 text-amber-500" />
                </div>
                <span className="font-bold uppercase tracking-widest text-xs">200+ Video Lessons</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof - Partners */}
      <section className="py-12 border-y border-neutral-100 bg-white">
        <div className="container mx-auto px-4">
          <p className="text-center text-[10px] font-black tracking-[0.4em] uppercase text-neutral-400 mb-8">Certified by leading agro-institutes</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all">
            {partners.map((partner, i) => (
              <span key={i} className="text-lg font-black tracking-tighter text-neutral-900">{partner}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Feature Grid */}
      <section className="py-24 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workshops.map((workshop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 border border-neutral-100"
              >
                <div className={`w-14 h-14 rounded-2xl ${workshop.color} flex items-center justify-center mb-6 shadow-sm`}>
                  <workshop.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight mb-4">{workshop.title}</h3>
                <p className="text-neutral-500 text-sm font-medium leading-relaxed mb-6">{workshop.description}</p>
                <Button variant="ghost" className="p-0 text-amber-600 font-bold hover:bg-transparent hover:text-amber-700">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Catalog (Products) */}
      <section id="courses" className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-16">
            <Badge className="bg-amber-100 text-amber-700 border-none px-4 py-1 mb-6">Course Catalog</Badge>
            <h2 className="text-4xl md:text-6xl font-black text-neutral-900 uppercase tracking-tighter leading-none">
              Transform your <br />
              <span className="text-amber-600">Beekeeping Journey.</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="group h-full bg-white border border-neutral-100 rounded-[2.5rem] overflow-hidden hover:shadow-glow transition-all duration-500">
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {product.badge && (
                        <Badge className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-neutral-900 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full border-none shadow-sm">
                          {product.badge}
                        </Badge>
                      )}
                      <button
                        onClick={() => toggleWishlist({
                          id: product.id,
                          name: product.name,
                          description: product.description,
                          price: product.variants[0].price_kes,
                          image: product.images[0],
                          category: product.category,
                          badge: product.badge || '',
                          inStock: true
                        })}
                        className={`absolute top-6 right-6 p-2 rounded-full backdrop-blur-md transition-all ${isInWishlist(product.id) ? "bg-red-50 text-red-500" : "bg-black/20 text-white hover:bg-white hover:text-red-500"
                          }`}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <CardContent className="p-8">
                      <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight mb-3 line-clamp-1 group-hover:text-amber-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-neutral-500 font-medium line-clamp-2 mb-6 leading-relaxed">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-dashed border-neutral-200">
                        <span className="text-xl font-black text-amber-600">KES {product.variants[0].price_kes.toLocaleString()}</span>
                        <Button
                          size="sm"
                          className="rounded-xl bg-neutral-900 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-6"
                          onClick={() => handleAddToCart(product)}
                        >
                          Enroll
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-24 bg-neutral-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-amber-500 rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <stat.icon className="h-8 w-8 text-amber-500" />
                </div>
                <p className="text-4xl lg:text-6xl font-black text-white mb-2 tracking-tighter">{stat.value}</p>
                <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High Conversion Newsletter CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-[#0A2612] rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <Badge className="mb-8 bg-green-700/50 text-green-400 border-green-700 px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest">
                All-Access Membership
              </Badge>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter leading-none">
                Unlock the <br />
                <span className="text-green-500">Expert Vault.</span>
              </h2>
              <p className="text-green-100/60 text-xl font-medium mb-12 leading-relaxed">
                Join 12,500+ professionals. Get exclusive access to monthly live masterclasses, early bird discounts, and the complete Digital Field Manual library.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto p-2 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="flex-1 h-14 px-8 rounded-[1.5rem] bg-transparent text-white placeholder:text-neutral-500 focus:outline-none"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="h-14 px-10 bg-green-600 hover:bg-green-500 text-white font-black rounded-[1.5rem] uppercase tracking-widest text-xs shadow-xl"
                >
                  {isSubmitting ? "Subscribing..." : "Get Pass"}
                </Button>
              </form>
              <p className="mt-8 text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">No spam • Cancel anytime • 100% Free Resources</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BeeLearn;
