
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getBlogPosts, getBlogCategories, BlogPost } from "@/services/cmsService";
import { Link } from "react-router-dom";

const Blogs = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<{ name: string, slug: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial Fetch
    const initData = async () => {
      try {
        const [fetchedPosts, fetchedCategories] = await Promise.all([
          getBlogPosts(),
          getBlogCategories()
        ]);
        setPosts(fetchedPosts);

        // Add "All" to categories if not present
        const allCats = [{ name: "All", slug: "all" }, ...fetchedCategories];
        setCategories(allCats);
      } catch (err) {
        console.error("Failed to load blog data:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleCategoryClick = async (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setLoading(true);
    try {
      const fetchedPosts = await getBlogPosts(categorySlug === "all" ? undefined : categorySlug);
      setPosts(fetchedPosts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center relative rounded-2xl overflow-hidden shadow-xl group">
            {/* Background Image */}
            <img
              src="https://images.unsplash.com/photo-1471943311424-646960669fbc?w=1600&auto=format&fit=crop&q=80"
              alt="Our Blog"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-black/50" />
            {/* Content */}
            <div className="relative z-10 py-16 md:py-24">
              <h1 className="mb-4 text-5xl font-bold text-white tracking-tight">The Buzz</h1>
              <p className="text-xl text-white/90 font-medium">
                Stories, insights, and education about honey, bees, and sustainability
              </p>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.slug}
                variant={selectedCategory === cat.slug ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryClick(cat.slug)}
                className="capitalize"
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden transition-all hover:shadow-glow border-none shadow-soft flex flex-col h-full">
                    <div className="aspect-video overflow-hidden bg-muted relative">
                      <img
                        src={post.featured_image || "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80"}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80"; // Fallback
                        }}
                      />
                      <Badge className="absolute top-4 right-4 bg-background/80 text-foreground backdrop-blur-sm hover:bg-background/90">
                        {post.category}
                      </Badge>
                    </div>
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <h3 className="mb-3 text-xl font-bold line-clamp-2 leading-tight hover:text-primary transition-colors">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                      <div className="mt-auto pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(post.published_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{post.read_time_minutes} min read</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button asChild variant="ghost" className="p-0 hover:bg-transparent hover:text-primary group">
                          <Link to={`/blog/${post.slug}`}>
                            Read Article <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-muted/20 rounded-xl">
                  <p className="text-muted-foreground">No posts found in this category.</p>
                </div>
              )}
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="mt-12 text-center">
              <Button size="lg" variant="outline">
                Load More Articles
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blogs;
