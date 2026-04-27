import { useState } from "react";
import { 
  Globe, 
  Award, 
  Users, 
  Code, 
  Briefcase, 
  Mail, 
  Cpu, 
  Droplet, 
  ShieldCheck, 
  Terminal,
  Layers,
  Sparkles,
  X,
  Target,
  ArrowRight,
  Shield,
  Zap,
  BookOpen,
  Hexagon,
  Heart,
  CheckCircle2,
  Activity,
  Star,
  Trophy,
  Leaf,
  Bug,
  Microscope,
  Binary,
  Database,
  Search,
  Fingerprint,
  PlayCircle,
  Video,
  Home
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { cn } from "@/lib/utils";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import SEO from "@/components/SEO";

import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";
import LOGO from "@/assets/Logo.png";

const Team = () => {
    const [selectedMember, setSelectedMember] = useState<any | null>(null);

    const founders = [
        {
            name: "Timothy Nduva",
            role: "CEO & Founder",
            department: "Directorate",
            description: "A visionary leader committed to the intersection of traditional apiology and digital precision. Timothy oversees the global strategic direction of the BeeYield ecosystem.",
            image: TIMOTHY_PHOTO,
            linkedin: "https://linkedin.com/in/timothynduva",
            email: "info@beeyield.com",
            achievements: ["Vision Lead", "Architecture Head", "Global Strategy"]
        },
        {
            name: "Carole Nduva",
            role: "Technical Director",
            department: "Operations",
            description: "Master of operational logistics and partner engineering. Carole leads the team in scaling BeeYield's physical and digital infrastructure across international borders.",
            image: LOGO,
            linkedin: "#",
            email: "info@beeyield.com",
            achievements: ["Ops Scalability", "Partner Systems", "Logistics Core"]
        },
        {
            name: "Agatha Nduva",
            role: "Technical Director",
            department: "Engineering",
            description: "Pioneer in distributed systems and data security. Agatha ensures that every byte of bee telemetry is secured, verified, and processed with high fidelity.",
            image: LOGO,
            linkedin: "#",
            email: "info@beeyield.com",
            achievements: ["System Integrity", "Data Security", "Protocol Lead"]
        },
    ];

    const specialistRoles = [
        { title: "Beekeepers", icon: Bug, desc: "Field experts maintaining colony health and biological integrity." },
        { title: "Engineers", icon: Cpu, desc: "Building the hardware and low-latency sensors that power our hives." },
        { title: "Data Scientists", icon: Binary, desc: "Extracting actionable insights from millions of environmental data points." },
        { title: "Programmers", icon: Code, desc: "Architecting the distributed OS and AI models that drive pollination." },
        { title: "Researchers", icon: Microscope, desc: "Advancing the frontiers of apicultural science and biodiversity." },
        { title: "Agriculturalists", icon: Leaf, desc: "Bridging the gap between bee health and industrial crop yields." },
    ];

    return (
        <BeeYieldPageShell className="bg-background text-foreground">
            <SEO 
                title="Meet the Team | BeeYield"
                description="Our team of specialists committed to applying diverse expertise in agriculture, data science, and engineering to help secure the future of the world's food supply."
                url="/team"
            />
            {/* ═══════════════════════════════════════════════════════════════
                 HERO SECTION — Exact Match to Diseases Hero
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-neutral-100">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-beeyield-green/5 to-transparent pointer-events-none" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
                        <motion.img
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            src={LOGO}
                            alt="BeeYield Logo"
                            className="h-24 md:h-36 w-auto mb-12 drop-shadow-2xl"
                        />
                        <Badge className="mb-6 bg-beeyield-green/10 text-beeyield-green border-beeyield-green/20 px-5 py-2 font-semibold text-[10px] rounded-full backdrop-blur-sm">
                            The BeeYield Workforce
                        </Badge>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900"
                        >
                            Meet the <br />
                            <span className="text-beeyield-green">BeeYield Team</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto"
                        >
                            Decades of experience in agriculture, technology, and entrepreneurship.
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
                                onClick={() => document.getElementById('workforce')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Technical Specialists <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                 CORE MISSION — Match Diseases "Intelligent Protection" layout
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-white relative overflow-hidden border-b border-neutral-100">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-stretch">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider mb-2 inline-block">
                                Organizational Purpose
                            </Badge>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
                                Who is <br />
                                <span className="text-beeyield-green">BeeYield?</span>
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed pt-2">
                                <strong className="text-neutral-900">BeeYield’s</strong> three founders guide a team of beekeepers, engineers, data scientists, programmers, researchers, agriculturalists, and more who are committed to applying their diverse expertise to help secure the future of the world's food supply.
                            </p>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                By bringing the power of data science to bear on the critical role played by pollination in agriculture, BeeYield is working tirelessly to ensure the well-being of all pollinators.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6 bg-neutral-50 p-10 rounded-[2.5rem] border border-neutral-100 h-full flex flex-col justify-center group pointer-events-none"
                        >
                            <img src={LOGO} alt="BeeYield Mission" className="h-40 w-auto opacity-10 grayscale mx-auto mb-4 group-hover:grayscale-0 transition-all" />
                            <div className="bg-white p-5 rounded-xl border border-neutral-100 shadow-sm">
                                <p className="font-bold text-neutral-900 leading-relaxed text-center">
                                    Guided by decades of cross-industrial experience.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                 SPECIALIST GRID — Match Diseases "How it Works" layout
            ═══════════════════════════════════════════════════════════════ */}
            <section id="workforce" className="py-32 bg-neutral-50/50 border-y border-neutral-100 relative">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-24">
                        <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                            The Workforce
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4">Technical Specialists</h2>
                        <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {specialistRoles.map((role, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-10 rounded-[2.5rem] border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-500 group"
                            >
                                <div className="mb-8 inline-flex items-center justify-center p-6 bg-neutral-50 rounded-2xl text-beeyield-green">
                                    <role.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight">{role.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                                    {role.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                 OUR STORY — Family Origins (Matching Diseases "Partnership Narrative")
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-white relative overflow-hidden border-b border-neutral-100">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-center">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm"
                        >
                            <img src={"https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80"} alt="Family Origins" className="w-full h-full object-cover grayscale opacity-20" />
                            <div className="absolute inset-0 flex items-center justify-center p-12 text-center text-neutral-900">
                                <div className="space-y-4">
                                    <div className="h-16 w-16 bg-beeyield-green/10 rounded-full flex items-center justify-center mx-auto text-beeyield-green">
                                        <Home className="h-8 w-8" />
                                    </div>
                                    <h4 className="text-xl font-bold">Born in Kibwezi</h4>
                                    <p className="text-sm font-medium opacity-70">Makueni County, Kenya • 2020</p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="space-y-6">
                            <Badge className="bg-amber-500/10 text-amber-700 border-none px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider mb-2 inline-block">
                                The Genesis
                            </Badge>
                            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight leading-tight">
                                A Pandemic Spark, <br />
                                <span className="text-beeyield-green">A Family Mission</span>
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed pt-2">
                                In 2020, as the world slowed down, <strong className="text-neutral-900">Timothy Nduva</strong> saw an opportunity for innovation in rural Kenya. Together with his sisters <strong className="text-neutral-900">Agatha</strong> and <strong className="text-neutral-900">Carole</strong>, they transformed a small family apiary into a platform for agricultural impact.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

             {/* ═══════════════════════════════════════════════════════════════
                 ACHIEVEMENTS — Data Points (Matching Diseases Efficiency Section)
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto mb-16">
                        <Badge className="bg-white/10 text-white border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                            Our Impact
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Achievements So Far</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {[
                            { number: "184+", label: "Beehives", desc: "Scale Capacity" },
                            { number: "1M+", label: "Bee Colonies", desc: "Population" },
                            { number: "2,500+", label: "Trees", desc: "Restoration" },
                            { number: "25+", label: "Acres", desc: "Pollinated" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
                            >
                                <h3 className="text-4xl font-black text-beeyield-green mb-2">{stat.number}</h3>
                                <p className="text-lg font-bold mb-1">{stat.label}</p>
                                <p className="text-xs text-white/50 uppercase tracking-widest font-bold">{stat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                 DIRECTORATE — Matching Diseases Threat Grid style
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-32 bg-white relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-24">
                        <Badge className="bg-amber-500/10 text-amber-700 border-none px-5 py-2 font-semibold text-[10px] rounded-full">
                            The Directorate
                        </Badge>
                        <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 tracking-tight mt-6">Our Leadership</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
                        {founders.map((member, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setSelectedMember(member)}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-neutral-50 border border-neutral-100 shadow-sm mb-8 transition-all group-hover:shadow-xl">
                                    <img 
                                        src={member.image} 
                                        alt={member.name} 
                                        className={cn(
                                            "w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0",
                                            member.image === LOGO ? "opacity-10 p-12" : ""
                                        )}
                                    />
                                    <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-transparent transition-all" />
                                    <div className="absolute bottom-8 left-8 right-8">
                                        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
                                            <h4 className="text-xl font-bold text-neutral-900 mb-1">{member.name}</h4>
                                            <p className="text-[10px] font-bold text-beeyield-green uppercase tracking-widest">{member.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* VISION IN MOTION */}
            <section className="py-32 bg-white relative border-t border-neutral-100">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <Badge className="bg-neutral-100 text-neutral-500 border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                            Vision In Motion
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">Field Operations</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="bg-neutral-50 p-8 rounded-[2rem] border border-neutral-100 shadow-sm">
                            <YouTubeEmbed title="About BeeYield" wrapperClassName="aspect-video rounded-2xl overflow-hidden shadow-lg mb-6" />
                            <h3 className="text-xl font-bold text-neutral-900 mb-2">Our Vision</h3>
                            <p className="text-sm text-neutral-500 font-medium italic border-l-4 border-neutral-100 pl-6 leading-relaxed">
                                Ecosystem Architecture.
                            </p>
                        </div>
                        <div className="bg-neutral-50 p-8 rounded-[2rem] border border-neutral-100 shadow-sm">
                            <YouTubeEmbed title="BeeYield Video" wrapperClassName="aspect-video rounded-2xl overflow-hidden shadow-lg mb-6" />
                            <h3 className="text-xl font-bold text-neutral-900 mb-2">Field Reality</h3>
                            <p className="text-sm text-neutral-500 font-medium italic border-l-4 border-neutral-100 pl-6 leading-relaxed">
                                Deployments across the region.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="bg-neutral-50 py-24 border-t border-neutral-200 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-8 tracking-tight">Join the Mission</h2>
                    <Button size="lg" className="h-14 px-12 bg-neutral-900 text-white rounded-2xl font-bold shadow-xl hover:bg-neutral-800 transition-all">
                        Contact the Directorate <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </section>

             {/* Member Modal */}
             <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
                <DialogContent className="max-w-[800px] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl">
                    <AnimatePresence>
                        {selectedMember && (
                            <div className="flex flex-col md:flex-row bg-white">
                                <div className="md:w-5/12 relative aspect-[4/5] bg-neutral-100 shrink-0">
                                    <img 
                                        src={selectedMember.image} 
                                        alt={selectedMember.name} 
                                        className={cn(
                                            "w-full h-full object-cover",
                                            selectedMember.image === LOGO ? "opacity-10 p-12" : ""
                                        )}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 to-transparent" />
                                </div>

                                <div className="md:w-7/12 p-10 md:p-16 flex flex-col justify-center text-left">
                                    <div className="mb-6">
                                        <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-4 px-4 py-1 font-semibold text-[10px] tracking-wider uppercase rounded-full">
                                            {selectedMember.department}
                                        </Badge>
                                        <h3 className="text-3xl font-bold text-neutral-900 tracking-tight leading-none">{selectedMember.name}</h3>
                                        <h4 className="text-lg font-bold text-beeyield-green mt-2">{selectedMember.role}</h4>
                                    </div>

                                    <p className="text-neutral-500 font-medium leading-relaxed mb-8 italic border-l-4 border-neutral-100 pl-6">
                                        "{selectedMember.description}"
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-10">
                                        {selectedMember.achievements.map((ach: string, i: number) => (
                                            <span key={i} className="px-5 py-2 bg-neutral-50 border border-neutral-100 rounded-full text-[10px] font-bold text-neutral-600 uppercase tracking-wider">{ach}</span>
                                        ))}
                                    </div>

                                    <div className="flex gap-4">
                                        <Button asChild className="h-14 px-8 rounded-2xl bg-neutral-900 text-white font-bold shadow-xl">
                                            <a href={selectedMember.linkedin}>Connect</a>
                                        </Button>
                                        <Button asChild variant="outline" className="h-14 w-14 p-0 rounded-2xl border-neutral-100">
                                            <a href={`mailto:${selectedMember.email}`}><Mail className="w-5 h-5" /></a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </BeeYieldPageShell>
    );
};

export default Team;
