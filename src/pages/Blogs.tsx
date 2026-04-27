import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getBlogPosts, BlogPost } from "@/services/cmsService";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import LOGO from "@/assets/Logo.png";

const Blogs = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Conservation", "Education", "Sustainability", "Process", "Health", "Community"];

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const data = await getBlogPosts(selectedCategory);
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [selectedCategory]);

    return (
        <BeeYieldPageShell className="bg-background">
            <SEO 
                title="Blog | BeeYield"
                description="Insights and updates from the frontline of bee conservation and precision pollination."
                url="/blogs"
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
                            The BeeYield Journal
                        </Badge>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900 leading-tight"
                        >
                            Insights from <br /> <span className="text-beeyield-green">The Frontline</span>
                        </motion.h1>
                        <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl font-medium">
                            Explore deep dives into apiary technology, restoration projects, and sustainable agriculture.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filtering & Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    {/* Category Filter — Sync with Contact Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-16">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-5 py-2.5 rounded-xl border transition-all duration-300 font-bold text-[10px] uppercase tracking-widest ${selectedCategory === category
                                    ? "border-beeyield-green bg-beeyield-green/5 text-beeyield-green shadow-sm"
                                    : "border-neutral-100 bg-neutral-50 text-neutral-400 hover:bg-white hover:border-neutral-200"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-beeyield-green" />
                        </div>
                    ) : (
                        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                            {posts.map((post, i) => (
                                <motion.div 
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500"
                                >
                                    <div className="aspect-[16/10] overflow-hidden relative">
                                        <img
                                            src={post.featured_image || "/placeholder.svg"}
                                            alt={post.title}
                                            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                        <div className="absolute top-6 left-6">
                                            <Badge className="bg-white/90 backdrop-blur-md text-neutral-900 border-none font-bold text-[9px] px-3 py-1.5 rounded-xl">{post.category}</Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-8 flex flex-col flex-grow">
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
                                            <div className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.published_at).toLocaleDateString()}</div>
                                            <div className="flex items-center gap-1"><Clock size={12} /> {post.read_time_minutes || 5} min read</div>
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight leading-snug group-hover:text-beeyield-green transition-colors">{post.title}</h3>
                                        <p className="text-sm text-neutral-500 font-medium leading-relaxed line-clamp-3 mb-8">{post.excerpt}</p>
                                        
                                        <div className="mt-auto">
                                            <Button variant="ghost" className="text-beeyield-green font-bold text-xs p-0 hover:bg-transparent group/btn" asChild>
                                                <Link to={`/blogs/${post.slug}`}>
                                                    Read Article <ArrowRight size={14} className="ml-2 transition-transform group-hover/btn:translate-x-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </BeeYieldPageShell>
    );
};

export default Blogs;
