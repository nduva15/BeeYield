import { useState, useEffect } from "react";
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
  Home,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Camera
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
    const [memberPhotoTab, setMemberPhotoTab] = useState<"executive" | "field">("executive");
    const [activeStoryPhotoIdx, setActiveStoryPhotoIdx] = useState(0);

    const originPhotos = [
        {
            src: "/images/story/hives/acacia-canopy-traditional-hives.jpg",
            title: "Ancestral Acacia Canopy Apiary",
            subtitle: "Mature acacia tree with traditional log hives in canopy",
            badge: "Kibwezi Roots • Dec 2020",
            location: "Kibwezi, Makueni County",
            description: "Where our journey started: 4 traditional log hives received from our father, suspended high in the branches of savannah acacia trees safe from ground pests and sun."
        },
        {
            src: "/images/team/timothy-beekeeper-suit.jpg",
            title: "Field Operations in Official Suit",
            subtitle: "Timothy conducting evening apiary inspections",
            badge: "Hands-On Leadership",
            location: "Kibwezi Apiary Site",
            description: "Hands-on beekeeping in the Kibwezi bush. Timothy wearing the official BeeYield suit at dusk, assessing brood comb health and hive weight balance."
        },
        {
            src: "/images/team/beekeeper-field-inspection.jpg",
            title: "Twilight Colony Assessment",
            subtitle: "Listening to colony acoustics & entrance traffic",
            badge: "Colony Health",
            location: "Makueni Demonstration Yard",
            description: "Field beekeepers observing flight entrance activity at sunset when African honeybees settle for the night, checking queen vitality and cluster strength."
        },
        {
            src: "/images/story/hives/savannah-hanging-hive.jpg",
            title: "Suspended Savannah Log Hive",
            subtitle: "Traditional Kamba hive hanging by wire",
            badge: "Heritage Craft",
            location: "Savannah Shrubland",
            description: "Suspended high in acacia branches to protect the colony against termites, army ants, and honey badgers — an ancient tradition enhanced with modern telemetry."
        },
        {
            src: "/images/story/hives/acacia-tree-log-hive.jpg",
            title: "Acacia Tree Fork Nesting",
            subtitle: "Hand-carved cedar trunk hive",
            badge: "Natural Insulation",
            location: "Kibwezi Bushland",
            description: "Thick hand-carved wood provides natural thermal regulation during 35°C+ daytime heat, creating ideal brood conditions for wild African bees."
        },
        {
            src: "/images/story/hives/apiary-langstroth-row.jpg",
            title: "Modern Langstroth Apiary",
            subtitle: "Scaled from 4 to 184+ colonies",
            badge: "Modern Scale",
            location: "Central Apiary Hub",
            description: "Today's apiary with yellow Langstroth hives on anti-termite stands operating alongside 22 smart IoT monitoring units and digital load scales."
        }
    ];

    const fieldOperationHighlights = [
        {
            image: "/images/team/timothy-beekeeper-suit.jpg",
            title: "Frontline Apiary Stewardship",
            role: "Timothy Nduva (CEO & Founder)",
            badge: "Field Leadership",
            desc: "Leadership rooted in the dirt and the smoke. Timothy regularly leads evening hive inspections, testing new sensors directly in active colonies."
        },
        {
            image: "/images/story/hives/acacia-canopy-traditional-hives.jpg",
            title: "The Kibwezi Acacia Canopy",
            role: "Family Apiary Origins",
            badge: "Ancestral Heritage",
            desc: "The sacred acacia trees where BeeYield's first four hives were hung in December 2020. These mature canopies continue to house thriving colonies today."
        },
        {
            image: "/images/team/beekeeper-field-inspection.jpg",
            title: "Twilight Hive Inspections",
            role: "Beekeeping Specialists",
            badge: "Biological Integrity",
            desc: "African honeybees (Apis mellifera scutellata) are fierce defenders. Evening inspections minimize colony stress while checking comb health."
        },
        {
            image: "/images/story/hives/savannah-hanging-hive.jpg",
            title: "Savannah Wire-Suspended Hives",
            role: "Traditional Engineering",
            badge: "Predator Protection",
            desc: "Suspended by heavy wire to thwart badgers and safari ants, representing centuries of indigenous Kamba apicultural ingenuity."
        },
        {
            image: "/images/story/hives/apiary-langstroth-row.jpg",
            title: "Langstroth Fleet at 184 Hives",
            role: "Modern Scaling",
            badge: "IoT Integration",
            desc: "From 4 inherited hives to a fleet of 184 modern Langstroth hives equipped with solar telemetry, microclimate probes, and precision scales."
        }
    ];

    const founders = [
        {
            name: "Timothy Nduva",
            role: "CEO & Founder",
            department: "Directorate",
            description: "A visionary leader committed to the intersection of traditional apiology and digital precision. Timothy oversees the global strategic direction of the BeeYield ecosystem, spending equal time on software architecture and evening apiary inspections in Kibwezi.",
            image: TIMOTHY_PHOTO,
            fieldImage: "/images/team/timothy-beekeeper-suit.jpg",
            fieldCaption: "Timothy inspecting hives in Kibwezi apiary wearing custom BeeYield protective gear at dusk",
            linkedin: "https://linkedin.com/in/timothynduva",
            email: "info@beeyield.com",
            achievements: ["Vision Lead", "Architecture Head", "Global Strategy", "Field Beekeeper"]
        },
        {
            name: "Carole Nduva",
            role: "Technical Director",
            department: "Operations",
            description: "Master of operational logistics and partner engineering. Carole leads the team in scaling BeeYield's physical and digital infrastructure across international borders.",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
            linkedin: "#",
            email: "info@beeyield.com",
            achievements: ["Ops Scalability", "Partner Systems", "Logistics Core"]
        },
        {
            name: "Agatha Nduva",
            role: "Technical Director",
            department: "Engineering",
            description: "Pioneer in distributed systems and data security. Agatha ensures that every byte of bee telemetry is secured, verified, and processed with high fidelity.",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
            linkedin: "#",
            email: "info@beeyield.com",
            achievements: ["System Integrity", "Data Security", "Protocol Lead"]
        },
    ];

    const specialistRoles = [
        { title: "Beekeepers", icon: Bug, desc: "Field experts maintaining colony health and biological integrity." },
        { title: "Engineers", icon: Cpu, desc: "Building the hardware and low-latency sensors that power our hives." },
        { title: "Data Scientists", icon: Binary, desc: "Extracting actionable insights from over 2,000 environmental and hive data points daily and growing." },
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
                 FIELD OPERATIONS — Frontline Beekeepers & Living Apiary
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-white border-b border-neutral-100 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <Badge className="bg-amber-500/10 text-amber-700 border-none mb-4 px-5 py-2 font-semibold text-[10px] rounded-full uppercase tracking-wider">
                            <Camera className="w-3.5 h-3.5 inline mr-1.5" />
                            Frontline Workforce in Action
                        </Badge>
                        <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
                            Stewardship <span className="text-beeyield-green">in the Field</span>
                        </h2>
                        <p className="text-neutral-500 text-base max-w-2xl mx-auto leading-relaxed">
                            Behind every line of code, IoT telemetry stream, and pollination report is sweat and passion in the Kenyan bush. Meet the reality of our apiary operations.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {fieldOperationHighlights.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className={cn(
                                    "group rounded-[2.5rem] overflow-hidden border border-neutral-200/80 bg-neutral-900 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col justify-between",
                                    idx === 0 ? "md:col-span-2 lg:col-span-1" : ""
                                )}
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-white/90 text-neutral-900 backdrop-blur-md border-none font-bold text-[9px] uppercase tracking-wider px-3 py-1">
                                            {item.badge}
                                        </Badge>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <p className="text-xs font-semibold text-beeyield-green uppercase tracking-wider">{item.role}</p>
                                        <h4 className="text-lg font-bold leading-tight">{item.title}</h4>
                                    </div>
                                </div>
                                <div className="p-6 bg-white flex-1 flex flex-col justify-center">
                                    <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                 OUR STORY — Family Origins & Interactive Photo Archive
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-[#FAFAF8] relative overflow-hidden border-b border-neutral-100">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-center">
                        
                        {/* Interactive Photo Showcase Column */}
                        <div className="lg:col-span-7 space-y-4">
                            <motion.div 
                                key={activeStoryPhotoIdx}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.35 }}
                                className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-neutral-950 border border-neutral-200/80 shadow-xl group"
                            >
                                <img 
                                    src={originPhotos[activeStoryPhotoIdx].src} 
                                    alt={originPhotos[activeStoryPhotoIdx].title} 
                                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent" />
                                
                                <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                                    <Badge className="bg-beeyield-green text-neutral-950 border-none font-bold text-[10px] uppercase tracking-wider px-3.5 py-1.5 shadow-md">
                                        {originPhotos[activeStoryPhotoIdx].badge}
                                    </Badge>
                                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white/90 text-[10px] font-medium flex items-center gap-1.5">
                                        <MapPin className="w-3 h-3 text-beeyield-green" />
                                        {originPhotos[activeStoryPhotoIdx].location}
                                    </div>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                                    <p className="text-xs text-beeyield-green font-bold uppercase tracking-wider">
                                        Photo {activeStoryPhotoIdx + 1} of {originPhotos.length}
                                    </p>
                                    <h4 className="text-2xl font-extrabold tracking-tight">
                                        {originPhotos[activeStoryPhotoIdx].title}
                                    </h4>
                                    <p className="text-xs text-neutral-300 leading-relaxed max-w-xl">
                                        {originPhotos[activeStoryPhotoIdx].description}
                                    </p>
                                </div>

                                {/* Arrow controls */}
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveStoryPhotoIdx((prev) => (prev - 1 + originPhotos.length) % originPhotos.length);
                                        }}
                                        className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                                        aria-label="Previous photo"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveStoryPhotoIdx((prev) => (prev + 1) % originPhotos.length);
                                        }}
                                        className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                                        aria-label="Next photo"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>

                            {/* Thumbnail Selector Strip */}
                            <div className="grid grid-cols-6 gap-2.5">
                                {originPhotos.map((photo, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveStoryPhotoIdx(i)}
                                        className={cn(
                                            "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all",
                                            activeStoryPhotoIdx === i 
                                                ? "border-beeyield-green ring-2 ring-beeyield-green/30 scale-105 shadow-md" 
                                                : "border-neutral-200/80 opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <img src={photo.src} alt={photo.title} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Narrative Column */}
                        <div className="lg:col-span-5 space-y-6">
                            <Badge className="bg-amber-500/10 text-amber-700 border-none px-4 py-1.5 font-semibold text-[10px] uppercase tracking-wider inline-block">
                                The Genesis • Our Full Story
                            </Badge>
                            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight leading-tight">
                                A Pandemic Spark, <br />
                                <span className="text-beeyield-green">A Family Mission</span>
                            </h2>
                            <div className="space-y-4 text-neutral-600 text-sm leading-relaxed">
                                <p>
                                    In <strong className="text-neutral-900">December 2020</strong>, <strong className="text-neutral-900">Timothy Nduva</strong> founded BeeYield with 4 traditional log hives inherited from his father in Kibwezi, Makueni County. What began as a quarter-acre family inheritance became the crucible for a modern agricultural mission, leading to BeeYield officially being founded as an IoT company in <strong className="text-neutral-900">July 2026</strong>.
                                </p>
                                <p>
                                    As Timothy studied Finance & Marketing and later IT at Strathmore University, he saved his salary to fund the apiary. In <strong className="text-neutral-900">2022</strong>, his sisters <strong className="text-neutral-900">Agatha</strong> (Distributed Systems & Security) and <strong className="text-neutral-900">Carole</strong> (Operations & Scalability) joined the journey — uniting three distinct skill sets under one banner.
                                </p>
                                <p>
                                    When pesticide drift threatened local colonies in 2025, Timothy quit his job to protect the bees full-time. The team pivoted to precision pollination, expanding from traditional log hives to <strong className="text-neutral-900">184 modern hives</strong>, deploying <strong className="text-neutral-900">22 IoT stations</strong>, and serving <strong className="text-neutral-900">105 and counting acres</strong> across Kenya.
                                </p>
                            </div>

                            <div className="pt-2 flex flex-wrap gap-3">
                                <div className="px-4 py-2 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                                    <p className="text-lg font-black text-beeyield-green">4 → 184</p>
                                    <p className="text-[10px] uppercase font-bold text-neutral-500">Hive Growth</p>
                                </div>
                                <div className="px-4 py-2 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                                    <p className="text-lg font-black text-neutral-900">22 IoT</p>
                                    <p className="text-[10px] uppercase font-bold text-neutral-500">Live Stations</p>
                                </div>
                                <div className="px-4 py-2 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                                    <p className="text-lg font-black text-amber-600">105+</p>
                                    <p className="text-[10px] uppercase font-bold text-neutral-500">Acres Served</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

             {/* ═══════════════════════════════════════════════════════════════
                 ACHIEVEMENTS — Data Points (Matching Diseases Efficiency Section)
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-[#FAFAF8] text-neutral-900 relative overflow-hidden border-y border-neutral-200/60">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto mb-16">
                        <Badge className="bg-beeyield-green/15 text-emerald-800 border-none mb-6 px-5 py-2 font-semibold text-[10px] rounded-full">
                            Our Impact
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900">Achievements So Far</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {[
                            { number: "184+", label: "Beehives", desc: "Scale Capacity" },
                            { number: "1M+", label: "Bee Colonies", desc: "Population" },
                            { number: "2,500+", label: "Trees", desc: "Restoration" },
                            { number: "105+", label: "Acres", desc: "Pollinated & Counting" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white border border-neutral-200/80 shadow-sm"
                            >
                                <h3 className="text-4xl font-black text-beeyield-green mb-2">{stat.number}</h3>
                                <p className="text-lg font-bold mb-1 text-neutral-900">{stat.label}</p>
                                <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">{stat.desc}</p>
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
                                            "w-full h-full object-cover transition-all duration-700 group-hover:scale-105",
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
                    <Button size="lg" className="h-14 px-12 bg-neutral-900 text-beeyield-green font-bold text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20">
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
                                <div className="md:w-5/12 relative aspect-[4/5] bg-neutral-900 shrink-0 overflow-hidden">
                                    <img 
                                        src={selectedMember.fieldImage && memberPhotoTab === "field" ? selectedMember.fieldImage : selectedMember.image} 
                                        alt={selectedMember.name} 
                                        className={cn(
                                            "w-full h-full object-cover transition-all duration-500",
                                            selectedMember.image === LOGO ? "opacity-10 p-12" : ""
                                        )}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent pointer-events-none" />
                                    
                                    {selectedMember.fieldImage && (
                                        <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                                            {memberPhotoTab === "field" && (
                                                <p className="text-[10px] text-white/90 bg-black/60 backdrop-blur-md p-2 rounded-xl leading-tight font-medium">
                                                    {selectedMember.fieldCaption}
                                                </p>
                                            )}
                                            <div className="flex bg-black/70 backdrop-blur-md p-1 rounded-xl self-start gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setMemberPhotoTab("executive")}
                                                    className={cn(
                                                        "px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all",
                                                        memberPhotoTab === "executive" ? "bg-white text-neutral-950 shadow-sm" : "text-white/70 hover:text-white"
                                                    )}
                                                >
                                                    Executive
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setMemberPhotoTab("field")}
                                                    className={cn(
                                                        "px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all",
                                                        memberPhotoTab === "field" ? "bg-beeyield-green text-neutral-950 shadow-sm" : "text-white/70 hover:text-white"
                                                    )}
                                                >
                                                    In Apiary Suit
                                                </button>
                                            </div>
                                        </div>
                                    )}
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
