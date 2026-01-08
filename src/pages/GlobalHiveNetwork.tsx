
import { useState, useEffect } from "react";
import { Globe, Activity, BookOpen, Heart, AlertTriangle, MapPin, Check, Mail, Leaf, TrendingUp, ArrowRight, Loader2, Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiaries, Apiary } from "@/services/servicesService";
import { getCompanyStats, CompanyStat } from "@/services/companyService";

const GlobalHiveNetwork = () => {
  const [supportType, setSupportType] = useState("monthly");
  const [apiaries, setApiaries] = useState<Apiary[]>([]);
  const [stats, setStats] = useState<CompanyStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        const [fetchedApiaries, fetchedStats] = await Promise.all([
          getApiaries(),
          getCompanyStats()
        ]);
        setApiaries(fetchedApiaries);
        setStats(fetchedStats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative py-24 md:py-40 bg-gradient-to-br from-secondary via-background to-primary/10 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 font-bold">
            A Planetary Initiative
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight text-foreground leading-tight">
            Saving Africa's <span className="text-primary italic">Pollinators</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10 max-w-3xl mx-auto font-medium">
            BeeYield is leading the charge to address the pollinator crisis in Africa, where 60% of bee colonies are lost annually.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" asChild className="shadow-2xl h-14 px-10 text-lg font-bold">
              <a href="#support-african-farmers">Support the Cause Today</a>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold border-2">
              Our Impact Reports
            </Button>
          </div>
        </div>
        {/* Decorative Hive Grid */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5 active pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </section>

      {loading ? (
        <div className="flex justify-center py-40">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Network Stats Bar */}
          <div className="bg-foreground text-background py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((s, i) => (
                  <div key={i} className="text-center group">
                    <div className="text-3xl md:text-5xl font-black text-primary mb-2 group-hover:scale-110 transition-transform">{s.stat_value}</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-background/60">{s.stat_label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* APIARIES SECTION */}
          <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-black mb-4">Our Global Hive Nodes</h2>
                <p className="text-muted-foreground font-medium">Real-time apiary locations across the network.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {apiaries.map((apiary) => (
                  <Card key={apiary.id} className="border-none shadow-soft hover:shadow-glow transition-all group">
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      <img
                        src={(apiary as any).image_url || "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800"}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        alt={apiary.name}
                      />
                      <Badge className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm font-bold">{apiary.hive_count} Hives</Badge>
                    </div>
                    <CardContent className="p-8">
                      <div className="flex items-center gap-2 mb-3 text-primary">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-black uppercase tracking-widest">{apiary.region}, {apiary.location_name}</span>
                      </div>
                      <h3 className="text-2xl font-black mb-3">{apiary.name}</h3>
                      <p className="text-muted-foreground text-sm font-medium line-clamp-3 mb-6">{"Active apiary node contributing to regional pollination and honey production."}</p>
                      <div className="flex items-center justify-between pt-6 border-t font-bold text-xs uppercase tracking-tighter text-muted-foreground">
                        <div className="flex items-center gap-1"><Hexagon className="h-3 w-3" /> {apiary.hive_count} Active Units</div>
                        <div className="text-primary hover:underline cursor-pointer">View Node Data</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Full-width Video Section */}
      <div className="relative w-full h-[80vh] bg-foreground shadow-2xl">
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="About BeeYield"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* The Crisis Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1">
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
                <CardContent className="p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    <span className="text-xs font-black text-destructive uppercase tracking-[0.2em]">Global Emergency</span>
                  </div>
                  <h3 className="text-4xl font-black mb-6 text-white leading-tight">The Bee Crisis</h3>
                  <p className="text-white/70 leading-relaxed mb-8 text-lg">
                    Across Africa, beekeepers are discovering devastating losses. African bee colonies face unique challenges from climate change and limited technology.
                  </p>
                  <div className="bg-destructive/20 p-6 rounded-2xl border border-destructive/30">
                    <p className="text-6xl font-black text-destructive mb-1">60%</p>
                    <p className="text-sm font-bold text-white/50 uppercase tracking-widest">Annual colony mortality rate in Africa</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Food Security <br /><span className="text-primary italic">At Risk</span></h2>
              <p className="text-white/70 leading-relaxed mb-8 text-xl font-medium">
                With 75% of food crops relying on pollinators, the decline of African bee populations threatens agricultural productivity and millions of livelihoods.
              </p>
              <Button variant="secondary" size="lg" className="gap-2 font-bold h-14 px-8" asChild>
                <a href="/Crops-We-Pollinate">See Impacted Crops <ArrowRight className="h-4 w-4" /></a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support-african-farmers" className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10 pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Heart className="h-16 w-16 mx-auto mb-6 text-white/80 animate-pulse" />
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">Support Our Mission</h2>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto font-medium">
              Join our community of supporters strengthening pollinator health and food security.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {/* Option 1 */}
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden scale-95 hover:scale-100 transition-transform duration-500">
              <CardContent className="p-10">
                <div className="bg-muted rounded-full p-1 inline-flex mb-8">
                  <button onClick={() => setSupportType("onetime")} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${supportType === "onetime" ? "bg-white shadow-lg text-primary" : "text-muted-foreground"}`}>One-time</button>
                  <button onClick={() => setSupportType("monthly")} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${supportType === "monthly" ? "bg-white shadow-lg text-primary" : "text-muted-foreground"}`}>Monthly</button>
                </div>
                <div className="mb-10">
                  <span className="text-7xl font-black text-foreground">{supportType === "monthly" ? "$10" : "$50"}</span>
                  {supportType === "monthly" && <span className="text-muted-foreground font-bold">/mo</span>}
                </div>
                <Button className="w-full h-14 font-black shadow-glow">Fund 1 Smart Sensor</Button>
              </CardContent>
            </Card>

            {/* Option 2 */}
            <Card className="border-4 border-accent shadow-2xl rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground font-black px-6 py-2 rounded-bl-3xl text-xs uppercase tracking-widest z-10">Patron</div>
              <CardContent className="p-10">
                <div className="mb-10 mt-12">
                  <span className="text-7xl font-black text-foreground">{supportType === "monthly" ? "$100" : "$500"}</span>
                  {supportType === "monthly" && <span className="text-muted-foreground font-bold">/mo</span>}
                </div>
                <Button className="w-full h-14 font-black shadow-glow bg-accent hover:bg-accent/90 text-accent-foreground border-none">Adopt a Full Hive</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GlobalHiveNetwork;