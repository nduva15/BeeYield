import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useEffect } from "react";

const Blogs = () => {
  useEffect(() => {
    // Inject GTM script into head
    const script = document.createElement('script');
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-KF284247');`;
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  const posts = [
    {
      id: 1,
      title: "The Importance of Bees in Our Ecosystem",
      excerpt: "Discover why bees are crucial for biodiversity and food production, and what we can do to protect them.",
      category: "Conservation",
      date: "March 15, 2024",
      readTime: "5 min read",
      image: "/placeholder.svg",
    },
    {
      id: 2,
      title: "How to Identify Pure, Raw Honey",
      excerpt: "Learn the key characteristics that distinguish authentic raw honey from processed alternatives.",
      category: "Honey",
      date: "March 10, 2024",
      readTime: "4 min read",
      image: "/placeholder.svg",
    },
    {
      id: 3,
      title: "Sustainable Beekeeping Practices",
      excerpt: "Explore the methods we use to ensure healthy bee colonies and sustainable honey production.",
      category: "Sustainability",
      date: "March 5, 2024",
      readTime: "6 min read",
      image: "/placeholder.svg",
    },
    {
      id: 4,
      title: "The Journey from Hive to Home",
      excerpt: "Follow our transparent process from ethical harvesting to your kitchen table.",
      category: "Hive Management",
      date: "February 28, 2024",
      readTime: "5 min read",
      image: "/placeholder.svg",
    },
    {
      id: 5,
      title: "Understanding Pollination Services",
      excerpt: "How precision pollination technology is transforming agricultural productivity across Africa and the world.",
      category: "Pollination",
      date: "February 20, 2024",
      readTime: "7 min read",
      image: "/placeholder.svg",
    },
    {
      id: 6,
      title: "Supporting Local Beekeepers",
      excerpt: "How choosing ethical honey makes a difference for small-scale beekeeping communities.",
      category: "Community Development",
      date: "February 15, 2024",
      readTime: "4 min read",
      image: "/placeholder.svg",
    },
  ];

  const categories = ["All", "Pollination", "IoT", "Diseases", "Conservation", "Community Development", "Honey", "Sustainability", "Hive Management"];

  return (
    <div className="min-h-screen py-20">
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-KF284247"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        ></iframe>
      </noscript>
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center relative rounded-2xl overflow-hidden shadow-xl">
          {/* Background Image */}
          <img 
            src="/placeholder.svg" 
            alt="Our Blog" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Content */}
          <div className="relative z-10 py-16 md:py-24">
            <h1 className="mb-4 text-5xl font-bold text-white">Our Blog</h1>
            <p className="text-xl text-white/90">
              Stories, insights, and education about honey, bees, and sustainability
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden transition-all hover:shadow-glow">
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={post.image}
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
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <Button variant="ghost" className="group -ml-3 p-0">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">
            Load More Articles
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
