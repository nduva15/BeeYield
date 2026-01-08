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

            <h1 className="text-display-xl md:text-display-2xl font-black leading-none tracking-tightest">
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-border/50 font-black">
              <div>
                <p className="text-4xl md:text-5xl text-primary tracking-tightest">{getStatValue('active_colonies', '184+')}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Active Hives</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl text-primary tracking-tightest">50%</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Bee Share</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl text-primary tracking-tightest">{getStatValue('trees_planted', '2,500+')}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Trees Planted</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl text-primary tracking-tightest">100%</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Traceable</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)] hidden lg:block" />
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24 space-y-6">
            <Badge variant="outline" className="text-primary border-primary px-4 py-1">The BeeYield Standard</Badge>
            <h2 className="text-5xl md:text-7xl font-black tracking-tightest leading-none">Not Just Honey. <br /><span className="text-primary italic">A Promise.</span></h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">Hand-harvested with respect for the pollinators that make life sweet.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              { icon: Leaf, title: "100% Raw", desc: "Straight from the hive, unfiltered, and packed with enzymes." },
              { icon: Heart, title: "Bee-First", desc: "We take only half, ensuring colonies thrive year-round." },
              { icon: Shield, title: "Traceable", desc: "Every jar tells its story through blockchain verification." },
              { icon: TreePine, title: "Regenerative", desc: "Every purchase supports Kibwezi's reforestation." }
            ].map((f, i) => (
              <Card key={i} className="border-none shadow-premium hover:shadow-glow transition-all duration-700 hover:-translate-y-2 p-10 bg-white dark:bg-card rounded-[3rem]">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
                  <f.icon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">{f.title}</h3>
                <p className="text-muted-foreground font-semibold leading-relaxed">{f.desc}</p>
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
              <Card key={product.id} className="group overflow-hidden border-none shadow-premium hover:shadow-glow-primary transition-all duration-700 bg-white dark:bg-card rounded-[3rem]">
                <div className="aspect-[4/5] relative overflow-hidden bg-amber-50">
                  <img src={product.images[0] || "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <Button className="w-full h-14 bg-white text-black hover:bg-white/90 font-black rounded-2xl shadow-xl">
                      View Details
                    </Button>
                  </div>
                </div>
                <CardContent className="p-10 space-y-6">
                  <h3 className="text-3xl font-black tracking-tight">{product.name}</h3>
                  <p className="text-muted-foreground font-semibold line-clamp-2 leading-relaxed">{product.description}</p>

                  <div className="pt-4 space-y-6 border-t border-border/50">
                    <Select
                      value={selectedVariants[product.id]}
                      onValueChange={(val) => setSelectedVariants({ ...selectedVariants, [product.id]: val })}
                    >
                      <SelectTrigger className="h-14 border-2 rounded-2xl font-bold bg-muted/20">
                        <SelectValue placeholder="Select weight" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {product.variants.map(v => (
                          <SelectItem key={v.id} value={v.id} className="font-bold">{v.size} - KES {v.price_kes}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Price</span>
                        <span className="text-4xl font-black text-primary tracking-tightest">KES {getSelectedPrice(product)}</span>
                      </div>
                      <Button className="h-14 px-10 font-black rounded-2xl shadow-glow text-lg" asChild>
                        <Link to="/shop">Shop</Link>
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
