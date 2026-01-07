import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, ArrowRight,
  Cpu, Eye, Target, Users,
  Activity, Database, Radio, Smartphone, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { getCrops, Crop } from "@/services/servicesService";
import { getCompanyStats, CompanyStat } from "@/services/companyService";

const Home = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [stats, setStats] = useState<CompanyStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inject GTM script into head
    const script = document.createElement('script');
    script.innerHTML = ` (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-KF284247');`;
    script.async = true;
    document.head.appendChild(script);

    const initData = async () => {
      try {
        const [fetchedCrops, fetchedStats] = await Promise.all([
          getCrops(),
          getCompanyStats()
        ]);
        setCrops(fetchedCrops);
        setStats(fetchedStats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initData();

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const getStatValue = (key: string, defaultValue: string) => {
    const s = stats.find(stat => stat.stat_key === key);
    return s ? s.stat_value : defaultValue;
  };

  const differences = [
    {
      icon: Database,
      title: "Data-First Approach",
      description: "Every decision backed by real-time hive analytics and field data, not guesswork."
    },
    {
      icon: Radio,
      title: "IoT-Enabled Monitoring",
      description: "Sensors in every hive transmitting colony health metrics 24/7 to our platform."
    },
    {
      icon: Target,
      title: "Precision Placement",
      description: "AI-optimized hive positioning ensures maximum coverage across your fields."
    },
    {
      icon: Activity,
      title: "Live Activity Tracking",
      description: "Watch bee foraging patterns in real-time and adjust strategies instantly."
    },
    {
      icon: Users,
      title: "Expert Agronomists",
      description: "Dedicated pollination specialists who understand your crop's unique needs."
    },
    {
      icon: Check,
      title: "Guaranteed Results",
      description: "We stake our reputation on measurable yield improvements for your harvest."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-white via-primary/5 to-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge className="bg-primary/10 text-primary border-primary/30 px-6 py-2 rounded-2xl font-black uppercase tracking-widest shadow-sm">
                🐝 Africa's Premier Pollination Partner
              </Badge>

              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-tight tracking-tighter">
                Your Partner in
                <span className="text-primary block italic">Pollination</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-medium">
                With BeeYield's data-driven, managed pollination solutions for commercial crop growers.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <Button size="lg" className="h-16 px-10 text-xl font-black shadow-glow" asChild>
                  <Link to="/contact">Book Consultation <ArrowRight className="ml-2 h-6 w-6" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-black border-2" asChild>
                  <Link to="/PollinationRequest">Book Pollination</Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 pt-12 border-t border-border/50">
                <div>
                  <p className="text-3xl font-black text-primary">{getStatValue('yield_increase', '35%')}</p>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Yield Increase</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-primary">{getStatValue('active_colonies', '150+')}</p>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Managed Hives</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-primary">2K+</p>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Data Points</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-primary">1+</p>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Continents</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-primary">1+</p>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Countries</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-primary">2+</p>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Counties</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-premium group">
                <img
                  src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800"
                  alt="Bee pollinating"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-bounce">
                  <span className="text-4xl">🐝</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="text-primary border-primary/30 px-4 py-1.5 font-bold uppercase tracking-widest">
              Our Philosophy
            </Badge>
            <h2 className="text-4xl md:text-7xl font-black text-foreground tracking-tight">
              Pollination is an <span className="text-primary italic">Art</span> and a <span className="text-primary italic">Science</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
              We've merged ancient wisdom with cutting-edge IoT technology. This isn't just pollination; it's precision agriculture.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Cards */}
      <section className="py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            <Card className="group overflow-hidden border-none shadow-soft hover:shadow-glow transition-all duration-500 bg-white p-10">
              <CardContent className="p-0 space-y-8">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Cpu className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-3xl font-black">In-Hive Precision</h3>
                <p className="text-lg text-muted-foreground font-medium">Smart sensors monitor colony health 24/7. Know your pollination strength before deployment.</p>
                <Button className="h-12 px-8 font-black" asChild>
                  <Link to="/PrecisionPollination">Explore In-Hive <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-none shadow-soft hover:shadow-glow transition-all duration-500 bg-white p-10">
              <CardContent className="p-0 space-y-8">
                <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-3xl font-black">In-Land PLIP</h3>
                <p className="text-lg text-muted-foreground font-medium">Measure real bee activity in the field to correlate colony strength with yield outcomes.</p>
                <Button className="h-12 px-8 font-black bg-green-600 hover:bg-green-700" asChild>
                  <Link to="/InLandPollinationPlatform">Explore Platform <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Crops Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">Crops We <span className="text-primary italic">Pollinate</span></h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">Diverse crop expertise from across the continent.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
            {crops.map((crop, index) => (
              <Link
                to="/crops-we-pollinate"
                key={crop.id || index}
                className="group relative overflow-hidden rounded-3xl aspect-square shadow-soft hover:shadow-glow transition-all"
              >
                <img
                  src={crop.image_url || "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=400"}
                  alt={crop.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white font-black text-xl">{crop.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-primary text-white">
        <div className="container mx-auto px-4 text-center space-y-12">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">Ready for a Better Harvest?</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <Button size="lg" className="h-20 px-16 text-2xl font-black bg-white text-primary hover:bg-white/90 shadow-2xl" asChild>
              <Link to="/contact">Get Consultation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
