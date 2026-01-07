import { useState, useEffect } from "react";
import { ArrowRight, Target, Wheat, TreePine, Heart, Users, Droplets, Zap, Building, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { getSDGs } from "@/services/servicesService";

const iconMap: Record<string, any> = {
  Target, Wheat, TreePine, Heart, Users, Droplets, Zap, Building, Globe
};

const CommitmentPage = () => {
  const [sdgs, setSdgs] = useState<any[]>([]);
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

    const fetchSDGs = async () => {
      try {
        const data = await getSDGs();
        if (data && data.length > 0) {
          setSdgs(data);
        } else {
          // Fallback static data
          setSdgs([
            {
              number: 1, title: "No Poverty", color: "bg-red-500", icon: "Users",
              description: "We provide training programs for smallholder farmers.",
              impact: "50+ farmers trained"
            },
            {
              number: 2, title: "Zero Hunger", color: "bg-amber-500", icon: "Wheat",
              description: "Pollination services boost agricultural yields.",
              impact: "25 acres pollinated"
            },
            {
              number: 13, title: "Climate Action", color: "bg-emerald-600", icon: "TreePine",
              description: "Reforestation and biodiversity protection initiatives.",
              impact: "2,500+ trees planted"
            },
            {
              number: 15, title: "Life on Land", color: "bg-green-600", icon: "Heart",
              description: "Protecting essential pollinators and terrestrial ecosystems.",
              impact: "2M+ bees protected"
            }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSDGs();

    return () => {
      document.head.removeChild(script);
    };
  }, []);

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
      <section className="relative overflow-hidden py-32 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-8 bg-primary/20 text-primary border-primary/30 px-6 py-2 rounded-2xl font-black uppercase tracking-widest shadow-sm">
              Global Sustenance Goals
            </Badge>
            <h1 className="mb-6 text-5xl font-black leading-tight md:text-8xl tracking-tighter">
              Our SDG <br />
              <span className="text-primary italic">Commitment</span>
            </h1>
            <p className="mb-10 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              BeeYield's work directly contributes to Sustainable Development Goals, creating lasting impact for communities and global food security.
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sdgs.map((sdg) => (
              <Card key={sdg.number} className="border-none shadow-soft hover:shadow-glow transition-all overflow-hidden group bg-white">
                <div className={`${sdg.color} h-3 group-hover:h-5 transition-all`}></div>
                <CardContent className="p-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className={`${sdg.color} text-white w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shadow-lg`}>
                      {sdg.number}
                    </div>
                    <div className={`${sdg.color}/10 p-4 rounded-2xl`}>
                      {(() => {
                        const IconComp = iconMap[sdg.icon] || Globe;
                        return <IconComp className={`h-8 w-8 ${sdg.color.replace('bg-', 'text-')}`} />;
                      })()}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-foreground">{sdg.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6 font-medium">
                    {sdg.description}
                  </p>
                  <div className="pt-6 border-t border-border/50">
                    <p className="text-sm text-primary font-black uppercase tracking-widest mb-2">Our Impact</p>
                    <p className="text-lg text-foreground font-black">{sdg.impact}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-foreground text-background text-center relative overflow-hidden">
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-8">Join the Mission</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <Button size="lg" className="h-16 px-12 text-xl font-black bg-white text-foreground hover:bg-white/90" asChild>
            <Link to="/contact">Partner With Us</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-black border-2 border-white text-white hover:bg-white/10" asChild>
            <Link to="/impact">See Full Impact</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CommitmentPage;
