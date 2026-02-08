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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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
            icon: Cpu,
            title: "Smart Colony Monitoring",
            description: "Sensors inside every hive track population density and brood temperature in real-time.",
            link: "/precision-pollination"
        },
        {
            icon: Activity,
            title: "Hive Health Monitoring",
            description: "Audio analysis of colony health to detect queen presence and general productivity levels.",
            link: "/precision-pollination"
        },
        {
            icon: Eye,
            title: "Precision Field Mapping",
            description: "Visualizing bee distribution across your acreage to ensure uniform pollination coverage.",
            link: "/in-land-pollination"
        },
        {
            icon: Target,
            title: "Visitation Data",
            description: "Quantifying the number of bee visits per flower to optimize total harvest potential.",
            link: "/in-land-pollination"
        },
        {
            icon: Shield,
            title: "Early Disease Detection",
            description: "Detailed monitoring to identify pathogens like Varroa or AFB before they spread.",
            link: "/diseases"
        },
        {
            icon: BarChart3,
            title: "Safety Alerts",
            description: "Instant notifications when environmental threats or hive health drops below safety levels.",
            link: "/diseases"
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
                            <Badge className="bg-[#E6F4EA] text-[#1E8E3E] border-[#CEEAD6] text-xs sm:text-sm px-4 py-2 inline-flex font-bold">
                                🐝 East Africa's Premier Pollination Partner
                            </Badge>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tighter">
                                Take Control of Your
                                <span className="text-amber-500 block">Pollination Today.</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-neutral-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                                With BeeYield's research-based, managed pollination solutions for commercial crop growers.
                            </p>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
                                <Link to="/pollination-request" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto bg-[#FCD34D] text-black hover:bg-[#F5C518] text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 font-bold shadow-lg rounded-xl sm:rounded-2xl border-none">
                                        Get A FREE Pollination Consultation
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

            {/* New Stats Section - Matching User Request */}
            <section className="py-20 sm:py-32 bg-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-4xl mb-12 sm:mb-16">
                        <h2 className="text-4xl md:text-6xl font-black text-neutral-900 mb-6 leading-tight tracking-tighter">
                            BeeYield is Africa's Leading <br />
                            Provider of Pollination Services
                        </h2>
                        <p className="text-lg sm:text-xl text-neutral-600 font-medium max-w-2xl leading-relaxed">
                            We drive value by monitoring bee activity in crops to deliver
                            clear pollination results.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Acres Card */}
                        <div className="bg-[#FAEFC8] rounded-[2.5rem] p-8 sm:p-10 h-[22rem] sm:h-96 flex flex-col justify-between relative overflow-hidden group transition-transform hover:-translate-y-1 duration-300">
                            <div className="relative z-10">
                                <h3 className="text-sm font-black text-neutral-800 tracking-widest uppercase mb-4">Acres</h3>
                                <p className="text-5xl sm:text-6xl font-black text-neutral-900">25<sup className="text-3xl sm:text-4xl">+</sup></p>
                            </div>
                            <p className="text-neutral-800 font-medium leading-relaxed relative z-10 max-w-[80%]">
                                Acres pollinated by BeeYield Precision Pollination solutions across East Africa.
                            </p>
                        </div>

                        {/* Hives Card */}
                        <div className="bg-[#FAEFC8] rounded-[2.5rem] p-8 sm:p-10 h-[22rem] sm:h-96 flex flex-col justify-between relative overflow-hidden group transition-transform hover:-translate-y-1 duration-300">
                            <div className="relative z-10">
                                <h3 className="text-sm font-black text-neutral-800 tracking-widest uppercase mb-4">Hives</h3>
                                <p className="text-5xl sm:text-6xl font-black text-neutral-900">184</p>
                            </div>
                            <p className="text-neutral-800 font-medium leading-relaxed relative z-10 max-w-[80%]">
                                BeeYield manages a growing network of monitored hives in the region.
                            </p>
                        </div>

                        {/* Data Points Card */}
                        <div className="bg-[#FAEFC8] rounded-[2.5rem] p-8 sm:p-10 h-[22rem] sm:h-96 flex flex-col justify-between relative overflow-hidden group transition-transform hover:-translate-y-1 duration-300">
                            <div className="relative z-10">
                                <h3 className="text-sm font-black text-neutral-800 tracking-widest uppercase mb-4">Metric Logs</h3>
                                <p className="text-4xl sm:text-5xl font-black text-neutral-900 leading-tight">Growing <br /> Daily</p>
                            </div>
                            <p className="text-neutral-800 font-medium leading-relaxed relative z-10 max-w-[80%]">
                                BeeYield sensors collect critical colony health and activity data points daily.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pollination Stories Section - Replacing Art and Science Section */}
            <section className="py-24 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-4xl mb-16 space-y-4">
                        <Badge variant="outline" className="text-amber-600 border-amber-300 px-3 sm:px-4 py-1">
                            Success Stories
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-black text-neutral-900 tracking-tighter leading-tight">
                            BeeYield Pollination Stories
                        </h2>
                        <p className="text-xl md:text-2xl text-neutral-600 font-medium leading-relaxed">
                            Hear what our growers have to say about working with BeeYield.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Swanson Farms Video */}
                        <div className="group relative overflow-hidden rounded-[2.5rem] bg-neutral-100 shadow-premium aspect-video border border-neutral-100">
                            <iframe
                                className="absolute inset-0 w-full h-full border-0"
                                src="https://www.youtube.com/embed/3n_bI6L_Dk8"
                                title="Pollination Partnerships: Swanson Farms' Growth Story"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>

                        {/* BeeYield Platform Video */}
                        <div className="group relative overflow-hidden rounded-[2.5rem] bg-neutral-100 shadow-premium aspect-video border border-neutral-100">
                            <iframe
                                className="absolute inset-0 w-full h-full border-0"
                                src="https://www.youtube.com/embed/Lq21C8u9m0o"
                                title="BeeYield Pollination Insight Platform"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
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
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tighter px-2">
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
                                            {["Early pathogen detection", "In-Hive & In-Land safety", "Real-time health alerts"].map((feature, i) => (
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
                        <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">
                            BEEYIELD <span className="text-amber-600 italic">DIFFERENCE</span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
                            We bring a complete ecosystem of technology, expertise, and accountability
                            that transforms your pollination from a gamble into a guarantee.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {differences.map((diff, index) => (
                            <Link key={index} to={diff.link} className="block group">
                                <Card className="h-full bg-muted/5 border-none group-hover:bg-white dark:group-hover:bg-gray-900 group-hover:shadow-premium transition-all duration-500 rounded-[2.5rem] p-4">
                                    <CardContent className="p-8">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                            <diff.icon className="h-8 w-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight">{diff.title}</h3>
                                        <p className="text-muted-foreground font-medium leading-relaxed">{diff.description}</p>
                                        <div className="mt-6 flex items-center text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            Learn More <ChevronRight className="ml-1 h-4 w-4" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* AEO: Comparison Table Block */}
                    <div className="mt-32 max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-black tracking-tight">Tradition vs. <span className="text-amber-600">Innovation</span></h3>
                            <p className="text-muted-foreground mt-4 font-medium">Why researched pollination is the only way forward for modern agriculture.</p>
                        </div>
                        <div className="overflow-hidden rounded-[2.5rem] border border-border shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="p-6 text-lg font-black border-b border-border">Feature</th>
                                        <th className="p-6 text-lg font-black border-b border-border text-neutral-400">Traditional Methods</th>
                                        <th className="p-6 text-lg font-black border-b border-border text-amber-600">BeeYield Precision</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-background">
                                    <tr>
                                        <td className="p-6 font-bold border-b border-border">Monitoring</td>
                                        <td className="p-6 border-b border-border text-muted-foreground">Visual checks (Weekly/Monthly)</td>
                                        <td className="p-6 border-b border-border font-black text-amber-600">24/7 IoT Sensor Tracking</td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 font-bold border-b border-border">Placement</td>
                                        <td className="p-6 border-b border-border text-muted-foreground">General proximity to field</td>
                                        <td className="p-6 border-b border-border font-black text-amber-600">Strategic Hive Placement</td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 font-bold border-b border-border">Colony Data</td>
                                        <td className="p-6 border-b border-border text-muted-foreground">Guesswork / Estimates</td>
                                        <td className="p-6 border-b border-border font-black text-amber-600">Real-time population & health</td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 font-bold border-b border-border">Yield Impact</td>
                                        <td className="p-6 border-b border-border text-muted-foreground">Variable (weather dependent)</td>
                                        <td className="p-6 border-b border-border font-black text-amber-600">Guaranteed 35% Average Increase</td>
                                    </tr>
                                    <tr className="bg-amber-50/30">
                                        <td className="p-6 font-bold">Best For</td>
                                        <td className="p-6 text-muted-foreground">Small hobbyist gardens</td>
                                        <td className="p-6 font-black text-amber-600">Commercial High-Yield Growers</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-8 text-center italic text-muted-foreground text-sm">
                            <strong className="font-bold">Bottom line</strong>: While traditional methods rely on hope, BeeYield turns pollination into a predictable, measurable process for growth.
                        </div>
                    </div>
                </div>
            </section>

            {/* Crops Section */}
            <section className="py-32 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-24 space-y-4">
                        <Badge variant="outline" className="text-amber-600">Our Expertise</Badge>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Crops We <span className="text-amber-600 italic">Pollinate</span></h2>
                        <div className="pt-8">
                            <Link to="/contact">
                                <Button size="lg" className="bg-[#FCD34D] text-black hover:bg-[#F5C518] font-bold px-8 py-6 rounded-2xl shadow-xl border-none">
                                    Book a Pollination Consultation
                                </Button>
                            </Link>
                        </div>
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

            {/* FAQ Section */}
            <section className="py-24 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20 space-y-4">
                        <Badge variant="outline" className="text-green-600 border-green-300">FAQ</Badge>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Common <span className="text-green-600 italic">Questions</span></h2>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            <AccordionItem value="item-1" className="border-none bg-muted/30 px-8 rounded-3xl">
                                <AccordionTrigger className="text-xl font-black hover:no-underline py-6">
                                    How does precision pollination differ from traditional beekeeping?
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed font-medium text-base pb-6">
                                    Traditional beekeeping involves placing hives near crops and hoping for the best. BeeYield's <strong className="font-bold text-foreground">Precision Pollination</strong> uses tracking sensors inside every hive and optimized placement across the land. We monitor colony strength, bee activity, and weather patterns to ensure fertilization during the critical bloom phase, taking the guesswork out of the harvest.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2" className="border-none bg-muted/30 px-8 rounded-3xl">
                                <AccordionTrigger className="text-xl font-black hover:no-underline py-6">
                                    What results can farmers expect with BeeYield?
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed font-medium text-base pb-6">
                                    On average, our partners see a <strong className="font-bold text-foreground">35% increase in crop yield</strong>. More importantly, we provide <strong className="font-bold text-foreground">300% more colony data</strong>, giving you verifiable proof of pollination activity. This leads to higher quality fruit, better seed set, and more consistent harvests across your entire field, regardless of scale.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3" className="border-none bg-muted/30 px-8 rounded-3xl">
                                <AccordionTrigger className="text-xl font-black hover:no-underline py-6">
                                    How many hives do I need for my crop?
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed font-medium text-base pb-6">
                                    Hive density varies significantly based on the crop type, field layout, and target yield. For example, sunflowers may require 2-3 hives per hectare, while some specialty vegetables need up to 5 hives. Our placement analysis looks at your land geography to determine the perfect density and orientation for your specific needs.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4" className="border-none bg-muted/30 px-8 rounded-3xl">
                                <AccordionTrigger className="text-xl font-black hover:no-underline py-6">
                                    Is BeeYield available in my region?
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed font-medium text-base pb-6">
                                    BeeYield is currently the premier pollination partner in <strong className="font-bold text-foreground">East Africa</strong>, with major operations across Kenya and growing networks in neighboring regions. We are building a global hive network and invite farmers and beekeeping organizations worldwide to join our partner program.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {/* JSON-LD FAQ Schema */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "How does precision pollination differ from traditional beekeeping?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Precision pollination uses IoT sensors and optimized hive placement to monitor colony strength and bee activity 24/7. Unlike traditional beekeeping which relies on proximity alone, BeeYield ensures maximum fertilization during the critical bloom phase using real-time field data."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What results can farmers expect with BeeYield?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Farmers using BeeYield typically see an average increase of 35% in crop yield through optimized pollination. We also provide verifiable data showing a 300% increase in measurable colony activity compared to traditional methods."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is BeeYield available in my region?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "BeeYield is currently active across East Africa, primarily in Kenya, and is expanding its network. We work with farmers, beekeeping equipment manufacturers, and industry organizations to improve yield outcomes."
                                }
                            }
                        ]
                    })}
                </script>
            </section>

            {/* Final CTA Section */}
            <section className="py-32 relative overflow-hidden bg-[#F0F7F0] text-neutral-900 rounded-[5rem] mx-4 mb-8 border border-green-100">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200 rounded-full blur-[120px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[120px] -ml-24 -mb-24" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center space-y-12">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-neutral-900">
                        Ready for <br /> Real <span className="text-green-700 italic">Results?</span>
                    </h2>
                    <p className="text-2xl text-neutral-600 max-w-3xl mx-auto font-medium">
                        Join the network of high-yield growers who've stopped guessing
                        and started growing.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link to="/contact">
                            <Button size="lg" className="bg-green-700 text-white hover:bg-green-800 text-2xl font-black h-24 px-16 rounded-[2rem] shadow-2xl">
                                Get Your Custom Plan
                            </Button>
                        </Link>
                    </div>
                    <p className="text-neutral-400 text-xs font-black uppercase tracking-widest">Support • Real-time Data • Guaranteed Impact</p>
                </div>
            </section>
        </div>
    );
};

export default PollinationServices;
