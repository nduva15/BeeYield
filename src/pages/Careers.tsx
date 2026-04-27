import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, LockIcon, Leaf, Target, Users, Hexagon, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import SEO from "@/components/SEO";
import BEEYIELD_LOGO from "@/assets/Logo.png";

const Careers = () => {
    const values = [
        {
            title: "Planetary Mission",
            description: "We are solving the foundational problem of agriculture: verifiable pollination. It's work that matters.",
            icon: <Leaf className="h-6 w-6 text-beeyield-green" />
        },
        {
            title: "Autonomy & Trust",
            description: "We hire capable people and trust them to execute. No micromanagement, just clear strategic alignment.",
            icon: <LockIcon className="h-6 w-6 text-beeyield-green" />
        },
        {
            title: "Radical Impact",
            description: "Every commit tracks honey, saves bees, or helps farmers plant trees. Your code directly impacts nature.",
            icon: <Target className="h-6 w-6 text-beeyield-green" />
        },
        {
            title: "Ecosystem First",
            description: "Our 50/50 harvest promise isn't a marketing gimmick—it is the core logical constraint of our business model.",
            icon: <Hexagon className="h-6 w-6 text-beeyield-green" />
        }
    ];

    return (
        <BeeYieldPageShell className="bg-background text-foreground">
            <SEO 
                title="Careers | BeeYield"
                description="Explore career opportunities at BeeYield. Join our mission to modernize beekeeping, secure global biodiversity, and create verifiable pollination systems."
                url="/careers"
            />
            {/* ═══════════════════════════════════════════════════════════════
                 HERO SECTION — Exact Match to Diseases Hero
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
                            src={BEEYIELD_LOGO}
                            alt="BeeYield Logo"
                            className="h-24 md:h-36 w-auto mb-12 drop-shadow-2xl"
                        />
                        <Badge className="mb-6 bg-beeyield-green/10 text-beeyield-green border-beeyield-green/20 px-5 py-2 font-semibold text-[10px] rounded-full backdrop-blur-sm">
                            BeeYield Directorate
                        </Badge>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900 leading-tight"
                        >
                            Engineer The <br />
                            <span className="text-beeyield-green">Ecosystem</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl font-medium"
                        >
                            We are building the infrastructural layer of global apiculture. 
                            Join us in advancing verifiable pollination systems.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Button 
                                size="lg" 
                                className="h-14 px-10 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20"
                                onClick={() => document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                View Open Roles <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Ethos Grid — Match Diseases "How it Works" layout */}
            <section className="py-24 bg-neutral-50/50 relative border-b border-neutral-100">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-24">
                        <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                            Principles
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4">Operating Principles</h2>
                        <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {values.map((value, index) => (
                            <motion.div 
                                key={index} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-10 rounded-[2.5rem] border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-500 group text-center"
                            >
                                <div className="mb-8 inline-flex items-center justify-center p-6 bg-neutral-50 rounded-2xl text-beeyield-green group-hover:scale-110 transition-transform">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight">{value.title}</h3>
                                <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Current Openings Section — Match Diseases Narrative block style */}
            <section id="open-roles" className="py-32 bg-white relative">
                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    <div className="bg-neutral-50 p-12 md:p-20 rounded-[3rem] border border-neutral-100 text-center group">
                        <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-beeyield-green border border-neutral-100 mx-auto mb-8 group-hover:scale-110 transition-transform">
                            <Users className="h-7 w-7" />
                        </div>
                        <h3 className="text-3xl font-bold text-neutral-900 tracking-tight mb-6 uppercase tracking-wider">Recruitment Complete</h3>
                        <p className="text-lg text-neutral-500 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
                            Thank you for your interest in BeeYield. Our core functional units are now fully staffed.
                        </p>
                        <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm max-w-xl mx-auto">
                            <p className="text-sm text-neutral-600 font-bold mb-4">Future Consideration</p>
                            <p className="text-sm text-neutral-400 mb-8">
                                We are always looking for exceptional engineers and agricultural specialists for future endeavors.
                            </p>
                            <Button asChild variant="outline" className="h-14 w-full rounded-2xl border-neutral-200 text-neutral-900 font-bold text-xs hover:bg-neutral-50 uppercase tracking-widest">
                                <a href="mailto:info@beeyield.com">Submit Resume</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA — Match Diseases CTA Pattern */}
            <section className="bg-neutral-900 py-32 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-10 tracking-tight">Our Mission</h2>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button asChild className="h-14 px-10 rounded-2xl bg-white text-neutral-900 font-bold shadow-xl hover:bg-neutral-100 transition-all">
                                <Link to="/ourstory">Our Story</Link>
                            </Button>
                            <Button asChild variant="outline" className="h-14 px-10 rounded-2xl border-white/20 text-white font-bold hover:bg-white/10 transition-all">
                                <Link to="/team">Meet The Team</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </BeeYieldPageShell>
    );
};

export default Careers;
