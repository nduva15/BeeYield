
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sprout, Droplets, TreePine, Bug, Download, ArrowRight, Loader2, Check } from "lucide-react";
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
      <div className="container mx-auto px-4 py-24">
        <div className="mb-20 text-center space-y-6">
          <Badge variant="outline" className="text-primary border-primary px-4 py-1">Environment & Sustainability</Badge>
          <h1 className="text-display-xl md:text-display-2xl font-black text-foreground tracking-tightest leading-tight">
            Our Environmental <span className="text-primary italic">Impact</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground font-medium">
            Every jar of BeeYield contributes to a healthier planet and thriving bee populations through our data-driven conservation efforts.
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
            className="mb-12 mt-8 inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-primary-foreground font-black hover:shadow-glow transition-all shadow-xl text-lg"
          >
            <Download className="h-6 w-6" />
            Download 2024 Impact Report
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

            <div className="mb-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => {
                const IconComp = getIcon(stat.icon || '');
                return (
                  <Card key={index} className="text-center glass-dark sm:glass border-none shadow-soft hover:shadow-glow transition-all duration-500 hover:-translate-y-2">
                    <CardContent className="p-8">
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 shadow-inner">
                        <IconComp className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="mb-2 text-4xl font-black text-foreground tracking-tighter">{stat.stat_value}</h3>
                      <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">{stat.stat_label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mb-12 text-center space-y-4">
              <Badge variant="outline" className="text-primary tracking-widest uppercase text-xs">Stories from the Field</Badge>
              <h2 className="text-5xl font-black text-foreground tracking-tightest leading-none">Impact Stories</h2>
            </div>
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 mb-24">
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

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-24">
          <Card className="lg:col-span-1 flex flex-col border-none shadow-soft glass hover:shadow-glow transition-all duration-500">
            <CardContent className="p-8 flex flex-col flex-grow">
              <h3 className="mb-4 text-2xl font-black text-foreground tracking-tight font-heading">Pollinator Protection</h3>
              <p className="mb-6 text-muted-foreground text-sm font-medium leading-relaxed">
                We're committed to protecting bee populations through sustainable beekeeping practices and habitat conservation.
              </p>
              <div className="space-y-6 flex-grow">
                {esgMetrics.filter(m => m.category === 'environmental').map((m, i) => (
                  <div key={i}>
                    <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="text-foreground">{m.metric_name}</span>
                      <span className="text-primary">{m.metric_value}{m.metric_unit}</span>
                    </div>
                    <Progress value={Math.min(100, m.metric_value)} className="h-2 bg-muted/30" />
                  </div>
                ))}
              </div>
              <Link to="/commitment" className="mt-8 inline-flex items-center gap-2 text-primary hover:text-honey-dark font-black text-sm uppercase tracking-widest transition-colors">
                Read Detailed Commitment <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 flex flex-col border-none shadow-soft glass hover:shadow-glow transition-all duration-500">
            <CardContent className="p-8 flex flex-col flex-grow">
              <h3 className="mb-4 text-2xl font-black text-foreground tracking-tight font-heading">Community Impact</h3>
              <div className="space-y-4 text-muted-foreground text-sm font-medium flex-grow leading-relaxed">
                <p>
                  Beyond environmental conservation, BeeYield is dedicated to supporting local beekeeping communities.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    Fair trade pricing ensuring sustainable livelihoods
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    Educational programs for new beekeepers
                  </li>
                </ul>
              </div>
              <Link to="/commitment" className="mt-8 inline-flex items-center gap-2 text-primary hover:text-honey-dark font-black text-sm uppercase tracking-widest transition-colors">
                Community Reports <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground lg:col-span-1 flex flex-col shadow-glow shadow-primary/30 border-none rounded-[2rem] overflow-hidden">
            <CardContent className="p-8 flex flex-col flex-grow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <h3 className="mb-6 text-2xl font-black font-heading tracking-tight">Our 2030 Goals</h3>
              <ul className="space-y-4 flex-grow text-sm font-black uppercase tracking-widest">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                  Protect 10,000 Hives
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                  Plant 10k Native Flowers
                </li>
              </ul>
              <Link
                to="/global-hive-network"
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
              <Link to="/esg" className="mt-auto inline-flex items-center gap-2 text-primary hover:underline font-bold text-sm">
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
