import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  ArrowLeft,
  Search,
  Tag,
  Share2,
  Sparkles,
  Leaf,
  Activity,
  CheckCircle2,
  Cpu,
  ChevronRight,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import beeyieldLogo from "@/assets/beeyield-logo.png";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { BLOG_POSTS, type BlogPost } from "@/data/blogPosts";

export default function BlogsPage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  // Read initial slug from URL hash or query param if present, and listen to popstate/hashchange
  useEffect(() => {
    const syncSlugFromUrl = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.replace("#", "");
      const params = new URLSearchParams(window.location.search);
      const querySlug = params.get("post") || params.get("slug");
      const targetSlug = hash || querySlug;

      if (targetSlug && BLOG_POSTS.some((p) => p.slug === targetSlug)) {
        setSelectedSlug(targetSlug);
      } else {
        setSelectedSlug(null);
      }
    };

    syncSlugFromUrl();
    window.addEventListener("hashchange", syncSlugFromUrl);
    window.addEventListener("popstate", syncSlugFromUrl);
    return () => {
      window.removeEventListener("hashchange", syncSlugFromUrl);
      window.removeEventListener("popstate", syncSlugFromUrl);
    };
  }, []);

  // Update hash when post selected
  const handleSelectPost = (slug: string) => {
    setSelectedSlug(slug);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `#${slug}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackToList = () => {
    setSelectedSlug(null);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", window.location.pathname);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const activePost = useMemo(() => {
    if (!selectedSlug) return null;
    return BLOG_POSTS.find((p) => p.slug === selectedSlug) || null;
  }, [selectedSlug]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    BLOG_POSTS.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return ["All", ...Array.from(set)];
  }, []);

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag = selectedTag === "All" || post.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [searchQuery, selectedTag]);

  const copyShareLink = (post: BlogPost) => {
    const url = `${window.location.origin}/blogs#${post.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Article link copied to clipboard!");
    } else {
      toast.info(url);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={beeyieldLogo} alt="BeeYield" className="h-8 w-auto transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-display font-black text-lg text-foreground tracking-tight flex items-center gap-1.5">
                BeeYield <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Blogs</span>
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">Field Agronomy & Pollination Journal</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/about"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              Our Story
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
            >
              Launch AI Platform <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ARTICLE READER VIEW */}
      {activePost ? (
        <main className="container mx-auto px-4 py-10 max-w-4xl animate-in fade-in-50 duration-300">
          {/* Breadcrumb and Back button */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted px-4 py-2 rounded-xl transition-all border border-border/50"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Articles ({BLOG_POSTS.length})
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyShareLink(activePost)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                title="Share article"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>

          {/* Quick Series Switcher */}
          <div className="p-3 mb-8 rounded-2xl bg-muted/40 border border-border/60">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between px-1">
              <span>All 4 Agronomy Articles in this Series:</span>
              <button onClick={handleBackToList} className="text-emerald-500 hover:underline font-semibold text-[11px]">
                Browse All Directory →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {BLOG_POSTS.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPost(p.slug)}
                  className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-1 text-xs ${
                    p.slug === activePost.slug
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold shadow-sm"
                      : "bg-background/60 hover:bg-muted/80 border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-[10px] opacity-70">Article #{idx + 1}</span>
                  <span className="line-clamp-2 leading-tight font-medium text-[11px]">{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Article Header */}
          <header className="space-y-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1">
                {activePost.category}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" /> {activePost.displayDate}
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" /> {activePost.readTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
              {activePost.title}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-normal">
              {activePost.subtitle}
            </p>

            {/* Author Byline */}
            <div className="flex items-center gap-3 pt-4 border-t border-border/40">
              <img
                src={activePost.author.avatar}
                alt={activePost.author.name}
                onError={(e) => {
                  e.currentTarget.src = "/images/timothy-nduva.png";
                }}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40 shadow-sm"
              />
              <div>
                <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  {activePost.author.name}
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Author
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{activePost.author.role}</div>
              </div>
            </div>
          </header>

          {/* Key Metric Highlights if present */}
          {activePost.stats && activePost.stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-8">
              {activePost.stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-muted/40 border border-border/50 rounded-2xl p-4 text-center space-y-1 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-foreground">{stat.label}</div>
                  {stat.sub && <div className="text-[11px] text-muted-foreground leading-tight">{stat.sub}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Hero Media Cover */}
          <div className="relative rounded-3xl overflow-hidden border border-border/60 shadow-xl mb-10 group">
            <img
              src={activePost.coverImage}
              alt={activePost.coverAlt}
              className="w-full h-80 sm:h-96 md:h-[460px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 font-medium">
                📷 Authentic Field Media: Makueni County Orchard Operations
              </span>
            </div>
          </div>

          {/* Article Markdown Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-emerald-500 hover:prose-a:underline prose-img:rounded-2xl">
            <MarkdownRenderer content={activePost.content} />
          </article>

          {/* Field Media Photo Gallery */}
          {activePost.mediaGallery && activePost.mediaGallery.length > 0 && (
            <section className="my-12 p-6 rounded-3xl bg-muted/30 border border-border/60">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-emerald-500" />
                <h3 className="text-xl font-bold text-foreground">Authentic Field & Telemetry Gallery</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Photographed during active bloom management and IoT sensor calibration across Kenya orchards.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activePost.mediaGallery.map((media, idx) => (
                  <div key={idx} className="group rounded-2xl overflow-hidden border border-border/60 bg-card flex flex-col">
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={media.src}
                        alt={media.alt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3.5 bg-card/90">
                      <p className="text-xs font-medium text-foreground/90 leading-relaxed">{media.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* In-Article IoT Tech Highlight Card */}
          <section className="my-10 p-6 rounded-3xl bg-gradient-to-br from-emerald-950/20 via-muted/40 to-background border border-emerald-500/20 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-500 shadow-inner">
              <Cpu className="w-8 h-8" />
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <h4 className="text-base font-bold text-foreground">Real-Time Pollinator Telemetry in Action</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                BeeYield's solar-powered IoT monitors continuously compute foraging intensity, hive acoustics, and ambient bloom temperatures to verify peak pollination window saturation.
              </p>
            </div>
            <Link
              to="/"
              className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-all"
            >
              Explore AI Tools
            </Link>
          </section>

          {/* Author Bio Box */}
          <footer className="my-12 p-6 rounded-3xl bg-muted/40 border border-border/60">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <img
                src={activePost.author.avatar}
                alt={activePost.author.name}
                onError={(e) => {
                  e.currentTarget.src = "/images/timothy-nduva.png";
                }}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/40 flex-shrink-0"
              />
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  Written by {activePost.author.name}
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {activePost.author.role}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{activePost.author.bio}</p>
              </div>
            </div>
          </footer>

          {/* Related Articles */}
          <section className="my-12 pt-8 border-t border-border/40">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">More from the BeeYield Agronomy Journal</h3>
              <button onClick={handleBackToList} className="text-xs font-semibold text-emerald-500 hover:underline">
                View All {BLOG_POSTS.length} Articles →
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {BLOG_POSTS.filter((p) => p.slug !== activePost.slug).map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleSelectPost(post.slug)}
                  className="group cursor-pointer p-3.5 rounded-2xl border border-border/60 bg-card hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-3">
                    <div className="relative h-32 rounded-xl overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <Badge className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold border-none">
                        {post.category}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">{post.readTime}</span>
                      <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-emerald-500 transition-colors mt-1">
                        {post.title}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                    Read Dispatch <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        /* BLOG INDEX LIST VIEW */
        <main className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
          {/* Hero Header */}
          <section className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3.5 py-1 rounded-full text-xs font-bold">
              🌿 BeeYield Field Agronomy & Pollination Journal
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
              The Science of Precision <br />
              <span className="text-emerald-600 dark:text-emerald-400">Crop Pollination in Kenya</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Dispatches directly from our research apiaries and commercial mango, avocado, and macadamia orchards across Makueni and Kibwezi. Written by founder Timothy Mathuva.
            </p>
          </section>

          {/* Search and Tag Filter Bar */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by crop, floral stage, IoT telemetry, or keywords..."
                className="pl-10 h-12 rounded-2xl bg-muted/40 border-border/60 focus-visible:ring-emerald-500"
              />
            </div>

            {/* Tag Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedTag === tag
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                      : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* FEATURED POST HERO SPOTLIGHT */}
          {filteredPosts.length > 0 && (
            <Card
              onClick={() => handleSelectPost(filteredPosts[0].slug)}
              className="overflow-hidden border-border/60 hover:border-emerald-500/40 bg-card/60 backdrop-blur-sm cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 group rounded-3xl"
            >
              <div className="grid md:grid-cols-12 gap-6 items-center p-6 sm:p-8">
                <div className="md:col-span-7 relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-inner">
                  <img
                    src={filteredPosts[0].coverImage}
                    alt={filteredPosts[0].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-amber-500 text-black font-black text-xs px-3 py-1 shadow-md">
                      ⭐ Featured Dispatch
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-white">
                    📍 Makueni County Orchard Operations
                  </div>
                </div>

                <div className="md:col-span-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none font-bold text-xs">
                      {filteredPosts[0].category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">• {filteredPosts[0].readTime}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                    {filteredPosts[0].title}
                  </h2>

                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {filteredPosts[0].excerpt}
                  </p>

                  {/* Author Row */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/40">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={filteredPosts[0].author.avatar}
                        alt={filteredPosts[0].author.name}
                        onError={(e) => {
                          e.currentTarget.src = "/images/timothy-nduva.png";
                        }}
                        className="w-9 h-9 rounded-full object-cover border border-emerald-500/30"
                      />
                      <div>
                        <div className="text-xs font-bold text-foreground">{filteredPosts[0].author.name}</div>
                        <div className="text-[10px] text-muted-foreground">{filteredPosts[0].displayDate}</div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                      Read Article <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ALL POSTS GRID */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" /> All Agronomy Articles ({filteredPosts.length})
              </h3>
              <span className="text-xs text-muted-foreground">Showing verified field notes</span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  onClick={() => handleSelectPost(post.slug)}
                  className="overflow-hidden border-border/60 hover:border-emerald-500/40 bg-card hover:shadow-xl transition-all duration-300 group cursor-pointer rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-black/70 backdrop-blur-md text-white border-none text-[11px] font-bold">
                          {post.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-medium">
                        {post.readTime}
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-2.5">
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> {post.displayDate}
                      </div>
                      <h4 className="text-base font-black text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </CardContent>
                  </div>

                  <div className="px-5 pb-5 pt-2 border-t border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        onError={(e) => {
                          e.currentTarget.src = "/images/timothy-nduva.png";
                        }}
                        className="w-7 h-7 rounded-full object-cover border border-emerald-500/30"
                      />
                      <span className="text-xs font-semibold text-foreground">{post.author.name}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Farmer Consultation CTA Section */}
          <section className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-amber-950/30 border border-emerald-500/30 shadow-2xl relative overflow-hidden text-center space-y-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Leaf className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Ready to Maximize Fruit Set on Your Orchard?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Whether you cultivate Apple Mangoes in Makueni, Hass Avocados in Murang'a, or Macadamia in Embu, our IoT-monitored precision pollination teams deliver verified yield improvements.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 shadow-xl shadow-emerald-900/20"
                asChild
              >
                <a href="mailto:info@beeyield.com">Book an Orchard Consultation</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-border hover:bg-muted font-bold h-12 px-8"
                asChild
              >
                <Link to="/about">Read Our 2020–2026 Story</Link>
              </Button>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
