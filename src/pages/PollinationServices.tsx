import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoryHeroBackground } from "@/components/StoryHeroBackground";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import {
    Quote, MapPin, CheckCircle2, Sparkles,
    Check, TrendingUp, TrendingDown, ShieldAlert, AlertTriangle, Shield, BarChart3, ArrowRight,
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
import { BetweenVisitsSection, ConnectedSystemSection } from "@/components/beeyield/FieldTrustSections";
import { AudienceSegmentsSection } from "@/components/AudienceSegmentsSection";
import { BiologicalIntelligenceSection } from "@/components/beeyield/BiologicalIntelligenceSection";

const PollinationServices = () => {

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
                title="Precision Pollination & In-Land Pollination | Hives Per Acre Model"
                description="BeeYield delivers precision pollination and in-land pollination across East Africa. Data-backed hives per acre models and in-hive pollination monitoring protecting bees and boosting crop yields."
                keywords="precision pollination, hives per acre model, bees, apiary, protecting bees, in hive pollination, in land pollination, commercial pollination services, bee colony health, crop yield optimization"
                url="/pollination-services"
                image="/og-image.png"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Service",
                    "name": "BeeYield Precision Pollination & In-Land Pollination",
                    "description": "Professional in-land and in-hive pollination services, calculating exact hives per acre models while protecting bees and boosting commercial crop yields.",
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
                        "name": "Precision Pollination Solutions",
                        "itemListElement": [
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "In-Hive Pollination Telemetry"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Hives Per Acre Modeling & Placement"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "In-Land Pollination Field Coverage"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Apiary Management & Protecting Bees"
                                }
                            }
                        ]
                    }
                }}
            />
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden py-24 sm:py-32">
                <StoryHeroBackground />
                <div className="absolute inset-0 pointer-events-none">
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

                            <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full max-w-lg">
                                <Button size="lg" className="w-full sm:w-auto max-w-full bg-green-700 hover:bg-green-800 text-[#1A1A1A] font-black rounded-2xl px-6 sm:px-10 h-auto min-h-12 sm:h-14 py-3 shadow-xl text-xs sm:text-sm transition-all hover:scale-105 whitespace-normal text-center" asChild>
                                    <Link to="/pollination-request">Get Free Consultation</Link>
                                </Button>
                                <Button size="lg" variant="outline" className="w-full sm:w-auto max-w-full border-2 border-neutral-200 text-neutral-900 hover:bg-neutral-50 font-black rounded-2xl px-6 sm:px-10 h-auto min-h-12 sm:h-14 py-3 text-xs sm:text-sm whitespace-normal text-center" asChild>
                                    <Link to="/pollination-solutions">See How It Works</Link>
                                </Button>
                            </div>

                            {/* Premium Stats Row */}
                            <div className="flex flex-wrap gap-8 pt-8 border-t border-neutral-100">
                                {[
                                    { label: "Yield Increase", value: "9–18%", color: "text-[#1B9157]" },
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
                            <div className="relative aspect-[4/5] sm:aspect-video lg:aspect-square rounded-[3rem] overflow-hidden shadow-2xl group bg-white">
                                <YouTubeEmbed
                                    title="BeeYield Hero Video"
                                    loading="eager"
                                    wrapperClassName="h-full w-full rounded-[3rem] border border-neutral-200 bg-white shadow-none"
                                    iframeClassName="opacity-100"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-neutral-950/55 via-neutral-950/10 to-transparent pointer-events-none" />

                                {/* Floating Overlay Info */}
                                <div className="absolute bottom-10 left-10 text-white pointer-events-none">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-[#F4D03F]">Live video</span>
                                    </div>
                                    <p className="text-2xl font-black tracking-tighter">BeeYield In Motion</p>
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
                                <p className="text-5xl sm:text-6xl font-black text-neutral-900">105<sup className="text-3xl sm:text-4xl">+</sup></p>
                            </div>
                            <p className="text-neutral-800 font-medium leading-relaxed relative z-10 max-w-[80%]">
                                105 and counting acres pollinated by BeeYield Precision Pollination solutions across East Africa.
                            </p>
                        </div>

                        {/* Hives Card */}
                        <div className="bg-[#FAEFC8] rounded-[2.5rem] p-8 sm:p-10 h-[22rem] sm:h-96 flex flex-col justify-between relative overflow-hidden group transition-transform hover:-translate-y-1 duration-300">
                            <div className="relative z-10">
                                <h3 className="text-sm font-black text-neutral-800 mb-4">Hives</h3>
                                <p className="text-5xl sm:text-6xl font-black text-neutral-900">184</p>
                            </div>
                            <p className="text-neutral-800 font-medium leading-relaxed relative z-10 max-w-[80%]">
                                BeeYield manages a growing network of intelligent hives in the region.
                            </p>
                        </div>

                        {/* Data Points Card */}
                        <div className="bg-[#FAEFC8] rounded-[2.5rem] p-8 sm:p-10 h-[22rem] sm:h-96 flex flex-col justify-between relative overflow-hidden group transition-transform hover:-translate-y-1 duration-300">
                            <div className="relative z-10">
                                <h3 className="text-sm font-black text-neutral-800 mb-4">Data Points</h3>
                                <p className="text-4xl sm:text-5xl font-black text-neutral-900 leading-tight">2,000<sup className="text-2xl sm:text-3xl font-black">+</sup> <br /> Daily</p>
                            </div>
                            <p className="text-neutral-800 font-medium leading-relaxed relative z-10 max-w-[80%]">
                                Over 2,000 data points daily and growing, collected by BeeYield sensors for colony health and activity.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Turning Nature into Intelligence — Biological Intelligence story */}
            <BiologicalIntelligenceSection />

            {/* Technology that earns trust in the field — problem & why it matters */}
            <BetweenVisitsSection />

            {/* ═══════════════════════════════════════════════════════════════
                ECOLOGICAL PROBLEM STATEMENT: THE DECLINE OF AFRICAN BEES & FOOD SECURITY
                Clean Warm Ecological Theme (Non-Black, Premium Surface)
            ═══════════════════════════════════════════════════════════════ */}
            <section id="african-pollinator-crisis" className="py-24 sm:py-32 bg-gradient-to-b from-[#F5FAF5] via-[#EDF6EC] to-[#E5F2E4] text-stone-900 relative overflow-hidden border-y border-emerald-100/90" aria-label="African Bee Decline and Ecological Emergency Problem Statement">
                {/* Soft ambient natural luminous orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[130px]" />
                    <div className="absolute top-1/2 -right-32 w-[550px] h-[550px] bg-amber-200/35 rounded-full blur-[140px]" />
                    <div className="absolute -bottom-24 left-1/3 w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-widest shadow-xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                            Continental Ecological &amp; Agricultural Emergency
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-stone-950 tracking-tight leading-tight">
                            The Decline of African Bees: <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-emerald-700 to-teal-800">
                                An Ecological &amp; Agricultural Emergency
                            </span>
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-stone-700 font-normal leading-relaxed max-w-3xl mx-auto pt-2">
                            The decline of African bees has shifted from a quiet environmental concern into a severe ecological and agricultural emergency across the continent. Recent data indicates an average managed honey bee colony loss rate of <strong className="font-extrabold text-stone-950">21.3%</strong> across Sub-Saharan Africa, with high-risk agricultural corridors like Kenya and Uganda experiencing devastating seasonal losses as high as <strong className="font-extrabold text-amber-700">42% to 45%</strong>. Because approximately <strong className="font-extrabold text-emerald-800">40% of insect pollinators in Africa</strong> are currently at risk, this decline directly threatens biodiversity, ecosystem stability, and the food security of millions of people who depend on insect-pollinated crops.
                        </p>
                    </div>

                    {/* Empirically Verified Crisis Stat Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
                        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold tracking-wider uppercase text-stone-500">Sub-Saharan Average</span>
                                <div className="p-2 rounded-xl bg-stone-100 text-stone-700 group-hover:scale-110 transition-transform">
                                    <TrendingDown className="w-5 h-5 text-amber-600" />
                                </div>
                            </div>
                            <div className="text-4xl sm:text-5xl font-black text-stone-950 mb-2 tracking-tight">21.3%</div>
                            <h3 className="text-sm font-bold text-stone-900 mb-1">Managed Colony Loss Rate</h3>
                            <p className="text-xs text-stone-600 leading-relaxed font-medium">
                                Baseline annual mortality for managed honeybee colonies across Sub-Saharan Africa.
                            </p>
                        </div>

                        <div className="bg-gradient-to-b from-amber-50/90 to-white rounded-3xl p-6 sm:p-7 border border-amber-200/90 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold tracking-wider uppercase text-amber-900">Regional Peak Loss</span>
                                <div className="p-2 rounded-xl bg-amber-100/90 text-amber-700 group-hover:scale-110 transition-transform">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                </div>
                            </div>
                            <div className="text-4xl sm:text-5xl font-black text-amber-700 mb-2 tracking-tight">42%–45%</div>
                            <h3 className="text-sm font-bold text-stone-900 mb-1">Kenya &amp; Uganda Seasonal Losses</h3>
                            <p className="text-xs text-stone-600 leading-relaxed font-medium">
                                Devastating seasonal die-offs in East African agricultural basins driven by forage deficits and pathogens.
                            </p>
                        </div>

                        <div className="bg-gradient-to-b from-emerald-50/90 to-white rounded-3xl p-6 sm:p-7 border border-emerald-200/90 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold tracking-wider uppercase text-emerald-900">Species Vulnerability</span>
                                <div className="p-2 rounded-xl bg-emerald-100/90 text-emerald-700 group-hover:scale-110 transition-transform">
                                    <ShieldAlert className="w-5 h-5 text-emerald-600" />
                                </div>
                            </div>
                            <div className="text-4xl sm:text-5xl font-black text-emerald-800 mb-2 tracking-tight">~40%</div>
                            <h3 className="text-sm font-bold text-stone-900 mb-1">Pollinators At Risk</h3>
                            <p className="text-xs text-stone-600 leading-relaxed font-medium">
                                Proportion of native and managed African insect pollinator species currently facing critical population threats.
                            </p>
                        </div>

                        <div className="bg-gradient-to-b from-teal-50/90 to-white rounded-3xl p-6 sm:p-7 border border-teal-200/90 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold tracking-wider uppercase text-teal-900">Food Security Nexus</span>
                                <div className="p-2 rounded-xl bg-teal-100/90 text-teal-700 group-hover:scale-110 transition-transform">
                                    <Leaf className="w-5 h-5 text-teal-600" />
                                </div>
                            </div>
                            <div className="text-4xl sm:text-5xl font-black text-teal-800 mb-2 tracking-tight">75%+</div>
                            <h3 className="text-sm font-bold text-stone-900 mb-1">Crops Pollinator-Dependent</h3>
                            <p className="text-xs text-stone-600 leading-relaxed font-medium">
                                Commercial crops—including mangoes, avocados, sunflowers, and legumes—requiring bee visitation for fruit set.
                            </p>
                        </div>
                    </div>

                    {/* Empirically Grounded Narrative & Precision Defense Card */}
                    <div className="bg-white/95 border border-stone-200/90 rounded-[2.5rem] p-8 sm:p-12 max-w-5xl mx-auto shadow-sm backdrop-blur-md">
                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                            <div className="space-y-4">
                                <h3 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight leading-snug">
                                    Why Traditional Beekeeping Can No Longer Stop Colony Loss
                                </h3>
                                <p className="text-sm text-stone-600 leading-relaxed font-medium">
                                    For decades, pollination in Africa was treated as an unmeasured natural abundance. Today, climate volatility, prolonged droughts, pesticide runoff, and undetected hive pests like <em>Varroa destructor</em> and Foulbrood have turned unmonitored apiaries into high-risk operations. When 45% of colonies collapse in a single season, commercial yields drop precipitously, driving up food prices and threatening rural livelihood resilience.
                                </p>
                                <p className="text-sm text-stone-600 leading-relaxed font-medium">
                                    Without real-time hive telemetry and precision field density mapping, growers and beekeepers are forced to manage by assumption—often discovering colony death weeks after crop pollination windows have closed.
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 rounded-2xl p-6 sm:p-8 border border-emerald-200/90 space-y-4 shadow-xs">
                                <div className="flex items-center gap-2.5 text-emerald-800 text-xs font-black uppercase tracking-wider">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    The BeeYield Precision Response
                                </div>
                                <h4 className="text-lg font-black text-stone-900">From Blind Assumptions to Empirical Hive Defense</h4>
                                <ul className="space-y-3 text-xs sm:text-sm text-stone-700">
                                    <li className="flex items-start gap-2.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                                        <span><strong className="text-stone-950 font-bold">Continuous In-Hive Telemetry:</strong> Micro-sensors track brood temperature, acoustics, and weight gains to alert keepers before colony collapse occurs.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                                        <span><strong className="text-stone-950 font-bold">Precision Density Placement:</strong> GPS-synchronized deployment guarantees optimal bee-per-flower ratios across commercial acreage.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                                        <span><strong className="text-stone-950 font-bold">Ecological Conservation:</strong> Active habitat mapping and forage conservation safeguarding over 40% of vulnerable native pollinators.</span>
                                    </li>
                                </ul>
                                <div className="pt-2">
                                    <Button asChild className="bg-emerald-600 text-white font-bold hover:bg-emerald-700 w-full sm:w-auto shadow-xs">
                                        <Link to="/precision-pollination">Explore Precision Defense Tech <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech that works for everyone — audience segments */}
            <AudienceSegmentsSection />

            {/* One connected system, from hive to harvest + data you can trust */}
            <ConnectedSystemSection />

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
                            title="BeeYield Video"
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
                                        <td className="p-6 border-b border-border font-black text-[#F4D03F]">9–18% Average Increase*</td>
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

            {/* Crops We Pollinate & Voices from the Field (Authentic Media Photos & Farmer Quotes) */}
            <section className="py-24 bg-gradient-to-b from-[#FFFDF9] via-[#FDFBF7] to-background border-t border-border/40 relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
                        <Badge className="bg-[#1B9157]/15 text-[#1B9157] border-[#1B9157]/30 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
                            105 Acres and Counting • Makueni County
                        </Badge>
                        <h2 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                            Crops We Pollinate: <br />
                            <span className="text-[#1B9157]">Voices From The Field</span>
                        </h2>
                        <div className="max-w-xl mx-auto my-6 p-4 rounded-2xl bg-white border border-[#1B9157]/20 shadow-sm flex items-center gap-3.5 text-left">
                            <Quote className="w-5 h-5 text-[#1B9157] shrink-0 fill-[#1B9157]/20" />
                            <div>
                                <p className="text-sm sm:text-base font-bold text-neutral-900 italic">
                                    “Many plants are dependent on pollination from a pollinator.”
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold text-[#1B9157]">Timothy Nduva</span>
                                    <span className="text-[10px] text-neutral-500">• Founder & CEO</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed">
                            Authentic field dispatches from commercial orchards and drip-irrigated holdings across Makueni County.
                            BeeYield IoT nodes and precision colonies maximize fruit set and protect yields across 105 acres and counting.
                        </p>
                    </div>

                    {/* Crops Grid (Using Authentic Photos from the Media Page) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20">
                        {/* Crop 1: Mangoes */}
                        <div className="bg-card rounded-[2rem] overflow-hidden border border-border/70 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group">
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src="/images/pollination/mango-panicles-close-bloom.png"
                                    alt="Mango Flower Panicles in Bloom"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-amber-600/90 text-white font-bold border-none text-[11px] shadow-sm">
                                        43 Acres Total
                                    </Badge>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/40 to-transparent p-3 pt-6">
                                    <span className="text-[11px] text-amber-200 font-bold flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Kibarani & Kiunduani
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                <div>
                                    <h3 className="text-lg font-black text-foreground tracking-tight">Mangoes (Apple & Ngowe)</h3>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        Over 2,000 florets per panicle pollinated during morning anthesis to prevent premature flower drop.
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                                    <span className="font-bold text-[#1B9157] flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> 90% Bee Dependency
                                    </span>
                                    <span className="text-[11px] text-muted-foreground font-semibold">Farmer Clement & Christopher</span>
                                </div>
                            </div>
                        </div>

                        {/* Crop 2: Citrus & Oranges */}
                        <div className="bg-card rounded-[2rem] overflow-hidden border border-border/70 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group">
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src="/images/pollination/orange-heavy-fruiting-branches.jpg"
                                    alt="Citrus & Orange Groves"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-orange-600/90 text-white font-bold border-none text-[11px] shadow-sm">
                                        18 Acres Total
                                    </Badge>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/40 to-transparent p-3 pt-6">
                                    <span className="text-[11px] text-orange-200 font-bold flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Kiunduani, Makueni
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                <div>
                                    <h3 className="text-lg font-black text-foreground tracking-tight">Citrus & Orange Groves</h3>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        High nectar flowers visited continuously to guarantee uniform fruit circumference and high sugar Brix.
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                                    <span className="font-bold text-orange-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> High Brix & Packout
                                    </span>
                                    <span className="text-[11px] text-muted-foreground font-semibold">Farmer Ngumbau</span>
                                </div>
                            </div>
                        </div>

                        {/* Crop 3: Maize */}
                        <div className="bg-card rounded-[2rem] overflow-hidden border border-border/70 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group">
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src="/images/pollination/maize-field-panorama-mountain.png"
                                    alt="Maize Field Tasseling"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-emerald-600/90 text-white font-bold border-none text-[11px] shadow-sm">
                                        15 Acres Total
                                    </Badge>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/40 to-transparent p-3 pt-6">
                                    <span className="text-[11px] text-emerald-200 font-bold flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Mbuinzau, Makueni
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                <div>
                                    <h3 className="text-lg font-black text-foreground tracking-tight">Maize Anthesis & Tasseling</h3>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        Active pollen gathering during tasseling induces complete silk coverage and 100% cob tip kernel filling.
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> 100% Tip Filling
                                    </span>
                                    <span className="text-[11px] text-muted-foreground font-semibold">Farmer Mbilu</span>
                                </div>
                            </div>
                        </div>

                        {/* Crop 4: Mixed Fruit & Ecosystem Restoration */}
                        <div className="bg-card rounded-[2rem] overflow-hidden border border-border/70 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group">
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src="/images/pollination/mango-orange-farm-wide.jpg"
                                    alt="Mixed Orchard & Ecological Restoration"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-teal-600/90 text-white font-bold border-none text-[11px] shadow-sm">
                                        29 Acres Total
                                    </Badge>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/40 to-transparent p-3 pt-6">
                                    <span className="text-[11px] text-teal-200 font-bold flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Kavita & Mbuinzau
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                <div>
                                    <h3 className="text-lg font-black text-foreground tracking-tight">Restoration & Vegetables</h3>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        Drip-irrigated horticulture and agroforestry corridors supporting native biodiversity and year-round forage.
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                                    <span className="font-bold text-teal-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Zero Crop Waste
                                    </span>
                                    <span className="text-[11px] text-muted-foreground font-semibold">Farmer Gabriel & Redempta</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verified Farmer Quotes */}
                    <div className="max-w-6xl mx-auto mb-16">
                        <div className="text-center mb-10">
                            <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                What Our Partner Farmers Say
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium mt-1">
                                Verified testimonials from smallholder and commercial growers across our 105 acres and counting network.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Quote 1: Clement */}
                            <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm flex flex-col justify-between relative group hover:border-[#1B9157]/40 transition-all">
                                <Quote className="w-8 h-8 text-[#1B9157]/20 absolute top-5 right-5" />
                                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed italic mb-6">
                                    "Being the first receiver of BeeYield's IoT disease and pollination devices in Kibarani has helped me truly understand bees. Seeing real-time colony health allowed us to time hive placement with bloom. Our mangoes, oranges, and citrus have never had such dense fruit set."
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-700 font-black text-sm shrink-0">
                                        FC
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-foreground">Farmer Clement</h4>
                                        <p className="text-[11px] text-muted-foreground">Kibarani • 25 Acres (Mangoes & Citrus)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quote 2: Christopher */}
                            <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm flex flex-col justify-between relative group hover:border-[#1B9157]/40 transition-all">
                                <Quote className="w-8 h-8 text-[#1B9157]/20 absolute top-5 right-5" />
                                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed italic mb-6">
                                    "BeeYield has been life changing for our farm. When varroa mites threatened our colonies, ApiSense tech identified the hive acoustic anomalies in time before collapse occurred. That timely intervention saved our hives and protected all 18 acres of blooming mangoes."
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                                    <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-700 font-black text-sm shrink-0">
                                        CK
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-foreground">Farmer Christopher</h4>
                                        <p className="text-[11px] text-muted-foreground">Kiunduani • 18 Acres (Export Mangoes)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quote 3: Gabriel Kavita */}
                            <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm flex flex-col justify-between relative group hover:border-[#1B9157]/40 transition-all">
                                <Quote className="w-8 h-8 text-[#1B9157]/20 absolute top-5 right-5" />
                                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed italic mb-6">
                                    "Bees are very dear to my heart. Seeing them return and thrive across our 14 acres in Kavita has brought genuine ecological restoration to our land. Partnering with BeeYield has made me so happy—our soil is reviving, fruit set is up, and nature is flourishing."
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                                    <div className="w-10 h-10 rounded-full bg-teal-500/15 border border-teal-400/30 flex items-center justify-center text-teal-700 font-black text-sm shrink-0">
                                        GK
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-foreground">Farmer Gabriel Kavita</h4>
                                        <p className="text-[11px] text-muted-foreground">Kavita • 14 Acres (Restoration & Fruit)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section CTAs */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-2xl mx-auto">
                        <Button size="lg" className="w-full sm:w-auto max-w-full bg-[#1B9157] hover:bg-[#157746] text-white font-black rounded-2xl px-5 sm:px-8 h-auto min-h-12 sm:h-14 py-3 shadow-lg text-xs sm:text-sm whitespace-normal text-center" asChild>
                            <Link to="/media" className="flex items-center justify-center gap-2">
                                <span>View All 105 Acres Photo Gallery & Media</span>
                                <ArrowRight className="w-4 h-4 shrink-0" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="w-full sm:w-auto max-w-full border-2 border-neutral-300 text-neutral-900 hover:bg-neutral-50 font-black rounded-2xl px-5 sm:px-8 h-auto min-h-12 sm:h-14 py-3 text-xs sm:text-sm whitespace-normal text-center" asChild>
                            <Link to="/contact">Request Pollination Assessment</Link>
                        </Button>
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
                                    On average, our partners have seen a <strong className="font-bold text-foreground">9–18% increase in crop yield</strong>. More importantly, we provide <strong className="font-bold text-foreground">300% more colony data</strong>, giving you verifiable proof of pollination activity. This leads to higher quality fruit, better seed set, and more consistent harvests across your entire field. Results may vary depending on crop type, climate, and conditions.
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
                                    "text": "Results vary by crop and conditions. Partner farms observe a 9–18% increase in crop yield. We also provide verifiable field and hive data so you can quantify pollination activity instead of relying on estimates."
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
                    <div className="flex flex-wrap justify-center gap-6 w-full px-4">
                        <Link to="/contact" className="w-full sm:w-auto">
                            <Button size="default" className="w-full sm:w-auto max-w-full bg-green-700 text-[#1A1A1A] hover:bg-green-800 text-base sm:text-xl font-black h-auto min-h-14 sm:h-16 py-4 px-6 sm:px-8 rounded-[2rem] shadow-2xl whitespace-normal text-center">
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
