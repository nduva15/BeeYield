import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  ArrowRight,
  Sprout,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  Quote,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import LOGO from "@/assets/Logo.png";

const Media = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace("#", "");
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        }
    }, [location]);

    const caseStudies = [
        {
            id: "maize",
            title: "Maize Pollination",
            category: "Cereal Crop",
            stories: [
                {
                    farmer: "James Mwangi",
                    location: "Kibwezi",
                    role: "Commercial Farmer",
                    acres: 40,
                    description: "Increased yield per acre by 18% with precision pollination services.",
                    quote: "The difference in cob fullness was undeniable.",
                    stats: [
                        { label: "Yield Increase", value: "+18%" },
                        { label: "Acres", value: "40" }
                    ],
                    image: "https://images.unsplash.com/photo-1634467524884-897d0af5e104?auto=format&fit=crop&q=80&w=1200",
                }
            ],
        },
        {
            id: "sunflower",
            title: "Sunflower Oil",
            category: "Oilseed",
            stories: [
                {
                    farmer: "Sarah Kimathi",
                    location: "Makindu",
                    role: "Oil Producer",
                    acres: 30,
                    description: "Full heads across the entire field with managed hives.",
                    quote: "Oil extraction rates hit record levels.",
                    stats: [
                        { label: "Oil Content", value: "+25%" },
                        { label: "Seed Set", value: "95%" }
                    ],
                    image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=1200",
                }
            ],
        }
    ];

    return (
        <BeeYieldPageShell className="bg-background" p-0>
            <SEO 
                title="Success Stories & Media | BeeYield"
                description="Explore real-world case studies and pollination success stories from across East Africa."
                url="/media"
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
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={LOGO}
                            alt="BeeYield Logo"
                            className="h-24 md:h-32 w-auto mb-10 drop-shadow-2xl"
                        />
                        <Badge className="mb-6 bg-beeyield-green/10 text-beeyield-green border-beeyield-green/20 px-5 py-2 font-semibold text-[10px] rounded-full backdrop-blur-sm">
                            Case Studies & Impact
                        </Badge>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900 leading-tight"
                        >
                            Pollination <br /> <span className="text-beeyield-green">Success Stories</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl font-medium"
                        >
                            Explore real-world evidence of how BeeYield's precision pollination drives agricultural outcomes.
                        </motion.p>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-4"
                        >
                            <Button size="lg" className="h-14 px-10 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20" onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })}>
                                Read Success Stories
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stories Section — Clean Card Layout matching Diseases */}
            <section id="stories" className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="space-y-32 max-w-6xl mx-auto">
                        {caseStudies.map((category, idx) => (
                            <div key={category.id} id={category.id} className="scroll-mt-32">
                                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                                    <div className="space-y-2">
                                        <Badge className="bg-beeyield-green/10 text-beeyield-green border-none px-4 py-1.5 font-bold text-[10px] rounded-full">{category.category}</Badge>
                                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900">{category.title}</h2>
                                    </div>
                                    <Button variant="ghost" className="text-beeyield-green font-bold text-xs hover:bg-beeyield-green/5 rounded-xl border border-beeyield-green/10" asChild>
                                        <Link to="/crops-we-pollinate">Explore {category.id} pollination <ArrowRight size={14} className="ml-2" /></Link>
                                    </Button>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-12">
                                    {category.stories.map((story, sIdx) => (
                                        <motion.div 
                                            key={sIdx}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            className="group bg-neutral-50 rounded-[3rem] overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500"
                                        >
                                            <div className="aspect-video relative overflow-hidden">
                                                <img src={story.image} alt={story.farmer} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <div className="absolute bottom-8 left-8 flex items-center gap-4">
                                                     <div className="w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden shadow-lg">
                                                        <User className="w-full h-full p-2 bg-white/20 text-white" />
                                                     </div>
                                                     <div className="text-white">
                                                        <p className="font-bold text-lg leading-none">{story.farmer}</p>
                                                        <p className="text-xs text-white/70 font-medium mt-1">{story.role} — {story.location}</p>
                                                     </div>
                                                </div>
                                            </div>
                                            <CardContent className="p-10">
                                                <Quote size={40} className="text-beeyield-green/10 mb-6" />
                                                <p className="text-lg text-neutral-700 italic font-medium leading-relaxed mb-10">"{story.quote}"</p>
                                                
                                                <div className="grid grid-cols-2 gap-6 pt-10 border-t border-neutral-200">
                                                    {story.stats.map((stat, i) => (
                                                        <div key={i}>
                                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                                            <p className="text-3xl font-bold text-neutral-900 tracking-tight">{stat.value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA — Match Diseases CTA style */}
            <section className="bg-neutral-900 py-32 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-beeyield-green/[0.05] to-transparent pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 tracking-tight leading-tight">
                            Be Our Next <br /><span className="text-beeyield-green">Success Story</span>
                        </h2>
                        <div className="flex flex-wrap justify-center gap-6">
                            <Button size="lg" className="h-14 px-12 bg-white text-neutral-900 font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-xl shadow-white/10" asChild>
                                <Link to="/contact">Discuss Your Project</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </BeeYieldPageShell>
    );
};

export default Media;
