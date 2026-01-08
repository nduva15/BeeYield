import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Check, TrendingUp, Shield, BarChart3, ArrowRight,
    Cpu, Eye, Zap, Target, Leaf, Award, Clock, Users,
    Activity, Database, Radio, Smartphone, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

const PollinationServices = () => {
    const crops = [
        { name: "Maize", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400" },
        { name: "Sisal", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400" },
        { name: "Mangoes", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400" },
        { name: "Beans", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400" },
        { name: "Sunflower", image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=400" },
        { name: "Oranges", image: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=400" },
        { name: "Vegetables", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400" },
        { name: "Tomatoes", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400" },
        { name: "Onions", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa829?auto=format&fit=crop&q=80&w=400" },
    ];

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
            icon: Award,
            title: "Guaranteed Results",
            description: "We stake our reputation on measurable yield improvements for your harvest."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary via-primary to-accent">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-honey-light rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse delay-1000" />
                        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-honey-dark rounded-full blur-3xl animate-pulse delay-500" />
                    </div>
                    {/* Honeycomb Pattern */}
                    <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <pattern id="honeycomb-hero" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
                            <polygon points="10,0 20,5.77 20,17.32 10,23.09 0,17.32 0,5.77" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#honeycomb-hero)" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-white space-y-8">
                            <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2">
                                🐝 East Africa's Premier Pollination Partner
                            </Badge>

                            <h1 className="text-display-xl md:text-display-2xl font-black leading-none tracking-tightest">
                                Where
                                <span className="text-honey-light block italic">Technology</span>
                                Meets the
                                <span className="text-honey-light block">Hive</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-white/90 max-w-lg leading-relaxed font-medium">
                                We don't just bring bees to your fields. We bring intelligence, precision, and
                                a promise — every flower visited, every yield maximized, every harvest transformed.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link to="/pollination-request">
                                    <Button size="lg" className="bg-background text-primary hover:bg-accent/20 text-lg px-8 py-6 font-black shadow-2xl rounded-2xl">
                                        Start Your Journey
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link to="/pollination-solutions">
                                    <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 bg-transparent font-black rounded-2xl">
                                        See How It Works
                                    </Button>
                                </Link>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                                <div>
                                    <p className="text-4xl md:text-5xl font-black text-honey-light tracking-tightest">35%</p>
                                    <p className="text-white/70 text-2xs md:text-xs font-black uppercase tracking-widest">Yield Increase</p>
                                </div>
                                <div>
                                    <p className="text-4xl md:text-5xl font-black text-honey-light tracking-tightest">150+</p>
                                    <p className="text-white/70 text-2xs md:text-xs font-black uppercase tracking-widest">Managed Hives</p>
                                </div>
                                <div>
                                    <p className="text-4xl md:text-5xl font-black text-honey-light tracking-tightest">24/7</p>
                                    <p className="text-white/70 text-2xs md:text-xs font-black uppercase tracking-widest">Monitoring</p>
                                </div>
                            </div>
                        </div>

                        {/* Hero Visual */}
                        <div className="hidden lg:block relative">
                            <div className="relative w-full aspect-square">
                                {/* Central Hexagon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-[30rem] h-[30rem] bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-md rounded-[5rem] rotate-12 border border-white/20 shadow-premium overflow-hidden">
                                        <img
                                            src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800"
                                            alt="Bee pollinating"
                                            className="w-full h-full object-cover -rotate-12 scale-110"
                                        />
                                    </div>
                                </div>
                                {/* Floating Elements */}
                                <div className="absolute top-10 right-10 bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 animate-float shadow-2xl">
                                    <Activity className="h-10 w-10 text-honey-light" />
                                </div>
                                <div className="absolute bottom-20 left-0 bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 animate-float-delayed shadow-2xl">
                                    <Smartphone className="h-10 w-10 text-honey-light" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest">Discover</span>
                        <ArrowRight className="h-5 w-5 rotate-90" />
                    </div>
                </div>
            </section>

            {/* The Story Section */}
            <section className="py-32 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-10">
                        <Badge variant="outline" className="text-primary border-primary px-4 py-1">
                            Our Philosophy
                        </Badge>
                        <h2 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-none">
                            Pollination is <span className="text-primary italic">Art</span> <br /> and a <span className="text-primary italic">Science</span>
                        </h2>
                        <p className="text-2xl text-muted-foreground leading-relaxed font-medium">
                            For centuries, farmers relied on hope and good weather. Bees came, bees went,
                            and harvests were a mystery until the day of picking. <strong>We changed that story.</strong>
                        </p>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            At BeeYield, we've merged the ancient wisdom of beekeeping with cutting-edge IoT technology.
                            Every hive tells a story. Every bee's journey is mapped. Every flower's fate is known.
                            This isn't just pollination — it's <span className="text-primary font-black">precision agriculture</span> at its finest.
                        </p>
                    </div>
                </div>
            </section>

            {/* Two Pollination Types Section */}
            <section className="py-32 bg-muted/20 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-24 space-y-4">
                        <Badge variant="outline" className="text-primary border-primary">
                            Our Solutions
                        </Badge>
                        <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">
                            Two Paths to <span className="text-primary italic">Perfection</span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                            Choose the approach that fits your operation, or combine both for complete visibility.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        {/* In-Hive Precision */}
                        <Card className="group relative overflow-hidden border-none shadow-premium bg-white dark:bg-card rounded-[3rem] transition-all duration-700 hover:-translate-y-2 hover:shadow-glow">
                            <CardContent className="p-12 md:p-16 relative z-10 h-full flex flex-col">
                                <div className="flex items-start gap-8">
                                    <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Cpu className="h-12 w-12 text-primary" />
                                    </div>
                                    <div className="space-y-6 flex-1">
                                        <h3 className="text-4xl font-black text-foreground tracking-tight">In-Hive <br /> Precision</h3>
                                        <p className="text-lg text-muted-foreground leading-relaxed font-semibold">
                                            Smart sensors inside every hive monitor colony strength, population,
                                            and activity levels. Know exactly what you're paying for.
                                        </p>
                                        <ul className="space-y-3">
                                            {["Real-time colony metrics", "Bee count verification", "Acoustic health alerts"].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-black">
                                                    <Check className="h-5 w-5 text-primary" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link to="/precision-pollination">
                                            <Button className="mt-8 bg-primary hover:bg-primary/90 text-white font-black px-10 h-16 text-lg rounded-2xl shadow-glow">
                                                Explore In-Hive Tech
                                                <ArrowRight className="ml-2 h-6 w-6" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* In-Field Insights */}
                        <Card className="group relative overflow-hidden border-none shadow-premium bg-white dark:bg-card rounded-[3rem] transition-all duration-700 hover:-translate-y-2 hover:shadow-glow">
                            <CardContent className="p-12 md:p-16 relative z-10 h-full flex flex-col">
                                <div className="flex items-start gap-8">
                                    <div className="w-24 h-24 rounded-3xl bg-nature-green/10 flex items-center justify-center flex-shrink-0">
                                        <Eye className="h-12 w-12 text-nature-green" />
                                    </div>
                                    <div className="space-y-6 flex-1">
                                        <h3 className="text-4xl font-black text-foreground tracking-tight">In-Field <br /> Insights</h3>
                                        <p className="text-lg text-muted-foreground leading-relaxed font-semibold">
                                            Measure actual bee activity across your crops. See which areas are pollinated
                                            and identify gaps in real-time.
                                        </p>
                                        <ul className="space-y-3">
                                            {["Flower visitation tracking", "Pollination heatmaps", "Weather correlation data"].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-black text-nature-green">
                                                    <Check className="h-5 w-5" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link to="/in-land-pollination">
                                            <Button className="mt-8 bg-secondary hover:bg-secondary/90 text-white font-black px-10 h-16 text-lg rounded-2xl shadow-glow">
                                                Explore Field Insights
                                                <ArrowRight className="ml-2 h-6 w-6" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* The BeeYield Difference */}
            <section className="py-32 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-24 space-y-4">
                        <Badge className="bg-honey-light text-honey-dark dark:bg-honey-dark/30 dark:text-honey-light px-6">
                            The Standard
                        </Badge>
                        <h2 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter">
                            The <span className="text-primary italic">Difference</span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
                            We bring a complete ecosystem of technology, expertise, and accountability
                            that transforms your pollination from a gamble into a guarantee.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {differences.map((diff, index) => (
                            <Card key={index} className="group bg-muted/5 border-none hover:bg-white dark:hover:bg-gray-900 hover:shadow-premium transition-all duration-500 rounded-[2.5rem] p-4">
                                <CardContent className="p-8">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                        <diff.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight">{diff.title}</h3>
                                    <p className="text-muted-foreground font-medium leading-relaxed">{diff.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Crops Section */}
            <section className="py-32 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-24 space-y-4">
                        <Badge variant="outline" className="text-primary">Our Expertise</Badge>
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter">Crops We <span className="text-primary italic">Transform</span></h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
                        {crops.map((crop, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-[3rem] aspect-square cursor-pointer shadow-premium"
                            >
                                <img
                                    src={crop.image}
                                    alt={crop.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <h3 className="text-white font-black text-2xl group-hover:text-amber-300 transition-colors tracking-tighter">
                                        {crop.name}
                                    </h3>
                                    <p className="text-white/60 text-xs font-black uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-all underline decoration-amber-300">View Data</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-32 relative overflow-hidden bg-primary text-white rounded-[5rem] mx-4 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-honey-dark to-accent opacity-90" />
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-honey-light/20 rounded-full blur-[120px] -mr-32 -mt-32" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center space-y-12">
                    <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-none">
                        Ready for <br /> Real <span className="text-amber-300 italic">Results?</span>
                    </h2>
                    <p className="text-2xl text-white/80 max-w-3xl mx-auto font-medium">
                        Join the global network of high-yield growers who've stopped guessing
                        and started growing with data.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link to="/contact">
                            <Button size="lg" className="bg-white text-primary hover:bg-honey-light/90 text-2xl font-black h-24 px-16 rounded-[2rem] shadow-2xl">
                                Get Your Custom Plan
                            </Button>
                        </Link>
                    </div>
                    <p className="text-white/40 text-xs font-black uppercase tracking-widest">Global Support • Real-time Data • Guaranteed Impact</p>
                </div>
            </section>
        </div>
    );
};

export default PollinationServices;
