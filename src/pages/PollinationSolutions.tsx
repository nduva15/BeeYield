import {
  ArrowRight, Activity, Sprout, BarChart3,
  Cpu, Wifi, Check, Quote, MapPin, Users,
  Smartphone, Clock, Shield, TrendingUp, GraduationCap,
  Target, Zap, Heart, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getPollinationServices, PollinationService } from "@/services/servicesService";
import { getCompanyStats, CompanyStat } from "@/services/companyService";

const PollinationSolutions = () => {
  const [services, setServices] = useState<PollinationService[]>([]);
  const [stats, setStats] = useState<CompanyStat[]>([]);
  const [loading, setLoading] = useState(true);

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

    const initData = async () => {
      try {
        const [fetchedServices, fetchedStats] = await Promise.all([
          getPollinationServices(),
          getCompanyStats()
        ]);
        setServices(fetchedServices);
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

      {/* Hub Hero - Beekeeping Solutions */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left relative z-10">
              <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
                Smart Beekeeping Network
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 leading-tight">
                Beekeeping <span className="text-primary italic">Solutions</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 font-medium">
                Helping beekeepers build, maintain, and deploy the strongest, healthiest hives. Our cutting-edge monitoring technology empowers you to overcome management challenges.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="h-14 px-8 font-black shadow-glow">
                  <Link to="/contact">
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 font-black border-2">
                  <Link to="/about">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-premium">
                <img
                  src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800"
                  alt="Beekeeper inspecting hives"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground px-8 py-4 rounded-2xl shadow-glow">
                <p className="text-3xl font-black">{getStatValue('active_colonies', '184+')}</p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-90">Managed Hives</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two approach path from dynamic services if available, else stationary mapping */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6">Two Powerful Paths</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">Choose the precision solution that fits your operation.</p>
        </div>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service) => (
              <Card key={service.id} className="group overflow-hidden border-none shadow-soft hover:shadow-glow transition-all duration-500 bg-white">
                <CardContent className="p-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    {service.slug.includes('land') ? <Sprout className="w-8 h-8 text-primary" /> : <Cpu className="w-8 h-8 text-primary" />}
                  </div>
                  <h3 className="text-2xl font-black mb-4">{service.name}</h3>
                  <p className="text-muted-foreground mb-8 font-medium">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-10">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-foreground font-bold">
                        <Check className="w-5 h-5 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="w-full h-12 font-black border-2 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Link to={service.slug.includes('land') ? "/InLandPollinationPlatform" : "/PrecisionPollination"}>
                      Explore Technology <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
            {services.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl shadow-soft">
                <p className="text-muted-foreground font-bold">No dynamic services found. Contact us for custom solutions.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust & Mortality Stats */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <Badge className="mb-4 bg-red-100 text-red-700 font-black px-4 py-1 self-start">The Mortality Crisis</Badge>
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">A Better Way to <span className="text-primary italic">Manage Bees</span></h2>
              <p className="text-xl text-muted-foreground mb-10 font-medium">
                Globally, colony mortality averages 40%. Through real-time monitoring and data-driven management, BeeYield has reduced this to less than 15%.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                  <p className="text-5xl font-black text-red-600 mb-2">40%</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-red-800/60">Global Average Loss</p>
                </div>
                <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20">
                  <p className="text-5xl font-black text-primary mb-2">15%</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/60">BeeYield Average</p>
                </div>
              </div>
              <Button asChild size="lg" className="h-14 px-10 font-black shadow-glow">
                <Link to="/contact">Join the Mission</Link>
              </Button>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800" className="rounded-3xl shadow-premium" alt="Bee health monitoring" />
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-glow max-w-xs border border-muted">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                <p className="font-bold text-lg italic mb-4">"BeeYield delivers real-world solutions to help address daily beekeeping challenges."</p>
                <p className="text-sm font-black text-primary uppercase">John Mutua</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-32 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Start Pollinating with Precision</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Button asChild size="lg" variant="secondary" className="h-16 px-12 text-xl font-black shadow-2xl bg-white text-primary hover:bg-white/90">
              <Link to="/pollination-request">Request Service</Link>
            </Button>
            <Button asChild size="lg" className="h-16 px-12 text-xl font-black border-2 border-white hover:bg-white/10">
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PollinationSolutions;
