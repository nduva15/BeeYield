
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBlogPost, BlogPost as BlogPostType } from "@/services/cmsService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, ArrowLeft, Calendar, User, Clock, Share2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!post) return null;

    return (
        <article className="min-h-screen pt-24 pb-20">
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
                                        Member of the BeeYield team, passionate about sustainable agriculture and technology.
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
    );
};

export default BlogPost;
