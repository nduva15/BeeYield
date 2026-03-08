import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Cpu, Sprout, Play, ArrowRight, Heart, TreePine, Home, Hexagon, Leaf, ShoppingBag
} from "lucide-react";
import { Link } from "react-router-dom";
import impactBeekeeping from "@/assets/impact-beekeeping.jpg";
import Logo from "@/assets/Logo.png";
import { getProducts, Product } from "@/services/shopService";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { BrandedProductImage } from "@/components/BrandedProductImage";
import { useState, useEffect } from "react";

const OurStory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts('honey');
        setProducts(data.slice(0, 2)); // Just the top 2 Acacia products
      } catch (err) {
        console.error("Error loading story products:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    const variant = product.variants[0]; // Default to first variant
    if (!variant) return;

    addToCart({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      description: product.description,
      size: variant.size,
      price: variant.price_kes,
      quantity: 1,
      category: product.category,
      badge: product.badge,
      image: product.images[0] || "/placeholder.svg"
    });
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Premium Editorial */}
      <section className="relative py-24 sm:py-32 overflow-hidden bg-neutral-50/50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#10b981]/[0.03] -skew-x-12 translate-x-32 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-[#facc15]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <Badge className="bg-[#10b981]/10 text-[#064e3b] mb-8 hover:bg-[#10b981]/20 transition-colors uppercase tracking-[0.3em] font-black text-[10px] px-5 py-2 rounded-full border border-[#10b981]/20 shadow-sm">
                <Sprout className="w-3.5 h-3.5 mr-2" />
                Rooted in Kenya
              </Badge>

              <h1 className="text-6xl md:text-8xl font-black text-[#064e3b] mb-10 tracking-tighter leading-[0.85] uppercase">
                The Story of <span className="text-[#facc15] block italic">BeeYield.</span>
              </h1>

              <p className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-2xl mx-auto lg:mx-0 leading-tight font-bold uppercase tracking-tight">
                Born in Kibwezi, Makueni County. A story of family, resilience, and a mission to improve pollination for a sustainable future.
              </p>
            </div>

            <div className="relative mx-auto lg:ml-auto max-w-md lg:max-w-full flex justify-center">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#10b981] to-[#facc15] opacity-20 blur-2xl rounded-full" />
              <img
                src={Logo}
                alt="BeeYield Logo"
                className="relative w-full max-w-[400px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-neutral-100 flex items-center gap-4">
                <div className="p-3 bg-[#10b981]/10 rounded-xl text-[#064e3b]">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-900">Local Roots</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#facc15]">Kenya Grown</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="relative group rounded-[3rem] overflow-hidden">
                <div className="absolute inset-0 bg-[#064e3b]/10 transform -rotate-2 group-hover:rotate-0 transition-transform duration-500 z-10" />
                <img
                  src={impactBeekeeping}
                  alt="Early days in Kibwezi"
                  className="relative rounded-[3rem] shadow-2xl w-full object-cover h-[500px] hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Quote Card */}
                <Card className="absolute -bottom-8 -right-8 w-[90%] sm:w-[80%] shadow-2xl border-white/20 bg-white/90 backdrop-blur-md rounded-[2rem] z-20">
                  <CardContent className="p-8">
                    <div className="flex gap-4 items-start">
                      <div className="text-6xl text-[#facc15] font-serif leading-none mt-2">"</div>
                      <blockquote className="text-xl font-bold text-neutral-800 leading-snug">
                        Sometimes, the spark for something big comes from boredom, family, and a little bit of courage.
                      </blockquote>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8 lg:pl-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-1 bg-[#facc15] rounded-full" />
                <p className="text-[10px] font-black text-[#064e3b] uppercase tracking-[0.4em]">Kibwezi • 2020</p>
              </div>

              <h2 className="text-5xl font-black text-neutral-900 tracking-tighter leading-none uppercase">
                A Pandemic Spark,<br /><span className="text-[#10b981]">A Family Mission.</span>
              </h2>

              <div className="space-y-6 text-neutral-600 text-lg font-medium leading-relaxed">
                <p>
                  In 2020, as the world slowed down during the COVID pandemic, <strong className="text-neutral-900 font-black">Timothy Nduva</strong> found himself restless in rural Kibwezi, Kenya. While attending Strathmore University, Timothy's curiosity and drive for innovation grew. The unique challenges of the pandemic became the spark that ignited BeeYield's vision for scalable, tech-driven beekeeping solutions.
                </p>
                <p>
                  But BeeYield was never a solo journey. Timothy's sisters, <strong className="text-neutral-900 font-black">Agatha</strong> and <strong className="text-neutral-900 font-black">Carole</strong>, brought their own unique skills—ranging from web development and product design to IoT research. Together, the siblings transformed a small family apiary into a platform for technological advancement and agricultural impact.
                </p>
                <p className="font-bold text-[#064e3b]">
                  What began with just half an acre and four hives quickly became a family mission to empower farmers, advance pollination, and prove that innovation can flourish anywhere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Journey - Premium Stat Cards */}
      <section className="bg-neutral-900 py-24 rounded-t-[4rem] relative overflow-hidden mt-12">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#facc15]/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#10b981]/10 to-transparent pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">
              From <span className="text-[#facc15]">4</span> to <span className="text-[#10b981]">184 Hives</span>
            </h2>
            <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm max-w-2xl mx-auto">
              What began on half an acre has grown into a thriving 5-acre apiary, fenced and flourishing.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { number: "184+", label: "Beehives", desc: "Monitored Colonies" },
              { number: "1M+", label: "Bees", desc: "Thriving Population" },
              { number: "2.5K+", label: "Trees", desc: "Planted for Habitat" },
              { number: "25+", label: "Acres", desc: "Client Land Pollinated" },
            ].map((stat, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-md rounded-[2.5rem] hover:bg-white/10 transition-colors text-center shadow-none">
                <CardContent className="p-8">
                  <p className="text-5xl font-black text-[#facc15] mb-2">{stat.number}</p>
                  <p className="text-lg font-black text-white uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center gap-4 justify-center mb-6">
              <div className="w-12 h-1 bg-[#10b981] rounded-full" />
              <p className="text-[10px] font-black text-[#064e3b] uppercase tracking-[0.4em]">Core Values</p>
              <div className="w-12 h-1 bg-[#10b981] rounded-full" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 uppercase tracking-tighter">
              Who We Are
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Family-Driven",
                desc: "Built by siblings Timothy, Agatha, and Carole — combining passion with purpose under one shared vision."
              },
              {
                icon: Sprout,
                title: "Guardians of Nature",
                desc: "With 2,500+ trees planted, we're ecosystem builders committed to environmental restoration."
              },
              {
                icon: Cpu,
                title: "Precision Focus",
                desc: "Using technology and IoT sensors to maximize impact for farmers across Kenya."
              }
            ].map((item, i) => (
              <Card key={i} className="group border-none shadow-md hover:shadow-xl rounded-[3rem] transition-all bg-white hover:bg-neutral-50">
                <CardContent className="p-10 text-center">
                  <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-[#10b981]/10 text-[#064e3b] transition-colors group-hover:bg-[#064e3b] group-hover:text-white">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-4 text-2xl font-black text-neutral-900 uppercase tracking-tighter">{item.title}</h3>
                  <p className="text-neutral-600 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shop the Harvest Section - New Integration */}
      <section className="py-24 bg-neutral-50/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-1 bg-[#facc15] rounded-full" />
                <p className="text-[10px] font-black text-[#064e3b] uppercase tracking-[0.4em]">The Result of Our Mission</p>
              </div>
              <h2 className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-[0.9]">
                Shop the <span className="text-[#10b981]">Harvest.</span>
              </h2>
              <p className="text-neutral-600 font-bold uppercase tracking-tight mt-6">
                Directly supporting our 5-acre apiary in Kibwezi. Experience the clarity and purity of real Acacia honey.
              </p>
            </div>
            <Button asChild variant="link" className="text-[#064e3b] font-black uppercase tracking-widest text-xs h-auto p-0 flex items-center gap-2 group">
              <Link to="/shop">
                View Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {products.length > 0 ? products.map((product) => (
              <Card key={product.id} className="group overflow-hidden border-none bg-white rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                  <div className="sm:w-1/2 aspect-square relative overflow-hidden bg-neutral-100">
                    <BrandedProductImage
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.badge && (
                      <Badge className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-[#064e3b] border-none shadow-sm uppercase font-black tracking-widest text-[9px]">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="sm:w-1/2 p-8 sm:p-10 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter mb-4 leading-none">
                        {product.name}
                      </h3>
                      <p className="text-neutral-500 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                        {product.description}
                      </p>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[#064e3b]">
                          KES {product.variants[0]?.price_kes.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                          / {product.variants[0]?.size || "500g"}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="w-full h-14 bg-[#064e3b] hover:bg-[#10b981] text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all group shadow-lg"
                      >
                        Add to Cart
                        <ShoppingBag className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              // Fallback skeleton or loader
              [1, 2].map((i) => (
                <div key={i} className="h-80 bg-neutral-100 animate-pulse rounded-[3rem] border border-neutral-200" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <Card className="bg-[#064e3b] text-white border-none shadow-2xl rounded-[4rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/20 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#facc15]/10 rounded-full blur-[100px] -ml-32 -mb-32" />

            <CardContent className="p-16 md:p-24 text-center relative z-10">
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-8">
                Join Us on Our <span className="text-[#facc15] italic">Journey</span>
              </h2>
              <p className="text-[#10b981] font-bold tracking-widest uppercase text-sm md:text-base max-w-2xl mx-auto mb-12">
                From a family dream in rural Kenya to a growing presence in pollination services — partner with us to improve agriculture.
              </p>

              <Button asChild size="lg" className="h-16 px-10 bg-[#facc15] text-[#064e3b] hover:bg-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all">
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default OurStory;

