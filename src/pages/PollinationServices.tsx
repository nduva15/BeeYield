import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import {
    Check, TrendingUp, Shield, BarChart3, ArrowRight,
    Cpu, Eye, Zap, Target, Leaf, Award, Clock, Users,
    Activity, Database, Radio, Smartphone, ChevronRight, Globe, Home
} from "lucide-react";
import { Link } from "react-router-dom";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import SEO from "@/components/SEO";
import { beePollinationData } from "@/data/beePollinationData";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import LOGO from "@/assets/Logo.png";

const PollinationServices = () => {
    const pollinationCrops = Object.values(beePollinationData);

    const differences = [
        {
            icon: Cpu,
            title: "95% Detection Accuracy",
            description: "Apisense IoT units mounted inside the hive achieve up to 95% accuracy in detecting early-stage signs of stressors.",
            link: "/diseases"
        },
        {
            icon: Activity,
            title: "85% Spread Prediction",
            description: "Through continuous localized monitoring, the system predicts the vector spread of diseases across the apiary.",
            link: "/diseases"
        },
        {
            icon: Radio,
            title: "Non-Invasive IoT Telemetry",
            description: "Specialized, non-invasive IoT sensors continuously analyze the air composition inside the hive.",
            link: "/precision-pollination"
        }
    ];

    return (
        <BeeYieldPageShell className="bg-background">
            <SEO 
                title="Precision Pollination Services | BeeYield"
                description="BeeYield provides world-class precision pollination services and IoT-enabled beekeeping in Kenya."
                url="/pollination-services"
            />
            {/* ═══════════════════════════════════════════════════════════════
                HERO SECTION — Sync with Diseases Hero
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-neutral-100">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-beeyield-green/5 to-transparent pointer-events-none" />
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto flex flex-col items-center">
                        <motion.img
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            src={LOGO}
                            alt="BeeYield Logo"
                            className="h-24 md:h-36 w-auto mb-12 drop-shadow-2xl"
                        />
                        <Badge className="mb-6 bg-beeyield-green/10 text-beeyield-green border-beeyield-green/20 px-5 py-2 font-semibold text-[10px] rounded-full backdrop-blur-sm">
                            Pollination Services
                        </Badge>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900 leading-tight"
                        >
                            Your Partner <br /> in <span className="text-beeyield-green">Pollination</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-muted-foreground mb-12 max-w-2xl font-medium leading-relaxed"
                        >
                            Professional pollination records for every field. We don't just supply bees; we provide proof of hive activity and colony health.
                        </motion.p>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-4"
                        >
                            <Button size="lg" className="h-14 px-10 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20" asChild>
                                <Link to="/contact">Get a Free Consultation</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-10 border-neutral-200 text-neutral-900 font-bold text-xs rounded-2xl hover:bg-neutral-50 transition-all shadow-sm" asChild>
                                <Link to="/pollination-solutions">See How It Works</Link>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Breakdown — Sync with Diseases Efficiency section */}
            <section className="py-24 bg-white border-b border-neutral-100">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            { label: "Acres", value: "25+", desc: "Acres pollinated across East Africa.", icon: Target },
                            { label: "Hives", value: "184", desc: "Managed network of monitored hives.", icon: Home },
                            { label: "Yield Increase", value: "35%", desc: "Average increase in partner crops.", icon: TrendingUp }
                        ].map((stat, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-neutral-50 p-10 rounded-[2.5rem] border border-neutral-100 text-center group hover:bg-white hover:shadow-xl transition-all duration-500"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-6 text-beeyield-green shadow-sm">
                                    <stat.icon size={24} />
                                </div>
                                <p className="text-4xl font-bold text-neutral-900 mb-2">{stat.value}</p>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">{stat.label}</p>
                                <p className="text-sm text-neutral-500 font-medium leading-relaxed">{stat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Video Success Stories — Match media section of Diseases */}
            <section className="py-24 bg-neutral-50/50 border-b border-neutral-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-neutral-900">Success Stories</h2>
                        <p className="text-lg text-muted-foreground font-medium">Hear what our growers have to say about working with BeeYield.</p>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        <div className="bg-white p-4 rounded-[3rem] border border-neutral-100 shadow-sm">
                            <YouTubeEmbed title="Field Success" wrapperClassName="aspect-video rounded-[2rem] overflow-hidden" />
                        </div>
                        <div className="bg-white p-4 rounded-[3rem] border border-neutral-100 shadow-sm">
                            <YouTubeEmbed title="Platform Insight" wrapperClassName="aspect-video rounded-[2rem] overflow-hidden" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features — Match Diseases grid */}
            <section className="py-24 bg-white border-b border-neutral-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-20">
                        <Badge className="bg-beeyield-green/10 text-beeyield-green border-none px-4 py-1.5 font-bold text-[10px] rounded-full mb-4">Direct Records</Badge>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900">Three Ways to Track</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            { title: "In-Hive Sensors", desc: "Reliable sensors inside every hive monitor colony strength 24/7.", icon: Cpu, link: "/precision-pollination" },
                            { title: "Field Activity", desc: "Measure actual bee activity across your crops in real-time.", icon: Eye, link: "/in-land-pollination" },
                            { title: "Apiary Health", desc: "Early threat detection to keep hives strong.", icon: Shield, link: "/diseases" }
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-neutral-50 p-10 rounded-[2.5rem] border border-neutral-100 group hover:shadow-xl transition-all duration-500"
                            >
                                <div className="mb-8 inline-flex items-center justify-center p-6 bg-white rounded-2xl text-beeyield-green shadow-sm group-hover:scale-110 transition-transform">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight leading-none">{item.title}</h3>
                                <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-8">{item.desc}</p>
                                <Link to={item.link} className="inline-flex items-center text-beeyield-green font-bold text-xs group/link">
                                    Learn More <ArrowRight size={14} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Table — Keeping the useful logic but matching style */}
            <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Tradition vs. Innovation</h2>
                        <p className="text-neutral-400 mt-4 font-medium">Why data-driven pollination is the only way forward.</p>
                    </div>
                    <div className="max-w-4xl mx-auto overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-sm">
                        <table className="w-full text-left">
                            <thead className="border-b border-white/10 bg-white/5">
                                <tr>
                                    <th className="p-6 text-sm font-bold text-white/50 uppercase tracking-widest">Feature</th>
                                    <th className="p-6 text-sm font-bold text-white/50 uppercase tracking-widest">Traditional</th>
                                    <th className="p-6 text-sm font-bold text-beeyield-green uppercase tracking-widest">BeeYield</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {[
                                    { f: "Monitoring", t: "Weekly Checks", b: "24/7 IoT Tracking" },
                                    { f: "Colony Data", t: "Guesswork", b: "Live Telemetry" },
                                    { f: "Yield Impact", t: "Variable", b: "Up to 35% Increase" }
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="p-6 font-bold">{row.f}</td>
                                        <td className="p-6 text-neutral-400">{row.t}</td>
                                        <td className="p-6 font-bold text-beeyield-green">{row.b}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Crops We Pollinate — Match Diseases Grid */}
            <section className="py-24 bg-white border-b border-neutral-100">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 space-y-3">
                        <Badge className="bg-beeyield-green/10 text-beeyield-green border-none px-4 py-1">Our Expertise</Badge>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900">Crops We Pollinate</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
                        {pollinationCrops.map((crop, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -8 }}
                                className="group relative overflow-hidden rounded-[2.5rem] aspect-[4/5] shadow-sm border border-neutral-200/60"
                            >
                                <img src={crop.image} alt={crop.cropName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <p className="text-white font-bold leading-tight tracking-tight text-lg">{crop.cropName}</p>
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mt-1">{crop.beeDependence.split('(')[0].trim()}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-neutral-50/50">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-12">Common Questions</h2>
                        <Accordion type="single" collapsible className="space-y-4">
                            {[
                                { q: "How does precision pollination differ?", a: "Unlike traditional methods that rely on proximity, we use in-hive sensors to monitor activity and health in real-time." },
                                { q: "What increase can farmers expect?", a: "Partners see up to a 35% increase in yields through data-driven colony management." }
                            ].map((faq, i) => (
                                <AccordionItem key={i} value={`faq-${i}`} className="bg-white border border-neutral-100 rounded-3xl px-8">
                                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-6">{faq.q}</AccordionTrigger>
                                    <AccordionContent className="text-neutral-500 font-medium pb-6 leading-relaxed">{faq.a}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </section>

            {/* Final CTA — Match Diseases CTA */}
            <section className="bg-neutral-900 py-32 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-beeyield-green/[0.02] to-transparent pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 tracking-tight leading-tight">
                            Ready for Real <br /><span className="text-beeyield-green">Results?</span>
                        </h2>
                        <div className="flex flex-wrap justify-center gap-6">
                            <Button size="lg" className="h-14 px-12 bg-white text-neutral-900 font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-xl shadow-white/10" asChild>
                                <Link to="/contact">Get Your Custom Plan</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </BeeYieldPageShell>
    );
};

export default PollinationServices;
