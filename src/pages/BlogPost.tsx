
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBlogPost, BlogPost as BlogPostType } from "@/services/cmsService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, ArrowLeft, Calendar, User, Clock, Share2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

const BlogPost = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPostType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const data = await getBlogPost(slug);
                if (!data) {
                    navigate("/blogs"); // Or /404
                    return;
                }
                setPost(data);
            } catch (error) {
                console.error("Failed to load blog post", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug, navigate]);

    if (loading) {
        return (
            <BeeYieldPageShell className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </BeeYieldPageShell>
        );
    }

    if (!post) return null;

    return (
        <BeeYieldPageShell className="min-h-screen pt-24 pb-20 p-0">
            <article>
            {/* Hero Header */}
            <div className="relative h-[60vh] min-h-[400px] w-full mb-12">
                <div className="absolute inset-0">
                    <img
                        src={post.featured_image || "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1600"}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-12 text-[#1A1A1A]">
                    <Button
                        variant="ghost"
                        className="text-[#1A1A1A] hover:text-[#1A1A1A] hover:bg-[#F4D03F]/10 w-fit mb-6 pl-0"
                        onClick={() => navigate("/blogs")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
                    </Button>

                    <div className="space-y-4 max-w-4xl">
                        <Badge className="bg-primary hover:bg-primary/90 text-[#1A1A1A] border-none text-sm py-1 px-4">
                            {post.category}
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-[#1A1A1A] pt-4">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{post.author_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(post.published_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{post.read_time_minutes} min read</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div className="prose prose-lg prose-slate max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary 
              prose-img:rounded-xl prose-img:shadow-lg">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {post.content || post.excerpt}
                            </ReactMarkdown>
                        </div>

                        {/* High-Fidelity Modern CTA Section */}
                        <div className="mt-16 bg-gradient-to-br from-beeyield-green to-[#145A32] text-white rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-2xl border border-beeyield-green/20">
                            {/* Ambient Glows */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-beeyield-gold/15 rounded-full blur-[90px] -mr-32 -mt-32 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-[90px] -ml-32 -mb-32 pointer-events-none" />
                            
                            <div className="relative z-10 space-y-6">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl text-beeyield-gold text-xs font-black uppercase tracking-widest border border-white/5 shadow-inner">
                                    <span className="w-2.5 h-2.5 rounded-full bg-beeyield-gold animate-ping" />
                                    Empowering Sustainable Agriculture
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black tracking-tighter leading-none text-white">
                                    Ready to Optimize Your <span className="text-beeyield-gold">Pollination Strategy?</span>
                                </h3>
                                <p className="text-white/80 max-w-2xl text-base md:text-lg leading-relaxed font-medium">
                                    Pollination is too critical to leave to chance. Discover how BeeYield's precision IoT monitoring helps growers protect hives, maximize crop potential, and build highly resilient operations across Kenya.
                                </p>
                                
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <Link to="/contact">
                                        <Button className="bg-beeyield-gold hover:bg-beeyield-gold/90 text-neutral-900 font-extrabold px-8 py-6 rounded-2xl shadow-xl shadow-beeyield-gold/20 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 text-base">
                                            Contact Our Team
                                        </Button>
                                    </Link>
                                    <Link to="/pollination-request">
                                        <Button variant="outline" className="border-white/25 hover:bg-white/15 text-white font-black px-8 py-6 rounded-2xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 text-base bg-white/5 backdrop-blur-md">
                                            Request Pollination
                                        </Button>
                                    </Link>
                                    <Link to="/careers">
                                        <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/5 font-extrabold px-6 py-6 rounded-2xl transition-all duration-300 text-base">
                                            Join Our Team →
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-12 pt-8 border-t">
                                <h4 className="flex items-center gap-2 text-lg font-semibold mb-4 text-muted-foreground">
                                    <Tag className="h-4 w-4" /> Related Topics
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-sm py-1 px-3">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Author Check */}
                        <div className="bg-muted/30 rounded-2xl p-6 border shadow-sm">
                            <h3 className="font-bold text-lg mb-4">About the Author</h3>
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                                    {post.author_name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-lg">{post.author_name}</div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {(post as any).author_role || "Member of the BeeYield team, passionate about sustainable agriculture and technology."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Share */}
                        <div className="bg-muted/30 rounded-2xl p-6 border shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Share this article</h3>
                            <div className="flex gap-2">
                                <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                }}>
                                    <Share2 className="h-4 w-4" /> Copy Link
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </article>
        </BeeYieldPageShell>
    );
};

export default BlogPost;
