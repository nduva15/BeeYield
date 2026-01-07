
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sprout, Droplets, TreePine, Bug, Download, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCompanyStats, getImpactStories, CompanyStat, ImpactStory } from "@/services/companyService";
import { getESGMetrics, ESGMetric } from "@/services/servicesService";

const Impact = () => {
  const [stats, setStats] = useState<CompanyStat[]>([]);
  const [stories, setStories] = useState<ImpactStory[]>([]);
  const [esgMetrics, setEsgMetrics] = useState<ESGMetric[]>([]);
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
        const [fetchedStats, fetchedStories, fetchedMetrics] = await Promise.all([
          getCompanyStats(),
          getImpactStories(),
          getESGMetrics()
        ]);
        setStats(fetchedStats);
        setStories(fetchedStories);
        setEsgMetrics(fetchedMetrics);
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

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'bug': return Bug;
      case 'treepine': return TreePine;
      case 'droplets': return Droplets;
      case 'sprout': return Sprout;
      case 'hexagon': return Bug; // Fallback
      case 'users': return Sprout; // Fallback
      case 'flower': return Sprout; // Fallback
      default: return Bug;
    }
  };

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
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
            Our Environmental Impact
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Every jar of BeeYield contributes to a healthier planet and thriving bee populations.
          </p>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/impact-report.pdf';
              link.download = 'BeeYield-Impact-Report.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="mb-12 mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-lg"
          >
            <Download className="h-5 w-5" />
            Download Our Impact Report
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="relative mb-16 overflow-hidden rounded-2xl shadow-xl group">
              <img
                src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1600&auto=format&fit=crop&q=80"
                alt="Impact"
                className="h-[400px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>

            <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => {
                const IconComp = getIcon(stat.icon || '');
                return (
                  <Card key={index} className="text-center border-none shadow-soft hover:shadow-glow transition-all">
                    <CardContent className="pt-6">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <IconComp className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="mb-2 text-3xl font-bold text-foreground">{stat.stat_value}</h3>
                      <p className="text-muted-foreground font-medium">{stat.stat_label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <h2 className="text-3xl font-bold mb-8 text-center">Impact Stories</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
              {stories.map((story) => (
                <Card key={story.id} className="overflow-hidden border-none shadow-soft hover:shadow-glow transition-all">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={story.image_url || "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800"}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      alt={story.title}
                    />
                    <Badge className="absolute top-4 right-4 bg-primary/90">{story.impact_type}</Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{story.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{story.summary}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-bold">{story.beneficiaries_count} Beneficiaries</span>
                      <Link to={`/impact/${story.slug}`} className="text-primary hover:underline text-sm font-semibold flex items-center gap-1">
                        Read Story <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="lg:col-span-1 flex flex-col border-none shadow-soft">
            <CardContent className="p-6 flex flex-col flex-grow">
              <h3 className="mb-4 text-xl font-bold text-foreground">Pollinator Protection</h3>
              <p className="mb-6 text-muted-foreground text-sm">
                We're committed to protecting bee populations through sustainable beekeeping practices and habitat conservation.
              </p>
              <div className="space-y-4 flex-grow">
                {esgMetrics.filter(m => m.category === 'environmental').map((m, i) => (
                  <div key={i}>
                    <div className="mb-2 flex justify-between text-xs font-medium">
                      <span className="text-foreground">{m.metric_name}</span>
                      <span className="text-primary">{m.metric_value}{m.metric_unit}</span>
                    </div>
                    <Progress value={Math.min(100, m.metric_value)} className="h-1.5" />
                  </div>
                ))}
              </div>
              <Link to="/commitment" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline font-bold text-sm">
                Read More <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 flex flex-col border-none shadow-soft">
            <CardContent className="p-6 flex flex-col flex-grow">
              <h3 className="mb-4 text-xl font-bold text-foreground">Community Impact</h3>
              <div className="space-y-4 text-muted-foreground text-sm flex-grow">
                <p>
                  Beyond environmental conservation, BeeYield is dedicated to supporting local beekeeping communities.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    Fair trade pricing ensuring sustainable livelihoods
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    Educational programs for new beekeepers
                  </li>
                </ul>
              </div>
              <Link to="/commitment" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline font-bold text-sm">
                Read More <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground lg:col-span-1 flex flex-col shadow-glow">
            <CardContent className="p-6 flex flex-col flex-grow">
              <h3 className="mb-4 text-xl font-bold">Our 2030 Goals</h3>
              <ul className="space-y-3 flex-grow text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  Protect 10,000 additional beehives
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  Plant 10,000 native flowering plants
                </li>
              </ul>
              <Link
                to="/GlobalHiveNetwork"
                className="mt-6 inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all text-sm justify-center"
              >
                Join Our Global Hive Network <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 flex flex-col border-none shadow-soft">
            <CardContent className="p-6 flex flex-col flex-grow">
              <h3 className="mb-4 text-xl font-bold text-foreground">ESG Commitment</h3>
              <p className="mb-4 text-muted-foreground text-sm">
                Environmental, Social, and Governance principles guide everything we do at BeeYield.
              </p>
              <Link to="/ESG" className="mt-auto inline-flex items-center gap-2 text-primary hover:underline font-bold text-sm">
                Explore Our ESG Framework <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Full-width Video Section */}
        <div className="relative mt-16 overflow-hidden rounded-2xl shadow-2xl h-[70vh]">
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="About BeeYield"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default Impact;
