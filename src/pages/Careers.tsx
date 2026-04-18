import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, LockIcon, Leaf, Target, Users, Hexagon, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import SEO from "@/components/SEO";

// Removed Supabase related fetches and form states for applications.

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
        <BeeYieldPageShell className="min-h-screen bg-background text-foreground tracking-tight">
            <SEO 
                title="Careers | BeeYield"
                description="Explore career opportunities at BeeYield. Join our mission to modernize beekeeping, secure global biodiversity, and create verifiable pollination systems."
                url="/careers"
            />
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-gradient-to-br from-beeyield-green/5 via-background to-background overflow-hidden border-b border-neutral-100">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
                        <Badge className="mb-6 bg-beeyield-green/10 text-beeyield-green border-none px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider">
                            BeeYield Directorate
                        </Badge>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tighter text-neutral-900 leading-none">
                            Engineer The <br />
                            <span className="text-beeyield-green">Ecosystem</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto font-medium">
                            We are building the infrastructural layer of global apiculture. 
                            Join us in advancing verifiable pollination, ecosystem restoration, and sustainable honey production.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button 
                                size="lg" 
                                className="h-14 px-10 bg-neutral-900 text-beeyield-green font-bold text-sm rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20"
                                onClick={() => document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                View Open Roles
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Subtle decorative elements */}
                <div className="absolute top-0 right-0 w-1/4 h-full bg-beeyield-green/[0.02] -skew-x-12 translate-x-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1/4 h-full border-t border-beeyield-green/5 bg-gradient-to-t from-beeyield-green/[0.02] to-transparent pointer-events-none" />
            </section>

            {/* Ethos Grid Section */}
            <section className="py-24 lg:py-32 bg-neutral-50 relative border-b border-neutral-100">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-20 max-w-2xl mx-auto">
                        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4 text-center">Operating Principles</h2>
                        <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
                        <p className="text-muted-foreground font-medium text-lg text-center">
                            We don't just build software. We execute on rural hardware, biological constraints, and planetary-scale ambitions.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {values.map((value, index) => (
                            <motion.div 
                                key={index} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-10 rounded-[2rem] border border-neutral-100 shadow-soft hover:shadow-glow hover:border-beeyield-green/20 transition-all duration-500 group"
                            >
                                <div className="mb-8 inline-flex items-center justify-center p-5 bg-neutral-50 rounded-2xl group-hover:bg-beeyield-green group-hover:text-white text-beeyield-green transition-colors shadow-sm">
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

            {/* Current Openings Section */}
            <section id="open-roles" className="py-32 lg:py-48 bg-white relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-beeyield-green/[0.01] -skew-x-12 translate-x-32 pointer-events-none" />
                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    <div className="text-center mb-16">
                        <Badge className="bg-neutral-100 text-neutral-500 border-none mb-6 px-5 py-2 font-semibold text-[11px] rounded-full uppercase tracking-wider">
                            Active Recruitment
                        </Badge>
                        <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight mb-6">Open Positions</h2>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-[2.5rem] p-12 md:p-20 text-center shadow-inner relative overflow-hidden">
                        {/* Faint Background Logo */}
                        <div className="absolute -bottom-16 -right-16 text-neutral-200 opacity-50 pointer-events-none">
                            <Sprout className="w-64 h-64" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
                            <div className="h-20 w-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center text-beeyield-green border border-neutral-100 mb-8">
                                <Users className="h-8 w-8" />
                            </div>
                            <h3 className="text-3xl font-bold text-neutral-900 tracking-tight mb-6">Staffing Complete</h3>
                            <p className="text-lg text-neutral-500 font-medium leading-relaxed mb-10">
                                Thank you for your interest in BeeYield. At this time, our core functional units are fully staffed and we do not have any open positions available.
                            </p>
                            <div className="p-6 bg-white rounded-3xl border border-neutral-100 shadow-sm w-full">
                                <p className="text-sm text-neutral-600 font-semibold mb-4 text-center">Still want to get on our radar?</p>
                                <p className="text-sm text-neutral-400 mb-6 text-center">
                                    We are always looking to connect with exceptional engineers, entomologists, and agricultural specialists for future endeavors.
                                </p>
                                <Button asChild variant="outline" className="w-full h-14 rounded-2xl font-bold text-sm bg-neutral-50 border-neutral-200 hover:bg-neutral-100 hover:text-beeyield-green text-neutral-700">
                                    <a href="mailto:info@beeyield.com?subject=Future%20Career%20Opportunities">
                                        Send Resume for Future Consideration
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-neutral-900 py-24 relative overflow-hidden text-center border-t border-white/10">
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-8">Learn More About Our Work</h2>
                    <div className="flex justify-center gap-4">
                        <Button asChild size="lg" className="h-14 px-8 rounded-2xl bg-white text-neutral-900 font-bold hover:bg-neutral-100">
                            <Link to="/our-story">Our Story</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-2xl border-white/20 text-white font-bold hover:bg-white/10">
                            <Link to="/team">Meet The Team</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </BeeYieldPageShell>
    );
};

export default Careers;
