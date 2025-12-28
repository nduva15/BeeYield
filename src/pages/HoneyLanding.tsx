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
import { Leaf, Heart, Shield, ArrowRight, Droplets, TreePine, Check, QrCode, MapPin, Award, ShoppingCart } from "lucide-react";
import heroImage from "@/assets/hero-honey.jpg";

const Home = () => {
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
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});

  const features = [
    {
      icon: Leaf,
      title: "100% Raw & Unfiltered",
      description: "Pure honey straight from the hive. No heating, no processing, no additives. Just nature's golden gift.",
    },
    {
      icon: Heart,
      title: "Bee-First Philosophy",
      description: "We harvest only 50% of honey produced, leaving the rest for our bees to thrive naturally.",
    },
    {
      icon: Shield,
      title: "Full Traceability",
      description: "Every jar comes with a QR code. Know exactly where your honey comes from, hive to home.",
    },
    {
      icon: TreePine,
      title: "Ecosystem Restoration",
      description: "2,500+ trees planted. Every purchase supports reforestation in Kibwezi, Kenya.",
    },
  ];

  const products = [
    {
      id: 1,
      name: "Kibwezi Wildflower",
      description: "Pure honey from the diverse wildflower meadows of Makueni",
      variants: [
        { size: "250g", price: 850 },
        { size: "500g", price: 1500 },
        { size: "1kg", price: 2800 },
      ],
      tag: "Bestseller",
      rating: 4.9,
      reviews: 127,
    },
    {
      id: 2,
      name: "Acacia Gold",
      description: "Light, crystalline honey with a delicate sweet flavor",
      variants: [
        { size: "250g", price: 950 },
        { size: "500g", price: 1700 },
        { size: "1kg", price: 3200 },
      ],
      tag: "Premium",
      rating: 4.8,
      reviews: 89,
    },
    {
      id: 3,
      name: "Forest Dark",
      description: "Rich, robust honey from mountain forest blossoms",
      variants: [
        { size: "250g", price: 900 },
        { size: "500g", price: 1600 },
        { size: "1kg", price: 3000 },
      ],
      tag: "Rich",
      rating: 4.7,
      reviews: 64,
    },
  ];

  const getSelectedPrice = (product: typeof products[0]) => {
    const selectedSize = selectedSizes[product.id] || product.variants[0].size;
    const variant = product.variants.find(v => v.size === selectedSize);
    return variant ? variant.price : product.variants[0].price;
  };
  const stats = [
    { value: "184+", label: "Active Hives" },
    { value: "50%", label: "Left for Bees" },
    { value: "2,500+", label: "Trees Planted" },
    { value: "100%", label: "Traceable" },
  ];

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
      <section className="relative min-h-[90vh] overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Pure honey"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl space-y-8">
            <Badge className="bg-primary/10 text-primary border-primary/30 text-sm px-4 py-2">
              🍯 Sustainably Harvested from Kenya
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight text-foreground">
              Honey That
              <span className="text-primary block">Gives Back</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              We harvest only 50% of what our bees produce, 
              leaving the rest for them to thrive. Every jar is fully traceable from hive to your home.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop">
                <Button size="lg" className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 font-semibold shadow-2xl">
                  Shop Our Honey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/traceability">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary/10 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                  Trace Your Jar
                </Button>
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-border">
              {stats.map((stat, index) => (
                <div key={index} className="text-center sm:text-left">
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30">
              Why BeeYield Honey
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Not Just Honey. <span className="text-primary">A Promise.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              When you choose BeeYield, you're choosing honey that respects the bees, the land, and the future.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all bg-card">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="mb-6 inline-block rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 50% Harvest / Traceability Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="honey-hex" x="0" y="0" width="10" height="8.66" patternUnits="userSpaceOnUse">
              <polygon points="5,0 10,2.89 10,8.66 5,11.55 0,8.66 0,2.89" fill="none" stroke="currentColor" strokeWidth="0.3"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honey-hex)"/>
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-6xl mx-auto">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                Our Commitment
              </Badge>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                We Only Take <span className="text-primary">Half.</span>
              </h2>
              
              <p className="text-base sm:text-xl text-muted-foreground leading-relaxed">
                Most commercial honey operations take everything. We do things differently. 
                At BeeYield, we harvest only 50% of the honey our bees produce. The other half stays 
                exactly where it belongs: with the bees who made it.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Healthier Colonies</h4>
                    <p className="text-muted-foreground">Bees with adequate honey reserves are stronger, more resilient, and live longer.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Better Pollination</h4>
                    <p className="text-muted-foreground">Thriving bees pollinate more effectively, supporting local farmers and ecosystems.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Full Transparency</h4>
                    <p className="text-muted-foreground">Every jar is traceable. Scan the QR code to see exactly where your honey came from.</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <Link to="/traceability">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                    Learn More About Our Process
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-green-500/10 rounded-3xl p-4 sm:p-8 border border-primary/20">
                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                  <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-lg text-center">
                    <Droplets className="h-8 sm:h-12 w-8 sm:w-12 text-primary mx-auto mb-2 sm:mb-4" />
                    <p className="text-2xl sm:text-4xl font-bold text-primary mb-1 sm:mb-2">50%</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Harvested for You</p>
                  </div>
                  <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-lg text-center">
                    <span className="text-2xl sm:text-4xl mb-2 sm:mb-4 block">🐝</span>
                    <p className="text-2xl sm:text-4xl font-bold text-green-600 mb-1 sm:mb-2">50%</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Left for the Bees</p>
                  </div>
                  <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-lg text-center">
                    <QrCode className="h-8 sm:h-12 w-8 sm:w-12 text-primary mx-auto mb-2 sm:mb-4" />
                    <p className="text-lg sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Traceable</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Hive to Home</p>
                  </div>
                  <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-lg text-center">
                    <MapPin className="h-8 sm:h-12 w-8 sm:w-12 text-primary mx-auto mb-2 sm:mb-4" />
                    <p className="text-lg sm:text-xl font-bold text-foreground mb-1 sm:mb-2">Makueni</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Kenya, Africa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30">
              Our Collection
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Premium <span className="text-primary">Artisan Honey</span>
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Hand-harvested, raw, and unfiltered. Each variety tells a unique story of its origin.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-square bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/10 flex items-center justify-center overflow-hidden">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 opacity-80 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">🍯</span>
                  </div>
                  <Badge className="absolute top-4 left-4 bg-primary text-white">
                    {product.tag}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < Math.floor(product.rating) ? 'text-amber-400' : 'text-muted'}`}>★</span>
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">({product.rating})</span>
                    <span className="text-xs text-muted-foreground ml-1">· {product.reviews} reviews</span>
                  </div>
                  <h3 className="mb-1 text-xl font-bold text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                  
                  {/* Size Selection */}
                  <div className="space-y-3">
                    <Select
                      value={selectedSizes[product.id] || product.variants[0].size}
                      onValueChange={(value) => setSelectedSizes({ ...selectedSizes, [product.id]: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.map((variant) => (
                          <SelectItem key={variant.size} value={variant.size}>
                            {variant.size} - KES {variant.price.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <p className="text-center">
                      <span className="text-2xl font-medium text-primary">KES {getSelectedPrice(product).toLocaleString()}</span>
                    </p>
                    
                    <div className="pt-2">
                      <Link to="/shop">
                        <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-white">
                          <ShoppingCart className="h-4 w-4" />
                          View Options
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 sm:mt-16 text-center">
            <Link to="/shop">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary/10">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 sm:left-20 w-32 sm:w-64 h-32 sm:h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 sm:right-20 w-40 sm:w-80 h-40 sm:h-80 bg-accent/50 rounded-full blur-3xl" />
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <Award className="h-12 sm:h-16 w-12 sm:w-16 text-white/80 mx-auto" />
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white">
              Taste the Difference. Support the Bees.
            </h2>
            <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto">
              Every jar of BeeYield honey is a commitment to ethical beekeeping, 
              environmental restoration, and uncompromising quality.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link to="/shop">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 font-semibold shadow-xl">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/traceability">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-transparent">
                  Learn About Traceability
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
