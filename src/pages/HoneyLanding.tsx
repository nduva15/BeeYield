import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Leaf, Heart, Shield, ArrowRight, Droplets, TreePine, Check, QrCode, MapPin, Award, ShoppingCart, Loader2 } from "lucide-react";
import { getProducts, Product } from "@/services/shopService";
import { getCompanyStats, CompanyStat } from "@/services/companyService";

const HoneyLanding = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<CompanyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    const initData = async () => {
      try {
        const [fetchedProducts, fetchedStats] = await Promise.all([
          getProducts(),
          getCompanyStats()
        ]);
        // Filter for honey products
        const honeyItems = fetchedProducts.filter(p => p.category === 'honey');
        setProducts(honeyItems.slice(0, 3));
        setStats(fetchedStats);

        // Initialize variants
        const variants: Record<string, string> = {};
        honeyItems.slice(0, 3).forEach(p => {
          if (p.variants && p.variants.length > 0) {
            variants[p.id] = p.variants[0].id;
          }
        });
        setSelectedVariants(variants);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const getStatValue = (key: string, defaultValue: string) => {
    const s = stats.find(stat => stat.stat_key === key);
    return s ? s.stat_value : defaultValue;
  };

  const getSelectedPrice = (product: Product) => {
    const variantId = selectedVariants[product.id];
    const variant = product.variants.find(v => v.id === variantId);
    return variant ? variant.price_kes : (product.variants[0]?.price_kes || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] overflow-hidden flex items-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container relative mx-auto px-4 py-20">
          <div className="max-w-3xl space-y-10">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-6 py-2 rounded-2xl font-black uppercase tracking-widest shadow-sm">
              🍯 Sustainably Harvested in Makueni
            </Badge>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-none tracking-tighter">
              Honey That<br />
              <span className="text-primary italic">Gives Back</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-xl">
              We harvest only 50% of what our bees produce, leaving the rest for them to thrive. Every jar is fully traceable.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Button size="lg" className="h-16 px-10 text-xl font-black shadow-glow" asChild>
                <Link to="/shop">Shop Collection <ArrowRight className="ml-2 h-6 w-6" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-black border-2" asChild>
                <Link to="/traceability">Trace Your Jar</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-border/50">
              <div>
                <p className="text-3xl font-black text-primary">{getStatValue('active_colonies', '184+')}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Hives</p>
              </div>
              <div>
                <p className="text-3xl font-black text-primary">50%</p>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bee Share</p>
              </div>
              <div>
                <p className="text-3xl font-black text-primary">{getStatValue('trees_planted', '2,500+')}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Trees Planted</p>
              </div>
              <div>
                <p className="text-3xl font-black text-primary">100%</p>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Traceable</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)] hidden lg:block" />
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">Not Just Honey. <span className="text-primary italic">A Promise.</span></h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">Hand-harvested with respect for the pollinators that make life sweet.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              { icon: Leaf, title: "100% Raw", desc: "Straight from the hive, unfiltered, and packed with enzymes." },
              { icon: Heart, title: "Bee-First", desc: "We take only half, ensuring colonies thrive year-round." },
              { icon: Shield, title: "Traceable", desc: "Every jar tells its story through blockchain verification." },
              { icon: TreePine, title: "Regenerative", desc: "Every purchase supports Kibwezi's reforestation." }
            ].map((f, i) => (
              <Card key={i} className="border-none shadow-soft hover:shadow-glow transition-all p-10 bg-muted/30">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <f.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-black mb-4">{f.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-4">Premium <span className="text-primary italic">Collection</span></h2>
            <p className="text-xl text-muted-foreground font-medium">Artisan varieties from Kenya's diverse landscapes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden border-none shadow-soft hover:shadow-glow transition-all duration-500 bg-white">
                <div className="aspect-square relative overflow-hidden bg-amber-50">
                  <img src={product.images[0] || "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800"} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-2xl font-black">{product.name}</h3>
                  <p className="text-muted-foreground font-medium line-clamp-2">{product.description}</p>

                  <div className="space-y-4">
                    <Select
                      value={selectedVariants[product.id]}
                      onValueChange={(val) => setSelectedVariants({ ...selectedVariants, [product.id]: val })}
                    >
                      <SelectTrigger className="h-12 border-2">
                        <SelectValue placeholder="Select weight" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.map(v => (
                          <SelectItem key={v.id} value={v.id}>{v.size} - KES {v.price_kes}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black text-primary">KES {getSelectedPrice(product)}</span>
                      <Button className="h-12 px-6 font-black" asChild>
                        <Link to="/shop">Shop Now</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-32 bg-primary text-white text-center">
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-10">Taste the Truth</h2>
        <Button size="lg" className="h-20 px-16 text-2xl font-black bg-white text-primary hover:bg-white/90 shadow-2xl" asChild>
          <Link to="/shop">Buy BeeYield Honey</Link>
        </Button>
      </section>
    </div>
  );
};

export default HoneyLanding;
