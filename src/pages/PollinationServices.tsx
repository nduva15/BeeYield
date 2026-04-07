import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import {
    Check, TrendingUp, Shield, BarChart3, ArrowRight,
    Cpu, Eye, Zap, Target, Leaf, Award, Clock, Users,
    Activity, Database, Radio, Smartphone, ChevronRight, Globe
} from "lucide-react";
import { QuickLink as Link } from "@/components/QuickLink";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import SEO from "@/components/SEO";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { beePollinationData } from "@/data/beePollinationData";

const PollinationServices = () => {
    const pollinationCrops = Object.values(beePollinationData);

    const differences = [
        {
            icon: Cpu,
            title: "Colony Monitoring",
            description: "Sensors inside hives track temperature and activity so you can spot changes early.",
            link: "/precision-pollination"
        },
        {
            icon: Activity,
            title: "Hive Health Monitoring",
            description: "Analysis of colony sounds to detect queen presence and general hive productivity levels.",
            link: "/precision-pollination"
        },
        {
            icon: Eye,
            title: "Field Coverage Mapping",
            description: "See where activity is strong or weak across the field so you can adjust placement.",
            link: "/in-land-pollination"
        },
        {
            icon: Target,
            title: "Visitation Analytics",
            description: "Estimate bee visits per flower to understand pollination strength.",
            link: "/in-land-pollination"
        },
        {
            icon: Shield,
            title: "Early Disease Detection",
            description: "Early warning signs from sensors and inspections to catch issues like Varroa sooner.",
            link: "/diseases"
        },
        {
            icon: Target,
            title: "Precision Pollination",
            description: "A practical service: monitoring, placement support, and a record of what happened during bloom.",
            link: "/precision-pollination"
        }
    ];

    return (
        <BeeYieldPageShell className="bg-background">
            <SEO 
                title="Precision Pollination Services & Bee Intelligence"
                description="BeeYield provides world-class precision pollination services and IoT-enabled beekeeping in Kenya. Increase crop yield by up to 35% with verifiable data."
                keywords="precision pollination Kenya, crop yield improvement, Kibwezi bees, Makueni pollination, sustainable beekeeping Africa, IoT agriculture"
                url="/pollination-services"
                image="/og-image.png"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Service",
                    "name": "BeeYield Precision Pollination",
                    "description": "Professional pollination records and hive activity monitoring using IoT sensors for commercial farmers.",
                    "provider": {
                        "@type": "LocalBusiness",
                        "name": "BeeYield Kibwezi HQ",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Kibwezi",
                            "addressRegion": "Makueni",
                            "addressCountry": "KE"
                        }
                    },
                    "areaServed": ["Kenya", "Africa", "Global"],
                    "hasOfferCatalog": {
                        "@type": "OfferCatalog",
                        "name": "Pollination Services",
                        "itemListElement": [
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "In-Hive Monitoring"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Field Activity Mapping"
                                }
                            }
                        ]
                    }
                }}
            />
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden py-24 sm:py-32">
                <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf6] to-[#f8faf8]">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_80%_20%,#fef3c7_0%,transparent_50%)] opacity-40 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_20%_80%,#ecfdf5_0%,transparent_50%)] opacity-40 pointer-events-none" />

                    {/* Vertical Text Accent */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute left-8 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none"
                    >
                        <span className="text-[100px] font-black text-neutral-200/50 tracking-tighter leading-none select-none" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                            Partner in Pollination
                        </span>
                    </motion.div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-[#F4D03F] text-[11px] font-black mb-8 border border-amber-100 shadow-sm"
                            >
                                <Zap className="w-3.5 h-3.5" />
                                Partner in Pollination
                            </motion.div>

                            <h1 className="text-5xl md:text-7xl font-black text-neutral-900 mb-8 tracking-tighter leading-[0.95]">
                                Your <span className="text-[#F4D03F]">Partner</span> <br />
                                in <span className="text-[#1B9157]">Pollination.</span>
                            </h1>

                            <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-xl leading-relaxed font-medium">
                                Professional pollination records for every field. We don't just supply bees; we provide clear proof of hive activity and colony health using reliable sensor technology.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <Button size="lg" className="bg-green-700 hover:bg-green-800 text-[#1A1A1A] font-black rounded-2xl px-10 h-14 shadow-xl text-xs transition-all hover:scale-105" asChild>
                                    <Link to="/pollination-request">Get Free Consultation</Link>
                                </Button>
                                <Button size="lg" variant="outline" className="border-2 border-neutral-200 text-neutral-900 hover:bg-neutral-50 font-black rounded-2xl px-10 h-14 text-xs" asChild>
                                    <Link to="/pollination-solutions">See How It Works</Link>
                                </Button>
                            </div>

                            {/* Premium Stats Row */}
                            <div className="flex flex-wrap gap-8 pt-8 border-t border-neutral-100">
                                {[
                                    { label: "Yield Increase", value: "35%", color: "text-[#1B9157]" },
                                    { label: "Managed Hives", value: "184+", color: "text-[#F4D03F]" },
                                    { label: "Uptime", value: "99.9%", color: "text-[#1B9157]" }
                                ].map((stat, i) => (
                                    <div key={i}>
                                        <p className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
                                        <p className="text-[10px] font-bold text-neutral-400">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="relative"
                        >
                            <div className="relative">
                                <YouTubeEmbed
                                    title="BeeYield pollination overview"
                                    loading="eager"
                                    wrapperClassName="aspect-[4/5] md:aspect-[5/4] rounded-[3rem] border-neutral-900/10 bg-neutral-900 shadow-2xl"
                                />

                                <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-[3rem] bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent p-8 md:p-10">
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                                        <div className="h-2 w-2 rounded-full bg-[#F4D03F]" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white/80">Featured video</span>
                                    </div>
                                    <p className="text-2xl font-black tracking-tighter text-white">See BeeYield in action</p>
                                </div>
                            </div>

                            {/* Floating badge */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-10 -right-10 bg-[#FFF9F0]/95 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl border border-amber-100/50 flex flex-col items-center justify-center gap-2"
                            >
                                <div className="relative w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Shield className="w-6 h-6 text-[#F4D03F]" />
                                </div>
                                <div className="text-center">
                                    <span className="block text-xl font-black text-neutral-900">Verified</span>
                                    <span className="block text-[9px] font-black text-[#F4D03F]">Pollination Partner</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* New Stats Section - Matching User Request */}
            <section className="py-20 sm:py-32 bg-[#FFF9F0]">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-4xl mb-12 sm:mb-16">
                        <h2 className="text-2xl md:text-4xl font-black text-neutral-900 mb-6 leading-tight tracking-tighter">
                            BeeYield is Africa's Leading <br />
                            Provider of Pollination Services
                        </h2>
                        <p className="text-lg sm:text-xl text-neutral-600 font-medium max-w-2xl leading-relaxed">
                            We drive value by tracking and monitoring bee activity in crops to deliver
                            quality data for quantifiable pollination results.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Acres Card */}
                        <div className="bg-[#FAEFC8] rounded-[2.5rem] p-8 sm:p-10 h-[22rem] sm:h-96 flex flex-col justify-between relative overflow-hidden group transition-transform hover:-translate-y-1 duration-300">
                            <div className="relative z-10">
                                <h3 className="text-sm font-black text-neutral-800 mb-4">Acres</h3>
                                <p className="text-5xl sm:text-6xl font-black text-neutral-900">25<sup className="text-3xl sm:text-4xl">+</sup></p>
                            </div>
                            <p className="text-neutral-800 font-medium leading-relaxed relative z-10 max-w-[80%]">
                                Acres pollinated by BeeYield Precision Pollination solutions across East Africa.
                            </p>
                        </div>

                        {/* Hives Card */}
                        <div className="bg-[#FAEFC8] rounded-[2.5rem] p-8 sm:p-10 h-[22rem] sm:h-96 flex flex-col justify-between relative overflow-hidden group transition-transform hover:-translate-y-1 duration-300">
                            <div className="relative z-10">
                                <h3 className="text-sm font-black text-neutral-800 mb-4">Hives</h3>
                                <p className="text-5xl sm:text-6xl font-black text-neutral-900">184</p>
                            </div>
                            <p className="text-neutral-800 font-medium leading-relaxed relative z-10 max-w-[80%]">
                                BeeYield manages a growing network of monitored hives in the region.
                            </p>
                        </div>

                        {/* Data Points Card */}
                        <div className="bg-[#FAEFC8] rounded-[2.5rem] p-8 sm:p-10 h-[22rem] sm:h-96 flex flex-col justify-between relative overflow-hidden group transition-transform hover:-translate-y-1 duration-300">
                            <div className="relative z-10">
                                <h3 className="text-sm font-black text-neutral-800 mb-4">Data Points</h3>
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
                        <Badge variant="outline" className="text-[#F4D03F] border-amber-300 px-3 sm:px-4 py-1">
                            Success Stories
                        </Badge>
                        <h2 className="text-2xl md:text-4xl font-black text-neutral-900 tracking-tighter leading-tight">
                            BeeYield Pollination Stories
                        </h2>
                        <p className="text-xl md:text-2xl text-neutral-600 font-medium leading-relaxed">
                            Hear what our growers have to say about working with BeeYield.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Swanson Farms Video */}
                        <YouTubeEmbed
                            title="Pollination Partnerships: BeeYield overview"
                            wrapperClassName="aspect-video"
                        />

                        {/* BeeYield Platform Video */}
                        <YouTubeEmbed
                            title="BeeYield Pollination Insight Platform"
                            wrapperClassName="aspect-video"
                        />
                    </div>
                </div>
            </section>


            {/* Verified Paths Section */}
            <section className="py-24 sm:py-32 bg-neutral-900 overflow-hidden relative">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="text-center mb-24 space-y-4">
                        <Badge className="bg-[#F4D03F] text-neutral-900 border-none px-6 py-1.5 font-black text-xs">
                            Direct Records
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter leading-[0.9]">
                            Three Ways to <br /> <span className="text-[#F4D03F]">Track Your Results</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {[
                            { title: "In-Hive Sensors", desc: "Reliable sensors inside every hive monitor colony strength and activity levels 24/7.", icon: Cpu, color: "bg-[#F4D03F]", link: "/precision-pollination" },
                            { title: "Field Activity", desc: "Measure actual bee activity across your crops. Identify pollination gaps in real-time.", icon: Eye, color: "bg-green-500", link: "/in-land-pollination" },
                            { title: "Apiary Health", desc: "Early threat detection and safety monitoring to keep your hives strong.", icon: Shield, color: "bg-red-500", link: "/diseases" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#F9F7F2] backdrop-blur-md p-10 rounded-[3rem] border border-[#F4D03F]/20 group hover:border-[#F4D03F]/40 transition-all"
                            >
                                <div className={`h-16 w-16 mb-8 rounded-2xl ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    <item.icon className="h-8 w-8 text-neutral-900" />
                                </div>
                                <h3 className="text-2xl font-black text-[#1A1A1A] mb-4 italic tracking-tighter">{item.title}</h3>
                                <p className="text-neutral-400 font-medium mb-8 leading-relaxed">{item.desc}</p>
                                <Button variant="link" className="text-[#F4D03F] font-black p-0 h-auto text-[10px] group" asChild>
                                    <Link to={item.link}>Explore Module <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" /></Link>
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The BeeYield Difference */}
            <section className="py-32 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-24 space-y-4">
                        <Badge className="bg-amber-100 text-[#F4D03F] px-6">
                            The Standard
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">
                            BEEYIELD <span className="text-[#F4D03F]">Precision Pollination</span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
                            We bring a complete ecosystem of technology, expertise, and accountability
                            that transforms your pollination from a gamble into a data-driven strategy.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {differences.map((diff, index) => (
                            <Link key={index} to={diff.link} className="block group">
                                <Card className="h-full bg-muted/5 border-none group-hover:bg-[#FFF9F0]:bg-[#FFF9F0] group-hover:shadow-premium transition-all duration-500 rounded-[2.5rem] p-4">
                                    <CardContent className="p-8">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                            <diff.icon className="h-8 w-8 text-[#1A1A1A]" />
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight">{diff.title}</h3>
                                        <p className="text-muted-foreground font-medium leading-relaxed">{diff.description}</p>
                                        <div className="mt-6 flex items-center text-[#F4D03F] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
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
                            <h3 className="text-3xl font-black tracking-tight">Tradition vs. <span className="text-[#F4D03F]">Innovation</span></h3>
                            <p className="text-muted-foreground mt-4 font-medium">Why data-driven pollination is the only way forward for modern agriculture.</p>
                        </div>
                        <div className="overflow-hidden rounded-[2.5rem] border border-border shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="p-6 text-lg font-black border-b border-border">Feature</th>
                                        <th className="p-6 text-lg font-black border-b border-border text-neutral-400">Traditional Methods</th>
                                        <th className="p-6 text-lg font-black border-b border-border text-[#F4D03F]">BeeYield Precision</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-background">
                                    <tr>
                                        <td className="p-6 font-bold border-b border-border">Monitoring</td>
                                        <td className="p-6 border-b border-border text-muted-foreground">Visual checks (Weekly/Monthly)</td>
                                        <td className="p-6 border-b border-border font-black text-[#F4D03F]">24/7 IoT Sensor Tracking</td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 font-bold border-b border-border">Placement</td>
                                        <td className="p-6 border-b border-border text-muted-foreground">General proximity to field</td>
                                        <td className="p-6 border-b border-border font-black text-[#F4D03F]">Strategic Hive Placement</td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 font-bold border-b border-border">Colony Data</td>
                                        <td className="p-6 border-b border-border text-muted-foreground">Guesswork / Estimates</td>
                                        <td className="p-6 border-b border-border font-black text-[#F4D03F]">Real-time population & health</td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 font-bold border-b border-border">Yield Impact</td>
                                        <td className="p-6 border-b border-border text-muted-foreground">Variable (weather dependent)</td>
                                        <td className="p-6 border-b border-border font-black text-[#F4D03F]">Up to 35% Average Increase*</td>
                                    </tr>
                                    <tr className="bg-amber-50/30">
                                        <td className="p-6 font-bold">Best For</td>
                                        <td className="p-6 text-muted-foreground">Small hobbyist gardens</td>
                                        <td className="p-6 font-black text-[#F4D03F]">Commercial High-Yield Growers</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-8 text-center text-muted-foreground text-sm">
                            <strong className="font-bold">Summary</strong>: While traditional methods rely on hope, BeeYield turns pollination into a predictable, measurable engine for growth.
                            <br /><span className="text-xs">*Results may vary depending on crop type, climate, and field conditions.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Crops Section - Compact & Premium */}
            <section className="py-24 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 space-y-3">
                        <Badge variant="outline" className="text-[#F4D03F] border-amber-200 bg-amber-50/50 px-4 py-1">Our Expertise</Badge>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Crops We <span className="text-[#F4D03F]">Pollinate</span></h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto font-medium">Selected crops where we monitor bloom conditions and pollination activity.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6 max-w-7xl mx-auto">
                        {pollinationCrops.map((crop, index) => (
                            <Link
                                key={index}
                                to="/media"
                                className="group relative overflow-hidden rounded-[2rem] aspect-[4/5] shadow-md hover:shadow-2xl transition-all duration-500 bg-[#FFF9F0]"
                            >
                                <img
                                    src={crop.image}
                                    alt={crop.cropName}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/10 to-transparent" />

                                <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                                    <Badge className="mb-2 bg-[#F4D03F] text-neutral-900 text-[9px] font-black border-none px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        {crop.beeDependence.split('(')[0].trim()}
                                    </Badge>
                                    <h3 className="font-black text-lg text-[#1A1A1A] leading-tight tracking-tighter">
                                        {crop.cropName}
                                    </h3>
                                    <div className="h-0.5 w-0 group-hover:w-12 bg-[#F4D03F] transition-all duration-700 mt-2 rounded-full" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <Link to="/contact">
                            <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-[#1A1A1A] font-black rounded-2xl px-12 h-14 shadow-2xl text-[10px] transition-all hover:scale-105 active:scale-95">
                                Start Pollination Project
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20 space-y-4">
                        <Badge variant="outline" className="text-[#1B9157] border-green-300">FAQ</Badge>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Common <span className="text-[#1B9157]">Questions</span></h2>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            <AccordionItem value="item-1" className="border-none bg-muted/30 px-8 rounded-3xl">
                                <AccordionTrigger className="text-xl font-black hover:no-underline py-6">
                                    How does precision pollination differ from traditional beekeeping?
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed font-medium text-base pb-6">
                                    Traditional beekeeping often means placing hives near crops and waiting to see what happens. BeeYield's <strong className="font-bold text-foreground">Precision Pollination</strong> uses sensors in hives and data-informed placement across the land. We monitor colony health, bee activity, and weather during bloom so you can see what's happening and respond quickly.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2" className="border-none bg-muted/30 px-8 rounded-3xl">
                                <AccordionTrigger className="text-xl font-black hover:no-underline py-6">
                                    What results can farmers expect with BeeYield?
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed font-medium text-base pb-6">
                                    On average, our partners have seen up to a <strong className="font-bold text-foreground">35% increase in crop yield</strong>. More importantly, we provide <strong className="font-bold text-foreground">300% more colony data</strong>, giving you verifiable proof of pollination activity. This leads to higher quality fruit, better seed set, and more consistent harvests across your entire field. Results may vary depending on crop type, climate, and conditions.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3" className="border-none bg-muted/30 px-8 rounded-3xl">
                                <AccordionTrigger className="text-xl font-black hover:no-underline py-6">
                                    How many hives do I need for my crop?
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed font-medium text-base pb-6">
                                    Hive density varies significantly based on the crop type, field layout, and target yield. For example, sunflowers may require 2-3 hives per hectare, while some specialty vegetables need up to 5 hives. Our placement experts analyze your land geography to determine the perfect density and orientation for your specific needs.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4" className="border-none bg-muted/30 px-8 rounded-3xl">
                                <AccordionTrigger className="text-xl font-black hover:no-underline py-6">
                                    Is BeeYield available in my region?
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed font-medium text-base pb-6">
                                    BeeYield is active across <strong className="font-bold text-foreground">East Africa</strong>, with operations in Kenya and a growing network in neighboring regions. If you're outside the region, reach out?we'll tell you what's available and what timelines look like.
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
                                    "text": "Precision pollination uses sensors in hives and data-informed placement to monitor colony strength, bee activity, and weather during bloom. Unlike traditional beekeeping that relies on proximity alone, it helps you see performance across the field and respond quickly when conditions change."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What results can farmers expect with BeeYield?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Results vary by crop and conditions. Some partners have seen up to a 35% increase in yield. We also provide verifiable field and hive data so you can quantify pollination activity instead of relying on estimates."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is BeeYield available in my region?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "BeeYield is currently active across East Africa, primarily in Kenya, and is expanding. If you're outside the region, contact us and we'll share availability and rollout timelines."
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
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F4D03F] rounded-full blur-[120px] -ml-24 -mb-24" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center space-y-12">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-neutral-900">
                        Ready for <br /> Real <span className="text-[#1B9157]">Results?</span>
                    </h2>
                    <p className="text-2xl text-neutral-600 max-w-3xl mx-auto font-medium">
                        Join the network of high-yield growers who've stopped guessing
                        and started growing with data.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link to="/contact">
                            <Button size="default" className="bg-green-700 text-[#1A1A1A] hover:bg-green-800 text-xl font-black h-16 px-8 rounded-[2rem] shadow-2xl">
                                Get Your Custom Plan
                            </Button>
                        </Link>
                    </div>
                    <p className="text-neutral-400 text-xs font-black">Support ? Real-time Data ? Measurable Impact</p>
                </div>
            </section>
        </BeeYieldPageShell>
    );
};

export default PollinationServices;
