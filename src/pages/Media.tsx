import { useState, useEffect } from "react";
import { Download, ArrowRight, FileText, Image, Video, Users, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMediaItems, MediaItem } from "@/services/mediaService";

const Media = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
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

    const fetchData = async () => {
      try {
        const data = await getMediaItems();
        setMedia(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const pressReleases = media.filter(m => m.media_type === 'press_release');
  const videos = media.filter(m => m.media_type === 'video');

  const fallbackPress = [
    "BeeYield Establishes Regional Headquarters in Kenya, Growing its Local Presence",
    "BeeYield Achieves 10 Million Hive Samples Daily With Its In-Hive Sensors",
    "BeeYield Unveils Latest ESG Data Highlighting Sustainability Success"
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
      <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
          <Badge className="bg-primary/20 text-primary border-primary/30 px-6 py-2 rounded-2xl font-black uppercase tracking-widest mb-8">
            Media & press
          </Badge>
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
            Media Kit & <span className="text-primary italic">Brand Tools</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Essential assets for journalists, partners, and the beekeeping community.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </section>

      {/* Brand Assets */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-4xl font-black">Logo Assets</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <Card className="border-none shadow-soft hover:shadow-glow transition-all duration-500 overflow-hidden group">
                <CardContent className="p-16 flex items-center justify-center bg-foreground group-hover:bg-foreground/90 transition-colors">
                  <div className="text-white text-5xl font-black tracking-tighter flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl" />
                    BeeYield
                  </div>
                </CardContent>
                <div className="p-6 bg-white flex justify-center">
                  <Button size="lg" className="h-14 px-8 font-black gap-2">
                    <Download className="h-5 w-5" /> Download SVG
                  </Button>
                </div>
              </Card>

              <Card className="border-none shadow-soft hover:shadow-glow transition-all duration-500 overflow-hidden group">
                <CardContent className="p-16 flex items-center justify-center bg-white border border-border group-hover:bg-muted transition-colors">
                  <div className="text-foreground text-5xl font-black tracking-tighter flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl" />
                    BeeYield
                  </div>
                </CardContent>
                <div className="p-6 bg-white flex justify-center">
                  <Button size="lg" variant="outline" className="h-14 px-8 font-black gap-2 border-2">
                    <Download className="h-5 w-5" /> Download SVG
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Image Categories */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Image className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-4xl font-black">Image Library</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {['Technology', 'Pollination', 'Team'].map((cat) => (
                <Card key={cat} className="group overflow-hidden border-none shadow-soft hover:shadow-glow transition-all duration-500 bg-white">
                  <div className="aspect-[4/5] bg-muted relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="icon" className="w-16 h-16 rounded-full"><Download /></Button>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-8">
                      <h3 className="text-2xl font-black text-foreground">{cat}</h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Latest Press</h2>
              <p className="text-muted-foreground font-medium">Updates from the world of precision beekeeping.</p>
            </div>

            <div className="space-y-6">
              {(pressReleases.length > 0 ? pressReleases : fallbackPress).map((release, index) => (
                <Card key={index} className="border-none shadow-soft hover:shadow-glow transition-all p-8 bg-white group cursor-pointer">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      {typeof release !== 'string' && (
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant="secondary" className="font-bold">{release.source_name}</Badge>
                          <span className="text-xs font-bold text-muted-foreground uppercase">{release.published_date}</span>
                        </div>
                      )}
                      <h3 className="text-2xl font-black group-hover:text-primary transition-colors leading-tight">
                        {typeof release === 'string' ? release : release.title}
                      </h3>
                      <p className="text-muted-foreground mt-4 font-medium line-clamp-2">
                        {typeof release !== 'string' ? release.description : "BeeYield continues to lead the way in sustainable agriculture through IoT innovation."}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all scale-0 group-hover:scale-100 shrink-0">
                      <ArrowRight />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-32 bg-primary text-white text-center">
        <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8">For Press Inquiries</h2>
        <Button size="lg" className="h-16 px-12 text-xl font-black bg-white text-primary hover:bg-white/90" asChild>
          <a href="mailto:press@beeyield.com">Get in Touch</a>
        </Button>
      </section>
    </div>
  );
};

export default Media;