import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogPosts, BlogPost } from "@/services/cmsService";

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
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">Our Blog</h1>
          <p className="text-xl text-muted-foreground">
            Stories, insights, and education about honey, bees, and sustainability
          </p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === selectedCategory ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden transition-all hover:shadow-glow">
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={post.featured_image || "/placeholder.svg"}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-6">
                  <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20">
                    {post.category}
                  </Badge>
                  <h3 className="mb-3 text-xl font-semibold line-clamp-2">{post.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{post.date || new Date(post.published_at).toLocaleDateString()}</span>
                    </div>
                    {/* fallback for readTime if it's string "5 min read" vs number 5 */}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.read_time_minutes ? `${post.read_time_minutes} min read` : '5 min read'}</span>
                    </div>
                  </div>
                  <Link to={`/blogs/${post.slug}`}>
                    <Button variant="ghost" className="group -ml-3 p-0">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
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
  );
};

export default Blogs;
