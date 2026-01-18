import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Check, TrendingUp, Shield, BarChart3, ArrowRight,
    Cpu, Eye, Zap, Target, Leaf, Award, Clock, Users,
    Activity, Database, Radio, Smartphone, ChevronRight, Globe
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
        { name: "Onions", image: "/images/onion-plantation.png" },
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
            {/* Hero Section - Mobile Responsive */}
            <section className="relative min-h-[100svh] sm:min-h-[90vh] flex items-center overflow-hidden py-16 sm:py-20 md:py-24">
                {/* Animated Background */}
                {/* Animated Background */}
                <div className="absolute inset-0 bg-[#F0F7F0]">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-40 sm:w-72 h-40 sm:h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-64 h-32 sm:h-64 bg-green-100/50 rounded-full blur-3xl animate-pulse delay-500" />
                    </div>
                    {/* Honeycomb Pattern */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <pattern id="honeycomb-hero" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
                            <polygon points="10,0 20,5.77 20,17.32 10,23.09 0,17.32 0,5.77" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#honeycomb-hero)" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div className="text-neutral-900 space-y-6 sm:space-y-8 text-center lg:text-left">
                            <Badge className="bg-green-100 text-green-900 border-green-200 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 inline-flex font-bold">
                                🐝 East Africa's Premier Pollination Partner
                            </Badge>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.1] tracking-tighter">
                                Where
                                <span className="text-amber-500 block italic">Technology</span>
                                Meets the
                                <span className="text-amber-500 block">Hive</span>
                            </h1>

                            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                                We don't just bring bees to your fields. We bring intelligence, precision, and
                                a promise — every flower visited, every yield maximized, every harvest transformed.
                            </p>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
                                <Link to="/pollination-request" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto bg-green-700 text-white hover:bg-green-800 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 font-black shadow-2xl shadow-green-900/10 rounded-xl sm:rounded-2xl">
                                        Start Your Journey
                                        <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                                    </Button>
                                </Link>
                                <Link to="/pollination-solutions" className="w-full sm:w-auto">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-neutral-300 text-neutral-900 hover:bg-white/50 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-transparent font-black rounded-xl sm:rounded-2xl">
                                        See How It Works
                                    </Button>
                                </Link>
                            </div>

                            {/* Quick Stats - Responsive */}
                            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-8 border-t border-neutral-300/50 font-black">
                                <div className="text-center lg:text-left">
                                    <p className="text-2xl sm:text-3xl md:text-4xl text-green-700 tracking-tighter">35%</p>
                                    <p className="text-neutral-500 text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest">Yield Increase</p>
                                </div>
                                <div className="text-center lg:text-left">
                                    <p className="text-2xl sm:text-3xl md:text-4xl text-green-700 tracking-tighter">150+</p>
                                    <p className="text-neutral-500 text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest">Managed Hives</p>
                                </div>
                                <div className="text-center lg:text-left">
                                    <p className="text-2xl sm:text-3xl md:text-4xl text-green-700 tracking-tighter">24/7</p>
                                    <p className="text-neutral-500 text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest">Active Monitoring</p>
                                </div>
                            </div>
                        </div>

                        {/* Hero Visual - Now visible on mobile too */}
                        <div className="relative mt-8 lg:mt-0">
                            <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-full mx-auto">
                                {/* Central Hexagon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-full max-w-[260px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[30rem] aspect-square bg-gradient-to-br from-amber-100/50 to-orange-100/50 backdrop-blur-md rounded-3xl sm:rounded-[3rem] lg:rounded-[5rem] rotate-6 sm:rotate-12 border border-white/40 shadow-premium overflow-hidden">
                                        <img
                                            src="/images/pollination-hives-hero.png"
                                            alt="Bees pollinating sunflowers with beehives in the background"
                                            className="w-full h-full object-cover -rotate-6 sm:-rotate-12 scale-110"
                                        />
                                    </div>
                                </div>
                                {/* Floating Elements - Hidden on mobile, visible on tablet+ */}
                                <div className="hidden sm:block absolute top-4 sm:top-10 right-0 sm:right-10 bg-white/60 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/50 animate-float shadow-2xl shadow-green-500/10">
                                    <Activity className="h-6 sm:h-10 w-6 sm:w-10 text-green-600" />
                                </div>
                                <div className="hidden sm:block absolute bottom-10 sm:bottom-20 left-0 bg-white/60 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/50 animate-float-delayed shadow-2xl shadow-green-500/10">
                                    <Smartphone className="h-6 sm:h-10 w-6 sm:w-10 text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator - Hidden on very small screens */}
                <div className="hidden sm:flex absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 text-neutral-400 animate-bounce cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest">Discover</span>
                        <ArrowRight className="h-5 w-5 rotate-90" />
                    </div>
                </div>
            </section>

            {/* The Story Section - Mobile Responsive */}
            <section className="py-16 sm:py-24 md:py-32 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-10">
                        <Badge variant="outline" className="text-amber-600 border-amber-300 px-3 sm:px-4 py-1">
                            Our Philosophy
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black text-foreground tracking-tighter leading-tight">
                            Pollination is <span className="text-amber-600 italic">Art</span> <br className="hidden sm:block" /> and a <span className="text-amber-600 italic">Science</span>
                        </h2>
                        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium px-2">
                            For centuries, farmers relied on hope and good weather. Bees came, bees went,
                            and harvests were a mystery until the day of picking. <strong>We changed that story.</strong>
                        </p>
                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-2">
                            At BeeYield, we've merged the ancient wisdom of beekeeping with cutting-edge IoT technology.
                            Every hive tells a story. Every bee's journey is mapped. Every flower's fate is known.
                            This isn't just pollination — it's <span className="text-primary font-black">precision agriculture</span> at its finest.
                        </p>
                    </div>
                </div>
            </section>

            {/* Three Pollination Types Section - Mobile Responsive */}
            <section className="py-16 sm:py-24 md:py-32 bg-muted/20 relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12 sm:mb-16 md:mb-24 space-y-4">
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                            Our Solutions
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-foreground tracking-tighter px-2">
                            Three Paths to <span className="text-amber-600 italic">Perfection</span>
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium px-2">
                            Complete protection and optimization: In-Hive, In-Field, and Disease Defense.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
                        {/* In-Hive Precision */}
                        <Card className="group relative overflow-hidden border-none shadow-premium bg-white dark:bg-gray-950 rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] transition-all duration-700 hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
                            <CardContent className="p-6 sm:p-8 md:p-10 relative z-10 h-full flex flex-col">
                                <div className="flex flex-col gap-4 sm:gap-6 h-full">
                                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                                        <Cpu className="h-7 w-7 sm:h-10 sm:w-10 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="space-y-3 sm:space-y-4 flex-1">
                                        <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">In-Hive Precision</h3>
                                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
                                            Smart sensors inside every hive monitor colony strength, population,
                                            and activity levels. Know exactly what you're paying for.
                                        </p>
                                        <ul className="space-y-2 sm:space-y-3 pt-2">
                                            {["Real-time colony metrics", "Bee count verification", "Acoustic health alerts"].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
                                                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Link to="/precision-pollination" className="mt-auto pt-4 sm:pt-8">
                                        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black h-11 sm:h-12 rounded-xl text-sm sm:text-base">
                                            Explore In-Hive Tech
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* In-Field Insights */}
                        <Card className="group relative overflow-hidden border-none shadow-premium bg-white dark:bg-gray-950 rounded-[3rem] transition-all duration-700 hover:-translate-y-2">
                            <CardContent className="p-10 relative z-10 h-full flex flex-col">
                                <div className="flex flex-col gap-6 h-full">
                                    <div className="w-20 h-20 rounded-3xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                                        <Eye className="h-10 w-10 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <h3 className="text-3xl font-black text-foreground tracking-tight">In-Field <br /> Insights</h3>
                                        <p className="text-base text-muted-foreground leading-relaxed font-medium">
                                            Measure actual bee activity across your crops. See which areas are pollinated
                                            and identify gaps in real-time.
                                        </p>
                                        <ul className="space-y-3 pt-2">
                                            {["Flower visitation tracking", "Pollination heatmaps", "Weather correlation data"].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-bold">
                                                    <Check className="h-5 w-5 text-green-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Link to="/in-land-pollination" className="mt-auto pt-8">
                                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-black h-12 rounded-xl">
                                            Explore Field Insights
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Disease Defense */}
                        <Card className="group relative overflow-hidden border-none shadow-premium bg-white dark:bg-gray-950 rounded-[3rem] transition-all duration-700 hover:-translate-y-2">
                            <CardContent className="p-10 relative z-10 h-full flex flex-col">
                                <div className="flex flex-col gap-6 h-full">
                                    <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                                        <Shield className="h-10 w-10 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <h3 className="text-3xl font-black text-foreground tracking-tight">Disease <br /> Defense</h3>
                                        <p className="text-base text-muted-foreground leading-relaxed font-medium">
                                            Proactive protection for your apiary. Detect threats in the hive and across the land before they impact your harvest.
                                        </p>
                                        <ul className="space-y-3 pt-2">
                                            {["Early pathogen detection", "In-Hive & In-Land safety", "AI-driven health alerts"].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-bold">
                                                    <Check className="h-5 w-5 text-red-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Link to="/diseases" className="mt-auto pt-8">
                                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-12 rounded-xl">
                                            View Disease Solutions
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
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
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-6">
                            The Standard
                        </Badge>
                        <h2 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter">
                            The <span className="text-amber-600 italic">Difference</span>
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
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
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
                        <Badge variant="outline" className="text-amber-600">Our Expertise</Badge>
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter">Crops We <span className="text-amber-600 italic">Transform</span></h2>
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
                                    <h3 className="text-white font-black text-2xl group-hover:text-yellow-300 transition-colors tracking-tighter">
                                        {crop.name}
                                    </h3>
                                    <Link to="/media" className="text-white/60 text-xs font-black uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-all underline decoration-yellow-300 block">View Data</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="py-32 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-20 bg-background p-10 rounded-[2.5rem] shadow-xl border border-border/50">
                        <h2 className="text-4xl font-black mb-6 tracking-tight">Try BeeYield in your apiary</h2>
                        <p className="text-xl text-muted-foreground mb-8 font-medium">
                            BeeYield is constantly evolving. We invite you to take part in the international testing of our system – together, we can advance technology that protects bees worldwide.
                        </p>
                        <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-xl" asChild>
                            <Link to="/contact">Join the Program</Link>
                        </Button>
                    </div>

                    <div className="text-center">
                        <h2 className="text-3xl font-black mb-8 text-foreground tracking-tight">We are building a global network of partners</h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-16 font-medium">
                            BeeYield collaborates with leading partners worldwide, joining forces with beekeeping equipment manufacturers, industry organizations, and renowned universities.
                        </p>
                        {/* Partners */}
                        <div className="flex flex-wrap justify-center gap-8 items-center opacity-70 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-3 px-8 py-6 bg-background rounded-2xl shadow-sm border border-border">
                                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                                    <Globe className="h-6 w-6 text-primary" />
                                </div>
                                <span className="font-bold text-xl">Farmers</span>
                            </div>
                            <div className="flex items-center gap-3 px-8 py-6 bg-background rounded-2xl shadow-sm border border-border">
                                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                                    <Activity className="h-6 w-6 text-primary" />
                                </div>
                                <span className="font-bold text-xl">ApiSense</span>
                            </div>
                            <div className="flex items-center gap-3 px-8 py-6 bg-background rounded-2xl shadow-sm border border-border">
                                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                                    <Cpu className="h-6 w-6 text-primary" />
                                </div>
                                <span className="font-bold text-xl">Intelligent Hives</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-32 relative overflow-hidden bg-[#F0F7F0] text-neutral-900 rounded-[5rem] mx-4 mb-8 border border-green-100">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200 rounded-full blur-[120px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[120px] -ml-24 -mb-24" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center space-y-12">
                    <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-none text-neutral-900">
                        Ready for <br /> Real <span className="text-green-700 italic">Results?</span>
                    </h2>
                    <p className="text-2xl text-neutral-600 max-w-3xl mx-auto font-medium">
                        Join the global network of high-yield growers who've stopped guessing
                        and started growing with data.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link to="/contact">
                            <Button size="lg" className="bg-green-700 text-white hover:bg-green-800 text-2xl font-black h-24 px-16 rounded-[2rem] shadow-2xl">
                                Get Your Custom Plan
                            </Button>
                        </Link>
                    </div>
                    <p className="text-neutral-400 text-xs font-black uppercase tracking-widest">Global Support • Real-time Data • Guaranteed Impact</p>
                </div>
            </section>
        </div >
    );
};

export default PollinationServices;
