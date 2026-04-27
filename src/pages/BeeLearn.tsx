import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
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
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { getCatalogByCategory } from "@/data/catalog";
import { getLearnMaterialByName } from "@/data/learnMaterials";
import SEO from "@/components/SEO";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import LOGO from "@/assets/Logo.png";

// Education products from Shop
const initialEducationProducts: Product[] = getCatalogByCategory("education") as Product[];

const BeeLearn = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { addToCart, openCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
    const [guideEmail, setGuideEmail] = useState("");
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

    const handleGuideSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await submitNewsletterSubscription({ email: guideEmail, source: 'starter_guide_download' });
            toast.success("Guide sent to your email!");
            setIsGuideModalOpen(false);
            setGuideEmail("");
        } catch (error) {
            toast.error("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddToCart = async (product: Product) => {
        const variant = product.variants[0];
        const cartItem = {
            productId: product.id,
            variantId: variant.id,
            name: product.name,
            description: product.description,
            size: variant.size,
            price: variant.price_kes,
            quantity: 1,
            category: product.category as any,
            badge: product.badge,
            image: product.images[0],
        };
        addToCart(cartItem);
        openCart();
        toast.success(`${product.name} added to cart!`);
    };

    return (
        <BeeYieldPageShell className="bg-background">
            <SEO 
                title="BeeLearn | Educational Resources | BeeYield"
                description="Master sustainable beekeeping with expert-led courses and digital field manuals."
                url="/beelearn"
            />

            {/* ═══════════════════════════════════════════════════════════════
                HERO SECTION — Sync with Diseases Hero
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-neutral-100">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-beeyield-green/5 to-transparent pointer-events-none" />
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto flex flex-col items-center">
                        <motion.img
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            src={LOGO}
                            alt="BeeYield Logo"
                            className="h-24 md:h-36 w-auto mb-12 drop-shadow-2xl"
                        />
                        <Badge className="mb-6 bg-beeyield-green/10 text-beeyield-green border-beeyield-green/20 px-5 py-2 font-semibold text-[10px] rounded-full backdrop-blur-sm">
                            BeeLearn Platform
                        </Badge>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900 leading-tight"
                        >
                            Master the Art of <br /> <span className="text-beeyield-green">Sustainable Beekeeping</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl font-medium"
                        >
                            Access expert-led video lessons, field manuals, and apiary certifications. For every level of beekeeper.
                        </motion.p>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-4"
                        >
                            <Button size="lg" className="h-14 px-10 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20" onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}>
                                Browse Course Catalog
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-10 border-neutral-200 text-neutral-900 font-bold text-xs rounded-2xl hover:bg-neutral-50 transition-all shadow-sm" onClick={() => setIsGuideModalOpen(true)}>
                                <Download className="mr-2 h-4 w-4" /> Download Starter Guide
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Breakdown — Sync with Diseases grid */}
            <section className="py-24 bg-white border-b border-neutral-100">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {[
                            { label: "Students", value: "12,500+", icon: Users },
                            { label: "Rating", value: "4.9/5", icon: Star },
                            { label: "Guides", value: "50+", icon: FileText },
                            { label: "Access", value: "24/7", icon: Monitor }
                        ].map((stat, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-neutral-50 p-8 rounded-[2.5rem] border border-neutral-100 text-center group hover:bg-white transition-all shadow-sm"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mx-auto mb-4 text-beeyield-green shadow-sm">
                                    <stat.icon size={20} />
                                </div>
                                <p className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</p>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Course Catalog — Match Diseases Grid */}
            <section id="courses" className="py-24 bg-neutral-50/50 border-b border-neutral-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <Badge className="bg-beeyield-green/10 text-beeyield-green px-4 py-1.5 font-bold mb-4 rounded-full">Curriculum</Badge>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900">Featured Courses</h2>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-beeyield-green" /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                            {products.map((product) => {
                                const material = getLearnMaterialByName(product.name);
                                return (
                                    <motion.div 
                                        key={product.id}
                                        whileHover={{ y: -8 }}
                                        className="bg-white rounded-[2.5rem] overflow-hidden border border-neutral-200/60 shadow-sm flex flex-col group"
                                    >
                                        <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            {product.badge && <Badge className="absolute top-4 left-4 bg-white/90 text-neutral-900 border-none font-bold text-[9px] px-3 py-1.5 rounded-xl">{product.badge}</Badge>}
                                            <button onClick={() => toggleWishlist({ id: product.id, name: product.name, price: product.variants[0].price_kes, image: product.images[0] } as any)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Heart size={16} className={isInWishlist(product.id) ? "fill-beeyield-green text-beeyield-green" : "text-neutral-400"} />
                                            </button>
                                        </div>
                                        <CardContent className="p-6 flex flex-col flex-grow">
                                            <h3 className="font-bold text-neutral-900 mb-2 leading-tight tracking-tight group-hover:text-beeyield-green transition-colors">{product.name}</h3>
                                            <p className="text-[11px] text-neutral-500 font-medium mb-6 line-clamp-2 leading-relaxed">{product.description}</p>
                                            
                                            <div className="mt-auto pt-6 border-t border-neutral-50 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Price</p>
                                                    <p className="text-xl font-bold text-neutral-900">KES {product.variants[0].price_kes.toLocaleString()}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {material && (
                                                        <Button size="icon" variant="outline" className="h-10 w-10 rounded-xl" asChild>
                                                            <a href={`/learn-pdfs/${material.fileName}`} target="_blank" rel="noreferrer"><Download size={18} /></a>
                                                        </Button>
                                                    )}
                                                    <Button size="icon" className="h-10 w-10 rounded-xl bg-neutral-900 text-beeyield-green" onClick={() => handleAddToCart(product)}>
                                                        <ShoppingCart size={18} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA — Match Diseases CTA style */}
            <section className="bg-neutral-900 py-32 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-beeyield-green/[0.05] to-transparent pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 tracking-tight leading-tight">Ready to Start <br /> Your <span className="text-beeyield-green">Beekeeping Journey?</span></h2>
                    <Button size="lg" className="h-14 px-12 bg-white text-neutral-900 font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-xl shadow-white/10" onClick={() => setIsGuideModalOpen(true)}>
                        Download Free Starter Guide
                    </Button>
                </div>
            </section>

            {/* GUIDE MODAL — Stylistic Match */}
            {isGuideModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative">
                        <button onClick={() => setIsGuideModalOpen(false)} className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-600 transition-colors">
                            <ArrowRight className="rotate-45" size={24} />
                        </button>
                        <div className="text-center mb-8">
                             <div className="w-14 h-14 bg-beeyield-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-beeyield-green">
                                <Download size={28} />
                             </div>
                             <h3 className="text-2xl font-bold text-neutral-900">Get Your Free Guide</h3>
                             <p className="text-neutral-500 text-sm mt-3 font-medium">Enter your email to receive our "Beekeeping Starter Guide" instantly.</p>
                        </div>
                        <form onSubmit={handleGuideSubmit} className="space-y-4">
                            <input 
                                type="email" 
                                placeholder="Expert beekeeper@example.com" 
                                required 
                                className="w-full h-14 px-5 rounded-2xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-beeyield-green/20 transition-all outline-none text-sm font-medium"
                                value={guideEmail}
                                onChange={e => setGuideEmail(e.target.value)}
                            />
                            <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-neutral-900 text-beeyield-green font-bold rounded-2xl shadow-xl shadow-neutral-900/10">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : "Send Me The Guide"}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </BeeYieldPageShell>
    );
};

export default BeeLearn;
